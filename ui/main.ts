import { actionMethods } from "./ts/core/app-actions.js";
import { eventMethods } from "./ts/core/app-events.js";
import { settingsMethods } from "./ts/core/app-settings.js";
import { updateMethods } from "./ts/core/app-update.js";
import { AppConfig } from "./ts/core/config.js";
import { invoke, isTauriAvailable } from "./ts/core/tauri-helper.js";
import { GhostController } from "./ts/ghost/ghost.js";
import { type SakuraPlayer } from "./ts/ghost/sakura-play.js";
import { SurfaceManager } from "./ts/surface/surface-manager.js";
import { menuMethods } from "./ts/ui/app-menu.js";
import { ModalManager } from "./ts/ui/modal.js";

/**
 * Nanai Android Mascot - メインアプリケーションエントリーポイント
 */
export class NanaiAndroidMascotApp {
	elements: Record<string, HTMLElement | null> = {};
	ghostController!: GhostController;
	surfaceManager!: SurfaceManager;
	sakuraPlayer!: SakuraPlayer;
	modalManager!: ModalManager;
	currentBalloonTheme = "default";
	initialGhostName: string | null = AppConfig.paths.fallbackGhostName;
	settings: Record<string, unknown> = {
		autoLoadGhost: true,
		darkMode: false,
		shellScale: "100",
		balloonScale: "100",
	};
	ghostId = "main";
	_isExiting = false;
	isInitialized = false;
	availablePlugins: string[] | undefined = [];

	constructor() {
		this.initElements();
		this.ghostController = new GhostController(this);
		this.surfaceManager = new SurfaceManager(this);
		this.modalManager = new ModalManager(this);

		this.sakuraPlayer = {
			app: this as unknown as NanaiAndroidMascotApp,
			playbackId: 0,
			isPlaying: false,
			skipRequested: false,
			timeCritical: false,
			currentScope: 0,
			isSyncMode: false,
			lastScript: "",
			choiceTimeoutTimer: null,
			balloonTimeoutTimer: null,
			scheduleSurfaceRestore() {},
			parse: async (script: string) => {
				const { parseSakuraScript } = await import(
					"./ts/ghost/sakura-script.js"
				);
				return parseSakuraScript(script);
			},
		} as unknown as SakuraPlayer;

		const search = globalThis.location?.search || "";
		const urlParams = new URLSearchParams(search);
		this.ghostId = urlParams.get("ghost_id") || "main";
		this.initialGhostName =
			urlParams.get("ghost_name") || (search ? AppConfig.paths.fallbackGhostName : null);

		(this as unknown as { setupEvents?: () => void }).setupEvents?.();
		(
			this as unknown as { setupExternalMenuListeners?: () => void }
		).setupExternalMenuListeners?.();

		if (document.readyState === "loading") {
			document.addEventListener("DOMContentLoaded", () => {
				void (this as unknown as { boot?: () => void }).boot?.();
			});
		} else {
			void (this as unknown as { boot?: () => void }).boot?.();
		}
	}

	initElements() {
		const ids = {
			menuBtn: "menu-btn",
			menuContainer: "menu-iframe-container",
			menuIframe: "menu-iframe",
			ghostCharacter: "ghost-character",
			keroCharacter: "kero-character",
			ghostDisplay: "ghost-display",
			keroDisplay: "kero-display",
			balloonDisplay: "balloon-display",
			keroBalloonDisplay: "kero-balloon-display",
			balloonText: "balloon-text",
			keroBalloonText: "kero-balloon-text",
			statusBar: "status-bar",
			statusText: "status-text",
			connectionStatus: "connection-status",
			modalOverlay: "modal-overlay",
			modalClose: "modal-close",
			modalContent: "modal-content",
			sakuraSlot: "sakura-slot",
			keroSlot: "kero-slot",
		};

		this.elements = Object.fromEntries(
			Object.entries(ids).map(([key, id]) => [
				key,
				document.getElementById(id),
			]),
		);
	}

	async init() {
		this.isInitialized = true;
		return this.boot();
	}

	async boot() {
		this.isInitialized = true;
		if (isTauriAvailable()) {
			try {
				await invoke("load_settings");
			} catch (_e) {}
		}
	}

	initUIEnvironment() {
		if (isTauriAvailable()) {
			const el = document.getElementById("status-bar");
			if (el) el.style.display = "block";
		}
	}

	async callGhost(name: string) {
		if (!name) return;
		if (isTauriAvailable()) {
			try {
				await invoke("spawn_ghost", { ghostName: name });
			} catch (err) {
				console.error("callGhost failed:", err);
			}
		}
	}

	async scanPlugins() {
		if (isTauriAvailable()) {
			try {
				const plugins = await invoke<string[]>("scan_plugins");
				this.availablePlugins = plugins?.length ? plugins : undefined;
			} catch (err) {
				console.error("scanPlugins failed:", err);
			}
		}
	}

	async closeApp() {
		if (this._isExiting) return;
		this._isExiting = true;

		const exit = async () => {
			this.ghostController?.stopSecondChangeTimer?.();
			if (isTauriAvailable()) {
				try {
					await invoke("unload_current_ghost");
				} catch (_e) {}
				try {
					await invoke("close_ghost", { ghostId: this.ghostId });
				} catch (_e) {}
				try {
					await invoke("exit_app");
					return;
				} catch (_e) {}
				try {
					const { getCurrentWindow } = await import("@tauri-apps/api/window");
					await getCurrentWindow().close();
					return;
				} catch (_e) {}
			}
			globalThis.window.close();
		};

		try {
			(this as unknown as { hideMenu?: () => void }).hideMenu?.();
			this.modalManager?.hide?.();
			try {
				await Promise.race([
					this.ghostController?.sendShioriEvent?.("OnClose"),
					new Promise((resolve) => setTimeout(resolve, 1500)),
				]);
			} catch (_e) {}
			const exitDelay = this.sakuraPlayer?.isPlaying ? 1500 : 400;
			setTimeout(exit, exitDelay);
		} catch (_err) {
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

if (typeof window !== "undefined") {
	(window as unknown as { app: NanaiAndroidMascotApp }).app =
		new NanaiAndroidMascotApp();
}
