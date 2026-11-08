export function createColorDialogForm(
	context: any,
	title: string,
	initialColor: string,
	eventId: string,
	sendSuccess: (rgbStr: string) => Promise<void>,
	sendCancel: () => Promise<void>,
) {
	const form = document.createElement("div");
	form.className = "balloon-inputbox-form balloon-color-dialog";
	form.style.marginTop = "0.5rem";
	form.style.display = "flex";
	form.style.alignItems = "center";
	form.style.gap = "0.5rem";

	if (title) {
		const label = document.createElement("span");
		label.textContent = title;
		label.style.fontSize = "0.8rem";
		form.appendChild(label);
	}

	const colorInput = document.createElement("input");
	colorInput.type = "color";
	colorInput.value = initialColor;
	colorInput.style.cursor = "pointer";
	colorInput.style.border = "none";
	colorInput.style.background = "none";
	colorInput.style.width = "2rem";
	colorInput.style.height = "2rem";

	const submitBtn = document.createElement("button");
	submitBtn.textContent = "OK";
	submitBtn.className = "balloon-choice-btn";
	submitBtn.style.marginTop = "0";

	const cancelBtn = document.createElement("button");
	cancelBtn.textContent = "Cancel";
	cancelBtn.className = "balloon-choice-btn";
	cancelBtn.style.marginTop = "0";

	const boxKey = `dialog:${eventId}`;
	const cleanup = () => {
		form.remove();
		context.activeBoxes.delete(boxKey);
	};

	submitBtn.addEventListener("click", async (e) => {
		e.stopPropagation();
		const hex = colorInput.value.replace("#", "");
		const r = Number.parseInt(hex.slice(0, 2), 16) || 0;
		const g = Number.parseInt(hex.slice(2, 4), 16) || 0;
		const b = Number.parseInt(hex.slice(4, 6), 16) || 0;
		const rgbStr = `${r},${g},${b}`;
		cleanup();
		await sendSuccess(rgbStr);
	});

	cancelBtn.addEventListener("click", async (e) => {
		e.stopPropagation();
		cleanup();
		await sendCancel();
	});

	form.appendChild(colorInput);
	form.appendChild(submitBtn);
	form.appendChild(cancelBtn);

	return { form, boxKey, cleanup };
}

export function createTermsDialogForm(
	context: any,
	title: string,
	id: string,
	eventId: string,
) {
	const form = document.createElement("div");
	form.className = "balloon-inputbox-form balloon-terms-dialog";
	form.style.marginTop = "0.5rem";
	form.style.display = "flex";
	form.style.flexDirection = "column";
	form.style.gap = "0.5rem";

	if (title) {
		const label = document.createElement("span");
		label.textContent = title;
		label.style.fontWeight = "bold";
		form.appendChild(label);
	}

	const btnRow = document.createElement("div");
	btnRow.style.display = "flex";
	btnRow.style.gap = "0.5rem";

	const acceptBtn = document.createElement("button");
	acceptBtn.textContent = "同意する";
	acceptBtn.className = "balloon-choice-btn";

	const declineBtn = document.createElement("button");
	declineBtn.textContent = "同意しない";
	declineBtn.className = "balloon-choice-btn";

	btnRow.appendChild(acceptBtn);
	btnRow.appendChild(declineBtn);
	form.appendChild(btnRow);

	const boxKey = `dialog:${eventId}`;
	const cleanup = () => {
		form.remove();
		context.activeBoxes.delete(boxKey);
	};

	acceptBtn.addEventListener("click", async (e) => {
		e.stopPropagation();
		cleanup();
		await context.app?.ghostController?.sendShioriEvent?.(
			"OnGhostTermsAccept",
			id ? [id] : [],
		);
	});

	declineBtn.addEventListener("click", async (e) => {
		e.stopPropagation();
		cleanup();
		await context.app?.ghostController?.sendShioriEvent?.(
			"OnGhostTermsDecline",
			id ? [id] : [],
		);
	});

	return { form, boxKey, cleanup };
}
