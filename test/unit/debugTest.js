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

import { debugFactory } from '../../src/debug.js';

describe('Debug', () => {

	it ('should provide a factory for a debugger', () => {
		expect(debugFactory).toEqual(jasmine.any(Function));
		expect(debugFactory('foo')).toEqual(jasmine.any(Function));
	});

	it ('should log console messages including their context if debug is enabled', () => {
		spyOn(window.console, 'debug');

		debugFactory.enabled = true;

		const debug = debugFactory('foo');

		debug(123);
		expect(window.console.debug).toHaveBeenCalledWith('foo', 123);

		debug(123, 456);
		expect(window.console.debug).toHaveBeenCalledWith('foo', 123, 456);
	});

	it ('should not log console messages if debug is disabled', () => {
		spyOn(window.console, 'debug');

		debugFactory.enabled = false;

		const debug = debugFactory('foo');
		debug(123);

		expect(window.console.debug).not.toHaveBeenCalledWith('foo', 123);
	});

});
