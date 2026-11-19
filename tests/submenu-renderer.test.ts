import assert from "node:assert/strict";
import { test } from "vitest";

interface MockRendererElement {
	tagName: string;
	className: string;
	innerHTML: string;
	_listeners?: Record<string, (ev: unknown) => void>;
	addEventListener(type: string, cb: (ev: unknown) => void): void;
	click(): void;
}

interface DispatchedAction {
	action: string;
	payload?: unknown;
}

globalThis.window = globalThis as unknown as Window & typeof globalThis;
const children: MockRendererElement[] = [];
globalThis.document = {
	getElementById(id: string) {
		if (id === "submenu-content") {
			return {
				innerHTML: "",
				children,
				appendChild(child: MockRendererElement) {
					this.children.push(child);
				},
			};
		}
		return null;
	},
	createElement(tag: string): MockRendererElement {
		return {
			tagName: tag.toUpperCase(),
			className: "",
			innerHTML: "",
			addEventListener(type: string, cb: (ev: unknown) => void) {
				this._listeners = this._listeners || {};
				this._listeners[type] = cb;
			},
			click() {
				this._listeners?.click?.({});
			},
		};
	},
} as unknown as Document;

const { renderSubmenuContent } = await import(
	"../ui/ts/ui/submenu-renderer.js"
);

test("renderSubmenuContent covers all submenu types (ghost, shell, dressup, balloon, recent)", () => {
	const dispatched: DispatchedAction[] = [];
	const dispatchSubmenuAction = (action: string, payload?: unknown) => {
		dispatched.push({ action, payload });
	};

	// 1. type = "ghost"
	children.length = 0;
	renderSubmenuContent({
		currentSubmenuType: "ghost",
		cachedGhosts: ["Ghost1", { name: "Ghost2" }],
		currentGhostName: "Ghost1",
		cachedShells: [],
		currentShellName: "",
		cachedDressup: null,
		dressupScope: 0,
		cachedBalloons: [],
		currentBalloonTheme: "",
		cachedRecentGhosts: [],
		dispatchSubmenuAction,
	});
	assert.ok(children.length > 0);
	children[0].click();
	assert.equal(dispatched[0].action, "switch-ghost");

	// 2. type = "shell"
	children.length = 0;
	dispatched.length = 0;
	renderSubmenuContent({
		currentSubmenuType: "shell",
		cachedGhosts: [],
		currentGhostName: "",
		cachedShells: ["master", { name: "alt", display_name: "Alternative" }],
		currentShellName: "alt",
		cachedDressup: null,
		dressupScope: 0,
		cachedBalloons: [],
		currentBalloonTheme: "",
		cachedRecentGhosts: [],
		dispatchSubmenuAction,
	});
	assert.ok(children.length > 0);
	children[1].click();
	assert.equal(dispatched[0].action, "switch-shell");

	// 3. type = "dressup" (Sakura & Kero, empty categories)
	children.length = 0;
	dispatched.length = 0;
	renderSubmenuContent({
		currentSubmenuType: "dressup",
		cachedGhosts: [],
		currentGhostName: "",
		cachedShells: [],
		currentShellName: "",
		cachedDressup: {
			sakura: {
				categories: [
					{ category: "Hat", parts: [{ part: "Ribbon", on: true }] },
				],
			},
			kero: { categories: [] },
		},
		dressupScope: 0,
		cachedBalloons: [],
		currentBalloonTheme: "",
		cachedRecentGhosts: [],
		dispatchSubmenuAction,
	});
	assert.ok(children.length > 0);
	children[1].click(); // click part button
	assert.equal(dispatched[0].action, "dressup-toggle");

	// Test kero empty dressup
	children.length = 0;
	renderSubmenuContent({
		currentSubmenuType: "dressup",
		cachedGhosts: [],
		currentGhostName: "",
		cachedShells: [],
		currentShellName: "",
		cachedDressup: { sakura: { categories: [] }, kero: { categories: [] } },
		dressupScope: 1,
		cachedBalloons: [],
		currentBalloonTheme: "",
		cachedRecentGhosts: [],
		dispatchSubmenuAction,
	});
	assert.ok(children.length > 0); // shows "(着せ替えパーツなし)"

	// 4. type = "balloon"
	children.length = 0;
	dispatched.length = 0;
	renderSubmenuContent({
		currentSubmenuType: "balloon",
		cachedGhosts: [],
		currentGhostName: "",
		cachedShells: [],
		currentShellName: "",
		cachedDressup: null,
		dressupScope: 0,
		cachedBalloons: [{ dir_name: "ivory", name: "Ivory" }],
		currentBalloonTheme: "ivory",
		cachedRecentGhosts: [],
		dispatchSubmenuAction,
	});
	assert.ok(children.length > 0);
	children[0].click();
	assert.equal(dispatched[0].action, "balloon-theme-ivory");

	// 5. type = "recent" (with items and empty)
	children.length = 0;
	dispatched.length = 0;
	renderSubmenuContent({
		currentSubmenuType: "recent",
		cachedGhosts: [],
		currentGhostName: "",
		cachedShells: [],
		currentShellName: "",
		cachedDressup: null,
		dressupScope: 0,
		cachedBalloons: [],
		currentBalloonTheme: "",
		cachedRecentGhosts: ["Ghost1"],
		dispatchSubmenuAction,
	});
	assert.ok(children.length > 0);
	children[0].click();
	assert.equal(dispatched[0].action, "recent-ghost");

	// Empty recent
	children.length = 0;
	renderSubmenuContent({
		currentSubmenuType: "recent",
		cachedGhosts: [],
		currentGhostName: "",
		cachedShells: [],
		currentShellName: "",
		cachedDressup: null,
		dressupScope: 0,
		cachedBalloons: [],
		currentBalloonTheme: "",
		cachedRecentGhosts: [],
		dispatchSubmenuAction,
	});
	assert.ok(children.length > 0);

	// 6. type = "call-ghost" (with items and empty)
	children.length = 0;
	dispatched.length = 0;
	renderSubmenuContent({
		currentSubmenuType: "call-ghost",
		cachedGhosts: ["Ghost1", { name: "Ghost2" }],
		currentGhostName: "Ghost1",
		cachedShells: [],
		currentShellName: "",
		cachedDressup: null,
		dressupScope: 0,
		cachedBalloons: [],
		currentBalloonTheme: "",
		cachedRecentGhosts: [],
		dispatchSubmenuAction,
	});
	assert.equal(children.length, 2);
	children[0].click();
	assert.equal(dispatched[0].action, "call-ghost");
	assert.equal(dispatched[0].payload, "Ghost1");

	// Empty ghost list
	children.length = 0;
	renderSubmenuContent({
		currentSubmenuType: "ghost",
		cachedGhosts: [],
		currentGhostName: "",
		cachedShells: [],
		currentShellName: "",
		cachedDressup: null,
		dressupScope: 0,
		cachedBalloons: [],
		currentBalloonTheme: "",
		cachedRecentGhosts: [],
		dispatchSubmenuAction,
	});
	assert.equal(children.length, 1);
	assert.ok(children[0].className.includes("is-disabled"));

	assert.ok(true);
});

