import * as path from "path";
import * as fs from "fs-extra";
import * as handlebars from "handlebars";
import * as glob from "glob";

export const build = () =>
{
    const PROJECT_PATH = process.cwd();

    const PUBLIC_PATH = path.join(PROJECT_PATH, "public");
    const ASSETS_PATH = path.join(PUBLIC_PATH, "assets");

    /**
     * The first file is the newest
     */
    const sortByFileCreationTime = (a: string, b: string) =>
    {
        const aStats = fs.statSync(a);
        const bStats = fs.statSync(b);

        return bStats.ctime.getTime() - aStats.ctime.getTime();
    }

    const getDirectories = (path: string) =>
    {
        if (!fs.existsSync(path)) return;

        return fs
            .readdirSync(path, { withFileTypes: true })
            .filter(entry => entry.isDirectory())
            .map(entry => entry.name);
    };

    const components = getDirectories(path.join(PROJECT_PATH, "src", "components"));

    components?.forEach(component =>
    {
        handlebars.registerPartial(
            component,
            handlebars.compile(
                fs.readFileSync(path.join(PROJECT_PATH, "src", "components", component, `${component}.hbs`)).toString("utf-8"),
            ),
        );
    });

    const routes = getDirectories(path.join(PROJECT_PATH, "src", "routes"));

    routes?.forEach(route =>
    {
        const data = {
            assets: {
                js: path.basename(glob.sync(path.join(ASSETS_PATH, "js", `${route}.*.js`)).sort(sortByFileCreationTime)[0]),
                css: path.basename(glob.sync(path.join(ASSETS_PATH, "css", `${route}.*.css`)).sort(sortByFileCreationTime)[0]),
            },
        };

        fs.writeFileSync(
            path.join(PUBLIC_PATH, `${route}.html`),
            handlebars.compile(
                fs.readFileSync(path.join(PROJECT_PATH, "src", "routes", route, `${route}.hbs`), "utf8")
            )(data),
        );
    });
}