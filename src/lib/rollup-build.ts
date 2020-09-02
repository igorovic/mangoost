//import axios from 'axios';
import Debug from 'debug';
//import { outputFileSync } from 'fs-extra';
import { basename, dirname, extname, join } from 'path';
//import requireFromString from 'require-from-string';
import { rollup } from 'rollup';

/* rollup plugins */
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import atImport from 'postcss-import';
import postcss from 'rollup-plugin-postcss';
import svelte from 'rollup-plugin-svelte';
import { terser } from 'rollup-plugin-terser';
/* postcss plugins */
import autoprefixer from 'autoprefixer';
import postcssInputRange from 'postcss-input-range';
import postcssUrl from 'postcss-url';

//import svelte from '../rollup-plugins/svelte';
import addSveltePageApp from '../rollup-plugins/svelte-app-entry';
//import { loadTemplate } from './loadTemplate';
import { listPages } from './pages';
//import { pathToUrl } from './utils';

import { config } from './config';


const debug = Debug('build');
// tailwind from the project's directory
const tailwind = require(require.resolve('tailwindcss', {paths: ['./node_modules/mangoost', process.cwd()]}));
const mode = process.env.NODE_ENV;
const dev = mode === 'development';
const legacy = !!process.env.MANGOOST_LEGACY_BUILD;

//const template = loadTemplate();

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
        emitCss: true,      // when emitCss is true, css files are imported in the bundle by rollup-plugin-svelte and Rollup need an additional plugin to load them; check docs/rollup-plugin-svelte.md
        hydratable: true,
        generate: 'ssr',
        css: function(css: any) {
            const stylesDir = config.stylesOutDir || '';
            const outCssFile = join(stylesDir, css.filename);
            css.write(outCssFile);
        }
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
        emitCss: false,
        hydratable: true,
        css: (_: string) => {null /* tricks the plugin not to import css files in the bundle since they are previously emitted in the SSR rendering */}
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
            addSveltePageApp(sveltePageAppConfig)  // creates a svelte `js` entry point, for each page.
        ],
        preserveEntrySignatures: true,
    }
    const browserOutputOptions = {
        file: join(config.outDir, pagePath, pageName+'.js'), 
        format: 'iife',
        name: 'app',
        sourcemap: true,
    }
    const bundle = await rollup(inputOptions as any);
    await bundle.write(browserOutputOptions as any);
}

async function renderPage(page: string | string[]){
    const Pages = typeof page === 'string' ? [page] : page;
    let pagesPaths = {};
    let pagesNames = {};

    const EntryPoints = Pages.map( (p:string) => {
        const {
            pageEntryPoint,
            pagePath,
            pageName
        } = _pageParts(p);
        pagesPaths = {...pagesPaths, [p]:pagePath};
        pagesNames = {...pagesNames, [p]:pageName};

        return pageEntryPoint;
    })

    

    /* const cssFile = join(pagePath, pageName+'.css');
    let includeCss = false; */

    let ssrInputOptions = {
        input: EntryPoints,
        plugins: [
            ...ssrPlugins,
            /*
            ** rollup-plugin-postcss applies its transformations to the css generated in memory by rollup-plugin-svelte
            ** then rollup-plugin-svelte saves the file to disk because we can fine tune the destination folder.
            */ 
            postcss({
                /* 
                ** rollup-plugin-postcss extracts styles relatively to the bundle path. Si we disable it.
                */
                //extract: basename(cssFile),
                plugins: [
                    atImport(),
                    postcssUrl(),
                    postcssInputRange(),
                    // The line below enable the use of tailwind utilities in svelte <style> 
                    tailwind && config.enableTailwind ? tailwind(config.tailwind) : null,
                    // autoprefixer should be last as per teailwindcss doc
                    autoprefixer(config.autoprefixer),
                ]
            }),
        ],
        preserveEntrySignatures: true, // if false, svelte's component code is empty
    }
    const ssrOutputOptions = {
        exports: 'named', // keep interchangeability between commonjs modules and esm; will result in a exports.default = ... in final bundle
        //file: join(config.outDir, pagePath, pageName+'-ssr.js'),
        dir: config.outDir,
        format: 'cjs',
        //name: 'index-ssr'
    }
    debug('rollup bundle', page)
    const bundle = await rollup(ssrInputOptions as any);
    /* we use bundle.generate to generate the code in cjs format and use it to render the page.
    ** Unfortunately, it will trigger a 2nd execution of all the rollup-plugins!
    ** TODO: Can we avoid a second execution ? 
    */
    const { output } = await bundle.generate(ssrOutputOptions as any);
    debug(output);
    // Check if rendered page has a css file to inject in the final html
    /* for(const watchFile of bundle.watchFiles){
        if(watchFile.includes(cssFile)){
            includeCss = true;
            break;
        }
    } */

    // Writes ssr bundle on disk only if NODE_ENV==='development'
    dev && await bundle.write(ssrOutputOptions as any);
    /* let rendered = {
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
    // don't care about css since it's extracted in separate file
    let { html, head } = rendered;

    if(!html || html.length <= 0){
        html = '<!-- empty mangoost html -->';
    }
    
    let source = template.replace('%mangoost.html%', `<div id="mangoost">${html}</div>` ).replace('%mangoost.head%', head || '<!-- empty mangoost head -->');

    if(includeCss){
        source = source.replace('%mangoost.css%', `<link rel="stylesheet" href="${pathToUrl(cssFile)}">`)
    }else{
        // If the page has no styles
        source = source.replace('%mangoost.css%', '');
    }

    if(!pageModule.StaticOnly){
        const scriptUrl = pathToUrl(join(pagePath, pageName+'.js'));
        source = source.replace('%mangoost.app%', '<script defer src="'+scriptUrl+'"></script>');
    }else{
        source = source.replace('%mangoost.app%', '');
    }
    outputFileSync(join(config.projectRoot, config.outDir, pagePath, pageName+'.html'), source, {encoding: 'utf-8'});
    return {StaticOnly: pageModule.StaticOnly}; */
}

async function buildPage(page: string | string[]){
    try{
        /* SSR
        ** ssr renderPage must occur before pageApp because it will extract build context
        */
        /* const { 
            StaticOnly
        } =  */await renderPage(page);
        //console.log(renderPage)
        // generate page app js
        /* if(!StaticOnly)
            await pageApp(page); */
        console.log(pageApp); 
    }catch(err){
        console.error(err)
    }
}

export async function build(){
   /*  const pending = []
    for( const page of listPages()){
        pending.push(buildPage(page));
    }
    await Promise.all(pending); */
    await buildPage(listPages());
}