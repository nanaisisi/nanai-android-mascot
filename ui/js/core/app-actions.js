import { bindMenuData } from "../surface/bind-menu.js";
import { emit, invoke, isTauriAvailable } from "./tauri-helper.js";

const BALLOON_THEMES = ["emily4", "ivory", "pixel", "comic", "dark"];
const THEME_LABELS = {
	emily4: "Emily/Phase4 クラシックバルーン",
	ivory: "アイボリー（象牙色レトロ）",
	pixel: "ドット絵・ピクセル風（レトロゲーム）",
	comic: "ポップコミック（太枠丸み）",
	dark: "サイバーダーク（夜間・ハイコントラスト）",
};
const SCALE_MAP = {
	"scale-50": { width: "100px", height: "200px" },
	"scale-75": { width: "150px", height: "300px" },
	"scale-100": { width: "200px", height: "400px" },
	"scale-125": { width: "250px", height: "500px" },
	"scale-150": { width: "300px", height: "600px" },
	"scale-200": { width: "400px", height: "800px" },
};

/** SHIORIイベントへ単純転送するアクション */
// ※外部ブラウザ起動・RSSパーサー等は今後拡張 (updates2.dau照合は app-update.js + network.rs で実装済み)
const SHIORI_ACTIONS = {
	recommend: ["OnChoiceSelect", ["recommendlink"]],
	portal: ["OnChoiceSelect", ["portal"]],
	update: ["OnUpdate"],
	headline: ["OnHeadline"],
};

