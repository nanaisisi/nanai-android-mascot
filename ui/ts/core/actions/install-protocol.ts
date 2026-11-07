/**
 * @file install-protocol.ts
 * @brief UKADOC (SSP仕様) 準拠 インストールイベント・引数生成およびエラーハンドリングモジュール
 *
 * 参考仕様:
 * - OnInstallBegin: Reference0=識別子 ("install" 等)
 * - OnInstallComplete: Reference0=種別 ("ghost", "shell", "balloon", "plugin", "headline", "package" 等), Reference1=名前
 * - OnInstallCompleteEx: Reference0=種別, Reference1=名前, Reference2=パス/追加情報, Reference3=実行スクリプト(任意)
 * - OnInstallCompleteAll: Reference0=インストール数, Reference1=インストール済みリソース一覧 (Byte1 区切りまたはカンマ区切り)
 * - OnInstallFailure: Reference0=失敗理由 ("unsupported", "extraction", "unlha32 error", "artificial", "write error", "invalid path" 等)
 * - OnInstallRefuse: Reference0=拒否理由 ("invalid name", "unsupported", "accept failed" 等), Reference1=拒否対象リソース
 * - OnInstallReroute: Reference0=転送先ゴースト名, Reference1=種別, Reference2=名前
 */

/**
 * UKADOC仕様: インストールの識別子 (Install Identifiers)
 * 定義一覧: ghost, shell, balloon, plugin, headline, package, supplement, calendar.skin, calendar.plugin, profile, taromime
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

/**
 * UKADOC仕様: インストールの失敗理由 (Install Reasons of Failure)
 * 定義一覧: unsupported, extraction, unlha32 error, artificial, write error, invalid path, format error
 */
export const INSTALL_FAILURE_REASONS = Object.freeze([
	"unsupported",
	"extraction",
	"unlha32 error",
	"artificial",
	"write error",
	"invalid path",
	"format error",
]);

/**
 * インストール対象種別の正規化 (UKADOC「インストールの識別子」準拠)
 * @param {string} type
 * @returns {string}
 */
export function normalizeInstallType(type: string | null | undefined): string {
	if (!type || typeof type !== "string") return "unknown";
	const lower = type.trim().toLowerCase();
	if (INSTALL_IDENTIFIERS.includes(lower)) {
		return lower;
	}
	return lower || "unknown";
}

/**
 * OnInstallBegin SHIORI 引数生成
 * [Ref0] -> ["install"] または 指定識別子
 * @param {string} [identifier="install"]
 * @returns {[string]}
 */
export function buildInstallBeginArgs(
	identifier: string = "install",
): [string] {
	return [String(identifier)];
}

/**
 * OnInstallComplete SHIORI 引数生成
 * [Ref0=種別, Ref1=名前, Ref2=追加情報(任意)]
 * @param {string} installType - "ghost", "shell", "balloon" など
 * @param {string} name - インストールされたリソース名
 * @param {string} [extra=""] - 追加引数 (例: shell/balloonインストール先のパスやバージョン)
 * @returns {[string, string, string]}
 */
export function buildInstallCompleteArgs(
	installType: string,
	name: string,
	extra: string = "",
): [string, string, string] {
	return [normalizeInstallType(installType), String(name ?? ""), String(extra)];
}

/**
 * OnInstallCompleteEx SHIORI 引数生成 (UKADOC拡張)
 * [Ref0=種別, Ref1=名前, Ref2=インストール先パス/情報, Ref3=実行スクリプト]
 * @param {string} installType
 * @param {string} name
 * @param {string} [pathOrExtra=""]
 * @param {string} [onInstallScript=""]
 * @returns {[string, string, string, string]}
 */
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

/**
 * OnInstallCompleteAll SHIORI 引数生成 (複数リソース一括展開完了時)
 * [Ref0=インストール件数, Ref1=インストール結果一覧 (種別\1名前)]
 * @param {Array<{ type: string, name: string }>} installedList
 * @returns {[string, string]}
 */
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

/**
 * OnInstallRefuse SHIORI 引数生成 (accept不一致や拒否条件合致時)
 * [Ref0=理由, Ref1=対象リソース/名前]
 * @param {string} reason - "accept failed" | "invalid name" | "unsupported"
 * @param {string} [target=""]
 * @returns {[string, string]}
 */
export function buildInstallRefuseArgs(
	reason: string = "refused",
	target: string = "",
): [string, string] {
	return [String(reason ?? "refused"), String(target ?? "")];
}

/**
 * OnInstallReroute SHIORI 引数生成 (別ゴーストへの転送指定時)
 * [Ref0=転送先ゴースト名, Ref1=種別, Ref2=名前]
 * @param {string} targetGhost
 * @param {string} installType
 * @param {string} name
 * @returns {[string, string, string]}
 */
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

/**
 * 例外オブジェクトやエラー文字列から UKADOC 準拠の「インストールの失敗理由」を抽出
 * @param {any} err
 * @returns {string} - "unsupported" | "extraction" | "unlha32 error" | "artificial" | "write error" | "invalid path"
 */
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

/**
 * OnInstallFailure SHIORI 引数生成
 * [Ref0=失敗理由]
 * @param {any} errorOrReason
 * @returns {[string]}
 */
export function buildInstallFailureArgs(errorOrReason: any): [string] {
	const reason = parseErrorReason(errorOrReason);
	return [reason];
}
