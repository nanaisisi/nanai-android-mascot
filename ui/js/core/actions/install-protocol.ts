/**
 * @file install-protocol.ts
 * @brief UKADOC (SSP仕様) 準拠 インストールイベント・引数生成およびエラーハンドリングモジュール
 */

export const INSTALL_IDENTIFIERS = Object.freeze([
	"ghost",
	"shell",
	"balloon",
	"plugin",
	"headline",
	"package",
	"supplement",
	"calendar.skin",
	"calendar.plugin",
	"profile",
	"taromime",
]);

export const INSTALL_FAILURE_REASONS = Object.freeze([
	"unsupported",
	"extraction",
	"unlha32 error",
	"artificial",
	"write error",
	"invalid path",
	"format error",
]);

export function normalizeInstallType(type: string | null | undefined): string {
	if (!type || typeof type !== "string") return "unknown";
	const lower = type.trim().toLowerCase();
	if (INSTALL_IDENTIFIERS.includes(lower)) {
		return lower;
	}
	return lower || "unknown";
}

export function buildInstallBeginArgs(identifier: string = "install"): [string] {
	return [String(identifier)];
}

export function buildInstallCompleteArgs(
	installType: string,
	name: string,
	extra: string = "",
): [string, string, string] {
	return [normalizeInstallType(installType), String(name ?? ""), String(extra)];
}

export function buildInstallCompleteExArgs(
	installType: string,
	name: string,
	pathOrExtra: string = "",
	onInstallScript: string = "",
): [string, string, string, string] {
	return [
		normalizeInstallType(installType),
		String(name ?? ""),
		String(pathOrExtra ?? ""),
		String(onInstallScript ?? ""),
	];
}

export function buildInstallCompleteAllArgs(
	installedList: Array<{ type: string; name: string }> = [],
): [string, string] {
	const count = String(installedList.length);
	const sep = String.fromCharCode(1); // Byte1
	const listStr = installedList
		.map((item) => `${normalizeInstallType(item.type)}${sep}${item.name}`)
		.join("\n");
	return [count, listStr];
}

export function buildInstallRefuseArgs(reason: string = "refused", target: string = ""): [string, string] {
	return [String(reason ?? "refused"), String(target ?? "")];
}

export function buildInstallRerouteArgs(
	targetGhost: string,
	installType: string,
	name: string,
): [string, string, string] {
	return [
		String(targetGhost ?? ""),
		normalizeInstallType(installType),
		String(name ?? ""),
	];
}

export function parseErrorReason(err: any): string {
	const msg = String(err?.message || err || "").toLowerCase();

	if (
		msg.includes("unsupported") ||
		msg.includes("invalid type") ||
		msg.includes("サポートされていない")
	) {
		return "unsupported";
	}
	if (
		msg.includes("artificial") ||
		msg.includes("cancel") ||
		msg.includes("abort") ||
		msg.includes("キャンセル")
	) {
		return "artificial";
	}
	if (
		msg.includes("zip-slip") ||
		msg.includes("illegal path") ||
		msg.includes("traversal") ||
		msg.includes("absolute path")
	) {
		return "invalid path";
	}
	if (
		msg.includes("unlha32") ||
		msg.includes("lha") ||
		msg.includes("corrupt") ||
		msg.includes("crc")
	) {
		return "unlha32 error";
	}
	if (
		msg.includes("write error") ||
		msg.includes("fileio") ||
		msg.includes("permission denied") ||
		msg.includes("io error")
	) {
		return "write error";
	}
	return "extraction";
}

export const parseInstallErrorReason = parseErrorReason;

export function buildInstallFailureArgs(errorOrReason: any): [string] {
	const reason = parseErrorReason(errorOrReason);
	return [reason];
}
