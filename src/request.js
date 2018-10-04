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

import * as NS from './utility/namespaceUtility.js';
import * as XMLUtility from './utility/xmlUtility.js';

/**
 * Request class is used to send any kind of request to the DAV server
 * It also parses incoming XML responses
 */
export default class Request {

	/**
	 * Creates a new Request object
	 *
	 * @param {String} baseUrl - root url of DAV server, use OC.remote('dav')
	 * @param {Parser} parser - instance of Parser class
	 * @param {Function} xhrProvider - Function that returns new XMLHttpRequest objects
	 */
	constructor(baseUrl, parser, xhrProvider = (() => new XMLHttpRequest())) {
		this.baseUrl = baseUrl;
		this.parser = parser;
		this.xhrProvider = xhrProvider;
	}

	/**
	 * sends GET request
	 *
	 * @param {String} url - URL to do the GET request on
	 * @param {Object} headers - additional HTTP headers to send
	 * @param {String} body
	 * @param {Function} beforeRequestHandler - custom function to be called before the request is made
	 * @param {Function} afterRequestHandler - custom function to be called after the request was made
	 * @returns {Promise<*>}
	 */
	async get(url, headers, body = null, beforeRequestHandler = (() => null), afterRequestHandler = (() => null)) {
		return this.request('GET', url, headers, body, beforeRequestHandler, afterRequestHandler);
	}

	/**
	 * sends PATCH request
	 *
	 * @param {String} url - URL to do the PATCH request on
	 * @param {Object} headers - additional HTTP headers to send
	 * @param {String} body
	 * @param {Function} beforeRequestHandler - custom function to be called before the request is made
	 * @param {Function} afterRequestHandler - custom function to be called after the request was made
	 * @returns {Promise<*>}
	 */
	async patch(url, headers, body, beforeRequestHandler = (() => null), afterRequestHandler = (() => null)) {
		return this.request('PATCH', url, headers, body, beforeRequestHandler, afterRequestHandler);
	}

	/**
	 * sends POST request
	 *
	 * @param {String} url - URL to do the POST request on
	 * @param {Object} headers - additional HTTP headers to send
	 * @param {String} body
	 * @param {Function} beforeRequestHandler - custom function to be called before the request is made
	 * @param {Function} afterRequestHandler - custom function to be called after the request was made
	 * @returns {Promise<*>}
	 */
	async post(url, headers, body, beforeRequestHandler = (() => null), afterRequestHandler = (() => null)) {
		return this.request('POST', url, headers, body, beforeRequestHandler, afterRequestHandler);
	}

	/**
	 * sends PUT request
	 *
	 * @param {String} url - URL to do the PUT request on
	 * @param {Object} headers - additional HTTP headers to send
	 * @param {String} body
	 * @param {Function} beforeRequestHandler - custom function to be called before the request is made
	 * @param {Function} afterRequestHandler - custom function to be called after the request was made
	 * @returns {Promise<*>}
	 */
	async put(url, headers, body, beforeRequestHandler = (() => null), afterRequestHandler = (() => null)) {
		return this.request('PUT', url, headers, body, beforeRequestHandler, afterRequestHandler);
	}

	/**
	 * sends DELETE request
	 *
	 * @param {String} url - URL to do the DELETE request on
	 * @param {Object} headers - additional HTTP headers to send
	 * @param {String} body
	 * @param {Function} beforeRequestHandler - custom function to be called before the request is made
	 * @param {Function} afterRequestHandler - custom function to be called after the request was made
	 * @returns {Promise<*>}
	 */
	async delete(url, headers = {}, body = null, beforeRequestHandler = (() => null), afterRequestHandler = (() => null)) {
		return this.request('DELETE', url, headers, body, beforeRequestHandler, afterRequestHandler);
	}

	/**
	 * sends COPY request
	 *
	 * @param {String} url - URL to do the DELETE request on
	 * @param {Object} headers - additional HTTP headers to send
	 * @param {String} body
	 * @param {Function} beforeRequestHandler - custom function to be called before the request is made
	 * @param {Function} afterRequestHandler - custom function to be called after the request was made
	 * @returns {Promise<void>}
	 */
	async copy(url, headers = {}, body = null, beforeRequestHandler = (() => null), afterRequestHandler = (() => null)) {
		return this.request('COPY', url, headers, body, beforeRequestHandler, afterRequestHandler);
	}

	/**
	 * sends MOVE request
	 *
	 * @param {String} url - URL to do the DELETE request on
	 * @param {Object} headers - additional HTTP headers to send
	 * @param {String} body
	 * @param {Function} beforeRequestHandler - custom function to be called before the request is made
	 * @param {Function} afterRequestHandler - custom function to be called after the request was made
	 * @returns {Promise<void>}
	 */
	async move(url, headers = {}, body = null, beforeRequestHandler = (() => null), afterRequestHandler = (() => null)) {
		// TODO destination
		// TODO overwrite
		return this.request('MOVE', url, headers, body, beforeRequestHandler, afterRequestHandler);
	}

