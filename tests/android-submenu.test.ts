import assert from "node:assert/strict";
import { test } from "vitest";

type MockListener = (event: Record<string, unknown>) => unknown;

interface MockElement {
	id: string;
	tagName: string;
	hidden: boolean;
	scrollTop: number;
	textContent: string;
	_innerHTML: string;
	innerHTML: string;
	className: string;
	dataset: Record<string, string>;
	attributes: Record<string, string>;
	children: MockElement[];
	parentElement: MockElement | null;
	focused: boolean;
	rect: {
		left: number;
		right: number;
		top: number;
		width: number;
		height: number;
	};
	classList: {
		_classes: Set<string>;
		add: (...cls: string[]) => void;
		remove: (...cls: string[]) => void;
		contains: (cls: string) => boolean;
		toggle: (cls: string, force?: boolean) => boolean;
	};
	style: {
		left: string;
		top: string;
		setProperty: (p: string, v: string) => void;
		removeProperty: (p: string) => string;
	};
	setAttribute: (name: string, val: string) => void;
	getAttribute: (name: string) => string | null;
	getBoundingClientRect: () => {
		left: number;
		right: number;
		top: number;
		width: number;
		height: number;
	};
	appendChild: (child: MockElement) => MockElement;
	addEventListener: (type: string, cb: MockListener) => void;
	click: () => void;
	focus: () => void;
	closest: (sel: string) => MockElement | null;
	querySelector: (sel: string) => MockElement | null;
	querySelectorAll: (sel: string) => MockElement[];
	_listeners: Record<string, MockListener[]>;
}

const byId = new Map<string, MockElement>();
const documentListeners: Record<string, MockListener[]> = {};
const globalListeners: Record<string, MockListener[]> = {};
const parentMessages: Array<{ msg: unknown; origin: string }> = [];
const invokedCommands: string[] = [];

function createMockElement(
	tag: string,
	id = "",
	classes: string[] = [],
): MockElement {
	const classSet = new Set(classes);
	const styleObj = {
		left: "",
		top: "",
		setProperty() {},
		removeProperty() {
			return "";
		},
	};
	const el: MockElement = {
		id,
		tagName: tag.toUpperCase(),
		hidden: false,
		scrollTop: 0,
		textContent: "",
		_innerHTML: "",
		get innerHTML() {
			return this._innerHTML;
		},
		set innerHTML(val: string) {
			this._innerHTML = val;
			if (val === "") {
				this.children = [];
			}
		},
		className: classes.join(" "),
		dataset: {},
		attributes: {},
		children: [],
		parentElement: null,
		focused: false,
		rect: { left: 260, right: 460, top: 0, width: 200, height: 320 },
		_listeners: {},
		classList: {
			_classes: classSet,
			add(...cls: string[]) {
				for (const c of cls) classSet.add(c);
				el.className = Array.from(classSet).join(" ");
			},
			remove(...cls: string[]) {
				for (const c of cls) classSet.delete(c);
				el.className = Array.from(classSet).join(" ");
			},
			contains(cls: string) {
				return classSet.has(cls);
			},
			toggle(cls: string, force?: boolean) {
				const shouldAdd = force !== undefined ? force : !classSet.has(cls);
				if (shouldAdd) classSet.add(cls);
				else classSet.delete(cls);
				el.className = Array.from(classSet).join(" ");
				return shouldAdd;
			},
		},
		style: styleObj,
		setAttribute(name: string, val: string) {
			this.attributes[name] = val;
		},
		getAttribute(name: string) {
			return this.attributes[name] ?? null;
		},
		getBoundingClientRect() {
			return this.rect;
		},
		appendChild(child: MockElement) {
			child.parentElement = this;
			this.children.push(child);
			return child;
		},
		addEventListener(type: string, cb: MockListener) {
			this._listeners[type] ??= [];
			this._listeners[type].push(cb);
		},
		click() {
			const ev = {
				target: this,
				stopPropagation() {},
				preventDefault() {},
			};
			for (const cb of this._listeners.click ?? []) {
				cb(ev);
			}
			for (const cb of documentListeners.click ?? []) {
				cb(ev);
			}
		},
		focus() {
			this.focused = true;
		},
		closest(sel: string) {
			const tokens = sel.split(",").map((s) => s.trim());
			let cur: MockElement | null = this;
			while (cur) {
				for (const tok of tokens) {
					if (tok.startsWith("#") && cur.id === tok.slice(1)) return cur;
					if (tok.startsWith(".") && cur.classList.contains(tok.slice(1))) {
						return cur;
					}
				}
				cur = cur.parentElement;
			}
			return null;
		},
		querySelector(sel: string) {
			for (const child of this.children) {
				if (sel === "span" && child.tagName === "SPAN") return child;
				if (sel.startsWith("#") && child.id === sel.slice(1)) return child;
				if (sel.startsWith(".") && child.classList.contains(sel.slice(1))) {
					return child;
				}
			}
			return null;
		},
		querySelectorAll(sel: string) {
			const matches: MockElement[] = [];
			for (const child of this.children) {
				if (sel.startsWith(".") && child.classList.contains(sel.slice(1))) {
					matches.push(child);
				}
			}
			return matches;
		},
	};
	if (id) byId.set(id, el);
	return el;
}

