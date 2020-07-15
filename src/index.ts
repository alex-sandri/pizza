#!/usr/bin/env node

import * as path from "path";
import * as fs from "fs-extra";
import * as childProcess from "child_process";

const pkg = require("../package.json");

import * as commander from "commander";
import * as chalk from "chalk";
import * as glob from "glob";

const validateNpmPackageName = require("validate-npm-package-name");

const CONFIG_FILE_NAME = "pizza.json";
const DEFAULT_FILES_PATH = path.join(__dirname, "..", "defaults");

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

const runCommand = (command: string, cwd?: string) =>
    childProcess.spawnSync(command, {
        stdio: "inherit",
        shell: true,
        cwd: cwd ?? process.cwd(),
    });

const logError = (message: string) => console.log(chalk.red("Error:"), message);

const getConfigOptions = (cwd?: string): ConfigOptions | undefined =>
{
    if (!fs.existsSync(path.join(cwd ?? process.cwd(), CONFIG_FILE_NAME)))
    {
        logError(`Cannot find '${CONFIG_FILE_NAME}' config file`);
        console.log("Try running 'pizza init <name>' first");

        return;
    }

    return <ConfigOptions>fs.readJSONSync(path.join(cwd ?? process.cwd(), CONFIG_FILE_NAME))
};

const program = new commander.Command();

program.version(pkg.version);
    
program
    .command("init <name>")
    .option("--firebase", "Configure project with Firebase")
    .description("Create named project")
    .action((name, options) =>
    {
        const validationResult: {
            validForNewPackages: boolean,
            validForOldPackages: boolean,
            errors?: string[],
            warnings?: string[],
        } = validateNpmPackageName(name);

        if (!validationResult.validForNewPackages)
        {
            (<string[]>(validationResult.errors ?? validationResult.warnings)).forEach(logError);

            return;
        }

        const projectDirPath = path.join(process.cwd(), name);

        if (fs.existsSync(projectDirPath))
        {
            logError(`A folder named '${name}' already exists`);

            return;
        }

        fs.mkdirSync(projectDirPath);

        [
            path.join(projectDirPath, "public", "assets", "css"),
            path.join(projectDirPath, "public", "assets", "js"),
        ].forEach(dir =>
        {
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        });

        fs.copySync(DEFAULT_FILES_PATH, projectDirPath, {
            filter: filePath =>
            {
                const fileName = path.basename(filePath);

                const exclude = fileName === "webpack.config.js";

                return !exclude;
            },
        });

        const defaultNpmPackage = fs.readJSONSync(path.join(DEFAULT_FILES_PATH, "package.json"));

        defaultNpmPackage.name = name;

        fs.writeJSONSync(path.join(projectDirPath, "package.json"), defaultNpmPackage);
    
        runCommand("npm i", projectDirPath);

        const configOptions = <ConfigOptions>getConfigOptions(projectDirPath);
    
        switch (configOptions.bundler.name)
        {
            case "webpack":
                fs.copyFileSync(
                    path.join(DEFAULT_FILES_PATH, "webpack.config.js"),
                    path.join(projectDirPath, "webpack.config.js")
                );
            break;
            default:
                logError(`Unsupported bundler: '${configOptions.bundler.name}'`);
            break;
        }

        if (options.firebase) runCommand("firebase init", projectDirPath);
    });

program
    .command("make")
    .description("Build the project")
    .action(() =>
    {
        const configOptions = getConfigOptions();

        if (!configOptions) return;

        runCommand(`npm run build:${configOptions.bundler.name}`);

        runCommand(`node ./scripts/build-handlebars.js`);
    });

program
    .command("serve")
    .description("Create a local development server")
    .action(() =>
    {
        const configOptions = getConfigOptions();

        if (!configOptions) return;

        runCommand(`npm run serve:${configOptions.server.name}`);
    });

const generateCommand = new commander
    .Command("generate")
    .arguments("<type>")
    .description("Generate files based on <type>");

generateCommand.command("route <name>")
    .description("Generate a new route")
    .action((name: string) =>
    {
        const configOptions = getConfigOptions();

        if (!configOptions) return;

        if (!name.match(/^[a-z]+$/))
        {
            logError("Invalid value for 'name' argument");
            console.log("'name' can only include lowercase letters");

            return;
        }

        const routePath = path.join(process.cwd(), "src", "routes", name);

        if (fs.existsSync(routePath))
        {
            logError(`A route named '${name}' already exists`);

            return;
        }

        fs.copySync(path.join(DEFAULT_FILES_PATH, "src", "routes", "index"), routePath);

        glob.sync(path.join(routePath, "*")).forEach(filePath =>
        {
            // Replace default file name with the new route name: index.ts -> <name>.ts
            const newFileName = path.basename(filePath).replace("index", name);

            fs.renameSync(filePath, path.join(path.dirname(filePath), newFileName));
        });
    });

generateCommand.command("component <name>")
    .description("Generate a new component")
    .action((name: string) =>
    {
        const configOptions = getConfigOptions();

        if (!configOptions) return;

        if (!name.match(/^[a-z]+$/))
        {
            logError("Invalid value for 'name' argument");
            console.log("'name' can only include lowercase letters");

            return;
        }

        const componentPath = path.join(process.cwd(), "src", "components", name);

        if (fs.existsSync(componentPath))
        {
            logError(`A component named '${name}' already exists`);

            return;
        }

        fs.mkdirSync(componentPath, { recursive: true });

        fs.createFileSync(path.join(componentPath, `${name}.hbs`));
    });

program.addCommand(generateCommand);

program.parse(process.argv);