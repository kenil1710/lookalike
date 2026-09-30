# Seeds (studio-dev)

Every row is a real transaction on real token data. Contracts: CANONICAL [`0xc0a6ac4f8E552170AA64E21264b7E02081Cde876`](https://explorer-studio-dev.genlayer.com/address/0xc0a6ac4f8E552170AA64E21264b7E02081Cde876), DEMO [`0x5C26d415B436859AC2c67FB41cdFaE21a8179c1d`](https://explorer-studio-dev.genlayer.com/address/0x5C26d415B436859AC2c67FB41cdFaE21a8179c1d), SAFELIST [`0xF0B3e58eE4581aA6D997013D1E7556AFBa48A398`](https://explorer-studio-dev.genlayer.com/address/0xF0B3e58eE4581aA6D997013D1E7556AFBa48A398), deployed from commit `6b399e6958860d94521800917897220fbd9933f4`. Raw records (returned values, case JSON, history) are in [seed-evidence.json](seed-evidence.json). Token links go to each chain's explorer for people; the contract itself reads name, symbol and decimals with eth_call.

| Step | Instance | Call | Token | Expected | Actual | Match | Tx |
|---|---|---|---|---|---|---|---|
| C1 | CANONICAL | flag arbitrum [0xEbb993F7C5477016A0a025A790Dd079dfe3Eca9D](https://arbitrum.blockscout.com/token/0xEbb993F7C5477016A0a025A790Dd079dfe3Eca9D) vs `usd-coin` (case 1) | on chain: 'USD Coin' / 'USDC' with Cyrillic ES and o plus invisible U+206B, U+FEFF, U+200B | IMPERSONATOR/HOMOGLYPH | IMPERSONATOR/HOMOGLYPH | yes | [0xecfe1146c443b7fa0f8b526b191982c2a52a5c91aa35e4932bcf12d9ade7347a](https://explorer-studio-dev.genlayer.com/tx/0xecfe1146c443b7fa0f8b526b191982c2a52a5c91aa35e4932bcf12d9ade7347a) |
| C2 | CANONICAL | flag arbitrum [0xdaECe7e93993394063a01BB39145A7d71d4df8f1](https://arbitrum.blockscout.com/token/0xdaECe7e93993394063a01BB39145A7d71d4df8f1) vs `usd-coin` (case 2) | 'U+FEFF SD Coin' / 'U+FEFF SDC': byte-order mark inside | IMPERSONATOR/HOMOGLYPH | IMPERSONATOR/HOMOGLYPH | yes | [0xd661f463ddd27c2217599d5917377e7dd44542442ffb558842f1ef22e54c3f69](https://explorer-studio-dev.genlayer.com/tx/0xd661f463ddd27c2217599d5917377e7dd44542442ffb558842f1ef22e54c3f69) |
| C3 | CANONICAL | flag arbitrum [0x72224ea851b18d56065E7ebe355a246A66F5ce2E](https://arbitrum.blockscout.com/token/0x72224ea851b18d56065E7ebe355a246A66F5ce2E) vs `usd-coin` (case 3) | 'USD Coin' / 'U U+206F SD U+200D C' | IMPERSONATOR/HOMOGLYPH | IMPERSONATOR/HOMOGLYPH | yes | [0x6cf54d7b05180978af350f2ef1039d2a6da4653a390227c7245cc98dae01ae94](https://explorer-studio-dev.genlayer.com/tx/0x6cf54d7b05180978af350f2ef1039d2a6da4653a390227c7245cc98dae01ae94) |
| C4 | CANONICAL | flag arbitrum [0x2790AfA96A254142a13C24A7BE2C35afC784b82a](https://arbitrum.blockscout.com/token/0x2790AfA96A254142a13C24A7BE2C35afC784b82a) vs `tether` (case 4) | 'Tet U+FEFF her USD' / 'U U+200C SDT' | IMPERSONATOR/HOMOGLYPH | IMPERSONATOR/HOMOGLYPH | yes | [0xccad29e7e9a05d8afcc2d1a17edf739fbfd280bf0bf3f47d1cb9b61bed3a75a0](https://explorer-studio-dev.genlayer.com/tx/0xccad29e7e9a05d8afcc2d1a17edf739fbfd280bf0bf3f47d1cb9b61bed3a75a0) |
| C5 | CANONICAL | flag arbitrum [0x8Fd886c4021ed69a968f6966F818e476868B00eD](https://arbitrum.blockscout.com/token/0x8Fd886c4021ed69a968f6966F818e476868B00eD) vs `usd-coin` (case 5) | 'USDC' / 'USDC', 6 decimals, not the official Arbitrum USDC | IMPERSONATOR/LISTED_COPY | IMPERSONATOR/LISTED_COPY | yes | [0x85932297fd69f6b0c9a740578e5557a0ff3dca6f9e595496b14d08014a594051](https://explorer-studio-dev.genlayer.com/tx/0x85932297fd69f6b0c9a740578e5557a0ff3dca6f9e595496b14d08014a594051) |
| C6 | CANONICAL | flag arbitrum [0x413f1661a78A9675C95E33D63b0c90DBD747c43B](https://arbitrum.blockscout.com/token/0x413f1661a78A9675C95E33D63b0c90DBD747c43B) vs `tether` (case 6) | 'USDT' / 'USDT' on Arbitrum (the official Tether there is USDT0) | IMPERSONATOR/LISTED_COPY | IMPERSONATOR/LISTED_COPY | yes | [0xe57a484dc43994e95891dee5fa63ed954fe434f3cb7d3cf17351eeaf16731d9c](https://explorer-studio-dev.genlayer.com/tx/0xe57a484dc43994e95891dee5fa63ed954fe434f3cb7d3cf17351eeaf16731d9c) |
| C7 | CANONICAL | flag ethereum [0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48](https://eth.blockscout.com/token/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48) vs `usd-coin` (case 7) | real USDC on Ethereum | OFFICIAL/OFFICIAL_LIST | OFFICIAL/OFFICIAL_LIST | yes | [0x43480537e9079acbf499301dd482452a2d17c5fb6f56cec394fdb6002b94537c](https://explorer-studio-dev.genlayer.com/tx/0x43480537e9079acbf499301dd482452a2d17c5fb6f56cec394fdb6002b94537c) |
| C8 | CANONICAL | flag arbitrum [0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8](https://arbitrum.blockscout.com/token/0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8) vs `usd-coin` (case 8) | real bridged USDC.e: on chain it says 'USD Coin (Arb1)' / 'USDC'; the list carries this address as USDC.e 'Bridged USDC' | VARIANT/LISTED_VARIANT | VARIANT/LISTED_VARIANT | yes | [0x3b1af815c9a6cf7b6f334a7fb7fc18326ddc605634b4d1014b3cbe8615317cbf](https://explorer-studio-dev.genlayer.com/tx/0x3b1af815c9a6cf7b6f334a7fb7fc18326ddc605634b4d1014b3cbe8615317cbf) |
| C9 | CANONICAL | flag arbitrum [0xEB466342C4d449BC9f53A865D5Cb90586f405215](https://arbitrum.blockscout.com/token/0xEB466342C4d449BC9f53A865D5Cb90586f405215) vs `usd-coin` (case 9) | 'Axelar Wrapped USDC' / 'axlUSDC', not on the list | VARIANT/MODEL | VARIANT/MODEL | yes | [0x9f6067919830c384312cc4260505bd3e26a223a5f70ed3aaafd7482f652bf988](https://explorer-studio-dev.genlayer.com/tx/0x9f6067919830c384312cc4260505bd3e26a223a5f70ed3aaafd7482f652bf988) |
| C10 | CANONICAL | flag ethereum [0xdC035D45d973E3EC169d2276DDab16f1e407384F](https://eth.blockscout.com/token/0xdC035D45d973E3EC169d2276DDab16f1e407384F) vs `usd-coin` (case 10) | Sky 'USDS Stablecoin' / 'USDS': a different dollar token, on the list as USDS | UNRELATED/LISTED_OTHER | UNRELATED/LISTED_OTHER | yes | [0x5158516270904e2ff7ae73f51d4a6be6e5601a27a83c7e6eec2c957a3175ca81](https://explorer-studio-dev.genlayer.com/tx/0x5158516270904e2ff7ae73f51d4a6be6e5601a27a83c7e6eec2c957a3175ca81) |
| C11 | CANONICAL | flag_by_precedent (precedent case 5): [0x293971FC9f23AddadfB5bE29a4542C0E2BF67ba8](https://arbitrum.blockscout.com/token/0x293971FC9f23AddadfB5bE29a4542C0E2BF67ba8), [0x1C1dEB401E94f4826260Ca888E53180819449714](https://arbitrum.blockscout.com/token/0x1C1dEB401E94f4826260Ca888E53180819449714), [0x755A31d5dDbF5Cb69B15d50a01a0ea1ae15Ce474](https://arbitrum.blockscout.com/token/0x755A31d5dDbF5Cb69B15d50a01a0ea1ae15Ce474), [0xCd5503c3718C2303Bf958538cF94FcB5606E4E01](https://arbitrum.blockscout.com/token/0xCd5503c3718C2303Bf958538cF94FcB5606E4E01), [0x0dFCCeB1147e0Ff11a442602a245E34D2FEBC977](https://arbitrum.blockscout.com/token/0x0dFCCeB1147e0Ff11a442602a245E34D2FEBC977) | five more 'USDC' / 'USDC' / 6-decimal copies, byte-identical to C5 | 5 x IMPERSONATOR/PRECEDENT | 5 x IMPERSONATOR/PRECEDENT | yes | [0xed77429b46d72c498698bc3abe6c862f480dee072dd4ec48b6f884485c536f1b](https://explorer-studio-dev.genlayer.com/tx/0xed77429b46d72c498698bc3abe6c862f480dee072dd4ec48b6f884485c536f1b) |
| C12 | CANONICAL | flag base [0x07f3c9Ba9a0C06204C8489B62291d5B0e77615A1](https://base.blockscout.com/token/0x07f3c9Ba9a0C06204C8489B62291d5B0e77615A1) vs `tether` | a 'Tether USD' copy on Base: the list has no Tether on Base, so the pair is refused | refused: the official list does not cover this coin on this chain | refused: the official list does not cover this coin on this chain | yes | [0xa5b441e46fe3bc974c1049ab9819aeaa2b90bc24c868faf3526ef2f03c234373](https://explorer-studio-dev.genlayer.com/tx/0xa5b441e46fe3bc974c1049ab9819aeaa2b90bc24c868faf3526ef2f03c234373) |
| H1 | CANONICAL | flag arbitrum [0xe1De3977D7909499642fee317818Ae698C841079](https://arbitrum.blockscout.com/token/0xe1De3977D7909499642fee317818Ae698C841079) vs `usd-coin` (case 16) | route A: 'Bridged USDC' / 'USDC.e', the list's own label for USDC.e, at another address | IMPERSONATOR/LISTED_COPY | IMPERSONATOR/LISTED_COPY | yes | [0x77449b52f5e88b28e2ba3d0cb56cdf0a486023428bf1f7fb371056b2c31d0997](https://explorer-studio-dev.genlayer.com/tx/0x77449b52f5e88b28e2ba3d0cb56cdf0a486023428bf1f7fb371056b2c31d0997) |
| H2 | CANONICAL | flag_by_precedent (precedent case 16): [0xC79Ea482222e56C7976284649F4C4AB7720C271A](https://arbitrum.blockscout.com/token/0xC79Ea482222e56C7976284649F4C4AB7720C271A), [0x9a678BEC1a1eeAABAd1A9e22E3716e0fc9Cc99F5](https://arbitrum.blockscout.com/token/0x9a678BEC1a1eeAABAd1A9e22E3716e0fc9Cc99F5) | route A + G: two more byte-identical 'Bridged USDC' / 'USDC.e' copies, batched on H1 | 2 x IMPERSONATOR/PRECEDENT | 2 x IMPERSONATOR/PRECEDENT | yes | [0xa3bf219783612f17846266040a627d6dccc9ceda604ee16cdadb190f5e188ba8](https://explorer-studio-dev.genlayer.com/tx/0xa3bf219783612f17846266040a627d6dccc9ceda604ee16cdadb190f5e188ba8) |
| H3 | CANONICAL | flag arbitrum [0x9559136B1069715CCCe06b59ed3B9874e1213169](https://arbitrum.blockscout.com/token/0x9559136B1069715CCCe06b59ed3B9874e1213169) vs `usd-coin` (case 19) | route A: 'USD Coin Bridged' / 'USDC.e' | IMPERSONATOR/LISTED_COPY | IMPERSONATOR/LISTED_COPY | yes | [0x7d6cedf72c943c9872685c9e181c40f0c712ed321d98599b599e9be63a7aa8be](https://explorer-studio-dev.genlayer.com/tx/0x7d6cedf72c943c9872685c9e181c40f0c712ed321d98599b599e9be63a7aa8be) |
| H4 | CANONICAL | flag arbitrum [0x091aF852874B4885F9D89cB6cC6A85538a4223fe](https://arbitrum.blockscout.com/token/0x091aF852874B4885F9D89cB6cC6A85538a4223fe) vs `usd-coin` (case 20) | route C: 'Lens Bridged USDC (Lens)' / 'USDC': a wallet shows USDC | IMPERSONATOR/LISTED_COPY | IMPERSONATOR/LISTED_COPY | yes | [0x286d7f8d5bbbbd533b51ef2ba63a8d8dba419f926e0317619201495d46dc276a](https://explorer-studio-dev.genlayer.com/tx/0x286d7f8d5bbbbd533b51ef2ba63a8d8dba419f926e0317619201495d46dc276a) |
| H5 | CANONICAL | flag arbitrum [0x0EDa1A5Aa9AB156604fE174A1a4505588ccE2E72](https://arbitrum.blockscout.com/token/0x0EDa1A5Aa9AB156604fE174A1a4505588ccE2E72) vs `usd-coin` (case 21) | route C: 'Zero Network Bridged USDC (Zero Network)' / 'USDC' | IMPERSONATOR/LISTED_COPY | IMPERSONATOR/LISTED_COPY | yes | [0x2f0fe71d0ee8098ca74f6e4c2906a988da16fb78d6647f58ddd165f122f1046b](https://explorer-studio-dev.genlayer.com/tx/0x2f0fe71d0ee8098ca74f6e4c2906a988da16fb78d6647f58ddd165f122f1046b) |
| H6 | CANONICAL | flag arbitrum [0xcE0470d23Ea6c86A3dF9E1008aAbDfFAEeF8F2f0](https://arbitrum.blockscout.com/token/0xcE0470d23Ea6c86A3dF9E1008aAbDfFAEeF8F2f0) vs `tether` (case 22) | route D: 'USDT0' / 'USDT0', Tether's listed Arbitrum symbol, at another address | IMPERSONATOR/LISTED_COPY | PENDING | PENDING, ruled by H6-rule2 | [0x69099dba0ddeeecb3e4d39110cb8bddd67585eee63fd0f2ac42fe60e6ddf50a8](https://explorer-studio-dev.genlayer.com/tx/0x69099dba0ddeeecb3e4d39110cb8bddd67585eee63fd0f2ac42fe60e6ddf50a8) |
| H6-rule | CANONICAL | rule(case 22) (case 22) | retry: the first read left case 22 PENDING (the list could not be read); anyone may call rule() before the deadline | IMPERSONATOR/LISTED_COPY | PENDING | PENDING, ruled by H6-rule2 | [0x29dd0a4280bf9e9a8a23df934b5ed0f2d00a1a7814cd499b3c567201fc9c7f64](https://explorer-studio-dev.genlayer.com/tx/0x29dd0a4280bf9e9a8a23df934b5ed0f2d00a1a7814cd499b3c567201fc9c7f64) |
| H6-rule2 | CANONICAL | rule(case 22) (case 22) | retry 2: case 22 was left PENDING because the evidence could not be read; anyone may call rule() before the deadline | IMPERSONATOR/LISTED_COPY | IMPERSONATOR/LISTED_COPY | yes | [0xbe4282d05e9275d1f3021127dff6cb19e208de9bec81df0d3886f16b997b9c7a](https://explorer-studio-dev.genlayer.com/tx/0xbe4282d05e9275d1f3021127dff6cb19e208de9bec81df0d3886f16b997b9c7a) |
| H7 | CANONICAL | flag arbitrum [0x6f0a3Fc26f0C1Ae046746dC70aAc61e032d84B52](https://arbitrum.blockscout.com/token/0x6f0a3Fc26f0C1Ae046746dC70aAc61e032d84B52) vs `tether` (case 23) | route D: another 'USDT0' / 'USDT0' | IMPERSONATOR/LISTED_COPY | PENDING | PENDING, ruled by H7-rule2 | [0x95b1fb55d83b004dbaf01ad10154bebefc6c95df5bdb36f0d352da1f42c97d2c](https://explorer-studio-dev.genlayer.com/tx/0x95b1fb55d83b004dbaf01ad10154bebefc6c95df5bdb36f0d352da1f42c97d2c) |
| H7-rule | CANONICAL | rule(case 23) (case 23) | retry: the first read left case 23 PENDING (the list could not be read); anyone may call rule() before the deadline | IMPERSONATOR/LISTED_COPY | PENDING | PENDING, ruled by H7-rule2 | [0x697fdee15789b3c040b0571512d5594fa5ef9c27ce193ed9c993541eb0cf04a4](https://explorer-studio-dev.genlayer.com/tx/0x697fdee15789b3c040b0571512d5594fa5ef9c27ce193ed9c993541eb0cf04a4) |
| H7-rule2 | CANONICAL | rule(case 23) (case 23) | retry 2: case 23 was left PENDING because the evidence could not be read; anyone may call rule() before the deadline | IMPERSONATOR/LISTED_COPY | IMPERSONATOR/LISTED_COPY | yes | [0xe07a3b3547eb4405382449972ce1043f535ba950bc9c6b8b2eab18727b1081ea](https://explorer-studio-dev.genlayer.com/tx/0xe07a3b3547eb4405382449972ce1043f535ba950bc9c6b8b2eab18727b1081ea) |
| H8 | CANONICAL | flag arbitrum [0xE0FB0F453aBfbd74368074cf0291711FC82cBc07](https://arbitrum.blockscout.com/token/0xE0FB0F453aBfbd74368074cf0291711FC82cBc07) vs `tether` (case 24) | route D: 'Fake USD(Tugrik)0' / 'USDT0' | IMPERSONATOR/HOMOGLYPH | PENDING | PENDING, ruled by H8-rule2 | [0xa30b662c15ac622f31672823c65dade2fbc6f5c6f8a14d1eaf21ffcbcda0664e](https://explorer-studio-dev.genlayer.com/tx/0xa30b662c15ac622f31672823c65dade2fbc6f5c6f8a14d1eaf21ffcbcda0664e) |
| H8-rule | CANONICAL | rule(case 24) (case 24) | retry: the first read left case 24 PENDING (the list could not be read); anyone may call rule() before the deadline | IMPERSONATOR/HOMOGLYPH | PENDING | PENDING, ruled by H8-rule2 | [0x37e608620c382f8e385a46f7bde2e734be4ef124fe327b13a9faf7802a8b4ef4](https://explorer-studio-dev.genlayer.com/tx/0x37e608620c382f8e385a46f7bde2e734be4ef124fe327b13a9faf7802a8b4ef4) |
| H8-rule2 | CANONICAL | rule(case 24) (case 24) | retry 2: case 24 was left PENDING because the evidence could not be read; anyone may call rule() before the deadline | IMPERSONATOR/HOMOGLYPH | IMPERSONATOR/HOMOGLYPH | yes | [0xbcd8213550561e43b4927b8ce7781dea2aa44584f656bec53d94a754cbb27e92](https://explorer-studio-dev.genlayer.com/tx/0xbcd8213550561e43b4927b8ce7781dea2aa44584f656bec53d94a754cbb27e92) |
| H9 | CANONICAL | flag arbitrum [0xE3F520d5C6f5421eE02160242f7a9e025d829E3e](https://arbitrum.blockscout.com/token/0xE3F520d5C6f5421eE02160242f7a9e025d829E3e) vs `usd-coin` (case 25) | route E: seed M3, 'Bridged USDC' / 'USDC.e' padded with invisible characters | IMPERSONATOR/HOMOGLYPH | PENDING | PENDING, ruled by H9-rule2 | [0x150b2b9561c80dbdcecc3459cfd3b70dca1bdd6fa935202d160357759afee308](https://explorer-studio-dev.genlayer.com/tx/0x150b2b9561c80dbdcecc3459cfd3b70dca1bdd6fa935202d160357759afee308) |
| H9-rule | CANONICAL | rule(case 25) (case 25) | retry: the first read left case 25 PENDING (the list could not be read); anyone may call rule() before the deadline | IMPERSONATOR/HOMOGLYPH | PENDING | PENDING, ruled by H9-rule2 | [0x818b2d2e585d807991d977aeb9fb7fcb7e7e8b9904fdc1436b896ad94c88928c](https://explorer-studio-dev.genlayer.com/tx/0x818b2d2e585d807991d977aeb9fb7fcb7e7e8b9904fdc1436b896ad94c88928c) |
| H9-rule2 | CANONICAL | rule(case 25) (case 25) | retry 2: case 25 was left PENDING because the evidence could not be read; anyone may call rule() before the deadline | IMPERSONATOR/HOMOGLYPH | IMPERSONATOR/HOMOGLYPH | yes | [0xe3d364db823c31e8a5570893e285b8bf06df0d6e8e23c6927d229bd7190e95e4](https://explorer-studio-dev.genlayer.com/tx/0xe3d364db823c31e8a5570893e285b8bf06df0d6e8e23c6927d229bd7190e95e4) |
| H10 | CANONICAL | flag arbitrum [0x6aed705A1E8E7bE9A3965743CBDc35FC9252D17A](https://arbitrum.blockscout.com/token/0x6aed705A1E8E7bE9A3965743CBDc35FC9252D17A) vs `usd-coin` (case 26) | route F: 'Bridged USDC' / 'Visit https://circle-v2.xyz to claim rewards', no decimals() | IMPERSONATOR/LISTED_COPY | PENDING | PENDING, ruled by H10-rule | [0x4dd6318a9ee7add836e9292d5a036728a98e91560cf06ac2911c37d2a4f97601](https://explorer-studio-dev.genlayer.com/tx/0x4dd6318a9ee7add836e9292d5a036728a98e91560cf06ac2911c37d2a4f97601) |
| H10-rule | CANONICAL | rule(case 26) (case 26) | retry: the first read left case 26 PENDING (the list could not be read); anyone may call rule() before the deadline | IMPERSONATOR/LISTED_COPY | IMPERSONATOR/LISTED_COPY | yes | [0xae8bec58dd7709ac95ca8ad3df6c45c7a1074a66aa2de61092e80e919d0685ed](https://explorer-studio-dev.genlayer.com/tx/0xae8bec58dd7709ac95ca8ad3df6c45c7a1074a66aa2de61092e80e919d0685ed) |
| S1 | SAFELIST | Safelist.add_token ethereum [0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48](https://eth.blockscout.com/token/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48) | real USDC (CANONICAL case C7 is OFFICIAL) | added | added | yes | [0x763b853aac2a0c808d80fbb03c54e0874019053c145620eec7cb43ee58ee2a64](https://explorer-studio-dev.genlayer.com/tx/0x763b853aac2a0c808d80fbb03c54e0874019053c145620eec7cb43ee58ee2a64) |
| S2 | SAFELIST | Safelist.add_token arbitrum [0x8Fd886c4021ed69a968f6966F818e476868B00eD](https://arbitrum.blockscout.com/token/0x8Fd886c4021ed69a968f6966F818e476868B00eD) | the C5 fake | refused: IMPERSONATOR | refused: IMPERSONATOR | yes | [0x5f0c0179ebaa55fa78907371f52ebeb8a5cfc388fdf5a427c4d9082cbc1b5ff7](https://explorer-studio-dev.genlayer.com/tx/0x5f0c0179ebaa55fa78907371f52ebeb8a5cfc388fdf5a427c4d9082cbc1b5ff7) |
| S3 | SAFELIST | Safelist.add_token arbitrum [0x35E57438a1348e3441501d5F4ea892Bc81009511](https://arbitrum.blockscout.com/token/0x35E57438a1348e3441501d5F4ea892Bc81009511) | a fake nobody has flagged yet (byte-identical to C3): the list has no reason to refuse it | added | added | yes | [0xa567419bc389a73b4a247f4aa83eb7c01ebced84e8c1a63595b1956f99ea530c](https://explorer-studio-dev.genlayer.com/tx/0xa567419bc389a73b4a247f4aa83eb7c01ebced84e8c1a63595b1956f99ea530c) |
| C13 | CANONICAL | flag arbitrum [0x35E57438a1348e3441501d5F4ea892Bc81009511](https://arbitrum.blockscout.com/token/0x35E57438a1348e3441501d5F4ea892Bc81009511) vs `usd-coin` (case 27) | the same fake, flagged after it was listed | IMPERSONATOR/HOMOGLYPH | IMPERSONATOR/HOMOGLYPH | yes | [0x7d71962c2eb6fb26ff6c2cc0afa784c3c73f2f6d185f6b9ca0a33cd3b76f7d1c](https://explorer-studio-dev.genlayer.com/tx/0x7d71962c2eb6fb26ff6c2cc0afa784c3c73f2f6d185f6b9ca0a33cd3b76f7d1c) |
| S4 | SAFELIST | Safelist.prune arbitrum [0x35E57438a1348e3441501d5F4ea892Bc81009511](https://arbitrum.blockscout.com/token/0x35E57438a1348e3441501d5F4ea892Bc81009511) (from 0x48150242829085eF44fCe01668d77f6691DDe07d) | a different account prunes it now that the register rules it an IMPERSONATOR | pruned | pruned | yes | [0x8271c7222cba14cdb875f04b34b12d5270ade66a1a4a483421c7d8db10154c4b](https://explorer-studio-dev.genlayer.com/tx/0x8271c7222cba14cdb875f04b34b12d5270ade66a1a4a483421c7d8db10154c4b) |
| D1 | DEMO | flag base [0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48](https://base.blockscout.com/token/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48) vs `usd-coin` (case 1) | the Ethereum USDC address on Base: no contract there (eth_getCode is empty), so the evidence fails | PENDING | PENDING | yes | [0x031b5b00c2fa4a6c581c25b021e53a8f68ca18547b43071be84491fae02b60c5](https://explorer-studio-dev.genlayer.com/tx/0x031b5b00c2fa4a6c581c25b021e53a8f68ca18547b43071be84491fae02b60c5) |
| D2 | DEMO | rule(case 1) | anyone retries before the 5-minute deadline; still no contract | PENDING | PENDING | yes | [0x6bb5e8dbc6422e9f3ac771bdd24ade36c75fb8649b9007346608ce0f51596f8d](https://explorer-studio-dev.genlayer.com/tx/0x6bb5e8dbc6422e9f3ac771bdd24ade36c75fb8649b9007346608ce0f51596f8d) |
| D3 | DEMO | flag arbitrum [0x8Fd886c4021ed69a968f6966F818e476868B00eD](https://arbitrum.blockscout.com/token/0x8Fd886c4021ed69a968f6966F818e476868B00eD) vs `usd-coin` (case 2) | exact copy, to be rechecked | IMPERSONATOR/LISTED_COPY | IMPERSONATOR/LISTED_COPY | yes | [0x0076d402ea0cbb6648f27e7ba43731c8c8615f67cc5c677e4f65742324c77a9c](https://explorer-studio-dev.genlayer.com/tx/0x0076d402ea0cbb6648f27e7ba43731c8c8615f67cc5c677e4f65742324c77a9c) |
| D4 | DEMO | recheck(case 2) | recheck right away | refused: recheck cooldown has not passed | refused: recheck cooldown has not passed | yes | [0x30f84d1e38bf282080fa84192a8a01a25f80f81c23ae9b65cc247bf9e144bb58](https://explorer-studio-dev.genlayer.com/tx/0x30f84d1e38bf282080fa84192a8a01a25f80f81c23ae9b65cc247bf9e144bb58) |
| D5 | DEMO | recheck(case 2) | after the 3-minute cooldown; history keeps the first ruling | IMPERSONATOR/LISTED_COPY | IMPERSONATOR/LISTED_COPY | yes | [0xcde1cadd717b10814ffca4f29d758fcefd0d527c856e137bf5d00347cdd09a3b](https://explorer-studio-dev.genlayer.com/tx/0xcde1cadd717b10814ffca4f29d758fcefd0d527c856e137bf5d00347cdd09a3b) |
| D6 | DEMO | expire(case 1) | after the 5-minute rule window | EXPIRED | EXPIRED | yes | [0xcbc6f4051ffc0c3cebcad3ed8e0716f7b1007abc1e1cda6f441e4aa41976cb67](https://explorer-studio-dev.genlayer.com/tx/0xcbc6f4051ffc0c3cebcad3ed8e0716f7b1007abc1e1cda6f441e4aa41976cb67) |
| D7 | DEMO | flag base [0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48](https://base.blockscout.com/token/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48) vs `usd-coin` (case 7) | the same key flagged again after EXPIRED: a new case (still no contract at that address on Base) | PENDING | PENDING | yes | [0xa9ddd7431f93a9bc344f5176f14f759020a2c74940b9d7e0520e7f58c2e8248d](https://explorer-studio-dev.genlayer.com/tx/0xa9ddd7431f93a9bc344f5176f14f759020a2c74940b9d7e0520e7f58c2e8248d) |
| M1 | DEMO | flag arbitrum [0xEB466342C4d449BC9f53A865D5Cb90586f405215](https://arbitrum.blockscout.com/token/0xEB466342C4d449BC9f53A865D5Cb90586f405215) vs `usd-coin` (case 3) | 'Axelar Wrapped USDC' / 'axlUSDC': model run 1 | VARIANT/MODEL | VARIANT/MODEL | yes | [0xac4b2e48745faa313a2a5293c1bdce593f44bb2a6957b714c7c7bb62ae6da8b5](https://explorer-studio-dev.genlayer.com/tx/0xac4b2e48745faa313a2a5293c1bdce593f44bb2a6957b714c7c7bb62ae6da8b5) |
| M2 | DEMO | flag ethereum [0xBc65ad17c5C0a2A4D159fa5a503f4992c7B545FE](https://eth.blockscout.com/token/0xBc65ad17c5C0a2A4D159fa5a503f4992c7B545FE) vs `usd-coin` (case 4) | 'Spark USDC Vault' / 'sUSDC': model run 1 | UNRELATED/MODEL | UNRELATED/MODEL | yes | [0x867347a238c07676ab61044ff8832328c2057d03c31d868136000f8de88dc548](https://explorer-studio-dev.genlayer.com/tx/0x867347a238c07676ab61044ff8832328c2057d03c31d868136000f8de88dc548) |
| M3 | DEMO | flag arbitrum [0xE3F520d5C6f5421eE02160242f7a9e025d829E3e](https://arbitrum.blockscout.com/token/0xE3F520d5C6f5421eE02160242f7a9e025d829E3e) vs `usd-coin` (case 5) | real fake: 'Bridged USDC' / 'USDC.e' padded with invisible characters (now decided by code, no model call): model run 1 | IMPERSONATOR/HOMOGLYPH | IMPERSONATOR/HOMOGLYPH | yes | [0x388716742c07071a1d0416dae6713f113df6db18709c0f2c8ef14f490251d068](https://explorer-studio-dev.genlayer.com/tx/0x388716742c07071a1d0416dae6713f113df6db18709c0f2c8ef14f490251d068) |
| M4 | DEMO | flag arbitrum [0xB67c014FA700E69681a673876eb8BAFAA36BFf71](https://arbitrum.blockscout.com/token/0xB67c014FA700E69681a673876eb8BAFAA36BFf71) vs `usd-coin` (case 6) | 'Hop USDC LP Token' / 'HOP-LP-USDC': model run 1 | UNRELATED/MODEL | UNRELATED/MODEL | yes | [0xa55fd42ff7c1f06f59f0390aa885c0591a204a57e0dd9c392d2dd67a9575e533](https://explorer-studio-dev.genlayer.com/tx/0xa55fd42ff7c1f06f59f0390aa885c0591a204a57e0dd9c392d2dd67a9575e533) |
| M1r | DEMO | recheck(case 3) | 'Axelar Wrapped USDC' / 'axlUSDC': model run 2 (recheck) | VARIANT/MODEL | VARIANT/MODEL | yes | [0xa648b1b1e26fb53392fd06090e10c9ee9033e00221e544578797d4c506f6a649](https://explorer-studio-dev.genlayer.com/tx/0xa648b1b1e26fb53392fd06090e10c9ee9033e00221e544578797d4c506f6a649) |
| M2r | DEMO | recheck(case 4) | 'Spark USDC Vault' / 'sUSDC': model run 2 (recheck) | UNRELATED/MODEL | UNRELATED/MODEL | yes | [0x62d03407bcdab30faa8b9c1bec094c2ea665e15a3f821c75427d5b1541ffb207](https://explorer-studio-dev.genlayer.com/tx/0x62d03407bcdab30faa8b9c1bec094c2ea665e15a3f821c75427d5b1541ffb207) |
| M3r | DEMO | recheck(case 5) | real fake: 'Bridged USDC' / 'USDC.e' padded with invisible characters (now decided by code, no model call): model run 2 (recheck) | IMPERSONATOR/HOMOGLYPH | IMPERSONATOR/HOMOGLYPH | yes | [0x50aef6e2113eba41c63cdb0cf7c10ec85b8c4e1a19a4f675737d00ce379cd0c6](https://explorer-studio-dev.genlayer.com/tx/0x50aef6e2113eba41c63cdb0cf7c10ec85b8c4e1a19a4f675737d00ce379cd0c6) |
| M4r | DEMO | recheck(case 6) | 'Hop USDC LP Token' / 'HOP-LP-USDC': model run 2 (recheck) | UNRELATED/MODEL | UNRELATED/MODEL | yes | [0x3e3b64ec74807ac88285a542b55d4b71daeace7b2c8d44b6a4ac467d76016865](https://explorer-studio-dev.genlayer.com/tx/0x3e3b64ec74807ac88285a542b55d4b71daeace7b2c8d44b6a4ac467d76016865) |

## Did not match

- H6-rule: expected IMPERSONATOR/LISTED_COPY, got PENDING. 
- H7-rule: expected IMPERSONATOR/LISTED_COPY, got PENDING. 
- H8-rule: expected IMPERSONATOR/HOMOGLYPH, got PENDING. 
- H9-rule: expected IMPERSONATOR/HOMOGLYPH, got PENDING. 

## MODEL cases judged twice (DEMO)

Each was flagged (run 1) and rechecked after the cooldown (run 2). In a MODEL run every validator asked the model itself and they had to agree on one label. M3 no longer reaches the model: the LISTED_COPY rule decides it by code.

| Case | Token | Run 1 | Run 2 |
|---|---|---|---|
| M1 (case 3) | 'Axelar Wrapped USDC' / 'axlUSDC' | VARIANT/MODEL | VARIANT/MODEL |
| M2 (case 4) | 'Spark USDC Vault' / 'sUSDC' | UNRELATED/MODEL | UNRELATED/MODEL |
| M3 (case 5) | real fake: 'Bridged USDC' / 'USDC.e' padded with invisible characters (now decided by code, no model call) | IMPERSONATOR/HOMOGLYPH | IMPERSONATOR/HOMOGLYPH |
| M4 (case 6) | 'Hop USDC LP Token' / 'HOP-LP-USDC' | UNRELATED/MODEL | UNRELATED/MODEL |

## Recheck history (DEMO case 2)

| # | Label | Basis | At (unix) | Evidence sha256 |
|---|---|---|---|---|
| 1 | IMPERSONATOR | LISTED_COPY | 1790759209 | `9f44ab6b4ea8771ac80424e4b92dac0ed5fd37c4e1551df73713ca5c20215b35` |
| 2 | IMPERSONATOR | LISTED_COPY | 1790760997 | `9f44ab6b4ea8771ac80424e4b92dac0ed5fd37c4e1551df73713ca5c20215b35` |

The first ruling is kept, not overwritten.

## Safelist after S1-S4

Listed:

```json
[
  {
    "added_at": "2026-09-30T09:35:44.353777Z",
    "chain": "ethereum",
    "token": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
  }
]
```

Pruned:

```json
[
  {
    "added_at": "2026-09-30T09:36:03.733643Z",
    "chain": "arbitrum",
    "removed_at": "2026-09-30T09:36:25.756377Z",
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
    "model_rulings": 6,
    "precedent_flags": 0,
    "rechecks": 5
  }
}
```
