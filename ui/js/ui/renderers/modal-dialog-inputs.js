/**
 * @file modal-dialog-inputs.js
 * @brief inputbox, passwordinput, textareabox, sliderinput, dateinput, timeinput, ipinput および autocomplete 処理
 */

export async function attachAutocomplete(
	inputEl,
	boxType,
	id = "",
	parentForm = null,
) {
	if (!this.app?.ghostController?.sendShioriEvent || !inputEl) return null;
	try {
		const res = await this.app.ghostController.sendShioriEvent(
			"inputbox.autocomplete",
			boxType === "inputbox" ? [boxType, id] : [boxType],
		);
		const rawVal =
			typeof res === "string"
				? res
				: res?.value || res?.response || res?.toString?.() || "";
		if (!rawVal || typeof rawVal !== "string") return null;

		const byteOne = String.fromCharCode(1);
		const items = rawVal
			.replaceAll("\\1", byteOne)
			.split(byteOne)
			.map((s) => s.trim())
			.filter(Boolean);

		if (items.length === 0) return null;

		const listId = `dl-${boxType}-${++this.autocompleteCounter}`;
		const dataList = document.createElement("datalist");
		dataList.id = listId;

		for (const item of items) {
			const opt = document.createElement("option");
			opt.value = item;
			dataList.appendChild(opt);
		}

		inputEl.setAttribute("list", listId);
		if (parentForm) {
			parentForm.appendChild(dataList);
		} else {
			inputEl.parentElement?.appendChild(dataList);
		}
		return dataList;
	} catch {
		return null;
	}
}

