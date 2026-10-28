import { AppConfig } from "../config.js";
import { invoke, isTauriAvailable } from "../tauri-helper.js";

const SCALE_MAP = {
	"scale-50": { width: "100px", height: "200px" },
	"scale-75": { width: "150px", height: "300px" },
	"scale-100": { width: "200px", height: "400px" },
	"scale-125": { width: "250px", height: "500px" },
	"scale-150": { width: "300px", height: "600px" },
	"scale-200": { width: "400px", height: "800px" },
};

export const ghostActions = {
	showGhostInformation() {
		const ghost = this.ghostController?.currentGhost;
		if (!ghost || !this.modalManager?.content || !this.modalManager?.overlay) {
			return;
		}

		const escapeHtml = (value) =>
			String(value ?? "不明")
				.replaceAll("&", "&amp;")
				.replaceAll("<", "&lt;")
				.replaceAll(">", "&gt;")
				.replaceAll('"', "&quot;")
				.replaceAll("'", "&#39;");
		const row = (label, value) =>
			`<div class="info-item"><strong>${escapeHtml(label)}:</strong> <span>${escapeHtml(value)}</span></div>`;

		this.modalManager.content.innerHTML = `
      <h2>👻 ゴースト情報</h2>
      <div class="form-section">
        ${row("名前", ghost.name)}
        ${row("バージョン", ghost.version)}
        ${row("さくら", ghost.sakura_name)}
        ${row("うにゅう", ghost.kero_name)}
        ${row("SHIORI", ghost.shiori)}
        ${row("作者", ghost.craftman)}
        ${row("作者 URL", ghost.craftman_url)}
        ${row("インストール先", ghost.path)}
      </div>
      <div class="form-section" style="text-align: right;">
        <button id="modal-ok-btn" class="primary">OK</button>
      </div>
    `;
		this.modalManager.overlay.style.display = "flex";
		this.modalManager.showWindowIfNeeded?.();
		this.modalManager.content
			.querySelector("#modal-ok-btn")
			?.addEventListener("click", () => this.modalManager.hide());
	},

	async uninstallCurrentGhost() {
		const gc = this.ghostController;
		const name = gc.currentGhost?.name;
		if (!name) return;
		if (!isTauriAvailable()) {
			const message = `ゴースト「${name}」をアンインストールしますか？\nゴーストのファイルはすべて削除されます（復元できません）。`;
			if (
				typeof globalThis.confirm === "function" &&
				!globalThis.confirm(message)
			) {
				return;
			}
			return;
		}
		try {
			const removed = await invoke("uninstall_ghost", { ghostName: name });
			if (!removed) return;
			console.log(`🗑️ ゴーストアンインストール: ${name} (removed=${removed})`);
			this.showBalloon(`ゴースト「${name}」を削除しました`);
			setTimeout(() => this.hideBalloon(), 2500);
			await gc.scanGhosts();
			const next = (gc.ghosts || []).find((g) => g.name !== name);
			if (next) {
				await gc.selectGhost(next.name);
			} else {
				await gc.selectGhost(AppConfig.paths.fallbackGhostName);
			}
		} catch (err) {
			console.error("🗑️ アンインストール失敗:", err);
			this.showBalloon(`アンインストールに失敗しました: ${err}`);
			setTimeout(() => this.hideBalloon(), 3000);
		}
	},

	async installGhostFromMenu() {
		if (!isTauriAvailable()) {
			return this.modalManager?.show("install-modal-content");
		}
		try {
			const result = await invoke("pick_and_install_ghost_archive");
			if (!result) return;
			await this.ghostController.scanGhosts();
			await this.scanBalloons();
			const importedGhost = this.ghostController.ghosts.find(
				(ghost) => ghost.name === result.name,
			);
			if (importedGhost) {
				await this.ghostController.selectGhost(importedGhost.name);
				return;
			}
			const importedBalloon = this.availableBalloons?.find(
				(balloon) =>
					balloon.name === result.name || balloon.dir_name === result.name,
			);
			if (importedBalloon) {
				await this.setBalloonTheme(importedBalloon.dir_name);
				this.showBalloon(`バルーン「${importedBalloon.name}」を導入しました`);
				setTimeout(() => this.hideBalloon(), 2000);
			}
		} catch (error) {
			console.error("メニューからのゴースト取り込みに失敗しました:", error);
			this.modalManager?.showNotification(
				"ゴースト取り込み失敗",
				String(error),
				true,
			);
		}
	},

	recordRecentGhost(ghostName) {
		if (!ghostName) return;
		const MAX_RECENT = 8;
		try {
			const list = JSON.parse(
				localStorage.getItem("nanai_recent_ghosts") || "[]",
			);
			const next = [
				ghostName,
				...list.filter((/** @type {string} */ g) => g !== ghostName),
			];
			localStorage.setItem(
				"nanai_recent_ghosts",
				JSON.stringify(next.slice(0, MAX_RECENT)),
			);
		} catch (_err) {
			// LocalStorage 利用不可環境では無視
		}
	},

	/**
	 * @param {{ category: string, part: string, scope?: number }} payload
	 */
	async handleDressupToggle(payload) {
		const sm = this.surfaceManager;
		if (!sm || !payload?.category) return;
		const scopeId = Number.isFinite(payload.scope) ? payload.scope : 0;
		const { category, part } = payload;

		const willOn =
			sm.dressupState.get(`${scopeId}__${category}__${part}`) !== true;

		/** @type {string | string[]} */
		let options = [];
		/** @type {{ number: number; part: string; thumbnail?: string | null; on: boolean; }[]} */
		let siblingParts = [];
		if (sm.shellManifest) {
			const { bindMenuData } = await import("../../surface/bind-menu.js");
			const cat = bindMenuData(sm.shellManifest, scopeId).categories.find(
				(c) => c.category === category,
			);
			options = cat?.options ?? [];
			siblingParts = cat?.parts ?? [];
		}
		if (willOn && options.includes("mustselect")) {
			for (const p of siblingParts) {
				if (p.part === part) continue;
				await sm.bindDressup(category, p.part, "0", scopeId);
			}
		}

		return sm.bindDressup(category, part, willOn ? "1" : "0", scopeId);
	},

	switchToNextGhost() {
		const ghosts = this.ghostController.ghosts || [];
		if (ghosts.length <= 1) return;
		const currentName = this.ghostController.currentGhost?.name;
		const idx = ghosts.findIndex(
			(/** @type {{ name: any; }} */ g) => g.name === currentName,
		);
		const next = ghosts[(idx + 1) % ghosts.length];
		if (next) this.ghostController.selectGhost(next.name);
	},

	/**
	 * @param {string} action
	 */
	applyShellScaleAction(action) {
		const conf = SCALE_MAP[action] || SCALE_MAP["scale-100"];
		const scalePercent = parseInt(action.replace("scale-", ""), 10) || 100;
		if (this.elements.ghostDisplay) {
			this.elements.ghostDisplay.style.width = conf.width;
			this.elements.ghostDisplay.style.height = conf.height;
		}
		if (isTauriAvailable()) {
			invoke("set_character_scale", { scalePercent }).catch(() => {});
		}
		this.showBalloon(`シェル倍率を ${scalePercent}% に変更しました`);
		setTimeout(() => this.hideBalloon(), 1500);
	},

	minimizeApp() {
		this.hideMenu();
		try {
			this.ghostController.sendShioriEvent("OnWindowStateMinimize");
		} catch (_e) {}
		if (isTauriAvailable()) {
			invoke("minimize_app").catch((err) =>
				console.error("minimize_app failed:", err),
			);
		}
	},
};
