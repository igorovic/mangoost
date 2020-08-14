import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import addCliEntry from '../build-plugins/add-cli-entry.js';
//import esmDynamicImport from '../build-plugins/esm-dynamic-import.js';
import pkg from '../package.json';

const treeshake = {
	moduleSideEffects: false,
	propertyReadSideEffects: false,
	tryCatchDeoptimization: false
};

const nodePlugins = [
    resolve(), 
    commonjs({ include: 'node_modules/**' }), 
    typescript()
]

export default [
	{
        /* input: 'cli/cli.ts',
        treeshake,
		output: {
            banner: '#! /usr/bin/env node\n',
            file: pkg.bin.mangoost,
			format: 'cjs'
        }, */
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
            //typescript({module: 'es2015'})
        ]
	},

	// CommonJS (for Node) and ES module (for bundlers) build.
	// (We could have three entries in the configuration array
	// instead of two, but it's quicker to generate multiple
	// builds from a single configuration where possible, using
	// an array for the `output` option, where we can specify
	// `file` and `format` for each target)
	{
		input: 'src/mangoost.ts',
		output: [
            { file: pkg.main, format: 'cjs' },
            {
                chunkFileNames: 'shared/[name].js',
			    dir: 'dist/shared',
                entryFileNames: '[name].js',
            }
        ],
        plugins: [
            ...nodePlugins,
            //typescript()
        ]
	}
];