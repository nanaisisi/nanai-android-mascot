/**
 * さくらスクリプトの \! 拡張コマンドおよび入力ボックス (\![open,inputbox]) ハンドラ
 */
export class SakuraCommandHandler {
	/**
	 * @param {import('./sakura-script.js').SakuraScriptPlayer} player
	 */
	constructor(player) {
		this.player = player;
		this.app = player.app;
	}

	/**
	 * \![...] 内部コマンドの実行
	 */
	async runCommand(args) {
		const rawCmd = (args[0] ?? "").toLowerCase();
		const rawSub = (args[1] ?? "").toLowerCase();

		if (rawCmd === "open" && rawSub === "inputbox") {
			this.openInputBox(args.slice(2));
		} else if (rawCmd === "open" && rawSub === "teachbox") {
			// \![open,teachbox] — OnTeachStart → OnTeach / OnTeachInputCancel (UKADOC 準拠)
			this.openTeachBox(args.slice(2));
		} else if (rawCmd === "close" && rawSub === "teachbox") {
			// \![close,teachbox] — OnTeachInputCancel を発生させない
			this.closeTeachBox();
		} else if (rawCmd === "open" && rawSub === "dressupexplorer") {
			// \![open,dressupexplorer] — 着せ替えメニューを開く (UKADOC準拠)
			this.app.toggleMenu?.();
		} else if (rawCmd === "raise") {
			// \![raise,EventName,Ref0,Ref1...]
			const eventName = args[1];
			if (eventName) {
				await this.app.ghostController.sendShioriEvent(
					eventName,
					args.slice(2),
				);
			}
		} else if (rawCmd === "bind" || rawCmd === "bind-noevent") {
			// \![bind,category,part,status]
			const [category, part, statusVal] = args.slice(1);
			await this.app.surfaceManager?.bindDressup(
				category,
				part,
				statusVal,
				this.player.currentScope,
				rawCmd !== "bind-noevent",
			);
		} else if (rawCmd === "anim") {
			// \![anim,pause,ID] / \![anim,resume,ID] (SSP: 「pouse」表記ゆれも受付)
			const [verbRaw, idVal] = args.slice(1);
			const animId = Number.parseInt(String(idVal ?? ""), 10);
			const verb = String(verbRaw ?? "").toLowerCase();
			if (Number.isFinite(animId)) {
				const sm = this.app.surfaceManager;
				if (verb === "pause" || verb === "pouse") {
					sm?.pauseAnimationById(animId, this.player.currentScope);
				} else if (verb === "resume") {
					sm?.resumeAnimationById(animId, this.player.currentScope);
				}
			}
		} else if (rawCmd === "set" && rawSub === "alignmenttodesktop") {
			await this.setAlignmentToDesktop(args[2]);
		} else if (rawCmd === "windowstate") {
			const state = args[1];
			if (state) {
				await this.handleWindowState(state);
			}
		} else if (rawCmd === "change") {
			const [target, name] = args.slice(1);
			if (target === "ghost" && name) {
				await this.app.ghostController?.switchGhost?.(name);
			}
		} else if (rawCmd === "call") {
			const [target, name] = args.slice(1);
			if (target === "ghost" && name) {
				await this.app.ghostController?.callGhost?.(name);
			}
		} else if (rawCmd === "update" || rawCmd === "updatebymyself") {
			await this.app.startNetworkUpdate?.();
		} else {
			console.debug("未対応の \\! コマンド:", args);
		}
	}

	async handleWindowState(state) {
		try {
			const api = globalThis.__TAURI__?.window;
			if (!api) return;
			const win = api.getCurrentWindow();
			const lower = state.toLowerCase();
			if (lower === "stayontop") {
				await win.setAlwaysOnTop(true);
			} else if (lower === "!stayontop") {
				await win.setAlwaysOnTop(false);
			} else if (lower === "minimize") {
				await win.minimize();
			}
		} catch (e) {
			console.warn("windowstate 失敗:", e);
		}
	}

