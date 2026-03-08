/**
 * CDAV Library
 *
 * This library is part of the Nextcloud project
 *
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { evaluate } from 'xpath-ts'

/**
 * @param {string} expression Same as in {@link document.evaluate}.
 * @param {Node} contextNode Same as in {@link document.evaluate}.
 * @param {XPathNSResolver|null} [resolver] Same as in {@link document.evaluate}.
 * @param {number} [type] Same as in {@link document.evaluate}.
 * @param {XPathResult|null} [result] Same as in {@link document.evaluate}.
 * @return {XPathResult} Same as in {@link document.evaluate}.
 */
export function select(expression, contextNode, resolver, type, result) {
	return evaluate(expression, contextNode, resolver, type, result)
}
