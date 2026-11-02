/**
 * @file modal-dialog-controller.js
 * @brief さくらスクリプトおよびUIからの各種ダイアログ（inputbox, passwordinput, textareabox, sliderinput, teachbox, communicatebox, 選択肢リスト）を統括管理するコントローラー
 */

export class ModalDialogController {
	/**
	 * @param {object} options
	 * @param {object} options.app アプリケーションインスタンス
	 * @param {object} [options.player] さくらスクリプトプレイヤー
	 */
	constructor({ app, player = null }) {
		this.app = app;
		this.player = player;
		/** @type {Map<string, { id?: string, type?: string, form: HTMLElement, cleanup: (force?: boolean) => void }>} */
		this.activeBoxes = new Map();
		this.choiceTimeoutTimer = null;
	}

	/**
	 * 対象のバルーンテキスト要素を取得
	 * @param {number} [scope]
	 * @returns {HTMLElement|null}
	 */
	getBalloonContainer(scope = 0) {
		const targetScope =
			typeof scope === "number" ? scope : (this.player?.currentScope ?? 0);
		return targetScope === 1
			? this.app?.elements?.keroBalloonText
			: this.app?.elements?.balloonText;
	}

	/**
	 * 入力ボックスオプションのパース
	 * @param {string[]} params
	 * @returns {object}
	 */
	parseBoxOptions(params) {
		const id = params[0] || "UserInput";
		let timeoutMs = 0;
		let defaultText = "";
		let placeholder = "";
		let limit = 0;
		let noClose = false;
		let noClear = false;
		const references = [];

		for (let i = 1; i < params.length; i++) {
			const p = params[i] ?? "";
			if (typeof p !== "string") continue;

			if (p.startsWith("--timeout=")) {
				timeoutMs = Number.parseInt(p.replace("--timeout=", ""), 10) || 0;
			} else if (p.startsWith("--text=")) {
				defaultText = p.replace("--text=", "");
			} else if (p.startsWith("--placeholder=")) {
				placeholder = p.replace("--placeholder=", "");
			} else if (p.startsWith("--limit=")) {
				limit = Number.parseInt(p.replace("--limit=", ""), 10) || 0;
			} else if (p.startsWith("--reference=")) {
				references.push(p.replace("--reference=", ""));
			} else if (p.startsWith("--option=")) {
				const opt = p.replace("--option=", "").toLowerCase();
				if (opt.includes("noclose")) noClose = true;
				if (opt.includes("noclear")) noClear = true;
			} else if (i === 1 && !p.startsWith("--")) {
				timeoutMs = Number.parseInt(p, 10) || 0;
			} else if (i === 2 && !p.startsWith("--")) {
				defaultText = p;
			}
		}

		return {
			id,
			timeoutMs,
			defaultText,
			placeholder,
			limit,
			noClose,
			noClear,
			references,
		};
	}

