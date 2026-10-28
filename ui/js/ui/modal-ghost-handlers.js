import { invoke, isTauriAvailable } from "../core/tauri-helper.js";

/**
 * ゴースト・バルーン・導入関連のモーダルハンドラ
 */
export class ModalGhostHandlers {
	/**
	 * @param {import('./modal.js').ModalManager} manager
	 */
	constructor(manager) {
		this.manager = manager;
		this.app = manager.app;
	}

	setupExplorerListeners() {
		const rows = this.manager.content?.querySelector("#explorer-rows");
		const status = this.manager.content?.querySelector("#explorer-status");
		const search = this.manager.content?.querySelector("#explorer-search");
		let ghosts = [];
		let selected = null;
		let sortKey = "name";
		let sortAsc = true;
		let searchIndex = -1;

		const format = (value) => value || "—";
		const render = () => {
			if (!rows) return;
			const query = String(search?.value || "")
				.trim()
				.toLowerCase();
			const list = ghosts
				.filter((ghost) =>
					[ghost.name, ghost.craftman, ghost.path].some((value) =>
						String(value || "")
							.toLowerCase()
							.includes(query),
					),
				)
				.sort((a, b) => {
					const left = String(a[sortKey] || "");
					const right = String(b[sortKey] || "");
					return (
						(left.localeCompare(right, "ja") ||
							a.name.localeCompare(b.name, "ja")) * (sortAsc ? 1 : -1)
					);
				});
			rows.innerHTML = "";
			list.forEach((ghost) => {
				const tr = document.createElement("tr");
				tr.className = ghost.name === selected?.name ? "is-selected" : "";
				tr.innerHTML = [
					ghost.name,
					ghost.craftman,
					ghost.path,
					ghost.group,
					ghost.install_date,
					ghost.update_date,
					ghost.update_result,
					ghost.sakura_name,
					ghost.kero_name,
				]
					.map(
						(value) =>
							`<td title="${String(value || "").replaceAll('"', "&quot;")}">${format(value)}</td>`,
					)
					.join("");
				tr.addEventListener("click", () => {
					selected = ghost;
					render();
				});
				tr.addEventListener("dblclick", async () => {
					await this.app.ghostController.selectGhost(ghost.name);
					this.manager.hide();
				});
				rows.appendChild(tr);
			});
			if (status) status.textContent = `${list.length} 件`;
		};
		const load = async () => {
			ghosts = (await this.app.ghostController.scanGhosts()) || [];
			selected =
				ghosts.find(
					(ghost) => ghost.name === this.app.ghostController.currentGhost?.name,
				) ||
				ghosts[0] ||
				null;
			render();
		};
		this.manager.content
			?.querySelector("#explorer-refresh-btn")
			?.addEventListener("click", load);
		search?.addEventListener("input", () => {
			searchIndex = -1;
			render();
		});
		this.manager.content
			?.querySelector("#explorer-search-next-btn")
			?.addEventListener("click", () => {
				const matches = [...(rows?.querySelectorAll("tr") || [])];
				if (!matches.length) return;
				searchIndex = (searchIndex + 1) % matches.length;
				matches[searchIndex].click();
				matches[searchIndex].scrollIntoView({ block: "nearest" });
			});
		this.manager.content
			?.querySelectorAll("th[data-sort]")
			.forEach((header) => {
				header.addEventListener("click", () => {
					const key = header.dataset.sort;
					if (sortKey === key) sortAsc = !sortAsc;
					else {
						sortKey = key;
						sortAsc = true;
					}
					render();
				});
			});
		this.manager.content
			?.querySelector("#explorer-close-btn")
			?.addEventListener("click", () => this.manager.hide());
		this.manager.content
			?.querySelector("#explorer-switch-btn")
			?.addEventListener("click", async () => {
				if (!selected) return;
				await this.app.ghostController.selectGhost(selected.name);
				this.manager.hide();
			});
		void load();
	}