	/**
	 * sends LOCK request
	 *
	 * @param {String} url - URL to do the DELETE request on
	 * @param {Object} headers - additional HTTP headers to send
	 * @param {String} body
	 * @param {Function} beforeRequestHandler - custom function to be called before the request is made
	 * @param {Function} afterRequestHandler - custom function to be called after the request was made
	 * @returns {Promise<void>}
	 */
	async lock(url, headers = {}, body = null, beforeRequestHandler = (() => null), afterRequestHandler = (() => null)) {
		return this.request('LOCK', url, headers, body, beforeRequestHandler, afterRequestHandler);
	}

	/**
	 * sends UNLOCK request
	 *
	 * @param {String} url - URL to do the DELETE request on
	 * @param {Object} headers - additional HTTP headers to send
	 * @param {String} body
	 * @param {Function} beforeRequestHandler - custom function to be called before the request is made
	 * @param {Function} afterRequestHandler - custom function to be called after the request was made
	 * @returns {Promise<void>}
	 */
	async unlock(url, headers = {}, body = null, beforeRequestHandler = (() => null), afterRequestHandler = (() => null)) {
		return this.request('UNLOCK', url, headers, body, beforeRequestHandler, afterRequestHandler);
	}

	/**
	 * sends PROPFIND request
	 *
	 * @param {String} url - URL to do the PropFind request on
	 * @param {String[][]} properties
	 * @param {Number} depth
	 * @param {Object} headers - additional HTTP headers to send
	 * @param {Function} beforeRequestHandler - custom function to be called before the request is made
	 * @param {Function} afterRequestHandler - custom function to be called after the request was made
	 * @returns {Promise<*>}
	 */
	async propFind(url, properties, depth = 0, headers = {}, beforeRequestHandler = (() => null), afterRequestHandler = (() => null)) {
		const [skeleton, dPropChildren] = XMLUtility.getRootSkeleton(
			[NS.DAV, 'propfind'], [NS.DAV, 'prop']);

		dPropChildren.push(...properties.map(p => {
			return {
				name: p
			};
		}));
		const body = XMLUtility.serialize(skeleton);

		headers['Depth'] = depth;

		return this.request('PROPFIND', url, headers, body, beforeRequestHandler, afterRequestHandler);

		// TODO - include propname in request to list all properties
	}

	/**
	 * sends PROPPATCH request
	 *
	 * @param {String} url - URL to do the PropPatch request on
	 * @param {Object} headers - additional HTTP headers to send
	 * @param {String} body - request body
	 * @param {Function} beforeRequestHandler - custom function to be called before the request is made
	 * @param {Function} afterRequestHandler - custom function to be called after the request was made
	 * @returns {Promise<*>}
	 */
	async propPatch(url, headers, body, beforeRequestHandler = (() => null), afterRequestHandler = (() => null)) {
		return this.request('PROPPATCH', url, headers, body, beforeRequestHandler, afterRequestHandler);
	}

	/**
	 * sends MKCOL request
	 *
	 * @param {String} url - URL to do the MkCol request on
	 * @param {Object} headers - additional HTTP headers to send
	 * @param {String} body - request body
	 * @param {Function} beforeRequestHandler - custom function to be called before the request is made
	 * @param {Function} afterRequestHandler - custom function to be called after the request was made
	 * @returns {Promise<*>}
	 */
	async mkCol(url, headers, body, beforeRequestHandler = (() => null), afterRequestHandler = (() => null)) {
		return this.request('MKCOL', url, headers, body, beforeRequestHandler, afterRequestHandler);
	}

	/**
	 * sends REPORT request
	 *
	 * @param {String} url - URL to do the REPORT request on
	 * @param {Object} headers - additional HTTP headers to send
	 * @param {String} body - request body
	 * @param {Function} beforeRequestHandler - custom function to be called before the request is made
	 * @param {Function} afterRequestHandler - custom function to be called after the request was made
	 * @returns {Promise<*>}
	 */
	async report(url, headers, body, beforeRequestHandler = (() => null), afterRequestHandler = (() => null)) {
		return this.request('REPORT', url, headers, body, beforeRequestHandler, afterRequestHandler);
	}

