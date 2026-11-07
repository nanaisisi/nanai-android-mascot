/**
 * @file ghost-actions.ts
 * @brief ゴースト管理・インストール・アンインストール・着せ替え・倍率設定モジュール (UKADOC準拠)
 *
 * 準拠仕様:
 * - OnInstallBegin: インストール開始通知 (Ref0=識別子)
 * - OnInstallComplete / OnInstallCompleteEx: インストール完了通知 (Ref0=種別, Ref1=名前, Ref2=パス, Ref3=スクリプト)
 * - OnInstallFailure: インストール失敗通知 (Ref0=失敗理由)
 * - OnWindowStateMinimize / OnWindowStateRestore: ウィンドウ最小化・復元イベント
 * - uninstall_ghost: ゴーストファイル削除・アンインストール処理
 */
import { AppConfig } from "../config.js";
import { invoke, isTauriAvailable } from "../tauri-helper.js";
import {
	buildInstallBeginArgs,
	buildInstallCompleteArgs,
	buildInstallCompleteExArgs,
	buildInstallFailureArgs,
} from "./install-protocol.js";

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
		const ghost = (this as any).ghostController?.currentGhost;
		if (
			!ghost ||
			!(this as any).modalManager?.content ||
			!(this as any).modalManager?.overlay
		) {
			return;
		}

		const escapeHtml = (value: any) =>
			String(value ?? "不明")
				.replaceAll("&", "&amp;")
				.replaceAll("<", "&lt;")
				.replaceAll(">", "&gt;")
				.replaceAll('"', "&quot;")
				.replaceAll("'", "&#39;");
		const row = (label: string, value: any) =>
			`<div class="info-item"><strong>${escapeHtml(label)}:</strong> <span>${escapeHtml(value)}</span></div>`;

		(this as any).modalManager.content.innerHTML = `
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
		(this as any).modalManager.overlay.style.display = "flex";
		(this as any).modalManager.showWindowIfNeeded?.();
		(this as any).modalManager.content
			.querySelector("#modal-ok-btn")
			?.addEventListener("click", () => (this as any).modalManager.hide());
	},

	async uninstallCurrentGhost() {
		const gc = (this as any).ghostController;
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
			(this as any).showBalloon(`ゴースト「${name}」を削除しました`);
			setTimeout(() => (this as any).hideBalloon(), 2500);
			await gc.scanGhosts();
			const next = (gc.ghosts || []).find((g: any) => g.name !== name);
			if (next) {
				await gc.selectGhost(next.name);
			} else {
				await gc.selectGhost(AppConfig.paths.fallbackGhostName);
			}
		} catch (err) {
			console.error("🗑️ アンインストール失敗:", err);
			(this as any).showBalloon(`アンインストールに失敗しました: ${err}`);
			setTimeout(() => (this as any).hideBalloon(), 3000);
		}
	},

	async installGhostFromMenu() {
		if (!isTauriAvailable()) {
			return (this as any).modalManager?.show("install-modal-content");
		}
		const gc = (this as any).ghostController;
		try {
			await gc?.sendShioriEvent?.(
				"OnInstallBegin",
				buildInstallBeginArgs("install"),
			);

			const result: any = await invoke("pick_and_install_ghost_archive");
			if (!result) return;

			await (this as any).ghostController.scanGhosts();
			await (this as any).scanBalloons();

			const importedGhost = (this as any).ghostController.ghosts.find(
				(ghost: any) => ghost.name === result.name,
			);
			if (importedGhost) {
				await gc?.sendShioriEvent?.(
					"OnInstallCompleteEx",
					buildInstallCompleteExArgs("ghost", result.name, result.path || ""),
				);
				await gc?.sendShioriEvent?.(
					"OnInstallComplete",
					buildInstallCompleteArgs("ghost", result.name, result.path || ""),
				);
				(this as any).showBalloon?.(
					`ゴースト「${importedGhost.name}」を導入しました`,
				);
				setTimeout(() => (this as any).hideBalloon?.(), 2000);
				await (this as any).ghostController?.selectGhost?.(importedGhost.name);
				return;
			}
			const importedBalloon = (this as any).availableBalloons?.find(
				(balloon: any) =>
					balloon.name === result.name || balloon.dir_name === result.name,
			);
			if (importedBalloon) {
				await gc?.sendShioriEvent?.(
					"OnInstallCompleteEx",
					buildInstallCompleteExArgs(
						"balloon",
						importedBalloon.name,
						importedBalloon.dir_name,
					),
				);
				await gc?.sendShioriEvent?.(
					"OnInstallComplete",
					buildInstallCompleteArgs("balloon", importedBalloon.name),
				);
				await (this as any).setBalloonTheme(importedBalloon.dir_name);
				(this as any).showBalloon(
					`バルーン「${importedBalloon.name}」を導入しました`,
				);
				setTimeout(() => (this as any).hideBalloon(), 2000);
				return;
			}

			await gc?.sendShioriEvent?.(
				"OnInstallComplete",
				buildInstallCompleteArgs("package", result.name),
			);
		} catch (error) {
			console.error("メニューからのゴースト取り込みに失敗しました:", error);
			await gc?.sendShioriEvent?.(
				"OnInstallFailure",
				buildInstallFailureArgs(error),
			);
			(this as any).modalManager?.showNotification(
				"ゴースト取り込み失敗",
				String(error),
				true,
			);
		}
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
		const sm = (this as any).surfaceManager;
		if (!sm || !payload?.category) return;
		const scopeId = Number.isFinite(payload.scope)
			? (payload.scope as number)
			: 0;
		const { category, part } = payload;

		const willOn =
			sm.dressupState.get(`${scopeId}__${category}__${part}`) !== true;

		let options: string[] = [];
		let siblingParts: any[] = [];
		if (sm.shellManifest) {
			const { bindMenuData } = await import("../../surface/bind-menu.js");
			const cat = bindMenuData(sm.shellManifest, scopeId).categories.find(
				(c: any) => c.category === category,
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
		const ghosts = (this as any).ghostController?.ghosts || [];
		if (ghosts.length <= 1) return;
		const currentName = (this as any).ghostController?.currentGhost?.name;
		const idx = ghosts.findIndex((g: any) => g.name === currentName);
		const next = ghosts[(idx + 1) % ghosts.length];
		if (next) (this as any).ghostController?.selectGhost?.(next.name);
	},

	applyShellScaleAction(action: string) {
		const conf = SCALE_MAP[action] || SCALE_MAP["scale-100"];
		const scalePercent = parseInt(action.replace("scale-", ""), 10) || 100;
		if ((this as any).elements.ghostDisplay) {
			(this as any).elements.ghostDisplay.style.width = conf.width;
			(this as any).elements.ghostDisplay.style.height = conf.height;
		}
		if (isTauriAvailable()) {
			invoke("set_character_scale", { scalePercent }).catch(() => {});
		}
		(this as any).showBalloon(`シェル倍率を ${scalePercent}% に変更しました`);
		setTimeout(() => (this as any).hideBalloon(), 1500);
	},

	minimizeApp() {
		(this as any).hideMenu();
		try {
			(this as any).ghostController.sendShioriEvent("OnWindowStateMinimize");
		} catch (_e) {}
		if (isTauriAvailable()) {
			invoke("minimize_app").catch((err) =>
				console.error("minimize_app failed:", err),
			);
		}
	},
};
