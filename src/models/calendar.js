/**
 * CDAV Library
 *
 * This library is part of the Nextcloud project
 *
 * SPDX-FileCopyrightText: 2018 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { DavCollection } from './davCollection.js'
import { davCollectionPublishable } from './davCollectionPublishable.js'
import { davCollectionShareable } from './davCollectionShareable.js'
import { VObject } from './vobject.js'
import calendarPropSet from '../propset/calendarPropSet.js'
import * as NS from '../utility/namespaceUtility.js'
import * as StringUtility from '../utility/stringUtility.js'
import * as XMLUtility from '../utility/xmlUtility.js'

import { debugFactory } from '../debug.js'
const debug = debugFactory('Calendar')

/**
 * This class represents an calendar collection as specified in
 * https://tools.ietf.org/html/rfc4791#section-4.2
 *
 * On top of all the properties provided by davCollectionShareable,
 * davCollectionPublishable and DavCollection,
 * It allows you access to the following list of properties:
 * - color
 * - enabled
 * - order
 * - timezone
 * - components
 *
 * The first four allowing read-write access
 *
 * @augments DavCollection
 */
export class Calendar extends davCollectionPublishable(davCollectionShareable(DavCollection)) {

	/**
	 * @inheritDoc
	 */
	constructor(...args) {
		super(...args)

		super._registerObjectFactory('text/calendar', VObject)
		super._registerPropSetFactory(calendarPropSet)

		super._exposeProperty('color', NS.APPLE, 'calendar-color', true)
		super._exposeProperty('enabled', NS.OWNCLOUD, 'calendar-enabled', true)
		super._exposeProperty('order', NS.APPLE, 'calendar-order', true)
		super._exposeProperty('timezone', NS.IETF_CALDAV, 'calendar-timezone', true)
		super._exposeProperty('components', NS.IETF_CALDAV, 'supported-calendar-component-set')
		super._exposeProperty('transparency', NS.IETF_CALDAV, 'schedule-calendar-transp', true)
	}

	/**
	 * finds all VObjects in this calendar
	 *
	 * @return {Promise<VObject[]>}
	 */
	async findAllVObjects() {
		return super.findAllByFilter((elm) => elm instanceof VObject)
	}

	/**
	 * find all VObjects filtered by type
	 *
	 * @param {string} type
	 * @return {Promise<VObject[]>}
	 */
	async findByType(type) {
		return this.calendarQuery([{
			name: [NS.IETF_CALDAV, 'comp-filter'],
			attributes: [
				['name', 'VCALENDAR'],
			],
			children: [{
				name: [NS.IETF_CALDAV, 'comp-filter'],
				attributes: [
					['name', type],
				],
			}],
		}])
	}

	/**
	 * find all VObjects in a time-range filtered by type
	 *
	 * @param {number} type
	 * @param {Date} from
	 * @param {Date} to
	 * @return {Promise<VObject[]>}
	 */
	async findByTypeInTimeRange(type, from, to) {
		return this.calendarQuery([{
			name: [NS.IETF_CALDAV, 'comp-filter'],
			attributes: [
				['name', 'VCALENDAR'],
			],
			children: [{
				name: [NS.IETF_CALDAV, 'comp-filter'],
				attributes: [
					['name', type],
				],
				children: [{
					name: [NS.IETF_CALDAV, 'time-range'],
					attributes: [
						['start', Calendar._getICalendarDateTimeFromDateObject(from)],
						['end', Calendar._getICalendarDateTimeFromDateObject(to)],
					],
				}],
			}],
		}])
	}

	/**
	 * create a VObject inside this calendar
	 *
	 * @param data
	 * @return {Promise<VObject>}
	 */
	async createVObject(data) {
		const name = StringUtility.uid('', 'ics')
		const headers = {
			'Content-Type': 'text/calendar; charset=utf-8',
		}

		return super.createObject(name, headers, data)
	}

	/**
	 * sends a calendar query as defined in
	 * https://tools.ietf.org/html/rfc4791#section-7.8
	 *
	 * @param {object[]} filter
	 * @param {object[]} prop
	 * @param {string} timezone
	 * @return {Promise<VObject[]>}
	 */
	async calendarQuery(filter, prop = null, timezone = null) {
		debug('sending an calendar-query request')

		const [skeleton] = XMLUtility.getRootSkeleton(
			[NS.IETF_CALDAV, 'calendar-query'],
		)

		if (!prop) {
			skeleton.children.push({
				name: [NS.DAV, 'prop'],
				children: this._propFindList.map((p) => ({ name: p })),
			})
		} else {
			skeleton.children.push({
				name: [NS.DAV, 'prop'],
				children: prop,
			})
		}

		// According to the spec, every calendar-query needs a filter,
		// but Nextcloud just returns all elements without a filter.
		if (filter) {
			skeleton.children.push({
				name: [NS.IETF_CALDAV, 'filter'],
				children: filter,
			})
		}

		if (timezone) {
			skeleton.children.push({
				name: [NS.IETF_CALDAV, 'timezone'],
				value: timezone,
			})
		}

		const headers = {
			Depth: '1',
		}

		const body = XMLUtility.serialize(skeleton)
		const response = await this._request.report(this.url, headers, body)
		return super._handleMultiStatusResponse(response, Calendar._isRetrievalPartial(prop))
	}

