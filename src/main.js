import { actionMethods } from "./js/app-actions.js";
import { eventMethods } from "./js/app-events.js";
import { menuMethods } from "./js/app-menu.js";
import { settingsMethods } from "./js/app-settings.js";
import { AppConfig, loadAppConfig } from "./js/config.js";
import { GhostController } from "./js/ghost.js";
import { InteractionManager } from "./js/interaction.js";
import { ModalManager } from "./js/modal.js";
import { SakuraScriptPlayer } from "./js/sakura-script.js";
import { SurfaceManager } from "./js/surface.js";
import { invoke, isTauriAvailable } from "./js/tauri-helper.js";

export class NanaiAndroidMascotApp {
	constructor() {
		this.isInitialized = false;
		this.currentBalloonTheme = "classic";
		this.settings = {
			autoLoadGhost: true,
			enableNotifications: true,
			darkMode: false,
			alwaysOnTop: true,
			ghostSize: "medium",
			debugLevel: "info",
		};

		this.ghostController = new GhostController(this);
		this.interactionManager = new InteractionManager(this);
		this.surfaceManager = new SurfaceManager(this);
		this.sakuraPlayer = new SakuraScriptPlayer(this);
		this.modalManager = null;

		this.elements = {};
		this.init();
	}

	async init() {
		console.log("=== Nanai Android Mascot 初期化開始 ===");

		await loadAppConfig();
		this.initUIEnvironment();

		this.modalManager = new ModalManager(this);
		this.loadSettings();
		this.setupEventListeners();
		this.applySettings();

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

	initUIEnvironment() {
		const ids = {
			ghostDisplay: "ghost-display",
			ghostCharacter: "ghost-character",
			keroDisplay: "kero-display",
			keroCharacter: "kero-character",
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
		const exit = async () => {
			if (isTauriAvailable()) {
				try {
					await invoke("exit_app");
					return;
				} catch (_e) {
					// fallthrough
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
);

// アプリケーション起動
globalThis.addEventListener("DOMContentLoaded", () => {
	globalThis.mascotApp = new NanaiAndroidMascotApp();
});
