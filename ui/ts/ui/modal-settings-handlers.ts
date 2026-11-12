import { invoke, isTauriAvailable } from "../core/tauri-helper.js";
import type { AppModalTarget, ModalManager } from "./modal.js";

/**
 * 設定・プラグイン・デバッグ用のモーダルハンドラ
 */
export class ModalSettingsHandlers {
	manager: ModalManager;
	app: AppModalTarget | null;

	constructor(manager: ModalManager) {
		this.manager = manager;
		this.app = manager.app;
	}

	setupSettingsListeners() {
		const form = {
			autoLoad: document.getElementById(
				"auto-load-ghost",
			) as HTMLInputElement | null,
			darkMode: document.getElementById("dark-mode") as HTMLInputElement | null,
			shellScale: document.getElementById("shell-scale") as
				| HTMLSelectElement
				| HTMLInputElement
				| null,
			balloonScale: document.getElementById("balloon-scale") as
				| HTMLSelectElement
				| HTMLInputElement
				| null,
			saveBtn: document.getElementById("save-settings-btn"),
			resetBtn: document.getElementById("reset-settings-btn"),
		};

		if (form.autoLoad && this.app) {
			form.autoLoad.checked = Boolean(this.app.settings?.autoLoadGhost);
		}
		if (form.darkMode && this.app) {
			form.darkMode.checked = Boolean(this.app.settings?.darkMode);
		}
		if (form.shellScale && this.app) {
			form.shellScale.value =
				(this.app.settings?.shellScale as string) || "100";
		}
		if (form.balloonScale && this.app) {
			form.balloonScale.value =
				(this.app.settings?.balloonScale as string) || "100";
		}

		const overlayBtn = document.getElementById("open-overlay-settings-btn");
		overlayBtn?.addEventListener("click", async () => {
			if (isTauriAvailable()) {
				try {
					await invoke("request_overlay_permission");
				} catch (_e) {
					this.manager.showNotification(
						"Android 設定案内",
						"Androidの『設定』→『アプリ』→『特別なアプリアクセス』→『他のアプリの上に重ねて表示』から Nanai Mascot を許可してください。",
					);
				}
			} else {
				this.manager.showNotification(
					"Android 設定案内",
					"Android環境で実行時に『他のアプリの上に重ねて表示（SYSTEM_ALERT_WINDOW）』設定画面へ案内されます。",
				);
			}
		});

		form.saveBtn?.addEventListener("click", () => {
			if (this.app) {
				this.app.settings = {
					...this.app.settings,
					autoLoadGhost: form.autoLoad?.checked ?? true,
					darkMode: form.darkMode?.checked ?? false,
					shellScale: form.shellScale?.value ?? "100",
					balloonScale: form.balloonScale?.value ?? "100",
				};

				localStorage.setItem(
					"nanai-android-mascot-settings",
					JSON.stringify(this.app.settings),
				);
				this.app.applySettings?.();
				this.app.showBalloon?.("設定を保存しました。");
				setTimeout(() => this.app?.hideBalloon?.(), 2000);
			}
			this.manager.hide();
		});

		form.resetBtn?.addEventListener("click", () => {
			if (confirm("設定を初期値に戻しますか？")) {
				localStorage.removeItem("nanai-android-mascot-settings");
				if (this.app) {
					this.app.settings = {
						autoLoadGhost: true,
						enableNotifications: true,
						darkMode: false,
						alwaysOnTop: true,
						shellScale: "100",
						balloonScale: "100",
						debugLevel: "info",
					};
					this.app.applySettings?.();
				}
				if (form.autoLoad) form.autoLoad.checked = true;
				if (form.darkMode) form.darkMode.checked = false;
				if (form.shellScale) form.shellScale.value = "100";
				if (form.balloonScale) form.balloonScale.value = "100";
				this.app?.showBalloon?.("設定を初期化しました。");
				setTimeout(() => this.app?.hideBalloon?.(), 2000);
			}
		});

		const helpBtn = document.getElementById("config-help-btn");
		helpBtn?.addEventListener("click", () => {
			this.app?.ghostController?.sendShioriEvent?.(
				"OnConfigurationDialogHelp",
				["settings"],
			);
		});
	}

	setupPluginListeners() {
		const addBtn = document.getElementById("add-plugin-btn");
		addBtn?.addEventListener("click", () => {
			this.manager.showNotification(
				"プラグイン管理",
				"プラグイン（.js / WASM）の追加は、`plugins/` ディレクトリにフォルダを配置することで自動認識されます。",
			);
		});

		const pluginItems = document.querySelectorAll("#plugin-list .ghost-item");
		pluginItems.forEach((item) => {
			item.addEventListener("click", () => {
				const isActive = item.classList.toggle("active");
				const title = item.querySelector("strong")?.textContent || "プラグイン";
				this.app?.showBalloon?.(
					`${title} を${isActive ? "有効化" : "無効化"}しました。`,
				);
				setTimeout(() => this.app?.hideBalloon?.(), 1500);
			});
		});
	}

	setupDebugListeners() {
		document.getElementById("clear-logs")?.addEventListener("click", () => {
			const output = document.getElementById("log-output");
			if (output)
				output.innerHTML =
					'<div class="log-entry info">ログをクリアしました</div>';
		});

		document.getElementById("export-logs")?.addEventListener("click", () => {
			const output = document.getElementById("log-output");
			const text = output?.textContent || "";
			const blob = new Blob([text], { type: "text/plain" });
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `nanai-android-mascot-debug-${Date.now()}.txt`;
			a.click();
			URL.revokeObjectURL(url);
		});
	}
}
