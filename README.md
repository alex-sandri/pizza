# Pizza

A simple tool to create a web app using:
 - TypeScript
 - SCSS
 - Handlebars
 - webpack
 - ESLint (TODO)
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

TODO

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

### Generate a new route

`pizza generate route <name>`

This will create a new route folder inside `src/routes` with these files:
 - `<name>.hbs`
 - `<name>.scss`
 - `<name>.ts`

Once the project is built the route will be accessible from `/<name>.html`.

### Generate a new component

`pizza generate component <name>`

This will create a new folder inside `src/components` with a file named `<name>.hbs`.

Include this component inside another `.hbs` file using this syntax: `{{> <name>}}`.

## License

This project is licensed under the terms of the MIT license.  
See the [LICENSE](LICENSE) file for details.