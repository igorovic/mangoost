import path from 'path';
import alias from '@rollup/plugin-alias';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import { string } from 'rollup-plugin-string';
import addCliEntry from './build-plugins/add-cli-entry.js';
import emitModulePackageFile from './build-plugins/emit-module-package-file.js';
import pkg from './package.json';

const external = Object.keys(pkg.dependencies || {});

const moduleAliases = {
	resolve: ['.json', '.md'],
	entries: [
		{ find: 'help.md', replacement: path.resolve('cli/help.md') },
		{ find: 'package.json', replacement: path.resolve('package.json') },
	]
};

const treeshake = {
	moduleSideEffects: false,
	propertyReadSideEffects: false,
	tryCatchDeoptimization: false
};

const nodePlugins = [
    alias(moduleAliases),
    resolve(), 
    json(),
    string({ include: '**/*.md' }),
    commonjs({ include: 'node_modules/**' }), 
]

export default [
	{
        treeshake,
        /* strictDeprecations: true,
        exports: 'auto',
        externalLiveBindings: false,
        freeze: false, */
        output: {
            dir: 'dist',
            format: 'cjs'
        },
		plugins: [
            ...nodePlugins,
            addCliEntry(),
            emitModulePackageFile(),
            typescript({include: ["src/**/*", "typings/**/*.d.ts", "cli"]})
        ],
        external
	}

];