/**
 * Nanai Android Mascot - 独立バルーンウィンドウ制御スクリプト
 */
import {
	emit,
	invoke,
	isTauriAvailable,
	listen,
	startDraggingWindow,
} from "../core/tauri-helper.js";

const urlParams = new URLSearchParams(globalThis.location.search);
const scopeId = parseInt(urlParams.get("scope") || "0", 10);
let appliedTheme = null;
let applyingTheme = null;
let currentDpiScale = 1;
let currentUserScale = 1;

function updateBalloonWindowScale(balloonBox) {
	const root = document.documentElement;
	const finalScale = +(currentUserScale * currentDpiScale).toFixed(4);
	root.style.setProperty("--balloon-dpi-scale", String(currentDpiScale));
	root.style.setProperty("--balloon-user-scale", String(currentUserScale));
	if (balloonBox) {
		balloonBox.style.transform = finalScale !== 1 ? `scale(${finalScale})` : "";
		balloonBox.style.transformOrigin = "top left";
	}
}

function setupInteractiveElements(balloonText) {
	if (!balloonText) return;

	// 選択肢ボタン (\q)
	balloonText.querySelectorAll(".balloon-choice-btn").forEach((btn) => {
		btn.addEventListener("click", (e) => {
			e.stopPropagation();
			const choiceId = btn.getAttribute("data-choice-id");
			const choiceText = btn.textContent;
			void emit("balloon-choice-selected", { scopeId, choiceId, choiceText });
		});
	});

	// アンカーリンク (\_a)
	balloonText.querySelectorAll(".balloon-anchor").forEach((anchor) => {
		anchor.addEventListener("click", (e) => {
			e.stopPropagation();
			const anchorId = anchor.getAttribute("data-anchor-id");
			void emit("balloon-anchor-selected", { scopeId, anchorId });
		});
	});
}

/**
 * バルーン descript.txt の定義をスタイルへ動的反映（UKADOC準拠）
 * // [descript.txt（Balloonの）]: balloon_manifest パースとスタイル適用
 * @param {string} theme
 */
async function applyBalloonDescript(theme) {
	if (!isTauriAvailable()) return;
	if (appliedTheme === theme) return;
	if (applyingTheme === theme) return;
	applyingTheme = theme;
	try {
		const props = await invoke("balloon_manifest", { name: theme });
		if (!props || typeof props !== "object") return;
		const balloonBox = document.getElementById("balloon-box");
		const root = document.documentElement;

		// 推奨 DPI (dpi,推奨DPI / 既定値: 96, SSP 2.7.21準拠)
		const parsedDpi = parseInt(props.dpi, 10);
		const balloonDpi =
			!Number.isNaN(parsedDpi) && parsedDpi > 0 ? parsedDpi : 96;
		currentDpiScale = +(96 / balloonDpi).toFixed(4);
		root.style.setProperty("--balloon-dpi", String(balloonDpi));
		updateBalloonWindowScale(balloonBox);

		const toCss = (base) => {
			const r = parseInt(props[`${base}.r`], 10);
			const g = parseInt(props[`${base}.g`], 10);
			const b = parseInt(props[`${base}.b`], 10);
			return Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)
				? null
				: `rgb(${r}, ${g}, ${b})`;
		};
		if (props["font.name"]) {
			root.style.setProperty(
				"--balloon-font-family",
				`"${props["font.name"]}", Meiryo, sans-serif`,
			);
		}
		const fh = parseInt(props["font.height"], 10);
		if (!Number.isNaN(fh) && fh > 0) {
			root.style.setProperty("--balloon-font-size", `${fh}px`);
		}
		const textColor = props["font.color"] || toCss("font.color");
		if (textColor) {
			root.style.setProperty("--balloon-text-color", textColor);
		}
		const highlightBg =
			props["cursor.font.color"] || toCss("cursor.font.color");
		if (highlightBg) {
			root.style.setProperty("--balloon-highlight-bg", highlightBg);
		}

		// 有効テキスト領域 (validrect) による余白調整
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
			balloonBox?.style.setProperty(
				"padding",
				`${Math.max(8, vt)}px ${Math.max(8, vr)}px ${Math.max(8, vb)}px ${Math.max(8, vl)}px`,
			);
		}
		// 折り返し幅 (wordwrappoint.x は原点右基準の負オフセット指定)
		const ww = parseInt(props["wordwrappoint.x"], 10);
		if (!Number.isNaN(ww)) {
			balloonBox?.style.setProperty(
				"max-width",
				`calc(100% + ${Math.abs(ww)}px)`,
			);
		}

		// 背景画像（balloons0: さくら / balloonk0: 相方。9 スライスで伸縮）
		const imageFile = scopeId === 0 ? "balloons0.png" : "balloonk0.png";
		const bgImage = await invoke("load_balloon_image", {
			name: theme,
			file: imageFile,
		}).catch(() => null);
		if (bgImage) {
			const t = Number.isNaN(vt) ? 38 : Math.max(8, vt);
			const r = Number.isNaN(vr) ? 40 : Math.max(8, vr);
			const b = Number.isNaN(vb) ? 60 : Math.max(8, vb);
			const l = Number.isNaN(vl) ? 40 : Math.max(8, vl);
			document.body.style.borderImage = `url("${bgImage}") ${t} ${r} ${b} ${l} fill / ${t}px ${r}px ${b}px ${l}px stretch`;
			document.body.style.borderStyle = "solid";
			document.body.style.borderWidth = "0";
		}
		appliedTheme = theme;
	} catch (_e) {
		// スキン descript 未定義（CSS テーマのみ）の場合は無視
	} finally {
		if (applyingTheme === theme) applyingTheme = null;
	}
}

