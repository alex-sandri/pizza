import path from "path";
import fs from "fs-extra";

import pkg from "../package.json";

import commander from "commander";
import glob from "glob";
import validateNpmPackageName from "validate-npm-package-name";

import {
	runCommand,
	logError,
	getConfigOptions,
	setConfigOptions,
	checkNodeVersion,
} from "./scripts/utilities";

import { configApply } from "./commands/config/apply";
import { build as buildHandlebars } from "./commands/make";

const TEMPLATE_PATH = path.join(__dirname, "..", "template");

const program = new commander.Command();

program.version(pkg.version);

program
	.command("init <name>")
	.option("--firebase", "Configure project with Firebase")
	.description("Create named project")
	.action((name, options) =>
	{
		checkNodeVersion();

		const validationResult = validateNpmPackageName(name);

		if (!validationResult.validForNewPackages)
		{
			validationResult.errors?.forEach(logError);
			validationResult.warnings?.forEach(logError);

			return;
		}

		const projectDirPath = path.join(process.cwd(), name);

		if (fs.existsSync(projectDirPath))
		{
			logError(`A folder named '${name}' already exists`);

			return;
		}

		fs.mkdirSync(projectDirPath);

		fs.copySync(TEMPLATE_PATH, projectDirPath, {
			filter: filePath =>
			{
				const fileName = path.basename(filePath);

				const exclude = fileName === "webpack.config.ts";

				return !exclude;
			},
		});

		const defaultNpmPackage = fs.readJSONSync(path.join(TEMPLATE_PATH, "package.json"));

		defaultNpmPackage.name = name;

		fs.writeJSONSync(path.join(projectDirPath, "package.json"), defaultNpmPackage);

		runCommand("npm i", projectDirPath);

		const configOptions = getConfigOptions(projectDirPath);

		switch (configOptions.bundler.name)
		{
			case "webpack":
				fs.copyFileSync(
					path.join(TEMPLATE_PATH, "webpack.config.ts"),
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
				server: { name: "firebase" },
				hostingProvider: { name: "firebase" },
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

program
	.command("deliver")
	.description("Upload the 'dist' folder to the configured hosting provider")
	.action(() =>
	{
		checkNodeVersion();

		const configOptions = getConfigOptions();

		switch (configOptions.hostingProvider.name)
		{
			case "firebase":
				const firebaseConfig = fs.readJSONSync(path.join(process.cwd(), "firebase.json"));

				// Set the folder to deploy to 'dist'
				firebaseConfig.hosting.public = "dist";

				fs.writeJSONSync(path.join(process.cwd(), "firebase.json"), firebaseConfig);

				runCommand(`npm run deliver:firebase`);

				// Set the folder to deploy back to 'public' (for the hosting emulator)
				firebaseConfig.hosting.public = "public";

				fs.writeJSONSync(path.join(process.cwd(), "firebase.json"), firebaseConfig);
				break;
		}
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

		fs.copySync(path.join(TEMPLATE_PATH, "src", "routes", "index"), routePath);

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
