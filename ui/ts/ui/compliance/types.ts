export interface UiComplianceProbeResult {
	id: string;
	category: string;
	specName: string;
	usagePath: string;
	passed: boolean;
	actualSummary: string;
	manualCheckHint: string;
}

export interface UiComplianceSuiteReport {
	total: number;
	passed: number;
	failed: number;
	passRate: number;
	results: UiComplianceProbeResult[];
	timestamp: string;
}

export interface VirtualStyle {
	setProperty(name: string, value: string): void;
	getPropertyValue(name: string): string;
	removeProperty(name: string): string;
	padding?: string;
	transform?: string;
	transformOrigin?: string;
	maxWidth?: string;
	maxHeight?: string;
}

export interface VirtualNode {
	tagName: string;
	className: string;
	type: string;
	value: string;
	textContent: string;
	style: VirtualStyle;
	children: VirtualNode[];
	parentNode: VirtualNode | null;
	appendChild(child: VirtualNode): VirtualNode;
	remove(): void;
	addEventListener(type: string, cb: (ev: VirtualEvent) => unknown): void;
	click(): void;
}

export interface VirtualEvent {
	target: VirtualNode;
	stopPropagation(): void;
	preventDefault(): void;
}

export function createVirtualStyle(): VirtualStyle {
	const vars = new Map<string, string>();
	return {
		setProperty(name: string, value: string) {
			vars.set(name, String(value));
		},
		getPropertyValue(name: string) {
			return vars.get(name) ?? "";
		},
		removeProperty(name: string) {
			const prev = vars.get(name) ?? "";
			vars.delete(name);
			return prev;
		},
	};
}

export function createVirtualNode(tagName: string): VirtualNode {
	const listeners = new Map<string, Array<(ev: VirtualEvent) => unknown>>();
	const node: VirtualNode = {
		tagName: tagName.toUpperCase(),
		className: "",
		type: "",
		value: "",
		textContent: "",
		style: createVirtualStyle(),
		children: [],
		parentNode: null,
		appendChild(child: VirtualNode) {
			child.parentNode = node;
			node.children.push(child);
			return child;
		},
		remove() {
			if (!node.parentNode) return;
			const idx = node.parentNode.children.indexOf(node);
			if (idx >= 0) {
				node.parentNode.children.splice(idx, 1);
			}
			node.parentNode = null;
		},
		addEventListener(type: string, cb: (ev: VirtualEvent) => unknown) {
			const list = listeners.get(type) ?? [];
			list.push(cb);
			listeners.set(type, list);
		},
		click() {
			const list = listeners.get("click") ?? [];
			const ev: VirtualEvent = {
				target: node,
				stopPropagation() {},
				preventDefault() {},
			};
			for (const cb of list) {
				cb(ev);
			}
		},
	};
	return node;
}

export function createStyleTarget(rootElement?: HTMLElement): HTMLElement {
	if (rootElement && typeof rootElement.style?.setProperty === "function") {
		return rootElement;
	}
	if (
		typeof document !== "undefined" &&
		typeof document.createElement === "function"
	) {
		const el = document.createElement("div");
		if (typeof el?.style?.setProperty === "function") {
			return el;
		}
	}
	return createVirtualNode("div") as unknown as HTMLElement;
}

export function readCssVar(target: HTMLElement, name: string): string {
	const styleObj = target.style as unknown as Record<string, unknown>;
	if (typeof styleObj?.getPropertyValue === "function") {
		const val = (styleObj.getPropertyValue as (prop: string) => string)(name);
		if (val) return String(val).trim();
	}
	const direct = styleObj?.[name];
	return typeof direct === "string" ? direct.trim() : "";
}

