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
 * surfaces.txt をパースして collisions, elements, animations, collisionSort, animationSort, cursors, tooltips を抽出
 * @param {string} text
 * @returns {{ collisions: Record<string, CollisionArea[]>, elements: Record<string, SurfaceElement[]>, animations: Record<string, SurfaceAnimation[]>, collisionSort: string, animationSort: string, cursors: Record<string, Array<{ event: string, collision: string, cursor: string }>>, tooltips: Record<string, Record<string, string>> }}
 */
export function parseSurfacesTxt(text) {
	const collisions = {};
	const elements = {};
	const animations = {};
	const animationMaps = {};
	const cursors = {};
	const tooltips = {};
	let collisionSort = "none";
	let animationSort = "none";

	const lines = text.split(/\r?\n/);
	let currentSurfaces = ["default"];
	let currentScopeBlock = null; // { type: 'cursor'|'tooltip', scope: string }

	lines.forEach((line) => {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith("//")) return;

		if (trimmed === "{") return;
		if (trimmed === "}") {
			currentScopeBlock = null;
			return;
		}

		// collision-sort / collision.sort / animation-sort / animation.sort
		const sortMatch = trimmed.match(
			/^(collision[.-]sort|animation[.-]sort),\s*(\S+)/i,
		);
		if (sortMatch) {
			const key = sortMatch[1].toLowerCase();
			const val = sortMatch[2].toLowerCase();
			if (key.startsWith("collision")) {
				collisionSort = val;
			} else {
				animationSort = val;
			}
			return;
		}

		// *.cursor ブロック開始判定
		const cursorMatch = trimmed.match(
			/^(sakura|kero|char\d+|\*)?\.?cursor\s*\{?$/i,
		);
		if (cursorMatch) {
			let scope = (cursorMatch[1] || "*").toLowerCase();
			if (scope === "char0") scope = "sakura";
			if (scope === "char1") scope = "kero";
			currentScopeBlock = { type: "cursor", scope };
			if (!cursors[scope]) cursors[scope] = [];
			return;
		}

		// *.tooltips ブロック開始判定
		const tooltipsMatch = trimmed.match(
			/^(sakura|kero|char\d+|\*)?\.?tooltips\s*\{?$/i,
		);
		if (tooltipsMatch) {
			let scope = (tooltipsMatch[1] || "*").toLowerCase();
			if (scope === "char0") scope = "sakura";
			if (scope === "char1") scope = "kero";
			currentScopeBlock = { type: "tooltip", scope };
			if (!tooltips[scope]) tooltips[scope] = {};
			return;
		}

		// スコープブロック内の行処理
		if (currentScopeBlock?.type === "cursor") {
			const parts = trimmed.split(",");
			if (parts.length >= 3) {
				const rawEvent = parts[0].trim().toLowerCase();
				const collision = parts[1].trim();
				const cursor = parts[2].trim();
				let event = rawEvent;
				if (rawEvent.startsWith("mouseup")) event = "mouseup";
				else if (rawEvent.startsWith("mousedown")) event = "mousedown";
				else if (rawEvent.startsWith("mouserightdown"))
					event = "mouserightdown";
				else if (rawEvent.startsWith("mousewheel")) event = "mousewheel";
				else if (rawEvent.startsWith("mousehover")) event = "mousehover";

				cursors[currentScopeBlock.scope].push({ event, collision, cursor });
			}
			return;
		}

		if (currentScopeBlock?.type === "tooltip") {
			const commaIdx = trimmed.indexOf(",");
			if (commaIdx !== -1) {
				const collision = trimmed.slice(0, commaIdx).trim();
				const text = trimmed.slice(commaIdx + 1).trim();
				if (collision) {
					tooltips[currentScopeBlock.scope][collision] = text;
				}
			}
			return;
		}

		// surface[ID] または surface.append[ID] ブロック開始
		const surfaceMatch = trimmed.match(/^surface(?:\.append)?([\d,-]+)/);
		if (surfaceMatch) {
			currentScopeBlock = null;
			currentSurfaces = expandSurfaceRange(surfaceMatch[1]);
			currentSurfaces.forEach((s) => {
				if (!collisions[s]) collisions[s] = [];
			});
			return;
		}

		// collisionex[ID],[name],[shape],[coords...] または collision[ID],[coords...],[name]
		if (trimmed.startsWith("collisionex")) {
			const parts = trimmed.split(",");
			if (parts.length >= 5) {
				const idMatch = parts[0].match(/collisionex(\d+)/i);
				const id = idMatch ? Number.parseInt(idMatch[1], 10) : undefined;
				const name = parts[1].trim().toLowerCase();
				const shape = parts[2].trim().toLowerCase();

				currentSurfaces.forEach((s) => {
					if (!collisions[s]) collisions[s] = [];
					if (shape === "circle" || shape === "ellipse") {
						const cx = Number.parseInt(parts[3], 10);
						const cy = Number.parseInt(parts[4], 10);
						const rx = Number.parseInt(parts[5], 10);
						const ry = Number.parseInt(parts[6], 10) || rx;
						collisions[s].push({
							id,
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
						});
					} else if (parts.length >= 7) {
						const x1 = Number.parseInt(parts[3], 10);
						const y1 = Number.parseInt(parts[4], 10);
						const x2 = Number.parseInt(parts[5], 10);
						const y2 = Number.parseInt(parts[6], 10);
						collisions[s].push({
							id,
							name,
							shape,
							x1,
							y1,
							x2,
							y2,
							minX: Math.min(x1, x2),
							minY: Math.min(y1, y2),
							maxX: Math.max(x1, x2),
							maxY: Math.max(y1, y2),
						});
					}
				});
			}
		} else if (trimmed.startsWith("collision")) {
			const parts = trimmed.split(",");
			// collision[ID],[x1],[y1],[x2],[y2],[name]
			if (parts.length >= 6) {
				const idMatch = parts[0].match(/collision(\d+)/i);
				const id = idMatch ? Number.parseInt(idMatch[1], 10) : undefined;
				const x1 = Number.parseInt(parts[1], 10);
				const y1 = Number.parseInt(parts[2], 10);
				const x2 = Number.parseInt(parts[3], 10);
				const y2 = Number.parseInt(parts[4], 10);
				const name = parts[5].trim().toLowerCase();

				currentSurfaces.forEach((s) => {
					if (!collisions[s]) collisions[s] = [];
					collisions[s].push({
						id,
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
					});
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
		} else if (/^(?:animation\d+\.|\d+)interval,/.test(trimmed)) {
			// SERIKO/2 animation[ID].interval / SERIKO/1 [ID]interval
			const match = trimmed.match(/^(?:animation)?(\d+)\.?interval,\s*(.+)$/);
			if (match) {
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
		} else if (/^(?:animation\d+\.|\d+)name,/.test(trimmed)) {
			// SERIKO/2 animation[ID].name,定義名 / SERIKO/1 [ID]name,定義名
			const match = trimmed.match(/^(?:animation)?(\d+)\.?name,\s*(.+)$/);
			if (match) {
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
		} else if (/^(?:animation\d+\.|\d+)option,/.test(trimmed)) {
			// SERIKO/2 animation[ID].option,exclusive / SERIKO/1 [ID]option,exclusive
			const match = trimmed.match(/^(?:animation)?(\d+)\.?option,\s*(.+)$/);
			if (match) {
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
		} else if (/^(?:animation\d+\.|\d+)pattern\d+,/.test(trimmed)) {
			// SERIKO/2: animation[ID].pattern[P],method,surface,wait,x,y
			// SERIKO/1: [ID]pattern[P],surface,wait,method,x,y
			const match = trimmed.match(
				/^(?:animation)?(\d+)\.?(?:pattern)(\d+),\s*(.+)$/,
			);
			if (match) {
				const animId = Number.parseInt(match[1], 10);
				const index = Number.parseInt(match[2], 10);

				// 括弧内のカンマを保護しながら分割
				const rawValue = match[3];
				const parts = [];
				let current = "";
				let depthParen = 0;
				let depthBracket = 0;
				for (let i = 0; i < rawValue.length; i++) {
					const ch = rawValue[i];
					if (ch === "(") depthParen++;
					else if (ch === ")") depthParen = Math.max(0, depthParen - 1);
					else if (ch === "[") depthBracket++;
					else if (ch === "]") depthBracket = Math.max(0, depthBracket - 1);
					else if (ch === "," && depthParen === 0 && depthBracket === 0) {
						parts.push(current.trim());
						current = "";
						continue;
					}
					current += ch;
				}
				if (current.trim().length > 0) parts.push(current.trim());

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
					const surface =
						(legacy ? parts[0] : (parts[1] ?? "-1"))?.trim() ?? "-1";
					const wait = Number.parseInt(
						legacy ? parts[1] : (parts[2] ?? "0"),
						10,
					);
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
		}
	});

	for (const animList of Object.values(animations)) {
		for (const anim of animList) {
			anim.patterns = anim.patterns
				.sort((a, b) => a.index - b.index)
				.map(({ index, ...pattern }) => pattern);
		}
	}
	return {
		collisions,
		elements,
		animations,
		collisionSort,
		animationSort,
		cursors,
		tooltips,
	};
}
