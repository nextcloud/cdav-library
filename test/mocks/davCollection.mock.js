/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { vi } from "vitest";

const DavCollection = vi.fn().mockImplementation(function() {
	this.findAll = vi.fn();
	this.findAllByFilter = vi.fn();
	this.find = vi.fn();
	this.createCollection = vi.fn();
	this.createObject = vi.fn();
	this.update = vi.fn();
	this.delete = vi.fn();
	this.isReadable = vi.fn();
	this.isWriteable = vi.fn();
	this.isSameCollectionTypeAs = vi.fn();
});

export { DavCollection };
