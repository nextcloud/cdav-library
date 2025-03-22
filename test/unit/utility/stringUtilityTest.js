/**
 * CDAV Library
 *
 * This library is part of the Nextcloud project
 *
 * SPDX-FileCopyrightText: 2018 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { describe, expect, it, vi } from "vitest";

import * as StringUtility from '../../../src/utility/stringUtility.js';

describe('StringUtility', () => {
	it('should return a unique identifier', function () {
		const uid = StringUtility.uid();

		expect(uid).toEqual(expect.any(String));
		expect(uid).toEqual(uid.toUpperCase());
	});

	it('should return a unique identifier with a prefix and/or a suffix', function () {
		const uid1 = StringUtility.uid('foobar');

		expect(uid1).toEqual(expect.any(String));
		expect(uid1.startsWith('foobar-')).toEqual(true);

		const uid2 = StringUtility.uid(null, 'ics');

		expect(uid2).toEqual(expect.any(String));
		expect(uid2.endsWith('.ics')).toEqual(true);

		const uid3 = StringUtility.uid('foobar', 'ics');

		expect(uid3).toEqual(expect.any(String));
		expect(uid3.startsWith('foobar-')).toEqual(true);
		expect(uid3.endsWith('.ics')).toEqual(true);
	});

	it('should return the uri if it\'s available', function() {
		const isAvailable = vi.fn(() => true);
		const uri = StringUtility.uri('abc', isAvailable);

		expect(uri).toEqual('abc');
		expect(isAvailable).toHaveBeenCalledWith('abc');
		expect(isAvailable.mock.calls.length).toEqual(1);
	});

	it('should not return an empty uri', function() {
		const isAvailable = vi.fn(() => true);
		const uri = StringUtility.uri('', isAvailable);

		expect(uri).toEqual('-');
		expect(isAvailable).toHaveBeenCalledWith('-');
		expect(isAvailable.mock.calls.length).toEqual(1);
	});

	it('should be able to append -1 to the name', function() {
		const isAvailable = vi.fn().mockReturnValueOnce(false).mockReturnValueOnce(true);
		const uri = StringUtility.uri('abc', isAvailable);

		expect(uri).toEqual('abc-1');
		expect(isAvailable.mock.calls[0]).toEqual(['abc']);
		expect(isAvailable.mock.calls[1]).toEqual(['abc-1']);
		expect(isAvailable.mock.calls.length).toEqual(2);
	});

	it('should be able to append 1 to the name if name contains - at the end', function() {
		const isAvailable = vi.fn().mockReturnValueOnce(false).mockReturnValueOnce(true);
		const uri = StringUtility.uri('abc-', isAvailable);

		expect(uri).toEqual('abc-1');
		expect(isAvailable.mock.calls[0]).toEqual(['abc']);
		expect(isAvailable.mock.calls[1]).toEqual(['abc-1']);
		expect(isAvailable.mock.calls.length).toEqual(2);
	});

	it('should be able to append 1 to the name if name contains - in the middle', function() {
		const isAvailable = vi.fn().mockReturnValueOnce(false).mockReturnValueOnce(true);
		const uri = StringUtility.uri('a-bc', isAvailable);

		expect(uri).toEqual('a-bc-1');
		expect(isAvailable.mock.calls[0]).toEqual(['a-bc']);
		expect(isAvailable.mock.calls[1]).toEqual(['a-bc-1']);
		expect(isAvailable.mock.calls.length).toEqual(2);
	});

	it('should be able to append number to the name if name contains - in the middle', function() {
		const isAvailable = vi.fn().mockReturnValueOnce(false).mockReturnValueOnce(false).mockReturnValueOnce(false).mockReturnValueOnce(false).mockReturnValueOnce(true);
		const uri = StringUtility.uri('a-bc', isAvailable);

		expect(uri).toEqual('a-bc-4');
		expect(isAvailable.mock.calls[0]).toEqual(['a-bc']);
		expect(isAvailable.mock.calls[1]).toEqual(['a-bc-1']);
		expect(isAvailable.mock.calls[2]).toEqual(['a-bc-2']);
		expect(isAvailable.mock.calls[3]).toEqual(['a-bc-3']);
		expect(isAvailable.mock.calls[4]).toEqual(['a-bc-4']);
		expect(isAvailable.mock.calls.length).toEqual(5);
	});

	it('should be lowercase', function() {
		const isAvailable = vi.fn().mockReturnValueOnce(false).mockReturnValueOnce(true);
		const uri = StringUtility.uri('A-BC', isAvailable);

		expect(uri).toEqual('a-bc-1');
		expect(isAvailable.mock.calls[0]).toEqual(['a-bc']);
		expect(isAvailable.mock.calls[1]).toEqual(['a-bc-1']);
		expect(isAvailable.mock.calls.length).toEqual(2);
	});

	it('should work with emojis', function() {
		const isAvailable = vi.fn().mockReturnValueOnce(false).mockReturnValueOnce(true);
		const uri = StringUtility.uri('💁🏼-123', isAvailable);

		expect(uri).toEqual('123-1');
		expect(isAvailable.mock.calls[0]).toEqual(['123']);
		expect(isAvailable.mock.calls[1]).toEqual(['123-1']);
		expect(isAvailable.mock.calls.length).toEqual(2);
	});
});
