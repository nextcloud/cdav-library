# SPDX-FileCopyrightText: 2018 Nextcloud GmbH and Nextcloud contributors
# SPDX-License-Identifier: AGPL-3.0-or-later
all: dev-setup build-js-production

# Setup dev env
dev-setup: clean clean-dev npm-init

# Setup npm
npm-init:
	npm install

npm-update:
	npm update

# Build
build-js:
	npm run dev

build-js-production:
	npm run build

watch-js:
	npm run watch

# Linting
lint:
	npm run lint

lint-fix:
	npm run lint:fix

# Cleanup
clean:
	rm -f dist/dist.js
	rm -f dist/dist.js.map

clean-dev:
	rm -rf node_modules
