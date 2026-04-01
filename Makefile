.PHONY: check fix test lint lint-docs format build demo coverage coverage-report docs bench-print bench bench-update bench-check release

REGRESSION_THRESHOLD ?= 20

check: format lint lint-docs test

fix:
	npm run format:fix

format:
	npm run format

lint:
	npm run lint

lint-docs:
	npm run lint:docs

test:
	npm test

build:
	npm run build

coverage:
	npm run coverage

coverage-report:
	npm run coverage:report

docs:
	npm run docs

demo:
	bash docs/make-demo-gif.sh

bench-print:
	deno task bench

bench:
	deno task bench:update

bench-update: bench

# Runs all benchmarks and compares against benches/results.json.
# Exits non-zero if any benchmark regresses more than REGRESSION_THRESHOLD% (default: 20).
# Run 'make bench' once first to establish the baseline.
bench-check:
	REGRESSION_THRESHOLD=$(REGRESSION_THRESHOLD) deno task bench:check

# Lint, bump version, update changelog, commit, tag, push, publish to npm.
# CI then creates the GitHub release.
# Usage: make release          (defaults to patch)
#        make release LEVEL=minor|major
LEVEL ?= patch
release:
	@npm whoami 2>/dev/null || npm login
	$(MAKE) check
	$(MAKE) bench-check
	npm run test:release
	npm version $(LEVEL) --no-git-tag-version
	git-cliff --tag "v$$(node -p 'require("./package.json").version')" --output CHANGELOG.md
	git add package.json package-lock.json CHANGELOG.md
	git commit -m "Release $$(node -p 'require("./package.json").version')"
	git tag "v$$(node -p 'require("./package.json").version')"
	git push && git push --tags
	npm publish --access public
	$(MAKE) bench
