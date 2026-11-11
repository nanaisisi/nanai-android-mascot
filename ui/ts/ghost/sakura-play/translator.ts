/**
 * @file translator.ts
 * @brief さくらスクリプト再生前トランスレータ (makoto / OnTranslate) 処理モジュール (Slot-05)
 */

export async function translateScript(
	player: any,
	script: string,
): Promise<string> {
	let finalScript = script;
	try {
		const p = player as {
			app?: {
				ghostController?: {
					sendShioriEvent?: (
						event: string,
						args: string[],
					) => Promise<{ script?: string } | null>;
				};
			};
		};
		const app = p?.app;
		if (app?.ghostController?.sendShioriEvent && !script.includes("\\_q")) {
			// UKADOC: makoto トランスレータパイプラインおよび OnTranslate イベントへの転送
			const transRes = await app.ghostController.sendShioriEvent(
				"OnTranslate",
				[script],
			);
			if (transRes?.script?.trim()) {
				finalScript = transRes.script;
			}
		}
	} catch (_e) {
		// OnTranslate failure falls back to original script
	}
	return finalScript;
}
