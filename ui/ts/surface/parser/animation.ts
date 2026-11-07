/**
 * surfaces.txt SERIKO アニメーションハンドラー
 */

import { splitProtectedCommas } from "./utils.js";

/**
 * animation*.interval 行のパースと登録
 * @param {string} trimmed
 * @param {string[]} currentSurfaces
 * @param {Record<string, import('../surface-parser.js').SurfaceAnimation[]>} animations
 * @param {Record<string, Record<number, import('../surface-parser.js').SurfaceAnimation>>} animationMaps
 */
export function handleAnimationInterval(
	trimmed,
	currentSurfaces,
	animations,
	animationMaps,
) {
	// SERIKO/2 animation[ID].interval / SERIKO/1 [ID]interval
	const match = trimmed.match(/^(?:animation)?(\d+)\.?interval,\s*(.+)$/);
	if (!match) return;

	const animId = Number.parseInt(match[1], 10);
	const interval = match[2].trim();
	currentSurfaces.forEach((s) => {
		if (!animations[s]) animations[s] = [];
		if (!animationMaps[s]) animationMaps[s] = {};
		let anim = animationMaps[s][animId];
		if (!anim) {
			anim = { id: animId, interval, patterns: [] };
			animationMaps[s][animId] = anim;
			animations[s].push(anim);
		} else {
			anim.interval = interval;
		}
	});
}

/**
 * animation*.collision 行のパースと登録
 * @param {string} trimmed
 * @param {string[]} currentSurfaces
 * @param {Record<string, import('../surface-parser.js').SurfaceAnimation[]>} animations
 * @param {Record<string, Record<number, import('../surface-parser.js').SurfaceAnimation>>} animationMaps
 */
export function handleAnimationCollision(
	trimmed,
	currentSurfaces,
	animations,
	animationMaps,
) {
	// SERIKO/2: animation[ID].collision[CID],x1,y1,x2,y2,name
	// SERIKO/1: [ID]collision[CID],x1,y1,x2,y2,name
	const match = trimmed.match(
		/^(?:animation)?(\d+)\.?collision(\d*),\s*(.+)$/i,
	);
	if (!match) return;

	const animId = Number.parseInt(match[1], 10);
	const cid = match[2] ? Number.parseInt(match[2], 10) : undefined;
	const parts = match[3].split(",");
	if (parts.length < 5) return;

	const x1 = Number.parseInt(parts[0], 10);
	const y1 = Number.parseInt(parts[1], 10);
	const x2 = Number.parseInt(parts[2], 10);
	const y2 = Number.parseInt(parts[3], 10);
	const name = parts[4].trim().toLowerCase();

	const col = {
		id: cid,
		name,
		shape: "rect",
		x1,
		y1,
		x2,
		y2,
		minX: Math.min(x1, x2),
		minY: Math.min(y1, y2),
		maxX: Math.max(x1, x2),
		maxY: Math.max(y1, y2),
	};

	currentSurfaces.forEach((s) => {
		if (!animations[s]) animations[s] = [];
		if (!animationMaps[s]) animationMaps[s] = {};
		let anim = animationMaps[s][animId];
		if (!anim) {
			anim = {
				id: animId,
				interval: "sometimes",
				patterns: [],
				collisions: [],
			};
			animationMaps[s][animId] = anim;
			animations[s].push(anim);
		}
		if (!anim.collisions) anim.collisions = [];
		anim.collisions.push(col);
	});
}

/**
 * animation*.collisionex 行のパースと登録
 * @param {string} trimmed
 * @param {string[]} currentSurfaces
 * @param {Record<string, import('../surface-parser.js').SurfaceAnimation[]>} animations
 * @param {Record<string, Record<number, import('../surface-parser.js').SurfaceAnimation>>} animationMaps
 */
