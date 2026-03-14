.PHONY: check test lint build release

check: lint test

lint:
	npm run lint

test:
	npm test

build:
	npm run build

# Lint, bump version, update changelog, commit, tag, push, publish to npm.
# CI then creates the GitHub release.
# Usage: make release          (defaults to patch)
#        make release LEVEL=minor|major
LEVEL ?= patch
release:
	@npm whoami 2>/dev/null || npm login
	npm run lint
	npm version $(LEVEL) --no-git-tag-version
	npm run changelog:update
	git add package.json package-lock.json CHANGELOG.md
	git commit -m "Release $$(node -p 'require("./package.json").version')"
	git tag "v$$(node -p 'require("./package.json").version')"
	git push && git push --tags
	npm publish --access public
