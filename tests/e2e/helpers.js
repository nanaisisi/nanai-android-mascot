export function createMockElement(tag) {
	const children = [];
	return {
		tagName: String(tag || "").toUpperCase(),
		textContent: "",
		innerHTML: "",
		style: {},
		dataset: {},
		children,
		childNodes: children,
		get lastChild() {
			return children[children.length - 1] || null;
		},
		appendChild(node) {
			node.parentNode = this;
			children.push(node);
			if (typeof node === "string") {
				this.textContent += node;
			} else if (node?.textContent) {
				this.textContent += node.textContent;
			}
		},
		removeChild(node) {
			const idx = children.indexOf(node);
			if (idx !== -1) {
				children.splice(idx, 1);
			}
		},
		remove() {
			if (this.parentNode) {
				this.parentNode.removeChild(this);
			}
		},
		setAttribute(name, val) {
			this[name] = val;
		},
		addEventListener(type, cb) {
			this._listeners = this._listeners || {};
			this._listeners[type] = cb;
		},
		removeEventListener(_type, _cb) {},
		click() {
			this._listeners?.click?.({ stopPropagation() {} });
		},
		mouseenter() {
			this._listeners?.mouseenter?.();
		},
		mouseleave() {
			this._listeners?.mouseleave?.();
		},
		focus() {},
		blur() {},
	};
}

export function setupMockDOM() {
	globalThis.window = globalThis;
	globalThis.document = {
		createElement: createMockElement,
		addEventListener(_type, _cb) {},
		removeEventListener(_type, _cb) {},
	};
}

setupMockDOM();
