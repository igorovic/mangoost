# Explanations on the build process for this project

1. All the `*.ts` files in `src/**` are first compiled by typescript compiler `tsc`.
2. Rollup is used to bundle the cli tool. The main `mangoost` module is defined as external to the cli tool and is imported at runtime. The trick is in `build-plugins/add-cli-entry.js` with `code.replace(..)`

Because the build is in two steps, there are two `tsconfig` files. 
- `tsconfig.json` - for the typescript compiler `tsc`
- `tsconfig.cli.json` - use by rollup and its typescript plugin

_I wasn't able to fin how to use one single `tsconfig file`_
