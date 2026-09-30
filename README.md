# Lookalike

A public, on-chain register of ERC-20 tokens that impersonate a known coin.

## The problem

Address-poisoning scams deploy tokens named `USDC` or `Tether USD` and airdrop them to thousands of wallets, so the fake shows up in a victim's transfer history next to the real thing. Many fakes hide the trick in the text itself: a Cyrillic `С` instead of a Latin `C`, a byte-order mark inside `U\ufeffSDC`, full-width letters, or a dozen invisible format characters. On Arbitrum alone, Blockscout's search for "USDC" returns fakes like these with 15,000 to 48,000 holders each.

Wallets, DEX token lists and other contracts need one question answered before they show or accept a token: *does this token present itself as a coin it is not?* Lookalike answers it on chain, with evidence anyone can re-read, and without anyone owning the answer.

## How it works

Anyone calls `flag(chain, token, coin_id)`. In one strict-equality block, every GenLayer validator reads, itself:

- the token's `name`, `symbol`, `decimals` and `type` from that chain's Blockscout explorer, and
- the coin's official addresses on that chain from the Uniswap default token list (`tokens.uniswap.org`).

Validators must agree on that evidence byte for byte (a canonical JSON; volatile fields such as holder counts and prices are never part of it). A leader cannot hand the others evidence: each validator fetches its own copy and compares. If a source is down, returns 404 or returns something that is not JSON, the case simply stays `PENDING`; anyone can retry with `rule(case_id)` until the deadline, after which anyone can `expire` it and the token can be flagged again.

Chains: ethereum, base, arbitrum, optimism, polygon. Coins: `usd-coin`, `tether`, `weth`, `dai`, `wrapped-bitcoin`. Both tables, the time windows and the batch limit are frozen in the constructor. There is no owner, no setter, no fee to the register and no money in it.

### The six rules

Before the rules, every name and symbol is reduced to a **skeleton**: NFKC normalisation, invisible characters removed, Cyrillic and Greek look-alike letters mapped to Latin, upper-cased, only `A-Z0-9` kept. `UЅDС`, `ＵＳＤＣ` and `U\ufeffSDC` all have the skeleton `USDC`.

The first rule that fits decides, and the contract stores which one as `basis`:

| # | Basis | Condition | Result |
|---|---|---|---|
| 1 | `NOT_ERC20` | Blockscout type is not ERC-20 | UNRELATED |
| 2 | `OFFICIAL_LIST` | the token is on the coin's official list for that chain | OFFICIAL |
| 3 | `NO_BRAND_MATCH` | neither skeleton contains the coin's symbol, and the name skeleton does not contain the coin's name | UNRELATED |
| 4 | `HOMOGLYPH` | the symbol skeleton **is** the coin's symbol (or the name skeleton is the coin's name) **and** the raw text holds a look-alike letter, an invisible character or a full-width form. Applies even if the name says "Bridged". | IMPERSONATOR |
| 5 | `EXACT_COPY` | the symbol skeleton is exactly the coin's symbol and there is no bridge/wrap disclosure word (`BRIDGED BRIDGE POS WORMHOLE STARGATE AXELAR CELER MULTICHAIN PORTAL LAYERZERO OFT SYNAPSE HOP ACROSS`, or a `.e` symbol suffix) | IMPERSONATOR |
| 6 | `MODEL` | everything else | IMPERSONATOR, VARIANT or UNRELATED |

### What the code decides and what the model decides

The code decides rules 1 to 5: not a token, on the official list, no brand in the name, a disguised copy, a plain copy. Official tokens are checked before any brand rule, so the real USDC can never be called an impersonator of USDC.

The model only sees rule-6 names: ones that carry the brand but are not a plain copy, such as `Arbitrum Bridged USDC (Arbitrum)` / `USDC.E`, `Spark USDC`, `USDC Official`. It is asked one question, *does this token present itself as the coin (IMPERSONATOR), is it openly labelled as a bridged or wrapped version (VARIANT), or is it something else (UNRELATED)?*, given: the chain, the raw name and symbol as JSON-escaped untrusted data, their skeletons, whether the text hides characters, the coin's name and symbol, the disclosure words found, and whether the coin has an official deployment on that chain. The prompt says any instruction inside the token name is ignored. Each validator asks the model itself and they must return the same single label; any other answer leaves the case PENDING.