	/**
	 * \![open,inputbox,ID,...] の処理 (UKADOC準拠)
	 */
	openInputBox(params) {
		const id = params[0] || "UserInput";
		let timeoutMs = 0;
		let defaultText = "";
		let placeholder = "";

		for (let i = 1; i < params.length; i++) {
			const p = params[i] ?? "";
			if (p.startsWith("--timeout=")) {
				timeoutMs = Number.parseInt(p.replace("--timeout=", ""), 10) || 0;
			} else if (p.startsWith("--text=")) {
				defaultText = p.replace("--text=", "");
			} else if (p.startsWith("--placeholder=")) {
				placeholder = p.replace("--placeholder=", "");
			} else if (i === 1 && !p.startsWith("--")) {
				timeoutMs = Number.parseInt(p, 10) || 0;
			} else if (i === 2 && !p.startsWith("--")) {
				defaultText = p;
			}
		}

		const balloon =
			this.player.currentScope === 1
				? this.app.elements.keroBalloonText
				: this.app.elements.balloonText;
		if (!balloon) return;

		const form = document.createElement("div");
		form.className = "balloon-inputbox-form";
		form.style.marginTop = "0.5rem";
		form.style.display = "flex";
		form.style.gap = "0.25rem";

		const input = document.createElement("input");
		input.type = "text";
		input.className = "balloon-input";
		input.value = defaultText;
		input.placeholder = placeholder;
		input.style.flex = "1";
		input.style.fontSize = "0.8rem";
		input.style.padding = "0.2rem 0.4rem";
		input.style.borderRadius = "0.25rem";
		input.style.border = "1px solid var(--balloon-border-color, #888)";
		input.style.background = "var(--balloon-bg, #fff)";
		input.style.color = "var(--balloon-text-color, #000)";

		const submitBtn = document.createElement("button");
		submitBtn.textContent = "OK";
		submitBtn.className = "balloon-choice-btn";
		submitBtn.style.marginTop = "0";

		let timer = null;
		const cleanup = () => {
			if (timer) clearTimeout(timer);
			form.remove();
		};

		const submit = async () => {
			const val = input.value;
			cleanup();
			if (id.startsWith("On")) {
				await this.app.ghostController.sendShioriEvent(id, [val]);
			} else {
				await this.app.ghostController.sendShioriEvent("OnUserInput", [
					id,
					val,
				]);
			}
		};

		const cancel = async () => {
			cleanup();
			await this.app.ghostController.sendShioriEvent("OnUserInputCancel", [id]);
		};

		submitBtn.addEventListener("click", (e) => {
			e.stopPropagation();
			submit();
		});

		input.addEventListener("keydown", (e) => {
			if (e.key === "Enter") {
				e.stopPropagation();
				submit();
			} else if (e.key === "Escape") {
				e.stopPropagation();
				cancel();
			}
		});

		form.appendChild(input);
		form.appendChild(submitBtn);
		balloon.appendChild(form);
		setTimeout(() => input.focus(), 50);

		if (timeoutMs > 0) {
			timer = setTimeout(() => {
				cleanup();
				this.app.ghostController.sendShioriEvent("OnUserInputCancel", [id]);
			}, timeoutMs);
		}
	}

