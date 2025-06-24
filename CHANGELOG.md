# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [0.6.0](https://github.com/madrus/tournado/compare/v0.5.0...v0.6.0) (2025-06-24)

### Features

- add tournament filtering functionality to team listings, enhance sorting logic for teams, and update translations for tournament-related terms ([a81aff1](https://github.com/madrus/tournado/commit/a81aff1c3c01446413de3581a894d4a037133077))
- **ci:** enhance CI/CD workflows with Slack notifications for build and deployment results ([08e8978](https://github.com/madrus/tournado/commit/08e897897077c0c49a1ab3b47080f5836d6c7fdc))
- enhance TournamentFilter component with type definitions, add comprehensive tests for tournament filtering logic, and improve useTournamentFilter hook for better state management ([f180af7](https://github.com/madrus/tournado/commit/f180af7be738d4aa91d4b9fba27aa134bf504e6e))
- implement tournament form state management with Zustand and enhance validation logic ([837aeca](https://github.com/madrus/tournado/commit/837aecaf4d678914ac0a84647e8bf704d300f807))
- **slack:** add GitHub Actions workflow for Slack notifications ([e868a50](https://github.com/madrus/tournado/commit/e868a5040bfdd3cb25c028e43cd0dd0373fd7b0b))
- **TeamForm:** add reset button functionality and improve form handling ([fed4bfa](https://github.com/madrus/tournado/commit/fed4bfa6b243677019be227938a321222640f5bc))

### Bug Fixes

- **TeamForm:** add note for updateAvailableOptions call in useEffect ([7ea7c5d](https://github.com/madrus/tournado/commit/7ea7c5d985315d904444634669db34311ae0a2b3))
- **tests:** correct Radix UI Select interactions in admin-tournaments tests ([c45cb1c](https://github.com/madrus/tournado/commit/c45cb1c6798f2ebe263d4755d382dd26620ea181))

## [0.5.0](https://github.com/madrus/tournado/compare/v0.4.2...v0.5.0) (2025-06-20)

### Features

- add CustomDatePicker component and integrate Radix UI popover ([33d7c3f](https://github.com/madrus/tournado/commit/33d7c3f1e7c0a3ed79f2d6b2db6c836d98516b42))
- add Radix UI select component and enhance TeamForm validation ([a1082e3](https://github.com/madrus/tournado/commit/a1082e3b2f2d0cac7fbf56eb5caa39ad8f0340d5))
- add tournaments menu item for admin users and update translations ([276b6ea](https://github.com/madrus/tournado/commit/276b6ea209015f0e32d7a2da7751986f54721a7a))
- implement tournament management feature with CRUD operations ([39068e4](https://github.com/madrus/tournado/commit/39068e47e45a1ebdab5c614af7436e7b33301aa2))
- integrate tournament data fetching and enhance TeamForm validation ([1c5cfaa](https://github.com/madrus/tournado/commit/1c5cfaad0d7717b44daaf8e4465062110a9d7183))
- **schema:** add Category enum and improve type consistency ([6de1fe0](https://github.com/madrus/tournado/commit/6de1fe043fec874b978407638990f05a7a7e7b53))

### Bug Fixes

- add Turkish language support for division labels and update pretest script ([b66302f](https://github.com/madrus/tournado/commit/b66302fa50a2f6e1886f63372ba338f3cedc5947))
- **tests:** resolve variable shadowing and improve TeamForm test mocking ([960284a](https://github.com/madrus/tournado/commit/960284a2b642fac5df2f84950508dcbb814b2056))
- **tests:** update i18n mock to return English translations for Zod errors - Remove Zod mocks and use actual English error messages - Fix privacy agreement error text to match translations - Attempt to fix disabled field validation logic - Still 7 tests failing, need to debug validation hook ([389f3cb](https://github.com/madrus/tournado/commit/389f3cb5ea6179bba29274589b2db2630bf6b0f8))
- update TextInputField to allow editing and adjust layout for Add Team button ([b41a1b7](https://github.com/madrus/tournado/commit/b41a1b73c98a38a7249203f83717fb04652c9059))

### [0.4.2](https://github.com/madrus/tournado/compare/v0.4.1...v0.4.2) (2025-06-15)

### Features

- add category selection to TeamForm component ([f1aeba0](https://github.com/madrus/tournado/commit/f1aeba025cb1e4c4cb7c6cf1a6d6a30848f96356))
- enhance i18n support with Turkish language and SSR integration ([17a909f](https://github.com/madrus/tournado/commit/17a909fcc3cbb008b4b94eead05b97cb7311ff42))
- implement role-based routing in IndexPage and add unit tests ([1e53141](https://github.com/madrus/tournado/commit/1e53141e48c1a4a9be1245ea33603141b05e8bb8))
- improves i18n support and UI enhancements ([7a5c874](https://github.com/madrus/tournado/commit/7a5c8745a7d23671a4fe905654e7b22c0e1690fe))
- migrate from Cypress to Playwright for end-to-end testing ([df34fcc](https://github.com/madrus/tournado/commit/df34fccb49d3e9f288d56e2192e17b3e57cbd459))
- update AppBar and Team components for role-based routing and improved styling ([9075b9f](https://github.com/madrus/tournado/commit/9075b9fb62ca6808b020017324f12eef099d3314))

### [0.4.1](https://github.com/madrus/tournado/compare/v0.4.0...v0.4.1) (2025-06-10)

### [0.3.17](https://github.com/madrus/tournado/compare/v0.3.16...v0.3.17) (2025-06-06)

### Bug Fixes

- broken link ([a50a3c4](https://github.com/madrus/tournado/commit/a50a3c4885eb0343147372da6af81e9f112e4f7d))

### [0.3.16](https://github.com/madrus/tournado/compare/v0.3.15...v0.3.16) (2025-05-31)

### [0.3.15](https://github.com/madrus/tournado/compare/v0.3.14...v0.3.15) (2025-05-31)

### [0.3.14](https://github.com/madrus/tournado/compare/v0.3.12...v0.3.14) (2025-05-31)

### Bug Fixes

- 🐛 use relative file urls for .css imports ([c0be92f](https://github.com/madrus/tournado/commit/c0be92ffee57dd30d37481061abb52a5ac75807f))

### [0.3.13](https://github.com/madrus/tournado/compare/v0.3.12...v0.3.13) (2025-05-27)

### Bug Fixes

- 🐛 use relative file urls for .css imports ([02eb070](https://github.com/madrus/tournado/commit/02eb070083e734bab917f6b262c897533f6eb5b3))
- 🐛 use relative file urls for .css imports ([c0be92f](https://github.com/madrus/tournado/commit/c0be92ffee57dd30d37481061abb52a5ac75807f))

### [0.3.12](https://github.com/madrus/tournado/compare/v0.3.11...v0.3.12) (2025-05-06)

### [0.3.11](https://github.com/madrus/tournado/compare/v0.3.10...v0.3.11) (2025-05-06)

### [0.3.10](https://github.com/madrus/tournado/compare/v0.3.9...v0.3.10) (2025-05-01)

### [0.3.9](https://github.com/madrus/tournado/compare/v0.3.8...v0.3.9) (2025-04-28)

### [0.3.8](https://github.com/madrus/tournado/compare/v0.3.7...v0.3.8) (2025-04-27)

### [0.3.7](https://github.com/madrus/tournado/compare/v0.3.6...v0.3.7) (2025-04-24)

### Bug Fixes

- 🐛 database migrations ([5861c9c](https://github.com/madrus/tournado/commit/5861c9c899a0232c53de53d422d373f5dce1689e))

### [0.3.6](https://github.com/madrus/tournado/compare/v0.3.5...v0.3.6) (2025-04-24)

### [0.3.5](https://github.com/madrus/tournado/compare/v0.3.4...v0.3.5) (2025-04-23)

### [0.3.4](https://github.com/madrus/tournado/compare/v0.3.3...v0.3.4) (2025-04-23)

### Bug Fixes

- 🐛 sw registration ([d406c3d](https://github.com/madrus/tournado/commit/d406c3d3d744aaf478527a35d8865c9b158080a2))

### [0.3.3](https://github.com/madrus/tournado/compare/v0.3.2...v0.3.3) (2025-04-22)

### Bug Fixes

- 🐛 service worker registration ([fa90c0a](https://github.com/madrus/tournado/commit/fa90c0a507c693e5f85e46e85d9a8c4753d473c3))

### [0.3.2](https://github.com/madrus/tournado/compare/v0.3.1...v0.3.2) (2025-04-22)

### [0.3.1](https://github.com/madrus/tournado/compare/v0.3.0...v0.3.1) (2025-04-22)

### Features

- 🎸 add translations ([9112ed6](https://github.com/madrus/tournado/commit/9112ed634901d874df2cf415303aa289a741025c))

### Bug Fixes

- 🐛 new version prompt and initial language ([214daf0](https://github.com/madrus/tournado/commit/214daf0c2ee92210854744e15109729df8c6bc31))

### [0.2.6](https://github.com/madrus/tournado/compare/v0.2.5...v0.2.6) (2025-04-21)

### [0.2.5](https://github.com/madrus/tournado/compare/v0.2.4...v0.2.5) (2025-04-21)

### [0.2.4](https://github.com/madrus/tournado/compare/v0.2.3...v0.2.4) (2025-04-21)

### [0.2.3](https://github.com/madrus/tournado/compare/v0.2.2...v0.2.3) (2025-04-20)

### [0.2.2](https://github.com/madrus/tournado/compare/v0.2.1...v0.2.2) (2025-04-20)

### Bug Fixes

- link repository ([eb5e364](https://github.com/madrus/tournado/commit/eb5e3640dc104fe5d10ee1965de23c8031653e4a))

### [0.2.1](https://github.com/madrus/tournado/compare/3ee582485ab7d1f25d3679bbd38595246ba51dc6...v0.2.1) (2025-04-20)

### Features

- finish initial design ([#11](https://github.com/madrus/tournado/issues/11)) ([b2fd11e](https://github.com/madrus/tournado/commit/b2fd11ee9a9bf8692cd9676d9f360f87a5bcf2c1))

### Bug Fixes

- allow for notch area on iphones ([#10](https://github.com/madrus/tournado/issues/10)) ([3ee5824](https://github.com/madrus/tournado/commit/3ee582485ab7d1f25d3679bbd38595246ba51dc6))

## [0.3.0](https://github.com/madrus/tournado/compare/v0.2.7...v0.3.0) (2025-04-22)

### 0.2.7 (2025-04-22)

### Features

- 🎸 add translations ([095595e](https://github.com/madrus/tournado/commit/095595e3be3ac020cd262c419dbd4daff79f5c22))
- deploy the app successfully ([#2](https://github.com/madrus/tournado/issues/2)) ([a592316](https://github.com/madrus/tournado/commit/a592316783d227ab5a2e10af86e2daa438b3bab9))
- initial mobile first version ([#12](https://github.com/madrus/tournado/issues/12)) ([0fef941](https://github.com/madrus/tournado/commit/0fef94181e24e98c11dff675648bc55ae8c6ad3e)), closes [#9](https://github.com/madrus/tournado/issues/9) [#10](https://github.com/madrus/tournado/issues/10) [#11](https://github.com/madrus/tournado/issues/11)

### Bug Fixes

- add alias to vite.config.ts ([4765442](https://github.com/madrus/tournado/commit/4765442573ca255126b1c436e1a5e7724360a0fa))
- default deployment region should be ams ([#3](https://github.com/madrus/tournado/issues/3)) ([3d39674](https://github.com/madrus/tournado/commit/3d39674079f23afda6651e9118b8652f03aaafec))
- remove ?url ([39671b9](https://github.com/madrus/tournado/commit/39671b985e3179d69685ac4b949287d9f89de64c))
- restore tw v3 as tw v4 not yet feasible ([34787b3](https://github.com/madrus/tournado/commit/34787b3be38af7aa4f703409a8f655e25c2432e9))

### [0.2.6](https://github.com/madrus/tournado/compare/v0.2.5...v0.2.6) (2025-04-21)

### Features

- initial mobile first version ([#12](https://github.com/madrus/tournado/issues/12)) ([0fef941](https://github.com/madrus/tournado/commit/0fef94181e24e98c11dff675648bc55ae8c6ad3e)), closes [#9](https://github.com/madrus/tournado/issues/9) [#10](https://github.com/madrus/tournado/issues/10) [#11](https://github.com/madrus/tournado/issues/11)

### [0.2.5](https://github.com/madrus/tournado/compare/v0.2.4...v0.2.5) (2025-04-21)

### [0.2.4](https://github.com/madrus/tournado/compare/v0.2.3...v0.2.4) (2025-04-21)

### [0.2.3](https://github.com/madrus/tournado/compare/v0.2.2...v0.2.3) (2025-04-20)

### [0.2.2](https://github.com/madrus/tournado/compare/v0.2.1...v0.2.2) (2025-04-20)

### Bug Fixes

- link repository ([eb5e364](https://github.com/madrus/tournado/commit/eb5e3640dc104fe5d10ee1965de23c8031653e4a))

### 0.2.1 (2025-04-20)

### Features

- deploy the app successfully ([#2](https://github.com/madrus/tournado/issues/2)) a592316
- finish initial design ([#11](https://github.com/madrus/tournado/issues/11)) b2fd11e

### Bug Fixes

- add alias to vite.config.ts 4765442
- allow for notch area on iphones ([#10](https://github.com/madrus/tournado/issues/10)) 3ee5824
- default deployment region should be ams ([#3](https://github.com/madrus/tournado/issues/3)) 3d39674
- remove ?url 39671b9
- restore tw v3 as tw v4 not yet feasible 34787b3

## [0.2.0](https://github.com/madrus/tournado/compare/v0.1.1...v0.2.0) (2025-04-20)

### 0.1.1 (2025-04-20)

### Features

- add option to install app on the mobile 3d7a690
- deploy the app successfully ([#2](https://github.com/madrus/tournado/issues/2)) a592316

### Bug Fixes

- add alias to vite.config.ts 4765442
- adds safe area insets for mobile devices cbb5327
- allow for notch area on iphones ([#10](https://github.com/madrus/tournado/issues/10)) 3ee5824
- default deployment region should be ams ([#3](https://github.com/madrus/tournado/issues/3)) 3d39674
- install the app prompt 4039a0e
- remove ?url 39671b9
- restore tw v3 as tw v4 not yet feasible 34787b3
