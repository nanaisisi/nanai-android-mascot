import { describe, expect, it, vi } from "vitest";
import { AndroidBridge, DockManager } from "../../ui/ts/ui/touch/index.js";

function createMockDomElement() {
	const classListSet = new Set();
	const listeners = new Map();

	return {
		classList: {
			add: (...classes: unknown) => {
				for (const cls of classes) classListSet.add(cls);
			},
			remove: (...classes: unknown) => {
				for (const cls of classes) classListSet.delete(cls);
			},
			contains: (cls: unknown) => classListSet.has(cls),
			toggle: (cls: unknown) => {
				if (classListSet.has(cls)) {
					classListSet.delete(cls);
					return false;
				}
				classListSet.add(cls);
				return true;
			},
		},
		addEventListener: (event: unknown, handler: unknown) => {
			if (!listeners.has(event)) {
				listeners.set(event, new Set());
			}
			listeners.get(event).add(handler);
		},
		removeEventListener: (event: unknown, handler: unknown) => {
			const set = listeners.get(event);
			if (set) {
				set.delete(handler);
			}
		},
		dispatchEvent: (evt: { type: unknown; }) => {
			const set = listeners.get(evt.type);
			if (set) {
				for (const handler of Array.from(set)) {
					handler(evt);
				}
			}
		},
		get listenerMap() {
			return listeners;
		},
	};
}

describe("DockManager & AndroidBridge DOM Synchronization (Cycle 8)", () => {
	it("attaches DOM element and synchronizes dock state classes (is-docked-left, is-docked-right)", () => {
		const el = createMockDomElement();
		const dispatchFn = vi.fn();
		const dock = new DockManager({ dispatchFn, element: el });

		expect(dock.attachedElement).toBe(el);
		expect(el.classList.contains("is-docked-left")).toBe(false);
		expect(el.classList.contains("is-docked-right")).toBe(false);

		// Collapse to left
		dock.collapse("left");
		expect(dock.dockState).toBe("left");
		expect(dock.isDocked).toBe(true);
		expect(el.classList.contains("is-docked-left")).toBe(true);
		expect(el.classList.contains("is-docked-right")).toBe(false);

		// Collapse to right
		dock.collapse("right");
		expect(dock.dockState).toBe("right");
		expect(el.classList.contains("is-docked-left")).toBe(false);
		expect(el.classList.contains("is-docked-right")).toBe(true);

		// Restore to floating state
		dock.restore();
		expect(dock.dockState).toBe("none");
		expect(dock.isDocked).toBe(false);
		expect(el.classList.contains("is-docked-left")).toBe(false);
		expect(el.classList.contains("is-docked-right")).toBe(false);

		// Detach element cleans up classes
		dock.collapse("left");
		expect(el.classList.contains("is-docked-left")).toBe(true);
		dock.detachElement();
		expect(dock.attachedElement).toBeNull();
		expect(el.classList.contains("is-docked-left")).toBe(false);
	});

	it("restores from docked state when clicking/tapping the attached element", () => {
		const el = createMockDomElement();
		const dock = new DockManager({ element: el });

		dock.collapse("right");
		expect(dock.isDocked).toBe(true);
		expect(el.classList.contains("is-docked-right")).toBe(true);

		// Trigger click on element while docked
		const clickEvent = {
			type: "click",
			stopPropagation: vi.fn(),
			preventDefault: vi.fn(),
		};
		el.dispatchEvent(clickEvent);

		expect(clickEvent.stopPropagation).toHaveBeenCalled();
		expect(clickEvent.preventDefault).toHaveBeenCalled();
		expect(dock.isDocked).toBe(false);
		expect(dock.dockState).toBe("none");
		expect(el.classList.contains("is-docked-right")).toBe(false);

		// Dock left and trigger touchend
		dock.collapse("left");
		expect(dock.isDocked).toBe(true);
		const touchEvent = {
			type: "touchend",
			stopPropagation: vi.fn(),
			preventDefault: vi.fn(),
		};
		el.dispatchEvent(touchEvent);

		expect(touchEvent.stopPropagation).toHaveBeenCalled();
		expect(touchEvent.preventDefault).toHaveBeenCalled();
		expect(dock.isDocked).toBe(false);
		expect(dock.dockState).toBe("none");
		expect(el.classList.contains("is-docked-left")).toBe(false);
	});

	it("does not restore on click/touch if element is not docked", () => {
		const el = createMockDomElement();
		const dock = new DockManager({ element: el });

		expect(dock.isDocked).toBe(false);
		const clickEvent = {
			type: "click",
			stopPropagation: vi.fn(),
			preventDefault: vi.fn(),
		};
		el.dispatchEvent(clickEvent);

		expect(clickEvent.stopPropagation).not.toHaveBeenCalled();
		expect(dock.dockState).toBe("none");
	});

	it("re-attaching a different element cleans up previous listeners and classes", () => {
		const el1 = createMockDomElement();
		const el2 = createMockDomElement();
		const dock = new DockManager();

		dock.attachElement(el1);
		dock.collapse("left");
		expect(el1.classList.contains("is-docked-left")).toBe(true);

		// Re-attach same element is no-op
		dock.attachElement(el1);
		expect(dock.attachedElement).toBe(el1);

		// Attach el2
		dock.attachElement(el2);
		expect(el1.classList.contains("is-docked-left")).toBe(false);
		expect(el2.classList.contains("is-docked-left")).toBe(true);
		expect(dock.attachedElement).toBe(el2);

		// Click on el1 does not restore dock
		el1.dispatchEvent({ type: "click" });
		expect(dock.dockState).toBe("left");

		// Click on el2 restores dock
		el2.dispatchEvent({ type: "click" });
		expect(dock.dockState).toBe("none");
		expect(el2.classList.contains("is-docked-left")).toBe(false);
	});

	it("coordinates DOM attachment and lifecycle through AndroidBridge facade", () => {
		const el = createMockDomElement();
		const bridge = new AndroidBridge({ element: el });

		expect(bridge.attachedElement).toBe(el);
		expect(bridge.getState().hasAttachedElement).toBe(true);
		expect(bridge.getState().isDocked).toBe(false);

		// Toggle dock
		bridge.toggleDock("right");
		expect(bridge.isDocked).toBe(true);
		expect(bridge.getDockMode()).toBe("right");
		expect(el.classList.contains("is-docked-right")).toBe(true);

		// Expand via bridge
		bridge.expand();
		expect(bridge.isDocked).toBe(false);
		expect(el.classList.contains("is-docked-right")).toBe(false);

		// Detach dock element
		bridge.attachDockElement(null);
		expect(bridge.attachedElement).toBeNull();
		expect(bridge.getState().hasAttachedElement).toBe(false);

		// Reattach el and collapse left
		bridge.attachDockElement(el);
		bridge.collapse("left");
		expect(el.classList.contains("is-docked-left")).toBe(true);

		bridge.destroy();
		expect(bridge.attachedElement).toBeNull();
		expect(el.classList.contains("is-docked-left")).toBe(false);
		expect(bridge.isDocked).toBe(false);
	});
});
