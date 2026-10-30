/**
 * @file assets.js
 * @brief バルーン画像・矢印・マーカー・カーソル・アルファ・推奨ゴースト設定反映 (UKADOC準拠)
 * // [descript.txt（Balloonの）]: Balloon descript.txt アセット・画像属性バインディング
 */
export function applyAssetProperties(root, props, instance) {
	// [descript.txt（Balloonの）]: props
	// [readme,ファイル名]: props["readme"]
	if (props.readme) root.style.setProperty("--balloon-readme", props.readme);

	// [readme.charset,文字コード]: props["readme.charset"]
	if (props["readme.charset"])
		root.style.setProperty("--balloon-readme-charset", props["readme.charset"]);

	// [推奨の意味], [recommended.ghost,ゴースト名], [recommended.ghost.path,パス]:
	if (props["recommended.ghost"])
		root.style.setProperty(
			"--balloon-recommended-ghost",
			props["recommended.ghost"],
		);
	if (props["recommended.ghost.path"])
		root.style.setProperty(
			"--balloon-recommended-ghost-path",
			props["recommended.ghost.path"],
		);

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
	// [arrow.filename,ファイル名]:
	setBalloonImage("arrow.filename", "--balloon-arrow-image");
	// [clickwaitmarker.filename,ファイル名]:
	setBalloonImage("clickwaitmarker.filename", "--balloon-clickwait-image");
	// [marker.filename,ファイル名]:
	setBalloonImage("marker.filename", "--balloon-marker-image");
	// [onlinemarker.filename,ファイル名]:
	setBalloonImage("onlinemarker.filename", "--balloon-online-image");
	// [sstpmarker.filename,ファイル名]:
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
	// [cursor,ファイル名 / mousecursor,ファイル名]:
	setMouseCursor("cursor", "--balloon-cursor-default");
	// [mousecursor.arrow,ファイル名]:
	setMouseCursor("mousecursor.arrow", "--balloon-cursor-arrow");
	// [mousecursor.text,ファイル名]:
	setMouseCursor("mousecursor.text", "--balloon-cursor-text");
	// [mousecursor.wait,ファイル名]:
	setMouseCursor("mousecursor.wait", "--balloon-cursor-wait");

	// [arrow0.x,座標], [arrow0.y,座標], [arrow1.x,座標], [arrow1.y,座標]:
	const arrow0x = parseInt(props["arrow0.x"], 10);
	const arrow0y = parseInt(props["arrow0.y"], 10);
	if (!Number.isNaN(arrow0x))
		root.style.setProperty("--balloon-arrow0-x", `${arrow0x}px`);
	if (!Number.isNaN(arrow0y))
		root.style.setProperty("--balloon-arrow0-y", `${arrow0y}px`);

	const arrow1x = parseInt(props["arrow1.x"], 10);
	const arrow1y = parseInt(props["arrow1.y"], 10);
	if (!Number.isNaN(arrow1x))
		root.style.setProperty("--balloon-arrow1-x", `${arrow1x}px`);
	if (!Number.isNaN(arrow1y))
		root.style.setProperty("--balloon-arrow1-y", `${arrow1y}px`);

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
