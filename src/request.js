/**
 * CDAV Library
 *
 * This library is part of the Nextcloud project
 *
 * SPDX-FileCopyrightText: 2018 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import * as NS from './utility/namespaceUtility.js'
import * as XMLUtility from './utility/xmlUtility.js'
import axios from '@nextcloud/axios'

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
	 * @param {{[name: string]: any}} [defaultHeaders] - additional HTTP headers to send with each request
	 * @param {import('./parser.js').Parser} parser - instance of Parser class
	 */
	constructor(baseUrl, parser, defaultHeaders = {}) {
		this.baseUrl = baseUrl
		this.parser = parser
		this.defaultHeaders = defaultHeaders
	}

	/**
	 * sends a GET request
	 *
	 * @param {string} url - URL to do the request on
	 * @param {object} headers - additional HTTP headers to send
	 * @param {string} body - request body
	 * @param {AbortSignal} abortSignal - the signal from an abort controller
	 * @return {Promise<{body: string|object, status: number, headers: object}>}
	 */
	async get(url, headers = {}, body = null, abortSignal = null) {
		return this.request('GET', url, headers, body, abortSignal)
	}

	/**
	 * sends a PATCH request
	 *
	 * @param {string} url - URL to do the request on
	 * @param {object} headers - additional HTTP headers to send
	 * @param {string} body - request body
	 * @param {AbortSignal} abortSignal - the signal from an abort controller
	 * @return {Promise<{body: string|object, status: number, headers: object}>}
	 */
	async patch(url, headers, body, abortSignal = null) {
		return this.request('PATCH', url, headers, body, abortSignal)
	}

	/**
	 * sends a POST request
	 *
	 * @param {string} url - URL to do the request on
	 * @param {object} headers - additional HTTP headers to send
	 * @param {string} body - request body
	 * @param {AbortSignal} abortSignal - the signal from an abort controller
	 * @return {Promise<{body: string|object, status: number, headers: object}>}
	 */
	async post(url, headers, body, abortSignal = null) {
		return this.request('POST', url, headers, body, abortSignal)
	}

	/**
	 * sends a PUT request
	 *
	 * @param {string} url - URL to do the request on
	 * @param {object} headers - additional HTTP headers to send
	 * @param {string} body - request body
	 * @param {AbortSignal} abortSignal - the signal from an abort controller
	 * @return {Promise<{body: string|object, status: number, headers: object}>}
	 */
	async put(url, headers, body, abortSignal = null) {
		return this.request('PUT', url, headers, body, abortSignal)
	}

	/**
	 * sends a DELETE request
	 *
	 * @param {string} url - URL to do the request on
	 * @param {object} headers - additional HTTP headers to send
	 * @param {string} body - request body
	 * @param {AbortSignal} abortSignal - the signal from an abort controller
	 * @return {Promise<{body: string|object, status: number, headers: object}>}
	 */
	async delete(url, headers = {}, body = null, abortSignal = null) {
		return this.request('DELETE', url, headers, body, abortSignal)
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
	 * @param {AbortSignal} abortSignal - the signal from an abort controller
	 * @return {Promise<{body: string|object, status: number, headers: object}>}
	 */
	async copy(url, destination, depth = 0, overwrite = false, headers = {}, body = null, abortSignal = null) {
		headers.Destination = destination
		headers.Depth = depth
		headers.Overwrite = overwrite ? 'T' : 'F'

		return this.request('COPY', url, headers, body, abortSignal)
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
	 * @param {AbortSignal} abortSignal - the signal from an abort controller
	 * @return {Promise<{body: string|object, status: number, headers: object}>}
	 */
	async move(url, destination, overwrite = false, headers = {}, body = null, abortSignal = null) {
		headers.Destination = destination
		headers.Depth = 'Infinity'
		headers.Overwrite = overwrite ? 'T' : 'F'

		return this.request('MOVE', url, headers, body, abortSignal)
	}

	/**
	 * sends a LOCK request
	 * https://tools.ietf.org/html/rfc4918#section-9.10
	 *
	 * @param {string} url - URL to do the request on
	 * @param {object} headers - additional HTTP headers to send
	 * @param {string} body - request body
	 * @param {AbortSignal} abortSignal - the signal from an abort controller
	 * @return {Promise<{body: string|object, status: number, headers: object}>}
	 */
	async lock(url, headers = {}, body = null, abortSignal = null) {

		// TODO - add parameters for Depth and Timeout

		return this.request('LOCK', url, headers, body, abortSignal)
	}

	/**
	 * sends an UNLOCK request
	 * https://tools.ietf.org/html/rfc4918#section-9.11
	 *
	 * @param {string} url - URL to do the request on
	 * @param {object} headers - additional HTTP headers to send
	 * @param {string} body - request body
	 * @param {AbortSignal} abortSignal - the signal from an abort controller
	 * @return {Promise<{body: string|object, status: number, headers: object}>}
	 */
	async unlock(url, headers = {}, body = null, abortSignal = null) {

		// TODO - add parameter for Lock-Token

		return this.request('UNLOCK', url, headers, body, abortSignal)
	}

	/**
	 * sends a PROPFIND request
	 * https://tools.ietf.org/html/rfc4918#section-9.1
	 *
	 * @param {string} url - URL to do the request on
	 * @param {string[][]} properties - list of properties to search for, formatted as [namespace, localName]
	 * @param {number | string} depth - Depth header to send
	 * @param {object} headers - additional HTTP headers to send
	 * @param {AbortSignal} abortSignal - the signal from an abort controller
	 * @return {Promise<{body: string|object, status: number, headers: object}>}
	 */
	async propFind(url, properties, depth = 0, headers = {}, abortSignal = null) {
		// adjust headers
		headers.Depth = depth

		// create request body
		const [skeleton, dPropChildren] = XMLUtility.getRootSkeleton([NS.DAV, 'propfind'], [NS.DAV, 'prop'])
		dPropChildren.push(...properties.map(p => ({ name: p })))
		const body = XMLUtility.serialize(skeleton)

		return this.request('PROPFIND', url, headers, body, abortSignal)
	}

	/**
	 * sends a PROPPATCH request
	 * https://tools.ietf.org/html/rfc4918#section-9.2
	 *
	 * @param {string} url - URL to do the request on
	 * @param {object} headers - additional HTTP headers to send
	 * @param {string} body - request body
	 * @param {AbortSignal} abortSignal - the signal from an abort controller
	 * @return {Promise<{body: string|object, status: number, headers: object}>}
	 */
	async propPatch(url, headers, body, abortSignal = null) {
		return this.request('PROPPATCH', url, headers, body, abortSignal)
	}

	/**
	 * sends a MKCOL request
	 * https://tools.ietf.org/html/rfc4918#section-9.3
	 * https://tools.ietf.org/html/rfc5689
	 *
	 * @param {string} url - URL to do the request on
	 * @param {object} headers - additional HTTP headers to send
	 * @param {string} body - request body
	 * @param {AbortSignal} abortSignal - the signal from an abort controller
	 * @return {Promise<{body: string|object, status: number, headers: object}>}
	 */
	async mkCol(url, headers, body, abortSignal = null) {
		return this.request('MKCOL', url, headers, body, abortSignal)
	}

	/**
	 * sends a REPORT request
	 * https://tools.ietf.org/html/rfc3253#section-3.6
	 *
	 * @param {string} url - URL to do the request on
	 * @param {object} headers - additional HTTP headers to send
	 * @param {string} body - request body
	 * @param {AbortSignal} abortSignal - the signal from an abort controller
	 * @return {Promise<{body: string|object, status: number, headers: object}>}
	 */
	async report(url, headers, body, abortSignal = null) {
		return this.request('REPORT', url, headers, body, abortSignal)
	}

	/**
	 * sends generic request
	 *
	 * @param {string} method - HTTP Method name
	 * @param {string} url - URL to do the request on
	 * @param {object} headers - additional HTTP headers to send
	 * @param {string} body - request body
	 * @param {AbortSignal} abortSignal - the signal from an abort controller
	 * @return {Promise<{body: string|object, status: number, headers: object}>}
	 */
	async request(method, url, headers, body, abortSignal) {
		const assignHeaders = Object.assign({}, getDefaultHeaders(), this.defaultHeaders, headers)
		try {
			const response = await axios.request({
				url: this.absoluteUrl(url),
				method,
				headers: assignHeaders,
				data: body,
				// all statuses not in success are treated as errors in catch
				validateStatus: wasRequestSuccessful,
				signal: abortSignal,
			})

			let responseBody = response.data
			if (response.status === 207) {
				responseBody = this._parseMultiStatusResponse(responseBody)
				if (parseInt(assignHeaders.Depth, 10) === 0 && method === 'PROPFIND') {
					responseBody = responseBody[Object.keys(responseBody)[0]]
				}
			}

			return {
				body: responseBody,
				status: response.status,
				headers: response.headers,
			}
		} catch (error) {
			if (axios.isCancel(error)) {
				// xhr.onabort
				// AbortController.abort
				throw new NetworkRequestAbortedError({
					body: null,
					status: -1,
					headers: error.headers || {},
				})
			}

			if (error.request) {
				// xhr.onerror
				throw new NetworkRequestError({
					body: null,
					status: -1,
					headers: error.headers || {},
				})
			}

			if (error.status >= 400 && error.status < 500) {
				throw new NetworkRequestClientError({
					body: error.data,
					status: error.status,
					headers: error.headers || {},
				})
			}
			if (error.status >= 500 && error.status < 600) {
				throw new NetworkRequestServerError({
					body: error.data,
					status: error.status,
					headers: error.headers || {},
				})
			}

			throw new NetworkRequestHttpError({
				body: error.data,
				status: error.status,
				headers: error.headers || {},
			})
		}
	}

	/**
	 * returns name of file / folder of a url
	 *
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
