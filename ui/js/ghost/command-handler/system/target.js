/**
 * @file target.js
 * @brief メールチェック・時刻同期・エクスプローラー/ファイルオープンハンドラ
 */

import { invoke, isTauriAvailable } from "../../../core/tauri-helper.js";

/**
 * メールチェック実行 (\![biff])
 * @param {import('../../sakura-command-handler.js').SakuraCommandHandler} handler
 * @param {string[]} _args
 */
export async function handleBiffCommand(handler, _args) {
	console.log("✉️ Biff mail check triggered");
	await handler.app.networkActions?.checkEmail?.();
}

/**
 * SNTP時刻合わせ実行 (\![executesntp])
 * [bang-executesntp.md], [OnSNTPBegin.md], [OnSNTPCompare.md], [OnSNTPCompareEx.md], [OnSNTPCorrect.md], [OnSNTPCorrectEx.md], [OnSNTPFailure.md]
 * @param {import('../../sakura-command-handler.js').SakuraCommandHandler} handler
 * @param {string[]} _args
 */
export async function handleExecuteSntpCommand(handler, _args) {
	console.log("⏱️ Execute SNTP time sync triggered");
	const gc = handler.app.ghostController;
	const nowIso = new Date().toISOString();
	try {
		// SNTP同期開始イベント
		await gc?.sendShioriEvent?.("OnSNTPBegin", [nowIso]);
		// SNTP時刻比較イベント
		await gc?.sendShioriEvent?.("OnSNTPCompare", [nowIso]);
		await gc?.sendShioriEvent?.("OnSNTPCompareEx", [nowIso, "0"]);
		// SNTP時刻補正イベント
		await gc?.sendShioriEvent?.("OnSNTPCorrect", [nowIso]);
		await gc?.sendShioriEvent?.("OnSNTPCorrectEx", [nowIso, "0"]);
	} catch (err) {
		console.warn("SNTP compare event trigger failed:", err);
		await gc?.sendShioriEvent?.("OnSNTPFailure", [String(err)]);
	}
}

/**
 * 時報イベント発火ハンドラ (\![raise,OnHourTimeSignal,...])
 * [OnHourTimeSignal.md]
 * @param {import('../../sakura-command-handler.js').SakuraCommandHandler} handler
 * @param {number} [hour]
 */
export async function handleHourTimeSignal(handler, hour) {
	const currentHour = hour ?? new Date().getHours();
	if (handler.app.ghostController?.sendShioriEvent) {
		await handler.app.ghostController.sendShioriEvent("OnHourTimeSignal", [
			String(currentHour),
		]);
	}
}

/**
 * 各種ダイアログ/エクスプローラーオープン (\![open,explorer,...], \![open,file,...] 等)
 * @param {import('../../sakura-command-handler.js').SakuraCommandHandler} handler
 * @param {string[]} args
 */
export async function handleOpenSystemTarget(handler, args) {
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
