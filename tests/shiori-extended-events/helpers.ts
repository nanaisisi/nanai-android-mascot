import { vi } from "vitest";
import { eventMethods } from "../../ui/ts/core/app-events.js";
import type { LifecycleContext } from "../../ui/ts/ghost/shiori-notify/ghost-lifecycle/lifecycle-events.js";
import { shioriNotifyMethods } from "../../ui/ts/ghost/shiori-notify.js";

export type MockNotifyObject = Omit<
	typeof shioriNotifyMethods,
	"sendShioriNotify"
> &
	LifecycleContext;

export function createMockNotifyObj(
	controller: MockShioriController,
): MockNotifyObject {
	return {
		...shioriNotifyMethods,
		sendShioriNotify: controller.sendShioriNotify,
	} as unknown as MockNotifyObject;
}

export interface MockShioriController {
	app: { ghostId: string };
	currentGhost: {
		name: string;
		sakura_name: string;
		kero_name: string;
		path: string;
	};
	ghosts: string[];
	shells: string[];
	balloons: string[];
	balloonPaths: string[];
	sendShioriNotify: ReturnType<typeof vi.fn>;
	sendShioriEvent: ReturnType<typeof vi.fn>;
}

export function createMockShioriController(): MockShioriController {
	return {
		app: { ghostId: "test-ghost" },
		currentGhost: {
			name: "TestGhost",
			sakura_name: "TestSakura",
			kero_name: "TestKero",
			path: "/ghosts/test_ghost",
		},
		ghosts: [],
		shells: ["master"],
		balloons: ["default"],
		balloonPaths: ["assets/balloon/default"],
		sendShioriNotify: vi.fn().mockResolvedValue({ status: 200 }),
		sendShioriEvent: vi
			.fn()
			.mockResolvedValue({ status: 200, script: "\\0OK\\e" }),
	};
}

export function createMockAppEvents(controller: MockShioriController) {
	return {
		...eventMethods,
		sakuraPlayer: { timeCritical: false, isPlaying: false },
		ghostController: controller,
		surfaceManager: {
			detectCollision: vi.fn().mockReturnValue({
				name: "head",
				canvasX: 120,
				canvasY: 85,
			}),
		},
	};
}
