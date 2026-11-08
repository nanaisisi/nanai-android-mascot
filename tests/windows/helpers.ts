/**
 * @file tests/windows/helpers.ts
 * @brief Multi-window / Desktop features テスト用モックDOMおよびTauri環境ヘルパー
 */

export interface MockElement {
	textContent: string;
	checked: boolean;
	value: string;
	classList: {
		classes: Set<string>;
		add(c: string): void;
		remove(c: string): void;
		contains(c: string): boolean;
	};
}

export interface WindowsMockEnvironment {
	promptReturn: string;
	lastAlertMessage: string;
	confirmReturn: boolean;
	windowsList: string[];
	invokedCmds: Array<{ cmd: string; args?: unknown }>;
	windowCmdShouldFail: boolean;
	shioriStatusReturn: boolean;
	shioriShouldFail: boolean;
	returnNullElements: boolean;
	elements: Record<string, MockElement>;
	domLoadedListeners: Array<() => void>;
	getEl: (id: string) => MockElement | null;
	resetElements: () => void;
	setupEnvironment: () => void;
}

export function createWindowsMockEnvironment(): WindowsMockEnvironment {
	const env: WindowsMockEnvironment = {
		promptReturn: "90",
		lastAlertMessage: "",
		confirmReturn: true,
		windowsList: [],
		invokedCmds: [],
		windowCmdShouldFail: false,
		shioriStatusReturn: false,
		shioriShouldFail: false,
		returnNullElements: false,
		elements: {},
		domLoadedListeners: [],
		getEl(id: string) {
			if (env.returnNullElements) return null;
			if (!env.elements[id]) {
				env.elements[id] = {
					textContent: "",
					checked: true,
					value: "100",
					classList: {
						classes: new Set<string>(),
						add(c: string) {
							this.classes.add(c);
						},
						remove(c: string) {
							this.classes.delete(c);
						},
						contains(c: string) {
							return this.classes.has(c);
						},
					},
				};
			}
			return env.elements[id];
		},
		resetElements() {
			for (const key of Object.keys(env.elements)) {
				delete env.elements[key];
			}
		},
		setupEnvironment() {
			globalThis.window = globalThis as unknown as Window & typeof globalThis;
			globalThis.prompt = (_msg?: string, def?: string) =>
				env.promptReturn !== undefined ? env.promptReturn : (def ?? "");
			globalThis.alert = (msg?: unknown) => {
				env.lastAlertMessage = String(msg || "");
			};
			globalThis.confirm = () => env.confirmReturn;

			const defaultTauriInternals = {
				metadata: {
					currentWindow: {
						label: "main",
					},
				},
				invoke: async (cmd: string, args?: unknown) => {
					env.invokedCmds.push({ cmd, args });
					if (cmd === "plugin:window|get_all_windows") return env.windowsList;
					if (
						cmd.startsWith("plugin:window|") &&
						cmd !== "plugin:window|get_all_windows"
					) {
						if (env.windowCmdShouldFail) throw new Error(`${cmd} failed`);
						return null;
					}
					if (cmd === "get_shiori_status") {
						if (env.shioriShouldFail) throw new Error("SHIORI fail");
						return env.shioriStatusReturn;
					}
					return null;
				},
				transformCallback: (cb: unknown) => cb,
			};

			(
				globalThis as unknown as {
					__TAURI_INTERNALS__: typeof defaultTauriInternals;
				}
			).__TAURI_INTERNALS__ = defaultTauriInternals;

			globalThis.document = {
				getElementById(id: string) {
					return env.getEl(id) as unknown as HTMLElement;
				},
				querySelector(sel: string) {
					return env.getEl(
						sel.replace(".", "").replace("#", ""),
					) as unknown as Element;
				},
				addEventListener(type: string, cb: () => void) {
					if (type === "DOMContentLoaded") {
						env.domLoadedListeners.push(cb);
					}
				},
			} as unknown as Document;
		},
	};

	env.setupEnvironment();
	return env;
}
