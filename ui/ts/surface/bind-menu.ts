/**
 * Rust ShellManifest 由来の着せ替え (bind) メニューデータ構築 (UKADOC準拠)
 *
 * `shell_manifest` コマンド（crates/ui の descript.txt パーサー）が返す
 * `sakura_bind_groups` / `kero_bind_groups`（BindGroup: number/category/part/
 * thumbnail/default/add_ids）と descript `bindoption.group` を
 * オーナードローメニュー表示用のカテゴリ階層へ変換する。
 */

/** bindoption.group の descript キー（スコープ0/1） */
export function bindOptionKey(scopeId = 0) {
	return scopeId === 0 ? "sakura.bindoption.group" : "kero.bindoption.group";
}

/**
 * `bindgroup` 一覧をスコープで取得（scope 0 = さくら / それ以外 = うにゅ）
 * @param {Record<string, any>|null|undefined} manifest - Rust ShellManifest
 * @param {number} [scopeId]
 * @returns {Array<{ number: number, category: string, part: string, thumbnail?: string|null, default: boolean, add_ids: number[] }>}
 */
export function bindGroupsForScope(manifest, scopeId = 0) {
	if (!manifest) return [];
	const groups =
		scopeId === 0 ? manifest.sakura_bind_groups : manifest.kero_bind_groups;
	return Array.isArray(groups) ? groups : [];
}

/**
 * `[target].bindoption.group,[カテゴリ名],[mustselect|multiple...]` の解析
 * 例: "服,multiple" → { category: "服", options: ["multiple"] }
 * @param {Record<string, any>|null|undefined} manifest
 * @param {number} [scopeId]
 * @returns {{ category: string, options: string[] }|null}
 */
export function bindOptionForScope(manifest, scopeId = 0) {
	const value = manifest?.descript?.properties?.[bindOptionKey(scopeId)];
	if (!value) return null;
	const parts = String(value)
		.split(",")
		.map((s) => s.trim())
		.filter(Boolean);
	if (parts.length === 0) return null;
	return { category: parts[0], options: parts.slice(1) };
}

/** 着せ替え状態キー（SurfaceManager.dressupState と共通フォーマット） */
export function dressupKey(scopeId, category, part) {
	return `${scopeId}__${category}__${part}`;
}

/**
 * 着せ替えメニューデータ（bindgroup をカテゴリ順にグルーピング）
 * @param {Record<string, any>|null|undefined} manifest
 * @param {number} [scopeId]
 * @param {Map<string, boolean>|null} [dressupState] - 現在の装着状態
 * @returns {{
 *   categories: Array<{ category: string, options: string[], parts: Array<{ number: number, part: string, thumbnail?: string|null, on: boolean }> }>,
 * }}
 */
export function bindMenuData(manifest, scopeId = 0, dressupState = null) {
	const option = bindOptionForScope(manifest, scopeId);
	/** @type {Map<string, { category: string, options: string[], parts: any[] }>} */
	const byCategory = new Map();

	for (const group of bindGroupsForScope(manifest, scopeId)) {
		const category = group.category || option?.category || "";
		if (!category) continue;
		let entry = byCategory.get(category);
		if (!entry) {
			entry = {
				category,
				options: option?.options ?? [],
				parts: [],
			};
			byCategory.set(category, entry);
		}
		entry.parts.push({
			number: group.number,
			part: group.part,
			thumbnail: group.thumbnail ?? null,
			on:
				dressupState instanceof Map
					? dressupState.get(
							dressupKey(scopeId, group.category, group.part),
						) === true
					: group.default === true,
		});
	}

	return { categories: [...byCategory.values()] };
}

/**
 * メニュー同期用ペイロード（さくら / うにゅ 両スコープ分）
 * @param {Record<string, any>|null|undefined} manifest
 * @param {{ dressupState?: Map<string, boolean> }|null} [surfaceManager]
 * @returns {{ sakura: ReturnType<typeof bindMenuData>, kero: ReturnType<typeof bindMenuData> }|null}
 */
export function dressupMenuPayload(manifest, surfaceManager = null) {
	if (!manifest) return null;
	if (
		!bindGroupsForScope(manifest, 0).length &&
		!bindGroupsForScope(manifest, 1).length
	) {
		return null;
	}
	return {
		sakura: bindMenuData(manifest, 0, surfaceManager?.dressupState ?? null),
		kero: bindMenuData(manifest, 1, surfaceManager?.dressupState ?? null),
	};
}

/**
 * `bindgroup[N].default,1`（初期装着）を dressupState にシードする。
 * 既存キー（セッションローカルの状態）は書き換えない。
 * @param {Record<string, any>|null|undefined} manifest
 * @param {Map<string, boolean>} dressupState
 * @returns {number} シードしたパーツ数
 */
export function seedDressupDefaults(manifest, dressupState) {
	if (!manifest || !(dressupState instanceof Map)) return 0;
	let seeded = 0;
	for (const [scopeId, groups] of [
		[0, manifest.sakura_bind_groups],
		[1, manifest.kero_bind_groups],
	]) {
		for (const group of Array.isArray(groups) ? groups : []) {
			if (group.default !== true) continue;
			const key = dressupKey(scopeId, group.category, group.part);
			if (dressupState.has(key)) continue;
			dressupState.set(key, true);
			seeded++;
		}
	}
	return seeded;
}

/**
 * 数一覧を月配列に展開して重複除去
 * @param {number} number - bindgroup 番号（= SHEIKO アニメーションID）
 * @param {number[]} [addIds]
 * @returns {number[]}
 */
export function bindAnimationIds(number, addIds = []) {
	const ids = [...(Array.isArray(addIds) ? addIds : [])];
	if (Number.isFinite(number) && !ids.includes(number)) {
		ids.push(number);
	}
	return ids;
}

/**
 * SERIKO パターンの下地サーフィス番号 → 画像ファイル名（サーフェス定義形式）
 * @param {string|number|null|undefined} surface
 * @returns {string|null} ファイル名 ("surface100.png")。"-1" / 空は null
 */
export function patternSurfaceFile(surface) {
	const s = String(surface ?? "").trim();
	if (!s || s === "-1") return null;
	return `surface${s}.png`;
}
