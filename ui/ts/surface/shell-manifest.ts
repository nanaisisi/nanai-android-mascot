/**
 * Rust パース済みシェルマニフェスト（`shell_manifest` Tauri コマンド）の消費モジュール
 */
import { invoke } from "../core/tauri-helper.js";

<<<<<<< HEAD
export function enumToString(value: unknown): string {
=======
// biome-ignore lint/suspicious/noExplicitAny: automated fix
export function enumToString(value: any): string {
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
	if (value == null) return "";
	if (typeof value === "string") return value.toLowerCase();
	if (typeof value === "object") {
		const [variant, val] = Object.entries(value)[0] ?? ["", ""];
		const lower = variant.toLowerCase();
		if (val == null) return lower;
		return lower === "custom" ? String(val).toLowerCase() : `${lower},${val}`;
	}
	return String(value).toLowerCase();
}

<<<<<<< HEAD
export function intervalToString(value: unknown): string {
=======
// biome-ignore lint/suspicious/noExplicitAny: automated fix
export function intervalToString(value: any): string {
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
	const s = enumToString(value);
	return s === "yene" ? "\\e" : s;
}

<<<<<<< HEAD
export function methodToString(value: unknown): string {
=======
// biome-ignore lint/suspicious/noExplicitAny: automated fix
export function methodToString(value: any): string {
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
	const s = enumToString(value);
	return s.startsWith("blend,") ? s.replace("blend,", "blend-") : s;
}

<<<<<<< HEAD
export function collisionRecord(area: unknown) {
=======
// biome-ignore lint/suspicious/noExplicitAny: automated fix
export function collisionRecord(area: any) {
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
	const shape = area?.shape ?? {};
	const id = area?.id != null ? Number(area.id) : undefined;
	let kind = "rect";
	let coords = shape;
	if (typeof shape === "object") {
		if ("Polygon" in shape) {
			kind = "polygon";
			coords = shape.Polygon;
		} else if ("Circle" in shape) {
			kind = "circle";
			coords = shape.Circle;
		} else if ("Ellipse" in shape) {
			kind = "ellipse";
			coords = shape.Ellipse;
		} else if ("Rect" in shape) {
			coords = shape.Rect;
		}
	}

	if (kind === "polygon") {
<<<<<<< HEAD
		const vertices = (coords?.vertices ?? []).map((p: unknown) =>
=======
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		const vertices = (coords?.vertices ?? []).map((p: any) =>
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
			Array.isArray(p) ? p : [p?.x ?? 0, p?.y ?? 0],
		);
		let minX = Infinity;
		let maxX = -Infinity;
		let minY = Infinity;
		let maxY = -Infinity;
		for (const [vx, vy] of vertices) {
			if (vx < minX) minX = vx;
			if (vx > maxX) maxX = vx;
			if (vy < minY) minY = vy;
			if (vy > maxY) maxY = vy;
		}
		return {
			id,
			name: String(area?.name ?? "").toLowerCase(),
			shape: "polygon",
			vertices,
			minX: Number.isFinite(minX) ? minX : 0,
			minY: Number.isFinite(minY) ? minY : 0,
			maxX: Number.isFinite(maxX) ? maxX : 0,
			maxY: Number.isFinite(maxY) ? maxY : 0,
		};
	}
	if (kind === "circle" || kind === "ellipse") {
		const cx = Number(coords?.cx ?? 0);
		const cy = Number(coords?.cy ?? 0);
		const rx = Number(coords?.rx ?? coords?.r ?? 0);
		const ry = Number(coords?.ry ?? coords?.r ?? 0);
		return {
			id,
			name: String(area?.name ?? "").toLowerCase(),
			shape: kind,
			cx,
			cy,
			rx,
			ry,
			minX: cx - rx,
			minY: cy - ry,
			maxX: cx + rx,
			maxY: cy + ry,
		};
	}
	const x1 = Number(coords?.x1 ?? 0);
	const y1 = Number(coords?.y1 ?? 0);
	const x2 = Number(coords?.x2 ?? 0);
	const y2 = Number(coords?.y2 ?? 0);
	return {
		id,
		name: String(area?.name ?? "").toLowerCase(),
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

<<<<<<< HEAD
export function collisionContains(col: unknown, x: number, y: number): boolean {
=======
// biome-ignore lint/suspicious/noExplicitAny: automated fix
export function collisionContains(col: any, x: number, y: number): boolean {
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
	if (!col) return false;

	if (
		col.minX != null &&
		col.maxX != null &&
		col.minY != null &&
		col.maxY != null
	) {
		if (x < col.minX || x > col.maxX || y < col.minY || y > col.maxY) {
			return false;
		}
	}

	if (col.shape === "polygon") {
		const vertices = col.vertices ?? [];
		if (vertices.length < 3) return false;
		let inside = false;
		const n = vertices.length;
		for (let i = 0, j = n - 1; i < n; j = i++) {
			const [xi, yi] = vertices[i];
			const [xj, yj] = vertices[j];
			if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
				inside = !inside;
			}
		}
		return inside;
	}
	if (col.shape === "circle" || col.shape === "ellipse") {
		const dx = (x - col.cx) / (col.rx || 0);
		const dy = (y - col.cy) / (col.ry || 0);
		return col.rx > 0 && col.ry > 0 && dx * dx + dy * dy <= 1;
	}
	return (
		x >= Math.min(col.x1, col.x2) &&
		x <= Math.max(col.x1, col.x2) &&
		y >= Math.min(col.y1, col.y2) &&
		y <= Math.max(col.y1, col.y2)
	);
}

<<<<<<< HEAD
export function manifestToSurfaceData(manifest: unknown) {
	const collisions: Record<string, unknown[]> = {};
	const elements: Record<string, unknown[]> = {};
	const animations: Record<string, unknown[]> = {};
	const points: Record<string, unknown> = {};
	const balloonOffsets: Record<string, unknown> = {};
=======
// biome-ignore lint/suspicious/noExplicitAny: automated fix
export function manifestToSurfaceData(manifest: any) {
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	const collisions: Record<string, any[]> = {};
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	const elements: Record<string, any[]> = {};
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	const animations: Record<string, any[]> = {};
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	const points: Record<string, any> = {};
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	const balloonOffsets: Record<string, any> = {};
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
	const aliases = manifest?.aliases ?? {};
	const keroAliases = manifest?.kero_aliases ?? {};
	const cursors = manifest?.cursors ?? {};
	const tooltips = manifest?.tooltips ?? {};
	const collisionSort = enumToString(manifest?.collision_sort) || "none";
	const animationSort = enumToString(manifest?.animation_sort) || "none";
	const names: Record<string, string> = {};
	const iconRects: Record<string, number[]> = {};

	for (const surfaceEntry of manifest?.surfaces ?? []) {
		const sid = String(surfaceEntry.number);
		const def = surfaceEntry.definition ?? {};

		collisions[sid] = (def.collisions ?? []).map(collisionRecord);
		if (def.name) {
			names[sid] = String(def.name);
		}
		if (def.icon_rect) {
			iconRects[sid] = [...def.icon_rect];
		}

		if (def.points) {
			points[sid] = { ...def.points };
		}
		if (def.balloon_offsets) {
			balloonOffsets[sid] = { ...def.balloon_offsets };
		}

		elements[sid] = (def.elements ?? [])
			.slice()
<<<<<<< HEAD
			.sort((a: unknown, b: unknown) => (a.id ?? 0) - (b.id ?? 0))
			.map((e: unknown) => ({
=======
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			.sort((a: any, b: any) => (a.id ?? 0) - (b.id ?? 0))
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			.map((e: any) => ({
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
				id: e.id ?? 0,
				type: methodToString(e.method) || "overlay",
				file: e.file ?? "",
				x: e.x ?? 0,
				y: e.y ?? 0,
			}));

		animations[sid] = Object.values(def.animations ?? {})
<<<<<<< HEAD
			.sort((a: unknown, b: unknown) => (a.id ?? 0) - (b.id ?? 0))
			.map((anim: unknown) => ({
=======
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			.sort((a: any, b: any) => (a.id ?? 0) - (b.id ?? 0))
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			.map((anim: any) => ({
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
				id: anim.id ?? 0,
				interval: intervalToString(anim.interval) || "never",
				collisions: (anim.collisions ?? []).map(collisionRecord),
				patterns: (anim.patterns ?? [])
					.slice()
<<<<<<< HEAD
					.sort((a: unknown, b: unknown) => (a.index ?? 0) - (b.index ?? 0))
					.map((p: unknown) => ({
=======
					// biome-ignore lint/suspicious/noExplicitAny: automated fix
					.sort((a: any, b: any) => (a.index ?? 0) - (b.index ?? 0))
					// biome-ignore lint/suspicious/noExplicitAny: automated fix
					.map((p: any) => ({
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
						surface: String(p.surface ?? -1),
						wait: p.wait ?? 100,
						waitMax: p.wait_max ?? null,
						type: methodToString(p.method) || "overlay",
						x: p.x ?? 0,
						y: p.y ?? 0,
					})),
			}));
	}

	return {
		collisions,
		elements,
		animations,
		points,
		balloonOffsets,
		aliases,
		keroAliases,
		collisionSort,
		animationSort,
		cursors,
		tooltips,
		names,
		iconRects,
	};
}

export async function getShellManifest(ghostName: string, shellName: string) {
	try {
		return await invoke("shell_manifest", { ghostName, shellName });
	} catch (err) {
		console.warn(
			`⚠️ shell_manifest 失敗 (ghost=${ghostName}, shell=${shellName}):`,
			err,
		);
		return null;
	}
}

export async function parseSurfacesTextWithRust(content: string) {
	try {
<<<<<<< HEAD
		const rawMap: unknown = await invoke("parse_surfaces_text", { content });
=======
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		const rawMap: any = await invoke("parse_surfaces_text", { content });
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
		if (!rawMap || typeof rawMap !== "object") return null;

		const surfaces = Object.values(rawMap);
		const data = manifestToSurfaceData({ surfaces });
		return {
			collisions: data.collisions,
			elements: data.elements,
			animations: data.animations,
			points: data.points,
			balloonOffsets: data.balloonOffsets,
		};
	} catch (err) {
		console.warn("⚠️ Rust parse_surfaces_text 失敗:", err);
		return null;
	}
}
