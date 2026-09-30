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

Consequences are in [DECISIONS.md](DECISIONS.md).
