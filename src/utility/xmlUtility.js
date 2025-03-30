/**
 * CDAV Library
 *
 * This library is part of the Nextcloud project
 *
 * SPDX-FileCopyrightText: 2018 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

const serializer = new XMLSerializer()
let prefixMap = {}

/**
 * builds the root skeleton
 *
 * @params {...Array} array of namespace / name pairs
 * @return {*[]}
 */
export function getRootSkeleton() {
	if (arguments.length === 0) {
		return [{}, null]
	}

	const skeleton = {
		name: arguments[0],
		children: [],
	}

	let childrenWrapper = skeleton.children

	const args = Array.prototype.slice.call(arguments, 1)
	args.forEach(function(argument) {
		const level = {
			name: argument,
			children: [],
		}
		childrenWrapper.push(level)
		childrenWrapper = level.children
	})

	return [skeleton, childrenWrapper]
}

/**
 * serializes an simple xml representation into a string
 *
 * @param {object} json
 * @return {string}
 */
export function serialize(json) {
	json = json || {}
	if (typeof json !== 'object' || !Object.prototype.hasOwnProperty.call(json, 'name')) {
		return ''
	}

	const root = document.implementation.createDocument('', '', null)
	xmlify(root, root, json)

	return serializer.serializeToString(root)
}

function xmlify(xmlDoc, parent, json) {
	const [ns, localName] = json.name
	const element = xmlDoc.createElementNS(ns, getPrefixedNameForNamespace(ns, localName))

	json.attributes = json.attributes || []
	json.attributes.forEach((attribute) => {
		if (attribute.length === 2) {
			const [name, value] = attribute
			element.setAttribute(name, value)
		} else {
			const [namespace, localName, value] = attribute
			element.setAttributeNS(namespace, getPrefixedNameForNamespace(namespace, localName), value)
		}
	})

	if (json.value) {
		element.textContent = json.value
	} else if (json.children) {
		json.children.forEach((child) => {
			xmlify(xmlDoc, element, child)
		})
	}

	parent.appendChild(element)
}

export function resetPrefixMap() {
	prefixMap = {}
}

function getPrefixedNameForNamespace(ns, localName) {
	if (!Object.prototype.hasOwnProperty.call(prefixMap, ns)) {
		prefixMap[ns] = 'x' + Object.keys(prefixMap).length
	}

	return prefixMap[ns] + ':' + localName
}
