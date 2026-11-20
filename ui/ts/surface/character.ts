/**
 * Nanai Android Mascot - キャラクターウィンドウ制御スクリプト
 */
import {
	availableMonitors,
	currentMonitor,
	getAllWindows,
	getCurrentWindow,
	primaryMonitor,
} from "@tauri-apps/api/window";
import {
	emit,
	getCurrentWindowPosition,
	invoke,
	isTauriAvailable,
	listen,
	moveCurrentWindowBy,
	startDraggingWindow,
} from "../core/tauri-helper.js";
import {
	type CollisionDisplayMode,
	renderCollisionOverlay,
} from "./collision-overlay-renderer.js";
import {
	calculateWindowSnap,
	formatSnapTooltipText,
	type MonitorLike,
	pickMonitorWorkArea,
	type ResolvedMonitorWorkArea,
	type SnapResult,
	type SnapTargetType,
	type SnapWindowRect,
} from "./interaction/drag/snap.js";

const urlParams = new URLSearchParams(globalThis.location.search);
const scopeId = parseInt(urlParams.get("scope") || "0", 10);

export interface PlainRect {
	left: number;
	top: number;
	width: number;
	height: number;
	naturalWidth?: number;
	naturalHeight?: number;
}

interface TouchPointLike {
	clientX: number;
	clientY: number;
}

interface InteractionEvent {
	button?: number;
	buttons?: number;
	ctrlKey?: boolean;
	clientX?: number;
	clientY?: number;
	screenX?: number;
	screenY?: number;
	cancelable?: boolean;
	preventDefault?: () => void;
	touches?: ArrayLike<TouchPointLike>;
	changedTouches?: ArrayLike<TouchPointLike>;
	pointerType?: string;
	currentTarget?: unknown;
}

const MULTI_CLICK_DELAY = 350;
const MULTI_CLICK_MAX_DISTANCE = 10;
const DRAG_THRESHOLD = 5;
const GESTURE_MIN_DISTANCE = 20;
const HOVER_DELAY = 300;
const STROKE_THRESHOLD = 40;
const MOUSEMOVE_THROTTLE_MS = 50;
const MOUSEMOVE_MIN_DISTANCE = 4;
const SNAP_THRESHOLD_LOGICAL_PX = 12;

const EX_BUTTON_MAP: Record<number, string> = {
	1: "middle",
	3: "xbutton1",
	4: "xbutton2",
};

const GESTURE_DIRECTIONS = [
	"right",
	"right_down",
	"down",
	"left_down",
	"left",
	"left_up",
	"up",
	"right_up",
] as const;

export function getImageRect(
	img:
		| {
				getBoundingClientRect?: () => Partial<PlainRect> | null;
				naturalWidth?: number;
				naturalHeight?: number;
		  }
		| null
		| undefined,
	root:
		| { getBoundingClientRect?: () => Partial<PlainRect> | null }
		| null
		| undefined,
): PlainRect {
	const naturalWidth = img?.naturalWidth || 0;
	const naturalHeight = img?.naturalHeight || 0;
	const imgRect = img?.getBoundingClientRect?.();
	if (
		imgRect &&
		typeof imgRect.width === "number" &&
		imgRect.width > 0 &&
		typeof imgRect.height === "number" &&
		imgRect.height > 0
	) {
		return {
			left: imgRect.left ?? 0,
			top: imgRect.top ?? 0,
			width: imgRect.width,
			height: imgRect.height,
			naturalWidth,
			naturalHeight,
		};
	}
	const rootRect = root?.getBoundingClientRect?.();
	if (
		rootRect &&
		typeof rootRect.width === "number" &&
		rootRect.width > 0 &&
		typeof rootRect.height === "number" &&
		rootRect.height > 0
	) {
		return {
			left: rootRect.left ?? 0,
			top: rootRect.top ?? 0,
			width: rootRect.width,
			height: rootRect.height,
			naturalWidth,
			naturalHeight,
		};
	}
	return {
		left: 0,
		top: 0,
		width: 200,
		height: 360,
		naturalWidth: 0,
		naturalHeight: 0,
	};
}

export function normalizeDevice(
	e:
		| {
				touches?: unknown;
				changedTouches?: unknown;
				pointerType?: string;
		  }
		| null
		| undefined,
): "touch" | "mouse" {
	if (!e) return "mouse";
	if (
		e.touches ||
		e.changedTouches ||
		(e.pointerType && e.pointerType !== "mouse")
	) {
		return "touch";
	}
	return "mouse";
}

export function detectGestureDirection(dx: number, dy: number): string {
	const angle = Math.atan2(dy, dx);
	const index = ((Math.round(angle / (Math.PI / 4)) % 8) + 8) % 8;
	return GESTURE_DIRECTIONS[index];
}

function isTransparentPixel(
	img: HTMLImageElement,
	clientX: number,
	clientY: number,
) {
	const rect = img.getBoundingClientRect();
	if (!rect.width || !rect.height || !img.naturalWidth || !img.naturalHeight) {
		return false;
	}

	const x = Math.floor((clientX - rect.left) * (img.naturalWidth / rect.width));
	const y = Math.floor(
		(clientY - rect.top) * (img.naturalHeight / rect.height),
	);
	if (x < 0 || y < 0 || x >= img.naturalWidth || y >= img.naturalHeight) {
		return true;
	}

	const canvas = document.createElement("canvas");
	canvas.width = 1;
	canvas.height = 1;
	const ctx = canvas.getContext("2d", { willReadFrequently: true });
	if (!ctx) return false;
	ctx.drawImage(img, x, y, 1, 1, 0, 0, 1, 1);
	return ctx.getImageData(0, 0, 1, 1).data[3] === 0;
}

function openCharacterMenu(
	screenX: number,
	screenY: number,
	clientX?: number,
	clientY?: number,
) {
	const winX = window.screenX ?? globalThis.screenX ?? 0;
	const winY = window.screenY ?? globalThis.screenY ?? 0;

	const safeClientX = clientX ?? 100;
	const safeClientY = clientY ?? 100;

	let posX =
		screenX !== null && screenX !== undefined && screenX > 0
			? screenX
			: winX + safeClientX;
	let posY =
		screenY !== null && screenY !== undefined && screenY > 0
			? screenY
			: winY + safeClientY;

	if (clientX !== undefined && clientX > 0 && winX > 0 && posX < winX) {
		posX = winX + clientX;
		posY = winY + safeClientY;
	}

	if (Number.isNaN(posX)) posX = winX + 100;
	if (Number.isNaN(posY)) posY = winY + 100;

	void invoke("show_menu_window", {
		params: {
			x: posX,
			y: posY,
			scope: scopeId,
		},
	}).catch((err) => {
		console.warn("Failed to open character menu:", err);
	});
}

