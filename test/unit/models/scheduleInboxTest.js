/**
 * CDAV Library
 *
 * This library is part of the Nextcloud project
 *
 * SPDX-FileCopyrightText: 2018 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { describe, expect, it, vi } from "vitest";

import ScheduleInbox from "../../../src/models/scheduleInbox.js";
import { Calendar } from "../../../src/models/calendar.js";

describe('Schedule inbox model', () => {

	it('should inherit from Calendar', () => {
		const parent = {
			'findAll': vi.fn(),
			'findAllByFilter': vi.fn(),
			'find': vi.fn(),
			'createCollection': vi.fn(),
			'createObject': vi.fn(),
			'update': vi.fn(),
			'delete': vi.fn(),
			'isReadable': vi.fn(),
			'isWriteable': vi.fn()
		};
		const request = {
			'propFind': vi.fn(),
			'put': vi.fn(),
			'delete': vi.fn()
		};
		const url = '/foo/bar/folder';
		const props = {
			'{urn:ietf:params:xml:ns:caldav}calendar-availability': 'VAVAILABILITY123'
		}

		const scheduleInbox = new ScheduleInbox(parent, request, url, props);
		expect(scheduleInbox).toEqual(expect.any(Calendar))
	});

	it('should inherit expose the property calendar-availability', () => {
		const parent = {
			'findAll': vi.fn(),
			'findAllByFilter': vi.fn(),
			'find': vi.fn(),
			'createCollection': vi.fn(),
			'createObject': vi.fn(),
			'update': vi.fn(),
			'delete': vi.fn(),
			'isReadable': vi.fn(),
			'isWriteable': vi.fn()
		};
		const request = {
			'propFind': vi.fn(),
			'put': vi.fn(),
			'delete': vi.fn()
		};
		const url = '/foo/bar/folder';
		const props = {
			'{urn:ietf:params:xml:ns:caldav}calendar-availability': 'VAVAILABILITY123'
		}

		const scheduleInbox = new ScheduleInbox(parent, request, url, props);
		expect(scheduleInbox.availability).toEqual('VAVAILABILITY123');
	});

});
