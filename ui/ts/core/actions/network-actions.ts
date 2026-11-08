import { invoke, isTauriAvailable } from "../tauri-helper.js";

export const networkActions = {
	/**
	 * メールチェック (UKADOC OnBIFF 準拠)
	 */
	async checkEmail(accountName: string = "default") {
<<<<<<< HEAD
		const gc = (this as unknown).ghostController;
		console.log(`📬 メールチェック開始 (OnBIFF): account=${accountName}`);
		(this as unknown).showBalloon?.("📬 メールを確認中...");
=======
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		const gc = (this as any).ghostController;
		console.log(`📬 メールチェック開始 (OnBIFF): account=${accountName}`);
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		(this as any).showBalloon?.("📬 メールを確認中...");
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad

		try {
			await gc.sendShioriEvent("OnBIFFBegin", [accountName]);

			if (isTauriAvailable()) {
<<<<<<< HEAD
				const result: unknown = await invoke("check_email", {
=======
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				const _result: any = await invoke("check_email", {
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
					account: accountName,
				}).catch(() => null);
				if (result && typeof result === "object") {
					const count = Number(result.count || 0);
					const size = Number(result.size || 0);
					const unread = Number(result.unread || 0);
					if (result.headers && Array.isArray(result.headers)) {
						await gc.sendShioriEvent("OnBIFF2Complete", [
							String(count),
							String(size),
							accountName,
							String(unread),
							result.headers.join("\x01"),
						]);
					} else {
						await gc.sendShioriEvent("OnBIFFComplete", [
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
			await gc.sendShioriEvent("OnBIFFComplete", ["0", "0", accountName, "0"]);
		} catch (err) {
			console.warn("OnBIFF 失敗:", err);
			await gc.sendShioriEvent("OnBIFFFailure", ["connect", accountName]);
		}
	},
};
