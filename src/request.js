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
// import normalizeUrl from 'normalize-url';

import { debugFactory, } from './debug.js';
const debug = debugFactory('request.js');

/**
 * wrapper class for davclient.js with url helper methods
 */
export default class Request {

	/**
	 * @param {String} baseUrl
	 * @param {Function} xhrProvider
	 */
	constructor(baseUrl, xhrProvider = null) {
		this.baseUrl = baseUrl;
		this._davClient = new dav.Client({ baseUrl, });
		this._davClient.xhrProvider = xhrProvider || this._davClient.xhrProvider;
	}

	/**
	 *
	 * @param {string} method - HTTP Method name
	 * @param {string} url - URL to do the request on
	 * @param {object} headers - additional HTTP headers to send
	 * @param {string} body
	 * @returns {Promise<*>}
	 */
	async basic(method, url, headers, body) {
		url = this.absoluteUrl(url);
		return this._davClient.request(method, url, headers, body);
	}

	/**
	 * @param {string} url - URL to do the GET request on
	 * @param {object} headers - additional HTTP headers to send
	 * @returns {Promise<*>}
	 */
	async get(url, headers) {
		url = this.absoluteUrl(url);
		return this._davClient.request('GET', url, headers);
	}

	/**
	 * @param {string} url - URL to do the PATCH request on
	 * @param {object} headers - additional HTTP headers to send
	 * @param {string} body
	 * @returns {Promise<*>}
	 */
	async patch(url, headers, body) {
		url = this.absoluteUrl(url);
		return this._davClient.request('PATCH', url, headers, body);
	}

	/**
	 * @param {string} url - URL to do the POST request on
	 * @param {object} headers - additional HTTP headers to send
	 * @param {string} body
	 * @returns {Promise<*>}
	 */
	async post(url, headers, body) {
		url = this.absoluteUrl(url);
		return this._davClient.request('POST', url, headers, body);
	}

	/**
	 * @param {string} url - URL to do the PUT request on
	 * @param {object} headers - additional HTTP headers to send
	 * @param {string} body
	 * @returns {Promise<*>}
	 */
	async put(url, headers, body) {
		url = this.absoluteUrl(url);
		return this._davClient.request('PUT', url, headers, body);
	}

	/**
	 * @param {string} url - URL to do the DELETE request on
	 * @param {object} headers - additional HTTP headers to send
	 * @returns {Promise<*>}
	 */
	async delete(url, headers = {}) {
		url = this.absoluteUrl(url);
		return this._davClient.request('DELETE', url, headers);
	}

	/**
	 *
	 * @returns {Promise<void>}
	 */
	async copy(url) {
		url = this.absoluteUrl(url);

	}

	/**
	 *
	 * @returns {Promise<void>}
	 */
	async move(url) {
		url = this.absoluteUrl(url);

	}

	/**
	 * @param {string} url - URL to do the PropFind request on
	 * @param {array} properties
	 * @param {int} depth
	 * @param {object} headers - additional HTTP headers to send
	 * @returns {Promise<*>}
	 */
	async propFind(url, properties, depth = 0, headers = {}) {
		// convert out own property format to clarke notation
		const props = properties.map((p) => `{${p[0]}}${p[1]}`);

		url = this.absoluteUrl(url);
		return this._davClient.propFind(url, props, depth, headers).then((res) => {
			if (!wasRequestSuccessful(res.status)) {
				throw new Error('PropFind request was not successful');
			}

			if (depth === 0) {
				return reducePropStats(filter200Responses(res.body.propStat));
			} else {
				const groupedPropStats = groupMultistatusByPath(res.body);
				Object.entries(groupedPropStats).forEach(([key, value, ]) => {
					groupedPropStats[key] = reducePropStats(filter200Responses(value));
				});

				return groupedPropStats;
			}
		});
	}

	/**
	 * @param {string} url - URL to do the PropPatch request on
	 * @param {object} headers - additional HTTP headers to send
	 * @param {String} body
	 * @returns {Promise<*>}
	 */
	async propPatch(url, headers, body) {
		url = this.absoluteUrl(url);
		return this._davClient.request('PROPPATCH', url, headers, body);
	}

	/**
	 * @param {string} url - URL to do the MkCol request on
	 * @param {object} headers - additional HTTP headers to send
	 * @param {String} body
	 * @returns {Promise<*>}
	 */
	async mkCol(url, headers, body) {
		url = this.absoluteUrl(url);

		Object.assign(headers, {
			'Content-Type': 'application/xml; charset=utf-8',
		});

		return this._davClient.request('MKCOL', url, headers, body);
	}

	/**
	 * @param {string} url - URL to do the REPORT request on
	 * @param {object} headers - additional HTTP headers to send
	 * @param {string} body
	 * @returns {Promise<*>}
	 */
	async report(url, headers, body) {
		url = this.absoluteUrl(url);
		return this._davClient.request('REPORT', url, headers, body).then((res) => {
			if (!wasRequestSuccessful(res.status)) {
				throw new Error('PropFind request was not successful');
			}

			const groupedPropStats = groupMultistatusByPath(res.body);
			Object.entries(groupedPropStats).forEach(([key, value, ]) => {
				groupedPropStats[key] = reducePropStats(filter200Responses(value));
			});

			return groupedPropStats;
		});
	}

	// /**
	//  * compares two URLs
	//  * @param {String} url1
	//  * @param {String} url2
	//  * @returns {boolean}
	//  */
	// compareURLs(url1, url2) {
	// 	if (url1 === url2) {
	// 		return true;
	// 	}
	//
	// 	// TODO does this cover 'foo/bar/' === 'foo/bar'?
	//
	// 	return normalizeUrl(url1) === normalizeUrl(url2);
	// }

	/**
	 * returns name of file / folder
	 * @params {string} url
	 * @returns {string}
	 */
	filename(url) {
		let pathname = this.pathname(url);
		if (pathname.substr(-1) === '/') { // TODO - use normalizeUrl instead?
			pathname = pathname.substr(0, pathname.length - 1);
		}

		const slashPos = pathname.lastIndexOf('/');
		return pathname.substr(slashPos);
	}

	/**
	 * returns pathname for a URL
	 * @params {string} url
	 * @returns {string}
	 */
	pathname(url) {
		const urlObject = new URL(url, this.baseUrl);
		return urlObject.pathname;
	}

	/**
	 * @param {string} url
	 * @returns {string}
	 */
	absoluteUrl(url) {
		const urlObject = new URL(url, this.baseUrl);
		return urlObject.href;
	}

}

/**
 *
 * @param responses
 */
function groupMultistatusByPath(responses) {
	const grouped = {};

	responses.forEach((response) => {
		grouped[response.href] = response.propStat;
	});

	return grouped;
}

/**
 *
 * @param {Array} propStat
 * @return {Array}
 */
function filter200Responses(propStat) {
	return propStat.filter((p) => {
		return wasRequestSuccessful(getStatusCodeFromString(p.status));
	});
}

/**
 * Check if response code is in the 2xx section
 * @param {Number} status
 * @returns {boolean}
 */
function wasRequestSuccessful(status) {
	return status >= 200 && status < 300;
}

/**
 *
 * @param {String} status
 * @returns {Number}
 */
function getStatusCodeFromString(status) {
	return parseInt(status.split(' ')[1]);
}

/**
 * @param {Array} propStats
 * @return {Object}
 */
function reducePropStats(propStats) {
	const propObjects = [{}, ];

	propStats.forEach((propStat) => {
		propObjects.push(propStat.properties);
	});

	return Object.assign.apply(null, propObjects);
}
