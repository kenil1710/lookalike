# Lookalike - tasks

Status legend: [ ] todo · [~] in progress · [x] done · [!] blocked (reason inline)

## Step 0 - probe (docs/PROBE.md)
- [x] copy tooling from licenseguard (harness.mjs, accounts.mjs, offline stub, .gitignore)
- [x] a) unicodedata + NFKC inside GenVM
- [x] b) Blockscout tokens API on ethereum, base, arbitrum, optimism, polygon
- [x] c) CoinGecko x3 - rate-limited (429 every time) -> switched to tokens.uniswap.org (docs/DECISIONS.md D1)
- [x] verify chain hosts and coin ids; drop ethena-usde (D2)

## Step 1 - contracts
- [x] contracts/lookalike.py: frozen tables, no owner, no money
- [x] evidence block (strict equality, validators fetch), canonical JSON, failure -> PENDING
- [x] skeleton + disguise + disclosure words
- [x] rules 1-6 with basis; model block with one enum
- [x] flag / rule / expire / flag_by_precedent / recheck
- [x] views: get_case, get_status, is_impersonator, list_cases, stats, get_config
- [x] contracts/safelist.py consumer (cross-contract view)

## Step 2 - offline tests
- [x] every rule, state change, view
- [x] T1-T12 (docs/THREAT_MODEL.md)
- [x] smoke deploy on studio-dev from the working copy (cross-contract spelling fixed: gl.contract.interface)

## Step 3 - deploy + seeds
- [x] commit, deploy CANONICAL + DEMO + SAFELIST from HEAD, ADDRESSES.md (on-chain source = HEAD, test/verify_onchain.mjs)
- [x] CANONICAL seeds: fakes -> IMPERSONATOR, USDC -> OFFICIAL, USDC.e -> VARIANT, USDS -> UNRELATED, precedent batch, safelist add/refuse
- [x] DEMO seeds: PENDING -> expire -> EXPIRED -> re-flag; recheck after cooldown with history
- [x] docs/SEEDS.md

## Step 4 - README + push
- [x] README
- [x] push to github.com/kenil1710/lookalike; deployed file byte-identical to pushed HEAD (verify_onchain.mjs --ref=origin/main)