test("utility submenu places developer items immediately below open-folder and hides them when developer mode is disabled", () => {
	const g = globalThis as unknown as {
		localStorage?: Storage;
	};
	const origLocalStorage = g.localStorage;
	const dispatched: DispatchedAction[] = [];
	const dispatchSubmenuAction = (action: string, payload?: unknown) => {
		dispatched.push({ action, payload });
	};

	try {
		// 1. Developer mode enabled
		g.localStorage = {
			length: 1,
			clear: () => {},
			key: () => null,
			removeItem: () => {},
			setItem: () => {},
			getItem: (key: string) =>
				key === "nanai-android-mascot-settings"
					? JSON.stringify({ developerModeEnabled: true })
					: null,
		} satisfies Storage;

		children.length = 0;
		renderSubmenuContent({
			currentSubmenuType: "utility",
			cachedGhosts: [],
			currentGhostName: "",
			cachedShells: [],
			currentShellName: "",
			cachedDressup: null,
			dressupScope: 0,
			cachedBalloons: [],
			currentBalloonTheme: "",
			cachedRecentGhosts: [],
			dispatchSubmenuAction,
		});

		const labels = children.map((el) => el.innerHTML);
		const folderIdx = labels.findIndex((html) =>
			html.includes("フォルダを選択する (S)"),
		);
		const scriptLogIdx = labels.findIndex((html) =>
			html.includes("スクリプトログ (L)"),
		);
		const devPaletteIdx = labels.findIndex((html) =>
			html.includes("開発用パレット (D)"),
		);
		const clearCacheIdx = labels.findIndex((html) =>
			html.includes("ゴーストキャッシュ開放 (G)"),
		);

		assert.ok(folderIdx >= 0);
		assert.equal(scriptLogIdx, folderIdx + 1);
		assert.equal(devPaletteIdx, folderIdx + 2);
		assert.equal(clearCacheIdx, folderIdx + 3);
		assert.equal(
			children.some((el) => el.tagName === "HR"),
			false,
		);

		children[scriptLogIdx].click();
		children[devPaletteIdx].click();
		assert.deepEqual(
			dispatched.map((d) => d.action),
			["script-log", "dev-palette"],
		);

		// 2. Developer mode disabled
		g.localStorage = {
			length: 1,
			clear: () => {},
			key: () => null,
			removeItem: () => {},
			setItem: () => {},
			getItem: (key: string) =>
				key === "nanai-android-mascot-settings"
					? JSON.stringify({ developerModeEnabled: false })
					: null,
		} satisfies Storage;

		children.length = 0;
		renderSubmenuContent({
			currentSubmenuType: "utility",
			cachedGhosts: [],
			currentGhostName: "",
			cachedShells: [],
			currentShellName: "",
			cachedDressup: null,
			dressupScope: 0,
			cachedBalloons: [],
			currentBalloonTheme: "",
			cachedRecentGhosts: [],
			dispatchSubmenuAction,
		});

		const nonDevLabels = children.map((el) => el.innerHTML);
		const nonDevFolderIdx = nonDevLabels.findIndex((html) =>
			html.includes("フォルダを選択する (S)"),
		);
		const nonDevClearCacheIdx = nonDevLabels.findIndex((html) =>
			html.includes("ゴーストキャッシュ開放 (G)"),
		);
		assert.equal(
			nonDevLabels.some(
				(html) =>
					html.includes("スクリプトログ (L)") ||
					html.includes("開発用パレット (D)"),
			),
			false,
		);
		assert.equal(nonDevClearCacheIdx, nonDevFolderIdx + 1);
	} finally {
		if (origLocalStorage === undefined) {
			delete g.localStorage;
		} else {
			g.localStorage = origLocalStorage;
		}
	}
});
