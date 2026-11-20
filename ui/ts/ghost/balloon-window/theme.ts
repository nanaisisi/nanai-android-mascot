/**
 * バルーンスキン descript.txt / 画像アセットの動的読み込み・スタイル反映モジュール
 */

import { applyAssetProperties } from "../../core/actions/balloon-descript/assets.js";
import { applyFontProperties } from "../../core/actions/balloon-descript/font.js";
import { applyLayoutProperties } from "../../core/actions/balloon-descript/layout.js";
import { parseValidRect } from "../../core/actions/balloon-theme-dom.js";
import { invoke, isTauriAvailable } from "../../core/tauri-helper.js";
import { processChromaKey } from "../../surface/surface-compositor.js";
import { updateBalloonWindowScale } from "./scale.js";

const DEFAULT_BALLOON_WIDTH = 280;
const DEFAULT_BALLOON_HEIGHT = 140;
const BALLOON_WINDOW_PADDING = 16;

const balloonBaseDimensions = new Map<
	number,
	{ width: number; height: number }
>();

const STALE_THEME_CSS_PROPS = [
	"--balloon-bg-image",
	"--balloon-max-width",
	"--balloon-max-height",
	"--balloon-arrow-display",
	"--balloon-arrow-image",
	"--balloon-arrow0-image",
	"--balloon-arrow0-width",
	"--balloon-arrow0-height",
	"--balloon-arrow0-x",
	"--balloon-arrow0-y",
	"--balloon-arrow0-left",
	"--balloon-arrow0-right",
	"--balloon-arrow0-top",
	"--balloon-arrow0-bottom",
	"--balloon-arrow1-image",
	"--balloon-arrow1-width",
	"--balloon-arrow1-height",
	"--balloon-arrow1-x",
	"--balloon-arrow1-y",
	"--balloon-arrow1-left",
	"--balloon-arrow1-right",
	"--balloon-arrow1-top",
	"--balloon-arrow1-bottom",
];

function clearCssProperty(el: HTMLElement | null, prop: string) {
	if (!el?.style) return;
	if (typeof el.style.removeProperty === "function") {
		el.style.removeProperty(prop);
	}
}

function readCssProperty(el: HTMLElement | null, prop: string): string {
	if (!el?.style) return "";
	if (typeof el.style.getPropertyValue === "function") {
		return el.style.getPropertyValue(prop).trim();
	}
	return String(
		(el.style as unknown as Record<string, unknown>)[prop] || "",
	).trim();
}

function findArrowElement(
	balloonBox: HTMLElement | null,
	selector: string,
	fallbackId: string,
): HTMLElement | null {
	const boxAny = balloonBox as unknown as {
		querySelector?: (s: string) => HTMLElement | null;
	} | null;
	if (typeof boxAny?.querySelector === "function") {
		const found = boxAny.querySelector(selector);
		if (found) return found;
	}
	return typeof document !== "undefined" &&
		typeof document.getElementById === "function"
		? document.getElementById(fallbackId)
		: null;
}

export function setBalloonBaseDimensions(
	balloonBox: HTMLElement | null,
	scopeId: number,
	width: number,
	height: number,
) {
	const safeWidth = width > 0 ? width : DEFAULT_BALLOON_WIDTH;
	const safeHeight = height > 0 ? height : DEFAULT_BALLOON_HEIGHT;
	balloonBaseDimensions.set(scopeId, {
		width: safeWidth,
		height: safeHeight,
	});
	if (balloonBox?.dataset) {
		balloonBox.dataset.baseWidth = String(safeWidth);
		balloonBox.dataset.baseHeight = String(safeHeight);
	}
}

export function getBalloonBaseDimensions(
	balloonBox: HTMLElement | null,
	scopeId = 0,
): { width: number; height: number } {
	const dsWidth = Number(balloonBox?.dataset?.baseWidth);
	const dsHeight = Number(balloonBox?.dataset?.baseHeight);
	if (
		Number.isFinite(dsWidth) &&
		dsWidth > 0 &&
		Number.isFinite(dsHeight) &&
		dsHeight > 0
	) {
		return { width: dsWidth, height: dsHeight };
	}
	return (
		balloonBaseDimensions.get(scopeId) ?? {
			width: DEFAULT_BALLOON_WIDTH,
			height: DEFAULT_BALLOON_HEIGHT,
		}
	);
}

