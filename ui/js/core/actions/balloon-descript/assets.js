/**
 * @file assets.js
 * @brief バルーン画像・矢印・マーカー・カーソル・アルファ設定反映
 */
export function applyAssetProperties(root, props, instance) {
	const setBalloonImage = (propName, cssVarName) => {
		const filename = props[propName];
		if (filename) {
			const themeName = instance.currentBalloonTheme || "default";
			const fullPath = `assets/balloon/${themeName}/${filename}`;
			const url = globalThis.__TAURI__?.core?.convertFileSrc
				? globalThis.__TAURI__.core.convertFileSrc(fullPath)
				: fullPath;
			root.style.setProperty(cssVarName, `url("${url}")`);
		}
	};
	setBalloonImage("arrow.filename", "--balloon-arrow-image");
	setBalloonImage("clickwaitmarker.filename", "--balloon-clickwait-image");
	setBalloonImage("marker.filename", "--balloon-marker-image");
	setBalloonImage("onlinemarker.filename", "--balloon-online-image");
	setBalloonImage("sstpmarker.filename", "--balloon-sstpmarker-image");

	const setMouseCursor = (propName, varName) => {
		const filename = props[propName];
		if (filename) {
			const themeName = instance.currentBalloonTheme || "default";
			const fullPath = `assets/balloon/${themeName}/${filename}`;
			const url = globalThis.__TAURI__?.core?.convertFileSrc
				? globalThis.__TAURI__.core.convertFileSrc(fullPath)
				: fullPath;
			root.style.setProperty(varName, `url("${url}"), auto`);
		}
	};
	setMouseCursor("mousecursor.arrow", "--balloon-cursor-arrow");
	setMouseCursor("mousecursor.text", "--balloon-cursor-text");
	setMouseCursor("mousecursor.wait", "--balloon-cursor-wait");

	const arrow0x = parseInt(props["arrow0.x"], 10);
	const arrow0y = parseInt(props["arrow0.y"], 10);
	if (!Number.isNaN(arrow0x)) root.style.setProperty("--balloon-arrow0-x", `${arrow0x}px`);
	if (!Number.isNaN(arrow0y)) root.style.setProperty("--balloon-arrow0-y", `${arrow0y}px`);

	const arrow1x = parseInt(props["arrow1.x"], 10);
	const arrow1y = parseInt(props["arrow1.y"], 10);
	if (!Number.isNaN(arrow1x)) root.style.setProperty("--balloon-arrow1-x", `${arrow1x}px`);
	if (!Number.isNaN(arrow1y)) root.style.setProperty("--balloon-arrow1-y", `${arrow1y}px`);

	const cwX = parseInt(props["clickwaitmarker.x"], 10);
	const cwY = parseInt(props["clickwaitmarker.y"], 10);
	if (!Number.isNaN(cwX)) root.style.setProperty("--balloon-clickwait-x", `${cwX}px`);
	if (!Number.isNaN(cwY)) root.style.setProperty("--balloon-clickwait-y", `${cwY}px`);

	const isVertical = props["vertical"] === "1" || props["vertical"]?.toLowerCase() === "true";
	root.style.setProperty("--balloon-writing-mode", isVertical ? "vertical-rl" : "horizontal-tb");

	const onlineInterval = parseInt(props["onlinemarker.interval"], 10);
	if (!Number.isNaN(onlineInterval)) instance.onlineMarkerInterval = onlineInterval;
	const onlineX = parseInt(props["onlinemarker.x"], 10);
	const onlineY = parseInt(props["onlinemarker.y"], 10);
	if (!Number.isNaN(onlineX)) root.style.setProperty("--balloon-online-x", `${onlineX}px`);
	if (!Number.isNaN(onlineY)) root.style.setProperty("--balloon-online-y", `${onlineY}px`);

	const sstpMsgX = parseInt(props["sstpmessage.x"], 10);
	const sstpMsgY = parseInt(props["sstpmessage.y"], 10);
	if (!Number.isNaN(sstpMsgX)) root.style.setProperty("--balloon-sstpmessage-x", `${sstpMsgX}px`);
	if (!Number.isNaN(sstpMsgY)) root.style.setProperty("--balloon-sstpmessage-y", `${sstpMsgY}px`);

	const paintBlack = props["paint_transparent_region_black"] === "1" || props["paint_transparent_region_black"]?.toLowerCase() === "true";
	root.style.setProperty("--balloon-paint-black", paintBlack ? "1" : "0");

	const useSelfAlpha = props["use_self_alpha"] === "1" || props["use_self_alpha"]?.toLowerCase() === "true";
	root.style.setProperty("--balloon-use-self-alpha", useSelfAlpha ? "1" : "0");

	const useInputAlpha = props["use_input_alpha"] === "1" || props["use_input_alpha"]?.toLowerCase() === "true";
	root.style.setProperty("--balloon-use-input-alpha", useInputAlpha ? "1" : "0");

	const overlayOutside = props["overlay_outside_balloon"] === "1" || props["overlay_outside_balloon"]?.toLowerCase() === "true";
	root.style.setProperty("--balloon-overlay-outside", overlayOutside ? "1" : "0");
}
