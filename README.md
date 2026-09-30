# Lookalike

A public, on-chain register of ERC-20 tokens that impersonate a known coin.

## The problem

Address-poisoning scams deploy tokens named `USDC` or `Tether USD` and airdrop them to thousands of wallets, so the fake shows up in a victim's transfer history next to the real thing. Many fakes hide the trick in the text itself: a Cyrillic `С` instead of a Latin `C`, a byte-order mark (U+FEFF) inside `USDC`, full-width letters, or a dozen invisible format characters. On Arbitrum alone, a search for "USDC" returns fakes like these with 15,000 to 48,000 holders each.

Wallets, DEX token lists and other contracts need one question answered before they show or accept a token: *does this token present itself as a coin it is not?* Lookalike answers it on chain, with evidence anyone can re-read, and without anyone owning the answer.

## How it works

Anyone calls `flag(chain, token, coin_id)`. In one strict-equality block, every GenLayer validator reads, itself:

- **from the token's own chain**: one JSON-RPC batch to a keyless public endpoint: `eth_getCode`, `name()`, `symbol()` and `decimals()`. This is the text a wallet shows, not an explorer's label. Nothing else the contract answers (`totalSupply`, `balanceOf`, `supportsInterface`) decides anything, because the token's author writes those answers too. An EIP-7702 delegated account is read like any other token.
- **from the Uniswap default token list** (`tokens.uniswap.org`): the coin's official addresses on that chain, and whether the list carries this exact address at all.

Validators must agree on that evidence byte for byte. A leader cannot hand the others evidence: each validator fetches its own copy and compares. If the chain or the list cannot be read (endpoint down, cut-off body, no contract at the address), the case simply stays `PENDING`. Anyone can retry with `rule(case_id)` until the deadline, and after it anyone can `expire` the case and the token can be flagged again.

Chains: ethereum, base, arbitrum, optimism, polygon. Coins: `usd-coin`, `tether`, `weth`, `dai`, `wrapped-bitcoin`. **Coverage gate:** only the 23 (coin, chain) pairs the official list covers are accepted; Tether and WBTC on Base are refused, because the list has no official entry to compare against ([docs/COVERAGE.md](docs/COVERAGE.md)). The chain table, the coin table, the coverage table, the time windows and the batch limit are frozen in the constructor. There is no owner, no setter, nothing payable and no money in the register.

### What the labels mean

- **IMPERSONATOR**: presents as a listed token of this coin to a wallet user, and is not that listed address. It describes how the token looks (its on-chain name and symbol), not proof of intent.
- **VARIANT**: openly presents as a different product that references the coin. It is not the coin, and not a listed copy.
- **UNRELATED**: does not present itself as the coin.
- **OFFICIAL**: the coin's listed address on this chain.
- **PENDING / EXPIRED**: no agreed evidence yet / none before the deadline.

### The rules

Every name and symbol is first reduced to a **skeleton**, built from the full string:

1. `™ ℠ ® ©` are removed before anything else, so `™` can't expand into `TM`.
2. Look-alike characters are mapped to Latin. The table is every single-character entry of Unicode `confusables.txt` (version 18.0.0) whose target is a letter or digit (1,582 entries: Cyrillic, Greek, Lisu, Cherokee, Armenian, mathematical symbols …), plus a few hand entries such as Greek `Σ ς` → `C`.
3. NFKC normalisation.
4. Accents, combining marks, invisible and bidi characters are removed.
5. Look-alikes are mapped again, the text is upper-cased, and only `A-Z0-9` is kept.

`UЅDС`, `ＵＳＤＣ`, `USDϹ`, `USDꓚ` and `U` + U+FEFF + `SDC` all have the skeleton `USDC`.

After normalising, text that still holds a letter or number outside `A-Z0-9`, or a bidi control, is **unreadable**. Spaces, punctuation, control characters and symbols such as emoji are the only characters dropped silently. Unreadable text is never ruled UNRELATED by code.

Each name and symbol also has a **head**: the part before the first line break, tab, control character or run of 3+ spaces, i.e. what a wallet shows before a hidden tail.

A **listed label** of a coin is the skeleton of the symbol or name of any entry on the Uniswap list, on **any** chain, whose symbol carries the coin as a word: `USDC`, `USDC.e` (`USDCE`), `Bridged USDC`, `USDCoin (PoS)` (`USDCOINPOS`), `USDCoin (Bridged from Ethereum)`, `USDT`, `USDT0`, `Tether USD`, `Wrapped Ether`, `Dai Stablecoin`, `Wrapped BTC` and so on. The coin's own symbol and name (`USD Coin`, `Tether`, …) are labels too. Entries whose symbol names another asset do not count, even when their name mentions the brand: `Tether Gold` / `XAUT` is not a Tether label, and Celo's `Wrapped Bitcoin` / `BTC` does not make `BTC` a WBTC label.

The first rule that fits decides, and the contract stores which one as `basis`:

| # | Basis | Condition | Result |
|---|---|---|---|
| 1 | `NOT_ERC20` | neither `name()` nor `symbol()` returns text. `decimals()` is optional (stored as null when missing). | UNRELATED |
| 2 | `OFFICIAL_LIST` | the list has an entry with **this chainId and this address** under the coin's symbol | OFFICIAL |
| 2b | `LISTED_VARIANT` / `LISTED_OTHER` | the list carries this exact chainId and address as a **different** asset (bridged USDC.e says `USD Coin (Arb1)` / `USDC` on chain, and the list calls it `USDC.e`) | VARIANT if the list's own symbol carries the coin, else UNRELATED |
| 3 | `LISTED_COPY` (or `HOMOGLYPH`) | the skeleton of the token's symbol or name, or of their heads, is exactly a listed label (I and L compare equal, as in Unicode's data), and the token is not a list entry on this chain. Bridge and wrap words do not exempt it. The basis is `HOMOGLYPH` when the raw text held a disguise (look-alike letter, invisible or bidi character, combining mark or accent, full-width form) or unreadable characters. | IMPERSONATOR |
| 4 | `NO_BRAND_MATCH` | neither skeleton contains the coin's symbol or name, not even with digit look-alikes read as letters, and the text is readable | UNRELATED |
| 5 | `MODEL` | everything else: the name carries the brand but copies no listed label | IMPERSONATOR, VARIANT or UNRELATED |

Rule 3 only applies when the coin has an official entry on that chain. If a covered pair's entry has disappeared from the list, the case waits as PENDING instead.

### What the code decides

Rules 1 to 4 are plain code over agreed evidence:
- not a token;
- on the official list (bound to this chainId and address);
- on the list as another asset;
- a copy of any listed label, disguised or not;
- no brand in the name.

Official tokens are checked before any brand rule, so the real USDC can never be called an impersonator of USDC. A fake cannot escape by copying a bridged token's label (`Bridged USDC` / `USDC.e`), by copying Tether's `USDT0`, or by adding "Bridged", "PoS" or ".e" to a copied label.

### What the model decides

Only rule-5 names: ones that carry the brand but copy no listed label. Examples: `Axelar Wrapped USDC` / `axlUSDC`, `Spark USDC Vault` / `sUSDC`, `Hop USDC LP Token` / `HOP-LP-USDC`, a name in another script, or a digit look-alike like `U5DC`.

It is asked one question: *does this token present itself as the coin (IMPERSONATOR), does it openly present as a different product that references the coin (VARIANT), or is it something else (UNRELATED)?* It is given:
- the chain;
- the raw name and symbol as JSON-escaped untrusted data;
- their skeletons and digit-folded readings;
- whether the text hides characters or uses other scripts;
- the coin's name and symbol;
- the disclosure words found;
- whether the coin has an official deployment on that chain.

When every character was readable, it is also told that the token copies no listed name or symbol. When some were not, it gets the raw name and symbol only, with no skeleton and no claim about copies. The prompt says any instruction inside the token name is ignored. Each validator asks the model itself, and they must return the same single label. Any other answer leaves the case PENDING.

### What the model never decides

- Whether a token is **official**. That is only the list entry at the case's own chainId and address.
- Whether a token is a **listed bridged variant** (rule 2b). That is the list's own entry.
- Whether a token **copies a listed label** (rule 3). That is string equality on skeletons, whatever bridge words or hidden characters come with it.
- Whether a contract is a token at all. That is whether `name()` or `symbol()` returns text.
- Any case where the **evidence could not be read**. Nothing is asked; the case waits.
- Any **uncovered (coin, chain) pair**. Refused before anything is fetched.
- **Precedent** flags (below). Byte comparison only.
- A **real coin missing from the list**. It can never reach IMPERSONATOR: uncovered pairs are refused, and a covered pair with no entry is an evidence failure before any rule or model runs.
- **What is stored.** Only the agreed evidence and one of three labels are stored, never free text from the model or anything the leader alone produced.

### Other methods

- `flag_by_precedent(chain, tokens[≤5], precedent_id)`: address-poisoning campaigns deploy many byte-identical copies. The precedent must be a case ruled IMPERSONATOR by HOMOGLYPH, LISTED_COPY or MODEL, never one that was itself flagged by precedent, and never a VARIANT. Each listed token is then ruled IMPERSONATOR with basis `PRECEDENT` only if:
  - its on-chain name, symbol and decimals (a missing `decimals()` counts as null) are identical to the precedent's;
  - it is ERC-20;
  - it is not on the list at that chainId and address.

  Non-matching tokens are skipped with a reason, not reverted. There is no model call.
- `recheck(case_id)`: anyone, on a ruled case, after the cooldown. Runs the full rules again (never the precedent shortcut) and appends the new ruling to the case's history; the old one is kept. If the evidence cannot be read, the current label stays.
- `expire(case_id)`: anyone, on a PENDING case after its deadline. The key becomes free again.
- Views: `get_case`, `get_status(chain, token)`, `is_impersonator(chain, token)`, `list_cases(offset, limit)`, `stats`, `get_config`.

OFFICIAL means exactly "on the Uniswap default token list for this chain under the coin's symbol, at the time of the ruling". The register never calls a token approved; it only says which tokens copy a coin.

## The consumer: Safelist

`contracts/safelist.py` is a tiny on-chain token list, the kind a DEX ships as its default list.

- **`add_token(chain, token)`**, curator only: before anything is stored, the contract makes a cross-contract view call to `Lookalike.is_impersonator(chain, token)` and refuses the token if the register rules it an IMPERSONATOR of any coin.
- **`prune(chain, token)`**, open to anyone: removes a listed token if, and only if, the register rules it an IMPERSONATOR *now*. A token listed before anyone flagged it therefore does not stay listed.
- **`list_tokens()` / `list_pruned()`** return the list and the removed entries.

The Lookalike address is fixed in the Safelist constructor.

## Deployments (GenLayer studio-dev, chain 61997)