export function resizeBalloonWindowForScale(
	balloonBox: HTMLElement | null,
	scopeId: number,
	userScale: number,
	dpiScale: number,
) {
	if (!isTauriAvailable()) return;
	const { width, height } = getBalloonBaseDimensions(balloonBox, scopeId);
	const finalScale = +((userScale || 1) * (dpiScale || 1)).toFixed(4);
	const safeWidth = Math.ceil(width * finalScale + BALLOON_WINDOW_PADDING);
	const safeHeight = Math.ceil(height * finalScale + BALLOON_WINDOW_PADDING);
	void invoke("resize_balloon_window", {
		params: {
			scope_id: scopeId,
			width: safeWidth,
			height: safeHeight,
		},
		scope_id: scopeId,
		scopeId,
		width: safeWidth,
		height: safeHeight,
	}).catch(() => {});
}

const getImageDimensions = (
	url: string,
): Promise<{ width: number; height: number }> => {
	return new Promise((resolve) => {
		if (!url || typeof Image === "undefined") {
			resolve({ width: 0, height: 0 });
			return;
		}
		const img = new Image();
		img.onload = () =>
			resolve({
				width: img.naturalWidth || img.width || 0,
				height: img.naturalHeight || img.height || 0,
			});
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
	balloonId: number | null = null,
) {
	const candidates: string[] = [];
	const isFlipped =
		(scopeId === 0 && side === "right") || (scopeId >= 1 && side === "left");

	if (balloonId !== null && typeof balloonId === "number" && balloonId >= 0) {
		const candidateIds =
			balloonId % 2 === 0 && isFlipped
				? [balloonId + 1, balloonId]
				: [balloonId];
		for (const id of candidateIds) {
			if (scopeId === 0) {
				candidates.push(`balloons${id}.png`, `balloons${id}.bmp`);
			} else if (scopeId === 1) {
				candidates.push(`balloonk${id}.png`, `balloonk${id}.bmp`);
			} else {
				candidates.push(
					`balloonp${scopeId}def${id}.png`,
					`balloonp${scopeId}def${id}.bmp`,
					`balloonp${scopeId}_${id}.png`,
					`balloonp${scopeId}_${id}.bmp`,
				);
			}
		}
	}

	if (scopeId === 0) {
		const sideCands =
			side === "top"
				? ["balloons2.png", "balloons0.png", "balloons.png"]
				: side === "right"
					? ["balloons1.png", "balloons0.png", "balloons.png"]
					: ["balloons0.png", "balloons1.png", "balloons.png"];
		candidates.push(...sideCands);
	} else if (scopeId === 1) {
		const sideCands =
			side === "top"
				? ["balloonk2.png", "balloonk0.png", "balloonk.png"]
				: side === "left"
					? ["balloonk1.png", "balloonk3.png", "balloonk0.png", "balloonk.png"]
					: ["balloonk0.png", "balloonk1.png", "balloonk3.png", "balloonk.png"];
		candidates.push(...sideCands);
	} else {
		const sideCands =
			side === "top"
				? [
						`balloonp${scopeId}def2.png`,
						`balloonp${scopeId}def0.png`,
						`balloonp${scopeId}def.png`,
					]
				: side === "left"
					? [
							`balloonp${scopeId}def1.png`,
							`balloonp${scopeId}def3.png`,
							`balloonp${scopeId}def0.png`,
							`balloonp${scopeId}def.png`,
						]
					: [
							`balloonp${scopeId}def0.png`,
							`balloonp${scopeId}def1.png`,
							`balloonp${scopeId}def3.png`,
							`balloonp${scopeId}def.png`,
						];
		candidates.push(
			...sideCands,
			`balloonp${scopeId}.png`,
			`balloonp${scopeId}_0.png`,
			"balloonk0.png",
			"balloonk.png",
			"balloons0.png",
			"balloons.png",
		);
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
	const isSvgImage =
		Boolean(usedFile && /\.svg$/i.test(usedFile)) ||
		Boolean(bgImageRaw?.startsWith("data:image/svg+xml"));
	if (usedFile && !isSvgImage) {
		const pnaFile = usedFile.replace(/\.(png|bmp|jpg|jpeg)$/i, ".pna");
		if (pnaFile !== usedFile) {
			pnaImage = (await invoke("load_balloon_image", {
				name: theme,
				file: pnaFile,
			}).catch(() => null)) as string | null;
		}
	}

	const bgImage = bgImageRaw
		? await processChromaKey(bgImageRaw, pnaImage)
		: null;

	// オプションアセット (balloonc, arrow0/1, sstp, online) のロード試行
	const [ballooncRaw] = await Promise.all([
		invoke("load_balloon_image", {
			name: theme,
			file: "balloonc0.png",
		}).catch(() => null) as Promise<string | null>,
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
		invoke("load_balloon_image", { name: theme, file: "markers.png" }).catch(
			() => null,
		),
		invoke("load_balloon_image", { name: theme, file: "markerk.png" }).catch(
			() => null,
		),
		invoke("load_balloon_image", { name: theme, file: "marker.png" }).catch(
			() => null,
		),
	]);

	if (ballooncRaw) {
		const isBallooncSvg = ballooncRaw.startsWith("data:image/svg+xml");
		let ballooncPna: string | null = null;
		if (!isBallooncSvg) {
			ballooncPna =
				((await invoke("load_balloon_image", {
					name: theme,
					file: "balloonc0.pna",
				}).catch(() => null)) as string | null) ??
				((await invoke("load_balloon_image", {
					name: theme,
					file: "balloonc.pna",
				}).catch(() => null)) as string | null);
		}
		const ballooncImage = await processChromaKey(ballooncRaw, ballooncPna);
		if (typeof document !== "undefined" && document.documentElement?.style) {
			document.documentElement.style.setProperty(
				"--balloon-inputbox-bg-image",
				`url("${ballooncImage}")`,
			);
		}
	} else if (
		typeof document !== "undefined" &&
		document.documentElement?.style
	) {
		document.documentElement.style.removeProperty(
			"--balloon-inputbox-bg-image",
		);
	}

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
	balloonId = null,
	side = "auto",
	currentUserScale,
	onDpiScaleChange,
	onDontMoveChange,
}: {
	theme: string;
	scopeId: number;
	balloonId?: number | null;
	side?: "left" | "right" | "top" | "auto";
	currentUserScale?: number;
	onDpiScaleChange?: (scale: number) => void;
	onDontMoveChange?: (dontMove: boolean) => void;
}) {
	if (!isTauriAvailable()) return null;

	try {
		document.documentElement.setAttribute("data-balloon-theme", theme);
		document.body.className = `balloon-theme-${theme}`;

		const rawProps = await invoke("balloon_manifest", {
			name: theme,
			scopeId,
			balloonId,
		}).catch(() => null);
		if (!rawProps || typeof rawProps !== "object") {
			if (theme !== "default" && theme !== "nam") {
				return await applyBalloonDescript({
					theme: "nam",
					scopeId,
					balloonId,
					side,
					currentUserScale,
					onDpiScaleChange,
					onDontMoveChange,
				});
			}
			return null;
		}
		const props = rawProps as Record<string, string>;
		const balloonBox = document.getElementById("balloon-box");
		const root = document.documentElement;

		for (const prop of STALE_THEME_CSS_PROPS) {
			clearCssProperty(root, prop);
			clearCssProperty(balloonBox, prop);
		}
		if (balloonBox?.style) {
			balloonBox.style.backgroundImage = "";
		}
		const initialTextEl = document.getElementById("balloon-text");
		if (initialTextEl?.style) {
			initialTextEl.style.maxHeight = "";
		}

		// 推奨 DPI (dpi,推奨DPI / 既定値: 96, SSP 2.7.21準拠)
		const parsedDpi = parseInt(props.dpi || props.推奨DPI || "96", 10);
		const balloonDpi =
			!Number.isNaN(parsedDpi) && parsedDpi > 0 ? parsedDpi : 96;
		const nextDpiScale = +(96 / balloonDpi).toFixed(4);
		root.style.setProperty("--balloon-dpi", String(balloonDpi));
		updateBalloonWindowScale(balloonBox, currentUserScale || 1, nextDpiScale);
		onDpiScaleChange?.(nextDpiScale);

		const instanceContext = {
			scopeId,
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
			Boolean(
				(instanceContext as { balloonDontMove?: boolean }).balloonDontMove,
			);
		onDontMoveChange?.(isBalloonDontMove);

		let bgImage = await loadBalloonSkinImages(theme, scopeId, side, balloonId);
		if (!bgImage && theme !== "default" && theme !== "nam") {
			bgImage = await loadBalloonSkinImages("nam", scopeId, side, balloonId);
		}

		let baseWidth = DEFAULT_BALLOON_WIDTH;
		let baseHeight = DEFAULT_BALLOON_HEIGHT;
		let dims = { width: 0, height: 0 };

		if (bgImage) {
			dims = await getImageDimensions(bgImage);
			if (dims.width > 0) {
				baseWidth = dims.width;
			}
			if (dims.height > 0) {
				baseHeight = dims.height;
			}

			root.style.setProperty("--balloon-bg-image", `url("${bgImage}")`);
			if (balloonBox?.style) {
				balloonBox.style.setProperty("--balloon-bg-image", `url("${bgImage}")`);
				balloonBox.style.backgroundImage = `url("${bgImage}")`;
			}
		}

		const {
			top: sliceTop,
			right: sliceRight,
			bottom: sliceBottom,
			left: sliceLeft,
		} = parseValidRect(
			props,
			dims.width > 0 ? dims.width : baseWidth,
			dims.height > 0 ? dims.height : baseHeight,
		);

		const scopePrefix = scopeId === 1 ? "kero" : "sakura";
		const ww = parseInt(
			props["wordwrappoint.x"] ||
				props[`${scopePrefix}.wordwrappoint.x`] ||
				props["sakura.wordwrappoint.x"] ||
				props["kero.wordwrappoint.x"] ||
				"",
			10,
		);
		let effectiveRight = sliceRight;
		if (!Number.isNaN(ww) && ww < 0) {
			effectiveRight = Math.max(sliceRight, Math.abs(ww));
		} else if (!Number.isNaN(ww) && ww > 50 && baseWidth > ww) {
			effectiveRight = Math.max(sliceRight, baseWidth - ww);
		}

		const paddingValue = `${sliceTop}px ${effectiveRight}px ${sliceBottom}px ${sliceLeft}px`;
		root.style.setProperty("--balloon-padding", paddingValue);
		root.style.setProperty("--balloon-max-width", "100%");
		root.style.setProperty("--balloon-width", `${baseWidth}px`);
		root.style.setProperty("--balloon-height", `${baseHeight}px`);
		root.style.setProperty("--balloon-min-height", `${baseHeight}px`);
		root.style.setProperty("--balloon-max-height", `${baseHeight}px`);
		if (balloonBox?.style) {
			balloonBox.style.setProperty("--balloon-padding", paddingValue);
			balloonBox.style.padding = paddingValue;
			balloonBox.style.setProperty("--balloon-max-width", "100%");
			balloonBox.style.setProperty("--balloon-width", `${baseWidth}px`);
			balloonBox.style.setProperty("--balloon-height", `${baseHeight}px`);
			balloonBox.style.setProperty("--balloon-min-height", `${baseHeight}px`);
			balloonBox.style.setProperty("--balloon-max-height", `${baseHeight}px`);
		}

		const textEl = document.getElementById("balloon-text");
		const wwY = parseInt(
			props["wordwrappoint.y"] ||
				props[`${scopePrefix}.wordwrappoint.y`] ||
				props["sakura.wordwrappoint.y"] ||
				props["kero.wordwrappoint.y"] ||
				"",
			10,
		);
		if (textEl?.style) {
			textEl.style.width = "100%";
			textEl.style.maxWidth = "100%";
			textEl.style.maxHeight =
				!Number.isNaN(wwY) && wwY > 20 ? `min(100%, ${wwY}px)` : "";
		}

		setBalloonBaseDimensions(balloonBox, scopeId, baseWidth, baseHeight);
		resizeBalloonWindowForScale(
			balloonBox,
			scopeId,
			currentUserScale || 1,
			nextDpiScale,
		);

		const arrowDefs = [
			{
				file: "arrow0.png",
				imageVar: "--balloon-arrow0-image",
				widthVar: "--balloon-arrow0-width",
				heightVar: "--balloon-arrow0-height",
				selector: ".balloon-scroll-arrow-up",
				fallbackId: "balloon-arrow-up",
			},
			{
				file: "arrow1.png",
				imageVar: "--balloon-arrow1-image",
				widthVar: "--balloon-arrow1-width",
				heightVar: "--balloon-arrow1-height",
				selector: ".balloon-scroll-arrow-down",
				fallbackId: "balloon-arrow-down",
			},
		];

		await Promise.all(
			arrowDefs.map(
				async ({
					file,
					imageVar,
					widthVar,
					heightVar,
					selector,
					fallbackId,
				}) => {
					const arrowEl = findArrowElement(balloonBox, selector, fallbackId);
					const existingImage =
						readCssProperty(balloonBox, imageVar) ||
						readCssProperty(root, imageVar);

					if (!props["arrow.filename"] && !existingImage) {
						const raw = (await invoke("load_balloon_image", {
							name: theme,
							file,
						}).catch(() => null)) as string | null;
						if (raw) {
							const pnaFile = file.replace(/\.png$/i, ".pna");
							const pna = (await invoke("load_balloon_image", {
								name: theme,
								file: pnaFile,
							}).catch(() => null)) as string | null;
							const processed = await processChromaKey(raw, pna);
							if (processed) {
								const arrowDims = await getImageDimensions(processed);
								const cssUrl = `url("${processed}")`;
								root.style.setProperty(imageVar, cssUrl);
								balloonBox?.style?.setProperty(imageVar, cssUrl);
								if (arrowDims.width > 0) {
									root.style.setProperty(widthVar, `${arrowDims.width}px`);
									balloonBox?.style?.setProperty(
										widthVar,
										`${arrowDims.width}px`,
									);
								}
								if (arrowDims.height > 0) {
									root.style.setProperty(heightVar, `${arrowDims.height}px`);
									balloonBox?.style?.setProperty(
										heightVar,
										`${arrowDims.height}px`,
									);
								}
							}
						}
					}

					const resolvedImage =
						readCssProperty(balloonBox, imageVar) ||
						readCssProperty(root, imageVar);
					const hasImage = Boolean(
						resolvedImage &&
							resolvedImage !== "none" &&
							resolvedImage.includes("url("),
					);
					if (arrowEl) {
						if (hasImage && typeof arrowEl.setAttribute === "function") {
							arrowEl.setAttribute("data-has-image", "true");
						} else if (
							!hasImage &&
							typeof arrowEl.removeAttribute === "function"
						) {
							arrowEl.removeAttribute("data-has-image");
						}
					}
				},
			),
		);

		return {
			dpiScale: nextDpiScale,
			isBalloonDontMove,
		};
	} catch (_e) {
		if (theme !== "default" && theme !== "nam") {
			return await applyBalloonDescript({
				theme: "nam",
				scopeId,
				balloonId,
				side,
				currentUserScale,
				onDpiScaleChange,
				onDontMoveChange,
			});
		}
		return null;
	}
}
