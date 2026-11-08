/**
 * バルーンスキン descript.txt / 画像アセットの動的読み込み・スタイル反映モジュール
 */

import { applyAssetProperties } from "../../core/actions/balloon-descript/assets.js";
import { applyFontProperties } from "../../core/actions/balloon-descript/font.js";
import { applyLayoutProperties } from "../../core/actions/balloon-descript/layout.js";
import { invoke, isTauriAvailable } from "../../core/tauri-helper.js";
import { processChromaKey } from "../../surface/surface-compositor.js";
import { updateBalloonWindowScale } from "./scale.js";

const getImageDimensions = (
	url: string,
): Promise<{ width: number; height: number }> => {
	return new Promise((resolve) => {
		if (typeof Image === "undefined") {
			resolve({ width: 280, height: 100 });
			return;
		}
		const img = new Image();
		img.onload = () => resolve({ width: img.width, height: img.height });
		img.onerror = () => resolve({ width: 280, height: 100 });
		img.src = url;
	});
};

/**
 * バルーンの背景画像およびPNAアルファマスクのロード
 * // [balloons*s.txt/balloonk*s.txt/balloonp*]: 背景画像（scope 0: balloons0.png, scope 1: balloonk0.png, scope >= 2: balloonp{scopeId}.png）+ PNAアルファマスク対応
 * @param {string} theme
 * @param {number} scopeId
 * @returns {Promise<string | null>}
 */
export async function loadBalloonSkinImages(theme: string, scopeId: number) {
	const imageFile =
		scopeId === 0
			? "balloons0.png"
			: scopeId === 1
				? "balloonk0.png"
				: `balloonp${scopeId}.png`;
	const pnaFile =
		scopeId === 0
			? "balloons0.pna"
			: scopeId === 1
				? "balloonk0.pna"
				: `balloonp${scopeId}.pna`;

	let bgImageRaw = await invoke("load_balloon_image", {
		name: theme,
		file: imageFile,
	}).catch(() => null);

	if (!bgImageRaw && scopeId >= 2) {
		bgImageRaw = await invoke("load_balloon_image", {
			name: theme,
			file: "balloons0.png",
		}).catch(() => null);
	}

	let pnaImage = await invoke("load_balloon_image", {
		name: theme,
		file: pnaFile,
	}).catch(() => null);

	if (!pnaImage && scopeId >= 2) {
		pnaImage = await invoke("load_balloon_image", {
			name: theme,
			file: "balloons0.pna",
		}).catch(() => null);
	}

	const bgImage = bgImageRaw
		? await processChromaKey(bgImageRaw, pnaImage)
		: null;

	// オプションアセット (balloonc, arrow0/1, sstp, online) のロード試行
	await Promise.all([
		invoke("load_balloon_image", {
			name: theme,
			file: "balloonc0.png",
		}).catch(() => null),
		invoke("load_balloon_image", { name: theme, file: "arrow0.png" }).catch(
			() => null,
		),
		invoke("load_balloon_image", { name: theme, file: "arrow1.png" }).catch(
			() => null,
		),
		invoke("load_balloon_image", { name: theme, file: "sstp.png" }).catch(
			() => null,
		),
		invoke("load_balloon_image", { name: theme, file: "sstp_new.png" }).catch(
			() => null,
		),
		invoke("load_balloon_image", { name: theme, file: "sstp_newk.png" }).catch(
			() => null,
		),
		invoke("load_balloon_image", {
			name: theme,
			file: "online0.png",
		}).catch(() => null),
	]);

	return bgImage;
}

/**
 * バルーン descript.txt の定義をスタイルへ動的反映（UKADOC準拠）
 * // [descript.txt（Balloonの）]: balloon_manifest パースとスタイル適用
 * @param {object} params
 * @param {string} params.theme
 * @param {number} params.scopeId
 * @param {number} params.currentUserScale
 * @param {(dpiScale: number) => void} [params.onDpiScaleChange]
 * @param {(dontMove: boolean) => void} [params.onDontMoveChange]
 * @returns {Promise<{ dpiScale: number, isBalloonDontMove: boolean } | null>}
 */
