/**
 * @file app-actions.ts
 * @brief アプリケーションメニューアクション・SHIORIイベント連携・ゴースト切り替え・バルーンテーマ切り替え制御モジュール (UKADOC準拠)
 *
 * 参考仕様:
 * - OnChoiceSelect: リコメンド・ポータル等の選択イベント
 * - OnUpdate: ネットワーク更新トリガー
 * - OnHeadline: ヘッドラインセンス参照
 * - OnBoot: 起動時イベント
 */
import { balloonActions } from "./actions/balloon-actions.js";
import { ghostActions } from "./actions/ghost-actions.js";
import { networkActions } from "./actions/network-actions.js";
import { AppConfig } from "./config.js";
import { invoke, isTauriAvailable } from "./tauri-helper.js";

const THEME_LABELS: Record<string, string> = {
	ivory: "アイボリー（象牙色レトロ）",
	pixel: "ドット絵・ピクセル風（レトロゲーム）",
	comic: "ポップコミック（太枠丸み）",
	dark: "サイバーダーク（夜間・ハイコントラスト）",
};

/** SHIORIイベントへ単純転送するアクション */
const SHIORI_ACTIONS: Record<string, any> = {
	recommend: ["OnChoiceSelect", ["recommendlink"]],
	portal: ["OnChoiceSelect", ["portal"]],
	update: ["OnUpdate"],
	headline: ["OnHeadline"],
};

