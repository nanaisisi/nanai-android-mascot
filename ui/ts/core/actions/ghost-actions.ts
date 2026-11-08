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
<<<<<<< HEAD
		const _ghost = (this as unknown).ghostController?.currentGhost;
		if (
			!ghost ||
			!(this as unknown).modalManager?.content ||
			!(this as unknown).modalManager?.overlay
=======
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		const ghost = (this as any).ghostController?.currentGhost;
		if (
			!ghost ||
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			!(this as any).modalManager?.content ||
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			!(this as any).modalManager?.overlay
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
		) {
			return;
		}

<<<<<<< HEAD
		const _escapeHtml = (_value: unknown) =>
=======
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		const escapeHtml = (_value: any) =>
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
			String(value ?? "不明")
				.replaceAll("&", "&amp;")
				.replaceAll("<", "&lt;")
				.replaceAll(">", "&gt;")
				.replaceAll('"', "&quot;")
				.replaceAll("'", "&#39;");
<<<<<<< HEAD
		const row = (label: string, value: unknown) =>
			`<div class="info-item"><strong>${escapeHtml(label)}:</strong> <span>${escapeHtml(value)}</span></div>`;

		(this as unknown).modalManager.content.innerHTML = `
=======
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		const row = (label: string, value: any) =>
			`<div class="info-item"><strong>${escapeHtml(label)}:</strong> <span>$escapeHtml(value)</span></div>`;

		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		(this as any).modalManager.content.innerHTML = `
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
      <h2>👻 ゴースト情報</h2>
      <div class="form-section">
        ${row("名前", ghost.name)}
        $row("バージョン", ghost.version)
        $row("さくら", ghost.sakura_name)
        $row("うにゅう", ghost.kero_name)
        $row("SHIORI", ghost.shiori)
        $row("作者", ghost.craftman)
        $row("作者 URL", ghost.craftman_url)
        $row("インストール先", ghost.path)
      </div>
      <div class="form-section" style="text-align: right;">
        <button id="modal-ok-btn" class="primary">OK</button>
      </div>
    `;
<<<<<<< HEAD
		(this as unknown).modalManager.overlay.style.display = "flex";
		(this as unknown).modalManager.showWindowIfNeeded?.();
		(this as unknown).modalManager.content
			.querySelector("#modal-ok-btn")
			?.addEventListener("click", () => (this as unknown).modalManager.hide());
	},

	async uninstallCurrentGhost() {
		const gc = (this as unknown).ghostController;
=======
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
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
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
<<<<<<< HEAD
			(this as unknown).showBalloon(`ゴースト「$name」を削除しました`);
			setTimeout(() => (this as unknown).hideBalloon(), 2500);
			await gc.scanGhosts();
			const _next = (gc.ghosts || []).find((g: unknown) => g.name !== name);
=======
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).showBalloon(`ゴースト「$name」を削除しました`);
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			setTimeout(() => (this as any).hideBalloon(), 2500);
			await gc.scanGhosts();
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			const next = (gc.ghosts || []).find((g: any) => g.name !== name);
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
			if (next) {
				await gc.selectGhost(next.name);
			} else {
				await gc.selectGhost(AppConfig.paths.fallbackGhostName);
			}
		} catch (err) {
			console.error("🗑️ アンインストール失敗:", err);
<<<<<<< HEAD
			(this as unknown).showBalloon(`アンインストールに失敗しました: $err`);
			setTimeout(() => (this as unknown).hideBalloon(), 3000);
=======
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).showBalloon(`アンインストールに失敗しました: $err`);
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			setTimeout(() => (this as any).hideBalloon(), 3000);
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
		}
	},

	async installGhostFromMenu() {
		if (!isTauriAvailable()) {
<<<<<<< HEAD
			return (this as unknown).modalManager?.show("install-modal-content");
		}
		const gc = (this as unknown).ghostController;
=======
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			return (this as any).modalManager?.show("install-modal-content");
		}
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		const gc = (this as any).ghostController;
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
		try {
			await gc?.sendShioriEvent?.(
				"OnInstallBegin",
				buildInstallBeginArgs("install"),
			);

<<<<<<< HEAD
			const result: unknown = await invoke("pick_and_install_ghost_archive");
			if (!result) return;

			await (this as unknown).ghostController.scanGhosts();
			await (this as unknown).scanBalloons();

			const importedGhost = (this as unknown).ghostController.ghosts.find(
				(ghost: unknown) => ghost.name === result.name,
=======
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
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
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
<<<<<<< HEAD
				(this as unknown).showBalloon?.(
					`ゴースト「$importedGhost.name」を導入しました`,
				);
				setTimeout(() => (this as unknown).hideBalloon?.(), 2000);
				await (this as unknown).ghostController?.selectGhost?.(
					importedGhost.name,
				);
				return;
			}
			const _importedBalloon = (this as unknown).availableBalloons?.find(
				(_balloon: unknown) =>
=======
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
				(_balloon: any) =>
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
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
<<<<<<< HEAD
				await (this as unknown).setBalloonTheme(importedBalloon.dir_name);
				(this as unknown).showBalloon(
					`バルーン「${importedBalloon.name}」を導入しました`,
				);
				setTimeout(() => (this as unknown).hideBalloon(), 2000);
=======
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				await (this as any).setBalloonTheme(importedBalloon.dir_name);
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				(this as any).showBalloon(
					`バルーン「${importedBalloon.name}」を導入しました`,
				);
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				setTimeout(() => (this as any).hideBalloon(), 2000);
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
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
<<<<<<< HEAD
			(this as unknown).modalManager?.showNotification(
=======
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).modalManager?.showNotification(
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
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
<<<<<<< HEAD
		const _sm = (this as unknown).surfaceManager;
=======
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		const sm = (this as any).surfaceManager;
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
		if (!sm || !payload?.category) return;
		const scopeId = Number.isFinite(payload.scope)
			? (payload.scope as number)
			: 0;
		const { category, part } = payload;

		const willOn =
			sm.dressupState.get(`${scopeId}__${category}__${part}`) !== true;

		let options: string[] = [];
<<<<<<< HEAD
		let siblingParts: unknown[] = [];
		if (sm.shellManifest) {
			const { bindMenuData } = await import("../../surface/bind-menu.js");
			const _cat = bindMenuData(sm.shellManifest, scopeId).categories.find(
				(c: unknown) => c.category === category,
=======
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		let siblingParts: any[] = [];
		if (sm.shellManifest) {
			const { bindMenuData } = await import("../../surface/bind-menu.js");
			const cat = bindMenuData(sm.shellManifest, scopeId).categories.find(
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				(c: any) => c.category === category,
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
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
<<<<<<< HEAD
		const _ghosts = (this as unknown).ghostController?.ghosts || [];
		if (ghosts.length <= 1) return;
		const currentName = (this as unknown).ghostController?.currentGhost?.name;
		const _idx = ghosts.findIndex((g: unknown) => g.name === currentName);
		const next = ghosts[(idx + 1) % ghosts.length];
		if (next) (this as unknown).ghostController?.selectGhost?.(next.name);
=======
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
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
	},

	applyShellScaleAction(action: string) {
		const conf = SCALE_MAP[action] || SCALE_MAP["scale-100"];
		const scalePercent = parseInt(action.replace("scale-", ""), 10) || 100;
<<<<<<< HEAD
		if ((this as unknown).elements.ghostDisplay) {
			(this as unknown).elements.ghostDisplay.style.width = conf.width;
			(this as unknown).elements.ghostDisplay.style.height = conf.height;
=======
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		if ((this as any).elements.ghostDisplay) {
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).elements.ghostDisplay.style.width = conf.width;
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).elements.ghostDisplay.style.height = conf.height;
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
		}
		if (isTauriAvailable()) {
			invoke("set_character_scale", { scalePercent }).catch(() => {});
		}
<<<<<<< HEAD
		(this as unknown).showBalloon(
			`シェル倍率を $scalePercent% に変更しました`,
		);
		setTimeout(() => (this as unknown).hideBalloon(), 1500);
	},

	minimizeApp() 
		(this as unknown).hideMenu();
		try {
			(this as unknown).ghostController.sendShioriEvent(
				"OnWindowStateMinimize",
			);
=======
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		(this as any).showBalloon(`シェル倍率を $scalePercent% に変更しました`);
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		setTimeout(() => (this as any).hideBalloon(), 1500);
	},

	minimizeApp() 
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		(this as any).hideMenu();
		try {
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).ghostController.sendShioriEvent("OnWindowStateMinimize");
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
		} catch (_e) {}
		if (isTauriAvailable()) {
			invoke("minimize_app").catch((err) =>
				console.error("minimize_app failed:", err),
			);
		},;
