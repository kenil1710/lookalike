# Addresses (GenLayer studio-dev, chain 61997)

RPC https://studio-dev.genlayer.com/api · explorer https://explorer-studio-dev.genlayer.com/

| Instance | Address | File | Constructor args | Links |
|---|---|---|---|---|
| CANONICAL | `0xA46276c6F0C151D1DB645239bd0190325d0C3177` | contracts/lookalike.py | 21600, 3600 | [contract](https://explorer-studio-dev.genlayer.com/address/0xA46276c6F0C151D1DB645239bd0190325d0C3177) · [deploy tx](https://explorer-studio-dev.genlayer.com/tx/0xfe4d91e2d41200775d7d476f7925491503aa5531c93e24a8ff029cd22ec3ad68) |
| DEMO | `0xeE89132Cc5FB910d40481BE8CD01ac04aA7299fc` | contracts/lookalike.py | 300, 180 | [contract](https://explorer-studio-dev.genlayer.com/address/0xeE89132Cc5FB910d40481BE8CD01ac04aA7299fc) · [deploy tx](https://explorer-studio-dev.genlayer.com/tx/0x3eb08c7a45d6ef4660865793da17fefa8ba5fca77c8093201aa206fc21d791c0) |
| SAFELIST | `0xFF66Ca6d86be7Aa9e1848ba932e2BaA492BCA49b` | contracts/safelist.py | 0xA46276c6F0C151D1DB645239bd0190325d0C3177 | [contract](https://explorer-studio-dev.genlayer.com/address/0xFF66Ca6d86be7Aa9e1848ba932e2BaA492BCA49b) · [deploy tx](https://explorer-studio-dev.genlayer.com/tx/0x70d38dca1a41172bda8ec14ae49086f49f6439bcee3031286e916f032a1f8376) |

- CANONICAL: `rule_window_s = 21600` (6 h), `recheck_cooldown_s = 3600` (1 h). All real-token rulings and the Safelist live here.
- DEMO: `rule_window_s = 300` (5 min), `recheck_cooldown_s = 180` (3 min). Same file, same bytes; used for the time-based paths (expire, re-flag, recheck).
- SAFELIST: constructor argument is the CANONICAL address.

Deployed from commit `ab17aa74dbca43b4c0e259cf70f3b747bf5b0364`.

| File | Bytes | sha256 |
|---|---|---|
| contracts/lookalike.py (CANONICAL and DEMO) | 42938 | `f9582556ee73d87f63f9c16f4548ec8daedfbc7f8505ca7eb7d39be458d32fda` |
| contracts/safelist.py | 3874 | `f3d3a3f6d5dadd1068c0d82092edfdc0be6b412e8ff343fcee2c6c8f9527c3be` |

Check: `git show ab17aa74dbca43b4c0e259cf70f3b747bf5b0364:contracts/lookalike.py | shasum -a 256`.
