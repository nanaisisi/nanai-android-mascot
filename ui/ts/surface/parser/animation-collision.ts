/**
 * surfaces.txt SERIKO アニメーション当たり判定ハンドラー
 */

export function handleAnimationCollision(
	trimmed: string,
	currentSurfaces: unknown[],
	animations: { [x: string]: unknown[] },
	animationMaps: { [x: string]: unknown[] },
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

	currentSurfaces.forEach((s: string | number) => {
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

export function handleAnimationCollisionEx(
	trimmed: string,
	currentSurfaces: unknown[],
	animations: { [x: string]: unknown[] },
	animationMaps: { [x: string]: unknown[] },
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

	currentSurfaces.forEach((s: string | number) => {
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