	/**
	 * sends generic request
	 *
	 * @param {String} method - HTTP Method name
	 * @param {String} url - URL to do the request on
	 * @param {Object} headers - additional HTTP headers to send
	 * @param {String} body - request body
	 * @param {Function} beforeRequestHandler - custom function to be called before the request is made
	 * @param {Function} afterRequestHandler - custom function to be called after the request was made
	 * @returns {Promise<{Object}>}
	 * @property {String|Object} body
	 * @property {Number} status
	 * @property {XMLHttpRequest} xhr
	 */
	async request(method, url, headers, body, beforeRequestHandler = (() => null), afterRequestHandler = (() => null)) {
		const xhr = this.xhrProvider();
		const assignHeaders = Object.assign({}, getDefaultHeaders(), headers);

		xhr.open(method, this.absoluteUrl(url), true);

		for (let header in assignHeaders) {
			xhr.setRequestHeader(header, assignHeaders[header]);
		}

		beforeRequestHandler(xhr);

		if (body === null || body === undefined) {
			xhr.send();
		} else {
			xhr.send(body);
		}

		return new Promise((resolve, reject) => {
			xhr.onreadystatechange = () => {
				if (xhr.readyState !== 4) {
					return;
				}

				afterRequestHandler(xhr);

				let responseBody = xhr.response;
				if (!wasRequestSuccessful(xhr.status)) {
					reject(new Error({
						body: responseBody,
						status: xhr.status,
						xhr: xhr
					}));
					return;
				}

				if (xhr.status === 207) {
					responseBody = this._parseMultiStatusResponse(responseBody);
					if (headers['Depth'] === 0) {
						responseBody = responseBody[Object.keys(responseBody)[0]];
					}
				}

				resolve({
					body: responseBody,
					status: xhr.status,
					xhr: xhr
				});
			};

			xhr.onerror = () => reject(new Error({
				body: null,
				status: -1,
				xhr: xhr
			}));

			xhr.onabort = () => reject(new Error({
				body: null,
				status: -1,
				xhr: xhr
			}));
		});
	}

	/**
	 * returns name of file / folder of a url
	 *
	 * @params {String} url
	 * @returns {String}
	 */
	filename(url) {
		let pathname = this.pathname(url);
		if (pathname.substr(-1) === '/') {
			pathname = pathname.substr(0, pathname.length - 1);
		}

		const slashPos = pathname.lastIndexOf('/');
		return pathname.substr(slashPos);
	}

	/**
	 * returns pathname for a URL
	 *
	 * @params {String} url
	 * @returns {String}
	 */
	pathname(url) {
		const urlObject = new URL(url, this.baseUrl);
		return urlObject.pathname;
	}

	/**
	 * returns absolute url
	 *
	 * @param {String} url
	 * @returns {String}
	 */
	absoluteUrl(url) {
		const urlObject = new URL(url, this.baseUrl);
		return urlObject.href;
	}

	/**
	 * parses a multi status response (207), sorts them by path
	 * and drops all unsuccessful responses
	 *
	 * @param {String} body
	 * @returns {Object}
	 * @private
	 */
	_parseMultiStatusResponse(body) {
		const result = {};
		const domParser = new DOMParser();
		const document = domParser.parseFromString(body, 'application/xml');

		const responses = document.evaluate('/d:multistatus/d:response', document, NS.resolve, XPathResult.ANY_TYPE, null);
		let responseNode;

		while ((responseNode = responses.iterateNext()) !== null) {
			const href = document.evaluate('string(d:href)', responseNode, NS.resolve, XPathResult.ANY_TYPE, null).stringValue;
			const parsedProperties = {};
			const propStats = document.evaluate('d:propstat', responseNode, NS.resolve, XPathResult.ANY_TYPE, null);
			let propStatNode;

			while ((propStatNode = propStats.iterateNext()) !== null) {
				const status = document.evaluate('string(d:status)', propStatNode, NS.resolve, XPathResult.ANY_TYPE, null).stringValue;
				if (!wasRequestSuccessful(getStatusCodeFromString(status))) {
					continue;
				}

				const props = document.evaluate('d:prop/*', propStatNode, NS.resolve, XPathResult.ANY_TYPE, null);
				let propNode;

				while ((propNode = props.iterateNext()) !== null) {
					if (this.parser.canParse(`{${propNode.namespaceURI}}${propNode.localName}`)) {
						parsedProperties[`{${propNode.namespaceURI}}${propNode.localName}`]
							= this.parser.parse(document, propNode, NS.resolve);
					}
				}
			}

			result[href] = parsedProperties;
		}

		return result;
	}

}

/**
 * Check if response code is in the 2xx section
 *
 * @param {Number} status
 * @returns {boolean}
 * @private
 */
function wasRequestSuccessful(status) {
	return status >= 200 && status < 300;
}

/**
 * Extract numeric status code from string like "HTTP/1.1 200 OK"
 *
 * @param {String} status
 * @returns {Number}
 * @private
 */
function getStatusCodeFromString(status) {
	return parseInt(status.split(' ')[1], 10);
}

/**
 * get object with default headers to include in every request
 *
 * @returns {Object}
 * @property {Number} Depth
 * @property {String} Content-Type
 * @private
 */
function getDefaultHeaders() {
	// TODO: https://tools.ietf.org/html/rfc4918#section-9.1
	// "Servers SHOULD treat request without a Depth header
	// as if a "Depth: infinity" header was included."
	// Should infinity be the default?

	return {
		'Depth': 0,
		'Content-Type': 'application/xml; charset=utf-8'
	};
}
