/**
 * Nanai Android Mascot - キャラクターウィンドウ制御スクリプト
 */
import {
	emit,
	getCurrentWindowPosition,
	invoke,
	isTauriAvailable,
	listen,
	moveCurrentWindowBy,
	startDraggingWindow,
} from "../core/tauri-helper.js";

const urlParams = new URLSearchParams(globalThis.location.search);
const scopeId = parseInt(urlParams.get("scope") || "0", 10);

export interface PlainRect {
	left: number;
	top: number;
	width: number;
	height: number;
}

interface TouchPointLike {
	clientX: number;
	clientY: number;
}

interface InteractionEvent {
	button?: number;
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
		| { getBoundingClientRect?: () => Partial<PlainRect> | null }
		| null
		| undefined,
	root:
		| { getBoundingClientRect?: () => Partial<PlainRect> | null }
		| null
		| undefined,
): PlainRect {
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
		};
	}
	return { left: 0, top: 0, width: 200, height: 360 };
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

	if (isTauriAvailable()) {
		void listen(`update-subchar-image-${scopeId}`, (event: unknown) => {
			const src = (event as { payload?: { src?: string } })?.payload?.src;
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
						void invoke("show_subchar_window", {
							scopeId,
							width,
							height,
						}).catch(() => {});
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
							void invoke("show_subchar_window", {
								scopeId,
								width: img.naturalWidth,
								height: img.naturalHeight,
							}).catch(() => {});
						}
					};
					img.src = src;
					img.style.visibility = "visible";
					img.style.display = "block";
					if (img.complete && img.naturalWidth > 0) {
						void invoke("show_subchar_window", {
							scopeId,
							width: img.naturalWidth,
							height: img.naturalHeight,
						}).catch(() => {});
					}
				}
			} else if (img) {
				img.style.display = "none";
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
	let coordInterval: unknown = null;
	const LONG_PRESS_DELAY = 600;

	let hoverTimer: unknown = null;
	let strokeLastX: number | null = null;
	let strokeLastY: number | null = null;
	let strokeDistance = 0;

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

	const startCoordInterval = () => {
		if (coordInterval) clearInterval(coordInterval as number);
		coordInterval = setInterval(async () => {
			if (!isInteracting) {
				clearInterval(coordInterval as number);
				coordInterval = null;
				return;
			}
			if (!coordPopupEl) {
				coordPopupEl = document.getElementById("coord-popup");
			}
			if (coordPopupEl) {
				const pos = await getCurrentWindowPosition();
				if (pos) {
					coordPopupEl.textContent = `X: ${pos.x}, Y: ${pos.y}`;
					coordPopupEl.style.display = "block";
				}
			}
			if (isTauriAvailable()) {
				void invoke("sync_character_balloon", { scopeId });
			}
		}, 50);
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
			if (isInteracting && position) origin = position;
		});

		if (longPressTimer) clearTimeout(longPressTimer as number);
		longPressTimer = setTimeout(() => {
			if (isInteracting && !hasMoved) {
				longPressTriggered = true;
				openCharacterMenu(screenX, screenY, startX, startY);
			}
		}, LONG_PRESS_DELAY);
	};

	let coordPopupEl: HTMLElement | null = null;
	function showCoordPopup(x: number, y: number) {
		if (!coordPopupEl) {
			coordPopupEl = document.getElementById("coord-popup");
		}
		if (coordPopupEl) {
			coordPopupEl.textContent = `X: ${x}, Y: ${y}`;
			coordPopupEl.style.display = "block";
		}
	}
	function hideCoordPopup() {
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
				return;
			}
			const rect = getImageRect(img, root);
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

		lastX = clientX;
		lastY = clientY;

		const deltaX = clientX - startX;
		const deltaY = clientY - startY;

		if (!hasMoved && Math.hypot(deltaX, deltaY) > DRAG_THRESHOLD) {
			hasMoved = true;
			if (longPressTimer) {
				clearTimeout(longPressTimer as number);
				longPressTimer = null;
			}
			const rect = getImageRect(img, root);
			if (isTauriAvailable()) {
				void startDraggingWindow();
				startCoordInterval();
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
				void moveCurrentWindowBy(deltaX, deltaY, origin);
			}
			if (isTauriAvailable()) {
				void invoke("sync_character_balloon", { scopeId });
			}
			void getCurrentWindowPosition().then((pos) => {
				if (pos) showCoordPopup(pos.x, pos.y);
			});
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

		isInteracting = false;
		hideCoordPopup();
		if (coordInterval) {
			clearInterval(coordInterval as number);
			coordInterval = null;
		}

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

	// マウスホイール (拡大縮小 / スケール調整)
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
		const deltaSign = Math.sign(safeDelta);
		// ホイール下スクロールで縮小 (90%), 上スクロールで拡大 (110%)
		const newScale = deltaSign > 0 ? 90 : 110;
		if (isTauriAvailable()) {
			void invoke("set_character_scale", { scalePercent: newScale });
		}
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
