/**
 * @file target.ts
 * @brief メールチェック・時刻同期・エクスプローラー/ファイルオープンハンドラ
 */

import { invoke, isTauriAvailable } from "../../../core/tauri-helper.js";

<<<<<<< HEAD
export async function handleBiffCommand(handler: unknown, _args: string[]) {
=======
// biome-ignore lint/suspicious/noExplicitAny: automated fix
export async function handleBiffCommand(handler: any, _args: string[]) {
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
	console.log("✉️ Biff mail check triggered");
	await handler.app.networkActions?.checkEmail?.();
}

<<<<<<< HEAD
export async function handleExecuteSntpCommand(
	handler: unknown,
	_args: string[],
) {
=======
// biome-ignore lint/suspicious/noExplicitAny: automated fix
export async function handleExecuteSntpCommand(handler: any, _args: string[]) {
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
	console.log("⏱️ Execute SNTP time sync triggered");
	const gc = handler.app.ghostController;
	const nowIso = new Date().toISOString();
	try {
		await gc?.sendShioriEvent?.("OnSNTPBegin", [nowIso]);
		await gc?.sendShioriEvent?.("OnSNTPCompare", [nowIso]);
		await gc?.sendShioriEvent?.("OnSNTPCompareEx", [nowIso, "0"]);
		await gc?.sendShioriEvent?.("OnSNTPCorrect", [nowIso]);
		await gc?.sendShioriEvent?.("OnSNTPCorrectEx", [nowIso, "0"]);
	} catch (err) {
		console.warn("SNTP compare event trigger failed:", err);
		await gc?.sendShioriEvent?.("OnSNTPFailure", [String(err)]);
	}
}

<<<<<<< HEAD
export async function handleHourTimeSignal(handler: unknown, hour?: number) {
=======
// biome-ignore lint/suspicious/noExplicitAny: automated fix
export async function handleHourTimeSignal(handler: any, hour?: number) {
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
	const currentHour = hour ?? new Date().getHours();
	if (handler.app.ghostController?.sendShioriEvent) {
		await handler.app.ghostController.sendShioriEvent("OnHourTimeSignal", [
			String(currentHour),
		]);
	}
}

<<<<<<< HEAD
export async function handleOpenSystemTarget(handler: unknown, args: string[]) {
=======
// biome-ignore lint/suspicious/noExplicitAny: automated fix
export async function handleOpenSystemTarget(handler: any, args: string[]) {
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
	const target = (args[1] ?? "").toLowerCase();
	const pathOrParam = args[2] ?? "";

	switch (target) {
		case "explorer":
		case "shellexplorer":
		case "balloonexplorer":
		case "ghostexplorer": {
			console.log(`📂 Open explorer requested: target=${target}`);
			handler.app.toggleMenu?.();
			break;
		}

		case "file": {
			console.log(`📄 Open file requested: path=${pathOrParam}`);
			if (isTauriAvailable() && pathOrParam) {
				try {
					await invoke("open_path", { path: pathOrParam });
				} catch (err) {
					console.warn("Failed to open file path:", err);
				}
			}
			break;
		}

		case "browser": {
			if (pathOrParam && /^https?:\/\//i.test(pathOrParam)) {
				if (typeof globalThis !== "undefined" && globalThis.open) {
					globalThis.open(pathOrParam, "_blank", "noopener,noreferrer");
				}
			}
			break;
		}

		case "configurationdialog": {
			const tabId = pathOrParam || "general";
			console.log(`⚙️ Open configuration dialog requested (tab=${tabId})`);
			if (handler.app.modalManager) {
				handler.app.modalManager.show("settings-modal-content");
			} else {
				handler.app.toggleMenu?.();
			}
			break;
		}

		case "developer": {
			console.log("🛠️ Open developer panel requested");
			if (handler.app.ghostController) {
				handler.app.ghostController.shioriDebugMode = true;
			}
			if (isTauriAvailable()) {
				try {
					await invoke("toggle_devtools");
				} catch (err) {
					console.debug("Devtools toggle:", err);
				}
			}
			break;
		}

		case "readme":
		case "history": {
			console.log(`📄 Open document requested: ${target}`);
			const currentGhost = handler.app.ghostController?.currentGhost;
			const docPath = currentGhost?.path
				? `${currentGhost.path}/${target}.txt`
				: `${target}.txt`;
			if (isTauriAvailable()) {
				try {
					await invoke("open_path", { path: docPath });
				} catch (err) {
					console.warn(`Failed to open ${target}:`, err);
				}
			}
			break;
		}

		default:
			console.debug(`未対応の open システムターゲット: ${target}`);
			break;
	}
}
