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
	let kind = "rect";
	let coords = shape;
	if (typeof shape === "object" && "Polygon" in shape) {
		kind = "polygon";
		coords = shape.Polygon;
	} else if (typeof shape === "object" && "Rect" in shape) {
		coords = shape.Rect;
	}

	if (kind === "polygon") {
		return {
			name: String(area?.name ?? "").toLowerCase(),
			shape: "polygon",
			vertices: (coords?.vertices ?? []).map((p) =>
				Array.isArray(p) ? p : [p?.x ?? 0, p?.y ?? 0],
			),
		};
	}
	return {
		name: String(area?.name ?? "").toLowerCase(),
		shape: "rect",
		x1: Number(coords?.x1 ?? 0),
		y1: Number(coords?.y1 ?? 0),
		x2: Number(coords?.x2 ?? 0),
		y2: Number(coords?.y2 ?? 0),
	};
}

/**
 * 当たり判定レコードへの点内包判定（rect / polygon 偶奇規則）
 * @param {{ name: string, shape: string, x1?: number, y1?: number, x2?: number, y2?: number, vertices?: number[][] }} col
 * @param {number} x
 * @param {number} y
 * @returns {boolean}
 */
export function collisionContains(col, x, y) {
	if (!col) return false;
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
 * @returns {{ collisions: Record<string, any[]>, elements: Record<string, any[]>, animations: Record<string, any[]>, aliases: Record<string, number[]>, keroAliases: Record<string, number[]> }}
 */
export function manifestToSurfaceData(manifest) {
	const collisions = {};
	const elements = {};
	const animations = {};
	const aliases = manifest?.aliases ?? {};
	const keroAliases = manifest?.kero_aliases ?? {};

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
						type: methodToString(p.method) || "overlay",
						x: p.x ?? 0,
						y: p.y ?? 0,
					})),
			}));
	}

	return { collisions, elements, animations, aliases, keroAliases };
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
