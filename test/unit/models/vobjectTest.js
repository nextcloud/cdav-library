/**
 * CDAV Library
 *
 * This library is part of the Nextcloud project
 *
 * SPDX-FileCopyrightText: 2018 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { describe, expect, it } from "vitest";

import { DavObject } from "../../../src/models/davObject.js";
import { VObject } from "../../../src/models/vobject.js";
import RequestMock from "../../mocks/request.mock.js";
import { DavCollection as DavCollectionMock } from "../../mocks/davCollection.mock.js";

describe('VObject model', () => {

	it('should inherit from DavObject', () => {
		const parent = new DavCollectionMock();
		const request = new RequestMock();
		const url = '/foo/bar/file';
		const props = {
			'{DAV:}getetag': '"etag foo bar tralala"',
			'{DAV:}getcontenttype': 'text/blub',
			'{DAV:}resourcetype': [],
			'{urn:ietf:params:xml:ns:caldav}calendar-data': 'FOO BAR BLA BLUB',
		};

		const vobject = new VObject(parent, request, url, props);
		expect(vobject).toEqual(expect.any(DavObject));
	});

	it('should expose the calendar-data as a property', () => {
		const parent = new DavCollectionMock();
		const request = new RequestMock();
		const url = '/foo/bar/file';
		const props = {
			'{DAV:}getetag': '"etag foo bar tralala"',
			'{DAV:}getcontenttype': 'text/blub',
			'{DAV:}resourcetype': [],
			'{urn:ietf:params:xml:ns:caldav}calendar-data': 'FOO BAR BLA BLUB',
		};

		const vobject = new VObject(parent, request, url, props);
		expect(vobject.data).toEqual('FOO BAR BLA BLUB');
	});

});
