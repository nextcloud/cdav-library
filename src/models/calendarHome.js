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
import { DavCollection } from './davCollection.js';
import { Calendar } from './calendar.js';
import { Subscription } from './subscription.js';
import ScheduleInbox from './scheduleInbox.js';
import ScheduleOutbox from './scheduleOutbox.js';
import * as NS from '../utility/namespaceUtility.js';
import * as XMLUtility from '../utility/xmlUtility.js';

import { debugFactory } from '../debug.js';
import { CalendarTrashBin } from './calendarTrashBin.js';
import { DeletedCalendar } from './deletedCalendar';
const debug = debugFactory('CalendarHome');

/**
 * This class represents a calendar home as specified in
 * https://tools.ietf.org/html/rfc4791#section-6.2.1
 *
 * As of this versions' release, the Nextcloud server will always
 * return only one calendar home. Despite that, RFC4791 allows
 * a server to return multiple calendar homes though.
 */
export class CalendarHome extends DavCollection {

	/**
	 * @inheritDoc
	 */
	constructor(...args) {
		super(...args);

		super._registerCollectionFactory('{' + NS.IETF_CALDAV + '}calendar', Calendar);
		super._registerCollectionFactory('{' + NS.NEXTCLOUD + '}deleted-calendar', DeletedCalendar);
		super._registerCollectionFactory('{' + NS.CALENDARSERVER + '}subscribed', Subscription);
		super._registerCollectionFactory('{' + NS.IETF_CALDAV + '}schedule-inbox', ScheduleInbox);
		super._registerCollectionFactory('{' + NS.IETF_CALDAV + '}schedule-outbox', ScheduleOutbox);
		super._registerCollectionFactory('{' + NS.NEXTCLOUD + '}trash-bin', CalendarTrashBin);
	}

	/**
	 * Finds all CalDAV-specific collections in this calendar home
	 *
	 * @returns {Promise<(Calendar|Subscription|ScheduleInbox|ScheduleOutbox|CalendarTrashBin|DeletedCalendar)[]>}
	 */
	async findAllCalDAVCollections() {
		return super.findAllByFilter((elm) => elm instanceof Calendar || elm instanceof CalendarTrashBin
			|| elm instanceof Subscription || elm instanceof ScheduleInbox || elm instanceof ScheduleOutbox
			|| elm instanceof DeletedCalendar);
	}

	/**
	 * Finds all CalDAV-specific collections in this calendar home, grouped by type
	 *
	 * @returns {Promise<{
			calendars: Calendar[],
			deletedCalendars: DeletedCalendar[],
			trashBins: CalendarTrashBin[],
			subscriptions: Subscription[],
			scheduleInboxes: ScheduleInbox[],
			scheduleOutboxes: ScheduleOutbox[],
		}>}
	 */
	async findAllCalDAVCollectionsGrouped() {
		const collections = await super.findAll();

		return {
			calendars: collections.filter(c => c instanceof Calendar && !(c instanceof ScheduleInbox) && !(c instanceof Subscription) && !(c instanceof DeletedCalendar)),
			deletedCalendars: collections.filter(c => c instanceof DeletedCalendar),
			trashBins: collections.filter(c => c instanceof CalendarTrashBin),
			subscriptions: collections.filter(c => c instanceof Subscription),
			scheduleInboxes: collections.filter(c => c instanceof ScheduleInbox),
			scheduleOutboxes: collections.filter(c => c instanceof ScheduleOutbox)
		};
	}

	/**
	 * finds all calendars in this calendar home
	 *
	 * @returns {Promise<Calendar[]>}
	 */
	async findAllCalendars() {
		return super.findAllByFilter((elm) => elm instanceof Calendar && !(elm instanceof ScheduleInbox) && !(elm instanceof Subscription) && !(elm instanceof DeletedCalendar));
	}

	/**
	 * Finds all deleted calendars in this calendar home
	 *
	 * @returns {Promise<DeletedCalendar[]>}
	 */
	async findAllDeletedCalendars() {
		return super.findAllByFilter((elm) => elm instanceof DeletedCalendar);
	}

