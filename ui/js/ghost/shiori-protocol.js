/**
 * Nanai Android Mascot - SHIORI レスポンス変換ヘルパー
 *
 * SHIORI/3.0 リクエストの構築・レスポンスのパースは
 * Rust コア（`crates/ui::shiori` の `ShioriRequest` / `ShioriResponse`）に一本化されている。
 * Tauri IPC（`send_shiori_event_typed` 等）経由の Rust 解析済みレスポンスを
 * レガシー内部形式へ変換するためのユーティリティのみを置く。
 */

/**
 * Rust `ShioriResponse`（serde externally tagged enum）のステータス → 数値コード
 * 例: "Ok" → 200 / { "Other": 599 } → 599
 * @param {string|Record<string, any>|undefined} status
 * @returns {number}
 */
export function statusCodeFromRust(status) {
	const codes = {
		Ok: 200,
		NoContent: 204,
		NotEnough: 311,
		Advice: 312,
		BadRequest: 400,
		InternalServerError: 500,
	};
	if (typeof status === "object" && status !== null) {
		const [variant, val] = Object.entries(status)[0] ?? ["Ok", undefined];
		return typeof val === "number" ? val : (codes[variant] ?? 0);
	}
	return codes[status] ?? 0;
}

/**
 * Rust 解析済みレスポンス（`send_shiori_event_typed` の戻り値）を
 * レガシー parseResponse 形状（{ status, statusText, value, headers }）へ変換
 * @param {Record<string, any>|null} typed
 * @returns {{ status: number, statusText: string, value: string, headers: Object }|null}
 */
export function fromRustResponse(typed) {
	if (!typed || typeof typed !== "object") return null;

	const status = statusCodeFromRust(typed.status);
	const headers = {};
	for (const [key, value] of Object.entries(typed)) {
		if (value == null) continue;
		if (Array.isArray(value)) {
			if (value.length > 0) headers[key.toLowerCase()] = value;
		} else if (typeof value !== "object") {
			headers[key.toLowerCase()] = String(value);
		} else {
			headers[key.toLowerCase()] = value;
		}
	}
	return {
		status,
		statusText: typed.statusText ?? "",
		value: typed.value ?? "",
		headers,
	};
}

/** 後方互換用エイリアス（Rust 統合後の変換ヘルパー群） */
export const ShioriProtocol = {
	statusCodeFromRust,
	fromRustResponse,
};
