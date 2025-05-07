/**
 * CDAV Library
 *
 * This library is part of the Nextcloud project
 *
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import Parser from './parser.js'
import Request from './request.js'
import * as NS from './utility/namespaceUtility.js'
import * as XMLUtility from './utility/xmlUtility.js'
import { CalendarHome } from './models/calendarHome.js'
import { AddressBookHome } from './models/addressBookHome.js'
import { Principal } from './models/principal.js'

import { debugFactory } from './debug.js'
const debug = debugFactory('index.js')

export { debugFactory as debug, NS as namespaces }

/**
 *
 */
export default class DavClient {

	/**
	 * @param {object} options
	 * @param {string} options.rootUrl
	 * @param {object} factories
	 */
	constructor(options, factories = {}) {
		/**
		 * root URL of DAV Server
		 *
		 * @type {string}
		 */
		this.rootUrl = null

		if (options.rootUrl.slice(-1) !== '/') {
			options.rootUrl += '/'
		}

		// overwrite rootUrl if passed as argument
		Object.assign(this, options)

		/**
		 * List of advertised DAV features
		 *
		 * @type {string[]}
		 */
		this.advertisedFeatures = []

		/**
		 * Principal object of current user
		 *
		 * @type {Principal}
		 */
		this.currentUserPrincipal = null

		/**
		 * Array of links to principal collections
		 *
		 * @type {string[]}
		 */
		this.principalCollections = []

		/**
		 * Array of calendar homes
		 * will be filled after connect() was called
		 *
		 * @type {CalendarHome[]}
		 */
		this.calendarHomes = []

		/**
		 * The calendar-home that houses all public calendars
		 * findAll will obviously not work ;)
		 * use find(token) to get a public calendar
		 *
		 * @type {CalendarHome|null}
		 */
		this.publicCalendarHome = null

		/**
		 * Array of address book homes
		 * will be filled after connect() was called
		 *
		 * @type {AddressBookHome[]}
		 */
		this.addressBookHomes = []

		/**
		 *
		 * @type {Parser}
		 */
		this.parser = new Parser()

		/**
		 *
		 * @type {boolean}
		 * @private
		 */
		this._isConnected = false

		/**
		 *
		 * @type {Request}
		 * @private
		 */
		this._request = new Request(this.rootUrl, this.parser)
	}

