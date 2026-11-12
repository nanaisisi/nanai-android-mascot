/**
 * @file modal-ghost-handlers.ts
 * @brief ゴースト・バルーン・導入関連のモーダルハンドラ管理クラス（ファイル選択・アーカイブインポート対応）
 */
import { invoke, isTauriAvailable } from "../core/tauri-helper.js";
import type { AppModalTarget, ModalManager } from "./modal.js";
import { setupExplorerListeners } from "./modal-explorer.js";

interface InstalledGhostInfo {
	name?: string;
	craftman?: string;
	[key: string]: unknown;
}

interface BalloonInfo {
	name?: string;
	dir_name?: string;
	[key: string]: unknown;
}

export class ModalGhostHandlers {
	app: AppModalTarget | null;
	manager: ModalManager;

	constructor(manager: ModalManager) {
		this.manager = manager;
		this.app = manager.app;
	}

	setupExplorerListeners() {
		setupExplorerListeners(this.manager, this.app);
	}

	setupGhostListeners() {
		const refreshBtn = document.getElementById("refresh-ghosts-btn");
		refreshBtn?.addEventListener("click", async () => {
			await this.app?.ghostController?.scanGhosts?.();
			this.renderGhostList();
		});

		const importBtn = document.getElementById("import-ghost-btn");
		const fileInput = document.getElementById(
			"ghost-archive-input",
		) as HTMLInputElement | null;

		importBtn?.addEventListener("click", async () => {
			const statusEl = document.getElementById("import-ghost-status");
			if (isTauriAvailable()) {
				try {
					if (statusEl)
						statusEl.textContent = "ファイル選択とインストールを実行中...";
					const result = await invoke<InstalledGhostInfo | null>(
						"pick_and_install_ghost_archive",
					);
					if (result) {
						if (statusEl)
							statusEl.textContent = `導入成功: ${result.name ?? ""}`;
						await this.app?.ghostController?.scanGhosts?.();
						this.renderGhostList();
					} else {
						if (statusEl) statusEl.textContent = "キャンセルされました";
					}
				} catch (e) {
					if (statusEl) statusEl.textContent = `エラー: ${e}`;
				}
			} else if (fileInput?.files && fileInput.files.length > 0) {
				const file = fileInput.files[0];
				if (statusEl) statusEl.textContent = `ファイル読込中: ${file.name}`;
				setTimeout(() => {
					if (statusEl)
						statusEl.textContent = `導入完了 (Webプレビュー): ${file.name}`;
					this.app?.showBalloon?.(`アーカイブ「${file.name}」を取り込みました`);
					setTimeout(() => this.app?.hideBalloon?.(), 2000);
				}, 500);
			} else {
				if (statusEl)
					statusEl.textContent =
						"ファイルが選択されていません。.nar または .zip ファイルを選択してください。";
			}
		});

		this.renderGhostList();
	}

