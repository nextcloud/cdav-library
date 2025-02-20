/**
 * CDAV Library
 *
 * This library is part of the Nextcloud project
 *
 * SPDX-FileCopyrightText: 2018 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { describe, expect, it } from "vitest";

import * as NS from '../../../src/utility/namespaceUtility.js';

describe('NamespaceUtility', () => {
    it('should provide namespaces', () => {
        expect(NS.DAV).toEqual('DAV:');
        expect(NS.IETF_CALDAV).toEqual('urn:ietf:params:xml:ns:caldav');
        expect(NS.IETF_CARDDAV).toEqual('urn:ietf:params:xml:ns:carddav');
        expect(NS.OWNCLOUD).toEqual('http://owncloud.org/ns');
        expect(NS.NEXTCLOUD).toEqual('http://nextcloud.com/ns');
        expect(NS.APPLE).toEqual('http://apple.com/ns/ical/');
        expect(NS.CALENDARSERVER).toEqual('http://calendarserver.org/ns/');
        expect(NS.SABREDAV).toEqual('http://sabredav.org/ns');
    });

    it('should provide namespace map', () => {
    	expect(NS.NS_MAP).toEqual({
			d: 'DAV:',
			cl: 'urn:ietf:params:xml:ns:caldav',
			cr: 'urn:ietf:params:xml:ns:carddav',
			oc: 'http://owncloud.org/ns',
			nc: 'http://nextcloud.com/ns',
			aapl: 'http://apple.com/ns/ical/',
			cs: 'http://calendarserver.org/ns/',
			sd: 'http://sabredav.org/ns'
		});
	});

    it ('should provide namespace resolver', () => {
		expect(NS.resolve('d')).toEqual('DAV:');
		expect(NS.resolve('cl')).toEqual('urn:ietf:params:xml:ns:caldav');
		expect(NS.resolve('cr')).toEqual('urn:ietf:params:xml:ns:carddav');
		expect(NS.resolve('oc')).toEqual('http://owncloud.org/ns');
		expect(NS.resolve('nc')).toEqual('http://nextcloud.com/ns');
		expect(NS.resolve('aapl')).toEqual('http://apple.com/ns/ical/');
		expect(NS.resolve('cs')).toEqual('http://calendarserver.org/ns/');
		expect(NS.resolve('sd')).toEqual('http://sabredav.org/ns');
		expect(NS.resolve('bliblablub')).toEqual(null);
	});

    it('should only export namespaces', () => {
        expect(Object.keys(NS).length).toEqual(10);
    });
});
