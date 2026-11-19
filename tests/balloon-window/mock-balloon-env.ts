/**
 * @file mock-balloon-env.ts
 * @brief BalloonWindow モジュールテスト用の DOM / Tauri 環境モック
 */

export interface MockEmittedEvent {
	event?: unknown;
	payload?: {
		userScale?: number;
		choiceId?: string;
		anchorId?: string;
		[key: string]: unknown;
	};
	[key: string]: unknown;
}

export interface MockBalloonStyle {
	transform?: string;
	transformOrigin?: string;
	padding?: string;
	backgroundImage?: string;
	display?: string;
	maxWidth?: string;
	width?: string;
	boxSizing?: string;
	setProperty?: (name: string, val: string) => void;
	[key: string]: unknown;
}

export interface MockInteractiveChild {
	getAttribute: (a: string) => string | null;
	textContent?: string;
	_cb?: (e?: unknown) => void;
	addEventListener: (_t: unknown, cb: (e?: unknown) => void) => void;
	click: () => void;
}

export interface MockBalloonElement {
	style: MockBalloonStyle;
	innerHTML: string;
	textContent: string;
	_listeners?: Record<string, (e?: unknown) => void>;
	querySelectorAll: (sel: string) => MockInteractiveChild[];
	addEventListener: (t: string, cb: (e?: unknown) => void) => void;
	click: () => void;
	mousedown: () => void;
	mouseup: () => void;
}

const emittedEvents: MockEmittedEvent[] = [];
const listenHandlers: Record<string, (arg: unknown) => Promise<void> | void> =
	{};
const elements: Record<string, MockBalloonElement> = {};

const createMockStyle = (): MockBalloonStyle => {
	const storage: Record<string, string> = {};
	return new Proxy(storage, {
		get(target, prop: string) {
			if (prop === "setProperty") {
				return (name: string, val: string) => {
					target[name] = val;
				};
			}
			return target[prop] ?? "";
		},
		set(target, prop: string, value: string) {
			target[prop] = value;
			return true;
		},
	}) as unknown as MockBalloonStyle;
};

