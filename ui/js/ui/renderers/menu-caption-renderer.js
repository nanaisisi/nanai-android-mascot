/**
 * @file menu-caption-renderer.js
 * @brief UKADOC ownerdraw-item-name 準拠のメニュー項目キャプション動的解決・反映モジュール
 */

/**
 * 標準メニュー項目IDと対応するSHIORIリソース名 / セレクタのマッピング定義
 * 全92件のUKADOC ownerdraw-item-name 標準ボタンキャプションを網羅
 */
export const MENU_CAPTION_DEFINITIONS = [
	{
		id: "activate-root-btn",
		resource: "activaterootbutton.caption",
		fallback: "⚡ 動作設定",
		shortcut: "",
	},
	{
		id: "addressbar-btn",
		resource: "addressbarbutton.caption",
		fallback: "🌐 アドレスバー",
		shortcut: "",
	},
	{
		id: "aistate-btn",
		resource: "aistatebutton.caption",
		fallback: "🧠 AIステータス",
		shortcut: "",
	},
	{
		id: "align-root-btn",
		resource: "alignrootbutton.caption",
		fallback: "📐 位置合わせ",
		shortcut: "",
	},
	{
		id: "always-stay-on-top-btn",
		resource: "alwaysstayontopbutton.caption",
		fallback: "📌 常に最前面表示",
		shortcut: "",
	},
	{
		id: "always-tray-icon-visible-btn",
		resource: "alwaystrayiconvisiblebutton.caption",
		fallback: "👁 タスクトレイアイコン常時表示",
		shortcut: "",
	},
	{
		id: "balloon-history-btn",
		resource: "balloonhistorybutton.caption",
		fallback: "📜 バルーン履歴",
		shortcut: "",
	},
	{
		id: "balloon-menu-btn",
		resource: "balloonrootbutton.caption",
		fallback: "💭 バルーン (B)",
		shortcut: "B",
	},
	{
		id: "biff-all-btn",
		resource: "biffallbutton.caption",
		fallback: "📬 全ゴーストメールチェック",
		shortcut: "",
	},
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
		id: "call-ghost-history-btn",
		resource: "callghosthistorybutton.caption",
		fallback: "🕒 呼び出し履歴",
		shortcut: "",
	},
	{
		id: "call-ghost-btn",
		resource: "callghostrootbutton.caption",
		fallback: "👥 他のゴーストを呼ぶ (C)",
		shortcut: "C",
	},
	{
		id: "call-sstp-sendbox-btn",
		resource: "callsstpsendboxbutton.caption",
		fallback: "✉️ SSTP送信ボックス",
		shortcut: "",
	},
	{
		id: "char-recommendsites-btn",
		resource: "char-star-.recommendsites.caption",
		fallback: "🔗 おすすめサイト",
		shortcut: "",
	},
	{
		id: "charset-btn",
		resource: "charsetbutton.caption",
		fallback: "🔤 文字コード設定",
		shortcut: "",
	},
	{
		id: "close-balloon-btn",
		resource: "closeballoonbutton.caption",
		fallback: "❌ バルーンを消す (Ctrl+Shift+Del)",
		shortcut: "Ctrl+Shift+Del",
	},
	{
		id: "close-all-btn",
		resource: "closebutton.caption",
		fallback: "❌ 全て終了 (X)",
		shortcut: "Ctrl+Q",
	},
	{
		id: "collision-visible-btn",
		resource: "collisionvisiblebutton.caption",
		fallback: "🎯 当たり判定表示",
		shortcut: "",
	},
	{
		id: "settings-btn",
		resource: "configurationbutton.caption",
		fallback: "⚙️ 設定 (O)",
		shortcut: "O",
	},
	{
		id: "configuration-root-btn",
		resource: "configurationrootbutton.caption",
		fallback: "⚙️ 設定メニュー",
		shortcut: "",
	},
	{
		id: "debug-balloon-btn",
		resource: "debugballoonbutton.caption",
		fallback: "🐛 デバッグバルーン",
		shortcut: "",
	},
	{
		id: "defined-surface-only-btn",
		resource: "definedsurfaceonlybutton.caption",
		fallback: "🖼 定義済サーフィスのみ表示",
		shortcut: "",
	},
	{
		id: "dictation-btn",
		resource: "dictationbutton.caption",
		fallback: "🎙 音声認識",
		shortcut: "",
	},
	{
		id: "dressup-menu-btn",
		resource: "dressuprootbutton.caption",
		fallback: "🧥 着せ替え (C)",
		shortcut: "C",
	},
	{
		id: "dui-btn",
		resource: "duibutton.caption",
		fallback: "📊 Direct User Interface",
		shortcut: "",
	},
	{
		id: "enable-balloon-move-btn",
		resource: "enableballoonmovebutton.caption",
		fallback: "🎈 バルーン移動を許可",
		shortcut: "",
	},
	{
		id: "first-staff-btn",
		resource: "firststaffbutton.caption",
		fallback: "👤 開発スタッフ情報",
		shortcut: "",
	},
	{
		id: "ghost-explorer-btn",
		resource: "ghostexplorerbutton.caption",
		fallback: "🗂 ゴーストエクスプローラ",
		shortcut: "",
	},
	{
		id: "ghost-history-btn",
		resource: "ghosthistorybutton.caption",
		fallback: "🕒 ゴースト切り替え履歴",
		shortcut: "",
	},
	{
		id: "ghost-install-btn",
		resource: "ghostinstallbutton.caption",
		fallback: "📦 ゴーストインストール",
		shortcut: "",
	},
	{
		id: "ghost-switch-btn",
		resource: "ghostrootbutton.caption",
		fallback: "👻 ゴースト切り替え (G)",
		shortcut: "G",
	},
	{
		id: "headlinesense-history-btn",
		resource: "headlinesensehistorybutton.caption",
		fallback: "📰 ヘッドライン履歴",
		shortcut: "",
	},
	{
		id: "headline-btn",
		resource: "headlinesenserootbutton.caption",
		fallback: "📰 RSS/ヘッドライン (H)",
		shortcut: "H",
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
		id: "history-root-btn",
		resource: "historyrootbutton.caption",
		fallback: "🕘 履歴",
		shortcut: "",
	},
	{
		id: "info-menu-btn",
		resource: "inforootbutton.caption",
		fallback: "❓ 情報 (A)",
		shortcut: "A",
	},
	{
		id: "leave-passive-btn",
		resource: "leavepassivebutton.caption",
		fallback: "🕊 パッシブモード解除",
		shortcut: "",
	},
	{
		id: "messenger-btn",
		resource: "messengerbutton.caption",
		fallback: "💬 メッセンジャー",
		shortcut: "",
	},
	{
		id: "plugin-history-btn",
		resource: "pluginhistorybutton.caption",
		fallback: "🕒 プラグイン履歴",
		shortcut: "",
	},
	{
		id: "plugin-btn",
		resource: "pluginrootbutton.caption",
		fallback: "🧩 プラグイン (P)",
		shortcut: "P",
	},
	{
		id: "portal-btn",
		resource: "portalrootbutton.caption",
		fallback: "🌐 ポータルサイト (T)",
		shortcut: "T",
	},
	{
		id: "purge-ghost-cache-btn",
		resource: "purgeghostcachebutton.caption",
		fallback: "🧹 ゴーストキャッシュ削除",
		shortcut: "",
	},
	{
		id: "close-btn",
		resource: "quitbutton.caption",
		fallback: "✖ 終了 (W)",
		shortcut: "Ctrl+W",
	},
	{
		id: "rate-of-use-balloon-btn",
		resource: "rateofuseballoonbutton.caption",
		fallback: "📊 バルーン使用率",
		shortcut: "",
	},
	{
		id: "rate-of-use-btn",
		resource: "rateofusebutton.caption",
		fallback: "📊 ゴースト使用率",
		shortcut: "",
	},
	{
		id: "rate-of-useroot-btn",
		resource: "rateofuserootbutton.caption",
		fallback: "📊 使用率メニュー",
		shortcut: "",
	},
	{
		id: "rate-of-use-total-btn",
		resource: "rateofusetotalbutton.caption",
		fallback: "📊 全体使用率",
		shortcut: "",
	},
	{
		id: "readme-btn",
		resource: "readmebutton.caption",
		fallback: "📄 README",
		shortcut: "",
	},
	{
		id: "recommend-btn",
		resource: "recommendrootbutton.caption",
		fallback: "🔗 おすすめ (R)",
		shortcut: "R",
	},
	{
		id: "region-enabled-btn",
		resource: "regionenabledbutton.caption",
		fallback: "🔲 リージョン有効化",
		shortcut: "",
	},
	{
		id: "reload-info-btn",
		resource: "reloadinfobutton.caption",
		fallback: "🔄 動作情報再読み込み",
		shortcut: "",
	},
	{
		id: "reset-balloon-pos-btn",
		resource: "resetballoonpositionbutton.caption",
		fallback: "🎈 バルーン位置初期化 (Ctrl+Shift+F10)",
		shortcut: "Ctrl+Shift+F10",
	},
	{
		id: "reset-shell-pos-btn",
		resource: "resettodefaultbutton.caption",
		fallback: "📍 シェル位置初期化 (Ctrl+Shift+F12)",
		shortcut: "Ctrl+Shift+F12",
	},
	{
		id: "script-log-btn",
		resource: "scriptlogbutton.caption",
		fallback: "📜 さくらスクリプトログ",
		shortcut: "",
	},
	{
		id: "shell-switch-btn",
		resource: "shellrootbutton.caption",
		fallback: "👗 シェル (S)",
		shortcut: "S",
	},
	{
		id: "shell-scale-other-btn",
		resource: "shellscaleotherbutton.caption",
		fallback: "🔍 シェル倍率カスタム",
		shortcut: "",
	},
	{
		id: "shell-scale-root-btn",
		resource: "shellscalerootbutton.caption",
		fallback: "🔍 シェル倍率",
		shortcut: "",
	},
	{
		id: "sntp-btn",
		resource: "sntpbutton.caption",
		fallback: "⏱ SNTP時刻同期",
		shortcut: "",
	},
	{
		id: "switch-activate-when-talk-btn",
		resource: "switchactivatewhentalkbutton.caption",
		fallback: "🗣 発話時にアクティブ化",
		shortcut: "",
	},
	{
		id: "switch-activate-when-talk-except-update-btn",
		resource: "switchactivatewhentalkexceptupdatebutton.caption",
		fallback: "🗣 発話時にアクティブ化 (更新時除く)",
		shortcut: "",
	},
	{
		id: "switch-auto-biff-btn",
		resource: "switchautobiffbutton.caption",
		fallback: "⏱ 自動メールチェック",
		shortcut: "",
	},
	{
		id: "switch-auto-headlinesense-btn",
		resource: "switchautoheadlinesensebutton.caption",
		fallback: "⏱ 自動ヘッドラインセンス",
		shortcut: "",
	},
	{
		id: "switch-blacklisting-btn",
		resource: "switchblacklistingbutton.caption",
		fallback: "🚫 ブラックリスト機能",
		shortcut: "",
	},
	{
		id: "switch-compatible-mode-btn",
		resource: "switchcompatiblemodebutton.caption",
		fallback: "⚙️ 互換モード切替",
		shortcut: "",
	},
	{
		id: "switch-console-always-visible-btn",
		resource: "switchconsolealwaysvisiblebutton.caption",
		fallback: "📟 コンソール常時表示",
		shortcut: "",
	},
	{
		id: "switch-console-visible-btn",
		resource: "switchconsolevisiblebutton.caption",
		fallback: "📟 コンソール表示",
		shortcut: "",
	},
	{
		id: "switch-deactivate-btn",
		resource: "switchdeactivatebutton.caption",
		fallback: "💤 非アクティブ化",
		shortcut: "",
	},
	{
		id: "switch-dont-activate-btn",
		resource: "switchdontactivatebutton.caption",
		fallback: "🚫 アクティブ化しない",
		shortcut: "",
	},
	{
		id: "switch-dont-force-align-btn",
		resource: "switchdontforcealignbutton.caption",
		fallback: "🔓 強制配置を行わない",
		shortcut: "",
	},
	{
		id: "switch-dui-visible-btn",
		resource: "switchduivisiblebutton.caption",
		fallback: "📊 DUI表示切替",
		shortcut: "",
	},
	{
		id: "switch-force-align-free-btn",
		resource: "switchforcealignfreebutton.caption",
		fallback: "↔ 自由整列モード",
		shortcut: "",
	},
	{
		id: "switch-force-align-limit-btn",
		resource: "switchforcealignlimitbutton.caption",
		fallback: "🔒 画面内制限整列モード",
		shortcut: "",
	},
	{
		id: "switch-ignore-seriko-move-btn",
		resource: "switchignoreserikomovebutton.caption",
		fallback: "🛑 SERIKO座標移動を無視",
		shortcut: "",
	},
	{
		id: "switch-local-sstp-btn",
		resource: "switchlocalsstpbutton.caption",
		fallback: "🔒 ローカルSSTP切替",
		shortcut: "",
	},
	{
		id: "switch-move-to-default-position-btn",
		resource: "switchmovetodefaultpositionbutton.caption",
		fallback: "📍 デフォルト位置へ戻す",
		shortcut: "",
	},
	{
		id: "switch-proxy-btn",
		resource: "switchproxybutton.caption",
		fallback: "🛡 プロキシ利用切替",
		shortcut: "",
	},
	{
		id: "switch-quiet-btn",
		resource: "switchquietbutton.caption",
		fallback: "🤫 静粛モード切替",
		shortcut: "",
	},
	{
		id: "switch-reload-btn",
		resource: "switchreloadbutton.caption",
		fallback: "🔄 再読み込み切替",
		shortcut: "",
	},
	{
		id: "switch-reload-temp-ghost-btn",
		resource: "switchreloadtempghostbutton.caption",
		fallback: "🔄 一時ゴースト再読み込み",
		shortcut: "",
	},
	{
		id: "switch-remote-sstp-btn",
		resource: "switchremotesstpbutton.caption",
		fallback: "🌐 リモートSSTP切替",
		shortcut: "",
	},
	{
		id: "switch-root-btn",
		resource: "switchrootbutton.caption",
		fallback: "🔀 切替メニュー",
		shortcut: "",
	},
	{
		id: "switch-talk-ghost-btn",
		resource: "switchtalkghostbutton.caption",
		fallback: "💬 発話ゴースト切り替え",
		shortcut: "",
	},
	{
		id: "system-info-btn",
		resource: "systeminfobutton.caption",
		fallback: "💻 システム情報",
		shortcut: "",
	},
	{
		id: "terms-btn",
		resource: "termsbutton.caption",
		fallback: "📜 利用規約",
		shortcut: "",
	},
	{
		id: "text-to-speech-btn",
		resource: "texttospeechbutton.caption",
		fallback: "🗣 音声読み上げ",
		shortcut: "",
	},
	{
		id: "update-btn",
		resource: "updatebutton.caption",
		fallback: "🔄 ネットワーク更新 (U)",
		shortcut: "U",
	},
	{
		id: "update-fmo-btn",
		resource: "updatefmobutton.caption",
		fallback: "🔄 FMO更新",
		shortcut: "",
	},
	{
		id: "update-platform-btn",
		resource: "updateplatformbutton.caption",
		fallback: "🔄 プラットフォーム更新",
		shortcut: "",
	},
	{
		id: "utility-root-btn",
		resource: "utilityrootbutton.caption",
		fallback: "🛠 ユーティリティ",
		shortcut: "",
	},
	{
		id: "uninstall-btn",
		resource: "vanishbutton.caption",
		fallback: "🗑️ アンインストール (D)",
		shortcut: "D",
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