export async function applyBalloonDescript({
	theme,
	scopeId,
	currentUserScale,
	onDpiScaleChange,
	onDontMoveChange,
}) {
	if (!isTauriAvailable()) return null;

	try {
		document.documentElement.setAttribute("data-balloon-theme", theme);
		document.body.className = `balloon-theme-${theme}`;

		const props = await invoke("balloon_manifest", {
			name: theme,
			scopeId,
		}).catch(() => null);
		if (!props || typeof props !== "object") {
			if (theme !== "default" && theme !== "nam_default_plus") {
				return await applyBalloonDescript({
					theme: "nam_default_plus",
					scopeId,
					currentUserScale,
					onDpiScaleChange,
					onDontMoveChange,
				});
			}
			return null;
		}
		const balloonBox = document.getElementById("balloon-box");
		const root = document.documentElement;

		// 推奨 DPI (dpi,推奨DPI / 既定値: 96, SSP 2.7.21準拠)
		const parsedDpi = parseInt(props.dpi, 10);
		const balloonDpi =
			!Number.isNaN(parsedDpi) && parsedDpi > 0 ? parsedDpi : 96;
		const nextDpiScale = +(96 / balloonDpi).toFixed(4);
		root.style.setProperty("--balloon-dpi", String(balloonDpi));
		updateBalloonWindowScale(balloonBox, currentUserScale, nextDpiScale);
		onDpiScaleChange?.(nextDpiScale);

		const instanceContext = {
			balloonDpiScale: nextDpiScale,
			balloonUserScale: currentUserScale,
			currentBalloonTheme: theme,
			elements: { balloonDisplay: balloonBox },
		};

		// descript.txt のレイアウト、フォント、色、アンカー、カーソル、装飾、アセットプロパティを完全適用
		applyLayoutProperties(balloonBox || root, props, instanceContext);
		applyFontProperties(balloonBox || root, props, instanceContext);
		applyAssetProperties(balloonBox || root, props, instanceContext);

		const isBalloonDontMove = !!instanceContext.balloonDontMove;
		onDontMoveChange?.(isBalloonDontMove);

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
				`${Math.max(4, Math.abs(vt))}px ${Math.max(4, Math.abs(vr))}px ${Math.max(4, Math.abs(vb))}px ${Math.max(4, Math.abs(vl))}px`,
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

		let bgImage = await loadBalloonSkinImages(theme, scopeId);
		if (!bgImage && theme !== "default" && theme !== "nam_default_plus") {
			bgImage = await loadBalloonSkinImages("nam_default_plus", scopeId);
		}

		if (bgImage) {
			const t = Number.isNaN(vt) ? 16 : Math.max(8, Math.abs(vt));
			const r = Number.isNaN(vr) ? 16 : Math.max(8, Math.abs(vr));
			const b = Number.isNaN(vb) ? 16 : Math.max(8, Math.abs(vb));
			const l = Number.isNaN(vl) ? 16 : Math.max(8, Math.abs(vl));
			const balloonEl = balloonBox || document.querySelector(".balloon");
			if (balloonEl?.style) {
				balloonEl.style.borderImageSource = `url("${bgImage}")`;
				balloonEl.style.borderImageSlice = `${t} ${r} ${b} ${l} fill`;
				balloonEl.style.borderImageWidth = `${t}px ${r}px ${b}px ${l}px`;
				balloonEl.style.borderImageRepeat = "repeat";
				balloonEl.style.backgroundColor = "transparent";

				const dims = await getImageDimensions(bgImage);
				if (dims.height > 0) {
					balloonEl.style.minHeight = `${dims.height}px`;
				}
			}
		}

		return {
			dpiScale: nextDpiScale,
			isBalloonDontMove,
		};
	} catch (_e) {
		if (theme !== "default" && theme !== "nam_default_plus") {
			return await applyBalloonDescript({
				theme: "nam_default_plus",
				scopeId,
				currentUserScale,
				onDpiScaleChange,
				onDontMoveChange,
			});
		}
		return null;
	}
}
