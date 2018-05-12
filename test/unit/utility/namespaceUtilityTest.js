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
    });

    it('should only export namespaces', () => {
        expect(Object.keys(NS).length).toEqual(7);
    });
});
