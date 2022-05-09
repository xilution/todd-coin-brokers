# [5.2.0](https://github.com/xilution/todd-coin-brokers/compare/v5.1.1...v5.2.0) (2022-05-09)


### Features

* removed good points from mining reward ([5b05e5d](https://github.com/xilution/todd-coin-brokers/commit/5b05e5d6391c8d22104aec0759aa644a3b49ea44))

## [5.1.1](https://github.com/xilution/todd-coin-brokers/compare/v5.1.0...v5.1.1) (2022-05-09)


### Bug Fixes

* fixed mining from and to ([ed66f18](https://github.com/xilution/todd-coin-brokers/commit/ed66f1800dc798cb9a6a321db61229c26d1e9862))

# [5.1.0](https://github.com/xilution/todd-coin-brokers/compare/v5.0.0...v5.1.0) (2022-05-08)


### Bug Fixes

* fixed transaction properties and set unique fields ([6c38804](https://github.com/xilution/todd-coin-brokers/commit/6c38804e7dffd036cacddbda27fa31267968b573))


### Features

* bumped todd-coin-constants and todd-coin-utils versions ([2192b51](https://github.com/xilution/todd-coin-brokers/commit/2192b515a6f9ce8647b1687d426a32ed7ba47080))
* updated create block ([4237f28](https://github.com/xilution/todd-coin-brokers/commit/4237f28fc8830937820cb5147ba2efd286d4a38a))

# [5.0.0](https://github.com/xilution/todd-coin-brokers/compare/v4.0.2...v5.0.0) (2022-05-08)


### Features

* bumped todd-coin-utils version ([7ca3aab](https://github.com/xilution/todd-coin-brokers/commit/7ca3aabee8b913b834847b8fb7e8d7aa40157a70))


### BREAKING CHANGES

* adapted to new todd-coin-types

## [4.0.2](https://github.com/xilution/todd-coin-brokers/compare/v4.0.1...v4.0.2) (2022-05-07)


### Bug Fixes

* fixed getParticipantKeys search criteria ([55f71c0](https://github.com/xilution/todd-coin-brokers/commit/55f71c07a9b33f6e931ae16c9bd8d40934d44674))

## [4.0.1](https://github.com/xilution/todd-coin-brokers/compare/v4.0.0...v4.0.1) (2022-05-07)


### Bug Fixes

* made type search criteria optional ([efe3aa8](https://github.com/xilution/todd-coin-brokers/commit/efe3aa85d61d5b47065211bde3786deff01591df))

# [4.0.0](https://github.com/xilution/todd-coin-brokers/compare/v3.3.0...v4.0.0) (2022-05-06)


### Features

* improved get many things search criteria ([ddb6627](https://github.com/xilution/todd-coin-brokers/commit/ddb6627360cabf59a00d046504ed7755fb12cc4e))


### BREAKING CHANGES

* removed getParticipantsByEmail and change other method signatures

# [3.3.0](https://github.com/xilution/todd-coin-brokers/compare/v3.2.0...v3.3.0) (2022-05-06)


### Features

* throw errors when models aren't ready ([5d8b5cc](https://github.com/xilution/todd-coin-brokers/commit/5d8b5cc49f092a755c7bb0bc652ed202535fad14))

# [3.2.0](https://github.com/xilution/todd-coin-brokers/compare/v3.1.1...v3.2.0) (2022-05-06)


### Bug Fixes

* improved multiple participant found for email error ([cad1d29](https://github.com/xilution/todd-coin-brokers/commit/cad1d2911a7f222219c6e817cfec0e8f6f684f71))


### Features

* bumped todd-coin-types and todd-coin-utils versions ([b05cdbb](https://github.com/xilution/todd-coin-brokers/commit/b05cdbbef4d8e8f5da7d12331fbde4a8c889f6eb))
* made organization email nullable ([be55977](https://github.com/xilution/todd-coin-brokers/commit/be5597762fc01709624ee87044ac0149b85b693f))
* made participant password nullable ([bf8292a](https://github.com/xilution/todd-coin-brokers/commit/bf8292ac43db07457f38facd515f60a7e1fd77c1))

## [3.1.1](https://github.com/xilution/todd-coin-brokers/compare/v3.1.0...v3.1.1) (2022-05-05)


### Bug Fixes

* conditionally create mining reward if the mminerParticipantId is set ([ae421c5](https://github.com/xilution/todd-coin-brokers/commit/ae421c5ce0e2a52e530c4fa11a6e49bc5ff8d606))

# [3.1.0](https://github.com/xilution/todd-coin-brokers/compare/v3.0.3...v3.1.0) (2022-05-05)


### Features

* bumped todd-coin-types and todd-coin-utils versions ([2faaf63](https://github.com/xilution/todd-coin-brokers/commit/2faaf63553de6d16ec53b3a0545f178c72676711))

## [3.0.3](https://github.com/xilution/todd-coin-brokers/compare/v3.0.2...v3.0.3) (2022-05-04)


### Bug Fixes

* fixed infinite loop ([cd26120](https://github.com/xilution/todd-coin-brokers/commit/cd261209aa3eb0fe3e16daba4a4c5c6938312626))

## [3.0.2](https://github.com/xilution/todd-coin-brokers/compare/v3.0.1...v3.0.2) (2022-05-04)


### Bug Fixes

* added relations to participant key broker ([e5c763f](https://github.com/xilution/todd-coin-brokers/commit/e5c763f8aac3ad0b4658763c6ddf64c3bdc7f9f9))

## [3.0.1](https://github.com/xilution/todd-coin-brokers/compare/v3.0.0...v3.0.1) (2022-05-04)


### Bug Fixes

* removed key generation from create participant ([e078143](https://github.com/xilution/todd-coin-brokers/commit/e0781433443580304f47feeb8639f30f3709c6f2))

# [3.0.0](https://github.com/xilution/todd-coin-brokers/compare/v2.4.1...v3.0.0) (2022-05-04)


### Features

* added updateParticipantKey function ([32ff9ab](https://github.com/xilution/todd-coin-brokers/commit/32ff9ab7f80b1f8ca27095f0b1fb56998a6fa085))


### BREAKING CHANGES

* removed deactivateParticipantKey

## [2.4.1](https://github.com/xilution/todd-coin-brokers/compare/v2.4.0...v2.4.1) (2022-05-04)


### Bug Fixes

* fixed transaction-brokers ([43c5569](https://github.com/xilution/todd-coin-brokers/commit/43c5569cb5fba6474ae93f221e745c6c077d37ae))

# [2.4.0](https://github.com/xilution/todd-coin-brokers/compare/v2.3.1...v2.4.0) (2022-05-03)


### Features

* added deletePendingTransactionById function ([57a32f8](https://github.com/xilution/todd-coin-brokers/commit/57a32f8648e8b0fd87a065050da8761b8be6b3a3))

## [2.3.1](https://github.com/xilution/todd-coin-brokers/compare/v2.3.0...v2.3.1) (2022-05-03)


### Bug Fixes

* fixed transaction state reference ([e940b53](https://github.com/xilution/todd-coin-brokers/commit/e940b53ec954ee86db796907963f4e4210b7cf09))

# [2.3.0](https://github.com/xilution/todd-coin-brokers/compare/v2.2.1...v2.3.0) (2022-05-03)


### Features

* added entity relations ([5c24cb6](https://github.com/xilution/todd-coin-brokers/commit/5c24cb6ea8f0b86320e6d87fe47e94e29e8e8793))

## [2.2.1](https://github.com/xilution/todd-coin-brokers/compare/v2.2.0...v2.2.1) (2022-05-02)


### Bug Fixes

* fixed create participant function ([c034053](https://github.com/xilution/todd-coin-brokers/commit/c0340539cb4f767dbf479f4cb2367c52c5505cb2))

# [2.2.0](https://github.com/xilution/todd-coin-brokers/compare/v2.1.0...v2.2.0) (2022-04-28)


### Features

* added roles to update organizations ([2a2cc75](https://github.com/xilution/todd-coin-brokers/commit/2a2cc758c7c2662731578598bf9aea365219d61c))
* added roles to update participants ([16860d5](https://github.com/xilution/todd-coin-brokers/commit/16860d5ea5760dd3f36beac328669b972019b99f))

# [2.1.0](https://github.com/xilution/todd-coin-brokers/compare/v2.0.0...v2.1.0) (2022-04-28)


### Features

* added deactivateParticipantKey function ([861955f](https://github.com/xilution/todd-coin-brokers/commit/861955f3ba6f7a5f99b8f90b3d7f87dc1c36072c))
* added deleteOrganizationParticipantRef function ([0521802](https://github.com/xilution/todd-coin-brokers/commit/052180200944632dcf4271c90b7939f3ee4a59f2))
* added updateNode function ([2c50794](https://github.com/xilution/todd-coin-brokers/commit/2c50794a6f28954c52cb60df13d677e59089a87a))
* added updateOrganization function ([6e13f19](https://github.com/xilution/todd-coin-brokers/commit/6e13f1998fa6eba60727db047b86baf73bce8b71))
* added updateParticipant function ([41ab2b0](https://github.com/xilution/todd-coin-brokers/commit/41ab2b0f6b69424c32512f59eb602278f03b3b3e))
* added updatePendingTransaction and updateSignedTransaction functions ([069e837](https://github.com/xilution/todd-coin-brokers/commit/069e8378896ffb0542f2eb1d64c4f2a34243ea8c))

# [2.0.0](https://github.com/xilution/todd-coin-brokers/compare/v1.3.0...v2.0.0) (2022-04-27)


### Features

* added organization participant reference ([ac0f2af](https://github.com/xilution/todd-coin-brokers/commit/ac0f2afe963d1fbc732aee413b106f220ea64aa7))


### BREAKING CHANGES

* change function signatures

# [1.3.0](https://github.com/xilution/todd-coin-brokers/compare/v1.2.2...v1.3.0) (2022-04-22)


### Features

* order blocks by sequenceId ([be484d2](https://github.com/xilution/todd-coin-brokers/commit/be484d2974f90e2d82cc5c8b8858b1c84fbe6c9c))

## [1.2.2](https://github.com/xilution/todd-coin-brokers/compare/v1.2.1...v1.2.2) (2022-04-22)


### Bug Fixes

* added sequenceId to create ([4762262](https://github.com/xilution/todd-coin-brokers/commit/47622625e39cbc4c05a8b8ff787fb17824aa7ecb))

## [1.2.1](https://github.com/xilution/todd-coin-brokers/compare/v1.2.0...v1.2.1) (2022-04-22)


### Bug Fixes

* added transactions to latest block ([9baba13](https://github.com/xilution/todd-coin-brokers/commit/9baba13a56170e89b324f37289452e5b54594b26))

# [1.2.0](https://github.com/xilution/todd-coin-brokers/compare/v1.1.0...v1.2.0) (2022-04-22)


### Features

* added getLatestBlock function ([d993b6a](https://github.com/xilution/todd-coin-brokers/commit/d993b6a6a9a113c3e33f8f834ce7de544eba3c7e))

# [1.1.0](https://github.com/xilution/todd-coin-brokers/compare/v1.0.4...v1.1.0) (2022-04-20)


### Features

* added environment utils for db settings ([163ebb9](https://github.com/xilution/todd-coin-brokers/commit/163ebb936bd470e7f9752f7cbae49d5a2727c3bc))

## [1.0.4](https://github.com/xilution/todd-coin-brokers/compare/v1.0.3...v1.0.4) (2022-04-15)


### Bug Fixes

* fixed get nodes response type ([f57a5e2](https://github.com/xilution/todd-coin-brokers/commit/f57a5e2ea8a08ecaf33c2edc061f17faf68d4908))

## [1.0.3](https://github.com/xilution/todd-coin-brokers/compare/v1.0.2...v1.0.3) (2022-04-15)


### Bug Fixes

* improved error response ([4b18d5d](https://github.com/xilution/todd-coin-brokers/commit/4b18d5d14a17738a62c8c5d8521db9e061900f7b))
