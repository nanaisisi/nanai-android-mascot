/**
 * @file lifecycle.js
 * @description Slot-12 Android / Web ライフサイクル (VisibilityState, Page Lifecycle) 監視ロジック
 * Contract: setupVisibilityListeners
 */

import { ANDROID_EVENTS, ANDROID_LIFECYCLE_STATES } from "./constants.js";

/**
 * ライフサイクルイベント（visibilitychange, freeze, pagehide）のリスナーを設定
 * @param {object} context
 * @param {(state: string) => void} context.setLifecycleState ライフサイクル状態更新関数
 * @param {() => object|null} context.getGestureRecognizer 連携するGestureRecognizer取得関数
 * @param {(eventName: string, data: unknown) => void} context.dispatch イベントディスパッチ関数
 * @returns {Array<() => void>} クリーンアップ関数の配列
 */
export function setupVisibilityListeners(context) {
	const cleanupFns = [];
	const { setLifecycleState, getGestureRecognizer, dispatch } = context;

	if (
		typeof document !== "undefined" &&
		typeof document.addEventListener === "function"
	) {
		const onVisibilityChange = () => {
			if (document.hidden) {
				setLifecycleState(ANDROID_LIFECYCLE_STATES.PAUSED);
				const recognizer = getGestureRecognizer();
				if (recognizer && typeof recognizer.reset === "function") {
					recognizer.reset();
				}
				dispatch(ANDROID_EVENTS.PAUSE, { timestamp: Date.now() });
				dispatch(ANDROID_EVENTS.STATE_CHANGED, {
					state: ANDROID_LIFECYCLE_STATES.PAUSED,
					timestamp: Date.now(),
				});
			} else {
				setLifecycleState(ANDROID_LIFECYCLE_STATES.ACTIVE);
				dispatch(ANDROID_EVENTS.RESUME, { timestamp: Date.now() });
				dispatch(ANDROID_EVENTS.STATE_CHANGED, {
					state: ANDROID_LIFECYCLE_STATES.ACTIVE,
					timestamp: Date.now(),
				});
			}
		};

		document.addEventListener("visibilitychange", onVisibilityChange);
		cleanupFns.push(() => {
			if (typeof document.removeEventListener === "function") {
				document.removeEventListener("visibilitychange", onVisibilityChange);
			}
		});

		const onFreeze = () => {
			setLifecycleState(ANDROID_LIFECYCLE_STATES.PAUSED);
			const recognizer = getGestureRecognizer();
			if (recognizer && typeof recognizer.reset === "function") {
				recognizer.reset();
			}
			dispatch(ANDROID_EVENTS.PAUSE, { timestamp: Date.now() });
			dispatch(ANDROID_EVENTS.STATE_CHANGED, {
				state: ANDROID_LIFECYCLE_STATES.PAUSED,
				timestamp: Date.now(),
			});
		};
		document.addEventListener("freeze", onFreeze);
		cleanupFns.push(() => {
			if (typeof document.removeEventListener === "function") {
				document.removeEventListener("freeze", onFreeze);
			}
		});
	}

	if (
		typeof window !== "undefined" &&
		typeof window.addEventListener === "function"
	) {
		const onPageHide = (e) => {
			setLifecycleState(ANDROID_LIFECYCLE_STATES.STOPPED);
			const recognizer = getGestureRecognizer();
			if (recognizer && typeof recognizer.reset === "function") {
				recognizer.reset();
			}
			dispatch(ANDROID_EVENTS.STOP, {
				persisted: Boolean(e?.persisted),
				timestamp: Date.now(),
			});
			dispatch(ANDROID_EVENTS.STATE_CHANGED, {
				state: ANDROID_LIFECYCLE_STATES.STOPPED,
				timestamp: Date.now(),
			});
		};

		window.addEventListener("pagehide", onPageHide);
		cleanupFns.push(() => {
			if (typeof window.removeEventListener === "function") {
				window.removeEventListener("pagehide", onPageHide);
			}
		});
	}

	return cleanupFns;
}