	/**
	 * sends a calendar multiget query as defined in
	 * https://tools.ietf.org/html/rfc4791#section-7.9
	 *
	 * @param {string[]} hrefs
	 * @param {object[]} prop
	 * @return {Promise<VObject[]>}
	 */
	async calendarMultiget(hrefs = [], prop) {
		debug('sending an calendar-multiget request')

		if (hrefs.length === 0) {
			return []
		}

		const [skeleton] = XMLUtility.getRootSkeleton(
			[NS.IETF_CALDAV, 'calendar-multiget'],
		)

		if (!prop) {
			skeleton.children.push({
				name: [NS.DAV, 'prop'],
				children: this._propFindList.map((p) => ({ name: p })),
			})
		} else {
			skeleton.children.push({
				name: [NS.DAV, 'prop'],
				children: prop,
			})
		}

		hrefs.forEach((href) => {
			skeleton.children.push({
				name: [NS.DAV, 'href'],
				value: href,
			})
		})

		const headers = {
			Depth: '1',
		}
		const body = XMLUtility.serialize(skeleton)
		const response = await this._request.report(this.url, headers, body)
		return super._handleMultiStatusResponse(response, Calendar._isRetrievalPartial(prop))
	}

	/**
	 * sends a calendar free-busy-query as defined in
	 * https://tools.ietf.org/html/rfc4791#section-7.10
	 *
	 * @param {Date} from
	 * @param {Date} to
	 * @return {Promise<string>}
	 */
	async freeBusyQuery(from, to) {
		/* eslint-disable no-tabs */
		// debug('sending a free-busy-query request');
		//
		// const [skeleton] = XMLUtility.getRootSkeleton(
		// 	[NS.IETF_CALDAV, 'free-busy-query'],
		// 	[NS.IETF_CALDAV, 'time-range']
		// );
		//
		// skeleton[0][0].attributes.push(['start', Calendar._getICalendarDateTimeFromDateObject(from)]);
		// skeleton[0][0].attributes.push(['end', Calendar._getICalendarDateTimeFromDateObject(to)]);
		//
		// const headers = {
		// 	'Depth': '1'
		// };
		// const body = XMLUtility.serialize(skeleton);
		// const response = await this._request.report(this.url, headers, body);
		/* eslint-enable no-tabs */

		// TODO - finish implementation
	}

	/**
	 * @inheritDoc
	 */
	static getPropFindList() {
		return super.getPropFindList().concat([
			[NS.APPLE, 'calendar-order'],
			[NS.APPLE, 'calendar-color'],
			[NS.CALENDARSERVER, 'getctag'],
			[NS.IETF_CALDAV, 'calendar-description'],
			[NS.IETF_CALDAV, 'calendar-timezone'],
			[NS.IETF_CALDAV, 'supported-calendar-component-set'],
			[NS.IETF_CALDAV, 'supported-calendar-data'],
			[NS.IETF_CALDAV, 'max-resource-size'],
			[NS.IETF_CALDAV, 'min-date-time'],
			[NS.IETF_CALDAV, 'max-date-time'],
			[NS.IETF_CALDAV, 'max-instances'],
			[NS.IETF_CALDAV, 'max-attendees-per-instance'],
			[NS.IETF_CALDAV, 'supported-collation-set'],
			[NS.IETF_CALDAV, 'calendar-free-busy-set'],
			[NS.IETF_CALDAV, 'schedule-calendar-transp'],
			[NS.IETF_CALDAV, 'schedule-default-calendar-URL'],
			[NS.OWNCLOUD, 'calendar-enabled'],
			[NS.NEXTCLOUD, 'owner-displayname'],
			[NS.NEXTCLOUD, 'trash-bin-retention-duration'],
			[NS.NEXTCLOUD, 'deleted-at'],
		])
	}

	/**
	 * checks if the prop part of a report requested partial data
	 *
	 * @param {object[]} prop
	 * @return {boolean}
	 * @private
	 */
	static _isRetrievalPartial(prop) {
		if (!prop) {
			return false
		}

		const addressBookDataProperty = prop.find((p) => {
			return p.name[0] === NS.IETF_CALDAV && p.name[1] === 'calendar-data'
		})

		if (!addressBookDataProperty) {
			return false
		}

		return !!addressBookDataProperty.children
	}

	/**
	 * creates an iCalendar formatted DATE-TIME string from a date object
	 *
	 * @param {Date} date
	 * @return {string}
	 * @private
	 */
	static _getICalendarDateTimeFromDateObject(date) {
		return [
			date.getUTCFullYear(),
			('0' + (date.getUTCMonth() + 1)).slice(-2),
			('0' + date.getUTCDate()).slice(-2),
			'T',
			('0' + date.getUTCHours()).slice(-2),
			('0' + date.getUTCMinutes()).slice(-2),
			('0' + date.getUTCSeconds()).slice(-2),
			'Z',
		].join('')
	}

}
