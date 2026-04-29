.PHONY: check check-release fix test lint lint-docs format build demo coverage coverage-report docs bench-print bench bench-update bench-check release

REGRESSION_THRESHOLD ?= 26

check: format lint lint-docs test

check-release: check
	npm run test:release

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
# Each bench file runs in its own subprocess (per-file isolation), with adaptive
# retry up to 3 attempts for any file that regresses; the per-bench min wins.
# Sub-millisecond benches are observation-only — they only fail at a 10× hard
# ceiling, since commodity-hardware noise produces 100–300% swings in that
# regime that no fixed threshold can absorb. Run 'make bench' once first to
# establish the baseline.
#
# Set SKIP_BENCHMARK=true to skip the gate entirely (useful when laptop load
# makes benches falsely regress). SKIP_BENCHMARK=<file>[,<file>...] skips
# individual bench files by basename — e.g. SKIP_BENCHMARK=utils,assert.
bench-check:
	@if echo "$(SKIP_BENCHMARK)" | grep -qiE '^(true|1|all)$$'; then \
		echo "SKIP_BENCHMARK=$(SKIP_BENCHMARK) → skipping bench-check"; \
	else \
		echo "Running benchmark regression check (silent until done, ~30s)..."; \
		REGRESSION_THRESHOLD=$(REGRESSION_THRESHOLD) SKIP_BENCHMARK="$(SKIP_BENCHMARK)" deno task bench:check; \
	fi

# Lint, bump version, update changelog, commit, tag, push, publish to npm.
# Usage: make release          (defaults to patch)
#        make release LEVEL=minor|major
LEVEL ?= patch
release:
	@set -e; \
	if [ -n "$$(git status --porcelain)" ]; then \
		echo "WARNING: Uncommitted changes detected — these will NOT be included in the release:"; \
		git status --short; \
		echo ""; \
	fi; \
	eval $$(ssh-agent -s); trap "ssh-agent -k > /dev/null" EXIT; \
	ssh-add; \
	npm whoami > /dev/null 2>&1 || npm login; \
	echo "npm user: $$(npm whoami) | $$(date '+%Y-%m-%d %H:%M:%S %Z')"; \
	$(MAKE) format; $(MAKE) lint; $(MAKE) lint-docs; \
	$(MAKE) bench-check; \
	$(MAKE) test; \
	npm run test:release; \
	npm version $(LEVEL) --no-git-tag-version; \
	git-cliff --tag "v$$(node -p 'require("./package.json").version')" --output CHANGELOG.md; \
	git add package.json package-lock.json CHANGELOG.md; \
	git commit -m "Release $$(node -p 'require("./package.json").version')"; \
	git tag "v$$(node -p 'require("./package.json").version')"; \
	git push; git push --tags; \
	npm publish --access public; \
	$(MAKE) bench
