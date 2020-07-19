import path from "path";
import fs from "fs-extra";
import handlebars from "handlebars";
import glob from "glob";

export const build = (production: boolean): void =>
{
	const PROJECT_PATH = process.cwd();

	const OUTPUT_PATH = path.join(PROJECT_PATH, production ? "dist" : "public");
	const ASSETS_PATH = path.join(OUTPUT_PATH, "assets");

	/**
	 * The first file is the newest
	 */
	const sortByFileCreationTime = (a: string, b: string) =>
	{
		const aStats = fs.statSync(a);
		const bStats = fs.statSync(b);

		return bStats.ctime.getTime() - aStats.ctime.getTime();
	};

	const getDirectories = (path: string) =>
	{
		if (!fs.existsSync(path)) return;

		return fs
			.readdirSync(path, { withFileTypes: true })
			.filter(entry => entry.isDirectory())
			.map(entry => entry.name);
	};

	const componentAssets = {
		css: <string[]>[],
		js: <string[]>[],
	};

	const components = getDirectories(path.join(PROJECT_PATH, "src", "components"));

	components?.forEach(component =>
	{
		handlebars.registerPartial(
			component,
			handlebars.compile(
				fs.readFileSync(path.join(PROJECT_PATH, "src", "components", component, `${component}.component.hbs`)).toString("utf-8"),
			),
		);

		componentAssets.css.push(path.basename(glob.sync(path.join(ASSETS_PATH, "css", `${component}.component.*.css`)).sort(sortByFileCreationTime)[0]));
		componentAssets.js.push(path.basename(glob.sync(path.join(ASSETS_PATH, "js", `${component}.component.*.js`)).sort(sortByFileCreationTime)[0]));
	});

	const routes = getDirectories(path.join(PROJECT_PATH, "src", "routes"));

	routes?.forEach(route =>
	{
		const routePath = path.join(PROJECT_PATH, "src", "routes", route);
		const routeTemplatePath = path.join(routePath, `${route}.route.hbs`);

		const usedPartials = getPartialsUsedIn(routeTemplatePath);

		const finalAssets = {
			css: [
				...componentAssets
					.css
					.filter(asset => usedPartials.includes(asset.split(".")[0])),
				path.basename(glob.sync(path.join(ASSETS_PATH, "css", `${route}.route.*.css`)).sort(sortByFileCreationTime)[0]),
			].filter(asset =>
			{
				const assetName = asset.split(".")[0];
				const assetType = asset.split(".")[1];

				const assetPath = path.join(PROJECT_PATH, "src", `${assetType}s`, assetName, `${assetName}.${assetType}.scss`);

				return fs.statSync(assetPath).size > 0;
			}),
			js: [
				...componentAssets
					.js
					.filter(asset => usedPartials.includes(asset.split(".")[0])),
				path.basename(glob.sync(path.join(ASSETS_PATH, "js", `${route}.route.*.js`)).sort(sortByFileCreationTime)[0]),
			].filter(asset =>
			{
				const assetName = asset.split(".")[0];
				const assetType = asset.split(".")[1];

				const assetPath = path.join(PROJECT_PATH, "src", `${assetType}s`, assetName, `${assetName}.${assetType}.ts`);

				return fs.statSync(assetPath).size > 0;
			}),
		};

		let data;

		if (fs.existsSync(path.join(routePath, "build-data.js")))
			data = require(path.join(routePath, "build-data.js"));

		fs.writeFileSync(
			path.join(OUTPUT_PATH, `${route}.html`),
			handlebars.compile(fs.readFileSync(routeTemplatePath, "utf8"))({
				assets: finalAssets,
				data,
			}),
		);
	});
};

const getPartialsUsedIn = (partialPath: string): string[] =>
{
	const usedPartials: string[] = [];

	handlebars.parseWithoutProcessing(fs.readFileSync(partialPath, "utf8")).body.forEach(statement =>
	{
		if (statement.type === "PartialStatement")
		{
			const partialName = (<{ name: { parts: string[] } }><unknown>statement).name.parts[0];

			usedPartials.push(partialName);

			usedPartials.push(...getPartialsUsedIn(path.join(process.cwd(), "src", "components", partialName, `${partialName}.component.hbs`)));
		}
	});

	return usedPartials;
};