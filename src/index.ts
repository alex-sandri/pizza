import * as path from "path";
import * as fs from "fs";

const pkg = require("../package.json");

import { program } from "commander";

program
    .version(pkg.version)
    .option("-i, --init", "Create ingredients.pizza config file")
    .parse(process.argv);

if (program.init)
{
    fs.writeFileSync(path.join(__dirname, "ingredients.pizza"), JSON.stringify({
        bundler: "webpack",
        linter: "eslint",
        templateEngine: "handlebars"
    }, null, 4));
}