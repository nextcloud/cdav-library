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
import Parser from './parser.js';
import Request from './request.js';
import * as NS from './utility/namespaceUtility.js';
import { CalendarHome } from './models/calendarHome.js';
import { AddressBookHome } from './models/addressBookHome.js';

import { debugFactory } from './debug.js';
const debug = debugFactory('index.js');

export { debugFactory as debug, NS as namespaces };

/**
 *
 */
export default class DavClient {

	/**
	 * @param {Object} options
	 * @property {String} rootUrl
	 * @param {Function} xhrProvider
	 * @param {Object} factories
	 */
	constructor(options, xhrProvider = null, factories = {}) {
		/**
		 * root URL of DAV Server
		 *
		 * @type {String}
		 */
		this.rootUrl = null;

		// TODO = always make sure rootUrl ends with /

		// overwrite rootUrl if passed as argument
		Object.assign(this, options);

		/**
		 * List of advertised DAV features
		 *
		 * @type {String[]}
		 */
		this.advertisedFeatures = [];

		/**
		 * Current user principal
		 *
		 * @type {String}
		 */
		this.principalUrl = null;

		/**
		 * Array of links to principal collections
		 *
		 * @type {String[]}
		 */
		this.principalCollections = [];

		/**
		 * Array of calendar homes
		 * will be filled after connect() was called
		 *
		 * @type {CalendarHome[]}
		 */
		this.calendarHomes = [];

		/**
		 * Array of address book homes
		 * will be filled after connect() was called
		 *
		 * @type {AddressBookHome[]}
		 */
		this.addressBookHomes = [];

		/**
		 *
		 * @type {Parser}
		 */
		this.parser = new Parser();

		/**
		 *
		 * @type {boolean}
		 * @private
		 */
		this._isConnected = false;

		/**
		 *
		 * @type {Request}
		 * @private
		 */
		this._request = new Request(this.rootUrl, this.parser, xhrProvider);
	}

	/**
	 * initializes the DAVClient
	 * @param {Object} options
	 * @returns {Promise<DavClient>}
	 */
	async connect(options = { enableCalDAV: false, enableCardDAV: false }) {
		if (this._isConnected) {
			return this;
		}

		// we don't support rfc 6764 for now - Pull-requests welcome :)
		if (!this.rootUrl) {
			throw new Error('No rootUrl configured');
		}

		await this._discoverPrincipalUri();
		debug(`PrincipalURL: ${this.principalUrl}`);

		const properties = [];
		if (options.enableCalDAV) {
			properties.push(...[
				[NS.IETF_CALDAV, 'calendar-home-set'],
				[NS.IETF_CALDAV, 'calendar-user-address-set'],
				[NS.IETF_CALDAV, 'schedule-inbox-URL'],
				[NS.IETF_CALDAV, 'schedule-outbox-URL']
			]);
		}
		if (options.enableCardDAV) {
			properties.push(...[
				[NS.IETF_CARDDAV, 'addressbook-home-set']
			]);
		}
		if (options.enableCalDAV || options.enableCardDAV) {
			properties.push(...[
				[NS.DAV, 'principal-collection-set'],
				[NS.DAV, 'displayname'],
				[NS.DAV, 'principal-URL'],
				[NS.DAV, 'supported-report-set']
			]);
		}

		if (properties.length === 0) {
			return this;
		}

		const response = await this._request.propFind(this.principalUrl, properties, 0, {}, () => null, (xhr) => {
			// store the advertised DAV features
			const dav = xhr.getResponseHeader('DAV');
			this.advertisedFeatures.push(...dav.split(',').map((s) => s.trim()));
		});
		this._extractAddressBookHomes(response.body);
		this._extractCalendarHomes(response.body);
		this._extractPrincipalCollectionSets(response.body);

		this._isConnected = true;

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
	 *
	 * @returns {Promise<void>}
	 * @private
	 */
	async _discoverPrincipalUri() {
		const response = await this._request.propFind(this.rootUrl, [
			[NS.DAV, 'current-user-principal']
		], 0);

		if (!response.body['{DAV:}current-user-principal']) {
			throw new Error('Error retrieving current user principal');
		}
		if (response.body['{DAV:}current-user-principal'].type === 'unauthenticated') {
			throw new Error('Current user is not authenticated');
		}
		this.principalUrl = this._request.pathname(
			response.body['{DAV:}current-user-principal'].href);
	}

	/**
	 * discovers all calendar-homes in this account, all principal collections
	 * and advertised features
	 *
	 * a user will most commonly only have one calendar-home,
	 * the CalDAV standard allows multiple calendar-homes though
	 *
	 * @param {Object} props
	 * @returns void
	 * @private
	 */
	async _extractCalendarHomes(props) {
		const calendarHomes = props[`{${NS.IETF_CALDAV}}calendar-home-set`];
		if (!calendarHomes) {
			return;
		}

		this.calendarHomes = calendarHomes.map((calendarHome) => {
			const url = this._request.pathname(calendarHome);
			return new CalendarHome(this, this._request, url, props);
		});
	}

	/**
	 * discovers all address-book-homes in this account, all principal collections
	 * and advertised features
	 *
	 * a user will most commonly only have one address-book-home,
	 * the CardDAV standard allows multiple address-book-homes though
	 *
	 * @param {Object} props
	 * @returns void
	 * @private
	 */
	async _extractAddressBookHomes(props) {
		const addressBookHomes = props[`{${NS.IETF_CARDDAV}}addressbook-home-set`];
		if (!addressBookHomes) {
			return;
		}

		this.addressBookHomes = addressBookHomes.map((addressbookHome) => {
			const url = this._request.pathname(addressbookHome);
			return new AddressBookHome(this, this._request, url, props);
		});
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
			return this._request.pathname(principalCollection);
		});
	}

}
