import assert from "node:assert/strict";
import { test } from "vitest";

interface MockMenuEl {
	tagName: string;
	className: string;
	innerHTML: string;
	dataset: Record<string, string>;
	_listeners?: Record<string, (e?: unknown) => void>;
	[key: string]: unknown;
	appendChild: () => void;
	setAttribute: (name: string, val: unknown) => void;
	getAttribute: (name: string) => unknown;
	addEventListener: (type: string, cb: (e?: unknown) => void) => void;
	click: () => void;
}

const createdButtons: MockMenuEl[] = [];
const styleProps: Record<string, string> = {};

globalThis.window = globalThis as unknown as Window & typeof globalThis;
globalThis.document = {
	getElementById(_id: string) {
		const container = {
			innerHTML: "",
			children: [] as unknown[],
			appendChild(child: unknown) {
				if (child) container.children.push(child);
			},
			querySelector: () => null,
			querySelectorAll: () => [],
		};
		return container as unknown as HTMLElement;
	},
	documentElement: {
		setAttribute() {},
		style: {
			setProperty(p: string, v: string) {
				styleProps[p] = v;
			},
			removeProperty(p: string) {
				delete styleProps[p];
				return "";
			},
		},
	},
	body: {
		classList: (() => {
			const classes = new Set<string>();
			return {
				classes,
				add(c: string) {
					classes.add(c);
				},
				remove(...args: string[]) {
					for (const c of args) classes.delete(c);
				},
				contains(c: string) {
					return classes.has(c);
				},
			};
		})() as unknown as DOMTokenList,
	},
	createElement(tag: string) {
		const el: MockMenuEl = {
			tagName: tag.toUpperCase(),
			className: "",
			innerHTML: "",
			dataset: {},
			appendChild() {},
			setAttribute(name: string, val: unknown) {
				this[name] = val;
			},
			getAttribute(name: string) {
				return this[name];
			},
			addEventListener(type: string, cb: (e?: unknown) => void) {
				this._listeners = this._listeners || {};
				this._listeners[type] = cb;
			},
			click() {
				this._listeners?.click?.({ stopPropagation() {} });
			},
		};
		if (tag === "button") createdButtons.push(el);
		return el as unknown as HTMLElement;
	},
} as unknown as Document;

const { MenuRenderer } = await import("../ui/ts/ui/renderers/menu-renderer.js");

