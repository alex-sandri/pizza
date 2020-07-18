import path from "path";
import fs from "fs-extra";
import childProcess from "child_process";

import pkg from "../../package.json";

import chalk from "chalk";
import semver from "semver";

const CONFIG_FILE_NAME = "pizza.json";

export type ConfigOptions =
{
	bundler: {
		name: "webpack",
	},
	linter: {
		name: "eslint",
	},
	server: {
		name: "webpack" | "firebase",
	},
}

export const runCommand = (command: string, cwd?: string): void =>
{
	childProcess.spawnSync(command, {
		stdio: "inherit",
		shell: true,
		cwd: cwd ?? process.cwd(),
	});
};

export const logError = (message: string): void => console.log(chalk.red("Error:"), message);

export const getConfigOptions = (cwd?: string): ConfigOptions =>
{
	if (!fs.existsSync(path.join(cwd ?? process.cwd(), CONFIG_FILE_NAME)))
	{
		logError(`Cannot find '${CONFIG_FILE_NAME}' config file`);
		console.log("Try running 'pizza init <name>' first");

		process.exit(1);
	}

	return fs.readJSONSync(path.join(cwd ?? process.cwd(), CONFIG_FILE_NAME));
};

export const setConfigOptions = (config: ConfigOptions, cwd?: string): void =>
{
	// Called to check that the config file exists
	getConfigOptions(cwd);

	fs.writeJSONSync(path.join(cwd ?? process.cwd(), CONFIG_FILE_NAME), config, { spaces: 4 });
};

export const checkNodeVersion = (): void =>
{
	const version = pkg.engines.node;

	if (!semver.satisfies(process.version, version))
	{
		logError(`Required Node.js version '${version}' not satisfied with current version '${process.version}'.`);

		process.exit(1);
	}
};
