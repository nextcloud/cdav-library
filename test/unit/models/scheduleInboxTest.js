/**
 * CDAV Library
 *
 * This library is part of the Nextcloud project
 *
 * SPDX-FileCopyrightText: 2018 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { describe, expect, it } from "vitest";

import ScheduleInbox from "../../../src/models/scheduleInbox.js";
import { Calendar } from "../../../src/models/calendar.js";
import RequestMock from "../../mocks/request.mock.js";
import { DavCollection as DavCollectionMock } from "../../mocks/davCollection.mock.js";

describe('Schedule inbox model', () => {

	it('should inherit from Calendar', () => {
		const parent = new DavCollectionMock();
		const request = new RequestMock();
		const url = '/foo/bar/folder';
		const props = {
			'{urn:ietf:params:xml:ns:caldav}calendar-availability': 'VAVAILABILITY123'
		}

		const scheduleInbox = new ScheduleInbox(parent, request, url, props);
		expect(scheduleInbox).toEqual(expect.any(Calendar))
	});

	it('should inherit expose the property calendar-availability', () => {
		const parent = new DavCollectionMock();
		const request = new RequestMock();
		const url = '/foo/bar/folder';
		const props = {
			'{urn:ietf:params:xml:ns:caldav}calendar-availability': 'VAVAILABILITY123'
		}

		const scheduleInbox = new ScheduleInbox(parent, request, url, props);
		expect(scheduleInbox.availability).toEqual('VAVAILABILITY123');
	});

});
