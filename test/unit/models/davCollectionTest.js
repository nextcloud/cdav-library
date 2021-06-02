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

import {DavCollection} from "../../../src/models/davCollection.js";
import DAVEventListener from "../../../src/models/davEventListener.js";
import {DavObject} from "../../../src/models/davObject.js";
import * as XMLUtility from '../../../src/utility/xmlUtility.js';

describe('Dav collection model', () => {

	beforeEach(() => {
		XMLUtility.resetPrefixMap();
	});

	it('should inherit from DAVEventListener', () => {
		const parent = jasmine.createSpyObj('DavCollection', ['findAll', 'findAllByFilter', 'find',
			'createCollection', 'createObject', 'update', 'delete', 'isReadable', 'isWriteable']);
		const request = jasmine.createSpyObj('Request', ['propFind', 'put', 'delete']);
		const url = '/foo/bar/folder';
		const props = {
			'{DAV:}displayname': 'Foo Bar Bla Blub',
			'{DAV:}owner': 'https://foo/bar/',
			'{DAV:}resourcetype': ['{DAV:}collection'],
			'{DAV:}sync-token': 'https://foo/bar/token/3',
			'{DAV:}current-user-privilege-set': ['{DAV:}write',
				'{DAV:}write-properties', '{DAV:}write-content',
				'{DAV:}unlock', '{DAV:}bind', '{DAV:}unbind',
				'{DAV:}write-acl', '{DAV:}read', '{DAV:}read-acl',
				'{DAV:}read-current-user-privilege-set'],
		};

		const collection = new DavCollection(parent, request, url, props);
		expect(collection).toEqual(jasmine.any(DAVEventListener));
	});

	it('should find all children', () => {
		const parent = jasmine.createSpyObj('DavCollection', ['findAll', 'findAllByFilter', 'find',
			'createCollection', 'createObject', 'update', 'delete', 'isReadable', 'isWriteable']);
		const request = jasmine.createSpyObj('Request', ['propFind', 'put', 'delete', 'pathname']);
		const url = '/foo/bar/folder';
		const props = {
			'{DAV:}displayname': 'Foo Bar Bla Blub',
			'{DAV:}owner': 'https://foo/bar/',
			'{DAV:}resourcetype': ['{DAV:}collection'],
			'{DAV:}sync-token': 'https://foo/bar/token/3',
			'{DAV:}current-user-privilege-set': ['{DAV:}write',
				'{DAV:}write-properties', '{DAV:}write-content',
				'{DAV:}unlock', '{DAV:}bind', '{DAV:}unbind',
				'{DAV:}write-acl', '{DAV:}read', '{DAV:}read-acl',
				'{DAV:}read-current-user-privilege-set'],
		};

		const collectionFactory1 = jasmine.createSpy().and.callFake(function() {
			this.name = 'collectionFactory1';
		});
		const collectionFactory2 = jasmine.createSpy().and.callFake(function() {
			this.name = 'collectionFactory2';
		});
		const objectFactory1 = jasmine.createSpy().and.callFake(function() {
			this.name = 'objectFactory1';
		});
		const objectFactory2 = jasmine.createSpy().and.callFake(function() {
			this.name = 'objectFactory2';
		});


		const collection = new DavCollection(parent, request, url, props);
		collection._registerCollectionFactory('{test}collection1', collectionFactory1);
		collection._registerCollectionFactory('{test}collection2', collectionFactory2);
		collection._registerObjectFactory('text/foo1', objectFactory1);
		collection._registerObjectFactory('text/foo2', objectFactory2);

		request.propFind.and.callFake(() => {
			return Promise.resolve({
				status: 207,
				body: {
					'/foo/bar/folder': {
						'{DAV:}displayname': 'Foo Bar Bla Blub',
						'{DAV:}owner': 'https://foo/bar/',
						'{DAV:}resourcetype': ['{DAV:}collection'],
						'{DAV:}sync-token': 'https://foo/bar/token/3',
					},
					'/foo/bar/folder/a': {
						'{DAV:}owner': 'https://foo/bar/',
						'{DAV:}resourcetype': [],
						'{DAV:}sync-token': 'https://foo/bar/token/3',
						'{DAV:}getcontenttype': 'text/foo1; charset=utf8'
					},
					'/foo/bar/folder/b': {
						'{DAV:}owner': 'https://foo/bar/',
						'{DAV:}resourcetype': [],
						'{DAV:}sync-token': 'https://foo/bar/token/3',
						'{DAV:}getcontenttype': 'text/foo2'
					},
					'/foo/bar/folder/c': {
						'{DAV:}owner': 'https://foo/bar/',
						'{DAV:}resourcetype': [],
						'{DAV:}sync-token': 'https://foo/bar/token/3',
						'{DAV:}getcontenttype': 'text/file'
					},
					'/foo/bar/folder/d/': {
						'{DAV:}displayname': 'Foo Bar Bla Blub col0',
						'{DAV:}owner': 'https://foo/bar/',
						'{DAV:}resourcetype': ['{DAV:}collection'],
						'{DAV:}sync-token': 'https://foo/bar/token/3',
					},
					'/foo/bar/folder/e/': {
						'{DAV:}displayname': 'Foo Bar Bla Blub col1',
						'{DAV:}owner': 'https://foo/bar/',
						'{DAV:}resourcetype': ['{DAV:}collection', '{test}collection1'],
						'{DAV:}sync-token': 'https://foo/bar/token/3',
					},
					'/foo/bar/folder/f/': {
						'{DAV:}displayname': 'Foo Bar Bla Blub col2',
						'{DAV:}owner': 'https://foo/bar/',
						'{DAV:}resourcetype': ['{DAV:}collection', '{test}collection2'],
						'{DAV:}sync-token': 'https://foo/bar/token/3',
					},
				},
				xhr: null
			});
		});

		request.pathname.and.callFake((p) => p);

		return collection.findAll().then((result) => {
			expect(result.length).toEqual(6);
			expect(result[0].name).toEqual('objectFactory1');
			expect(result[1].name).toEqual('objectFactory2');
			expect(result[2]).toEqual(jasmine.any(DavObject));
			expect(result[2].url).toEqual('/foo/bar/folder/c');
			expect(result[3]).toEqual(jasmine.any(DavCollection));
			expect(result[3].displayname).toEqual('Foo Bar Bla Blub col0');
			expect(result[4].name).toEqual('collectionFactory1');
			expect(result[5].name).toEqual('collectionFactory2');

			expect(request.propFind).toHaveBeenCalledTimes(1);
			expect(request.propFind).toHaveBeenCalledWith('/foo/bar/folder/',
				[['DAV:', 'getcontenttype'], ['DAV:', 'getetag'],
					['DAV:', 'resourcetype'], ['DAV:', 'displayname'],
					['DAV:', 'owner'], ['DAV:', 'resourcetype'],
					['DAV:', 'sync-token'], ['DAV:', 'current-user-privilege-set']],
				1);
		}).catch(() => {
			fail('request was not supposed to fail');
		});
	});

	it('should find all children and allow to provide a custom filter', () => {
		const parent = jasmine.createSpyObj('DavCollection', ['findAll', 'findAllByFilter', 'find',
			'createCollection', 'createObject', 'update', 'delete', 'isReadable', 'isWriteable']);
		const request = jasmine.createSpyObj('Request', ['propFind', 'put', 'delete', 'pathname']);
		const url = '/foo/bar/folder';
		const props = {
			'{DAV:}displayname': 'Foo Bar Bla Blub',
			'{DAV:}owner': 'https://foo/bar/',
			'{DAV:}resourcetype': ['{DAV:}collection'],
			'{DAV:}sync-token': 'https://foo/bar/token/3',
			'{DAV:}current-user-privilege-set': ['{DAV:}write',
				'{DAV:}write-properties', '{DAV:}write-content',
				'{DAV:}unlock', '{DAV:}bind', '{DAV:}unbind',
				'{DAV:}write-acl', '{DAV:}read', '{DAV:}read-acl',
				'{DAV:}read-current-user-privilege-set'],
		};

		const collectionFactory1 = jasmine.createSpy().and.callFake(function() {
			this.name = 'collectionFactory1';
		});
		const collectionFactory2 = jasmine.createSpy().and.callFake(function() {
			this.name = 'collectionFactory2';
		});
		const objectFactory1 = jasmine.createSpy().and.callFake(function() {
			this.name = 'objectFactory1';
		});
		const objectFactory2 = jasmine.createSpy().and.callFake(function() {
			this.name = 'objectFactory2';
		});


		const collection = new DavCollection(parent, request, url, props);
		collection._registerCollectionFactory('{test}collection1', collectionFactory1);
		collection._registerCollectionFactory('{test}collection2', collectionFactory2);
		collection._registerObjectFactory('text/foo1', objectFactory1);
		collection._registerObjectFactory('text/foo2', objectFactory2);

		request.propFind.and.callFake(() => {
			return Promise.resolve({
				status: 207,
				body: {
					'/foo/bar/folder': {
						'{DAV:}displayname': 'Foo Bar Bla Blub',
						'{DAV:}owner': 'https://foo/bar/',
						'{DAV:}resourcetype': ['{DAV:}collection'],
						'{DAV:}sync-token': 'https://foo/bar/token/3',
					},
					'/foo/bar/folder/a': {
						'{DAV:}owner': 'https://foo/bar/',
						'{DAV:}resourcetype': [],
						'{DAV:}sync-token': 'https://foo/bar/token/3',
						'{DAV:}getcontenttype': 'text/foo1; charset=utf8'
					},
					'/foo/bar/folder/b': {
						'{DAV:}owner': 'https://foo/bar/',
						'{DAV:}resourcetype': [],
						'{DAV:}sync-token': 'https://foo/bar/token/3',
						'{DAV:}getcontenttype': 'text/foo2'
					},
					'/foo/bar/folder/c': {
						'{DAV:}owner': 'https://foo/bar/',
						'{DAV:}resourcetype': [],
						'{DAV:}sync-token': 'https://foo/bar/token/3',
						'{DAV:}getcontenttype': 'text/file'
					},
					'/foo/bar/folder/d/': {
						'{DAV:}displayname': 'Foo Bar Bla Blub col0',
						'{DAV:}owner': 'https://foo/bar/',
						'{DAV:}resourcetype': ['{DAV:}collection'],
						'{DAV:}sync-token': 'https://foo/bar/token/3',
					},
					'/foo/bar/folder/e/': {
						'{DAV:}displayname': 'Foo Bar Bla Blub col1',
						'{DAV:}owner': 'https://foo/bar/',
						'{DAV:}resourcetype': ['{DAV:}collection', '{test}collection1'],
						'{DAV:}sync-token': 'https://foo/bar/token/3',
					},
					'/foo/bar/folder/f/': {
						'{DAV:}displayname': 'Foo Bar Bla Blub col2',
						'{DAV:}owner': 'https://foo/bar/',
						'{DAV:}resourcetype': ['{DAV:}collection', '{test}collection2'],
						'{DAV:}sync-token': 'https://foo/bar/token/3',
					},
				},
				xhr: null
			});
		});

		request.pathname.and.callFake((p) => p);

		return collection.findAllByFilter(((o) => !!o.name)).then((result) => {
			expect(result.length).toEqual(4);
			expect(result[0].name).toEqual('objectFactory1');
			expect(result[1].name).toEqual('objectFactory2');
			expect(result[2].name).toEqual('collectionFactory1');
			expect(result[3].name).toEqual('collectionFactory2');

			expect(request.propFind).toHaveBeenCalledTimes(1);
			expect(request.propFind).toHaveBeenCalledWith('/foo/bar/folder/',
				[['DAV:', 'getcontenttype'], ['DAV:', 'getetag'],
					['DAV:', 'resourcetype'], ['DAV:', 'displayname'],
					['DAV:', 'owner'], ['DAV:', 'resourcetype'],
					['DAV:', 'sync-token'], ['DAV:', 'current-user-privilege-set']],
				1);
		}).catch(() => {
			fail('request was not supposed to fail');
		});
	});

	it('should find one child by it\'s uri', () => {
		const parent = jasmine.createSpyObj('DavCollection', ['findAll', 'findAllByFilter', 'find',
			'createCollection', 'createObject', 'update', 'delete', 'isReadable', 'isWriteable']);
		const request = jasmine.createSpyObj('Request', ['propFind', 'put', 'delete', 'pathname']);
		const url = '/foo/bar/folder';
		const props = {
			'{DAV:}displayname': 'Foo Bar Bla Blub',
			'{DAV:}owner': 'https://foo/bar/',
			'{DAV:}resourcetype': ['{DAV:}collection'],
			'{DAV:}sync-token': 'https://foo/bar/token/3',
			'{DAV:}current-user-privilege-set': ['{DAV:}write',
				'{DAV:}write-properties', '{DAV:}write-content',
				'{DAV:}unlock', '{DAV:}bind', '{DAV:}unbind',
				'{DAV:}write-acl', '{DAV:}read', '{DAV:}read-acl',
				'{DAV:}read-current-user-privilege-set'],
		};

		const objectFactory1 = jasmine.createSpy().and.callFake(function() {
			this.name = 'objectFactory1';
		});

		const collection = new DavCollection(parent, request, url, props);
		collection._registerObjectFactory('text/foo1', objectFactory1);

		request.propFind.and.callFake(() => {
			return Promise.resolve({
				status: 207,
				body: {
					'{DAV:}owner': 'https://foo/bar/',
					'{DAV:}resourcetype': [],
					'{DAV:}sync-token': 'https://foo/bar/token/3',
					'{DAV:}getcontenttype': 'text/foo1; charset=utf8'
				},
				xhr: null
			});
		});

		request.pathname.and.callFake((p) => p);

		return collection.find('a').then((result) => {
			expect(result.name).toEqual('objectFactory1');
		}).catch(() => {
			fail('request was not supposed to fail');
		});
	});

	it('should create a collection', () => {
		const parent = jasmine.createSpyObj('DavCollection', ['findAll', 'findAllByFilter', 'find',
			'createCollection', 'createObject', 'update', 'delete', 'isReadable', 'isWriteable']);
		const request = jasmine.createSpyObj('Request', ['propFind', 'put', 'delete', 'mkCol', 'pathname']);
		const url = '/foo/bar/folder';
		const props = {
			'{DAV:}displayname': 'Foo Bar Bla Blub',
			'{DAV:}owner': 'https://foo/bar/',
			'{DAV:}resourcetype': ['{DAV:}collection'],
			'{DAV:}sync-token': 'https://foo/bar/token/3',
			'{DAV:}current-user-privilege-set': ['{DAV:}write',
				'{DAV:}write-properties', '{DAV:}write-content',
				'{DAV:}unlock', '{DAV:}bind', '{DAV:}unbind',
				'{DAV:}write-acl', '{DAV:}read', '{DAV:}read-acl',
				'{DAV:}read-current-user-privilege-set'],
		};

		const collectionFactory1 = jasmine.createSpy().and.callFake(function() {
			this.name = 'collectionFactory1';
		});
		const collectionFactory2 = jasmine.createSpy().and.callFake(function() {
			this.name = 'collectionFactory2';
		});
		const objectFactory1 = jasmine.createSpy().and.callFake(function() {
			this.name = 'objectFactory1';
		});
		const objectFactory2 = jasmine.createSpy().and.callFake(function() {
			this.name = 'objectFactory2';
		});


		const collection = new DavCollection(parent, request, url, props);
		collection._registerCollectionFactory('{test}collection1', collectionFactory1);
		collection._registerCollectionFactory('{test}collection2', collectionFactory2);
		collection._registerObjectFactory('text/foo1', objectFactory1);
		collection._registerObjectFactory('text/foo2', objectFactory2);

		request.propFind.and.returnValues(
			Promise.resolve({
				status: 207,
				body: {
					'/foo/bar/folder': {
						'{DAV:}displayname': 'Foo Bar Bla Blub',
						'{DAV:}owner': 'https://foo/bar/',
						'{DAV:}resourcetype': ['{DAV:}collection'],
						'{DAV:}sync-token': 'https://foo/bar/token/3',
					},
					'/foo/bar/folder/a': {
						'{DAV:}owner': 'https://foo/bar/',
						'{DAV:}resourcetype': [],
						'{DAV:}sync-token': 'https://foo/bar/token/3',
						'{DAV:}getcontenttype': 'text/foo1; charset=utf8'
					},
					'/foo/bar/folder/b': {
						'{DAV:}owner': 'https://foo/bar/',
						'{DAV:}resourcetype': [],
						'{DAV:}sync-token': 'https://foo/bar/token/3',
						'{DAV:}getcontenttype': 'text/foo2'
					},
					'/foo/bar/folder/c': {
						'{DAV:}owner': 'https://foo/bar/',
						'{DAV:}resourcetype': [],
						'{DAV:}sync-token': 'https://foo/bar/token/3',
						'{DAV:}getcontenttype': 'text/file'
					},
					'/foo/bar/folder/d/': {
						'{DAV:}displayname': 'Foo Bar Bla Blub col0',
						'{DAV:}owner': 'https://foo/bar/',
						'{DAV:}resourcetype': ['{DAV:}collection'],
						'{DAV:}sync-token': 'https://foo/bar/token/3',
					},
					'/foo/bar/folder/e/': {
						'{DAV:}displayname': 'Foo Bar Bla Blub col1',
						'{DAV:}owner': 'https://foo/bar/',
						'{DAV:}resourcetype': ['{DAV:}collection', '{test}collection1'],
						'{DAV:}sync-token': 'https://foo/bar/token/3',
					},
					'/foo/bar/folder/f/': {
						'{DAV:}displayname': 'Foo Bar Bla Blub col2',
						'{DAV:}owner': 'https://foo/bar/',
						'{DAV:}resourcetype': ['{DAV:}collection', '{test}collection2'],
						'{DAV:}sync-token': 'https://foo/bar/token/3',
					},
				},
				xhr: null
			}), Promise.resolve({
				status: 207,
				body: {
					'{DAV:}displayname': 'Foo Bar Bla Blub col0',
					'{DAV:}owner': 'https://foo/bar/',
					'{DAV:}resourcetype': ['{DAV:}collection'],
					'{DAV:}sync-token': 'https://foo/bar/token/3',
				},
				xhr: null
			}), Promise.resolve({
				status: 207,
				body: {
					'{DAV:}displayname': 'Foo Bar Bla Blub col0',
					'{DAV:}owner': 'https://foo/bar/',
					'{DAV:}resourcetype': ['{DAV:}collection'],
					'{DAV:}sync-token': 'https://foo/bar/token/3',
				},
				xhr: null
			})
		);

		request.mkCol.and.callFake(() => {
			return Promise.resolve({
				status: 201,
				body: null,
				xhr: null
			})
		});

		request.pathname.and.callFake((p) => p);

		return collection.findAll().then(() => {
			return collection.createCollection('b').then((fileName) => {
				return collection.createCollection('d').then((folderName) => {
					expect(request.mkCol).toHaveBeenCalledTimes(2);
					expect(request.mkCol).toHaveBeenCalledWith('/foo/bar/folder/b-1', {}, '<x0:mkcol xmlns:x0="DAV:"><x0:set><x0:prop><x0:resourcetype><x0:collection/></x0:resourcetype></x0:prop></x0:set></x0:mkcol>');
					expect(request.mkCol).toHaveBeenCalledWith('/foo/bar/folder/d-1', {}, '<x0:mkcol xmlns:x0="DAV:"><x0:set><x0:prop><x0:resourcetype><x0:collection/></x0:resourcetype></x0:prop></x0:set></x0:mkcol>');

					expect(request.propFind).toHaveBeenCalledTimes(3);

					expect(fileName).toEqual(jasmine.any(DavCollection));
					expect(fileName.url).toEqual('/foo/bar/folder/b-1/');
					expect(folderName).toEqual(jasmine.any(DavCollection));
					expect(folderName.url).toEqual('/foo/bar/folder/d-1/');
				})
			});
		}).catch(() => {
			fail('DavCollection create was not supposed to fail');
		});
	});

	it('should create an object', () => {
		const parent = jasmine.createSpyObj('DavCollection', ['findAll', 'findAllByFilter', 'find',
			'createCollection', 'createObject', 'update', 'delete', 'isReadable', 'isWriteable']);
		const request = jasmine.createSpyObj('Request', ['propFind', 'put', 'delete' , 'pathname']);
		const url = '/foo/bar/folder';
		const props = {
			'{DAV:}displayname': 'Foo Bar Bla Blub',
			'{DAV:}owner': 'https://foo/bar/',
			'{DAV:}resourcetype': ['{DAV:}collection'],
			'{DAV:}sync-token': 'https://foo/bar/token/3',
			'{DAV:}current-user-privilege-set': ['{DAV:}write',
				'{DAV:}write-properties', '{DAV:}write-content',
				'{DAV:}unlock', '{DAV:}bind', '{DAV:}unbind',
				'{DAV:}write-acl', '{DAV:}read', '{DAV:}read-acl',
				'{DAV:}read-current-user-privilege-set'],
		};

		request.put.and.callFake(() => {
			return Promise.resolve({
				status: 204,
				body: null,
				xhr: null,
			})
		});
		request.propFind.and.callFake(() => {
			return Promise.resolve({
				status: 207,
				body: {
					'{DAV:}getetag': '"etag foo bar tralala"',
					'{DAV:}owner': 'https://foo/bar/',
					'{DAV:}resourcetype': [],
					'{DAV:}sync-token': 'https://foo/bar/token/3',
					'{DAV:}getcontenttype': 'text/foo1; charset=utf8'
				},
				xhr: null
			});
		});
		request.pathname.and.callFake((p) => p);

		const collection = new DavCollection(parent, request, url, props);
		return collection.createObject('foo.bar', {'Content-Type': 'text/calendar'}, 'DATA123').then((res) => {
			expect(res).toEqual(jasmine.any(DavObject));
			expect(res.url).toEqual('/foo/bar/folder/foo.bar');
			expect(res.etag).toEqual('"etag foo bar tralala"');

			expect(request.put).toHaveBeenCalledTimes(1);
			expect(request.put).toHaveBeenCalledWith('/foo/bar/folder/foo.bar', { 'Content-Type': 'text/calendar' }, 'DATA123');
			expect(request.propFind).toHaveBeenCalledTimes(1);
			expect(request.propFind).toHaveBeenCalledWith('/foo/bar/folder/foo.bar', [
				['DAV:', 'getcontenttype'], ['DAV:', 'getetag'], ['DAV:', 'resourcetype'],
				['DAV:', 'displayname'], ['DAV:', 'owner'], ['DAV:', 'resourcetype'],
				['DAV:', 'sync-token'], ['DAV:', 'current-user-privilege-set']], 0);
		}).catch(() => {
			fail('DavCollection update was not supposed to fail');
		});
	});

	it('should update the collection', () => {
		const parent = jasmine.createSpyObj('DavCollection', ['findAll', 'findAllByFilter', 'find',
			'createCollection', 'createObject', 'update', 'delete', 'isReadable', 'isWriteable']);
		const request = jasmine.createSpyObj('Request', ['propFind', 'put', 'delete', 'propPatch']);
		const url = '/foo/bar/folder';
		const props = {
			'{DAV:}displayname': 'Foo Bar Bla Blub',
			'{DAV:}owner': 'https://foo/bar/',
			'{DAV:}resourcetype': ['{DAV:}collection'],
			'{DAV:}sync-token': 'https://foo/bar/token/3',
			'{custom}property': 'custom property value 123',
			'{DAV:}current-user-privilege-set': ['{DAV:}write',
				'{DAV:}write-properties', '{DAV:}write-content',
				'{DAV:}unlock', '{DAV:}bind', '{DAV:}unbind',
				'{DAV:}write-acl', '{DAV:}read', '{DAV:}read-acl',
				'{DAV:}read-current-user-privilege-set'],
		};

		request.propPatch.and.callFake(() => {
			return Promise.resolve({
				status: 207,
				body: {
					'{DAV:}displayname': '',
					'{http://apple.com/ns/ical/}calendar-color': ''
				},
				xhr: null
			});
		});

		const collection = new DavCollection(parent, request, url, props);
		collection._registerPropSetFactory((props) => {
			const xmlified = [];

			Object.entries(props).forEach(([key, value]) => {
				switch (key) {
					case '{custom}property':
						xmlified.push({
							name: ['custom', 'property'],
							value: value
						});
						break;

					default:
						break;
				}
			});

			return xmlified;
		});
		collection._exposeProperty('customProp', 'custom', 'property', true);

		collection.displayname = 'New displayname 123';
		collection.customProp = 'updated custom property value 456';

		return collection.update().then(() => {
			expect(request.propPatch).toHaveBeenCalledTimes(1);
			expect(request.propPatch).toHaveBeenCalledWith( '/foo/bar/folder/', {}, '<x0:propertyupdate xmlns:x0="DAV:"><x0:set><x0:prop><x0:displayname>New displayname 123</x0:displayname><x1:property xmlns:x1="custom">updated custom property value 456</x1:property></x0:prop></x0:set></x0:propertyupdate>');
		}).catch(() => {
			fail('DavCollection update was not supposed to fail');
		});
	});

	it('should update the collection only if properties changed', () => {
		const parent = jasmine.createSpyObj('DavCollection', ['findAll', 'findAllByFilter', 'find',
			'createCollection', 'createObject', 'update', 'delete', 'isReadable', 'isWriteable']);
		const request = jasmine.createSpyObj('Request', ['propFind', 'put', 'delete', 'propPatch']);
		const url = '/foo/bar/folder';
		const props = {
			'{DAV:}displayname': 'Foo Bar Bla Blub',
			'{DAV:}owner': 'https://foo/bar/',
			'{DAV:}resourcetype': ['{DAV:}collection'],
			'{DAV:}sync-token': 'https://foo/bar/token/3',
			'{custom}property': 'custom property value 123',
			'{DAV:}current-user-privilege-set': ['{DAV:}write',
				'{DAV:}write-properties', '{DAV:}write-content',
				'{DAV:}unlock', '{DAV:}bind', '{DAV:}unbind',
				'{DAV:}write-acl', '{DAV:}read', '{DAV:}read-acl',
				'{DAV:}read-current-user-privilege-set'],
		};

		request.propPatch.and.callFake(() => {
			return Promise.resolve({
				status: 207,
				body: {
					'{DAV:}displayname': '',
					'{http://apple.com/ns/ical/}calendar-color': ''
				},
				xhr: null
			});
		});

		const collection = new DavCollection(parent, request, url, props);
		collection._registerPropSetFactory((props) => {
			const xmlified = [];

			Object.entries(props).forEach(([key, value]) => {
				switch (key) {
					case '{custom}property':
						xmlified.push({
							name: ['custom', 'property'],
							value: value
						});
						break;

					default:
						break;
				}
			});

			return xmlified;
		});
		collection._exposeProperty('customProp', 'custom', 'property', true);

		return collection.update().then(() => {
			expect(request.propPatch).toHaveBeenCalledTimes(0);
		}).catch(() => {
			fail('DavCollection update was not supposed to fail');
		});
	});

	it('should delete a collection', () => {
		const parent = jasmine.createSpyObj('DavCollection', ['findAll', 'findAllByFilter', 'find',
			'createCollection', 'createObject', 'update', 'delete', 'isReadable', 'isWriteable']);
		const request = jasmine.createSpyObj('Request', ['propFind', 'put', 'delete']);
		const url = '/foo/bar/folder';
		const props = {
			'{DAV:}displayname': 'Foo Bar Bla Blub',
			'{DAV:}owner': 'https://foo/bar/',
			'{DAV:}resourcetype': ['{DAV:}collection'],
			'{DAV:}sync-token': 'https://foo/bar/token/3',
			'{DAV:}current-user-privilege-set': ['{DAV:}write',
				'{DAV:}write-properties', '{DAV:}write-content',
				'{DAV:}unlock', '{DAV:}bind', '{DAV:}unbind',
				'{DAV:}write-acl', '{DAV:}read', '{DAV:}read-acl',
				'{DAV:}read-current-user-privilege-set'],
		};

		const collection = new DavCollection(parent, request, url, props);
		return collection.delete().then(() => {
			expect(request.delete).toHaveBeenCalledTimes(1);
			expect(request.delete).toHaveBeenCalledWith('/foo/bar/folder/',  {});
		}).catch(() => {
			fail('DavCollection::delete was not supposed to fail');
		});
	});

	it('should provide a function to check if collection is readable', () => {
		const parent = jasmine.createSpyObj('DavCollection', ['findAll', 'findAllByFilter', 'find',
			'createCollection', 'createObject', 'update', 'delete', 'isReadable', 'isWriteable']);
		const request = jasmine.createSpyObj('Request', ['propFind', 'put', 'delete']);
		const url = '/foo/bar/folder';
		const props = {
			'{DAV:}displayname': 'Foo Bar Bla Blub',
			'{DAV:}owner': 'https://foo/bar/',
			'{DAV:}resourcetype': ['{DAV:}collection'],
			'{DAV:}sync-token': 'https://foo/bar/token/3',
			'{DAV:}current-user-privilege-set': [
				'{DAV:}unlock', '{DAV:}bind', '{DAV:}unbind',
				'{DAV:}write-acl', '{DAV:}read', '{DAV:}read-acl',
				'{DAV:}read-current-user-privilege-set'],
		};

		const collection = new DavCollection(parent, request, url, props);
		expect(collection.isReadable()).toEqual(true);
	});

	it('should provide a function to check if collection is writeable - writeable', () => {
		const parent = jasmine.createSpyObj('DavCollection', ['findAll', 'findAllByFilter', 'find',
			'createCollection', 'createObject', 'update', 'delete', 'isReadable', 'isWriteable']);
		const request = jasmine.createSpyObj('Request', ['propFind', 'put', 'delete']);
		const url = '/foo/bar/folder';
		const props = {
			'{DAV:}displayname': 'Foo Bar Bla Blub',
			'{DAV:}owner': 'https://foo/bar/',
			'{DAV:}resourcetype': ['{DAV:}collection'],
			'{DAV:}sync-token': 'https://foo/bar/token/3',
			'{DAV:}current-user-privilege-set': ['{DAV:}write',
				'{DAV:}write-properties', '{DAV:}write-content',
				'{DAV:}unlock', '{DAV:}bind', '{DAV:}unbind',
				'{DAV:}write-acl', '{DAV:}read', '{DAV:}read-acl',
				'{DAV:}read-current-user-privilege-set'],
		};

		const collection = new DavCollection(parent, request, url, props);
		expect(collection.isWriteable()).toEqual(true);
	});

	it('should provide a function to check if collection is writeable - not writeable', () => {
		const parent = jasmine.createSpyObj('DavCollection', ['findAll', 'findAllByFilter', 'find',
			'createCollection', 'createObject', 'update', 'delete', 'isReadable', 'isWriteable']);
		const request = jasmine.createSpyObj('Request', ['propFind', 'put', 'delete']);
		const url = '/foo/bar/folder';
		const props = {
			'{DAV:}displayname': 'Foo Bar Bla Blub',
			'{DAV:}owner': 'https://foo/bar/',
			'{DAV:}resourcetype': ['{DAV:}collection'],
			'{DAV:}sync-token': 'https://foo/bar/token/3',
			'{DAV:}current-user-privilege-set': ['{DAV:}write-properties',
				'{DAV:}unlock', '{DAV:}bind', '{DAV:}unbind',
				'{DAV:}write-acl', '{DAV:}read', '{DAV:}read-acl',
				'{DAV:}read-current-user-privilege-set'],
		};

		const collection = new DavCollection(parent, request, url, props);
		expect(collection.isWriteable()).toEqual(false);
	});

	it('should expose the property displayname', () => {
		const parent = jasmine.createSpyObj('DavCollection', ['findAll', 'findAllByFilter', 'find',
			'createCollection', 'createObject', 'update', 'delete', 'isReadable', 'isWriteable']);
		const request = jasmine.createSpyObj('Request', ['propFind', 'put', 'delete']);
		const url = '/foo/bar/folder';
		const props = {
			'{DAV:}displayname': 'Foo Bar Bla Blub',
			'{DAV:}owner': 'https://foo/bar/',
			'{DAV:}resourcetype': ['{DAV:}collection'],
			'{DAV:}sync-token': 'https://foo/bar/token/3',
			'{DAV:}current-user-privilege-set': ['{DAV:}write',
				'{DAV:}write-properties', '{DAV:}write-content',
				'{DAV:}unlock', '{DAV:}bind', '{DAV:}unbind',
				'{DAV:}write-acl', '{DAV:}read', '{DAV:}read-acl',
				'{DAV:}read-current-user-privilege-set'],
		};

		const collection = new DavCollection(parent, request, url, props);
		expect(collection.displayname).toEqual('Foo Bar Bla Blub');
	});

	it('should expose the property owner', () => {
		const parent = jasmine.createSpyObj('DavCollection', ['findAll', 'findAllByFilter', 'find',
			'createCollection', 'createObject', 'update', 'delete', 'isReadable', 'isWriteable']);
		const request = jasmine.createSpyObj('Request', ['propFind', 'put', 'delete']);
		const url = '/foo/bar/folder';
		const props = {
			'{DAV:}displayname': 'Foo Bar Bla Blub',
			'{DAV:}owner': 'https://foo/bar/',
			'{DAV:}resourcetype': ['{DAV:}collection'],
			'{DAV:}sync-token': 'https://foo/bar/token/3',
			'{DAV:}current-user-privilege-set': ['{DAV:}write',
				'{DAV:}write-properties', '{DAV:}write-content',
				'{DAV:}unlock', '{DAV:}bind', '{DAV:}unbind',
				'{DAV:}write-acl', '{DAV:}read', '{DAV:}read-acl',
				'{DAV:}read-current-user-privilege-set'],
		};

		const collection = new DavCollection(parent, request, url, props);
		expect(collection.owner).toEqual('https://foo/bar/')
	});

	it('should expose the property resource-type', () => {
		const parent = jasmine.createSpyObj('DavCollection', ['findAll', 'findAllByFilter', 'find',
			'createCollection', 'createObject', 'update', 'delete', 'isReadable', 'isWriteable']);
		const request = jasmine.createSpyObj('Request', ['propFind', 'put', 'delete']);
		const url = '/foo/bar/folder';
		const props = {
			'{DAV:}displayname': 'Foo Bar Bla Blub',
			'{DAV:}owner': 'https://foo/bar/',
			'{DAV:}resourcetype': ['{DAV:}collection'],
			'{DAV:}sync-token': 'https://foo/bar/token/3',
			'{DAV:}current-user-privilege-set': ['{DAV:}write',
				'{DAV:}write-properties', '{DAV:}write-content',
				'{DAV:}unlock', '{DAV:}bind', '{DAV:}unbind',
				'{DAV:}write-acl', '{DAV:}read', '{DAV:}read-acl',
				'{DAV:}read-current-user-privilege-set'],
		};

		const collection = new DavCollection(parent, request, url, props);
		expect(collection.resourcetype).toEqual(['{DAV:}collection']);
	});

	it('should expose the property sync-token', () => {
		const parent = jasmine.createSpyObj('DavCollection', ['findAll', 'findAllByFilter', 'find',
			'createCollection', 'createObject', 'update', 'delete', 'isReadable', 'isWriteable']);
		const request = jasmine.createSpyObj('Request', ['propFind', 'put', 'delete']);
		const url = '/foo/bar/folder';
		const props = {
			'{DAV:}displayname': 'Foo Bar Bla Blub',
			'{DAV:}owner': 'https://foo/bar/',
			'{DAV:}resourcetype': ['{DAV:}collection'],
			'{DAV:}sync-token': 'https://foo/bar/token/3',
			'{DAV:}current-user-privilege-set': ['{DAV:}write',
				'{DAV:}write-properties', '{DAV:}write-content',
				'{DAV:}unlock', '{DAV:}bind', '{DAV:}unbind',
				'{DAV:}write-acl', '{DAV:}read', '{DAV:}read-acl',
				'{DAV:}read-current-user-privilege-set'],
		};

		const collection = new DavCollection(parent, request, url, props);
		expect(collection.syncToken).toEqual('https://foo/bar/token/3');
	});

	it('should expose the property current-user-privilege-set', () => {
		const parent = jasmine.createSpyObj('DavCollection', ['findAll', 'findAllByFilter', 'find',
			'createCollection', 'createObject', 'update', 'delete', 'isReadable', 'isWriteable']);
		const request = jasmine.createSpyObj('Request', ['propFind', 'put', 'delete']);
		const url = '/foo/bar/folder';
		const props = {
			'{DAV:}displayname': 'Foo Bar Bla Blub',
			'{DAV:}owner': 'https://foo/bar/',
			'{DAV:}resourcetype': ['{DAV:}collection'],
			'{DAV:}sync-token': 'https://foo/bar/token/3',
			'{DAV:}current-user-privilege-set': ['{DAV:}write',
				'{DAV:}write-properties', '{DAV:}write-content',
				'{DAV:}unlock', '{DAV:}bind', '{DAV:}unbind',
				'{DAV:}write-acl', '{DAV:}read', '{DAV:}read-acl',
				'{DAV:}read-current-user-privilege-set'],
		};

		const collection = new DavCollection(parent, request, url, props);
		expect(collection.currentUserPrivilegeSet).toEqual(['{DAV:}write',
			'{DAV:}write-properties', '{DAV:}write-content',
			'{DAV:}unlock', '{DAV:}bind', '{DAV:}unbind',
			'{DAV:}write-acl', '{DAV:}read', '{DAV:}read-acl',
			'{DAV:}read-current-user-privilege-set']);
	});

	it('should expose the property url', () => {
		const parent = jasmine.createSpyObj('DavCollection', ['findAll', 'findAllByFilter', 'find',
			'createCollection', 'createObject', 'update', 'delete', 'isReadable', 'isWriteable']);
		const request = jasmine.createSpyObj('Request', ['propFind', 'put', 'delete']);
		const url = '/foo/bar/folder';
		const props = {
			'{DAV:}displayname': 'Foo Bar Bla Blub',
			'{DAV:}owner': 'https://foo/bar/',
			'{DAV:}resourcetype': ['{DAV:}collection'],
			'{DAV:}sync-token': 'https://foo/bar/token/3',
			'{DAV:}current-user-privilege-set': ['{DAV:}write',
				'{DAV:}write-properties', '{DAV:}write-content',
				'{DAV:}unlock', '{DAV:}bind', '{DAV:}unbind',
				'{DAV:}write-acl', '{DAV:}read', '{DAV:}read-acl',
				'{DAV:}read-current-user-privilege-set'],
		};

		const collection = new DavCollection(parent, request, url, props);
		expect(collection.url).toEqual('/foo/bar/folder/')
	});

	it('should check whether two collections are of the same type', () => {
		const request = jasmine.createSpyObj('Request', ['propFind', 'put', 'delete']);

		const collection1 = new DavCollection(null, request, 'a', {
			'{DAV:}displayname': 'Foo Bar Bla Blub col1',
			'{DAV:}owner': 'https://foo/bar/',
			'{DAV:}resourcetype': ['{DAV:}collection', '{test}collection1'],
			'{DAV:}sync-token': 'https://foo/bar/token/3',
		});
		const collection2 = new DavCollection(null, request, 'b', {
			'{DAV:}displayname': 'Foo Bar Bla Blub col1',
			'{DAV:}owner': 'https://foo/bar/',
			'{DAV:}resourcetype': ['{DAV:}collection', '{test}collection1'],
			'{DAV:}sync-token': 'https://foo/bar/token/3',
		});
		const collection3 = new DavCollection(null, request, 'b', {
			'{DAV:}displayname': 'Foo Bar Bla Blub col1',
			'{DAV:}owner': 'https://foo/bar/',
			'{DAV:}resourcetype': ['{DAV:}collection', '{test}collection99'],
			'{DAV:}sync-token': 'https://foo/bar/token/3',
		});
		const collection4 = new DavCollection(null, request, 'b', {
			'{DAV:}displayname': 'Foo Bar Bla Blub col1',
			'{DAV:}owner': 'https://foo/bar/',
			'{DAV:}resourcetype': ['{DAV:}collection'],
			'{DAV:}sync-token': 'https://foo/bar/token/3',
		});


		expect(collection1.isSameCollectionTypeAs(collection2)).toEqual(true);
		expect(collection2.isSameCollectionTypeAs(collection1)).toEqual(true);

		expect(collection1.isSameCollectionTypeAs(collection3)).toEqual(false);
		expect(collection3.isSameCollectionTypeAs(collection1)).toEqual(false);

		expect(collection1.isSameCollectionTypeAs(collection4)).toEqual(false);
		expect(collection4.isSameCollectionTypeAs(collection1)).toEqual(false);
	});

	it('should provide an _updatePropsFromServer method', () => {
		const parent = jasmine.createSpyObj('DavCollection', ['findAll', 'findAllByFilter', 'find',
			'createCollection', 'createObject', 'update', 'delete', 'isReadable', 'isWriteable']);
		const request = jasmine.createSpyObj('Request', ['propFind', 'put', 'delete', 'pathname']);
		const url = '/foo/bar/folder';
		const props = {
			'{DAV:}displayname': 'Foo Bar Bla Blub',
			'{DAV:}owner': 'https://foo/bar/',
			'{DAV:}resourcetype': ['{DAV:}collection'],
			'{DAV:}sync-token': 'https://foo/bar/token/3',
			'{DAV:}current-user-privilege-set': ['{DAV:}write',
				'{DAV:}write-properties', '{DAV:}write-content',
				'{DAV:}unlock', '{DAV:}bind', '{DAV:}unbind',
				'{DAV:}write-acl', '{DAV:}read', '{DAV:}read-acl',
				'{DAV:}read-current-user-privilege-set'],
		};

		const collection = new DavCollection(parent, request, url, props);

		request.propFind.and.callFake(() => {
			return Promise.resolve({
				status: 207,
				body: {
					'{DAV:}displayname': 'Foo Bar Bla Blub updated',
					'{DAV:}owner': 'https://foo/bar/',
					'{DAV:}resourcetype': ['{DAV:}collection'],
					'{DAV:}sync-token': 'https://foo/bar/token/3',
					'{DAV:}current-user-privilege-set': ['{DAV:}write',
						'{DAV:}write-properties', '{DAV:}write-content',
						'{DAV:}unlock', '{DAV:}bind', '{DAV:}unbind',
						'{DAV:}write-acl', '{DAV:}read', '{DAV:}read-acl',
						'{DAV:}read-current-user-privilege-set'],
				},
				xhr: null
			});
		});

		expect(collection.displayname).toEqual('Foo Bar Bla Blub');

		return collection._updatePropsFromServer().then(() => {
			expect(collection.displayname).toEqual('Foo Bar Bla Blub updated');

			expect(request.propFind).toHaveBeenCalledTimes(1);
			expect(request.propFind).toHaveBeenCalledWith('/foo/bar/folder/',
					[['DAV:', 'displayname'], ['DAV:', 'owner'], ['DAV:', 'resourcetype'],
					['DAV:', 'sync-token'], ['DAV:', 'current-user-privilege-set']]);
		});
	});
});
