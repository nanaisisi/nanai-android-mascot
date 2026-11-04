export const createdElements = [];

export function resetCreatedElements() {
	createdElements.length = 0;
}

export function createMockElement(tag) {
	const el = {
		tagName: String(tag || "").toUpperCase(),
		className: "",
		style: {},
		value: "",
		placeholder: "",
		maxLength: 0,
		min: "",
		max: "",
		rows: 0,
		type: "",
		textContent: "",
		children: [],
		dataset: {},
		appendChild(child) {
			this.children.push(child);
		},
		remove() {
			this.removed = true;
		},
		setAttribute(name, val) {
			this[name] = val;
		},
		getAttribute(name) {
			return this[name];
		},
		addEventListener(type, cb) {
			this._listeners = this._listeners || {};
			this._listeners[type] = cb;
		},
		click() {
			this._listeners?.click?.({ stopPropagation() {} });
		},
		focus() {
			this.focused = true;
		},
	};
	createdElements.push(el);
	return el;
}

export function setupMockDom() {
	globalThis.window = globalThis;
	globalThis.document = {
		createElement(tag) {
			return createMockElement(tag);
		},
	};
}

setupMockDom();
