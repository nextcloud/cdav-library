/**
 * CDAV Library
 *
 * This library is part of the Nextcloud project
 *
 * SPDX-FileCopyrightText: 2018 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import ScheduleInbox from "../../../src/models/scheduleInbox.js";
import { Calendar } from "../../../src/models/calendar.js";

describe('Schedule inbox model', () => {

	it('should inherit from Calendar', () => {
		const parent = jasmine.createSpyObj('DavCollection', ['findAll', 'findAllByFilter', 'find',
			'createCollection', 'createObject', 'update', 'delete', 'isReadable', 'isWriteable']);
		const request = jasmine.createSpyObj('Request', ['propFind', 'put', 'delete']);
		const url = '/foo/bar/folder';
		const props = {
			'{urn:ietf:params:xml:ns:caldav}calendar-availability': 'VAVAILABILITY123'
		}

		const scheduleInbox = new ScheduleInbox(parent, request, url, props);
		expect(scheduleInbox).toEqual(jasmine.any(Calendar))
	});

	it('should inherit expose the property calendar-availability', () => {
		const parent = jasmine.createSpyObj('DavCollection', ['findAll', 'findAllByFilter', 'find',
			'createCollection', 'createObject', 'update', 'delete', 'isReadable', 'isWriteable']);
		const request = jasmine.createSpyObj('Request', ['propFind', 'put', 'delete']);
		const url = '/foo/bar/folder';
		const props = {
			'{urn:ietf:params:xml:ns:caldav}calendar-availability': 'VAVAILABILITY123'
		}

		const scheduleInbox = new ScheduleInbox(parent, request, url, props);
		expect(scheduleInbox.availability).toEqual('VAVAILABILITY123');
	});

});
