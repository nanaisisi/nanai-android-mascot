/**
 * @file ghost-actions.ts
 * @brief ゴースト管理・インストール・アンインストール・着せ替え・倍率設定モジュール (UKADOC準拠)
 */
import { AppConfig } from "../config.js";
import { invoke, isTauriAvailable } from "../tauri-helper.js";

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
		const app =
			this as unknown as import("../../../main.js").NanaiAndroidMascotApp;
		const ghost = app.ghostController?.currentGhost;
		const modal = app.modalManager;
		if (!ghost || !modal?.content || !modal?.overlay) {
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

		modal.content.innerHTML = `
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
		modal.overlay.style.display = "flex";
		modal.showWindowIfNeeded?.();
		modal.content
			.querySelector("#modal-ok-btn")
			?.addEventListener("click", () => modal.hide());
	},

	async uninstallCurrentGhost() {
		const gc = (
			this as unknown as import("../../../main.js").NanaiAndroidMascotApp
		).ghostController;
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
			(
				this as unknown as import("../../../main.js").NanaiAndroidMascotApp
			).showBalloon(`ゴースト「${name}」を削除しました`);
			setTimeout(
				() =>
					(
						this as unknown as import("../../../main.js").NanaiAndroidMascotApp
					).hideBalloon(),
				2500,
			);
			await gc.scanGhosts?.();
			const next = (gc.ghosts || []).find(
				(g: { name?: string }) => g.name !== name,
			);
			if (next?.name) {
				await gc.selectGhost?.(next.name);
			} else {
				await gc.selectGhost?.(AppConfig.paths.fallbackGhostName);
			}
		} catch (err) {
			console.error("🗑️ アンインストール失敗:", err);
			(
				this as unknown as import("../../../main.js").NanaiAndroidMascotApp
			).showBalloon(`アンインストールに失敗しました: ${err}`);
			setTimeout(
				() =>
					(
						this as unknown as import("../../../main.js").NanaiAndroidMascotApp
					).hideBalloon(),
				3000,
			);
		}
	},

	async installGhostFromMenu(
		this: import("../../../main.js").NanaiAndroidMascotApp,
	) {
		const { installGhostFromMenuImpl } = await import(
			"./ghost-install-action.js"
		);
		return installGhostFromMenuImpl(
			this as unknown as import("./ghost-install-action.js").GhostInstallContext,
		);
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
		const sm = (
			this as unknown as import("../../../main.js").NanaiAndroidMascotApp
		).surfaceManager;
		if (!sm || !payload?.category) return;
		const scopeId = Number.isFinite(payload.scope)
			? (payload.scope as number)
			: 0;
		const { category, part } = payload;

		const willOn =
			sm.dressupState.get(`${scopeId}__${category}__${part}`) !== true;

		let options: string[] = [];
		let siblingParts: { part: string }[] = [];
		if (sm.shellManifest) {
			const { bindMenuData } = await import("../../surface/bind-menu.js");
			const cat = bindMenuData(sm.shellManifest, scopeId).categories.find(
				(c: {
					category: string;
					options?: string[];
					parts?: { part: string }[];
				}) => c.category === category,
			);
			options = cat?.options ?? [];
			siblingParts = (cat?.parts ?? []) as { part: string }[];
		}
		if (willOn && options.includes("mustselect")) {
			for (const p of siblingParts) {
				if (p.part === part) continue;
				sm.bindDressup(category, p.part, "0", scopeId);
			}
		}

		return sm.bindDressup(category, part, willOn ? "1" : "0", scopeId);
	},

	switchToNextGhost() {
		const ghosts =
			(this as unknown as import("../../../main.js").NanaiAndroidMascotApp)
				.ghostController?.ghosts || [];
		if (ghosts.length <= 1) return;
		const currentName = (
			this as unknown as import("../../../main.js").NanaiAndroidMascotApp
		).ghostController?.currentGhost?.name;
		const idx = ghosts.findIndex(
			(g: { name?: string }) => g.name === currentName,
		);
		const next = ghosts[(idx + 1) % ghosts.length];
		if (next)
			(
				this as unknown as import("../../../main.js").NanaiAndroidMascotApp
			).ghostController?.selectGhost?.(next.name);
	},

	applyShellScaleAction(action: string) {
		const scalePercent = parseInt(action.replace("scale-", ""), 10) || 100;
		const baseW = 200;
		const baseH = 400;
		const w = Math.round((baseW * scalePercent) / 100);
		const h = Math.round((baseH * scalePercent) / 100);
		const conf = SCALE_MAP[action] || { width: `${w}px`, height: `${h}px` };
		const ghostDisplay = (
			this as unknown as import("../../../main.js").NanaiAndroidMascotApp
		).elements?.ghostDisplay;
		if (ghostDisplay) {
			ghostDisplay.style.width = conf.width;
			ghostDisplay.style.height = conf.height;
		}
		if (isTauriAvailable()) {
			invoke("set_character_scale", { scalePercent }).catch(() => {});
		}
		(
			this as unknown as import("../../../main.js").NanaiAndroidMascotApp
		).showBalloon(`シェル倍率を ${scalePercent}% に変更しました`);
		setTimeout(
			() =>
				(
					this as unknown as import("../../../main.js").NanaiAndroidMascotApp
				).hideBalloon(),
			1500,
		);
	},

	minimizeApp() {
		(
			this as unknown as import("../../../main.js").NanaiAndroidMascotApp
		).hideMenu();
		try {
			(
				this as unknown as import("../../../main.js").NanaiAndroidMascotApp
			).ghostController.sendShioriEvent("OnWindowStateMinimize");
		} catch (_e) {}
		if (isTauriAvailable()) {
			invoke("minimize_app").catch((err) =>
				console.error("minimize_app failed:", err),
			);
		}
	},
};
