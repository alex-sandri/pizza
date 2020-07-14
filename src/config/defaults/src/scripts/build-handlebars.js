const path = require("path");
const fs = require("fs");
const handlebars = require("handlebars");
const glob = require("glob");

const PUBLIC_PATH = path.join(__dirname, "..", "..", "public");
const ASSETS_PATH = path.join(PUBLIC_PATH, "assets");

/**
 * The first file is the newest
 */
const sortByFileCreationTime = (a, b) =>
{
    const aStats = fs.statSync(a);
    const bStats = fs.statSync(b);

    return bStats.ctime.getTime() - aStats.ctime.getTime();
}

const getDirectories = (path) =>
    fs
        .readdirSync(path, { withFileTypes: true })
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name);

const routes = getDirectories(path.join(__dirname, "..", "routes"));

routes.forEach(route =>
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
            fs.readFileSync(path.join(__dirname, "..", "routes", route, `${route}.hbs`), "utf8")
        )(data),
    );
});