import { balloonActions } from "./actions/balloon-actions.js";
import { ghostActions } from "./actions/ghost-actions.js";
import { networkActions } from "./actions/network-actions.js";
import { AppConfig } from "./config.js";
import { invoke, isTauriAvailable } from "./tauri-helper.js";

const THEME_LABELS = {
	ivory: "アイボリー（象牙色レトロ）",
	pixel: "ドット絵・ピクセル風（レトロゲーム）",
	comic: "ポップコミック（太枠丸み）",
	dark: "サイバーダーク（夜間・ハイコントラスト）",
};

/** SHIORIイベントへ単純転送するアクション */
const SHIORI_ACTIONS = {
	recommend: ["OnChoiceSelect", ["recommendlink"]],
	portal: ["OnChoiceSelect", ["portal"]],
	update: ["OnUpdate"],
	headline: ["OnHeadline"],
};

export const actionMethods = {
	...balloonActions,
	...ghostActions,
	...networkActions,

	/**
	 * メニューアクションを処理
	 * @this {import('../../main.js').NanaiAndroidMascotApp}
	 * @param {string} action
	 * @param {any} [payload]
	 */
	handleMenuAction(action, payload = null) {
		if (!action) return;
		const gc = this.ghostController;

		if (action === "talk") {
			const scopeId =
				payload && typeof payload === "object" && "scope" in payload
					? payload.scope
					: 0;
			return this.onGhostClick(undefined, undefined, undefined, scopeId);
		}

		if (action === "update") {
			return this.startNetworkUpdate();
		}

		if (action === "updatecheck") {
			return this.startNetworkUpdate(null, { checkOnly: true });
		}

		if (action === "ghost-info") {
			return this.showGhostInformation();
		}
		if (action === "explorer") {
			return this.modalManager?.show("explorer-modal-content");
		}
		if (action === "backlog") {
			return this.modalManager?.show("backlog-modal-content");
		}
		if (action === "reload-ghost") {
			const currentName =
				gc.currentGhost?.name || AppConfig.paths.fallbackGhostName;
			return gc.selectGhost(currentName).then(() => {
				this.showBalloon("🔄 ゴーストを再読み込みしました");
				setTimeout(() => this.hideBalloon(), 2000);
			});
		}
		if (action === "reset-shell-position") {
			if (this.elements.ghostDisplay) {
				this.elements.ghostDisplay.style.left = "";
				this.elements.ghostDisplay.style.top = "";
				this.elements.ghostDisplay.style.transform = "";
				this.elements.ghostDisplay.classList.remove(
					"is-docked-left",
					"is-docked-right",
				);
			}
			this.showBalloon("📍 シェル位置を初期化しました");
			setTimeout(() => this.hideBalloon(), 2000);
			return;
		}
		if (action === "reset-balloon-position") {
			if (this.interactionManager) {
				this.interactionManager.balloonOffsetX = 0;
				this.interactionManager.balloonOffsetY = 0;
			}
			this.showBalloon("🎈 バルーン位置を初期化しました");
			setTimeout(() => this.hideBalloon(), 2000);
			return;
		}
		if (action === "close-balloon") {
			return this.hideBalloon();
		}
		if (action === "keep-temporary-ghost") {
			const gc = this.ghostController;
			if (gc.currentGhost?.isTemporary) {
				gc.currentGhost.isTemporary = false;
				this.showBalloon("📌 一時起動ゴーストを通常起動状態として保持しました");
				gc.sendShioriEvent("OnBoot");
			} else {
				this.showBalloon("⚠️ 一時起動中のゴーストではありません");
			}
			setTimeout(() => this.hideBalloon(), 2000);
			return;
		}

		if (action === "biff" || action === "mail") {
			return this.checkEmail();
		}

		if (SHIORI_ACTIONS[action]) {
			gc.sendShioriEvent(...SHIORI_ACTIONS[action]);
			return;
		}

		if (action === "scan") {
			return gc.scanGhosts().then(() => {
				this.syncMenuGhosts?.();
				this.showBalloon("🔄 ゴーストフォルダを再スキャンしました");
				setTimeout(() => this.hideBalloon(), 2000);
			});
		}
		if (action === "open-ghost-folder") {
			if (isTauriAvailable()) {
				invoke("open_ghost_directory").catch((e) => console.error(e));
			}
			return;
		}
		if (action === "uninstall-ghost" || action === "uninstall") {
			return this.uninstallCurrentGhost();
		}
		if (action === "install") return this.installGhostFromMenu();
		if (action === "balloon" || action === "balloon-cycle")
			return this.cycleBalloonTheme();
		if (action.startsWith("balloon-theme-")) {
			const theme = action.replace("balloon-theme-", "");
			this.setBalloonTheme(theme);
			let label = THEME_LABELS[theme] || theme;
			if (this.availableBalloons) {
				const bInfo = this.availableBalloons.find(
					(/** @type {{ dir_name: string; }} */ b) => b.dir_name === theme,
				);
				if (bInfo) label = bInfo.name;
			}
			this.showBalloon(`バルーンスキンを「${label}」に変更しました`);
			setTimeout(() => this.hideBalloon(), 2000);
			return;
		}
		if (action.startsWith("scale-")) return this.applyShellScaleAction(action);
		if (action.startsWith("balloon-scale-"))
			return this.applyBalloonScaleAction(action);
		if (action === "close" || action === "exit") return this.closeApp();
		if (action === "close-all" || action === "exit-all") return this.closeApp();
		if (action === "close-menu") return;
		if (action === "minimize") return this.minimizeApp();
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
			if (ghostName) return this.callGhost(ghostName);
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
			return this.handleDressupToggle(payload);
		}

		const modalKey = action === "ghost-switch" ? "ghost" : action;
		this.modalManager?.show(`${modalKey}-modal-content`);
	},
};
