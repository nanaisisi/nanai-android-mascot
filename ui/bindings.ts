import { invoke as __TAURI_INVOKE } from "@tauri-apps/api/core";

export const commands = {
	testCommand: (): Promise<string> => __TAURI_INVOKE("test_command"),
	onMouseClick: (): Promise<string> => __TAURI_INVOKE("on_mouse_click"),
	onSecondChange: (): Promise<string> => __TAURI_INVOKE("on_second_change"),
	getShioriStatus: (): Promise<boolean> => __TAURI_INVOKE("get_shiori_status"),
	requestOverlayPermission: (): Promise<string> =>
		__TAURI_INVOKE("request_overlay_permission"),
	setupForegroundService: (enabled: boolean): Promise<string> =>
		__TAURI_INVOKE("setup_foreground_service", { enabled }),
};