function initBalloonWindow() {
	const balloonBox = document.getElementById("balloon-box");
	const _balloonText = document.getElementById("balloon-text");

	// テーマの適用
	const savedTheme =
		urlParams.get("theme") ||
		localStorage.getItem("nanai_balloon_theme") ||
		"default";
	document.documentElement.setAttribute("data-balloon-theme", savedTheme);
	applyBalloonDescript(savedTheme);

	if (!isTauriAvailable()) return;

	// 親ウィンドウからのバルーンコンテンツ更新イベントを受信 (listenを先に登録)
	void listen(`update-balloon-content-${scopeId}`, (event) => {
		const { html, theme } = event.payload || {};
		if (theme) {
			document.documentElement.setAttribute("data-balloon-theme", theme);
			applyBalloonDescript(theme);
		}
		const targetText = document.getElementById("balloon-text");
		if (targetText && html !== undefined) {
			targetText.innerHTML = html;
			// クリックイベントの再バインド (選択肢・アンカー等)
			setupInteractiveElements(targetText);
		}
	});

	// テーマ更新
	void listen("balloon-theme-changed", (event) => {
		const theme = event.payload?.theme || event.payload;
		if (theme) {
			document.documentElement.setAttribute("data-balloon-theme", theme);
			localStorage.setItem("nanai_balloon_theme", theme);
			applyBalloonDescript(theme);
		}
	});

	// バルーン倍率更新 (手動スケール × DPI推奨スケール)
	void listen("balloon-scale-changed", (event) => {
		const userScale = Number(event.payload?.userScale);
		if (!Number.isNaN(userScale) && userScale > 0) {
			currentUserScale = userScale;
			updateBalloonWindowScale(balloonBox);
		}
	});

	void emit("balloon-ready", { scopeId });

	// バルーン本体のクリックでスキップまたは改ページ通知
	balloonBox?.addEventListener("click", () => {
		void emit("balloon-clicked", { scopeId });
	});

	// ドラッグ移動 (Tauri v2 startDragging)
	balloonBox?.addEventListener("mousedown", (e) => {
		if (e.button === 0) {
			void startDraggingWindow();
		}
	});

	balloonBox?.addEventListener("mouseup", () => {
		void invoke("save_balloon_offset_from_position", { scopeId });
	});
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", initBalloonWindow);
} else {
	initBalloonWindow();
}
