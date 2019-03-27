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

import { DavObject } from './davObject.js';
import * as NS from '../utility/namespaceUtility.js';

/**
 * @class
 */
export class VCard extends DavObject {

	/**
	 * Creates a VCard that is supposed to store address-data
	 * as specified in RFC 6350.
	 *
	 * https://tools.ietf.org/html/rfc6350
	 *
	 * @inheritDoc
	 */
	constructor(...args) {
		super(...args);

		super._exposeProperty('data', NS.IETF_CARDDAV, 'address-data', true);
		super._exposeProperty('hasphoto', NS.NEXTCLOUD, 'has-photo', false);
	}

	/**
	 * @inheritDoc
	 */
	static getPropFindList() {
		return super.getPropFindList().concat([
			[NS.IETF_CARDDAV, 'address-data']
		]);
	}

}
