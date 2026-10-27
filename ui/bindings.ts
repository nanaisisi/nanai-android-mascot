import { invoke as __TAURI_INVOKE } from "@tauri-apps/api/core";

export const commands = {
	testCommand: (): Promise<string> => __TAURI_INVOKE("test_command"),
};