	setupGhostListeners() {
		this.renderGhostList();
		document
			.getElementById("refresh-ghosts-btn")
			?.addEventListener("click", async () => {
				await this.app.ghostController.scanAndLoadFirstGhost();
				this.renderGhostList();
			});

		const content = this.manager.content;
		if (!content) return;
		const fileInput = content.querySelector("#ghost-archive-input");
		const importBtn = content.querySelector("#import-ghost-btn");
		const statusEl = content.querySelector("#import-ghost-status");

		const handleGhostImport = async () => {
			const file = fileInput?.files?.[0];
			if (!file) {
				if (statusEl) statusEl.textContent = "ファイルを選択してください。";
				return;
			}

			if (statusEl) {
				statusEl.textContent = `⏳ 取り込み中: ${file.name}...`;
				statusEl.style.color = "#2980b9";
			}

			if (isTauriAvailable()) {
				try {
					let res;
					if (file.path) {
						res = await invoke("install_ghost_archive", {
							archivePath: file.path,
						});
					} else {
						const arrayBuffer = await file.arrayBuffer();
						const bytes = Array.from(new Uint8Array(arrayBuffer));
						res = await invoke("install_ghost_archive_bytes", {
							fileName: file.name,
							bytes,
						});
					}
					if (statusEl) {
						statusEl.textContent = `✅ 「${res.name}」を取り込みました！`;
						statusEl.style.color = "#27ae60";
					}
					await this.app.ghostController.scanGhosts();
					const importedGhost = this.app.ghostController.ghosts.find(
						(ghost) => ghost.name === res.name,
					);
					if (importedGhost) {
						this.app.ghostController.selectGhost(importedGhost.name);
					} else {
						await this.app.scanBalloons();
						const importedBalloon = this.app.availableBalloons?.find(
							(balloon) =>
								balloon.name === res.name || balloon.dir_name === res.name,
						);
						if (importedBalloon) {
							await this.app.setBalloonTheme(importedBalloon.dir_name);
						}
					}
					this.renderGhostList();
				} catch (err) {
					console.error("アーカイブ取り込み失敗:", err);
					if (statusEl) {
						statusEl.textContent = `❌ 失敗: ${err}`;
						statusEl.style.color = "#c0392b";
					}
				}
			} else {
				if (statusEl)
					statusEl.textContent =
						"※ ブラウザ環境ではアーカイブ展開はサポートされていません";
			}
		};

		importBtn?.addEventListener("click", async () => {
			if (isTauriAvailable()) {
				await this.pickAndInstall(statusEl, async (res) => {
					await this.app.ghostController.scanGhosts();
					const importedGhost = this.app.ghostController.ghosts.find(
						(ghost) => ghost.name === res.name,
					);
					if (importedGhost) {
						this.app.ghostController.selectGhost(importedGhost.name);
					} else {
						await this.app.scanBalloons();
						const importedBalloon = this.app.availableBalloons?.find(
							(balloon) =>
								balloon.name === res.name || balloon.dir_name === res.name,
						);
						if (importedBalloon) {
							await this.app.setBalloonTheme(importedBalloon.dir_name);
						}
					}
					this.renderGhostList();
				});
				return;
			}
			if (!fileInput?.files?.[0]) {
				fileInput?.click();
				return;
			}
			handleGhostImport();
		});
		fileInput?.addEventListener("change", () => {
			if (fileInput.files?.[0]) handleGhostImport();
		});
	}

	/** ネイティブダイアログでアーカイブを選んで取り込む */
	async pickAndInstall(statusEl, onDone) {
		try {
			if (statusEl) {
				statusEl.textContent = "📂 ファイルを選択してください...";
				statusEl.style.color = "#2980b9";
			}
			const res = await invoke("pick_and_install_ghost_archive");
			if (!res) {
				if (statusEl) statusEl.textContent = "キャンセルされました。";
				return;
			}
			if (statusEl) {
				statusEl.textContent = `✅ 「${res.name}」を取り込みました！`;
				statusEl.style.color = "#27ae60";
			}
			await onDone(res);
		} catch (err) {
			console.error("アーカイブ取り込み失敗:", err);
			if (statusEl) {
				statusEl.textContent = `❌ 失敗: ${err}`;
				statusEl.style.color = "#c0392b";
			}
		}
	}

