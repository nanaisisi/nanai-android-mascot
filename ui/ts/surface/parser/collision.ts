/**
 * surfaces.txt collision / collisionex ハンドラー
 */

/**
 * collisionex 行のパースと登録
 * @param {string} trimmed
 * @param {string[]} currentSurfaces
 * @param {Record<string, import('../surface-parser.js').CollisionArea[]>} collisions
 */
export function handleCollisionEx(
	trimmed: string,
	currentSurfaces: unknown[],
	collisions: {
		[x: string]: {
			id: number | undefined;
			name: unknown;
			shape: unknown;
			x1: number;
			y1: number;
			x2: number;
			y2: number;
			minX: number;
			minY: number;
			maxX: number;
			maxY: number;
		}[];
	},
) {
	const parts = trimmed.split(",");
	if (parts.length < 5) return;

	const idMatch = parts[0].match(/collisionex(\d+)/i);
	const id = idMatch ? Number.parseInt(idMatch[1], 10) : undefined;
	const name = parts[1].trim().toLowerCase();
	const shape = parts[2].trim().toLowerCase();

	currentSurfaces.forEach((s: string | number) => {
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
		} else if (shape === "polygon" || parts.length > 7) {
			const coords = parts
				.slice(3)
				.map((p: string) => Number.parseInt(p.trim(), 10))
				.filter((n: unknown) => !Number.isNaN(n));
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
				collisions[s].push({
					id,
					name,
					shape: "polygon",
					vertices,
					minX: Number.isFinite(minX) ? minX : 0,
					minY: Number.isFinite(minY) ? minY : 0,
					maxX: Number.isFinite(maxX) ? maxX : 0,
					maxY: Number.isFinite(maxY) ? maxY : 0,
				});
			}
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
export function handleCollision(
	trimmed: string,
	currentSurfaces: unknown[],
	collisions: {
		[x: string]: {
			id: number | undefined;
			name: unknown;
			shape: string;
			x1: number;
			y1: number;
			x2: number;
			y2: number;
			minX: number;
			minY: number;
			maxX: number;
			maxY: number;
		}[];
	},
) {
	const parts = trimmed.split(",");
	// collision[ID],[x1],[y1],[x2],[y2],[name]
	// または legacy 7-part: collision,[ID],[x1],[y1],[x2],[y2],[name]
	if (parts.length < 6) return;

	const idMatch = parts[0].match(/collision(\d+)/i);
	let id = idMatch ? Number.parseInt(idMatch[1], 10) : undefined;
	let offset = 0;
	if (id === undefined && parts.length >= 7) {
		const parsedId = Number.parseInt(parts[1], 10);
		if (!Number.isNaN(parsedId)) {
			id = parsedId;
			offset = 1;
		}
	}

	const x1 = Number.parseInt(parts[offset + 1], 10);
	const y1 = Number.parseInt(parts[offset + 2], 10);
	const x2 = Number.parseInt(parts[offset + 3], 10);
	const y2 = Number.parseInt(parts[offset + 4], 10);
	const name = parts[offset + 5].trim().toLowerCase();

	currentSurfaces.forEach((s: string | number) => {
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
