/**
 * CDAV Library
 *
 * This library is part of the Nextcloud project
 *
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { describe, expect, it } from 'vitest'

import vcardPropSet from '../../../src/propset/vcardPropSet.js'
import * as NS from '../../../src/utility/namespaceUtility.js'

describe('vCard prop-set', () => {
	it('should ignore unknown properties', () => {
		expect(vcardPropSet({
			'{Foo:}bar': 123,
		})).toEqual([])
	})

	it('should serialize {http://nextcloud.com/ns}favorite correctly - not set', () => {
		expect(vcardPropSet({
			'{http://nextcloud.com/ns}favorite': false,
		})).toEqual([
			{
				name: [NS.NEXTCLOUD, 'favorite'],
				value: null,
			},
		])
	})

	it('should serialize {http://nextcloud.com/ns}favorite correctly - set', () => {
		expect(vcardPropSet({
			'{http://nextcloud.com/ns}favorite': true,
		})).toEqual([
			{
				name: [NS.NEXTCLOUD, 'favorite'],
				value: '1',
			},
		])
	})
})
