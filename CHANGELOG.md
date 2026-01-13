# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [0.10.0](https://github.com/madrus/tournado/compare/v0.9.0...v0.10.0) (2025-11-28)

### Features

- add detailed logging for team creation and email handling processes ([355cac3](https://github.com/madrus/tournado/commit/355cac33a118edc5c60c7b083e846e029f4059a9))
- add EMAIL_FROM environment variable for email configuration and refactor NODE_OPTIONS handling in e2e scripts ([fb357b6](https://github.com/madrus/tournado/commit/fb357b6d096e961cd001feb8cd031c8516d0e0b5))
- add environment variable for Admin Dashboard URL and update related configurations ([938700c](https://github.com/madrus/tournado/commit/938700c4d58f758a3858ad8095e065bd751d87d7))
- add getMenuItemLineHeight utility for improved RTL support ([2854109](https://github.com/madrus/tournado/commit/28541098bf62e136015cc4b97a7f6c4d08e9587d))
- add Groups and Matches API routes with authorization checks and tests ([e277252](https://github.com/madrus/tournado/commit/e277252528c20bc0f0c9f1512e33c2fb900f7d8b))
- add InfoBanner and TextAreaInputField components, enhance user management UI ([406ed1a](https://github.com/madrus/tournado/commit/406ed1af06dcf4f31f6e345c464fc812367b5efc))
- add logging for server output during Playwright test execution ([cd4bfa9](https://github.com/madrus/tournado/commit/cd4bfa94811145d6dfca398bbbd76ba3b9ed70ee))
- complete user management workflows with comprehensive testing and Firebase integration ([44c4ef0](https://github.com/madrus/tournado/commit/44c4ef026ddbebe635866b6c23ff30a211b94fb8))
- enhance authentication components and input handling ([3232ca5](https://github.com/madrus/tournado/commit/3232ca51a1301a7337e1623bf5e216a892d05553))
- enhance ComboField styling and functionality in user management ([8854da6](https://github.com/madrus/tournado/commit/8854da6ca0d4dad056630c877d0173d870a7c950))
- enhance Firebase authentication components with label styling ([ffbb554](https://github.com/madrus/tournado/commit/ffbb554229fe19b36c28f51db92ca07f9b35f6c2))
- enhance layout and styling in FirebaseEmailSignIn and TournamentForm components ([5562606](https://github.com/madrus/tournado/commit/5562606a990b5b3bef63e8bdfae2178a88cd912e))
- enhance NODE_OPTIONS handling and improve logging in e2e server scripts ([2a059c0](https://github.com/madrus/tournado/commit/2a059c0e390fff2ae79660b3e6f71a3fd1181259))
- enhance semantic structure and organization in documentation and components ([db084e4](https://github.com/madrus/tournado/commit/db084e41d791fab9e70845314614ba8ecfb74d46))
- enhance user management features with role validation and account deactivation handling ([fb427a4](https://github.com/madrus/tournado/commit/fb427a4642d75281204cff3db3630724906130f6))
- enhance user management UI and role assignment functionality ([f7161ce](https://github.com/madrus/tournado/commit/f7161cec3a3548a3dac08278962154316034839b))
- enhance UserAuditLogList and UserDetailCard components with improved accessibility and testing ([0bccab4](https://github.com/madrus/tournado/commit/0bccab48a73ee25c4228d5c0f374ebbe2c60b5d9))
- expand role-based access for Admin Dashboard and update tests ([239c4c9](https://github.com/madrus/tournado/commit/239c4c9600cd9def3c3681cf56e97bfe69d3a70a))
- implement Firebase authentication components with email and Google sign-in ([b7f6a56](https://github.com/madrus/tournado/commit/b7f6a560dacaf0ca9e966ec65624e25aac9991da))
- implement Firebase user management functions and update localization ([6d41432](https://github.com/madrus/tournado/commit/6d41432a8a4f11ec529e9cc22a836f6f2514ab05))
- implement server-side translation support and enhance internationalization ([e935585](https://github.com/madrus/tournado/commit/e9355858b5d4f0277984cfb4b7f636c0425f8b44))
- implement server-side translation support and enhance internationalization ([7ad1b70](https://github.com/madrus/tournado/commit/7ad1b703984d0a01ea62f70fdd8d3341f3fe9fb2))
- implement user role assignment component and enhance user detail views ([a9983ba](https://github.com/madrus/tournado/commit/a9983ba1a5cc7589358c297ef75abbe712373c3f))
- update AppBar menu items and RBAC permissions ([9791cc5](https://github.com/madrus/tournado/commit/9791cc5e3a3e9253d2b0996324fa4427c7d598cc))
- update email handling in e2e scripts and improve server log output ([380b7d2](https://github.com/madrus/tournado/commit/380b7d2137bda809bd850ca23c40a8c30923a5cd))
- update i18n configuration and add VS Code workspace settings ([1ec74a1](https://github.com/madrus/tournado/commit/1ec74a16c1bad2dd9fa66dae2eb4fc54777b457f))
- update i18n configuration and enhance authentication component styling ([920066b](https://github.com/madrus/tournado/commit/920066b8ccf9f5bff0067da1754bd7c470c1eeb9))
- update i18n configuration and route titles for localization ([0864712](https://github.com/madrus/tournado/commit/08647128c5637ec6bfb336222bc7dca14d6ea8aa))

### Bug Fixes

- enhance Latin title styling for Arabic context ([54beb75](https://github.com/madrus/tournado/commit/54beb7586f3324ebffb612861a0fd715f18f33f7))
- improve error handling in fetchCapturedEmails function ([dc35617](https://github.com/madrus/tournado/commit/dc3561769231e1836672c12cbe0c92d01c86ce15))
- set default EMAIL_FROM for e2e server if not provided ([f05c98f](https://github.com/madrus/tournado/commit/f05c98fa812863cf4500623d824f966c5a478cd4))
- update Arabic language support in Panel and ActionLinkPanel components ([a1f5191](https://github.com/madrus/tournado/commit/a1f5191bd3337eae5fa1596d5c93106c6958d182))
- update EMAIL_FROM context to include 'ci' and 'e2e' ([b1cc0c3](https://github.com/madrus/tournado/commit/b1cc0c37342ba50a6709d8c2f690f1684acff9d4))
- update InfoBanner accessibility roles and add comprehensive tests for user management components ([a65af39](https://github.com/madrus/tournado/commit/a65af397c0ab3752dc5998a65e4280ebf5e8330b))
- update server start command to include DATABASE_URL for testing ([09647bb](https://github.com/madrus/tournado/commit/09647bb5ca2b95a4b7bca40c8dd0fd329390e6d8))

## [0.8.0](https://github.com/madrus/tournado/compare/v0.7.0...v0.8.0) (2025-07-31)

### Features

- add animated unfold icons and integrate into ComboField component ([076e344](https://github.com/madrus/tournado/commit/076e3448dd657a920869237b789ca9c996bf0081))
- add MCP server configurations and update role-based redirects ([28029ff](https://github.com/madrus/tournado/commit/28029ff921163a84850db4b018b7af60251f1494))
- add modern-normalize for consistent styling across browsers ([3bcda10](https://github.com/madrus/tournado/commit/3bcda10fec38644e2c33bbc952e5aaa283726d28))
- add pathname normalization utility and enhance NavigationItem component ([aa4ea55](https://github.com/madrus/tournado/commit/aa4ea5504007b64b80e41b9cdfcfd155d9759bb9))
- add TeamsLayout component and enhance AdminLayout with min-height ([0f9201f](https://github.com/madrus/tournado/commit/0f9201fa785e6b52663799ff7e10e072fac53a18))
- enhance email sending functionality with lazy initialization and error handling ([822a5c5](https://github.com/madrus/tournado/commit/822a5c56e77e6d5d2d571b90be60a7789b80d084))
- enhance NavigationItem component with responsive icon sizing and optimize color variants ([b3e3c3b](https://github.com/madrus/tournado/commit/b3e3c3b068b5c76606cf8fa56c7acb10c0041440))
- enhance rate limiting alerts and IP validation ([69f30ec](https://github.com/madrus/tournado/commit/69f30ec8a972351988b0211a13df76734102104a))
- enhance rate limiting and testing for admin routes ([c25f756](https://github.com/madrus/tournado/commit/c25f756d0f3124fee9ca3fd4b90f2e189ea7aa25))
- enhance rate limiting functionality and security measures ([2565659](https://github.com/madrus/tournado/commit/256565951c8ae9e724e409d69293c41282326f1d))
- enhance scroll direction handling and layout responsiveness ([fc94eb2](https://github.com/madrus/tournado/commit/fc94eb2bfa75270b2209a5a7c9234dd3a13a28ec))
- enhance SidebarLayout and IP validation security ([d57dab6](https://github.com/madrus/tournado/commit/d57dab60528ff505fa9b6ecac3beeb5eeeda454b))
- implement mobile web app configuration and navigation item variants ([b246882](https://github.com/madrus/tournado/commit/b2468826e2ff4d5c63b3462b84bc56fd1cf6dac0))
- implement overscroll tolerance and improve mobile detection in useScrollDirection hook ([e35ace7](https://github.com/madrus/tournado/commit/e35ace7eb970ad3f96756b829a6742173b67f1f7))
- implement rate limiting for admin routes and enhance security measures ([08a0ae4](https://github.com/madrus/tournado/commit/08a0ae48e26815dcad25e89235de52413b88111c))
- implement role-based redirects and add MCP configuration ([5069b21](https://github.com/madrus/tournado/commit/5069b21998cbde7f567a4a78976f7d04fa6ec976))
- implement shared animations and responsive breakpoints ([08b1ac2](https://github.com/madrus/tournado/commit/08b1ac2942ec704e9dce0ad7b20996660a1f9006))
- implement team registration email functionality ([c948500](https://github.com/madrus/tournado/commit/c94850052ecbaa4bd4952e733df843d926476893))
- introduce shared color variants and refactor panel styling ([d983eb3](https://github.com/madrus/tournado/commit/d983eb3fab86eceff3a8417b7a2724d7da46699d))
- update sidebar and enhance checkbox styling ([71bf05f](https://github.com/madrus/tournado/commit/71bf05f6c73770e3d9b85379a5501ace37f97671)), closes [PR#154](https://github.com/madrus/PR/issues/154)

### Bug Fixes

- enhance scroll direction hook and improve checkbox styling ([c4cad2d](https://github.com/madrus/tournado/commit/c4cad2db23e33f7420e8c1c3f906bb369958845d))
- enhance useScrollDirection hook for improved scroll handling ([05a5564](https://github.com/madrus/tournado/commit/05a55644f3d516f2e235c8bb6a256ca8b8458cbd))
- implement useMediaQuery hook for responsive design in NavigationItem ([5507b5f](https://github.com/madrus/tournado/commit/5507b5f43b490362233c7f638d6f477bb3088b63))
- improve layout and responsive design across components ([01abd91](https://github.com/madrus/tournado/commit/01abd910bafaa5f520fe6af68dbfba98611ab40c))
- improve touch event handling in useScrollDirection hook ([a15f943](https://github.com/madrus/tournado/commit/a15f943f041c308d64369f7ae9f6f65b1cd745cd))
- optimize initial team data preparation with useMemo ([783930d](https://github.com/madrus/tournado/commit/783930d10787d3a687d6a19a049e10151f9281b9))
- optimize responsive icon sizing and improve scroll direction handling ([e62c515](https://github.com/madrus/tournado/commit/e62c5150f6d5f80496df48b39b0b35d62dbba7cd))
- prevent memory leaks in useScrollDirection hook by tracking component mount status ([0c6614d](https://github.com/madrus/tournado/commit/0c6614d1fa79e06c4fc0c263792d184fa80e18f1))
- prevent position drift in useScrollDirection hook ([b05821f](https://github.com/madrus/tournado/commit/b05821f5c7b2139de93ad910bd0181db2af80c4c))
- update CONTENT_PX for improved mobile padding and mark uniform styling as complete in documentation ([85a6935](https://github.com/madrus/tournado/commit/85a6935684d20eb09955a197a8fad04feef56707))
- update icon size in ThemeToggle component for improved visibility ([e431f76](https://github.com/madrus/tournado/commit/e431f7607297c1654c1350681a2a64014b594f86))
- update Panel component styling for disabled state ([5d7ee5b](https://github.com/madrus/tournado/commit/5d7ee5be9c7178d3d8750c84e5b3550a5808ab09))
- update sidebar toggle behavior to use alert instead of console log ([88ce991](https://github.com/madrus/tournado/commit/88ce9917089498aeabb8ae779517e2cc09a8a0d1))
- update TeamForm validation logic and improve error message handling ([2024b62](https://github.com/madrus/tournado/commit/2024b622d960b642aaa17d299bc9f7076fe597ff))

## [0.7.0](https://github.com/madrus/tournado/compare/v0.6.0...v0.7.0) (2025-07-23)

### Features

- add bounce animation to AppBar for enhanced visibility ([6f52f15](https://github.com/madrus/tournado/commit/6f52f158dda9e548d536cc11817e9952fab01cc8))
- add comprehensive Product Requirements Document (PRD) and cursor rules ([f952db8](https://github.com/madrus/tournado/commit/f952db8b85927a4f141b804adf1981fb58820bfa))
- add French language support and update internationalization ([858da0e](https://github.com/madrus/tournado/commit/858da0e61ec0a3b1e099592b5a9db672bd5c071d))
- add stable background layer to ActionLinkPanel for improved visual consistency ([7e32867](https://github.com/madrus/tournado/commit/7e328677beca37b1f16a7961bffd4f13c6a9da45))
- add TeamsLayoutHeader component for improved team page headers ([cf9bb55](https://github.com/madrus/tournado/commit/cf9bb552566e1c3a3fddb6c88e9d170725beb8fa))
- add theme toggle functionality and localization support ([b24b7a3](https://github.com/madrus/tournado/commit/b24b7a33a3397fcf4e7cb032f4c4b8edb77021eb))
- enhance AppBar and BottomNavigation animations for improved user experience ([5444b24](https://github.com/madrus/tournado/commit/5444b24f63f8c39f8e4abf6c7ffdf5de41cf8620))
- enhance icon system with comprehensive guidelines and optimizations ([3a3eac5](https://github.com/madrus/tournado/commit/3a3eac5a24ac05fb85344ab71551e8b42d8d4621))
- enhance internationalization support and validate language/theme settings ([d1eefac](https://github.com/madrus/tournado/commit/d1eefac11420e6244e8d9fb009b5bf9e8c2c3f70))
- enhance layout and scrolling behavior in App component ([2983f3a](https://github.com/madrus/tournado/commit/2983f3a9ce45aa15b27948ae43b6f1cff329523d))
- enhance Panel component with new features and integrate into TeamForm ([18a1454](https://github.com/madrus/tournado/commit/18a1454c211bc9a78d4a3ab18d853ea6f7e58a79))
- implement ActionLinkPanel component with customizable styles and hover effects ([ef4f751](https://github.com/madrus/tournado/commit/ef4f7518f7fb110e071117b923f7b8ab2f33a8a7))
- implement visual regression testing framework and enhance documentation ([821dcf8](https://github.com/madrus/tournado/commit/821dcf8861e402bf1b0b446c5598b5d7c005cef8))
- improve AppBar behavior and layout with dynamic header visibility ([ec861cc](https://github.com/madrus/tournado/commit/ec861cca6200bc8b6458cbfaa236e7e0820bb60a))
- introduce ActionLinkPanel component and update related styles ([f3e5c0c](https://github.com/madrus/tournado/commit/f3e5c0c24206c7a2a71e55be874906af1c85bd5c))
- introduce AnimatedHamburgerIcon component and update UserMenu ([efe49fd](https://github.com/madrus/tournado/commit/efe49fdfdf15fa56bc37c719be910b89dd0ec84c))
- introduce ErrorMessage component for consistent error handling across forms ([24b5521](https://github.com/madrus/tournado/commit/24b5521312154b6c65405a2cc9bde876f4b17f08))
- introduce Panel component for consistent UI styling ([3854942](https://github.com/madrus/tournado/commit/3854942aa7e4db7533917d5b8595a57c38abffcc))
- **settings:** implement centralized settings store for theme and language management ([bf841b9](https://github.com/madrus/tournado/commit/bf841b93c1aca090059a764e39305c93fd59edda))
- **test:** disable prefetching during tests to improve CI performance ([3fed1ec](https://github.com/madrus/tournado/commit/3fed1ec8efc312871bbfa4ad7e3aababf13c041c))
- **theme:** enhance theme management with cookie persistence and SSR support ([bd231e2](https://github.com/madrus/tournado/commit/bd231e221f8966b46c12f5221f3400d79e3be9ea))
- **tournament:** add comprehensive tests for tournament form state management ([db97faa](https://github.com/madrus/tournado/commit/db97faa759bf918161b0499381b10e3f6fccb628))
- update PRD for Tournado tournament management system with new features and enhancements ([ca1a3aa](https://github.com/madrus/tournado/commit/ca1a3aaec69bf4f034b2a7e662cc1cb2cb2aa3fd))
- update Product Requirements Document (PRD) for Tournado tournament management system ([8e09200](https://github.com/madrus/tournado/commit/8e09200a420cc32b9712b2135038392cd971a915))

### Bug Fixes

- improve error handling in ComboField and CustomDatePicker components ([28e6452](https://github.com/madrus/tournado/commit/28e6452a36d852505c638b4d6fb852a2d72282c3))
- **tests:** resolve form input issues in auth tests ([d8ae00c](https://github.com/madrus/tournado/commit/d8ae00ca25040b84d71afc9c7b24a9fb7dcb67d4))
- update footer attribution link for improved accessibility ([512b643](https://github.com/madrus/tournado/commit/512b64325a6c389cee378529dcf051bc42419b68))
- update initial header visibility state in useScrollDirection hook ([f08357b](https://github.com/madrus/tournado/commit/f08357b592e9b0d1819ef00d25d6cd022ad5be2d))

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
