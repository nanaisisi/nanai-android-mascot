/**
 * @file inputbox.ts
 * @brief \![open,inputbox] 等ハンドラ
 */

export function openInputBox(handler: any, params: string[], isPassword: boolean = false) {
	if (handler.app?.modalDialogController?.openInputBox) {
		return handler.app.modalDialogController.openInputBox(
			params,
			handler.player?.currentScope,
			isPassword,
		);
	}

	const id = params[0] || "UserInput";
	let timeoutMs = 0;
	let defaultText = "";
	let placeholder = "";
	const references: string[] = [];

	for (let i = 1; i < params.length; i++) {
		const p = params[i] ?? "";
		if (typeof p !== "string") continue;
		if (p.startsWith("--timeout=")) {
			timeoutMs = Number.parseInt(p.replace("--timeout=", ""), 10) || 0;
		} else if (p.startsWith("--text=")) {
			defaultText = p.replace("--text=", "");
		} else if (p.startsWith("--placeholder=")) {
			placeholder = p.replace("--placeholder=", "");
		} else if (p.startsWith("--reference=")) {
			references.push(p.replace("--reference=", ""));
		} else if (i === 1 && !p.startsWith("--")) {
			timeoutMs = Number.parseInt(p, 10) || 0;
		} else if (i === 2 && !p.startsWith("--")) {
			defaultText = p;
		}
	}

	const balloon =
		handler.player?.currentScope === 1
			? handler.app?.elements?.keroBalloonText
			: handler.app?.elements?.balloonText;
	if (!balloon) return;

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

	let timer: any = null;
	const cleanup = () => {
		if (timer) clearTimeout(timer);
		form.remove();
	};

	const submit = async () => {
		const val = input.value;
		cleanup();
		if (id.startsWith("On")) {
			await handler.app.ghostController?.sendShioriEvent(id, [
				val,
				"",
				...references,
			]);
		} else {
			await handler.app.ghostController?.sendShioriEvent("OnUserInput", [
				id,
				val,
				"",
				...references,
			]);
		}
	};

	const cancel = async (reason = "close") => {
		cleanup();
		await handler.app.ghostController?.sendShioriEvent("OnUserInputCancel", [
			id,
			reason,
		]);
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
			cancel("cancel");
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
}

export function openPasswordInput(handler: any, params: string[]) {
	return openInputBox(handler, params, true);
}

export function openTextAreaBox(handler: any, params: string[]) {
	if (handler.app?.modalDialogController?.openTextAreaBox) {
		return handler.app.modalDialogController.openTextAreaBox(
			params,
			handler.player?.currentScope,
		);
	}
	return openInputBox(handler, params);
}

export function openSliderInput(handler: any, params: string[]) {
	if (handler.app?.modalDialogController?.openSliderInput) {
		return handler.app.modalDialogController.openSliderInput(
			params,
			handler.player?.currentScope,
		);
	}
	return openInputBox(handler, params);
}

export function openIpInput(handler: any, params: string[]) {
	if (handler.app?.modalDialogController?.openIpInput) {
		return handler.app.modalDialogController.openIpInput(
			params,
			handler.player?.currentScope,
		);
	}
	return openInputBox(handler, params);
}

export function openDateInput(handler: any, params: string[]) {
	if (handler.app?.modalDialogController?.openDateInput) {
		return handler.app.modalDialogController.openDateInput(
			params,
			handler.player?.currentScope,
		);
	}
	return openInputBox(handler, params);
}

export function openTimeInput(handler: any, params: string[]) {
	if (handler.app?.modalDialogController?.openTimeInput) {
		return handler.app.modalDialogController.openTimeInput(
			params,
			handler.player?.currentScope,
		);
	}
	return openInputBox(handler, params);
}

export function closeInputBox(_handler: any, _notifyCancel: boolean = false) {
	const forms = document.querySelectorAll(".balloon-inputbox-form");
	for (const f of Array.from(forms)) {
		f.remove();
	}
}

export function closeTextAreaBox(handler: any, notifyCancel: boolean = false) {
	closeInputBox(handler, notifyCancel);
}

export function closeDialog(handler: any, notifyCancel: boolean = false) {
	closeInputBox(handler, notifyCancel);
}
