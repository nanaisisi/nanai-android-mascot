/**
 * @file balloon-context-menu.ts
 * @brief バルーン専用コンテキストメニュー（ポップアップ UI）表示・制御モジュール
 */

import { invoke, isTauriAvailable } from "../core/tauri-helper.js";

export interface BalloonContextMenuOptions {
	x: number;
	y: number;
	screenX?: number;
	screenY?: number;
	scopeId: number;
	app?: unknown;
}

export async function showBalloonContextMenu({
	x,
	y,
	screenX,
	screenY,
	scopeId,
	app,
}: BalloonContextMenuOptions) {
	console.log(
		`👉 show_balloon_context_menu called: x=${x}, y=${y}, screenX=${screenX}, screenY=${screenY}, scope=Some(${scopeId})`,
	);
	let nativeMenuSuccess = false;

	if (isTauriAvailable()) {
		try {
			const tauriMenu = await import("@tauri-apps/api/menu");
			if (tauriMenu?.Menu?.new) {
				const menu = await tauriMenu.Menu.new({
					items: [
						await tauriMenu.MenuItem.new({
							id: "balloon-none",
							text: "何もしない",
						}),
						await tauriMenu.PredefinedMenuItem.new({ item: "Separator" }),
						await tauriMenu.MenuItem.new({
							id: "balloon-leftclick",
							text: "左クリックと同じ",
						}),
						await tauriMenu.MenuItem.new({
							id: "balloon-break",
							text: "スクリプトブレーク",
						}),
						await tauriMenu.PredefinedMenuItem.new({ item: "Separator" }),
						await tauriMenu.MenuItem.new({
							id: "balloon-flip",
							text: "バルーン左右切替",
						}),
						await tauriMenu.MenuItem.new({
							id: "balloon-reset-pos",
							text: "バルーン位置調整",
						}),
						await tauriMenu.MenuItem.new({
							id: "balloon-move-ghost",
							text: "ゴースト本体移動",
						}),
					],
				});
				await menu.popup();
				nativeMenuSuccess = true;
			}
		} catch (_) {
			// Fallback to Rust invoke
		}

		if (!nativeMenuSuccess) {
			try {
				await invoke("show_balloon_context_menu", {
					scope_id: scopeId,
					x: screenX ?? x,
					y: screenY ?? y,
				});
				nativeMenuSuccess = true;
			} catch (_) {}
		}
	}

	if (nativeMenuSuccess || typeof document === "undefined") return;

	const existing = document.getElementById("balloon-context-menu-popup");
	if (existing) {
		existing.remove();
	}

	const winW =
		typeof window !== "undefined" && window.innerWidth > 200
			? window.innerWidth
			: 600;
	const winH =
		typeof window !== "undefined" && window.innerHeight > 200
			? window.innerHeight
			: 600;

	const targetX = Math.max(5, Math.min(x, winW - 170));
	const targetY = Math.max(5, Math.min(y, winH - 220));

	const menuEl = document.createElement("div");
	menuEl.id = "balloon-context-menu-popup";
	menuEl.className = "balloon-context-menu-popup";
	menuEl.style.cssText = `
		position: fixed;
		z-index: 2147483647;
		left: ${targetX}px;
		top: ${targetY}px;
		min-width: 160px;
		background: #ffffff;
		border: 1px solid rgba(0, 0, 0, 0.2);
		border-radius: 6px;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
		padding: 4px 0;
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Meiryo", sans-serif;
		font-size: 13px;
		color: #222222;
		user-select: none;
		-webkit-user-select: none;
	`;

	const items = [
		{ action: "balloon-none", label: "何もしない" },
		{ type: "separator" },
		{ action: "balloon-leftclick", label: "左クリックと同じ" },
		{ action: "balloon-break", label: "スクリプトブレーク" },
		{ type: "separator" },
		{ action: "balloon-flip", label: "バルーン左右切替" },
		{ action: "balloon-reset-pos", label: "バルーン位置調整" },
		{ action: "balloon-move-ghost", label: "ゴースト本体移動" },
	];

	items.forEach((item) => {
		if (item.type === "separator") {
			const sep = document.createElement("div");
			sep.style.cssText = "height: 1px; background: #e0e0e0; margin: 4px 0;";
			menuEl.appendChild(sep);
			return;
		}

		const btn = document.createElement("button");
		btn.type = "button";
		btn.style.cssText = `
			display: block;
			width: 100%;
			padding: 6px 12px;
			background: transparent;
			border: none;
			text-align: left;
			font-size: 13px;
			color: #222222;
			cursor: pointer;
			transition: background-color 0.1s ease;
		`;
		btn.textContent = item.label || "";
		btn.addEventListener("mouseover", () => {
			btn.style.background = "#0078d7";
			btn.style.color = "#ffffff";
		});
		btn.addEventListener("mouseout", () => {
			btn.style.background = "transparent";
			btn.style.color = "#222222";
		});

		btn.addEventListener("click", (e) => {
			e.stopPropagation();
			menuEl.remove();

			const mascotApp = (app as { handleMenuAction?: unknown })
				?.handleMenuAction
				? app
				: (app as { app?: unknown })?.app ||
					(globalThis as unknown as { mascotApp?: unknown }).mascotApp ||
					(typeof window !== "undefined"
						? (window as unknown as { app?: unknown }).app
						: null);
			if (
				mascotApp &&
				typeof (mascotApp as { handleMenuAction?: unknown })
					.handleMenuAction === "function"
			) {
				(
					mascotApp as {
						handleMenuAction: (act: string, payload?: unknown) => void;
					}
				).handleMenuAction(item.action, { scope: scopeId });
			}
		});

		menuEl.appendChild(btn);
	});

	document.body.appendChild(menuEl);

	const closeHandler = (e: Event) => {
		if (!menuEl.contains(e.target as Node)) {
			menuEl.remove();
			document.removeEventListener("click", closeHandler);
			document.removeEventListener("contextmenu", closeHandler);
		}
	};
	setTimeout(() => {
		document.addEventListener("click", closeHandler);
		document.addEventListener("contextmenu", closeHandler);
	}, 10);
}
