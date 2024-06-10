/**
 * CDAV Library
 *
 * This library is part of the Nextcloud project
 *
 * @author Georg Ehrke
 * @author Richard Steinmetz <richard@steinmetz.cloud>
 * @copyright 2019 Georg Ehrke <oc.list@georgehrke.com>
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

import { DavObject } from './davObject.js'
import * as NS from '../utility/namespaceUtility.js'
import * as XMLUtility from '../utility/xmlUtility.js'

import prinicipalPropSet from '../propset/principalPropSet.js'

/**
 * @class
 */
export class Principal extends DavObject {

	/**
	 * Creates an object that represents a single principal
	 * as specified in RFC 3744
	 *
	 * https://tools.ietf.org/html/rfc3744#section-2
	 *
	 * @inheritDoc
	 */
	constructor(...args) {
		super(...args)

		Object.assign(this, {
			// house keeping
			_updatedProperties: [],

			// parsers / factories
			_propSetFactory: [],
		})

		this._registerPropSetFactory(prinicipalPropSet)

		this._exposeProperty('displayname', NS.DAV, 'displayname')
		this._exposeProperty('calendarUserType', NS.IETF_CALDAV, 'calendar-user-type')
		this._exposeProperty('calendarUserAddressSet', NS.IETF_CALDAV, 'calendar-user-address-set')
		this._exposeProperty('principalUrl', NS.DAV, 'principal-URL')
		this._exposeProperty('email', NS.SABREDAV, 'email-address')
		this._exposeProperty('language', NS.NEXTCLOUD, 'language')

		this._exposeProperty('calendarHomes', NS.IETF_CALDAV, 'calendar-home-set')
		this._exposeProperty('scheduleInbox', NS.IETF_CALDAV, 'schedule-inbox-URL')
		this._exposeProperty('scheduleOutbox', NS.IETF_CALDAV, 'schedule-outbox-URL')
		this._exposeProperty('scheduleDefaultCalendarUrl', NS.IETF_CALDAV, 'schedule-default-calendar-URL', true)

		this._exposeProperty('addressBookHomes', NS.IETF_CARDDAV, 'addressbook-home-set')

		// Room and resource booking related
		this._exposeProperty('roomType', NS.NEXTCLOUD, 'room-type')
		this._exposeProperty('roomSeatingCapacity', NS.NEXTCLOUD, 'room-seating-capacity')
		this._exposeProperty('roomBuildingAddress', NS.NEXTCLOUD, 'room-building-address')
		this._exposeProperty('roomBuildingStory', NS.NEXTCLOUD, 'room-building-story')
		this._exposeProperty('roomBuildingRoomNumber', NS.NEXTCLOUD, 'room-building-room-number')
		this._exposeProperty('roomFeatures', NS.NEXTCLOUD, 'room-features')

		Object.defineProperties(this, {
			principalScheme: {
				get: () => {
					const baseUrl = this._request.pathname(this._request.baseUrl)
					let principalURI = this.url.slice(baseUrl.length)
					if (principalURI.slice(-1) === '/') {
						principalURI = principalURI.slice(0, -1)
					}

					return 'principal:' + principalURI
				},
			},
			userId: {
				get: () => {
					if (this.calendarUserType !== 'INDIVIDUAL') {
						return null
					}

					return this.url.split('/').splice(-2, 2)[this.url.endsWith('/') ? 0 : 1]
				},
			},
			groupId: {
				get: () => {
					if (this.calendarUserType !== 'GROUP') {
						return null
					}

					return this.url.split('/').splice(-2, 2)[this.url.endsWith('/') ? 0 : 1]
				},
			},
			resourceId: {
				get: () => {
					if (this.calendarUserType !== 'RESOURCE') {
						return null
					}

					return this.url.split('/').splice(-2, 2)[this.url.endsWith('/') ? 0 : 1]
				},
			},
			roomId: {
				get: () => {
					if (this.calendarUserType !== 'ROOM') {
						return null
					}

					return this.url.split('/').splice(-2, 2)[this.url.endsWith('/') ? 0 : 1]
				},
			},
			roomAddress: {
				get: () => {
					const data = [
						this.roomBuildingRoomNumber,
						this.roomBuildingStory,
						this.roomBuildingAddress,
					]
					return data
						.filter(value => !!value)
						.join(', ')
				},
			},
		})
	}

