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
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		const ghost = (this as any).ghostController?.currentGhost;
		if (
			!ghost ||
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			!(this as any).modalManager?.content ||
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			!(this as any).modalManager?.overlay
		) {
			return;
		}

		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		const escapeHtml = (value: any) =>
			String(value ?? "不明")
				.replaceAll("&", "&amp;")
				.replaceAll("<", "&lt;")
				.replaceAll(">", "&gt;")
				.replaceAll('"', "&quot;")
				.replaceAll("'", "&#39;");
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		const row = (label: string, value: any) =>
			`<div class="info-item"><strong>${escapeHtml(label)}:</strong> <span>${escapeHtml(value)}</span></div>`;

		// biome-ignore lint/suspicious/noExplicitAny: automated fix
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
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		(this as any).modalManager.overlay.style.display = "flex";
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		(this as any).modalManager.showWindowIfNeeded?.();
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		(this as any).modalManager.content
			.querySelector("#modal-ok-btn")
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			?.addEventListener("click", () => (this as any).modalManager.hide());
	},

	async uninstallCurrentGhost() {
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
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
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).showBalloon(`ゴースト「${name}」を削除しました`);
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			setTimeout(() => (this as any).hideBalloon(), 2500);
			await gc.scanGhosts();
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			const next = (gc.ghosts || []).find((g: any) => g.name !== name);
			if (next) {
				await gc.selectGhost(next.name);
			} else {
				await gc.selectGhost(AppConfig.paths.fallbackGhostName);
			}
		} catch (err) {
			console.error("🗑️ アンインストール失敗:", err);
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).showBalloon(`アンインストールに失敗しました: ${err}`);
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			setTimeout(() => (this as any).hideBalloon(), 3000);
		}
	},

	async installGhostFromMenu() {
		if (!isTauriAvailable()) {
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			return (this as any).modalManager?.show("install-modal-content");
		}
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		const gc = (this as any).ghostController;
		try {
			await gc?.sendShioriEvent?.(
				"OnInstallBegin",
				buildInstallBeginArgs("install"),
			);

			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			const result: any = await invoke("pick_and_install_ghost_archive");
			if (!result) return;

			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			await (this as any).ghostController.scanGhosts();
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			await (this as any).scanBalloons();

			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			const importedGhost = (this as any).ghostController.ghosts.find(
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
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
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				(this as any).showBalloon?.(
					`ゴースト「${importedGhost.name}」を導入しました`,
				);
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				setTimeout(() => (this as any).hideBalloon?.(), 2000);
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				await (this as any).ghostController?.selectGhost?.(importedGhost.name);
				return;
			}
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			const importedBalloon = (this as any).availableBalloons?.find(
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
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
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				await (this as any).setBalloonTheme(importedBalloon.dir_name);
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				(this as any).showBalloon(
					`バルーン「${importedBalloon.name}」を導入しました`,
				);
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
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
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
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
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		const sm = (this as any).surfaceManager;
		if (!sm || !payload?.category) return;
		const scopeId = Number.isFinite(payload.scope)
			? (payload.scope as number)
			: 0;
		const { category, part } = payload;

		const willOn =
			sm.dressupState.get(`${scopeId}__${category}__${part}`) !== true;

		let options: string[] = [];
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		let siblingParts: any[] = [];
		if (sm.shellManifest) {
			const { bindMenuData } = await import("../../surface/bind-menu.js");
			const cat = bindMenuData(sm.shellManifest, scopeId).categories.find(
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
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
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		const ghosts = (this as any).ghostController?.ghosts || [];
		if (ghosts.length <= 1) return;
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		const currentName = (this as any).ghostController?.currentGhost?.name;
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		const idx = ghosts.findIndex((g: any) => g.name === currentName);
		const next = ghosts[(idx + 1) % ghosts.length];
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		if (next) (this as any).ghostController?.selectGhost?.(next.name);
	},

	applyShellScaleAction(action: string) {
		const conf = SCALE_MAP[action] || SCALE_MAP["scale-100"];
		const scalePercent = parseInt(action.replace("scale-", ""), 10) || 100;
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		if ((this as any).elements.ghostDisplay) {
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).elements.ghostDisplay.style.width = conf.width;
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).elements.ghostDisplay.style.height = conf.height;
		}
		if (isTauriAvailable()) {
			invoke("set_character_scale", { scalePercent }).catch(() => {});
		}
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		(this as any).showBalloon(`シェル倍率を ${scalePercent}% に変更しました`);
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		setTimeout(() => (this as any).hideBalloon(), 1500);
	},

	minimizeApp() {
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		(this as any).hideMenu();
		try {
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).ghostController.sendShioriEvent("OnWindowStateMinimize");
		} catch (_e) {}
		if (isTauriAvailable()) {
			invoke("minimize_app").catch((err) =>
				console.error("minimize_app failed:", err),
			);
		}
	},
};
