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
import Request from "./request.js";
import * as NS from "./utility/namespaceUtility.js";
import {CalendarHome} from "./models/calendarHome.js";
import {AddressBookHome} from "./models/addressBookHome.js";

import {debugFactory} from "./debug.js";
const debug = debugFactory('index.js');

export {debugFactory as debug, NS as namespaces};

/**
 *
 */
export default class DavClient {

	/**
	 * @param {Object} options
	 * @param {Function} xhrProvider
	 * @param {Object} factories
	 */
	constructor(options, xhrProvider = null, factories = {}) {
		Object.assign(this, {
			rootUrl: null,
		}, options);

		Object.assign(this, {
			advertisedFeatures: [],
			principalUrl: null,
			principalCollections: [],
			calendarHomes: [],
			addressBookHomes: [],
		});

		this._request = new Request(this.rootUrl, xhrProvider);
	}

	/**
	 * initializes the DAVClient
	 * @param {Object} options
	 * @returns {Promise<DavClient>}
	 */
	async connect(options={enableCalDAV: false, enableCardDAV: false}) {
		// TODO - check if already connected and don't connect again

		// we don't support rfc 6764 for now - Pull-requests welcome :)
		if (!this.rootUrl) {
			throw new Error('No rootUrl configured');
		}

		await this._discoverPrincipalUri();
		debug(`PrincipalURL: ${this.principalUrl}`);

		if (options.enableCalDAV) {
			debug(`loading calendar-homes`);
			await this._discoverCalendarHomes();
		}
		if (options.enableCardDAV) {
			debug(`loading addressbook-homes`);
			await this._discoverAddressBookHomes();
		}

		return this;
	}

	// /**
	//  * @returns {Promise<[any , any , any , any , any , any , any , any , any , any]>}
	//  */
	// async sync() {
	//     const promises = [];
	//
	//     // Ideally we would also check for new calendar-homes and
	//     // new addressbook-homes as well, but then Nextcloud will
	//     // ever only send provide one each, so we omit this step
	//     // to cut down network traffic
	//
	//     this.calendarHomes.forEach((calendarHome) => {
	//         promises.push(calendarHome.sync());
	//     });
	//     this.addressbookHomes.forEach((addressbookHome) => {
	//         promises.push(addressbookHome.sync());
	//     });
	//
	//     return Promise.all(promises);
	// }

	/**
	 *
	 * @returns {Promise<void>}
	 */
	async principalPropertySearch() {
		// TODO - implement me
	}

	/**
	 * discovers the accounts principal uri solely based on rootURL
	 * @returns {Promise<void>}
	 * @private
	 */
	async _discoverPrincipalUri() {
		const props = await this._request.propFind(this.rootUrl, [
			[NS.DAV, 'current-user-principal'],
		], 0);

		this.principalUrl = this._request.pathname(props["{DAV:}current-user-principal"][0].textContent);
	}

	/**
	 * discovers all calendar-homes in this account, all principal collections
	 * and advertised features
	 *
	 * a user will most commonly only have one calendar-home,
	 * the CalDAV standard allows multiple calendar-homes though
	 *
	 * @returns {Promise<void>}
	 * @private
	 */
	async _discoverCalendarHomes() {
		const props = await this._request.propFind(this.principalUrl, [
			[NS.IETF_CALDAV, 'calendar-home-set'],
			[NS.DAV, 'principal-collection-set'],
			[NS.IETF_CALDAV, 'calendar-user-address-set'],
			[NS.IETF_CALDAV, 'schedule-inbox-URL'],
			[NS.IETF_CALDAV, 'schedule-outbox-URL'],
			[NS.DAV, 'displayname'],
			[NS.DAV, 'principal-URL'],
			[NS.DAV, 'supported-report-set']
		], 0);

		// TODO - store advertised features

		const calendarHomes = props[`{${NS.IETF_CALDAV}}calendar-home-set`];
		this.calendarHomes = calendarHomes.map((calendarHome) => {
			const url = this._request.pathname(calendarHome.textContent);
			return new CalendarHome(this, this._request, url, props);
		});
		this._extractPrincipalCollectionSets(props);
	}

	/**
	 * discovers all address-book-homes in this account, all principal collections
	 * and advertised features
	 *
	 * a user will most commonly only have one address-book-home,
	 * the CardDAV standard allows multiple address-book-homes though
	 *
	 * @returns {Promise<void>}
	 * @private
	 */
	async _discoverAddressBookHomes() {
		const props = await this._request.propFind(this.principalUrl, [
			[NS.IETF_CARDDAV, 'addressbook-home-set'],
			[NS.DAV, 'principal-collection-set'],
		], 0);

		// TODO - store advertised features

		const addressBookHomes = props[`{${NS.IETF_CARDDAV}}addressbook-home-set`];
		this.addressBookHomes = addressBookHomes.map((addressbookHome) => {
			const url = this._request.pathname(addressbookHome.textContent);
			return new AddressBookHome(this, this._request, url, props);
		});
		this._extractPrincipalCollectionSets(props);
	}

	/**
	 * extracts principalCollection Information from an existing props object
	 * returned from the server
	 *
	 * @param {Object} props
	 * @returns void
	 * @private
	 */
	_extractPrincipalCollectionSets(props) {
		const principalCollectionSets = props[`{${NS.DAV}}principal-collection-set`];
		this.principalCollections = principalCollectionSets.map((principalCollection) => {
			return this._request.pathname(principalCollection.textContent);
		});
	}
}