	setupInstallListeners() {
		const content = this.manager.content;
		if (!content) return;
		const fileInput = content.querySelector("#modal-install-file-input");
		const submitBtn = content.querySelector("#modal-install-submit-btn");
		const statusEl = content.querySelector("#modal-install-status");

		const doInstall = async () => {
			const file = fileInput?.files?.[0];
			if (!file) {
				if (statusEl) {
					statusEl.textContent = "ファイルを選択してください。";
					statusEl.style.color = "#c0392b";
				}
				return;
			}

			if (statusEl) {
				statusEl.textContent = `⏳ 取り込み処理中: ${file.name}...`;
				statusEl.style.color = "#2980b9";
			}

			if (isTauriAvailable()) {
				try {
					let res;
					if (file.path) {
						res = await invoke("install_ghost_archive", {
							archivePath: file.path,
						});
					} else {
						const arrayBuffer = await file.arrayBuffer();
						const bytes = Array.from(new Uint8Array(arrayBuffer));
						res = await invoke("install_ghost_archive_bytes", {
							fileName: file.name,
							bytes,
						});
					}

					if (statusEl) {
						statusEl.textContent = `✅ ゴースト「${res.name}」を取り込みました！`;
						statusEl.style.color = "#27ae60";
					}
					await this.app.ghostController.scanGhosts();
					this.app.ghostController.selectGhost(res.name);
					this.app.showBalloon(
						`「${res.name}」をインストールして切り替えました！`,
					);
					setTimeout(() => this.app.hideBalloon(), 2500);
				} catch (err) {
					console.error("アーカイブ取り込み失敗:", err);
					if (statusEl) {
						statusEl.textContent = `❌ 取り込み失敗: ${err}`;
						statusEl.style.color = "#c0392b";
					}
				}
			} else {
				if (statusEl) {
					statusEl.textContent =
						"※ ブラウザ環境ではネイティブアーカイブ展開はサポートされていません（Tauri環境で実行してください）";
					statusEl.style.color = "#e67e22";
				}
			}
		};

		submitBtn?.addEventListener("click", async () => {
			if (isTauriAvailable()) {
				await this.pickAndInstall(statusEl, async (res) => {
					await this.app.ghostController.scanGhosts();
					this.app.ghostController.selectGhost(res.name);
					this.app.showBalloon(
						`「${res.name}」をインストールして切り替えました！`,
					);
					setTimeout(() => this.app.hideBalloon(), 2500);
				});
				return;
			}
			if (!fileInput?.files?.[0]) {
				fileInput?.click();
				return;
			}
			doInstall();
		});
		fileInput?.addEventListener("change", () => {
			if (fileInput.files?.[0]) doInstall();
		});
	}

	renderBalloonList() {
		const list = document.getElementById("balloon-list");
		const currentLabel = document.getElementById("current-balloon");
		if (!list) return;

		const balloonThemes = [
			{
				id: "default",
				name: "標準モダン (デフォルト)",
				desc: "半透明の角丸バルーン",
			},
			{ id: "ivory", name: "アイボリー", desc: "歴史的なレトロクリーム調枠線" },
			{ id: "comic", name: "コミック", desc: "ポップな太枠吹き出し" },
			{ id: "dark", name: "ダークモダン", desc: "シックな黒基調スタイル" },
		];

		const currentTheme = this.app.settings.balloonTheme || "default";
		if (currentLabel) {
			const activeObj = balloonThemes.find((b) => b.id === currentTheme);
			currentLabel.textContent = activeObj ? activeObj.name : currentTheme;
		}

		list.innerHTML = balloonThemes
			.map(
				(b) => `
        <div class="ghost-item ${currentTheme === b.id ? "active" : ""}" data-theme="${b.id}" style="cursor: pointer;">
          <strong>${currentTheme === b.id ? "✓ " : ""}${b.name}</strong><br>
          <small>${b.desc}</small>
        </div>`,
			)
			.join("");

		list.querySelectorAll(".ghost-item").forEach((item) => {
			item.addEventListener("click", () => {
				const selected = item.dataset.theme;
				this.app.setBalloonTheme(selected);
				this.renderBalloonList();
			});
		});
	}

	renderGhostList() {
		const content = this.manager.content;
		const ghostList = content
			? content.querySelector("#ghost-list")
			: document.getElementById("ghost-list");
		const currentGhostLabel = content
			? content.querySelector("#current-ghost")
			: document.getElementById("current-ghost");
		if (!ghostList) return;

		if (currentGhostLabel) {
			currentGhostLabel.textContent =
				this.app.ghostController.currentGhost?.name || "未選択";
		}

		const ghosts = this.app.ghostController.ghosts;
		if (!ghosts || ghosts.length === 0) {
			ghostList.innerHTML =
				'<div class="info">ゴーストが見つかりません。</div>';
			return;
		}

		ghostList.innerHTML = ghosts
			.map(
				(ghost) => `
        <div class="ghost-item ${this.app.ghostController.currentGhost?.name === ghost.name ? "active" : ""}" data-ghost="${ghost.name}" style="cursor: pointer; padding: 6px; border-bottom: 1px solid rgba(0,0,0,0.05);">
          <strong>${this.app.ghostController.currentGhost?.name === ghost.name ? "✓ " : ""}${ghost.name}</strong><br>
          <small style="color: #666;">バージョン: ${ghost.version || "不明"}</small><br>
          <small style="color: #666;">${ghost.path}</small>
        </div>`,
			)
			.join("");

		ghostList.querySelectorAll(".ghost-item").forEach((item) => {
			item.addEventListener("click", () => {
				const ghostName = item.dataset.ghost;
				this.app.ghostController.selectGhost(ghostName);
				this.renderGhostList();
			});
		});
	}
}
