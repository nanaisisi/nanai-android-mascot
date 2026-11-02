/**
 * @file slider-input.js
 * @brief sliderinput の表示・制御処理
 */

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
