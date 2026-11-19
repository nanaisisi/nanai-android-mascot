import {
	emit,
	invoke,
	isNativeMultiWindow,
	isSinglePageUi,
	isTauriAvailable,
} from "./tauri-helper.js";

export const settingsMethods = {
	loadSettings() {
		const app =
			this as unknown as import("../../main.js").NanaiAndroidMascotApp;
		try {
			const saved = localStorage.getItem("nanai-android-mascot-settings");
			if (saved) {
				const parsed = JSON.parse(saved) as Record<string, unknown>;
				app.settings = {
					...app.settings,
					...parsed,
				};
			}
		} catch (_error) {
			// 設定未保存またはパース失敗時はデフォルト維持
		}

		// デバッグビルド時・開発環境判定: 明示的未設定時はデフォルトで開発者機能を標準ON
		const isDevEnvironment =
			isTauriAvailable() ||
			(typeof location !== "undefined" &&
				(location.hostname === "localhost" ||
					location.hostname === "127.0.0.1"));

		if (
			isDevEnvironment &&
			(app.settings as Record<string, unknown>)?.developerModeEnabled ===
				undefined
		) {
			app.settings = {
				...app.settings,
				developerModeEnabled: true,
				devModeEnabled: true,
				showCollisionArea: false,
			};
		}
	},

	applySettings() {
		const app =
			this as unknown as import("../../main.js").NanaiAndroidMascotApp;

		// ダークモード設定の適用 (OS自動/ダーク/ライト)
		const dmOpt =
			(app.settings?.darkModeOpt as string) ||
			(app.settings?.darkMode ? "dark" : "auto");
		let isDark = false;
		if (dmOpt === "dark") {
			isDark = true;
		} else if (dmOpt === "light") {
			isDark = false;
		} else if (
			typeof window !== "undefined" &&
			typeof window.matchMedia === "function"
		) {
			isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
		}
		if (typeof document !== "undefined" && document.body) {
			document.body.classList.toggle("dark-mode", isDark);
			document.documentElement?.setAttribute(
				"data-theme",
				isDark ? "dark" : "light",
			);
		}

		// シェル倍率 (50%〜200%)
		const shellScaleVal =
			(app.settings?.shellScale as string | number) ?? "100";
		const scalePercent = parseInt(String(shellScaleVal), 10) || 100;
		const ghostDisplay = app.elements?.ghostDisplay;
		if (ghostDisplay) {
			ghostDisplay.style.width = `${Math.round((200 * scalePercent) / 100)}px`;
			ghostDisplay.style.height = `${Math.round((400 * scalePercent) / 100)}px`;
		}
		if (isTauriAvailable()) {
			invoke("set_character_scale", { scalePercent }).catch(() => {});
		}

		// バルーン倍率
		const balloonScaleVal =
			(app.settings?.balloonScale as string | number) ?? "100";
		const balloonPercent = parseInt(String(balloonScaleVal), 10) || 100;
		const balloonDisplay = app.elements?.balloonDisplay;
		if (balloonDisplay) {
			balloonDisplay.style.transform = `translateX(-50%) scale(${balloonPercent / 100})`;
			balloonDisplay.style.transformOrigin = "top left";
		}

		app.applyBalloonTheme?.();
	},

	applyBalloonTheme() {
		const app =
			this as unknown as import("../../main.js").NanaiAndroidMascotApp;
		let savedBalloonTheme: string | null = null;
		try {
			const raw =
				typeof localStorage !== "undefined"
					? localStorage.getItem("nanai_balloon_theme")
					: null;
			if (raw && !raw.trim().startsWith("{")) {
				savedBalloonTheme = raw.trim();
			}
		} catch (_e) {}
		app.setBalloonTheme?.(
			(app.settings?.balloonTheme as string) ||
				savedBalloonTheme ||
				(app.currentBalloonTheme && app.currentBalloonTheme !== "default"
					? app.currentBalloonTheme
					: null) ||
				"default",
		);
	},

	showBalloon(text: string, scopeId: number = 0) {
		if (String(text ?? "").trim().length === 0) {
			this.hideBalloon(scopeId, "silent");
			return;
		}
		const app =
			this as unknown as import("../../main.js").NanaiAndroidMascotApp;
		const getDocEl = (id: string) =>
			typeof document !== "undefined" &&
			typeof document.getElementById === "function"
				? document.getElementById(id)
				: null;
		const balloonText =
			scopeId === 0
				? app.elements?.balloonText || getDocEl("balloon-text")
				: scopeId === 1
					? app.elements?.keroBalloonText || getDocEl("kero-balloon-text")
					: getDocEl(`char-balloon-text-${scopeId}`) ||
						app.elements?.balloonText ||
						getDocEl("balloon-text");
		const balloonDisplay =
			scopeId === 0
				? app.elements?.balloonDisplay || getDocEl("balloon-display")
				: scopeId === 1
					? app.elements?.keroBalloonDisplay || getDocEl("kero-balloon-display")
					: getDocEl(`char-balloon-display-${scopeId}`) ||
						app.elements?.balloonDisplay ||
						getDocEl("balloon-display");
		const slotEl =
			scopeId === 0
				? app.elements?.sakuraSlot || getDocEl("sakura-slot")
				: scopeId === 1
					? app.elements?.keroSlot || getDocEl("kero-slot")
					: getDocEl(`char-slot-${scopeId}`);

		if (balloonText) {
			balloonText.textContent = text;
		}
		if (balloonDisplay && isSinglePageUi()) {
			balloonDisplay.style.display = "block";
		}
		if (slotEl) {
			slotEl.style.display = "block";
		}
		if (isNativeMultiWindow()) {
			const activeTheme = app.currentBalloonTheme || "default";
			invoke("show_balloon_window", {
				params: { scopeId, theme: activeTheme },
				scope_id: scopeId,
				scopeId,
				theme: activeTheme,
			})
				.then(() => {
					emit(`update-balloon-content-${scopeId}`, {
						html: balloonText?.innerHTML || text,
						theme: activeTheme,
					});
				})
				.catch(() => {});
		}
	},

	hideBalloon(
		scopeId: number = 0,
		reason: "close" | "break" | "timeout" | "silent" = "close",
	) {
		const app =
			this as unknown as import("../../main.js").NanaiAndroidMascotApp;
		const getDocEl = (id: string) =>
			typeof document !== "undefined" &&
			typeof document.getElementById === "function"
				? document.getElementById(id)
				: null;
		const balloonDisplay =
			scopeId === 0
				? app.elements?.balloonDisplay || getDocEl("balloon-display")
				: scopeId === 1
					? app.elements?.keroBalloonDisplay || getDocEl("kero-balloon-display")
					: getDocEl(`char-balloon-display-${scopeId}`) ||
						app.elements?.balloonDisplay ||
						getDocEl("balloon-display");
		const balloonText =
			scopeId === 0
				? app.elements?.balloonText || getDocEl("balloon-text")
				: scopeId === 1
					? app.elements?.keroBalloonText || getDocEl("kero-balloon-text")
					: getDocEl(`char-balloon-text-${scopeId}`) ||
						app.elements?.balloonText ||
						getDocEl("balloon-text");
		if (balloonText) {
			balloonText.innerHTML = "";
			balloonText.textContent = "";
		}
		if (balloonDisplay && isSinglePageUi()) {
			balloonDisplay.style.display = "none";
		}
		if (isNativeMultiWindow()) {
			invoke("hide_balloon_window", {
				params: { scope_id: scopeId },
				scope_id: scopeId,
				scopeId,
			}).catch(() => {});
			emit(`update-balloon-content-${scopeId}`, {
				html: "",
				theme: app.currentBalloonTheme || "default",
			}).catch(() => {});
		}
		if (reason === "close") {
			const lastScript = app.sakuraPlayer?.lastScript || "";
			const gc = app.ghostController;
			if (gc?.sendBalloonCloseNotify) {
				void gc.sendBalloonCloseNotify(lastScript, scopeId);
			} else if (gc?.sendShioriEvent) {
				void gc.sendShioriEvent("OnBalloonClose", [
					lastScript,
					String(scopeId),
				]);
			}
		} else if (reason === "break") {
			const lastScript = app.sakuraPlayer?.lastScript || "";
			const gc = app.ghostController;
			if (gc?.sendBalloonBreakNotify) {
				void gc.sendBalloonBreakNotify(lastScript, scopeId);
			} else if (gc?.sendShioriEvent) {
				void gc.sendShioriEvent("OnBalloonBreak", [
					lastScript,
					String(scopeId),
				]);
			}
		}
	},

	playSakuraScript(script: string) {
		const app =
			this as unknown as import("../../main.js").NanaiAndroidMascotApp;
		return app.sakuraPlayer?.play?.(script);
	},

	startSecondTimer() {
		document.addEventListener("visibilitychange", () => {
			if (document.visibilityState === "visible") {
				const app =
					this as unknown as import("../../main.js").NanaiAndroidMascotApp;
				void app.ghostController?.sendShioriEvent?.("OnWindowStateRestore");
			}
		});
	},
};