	/**
	 * InputBox を開く (\![open,inputbox])
	 * @param {string[]} params
	 * @param {number} [scope]
	 * @param {boolean} [isPassword=false]
	 * @returns {HTMLElement|null}
	 */
	openInputBox(params, scope, isPassword = false) {
		const opts = this.parseBoxOptions(params);
		this.closeInputBox(opts.id);
		const balloon = this.getBalloonContainer(scope);
		if (!balloon) return null;

		const form = document.createElement("div");
		form.className = isPassword
			? "balloon-inputbox-form balloon-passwordinput-form"
			: "balloon-inputbox-form";
		form.style.marginTop = "0.5rem";
		form.style.display = "flex";
		form.style.gap = "0.25rem";

		const input = document.createElement("input");
		input.type = isPassword ? "password" : "text";
		input.className = "balloon-input";
		input.value = opts.defaultText;
		input.placeholder = opts.placeholder;
		if (opts.limit > 0) input.maxLength = opts.limit;
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
		const boxKey = `inputbox:${opts.id}`;

		const cleanup = (force = false) => {
			if (timer) {
				clearTimeout(timer);
				timer = null;
			}
			if (force || !opts.noClose) {
				form.remove();
				this.activeBoxes.delete(boxKey);
				if (this.activeBoxes.get("inputbox")?.form === form) {
					this.activeBoxes.delete("inputbox");
				}
			} else if (!opts.noClear) {
				input.value = "";
			}
		};

		const submit = async () => {
			const val = input.value;
			cleanup();
			if (opts.id.startsWith("On")) {
				await this.app.ghostController?.sendShioriEvent(opts.id, [
					val,
					"",
					...opts.references,
				]);
			} else {
				await this.app.ghostController?.sendShioriEvent("OnUserInput", [
					opts.id,
					val,
					"",
					...opts.references,
				]);
			}
		};

		const cancel = async (reason = "close") => {
			cleanup(true);
			await this.app.ghostController?.sendShioriEvent("OnUserInputCancel", [
				opts.id,
				reason,
				"",
				...opts.references,
			]);
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
				cancel("close");
			}
		});

		form.appendChild(input);
		form.appendChild(submitBtn);
		balloon.appendChild(form);
		setTimeout(() => input.focus?.(), 50);

		if (opts.timeoutMs > 0) {
			timer = setTimeout(() => {
				cancel("timeout");
			}, opts.timeoutMs);
		}

		const boxEntry = {
			id: opts.id,
			type: isPassword ? "passwordinput" : "inputbox",
			form,
			cleanup: () => cleanup(true),
		};
		this.activeBoxes.set(boxKey, boxEntry);
		this.activeBoxes.set("inputbox", boxEntry);
		return form;
	}

	/**
	 * PasswordInput を開く (\![open,passwordinput])
	 * @param {string[]} params
	 * @param {number} [scope]
	 * @returns {HTMLElement|null}
	 */
	openPasswordInput(params, scope) {
		return this.openInputBox(params, scope, true);
	}

	/**
	 * InputBox を閉じる (\![close,inputbox,ID])
	 * @param {string} [id]
	 */
	closeInputBox(id) {
		if (!id || id === "__SYSTEM_ALL_INPUT__") {
			for (const [key, box] of Array.from(this.activeBoxes.entries())) {
				if (
					key === "inputbox" ||
					key.startsWith("inputbox:") ||
					box.type === "inputbox" ||
					box.type === "passwordinput" ||
					box.type === "sliderinput"
				) {
					box.cleanup();
					this.activeBoxes.delete(key);
				}
			}
			return;
		}

		const targetKey = `inputbox:${id}`;
		const existing = this.activeBoxes.get(targetKey);
		if (existing) {
			existing.cleanup();
			this.activeBoxes.delete(targetKey);
		} else {
			const fallback = this.activeBoxes.get("inputbox");
			if (fallback && fallback.id === id) {
				fallback.cleanup();
				this.activeBoxes.delete("inputbox");
			}
		}
	}

	/**
	 * TextAreaBox を開く (\![open,textareabox])
	 * @param {string[]} params
	 * @param {number} [scope]
	 * @returns {HTMLElement|null}
	 */
	openTextAreaBox(params, scope) {
		const opts = this.parseBoxOptions(params);
		this.closeTextAreaBox(opts.id);
		const balloon = this.getBalloonContainer(scope);
		if (!balloon) return null;

		const form = document.createElement("div");
		form.className = "balloon-inputbox-form balloon-textareabox-form";
		form.style.marginTop = "0.5rem";
		form.style.display = "flex";
		form.style.flexDirection = "column";
		form.style.gap = "0.25rem";

		const textarea = document.createElement("textarea");
		textarea.className = "balloon-input balloon-textarea";
		// \1 を改行に置換して初期表示
		textarea.value = opts.defaultText.replace(/\\1/g, "\n");
		textarea.placeholder = opts.placeholder.replace(/\\1/g, "\n");
		if (opts.limit > 0) textarea.maxLength = opts.limit;
		textarea.rows = 3;
		textarea.style.width = "100%";
		textarea.style.boxSizing = "border-box";
		textarea.style.fontSize = "0.8rem";
		textarea.style.padding = "0.2rem 0.4rem";
		textarea.style.borderRadius = "0.25rem";
		textarea.style.border = "1px solid var(--balloon-border-color, #888)";
		textarea.style.background = "var(--balloon-bg, #fff)";
		textarea.style.color = "var(--balloon-text-color, #000)";

		const submitBtn = document.createElement("button");
		submitBtn.textContent = "OK";
		submitBtn.className = "balloon-choice-btn";
		submitBtn.style.alignSelf = "flex-end";
		submitBtn.style.marginTop = "0";

		let timer = null;
		const boxKey = `textareabox:${opts.id}`;

		const cleanup = (force = false) => {
			if (timer) {
				clearTimeout(timer);
				timer = null;
			}
			if (force || !opts.noClose) {
				form.remove();
				this.activeBoxes.delete(boxKey);
				if (this.activeBoxes.get("textareabox")?.form === form) {
					this.activeBoxes.delete("textareabox");
				}
			} else if (!opts.noClear) {
				textarea.value = "";
			}
		};

		const submit = async () => {
			const val = textarea.value.replace(/\r?\n/g, "\u0001");
			cleanup();
			if (opts.id.startsWith("On")) {
				await this.app.ghostController?.sendShioriEvent(opts.id, [
					val,
					"",
					...opts.references,
				]);
			} else {
				await this.app.ghostController?.sendShioriEvent("OnTextAreaInput", [
					opts.id,
					val,
					"",
					...opts.references,
				]);
			}
		};

		const cancel = async (reason = "close") => {
			const currentVal = textarea.value.replace(/\r?\n/g, "\u0001");
			cleanup(true);
			await this.app.ghostController?.sendShioriEvent("OnTextAreaInputCancel", [
				opts.id,
				reason,
				currentVal,
				...opts.references,
			]);
		};

		submitBtn.addEventListener("click", (e) => {
			e.stopPropagation();
			submit();
		});

		textarea.addEventListener("keydown", (e) => {
			if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
				e.stopPropagation();
				submit();
			} else if (e.key === "Escape") {
				e.stopPropagation();
				cancel("close");
			}
		});

		form.appendChild(textarea);
		form.appendChild(submitBtn);
		balloon.appendChild(form);
		setTimeout(() => textarea.focus?.(), 50);

		if (opts.timeoutMs > 0) {
			timer = setTimeout(() => {
				cancel("timeout");
			}, opts.timeoutMs);
		}

		const boxEntry = {
			id: opts.id,
			type: "textareabox",
			form,
			cleanup: () => cleanup(true),
		};
		this.activeBoxes.set(boxKey, boxEntry);
		this.activeBoxes.set("textareabox", boxEntry);
		return form;
	}

	/**
	 * TextAreaBox を閉じる (\![close,textareabox,ID])
	 * @param {string} [id]
	 */
	closeTextAreaBox(id) {
		if (!id || id === "__SYSTEM_ALL_INPUT__") {
			for (const [key, box] of Array.from(this.activeBoxes.entries())) {
				if (
					key === "textareabox" ||
					key.startsWith("textareabox:") ||
					box.type === "textareabox"
				) {
					box.cleanup();
					this.activeBoxes.delete(key);
				}
			}
			return;
		}

		const targetKey = `textareabox:${id}`;
		const existing = this.activeBoxes.get(targetKey);
		if (existing) {
			existing.cleanup();
			this.activeBoxes.delete(targetKey);
		} else {
			const fallback = this.activeBoxes.get("textareabox");
			if (fallback && fallback.id === id) {
				fallback.cleanup();
				this.activeBoxes.delete("textareabox");
			}
		}
	}

	/**
	 * SliderInput を開く (\![open,sliderinput,ID,timeout,current,min,max,options])
	 * @param {string[]} params
	 * @param {number} [scope]
	 * @returns {HTMLElement|null}
	 */
	openSliderInput(params, scope) {
		const id = params[0] || "SliderInput";
		let timeoutMs = 0;
		let currentVal = 0;
		let minVal = 0;
		let maxVal = 100;
		let noClose = false;
		const references = [];

		for (let i = 1; i < params.length; i++) {
			const p = params[i] ?? "";
			if (typeof p !== "string") continue;

			if (p.startsWith("--timeout=")) {
				timeoutMs = Number.parseInt(p.replace("--timeout=", ""), 10) || 0;
			} else if (p.startsWith("--text=")) {
				const parts = p.replace("--text=", "").split(",");
				if (parts[0] !== undefined) currentVal = Number.parseInt(parts[0], 10);
				if (parts[1] !== undefined) minVal = Number.parseInt(parts[1], 10);
				if (parts[2] !== undefined) maxVal = Number.parseInt(parts[2], 10);
			} else if (p.startsWith("--reference=")) {
				references.push(p.replace("--reference=", ""));
			} else if (p.startsWith("--option=")) {
				if (p.toLowerCase().includes("noclose")) noClose = true;
			} else if (i === 1 && !p.startsWith("--")) {
				timeoutMs = Number.parseInt(p, 10) || 0;
			} else if (i === 2 && !p.startsWith("--")) {
				currentVal = Number.parseInt(p, 10) || 0;
			} else if (i === 3 && !p.startsWith("--")) {
				minVal = Number.parseInt(p, 10) || 0;
			} else if (i === 4 && !p.startsWith("--")) {
				maxVal = Number.parseInt(p, 10) || 100;
			}
		}

		if (Number.isNaN(currentVal)) currentVal = minVal;
		if (Number.isNaN(minVal)) minVal = 0;
		if (Number.isNaN(maxVal)) maxVal = 100;

		this.closeInputBox(id);
		const balloon = this.getBalloonContainer(scope);
		if (!balloon) return null;

		const form = document.createElement("div");
		form.className = "balloon-inputbox-form balloon-sliderinput-form";
		form.style.marginTop = "0.5rem";
		form.style.display = "flex";
		form.style.alignItems = "center";
		form.style.gap = "0.5rem";

		const slider = document.createElement("input");
		slider.type = "range";
		slider.min = String(minVal);
		slider.max = String(maxVal);
		slider.value = String(currentVal);
		slider.style.flex = "1";

		const valDisplay = document.createElement("span");
		valDisplay.textContent = String(slider.value);
		valDisplay.style.fontSize = "0.8rem";
		valDisplay.style.minWidth = "2rem";

		slider.addEventListener("input", () => {
			valDisplay.textContent = String(slider.value);
		});

		const submitBtn = document.createElement("button");
		submitBtn.textContent = "OK";
		submitBtn.className = "balloon-choice-btn";
		submitBtn.style.marginTop = "0";

		let timer = null;
		const boxKey = `inputbox:${id}`;

		const cleanup = (force = false) => {
			if (timer) {
				clearTimeout(timer);
				timer = null;
			}
			if (force || !noClose) {
				form.remove();
				this.activeBoxes.delete(boxKey);
				if (this.activeBoxes.get("inputbox")?.form === form) {
					this.activeBoxes.delete("inputbox");
				}
			}
		};

		const submit = async () => {
			const val = String(slider.value);
			cleanup();
			const info = `${minVal},${maxVal}`;
			if (id.startsWith("On")) {
				await this.app.ghostController?.sendShioriEvent(id, [
					val,
					info,
					...references,
				]);
			} else {
				await this.app.ghostController?.sendShioriEvent("OnUserInput", [
					id,
					val,
					info,
					...references,
				]);
			}
		};

		const cancel = async (reason = "close") => {
			cleanup(true);
			const info = `${minVal},${maxVal}`;
			await this.app.ghostController?.sendShioriEvent("OnUserInputCancel", [
				id,
				reason,
				info,
				...references,
			]);
		};

		submitBtn.addEventListener("click", (e) => {
			e.stopPropagation();
			submit();
		});

		slider.addEventListener("keydown", (e) => {
			if (e.key === "Enter") {
				e.stopPropagation();
				submit();
			} else if (e.key === "Escape") {
				e.stopPropagation();
				cancel("close");
			}
		});

		form.appendChild(slider);
		form.appendChild(valDisplay);
		form.appendChild(submitBtn);
		balloon.appendChild(form);
		setTimeout(() => slider.focus?.(), 50);

		if (timeoutMs > 0) {
			timer = setTimeout(() => {
				cancel("timeout");
			}, timeoutMs);
		}

		const boxEntry = {
			id,
			type: "sliderinput",
			form,
			cleanup: () => cleanup(true),
		};
		this.activeBoxes.set(boxKey, boxEntry);
		this.activeBoxes.set("inputbox", boxEntry);
		return form;
	}

	/**
	 * TeachBox を開く (\![open,teachbox])
	 * @param {string[]} [params]
	 * @param {object} [options]
	 * @returns {HTMLElement|null}
	 */
	openTeachBox(params = [], options = {}) {
		const { notifyStart = true, scope } = options;
		this.closeTeachBox();

		if (notifyStart) {
			this.app.ghostController
				?.sendShioriEvent("OnTeachStart")
				?.catch(() => {});
		}

		let defaultText = "";
		for (const p of params) {
			if (typeof p === "string" && p.startsWith("--text=")) {
				defaultText = p.replace("--text=", "");
			}
		}

		const balloon = this.getBalloonContainer(scope);
		if (!balloon) return null;

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

		const cleanup = () => {
			form.remove();
			this.activeBoxes.delete("teachbox");
		};

		const submit = async () => {
			const val = input.value;
			cleanup();
			this.app.ghostController?.sendTeachInput?.(val);
		};

		const cancel = async () => {
			cleanup();
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
		setTimeout(() => input.focus?.(), 50);

		this.activeBoxes.set("teachbox", {
			type: "teachbox",
			form,
			cleanup,
		});
		return form;
	}

	/**
	 * TeachBox を閉じる (\![close,teachbox])
	 */
	closeTeachBox() {
		const existing = this.activeBoxes.get("teachbox");
		if (existing) {
			existing.cleanup();
			this.activeBoxes.delete("teachbox");
		}
	}

	/**
	 * CommunicateBox を開く (\![open,communicatebox])
	 * @param {string[]} [params]
	 * @param {number} [scope]
	 * @returns {HTMLElement|null}
	 */
	openCommunicateBox(params = [], scope) {
		this.closeCommunicateBox(false);
		const opts = this.parseBoxOptions(["Communicate", ...params]);
		const balloon = this.getBalloonContainer(scope);
		if (!balloon) return null;

		const form = document.createElement("div");
		form.className = "balloon-inputbox-form balloon-communicatebox-form";
		form.style.marginTop = "0.5rem";
		form.style.display = "flex";
		form.style.gap = "0.25rem";

		const input = document.createElement("input");
		input.type = "text";
		input.className = "balloon-input";
		input.value = opts.defaultText;
		input.placeholder = opts.placeholder || "話しかける...";
		if (opts.limit > 0) input.maxLength = opts.limit;
		input.style.flex = "1";
		input.style.fontSize = "0.8rem";
		input.style.padding = "0.2rem 0.4rem";
		input.style.borderRadius = "0.25rem";
		input.style.border = "1px solid var(--balloon-border-color, #888)";
		input.style.background =
			"var(--communicatebox-background-color, var(--balloon-bg, #fff))";
		input.style.color =
			"var(--communicatebox-font-color, var(--balloon-text-color, #000))";

		const submitBtn = document.createElement("button");
		submitBtn.textContent = "送信";
		submitBtn.className = "balloon-choice-btn";
		submitBtn.style.marginTop = "0";

		let timer = null;
		const cleanup = (force = false) => {
			if (timer) {
				clearTimeout(timer);
				timer = null;
			}
			if (force || !opts.noClose) {
				form.remove();
				this.activeBoxes.delete("communicatebox");
			} else if (!opts.noClear) {
				input.value = "";
			}
		};

		const submit = async () => {
			const val = input.value;
			cleanup();
			await this.app.ghostController?.sendShioriEvent("OnCommunicate", [
				"user",
				val,
				...opts.references,
			]);
		};

		const cancel = async () => {
			cleanup(true);
			await this.app.ghostController?.sendShioriEvent(
				"OnCommunicateInputCancel",
				["", "cancel"],
			);
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
		setTimeout(() => input.focus?.(), 50);

		if (opts.timeoutMs > 0) {
			timer = setTimeout(() => {
				cancel();
			}, opts.timeoutMs);
		}

		this.activeBoxes.set("communicatebox", {
			type: "communicatebox",
			form,
			cleanup: () => cleanup(true),
		});
		return form;
	}

	/**
	 * CommunicateBox を閉じる (\![close,communicatebox])
	 * ※スクリプトからの close では OnCommunicateInputCancel は発生しない (UKADOC準拠)
	 */
	closeCommunicateBox(notifyCancel = false) {
		const existing = this.activeBoxes.get("communicatebox");
		if (existing) {
			existing.cleanup();
			this.activeBoxes.delete("communicatebox");
			if (notifyCancel) {
				this.app.ghostController?.sendShioriEvent("OnCommunicateInputCancel", [
					"",
					"cancel",
				]);
			}
		}
	}

	/**
	 * 指定IDのダイアログを閉じる (\![close,dialog,ID])
	 * @param {string} id
	 * @param {boolean} [notifyCancel=true]
	 */
	closeDialog(id, notifyCancel = true) {
		if (!id || id === "__SYSTEM_ALL_DIALOG__") {
			for (const [key, box] of Array.from(this.activeBoxes.entries())) {
				box.cleanup();
				this.activeBoxes.delete(key);
			}
			if (notifyCancel) {
				this.app.ghostController?.sendShioriEvent("OnSystemDialogCancel", [
					id || "__SYSTEM_ALL_DIALOG__",
				]);
			}
			return;
		}

		let closed = false;
		for (const [key, box] of Array.from(this.activeBoxes.entries())) {
			if (box.id === id || key.endsWith(`:${id}`)) {
				box.cleanup();
				this.activeBoxes.delete(key);
				closed = true;
			}
		}
		if (closed && notifyCancel) {
			this.app.ghostController?.sendShioriEvent("OnSystemDialogCancel", [id]);
		}
	}

	/**
	 * 選択肢 (Choice) ボタン要素を生成
	 * @param {object} param
	 * @param {string} param.id 選択肢ID
	 * @param {string} param.text 表示テキスト
	 * @param {function} [param.onSelect] 選択時のコールバック
	 * @returns {HTMLButtonElement}
	 */
	createChoiceButton({ id, text, onSelect }) {
		const btn = document.createElement("button");
		btn.className = "balloon-choice-btn";
		btn.setAttribute("data-choice-id", id);
		btn.textContent = text;
		btn.addEventListener("click", (e) => {
			e.stopPropagation();
			if (this.choiceTimeoutTimer) {
				clearTimeout(this.choiceTimeoutTimer);
				this.choiceTimeoutTimer = null;
			}
			if (onSelect) {
				onSelect(id, text);
			} else if (this.player?.onChoiceSelected) {
				this.player.onChoiceSelected(id, text);
			} else {
				this.app.ghostController?.sendShioriEvent("OnChoiceSelect", [id, text]);
			}
		});
		return btn;
	}

	/**
	 * 選択肢のタイムアウトタイマーを設定
	 * @param {number} timeoutMs
	 * @param {function} [onTimeout]
	 */
	setChoiceTimeout(timeoutMs, onTimeout) {
		if (this.choiceTimeoutTimer) {
			clearTimeout(this.choiceTimeoutTimer);
			this.choiceTimeoutTimer = null;
		}
		if (timeoutMs > 0) {
			this.choiceTimeoutTimer = setTimeout(() => {
				this.choiceTimeoutTimer = null;
				if (onTimeout) {
					onTimeout();
				} else {
					this.app.ghostController?.sendShioriEvent("OnChoiceTimeout", []);
				}
			}, timeoutMs);
		}
	}

	/**
	 * 全ての開いているアクティブなボックスを閉じる
	 */
	closeAll() {
		for (const box of this.activeBoxes.values()) {
			box.cleanup();
		}
		this.activeBoxes.clear();
		if (this.choiceTimeoutTimer) {
			clearTimeout(this.choiceTimeoutTimer);
			this.choiceTimeoutTimer = null;
		}
	}
}
