import { invoke, isTauriAvailable } from "../core/tauri-helper.js";
import { ModalGhostHandlers } from "./modal-ghost-handlers.js";
import { ModalSettingsHandlers } from "./modal-settings-handlers.js";
import { modalTemplates } from "./modal-templates.js";

export interface AppModalTarget {
	ghostController?: {
		currentGhost?: { name?: string } | null;
		ghosts?: Array<{ name?: string; craftman?: string }> | null;
		scanGhosts?: () => Promise<unknown>;
		selectGhost?: (name: string) => Promise<unknown>;
		sendShioriEvent?: (event: string, args?: unknown[]) => Promise<unknown>;
	} | null;
	currentBalloonTheme?: string | null;
	availableBalloons?: Array<{ name?: string; dir_name?: string }> | null;
	settings?: {
		autoLoadGhost?: boolean;
		darkMode?: boolean;
		shellScale?: string;
		balloonScale?: string;
		[key: string]: unknown;
	} | null;
	setBalloonTheme?: (theme: string) => void;
	applySettings?: () => void;
	showBalloon?: (text: string) => void;
	hideBalloon?: () => void;
}

/**
 * Nanai Android Mascot - モーダル & UIダイアログ管理
 */
export class ModalManager {
	app: AppModalTarget | null;
	overlay: HTMLElement | null;
	content: HTMLElement | null;
	closeBtn: HTMLElement | null;
	ghostHandlers: ModalGhostHandlers;
	settingsHandlers: ModalSettingsHandlers;

	constructor(app?: AppModalTarget | null) {
		this.app = app ?? null;
		this.overlay = document.getElementById("modal-overlay");
		this.content = document.getElementById("modal-content");
		this.closeBtn = document.getElementById("modal-close");

		this.ghostHandlers = new ModalGhostHandlers(this);
		this.settingsHandlers = new ModalSettingsHandlers(this);

		this.init();
	}

	init() {
		this.closeBtn?.addEventListener("click", () => this.hide());
		this.overlay?.addEventListener("click", (e: MouseEvent) => {
			if (e.target === this.overlay) {
				this.hide();
			}
		});
	}

	showWindowIfNeeded() {
		if (isTauriAvailable()) {
			invoke("show_modal_window").catch((e) =>
				console.warn("show_modal_window failed:", e),
			);
		}
	}

	show(contentId: string) {
		let html: string | undefined = (modalTemplates as Record<string, string>)[
			contentId
		];
		if (!html) {
			const source = document.getElementById(contentId);
			html = source?.innerHTML;
		}
		if (!html || !this.content || !this.overlay) return;

		this.content.innerHTML = html;
		this.overlay.style.display = "flex";
		this.showWindowIfNeeded();
		this.setupListeners(contentId);
	}

	hide() {
		if (this.overlay) {
			this.overlay.style.display = "none";
		}
		if (isTauriAvailable()) {
			invoke("hide_modal_window").catch(() => {});
		}
	}

	setupListeners(contentId: string) {
		if (contentId === "ghost-modal-content") {
			this.ghostHandlers.setupGhostListeners();
		} else if (contentId === "explorer-modal-content") {
			this.ghostHandlers.setupExplorerListeners();
		} else if (contentId === "install-modal-content") {
			this.ghostHandlers.setupInstallListeners();
		} else if (contentId === "balloon-modal-content") {
			this.ghostHandlers.renderBalloonList();
		} else if (contentId === "settings-modal-content") {
			this.settingsHandlers.setupSettingsListeners();
		} else if (contentId === "plugins-modal-content") {
			this.settingsHandlers.setupPluginListeners();
		} else if (contentId === "debug-modal-content") {
			this.settingsHandlers.setupDebugListeners();
		} else if (contentId === "test-modal-content") {
			this.settingsHandlers.setupTestListeners();
		} else if (contentId === "scan-modal-content") {
			this.settingsHandlers.setupScanListeners();
		}
	}

	showNotification(title: string, message: string, isError = false) {
		if (!this.content || !this.overlay) return;
		this.content.innerHTML = `
      <h2>${isError ? "⚠️ " : "ℹ️ "}${title}</h2>
      <div class="form-section">
        <p style="${isError ? "color: #d32f2f;" : ""}">${message}</p>
      </div>
      <div class="form-section" style="text-align: right;">
        <button id="modal-ok-btn" class="primary">OK</button>
      </div>
    `;
		this.overlay.style.display = "flex";
		this.showWindowIfNeeded();
		document
			.getElementById("modal-ok-btn")
			?.addEventListener("click", () => this.hide());
	}

	renderGhostList() {
		this.ghostHandlers.renderGhostList();
	}

	renderBalloonList() {
		this.ghostHandlers.renderBalloonList();
	}
}
