/**
 * Shared mock and factory helpers for sakura-command-handler tests
 */

import type {
	CommandHandlerApp,
	SakuraScriptPlayer,
} from "../../ui/ts/ghost/sakura-script.js";

export interface MockDomEvent {
	key?: string;
	stopPropagation: () => void;
}

export interface MockDomElement {
	tagName: string;
	style: Record<string, string>;
	className: string;
	children: MockDomElement[];
	removed?: boolean;
	value?: string;
	_listeners?: Record<string, (ev: MockDomEvent) => void>;
	appendChild(child: MockDomElement): void;
	remove(): void;
	addEventListener(type: string, cb: (ev: MockDomEvent) => void): void;
	click(): void;
	focus(): void;
}

export interface MockCommandEvent {
	ev: string;
	args?: unknown[];
	val?: unknown;
	sx?: unknown;
	sy?: unknown;
	scope?: unknown;
	alpha?: unknown;
	x?: unknown;
	y?: unknown;
	action?: unknown;
	params?: unknown;
	id?: unknown;
	ghost?: unknown;
	event?: unknown;
	refs?: string[];
	shell?: unknown;
	name?: unknown;
	theme?: unknown;
	path?: unknown;
	contentId?: unknown;
	type?: string;
	plugin?: string;
	isNotify?: boolean;
}

export interface MockGhostController {
	username: string;
	currentGhost: { name: string; path?: string };
	currentShell?: string;
	shioriDebugMode?: boolean;
	sendShioriEvent: (ev: string, args: unknown[]) => Promise<unknown>;
	sendTeachInput: (val: unknown) => void;
	clearTeachHistory: () => void;
	initializeGhostSHIORI?: (ghost: unknown) => Promise<void>;
	selectShell?: (shell: string) => Promise<void>;
	switchGhost?: (name: string) => Promise<void>;
	sendRaiseOther?: (ghost: string, ev: string, refs: string[]) => Promise<void>;
	sendNotifyOther?: (
		ghost: string,
		ev: string,
		refs: string[],
	) => Promise<void>;
	sendShioriNotify?: (ev: string, refs: string[]) => Promise<void>;
	sendPluginEvent?: (
		plugin: string,
		ev: string,
		refs: string[],
		isNotify: boolean,
	) => Promise<void>;
	loadMakoto?: (moduleName: string) => Promise<void>;
	unloadMakoto?: (moduleName: string) => Promise<void>;
	reloadMakoto?: (moduleName: string) => Promise<void>;
	openAigraph?: () => Promise<void>;
	reloadAigraph?: () => Promise<void>;
	evaluateProperty?: (prop: string) => Promise<string | null>;
}

export interface MockSurfaceManager {
	bindDressup?: () => Promise<void>;
	pauseAnimationById?: () => void;
	resumeAnimationById?: () => void;
	setScale?: (sx: unknown, sy: unknown, scope: unknown) => void;
	setAlpha?: (alpha: unknown, scope: unknown) => void;
	setPosition?: (x: unknown, y: unknown, scope: unknown) => void;
	loadSurfacesTxt?: (path: string) => Promise<void>;
}

export interface MockCommandApp {
	menuToggled: boolean;
	emailChecked: boolean;
	updated: boolean;
	toggleMenu(): void;
	networkActions: {
		checkEmail: () => Promise<void>;
	};
	ghostController: MockGhostController;
	surfaceManager: MockSurfaceManager;
	dispatchAction: (action: string) => Promise<void>;
	startNetworkUpdate: () => Promise<void>;
	modalDialogController: {
		openPasswordInput: (params: unknown, scope: unknown) => void;
		openTextAreaBox: (params: unknown, scope: unknown) => void;
		openSliderInput: (params: unknown, scope: unknown) => void;
		closeInputBox: (id: unknown) => void;
		closeTextAreaBox: (id: unknown) => void;
		closeDialog: (id: unknown) => void;
	};
	elements: {
		balloonText: {
			child?: MockDomElement;
			appendChild(el: MockDomElement): void;
		};
		keroBalloonText: {
			appendChild(el?: MockDomElement): void;
		};
	};
	setBalloonTheme?: (theme: string) => Promise<void>;
	balloonThemeManager?: {
		resetDescript: () => void;
	};
	closeApp?: () => Promise<void>;
	modalManager?: {
		show: (contentId: string) => void;
	};
}

