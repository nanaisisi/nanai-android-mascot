import { menuMethods } from "../../ui/app-menu.js";
import { ModalManager } from "../../ui/modal.js";
import { DictationManager } from "../actions/dictation.js";
import { actionMethods } from "../app-actions.js";
import { eventMethods } from "../app-events.js";
import { settingsMethods } from "../app-settings.js";
import { updateMethods } from "../app-update.js";
import { AppConfig, loadAppConfig } from "../config.js";
import { InternalWindowManager } from "../internal-window-manager.js";
import { invoke, isTauriAvailable } from "../tauri-helper.js";
import { wasmBridge } from "../wasm-bridge.js";
import { initUIEnvironment, scanBalloons, scanPlugins } from "./environment.js";
import type { AppSettings } from "./types.js";

class WasmGhostController {
	constructor(public app: any) {}
	async autoLoadGhost() {}
	async selectGhost() {}
	stopSecondChangeTimer() {}
	sendShioriEvent() {}
}

class WasmSurfaceManager {
	constructor(public app: any) {}
	detectCollision() {
		return { name: "", canvasX: 0, canvasY: 0 };
	}
}

class WasmInteractionManager {
	constructor(public app: any) {}
	setupDragging() {}
}

class WasmSakuraPlayer {
	constructor(public app: any) {}
}

export class NanaiAndroidMascotApp {
	declare loadSettings: () => void;
	declare setupEventListeners: () => Promise<void>;
	declare applySettings: () => void;
	declare startSecondTimer: () => void;
	declare stopSecondTimer: () => void;
	declare hideMenu: () => void;
	declare showBalloon: (message: string, scopeId?: number) => void;
	declare hideBalloon: (scopeId?: number, type?: string) => void;
	declare toggleMenu: (
		screenX?: number | null,
		screenY?: number | null,
		scope?: number,
	) => void;
	declare toggleHtmlMenu: (scope?: number) => void;
	declare hideQuickActionsPanel: () => void;
	declare toggleQuickActionsPanel: () => void;
	declare setBalloonTheme: (theme: string) => Promise<void>;
	declare recordRecentGhost: (ghostName: string) => void;
	declare scanBalloons: () => Promise<unknown[]>;
	declare onGhostClick: (
		x?: number,
		y?: number,
		rect?: unknown,
		scopeId?: number,
	) => unknown;
	declare onGhostStroke: (
		x?: number,
		y?: number,
		rect?: unknown,
		scopeId?: number,
	) => unknown;
	declare onGhostMouseDown: (
		x?: number,
		y?: number,
		rect?: unknown,
		button?: number,
		device?: string,
		scopeId?: number,
	) => unknown;
	declare onGhostMouseUp: (
		x?: number,
		y?: number,
		rect?: unknown,
		button?: number,
		device?: string,
		scopeId?: number,
	) => unknown;
	declare onGhostWheel: (
		x?: number,
		y?: number,
		rect?: unknown,
		delta?: number,
		scopeId?: number,
	) => unknown;
	declare onGhostDragStart: (
		x?: number,
		y?: number,
		rect?: unknown,
		scopeId?: number,
	) => unknown;
	declare onGhostDragEnd: (
		x?: number,
		y?: number,
		rect?: unknown,
		scopeId?: number,
	) => unknown;
	declare onGhostHover: (
		x?: number,
		y?: number,
		rect?: unknown,
		scopeId?: number,
	) => unknown;
	declare handleMenuAction: (action: string, payload?: unknown) => unknown;
	declare syncMenuGhosts: (reqScope?: unknown) => void;
	declare switchToNextGhost: () => void;
	declare startNetworkUpdate: (
		targetGhostName?: string | null,
		options?: { checkOnly?: boolean },
	) => Promise<unknown>;

	isInitialized: boolean;
	currentBalloonTheme: string;
	settings: AppSettings;
	ghostId: string;
	initialGhostName: string | null;
	ghostController: GhostController;
	dictationManager: DictationManager;
	interactionManager: InteractionManager;
	surfaceManager: SurfaceManager;
	sakuraPlayer: SakuraScriptPlayer;
	modalManager: ModalManager | null;
	elements: Record<string, HTMLElement | null>;
	availableBalloons?: unknown[];
	availablePlugins?: unknown[];
	balloonUserScale?: number;
	balloonDpiScale?: number;
	balloonDontMove?: boolean;
	balloonSyncScale?: boolean;
	balloonAlignment?: string;
	internalWindowManager: InternalWindowManager;
	_isExiting?: boolean;
	_isBooted?: boolean;

