import { invoke, isTauriAvailable } from "../core/tauri-helper.js";
import { ModalGhostHandlers } from "./modal-ghost-handlers.js";
import { ModalSettingsHandlers } from "./modal-settings-handlers.js";
import { modalTemplates } from "./modal-templates.js";

/**
 * Nanai Android Mascot - モーダル & UIダイアログ管理
 */
export class ModalManager {

	app: unknown;


	app: any;

	overlay: HTMLElement | null;
	content: HTMLElement | null;
	closeBtn: HTMLElement | null;
	ghostHandlers: ModalGhostHandlers;
	settingsHandlers: ModalSettingsHandlers;


	constructor(_app: unknown) {


	constructor(app: any)

		this.app = app;
		this.overlay = document.getElementById("modal-overlay");
		this.content = document.getElementById("modal-content");
		this.closeBtn = document.getElementById("modal-close");

		this.ghostHandlers = new ModalGhostHandlers(this);
		this.settingsHandlers = new ModalSettingsHandlers(this);

		this.init();

	init()
		this.closeBtn?.addEventListener("click", () => this.hide());
		this.overlay?.addEventListener("click", (e: MouseEvent) => {
			if (e.target === this.overlay) {
				this.hide();
			}
		});

	showWindowIfNeeded()
		if (isTauriAvailable()) {
			invoke("show_modal_window").catch((e) =>
				console.warn("show_modal_window failed:", e),
			);
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

	hide()
		if (this.overlay) {
			this.overlay.style.display = "none";
		}
		if (isTauriAvailable()) {
			invoke("hide_modal_window").catch(() => {});
		}

	setupListeners(contentId: string)
		if (contentId === "ghost-modal-content") {

			(this.ghostHandlers as unknown).setupGhostListeners?.();
		} else if (contentId === "explorer-modal-content") {
			(this.ghostHandlers as unknown).setupExplorerListeners?.();
		} else if (contentId === "install-modal-content") {
			(this.ghostHandlers as unknown).setupInstallListeners?.();
		} else if (contentId === "balloon-modal-content") {
			(this.ghostHandlers as unknown).renderBalloonList?.();
		} else if (contentId === "settings-modal-content") {
			(this.settingsHandlers as unknown).setupSettingsListeners?.();
		} else if (contentId === "plugins-modal-content") {
			(this.settingsHandlers as unknown).setupPluginListeners?.();
		} else if (contentId === "debug-modal-content") {
			(this.settingsHandlers as unknown).setupDebugListeners?.();


			(this.ghostHandlers as any).setupGhostListeners?.();
		} else if (contentId === "explorer-modal-content") {

			(this.ghostHandlers as any).setupExplorerListeners?.();
		} else if (contentId === "install-modal-content") {

			(this.ghostHandlers as any).setupInstallListeners?.();
		} else if (contentId === "balloon-modal-content") {

			(this.ghostHandlers as any).renderBalloonList?.();
		} else if (contentId === "settings-modal-content") {

			(this.settingsHandlers as any).setupSettingsListeners?.();
		} else if (contentId === "plugins-modal-content") {

			(this.settingsHandlers as any).setupPluginListeners?.();
		} else if (contentId === "debug-modal-content") {

			(this.settingsHandlers as any).setupDebugListeners?.();

		}

	showNotification(title: string, message: string, isError: boolean = false)
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

	renderGhostList()

		(this.ghostHandlers as unknown).renderGhostList?.();

	renderBalloonList()
		(this.ghostHandlers as unknown).renderBalloonList?.();


		(this.ghostHandlers as any).renderGhostList?.();

	renderBalloonList()

		(this.ghostHandlers as any).renderBalloonList?.();

}
