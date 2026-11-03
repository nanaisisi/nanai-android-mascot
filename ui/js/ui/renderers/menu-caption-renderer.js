/**
 * @file menu-caption-renderer.js
 * @brief UKADOC ownerdraw-item-name 準拠のメニュー項目キャプション動的解決・反映モジュール
 */

/**
 * 標準メニュー項目IDと対応するSHIORIリソース名 / セレクタのマッピング定義
 */
export const MENU_CAPTION_DEFINITIONS = [
	{
		id: "biff-btn",
		resource: "biffbutton.caption",
		fallback: "📬 メールチェック (M)",
		shortcut: "M",
	},
	{
		id: "calendar-btn",
		resource: "calendarbutton.caption",
		fallback: "📅 カレンダー",
		shortcut: "",
	},
	{
		id: "update-btn",
		resource: "updatebutton.caption",
		fallback: "🔄 ネットワーク更新 (U)",
		shortcut: "U",
	},
	{
		id: "uninstall-btn",
		resource: "vanishbutton.caption",
		fallback: "🗑️ アンインストール (D)",
		shortcut: "D",
	},
	{
		id: "readme-btn",
		resource: "readmebutton.caption",
		fallback: "📄 README",
		shortcut: "",
	},
	{
		id: "settings-btn",
		resource: "configurationbutton.caption",
		fallback: "⚙️ 設定 (O)",
		shortcut: "O",
	},
	{
		id: "close-btn",
		resource: "quitbutton.caption",
		fallback: "✖ 終了 (W)",
		shortcut: "Ctrl+W",
	},
	{
		id: "close-all-btn",
		resource: "closebutton.caption",
		fallback: "❌ 全て終了 (X)",
		shortcut: "Ctrl+Q",
	},
	{
		id: "recommend-btn",
		resource: "recommendrootbutton.caption",
		fallback: "🔗 おすすめ (R)",
		shortcut: "R",
	},
	{
		id: "portal-btn",
		resource: "portalrootbutton.caption",
		fallback: "🌐 ポータルサイト (T)",
		shortcut: "T",
	},
	{
		id: "headline-btn",
		resource: "headlinesenserootbutton.caption",
		fallback: "📰 RSS/ヘッドライン (H)",
		shortcut: "H",
	},
	{
		id: "plugins-btn",
		resource: "pluginrootbutton.caption",
		fallback: "🧩 プラグイン (P)",
		shortcut: "P",
	},
	{
		id: "ghost-switch-btn",
		resource: "ghostrootbutton.caption",
		fallback: "👻 ゴースト切り替え (G)",
		shortcut: "G",
	},
	{
		id: "call-ghost-btn",
		resource: "callghostrootbutton.caption",
		fallback: "👥 他のゴーストを呼ぶ (C)",
		shortcut: "C",
	},
	{
		id: "shell-switch-btn",
		resource: "shellrootbutton.caption",
		fallback: "👗 シェル (S)",
		shortcut: "S",
	},
	{
		id: "dressup-menu-btn",
		resource: "dressuprootbutton.caption",
		fallback: "🧥 着せ替え (C)",
		shortcut: "C",
	},
	{
		id: "balloon-menu-btn",
		resource: "balloonrootbutton.caption",
		fallback: "💭 バルーン (B)",
		shortcut: "B",
	},
	{
		id: "info-menu-btn",
		resource: "inforootbutton.caption",
		fallback: "❓ 情報 (A)",
		shortcut: "A",
	},
	{
		id: "help-btn",
		resource: "helpbutton.caption",
		fallback: "ℹ️ 本体情報 (A)",
		shortcut: "A",
	},
	{
		id: "minimize-btn",
		resource: "hidebutton.caption",
		fallback: "🗕 アイコン化 (I)",
		shortcut: "Ctrl+I",
	},
	{
		id: "reset-shell-pos-btn",
		resource: "resettodefaultbutton.caption",
		fallback: "📍 シェル位置初期化 (Ctrl+Shift+F12)",
		shortcut: "Ctrl+Shift+F12",
	},
	{
		id: "reset-balloon-pos-btn",
		resource: "resetballoonpositionbutton.caption",
		fallback: "🎈 バルーン位置初期化 (Ctrl+Shift+F10)",
		shortcut: "Ctrl+Shift+F10",
	},
	{
		id: "close-balloon-btn",
		resource: "closeballoonbutton.caption",
		fallback: "❌ バルーンを消す (Ctrl+Shift+Del)",
		shortcut: "Ctrl+Shift+Del",
	},
	{
		id: "enable-balloon-move-btn",
		resource: "enableballoonmovebutton.caption",
		fallback: "✋ バルーン移動許可",
		shortcut: "",
	},
	{
		id: "balloon-history-btn",
		resource: "balloonhistorybutton.caption",
		fallback: "📜 バルーン履歴 (Ctrl+H)",
		shortcut: "Ctrl+H",
	},
	{
		id: "rate-of-use-balloon-btn",
		resource: "rateofuseballoonbutton.caption",
		fallback: "📊 バルーン使用率",
		shortcut: "",
	},
	{
		id: "debug-balloon-btn",
		resource: "debugballoonbutton.caption",
		fallback: "🐞 バルーンデバッグ",
		shortcut: "",
	},
];

export const menuCaptionRenderer = {
	/**
	 * メニュー要素へキャプション辞書を適用
	 * @param {Record<string, string>} captions - リソース名またはIDをキーとするキャプションマップ
	 * @param {HTMLElement|Document} [rootEl=document]
	 */
	applyCaptions(captions = {}, rootEl = document) {
		if (!captions || typeof captions !== "object") return;

		for (const def of MENU_CAPTION_DEFINITIONS) {
			const customVal = captions[def.resource] || captions[def.id];
			const el =
				rootEl.getElementById?.(def.id) || rootEl.querySelector?.(`#${def.id}`);
			if (!el) continue;

			if (customVal && typeof customVal === "string" && customVal.trim()) {
				const textSpan = el.querySelector?.("span:not(.shortcut-key)") || el;
				if (textSpan) {
					textSpan.textContent = customVal.trim();
				}
			}
		}
	},

	/**
	 * SHIORIへ各キャプションリソースをリクエストしてマップを生成
	 * @param {object} ghostController
	 * @returns {Promise<Record<string, string>>}
	 */
	async fetchShioriCaptions(ghostController) {
		if (!ghostController?.requestShioriResource) return {};
		const captions = {};
		for (const def of MENU_CAPTION_DEFINITIONS) {
			try {
				const res = await ghostController.requestShioriResource(
					def.resource,
					"",
				);
				if (res && res !== "1" && res !== "0") {
					captions[def.resource] = res;
				}
			} catch (_err) {
				// フォールバック継続
			}
		}
		return captions;
	},
};
