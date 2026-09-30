# Seeds (studio-dev)

Every row is a real transaction on real token data. Contracts: CANONICAL [`0x0B448534e504B7d5D0ABfB89e7c57A290D80e705`](https://explorer-studio-dev.genlayer.com/address/0x0B448534e504B7d5D0ABfB89e7c57A290D80e705), DEMO [`0xe57c00C57372B7E88a9C485C323b6296a6Cbfd7a`](https://explorer-studio-dev.genlayer.com/address/0xe57c00C57372B7E88a9C485C323b6296a6Cbfd7a), SAFELIST [`0xc70C20F28d125e318BCAD28dBD84d51d8DBADa2A`](https://explorer-studio-dev.genlayer.com/address/0xc70C20F28d125e318BCAD28dBD84d51d8DBADa2A), deployed from commit `371643122632332d289a12356481a46bf524aef0`. Raw records (returned values, case JSON, history) are in [seed-evidence.json](seed-evidence.json). Token links go to each chain's explorer for people; the contract itself reads name, symbol and decimals with eth_call.

| Step | Instance | Call | Token | Expected | Actual | Match | Tx |
|---|---|---|---|---|---|---|---|
| C1 | CANONICAL | flag arbitrum [0xEbb993F7C5477016A0a025A790Dd079dfe3Eca9D](https://arbitrum.blockscout.com/token/0xEbb993F7C5477016A0a025A790Dd079dfe3Eca9D) vs `usd-coin` (case 1) | on chain: 'USD Coin' / 'USDC' with Cyrillic ES and o plus invisible U+206B, U+FEFF, U+200B | IMPERSONATOR/HOMOGLYPH | IMPERSONATOR/HOMOGLYPH | yes | [0x27c0ee319052e757d892dcfc9c7e620ad8ca5bc611a065e8be1b37d6ff0e8543](https://explorer-studio-dev.genlayer.com/tx/0x27c0ee319052e757d892dcfc9c7e620ad8ca5bc611a065e8be1b37d6ff0e8543) |
| C2 | CANONICAL | flag arbitrum [0xdaECe7e93993394063a01BB39145A7d71d4df8f1](https://arbitrum.blockscout.com/token/0xdaECe7e93993394063a01BB39145A7d71d4df8f1) vs `usd-coin` (case 2) | 'U+FEFF SD Coin' / 'U+FEFF SDC': byte-order mark inside | IMPERSONATOR/HOMOGLYPH | IMPERSONATOR/HOMOGLYPH | yes | [0x6293547adbbd18d3e895f9f6792b69042c03a063894df80ee28b55370d33bcc4](https://explorer-studio-dev.genlayer.com/tx/0x6293547adbbd18d3e895f9f6792b69042c03a063894df80ee28b55370d33bcc4) |
| C3 | CANONICAL | flag arbitrum [0x72224ea851b18d56065E7ebe355a246A66F5ce2E](https://arbitrum.blockscout.com/token/0x72224ea851b18d56065E7ebe355a246A66F5ce2E) vs `usd-coin` (case 3) | 'USD Coin' / 'U U+206F SD U+200D C' | IMPERSONATOR/HOMOGLYPH | IMPERSONATOR/HOMOGLYPH | yes | [0xf2d5802dd4039e548e697f4528f05742012cbf0cd8343a12c81079ee3d3f5ad2](https://explorer-studio-dev.genlayer.com/tx/0xf2d5802dd4039e548e697f4528f05742012cbf0cd8343a12c81079ee3d3f5ad2) |
| C4 | CANONICAL | flag arbitrum [0x2790AfA96A254142a13C24A7BE2C35afC784b82a](https://arbitrum.blockscout.com/token/0x2790AfA96A254142a13C24A7BE2C35afC784b82a) vs `tether` (case 4) | 'Tet U+FEFF her USD' / 'U U+200C SDT' | IMPERSONATOR/HOMOGLYPH | IMPERSONATOR/HOMOGLYPH | yes | [0xd19e13c7ea7b00015d7c76abb347c9956286698d6723df736563d067fbaaaa78](https://explorer-studio-dev.genlayer.com/tx/0xd19e13c7ea7b00015d7c76abb347c9956286698d6723df736563d067fbaaaa78) |
| C5 | CANONICAL | flag arbitrum [0x8Fd886c4021ed69a968f6966F818e476868B00eD](https://arbitrum.blockscout.com/token/0x8Fd886c4021ed69a968f6966F818e476868B00eD) vs `usd-coin` (case 5) | 'USDC' / 'USDC', 6 decimals, not the official Arbitrum USDC | IMPERSONATOR/LISTED_COPY | IMPERSONATOR/LISTED_COPY | yes | [0xedcca3b6dcb10a8c6b70770d258c4b12ab1d6772e2f9050e7c7ba2a2b00a409c](https://explorer-studio-dev.genlayer.com/tx/0xedcca3b6dcb10a8c6b70770d258c4b12ab1d6772e2f9050e7c7ba2a2b00a409c) |
| C6 | CANONICAL | flag arbitrum [0x413f1661a78A9675C95E33D63b0c90DBD747c43B](https://arbitrum.blockscout.com/token/0x413f1661a78A9675C95E33D63b0c90DBD747c43B) vs `tether` (case 6) | 'USDT' / 'USDT' on Arbitrum (the official Tether there is USDT0) | IMPERSONATOR/LISTED_COPY | IMPERSONATOR/LISTED_COPY | yes | [0x5bcc77307b699302dc98eb38b1dc8d5b8068df07f5f1387d5e2d1ba97f377e87](https://explorer-studio-dev.genlayer.com/tx/0x5bcc77307b699302dc98eb38b1dc8d5b8068df07f5f1387d5e2d1ba97f377e87) |
| C7 | CANONICAL | flag ethereum [0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48](https://eth.blockscout.com/token/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48) vs `usd-coin` (case 7) | real USDC on Ethereum | OFFICIAL/OFFICIAL_LIST | OFFICIAL/OFFICIAL_LIST | yes | [0x713235b66458643d1e91aa122d8fff295121b0a4d5a35e28cd8002e15bd3a206](https://explorer-studio-dev.genlayer.com/tx/0x713235b66458643d1e91aa122d8fff295121b0a4d5a35e28cd8002e15bd3a206) |
| C8 | CANONICAL | flag arbitrum [0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8](https://arbitrum.blockscout.com/token/0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8) vs `usd-coin` (case 8) | real bridged USDC.e: on chain it says 'USD Coin (Arb1)' / 'USDC'; the list carries this address as USDC.e 'Bridged USDC' | VARIANT/LISTED_VARIANT | VARIANT/LISTED_VARIANT | yes | [0x3b841c97a1652aa387a1a28e76894512edf99852a93dcd8a067afcab81dd77b0](https://explorer-studio-dev.genlayer.com/tx/0x3b841c97a1652aa387a1a28e76894512edf99852a93dcd8a067afcab81dd77b0) |
| C9 | CANONICAL | flag arbitrum [0xEB466342C4d449BC9f53A865D5Cb90586f405215](https://arbitrum.blockscout.com/token/0xEB466342C4d449BC9f53A865D5Cb90586f405215) vs `usd-coin` (case 9) | 'Axelar Wrapped USDC' / 'axlUSDC', not on the list | VARIANT/MODEL | VARIANT/MODEL | yes | [0xb96d495d6ad10ca4f75c0289e85aca0288cad21f15a68007d2063484ece07f4a](https://explorer-studio-dev.genlayer.com/tx/0xb96d495d6ad10ca4f75c0289e85aca0288cad21f15a68007d2063484ece07f4a) |
| C10 | CANONICAL | flag ethereum [0xdC035D45d973E3EC169d2276DDab16f1e407384F](https://eth.blockscout.com/token/0xdC035D45d973E3EC169d2276DDab16f1e407384F) vs `usd-coin` (case 10) | Sky 'USDS Stablecoin' / 'USDS': a different dollar token, on the list as USDS | UNRELATED/LISTED_OTHER | UNRELATED/LISTED_OTHER | yes | [0x91a3ba1ed3994f732e7ade554d6f340a95277022ba9b18fd1a2a34000294d804](https://explorer-studio-dev.genlayer.com/tx/0x91a3ba1ed3994f732e7ade554d6f340a95277022ba9b18fd1a2a34000294d804) |
| C11 | CANONICAL | flag_by_precedent (precedent case 5): [0x293971FC9f23AddadfB5bE29a4542C0E2BF67ba8](https://arbitrum.blockscout.com/token/0x293971FC9f23AddadfB5bE29a4542C0E2BF67ba8), [0x1C1dEB401E94f4826260Ca888E53180819449714](https://arbitrum.blockscout.com/token/0x1C1dEB401E94f4826260Ca888E53180819449714), [0x755A31d5dDbF5Cb69B15d50a01a0ea1ae15Ce474](https://arbitrum.blockscout.com/token/0x755A31d5dDbF5Cb69B15d50a01a0ea1ae15Ce474), [0xCd5503c3718C2303Bf958538cF94FcB5606E4E01](https://arbitrum.blockscout.com/token/0xCd5503c3718C2303Bf958538cF94FcB5606E4E01), [0x0dFCCeB1147e0Ff11a442602a245E34D2FEBC977](https://arbitrum.blockscout.com/token/0x0dFCCeB1147e0Ff11a442602a245E34D2FEBC977) | five more 'USDC' / 'USDC' / 6-decimal copies, byte-identical to C5 | 5 x IMPERSONATOR/PRECEDENT | 5 x IMPERSONATOR/PRECEDENT | yes | [0x2189eed64eff4f5a03e9c628b6efd49528d2585488639f41b92061f21ed772a2](https://explorer-studio-dev.genlayer.com/tx/0x2189eed64eff4f5a03e9c628b6efd49528d2585488639f41b92061f21ed772a2) |
| C12 | CANONICAL | flag base [0x07f3c9Ba9a0C06204C8489B62291d5B0e77615A1](https://base.blockscout.com/token/0x07f3c9Ba9a0C06204C8489B62291d5B0e77615A1) vs `tether` | a 'Tether USD' copy on Base: the list has no Tether on Base, so the pair is refused | refused: the official list does not cover this coin on this chain | refused: the official list does not cover this coin on this chain | yes | [0x342150f48d0db212df6edbe46987e52fe9dcf2089b4b181baf5f390ba94563c0](https://explorer-studio-dev.genlayer.com/tx/0x342150f48d0db212df6edbe46987e52fe9dcf2089b4b181baf5f390ba94563c0) |
| H1 | CANONICAL | flag arbitrum [0xe1De3977D7909499642fee317818Ae698C841079](https://arbitrum.blockscout.com/token/0xe1De3977D7909499642fee317818Ae698C841079) vs `usd-coin` (case 16) | route A: 'Bridged USDC' / 'USDC.e', the list's own label for USDC.e, at another address | IMPERSONATOR/LISTED_COPY | IMPERSONATOR/LISTED_COPY | yes | [0x9bc8ef34a65a9b43966af3b285d2512390309852dc6fd5585a9fcf82d4dcd613](https://explorer-studio-dev.genlayer.com/tx/0x9bc8ef34a65a9b43966af3b285d2512390309852dc6fd5585a9fcf82d4dcd613) |
| H2 | CANONICAL | flag_by_precedent (precedent case 16): [0xC79Ea482222e56C7976284649F4C4AB7720C271A](https://arbitrum.blockscout.com/token/0xC79Ea482222e56C7976284649F4C4AB7720C271A), [0x9a678BEC1a1eeAABAd1A9e22E3716e0fc9Cc99F5](https://arbitrum.blockscout.com/token/0x9a678BEC1a1eeAABAd1A9e22E3716e0fc9Cc99F5) | route A + G: two more byte-identical 'Bridged USDC' / 'USDC.e' copies, batched on H1 | 2 x IMPERSONATOR/PRECEDENT | 2 x IMPERSONATOR/PRECEDENT | yes | [0xc5c776c5d2cc9f54bd0aed859a20afcf4e856e0831a6cad1bdbf10047007139f](https://explorer-studio-dev.genlayer.com/tx/0xc5c776c5d2cc9f54bd0aed859a20afcf4e856e0831a6cad1bdbf10047007139f) |
| H3 | CANONICAL | flag arbitrum [0x9559136B1069715CCCe06b59ed3B9874e1213169](https://arbitrum.blockscout.com/token/0x9559136B1069715CCCe06b59ed3B9874e1213169) vs `usd-coin` (case 19) | route A: 'USD Coin Bridged' / 'USDC.e' | IMPERSONATOR/LISTED_COPY | IMPERSONATOR/LISTED_COPY | yes | [0xe31c1f9f8c383baf3ccea9ce3c6a8b28e7c97428a89422d0e2c98ee8aa0025ab](https://explorer-studio-dev.genlayer.com/tx/0xe31c1f9f8c383baf3ccea9ce3c6a8b28e7c97428a89422d0e2c98ee8aa0025ab) |
| H4 | CANONICAL | flag arbitrum [0x091aF852874B4885F9D89cB6cC6A85538a4223fe](https://arbitrum.blockscout.com/token/0x091aF852874B4885F9D89cB6cC6A85538a4223fe) vs `usd-coin` (case 20) | route C: 'Lens Bridged USDC (Lens)' / 'USDC': a wallet shows USDC | IMPERSONATOR/LISTED_COPY | IMPERSONATOR/LISTED_COPY | yes | [0xb51dc2907340746ef543a9ca1f34161b09523bfb119a8cef6cc87203de2bb1c6](https://explorer-studio-dev.genlayer.com/tx/0xb51dc2907340746ef543a9ca1f34161b09523bfb119a8cef6cc87203de2bb1c6) |
| H5 | CANONICAL | flag arbitrum [0x0EDa1A5Aa9AB156604fE174A1a4505588ccE2E72](https://arbitrum.blockscout.com/token/0x0EDa1A5Aa9AB156604fE174A1a4505588ccE2E72) vs `usd-coin` (case 21) | route C: 'Zero Network Bridged USDC (Zero Network)' / 'USDC' | IMPERSONATOR/LISTED_COPY | IMPERSONATOR/LISTED_COPY | yes | [0x4c48cd7a7f673d404098c7839da122adee726751f25a22cabdb266c4caa29ed7](https://explorer-studio-dev.genlayer.com/tx/0x4c48cd7a7f673d404098c7839da122adee726751f25a22cabdb266c4caa29ed7) |
| H6 | CANONICAL | flag arbitrum [0xcE0470d23Ea6c86A3dF9E1008aAbDfFAEeF8F2f0](https://arbitrum.blockscout.com/token/0xcE0470d23Ea6c86A3dF9E1008aAbDfFAEeF8F2f0) vs `tether` (case 22) | route D: 'USDT0' / 'USDT0', Tether's listed Arbitrum symbol, at another address | IMPERSONATOR/LISTED_COPY | IMPERSONATOR/LISTED_COPY | yes | [0x03f94192fb5b4bcce563a6535564b315cdf5b1b0565b5a0b8adacbee8ed50439](https://explorer-studio-dev.genlayer.com/tx/0x03f94192fb5b4bcce563a6535564b315cdf5b1b0565b5a0b8adacbee8ed50439) |
| H7 | CANONICAL | flag arbitrum [0x6f0a3Fc26f0C1Ae046746dC70aAc61e032d84B52](https://arbitrum.blockscout.com/token/0x6f0a3Fc26f0C1Ae046746dC70aAc61e032d84B52) vs `tether` (case 23) | route D: another 'USDT0' / 'USDT0' | IMPERSONATOR/LISTED_COPY | IMPERSONATOR/LISTED_COPY | yes | [0x6a3056e23ee3f12b87601c49f23e4b5ed1f20ab2a5aae483c25781830f04d31f](https://explorer-studio-dev.genlayer.com/tx/0x6a3056e23ee3f12b87601c49f23e4b5ed1f20ab2a5aae483c25781830f04d31f) |
| H8 | CANONICAL | flag arbitrum [0xE0FB0F453aBfbd74368074cf0291711FC82cBc07](https://arbitrum.blockscout.com/token/0xE0FB0F453aBfbd74368074cf0291711FC82cBc07) vs `tether` (case 24) | route D: 'Fake USD(Tugrik)0' / 'USDT0' | IMPERSONATOR/HOMOGLYPH | IMPERSONATOR/HOMOGLYPH | yes | [0xea6008891b73465eb56588186a62492e2d1c3c18753928f34a31c5b182a338d0](https://explorer-studio-dev.genlayer.com/tx/0xea6008891b73465eb56588186a62492e2d1c3c18753928f34a31c5b182a338d0) |
| H9 | CANONICAL | flag arbitrum [0xE3F520d5C6f5421eE02160242f7a9e025d829E3e](https://arbitrum.blockscout.com/token/0xE3F520d5C6f5421eE02160242f7a9e025d829E3e) vs `usd-coin` (case 25) | route E: seed M3, 'Bridged USDC' / 'USDC.e' padded with invisible characters | IMPERSONATOR/HOMOGLYPH | IMPERSONATOR/HOMOGLYPH | yes | [0x436e8235820fb88f5ae0a7246ee0f94c437a4c6553dc5430b539993422a9d0ef](https://explorer-studio-dev.genlayer.com/tx/0x436e8235820fb88f5ae0a7246ee0f94c437a4c6553dc5430b539993422a9d0ef) |
| H10 | CANONICAL | flag arbitrum [0x6aed705A1E8E7bE9A3965743CBDc35FC9252D17A](https://arbitrum.blockscout.com/token/0x6aed705A1E8E7bE9A3965743CBDc35FC9252D17A) vs `usd-coin` (case 26) | route F: 'Bridged USDC' / 'Visit https://circle-v2.xyz to claim rewards', no decimals() | IMPERSONATOR/LISTED_COPY | PENDING | PENDING first, ruled by H10-rule | [0x47775b9900c840bf14f4b23b8752d5ccb794f94acbdd3f89f6f00c9f93863dac](https://explorer-studio-dev.genlayer.com/tx/0x47775b9900c840bf14f4b23b8752d5ccb794f94acbdd3f89f6f00c9f93863dac) |
| H10-rule | CANONICAL | rule(case 26) (case 26) | retry: the first read left case 26 PENDING (the list could not be read); anyone may call rule() before the deadline | IMPERSONATOR/LISTED_COPY | IMPERSONATOR/LISTED_COPY | yes | [0x156cf54532e9cfbab6498293b6b811a2cd78205524040ddea30202c3dcb3e68e](https://explorer-studio-dev.genlayer.com/tx/0x156cf54532e9cfbab6498293b6b811a2cd78205524040ddea30202c3dcb3e68e) |
| S1 | SAFELIST | Safelist.add_token ethereum [0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48](https://eth.blockscout.com/token/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48) | real USDC (CANONICAL case C7 is OFFICIAL) | added | added | yes | [0xc0ab61870526fa2c28c208fb7b468e420ffe6eb8c901e3bd95bf38e1a9b00aa0](https://explorer-studio-dev.genlayer.com/tx/0xc0ab61870526fa2c28c208fb7b468e420ffe6eb8c901e3bd95bf38e1a9b00aa0) |
| S2 | SAFELIST | Safelist.add_token arbitrum [0x8Fd886c4021ed69a968f6966F818e476868B00eD](https://arbitrum.blockscout.com/token/0x8Fd886c4021ed69a968f6966F818e476868B00eD) | the C5 fake | refused: IMPERSONATOR | refused: IMPERSONATOR | yes | [0xbd39f05076ecfe146f5de90650649ff8469313471d5d3ca0b487829bc604fa87](https://explorer-studio-dev.genlayer.com/tx/0xbd39f05076ecfe146f5de90650649ff8469313471d5d3ca0b487829bc604fa87) |
| S3 | SAFELIST | Safelist.add_token arbitrum [0x35E57438a1348e3441501d5F4ea892Bc81009511](https://arbitrum.blockscout.com/token/0x35E57438a1348e3441501d5F4ea892Bc81009511) | a fake nobody has flagged yet (byte-identical to C3): the list has no reason to refuse it | added | added | yes | [0x4801aced3dfc905adae1dfa1ec7990ac62053ddb0b6aec5939685b3847a956eb](https://explorer-studio-dev.genlayer.com/tx/0x4801aced3dfc905adae1dfa1ec7990ac62053ddb0b6aec5939685b3847a956eb) |
| C13 | CANONICAL | flag arbitrum [0x35E57438a1348e3441501d5F4ea892Bc81009511](https://arbitrum.blockscout.com/token/0x35E57438a1348e3441501d5F4ea892Bc81009511) vs `usd-coin` (case 27) | the same fake, flagged after it was listed | IMPERSONATOR/HOMOGLYPH | IMPERSONATOR/HOMOGLYPH | yes | [0xeb9ff43c313ba5c20ad418f5eb0734a8279abd5a39be00f6f6da8e827dd80b92](https://explorer-studio-dev.genlayer.com/tx/0xeb9ff43c313ba5c20ad418f5eb0734a8279abd5a39be00f6f6da8e827dd80b92) |
| S4 | SAFELIST | Safelist.prune arbitrum [0x35E57438a1348e3441501d5F4ea892Bc81009511](https://arbitrum.blockscout.com/token/0x35E57438a1348e3441501d5F4ea892Bc81009511) (from 0x48150242829085eF44fCe01668d77f6691DDe07d) | a different account prunes it now that the register rules it an IMPERSONATOR | pruned | pruned | yes | [0x97b619ad5f2be5b5bf72abeea5ad655e62482154c70ec650d976be721d15f148](https://explorer-studio-dev.genlayer.com/tx/0x97b619ad5f2be5b5bf72abeea5ad655e62482154c70ec650d976be721d15f148) |
| D1 | DEMO | flag base [0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48](https://base.blockscout.com/token/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48) vs `usd-coin` (case 1) | the Ethereum USDC address on Base: no contract there (eth_getCode is empty), so the evidence fails | PENDING | PENDING | yes | [0xe2504da5c722fc8aa940466d1d8ee29d4f30f7abf7ff22d859e1911262f1c233](https://explorer-studio-dev.genlayer.com/tx/0xe2504da5c722fc8aa940466d1d8ee29d4f30f7abf7ff22d859e1911262f1c233) |
| D2 | DEMO | rule(case 1) | anyone retries before the 5-minute deadline; still no contract | PENDING | PENDING | yes | [0xcf8addecfcac1457929b1e69cb3ce12ebfdf1636a4db0e30289b7f60ede7d1bd](https://explorer-studio-dev.genlayer.com/tx/0xcf8addecfcac1457929b1e69cb3ce12ebfdf1636a4db0e30289b7f60ede7d1bd) |
| D3 | DEMO | flag arbitrum [0x8Fd886c4021ed69a968f6966F818e476868B00eD](https://arbitrum.blockscout.com/token/0x8Fd886c4021ed69a968f6966F818e476868B00eD) vs `usd-coin` (case 2) | exact copy, to be rechecked | IMPERSONATOR/LISTED_COPY | IMPERSONATOR/LISTED_COPY | yes | [0x07f8f915d2b8e3177a22346795750d96acd0e021ad563d403eb06ef204fe1091](https://explorer-studio-dev.genlayer.com/tx/0x07f8f915d2b8e3177a22346795750d96acd0e021ad563d403eb06ef204fe1091) |
| D4 | DEMO | recheck(case 2) | recheck right away | refused: recheck cooldown has not passed | refused: recheck cooldown has not passed | yes | [0x68ce1b2bdf134d2a12b4461582de8e706120f79b79f1a84bed7fec0fc9e0bac8](https://explorer-studio-dev.genlayer.com/tx/0x68ce1b2bdf134d2a12b4461582de8e706120f79b79f1a84bed7fec0fc9e0bac8) |
| D5 | DEMO | recheck(case 2) | after the 3-minute cooldown; history keeps the first ruling | IMPERSONATOR/LISTED_COPY | IMPERSONATOR/LISTED_COPY | yes | [0x44abec9d2a1caf8f2fc8e96bd14863924eedc579b6d90961e60c02174e3f989d](https://explorer-studio-dev.genlayer.com/tx/0x44abec9d2a1caf8f2fc8e96bd14863924eedc579b6d90961e60c02174e3f989d) |
| D6 | DEMO | expire(case 1) | after the 5-minute rule window | EXPIRED | EXPIRED | yes | [0x13418c1095f2e95653fcb26b56671ff091db54621e93a94f4cb7fcfabb937f8a](https://explorer-studio-dev.genlayer.com/tx/0x13418c1095f2e95653fcb26b56671ff091db54621e93a94f4cb7fcfabb937f8a) |
| D7 | DEMO | flag base [0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48](https://base.blockscout.com/token/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48) vs `usd-coin` (case 6) | the same key flagged again after EXPIRED: a new case (still no contract at that address on Base) | PENDING | PENDING | yes | [0x0b6a789678248d9bb825a0679019e39a4003f4995d155fe2311ebdc4bc79a433](https://explorer-studio-dev.genlayer.com/tx/0x0b6a789678248d9bb825a0679019e39a4003f4995d155fe2311ebdc4bc79a433) |
| M1 | DEMO | flag arbitrum [0xEB466342C4d449BC9f53A865D5Cb90586f405215](https://arbitrum.blockscout.com/token/0xEB466342C4d449BC9f53A865D5Cb90586f405215) vs `usd-coin` (case 3) | 'Axelar Wrapped USDC' / 'axlUSDC': model run 1 | VARIANT/MODEL | VARIANT/MODEL | yes | [0x13f06797f5ef489ad2eddf99d8203d406910b8f5efddecc0a18a58ead3941399](https://explorer-studio-dev.genlayer.com/tx/0x13f06797f5ef489ad2eddf99d8203d406910b8f5efddecc0a18a58ead3941399) |
| M2 | DEMO | flag ethereum [0xBc65ad17c5C0a2A4D159fa5a503f4992c7B545FE](https://eth.blockscout.com/token/0xBc65ad17c5C0a2A4D159fa5a503f4992c7B545FE) vs `usd-coin` (case 4) | 'Spark USDC Vault' / 'sUSDC': model run 1 | UNRELATED/MODEL | UNRELATED/MODEL | yes | [0x1a6cd49b95fab5b8145aeedebb39b4fdee24940d230a2030e91ed63109009e81](https://explorer-studio-dev.genlayer.com/tx/0x1a6cd49b95fab5b8145aeedebb39b4fdee24940d230a2030e91ed63109009e81) |
| M3 | DEMO | flag arbitrum [0xE3F520d5C6f5421eE02160242f7a9e025d829E3e](https://arbitrum.blockscout.com/token/0xE3F520d5C6f5421eE02160242f7a9e025d829E3e) vs `usd-coin` (case 5) | real fake: 'Bridged USDC' / 'USDC.e' padded with invisible characters (now decided by code, no model call): model run 1 | IMPERSONATOR/HOMOGLYPH | IMPERSONATOR/HOMOGLYPH | yes | [0xec4625ef5aa30458df59934a656728b6237b684ec546ecc5146141fc29d6dd5e](https://explorer-studio-dev.genlayer.com/tx/0xec4625ef5aa30458df59934a656728b6237b684ec546ecc5146141fc29d6dd5e) |
| M4 | DEMO | flag arbitrum [0xB67c014FA700E69681a673876eb8BAFAA36BFf71](https://arbitrum.blockscout.com/token/0xB67c014FA700E69681a673876eb8BAFAA36BFf71) vs `usd-coin` (case 7) | 'Hop USDC LP Token' / 'HOP-LP-USDC': model run 1 | UNRELATED/MODEL | UNRELATED/MODEL | yes | [0xb94079965c756eac467a87a8bd99636588a00742002200f484904c21ebc1672d](https://explorer-studio-dev.genlayer.com/tx/0xb94079965c756eac467a87a8bd99636588a00742002200f484904c21ebc1672d) |
| M1r | DEMO | recheck(case 3) | 'Axelar Wrapped USDC' / 'axlUSDC': model run 2 (recheck) | VARIANT/MODEL | VARIANT/MODEL | yes | [0x0603003b3d0596ee49030d7facef70065bd887db101e02c314e47e9428cbd714](https://explorer-studio-dev.genlayer.com/tx/0x0603003b3d0596ee49030d7facef70065bd887db101e02c314e47e9428cbd714) |
| M2r | DEMO | recheck(case 4) | 'Spark USDC Vault' / 'sUSDC': model run 2 (recheck) | UNRELATED/MODEL | UNRELATED/MODEL | yes | [0xbae42746444844c8f846718e7a83602564320227a6e49d354eae0ace88c8c367](https://explorer-studio-dev.genlayer.com/tx/0xbae42746444844c8f846718e7a83602564320227a6e49d354eae0ace88c8c367) |
| M3r | DEMO | recheck(case 5) | real fake: 'Bridged USDC' / 'USDC.e' padded with invisible characters (now decided by code, no model call): model run 2 (recheck) | IMPERSONATOR/HOMOGLYPH | IMPERSONATOR/HOMOGLYPH | yes | [0xdb3e2bf8f0eb506e8573b1b1a2c95508c7f269ac9e510c298efd9fc947b6c7b4](https://explorer-studio-dev.genlayer.com/tx/0xdb3e2bf8f0eb506e8573b1b1a2c95508c7f269ac9e510c298efd9fc947b6c7b4) |
| M4r | DEMO | recheck(case 7) | 'Hop USDC LP Token' / 'HOP-LP-USDC': model run 2 (recheck) | UNRELATED/MODEL | UNRELATED/MODEL | yes | [0x4ad2073c72697336ce3c05e415de13064454ac1cedd99e0528722f5d6a5f12be](https://explorer-studio-dev.genlayer.com/tx/0x4ad2073c72697336ce3c05e415de13064454ac1cedd99e0528722f5d6a5f12be) |

All steps matched their expected outcome.

## MODEL cases judged twice (DEMO)

Each was flagged (run 1) and rechecked after the cooldown (run 2). In a MODEL run every validator asked the model itself and they had to agree on one label. M3 no longer reaches the model: the LISTED_COPY rule decides it by code.

| Case | Token | Run 1 | Run 2 |
|---|---|---|---|
| M1 (case 3) | 'Axelar Wrapped USDC' / 'axlUSDC' | VARIANT/MODEL | VARIANT/MODEL |
| M2 (case 4) | 'Spark USDC Vault' / 'sUSDC' | UNRELATED/MODEL | UNRELATED/MODEL |
| M3 (case 5) | real fake: 'Bridged USDC' / 'USDC.e' padded with invisible characters (now decided by code, no model call) | IMPERSONATOR/HOMOGLYPH | IMPERSONATOR/HOMOGLYPH |
| M4 (case 7) | 'Hop USDC LP Token' / 'HOP-LP-USDC' | UNRELATED/MODEL | UNRELATED/MODEL |

## Recheck history (DEMO case 2)

| # | Label | Basis | At (unix) | Evidence sha256 |
|---|---|---|---|---|
| 1 | IMPERSONATOR | LISTED_COPY | 1790755786 | `a80282ff06096b6653a9a1231cef94c14343e8e1e35dc7fee9c0a25a4d1bfd0c` |
| 2 | IMPERSONATOR | LISTED_COPY | 1790756716 | `a80282ff06096b6653a9a1231cef94c14343e8e1e35dc7fee9c0a25a4d1bfd0c` |

The first ruling is kept, not overwritten.

## Safelist after S1-S4

Listed:

```json
[
  {
    "added_at": "2026-09-30T08:23:57.551333Z",
    "chain": "ethereum",
    "token": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
  }
]
```

Pruned:

```json
[
  {
    "added_at": "2026-09-30T08:24:35.037411Z",
    "chain": "arbitrum",
    "removed_at": "2026-09-30T08:25:01.738639Z",
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
      "IMPERSONATOR": 23,
      "OFFICIAL": 1,
      "PENDING": 0,
      "UNRELATED": 1,
      "VARIANT": 2
    },
    "cases": 27,
    "model_rulings": 1,
    "precedent_flags": 7,
    "rechecks": 0
  },
  "DEMO": {
    "by_state": {
      "EXPIRED": 1,
      "IMPERSONATOR": 2,
      "OFFICIAL": 0,
      "PENDING": 1,
      "UNRELATED": 2,
      "VARIANT": 1
    },
    "cases": 7,
    "model_rulings": 5,
    "precedent_flags": 0,
    "rechecks": 4
  }
}
```
