/**
 * @file modal-ghost-handlers.ts
 * @brief ゴースト・バルーン・導入関連のモーダルハンドラ管理クラス（ファイル選択・アーカイブインポート対応）
 */
import {
	installGhostArchiveFile,
	pickAndInstallGhostArchive,
} from "../core/actions/ghost-install-action.js";
import {
	convertFileSrc,
	invoke,
	isAndroidMobile,
	isTauriAvailable,
} from "../core/tauri-helper.js";
import type { GhostAssets } from "../ghost/ghost.js";
import type { AppModalTarget, ModalManager } from "./modal.js";
import { setupExplorerListeners } from "./modal-explorer.js";

interface InstalledGhostInfo {
	name?: string;
	craftman?: string;
	assets?: GhostAssets;
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
		if (fileInput && isAndroidMobile()) {
			// Android WebChromeClient maps ".nar" to null MIME and hides .nar files when filtered
			fileInput.accept = "*/*";
		}

		importBtn?.addEventListener("click", async () => {
			const statusEl = document.getElementById("import-ghost-status");
			if (isTauriAvailable()) {
				try {
					if (statusEl)
						statusEl.textContent = "ファイル選択とインストールを実行中...";
					const selectedFile = fileInput?.files?.[0];
					const result = selectedFile
						? await installGhostArchiveFile(selectedFile)
						: await pickAndInstallGhostArchive();
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
			hiddenInput.accept = isAndroidMobile() ? "*/*" : ".nar,.zip";
			hiddenInput.style.display = "none";
			document.body.appendChild(hiddenInput);
		}

		selectBtn?.addEventListener("click", () => {
			if (isTauriAvailable()) {
				pickAndInstallGhostArchive()
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
					const result = await pickAndInstallGhostArchive();
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
			const assetPath =
				ghost.assets?.thumbnail ||
				ghost.assets?.ai0 ||
				ghost.assets?.icons?.[0];
			const thumbHtml = assetPath
				? `<img src="${convertFileSrc(assetPath)}" alt="" style="width: 36px; height: 36px; object-fit: contain; margin-right: 8px; border-radius: 2px;" />`
				: "";
			const actionWrap = document.createElement("span");
			actionWrap.style.cssText =
				"display: flex; gap: 6px; align-items: center;";

			const readmeBtn = document.createElement("button");
			readmeBtn.type = "button";
			readmeBtn.className = "ghost-readme-btn";
			readmeBtn.textContent = "README";
			readmeBtn.addEventListener("click", async (e) => {
				e.stopPropagation();
				if (!ghost.name) return;
				await this.openTextDocument(
					`${ghost.name} - README`,
					"get_ghost_readme",
					{ ghostName: ghost.name },
					"readme.txt / readme.md が見つかりませんでした。",
				);
			});

			const termsBtn = document.createElement("button");
			termsBtn.type = "button";
			termsBtn.className = "ghost-terms-btn";
			termsBtn.textContent = "利用規約";
			termsBtn.addEventListener("click", async (e) => {
				e.stopPropagation();
				if (!ghost.name) return;
				await this.openTextDocument(
					`${ghost.name} - 利用規約`,
					"get_ghost_terms",
					{ ghostName: ghost.name },
					"terms.txt / terms.md が見つかりませんでした。",
				);
			});

			const shellReadmeBtn = document.createElement("button");
			shellReadmeBtn.type = "button";
			shellReadmeBtn.className = "shell-readme-btn";
			shellReadmeBtn.textContent = "シェルREADME";
			shellReadmeBtn.addEventListener("click", async (e) => {
				e.stopPropagation();
				if (!ghost.name) return;
				const shellName =
					(ghost as { currentShell?: string }).currentShell || "master";
				await this.openTextDocument(
					`${ghost.name} (${shellName}) - シェルREADME`,
					"get_shell_readme",
					{ ghostName: ghost.name, shellName },
					"シェルの readme.txt が見つかりませんでした。",
				);
			});

			const selectBtn = document.createElement("button");
			selectBtn.type = "button";
			selectBtn.className = "primary select-ghost-btn";
			selectBtn.textContent = "切り替え";
			selectBtn.addEventListener("click", async (e) => {
				e.stopPropagation();
				if (ghost.name) {
					await gc?.selectGhost?.(ghost.name);
				}
				this.renderGhostList();
			});

			actionWrap.append(readmeBtn, termsBtn, shellReadmeBtn, selectBtn);
			item.innerHTML = `<span style="display: flex; align-items: center;">${thumbHtml}<span><strong>${ghost.name ?? ""}</strong> (${ghost.craftman || "不明"})</span></span>`;
			item.appendChild(actionWrap);
			listEl.appendChild(item);
		});
	}

	private async openTextDocument(
		title: string,
		command:
			| "get_ghost_readme"
			| "get_ghost_terms"
			| "get_shell_readme"
			| "get_balloon_readme",
		args: Record<string, string>,
		emptyMessage: string,
	) {
		if (!isTauriAvailable()) {
			this.showDocumentModal(title, emptyMessage);
			return;
		}
		try {
			const content = await invoke<string | null>(command, args);
			this.showDocumentModal(title, content ?? emptyMessage);
		} catch (err) {
			this.showDocumentModal(title, `読み込みに失敗しました: ${err}`);
		}
	}

	private showDocumentModal(title: string, body: string) {
		const existing = document.getElementById("ghost-doc-viewer-modal");
		existing?.remove();

		const overlay = document.createElement("div");
		overlay.id = "ghost-doc-viewer-modal";
		overlay.style.cssText =
			"position: fixed; inset: 0; background: rgba(0, 0, 0, 0.55); display: flex; align-items: center; justify-content: center; z-index: 10000; padding: 16px;";

		const dialog = document.createElement("div");
		dialog.style.cssText =
			"background: #fff; color: #222; border-radius: 8px; max-width: 680px; width: 100%; max-height: 80vh; display: flex; flex-direction: column; box-shadow: 0 8px 24px rgba(0,0,0,0.25); overflow: hidden;";

		const header = document.createElement("div");
		header.style.cssText =
			"display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-bottom: 1px solid #ddd; font-weight: bold;";
		const titleEl = document.createElement("span");
		titleEl.textContent = title;
		const closeBtn = document.createElement("button");
		closeBtn.type = "button";
		closeBtn.textContent = "閉じる";
		closeBtn.addEventListener("click", () => overlay.remove());
		header.append(titleEl, closeBtn);

		const pre = document.createElement("pre");
		pre.style.cssText =
			"margin: 0; padding: 16px; overflow: auto; white-space: pre-wrap; word-break: break-word; font-family: inherit; font-size: 13px; line-height: 1.5;";
		pre.textContent = body;

		overlay.addEventListener("click", (e) => {
			if (e.target === overlay) overlay.remove();
		});

		dialog.append(header, pre);
		overlay.appendChild(dialog);
		document.body.appendChild(overlay);
	}

	renderBalloonList() {
		const currentEl = document.getElementById("current-balloon");
		const listEl = document.getElementById("balloon-list");
		if (!listEl) return;

		if (currentEl) {
			currentEl.textContent = this.app?.currentBalloonTheme || "デフォルト";
		}

		const balloons = this.app?.availableBalloons || [];
		if (balloons.length === 0) {
			listEl.innerHTML = `<div class="info">バルーンが検出されません</div>`;
			return;
		}

		listEl.innerHTML = "";
		balloons.forEach((b: BalloonInfo) => {
			const item = document.createElement("div");
			const isCurrent = this.app?.currentBalloonTheme === b.dir_name;
			item.className = `balloon-item${isCurrent ? " active" : ""}`;
			item.style.cssText =
				"padding: 8px; margin: 4px 0; border: 1px solid #ccc; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; cursor: pointer;";

			const thumbHtml = b.thumbnail
				? `<img src="${b.thumbnail}" alt="" style="width: 48px; height: 36px; object-fit: contain; margin-right: 8px; border-radius: 2px;" />`
				: `<img alt="" style="width: 48px; height: 36px; object-fit: contain; margin-right: 8px; border-radius: 2px; display: none;" />`;

			const actionWrap = document.createElement("span");
			actionWrap.style.cssText =
				"display: flex; gap: 6px; align-items: center;";

			const readmeBtn = document.createElement("button");
			readmeBtn.type = "button";
			readmeBtn.className = "balloon-readme-btn";
			readmeBtn.textContent = "README";
			readmeBtn.addEventListener("click", async (e) => {
				e.stopPropagation();
				const balloonName = b.dir_name ?? b.name;
				if (!balloonName) return;
				await this.openTextDocument(
					`${b.name ?? balloonName} - README`,
					"get_balloon_readme",
					{ name: balloonName },
					"バルーンの readme.txt が見つかりませんでした。",
				);
			});

			const selectBtn = document.createElement("button");
			selectBtn.type = "button";
			selectBtn.className = "primary select-balloon-btn";
			selectBtn.textContent = isCurrent ? "使用中" : "切り替え";
			selectBtn.addEventListener("click", async (e) => {
				e.stopPropagation();
				if (b.dir_name) {
					await this.app?.setBalloonTheme?.(b.dir_name);
				}
				this.renderBalloonList();
			});

			actionWrap.append(readmeBtn, selectBtn);
			item.innerHTML = `<div style="display: flex; align-items: center;">${thumbHtml}<span><strong>${b.name ?? b.dir_name ?? ""}</strong> (${b.dir_name ?? ""})</span></div>`;
			item.appendChild(actionWrap);

			if (!b.thumbnail && (b.dir_name || b.name) && isTauriAvailable()) {
				const imgEl = item.querySelector("img");
				const balloonName = b.dir_name ?? b.name;
				if (imgEl && balloonName) {
					void invoke<string | null>("get_balloon_thumbnail", {
						name: balloonName,
					})
						.then((dataUrl) => {
							if (dataUrl) {
								imgEl.src = dataUrl;
								imgEl.style.display = "";
							}
						})
						.catch(() => {});
				}
			}

			item.addEventListener("click", async () => {
				if (b.dir_name) {
					await this.app?.setBalloonTheme?.(b.dir_name);
				}
				this.renderBalloonList();
			});

			listEl.appendChild(item);
		});
	}
}
