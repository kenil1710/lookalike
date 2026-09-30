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

### What IMPERSONATOR means

**IMPERSONATOR: the token presents itself as coin X on this chain but is not X's listed address there.** It describes how the token looks to a wallet user (its on-chain name and symbol), not proof of intent. The other labels are VARIANT (openly labelled as a bridged or wrapped version of X), UNRELATED (does not present itself as X), OFFICIAL (X's listed address on this chain), PENDING and EXPIRED.

### The rules

Every name and symbol is first reduced to a **skeleton**, built from the full string: NFKC normalisation, accents and combining marks removed, invisible and bidi characters removed, Cyrillic and Greek look-alike letters mapped to Latin, upper-cased, only `A-Z0-9` kept. `UЅDС`, `ＵＳＤＣ` and `U` + U+FEFF + `SDC` all have the skeleton `USDC`.

The first rule that fits decides, and the contract stores which one as `basis`:

| # | Basis | Condition | Result |
|---|---|---|---|
| 1 | `NOT_ERC20` | the contract does not answer `name()`, `symbol()` and `decimals()` like an ERC-20, or reports an NFT interface | UNRELATED |
| 2 | `OFFICIAL_LIST` | the list has an entry with **this chainId and this address** under the coin's symbol | OFFICIAL |
| 2b | `LISTED_VARIANT` / `LISTED_OTHER` | the list carries this exact chainId and address as a **different** asset (bridged USDC.e says `USD Coin (Arb1)` / `USDC` on chain, and the list calls it `USDC.e`) | VARIANT if the list's own symbol or name carries the coin, else UNRELATED |
| 3 | `NO_BRAND_MATCH` | neither skeleton contains the coin's symbol or name, not even with digit look-alikes read as letters, and there is no character the code cannot read | UNRELATED |
| 4 | `HOMOGLYPH` | the symbol skeleton **is** the coin's symbol (or the name skeleton is the coin's name) **and** the raw text holds a disguise: a look-alike letter, an invisible or bidi character, a combining mark or accent, a full-width form. Applies even if the name says "Bridged". | IMPERSONATOR |
| 5 | `EXACT_COPY` | the symbol skeleton is exactly the coin's symbol, there is no bridge/wrap disclosure word (`BRIDGED BRIDGE POS WORMHOLE STARGATE AXELAR CELER MULTICHAIN PORTAL LAYERZERO OFT SYNAPSE HOP ACROSS`, or a `.e` symbol suffix), and no character the code cannot read | IMPERSONATOR |
| 6 | `MODEL` | everything else | IMPERSONATOR, VARIANT or UNRELATED |

Rules 4 and 5 only apply when the coin has an official entry on that chain. If a covered pair's entry has disappeared from the list, the case waits as PENDING instead.

### What the code decides

Rules 1 to 5 are plain code over agreed evidence:
- not a token;
- on the official list (bound to this chainId and address);
- on the list as another asset;
- no brand in the name;
- a disguised copy;
- a plain copy.

Official tokens are checked before any brand rule, so the real USDC can never be called an impersonator of USDC.

### What the model decides

Only rule-6 names: ones that carry the brand but are not a plain copy. Examples: `Axelar Wrapped USDC` / `axlUSDC`, `Spark USDC Vault` / `sUSDC`, a `Bridged USDC` / `USDC.e` padded with invisible characters, a name in another script, or a digit look-alike like `U5DC`.

It is asked one question: *does this token present itself as the coin (IMPERSONATOR), is it openly labelled as a bridged or wrapped version (VARIANT), or is it something else (UNRELATED)?* It is given:
- the chain;
- the raw name and symbol as JSON-escaped untrusted data;
- their skeletons and digit-folded readings;
- whether the text hides characters or uses other scripts;
- the coin's name and symbol;
- the disclosure words found;
- whether the coin has an official deployment on that chain.

The prompt says any instruction inside the token name is ignored. Each validator asks the model itself, and they must return the same single label. Any other answer leaves the case PENDING.

### What the model never decides

