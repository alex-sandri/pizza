# Pizza

![CI Tests](https://github.com/alex-sandri/pizza/workflows/CI%20Tests/badge.svg)\
[![GitHub license](https://img.shields.io/github/license/alex-sandri/pizza)](https://github.com/alex-sandri/pizza/blob/master/LICENSE)\
![GitHub package.json version](https://img.shields.io/github/package-json/v/alex-sandri/pizza)\
![Node Version](https://img.shields.io/badge/node-%3E%3D%2010.0.0-brightgreen)

A simple tool to create a PWA (Progressive Web App) using:
 - TypeScript
 - SCSS
 - Handlebars
 - webpack
 - ESLint
 - Firebase (Optional)

Pizza icon made by [Freepik](https://www.flaticon.com/authors/freepik) from [Flaticon](https://www.flaticon.com/).

Assets inside `template/src/global/wwwroot/` that are used to make the PWA work were generated using [Real Favicon Generator](https://realfavicongenerator.net/).

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

Before installing, make sure to authenticate with GitHub Package Registry or using a `.npmrc` file. See "[Configuring npm for use with GitHub Package Registry](https://help.github.com/en/articles/configuring-npm-for-use-with-github-package-registry#authenticating-to-github-package-registry)".

```
npm config set @alex-sandri:registry https://npm.pkg.github.com/
npm install -g @alex-sandri/pizza
```

## Configure

See [README](template/README.md#configure)

## Usage

### Create a new project

```bash
pizza init <name> [--firebase]
cd <name>
```

This will create a folder named `<name>` and the basic files to get you started immediately.

Adding the `--firebase` option will, after the initial configuration process, run the `firebase init` command to configure Firebase with this project.\
For this to work you need to install `firebase-tools` globally.

### Build the project

```bash
pizza make [--prod]
```

This will build the project and put the output files inside:
 - `dist/` if the `--prod` option is set
 - `public/` otherwise

### Start a local server

```bash
pizza serve
```

This will start a local server using `webpack-dev-server` (default) or, if you initialized the project with the `--firebase` option, using `firebase serve --only hosting`.

### Deploy

```bash
pizza deliver
```

This will deploy the `dist` folder to the configured hosting provider (As of now only `firebase` is a supported hosting provider).

### Generate a new route

```bash
pizza generate route <name>
```
or
```bash
pizza g r <name>
```
for short

This will create a new route folder inside `src/routes` with these files:
 - `<name>.route.hbs`
 - `<name>.route.scss`
 - `<name>.route.ts`

Once the project is built the route will be accessible from `/<name>.html`.

### Generate a new component

```bash
pizza generate component <name>
```
or
```bash
pizza g c <name>
```
for short

This will create a new folder inside `src/components` with a these files:
 - `<name>.component.hbs`
 - `<name>.component.scss`
 - `<name>.component.ts`

Include this component inside another `.hbs` file using this syntax: `{{> <name>}}`.

### Build the config files

```bash
pizza config apply
```

You will need to run this command after modifying the following files:
 - `webpack.config.ts`

## License

This project is licensed under the terms of the MIT license.\
See the [LICENSE](LICENSE) file for details.
