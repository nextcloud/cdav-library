/**
 * CDAV Library
 *
 * This library is part of the Nextcloud project
 *
 * SPDX-FileCopyrightText: 2018 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { describe, expect, it } from "vitest";

import scheduleInboxPropSet from "../../../src/propset/scheduleInboxPropSet.js";

describe('Schedule Inbox collection prop-set', () => {
	it('should ignore unknown properties', () => {
		expect(scheduleInboxPropSet({
			'{Foo:}bar': 123
		})).toEqual([]);
	});

	it('should serialize {DAV:}displayname correctly', () => {
		expect(scheduleInboxPropSet({
			'{Foo:}bar': 123,
			'{urn:ietf:params:xml:ns:caldav}calendar-availability': 'NEW:VAVAILABILITY'
		})).toEqual([
			{
				name: ['urn:ietf:params:xml:ns:caldav', 'calendar-availability'],
				value: 'NEW:VAVAILABILITY'
			}
		]);
	});
});
