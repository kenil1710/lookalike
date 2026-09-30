# Seeds (studio-dev)

Every row is a real transaction on real token data. Contracts: CANONICAL [`0xeBA36999B79522e5A2C7436c65793168379A2993`](https://explorer-studio-dev.genlayer.com/address/0xeBA36999B79522e5A2C7436c65793168379A2993), DEMO [`0x950A1c0E2D4e82DBCE16DB33e84750cC267bEC0B`](https://explorer-studio-dev.genlayer.com/address/0x950A1c0E2D4e82DBCE16DB33e84750cC267bEC0B), SAFELIST [`0x81C12863f346a85eE4ee5c7a4AdE27D1AD7E54CE`](https://explorer-studio-dev.genlayer.com/address/0x81C12863f346a85eE4ee5c7a4AdE27D1AD7E54CE). Raw records (returned values, case JSON, history) are in [seed-evidence.json](seed-evidence.json). Token links go to Blockscout.

| Step | Instance | Call | Token | Expected | Actual | Match | Tx |
|---|---|---|---|---|---|---|---|
| C1 | CANONICAL | flag arbitrum [0xEbb993F7C5477016A0a025A790Dd079dfe3Eca9D](https://arbitrum.blockscout.com/token/0xEbb993F7C5477016A0a025A790Dd079dfe3Eca9D) vs `usd-coin` (case 1) | "USD Coin" / "USDC" with Cyrillic С and о plus invisible U+206B/U+FEFF/U+200B | IMPERSONATOR/HOMOGLYPH | IMPERSONATOR/HOMOGLYPH | yes | [0xaaf93c6fb69fe93ace18ca1fe80ab09c545eaee8171f7305b9c546b160255d59](https://explorer-studio-dev.genlayer.com/tx/0xaaf93c6fb69fe93ace18ca1fe80ab09c545eaee8171f7305b9c546b160255d59) |
| C2 | CANONICAL | flag arbitrum [0xdaECe7e93993394063a01BB39145A7d71d4df8f1](https://arbitrum.blockscout.com/token/0xdaECe7e93993394063a01BB39145A7d71d4df8f1) vs `usd-coin` (case 2) | "U+FEFF SD Coin" / "U+FEFF SDC": byte-order mark inside | IMPERSONATOR/HOMOGLYPH | IMPERSONATOR/HOMOGLYPH | yes | [0x7d6dcedcbf196fbee28bab61d68a30ce3bbb10070aa7453a383cbce9ed12b072](https://explorer-studio-dev.genlayer.com/tx/0x7d6dcedcbf196fbee28bab61d68a30ce3bbb10070aa7453a383cbce9ed12b072) |
| C3 | CANONICAL | flag arbitrum [0x72224ea851b18d56065E7ebe355a246A66F5ce2E](https://arbitrum.blockscout.com/token/0x72224ea851b18d56065E7ebe355a246A66F5ce2E) vs `usd-coin` (case 3) | "USD Coin" / "U+206F SD U+200D C" | IMPERSONATOR/HOMOGLYPH | IMPERSONATOR/HOMOGLYPH | yes | [0xf1145f6aa9ca0e7cfde0f47c6d1bcf83823d2476969ad7e378e319649a03ac16](https://explorer-studio-dev.genlayer.com/tx/0xf1145f6aa9ca0e7cfde0f47c6d1bcf83823d2476969ad7e378e319649a03ac16) |
| C4 | CANONICAL | flag arbitrum [0x2790AfA96A254142a13C24A7BE2C35afC784b82a](https://arbitrum.blockscout.com/token/0x2790AfA96A254142a13C24A7BE2C35afC784b82a) vs `tether` (case 4) | "Tet U+FEFF her USD" / "U U+200C SDT" | IMPERSONATOR/HOMOGLYPH | IMPERSONATOR/HOMOGLYPH | yes | [0xdfa6b7e04093019534f8e1703fd62450bba92f042e915c06607edee7c5d302f1](https://explorer-studio-dev.genlayer.com/tx/0xdfa6b7e04093019534f8e1703fd62450bba92f042e915c06607edee7c5d302f1) |
| C5 | CANONICAL | flag arbitrum [0x8Fd886c4021ed69a968f6966F818e476868B00eD](https://arbitrum.blockscout.com/token/0x8Fd886c4021ed69a968f6966F818e476868B00eD) vs `usd-coin` (case 5) | "USDC" / "USDC", 6 decimals, not the official Arbitrum USDC | IMPERSONATOR/EXACT_COPY | IMPERSONATOR/EXACT_COPY | yes | [0x0542c34e596eaac8f79e4a00f143eb1146e0d01e8dc57566609377dc8afe7224](https://explorer-studio-dev.genlayer.com/tx/0x0542c34e596eaac8f79e4a00f143eb1146e0d01e8dc57566609377dc8afe7224) |
| C6 | CANONICAL | flag base [0x07f3c9Ba9a0C06204C8489B62291d5B0e77615A1](https://base.blockscout.com/token/0x07f3c9Ba9a0C06204C8489B62291d5B0e77615A1) vs `tether` (case 6) | "Tether USD" / "USDT" on Base, 18 decimals | IMPERSONATOR/EXACT_COPY | IMPERSONATOR/EXACT_COPY | yes | [0x162cdfc6051cdbb7ced506e097553a1458aed9c89d396c93c55e61590bd916de](https://explorer-studio-dev.genlayer.com/tx/0x162cdfc6051cdbb7ced506e097553a1458aed9c89d396c93c55e61590bd916de) |
| C7 | CANONICAL | flag ethereum [0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48](https://eth.blockscout.com/token/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48) vs `usd-coin` (case 7) | real USDC on Ethereum | OFFICIAL/OFFICIAL_LIST | OFFICIAL/OFFICIAL_LIST | yes | [0xb3ac752e7b35a096bce3ce07501968005ec2a0b56f02ca0a92fbd4df38665fab](https://explorer-studio-dev.genlayer.com/tx/0xb3ac752e7b35a096bce3ce07501968005ec2a0b56f02ca0a92fbd4df38665fab) |
| C8 | CANONICAL | flag arbitrum [0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8](https://arbitrum.blockscout.com/token/0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8) vs `usd-coin` (case 8) | real bridged USDC.e on Arbitrum, "Arbitrum Bridged USDC (Arbitrum)" / "USDC.E" | VARIANT/MODEL | VARIANT/MODEL | yes | [0x8098a4b4ec86285c7ab042761fb10932b0d2c653fb526eff5a4d84dac52afe84](https://explorer-studio-dev.genlayer.com/tx/0x8098a4b4ec86285c7ab042761fb10932b0d2c653fb526eff5a4d84dac52afe84) |
| C9 | CANONICAL | flag ethereum [0xdC035D45d973E3EC169d2276DDab16f1e407384F](https://eth.blockscout.com/token/0xdC035D45d973E3EC169d2276DDab16f1e407384F) vs `usd-coin` (case 9) | Sky "USDS" / "USDS": a different dollar token | UNRELATED/NO_BRAND_MATCH | UNRELATED/NO_BRAND_MATCH | yes | [0x616b4691c43d311f08bed114bda012765e70c9d72f207ba095ae81736be7d8a5](https://explorer-studio-dev.genlayer.com/tx/0x616b4691c43d311f08bed114bda012765e70c9d72f207ba095ae81736be7d8a5) |
| C10 | CANONICAL | flag_by_precedent (precedent case 5): [0x293971FC9f23AddadfB5bE29a4542C0E2BF67ba8](https://arbitrum.blockscout.com/token/0x293971FC9f23AddadfB5bE29a4542C0E2BF67ba8), [0x1C1dEB401E94f4826260Ca888E53180819449714](https://arbitrum.blockscout.com/token/0x1C1dEB401E94f4826260Ca888E53180819449714), [0x755A31d5dDbF5Cb69B15d50a01a0ea1ae15Ce474](https://arbitrum.blockscout.com/token/0x755A31d5dDbF5Cb69B15d50a01a0ea1ae15Ce474), [0xCd5503c3718C2303Bf958538cF94FcB5606E4E01](https://arbitrum.blockscout.com/token/0xCd5503c3718C2303Bf958538cF94FcB5606E4E01), [0x0dFCCeB1147e0Ff11a442602a245E34D2FEBC977](https://arbitrum.blockscout.com/token/0x0dFCCeB1147e0Ff11a442602a245E34D2FEBC977) | five more "USDC" / "USDC" / 6-decimal copies, byte-identical to C5 | 5 x IMPERSONATOR/PRECEDENT | 5 x IMPERSONATOR/PRECEDENT | yes | [0xdeaec30dde8e811cb40eff54ce9bb2937c8f46966cd8289c961e604d89d11aa0](https://explorer-studio-dev.genlayer.com/tx/0xdeaec30dde8e811cb40eff54ce9bb2937c8f46966cd8289c961e604d89d11aa0) |
| S1 | SAFELIST | Safelist.add_token ethereum [0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48](https://eth.blockscout.com/token/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48) | real USDC (CANONICAL case C7 is OFFICIAL) | added | added | yes | [0xed7c4f89ec999544b81ea41ede9ab1b44623a1c3b4fc17d68209f367e4b9adca](https://explorer-studio-dev.genlayer.com/tx/0xed7c4f89ec999544b81ea41ede9ab1b44623a1c3b4fc17d68209f367e4b9adca) |
| S2 | SAFELIST | Safelist.add_token arbitrum [0x8Fd886c4021ed69a968f6966F818e476868B00eD](https://arbitrum.blockscout.com/token/0x8Fd886c4021ed69a968f6966F818e476868B00eD) | the C5 fake | refused: IMPERSONATOR | refused: IMPERSONATOR | yes | [0x8c50d6aa7f346510a6f7f527773b87a219e4d798df320dfe68660cbe261f5aff](https://explorer-studio-dev.genlayer.com/tx/0x8c50d6aa7f346510a6f7f527773b87a219e4d798df320dfe68660cbe261f5aff) |
| D1 | DEMO | flag base [0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48](https://base.blockscout.com/token/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48) vs `usd-coin` (case 1) | the Ethereum USDC address on Base: no token there, Blockscout answers 404, so the evidence fails | PENDING | PENDING | yes | [0x3e664fac444810f4035fb2276b27db4ec84576e89c6016cdcbdc288c70b727b4](https://explorer-studio-dev.genlayer.com/tx/0x3e664fac444810f4035fb2276b27db4ec84576e89c6016cdcbdc288c70b727b4) |
| D2 | DEMO | rule(case 1) | anyone retries before the 5-minute deadline; still 404 | PENDING | PENDING | yes | [0x045706cc15a511b33625e812dd034f4b70629c6c73f3377e0c4e2633eca40769](https://explorer-studio-dev.genlayer.com/tx/0x045706cc15a511b33625e812dd034f4b70629c6c73f3377e0c4e2633eca40769) |
| D3 | DEMO | flag arbitrum [0x8Fd886c4021ed69a968f6966F818e476868B00eD](https://arbitrum.blockscout.com/token/0x8Fd886c4021ed69a968f6966F818e476868B00eD) vs `usd-coin` (case 2) | exact copy, to be rechecked | IMPERSONATOR/EXACT_COPY | IMPERSONATOR/EXACT_COPY | yes | [0x3cdbb653b4f2149b72aeb81234603feba9d8778f6d8cd5e55f036738ac9b1467](https://explorer-studio-dev.genlayer.com/tx/0x3cdbb653b4f2149b72aeb81234603feba9d8778f6d8cd5e55f036738ac9b1467) |
| D4 | DEMO | recheck(case 2) | recheck right away | refused: recheck cooldown has not passed | refused: recheck cooldown has not passed | yes | [0x105aa5c62137d2bbbb07962fc3c474fd7c997d81535ab41f054735aaf7826bbe](https://explorer-studio-dev.genlayer.com/tx/0x105aa5c62137d2bbbb07962fc3c474fd7c997d81535ab41f054735aaf7826bbe) |
| D5 | DEMO | recheck(case 2) | after the 3-minute cooldown; history keeps the first ruling | IMPERSONATOR/EXACT_COPY | IMPERSONATOR/EXACT_COPY | yes | [0x3390d7754b3fb9f33020bd3bc59d5ba39a1ce4c9a5903db58c395d0b3ab095ae](https://explorer-studio-dev.genlayer.com/tx/0x3390d7754b3fb9f33020bd3bc59d5ba39a1ce4c9a5903db58c395d0b3ab095ae) |
| D6 | DEMO | expire(case 1) | after the 5-minute rule window | EXPIRED | EXPIRED | yes | [0xcbb631121e26fe0c8867fa5e23187bd11e0246270864adb47c2365617750ae41](https://explorer-studio-dev.genlayer.com/tx/0xcbb631121e26fe0c8867fa5e23187bd11e0246270864adb47c2365617750ae41) |
| D7 | DEMO | flag base [0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48](https://base.blockscout.com/token/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48) vs `usd-coin` (case 3) | the same key flagged again after EXPIRED: a new case (still no token at that address on Base) | PENDING | PENDING | yes | [0x4196ce0b2659817d1b036353202c760e68b3ac7f36abc9c18e1299d951964b2d](https://explorer-studio-dev.genlayer.com/tx/0x4196ce0b2659817d1b036353202c760e68b3ac7f36abc9c18e1299d951964b2d) |

All steps matched their expected outcome.

## Recheck history (DEMO case 2)

| # | Label | Basis | At (unix) | Evidence sha256 |
|---|---|---|---|---|
| 1 | IMPERSONATOR | EXACT_COPY | 1790747153 | `edea261d6edcdc132839634ab57ff887ba7897e922399da1f0c94b357b69a0d0` |
| 2 | IMPERSONATOR | EXACT_COPY | 1790747378 | `edea261d6edcdc132839634ab57ff887ba7897e922399da1f0c94b357b69a0d0` |

The token did not rename between the two rulings, so both entries agree; the first is kept, not overwritten.

## Safelist contents after S1/S2

```json
[
  {
    "added_at": "2026-09-30T05:49:12.516155Z",
    "chain": "ethereum",
    "token": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
  }
]
```

## Stats after seeding

```json
{
  "CANONICAL": {
    "by_state": {
      "EXPIRED": 0,
      "IMPERSONATOR": 11,
      "OFFICIAL": 1,
      "PENDING": 0,
      "UNRELATED": 1,
      "VARIANT": 1
    },
    "cases": 14,
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
      "UNRELATED": 0,
      "VARIANT": 0
    },
    "cases": 3,
    "model_rulings": 0,
    "precedent_flags": 0,
    "rechecks": 1
  }
}
```
