import { modalTemplates } from "./modal-templates.js";
import { ModalGhostHandlers } from "./modal-ghost-handlers.js";
import { ModalSettingsHandlers } from "./modal-settings-handlers.js";

/**
 * Nanai Android Mascot - モーダル & UIダイアログ管理
 */
export class ModalManager {
	/**
	 * @param {import('../../main.js').NanaiAndroidMascotApp} app
	 */
	constructor(app) {
		/** @type {import('../../main.js').NanaiAndroidMascotApp} */
		this.app = app;
		/** @type {HTMLElement|null} */
		this.overlay = document.getElementById("modal-overlay");
		/** @type {HTMLElement|null} */
		this.content = document.getElementById("modal-content");
		/** @type {HTMLElement|null} */
		this.closeBtn = document.getElementById("modal-close");

		this.ghostHandlers = new ModalGhostHandlers(this);
		this.settingsHandlers = new ModalSettingsHandlers(this);

		this.init();
	}

	init() {
		this.closeBtn?.addEventListener("click", () => this.hide());
		this.overlay?.addEventListener("click", (e) => {
			if (e.target === this.overlay) {
				this.hide();
			}
		});
	}

	show(contentId) {
		let html = modalTemplates[contentId];
		if (!html) {
			const source = document.getElementById(contentId);
			html = source?.innerHTML;
		}
		if (!html || !this.content || !this.overlay) return;

		this.content.innerHTML = html;
		this.overlay.style.display = "flex";
		this.setupListeners(contentId);
	}

	hide() {
		if (this.overlay) {
			this.overlay.style.display = "none";
		}
	}

	setupListeners(contentId) {
		if (contentId === "ghost-modal-content") {
			this.ghostHandlers.setupGhostListeners();
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
		}
	}

	/**
	 * 共通エラー・情報通知モーダル表示ヘルパー
	 */
	showNotification(title, message, isError = false) {
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
		document
			.getElementById("modal-ok-btn")
			?.addEventListener("click", () => this.hide());
	}

	// 下位互換プロキシメソッド
	renderGhostList() {
		this.ghostHandlers.renderGhostList();
	}

	renderBalloonList() {
		this.ghostHandlers.renderBalloonList();
	}
}