	/**
	 * `\![open,teachbox]` の処理 (UKADOC準拠)
	 *
	 * オープン時に OnTeachStart を送出し、OK で OnTeach（入力履歴 Reference0..）、
	 * 閉じる/キャンセルで OnTeachInputCancel（Reference0=空席, Reference1=cancel）。
	 * 311 (Not Enough) / 312 (Advice) による再オープン時は notifyStart を外して呼ぶ。
	 * @param {string[]} [params]
	 * @param {{ notifyStart?: boolean }} [options]
	 */
	openTeachBox(params = [], options = {}) {
		const { notifyStart = true } = options;
		// 既存の teachbox を無音で閉じる
		this.closeTeachBox();
		if (this.teachForm) return;

		if (notifyStart) {
			this.app.ghostController?.sendShioriEvent("OnTeachStart").catch(() => {});
		}

		let defaultText = "";
		for (const p of params.slice(1)) {
			if (typeof p === "string" && p.startsWith("--text=")) {
				defaultText = p.replace("--text=", "");
			}
		}

		const balloon =
			this.player.currentScope === 1
				? this.app.elements.keroBalloonText
				: this.app.elements.balloonText;
		if (!balloon) return;

		const form = document.createElement("div");
		form.className = "balloon-inputbox-form";
		form.style.marginTop = "0.5rem";
		form.style.display = "flex";
		form.style.gap = "0.25rem";

		const input = document.createElement("input");
		input.type = "text";
		input.className = "balloon-input";
		input.value = defaultText;
		input.placeholder = "教えて";
		input.style.flex = "1";
		input.style.fontSize = "0.8rem";
		input.style.padding = "0.2rem 0.4rem";
		input.style.borderRadius = "0.25rem";
		input.style.border = "1px solid var(--balloon-border-color, #888)";
		input.style.background = "var(--balloon-bg, #fff)";
		input.style.color = "var(--balloon-text-color, #000)";

		const submitBtn = document.createElement("button");
		submitBtn.textContent = "OK";
		submitBtn.className = "balloon-choice-btn";
		submitBtn.style.marginTop = "0";

		this.teachForm = form;

		const cleanup = () => {
			form.remove();
			this.teachForm = null;
		};

		const submit = async () => {
			const val = input.value;
			cleanup();
			this.app.ghostController?.sendTeachInput?.(val);
		};

		const cancel = async () => {
			cleanup();
			// Reference0: 空席 (OnUserInputCancel と番号を揃える) / Reference1: cancel
			await this.app.ghostController?.sendShioriEvent("OnTeachInputCancel", [
				"",
				"cancel",
			]);
			this.app.ghostController?.clearTeachHistory?.();
		};

		submitBtn.addEventListener("click", (e) => {
			e.stopPropagation();
			submit();
		});

		input.addEventListener("keydown", (e) => {
			if (e.key === "Enter") {
				e.stopPropagation();
				submit();
			} else if (e.key === "Escape") {
				e.stopPropagation();
				cancel();
			}
		});

		form.appendChild(input);
		form.appendChild(submitBtn);
		balloon.appendChild(form);
		setTimeout(() => input.focus(), 50);
	}

	/**
	 * `\![close,teachbox]` の処理 (UKADOC準拠)
	 *
	 * OnTeachInputCancel を発生させずに閉じる。開いてない場合は無視される。
	 */
	closeTeachBox() {
		if (this.teachForm) {
			this.teachForm.remove();
			this.teachForm = null;
		}
	}

	/**
	 * ウィンドウをデスクトップの端に揃える (free / top / bottom / left / right)
	 */
	async setAlignmentToDesktop(mode) {
		this.app.alignmentToDesktop = mode;
		if (mode === "free") return; // 自由配置: 何もしない
		try {
			const api = globalThis.__TAURI__?.window;
			if (!api) return;
			const win = api.getCurrentWindow();
			const monitor = await api.currentMonitor();
			if (!monitor) return;
			const size = await win.outerSize();
			const pos = await win.outerPosition();
			const { x: mx, y: my } = monitor.position;
			const { width: mw, height: mh } = monitor.size;
			let x = pos.x;
			let y = pos.y;
			if (mode === "bottom") y = my + mh - size.height;
			else if (mode === "top") y = my;
			else if (mode === "left") x = mx;
			else if (mode === "right") x = mx + mw - size.width;
			await win.setPosition(new api.PhysicalPosition(x, y));
		} catch (e) {
			console.warn("alignmenttodesktop 失敗:", e);
		}
	}
}
