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

/**
 *
 * This parser is capable of parsing:
 * - {http://apple.com/ns/ical/}calendar-order
 * - {http://apple.com/ns/ical/}calendar-color
 * - {http://calendarserver.org/ns/}getctag
 * - {http://calendarserver.org/ns/}source
 * - {urn:ietf:params:xml:ns:caldav}calendar-description
 * - {urn:ietf:params:xml:ns:caldav}calendar-timezone
 * - {urn:ietf:params:xml:ns:caldav}supported-calendar-component-set
 * - {urn:ietf:params:xml:ns:caldav}supported-calendar-data
 * - {urn:ietf:params:xml:ns:caldav}max-resource-size
 * - {urn:ietf:params:xml:ns:caldav}min-date-time
 * - {urn:ietf:params:xml:ns:caldav}max-date-time
 * - {urn:ietf:params:xml:ns:caldav}max-instances
 * - {urn:ietf:params:xml:ns:caldav}max-attendees-per-instance
 * - {urn:ietf:params:xml:ns:caldav}supported-collation-set
 * - {http://owncloud.org/ns}calendar-enabled
 * - {http://nextcloud.com/ns}owner-displayname
 *
 * @param {Object} props
 * @return {Object}
 */
export default function calendarParser(props) {
	const parsed = {};

	Object.entries(props).forEach(([key, value]) => {
		switch (key) {
			case '{http://apple.com/ns/ical/}calendar-color':
				parsed[key] = calendarColor(value);
				break;

			case '{http://calendarserver.org/ns/}getctag':
			case '{http://nextcloud.com/ns}owner-displayname':
			case '{urn:ietf:params:xml:ns:caldav}calendar-description':
			case '{urn:ietf:params:xml:ns:caldav}calendar-timezone':
				parsed[key] = simpleText(value);
				break;

			case '{http://apple.com/ns/ical/}calendar-order':
			case '{urn:ietf:params:xml:ns:caldav}max-resource-size':
			case '{urn:ietf:params:xml:ns:caldav}max-instances':
			case '{urn:ietf:params:xml:ns:caldav}max-attendees-per-instance':
				parsed[key] = simpleInt(value);
				break;

			case '{http://calendarserver.org/ns/}source':
				parsed[key] = source(value);
				break;

			case '{urn:ietf:params:xml:ns:caldav}supported-calendar-component-set':
				parsed[key] = supportedCalendarComponentSet(value);
				break;

			case '{urn:ietf:params:xml:ns:caldav}supported-calendar-data':
				parsed[key] = supportedCalendarData(value);
				break;

			case '{urn:ietf:params:xml:ns:caldav}min-date-time':
				parsed[key] = dateTime(value);
				break;

			case '{urn:ietf:params:xml:ns:caldav}max-date-time':
				parsed[key] = dateTime(value);
				break;

			case '{urn:ietf:params:xml:ns:caldav}supported-collation-set':
				parsed[key] = supportedCollationSet(value);
				break;

			case '{http://owncloud.org/ns}calendar-enabled':
				parsed[key] = simpleBool(value);
				break;

			default:
				break;
		}
	});

	return parsed;
}

function simpleText(prop) {
	return prop;
}

function simpleInt(prop) {
	return parseInt(prop, 10);
}

function simpleBool(prop) {
	return prop === '1';
}

function calendarColor(prop) {
	// some stupid clients store an alpha value in the rgb hash (like #rrggbbaa) *cough cough* Apple Calendar *cough cough*
	// but some browsers can't parse that *cough cough* Safari 9 *cough cough*
	// Safari 10 seems to support this though
	if (prop.length === 9) {
		return prop.substr(0,7);
	}

	return prop;
}

function source(prop) {

}

function supportedCalendarComponentSet(prop) {
	const simpleComponents = {
		vevent: false,
		vjournal: false,
		vtodo: false
	};

	prop.forEach(function(component) {
		const name = component.attributes.getNamedItem('name').textContent.toLowerCase();

		if (simpleComponents.hasOwnProperty(name)) {
			simpleComponents[name] = true;
		}
	});

	return simpleComponents;
}

function supportedCalendarData(prop) {
	if (!Array.isArray(prop)) {
		return;
	}

	return prop.map((v) => {
		return {
			'content-type': v.getAttribute('content-type'),
			'version': v.getAttribute('version')
		};
	});
}

function dateTime(prop) {
	const year = parseInt(prop.substr(0, 4), 10);
	const month = parseInt(prop.substr(4, 2), 10) - 1;
	const date = parseInt(prop.substr(6, 2), 10);

	const hour = parseInt(prop.substr(9, 2), 10);
	const minute = parseInt(prop.substr(11, 2), 10);
	const second = parseInt(prop.substr(13, 2), 10);

	const dateObj = new Date();
	dateObj.setUTCFullYear(year, month, date);
	dateObj.setUTCHours(hour, minute, second, 0);
	return dateObj;
}

function supportedCollationSet(prop) {
	if (!Array.isArray(prop)) {
		return;
	}

	return prop.map((v) => v.textContent);
}
