import * as path from "path";
import * as fs from "fs-extra";
import * as childProcess from "child_process";

const pkg = require("../package.json");

import { program } from "commander";
import * as chalk from "chalk";
import * as glob from "glob";

const validateNpmPackageName = require("validate-npm-package-name");

const CONFIG_FILE_NAME = "ingredients.pizza";
const DEFAULT_FILES_PATH = path.join(__dirname, "config", "defaults");

export type ConfigOptions =
{
    bundler: {
        name: "webpack",
    },
    linter: {
        name: "eslint",
    },
    templateEngine: {
        name: "handlebars",
    },
    server: {
        name: "webpack",
    },
}

const runCommand = (command: string, cwd?: string) =>
    childProcess.spawnSync(command, {
        stdio: "inherit",
        shell: true,
        cwd: cwd ?? process.cwd(),
    });

const logError = (message: string) => console.log(chalk.red("Error:"), message);

const getConfigOptions = (cwd?: string): ConfigOptions =>
    <ConfigOptions>fs.readJSONSync(path.join(cwd ?? process.cwd(), CONFIG_FILE_NAME));

program.version(pkg.version);
    
program
    .command("init <name>")
    .description("Create named project")
    .action(name =>
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

        const configFilePath = path.join(projectDirPath, CONFIG_FILE_NAME);

        fs.writeFileSync(configFilePath, JSON.stringify(<ConfigOptions>{
            bundler: { name: "webpack" },
            linter: { name: "eslint" },
            templateEngine: { name: "handlebars" },
            server: { name: "webpack" },
        }, null, 4));

        [
            path.join(projectDirPath, "public", "assets", "css"),
            path.join(projectDirPath, "public", "assets", "js"),
            path.join(projectDirPath, "src", "scss"),
            path.join(projectDirPath, "src", "ts"),
        ].forEach(dir =>
        {
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        });

        fs.copySync(DEFAULT_FILES_PATH, projectDirPath, {
            filter: filePath =>
            {
                const fileName = path.basename(filePath);

                const exclude = fileName === "webpack.config.js"
                    || fileName.endsWith(".hbs");

                return !exclude;
            },
        });

        const defaultNpmPackage = fs.readJSONSync(path.join(DEFAULT_FILES_PATH, "package.json"));

        defaultNpmPackage.name = name;

        fs.writeJSONSync(path.join(projectDirPath, "package.json"), defaultNpmPackage);
    
        runCommand("npm i", projectDirPath);

        const configOptions = getConfigOptions(projectDirPath);
    
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

        switch (configOptions.templateEngine.name)
        {
            case "handlebars":
                glob.sync(path.join(DEFAULT_FILES_PATH, "src", "routes", "**", "*.hbs")).forEach(filePath =>
                {
                    const route = path.basename(path.dirname(filePath));

                    fs.copyFileSync(filePath, path.join(projectDirPath, "src", "routes", route, path.basename(filePath)));
                });
            break;
            default:
                logError(`Unsupported template engine: '${configOptions.templateEngine.name}'`);
            break;
        }
    });

program
    .command("make")
    .description("Build the project")
    .action(() =>
    {
        if (!fs.existsSync(path.join(process.cwd(), CONFIG_FILE_NAME)))
        {
            logError(`Cannot find '${CONFIG_FILE_NAME}' config file`);
            console.log("Try running 'pizza init <name>' first");

            return;
        }

        const configOptions = getConfigOptions();

        runCommand(`npm run build:${configOptions.bundler.name}`);

        runCommand(`npm run build:${configOptions.templateEngine.name}`);
    });

program
    .command("serve")
    .description("Create a local development server")
    .action(() =>
    {
        const configOptions = getConfigOptions();

        runCommand(`npm run serve:${configOptions.server.name}`);
    });

program.parse(process.argv);