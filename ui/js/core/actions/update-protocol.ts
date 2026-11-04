/**
 * @file update-protocol.ts
 * @brief UKADOC (SSP仕様) 準拠 ネットワーク更新プロトコルのメッセージ・イベント引数構築モジュール
 */

export const UPDATE_TARGET_TYPES = Object.freeze([
	"ghost",
	"shell",
	"balloon",
	"plugin",
	"headline",
]);

export const UPDATE_REASONS = Object.freeze(["manual", "auto", "script"]);

export const UPDATE_RESULT_COMPLETE = Object.freeze(["none", "changed"]);

export const UPDATE_RESULT_FAILURE_REASONS = Object.freeze([
	"timeout",
	"404",
	"md5 miss",
	"fileio",
	"artificial",
	"readonly",
]);

export const UPDATE_EVENT_ORDER = Object.freeze([
	"OnUpdateProcessExec",
	"OnUpdateBegin",
	"OnUpdateReady",
	"OnUpdate.OnDownloadBegin",
	"OnUpdate.OnMD5CompareBegin",
	"OnUpdate.OnMD5CompareComplete",
	"OnUpdateComplete",
]);

export function buildUpdateArgs(
	ref0: string | number = "",
	ref1: string | number = "",
	updateTarget: string = "ghost",
	updateMode: string = "manual",
): [string, string, string, string, string] {
	return [String(ref0), String(ref1), "", updateTarget, updateMode];
}

export function buildUpdateOtherArgs(
	targetName: string = "",
	targetType: string = "shell",
	detail: string | number = "",
	mode: string = "manual",
): [string, string, string, string] {
	return [String(targetName), String(targetType), String(detail), String(mode)];
}

export const PROGRESS_PHASE_EVENTS: Record<string, string> = {
	"download-begin": "OnUpdate.OnDownloadBegin",
	"md5-begin": "OnUpdate.OnMD5CompareBegin",
	"md5-complete": "OnUpdate.OnMD5CompareComplete",
	"md5-failed": "OnUpdate.OnMD5CompareFailure",
	"fileio-failed": "OnUpdateFailure",
};

export const OTHER_PROGRESS_PHASE_EVENTS: Record<string, string> = {
	"download-begin": "OnUpdateOther.OnDownloadBegin",
	"md5-begin": "OnUpdateOther.OnMD5CompareBegin",
	"md5-complete": "OnUpdateOther.OnMD5CompareComplete",
	"md5-failed": "OnUpdateOther.OnMD5CompareFailure",
	"fileio-failed": "OnUpdateOtherFailure",
};

export function parseErrorReason(err: any): string {
	const msg = String(err);
	if (msg.includes("404")) return "404";
	if (msg.includes("timeout")) return "timeout";
	if (msg.includes("md5 miss")) return "md5 miss";
	return "fileio";
}

export function createUpdateProgressHandler(
	gc: any,
	onFailedFile?: (filePath: string) => void,
	isOther: boolean = false,
) {
	const eventMap = isOther
		? OTHER_PROGRESS_PHASE_EVENTS
		: PROGRESS_PHASE_EVENTS;
	return (event: any) => {
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
