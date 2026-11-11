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
		if (!url || typeof Image === "undefined") {
			resolve({ width: 0, height: 0 });
			return;
		}
		const img = new Image();
		img.onload = () => resolve({ width: img.naturalWidth || img.width || 0, height: img.naturalHeight || img.height || 0 });
		img.onerror = () => resolve({ width: 0, height: 0 });
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
export async function loadBalloonSkinImages(
	theme: string,
	scopeId: number,
	side: "left" | "right" | "top" | "auto" = "auto",
) {
	let candidates: string[] = [];
	if (scopeId === 0) {
		candidates =
			side === "top"
				? ["balloons2.png", "balloons0.png", "balloons.png"]
				: side === "right"
					? ["balloons1.png", "balloons0.png", "balloons.png"]
					: ["balloons0.png", "balloons1.png", "balloons.png"];
	} else if (scopeId === 1) {
		candidates =
			side === "top"
				? ["balloonk2.png", "balloonk0.png", "balloonk.png"]
				: side === "left"
					? ["balloonk1.png", "balloonk3.png", "balloonk0.png", "balloonk.png"]
					: ["balloonk0.png", "balloonk1.png", "balloonk3.png", "balloonk.png"];
	} else {
		candidates = [
			`balloonp${scopeId}.png`,
			`balloonp${scopeId}_0.png`,
			"balloons0.png",
		];
	}

	let bgImageRaw: string | null = null;
	let usedFile: string | null = null;

	for (const file of candidates) {
		bgImageRaw = (await invoke("load_balloon_image", {
			name: theme,
			file,
		}).catch(() => null)) as string | null;
		if (bgImageRaw) {
			usedFile = file;
			break;
		}
	}

	let pnaImage: string | null = null;
	if (usedFile) {
		const pnaFile = usedFile.replace(/\.(png|bmp|jpg|jpeg)$/i, ".pna");
		pnaImage = (await invoke("load_balloon_image", {
			name: theme,
			file: pnaFile,
		}).catch(() => null)) as string | null;
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

		const isBalloonDontMove =
			props["balloon.dontmove"] === "1" ||
			Boolean(instanceContext.balloonDontMove);
		onDontMoveChange?.(isBalloonDontMove);

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
			const vt = parseInt(props["validrect.top"], 10);
			const vr = parseInt(props["validrect.right"], 10);
			const vb = parseInt(props["validrect.bottom"], 10);
			const vl = parseInt(props["validrect.left"], 10);

			const t = Number.isNaN(vt) ? 16 : Math.max(8, Math.abs(vt));
			const r = Number.isNaN(vr) ? 16 : Math.max(8, Math.abs(vr));
			const b = Number.isNaN(vb) ? 16 : Math.max(8, Math.abs(vb));
			const l = Number.isNaN(vl) ? 16 : Math.max(8, Math.abs(vl));

			root.style.setProperty("--balloon-border-image-source", `url("${bgImage}")`);
			root.style.setProperty("--balloon-border-image-slice", `${t} ${r} ${b} ${l} fill`);
			root.style.setProperty("--balloon-border-image-width", `${t}px ${r}px ${b}px ${l}px`);
			root.style.setProperty("--balloon-border-image-repeat", props["border.repeat"] || "repeat");
			root.style.setProperty("--balloon-padding", `${t}px ${r}px ${b}px ${l}px`);

			const dims = await getImageDimensions(bgImage);
			if (dims.width > 0) {
				root.style.setProperty("--balloon-width", `${dims.width}px`);
			}
			if (dims.height > 0) {
				root.style.setProperty("--balloon-min-height", `${dims.height}px`);
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
