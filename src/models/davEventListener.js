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
		this._eventListeners = {}
	}

	/**
	 * adds an event listener
	 *
	 * @param {string} type
	 * @param {Function} listener
	 * @param {object} options
	 */
	addEventListener(type, listener, options = null) {
		this._eventListeners[type] = this._eventListeners[type] || []
		this._eventListeners[type].push({ listener, options })
	}

	/**
	 * removes an event listener
	 *
	 * @param {string} type
	 * @param {Function} dListener
	 */
	removeEventListener(type, dListener) {
		if (!this._eventListeners[type]) {
			return
		}

		const index = this._eventListeners[type]
			.findIndex(({ listener }) => listener === dListener)
		if (index === -1) {
			return
		}
		this._eventListeners[type].splice(index, 1)
	}

	/**
	 * dispatch event on object
	 *
	 * @param {string} type
	 * @param {DAVEvent} event
	 */
	dispatchEvent(type, event) {
		if (!this._eventListeners[type]) {
			return
		}

		const listenersToCall = []
		const listenersToCallAndRemove = []
		this._eventListeners[type].forEach(({ listener, options }) => {
			if (options && options.once) {
				listenersToCallAndRemove.push(listener)
			} else {
				listenersToCall.push(listener)
			}
		})

		listenersToCallAndRemove.forEach(listener => {
			this.removeEventListener(type, listener)
			listener(event)
		})
		listenersToCall.forEach(listener => {
			listener(event)
		})
	}

}
