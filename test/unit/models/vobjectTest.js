/**
 * CDAV Library
 *
 * This library is part of the Nextcloud project
 *
 * SPDX-FileCopyrightText: 2018 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { describe, expect, it, vi } from "vitest";

import { DavObject } from "../../../src/models/davObject.js";
import {VObject} from "../../../src/models/vobject.js";

describe('VObject model', () => {

	it('should inherit from DavObject', () => {
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
