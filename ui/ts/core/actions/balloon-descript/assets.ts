import { invoke } from "../../tauri-helper.js";
import { wasmBridge } from "../../wasm-bridge.js";

/**
 * @file assets.js
 * @brief バルーン画像・矢印・マーカー・カーソル・アルファ・推奨ゴースト設定反映 (UKADOC準拠)
 * // [descript.txt（Balloonの）]: Balloon descript.txt アセット・画像属性バインディング
 */
/**
 * OS/システムロケールに基づく既定文字コードの判定 (UKADOC 規格「OSの標準設定」準拠)
 */
export function getOSSystemDefaultCharset(): string {
	if (typeof navigator !== "undefined" && navigator.language) {
		const lang = navigator.language.toLowerCase();
		if (lang.startsWith("ja")) {
			return "Shift_JIS"; // 日本語 OS システムロケール (CP932)
		}
		if (lang.startsWith("zh-cn") || lang === "zh") {
			return "GBK"; // 簡体字中国語 OS システムロケール (CP936)
		}
		if (lang.startsWith("zh-tw") || lang.startsWith("zh-hk")) {
			return "Big5"; // 繁体字中国語 OS システムロケール (CP950)
		}
		if (lang.startsWith("ko")) {
			return "EUC-KR"; // 韓国語 OS システムロケール (CP949)
		}
	}
	return "Shift_JIS"; // 伺か/SSP エコシステム既定値
}

/**
 * [推奨の意味] [recommended.ghost,ゴースト名] [recommended.ghost.path,パス] の検証関数 (WASM駆動)
 */
export function verifyRecommendedGhost(
	props: Record<string, string>,
	currentGhostName = "",
	currentGhostPath = "",
): { isRecommended: boolean; warning?: string } {
	if (wasmBridge.isReady()) {
		const res = wasmBridge.validateBalloonDescript(
			props,
			currentGhostName,
			currentGhostPath,
		);
		if (res && typeof res === "object") {
			const r = res as Record<string, unknown>;
			const isRec = Boolean(r.isRecommended ?? r.is_recommended);
			const warnMsg = (r.warningMessage ?? r.warning_message ?? r.warning) as
				| string
				| undefined;
			if (!isRec && warnMsg) {
				console.warn(warnMsg);
			}
			return { isRecommended: isRec, warning: warnMsg || undefined };
		}
	}

	const recGhost = props["recommended.ghost"];
	const recPath = props["recommended.ghost.path"];

	if (!recGhost && !recPath) {
		return { isRecommended: true };
	}

	let matchesGhost = true;
	let matchesPath = true;

	if (recGhost && currentGhostName) {
		matchesGhost = currentGhostName.toLowerCase() === recGhost.toLowerCase();
	}

	if (recPath && currentGhostPath) {
		const normRec = recPath.replace(/\\/g, "/").toLowerCase();
		const normCur = currentGhostPath.replace(/\\/g, "/").toLowerCase();
		matchesPath = normCur.endsWith(normRec);
	}

	const isRecommended = matchesGhost && matchesPath;
	if (!isRecommended) {
		const target = recGhost || recPath || "";
		const warning = `⚠️ [Balloon Warning] このバルーンスキンは専用/推奨ゴースト「${target}」向けに特化して作られています。現在のゴースト「${currentGhostName || "不明"}」で使用すると表示が狂う場合があります。`;
		console.warn(warning);
		return { isRecommended: false, warning };
	}

	return { isRecommended: true };
}

interface TauriCoreWithConvert {
	convertFileSrc?: (path: string) => string;
}

function resolveBalloonAssetUrl(fullPath: string): string {
	const tauriCore = (
		globalThis.__TAURI__ as { core?: TauriCoreWithConvert } | undefined
	)?.core;
	return tauriCore?.convertFileSrc
		? tauriCore.convertFileSrc(fullPath)
		: fullPath;
}