export function withSafeQueryDocument<T>(fn: () => T): T {
	const g = globalThis as unknown as { document?: Document };
	const hadDocument = "document" in g && g.document !== undefined;
	const origDocument = g.document;

	if (!origDocument || typeof origDocument.querySelector !== "function") {
		const base = (origDocument ?? {}) as unknown as Record<string, unknown>;
		g.document = {
			...base,
			querySelector: () => null,
		} as unknown as Document;
		try {
			return fn();
		} finally {
			if (hadDocument) {
				g.document = origDocument;
			} else {
				delete g.document;
			}
		}
	}

	const balloonEl = origDocument.querySelector(
		".balloon",
	) as HTMLElement | null;
	const textEl = origDocument.querySelector(
		".balloon-text",
	) as HTMLElement | null;
	const savedBalloon = balloonEl
		? {
				padding: balloonEl.style.padding,
				transform: balloonEl.style.transform,
				transformOrigin: balloonEl.style.transformOrigin,
			}
		: null;
	const savedText = textEl
		? {
				maxWidth: textEl.style.maxWidth,
				maxHeight: textEl.style.maxHeight,
			}
		: null;

	try {
		return fn();
	} finally {
		if (balloonEl && savedBalloon) {
			balloonEl.style.padding = savedBalloon.padding;
			balloonEl.style.transform = savedBalloon.transform;
			balloonEl.style.transformOrigin = savedBalloon.transformOrigin;
		}
		if (textEl && savedText) {
			textEl.style.maxWidth = savedText.maxWidth;
			textEl.style.maxHeight = savedText.maxHeight;
		}
	}
}

export function isCapableDomDocument(doc: Document | undefined): boolean {
	if (!doc || typeof doc.createElement !== "function") return false;
	try {
		const parent = doc.createElement("div");
		const child = doc.createElement("button");
		if (
			typeof parent?.appendChild !== "function" ||
			typeof child?.remove !== "function" ||
			typeof child?.addEventListener !== "function" ||
			typeof child?.click !== "function" ||
			parent?.children == null
		) {
			return false;
		}
		let fired = false;
		child.addEventListener("click", () => {
			fired = true;
		});
		parent.appendChild(child);
		child.click();
		const mounted = parent.children.length === 1;
		child.remove();
		const removed = Number(parent.children.length) === 0;
		return fired && mounted && removed;
	} catch {
		return false;
	}
}

export async function withCapableDomDocument<T>(fn: () => Promise<T>): Promise<T> {
	const g = globalThis as unknown as { document?: Document };
	const hadDocument = "document" in g && g.document !== undefined;
	const origDocument = g.document;

	if (isCapableDomDocument(origDocument)) {
		return await fn();
	}

	const base = (origDocument ?? {}) as unknown as Record<string, unknown>;
	g.document = {
		...base,
		createElement: (tag: string) => createVirtualNode(tag),
	} as unknown as Document;

	try {
		return await fn();
	} finally {
		if (hadDocument) {
			g.document = origDocument;
		} else {
			delete g.document;
		}
	}
}

export function collectNodes(root: unknown): Array<Record<string, unknown>> {
	const out: Array<Record<string, unknown>> = [];
	const visit = (node: unknown) => {
		if (!node || typeof node !== "object") return;
		const rec = node as Record<string, unknown>;
		out.push(rec);
		const children = rec.children as ArrayLike<unknown> | undefined;
		if (children) {
			for (let i = 0; i < children.length; i++) {
				visit(children[i]);
			}
		}
	};
	visit(root);
	return out;
}

export function escapeHtml(text: string): string {
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

export function wireManualCheckProgress(
	container: HTMLElement | null,
	total: number,
): void {
	if (!container || typeof container.querySelectorAll !== "function") return;
	const checks = container.querySelectorAll(".manual-verify-check");
	const update = () => {
		let checked = 0;
		checks.forEach?.((el) => {
			if ((el as HTMLInputElement).checked) checked++;
		});
		const progressEl =
			typeof document !== "undefined"
				? document.getElementById("manual-verify-progress")
				: null;
		if (progressEl) {
			progressEl.textContent = `目視確認: ${checked} / ${total}`;
		}
	};
	checks.forEach?.((el) => {
		el.addEventListener?.("change", update);
	});
}
