import path from 'path';
import alias from '@rollup/plugin-alias';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import { string } from 'rollup-plugin-string';
import addCliEntry from './build-plugins/add-cli-entry.js';
import copyTemplates from './build-plugins/copy-files.js';
import emitModulePackageFile from './build-plugins/emit-module-package-file.js';
import pkg from './package.json';

const production = !process.env.NODE_ENV;
console.log("production", production);

const external = [
    ...Object.keys(pkg.dependencies || {}),
    // node modules
    'assert',
    'crypto',
    'events',
    'fs',
    'fsevents',
    'module',
    'path',
    'os',
    'stream',
    'url',
    'util',
    'lru-cache',
    'object-sizeof',
    'debug'
];


const moduleAliases = {
	resolve: ['.json', '.md', '.ejs'],
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
    string({ include: ['**/*.md', '**/*.ejs'] }),
    typescript({tsconfig: "tsconfig.cli.json"}), 
    commonjs({ include: 'node_modules/**'}),  
    
]

export default [
    {   //input: 'cli/cli.ts',
        
        treeshake,
        output: {
            dir: 'dist',
            format: 'cjs',
            //file: 'dist/bin/mgoost'
            /* strictDeprecations: true,
            exports: 'auto',
            externalLiveBindings: false,
            freeze: false, */ 
            
        },
		plugins: [
            //addCliEntry(),
            ...nodePlugins,
            //@rollup/plugin-typescript
           
            addCliEntry(),
            // typescript2
            //tsconfigOverride: {
            //    typescript({
            //        compilerOptions: {
            //            include: ["global.d.ts", "typings/**/*.d.ts", "src/**/*", "cli"], 
            //            module: 'ES2015',
            //            resolveJsonModule: true
            //        }
            //    }
            //}),
            
            //esmDynamicImport(),
            
            emitModulePackageFile(),
            copyTemplates(),
            
        ],
        external
    }/* ,
    {
        output: {
            dir: 'dist'
        },
        plugins: [
            ...nodePlugins,
            emitModulePackageFile(),
        ]
    } */

];