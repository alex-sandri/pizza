import {
	checkNodeVersion,
	getConfigOptions,
	runCommand
} from "../../scripts/utilities";

export const configApply = (cwd?: string): void =>
{
	checkNodeVersion();

	getConfigOptions(cwd);

	runCommand("npx tsc webpack.config.ts --esModuleInterop", cwd);
};
