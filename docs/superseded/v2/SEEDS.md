# Seeds (studio-dev)

Every row is a real transaction on real token data. Contracts: CANONICAL [`0xA46276c6F0C151D1DB645239bd0190325d0C3177`](https://explorer-studio-dev.genlayer.com/address/0xA46276c6F0C151D1DB645239bd0190325d0C3177), DEMO [`0xeE89132Cc5FB910d40481BE8CD01ac04aA7299fc`](https://explorer-studio-dev.genlayer.com/address/0xeE89132Cc5FB910d40481BE8CD01ac04aA7299fc), SAFELIST [`0xFF66Ca6d86be7Aa9e1848ba932e2BaA492BCA49b`](https://explorer-studio-dev.genlayer.com/address/0xFF66Ca6d86be7Aa9e1848ba932e2BaA492BCA49b), deployed from commit `ab17aa74dbca43b4c0e259cf70f3b747bf5b0364`. Raw records (returned values, case JSON, history) are in [seed-evidence.json](seed-evidence.json). Token links go to each chain's explorer for people; the contract itself reads name, symbol and decimals with eth_call.

| Step | Instance | Call | Token | Expected | Actual | Match | Tx |
|---|---|---|---|---|---|---|---|
| C1 | CANONICAL | flag arbitrum [0xEbb993F7C5477016A0a025A790Dd079dfe3Eca9D](https://arbitrum.blockscout.com/token/0xEbb993F7C5477016A0a025A790Dd079dfe3Eca9D) vs `usd-coin` (case 1) | on chain: 'USD Coin' / 'USDC' with Cyrillic ES and o plus invisible U+206B, U+FEFF, U+200B | IMPERSONATOR/HOMOGLYPH | IMPERSONATOR/HOMOGLYPH | yes | [0xbd4379c13082d2016696da772e63daa05ab42b1d9b3467a4a3f3a326f4c14cc6](https://explorer-studio-dev.genlayer.com/tx/0xbd4379c13082d2016696da772e63daa05ab42b1d9b3467a4a3f3a326f4c14cc6) |
| C2 | CANONICAL | flag arbitrum [0xdaECe7e93993394063a01BB39145A7d71d4df8f1](https://arbitrum.blockscout.com/token/0xdaECe7e93993394063a01BB39145A7d71d4df8f1) vs `usd-coin` (case 2) | 'U+FEFF SD Coin' / 'U+FEFF SDC': byte-order mark inside | IMPERSONATOR/HOMOGLYPH | IMPERSONATOR/HOMOGLYPH | yes | [0xfb0e08c901d898f54a73dbf82d7226e7b599865b427d20530062f64353a40a34](https://explorer-studio-dev.genlayer.com/tx/0xfb0e08c901d898f54a73dbf82d7226e7b599865b427d20530062f64353a40a34) |
| C3 | CANONICAL | flag arbitrum [0x72224ea851b18d56065E7ebe355a246A66F5ce2E](https://arbitrum.blockscout.com/token/0x72224ea851b18d56065E7ebe355a246A66F5ce2E) vs `usd-coin` (case 3) | 'USD Coin' / 'U U+206F SD U+200D C' | IMPERSONATOR/HOMOGLYPH | IMPERSONATOR/HOMOGLYPH | yes | [0x714a7792df3f5115f7bfb6c8088cad387fb59149ea4b588db941fdaa9326f006](https://explorer-studio-dev.genlayer.com/tx/0x714a7792df3f5115f7bfb6c8088cad387fb59149ea4b588db941fdaa9326f006) |
| C4 | CANONICAL | flag arbitrum [0x2790AfA96A254142a13C24A7BE2C35afC784b82a](https://arbitrum.blockscout.com/token/0x2790AfA96A254142a13C24A7BE2C35afC784b82a) vs `tether` (case 4) | 'Tet U+FEFF her USD' / 'U U+200C SDT' | IMPERSONATOR/HOMOGLYPH | IMPERSONATOR/HOMOGLYPH | yes | [0xd90d123dea35182cfd869b7a10911035891859ecfcbfac41285219d6942030bc](https://explorer-studio-dev.genlayer.com/tx/0xd90d123dea35182cfd869b7a10911035891859ecfcbfac41285219d6942030bc) |
| C5 | CANONICAL | flag arbitrum [0x8Fd886c4021ed69a968f6966F818e476868B00eD](https://arbitrum.blockscout.com/token/0x8Fd886c4021ed69a968f6966F818e476868B00eD) vs `usd-coin` (case 5) | 'USDC' / 'USDC', 6 decimals, not the official Arbitrum USDC | IMPERSONATOR/EXACT_COPY | IMPERSONATOR/EXACT_COPY | yes | [0x90b05c2e984093e493d5c8d591f6926b9c01b13acaefcf54681204f7330703ce](https://explorer-studio-dev.genlayer.com/tx/0x90b05c2e984093e493d5c8d591f6926b9c01b13acaefcf54681204f7330703ce) |
| C6 | CANONICAL | flag arbitrum [0x413f1661a78A9675C95E33D63b0c90DBD747c43B](https://arbitrum.blockscout.com/token/0x413f1661a78A9675C95E33D63b0c90DBD747c43B) vs `tether` (case 6) | 'USDT' / 'USDT' on Arbitrum (the official Tether there is USDT0) | IMPERSONATOR/EXACT_COPY | IMPERSONATOR/EXACT_COPY | yes | [0xf62f7ad9e6594ba4c8bd314b04e9882ce2fb7c12cfeb1074af84022796d36f14](https://explorer-studio-dev.genlayer.com/tx/0xf62f7ad9e6594ba4c8bd314b04e9882ce2fb7c12cfeb1074af84022796d36f14) |
| C7 | CANONICAL | flag ethereum [0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48](https://eth.blockscout.com/token/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48) vs `usd-coin` (case 7) | real USDC on Ethereum | OFFICIAL/OFFICIAL_LIST | OFFICIAL/OFFICIAL_LIST | yes | [0x338d3e5ef7be408cded3f883ffe0456344a6b372de08cd435cf8fe4bc69ebceb](https://explorer-studio-dev.genlayer.com/tx/0x338d3e5ef7be408cded3f883ffe0456344a6b372de08cd435cf8fe4bc69ebceb) |
| C8 | CANONICAL | flag arbitrum [0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8](https://arbitrum.blockscout.com/token/0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8) vs `usd-coin` (case 8) | real bridged USDC.e: on chain it says 'USD Coin (Arb1)' / 'USDC'; the list carries this address as USDC.e 'Bridged USDC' | VARIANT/LISTED_VARIANT | VARIANT/LISTED_VARIANT | yes | [0xdcec5d681d83e93ccaca787e67c24846769f2b34c8a1606b1ce03d760246c211](https://explorer-studio-dev.genlayer.com/tx/0xdcec5d681d83e93ccaca787e67c24846769f2b34c8a1606b1ce03d760246c211) |
| C9 | CANONICAL | flag arbitrum [0xEB466342C4d449BC9f53A865D5Cb90586f405215](https://arbitrum.blockscout.com/token/0xEB466342C4d449BC9f53A865D5Cb90586f405215) vs `usd-coin` (case 9) | 'Axelar Wrapped USDC' / 'axlUSDC', not on the list | VARIANT/MODEL | VARIANT/MODEL | yes | [0xeb8d6f5cf3abcc3919cdd7852ed89024fd80f880d01be7ed6000a5552b0bbe58](https://explorer-studio-dev.genlayer.com/tx/0xeb8d6f5cf3abcc3919cdd7852ed89024fd80f880d01be7ed6000a5552b0bbe58) |
| C10 | CANONICAL | flag ethereum [0xdC035D45d973E3EC169d2276DDab16f1e407384F](https://eth.blockscout.com/token/0xdC035D45d973E3EC169d2276DDab16f1e407384F) vs `usd-coin` (case 10) | Sky 'USDS Stablecoin' / 'USDS': a different dollar token | UNRELATED/NO_BRAND_MATCH | UNRELATED/LISTED_OTHER | **no** | [0x46d2bfb5c3b4a7cf4dfea0985839a256f4bafede2323bba7e807954a437e15ff](https://explorer-studio-dev.genlayer.com/tx/0x46d2bfb5c3b4a7cf4dfea0985839a256f4bafede2323bba7e807954a437e15ff) |
| C11 | CANONICAL | flag_by_precedent (precedent case 5): [0x293971FC9f23AddadfB5bE29a4542C0E2BF67ba8](https://arbitrum.blockscout.com/token/0x293971FC9f23AddadfB5bE29a4542C0E2BF67ba8), [0x1C1dEB401E94f4826260Ca888E53180819449714](https://arbitrum.blockscout.com/token/0x1C1dEB401E94f4826260Ca888E53180819449714), [0x755A31d5dDbF5Cb69B15d50a01a0ea1ae15Ce474](https://arbitrum.blockscout.com/token/0x755A31d5dDbF5Cb69B15d50a01a0ea1ae15Ce474), [0xCd5503c3718C2303Bf958538cF94FcB5606E4E01](https://arbitrum.blockscout.com/token/0xCd5503c3718C2303Bf958538cF94FcB5606E4E01), [0x0dFCCeB1147e0Ff11a442602a245E34D2FEBC977](https://arbitrum.blockscout.com/token/0x0dFCCeB1147e0Ff11a442602a245E34D2FEBC977) | five more 'USDC' / 'USDC' / 6-decimal copies, byte-identical to C5 | 5 x IMPERSONATOR/PRECEDENT | 5 x IMPERSONATOR/PRECEDENT | yes | [0xae5d30a48f89e726db16e1b78525fd0151621853cb6e56cad78c542e20a22c8f](https://explorer-studio-dev.genlayer.com/tx/0xae5d30a48f89e726db16e1b78525fd0151621853cb6e56cad78c542e20a22c8f) |
| C12 | CANONICAL | flag base [0x07f3c9Ba9a0C06204C8489B62291d5B0e77615A1](https://base.blockscout.com/token/0x07f3c9Ba9a0C06204C8489B62291d5B0e77615A1) vs `tether` | a 'Tether USD' copy on Base: the list has no Tether on Base, so the pair is refused | refused: the official list does not cover this coin on this chain | refused: the official list does not cover this coin on this chain | yes | [0x27e3935642e22e489e95b2108c7a5ee98a96b3bc2588992dc5507ca6734442c7](https://explorer-studio-dev.genlayer.com/tx/0x27e3935642e22e489e95b2108c7a5ee98a96b3bc2588992dc5507ca6734442c7) |
| S1 | SAFELIST | Safelist.add_token ethereum [0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48](https://eth.blockscout.com/token/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48) | real USDC (CANONICAL case C7 is OFFICIAL) | added | added | yes | [0xea0fcc539659cd9d2baa7bc27d86583c96ede4e29b2a2870ae1a83927b65ebfb](https://explorer-studio-dev.genlayer.com/tx/0xea0fcc539659cd9d2baa7bc27d86583c96ede4e29b2a2870ae1a83927b65ebfb) |
| S2 | SAFELIST | Safelist.add_token arbitrum [0x8Fd886c4021ed69a968f6966F818e476868B00eD](https://arbitrum.blockscout.com/token/0x8Fd886c4021ed69a968f6966F818e476868B00eD) | the C5 fake | refused: IMPERSONATOR | refused: IMPERSONATOR | yes | [0xc24ca6249cf662d604e22687b7be1797855a136e7bea9ed03fe14095825ff313](https://explorer-studio-dev.genlayer.com/tx/0xc24ca6249cf662d604e22687b7be1797855a136e7bea9ed03fe14095825ff313) |
| S3 | SAFELIST | Safelist.add_token arbitrum [0x35E57438a1348e3441501d5F4ea892Bc81009511](https://arbitrum.blockscout.com/token/0x35E57438a1348e3441501d5F4ea892Bc81009511) | a fake nobody has flagged yet (byte-identical to C3): the list has no reason to refuse it | added | added | yes | [0xed3b62defc4eeb03f3bc5dfee3b648ef4dac8a61918a8feb356ea7e3b996c4f6](https://explorer-studio-dev.genlayer.com/tx/0xed3b62defc4eeb03f3bc5dfee3b648ef4dac8a61918a8feb356ea7e3b996c4f6) |
| C13 | CANONICAL | flag arbitrum [0x35E57438a1348e3441501d5F4ea892Bc81009511](https://arbitrum.blockscout.com/token/0x35E57438a1348e3441501d5F4ea892Bc81009511) vs `usd-coin` (case 16) | the same fake, flagged after it was listed | IMPERSONATOR/HOMOGLYPH | IMPERSONATOR/HOMOGLYPH | yes | [0x8b4a086bbdd434e82746261b7fb35cd75735396b095a5d042503916f7cd62a6f](https://explorer-studio-dev.genlayer.com/tx/0x8b4a086bbdd434e82746261b7fb35cd75735396b095a5d042503916f7cd62a6f) |
| S4 | SAFELIST | Safelist.prune arbitrum [0x35E57438a1348e3441501d5F4ea892Bc81009511](https://arbitrum.blockscout.com/token/0x35E57438a1348e3441501d5F4ea892Bc81009511) (from 0x48150242829085eF44fCe01668d77f6691DDe07d) | a different account prunes it now that the register rules it an IMPERSONATOR | pruned | pruned | yes | [0xd67de9d9d30c5b83a626c0a5ddd00c0e066a9f23f244637a4b68bed1055d5b94](https://explorer-studio-dev.genlayer.com/tx/0xd67de9d9d30c5b83a626c0a5ddd00c0e066a9f23f244637a4b68bed1055d5b94) |
| D1 | DEMO | flag base [0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48](https://base.blockscout.com/token/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48) vs `usd-coin` (case 1) | the Ethereum USDC address on Base: no contract there (eth_getCode is empty), so the evidence fails | PENDING | PENDING | yes | [0xebb058f154e00910413ab765360503c0ba58a7038d028b2d07399d3a7b2a2df7](https://explorer-studio-dev.genlayer.com/tx/0xebb058f154e00910413ab765360503c0ba58a7038d028b2d07399d3a7b2a2df7) |
| D2 | DEMO | rule(case 1) | anyone retries before the 5-minute deadline; still no contract | PENDING | PENDING | yes | [0xe9c639b67dc020e4fd061d0425c8ba6393a4252cfa9faba52c5e1705a724f0ac](https://explorer-studio-dev.genlayer.com/tx/0xe9c639b67dc020e4fd061d0425c8ba6393a4252cfa9faba52c5e1705a724f0ac) |
| D3 | DEMO | flag arbitrum [0x8Fd886c4021ed69a968f6966F818e476868B00eD](https://arbitrum.blockscout.com/token/0x8Fd886c4021ed69a968f6966F818e476868B00eD) vs `usd-coin` (case 2) | exact copy, to be rechecked | IMPERSONATOR/EXACT_COPY | IMPERSONATOR/EXACT_COPY | yes | [0x67af44613650713346ac2da9d72c184d5c3b9bf9d504926d038b04c8421981b4](https://explorer-studio-dev.genlayer.com/tx/0x67af44613650713346ac2da9d72c184d5c3b9bf9d504926d038b04c8421981b4) |
| D4 | DEMO | recheck(case 2) | recheck right away | refused: recheck cooldown has not passed | refused: recheck cooldown has not passed | yes | [0xfb998cda5d3f864b59a6fb6d8e01aad6dd08e562cc5cb83f433b034135765627](https://explorer-studio-dev.genlayer.com/tx/0xfb998cda5d3f864b59a6fb6d8e01aad6dd08e562cc5cb83f433b034135765627) |
| D5 | DEMO | recheck(case 2) | after the 3-minute cooldown; history keeps the first ruling | IMPERSONATOR/EXACT_COPY | IMPERSONATOR/EXACT_COPY | yes | [0xf0497728439b6c4a274d69e9c87f431f72b145a5e5233e39ef113f68fcbfb9ec](https://explorer-studio-dev.genlayer.com/tx/0xf0497728439b6c4a274d69e9c87f431f72b145a5e5233e39ef113f68fcbfb9ec) |
| D6 | DEMO | expire(case 1) | after the 5-minute rule window | EXPIRED | EXPIRED | yes | [0x31f7aa938271bb7a716c8e20b50332eadab820844475002025824cd364781dbb](https://explorer-studio-dev.genlayer.com/tx/0x31f7aa938271bb7a716c8e20b50332eadab820844475002025824cd364781dbb) |
| D7 | DEMO | flag base [0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48](https://base.blockscout.com/token/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48) vs `usd-coin` (case 6) | the same key flagged again after EXPIRED: a new case (still no contract at that address on Base) | PENDING | PENDING | yes | [0x99477ee7542ffc55a8578fce480e4d44f7a3fe0938500339db4bf4e9ba06e275](https://explorer-studio-dev.genlayer.com/tx/0x99477ee7542ffc55a8578fce480e4d44f7a3fe0938500339db4bf4e9ba06e275) |
| M1 | DEMO | flag arbitrum [0xEB466342C4d449BC9f53A865D5Cb90586f405215](https://arbitrum.blockscout.com/token/0xEB466342C4d449BC9f53A865D5Cb90586f405215) vs `usd-coin` (case 3) | 'Axelar Wrapped USDC' / 'axlUSDC': model run 1 | VARIANT/MODEL | VARIANT/MODEL | yes | [0x78dbf67739d3dc67ad14ab441480830e6b798bbf7142042c0608e9fe5601f3e9](https://explorer-studio-dev.genlayer.com/tx/0x78dbf67739d3dc67ad14ab441480830e6b798bbf7142042c0608e9fe5601f3e9) |
| M2 | DEMO | flag ethereum [0xBc65ad17c5C0a2A4D159fa5a503f4992c7B545FE](https://eth.blockscout.com/token/0xBc65ad17c5C0a2A4D159fa5a503f4992c7B545FE) vs `usd-coin` (case 4) | 'Spark USDC Vault' / 'sUSDC': model run 1 | UNRELATED/MODEL | UNRELATED/MODEL | yes | [0x99ce236f027e3aaef7ad5a5f2c180f2389a2154060934c806d12e68466436454](https://explorer-studio-dev.genlayer.com/tx/0x99ce236f027e3aaef7ad5a5f2c180f2389a2154060934c806d12e68466436454) |
| M3 | DEMO | flag arbitrum [0xE3F520d5C6f5421eE02160242f7a9e025d829E3e](https://arbitrum.blockscout.com/token/0xE3F520d5C6f5421eE02160242f7a9e025d829E3e) vs `usd-coin` (case 5) | real fake: 'Bridged USDC' / 'USDC.e' padded with invisible characters: model run 1 | IMPERSONATOR/MODEL | VARIANT/MODEL | **no** | [0xcdb9ed9e32b734ba2956c373a177df006ecbaf39604c6234df2e2d318f314df9](https://explorer-studio-dev.genlayer.com/tx/0xcdb9ed9e32b734ba2956c373a177df006ecbaf39604c6234df2e2d318f314df9) |
| M1r | DEMO | recheck(case 3) | 'Axelar Wrapped USDC' / 'axlUSDC': model run 2 (recheck) | VARIANT/MODEL | VARIANT/MODEL | yes | [0x5a9e48e8cf1ccd539caee9d5e0dc366616ac711bae39e6e60fb7198e9901a996](https://explorer-studio-dev.genlayer.com/tx/0x5a9e48e8cf1ccd539caee9d5e0dc366616ac711bae39e6e60fb7198e9901a996) |
| M2r | DEMO | recheck(case 4) | 'Spark USDC Vault' / 'sUSDC': model run 2 (recheck) | UNRELATED/MODEL | UNRELATED/MODEL | yes | [0xbf12a69177ad1dd5155b703a6a5e8bdf255795996c16343df7bc3c05c6b37045](https://explorer-studio-dev.genlayer.com/tx/0xbf12a69177ad1dd5155b703a6a5e8bdf255795996c16343df7bc3c05c6b37045) |
| M3r | DEMO | recheck(case 5) | real fake: 'Bridged USDC' / 'USDC.e' padded with invisible characters: model run 2 (recheck) | IMPERSONATOR/MODEL | VARIANT/MODEL | **no** | [0xbbf87a4ec668814b4570c064b9a19200d8b2841340221b737c84a86499541c69](https://explorer-studio-dev.genlayer.com/tx/0xbbf87a4ec668814b4570c064b9a19200d8b2841340221b737c84a86499541c69) |

## Did not match

- C10: expected UNRELATED/NO_BRAND_MATCH, got UNRELATED/LISTED_OTHER. USDS is on the Uniswap default list on Ethereum (as USDS, 'USDS Stablecoin'), so rule 2b (LISTED_OTHER) decides it before rule 3 would. The outcome, UNRELATED, is as expected; the basis expectation was written before rule 2b existed. No contract change.
- M3: expected IMPERSONATOR/MODEL, got VARIANT/MODEL. The model ruled this real fake ('Bridged USDC' / 'USDC.e' padded with invisible characters) VARIANT, and ruled it VARIANT again on recheck (M3r). Validators agreed each time. Its symbol skeleton is USDCE, not USDC, so rule 4 does not apply; the name openly says 'Bridged', which fits the VARIANT definition. IMPERSONATOR was my expectation. Hidden characters inside a disclosed bridge name are left to the model (README, known limits).
- M3r: expected IMPERSONATOR/MODEL, got VARIANT/MODEL. Same as M3: second model run, same label.

## MODEL cases judged twice (DEMO)

Each was flagged (model run 1, all validators asked the model and agreed on one label) and rechecked after the cooldown (model run 2).

| Case | Token | Run 1 | Run 2 |
|---|---|---|---|
| M1 (case 3) | 'Axelar Wrapped USDC' / 'axlUSDC' | VARIANT/MODEL | VARIANT/MODEL |
| M2 (case 4) | 'Spark USDC Vault' / 'sUSDC' | UNRELATED/MODEL | UNRELATED/MODEL |
| M3 (case 5) | real fake: 'Bridged USDC' / 'USDC.e' padded with invisible characters | VARIANT/MODEL | VARIANT/MODEL |

## Recheck history (DEMO case 2)

| # | Label | Basis | At (unix) | Evidence sha256 |
|---|---|---|---|---|
| 1 | IMPERSONATOR | EXACT_COPY | 1790753357 | `7155a55ce84fac6dca2f886d946e017f398a575f29cde02dfce04d930cac2ecf` |
| 2 | IMPERSONATOR | EXACT_COPY | 1790753721 | `7155a55ce84fac6dca2f886d946e017f398a575f29cde02dfce04d930cac2ecf` |

The first ruling is kept, not overwritten.

## Safelist after S1-S4

Listed:

```json
[
  {
    "added_at": "2026-09-30T07:34:11.860167Z",
    "chain": "ethereum",
    "token": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
  }
]
```

Pruned:

```json
[
  {
    "added_at": "2026-09-30T07:34:37.146001Z",
    "chain": "arbitrum",
    "removed_at": "2026-09-30T07:35:06.846646Z",
    "token": "0x35e57438a1348e3441501d5f4ea892bc81009511"
  }
]
```

## Stats after seeding

```json
{
  "CANONICAL": {
    "by_state": {
      "EXPIRED": 0,
      "IMPERSONATOR": 12,
      "OFFICIAL": 1,
      "PENDING": 0,
      "UNRELATED": 1,
      "VARIANT": 2
    },
    "cases": 16,
    "model_rulings": 1,
    "precedent_flags": 5,
    "rechecks": 0
  },
  "DEMO": {
    "by_state": {
      "EXPIRED": 1,
      "IMPERSONATOR": 1,
      "OFFICIAL": 0,
      "PENDING": 1,
      "UNRELATED": 1,
      "VARIANT": 2
    },
    "cases": 6,
    "model_rulings": 6,
    "precedent_flags": 0,
    "rechecks": 4
  }
}
```