| Instance | What it is | Address | Deploy |
|---|---|---|---|
| **CANONICAL** | the register: rule window 6 h, recheck cooldown 1 h. All real-token rulings. | [`0xc0a6ac4f8E552170AA64E21264b7E02081Cde876`](https://explorer-studio-dev.genlayer.com/address/0xc0a6ac4f8E552170AA64E21264b7E02081Cde876) | [deploy tx](https://explorer-studio-dev.genlayer.com/tx/0x64337792655a94ac346a398ce900cca6125b94c49a5ffc5b113adab0b56663fe) |
| **DEMO** | the same file with rule window 5 min and recheck cooldown 3 min: the time-based paths (expire, re-flag, recheck) and the MODEL cases judged twice | [`0x5C26d415B436859AC2c67FB41cdFaE21a8179c1d`](https://explorer-studio-dev.genlayer.com/address/0x5C26d415B436859AC2c67FB41cdFaE21a8179c1d) | [deploy tx](https://explorer-studio-dev.genlayer.com/tx/0x7c224875421a037076fa3bd394ab5ab71f913b413bfa021c06e4636ab1cdb04f) |
| **SAFELIST** | the consumer token list, reading CANONICAL | [`0xF0B3e58eE4581aA6D997013D1E7556AFBa48A398`](https://explorer-studio-dev.genlayer.com/address/0xF0B3e58eE4581aA6D997013D1E7556AFBa48A398) | [deploy tx](https://explorer-studio-dev.genlayer.com/tx/0xf9dae4db1de62b8a6f93939132c275fd0428897c01b846532c45c03d4c168ff9) |

CANONICAL and DEMO are the same bytes: `contracts/lookalike.py`, sha256 `1613bfbb95a89b2ef16a723d20a8de57cfa244251642753df22d72567b047ff9`. `contracts/safelist.py` has sha256 `f3d3a3f6d5dadd1068c0d82092edfdc0be6b412e8ff343fcee2c6c8f9527c3be`.

- Deployed from commit `6b399e6958860d94521800917897220fbd9933f4`.
- The source read back from studio-dev (`gen_getContractCode`) is byte-identical to that commit for all three contracts (`test/verify_source.mjs`).
- Details are in [ADDRESSES.md](ADDRESSES.md).
- Earlier deployments are in `docs/superseded/`.

## Seed results

Real tokens, real transactions, read from each token's own chain. Full tx hashes, case JSON and histories are in [docs/SEEDS.md](docs/SEEDS.md) and [docs/seed-evidence.json](docs/seed-evidence.json). Every case ended with its expected outcome.

- **C:** core cases.
- **H:** the real tokens that escaped before the LISTED_COPY rule. Each is now IMPERSONATOR by code, with no model call.
- **S:** Safelist.
- **D:** DEMO time paths.

| Step | Instance | Call | Token | Expected | Actual | Match | Explorer |
|---|---|---|---|---|---|---|---|
| C1 | CANONICAL | flag arbitrum [0xEbb993F7C5477016A0a025A790Dd079dfe3Eca9D](https://arbitrum.blockscout.com/token/0xEbb993F7C5477016A0a025A790Dd079dfe3Eca9D) vs `usd-coin` | on chain: 'USD Coin' / 'USDC' with Cyrillic ES and o plus invisible U+206B, U+FEFF, U+200B | IMPERSONATOR/HOMOGLYPH | IMPERSONATOR/HOMOGLYPH | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0xecfe1146c443b7fa0f8b526b191982c2a52a5c91aa35e4932bcf12d9ade7347a) |
| C2 | CANONICAL | flag arbitrum [0xdaECe7e93993394063a01BB39145A7d71d4df8f1](https://arbitrum.blockscout.com/token/0xdaECe7e93993394063a01BB39145A7d71d4df8f1) vs `usd-coin` | 'U+FEFF SD Coin' / 'U+FEFF SDC': byte-order mark inside | IMPERSONATOR/HOMOGLYPH | IMPERSONATOR/HOMOGLYPH | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0xd661f463ddd27c2217599d5917377e7dd44542442ffb558842f1ef22e54c3f69) |
| C3 | CANONICAL | flag arbitrum [0x72224ea851b18d56065E7ebe355a246A66F5ce2E](https://arbitrum.blockscout.com/token/0x72224ea851b18d56065E7ebe355a246A66F5ce2E) vs `usd-coin` | 'USD Coin' / 'U U+206F SD U+200D C' | IMPERSONATOR/HOMOGLYPH | IMPERSONATOR/HOMOGLYPH | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0x6cf54d7b05180978af350f2ef1039d2a6da4653a390227c7245cc98dae01ae94) |
| C4 | CANONICAL | flag arbitrum [0x2790AfA96A254142a13C24A7BE2C35afC784b82a](https://arbitrum.blockscout.com/token/0x2790AfA96A254142a13C24A7BE2C35afC784b82a) vs `tether` | 'Tet U+FEFF her USD' / 'U U+200C SDT' | IMPERSONATOR/HOMOGLYPH | IMPERSONATOR/HOMOGLYPH | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0xccad29e7e9a05d8afcc2d1a17edf739fbfd280bf0bf3f47d1cb9b61bed3a75a0) |
| C5 | CANONICAL | flag arbitrum [0x8Fd886c4021ed69a968f6966F818e476868B00eD](https://arbitrum.blockscout.com/token/0x8Fd886c4021ed69a968f6966F818e476868B00eD) vs `usd-coin` | 'USDC' / 'USDC', 6 decimals, not the official Arbitrum USDC | IMPERSONATOR/LISTED_COPY | IMPERSONATOR/LISTED_COPY | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0x85932297fd69f6b0c9a740578e5557a0ff3dca6f9e595496b14d08014a594051) |
| C6 | CANONICAL | flag arbitrum [0x413f1661a78A9675C95E33D63b0c90DBD747c43B](https://arbitrum.blockscout.com/token/0x413f1661a78A9675C95E33D63b0c90DBD747c43B) vs `tether` | 'USDT' / 'USDT' on Arbitrum (the official Tether there is USDT0) | IMPERSONATOR/LISTED_COPY | IMPERSONATOR/LISTED_COPY | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0xe57a484dc43994e95891dee5fa63ed954fe434f3cb7d3cf17351eeaf16731d9c) |
| C7 | CANONICAL | flag ethereum [0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48](https://eth.blockscout.com/token/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48) vs `usd-coin` | real USDC on Ethereum | OFFICIAL/OFFICIAL_LIST | OFFICIAL/OFFICIAL_LIST | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0x43480537e9079acbf499301dd482452a2d17c5fb6f56cec394fdb6002b94537c) |
| C8 | CANONICAL | flag arbitrum [0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8](https://arbitrum.blockscout.com/token/0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8) vs `usd-coin` | real bridged USDC.e: on chain it says 'USD Coin (Arb1)' / 'USDC'; the list carries this address as USDC.e 'Bridged USDC' | VARIANT/LISTED_VARIANT | VARIANT/LISTED_VARIANT | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0x3b1af815c9a6cf7b6f334a7fb7fc18326ddc605634b4d1014b3cbe8615317cbf) |
| C9 | CANONICAL | flag arbitrum [0xEB466342C4d449BC9f53A865D5Cb90586f405215](https://arbitrum.blockscout.com/token/0xEB466342C4d449BC9f53A865D5Cb90586f405215) vs `usd-coin` | 'Axelar Wrapped USDC' / 'axlUSDC', not on the list | VARIANT/MODEL | VARIANT/MODEL | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0x9f6067919830c384312cc4260505bd3e26a223a5f70ed3aaafd7482f652bf988) |
| C10 | CANONICAL | flag ethereum [0xdC035D45d973E3EC169d2276DDab16f1e407384F](https://eth.blockscout.com/token/0xdC035D45d973E3EC169d2276DDab16f1e407384F) vs `usd-coin` | Sky 'USDS Stablecoin' / 'USDS': a different dollar token, on the list as USDS | UNRELATED/LISTED_OTHER | UNRELATED/LISTED_OTHER | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0x5158516270904e2ff7ae73f51d4a6be6e5601a27a83c7e6eec2c957a3175ca81) |
| C11 | CANONICAL | flag_by_precedent (case 5): [0x293971FC9f23AddadfB5bE29a4542C0E2BF67ba8](https://arbitrum.blockscout.com/token/0x293971FC9f23AddadfB5bE29a4542C0E2BF67ba8), [0x1C1dEB401E94f4826260Ca888E53180819449714](https://arbitrum.blockscout.com/token/0x1C1dEB401E94f4826260Ca888E53180819449714), [0x755A31d5dDbF5Cb69B15d50a01a0ea1ae15Ce474](https://arbitrum.blockscout.com/token/0x755A31d5dDbF5Cb69B15d50a01a0ea1ae15Ce474), [0xCd5503c3718C2303Bf958538cF94FcB5606E4E01](https://arbitrum.blockscout.com/token/0xCd5503c3718C2303Bf958538cF94FcB5606E4E01), [0x0dFCCeB1147e0Ff11a442602a245E34D2FEBC977](https://arbitrum.blockscout.com/token/0x0dFCCeB1147e0Ff11a442602a245E34D2FEBC977) | five more 'USDC' / 'USDC' / 6-decimal copies, byte-identical to C5 | 5 x IMPERSONATOR/PRECEDENT | 5 x IMPERSONATOR/PRECEDENT | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0xed77429b46d72c498698bc3abe6c862f480dee072dd4ec48b6f884485c536f1b) |
| C12 | CANONICAL | flag base [0x07f3c9Ba9a0C06204C8489B62291d5B0e77615A1](https://base.blockscout.com/token/0x07f3c9Ba9a0C06204C8489B62291d5B0e77615A1) vs `tether` | a 'Tether USD' copy on Base: the list has no Tether on Base, so the pair is refused | refused: the official list does not cover this coin on this chain | refused: the official list does not cover this coin on this chain | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0xa5b441e46fe3bc974c1049ab9819aeaa2b90bc24c868faf3526ef2f03c234373) |
| H1 | CANONICAL | flag arbitrum [0xe1De3977D7909499642fee317818Ae698C841079](https://arbitrum.blockscout.com/token/0xe1De3977D7909499642fee317818Ae698C841079) vs `usd-coin` | route A: 'Bridged USDC' / 'USDC.e', the list's own label for USDC.e, at another address | IMPERSONATOR/LISTED_COPY | IMPERSONATOR/LISTED_COPY | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0x77449b52f5e88b28e2ba3d0cb56cdf0a486023428bf1f7fb371056b2c31d0997) |
| H2 | CANONICAL | flag_by_precedent (case 16): [0xC79Ea482222e56C7976284649F4C4AB7720C271A](https://arbitrum.blockscout.com/token/0xC79Ea482222e56C7976284649F4C4AB7720C271A), [0x9a678BEC1a1eeAABAd1A9e22E3716e0fc9Cc99F5](https://arbitrum.blockscout.com/token/0x9a678BEC1a1eeAABAd1A9e22E3716e0fc9Cc99F5) | route A + G: two more byte-identical 'Bridged USDC' / 'USDC.e' copies, batched on H1 | 2 x IMPERSONATOR/PRECEDENT | 2 x IMPERSONATOR/PRECEDENT | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0xa3bf219783612f17846266040a627d6dccc9ceda604ee16cdadb190f5e188ba8) |
| H3 | CANONICAL | flag arbitrum [0x9559136B1069715CCCe06b59ed3B9874e1213169](https://arbitrum.blockscout.com/token/0x9559136B1069715CCCe06b59ed3B9874e1213169) vs `usd-coin` | route A: 'USD Coin Bridged' / 'USDC.e' | IMPERSONATOR/LISTED_COPY | IMPERSONATOR/LISTED_COPY | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0x7d6cedf72c943c9872685c9e181c40f0c712ed321d98599b599e9be63a7aa8be) |
| H4 | CANONICAL | flag arbitrum [0x091aF852874B4885F9D89cB6cC6A85538a4223fe](https://arbitrum.blockscout.com/token/0x091aF852874B4885F9D89cB6cC6A85538a4223fe) vs `usd-coin` | route C: 'Lens Bridged USDC (Lens)' / 'USDC': a wallet shows USDC | IMPERSONATOR/LISTED_COPY | IMPERSONATOR/LISTED_COPY | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0x286d7f8d5bbbbd533b51ef2ba63a8d8dba419f926e0317619201495d46dc276a) |
| H5 | CANONICAL | flag arbitrum [0x0EDa1A5Aa9AB156604fE174A1a4505588ccE2E72](https://arbitrum.blockscout.com/token/0x0EDa1A5Aa9AB156604fE174A1a4505588ccE2E72) vs `usd-coin` | route C: 'Zero Network Bridged USDC (Zero Network)' / 'USDC' | IMPERSONATOR/LISTED_COPY | IMPERSONATOR/LISTED_COPY | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0x2f0fe71d0ee8098ca74f6e4c2906a988da16fb78d6647f58ddd165f122f1046b) |
| H6 | CANONICAL | flag arbitrum [0xcE0470d23Ea6c86A3dF9E1008aAbDfFAEeF8F2f0](https://arbitrum.blockscout.com/token/0xcE0470d23Ea6c86A3dF9E1008aAbDfFAEeF8F2f0) vs `tether` | route D: 'USDT0' / 'USDT0', Tether's listed Arbitrum symbol, at another address | IMPERSONATOR/LISTED_COPY | PENDING | PENDING, ruled by H6-rule2 | [tx](https://explorer-studio-dev.genlayer.com/tx/0x69099dba0ddeeecb3e4d39110cb8bddd67585eee63fd0f2ac42fe60e6ddf50a8) |
| H6-rule | CANONICAL | rule(case 22) | retry: the first read left case 22 PENDING (the list could not be read); anyone may call rule() before the deadline | IMPERSONATOR/LISTED_COPY | PENDING | PENDING, ruled by H6-rule2 | [tx](https://explorer-studio-dev.genlayer.com/tx/0x29dd0a4280bf9e9a8a23df934b5ed0f2d00a1a7814cd499b3c567201fc9c7f64) |
| H6-rule2 | CANONICAL | rule(case 22) | retry 2: case 22 was left PENDING because the evidence could not be read; anyone may call rule() before the deadline | IMPERSONATOR/LISTED_COPY | IMPERSONATOR/LISTED_COPY | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0xbe4282d05e9275d1f3021127dff6cb19e208de9bec81df0d3886f16b997b9c7a) |
| H7 | CANONICAL | flag arbitrum [0x6f0a3Fc26f0C1Ae046746dC70aAc61e032d84B52](https://arbitrum.blockscout.com/token/0x6f0a3Fc26f0C1Ae046746dC70aAc61e032d84B52) vs `tether` | route D: another 'USDT0' / 'USDT0' | IMPERSONATOR/LISTED_COPY | PENDING | PENDING, ruled by H7-rule2 | [tx](https://explorer-studio-dev.genlayer.com/tx/0x95b1fb55d83b004dbaf01ad10154bebefc6c95df5bdb36f0d352da1f42c97d2c) |
| H7-rule | CANONICAL | rule(case 23) | retry: the first read left case 23 PENDING (the list could not be read); anyone may call rule() before the deadline | IMPERSONATOR/LISTED_COPY | PENDING | PENDING, ruled by H7-rule2 | [tx](https://explorer-studio-dev.genlayer.com/tx/0x697fdee15789b3c040b0571512d5594fa5ef9c27ce193ed9c993541eb0cf04a4) |
| H7-rule2 | CANONICAL | rule(case 23) | retry 2: case 23 was left PENDING because the evidence could not be read; anyone may call rule() before the deadline | IMPERSONATOR/LISTED_COPY | IMPERSONATOR/LISTED_COPY | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0xe07a3b3547eb4405382449972ce1043f535ba950bc9c6b8b2eab18727b1081ea) |
| H8 | CANONICAL | flag arbitrum [0xE0FB0F453aBfbd74368074cf0291711FC82cBc07](https://arbitrum.blockscout.com/token/0xE0FB0F453aBfbd74368074cf0291711FC82cBc07) vs `tether` | route D: 'Fake USD(Tugrik)0' / 'USDT0' | IMPERSONATOR/HOMOGLYPH | PENDING | PENDING, ruled by H8-rule2 | [tx](https://explorer-studio-dev.genlayer.com/tx/0xa30b662c15ac622f31672823c65dade2fbc6f5c6f8a14d1eaf21ffcbcda0664e) |
| H8-rule | CANONICAL | rule(case 24) | retry: the first read left case 24 PENDING (the list could not be read); anyone may call rule() before the deadline | IMPERSONATOR/HOMOGLYPH | PENDING | PENDING, ruled by H8-rule2 | [tx](https://explorer-studio-dev.genlayer.com/tx/0x37e608620c382f8e385a46f7bde2e734be4ef124fe327b13a9faf7802a8b4ef4) |
| H8-rule2 | CANONICAL | rule(case 24) | retry 2: case 24 was left PENDING because the evidence could not be read; anyone may call rule() before the deadline | IMPERSONATOR/HOMOGLYPH | IMPERSONATOR/HOMOGLYPH | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0xbcd8213550561e43b4927b8ce7781dea2aa44584f656bec53d94a754cbb27e92) |
| H9 | CANONICAL | flag arbitrum [0xE3F520d5C6f5421eE02160242f7a9e025d829E3e](https://arbitrum.blockscout.com/token/0xE3F520d5C6f5421eE02160242f7a9e025d829E3e) vs `usd-coin` | route E: seed M3, 'Bridged USDC' / 'USDC.e' padded with invisible characters | IMPERSONATOR/HOMOGLYPH | PENDING | PENDING, ruled by H9-rule2 | [tx](https://explorer-studio-dev.genlayer.com/tx/0x150b2b9561c80dbdcecc3459cfd3b70dca1bdd6fa935202d160357759afee308) |
| H9-rule | CANONICAL | rule(case 25) | retry: the first read left case 25 PENDING (the list could not be read); anyone may call rule() before the deadline | IMPERSONATOR/HOMOGLYPH | PENDING | PENDING, ruled by H9-rule2 | [tx](https://explorer-studio-dev.genlayer.com/tx/0x818b2d2e585d807991d977aeb9fb7fcb7e7e8b9904fdc1436b896ad94c88928c) |
| H9-rule2 | CANONICAL | rule(case 25) | retry 2: case 25 was left PENDING because the evidence could not be read; anyone may call rule() before the deadline | IMPERSONATOR/HOMOGLYPH | IMPERSONATOR/HOMOGLYPH | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0xe3d364db823c31e8a5570893e285b8bf06df0d6e8e23c6927d229bd7190e95e4) |
| H10 | CANONICAL | flag arbitrum [0x6aed705A1E8E7bE9A3965743CBDc35FC9252D17A](https://arbitrum.blockscout.com/token/0x6aed705A1E8E7bE9A3965743CBDc35FC9252D17A) vs `usd-coin` | route F: 'Bridged USDC' / 'Visit https://circle-v2.xyz to claim rewards', no decimals() | IMPERSONATOR/LISTED_COPY | PENDING | PENDING, ruled by H10-rule | [tx](https://explorer-studio-dev.genlayer.com/tx/0x4dd6318a9ee7add836e9292d5a036728a98e91560cf06ac2911c37d2a4f97601) |
| H10-rule | CANONICAL | rule(case 26) | retry: the first read left case 26 PENDING (the list could not be read); anyone may call rule() before the deadline | IMPERSONATOR/LISTED_COPY | IMPERSONATOR/LISTED_COPY | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0xae8bec58dd7709ac95ca8ad3df6c45c7a1074a66aa2de61092e80e919d0685ed) |
| S1 | SAFELIST | Safelist.add_token ethereum [0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48](https://eth.blockscout.com/token/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48) | real USDC (CANONICAL case C7 is OFFICIAL) | added | added | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0x763b853aac2a0c808d80fbb03c54e0874019053c145620eec7cb43ee58ee2a64) |
| S2 | SAFELIST | Safelist.add_token arbitrum [0x8Fd886c4021ed69a968f6966F818e476868B00eD](https://arbitrum.blockscout.com/token/0x8Fd886c4021ed69a968f6966F818e476868B00eD) | the C5 fake | refused: IMPERSONATOR | refused: IMPERSONATOR | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0x5f0c0179ebaa55fa78907371f52ebeb8a5cfc388fdf5a427c4d9082cbc1b5ff7) |
| S3 | SAFELIST | Safelist.add_token arbitrum [0x35E57438a1348e3441501d5F4ea892Bc81009511](https://arbitrum.blockscout.com/token/0x35E57438a1348e3441501d5F4ea892Bc81009511) | a fake nobody has flagged yet (byte-identical to C3): the list has no reason to refuse it | added | added | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0xa567419bc389a73b4a247f4aa83eb7c01ebced84e8c1a63595b1956f99ea530c) |
| C13 | CANONICAL | flag arbitrum [0x35E57438a1348e3441501d5F4ea892Bc81009511](https://arbitrum.blockscout.com/token/0x35E57438a1348e3441501d5F4ea892Bc81009511) vs `usd-coin` | the same fake, flagged after it was listed | IMPERSONATOR/HOMOGLYPH | IMPERSONATOR/HOMOGLYPH | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0x7d71962c2eb6fb26ff6c2cc0afa784c3c73f2f6d185f6b9ca0a33cd3b76f7d1c) |
| S4 | SAFELIST | Safelist.prune arbitrum [0x35E57438a1348e3441501d5F4ea892Bc81009511](https://arbitrum.blockscout.com/token/0x35E57438a1348e3441501d5F4ea892Bc81009511), sent by another account | a different account prunes it now that the register rules it an IMPERSONATOR | pruned | pruned | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0x8271c7222cba14cdb875f04b34b12d5270ade66a1a4a483421c7d8db10154c4b) |
| D1 | DEMO | flag base [0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48](https://base.blockscout.com/token/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48) vs `usd-coin` | the Ethereum USDC address on Base: no contract there (eth_getCode is empty), so the evidence fails | PENDING | PENDING | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0x031b5b00c2fa4a6c581c25b021e53a8f68ca18547b43071be84491fae02b60c5) |
| D2 | DEMO | rule(case 1) | anyone retries before the 5-minute deadline; still no contract | PENDING | PENDING | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0x6bb5e8dbc6422e9f3ac771bdd24ade36c75fb8649b9007346608ce0f51596f8d) |
| D3 | DEMO | flag arbitrum [0x8Fd886c4021ed69a968f6966F818e476868B00eD](https://arbitrum.blockscout.com/token/0x8Fd886c4021ed69a968f6966F818e476868B00eD) vs `usd-coin` | exact copy, to be rechecked | IMPERSONATOR/LISTED_COPY | IMPERSONATOR/LISTED_COPY | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0x0076d402ea0cbb6648f27e7ba43731c8c8615f67cc5c677e4f65742324c77a9c) |
| D4 | DEMO | recheck(case 2) | recheck right away | refused: recheck cooldown has not passed | refused: recheck cooldown has not passed | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0x30f84d1e38bf282080fa84192a8a01a25f80f81c23ae9b65cc247bf9e144bb58) |
| D5 | DEMO | recheck(case 2) | after the 3-minute cooldown; history keeps the first ruling | IMPERSONATOR/LISTED_COPY | IMPERSONATOR/LISTED_COPY | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0xcde1cadd717b10814ffca4f29d758fcefd0d527c856e137bf5d00347cdd09a3b) |
| D6 | DEMO | expire(case 1) | after the 5-minute rule window | EXPIRED | EXPIRED | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0xcbc6f4051ffc0c3cebcad3ed8e0716f7b1007abc1e1cda6f441e4aa41976cb67) |
| D7 | DEMO | flag base [0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48](https://base.blockscout.com/token/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48) vs `usd-coin` | the same key flagged again after EXPIRED: a new case (still no contract at that address on Base) | PENDING | PENDING | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0xa9ddd7431f93a9bc344f5176f14f759020a2c74940b9d7e0520e7f58c2e8248d) |

### MODEL cases, each judged twice (DEMO)

Each case was flagged (run 1) and rechecked after the 3-minute cooldown (run 2). In a MODEL run every validator asked the model itself and they had to agree on one label. M3 is the fake that used to reach the model; code decides it both times.

| Case | Token | What it is | Expected | Run 1 | Run 2 | Runs agree |
|---|---|---|---|---|---|---|
| M1 (DEMO case 3) | [0xEB466342C4d449BC9f53A865D5Cb90586f405215](https://arbitrum.blockscout.com/token/0xEB466342C4d449BC9f53A865D5Cb90586f405215) | 'Axelar Wrapped USDC' / 'axlUSDC' | VARIANT/MODEL | VARIANT/MODEL ([tx](https://explorer-studio-dev.genlayer.com/tx/0xac4b2e48745faa313a2a5293c1bdce593f44bb2a6957b714c7c7bb62ae6da8b5)) | VARIANT/MODEL ([tx](https://explorer-studio-dev.genlayer.com/tx/0xa648b1b1e26fb53392fd06090e10c9ee9033e00221e544578797d4c506f6a649)) | same |
| M2 (DEMO case 4) | [0xBc65ad17c5C0a2A4D159fa5a503f4992c7B545FE](https://eth.blockscout.com/token/0xBc65ad17c5C0a2A4D159fa5a503f4992c7B545FE) | 'Spark USDC Vault' / 'sUSDC' | UNRELATED/MODEL | UNRELATED/MODEL ([tx](https://explorer-studio-dev.genlayer.com/tx/0x867347a238c07676ab61044ff8832328c2057d03c31d868136000f8de88dc548)) | UNRELATED/MODEL ([tx](https://explorer-studio-dev.genlayer.com/tx/0x62d03407bcdab30faa8b9c1bec094c2ea665e15a3f821c75427d5b1541ffb207)) | same |
| M3 (DEMO case 5) | [0xE3F520d5C6f5421eE02160242f7a9e025d829E3e](https://arbitrum.blockscout.com/token/0xE3F520d5C6f5421eE02160242f7a9e025d829E3e) | real fake: 'Bridged USDC' / 'USDC.e' padded with invisible characters (now decided by code, no model call) | IMPERSONATOR/HOMOGLYPH | IMPERSONATOR/HOMOGLYPH ([tx](https://explorer-studio-dev.genlayer.com/tx/0x388716742c07071a1d0416dae6713f113df6db18709c0f2c8ef14f490251d068)) | IMPERSONATOR/HOMOGLYPH ([tx](https://explorer-studio-dev.genlayer.com/tx/0x50aef6e2113eba41c63cdb0cf7c10ec85b8c4e1a19a4f675737d00ce379cd0c6)) | same |
| M4 (DEMO case 6) | [0xB67c014FA700E69681a673876eb8BAFAA36BFf71](https://arbitrum.blockscout.com/token/0xB67c014FA700E69681a673876eb8BAFAA36BFf71) | 'Hop USDC LP Token' / 'HOP-LP-USDC' | UNRELATED/MODEL | UNRELATED/MODEL ([tx](https://explorer-studio-dev.genlayer.com/tx/0xa55fd42ff7c1f06f59f0390aa885c0591a204a57e0dd9c392d2dd67a9575e533)) | UNRELATED/MODEL ([tx](https://explorer-studio-dev.genlayer.com/tx/0x3e3b64ec74807ac88285a542b55d4b71daeace7b2c8d44b6a4ac467d76016865)) | same |

Notes:

- **H6-H10 retries.** For about three minutes (09:14-09:17 UTC) the official list could not be read, so the agreed evidence was `"FAIL"` and those cases stayed PENDING, including the first `rule()` retries. The designed recovery is `rule()`, which anyone can call before the deadline. Later calls ruled every one of them as expected; the `-rule` rows are those calls.
- **D1 and D7** flag the Ethereum USDC address on Base, where no contract exists, so the case stays PENDING. D2, D6 and D7 show `rule`, `expire` and re-flagging.
- **C12** shows the coverage gate.
- **S3, C13 and S4** show a fake that was listed before anyone flagged it, then pruned once the register ruled it an impersonator.


## Known limits

- **Unlisted legitimate bridges that reuse a listed label are ruled IMPERSONATOR.** This is intended. Wormhole's USDC bridged from Solana, `0x41f7B8b9b897276b7AAE926a9016935280b44E97` on Ethereum, says exactly `USD Coin` / `USDC` on chain and is not on the Uniswap list, so rule 3 rules it LISTED_COPY. To a wallet user it shows as USDC and is not USDC's listed address, which is exactly the definition. The register cannot see bridge origin. If the list adds it, `recheck` clears it: it then matches rule 2 or 2b.
- **A fake of an unlisted product cannot be told from the real one.** axlUSDC is not on the Uniswap list. A fake `Axelar Bridged USDC` / `AXLUSDC` (for example `0xFDdaFC5258AB4F05b0D0dA8DC019a9B3Cd1C7F09` on Arbitrum) produces the same evidence as the real `0xEB466342C4d449BC9f53A865D5Cb90586f405215`, so every rule, and the model, treats both alike. Separating them needs a second official source that lists axlUSDC.
- **Look-alikes outside Unicode's data.** A character that looks like a Latin letter but is in neither `confusables.txt` nor the hand table is unreadable. Next to a listed label it still yields HOMOGLYPH, and it never yields UNRELATED by code. Without a label, the model judges the raw text.
- **Name and symbol only.** The register judges what a token calls itself. A scam token with an original name, a copied logo, or a malicious contract behind an honest name is out of scope.
- **Labels come from one list.** A new bridged token that the list adds changes the set of labels at the next ruling. A token that renames itself is only re-judged when someone calls `recheck`.
- **One public RPC endpoint per chain.** If it is down or rate-limited, cases stay PENDING until someone retries.
- **OFFICIAL is the Uniswap default list's view.** Pairs the list does not cover (Tether and WBTC on Base, and USDe everywhere) cannot be flagged. CoinGecko was the intended source; from GenLayer validators it answered HTTP 429 on every call (docs/PROBE.md), so it could not be used without an API key.
- **Not a safety badge.** IMPERSONATOR describes how a token presents itself, not intent. UNRELATED, VARIANT and "no case" say nothing about whether a token is harmless.
- **Model rulings can fail to agree.** On a borderline name validators may return different labels; then nothing is written and the case stays PENDING until it is ruled or expires.
- **studio-dev only.**

## Run it yourself

```sh
cd test && npm install
python3 -m unittest -q test_logic          # offline suite
node accounts.mjs                          # local test keys for the seeds (studio-dev faucet funds them)
node deploy.mjs --network=studio-dev       # CANONICAL, DEMO, SAFELIST from the committed HEAD
caffeinate -dims node seed_lookalike.mjs   # seeds (about 15 minutes; DEMO waits out its windows)
node verify_source.mjs --ref=HEAD          # source read back from the chain == committed source
```

To deploy from a GenLayer keystore instead of a local test key:

```sh
cd ~/Desktop/lookalike/test
read -rs GENLAYER_KEYSTORE_PASSWORD
export GENLAYER_KEYSTORE_PASSWORD
node deploy.mjs --network=studio-dev --keystore=mywallet
unset GENLAYER_KEYSTORE_PASSWORD
```

## Repository

- `contracts/lookalike.py` (the register), `contracts/safelist.py` (the consumer)
- `test/test_logic.py`, `test/world.py`, `test/stub.py`: offline suite with fake JSON-RPC chains, a scripted list and model, and the register's invariants checked after every call; it includes the escape routes A-G found after seed M3, each with the real token that used it, and the attacker round v3 tests (`V3*`)
- `test/deploy.mjs` deploys from the committed HEAD and refuses if the working copy differs; `test/seed_lookalike.mjs` runs the seeds; `test/verify_source.mjs` checks the on-chain source against git
- `docs/THREAT_MODEL.md`, `docs/DECISIONS.md`, `docs/PROBE.md`, `docs/COVERAGE.md`, `docs/SEEDS.md`, `docs/seed-evidence.json`; earlier deployments are kept in `docs/superseded/v1/` (before hardening), `docs/superseded/v2/` (before LISTED_COPY) and `docs/superseded/v3/` (before attacker round v3)
