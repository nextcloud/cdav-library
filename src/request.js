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

import * as NS from './utility/namespaceUtility.js'
import * as XMLUtility from './utility/xmlUtility.js'

import NetworkRequestAbortedError from './errors/networkRequestAbortedError.js'
import NetworkRequestError from './errors/networkRequestError.js'
import NetworkRequestServerError from './errors/networkRequestServerError.js'
import NetworkRequestClientError from './errors/networkRequestClientError.js'
import NetworkRequestHttpError from './errors/networkRequestHttpError.js'

/**
 * Request class is used to send any kind of request to the DAV server
 * It also parses incoming XML responses
 */
export default class Request {

	/**
	 * Creates a new Request object
	 *
	 * @param {string} baseUrl - root url of DAV server, use OC.remote('dav')
	 * @param {Parser} parser - instance of Parser class
	 * @param {Function} xhrProvider - Function that returns new XMLHttpRequest objects
	 */
	constructor(baseUrl, parser, xhrProvider = () => new XMLHttpRequest()) {
		this.baseUrl = baseUrl
		this.parser = parser
		this.xhrProvider = xhrProvider
	}

	/**
	 * sends a GET request
	 *
	 * @param {string} url - URL to do the request on
	 * @param {object} headers - additional HTTP headers to send
	 * @param {string} body - request body
	 * @param {Function} beforeRequestHandler - custom function to be called before the request is made
	 * @param {Function} afterRequestHandler - custom function to be called after the request was made
	 * @return {Promise<{Object}>}
	 * @property {string | object} body
	 * @property {number} status
	 * @property {XMLHttpRequest} xhr
	 */
	async get(url, headers = {}, body = null, beforeRequestHandler = () => null, afterRequestHandler = () => null) {
		return this.request('GET', url, headers, body, beforeRequestHandler, afterRequestHandler)
	}

	/**
	 * sends a PATCH request
	 *
	 * @param {string} url - URL to do the request on
	 * @param {object} headers - additional HTTP headers to send
	 * @param {string} body - request body
	 * @param {Function} beforeRequestHandler - custom function to be called before the request is made
	 * @param {Function} afterRequestHandler - custom function to be called after the request was made
	 * @return {Promise<{Object}>}
	 * @property {string | object} body
	 * @property {number} status
	 * @property {XMLHttpRequest} xhr
	 */
	async patch(url, headers, body, beforeRequestHandler = () => null, afterRequestHandler = () => null) {
		return this.request('PATCH', url, headers, body, beforeRequestHandler, afterRequestHandler)
	}

	/**
	 * sends a POST request
	 *
	 * @param {string} url - URL to do the request on
	 * @param {object} headers - additional HTTP headers to send
	 * @param {string} body - request body
	 * @param {Function} beforeRequestHandler - custom function to be called before the request is made
	 * @param {Function} afterRequestHandler - custom function to be called after the request was made
	 * @return {Promise<{Object}>}
	 * @property {string | object} body
	 * @property {number} status
	 * @property {XMLHttpRequest} xhr
	 */
	async post(url, headers, body, beforeRequestHandler = () => null, afterRequestHandler = () => null) {
		return this.request('POST', url, headers, body, beforeRequestHandler, afterRequestHandler)
	}

	/**
	 * sends a PUT request
	 *
	 * @param {string} url - URL to do the request on
	 * @param {object} headers - additional HTTP headers to send
	 * @param {string} body - request body
	 * @param {Function} beforeRequestHandler - custom function to be called before the request is made
	 * @param {Function} afterRequestHandler - custom function to be called after the request was made
	 * @return {Promise<{Object}>}
	 * @property {string | object} body
	 * @property {number} status
	 * @property {XMLHttpRequest} xhr
	 */
	async put(url, headers, body, beforeRequestHandler = () => null, afterRequestHandler = () => null) {
		return this.request('PUT', url, headers, body, beforeRequestHandler, afterRequestHandler)
	}

	/**
	 * sends a DELETE request
	 *
	 * @param {string} url - URL to do the request on
	 * @param {object} headers - additional HTTP headers to send
	 * @param {string} body - request body
	 * @param {Function} beforeRequestHandler - custom function to be called before the request is made
	 * @param {Function} afterRequestHandler - custom function to be called after the request was made
	 * @return {Promise<{Object}>}
	 * @property {string | object} body
	 * @property {number} status
	 * @property {XMLHttpRequest} xhr
	 */
	async delete(url, headers = {}, body = null, beforeRequestHandler = () => null, afterRequestHandler = () => null) {
		return this.request('DELETE', url, headers, body, beforeRequestHandler, afterRequestHandler)
	}

