/**
 * Rust ShellManifest 由来の着せ替え (bind) メニューデータ構築 (UKADOC準拠)
 *
 * `shell_manifest` コマンド（crates/ui の descript.txt パーサー）が返す
 * `sakura_bind_groups` / `kero_bind_groups`（BindGroup: number/category/part/
 * thumbnail/default/add_ids）と descript `bindoption.group` を
 * オーナードローメニュー表示用のカテゴリ階層へ変換する。
 */

export interface BindGroupLike {
	number: number;
	category: string;
	part: string;
	thumbnail?: string | null;
	default?: boolean;
	add_ids?: number[];
}

export interface BindOptionResult {
	category: string;
	options: string[];
}

export interface BindMenuPart {
	number: number;
	part: string;
	thumbnail: string | null;
	on: boolean;
}

export interface BindMenuCategory {
	category: string;
	options: string[];
	parts: BindMenuPart[];
}

export interface BindMenuDataResult {
	categories: BindMenuCategory[];
}

export interface ShellManifestBindLike {
	sakura_bind_groups?: BindGroupLike[];
	kero_bind_groups?: BindGroupLike[];
	descript?: {
		properties?: Record<string, string>;
		[key: string]: unknown;
	};
	[key: string]: unknown;
}

export type BindManifestInput =
	| ShellManifestBindLike
	| Record<string, unknown>
	| null
	| undefined;

/** bindoption.group の descript キー（スコープ0/1） */
export function bindOptionKey(scopeId = 0): string {
	return scopeId === 0 ? "sakura.bindoption.group" : "kero.bindoption.group";
}

/**
 * `bindgroup` 一覧をスコープで取得（scope 0 = さくら / それ以外 = うにゅ）
 */
export function bindGroupsForScope(
	manifest: BindManifestInput,
	scopeId = 0,
): BindGroupLike[] {
	if (!manifest) return [];
	const m = manifest as ShellManifestBindLike;
	const groups = scopeId === 0 ? m.sakura_bind_groups : m.kero_bind_groups;
	return Array.isArray(groups) ? groups : [];
}

/**
 * `[target].bindoption.group,[カテゴリ名],[mustselect|multiple...]` の解析
 * 例: "服,multiple" → { category: "服", options: ["multiple"] }
 */
export function bindOptionForScope(
	manifest: BindManifestInput,
	scopeId = 0,
): BindOptionResult | null {
	const m = manifest as ShellManifestBindLike | null | undefined;
	const value = m?.descript?.properties?.[bindOptionKey(scopeId)];
	if (!value) return null;
	const parts = String(value)
		.split(",")
		.map((s) => s.trim())
		.filter(Boolean);
	if (parts.length === 0) return null;
	return { category: parts[0], options: parts.slice(1) };
}

/** 着せ替え状態キー（SurfaceManager.dressupState と共通フォーマット） */
export function dressupKey(
	scopeId: number,
	category: string,
	part: string,
): string {
	return `${scopeId}__${category}__${part}`;
}

/**
 * 着せ替えメニューデータ（bindgroup をカテゴリ順にグルーピング）
 */
export function bindMenuData(
	manifest: BindManifestInput,
	scopeId = 0,
	dressupState: Map<string, boolean> | null = null,
): BindMenuDataResult {
	const option = bindOptionForScope(manifest, scopeId);
	const byCategory = new Map<string, BindMenuCategory>();

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
 */
export function dressupMenuPayload(
	manifest: BindManifestInput,
	surfaceManager: { dressupState?: Map<string, boolean> } | null = null,
): { sakura: BindMenuDataResult; kero: BindMenuDataResult } | null {
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
 */
export function seedDressupDefaults(
	manifest: BindManifestInput,
	dressupState: Map<string, boolean>,
): number {
	if (!manifest || !(dressupState instanceof Map)) return 0;
	const m = manifest as ShellManifestBindLike;
	let seeded = 0;
	const scopeGroups: Array<[number, BindGroupLike[] | undefined]> = [
		[0, m.sakura_bind_groups],
		[1, m.kero_bind_groups],
	];
	for (const [scopeId, groups] of scopeGroups) {
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
 */
export function bindAnimationIds(
	number: number,
	addIds: number[] = [],
): number[] {
	const ids = [...(Array.isArray(addIds) ? addIds : [])];
	if (Number.isFinite(number) && !ids.includes(number)) {
		ids.push(number);
	}
	return ids;
}

/**
 * SERIKO パターンの下地サーフィス番号 → 画像ファイル名（サーフェス定義形式）
 */
export function patternSurfaceFile(
	surface: string | number | null | undefined,
): string | null {
	const s = String(surface ?? "").trim();
	if (!s || s === "-1") return null;
	return `surface${s}.png`;
}
