import {
	DOCK_LEFT_THRESHOLD,
	DOCK_RESTORE_OFFSET,
	DOCK_RIGHT_THRESHOLD,
} from "./constants.js";

/**
 * ターゲット要素がドッキング（画面端退避）状態かどうか判定
 *
 * @param {HTMLElement} target
 * @returns {boolean}
 */
export function isElementDocked(target: {
	classList: { contains: (arg0: string) => unknown };
}) {
	if (!target) return false;
	return (
		target.classList.contains("is-docked-left") ||
		target.classList.contains("is-docked-right")
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
	target: {
		getBoundingClientRect: () => unknown;
		classList: {
			remove: (arg0: string, arg1: string) => void;
			add: (arg0: string) => void;
		};
	},
	screenWidth: number,
	options = {},
) {
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
	target: {
		classList: {
			contains: (arg0: string) => unknown;
			remove: (arg0: string, arg1: string) => void;
		};
		style: { left: string };
	},
	screenWidth: number,
	restoreOffset = DOCK_RESTORE_OFFSET,
) {
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