export const actionMethods = {
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

		if (action === "biff" || action === "mail") {
			return this.checkEmail();
		}

		if (SHIORI_ACTIONS[action]) {
			gc.sendShioriEvent(...SHIORI_ACTIONS[action]);
			return;
		}

		if (action === "scan") return gc.scanGhosts();
		if (action === "install")
			return this.modalManager?.show("install-modal-content");
		if (action === "balloon" || action === "balloon-cycle")
			return this.cycleBalloonTheme();
		if (action.startsWith("balloon-theme-")) {
			const theme = action.replace("balloon-theme-", "");
			this.setBalloonTheme(theme);
			this.showBalloon(
				`バルーンスキンを「${THEME_LABELS[theme] || theme}」に変更しました`,
			);
			setTimeout(() => this.hideBalloon(), 2000);
			return;
		}
		if (action.startsWith("scale-")) return this.applyShellScaleAction(action);
		if (action === "close" || action === "exit") return this.closeApp();
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

		// ゴースト切り替え / 汎用モーダル
		const modalKey = action === "ghost-switch" ? "ghost" : action;
		this.modalManager?.show(`${modalKey}-modal-content`);
	},

	/**
	 * 着せ替え (bindgroup) パーツの装着/解除 (UKADOC オーナードローメニュー準拠)
	 *
	 * `mustselect` カテゴリでは ON 選択時に同カテゴリの他パーツを解除する。
	 * @this {import('../../main.js').NanaiAndroidMascotApp}
	 * @param {{ category: string, part: string, scope?: number }} payload
	 */
	async handleDressupToggle(payload) {
		const sm = this.surfaceManager;
		if (!sm || !payload?.category) return;
		const scopeId = Number.isFinite(payload.scope) ? payload.scope : 0;
		const { category, part } = payload;

		// 現状の反転値を先に判定（bindDressup による状態変更前に確定）
		const willOn =
			sm.dressupState.get(`${scopeId}__${category}__${part}`) !== true;

		// mustselect: 単一選択カテゴリは ON 選択時に他パーツを解除
		let options = [];
		let siblingParts = [];
		if (sm.shellManifest) {
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

	cycleBalloonTheme() {
		const idx = BALLOON_THEMES.indexOf(this.currentBalloonTheme);
		const next = BALLOON_THEMES[(idx + 1) % BALLOON_THEMES.length];
		this.setBalloonTheme(next);
		this.showBalloon(
			`バルーンスキンを「${THEME_LABELS[next] || next}」に変更しました`,
		);
		setTimeout(() => this.hideBalloon(), 2000);
	},

	applyShellScaleAction(action) {
		const conf = SCALE_MAP[action] || SCALE_MAP["scale-100"];
		if (this.elements.ghostDisplay) {
			this.elements.ghostDisplay.style.width = conf.width;
			this.elements.ghostDisplay.style.height = conf.height;
		}
		this.showBalloon(
			`シェル倍率を ${action.replace("scale-", "")}% に変更しました`,
		);
		setTimeout(() => this.hideBalloon(), 1500);
	},

	minimizeApp() {
		this.hideMenu();
		try {
			this.ghostController.sendShioriEvent("OnWindowStateMinimize");
		} catch (_e) {
			// エラー無視
		}
		if (isTauriAvailable()) {
			invoke("minimize_app").catch((err) =>
				console.error("minimize_app failed:", err),
			);
		}
	},

	setBalloonTheme(themeName) {
		this.currentBalloonTheme = themeName;
		document.documentElement.setAttribute("data-balloon-theme", themeName);
		document.body.className = `balloon-theme-${themeName}`;
		this.elements.balloonDisplay?.setAttribute("data-balloon-theme", themeName);
		if (isTauriAvailable()) {
			emit("sync-theme", themeName);
		}
	},

	/**
	 * バルーン descript.txt の定義（フォント色・余白・原点等）を動的に反映 (UKADOC準拠)
	 * @param {Record<string, string>} props
	 */
	applyBalloonDescript(props = {}) {
		if (!props) return;
		const root = document.documentElement;

		// フォント色 (font.color.r,g,b または font.color)
		if (props["font.color"]) {
			root.style.setProperty("--balloon-text-color", props["font.color"]);
		} else if (
			props["font.color.r"] &&
			props["font.color.g"] &&
			props["font.color.b"]
		) {
			root.style.setProperty(
				"--balloon-text-color",
				`rgb(${props["font.color.r"]}, ${props["font.color.g"]}, ${props["font.color.b"]})`,
			);
		}

		// 有効テキスト領域 (validrect.left, top, right, bottom) によるパディング調整
		const vl = parseInt(props["validrect.left"], 10);
		const vt = parseInt(props["validrect.top"], 10);
		const vr = parseInt(props["validrect.right"], 10);
		const vb = parseInt(props["validrect.bottom"], 10);
		if (
			!Number.isNaN(vl) &&
			!Number.isNaN(vt) &&
			!Number.isNaN(vr) &&
			!Number.isNaN(vb)
		) {
			const padTop = `${Math.max(8, vt)}px`;
			const padRight = `${Math.max(8, vr)}px`;
			const padBottom = `${Math.max(8, vb)}px`;
			const padLeft = `${Math.max(8, vl)}px`;
			const balloonEl = document.querySelector(".balloon");
			if (balloonEl) {
				balloonEl.style.padding = `${padTop} ${padRight} ${padBottom} ${padLeft}`;
			}
		}

		// バルーン原点 (origin.x, origin.y) によるオフセット調整
		const ox = parseInt(props["origin.x"], 10);
		const oy = parseInt(props["origin.y"], 10);
		if (!Number.isNaN(ox) || !Number.isNaN(oy)) {
			if (this.elements.balloonDisplay) {
				if (!Number.isNaN(ox))
					this.elements.balloonDisplay.style.left = `calc(50% + ${ox}px)`;
				if (!Number.isNaN(oy))
					this.elements.balloonDisplay.style.top = `calc(2rem + ${oy}px)`;
			}
		}
	},

	switchToNextGhost() {
		const ghosts = this.ghostController.ghosts || [];
		if (ghosts.length <= 1) return;
		const currentName = this.ghostController.currentGhost?.name;
		const idx = ghosts.findIndex((g) => g.name === currentName);
		const next = ghosts[(idx + 1) % ghosts.length];
		if (next) this.ghostController.selectGhost(next.name);
	},

	/**
	 * メールチェック (UKADOC OnBIFF 準拠)
	 * @this {import('../../main.js').NanaiAndroidMascotApp}
	 * @param {string} [accountName] アカウント名 (省略時は "default")
	 */
	async checkEmail(accountName = "default") {
		const gc = this.ghostController;
		console.log(`📬 メールチェック開始 (OnBIFF): account=${accountName}`);
		this.showBalloon?.("📬 メールを確認中...");

		// 1. OnBIFFBegin 発火 (Ref0: アカウント名)
		await gc.sendShioriEvent("OnBIFFBegin", [accountName]);

		try {
			if (isTauriAvailable()) {
				// Tauri バックエンド経由のメールチェック (存在する場合)
				const result = await invoke("check_email", { account: accountName }).catch(() => null);
				if (result && typeof result === "object") {
					const count = Number(result.count || 0);
					const size = Number(result.size || 0);
					const unread = Number(result.unread || 0);
					if (result.headers && Array.isArray(result.headers)) {
						await gc.sendShioriEvent("OnBIFF2Complete", [
							String(count),
							String(size),
							accountName,
							String(unread),
							result.headers.join("\x01"),
						]);
					} else {
						await gc.sendShioriEvent("OnBIFFComplete", [
							String(count),
							String(size),
							accountName,
							String(unread),
						]);
					}
					return;
				}
			}

			// 既定・未設定時: 新着 0 件として OnBIFFComplete (Ref0: 0, Ref1: 0, Ref2: accountName)
			await new Promise((r) => setTimeout(r, 600));
			await gc.sendShioriEvent("OnBIFFComplete", ["0", "0", accountName, "0"]);
		} catch (err) {
			console.warn("OnBIFF 失敗:", err);
			await gc.sendShioriEvent("OnBIFFFailure", ["connect", accountName]);
		}
	},
};
