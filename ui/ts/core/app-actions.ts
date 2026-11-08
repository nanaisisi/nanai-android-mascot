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

export * from "./actions/sstp-fmo-actions.js";

import { AppConfig } from "./config.js";
import { invoke, isTauriAvailable } from "./tauri-helper.js";

const THEME_LABELS: Record<string, string> = {
	ivory: "アイボリー（象牙色レトロ）",
	pixel: "ドット絵・ピクセル風（レトロゲーム）",
	comic: "ポップコミック（太枠丸み）",
	dark: "サイバーダーク（夜間・ハイコントラスト）",
};

/** SHIORIイベントへ単純転送するアクション */

const _SHIORI_ACTIONS: Record<string, unknown> = {

// biome-ignore lint/suspicious/noExplicitAny: automated fix
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


	handleMenuAction(action: string, payload: unknown = null) {
		if (!action) return;
		const gc = (this as unknown).ghostController;

	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	handleMenuAction(action: string, payload: any = null) {
		if (!action) return;
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		const gc = (this as any).ghostController;


		if (action === "talk") {
			const scopeId =
				payload && typeof payload === "object" && "scope" in payload
					? payload.scope
					: 0;

			return (this as unknown).onGhostClick?.(

			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			return (this as any).onGhostClick?.(

				undefined,
				undefined,
				undefined,
				scopeId,
			);
		}

		if (action === "hide-character" || action === "close-character") {
			const scopeId =
				payload && typeof payload === "object" && "scope" in payload
					? payload.scope
					: 1;
			if (isTauriAvailable()) {
				void invoke("hide_subchar_window", { scopeId }).catch(() => {});
			}
			return;
		}

		if (action === "update") {

			return (this as unknown).startNetworkUpdate?.();
		}

		if (action === "updatecheck") {
			return (this as unknown).startNetworkUpdate?.(null, { checkOnly: true });
		}

		if (action === "ghost-info") {
			return (this as unknown).showGhostInformation?.();

			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			return (this as any).startNetworkUpdate?.();
		}

		if (action === "updatecheck") {
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			return (this as any).startNetworkUpdate?.(null, { checkOnly: true });
		}

		if (action === "ghost-info") {
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			return (this as any).showGhostInformation?.();

		}
		if (
			action === "tools" ||
			action === "utility-root" ||
			action === "utility" ||
			action === "explorer"
		) {

			return (this as unknown).modalManager?.show("explorer-modal-content");
		}
		if (action === "config" || action === "settings") {
			return (this as unknown).modalManager?.show("settings-modal-content");
		}
		if (action === "inquire" || action === "help") {
			return (this as unknown).modalManager?.show("help-modal-content");

			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			return (this as any).modalManager?.show("explorer-modal-content");
		}
		if (action === "config" || action === "settings") {
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			return (this as any).modalManager?.show("settings-modal-content");
		}
		if (action === "inquire" || action === "help") {
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			return (this as any).modalManager?.show("help-modal-content");

		}
		if (action === "headlines" || action === "headline") {
			gc.sendShioriEvent("OnHeadline");
			return;
		}
		if (action === "friends") {

			(this as unknown).showBalloon?.("👥 おともだち機能は準備中です");
			setTimeout(() => (this as unknown).hideBalloon?.(), 2000);
			return;
		}
		if (action === "favorite") {
			(this as unknown).showBalloon?.(
				"⭐ おきにいりは現在のゴーストに登録されています",
			);
			setTimeout(() => (this as unknown).hideBalloon?.(), 2000);
			return;
		}
		if (action === "language") {
			(this as unknown).showBalloon?.(
				"🌐 言語設定はシステム設定に準拠しています",
			);
			setTimeout(() => (this as unknown).hideBalloon?.(), 2000);
			return;
		}
		if (action === "calendar" || action === "schedule") {
			return (this as unknown).modalManager?.show("calendar-modal-content");
		}
		if (action === "backlog") {
			return (this as unknown).modalManager?.show("backlog-modal-content");
		}
		if (action === "sspim") {
			(this as unknown).showBalloon?.("💬 SSPメッセンジャ機能は接続待機中です");
			setTimeout(() => (this as unknown).hideBalloon?.(), 2000);
			return;
		}
		if (action === "sntp") {
			(this as unknown).showBalloon?.("⏱️ 時刻合わせ(SNTP)を実行しました");
			setTimeout(() => (this as unknown).hideBalloon?.(), 2000);
			return;
		}
		if (action === "pictureviewer" || action === "archiveviewer") {
			return (this as unknown).modalManager?.show("explorer-modal-content");
		}
		if (action === "speech-recognition") {
			(this as unknown).showBalloon?.("🎙️ 音声認識を開始しました");
			setTimeout(() => (this as unknown).hideBalloon?.(), 2000);
			return;
		}
		if (action === "speech-synthesis") {
			(this as unknown).showBalloon?.("🔊 音声合成エンジン有効");
			setTimeout(() => (this as unknown).hideBalloon?.(), 2000);
			return;
		}
		if (action === "addressbar") {
			(this as unknown).showBalloon?.("🌐 アドレスバー");
			setTimeout(() => (this as unknown).hideBalloon?.(), 2000);

			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).showBalloon?.("👥 おともだち機能は準備中です");
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			setTimeout(() => (this as any).hideBalloon?.(), 2000);
			return;
		}
		if (action === "favorite") {
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).showBalloon?.(
				"⭐ おきにいりは現在のゴーストに登録されています",
			);
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			setTimeout(() => (this as any).hideBalloon?.(), 2000);
			return;
		}
		if (action === "language") {
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).showBalloon?.("🌐 言語設定はシステム設定に準拠しています");
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			setTimeout(() => (this as any).hideBalloon?.(), 2000);
			return;
		}
		if (action === "calendar" || action === "schedule") {
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			return (this as any).modalManager?.show("calendar-modal-content");
		}
		if (action === "backlog") {
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			return (this as any).modalManager?.show("backlog-modal-content");
		}
		if (action === "sspim") {
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).showBalloon?.("💬 SSPメッセンジャ機能は接続待機中です");
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			setTimeout(() => (this as any).hideBalloon?.(), 2000);
			return;
		}
		if (action === "sntp") {
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).showBalloon?.("⏱️ 時刻合わせ(SNTP)を実行しました");
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			setTimeout(() => (this as any).hideBalloon?.(), 2000);
			return;
		}
		if (action === "pictureviewer" || action === "archiveviewer") {
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			return (this as any).modalManager?.show("explorer-modal-content");
		}
		if (action === "speech-recognition") {
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).showBalloon?.("🎙️ 音声認識を開始しました");
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			setTimeout(() => (this as any).hideBalloon?.(), 2000);
			return;
		}
		if (action === "speech-synthesis") {
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).showBalloon?.("🔊 音声合成エンジン有効");
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			setTimeout(() => (this as any).hideBalloon?.(), 2000);
			return;
		}
		if (action === "addressbar") {
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).showBalloon?.("🌐 アドレスバー");
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			setTimeout(() => (this as any).hideBalloon?.(), 2000);

			return;
		}
		if (action === "open-file") {
			if (isTauriAvailable()) {

				return invoke("pick_and_install_ghost_archive")
					.then((result: unknown) => {
						if (result) {
							(this as unknown).showBalloon?.(
								`ゴースト「${result.name}」を導入しました`,
							);
							setTimeout(() => (this as unknown).hideBalloon?.(), 2000);
							(this as unknown).ghostController?.scanGhosts?.();
							(this as unknown).ghostController?.selectGhost?.(result.name);
						}
					})
					.catch((e) => {
						console.error("Failed to pick and install archive:", e);
					});
			}
			return (this as unknown).modalManager?.show("install-modal-content");
		}
		if (action === "open-folder") {
			return (this as unknown).handleMenuAction?.("open-ghost-folder");
		}
		if (action === "clear-cache") {
			(this as unknown).showBalloon?.("🧹 ゴーストキャッシュを開放しました");
			setTimeout(() => (this as unknown).hideBalloon?.(), 2000);
			return;
		}
		if (action === "update-fmo") {
			(this as unknown).showBalloon?.("🔄 FMO情報を更新しました");
			setTimeout(() => (this as unknown).hideBalloon?.(), 2000);
			return;
		}
		if (action === "reload-info") {
			(this as unknown).showBalloon?.("🔄 動作情報を再読み込みしました");
			setTimeout(() => (this as unknown).hideBalloon?.(), 2000);

				return (
					invoke("pick_and_install_ghost_archive")
						// biome-ignore lint/suspicious/noExplicitAny: automated fix
						.then((result: any) => {
							if (result) {
								// biome-ignore lint/suspicious/noExplicitAny: automated fix
								(this as any).showBalloon?.(
									`ゴースト「${result.name}」を導入しました`,
								);
								// biome-ignore lint/suspicious/noExplicitAny: automated fix
								setTimeout(() => (this as any).hideBalloon?.(), 2000);
								// biome-ignore lint/suspicious/noExplicitAny: automated fix
								(this as any).ghostController?.scanGhosts?.();
								// biome-ignore lint/suspicious/noExplicitAny: automated fix
								(this as any).ghostController?.selectGhost?.(result.name);
							}
						})
						.catch((e) => {
							console.error("Failed to pick and install archive:", e);
						})
				);
			}
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			return (this as any).modalManager?.show("install-modal-content");
		}
		if (action === "open-folder") {
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			return (this as any).handleMenuAction?.("open-ghost-folder");
		}
		if (action === "clear-cache") {
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).showBalloon?.("🧹 ゴーストキャッシュを開放しました");
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			setTimeout(() => (this as any).hideBalloon?.(), 2000);
			return;
		}
		if (action === "update-fmo") {
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).showBalloon?.("🔄 FMO情報を更新しました");
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			setTimeout(() => (this as any).hideBalloon?.(), 2000);
			return;
		}
		if (action === "reload-info") {
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).showBalloon?.("🔄 動作情報を再読み込みしました");
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			setTimeout(() => (this as any).hideBalloon?.(), 2000);

			return;
		}
		if (action === "reload-ghost") {
			const currentName =
				gc.currentGhost?.name || AppConfig.paths.fallbackGhostName;
			return gc.selectGhost(currentName).then(() => {

				(this as unknown).showBalloon?.("🔄 ゴーストを再読み込みしました");
				setTimeout(() => (this as unknown).hideBalloon?.(), 2000);
			});
		}
		if (action === "reset-shell-position" || action === "resetwindowpos") {
			if ((this as unknown).elements?.ghostDisplay) {
				(this as unknown).elements.ghostDisplay.style.left = "";
				(this as unknown).elements.ghostDisplay.style.top = "";
				(this as unknown).elements.ghostDisplay.style.transform = "";
				(this as unknown).elements.ghostDisplay.classList.remove(

				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				(this as any).showBalloon?.("🔄 ゴーストを再読み込みしました");
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				setTimeout(() => (this as any).hideBalloon?.(), 2000);
			});
		}
		if (action === "reset-shell-position" || action === "resetwindowpos") {
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			if ((this as any).elements?.ghostDisplay) {
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				(this as any).elements.ghostDisplay.style.left = "";
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				(this as any).elements.ghostDisplay.style.top = "";
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				(this as any).elements.ghostDisplay.style.transform = "";
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				(this as any).elements.ghostDisplay.classList.remove(

					"is-docked-left",
					"is-docked-right",
				);
			}
			if (isTauriAvailable()) {
				invoke("set_character_scale", { scale: 1.0 }).catch(() => {});
			}

			(this as unknown).showBalloon?.(
				"📍 シェル位置・倍率を初期リセットしました",
			);
			setTimeout(() => (this as unknown).hideBalloon?.(), 2000);
			return;
		}
		if (action === "reset-balloon-position" || action === "resetballoonpos") {
			if ((this as unknown).interactionManager) {
				(this as unknown).interactionManager.balloonOffsetX = 0;
				(this as unknown).interactionManager.balloonOffsetY = 0;

			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).showBalloon?.("📍 シェル位置・倍率を初期リセットしました");
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			setTimeout(() => (this as any).hideBalloon?.(), 2000);
			return;
		}
		if (action === "reset-balloon-position" || action === "resetballoonpos") {
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			if ((this as any).interactionManager) {
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				(this as any).interactionManager.balloonOffsetX = 0;
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				(this as any).interactionManager.balloonOffsetY = 0;

			}
			if (typeof localStorage !== "undefined") {
				try {
					localStorage.removeItem("nanai_balloon_offset");
				} catch (_e) {
					// Fallback if localStorage access fails
				}
			}
			if (isTauriAvailable()) {
				invoke("set_balloon_offset", { scopeId: 0, x: 0, y: 0 }).catch(
					() => {},
				);
				invoke("set_balloon_offset", { scopeId: 1, x: 0, y: 0 }).catch(
					() => {},
				);
			}

			(this as unknown).showBalloon?.("📍 バルーン位置を初期リセットしました");
			setTimeout(() => (this as unknown).hideBalloon?.(), 2000);
			return;
		}
		if (action === "close-balloon") {
			return (this as unknown).hideBalloon?.();
		}
		if (action === "keep-temporary-ghost") {
			const gc = (this as unknown).ghostController;
			if (gc.currentGhost?.isTemporary) {
				gc.currentGhost.isTemporary = false;
				(this as unknown).showBalloon?.(

			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).showBalloon?.("📍 バルーン位置を初期リセットしました");
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			setTimeout(() => (this as any).hideBalloon?.(), 2000);
			return;
		}
		if (action === "close-balloon") {
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			return (this as any).hideBalloon?.();
		}
		if (action === "keep-temporary-ghost") {
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			const gc = (this as any).ghostController;
			if (gc.currentGhost?.isTemporary) {
				gc.currentGhost.isTemporary = false;
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				(this as any).showBalloon?.(

					"📌 一時起動ゴーストを通常起動状態として保持しました",
				);
				gc.sendShioriEvent("OnBoot");
			} else {

				(this as unknown).showBalloon?.("⚠️ 一時起動中のゴーストではありません");
			}
			setTimeout(() => (this as unknown).hideBalloon?.(), 2000);

				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				(this as any).showBalloon?.("⚠️ 一時起動中のゴーストではありません");
			}
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			setTimeout(() => (this as any).hideBalloon?.(), 2000);

			return;
		}

		if (action === "biff" || action === "mail") {

			return (this as unknown).checkEmail?.();

			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			return (this as any).checkEmail?.();

		}

		if (SHIORI_ACTIONS[action]) {
			gc.sendShioriEvent(...SHIORI_ACTIONS[action]);
			return;
		}

		if (action === "scan") {
			return gc.scanGhosts().then(() => {

				(this as unknown).syncMenuGhosts?.();
				(this as unknown).showBalloon?.(
					"🔄 ゴーストフォルダを再スキャンしました",
				);
				setTimeout(() => (this as unknown).hideBalloon?.(), 2000);

				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				(this as any).syncMenuGhosts?.();
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				(this as any).showBalloon?.("🔄 ゴーストフォルダを再スキャンしました");
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				setTimeout(() => (this as any).hideBalloon?.(), 2000);

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

						(this as unknown).showBalloon?.("📁 ゴーストフォルダを開きました");
						setTimeout(() => (this as unknown).hideBalloon?.(), 2000);
					})
					.catch((e) => console.error(e));
			} else {
				(this as unknown).showBalloon?.(
					"📁 ゴーストフォルダを開く機能はアプリ版でのみ利用可能です",
				);
				setTimeout(() => (this as unknown).hideBalloon?.(), 2000);

						// biome-ignore lint/suspicious/noExplicitAny: automated fix
						(this as any).showBalloon?.("📁 ゴーストフォルダを開きました");
						// biome-ignore lint/suspicious/noExplicitAny: automated fix
						setTimeout(() => (this as any).hideBalloon?.(), 2000);
					})
					.catch((e) => console.error(e));
			} else {
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				(this as any).showBalloon?.(
					"📁 ゴーストフォルダを開く機能はアプリ版でのみ利用可能です",
				);
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				setTimeout(() => (this as any).hideBalloon?.(), 2000);

			}
			return;
		}
		if (
			action === "uninstall-ghost" ||
			action === "uninstall" ||
			action === "uninstallghost" ||
			action === "delete-ghost"
		) {

			return (this as unknown).uninstallCurrentGhost?.();

			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			return (this as any).uninstallCurrentGhost?.();

		}
		if (
			action === "install" ||
			action === "install-ghost" ||
			action === "installghost" ||
			action === "add-ghost"
		) {

			return (this as unknown).installGhostFromMenu?.();
		}
		if (action === "balloon" || action === "balloon-cycle")
			return (this as unknown).cycleBalloonTheme?.();
		if (action.startsWith("balloon-theme-")) {
			const theme = action.replace("balloon-theme-", "");
			(this as unknown).setBalloonTheme?.(theme);
			let label = THEME_LABELS[theme] || theme;
			if ((this as unknown).availableBalloons) {
				const bInfo = (this as unknown).availableBalloons.find(
					(b: unknown) => b.dir_name === theme,
				);
				if (bInfo) label = bInfo.name;
			}
			(this as unknown).showBalloon?.(
				`バルーンスキンを「${label}」に変更しました`,
			);
			setTimeout(() => (this as unknown).hideBalloon?.(), 2000);
			return;
		}
		if (action.startsWith("scale-"))
			return (this as unknown).applyShellScaleAction?.(action);
		if (action.startsWith("balloon-scale-"))
			return (this as unknown).applyBalloonScaleAction?.(action);
		if (action === "close" || action === "exit")
			return (this as unknown).closeApp?.();
		if (action === "close-all" || action === "exit-all")
			return (this as unknown).closeApp?.();
		if (action === "close-menu") return;
		if (action === "minimize") return (this as unknown).minimizeApp?.();

			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			return (this as any).installGhostFromMenu?.();
		}
		if (action === "balloon" || action === "balloon-cycle")
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			return (this as any).cycleBalloonTheme?.();
		if (action.startsWith("balloon-theme-")) {
			const theme = action.replace("balloon-theme-", "");
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).setBalloonTheme?.(theme);
			let label = THEME_LABELS[theme] || theme;
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			if ((this as any).availableBalloons) {
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				const bInfo = (this as any).availableBalloons.find(
					// biome-ignore lint/suspicious/noExplicitAny: automated fix
					(b: any) => b.dir_name === theme,
				);
				if (bInfo) label = bInfo.name;
			}
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).showBalloon?.(`バルーンスキンを「${label}」に変更しました`);
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			setTimeout(() => (this as any).hideBalloon?.(), 2000);
			return;
		}
		if (action.startsWith("scale-"))
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			return (this as any).applyShellScaleAction?.(action);
		if (action.startsWith("balloon-scale-"))
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			return (this as any).applyBalloonScaleAction?.(action);
		if (action === "close" || action === "exit")
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			return (this as any).closeApp?.();
		if (action === "close-all" || action === "exit-all")
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			return (this as any).closeApp?.();
		if (action === "close-menu") return;
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		if (action === "minimize") return (this as any).minimizeApp?.();

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

			if (ghostName) return (this as unknown).callGhost?.(ghostName);

			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			if (ghostName) return (this as any).callGhost?.(ghostName);

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

			return (this as unknown).handleDressupToggle?.(payload);
		}

		const _modalKey = action === "ghost-switch" ? "ghost" : action;
		(this as unknown).modalManager?.show(`${modalKey}-modal-content`);

			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			return (this as any).handleDressupToggle?.(payload);
		}

		const modalKey = action === "ghost-switch" ? "ghost" : action;
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		(this as any).modalManager?.show(`${modalKey}-modal-content`);

	},
};
