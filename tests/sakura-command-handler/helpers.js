/**
 * Shared mock and factory helpers for sakura-command-handler tests
 */

export function setupMockDom() {
	globalThis.window = globalThis;
	globalThis.document = {
		createElement(tag) {
			const el = {
				tagName: tag.toUpperCase(),
				style: {},
				className: "",
				children: [],
				appendChild(child) {
					this.children.push(child);
				},
				remove() {
					this.removed = true;
				},
				addEventListener(type, cb) {
					this._listeners = this._listeners || {};
					this._listeners[type] = cb;
				},
				click() {
					this._listeners?.click?.({ stopPropagation() {} });
				},
				focus() {},
			};
			if (tag === "input") {
				el.value = "";
			}
			return el;
		},
	};
}

export function createMockApp(eventsSent = []) {
	const mockApp = {
		menuToggled: false,
		emailChecked: false,
		updated: false,
		toggleMenu() {
			mockApp.menuToggled = true;
		},
		networkActions: {
			checkEmail: async () => {
				mockApp.emailChecked = true;
			},
		},
		ghostController: {
			username: "Alice",
			currentGhost: { name: "NanaiBot" },
			sendShioriEvent: async (ev, args) => {
				eventsSent.push({ ev, args });
			},
			sendTeachInput: (val) => {
				eventsSent.push({ ev: "TeachInput", val });
			},
			clearTeachHistory: () => {},
		},
		surfaceManager: {
			bindDressup: async () => {},
			pauseAnimationById: () => {},
			resumeAnimationById: () => {},
			setScale: (sx, sy, scope) => {
				eventsSent.push({ ev: "setScale", sx, sy, scope });
			},
			setAlpha: (alpha, scope) => {
				eventsSent.push({ ev: "setAlpha", alpha, scope });
			},
			setPosition: (x, y, scope) => {
				eventsSent.push({ ev: "setPosition", x, y, scope });
			},
		},
		dispatchAction: async (action) => {
			eventsSent.push({ ev: "dispatchAction", action });
		},
		startNetworkUpdate: async () => {
			mockApp.updated = true;
		},
		modalDialogController: {
			openPasswordInput: (params, scope) => {
				eventsSent.push({ ev: "openPasswordInput", params, scope });
			},
			openTextAreaBox: (params, scope) => {
				eventsSent.push({ ev: "openTextAreaBox", params, scope });
			},
			openSliderInput: (params, scope) => {
				eventsSent.push({ ev: "openSliderInput", params, scope });
			},
			closeInputBox: (id) => {
				eventsSent.push({ ev: "closeInputBox", id });
			},
			closeTextAreaBox: (id) => {
				eventsSent.push({ ev: "closeTextAreaBox", id });
			},
			closeDialog: (id) => {
				eventsSent.push({ ev: "closeDialog", id });
			},
		},
		elements: {
			balloonText: {
				appendChild(el) {
					mockApp.elements.balloonText.child = el;
				},
			},
			keroBalloonText: { appendChild() {} },
		},
	};
	return mockApp;
}
