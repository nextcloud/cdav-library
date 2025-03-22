/**
 * CDAV Library
 *
 * This library is part of the Nextcloud project
 *
 * SPDX-FileCopyrightText: 2018 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { describe, expect, it } from "vitest";

import addressBookPropSet from "../../../src/propset/addressBookPropSet.js";

describe('Address book prop-set', () => {
	it('should ignore unknown properties', () => {
		expect(addressBookPropSet({
			'{Foo:}bar': 123
		})).toEqual([]);
	});

	it('should serialize {urn:ietf:params:xml:ns:carddav}addressbook-description correctly', () => {
		expect(addressBookPropSet({
			'{Foo:}bar': 123,
			'{urn:ietf:params:xml:ns:carddav}addressbook-description': 'New addressbook description'
		})).toEqual([
			{
				name: ['urn:ietf:params:xml:ns:carddav', 'addressbook-description'],
				value: 'New addressbook description'
			}
		]);
	});

	it('should serialize {http://owncloud.org/ns}enabled correctly - enabled', () => {
		expect(addressBookPropSet({
			'{Foo:}bar': 123,
			'{http://owncloud.org/ns}enabled': true
		})).toEqual([
			{
				name: ['http://owncloud.org/ns', 'enabled'],
				value: '1'
			}
		]);
	});

	it('should serialize {http://owncloud.org/ns}enabled correctly - disabled', () => {
		expect(addressBookPropSet({
			'{Foo:}bar': 123,
			'{http://owncloud.org/ns}enabled': false
		})).toEqual([
			{
				name: ['http://owncloud.org/ns', 'enabled'],
				value: '0'
			}
		]);
	});
});
