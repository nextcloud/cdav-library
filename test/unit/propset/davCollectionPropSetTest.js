/**
 * CDAV Library
 *
 * This library is part of the Nextcloud project
 *
 * SPDX-FileCopyrightText: 2018 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { describe, expect, it } from "vitest";

import davCollectionPropSet from "../../../src/propset/davCollectionPropSet.js";

describe('Dav collection prop-set', () => {
	it('should ignore unknown properties', () => {
		expect(davCollectionPropSet({
			'{Foo:}bar': 123
		})).toEqual([]);
	});

	it('should serialize {DAV:}displayname correctly', () => {
		expect(davCollectionPropSet({
			'{Foo:}bar': 123,
			'{DAV:}displayname': 'New displayname for collection'
		})).toEqual([
			{
				name: ['DAV:', 'displayname'],
				value: 'New displayname for collection'
			}
		]);
	});
});
