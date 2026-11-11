/**
 * @file communicatebox.ts
 * @brief \![open,communicatebox] および \![close,communicatebox] ハンドラ
 */

export function openCommunicateBox(handler: unknown, params: string[] = []) {
	closeCommunicateBox(handler, false);

	let defaultText = "";
	let placeholder = "話しかける...";
	let timeoutMs = 0;
	let limit = 0;
	const references: string[] = [];

	for (let i = 0; i < params.length; i++) {
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
		} else if (i === 0 && !p.startsWith("--")) {
			defaultText = p;
		}
	}

	const balloon =
		handler.player.currentScope === 1
			? handler.app.elements.keroBalloonText
			: handler.app.elements.balloonText;
	if (!balloon) return;

	const form = document.createElement("div");
	form.className = "balloon-inputbox-form balloon-communicatebox-form";
	form.style.marginTop = "0.5rem";
	form.style.display = "flex";
	form.style.gap = "0.25rem";

	const input = document.createElement("input");
	input.type = "text";
	input.className = "balloon-input";
	input.value = defaultText;
	input.placeholder = placeholder;
	if (limit > 0) input.maxLength = limit;
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

	let timer: unknown = null;
	handler.communicateForm = form;

	const cleanup = () => {
		if (timer) {
			clearTimeout(timer);
			timer = null;
		}
		form.remove();
		handler.communicateForm = null;
	};

	const submit = async () => {
		const val = input.value;
		cleanup();
		await handler.app.ghostController?.sendShioriEvent("OnCommunicate", [
			"user",
			val,
			...references,
		]);
	};

	const cancel = async () => {
		cleanup();
		await handler.app.ghostController?.sendShioriEvent(
			"OnCommunicateInputCancel",
			["", "cancel"],
		);
	};

	submitBtn.addEventListener("click", (e: MouseEvent) => {
		e.stopPropagation();
		submit();
	});

	input.addEventListener("keydown", (e: KeyboardEvent) => {
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

	if (timeoutMs > 0) {
		timer = setTimeout(() => {
			cancel();
		}, timeoutMs);
	}
}

export function closeCommunicateBox(
	handler: unknown,
	notifyCancel: boolean = false,
) {
	if (handler.communicateForm) {
		handler.communicateForm.remove();
		handler.communicateForm = null;
		if (notifyCancel) {
			handler.app.ghostController
				?.sendShioriEvent("OnCommunicateInputCancel", ["", "cancel"])
				?.catch(() => {});
		}
	}
}