const bodyEl = createMockElement("body");
const menuContainerEl = createMockElement("div", "", ["menu-container"]);
menuContainerEl.rect = {
	left: 260,
	right: 460,
	top: 0,
	width: 200,
	height: 420,
};
const inlinePanelEl = createMockElement("div", "inline-submenu-panel", [
	"inline-submenu-panel",
]);
inlinePanelEl.hidden = true;
inlinePanelEl.attributes["aria-busy"] = "true";
inlinePanelEl.rect = { left: 0, right: 180, top: 0, width: 180, height: 220 };

const submenuTriggers: Array<{ id: string; label: string }> = [
	{ id: "ghost-btn", label: "ゴースト切り替え(G)" },
	{ id: "call-ghost-btn", label: "他のゴーストを呼ぶ(Z)" },
	{ id: "shell-btn", label: "シェル(S)" },
	{ id: "dressup-btn", label: "着せ替え(C)" },
	{ id: "balloon-btn", label: "バルーン(B)" },
	{ id: "ghost-history-btn", label: "最近使ったもの(Y)" },
	{ id: "utility-root-btn", label: "機能(F)" },
	{ id: "config-btn", label: "設定(O)" },
	{ id: "shell-scale-root-btn", label: "シェル倍率(E)" },
	{ id: "balloon-scale-btn", label: "バルーン倍率(D)" },
	{ id: "plugin-btn", label: "プラグイン(P)" },
];

submenuTriggers.forEach(({ id, label }, idx) => {
	const btn = createMockElement("button", id, ["menu-item", "has-submenu"]);
	btn.rect = {
		left: 260,
		right: 460,
		top: 40 + idx * 20,
		width: 200,
		height: 20,
	};
	const span = createMockElement("span");
	span.textContent = label;
	btn.appendChild(span);
	menuContainerEl.appendChild(btn);
});

const g = globalThis as unknown as Record<string, unknown>;
g.__IS_ANDROID__ = true;
g.__IS_WINDOWS__ = false;
g.window = globalThis;
g.innerWidth = 460;
g.innerHeight = 580;
g.location = { search: "?scope=0" };
g.parent = {
	postMessage(msg: unknown, origin: string) {
		parentMessages.push({ msg, origin });
	},
};
g.localStorage = {
	length: 0,
	clear: () => {},
	key: () => null,
	removeItem: () => {},
	getItem: () => "nam",
	setItem: () => {},
};
g.document = {
	body: bodyEl,
	documentElement: {
		getAttribute: () => "nam",
		setAttribute() {},
		style: { removeProperty() {}, setProperty() {} },
	},
	getElementById(id: string) {
		return byId.get(id) ?? null;
	},
	querySelector(sel: string) {
		if (sel === ".menu-container") return menuContainerEl;
		return null;
	},
	querySelectorAll() {
		return [];
	},
	createElement(tag: string) {
		return createMockElement(tag);
	},
	addEventListener(type: string, cb: MockListener) {
		documentListeners[type] ??= [];
		documentListeners[type].push(cb);
	},
};
g.addEventListener = (type: string, cb: MockListener) => {
	globalListeners[type] ??= [];
	globalListeners[type].push(cb);
};
g.__TAURI_INTERNALS__ = {
	metadata: { currentWindow: { label: "main" } },
	invoke: async (cmd: string) => {
		invokedCommands.push(cmd);
		if (cmd === "plugin:event|listen") return 1;
		return null;
	},
	transformCallback: (cb: unknown) => cb,
};

await import("../ui/ts/ui/context-menu.js");

function dispatchWindowMessage(data: Record<string, unknown>) {
	for (const cb of globalListeners.message ?? []) {
		cb({ data });
	}
}

function dispatchKeydown(key: string) {
	let prevented = false;
	const ev = {
		key,
		ctrlKey: false,
		metaKey: false,
		shiftKey: false,
		preventDefault() {
			prevented = true;
		},
		stopPropagation() {},
	};
	for (const cb of documentListeners.keydown ?? []) {
		cb(ev);
	}
	return { prevented };
}

