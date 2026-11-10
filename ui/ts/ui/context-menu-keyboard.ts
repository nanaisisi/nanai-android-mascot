import type { MenuDispatcher } from "./menu-dispatcher.js";

// 単一アクセラレータキー (SSP標準キーバインド準拠)
export const MENU_KEY_MAP: Record<string, string> = {
	r: "recommend", // おすすめ (Recommend)
	t: "portal", // ポータルサイト (Portal)
	u: "update", // ネットワーク更新 (Update)
	d: "uninstall-ghost", // アンインストール (Delete)
	h: "headline", // RSS/ヘッドライン (Headline)
	p: "plugins", // プラグイン (Plugins)
	m: "biff", // メールチェック (Mail)
	f: "tools", // 機能 (Functions)
	o: "settings", // 設定 (Options)
	g: "ghost", // ゴースト切り替え (Ghost)
	c: "dressup", // 着せ替え (Clothing)
	b: "balloon", // バルーン (Balloon)
	a: "help", // 情報 (About)
	i: "minimize", // アイコン化 (Iconize)
	w: "close", // 終了 (Window close)
	x: "close-all", // 全て終了 (Exit all)
	z: "call-ghost", // 他のゴーストを呼ぶ (Call ghost)
};

export function handleMenuKeydown(
	e: KeyboardEvent,
	dispatcher: MenuDispatcher,
): void {
	if (e.key === "Escape") {
		dispatcher.dispatchAction("close-menu");
		return;
	}

	if (e.ctrlKey || e.metaKey) {
		if (e.key.toLowerCase() === "i") {
			e.preventDefault();
			dispatcher.dispatchAction("minimize");
		} else if (e.key.toLowerCase() === "w") {
			e.preventDefault();
			dispatcher.dispatchAction("close");
		} else if (e.key.toLowerCase() === "q") {
			e.preventDefault();
			dispatcher.dispatchAction("close-all");
		} else if (e.key.toLowerCase() === "k") {
			e.preventDefault();
			dispatcher.dispatchAction("keep-temporary-ghost");
		} else if (e.shiftKey && e.key.toLowerCase() === "f12") {
			e.preventDefault();
			dispatcher.dispatchAction("reset-shell-position");
		} else if (e.shiftKey && e.key.toLowerCase() === "f10") {
			e.preventDefault();
			dispatcher.dispatchAction("reset-balloon-position");
		} else if (
			e.shiftKey &&
			(e.key === "Delete" || e.key === "Del" || e.key.toLowerCase() === "del")
		) {
			e.preventDefault();
			dispatcher.dispatchAction("close-balloon");
		}
		return;
	}

	const action = MENU_KEY_MAP[e.key.toLowerCase()];
	if (action) {
		e.preventDefault();
		dispatcher.dispatchAction(action);
	}
}
