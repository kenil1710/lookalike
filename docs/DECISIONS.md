# Decisions

## D1. Official addresses come from the Uniswap default list, not CoinGecko

**Why.** Every CoinGecko call made from GenVM validators on studio-dev returned HTTP 429 (7 of 7, over about 30 minutes, including an unknown coin id). The keyless CoinGecko API is rate-limited per source IP and the validators share theirs. A strict-equality evidence block needs every validator to read the same thing; a source that answers 429 would leave every case PENDING. Adding an API key is not an option (no keys in the contract, ever).

**What replaced it.** `https://tokens.uniswap.org` (Uniswap Labs Default token list). It answered 200 on chain, needs no key, and is keyed by `chainId`. See [PROBE.md](PROBE.md).

**What changed because of it.**

- A coin's official addresses on a chain = every list entry with that `chainId` whose `symbol` is one of the coin's list symbols. Tether is listed as `USDT` and `USDT0`; the others under their own symbol. `USDC.e` is a separate list entry (symbol `USDC.e`) and is NOT counted as official USDC, which matches CoinGecko (bridged USDC.e is a different CoinGecko coin).
- CoinGecko's "platforms key missing = evidence failure; key present but chain absent = official []" becomes: **list has no `tokens` array (or is not JSON, or not 200) = evidence failure; coin present on the list but not on this chain = official `[]`**.
- Added a coverage guard: if the list carries the coin on **none** of the five tracked chains, that is an evidence failure, not "official = []". Without it, a list that dropped a coin would turn the real coin into an EXACT_COPY impersonator everywhere.
- The coin's display name and symbol can no longer be read from CoinGecko, so they are frozen in the constructor with the rest of the coin table: USD Coin/USDC, Tether/USDT, Wrapped Ether/WETH, Dai/DAI, Wrapped Bitcoin/WBTC. Names are the short brand, so "Tether" also matches a fake called just "Tether".
- The meaning of OFFICIAL is "on the Uniswap default token list for this chain under the coin's symbol at the time of the ruling". Every view that returns OFFICIAL says so.

## D2. `ethena-usde` dropped from the coin table

The Uniswap default list carries USDe only on Solana (chainId 501000101), not on any of the five EVM chains. With USDe in the table, the real USDe on Ethereum would have no official entry and the code rules would call it an EXACT_COPY impersonator. The coverage guard (D1) would at least keep such cases PENDING, but a coin that can never be ruled is noise. Five coins remain: `usd-coin`, `tether`, `weth`, `dai`, `wrapped-bitcoin`.

## D3. Optimism explorer host (superseded by D10: the contract no longer reads an explorer)

`optimism.blockscout.com` answers 301 to `explorer.optimism.io` (a Blockscout instance with the same `/api/v2/tokens/` API). GenVM followed the redirect, but the chain table uses `explorer.optimism.io` directly so the evidence does not depend on a redirect.

## D4. "Zero-width" means every invisible character, not five code points

Real Arbitrum fakes use U+200C, U+200E, U+2061 to U+2064 and U+206A to U+206F, not only U+200B to U+200D, U+2060 and U+FEFF. The skeleton and the disguise check strip / detect every Unicode format character (category `Cf`) plus a short list of other invisible code points (soft hyphen, Hangul fillers, variation selectors). Since the skeleton keeps only A-Z and 0-9, anything missed would be dropped from the skeleton anyway; the list matters for rule 4's "the raw text has a disguise" test.

The confusables table covers the required Cyrillic and Greek letters and a few more (`Ј`, `Ү`, `Ӏ`, `ԛ`, `ԝ`, `ԁ`, `һ`, `ӏ`, `ѵ`, Greek `α ι κ ν ρ υ`) plus the Tugrik sign `₮` as T, which fake "USD₮0" tokens use.

A "disguise" (rule 4) is: an invisible character, a confusable letter, or text that NFKC changes (full-width letters and other compatibility forms).

## D5. One more input to the model: "hidden or look-alike characters: yes/no"

Real fakes such as `Bridged USDC` / `USDC.e` padded with invisible characters reach rule 6 (their symbol skeleton is `USDCE`, not `USDC`). Telling the model whether the raw text hides characters is a fact the code already computed; the model does not have to find it in escaped JSON. The raw name and symbol are still passed, JSON-escaped, marked untrusted.

## D6. Rules run on the agreed evidence, after consensus

The evidence block returns only data (name and symbol capped at 128 characters, sha256 of the full raw strings, decimals, type, official addresses). The six rules are pure code that runs on the agreed JSON inside the transaction, so every validator reaches the same rule deterministically. Precedent matching compares the sha256 of the full raw name and symbol, plus decimals.

## D7. Model strict equality

The model block returns one enum (or "" for anything else). Validators call the model themselves and must produce the same enum. "" is treated as "no ruling": the case stays PENDING (or keeps its label on recheck). If validators disagree the transaction does not reach consensus and nothing is written; the case can be ruled again.

