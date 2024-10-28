/**
 * CDAV Library
 *
 * This library is part of the Nextcloud project
 *
 * SPDX-FileCopyrightText: 2018 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
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
