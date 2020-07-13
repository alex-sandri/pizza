import * as path from "path";
import * as fs from "fs";
import * as childProcess from "child_process";

const pkg = require("../package.json");

import { program } from "commander";
import * as chalk from "chalk";

const validateNpmPackageName = require("validate-npm-package-name");

const CONFIG_FILE_NAME = "ingredients.pizza";
const CONFIG_FILE_PATH = path.join(process.cwd(), CONFIG_FILE_NAME);

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

program.version(pkg.version);
    
program
    .command("init <name>")
    .description("Create named project")
    .action(name =>
    {
        const validationResult = validateNpmPackageName(name);

        if (!validationResult.validForNewPackages)
        {
            validationResult.errors.forEach(console.log);

            return;
        }

        if (fs.existsSync(path.join(process.cwd(), name)))
        {
            console.log(chalk.red("Error:"), `A folder named '${name}' already exists`);

            return;
        }

        fs.mkdirSync(path.join(process.cwd(), name));

        fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(<ConfigOptions>{
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
    
        const configOptions = <ConfigOptions>JSON.parse(fs.readFileSync(CONFIG_FILE_PATH).toString());
    
        childProcess.spawnSync("npm init -y", { stdio: "inherit", shell: true });
    
        childProcess.spawnSync(`npm i -D ${[
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
        ].join(" ")}`, { stdio: "inherit", shell: true });
    
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
                console.log(chalk.red("Error:"), `Unsupported bundler: ${configOptions.bundler.name}`);
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