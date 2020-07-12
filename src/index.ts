import * as path from "path";
import * as fs from "fs";

const pkg = require("../package.json");

import { program } from "commander";
import * as chalk from "chalk";

const CONFIG_FILE_NAME = "ingredients.pizza";
const CONFIG_FILE_PATH = path.join(__dirname, CONFIG_FILE_NAME);

export type ConfigOptions =
{
    bundler: "webpack",
    linter: "eslint",
    templateEngine: "handlebars",
}

program
    .version(pkg.version)
    .option("-i, --init", `Create ${CONFIG_FILE_NAME} config file`)
    .option("-m, --make", `Create config files and a basic folder structure based on the '${CONFIG_FILE_NAME}' config`)
    .parse(process.argv);

if (program.init)
{
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(<ConfigOptions>{
        bundler: "webpack",
        linter: "eslint",
        templateEngine: "handlebars"
    }, null, 4));
}
else if (program.make)
{
    if (!fs.existsSync(CONFIG_FILE_PATH))
    {
        console.log(chalk.red("Error:"), `Cannot find '${CONFIG_FILE_NAME}' file`);
        console.log("You need to run 'pizza --init' first");
    }
}