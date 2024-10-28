/**
 * CDAV Library
 *
 * This library is part of the Nextcloud project
 *
 * SPDX-FileCopyrightText: 2018 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { DavCollection } from './davCollection.js'
import * as NS from '../utility/namespaceUtility.js'
import { AddressBook } from './addressBook.js'

import { debugFactory } from '../debug.js'
const debug = debugFactory('AddressBookHome')

/**
 * This class represents an address book home as specified in
 * https://tools.ietf.org/html/rfc6352#section-7.1.1
 *
 * As of this versions' release, the Nextcloud server will always
 * return only one address book home. Despite that, RFC6352 allows
 * a server to return multiple address book homes though.
 */
export class AddressBookHome extends DavCollection {

	/**
	 * @inheritDoc
	 */
	constructor(...args) {
		super(...args)

		super._registerCollectionFactory('{' + NS.IETF_CARDDAV + '}addressbook', AddressBook)
	}

	/**
	 * finds all address books in this address book home
	 *
	 * @return {Promise<AddressBook[]>}
	 */
	async findAllAddressBooks() {
		return super.findAllByFilter((elm) => elm instanceof AddressBook)
	}

	/**
	 * creates a new address book collection
	 *
	 * @param {string} displayname
	 * @return {Promise<AddressBook>}
	 */
	async createAddressBookCollection(displayname) {
		debug('creating an addressbook collection')

		const props = [{
			name: [NS.DAV, 'resourcetype'],
			children: [{
				name: [NS.DAV, 'collection'],
			}, {
				name: [NS.IETF_CARDDAV, 'addressbook'],
			}],
		}, {
			name: [NS.DAV, 'displayname'],
			value: displayname,
		}]

		const name = super._getAvailableNameFromToken(displayname)
		return super.createCollection(name, props)
	}

}
