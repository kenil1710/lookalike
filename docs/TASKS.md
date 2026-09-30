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

## Hardening round (2026-09-30)
- [x] key safety: test/.accounts.json ignored, never committed on any ref; only a code comment matches "privateKey"
- [x] H1 name/symbol/decimals via eth_call JSON-RPC batch (publicnode), measured in GenVM
- [x] H2 list binding: OFFICIAL needs the entry's chainId + address == the case's; rule 2b for listed variants
- [x] H3 full-string skeleton, combining marks, bidi, unknown non-ASCII -> model, digit look-alikes -> model
- [x] H4 no leader text stored; history keeps hashes only
- [x] H5 no payable (test)
- [x] H6 Safelist.prune
- [ ] H7 MODEL seeds twice on DEMO (seed script ready; runs after the keystore redeploy)
- [ ] H8 verify_source.mjs against HEAD for all three (after the keystore redeploy)
- [x] H9 README "What the model never decides"
- [x] coverage gate (docs/COVERAGE.md), refuse uncovered pairs; rules 4/5 need an official entry; tests
- [x] list size 667,466 bytes; truncated/unparsable/short list = evidence failure; tests
- [x] smoke deploy of the hardened source on studio-dev (scratch instance)
- [ ] user runs keystore deploy; reseed; verify; ADDRESSES.md, README, SEEDS.md; push
