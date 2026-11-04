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
import { AppConfig, loadAppConfig } from "./ts/core/config.js";
import { invoke, isTauriAvailable } from "./ts/core/tauri-helper.js";
import { GhostController } from "./ts/ghost/ghost.js";
import { SakuraScriptPlayer } from "./ts/ghost/sakura-script.js";
import { InteractionManager } from "./ts/surface/interaction.js";
import { SurfaceManager } from "./ts/surface/surface.js";
import { menuMethods } from "./ts/ui/app-menu.js";
import { ModalManager } from "./ts/ui/modal.js";

export interface AppSettings {
	autoLoadGhost: boolean;
	enableNotifications: boolean;
	darkMode: boolean;
	alwaysOnTop: boolean;
	ghostSize: string;
	debugLevel: string;
	autoSwitchBalloonWithGhost: boolean;
}

export class NanaiAndroidMascotApp {
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
	availableBalloons?: any[];
	availablePlugins?: any[];
	balloonUserScale?: number;
	balloonDpiScale?: number;
	balloonDontMove?: boolean;
	balloonSyncScale?: boolean;
	balloonAlignment?: string;
	_isExiting?: boolean;

	constructor() {
		this.isInitialized = false;
		this.currentBalloonTheme = "ivory";
		this.settings = {
			autoLoadGhost: true,
			enableNotifications: true,
			darkMode: false,
			alwaysOnTop: true,
			ghostSize: "medium",
			debugLevel: "info",
			autoSwitchBalloonWithGhost: true,
		};

		const urlParams = new URLSearchParams(globalThis.location.search);
		this.ghostId = urlParams.get("ghost_id") || "main";
		this.initialGhostName = urlParams.get("ghost_name") || null;

		this.ghostController = new GhostController(this);
		this.dictationManager = new DictationManager(this);
		this.interactionManager = new InteractionManager(this);
		this.surfaceManager = new SurfaceManager(this);
		this.sakuraPlayer = new SakuraScriptPlayer(this);
		this.modalManager = null;

		this.elements = {};
		this.init();
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
		console.log("=== Nanai Android Mascot 初期化開始 ===");

		await loadAppConfig();
		this.initUIEnvironment();

		this.modalManager = new ModalManager(this);
		(this as any).loadSettings();
		(this as any).setupEventListeners();
		(this as any).applySettings();

		await Promise.all([this.scanBalloons(), this.scanPlugins()]);

		if (this.settings.autoLoadGhost) {
			await this.ghostController.autoLoadGhost();
		} else {
			this.ghostController.selectGhost(AppConfig.paths.fallbackGhostName);
		}

		(this as any).startSecondTimer();
		this.isInitialized = true;
		console.log("✅ Nanai Android Mascot 初期化完了");
	}

	async scanBalloons() {
		return (this as any).scanBalloons?.() || [];
	}

	async scanPlugins() {
		if (!isTauriAvailable()) return;
		try {
			const plugins: any = await invoke("scan_plugins");
			if (plugins && plugins.length > 0) {
				this.availablePlugins = plugins;
				console.log("🔌 プラグインスキャン完了:", plugins.length);
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
			(this.ghostController as any)?.stopSecondChangeTimer?.();
			if (isTauriAvailable()) {
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
			globalThis.window.close();
		};

		try {
			(this as any).hideMenu();
			this.modalManager?.hide();
			try {
				await (this.ghostController as any).sendShioriEvent("OnClose");
			} catch (_e) {}
			const exitDelay = this.sakuraPlayer?.isPlaying ? 1500 : 400;
			setTimeout(exit, exitDelay);
		} catch (_err) {
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

globalThis.addEventListener("DOMContentLoaded", () => {
	(globalThis as any).mascotApp = new NanaiAndroidMascotApp();
});
