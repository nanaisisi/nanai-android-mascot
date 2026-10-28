/**
 * Nanai Android Mascot - キャラクターウィンドウ制御スクリプト
 */
import {
	emit,
	invoke,
	isTauriAvailable,
	listen,
	getCurrentWindowPosition,
	moveCurrentWindowBy,
} from "../core/tauri-helper.js";

const urlParams = new URLSearchParams(globalThis.location.search);
const scopeId = parseInt(urlParams.get("scope") || "0", 10);

function isTransparentPixel(img, clientX, clientY) {
	const rect = img.getBoundingClientRect();
	if (!rect.width || !rect.height || !img.naturalWidth || !img.naturalHeight) {
		return false;
	}

	const x = Math.floor(
		(clientX - rect.left) * (img.naturalWidth / rect.width),
	);
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

function openCharacterMenu(screenX, screenY) {
	const sX = globalThis.screenX ?? 0;
	const sY = globalThis.screenY ?? 0;
	const posX = screenX !== null && screenX !== undefined ? screenX : sX + 100;
	const posY = screenY !== null && screenY !== undefined ? screenY : sY + 100;

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

	if (!isTauriAvailable()) return;

	// Tauri 2 は __TAURI__ ではなく __TAURI_INTERNALS__ のみ提供する場合がある。
	void listen(
		`update-subchar-image-${scopeId}`,
		(/** @type {{ payload?: { src?: string } }} */ event) => {
			const src = event.payload?.src;
			if (src && img) {
				img.src = src;
				img.style.display = "block";
			} else if (img) {
				img.style.display = "none";
			}
		},
	);
	void emit("request-subchar-image", { scopeId });

	let isInteracting = false;
	let hasMoved = false;
	let startX = 0;
	let startY = 0;
	let origin = null;
	let longPressTimer = null;
	let longPressTriggered = false;
	const LONG_PRESS_DELAY = 600;

	const onPointerDown = (e) => {
		if (e.button !== undefined && e.button !== 0) return;

		const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
		const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
		const screenX = e.screenX ?? clientX;
		const screenY = e.screenY ?? clientY;

		if (img && isTransparentPixel(img, clientX, clientY)) {
			return;
		}

		isInteracting = true;
		hasMoved = false;
		longPressTriggered = false;
		startX = clientX;
		startY = clientY;

		void getCurrentWindowPosition().then((position) => {
			if (isInteracting) origin = position;
		});

		if (longPressTimer) clearTimeout(longPressTimer);
		longPressTimer = setTimeout(() => {
			if (isInteracting && !hasMoved) {
				longPressTriggered = true;
				openCharacterMenu(screenX, screenY);
			}
		}, LONG_PRESS_DELAY);
	};

	const onPointerMove = (e) => {
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

		if (hasMoved && origin) {
			void moveCurrentWindowBy(deltaX, deltaY, origin);
			void invoke("sync_character_balloon", { scopeId });
		}
	};

	const onPointerUp = () => {
		if (!isInteracting) return;
		isInteracting = false;

		if (longPressTimer) {
			clearTimeout(longPressTimer);
			longPressTimer = null;
		}

		if (longPressTriggered) return;

		if (!hasMoved) {
			void emit("menu-action", { action: "talk", payload: { scope: scopeId } });
		}
	};

	root?.addEventListener("mousedown", onPointerDown);
	globalThis.addEventListener("mousemove", onPointerMove);
	globalThis.addEventListener("mouseup", onPointerUp);

	root?.addEventListener("touchstart", onPointerDown, { passive: true });
	globalThis.addEventListener("touchmove", onPointerMove, { passive: true });
	globalThis.addEventListener("touchend", onPointerUp);

	root?.addEventListener("contextmenu", (e) => {
		e.preventDefault();
		openCharacterMenu(e.screenX, e.screenY);
	});
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", initCharacterWindow);
} else {
	initCharacterWindow();
}
