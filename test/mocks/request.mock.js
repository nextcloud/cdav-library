/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { vi } from "vitest";

const Request = vi.fn().mockImplementation(function() {
	this.propFind = vi.fn();
	this.put = vi.fn();
	this.post = vi.fn();
	this.delete = vi.fn();
	this.move = vi.fn();
	this.copy = vi.fn();
	this.report = vi.fn();
	this.pathname = vi.fn();
	this.propPatch = vi.fn();
	this.mkCol = vi.fn();
});

export default Request
