/**
 * @file inputbox.ts
 * @brief \![open,inputbox] 等ハンドラ
 */

export function openInputBox(
	handler: unknown,
	params: string[],
	isPassword: boolean = false,
) {
	if (isPassword && handler.app?.modalDialogController?.openPasswordInput) {
		return handler.app.modalDialogController.openPasswordInput(
			params,
			handler.player?.currentScope,
		);
	}
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
	form.style.gap = "4px";

	const input = document.createElement("input");
	input.type = isPassword ? "password" : "text";
	input.value = defaultText;
	input.placeholder = placeholder;
	input.style.flex = "1";
	input.style.padding = "2px 4px";

	const submitBtn = document.createElement("button");
	submitBtn.textContent = "OK";
	submitBtn.style.padding = "2px 8px";

	let timer: unknown = null;

	const cancel = (reason: string = "cancel") => {
		if (timer) clearTimeout(timer);
		form.remove();
		handler.app.ghostController?.sendShioriEvent(`${id}Cancel`, [reason]);
		handler.app.ghostController?.sendShioriEvent("OnSystemDialogCancel", [
			id,
			reason,
		]);
	};

	const submit = () => {
		if (timer) clearTimeout(timer);
		const val = input.value;
		form.remove();
		handler.app.ghostController?.sendShioriEvent(id, [val, ...references]);
		handler.app.ghostController?.sendShioriEvent("OnUserInput", [
			id,
			val,
			...references,
		]);
		handler.app.ghostController?.sendShioriEvent("OnSystemDialog", [id, val]);
	};

	submitBtn.addEventListener("click", () => submit());
	input.addEventListener("keydown", (e: unknown) => {
		if (e.key === "Enter") {
			submit();
		} else if (e.key === "Escape") {
			cancel("escape");
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

export function openPasswordInput(handler: unknown, params: string[]) {
	return openInputBox(handler, params, true);
}

export function openTextAreaBox(handler: unknown, params: string[]) {
	if (handler.app?.modalDialogController?.openTextAreaBox) {
		return handler.app.modalDialogController.openTextAreaBox(
			params,
			handler.player?.currentScope,
		);
	}
	return openInputBox(handler, params);
}

export function openSliderInput(handler: unknown, params: string[]) {
	if (handler.app?.modalDialogController?.openSliderInput) {
		return handler.app.modalDialogController.openSliderInput(
			params,
			handler.player?.currentScope,
		);
	}
	return openInputBox(handler, params);
}

export function openIpInput(handler: unknown, params: string[]) {
	if (handler.app?.modalDialogController?.openIpInput) {
		return handler.app.modalDialogController.openIpInput(
			params,
			handler.player?.currentScope,
		);
	}
	return openInputBox(handler, params);
}

export function openDateInput(handler: unknown, params: string[]) {
	if (handler.app?.modalDialogController?.openDateInput) {
		return handler.app.modalDialogController.openDateInput(
			params,
			handler.player?.currentScope,
		);
	}
	return openInputBox(handler, params);
}

export function openTimeInput(handler: unknown, params: string[]) {
	if (handler.app?.modalDialogController?.openTimeInput) {
		return handler.app.modalDialogController.openTimeInput(
			params,
			handler.player?.currentScope,
		);
	}
	return openInputBox(handler, params);
}

export function closeInputBox(handler: unknown, paramsOrNotify: unknown = false) {
	let notifyCancel = false;
	let id: string | undefined;
	if (Array.isArray(paramsOrNotify)) {
		id = paramsOrNotify[0];
	} else {
		notifyCancel = Boolean(paramsOrNotify);
	}
	if (handler.app?.modalDialogController?.closeInputBox) {
		return handler.app.modalDialogController.closeInputBox(
			id,
			handler.player?.currentScope,
			notifyCancel,
		);
	}
	const forms = document.querySelectorAll?.(".balloon-inputbox-form") || [];
	for (const f of Array.from(forms)) {
		(f as any).remove?.();
	}
}

export function closeTextAreaBox(
	handler: unknown,
	paramsOrNotify: unknown = false,
) {
	if (handler.app?.modalDialogController?.closeTextAreaBox) {
		const id = Array.isArray(paramsOrNotify) ? paramsOrNotify[0] : undefined;
		return handler.app.modalDialogController.closeTextAreaBox(
			id,
			handler.player?.currentScope,
		);
	}
	closeInputBox(handler, paramsOrNotify);
}

export function closeDialog(handler: unknown, paramsOrNotify: unknown = false) {
	if (handler.app?.modalDialogController?.closeDialog) {
		const id = Array.isArray(paramsOrNotify) ? paramsOrNotify[0] : undefined;
		return handler.app.modalDialogController.closeDialog(
			id,
			handler.player?.currentScope,
		);
	}
	closeInputBox(handler, paramsOrNotify);
}
