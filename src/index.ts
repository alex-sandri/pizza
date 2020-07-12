const pkg = require("../package.json");

import { program } from "commander";

program
    .version(pkg.version)
    .parse(process.argv);