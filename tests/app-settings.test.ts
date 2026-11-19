import assert from "node:assert/strict";
import { test } from "vitest";

interface MockDocument {
	body: { classList: { toggle: (token: string, force?: boolean) => boolean } };
	_listeners?: Record<string, () => void>;
	addEventListener: (type: string, cb: () => void) => void;
	visibilityState: DocumentVisibilityState;
}

const mockDocument: MockDocument = {
	body: { classList: { toggle: () => false } },
	addEventListener(type: string, cb: () => void) {
		this._listeners = this._listeners || {};
		this._listeners[type] = cb;
	},
	visibilityState: "visible",
};

globalThis.window = globalThis as unknown as Window & typeof globalThis;
globalThis.document = mockDocument as unknown as Document;
globalThis.localStorage = {
	length: 0,
	clear: () => {},
	key: () => null,
	removeItem: () => {},
	getItem: () =>
		JSON.stringify({
			darkMode: true,
			shellScale: "120",
			balloonScale: "150",
			balloonTheme: "default",
		}),
	setItem: () => {},
} satisfies Storage;

const { settingsMethods } = await import("../ui/ts/core/app-settings.js");

test("settingsMethods coverage for loadSettings, applySettings, showBalloon, hideBalloon, and timers", async () => {
	const mockApp = {
		...settingsMethods,
		settings: {
			darkMode: false,
			shellScale: "100",
			balloonScale: "100",
			balloonTheme: "default",
		},
		elements: {
			ghostDisplay: { style: {} },
			balloonDisplay: { style: {} },
			balloonText: { textContent: "", innerHTML: "hello" },
		},
		currentBalloonTheme: "default",
		setBalloonTheme(theme: string) {
			this.currentBalloonTheme = theme;
		},
		applyBalloonTheme() {
			this.setBalloonTheme(this.settings.balloonTheme);
		},
		sakuraPlayer: {
			play(script: string) {
				return `played:${script}`;
			},
		},
		ghostController: { sendShioriEvent() {} },
	};

	mockApp.loadSettings();
	assert.equal(mockApp.settings.darkMode, true);

	// Test applySettings with Tauri unavailable
	delete globalThis.__TAURI__;
	delete globalThis.__TAURI_INTERNALS__;
	mockApp.applySettings();

	// Test applySettings with Tauri available
	globalThis.__TAURI_INTERNALS__ = {
		metadata: { currentWindow: { label: "main" } },
		invoke: async () => {},
		transformCallback: (cb: unknown) => cb,
		plugins: { event: { emit: async () => {} } },
	};
	mockApp.applySettings();

	// Test showBalloon & hideBalloon (Tauri unavailable)
	delete globalThis.__TAURI_INTERNALS__;
	mockApp.showBalloon("test text", 0);
	assert.equal(mockApp.elements.balloonText.textContent, "test text");
	mockApp.hideBalloon(0);

	// Test showBalloon & hideBalloon (Tauri available)
	const emittedEvents: Array<{ event: string; payload: unknown }> = [];
	globalThis.__TAURI_INTERNALS__ = {
		metadata: { currentWindow: { label: "main" } },
		invoke: async (cmd: string) => {
			if (cmd === "show_balloon_window" || cmd === "hide_balloon_window")
				return;
		},
		transformCallback: (cb: unknown) => cb,
		plugins: {
			event: {
				emit: async (event: string, payload: unknown) => {
					emittedEvents.push({ event, payload });
				},
			},
		},
	};

	mockApp.showBalloon("tauri text", 1);
	await new Promise((r) => setTimeout(r, 20));
	mockApp.hideBalloon(1);

	delete globalThis.__TAURI_INTERNALS__;

	// Test playSakuraScript
	const res = mockApp.playSakuraScript("\\0Hello");
	assert.equal(res, "played:\\0Hello");

	// Test startSecondTimer visibilitychange (visible & hidden branches)
	mockApp.startSecondTimer();
	mockDocument.visibilityState = "visible";
	mockDocument._listeners?.visibilitychange?.();
	mockDocument.visibilityState = "hidden";
	mockDocument._listeners?.visibilitychange?.();
	mockDocument.visibilityState = "visible";

	assert.ok(true);
});

