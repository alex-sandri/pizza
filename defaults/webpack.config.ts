import path from "path";
import glob from "glob";
import webpack from "webpack";
import "webpack-dev-server";

export default (env, argv) =>
{
    const isProduction = argv.mode === "production";

    return <webpack.Configuration[]>[
        {
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
            devtool: isProduction ? null : "inline-source-map",
            resolve: {
                extensions: [ ".ts", ".js" ],
            },
            devServer: isProduction
                ? null
                :
                    {
                        contentBase: "./public",
                    },
            output: {
                filename: "[name].[contenthash].js",
                path: path.resolve(__dirname, `${isProduction ? "dist" : "public"}/assets/js`),
            },
        },
        {
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
    ];
};