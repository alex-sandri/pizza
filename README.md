# Pizza

![CI Tests](https://github.com/alex-sandri/pizza/workflows/CI%20Tests/badge.svg)  
[![GitHub license](https://img.shields.io/github/license/alex-sandri/pizza)](https://github.com/alex-sandri/pizza/blob/master/LICENSE)  
![GitHub package.json version](https://img.shields.io/github/package-json/v/alex-sandri/pizza)  
![Node Version](https://img.shields.io/badge/node-%3E%3D%2010.0.0-brightgreen)

A simple tool to create a web app using:
 - TypeScript
 - SCSS
 - Handlebars
 - webpack
 - ESLint
 - Firebase (Optional)

## Table of Contents

 * [Requirements](#requirements)
 * [Installation](#installation)
 * [Configure](#configure)
 * [Usage](#usage)
 * [License](#license)

## Requirements

 - [Node.js](https://nodejs.org/) (10.0.0 or greater)
 - [npm](https://www.npmjs.com/) (normally comes with Node.js)
 - [firebase-tools](https://github.com/firebase/firebase-tools) (Required only if you use the `--firebase` flag when initializing the project)


## Installation

Before installing, make sure to authenticate with GitHub Package Registry or using a `.npmrc` file. See "[Configuring npm for use with GitHub Package Registry](https://help.github.com/en/articles/configuring-npm-for-use-with-github-package-registry#authenticating-to-github-package-registry)."

```
npm config set @alex-sandri:registry https://npm.pkg.github.com/
npm install -g @alex-sandri/pizza
```

## Configure

You can configure the project modifying these files:
 - `pizza.json` The main configuration file
 - `.eslintrc.js` ESLint configuration
 - `tsconfig.json` TypeScript compiler configuration
 - `webpack.config.ts` webpack configuration

In the `pizza.json` file you can configure things like the bundler, the linter, the server and in a future release the hosting provider.

**Note:**  
Currently the `pizza.json` file options, except for the local server one, have only one option to choose from.

## Usage

### Create a new project

```
pizza init <name> [--firebase]
cd <name>
```

This will create a folder named `<name>` and the basic files to get you started immediately.

Adding the `--firebase` option will, after the initial configuration process, run the `firebase init` command to configure Firebase with this project.  
For this to work you need to install `firebase-tools` globally.

### Build the project

`pizza make`

### Start a local server

`pizza serve`

This will start a local server using `webpack-dev-server` (default) or, if you initialized the project with the `--firebase` option, using `firebase serve --only hosting`.

### Generate a new route

`pizza generate route <name>`  
or  
`pizza g r <name>`  
for short

This will create a new route folder inside `src/routes` with these files:
 - `<name>.hbs`
 - `<name>.scss`
 - `<name>.ts`

Once the project is built the route will be accessible from `/<name>.html`.

### Generate a new component

`pizza generate component <name>`  
or  
`pizza g c <name>`  
for short

This will create a new folder inside `src/components` with a file named `<name>.hbs`.

Include this component inside another `.hbs` file using this syntax: `{{> <name>}}`.

### Build the config files

`pizza config apply`

You will need to run this command after modifying the following files:
 - webpack.config.ts

## License

This project is licensed under the terms of the MIT license.  
See the [LICENSE](LICENSE) file for details.