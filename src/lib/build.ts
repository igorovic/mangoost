import axios from 'axios';
import { readFileSync } from 'fs';
import { outputFileSync } from 'fs-extra';
import { basename, dirname, extname, join } from 'path';
import requireFromString from 'require-from-string';
import { rollup } from 'rollup';

/* rollup plugins */
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import postcss from 'rollup-plugin-postcss';
import { terser } from 'rollup-plugin-terser';

import svelte from 'rollup-plugin-svelte';
//import svelte from '../rollup-plugins/svelte';
import addSveltePageApp from '../rollup-plugins/svelte-app-entry';
import { listPages } from './pages';
import { pathToUrl } from './utils';
import { config } from './config';

/* TYPES */
//import { MergedRollupOptions } from 'rollup';

const mode = process.env.NODE_ENV;
const dev = mode === 'development';
const legacy = !!process.env.MANGOOST_LEGACY_BUILD;


const template = readFileSync(join('node_modules/mangoost/templates/', 'default.html'), 'utf-8'); 

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
        dev,
        emitCss: false,
        hydratable: true,
        generate: 'ssr'
    }),
    postcss({
        extract: true,
        // Or with custom file name
        //extract: path.resolve('dist/my-custom-file-name.css')
    }),
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
        dev,
        emitCss: true,
        hydratable: true,
    }),
    resolve({
        browser: true,
        dedupe: ['svelte']
    }),
    ...plugins
]

const initDataLookup = new Map();

function _pageParts(page: string){
    const pageEntryPoint = join(config.projectRoot, config.pages, page);
    const pagePath = dirname(page);
    const pageName =  basename(pageEntryPoint, extname(pageEntryPoint));
    return {pageEntryPoint, pagePath, pageName}
}

async function pageApp(page: string){
    const {
        pageEntryPoint,
        pagePath,
        pageName
     } = _pageParts(page);
    let sveltePageAppConfig = {};

    if(initDataLookup.has(pageEntryPoint)){
        const initialProps = initDataLookup.get(pageEntryPoint);
        sveltePageAppConfig = {
            ...sveltePageAppConfig,
            initialProps
        }
    }

    const inputOptions = {
        input: pageEntryPoint,
        plugins: [
            ...browserPlugins,
            addSveltePageApp(sveltePageAppConfig)  // create a svelte `main.js` alike file, for each page.
        ],
        preserveEntrySignatures: true,
    }
    const browserOutputOptions = {
        file: join(config.outDir, pagePath, pageName+'.js'), //'public/index.js',
        format: 'iife',
        name: 'app',
        sourcemap: true,
    }
    const bundle = await rollup(inputOptions as any);
    await bundle.write(browserOutputOptions as any);
}

async function renderPage(page: string){
    const {
        pageEntryPoint,
        pagePath,
        pageName
     } = _pageParts(page);

    let ssrInputOptions = {
        input: pageEntryPoint,
        plugins: [
            ...ssrPlugins,
        ],
        preserveEntrySignatures: true, // if false, svelte's component code is empty
    }
    const ssrOutputOptions = {
        exports: 'named', // keep interchangeability between commonjs modules and esm; will result in a exports.default = ... in final bundle
        file: join(config.outDir, pagePath, pageName+'-ssr.js'),
        format: 'cjs',
        name: 'index-ssr'
    }

    const bundle = await rollup(ssrInputOptions as any);
    const { output } = await bundle.generate(ssrOutputOptions as any);
    // Writes ssr bundle on disk only in dev mode
    dev && await bundle.write(ssrOutputOptions as any);
    let rendered = {
        html: '',
        head: ''
    };
    const pageModule = requireFromString(output[0].code, basename(pageEntryPoint), {appendPaths: join(config.projectRoot, './node_modules')}); 
    try{
        
        let DATA = {};
        if(pageModule.initialData){
            const Async = pageModule.initialData.async || null;
            delete pageModule.initialData.async;
            DATA = {...pageModule.initialData.props}
            try {
                const m = await axios(Async);
                DATA = {
                    ...DATA,
                    ...m.data
                }
            }catch(err){
                console.error(err);
            }
            
            initDataLookup.set(pageEntryPoint, DATA);
        }
        rendered = pageModule.default.render(DATA);
    }catch(err){
        console.error("Mangoost SSR bundle error");
        console.error(err)
    }
    const {html, head } = rendered;
    
    let source = template.replace('%mangoost.html%', html).replace('%mangoost.head%', head);
    if(!pageModule.StaticOnly){
        const scriptUrl = pathToUrl(join(pagePath, pageName+'.js'));
        source = source.replace('%mangoost.app%', '<script defer src="'+scriptUrl+'"></script>');
    }else{
        source = source.replace('%mangoost.app%', '');
    }
    outputFileSync(join(config.projectRoot, config.outDir, pagePath, pageName+'.html'), source, {encoding: 'utf-8'});
    return {StaticOnly: pageModule.StaticOnly};
}

async function buildPage(page: string){
    try{
        /* SSR
        ** ssr renderPage is required before pageApp because it will extract initialData
        */
        const { 
            StaticOnly
        } = await renderPage(page);
        //console.log(renderPage)
        // generate page app js
        if(!StaticOnly)
            await pageApp(page);
        //console.log(pageApp); 
    }catch(err){
        console.error(err)
    }
}

export async function build(){
    const pending = []
    for( const page of listPages()){
        pending.push(buildPage(page));
    }
    await Promise.all(pending);
}