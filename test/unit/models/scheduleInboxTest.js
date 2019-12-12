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
