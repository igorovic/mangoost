 import fs from 'fs';
 import path from 'path';
 import relative from 'require-relative';
/*import { config } from '../lib/config';
import { readFileSync } from 'fs'; */
//import * as requireFromString from 'require-from-string';
//import { compile } from 'svelte/compiler';
import { createFilter } from 'rollup-pluginutils';

const { compile } = require('svelte/compiler.js');

//import { CompileOptions } from 'svelte/types/compiler/interfaces';


/* TYPES */
import { NormalizedOutputOptions, OutputBundle, Plugin } from 'rollup';


const pkg_export_errors = new Set();

function tryRequire(id: string) {
	try {
		return require(id);
	} catch (err) {
		return null;
	}
}

function tryResolve(pkg: string, importer: string) {
	try {
		return relative.resolve(pkg, importer);
	} catch (err) {
		if (err.code === 'MODULE_NOT_FOUND') return null;
		if (err.code === 'ERR_PACKAGE_PATH_NOT_EXPORTED') {
			pkg_export_errors.add(pkg.replace(/\/package.json$/, ''));
			return null;
		}
		throw err;
	}
}

function exists(file: string) {
	try {
		fs.statSync(file);
		return true;
	} catch (err) {
		if (err.code === 'ENOENT') return false;
		throw err;
	}
}

const pluginOptions = [
	'include',
	'exclude',
	'extensions',
];

export default function svelteSSR(options: {[s:string]: any} = {}): Plugin {
    const filter = createFilter(options.include, options.exclude);

    const extensions = options.extensions || ['.html', '.svelte'];
    
    const fixed_options: {[s:string]: any} = {};

    Object.keys(options).forEach(key => {
		// add all options except include, exclude, extensions, and shared
		if (pluginOptions.includes(key)) return;
		fixed_options[key] = options[key];
    });
    
    const componentsLookup = new Map();

    return {
        name: 'svelte-ssr',
        
        load(id: string) {
			if (!componentsLookup.has(id)) return null;
			return componentsLookup.get(id);
		},
		resolveId(importee: string, importer?: string) {
			if (componentsLookup.has(importee)) { return importee; }
			if (!importer || importee[0] === '.' || importee[0] === '\0' || path.isAbsolute(importee))
				return null;

			// if this is a bare import, see if there's a valid pkg.svelte
			const parts = importee.split('/');
			let name = parts.shift();
			if (name && name[0] === '@') name += `/${parts.shift()}`;

			const resolved = tryResolve(
				`${name}/package.json`,
				path.dirname(importer)
			);
			if (!resolved) return null;
			const pkg = tryRequire(resolved);
			if (!pkg) return null;

			const dir = path.dirname(resolved);

			if (parts.length === 0) {
				// use pkg.svelte
				if (pkg.svelte) {
					return path.resolve(dir, pkg.svelte);
				}
			} else {
				if (pkg['svelte.root']) {
					// TODO remove this. it's weird and unnecessary
					const sub = path.resolve(dir, pkg['svelte.root'], parts.join('/'));
					if (exists(sub)) return sub;
				}
			}
        },
        transform(code: string, id: string) {
			if (!filter(id)) return null;

			const extension = path.extname(id);

			if (!~extensions.indexOf(extension)) return null;

			const dependencies: string[] = [];
			let warnings: any = [];
            const compiled = compile(
                code,
                {
                    ...fixed_options,
                    filename: id
                }
            );
            warnings = compiled.warnings ? compiled.warnings : [];

            warnings.forEach((warning: any) => {
                if (options.onwarn) {
                    options.onwarn(warning, (warning: string) => this.warn(warning));
                } else {
                    this.warn(warning);
                }
            });

            if (this.addWatchFile) {
                dependencies.forEach(dependency => this.addWatchFile(dependency));
            } else {
                compiled.js.dependencies = dependencies;
            }

			return compiled.js;
		},
        generateBundle(_: NormalizedOutputOptions, bundle: OutputBundle) {
            console.log(Object.keys(bundle))
           
        }
	};
}