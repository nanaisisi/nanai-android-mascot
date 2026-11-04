/**
 * surfaces.txt collision / collisionex ハンドラー
 */

/**
 * collisionex 行のパースと登録
 * @param {string} trimmed
 * @param {string[]} currentSurfaces
 * @param {Record<string, import('../surface-parser.js').CollisionArea[]>} collisions
 */
export function handleCollisionEx(trimmed, currentSurfaces, collisions) {
	const parts = trimmed.split(",");
	if (parts.length < 5) return;

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

/**
 * レガシー collision 行のパースと登録
 * @param {string} trimmed
 * @param {string[]} currentSurfaces
 * @param {Record<string, import('../surface-parser.js').CollisionArea[]>} collisions
 */
export function handleCollision(trimmed, currentSurfaces, collisions) {
	const parts = trimmed.split(",");
	// collision[ID],[x1],[y1],[x2],[y2],[name]
	if (parts.length < 6) return;

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
