#!/usr/bin/env node

import * as path from "path";
import * as fs from "fs-extra";

const pkg = require("../package.json");

import * as commander from "commander";
import * as glob from "glob";

const validateNpmPackageName = require("validate-npm-package-name");

import {
    runCommand,
    logError,
    getConfigOptions,
    setConfigOptions,
    checkNodeVersion,
} from "./scripts/utilities";

import { configApply } from "./commands/config/apply";

import { build as buildHandlebars } from "./scripts/build-handlebars";

const DEFAULT_FILES_PATH = path.join(__dirname, "..", "defaults");

const program = new commander.Command();

program.version(pkg.version);
    
program
    .command("init <name>")
    .option("--firebase", "Configure project with Firebase")
    .description("Create named project")
    .action((name, options) =>
    {
        checkNodeVersion();

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

                const exclude = fileName === "webpack.config.ts";

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
                    path.join(DEFAULT_FILES_PATH, "webpack.config.ts"),
                    path.join(projectDirPath, "webpack.config.ts")
                );
            break;
            default:
                logError(`Unsupported bundler: '${configOptions.bundler.name}'`);
            break;
        }

        if (options.firebase)
        {
            setConfigOptions({
                ...getConfigOptions(projectDirPath),
                server: { name: "firebase" }
            }, projectDirPath);

            runCommand("firebase init", projectDirPath);
        }

        fs.appendFileSync(path.join(projectDirPath, ".gitignore"), [
            "node_modules/",
            "public/",
            "dist/",
            "webpack.config.js",
        ].join("\n"));

        configApply(projectDirPath);
    });

program
    .command("make")
    .option("--prod", "Build for production")
    .description("Build the project")
    .action(options =>
    {
        checkNodeVersion();

        const configOptions = getConfigOptions();

        runCommand(`npm run lint:${configOptions.linter.name}`);

        runCommand(`npm run build:${configOptions.bundler.name}${options.prod ? ":prod" : ""}`);

        buildHandlebars(options.prod);

        if (fs.existsSync(path.join(process.cwd(), "src", "global", "wwwroot")))
            fs.copySync(
                path.join(process.cwd(), "src", "global", "wwwroot"),
                path.join(process.cwd(), options.prod ? "dist" : "public"),
            );
    });

program
    .command("serve")
    .description("Create a local development server")
    .action(() =>
    {
        checkNodeVersion();

        const configOptions = getConfigOptions();

        runCommand(`npm run serve:${configOptions.server.name}`);
    });

const generateCommand = new commander
    .Command("generate")
    .alias("g")
    .description("Generate files");

generateCommand.command("route <name>")
    .alias("r")
    .description("Generate a new route")
    .action((name: string) =>
    {
        checkNodeVersion();

        getConfigOptions();

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
            // Replace default file name with the new route name: index.route.ts -> <name>.route.ts
            const newFileName = path.basename(filePath).replace("index", name);

            fs.renameSync(filePath, path.join(path.dirname(filePath), newFileName));
        });
    });

generateCommand.command("component <name>")
    .alias("c")
    .description("Generate a new component")
    .action((name: string) =>
    {
        checkNodeVersion();

        getConfigOptions();

        if (!name.match(/^[A-Za-z]+$/))
        {
            logError("Invalid value for 'name' argument");
            console.log("'name' can only include uppercase or lowercase letters");

            return;
        }

        const componentPath = path.join(process.cwd(), "src", "components", name);

        if (fs.existsSync(componentPath))
        {
            logError(`A component named '${name}' already exists`);

            return;
        }

        fs.mkdirSync(componentPath, { recursive: true });

        fs.createFileSync(path.join(componentPath, `${name}.component.hbs`));
        fs.createFileSync(path.join(componentPath, `${name}.component.scss`));
        fs.createFileSync(path.join(componentPath, `${name}.component.ts`));
    });

program.addCommand(generateCommand);

const configCommand = new commander
    .Command("config")
    .description("Configure the project");

configCommand.command("apply")
    .description("Build configuration files")
    .action(() => configApply());

program.addCommand(configCommand);

program.parse(process.argv);