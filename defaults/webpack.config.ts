import path from "path";
import glob from "glob";
import webpack from "webpack";
import "webpack-dev-server";

const config: webpack.Configuration[] = [
    {
        entry: glob.sync("./src/routes/**/*.ts").reduce((entries, entry) =>
        {
            const entryName = path.basename(entry).split(".")[0];

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
        },
        devServer: {
            contentBase: "./public",
        },
        output: {
            filename: "[name].[contenthash].js",
            path: path.resolve(__dirname, "public/assets/js"),
        },
    },
    {
        entry: glob.sync("./src/routes/**/*.scss").reduce((entries, entry) =>
        {
            const entryName = path.basename(entry).split(".")[0];

            entries[entryName] = entry;

            return entries;
        }, {}),
        output: {
            filename: "[name].style.js",
            path: path.resolve(__dirname, "public/assets/css"),
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
                        },
                        {
                            loader: "sass-loader",
                        },
                    ],
                },
            ],
        },
    },
];

export default config;