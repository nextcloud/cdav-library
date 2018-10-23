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

import davCollectionPropSet from "../../../src/propset/davCollectionPropSet.js";

describe('Dav collection prop-set', () => {
	it('should ignore unknown properties', () => {
		expect(davCollectionPropSet({
			'{Foo:}bar': 123
		})).toEqual([]);
	});

	it('should serialize {DAV:}displayname correctly', () => {
		expect(davCollectionPropSet({
			'{Foo:}bar': 123,
			'{DAV:}displayname': 'New displayname for collection'
		})).toEqual([
			{
				name: ['DAV:', 'displayname'],
				value: 'New displayname for collection'
			}
		]);
	});
});
