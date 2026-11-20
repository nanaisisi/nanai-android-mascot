import { LONG_PRESS_DELAY } from "./constants.js";

export interface LongPressOptions {
	delay?: number;
	onTrigger?: () => void;
}

/**
 * 長押し（Long Press）タイマーの管理コントローラー
 *
 * @param {object} options
 * @param {number} [options.delay=LONG_PRESS_DELAY] 長押し発火までの時間 (ms)
 * @param {() => void} [options.onTrigger] 長押し発火時のコールバック
 * @returns {{
 *   start: (canTrigger: () => boolean) => void,
 *   cancel: () => void,
 *   isTriggered: () => boolean,
 *   reset: () => void,
 *   cleanup: () => void
 * }}
 */
export function createLongPressController(options: LongPressOptions = {}) {
	const delay = options.delay ?? LONG_PRESS_DELAY;
	const onTrigger = options.onTrigger;

	let timer: ReturnType<typeof setTimeout> | null = null;
	let triggered = false;

	const cancel = () => {
		if (timer) {
			clearTimeout(timer);
			timer = null;
		}
	};

	const start = (canTrigger?: () => unknown) => {
		cancel();
		triggered = false;
		timer = setTimeout(() => {
			timer = null;
			if (!canTrigger || canTrigger()) {
				triggered = true;
				onTrigger?.();
			}
		}, delay);
	};

	const reset = () => {
		cancel();
		triggered = false;
	};

	return {
		start,
		cancel,
		isTriggered: () => triggered,
		reset,
		cleanup: cancel,
	};
}