export function handleAnimationCollisionEx(
	trimmed,
	currentSurfaces,
	animations,
	animationMaps,
) {
	// SERIKO/2: animation[ID].collisionex[CID],name,shape,coords...
	// SERIKO/1: [ID]collisionex[CID],name,shape,coords...
	const match = trimmed.match(
		/^(?:animation)?(\d+)\.?collisionex(\d*),\s*(.+)$/i,
	);
	if (!match) return;

	const animId = Number.parseInt(match[1], 10);
	const cid = match[2] ? Number.parseInt(match[2], 10) : undefined;
	const parts = match[3].split(",");
	if (parts.length < 3) return;

	const name = parts[0].trim().toLowerCase();
	const shape = parts[1].trim().toLowerCase();
	let col = null;

	if (shape === "circle" || shape === "ellipse") {
		const cx = Number.parseInt(parts[2], 10);
		const cy = Number.parseInt(parts[3], 10);
		const rx = Number.parseInt(parts[4], 10);
		const ry = Number.parseInt(parts[5], 10) || rx;
		col = {
			id: cid,
			name,
			shape,
			cx,
			cy,
			rx,
			ry,
			minX: cx - rx,
			minY: cy - ry,
			maxX: cx + rx,
			maxY: cy + ry,
		};
	} else if (shape === "polygon" || parts.length > 6) {
		const coords = parts
			.slice(2)
			.map((p) => Number.parseInt(p.trim(), 10))
			.filter((n) => !Number.isNaN(n));
		const vertices = [];
		let minX = Infinity;
		let maxX = -Infinity;
		let minY = Infinity;
		let maxY = -Infinity;
		for (let i = 0; i + 1 < coords.length; i += 2) {
			const vx = coords[i];
			const vy = coords[i + 1];
			vertices.push([vx, vy]);
			if (vx < minX) minX = vx;
			if (vx > maxX) maxX = vx;
			if (vy < minY) minY = vy;
			if (vy > maxY) maxY = vy;
		}
		if (vertices.length >= 3) {
			col = {
				id: cid,
				name,
				shape: "polygon",
				vertices,
				minX: Number.isFinite(minX) ? minX : 0,
				minY: Number.isFinite(minY) ? minY : 0,
				maxX: Number.isFinite(maxX) ? maxX : 0,
				maxY: Number.isFinite(maxY) ? maxY : 0,
			};
		}
	} else if (shape === "rect" || parts.length >= 6) {
		const x1 = Number.parseInt(parts[2], 10);
		const y1 = Number.parseInt(parts[3], 10);
		const x2 = Number.parseInt(parts[4], 10);
		const y2 = Number.parseInt(parts[5], 10);
		col = {
			id: cid,
			name,
			shape: "rect",
			x1,
			y1,
			x2,
			y2,
			minX: Math.min(x1, x2),
			minY: Math.min(y1, y2),
			maxX: Math.max(x1, x2),
			maxY: Math.max(y1, y2),
		};
	}

	if (!col) return;

	currentSurfaces.forEach((s) => {
		if (!animations[s]) animations[s] = [];
		if (!animationMaps[s]) animationMaps[s] = {};
		let anim = animationMaps[s][animId];
		if (!anim) {
			anim = {
				id: animId,
				interval: "sometimes",
				patterns: [],
				collisions: [],
			};
			animationMaps[s][animId] = anim;
			animations[s].push(anim);
		}
		if (!anim.collisions) anim.collisions = [];
		anim.collisions.push(col);
	});
}

/**
 * animation*.name 行のパースと登録
 * @param {string} trimmed
 * @param {string[]} currentSurfaces
 * @param {Record<string, import('../surface-parser.js').SurfaceAnimation[]>} animations
 * @param {Record<string, Record<number, import('../surface-parser.js').SurfaceAnimation>>} animationMaps
 */
export function handleAnimationName(
	trimmed,
	currentSurfaces,
	animations,
	animationMaps,
) {
	// SERIKO/2 animation[ID].name,定義名 / SERIKO/1 [ID]name,定義名
	const match = trimmed.match(/^(?:animation)?(\d+)\.?name,\s*(.+)$/);
	if (!match) return;

	const animId = Number.parseInt(match[1], 10);
	const nameStr = match[2].trim();
	currentSurfaces.forEach((s) => {
		if (!animations[s]) animations[s] = [];
		if (!animationMaps[s]) animationMaps[s] = {};
		let anim = animationMaps[s][animId];
		if (!anim) {
			anim = { id: animId, interval: "sometimes", patterns: [] };
			animationMaps[s][animId] = anim;
			animations[s].push(anim);
		}
		anim.name = nameStr;
	});
}

/**
 * animation*.option 行のパースと登録
 * @param {string} trimmed
 * @param {string[]} currentSurfaces
 * @param {Record<string, import('../surface-parser.js').SurfaceAnimation[]>} animations
 * @param {Record<string, Record<number, import('../surface-parser.js').SurfaceAnimation>>} animationMaps
 */
