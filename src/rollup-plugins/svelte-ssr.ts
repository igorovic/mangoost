import { join, basename, extname } from 'path';
import { config } from '../lib/config';
import { readFileSync } from 'fs';
//import * as requireFromString from 'require-from-string';
//import { compile } from 'svelte/compiler';

import { listPages } from '../lib/pages';

//import { CompileOptions } from 'svelte/types/compiler/interfaces';


/* TYPES */
import { Plugin, NormalizedOutputOptions, OutputBundle } from 'rollup';
//import { Module } from 'module' // this is only for typescript declaration in @types/node/module.d.ts

const Pages = listPages().filter(p => p.endsWith('.svelte'));
const template = readFileSync(join(config.projectRoot, './src/', 'template.html'), 'utf-8');

/* function capitalise(name: string) {
	return name[0].toUpperCase() + name.slice(1);
} */

export default function svelteSSR(_: {[s:string]: any} = {}): Plugin {
    
    return {
		name: 'svelte-ssr',
		buildStart() {
            for (const p of Pages){
                if(p.endsWith('.svelte')){
                    this.emitFile({
                        type: 'chunk',
                        id: join(config.projectRoot, './src/pages/', p)
                    });
                }
            }
        },
        generateBundle(_: NormalizedOutputOptions, bundle: OutputBundle) {
            console.log(Object.keys(bundle))
            for (const page of Pages){
                /* const options: CompileOptions = {
                    filename: page,
                    name: capitalise(basename(page, extname(page))),
                    generate: 'ssr',
                    format: 'cjs'
                }; */
        
                //const { js/* , warnings */ } = compile(readFileSync(join(config.projectRoot, './src/pages/', page), 'utf-8'), options);
                //const Paths: string[] = [];
                //Paths.push(join(config.projectRoot, './src/pages/'));
                //Paths.push(join(config.projectRoot, 'src'));

                //const Component = requireFromString(js.code,  {prependPaths: Paths}).default;
                const rendered = 'my html here'; //Component.render({name: "world"});

                const source = template.replace('%mangoost.app%', '/bundle.js').replace('%mangoost.html%', rendered);

                this.emitFile({
                    type: 'asset', 
                    fileName: basename(page, extname(page)) + ".html", 
                    source
                })
            }
           
        }
	};
}