	constructor() {
		this.isInitialized = false;
		this.currentBalloonTheme = "default";
		this.settings = {
			autoLoadGhost: true,
			enableNotifications: true,
			darkMode: false,
			alwaysOnTop: true,
			ghostSize: "medium",
			debugLevel: "info",
			autoSwitchBalloonWithGhost: true,
		};

		const search = globalThis.location?.search || "";
		const urlParams = new URLSearchParams(search);
		this.ghostId = urlParams.get("ghost_id") || "main";
		this.initialGhostName =
			urlParams.get("ghost_name") ||
			(search ? AppConfig.paths.fallbackGhostName : null);

		this.ghostController = new WasmGhostController(this) as any;
		this.dictationManager = new DictationManager(this);
		this.interactionManager = new WasmInteractionManager(this) as any;
		this.surfaceManager = new WasmSurfaceManager(this) as any;
		this.sakuraPlayer = new WasmSakuraPlayer(this) as any;
		this.internalWindowManager = new InternalWindowManager();
		this.modalManager = null;
		this.elements = {};

		if (typeof document !== "undefined") {
			if (document.readyState === "loading") {
				document.addEventListener("DOMContentLoaded", () => {
					void this.boot();
				});
			} else {
				void this.boot();
			}
		}
	}

	async callGhost(ghostName: string) {
		if (isTauriAvailable()) {
			try {
				await invoke("spawn_ghost", { ghostName });
			} catch (e) {
				console.error("Failed to spawn ghost:", e);
			}
		}
	}

	async init() {
		return this.boot();
	}

	async boot() {
		if (this._isBooted) return;
		this._isBooted = true;
		this.isInitialized = true;

		console.log("=== Nanai Android Mascot 初期化開始 ===");

		void wasmBridge.init("wasm/nanai_core.wasm");

		try {
			await loadAppConfig();
		} catch (_e) {}

		initUIEnvironment(this);

		this.modalManager = new ModalManager(this);
		try {
			this.loadSettings?.();
		} catch (_e) {}

		if (typeof this.setupEventListeners === "function") {
			try {
				await this.setupEventListeners();
			} catch (e) {
				console.error("Failed to setup event listeners:", e);
			}
		}

		try {
			this.applySettings?.();
		} catch (_e) {}

		try {
			await Promise.all([this.scanBalloons?.(), this.scanPlugins?.()]);
		} catch (_e) {}

		if (this.settings?.autoLoadGhost && this.ghostController) {
			try {
				await this.ghostController.autoLoadGhost?.();
			} catch (e) {
				console.error("Failed autoLoadGhost, fallback:", e);
				await this.ghostController.selectGhost?.(
					AppConfig.paths.fallbackGhostName,
				);
			}
		} else if (this.ghostController) {
			await this.ghostController.selectGhost?.(
				AppConfig.paths.fallbackGhostName,
			);
		}

		try {
			this.startSecondTimer?.();
		} catch (_e) {}

		console.log("✅ Nanai Android Mascot 初期化完了");
	}

	async scanBalloons() {
		return scanBalloons(this);
	}

	async scanPlugins() {
		return scanPlugins(this);
	}

	initUIEnvironment() {
		initUIEnvironment(this);
	}

	async closeApp() {
		if (this._isExiting) return;
		this._isExiting = true;

		const exit = async () => {
			this.ghostController?.stopSecondChangeTimer?.();
			if (isTauriAvailable()) {
				try {
					await invoke("hide_menu_window");
				} catch (_e) {}
				try {
					await invoke("unload_current_ghost");
				} catch (_e) {}
				try {
					await invoke("close_ghost", { ghostId: this.ghostId });
					return;
				} catch (_e) {
					try {
						await invoke("exit_app");
						return;
					} catch (_err) {}
				}
			}
			globalThis.window?.close();
		};

		const forceExitTimer = setTimeout(exit, 2000);

		try {
			this.hideMenu?.();
			this.modalManager?.hide?.();
			try {
				await Promise.race([
					this.ghostController?.sendShioriEvent?.("OnClose"),
					new Promise((resolve) => setTimeout(resolve, 1000)),
				]);
			} catch (_e) {}
			clearTimeout(forceExitTimer);
			const exitDelay = this.sakuraPlayer?.isPlaying ? 1000 : 200;
			setTimeout(exit, exitDelay);
		} catch (_err) {
			clearTimeout(forceExitTimer);
			exit();
		}
	}
}

Object.assign(
	NanaiAndroidMascotApp.prototype,
	menuMethods,
	actionMethods,
	eventMethods,
	settingsMethods,
	updateMethods,
);
