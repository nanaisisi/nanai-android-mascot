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

	let posX =
		screenX !== null && screenX !== undefined && screenX > 0
			? screenX
			: winX + (clientX ?? 100);
	let posY =
		screenY !== null && screenY !== undefined && screenY > 0
			? screenY
			: winY + (clientY ?? 100);

	if (clientX !== undefined && clientX > 0 && winX > 0 && posX < winX) {
		posX = winX + clientX;
		posY = winY + clientY;
	}

	if (Number.isNaN(posX)) posX = winX + 100;
	if (Number.isNaN(posY)) posY = winY + 100;

	void invoke("show_menu_window", {
		x: posX,
		y: posY,
		scope: scopeId,
	}).catch((err) => {
		console.warn("Failed to open character menu:", err);
	});
}

function initCharacterWindow() {
	const img = /** @type {HTMLImageElement | null} */ (
		document.getElementById("subchar-img")
	);
	/** @type {HTMLElement | null} */
	const root = document.getElementById("subchar-root");

	let pollTimer: unknown = null;

	let currentImageToken = 0;

	if (isTauriAvailable()) {
		void listen(
			`update-subchar-image-${scopeId}`,
			(/** @type {{ payload?: { src?: string } }} */ event: unknown) => {
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
			},
		);
	}

	pollTimer = setInterval(() => {
		if (
			img &&
			img.style.display === "block" &&
			img.complete &&
			img.naturalWidth > 0
		) {
			clearInterval(pollTimer);
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
	let origin: { x: number; y: number } | null = null;
	let longPressTimer: unknown = null;
	let longPressTriggered = false;
	let coordInterval: unknown = null;
	const LONG_PRESS_DELAY = 600;

	const onPointerDown = (e: unknown) => {
		const button = e.button !== undefined ? e.button : 0;

		// 1. 右クリック (button === 2): コンテキストメニュー表示
		if (button === 2) {
			if (e.cancelable) e.preventDefault();
			const clientX = e.clientX ?? 0;
			const clientY = e.clientY ?? 0;
			if (img && !isTransparentPixel(img, clientX, clientY)) {
				openCharacterMenu(
					e.screenX ?? clientX,
					e.screenY ?? clientY,
					clientX,
					clientY,
				);
			}
			return;
		}

		// 2. ホイールクリック / ミドルクリック (button === 1): デベロッパーパネル/クイック機能の起動
		if (button === 1) {
			if (e.cancelable) e.preventDefault();
			const clientX = e.clientX ?? 0;
			const clientY = e.clientY ?? 0;
			if (img && !isTransparentPixel(img, clientX, clientY)) {
				void emit("menu-action", {
					action: "open-dev",
					payload: { scope: scopeId },
				});
			}
			return;
		}

		if (button !== 0) return;

		const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
		const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
		const screenX = e.screenX ?? clientX;
		const screenY = e.screenY ?? clientY;

		isInteracting = true;
		hasMoved = false;
		longPressTriggered = false;
		startX = clientX;
		startY = clientY;

		// Tauri ウィンドウドラッグ起動
		if (isTauriAvailable()) {
			void startDraggingWindow();
			if (coordInterval) clearInterval(coordInterval as number);
			coordInterval = setInterval(async () => {
				if (!isInteracting) {
					clearInterval(coordInterval as number);
					coordInterval = null;
					return;
				}
				if (!coordPopupEl)
					coordPopupEl = document.getElementById("coord-popup");
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
		}

		void getCurrentWindowPosition().then((position) => {
			if (isInteracting && position) origin = position;
		});

		if (longPressTimer) clearTimeout(longPressTimer);
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

	const onPointerMove = (e: unknown) => {
		if (!isInteracting) return;

		const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
		const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;

		const deltaX = clientX - startX;
		const deltaY = clientY - startY;

		if (!hasMoved && Math.hypot(deltaX, deltaY) > 5) {
			hasMoved = true;
			if (longPressTimer) {
				clearTimeout(longPressTimer);
				longPressTimer = null;
			}
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

	const onPointerUp = () => {
		if (!isInteracting) return;
		isInteracting = false;
		hideCoordPopup();
		if (coordInterval) {
			clearInterval(coordInterval as number);
			coordInterval = null;
		}

		if (longPressTimer) {
			clearTimeout(longPressTimer);
			longPressTimer = null;
		}

		if (longPressTriggered) return;

		if (!hasMoved) {
			void emit("menu-action", { action: "talk", payload: { scope: scopeId } });
		}
	};

	// マウスホイール (拡大縮小 / スケール調整)
	const onWheel = (e: WheelEvent) => {
		if (img && isTransparentPixel(img, e.clientX, e.clientY)) {
			return;
		}
		if (e.cancelable) e.preventDefault();
		const delta = Math.sign(e.deltaY);
		// ホイール下スクロールで縮小 (90%), 上スクロールで拡大 (110%)
		const newScale = delta > 0 ? 90 : 110;
		if (isTauriAvailable()) {
			void invoke("set_character_scale", { scalePercent: newScale });
		}
	};

	const onContextMenu = (e: MouseEvent) => {
		e.preventDefault?.();
		const clientX = e.clientX ?? 0;
		const clientY = e.clientY ?? 0;
		openCharacterMenu(
			e.screenX ?? clientX,
			e.screenY ?? clientY,
			clientX,
			clientY,
		);
	};

	if (typeof img?.addEventListener === "function") {
		img.addEventListener("mousedown", onPointerDown);
		img.addEventListener("wheel", onWheel, { passive: false });
		img.addEventListener("contextmenu", onContextMenu);
	}
	root?.addEventListener("mousedown", onPointerDown);
	root?.addEventListener("wheel", onWheel, { passive: false });
	root?.addEventListener("contextmenu", onContextMenu);
	document.addEventListener("contextmenu", onContextMenu);
	globalThis.addEventListener("contextmenu", onContextMenu);
	globalThis.addEventListener("mousemove", onPointerMove);
	globalThis.addEventListener("mouseup", onPointerUp);

	if (typeof img?.addEventListener === "function") {
		img.addEventListener("touchstart", onPointerDown, { passive: true });
	}
	root?.addEventListener("touchstart", onPointerDown, { passive: true });
	globalThis.addEventListener("touchmove", onPointerMove, { passive: true });
	globalThis.addEventListener("touchend", onPointerUp);
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", initCharacterWindow);
} else {
	initCharacterWindow();
}