### Other methods

- `flag_by_precedent(chain, tokens[≤5], precedent_id)`: address-poisoning campaigns deploy many byte-identical copies. Given a case ruled IMPERSONATOR by HOMOGLYPH, EXACT_COPY or MODEL (never one that was itself flagged by precedent), each listed token is ruled IMPERSONATOR with basis `PRECEDENT` only if its raw name, symbol and decimals are identical to the precedent's, it is ERC-20, and it is not on the official list read in the same transaction. Non-matching tokens are skipped with a reason, not reverted. No model call.
- `recheck(case_id)`: anyone, on a ruled case, after the cooldown. Runs the full rules again (never the precedent shortcut) and appends the new ruling to the case's history; the old one is kept. If the evidence cannot be read, the current label stays.
- `expire(case_id)`: anyone, on a PENDING case after its deadline. The key becomes free again.
- Views: `get_case`, `get_status(chain, token)`, `is_impersonator(chain, token)`, `list_cases(offset, limit)`, `stats`, `get_config`.

OFFICIAL means exactly "on the Uniswap default token list for this chain under the coin's symbol, at the time of the ruling". The register never calls a token approved; it only says which tokens copy a coin.

## The consumer: Safelist

`contracts/safelist.py` is a tiny on-chain token list, the kind a DEX ships as its default list. Its curator calls `add_token(chain, token)`; before anything is stored, the contract makes a cross-contract view call to `Lookalike.is_impersonator(chain, token)` and refuses the token if the register rules it an IMPERSONATOR of any coin. The Lookalike address is fixed in its constructor. `list_tokens()` returns the list.

## Deployments (GenLayer studio-dev, chain 61997)

