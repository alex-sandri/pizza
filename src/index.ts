import * as path from "path";
import * as fs from "fs";
import * as childProcess from "child_process";

const pkg = require("../package.json");

import { program } from "commander";
import * as chalk from "chalk";

const CONFIG_FILE_NAME = "ingredients.pizza";
const CONFIG_FILE_PATH = path.join(__dirname, CONFIG_FILE_NAME);

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

program
    .version(pkg.version)
    .option("-i, --init", `Create ${CONFIG_FILE_NAME} config file`)
    .option("-m, --make", `Create config files and a basic folder structure based on the '${CONFIG_FILE_NAME}' config`)
    .parse(process.argv);

if (program.init)
{
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
}
else if (program.make)
{
    if (!fs.existsSync(CONFIG_FILE_PATH))
    {
        console.log(chalk.red("Error:"), `Cannot find '${CONFIG_FILE_NAME}' file`);
        console.log("You need to run 'pizza --init' first");
    }
    else
    {
        const configOptions = <ConfigOptions>JSON.parse(fs.readFileSync(CONFIG_FILE_PATH).toString());

        childProcess.spawnSync("npm init -y");

        [
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
        ].forEach(devDependency => childProcess.spawnSync(`npm i -D ${devDependency}`));

        [
            path.join(__dirname, "public", "assets", "css"),
            path.join(__dirname, "public", "assets", "js"),
            path.join(__dirname, "src", "scss"),
            path.join(__dirname, "src", "ts"),
        ].forEach(dir =>
        {
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        });

        switch (configOptions.bundler.name)
        {
            case "webpack":
                fs.writeFileSync(
                    path.join(__dirname, "webpack.config.js"),
                    fs.readFileSync(
                        path.join(__dirname, "config", "defaults", "webpack.config.js"),
                    ),
                );
            break;
            default:
                console.log(chalk.red("Error:"), `Unsupported bundler: ${configOptions.bundler.name}`);
            break;
        }
    }
}