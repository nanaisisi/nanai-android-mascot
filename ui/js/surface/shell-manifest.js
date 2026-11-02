/**
 * Rust パース済みシェルマニフェスト（`shell_manifest` Tauri コマンド）の消費モジュール
 *
 * Rust `crates/ui`（descript.txt / surfaces.txt / surfacetable.txt パーサー）の
 * 解析結果を JSON マニフェストとして受け取り、既存の SurfaceManager 構造
 * （collisions / elements / animations）へ変換する。
 * ukadoc-spec の突合は Rust パーサー側で実施済みのため、JS 側は変換のみを行う。
 */
import { invoke } from "../core/tauri-helper.js";

/**
 * serde の externally tagged enum → レガシー文字列へ変換
 * 例: "Sometimes" → "sometimes" / { Random: 3 } → "random,3" / { Custom: "foo" } → "foo"
 * @param {string|Record<string, any>|null|undefined} value
 * @returns {string}
 */
export function enumToString(value) {
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

/** interval 文字列化（\e は yen-e とみなす） */
export function intervalToString(value) {
	const s = enumToString(value);
	return s === "yene" ? "\\e" : s;
}

/** 描画メソッド文字列化（Blend → "blend-xxx"） */
export function methodToString(value) {
	const s = enumToString(value);
	return s.startsWith("blend,") ? s.replace("blend,", "blend-") : s;
}

/**
 * Rust CollisionShape（{ Rect: {...} } / { Polygon: { vertices: [[x,y],...] } }）を
 * レガシー当たり判定レコードへ変換
 * @param {Record<string, any>} area
 * @returns {{ name: string, shape: string, x1?: number, y1?: number, x2?: number, y2?: number, vertices?: number[][] }}
 */
export function collisionRecord(area) {
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
		const vertices = (coords?.vertices ?? []).map((p) =>
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

/**
 * 当たり判定レコードへの点内包判定（AABB事前判定 + rect / polygon 偶奇規則）
 * @param {{ name: string, shape: string, x1?: number, y1?: number, x2?: number, y2?: number, minX?: number, minY?: number, maxX?: number, maxY?: number, vertices?: number[][] }} col
 * @param {number} x
 * @param {number} y
 * @returns {boolean}
 */
export function collisionContains(col, x, y) {
	if (!col) return false;

	// AABB高速事前判定
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

/**
 * ShellManifest → SurfaceManager 用レコード（レガシー構造）へ変換
 * @param {Record<string, any>} manifest - Rust `ShellManifest`
 * @returns {{ collisions: Record<string, any[]>, elements: Record<string, any[]>, animations: Record<string, any[]>, aliases: Record<string, number[]>, keroAliases: Record<string, number[]>, collisionSort: string, animationSort: string, cursors: Record<string, Array<{ event: string, collision: string, cursor: string }>>, tooltips: Record<string, Record<string, string>> }}
 */
export function manifestToSurfaceData(manifest) {
	const collisions = {};
	const elements = {};
	const animations = {};
	const aliases = manifest?.aliases ?? {};
	const keroAliases = manifest?.kero_aliases ?? {};
	const cursors = manifest?.cursors ?? {};
	const tooltips = manifest?.tooltips ?? {};
	const collisionSort = enumToString(manifest?.collision_sort) || "none";
	const animationSort = enumToString(manifest?.animation_sort) || "none";

	for (const surfaceEntry of manifest?.surfaces ?? []) {
		const sid = String(surfaceEntry.number);
		const def = surfaceEntry.definition ?? {};

		collisions[sid] = (def.collisions ?? []).map(collisionRecord);

		elements[sid] = (def.elements ?? [])
			.slice()
			.sort((a, b) => (a.id ?? 0) - (b.id ?? 0))
			.map((e) => ({
				id: e.id ?? 0,
				type: methodToString(e.method) || "overlay",
				file: e.file ?? "",
				x: e.x ?? 0,
				y: e.y ?? 0,
			}));

		animations[sid] = Object.values(def.animations ?? {})
			.sort((a, b) => (a.id ?? 0) - (b.id ?? 0))
			.map((anim) => ({
				id: anim.id ?? 0,
				interval: intervalToString(anim.interval) || "never",
				patterns: (anim.patterns ?? [])
					.slice()
					.sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
					.map((p) => ({
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
		aliases,
		keroAliases,
		collisionSort,
		animationSort,
		cursors,
		tooltips,
	};
}

/**
 * Rust 側でシェルをパースしてマニフェストを取得する（失敗時 null）
 * @param {string} ghostName - ゴースト名
 * @param {string} shellName - シェル名
 * @returns {Promise<Record<string, any>|null>}
 */
export async function getShellManifest(ghostName, shellName) {
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

/**
 * Rust 側で surfaces.txt のテキスト内容をパースしてサーフィスデータを取得する
 * @param {string} content
 * @returns {Promise<{ collisions: Record<string, any[]>, elements: Record<string, any[]>, animations: Record<string, any[]> }|null>}
 */
export async function parseSurfacesTextWithRust(content) {
	try {
		const rawMap = await invoke("parse_surfaces_text", { content });
		if (!rawMap || typeof rawMap !== "object") return null;

		const surfaces = Object.values(rawMap);
		const data = manifestToSurfaceData({ surfaces });
		return {
			collisions: data.collisions,
			elements: data.elements,
			animations: data.animations,
		};
	} catch (err) {
		console.warn("⚠️ Rust parse_surfaces_text 失敗:", err);
		return null;
	}
}
