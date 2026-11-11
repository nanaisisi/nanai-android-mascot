import assert from "node:assert/strict";
import { test } from "vitest";

const createdButtons = [];
const styleProps = {};

globalThis.window = globalThis;
globalThis.document = {
	getElementById(_id) {
		return {
			innerHTML: "",
			children: [],
			appendChild(child) {
				if (child) this.children.push(child);
			},
			querySelector: () => null,
			querySelectorAll: () => [],
		};
	},
	documentElement: {
		setAttribute() {},
		style: {
			setProperty(p, v) {
				styleProps[p] = v;
			},
			removeProperty(p) {
				delete styleProps[p];
			},
		},
	},
	body: {
		classList: {
			classes: new Set(),
			add(c) {
				this.classes.add(c);
			},
			remove(...args) {
				for (const c of args) this.classes.delete(c);
			},
			contains(c) {
				return this.classes.has(c);
			},
		},
	},
	createElement(tag) {
		const el = {
			tagName: tag.toUpperCase(),
			className: "",
			innerHTML: "",
			dataset: {},
			appendChild() {},
			setAttribute(name, val) {
				this[name] = val;
			},
			getAttribute(name) {
				return this[name];
			},
			addEventListener(type, cb) {
				this._listeners = this._listeners || {};
				this._listeners[type] = cb;
			},
			click() {
				this._listeners?.click?.({ stopPropagation() {} });
			},
		};
		if (tag === "button") createdButtons.push(el);
		return el;
	},
};

const { MenuRenderer } = await import("../ui/ts/ui/renderers/menu-renderer.js");

test("MenuRenderer covers initialization, delegation, and dynamic item creation", () => {
	const dispatched = [];
	const dispatcher = {
		dispatchAction(action, payload) {
			dispatched.push({ action, payload });
		},
	};

	const renderer = new MenuRenderer({ dispatcher });

	// 1. init with root element
	const mockItem = {
		getAttribute(name) {
			return name === "data-action" ? "test-action" : null;
		},
		addEventListener(type, cb) {
			this._listeners = this._listeners || {};
			this._listeners[type] = cb;
		},
	};
	const mockRoot = {
		querySelectorAll(sel) {
			if (sel === ".menu-item[data-action]") {
				return [mockItem];
			}
			return [];
		},
	};
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
		querySelector(_sel) {
			return this.span;
		},
		span: { textContent: "Mail" },
	};
	const mockDocument = {
		getElementById(id) {
			if (id === "biff-btn") return mockBiffBtn;
			return null;
		},
	};

	renderer.applyCaptions(
		{ "biffbutton.caption": "Check Mail Now" },
		mockDocument,
	);
	assert.equal(mockBiffBtn.span.textContent, "Check Mail Now");

	// Fetch captions from ghost controller mock
	const mockGhostController = {
		async requestShioriResource(id) {
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

	const elementMap = new Map();
	const mockDoc = {
		getElementById(id) {
			if (!elementMap.has(id)) {
				elementMap.set(id, {
					id,
					span: { textContent: "Original" },
					querySelector(sel) {
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
		mockDoc,
	);

	const reloadEl = mockDoc.getElementById("switch-reload-btn");
	assert.equal(reloadEl.span.textContent, "リロード切替");

	const sntpEl = mockDoc.getElementById("sntp-btn");
	assert.equal(sntpEl.span.textContent, "時計合わせ");
});
