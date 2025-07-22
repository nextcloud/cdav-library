<!--
  - SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->
# Changelog

All notable changes to this project will be documented in this file.

## v2.1.1 - 2025-07-22
### Fixed
- Update vulnerable dependencies

## v2.1.0 - 2025-05-30
### Added
- Send custom default headers with each request
### Fixed
- Send OPTIONS request to acquire advertised DAV features

## v2.0.0 - 2025-05-07
### Breaking changes
- Removed the ability to pass a custom `xhrProvider`
- Removed `beforeRequestHandler` and `afterRequestHandler` callbacks from the `Request` class
### Added
- Pass custom abort signals to instances of the `Request` class
- Use `@nextcloud/axios` for requests (instead of raw XHR code)
- Migrate testing code to vitest
### Fixed
- Serialize namespaced attributes consistently across browsers
- Update vulnerable dependencies

## v1.5.3 - 2025-03-22
### Fixed
- Update vulnerable dependencies

## v1.5.2 - 2024-10-14
### Fixed
- Update vulnerable dependencies

## v1.5.1 - 2024-07-17
### Fixed
- Fix serialization of schedule-calendar-transp property

## v1.5.0 - 2024-07-16
### Added
- Expose scheduling transparency property
### Changed
- Dependency updates

## v1.4.0 - 2024-06-10
### Added
- Find principal collections
- Ship an additional ESM bundle
### Changed
- Bundle with vite instead of webpack
- Dependency updates

## v1.3.0 - 2024-02-29
### Added
- Implement updating a principal's schedule-default-calendar-URL
### Changed
- Update node engines to next LTS (node 20 / npm 9)
- Dependency updates

## v1.2.0
### Changed
- Dependency updates
### Fixed
- Type annotations

## v1.1.0
### Changed
- Dependency updates
- Resource search against display name and email. Now only the email is searched.
