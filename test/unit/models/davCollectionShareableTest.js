/**
 * CDAV Library
 *
 * This library is part of the Nextcloud project
 *
 * SPDX-FileCopyrightText: 2018 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

import { davCollectionShareable } from '../../../src/models/davCollectionShareable.js';
import * as XMLUtility from "../../../src/utility/xmlUtility.js";

describe('Shareable dav collection model', () => {

	beforeEach(() => {
		XMLUtility.resetPrefixMap();
	});

	it('should extend the base class and expose two properties', () => {
		function Foo() {}
		Foo.prototype._request = {
			'post': vi.fn()
		};
		Foo.prototype._exposeProperty = vi.fn();

		const share = new (davCollectionShareable(Foo))();
		expect(Foo.prototype._exposeProperty).toHaveBeenCalledTimes(2);
		expect(Foo.prototype._exposeProperty).toHaveBeenCalledWith('shares', 'http://owncloud.org/ns', 'invite');
		expect(Foo.prototype._exposeProperty).toHaveBeenCalledWith('allowedSharingModes', 'http://calendarserver.org/ns/', 'allowed-sharing-modes');

		expect(share).toEqual(expect.any(Foo));
	});

	it('should provide a share method - new read only share', () => {
		function Foo() {}
		Foo.prototype._request = {
			'post': vi.fn()
		};
		Foo.prototype._exposeProperty = vi.fn();
		Foo.prototype._url = '/foo';
		Foo.prototype.shares = [];

		Foo.prototype._request.post.mockImplementation(() => Promise.resolve({}));

		const share = new (davCollectionShareable(Foo))();
		return share.share('principal:foo/a').then(() => {
			expect(share.shares).toEqual([{
				href: 'principal:foo/a',
				access: ['{http://owncloud.org/ns}read'],
				'common-name': null,
				'invite-accepted': true
			}]);

			expect(Foo.prototype._request.post).toHaveBeenCalledTimes(1);
			expect(Foo.prototype._request.post).toHaveBeenCalledWith('/foo', { 'Content-Type': 'application/xml; charset=utf-8' },
				'<x0:share xmlns:x0="http://owncloud.org/ns"><x0:set><x1:href xmlns:x1="DAV:">principal:foo/a</x1:href></x0:set></x0:share>');
		});
	});

	it('should provide a share method - new read write share', () => {
		function Foo() {}
		Foo.prototype._request = {
			'post': vi.fn()
		};
		Foo.prototype._exposeProperty = vi.fn();
		Foo.prototype._url = '/foo';
		Foo.prototype.shares = [];

		Foo.prototype._request.post.mockImplementation(() => Promise.resolve({}));

		const share = new (davCollectionShareable(Foo))();
		return share.share('principal:foo/a', true).then(() => {
			expect(share.shares).toEqual([{
				href: 'principal:foo/a',
				access: ['{http://owncloud.org/ns}read-write'],
				'common-name': null,
				'invite-accepted': true
			}]);

			expect(Foo.prototype._request.post).toHaveBeenCalledTimes(1);
			expect(Foo.prototype._request.post).toHaveBeenCalledWith('/foo', { 'Content-Type': 'application/xml; charset=utf-8' },
				'<x0:share xmlns:x0="http://owncloud.org/ns"><x0:set><x1:href xmlns:x1="DAV:">principal:foo/a</x1:href><x0:read-write/></x0:set></x0:share>');
		});
	});

	it('should provide a share method - updated read only -> read-write', () => {
		function Foo() {}
		Foo.prototype._request = {
			'post': vi.fn()
		};
		Foo.prototype._exposeProperty = vi.fn();
		Foo.prototype._url = '/foo';
		Foo.prototype.shares = [{
			href: 'principal:foo/a',
			access: ['{http://owncloud.org/ns}read'],
			'common-name': 'Foo Bar',
			'invite-accepted': true
		}];

		Foo.prototype._request.post.mockImplementation(() => Promise.resolve({}));

		const share = new (davCollectionShareable(Foo))();
		return share.share('principal:foo/a', true).then(() => {
			expect(share.shares).toEqual([{
				href: 'principal:foo/a',
				access: ['{http://owncloud.org/ns}read-write'],
				'common-name': 'Foo Bar',
				'invite-accepted': true
			}]);

			expect(Foo.prototype._request.post).toHaveBeenCalledTimes(1);
			expect(Foo.prototype._request.post).toHaveBeenCalledWith('/foo', { 'Content-Type': 'application/xml; charset=utf-8' },
				'<x0:share xmlns:x0="http://owncloud.org/ns"><x0:set><x1:href xmlns:x1="DAV:">principal:foo/a</x1:href><x0:read-write/></x0:set></x0:share>');
		});
	});

	it('should provide a share method - updated read write -> read only', () => {
		function Foo() {}
		Foo.prototype._request = {
			'post': vi.fn()
		};
		Foo.prototype._exposeProperty = vi.fn();
		Foo.prototype._url = '/foo';
		Foo.prototype.shares = [{
			href: 'principal:foo/a',
			access: ['{http://owncloud.org/ns}read-write'],
			'common-name': 'Foo Bar',
			'invite-accepted': true
		}];

		Foo.prototype._request.post.mockImplementation(() => Promise.resolve({}));

		const share = new (davCollectionShareable(Foo))();
		return share.share('principal:foo/a').then(() => {
			expect(share.shares).toEqual([{
				href: 'principal:foo/a',
				access: ['{http://owncloud.org/ns}read'],
				'common-name': 'Foo Bar',
				'invite-accepted': true
			}]);

			expect(Foo.prototype._request.post).toHaveBeenCalledTimes(1);
			expect(Foo.prototype._request.post).toHaveBeenCalledWith('/foo', { 'Content-Type': 'application/xml; charset=utf-8' },
				'<x0:share xmlns:x0="http://owncloud.org/ns"><x0:set><x1:href xmlns:x1="DAV:">principal:foo/a</x1:href></x0:set></x0:share>');
		});
	});


	it('should provide a unshare method', () => {
		function Foo() {}
		Foo.prototype._request = {
			'post': vi.fn()
		};
		Foo.prototype._exposeProperty = vi.fn();
		Foo.prototype._url = '/foo';
		Foo.prototype.shares = [{
			href: 'principal:foo/a',
			access: ['{http://owncloud.org/ns}read-write'],
			'common-name': 'Foo Bar',
			'invite-accepted': true
		}];

		Foo.prototype._request.post.mockImplementation(() => Promise.resolve({}));

		const share = new (davCollectionShareable(Foo))();
		return share.unshare('principal:foo/a').then(() => {
			expect(share.shares).toEqual([]);

			expect(Foo.prototype._request.post).toHaveBeenCalledTimes(1);
			expect(Foo.prototype._request.post).toHaveBeenCalledWith('/foo', { 'Content-Type': 'application/xml; charset=utf-8' },
				'<x0:share xmlns:x0="http://owncloud.org/ns"><x0:remove><x1:href xmlns:x1="DAV:">principal:foo/a</x1:href></x0:remove></x0:share>');
		});
	});

	it('should provide a isShareable method - true', () => {
		function Foo() {}
		Foo.prototype._request = {
			'post': vi.fn()
		};
		Foo.prototype._exposeProperty = vi.fn();
		Foo.prototype._url = '/foo';
		Foo.prototype.allowedSharingModes = ['{http://calendarserver.org/ns/}can-be-shared'];

		const share = new (davCollectionShareable(Foo))();
		expect(share.isShareable()).toEqual(true);
	});

	it('should provide a isShareable method - false', () => {
		function Foo() {}
		Foo.prototype._request = {
			'post': vi.fn()
		};
		Foo.prototype._exposeProperty = vi.fn();
		Foo.prototype._url = '/foo';
		Foo.prototype.allowedSharingModes = ['{http://calendarserver.org/ns/}can-be-published'];

		const share = new (davCollectionShareable(Foo))();
		expect(share.isShareable()).toEqual(false);
	});

	it('should provide a isPublishable method - false', () => {
		function Foo() {}
		Foo.prototype._request = {
			'post': vi.fn()
		};
		Foo.prototype._exposeProperty = vi.fn();
		Foo.prototype._url = '/foo';
		Foo.prototype.allowedSharingModes = ['{http://calendarserver.org/ns/}can-be-shared'];

		const share = new (davCollectionShareable(Foo))();
		expect(share.isPublishable()).toEqual(false);
	});

	it('should provide a isPublishable method - true', () => {
		function Foo() {}
		Foo.prototype._request = {
			'post': vi.fn()
		};
		Foo.prototype._exposeProperty = vi.fn();
		Foo.prototype._url = '/foo';
		Foo.prototype.allowedSharingModes = ['{http://calendarserver.org/ns/}can-be-published'];

		const share = new (davCollectionShareable(Foo))();
		expect(share.isPublishable()).toEqual(true);
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

		const shareClass = davCollectionShareable(Foo);
		expect(shareClass.getPropFindList()).toEqual([
			['Foo', 'BAR'], ['http://owncloud.org/ns', 'invite'],
			['http://calendarserver.org/ns/', 'allowed-sharing-modes']
		]);
	});
});
