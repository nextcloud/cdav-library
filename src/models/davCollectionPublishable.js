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
import * as NS from "../utility/namespaceUtility.js";
import * as XMLUtility from '../utility/xmlUtility.js';
import davCollectionPublishableParser from "../parser/davCollectionPublishableParser.js";

import {debugFactory} from "../debug.js";
const debug = debugFactory('DavCollectionPublishable');

export function davCollectionPublishable(Base) {
	return class extends Base {

		/**
		 * @inheritDoc
		 */
		constructor(...args) {
			super(...args);

			super._registerPropFindParser(davCollectionPublishableParser);
		}

		/**
		 * publishes the DavCollection
		 *
		 * @returns {Promise<Base>}
		 */
		async publish() {
			debug(`Publishing ${super.url}`);

			const [skeleton] = XMLUtility.getRootSkeleton(
				[NS.CALENDARSERVER, 'publish-calendar']);
			const xml = XMLUtility.serialize(skeleton);

			await super._request.post(this._url, {
				'Content-Type' : 'application/xml; charset=utf-8'
			}, xml);

			return this;
		}

		/**
		 * unpublishes the DavCollection
		 *
		 * @returns {Promise<Base>}
		 */
		async unpublish() {
			debug(`Unpublishing ${super.url}`);

			const [skeleton] = XMLUtility.getRootSkeleton(
				[NS.CALENDARSERVER, 'unpublish-calendar']);
			const xml = XMLUtility.serialize(skeleton);

			await super._request.post(this._url, {
				'Content-Type' : 'application/xml; charset=utf-8'
			}, xml);

			return this;
		}

		/**
		 * @inheritDoc
		 */
		static getPropFindList() {
			return super.getPropFindList().concat([
				[NS.CALENDARSERVER, 'publish-url']
			]);
		}
	}
}
