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
import { davCollectionPublishable } from '../../../src/models/davCollectionPublishable.js';
import * as XMLUtility from "../../../src/utility/xmlUtility.js";

describe('Publishable dav collection model', () => {

	beforeEach(() => {
		XMLUtility.resetPrefixMap();
	});

	it('should extend the base class and expose a publishURL property', () => {
		function Foo() {}
		Foo.prototype._request = jasmine.createSpyObj('Request', ['post']);
		Foo.prototype._exposeProperty = jasmine.createSpy();

		const share = new (davCollectionPublishable(Foo))();
		expect(Foo.prototype._exposeProperty).toHaveBeenCalledTimes(1);
		expect(Foo.prototype._exposeProperty).toHaveBeenCalledWith('publishURL', 'http://calendarserver.org/ns/', 'publish-url');

		expect(share).toEqual(jasmine.any(Foo));
	});

	it('should provide a publish method', () => {
		function Foo() {}
		Foo.prototype._request = jasmine.createSpyObj('Request', ['post']);
		Foo.prototype._exposeProperty = jasmine.createSpy();
		Foo.prototype._updatePropsFromServer = jasmine.createSpy();
		Foo.prototype._url = '/foo';
		Foo.prototype.shares = [];

		Foo.prototype._request.post.and.callFake(() => Promise.resolve({}));
		Foo.prototype._updatePropsFromServer.and.callFake(() => Promise.resolve({}));

		const share = new (davCollectionPublishable(Foo))();
		return share.publish('principal:foo/a').then(() => {
			expect(Foo.prototype._request.post).toHaveBeenCalledTimes(1);
			expect(Foo.prototype._request.post).toHaveBeenCalledWith('/foo', { 'Content-Type': 'application/xml; charset=utf-8' },
				'<x0:publish-calendar xmlns:x0="http://calendarserver.org/ns/"/>');

			expect(Foo.prototype._updatePropsFromServer).toHaveBeenCalledTimes(1);
		});
	});

	it('should provide a unpublish method', () => {
		function Foo() {}
		Foo.prototype._request = jasmine.createSpyObj('Request', ['post']);
		Foo.prototype._exposeProperty = jasmine.createSpy();
		Foo.prototype._url = '/foo';
		Foo.prototype._props = [];
		Foo.prototype._props['{http://calendarserver.org/ns/}publish-url'] = 'foo-bar';


		Foo.prototype._request.post.and.callFake(() => Promise.resolve({}));

		const share = new (davCollectionPublishable(Foo))();
		expect(share._props['{http://calendarserver.org/ns/}publish-url']).toEqual('foo-bar');
		return share.unpublish('principal:foo/a').then(() => {
			expect(Foo.prototype._request.post).toHaveBeenCalledTimes(1);
			expect(Foo.prototype._request.post).toHaveBeenCalledWith('/foo', { 'Content-Type': 'application/xml; charset=utf-8' },
				'<x0:unpublish-calendar xmlns:x0="http://calendarserver.org/ns/"/>');

			expect(share._props['{http://calendarserver.org/ns/}publish-url']).toEqual(undefined);
		});
	});

	it('should provide a getPropFindList method', () => {
		function Foo() {}
		Foo.prototype._request = jasmine.createSpyObj('Request', ['post']);
		Foo.prototype._exposeProperty = jasmine.createSpy();
		Foo.prototype._url = '/foo';
		Foo.getPropFindList = () => {
			return [['Foo', 'BAR']];
		};

		const shareClass = davCollectionPublishable(Foo);
		expect(shareClass.getPropFindList()).toEqual([
			['Foo', 'BAR'], ['http://calendarserver.org/ns/', 'publish-url']
		]);
	});
});
