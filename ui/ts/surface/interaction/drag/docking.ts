import {
	DOCK_LEFT_THRESHOLD,
	DOCK_RESTORE_OFFSET,
	DOCK_RIGHT_THRESHOLD,
} from "./constants.js";

export interface DockingSnapOptions {
	leftThreshold?: number;
	rightThreshold?: number;
}

export interface DockingTarget {
	getBoundingClientRect: () => { left: number; width: number };
	classList: {
		contains: (token: string) => unknown;
		remove: (...tokens: string[]) => void;
		add: (...tokens: string[]) => void;
	};
	style: { left: string };
}

/**
 * ターゲット要素がドッキング（画面端退避）状態かどうか判定
 *
 * @param {HTMLElement} target
 * @returns {boolean}
 */
export function isElementDocked(
	target:
		| { classList: { contains: (token: string) => unknown } }
		| null
		| undefined,
): boolean {
	if (!target) return false;
	return (
		Boolean(target.classList.contains("is-docked-left")) ||
		Boolean(target.classList.contains("is-docked-right"))
	);
}

/**
 * 画面端スナップ（ドッキング退避判定）の適用
 * 画面幅の一定割合（左端または右端）にある場合、対応するドッキングクラスを付与する
 *
 * @param {HTMLElement} target
 * @param {number} screenWidth
 * @param {object} [options={}]
 * @param {number} [options.leftThreshold=DOCK_LEFT_THRESHOLD]
 * @param {number} [options.rightThreshold=DOCK_RIGHT_THRESHOLD]
 * @returns {"left" | "right" | "none"} スナップ結果
 */
export function applyDockingSnap(
	target:
		| {
				getBoundingClientRect: () => { left: number; width: number };
				classList: {
					remove: (...tokens: string[]) => void;
					add: (...tokens: string[]) => void;
				};
		  }
		| null
		| undefined,
	screenWidth: number,
	options: DockingSnapOptions = {},
): "left" | "right" | "none" {
	if (!target) return "none";
	const leftThreshold = options.leftThreshold ?? DOCK_LEFT_THRESHOLD;
	const rightThreshold = options.rightThreshold ?? DOCK_RIGHT_THRESHOLD;

	const snapRect = target.getBoundingClientRect();
	const currentCenterX = snapRect.left + snapRect.width / 2;

	target.classList.remove("is-docked-left", "is-docked-right");
	if (currentCenterX < screenWidth * leftThreshold) {
		target.classList.add("is-docked-left");
		return "left";
	}
	if (currentCenterX > screenWidth * rightThreshold) {
		target.classList.add("is-docked-right");
		return "right";
	}
	return "none";
}

/**
 * ドッキング状態からの復帰処理
 * ドッキングクラスを解除し、復帰後の left 位置を適用する
 *
 * @param {HTMLElement} target
 * @param {number} screenWidth
 * @param {number} [restoreOffset=DOCK_RESTORE_OFFSET]
 * @returns {boolean} 復帰処理が行われたかどうか
 */
export function restoreFromDocking(
	target:
		| {
				classList: {
					contains: (token: string) => unknown;
					remove: (...tokens: string[]) => void;
				};
				style: { left: string };
		  }
		| null
		| undefined,
	screenWidth: number,
	restoreOffset = DOCK_RESTORE_OFFSET,
): boolean {
	if (!target || !isElementDocked(target)) {
		return false;
	}
	const wasLeft = target.classList.contains("is-docked-left");
	target.classList.remove("is-docked-left", "is-docked-right");
	target.style.left = wasLeft
		? `${restoreOffset}px`
		: `${screenWidth - restoreOffset}px`;
	return true;
}
