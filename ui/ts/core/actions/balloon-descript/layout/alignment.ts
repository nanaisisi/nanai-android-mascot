/**
 * @file alignment.js
 * @brief バルーンの移動禁止・スケール同期・アライメント・オフセット設定反映 (UKADOC準拠)
 */

export function applyAlignmentProperties(
	root: HTMLElement,
	props: Record<string, string>,
	instance: {
		scopeId?: number;
		currentScopeId?: number;
		balloonDontMove?: boolean;
		balloonSyncScale?: boolean;
		balloonAlignment?: string;
	},
) {
	const scopeId = instance?.scopeId ?? instance?.currentScopeId ?? 0;
	const charPrefix = `char${scopeId}.balloon`;

	// [balloon.dontmove,数値], [sakura.balloon.dontmove,数値], [kero.balloon.dontmove,数値], [char*.balloon.dontmove]:
	// バルーンの手動移動制限フラグ
	const dontMove =
		props["balloon.dontmove"] === "1" ||
		props["balloon.dontmove"]?.toLowerCase() === "true" ||
		props["sakura.balloon.dontmove"] === "1" ||
		props["sakura.balloon.dontmove"]?.toLowerCase() === "true" ||
		props["kero.balloon.dontmove"] === "1" ||
		props["kero.balloon.dontmove"]?.toLowerCase() === "true" ||
		props[`${charPrefix}.dontmove`] === "1" ||
		props[`${charPrefix}.dontmove`]?.toLowerCase() === "true";
	instance.balloonDontMove = dontMove;
	root.style.setProperty("--balloon-dontmove", dontMove ? "1" : "0");

	// [balloon.syncscale,true], [sakura.balloon.syncscale,true], [kero.balloon.syncscale,true], [char*.balloon.syncscale]:
	// キャラクター本体との倍率同期設定
	const syncScale =
		props["balloon.syncscale"] === "1" ||
		props["balloon.syncscale"]?.toLowerCase() === "true" ||
		props["sakura.balloon.syncscale"] === "1" ||
		props["sakura.balloon.syncscale"]?.toLowerCase() === "true" ||
		props["kero.balloon.syncscale"] === "1" ||
		props["kero.balloon.syncscale"]?.toLowerCase() === "true" ||
		props[`${charPrefix}.syncscale`] === "1" ||
		props[`${charPrefix}.syncscale`]?.toLowerCase() === "true";
	instance.balloonSyncScale = syncScale;
	root.style.setProperty("--balloon-syncscale", syncScale ? "1" : "0");

	// [sakura.balloon.alignment,位置情報], [kero.balloon.alignment,位置情報], [char*.balloon.alignment]:
	const alignment =
		props[`${charPrefix}.alignment`] ||
		(scopeId === 0 ? props["sakura.balloon.alignment"] : null) ||
		(scopeId === 1 ? props["kero.balloon.alignment"] : null) ||
		props["balloon.alignment"] ||
		props["sakura.balloon.alignment"] ||
		props["kero.balloon.alignment"];
	if (alignment) {
		const cleanAlignment = String(alignment).trim().toLowerCase();
		instance.balloonAlignment = cleanAlignment;
		root.style.setProperty("--balloon-alignment", cleanAlignment);

		// UKADOC 標準アライメントに基づく CSS 配置ヒントトークンの設定
		switch (cleanAlignment) {
			case "overhead":
			case "top":
				root.style.setProperty("--balloon-valign", "top");
				root.style.setProperty("--balloon-halign", "center");
				break;
			case "bottom":
			case "underfoot":
				root.style.setProperty("--balloon-valign", "bottom");
				root.style.setProperty("--balloon-halign", "center");
				break;
			case "left":
				root.style.setProperty("--balloon-halign", "left");
				break;
			case "right":
				root.style.setProperty("--balloon-halign", "right");
				break;
			default:
				root.style.setProperty("--balloon-valign", "none");
				root.style.setProperty("--balloon-halign", "none");
				break;
		}
	}

	// [sakura.balloon.offsetx,座標], [sakura.balloon.offsety,座標], [kero.balloon.offsetx,座標], [kero.balloon.offsety,座標], [char*.balloon.offsetx/y]:
	const offsetX =
		props[`${charPrefix}.offsetx`] ||
		(scopeId === 0 ? props["sakura.balloon.offsetx"] : null) ||
		(scopeId === 1 ? props["kero.balloon.offsetx"] : null) ||
		props["balloon.offsetx"] ||
		props["sakura.balloon.offsetx"] ||
		props["kero.balloon.offsetx"];
	const offsetY =
		props[`${charPrefix}.offsety`] ||
		(scopeId === 0 ? props["sakura.balloon.offsety"] : null) ||
		(scopeId === 1 ? props["kero.balloon.offsety"] : null) ||
		props["balloon.offsety"] ||
		props["sakura.balloon.offsety"] ||
		props["kero.balloon.offsety"];

	if (offsetX !== undefined && offsetX !== "" && offsetX !== null) {
		const parsedOffsetX = parseInt(String(offsetX), 10);
		if (!Number.isNaN(parsedOffsetX)) {
			root.style.setProperty("--balloon-offset-x", `${parsedOffsetX}px`);
		}
	}
	if (offsetY !== undefined && offsetY !== "" && offsetY !== null) {
		const parsedOffsetY = parseInt(String(offsetY), 10);
		if (!Number.isNaN(parsedOffsetY)) {
			root.style.setProperty("--balloon-offset-y", `${parsedOffsetY}px`);
		}
	}
}
