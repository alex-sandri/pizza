import * as fs from "fs-extra";
import path from "path";

import * as _ from "lodash";

import {
    checkNodeVersion,
    getConfigOptions,
    runCommand
} from "../../scripts/utilities";

export const configApply = (cwd?: string) =>
{
    checkNodeVersion();

    const configOptions = getConfigOptions(cwd);

    runCommand("npx tsc webpack.config.ts --esModuleInterop", cwd);

    if (configOptions.override?.typescript)
    {
        const tsConfigPath = path.join(cwd ?? process.cwd(), "tsconfig.json");
        const tsConfig = fs.readJSONSync(tsConfigPath);

        _.merge(tsConfig, configOptions.override.typescript);

        fs.writeJSONSync(tsConfigPath, tsConfig);
    }
}