test("Android shows SSP submenu beside existing main menu without replacing it", () => {
	assert.equal(bodyEl.classList.contains("inline-submenu-mode"), true);

	// Opening balloon submenu before initial sync requests sync without direct invoke and live-renders on response
	parentMessages.length = 0;
	invokedCommands.length = 0;
	byId.get("balloon-btn")?.click();
	assert.equal(inlinePanelEl.hidden, false);
	assert.ok(inlinePanelEl.innerHTML.includes("読み込み中..."));
	assert.equal(invokedCommands.includes("scan_balloons"), false);
	assert.equal(
		parentMessages.some(
			(p) => (p.msg as { action?: string })?.action === "request-sync",
		),
		true,
	);

	// sync-scope with resetSubmenu: false keeps open submenu and sync-balloons live-updates it
	dispatchWindowMessage({ type: "sync-scope", scope: 0, resetSubmenu: false });
	assert.equal(inlinePanelEl.hidden, false);
	dispatchWindowMessage({
		type: "sync-balloons",
		balloons: [{ dir_name: "nam", name: "NAMデフォルト+" }],
	});
	assert.equal(inlinePanelEl.hidden, false);
	assert.ok(inlinePanelEl.children.length > 0);
	byId.get("balloon-btn")?.click();
	assert.equal(inlinePanelEl.hidden, true);

	dispatchWindowMessage({
		type: "sync-ghosts",
		ghosts: [{ name: "Nanai" }, { name: "Mock" }],
		currentGhost: "Nanai",
		recentGhosts: ["Nanai"],
		plugins: [{ name: "SamplePlugin" }],
		dressup: {
			sakura: {
				categories: [
					{ category: "Hat", parts: [{ part: "Ribbon", on: true }] },
				],
			},
			kero: { categories: [] },
		},
		scope: 0,
	});
	dispatchWindowMessage({
		type: "sync-shells",
		shells: [{ name: "master", display_name: "Master" }],
		currentShell: "master",
		currentGhost: "Nanai",
	});
	dispatchWindowMessage({
		type: "sync-balloons",
		balloons: [{ dir_name: "nam", name: "NAMデフォルト+" }],
	});
	dispatchWindowMessage({
		type: "sync-theme",
		theme: "nam",
	});

	for (const { id } of submenuTriggers) {
		const trigger = byId.get(id);
		assert.ok(trigger, `missing trigger ${id}`);

		for (const cb of documentListeners.mouseover ?? []) {
			cb({ target: trigger });
		}
		assert.equal(inlinePanelEl.hidden, true);

		trigger.click();
		assert.equal(
			menuContainerEl.hidden,
			false,
			"existing main menu must stay visible",
		);
		assert.equal(
			inlinePanelEl.hidden,
			false,
			`${id} should open submenu beside main menu`,
		);
		assert.equal(inlinePanelEl.getAttribute("aria-busy"), "false");
		assert.equal(trigger.getAttribute("aria-expanded"), "true");
		assert.ok(inlinePanelEl.children.length > 0, `${id} should render items`);
		assert.ok(inlinePanelEl.style.left.endsWith("px"));
		assert.ok(inlinePanelEl.style.top.endsWith("px"));
		assert.equal(invokedCommands.includes("show_submenu_window"), false);

		// Tapping the same trigger again toggles the submenu closed
		trigger.click();
		assert.equal(inlinePanelEl.hidden, true);
		assert.equal(inlinePanelEl.getAttribute("aria-busy"), "true");
		assert.equal(trigger.getAttribute("aria-expanded"), "false");
	}

	// Escape and ArrowLeft close only submenu level and restore focus
	const shellTrigger = byId.get("shell-btn");
	assert.ok(shellTrigger);
	parentMessages.length = 0;
	shellTrigger.click();
	assert.equal(inlinePanelEl.hidden, false);
	shellTrigger.focused = false;
	const escResult = dispatchKeydown("Escape");
	assert.equal(escResult.prevented, true);
	assert.equal(inlinePanelEl.hidden, true);
	assert.equal(menuContainerEl.hidden, false);
	assert.equal(shellTrigger.focused, true);
	assert.equal(parentMessages.length, 0);

	shellTrigger.click();
	assert.equal(inlinePanelEl.hidden, false);
	const leftResult = dispatchKeydown("ArrowLeft");
	assert.equal(leftResult.prevented, true);
	assert.equal(inlinePanelEl.hidden, true);

	// Clicking a submenu item dispatches once via parent.postMessage (not Tauri emit)
	parentMessages.length = 0;
	invokedCommands.length = 0;
	byId.get("ghost-btn")?.click();
	const ghostItem = inlinePanelEl.children[0];
	assert.ok(ghostItem);
	ghostItem.click();
	assert.equal(parentMessages.length, 1);
	assert.equal(
		(parentMessages[0].msg as { action: string }).action,
		"switch-ghost",
	);
	assert.equal(invokedCommands.includes("plugin:event|emit"), false);
	assert.equal(inlinePanelEl.hidden, true);

	// sync-scope closes any open inline submenu
	byId.get("balloon-btn")?.click();
	assert.equal(inlinePanelEl.hidden, false);
	dispatchWindowMessage({ type: "sync-scope", scope: 1 });
	assert.equal(inlinePanelEl.hidden, true);
	assert.equal(menuContainerEl.hidden, false);
});
