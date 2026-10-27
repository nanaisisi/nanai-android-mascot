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

	root?.addEventListener("mousedown", (e) => {
		if (e.button !== 0) return;
		if (img && isTransparentPixel(img, e.clientX, e.clientY)) return;
		const startX = e.clientX;
		const startY = e.clientY;
		let origin = null;
		const move = (event) => {
			if (!origin) return;
			void moveCurrentWindowBy(
				event.clientX - startX,
				event.clientY - startY,
				origin,
			);
			void invoke("sync_character_balloon", { scopeId });
		};
		const stop = () => {
			globalThis.removeEventListener("mousemove", move);
		};
		globalThis.addEventListener("mousemove", move);
		globalThis.addEventListener("mouseup", stop, { once: true });
		void getCurrentWindowPosition().then((position) => {
			origin = position;
		});
	});

	root?.addEventListener("click", () => {
		void emit("menu-action", { action: "talk", payload: { scope: scopeId } });
	});

	root?.addEventListener("contextmenu", (e) => {
		e.preventDefault();
		void invoke("show_menu_window", {
			x: e.screenX,
			y: e.screenY,
			scope: scopeId,
		}).catch((err) => {
			console.warn("Failed to open character menu:", err);
		});
	});
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", initCharacterWindow);
} else {
	initCharacterWindow();
}
