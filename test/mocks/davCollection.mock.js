/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { vi } from "vitest";

const DavCollection = vi.fn()

DavCollection.prototype.findAll = vi.fn();
DavCollection.prototype.findAllByFilter = vi.fn();
DavCollection.prototype.find = vi.fn();
DavCollection.prototype.createCollection = vi.fn();
DavCollection.prototype.createObject = vi.fn();
DavCollection.prototype.update = vi.fn();
DavCollection.prototype.delete = vi.fn();
DavCollection.prototype.isReadable = vi.fn();
DavCollection.prototype.isWriteable = vi.fn();
DavCollection.prototype.isSameCollectionTypeAs = vi.fn();

export { DavCollection };
