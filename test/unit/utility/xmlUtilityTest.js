/**
 * CDAV Library
 *
 * This library is part of the Nextcloud project
 *
 * SPDX-FileCopyrightText: 2018 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { beforeEach, describe, expect, it } from "vitest";

import * as XMLUtility from '../../../src/utility/xmlUtility.js';

describe('XMLUtility', () => {
	beforeEach(() => {
		XMLUtility.resetPrefixMap();
	});

	it('should return an empty string when parameter is not an object', () => {
		expect(XMLUtility.serialize()).toEqual('');
		expect(XMLUtility.serialize(null)).toEqual('');
		expect(XMLUtility.serialize(123)).toEqual('');
		expect(XMLUtility.serialize('abc')).toEqual('');
		expect(XMLUtility.serialize([])).toEqual('');
		expect(XMLUtility.serialize({})).toEqual('');
	});

	it('should return correct xml for one element', () => {
		expect(XMLUtility.serialize({
			name: ['NS123', 'element']
		})).toEqual('<x0:element xmlns:x0="NS123"/>');
	});

	it('should return correct xml for one element with attributes', () => {
		expect(XMLUtility.serialize({
			name: ['NS123', 'element'],
			attributes: [
				['abc', '123'],
				['def', '456']
			]
		})).toEqual('<x0:element xmlns:x0="NS123" abc="123" def="456"/>');
	});

	it('should return correct xml for one element with namespaced attributes', () => {
		expect(XMLUtility.serialize({
			name: ['NS123', 'element'],
			attributes: [
				['myNs1', 'abc', '123'],
				['myNs2', 'def', '456']
			]
		})).toEqual('<x0:element xmlns:x0="NS123" x1:abc="123" xmlns:x1="myNs1" x2:def="456" xmlns:x2="myNs2"/>');
	});

	it('should return correct xml for one element with attributes and value', () => {
		expect(XMLUtility.serialize({
			name: ['NS123', 'element'],
			attributes: [
				['abc', '123'],
				['def', '456']
			],
			value: 'it value'
		})).toEqual('<x0:element xmlns:x0="NS123" abc="123" def="456">it value</x0:element>');
	});

	it('should prefer value over children', () => {
		expect(XMLUtility.serialize({
			name: ['NS123', 'element'],
			attributes: [],
			value: 'it value',
			children: [{
				name: 'element2'
			}]
		})).toEqual('<x0:element xmlns:x0="NS123">it value</x0:element>');
	});

	it('should return correct xml for one child', () => {
		expect(XMLUtility.serialize({
			name: ['NS123', 'element'],
			attributes: [
				['abc', '123'],
				['def', '456']
			],
			children: [{
				name: ['NS456', 'element2']
			}]
		})).toEqual('<x0:element xmlns:x0="NS123" abc="123" def="456"><x1:element2 xmlns:x1="NS456"/></x0:element>');
	});

	it('should return correct xml for multiple children', () => {
		expect(XMLUtility.serialize({
			name: ['NS123', 'element'],
			attributes: [
				['abc', '123'],
				['def', '456']
			],
			children: [{
				name: ['NS456', 'element']
			}, {
				name: ['NS123', 'element2']
			}]
		})).toEqual('<x0:element xmlns:x0="NS123" abc="123" def="456"><x1:element xmlns:x1="NS456"/><x0:element2/></x0:element>');
	});

	it('should return correct xml for deeply nested objects', () => {
		expect(XMLUtility.serialize({
			name: ['NSDAV', 'mkcol'],
			children: [{
				name: ['NSDAV', 'set'],
				children: [{
					name: ['NSDAV', 'prop'],
					children: [{
						name: ['NSDAV', 'resourcetype'],
						children: [{
							name: ['NSDAV', 'collection'],
							children: [{
								name: ['NSCAL', 'calendar']
							}]
						}, {
							name: ['NSDAV', 'displayname'],
							value: 'it_displayname'
						}, {
							name: ['NSOC', 'calendar-enabled'],
							value: 1
						}, {
							name: ['NSAAPL', 'calendar-order'],
							value: 42
						}, {
							name: ['NSAAPL', 'calendar-color'],
							value: '#00FF00'
						}, {
							name: ['NSCAL', 'supported-calendar-component-set'],
							children: [{
								name: ['NSCAL', 'comp'],
								attributes: [
									['name', 'VEVENT']
								]
							},{
								name: ['NSCAL', 'comp'],
								attributes: [
									['name', 'VTODO']
								]
							}]
						}]
					}]
				}]
			}]
		})).toEqual('<x0:mkcol xmlns:x0="NSDAV"><x0:set><x0:prop><x0:resourcetype><x0:collection><x1:calendar xmlns:x1="NSCAL"/></x0:collection><x0:displayname>it_displayname</x0:displayname><x2:calendar-enabled xmlns:x2="NSOC">1</x2:calendar-enabled><x3:calendar-order xmlns:x3="NSAAPL">42</x3:calendar-order><x3:calendar-color xmlns:x3="NSAAPL">#00FF00</x3:calendar-color><x1:supported-calendar-component-set xmlns:x1="NSCAL"><x1:comp name="VEVENT"/><x1:comp name="VTODO"/></x1:supported-calendar-component-set></x0:resourcetype></x0:prop></x0:set></x0:mkcol>');
	});

	it('should return an empty object when getRootSkeleton is called with no parameters', () => {
		expect(XMLUtility.getRootSkeleton()).toEqual([{}, null]);
	});

	it('should return the root sceleton correctly for one element', () => {
		const expected = {
			name: ['NSDAV', 'mkcol'],
			children: []
		};
		const result = XMLUtility.getRootSkeleton(['NSDAV', 'mkcol']);
		expect(result).toEqual([expected, expected.children]);
		expect(result[0].children === result[1]).toBe(true);
	});

	it('should return the root sceleton correctly for two elements', () => {
		const expected = {
			name: ['NSDAV', 'mkcol'],
			children: [{
				name: ['NSDAV', 'set'],
				children: []
			}]
		};
		const result = XMLUtility.getRootSkeleton(['NSDAV', 'mkcol'],
			['NSDAV', 'set']);
		expect(result).toEqual([expected, expected.children[0].children]);
		expect(result[0].children[0].children === result[1]).toBe(true);
	});

	it('should return the root sceleton correctly for three elements', () => {
		const expected = {
			name: ['NSDAV', 'mkcol'],
			children: [{
				name: ['NSDAV', 'set'],
				children: [{
					name: ['NSDAV', 'prop'],
					children: []
				}]
			}]
		};
		const result = XMLUtility.getRootSkeleton(['NSDAV', 'mkcol'],
			['NSDAV', 'set'], ['NSDAV', 'prop']);
		expect(result).toEqual([expected, expected.children[0].children[0].children]);
		expect(result[0].children[0].children[0].children === result[1]).toBe(true);
	});
});
