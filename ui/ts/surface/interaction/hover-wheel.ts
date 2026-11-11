/**
 * @file hover-wheel.ts
 * @brief マウスホイール (OnMouseWheel) およびホバー (OnMouseHover) イベントの設定
 */

interface HoverWheelOptions {
	onGhostWheel?: (
		clientX: number,
		clientY: number,
		rect: DOMRect,
		delta: number,
	) => void;
	onGhostHover?: (clientX: number, clientY: number, rect: DOMRect) => void;
	[key: string]: unknown;
}

export function setupHoverAndWheel(
	target: HTMLElement,
	options: HoverWheelOptions = {},
	isInteractingOrDragging = () => false,
	hoverDelay = 300,
) {
	if (!target) return () => {};

	const { onGhostWheel, onGhostHover } = options;
	const delayMs = Number(hoverDelay || 300);

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
			const delta = Math.round(Number(e.deltaY ?? 0));
			onGhostWheel(clientX, clientY, rect, delta);
		}
	};
	target.addEventListener("wheel", onWheel as unknown as EventListener, {
		passive: true,
	});

	// マウスホバー (OnMouseHover)
	let hoverTimer: ReturnType<typeof setTimeout> | null = null;
	const onMouseMove = (e: { clientX: number; clientY: number }) => {
		if (isInteractingOrDragging() || !onGhostHover) return;
		const clientX = e.clientX ?? 0;
		const clientY = e.clientY ?? 0;
		if (hoverTimer) clearTimeout(hoverTimer);
		hoverTimer = setTimeout(() => {
			const rect = target.getBoundingClientRect();
			onGhostHover(clientX, clientY, rect);
		}, delayMs);
	};

	const onMouseLeave = () => {
		if (hoverTimer) {
			clearTimeout(hoverTimer);
			hoverTimer = null;
		}
	};

	target.addEventListener(
		"mousemove",
		onMouseMove as unknown as EventListener,
		{
			passive: true,
		},
	);
	target.addEventListener("mouseleave", onMouseLeave);

	return () => {
		target.removeEventListener("wheel", onWheel as unknown as EventListener);
		target.removeEventListener(
			"mousemove",
			onMouseMove as unknown as EventListener,
		);
		target.removeEventListener("mouseleave", onMouseLeave);
		if (hoverTimer) {
			clearTimeout(hoverTimer);
			hoverTimer = null;
		}
	};
}
