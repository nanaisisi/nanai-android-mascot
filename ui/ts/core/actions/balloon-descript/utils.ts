/**
 * @file utils.js
 * @brief バルーン設定値カラーパース等ユーティリティ
 */

function clampChannel(val: number): number {
	return Math.max(0, Math.min(255, val));
}

/**
 * props から指定ベース名に対応する RGB カラー文字列 ("rgb(r, g, b)") を抽出
 * 1. props[`${base}.r`], props[`${base}.g`], props[`${base}.b`] の個別キー
 * 2. props[base] のカンマ区切り ("r,g,b" または "rgb(r,g,b)")
 * 3. 0〜255 の範囲クランプと数値検証
 * @param {Record<string, any>} props
 * @param {string} base
 * @returns {string | null}
 */
export function rgbFromComponents(
	_props: Record<string, unknown>,

	props: Record<string, any>,

	base: string,
): string | null {
	if (!props || !base) return null;

	const r = parseInt(props[`${base}.r`], 10);
	const g = parseInt(props[`${base}.g`], 10);
	const b = parseInt(props[`${base}.b`], 10);

	if (!Number.isNaN(r) && !Number.isNaN(g) && !Number.isNaN(b)) {
		return `rgb(${clampChannel(r)}, ${clampChannel(g)}, ${clampChannel(b)})`;
	}

	// base 自体に "r,g,b" 形式で指定されている場合のパース
	const rawVal = props[base];
	if (typeof rawVal === "string") {
		const trimmed = rawVal.trim();
		// "rgb(r, g, b)" 形式
		const rgbMatch = trimmed.match(
			/^rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i,
		);
		if (rgbMatch) {
			const cr = clampChannel(parseInt(rgbMatch[1], 10));
			const cg = clampChannel(parseInt(rgbMatch[2], 10));
			const cb = clampChannel(parseInt(rgbMatch[3], 10));
			return `rgb(${cr}, ${cg}, ${cb})`;
		}
		// "r, g, b" 形式
		const commaParts = trimmed.split(",").map((p) => p.trim());
		if (commaParts.length >= 3) {
			const cr = parseInt(commaParts[0], 10);
			const cg = parseInt(commaParts[1], 10);
			const cb = parseInt(commaParts[2], 10);
			if (!Number.isNaN(cr) && !Number.isNaN(cg) && !Number.isNaN(cb)) {
				return `rgb(${clampChannel(cr)}, ${clampChannel(cg)}, ${clampChannel(cb)})`;
			}
		}
	}

	return null;
}
