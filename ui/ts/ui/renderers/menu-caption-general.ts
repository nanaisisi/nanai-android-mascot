/**
 * @file menu-caption-general.ts
 * @brief UKADOC ownerdraw-item-name 準拠の一般メニュー項目キャプション定義一覧 (絵文字完全排除・SSP仕様完全一致)
 */

import { GENERAL_CAPTION_DEFINITIONS_PART2 } from "./menu-caption-general-part2.js";

export { GENERAL_CAPTION_DEFINITIONS_PART2 } from "./menu-caption-general-part2.js";

export const GENERAL_CAPTION_DEFINITIONS = [
	{
		id: "activate-root-btn",
		resource: "activaterootbutton.caption",
		fallback: "動作設定",
		shortcut: "",
	},
	{
		id: "addressbar-btn",
		resource: "addressbarbutton.caption",
		fallback: "アドレスバー",
		shortcut: "",
	},
	{
		id: "aistate-btn",
		resource: "aistatebutton.caption",
		fallback: "AIステータス",
		shortcut: "",
	},
	{
		id: "align-root-btn",
		resource: "alignrootbutton.caption",
		fallback: "位置合わせ",
		shortcut: "",
	},
	{
		id: "always-stay-on-top-btn",
		resource: "alwaysstayontopbutton.caption",
		fallback: "常に最前面表示",
		shortcut: "",
	},
	{
		id: "always-tray-icon-visible-btn",
		resource: "alwaystrayiconvisiblebutton.caption",
		fallback: "タスクトレイアイコン常時表示",
		shortcut: "",
	},
	{
		id: "balloon-history-btn",
		resource: "balloonhistorybutton.caption",
		fallback: "バルーン履歴",
		shortcut: "",
	},
	{
		id: "balloon-menu-btn",
		resource: "balloonrootbutton.caption",
		fallback: "バルーン (B)",
		shortcut: "B",
	},
	{
		id: "biff-all-btn",
		resource: "biffallbutton.caption",
		fallback: "全ゴーストメールチェック",
		shortcut: "",
	},
	{
		id: "biff-btn",
		resource: "biffbutton.caption",
		fallback: "メールチェック (M)",
		shortcut: "M",
	},
	{
		id: "calendar-btn",
		resource: "calendarbutton.caption",
		fallback: "カレンダー",
		shortcut: "",
	},
	{
		id: "call-ghost-history-btn",
		resource: "callghosthistorybutton.caption",
		fallback: "呼び出し履歴",
		shortcut: "",
	},
	{
		id: "call-ghost-btn",
		resource: "callghostrootbutton.caption",
		fallback: "他のゴーストを呼ぶ (C)",
		shortcut: "C",
	},
	{
		id: "call-sstp-sendbox-btn",
		resource: "callsstpsendboxbutton.caption",
		fallback: "SSTP送信ボックス",
		shortcut: "",
	},
	{
		id: "char-recommendsites-btn",
		resource: "char-star-.recommendsites.caption",
		fallback: "おすすめサイト",
		shortcut: "",
	},
	{
		id: "charset-btn",
		resource: "charsetbutton.caption",
		fallback: "文字コード設定",
		shortcut: "",
	},
	{
		id: "close-balloon-btn",
		resource: "closeballoonbutton.caption",
		fallback: "バルーンを消す (Ctrl+Shift+Del)",
		shortcut: "Ctrl+Shift+Del",
	},
	{
		id: "close-all-btn",
		resource: "closebutton.caption",
		fallback: "全て終了 (X)",
		shortcut: "Ctrl+Q",
	},
	{
		id: "collision-visible-btn",
		resource: "collisionvisiblebutton.caption",
		fallback: "当たり判定表示",
		shortcut: "",
	},
	{
		id: "settings-btn",
		resource: "configurationbutton.caption",
		fallback: "設定 (O)",
		shortcut: "O",
	},
	{
		id: "configuration-root-btn",
		resource: "configurationrootbutton.caption",
		fallback: "設定メニュー",
		shortcut: "",
	},
	{
		id: "debug-balloon-btn",
		resource: "debugballoonbutton.caption",
		fallback: "デバッグバルーン",
		shortcut: "",
	},
	{
		id: "defined-surface-only-btn",
		resource: "definedsurfaceonlybutton.caption",
		fallback: "定義済サーフィスのみ表示",
		shortcut: "",
	},
	{
		id: "dictation-btn",
		resource: "dictationbutton.caption",
		fallback: "音声認識",
		shortcut: "",
	},
	{
		id: "dressup-menu-btn",
		resource: "dressuprootbutton.caption",
		fallback: "着せ替え (C)",
		shortcut: "C",
	},
	{
		id: "dui-btn",
		resource: "duibutton.caption",
		fallback: "Direct User Interface",
		shortcut: "",
	},
	{
		id: "enable-balloon-move-btn",
		resource: "enableballoonmovebutton.caption",
		fallback: "バルーン移動を許可",
		shortcut: "",
	},
	{
		id: "first-staff-btn",
		resource: "firststaffbutton.caption",
		fallback: "開発スタッフ情報",
		shortcut: "",
	},
	...GENERAL_CAPTION_DEFINITIONS_PART2,
];
