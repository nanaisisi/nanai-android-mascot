/**
 * surfaces.txt 基準点 (`point.*`) およびバルーン位置 (`balloon.offset*`) パーサー
 */

/**
 * point.* 定義行を処理
 * @param {string} line
 * @param {string[]} currentSurfaces
 * @param {Record<string, { center_x?: number, center_y?: number, basepos_x?: number, basepos_y?: number, kinoko_center_x?: number, kinoko_center_y?: number }>} points
 */
export function handlePoint(line, currentSurfaces, points) {
	const commaIdx = line.indexOf(",");
	if (commaIdx === -1) return;
	const key = line.slice(0, commaIdx).trim().toLowerCase();
	const valStr = line.slice(commaIdx + 1).trim();
	const val = Number.parseInt(valStr, 10);
	if (Number.isNaN(val)) return;

	const f = key.startsWith("point.") ? key.slice("point.".length) : key;

	for (const s of currentSurfaces) {
		if (!points[s]) {
			points[s] = {};
		}
		const p = points[s];
		switch (f) {
			case "centerx":
			case "center.x":
				p.center_x = val;
				break;
			case "centery":
			case "center.y":
				p.center_y = val;
				break;
			case "baseposx":
			case "basepos.x":
				p.basepos_x = val;
				break;
			case "baseposy":
			case "basepos.y":
				p.basepos_y = val;
				break;
			case "kinoko.centerx":
			case "kinoko.center.x":
				p.kinoko_center_x = val;
				break;
			case "kinoko.centery":
			case "kinoko.center.y":
				p.kinoko_center_y = val;
				break;
			default:
				break;
		}
	}
}

/**
 * balloon.offset* / <scope>.balloon.offset* 定義行を処理
 * @param {string} line
 * @param {string[]} currentSurfaces
 * @param {Record<string, Record<string, { x?: number, y?: number }>>} balloonOffsets
 */
export function handleBalloonOffset(line, currentSurfaces, balloonOffsets) {
	const commaIdx = line.indexOf(",");
	if (commaIdx === -1) return;
	const key = line.slice(0, commaIdx).trim().toLowerCase();
	const valStr = line.slice(commaIdx + 1).trim();
	const val = Number.parseInt(valStr, 10);
	if (Number.isNaN(val)) return;

	let scope = "*";
	let axis = "";

	if (key.startsWith("balloon.offset")) {
		const axisStr = key.slice("balloon.offset".length).replace(/^\./, "");
		axis = axisStr.charAt(0);
	} else if (key.includes(".balloon.offset")) {
		const parts = key.split(".balloon.offset");
		scope = parts[0];
		const axisStr = parts[1].replace(/^\./, "");
		axis = axisStr.charAt(0);
	}

	if (axis !== "x" && axis !== "y") return;

	for (const s of currentSurfaces) {
		if (!balloonOffsets[s]) {
			balloonOffsets[s] = {};
		}
		if (!balloonOffsets[s][scope]) {
			balloonOffsets[s][scope] = {};
		}
		balloonOffsets[s][scope][axis] = val;
	}
}
