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

## D3. Optimism explorer host

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

The deploy script can sign with a GenLayer keystore (`--keystore=mywallet`, password from the environment). The submission instances were deployed from the local test key in `test/.accounts.json` (studio-dev is faucet-funded and neither contract gives the deployer any power over the register), because the run was unattended. The same script redeploys from the keystore with the command in the README.
