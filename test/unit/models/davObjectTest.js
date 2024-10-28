/**
 * CDAV Library
 *
 * This library is part of the Nextcloud project
 *
 * SPDX-FileCopyrightText: 2018 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {DavObject} from "../../../src/models/davObject.js";
import DAVEventListener from "../../../src/models/davEventListener.js";
import NetworkRequestClientError from "../../../src/errors/networkRequestClientError.js";

describe('Dav object model', () => {

	it('should inherit from DavEventListener', () => {
		const parent = jasmine.createSpyObj('DavCollection', ['findAll', 'findAllByFilter', 'find',
			'createCollection', 'createObject', 'update', 'delete', 'isReadable', 'isWriteable']);
		const request = jasmine.createSpyObj('Request', ['propFind', 'put', 'delete']);
		const url = '/foo/bar/file';
		const props = {
			'{DAV:}getetag': '"etag foo bar tralala"',
			'{DAV:}getcontenttype': 'text/blub',
			'{DAV:}resourcetype': [],
		};

		const davObject = new DavObject(parent, request, url, props);
		expect(davObject).toEqual(jasmine.any(DAVEventListener));
	});

	it('should fetch complete data', () => {
		const parent = jasmine.createSpyObj('DavCollection', ['findAll', 'findAllByFilter', 'find',
			'createCollection', 'createObject', 'update', 'delete', 'isReadable', 'isWriteable']);
		const request = jasmine.createSpyObj('Request', ['propFind', 'put', 'delete']);
		const url = '/foo/bar/file';
		const props = {
			'{DAV:}getetag': '"etag foo bar tralala"',
			'{DAV:}getcontenttype': 'text/blub',
			'{DAV:}resourcetype': [],
			'{FOO:}bar': 'data1'
		};

		const davObject = new DavObject(parent, request, url, props, true);
		expect(davObject.isPartial()).toEqual(true);
		expect(davObject.isDirty()).toEqual(false);
		expect(davObject._props['{FOO:}bar']).toEqual('data1');

		request.propFind.and.callFake(() => {
			return Promise.resolve({
				body: {
					'{DAV:}getetag': '"new etag foo bar tralala"',
					'{DAV:}getcontenttype': 'text/bla',
					'{DAV:}resourcetype': [],
					'{FOO:}bar': 'data2'
				},
				status: 200,
				xhr: null
			})
		});

		return davObject.fetchCompleteData().then(() => {
			expect(davObject.isPartial()).toEqual(false);
			expect(davObject.isDirty()).toEqual(false);
			expect(davObject.etag).toEqual('"new etag foo bar tralala"');
			expect(davObject.contenttype).toEqual('text/bla');
			expect(davObject._props['{FOO:}bar']).toEqual('data2');

			expect(request.propFind).toHaveBeenCalledTimes(1);
			expect(request.propFind).toHaveBeenCalledWith('/foo/bar/file',
				[['DAV:', 'getcontenttype'], ['DAV:', 'getetag'], ['DAV:', 'resourcetype']], 0);
		}).catch((e) => {
			fail('fetchCompleteData was not supposed to throw error');
		});
	});

	it('should fetch complete data only if data is partial', () => {
		const parent = jasmine.createSpyObj('DavCollection', ['findAll', 'findAllByFilter', 'find',
			'createCollection', 'createObject', 'update', 'delete', 'isReadable', 'isWriteable']);
		const request = jasmine.createSpyObj('Request', ['propFind', 'put', 'delete']);
		const url = '/foo/bar/file';
		const props = {
			'{DAV:}getetag': '"etag foo bar tralala"',
			'{DAV:}getcontenttype': 'text/blub',
			'{DAV:}resourcetype': [],
			'{FOO:}bar': 'data1'
		};

		const davObject = new DavObject(parent, request, url, props, false);
		expect(davObject.isPartial()).toEqual(false);
		expect(davObject.isDirty()).toEqual(false);
		expect(davObject._props['{FOO:}bar']).toEqual('data1');

		request.propFind.and.callFake(() => {
			return Promise.resolve({
				body: {
					'{DAV:}getetag': '"new etag foo bar tralala"',
					'{DAV:}getcontenttype': 'text/bla',
					'{DAV:}resourcetype': [],
					'{FOO:}bar': 'data2'
				},
				status: 200,
				xhr: null
			})
		});

		return davObject.fetchCompleteData().then(() => {
			expect(davObject.isPartial()).toEqual(false);
			expect(davObject.isDirty()).toEqual(false);
			expect(davObject.etag).toEqual('"etag foo bar tralala"');
			expect(davObject.contenttype).toEqual('text/blub');
			expect(davObject._props['{FOO:}bar']).toEqual('data1');

			expect(request.propFind).toHaveBeenCalledTimes(0);
		}).catch((e) => {
			fail('fetchCompleteData was not supposed to throw error');
		});
	});

	it('should fetch complete data if forcing', () => {
		const parent = jasmine.createSpyObj('DavCollection', ['findAll', 'findAllByFilter', 'find',
			'createCollection', 'createObject', 'update', 'delete', 'isReadable', 'isWriteable']);
		const request = jasmine.createSpyObj('Request', ['propFind', 'put', 'delete']);
		const url = '/foo/bar/file';
		const props = {
			'{DAV:}getetag': '"etag foo bar tralala"',
			'{DAV:}getcontenttype': 'text/blub',
			'{DAV:}resourcetype': [],
			'{FOO:}bar': 'data1'
		};

		const davObject = new DavObject(parent, request, url, props, true);
		expect(davObject.isPartial()).toEqual(true);
		expect(davObject.isDirty()).toEqual(false);
		expect(davObject._props['{FOO:}bar']).toEqual('data1');

		request.propFind.and.callFake(() => {
			return Promise.resolve({
				body: {
					'{DAV:}getetag': '"new etag foo bar tralala"',
					'{DAV:}getcontenttype': 'text/bla',
					'{DAV:}resourcetype': [],
					'{FOO:}bar': 'data2'
				},
				status: 200,
				xhr: null
			})
		});

		return davObject.fetchCompleteData(true).then(() => {
			expect(davObject.isPartial()).toEqual(false);
			expect(davObject.isDirty()).toEqual(false);
			expect(davObject.etag).toEqual('"new etag foo bar tralala"');
			expect(davObject.contenttype).toEqual('text/bla');
			expect(davObject._props['{FOO:}bar']).toEqual('data2');

			expect(request.propFind).toHaveBeenCalledTimes(1);
			expect(request.propFind).toHaveBeenCalledWith('/foo/bar/file',
				[['DAV:', 'getcontenttype'], ['DAV:', 'getetag'], ['DAV:', 'resourcetype']], 0);
		}).catch((e) => {
			fail('fetchCompleteData was not supposed to throw error');
		});
	});

	it('should fetch complete data if forcing, even if data is not partial', () => {
		const parent = jasmine.createSpyObj('DavCollection', ['findAll', 'findAllByFilter', 'find',
			'createCollection', 'createObject', 'update', 'delete', 'isReadable', 'isWriteable']);
		const request = jasmine.createSpyObj('Request', ['propFind', 'put', 'delete']);
		const url = '/foo/bar/file';
		const props = {
			'{DAV:}getetag': '"etag foo bar tralala"',
			'{DAV:}getcontenttype': 'text/blub',
			'{DAV:}resourcetype': [],
			'{FOO:}bar': 'data1'
		};

		const davObject = new DavObject(parent, request, url, props, false);
		expect(davObject.isPartial()).toEqual(false);
		expect(davObject.isDirty()).toEqual(false);
		expect(davObject._props['{FOO:}bar']).toEqual('data1');

		request.propFind.and.callFake(() => {
			return Promise.resolve({
				body: {
					'{DAV:}getetag': '"new etag foo bar tralala"',
					'{DAV:}getcontenttype': 'text/bla',
					'{DAV:}resourcetype': [],
					'{FOO:}bar': 'data2'
				},
				status: 200,
				xhr: null
			})
		});

		return davObject.fetchCompleteData(true).then(() => {
			expect(davObject.isPartial()).toEqual(false);
			expect(davObject.isDirty()).toEqual(false);
			expect(davObject.etag).toEqual('"new etag foo bar tralala"');
			expect(davObject.contenttype).toEqual('text/bla');
			expect(davObject._props['{FOO:}bar']).toEqual('data2');

			expect(request.propFind).toHaveBeenCalledTimes(1);
			expect(request.propFind).toHaveBeenCalledWith('/foo/bar/file',
				[['DAV:', 'getcontenttype'], ['DAV:', 'getetag'], ['DAV:', 'resourcetype']], 0);
		}).catch((e) => {
			fail('fetchCompleteData was not supposed to throw error');
		});
	});

	it('should fetch complete data and pass thru rejected Promises', () => {
		const parent = jasmine.createSpyObj('DavCollection', ['findAll', 'findAllByFilter', 'find',
			'createCollection', 'createObject', 'update', 'delete', 'isReadable', 'isWriteable']);
		const request = jasmine.createSpyObj('Request', ['propFind', 'put', 'delete']);
		const url = '/foo/bar/file';
		const props = {
			'{DAV:}getetag': '"etag foo bar tralala"',
			'{DAV:}getcontenttype': 'text/blub',
			'{DAV:}resourcetype': [],
			'{FOO:}bar': 'data1'
		};

		const davObject = new DavObject(parent, request, url, props, true);
		expect(davObject.isPartial()).toEqual(true);
		expect(davObject.isDirty()).toEqual(false);
		expect(davObject._props['{FOO:}bar']).toEqual('data1');

		const error = new Error('Foo Bar');
		request.propFind.and.callFake(() => Promise.reject(error));

		return davObject.fetchCompleteData().then((foo) => {
			fail('fetchCompleteData was not supposed to succeed');
		}).catch((e) => {
			expect(e).toEqual(error);

			expect(davObject.isPartial()).toEqual(true);
			expect(davObject.isDirty()).toEqual(false);
			expect(davObject.etag).toEqual('"etag foo bar tralala"');
			expect(davObject.contenttype).toEqual('text/blub');
			expect(davObject._props['{FOO:}bar']).toEqual('data1');

			expect(request.propFind).toHaveBeenCalledTimes(1);
			expect(request.propFind).toHaveBeenCalledWith('/foo/bar/file',
				[['DAV:', 'getcontenttype'], ['DAV:', 'getetag'], ['DAV:', 'resourcetype']], 0);
		});
	});

	it('should update an object', () => {
		const parent = jasmine.createSpyObj('DavCollection', ['findAll', 'findAllByFilter', 'find',
			'createCollection', 'createObject', 'update', 'delete', 'isReadable', 'isWriteable']);
		const request = jasmine.createSpyObj('Request', ['propFind', 'put', 'delete']);
		const url = '/foo/bar/file';
		const props = {
			'{DAV:}getetag': '"etag foo bar tralala"',
			'{DAV:}getcontenttype': 'text/blub',
			'{DAV:}resourcetype': [],
			'{FOO:}bar': 'data1'
		};

		const davObject = new DavObject(parent, request, url, props, false);
		// DavObject doesnt have it's own data property, so this is kind of a hack:
		davObject.data = 'FooBar';
		davObject._isDirty = true;

		const xhr = jasmine.createSpyObj('XHR', ['getResponseHeader']);
		xhr.getResponseHeader.and.returnValues('"new etag foo bar tralala"');

		request.put.and.callFake(() => {
			return Promise.resolve({
				body: null,
				status: 204,
				xhr: xhr
			});
		});

		return davObject.update().then(() => {
			expect(request.put).toHaveBeenCalledTimes(1);
			expect(request.put).toHaveBeenCalledWith('/foo/bar/file', {'If-Match': '"etag foo bar tralala"', 'Content-Type': 'text/blub; charset=utf-8'}, 'FooBar');

			expect(xhr.getResponseHeader).toHaveBeenCalledTimes(1);
			expect(xhr.getResponseHeader).toHaveBeenCalledWith('etag');

			expect(davObject.etag).toEqual('"new etag foo bar tralala"');
			expect(davObject.isDirty()).toEqual(false);
		});
	});

	it('should not update partial data', () => {
		const parent = jasmine.createSpyObj('DavCollection', ['findAll', 'findAllByFilter', 'find',
			'createCollection', 'createObject', 'update', 'delete', 'isReadable', 'isWriteable']);
		const request = jasmine.createSpyObj('Request', ['propFind', 'put', 'delete']);
		const url = '/foo/bar/file';
		const props = {
			'{DAV:}getetag': '"etag foo bar tralala"',
			'{DAV:}getcontenttype': 'text/blub',
			'{DAV:}resourcetype': [],
			'{FOO:}bar': 'data1'
		};

		const davObject = new DavObject(parent, request, url, props, true);
		// DavObject doesnt have it's own data property, so this is kind of a hack:
		davObject.data = 'FooBar';
		davObject._isDirty = true;

		const xhr = jasmine.createSpyObj('XHR', ['getResponseHeader']);
		xhr.getResponseHeader.and.returnValues('"new etag foo bar tralala"');

		request.put.and.callFake(() => {
			return Promise.resolve({
				body: null,
				status: 204,
				xhr: xhr
			});
		});

		return davObject.update().then(() => {
			expect(request.put).toHaveBeenCalledTimes(0);
			expect(xhr.getResponseHeader).toHaveBeenCalledTimes(0);

			expect(davObject.etag).toEqual('"etag foo bar tralala"');
			expect(davObject.isDirty()).toEqual(true);
		});
	});

	it('should not update unchanged data', () => {
		const parent = jasmine.createSpyObj('DavCollection', ['findAll', 'findAllByFilter', 'find',
			'createCollection', 'createObject', 'update', 'delete', 'isReadable', 'isWriteable']);
		const request = jasmine.createSpyObj('Request', ['propFind', 'put', 'delete']);
		const url = '/foo/bar/file';
		const props = {
			'{DAV:}getetag': '"etag foo bar tralala"',
			'{DAV:}getcontenttype': 'text/blub',
			'{DAV:}resourcetype': [],
			'{FOO:}bar': 'data1'
		};

		const davObject = new DavObject(parent, request, url, props, false);
		// DavObject doesnt have it's own data property, so this is kind of a hack:
		davObject.data = 'FooBar';

		const xhr = jasmine.createSpyObj('XHR', ['getResponseHeader']);
		xhr.getResponseHeader.and.returnValues('"new etag foo bar tralala"');

		request.put.and.callFake(() => {
			return Promise.resolve({
				body: null,
				status: 204,
				xhr: xhr
			});
		});

		return davObject.update().then(() => {
			expect(request.put).toHaveBeenCalledTimes(0);
			expect(xhr.getResponseHeader).toHaveBeenCalledTimes(0);

			expect(davObject.etag).toEqual('"etag foo bar tralala"');
			expect(davObject.isDirty()).toEqual(false);
		});
	});

	it('should not send a null etag', () => {
		const parent = jasmine.createSpyObj('DavCollection', ['findAll', 'findAllByFilter', 'find',
			'createCollection', 'createObject', 'update', 'delete', 'isReadable', 'isWriteable']);
		const request = jasmine.createSpyObj('Request', ['propFind', 'put', 'delete']);
		const url = '/foo/bar/file';
		const props = {
			'{DAV:}getcontenttype': 'text/blub',
			'{DAV:}resourcetype': [],
			'{FOO:}bar': 'data1'
		};

		const davObject = new DavObject(parent, request, url, props, false);
		// DavObject doesnt have it's own data property, so this is kind of a hack:
		davObject.data = 'FooBar';
		davObject._isDirty = true;

		const xhr = jasmine.createSpyObj('XHR', ['getResponseHeader']);
		xhr.getResponseHeader.and.returnValues('"new etag foo bar tralala"');

		request.put.and.callFake(() => {
			return Promise.resolve({
				body: null,
				status: 204,
				xhr: xhr
			});
		});

		return davObject.update().then(() => {
			expect(request.put).toHaveBeenCalledTimes(1);
			expect(request.put).toHaveBeenCalledWith('/foo/bar/file', { 'Content-Type': 'text/blub; charset=utf-8' }, 'FooBar');

			expect(xhr.getResponseHeader).toHaveBeenCalledTimes(1);
			expect(xhr.getResponseHeader).toHaveBeenCalledWith('etag');

			expect(davObject.etag).toEqual('"new etag foo bar tralala"');
			expect(davObject.isDirty()).toEqual(false);
		});
	})

	it('should not update if no data is given', () => {
		const parent = jasmine.createSpyObj('DavCollection', ['findAll', 'findAllByFilter', 'find',
			'createCollection', 'createObject', 'update', 'delete', 'isReadable', 'isWriteable']);
		const request = jasmine.createSpyObj('Request', ['propFind', 'put', 'delete']);
		const url = '/foo/bar/file';
		const props = {
			'{DAV:}getetag': '"etag foo bar tralala"',
			'{DAV:}getcontenttype': 'text/blub',
			'{DAV:}resourcetype': [],
			'{FOO:}bar': 'data1'
		};

		const davObject = new DavObject(parent, request, url, props, false);

		const xhr = jasmine.createSpyObj('XHR', ['getResponseHeader']);
		xhr.getResponseHeader.and.returnValues('"new etag foo bar tralala"');

		request.put.and.callFake(() => {
			return Promise.resolve({
				body: null,
				status: 204,
				xhr: xhr
			});
		});

		return davObject.update().then(() => {
			expect(request.put).toHaveBeenCalledTimes(0);
			expect(xhr.getResponseHeader).toHaveBeenCalledTimes(0);

			expect(davObject.etag).toEqual('"etag foo bar tralala"');
			expect(davObject.isDirty()).toEqual(false);
		});
	});

	it('should update an object and passthru rejected promises', () => {
		const parent = jasmine.createSpyObj('DavCollection', ['findAll', 'findAllByFilter', 'find',
			'createCollection', 'createObject', 'update', 'delete', 'isReadable', 'isWriteable']);
		const request = jasmine.createSpyObj('Request', ['propFind', 'put', 'delete']);
		const url = '/foo/bar/file';
		const props = {
			'{DAV:}getetag': '"etag foo bar tralala"',
			'{DAV:}getcontenttype': 'text/blub',
			'{DAV:}resourcetype': [],
			'{FOO:}bar': 'data1'
		};

		const davObject = new DavObject(parent, request, url, props, false);
		// DavObject doesnt have it's own data property, so this is kind of a hack:
		davObject.data = 'FooBar';
		davObject._isDirty = true;

		const xhr = jasmine.createSpyObj('XHR', ['getResponseHeader']);
		xhr.getResponseHeader.and.returnValues('"new etag foo bar tralala"');

		const error = new Error('Foo Bar');
		request.put.and.callFake(() => Promise.reject(error));

		return davObject.update().then(() => {
			fail('Update was not supposed to succeed');
		}).catch((e) => {
			expect(e).toEqual(error);

			expect(request.put).toHaveBeenCalledTimes(1);
			expect(xhr.getResponseHeader).toHaveBeenCalledTimes(0);

			expect(davObject.etag).toEqual('"etag foo bar tralala"');
			expect(davObject.isDirty()).toEqual(true);
		});
	});

	it('should update an object and passthru rejected promises and set partial on 412', () => {
		const parent = jasmine.createSpyObj('DavCollection', ['findAll', 'findAllByFilter', 'find',
			'createCollection', 'createObject', 'update', 'delete', 'isReadable', 'isWriteable']);
		const request = jasmine.createSpyObj('Request', ['propFind', 'put', 'delete']);
		const url = '/foo/bar/file';
		const props = {
			'{DAV:}getetag': '"etag foo bar tralala"',
			'{DAV:}getcontenttype': 'text/blub',
			'{DAV:}resourcetype': [],
			'{FOO:}bar': 'data1'
		};

		const davObject = new DavObject(parent, request, url, props, false);
		// DavObject doesnt have it's own data property, so this is kind of a hack:
		davObject.data = 'FooBar';
		davObject._isDirty = true;
		davObject._isPartial = false;

		const xhr = jasmine.createSpyObj('XHR', ['getResponseHeader']);
		xhr.getResponseHeader.and.returnValues('"new etag foo bar tralala"');

		const error = new NetworkRequestClientError({status: 412});
		request.put.and.callFake(() => Promise.reject(error));

		return davObject.update().then(() => {
			fail('Update was not supposed to succeed');
		}).catch((e) => {
			expect(e).toEqual(error);

			expect(request.put).toHaveBeenCalledTimes(1);
			expect(xhr.getResponseHeader).toHaveBeenCalledTimes(0);

			expect(davObject.etag).toEqual('"etag foo bar tralala"');
			expect(davObject.isDirty()).toEqual(true);
			expect(davObject.isPartial()).toEqual(true);
		});
	});

	it('should delete an object', () => {
		const parent = jasmine.createSpyObj('DavCollection', ['findAll', 'findAllByFilter', 'find',
			'createCollection', 'createObject', 'update', 'delete', 'isReadable', 'isWriteable']);
		const request = jasmine.createSpyObj('Request', ['propFind', 'put', 'delete']);
		const url = '/foo/bar/file';
		const props = {
			'{DAV:}getetag': '"etag foo bar tralala"',
			'{DAV:}getcontenttype': 'text/blub',
			'{DAV:}resourcetype': [],
			'{FOO:}bar': 'data1'
		};

		const davObject = new DavObject(parent, request, url, props, false);
		expect(davObject.isPartial()).toEqual(false);
		expect(davObject.isDirty()).toEqual(false);
		expect(davObject._props['{FOO:}bar']).toEqual('data1');

		request.delete.and.callFake(() => {
			return Promise.resolve({
				body: null,
				status: 204,
				xhr: null
			});
		});

		return davObject.delete().then(() => {
			expect(request.delete).toHaveBeenCalledTimes(1);
			expect(request.delete).toHaveBeenCalledWith('/foo/bar/file', {});
		}).catch((e) => {
			fail('delete was not supposed to throw error');
		});
	});

	it('should expose the etag as a property', () => {
		const parent = jasmine.createSpyObj('DavCollection', ['findAll', 'findAllByFilter', 'find',
			'createCollection', 'createObject', 'update', 'delete', 'isReadable', 'isWriteable']);
		const request = jasmine.createSpyObj('Request', ['propFind', 'put', 'delete']);
		const url = '/foo/bar/file';
		const props = {
			'{DAV:}getetag': '"etag foo bar tralala"',
			'{DAV:}getcontenttype': 'text/blub',
			'{DAV:}resourcetype': [],
			'{FOO:}bar': 'data1'
		};

		const davObject = new DavObject(parent, request, url, props, false);
		expect(davObject.etag).toEqual('"etag foo bar tralala"');
	});

	it('should expose the content-type as a property', () => {
		const parent = jasmine.createSpyObj('DavCollection', ['findAll', 'findAllByFilter', 'find',
			'createCollection', 'createObject', 'update', 'delete', 'isReadable', 'isWriteable']);
		const request = jasmine.createSpyObj('Request', ['propFind', 'put', 'delete']);
		const url = '/foo/bar/file';
		const props = {
			'{DAV:}getetag': '"etag foo bar tralala"',
			'{DAV:}getcontenttype': 'text/blub',
			'{DAV:}resourcetype': [],
			'{FOO:}bar': 'data1'
		};

		const davObject = new DavObject(parent, request, url, props, false);
		expect(davObject.contenttype).toEqual('text/blub');
	});

	it('should expose the url as a property', () => {
		const parent = jasmine.createSpyObj('DavCollection', ['findAll', 'findAllByFilter', 'find',
			'createCollection', 'createObject', 'update', 'delete', 'isReadable', 'isWriteable']);
		const request = jasmine.createSpyObj('Request', ['propFind', 'put', 'delete']);
		const url = '/foo/bar/file';
		const props = {
			'{DAV:}getetag': '"etag foo bar tralala"',
			'{DAV:}getcontenttype': 'text/blub',
			'{DAV:}resourcetype': [],
			'{FOO:}bar': 'data1'
		};

		const davObject = new DavObject(parent, request, url, props, false);
		expect(davObject.url).toEqual('/foo/bar/file');
	});

	it('should copy a DavObject into a different collection', () => {
		const davCollection1 = jasmine.createSpyObj('DavCollection1', ['findAll', 'findAllByFilter', 'find',
			'createCollection', 'createObject', 'update', 'delete', 'isReadable', 'isWriteable', 'isSameCollectionTypeAs']);
		davCollection1.url = '/foo/bar/';
		const davCollection2 = jasmine.createSpyObj('DavCollection2', ['findAll', 'findAllByFilter', 'find',
			'createCollection', 'createObject', 'update', 'delete', 'isReadable', 'isWriteable']);
		davCollection2.url = '/foo/bla/';
		const request = jasmine.createSpyObj('Request', ['propFind', 'put', 'delete', 'copy']);
		const url = '/foo/bar/file-tri-tra-tralala';
		const props = {
			'{DAV:}getetag': '"etag foo bar"',
			'{DAV:}getcontenttype': 'text/blub',
			'{DAV:}resourcetype': [],
			'{FOO:}bar': 'data1'
		};

		davCollection1.isSameCollectionTypeAs.and.callFake(() => true);
		davCollection2.isWriteable.and.callFake(() => true);
		davCollection2.find.and.callFake(() => 'copied_object');

		const davObject = new DavObject(davCollection1, request, url, props, false);
		return davObject.copy(davCollection2, true).then(() => {
			expect(davCollection1.isSameCollectionTypeAs).toHaveBeenCalledTimes(1);
			expect(davCollection1.isSameCollectionTypeAs).toHaveBeenCalledWith(davCollection2);

			expect(davCollection2.isWriteable).toHaveBeenCalledTimes(1);

			expect(request.copy).toHaveBeenCalledTimes(1);
			expect(request.copy).toHaveBeenCalledWith('/foo/bar/file-tri-tra-tralala', '/foo/bla/file-tri-tra-tralala', 0, true, {});

			expect(davCollection2.find).toHaveBeenCalledTimes(1);
			expect(davCollection2.find).toHaveBeenCalledWith('file-tri-tra-tralala');
		});
	});

	it('should copy a DavObject into a different collection, but not if destination is the same as the current collection', () => {
		const davCollection1 = jasmine.createSpyObj('DavCollection1', ['findAll', 'findAllByFilter', 'find',
			'createCollection', 'createObject', 'update', 'delete', 'isReadable', 'isWriteable', 'isSameCollectionTypeAs']);
		davCollection1.url = '/foo/bar/';
		const request = jasmine.createSpyObj('Request', ['propFind', 'put', 'delete', 'copy']);
		const url = '/foo/bar/file-tri-tra-tralala';
		const props = {
			'{DAV:}getetag': '"etag foo bar"',
			'{DAV:}getcontenttype': 'text/blub',
			'{DAV:}resourcetype': [],
			'{FOO:}bar': 'data1'
		};

		davCollection1.isSameCollectionTypeAs.and.callFake(() => true);

		const davObject = new DavObject(davCollection1, request, url, props, false);
		return davObject.copy(davCollection1, true).then(() => {
			fail('Copy was not supposed to succeed')
		}).catch((e) => {
			expect(e.message).toEqual('Copying an object to the collection it\'s already part of is not supported');
		});
	});

	it('should copy a DavObject into a different collection, but not if destination is of a different collection type', () => {
		const davCollection1 = jasmine.createSpyObj('DavCollection1', ['findAll', 'findAllByFilter', 'find',
			'createCollection', 'createObject', 'update', 'delete', 'isReadable', 'isWriteable', 'isSameCollectionTypeAs']);
		davCollection1.url = '/foo/bar/';
		const davCollection2 = jasmine.createSpyObj('DavCollection2', ['findAll', 'findAllByFilter', 'find',
			'createCollection', 'createObject', 'update', 'delete', 'isReadable', 'isWriteable']);
		davCollection2.url = '/foo/bla/';
		const request = jasmine.createSpyObj('Request', ['propFind', 'put', 'delete', 'copy']);
		const url = '/foo/bar/file-tri-tra-tralala';
		const props = {
			'{DAV:}getetag': '"etag foo bar"',
			'{DAV:}getcontenttype': 'text/blub',
			'{DAV:}resourcetype': [],
			'{FOO:}bar': 'data1'
		};

		davCollection1.isSameCollectionTypeAs.and.callFake(() => false);
		davCollection2.isWriteable.and.callFake(() => true);
		davCollection2.find.and.callFake(() => 'copied_object');

		const davObject = new DavObject(davCollection1, request, url, props, false);
		return davObject.copy(davCollection2, true).then(() => {
			fail('Copy was not supposed to succeed')
		}).catch((e) => {
			expect(e.message).toEqual('Copying an object to a collection of a different type is not supported');
		});
	});

	it('should copy a DavObject into a different collection, but not if destination is read-only', () => {
		const davCollection1 = jasmine.createSpyObj('DavCollection1', ['findAll', 'findAllByFilter', 'find',
			'createCollection', 'createObject', 'update', 'delete', 'isReadable', 'isWriteable', 'isSameCollectionTypeAs']);
		davCollection1.url = '/foo/bar/';
		const davCollection2 = jasmine.createSpyObj('DavCollection2', ['findAll', 'findAllByFilter', 'find',
			'createCollection', 'createObject', 'update', 'delete', 'isReadable', 'isWriteable']);
		davCollection2.url = '/foo/bla/';
		const request = jasmine.createSpyObj('Request', ['propFind', 'put', 'delete', 'copy']);
		const url = '/foo/bar/file-tri-tra-tralala';
		const props = {
			'{DAV:}getetag': '"etag foo bar"',
			'{DAV:}getcontenttype': 'text/blub',
			'{DAV:}resourcetype': [],
			'{FOO:}bar': 'data1'
		};

		davCollection1.isSameCollectionTypeAs.and.callFake(() => true);
		davCollection2.isWriteable.and.callFake(() => false);
		davCollection2.find.and.callFake(() => 'copied_object');

		const davObject = new DavObject(davCollection1, request, url, props, false);
		return davObject.copy(davCollection2, true).then(() => {
			fail('Copy was not supposed to succeed')
		}).catch((e) => {
			expect(e.message).toEqual('Can not copy object into read-only destination collection');
		});
	});

	it('should move a DavObject into a different collection', () => {
		const davCollection1 = jasmine.createSpyObj('DavCollection1', ['findAll', 'findAllByFilter', 'find',
			'createCollection', 'createObject', 'update', 'delete', 'isReadable', 'isWriteable', 'isSameCollectionTypeAs']);
		davCollection1.url = '/foo/bar/';
		const davCollection2 = jasmine.createSpyObj('DavCollection2', ['findAll', 'findAllByFilter', 'find',
			'createCollection', 'createObject', 'update', 'delete', 'isReadable', 'isWriteable']);
		davCollection2.url = '/foo/bla/';
		const request = jasmine.createSpyObj('Request', ['propFind', 'put', 'delete', 'move']);
		const url = '/foo/bar/file-tri-tra-tralala';
		const props = {
			'{DAV:}getetag': '"etag foo bar"',
			'{DAV:}getcontenttype': 'text/blub',
			'{DAV:}resourcetype': [],
			'{FOO:}bar': 'data1'
		};

		davCollection1.isSameCollectionTypeAs.and.callFake(() => true);
		davCollection2.isWriteable.and.callFake(() => true);
		davCollection2.find.and.callFake(() => 'copied_object');

		const davObject = new DavObject(davCollection1, request, url, props, false);
		return davObject.move(davCollection2, true).then(() => {
			expect(davCollection1.isSameCollectionTypeAs).toHaveBeenCalledTimes(1);
			expect(davCollection1.isSameCollectionTypeAs).toHaveBeenCalledWith(davCollection2);

			expect(davCollection2.isWriteable).toHaveBeenCalledTimes(1);

			expect(request.move).toHaveBeenCalledTimes(1);
			expect(request.move).toHaveBeenCalledWith('/foo/bar/file-tri-tra-tralala', '/foo/bla/file-tri-tra-tralala', true, {});

			expect(davCollection2.find).toHaveBeenCalledTimes(0);
			expect(davObject._parent).toEqual(davCollection2);
			expect(davObject.url).toEqual('/foo/bla/file-tri-tra-tralala');
		});
	});

	it('should move a DavObject into a different collection, but not if destination is the same as the current collection', () => {
		const davCollection1 = jasmine.createSpyObj('DavCollection1', ['findAll', 'findAllByFilter', 'find',
			'createCollection', 'createObject', 'update', 'delete', 'isReadable', 'isWriteable', 'isSameCollectionTypeAs']);
		davCollection1.url = '/foo/bar/';
		const request = jasmine.createSpyObj('Request', ['propFind', 'put', 'delete', 'move']);
		const url = '/foo/bar/file-tri-tra-tralala';
		const props = {
			'{DAV:}getetag': '"etag foo bar"',
			'{DAV:}getcontenttype': 'text/blub',
			'{DAV:}resourcetype': [],
			'{FOO:}bar': 'data1'
		};

		davCollection1.isSameCollectionTypeAs.and.callFake(() => true);

		const davObject = new DavObject(davCollection1, request, url, props, false);
		return davObject.move(davCollection1, true).then(() => {
			fail('Copy was not supposed to succeed')
		}).catch((e) => {
			expect(e.message).toEqual('Moving an object to the collection it\'s already part of is not supported');
		});
	});

	it('should move a DavObject into a different collection, but not if destination is of a different collection type', () => {
		const davCollection1 = jasmine.createSpyObj('DavCollection1', ['findAll', 'findAllByFilter', 'find',
			'createCollection', 'createObject', 'update', 'delete', 'isReadable', 'isWriteable', 'isSameCollectionTypeAs']);
		davCollection1.url = '/foo/bar/';
		const davCollection2 = jasmine.createSpyObj('DavCollection2', ['findAll', 'findAllByFilter', 'find',
			'createCollection', 'createObject', 'update', 'delete', 'isReadable', 'isWriteable']);
		davCollection2.url = '/foo/bla/';
		const request = jasmine.createSpyObj('Request', ['propFind', 'put', 'delete', 'move']);
		const url = '/foo/bar/file-tri-tra-tralala';
		const props = {
			'{DAV:}getetag': '"etag foo bar"',
			'{DAV:}getcontenttype': 'text/blub',
			'{DAV:}resourcetype': [],
			'{FOO:}bar': 'data1'
		};

		davCollection1.isSameCollectionTypeAs.and.callFake(() => false);
		davCollection2.isWriteable.and.callFake(() => true);
		davCollection2.find.and.callFake(() => 'copied_object');

		const davObject = new DavObject(davCollection1, request, url, props, false);
		return davObject.move(davCollection2, true).then(() => {
			fail('Copy was not supposed to succeed')
		}).catch((e) => {
			expect(e.message).toEqual('Moving an object to a collection of a different type is not supported');
		});
	});

	it('should move a DavObject into a different collection, but not if destination is read-only', () => {
		const davCollection1 = jasmine.createSpyObj('DavCollection1', ['findAll', 'findAllByFilter', 'find',
			'createCollection', 'createObject', 'update', 'delete', 'isReadable', 'isWriteable', 'isSameCollectionTypeAs']);
		davCollection1.url = '/foo/bar/';
		const davCollection2 = jasmine.createSpyObj('DavCollection2', ['findAll', 'findAllByFilter', 'find',
			'createCollection', 'createObject', 'update', 'delete', 'isReadable', 'isWriteable']);
		davCollection2.url = '/foo/bla/';
		const request = jasmine.createSpyObj('Request', ['propFind', 'put', 'delete', 'move']);
		const url = '/foo/bar/file-tri-tra-tralala';
		const props = {
			'{DAV:}getetag': '"etag foo bar"',
			'{DAV:}getcontenttype': 'text/blub',
			'{DAV:}resourcetype': [],
			'{FOO:}bar': 'data1'
		};

		davCollection1.isSameCollectionTypeAs.and.callFake(() => true);
		davCollection2.isWriteable.and.callFake(() => false);
		davCollection2.find.and.callFake(() => 'copied_object');

		const davObject = new DavObject(davCollection1, request, url, props, false);
		return davObject.move(davCollection2, true).then(() => {
			fail('Copy was not supposed to succeed')
		}).catch((e) => {
			expect(e.message).toEqual('Can not move object into read-only destination collection');
		});
	});
});
