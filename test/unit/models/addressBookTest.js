/**
 * CDAV Library
 *
 * This library is part of the Nextcloud project
 *
 * SPDX-FileCopyrightText: 2018 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { assert, beforeEach, describe, expect, it, vi } from "vitest";

import { DavCollection } from "../../../src/models/davCollection.js";
import {AddressBook} from "../../../src/models/addressBook.js";
import * as XMLUtility from "../../../src/utility/xmlUtility.js";
import {VCard} from "../../../src/models/vcard.js";
import * as NS from "../../../src/utility/namespaceUtility.js";

describe('Address book model', () => {

	beforeEach(() => {
		XMLUtility.resetPrefixMap();
	});

	it('should inherit from DavCollection / shareable ', () => {
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
		const props = returnDefaultProps();

		const addressbook = new AddressBook(parent, request, url, props);
		expect(addressbook).toEqual(expect.any(DavCollection));
		expect(addressbook.share).toEqual(expect.any(Function));
		expect(addressbook.unshare).toEqual(expect.any(Function));
	});

	it('should inherit expose the property description', () => {
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
		const props = returnDefaultProps();

		const addressbook = new AddressBook(parent, request, url, props);
		expect(addressbook.description).toEqual('This is a fancy description');
	});

	it('should inherit expose the property enabled', () => {
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
		const props = returnDefaultProps();

		const addressbook = new AddressBook(parent, request, url, props);
		expect(addressbook.enabled).toEqual(true);
	});

	it('should inherit expose the property read-only', () => {
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
		const props = returnDefaultProps();

		const addressbook = new AddressBook(parent, request, url, props);
		expect(addressbook.readOnly).toEqual(false);
	});

	it('should find all VCards', () => {
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
            'delete': vi.fn(),
            'pathname': vi.fn()
        };
		const url = '/foo/bar/folder';
		const props = returnDefaultProps();

		request.propFind.mockImplementation(() => {
			return Promise.resolve({
				status: 207,
				body: {
					'/foo/bar/folder/a': getVCardProps(),
					'/foo/bar/folder/b': getVCardProps(),
					'/foo/bar/folder/c': {
						'{DAV:}owner': 'https://foo/bar/',
						'{DAV:}resourcetype': [],
						'{DAV:}sync-token': 'https://foo/bar/token/3',
						'{DAV:}getcontenttype': 'text/foo1; charset=utf8'
					},
				},
				xhr: null
			});
		});

		request.pathname.mockImplementation((p) => p);

		const addressbook = new AddressBook(parent, request, url, props);
		return addressbook.findAllVCards().then((res) => {
			expect(res.length).toEqual(2);
			expect(res[0]).toEqual(expect.any(VCard));
			expect(res[0].url).toEqual('/foo/bar/folder/a');
			expect(res[1]).toEqual(expect.any(VCard));
			expect(res[1].url).toEqual('/foo/bar/folder/b');

			expect(request.propFind).toHaveBeenCalledTimes(1);
			expect(request.propFind).toHaveBeenCalledWith('/foo/bar/folder/', [
				['DAV:', 'getcontenttype'], ['DAV:', 'getetag'], ['DAV:', 'resourcetype'],
				['DAV:', 'displayname'], ['DAV:', 'owner'], ['DAV:', 'resourcetype'],
				['DAV:', 'sync-token'], ['DAV:', 'current-user-privilege-set'],
				['DAV:', 'getcontenttype'], ['DAV:', 'getetag'], ['DAV:', 'resourcetype'],
				['urn:ietf:params:xml:ns:carddav', 'address-data']], 1);
		}).catch(() => {
			assert.fail('Addressbook findAllVCards was not supposed to assert.fail');
		});
	});

	it('should find all VCards and request only a set of VCard properties', () => {
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
            'delete': vi.fn(),
            'report': vi.fn(),
            'pathname': vi.fn()
        };
		const url = '/foo/bar/folder';
		const props = returnDefaultProps();

		request.report.mockImplementation(() => {
			return Promise.resolve({
				status: 207,
				body: {
					'/foo/bar/folder/b': getVCardProps()
				},
				xhr: null
			});
		});

		request.pathname.mockImplementation((p) => p);

		const addressbook = new AddressBook(parent, request, url, props);
		return addressbook.findAllAndFilterBySimpleProperties(['EMAIL', 'UID', 'CATEGORIES']).then((res) => {
			expect(res.length).toEqual(1);
			expect(res[0]).toEqual(expect.any(VCard));
			expect(res[0].url).toEqual('/foo/bar/folder/b');

			expect(request.report).toHaveBeenCalledTimes(1);
			expect(request.report).toHaveBeenCalledWith('/foo/bar/folder/', { Depth: '1' },
				'<x0:addressbook-query xmlns:x0="urn:ietf:params:xml:ns:carddav"><x1:prop xmlns:x1="DAV:"><x1:getetag/><x1:getcontenttype/><x1:resourcetype/><x0:address-data><x0:prop name="EMAIL"/><x0:prop name="UID"/><x0:prop name="CATEGORIES"/></x0:address-data><x2:has-photo xmlns:x2="http://nextcloud.com/ns"/></x1:prop></x0:addressbook-query>');
		}).catch(() => {
			assert.fail('AddressBook findAllAndFilterBySimpleProperties was not supposed to assert.fail');
		});
	});

	it('should create a new VCard', () => {
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
            'delete': vi.fn(),
            'pathname': vi.fn()
        };
		const url = '/foo/bar/folder';
		const props = returnDefaultProps();

		request.put.mockImplementation(() => {
			return Promise.resolve({
				status: 204,
				body: null,
				xhr: null,
			})
		});
		request.propFind.mockImplementation(() => {
			return Promise.resolve({
				status: 207,
				body: getVCardProps(),
				xhr: null
			});
		});
		request.pathname.mockImplementation((p) => p);

		const addressbook = new AddressBook(parent, request, url, props);
		return addressbook.createVCard('DATA123').then((res) => {
			expect(res).toEqual(expect.any(VCard));
			expect(res.url).toEqual(expect.any(String));
			expect(res.url.startsWith('/foo/bar/folder/')).toEqual(true);
			expect(res.url.endsWith('.vcf')).toEqual(true);
			expect(res.etag).toEqual('"095329048d1a5a7ce26ec24bb7af0908"');

			expect(request.put).toHaveBeenCalledTimes(1);
			expect(request.put).toHaveBeenCalledWith(expect.any(String), { 'Content-Type': 'text/vcard; charset=utf-8' }, 'DATA123');
			expect(request.propFind).toHaveBeenCalledTimes(1);
			expect(request.propFind).toHaveBeenCalledWith(expect.any(String), [
				['DAV:', 'getcontenttype'], ['DAV:', 'getetag'], ['DAV:', 'resourcetype'],
				['DAV:', 'displayname'], ['DAV:', 'owner'], ['DAV:', 'resourcetype'],
				['DAV:', 'sync-token'], ['DAV:', 'current-user-privilege-set'],
				['DAV:', 'getcontenttype'], ['DAV:', 'getetag'], ['DAV:', 'resourcetype'],
				['urn:ietf:params:xml:ns:carddav', 'address-data']], 0);
		}).catch(() => {
			assert.fail('DavCollection update was not supposed to assert.fail');
		});
	});

	it('should send an addressbook-query', () => {
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
            'delete': vi.fn(),
            'report': vi.fn(),
            'pathname': vi.fn()
        };
		const url = '/foo/bar/folder';
		const props = returnDefaultProps();

		request.report.mockImplementation(() => {
			return Promise.resolve({
				status: 207,
				body: {
					'/foo/bar/folder/b': getVCardProps()
				},
				xhr: null
			});
		});

		request.pathname.mockImplementation((p) => p);

		// https://tools.ietf.org/html/rfc6352#section-8.6.4
		const addressbook = new AddressBook(parent, request, url, props);
		return addressbook.addressbookQuery([{
			name: [NS.IETF_CARDDAV, 'prop-filter'],
			attributes: [
				['name', 'FN']
			],
			children: [{
				name: [NS.IETF_CARDDAV, 'text-match'],
				attributes: [
					['collation', 'i;unicode-casemap'],
					['match-type', 'contains'],
				],
				value: 'daboo'
			}]
		}, {
			name: [NS.IETF_CARDDAV, 'prop-filter'],
			attributes: [
				['name', 'EMAIL']
			],
			children: [{
				name: [NS.IETF_CARDDAV, 'text-match'],
				attributes: [
					['collation', 'i;unicode-casemap'],
					['match-type', 'contains'],
				],
				value: 'daboo'
			}]
		}]).then((res) => {
			expect(res.length).toEqual(1);
			expect(res[0]).toEqual(expect.any(VCard));
			expect(res[0].url).toEqual('/foo/bar/folder/b');

			expect(request.report).toHaveBeenCalledTimes(1);
			expect(request.report).toHaveBeenCalledWith('/foo/bar/folder/', { Depth: '1' },
				'<x0:addressbook-query xmlns:x0="urn:ietf:params:xml:ns:carddav"><x1:prop xmlns:x1="DAV:"><x1:getcontenttype/><x1:getetag/><x1:resourcetype/><x1:displayname/><x1:owner/><x1:resourcetype/><x1:sync-token/><x1:current-user-privilege-set/><x1:getcontenttype/><x1:getetag/><x1:resourcetype/><x0:address-data/></x1:prop><x0:filter test="anyof"><x0:prop-filter name="FN"><x0:text-match collation="i;unicode-casemap" match-type="contains">daboo</x0:text-match></x0:prop-filter><x0:prop-filter name="EMAIL"><x0:text-match collation="i;unicode-casemap" match-type="contains">daboo</x0:text-match></x0:prop-filter></x0:filter></x0:addressbook-query>');
		}).catch(() => {
			assert.fail('AddressBook addressbook-query was not supposed to assert.fail');
		});
	});

	it('should send an addressbook-multiget', () => {
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
            'delete': vi.fn(),
            'report': vi.fn(),
            'pathname': vi.fn()
        };
		const url = '/foo/bar/folder';
		const props = returnDefaultProps();

		request.report.mockImplementation(() => {
			return Promise.resolve({
				status: 207,
				body: {
					'/foo/bar/folder/a': getVCardProps(),
					'/foo/bar/folder/b': getVCardProps()
				},
				xhr: null
			});
		});

		request.pathname.mockImplementation((p) => p);

		const addressbook = new AddressBook(parent, request, url, props);
		return addressbook.addressbookMultiget(['/foo/bar/folder/a', '/foo/bar/folder/b']).then((res) => {
			expect(res.length).toEqual(2);
			expect(res[0]).toEqual(expect.any(VCard));
			expect(res[0].url).toEqual('/foo/bar/folder/a');
			expect(res[1]).toEqual(expect.any(VCard));
			expect(res[1].url).toEqual('/foo/bar/folder/b');

			expect(request.report).toHaveBeenCalledTimes(1);
			expect(request.report).toHaveBeenCalledWith('/foo/bar/folder/', { Depth: '1' },
				'<x0:addressbook-multiget xmlns:x0="urn:ietf:params:xml:ns:carddav"><x1:prop xmlns:x1="DAV:"><x1:getcontenttype/><x1:getetag/><x1:resourcetype/><x1:displayname/><x1:owner/><x1:resourcetype/><x1:sync-token/><x1:current-user-privilege-set/><x1:getcontenttype/><x1:getetag/><x1:resourcetype/><x0:address-data/></x1:prop><x1:href xmlns:x1="DAV:">/foo/bar/folder/a</x1:href><x1:href xmlns:x1="DAV:">/foo/bar/folder/b</x1:href></x0:addressbook-multiget>');
		}).catch(() => {
			assert.fail('AddressBook addressbook-multiget was not supposed to assert.fail');
		});
	});

	it('should send an addressbook-multiget and request export of data', () => {
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
            'delete': vi.fn(),
            'report': vi.fn(),
            'pathname': vi.fn()
        };
		const url = '/foo/bar/folder';
		const props = returnDefaultProps();

		request.report.mockImplementation(() => {
			return Promise.resolve({
				status: 200,
				body: 'RAW DATA',
				xhr: null
			});
		});

		request.pathname.mockImplementation((p) => p);

		const addressbook = new AddressBook(parent, request, url, props);
		return addressbook.addressbookMultigetExport(['/foo/bar/folder/a', '/foo/bar/folder/b']).then((res) => {
			expect(res.status).toEqual(200);
			expect(res.body).toEqual('RAW DATA');

			expect(request.report).toHaveBeenCalledTimes(1);
			expect(request.report).toHaveBeenCalledWith('/foo/bar/folder/?export', { Depth: '1' },
				'<x0:addressbook-multiget xmlns:x0="urn:ietf:params:xml:ns:carddav"><x1:prop xmlns:x1="DAV:"><x1:getcontenttype/><x1:getetag/><x1:resourcetype/><x1:displayname/><x1:owner/><x1:resourcetype/><x1:sync-token/><x1:current-user-privilege-set/><x1:getcontenttype/><x1:getetag/><x1:resourcetype/><x0:address-data/></x1:prop><x1:href xmlns:x1="DAV:">/foo/bar/folder/a</x1:href><x1:href xmlns:x1="DAV:">/foo/bar/folder/b</x1:href></x0:addressbook-multiget>');
		}).catch(() => {
			assert.fail('AddressBook addressbook-multiget was not supposed to assert.fail');
		});
	});
});

function returnDefaultProps() {
	return {
		"{DAV:}resourcetype" : [
			"{DAV:}collection",
			"{urn:ietf:params:xml:ns:carddav}addressbook"
		],
		"{DAV:}displayname" : "Renamed Address book",
		"{urn:ietf:params:xml:ns:carddav}addressbook-description": 'This is a fancy description',
		"{http://owncloud.org/ns}enabled": true,
		"{http://owncloud.org/ns}read-only": false,
		"{DAV:}owner" : "/nextcloud/remote.php/dav/principals/users/admin/",
		"{DAV:}sync-token" : "http://sabre.io/ns/sync/7",
		"{DAV:}current-user-privilege-set" : [
			"{DAV:}write",
			"{DAV:}write-properties",
			"{DAV:}write-content",
			"{DAV:}unlock",
			"{DAV:}bind",
			"{DAV:}unbind",
			"{DAV:}write-acl",
			"{DAV:}read",
			"{DAV:}read-acl",
			"{DAV:}read-current-user-privilege-set"
		],
		"{http://owncloud.org/ns}invite" : [

		],
		"{urn:ietf:params:xml:ns:carddav}supported-address-data" : [
			{
				"content-type" : "text/vcard",
				"version" : "3.0"
			},
			{
				"content-type" : "text/vcard",
				"version" : "4.0"
			},
			{
				"content-type" : "application/vcard+json",
				"version" : "4.0"
			}
		],
		"{urn:ietf:params:xml:ns:carddav}max-resource-size" : 10000000,
		"{http://calendarserver.org/ns/}getctag" : "7"
	};
}

function getVCardProps() {
	return {
		"{DAV:}getcontenttype" : "text/vcard; charset=utf-8",
		"{DAV:}getetag" : "\"095329048d1a5a7ce26ec24bb7af0908\"",
		"{DAV:}resourcetype" : [

		],
		"{DAV:}owner" : "/nextcloud/remote.php/dav/principals/users/admin/",
		"{DAV:}current-user-privilege-set" : [
			"{DAV:}write",
			"{DAV:}write-properties",
			"{DAV:}write-content",
			"{DAV:}unlock",
			"{DAV:}write-acl",
			"{DAV:}read",
			"{DAV:}read-acl",
			"{DAV:}read-current-user-privilege-set"
		],
		"{urn:ietf:params:xml:ns:carddav}address-data" : "BEGIN:VCARD\nVERSION:3.0\nPRODID:-//Apple Inc.//iOS 10.2//EN\nN:Foo;Bar;;;\nFN:BAR FOOOOO\nEMAIL;TYPE=INTERNET,WORK,pref:foo@example.com\nITEM1.TEL;TYPE=pref:+1800FOOBAR\nITEM1.X-ABLABEL:WORK,VOICE\nREV:2017-01-02T14:44:35Z\nUID:ad52f2c5-6444-4f2a-8e07-8f3a822855de\nEND:VCARD"
	}
}
