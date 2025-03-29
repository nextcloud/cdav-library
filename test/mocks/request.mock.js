/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { vi } from "vitest";

const Request = vi.fn()

Request.prototype.propFind = vi.fn();
Request.prototype.put = vi.fn();
Request.prototype.post = vi.fn();
Request.prototype.delete = vi.fn();
Request.prototype.move = vi.fn();
Request.prototype.copy = vi.fn();
Request.prototype.report = vi.fn();
Request.prototype.pathname = vi.fn();
Request.prototype.propPatch = vi.fn();
Request.prototype.mkCol = vi.fn();

export default Request
