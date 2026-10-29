/**
 * @file utils.js
 * @brief バルーン設定値カラーパース等ユーティリティ
 */
export function rgbFromComponents(props, base) {
	const r = parseInt(props[`${base}.r`], 10);
	const g = parseInt(props[`${base}.g`], 10);
	const b = parseInt(props[`${base}.b`], 10);
	if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null;
	return `rgb(${r}, ${g}, ${b})`;
}
