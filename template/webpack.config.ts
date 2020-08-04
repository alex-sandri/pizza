import path from "path";
import glob from "glob";
import webpack from "webpack";
import "webpack-dev-server";

export default (env: any, argv: any) =>
{
    const isProduction = argv.mode === "production";

    const configs = <{
        ts: webpack.Configuration,
        scss: webpack.Configuration,
    }>{
        ts: {
            entry: glob.sync("./src/@(components|routes)/**/*.ts").reduce((entries, entry) =>
            {
                const entryName = `${path.basename(entry).split(".")[0]}.${path.basename(entry).split(".")[1]}`;

                entries[entryName] = entry;

                return entries;
            }, {}),
            module: {
                rules: [
                    {
                        test: /\.ts$/,
                        loader: "ts-loader",
                    },
                ],
            },
            resolve: {
                extensions: [ ".ts", ".js" ],
                alias: {
                    Global: path.resolve(__dirname, "src/global/ts"),
                },
            },
            output: {
                filename: "[name].[contenthash].js",
                path: path.resolve(__dirname, `${isProduction ? "dist" : "public"}/assets/js`),
            },
        },
        scss: {
            entry: glob.sync("./src/@(components|routes)/**/*.scss").reduce((entries, entry) =>
            {
                const entryName = `${path.basename(entry).split(".")[0]}.${path.basename(entry).split(".")[1]}`;

                entries[entryName] = entry;

                return entries;
            }, {}),
            output: {
                filename: "[name].style.js",
                path: path.resolve(__dirname, `${isProduction ? "dist" : "public"}/assets/css`),
            },
            resolve: {
                alias: {
                    Global: path.resolve(__dirname, "src/global/scss"),
                },
            },
            module: {
                rules: [
                    {
                        test: /\.scss$/,
                        use: [
                            {
                                loader: "file-loader",
                                options: {
                                    name: "[name].[contenthash].css",
                                },
                            },
                            {
                                loader: "extract-loader",
                            },
                            {
                                loader: "css-loader",
                                options: {
                                    sourceMap: !isProduction,
                                },
                            },
                            {
                                loader: "sass-loader",
                                options: {
                                    sourceMap: !isProduction,
                                },
                            },
                        ],
                    },
                ],
            },
        },
    };

    if (!isProduction)
    {
        configs.ts.devtool = "inline-source-map";

        configs.ts.devServer = {
            contentBase: "./public",
        };
    }

    return Object.values(configs);
};