	/**
	 * sends a COPY request
	 * https://tools.ietf.org/html/rfc4918#section-9.8
	 *
	 * @param {string} url - URL to do the request on
	 * @param {string} destination - place to copy the object/collection to
	 * @param {number | string} depth - 0 = copy collection without content, Infinity = copy collection with content
	 * @param {boolean} overwrite - whether or not to overwrite destination if existing
	 * @param {object} headers - additional HTTP headers to send
	 * @param {string} body - request body
	 * @param {Function} beforeRequestHandler - custom function to be called before the request is made
	 * @param {Function} afterRequestHandler - custom function to be called after the request was made
	 * @return {Promise<{Object}>}
	 * @property {string | object} body
	 * @property {number} status
	 * @property {XMLHttpRequest} xhr
	 */
	async copy(url, destination, depth = 0, overwrite = false, headers = {}, body = null, beforeRequestHandler = () => null, afterRequestHandler = () => null) {
		headers.Destination = destination
		headers.Depth = depth
		headers.Overwrite = overwrite ? 'T' : 'F'

		return this.request('COPY', url, headers, body, beforeRequestHandler, afterRequestHandler)
	}

	/**
	 * sends a MOVE request
	 * https://tools.ietf.org/html/rfc4918#section-9.9
	 *
	 * @param {string} url - URL to do the request on
	 * @param {string} destination - place to move the object/collection to
	 * @param {boolean} overwrite - whether or not to overwrite destination if existing
	 * @param {object} headers - additional HTTP headers to send
	 * @param {string} body - request body
	 * @param {Function} beforeRequestHandler - custom function to be called before the request is made
	 * @param {Function} afterRequestHandler - custom function to be called after the request was made
	 * @return {Promise<{Object}>}
	 * @property {string | object} body
	 * @property {number} status
	 * @property {XMLHttpRequest} xhr
	 */
	async move(url, destination, overwrite = false, headers = {}, body = null, beforeRequestHandler = () => null, afterRequestHandler = () => null) {
		headers.Destination = destination
		headers.Depth = 'Infinity'
		headers.Overwrite = overwrite ? 'T' : 'F'

		return this.request('MOVE', url, headers, body, beforeRequestHandler, afterRequestHandler)
	}

	/**
	 * sends a LOCK request
	 * https://tools.ietf.org/html/rfc4918#section-9.10
	 *
	 * @param {string} url - URL to do the request on
	 * @param {object} headers - additional HTTP headers to send
	 * @param {string} body - request body
	 * @param {Function} beforeRequestHandler - custom function to be called before the request is made
	 * @param {Function} afterRequestHandler - custom function to be called after the request was made
	 * @return {Promise<{Object}>}
	 * @property {string | object} body
	 * @property {number} status
	 * @property {XMLHttpRequest} xhr
	 */
	async lock(url, headers = {}, body = null, beforeRequestHandler = () => null, afterRequestHandler = () => null) {

		// TODO - add parameters for Depth and Timeout

		return this.request('LOCK', url, headers, body, beforeRequestHandler, afterRequestHandler)
	}

	/**
	 * sends an UNLOCK request
	 * https://tools.ietf.org/html/rfc4918#section-9.11
	 *
	 * @param {string} url - URL to do the request on
	 * @param {object} headers - additional HTTP headers to send
	 * @param {string} body - request body
	 * @param {Function} beforeRequestHandler - custom function to be called before the request is made
	 * @param {Function} afterRequestHandler - custom function to be called after the request was made
	 * @return {Promise<{Object}>}
	 * @property {string | object} body
	 * @property {number} status
	 * @property {XMLHttpRequest} xhr
	 */
	async unlock(url, headers = {}, body = null, beforeRequestHandler = () => null, afterRequestHandler = () => null) {

		// TODO - add parameter for Lock-Token

		return this.request('UNLOCK', url, headers, body, beforeRequestHandler, afterRequestHandler)
	}