| Instance | What it is | Address |
|---|---|---|
| **CANONICAL** | the register: rule window 6 h, recheck cooldown 1 h. All real-token rulings. | [`0xeBA36999B79522e5A2C7436c65793168379A2993`](https://explorer-studio-dev.genlayer.com/address/0xeBA36999B79522e5A2C7436c65793168379A2993) |
| **DEMO** | the same file with rule window 5 min and recheck cooldown 3 min, for the time-based paths (expire, re-flag, recheck) | [`0x950A1c0E2D4e82DBCE16DB33e84750cC267bEC0B`](https://explorer-studio-dev.genlayer.com/address/0x950A1c0E2D4e82DBCE16DB33e84750cC267bEC0B) |
| **SAFELIST** | the consumer token list, reading CANONICAL | [`0x81C12863f346a85eE4ee5c7a4AdE27D1AD7E54CE`](https://explorer-studio-dev.genlayer.com/address/0x81C12863f346a85eE4ee5c7a4AdE27D1AD7E54CE) |

CANONICAL and DEMO are the same bytes: `contracts/lookalike.py`, sha256 `f0723c09ae7d2f1de5c336217d144777fe133069fee27b04dd1f9aaa0f845839`. `contracts/safelist.py` sha256 `b36c11b5c7b4c548d553d8892b799508510df9d2074bc64d58a4e258736cf293`. Deployed from commit `cf44d6b9e0b1534aafd35da6effdf40d44dcd669`; the source read back from the chain (`gen_getContractCode`) is byte-identical to that commit (`test/verify_onchain.mjs`). Details in [ADDRESSES.md](ADDRESSES.md).

## Seed results

Real tokens, real transactions. Every expected outcome matched. Full tx hashes, case JSON and the recheck history are in [docs/SEEDS.md](docs/SEEDS.md) and [docs/seed-evidence.json](docs/seed-evidence.json).

| Step | Instance | Call | Token | Expected | Actual | Explorer |
|---|---|---|---|---|---|---|
| C1 | CANONICAL | flag arbitrum [0xEbb993F7C5477016A0a025A790Dd079dfe3Eca9D](https://arbitrum.blockscout.com/token/0xEbb993F7C5477016A0a025A790Dd079dfe3Eca9D) vs `usd-coin` | "USD Coin" / "USDC" with Cyrillic С and о plus invisible U+206B/U+FEFF/U+200B | IMPERSONATOR/HOMOGLYPH | IMPERSONATOR/HOMOGLYPH | [tx](https://explorer-studio-dev.genlayer.com/tx/0xaaf93c6fb69fe93ace18ca1fe80ab09c545eaee8171f7305b9c546b160255d59) |
| C2 | CANONICAL | flag arbitrum [0xdaECe7e93993394063a01BB39145A7d71d4df8f1](https://arbitrum.blockscout.com/token/0xdaECe7e93993394063a01BB39145A7d71d4df8f1) vs `usd-coin` | "U+FEFF SD Coin" / "U+FEFF SDC": byte-order mark inside | IMPERSONATOR/HOMOGLYPH | IMPERSONATOR/HOMOGLYPH | [tx](https://explorer-studio-dev.genlayer.com/tx/0x7d6dcedcbf196fbee28bab61d68a30ce3bbb10070aa7453a383cbce9ed12b072) |
| C3 | CANONICAL | flag arbitrum [0x72224ea851b18d56065E7ebe355a246A66F5ce2E](https://arbitrum.blockscout.com/token/0x72224ea851b18d56065E7ebe355a246A66F5ce2E) vs `usd-coin` | "USD Coin" / "U+206F SD U+200D C" | IMPERSONATOR/HOMOGLYPH | IMPERSONATOR/HOMOGLYPH | [tx](https://explorer-studio-dev.genlayer.com/tx/0xf1145f6aa9ca0e7cfde0f47c6d1bcf83823d2476969ad7e378e319649a03ac16) |
| C4 | CANONICAL | flag arbitrum [0x2790AfA96A254142a13C24A7BE2C35afC784b82a](https://arbitrum.blockscout.com/token/0x2790AfA96A254142a13C24A7BE2C35afC784b82a) vs `tether` | "Tet U+FEFF her USD" / "U U+200C SDT" | IMPERSONATOR/HOMOGLYPH | IMPERSONATOR/HOMOGLYPH | [tx](https://explorer-studio-dev.genlayer.com/tx/0xdfa6b7e04093019534f8e1703fd62450bba92f042e915c06607edee7c5d302f1) |
| C5 | CANONICAL | flag arbitrum [0x8Fd886c4021ed69a968f6966F818e476868B00eD](https://arbitrum.blockscout.com/token/0x8Fd886c4021ed69a968f6966F818e476868B00eD) vs `usd-coin` | "USDC" / "USDC", 6 decimals, not the official Arbitrum USDC | IMPERSONATOR/EXACT_COPY | IMPERSONATOR/EXACT_COPY | [tx](https://explorer-studio-dev.genlayer.com/tx/0x0542c34e596eaac8f79e4a00f143eb1146e0d01e8dc57566609377dc8afe7224) |
| C6 | CANONICAL | flag base [0x07f3c9Ba9a0C06204C8489B62291d5B0e77615A1](https://base.blockscout.com/token/0x07f3c9Ba9a0C06204C8489B62291d5B0e77615A1) vs `tether` | "Tether USD" / "USDT" on Base, 18 decimals | IMPERSONATOR/EXACT_COPY | IMPERSONATOR/EXACT_COPY | [tx](https://explorer-studio-dev.genlayer.com/tx/0x162cdfc6051cdbb7ced506e097553a1458aed9c89d396c93c55e61590bd916de) |
| C7 | CANONICAL | flag ethereum [0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48](https://eth.blockscout.com/token/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48) vs `usd-coin` | real USDC on Ethereum | OFFICIAL/OFFICIAL_LIST | OFFICIAL/OFFICIAL_LIST | [tx](https://explorer-studio-dev.genlayer.com/tx/0xb3ac752e7b35a096bce3ce07501968005ec2a0b56f02ca0a92fbd4df38665fab) |
| C8 | CANONICAL | flag arbitrum [0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8](https://arbitrum.blockscout.com/token/0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8) vs `usd-coin` | real bridged USDC.e on Arbitrum, "Arbitrum Bridged USDC (Arbitrum)" / "USDC.E" | VARIANT/MODEL | VARIANT/MODEL | [tx](https://explorer-studio-dev.genlayer.com/tx/0x8098a4b4ec86285c7ab042761fb10932b0d2c653fb526eff5a4d84dac52afe84) |
| C9 | CANONICAL | flag ethereum [0xdC035D45d973E3EC169d2276DDab16f1e407384F](https://eth.blockscout.com/token/0xdC035D45d973E3EC169d2276DDab16f1e407384F) vs `usd-coin` | Sky "USDS" / "USDS": a different dollar token | UNRELATED/NO_BRAND_MATCH | UNRELATED/NO_BRAND_MATCH | [tx](https://explorer-studio-dev.genlayer.com/tx/0x616b4691c43d311f08bed114bda012765e70c9d72f207ba095ae81736be7d8a5) |
| C10 | CANONICAL | flag_by_precedent, 5 copies of C5 (see [SEEDS.md](docs/SEEDS.md)) | five more "USDC" / "USDC" / 6-decimal copies, byte-identical to C5 | 5 x IMPERSONATOR/PRECEDENT | 5 x IMPERSONATOR/PRECEDENT | [tx](https://explorer-studio-dev.genlayer.com/tx/0xdeaec30dde8e811cb40eff54ce9bb2937c8f46966cd8289c961e604d89d11aa0) |
| S1 | SAFELIST | Safelist.add_token ethereum [0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48](https://eth.blockscout.com/token/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48) | real USDC (CANONICAL case C7 is OFFICIAL) | added | added | [tx](https://explorer-studio-dev.genlayer.com/tx/0xed7c4f89ec999544b81ea41ede9ab1b44623a1c3b4fc17d68209f367e4b9adca) |
| S2 | SAFELIST | Safelist.add_token arbitrum [0x8Fd886c4021ed69a968f6966F818e476868B00eD](https://arbitrum.blockscout.com/token/0x8Fd886c4021ed69a968f6966F818e476868B00eD) | the C5 fake | refused: IMPERSONATOR | refused: IMPERSONATOR | [tx](https://explorer-studio-dev.genlayer.com/tx/0x8c50d6aa7f346510a6f7f527773b87a219e4d798df320dfe68660cbe261f5aff) |
| D1 | DEMO | flag base [0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48](https://base.blockscout.com/token/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48) vs `usd-coin` | the Ethereum USDC address on Base: no token there, Blockscout answers 404, so the evidence fails | PENDING | PENDING | [tx](https://explorer-studio-dev.genlayer.com/tx/0x3e664fac444810f4035fb2276b27db4ec84576e89c6016cdcbdc288c70b727b4) |
| D2 | DEMO | rule(case 1) | anyone retries before the 5-minute deadline; still 404 | PENDING | PENDING | [tx](https://explorer-studio-dev.genlayer.com/tx/0x045706cc15a511b33625e812dd034f4b70629c6c73f3377e0c4e2633eca40769) |
| D3 | DEMO | flag arbitrum [0x8Fd886c4021ed69a968f6966F818e476868B00eD](https://arbitrum.blockscout.com/token/0x8Fd886c4021ed69a968f6966F818e476868B00eD) vs `usd-coin` | exact copy, to be rechecked | IMPERSONATOR/EXACT_COPY | IMPERSONATOR/EXACT_COPY | [tx](https://explorer-studio-dev.genlayer.com/tx/0x3cdbb653b4f2149b72aeb81234603feba9d8778f6d8cd5e55f036738ac9b1467) |
| D4 | DEMO | recheck(case 2) | recheck right away | refused: recheck cooldown has not passed | refused: recheck cooldown has not passed | [tx](https://explorer-studio-dev.genlayer.com/tx/0x105aa5c62137d2bbbb07962fc3c474fd7c997d81535ab41f054735aaf7826bbe) |
| D5 | DEMO | recheck(case 2) | after the 3-minute cooldown; history keeps the first ruling | IMPERSONATOR/EXACT_COPY | IMPERSONATOR/EXACT_COPY | [tx](https://explorer-studio-dev.genlayer.com/tx/0x3390d7754b3fb9f33020bd3bc59d5ba39a1ce4c9a5903db58c395d0b3ab095ae) |
| D6 | DEMO | expire(case 1) | after the 5-minute rule window | EXPIRED | EXPIRED | [tx](https://explorer-studio-dev.genlayer.com/tx/0xcbb631121e26fe0c8867fa5e23187bd11e0246270864adb47c2365617750ae41) |
| D7 | DEMO | flag base [0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48](https://base.blockscout.com/token/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48) vs `usd-coin` | the same key flagged again after EXPIRED: a new case (still no token at that address on Base) | PENDING | PENDING | [tx](https://explorer-studio-dev.genlayer.com/tx/0x4196ce0b2659817d1b036353202c760e68b3ac7f36abc9c18e1299d951964b2d) |

D1 and D7 flag the Ethereum USDC address on Base, where no token exists: Blockscout answers 404, so the case stays PENDING. That is the real way a case gets stuck, and it shows `rule`, `expire` and re-flagging on the DEMO instance. D5's recheck kept the first ruling in the case history (the token had not renamed, so both entries agree).

## Known limits

- **Name and symbol only.** The register judges what a token calls itself. A scam token with an original name, a copied logo, or a malicious contract behind an honest name is out of scope.
- **Blockscout metadata can lag.** Evidence is whatever Blockscout serves when validators read it. A token that renames itself on chain is only re-judged when someone calls `recheck`.
- **OFFICIAL is the Uniswap default list's view.** A genuine deployment missing from that list (for example Tether's USDT0 on chains where the list does not carry it) is judged like any other token, and could be ruled a copy. CoinGecko was the intended source; from GenLayer validators it answered HTTP 429 on every call (docs/PROBE.md), so it could not be used without an API key. `ethena-usde` is not in the coin table because the list carries USDe only on Solana (docs/DECISIONS.md).
- **Not a safety badge.** IMPERSONATOR means "presents itself as the coin and is not on its official list". UNRELATED, VARIANT and "no case" say nothing about whether a token is harmless.
- **Model rulings can fail to agree.** On a borderline name validators may return different labels; then nothing is written and the case stays PENDING until it is ruled or expires.
- **studio-dev only.** These instances run on GenLayer's studio-dev network.

## Run it yourself

```sh
cd test && npm install
python3 -m unittest -q test_logic          # offline suite
node accounts.mjs                          # local test keys (studio-dev faucet funds them)
node deploy.mjs --network=studio-dev       # CANONICAL, DEMO, SAFELIST from the committed HEAD
caffeinate -dims node seed_lookalike.mjs   # seeds (about 10 minutes; DEMO waits out its windows)
node verify_onchain.mjs --ref=HEAD         # on-chain source == committed source
```

To deploy from a GenLayer keystore instead of the local test key:

```sh
cd ~/Desktop/lookalike/test
read -rs GENLAYER_KEYSTORE_PASSWORD
export GENLAYER_KEYSTORE_PASSWORD
node deploy.mjs --network=studio-dev --keystore=mywallet
unset GENLAYER_KEYSTORE_PASSWORD
```

## Repository

- `contracts/lookalike.py` (the register), `contracts/safelist.py` (the consumer)
- `test/test_logic.py`, `test/world.py`, `test/stub.py`: offline suite (`cd test && python3 -m unittest -q test_logic`), mocked web and model, invariants checked after every call
- `test/deploy.mjs`: deploys CANONICAL, DEMO and SAFELIST from the committed HEAD and refuses if the working copy differs; `test/seed_lookalike.mjs`: the seeds below
- `docs/THREAT_MODEL.md`, `docs/DECISIONS.md`, `docs/PROBE.md`, `docs/SEEDS.md`, `docs/seed-evidence.json`
