/**
 * CDAV Library
 *
 * This library is part of the Nextcloud project
 *
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
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