	/**
	 * initializes the DAVClient
	 * @param {object} options
	 * @return {Promise<DavClient>}
	 */
	async connect(options = { enableCalDAV: false, enableCardDAV: false }) {
		if (this._isConnected) {
			return this
		}

		// we don't support rfc 6764 for now - Pull-requests welcome :)
		if (!this.rootUrl) {
			throw new Error('No rootUrl configured')
		}

		const principalUrl = await this._discoverPrincipalUri()
		debug(`PrincipalURL: ${principalUrl}`)

		const propFindList = Principal.getPropFindList(options)
		if (options.enableCalDAV || options.enableCardDAV) {
			propFindList.push(
				[NS.DAV, 'principal-collection-set'],
				[NS.DAV, 'supported-report-set'],
			)
		}

		const [propFindResponse, optionsResponse] = await Promise.all([
			this._request.propFind(principalUrl, propFindList),
			this._request.options(principalUrl),
		])

		this.currentUserPrincipal = new Principal(null, this._request, principalUrl, propFindResponse.body)
		this._extractAdvertisedDavFeatures(optionsResponse.headers)
		this._extractAddressBookHomes(propFindResponse.body)
		this._extractCalendarHomes(propFindResponse.body)
		this._extractPrincipalCollectionSets(propFindResponse.body)
		this._createPublicCalendarHome()

		this._isConnected = true

		return this
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
	 * performs a principal property search based on a principal's displayname
	 *
	 * @param {string} name
	 * @return {Promise<Principal[]>}
	 */
	async principalPropertySearchByDisplayname(name) {
		return this.principalPropertySearch([
			{ name: [NS.DAV, 'displayname'] },
		], name)
	}

	/**
	 * performs a principal property search based on a principal's displayname OR email address
	 *
	 * @param {string} value
	 * @return {Promise<Principal[]>}
	 */
	async principalPropertySearchByDisplaynameOrEmail(value) {
		return this.principalPropertySearch([
			{ name: [NS.DAV, 'displayname'] },
			{ name: [NS.SABREDAV, 'email-address'] },
		], value, 'anyof')
	}

	/**
	 * Performs a principal property based on the address of a room
	 *
	 * @param {string} address Address of the building the room is in
	 * @return {Promise<Principal[]>}
	 */
	async principalPropertySearchByAddress(address) {
		return this.principalPropertySearch([
			{ name: [NS.NEXTCLOUD, 'room-building-address'] },
		], address)
	}

	/**
	 * Performs a principal property search based on the address and story of a room
	 *
	 * @param {string} address Address of the building the room is in
	 * @param {string} story Story inside the building the room is in
	 * @return {Promise<[]>}
	 */
	async principalPropertySearchByAddressAndStory(address, story) {
		const [skeleton] = XMLUtility.getRootSkeleton(
			[NS.DAV, 'principal-property-search'])

		skeleton.children.push({
			name: [NS.DAV, 'property-search'],
			children: [{
				name: [NS.DAV, 'prop'],
				children: [{
					name: [NS.NEXTCLOUD, 'room-building-address'],
				}],
			}, {
				name: [NS.DAV, 'match'],
				value: address,
			}],
		})
		skeleton.children.push({
			name: [NS.DAV, 'property-search'],
			children: [{
				name: [NS.DAV, 'prop'],
				children: [{
					name: [NS.NEXTCLOUD, 'room-building-story'],
				}],
			}, {
				name: [NS.DAV, 'match'],
				value: story,
			}],
		})

		skeleton.children.push({
			name: [NS.DAV, 'prop'],
			children: Principal
				.getPropFindList({ enableCalDAV: true })
				.map((propFindListItem) => ({ name: propFindListItem })),
		})

		// We are searching all principal collections, not just one
		skeleton.children.push({ name: [NS.DAV, 'apply-to-principal-collection-set'] })

		const xml = XMLUtility.serialize(skeleton)
		return this._request.report(this.rootUrl, { Depth: 0 }, xml).then((response) => {
			const result = []

			Object.entries(response.body).forEach(([path, props]) => {
				const url = this._request.pathname(path)
				result.push(new Principal(null, this._request, url, props))
			})

			return result
		})
	}

	/**
	 * Performs a principal property search based on multiple advanced filters
	 *
	 * @param {object} query The destructuring query object
	 * @param {string=} query.displayName The display name to filter by
	 * @param {number=} query.capacity The minimum required seating capacity
	 * @param {string[]=} query.features The features to filter by
	 * @param {string=} query.roomType The room type to filter by
	 * @return {Promise<Principal[]>}
	 */
	async advancedPrincipalPropertySearch(query) {
		const [skeleton] = XMLUtility.getRootSkeleton([NS.DAV, 'principal-property-search'])

		// Every prop has to match
		skeleton.attributes = [
			['test', 'allof'],
		]

		const { displayName, capacity, features, roomType } = query
		if (displayName) {
			skeleton.children.push({
				name: [NS.DAV, 'property-search'],
				children: [{
					name: [NS.DAV, 'prop'],
					children: [
						{ name: [NS.DAV, 'displayname'] },
					],
				}, {
					name: [NS.DAV, 'match'],
					value: displayName,
				}],
			})
		}
		if (capacity) {
			skeleton.children.push({
				name: [NS.DAV, 'property-search'],
				children: [{
					name: [NS.DAV, 'prop'],
					children: [{
						name: [NS.NEXTCLOUD, 'room-seating-capacity'],
					}],
				}, {
					name: [NS.DAV, 'match'],
					value: capacity,
				}],
			})
		}
		if (features && features.length > 0) {
			skeleton.children.push({
				name: [NS.DAV, 'property-search'],
				children: [{
					name: [NS.DAV, 'prop'],
					children: [{
						name: [NS.NEXTCLOUD, 'room-features'],
					}],
				}, {
					name: [NS.DAV, 'match'],
					value: features.join(','),
				}],
			})
		}
		if (roomType) {
			skeleton.children.push({
				name: [NS.DAV, 'property-search'],
				children: [{
					name: [NS.DAV, 'prop'],
					children: [{
						name: [NS.NEXTCLOUD, 'room-type'],
					}],
				}, {
					name: [NS.DAV, 'match'],
					value: roomType,
				}],
			})
		}

		// Do not perform search if no parameter is given
		if (skeleton.children.length === 0) {
			return []
		}

		skeleton.children.push({
			name: [NS.DAV, 'prop'],
			children: Principal
				.getPropFindList({ enableCalDAV: true })
				.map((propFindListItem) => ({ name: propFindListItem })),
		})

		// We are searching all principal collections, not just one
		skeleton.children.push({ name: [NS.DAV, 'apply-to-principal-collection-set'] })

		const xml = XMLUtility.serialize(skeleton)
		const response = await this._request.report(this.rootUrl, { Depth: 0 }, xml)
		return Object
			.entries(response.body)
			.map(([path, props]) => {
				const url = this._request.pathname(path)
				return new Principal(null, this._request, url, props)
			})
	}

	/**
	 * performs a principal property search
	 * @see https://tools.ietf.org/html/rfc3744#section-9.4
	 *
	 * @param {Array} props
	 * @param {string} match
	 * @param {string} test 'anyof', 'allof' or none
	 * @return {Promise<Principal[]>}
	 */
	async principalPropertySearch(props, match, test) {
		const [skeleton, propSearch] = XMLUtility.getRootSkeleton(
			[NS.DAV, 'principal-property-search'],
			[NS.DAV, 'property-search'],
		)
		if (test) {
			skeleton.attributes = [
				['test', test],
			]
		}

		propSearch.push({
			name: [NS.DAV, 'prop'],
			children: props,
		}, {
			name: [NS.DAV, 'match'],
			value: match,
		})

		skeleton.children.push({
			name: [NS.DAV, 'prop'],
			children: Principal
				.getPropFindList({ enableCalDAV: true })
				.map((propFindListItem) => ({ name: propFindListItem })),
		})

		// We are searching all principal collections, not just one
		skeleton.children.push({ name: [NS.DAV, 'apply-to-principal-collection-set'] })

		const xml = XMLUtility.serialize(skeleton)
		return this._request.report(this.rootUrl, { Depth: 0 }, xml).then((response) => {
			const result = []

			Object.entries(response.body).forEach(([path, props]) => {
				const url = this._request.pathname(path)
				result.push(new Principal(null, this._request, url, props))
			})

			return result
		})
	}

	/**
	 * finds one principal at a given principalUrl
	 *
	 * @param {string} principalUrl
	 * @return {Promise<Principal>}
	 */
	async findPrincipal(principalUrl) {
		return this._request.propFind(principalUrl, Principal.getPropFindList()).then(({ body }) => {
			return new Principal(null, this._request, principalUrl, body)
		}).catch((err) => {
			// TODO: improve error handling
			console.debug(err)
		})
	}

	/**
	 * finds all principals in a collection at a given principalCollectionUrl
	 *
	 * @param {string} principalCollectionUrl
	 * @param {import('./models/principal.js').PrincipalPropfindOptions} options Passed to Principal.getPropFindList()
	 * @return {Promise<Principal[]>}
	 */
	async findPrincipalsInCollection(principalCollectionUrl, options = {}) {
		try {
			const { body } = await this._request.propFind(
				principalCollectionUrl,
				Principal.getPropFindList(options),
				1,
			)
			const principals = Object.entries(body)
				.filter(([principalUrl]) => !principalCollectionUrl.endsWith(principalUrl))
				.map(([principalUrl, principal]) => new Principal(
					null,
					this._request,
					principalUrl,
					principal,
				))
			return principals
		} catch (err) {
			// TODO: improve error handling
			console.debug(err)
		}
	}

	/**
	 * discovers the accounts principal uri solely based on rootURL
	 *
	 * @return {Promise<string>}
	 * @private
	 */
	async _discoverPrincipalUri() {
		const response = await this._request.propFind(this.rootUrl, [
			[NS.DAV, 'current-user-principal'],
		], 0)

		if (!response.body['{DAV:}current-user-principal']) {
			throw new Error('Error retrieving current user principal')
		}
		if (response.body['{DAV:}current-user-principal'].type === 'unauthenticated') {
			throw new Error('Current user is not authenticated')
		}
		return this._request.pathname(response.body['{DAV:}current-user-principal'].href)
	}

	/**
	 * discovers all calendar-homes in this account, all principal collections
	 * and advertised features
	 *
	 * a user will most commonly only have one calendar-home,
	 * the CalDAV standard allows multiple calendar-homes though
	 *
	 * @param {object} props
	 * @return void
	 * @private
	 */
	async _extractCalendarHomes(props) {
		const calendarHomes = props[`{${NS.IETF_CALDAV}}calendar-home-set`]
		if (!calendarHomes) {
			return
		}

		this.calendarHomes = calendarHomes.map((calendarHome) => {
			const url = this._request.pathname(calendarHome)
			return new CalendarHome(this, this._request, url, props)
		})
	}

	/**
	 * discovers all address-book-homes in this account, all principal collections
	 * and advertised features
	 *
	 * a user will most commonly only have one address-book-home,
	 * the CardDAV standard allows multiple address-book-homes though
	 *
	 * @param {object} props
	 * @return void
	 * @private
	 */
	async _extractAddressBookHomes(props) {
		const addressBookHomes = props[`{${NS.IETF_CARDDAV}}addressbook-home-set`]
		if (!addressBookHomes) {
			return
		}

		this.addressBookHomes = addressBookHomes.map((addressbookHome) => {
			const url = this._request.pathname(addressbookHome)
			return new AddressBookHome(this, this._request, url, props)
		})
	}

	/**
	 * extracts principalCollection Information from an existing props object
	 * returned from the server
	 *
	 * @param {object} props
	 * @return void
	 * @private
	 */
	_extractPrincipalCollectionSets(props) {
		const principalCollectionSets = props[`{${NS.DAV}}principal-collection-set`]
		this.principalCollections = principalCollectionSets.map((principalCollection) => {
			return this._request.pathname(principalCollection)
		})
	}

	/**
	 * extracts the advertised features supported by the DAV server
	 *
	 * @param {object} headers
	 * @return void
	 * @private
	 */
	_extractAdvertisedDavFeatures(headers) {
		const dav = headers.dav
		this.advertisedFeatures.push(...dav.split(',').map((s) => s.trim()))
	}

	/**
	 * Creates a public calendar home
	 *
	 * @return void
	 * @private
	 */
	_createPublicCalendarHome() {
		const url = this._request.pathname(this.rootUrl) + 'public-calendars/'
		this.publicCalendarHome = new CalendarHome(this, this._request, url, {})
	}

}
