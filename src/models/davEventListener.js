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

export default class DAVEventListener {

	constructor() {
		this._eventListeners = {};
	}

	/**
	 * adds an event listener
	 *
	 * @param {string} type
	 * @param {function} listener
	 * @param {object} options
	 */
	addEventListener(type, listener, options = {}) {
		this._eventListeners[type] = this._eventListeners[type] || [];
		this._eventListeners[type].push({ listener, options, });
	}

	/**
	 * removes an event listener
	 *
	 * @param {string} type
	 * @param {function} listener
	 * @param {object} options
	 */
	removeEventListener(type, listener, options = {}) {
		if (!this._eventListeners[type]) {
			return;
		}

		const index = this._eventListeners[type].findIndex(({ sListener, sOptions, }) => {
			return listener === sListener && options === sOptions;
		});
		if (index === -1) {
			return;
		}
		this._eventListeners[type].splice(index, 1);
	}

	/**
	 * dispatch event on object
	 *
	 * @param {string} type
	 * @param {DAVEvent} event
	 */
	dispatchEvent(type, event) {
		if (!this._eventListeners[type]) {
			return;
		}

		this._eventListeners[type].forEach(({ listener, options, }) => {
			if (options.once) {
				this.removeEventListener(type, listener, options);
			}

			listener(event);
		});
	}

}
