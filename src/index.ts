const pkg = require("../package.json");

import { program } from "commander";

program
    .version(pkg.version)
    .option("-i, --init", "Create ingredients.pizza config file")
    .parse(process.argv);

if (program.init)
{
    console.log(__dirname);
}