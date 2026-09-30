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
- [x] H7 MODEL seeds twice on DEMO (M1-M3, both runs agree; M3 differs from my expectation, documented)
- [x] H8 verify_source.mjs: all three byte-identical to ab17aa7
- [x] H9 README "What the model never decides"
- [x] coverage gate (docs/COVERAGE.md), refuse uncovered pairs; rules 4/5 need an official entry; tests
- [x] list size 667,466 bytes; truncated/unparsable/short list = evidence failure; tests
- [x] smoke deploy of the hardened source on studio-dev (scratch instance)
- [x] redeploy from the local test key (keystore skipped by instruction); reseed; verify; ADDRESSES.md, README, SEEDS.md; push

## LISTED_COPY round (2026-09-30)
- [x] escape routes A-G found, real Arbitrum tokens for A, C, D, E, F; failing tests written
- [x] LISTED_COPY rule (labels from the whole list, symbol-qualified), HOMOGLYPH when disguised; EXACT_COPY removed
- [x] ERC-20 check: totalSupply + balanceOf(0) + name or symbol; decimals optional (null)
- [x] precedent accepts LISTED_COPY / HOMOGLYPH
- [x] all 15 hole tests + 9 controls pass; merged into test_logic.py; full suite passes
- [x] dry run with live RPC + live list on every seed token
- [x] redeploy CANONICAL, DEMO, SAFELIST from 3716431; reseed incl. hole tokens (H1-H10); M1-M4 twice, all runs agree
- [x] verify_source; README, ADDRESSES.md, SEEDS.md; push

## Attacker round v3 (2026-09-30)
- [x] 1 unreadable characters: never NO_BRAND_MATCH; label match on them = HOMOGLYPH; Sigma/final sigma -> C
- [x] 2 ERC-20: only name()/symbol() decide; totalSupply/balanceOf/supportsInterface not read
- [x] 3 EIP-7702 delegated code read like a token
- [x] 4 hidden tail: head of name and symbol compared with labels
- [x] 5 Unicode confusables.txt 18.0.0 (1,582 entries) in the table; raw-only prompt for unreadable text
- [x] 6 TM/SM (and R, C) stripped before NFKC
- [x] all 25 v3 tests pass, merged into test_logic.py; full suite passes
- [x] dry run of every seed token with live RPC: same rulings as before
- [ ] redeploy, reseed (H1-H10, M1-M4 twice), verify_source, docs, push
