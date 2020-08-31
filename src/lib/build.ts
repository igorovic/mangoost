import { readFileSync } from 'fs';
import { outputFileSync } from 'fs-extra';

//import axios from 'axios';
//import jsdom from "jsdom";

import { basename, join } from 'path';
import requireFromString from 'require-from-string';
import { rollup } from 'rollup';

//import * as mergeOptions from 'rollup/dist/shared/mergeOptions';


//const { JSDOM } = jsdom;

/* rollup plugins */
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import { terser } from 'rollup-plugin-terser';

//import svelte from 'rollup-plugin-svelte';
import svelte from '../rollup-plugins/svelte';
import addSveltePageApp from '../rollup-plugins/svelte-app-entry';
//import svelteSSR from '../rollup-plugins/svelte-ssr';
import { config } from './config';

/* TYPES */
//import { MergedRollupOptions } from 'rollup';

const mode = process.env.NODE_ENV;
const dev = mode === 'development';
const legacy = !!process.env.MANGOOST_LEGACY_BUILD;

//const appEntryPoint = join(config.projectRoot, './src/pages/', 'index.js');
const pageEntryPoint = join(config.projectRoot, './src/pages/', 'index.svelte');
const template = readFileSync(join('node_modules/mangoost/templates/', 'default.html'), 'utf-8'); //readFileSync(join(config.projectRoot, './src/', 'template.html'), 'utf-8');

console.log("DEV", dev);

const plugins = [
    commonjs(),
    legacy && babel({
        babelHelpers: 'runtime',
        exclude: ['node_modules/@babel/**'],
        extensions: ['.js', '.mjs', '.html', '.svelte'],
        presets: [
            ['@babel/preset-env', {
                targets: '> 0.25%, not dead'
            }]
        ],
        plugins: [
            '@babel/plugin-syntax-dynamic-import',
            ['@babel/plugin-transform-runtime', {
                useESModules: true
            }]
        ]
    }),

    !dev && terser({
        module: true
    }),
]

const ssrPlugins = [
    replace({
        'process.browser': 'false',
        'process.env.NODE_ENV': JSON.stringify(mode)
    }),
    svelte({
        dev: true,
        emitCss: false,
        hydratable: true,
        generate: 'ssr'
    }),
    /* svelteSSR({
        css: false,
        dev: true,
        generate: 'ssr',
        hydratable: true
    }), */
    resolve({
        browser: false,
        dedupe: ['svelte']
    }),
    ...plugins
]
const browserPlugins = [
    replace({
        'process.browser': 'true',
        'process.env.NODE_ENV': JSON.stringify(mode)
    }),
    svelte({
        dev: true,
        emitCss: true,
        hydratable: true,
    }),
    resolve({
        browser: true,
        dedupe: ['svelte']
    }),
    ...plugins
]


async function pageApp(){
    const inputOptions = {
        input: pageEntryPoint,
        plugins: [
            ...browserPlugins,
            addSveltePageApp()  // create a svelte `main.js` alike file, for each page.
        ],
        preserveEntrySignatures: true,
        /* watch: {
            exclude: 'mangoost-emitted/**'
        } */
    }
    const browserOutputOptions = {
        //exports: 'named',
        //file: 'public/index.js',
        dir: 'public',
        format: 'iife',
        name: 'app',
        sourcemap: true,
    }
    const bundle = await rollup(inputOptions as any);
    await bundle.write(browserOutputOptions as any);
}

async function renderPage(){
    const ssrInputOptions = {
        input: pageEntryPoint,
        plugins: [
            ...ssrPlugins,
        ],
        preserveEntrySignatures: true, // if false, ouput code is empty
    }
    const ssrOutputOptions = {
        exports: 'named', // keep interchangeability between commonjs modules and esm; will result in a exports.default = ... in final bundle
        file: 'public/index-ssr.js',
        format: 'cjs',
        name: 'index-ssr'
    }

    const bundle = await rollup(ssrInputOptions as any);
    const { output } = await bundle.generate(ssrOutputOptions as any);
    await bundle.write(ssrOutputOptions as any);
    let rendered = {
        html: '',
        head: ''
    };
    try{
        /* const dom = await JSDOM.fromFile(join(config.projectRoot, './src/', 'template.html'));
        //@ts-ignore
        const document = dom.window.document;*/
        const page = requireFromString(output[0].code, basename(pageEntryPoint), {appendPaths: join(config.projectRoot, './node_modules')}); 
        let DATA = {};
        /* if(page.initialData){
            let m = await axios(page.initialData);
            DATA = m.data
        } */
        rendered = page.default.render(DATA);
    }catch(err){
        console.error("Mangoost SSR bundle error");
        console.error(err)
    }
    const {html, head } = rendered;
    const source = template.replace('%mangoost.app%', '/index.js').replace('%mangoost.html%', html).replace('%mangoost.head%', head);
    outputFileSync(join(config.projectRoot, 'public', 'index.html'), source, {encoding: 'utf-8'})
}


export async function build(){
    try{
        await pageApp();
        //console.log(pageApp); 

        console.log('SSR');
        /* SSR */ 
        await renderPage();
        //console.log(renderPage)
    }catch(err){
        console.error(err)
    }
}