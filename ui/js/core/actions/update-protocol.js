/**
 * @file update-protocol.js
 * @brief UKADOC (SSP仕様) 準拠 ネットワーク更新プロトコルのメッセージ・イベント引数構築モジュール
 */

/**
 * ネットワーク更新標準 SHIORI 引数生成ヘルパー (UKADOC準拠)
 * [Ref0, Ref1, Ref2, Ref3, Ref4] -> [ref0, ref1, "", "ghost", "manual"]
 * @param {string|number} [ref0]
 * @param {string|number} [ref1]
 * @param {string} [updateTarget="ghost"]
 * @param {string} [updateMode="manual"]
 * @returns {[string, string, string, string, string]}
 */
export function buildUpdateArgs(
	ref0 = "",
	ref1 = "",
	updateTarget = "ghost",
	updateMode = "manual",
) {
	return [String(ref0), String(ref1), "", updateTarget, updateMode];
}

/** 更新進行フェーズ → SHIORI サブイベント対応表 */
export const PROGRESS_PHASE_EVENTS = {
	"download-begin": "OnUpdate.OnDownloadBegin",
	"md5-begin": "OnUpdate.OnMD5CompareBegin",
	"md5-complete": "OnUpdate.OnMD5CompareComplete",
	"md5-failed": "OnUpdate.OnMD5CompareFailure",
	"fileio-failed": "OnUpdateFailure",
};

/**
 * 例外オブジェクトから UKADOC 準拠の失敗理由を抽出
 * @param {any} err
 * @returns {string}
 */
export function parseErrorReason(err) {
	const msg = String(err);
	if (msg.includes("404")) return "404";
	if (msg.includes("timeout")) return "timeout";
	if (msg.includes("md5 miss")) return "md5 miss";
	return "fileio";
}

/**
 * ファイル単位の進捗通知ハンドラ生成 (Rust execute_ghost_update の update-progress を受診)
 * @param {any} gc - GhostController
 * @param {(filePath: string) => void} [onFailedFile]
 * @returns {(event: any) => void}
 */
export function createUpdateProgressHandler(gc, onFailedFile) {
	return (event) => {
		const { phase, path: filePath } = event.payload || {};
		if (!filePath) return;
		const evName = PROGRESS_PHASE_EVENTS[phase];
		if (evName && gc) {
			gc.sendShioriEvent(evName, buildUpdateArgs(filePath)).catch?.(() => {});
		}
		if ((phase === "md5-failed" || phase === "fileio-failed") && onFailedFile) {
			onFailedFile(filePath);
		}
	};
}