	setupInstallListeners() {
		const selectBtn = document.getElementById("modal-install-select-btn");
		const submitBtn = document.getElementById("modal-install-submit-btn");
		const statusEl = document.getElementById("modal-install-status");

		let hiddenInput = document.getElementById(
			"modal-install-hidden-file-input",
		) as HTMLInputElement | null;
		if (!hiddenInput) {
			hiddenInput = document.createElement("input");
			hiddenInput.type = "file";
			hiddenInput.id = "modal-install-hidden-file-input";
			hiddenInput.accept = ".nar,.zip";
			hiddenInput.style.display = "none";
			document.body.appendChild(hiddenInput);
		}

		selectBtn?.addEventListener("click", () => {
			if (isTauriAvailable()) {
				invoke<InstalledGhostInfo | null>("pick_and_install_ghost_archive")
					.then((result) => {
						if (result && statusEl) {
							statusEl.textContent = `導入成功: ${result.name ?? ""}`;
							void this.app?.ghostController?.scanGhosts?.();
						}
					})
					.catch((e) => {
						if (statusEl) statusEl.textContent = `エラー: ${e}`;
					});
			} else {
				hiddenInput?.click();
			}
		});

		hiddenInput.addEventListener("change", () => {
			if (hiddenInput?.files && hiddenInput.files.length > 0) {
				const file = hiddenInput.files[0];
				if (statusEl) statusEl.textContent = `選択中: ${file.name}`;
			}
		});

		submitBtn?.addEventListener("click", async () => {
			if (isTauriAvailable()) {
				try {
					if (statusEl) statusEl.textContent = "インストール実行中...";
					const result = await invoke<InstalledGhostInfo | null>(
						"pick_and_install_ghost_archive",
					);
					if (result && statusEl) {
						statusEl.textContent = `導入成功: ${result.name ?? ""}`;
						await this.app?.ghostController?.scanGhosts?.();
						setTimeout(() => this.manager.hide(), 1500);
					}
				} catch (e) {
					if (statusEl) statusEl.textContent = `エラー: ${e}`;
				}
			} else if (hiddenInput?.files && hiddenInput.files.length > 0) {
				const file = hiddenInput.files[0];
				if (statusEl) statusEl.textContent = `導入完了 (Web): ${file.name}`;
				this.app?.showBalloon?.(`アーカイブ「${file.name}」を取り込みました`);
				setTimeout(() => {
					this.app?.hideBalloon?.();
					this.manager.hide();
				}, 2000);
			} else {
				if (statusEl) statusEl.textContent = "ファイルを選択してください。";
			}
		});
	}

	renderGhostList() {
		const listEl = document.getElementById("ghost-list");
		const currentEl = document.getElementById("current-ghost");
		if (!listEl) return;

		const gc = this.app?.ghostController;
		if (currentEl) {
			currentEl.textContent = gc?.currentGhost?.name || "未選択";
		}

		const ghosts = gc?.ghosts || [];
		if (ghosts.length === 0) {
			listEl.innerHTML = `<div class="info">ゴーストが検出されません</div>`;
			return;
		}

		listEl.innerHTML = "";
		ghosts.forEach((ghost: InstalledGhostInfo) => {
			const item = document.createElement("div");
			const isCurrent = gc?.currentGhost?.name === ghost.name;
			item.className = `ghost-item${isCurrent ? " active" : ""}`;
			item.style.cssText =
				"padding: 8px; margin: 4px 0; border: 1px solid #ccc; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; cursor: pointer;";
			item.innerHTML = `<span><strong>${ghost.name ?? ""}</strong> (${ghost.craftman || "不明"})</span> <button type="button" class="primary select-ghost-btn">切り替え</button>`;
			item.querySelector("button")?.addEventListener("click", async (e) => {
				e.stopPropagation();
				if (ghost.name) {
					await gc?.selectGhost?.(ghost.name);
				}
				this.renderGhostList();
			});
			listEl.appendChild(item);
		});
	}

	renderBalloonList() {
		const currentEl = document.getElementById("current-balloon");
		const listEl = document.getElementById("balloon-list");
		if (currentEl) {
			currentEl.textContent = this.app?.currentBalloonTheme || "デフォルト";
		}
		if (listEl && this.app?.availableBalloons) {
			listEl.innerHTML = "";
			this.app.availableBalloons.forEach((b: BalloonInfo) => {
				const item = document.createElement("div");
				const isCurrent = this.app?.currentBalloonTheme === b.dir_name;
				item.className = `balloon-item${isCurrent ? " active" : ""}`;
				item.style.cssText = "padding: 6px; cursor: pointer;";
				item.textContent = b.name || b.dir_name || "";
				item.addEventListener("click", () => {
					if (b.dir_name) {
						this.app?.setBalloonTheme?.(b.dir_name);
					}
					this.renderBalloonList();
				});
				listEl.appendChild(item);
			});
		}
	}
}
