# Lookalike

A public, on-chain register of ERC-20 tokens that impersonate a known coin.

## The problem

Address-poisoning scams deploy tokens named `USDC` or `Tether USD` and airdrop them to thousands of wallets, so the fake shows up in a victim's transfer history next to the real thing. Many fakes hide the trick in the text itself: a Cyrillic `С` instead of a Latin `C`, a byte-order mark (U+FEFF) inside `USDC`, full-width letters, or a dozen invisible format characters. On Arbitrum alone, a search for "USDC" returns fakes like these with 15,000 to 48,000 holders each.

Wallets, DEX token lists and other contracts need one question answered before they show or accept a token: *does this token present itself as a coin it is not?* Lookalike answers it on chain, with evidence anyone can re-read, and without anyone owning the answer.

## How it works

Anyone calls `flag(chain, token, coin_id)`. In one strict-equality block, every GenLayer validator reads, itself:

- **from the token's own chain**: one JSON-RPC batch to a keyless public endpoint: `eth_getCode`, `name()`, `symbol()`, `decimals()`, and `supportsInterface` for ERC-721/1155. This is the text a wallet shows, not an explorer's label.
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

Every name and symbol is first reduced to a **skeleton**, built from the full string: NFKC normalisation, accents and combining marks removed, invisible and bidi characters removed, Cyrillic and Greek look-alike letters mapped to Latin, upper-cased, only `A-Z0-9` kept. `UЅDС`, `ＵＳＤＣ` and `U` + U+FEFF + `SDC` all have the skeleton `USDC`.

A **listed label** of a coin is the skeleton of the symbol or name of any entry on the Uniswap list, on **any** chain, whose symbol carries the coin as a word: `USDC`, `USDC.e` (`USDCE`), `Bridged USDC`, `USDCoin (PoS)` (`USDCOINPOS`), `USDCoin (Bridged from Ethereum)`, `USDT`, `USDT0`, `Tether USD`, `Wrapped Ether`, `Dai Stablecoin`, `Wrapped BTC` and so on. The coin's own symbol and name (`USD Coin`, `Tether`, …) are labels too. Entries whose symbol names another asset do not count, even when their name mentions the brand: `Tether Gold` / `XAUT` is not a Tether label, and Celo's `Wrapped Bitcoin` / `BTC` does not make `BTC` a WBTC label.

The first rule that fits decides, and the contract stores which one as `basis`:

| # | Basis | Condition | Result |
|---|---|---|---|
| 1 | `NOT_ERC20` | `totalSupply()` or `balanceOf(0)` does not return a uint256, neither `name()` nor `symbol()` returns text, or the contract reports an NFT interface. `decimals()` is optional (stored as null when missing). | UNRELATED |
| 2 | `OFFICIAL_LIST` | the list has an entry with **this chainId and this address** under the coin's symbol | OFFICIAL |
| 2b | `LISTED_VARIANT` / `LISTED_OTHER` | the list carries this exact chainId and address as a **different** asset (bridged USDC.e says `USD Coin (Arb1)` / `USDC` on chain, and the list calls it `USDC.e`) | VARIANT if the list's own symbol carries the coin, else UNRELATED |
| 3 | `LISTED_COPY` (or `HOMOGLYPH`) | the token's symbol skeleton **or** name skeleton is exactly a listed label, and the token is not a list entry on this chain. Bridge and wrap words do not exempt it. The basis is `HOMOGLYPH` when the raw text held a disguise (look-alike letter, invisible or bidi character, combining mark or accent, full-width form). | IMPERSONATOR |
| 4 | `NO_BRAND_MATCH` | neither skeleton contains the coin's symbol or name, not even with digit look-alikes read as letters, and there is no character the code cannot read | UNRELATED |
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

It is also told that the token copies no listed name or symbol. The prompt says any instruction inside the token name is ignored. Each validator asks the model itself, and they must return the same single label. Any other answer leaves the case PENDING.

