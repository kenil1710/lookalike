# Coverage: which (coin, chain) pairs the register accepts

Source: `https://tokens.uniswap.org` (Uniswap Labs Default, version 22.21.0, 1,723 tokens), read 2026-09-30. A pair is covered when the list has at least one entry with that `chainId` under one of the coin's list symbols. The table is frozen in the constructor (`COVERAGE`, echoed by `get_config`). `flag` and `flag_by_precedent` refuse every uncovered pair before anything is fetched or stored.

| coin \ chain | ethereum (1) | base (8453) | arbitrum (42161) | optimism (10) | polygon (137) |
|---|---|---|---|---|---|
| usd-coin (USDC) | yes `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48` | yes `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` | yes `0xaf88d065e77c8cC2239327C5EDb3A432268e5831` | yes `0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85` | yes `0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359` |
| tether (USDT, USDT0) | yes `0xdAC17F958D2ee523a2206206994597C13D831ec7` | **no** | yes USDT0 `0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9` | yes USDT `0x94b008aA00579c1307B0EF2c499aD98a8ce58e58`, USDT0 `0x01bFF41798a0BcF287b996046Ca68b395DbC1071` | yes `0xc2132D05D31c914a87C6611C10748AEb04B58e8F` |
| weth (WETH) | yes `0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2` | yes `0x4200000000000000000000000000000000000006` | yes `0x82aF49447D8a07e3bd95BD0d56f35241523fBab1` | yes `0x4200000000000000000000000000000000000006` | yes `0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619` |
| dai (DAI) | yes `0x6B175474E89094C44Da98b954EedeAC495271d0F` | yes `0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb` | yes `0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1` | yes `0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1` | yes `0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063` |
| wrapped-bitcoin (WBTC) | yes `0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599` | **no** | yes `0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f` | yes `0x68f180fcCe6836688e9084f035309E29Bf0A2095` | yes `0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6` |
| ethena-usde (not in the table) | no | no | no | no | no (the list carries USDe only on Solana) |

23 of 25 pairs are covered.

Two more guards keep a real coin from ever being called an impersonator:

- If a covered pair has **no** entry on the list when a case is judged (the list dropped it), that is an evidence failure: the case stays PENDING. It is never judged against an empty official set.
- A token the list carries at the same `chainId` and address under **another** symbol (bridged USDC.e) is decided by code as VARIANT or UNRELATED (rule 2b) and never reaches rules 4, 5 or the model.
