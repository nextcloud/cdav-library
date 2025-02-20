/**
 * CDAV Library
 *
 * This library is part of the Nextcloud project
 *
 * SPDX-FileCopyrightText: 2018 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { describe, expect, it } from "vitest";

import DAVEvent from "../../../src/models/davEvent.js";

describe('Dav event model', () => {
	it('should provide a constructor with type', () => {
		const event1 = new DAVEvent('UPDATED_ON_SERVER');

		expect(event1).toEqual(expect.any(DAVEvent));
		expect(event1.type).toEqual('UPDATED_ON_SERVER');
	});

	it('should provide a constructor with type and more options', () => {
		const event1 = new DAVEvent('UPDATED_ON_SERVER', {
			'foo': 'bar',
			'bar': 'baz',
		});

		expect(event1).toEqual(expect.any(DAVEvent));
		expect(event1.type).toEqual('UPDATED_ON_SERVER');
		expect(event1.foo).toEqual('bar');
		expect(event1.bar).toEqual('baz');
	});
});
