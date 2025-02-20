/**
 * CDAV Library
 *
 * This library is part of the Nextcloud project
 *
 * SPDX-FileCopyrightText: 2018 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { assert, describe, expect, it, vi } from "vitest";

import { DavObject } from "../../../src/models/davObject.js";
import DAVEventListener from "../../../src/models/davEventListener.js";
import NetworkRequestClientError from "../../../src/errors/networkRequestClientError.js";

describe('Dav object model', () => {

	it('should inherit from DavEventListener', () => {
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
		};

		const davObject = new DavObject(parent, request, url, props);
		expect(davObject).toEqual(expect.any(DAVEventListener));
	});

	it('should fetch complete data', () => {
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
			'{FOO:}bar': 'data1'
		};

		const davObject = new DavObject(parent, request, url, props, true);
		expect(davObject.isPartial()).toEqual(true);
		expect(davObject.isDirty()).toEqual(false);
		expect(davObject._props['{FOO:}bar']).toEqual('data1');

		request.propFind.mockImplementation(() => {
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
			assert.fail('fetchCompleteData was not supposed to throw error');
		});
	});

	it('should fetch complete data only if data is partial', () => {
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
			'{FOO:}bar': 'data1'
		};

		const davObject = new DavObject(parent, request, url, props, false);
		expect(davObject.isPartial()).toEqual(false);
		expect(davObject.isDirty()).toEqual(false);
		expect(davObject._props['{FOO:}bar']).toEqual('data1');

		request.propFind.mockImplementation(() => {
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
			assert.fail('fetchCompleteData was not supposed to throw error');
		});
	});

	it('should fetch complete data if forcing', () => {
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
			'{FOO:}bar': 'data1'
		};

		const davObject = new DavObject(parent, request, url, props, true);
		expect(davObject.isPartial()).toEqual(true);
		expect(davObject.isDirty()).toEqual(false);
		expect(davObject._props['{FOO:}bar']).toEqual('data1');

		request.propFind.mockImplementation(() => {
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
			assert.fail('fetchCompleteData was not supposed to throw error');
		});
	});

	it('should fetch complete data if forcing, even if data is not partial', () => {
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
			'{FOO:}bar': 'data1'
		};

		const davObject = new DavObject(parent, request, url, props, false);
		expect(davObject.isPartial()).toEqual(false);
		expect(davObject.isDirty()).toEqual(false);
		expect(davObject._props['{FOO:}bar']).toEqual('data1');

		request.propFind.mockImplementation(() => {
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
			assert.fail('fetchCompleteData was not supposed to throw error');
		});
	});

	it('should fetch complete data and pass thru rejected Promises', () => {
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
			'{FOO:}bar': 'data1'
		};

		const davObject = new DavObject(parent, request, url, props, true);
		expect(davObject.isPartial()).toEqual(true);
		expect(davObject.isDirty()).toEqual(false);
		expect(davObject._props['{FOO:}bar']).toEqual('data1');

		const error = new Error('Foo Bar');
		request.propFind.mockImplementation(() => Promise.reject(error));

		return davObject.fetchCompleteData().then((foo) => {
			assert.fail('fetchCompleteData was not supposed to succeed');
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
			'{FOO:}bar': 'data1'
		};

		const davObject = new DavObject(parent, request, url, props, false);
		// DavObject doesnt have it's own data property, so this is kind of a hack:
		davObject.data = 'FooBar';
		davObject._isDirty = true;

		const xhr = {
            'getResponseHeader': vi.fn()
        };
		xhr.getResponseHeader.mockReturnValueOnce('"new etag foo bar tralala"');

		request.put.mockImplementation(() => {
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
			'{FOO:}bar': 'data1'
		};

		const davObject = new DavObject(parent, request, url, props, true);
		// DavObject doesnt have it's own data property, so this is kind of a hack:
		davObject.data = 'FooBar';
		davObject._isDirty = true;

		const xhr = {
            'getResponseHeader': vi.fn()
        };
		xhr.getResponseHeader.mockReturnValueOnce('"new etag foo bar tralala"');

		request.put.mockImplementation(() => {
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
			'{FOO:}bar': 'data1'
		};

		const davObject = new DavObject(parent, request, url, props, false);
		// DavObject doesnt have it's own data property, so this is kind of a hack:
		davObject.data = 'FooBar';

		const xhr = {
            'getResponseHeader': vi.fn()
        };
		xhr.getResponseHeader.mockReturnValueOnce('"new etag foo bar tralala"');

		request.put.mockImplementation(() => {
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
			'{DAV:}getcontenttype': 'text/blub',
			'{DAV:}resourcetype': [],
			'{FOO:}bar': 'data1'
		};

		const davObject = new DavObject(parent, request, url, props, false);
		// DavObject doesnt have it's own data property, so this is kind of a hack:
		davObject.data = 'FooBar';
		davObject._isDirty = true;

		const xhr = {
            'getResponseHeader': vi.fn()
        };
		xhr.getResponseHeader.mockReturnValueOnce('"new etag foo bar tralala"');

		request.put.mockImplementation(() => {
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
			'{FOO:}bar': 'data1'
		};

		const davObject = new DavObject(parent, request, url, props, false);

		const xhr = {
            'getResponseHeader': vi.fn()
        };
		xhr.getResponseHeader.mockReturnValueOnce('"new etag foo bar tralala"');

		request.put.mockImplementation(() => {
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
			'{FOO:}bar': 'data1'
		};

		const davObject = new DavObject(parent, request, url, props, false);
		// DavObject doesnt have it's own data property, so this is kind of a hack:
		davObject.data = 'FooBar';
		davObject._isDirty = true;

		const xhr = {
            'getResponseHeader': vi.fn()
        };
		xhr.getResponseHeader.mockReturnValueOnce('"new etag foo bar tralala"');

		const error = new Error('Foo Bar');
		request.put.mockImplementation(() => Promise.reject(error));

		return davObject.update().then(() => {
			assert.fail('Update was not supposed to succeed');
		}).catch((e) => {
			expect(e).toEqual(error);

			expect(request.put).toHaveBeenCalledTimes(1);
			expect(xhr.getResponseHeader).toHaveBeenCalledTimes(0);

			expect(davObject.etag).toEqual('"etag foo bar tralala"');
			expect(davObject.isDirty()).toEqual(true);
		});
	});

	it('should update an object and passthru rejected promises and set partial on 412', () => {
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
			'{FOO:}bar': 'data1'
		};

		const davObject = new DavObject(parent, request, url, props, false);
		// DavObject doesnt have it's own data property, so this is kind of a hack:
		davObject.data = 'FooBar';
		davObject._isDirty = true;
		davObject._isPartial = false;

		const xhr = {
            'getResponseHeader': vi.fn()
        };
		xhr.getResponseHeader.mockReturnValueOnce('"new etag foo bar tralala"');

		const error = new NetworkRequestClientError({status: 412});
		request.put.mockImplementation(() => Promise.reject(error));

		return davObject.update().then(() => {
			assert.fail('Update was not supposed to succeed');
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
			'{FOO:}bar': 'data1'
		};

		const davObject = new DavObject(parent, request, url, props, false);
		expect(davObject.isPartial()).toEqual(false);
		expect(davObject.isDirty()).toEqual(false);
		expect(davObject._props['{FOO:}bar']).toEqual('data1');

		request.delete.mockImplementation(() => {
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
			assert.fail('delete was not supposed to throw error');
		});
	});

	it('should expose the etag as a property', () => {
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
			'{FOO:}bar': 'data1'
		};

		const davObject = new DavObject(parent, request, url, props, false);
		expect(davObject.etag).toEqual('"etag foo bar tralala"');
	});

	it('should expose the content-type as a property', () => {
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
			'{FOO:}bar': 'data1'
		};

		const davObject = new DavObject(parent, request, url, props, false);
		expect(davObject.contenttype).toEqual('text/blub');
	});

	it('should expose the url as a property', () => {
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
			'{FOO:}bar': 'data1'
		};

		const davObject = new DavObject(parent, request, url, props, false);
		expect(davObject.url).toEqual('/foo/bar/file');
	});

	it('should copy a DavObject into a different collection', () => {
		const davCollection1 = {
            'findAll': vi.fn(),
            'findAllByFilter': vi.fn(),
            'find': vi.fn(),
            'createCollection': vi.fn(),
            'createObject': vi.fn(),
            'update': vi.fn(),
            'delete': vi.fn(),
            'isReadable': vi.fn(),
            'isWriteable': vi.fn(),
            'isSameCollectionTypeAs': vi.fn()
        };
		davCollection1.url = '/foo/bar/';
		const davCollection2 = {
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
		davCollection2.url = '/foo/bla/';
		const request = {
            'propFind': vi.fn(),
            'put': vi.fn(),
            'delete': vi.fn(),
            'copy': vi.fn()
        };
		const url = '/foo/bar/file-tri-tra-tralala';
		const props = {
			'{DAV:}getetag': '"etag foo bar"',
			'{DAV:}getcontenttype': 'text/blub',
			'{DAV:}resourcetype': [],
			'{FOO:}bar': 'data1'
		};

		davCollection1.isSameCollectionTypeAs.mockImplementation(() => true);
		davCollection2.isWriteable.mockImplementation(() => true);
		davCollection2.find.mockImplementation(() => 'copied_object');

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
		const davCollection1 = {
            'findAll': vi.fn(),
            'findAllByFilter': vi.fn(),
            'find': vi.fn(),
            'createCollection': vi.fn(),
            'createObject': vi.fn(),
            'update': vi.fn(),
            'delete': vi.fn(),
            'isReadable': vi.fn(),
            'isWriteable': vi.fn(),
            'isSameCollectionTypeAs': vi.fn()
        };
		davCollection1.url = '/foo/bar/';
		const request = {
            'propFind': vi.fn(),
            'put': vi.fn(),
            'delete': vi.fn(),
            'copy': vi.fn()
        };
		const url = '/foo/bar/file-tri-tra-tralala';
		const props = {
			'{DAV:}getetag': '"etag foo bar"',
			'{DAV:}getcontenttype': 'text/blub',
			'{DAV:}resourcetype': [],
			'{FOO:}bar': 'data1'
		};

		davCollection1.isSameCollectionTypeAs.mockImplementation(() => true);

		const davObject = new DavObject(davCollection1, request, url, props, false);
		return davObject.copy(davCollection1, true).then(() => {
			assert.fail('Copy was not supposed to succeed')
		}).catch((e) => {
			expect(e.message).toEqual('Copying an object to the collection it\'s already part of is not supported');
		});
	});

	it('should copy a DavObject into a different collection, but not if destination is of a different collection type', () => {
		const davCollection1 = {
            'findAll': vi.fn(),
            'findAllByFilter': vi.fn(),
            'find': vi.fn(),
            'createCollection': vi.fn(),
            'createObject': vi.fn(),
            'update': vi.fn(),
            'delete': vi.fn(),
            'isReadable': vi.fn(),
            'isWriteable': vi.fn(),
            'isSameCollectionTypeAs': vi.fn()
        };
		davCollection1.url = '/foo/bar/';
		const davCollection2 = {
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
		davCollection2.url = '/foo/bla/';
		const request = {
            'propFind': vi.fn(),
            'put': vi.fn(),
            'delete': vi.fn(),
            'copy': vi.fn()
        };
		const url = '/foo/bar/file-tri-tra-tralala';
		const props = {
			'{DAV:}getetag': '"etag foo bar"',
			'{DAV:}getcontenttype': 'text/blub',
			'{DAV:}resourcetype': [],
			'{FOO:}bar': 'data1'
		};

		davCollection1.isSameCollectionTypeAs.mockImplementation(() => false);
		davCollection2.isWriteable.mockImplementation(() => true);
		davCollection2.find.mockImplementation(() => 'copied_object');

		const davObject = new DavObject(davCollection1, request, url, props, false);
		return davObject.copy(davCollection2, true).then(() => {
			assert.fail('Copy was not supposed to succeed')
		}).catch((e) => {
			expect(e.message).toEqual('Copying an object to a collection of a different type is not supported');
		});
	});

	it('should copy a DavObject into a different collection, but not if destination is read-only', () => {
		const davCollection1 = {
            'findAll': vi.fn(),
            'findAllByFilter': vi.fn(),
            'find': vi.fn(),
            'createCollection': vi.fn(),
            'createObject': vi.fn(),
            'update': vi.fn(),
            'delete': vi.fn(),
            'isReadable': vi.fn(),
            'isWriteable': vi.fn(),
            'isSameCollectionTypeAs': vi.fn()
        };
		davCollection1.url = '/foo/bar/';
		const davCollection2 = {
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
		davCollection2.url = '/foo/bla/';
		const request = {
            'propFind': vi.fn(),
            'put': vi.fn(),
            'delete': vi.fn(),
            'copy': vi.fn()
        };
		const url = '/foo/bar/file-tri-tra-tralala';
		const props = {
			'{DAV:}getetag': '"etag foo bar"',
			'{DAV:}getcontenttype': 'text/blub',
			'{DAV:}resourcetype': [],
			'{FOO:}bar': 'data1'
		};

		davCollection1.isSameCollectionTypeAs.mockImplementation(() => true);
		davCollection2.isWriteable.mockImplementation(() => false);
		davCollection2.find.mockImplementation(() => 'copied_object');

		const davObject = new DavObject(davCollection1, request, url, props, false);
		return davObject.copy(davCollection2, true).then(() => {
			assert.fail('Copy was not supposed to succeed')
		}).catch((e) => {
			expect(e.message).toEqual('Can not copy object into read-only destination collection');
		});
	});

	it('should move a DavObject into a different collection', () => {
		const davCollection1 = {
            'findAll': vi.fn(),
            'findAllByFilter': vi.fn(),
            'find': vi.fn(),
            'createCollection': vi.fn(),
            'createObject': vi.fn(),
            'update': vi.fn(),
            'delete': vi.fn(),
            'isReadable': vi.fn(),
            'isWriteable': vi.fn(),
            'isSameCollectionTypeAs': vi.fn()
        };
		davCollection1.url = '/foo/bar/';
		const davCollection2 = {
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
		davCollection2.url = '/foo/bla/';
		const request = {
            'propFind': vi.fn(),
            'put': vi.fn(),
            'delete': vi.fn(),
            'move': vi.fn()
        };
		const url = '/foo/bar/file-tri-tra-tralala';
		const props = {
			'{DAV:}getetag': '"etag foo bar"',
			'{DAV:}getcontenttype': 'text/blub',
			'{DAV:}resourcetype': [],
			'{FOO:}bar': 'data1'
		};

		davCollection1.isSameCollectionTypeAs.mockImplementation(() => true);
		davCollection2.isWriteable.mockImplementation(() => true);
		davCollection2.find.mockImplementation(() => 'copied_object');

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
		const davCollection1 = {
            'findAll': vi.fn(),
            'findAllByFilter': vi.fn(),
            'find': vi.fn(),
            'createCollection': vi.fn(),
            'createObject': vi.fn(),
            'update': vi.fn(),
            'delete': vi.fn(),
            'isReadable': vi.fn(),
            'isWriteable': vi.fn(),
            'isSameCollectionTypeAs': vi.fn()
        };
		davCollection1.url = '/foo/bar/';
		const request = {
            'propFind': vi.fn(),
            'put': vi.fn(),
            'delete': vi.fn(),
            'move': vi.fn()
        };
		const url = '/foo/bar/file-tri-tra-tralala';
		const props = {
			'{DAV:}getetag': '"etag foo bar"',
			'{DAV:}getcontenttype': 'text/blub',
			'{DAV:}resourcetype': [],
			'{FOO:}bar': 'data1'
		};

		davCollection1.isSameCollectionTypeAs.mockImplementation(() => true);

		const davObject = new DavObject(davCollection1, request, url, props, false);
		return davObject.move(davCollection1, true).then(() => {
			assert.fail('Copy was not supposed to succeed')
		}).catch((e) => {
			expect(e.message).toEqual('Moving an object to the collection it\'s already part of is not supported');
		});
	});

	it('should move a DavObject into a different collection, but not if destination is of a different collection type', () => {
		const davCollection1 = {
            'findAll': vi.fn(),
            'findAllByFilter': vi.fn(),
            'find': vi.fn(),
            'createCollection': vi.fn(),
            'createObject': vi.fn(),
            'update': vi.fn(),
            'delete': vi.fn(),
            'isReadable': vi.fn(),
            'isWriteable': vi.fn(),
            'isSameCollectionTypeAs': vi.fn()
        };
		davCollection1.url = '/foo/bar/';
		const davCollection2 = {
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
		davCollection2.url = '/foo/bla/';
		const request = {
            'propFind': vi.fn(),
            'put': vi.fn(),
            'delete': vi.fn(),
            'move': vi.fn()
        };
		const url = '/foo/bar/file-tri-tra-tralala';
		const props = {
			'{DAV:}getetag': '"etag foo bar"',
			'{DAV:}getcontenttype': 'text/blub',
			'{DAV:}resourcetype': [],
			'{FOO:}bar': 'data1'
		};

		davCollection1.isSameCollectionTypeAs.mockImplementation(() => false);
		davCollection2.isWriteable.mockImplementation(() => true);
		davCollection2.find.mockImplementation(() => 'copied_object');

		const davObject = new DavObject(davCollection1, request, url, props, false);
		return davObject.move(davCollection2, true).then(() => {
			assert.fail('Copy was not supposed to succeed')
		}).catch((e) => {
			expect(e.message).toEqual('Moving an object to a collection of a different type is not supported');
		});
	});

	it('should move a DavObject into a different collection, but not if destination is read-only', () => {
		const davCollection1 = {
            'findAll': vi.fn(),
            'findAllByFilter': vi.fn(),
            'find': vi.fn(),
            'createCollection': vi.fn(),
            'createObject': vi.fn(),
            'update': vi.fn(),
            'delete': vi.fn(),
            'isReadable': vi.fn(),
            'isWriteable': vi.fn(),
            'isSameCollectionTypeAs': vi.fn()
        };
		davCollection1.url = '/foo/bar/';
		const davCollection2 = {
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
		davCollection2.url = '/foo/bla/';
		const request = {
            'propFind': vi.fn(),
            'put': vi.fn(),
            'delete': vi.fn(),
            'move': vi.fn()
        };
		const url = '/foo/bar/file-tri-tra-tralala';
		const props = {
			'{DAV:}getetag': '"etag foo bar"',
			'{DAV:}getcontenttype': 'text/blub',
			'{DAV:}resourcetype': [],
			'{FOO:}bar': 'data1'
		};

		davCollection1.isSameCollectionTypeAs.mockImplementation(() => true);
		davCollection2.isWriteable.mockImplementation(() => false);
		davCollection2.find.mockImplementation(() => 'copied_object');

		const davObject = new DavObject(davCollection1, request, url, props, false);
		return davObject.move(davCollection2, true).then(() => {
			assert.fail('Copy was not supposed to succeed')
		}).catch((e) => {
			expect(e.message).toEqual('Can not move object into read-only destination collection');
		});
	});
});
