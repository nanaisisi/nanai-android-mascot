/**
 * コンテキストメニューのアクション送出およびスコープ管理
 */
import { emit, invoke, isTauriAvailable } from "../core/tauri-helper.js";

export class MenuDispatcher {
	currentScope: number;

	constructor() {
		const urlParams = new URLSearchParams(globalThis.location.search);
		this.currentScope = parseInt(urlParams.get("scope") || "0", 10);
		this.setScope(this.currentScope);
	}

	setScope(scope: number) {
		this.currentScope = scope;
		if (scope > 0) {
			document.body.classList.add("subchar-mode");
		} else {
			document.body.classList.remove("subchar-mode");
		}
	}

	async dispatchAction(action: string, payload: any = null) {
		if (!action) return;
		console.log(
			`Context Menu Action: ${action}`,
			payload || "",
			`Scope: ${this.currentScope}`,
		);

		let finalPayload = payload;
		if (finalPayload === null || finalPayload === undefined) {
			finalPayload = { scope: this.currentScope };
		} else if (
			typeof finalPayload === "object" &&
			!Array.isArray(finalPayload)
		) {
			finalPayload = { scope: this.currentScope, ...finalPayload };
		}

		if (globalThis.parent && (globalThis.parent as any) !== globalThis) {
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
