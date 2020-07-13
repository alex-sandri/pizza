const path = require("path");
const fs = require("fs");
const handlebars = require("handlebars");
const glob = require("glob");

const PUBLIC_PATH = path.join(__dirname, "..", "..", "public");
const ASSETS_PATH = path.join(PUBLIC_PATH, "assets");

const jsFiles = glob.sync(path.join(ASSETS_PATH, "js", "*.*.js"));
const cssFiles = glob.sync(path.join(ASSETS_PATH, "css", "*.*.css"));

jsFiles.forEach(jsFile =>
{
    const jsFileName = jsFile.split("/").pop();

    const fileNamePrefix = jsFileName.split(".")[0];

    const cssFile = cssFiles.filter(cssFile => cssFile.split("/").pop().startsWith(`${fileNamePrefix}.`))[0];

    const cssFileName = cssFile.split("/").pop();

    fs.writeFileSync(
        path.join(PUBLIC_PATH, `${fileNamePrefix}.html`),
        handlebars.compile(
            fs.readFileSync(path.join(__dirname, "..", "routes", fileNamePrefix, `${fileNamePrefix}.hbs`), "utf8")
        )({
            assets: {
                js: jsFileName,
                css: cssFileName,
            },
        }),
    );
});