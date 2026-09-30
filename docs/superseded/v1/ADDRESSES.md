# Addresses (GenLayer studio-dev, chain 61997)

RPC https://studio-dev.genlayer.com/api · explorer https://explorer-studio-dev.genlayer.com/

| Instance | Address | File | Constructor args | Links |
|---|---|---|---|---|
| CANONICAL | `0xeBA36999B79522e5A2C7436c65793168379A2993` | contracts/lookalike.py | 21600, 3600 | [contract](https://explorer-studio-dev.genlayer.com/address/0xeBA36999B79522e5A2C7436c65793168379A2993) · [deploy tx](https://explorer-studio-dev.genlayer.com/tx/0x3f340802ade4a32d789495927dd3886c3f753392b9005f4d7c83e2f884a64a90) |
| DEMO | `0x950A1c0E2D4e82DBCE16DB33e84750cC267bEC0B` | contracts/lookalike.py | 300, 180 | [contract](https://explorer-studio-dev.genlayer.com/address/0x950A1c0E2D4e82DBCE16DB33e84750cC267bEC0B) · [deploy tx](https://explorer-studio-dev.genlayer.com/tx/0x799ab994ceb00ffd8b4387962a98591603cf5de1e3bd32f538de3d00dadebc39) |
| SAFELIST | `0x81C12863f346a85eE4ee5c7a4AdE27D1AD7E54CE` | contracts/safelist.py | 0xeBA36999B79522e5A2C7436c65793168379A2993 | [contract](https://explorer-studio-dev.genlayer.com/address/0x81C12863f346a85eE4ee5c7a4AdE27D1AD7E54CE) · [deploy tx](https://explorer-studio-dev.genlayer.com/tx/0x49dc01345ed0b429528db73f56d8d991dc745e3c9d1516828fc2aa6c19986c62) |

- CANONICAL: `rule_window_s = 21600` (6 h), `recheck_cooldown_s = 3600` (1 h). All real-token rulings and the Safelist live here.
- DEMO: `rule_window_s = 300` (5 min), `recheck_cooldown_s = 180` (3 min). Same file, same bytes; used for the time-based paths (expire, re-flag, recheck).
- SAFELIST: constructor argument is the CANONICAL address.

Deployed from commit `cf44d6b9e0b1534aafd35da6effdf40d44dcd669`.

| File | Bytes | sha256 |
|---|---|---|
| contracts/lookalike.py (CANONICAL and DEMO) | 32458 | `f0723c09ae7d2f1de5c336217d144777fe133069fee27b04dd1f9aaa0f845839` |
| contracts/safelist.py | 2500 | `b36c11b5c7b4c548d553d8892b799508510df9d2074bc64d58a4e258736cf293` |

Check: `git show cf44d6b9e0b1534aafd35da6effdf40d44dcd669:contracts/lookalike.py | shasum -a 256`.
