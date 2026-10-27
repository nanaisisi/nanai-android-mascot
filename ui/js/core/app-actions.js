import { bindMenuData } from "../surface/bind-menu.js";
import { AppConfig } from "./config.js";
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
		if (action === "open-ghost-folder") {
			if (isTauriAvailable()) {
				invoke("open_ghost_directory").catch((e) => console.error(e));
			}
			return;
		}
		if (action === "uninstall-ghost" || action === "uninstall") {
			return this.uninstallCurrentGhost();
		}
		if (action === "install")
			return this.modalManager?.show("install-modal-content");
		if (action === "balloon" || action === "balloon-cycle")
			return this.cycleBalloonTheme();
		if (action.startsWith("balloon-theme-")) {
			const theme = action.replace("balloon-theme-", "");
			this.setBalloonTheme(theme);
			let label = THEME_LABELS[theme] || theme;
			if (this.availableBalloons) {
				const bInfo = this.availableBalloons.find((b) => b.dir_name === theme);
				if (bInfo) label = bInfo.name;
			}
			this.showBalloon(`バルーンスキンを「${label}」に変更しました`);
			setTimeout(() => this.hideBalloon(), 2000);
			return;
		}
		if (action.startsWith("scale-")) return this.applyShellScaleAction(action);
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

		// ゴースト切り替え / 汎用モーダル
		const modalKey = action === "ghost-switch" ? "ghost" : action;
		this.modalManager?.show(`${modalKey}-modal-content`);
	},

	/**
	 * 現在のゴーストをアンインストールする (SSP 右クリックメニュー「アンインストール」)
	 * 確認ダイアログ → `uninstall_ghost` コマンド（ゴーストディレクトリ再帰削除）。
	 * 削除後は残存ゴーストへ自動切替する。
	 * @this {import('../../main.js').NanaiAndroidMascotApp}
	 */
	async uninstallCurrentGhost() {
		const gc = this.ghostController;
		const name = gc.currentGhost?.name;
		if (!name) return;
		const message = `ゴースト「${name}」をアンインストールしますか？\nゴーストのファイルはすべて削除されます（復元できません）。`;
		if (
			typeof globalThis.confirm !== "function" ||
			!globalThis.confirm(message)
		) {
			return;
		}
		try {
			const removed = await invoke("uninstall_ghost", { ghostName: name });
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

	/**
	 * 最近使ったゴースト履歴を記録する（SSP メニュー「最近使ったもの」）
	 * @this {import('../../main.js').NanaiAndroidMascotApp}
	 * @param {string} ghostName
	 */
	recordRecentGhost(ghostName) {
		if (!ghostName) return;
		const MAX_RECENT = 8;
		try {
			const list = JSON.parse(
				localStorage.getItem("nanai_recent_ghosts") || "[]",
			);
			const next = [ghostName, ...list.filter((g) => g !== ghostName)];
			localStorage.setItem(
				"nanai_recent_ghosts",
				JSON.stringify(next.slice(0, MAX_RECENT)),
			);
		} catch (_err) {
			// LocalStorage 利用不可環境では無視
		}
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
		let themes = BALLOON_THEMES;
		if (this.availableBalloons && this.availableBalloons.length > 0) {
			themes = this.availableBalloons.map((b) => b.dir_name);
		}
		const idx = themes.indexOf(this.currentBalloonTheme);
		const next = themes[(idx + 1) % themes.length];
		this.setBalloonTheme(next);

		let label = THEME_LABELS[next] || next;
		if (this.availableBalloons) {
			const bInfo = this.availableBalloons.find((b) => b.dir_name === next);
			if (bInfo) label = bInfo.name;
		}
		this.showBalloon(`バルーンスキンを「${label}」に変更しました`);
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

	async setBalloonTheme(themeName) {
		this.currentBalloonTheme = themeName;
		localStorage.setItem("nanai_balloon_theme", themeName);
		document.documentElement.setAttribute("data-balloon-theme", themeName);
		document.body.className = `balloon-theme-${themeName}`;
		this.elements.balloonDisplay?.setAttribute("data-balloon-theme", themeName);
		if (isTauriAvailable()) {
			emit("sync-theme", themeName);
		}

		// バルーンスキン descript.txt を Rust でパースして動的反映（UKADOC準拠）
		this.resetBalloonDescript();
		if (isTauriAvailable()) {
			try {
				const props = await invoke("balloon_manifest", { name: themeName });
				if (props && typeof props === "object") {
					this.applyBalloonDescript(props);
				}
			} catch (_e) {
				// スキン descript 未定義（CSS テーマのみ）の場合は無視
			}
		}
	},

	async scanBalloons() {
		if (isTauriAvailable()) {
			try {
				const balloons = await invoke("scan_balloons");
				if (balloons && balloons.length > 0) {
					this.availableBalloons = balloons;
					// UI更新のためのイベント発火
					emit("sync-balloons", balloons);
				}
			} catch (e) {
				console.error("Failed to scan balloons:", e);
			}
		}
	},

	/**
	 * バルーン descript 由来の動的スタイルをテーマ既定へ戻す（スキン切替時）
	 */
	resetBalloonDescript() {
		const root = document.documentElement;
		for (const key of [
			"--balloon-font-family",
			"--balloon-font-size",
			"--balloon-text-color",
			"--balloon-highlight-bg",
			"--balloon-highlight-text",
		]) {
			root.style.removeProperty(key);
		}
		const balloonEl = document.querySelector(".balloon");
		if (balloonEl) {
			balloonEl.style.padding = "";
			balloonEl.style.maxWidth = "";
		}
		if (this.elements.balloonDisplay) {
			this.elements.balloonDisplay.style.left = "";
			this.elements.balloonDisplay.style.top = "";
		}
	},

	/**
	 * RGB成分（xxx.color.r / .g / .b）から CSS 色へ
	 * @param {Record<string, string>} props
	 * @param {string} base - 例 "font.color"
	 * @returns {string|null}
	 */
	rgbFromComponents(props, base) {
		const r = parseInt(props[`${base}.r`], 10);
		const g = parseInt(props[`${base}.g`], 10);
		const b = parseInt(props[`${base}.b`], 10);
		if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null;
		return `rgb(${r}, ${g}, ${b})`;
	},

	/**
	 * バルーン descript.txt の定義（フォント色・余白・原点等）を動的に反映 (UKADOC準拠)
	 * @param {Record<string, string>} props
	 */
	applyBalloonDescript(props = {}) {
		if (!props) return;
		const root = document.documentElement;

		// フォントファミリ (font.name)
		if (props["font.name"]) {
			root.style.setProperty(
				"--balloon-font-family",
				`"${props["font.name"]}", Meiryo, sans-serif`,
			);
		}

		// フォントサイズ (font.height)
		if (props["font.height"]) {
			const fh = parseInt(props["font.height"], 10);
			if (!Number.isNaN(fh) && fh > 0) {
				root.style.setProperty("--balloon-font-size", `${fh}px`);
			}
		}

		// フォント色 (font.color.r,g,b または font.color)
		const fontColor = this.rgbFromComponents(props, "font.color");
		if (props["font.color"]) {
			root.style.setProperty("--balloon-text-color", props["font.color"]);
		} else if (fontColor) {
			root.style.setProperty("--balloon-text-color", fontColor);
		}

		// リンク・選択肢色 (cursor.font.color / cursor.color.font / anchor 系)
		const cursorBg =
			this.rgbFromComponents(props, "cursor.font.color") ||
			props["cursor.font.color"];
		if (cursorBg) {
			root.style.setProperty("--balloon-highlight-bg", cursorBg);
		}
		const cursorText =
			this.rgbFromComponents(props, "cursor.color.font") ||
			props["cursor.color.font"];
		if (cursorText) {
			root.style.setProperty("--balloon-highlight-text", cursorText);
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

		// 折り返し幅 (wordwrappoint.x)
		if (props["wordwrappoint.x"]) {
			const ww = parseInt(props["wordwrappoint.x"], 10);
			if (!Number.isNaN(ww) && ww > 50) {
				const balloonEl = document.querySelector(".balloon");
				if (balloonEl) {
					balloonEl.style.maxWidth = `${ww}px`;
				}
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
				const result = await invoke("check_email", {
					account: accountName,
				}).catch(() => null);
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
