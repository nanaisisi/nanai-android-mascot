export const events = [];

export const createEl = (tag) => {
	const children = [];
	const el = {
		tagName: String(tag || "").toUpperCase(),
		textContent: "",
		innerHTML: "",
		style: {},
		dataset: {},
		children,
		appendChild(child) {
			children.push(child);
			if (typeof child === "string") this.textContent += child;
			else if (child?.textContent) this.textContent += child.textContent;
		},
		setAttribute(a, v) {
			this[a] = v;
		},
		addEventListener(t, cb) {
			this._listeners = this._listeners || {};
			this._listeners[t] = cb;
		},
		click() {
			this._listeners?.click?.({ stopPropagation() {} });
		},
	};
	return el;
};

export function setupMockDom() {
	globalThis.window = globalThis;
	globalThis.__TAURI_INTERNALS__ = {
		transformCallback: () => 0,
		invoke: async (cmd, args) => {
			if (cmd === "plugin:event|emit") events.push(args);
		},
	};
	globalThis.document = {
		createElement: createEl,
	};
	globalThis.requestAnimationFrame = (callback) => setTimeout(callback, 0);
	globalThis.cancelAnimationFrame = (id) => clearTimeout(id);
}

setupMockDom();
