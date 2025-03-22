/**
 * CDAV Library
 *
 * This library is part of the Nextcloud project
 *
 * SPDX-FileCopyrightText: 2018 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

import { davCollectionPublishable } from '../../../src/models/davCollectionPublishable.js';
import * as XMLUtility from "../../../src/utility/xmlUtility.js";

describe('Publishable dav collection model', () => {

	beforeEach(() => {
		XMLUtility.resetPrefixMap();
	});

	it('should extend the base class and expose a publishURL property', () => {
		function Foo() {}
		Foo.prototype._request = {
			'post': vi.fn()
		};
		Foo.prototype._exposeProperty = vi.fn();

		const share = new (davCollectionPublishable(Foo))();
		expect(Foo.prototype._exposeProperty).toHaveBeenCalledTimes(1);
		expect(Foo.prototype._exposeProperty).toHaveBeenCalledWith('publishURL', 'http://calendarserver.org/ns/', 'publish-url');

		expect(share).toEqual(expect.any(Foo));
	});

	it('should provide a publish method', () => {
		function Foo() {}
		Foo.prototype._request = {
			'post': vi.fn()
		};
		Foo.prototype._exposeProperty = vi.fn();
		Foo.prototype._updatePropsFromServer = vi.fn();
		Foo.prototype._url = '/foo';
		Foo.prototype.shares = [];

		Foo.prototype._request.post.mockImplementation(() => Promise.resolve({}));
		Foo.prototype._updatePropsFromServer.mockImplementation(() => Promise.resolve({}));

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
		Foo.prototype._request = {
			'post': vi.fn()
		};
		Foo.prototype._exposeProperty = vi.fn();
		Foo.prototype._url = '/foo';
		Foo.prototype._props = [];
		Foo.prototype._props['{http://calendarserver.org/ns/}publish-url'] = 'foo-bar';


		Foo.prototype._request.post.mockImplementation(() => Promise.resolve({}));

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
		Foo.prototype._request = {
			'post': vi.fn()
		};
		Foo.prototype._exposeProperty = vi.fn();
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
