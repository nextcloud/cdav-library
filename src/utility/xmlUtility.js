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

const serializer = new XMLSerializer();
let prefixMap = {};

/**
 * builds the root skeleton
 *
 * @params {...Array} array of namespace / name pairs
 * @returns {*[]}
 */
export function getRootSkeleton()  {
	if (arguments.length === 0) {
		return [{}, null];
	}

	const skeleton = {
		name: arguments[0],
		children: []
	};

	let childrenWrapper = skeleton.children;

	const args = Array.prototype.slice.call(arguments, 1);
	args.forEach(function(argument) {
		const level = {
			name: argument,
			children: []
		};
		childrenWrapper.push(level);
		childrenWrapper = level.children;
	});

	return [skeleton, childrenWrapper];
}

/**
 * serializes an simple xml representation into a string
 *
 * @param {Object} json
 * @returns {string}
 */
export function serialize(json) {
	json = json || {};
	if (typeof json !== 'object' || !json.hasOwnProperty('name')) {
		return '';
	}

	const root = document.implementation.createDocument('', '', null);
	xmlify(root, root, json);

	return serializer.serializeToString(root);
}

function xmlify(xmlDoc, parent, json) {
	const [ns, localName] = json.name;
	const element = xmlDoc.createElementNS(ns, getPrefixedNameForNamespace(ns, localName));

	json.attributes = json.attributes || [];
	json.attributes.forEach((attribute) => {
		if (attribute.length === 2) {
			const [name, value] = attribute;
			element.setAttribute(name, value);
		} else {
			const [namespace, localName, value] = attribute;
			element.setAttributeNS(namespace, localName, value);
		}
	});

	if (json.value) {
		element.textContent = json.value;
	} else if (json.children) {
		json.children.forEach((child) => {
			xmlify(xmlDoc, element, child);
		});
	}

	parent.appendChild(element);
}

export function resetPrefixMap() {
	prefixMap = {};
}

function getPrefixedNameForNamespace(ns, localName) {
	if (!prefixMap.hasOwnProperty(ns)) {
		prefixMap[ns] = 'x' + Object.keys(prefixMap).length;
	}

	return prefixMap[ns] + ':' + localName;
}
