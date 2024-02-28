/**
 * CDAV Library
 *
 * This library is part of the Nextcloud project
 *
 * @copyright Copyright (c) 2024 Richard Steinmetz <richard@steinmetz.cloud>
 *
 * @author Richard Steinmetz <richard@steinmetz.cloud>
 *
 * @license AGPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

import principalPropSet from '../../../src/propset/principalPropSet.js';

describe('Principal prop-set', () => {
	it('should ignore unknown properties', () => {
		expect(principalPropSet({
			'{Foo:}bar': 123
		})).toEqual([]);
	});

	it('should serialize {urn:ietf:params:xml:ns:caldav}schedule-default-calendar-URL correctly', () => {
		expect(principalPropSet({
			'{Foo:}bar': 123,
			'{urn:ietf:params:xml:ns:caldav}schedule-default-calendar-URL': '/nextcloud/remote.php/dav/calendars/admin/personal/'
		})).toEqual([
			{
				name: ['urn:ietf:params:xml:ns:caldav', 'schedule-default-calendar-URL'],
				children: [
					{
						name: ['DAV:', 'href'],
						value: '/nextcloud/remote.php/dav/calendars/admin/personal/'
					}
				]
			}
		]);
	});
});
