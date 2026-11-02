/**
 * @file alignment.js
 * @brief バルーンの移動禁止・スケール同期・アライメント・オフセット設定反映 (UKADOC準拠)
 */

export function applyAlignmentProperties(root, props, instance) {
	// [balloon.dontmove,数値], [sakura.balloon.dontmove,数値], [kero.balloon.dontmove,数値]:
	// バルーンの手動移動制限フラグ
	const dontMove =
		props["balloon.dontmove"] === "1" ||
		props["balloon.dontmove"]?.toLowerCase() === "true" ||
		props["sakura.balloon.dontmove"] === "1" ||
		props["sakura.balloon.dontmove"]?.toLowerCase() === "true" ||
		props["kero.balloon.dontmove"] === "1" ||
		props["kero.balloon.dontmove"]?.toLowerCase() === "true";
	instance.balloonDontMove = dontMove;
	root.style.setProperty("--balloon-dontmove", dontMove ? "1" : "0");

	// [balloon.syncscale,true], [sakura.balloon.syncscale,true], [kero.balloon.syncscale,true]:
	// キャラクター本体との倍率同期設定
	const syncScale =
		props["balloon.syncscale"] === "1" ||
		props["balloon.syncscale"]?.toLowerCase() === "true" ||
		props["sakura.balloon.syncscale"] === "1" ||
		props["sakura.balloon.syncscale"]?.toLowerCase() === "true" ||
		props["kero.balloon.syncscale"] === "1" ||
		props["kero.balloon.syncscale"]?.toLowerCase() === "true";
	instance.balloonSyncScale = syncScale;
	root.style.setProperty("--balloon-syncscale", syncScale ? "1" : "0");

	// [sakura.balloon.alignment,位置情報], [kero.balloon.alignment,位置情報]:
	const alignment =
		props["balloon.alignment"] ||
		props["sakura.balloon.alignment"] ||
		props["kero.balloon.alignment"];
	if (alignment) {
		instance.balloonAlignment = alignment;
		root.style.setProperty("--balloon-alignment", alignment);
	}

	// [sakura.balloon.offsetx,座標], [sakura.balloon.offsety,座標], [kero.balloon.offsetx,座標], [kero.balloon.offsety,座標]:
	const offsetX =
		props["balloon.offsetx"] ||
		props["sakura.balloon.offsetx"] ||
		props["kero.balloon.offsetx"];
	const offsetY =
		props["balloon.offsety"] ||
		props["sakura.balloon.offsety"] ||
		props["kero.balloon.offsety"];
	if (offsetX !== undefined && offsetX !== "") {
		const parsedOffsetX = parseInt(offsetX, 10);
		if (!Number.isNaN(parsedOffsetX)) {
			root.style.setProperty("--balloon-offset-x", `${parsedOffsetX}px`);
		}
	}
	if (offsetY !== undefined && offsetY !== "") {
		const parsedOffsetY = parseInt(offsetY, 10);
		if (!Number.isNaN(parsedOffsetY)) {
			root.style.setProperty("--balloon-offset-y", `${parsedOffsetY}px`);
		}
	}
}
