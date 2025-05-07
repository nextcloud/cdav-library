/**
 * CDAV Library
 *
 * This library is part of the Nextcloud project
 *
 * SPDX-FileCopyrightText: 2018 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'

import Request from '../../src/request.js'
import * as XMLUtility from '../../src/utility/xmlUtility.js'
import axios from '@nextcloud/axios'
import NetworkRequestAbortedError from '../../src/errors/networkRequestAbortedError.js'
import NetworkRequestError from '../../src/errors/networkRequestError.js'
import NetworkRequestServerError from '../../src/errors/networkRequestServerError.js'
import NetworkRequestClientError from '../../src/errors/networkRequestClientError.js'
import NetworkRequestHttpError from '../../src/errors/networkRequestHttpError.js'

describe('Request', () => {

	beforeEach(() => {
		XMLUtility.resetPrefixMap()
	})

	it('should send OPTIONS requests', async () => {
		const axiosRequestSpy = vi.spyOn(axios, 'request')
			.mockResolvedValueOnce({
				status: 234,
				data: 567,
			})

		const parser = {
			canParse: vi.fn(),
			parse: vi.fn(),
		}

		const request = new Request('https://nextcloud.testing/nextcloud/remote.php/dav/', parser)
		const response = await request.options('fooBar', {
			Foo: 'Bar',
			Bla: 'Blub',
		})

		expect(axiosRequestSpy).toHaveBeenCalledTimes(1)
		expect(axiosRequestSpy).toHaveBeenCalledWith({
			method: 'OPTIONS',
			data: null,
			url: 'https://nextcloud.testing/nextcloud/remote.php/dav/fooBar',
			headers: expect.objectContaining({
				Depth: '0',
				'Content-Type': 'application/xml; charset=utf-8',
				Foo: 'Bar',
				Bla: 'Blub',
			}),
			validateStatus: expect.any(Function),
			signal: null,
		})

		expect(response).toEqual({
			body: 567,
			status: 234,
		})
	})

	it('should send GET requests', async () => {
		const axiosRequestSpy = vi.spyOn(axios, 'request')
			.mockResolvedValueOnce({
				status: 234,
				data: 567,
			})

		const parser = {
			canParse: vi.fn(),
			parse: vi.fn(),
		}

		const request = new Request('https://nextcloud.testing/nextcloud/remote.php/dav/', parser)
		const response = await request.get('fooBar', {
			Foo: 'Bar',
			Bla: 'Blub',
		})

		expect(axiosRequestSpy).toHaveBeenCalledTimes(1)
		expect(axiosRequestSpy).toHaveBeenCalledWith({
			method: 'GET',
			data: null,
			url: 'https://nextcloud.testing/nextcloud/remote.php/dav/fooBar',
			headers: expect.objectContaining({
				Depth: '0',
				'Content-Type': 'application/xml; charset=utf-8',
				Foo: 'Bar',
				Bla: 'Blub',
			}),
			validateStatus: expect.any(Function),
			signal: null,
		})

		expect(response).toEqual({
			body: 567,
			status: 234,
		})
	})

	it('should send PATCH requests', async () => {
		const axiosRequestSpy = vi.spyOn(axios, 'request')
			.mockResolvedValueOnce({
				status: 234,
				data: 567,
			})

		const parser = {
			canParse: vi.fn(),
			parse: vi.fn(),
		}

		const request = new Request('https://nextcloud.testing/nextcloud/remote.php/dav/', parser)
		const response = await request.patch('fooBar', {
			Foo: 'Bar',
			Bla: 'Blub',
		}, '123456')

		expect(axiosRequestSpy).toHaveBeenCalledTimes(1)
		expect(axiosRequestSpy).toHaveBeenCalledWith({
			method: 'PATCH',
			url: 'https://nextcloud.testing/nextcloud/remote.php/dav/fooBar',
			headers: expect.objectContaining({
				Depth: '0',
				'Content-Type': 'application/xml; charset=utf-8',
				Foo: 'Bar',
				Bla: 'Blub',
			}),
			data: '123456',
			validateStatus: expect.any(Function),
			signal: null,
		})

		expect(response).toEqual({
			body: 567,
			status: 234,
		})
	})

	it('should send POST requests', async () => {

		const axiosRequestSpy = vi.spyOn(axios, 'request')
			.mockResolvedValueOnce({
				status: 234,
				data: 567,
			})

		const parser = {
			canParse: vi.fn(),
			parse: vi.fn(),
		}

		const request = new Request('https://nextcloud.testing/nextcloud/remote.php/dav/', parser)
		const response = await request.post('fooBar', {
			Foo: 'Bar',
			Bla: 'Blub',
		}, '123456')

		expect(axiosRequestSpy).toHaveBeenCalledTimes(1)
		expect(axiosRequestSpy).toHaveBeenCalledWith({
			method: 'POST',
			url: 'https://nextcloud.testing/nextcloud/remote.php/dav/fooBar',
			headers: expect.objectContaining({
				Depth: '0',
				'Content-Type': 'application/xml; charset=utf-8',
				Foo: 'Bar',
				Bla: 'Blub',
			}),
			data: '123456',
			validateStatus: expect.any(Function),
			signal: null,
		})
		expect(response).toEqual({
			body: 567,
			status: 234,
		})
	})

	it('should send PUT requests', async () => {
		const axiosRequestSpy = vi.spyOn(axios, 'request')
			.mockResolvedValueOnce({
				status: 234,
				data: 567,
			})

		const parser = {
			canParse: vi.fn(),
			parse: vi.fn(),
		}

		const request = new Request('https://nextcloud.testing/nextcloud/remote.php/dav/', parser)
		const response = await request.put('fooBar', {
			Foo: 'Bar',
			Bla: 'Blub',
		}, '123456')

		expect(axiosRequestSpy).toHaveBeenCalledTimes(1)
		expect(axiosRequestSpy).toHaveBeenCalledWith({
			method: 'PUT',
			url: 'https://nextcloud.testing/nextcloud/remote.php/dav/fooBar',
			headers: expect.objectContaining({
				Depth: '0',
				'Content-Type': 'application/xml; charset=utf-8',
				Foo: 'Bar',
				Bla: 'Blub',
			}),
			data: '123456',
			validateStatus: expect.any(Function),
			signal: null,
		})

		expect(response).toEqual({
			body: 567,
			status: 234,
		})
	})

	it('should send DELETE requests', async () => {
		const axiosRequestSpy = vi.spyOn(axios, 'request')
			.mockResolvedValueOnce({
				status: 234,
				data: 567,
			})

		const parser = {
			canParse: vi.fn(),
			parse: vi.fn(),
		}

		const request = new Request('https://nextcloud.testing/nextcloud/remote.php/dav/', parser)
		const response = await request.delete('fooBar')

		expect(axiosRequestSpy).toHaveBeenCalledTimes(1)
		expect(axiosRequestSpy).toHaveBeenCalledWith({
			method: 'DELETE',
			url: 'https://nextcloud.testing/nextcloud/remote.php/dav/fooBar',
			headers: expect.objectContaining({
				Depth: '0',
				'Content-Type': 'application/xml; charset=utf-8',
			}),
			data: null,
			validateStatus: expect.any(Function),
			signal: null,
		})

		expect(response).toEqual({
			body: 567,
			status: 234,
		})
	})

	it('should send COPY requests', async () => {
		const axiosRequestSpy = vi.spyOn(axios, 'request')
			.mockResolvedValueOnce({
				status: 234,
				data: 567,
			})

		const parser = {
			canParse: vi.fn(),
			parse: vi.fn(),
		}

		const request = new Request('https://nextcloud.testing/nextcloud/remote.php/dav/', parser)
		const response = await request.copy('fooBar', 'barFoo', 'Infinity', true)

		expect(axiosRequestSpy).toHaveBeenCalledTimes(1)
		expect(axiosRequestSpy).toHaveBeenCalledWith({
			method: 'COPY',
			url: 'https://nextcloud.testing/nextcloud/remote.php/dav/fooBar',
			headers: expect.objectContaining({
				Depth: 'Infinity',
				Destination: 'barFoo',
				Overwrite: 'T',
				'Content-Type': 'application/xml; charset=utf-8',
			}),
			data: null,
			validateStatus: expect.any(Function),
			signal: null,
		})

		expect(response).toEqual({
			body: 567,
			status: 234,
		})
	})

	it('should send MOVE requests', async () => {
		const axiosRequestSpy = vi.spyOn(axios, 'request')
			.mockResolvedValueOnce({
				status: 234,
				data: 567,
			})

		const parser = {
			canParse: vi.fn(),
			parse: vi.fn(),
		}

		const request = new Request('https://nextcloud.testing/nextcloud/remote.php/dav/', parser)
		const response = await request.move('fooBar', 'barFoo')

		expect(axiosRequestSpy).toHaveBeenCalledTimes(1)
		expect(axiosRequestSpy).toHaveBeenCalledWith({
			method: 'MOVE',
			url: 'https://nextcloud.testing/nextcloud/remote.php/dav/fooBar',
			headers: expect.objectContaining({
				Depth: 'Infinity',
				Destination: 'barFoo',
				Overwrite: 'F',
				'Content-Type': 'application/xml; charset=utf-8',
			}),
			data: null,
			validateStatus: expect.any(Function),
			signal: null,
		})

		expect(response).toEqual({
			body: 567,
			status: 234,
		})
	})

	it('should send LOCK requests', async () => {
		const axiosRequestSpy = vi.spyOn(axios, 'request')
			.mockResolvedValueOnce({
				status: 234,
				data: 567,
			})

		const parser = {
			canParse: vi.fn(),
			parse: vi.fn(),
		}

		const request = new Request('https://nextcloud.testing/nextcloud/remote.php/dav/', parser)
		const response = await request.lock('fooBar')

		expect(axiosRequestSpy).toHaveBeenCalledTimes(1)
		expect(axiosRequestSpy).toHaveBeenCalledWith({
			method: 'LOCK',
			url: 'https://nextcloud.testing/nextcloud/remote.php/dav/fooBar',
			headers: expect.objectContaining({
				Depth: '0',
				'Content-Type': 'application/xml; charset=utf-8',
			}),
			data: null,
			validateStatus: expect.any(Function),
			signal: null,
		})

		expect(response).toEqual({
			body: 567,
			status: 234,
		})

	})

	it('should send UNLOCK requests', async () => {
		const axiosRequestSpy = vi.spyOn(axios, 'request')
			.mockResolvedValueOnce({
				status: 234,
				data: 567,
			})

		const parser = {
			canParse: vi.fn(),
			parse: vi.fn(),
		}

		const request = new Request('https://nextcloud.testing/nextcloud/remote.php/dav/', parser)
		const response = await request.unlock('fooBar')

		expect(axiosRequestSpy).toHaveBeenCalledTimes(1)
		expect(axiosRequestSpy).toHaveBeenCalledWith({
			method: 'UNLOCK',
			url: 'https://nextcloud.testing/nextcloud/remote.php/dav/fooBar',
			headers: expect.objectContaining({
				Depth: '0',
				'Content-Type': 'application/xml; charset=utf-8',
			}),
			data: null,
			validateStatus: expect.any(Function),
			signal: null,
		})

		expect(response).toEqual({
			body: 567,
			status: 234,
		})
	})

	it('should send PROPFIND requests', async () => {
		const axiosRequestSpy = vi.spyOn(axios, 'request')
			.mockResolvedValueOnce({
				status: 234,
				data: 567,
			})

		const parser = {
			canParse: vi.fn(),
			parse: vi.fn(),
		}

		const request = new Request('https://nextcloud.testing/nextcloud/remote.php/dav/', parser)
		const response = await request.propFind('fooBar', [['NS1', 'local1'], ['NS2', 'local2']], 1)

		expect(axiosRequestSpy).toHaveBeenCalledTimes(1)
		expect(axiosRequestSpy).toHaveBeenCalledWith({
			method: 'PROPFIND',
			url: 'https://nextcloud.testing/nextcloud/remote.php/dav/fooBar',
			headers: expect.objectContaining({
				Depth: 1,
				'Content-Type': 'application/xml; charset=utf-8',
			}),
			data: '<x0:propfind xmlns:x0="DAV:"><x0:prop><x1:local1 xmlns:x1="NS1"/><x2:local2 xmlns:x2="NS2"/></x0:prop></x0:propfind>',
			validateStatus: expect.any(Function),
			signal: null,
		})

		expect(response).toEqual({
			body: 567,
			status: 234,
		})
	})

	it('should send PROPPATCH requests', async () => {
		const axiosRequestSpy = vi.spyOn(axios, 'request')
			.mockResolvedValueOnce({
				status: 234,
				data: 567,
			})

		const parser = {
			canParse: vi.fn(),
			parse: vi.fn(),
		}

		const request = new Request('https://nextcloud.testing/nextcloud/remote.php/dav/', parser)
		const response = await request.propPatch('fooBar', {
			Foo: 'Bar',
			Bla: 'Blub',
		}, '123456')

		expect(axiosRequestSpy).toHaveBeenCalledTimes(1)
		expect(axiosRequestSpy).toHaveBeenCalledWith({
			method: 'PROPPATCH',
			url: 'https://nextcloud.testing/nextcloud/remote.php/dav/fooBar',
			headers: expect.objectContaining({
				Depth: '0',
				'Content-Type': 'application/xml; charset=utf-8',
				Foo: 'Bar',
				Bla: 'Blub',
			}),
			data: '123456',
			validateStatus: expect.any(Function),
			signal: null,
		})

		expect(response).toEqual({
			body: 567,
			status: 234,
		})
	})

	it('should send MKCOL requests', async () => {
		const axiosRequestSpy = vi.spyOn(axios, 'request')
			.mockResolvedValueOnce({
				status: 234,
				data: 567,
			})

		const parser = {
			canParse: vi.fn(),
			parse: vi.fn(),
		}

		const request = new Request('https://nextcloud.testing/nextcloud/remote.php/dav/', parser)
		const response = await request.mkCol('fooBar', {
			Foo: 'Bar',
			Bla: 'Blub',
		}, '123456')

		expect(axiosRequestSpy).toHaveBeenCalledTimes(1)
		expect(axiosRequestSpy).toHaveBeenCalledWith({
			method: 'MKCOL',
			url: 'https://nextcloud.testing/nextcloud/remote.php/dav/fooBar',
			headers: expect.objectContaining({
				Depth: '0',
				'Content-Type': 'application/xml; charset=utf-8',
				Foo: 'Bar',
				Bla: 'Blub',
			}),
			data: '123456',
			validateStatus: expect.any(Function),
			signal: null,
		})

		expect(response).toEqual({
			body: 567,
			status: 234,
		})

	})

	it('should send REPORT requests', async () => {
		const axiosRequestSpy = vi.spyOn(axios, 'request')
			.mockResolvedValueOnce({
				status: 234,
				data: 567,
			})

		const parser = {
			canParse: vi.fn(),
			parse: vi.fn(),
		}

		const request = new Request('https://nextcloud.testing/nextcloud/remote.php/dav/', parser)
		const response = await request.report('fooBar', {
			Foo: 'Bar',
			Bla: 'Blub',
		}, '123456')

		expect(axiosRequestSpy).toHaveBeenCalledTimes(1)
		expect(axiosRequestSpy).toHaveBeenCalledWith({
			method: 'REPORT',
			url: 'https://nextcloud.testing/nextcloud/remote.php/dav/fooBar',
			headers: expect.objectContaining({
				Depth: '0',
				'Content-Type': 'application/xml; charset=utf-8',
				Foo: 'Bar',
				Bla: 'Blub',
			}),
			data: '123456',
			validateStatus: expect.any(Function),
			signal: null,
		})

		expect(response).toEqual({
			body: 567,
			status: 234,
		})
	})

	it('should send generic requests', async () => {
		const axiosRequestSpy = vi.spyOn(axios, 'request')
			.mockResolvedValueOnce({
				status: 234,
				data: 567,
			})

		const parser = {
			canParse: vi.fn(),
			parse: vi.fn(),
		}

		const request = new Request('https://nextcloud.testing/nextcloud/remote.php/dav/', parser)
		const response = await request.request('METHOD123', 'fooBar', {
			Foo: 'Bar',
			Bla: 'Blub',
		})

		expect(axiosRequestSpy).toHaveBeenCalledTimes(1)
		expect(axiosRequestSpy).toHaveBeenCalledWith({
			method: 'METHOD123',
			data: undefined,
			url: 'https://nextcloud.testing/nextcloud/remote.php/dav/fooBar',
			headers: expect.objectContaining({
				Depth: '0',
				'Content-Type': 'application/xml; charset=utf-8',
				Foo: 'Bar',
				Bla: 'Blub',
			}),
			validateStatus: expect.any(Function),
			signal: undefined,
		})

		expect(response).toEqual({
			body: 567,
			status: 234,
		})
	})

	it('should reject the promise on abort', async () => {
		const abortController = new AbortController()
		const { signal } = abortController

		const axiosRequestSpy = vi.spyOn(axios, 'request')
			.mockImplementationOnce(() => {
				return new Promise((resolve, reject) => {
					signal.onabort = () => {
						// fake abort signal
						// eslint-disable-next-line
						reject({
							__CANCEL__: true,
						})
					}

					setTimeout(() => {
						if (!signal.aborted) {
							reject(new Error())
						}
					}, 1000)
				})
			})

		const parser = {
			canParse: vi.fn(),
			parse: vi.fn(),
		}

		const request = new Request('https://nextcloud.testing/nextcloud/remote.php/dav/', parser)

		expect(signal.aborted).toEqual(false)
		setTimeout(() => { abortController.abort() }, 1)

		const response = await request.get('fooBar', {}, null, signal).catch((e) => {
			if (!(e instanceof NetworkRequestAbortedError)) {
				throw new Error('Expected request to be aborted')
			}

			return e
		})

		expect(signal.aborted).toEqual(true)
		expect(axiosRequestSpy).toHaveBeenCalledTimes(1)
		expect(axiosRequestSpy).toHaveBeenCalledWith({
			method: 'GET',
			url: 'https://nextcloud.testing/nextcloud/remote.php/dav/fooBar',
			data: null,
			headers: expect.objectContaining({
				Depth: '0',
				'Content-Type': 'application/xml; charset=utf-8',
			}),
			validateStatus: expect.any(Function),
			signal,
		})

		expect(response).toBeInstanceOf(NetworkRequestAbortedError)
		expect(response.body).toEqual(null)
		expect(response.status).toEqual(-1)
	})

	it('should reject the promise on error', async () => {
		const axiosRequestSpy = vi.spyOn(axios, 'request')
			.mockRejectedValueOnce({
				request: {},
			})

		const parser = {
			canParse: vi.fn(),
			parse: vi.fn(),
		}

		const request = new Request('https://nextcloud.testing/nextcloud/remote.php/dav/', parser)

		const response = await request.get('fooBar', {}, null, null, null).catch(e => e)
		expect(axiosRequestSpy).toHaveBeenCalledTimes(1)
		expect(axiosRequestSpy).toHaveBeenCalledWith({
			method: 'GET',
			url: 'https://nextcloud.testing/nextcloud/remote.php/dav/fooBar',
			data: null,
			headers: expect.objectContaining({
				Depth: '0',
				'Content-Type': 'application/xml; charset=utf-8',
			}),
			validateStatus: expect.any(Function),
			signal: null,
		})

		expect(response).toEqual(expect.any(NetworkRequestError))
		expect(response.body).toEqual(null)
		expect(response.status).toEqual(-1)
	})

	it('should reject the promise on HTTP 5xx', async () => {
		const axiosRequestSpy = vi.spyOn(axios, 'request')
			.mockRejectedValueOnce({
				status: 503,
				data: 567,
			})

		const parser = {
			canParse: vi.fn(),
			parse: vi.fn(),
		}

		const request = new Request('https://nextcloud.testing/nextcloud/remote.php/dav/', parser)
		const response = await request.get('fooBar').catch(e => e)

		expect(axiosRequestSpy).toHaveBeenCalledWith({
			method: 'GET',
			url: 'https://nextcloud.testing/nextcloud/remote.php/dav/fooBar',
			data: null,
			headers: expect.objectContaining({
				Depth: '0',
				'Content-Type': 'application/xml; charset=utf-8',
			}),
			validateStatus: expect.any(Function),
			signal: null,
		})

		expect(response).toEqual(expect.any(NetworkRequestServerError))
		expect(response.body).toEqual(567)
		expect(response.status).toEqual(503)
	})

	it('should reject the promise on HTTP 4xx', async () => {
		const axiosRequestSpy = vi.spyOn(axios, 'request')
			.mockRejectedValueOnce({
				status: 403,
				data: 567,
			})

		const parser = {
			canParse: vi.fn(),
			parse: vi.fn(),
		}

		const request = new Request('https://nextcloud.testing/nextcloud/remote.php/dav/', parser)
		const response = await request.get('fooBar').catch(e => e)

		expect(axiosRequestSpy).toHaveBeenCalledTimes(1)
		expect(axiosRequestSpy).toHaveBeenCalledWith({
			method: 'GET',
			data: null,
			url: 'https://nextcloud.testing/nextcloud/remote.php/dav/fooBar',
			headers: expect.objectContaining({
				Depth: '0',
				'Content-Type': 'application/xml; charset=utf-8',
			}),
			validateStatus: expect.any(Function),
			signal: null,
		})

		expect(response).toEqual(expect.any(NetworkRequestClientError))
		expect(response.body).toEqual(567)
		expect(response.status).toEqual(403)
	})

	it('should reject the promise for unsuccessful HTTP requests', async () => {
		const axiosRequestSpy = vi.spyOn(axios, 'request')
			.mockRejectedValueOnce({
				data: 567,
				status: 666,
			})

		const parser = {
			canParse: vi.fn(),
			parse: vi.fn(),
		}

		const request = new Request('https://nextcloud.testing/nextcloud/remote.php/dav/', parser)
		const response = await request.get('fooBar').catch(e => e)

		expect(axiosRequestSpy).toHaveBeenCalledWith({
			method: 'GET',
			data: null,
			url: 'https://nextcloud.testing/nextcloud/remote.php/dav/fooBar',
			headers: expect.objectContaining({
				Depth: '0',
				'Content-Type': 'application/xml; charset=utf-8',
			}),
			validateStatus: expect.any(Function),
			signal: null,
		})

		expect(response).toEqual(expect.any(NetworkRequestHttpError))
		expect(response.body).toEqual(567)
		expect(response.status).toEqual(666)
	})

	it('should properly handle multistatus responses - Depth 0', async () => {
		const xmlResponse = `<?xml version="1.0"?>
<d:multistatus xmlns:d="DAV:" xmlns:s="http://sabredav.org/ns" xmlns:cal="urn:ietf:params:xml:ns:caldav"
			   xmlns:cs="http://calendarserver.org/ns/" xmlns:oc="http://owncloud.org/ns"
			   xmlns:nc="http://nextcloud.org/ns">
	<d:response>
		<d:href>/nextcloud/remote.php/dav/calendars/admin/</d:href>
		<d:propstat>
			<d:prop>
				<d:owner>
					<d:href>/nextcloud/remote.php/dav/principals/users/admin/</d:href>
				</d:owner>
				<d:resourcetype>
					<d:collection/>
				</d:resourcetype>
				<d:current-user-privilege-set>
					<d:privilege>
						<d:write/>
					</d:privilege>
					<d:privilege>
						<d:write-properties/>
					</d:privilege>
					<d:privilege>
						<d:write-content/>
					</d:privilege>
					<d:privilege>
						<d:unlock/>
					</d:privilege>
					<d:privilege>
						<d:bind/>
					</d:privilege>
					<d:privilege>
						<d:unbind/>
					</d:privilege>
					<d:privilege>
						<d:write-acl/>
					</d:privilege>
					<d:privilege>
						<d:read/>
					</d:privilege>
					<d:privilege>
						<d:read-acl/>
					</d:privilege>
					<d:privilege>
						<d:read-current-user-privilege-set/>
					</d:privilege>
				</d:current-user-privilege-set>
			</d:prop>
			<d:status>HTTP/1.1 200 OK</d:status>
		</d:propstat>
		<d:propstat>
			<d:prop>
				<d:displayname/>
				<d:sync-token/>
				<oc:invite/>
				<cs:allowed-sharing-modes/>
				<cs:publish-url/>
				<x1:calendar-order xmlns:x1="http://apple.com/ns/ical/"/>
				<x1:calendar-color xmlns:x1="http://apple.com/ns/ical/"/>
				<cs:getctag/>
				<cs:source/>
				<cal:calendar-description/>
				<cal:calendar-timezone/>
				<cal:supported-calendar-component-set/>
				<cal:supported-calendar-data/>
				<cal:max-resource-size/>
				<cal:min-date-time/>
				<cal:max-date-time/>
				<cal:max-instances/>
				<cal:max-attendees-per-instance/>
				<cal:supported-collation-set/>
				<cal:calendar-free-busy-set/>
				<cal:schedule-calendar-transp/>
				<cal:schedule-default-calendar-URL/>
				<oc:calendar-enabled/>
				<x2:owner-displayname xmlns:x2="http://nextcloud.com/ns"/>
			</d:prop>
			<d:status>HTTP/1.1 404 Not Found</d:status>
		</d:propstat>
	</d:response>
</d:multistatus>
`
		const axiosRequestSpy = vi.spyOn(axios, 'request')
			.mockResolvedValueOnce({
				data: xmlResponse,
				status: 207,
			})

		const parser = {
			canParse: vi.fn(),
			parse: vi.fn(),
		}

		parser.canParse.mockReturnValueOnce(true).mockReturnValueOnce(false).mockReturnValueOnce(true)
		parser.parse.mockReturnValueOnce('value1').mockReturnValueOnce('value2')

		const request = new Request('https://nextcloud.testing/nextcloud/remote.php/dav/', parser)
		const response = await request.propFind('fooBar', [])

		expect(axiosRequestSpy).toHaveBeenCalledTimes(1)
		expect(axiosRequestSpy).toHaveBeenCalledWith({
			method: 'PROPFIND',
			url: 'https://nextcloud.testing/nextcloud/remote.php/dav/fooBar',
			data: '<x0:propfind xmlns:x0="DAV:"><x0:prop/></x0:propfind>',
			headers: expect.objectContaining({
				Depth: 0,
				'Content-Type': 'application/xml; charset=utf-8',
			}),
			validateStatus: expect.any(Function),
			signal: null,
		})

		expect(parser.canParse).toHaveBeenCalledTimes(3)
		expect(parser.canParse).toHaveBeenCalledWith('{DAV:}owner')
		expect(parser.canParse).toHaveBeenCalledWith('{DAV:}resourcetype')
		expect(parser.canParse).toHaveBeenCalledWith('{DAV:}current-user-privilege-set')

		expect(parser.parse).toHaveBeenCalledTimes(2)
		expect(parser.parse).toHaveBeenCalledWith(expect.any(Document), expect.any(Node), expect.any(Function))
		expect(parser.parse).toHaveBeenCalledWith(expect.any(Document), expect.any(Node), expect.any(Function))

		expect(response).toEqual({
			body: {
				'{DAV:}owner': 'value1',
				'{DAV:}current-user-privilege-set': 'value2',
			},
			status: 207,
		})
	})

	it('should properly handle multistatus responses - Depth 1', async () => {
		const xmlResponse = `<?xml version="1.0"?>
<d:multistatus xmlns:d="DAV:" xmlns:s="http://sabredav.org/ns" xmlns:cal="urn:ietf:params:xml:ns:caldav"
			   xmlns:cs="http://calendarserver.org/ns/" xmlns:oc="http://owncloud.org/ns"
			   xmlns:nc="http://nextcloud.org/ns">
	<d:response>
		<d:href>/nextcloud/remote.php/dav/calendars/admin/</d:href>
		<d:propstat>
			<d:prop>
				<d:owner>
					<d:href>/nextcloud/remote.php/dav/principals/users/admin/</d:href>
				</d:owner>
				<d:resourcetype>
					<d:collection/>
				</d:resourcetype>
				<d:current-user-privilege-set>
					<d:privilege>
						<d:write/>
					</d:privilege>
					<d:privilege>
						<d:write-properties/>
					</d:privilege>
					<d:privilege>
						<d:write-content/>
					</d:privilege>
					<d:privilege>
						<d:unlock/>
					</d:privilege>
					<d:privilege>
						<d:bind/>
					</d:privilege>
					<d:privilege>
						<d:unbind/>
					</d:privilege>
					<d:privilege>
						<d:write-acl/>
					</d:privilege>
					<d:privilege>
						<d:read/>
					</d:privilege>
					<d:privilege>
						<d:read-acl/>
					</d:privilege>
					<d:privilege>
						<d:read-current-user-privilege-set/>
					</d:privilege>
				</d:current-user-privilege-set>
			</d:prop>
			<d:status>HTTP/1.1 200 OK</d:status>
		</d:propstat>
		<d:propstat>
			<d:prop>
				<d:displayname/>
				<d:sync-token/>
				<oc:invite/>
				<cs:allowed-sharing-modes/>
				<cs:publish-url/>
				<x1:calendar-order xmlns:x1="http://apple.com/ns/ical/"/>
				<x1:calendar-color xmlns:x1="http://apple.com/ns/ical/"/>
				<cs:getctag/>
				<cs:source/>
				<cal:calendar-description/>
				<cal:calendar-timezone/>
				<cal:supported-calendar-component-set/>
				<cal:supported-calendar-data/>
				<cal:max-resource-size/>
				<cal:min-date-time/>
				<cal:max-date-time/>
				<cal:max-instances/>
				<cal:max-attendees-per-instance/>
				<cal:supported-collation-set/>
				<cal:calendar-free-busy-set/>
				<cal:schedule-calendar-transp/>
				<cal:schedule-default-calendar-URL/>
				<oc:calendar-enabled/>
				<x2:owner-displayname xmlns:x2="http://nextcloud.com/ns"/>
			</d:prop>
			<d:status>HTTP/1.1 404 Not Found</d:status>
		</d:propstat>
	</d:response>
	<d:response>
		<d:href>/nextcloud/remote.php/dav/calendars/admin/personal/</d:href>
		<d:propstat>
			<d:prop>
				<d:displayname>Personal</d:displayname>
				<d:owner>
					<d:href>/nextcloud/remote.php/dav/principals/users/admin/</d:href>
				</d:owner>
				<d:resourcetype>
					<d:collection/>
					<cal:calendar/>
				</d:resourcetype>
				<d:sync-token>http://sabre.io/ns/sync/17</d:sync-token>
				<d:current-user-privilege-set>
					<d:privilege>
						<d:write/>
					</d:privilege>
					<d:privilege>
						<d:write-properties/>
					</d:privilege>
					<d:privilege>
						<d:write-content/>
					</d:privilege>
					<d:privilege>
						<d:unlock/>
					</d:privilege>
					<d:privilege>
						<d:bind/>
					</d:privilege>
					<d:privilege>
						<d:unbind/>
					</d:privilege>
					<d:privilege>
						<d:write-acl/>
					</d:privilege>
					<d:privilege>
						<d:read/>
					</d:privilege>
					<d:privilege>
						<d:read-acl/>
					</d:privilege>
					<d:privilege>
						<d:read-current-user-privilege-set/>
					</d:privilege>
					<d:privilege>
						<cal:read-free-busy/>
					</d:privilege>
				</d:current-user-privilege-set>
				<oc:invite>
					<oc:user>
						<d:href>principal:principals/users/admin</d:href>
						<oc:common-name>admin</oc:common-name>
						<oc:invite-accepted/>
						<oc:access>
							<oc:read-write/>
						</oc:access>
					</oc:user>
					<oc:user>
						<d:href>principal:principals/groups/admin</d:href>
						<oc:invite-accepted/>
						<oc:access>
							<oc:read-write/>
						</oc:access>
					</oc:user>
				</oc:invite>
				<cs:allowed-sharing-modes>
					<cs:can-be-shared/>
					<cs:can-be-published/>
				</cs:allowed-sharing-modes>
				<cs:publish-url>
					<d:href>http://all.local/nextcloud/remote.php/dav/public-calendars/Fnn4DyyW6fidF3Y8</d:href>
				</cs:publish-url>
				<x1:calendar-order xmlns:x1="http://apple.com/ns/ical/">2</x1:calendar-order>
				<x1:calendar-color xmlns:x1="http://apple.com/ns/ical/">#F64F00FF</x1:calendar-color>
				<cs:getctag>http://sabre.io/ns/sync/17</cs:getctag>
				<cal:calendar-timezone>BEGIN:VCALENDAR&#13;
					VERSION:2.0&#13;
					PRODID:-//Apple Inc.//Mac OS X 10.13.6//EN&#13;
					CALSCALE:GREGORIAN&#13;
					BEGIN:VTIMEZONE&#13;
					TZID:Europe/Berlin&#13;
					BEGIN:DAYLIGHT&#13;
					TZOFFSETFROM:+0100&#13;
					RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU&#13;
					DTSTART:19810329T020000&#13;
					TZNAME:CEST&#13;
					TZOFFSETTO:+0200&#13;
					END:DAYLIGHT&#13;
					BEGIN:STANDARD&#13;
					TZOFFSETFROM:+0200&#13;
					RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU&#13;
					DTSTART:19961027T030000&#13;
					TZNAME:CET&#13;
					TZOFFSETTO:+0100&#13;
					END:STANDARD&#13;
					END:VTIMEZONE&#13;
					END:VCALENDAR&#13;
				</cal:calendar-timezone>
				<cal:supported-calendar-component-set>
					<cal:comp name="VEVENT"/>
					<cal:comp name="VTODO"/>
				</cal:supported-calendar-component-set>
				<cal:supported-calendar-data>
					<cal:calendar-data content-type="text/calendar" version="2.0"/>
					<cal:calendar-data content-type="application/calendar+json"/>
				</cal:supported-calendar-data>
				<cal:max-resource-size>10000000</cal:max-resource-size>
				<cal:supported-collation-set>
					<cal:supported-collation>i;ascii-casemap</cal:supported-collation>
					<cal:supported-collation>i;octet</cal:supported-collation>
					<cal:supported-collation>i;unicode-casemap</cal:supported-collation>
				</cal:supported-collation-set>
				<cal:schedule-calendar-transp>
					<cal:opaque/>
				</cal:schedule-calendar-transp>
				<oc:calendar-enabled>1</oc:calendar-enabled>
				<x2:owner-displayname xmlns:x2="http://nextcloud.com/ns">admin</x2:owner-displayname>
			</d:prop>
			<d:status>HTTP/1.1 200 OK</d:status>
		</d:propstat>
		<d:propstat>
			<d:prop>
				<cs:source/>
				<cal:calendar-description/>
				<cal:min-date-time/>
				<cal:max-date-time/>
				<cal:max-instances/>
				<cal:max-attendees-per-instance/>
				<cal:calendar-free-busy-set/>
				<cal:schedule-default-calendar-URL/>
			</d:prop>
			<d:status>HTTP/1.1 404 Not Found</d:status>
		</d:propstat>
	</d:response>
</d:multistatus>
`
		const axiosRequestSpy = vi.spyOn(axios, 'request')
			.mockResolvedValueOnce({
				data: xmlResponse,
				status: 207,
			})

		const parser = {
			canParse: vi.fn(),
			parse: vi.fn(),
		}

		parser.canParse.mockReturnValueOnce(true).mockReturnValueOnce(true).mockReturnValueOnce(false).mockReturnValueOnce(true).mockReturnValueOnce(true).mockReturnValueOnce(true).mockReturnValueOnce(true).mockReturnValueOnce(true).mockReturnValueOnce(true).mockReturnValueOnce(true).mockReturnValueOnce(true).mockReturnValueOnce(true).mockReturnValueOnce(true).mockReturnValueOnce(true).mockReturnValueOnce(true).mockReturnValueOnce(true).mockReturnValueOnce(true).mockReturnValueOnce(true).mockReturnValueOnce(true).mockReturnValueOnce(true).mockReturnValueOnce(true).mockReturnValueOnce(true).mockReturnValueOnce(true)
		parser.parse.mockReturnValueOnce('value1').mockReturnValueOnce('value2').mockReturnValueOnce('value3').mockReturnValueOnce('value4').mockReturnValueOnce('value5').mockReturnValueOnce('value6').mockReturnValueOnce('value7').mockReturnValueOnce('value8').mockReturnValueOnce('value9').mockReturnValueOnce('value10').mockReturnValueOnce('value11').mockReturnValueOnce('value12').mockReturnValueOnce('value13').mockReturnValueOnce('value14').mockReturnValueOnce('value15').mockReturnValueOnce('value16').mockReturnValueOnce('value17').mockReturnValueOnce('value18').mockReturnValueOnce('value19').mockReturnValueOnce('value20').mockReturnValueOnce('value21').mockReturnValueOnce('value22')

		const request = new Request('https://nextcloud.testing/nextcloud/remote.php/dav/', parser)
		const response = await request.get('fooBar', { Depth: 1 })
		expect(axiosRequestSpy).toHaveBeenCalledWith({
			method: 'GET',
			url: 'https://nextcloud.testing/nextcloud/remote.php/dav/fooBar',
			data: null,
			headers: expect.objectContaining({
				Depth: 1,
				'Content-Type': 'application/xml; charset=utf-8',
			}),
			validateStatus: expect.any(Function),
			signal: null,
		})

		expect(parser.canParse).toHaveBeenCalledTimes(22)
		expect(parser.canParse).toHaveBeenCalledWith('{DAV:}owner')
		expect(parser.canParse).toHaveBeenCalledWith('{DAV:}resourcetype')
		expect(parser.canParse).toHaveBeenCalledWith('{DAV:}current-user-privilege-set')
		expect(parser.canParse).toHaveBeenCalledWith('{DAV:}displayname')
		expect(parser.canParse).toHaveBeenCalledWith('{DAV:}owner')
		expect(parser.canParse).toHaveBeenCalledWith('{DAV:}resourcetype')
		expect(parser.canParse).toHaveBeenCalledWith('{DAV:}sync-token')
		expect(parser.canParse).toHaveBeenCalledWith('{DAV:}current-user-privilege-set')
		expect(parser.canParse).toHaveBeenCalledWith('{http://owncloud.org/ns}invite')
		expect(parser.canParse).toHaveBeenCalledWith('{http://calendarserver.org/ns/}allowed-sharing-modes')
		expect(parser.canParse).toHaveBeenCalledWith('{http://calendarserver.org/ns/}publish-url')
		expect(parser.canParse).toHaveBeenCalledWith('{http://apple.com/ns/ical/}calendar-order')
		expect(parser.canParse).toHaveBeenCalledWith('{http://apple.com/ns/ical/}calendar-color')
		expect(parser.canParse).toHaveBeenCalledWith('{http://calendarserver.org/ns/}getctag')
		expect(parser.canParse).toHaveBeenCalledWith('{urn:ietf:params:xml:ns:caldav}calendar-timezone')
		expect(parser.canParse).toHaveBeenCalledWith('{urn:ietf:params:xml:ns:caldav}supported-calendar-component-set')
		expect(parser.canParse).toHaveBeenCalledWith('{urn:ietf:params:xml:ns:caldav}supported-calendar-data')
		expect(parser.canParse).toHaveBeenCalledWith('{urn:ietf:params:xml:ns:caldav}max-resource-size')
		expect(parser.canParse).toHaveBeenCalledWith('{urn:ietf:params:xml:ns:caldav}supported-collation-set')
		expect(parser.canParse).toHaveBeenCalledWith('{urn:ietf:params:xml:ns:caldav}schedule-calendar-transp')
		expect(parser.canParse).toHaveBeenCalledWith('{http://owncloud.org/ns}calendar-enabled')
		expect(parser.canParse).toHaveBeenCalledWith('{http://nextcloud.com/ns}owner-displayname')

		expect(parser.parse).toHaveBeenCalledTimes(21)
		expect(parser.parse).toHaveBeenCalledWith(expect.any(Document), expect.any(Node), expect.any(Function))
		expect(parser.parse).toHaveBeenCalledWith(expect.any(Document), expect.any(Node), expect.any(Function))
		expect(parser.parse).toHaveBeenCalledWith(expect.any(Document), expect.any(Node), expect.any(Function))
		expect(parser.parse).toHaveBeenCalledWith(expect.any(Document), expect.any(Node), expect.any(Function))
		expect(parser.parse).toHaveBeenCalledWith(expect.any(Document), expect.any(Node), expect.any(Function))
		expect(parser.parse).toHaveBeenCalledWith(expect.any(Document), expect.any(Node), expect.any(Function))
		expect(parser.parse).toHaveBeenCalledWith(expect.any(Document), expect.any(Node), expect.any(Function))
		expect(parser.parse).toHaveBeenCalledWith(expect.any(Document), expect.any(Node), expect.any(Function))
		expect(parser.parse).toHaveBeenCalledWith(expect.any(Document), expect.any(Node), expect.any(Function))
		expect(parser.parse).toHaveBeenCalledWith(expect.any(Document), expect.any(Node), expect.any(Function))
		expect(parser.parse).toHaveBeenCalledWith(expect.any(Document), expect.any(Node), expect.any(Function))
		expect(parser.parse).toHaveBeenCalledWith(expect.any(Document), expect.any(Node), expect.any(Function))
		expect(parser.parse).toHaveBeenCalledWith(expect.any(Document), expect.any(Node), expect.any(Function))
		expect(parser.parse).toHaveBeenCalledWith(expect.any(Document), expect.any(Node), expect.any(Function))
		expect(parser.parse).toHaveBeenCalledWith(expect.any(Document), expect.any(Node), expect.any(Function))
		expect(parser.parse).toHaveBeenCalledWith(expect.any(Document), expect.any(Node), expect.any(Function))
		expect(parser.parse).toHaveBeenCalledWith(expect.any(Document), expect.any(Node), expect.any(Function))
		expect(parser.parse).toHaveBeenCalledWith(expect.any(Document), expect.any(Node), expect.any(Function))
		expect(parser.parse).toHaveBeenCalledWith(expect.any(Document), expect.any(Node), expect.any(Function))
		expect(parser.parse).toHaveBeenCalledWith(expect.any(Document), expect.any(Node), expect.any(Function))
		expect(parser.parse).toHaveBeenCalledWith(expect.any(Document), expect.any(Node), expect.any(Function))

		expect(response).toEqual({
			body: expect.objectContaining({
				'/nextcloud/remote.php/dav/calendars/admin/': {
					'{DAV:}owner': 'value1',
					'{DAV:}resourcetype': 'value2',
				},
				'/nextcloud/remote.php/dav/calendars/admin/personal/': {
					'{DAV:}displayname': 'value3',
					'{DAV:}owner': 'value4',
					'{DAV:}resourcetype': 'value5',
					'{DAV:}sync-token': 'value6',
					'{DAV:}current-user-privilege-set': 'value7',
					'{http://owncloud.org/ns}invite': 'value8',
					'{http://calendarserver.org/ns/}allowed-sharing-modes': 'value9',
					'{http://calendarserver.org/ns/}publish-url': 'value10',
					'{http://apple.com/ns/ical/}calendar-order': 'value11',
					'{http://apple.com/ns/ical/}calendar-color': 'value12',
					'{http://calendarserver.org/ns/}getctag': 'value13',
					'{urn:ietf:params:xml:ns:caldav}calendar-timezone': 'value14',
					'{urn:ietf:params:xml:ns:caldav}supported-calendar-component-set': 'value15',
					'{urn:ietf:params:xml:ns:caldav}supported-calendar-data': 'value16',
					'{urn:ietf:params:xml:ns:caldav}max-resource-size': 'value17',
					'{urn:ietf:params:xml:ns:caldav}supported-collation-set': 'value18',
					'{urn:ietf:params:xml:ns:caldav}schedule-calendar-transp': 'value19',
					'{http://owncloud.org/ns}calendar-enabled': 'value20',
					'{http://nextcloud.com/ns}owner-displayname': 'value21',
				},
			}),
			status: 207,
		})
	})

	// FIXME: solve issue calling beforeRequestHandler
	it.todo('should call the before request handler', async () => {
		const axiosRequestSpy = vi.spyOn(axios, 'request')
			.mockResolvedValueOnce({
				data: 567,
				status: 200,
			})

		const parser = {
			canParse: vi.fn(),
			parse: vi.fn(),
		}

		const beforeRequestHandler = vi.fn(c => c)

		const request = new Request('https://nextcloud.testing/nextcloud/remote.php/dav/', parser)
		const response = await request.get('fooBar', {}, null, beforeRequestHandler)

		expect(axiosRequestSpy).toHaveBeenCalledTimes(1)
		expect(axiosRequestSpy).toHaveBeenCalledWith({
			url: 'https://nextcloud.testing/nextcloud/remote.php/dav/fooBar',
			method: 'GET',
			headers: expect.objectContaining({
				'Content-Type': 'application/xml; charset=utf-8',
				Depth: '0',
			}),
			data: null,
			// transformRequest: beforeRequestHandler
			validateStatus: expect.any(Function),
			signal: null,
		})

		expect(response).toEqual({
			body: 567,
			status: 200,
		})

		// make sure it wasn't called again
		expect(beforeRequestHandler).toHaveBeenCalledTimes(1)
	})

	// FIXME: solve issue with afterRequestHandler
	it.todo('should call the after request handler', async () => {

		const parser = {
			canParse: vi.fn(),
			parse: vi.fn(),
		}
		const afterRequestHandler = vi.fn()

		const axiosRequestSpy = vi.spyOn(axios, 'request')
			.mockResolvedValueOnce({
				data: 567,
				status: 200,
			})
		const request = new Request('https://nextcloud.testing/nextcloud/remote.php/dav/', parser)
		const response = await request.get('fooBar', {}, null, () => null, afterRequestHandler)

		expect(axiosRequestSpy).toHaveBeenCalledWith({
			method: 'GET',
			url: 'https://nextcloud.testing/nextcloud/remote.php/dav/fooBar',
			data: null,
			headers: expect.objectContaining({
				Depth: '0',
				'Content-Type': 'application/xml; charset=utf-8',
			}),
			validateStatus: expect.any(Function),
			signal: null,
		})

		expect(response).toEqual({
			body: 567,
			status: 200,
		})

		// expect(afterRequestHandler).toHaveBeenCalledTimes(1)
	})

	it('should return the filename of a URL', () => {

		const parser = {
			canParse: vi.fn(),
			parse: vi.fn(),
		}

		const request = new Request('https://nextcloud.testing/nextcloud/remote.php/dav/', parser)

		expect(request.filename('')).toEqual('/dav')
		expect(request.filename('foo')).toEqual('/foo')
		expect(request.filename('foo/bar/baz/')).toEqual('/baz')
	})

	it('should return the pathname of a URL', () => {

		const parser = {
			canParse: vi.fn(),
			parse: vi.fn(),
		}

		const request = new Request('https://nextcloud.testing/nextcloud/remote.php/dav/', parser)

		expect(request.pathname('')).toEqual('/nextcloud/remote.php/dav/')
		expect(request.pathname('foo')).toEqual('/nextcloud/remote.php/dav/foo')
		expect(request.pathname('foo/bar/baz/')).toEqual('/nextcloud/remote.php/dav/foo/bar/baz/')
	})

	it('should return the absolute url of a URL', () => {

		const parser = {
			canParse: vi.fn(),
			parse: vi.fn(),
		}

		const request = new Request('https://nextcloud.testing/nextcloud/remote.php/dav/', parser)

		expect(request.absoluteUrl('')).toEqual('https://nextcloud.testing/nextcloud/remote.php/dav/')
		expect(request.absoluteUrl('foo')).toEqual('https://nextcloud.testing/nextcloud/remote.php/dav/foo')
		expect(request.absoluteUrl('foo/bar/baz/')).toEqual('https://nextcloud.testing/nextcloud/remote.php/dav/foo/bar/baz/')
		expect(request.absoluteUrl('https://foo.bar/nextcloud/remote.php/caldav/')).toEqual('https://foo.bar/nextcloud/remote.php/caldav/')
	})
})
