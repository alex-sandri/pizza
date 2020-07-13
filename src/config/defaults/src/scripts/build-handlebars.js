const fs = require("fs");
const handlebars = require("handlebars");
const glob = require("glob");

const jsFiles = glob.sync("../../public/assets/js/*.*.js");
const cssFiles = glob.sync("../../public/assets/css/*.*.css");

jsFiles.forEach(jsFile =>
{
    const jsFileName = jsFile.split("/").pop();

    const fileNamePrefix = jsFileName.split(".")[0];

    const cssFile = cssFiles.filter(cssFile => cssFile.split("/").pop() === `${fileNamePrefix}.css`)[0];

    const cssFileName = cssFile.split("/").pop();

    fs.writeFileSync(`../../public/${fileNamePrefix}.html`, handlebars.compile(fs.readFileSync(`../hbs/${fileNamePrefix}.hbs`, "utf8"))({
        assets: {
            js: jsFileName,
            css: cssFileName,
        },
    }));
});