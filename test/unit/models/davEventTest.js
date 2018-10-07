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
import DAVEvent from "../../../src/models/davEvent.js";

describe('Dav event model', () => {
	it('should provide a constructor with type', () => {
		const event1 = new DAVEvent('UPDATED_ON_SERVER');

		expect(event1).toEqual(jasmine.any(DAVEvent));
		expect(event1.type).toEqual('UPDATED_ON_SERVER');
	});

	it('should provide a constructor with type and more options', () => {
		const event1 = new DAVEvent('UPDATED_ON_SERVER', {
			'foo': 'bar',
			'bar': 'baz',
		});

		expect(event1).toEqual(jasmine.any(DAVEvent));
		expect(event1.type).toEqual('UPDATED_ON_SERVER');
		expect(event1.foo).toEqual('bar');
		expect(event1.bar).toEqual('baz');
	});
});
