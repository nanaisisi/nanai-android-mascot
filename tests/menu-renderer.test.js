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

const { MenuRenderer } = await import("../ui/js/ui/renderers/menu-renderer.js");

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
});
