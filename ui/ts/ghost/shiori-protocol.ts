/**
 * @file shiori-protocol.ts
 * @brief Nanai Android Mascot - SHIORI レスポンス変換ヘルパー
 */

export function statusCodeFromRust(
	status: string | Record<string, any> | undefined,
): number {
	const codes: Record<string, number> = {
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
	return codes[status as string] ?? 0;
}

export function fromRustResponse(typed: Record<string, any> | null) {
	if (!typed || typeof typed !== "object") return null;

	const status = statusCodeFromRust(typed.status);
	const headers: Record<string, any> = {};
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

export const ShioriProtocol = {
	statusCodeFromRust,
	fromRustResponse,
};
