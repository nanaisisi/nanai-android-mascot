/**
 * @file dev-palette.ts
 * @brief 独立開発パレット UI モジュール (サブメニューではなく独立した開発者用デバッグツール)
 */

export interface DevPaletteOptions {
	ghostName?: string;
	app?: unknown;
}

export function showDevPalette(options: DevPaletteOptions = {}) {
	if (typeof document === "undefined") return;

	const existing = document.getElementById("nanai-dev-palette-window");
	if (existing) {
		existing.remove();
		return;
	}

	const ghostName = options.ghostName || "Emily";
	const paletteEl = document.createElement("div");
	paletteEl.id = "nanai-dev-palette-window";
	paletteEl.className = "nanai-dev-palette-window";
	paletteEl.style.cssText = `
		position: fixed;
		z-index: 99999;
		top: 60px;
		right: 20px;
		width: 260px;
		max-height: 80vh;
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
	header.style.cssText = `
		background: #0078d7;
		color: #ffffff;
		padding: 6px 10px;
		font-weight: bold;
		display: flex;
		justify-content: space-between;
		align-items: center;
	`;
	header.innerHTML = `<span>開発 - ${ghostName}</span><span id="close-dev-palette-btn" style="cursor: pointer; font-weight: normal;">✖</span>`;
	paletteEl.appendChild(header);

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
			margin-bottom: 4px;
			padding: 4px 8px;
			background: #f5f5f5;
			border: 1px solid #ccc;
			border-radius: 3px;
			text-align: left;
			font-size: 11px;
			cursor: pointer;
		`;
		btn.innerHTML = `<span>${item.label}</span>${item.shortcut ? `<span style="opacity: 0.6; float: right;">${item.shortcut}</span>` : ""}`;
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

	const closeBtn = document.getElementById("close-dev-palette-btn");
	closeBtn?.addEventListener("click", () => paletteEl.remove());
}
