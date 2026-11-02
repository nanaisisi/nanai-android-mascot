/**
 * @file install-protocol.js
 * @brief UKADOC (SSP仕様) 準拠 インストールイベント・引数生成およびエラーハンドリングモジュール
 *
 * 参考仕様:
 * - OnInstallBegin: Reference0=識別子 ("install" 等)
 * - OnInstallComplete: Reference0=種別 ("ghost", "shell", "balloon", "plugin", "headline", "package" 等), Reference1=名前
 * - OnInstallFailure: Reference0=失敗理由 ("unsupported", "extraction", "unlha32 error", "artificial", "write error" 等)
 */

/**
 * インストール対象種別の正規化 (UKADOC「インストールの識別子」準拠)
 * @param {string} type
 * @returns {string}
 */
export function normalizeInstallType(type) {
	if (!type || typeof type !== "string") return "unknown";
	const lower = type.trim().toLowerCase();
	switch (lower) {
		case "ghost":
		case "shell":
		case "balloon":
		case "plugin":
		case "headline":
		case "package":
		case "supplement":
		case "calendar.skin":
		case "calendar.plugin":
			return lower;
		default:
			return lower || "unknown";
	}
}

/**
 * OnInstallBegin SHIORI 引数生成
 * [Ref0] -> ["install"] または 指定識別子
 * @param {string} [identifier="install"]
 * @returns {[string]}
 */
export function buildInstallBeginArgs(identifier = "install") {
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
export function buildInstallCompleteArgs(installType, name, extra = "") {
	return [normalizeInstallType(installType), String(name ?? ""), String(extra)];
}

/**
 * 例外オブジェクトやエラー文字列から UKADOC 準拠の「インストールの失敗理由」を抽出
 * @param {any} err
 * @returns {string} - "unsupported" | "extraction" | "unlha32 error" | "artificial" | "write error" | "invalid path"
 */
export function parseInstallErrorReason(err) {
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

/**
 * OnInstallFailure SHIORI 引数生成
 * [Ref0=失敗理由]
 * @param {any} errorOrReason
 * @returns {[string]}
 */
export function buildInstallFailureArgs(errorOrReason) {
	const reason = parseInstallErrorReason(errorOrReason);
	return [reason];
}
