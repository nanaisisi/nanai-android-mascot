import { actionMethods } from "./js/core/app-actions.js";
import { eventMethods } from "./js/core/app-events.js";
import { settingsMethods } from "./js/core/app-settings.js";
import { updateMethods } from "./js/core/app-update.js";
import { DictationManager } from "./js/core/actions/dictation.js";
import { AppConfig, loadAppConfig } from "./js/core/config.js";
import { invoke, isTauriAvailable } from "./js/core/tauri-helper.js";
import { GhostController } from "./js/ghost/ghost.js";
import { SakuraScriptPlayer } from "./js/ghost/sakura-script.js";
import { InteractionManager } from "./js/surface/interaction.js";
import { SurfaceManager } from "./js/surface/surface.js";
import { menuMethods } from "./js/ui/app-menu.js";
import { ModalManager } from "./js/ui/modal.js";

/**
 * @typedef {Object} AppSettings
 * @property {boolean} autoLoadGhost
 * @property {boolean} enableNotifications
 * @property {boolean} darkMode
 * @property {boolean} alwaysOnTop
 * @property {string} ghostSize
 * @property {string} debugLevel
 * @property {boolean} autoSwitchBalloonWithGhost
 */

export class NanaiAndroidMascotApp {
	constructor() {
		/** @type {boolean} */
		this.isInitialized = false;
		/** @type {string} */
		this.currentBalloonTheme = "ivory";
		/** @type {AppSettings} */
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

		/** @type {GhostController} */
		this.ghostController = new GhostController(this);
		/** @type {DictationManager} */
		this.dictationManager = new DictationManager(this);
		/** @type {InteractionManager} */
		this.interactionManager = new InteractionManager(this);
		/** @type {SurfaceManager} */
		this.surfaceManager = new SurfaceManager(this);
		/** @type {SakuraScriptPlayer} */
		this.sakuraPlayer = new SakuraScriptPlayer(this);
		/** @type {ModalManager|null} */
		this.modalManager = null;

		/** @type {Record<string, HTMLElement|null>} */
		this.elements = {};
		this.init();
	}

	/**
	 * 他のゴーストを別インスタンスとして新規起動 (マルチゴースト)
	 * @param {string} ghostName
	 */
	async callGhost(ghostName) {
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
		this.loadSettings();
		this.setupEventListeners();
		this.applySettings();

		// バルーン情報・プラグイン情報のスキャン
		await Promise.all([this.scanBalloons(), this.scanPlugins()]);

		// ゴースト初期化
		if (this.settings.autoLoadGhost) {
			await this.ghostController.autoLoadGhost();
		} else {
			this.ghostController.selectGhost(AppConfig.paths.fallbackGhostName);
		}

		this.startSecondTimer();
		this.isInitialized = true;
		console.log("✅ Nanai Android Mascot 初期化完了");
	}

	async scanPlugins() {
		if (!isTauriAvailable()) return;
		try {
			const plugins = await invoke("scan_plugins");
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
		const ids = {
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

	/**
	 * アプリケーションを安全に終了
	 */
	async closeApp() {
		if (this._isExiting) return;
		this._isExiting = true;

		const exit = async () => {
			this.ghostController?.stopSecondChangeTimer?.();
			if (isTauriAvailable()) {
				try {
					await invoke("unload_current_ghost");
				} catch (_e) {
					// unload失敗時は継続
				}
				try {
					await invoke("close_ghost", { ghostId: this.ghostId });
					return;
				} catch (_e) {
					try {
						await invoke("exit_app");
						return;
					} catch (_err) {
						// fallthrough
					}
				}
			}
			globalThis.window.close();
		};

		try {
			this.hideMenu();
			this.modalManager?.hide();
			try {
				await this.ghostController.sendShioriEvent("OnClose");
			} catch (_e) {
				// エラー無視
			}
			// さくらスクリプト再生を待機（または少し余韻を設けて終了）
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

// アプリケーション起動
globalThis.addEventListener("DOMContentLoaded", () => {
	globalThis.mascotApp = new NanaiAndroidMascotApp();
});
