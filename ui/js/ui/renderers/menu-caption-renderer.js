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
		id: "activaterootbutton-btn",
		resource: "activaterootbutton.caption",
		fallback: "activaterootbutton",
		shortcut: "",
	},
	{
		id: "addressbarbutton-btn",
		resource: "addressbarbutton.caption",
		fallback: "addressbarbutton",
		shortcut: "",
	},
	{
		id: "aistatebutton-btn",
		resource: "aistatebutton.caption",
		fallback: "aistatebutton",
		shortcut: "",
	},
	{
		id: "alignrootbutton-btn",
		resource: "alignrootbutton.caption",
		fallback: "alignrootbutton",
		shortcut: "",
	},
	{
		id: "alwaysstayontopbutton-btn",
		resource: "alwaysstayontopbutton.caption",
		fallback: "alwaysstayontopbutton",
		shortcut: "",
	},
	{
		id: "alwaystrayiconvisiblebutton-btn",
		resource: "alwaystrayiconvisiblebutton.caption",
		fallback: "alwaystrayiconvisiblebutton",
		shortcut: "",
	},
	{
		id: "balloonhistorybutton-btn",
		resource: "balloonhistorybutton.caption",
		fallback: "balloonhistorybutton",
		shortcut: "",
	},
	{
		id: "biffallbutton-btn",
		resource: "biffallbutton.caption",
		fallback: "biffallbutton",
		shortcut: "",
	},
	{
		id: "callghosthistorybutton-btn",
		resource: "callghosthistorybutton.caption",
		fallback: "callghosthistorybutton",
		shortcut: "",
	},
	{
		id: "callsstpsendboxbutton-btn",
		resource: "callsstpsendboxbutton.caption",
		fallback: "callsstpsendboxbutton",
		shortcut: "",
	},
	{
		id: "charsetbutton-btn",
		resource: "charsetbutton.caption",
		fallback: "charsetbutton",
		shortcut: "",
	},
	{
		id: "collisionvisiblebutton-btn",
		resource: "collisionvisiblebutton.caption",
		fallback: "collisionvisiblebutton",
		shortcut: "",
	},
	{
		id: "configurationrootbutton-btn",
		resource: "configurationrootbutton.caption",
		fallback: "configurationrootbutton",
		shortcut: "",
	},
	{
		id: "debugballoonbutton-btn",
		resource: "debugballoonbutton.caption",
		fallback: "debugballoonbutton",
		shortcut: "",
	},
	{
		id: "definedsurfaceonlybutton-btn",
		resource: "definedsurfaceonlybutton.caption",
		fallback: "definedsurfaceonlybutton",
		shortcut: "",
	},
	{
		id: "dictationbutton-btn",
		resource: "dictationbutton.caption",
		fallback: "dictationbutton",
		shortcut: "",
	},
	{
		id: "duibutton-btn",
		resource: "duibutton.caption",
		fallback: "duibutton",
		shortcut: "",
	},
	{
		id: "enableballoonmovebutton-btn",
		resource: "enableballoonmovebutton.caption",
		fallback: "enableballoonmovebutton",
		shortcut: "",
	},
	{
		id: "firststaffbutton-btn",
		resource: "firststaffbutton.caption",
		fallback: "firststaffbutton",
		shortcut: "",
	},
	{
		id: "ghostexplorerbutton-btn",
		resource: "ghostexplorerbutton.caption",
		fallback: "ghostexplorerbutton",
		shortcut: "",
	},
	{
		id: "ghosthistorybutton-btn",
		resource: "ghosthistorybutton.caption",
		fallback: "ghosthistorybutton",
		shortcut: "",
	},
	{
		id: "ghostinstallbutton-btn",
		resource: "ghostinstallbutton.caption",
		fallback: "ghostinstallbutton",
		shortcut: "",
	},
	{
		id: "headlinesensehistorybutton-btn",
		resource: "headlinesensehistorybutton.caption",
		fallback: "headlinesensehistorybutton",
		shortcut: "",
	},
	{
		id: "historyrootbutton-btn",
		resource: "historyrootbutton.caption",
		fallback: "historyrootbutton",
		shortcut: "",
	},
	{
		id: "leavepassivebutton-btn",
		resource: "leavepassivebutton.caption",
		fallback: "leavepassivebutton",
		shortcut: "",
	},
	{
		id: "messengerbutton-btn",
		resource: "messengerbutton.caption",
		fallback: "messengerbutton",
		shortcut: "",
	},
	{
		id: "pluginhistorybutton-btn",
		resource: "pluginhistorybutton.caption",
		fallback: "pluginhistorybutton",
		shortcut: "",
	},
	{
		id: "purgeghostcachebutton-btn",
		resource: "purgeghostcachebutton.caption",
		fallback: "purgeghostcachebutton",
		shortcut: "",
	},
	{
		id: "rateofuseballoonbutton-btn",
		resource: "rateofuseballoonbutton.caption",
		fallback: "rateofuseballoonbutton",
		shortcut: "",
	},
	{
		id: "rateofusebutton-btn",
		resource: "rateofusebutton.caption",
		fallback: "rateofusebutton",
		shortcut: "",
	},
	{
		id: "rateofuserootbutton-btn",
		resource: "rateofuserootbutton.caption",
		fallback: "rateofuserootbutton",
		shortcut: "",
	},
	{
		id: "rateofusetotalbutton-btn",
		resource: "rateofusetotalbutton.caption",
		fallback: "rateofusetotalbutton",
		shortcut: "",
	},
	{
		id: "regionenabledbutton-btn",
		resource: "regionenabledbutton.caption",
		fallback: "regionenabledbutton",
		shortcut: "",
	},
	{
		id: "reloadinfobutton-btn",
		resource: "reloadinfobutton.caption",
		fallback: "reloadinfobutton",
		shortcut: "",
	},
	{
		id: "scriptlogbutton-btn",
		resource: "scriptlogbutton.caption",
		fallback: "scriptlogbutton",
		shortcut: "",
	},
	{
		id: "shellscaleotherbutton-btn",
		resource: "shellscaleotherbutton.caption",
		fallback: "shellscaleotherbutton",
		shortcut: "",
	},
	{
		id: "shellscalerootbutton-btn",
		resource: "shellscalerootbutton.caption",
		fallback: "shellscalerootbutton",
		shortcut: "",
	},
	{
		id: "sntpbutton-btn",
		resource: "sntpbutton.caption",
		fallback: "sntpbutton",
		shortcut: "",
	},
	{
		id: "switchactivatewhentalkbutton-btn",
		resource: "switchactivatewhentalkbutton.caption",
		fallback: "switchactivatewhentalkbutton",
		shortcut: "",
	},
	{
		id: "switchactivatewhentalkexceptupdatebutton-btn",
		resource: "switchactivatewhentalkexceptupdatebutton.caption",
		fallback: "switchactivatewhentalkexceptupdatebutton",
		shortcut: "",
	},
	{
		id: "switchautobiffbutton-btn",
		resource: "switchautobiffbutton.caption",
		fallback: "switchautobiffbutton",
		shortcut: "",
	},
	{
		id: "switchautoheadlinesensebutton-btn",
		resource: "switchautoheadlinesensebutton.caption",
		fallback: "switchautoheadlinesensebutton",
		shortcut: "",
	},
	{
		id: "switchblacklistingbutton-btn",
		resource: "switchblacklistingbutton.caption",
		fallback: "switchblacklistingbutton",
		shortcut: "",
	},
	{
		id: "switchcompatiblemodebutton-btn",
		resource: "switchcompatiblemodebutton.caption",
		fallback: "switchcompatiblemodebutton",
		shortcut: "",
	},
	{
		id: "switchconsolealwaysvisiblebutton-btn",
		resource: "switchconsolealwaysvisiblebutton.caption",
		fallback: "switchconsolealwaysvisiblebutton",
		shortcut: "",
	},
	{
		id: "switchconsolevisiblebutton-btn",
		resource: "switchconsolevisiblebutton.caption",
		fallback: "switchconsolevisiblebutton",
		shortcut: "",
	},
	{
		id: "switchdeactivatebutton-btn",
		resource: "switchdeactivatebutton.caption",
		fallback: "switchdeactivatebutton",
		shortcut: "",
	},
	{
		id: "switchdontactivatebutton-btn",
		resource: "switchdontactivatebutton.caption",
		fallback: "switchdontactivatebutton",
		shortcut: "",
	},
	{
		id: "switchdontforcealignbutton-btn",
		resource: "switchdontforcealignbutton.caption",
		fallback: "switchdontforcealignbutton",
		shortcut: "",
	},
	{
		id: "switchduivisiblebutton-btn",
		resource: "switchduivisiblebutton.caption",
		fallback: "switchduivisiblebutton",
		shortcut: "",
	},
	{
		id: "switchforcealignfreebutton-btn",
		resource: "switchforcealignfreebutton.caption",
		fallback: "switchforcealignfreebutton",
		shortcut: "",
	},
	{
		id: "switchforcealignlimitbutton-btn",
		resource: "switchforcealignlimitbutton.caption",
		fallback: "switchforcealignlimitbutton",
		shortcut: "",
	},
	{
		id: "switchignoreserikomovebutton-btn",
		resource: "switchignoreserikomovebutton.caption",
		fallback: "switchignoreserikomovebutton",
		shortcut: "",
	},
	{
		id: "switchlocalsstpbutton-btn",
		resource: "switchlocalsstpbutton.caption",
		fallback: "switchlocalsstpbutton",
		shortcut: "",
	},
	{
		id: "switchmovetodefaultpositionbutton-btn",
		resource: "switchmovetodefaultpositionbutton.caption",
		fallback: "switchmovetodefaultpositionbutton",
		shortcut: "",
	},
	{
		id: "switchproxybutton-btn",
		resource: "switchproxybutton.caption",
		fallback: "switchproxybutton",
		shortcut: "",
	},
	{
		id: "switchquietbutton-btn",
		resource: "switchquietbutton.caption",
		fallback: "switchquietbutton",
		shortcut: "",
	},
	{
		id: "switchreloadbutton-btn",
		resource: "switchreloadbutton.caption",
		fallback: "switchreloadbutton",
		shortcut: "",
	},
	{
		id: "switchreloadtempghostbutton-btn",
		resource: "switchreloadtempghostbutton.caption",
		fallback: "switchreloadtempghostbutton",
		shortcut: "",
	},
	{
		id: "switchremotesstpbutton-btn",
		resource: "switchremotesstpbutton.caption",
		fallback: "switchremotesstpbutton",
		shortcut: "",
	},
	{
		id: "switchrootbutton-btn",
		resource: "switchrootbutton.caption",
		fallback: "switchrootbutton",
		shortcut: "",
	},
	{
		id: "switchtalkghostbutton-btn",
		resource: "switchtalkghostbutton.caption",
		fallback: "switchtalkghostbutton",
		shortcut: "",
	},
	{
		id: "systeminfobutton-btn",
		resource: "systeminfobutton.caption",
		fallback: "systeminfobutton",
		shortcut: "",
	},
	{
		id: "termsbutton-btn",
		resource: "termsbutton.caption",
		fallback: "termsbutton",
		shortcut: "",
	},
	{
		id: "texttospeechbutton-btn",
		resource: "texttospeechbutton.caption",
		fallback: "texttospeechbutton",
		shortcut: "",
	},
	{
		id: "updatefmobutton-btn",
		resource: "updatefmobutton.caption",
		fallback: "updatefmobutton",
		shortcut: "",
	},
	{
		id: "updateplatformbutton-btn",
		resource: "updateplatformbutton.caption",
		fallback: "updateplatformbutton",
		shortcut: "",
	},
	{
		id: "utilityrootbutton-btn",
		resource: "utilityrootbutton.caption",
		fallback: "utilityrootbutton",
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
