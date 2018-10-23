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
import * as NS from '../utility/namespaceUtility.js';
import * as XMLUtility from '../utility/xmlUtility.js';

import { debugFactory } from '../debug.js';
const debug = debugFactory('DavCollectionShareable');

export function davCollectionShareable(Base) {
	return class extends Base {

		/**
		 * shares a DavCollection
		 *
		 * @param {string} principalUri
		 * @param {boolean} readWrite
		 * @param {string} summary
		 * @returns {Promise<Base>}
		 */
		async share(principalUri, readWrite, summary) {
			debug(`Sharing ${super.url} with ${principalUri}`);

			const [skeleton, oSetChildren] = XMLUtility.getRootSkeleton(
				[NS.OWNCLOUD, 'share'], [NS.OWNCLOUD, 'set']);

			oSetChildren.push({
				name: [NS.DAV, 'href'],
				value: principalUri
			});

			if (readWrite) {
				oSetChildren.push({
					name: [NS.OWNCLOUD, 'read-write']
				});
			}
			if (summary) {
				oSetChildren.push({
					name: [NS.OWNCLOUD, 'summary'],
					value: summary
				});
			}

			const xml = XMLUtility.serialize(skeleton);
			return super._request.post(this._url, {
				'Content-Type': 'application/xml; charset=utf-8'
			}, xml).then((res) => {
				// TODO - add to existing data

				return this;
			});
		}

		/**
		 * unshares a DAVCollection
		 *
		 * @param {string} principalUri
		 * @returns {Promise<Base>}
		 */
		async unshare(principalUri) {
			debug(`Unsharing ${super.url} with ${principalUri}`);

			const [skeleton, oSetChildren] = XMLUtility.getRootSkeleton(
				[NS.OWNCLOUD, 'share'], [NS.OWNCLOUD, 'remove']);

			oSetChildren.push({
				name: [NS.DAV, 'href'],
				value: principalUri
			});

			const xml = XMLUtility.serialize(skeleton);
			return super._request.post(this._url, {
				'Content-Type': 'application/xml; charset=utf-8'
			}, xml).then((res) => {
				// TODO - add to existing data

				return this;
			});
		}

		/**
		 * @returns {Boolean}
		 */
		isShareable() {
			// TODO implement me
		}

		/**
		 * @returns {Boolean}
		 */
		isPublishable() {
			// TODO implement me
		}

		/**
		 * @inheritDoc
		 */
		static getPropFindList() {
			return super.getPropFindList().concat([
				[NS.OWNCLOUD, 'invite'],
				[NS.CALENDARSERVER, 'allowed-sharing-modes']
			]);
		}

	};
}
