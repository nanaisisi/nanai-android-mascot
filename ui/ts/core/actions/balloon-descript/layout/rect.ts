import { parseValidRect } from "../../balloon-theme-dom.js";

export function applyValidRectProperties(
	root: HTMLElement,
	props: Record<string, string>,
) {
	const {
		top: sliceTop,
		right: sliceRight,
		bottom: sliceBottom,
		left: sliceLeft,
	} = parseValidRect(props);

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

	// [wordwrappoint.x,座標], [wordwrappoint.y,座標]:
	if (props["wordwrappoint.x"]) {
		const ww = parseInt(props["wordwrappoint.x"], 10);
		if (!Number.isNaN(ww) && (ww > 50 || ww < 0)) {
			const maxWidth = ww > 50 ? `${ww}px` : `calc(100% - ${Math.abs(ww)}px)`;
			const textEl = document.querySelector(
				".balloon-text",
			) as HTMLElement | null;
			if (textEl) {
				textEl.style.maxWidth = maxWidth;
			}
			root.style.setProperty("--balloon-max-width", maxWidth);
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