	/**
	 * Expose property to the outside and track changes if it's mutable
	 *
	 * @protected
	 * @param {string} localName
	 * @param {string} xmlNamespace
	 * @param {string} xmlName
	 * @param {boolean} mutable
	 * @return void
	 */
	_exposeProperty(localName, xmlNamespace, xmlName, mutable = false) {
		if (mutable) {
			Object.defineProperty(this, localName, {
				get: () => this._props[`{${xmlNamespace}}${xmlName}`],
				set: (val) => {
					this._props[`{${xmlNamespace}}${xmlName}`] = val
					if (this._updatedProperties.indexOf(`{${xmlNamespace}}${xmlName}`) === -1) {
						this._updatedProperties.push(`{${xmlNamespace}}${xmlName}`)
					}
				},
			})
		} else {
			Object.defineProperty(this, localName, {
				get: () => this._props[`{${xmlNamespace}}${xmlName}`],
			})
		}
	}

	/**
	 * @protected
	 * @param factory
	 * @return void
	 */
	_registerPropSetFactory(factory) {
		this._propSetFactory.push(factory)
	}

	/**
	 * @inheritDoc
	 */
	static getPropFindList(options = {}) {
		const list = [
			[NS.DAV, 'displayname'],
			[NS.IETF_CALDAV, 'calendar-user-type'],
			[NS.IETF_CALDAV, 'calendar-user-address-set'],
			[NS.DAV, 'principal-URL'],
			[NS.DAV, 'alternate-URI-set'],
			[NS.SABREDAV, 'email-address'],
			[NS.NEXTCLOUD, 'language'],
		]

		if (options.enableCalDAV) {
			list.push(
				[NS.IETF_CALDAV, 'calendar-home-set'],
				[NS.IETF_CALDAV, 'schedule-inbox-URL'],
				[NS.IETF_CALDAV, 'schedule-outbox-URL'],
				[NS.IETF_CALDAV, 'schedule-default-calendar-URL'],
				// Room and Resource booking related
				[NS.NEXTCLOUD, 'resource-type'],
				[NS.NEXTCLOUD, 'resource-vehicle-type'],
				[NS.NEXTCLOUD, 'resource-vehicle-make'],
				[NS.NEXTCLOUD, 'resource-vehicle-model'],
				[NS.NEXTCLOUD, 'resource-vehicle-is-electric'],
				[NS.NEXTCLOUD, 'resource-vehicle-range'],
				[NS.NEXTCLOUD, 'resource-vehicle-seating-capacity'],
				[NS.NEXTCLOUD, 'resource-contact-person'],
				[NS.NEXTCLOUD, 'resource-contact-person-vcard'],
				[NS.NEXTCLOUD, 'room-type'],
				[NS.NEXTCLOUD, 'room-seating-capacity'],
				[NS.NEXTCLOUD, 'room-building-address'],
				[NS.NEXTCLOUD, 'room-building-story'],
				[NS.NEXTCLOUD, 'room-building-room-number'],
				[NS.NEXTCLOUD, 'room-features'],
			)
		}
		if (options.enableCardDAV) {
			list.push(
				[NS.IETF_CARDDAV, 'addressbook-home-set'],
			)
		}

		return list
	}

	/**
	 * Sends a PropPatch request to update the principal's properties.
	 * The request is only made if properties actually changed.
	 *
	 * @return {Promise<void>}
	 */
	async update() {
		if (this._updatedProperties.length === 0) {
			return
		}

		const properties = {}
		this._updatedProperties.forEach((updatedProperty) => {
			properties[updatedProperty] = this._props[updatedProperty]
		})
		const propSet = this._propSetFactory.reduce((arr, p) => [...arr, ...p(properties)], [])

		const [skeleton, dPropSet] = XMLUtility.getRootSkeleton(
			[NS.DAV, 'propertyupdate'],
			[NS.DAV, 'set'],
			[NS.DAV, 'prop'])

		dPropSet.push(...propSet)

		const body = XMLUtility.serialize(skeleton)
		await this._request.propPatch(this._url, {}, body)
	}

}
