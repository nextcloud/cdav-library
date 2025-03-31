/**
 * CDAV Library
 *
 * This library is part of the Nextcloud project
 *
 * SPDX-FileCopyrightText: 2018 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { assert, beforeEach, describe, expect, it, vi } from "vitest";

import * as XMLUtility from "../../../src/utility/xmlUtility.js";
import {AddressBookHome} from "../../../src/models/addressBookHome.js";
import {DavCollection} from "../../../src/models/davCollection.js";
import {AddressBook} from "../../../src/models/addressBook.js";
import RequestMock from "../../mocks/request.mock.js";

describe('Address book home model', () => {

	beforeEach(() => {
		XMLUtility.resetPrefixMap();
	});

	it('should inherit from DavCollection', () => {
		const parent = null;
		const request = new RequestMock();
		const url = '/nextcloud/remote.php/dav/addressbooks/users/admin/';

		const addressBookHome = new AddressBookHome(parent, request, url, {});
		expect(addressBookHome).toEqual(expect.any(DavCollection));
	});

	it('should find all address-books', () => {
		const parent = null;
		const request = new RequestMock();
		const url = '/nextcloud/remote.php/dav/addressbooks/users/admin/';

		request.propFind.mockImplementation(() => {
			return Promise.resolve({
				status: 207,
				body: getDefaultPropFind(),
				headers: {}
			});
		});

		request.pathname.mockImplementation((p) => p);

		const addressBookHome = new AddressBookHome(parent, request, url, {});
		return addressBookHome.findAllAddressBooks().then((res) => {
			expect(res.length).toEqual(1);
			expect(res[0]).toEqual(expect.any(AddressBook));
			expect(res[0].url).toEqual('/nextcloud/remote.php/dav/addressbooks/users/admin/contacts/');

			expect(request.propFind).toHaveBeenCalledTimes(1);
			expect(request.propFind).toHaveBeenCalledWith('/nextcloud/remote.php/dav/addressbooks/users/admin/', expect.any(Array), 1);
		}).catch(() => {
			assert.fail('AddressBookGome findAllAddressBooks was not supposed to assert.fail');
		});
	});

	it('should create a new address-book collection', () => {
		const parent = null;
		const request = new RequestMock();
		const url = '/nextcloud/remote.php/dav/addressbooks/users/admin/';

		request.propFind.mockReturnValueOnce(Promise.resolve({
				status: 207,
				body: getDefaultPropFind(),
				headers: {}
			})).mockReturnValueOnce(Promise.resolve({
				status: 207,
				body: {
					"{DAV:}resourcetype" : [
						"{DAV:}collection",
						"{urn:ietf:params:xml:ns:carddav}addressbook"
					],
					"{DAV:}displayname" : "Renamed Address book",
					"{urn:ietf:params:xml:ns:carddav}addressbook-description": 'This is a fancy description',
				},
				headers: {}
			}));

		request.pathname.mockImplementation((p) => p);

		request.mkCol.mockImplementation(() => {
			return Promise.resolve({
				status: 201,
				body: null,
				headers: {}
			})
		});

		const addressBookHome = new AddressBookHome(parent, request, url, {});
		return addressBookHome.findAllAddressBooks().then(() => {
			return addressBookHome.createAddressBookCollection('contacts').then((res) => {
				expect(res).toEqual(expect.any(AddressBook));
				expect(res.url).toEqual('/nextcloud/remote.php/dav/addressbooks/users/admin/contacts-1/');

				expect(request.propFind).toHaveBeenCalledTimes(2);
				expect(request.propFind).toHaveBeenCalledWith('/nextcloud/remote.php/dav/addressbooks/users/admin/', expect.any(Array), 1);
				expect(request.propFind).toHaveBeenCalledWith('/nextcloud/remote.php/dav/addressbooks/users/admin/contacts-1/', expect.any(Array), 0);

				expect(request.mkCol).toHaveBeenCalledTimes(1);
				expect(request.mkCol).toHaveBeenCalledWith('/nextcloud/remote.php/dav/addressbooks/users/admin/contacts-1', {},
					'<x0:mkcol xmlns:x0="DAV:"><x0:set><x0:prop><x0:resourcetype><x0:collection/><x1:addressbook xmlns:x1="urn:ietf:params:xml:ns:carddav"/></x0:resourcetype><x0:displayname>contacts</x0:displayname></x0:prop></x0:set></x0:mkcol>');
			}).catch(() => {
				assert.fail('AddressBookGome createAddressBookCollection was not supposed to assert.fail');
			});
		}).catch(() => {
			assert.fail('AddressBookGome createAddressBookCollection was not supposed to assert.fail');
		});
	});

});

function getDefaultPropFind() {
	return {
		"/nextcloud/remote.php/dav/addressbooks/users/admin/" : {
			"{DAV:}resourcetype" : [
				"{DAV:}collection"
			],
			"{DAV:}owner" : "/nextcloud/remote.php/dav/principals/users/admin/",
			"{DAV:}current-user-privilege-set" : [
				"{DAV:}all",
				"{DAV:}read",
				"{DAV:}write",
				"{DAV:}write-properties",
				"{DAV:}write-content",
				"{DAV:}unlock",
				"{DAV:}bind",
				"{DAV:}unbind",
				"{DAV:}write-acl",
				"{DAV:}read-acl",
				"{DAV:}read-current-user-privilege-set"
			]
		},
		"/nextcloud/remote.php/dav/addressbooks/users/admin/contacts/" : {
			"{DAV:}resourcetype" : [
				"{DAV:}collection",
				"{urn:ietf:params:xml:ns:carddav}addressbook"
			],
			"{DAV:}displayname" : "Renamed Address book",
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
		},
		'/nextcloud/remote.php/dav/addressbooks/users/admin/d': {
			'{DAV:}displayname': 'Foo Bar Bla Blub col0',
			'{DAV:}owner': 'https://foo/bar/',
			'{DAV:}resourcetype': ['{DAV:}collection'],
			'{DAV:}sync-token': 'https://foo/bar/token/3',
		},
	};
}
