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
# Usage: make release LEVEL=patch|minor|major
release:
	@test -n "$(LEVEL)" || (echo "Usage: make release LEVEL=patch|minor|major" && exit 1)
	npm run lint
	npm version $(LEVEL) --no-git-tag-version
	npm run changelog:update
	git add package.json package-lock.json CHANGELOG.md
	git commit -m "Release $$(node -p 'require("./package.json").version')"
	git tag "v$$(node -p 'require("./package.json").version')"
	git push && git push --tags
	npm publish --access public
