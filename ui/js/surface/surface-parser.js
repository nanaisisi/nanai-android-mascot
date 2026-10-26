/**
 * surfaces.txt パーサーモジュール
 */

/**
 * @typedef {Object} CollisionArea
 * @property {number} x1
 * @property {number} y1
 * @property {number} x2
 * @property {number} y2
 * @property {string} name
 * @property {string} shape
 */

/**
 * @typedef {Object} SurfaceElement
 * @property {string} type
 * @property {string} file
 * @property {number} x
 * @property {number} y
 */

/**
 * @typedef {Object} AnimationPattern
 * @property {string|number} surface
 * @property {number} wait
 * @property {string} type
 * @property {number} x
 * @property {number} y
 */

/**
 * @typedef {Object} SurfaceAnimation
 * @property {number} id
 * @property {string} interval
 * @property {AnimationPattern[]} patterns
 */

/**
 * "0-5,10,12" のような範囲文字列を展開して文字列配列にする
 * @param {string} rangeStr
 * @returns {string[]}
 */
export function expandSurfaceRange(rangeStr) {
	const res = [];
	rangeStr.split(",").forEach((part) => {
		if (part.includes("-")) {
			const [start, end] = part.split("-").map((v) => Number.parseInt(v, 10));
			for (let i = start; i <= end; i++) res.push(String(i));
		} else {
			res.push(part.trim());
		}
	});
	return res;
}

/**
 * surfaces.txt をパースして collisions, elements, animations を抽出
 * @param {string} text
 * @returns {{ collisions: Record<string, CollisionArea[]>, elements: Record<string, SurfaceElement[]>, animations: Record<string, SurfaceAnimation[]> }}
 */
export function parseSurfacesTxt(text) {
	const collisions = {};
	const elements = {};
	const animations = {};

	const lines = text.split(/\r?\n/);
	let currentSurfaces = ["default"];

	lines.forEach((line) => {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith("//")) return;

		// surface[ID] または surface.append[ID] ブロック開始
		const surfaceMatch = trimmed.match(/^surface(?:\.append)?([\d,-]+)/);
		if (surfaceMatch) {
			currentSurfaces = expandSurfaceRange(surfaceMatch[1]);
			currentSurfaces.forEach((s) => {
				if (!collisions[s]) collisions[s] = [];
			});
			return;
		}

		// collisionex[ID],[name],[shape],[coords...] または collision[ID],[coords...],[name]
		if (trimmed.startsWith("collisionex")) {
			const parts = trimmed.split(",");
			if (parts.length >= 6) {
				const name = parts[1].trim().toLowerCase();
				const shape = parts[2].trim().toLowerCase();
				const x1 = Number.parseInt(parts[3], 10);
				const y1 = Number.parseInt(parts[4], 10);
				const x2 = Number.parseInt(parts[5], 10);
				const y2 = Number.parseInt(parts[6], 10);

				currentSurfaces.forEach((s) => {
					if (!collisions[s]) collisions[s] = [];
					collisions[s].push({ name, shape, x1, y1, x2, y2 });
				});
			}
		} else if (trimmed.startsWith("collision")) {
			const parts = trimmed.split(",");
			// collision[ID],[x1],[y1],[x2],[y2],[name]
			if (parts.length >= 6) {
				const x1 = Number.parseInt(parts[1], 10);
				const y1 = Number.parseInt(parts[2], 10);
				const x2 = Number.parseInt(parts[3], 10);
				const y2 = Number.parseInt(parts[4], 10);
				const name = parts[5].trim().toLowerCase();

				currentSurfaces.forEach((s) => {
					if (!collisions[s]) collisions[s] = [];
					collisions[s].push({ name, shape: "rect", x1, y1, x2, y2 });
				});
			}
		} else if (trimmed.startsWith("element")) {
			const parts = trimmed.split(",");
			if (parts.length >= 5) {
				const type = parts[1].trim().toLowerCase();
				const file = parts[2].trim();
				const x = Number.parseInt(parts[3], 10) || 0;
				const y = Number.parseInt(parts[4], 10) || 0;

				currentSurfaces.forEach((s) => {
					if (!elements[s]) elements[s] = [];
					elements[s].push({ type, file, x, y });
				});
			}
		} else if (trimmed.includes(".interval,")) {
			// animation[ID].interval,[interval]
			const match = trimmed.match(/^animation(\d+)\.interval,\s*(.+)$/);
			if (match) {
				const animId = Number.parseInt(match[1], 10);
				const interval = match[2].trim();
				currentSurfaces.forEach((s) => {
					if (!animations[s]) animations[s] = [];
					let anim = animations[s].find((a) => a.id === animId);
					if (!anim) {
						anim = { id: animId, interval, patterns: [] };
						animations[s].push(anim);
					} else {
						anim.interval = interval;
					}
				});
			}
		} else if (trimmed.includes(".pattern")) {
			// animation[ID].pattern[P],[surface],[wait],[type],[x],[y]
			const match = trimmed.match(/^animation(\d+)\.pattern\d*,\s*(.+)$/);
			if (match) {
				const animId = Number.parseInt(match[1], 10);
				const pParts = match[2].split(",");
				if (pParts.length >= 2) {
					const patSurface = pParts[0].trim();
					const wait = Number.parseInt(pParts[1], 10) || 100;
					const type = pParts[2] ? pParts[2].trim().toLowerCase() : "overlay";
					const x = pParts[3] ? Number.parseInt(pParts[3], 10) || 0 : 0;
					const y = pParts[4] ? Number.parseInt(pParts[4], 10) || 0 : 0;

					currentSurfaces.forEach((s) => {
						if (!animations[s]) animations[s] = [];
						let anim = animations[s].find((a) => a.id === animId);
						if (!anim) {
							anim = { id: animId, interval: "sometimes", patterns: [] };
							animations[s].push(anim);
						}
						anim.patterns.push({ surface: patSurface, wait, type, x, y });
					});
				}
			}
		}
	});

	return { collisions, elements, animations };
}
