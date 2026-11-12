/**
 * @file helpers.ts
 * @brief NanaiAndroidMascotApp main test helper and environment mock setup
 */

export function setupMainDomGlobals() {
	(globalThis as Record<string, unknown>).window = globalThis;
	(globalThis as Record<string, unknown>).close = function (this: {
		closed?: boolean;
	}) {
		this.closed = true;
	};
	(globalThis as Record<string, unknown>).location = {
		search: "?ghost_id=main&ghost_name=mock_nanai",
	};
	(globalThis as Record<string, unknown>).localStorage = {
		getItem: () => null,
		setItem: () => {},
	};
	(globalThis as Record<string, unknown>).document = {
		body: { classList: { toggle() {} } },
		documentElement: {
			setAttribute() {},
			style: { removeProperty() {}, setProperty() {} },
		},
		addEventListener(type: string, cb: unknown) {
			const self = this as Record<string, unknown>;
			if (!self._listeners) {
				self._listeners = {};
			}
			(self._listeners as Record<string, unknown>)[type] = cb;
		},
		getElementById(_id: string) {
			return {
				style: {},
				classList: { remove() {}, add() {} },
				addEventListener() {},
				setAttribute() {},
			};
		},
		querySelector() {
			return {
				style: { removeProperty() {}, setProperty() {} },
				classList: { remove() {}, add() {} },
				setAttribute() {},
			};
		},
		readyState: "complete",
	};
	(globalThis as Record<string, unknown>).addEventListener = (
		type: string,
		cb: unknown,
	) => {
		const g = globalThis as Record<string, unknown>;
		if (!g._globalListeners) {
			g._globalListeners = {};
		}
		(g._globalListeners as Record<string, unknown>)[type] = cb;
	};
}

export const createTauriInternals = (
	invokeFn?: (cmd: string, args?: unknown) => Promise<unknown>,
) => ({
	metadata: { currentWindow: { label: "main" } },
	invoke: invokeFn || (async () => {}),
	transformCallback: (cb: unknown) => cb,
	plugins: {
		event: {
			listen: async () => () => {},
			emit: async () => {},
		},
	},
});

export function clearTauriGlobals() {
	delete (globalThis as Record<string, unknown>).__TAURI__;
	delete (globalThis as Record<string, unknown>).__TAURI_INTERNALS__;
	const win = (globalThis as unknown as { window?: Record<string, unknown> })
		.window;
	if (win) {
		delete win.__TAURI__;
		delete win.__TAURI_INTERNALS__;
	}
}

setupMainDomGlobals();

const { NanaiAndroidMascotApp } = await import("../../ui/main.js");

export { NanaiAndroidMascotApp };
