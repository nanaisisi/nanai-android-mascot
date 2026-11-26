/**
 * @file cursor-animator.ts
 * @brief .cur / .ani / .ico カーソルアセットのホットスポット付きCSS適用およびフレームアニメーション管理
 */

export interface CursorFrameAsset {
	dataUrl: string;
	hotspotX: number;
	hotspotY: number;
	durationMs: number;
}

export interface CursorAssetData {
	frames: CursorFrameAsset[];
}

const activeCursorTimers = new Map<string, ReturnType<typeof setTimeout>>();

export function formatCssCursorFrame(frame: CursorFrameAsset): string {
	return `url("${frame.dataUrl}") ${frame.hotspotX} ${frame.hotspotY}, auto`;
}

export function stopAnimatedCursor(timerKey: string): void {
	const existing = activeCursorTimers.get(timerKey);
	if (existing !== undefined) {
		clearTimeout(existing);
		activeCursorTimers.delete(timerKey);
	}
}

function startCursorLoop(
	timerKey: string,
	frames: CursorFrameAsset[],
	applyFrame: (cssCursor: string) => void,
): void {
	stopAnimatedCursor(timerKey);
	if (frames.length === 0) return;

	if (frames.length === 1) {
		applyFrame(formatCssCursorFrame(frames[0]));
		return;
	}

	let index = 0;
	const tick = () => {
		const frame = frames[index];
		applyFrame(formatCssCursorFrame(frame));
		const delay = Math.max(16, frame.durationMs || 16);
		index = (index + 1) % frames.length;
		const timerId = setTimeout(tick, delay);
		activeCursorTimers.set(timerKey, timerId);
	};
	tick();
}

export function applyAnimatedCssVarCursor(
	root: HTMLElement,
	varName: string,
	frames: CursorFrameAsset[],
): void {
	startCursorLoop(`css-var:${varName}`, frames, (cssValue) => {
		root.style.setProperty(varName, cssValue);
	});
}

export function applyAnimatedElementsCursor(
	timerKey: string,
	elements: Iterable<HTMLElement>,
	frames: CursorFrameAsset[],
): void {
	const list = Array.from(elements);
	startCursorLoop(timerKey, frames, (cssValue) => {
		for (const el of list) {
			el.style.cursor = cssValue;
		}
	});
}
