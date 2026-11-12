/**
 * @file main.ts
 * @brief Nanai Android Mascot メインアプリケーションエントリーポイント (UKADOC / SSP仕様準拠)
 *
 * 統合制御クラス `NanaiAndroidMascotApp` を提供し、ゴーストコントローラー、サーフィス管理、
 * さくらスクリプトプレイヤー、インタラクション管理、設定・イベント・更新ハンドラーを統合。
 *
 * 参考仕様:
 * - OnBoot, OnClose, OnWindowStateMinimize, OnWindowStateRestore
 * - AppConfig / loadAppConfig (設定およびプロパティシステム)
 */
import { DictationManager } from "./ts/core/actions/dictation.js";
import { actionMethods } from "./ts/core/app-actions.js";
import { eventMethods } from "./ts/core/app-events.js";
import { settingsMethods } from "./ts/core/app-settings.js";
import { updateMethods } from "./ts/core/app-update.js";
import { wasmBridge } from "./ts/core/wasm-bridge.js";
import { AppConfig, loadAppConfig } from "./ts/core/config.js";
import { InternalWindowManager } from "./ts/core/internal-window-manager.js";
import { invoke, isTauriAvailable } from "./ts/core/tauri-helper.js";
import { GhostController } from "./ts/ghost/ghost.js";
import { SakuraScriptPlayer } from "./ts/ghost/sakura-script.js";
import { InteractionManager } from "./ts/surface/interaction.js";
import { SurfaceManager } from "./ts/surface/surface-manager.js";
import { menuMethods } from "./ts/ui/app-menu.js";
import { ModalManager } from "./ts/ui/modal.js";

export interface AppSettings {
	shellScale?: string;
	balloonScale?: string;
	balloonTheme?: string;
	autoLoadGhost: boolean;
	enableNotifications: boolean;
	darkMode: boolean;
	alwaysOnTop: boolean;
	ghostSize: string;
	debugLevel: string;
	autoSwitchBalloonWithGhost: boolean;
	[key: string]: unknown;
}

export class NanaiAndroidMascotApp {
	// Mixin (Object.assign) でプロトタイプに注入されるメソッド群の型宣言
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

	// インスタンスプロパティ
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

		this.ghostController = new GhostController(this);
		this.dictationManager = new DictationManager(this);
		this.interactionManager = new InteractionManager(this);
		this.surfaceManager = new SurfaceManager(this);
		this.sakuraPlayer = new SakuraScriptPlayer(this);
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

		// WASM コアエンジンの事前ロード & 接続初期化
		void wasmBridge.init("wasm/nanai_core.wasm");

		try {
			await loadAppConfig();
		} catch (_e) {}

		this.initUIEnvironment();

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
		return (
			(
				actionMethods as unknown as Record<string, () => Promise<unknown[]>>
			).scanBalloons?.call(this) || []
		);
	}

	async scanPlugins() {
		if (!isTauriAvailable()) return;
		try {
			const plugins = await invoke<string[]>("scan_plugins");
			if (Array.isArray(plugins) && plugins.length > 0) {
				this.availablePlugins = plugins;
				console.log("✨ プラグインスキャン完了:", plugins.length);
			}
		} catch (e) {
			console.error("プラグインスキャン失敗:", e);
		}
	}

	initUIEnvironment() {
		if (isTauriAvailable()) {
			const menuBtn = document.getElementById("menu-btn");
			if (menuBtn) menuBtn.style.display = "none";
		}
		const ids: Record<string, string> = {
			ghostDisplay: "ghost-display",
			ghostCharacter: "ghost-character",
			keroDisplay: "kero-display",
			keroCharacter: "kero-character",
			sakuraSlot: "sakura-slot",
			keroSlot: "kero-slot",
			balloonDisplay: "balloon-display",
			balloonText: "balloon-text",
			keroBalloonDisplay: "kero-balloon-display",
			keroBalloonText: "kero-balloon-text",
			menuContainer: "menu-iframe-container",
			menuBtn: "menu-btn",
			quickBubble: "quick-bubble",
			quickActionsPanel: "quick-actions-panel",
		};
		this.elements = Object.fromEntries(
			Object.entries(ids).map(([key, id]) => [
				key,
				document.getElementById(id),
			]),
		);
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

// Mixins - クラス定義直後にプロトタイプ拡張を確定アタッチ
Object.assign(
	NanaiAndroidMascotApp.prototype,
	menuMethods,
	actionMethods,
	eventMethods,
	settingsMethods,
	updateMethods,
);

declare global {
	var mascotApp: NanaiAndroidMascotApp | undefined;
}

if (typeof window !== "undefined") {
	(window as unknown as { app: NanaiAndroidMascotApp }).app =
		new NanaiAndroidMascotApp();
	(globalThis as unknown as { mascotApp: NanaiAndroidMascotApp }).mascotApp =
		(window as unknown as { app: NanaiAndroidMascotApp }).app;
}
