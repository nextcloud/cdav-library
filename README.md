<!--
  - SPDX-FileCopyrightText: 2018 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->
# cdav-library

[![REUSE status](https://api.reuse.software/badge/github.com/nextcloud/cdav-library)](https://api.reuse.software/info/github.com/nextcloud/cdav-library)
[![NPM Version](https://img.shields.io/npm/v/%40nextcloud%2Fcdav-library)](https://www.npmjs.com/package/@nextcloud/cdav-library)

:date: 📇 CalDAV and CardDAV client library for JavaScript

## Build the library

``` bash
# install dependencies
npm install

# build for dev and watch changes
npm run watch

# build for dev
npm run dev

# build for production with minification
npm run build

```
## TypeScript definitions

`npm run build` generates `dist/index.d.ts` for ES modules and
`dist/index.d.cts` for CommonJS. Development and watch builds also generate
these files. They are included in the npm package and resolved automatically:

```typescript
import DavClient from '@nextcloud/cdav-library'

const client = new DavClient({ rootUrl: 'https://example.com/remote.php/dav/' })
await client.connect({ enableCalDAV: true, enableCardDAV: true })
```

Definitions are generated from the JavaScript and JSDoc using the existing Vite
build. Update the JSDoc when changing the API; do not edit generated files in
`dist`. Dynamically exposed model properties need a JSDoc-annotated `this.property`
reference before they are installed in the constructor. Some legacy APIs still
use broad types where their JSDoc does not provide more detail.

Run `npm run test:types` to build and check strict TypeScript consumers with
NodeNext (ES modules and CommonJS) and bundler module resolution. To check an
existing build, use `npm run check:types`.

## Running tests
You can use the provided npm command to run all tests by using:

```
npm run test
```

## :v: Code of conduct

The Nextcloud community has core values that are shared between all members during conferences,
hackweeks and on all interactions in online platforms including [Github](https://github.com/nextcloud) and [Forums](https://help.nextcloud.com).
If you contribute, participate or interact with this community, please respect [our shared values](https://nextcloud.com/code-of-conduct/). :relieved:

## :heart: How to create a pull request

This guide will help you get started: 
- :dancer: :smile: [Opening a pull request](https://opensource.guide/how-to-contribute/#opening-a-pull-request) 
