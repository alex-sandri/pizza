import {
    checkNodeVersion,
    getConfigOptions,
    runCommand
} from "../../scripts/utilities";

export const configApply = (cwd?: string) =>
{
    checkNodeVersion();

    getConfigOptions(cwd);

    runCommand("tsc webpack.config.ts --esModuleInterop", cwd);
}