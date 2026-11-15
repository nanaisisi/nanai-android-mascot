/**
 * @file mock-dom.ts
 * @brief Mock DOM element implementation for Node/Vitest environment
 */

export interface MockDomElement {
	tagName: string;
	id: string;
	className: string;
	dataset: Record<string, string>;
	style: Record<string, string>;
	title: string;
	innerHTML: string;
	textContent: string;
	offsetLeft: number;
	offsetTop: number;
	offsetWidth: number;
	offsetHeight: number;
	clientWidth: number;
	clientHeight: number;
	children: MockDomElement[];
	parentNode: MockDomElement | null;
	removed?: boolean;
	classList: {
		add(cls: string): void;
		remove(cls: string): void;
		contains(cls: string): boolean;
		toggle(cls: string): void;
	};
	appendChild(child: MockDomElement): MockDomElement;
	remove(): void;
	addEventListener(
		event: string,
		handler: (e?: unknown) => void,
		options?: unknown,
	): void;
	removeEventListener(event: string, handler: (e?: unknown) => void): void;
	dispatchEvent(event: unknown): boolean;
	closest(selector: string): MockDomElement | null;
}

export function createMockDomElement(tag = "div"): MockDomElement {
	const classListSet = new Set<string>();
	const listeners: Record<string, Array<(e?: unknown) => void>> = {};
	const children: MockDomElement[] = [];

	const el: MockDomElement = {
		tagName: tag.toUpperCase(),
		id: "",
		className: "",
		dataset: {},
		style: {},
		title: "",
		innerHTML: "",
		textContent: "",
		offsetLeft: 100,
		offsetTop: 100,
		offsetWidth: 200,
		offsetHeight: 150,
		clientWidth: 200,
		clientHeight: 150,
		children,
		parentNode: null,
		classList: {
			add(cls: string) {
				classListSet.add(cls);
				el.className = Array.from(classListSet).join(" ");
			},
			remove(cls: string) {
				classListSet.delete(cls);
				el.className = Array.from(classListSet).join(" ");
			},
			contains(cls: string) {
				return classListSet.has(cls);
			},
			toggle(cls: string) {
				if (classListSet.has(cls)) {
					classListSet.delete(cls);
				} else {
					classListSet.add(cls);
				}
				el.className = Array.from(classListSet).join(" ");
			},
		},
		appendChild(child: MockDomElement) {
			child.parentNode = el;
			children.push(child);
			return child;
		},
		remove() {
			el.removed = true;
			if (el.parentNode && Array.isArray(el.parentNode.children)) {
				const idx = el.parentNode.children.indexOf(el);
				if (idx !== -1) el.parentNode.children.splice(idx, 1);
			}
		},
		addEventListener(event: string, handler: (e?: unknown) => void) {
			if (!listeners[event]) listeners[event] = [];
			listeners[event].push(handler);
		},
		removeEventListener(event: string, handler: (e?: unknown) => void) {
			if (!listeners[event]) return;
			listeners[event] = listeners[event].filter((h) => h !== handler);
		},
		dispatchEvent(event: unknown) {
			const type = (event as { type?: string })?.type || "click";
			const list = listeners[type] || [];
			for (const fn of list) {
				fn(event);
			}
			return true;
		},
		closest(selector: string) {
			if (selector === "button" && el.tagName === "BUTTON") return el;
			return null;
		},
	};
	return el;
}
