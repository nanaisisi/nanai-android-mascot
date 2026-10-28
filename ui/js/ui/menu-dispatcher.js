/**
 * コンテキストメニューのアクション送出およびスコープ管理
 */
import { emit, invoke, isTauriAvailable } from "../core/tauri-helper.js";

export class MenuDispatcher {
	constructor() {
		const urlParams = new URLSearchParams(globalThis.location.search);
		this.currentScope = parseInt(urlParams.get("scope") || "0", 10);
		this.setScope(this.currentScope);
	}

	setScope(scope) {
		this.currentScope = scope;
		if (scope > 0) {
			document.body.classList.add("subchar-mode");
		} else {
			document.body.classList.remove("subchar-mode");
		}
	}

	async dispatchAction(action, payload = null) {
		if (!action) return;
		console.log(
			`Context Menu Action: ${action}`,
			payload || "",
			`Scope: ${this.currentScope}`,
		);

		// アクションに scope 情報を付与（payloadがオブジェクトの場合は合成、プリミティブの場合はラップ）
		let finalPayload = payload;
		if (finalPayload === null || finalPayload === undefined) {
			finalPayload = { scope: this.currentScope };
		} else if (
			typeof finalPayload === "object" &&
			!Array.isArray(finalPayload)
		) {
			finalPayload = { scope: this.currentScope, ...finalPayload };
		}

		// iframe 環境の場合
		if (globalThis.parent && globalThis.parent !== globalThis) {
			globalThis.parent.postMessage(
				{
					type: "menu-action",
					action: action,
					payload: finalPayload,
					timestamp: Date.now(),
				},
				"*",
			);
		}

		// 独立ウィンドウ（WebviewWindow）環境の場合
		if (isTauriAvailable()) {
			try {
				await emit("menu-action", { action, payload: finalPayload });
				if (action !== "request-sync") {
					await invoke("hide_menu_window");
				}
			} catch (error) {
				console.error("メニューアクションの送信に失敗しました:", error);
			}
		}
	}
}
