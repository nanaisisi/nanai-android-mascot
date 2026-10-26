/**
 * Nanai Android Mascot - SHIORI 3.0 プロトコルパーサー & ビルダー
 * SHIORI/3.0 リクエストおよびレスポンスの生成・解釈
 */

/**
 * SHIORI/3.0 GET リクエスト文字列を生成
 * @param {string} id - イベントID (例: "OnBoot", "OnMouseClick")
 * @param {Array<string>} references - Reference0〜Reference7
 * @param {string} sender - 送信元ベースウェア名
 * @returns {string} SHIORI/3.0 リクエスト
 */
export function buildRequest(
	id,
	references = [],
	sender = "NanaiAndroidMascot",
) {
	let req = `GET SHIORI/3.0\r\n`;
	req += `Sender: ${sender}\r\n`;
	req += `ID: ${id}\r\n`;
	req += `Charset: UTF-8\r\n`;

	references.forEach((ref, index) => {
		if (ref !== undefined && ref !== null) {
			req += `Reference${index}: ${ref}\r\n`;
		}
	});

	req += `\r\n`;
	return req;
}

/**
 * SHIORI/3.0 レスポンス文字列をパース
 * @param {string} responseText - SHIORIからの生レスポンス文字列
 * @returns {{ status: number, statusText: string, value: string, headers: Object }}
 */
export function parseResponse(responseText) {
	if (!responseText) {
		return { status: 204, statusText: "No Content", value: "", headers: {} };
	}

	const lines = responseText.split(/\r?\n/);
	if (lines.length === 0) {
		return {
			status: 500,
			statusText: "Empty Response",
			value: "",
			headers: {},
		};
	}

	// ステータス行 (例: "SHIORI/3.0 200 OK")
	const statusLine = lines[0].trim();
	const statusMatch = statusLine.match(/^SHIORI\/3\.0\s+(\d+)\s*(.*)$/i);

	const status = statusMatch ? parseInt(statusMatch[1], 10) : 200;
	const statusText = statusMatch ? statusMatch[2].trim() : "OK";

	const headers = {};
	let value = "";
	let isValueHeader = false;

	for (let i = 1; i < lines.length; i++) {
		const line = lines[i];
		if (line === undefined) continue;

		const colonIdx = line.indexOf(":");
		// 新しいヘッダ行かどうかの判定（行頭からコロンまでが英数字・ハイフン）
		if (
			colonIdx !== -1 &&
			/^[a-zA-Z0-9_-]+$/.test(line.substring(0, colonIdx).trim())
		) {
			const key = line.substring(0, colonIdx).trim();
			const val = line.substring(colonIdx + 1).trim();
			headers[key.toLowerCase()] = val;

			if (key.toLowerCase() === "value") {
				value = val;
				isValueHeader = true;
			} else {
				isValueHeader = false;
			}
		} else if (isValueHeader) {
			// Value: が複数行にまたがる場合の継続行連結
			value += `\n${line}`;
		}
	}

	console.log(
		`📥 [parseResponse] status=${status}, value length=${value.length}, value preview:`,
		value.substring(0, 100),
	);

	return {
		status,
		statusText,
		value,
		headers,
	};
}

export const ShioriProtocol = {
	buildRequest,
	parseResponse,
};

/**
 * Rust `ShioriResponse`（serde externally tagged enum）のステータス → 数値コード
 * 例: "Ok" → 200 / { "Other": 599 } → 599
 * @param {string|Record<string, any>|undefined} status
 * @returns {number}
 */
export function statusCodeFromRust(status) {
	if (typeof status === "object" && status !== null) {
		const [variant, val] = Object.entries(status)[0] ?? ["Ok", undefined];
		const codes = {
			Ok: 200,
			NoContent: 204,
			NotEnough: 311,
			Advice: 312,
			BadRequest: 400,
			InternalServerError: 500,
		};
		return typeof val === "number" ? val : (codes[variant] ?? 0);
	}
	const codes = {
		Ok: 200,
		NoContent: 204,
		NotEnough: 311,
		Advice: 312,
		BadRequest: 400,
		InternalServerError: 500,
	};
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