test("MenuRenderer covers initialization, delegation, and dynamic item creation", () => {
	const dispatched: Array<{ action: string; payload: unknown }> = [];
	const dispatcher = {
		async dispatchAction(action: string, payload?: unknown) {
			dispatched.push({ action, payload });
		},
	};

	const renderer = new MenuRenderer({ dispatcher });

	// 1. init with root element
	const mockItem: {
		_listeners?: Record<string, (e?: unknown) => void>;
		getAttribute: (name: string) => string | null;
		addEventListener: (type: string, cb: (e?: unknown) => void) => void;
	} = {
		getAttribute(name: string) {
			return name === "data-action" ? "test-action" : null;
		},
		addEventListener(type: string, cb: (e?: unknown) => void) {
			this._listeners = this._listeners || {};
			this._listeners[type] = cb;
		},
	};
	const mockRoot = {
		querySelectorAll(sel: string) {
			if (sel === ".menu-item[data-action]") {
				return [mockItem];
			}
			return [];
		},
	} as unknown as ParentNode;
	renderer.init(mockRoot);
	mockItem._listeners?.click?.({ stopPropagation() {} });
	assert.ok(dispatched.some((d) => d.action === "test-action"));

	// 2. createMenuItem (button, current, disabled, shortcut)
	const disabledItem = renderer.createMenuItem({
		label: "Disabled Item",
		disabled: true,
	});
	assert.equal(disabledItem.className, "menu-item is-disabled");

	const activeBtn = renderer.createMenuItem({
		label: "Active Item",
		action: "custom-action",
		isCurrent: true,
		shortcut: "Ctrl+T",
	});
	assert.ok(activeBtn.className.includes("is-current"));
	assert.ok(activeBtn.innerHTML.includes("✓ Active Item"));
	assert.ok(activeBtn.innerHTML.includes("Ctrl+T"));
	activeBtn.click();
	assert.ok(dispatched.some((d) => d.action === "custom-action"));

	// 3. Submenu delegation methods
	renderer.renderShellSubmenu(["master", "alt"], "master");
	renderer.renderBalloonSubmenu(
		[{ dir_name: "ivory", name: "Ivory" }],
		"ivory",
	);
	renderer.renderGhostSubmenu([{ name: "G1" }], { name: "G1" });
	renderer.renderCallGhostSubmenu([{ name: "G2" }]);
	renderer.renderDressupSubmenu(null, 0);
	renderer.renderRecentSubmenu(["G1", "G2"]);

	// 4. Theme application
	renderer.applyTheme("dark");
	renderer.applyShellTheme(null);

	// 5. Shell Menu Theme with frame color & font (Cycle 4)
	renderer.applyShellTheme({
		path: "/dummy/shell",
		menu_theme: {
			frame_color: "rgb(20, 30, 40)",
			font_name: "MS Gothic",
			font_height: 12,
		},
	});
	assert.equal(styleProps["--balloon-border-color"], "rgb(20, 30, 40)");
	assert.equal(styleProps["--balloon-font-family"], "MS Gothic");
	assert.equal(styleProps["--balloon-font-size"], "12px");

	// 6. Dynamic Captions (Cycle 5)
	const mockBiffBtn = {
		id: "biff-btn",
		querySelector(_sel: string) {
			return this.span;
		},
		span: { textContent: "Mail" },
	};
	const mockDocument = {
		getElementById(id: string) {
			if (id === "biff-btn") return mockBiffBtn;
			return null;
		},
	} as unknown as Document;

	renderer.applyCaptions(
		{ "biffbutton.caption": "Check Mail Now" },
		mockDocument,
	);
	assert.equal(mockBiffBtn.span.textContent, "Check Mail Now");

	// Fetch captions from ghost controller mock
	const mockGhostController = {
		async requestShioriResource(id: string) {
			if (id === "biffbutton.caption") return "Custom Biff";
			if (id === "calendarbutton.caption") return "My Calendar";
			return "";
		},
	};
	return renderer.fetchCaptions(mockGhostController).then((captions) => {
		assert.equal(captions["biffbutton.caption"], "Custom Biff");
		assert.equal(captions["calendarbutton.caption"], "My Calendar");
	});
});

test("MENU_CAPTION_DEFINITIONS contains 92 standard UKADOC captions and resolves correctly", async () => {
	const { MENU_CAPTION_DEFINITIONS, menuCaptionRenderer } = await import(
		"../ui/ts/ui/renderers/menu-caption-renderer.js"
	);
	assert.equal(MENU_CAPTION_DEFINITIONS.length, 92);

	const resources = new Set(MENU_CAPTION_DEFINITIONS.map((d) => d.resource));
	assert.ok(resources.has("switchreloadbutton.caption"));
	assert.ok(resources.has("switchrootbutton.caption"));
	assert.ok(resources.has("historyrootbutton.caption"));
	assert.ok(resources.has("sntpbutton.caption"));
	assert.ok(resources.has("alignrootbutton.caption"));
	assert.ok(resources.has("termsbutton.caption"));

	interface MockCaptionElement {
		id: string;
		span: { textContent: string };
		querySelector: (sel: string) => { textContent: string } | null;
	}
	const elementMap = new Map<string, MockCaptionElement>();
	const mockDoc = {
		getElementById(id: string) {
			if (!elementMap.has(id)) {
				elementMap.set(id, {
					id,
					span: { textContent: "Original" },
					querySelector(sel: string) {
						return sel.includes("span") ? this.span : null;
					},
				});
			}
			return elementMap.get(id);
		},
	};

	menuCaptionRenderer.applyCaptions(
		{
			"switchreloadbutton.caption": "リロード切替",
			"sntpbutton.caption": "時計合わせ",
		},
		mockDoc as unknown as Document,
	);

	const reloadEl = mockDoc.getElementById("switch-reload-btn");
	assert.equal(reloadEl?.span.textContent, "リロード切替");

	const sntpEl = mockDoc.getElementById("sntp-btn");
	assert.equal(sntpEl?.span.textContent, "時計合わせ");
});
