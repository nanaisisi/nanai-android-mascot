import { invoke, isTauriAvailable } from "../tauri-helper.js";

export const networkActions = {
	/**
	 * メールチェック (UKADOC OnBIFF 準拠)
	 */
	async checkEmail(accountName: string = "default") {
		const gc = (
			this as {
				ghostController?: {
					sendShioriEvent: (event: string, args: string[]) => Promise<unknown>;
				};
			}
		).ghostController;
		console.log(`📬 メールチェック開始 (OnBIFF): account=${accountName}`);
		(this as { showBalloon?: (msg: string) => void }).showBalloon?.(
			"📬 メールを確認中...",
		);

		try {
			await gc?.sendShioriEvent("OnBIFFBegin", [accountName]);

			if (isTauriAvailable()) {
				const result = await invoke<Record<string, unknown> | null>(
					"check_email",
					{
						account: accountName,
					},
				).catch(() => null);
				if (result && typeof result === "object") {
					const count = Number(result.count || 0);
					const size = Number(result.size || 0);
					const unread = Number(result.unread || 0);
					if (result.headers && Array.isArray(result.headers)) {
						await gc?.sendShioriEvent("OnBIFF2Complete", [
							String(count),
							String(size),
							accountName,
							String(unread),
							(result.headers as string[]).join("\x01"),
						]);
					} else {
						await gc?.sendShioriEvent("OnBIFFComplete", [
							String(count),
							String(size),
							accountName,
							String(unread),
						]);
					}
					return;
				}
			}

			await new Promise((r) => setTimeout(r, 600));
			await gc?.sendShioriEvent("OnBIFFComplete", ["0", "0", accountName, "0"]);
		} catch (err) {
			console.warn("OnBIFF 失敗:", err);
			await gc?.sendShioriEvent("OnBIFFFailure", ["connect", accountName]);
		}
	},
};
