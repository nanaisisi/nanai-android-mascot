/**
 * @file jump.js
 * @brief \j[ID] / \j[URL] ジャンプコマンドハンドラ
 * UKADOC仕様: 指定したスクリプトまたはURLへジャンプする。
 * URL(http://やhttps://)の場合はブラウザで開き、それ以外はSHIORIイベント(OnChoiceSelect等)を発火する。
 */

/**
 * ジャンプコマンドを実行
 * @param {import('../sakura-command-handler.js').SakuraCommandHandler} handler
 * @param {string} target - ジャンプ先URLまたはID
 * @param {string[]} [args] - 追加パラメータ
 */
export async function handleJumpCommand(handler, target, args = []) {
	const destination = (target ?? "").trim();
	if (!destination) return;

	// URL形式判定 (http://, https://)
	if (/^https?:\/\//i.test(destination)) {
		try {
			if (typeof globalThis !== "undefined" && globalThis.open) {
				globalThis.open(destination, "_blank", "noopener,noreferrer");
			}
		} catch (err) {
			console.warn("Failed to open URL in browser:", destination, err);
		}
		return;
	}

	// イベント/ラベルジャンプ
	if (destination.startsWith("On")) {
		await handler.app.ghostController?.sendShioriEvent?.(destination, args);
	} else {
		await handler.app.ghostController?.sendShioriEvent?.("OnChoiceSelect", [
			destination,
			...args,
		]);
	}
}