export interface MockSakuraPlayerOverrides {
	currentScope?: number;
	app?: MockCommandApp;
	playScript?: (script: string) => Promise<void>;
	choiceTimeout?: number;
	balloonTimeout?: number;
	[modeFlag: `is_${string}`]: unknown;
}

export function setupMockDom() {
	globalThis.window = globalThis as unknown as Window & typeof globalThis;
	globalThis.document = {
		createElement(tag: string) {
			const el: MockDomElement = {
				tagName: tag.toUpperCase(),
				style: {},
				className: "",
				children: [],
				appendChild(child: MockDomElement) {
					this.children.push(child);
				},
				remove() {
					this.removed = true;
				},
				addEventListener(type: string, cb: (ev: MockDomEvent) => void) {
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
			return el as unknown as HTMLElement;
		},
	} as unknown as Document;
}

export function createMockApp(
	eventsSent: MockCommandEvent[] = [],
): MockCommandApp {
	const mockApp: MockCommandApp = {
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
			sendShioriEvent: async (ev: string, args: unknown[]) => {
				eventsSent.push({ ev, args });
			},
			sendTeachInput: (val: unknown) => {
				eventsSent.push({ ev: "TeachInput", val });
			},
			clearTeachHistory: () => {},
		},
		surfaceManager: {
			bindDressup: async () => {},
			pauseAnimationById: () => {},
			resumeAnimationById: () => {},
			setScale: (sx: unknown, sy: unknown, scope: unknown) => {
				eventsSent.push({ ev: "setScale", sx, sy, scope });
			},
			setAlpha: (alpha: unknown, scope: unknown) => {
				eventsSent.push({ ev: "setAlpha", alpha, scope });
			},
			setPosition: (x: unknown, y: unknown, scope: unknown) => {
				eventsSent.push({ ev: "setPosition", x, y, scope });
			},
		},
		dispatchAction: async (action: string) => {
			eventsSent.push({ ev: "dispatchAction", action });
		},
		startNetworkUpdate: async () => {
			mockApp.updated = true;
		},
		modalDialogController: {
			openPasswordInput: (params: unknown, scope: unknown) => {
				eventsSent.push({ ev: "openPasswordInput", params, scope });
			},
			openTextAreaBox: (params: unknown, scope: unknown) => {
				eventsSent.push({ ev: "openTextAreaBox", params, scope });
			},
			openSliderInput: (params: unknown, scope: unknown) => {
				eventsSent.push({ ev: "openSliderInput", params, scope });
			},
			closeInputBox: (id: unknown) => {
				eventsSent.push({ ev: "closeInputBox", id });
			},
			closeTextAreaBox: (id: unknown) => {
				eventsSent.push({ ev: "closeTextAreaBox", id });
			},
			closeDialog: (id: unknown) => {
				eventsSent.push({ ev: "closeDialog", id });
			},
		},
		elements: {
			balloonText: {
				appendChild(el: MockDomElement) {
					mockApp.elements.balloonText.child = el;
				},
			},
			keroBalloonText: { appendChild() {} },
		},
	};
	return mockApp;
}

export function createMockPlayer(
	mockApp: MockCommandApp,
	overrides: MockSakuraPlayerOverrides = {},
): SakuraScriptPlayer & { app: CommandHandlerApp } {
	return {
		currentScope: 0,
		app: mockApp as unknown as CommandHandlerApp,
		...overrides,
	} as unknown as SakuraScriptPlayer & { app: CommandHandlerApp };
}
