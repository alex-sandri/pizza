"use strict";

const path = require("path");
const glob = require("glob");

exports.default = [
    {
        entry: glob.sync("./src/ts/*.ts").reduce((entries, entry) =>
        {
            const entryName = entry.split("/").pop().split(".")[0];

            return entries[entryName] = entry;
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
            extensions: [ ".ts" ],
        },
        output: {
            filename: "[name].[contenthash].js",
            path: path.resolve(__dirname, "public/assets/js"),
        },
    },
    {
        entry: glob.sync("./src/scss/*.scss").reduce((entries, entry) =>
        {
            const entryName = entry.split("/").pop().split(".")[0];

            entries[entryName] = entry;
        }, {}),
        output: {
            filename: "style-bundle.js",
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
                                name: "bundle.[contenthash].css",
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