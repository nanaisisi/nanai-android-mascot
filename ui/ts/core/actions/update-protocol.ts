/**
 * @file update-protocol.ts
 * @brief UKADOC (SSP仕様) 準拠 ネットワーク更新プロトコルのメッセージ・イベント引数構築モジュール
 *
 * 準拠イベント:
 * - OnUpdateBegin / OnUpdateReady / OnUpdateComplete / OnUpdateFailure
 * - OnUpdate.OnDownloadBegin / OnUpdate.OnMD5CompareBegin / OnUpdate.OnMD5CompareComplete / OnUpdate.OnMD5CompareFailure
 * - OnUpdateOtherBegin / OnUpdateOtherReady / OnUpdateOtherComplete / OnUpdateOtherFailure
 * - OnUpdateOther.OnDownloadBegin / OnUpdateOther.OnMD5CompareBegin / OnUpdateOther.OnMD5CompareComplete / OnUpdateOther.OnMD5CompareFailure
 * - OnUpdateCheckComplete / OnUpdateCheckFailure / OnUpdateCheckResult / OnUpdateCheckResultEx
 * - OnUpdateProcessExec / OnUpdateResult / OnUpdateResultEx / OnUpdateResultExplorer
 */

/**
 * UKADOC仕様: ネットワーク更新対象の種別 (Update Target Types)
 * 定義: ghost, shell, balloon, plugin, headline
 */
export const UPDATE_TARGET_TYPES = Object.freeze([
	"ghost",
	"shell",
	"balloon",
	"plugin",
	"headline",
]);

/**
 * UKADOC仕様: ネットワーク更新理由 (Update Reasons / Modes)
 * 定義: manual (手動), auto (定期/タイマー自動), script (さくらスクリプト \![update] による実行)
 */
export const UPDATE_REASONS = Object.freeze(["manual", "auto", "script"]);

/**
 * UKADOC仕様: ネットワーク更新成功理由 (Update Complete Results)
 * 定義: none (更新なし), changed (更新あり)
 */
export const UPDATE_RESULT_COMPLETE = Object.freeze(["none", "changed"]);

/**
 * UKADOC仕様: ネットワーク失敗理由 (Update Result Failure Reasons)
 * 定義: timeout, 404, md5 miss, fileio, artificial (ユーザ中断), readonly (書込禁止)
 */
export const UPDATE_RESULT_FAILURE_REASONS = Object.freeze([
	"timeout",
	"404",
	"md5 miss",
	"fileio",
	"artificial",
	"readonly",
]);

/**
 * ネットワーク更新理由のバリデーション・正規化 (UKADOC「ネットワーク更新理由」準拠)
 * @param {string} [reason="manual"] - "manual" | "auto" | "script"
 * @returns {string}
 */
export function normalizeUpdateReason(
	reason: string | null | undefined,
): string {
	if (!reason || typeof reason !== "string") return "manual";
	const lower = reason.trim().toLowerCase();
	if (UPDATE_REASONS.includes(lower)) {
		return lower;
	}
	return "manual";
}

/**
 * developer_options.txt の noupdate ディレクティブ除外判定
 * @param {string} path - 検証対象のファイル相対パス
 * @param {string[]} patterns - developer_options.txt から抽出した noupdate パターンリスト
 * @returns {boolean} - 除外対象なら true
 */
export function isNoUpdatePath(path: string, patterns: string[] = []): boolean {
	if (!path || !Array.isArray(patterns) || patterns.length === 0) return false;
	const norm = path.replace(/\\/g, "/").toLowerCase();
	return patterns.some((pattern) => {
		const patNorm = pattern.replace(/\\/g, "/").toLowerCase();
		return norm === patNorm || norm.endsWith(`/${patNorm.replace(/^\//, "")}`);
	});
}

/**
 * UKADOC仕様: ネットワーク更新イベントの発生順序 (Update Event Order)
 * 標準ライフサイクル順序配列
 */
export const UPDATE_EVENT_ORDER = Object.freeze([
	"OnUpdateProcessExec",
	"OnUpdateBegin",
	"OnUpdateReady",
	"OnUpdate.OnDownloadBegin",
	"OnUpdate.OnMD5CompareBegin",
	"OnUpdate.OnMD5CompareComplete",
	"OnUpdateComplete",
]);

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
	ref0: string | number = "",
	ref1: string | number = "",
	updateTarget: string = "ghost",
	updateMode: string = "manual",
): [string, string, string, string, string] {
	return [String(ref0), String(ref1), "", updateTarget, updateMode];
}

/**
 * OnUpdateOther* (外部リソース: shell, balloon, plugin 等) 標準引数生成
 * [Ref0=対象名, Ref1=種別, Ref2=バージョン/追加情報, Ref3=モード]
 * @param {string} targetName
 * @param {string} targetType - "shell", "balloon", "plugin" など
 * @param {string|number} [detail=""]
 * @param {string} [mode="manual"]
 * @returns {[string, string, string, string]}
 */
export function buildUpdateOtherArgs(
	targetName: string = "",
	targetType: string = "shell",
	detail: string | number = "",
	mode: string = "manual",
): [string, string, string, string] {
	return [String(targetName), String(targetType), String(detail), String(mode)];
}

/** 更新進行フェーズ → SHIORI サブイベント対応表 */
export const PROGRESS_PHASE_EVENTS: Record<string, string> = {
	"download-begin": "OnUpdate.OnDownloadBegin",
	"md5-begin": "OnUpdate.OnMD5CompareBegin",
	"md5-complete": "OnUpdate.OnMD5CompareComplete",
	"md5-failed": "OnUpdate.OnMD5CompareFailure",
	"fileio-failed": "OnUpdateFailure",
};

/** 外部リソース更新進行フェーズ → SHIORI サブイベント対応表 */
export const OTHER_PROGRESS_PHASE_EVENTS: Record<string, string> = {
	"download-begin": "OnUpdateOther.OnDownloadBegin",
	"md5-begin": "OnUpdateOther.OnMD5CompareBegin",
	"md5-complete": "OnUpdateOther.OnMD5CompareComplete",
	"md5-failed": "OnUpdateOther.OnMD5CompareFailure",
	"fileio-failed": "OnUpdateOtherFailure",
};

/**
 * 例外オブジェクトから UKADOC 準拠の失敗理由を抽出
 * @param {any} err
 * @returns {string}
 */
<<<<<<< HEAD
export function parseErrorReason(err: unknown): string {
=======
// biome-ignore lint/suspicious/noExplicitAny: automated fix
export function parseErrorReason(err: any): string {
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
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
 * @param {boolean} [isOther=false] - 外部リソース更新時は true
 * @returns {(event: unknown) => void}
 */
export function createUpdateProgressHandler(
<<<<<<< HEAD
	gc: unknown,
=======
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	gc: any,
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
	onFailedFile?: (filePath: string) => void,
	isOther: boolean = false,
) {
	const eventMap = isOther
		? OTHER_PROGRESS_PHASE_EVENTS
		: PROGRESS_PHASE_EVENTS;
<<<<<<< HEAD
	return (event: unknown) => {
=======
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	return (event: any) => {
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
		const { phase, path: filePath } = event.payload || {};
		if (!filePath) return;
		const evName = eventMap[phase];
		if (evName && gc) {
			gc.sendShioriEvent(evName, buildUpdateArgs(filePath)).catch?.(() => {});
		}
		if ((phase === "md5-failed" || phase === "fileio-failed") && onFailedFile) {
			onFailedFile(filePath);
		}
	};
}
