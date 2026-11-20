/**
 * @file unified-layout.ts
 * @description 全キャラクターを単一オーバーレイウインドウに連結配置する純粋レイアウト計算
 */

export interface UnifiedLayoutInput {
	id: string | number;
	width: number;
	height: number;
	scale?: number;
	visible?: boolean;
}

export interface UnifiedLayoutItem {
	id: string | number;
	x: number;
	y: number;
	width: number;
	height: number;
}

export interface UnifiedLayoutResult {
	width: number;
	height: number;
	items: UnifiedLayoutItem[];
}

export const UNIFIED_LAYOUT_DEFAULT_GAP = 8;

function safe(n: unknown, fallback: number): number {
	const v = Number(n);
	return Number.isFinite(v) && v > 0 ? v : fallback;
}

/**
 * 可視キャラを左から右へ並べ、下端揃えで配置する
 */
export function computeUnifiedLayout(
	characters: UnifiedLayoutInput[],
	gap: number = UNIFIED_LAYOUT_DEFAULT_GAP,
): UnifiedLayoutResult {
	const g = Number.isFinite(gap) && gap >= 0 ? gap : UNIFIED_LAYOUT_DEFAULT_GAP;
	const sized = (Array.isArray(characters) ? characters : [])
		.filter((c) => c && c.visible !== false)
		.map((c) => {
			const s = safe(c.scale, 1);
			return {
				id: c.id,
				width: Math.round(safe(c.width, 0) * s),
				height: Math.round(safe(c.height, 0) * s),
			};
		})
		.filter((c) => c.width > 0 && c.height > 0);
	if (sized.length === 0) return { width: 0, height: 0, items: [] };
	const height = Math.max(...sized.map((c) => c.height));
	let x = 0;
	const items = sized.map((c) => {
		const item = { ...c, x, y: height - c.height };
		x += c.width + g;
		return item;
	});
	return { width: x - g, height, items };
}