	/**
	 * sends a PROPFIND request
	 * https://tools.ietf.org/html/rfc4918#section-9.1
	 *
	 * @param {string} url - URL to do the request on
	 * @param {string[][]} properties - list of properties to search for, formatted as [namespace, localName]
	 * @param {number | string} depth - Depth header to send
	 * @param {object} headers - additional HTTP headers to send
	 * @param {Function} beforeRequestHandler - custom function to be called before the request is made
	 * @param {Function} afterRequestHandler - custom function to be called after the request was made
	 * @return {Promise<{Object}>}
	 * @property {string | object} body
	 * @property {number} status
	 * @property {XMLHttpRequest} xhr
	 */
	async propFind(url, properties, depth = 0, headers = {}, beforeRequestHandler = () => null, afterRequestHandler = () => null) {
		// adjust headers
		headers.Depth = depth

		// create request body
		const [skeleton, dPropChildren] = XMLUtility.getRootSkeleton([NS.DAV, 'propfind'], [NS.DAV, 'prop'])
		dPropChildren.push(...properties.map(p => ({ name: p })))
		const body = XMLUtility.serialize(skeleton)

		return this.request('PROPFIND', url, headers, body, beforeRequestHandler, afterRequestHandler)
	}

	/**
	 * sends a PROPPATCH request
	 * https://tools.ietf.org/html/rfc4918#section-9.2
	 *
	 * @param {string} url - URL to do the request on
	 * @param {object} headers - additional HTTP headers to send
	 * @param {string} body - request body
	 * @param {Function} beforeRequestHandler - custom function to be called before the request is made
	 * @param {Function} afterRequestHandler - custom function to be called after the request was made
	 * @return {Promise<{Object}>}
	 * @property {string | object} body
	 * @property {number} status
	 * @property {XMLHttpRequest} xhr
	 */
	async propPatch(url, headers, body, beforeRequestHandler = () => null, afterRequestHandler = () => null) {
		return this.request('PROPPATCH', url, headers, body, beforeRequestHandler, afterRequestHandler)
	}

	/**
	 * sends a MKCOL request
	 * https://tools.ietf.org/html/rfc4918#section-9.3
	 * https://tools.ietf.org/html/rfc5689
	 *
	 * @param {string} url - URL to do the request on
	 * @param {object} headers - additional HTTP headers to send
	 * @param {string} body - request body
	 * @param {Function} beforeRequestHandler - custom function to be called before the request is made
	 * @param {Function} afterRequestHandler - custom function to be called after the request was made
	 * @return {Promise<{Object}>}
	 * @property {string | object} body
	 * @property {number} status
	 * @property {XMLHttpRequest} xhr
	 */
	async mkCol(url, headers, body, beforeRequestHandler = () => null, afterRequestHandler = () => null) {
		return this.request('MKCOL', url, headers, body, beforeRequestHandler, afterRequestHandler)
	}

	/**
	 * sends a REPORT request
	 * https://tools.ietf.org/html/rfc3253#section-3.6
	 *
	 * @param {string} url - URL to do the request on
	 * @param {object} headers - additional HTTP headers to send
	 * @param {string} body - request body
	 * @param {Function} beforeRequestHandler - custom function to be called before the request is made
	 * @param {Function} afterRequestHandler - custom function to be called after the request was made
	 * @return {Promise<{Object}>}
	 * @property {string | object} body
	 * @property {number} status
	 * @property {XMLHttpRequest} xhr
	 */
	async report(url, headers, body, beforeRequestHandler = () => null, afterRequestHandler = () => null) {
		return this.request('REPORT', url, headers, body, beforeRequestHandler, afterRequestHandler)
	}

	/**
	 * sends generic request
	 *
	 * @param {string} method - HTTP Method name
	 * @param {string} url - URL to do the request on
	 * @param {object} headers - additional HTTP headers to send
	 * @param {string} body - request body
	 * @param {Function} beforeRequestHandler - custom function to be called before the request is made
	 * @param {Function} afterRequestHandler - custom function to be called after the request was made
	 * @return {Promise<{Object}>}
	 * @property {string | object} body
	 * @property {number} status
	 * @property {XMLHttpRequest} xhr
	 */
	async request(method, url, headers, body, beforeRequestHandler = () => null, afterRequestHandler = () => null) {
		const xhr = this.xhrProvider()
		const assignHeaders = Object.assign({}, getDefaultHeaders(), headers)

		xhr.open(method, this.absoluteUrl(url), true)

		for (const header in assignHeaders) {
			xhr.setRequestHeader(header, assignHeaders[header])
		}

		beforeRequestHandler(xhr)

		if (body === null || body === undefined) {
			xhr.send()
		} else {
			xhr.send(body)
		}

		return new Promise((resolve, reject) => {
			xhr.onreadystatechange = () => {
				if (xhr.readyState !== 4) {
					return
				}

				afterRequestHandler(xhr)

				let responseBody = xhr.response
				if (!wasRequestSuccessful(xhr.status)) {
					if (xhr.status >= 400 && xhr.status < 500) {
						reject(new NetworkRequestClientError({
							body: responseBody,
							status: xhr.status,
							xhr,
						}))
						return
					}
					if (xhr.status >= 500 && xhr.status < 600) {
						reject(new NetworkRequestServerError({
							body: responseBody,
							status: xhr.status,
							xhr,
						}))
						return
					}

					reject(new NetworkRequestHttpError({
						body: responseBody,
						status: xhr.status,
						xhr,
					}))
					return
				}

				if (xhr.status === 207) {
					responseBody = this._parseMultiStatusResponse(responseBody)
					if (parseInt(assignHeaders.Depth, 10) === 0 && method === 'PROPFIND') {
						responseBody = responseBody[Object.keys(responseBody)[0]]
					}
				}

				resolve({
					body: responseBody,
					status: xhr.status,
					xhr,
				})
			}

			xhr.onerror = () => reject(new NetworkRequestError({
				body: null,
				status: -1,
				xhr,
			}))

			xhr.onabort = () => reject(new NetworkRequestAbortedError({
				body: null,
				status: -1,
				xhr,
			}))
		})
	}

