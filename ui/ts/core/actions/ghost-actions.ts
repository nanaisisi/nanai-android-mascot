/**
 * @file ghost-actions.ts
 * @brief ゴースト管理・インストール・アンインストール・着せ替え・倍率設定モジュール (UKADOC準拠)
 */
import { AppConfig } from "../config.js";
import { invoke, isTauriAvailable } from "../tauri-helper.js";
import { installGhostFromMenuImpl } from "./ghost-install-action.js";

export { installGhostFromMenuImpl } from "./ghost-install-action.js";

const SCALE_MAP: Record<string, { width: string; height: string }> = {
	"scale-50": { width: "100px", height: "200px" },
	"scale-75": { width: "150px", height: "300px" },
	"scale-100": { width: "200px", height: "400px" },
	"scale-125": { width: "250px", height: "500px" },
	"scale-150": { width: "300px", height: "600px" },
	"scale-200": { width: "400px", height: "800px" },
};

export const ghostActions = {
	showGhostInformation() {
		const ghost = (this as unknown).ghostController?.currentGhost;
		if (
			!ghost ||
			!(this as unknown).modalManager?.content ||
			!(this as unknown).modalManager?.overlay
		) {
			return;
		}

		const escapeHtml = (value: unknown) =>
			String(value ?? "不明")
				.replaceAll("&", "&amp;")
				.replaceAll("<", "&lt;")
				.replaceAll(">", "&gt;")
				.replaceAll('"', "&quot;")
				.replaceAll("'", "&#39;");
		const row = (label: string, value: unknown) =>
			`<div class="info-item"><strong>${escapeHtml(label)}:</strong> <span>${escapeHtml(value)}</span></div>`;

		(
			this as import("../../../main.js").NanaiAndroidMascotApp
		).modalManager.content.innerHTML = `
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
		(
			this as import("../../../main.js").NanaiAndroidMascotApp
		).modalManager.overlay.style.display = "flex";
		(
			this as import("../../../main.js").NanaiAndroidMascotApp
		).modalManager.showWindowIfNeeded?.();
		(
			this as import("../../../main.js").NanaiAndroidMascotApp
		).modalManager.content
			.querySelector("#modal-ok-btn")
			?.addEventListener("click", () =>
				(
					this as import("../../../main.js").NanaiAndroidMascotApp
				).modalManager.hide(),
			);
	},

	async uninstallCurrentGhost() {
		const gc = (this as unknown).ghostController;
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
			(this as unknown).showBalloon(`ゴースト「${name}」を削除しました`);
			setTimeout(
				() =>
					(
						this as import("../../../main.js").NanaiAndroidMascotApp
					).hideBalloon(),
				2500,
			);
			await gc.scanGhosts();
			const next = (gc.ghosts || []).find((g: unknown) => g.name !== name);
			if (next) {
				await gc.selectGhost(next.name);
			} else {
				await gc.selectGhost(AppConfig.paths.fallbackGhostName);
			}
		} catch (err) {
			console.error("🗑️ アンインストール失敗:", err);
			(this as unknown).showBalloon(`アンインストールに失敗しました: ${err}`);
			setTimeout(
				() =>
					(
						this as import("../../../main.js").NanaiAndroidMascotApp
					).hideBalloon(),
				3000,
			);
		}
	},

	async installGhostFromMenu(
		this: import("../../../main.js").NanaiAndroidMascotApp,
	) {
		return installGhostFromMenuImpl(this);
	},

	recordRecentGhost(ghostName: string) {
		if (!ghostName) return;
		const MAX_RECENT = 8;
		try {
			const list = JSON.parse(
				localStorage.getItem("nanai_recent_ghosts") || "[]",
			);
			const next = [ghostName, ...list.filter((g: string) => g !== ghostName)];
			localStorage.setItem(
				"nanai_recent_ghosts",
				JSON.stringify(next.slice(0, MAX_RECENT)),
			);
		} catch (_err) {
			// LocalStorage 利用不可環境では無視
		}
	},

	async handleDressupToggle(payload: {
		category: string;
		part: string;
		scope?: number;
	}) {
		const sm = (this as unknown).surfaceManager;
		if (!sm || !payload?.category) return;
		const scopeId = Number.isFinite(payload.scope)
			? (payload.scope as number)
			: 0;
		const { category, part } = payload;

		const willOn =
			sm.dressupState.get(`${scopeId}__${category}__${part}`) !== true;

		let options: string[] = [];
		let siblingParts: unknown[] = [];
		if (sm.shellManifest) {
			const { bindMenuData } = await import("../../surface/bind-menu.js");
			const cat = bindMenuData(sm.shellManifest, scopeId).categories.find(
				(c: unknown) => c.category === category,
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
		const ghosts = (this as unknown).ghostController?.ghosts || [];
		if (ghosts.length <= 1) return;
		const currentName = (
			this as import("../../../main.js").NanaiAndroidMascotApp
		).ghostController?.currentGhost?.name;
		const idx = ghosts.findIndex((g: unknown) => g.name === currentName);
		const next = ghosts[(idx + 1) % ghosts.length];
		if (next)
			(
				this as import("../../../main.js").NanaiAndroidMascotApp
			).ghostController?.selectGhost?.(next.name);
	},

	applyShellScaleAction(action: string) {
		const scalePercent = parseInt(action.replace("scale-", ""), 10) || 100;
		const baseW = 200;
		const baseH = 400;
		const w = Math.round((baseW * scalePercent) / 100);
		const h = Math.round((baseH * scalePercent) / 100);
		const conf = SCALE_MAP[action] || { width: `${w}px`, height: `${h}px` };
		if ((this as unknown).elements.ghostDisplay) {
			(
				this as import("../../../main.js").NanaiAndroidMascotApp
			).elements.ghostDisplay.style.width = conf.width;
			(
				this as import("../../../main.js").NanaiAndroidMascotApp
			).elements.ghostDisplay.style.height = conf.height;
		}
		if (isTauriAvailable()) {
			invoke("set_character_scale", { scalePercent }).catch(() => {});
		}
		(this as unknown).showBalloon(
			`シェル倍率を ${scalePercent}% に変更しました`,
		);
		setTimeout(
			() =>
				(
					this as import("../../../main.js").NanaiAndroidMascotApp
				).hideBalloon(),
			1500,
		);
	},

	minimizeApp() {
		(this as unknown).hideMenu();
		try {
			(
				this as import("../../../main.js").NanaiAndroidMascotApp
			).ghostController.sendShioriEvent("OnWindowStateMinimize");
		} catch (_e) {}
		if (isTauriAvailable()) {
			invoke("minimize_app").catch((err) =>
				console.error("minimize_app failed:", err),
			);
		}
	},
};
