# Changelog

## [1.2.8] - 2026-04-21
[`v1.2.7...v1.2.8`](https://github.com/izelnakri/qunitx-cli/compare/v1.2.7...v1.2.8)

### Bug Fixes
- Replace .bin/ shims with cross-platform invocations — 2026-04-21 by Izel Nakri ([`5e2f450`](https://github.com/izelnakri/qunitx-cli/commit/5e2f4500c2d2ec6fa5182aebb66e03722cbfea18))
- Use native path resolution for helper in timeout-test — 2026-04-21 by Izel Nakri ([`56743e3`](https://github.com/izelnakri/qunitx-cli/commit/56743e3f2c0523605f47278d7d5fc92aafa81456))

### Features
- Improve assertion failure messages, diffs, and stack traces — 2026-04-21 by Izel Nakri ([`56f8fb0`](https://github.com/izelnakri/qunitx-cli/commit/56f8fb02ae4423a8953a8ba8c62be2ed2fe5bf1e))

## [1.2.7] - 2026-04-14
[`v1.2.6...v1.2.7`](https://github.com/izelnakri/qunitx-cli/compare/v1.2.6...v1.2.7)

### Features
- Detect async fn in assert.throws, export Node types, fix Deno docs — 2026-04-14 by Izel Nakri ([`e329f62`](https://github.com/izelnakri/qunitx-cli/commit/e329f6242808f46732888f9f9134ba528411d235))

## [1.2.6] - 2026-04-14
[`v1.2.5...v1.2.6`](https://github.com/izelnakri/qunitx-cli/compare/v1.2.5...v1.2.6)

### Features
- Add module.todo() across all three runtimes — 2026-04-14 by Izel Nakri ([`df577c8`](https://github.com/izelnakri/qunitx-cli/commit/df577c8527329f842197247a6cb913a0daea2ab5))
- Enforce assert.timeout(ms) on Node and Deno — 2026-04-14 by Izel Nakri ([`f25928e`](https://github.com/izelnakri/qunitx-cli/commit/f25928e196c1d41899991320f9c0df83b1d9a7f1))

## [1.2.5] - 2026-04-14
[`v1.2.4...v1.2.5`](https://github.com/izelnakri/qunitx-cli/compare/v1.2.4...v1.2.5)

### Documentation
- Clarify no-config usage and make qunitx-cli docs link prominent — 2026-04-14 by Izel Nakri ([`c14c71a`](https://github.com/izelnakri/qunitx-cli/commit/c14c71a785bc426ab27e17692cd8b483ce8d7182))
- Update demo.gif — 2026-04-14 by Izel Nakri ([`bff79e8`](https://github.com/izelnakri/qunitx-cli/commit/bff79e803513d0dfbedaf6d055a28c2c2c965e16))

### Features
- Add context parameter to module/test/hook callbacks for arrow-function support — 2026-04-14 by Izel Nakri ([`4721320`](https://github.com/izelnakri/qunitx-cli/commit/472132094016c519a3bc9c26a4020985e7dc109a))

## [1.2.4] - 2026-04-14
[`v1.2.3...v1.2.4`](https://github.com/izelnakri/qunitx-cli/compare/v1.2.3...v1.2.4)

### Features
- Todo feature and `make release` improvements — 2026-04-14 by Izel Nakri ([`9b64e74`](https://github.com/izelnakri/qunitx-cli/commit/9b64e74bc21681040a2a8e1750ef712e966f9853))

## [1.2.3] - 2026-04-14
[`v1.2.2...v1.2.3`](https://github.com/izelnakri/qunitx-cli/compare/v1.2.2...v1.2.3)

### Features
- Add todo support and stop tracking benches/results.json — 2026-04-14 by Izel Nakri ([`6c7167e`](https://github.com/izelnakri/qunitx-cli/commit/6c7167e7d4f61be76756c18d3280a32ce76a4593))

## [1.2.2] - 2026-04-14
[`v1.2.1...v1.2.2`](https://github.com/izelnakri/qunitx-cli/compare/v1.2.1...v1.2.2)

### Features
- Add skip support for module() and test() across all runtimes — 2026-04-14 by Izel Nakri ([`4aea520`](https://github.com/izelnakri/qunitx-cli/commit/4aea5206594e23ef9815b0b92ec0dc75307d8ce5))

## [1.2.0] - 2026-04-03
[`v1.1.6...v1.2.0`](https://github.com/izelnakri/qunitx-cli/compare/v1.1.6...v1.2.0)

### Refactoring
- Build.ts and build process refactors — 2026-04-02 by Izel Nakri ([`4e60bc9`](https://github.com/izelnakri/qunitx-cli/commit/4e60bc966c22228809715ca7668bfc2c21ac278d))
- Replace auto-generated vendor-types with minimal hand-written stubs — 2026-04-02 by Izel Nakri ([`96c20d4`](https://github.com/izelnakri/qunitx-cli/commit/96c20d45ae4f344ed8e8ef746b863cfac51fe7f7))

## [1.1.6] - 2026-04-01
[`v1.1.5...v1.1.6`](https://github.com/izelnakri/qunitx-cli/compare/v1.1.5...v1.1.6)

### Features
- Now release/packed package is tested properly as user! — 2026-04-01 by Izel Nakri ([`d49e380`](https://github.com/izelnakri/qunitx-cli/commit/d49e380a5be16a8a08bac06539b71fff56c5c0da))

## [1.1.5] - 2026-03-30
[`v1.1.4...v1.1.5`](https://github.com/izelnakri/qunitx-cli/compare/v1.1.4...v1.1.5)

### Bug Fixes
- Deno release type imports from npm — 2026-03-30 by Izel Nakri ([`70c02c5`](https://github.com/izelnakri/qunitx-cli/commit/70c02c5b9ca89c6eca53e4885bdbf70b99c7a9a3))

## [1.1.3] - 2026-03-30
[`v1.1.2...v1.1.3`](https://github.com/izelnakri/qunitx-cli/compare/v1.1.2...v1.1.3)

### Bug Fixes
- More reliable JS/TS dist imports for deno/node/browser — 2026-03-30 by Izel Nakri ([`695e2ce`](https://github.com/izelnakri/qunitx-cli/commit/695e2ce2aa5b9221f1e83aa751245d5b5dc514cd))

## [1.1.2] - 2026-03-30
[`v1.1.1...v1.1.2`](https://github.com/izelnakri/qunitx-cli/compare/v1.1.1...v1.1.2)

### Bug Fixes
- Export "qunitx/assert" in the package — 2026-03-30 by Izel Nakri ([`e2f6a3f`](https://github.com/izelnakri/qunitx-cli/commit/e2f6a3f85ac60ba79a901e4532ee9ddd4f1df080))

## [1.1.1] - 2026-03-30
[`v1.1.0...v1.1.1`](https://github.com/izelnakri/qunitx-cli/compare/v1.1.0...v1.1.1)

### Bug Fixes
- Fix ./dist ts/js import references for build.ts — 2026-03-30 by Izel Nakri ([`4e8e479`](https://github.com/izelnakri/qunitx-cli/commit/4e8e479907d839bd0e4c8870ef6eb49101db4871))

## [1.1.0] - 2026-03-29
[`v1.0.4...v1.1.0`](https://github.com/izelnakri/qunitx-cli/compare/v1.0.4...v1.1.0)

### Bug Fixes
- Make release bench type warnings — 2026-03-29 by Izel Nakri ([`31716d9`](https://github.com/izelnakri/qunitx-cli/commit/31716d94be46cfb656f20f3e3cb8ad1117fcc3a7))

### Features
- Moved the project to TypeScript — 2026-03-29 by Izel Nakri ([`8dd0ef9`](https://github.com/izelnakri/qunitx-cli/commit/8dd0ef9daccc7c6737716434ff04edc8b854fab2))

## [1.0.4] - 2026-03-26
[`v1.0.3...v1.0.4`](https://github.com/izelnakri/qunitx-cli/compare/v1.0.3...v1.0.4)

### Features
- Module hooks 1-1 compatible browser,node,deno! — 2026-03-26 by Izel Nakri ([`5a00250`](https://github.com/izelnakri/qunitx-cli/commit/5a002501ee671a73a59e31f6259fdcabaa3b8e4c))

## [1.0.3] - 2026-03-19
[`v1.0.2...v1.0.3`](https://github.com/izelnakri/qunitx-cli/compare/v1.0.2...v1.0.3)

### Performance
- Improve deno performance & ignore bench code when necessary — 2026-03-19 by Izel Nakri ([`343dc2e`](https://github.com/izelnakri/qunitx-cli/commit/343dc2e89b7ca7fa5339e97fb2b43b60b45acab2))

## [1.0.2] - 2026-03-19
[`v1.0.1...v1.0.2`](https://github.com/izelnakri/qunitx-cli/compare/v1.0.1...v1.0.2)

### Performance
- Add benchmark system and optimizations — 2026-03-19 by Izel Nakri ([`a1e5831`](https://github.com/izelnakri/qunitx-cli/commit/a1e583139368ea9011861563389b201e61b6a5a5))

## [1.0.1] - 2026-03-17
[`v1.0.0...v1.0.1`](https://github.com/izelnakri/qunitx-cli/compare/v1.0.0...v1.0.1)

### Bug Fixes
- All the LLM found bugfixes! — 2026-03-17 by Izel Nakri ([`97430f3`](https://github.com/izelnakri/qunitx-cli/commit/97430f3421f529dc8d2f9bcfb88c2a5404cc1cb4))

## [0.12.5] - 2026-03-15
[`v0.12.4...v0.12.5`](https://github.com/izelnakri/qunitx-cli/compare/v0.12.4...v0.12.5)

### Documentation
- Add more docs — 2026-03-15 by Izel Nakri ([`8fce958`](https://github.com/izelnakri/qunitx-cli/commit/8fce95839b2a2170b58c3d9752a2743eccbf20d2))

## [0.12.3] - 2026-03-15
[`v0.12.2...v0.12.3`](https://github.com/izelnakri/qunitx-cli/compare/v0.12.2...v0.12.3)

### Documentation
- Improve demo — 2026-03-14 by Izel Nakri ([`4033b7b`](https://github.com/izelnakri/qunitx-cli/commit/4033b7b20f3ade5a4ed817abb0d64e2f2e096180))

## [0.12.1] - 2026-03-14
[`v0.12.0...v0.12.1`](https://github.com/izelnakri/qunitx-cli/compare/v0.12.0...v0.12.1)

### Features
- Improve CHANGELOG.md generation — 2026-03-10 by Izel Nakri ([`93eea8a`](https://github.com/izelnakri/qunitx-cli/commit/93eea8ab8cca3ee6ec921c4e81f78eef5061bd77))
- Update qunitx shims & docs & demo — 2026-03-14 by Izel Nakri ([`bd49039`](https://github.com/izelnakri/qunitx-cli/commit/bd490396b2cd4ebbd9346f41f9ffb56e1af4a62b))

## [0.10.0] - 2026-03-10

### Bug Fixes
- DynamicHTML js change not cached by staticsrv — 2021-04-25 by Izel Nakri ([`744a05e`](https://github.com/izelnakri/qunitx-cli/commit/744a05e85a5c93ab5397fc0f56fbb0cb1918a5ce))

### Features
- MAJOR updates of packages, CI to qunitx — 2026-03-10 by Izel Nakri ([`3972c12`](https://github.com/izelnakri/qunitx-cli/commit/3972c12056286e71537850eb47ea5d9152ac8df3))