export const actionMethods = {
	...balloonActions,
	...ghostActions,
	...networkActions,

	handleMenuAction(action: string, payload: any = null) {
		if (!action) return;
		const gc = (this as any).ghostController;

		if (action === "talk") {
			const scopeId =
				payload && typeof payload === "object" && "scope" in payload
					? payload.scope
					: 0;
			return (this as any).onGhostClick(undefined, undefined, undefined, scopeId);
		}

		if (action === "update") {
			return (this as any).startNetworkUpdate();
		}

		if (action === "updatecheck") {
			return (this as any).startNetworkUpdate(null, { checkOnly: true });
		}

		if (action === "ghost-info") {
			return (this as any).showGhostInformation();
		}
		if (action === "explorer") {
			return (this as any).modalManager?.show("explorer-modal-content");
		}
		if (action === "backlog") {
			return (this as any).modalManager?.show("backlog-modal-content");
		}
		if (action === "reload-ghost") {
			const currentName =
				gc.currentGhost?.name || AppConfig.paths.fallbackGhostName;
			return gc.selectGhost(currentName).then(() => {
				(this as any).showBalloon("🔄 ゴーストを再読み込みしました");
				setTimeout(() => (this as any).hideBalloon(), 2000);
			});
		}
		if (action === "reset-shell-position" || action === "resetwindowpos") {
			if ((this as any).elements?.ghostDisplay) {
				(this as any).elements.ghostDisplay.style.left = "";
				(this as any).elements.ghostDisplay.style.top = "";
				(this as any).elements.ghostDisplay.style.transform = "";
				(this as any).elements.ghostDisplay.classList.remove(
					"is-docked-left",
					"is-docked-right",
				);
			}
			if (isTauriAvailable()) {
				invoke("set_character_scale", { scale: 1.0 }).catch(() => {});
			}
			(this as any).showBalloon("📍 シェル位置・倍率を初期リセットしました");
			setTimeout(() => (this as any).hideBalloon(), 2000);
			return;
		}
		if (action === "reset-balloon-position" || action === "resetballoonpos") {
			if ((this as any).interactionManager) {
				(this as any).interactionManager.balloonOffsetX = 0;
				(this as any).interactionManager.balloonOffsetY = 0;
			}
			if (typeof localStorage !== "undefined") {
				try {
					localStorage.removeItem("nanai_balloon_offset");
				} catch (_e) {}
			}
			if (isTauriAvailable()) {
				invoke("set_balloon_offset", { scopeId: 0, x: 0, y: 0 }).catch(
					() => {},
				);
				invoke("set_balloon_offset", { scopeId: 1, x: 0, y: 0 }).catch(
					() => {},
				);
			}
			(this as any).showBalloon("📍 バルーン位置を初期リセットしました");
			setTimeout(() => (this as any).hideBalloon(), 2000);
			return;
		}
		if (action === "close-balloon") {
			return (this as any).hideBalloon();
		}
		if (action === "keep-temporary-ghost") {
			const gc = (this as any).ghostController;
			if (gc.currentGhost?.isTemporary) {
				gc.currentGhost.isTemporary = false;
				(this as any).showBalloon("📌 一時起動ゴーストを通常起動状態として保持しました");
				gc.sendShioriEvent("OnBoot");
			} else {
				(this as any).showBalloon("⚠️ 一時起動中のゴーストではありません");
			}
			setTimeout(() => (this as any).hideBalloon(), 2000);
			return;
		}

		if (action === "biff" || action === "mail") {
			return (this as any).checkEmail();
		}

		if (SHIORI_ACTIONS[action]) {
			gc.sendShioriEvent(...SHIORI_ACTIONS[action]);
			return;
		}

		if (action === "scan") {
			return gc.scanGhosts().then(() => {
				(this as any).syncMenuGhosts?.();
				(this as any).showBalloon("🔄 ゴーストフォルダを再スキャンしました");
				setTimeout(() => (this as any).hideBalloon(), 2000);
			});
		}
		if (
			action === "open-ghost-folder" ||
			action === "openghostfolder" ||
			action === "open-ghost-directory"
		) {
			if (isTauriAvailable()) {
				invoke("open_ghost_directory")
					.then(() => {
						(this as any).showBalloon("📁 ゴーストフォルダを開きました");
						setTimeout(() => (this as any).hideBalloon(), 2000);
					})
					.catch((e) => console.error(e));
			} else {
				(this as any).showBalloon("📁 ゴーストフォルダを開く機能はアプリ版でのみ利用可能です");
				setTimeout(() => (this as any).hideBalloon(), 2000);
			}
			return;
		}
		if (
			action === "uninstall-ghost" ||
			action === "uninstall" ||
			action === "uninstallghost" ||
			action === "delete-ghost"
		) {
			return (this as any).uninstallCurrentGhost();
		}
		if (
			action === "install" ||
			action === "install-ghost" ||
			action === "installghost" ||
			action === "add-ghost"
		) {
			return (this as any).installGhostFromMenu();
		}
		if (action === "balloon" || action === "balloon-cycle")
			return (this as any).cycleBalloonTheme();
		if (action.startsWith("balloon-theme-")) {
			const theme = action.replace("balloon-theme-", "");
			(this as any).setBalloonTheme(theme);
			let label = THEME_LABELS[theme] || theme;
			if ((this as any).availableBalloons) {
				const bInfo = (this as any).availableBalloons.find(
					(b: any) => b.dir_name === theme,
				);
				if (bInfo) label = bInfo.name;
			}
			(this as any).showBalloon(`バルーンスキンを「${label}」に変更しました`);
			setTimeout(() => (this as any).hideBalloon(), 2000);
			return;
		}
		if (action.startsWith("scale-")) return (this as any).applyShellScaleAction(action);
		if (action.startsWith("balloon-scale-"))
			return (this as any).applyBalloonScaleAction(action);
		if (action === "close" || action === "exit") return (this as any).closeApp();
		if (action === "close-all" || action === "exit-all") return (this as any).closeApp();
		if (action === "close-menu") return;
		if (action === "minimize") return (this as any).minimizeApp();
		if (
			(action === "switch-to-ghost" || action === "switch-ghost") &&
			payload
		) {
			const ghostName =
				typeof payload === "string"
					? payload
					: payload.name || payload.ghostName;
			if (ghostName) return gc.selectGhost(ghostName);
		}
		if (action === "call-ghost" && payload) {
			const ghostName =
				typeof payload === "string"
					? payload
					: payload.name || payload.ghostName;
			if (ghostName) return (this as any).callGhost(ghostName);
		}
		if (action === "recent-ghost" && payload) {
			const ghostName =
				typeof payload === "string"
					? payload
					: payload.name || payload.ghostName;
			if (ghostName) return gc.selectGhost(ghostName);
		}
		if (
			(action === "switch-to-shell" || action === "switch-shell") &&
			payload
		) {
			const shellName =
				typeof payload === "string"
					? payload
					: payload.name || payload.shellName;
			if (shellName) return gc.selectShell(shellName);
		}
		if (action === "dressup-toggle" && payload) {
			return (this as any).handleDressupToggle(payload);
		}

		const modalKey = action === "ghost-switch" ? "ghost" : action;
		(this as any).modalManager?.show(`${modalKey}-modal-content`);
	},
};