	/**
	 * finds all subscriptions in this calendar home
	 *
	 * @returns {Promise<Subscription[]>}
	 */
	async findAllSubscriptions() {
		return super.findAllByFilter((elm) => elm instanceof Subscription);
	}

	/**
	 * finds all schedule inboxes in this calendar home
	 *
	 * @returns {Promise<ScheduleInbox[]>}
	 */
	async findAllScheduleInboxes() {
		return super.findAllByFilter((elm) => elm instanceof ScheduleInbox);
	}

	/**
	 * finds all schedule outboxes in this calendar home
	 *
	 * @returns {Promise<ScheduleOutbox[]>}
	 */
	async findAllScheduleOutboxes() {
		return super.findAllByFilter((elm) => elm instanceof ScheduleOutbox);
	}

	/**
     * creates a new calendar collection
	 *
     * @param {String} displayname
     * @param {String} color
	 * @param {String[]} supportedComponentSet
	 * @param {Number} order
	 * @param {String=} timezone
     * @returns {Promise<Calendar>}
     */
	async createCalendarCollection(displayname, color, supportedComponentSet = null, order = null, timezone = null) {
		debug('creating a calendar collection');

		const props = [{
			name: [NS.DAV, 'resourcetype'],
			children: [{
				name: [NS.DAV, 'collection']
			}, {
				name: [NS.IETF_CALDAV, 'calendar']
			}]
		}, {
			name: [NS.DAV, 'displayname'],
			value: displayname
		}, {
			name: [NS.APPLE, 'calendar-color'],
			value: color
		}, {
			name: [NS.OWNCLOUD, 'calendar-enabled'],
			value: '1'
		}];

		if (timezone) {
			props.push({
				name: [NS.IETF_CALDAV, 'calendar-timezone'],
				value: timezone
			});
		}

		if (supportedComponentSet) {
			props.push({
				name: [NS.IETF_CALDAV, 'supported-calendar-component-set'],
				children: supportedComponentSet.map((supportedComponent) => {
					return {
						name: [NS.IETF_CALDAV, 'comp'],
						attributes: [
							['name', supportedComponent]
						]
					};
				})
			});
		}

		if (order) {
			props.push({
				name: [NS.APPLE, 'calendar-order'],
				value: order
			});
		}

		const name = super._getAvailableNameFromToken(displayname);
		return super.createCollection(name, props);
	}

	/**
	 * creates a new subscription
	 *
     * @param {String} displayname
     * @param {String} color
     * @param {String} source
	 * @param {Number} order
     * @returns {Promise<Subscription>}
     */
	async createSubscribedCollection(displayname, color, source, order = null) {
		debug('creating a subscribed collection');

		const props = [{
			name: [NS.DAV, 'resourcetype'],
			children: [{
				name: [NS.DAV, 'collection']
			}, {
				name: [NS.CALENDARSERVER, 'subscribed']
			}]
		}, {
			name: [NS.DAV, 'displayname'],
			value: displayname
		}, {
			name: [NS.APPLE, 'calendar-color'],
			value: color
		}, {
			name: [NS.OWNCLOUD, 'calendar-enabled'],
			value: '1'
		}, {
			name: [NS.CALENDARSERVER, 'source'],
			children: [{
				name: [NS.DAV, 'href'],
				value: source
			}]
		}];

		if (order) {
			props.push({
				name: [NS.APPLE, 'calendar-order'],
				value: order
			});
		}

		const name = super._getAvailableNameFromToken(displayname);
		return super.createCollection(name, props);
	}

	/**
     * Search all calendars the user has access to
     * This method makes use of Nextcloud's custom
     * calendar Search API
     *
     * Documentation about that API can be found at: ...
     *
     * @returns {Promise<VObject[]>}
     */
	async search() {
		// TODO - implement me
	}

	/**
	 * enables the birthday calendar for the Calendar Home that belongs to this user
	 *
	 * @returns {Promise<void>}
	 */
	async enableBirthdayCalendar() {
		const [skeleton] = XMLUtility.getRootSkeleton(
			[NS.NEXTCLOUD, 'enable-birthday-calendar']
		);
		const xmlBody = XMLUtility.serialize(skeleton);

		await this._request.post(this.url, {}, xmlBody);
	}

}
