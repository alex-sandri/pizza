import * as path from "path";
import * as fs from "fs";
import * as childProcess from "child_process";

const pkg = require("../package.json");

import { program } from "commander";
import * as chalk from "chalk";

const validateNpmPackageName = require("validate-npm-package-name");

const CONFIG_FILE_NAME = "ingredients.pizza";

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
}

const runCommand = (command: string, cwd?: string) =>
    childProcess.spawnSync(command, {
        stdio: "inherit",
        shell: true,
        cwd: cwd ?? process.cwd(),
    });

const logError = (message: string) => console.log(chalk.red("Error:"), message);

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
        } = validateNpmPackageName(name);

        if (!validationResult.validForNewPackages)
        {
            (<string[]>validationResult.errors).forEach(logError);

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
            bundler: {
                name: "webpack",
            },
            linter: {
                name: "eslint",
            },
            templateEngine: {
                name: "handlebars",
            },
        }, null, 4));
    
        const configOptions = <ConfigOptions>JSON.parse(fs.readFileSync(configFilePath).toString());

        runCommand("npm init -y", projectDirPath);
    
        runCommand(`npm i -D ${[
            "typescript",
            "webpack",
            "webpack-cli",
            "glob",
            "ts-loader",
            "file-loader",
            "extract-loader",
            "css-loader",
            "scss-loader",
            "sass",
        ].join(" ")}`, projectDirPath);
    
        [
            path.join(process.cwd(), "public", "assets", "css"),
            path.join(process.cwd(), "public", "assets", "js"),
            path.join(process.cwd(), "src", "scss"),
            path.join(process.cwd(), "src", "ts"),
        ].forEach(dir =>
        {
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        });
    
        switch (configOptions.bundler.name)
        {
            case "webpack":
                fs.writeFileSync(
                    path.join(process.cwd(), "webpack.config.js"),
                    fs.readFileSync(
                        path.join(__dirname, "config", "defaults", "webpack.config.js"),
                    ),
                );
            break;
            default:
                logError(`Unsupported bundler: ${configOptions.bundler.name}`);
            break;
        }
    });

program
    .command("make")
    .description("Build the project")
    .action(() =>
    {

    });

program.parse(process.argv);