test("settingsMethods edge branches (missing elements, localStorage error/null, theme fallbacks)", async () => {
	const mockApp: typeof settingsMethods & {
		settings: Record<string, unknown>;
		elements: {
			balloonText?: { textContent: string; innerHTML: string };
			balloonDisplay?: { style: Record<string, unknown> };
		};
		currentBalloonTheme: string | null;
		setBalloonTheme: (theme: string) => void;
	} = {
		...settingsMethods,
		settings: {},
		elements: {},
		currentBalloonTheme: null,
		setBalloonTheme(theme: string) {
			this.currentBalloonTheme = theme;
		},
	};

	const origGet = localStorage.getItem;
	localStorage.getItem = () => null;
	mockApp.loadSettings();
	localStorage.getItem = () => "{ invalid json";
	mockApp.loadSettings();
	localStorage.getItem = origGet;

	mockApp.settings = { shellScale: "invalid", balloonScale: "invalid" };
	mockApp.applySettings();

	mockApp.settings = {};
	mockApp.currentBalloonTheme = null;
	mockApp.applyBalloonTheme();
	assert.equal(mockApp.currentBalloonTheme, "default");

	mockApp.elements = {};
	mockApp.showBalloon("no elements");
	mockApp.hideBalloon();

	// Test Tauri success with empty innerHTML and null currentBalloonTheme
	globalThis.__TAURI_INTERNALS__ = {
		invoke: async () => {},
		transformCallback: (cb: unknown) => cb,
		plugins: { event: { emit: async () => {} } },
	};
	mockApp.elements = {
		balloonText: { textContent: "", innerHTML: "" },
		balloonDisplay: { style: {} },
	};
	mockApp.currentBalloonTheme = null;
	mockApp.showBalloon("fallback text");
	await new Promise((r) => setTimeout(r, 20));
	delete globalThis.__TAURI_INTERNALS__;

	// Test Tauri error catch for showBalloon, hideBalloon, set_character_scale, & empty innerHTML / null currentBalloonTheme
	globalThis.__TAURI_INTERNALS__ = {
		invoke: async (cmd: string) => {
			if (cmd === "show_balloon_window") throw new Error("show fail");
			if (cmd === "hide_balloon_window") throw new Error("hide fail");
			if (cmd === "set_character_scale") throw new Error("scale fail");
		},
		transformCallback: (cb: unknown) => cb,
		plugins: { event: { emit: async () => {} } },
	};
	mockApp.elements = {
		balloonText: { textContent: "", innerHTML: "" },
		balloonDisplay: { style: {} },
	};
	mockApp.currentBalloonTheme = null;
	mockApp.showBalloon("fallback text");
	await new Promise((r) => setTimeout(r, 20));
	mockApp.hideBalloon();
	mockApp.applySettings();
	delete globalThis.__TAURI_INTERNALS__;

	assert.ok(true);
});

test("showBalloon hides and clears balloon when message is empty or whitespace-only", async () => {
	const invoked: Array<{ cmd: string; args: unknown }> = [];
	const emitted: Array<{ event: string; payload: unknown }> = [];
	globalThis.__TAURI_INTERNALS__ = {
		metadata: { currentWindow: { label: "main" } },
		invoke: async (cmd: string, args: unknown) => {
			invoked.push({ cmd, args });
		},
		transformCallback: (cb: unknown) => cb,
		plugins: {
			event: {
				emit: async (event: string, payload: unknown) => {
					emitted.push({ event, payload });
				},
			},
		},
	};

	const mockApp = {
		...settingsMethods,
		settings: {},
		currentBalloonTheme: "default",
		elements: {
			balloonText: { textContent: "old", innerHTML: "old" },
			balloonDisplay: { style: { display: "block" } },
		},
	};

	mockApp.showBalloon("   \n\t ", 0);
	await new Promise((r) => setTimeout(r, 10));

	assert.equal(mockApp.elements.balloonText.textContent, "");
	assert.equal(mockApp.elements.balloonText.innerHTML, "");
	assert.deepEqual(
		invoked.filter((e) => e.cmd === "hide_balloon_window"),
		[
			{
				cmd: "hide_balloon_window",
				args: { params: { scope_id: 0 }, scope_id: 0, scopeId: 0 },
			},
		],
	);
	assert.deepEqual(
		invoked
			.filter((e) => e.cmd === "plugin:event|emit")
			.map((e) => e.args)
			.concat(emitted.map((e) => ({ event: e.event, payload: e.payload }))),
		[
			{
				event: "update-balloon-content-0",
				payload: { html: "", theme: "default" },
			},
		],
	);

	delete globalThis.__TAURI_INTERNALS__;
});
