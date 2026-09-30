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

<!--ADDRESSES-->

## Seed results

<!--SEEDS-->

## Known limits

- **Name and symbol only.** The register judges what a token calls itself. A scam token with an original name, a copied logo, or a malicious contract behind an honest name is out of scope.
- **What the chain says is what counts.** A bridged token that is not on the list and says exactly `USD Coin` / `USDC` on chain (for example the Wormhole token `0x41f7B8b9b897276b7AAE926a9016935280b44E97` on Ethereum) is ruled EXACT_COPY; on chain it does present itself as the coin. A token that renames itself is only re-judged when someone calls `recheck`.
- **One public RPC endpoint per chain.** If it is down or rate-limited, cases stay PENDING until someone retries.
- **OFFICIAL is the Uniswap default list's view.** Pairs the list does not cover (Tether and WBTC on Base, and USDe everywhere) cannot be flagged. CoinGecko was the intended source; from GenLayer validators it answered HTTP 429 on every call (docs/PROBE.md), so it could not be used without an API key.
- **Not a safety badge.** IMPERSONATOR means "presents itself as the coin and is not on its official list". UNRELATED, VARIANT and "no case" say nothing about whether a token is harmless.
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
