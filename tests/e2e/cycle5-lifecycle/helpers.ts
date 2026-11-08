export { createMockElement } from "../helpers.js";

export function createMockApp(
	events: any[],
	runningAnimations: Set<number>,
	sakuraDisplay: any,
	keroDisplay: any,
	sakuraText: any,
	keroText: any,
) {
	return {
		ghostId: "e2e_cycle5_ghost",
		elements: {
			balloonDisplay: sakuraDisplay,
			keroBalloonDisplay: keroDisplay,
			balloonText: sakuraText,
			keroBalloonText: keroText,
			sakuraSlot: {
				childNodes: [],
				className: "",
				style: {},
				appendChild: () => {},
				removeChild: () => {},
			},
			keroSlot: {
				childNodes: [],
				className: "",
				style: {},
				appendChild: () => {},
				removeChild: () => {},
			},
		},
		surfaceManager: {
			onCharSpoken() {},
			onTalkEnd() {},
			onScriptEnd(scope: number) {
				events.push({ type: "script_end", scope });
			},
			playAnimationById(animId: number, scope: number, wait: boolean) {
				events.push({ type: "anim_play", animId, scope, wait });
				runningAnimations.add(Number(animId));
			},
			stopAnimationById(animId: number, scope: number) {
				events.push({ type: "anim_stop", animId, scope });
				runningAnimations.delete(Number(animId));
			},
			isAnimationRunning(animId: number) {
				return runningAnimations.has(Number(animId));
			},
		},
		ghostController: {
			updateSurface() {},
			sendShioriEvent: async (eventName: string, args: unknown[]) => {
				events.push({ type: "shiori_event", eventName, args });
				return { status: 200, value: "" };
			},
		},
		modalDialogController: null as any,
	};
}
