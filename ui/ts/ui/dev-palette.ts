/**
 * @file dev-palette.ts
 * @brief 独立開発パレット UI モジュール (サブメニューではなく独立した開発者用デバッグツール)
 */

import { invoke, isTauriAvailable } from "../core/tauri-helper.js";

export interface DevPaletteOptions {
	ghostName?: string;
	app?: unknown;
}

function closeDevPalette(el: HTMLElement) {
	el.remove();
	const modalOverlay = document.getElementById("modal-overlay");
	if (isTauriAvailable() && modalOverlay?.style.display !== "flex") {
		void invoke("hide_modal_window").catch(() => {});
	}
}

export function showDevPalette(options: DevPaletteOptions = {}) {
	if (typeof document === "undefined") return;

	const existing = document.getElementById("nanai-dev-palette-window");
	if (existing) {
		closeDevPalette(existing);
		return;
	}

	const ghostName = options.ghostName || "Emily";
	const paletteEl = document.createElement("div");
	paletteEl.id = "nanai-dev-palette-window";
	paletteEl.className = "nanai-dev-palette-window";
	paletteEl.style.cssText = `
		position: fixed;
		z-index: 99999;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 280px;
		max-height: 88vh;
		background: #ffffff;
		border: 1px solid #0078d7;
		border-radius: 6px;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Meiryo", sans-serif;
		font-size: 11px;
		color: #222222;
		overflow-y: auto;
		user-select: none;
		-webkit-user-select: none;
	`;

	const header = document.createElement("div");
	header.className = "dev-palette-header";
	header.style.cssText = `
		background: #0078d7;
		color: #ffffff;
		padding: 6px 10px;
		font-weight: bold;
		display: flex;
		justify-content: space-between;
		align-items: center;
		cursor: move;
		user-select: none;
		-webkit-user-select: none;
		touch-action: none;
	`;
	header.innerHTML = `<span>開発 - ${ghostName}</span><span id="close-dev-palette-btn" style="cursor: pointer; font-weight: normal; padding: 2px 6px;">✖</span>`;
	paletteEl.appendChild(header);

	let isDragging = false;
	let startX = 0;
	let startY = 0;
	let initialLeft = 0;
	let initialTop = 0;

	const onPointerDown = (e: MouseEvent | TouchEvent) => {
		const target = e.target as HTMLElement;
		if (target?.id === "close-dev-palette-btn") return;

		isDragging = true;
		const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
		const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
		startX = clientX;
		startY = clientY;

		const rect = paletteEl.getBoundingClientRect();
		initialLeft = rect.left;
		initialTop = rect.top;

		paletteEl.style.transform = "none";
		paletteEl.style.left = `${initialLeft}px`;
		paletteEl.style.top = `${initialTop}px`;

		const onPointerMove = (moveEv: MouseEvent | TouchEvent) => {
			if (!isDragging) return;
			const curX =
				"touches" in moveEv ? moveEv.touches[0].clientX : moveEv.clientX;
			const curY =
				"touches" in moveEv ? moveEv.touches[0].clientY : moveEv.clientY;
			const deltaX = curX - startX;
			const deltaY = curY - startY;

			const newLeft = Math.max(
				0,
				Math.min(window.innerWidth - rect.width, initialLeft + deltaX),
			);
			const newTop = Math.max(
				0,
				Math.min(window.innerHeight - rect.height, initialTop + deltaY),
			);

			paletteEl.style.left = `${newLeft}px`;
			paletteEl.style.top = `${newTop}px`;
		};

		const onPointerUp = () => {
			isDragging = false;
			window.removeEventListener("mousemove", onPointerMove);
			window.removeEventListener("mouseup", onPointerUp);
			window.removeEventListener("touchmove", onPointerMove);
			window.removeEventListener("touchend", onPointerUp);
		};

		window.addEventListener("mousemove", onPointerMove);
		window.addEventListener("mouseup", onPointerUp);
		window.addEventListener("touchmove", onPointerMove, { passive: false });
		window.addEventListener("touchend", onPointerUp);
	};

	header.addEventListener("mousedown", onPointerDown);
	header.addEventListener("touchstart", onPointerDown, { passive: false });

	const body = document.createElement("div");
	body.style.cssText = "padding: 8px;";

	const checkItems = [
		{
			id: "dev-check-collision",
			label: "当たり判定を表示",
			defaultChecked: true,
		},
		{
			id: "dev-check-balloon-test",
			label: "バルーンテストモード",
			defaultChecked: false,
		},
		{
			id: "dev-check-seriko-wait",
			label: "SERIKOウェイト調整",
			defaultChecked: false,
		},
		{
			id: "dev-check-update-only",
			label: "更新チェックのみ",
			defaultChecked: false,
		},
		{
			id: "dev-check-shiori-sender",
			label: "SHIORIのSenderを変更",
			defaultChecked: false,
		},
		{
			id: "dev-check-shiori-call-log",
			label: "SHIORI呼出ログ有効",
			defaultChecked: true,
		},
		{
			id: "dev-check-shiori-internal-log",
			label: "SHIORI内部ログ機能有効",
			defaultChecked: true,
		},
		{
			id: "dev-check-shiori-debug",
			label: "SHIORIデバッグ機能有効",
			defaultChecked: true,
		},
		{
			id: "dev-check-disable-auto-ghost",
			label: "自動切替無効",
			defaultChecked: false,
		},
		{
			id: "dev-check-disable-auto-check",
			label: "自動チェック無効",
			defaultChecked: false,
		},
		{
			id: "dev-check-disable-auto-update",
			label: "自動更新無効",
			defaultChecked: false,
		},
		{
			id: "dev-check-do-not-end-slash-minus",
			label: "\\ -タグで終了しない",
			defaultChecked: false,
		},
	];

	checkItems.forEach((item) => {
		const row = document.createElement("label");
		row.style.cssText = "display: block; margin-bottom: 4px; cursor: pointer;";
		row.innerHTML = `<input type="checkbox" id="${item.id}" ${item.defaultChecked ? "checked" : ""} style="margin-right: 4px;" /> ${item.label}`;
		body.appendChild(row);
	});

	const sep = document.createElement("hr");
	sep.style.cssText =
		"border: none; border-top: 1px solid #e0e0e0; margin: 8px 0;";
	body.appendChild(sep);

	const buttons = [
		{
			action: "open-script-input",
			label: "スクリプト入力",
			shortcut: "Ctrl+S",
		},
		{
			action: "open-surface-test",
			label: "サーフィステスト",
			shortcut: "Ctrl+T",
		},
		{ action: "show-error-log", label: "エラーログを表示", shortcut: "" },
		{
			action: "virtual-time-change",
			label: "現在時刻の仮想的変更",
			shortcut: "",
		},
		{ action: "seriko-inspector", label: "SERIKO Inspector", shortcut: "" },
		{ action: "reload-ghost", label: "リロード", shortcut: "" },
		{ action: "open-exec", label: "開く/実行", shortcut: "" },
	];

	buttons.forEach((item) => {
		const btn = document.createElement("button");
		btn.type = "button";
		btn.style.cssText = `
			display: block;
			width: 100%;
			margin-bottom: 5px;
			padding: 6px 10px;
			background-color: #f2f4f7 !important;
			color: #111111 !important;
			border: 1px solid #b0bec5 !important;
			border-radius: 4px;
			text-align: left;
			font-size: 12px !important;
			font-weight: 500 !important;
			line-height: 1.4 !important;
			cursor: pointer;
			box-sizing: border-box;
			transition: background-color 0.15s ease, color 0.15s ease;
		`;
		btn.innerHTML = `<span>${item.label}</span>${item.shortcut ? `<span style="opacity: 0.7; float: right; font-size: 11px;">${item.shortcut}</span>` : ""}`;
		btn.addEventListener("mouseenter", () => {
			btn.style.setProperty("background-color", "#0078d7", "important");
			btn.style.setProperty("color", "#ffffff", "important");
		});
		btn.addEventListener("mouseleave", () => {
			btn.style.setProperty("background-color", "#f2f4f7", "important");
			btn.style.setProperty("color", "#111111", "important");
		});
		btn.addEventListener("click", () => {
			const mascotApp =
				options.app ||
				(globalThis as unknown as { mascotApp?: unknown }).mascotApp;
			if (
				mascotApp &&
				typeof (mascotApp as { handleMenuAction?: unknown })
					.handleMenuAction === "function"
			) {
				(
					mascotApp as {
						handleMenuAction: (act: string, payload?: unknown) => void;
					}
				).handleMenuAction(item.action);
			}
		});
		body.appendChild(btn);
	});

	paletteEl.appendChild(body);
	document.body.appendChild(paletteEl);

	if (isTauriAvailable()) {
		void invoke("show_modal_window").catch(() => {});
	}

	const closeBtn =
		document.getElementById("close-dev-palette-btn") ||
		paletteEl.querySelector?.("#close-dev-palette-btn");
	closeBtn?.addEventListener("click", () => closeDevPalette(paletteEl));
}
