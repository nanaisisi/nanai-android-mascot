/**
 * @file rect.js
 * @brief バルーンの有効領域 (validrect)、9スライス、改行/最大表示領域 (wordwrappoint) 設定反映 (UKADOC準拠)
 */

export function applyValidRectProperties(
	root: HTMLElement,
	props: Record<string, string>,
) {
	// [validrect.left,座標], [validrect.top,座標], [validrect.right,座標], [validrect.bottom,座標]:
	const vl = parseInt(props["validrect.left"], 10);
	const vt = parseInt(props["validrect.top"], 10);
	const vr = parseInt(props["validrect.right"], 10);
	const vb = parseInt(props["validrect.bottom"], 10);
	if (
		!Number.isNaN(vl) &&
		!Number.isNaN(vt) &&
		!Number.isNaN(vr) &&
		!Number.isNaN(vb)
	) {
		const parseVal = (val: number) => {
			if (Number.isNaN(val)) return 16;
			return Math.max(4, Math.abs(val));
		};

		const sliceTop = parseVal(vt);
		const sliceRight = parseVal(vr);
		const sliceBottom = parseVal(vb);
		const sliceLeft = parseVal(vl);

		const padTop = `${sliceTop}px`;
		const padRight = `${sliceRight}px`;
		const padBottom = `${sliceBottom}px`;
		const padLeft = `${sliceLeft}px`;

		const balloonEl = document.querySelector(".balloon") as HTMLElement | null;
		if (balloonEl) {
			balloonEl.style.padding = `${padTop} ${padRight} ${padBottom} ${padLeft}`;
		}
		root.style.setProperty(
			"--balloon-padding",
			`${padTop} ${padRight} ${padBottom} ${padLeft}`,
		);
		root.style.setProperty(
			"--balloon-border-image-slice",
			`${sliceTop} ${sliceRight} ${sliceBottom} ${sliceLeft} fill`,
		);
		root.style.setProperty(
			"--balloon-border-image-width",
			`${sliceTop}px ${sliceRight}px ${sliceBottom}px ${sliceLeft}px`,
		);
	}

	root.style.setProperty(
		"--balloon-border-image-repeat",
		props["border.repeat"] || "repeat",
	);

	// [wordwrappoint.x,座標], [wordwrappoint.y,座標]:
	if (props["wordwrappoint.x"]) {
		const ww = parseInt(props["wordwrappoint.x"], 10);
		if (!Number.isNaN(ww) && ww > 50) {
			const textEl = document.querySelector(
				".balloon-text",
			) as HTMLElement | null;
			if (textEl) {
				textEl.style.maxWidth = `${ww}px`;
			}
			root.style.setProperty("--balloon-max-width", `${ww}px`);
		}
	}

	const wwY = parseInt(props["wordwrappoint.y"], 10);
	if (!Number.isNaN(wwY) && wwY > 20) {
		const textEl = document.querySelector(
			".balloon-text",
		) as HTMLElement | null;
		if (textEl) {
			textEl.style.maxHeight = `${wwY}px`;
		}
		root.style.setProperty("--balloon-max-height", `${wwY}px`);
	}
}
