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
	 * @param {{[name: string]: any}} [options.defaultHeaders] A dictionary of default headers to apply to each request.
	 * @param {object} factories
	 */
	constructor(options, factories = {}) {
		/**
		 * root URL of DAV Server
		 *
		 * @type {string}
		 */
		this.rootUrl = options.rootUrl

		if (this.rootUrl.slice(-1) !== '/') {
			this.rootUrl += '/'
		}

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
		this._request = new Request(this.rootUrl, this.parser, options.defaultHeaders)
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
	 * Creates a CalendarHome instance for an arbitrary calendar home URL.
	 *
	 * This can be used to access calendars that are not in the current user's
	 * own calendar home – for example when acting as a calendar proxy (delegate)
	 * for another user.
	 *
	 * @param {string} calendarHomeUrl Absolute URL of the calendar home
	 * @return {CalendarHome}
	 */
	getCalendarHomeForUrl(calendarHomeUrl) {
		const cachedCalendarHome = this._findCachedCalendarHome(calendarHomeUrl)
		if (cachedCalendarHome) {
			return cachedCalendarHome
		}

		const url = this._request.pathname(calendarHomeUrl)
		return new CalendarHome(this, this._request, url, {})
	}

	/**
	 * Finds a previously discovered calendar home by URL.
	 *
	 * @param {string} calendarHomeUrl Absolute or relative URL of a calendar home
	 * @return {CalendarHome|null}
	 * @private
	 */
	_findCachedCalendarHome(calendarHomeUrl) {
		const url = this._request.pathname(calendarHomeUrl).replace(/\/?$/, '/')
		return this.calendarHomes.find((calendarHome) => calendarHome.url === url) || null
	}

	/**
	 * Fetches the group-member-set of a principal collection (e.g. a calendar-proxy group).
	 * @see https://tools.ietf.org/html/rfc3744#section-4.3
	 *
	 * @param {string} groupUrl Absolute URL of the proxy group principal
	 * @return {Promise<string[]>} Absolute URLs of member principals
	 */
	async getGroupMemberSet(groupUrl) {
		const { body } = await this._request.propFind(groupUrl, [
			[NS.DAV, 'group-member-set'],
		])
		const members = body[`{${NS.DAV}}group-member-set`] ?? []
		return members.map((href) => this._request.absoluteUrl(href))
	}

	/**
	 * Sets the group-member-set of a principal collection (e.g. a calendar-proxy group).
	 * @see https://tools.ietf.org/html/rfc3744#section-4.3
	 *
	 * @param {string} groupUrl Absolute URL of the proxy group principal
	 * @param {string[]} memberUrls Absolute URLs of the new member set
	 * @return {Promise<void>}
	 */
	async setGroupMemberSet(groupUrl, memberUrls) {
		const [skeleton] = XMLUtility.getRootSkeleton([NS.DAV, 'propertyupdate'])
		skeleton.children.push({
			name: [NS.DAV, 'set'],
			children: [{
				name: [NS.DAV, 'prop'],
				children: [{
					name: [NS.DAV, 'group-member-set'],
					children: memberUrls.map((url) => ({
						name: [NS.DAV, 'href'],
						value: url,
					})),
				}],
			}],
		})
		const body = XMLUtility.serialize(skeleton)
		await this._request.propPatch(groupUrl, {}, body)
	}

	/**
	 * Fetches the group-membership of a principal (the groups it belongs to).
	 * @see https://tools.ietf.org/html/rfc3744#section-4.4
	 *
	 * @param {string} principalUrl Absolute URL of the principal
	 * @return {Promise<string[]>} Absolute URLs of groups the principal belongs to
	 */
	async getGroupMembership(principalUrl) {
		const { body } = await this._request.propFind(principalUrl, [
			[NS.DAV, 'group-membership'],
		])
		const groups = body[`{${NS.DAV}}group-membership`] ?? []
		return groups.map((href) => this._request.absoluteUrl(href))
	}

	/**
	 * Discovers the calendar home URL for a principal via CalDAV PROPFIND.
	 *
	 * Performs a depth-0 PROPFIND on the principal URL requesting the
	 * calendar-home-set property (RFC 4791 §6.2.1).
	 *
	 * @param {string} principalUrl Absolute URL of the principal
	 * @return {Promise<string|null>} Absolute URL of the calendar home, or null if not found
	 */
	async getCalendarHomeUrlForPrincipal(principalUrl) {
		const currentPrincipalUrl = this.currentUserPrincipal
			? this._request.absoluteUrl(this.currentUserPrincipal.url)
			: null
		const requestedPrincipalUrl = this._request.absoluteUrl(principalUrl)

		if (currentPrincipalUrl === requestedPrincipalUrl && this.calendarHomes.length > 0) {
			return this._request.absoluteUrl(this.calendarHomes[0].url)
		}

		const { body } = await this._request.propFind(principalUrl, [
			[NS.IETF_CALDAV, 'calendar-home-set'],
		])
		const homes = body[`{${NS.IETF_CALDAV}}calendar-home-set`]
		if (!homes || !homes.length) {
			return null
		}
		return this._request.absoluteUrl(homes[0])
	}

	/**
	 * Returns the absolute URL of a calendar proxy group for a given principal.
	 *
	 * @param {string} principalUrl Absolute URL of the principal
	 * @param {'write'|'read'} type The proxy group type
	 * @return {string}
	 * @private
	 */
	_getProxyGroupUrl(principalUrl, type) {
		return principalUrl.replace(/\/?$/, '') + '/calendar-proxy-' + type
	}

	/**
	 * Returns the absolute URLs of all delegates for a principal, separated by permission level.
	 *
	 * @param {string} principalUrl Absolute URL of the principal
	 * @return {Promise<{write: string[], read: string[]}>} Absolute principal URLs of delegates
	 */
	async getDelegatesForPrincipal(principalUrl) {
		const [write, read] = await Promise.all([
			this.getGroupMemberSet(this._getProxyGroupUrl(principalUrl, 'write')),
			this.getGroupMemberSet(this._getProxyGroupUrl(principalUrl, 'read')),
		])
		return { write, read }
	}

	/**
	 * Adds a delegate to a principal's calendar-proxy group.
	 *
	 * Fetches the current member set and appends the new delegate if not already present.
	 *
	 * @param {string} ownerPrincipalUrl Absolute URL of the principal who owns the proxy group
	 * @param {string} delegatePrincipalUrl Absolute or relative URL of the principal to add as delegate
	 * @param {'write'|'read'} [permission='write'] The proxy group to add the delegate to
	 * @return {Promise<void>}
	 */
	async addDelegate(ownerPrincipalUrl, delegatePrincipalUrl, permission = 'write') {
		const proxyGroupUrl = this._getProxyGroupUrl(ownerPrincipalUrl, permission)
		const normalizedUrl = this._request.absoluteUrl(delegatePrincipalUrl)
		const current = await this.getGroupMemberSet(proxyGroupUrl)
		if (!current.includes(normalizedUrl)) {
			await this.setGroupMemberSet(proxyGroupUrl, [...current, normalizedUrl])
		}
	}

	/**
	 * Removes a delegate from a principal's calendar-proxy group.
	 *
	 * @param {string} ownerPrincipalUrl Absolute URL of the principal who owns the proxy group
	 * @param {string} delegatePrincipalUrl Absolute or relative URL of the principal to remove
	 * @param {'write'|'read'} [permission='write'] The proxy group to remove the delegate from
	 * @return {Promise<void>}
	 */
	async removeDelegate(ownerPrincipalUrl, delegatePrincipalUrl, permission = 'write') {
		const proxyGroupUrl = this._getProxyGroupUrl(ownerPrincipalUrl, permission)
		const normalizedUrl = this._request.absoluteUrl(delegatePrincipalUrl)
		const current = await this.getGroupMemberSet(proxyGroupUrl)
		await this.setGroupMemberSet(proxyGroupUrl, current.filter((url) => url !== normalizedUrl))
	}

	/**
	 * Returns the principal URLs of users who have granted the given principal
	 * write-proxy (delegate) access.
	 *
	 * Inspects the group-membership property for groups ending in
	 * /calendar-proxy-write and strips that suffix to obtain the owner's
	 * principal URL.
	 *
	 * @param {string} principalUrl Absolute URL of the principal
	 * @return {Promise<string[]>} Absolute principal URLs of users who delegated to this principal
	 */
	async getDelegatorPrincipalUrls(principalUrl) {
		const groups = await this.getGroupMembership(principalUrl)
		return groups
			.filter((url) => url.includes('calendar-proxy-write'))
			.map((url) => url.replace(/\/calendar-proxy-write\/?$/, '') || null)
			.filter(Boolean)
	}

	/**
	 * Returns the principal URLs and permission level of users who have granted
	 * the given principal proxy access (both read and write).
	 *
	 * Inspects the group-membership property for groups ending in
	 * /calendar-proxy-write or /calendar-proxy-read and returns objects with
	 * the owner's principal URL and the permission granted.
	 *
	 * @param {string} principalUrl Absolute URL of the principal
	 * @return {Promise<Array<{principalUrl: string, permission: 'write'|'read'}>>}
	 */
	async getDelegatorsWithPermission(principalUrl) {
		const groups = await this.getGroupMembership(principalUrl)
		const result = []

		for (const groupUrl of groups) {
			if (groupUrl.includes('calendar-proxy-write')) {
				const ownerUrl = groupUrl.replace(/\/calendar-proxy-write\/?$/, '')
				if (ownerUrl) {
					result.push({ principalUrl: ownerUrl, permission: 'write' })
				}
			} else if (groupUrl.includes('calendar-proxy-read')) {
				const ownerUrl = groupUrl.replace(/\/calendar-proxy-read\/?$/, '')
				if (ownerUrl) {
					result.push({ principalUrl: ownerUrl, permission: 'read' })
				}
			}
		}

		return result
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
