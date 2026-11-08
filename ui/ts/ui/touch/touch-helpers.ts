/**
 * @file touch-helpers.js
 * @description タッチ座標・幾何計算ヘルパー関数 (距離, 中心座標, 回転角度)
 */

/**
 * 2点間のユークリッド距離を計算
 * @param {{ clientX: number, clientY: number }} p1
 * @param {{ clientX: number, clientY: number }} p2
 * @returns {number}
 */
export function getTouchDistance(p1: unknown, p2: unknown) {
	const x1 = Number.isFinite(p1?.clientX) ? p1.clientX : 0;
	const y1 = Number.isFinite(p1?.clientY) ? p1.clientY : 0;
	const x2 = Number.isFinite(p2?.clientX) ? p2.clientX : 0;
	const y2 = Number.isFinite(p2?.clientY) ? p2.clientY : 0;
	return Math.hypot(x1 - x2, y1 - y2);
}

/**
 * 2点間の中心座標を計算
 * @param {{ clientX: number, clientY: number }} p1
 * @param {{ clientX: number, clientY: number }} p2
 * @returns {{ x: number, y: number }}
 */
export function getTouchCenter(p1: unknown, p2: unknown) {
	const x1 = Number.isFinite(p1?.clientX) ? p1.clientX : 0;
	const y1 = Number.isFinite(p1?.clientY) ? p1.clientY : 0;
	const x2 = Number.isFinite(p2?.clientX) ? p2.clientX : 0;
	const y2 = Number.isFinite(p2?.clientY) ? p2.clientY : 0;
	return {
		x: (x1 + x2) / 2,
		y: (y1 + y2) / 2,
	};
}

/**
 * 2点間の回転角度（度数法）を計算
 * @param {{ clientX: number, clientY: number }} p1
 * @param {{ clientX: number, clientY: number }} p2
 * @returns {number}
 */
export function getTouchAngle(p1: unknown, p2: unknown) {
	const x1 = Number.isFinite(p1?.clientX) ? p1.clientX : 0;
	const y1 = Number.isFinite(p1?.clientY) ? p1.clientY : 0;
	const x2 = Number.isFinite(p2?.clientX) ? p2.clientX : 0;
	const y2 = Number.isFinite(p2?.clientY) ? p2.clientY : 0;
	const rad = Math.atan2(y2 - y1, x2 - x1);
	return (rad * 180) / Math.PI;
}
