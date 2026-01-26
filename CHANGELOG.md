# Changelog

## [0.2.2](https://github.com/koki-develop/politely/compare/v0.2.1...v0.2.2) (2026-01-26)


### Bug Fixes

* clarify role description in politeness conversion prompts ([93bb5f2](https://github.com/koki-develop/politely/commit/93bb5f28456217c1f4ab8960e538bf8f8294e447))

## [0.2.1](https://github.com/koki-develop/politely/compare/v0.2.0...v0.2.1) (2026-01-26)


### Bug Fixes

* change default transcription model to gpt-4o-transcribe ([d869b35](https://github.com/koki-develop/politely/commit/d869b3540cac94e6a8b9cf27c9d62b05b0569ba0))

## [0.2.0](https://github.com/koki-develop/politely/compare/v0.1.2...v0.2.0) (2026-01-25)


### Features

* add converting state to display raw text during polite conversion ([9072f47](https://github.com/koki-develop/politely/commit/9072f471b55e3a74145a13075614b44cb7b64445))
* add gpt-4o-transcribe and gpt-4o-mini-transcribe models ([4e091c8](https://github.com/koki-develop/politely/commit/4e091c8648f37136a57da0774753c904f56bdc5e))
* add launch at login setting ([7975666](https://github.com/koki-develop/politely/commit/7975666712a410d9ebc5141e7fb250c013efaf30))

## [0.1.2](https://github.com/koki-develop/politely/compare/v0.1.1...v0.1.2) (2026-01-24)


### Bug Fixes

* increase settings window height to 600px ([13e7361](https://github.com/koki-develop/politely/commit/13e7361b5084f3d3773b51956c258da3e1f113e2))

## [0.1.1](https://github.com/koki-develop/politely/compare/v0.1.0...v0.1.1) (2026-01-24)


### Bug Fixes

* update package description to better reflect app purpose ([6d46a26](https://github.com/koki-develop/politely/commit/6d46a26a2b71038e9041fcc56c3cc5797746d06d))

## [0.1.0](https://github.com/koki-develop/politely/compare/v0.0.7...v0.1.0) (2026-01-24)


### Features

* add dock icon visibility setting ([#10](https://github.com/koki-develop/politely/issues/10)) ([0ee6c15](https://github.com/koki-develop/politely/commit/0ee6c15df5109a06e7efc8b781710f90400c799e))
* add dynamic tray menu with state-aware recording controls ([#12](https://github.com/koki-develop/politely/issues/12)) ([9d893d7](https://github.com/koki-develop/politely/commit/9d893d7c4a091711b4a78cd7372d2142b1b63b2a))
* add preparing state for responsive UI during recording initialization ([a1511f4](https://github.com/koki-develop/politely/commit/a1511f434f01600739881ae45f0452c0dc653b13))
* display version in tray menu title ([bbe06da](https://github.com/koki-develop/politely/commit/bbe06daac751963598e4075b02283e9204108784))


### Bug Fixes

* correct polite text field name and update prompt instructions ([d6b951c](https://github.com/koki-develop/politely/commit/d6b951c6d86cd6f9542e90be7b2de93fb5039319))
* eliminate window resize delay by moving size logic to Main Process ([3bf304d](https://github.com/koki-develop/politely/commit/3bf304d41a8a0ca8e663bdc13fec6cbef0391b8d))
* improve transcribing overlay design with spinner ring animation ([#11](https://github.com/koki-develop/politely/issues/11)) ([e9a0b12](https://github.com/koki-develop/politely/commit/e9a0b12474c8ce050ec942a62816ae567841ea2e))
* remove destroyTray to preserve tray icon position on macOS ([2e18eb5](https://github.com/koki-develop/politely/commit/2e18eb5406a011699107984307f6a20364e8d878))
* simplify tray tooltip text ([083dc88](https://github.com/koki-develop/politely/commit/083dc88e787f26eb19454b2a02a98588c103cd5f))
* suppress error display when user cancels transcription ([#9](https://github.com/koki-develop/politely/issues/9)) ([6cbd47a](https://github.com/koki-develop/politely/commit/6cbd47a6070aaf266f05052a7dc4f992294dba69))
* trim transcription text before empty check ([5872c5c](https://github.com/koki-develop/politely/commit/5872c5cf9c3eaf101a0d5c3d9e8c9dd718b0b7f6))

## [0.0.7](https://github.com/koki-develop/politely/compare/v0.0.6...v0.0.7) (2026-01-24)


### Bug Fixes

* disable cookie encryption to prevent keychain access prompt ([6144f95](https://github.com/koki-develop/politely/commit/6144f955cd35746a89263affd29bff1d916a256a))

## [0.0.6](https://github.com/koki-develop/politely/compare/v0.0.5...v0.0.6) (2026-01-24)


### Bug Fixes

* resolve koffi native module not found error in packaged app ([93faffa](https://github.com/koki-develop/politely/commit/93faffa4678f70af94fb4d4ce184898896ee5c75))

## [0.0.5](https://github.com/koki-develop/politely/compare/v0.0.4...v0.0.5) (2026-01-24)


### Bug Fixes

* use release tag for Homebrew cask version in release workflow ([b1f99df](https://github.com/koki-develop/politely/commit/b1f99df88cf1fe4fe7e9e026914554189c070530))

## [0.0.4](https://github.com/koki-develop/politely/compare/v0.0.3...v0.0.4) (2026-01-24)


### Features

* Release v0.0.4 ([d2c0ea4](https://github.com/koki-develop/politely/commit/d2c0ea43ca68b325a70b9ac7d83f9d528e0dec43))


### Bug Fixes

* remove unnecessary active app tracking from paste service ([ce5df08](https://github.com/koki-develop/politely/commit/ce5df089a6cdd9f93e1ae6c813045787c37bd521))
* replace AppleScript paste with koffi + Core Graphics API ([d291e8d](https://github.com/koki-develop/politely/commit/d291e8d3575662fee9ec3632d432d4cf2269a940))

## [0.0.3](https://github.com/koki-develop/politely/compare/v0.0.2...v0.0.3) (2026-01-23)


### Bug Fixes

* update zod dependency to 4.3.6 ([0d80c69](https://github.com/koki-develop/politely/commit/0d80c6972b0e1574ccb86aa3ac7caa706fa0e4d0))

## [0.0.2](https://github.com/koki-develop/politely/compare/v0.0.1...v0.0.2) (2026-01-23)


### Features

* Release v0.0.2 ([783b486](https://github.com/koki-develop/politely/commit/783b486033415597c458ef1a7fbbfcbbd3a33553))

## 0.0.1 (2026-01-23)


### Features

* add accessibility permission step to onboarding wizard ([3ed4d8f](https://github.com/koki-develop/politely/commit/3ed4d8fbaa1cd3e537283fd14e2871bc0e65981c))
* add app icon for Electron Forge packaging ([a9cb749](https://github.com/koki-develop/politely/commit/a9cb749525c98e763c38b6aaed886007f4719c95))
* Add cancel button to recording/transcribing states with shortcut display ([15860bf](https://github.com/koki-develop/politely/commit/15860bfe4d923ab5963a16072ce3442a175efa16))
* Add customizable global shortcut in settings ([e465e50](https://github.com/koki-develop/politely/commit/e465e50a5b029c2291a7c9766954465aaa7882a0))
* Add global hotkey voice input with cursor paste ([4d1be59](https://github.com/koki-develop/politely/commit/4d1be59c3efacdb10f42c058a7be07c1163aeb99))
* add high-resolution tray icon asset ([69497fc](https://github.com/koki-develop/politely/commit/69497fc5ed0a1435ee87ed6651aef42cea97bc87))
* Add Hono server with health check API ([29dc4e8](https://github.com/koki-develop/politely/commit/29dc4e8846840e5735c97ae79e7e5d203fd87e12))
* add microphone permission step to onboarding wizard ([9f361af](https://github.com/koki-develop/politely/commit/9f361af8dd629424f8750c75f48fc80880ea1c28))
* add onboarding wizard for initial app setup ([e57d9cb](https://github.com/koki-develop/politely/commit/e57d9cbe13ea6aeeef3af1e30dafa935da07f6d3))
* Add OpenAI API key configuration to settings screen ([a461837](https://github.com/koki-develop/politely/commit/a461837fa00ef993ab0962469b49d79562488251))
* Add permission checks for microphone and accessibility ([0e9ee59](https://github.com/koki-develop/politely/commit/0e9ee598bc41e8043b25badbe21fdbceec6cd28c))
* Add polite language conversion using OpenAI gpt-4o-mini ([092c168](https://github.com/koki-develop/politely/commit/092c16801524e7f7735169f939d07f4cd9618c5f))
* add politeness level setting for text conversion ([96caba4](https://github.com/koki-develop/politely/commit/96caba4d78a6d7d50ca1ab5540eb44cef3c5623f))
* add politeness level step to onboarding wizard ([f611296](https://github.com/koki-develop/politely/commit/f6112966fbe585b66ea06d8f83dfd93949a960cf))
* Add React with React Compiler support ([aae23de](https://github.com/koki-develop/politely/commit/aae23de9ddde4dc4cac01667845101455b93c800))
* Add setting to control floating window visibility when idle ([2f58f4d](https://github.com/koki-develop/politely/commit/2f58f4d9d00b9d0a10858dd447256c4dcac9d018))
* Add settings screen for OpenAI model selection ([e3e36ca](https://github.com/koki-develop/politely/commit/e3e36ca8190700ef5999a61f8112364c377be9f7))
* Add Tailwind CSS v4 via Vite plugin ([03c529f](https://github.com/koki-develop/politely/commit/03c529f9ed764c7504992f7129ae373aabb8c940))
* Add token authentication for localhost HTTP server ([db61ea0](https://github.com/koki-develop/politely/commit/db61ea09b9982d9880398edcc1c2ed41ffc24105))
* Add voice input with Whisper transcription ([1ad4109](https://github.com/koki-develop/politely/commit/1ad4109362ba1dc109d7fbea8d3d10f95d041629))
* Disable global shortcut while capturing new shortcut in settings ([99850e3](https://github.com/koki-develop/politely/commit/99850e3b337d4e036ba9bafe145698718a155b52))
* Highlight unconfigured settings sections with amber color ([57f1404](https://github.com/koki-develop/politely/commit/57f1404260cf7ea48348af1a58e06d8ef310a0eb))
* Improve error window appearance with centered position ([5df403a](https://github.com/koki-develop/politely/commit/5df403a38386ee0bbd2dd8dc4398bcb676db6087))
* Keep floating window visible on transcription error ([c5ecffd](https://github.com/koki-develop/politely/commit/c5ecffdc37f5a240faa495d4a7b1459cf97ebd47))
* Keep focus on previous app during recording ([67400f8](https://github.com/koki-develop/politely/commit/67400f8221abfe972e2deff003f7a4452a32eb32))
* Localize settings screen labels to Japanese ([baeca94](https://github.com/koki-develop/politely/commit/baeca941dfdc80cff2aa9f3f9a7d16fe7c25305d))
* Redesign floating window with minimal pill-shaped UI ([b3a2afd](https://github.com/koki-develop/politely/commit/b3a2afd7e13dd0492b87db025f5454772362b657))
* Release v0.0.1 ([c7fce24](https://github.com/koki-develop/politely/commit/c7fce24b598fa36062ac17049dd55ce8f9a33b87))
* request permission before opening settings on settings page ([356e0b3](https://github.com/koki-develop/politely/commit/356e0b39cb30d5d085b225abc9c824d4b8de8764))


### Bug Fixes

* add proper error handling to settings change handlers ([27fe1c3](https://github.com/koki-develop/politely/commit/27fe1c35a08cf48a9c574aebe2da62d6dd797d9a))
* Display floating window over fullscreen apps on macOS ([7dd08d6](https://github.com/koki-develop/politely/commit/7dd08d6e05eb2f91fdc19cd81883dc89a756e7a2))
* Enable strict TypeScript and sanitize AppleScript input ([b518336](https://github.com/koki-develop/politely/commit/b51833616551514593aadaa38c5e972bbeec28e6))
* Include assets in packaged app for tray icon loading ([a6c094e](https://github.com/koki-develop/politely/commit/a6c094eac4bf644757be585139f3ab9ef2a81171))
* Prevent white flash when opening settings window ([7f57cee](https://github.com/koki-develop/politely/commit/7f57cee0c553950a688a6c79cc33f2ac03af8927))
* Remove fade-in animation to prevent window flash on state transitions ([06e9b4c](https://github.com/koki-develop/politely/commit/06e9b4ced5c65702d1ebebb0158ea9f46db0f871))
* unify settings window and page titles to "Settings" ([98f0ed7](https://github.com/koki-develop/politely/commit/98f0ed7b8a9e8dd3eb47ee7e3b81f0b6429e607c))
* Update tsconfig moduleResolution to bundler and fix window-all-closed handler ([7b2aa8b](https://github.com/koki-develop/politely/commit/7b2aa8bbec087211cb8a391fc110d752a1648bbe))


### Performance Improvements

* Reduce recording start latency with pre-warming optimizations ([f3ddb3b](https://github.com/koki-develop/politely/commit/f3ddb3b438b299f88eb29c3e687f540807d81ac2))
