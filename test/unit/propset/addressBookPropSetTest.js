/**
 * CDAV Library
 *
 * This library is part of the Nextcloud project
 *
 * @author Georg Ehrke
 * @copyright 2018 Georg Ehrke <oc.list@georgehrke.com>
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU AFFERO GENERAL PUBLIC LICENSE for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this library.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

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