- Whether a token is **official**. That is only the list entry at the case's own chainId and address.
- Whether a token is a **listed bridged variant** (rule 2b). That is the list's own entry.
- Whether a contract is an **ERC-20** at all. That is the chain's answers to `name()`, `symbol()`, `decimals()` and `supportsInterface`.
- Any case where the **evidence could not be read**. Nothing is asked; the case waits.
- Any **uncovered (coin, chain) pair**. Refused before anything is fetched.
- **Precedent** flags (below). Byte comparison only.
- A **real coin missing from the list**. It can never reach IMPERSONATOR: uncovered pairs are refused, and a covered pair with no entry is an evidence failure before any rule or model runs.
- **What is stored.** Only the agreed evidence and one of three labels are stored, never free text from the model or anything the leader alone produced.

### Other methods

- `flag_by_precedent(chain, tokens[≤5], precedent_id)`: address-poisoning campaigns deploy many byte-identical copies. The precedent must be a case ruled IMPERSONATOR by HOMOGLYPH, EXACT_COPY or MODEL, never one that was itself flagged by precedent. Each listed token is then ruled IMPERSONATOR with basis `PRECEDENT` only if:
  - its on-chain name, symbol and decimals are identical to the precedent's;
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
| **CANONICAL** | the register: rule window 6 h, recheck cooldown 1 h. All real-token rulings. | [`0xA46276c6F0C151D1DB645239bd0190325d0C3177`](https://explorer-studio-dev.genlayer.com/address/0xA46276c6F0C151D1DB645239bd0190325d0C3177) | [deploy tx](https://explorer-studio-dev.genlayer.com/tx/0xfe4d91e2d41200775d7d476f7925491503aa5531c93e24a8ff029cd22ec3ad68) |
| **DEMO** | the same file with rule window 5 min and recheck cooldown 3 min, for the time-based paths (expire, re-flag, recheck) and the MODEL cases judged twice | [`0xeE89132Cc5FB910d40481BE8CD01ac04aA7299fc`](https://explorer-studio-dev.genlayer.com/address/0xeE89132Cc5FB910d40481BE8CD01ac04aA7299fc) | [deploy tx](https://explorer-studio-dev.genlayer.com/tx/0x3eb08c7a45d6ef4660865793da17fefa8ba5fca77c8093201aa206fc21d791c0) |
| **SAFELIST** | the consumer token list, reading CANONICAL | [`0xFF66Ca6d86be7Aa9e1848ba932e2BaA492BCA49b`](https://explorer-studio-dev.genlayer.com/address/0xFF66Ca6d86be7Aa9e1848ba932e2BaA492BCA49b) | [deploy tx](https://explorer-studio-dev.genlayer.com/tx/0x70d38dca1a41172bda8ec14ae49086f49f6439bcee3031286e916f032a1f8376) |

CANONICAL and DEMO are the same bytes: `contracts/lookalike.py`, sha256 `f9582556ee73d87f63f9c16f4548ec8daedfbc7f8505ca7eb7d39be458d32fda`. `contracts/safelist.py` has sha256 `f3d3a3f6d5dadd1068c0d82092edfdc0be6b412e8ff343fcee2c6c8f9527c3be`.

- Deployed from commit `ab17aa74dbca43b4c0e259cf70f3b747bf5b0364`.
- The source read back from the chain (`gen_getContractCode`) is byte-identical to that commit for all three contracts (`test/verify_source.mjs`).
- Details are in [ADDRESSES.md](ADDRESSES.md).

## Seed results

Real tokens, real transactions, read from each token's own chain. Full tx hashes, case JSON and histories are in [docs/SEEDS.md](docs/SEEDS.md) and [docs/seed-evidence.json](docs/seed-evidence.json).

| Step | Instance | Call | Token | Expected | Actual | Match | Explorer |
|---|---|---|---|---|---|---|---|
| C1 | CANONICAL | flag arbitrum [0xEbb993F7C5477016A0a025A790Dd079dfe3Eca9D](https://arbitrum.blockscout.com/token/0xEbb993F7C5477016A0a025A790Dd079dfe3Eca9D) vs `usd-coin` | on chain: 'USD Coin' / 'USDC' with Cyrillic ES and o plus invisible U+206B, U+FEFF, U+200B | IMPERSONATOR/HOMOGLYPH | IMPERSONATOR/HOMOGLYPH | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0xbd4379c13082d2016696da772e63daa05ab42b1d9b3467a4a3f3a326f4c14cc6) |
| C2 | CANONICAL | flag arbitrum [0xdaECe7e93993394063a01BB39145A7d71d4df8f1](https://arbitrum.blockscout.com/token/0xdaECe7e93993394063a01BB39145A7d71d4df8f1) vs `usd-coin` | 'U+FEFF SD Coin' / 'U+FEFF SDC': byte-order mark inside | IMPERSONATOR/HOMOGLYPH | IMPERSONATOR/HOMOGLYPH | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0xfb0e08c901d898f54a73dbf82d7226e7b599865b427d20530062f64353a40a34) |
| C3 | CANONICAL | flag arbitrum [0x72224ea851b18d56065E7ebe355a246A66F5ce2E](https://arbitrum.blockscout.com/token/0x72224ea851b18d56065E7ebe355a246A66F5ce2E) vs `usd-coin` | 'USD Coin' / 'U U+206F SD U+200D C' | IMPERSONATOR/HOMOGLYPH | IMPERSONATOR/HOMOGLYPH | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0x714a7792df3f5115f7bfb6c8088cad387fb59149ea4b588db941fdaa9326f006) |
| C4 | CANONICAL | flag arbitrum [0x2790AfA96A254142a13C24A7BE2C35afC784b82a](https://arbitrum.blockscout.com/token/0x2790AfA96A254142a13C24A7BE2C35afC784b82a) vs `tether` | 'Tet U+FEFF her USD' / 'U U+200C SDT' | IMPERSONATOR/HOMOGLYPH | IMPERSONATOR/HOMOGLYPH | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0xd90d123dea35182cfd869b7a10911035891859ecfcbfac41285219d6942030bc) |
| C5 | CANONICAL | flag arbitrum [0x8Fd886c4021ed69a968f6966F818e476868B00eD](https://arbitrum.blockscout.com/token/0x8Fd886c4021ed69a968f6966F818e476868B00eD) vs `usd-coin` | 'USDC' / 'USDC', 6 decimals, not the official Arbitrum USDC | IMPERSONATOR/EXACT_COPY | IMPERSONATOR/EXACT_COPY | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0x90b05c2e984093e493d5c8d591f6926b9c01b13acaefcf54681204f7330703ce) |
| C6 | CANONICAL | flag arbitrum [0x413f1661a78A9675C95E33D63b0c90DBD747c43B](https://arbitrum.blockscout.com/token/0x413f1661a78A9675C95E33D63b0c90DBD747c43B) vs `tether` | 'USDT' / 'USDT' on Arbitrum (the official Tether there is USDT0) | IMPERSONATOR/EXACT_COPY | IMPERSONATOR/EXACT_COPY | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0xf62f7ad9e6594ba4c8bd314b04e9882ce2fb7c12cfeb1074af84022796d36f14) |
| C7 | CANONICAL | flag ethereum [0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48](https://eth.blockscout.com/token/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48) vs `usd-coin` | real USDC on Ethereum | OFFICIAL/OFFICIAL_LIST | OFFICIAL/OFFICIAL_LIST | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0x338d3e5ef7be408cded3f883ffe0456344a6b372de08cd435cf8fe4bc69ebceb) |
| C8 | CANONICAL | flag arbitrum [0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8](https://arbitrum.blockscout.com/token/0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8) vs `usd-coin` | real bridged USDC.e: on chain it says 'USD Coin (Arb1)' / 'USDC'; the list carries this address as USDC.e 'Bridged USDC' | VARIANT/LISTED_VARIANT | VARIANT/LISTED_VARIANT | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0xdcec5d681d83e93ccaca787e67c24846769f2b34c8a1606b1ce03d760246c211) |
| C9 | CANONICAL | flag arbitrum [0xEB466342C4d449BC9f53A865D5Cb90586f405215](https://arbitrum.blockscout.com/token/0xEB466342C4d449BC9f53A865D5Cb90586f405215) vs `usd-coin` | 'Axelar Wrapped USDC' / 'axlUSDC', not on the list | VARIANT/MODEL | VARIANT/MODEL | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0xeb8d6f5cf3abcc3919cdd7852ed89024fd80f880d01be7ed6000a5552b0bbe58) |
| C10 | CANONICAL | flag ethereum [0xdC035D45d973E3EC169d2276DDab16f1e407384F](https://eth.blockscout.com/token/0xdC035D45d973E3EC169d2276DDab16f1e407384F) vs `usd-coin` | Sky 'USDS Stablecoin' / 'USDS': a different dollar token | UNRELATED/NO_BRAND_MATCH | UNRELATED/LISTED_OTHER | **no**, see below | [tx](https://explorer-studio-dev.genlayer.com/tx/0x46d2bfb5c3b4a7cf4dfea0985839a256f4bafede2323bba7e807954a437e15ff) |
| C11 | CANONICAL | flag_by_precedent: 5 byte-identical copies of C5 (addresses in [SEEDS.md](docs/SEEDS.md)) | five more 'USDC' / 'USDC' / 6-decimal copies, byte-identical to C5 | 5 x IMPERSONATOR/PRECEDENT | 5 x IMPERSONATOR/PRECEDENT | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0xae5d30a48f89e726db16e1b78525fd0151621853cb6e56cad78c542e20a22c8f) |
| C12 | CANONICAL | flag base [0x07f3c9Ba9a0C06204C8489B62291d5B0e77615A1](https://base.blockscout.com/token/0x07f3c9Ba9a0C06204C8489B62291d5B0e77615A1) vs `tether` | a 'Tether USD' copy on Base: the list has no Tether on Base, so the pair is refused | refused: the official list does not cover this coin on this chain | refused: the official list does not cover this coin on this chain | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0x27e3935642e22e489e95b2108c7a5ee98a96b3bc2588992dc5507ca6734442c7) |
| S1 | SAFELIST | Safelist.add_token ethereum [0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48](https://eth.blockscout.com/token/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48) | real USDC (CANONICAL case C7 is OFFICIAL) | added | added | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0xea0fcc539659cd9d2baa7bc27d86583c96ede4e29b2a2870ae1a83927b65ebfb) |
| S2 | SAFELIST | Safelist.add_token arbitrum [0x8Fd886c4021ed69a968f6966F818e476868B00eD](https://arbitrum.blockscout.com/token/0x8Fd886c4021ed69a968f6966F818e476868B00eD) | the C5 fake | refused: IMPERSONATOR | refused: IMPERSONATOR | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0xc24ca6249cf662d604e22687b7be1797855a136e7bea9ed03fe14095825ff313) |
| S3 | SAFELIST | Safelist.add_token arbitrum [0x35E57438a1348e3441501d5F4ea892Bc81009511](https://arbitrum.blockscout.com/token/0x35E57438a1348e3441501d5F4ea892Bc81009511) | a fake nobody has flagged yet (byte-identical to C3): the list has no reason to refuse it | added | added | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0xed3b62defc4eeb03f3bc5dfee3b648ef4dac8a61918a8feb356ea7e3b996c4f6) |
| C13 | CANONICAL | flag arbitrum [0x35E57438a1348e3441501d5F4ea892Bc81009511](https://arbitrum.blockscout.com/token/0x35E57438a1348e3441501d5F4ea892Bc81009511) vs `usd-coin` | the same fake, flagged after it was listed | IMPERSONATOR/HOMOGLYPH | IMPERSONATOR/HOMOGLYPH | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0x8b4a086bbdd434e82746261b7fb35cd75735396b095a5d042503916f7cd62a6f) |
| S4 | SAFELIST | Safelist.prune arbitrum [0x35E57438a1348e3441501d5F4ea892Bc81009511](https://arbitrum.blockscout.com/token/0x35E57438a1348e3441501d5F4ea892Bc81009511), sent by another account | a different account prunes it now that the register rules it an IMPERSONATOR | pruned | pruned | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0xd67de9d9d30c5b83a626c0a5ddd00c0e066a9f23f244637a4b68bed1055d5b94) |
| D1 | DEMO | flag base [0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48](https://base.blockscout.com/token/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48) vs `usd-coin` | the Ethereum USDC address on Base: no contract there (eth_getCode is empty), so the evidence fails | PENDING | PENDING | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0xebb058f154e00910413ab765360503c0ba58a7038d028b2d07399d3a7b2a2df7) |
| D2 | DEMO | rule(case 1) | anyone retries before the 5-minute deadline; still no contract | PENDING | PENDING | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0xe9c639b67dc020e4fd061d0425c8ba6393a4252cfa9faba52c5e1705a724f0ac) |
| D3 | DEMO | flag arbitrum [0x8Fd886c4021ed69a968f6966F818e476868B00eD](https://arbitrum.blockscout.com/token/0x8Fd886c4021ed69a968f6966F818e476868B00eD) vs `usd-coin` | exact copy, to be rechecked | IMPERSONATOR/EXACT_COPY | IMPERSONATOR/EXACT_COPY | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0x67af44613650713346ac2da9d72c184d5c3b9bf9d504926d038b04c8421981b4) |
| D4 | DEMO | recheck(case 2) | recheck right away | refused: recheck cooldown has not passed | refused: recheck cooldown has not passed | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0xfb998cda5d3f864b59a6fb6d8e01aad6dd08e562cc5cb83f433b034135765627) |
| D5 | DEMO | recheck(case 2) | after the 3-minute cooldown; history keeps the first ruling | IMPERSONATOR/EXACT_COPY | IMPERSONATOR/EXACT_COPY | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0xf0497728439b6c4a274d69e9c87f431f72b145a5e5233e39ef113f68fcbfb9ec) |
| D6 | DEMO | expire(case 1) | after the 5-minute rule window | EXPIRED | EXPIRED | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0x31f7aa938271bb7a716c8e20b50332eadab820844475002025824cd364781dbb) |
| D7 | DEMO | flag base [0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48](https://base.blockscout.com/token/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48) vs `usd-coin` | the same key flagged again after EXPIRED: a new case (still no contract at that address on Base) | PENDING | PENDING | yes | [tx](https://explorer-studio-dev.genlayer.com/tx/0x99477ee7542ffc55a8578fce480e4d44f7a3fe0938500339db4bf4e9ba06e275) |

### MODEL cases, each judged twice (DEMO)

Each case was flagged (run 1) and rechecked after the 3-minute cooldown (run 2). In every run all validators asked the model themselves and had to agree on one label.

| Case | Token | What it is | Expected | Run 1 | Run 2 | Runs agree |
|---|---|---|---|---|---|---|
| M1 (DEMO case 3) | arbitrum [0xEB466342C4d449BC9f53A865D5Cb90586f405215](https://arbitrum.blockscout.com/token/0xEB466342C4d449BC9f53A865D5Cb90586f405215) | 'Axelar Wrapped USDC' / 'axlUSDC' | VARIANT/MODEL | VARIANT/MODEL ([tx](https://explorer-studio-dev.genlayer.com/tx/0x78dbf67739d3dc67ad14ab441480830e6b798bbf7142042c0608e9fe5601f3e9)) | VARIANT/MODEL ([tx](https://explorer-studio-dev.genlayer.com/tx/0x5a9e48e8cf1ccd539caee9d5e0dc366616ac711bae39e6e60fb7198e9901a996)) | same |
| M2 (DEMO case 4) | ethereum [0xBc65ad17c5C0a2A4D159fa5a503f4992c7B545FE](https://eth.blockscout.com/token/0xBc65ad17c5C0a2A4D159fa5a503f4992c7B545FE) | 'Spark USDC Vault' / 'sUSDC' | UNRELATED/MODEL | UNRELATED/MODEL ([tx](https://explorer-studio-dev.genlayer.com/tx/0x99ce236f027e3aaef7ad5a5f2c180f2389a2154060934c806d12e68466436454)) | UNRELATED/MODEL ([tx](https://explorer-studio-dev.genlayer.com/tx/0xbf12a69177ad1dd5155b703a6a5e8bdf255795996c16343df7bc3c05c6b37045)) | same |
| M3 (DEMO case 5) | arbitrum [0xE3F520d5C6f5421eE02160242f7a9e025d829E3e](https://arbitrum.blockscout.com/token/0xE3F520d5C6f5421eE02160242f7a9e025d829E3e) | real fake: 'Bridged USDC' / 'USDC.e' padded with invisible characters | IMPERSONATOR/MODEL | VARIANT/MODEL ([tx](https://explorer-studio-dev.genlayer.com/tx/0xcdb9ed9e32b734ba2956c373a177df006ecbaf39604c6234df2e2d318f314df9)) | VARIANT/MODEL ([tx](https://explorer-studio-dev.genlayer.com/tx/0xbbf87a4ec668814b4570c064b9a19200d8b2841340221b737c84a86499541c69)) | same |

### Where actual differed from expected

- **C10:** USDS is on the Uniswap default list on Ethereum (as USDS, 'USDS Stablecoin'), so rule 2b (LISTED_OTHER) decides it before rule 3 would. The outcome, UNRELATED, is as expected; the basis expectation was written before rule 2b existed. No contract change.
- **M3 / M3r:** The model ruled this real fake ('Bridged USDC' / 'USDC.e' padded with invisible characters) VARIANT, and ruled it VARIANT again on recheck (M3r). Validators agreed each time. Its symbol skeleton is USDCE, not USDC, so rule 4 does not apply; the name openly says 'Bridged', which fits the VARIANT definition. IMPERSONATOR was my expectation. Hidden characters inside a disclosed bridge name are left to the model (README, known limits).

Notes on the other steps:

- D1 and D7 flag the Ethereum USDC address on Base, where no contract exists (`eth_getCode` is empty). The evidence fails, so the case stays PENDING. D2, D6 and D7 show `rule`, `expire` and re-flagging.
- C12 shows the coverage gate: Tether on Base is refused before anything is fetched.
- S3, C13 and S4 show a fake that was listed before anyone flagged it, then pruned by another account once the register ruled it an impersonator.


## Known limits

- **Name and symbol only.** The register judges what a token calls itself. A scam token with an original name, a copied logo, or a malicious contract behind an honest name is out of scope.
- **Wormhole USDC on Ethereum would be ruled IMPERSONATOR.** `0x41f7B8b9b897276b7AAE926a9016935280b44E97` is Wormhole's USDC bridged from Solana (Blockscout labels it "USD Coin (Portal from Solana)"). On chain its `name()` and `symbol()` are exactly `USD Coin` / `USDC`, and the Uniswap list does not carry it, so rule 5 rules it EXACT_COPY. By the definition above that is accurate (to a wallet user it looks like USDC and is not USDC's listed address), but it is a legitimate bridge token, not a scam. The register cannot see bridge origin. It is not seeded.
- **What the chain says is what counts.** A token that renames itself is only re-judged when someone calls `recheck`.
- **One public RPC endpoint per chain.** If it is down or rate-limited, cases stay PENDING until someone retries.
- **OFFICIAL is the Uniswap default list's view.** Pairs the list does not cover (Tether and WBTC on Base, and USDe everywhere) cannot be flagged. CoinGecko was the intended source; from GenLayer validators it answered HTTP 429 on every call (docs/PROBE.md), so it could not be used without an API key.
- **Not a safety badge.** IMPERSONATOR means "presents itself as the coin and is not on its official list". UNRELATED, VARIANT and "no case" say nothing about whether a token is harmless.
- **A disguised name that openly says "Bridged" is left to the model.** The real fake `0xE3F520d5C6f5421eE02160242f7a9e025d829E3e` on Arbitrum (`Bridged USDC` / `USDC.e` padded with invisible characters) has the symbol skeleton `USDCE`, not `USDC`, so rule 4 does not apply. The model ruled it VARIANT, twice. By the definitions, a token that openly labels itself bridged is a VARIANT, whatever its invisible characters.
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
- `test/test_logic.py`, `test/world.py`, `test/stub.py`: offline suite with fake JSON-RPC chains, a scripted list and model, and the register's invariants checked after every call
- `test/deploy.mjs` deploys from the committed HEAD and refuses if the working copy differs; `test/seed_lookalike.mjs` runs the seeds; `test/verify_source.mjs` checks the on-chain source against git
- `docs/THREAT_MODEL.md`, `docs/DECISIONS.md`, `docs/PROBE.md`, `docs/COVERAGE.md`, `docs/SEEDS.md`, `docs/seed-evidence.json`; the first (pre-hardening) deployment is kept in `docs/superseded/v1/`