function initCharacterWindow() {
	const img = document.getElementById("subchar-img") as HTMLImageElement | null;
	const root = document.getElementById("subchar-root");

	let pollTimer: unknown = null;

	let currentImageToken = 0;
	let currentScale = 1.0;
	let lastNaturalWidth = 0;
	let lastNaturalHeight = 0;
	let lastSyncedWidth = 0;
	let lastSyncedHeight = 0;
	let initialPos: { x: number; y: number } | null = null;
	let showCollisions = false;
	let currentCollisionMode: CollisionDisplayMode = "full";
	let currentCollisions: Array<Record<string, unknown>> = [];
	let currentIconRect: number[] | null = null;
	let currentPoints: Record<string, unknown> | null = null;
	let collisionCanvas: HTMLCanvasElement | null =
		typeof document.getElementById === "function"
			? (document.getElementById(
					"subchar-collision-canvas",
				) as HTMLCanvasElement | null)
			: null;

	const renderSubcharCollisionCanvas = () => {
		if (!showCollisions) {
			if (collisionCanvas?.style) {
				collisionCanvas.style.display = "none";
			}
			if (collisionCanvas && typeof collisionCanvas.getContext === "function") {
				const ctx = collisionCanvas.getContext("2d");
				ctx?.clearRect?.(0, 0, collisionCanvas.width, collisionCanvas.height);
			}
			return;
		}

		const baseW = lastNaturalWidth || img?.naturalWidth || img?.width || 0;
		const baseH = lastNaturalHeight || img?.naturalHeight || img?.height || 0;
		if (baseW <= 0 || baseH <= 0) return;

		if (!collisionCanvas && typeof document.getElementById === "function") {
			collisionCanvas = document.getElementById(
				"subchar-collision-canvas",
			) as HTMLCanvasElement | null;
		}
		if (!collisionCanvas && typeof document.createElement === "function") {
			const created = document.createElement("canvas");
			created.id = "subchar-collision-canvas";
			created.className = "collision-overlay-canvas";
			if (!created.style) {
				(created as unknown as { style: Record<string, string> }).style = {};
			}
			created.style.position = "absolute";
			created.style.top = "0";
			created.style.left = "0";
			created.style.pointerEvents = "none";
			created.style.zIndex = "10";
			const container = root || img?.parentElement;
			if (container && typeof container.appendChild === "function") {
				container.appendChild(created);
			}
			collisionCanvas = created;
		}
		if (!collisionCanvas) return;

		const scaledW = Math.max(1, Math.ceil(baseW * currentScale));
		const scaledH = Math.max(1, Math.ceil(baseH * currentScale));
		collisionCanvas.width = scaledW;
		collisionCanvas.height = scaledH;
		if (!collisionCanvas.style) {
			(collisionCanvas as unknown as { style: Record<string, string> }).style =
				{};
		}
		collisionCanvas.style.width = `${scaledW}px`;
		collisionCanvas.style.height = `${scaledH}px`;
		collisionCanvas.style.display = "block";

		const computeCharacterBounds = (): {
			x: number;
			y: number;
			width: number;
			height: number;
		} => {
			if (
				img?.complete &&
				(img.naturalWidth || img.width) > 0 &&
				typeof document.createElement === "function"
			) {
				try {
					const tmp = document.createElement("canvas");
					tmp.width = baseW;
					tmp.height = baseH;
					const tctx = tmp.getContext?.("2d");
					if (tctx) {
						tctx.drawImage(img, 0, 0, baseW, baseH);
						const data = tctx.getImageData(0, 0, baseW, baseH).data;
						let minX = baseW;
						let minY = baseH;
						let maxX = -1;
						let maxY = -1;
						for (let y = 0; y < baseH; y++) {
							const row = y * baseW * 4;
							for (let x = 0; x < baseW; x++) {
								if (data[row + x * 4 + 3] > 0) {
									if (x < minX) minX = x;
									if (x > maxX) maxX = x;
									if (y < minY) minY = y;
									if (y > maxY) maxY = y;
								}
							}
						}
						if (maxX >= minX && maxY >= minY) {
							return {
								x: minX,
								y: minY,
								width: maxX - minX + 1,
								height: maxY - minY + 1,
							};
						}
					}
				} catch (_e) {
					// fallback to full surface bounds
				}
			}
			return { x: 0, y: 0, width: baseW, height: baseH };
		};

		renderCollisionOverlay(collisionCanvas, {
			collisions: currentCollisions,
			scale: currentScale,
			mode: currentCollisionMode,
			characterBounds: computeCharacterBounds(),
			iconRect: currentIconRect,
			points: currentPoints,
		});
	};

	const refreshInitialPositionFromWindow = async () => {
		if (!isTauriAvailable()) return;
		const pos = await getCurrentWindowPosition();
		if (pos && Number.isFinite(pos.x) && Number.isFinite(pos.y)) {
			initialPos = { x: pos.x, y: pos.y };
		}
	};

	const syncCharacterWindowSize = (naturalW: number, naturalH: number) => {
		if (naturalW <= 0 || naturalH <= 0) return;
		lastNaturalWidth = naturalW;
		lastNaturalHeight = naturalH;
		const targetW = Math.max(32, Math.ceil(naturalW * currentScale));
		const targetH = Math.max(32, Math.ceil(naturalH * currentScale));
		if (img) {
			img.width = targetW;
			img.height = targetH;
		}
		renderSubcharCollisionCanvas();
		if (
			isTauriAvailable() &&
			(targetW !== lastSyncedWidth || targetH !== lastSyncedHeight)
		) {
			lastSyncedWidth = targetW;
			lastSyncedHeight = targetH;
			void invoke("show_subchar_window", {
				params: {
					scope_id: scopeId,
					width: targetW,
					height: targetH,
				},
				scope_id: scopeId,
				scopeId,
				width: targetW,
				height: targetH,
			})
				.then(() => {
					if (initialPos === null) {
						void refreshInitialPositionFromWindow();
					}
				})
				.catch(() => {});
		}
	};

	if (isTauriAvailable()) {
		void refreshInitialPositionFromWindow();

		void listen("character-positions-reset", (event: unknown) => {
			const payload = (
				event as {
					payload?: { scopeId?: unknown; x?: unknown; y?: unknown };
				}
			)?.payload;
			if (
				payload &&
				typeof payload.scopeId === "number" &&
				payload.scopeId !== scopeId
			) {
				return;
			}
			if (
				payload &&
				typeof payload.x === "number" &&
				Number.isFinite(payload.x) &&
				typeof payload.y === "number" &&
				Number.isFinite(payload.y)
			) {
				initialPos = { x: payload.x, y: payload.y };
			} else {
				void refreshInitialPositionFromWindow();
			}
		});

		void listen("character-scale-changed", (event: unknown) => {
			const payload = (
				event as {
					payload?: {
						scale?: unknown;
						scalePercent?: unknown;
						scale_percent?: unknown;
					};
				}
			)?.payload;
			if (!payload) return;
			let nextScale: number | null = null;
			if (typeof payload.scale === "number" && Number.isFinite(payload.scale)) {
				nextScale = payload.scale > 10 ? payload.scale / 100 : payload.scale;
			} else if (
				typeof payload.scalePercent === "number" &&
				Number.isFinite(payload.scalePercent)
			) {
				nextScale = payload.scalePercent / 100;
			} else if (
				typeof payload.scale_percent === "number" &&
				Number.isFinite(payload.scale_percent)
			) {
				nextScale = payload.scale_percent / 100;
			}
			if (nextScale === null || nextScale <= 0) return;
			currentScale = Math.min(3.0, Math.max(0.25, nextScale));
			if (lastNaturalWidth > 0 && lastNaturalHeight > 0) {
				syncCharacterWindowSize(lastNaturalWidth, lastNaturalHeight);
			} else {
				renderSubcharCollisionCanvas();
			}
		});

		void listen(`update-subchar-collisions-${scopeId}`, (event: unknown) => {
			const payload = (
				event as {
					payload?: {
						visible?: boolean;
						mode?: CollisionDisplayMode;
						collisions?: Array<Record<string, unknown>>;
						iconRect?: number[] | null;
						points?: Record<string, unknown> | null;
					} | null;
				}
			)?.payload;
			showCollisions = Boolean(payload?.visible);
			currentCollisionMode = payload?.mode === "rect" ? "rect" : "full";
			currentCollisions = Array.isArray(payload?.collisions)
				? payload.collisions
				: [];
			currentIconRect = Array.isArray(payload?.iconRect)
				? payload.iconRect
				: null;
			currentPoints =
				payload?.points && typeof payload.points === "object"
					? payload.points
					: null;
			renderSubcharCollisionCanvas();
		});

		void listen(`update-subchar-image-${scopeId}`, (event: unknown) => {
			const payload = (
				event as {
					payload?: {
						src?: string;
						showCollisions?: boolean;
						mode?: CollisionDisplayMode;
						collisions?: Array<Record<string, unknown>>;
						iconRect?: number[] | null;
						points?: Record<string, unknown> | null;
					} | null;
				}
			)?.payload;
			if (typeof payload?.showCollisions === "boolean") {
				showCollisions = payload.showCollisions;
			}
			if (payload?.mode === "rect" || payload?.mode === "full") {
				currentCollisionMode = payload.mode;
			}
			if (Array.isArray(payload?.collisions)) {
				currentCollisions = payload.collisions;
			}
			if (payload?.iconRect !== undefined) {
				currentIconRect = Array.isArray(payload.iconRect)
					? payload.iconRect
					: null;
			}
			if (payload?.points !== undefined) {
				currentPoints =
					payload.points && typeof payload.points === "object"
						? payload.points
						: null;
			}
			const src = payload?.src;
			if (src && img) {
				if (pollTimer) {
					clearInterval(pollTimer as number);
					pollTimer = null;
				}

				const token = ++currentImageToken;

				// メモリ内で事前デコードしてから反映するアトミックスワップ（画面縮小・チラつき防止）
				const applyDecodedImage = (
					targetImg:
						| HTMLImageElement
						| ImageBitmap
						| { naturalWidth: number; naturalHeight: number },
				) => {
					if (token !== currentImageToken) return;
					const width =
						(targetImg as HTMLImageElement).naturalWidth ||
						(targetImg as { width?: number }).width ||
						0;
					const height =
						(targetImg as HTMLImageElement).naturalHeight ||
						(targetImg as { height?: number }).height ||
						0;

					img.src = src;
					img.style.visibility = "visible";
					img.style.display = "block";

					if (width > 0 && height > 0) {
						syncCharacterWindowSize(width, height);
					}
				};

				if (typeof Image !== "undefined") {
					const preloader = new Image();
					preloader.onload = () => {
						if (typeof preloader.decode === "function") {
							preloader
								.decode()
								.then(() => applyDecodedImage(preloader))
								.catch(() => applyDecodedImage(preloader));
						} else {
							applyDecodedImage(preloader);
						}
					};
					preloader.onerror = () => {
						if (token !== currentImageToken) return;
						img.src = src;
						img.style.visibility = "visible";
						img.style.display = "block";
					};
					preloader.src = src;
					if (preloader.complete && preloader.naturalWidth > 0) {
						applyDecodedImage(preloader);
					}
				} else {
					img.onload = () => {
						img.style.visibility = "visible";
						img.style.display = "block";
						if (img.naturalWidth > 0 && img.naturalHeight > 0) {
							syncCharacterWindowSize(img.naturalWidth, img.naturalHeight);
						}
					};
					img.src = src;
					img.style.visibility = "visible";
					img.style.display = "block";
					if (img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
						syncCharacterWindowSize(img.naturalWidth, img.naturalHeight);
					}
				}
			} else if (img) {
				lastNaturalWidth = 0;
				lastNaturalHeight = 0;
				img.style.display = "none";
				if (collisionCanvas?.style) {
					collisionCanvas.style.display = "none";
				}
			}
		});
	}

	pollTimer = setInterval(() => {
		if (
			img &&
			img.style.display === "block" &&
			img.complete &&
			img.naturalWidth > 0
		) {
			clearInterval(pollTimer as number);
			pollTimer = null;
			return;
		}
		if (isTauriAvailable()) {
			void emit("request-subchar-image", { scopeId });
		}
	}, 100);
	if (isTauriAvailable()) {
		void emit("request-subchar-image", { scopeId });
	}

	let isInteracting = false;
	let hasMoved = false;
	let startX = 0;
	let startY = 0;
	let lastX = 0;
	let lastY = 0;
	let startDevice: "touch" | "mouse" = "mouse";
	let origin: { x: number; y: number } | null = null;
	let longPressTimer: unknown = null;
	let longPressTriggered = false;
	let dragRafId: number | null = null;
	let lastCoordPopupKey: string | null = null;
	let balloonSyncInFlight = false;
	let balloonSyncPending = false;
	let lastBalloonSyncPosKey: string | null = null;
	const LONG_PRESS_DELAY = 600;
	let isCtrlPressed = false;
	let dragSessionId = 0;

	interface DragSnapContext {
		winWidth: number;
		winHeight: number;
		monitors: MonitorLike[];
		otherWindows: SnapWindowRect[];
	}
	let snapContextPromise: Promise<DragSnapContext> | null = null;
	let resolvedSnapContext: DragSnapContext | null = null;

	let hoverTimer: unknown = null;
	let strokeLastX: number | null = null;
	let strokeLastY: number | null = null;
	let strokeDistance = 0;
	let lastMouseMoveEmitTime = 0;
	let lastMouseMoveEmitX: number | null = null;
	let lastMouseMoveEmitY: number | null = null;

	let activeExPress: {
		button: number;
		buttonName: string;
		startX: number;
		startY: number;
		device: "touch" | "mouse";
	} | null = null;

	const rightDrag = {
		startX: 0,
		startY: 0,
		active: false,
	};
	let suppressNextContextMenu = false;
	let suppressContextMenuTimer: unknown = null;
	let lastContextMenuEvent: Event | InteractionEvent | null = null;

	let lastLeftClick: {
		count: number;
		time: number;
		x: number;
		y: number;
	} | null = null;
	const exClickTracker: Record<
		string,
		{ count: number; time: number; x: number; y: number }
	> = {};

	interface BubbledEventRecord {
		event: unknown;
		currentTarget: unknown;
	}
	let lastPointerDownRecord: BubbledEventRecord | null = null;
	let lastWheelRecord: BubbledEventRecord | null = null;

	const isDuplicateBubbledEvent = (
		prev: BubbledEventRecord | null,
		e: { currentTarget?: unknown },
	) =>
		prev !== null &&
		prev.event === e &&
		e.currentTarget !== undefined &&
		e.currentTarget !== prev.currentTarget;

	const emitGhostMouseEvent = (payload: Record<string, unknown>) => {
		if (!isTauriAvailable()) return;
		void emit("ghost-mouse-event", {
			scopeId,
			...payload,
		});
	};

	const clearHoverTimer = () => {
		if (hoverTimer) {
			clearTimeout(hoverTimer as number);
			hoverTimer = null;
		}
	};

	const resetStrokeState = () => {
		strokeLastX = null;
		strokeLastY = null;
		strokeDistance = 0;
	};

	const resetMouseMoveState = () => {
		lastMouseMoveEmitTime = 0;
		lastMouseMoveEmitX = null;
		lastMouseMoveEmitY = null;
	};

	const getFallbackWorkArea = (): ResolvedMonitorWorkArea => {
		const scr = globalThis.screen as
			| {
					availLeft?: number;
					availTop?: number;
					availWidth?: number;
					availHeight?: number;
					width?: number;
					height?: number;
			  }
			| undefined;
		const dpr =
			typeof globalThis.devicePixelRatio === "number" &&
			Number.isFinite(globalThis.devicePixelRatio) &&
			globalThis.devicePixelRatio > 0
				? globalThis.devicePixelRatio
				: 1;
		const availW =
			scr?.availWidth ?? scr?.width ?? globalThis.innerWidth ?? 1920;
		const availH =
			scr?.availHeight ?? scr?.height ?? globalThis.innerHeight ?? 1080;
		return {
			x: Math.round((scr?.availLeft ?? 0) * dpr),
			y: Math.round((scr?.availTop ?? 0) * dpr),
			width: Math.max(1, Math.round(availW * dpr)),
			height: Math.max(1, Math.round(availH * dpr)),
			scaleFactor: dpr,
		};
	};

	const getFallbackWindowSize = (scaleFactor = 1) => {
		const rect = getImageRect(img, root);
		const logicalW =
			lastNaturalWidth > 0
				? Math.max(32, Math.ceil(lastNaturalWidth * currentScale))
				: Math.max(32, rect.width || 200);
		const logicalH =
			lastNaturalHeight > 0
				? Math.max(32, Math.ceil(lastNaturalHeight * currentScale))
				: Math.max(32, rect.height || 360);
		return {
			width: Math.round(logicalW * scaleFactor),
			height: Math.round(logicalH * scaleFactor),
		};
	};

	const loadSnapContext = async (): Promise<DragSnapContext> => {
		const fallbackArea = getFallbackWorkArea();
		const fallbackSize = getFallbackWindowSize(fallbackArea.scaleFactor);
		if (!isTauriAvailable()) {
			const ctx = {
				winWidth: fallbackSize.width,
				winHeight: fallbackSize.height,
				monitors: [],
				otherWindows: [],
			};
			resolvedSnapContext = ctx;
			return ctx;
		}

		let winWidth = fallbackSize.width;
		let winHeight = fallbackSize.height;
		const monitors: MonitorLike[] = [];
		const otherWindows: SnapWindowRect[] = [];

		let selfLabel = `subchar_window_${scopeId}`;
		const currentWin = (() => {
			try {
				return getCurrentWindow();
			} catch {
				return null;
			}
		})();
		if (currentWin?.label) selfLabel = currentWin.label;

		const [sizeRes, availRes, allWindowsRes, selfPosRes] = await Promise.all([
			currentWin
				? currentWin.outerSize().catch(() => null)
				: Promise.resolve(null),
			availableMonitors().catch(() => null),
			getAllWindows().catch(() => null),
			initialPos === null && currentWin
				? currentWin.outerPosition().catch(() => null)
				: Promise.resolve(null),
		]);
		if (
			initialPos === null &&
			selfPosRes &&
			Number.isFinite(selfPosRes.x) &&
			Number.isFinite(selfPosRes.y)
		) {
			initialPos = { x: selfPosRes.x, y: selfPosRes.y };
		}

		if (
			sizeRes &&
			Number.isFinite(sizeRes.width) &&
			sizeRes.width > 0 &&
			Number.isFinite(sizeRes.height) &&
			sizeRes.height > 0
		) {
			winWidth = sizeRes.width;
			winHeight = sizeRes.height;
		}

		if (Array.isArray(availRes) && availRes.length > 0) {
			for (const m of availRes) {
				if (m) monitors.push(m);
			}
		}
		if (monitors.length === 0) {
			try {
				const mon = (await currentMonitor()) ?? (await primaryMonitor());
				if (mon) monitors.push(mon);
			} catch {}
		}

		if (Array.isArray(allWindowsRes)) {
			const expectedSelfLabel = `subchar_window_${scopeId}`;
			const candidates = allWindowsRes.filter(
				(w) =>
					w &&
					w.label !== selfLabel &&
					w.label !== expectedSelfLabel &&
					(w.label === "main" || w.label.startsWith("subchar_window_")),
			);
			const rects = await Promise.all(
				candidates.map(async (w) => {
					try {
						const visible = await w.isVisible();
						if (!visible) return null;
						const [pos, size] = await Promise.all([
							w.outerPosition(),
							w.outerSize(),
						]);
						if (
							!pos ||
							!size ||
							!Number.isFinite(pos.x) ||
							!Number.isFinite(pos.y) ||
							!Number.isFinite(size.width) ||
							!Number.isFinite(size.height) ||
							size.width <= 0 ||
							size.height <= 0
						) {
							return null;
						}
						return {
							x: pos.x,
							y: pos.y,
							width: size.width,
							height: size.height,
						};
					} catch {
						return null;
					}
				}),
			);
			for (const r of rects) {
				if (r) otherWindows.push(r);
			}
		}

		const ctx = { winWidth, winHeight, monitors, otherWindows };
		resolvedSnapContext = ctx;
		return ctx;
	};

	const computeSnapForPosition = (
		rawX: number,
		rawY: number,
		context: DragSnapContext,
	): SnapResult => {
		const fallbackArea = getFallbackWorkArea();
		const workArea = pickMonitorWorkArea(
			context.monitors,
			rawX,
			rawY,
			context.winWidth,
			context.winHeight,
			fallbackArea,
		);
		const snapThreshold = Math.max(
			1,
			Math.round(SNAP_THRESHOLD_LOGICAL_PX * workArea.scaleFactor),
		);
		return calculateWindowSnap(
			rawX,
			rawY,
			context.winWidth,
			context.winHeight,
			context.otherWindows,
			workArea,
			initialPos,
			isCtrlPressed,
			snapThreshold,
		);
	};

	const updateDragPopupFromCurrentPosition = async (sessionId: number) => {
		const context = snapContextPromise
			? await snapContextPromise
			: await loadSnapContext();
		const pos = await getCurrentWindowPosition();
		if (
			!isInteracting ||
			sessionId !== dragSessionId ||
			!pos ||
			!Number.isFinite(pos.x) ||
			!Number.isFinite(pos.y)
		) {
			return;
		}
		const snap = computeSnapForPosition(pos.x, pos.y, context);
		showCoordPopup(snap.x, snap.y, snap.snapXType, snap.snapYType);
	};

	const commitSnapOnDragEnd = async (
		sessionId: number,
		pendingContext: Promise<DragSnapContext> | null,
	) => {
		if (sessionId !== dragSessionId || isCtrlPressed) return;
		const context = pendingContext
			? await pendingContext
			: await loadSnapContext();
		const pos = await getCurrentWindowPosition();
		if (!pos || !Number.isFinite(pos.x) || !Number.isFinite(pos.y)) return;
		const snap = computeSnapForPosition(pos.x, pos.y, context);
		if (snap.snapXType === "None" && snap.snapYType === "None") return;
		const targetX = Math.round(snap.x);
		const targetY = Math.round(snap.y);
		if (targetX === Math.round(pos.x) && targetY === Math.round(pos.y)) {
			return;
		}
		await invoke("show_subchar_window", {
			params: {
				scope_id: scopeId,
				x: targetX,
				y: targetY,
			},
			scope_id: scopeId,
			scopeId,
			x: targetX,
			y: targetY,
		}).catch(() => {});
		void invoke("sync_character_balloon", { scopeId }).catch(() => {});
	};

	const requestBalloonSync = (posKey: string) => {
		if (!isTauriAvailable()) return;
		if (posKey === lastBalloonSyncPosKey) return;
		if (balloonSyncInFlight) {
			balloonSyncPending = true;
			return;
		}
		balloonSyncInFlight = true;
		lastBalloonSyncPosKey = posKey;
		void invoke("sync_character_balloon", { scopeId })
			.catch(() => {})
			.finally(() => {
				balloonSyncInFlight = false;
				if (balloonSyncPending && isInteracting) {
					balloonSyncPending = false;
					if (lastBalloonSyncPosKey !== null) {
						void invoke("sync_character_balloon", { scopeId }).catch(() => {});
					}
				}
			});
	};

	const runDragFollowFrame = async (sessionId: number) => {
		if (!isInteracting || sessionId !== dragSessionId) return;
		const [context, pos] = await Promise.all([
			snapContextPromise ?? loadSnapContext(),
			getCurrentWindowPosition(),
		]);
		if (
			!isInteracting ||
			sessionId !== dragSessionId ||
			!pos ||
			!Number.isFinite(pos.x) ||
			!Number.isFinite(pos.y)
		) {
			return;
		}
		const snap = computeSnapForPosition(pos.x, pos.y, context);
		showCoordPopup(snap.x, snap.y, snap.snapXType, snap.snapYType);
		requestBalloonSync(`${Math.round(pos.x)},${Math.round(pos.y)}`);
	};

	const scheduleFrame = (cb: FrameRequestCallback): number =>
		typeof globalThis.requestAnimationFrame === "function"
			? globalThis.requestAnimationFrame(cb)
			: (setTimeout(() => cb(Date.now()), 16) as unknown as number);

	const cancelFrame = (id: number) => {
		if (typeof globalThis.cancelAnimationFrame === "function") {
			globalThis.cancelAnimationFrame(id);
		} else {
			clearTimeout(id);
		}
	};

	const stopDragFollowLoop = () => {
		if (dragRafId !== null) {
			cancelFrame(dragRafId);
			dragRafId = null;
		}
		balloonSyncPending = false;
		lastBalloonSyncPosKey = null;
	};

	const startDragFollowLoop = (sessionId: number) => {
		stopDragFollowLoop();
		const tick = () => {
			if (!isInteracting || sessionId !== dragSessionId) {
				dragRafId = null;
				return;
			}
			void runDragFollowFrame(sessionId);
			dragRafId = scheduleFrame(tick);
		};
		void runDragFollowFrame(sessionId);
		dragRafId = scheduleFrame(tick);
	};

	const onPointerDown = (e: InteractionEvent) => {
		if (isDuplicateBubbledEvent(lastPointerDownRecord, e)) return;
		lastPointerDownRecord = { event: e, currentTarget: e.currentTarget };

		const button = e.button !== undefined ? e.button : 0;
		const clientX =
			e.clientX ??
			e.touches?.[0]?.clientX ??
			e.changedTouches?.[0]?.clientX ??
			0;
		const clientY =
			e.clientY ??
			e.touches?.[0]?.clientY ??
			e.changedTouches?.[0]?.clientY ??
			0;
		const screenX = e.screenX ?? clientX;
		const screenY = e.screenY ?? clientY;
		const device = normalizeDevice(e);

		// 1. 右クリック (button === 2): ジェスチャー開始座標を記録し、離した時に距離判定を行う
		if (button === 2) {
			if (img && isTransparentPixel(img, clientX, clientY)) {
				return;
			}
			if (e.cancelable !== false) e.preventDefault?.();
			clearHoverTimer();
			rightDrag.startX = clientX;
			rightDrag.startY = clientY;
			rightDrag.active = true;
			return;
		}

		// 2. 拡張ボタン (1: middle, 3: xbutton1, 4: xbutton2)
		const exButtonName = EX_BUTTON_MAP[button];
		if (exButtonName) {
			if (img && isTransparentPixel(img, clientX, clientY)) {
				return;
			}
			if (e.cancelable !== false) e.preventDefault?.();
			clearHoverTimer();
			const rect = getImageRect(img, root);
			activeExPress = {
				button,
				buttonName: exButtonName,
				startX: clientX,
				startY: clientY,
				device,
			};
			emitGhostMouseEvent({
				type: "mousedown-ex",
				clientX,
				clientY,
				rect,
				button: exButtonName,
				device,
			});
			if (button === 1) {
				void emit("menu-action", {
					action: "open-dev",
					payload: { scope: scopeId },
				});
			}
			return;
		}

		if (button !== 0) return;

		if (img && isTransparentPixel(img, clientX, clientY)) {
			return;
		}

		clearHoverTimer();
		const sessionId = ++dragSessionId;
		snapContextPromise = null;
		resolvedSnapContext = null;
		if (typeof e.ctrlKey === "boolean") {
			isCtrlPressed = e.ctrlKey;
		}
		isInteracting = true;
		hasMoved = false;
		longPressTriggered = false;
		startX = clientX;
		startY = clientY;
		lastX = clientX;
		lastY = clientY;
		startDevice = device;

		const rect = getImageRect(img, root);
		emitGhostMouseEvent({
			type: "mousedown",
			clientX,
			clientY,
			rect,
			button: 0,
			device,
		});

		void getCurrentWindowPosition().then((position) => {
			if (
				isInteracting &&
				sessionId === dragSessionId &&
				position &&
				Number.isFinite(position.x) &&
				Number.isFinite(position.y)
			) {
				origin = position;
				if (initialPos === null) {
					initialPos = { x: position.x, y: position.y };
				}
			}
		});

		if (longPressTimer) clearTimeout(longPressTimer as number);
		if (device === "touch") {
			longPressTimer = setTimeout(() => {
				if (isInteracting && !hasMoved) {
					longPressTriggered = true;
					openCharacterMenu(screenX, screenY, startX, startY);
				}
			}, LONG_PRESS_DELAY);
		}
	};

	let coordPopupEl: HTMLElement | null = null;
	function showCoordPopup(
		x: number,
		y: number,
		snapXType: SnapTargetType = "None",
		snapYType: SnapTargetType = "None",
	) {
		if (!coordPopupEl) {
			coordPopupEl = document.getElementById("coord-popup");
		}
		if (coordPopupEl) {
			const nextKey = `${Math.round(x)},${Math.round(y)},${snapXType},${snapYType},${isCtrlPressed ? 1 : 0}`;
			if (
				nextKey === lastCoordPopupKey &&
				coordPopupEl.style.display === "block"
			) {
				return;
			}
			lastCoordPopupKey = nextKey;
			coordPopupEl.textContent = formatSnapTooltipText(
				x,
				y,
				snapXType,
				snapYType,
			);
			coordPopupEl.style.display = "block";
		}
	}
	function hideCoordPopup() {
		lastCoordPopupKey = null;
		if (coordPopupEl) {
			coordPopupEl.style.display = "none";
		}
	}

	const onPointerMove = (e: InteractionEvent) => {
		const clientX =
			e.clientX ??
			e.touches?.[0]?.clientX ??
			e.changedTouches?.[0]?.clientX ??
			0;
		const clientY =
			e.clientY ??
			e.touches?.[0]?.clientY ??
			e.changedTouches?.[0]?.clientY ??
			0;

		if (!isInteracting) {
			if (rightDrag.active || activeExPress) return;
			if (e.touches || e.changedTouches) return;
			if (img && isTransparentPixel(img, clientX, clientY)) {
				clearHoverTimer();
				resetStrokeState();
				resetMouseMoveState();
				return;
			}
			const rect = getImageRect(img, root);
			const now = Date.now();
			const moveDist =
				lastMouseMoveEmitX !== null && lastMouseMoveEmitY !== null
					? Math.hypot(
							clientX - lastMouseMoveEmitX,
							clientY - lastMouseMoveEmitY,
						)
					: Number.POSITIVE_INFINITY;
			if (
				lastMouseMoveEmitX === null ||
				now - lastMouseMoveEmitTime >= MOUSEMOVE_THROTTLE_MS ||
				moveDist >= MOUSEMOVE_MIN_DISTANCE
			) {
				lastMouseMoveEmitTime = now;
				lastMouseMoveEmitX = clientX;
				lastMouseMoveEmitY = clientY;
				emitGhostMouseEvent({
					type: "mousemove",
					clientX,
					clientY,
					rect,
				});
			}
			if (strokeLastX !== null && strokeLastY !== null) {
				const dist = Math.hypot(clientX - strokeLastX, clientY - strokeLastY);
				if (dist > 0) {
					strokeDistance += dist;
					if (strokeDistance >= STROKE_THRESHOLD) {
						strokeDistance = 0;
						emitGhostMouseEvent({
							type: "stroke",
							clientX,
							clientY,
							rect,
						});
					}
				}
			}
			strokeLastX = clientX;
			strokeLastY = clientY;

			clearHoverTimer();
			hoverTimer = setTimeout(() => {
				hoverTimer = null;
				if (!isInteracting && !rightDrag.active && !activeExPress) {
					emitGhostMouseEvent({
						type: "hover",
						clientX,
						clientY,
						rect: getImageRect(img, root),
					});
				}
			}, HOVER_DELAY);
			return;
		}

		if (typeof e.ctrlKey === "boolean") {
			isCtrlPressed = e.ctrlKey;
		}
		if (
			isInteracting &&
			startDevice === "mouse" &&
			typeof e.buttons === "number" &&
			(e.buttons & 1) === 0
		) {
			onPointerUp(e);
			return;
		}

		lastX = clientX;
		lastY = clientY;

		const deltaX = clientX - startX;
		const deltaY = clientY - startY;

		if (!hasMoved && Math.hypot(deltaX, deltaY) > DRAG_THRESHOLD) {
			hasMoved = true;
			snapContextPromise = loadSnapContext();
			if (longPressTimer) {
				clearTimeout(longPressTimer as number);
				longPressTimer = null;
			}
			const rect = getImageRect(img, root);
			if (isTauriAvailable()) {
				// Tauri デスクトップでは OS ネイティブの startDraggingWindow() で滑らかに移動しつつ、
				// rAF でスナップ予測と #coord-popup 更新・バルーン追従を行い、ドロップ時に確定座標を適用する
				void startDraggingWindow();
				startDragFollowLoop(dragSessionId);
			}
			emitGhostMouseEvent({
				type: "dragstart",
				clientX,
				clientY,
				rect,
			});
		}

		if (hasMoved) {
			if (!isTauriAvailable() && origin) {
				const fallbackArea = getFallbackWorkArea();
				const fallbackSize = getFallbackWindowSize(fallbackArea.scaleFactor);
				const ctx = resolvedSnapContext ?? {
					winWidth: fallbackSize.width,
					winHeight: fallbackSize.height,
					monitors: [],
					otherWindows: [],
				};
				const snap = computeSnapForPosition(
					origin.x + deltaX,
					origin.y + deltaY,
					ctx,
				);
				void moveCurrentWindowBy(snap.x - origin.x, snap.y - origin.y, origin);
				showCoordPopup(snap.x, snap.y, snap.snapXType, snap.snapYType);
			}
			if (isTauriAvailable()) {
				if (dragRafId === null) {
					startDragFollowLoop(dragSessionId);
				} else {
					void runDragFollowFrame(dragSessionId);
				}
			}
		}
	};

	const onPointerUp = (e?: InteractionEvent) => {
		if (
			rightDrag.active &&
			(e?.button === 2 ||
				(!isInteracting && !activeExPress && e?.button === undefined))
		) {
			rightDrag.active = false;
			const endX = e?.clientX ?? rightDrag.startX;
			const endY = e?.clientY ?? rightDrag.startY;
			const dx = endX - rightDrag.startX;
			const dy = endY - rightDrag.startY;
			if (Math.hypot(dx, dy) > GESTURE_MIN_DISTANCE) {
				const direction = detectGestureDirection(dx, dy);
				const rect = getImageRect(img, root);
				emitGhostMouseEvent({
					type: "gesture",
					startX: rightDrag.startX,
					startY: rightDrag.startY,
					endX,
					endY,
					rect,
					direction,
				});
				suppressNextContextMenu = true;
				if (suppressContextMenuTimer) {
					clearTimeout(suppressContextMenuTimer as number);
				}
				suppressContextMenuTimer = setTimeout(() => {
					suppressNextContextMenu = false;
					suppressContextMenuTimer = null;
				}, 100);
			}
			return;
		}

		if (
			activeExPress &&
			(e?.button === activeExPress.button ||
				(!isInteracting && e?.button === undefined))
		) {
			const ex = activeExPress;
			activeExPress = null;
			const clientX =
				e?.clientX ??
				e?.changedTouches?.[0]?.clientX ??
				e?.touches?.[0]?.clientX ??
				ex.startX;
			const clientY =
				e?.clientY ??
				e?.changedTouches?.[0]?.clientY ??
				e?.touches?.[0]?.clientY ??
				ex.startY;
			const device = e ? normalizeDevice(e) : ex.device;
			const rect = getImageRect(img, root);

			emitGhostMouseEvent({
				type: "mouseup-ex",
				clientX,
				clientY,
				rect,
				button: ex.buttonName,
				device,
			});

			if (
				Math.hypot(clientX - ex.startX, clientY - ex.startY) <= DRAG_THRESHOLD
			) {
				const now = Date.now();
				const prev = exClickTracker[ex.buttonName];
				const count =
					prev &&
					now - prev.time <= MULTI_CLICK_DELAY &&
					Math.hypot(clientX - prev.x, clientY - prev.y) <=
						MULTI_CLICK_MAX_DISTANCE
						? prev.count + 1
						: 1;
				exClickTracker[ex.buttonName] = {
					count,
					time: now,
					x: clientX,
					y: clientY,
				};
				if (count >= 3) {
					emitGhostMouseEvent({
						type: "multipleclick",
						clientX,
						clientY,
						rect,
						count,
						button: ex.buttonName,
						device,
						isEx: true,
					});
				} else {
					emitGhostMouseEvent({
						type: "click-ex",
						clientX,
						clientY,
						rect,
						button: ex.buttonName,
						device,
						isDouble: count === 2,
					});
				}
			} else {
				delete exClickTracker[ex.buttonName];
			}
			return;
		}

		if (!isInteracting) return;
		if (e?.button !== undefined && e.button !== 0) return;

		if (typeof e?.ctrlKey === "boolean") {
			isCtrlPressed = e.ctrlKey;
		}
		const sessionId = dragSessionId;
		const pendingSnapContext = snapContextPromise;
		snapContextPromise = null;

		isInteracting = false;
		hideCoordPopup();
		stopDragFollowLoop();

		if (longPressTimer) {
			clearTimeout(longPressTimer as number);
			longPressTimer = null;
		}

		const clientX =
			e?.clientX ??
			e?.changedTouches?.[0]?.clientX ??
			e?.touches?.[0]?.clientX ??
			lastX;
		const clientY =
			e?.clientY ??
			e?.changedTouches?.[0]?.clientY ??
			e?.touches?.[0]?.clientY ??
			lastY;
		const device = e ? normalizeDevice(e) : startDevice;
		const rect = getImageRect(img, root);

		if (hasMoved) {
			if (isTauriAvailable()) {
				void commitSnapOnDragEnd(sessionId, pendingSnapContext);
			}
			emitGhostMouseEvent({
				type: "dragend",
				clientX,
				clientY,
				rect,
			});
		}

		emitGhostMouseEvent({
			type: "mouseup",
			clientX,
			clientY,
			rect,
			button: 0,
			device,
		});

		if (!hasMoved && !longPressTriggered) {
			const now = Date.now();
			const count =
				lastLeftClick &&
				now - lastLeftClick.time <= MULTI_CLICK_DELAY &&
				Math.hypot(clientX - lastLeftClick.x, clientY - lastLeftClick.y) <=
					MULTI_CLICK_MAX_DISTANCE
					? lastLeftClick.count + 1
					: 1;
			lastLeftClick = { count, time: now, x: clientX, y: clientY };

			if (count === 1) {
				void emit("menu-action", {
					action: "talk",
					payload: { scope: scopeId, clientX, clientY, rect },
				});
			} else if (count === 2) {
				emitGhostMouseEvent({
					type: "dblclick",
					clientX,
					clientY,
					rect,
					button: 0,
					device,
				});
			} else {
				emitGhostMouseEvent({
					type: "multipleclick",
					clientX,
					clientY,
					rect,
					count,
					button: 0,
					device,
					isEx: false,
				});
			}
		} else {
			lastLeftClick = null;
		}
	};

	const onMouseEnter = (e?: InteractionEvent) => {
		resetStrokeState();
		resetMouseMoveState();
		const clientX = e?.clientX ?? 0;
		const clientY = e?.clientY ?? 0;
		emitGhostMouseEvent({
			type: "mouseenter",
			clientX,
			clientY,
			rect: getImageRect(img, root),
			isWindow: true,
		});
	};

	const onMouseLeave = (e?: InteractionEvent) => {
		clearHoverTimer();
		resetStrokeState();
		resetMouseMoveState();
		const clientX = e?.clientX ?? 0;
		const clientY = e?.clientY ?? 0;
		emitGhostMouseEvent({
			type: "mouseleave",
			clientX,
			clientY,
			rect: getImageRect(img, root),
			isWindow: true,
		});
	};

	// マウスホイール (OnMouseWheel)
	const onWheel = (e: WheelEvent) => {
		if (isDuplicateBubbledEvent(lastWheelRecord, e)) return;
		lastWheelRecord = { event: e, currentTarget: e.currentTarget };

		const clientX = e.clientX ?? 0;
		const clientY = e.clientY ?? 0;
		if (img && isTransparentPixel(img, clientX, clientY)) {
			return;
		}
		if (e.cancelable !== false) e.preventDefault?.();
		const rawDelta = Number(e.deltaY ?? 0);
		const safeDelta = Number.isFinite(rawDelta) ? rawDelta : 0;
		emitGhostMouseEvent({
			type: "wheel",
			clientX,
			clientY,
			rect: getImageRect(img, root),
			delta: Math.round(safeDelta) || 0,
		});
	};

	const onContextMenu = (e?: Event | InteractionEvent | null) => {
		if (e && lastContextMenuEvent === e) return;
		if (e) lastContextMenuEvent = e;

		const evt = e as InteractionEvent | undefined;
		if (suppressNextContextMenu) {
			suppressNextContextMenu = false;
			if (suppressContextMenuTimer) {
				clearTimeout(suppressContextMenuTimer as number);
				suppressContextMenuTimer = null;
			}
			evt?.preventDefault?.();
			return;
		}

		evt?.preventDefault?.();
		const clientX = evt?.clientX ?? 0;
		const clientY = evt?.clientY ?? 0;
		openCharacterMenu(
			evt?.screenX ?? clientX,
			evt?.screenY ?? clientY,
			clientX,
			clientY,
		);
	};

	const onKeyDown = (e: KeyboardEvent) => {
		isCtrlPressed = Boolean(e?.ctrlKey || e?.key === "Control");
		if (isInteracting && hasMoved && isTauriAvailable()) {
			void updateDragPopupFromCurrentPosition(dragSessionId);
		}
		const key = e?.key?.toLowerCase?.() ?? "";
		if (e?.ctrlKey && e?.shiftKey && !e?.altKey && key === "f12") {
			e.preventDefault?.();
			if (isTauriAvailable()) {
				void invoke("reset_character_positions")
					.then(() => refreshInitialPositionFromWindow())
					.catch(() => {});
			}
		} else if (e?.ctrlKey && e?.shiftKey && !e?.altKey && key === "f10") {
			e.preventDefault?.();
			if (isTauriAvailable()) {
				void invoke("reset_balloon_positions").catch(() => {});
			}
		} else if (e?.ctrlKey && e?.shiftKey && !e?.altKey && key === "d") {
			e.preventDefault?.();
			void emit("menu-action", {
				action: "dev-palette",
				payload: { scope: scopeId },
			});
		} else if (e?.ctrlKey && !e?.shiftKey && !e?.altKey && key === "l") {
			e.preventDefault?.();
			void emit("menu-action", {
				action: "script-log",
				payload: { scope: scopeId },
			});
		}
	};

	const onKeyUp = (e: KeyboardEvent) => {
		if (e?.key === "Control") {
			isCtrlPressed = false;
		} else if (typeof e?.ctrlKey === "boolean") {
			isCtrlPressed = e.ctrlKey;
		}
		if (isInteracting && hasMoved && isTauriAvailable()) {
			void updateDragPopupFromCurrentPosition(dragSessionId);
		}
	};

	const onWindowBlur = () => {
		isCtrlPressed = false;
	};

	if (typeof img?.addEventListener === "function") {
		img.addEventListener("mousedown", onPointerDown as EventListener);
		img.addEventListener("wheel", onWheel as EventListener, { passive: false });
		img.addEventListener("contextmenu", onContextMenu as EventListener);
	}
	root?.addEventListener("mousedown", onPointerDown as EventListener);
	root?.addEventListener("wheel", onWheel as EventListener, { passive: false });
	root?.addEventListener("contextmenu", onContextMenu as EventListener);
	const enterLeaveTarget = root || img;
	if (typeof enterLeaveTarget?.addEventListener === "function") {
		enterLeaveTarget.addEventListener(
			"mouseenter",
			onMouseEnter as EventListener,
		);
		enterLeaveTarget.addEventListener(
			"mouseleave",
			onMouseLeave as EventListener,
		);
	}
	document.addEventListener("contextmenu", onContextMenu as EventListener);
	globalThis.addEventListener("contextmenu", onContextMenu as EventListener);
	globalThis.addEventListener("mousemove", onPointerMove as EventListener);
	globalThis.addEventListener("mouseup", onPointerUp as EventListener);
	globalThis.addEventListener("keydown", onKeyDown as EventListener);
	globalThis.addEventListener("keyup", onKeyUp as EventListener);
	globalThis.addEventListener("blur", onWindowBlur as EventListener);

	if (typeof img?.addEventListener === "function") {
		img.addEventListener("touchstart", onPointerDown as EventListener, {
			passive: true,
		});
	}
	root?.addEventListener("touchstart", onPointerDown as EventListener, {
		passive: true,
	});
	globalThis.addEventListener("touchmove", onPointerMove as EventListener, {
		passive: true,
	});
	globalThis.addEventListener("touchend", onPointerUp as EventListener);
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", initCharacterWindow);
} else {
	initCharacterWindow();
}
