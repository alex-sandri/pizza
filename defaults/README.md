# Pizza App

## Project structure

```
    node_modules/                                   Provides npm packages to the entire project
    public/                                         The folder containing the result of the 'make' command (aka the folder you can upload on a server)
    src/                                            The folder you'll write code into
        global/                                     Use this folder to add global styles or scripts
            scss/                                   Global styles
            ts/                                     Global scripts
            wwwroot/                                Other global files (These files (or folders) will be copied to the root of the 'public/' folder)
        routes/                                     In this folder you'll find all the routes you created
            <route-name>/
                <route-name>.route.hbs              The route's HTML template
                <route-name>.route.scss             The route styles
                <route-name>.route.ts               The route's code
        components/                                 In this folder you'll find all the components you created
            <component-name>/
                <component-name>.component.hbs      The component's HTML template
                <component-name>.component.scss     The component's styles
                <component-name>.component.ts       The component's code
    .eslintrc.js                                    ESLint configuration
    package.json                                    Configures npm package dependencies that are required for this project
    package-lock.json                               Provides version information for all packages installed into node_modules by the npm client
    pizza.json                                      Configures this project
    README.md                                       The file you're reading
    tsconfig.json                                   TypeScript configuration
    webpack.config.js                               webpack configuration
```