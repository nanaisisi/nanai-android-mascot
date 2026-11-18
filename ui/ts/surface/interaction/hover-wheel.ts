/**
 * @file hover-wheel.ts
 * @brief マウスホイール (OnMouseWheel) およびホバー (OnMouseHover) イベントの設定
 */

const HOVER_STROKE_THRESHOLD = 40;

export interface HoverWheelOptions {
	onGhostWheel?: (
		clientX: number,
		clientY: number,
		rect: DOMRect,
		delta: number,
	) => void;
	onGhostHover?: (clientX: number, clientY: number, rect: DOMRect) => void;
	onGhostMouseEnter?: (
		clientX: number,
		clientY: number,
		rect: DOMRect,
		isWindow: boolean,
	) => void;
	onGhostMouseLeave?: (
		clientX: number,
		clientY: number,
		rect: DOMRect,
		isWindow: boolean,
	) => void;
	onGhostStroke?: (clientX: number, clientY: number, rect: DOMRect) => void;
	[key: string]: unknown;
}

export function setupHoverAndWheel(
	target: HTMLElement,
	options: HoverWheelOptions = {},
	isInteractingOrDragging = () => false,
	hoverDelay = 300,
) {
	if (!target) return () => {};

	const {
		onGhostWheel,
		onGhostHover,
		onGhostMouseEnter,
		onGhostMouseLeave,
		onGhostStroke,
	} = options;
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

	// マウスホバー (OnMouseHover) およびホバー時撫で (Stroke)
	let hoverTimer: ReturnType<typeof setTimeout> | null = null;
	let strokeDistance = 0;
	let lastX: number | null = null;
	let lastY: number | null = null;

	const resetStrokeState = () => {
		strokeDistance = 0;
		lastX = null;
		lastY = null;
	};

	const onMouseMove = (e: { clientX?: number; clientY?: number }) => {
		if (isInteractingOrDragging()) {
			resetStrokeState();
			return;
		}
		const clientX = e?.clientX ?? 0;
		const clientY = e?.clientY ?? 0;

		if (onGhostStroke) {
			if (lastX !== null && lastY !== null) {
				const dist = Math.hypot(clientX - lastX, clientY - lastY);
				if (dist > 0) {
					strokeDistance += dist;
					if (strokeDistance >= HOVER_STROKE_THRESHOLD) {
						strokeDistance = 0;
						const rect = target.getBoundingClientRect();
						onGhostStroke(clientX, clientY, rect);
					}
				}
			}
			lastX = clientX;
			lastY = clientY;
		}

		if (!onGhostHover) return;
		if (hoverTimer) clearTimeout(hoverTimer);
		hoverTimer = setTimeout(() => {
			const rect = target.getBoundingClientRect();
			onGhostHover(clientX, clientY, rect);
		}, delayMs);
	};

	const onMouseEnter = (e?: { clientX?: number; clientY?: number }) => {
		strokeDistance = 0;
		if (typeof e?.clientX === "number" && typeof e?.clientY === "number") {
			lastX = e.clientX;
			lastY = e.clientY;
		} else {
			lastX = null;
			lastY = null;
		}
		if (onGhostMouseEnter) {
			const clientX = e?.clientX ?? 0;
			const clientY = e?.clientY ?? 0;
			const rect = target.getBoundingClientRect();
			onGhostMouseEnter(clientX, clientY, rect, false);
		}
	};

	const onMouseLeave = (e?: { clientX?: number; clientY?: number }) => {
		if (hoverTimer) {
			clearTimeout(hoverTimer);
			hoverTimer = null;
		}
		resetStrokeState();
		if (onGhostMouseLeave) {
			const clientX = e?.clientX ?? 0;
			const clientY = e?.clientY ?? 0;
			const rect = target.getBoundingClientRect();
			onGhostMouseLeave(clientX, clientY, rect, false);
		}
	};

	target.addEventListener(
		"mousemove",
		onMouseMove as unknown as EventListener,
		{
			passive: true,
		},
	);
	target.addEventListener(
		"mouseenter",
		onMouseEnter as unknown as EventListener,
	);
	target.addEventListener(
		"mouseleave",
		onMouseLeave as unknown as EventListener,
	);

	return () => {
		target.removeEventListener("wheel", onWheel as unknown as EventListener);
		target.removeEventListener(
			"mousemove",
			onMouseMove as unknown as EventListener,
		);
		target.removeEventListener(
			"mouseenter",
			onMouseEnter as unknown as EventListener,
		);
		target.removeEventListener(
			"mouseleave",
			onMouseLeave as unknown as EventListener,
		);
		if (hoverTimer) {
			clearTimeout(hoverTimer);
			hoverTimer = null;
		}
		resetStrokeState();
	};
}
