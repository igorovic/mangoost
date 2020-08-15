import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import addCliEntry from '../build-plugins/add-cli-entry.js';
//import esmDynamicImport from '../build-plugins/esm-dynamic-import.js';
//import pkg from '../package.json';

const treeshake = {
	moduleSideEffects: false,
	propertyReadSideEffects: false,
	tryCatchDeoptimization: false
};

const nodePlugins = [
    resolve(), 
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
            typescript({include: ["src/**/*", "typings/**/*.d.ts", "cli"]})
        ]
	},

];