import { invoke, isTauriAvailable } from "../../core/tauri-helper.js";

export async function handleJumpCommand(
	handler: import("../sakura-command-handler.js").SakuraCommandHandler,
	target: string,
	args: string[] = [],
) {
	const destination = (target ?? "").trim();
	if (!destination) return;

	if (
		/^(https?|mailto|file):\/\//i.test(destination) ||
		destination.startsWith("mailto:")
	) {
		try {
			if (destination.startsWith("file://") && isTauriAvailable()) {
				const filePath = destination.replace(/^file:\/\/\/?/i, "");
				await invoke("open_path", { path: filePath });
			} else if (typeof globalThis !== "undefined" && globalThis.open) {
				globalThis.open(destination, "_blank", "noopener,noreferrer");
			}
		} catch (err) {
			console.warn(
				"Failed to open URL/file in jump command:",
				destination,
				err,
			);
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