### What the model never decides

- Whether a token is **official**. That is only the list entry at the case's own chainId and address.
- Whether a token is a **listed bridged variant** (rule 2b). That is the list's own entry.
- Whether a token **copies a listed label** (rule 3). That is string equality on skeletons, whatever bridge words or hidden characters come with it.
- Whether a contract is an **ERC-20** at all. That is the chain's answers to `name()`, `symbol()`, `decimals()` and `supportsInterface`.
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
| **CANONICAL** | the register: rule window 6 h, recheck cooldown 1 h. All real-token rulings. | [`0x0B448534e504B7d5D0ABfB89e7c57A290D80e705`](https://explorer-studio-dev.genlayer.com/address/0x0B448534e504B7d5D0ABfB89e7c57A290D80e705) | [deploy tx](https://explorer-studio-dev.genlayer.com/tx/0x0de9dbda70ce7d7b35a614fa863702094a3e38af16fdcc34751a62b755c9f1a6) |
| **DEMO** | the same file with rule window 5 min and recheck cooldown 3 min: the time-based paths (expire, re-flag, recheck) and the MODEL cases judged twice | [`0xe57c00C57372B7E88a9C485C323b6296a6Cbfd7a`](https://explorer-studio-dev.genlayer.com/address/0xe57c00C57372B7E88a9C485C323b6296a6Cbfd7a) | [deploy tx](https://explorer-studio-dev.genlayer.com/tx/0x1828af3972dc37350a63d459ba44e13de92cd966c63e5825cf1f94ac12eb19ac) |
| **SAFELIST** | the consumer token list, reading CANONICAL | [`0xc70C20F28d125e318BCAD28dBD84d51d8DBADa2A`](https://explorer-studio-dev.genlayer.com/address/0xc70C20F28d125e318BCAD28dBD84d51d8DBADa2A) | [deploy tx](https://explorer-studio-dev.genlayer.com/tx/0xdd591b08a878759abc7d0089e4a3fc9c6022c95af9523b0fe4c1275c2ac2b839) |

CANONICAL and DEMO are the same bytes: `contracts/lookalike.py`, sha256 `a7a3a07609e4685637a4152c8dbe7bcd92cfa15e02d975cc668d6a9c330329f1`. `contracts/safelist.py` has sha256 `f3d3a3f6d5dadd1068c0d82092edfdc0be6b412e8ff343fcee2c6c8f9527c3be`.

- Deployed from commit `371643122632332d289a12356481a46bf524aef0`.
- The source read back from the chain (`gen_getContractCode`) is byte-identical to that commit for all three contracts (`test/verify_source.mjs`).
- Details are in [ADDRESSES.md](ADDRESSES.md).
- Earlier deployments are in `docs/superseded/`.

## Seed results

Real tokens, real transactions, read from each token's own chain. Full tx hashes, case JSON and histories are in [docs/SEEDS.md](docs/SEEDS.md) and [docs/seed-evidence.json](docs/seed-evidence.json). Every step ended with its expected outcome.

- **C:** core cases.
- **H:** the real tokens that escaped before the LISTED_COPY rule (routes A-G). Each is now IMPERSONATOR by code, with no model call.
- **S:** Safelist.
- **D:** DEMO time paths.

| Step | Instance | Call | Token | Expected | Actual | Match | Explorer |
|---|---|---|---|---|---|---|---|
| C1 | CANONICAL | flag arbitrum [0xEbb993F7C5477016A0a025A790Dd079dfe3Eca9D](https://arbitrum.blockscout.com/token/0xEbb993F7C5477016A0a025A790Dd079dfe3Eca9D) vs `usd-coin` | on chain: 'USD Coin' / 'USDC' with Cyrillic ES and o plus invisible U+206B, U+FEFF, U+200B | IMPERSONATOR/HOMOGLYPH | IMPERSONATOR/HOMOGLYPH | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0x27c0ee319052e757d892dcfc9c7e620ad8ca5bc611a065e8be1b37d6ff0e8543) |
| C2 | CANONICAL | flag arbitrum [0xdaECe7e93993394063a01BB39145A7d71d4df8f1](https://arbitrum.blockscout.com/token/0xdaECe7e93993394063a01BB39145A7d71d4df8f1) vs `usd-coin` | 'U+FEFF SD Coin' / 'U+FEFF SDC': byte-order mark inside | IMPERSONATOR/HOMOGLYPH | IMPERSONATOR/HOMOGLYPH | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0x6293547adbbd18d3e895f9f6792b69042c03a063894df80ee28b55370d33bcc4) |
| C3 | CANONICAL | flag arbitrum [0x72224ea851b18d56065E7ebe355a246A66F5ce2E](https://arbitrum.blockscout.com/token/0x72224ea851b18d56065E7ebe355a246A66F5ce2E) vs `usd-coin` | 'USD Coin' / 'U U+206F SD U+200D C' | IMPERSONATOR/HOMOGLYPH | IMPERSONATOR/HOMOGLYPH | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0xf2d5802dd4039e548e697f4528f05742012cbf0cd8343a12c81079ee3d3f5ad2) |
| C4 | CANONICAL | flag arbitrum [0x2790AfA96A254142a13C24A7BE2C35afC784b82a](https://arbitrum.blockscout.com/token/0x2790AfA96A254142a13C24A7BE2C35afC784b82a) vs `tether` | 'Tet U+FEFF her USD' / 'U U+200C SDT' | IMPERSONATOR/HOMOGLYPH | IMPERSONATOR/HOMOGLYPH | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0xd19e13c7ea7b00015d7c76abb347c9956286698d6723df736563d067fbaaaa78) |
| C5 | CANONICAL | flag arbitrum [0x8Fd886c4021ed69a968f6966F818e476868B00eD](https://arbitrum.blockscout.com/token/0x8Fd886c4021ed69a968f6966F818e476868B00eD) vs `usd-coin` | 'USDC' / 'USDC', 6 decimals, not the official Arbitrum USDC | IMPERSONATOR/LISTED_COPY | IMPERSONATOR/LISTED_COPY | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0xedcca3b6dcb10a8c6b70770d258c4b12ab1d6772e2f9050e7c7ba2a2b00a409c) |
| C6 | CANONICAL | flag arbitrum [0x413f1661a78A9675C95E33D63b0c90DBD747c43B](https://arbitrum.blockscout.com/token/0x413f1661a78A9675C95E33D63b0c90DBD747c43B) vs `tether` | 'USDT' / 'USDT' on Arbitrum (the official Tether there is USDT0) | IMPERSONATOR/LISTED_COPY | IMPERSONATOR/LISTED_COPY | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0x5bcc77307b699302dc98eb38b1dc8d5b8068df07f5f1387d5e2d1ba97f377e87) |
| C7 | CANONICAL | flag ethereum [0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48](https://eth.blockscout.com/token/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48) vs `usd-coin` | real USDC on Ethereum | OFFICIAL/OFFICIAL_LIST | OFFICIAL/OFFICIAL_LIST | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0x713235b66458643d1e91aa122d8fff295121b0a4d5a35e28cd8002e15bd3a206) |
| C8 | CANONICAL | flag arbitrum [0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8](https://arbitrum.blockscout.com/token/0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8) vs `usd-coin` | real bridged USDC.e: on chain it says 'USD Coin (Arb1)' / 'USDC'; the list carries this address as USDC.e 'Bridged USDC' | VARIANT/LISTED_VARIANT | VARIANT/LISTED_VARIANT | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0x3b841c97a1652aa387a1a28e76894512edf99852a93dcd8a067afcab81dd77b0) |
| C9 | CANONICAL | flag arbitrum [0xEB466342C4d449BC9f53A865D5Cb90586f405215](https://arbitrum.blockscout.com/token/0xEB466342C4d449BC9f53A865D5Cb90586f405215) vs `usd-coin` | 'Axelar Wrapped USDC' / 'axlUSDC', not on the list | VARIANT/MODEL | VARIANT/MODEL | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0xb96d495d6ad10ca4f75c0289e85aca0288cad21f15a68007d2063484ece07f4a) |
| C10 | CANONICAL | flag ethereum [0xdC035D45d973E3EC169d2276DDab16f1e407384F](https://eth.blockscout.com/token/0xdC035D45d973E3EC169d2276DDab16f1e407384F) vs `usd-coin` | Sky 'USDS Stablecoin' / 'USDS': a different dollar token, on the list as USDS | UNRELATED/LISTED_OTHER | UNRELATED/LISTED_OTHER | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0x91a3ba1ed3994f732e7ade554d6f340a95277022ba9b18fd1a2a34000294d804) |
| C11 | CANONICAL | flag_by_precedent (case 5): [0x293971FC9f23AddadfB5bE29a4542C0E2BF67ba8](https://arbitrum.blockscout.com/token/0x293971FC9f23AddadfB5bE29a4542C0E2BF67ba8), [0x1C1dEB401E94f4826260Ca888E53180819449714](https://arbitrum.blockscout.com/token/0x1C1dEB401E94f4826260Ca888E53180819449714), [0x755A31d5dDbF5Cb69B15d50a01a0ea1ae15Ce474](https://arbitrum.blockscout.com/token/0x755A31d5dDbF5Cb69B15d50a01a0ea1ae15Ce474), [0xCd5503c3718C2303Bf958538cF94FcB5606E4E01](https://arbitrum.blockscout.com/token/0xCd5503c3718C2303Bf958538cF94FcB5606E4E01), [0x0dFCCeB1147e0Ff11a442602a245E34D2FEBC977](https://arbitrum.blockscout.com/token/0x0dFCCeB1147e0Ff11a442602a245E34D2FEBC977) | five more 'USDC' / 'USDC' / 6-decimal copies, byte-identical to C5 | 5 x IMPERSONATOR/PRECEDENT | 5 x IMPERSONATOR/PRECEDENT | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0x2189eed64eff4f5a03e9c628b6efd49528d2585488639f41b92061f21ed772a2) |
| C12 | CANONICAL | flag base [0x07f3c9Ba9a0C06204C8489B62291d5B0e77615A1](https://base.blockscout.com/token/0x07f3c9Ba9a0C06204C8489B62291d5B0e77615A1) vs `tether` | a 'Tether USD' copy on Base: the list has no Tether on Base, so the pair is refused | refused: the official list does not cover this coin on this chain | refused: the official list does not cover this coin on this chain | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0x342150f48d0db212df6edbe46987e52fe9dcf2089b4b181baf5f390ba94563c0) |
| H1 | CANONICAL | flag arbitrum [0xe1De3977D7909499642fee317818Ae698C841079](https://arbitrum.blockscout.com/token/0xe1De3977D7909499642fee317818Ae698C841079) vs `usd-coin` | route A: 'Bridged USDC' / 'USDC.e', the list's own label for USDC.e, at another address | IMPERSONATOR/LISTED_COPY | IMPERSONATOR/LISTED_COPY | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0x9bc8ef34a65a9b43966af3b285d2512390309852dc6fd5585a9fcf82d4dcd613) |
| H2 | CANONICAL | flag_by_precedent (case 16): [0xC79Ea482222e56C7976284649F4C4AB7720C271A](https://arbitrum.blockscout.com/token/0xC79Ea482222e56C7976284649F4C4AB7720C271A), [0x9a678BEC1a1eeAABAd1A9e22E3716e0fc9Cc99F5](https://arbitrum.blockscout.com/token/0x9a678BEC1a1eeAABAd1A9e22E3716e0fc9Cc99F5) | route A + G: two more byte-identical 'Bridged USDC' / 'USDC.e' copies, batched on H1 | 2 x IMPERSONATOR/PRECEDENT | 2 x IMPERSONATOR/PRECEDENT | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0xc5c776c5d2cc9f54bd0aed859a20afcf4e856e0831a6cad1bdbf10047007139f) |
| H3 | CANONICAL | flag arbitrum [0x9559136B1069715CCCe06b59ed3B9874e1213169](https://arbitrum.blockscout.com/token/0x9559136B1069715CCCe06b59ed3B9874e1213169) vs `usd-coin` | route A: 'USD Coin Bridged' / 'USDC.e' | IMPERSONATOR/LISTED_COPY | IMPERSONATOR/LISTED_COPY | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0xe31c1f9f8c383baf3ccea9ce3c6a8b28e7c97428a89422d0e2c98ee8aa0025ab) |
| H4 | CANONICAL | flag arbitrum [0x091aF852874B4885F9D89cB6cC6A85538a4223fe](https://arbitrum.blockscout.com/token/0x091aF852874B4885F9D89cB6cC6A85538a4223fe) vs `usd-coin` | route C: 'Lens Bridged USDC (Lens)' / 'USDC': a wallet shows USDC | IMPERSONATOR/LISTED_COPY | IMPERSONATOR/LISTED_COPY | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0xb51dc2907340746ef543a9ca1f34161b09523bfb119a8cef6cc87203de2bb1c6) |
| H5 | CANONICAL | flag arbitrum [0x0EDa1A5Aa9AB156604fE174A1a4505588ccE2E72](https://arbitrum.blockscout.com/token/0x0EDa1A5Aa9AB156604fE174A1a4505588ccE2E72) vs `usd-coin` | route C: 'Zero Network Bridged USDC (Zero Network)' / 'USDC' | IMPERSONATOR/LISTED_COPY | IMPERSONATOR/LISTED_COPY | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0x4c48cd7a7f673d404098c7839da122adee726751f25a22cabdb266c4caa29ed7) |
| H6 | CANONICAL | flag arbitrum [0xcE0470d23Ea6c86A3dF9E1008aAbDfFAEeF8F2f0](https://arbitrum.blockscout.com/token/0xcE0470d23Ea6c86A3dF9E1008aAbDfFAEeF8F2f0) vs `tether` | route D: 'USDT0' / 'USDT0', Tether's listed Arbitrum symbol, at another address | IMPERSONATOR/LISTED_COPY | IMPERSONATOR/LISTED_COPY | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0x03f94192fb5b4bcce563a6535564b315cdf5b1b0565b5a0b8adacbee8ed50439) |
| H7 | CANONICAL | flag arbitrum [0x6f0a3Fc26f0C1Ae046746dC70aAc61e032d84B52](https://arbitrum.blockscout.com/token/0x6f0a3Fc26f0C1Ae046746dC70aAc61e032d84B52) vs `tether` | route D: another 'USDT0' / 'USDT0' | IMPERSONATOR/LISTED_COPY | IMPERSONATOR/LISTED_COPY | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0x6a3056e23ee3f12b87601c49f23e4b5ed1f20ab2a5aae483c25781830f04d31f) |
| H8 | CANONICAL | flag arbitrum [0xE0FB0F453aBfbd74368074cf0291711FC82cBc07](https://arbitrum.blockscout.com/token/0xE0FB0F453aBfbd74368074cf0291711FC82cBc07) vs `tether` | route D: 'Fake USD(Tugrik)0' / 'USDT0' | IMPERSONATOR/HOMOGLYPH | IMPERSONATOR/HOMOGLYPH | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0xea6008891b73465eb56588186a62492e2d1c3c18753928f34a31c5b182a338d0) |
| H9 | CANONICAL | flag arbitrum [0xE3F520d5C6f5421eE02160242f7a9e025d829E3e](https://arbitrum.blockscout.com/token/0xE3F520d5C6f5421eE02160242f7a9e025d829E3e) vs `usd-coin` | route E: seed M3, 'Bridged USDC' / 'USDC.e' padded with invisible characters | IMPERSONATOR/HOMOGLYPH | IMPERSONATOR/HOMOGLYPH | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0x436e8235820fb88f5ae0a7246ee0f94c437a4c6553dc5430b539993422a9d0ef) |
| H10 | CANONICAL | flag arbitrum [0x6aed705A1E8E7bE9A3965743CBDc35FC9252D17A](https://arbitrum.blockscout.com/token/0x6aed705A1E8E7bE9A3965743CBDc35FC9252D17A) vs `usd-coin` | route F: 'Bridged USDC' / 'Visit https://circle-v2.xyz to claim rewards', no decimals() | IMPERSONATOR/LISTED_COPY | PENDING | PENDING first; ruled by H10-rule | [tx](https://explorer-studio-dev.genlayer.com/tx/0x47775b9900c840bf14f4b23b8752d5ccb794f94acbdd3f89f6f00c9f93863dac) |
| H10-rule | CANONICAL | rule(case 26) | retry: the first read left case 26 PENDING (the list could not be read); anyone may call rule() before the deadline | IMPERSONATOR/LISTED_COPY | IMPERSONATOR/LISTED_COPY | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0x156cf54532e9cfbab6498293b6b811a2cd78205524040ddea30202c3dcb3e68e) |
| S1 | SAFELIST | Safelist.add_token ethereum [0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48](https://eth.blockscout.com/token/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48) | real USDC (CANONICAL case C7 is OFFICIAL) | added | added | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0xc0ab61870526fa2c28c208fb7b468e420ffe6eb8c901e3bd95bf38e1a9b00aa0) |
| S2 | SAFELIST | Safelist.add_token arbitrum [0x8Fd886c4021ed69a968f6966F818e476868B00eD](https://arbitrum.blockscout.com/token/0x8Fd886c4021ed69a968f6966F818e476868B00eD) | the C5 fake | refused: IMPERSONATOR | refused: IMPERSONATOR | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0xbd39f05076ecfe146f5de90650649ff8469313471d5d3ca0b487829bc604fa87) |
| S3 | SAFELIST | Safelist.add_token arbitrum [0x35E57438a1348e3441501d5F4ea892Bc81009511](https://arbitrum.blockscout.com/token/0x35E57438a1348e3441501d5F4ea892Bc81009511) | a fake nobody has flagged yet (byte-identical to C3): the list has no reason to refuse it | added | added | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0x4801aced3dfc905adae1dfa1ec7990ac62053ddb0b6aec5939685b3847a956eb) |
| C13 | CANONICAL | flag arbitrum [0x35E57438a1348e3441501d5F4ea892Bc81009511](https://arbitrum.blockscout.com/token/0x35E57438a1348e3441501d5F4ea892Bc81009511) vs `usd-coin` | the same fake, flagged after it was listed | IMPERSONATOR/HOMOGLYPH | IMPERSONATOR/HOMOGLYPH | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0xeb9ff43c313ba5c20ad418f5eb0734a8279abd5a39be00f6f6da8e827dd80b92) |
| S4 | SAFELIST | Safelist.prune arbitrum [0x35E57438a1348e3441501d5F4ea892Bc81009511](https://arbitrum.blockscout.com/token/0x35E57438a1348e3441501d5F4ea892Bc81009511), sent by another account | a different account prunes it now that the register rules it an IMPERSONATOR | pruned | pruned | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0x97b619ad5f2be5b5bf72abeea5ad655e62482154c70ec650d976be721d15f148) |
| D1 | DEMO | flag base [0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48](https://base.blockscout.com/token/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48) vs `usd-coin` | the Ethereum USDC address on Base: no contract there (eth_getCode is empty), so the evidence fails | PENDING | PENDING | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0xe2504da5c722fc8aa940466d1d8ee29d4f30f7abf7ff22d859e1911262f1c233) |
| D2 | DEMO | rule(case 1) | anyone retries before the 5-minute deadline; still no contract | PENDING | PENDING | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0xcf8addecfcac1457929b1e69cb3ce12ebfdf1636a4db0e30289b7f60ede7d1bd) |
| D3 | DEMO | flag arbitrum [0x8Fd886c4021ed69a968f6966F818e476868B00eD](https://arbitrum.blockscout.com/token/0x8Fd886c4021ed69a968f6966F818e476868B00eD) vs `usd-coin` | exact copy, to be rechecked | IMPERSONATOR/LISTED_COPY | IMPERSONATOR/LISTED_COPY | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0x07f8f915d2b8e3177a22346795750d96acd0e021ad563d403eb06ef204fe1091) |
| D4 | DEMO | recheck(case 2) | recheck right away | refused: recheck cooldown has not passed | refused: recheck cooldown has not passed | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0x68ce1b2bdf134d2a12b4461582de8e706120f79b79f1a84bed7fec0fc9e0bac8) |
| D5 | DEMO | recheck(case 2) | after the 3-minute cooldown; history keeps the first ruling | IMPERSONATOR/LISTED_COPY | IMPERSONATOR/LISTED_COPY | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0x44abec9d2a1caf8f2fc8e96bd14863924eedc579b6d90961e60c02174e3f989d) |
| D6 | DEMO | expire(case 1) | after the 5-minute rule window | EXPIRED | EXPIRED | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0x13418c1095f2e95653fcb26b56671ff091db54621e93a94f4cb7fcfabb937f8a) |
| D7 | DEMO | flag base [0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48](https://base.blockscout.com/token/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48) vs `usd-coin` | the same key flagged again after EXPIRED: a new case (still no contract at that address on Base) | PENDING | PENDING | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0x0b6a789678248d9bb825a0679019e39a4003f4995d155fe2311ebdc4bc79a433) |

### MODEL cases, each judged twice (DEMO)

Each case was flagged (run 1) and rechecked after the 3-minute cooldown (run 2). In a MODEL run every validator asked the model itself and they had to agree on one label. M3 is the fake that used to reach the model; it is now decided by code both times.

| Case | Token | What it is | Expected | Run 1 | Run 2 | Runs agree |
|---|---|---|---|---|---|---|
| M1 (DEMO case 3) | [0xEB466342C4d449BC9f53A865D5Cb90586f405215](https://arbitrum.blockscout.com/token/0xEB466342C4d449BC9f53A865D5Cb90586f405215) | 'Axelar Wrapped USDC' / 'axlUSDC' | VARIANT/MODEL | VARIANT/MODEL ([tx](https://explorer-studio-dev.genlayer.com/tx/0x13f06797f5ef489ad2eddf99d8203d406910b8f5efddecc0a18a58ead3941399)) | VARIANT/MODEL ([tx](https://explorer-studio-dev.genlayer.com/tx/0x0603003b3d0596ee49030d7facef70065bd887db101e02c314e47e9428cbd714)) | same |
| M2 (DEMO case 4) | [0xBc65ad17c5C0a2A4D159fa5a503f4992c7B545FE](https://eth.blockscout.com/token/0xBc65ad17c5C0a2A4D159fa5a503f4992c7B545FE) | 'Spark USDC Vault' / 'sUSDC' | UNRELATED/MODEL | UNRELATED/MODEL ([tx](https://explorer-studio-dev.genlayer.com/tx/0x1a6cd49b95fab5b8145aeedebb39b4fdee24940d230a2030e91ed63109009e81)) | UNRELATED/MODEL ([tx](https://explorer-studio-dev.genlayer.com/tx/0xbae42746444844c8f846718e7a83602564320227a6e49d354eae0ace88c8c367)) | same |
| M3 (DEMO case 5) | [0xE3F520d5C6f5421eE02160242f7a9e025d829E3e](https://arbitrum.blockscout.com/token/0xE3F520d5C6f5421eE02160242f7a9e025d829E3e) | real fake: 'Bridged USDC' / 'USDC.e' padded with invisible characters (now decided by code, no model call) | IMPERSONATOR/HOMOGLYPH | IMPERSONATOR/HOMOGLYPH ([tx](https://explorer-studio-dev.genlayer.com/tx/0xec4625ef5aa30458df59934a656728b6237b684ec546ecc5146141fc29d6dd5e)) | IMPERSONATOR/HOMOGLYPH ([tx](https://explorer-studio-dev.genlayer.com/tx/0xdb3e2bf8f0eb506e8573b1b1a2c95508c7f269ac9e510c298efd9fc947b6c7b4)) | same |
| M4 (DEMO case 7) | [0xB67c014FA700E69681a673876eb8BAFAA36BFf71](https://arbitrum.blockscout.com/token/0xB67c014FA700E69681a673876eb8BAFAA36BFf71) | 'Hop USDC LP Token' / 'HOP-LP-USDC' | UNRELATED/MODEL | UNRELATED/MODEL ([tx](https://explorer-studio-dev.genlayer.com/tx/0xb94079965c756eac467a87a8bd99636588a00742002200f484904c21ebc1672d)) | UNRELATED/MODEL ([tx](https://explorer-studio-dev.genlayer.com/tx/0x4ad2073c72697336ce3c05e415de13064454ac1cedd99e0528722f5d6a5f12be)) | same |

Notes:

- **H10 needed a retry.** Its first flag stayed PENDING because the official list could not be read in that transaction (the agreed evidence was `"FAIL"`). A `rule()` call, which anyone can make before the deadline, then ruled it LISTED_COPY. That is the designed recovery path.
- **D1 and D7** flag the Ethereum USDC address on Base, where no contract exists, so the case stays PENDING. D2, D6 and D7 show `rule`, `expire` and re-flagging.
- **C12** shows the coverage gate: Tether on Base is refused.
- **S3, C13 and S4** show a fake that was listed before anyone flagged it, then pruned by another account once the register ruled it an impersonator.


## Known limits

- **Unlisted legitimate bridges that reuse a listed label are ruled IMPERSONATOR.** This is intended. Wormhole's USDC bridged from Solana, `0x41f7B8b9b897276b7AAE926a9016935280b44E97` on Ethereum, says exactly `USD Coin` / `USDC` on chain and is not on the Uniswap list, so rule 3 rules it LISTED_COPY. To a wallet user it shows as USDC and is not USDC's listed address, which is exactly the definition. The register cannot see bridge origin. If the list adds it, `recheck` clears it: it then matches rule 2 or 2b.
- **A fake of an unlisted product cannot be told from the real one.** axlUSDC is not on the Uniswap list. A fake `Axelar Bridged USDC` / `AXLUSDC` (for example `0xFDdaFC5258AB4F05b0D0dA8DC019a9B3Cd1C7F09` on Arbitrum) produces the same evidence as the real `0xEB466342C4d449BC9f53A865D5Cb90586f405215`, so every rule, and the model, treats both alike. Separating them needs a second official source that lists axlUSDC.
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
- `test/test_logic.py`, `test/world.py`, `test/stub.py`: offline suite with fake JSON-RPC chains, a scripted list and model, and the register's invariants checked after every call; it includes the escape routes A-G found after seed M3, each with the real token that used it
- `test/deploy.mjs` deploys from the committed HEAD and refuses if the working copy differs; `test/seed_lookalike.mjs` runs the seeds; `test/verify_source.mjs` checks the on-chain source against git
- `docs/THREAT_MODEL.md`, `docs/DECISIONS.md`, `docs/PROBE.md`, `docs/COVERAGE.md`, `docs/SEEDS.md`, `docs/seed-evidence.json`; earlier deployments are kept in `docs/superseded/v1/` (before hardening) and `docs/superseded/v2/` (before LISTED_COPY)
