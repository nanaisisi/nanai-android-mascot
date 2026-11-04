/**
 * @file text-inputs.js
 * @brief inputbox, passwordinput, textareabox の表示・制御処理
 */

export function openInputBox(params, scope, isPassword = false) {
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

	input.addEventListener("focus", () => {
		try {
			form.scrollIntoView?.({ behavior: "smooth", block: "nearest" });
		} catch {}
	});

	const submitBtn = document.createElement("button");
	submitBtn.textContent = "OK";
	submitBtn.className = "balloon-choice-btn";
	submitBtn.style.marginTop = "0";

	let timer = null;
	const boxKey = `inputbox:${opts.id}`;
	let dataListEl = null;

	const cleanup = (force = false) => {
		if (timer) {
			clearTimeout(timer);
			timer = null;
		}
		if (dataListEl) {
			dataListEl.remove?.();
			dataListEl = null;
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

	if (!isPassword) {
		this.attachAutocomplete(input, "inputbox", opts.id, form).then((dl) => {
			dataListEl = dl;
		});
	}

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

export function openPasswordInput(params, scope) {
	return this.openInputBox(params, scope, true);
}

export function closeInputBox(id) {
	if (!id || id === "__SYSTEM_ALL_INPUT__") {
		for (const [key, box] of Array.from(this.activeBoxes.entries())) {
			if (
				key === "inputbox" ||
				key.startsWith("inputbox:") ||
				box.type === "inputbox" ||
				box.type === "passwordinput" ||
				box.type === "sliderinput" ||
				box.type === "dateinput" ||
				box.type === "timeinput" ||
				box.type === "ipinput"
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

export function openTextAreaBox(params, scope) {
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

	textarea.addEventListener("focus", () => {
		try {
			form.scrollIntoView?.({ behavior: "smooth", block: "nearest" });
		} catch {}
	});

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

export function closeTextAreaBox(id) {
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
