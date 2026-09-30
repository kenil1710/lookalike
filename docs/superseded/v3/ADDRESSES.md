# Addresses (GenLayer studio-dev, chain 61997)

RPC https://studio-dev.genlayer.com/api · explorer https://explorer-studio-dev.genlayer.com/

| Instance | Address | File | Constructor args | Links |
|---|---|---|---|---|
| CANONICAL | `0x0B448534e504B7d5D0ABfB89e7c57A290D80e705` | contracts/lookalike.py | 21600, 3600 | [contract](https://explorer-studio-dev.genlayer.com/address/0x0B448534e504B7d5D0ABfB89e7c57A290D80e705) · [deploy tx](https://explorer-studio-dev.genlayer.com/tx/0x0de9dbda70ce7d7b35a614fa863702094a3e38af16fdcc34751a62b755c9f1a6) |
| DEMO | `0xe57c00C57372B7E88a9C485C323b6296a6Cbfd7a` | contracts/lookalike.py | 300, 180 | [contract](https://explorer-studio-dev.genlayer.com/address/0xe57c00C57372B7E88a9C485C323b6296a6Cbfd7a) · [deploy tx](https://explorer-studio-dev.genlayer.com/tx/0x1828af3972dc37350a63d459ba44e13de92cd966c63e5825cf1f94ac12eb19ac) |
| SAFELIST | `0xc70C20F28d125e318BCAD28dBD84d51d8DBADa2A` | contracts/safelist.py | 0x0B448534e504B7d5D0ABfB89e7c57A290D80e705 | [contract](https://explorer-studio-dev.genlayer.com/address/0xc70C20F28d125e318BCAD28dBD84d51d8DBADa2A) · [deploy tx](https://explorer-studio-dev.genlayer.com/tx/0xdd591b08a878759abc7d0089e4a3fc9c6022c95af9523b0fe4c1275c2ac2b839) |

- CANONICAL: `rule_window_s = 21600` (6 h), `recheck_cooldown_s = 3600` (1 h). All real-token rulings and the Safelist live here.
- DEMO: `rule_window_s = 300` (5 min), `recheck_cooldown_s = 180` (3 min). Same file, same bytes; used for the time-based paths (expire, re-flag, recheck).
- SAFELIST: constructor argument is the CANONICAL address.

Deployed from commit `371643122632332d289a12356481a46bf524aef0`.

| File | Bytes | sha256 |
|---|---|---|
| contracts/lookalike.py (CANONICAL and DEMO) | 46636 | `a7a3a07609e4685637a4152c8dbe7bcd92cfa15e02d975cc668d6a9c330329f1` |
| contracts/safelist.py | 3874 | `f3d3a3f6d5dadd1068c0d82092edfdc0be6b412e8ff343fcee2c6c8f9527c3be` |

Check: `git show 371643122632332d289a12356481a46bf524aef0:contracts/lookalike.py | shasum -a 256`.
