/**
 * @file touch-helpers.js
 * @description タッチ座標・幾何計算ヘルパー関数 (距離, 中心座標, 回転角度)
 */

export interface TouchCoordinateLike {
	clientX?: number;
	clientY?: number;
}

function finiteCoord(value: unknown): number {
	return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

/**
 * 2点間のユークリッド距離を計算
 * @param {TouchCoordinateLike | null | undefined} p1
 * @param {TouchCoordinateLike | null | undefined} p2
 * @returns {number}
 */
export function getTouchDistance(
	p1: TouchCoordinateLike | null | undefined,
	p2: TouchCoordinateLike | null | undefined,
): number {
	const x1 = finiteCoord(p1?.clientX);
	const y1 = finiteCoord(p1?.clientY);
	const x2 = finiteCoord(p2?.clientX);
	const y2 = finiteCoord(p2?.clientY);
	return Math.hypot(x1 - x2, y1 - y2);
}

/**
 * 2点間の中心座標を計算
 * @param {TouchCoordinateLike | null | undefined} p1
 * @param {TouchCoordinateLike | null | undefined} p2
 * @returns {{ x: number, y: number }}
 */
export function getTouchCenter(
	p1: TouchCoordinateLike | null | undefined,
	p2: TouchCoordinateLike | null | undefined,
): { x: number; y: number } {
	const x1 = finiteCoord(p1?.clientX);
	const y1 = finiteCoord(p1?.clientY);
	const x2 = finiteCoord(p2?.clientX);
	const y2 = finiteCoord(p2?.clientY);
	return {
		x: (x1 + x2) / 2,
		y: (y1 + y2) / 2,
	};
}

/**
 * 2点間の回転角度（度数法）を計算
 * @param {TouchCoordinateLike | null | undefined} p1
 * @param {TouchCoordinateLike | null | undefined} p2
 * @returns {number}
 */
export function getTouchAngle(
	p1: TouchCoordinateLike | null | undefined,
	p2: TouchCoordinateLike | null | undefined,
): number {
	const x1 = finiteCoord(p1?.clientX);
	const y1 = finiteCoord(p1?.clientY);
	const x2 = finiteCoord(p2?.clientX);
	const y2 = finiteCoord(p2?.clientY);
	const rad = Math.atan2(y2 - y1, x2 - x1);
	return (rad * 180) / Math.PI;
}