## D8. Safelist has a curator

A default token list has a maintainer. `Safelist.add_token` is curator-only (the deployer); the Lookalike register itself has no owner and no privileged method.

## D9. Deployer key

The first instances were deployed from the local test key in `test/.accounts.json`. From the hardening round on, CANONICAL, DEMO and SAFELIST are deployed from the owner's `mywallet` keystore (`node deploy.mjs --network=studio-dev --keystore=mywallet`, password read from the environment, never stored). The Safelist curator is whoever deploys it. Seeds are sent from the local test accounts; the register has no privileged caller, so who sends them does not matter.

## D10. Token metadata comes from the chain (eth_call), not an explorer

Hardening item 1. Each validator POSTs one JSON-RPC batch to a keyless public endpoint for the case's chain (publicnode, frozen in `CHAIN_TABLE`): `eth_getCode`, `name()`, `symbol()`, `decimals()`, and `supportsInterface` for ERC-721 and ERC-1155. An explorer can relabel a token or lag; `name()` is what a wallet shows.

- No code at the address (or an EIP-7702 delegated account) = evidence failure, the case stays PENDING (the old Blockscout 404 behaviour).
- HTTP error, non-JSON, not a 6-element batch, or a node error that is not a revert = evidence failure.
- A call that **reverts** is a fact about the token: no `name()`, `symbol()` or `decimals()` (or `decimals() > 255`), or an NFT interface, makes it `NOT_ERC20`.
- `name()`/`symbol()` are decoded as ABI `string` or legacy `bytes32`. Every rule works on the full decoded string; only the display copy is capped at 128 characters.

## D11. Rule 2b: a token the list carries as a different asset

Measured with D10: Arbitrum's USDC.e says `USD Coin (Arb1)` / `USDC` on chain, and Polygon's says `USD Coin (PoS)` / `USDC`. Judged on those strings alone, the real bridged token would be an EXACT_COPY impersonator. The Uniswap list carries both at that exact chainId and address as `USDC.e`. A scam token cannot put itself on that list, so a token found there under another symbol is decided by code: VARIANT (`LISTED_VARIANT`) if the list's own symbol or name carries the coin, else UNRELATED (`LISTED_OTHER`). It never reaches rules 4, 5 or the model, and a precedent batch skips it (`ON_LIST_AS_OTHER_ASSET`).

Limit found while measuring: the Wormhole token `0x41f7B8b9b897276b7AAE926a9016935280b44E97` on Ethereum ("USDC from Solana" on Blockscout) says exactly `USD Coin` / `USDC` on chain and is not on the list, so the code would rule it EXACT_COPY. It does present itself as the coin on chain; the register cannot see its bridge origin.

## D12. Coverage gate

Hardening item 3. `COVERAGE` (docs/COVERAGE.md) is frozen in the constructor. `flag` and `flag_by_precedent` refuse a pair the list does not cover. A covered pair whose list entry has disappeared is an evidence failure. Rules 4 and 5 also require a non-empty official set. Together: a real coin missing from the list can never be ruled IMPERSONATOR. Base Tether and Base WBTC are refused, which moved seed C6 from a Base "Tether USD" copy to an Arbitrum "USDT" copy.

## D13. List binding and list size

Hardening items 2 and 4. OFFICIAL requires the matched list entry to carry the case's own `chainId` and address (compared as integers and lower-case hex) and one of the coin's list symbols; the entry is stored with the evidence and shown by `get_case`. The list is about 667 KB. A cut-off or unparsable body, a missing `tokens` array, or a `tokens` array with fewer than 100 entries is an evidence failure, never "official = []".

## D14. Text hardening

Hardening item 3.

- The skeleton is built from the full string: NFKC, then NFD so that combining marks and accents can be removed, then invisible characters (every `Cf`, which includes all bidi controls) removed and confusables mapped.
- A disguise also covers combining marks and accented letters.
- "Unknown characters" means non-ASCII that the code cannot read (another script, an emoji, a symbol) or a bidi control, since those reorder what is displayed. Text with unknown characters is never decided by rule 3 (NO_BRAND_MATCH) or rule 5 (EXACT_COPY): it goes to the model.
- Digit look-alikes (`0 1 3 4 5 7 8` read as `O I E A S T B`) are only used to send a name to the model (`U5DC` is not UNRELATED by code). They never decide IMPERSONATOR by code.

## D15. What is stored

Hardening item 4. Nothing the leader alone produced is stored: the evidence is the string every validator rebuilt and compared, and the model's only output is one of three labels. Case history stores labels, bases, times and hashes (sha256 of the evidence, name and symbol), not the token's text. The current evidence keeps a display copy of name and symbol, capped at 128 characters, so views can show them. It is JSON-escaped and was fetched by every validator.
