# Probe (step 0)

Run on GenLayer studio-dev (chain 61997) on 2026-09-30 from a throwaway probe contract
`0x71A487e2201d69D38aCc993011fB320b4aECADa7` (the probe source is not part of the repo).
Every row is a real transaction; validators ran the fetch themselves.

| # | Question | Result | Tx |
|---|---|---|---|
| a | `import unicodedata` + NFKC inside GenVM | works. `unidata_version` 15.1.0. NFKC turns full-width `ＵＳＤＣ` into `USDC`; NFKC leaves Cyrillic `UЅDС` unchanged (so a separate confusables table is required). `unicodedata.category("\u200b") == "Cf"`. `hashlib.sha256` works. | [0x886ed2086e22be34dea88e3b0bb8625e38e4916accc31ef4e320cdb5ae94aef4](https://explorer-studio-dev.genlayer.com/tx/0x886ed2086e22be34dea88e3b0bb8625e38e4916accc31ef4e320cdb5ae94aef4) |
| b | eth.blockscout.com `/api/v2/tokens/0xA0b8…` (USDC) | 200, `name=USDC symbol=USDC decimals=6 type=ERC-20` | [0x9217c2bc3c877edb32ff6f62b490cb0757d0a591ee729054164381e1fd2c2a53](https://explorer-studio-dev.genlayer.com/tx/0x9217c2bc3c877edb32ff6f62b490cb0757d0a591ee729054164381e1fd2c2a53) |
| b | base.blockscout.com (Base USDC `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`) | 200, USDC / USDC / 6 / ERC-20 | [0x3dace8b922e3302e7902659f45428473c6810468c0195814cc3e4a29dd510836](https://explorer-studio-dev.genlayer.com/tx/0x3dace8b922e3302e7902659f45428473c6810468c0195814cc3e4a29dd510836) |
| b | arbitrum.blockscout.com (Arbitrum USDC `0xaf88d065e77c8cC2239327C5EDb3A432268e5831`) | 200, USDC / USDC / 6 / ERC-20 | [0x7b3fca7e5abffde6a8248cf4440e3bd60582384b6340203cc202676333f20e89](https://explorer-studio-dev.genlayer.com/tx/0x7b3fca7e5abffde6a8248cf4440e3bd60582384b6340203cc202676333f20e89) |
| b | explorer.optimism.io (OP USDC `0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85`) | 200, `USD Coin` / USDC / 6 / ERC-20 | [0x858ff6af1d0b9320707767dc27792aeac6dbed36eb0124aef9822c7b991b44ae](https://explorer-studio-dev.genlayer.com/tx/0x858ff6af1d0b9320707767dc27792aeac6dbed36eb0124aef9822c7b991b44ae) |
| b | optimism.blockscout.com (same token) | 301 to explorer.optimism.io, followed inside GenVM, same body | [0xb23d77b5fe8a863be0668a1d30806aa55abc3e1c2ef1883e649129096b52fa4b](https://explorer-studio-dev.genlayer.com/tx/0xb23d77b5fe8a863be0668a1d30806aa55abc3e1c2ef1883e649129096b52fa4b) |
| b | polygon.blockscout.com (Polygon USDC `0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359`) | 200, USDC / USDC / 6 / ERC-20 | [0x4c1647eaf45dbcc0c7396b986bd860f2e11a5a4824bf6bd046fff5fe52c86d86](https://explorer-studio-dev.genlayer.com/tx/0x4c1647eaf45dbcc0c7396b986bd860f2e11a5a4824bf6bd046fff5fe52c86d86) |
| b | eth.blockscout.com, address with no token (`0x000000000000000000000000000000000000dEaD`) | 404 `{"message":"Not found"}` | [0xa2de7f98391cfa20801066d6fccf45c12da624459c7b4baec172961190b41eac](https://explorer-studio-dev.genlayer.com/tx/0xa2de7f98391cfa20801066d6fccf45c12da624459c7b4baec172961190b41eac) |
| b | eth.blockscout.com, an EOA (`0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045`) | 404 `{"message":"Not found"}` | [0xfa86b0e96bbae39a2d76605396b9993ae2a5f641fecb74666f090da16979cc83](https://explorer-studio-dev.genlayer.com/tx/0xfa86b0e96bbae39a2d76605396b9993ae2a5f641fecb74666f090da16979cc83) |
| b | eth.blockscout.com, an NFT (BAYC `0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D`) | 200, `type=ERC-721`, `decimals=null` | [0x5389fcf119303cb5616a5e65c4f8b11eae546eaacd07782254e9427d7b8a0cf0](https://explorer-studio-dev.genlayer.com/tx/0x5389fcf119303cb5616a5e65c4f8b11eae546eaacd07782254e9427d7b8a0cf0) |
| b | eth.blockscout.com, strict equality across validators (status, name, symbol, decimals, type) | agreed | [0x249eb589728fac27379495afe2436cd783f220cc8fd1d0a981db4c287706ae11](https://explorer-studio-dev.genlayer.com/tx/0x249eb589728fac27379495afe2436cd783f220cc8fd1d0a981db4c287706ae11) |
| c | CoinGecko `/coins/usd-coin?...` three calls in a row in one validator | **429, 429, 429** (`You've exceeded the Rate Limit`) | [0x41b74e9ada2dee5568bd7c951b13635fae7b7edba21770f5cfe07ba34456212a](https://explorer-studio-dev.genlayer.com/tx/0x41b74e9ada2dee5568bd7c951b13635fae7b7edba21770f5cfe07ba34456212a) |
| c | CoinGecko usd-coin, strict | 429 | [0x5d3193a017e51272737a30982d6bab5a612153300c2a7839045f2a95ac31330c](https://explorer-studio-dev.genlayer.com/tx/0x5d3193a017e51272737a30982d6bab5a612153300c2a7839045f2a95ac31330c) |
| c | CoinGecko tether, strict | 429 | [0x45b9e5ab881cf87fcfc3d778eed4642d13a7c4baa11ec965d77dd539fc14ee82](https://explorer-studio-dev.genlayer.com/tx/0x45b9e5ab881cf87fcfc3d778eed4642d13a7c4baa11ec965d77dd539fc14ee82) |
| c | CoinGecko unknown coin id | 429 (not even a 404 gets through) | [0xbf16dc1aa9ec848b5830e6b0c46bdfb59b5cdb6a34ce8f5370fe544e16b095e8](https://explorer-studio-dev.genlayer.com/tx/0xbf16dc1aa9ec848b5830e6b0c46bdfb59b5cdb6a34ce8f5370fe544e16b095e8) |
| c | CoinGecko retried ~30 min later, usd-coin and tether | 429, 429 | [0x9a64111775ceeeb685b3fdc6602ff0d55aedf6d1167067166abc398bc2b942f6](https://explorer-studio-dev.genlayer.com/tx/0x9a64111775ceeeb685b3fdc6602ff0d55aedf6d1167067166abc398bc2b942f6), [0xcccc4ce005212e06392642bdaffd690c5501c4d641142c6987ab33c930bfa7e3](https://explorer-studio-dev.genlayer.com/tx/0xcccc4ce005212e06392642bdaffd690c5501c4d641142c6987ab33c930bfa7e3) |
| fallback | `https://tokens.uniswap.org` (Uniswap Labs Default list) | 200, 667,462 bytes, `tokens` array with `chainId`, `symbol`, `address` | [0x9017537afb108fd187f9e348d54bc41201a3bb9d154a5e6140aaaaf916ed60e2](https://explorer-studio-dev.genlayer.com/tx/0x9017537afb108fd187f9e348d54bc41201a3bb9d154a5e6140aaaaf916ed60e2) |

Other things measured along the way:

- `gl.eq_principle` exists on this runner (`strict_eq`, `prompt_comparative`, `prompt_non_comparative`); the contract uses `gl.vm.run_nondet` with a validator that re-collects and compares strings, which is the same strict equality and is what the offline stub models.
- The web call used is `gl.nondet.web.request(url, method="GET")`; the response has `status` and `body` (bytes).
- Blockscout's token object also carries volatile fields (`holders_count`, `exchange_rate`, `circulating_market_cap`). They are never part of the evidence, so validators agree even when those move between reads.
- A cross-contract view on this runner is spelled `@gl.contract.interface` + `ILookalike(addr).view().is_impersonator(...)`. `gl.get_contract_at` does not exist here (`AttributeError: module 'genlayer' has no attribute 'get_contract_at'`, measured in a scratch deploy).

## Coin ids (CoinGecko, checked from a laptop before the rate limit hit)

`usd-coin` (usdc, "USDC"), `tether` (usdt, "Tether"), `weth` (weth, "WETH"), `dai` (dai, "Dai") returned 200. `wrapped-bitcoin` and `ethena-usde` could not be checked: 429. CoinGecko platform ids: `ethereum`, `base`, `arbitrum-one`, `optimistic-ethereum`, `polygon-pos`.


## Round 2: evidence from the chain itself (hardening)

Probe contract `0xc045a265cDdfCb5f567a61e321b2Bda842D65E44`. Each validator POSTs one JSON-RPC batch (`eth_getCode`, `name()`, `symbol()`, `decimals()`) with `gl.nondet.web.request(url, method="POST", body=..., headers={"Content-Type": "application/json"})`; the validator re-sends the batch and must receive the same status and body.

| Endpoint | Result | Tx |
|---|---|---|
| ethereum-rpc.publicnode.com, USDC `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48` | 200, batch of 4 answers, validators agreed | [0x870fdf1e308923f596f296855ec8f1fd3824f5eaab6533f71854e936ca9ddb26](https://explorer-studio-dev.genlayer.com/tx/0x870fdf1e308923f596f296855ec8f1fd3824f5eaab6533f71854e936ca9ddb26) |
| base-rpc.publicnode.com, Base USDC `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` | 200, batch of 4 answers, validators agreed | [0xfcd7aa4f19197b6e62069d674df247e267b6e66d3392eeedaaa5f51c3e7c145a](https://explorer-studio-dev.genlayer.com/tx/0xfcd7aa4f19197b6e62069d674df247e267b6e66d3392eeedaaa5f51c3e7c145a) |
| arbitrum-one-rpc.publicnode.com, a real disguised fake `0xEbb993F7C5477016A0a025A790Dd079dfe3Eca9D` | 200, batch of 4 answers, validators agreed | [0xf45a3c06f74548f42f43d8e62ac8dbadae45698fb1c72772b1ebb6dcb7dac2fa](https://explorer-studio-dev.genlayer.com/tx/0xf45a3c06f74548f42f43d8e62ac8dbadae45698fb1c72772b1ebb6dcb7dac2fa) |
| optimism-rpc.publicnode.com, OP USDC `0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85` | 200, batch of 4 answers, validators agreed | [0x5e3410f85e2e799a65ab52762a09e59bcd1e3a1ef6649e349e73e988d5b5e1a7](https://explorer-studio-dev.genlayer.com/tx/0x5e3410f85e2e799a65ab52762a09e59bcd1e3a1ef6649e349e73e988d5b5e1a7) |
| polygon-bor-rpc.publicnode.com, Polygon USDC `0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359` | 200, batch of 4 answers, validators agreed | [0x78e45fbe5c07c774a2dc58034790bba07f387cc65b2f4df49e1ff9f88b819931](https://explorer-studio-dev.genlayer.com/tx/0x78e45fbe5c07c774a2dc58034790bba07f387cc65b2f4df49e1ff9f88b819931) |
| ethereum-rpc.publicnode.com, an account (`0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045`) | `eth_getCode` = `0xef0100…` (an EIP-7702 delegation, not a token), every `eth_call` = `0x` | [0x57ff2afb9c7ec0e5fec999106b481e67c96ee0ed35dc45c3225056b2f94bb041](https://explorer-studio-dev.genlayer.com/tx/0x57ff2afb9c7ec0e5fec999106b481e67c96ee0ed35dc45c3225056b2f94bb041) |
| tokens.uniswap.org again | 200, 667,462 characters read inside GenVM; the server sends `content-length: 667466` bytes (the difference is multi-byte UTF-8 characters), so the body arrives whole | [0xf81512e1f07ff0dcc952aff88b5f12584a2c03a59322f103cbdf2992cd9c7cb7](https://explorer-studio-dev.genlayer.com/tx/0xf81512e1f07ff0dcc952aff88b5f12584a2c03a59322f103cbdf2992cd9c7cb7) |

Other keyless endpoints tried from a laptop: `eth.drpc.org`, `1rpc.io/eth`, `mainnet.base.org`, `arb1.arbitrum.io/rpc`, `mainnet.optimism.io` answer; `rpc.ankr.com/eth` now needs a key; `polygon-rpc.com` answers 403; `cloudflare-eth.com` refuses `eth_call`. publicnode serves all five chains with one pattern, so it is the one frozen in the contract.

What the chain says differs from Blockscout's metadata, and that matters. Arbitrum's bridged USDC.e (`0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8`) returns `name() = "USD Coin (Arb1)"`, `symbol() = "USDC"`. Blockscout shows `Arbitrum Bridged USDC (Arbitrum)` / `USDC.E`, which is Blockscout's own label. Polygon's USDC.e returns `USD Coin (PoS)` / `USDC`. See DECISIONS D11.

Smoke deploy of the hardened contract (scratch instance `0x0E1f93c8EcAE57a2365E9BC49D75C4Ca33a12DD8`, not a submission): C1-style disguised fake -> HOMOGLYPH, exact copy -> EXACT_COPY, USDC.e -> VARIANT/LISTED_VARIANT, axlUSDC -> VARIANT/MODEL, no contract -> PENDING, Tether on Base -> refused by the coverage gate, precedent batch, Safelist prune refused before the ruling and accepted after it.

Consequences are in [DECISIONS.md](DECISIONS.md).