export function handleAnimationOption(
	trimmed,
	currentSurfaces,
	animations,
	animationMaps,
) {
	// SERIKO/2 animation[ID].option,exclusive / SERIKO/1 [ID]option,exclusive
	const match = trimmed.match(/^(?:animation)?(\d+)\.?option,\s*(.+)$/);
	if (!match) return;

	const animId = Number.parseInt(match[1], 10);
	const optionStr = match[2].trim();
	currentSurfaces.forEach((s) => {
		if (!animations[s]) animations[s] = [];
		if (!animationMaps[s]) animationMaps[s] = {};
		let anim = animationMaps[s][animId];
		if (!anim) {
			anim = { id: animId, interval: "sometimes", patterns: [] };
			animationMaps[s][animId] = anim;
			animations[s].push(anim);
		}
		if (!anim.options) anim.options = [];
		anim.options.push(optionStr);
	});
}

/**
 * animation*.pattern 行のパースと登録
 * @param {string} trimmed
 * @param {string[]} currentSurfaces
 * @param {Record<string, import('../surface-parser.js').SurfaceAnimation[]>} animations
 * @param {Record<string, Record<number, import('../surface-parser.js').SurfaceAnimation>>} animationMaps
 */
export function handleAnimationPattern(
	trimmed,
	currentSurfaces,
	animations,
	animationMaps,
) {
	// SERIKO/2: animation[ID].pattern[P],method,surface,wait,x,y
	// SERIKO/1: [ID]pattern[P],surface,wait,method,x,y
	const match = trimmed.match(
		/^(?:animation)?(\d+)\.?(?:pattern)(\d+),\s*(.+)$/,
	);
	if (!match) return;

	const animId = Number.parseInt(match[1], 10);
	const index = Number.parseInt(match[2], 10);

	// 括弧内のカンマを保護しながら分割
	const rawValue = match[3];
	const parts = splitProtectedCommas(rawValue);

	const legacy = !trimmed.startsWith("animation");
	const rawType = (legacy ? parts[2] : parts[0]) || "";
	const typeLower = rawType.trim().toLowerCase();
	const isControlMethod =
		typeLower.startsWith("start") ||
		typeLower.startsWith("stop") ||
		typeLower.startsWith("alternativestart") ||
		typeLower.startsWith("alternativestop") ||
		typeLower.startsWith("parallelstart") ||
		typeLower.startsWith("parallelstop");

	if (parts.length >= 3 || (isControlMethod && parts.length >= 1)) {
		const surface = (legacy ? parts[0] : (parts[1] ?? "-1"))?.trim() ?? "-1";
		const wait = Number.parseInt(legacy ? parts[1] : (parts[2] ?? "0"), 10);
		const x = Number.parseInt(parts[3], 10) || 0;
		const y = Number.parseInt(parts[4], 10) || 0;

		let targetParam = "";
		if (isControlMethod) {
			// パラメータが同一トークンにある場合: alternativestart,(1,2)
			// または第2引数にある場合: start,1
			if (legacy) {
				targetParam = surface;
			} else {
				targetParam = parts[1] ?? "";
			}
		}

		currentSurfaces.forEach((s) => {
			if (!animations[s]) animations[s] = [];
			if (!animationMaps[s]) animationMaps[s] = {};
			let anim = animationMaps[s][animId];
			if (!anim) {
				anim = { id: animId, interval: "sometimes", patterns: [] };
				animationMaps[s][animId] = anim;
				animations[s].push(anim);
			}
			const patternEntry = {
				surface,
				wait: Number.isNaN(wait) ? 0 : wait * (legacy ? 10 : 1),
				type: typeLower,
				x,
				y,
				index,
			};
			if (targetParam) {
				patternEntry.targetParam = targetParam;
			}
			anim.patterns.push(patternEntry);
		});
	}
}

/**
 * 全アニメーションのパターンインデックスソートと不要プロパティの除去
 * @param {Record<string, import('../surface-parser.js').SurfaceAnimation[]>} animations
 */
export function finalizeAnimations(animations) {
	for (const animList of Object.values(animations)) {
		for (const anim of animList) {
			anim.patterns = anim.patterns
				.sort((a, b) => a.index - b.index)
				.map(({ index, ...pattern }) => pattern);
		}
	}
}
