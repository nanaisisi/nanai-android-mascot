import { execSync } from "node:child_process";

export const projectRoot = process.cwd();
export let hasError = false;

export function setHasError(val: boolean) {
	hasError = val;
}

export function getHasError(): boolean {
	return hasError;
}

export function runStepCommand(
	command: string,
	successMessage: string,
	errorMessage: string,
): boolean {
	try {
		execSync(command, { stdio: "inherit", cwd: projectRoot });
		if (successMessage) {
			console.log(successMessage);
		}
		return true;
	} catch (_err) {
		console.error(errorMessage);
		hasError = true;
		return false;
	}
}
