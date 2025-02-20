/**
 * CDAV Library
 *
 * This library is part of the Nextcloud project
 *
 * SPDX-FileCopyrightText: 2018 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { afterEach, describe, expect, it, vi } from "vitest";

import { debugFactory } from '../../src/debug.js';

describe('Debug', () => {

	afterEach(() => {
		debugFactory.enabled = false;
	});

	it ('should provide a factory for a debugger', () => {
		expect(debugFactory).toEqual(expect.any(Function));
		expect(debugFactory('foo')).toEqual(expect.any(Function));
	});

	it ('should log console messages including their context if debug is enabled', () => {
		vi.spyOn(window.console, 'debug').mockImplementation(() => {});

		debugFactory.enabled = true;

		const debug = debugFactory('foo');

		debug(123);
		expect(window.console.debug).toHaveBeenCalledWith('foo', 123);

		debug(123, 456);
		expect(window.console.debug).toHaveBeenCalledWith('foo', 123, 456);
	});

	it ('should not log console messages if debug is disabled', () => {
		vi.spyOn(window.console, 'debug').mockImplementation(() => {});

		debugFactory.enabled = false;

		const debug = debugFactory('foo');
		debug(123);

		expect(window.console.debug).not.toHaveBeenCalledWith('foo', 123);
	});

});
