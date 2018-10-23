import * as XMLUtility from "../../../src/utility/xmlUtility.js";
import {AddressBookHome} from "../../../src/models/addressBookHome.js";
import {DavCollection} from "../../../src/models/davCollection.js";
import {AddressBook} from "../../../src/models/addressBook.js";

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

describe('Address book home model', () => {

	beforeEach(() => {
		XMLUtility.resetPrefixMap();
	});

	it('should inherit from DavCollection', () => {
		const parent = null;
		const request = jasmine.createSpyObj('Request', ['propFind', 'put', 'delete', 'pathname']);
		const url = '/nextcloud/remote.php/dav/addressbooks/users/admin/';

		const addressBookHome = new AddressBookHome(parent, request, url, {});
		expect(addressBookHome).toEqual(jasmine.any(DavCollection));
	});

	it('should find all address-books', () => {
		const parent = null;
		const request = jasmine.createSpyObj('Request', ['propFind', 'put', 'delete', 'pathname']);
		const url = '/nextcloud/remote.php/dav/addressbooks/users/admin/';

		request.propFind.and.callFake(() => {
			return Promise.resolve({
				status: 207,
				body: getDefaultPropFind(),
				xhr: null
			});
		});

		request.pathname.and.callFake((p) => p);

		const addressBookHome = new AddressBookHome(parent, request, url, {});
		return addressBookHome.findAllAddressBooks().then((res) => {
			expect(res.length).toEqual(1);
			expect(res[0]).toEqual(jasmine.any(AddressBook));
			expect(res[0].url).toEqual('/nextcloud/remote.php/dav/addressbooks/users/admin/contacts/');

			expect(request.propFind).toHaveBeenCalledTimes(1);
			expect(request.propFind).toHaveBeenCalledWith('/nextcloud/remote.php/dav/addressbooks/users/admin/', jasmine.any(Array), 1);
		}).catch(() => {
			fail('AddressBookGome findAllAddressBooks was not supposed to fail');
		});
	});

	it('should create a new address-book collection', () => {
		const parent = null;
		const request = jasmine.createSpyObj('Request', ['propFind', 'put', 'delete', 'pathname', 'mkCol']);
		const url = '/nextcloud/remote.php/dav/addressbooks/users/admin/';

		request.propFind.and.returnValues(Promise.resolve({
				status: 207,
				body: getDefaultPropFind(),
				xhr: null
			}), Promise.resolve({
				status: 207,
				body: {
					"{DAV:}resourcetype" : [
						"{DAV:}collection",
						"{urn:ietf:params:xml:ns:carddav}addressbook"
					],
					"{DAV:}displayname" : "Renamed Address book",
					"{urn:ietf:params:xml:ns:carddav}addressbook-description": 'This is a fancy description',
				},
				xhr: null
			})
		);

		request.pathname.and.callFake((p) => p);

		request.mkCol.and.callFake(() => {
			return Promise.resolve({
				status: 201,
				body: null,
				xhr: null
			})
		});

		const addressBookHome = new AddressBookHome(parent, request, url, {});
		return addressBookHome.findAllAddressBooks().then(() => {
			return addressBookHome.createAddressBookCollection('contacts').then((res) => {
				expect(res).toEqual(jasmine.any(AddressBook));
				expect(res.url).toEqual('/nextcloud/remote.php/dav/addressbooks/users/admin/contacts-1/');

				expect(request.propFind).toHaveBeenCalledTimes(2);
				expect(request.propFind).toHaveBeenCalledWith('/nextcloud/remote.php/dav/addressbooks/users/admin/', jasmine.any(Array), 1);
				expect(request.propFind).toHaveBeenCalledWith('/nextcloud/remote.php/dav/addressbooks/users/admin/contacts-1/', jasmine.any(Array), 0);

				expect(request.mkCol).toHaveBeenCalledTimes(1);
				expect(request.mkCol).toHaveBeenCalledWith('/nextcloud/remote.php/dav/addressbooks/users/admin/contacts-1', {},
					'<x0:mkcol xmlns:x0="DAV:"><x0:set><x0:prop><x0:resourcetype><x0:collection/><x1:addressbook xmlns:x1="urn:ietf:params:xml:ns:carddav"/></x0:resourcetype><x0:displayname>contacts</x0:displayname></x0:prop></x0:set></x0:mkcol>');
			}).catch(() => {
				fail('AddressBookGome createAddressBookCollection was not supposed to fail');
			});
		}).catch(() => {
			fail('AddressBookGome createAddressBookCollection was not supposed to fail');
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
