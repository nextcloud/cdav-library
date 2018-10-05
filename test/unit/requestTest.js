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
 * You to.be have received a copy of the GNU Affero General Public
 * License along with this library.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

import Request from "../../src/request.js";
import * as XMLUtility from '../../src/utility/xmlUtility.js';
import NetworkRequestAbortedError from "../../src/errors/networkRequestAbortedError.js";
import NetworkRequestError from "../../src/errors/networkRequestError.js";
import NetworkRequestServerError from "../../src/errors/networkRequestServerError.js";
import NetworkRequestClientError from "../../src/errors/networkRequestClientError.js";
import NetworkRequestHttpError from "../../src/errors/networkRequestHttpError.js";

describe('Request', () => {

	beforeEach(() => {
		XMLUtility.resetPrefixMap();
	});

	it ('should send GET requests', () => {
		const xhr = jasmine.createSpyObj('xhrObject', ['open', 'setRequestHeader', 'send']);
		const xhrProvider = jasmine.createSpy('xhrProvider').and.callFake(() => xhr);
		const parser = jasmine.createSpyObj('parserObject', ['canParse', 'parse']);

		const request = new Request('https://nextcloud.testing/nextcloud/remote.php/dav/', parser, xhrProvider);
		const promise = request.get('fooBar', {
			'Foo': 'Bar',
			'Bla': 'Blub'
		});

		expect(xhrProvider).toHaveBeenCalledTimes(1);
		expect(xhr.open).toHaveBeenCalledTimes(1);
		expect(xhr.open).toHaveBeenCalledWith('GET', 'https://nextcloud.testing/nextcloud/remote.php/dav/fooBar', true);

		expect(xhr.setRequestHeader).toHaveBeenCalledTimes(4);
		expect(xhr.setRequestHeader).toHaveBeenCalledWith('Depth', '0');
		expect(xhr.setRequestHeader).toHaveBeenCalledWith('Content-Type', 'application/xml; charset=utf-8');
		expect(xhr.setRequestHeader).toHaveBeenCalledWith('Foo', 'Bar');
		expect(xhr.setRequestHeader).toHaveBeenCalledWith('Bla', 'Blub');

		expect(xhr.send).toHaveBeenCalledTimes(1);
		expect(xhr.send).toHaveBeenCalledWith();

		xhr.readyState = 3;
		xhr.onreadystatechange();

		xhr.readyState = 4;
		xhr.status = 234;
		xhr.response = 567;
		xhr.onreadystatechange();

		return promise.then((res) => {
			expect(res).toEqual({
				body: 567,
				status: 234,
				xhr: xhr
			});
		}).catch(() => {
			fail('Promise was not supposed to fail');
		});
	});

	it ('should send PATCH requests', () => {
		const xhr = jasmine.createSpyObj('xhrObject', ['open', 'setRequestHeader', 'send']);
		const xhrProvider = jasmine.createSpy('xhrProvider').and.callFake(() => xhr);
		const parser = jasmine.createSpyObj('parserObject', ['canParse', 'parse']);

		const request = new Request('https://nextcloud.testing/nextcloud/remote.php/dav/', parser, xhrProvider);
		const promise = request.patch('fooBar', {
			'Foo': 'Bar',
			'Bla': 'Blub'
		}, '123456');

		expect(xhrProvider).toHaveBeenCalledTimes(1);
		expect(xhr.open).toHaveBeenCalledTimes(1);
		expect(xhr.open).toHaveBeenCalledWith('PATCH', 'https://nextcloud.testing/nextcloud/remote.php/dav/fooBar', true);

		expect(xhr.setRequestHeader).toHaveBeenCalledTimes(4);
		expect(xhr.setRequestHeader).toHaveBeenCalledWith('Depth', '0');
		expect(xhr.setRequestHeader).toHaveBeenCalledWith('Content-Type', 'application/xml; charset=utf-8');
		expect(xhr.setRequestHeader).toHaveBeenCalledWith('Foo', 'Bar');
		expect(xhr.setRequestHeader).toHaveBeenCalledWith('Bla', 'Blub');

		expect(xhr.send).toHaveBeenCalledTimes(1);
		expect(xhr.send).toHaveBeenCalledWith('123456');

		xhr.readyState = 4;
		xhr.status = 234;
		xhr.response = 567;
		xhr.onreadystatechange();

		return promise.then((res) => {
			expect(res).toEqual({
				body: 567,
				status: 234,
				xhr: xhr
			});
		}).catch(() => {
			fail('Promise was not supposed to fail');
		});
	});

	it ('should send POST requests', () => {
		const xhr = jasmine.createSpyObj('xhrObject', ['open', 'setRequestHeader', 'send']);
		const xhrProvider = jasmine.createSpy('xhrProvider').and.callFake(() => xhr);
		const parser = jasmine.createSpyObj('parserObject', ['canParse', 'parse']);

		const request = new Request('https://nextcloud.testing/nextcloud/remote.php/dav/', parser, xhrProvider);
		const promise = request.post('fooBar', {
			'Foo': 'Bar',
			'Bla': 'Blub'
		}, '123456');

		expect(xhrProvider).toHaveBeenCalledTimes(1);
		expect(xhr.open).toHaveBeenCalledTimes(1);
		expect(xhr.open).toHaveBeenCalledWith('POST', 'https://nextcloud.testing/nextcloud/remote.php/dav/fooBar', true);

		expect(xhr.setRequestHeader).toHaveBeenCalledTimes(4);
		expect(xhr.setRequestHeader).toHaveBeenCalledWith('Depth', '0');
		expect(xhr.setRequestHeader).toHaveBeenCalledWith('Content-Type', 'application/xml; charset=utf-8');
		expect(xhr.setRequestHeader).toHaveBeenCalledWith('Foo', 'Bar');
		expect(xhr.setRequestHeader).toHaveBeenCalledWith('Bla', 'Blub');

		expect(xhr.send).toHaveBeenCalledTimes(1);
		expect(xhr.send).toHaveBeenCalledWith('123456');

		xhr.readyState = 4;
		xhr.status = 234;
		xhr.response = 567;
		xhr.onreadystatechange();

		return promise.then((res) => {
			expect(res).toEqual({
				body: 567,
				status: 234,
				xhr: xhr
			});
		}).catch(() => {
			fail('Promise was not supposed to fail');
		});
	});

	it ('should send PUT requests', () => {
		const xhr = jasmine.createSpyObj('xhrObject', ['open', 'setRequestHeader', 'send']);
		const xhrProvider = jasmine.createSpy('xhrProvider').and.callFake(() => xhr);
		const parser = jasmine.createSpyObj('parserObject', ['canParse', 'parse']);

		const request = new Request('https://nextcloud.testing/nextcloud/remote.php/dav/', parser, xhrProvider);
		const promise = request.put('fooBar', {
			'Foo': 'Bar',
			'Bla': 'Blub'
		}, '123456');

		expect(xhrProvider).toHaveBeenCalledTimes(1);
		expect(xhr.open).toHaveBeenCalledTimes(1);
		expect(xhr.open).toHaveBeenCalledWith('PUT', 'https://nextcloud.testing/nextcloud/remote.php/dav/fooBar', true);

		expect(xhr.setRequestHeader).toHaveBeenCalledTimes(4);
		expect(xhr.setRequestHeader).toHaveBeenCalledWith('Depth', '0');
		expect(xhr.setRequestHeader).toHaveBeenCalledWith('Content-Type', 'application/xml; charset=utf-8');
		expect(xhr.setRequestHeader).toHaveBeenCalledWith('Foo', 'Bar');
		expect(xhr.setRequestHeader).toHaveBeenCalledWith('Bla', 'Blub');

		expect(xhr.send).toHaveBeenCalledTimes(1);
		expect(xhr.send).toHaveBeenCalledWith('123456');

		xhr.readyState = 4;
		xhr.status = 234;
		xhr.response = 567;
		xhr.onreadystatechange();

		return promise.then((res) => {
			expect(res).toEqual({
				body: 567,
				status: 234,
				xhr: xhr
			});
		}).catch(() => {
			fail('Promise was not supposed to fail');
		});
	});

	it ('should send DELETE requests', () => {
		const xhr = jasmine.createSpyObj('xhrObject', ['open', 'setRequestHeader', 'send']);
		const xhrProvider = jasmine.createSpy('xhrProvider').and.callFake(() => xhr);
		const parser = jasmine.createSpyObj('parserObject', ['canParse', 'parse']);

		const request = new Request('https://nextcloud.testing/nextcloud/remote.php/dav/', parser, xhrProvider);
		const promise = request.delete('fooBar');

		expect(xhrProvider).toHaveBeenCalledTimes(1);
		expect(xhr.open).toHaveBeenCalledTimes(1);
		expect(xhr.open).toHaveBeenCalledWith('DELETE', 'https://nextcloud.testing/nextcloud/remote.php/dav/fooBar', true);

		expect(xhr.setRequestHeader).toHaveBeenCalledTimes(2);
		expect(xhr.setRequestHeader).toHaveBeenCalledWith('Depth', '0');
		expect(xhr.setRequestHeader).toHaveBeenCalledWith('Content-Type', 'application/xml; charset=utf-8');

		expect(xhr.send).toHaveBeenCalledTimes(1);
		expect(xhr.send).toHaveBeenCalledWith();

		xhr.readyState = 4;
		xhr.status = 234;
		xhr.response = 567;
		xhr.onreadystatechange();

		return promise.then((res) => {
			expect(res).toEqual({
				body: 567,
				status: 234,
				xhr: xhr
			});
		}).catch(() => {
			fail('Promise was not supposed to fail');
		});
	});

	it ('should send COPY requests', () => {
		const xhr = jasmine.createSpyObj('xhrObject', ['open', 'setRequestHeader', 'send']);
		const xhrProvider = jasmine.createSpy('xhrProvider').and.callFake(() => xhr);
		const parser = jasmine.createSpyObj('parserObject', ['canParse', 'parse']);

		const request = new Request('https://nextcloud.testing/nextcloud/remote.php/dav/', parser, xhrProvider);
		const promise = request.copy('fooBar', 'barFoo', 'Infinity', true);

		expect(xhrProvider).toHaveBeenCalledTimes(1);
		expect(xhr.open).toHaveBeenCalledTimes(1);
		expect(xhr.open).toHaveBeenCalledWith('COPY', 'https://nextcloud.testing/nextcloud/remote.php/dav/fooBar', true);

		expect(xhr.setRequestHeader).toHaveBeenCalledTimes(4);
		expect(xhr.setRequestHeader).toHaveBeenCalledWith('Depth', 'Infinity');
		expect(xhr.setRequestHeader).toHaveBeenCalledWith('Destination', 'barFoo');
		expect(xhr.setRequestHeader).toHaveBeenCalledWith('Overwrite', 'T');
		expect(xhr.setRequestHeader).toHaveBeenCalledWith('Content-Type', 'application/xml; charset=utf-8');

		expect(xhr.send).toHaveBeenCalledTimes(1);
		expect(xhr.send).toHaveBeenCalledWith();

		xhr.readyState = 4;
		xhr.status = 234;
		xhr.response = 567;
		xhr.onreadystatechange();

		return promise.then((res) => {
			expect(res).toEqual({
				body: 567,
				status: 234,
				xhr: xhr
			});
		}).catch(() => {
			fail('Promise was not supposed to fail');
		});
	});

	it ('should send MOVE requests', () => {
		const xhr = jasmine.createSpyObj('xhrObject', ['open', 'setRequestHeader', 'send']);
		const xhrProvider = jasmine.createSpy('xhrProvider').and.callFake(() => xhr);
		const parser = jasmine.createSpyObj('parserObject', ['canParse', 'parse']);

		const request = new Request('https://nextcloud.testing/nextcloud/remote.php/dav/', parser, xhrProvider);
		const promise = request.move('fooBar', 'barFoo');

		expect(xhrProvider).toHaveBeenCalledTimes(1);
		expect(xhr.open).toHaveBeenCalledTimes(1);
		expect(xhr.open).toHaveBeenCalledWith('MOVE', 'https://nextcloud.testing/nextcloud/remote.php/dav/fooBar', true);

		expect(xhr.setRequestHeader).toHaveBeenCalledTimes(4);
		expect(xhr.setRequestHeader).toHaveBeenCalledWith('Depth', 'Infinity');
		expect(xhr.setRequestHeader).toHaveBeenCalledWith('Destination', 'barFoo');
		expect(xhr.setRequestHeader).toHaveBeenCalledWith('Overwrite', 'F');
		expect(xhr.setRequestHeader).toHaveBeenCalledWith('Content-Type', 'application/xml; charset=utf-8');

		expect(xhr.send).toHaveBeenCalledTimes(1);
		expect(xhr.send).toHaveBeenCalledWith();

		xhr.readyState = 4;
		xhr.status = 234;
		xhr.response = 567;
		xhr.onreadystatechange();

		return promise.then((res) => {
			expect(res).toEqual({
				body: 567,
				status: 234,
				xhr: xhr
			});
		}).catch(() => {
			fail('Promise was not supposed to fail');
		});
	});

	it ('should send LOCK requests', () => {
		const xhr = jasmine.createSpyObj('xhrObject', ['open', 'setRequestHeader', 'send']);
		const xhrProvider = jasmine.createSpy('xhrProvider').and.callFake(() => xhr);
		const parser = jasmine.createSpyObj('parserObject', ['canParse', 'parse']);

		const request = new Request('https://nextcloud.testing/nextcloud/remote.php/dav/', parser, xhrProvider);
		const promise = request.lock('fooBar');

		expect(xhrProvider).toHaveBeenCalledTimes(1);
		expect(xhr.open).toHaveBeenCalledTimes(1);
		expect(xhr.open).toHaveBeenCalledWith('LOCK', 'https://nextcloud.testing/nextcloud/remote.php/dav/fooBar', true);

		expect(xhr.setRequestHeader).toHaveBeenCalledTimes(2);
		expect(xhr.setRequestHeader).toHaveBeenCalledWith('Depth', '0');
		expect(xhr.setRequestHeader).toHaveBeenCalledWith('Content-Type', 'application/xml; charset=utf-8');

		expect(xhr.send).toHaveBeenCalledTimes(1);
		expect(xhr.send).toHaveBeenCalledWith();

		xhr.readyState = 4;
		xhr.status = 234;
		xhr.response = 567;
		xhr.onreadystatechange();

		return promise.then((res) => {
			expect(res).toEqual({
				body: 567,
				status: 234,
				xhr: xhr
			});
		}).catch(() => {
			fail('Promise was not supposed to fail');
		});
	});

	it ('should send UNLOCK requests', () => {
		const xhr = jasmine.createSpyObj('xhrObject', ['open', 'setRequestHeader', 'send']);
		const xhrProvider = jasmine.createSpy('xhrProvider').and.callFake(() => xhr);
		const parser = jasmine.createSpyObj('parserObject', ['canParse', 'parse']);

		const request = new Request('https://nextcloud.testing/nextcloud/remote.php/dav/', parser, xhrProvider);
		const promise = request.unlock('fooBar');

		expect(xhrProvider).toHaveBeenCalledTimes(1);
		expect(xhr.open).toHaveBeenCalledTimes(1);
		expect(xhr.open).toHaveBeenCalledWith('UNLOCK', 'https://nextcloud.testing/nextcloud/remote.php/dav/fooBar', true);

		expect(xhr.setRequestHeader).toHaveBeenCalledTimes(2);
		expect(xhr.setRequestHeader).toHaveBeenCalledWith('Depth', '0');
		expect(xhr.setRequestHeader).toHaveBeenCalledWith('Content-Type', 'application/xml; charset=utf-8');

		expect(xhr.send).toHaveBeenCalledTimes(1);
		expect(xhr.send).toHaveBeenCalledWith();

		xhr.readyState = 4;
		xhr.status = 234;
		xhr.response = 567;
		xhr.onreadystatechange();

		return promise.then((res) => {
			expect(res).toEqual({
				body: 567,
				status: 234,
				xhr: xhr
			});
		}).catch(() => {
			fail('Promise was not supposed to fail');
		});
	});

	it ('should send PROPFIND requests', () => {
		const xhr = jasmine.createSpyObj('xhrObject', ['open', 'setRequestHeader', 'send']);
		const xhrProvider = jasmine.createSpy('xhrProvider').and.callFake(() => xhr);
		const parser = jasmine.createSpyObj('parserObject', ['canParse', 'parse']);

		const request = new Request('https://nextcloud.testing/nextcloud/remote.php/dav/', parser, xhrProvider);
		const promise = request.propFind('fooBar', [['NS1', 'local1'], ['NS2', 'local2']], 1);

		expect(xhrProvider).toHaveBeenCalledTimes(1);
		expect(xhr.open).toHaveBeenCalledTimes(1);
		expect(xhr.open).toHaveBeenCalledWith('PROPFIND', 'https://nextcloud.testing/nextcloud/remote.php/dav/fooBar', true);

		expect(xhr.setRequestHeader).toHaveBeenCalledTimes(2);
		expect(xhr.setRequestHeader).toHaveBeenCalledWith('Depth', 1);
		expect(xhr.setRequestHeader).toHaveBeenCalledWith('Content-Type', 'application/xml; charset=utf-8');

		expect(xhr.send).toHaveBeenCalledTimes(1);
		expect(xhr.send).toHaveBeenCalledWith('<x0:propfind xmlns:x0="DAV:"><x0:prop><x1:local1 xmlns:x1="NS1"/><x2:local2 xmlns:x2="NS2"/></x0:prop></x0:propfind>');

		xhr.readyState = 4;
		xhr.status = 234;
		xhr.response = 567;
		xhr.onreadystatechange();

		return promise.then((res) => {
			expect(res).toEqual({
				body: 567,
				status: 234,
				xhr: xhr
			});
		}).catch(() => {
			fail('Promise was not supposed to fail');
		});
	});

	it ('should send PROPPATCH requests', () => {
		const xhr = jasmine.createSpyObj('xhrObject', ['open', 'setRequestHeader', 'send']);
		const xhrProvider = jasmine.createSpy('xhrProvider').and.callFake(() => xhr);
		const parser = jasmine.createSpyObj('parserObject', ['canParse', 'parse']);

		const request = new Request('https://nextcloud.testing/nextcloud/remote.php/dav/', parser, xhrProvider);
		const promise = request.propPatch('fooBar', {
			'Foo': 'Bar',
			'Bla': 'Blub'
		}, '123456');

		expect(xhrProvider).toHaveBeenCalledTimes(1);
		expect(xhr.open).toHaveBeenCalledTimes(1);
		expect(xhr.open).toHaveBeenCalledWith('PROPPATCH', 'https://nextcloud.testing/nextcloud/remote.php/dav/fooBar', true);

		expect(xhr.setRequestHeader).toHaveBeenCalledTimes(4);
		expect(xhr.setRequestHeader).toHaveBeenCalledWith('Depth', '0');
		expect(xhr.setRequestHeader).toHaveBeenCalledWith('Content-Type', 'application/xml; charset=utf-8');
		expect(xhr.setRequestHeader).toHaveBeenCalledWith('Foo', 'Bar');
		expect(xhr.setRequestHeader).toHaveBeenCalledWith('Bla', 'Blub');

		expect(xhr.send).toHaveBeenCalledTimes(1);
		expect(xhr.send).toHaveBeenCalledWith('123456');

		xhr.readyState = 4;
		xhr.status = 234;
		xhr.response = 567;
		xhr.onreadystatechange();

		return promise.then((res) => {
			expect(res).toEqual({
				body: 567,
				status: 234,
				xhr: xhr
			});
		}).catch(() => {
			fail('Promise was not supposed to fail');
		});
	});

	it ('should send MKCOL requests', () => {
		const xhr = jasmine.createSpyObj('xhrObject', ['open', 'setRequestHeader', 'send']);
		const xhrProvider = jasmine.createSpy('xhrProvider').and.callFake(() => xhr);
		const parser = jasmine.createSpyObj('parserObject', ['canParse', 'parse']);

		const request = new Request('https://nextcloud.testing/nextcloud/remote.php/dav/', parser, xhrProvider);
		const promise = request.mkCol('fooBar', {
			'Foo': 'Bar',
			'Bla': 'Blub'
		}, '123456');

		expect(xhrProvider).toHaveBeenCalledTimes(1);
		expect(xhr.open).toHaveBeenCalledTimes(1);
		expect(xhr.open).toHaveBeenCalledWith('MKCOL', 'https://nextcloud.testing/nextcloud/remote.php/dav/fooBar', true);

		expect(xhr.setRequestHeader).toHaveBeenCalledTimes(4);
		expect(xhr.setRequestHeader).toHaveBeenCalledWith('Depth', '0');
		expect(xhr.setRequestHeader).toHaveBeenCalledWith('Content-Type', 'application/xml; charset=utf-8');
		expect(xhr.setRequestHeader).toHaveBeenCalledWith('Foo', 'Bar');
		expect(xhr.setRequestHeader).toHaveBeenCalledWith('Bla', 'Blub');

		expect(xhr.send).toHaveBeenCalledTimes(1);
		expect(xhr.send).toHaveBeenCalledWith('123456');

		xhr.readyState = 4;
		xhr.status = 234;
		xhr.response = 567;
		xhr.onreadystatechange();

		return promise.then((res) => {
			expect(res).toEqual({
				body: 567,
				status: 234,
				xhr: xhr
			});
		}).catch(() => {
			fail('Promise was not supposed to fail');
		});
	});

	it ('should send REPORT requests', () => {
		const xhr = jasmine.createSpyObj('xhrObject', ['open', 'setRequestHeader', 'send']);
		const xhrProvider = jasmine.createSpy('xhrProvider').and.callFake(() => xhr);
		const parser = jasmine.createSpyObj('parserObject', ['canParse', 'parse']);

		const request = new Request('https://nextcloud.testing/nextcloud/remote.php/dav/', parser, xhrProvider);
		const promise = request.report('fooBar', {
			'Foo': 'Bar',
			'Bla': 'Blub'
		}, '123456');

		expect(xhrProvider).toHaveBeenCalledTimes(1);
		expect(xhr.open).toHaveBeenCalledTimes(1);
		expect(xhr.open).toHaveBeenCalledWith('REPORT', 'https://nextcloud.testing/nextcloud/remote.php/dav/fooBar', true);

		expect(xhr.setRequestHeader).toHaveBeenCalledTimes(4);
		expect(xhr.setRequestHeader).toHaveBeenCalledWith('Depth', '0');
		expect(xhr.setRequestHeader).toHaveBeenCalledWith('Content-Type', 'application/xml; charset=utf-8');
		expect(xhr.setRequestHeader).toHaveBeenCalledWith('Foo', 'Bar');
		expect(xhr.setRequestHeader).toHaveBeenCalledWith('Bla', 'Blub');

		expect(xhr.send).toHaveBeenCalledTimes(1);
		expect(xhr.send).toHaveBeenCalledWith('123456');

		xhr.readyState = 4;
		xhr.status = 234;
		xhr.response = 567;
		xhr.onreadystatechange();

		return promise.then((res) => {
			expect(res).toEqual({
				body: 567,
				status: 234,
				xhr: xhr
			});
		}).catch(() => {
			fail('Promise was not supposed to fail');
		});
	});

	it ('should send generic requests', () => {
		const xhr = jasmine.createSpyObj('xhrObject', ['open', 'setRequestHeader', 'send']);
		const xhrProvider = jasmine.createSpy('xhrProvider').and.callFake(() => xhr);
		const parser = jasmine.createSpyObj('parserObject', ['canParse', 'parse']);

		const request = new Request('https://nextcloud.testing/nextcloud/remote.php/dav/', parser, xhrProvider);
		const promise = request.request('METHOD123', 'fooBar', {
			'Foo': 'Bar',
			'Bla': 'Blub'
		});

		expect(xhrProvider).toHaveBeenCalledTimes(1);
		expect(xhr.open).toHaveBeenCalledTimes(1);
		expect(xhr.open).toHaveBeenCalledWith('METHOD123', 'https://nextcloud.testing/nextcloud/remote.php/dav/fooBar', true);

		expect(xhr.setRequestHeader).toHaveBeenCalledTimes(4);
		expect(xhr.setRequestHeader).toHaveBeenCalledWith('Depth', '0');
		expect(xhr.setRequestHeader).toHaveBeenCalledWith('Content-Type', 'application/xml; charset=utf-8');
		expect(xhr.setRequestHeader).toHaveBeenCalledWith('Foo', 'Bar');
		expect(xhr.setRequestHeader).toHaveBeenCalledWith('Bla', 'Blub');

		expect(xhr.send).toHaveBeenCalledTimes(1);
		expect(xhr.send).toHaveBeenCalledWith();

		xhr.readyState = 4;
		xhr.status = 234;
		xhr.response = 567;
		xhr.onreadystatechange();

		return promise.then((res) => {
			expect(res).toEqual({
				body: 567,
				status: 234,
				xhr: xhr
			});
		}).catch(() => {
			fail('Promise was not supposed to fail');
		});
	});

	it ('should reject the promise on abort', () => {
		const xhr = jasmine.createSpyObj('xhrObject', ['open', 'setRequestHeader', 'send']);
		const xhrProvider = jasmine.createSpy('xhrProvider').and.callFake(() => xhr);
		const parser = jasmine.createSpyObj('parserObject', ['canParse', 'parse']);

		const request = new Request('https://nextcloud.testing/nextcloud/remote.php/dav/', parser, xhrProvider);
		const promise = request.get('fooBar');

		expect(xhrProvider).toHaveBeenCalledTimes(1);
		expect(xhr.open).toHaveBeenCalledTimes(1);
		expect(xhr.open).toHaveBeenCalledWith('GET', 'https://nextcloud.testing/nextcloud/remote.php/dav/fooBar', true);

		expect(xhr.setRequestHeader).toHaveBeenCalledTimes(2);
		expect(xhr.setRequestHeader).toHaveBeenCalledWith('Depth', '0');
		expect(xhr.setRequestHeader).toHaveBeenCalledWith('Content-Type', 'application/xml; charset=utf-8');

		expect(xhr.send).toHaveBeenCalledTimes(1);
		expect(xhr.send).toHaveBeenCalledWith();

		xhr.readyState = 4;
		xhr.status = 234;
		xhr.response = 567;
		xhr.onabort();

		return promise.then(() => {
			fail('Promise was not supposed to succeed');
		}).catch((res) => {
			expect(res).toEqual(jasmine.any(NetworkRequestAbortedError));
			expect(res.attach).toEqual({
				body: null,
				status: -1,
				xhr: xhr
			});
		});
	});

	it ('should reject the promise on error', () => {
		const xhr = jasmine.createSpyObj('xhrObject', ['open', 'setRequestHeader', 'send']);
		const xhrProvider = jasmine.createSpy('xhrProvider').and.callFake(() => xhr);
		const parser = jasmine.createSpyObj('parserObject', ['canParse', 'parse']);

		const request = new Request('https://nextcloud.testing/nextcloud/remote.php/dav/', parser, xhrProvider);
		const promise = request.get('fooBar');

		expect(xhrProvider).toHaveBeenCalledTimes(1);
		expect(xhr.open).toHaveBeenCalledTimes(1);
		expect(xhr.open).toHaveBeenCalledWith('GET', 'https://nextcloud.testing/nextcloud/remote.php/dav/fooBar', true);

		expect(xhr.setRequestHeader).toHaveBeenCalledTimes(2);
		expect(xhr.setRequestHeader).toHaveBeenCalledWith('Depth', '0');
		expect(xhr.setRequestHeader).toHaveBeenCalledWith('Content-Type', 'application/xml; charset=utf-8');

		expect(xhr.send).toHaveBeenCalledTimes(1);
		expect(xhr.send).toHaveBeenCalledWith();

		xhr.readyState = 4;
		xhr.status = 234;
		xhr.response = 567;
		xhr.onerror();

		return promise.then(() => {
			fail('Promise was not supposed to succeed');
		}).catch((res) => {
			expect(res).toEqual(jasmine.any(NetworkRequestError));
			expect(res.attach).toEqual({
				body: null,
				status: -1,
				xhr: xhr
			});
		});
	});

	it ('should reject the promise on HTTP 5xx', () => {
		const xhr = jasmine.createSpyObj('xhrObject', ['open', 'setRequestHeader', 'send']);
		const xhrProvider = jasmine.createSpy('xhrProvider').and.callFake(() => xhr);
		const parser = jasmine.createSpyObj('parserObject', ['canParse', 'parse']);

		const request = new Request('https://nextcloud.testing/nextcloud/remote.php/dav/', parser, xhrProvider);
		const promise = request.get('fooBar');

		expect(xhrProvider).toHaveBeenCalledTimes(1);
		expect(xhr.open).toHaveBeenCalledTimes(1);
		expect(xhr.open).toHaveBeenCalledWith('GET', 'https://nextcloud.testing/nextcloud/remote.php/dav/fooBar', true);

		expect(xhr.setRequestHeader).toHaveBeenCalledTimes(2);
		expect(xhr.setRequestHeader).toHaveBeenCalledWith('Depth', '0');
		expect(xhr.setRequestHeader).toHaveBeenCalledWith('Content-Type', 'application/xml; charset=utf-8');

		expect(xhr.send).toHaveBeenCalledTimes(1);
		expect(xhr.send).toHaveBeenCalledWith();

		xhr.readyState = 4;
		xhr.status = 503;
		xhr.response = 567;
		xhr.onreadystatechange();

		return promise.then(() => {
			fail('Promise was not supposed to succeed');
		}).catch((res) => {
			expect(res).toEqual(jasmine.any(NetworkRequestServerError));
			expect(res.attach).toEqual({
				body: 567,
				status: 503,
				xhr: xhr
			});
		});
	});

	it ('should reject the promise on HTTP 4xx', () => {
		const xhr = jasmine.createSpyObj('xhrObject', ['open', 'setRequestHeader', 'send']);
		const xhrProvider = jasmine.createSpy('xhrProvider').and.callFake(() => xhr);
		const parser = jasmine.createSpyObj('parserObject', ['canParse', 'parse']);

		const request = new Request('https://nextcloud.testing/nextcloud/remote.php/dav/', parser, xhrProvider);
		const promise = request.get('fooBar');

		expect(xhrProvider).toHaveBeenCalledTimes(1);
		expect(xhr.open).toHaveBeenCalledTimes(1);
		expect(xhr.open).toHaveBeenCalledWith('GET', 'https://nextcloud.testing/nextcloud/remote.php/dav/fooBar', true);

		expect(xhr.setRequestHeader).toHaveBeenCalledTimes(2);
		expect(xhr.setRequestHeader).toHaveBeenCalledWith('Depth', '0');
		expect(xhr.setRequestHeader).toHaveBeenCalledWith('Content-Type', 'application/xml; charset=utf-8');

		expect(xhr.send).toHaveBeenCalledTimes(1);
		expect(xhr.send).toHaveBeenCalledWith();

		xhr.readyState = 4;
		xhr.status = 403;
		xhr.response = 567;
		xhr.onreadystatechange();

		return promise.then(() => {
			fail('Promise was not supposed to succeed');
		}).catch((res) => {
			expect(res).toEqual(jasmine.any(NetworkRequestClientError));
			expect(res.attach).toEqual({
				body: 567,
				status: 403,
				xhr: xhr
			});
		});
	});

	it ('should reject the promise for unsuccessful HTTP requests', () => {
		const xhr = jasmine.createSpyObj('xhrObject', ['open', 'setRequestHeader', 'send']);
		const xhrProvider = jasmine.createSpy('xhrProvider').and.callFake(() => xhr);
		const parser = jasmine.createSpyObj('parserObject', ['canParse', 'parse']);

		const request = new Request('https://nextcloud.testing/nextcloud/remote.php/dav/', parser, xhrProvider);
		const promise = request.get('fooBar');

		expect(xhrProvider).toHaveBeenCalledTimes(1);
		expect(xhr.open).toHaveBeenCalledTimes(1);
		expect(xhr.open).toHaveBeenCalledWith('GET', 'https://nextcloud.testing/nextcloud/remote.php/dav/fooBar', true);

		expect(xhr.setRequestHeader).toHaveBeenCalledTimes(2);
		expect(xhr.setRequestHeader).toHaveBeenCalledWith('Depth', '0');
		expect(xhr.setRequestHeader).toHaveBeenCalledWith('Content-Type', 'application/xml; charset=utf-8');

		expect(xhr.send).toHaveBeenCalledTimes(1);
		expect(xhr.send).toHaveBeenCalledWith();

		xhr.readyState = 4;
		xhr.status = 666;
		xhr.response = 567;
		xhr.onreadystatechange();

		return promise.then(() => {
			fail('Promise was not supposed to succeed');
		}).catch((res) => {
			expect(res).toEqual(jasmine.any(NetworkRequestHttpError));
			expect(res.attach).toEqual({
				body: 567,
				status: 666,
				xhr: xhr
			});
		});
	});

	it ('should properly handle multistatus responses - Depth 0', () => {
		const xhr = jasmine.createSpyObj('xhrObject', ['open', 'setRequestHeader', 'send']);
		const xhrProvider = jasmine.createSpy('xhrProvider').and.callFake(() => xhr);
		const parser = jasmine.createSpyObj('parserObject', ['canParse', 'parse']);

		parser.canParse.and.returnValues(true, false, true);
		parser.parse.and.returnValues('value1', 'value2');

		const request = new Request('https://nextcloud.testing/nextcloud/remote.php/dav/', parser, xhrProvider);
		const promise = request.get('fooBar');

		expect(xhrProvider).toHaveBeenCalledTimes(1);
		expect(xhr.open).toHaveBeenCalledTimes(1);
		expect(xhr.open).toHaveBeenCalledWith('GET', 'https://nextcloud.testing/nextcloud/remote.php/dav/fooBar', true);

		expect(xhr.setRequestHeader).toHaveBeenCalledTimes(2);
		expect(xhr.setRequestHeader).toHaveBeenCalledWith('Depth', '0');
		expect(xhr.setRequestHeader).toHaveBeenCalledWith('Content-Type', 'application/xml; charset=utf-8');

		expect(xhr.send).toHaveBeenCalledTimes(1);
		expect(xhr.send).toHaveBeenCalledWith();

		xhr.readyState = 4;
		xhr.status = 207;
		xhr.response = `<?xml version="1.0"?>
<d:multistatus xmlns:d="DAV:" xmlns:s="http://sabredav.org/ns" xmlns:cal="urn:ietf:params:xml:ns:caldav"
               xmlns:cs="http://calendarserver.org/ns/" xmlns:oc="http://owncloud.org/ns"
               xmlns:nc="http://nextcloud.org/ns">
    <d:response>
        <d:href>/nextcloud/remote.php/dav/calendars/admin/</d:href>
        <d:propstat>
            <d:prop>
                <d:owner>
                    <d:href>/nextcloud/remote.php/dav/principals/users/admin/</d:href>
                </d:owner>
                <d:resourcetype>
                    <d:collection/>
                </d:resourcetype>
                <d:current-user-privilege-set>
                    <d:privilege>
                        <d:write/>
                    </d:privilege>
                    <d:privilege>
                        <d:write-properties/>
                    </d:privilege>
                    <d:privilege>
                        <d:write-content/>
                    </d:privilege>
                    <d:privilege>
                        <d:unlock/>
                    </d:privilege>
                    <d:privilege>
                        <d:bind/>
                    </d:privilege>
                    <d:privilege>
                        <d:unbind/>
                    </d:privilege>
                    <d:privilege>
                        <d:write-acl/>
                    </d:privilege>
                    <d:privilege>
                        <d:read/>
                    </d:privilege>
                    <d:privilege>
                        <d:read-acl/>
                    </d:privilege>
                    <d:privilege>
                        <d:read-current-user-privilege-set/>
                    </d:privilege>
                </d:current-user-privilege-set>
            </d:prop>
            <d:status>HTTP/1.1 200 OK</d:status>
        </d:propstat>
        <d:propstat>
            <d:prop>
                <d:displayname/>
                <d:sync-token/>
                <oc:invite/>
                <cs:allowed-sharing-modes/>
                <cs:publish-url/>
                <x1:calendar-order xmlns:x1="http://apple.com/ns/ical/"/>
                <x1:calendar-color xmlns:x1="http://apple.com/ns/ical/"/>
                <cs:getctag/>
                <cs:source/>
                <cal:calendar-description/>
                <cal:calendar-timezone/>
                <cal:supported-calendar-component-set/>
                <cal:supported-calendar-data/>
                <cal:max-resource-size/>
                <cal:min-date-time/>
                <cal:max-date-time/>
                <cal:max-instances/>
                <cal:max-attendees-per-instance/>
                <cal:supported-collation-set/>
                <cal:calendar-free-busy-set/>
                <cal:schedule-calendar-transp/>
                <cal:schedule-default-calendar-URL/>
                <oc:calendar-enabled/>
                <x2:owner-displayname xmlns:x2="http://nextcloud.com/ns"/>
            </d:prop>
            <d:status>HTTP/1.1 404 Not Found</d:status>
        </d:propstat>
    </d:response>
</d:multistatus>
`;
		xhr.onreadystatechange();

		expect(parser.canParse).toHaveBeenCalledTimes(3);
		expect(parser.canParse).toHaveBeenCalledWith('{DAV:}owner');
		expect(parser.canParse).toHaveBeenCalledWith('{DAV:}resourcetype');
		expect(parser.canParse).toHaveBeenCalledWith('{DAV:}current-user-privilege-set');

		expect(parser.parse).toHaveBeenCalledTimes(2);
		expect(parser.parse).toHaveBeenCalledWith(jasmine.any(Document), jasmine.any(Node), jasmine.any(Function));
		expect(parser.parse).toHaveBeenCalledWith(jasmine.any(Document), jasmine.any(Node), jasmine.any(Function));

		return promise.then((res) => {
			expect(res).toEqual({
				body: {
					'{DAV:}owner': 'value1',
					'{DAV:}current-user-privilege-set': 'value2'
				},
				status: 207,
				xhr: xhr
			});
		}).catch(() => {
			fail('Promise was not supposed to fail');
		});
	});

	it ('should properly handle multistatus responses - Depth 1', () => {
		const xhr = jasmine.createSpyObj('xhrObject', ['open', 'setRequestHeader', 'send']);
		const xhrProvider = jasmine.createSpy('xhrProvider').and.callFake(() => xhr);
		const parser = jasmine.createSpyObj('parserObject', ['canParse', 'parse']);

		parser.canParse.and.returnValues(true, true, false,
			true, true, true, true, true, true, true, true, true, true,
			true, true, true, true, true, true, true, true, true, true);
		parser.parse.and.returnValues('value1', 'value2',
			'value3', 'value4', 'value5', 'value6', 'value7',
			'value8', 'value9', 'value10', 'value11', 'value12',
			'value13', 'value14', 'value15', 'value16', 'value17',
			'value18', 'value19', 'value20', 'value21', 'value22');

		const request = new Request('https://nextcloud.testing/nextcloud/remote.php/dav/', parser, xhrProvider);
		const promise = request.get('fooBar', { 'Depth': 1 });

		expect(xhrProvider).toHaveBeenCalledTimes(1);
		expect(xhr.open).toHaveBeenCalledTimes(1);
		expect(xhr.open).toHaveBeenCalledWith('GET', 'https://nextcloud.testing/nextcloud/remote.php/dav/fooBar', true);

		expect(xhr.setRequestHeader).toHaveBeenCalledTimes(2);
		expect(xhr.setRequestHeader).toHaveBeenCalledWith('Depth', 1);
		expect(xhr.setRequestHeader).toHaveBeenCalledWith('Content-Type', 'application/xml; charset=utf-8');

		expect(xhr.send).toHaveBeenCalledTimes(1);
		expect(xhr.send).toHaveBeenCalledWith();

		xhr.readyState = 4;
		xhr.status = 207;
		xhr.response = `<?xml version="1.0"?>
<d:multistatus xmlns:d="DAV:" xmlns:s="http://sabredav.org/ns" xmlns:cal="urn:ietf:params:xml:ns:caldav"
               xmlns:cs="http://calendarserver.org/ns/" xmlns:oc="http://owncloud.org/ns"
               xmlns:nc="http://nextcloud.org/ns">
    <d:response>
        <d:href>/nextcloud/remote.php/dav/calendars/admin/</d:href>
        <d:propstat>
            <d:prop>
                <d:owner>
                    <d:href>/nextcloud/remote.php/dav/principals/users/admin/</d:href>
                </d:owner>
                <d:resourcetype>
                    <d:collection/>
                </d:resourcetype>
                <d:current-user-privilege-set>
                    <d:privilege>
                        <d:write/>
                    </d:privilege>
                    <d:privilege>
                        <d:write-properties/>
                    </d:privilege>
                    <d:privilege>
                        <d:write-content/>
                    </d:privilege>
                    <d:privilege>
                        <d:unlock/>
                    </d:privilege>
                    <d:privilege>
                        <d:bind/>
                    </d:privilege>
                    <d:privilege>
                        <d:unbind/>
                    </d:privilege>
                    <d:privilege>
                        <d:write-acl/>
                    </d:privilege>
                    <d:privilege>
                        <d:read/>
                    </d:privilege>
                    <d:privilege>
                        <d:read-acl/>
                    </d:privilege>
                    <d:privilege>
                        <d:read-current-user-privilege-set/>
                    </d:privilege>
                </d:current-user-privilege-set>
            </d:prop>
            <d:status>HTTP/1.1 200 OK</d:status>
        </d:propstat>
        <d:propstat>
            <d:prop>
                <d:displayname/>
                <d:sync-token/>
                <oc:invite/>
                <cs:allowed-sharing-modes/>
                <cs:publish-url/>
                <x1:calendar-order xmlns:x1="http://apple.com/ns/ical/"/>
                <x1:calendar-color xmlns:x1="http://apple.com/ns/ical/"/>
                <cs:getctag/>
                <cs:source/>
                <cal:calendar-description/>
                <cal:calendar-timezone/>
                <cal:supported-calendar-component-set/>
                <cal:supported-calendar-data/>
                <cal:max-resource-size/>
                <cal:min-date-time/>
                <cal:max-date-time/>
                <cal:max-instances/>
                <cal:max-attendees-per-instance/>
                <cal:supported-collation-set/>
                <cal:calendar-free-busy-set/>
                <cal:schedule-calendar-transp/>
                <cal:schedule-default-calendar-URL/>
                <oc:calendar-enabled/>
                <x2:owner-displayname xmlns:x2="http://nextcloud.com/ns"/>
            </d:prop>
            <d:status>HTTP/1.1 404 Not Found</d:status>
        </d:propstat>
    </d:response>
    <d:response>
        <d:href>/nextcloud/remote.php/dav/calendars/admin/personal/</d:href>
        <d:propstat>
            <d:prop>
                <d:displayname>Personal</d:displayname>
                <d:owner>
                    <d:href>/nextcloud/remote.php/dav/principals/users/admin/</d:href>
                </d:owner>
                <d:resourcetype>
                    <d:collection/>
                    <cal:calendar/>
                </d:resourcetype>
                <d:sync-token>http://sabre.io/ns/sync/17</d:sync-token>
                <d:current-user-privilege-set>
                    <d:privilege>
                        <d:write/>
                    </d:privilege>
                    <d:privilege>
                        <d:write-properties/>
                    </d:privilege>
                    <d:privilege>
                        <d:write-content/>
                    </d:privilege>
                    <d:privilege>
                        <d:unlock/>
                    </d:privilege>
                    <d:privilege>
                        <d:bind/>
                    </d:privilege>
                    <d:privilege>
                        <d:unbind/>
                    </d:privilege>
                    <d:privilege>
                        <d:write-acl/>
                    </d:privilege>
                    <d:privilege>
                        <d:read/>
                    </d:privilege>
                    <d:privilege>
                        <d:read-acl/>
                    </d:privilege>
                    <d:privilege>
                        <d:read-current-user-privilege-set/>
                    </d:privilege>
                    <d:privilege>
                        <cal:read-free-busy/>
                    </d:privilege>
                </d:current-user-privilege-set>
                <oc:invite>
                    <oc:user>
                        <d:href>principal:principals/users/admin</d:href>
                        <oc:common-name>admin</oc:common-name>
                        <oc:invite-accepted/>
                        <oc:access>
                            <oc:read-write/>
                        </oc:access>
                    </oc:user>
                    <oc:user>
                        <d:href>principal:principals/groups/admin</d:href>
                        <oc:invite-accepted/>
                        <oc:access>
                            <oc:read-write/>
                        </oc:access>
                    </oc:user>
                </oc:invite>
                <cs:allowed-sharing-modes>
                    <cs:can-be-shared/>
                    <cs:can-be-published/>
                </cs:allowed-sharing-modes>
                <cs:publish-url>
                    <d:href>http://all.local/nextcloud/remote.php/dav/public-calendars/Fnn4DyyW6fidF3Y8</d:href>
                </cs:publish-url>
                <x1:calendar-order xmlns:x1="http://apple.com/ns/ical/">2</x1:calendar-order>
                <x1:calendar-color xmlns:x1="http://apple.com/ns/ical/">#F64F00FF</x1:calendar-color>
                <cs:getctag>http://sabre.io/ns/sync/17</cs:getctag>
                <cal:calendar-timezone>BEGIN:VCALENDAR&#13;
                    VERSION:2.0&#13;
                    PRODID:-//Apple Inc.//Mac OS X 10.13.6//EN&#13;
                    CALSCALE:GREGORIAN&#13;
                    BEGIN:VTIMEZONE&#13;
                    TZID:Europe/Berlin&#13;
                    BEGIN:DAYLIGHT&#13;
                    TZOFFSETFROM:+0100&#13;
                    RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU&#13;
                    DTSTART:19810329T020000&#13;
                    TZNAME:CEST&#13;
                    TZOFFSETTO:+0200&#13;
                    END:DAYLIGHT&#13;
                    BEGIN:STANDARD&#13;
                    TZOFFSETFROM:+0200&#13;
                    RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU&#13;
                    DTSTART:19961027T030000&#13;
                    TZNAME:CET&#13;
                    TZOFFSETTO:+0100&#13;
                    END:STANDARD&#13;
                    END:VTIMEZONE&#13;
                    END:VCALENDAR&#13;
                </cal:calendar-timezone>
                <cal:supported-calendar-component-set>
                    <cal:comp name="VEVENT"/>
                    <cal:comp name="VTODO"/>
                </cal:supported-calendar-component-set>
                <cal:supported-calendar-data>
                    <cal:calendar-data content-type="text/calendar" version="2.0"/>
                    <cal:calendar-data content-type="application/calendar+json"/>
                </cal:supported-calendar-data>
                <cal:max-resource-size>10000000</cal:max-resource-size>
                <cal:supported-collation-set>
                    <cal:supported-collation>i;ascii-casemap</cal:supported-collation>
                    <cal:supported-collation>i;octet</cal:supported-collation>
                    <cal:supported-collation>i;unicode-casemap</cal:supported-collation>
                </cal:supported-collation-set>
                <cal:schedule-calendar-transp>
                    <cal:opaque/>
                </cal:schedule-calendar-transp>
                <oc:calendar-enabled>1</oc:calendar-enabled>
                <x2:owner-displayname xmlns:x2="http://nextcloud.com/ns">admin</x2:owner-displayname>
            </d:prop>
            <d:status>HTTP/1.1 200 OK</d:status>
        </d:propstat>
        <d:propstat>
            <d:prop>
                <cs:source/>
                <cal:calendar-description/>
                <cal:min-date-time/>
                <cal:max-date-time/>
                <cal:max-instances/>
                <cal:max-attendees-per-instance/>
                <cal:calendar-free-busy-set/>
                <cal:schedule-default-calendar-URL/>
            </d:prop>
            <d:status>HTTP/1.1 404 Not Found</d:status>
        </d:propstat>
    </d:response>
</d:multistatus>
`;
		xhr.onreadystatechange();


		expect(parser.canParse).toHaveBeenCalledTimes(22);
		expect(parser.canParse).toHaveBeenCalledWith('{DAV:}owner');
		expect(parser.canParse).toHaveBeenCalledWith('{DAV:}resourcetype');
		expect(parser.canParse).toHaveBeenCalledWith('{DAV:}current-user-privilege-set');
		expect(parser.canParse).toHaveBeenCalledWith('{DAV:}displayname');
		expect(parser.canParse).toHaveBeenCalledWith('{DAV:}owner');
		expect(parser.canParse).toHaveBeenCalledWith('{DAV:}resourcetype');
		expect(parser.canParse).toHaveBeenCalledWith('{DAV:}sync-token');
		expect(parser.canParse).toHaveBeenCalledWith('{DAV:}current-user-privilege-set');
		expect(parser.canParse).toHaveBeenCalledWith('{http://owncloud.org/ns}invite');
		expect(parser.canParse).toHaveBeenCalledWith('{http://calendarserver.org/ns/}allowed-sharing-modes');
		expect(parser.canParse).toHaveBeenCalledWith('{http://calendarserver.org/ns/}publish-url');
		expect(parser.canParse).toHaveBeenCalledWith('{http://apple.com/ns/ical/}calendar-order');
		expect(parser.canParse).toHaveBeenCalledWith('{http://apple.com/ns/ical/}calendar-color');
		expect(parser.canParse).toHaveBeenCalledWith('{http://calendarserver.org/ns/}getctag');
		expect(parser.canParse).toHaveBeenCalledWith('{urn:ietf:params:xml:ns:caldav}calendar-timezone');
		expect(parser.canParse).toHaveBeenCalledWith('{urn:ietf:params:xml:ns:caldav}supported-calendar-component-set');
		expect(parser.canParse).toHaveBeenCalledWith('{urn:ietf:params:xml:ns:caldav}supported-calendar-data');
		expect(parser.canParse).toHaveBeenCalledWith('{urn:ietf:params:xml:ns:caldav}max-resource-size');
		expect(parser.canParse).toHaveBeenCalledWith('{urn:ietf:params:xml:ns:caldav}supported-collation-set');
		expect(parser.canParse).toHaveBeenCalledWith('{urn:ietf:params:xml:ns:caldav}schedule-calendar-transp');
		expect(parser.canParse).toHaveBeenCalledWith('{http://owncloud.org/ns}calendar-enabled');
		expect(parser.canParse).toHaveBeenCalledWith('{http://nextcloud.com/ns}owner-displayname');

		expect(parser.parse).toHaveBeenCalledTimes(21);
		expect(parser.parse).toHaveBeenCalledWith(jasmine.any(Document), jasmine.any(Node), jasmine.any(Function));
		expect(parser.parse).toHaveBeenCalledWith(jasmine.any(Document), jasmine.any(Node), jasmine.any(Function));
		expect(parser.parse).toHaveBeenCalledWith(jasmine.any(Document), jasmine.any(Node), jasmine.any(Function));
		expect(parser.parse).toHaveBeenCalledWith(jasmine.any(Document), jasmine.any(Node), jasmine.any(Function));
		expect(parser.parse).toHaveBeenCalledWith(jasmine.any(Document), jasmine.any(Node), jasmine.any(Function));
		expect(parser.parse).toHaveBeenCalledWith(jasmine.any(Document), jasmine.any(Node), jasmine.any(Function));
		expect(parser.parse).toHaveBeenCalledWith(jasmine.any(Document), jasmine.any(Node), jasmine.any(Function));
		expect(parser.parse).toHaveBeenCalledWith(jasmine.any(Document), jasmine.any(Node), jasmine.any(Function));
		expect(parser.parse).toHaveBeenCalledWith(jasmine.any(Document), jasmine.any(Node), jasmine.any(Function));
		expect(parser.parse).toHaveBeenCalledWith(jasmine.any(Document), jasmine.any(Node), jasmine.any(Function));
		expect(parser.parse).toHaveBeenCalledWith(jasmine.any(Document), jasmine.any(Node), jasmine.any(Function));
		expect(parser.parse).toHaveBeenCalledWith(jasmine.any(Document), jasmine.any(Node), jasmine.any(Function));
		expect(parser.parse).toHaveBeenCalledWith(jasmine.any(Document), jasmine.any(Node), jasmine.any(Function));
		expect(parser.parse).toHaveBeenCalledWith(jasmine.any(Document), jasmine.any(Node), jasmine.any(Function));
		expect(parser.parse).toHaveBeenCalledWith(jasmine.any(Document), jasmine.any(Node), jasmine.any(Function));
		expect(parser.parse).toHaveBeenCalledWith(jasmine.any(Document), jasmine.any(Node), jasmine.any(Function));
		expect(parser.parse).toHaveBeenCalledWith(jasmine.any(Document), jasmine.any(Node), jasmine.any(Function));
		expect(parser.parse).toHaveBeenCalledWith(jasmine.any(Document), jasmine.any(Node), jasmine.any(Function));
		expect(parser.parse).toHaveBeenCalledWith(jasmine.any(Document), jasmine.any(Node), jasmine.any(Function));
		expect(parser.parse).toHaveBeenCalledWith(jasmine.any(Document), jasmine.any(Node), jasmine.any(Function));
		expect(parser.parse).toHaveBeenCalledWith(jasmine.any(Document), jasmine.any(Node), jasmine.any(Function));

		return promise.then((res) => {
			expect(res).toEqual({
				body: {
					'/nextcloud/remote.php/dav/calendars/admin/': {
						'{DAV:}owner': 'value1',
						'{DAV:}resourcetype': 'value2'
					},
					'/nextcloud/remote.php/dav/calendars/admin/personal/': {
						'{DAV:}displayname': 'value3',
						'{DAV:}owner': 'value4',
						'{DAV:}resourcetype': 'value5',
						'{DAV:}sync-token': 'value6',
						'{DAV:}current-user-privilege-set': 'value7',
						'{http://owncloud.org/ns}invite': 'value8',
						'{http://calendarserver.org/ns/}allowed-sharing-modes': 'value9',
						'{http://calendarserver.org/ns/}publish-url': 'value10',
						'{http://apple.com/ns/ical/}calendar-order': 'value11',
						'{http://apple.com/ns/ical/}calendar-color': 'value12',
						'{http://calendarserver.org/ns/}getctag': 'value13',
						'{urn:ietf:params:xml:ns:caldav}calendar-timezone': 'value14',
						'{urn:ietf:params:xml:ns:caldav}supported-calendar-component-set': 'value15',
						'{urn:ietf:params:xml:ns:caldav}supported-calendar-data': 'value16',
						'{urn:ietf:params:xml:ns:caldav}max-resource-size': 'value17',
						'{urn:ietf:params:xml:ns:caldav}supported-collation-set': 'value18',
						'{urn:ietf:params:xml:ns:caldav}schedule-calendar-transp': 'value19',
						'{http://owncloud.org/ns}calendar-enabled': 'value20',
						'{http://nextcloud.com/ns}owner-displayname': 'value21',
					}
				},
				status: 207,
				xhr: xhr
			});
		}).catch(() => {
			fail('Promise was not supposed to fail');
		});
	});

	it ('should call the before request handler', () => {
		const xhr = jasmine.createSpyObj('xhrObject', ['open', 'setRequestHeader', 'send']);
		const xhrProvider = jasmine.createSpy('xhrProvider').and.callFake(() => xhr);
		const parser = jasmine.createSpyObj('parserObject', ['canParse', 'parse']);
		const beforeRequestHandler = jasmine.createSpy('beforeRequestHandler');

		const request = new Request('https://nextcloud.testing/nextcloud/remote.php/dav/', parser, xhrProvider);
		const promise = request.get('fooBar', {}, null, beforeRequestHandler);

		expect(xhrProvider).toHaveBeenCalledTimes(1);
		expect(xhr.open).toHaveBeenCalledTimes(1);
		expect(xhr.open).toHaveBeenCalledWith('GET', 'https://nextcloud.testing/nextcloud/remote.php/dav/fooBar', true);

		expect(xhr.setRequestHeader).toHaveBeenCalledTimes(2);
		expect(xhr.setRequestHeader).toHaveBeenCalledWith('Depth', '0');
		expect(xhr.setRequestHeader).toHaveBeenCalledWith('Content-Type', 'application/xml; charset=utf-8');

		expect(beforeRequestHandler).toHaveBeenCalledTimes(1);
		expect(beforeRequestHandler).toHaveBeenCalledWith(xhr);
		expect(xhr.send).toHaveBeenCalledTimes(1);
		expect(xhr.send).toHaveBeenCalledWith();

		xhr.readyState = 4;
		xhr.status = 200;
		xhr.response = 567;
		xhr.onreadystatechange();

		return promise.then((res) => {
			expect(res).toEqual({
				body: 567,
				status: 200,
				xhr: xhr
			});

			// make sure it wasn't called again
			expect(beforeRequestHandler).toHaveBeenCalledTimes(1);
			expect(beforeRequestHandler).toHaveBeenCalledWith(xhr);
		}).catch(() => {
			fail('Promise was not supposed to fail');
		});
	});

	it ('should call the after request handler', () => {
		const xhr = jasmine.createSpyObj('xhrObject', ['open', 'setRequestHeader', 'send']);
		const xhrProvider = jasmine.createSpy('xhrProvider').and.callFake(() => xhr);
		const parser = jasmine.createSpyObj('parserObject', ['canParse', 'parse']);
		const afterRequestHandler = jasmine.createSpy('afterRequestHandler');

		const request = new Request('https://nextcloud.testing/nextcloud/remote.php/dav/', parser, xhrProvider);
		const promise = request.get('fooBar', {}, null, () => null, afterRequestHandler);

		expect(xhrProvider).toHaveBeenCalledTimes(1);
		expect(xhr.open).toHaveBeenCalledTimes(1);
		expect(xhr.open).toHaveBeenCalledWith('GET', 'https://nextcloud.testing/nextcloud/remote.php/dav/fooBar', true);

		expect(xhr.setRequestHeader).toHaveBeenCalledTimes(2);
		expect(xhr.setRequestHeader).toHaveBeenCalledWith('Depth', '0');
		expect(xhr.setRequestHeader).toHaveBeenCalledWith('Content-Type', 'application/xml; charset=utf-8');

		expect(afterRequestHandler).toHaveBeenCalledTimes(0);
		expect(xhr.send).toHaveBeenCalledTimes(1);
		expect(xhr.send).toHaveBeenCalledWith();

		xhr.readyState = 4;
		xhr.status = 200;
		xhr.response = 567;
		xhr.onreadystatechange();

		return promise.then((res) => {
			expect(res).toEqual({
				body: 567,
				status: 200,
				xhr: xhr
			});

			expect(afterRequestHandler).toHaveBeenCalledTimes(1);
			expect(afterRequestHandler).toHaveBeenCalledWith(xhr);
		}).catch(() => {
			fail('Promise was not supposed to fail');
		});
	});

	it ('should return the filename of a URL', () => {
		const xhr = jasmine.createSpyObj('xhrObject', ['open', 'setRequestHeader', 'send']);
		const xhrProvider = jasmine.createSpy('xhrProvider').and.callFake(() => xhr);
		const parser = jasmine.createSpyObj('parserObject', ['canParse', 'parse']);

		const request = new Request('https://nextcloud.testing/nextcloud/remote.php/dav/', parser, xhrProvider);

		expect(request.filename('')).toEqual('/dav');
		expect(request.filename('foo')).toEqual('/foo');
		expect(request.filename('foo/bar/baz/')).toEqual('/baz');
	});

	it ('should return the pathname of a URL', () => {
		const xhr = jasmine.createSpyObj('xhrObject', ['open', 'setRequestHeader', 'send']);
		const xhrProvider = jasmine.createSpy('xhrProvider').and.callFake(() => xhr);
		const parser = jasmine.createSpyObj('parserObject', ['canParse', 'parse']);

		const request = new Request('https://nextcloud.testing/nextcloud/remote.php/dav/', parser, xhrProvider);

		expect(request.pathname('')).toEqual('/nextcloud/remote.php/dav/');
		expect(request.pathname('foo')).toEqual('/nextcloud/remote.php/dav/foo');
		expect(request.pathname('foo/bar/baz/')).toEqual('/nextcloud/remote.php/dav/foo/bar/baz/');
	});

	it ('should return the absolute url of a URL', () => {
		const xhr = jasmine.createSpyObj('xhrObject', ['open', 'setRequestHeader', 'send']);
		const xhrProvider = jasmine.createSpy('xhrProvider').and.callFake(() => xhr);
		const parser = jasmine.createSpyObj('parserObject', ['canParse', 'parse']);

		const request = new Request('https://nextcloud.testing/nextcloud/remote.php/dav/', parser, xhrProvider);

		expect(request.absoluteUrl('')).toEqual('https://nextcloud.testing/nextcloud/remote.php/dav/');
		expect(request.absoluteUrl('foo')).toEqual('https://nextcloud.testing/nextcloud/remote.php/dav/foo');
		expect(request.absoluteUrl('foo/bar/baz/')).toEqual('https://nextcloud.testing/nextcloud/remote.php/dav/foo/bar/baz/');
		expect(request.absoluteUrl('https://foo.bar/nextcloud/remote.php/caldav/')).toEqual('https://foo.bar/nextcloud/remote.php/caldav/');
	});
});