	/**
	 * returns name of file / folder of a url
	 *
	 * @param url
	 * @params {string} url
	 * @return {string}
	 */
	filename(url) {
		let pathname = this.pathname(url)
		if (pathname.slice(-1) === '/') {
			pathname = pathname.slice(0, -1)
		}

		const slashPos = pathname.lastIndexOf('/')
		return pathname.slice(slashPos)
	}

	/**
	 * returns pathname for a URL
	 *
	 * @param url
	 * @params {string} url
	 * @return {string}
	 */
	pathname(url) {
		const urlObject = new URL(url, this.baseUrl)
		return urlObject.pathname
	}

	/**
	 * returns absolute url
	 *
	 * @param {string} url
	 * @return {string}
	 */
	absoluteUrl(url) {
		const urlObject = new URL(url, this.baseUrl)
		return urlObject.href
	}

	/**
	 * parses a multi status response (207), sorts them by path
	 * and drops all unsuccessful responses
	 *
	 * @param {string} body
	 * @return {object}
	 * @private
	 */
	_parseMultiStatusResponse(body) {
		const result = {}
		const domParser = new DOMParser()
		const document = domParser.parseFromString(body, 'application/xml')

		const responses = document.evaluate('/d:multistatus/d:response', document, NS.resolve, XPathResult.ANY_TYPE, null)
		let responseNode

		while ((responseNode = responses.iterateNext()) !== null) {
			const href = document.evaluate('string(d:href)', responseNode, NS.resolve, XPathResult.ANY_TYPE, null).stringValue
			const parsedProperties = {}
			const propStats = document.evaluate('d:propstat', responseNode, NS.resolve, XPathResult.ANY_TYPE, null)
			let propStatNode

			while ((propStatNode = propStats.iterateNext()) !== null) {
				const status = document.evaluate('string(d:status)', propStatNode, NS.resolve, XPathResult.ANY_TYPE, null).stringValue
				if (!wasRequestSuccessful(getStatusCodeFromString(status))) {
					continue
				}

				const props = document.evaluate('d:prop/*', propStatNode, NS.resolve, XPathResult.ANY_TYPE, null)
				let propNode

				while ((propNode = props.iterateNext()) !== null) {
					if (this.parser.canParse(`{${propNode.namespaceURI}}${propNode.localName}`)) {
						parsedProperties[`{${propNode.namespaceURI}}${propNode.localName}`]
							= this.parser.parse(document, propNode, NS.resolve)
					}
				}
			}

			result[href] = parsedProperties
		}

		return result
	}

}

/**
 * Check if response code is in the 2xx section
 *
 * @param {number} status
 * @return {boolean}
 * @private
 */
function wasRequestSuccessful(status) {
	return status >= 200 && status < 300
}

/**
 * Extract numeric status code from string like "HTTP/1.1 200 OK"
 *
 * @param {string} status
 * @return {number}
 * @private
 */
function getStatusCodeFromString(status) {
	return parseInt(status.split(' ')[1], 10)
}

/**
 * get object with default headers to include in every request
 *
 * @return {object}
 * @property {string} depth
 * @property {string} Content-Type
 * @private
 */
function getDefaultHeaders() {
	// TODO: https://tools.ietf.org/html/rfc4918#section-9.1
	// "Servers SHOULD treat request without a Depth header
	// as if a "Depth: infinity" header was included."
	// Should infinity be the default?

	return {
		Depth: '0',
		'Content-Type': 'application/xml; charset=utf-8',
	}
}
