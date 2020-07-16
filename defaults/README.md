# Pizza App

## Project structure

```
    src/                                The folder you'll write code into
        global/                         Use this folder to add global styles or scripts
            scss/                       Global styles
            ts/                         Global scripts
            wwwroot/                    Other global files (This files (or folders) will be copied to the root of the 'public/' folder)
        routes/                         In this folder you'll find all the routes you created
            <route-name>/
                <route-name>.hbs        The route's HTML template
                <route-name>.scss       The route styles
                <route-name>.ts         The route's code
        components/                     In this folder you'll find all the components you created
            <component-name>/
                <component-name>.hbs    The component's HTML template
    package.json                        Configures npm package dependencies that are required for this project
    pizza.json                          Configures this project
    README.md                           The file you're reading
    tsconfig.json                       TypeScript configuration
    webpack.config.js                   webpack configuration
```