export function parseBoxOptions(params) {
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

export function openSliderInput(params, scope) {
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

export function openDateInput(params, scope) {
	const id = params[0] || "DateInput";
	let timeoutMs = 0;
	let year = "";
	let month = "";
	let day = "";
	let noClose = false;
	const references = [];

	for (let i = 1; i < params.length; i++) {
		const p = params[i] ?? "";
		if (typeof p !== "string") continue;

		if (p.startsWith("--timeout=")) {
			timeoutMs = Number.parseInt(p.replace("--timeout=", ""), 10) || 0;
		} else if (p.startsWith("--text=")) {
			const parts = p.replace("--text=", "").split(",");
			if (parts[0] !== undefined) year = parts[0].trim();
			if (parts[1] !== undefined) month = parts[1].trim();
			if (parts[2] !== undefined) day = parts[2].trim();
		} else if (p.startsWith("--reference=")) {
			references.push(p.replace("--reference=", ""));
		} else if (p.startsWith("--option=")) {
			if (p.toLowerCase().includes("noclose")) noClose = true;
		} else if (i === 1 && !p.startsWith("--")) {
			timeoutMs = Number.parseInt(p, 10) || 0;
		} else if (i === 2 && !p.startsWith("--")) {
			year = p.trim();
		} else if (i === 3 && !p.startsWith("--")) {
			month = p.trim();
		} else if (i === 4 && !p.startsWith("--")) {
			day = p.trim();
		}
	}

	this.closeInputBox(id);
	const balloon = this.getBalloonContainer(scope);
	if (!balloon) return null;

	const form = document.createElement("div");
	form.className = "balloon-inputbox-form balloon-dateinput-form";
	form.style.marginTop = "0.5rem";
	form.style.display = "flex";
	form.style.alignItems = "center";
	form.style.gap = "0.25rem";

	const input = document.createElement("input");
	input.type = "date";
	input.className = "balloon-input";
	input.style.flex = "1";
	input.style.fontSize = "0.8rem";
	input.style.padding = "0.2rem 0.4rem";
	input.style.borderRadius = "0.25rem";
	input.style.border = "1px solid var(--balloon-border-color, #888)";
	input.style.background = "var(--balloon-bg, #fff)";
	input.style.color = "var(--balloon-text-color, #000)";

	if (year && month && day) {
		const padY = year.padStart(4, "0");
		const padM = month.padStart(2, "0");
		const padD = day.padStart(2, "0");
		input.value = `${padY}-${padM}-${padD}`;
	}

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
		let formattedVal = "";
		if (input.value) {
			const parts = input.value.split("-");
			if (parts.length === 3) {
				formattedVal = `${Number.parseInt(parts[0], 10)},${Number.parseInt(parts[1], 10)},${Number.parseInt(parts[2], 10)}`;
			} else {
				formattedVal = input.value;
			}
		} else if (year || month || day) {
			formattedVal = `${year},${month},${day}`;
		}
		cleanup();
		if (id.startsWith("On")) {
			await this.app.ghostController?.sendShioriEvent(id, [
				formattedVal,
				"",
				...references,
			]);
		} else {
			await this.app.ghostController?.sendShioriEvent("OnUserInput", [
				id,
				formattedVal,
				"",
				...references,
			]);
		}
	};

	const cancel = async (reason = "close") => {
		cleanup(true);
		await this.app.ghostController?.sendShioriEvent("OnUserInputCancel", [
			id,
			reason,
			"",
			...references,
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

	if (timeoutMs > 0) {
		timer = setTimeout(() => {
			cancel("timeout");
		}, timeoutMs);
	}

	const boxEntry = {
		id,
		type: "dateinput",
		form,
		cleanup: () => cleanup(true),
	};
	this.activeBoxes.set(boxKey, boxEntry);
	this.activeBoxes.set("inputbox", boxEntry);
	return form;
}

export function openTimeInput(params, scope) {
	const id = params[0] || "TimeInput";
	let timeoutMs = 0;
	let hour = "";
	let min = "";
	let sec = "";
	let noClose = false;
	const references = [];

	for (let i = 1; i < params.length; i++) {
		const p = params[i] ?? "";
		if (typeof p !== "string") continue;

		if (p.startsWith("--timeout=")) {
			timeoutMs = Number.parseInt(p.replace("--timeout=", ""), 10) || 0;
		} else if (p.startsWith("--text=")) {
			const parts = p.replace("--text=", "").split(",");
			if (parts[0] !== undefined) hour = parts[0].trim();
			if (parts[1] !== undefined) min = parts[1].trim();
			if (parts[2] !== undefined) sec = parts[2].trim();
		} else if (p.startsWith("--reference=")) {
			references.push(p.replace("--reference=", ""));
		} else if (p.startsWith("--option=")) {
			if (p.toLowerCase().includes("noclose")) noClose = true;
		} else if (i === 1 && !p.startsWith("--")) {
			timeoutMs = Number.parseInt(p, 10) || 0;
		} else if (i === 2 && !p.startsWith("--")) {
			hour = p.trim();
		} else if (i === 3 && !p.startsWith("--")) {
			min = p.trim();
		} else if (i === 4 && !p.startsWith("--")) {
			sec = p.trim();
		}
	}

	this.closeInputBox(id);
	const balloon = this.getBalloonContainer(scope);
	if (!balloon) return null;

	const form = document.createElement("div");
	form.className = "balloon-inputbox-form balloon-timeinput-form";
	form.style.marginTop = "0.5rem";
	form.style.display = "flex";
	form.style.alignItems = "center";
	form.style.gap = "0.25rem";

	const input = document.createElement("input");
	input.type = "time";
	input.step = "1";
	input.className = "balloon-input";
	input.style.flex = "1";
	input.style.fontSize = "0.8rem";
	input.style.padding = "0.2rem 0.4rem";
	input.style.borderRadius = "0.25rem";
	input.style.border = "1px solid var(--balloon-border-color, #888)";
	input.style.background = "var(--balloon-bg, #fff)";
	input.style.color = "var(--balloon-text-color, #000)";

	if (hour !== "" && min !== "") {
		const padH = hour.padStart(2, "0");
		const padM = min.padStart(2, "0");
		const padS = (sec || "0").padStart(2, "0");
		input.value = `${padH}:${padM}:${padS}`;
	}

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
		let formattedVal = "";
		if (input.value) {
			const parts = input.value.split(":");
			const h = Number.parseInt(parts[0], 10) || 0;
			const m = Number.parseInt(parts[1], 10) || 0;
			const s = Number.parseInt(parts[2] || "0", 10) || 0;
			formattedVal = `${h},${m},${s}`;
		} else if (hour !== "" || min !== "" || sec !== "") {
			formattedVal = `${hour || 0},${min || 0},${sec || 0}`;
		}
		cleanup();
		if (id.startsWith("On")) {
			await this.app.ghostController?.sendShioriEvent(id, [
				formattedVal,
				"",
				...references,
			]);
		} else {
			await this.app.ghostController?.sendShioriEvent("OnUserInput", [
				id,
				formattedVal,
				"",
				...references,
			]);
		}
	};

	const cancel = async (reason = "close") => {
		cleanup(true);
		await this.app.ghostController?.sendShioriEvent("OnUserInputCancel", [
			id,
			reason,
			"",
			...references,
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

	if (timeoutMs > 0) {
		timer = setTimeout(() => {
			cancel("timeout");
		}, timeoutMs);
	}

	const boxEntry = {
		id,
		type: "timeinput",
		form,
		cleanup: () => cleanup(true),
	};
	this.activeBoxes.set(boxKey, boxEntry);
	this.activeBoxes.set("inputbox", boxEntry);
	return form;
}

export function openIpInput(params, scope) {
	const id = params[0] || "IpInput";
	let timeoutMs = 0;
	const ipParts = ["", "", "", ""];
	let noClose = false;
	const references = [];

	for (let i = 1; i < params.length; i++) {
		const p = params[i] ?? "";
		if (typeof p !== "string") continue;

		if (p.startsWith("--timeout=")) {
			timeoutMs = Number.parseInt(p.replace("--timeout=", ""), 10) || 0;
		} else if (p.startsWith("--text=")) {
			const parts = p.replace("--text=", "").split(".");
			for (let j = 0; j < 4; j++) {
				if (parts[j] !== undefined) ipParts[j] = parts[j].trim();
			}
		} else if (p.startsWith("--reference=")) {
			references.push(p.replace("--reference=", ""));
		} else if (p.startsWith("--option=")) {
			if (p.toLowerCase().includes("noclose")) noClose = true;
		} else if (i === 1 && !p.startsWith("--")) {
			timeoutMs = Number.parseInt(p, 10) || 0;
		} else if (i >= 2 && i <= 5 && !p.startsWith("--")) {
			ipParts[i - 2] = p.trim();
		}
	}

	this.closeInputBox(id);
	const balloon = this.getBalloonContainer(scope);
	if (!balloon) return null;

	const form = document.createElement("div");
	form.className = "balloon-inputbox-form balloon-ipinput-form";
	form.style.marginTop = "0.5rem";
	form.style.display = "flex";
	form.style.alignItems = "center";
	form.style.gap = "0.15rem";

	const inputs = [];
	for (let i = 0; i < 4; i++) {
		const field = document.createElement("input");
		field.type = "number";
		field.min = "0";
		field.max = "255";
		field.className = "balloon-input balloon-ip-octet";
		field.value = ipParts[i] || "";
		field.style.width = "2.5rem";
		field.style.textAlign = "center";
		field.style.fontSize = "0.8rem";
		field.style.padding = "0.2rem";
		field.style.borderRadius = "0.25rem";
		field.style.border = "1px solid var(--balloon-border-color, #888)";
		field.style.background = "var(--balloon-bg, #fff)";
		field.style.color = "var(--balloon-text-color, #000)";

		field.addEventListener("focus", () => {
			try {
				form.scrollIntoView?.({ behavior: "smooth", block: "nearest" });
			} catch {}
		});

		field.addEventListener("keydown", (e) => {
			if (e.key === "." || e.key === "Decimal") {
				e.preventDefault();
				if (i < 3) inputs[i + 1]?.focus();
			} else if (e.key === "Backspace" && field.value === "" && i > 0) {
				inputs[i - 1]?.focus();
			}
		});

		inputs.push(field);
		form.appendChild(field);

		if (i < 3) {
			const dot = document.createElement("span");
			dot.textContent = ".";
			dot.style.fontWeight = "bold";
			form.appendChild(dot);
		}
	}

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
		const val = inputs
			.map((inp) => {
				const num = Number.parseInt(inp.value, 10);
				return Number.isNaN(num) ? 0 : Math.min(255, Math.max(0, num));
			})
			.join(",");
		cleanup();
		if (id.startsWith("On")) {
			await this.app.ghostController?.sendShioriEvent(id, [
				val,
				"",
				...references,
			]);
		} else {
			await this.app.ghostController?.sendShioriEvent("OnUserInput", [
				id,
				val,
				"",
				...references,
			]);
		}
	};

	const cancel = async (reason = "close") => {
		cleanup(true);
		await this.app.ghostController?.sendShioriEvent("OnUserInputCancel", [
			id,
			reason,
			"",
			...references,
		]);
	};

	submitBtn.addEventListener("click", (e) => {
		e.stopPropagation();
		submit();
	});

	form.addEventListener("keydown", (e) => {
		if (e.key === "Enter") {
			e.stopPropagation();
			submit();
		} else if (e.key === "Escape") {
			e.stopPropagation();
			cancel("close");
		}
	});

	form.appendChild(submitBtn);
	balloon.appendChild(form);
	setTimeout(() => inputs[0]?.focus?.(), 50);

	if (timeoutMs > 0) {
		timer = setTimeout(() => {
			cancel("timeout");
		}, timeoutMs);
	}

	const boxEntry = {
		id,
		type: "ipinput",
		form,
		cleanup: () => cleanup(true),
	};
	this.activeBoxes.set(boxKey, boxEntry);
	this.activeBoxes.set("inputbox", boxEntry);
	return form;
}