const getEl = (id: string): MockBalloonElement => {
	const cleanId = id.replace(/^[.#]/, "");
	if (!elements[cleanId]) {
		elements[cleanId] = {
			style: createMockStyle(),
			innerHTML: "",
			textContent: "",
			querySelectorAll: (sel: string) => {
				if (sel === ".balloon-choice-btn") {
					return [
						{
							getAttribute: (a: string) =>
								a === "data-choice-id" ? "choice_id_1" : null,
							textContent: "Choice1",
							addEventListener(_t: unknown, cb: (e?: unknown) => void) {
								this._cb = cb;
							},
							click() {
								this._cb?.({ stopPropagation() {} });
							},
						},
					];
				}
				if (sel === ".balloon-anchor") {
					return [
						{
							getAttribute: (a: string) =>
								a === "data-anchor-id" ? "anchor_id_1" : null,
							textContent: "Anchor1",
							addEventListener(_t: unknown, cb: (e?: unknown) => void) {
								this._cb = cb;
							},
							click() {
								this._cb?.({ stopPropagation() {} });
							},
						},
					];
				}
				return [];
			},
			addEventListener(t: string, cb: (e?: unknown) => void) {
				this._listeners = this._listeners || {};
				this._listeners[t] = cb;
			},
			click() {
				this._listeners?.click?.({});
			},
			mousedown() {
				this._listeners?.mousedown?.({ button: 0 });
			},
			mouseup() {
				this._listeners?.mouseup?.();
			},
		};
	}
	return elements[cleanId];
};

const docListeners: Record<string, (e?: unknown) => void> = {};

globalThis.window = globalThis as unknown as Window & typeof globalThis;
globalThis.location = { search: "?scope=0&theme=ivory" } as unknown as Location;
globalThis.localStorage = {
	getItem: () => "ivory",
	setItem: () => {},
} as unknown as Storage;
globalThis.Image = class {
	width = 100;
	height = 100;
	naturalWidth = 100;
	naturalHeight = 100;
	onload?: () => void;
	decode() {
		return Promise.resolve();
	}
	_src = "";
	set src(v: string) {
		this._src = v;
		setTimeout(() => {
			this.onload?.();
		}, 0);
	}
	get src() {
		return this._src;
	}
} as unknown as typeof Image;

let callbackIdCounter = 1;
const tauriObject: Record<string, unknown> = {};
const tauriInternals = {
	metadata: {
		currentWindow: { label: "balloon_window_0", startDragging: async () => {} },
	},
	invoke: async (cmd: unknown, args: unknown) => {
		const cmdStr = String(typeof cmd === "object" ? JSON.stringify(cmd) : cmd);
		const argsStr = String(
			typeof args === "object" ? JSON.stringify(args) : args,
		);

		if (
			cmdStr.includes("load_balloon_image") ||
			argsStr.includes("load_balloon_image")
		) {
			return "data:image/png;base64,bg";
		}
		if (cmdStr.includes("save_balloon_offset_from_position")) return;
		if (
			cmdStr.includes("emit") ||
			cmdStr.includes("event") ||
			argsStr.includes("emit") ||
			argsStr.includes("selected")
		) {
			const payloadObj =
				args && typeof args === "object"
					? (args as MockEmittedEvent)
					: undefined;
			if (payloadObj?.event) {
				emittedEvents.push({
					event: payloadObj.event,
					payload: payloadObj.payload,
				});
			} else if (payloadObj) {
				emittedEvents.push(payloadObj);
			} else {
				emittedEvents.push({ payload: { raw: args } });
			}
			return;
		}

		return {
			dpi: "120",
			"font.name": "Meiryo",
			"font.height": "12",
			"font.color.r": "100",
			"font.color.g": "150",
			"font.color.b": "200",
			"cursor.font.color.r": "50",
			"cursor.font.color.g": "50",
			"cursor.font.color.b": "50",
			"validrect.left": "10",
			"validrect.top": "10",
			"validrect.right": "10",
			"validrect.bottom": "10",
			"wordwrappoint.x": "-50",
			"balloon.dontmove": "1",
			"arrow.filename": "arrow",
			mousecursor: "cursor.png",
		};
	},
	transformCallback: (cb: unknown) => {
		if (typeof cb === "function") return callbackIdCounter++;
		return cb;
	},
	plugins: {
		event: {
			listen: async (event: string, cb: (payload: unknown) => void) => {
				listenHandlers[event] = cb;
				return () => {};
			},
			emit: async (event: unknown, payload: unknown) => {
				emittedEvents.push({
					event,
					payload: payload as MockEmittedEvent["payload"],
				});
			},
		},
	},
};

const winWithTauri = globalThis.window as unknown as {
	__TAURI__?: unknown;
	__TAURI_INTERNALS__?: unknown;
};

globalThis.__TAURI__ = tauriObject as unknown as TauriApi;
globalThis.__TAURI_INTERNALS__ = tauriInternals;
winWithTauri.__TAURI__ = tauriObject;
winWithTauri.__TAURI_INTERNALS__ = tauriInternals;

const docAttrs: Record<string, string> = {};
globalThis.document = {
	body: { className: "" },
	documentElement: {
		style: createMockStyle(),
		setAttribute(k: string, v: string) {
			docAttrs[k] = v;
		},
		getAttribute(k: string) {
			return docAttrs[k] ?? null;
		},
	},
	addEventListener(event: string, cb: (e?: unknown) => void) {
		docListeners[event] = cb;
	},
	getElementById: getEl,
	querySelector: (sel: string) => getEl(sel),
	querySelectorAll: (sel: string) => [getEl(sel)],
	createElement(tag: string) {
		if (tag === "canvas") {
			return {
				width: 100,
				height: 100,
				toDataURL: () => "data:image/png;base64,mock",
				getContext() {
					return {
						drawImage() {},
						clearRect() {},
						putImageData() {},
						getImageData: () => ({
							width: 2,
							height: 1,
							data: new Uint8Array([0, 255, 0, 255, 255, 255, 255, 255]),
						}),
					};
				},
			};
		}
		return { style: createMockStyle() };
	},
} as unknown as Document;

export function setupBalloonMockEnvironment() {
	emittedEvents.length = 0;
	for (const key of Object.keys(listenHandlers)) {
		delete listenHandlers[key];
	}
	for (const key of Object.keys(elements)) {
		delete elements[key];
	}
	for (const key of Object.keys(docListeners)) {
		delete docListeners[key];
	}

	globalThis.__TAURI__ = tauriObject as unknown as TauriApi;
	globalThis.__TAURI_INTERNALS__ = tauriInternals;
	winWithTauri.__TAURI__ = tauriObject;
	winWithTauri.__TAURI_INTERNALS__ = tauriInternals;

	return {
		emittedEvents,
		listenHandlers,
		elements,
		getEl,
		docListeners,
	};
}
