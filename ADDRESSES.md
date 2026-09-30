# Addresses (GenLayer studio-dev, chain 61997)

RPC https://studio-dev.genlayer.com/api · explorer https://explorer-studio-dev.genlayer.com/

| Instance | Address | File | Constructor args | Links |
|---|---|---|---|---|
| CANONICAL | `0xc0a6ac4f8E552170AA64E21264b7E02081Cde876` | contracts/lookalike.py | 21600, 3600 | [contract](https://explorer-studio-dev.genlayer.com/address/0xc0a6ac4f8E552170AA64E21264b7E02081Cde876) · [deploy tx](https://explorer-studio-dev.genlayer.com/tx/0x64337792655a94ac346a398ce900cca6125b94c49a5ffc5b113adab0b56663fe) |
| DEMO | `0x5C26d415B436859AC2c67FB41cdFaE21a8179c1d` | contracts/lookalike.py | 300, 180 | [contract](https://explorer-studio-dev.genlayer.com/address/0x5C26d415B436859AC2c67FB41cdFaE21a8179c1d) · [deploy tx](https://explorer-studio-dev.genlayer.com/tx/0x7c224875421a037076fa3bd394ab5ab71f913b413bfa021c06e4636ab1cdb04f) |
| SAFELIST | `0xF0B3e58eE4581aA6D997013D1E7556AFBa48A398` | contracts/safelist.py | 0xc0a6ac4f8E552170AA64E21264b7E02081Cde876 | [contract](https://explorer-studio-dev.genlayer.com/address/0xF0B3e58eE4581aA6D997013D1E7556AFBa48A398) · [deploy tx](https://explorer-studio-dev.genlayer.com/tx/0xf9dae4db1de62b8a6f93939132c275fd0428897c01b846532c45c03d4c168ff9) |

- CANONICAL: `rule_window_s = 21600` (6 h), `recheck_cooldown_s = 3600` (1 h). All real-token rulings and the Safelist live here.
- DEMO: `rule_window_s = 300` (5 min), `recheck_cooldown_s = 180` (3 min). Same file, same bytes; used for the time-based paths (expire, re-flag, recheck).
- SAFELIST: constructor argument is the CANONICAL address.

Deployed from commit `6b399e6958860d94521800917897220fbd9933f4`.

| File | Bytes | sha256 |
|---|---|---|
| contracts/lookalike.py (CANONICAL and DEMO) | 65868 | `1613bfbb95a89b2ef16a723d20a8de57cfa244251642753df22d72567b047ff9` |
| contracts/safelist.py | 3874 | `f3d3a3f6d5dadd1068c0d82092edfdc0be6b412e8ff343fcee2c6c8f9527c3be` |

Check: `git show 6b399e6958860d94521800917897220fbd9933f4:contracts/lookalike.py | shasum -a 256`.