export function applyAssetProperties(
	root: HTMLElement,
	props: Record<string, string>,
	instance: {
		rgbFromComponents?: (
			props: Record<string, string>,
			base: string,
		) => string | null;
		applyBalloonDescript?: (props?: unknown) => void;
		balloonDpiScale?: number;
		balloonUserScale?: unknown;
		currentBalloonTheme?: unknown;
		elements?: { balloonDisplay: HTMLElement | null };
		onlineMarkerInterval?: unknown;
	},
) {
	const p = props;

	// [descript.txt（Balloonの）]: props
	// [readme,ファイル名]: props["readme"]
	if (p.readme) root.style.setProperty("--balloon-readme", p.readme);

	// [readme.charset,文字コード]: props["readme.charset"] (未指定時はハードコードせず None / システム設定に委ねる)
	const readmeCharset = p["readme.charset"] || p.charset || "";
	root.style.setProperty("--balloon-readme-charset", readmeCharset);

	// [推奨の意味], [recommended.ghost,ゴースト名], [recommended.ghost.path,パス]:
	if (p["recommended.ghost"]) {
		root.style.setProperty(
			"--balloon-recommended-ghost",
			p["recommended.ghost"],
		);
	}
	if (p["recommended.ghost.path"]) {
		root.style.setProperty(
			"--balloon-recommended-ghost-path",
			p["recommended.ghost.path"],
		);
	}

	const currentGhostName = (instance as Record<string, unknown>)
		?.currentGhostName as string | undefined;
	const currentGhostPath = (instance as Record<string, unknown>)
		?.currentGhostPath as string | undefined;
	const checkResult = verifyRecommendedGhost(
		p,
		currentGhostName,
		currentGhostPath,
	);
	if (!checkResult.isRecommended && checkResult.warning) {
		root.style.setProperty(
			"--balloon-recommended-warning",
			checkResult.warning,
		);
	} else if (typeof root.style.removeProperty === "function") {
		root.style.removeProperty("--balloon-recommended-warning");
	} else {
		root.style.setProperty("--balloon-recommended-warning", "");
	}

	const preloadBalloonAsset = (url: string | null) => {
		if (!url || typeof Image === "undefined") return;
		const cleanUrl = url.replace(/^url\(["']?/, "").replace(/["']?\)$/, "");
		if (!cleanUrl) return;
		const img = new Image();
		img.onload = () => {
			if (img.decode) void img.decode().catch(() => {});
		};
		img.src = cleanUrl;
	};

	const setFallbackAsset = (
		theme: string,
		file: string,
		cssVarName: string,
	) => {
		const url = resolveBalloonAssetUrl(`assets/balloon/${theme}/${file}`);
		preloadBalloonAsset(url);
		root.style.setProperty(cssVarName, `url("${url}")`);
	};

	const setBalloonImage = (propName: string, cssVarName: string) => {
		const filename = p[propName];
		if (filename) {
			const themeName = (instance?.currentBalloonTheme as string) || "default";
			if (typeof invoke === "function") {
				void invoke("load_balloon_image", { name: themeName, file: filename })
					.then((dataUrl) => {
						if (dataUrl) {
							preloadBalloonAsset(dataUrl as string);
							root.style.setProperty(cssVarName, `url("${dataUrl}")`);
						}
					})
					.catch(() => {
						setFallbackAsset(themeName, filename, cssVarName);
					});
			} else {
				setFallbackAsset(themeName, filename, cssVarName);
			}
		}
	};
	// [arrow.filename,ファイル名]: UKADOC 準拠ベース名展開 (拡張子なし -> arrow0=上 / arrow1=下)
	const scopeId: number =
		((instance as Record<string, unknown>)?.scopeId as number) ??
		((instance as Record<string, unknown>)?.currentScopeId as number) ??
		0;
	const defaultArrowBase = p["arrow.filename"]
		? p["arrow.filename"]
		: scopeId === 1
			? "arrowk"
			: scopeId >= 2
				? `arrowp${scopeId}`
				: "arrows";

	const arrowBaseName = defaultArrowBase.replace(/\.(png|bmp|jpg|jpeg)$/i, "");
	const themeName = (instance?.currentBalloonTheme as string) || "default";

	const resolveAndSetArrow = (file: string, cssVar: string) => {
		if (typeof invoke === "function") {
			void invoke("load_balloon_image", { name: themeName, file })
				.then((dataUrl) => {
					if (dataUrl) {
						preloadBalloonAsset(dataUrl as string);
						root.style.setProperty(cssVar, `url("${dataUrl}")`);
						root.style.setProperty("--balloon-arrow-display", "block");
					}
				})
				.catch(() => {
					setFallbackAsset(themeName, file, cssVar);
				});
		} else {
			setFallbackAsset(themeName, file, cssVar);
		}
	};

	if (p["arrow.filename"]) {
		root.style.setProperty("--balloon-arrow-display", "block");
		resolveAndSetArrow(`${arrowBaseName}0.png`, "--balloon-arrow0-image");
		resolveAndSetArrow(`${arrowBaseName}1.png`, "--balloon-arrow1-image");
	} else {
		resolveAndSetArrow(`${arrowBaseName}0.png`, "--balloon-arrow0-image");
		resolveAndSetArrow(`${arrowBaseName}1.png`, "--balloon-arrow1-image");
	}
	setBalloonImage("balloon.image", "--balloon-bg-image");
	setBalloonImage("arrow.filename", "--balloon-arrow-image");
	// [clickwaitmarker.filename,ファイル名]:
	if (p["clickwaitmarker.filename"]) {
		setBalloonImage("clickwaitmarker.filename", "--balloon-clickwait-image");
	} else if (typeof invoke === "function") {
		void invoke("load_balloon_ui_asset", {
			name: themeName,
			stem: "clickwait",
			scopeId,
		})
			.then((dataUrl) => {
				if (dataUrl) {
					preloadBalloonAsset(dataUrl as string);
					root.style.setProperty(
						"--balloon-clickwait-image",
						`url("${dataUrl}")`,
					);
				}
			})
			.catch(() => {});
	}

	if (typeof invoke === "function") {
		const uiButtonAssets: ReadonlyArray<readonly [string, string]> = [
			["ok_button", "--balloon-ok-button-image"],
			["cancel_button", "--balloon-cancel-button-image"],
			["mode_button", "--balloon-mode-button-image"],
		];
		for (const [stem, cssVar] of uiButtonAssets) {
			void invoke("load_balloon_ui_asset", {
				name: themeName,
				stem,
				scopeId,
			})
				.then((dataUrl) => {
					if (dataUrl) {
						preloadBalloonAsset(dataUrl as string);
						root.style.setProperty(cssVar, `url("${dataUrl}")`);
					}
				})
				.catch(() => {});
		}
	}

	// [marker.filename,ファイル名] または UKADOC 標準マーカー (`markers.png`, `markerk.png`, `markerp*def.png`, `marker.png`)
	const defaultMarkerFile = p["marker.filename"]
		? p["marker.filename"]
		: scopeId === 1
			? "markerk.png"
			: scopeId >= 2
				? `markerp${scopeId}def.png`
				: "markers.png";

	const resolveAndSetMarker = (
		file: string,
		fallbackFile: string,
		cssVar: string,
	) => {
		if (typeof invoke === "function") {
			void invoke("load_balloon_image", { name: themeName, file })
				.then((dataUrl) => {
					if (dataUrl) {
						preloadBalloonAsset(dataUrl as string);
						root.style.setProperty(cssVar, `url("${dataUrl}")`);
					} else if (fallbackFile && fallbackFile !== file) {
						resolveAndSetMarker(fallbackFile, "marker.png", cssVar);
					}
				})
				.catch(() => {
					if (fallbackFile && fallbackFile !== file) {
						resolveAndSetMarker(fallbackFile, "marker.png", cssVar);
					}
				});
		} else {
			setFallbackAsset(themeName, file, cssVar);
		}
	};

	resolveAndSetMarker(
		defaultMarkerFile,
		"markers.png",
		"--balloon-marker-image",
	);

	// [onlinemarker.filename,ファイル名]:
	setBalloonImage("onlinemarker.filename", "--balloon-online-image");

	// [sstpmarker.filename,ファイル名] または UKADOC 標準 SSTP マーカー (`sstp_new.png`, `sstp_newk.png`, `sstp.png`, `sstpmarker.png`)
	const defaultSstpMarkerFile = p["sstpmarker.filename"]
		? p["sstpmarker.filename"]
		: scopeId === 1
			? "sstp_newk.png"
			: scopeId >= 2
				? `sstp_newp${scopeId}def.png`
				: "sstp_new.png";

	const resolveAndSetSstpMarker = (
		file: string,
		fallbackFile: string,
		cssVar: string,
	) => {
		if (typeof invoke === "function") {
			void invoke("load_balloon_image", { name: themeName, file })
				.then((dataUrl) => {
					if (dataUrl) {
						preloadBalloonAsset(dataUrl as string);
						root.style.setProperty(cssVar, `url("${dataUrl}")`);
					} else if (fallbackFile && fallbackFile !== file) {
						resolveAndSetSstpMarker(fallbackFile, "sstp.png", cssVar);
					}
				})
				.catch(() => {
					if (fallbackFile && fallbackFile !== file) {
						resolveAndSetSstpMarker(fallbackFile, "sstp.png", cssVar);
					}
				});
		} else {
			setFallbackAsset(themeName, file, cssVar);
		}
	};

	resolveAndSetSstpMarker(
		defaultSstpMarkerFile,
		"sstp.png",
		"--balloon-sstpmarker-image",
	);

	const setMouseCursor = (propName: string, varName: string) => {
		const filename = p[propName];
		if (filename) {
			const themeName = (instance?.currentBalloonTheme as string) || "default";
			if (globalThis.__TAURI__) {
				void invoke("load_balloon_image", { name: themeName, file: filename })
					.then((dataUrl) => {
						if (dataUrl) {
							root.style.setProperty(varName, `url("${dataUrl}"), auto`);
						}
					})
					.catch(() => {});
			} else {
				const fullPath = `assets/balloon/${themeName}/${filename}`;
				root.style.setProperty(varName, `url("${fullPath}"), auto`);
			}
		}
	};
	// [cursor,ファイル名 / mousecursor,ファイル名]:
	// [cursor, mousecursor]:
	setMouseCursor("cursor", "--balloon-cursor-default");
	setMouseCursor("mousecursor", "--balloon-cursor-default");
	// [mousecursor.arrow,ファイル名]:
	setMouseCursor("mousecursor.arrow", "--balloon-cursor-arrow");
	// [mousecursor.text,ファイル名]:
	setMouseCursor("mousecursor.text", "--balloon-cursor-text");
	// [mousecursor.wait,ファイル名]:
	setMouseCursor("mousecursor.wait", "--balloon-cursor-wait");
	// [mousecursor.grip,ファイル名]:
	setMouseCursor("mousecursor.grip", "--balloon-cursor-grip");
	// [mousecursor.hand,ファイル名]:
	setMouseCursor("mousecursor.hand", "--balloon-cursor-hand");

	// [arrow0.x,座標], [arrow0.y,座標], [arrow1.x,座標], [arrow1.y,座標]:
	const applyArrowCoord = (
		value: number,
		prefix: string,
		axis: "x" | "y",
		posEdge: "left" | "top",
		negEdge: "right" | "bottom",
	) => {
		if (Number.isNaN(value)) return;
		root.style.setProperty(`${prefix}-${axis}`, `${value}px`);
		if (value >= 0) {
			root.style.setProperty(`${prefix}-${posEdge}`, `${value}px`);
			root.style.setProperty(`${prefix}-${negEdge}`, "auto");
		} else {
			root.style.setProperty(`${prefix}-${negEdge}`, `${Math.abs(value)}px`);
			root.style.setProperty(`${prefix}-${posEdge}`, "auto");
		}
	};

	applyArrowCoord(
		parseInt(props["arrow0.x"], 10),
		"--balloon-arrow0",
		"x",
		"left",
		"right",
	);
	applyArrowCoord(
		parseInt(props["arrow0.y"], 10),
		"--balloon-arrow0",
		"y",
		"top",
		"bottom",
	);
	applyArrowCoord(
		parseInt(props["arrow1.x"], 10),
		"--balloon-arrow1",
		"x",
		"left",
		"right",
	);
	applyArrowCoord(
		parseInt(props["arrow1.y"], 10),
		"--balloon-arrow1",
		"y",
		"top",
		"bottom",
	);

	// [clickwaitmarker.x,座標], [clickwaitmarker.y,座標]:
	const cwX = parseInt(props["clickwaitmarker.x"], 10);
	const cwY = parseInt(props["clickwaitmarker.y"], 10);
	if (!Number.isNaN(cwX))
		root.style.setProperty("--balloon-clickwait-x", `${cwX}px`);
	if (!Number.isNaN(cwY))
		root.style.setProperty("--balloon-clickwait-y", `${cwY}px`);

	// [sstpmarker.x,座標], [sstpmarker.y,座標]:
	const smX = parseInt(props["sstpmarker.x"], 10);
	const smY = parseInt(props["sstpmarker.y"], 10);
	if (!Number.isNaN(smX))
		root.style.setProperty("--balloon-sstpmarker-x", `${smX}px`);
	if (!Number.isNaN(smY))
		root.style.setProperty("--balloon-sstpmarker-y", `${smY}px`);

	// [vertical,0/1]: props["vertical"]
	const isVertical =
		props.vertical === "1" || props.vertical?.toLowerCase() === "true";
	root.style.setProperty(
		"--balloon-writing-mode",
		isVertical ? "vertical-rl" : "horizontal-tb",
	);

	// [onlinemarker.interval,待機時間], [onlinemarker.x,座標], [onlinemarker.y,座標]:
	const onlineInterval = parseInt(props["onlinemarker.interval"], 10);
	if (!Number.isNaN(onlineInterval))
		instance.onlineMarkerInterval = onlineInterval;
	const onlineX = parseInt(props["onlinemarker.x"], 10);
	const onlineY = parseInt(props["onlinemarker.y"], 10);
	if (!Number.isNaN(onlineX))
		root.style.setProperty("--balloon-online-x", `${onlineX}px`);
	if (!Number.isNaN(onlineY))
		root.style.setProperty("--balloon-online-y", `${onlineY}px`);

	// [sstpmessage.x,座標], [sstpmessage.y,座標]:
	const sstpMsgX = parseInt(props["sstpmessage.x"], 10);
	const sstpMsgY = parseInt(props["sstpmessage.y"], 10);
	if (!Number.isNaN(sstpMsgX))
		root.style.setProperty("--balloon-sstpmessage-x", `${sstpMsgX}px`);
	if (!Number.isNaN(sstpMsgY))
		root.style.setProperty("--balloon-sstpmessage-y", `${sstpMsgY}px`);

	// [paint_transparent_region_black,数値]:
	const paintBlack =
		props.paint_transparent_region_black === "1" ||
		props.paint_transparent_region_black?.toLowerCase() === "true";
	root.style.setProperty("--balloon-paint-black", paintBlack ? "1" : "0");

	// [use_self_alpha,値]:
	const useSelfAlpha =
		props.use_self_alpha === "1" ||
		props.use_self_alpha?.toLowerCase() === "true";
	root.style.setProperty("--balloon-use-self-alpha", useSelfAlpha ? "1" : "0");

	// [use_input_alpha,数値]:
	const useInputAlpha =
		props.use_input_alpha === "1" ||
		props.use_input_alpha?.toLowerCase() === "true";
	root.style.setProperty(
		"--balloon-use-input-alpha",
		useInputAlpha ? "1" : "0",
	);

	// [overlay_outside_balloon,0/1]:
	const overlayOutside =
		props.overlay_outside_balloon === "1" ||
		props.overlay_outside_balloon?.toLowerCase() === "true";
	root.style.setProperty(
		"--balloon-overlay-outside",
		overlayOutside ? "1" : "0",
	);
}
