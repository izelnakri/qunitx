.PHONY: check fix test lint lint-docs format build demo coverage coverage-report docs release

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

# Lint, bump version, update changelog, commit, tag, push, publish to npm.
# CI then creates the GitHub release.
# Usage: make release          (defaults to patch)
#        make release LEVEL=minor|major
LEVEL ?= patch
release:
	@npm whoami 2>/dev/null || npm login
	$(MAKE) check
	npm version $(LEVEL) --no-git-tag-version
	git-cliff --tag "v$$(node -p 'require("./package.json").version')" --output CHANGELOG.md
	git add package.json package-lock.json CHANGELOG.md
	git commit -m "Release $$(node -p 'require("./package.json").version')"
	git tag "v$$(node -p 'require("./package.json").version')"
	git push && git push --tags
	npm publish --access public
