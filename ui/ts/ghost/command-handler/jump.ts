/**
 * @file jump.ts
 * @brief \j[ID] / \j[URL] ジャンプコマンドハンドラ
 */

export async function handleJumpCommand(
	handler: unknown,
	target: string,
	args: string[] = [],
) {
	const destination = (target ?? "").trim();
	if (!destination) return;

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

	if (destination.startsWith("On")) {
		await handler.app.ghostController?.sendShioriEvent?.(destination, args);
	} else {
		await handler.app.ghostController?.sendShioriEvent?.("OnChoiceSelect", [
			destination,
			...args,
		]);
	}
}
