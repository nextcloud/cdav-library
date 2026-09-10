/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import DavClient, { debug, namespaces } from '@nextcloud/cdav-library'

const client = new DavClient({ rootUrl: 'https://example.com/remote.php/dav/' })
const connected: Promise<DavClient> = client.connect({ enableCalDAV: true, enableCardDAV: true })
const namespace: string = namespaces.DAV
debug.enabled = true
debug('types')(namespace, connected)

async function exerciseModels() {
	const calendars = await client.calendarHomes[0].findAllCalendars()
	const calendar = calendars[0]
	calendar.color = '#0082c9'
	calendar.enabled = true
	calendar.displayname = 'Work'
	const url: string = calendar.url
	await calendar.share('principal:principals/users/alice', true)
	await calendar.publish()
	const objects = await calendar.findByTypeInTimeRange('VEVENT', new Date(), new Date())
	objects[0].data = 'BEGIN:VCALENDAR\r\nEND:VCALENDAR'
	await objects[0].update()
	const books = await client.addressBookHomes[0].findAll()
	const book = await client.addressBookHomes[0].createAddressBookCollection('Contacts')
	await book.share('principal:principals/users/alice')
	const card = await book.createVCard('BEGIN:VCARD\r\nEND:VCARD')
	card.favorite = true
	const data: string | undefined = card.data
	const principals = await client.principalPropertySearchByAddressAndStory('Main Street', '2')
	const name: string | undefined = principals[0].displayname
	const userId: string | null = principals[0].userId
	// @ts-expect-error A color must be a string.
	calendar.color = 123
	// @ts-expect-error Dynamic read-only properties must stay read-only.
	calendar.components = []
	// @ts-expect-error Mixing in sharing must not introduce an any index signature.
	calendar.nonexistentMethod()
	// @ts-expect-error Card favorites are booleans.
	card.favorite = 'yes'
	return { url, books, data, name, userId }
}
void exerciseModels
// @ts-expect-error A root URL is required.
new DavClient({})
// @ts-expect-error Principal may be null until connected.
client.currentUserPrincipal.userId
