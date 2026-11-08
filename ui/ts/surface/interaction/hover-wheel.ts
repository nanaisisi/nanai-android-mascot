/**
 * マウスホイール (OnMouseWheel) およびホバー (OnMouseHover) イベントの設定
 *
 * @param {HTMLElement} target
 * @param {object} options
 * @param {(clientX: number, clientY: number, rect: DOMRect, delta: number) => void} [options.onGhostWheel]
 * @param {(clientX: number, clientY: number, rect: DOMRect) => void} [options.onGhostHover]
 * @param {() => boolean} [isInteractingOrDragging]
 * @param {number} [hoverDelay=300]
 * @returns {() => void} クリーンアップ関数
 */
export function setupHoverAndWheel(
	target: HTMLElement,
	options = {},
	isInteractingOrDragging = () => false,
	hoverDelay = 300,
) {
	if (!target) return () => {};

	const { onGhostWheel, onGhostHover } = options;

	// マウスホイール (OnMouseWheel)
	const onWheel = (e: {
		clientX: number;
		clientY: number;
		deltaY: unknown;
	}) => {
		if (onGhostWheel) {
			const clientX = e.clientX ?? 0;
			const clientY = e.clientY ?? 0;
			const rect = target.getBoundingClientRect();
			const delta = Math.round(e.deltaY ?? 0);
			onGhostWheel(clientX, clientY, rect, delta);
		}
	};
	target.addEventListener("wheel", onWheel, { passive: true });

	// マウスホバー (OnMouseHover)
	let hoverTimer: string | number | NodeJS.Timeout | null | undefined = null;
	const onMouseMove = (e: { clientX: number; clientY: number }) => {
		if (isInteractingOrDragging() || !onGhostHover) return;
		const clientX = e.clientX ?? 0;
		const clientY = e.clientY ?? 0;
		if (hoverTimer) clearTimeout(hoverTimer);
		hoverTimer = setTimeout(() => {
			const rect = target.getBoundingClientRect();
			onGhostHover(clientX, clientY, rect);
		}, hoverDelay);
	};

	const onMouseLeave = () => {
		if (hoverTimer) {
			clearTimeout(hoverTimer);
			hoverTimer = null;
		}
	};

	target.addEventListener("mousemove", onMouseMove, { passive: true });
	target.addEventListener("mouseleave", onMouseLeave);

	return () => {
		target.removeEventListener("wheel", onWheel);
		target.removeEventListener("mousemove", onMouseMove);
		target.removeEventListener("mouseleave", onMouseLeave);
		if (hoverTimer) {
			clearTimeout(hoverTimer);
			hoverTimer = null;
		}
	};
}
