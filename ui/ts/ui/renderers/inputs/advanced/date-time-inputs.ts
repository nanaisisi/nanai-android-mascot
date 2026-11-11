/**
 * @file date-time-inputs.js
 * @brief dateinput, timeinput の表示・制御処理
 */

export function openDateInput(
	this: unknown,
	params: string | unknown[],
	scope: unknown,
) {
	const id = params[0] || "DateInput";
	let timeoutMs = 0;
	let year = "";
	let month = "";
	let day = "";
	let noClose = false;
	const references: string[] = [];

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
		} else if (!p.startsWith("--") && p !== "") {
			if (i === 1) timeoutMs = Number.parseInt(p, 10) || 0;
			else if (i === 2) year = p.trim();
			else if (i === 3) month = p.trim();
			else if (i === 4) day = p.trim();
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

	let timer: number | null | undefined = null;
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

export function openTimeInput(
	this: unknown,
	params: string | unknown[],
	scope: unknown,
) {
	const id = params[0] || "TimeInput";
	let timeoutMs = 0;
	let hour = "";
	let min = "";
	let sec = "";
	let noClose = false;
	const references: string[] = [];

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
		} else if (!p.startsWith("--") && p !== "") {
			if (i === 1) timeoutMs = Number.parseInt(p, 10) || 0;
			else if (i === 2) hour = p.trim();
			else if (i === 3) min = p.trim();
			else if (i === 4) sec = p.trim();
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

	let timer: number | null | undefined = null;
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
