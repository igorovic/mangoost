import Debug from 'debug';
import * as path from 'path';

import config from './config';
import { MangoostDataLoader, MangoostFileLoader } from './loaders';

import { compile } from 'ejs';
import { outputFile } from 'fs-extra';
import { minify } from 'html-minifier';
import { WalkSync } from './filesystem';

const debug = Debug('pages');
const debug2 = Debug('rendered')

const production =  !(process.env.NODE_ENV == 'dev');

const minify_options = {
    collapseWhitespace: true,
    minifyCSS: true,
    minifyJS: true,
    removeComments: true,
    removeRedundantAttributes: true,
    removeTagWhitespace: true,
    useShortDoctype: true,
}


export function listPages(){
    const Source = path.join(config.projectRoot, '/pages/');
    return WalkSync(Source);
}

function output_path_for_html_files(filename: string, public_dir="public"){
    const filePath = filename.replace(path.join(config.projectRoot, 'pages'), "");
    const dir = path.dirname(filePath).split(path.sep);
    const fname = path.basename(filename, path.extname(filename)); // filename without extension
    dir[0] = public_dir;
    return path.join(...dir, fname+".html");
}

async function render(filename: string, data: Mangoost.TemplateData={}, options: Mangoost.MangoostTemplateOptions={}){
    const target_html = options.target_html || output_path_for_html_files(filename, options.outDir);
    
    if(!Object.keys(options).includes('root')){
        options.root = path.join(config.projectRoot);
    }
    if(!Object.keys(options).includes('filename')){
        // required by ejs for cache keys and includes
        options.filename = filename;
    }
    const {template: tmpl, data: MangoostData} = MangoostFileLoader(filename, options);
    const template = compile(tmpl, options);
    data = await MangoostDataLoader(data, MangoostData);
    debug(data)
    let html = template(data);
    debug2(html)
    
    if ( production ){
        html = minify(html, minify_options);
    }
    outputFile(target_html, html, function (err: any) {
        if (err) {
            console.error(err);
        }else{
            console.log(target_html + ' created!');
        }
    });
    
    return target_html;
}

export async function renderPage(filename: string, data: Mangoost.TemplateData={}, options: Mangoost.MangoostTemplateOptions={}): Promise<string>{
    const srcFile = path.join(config.projectRoot, 'pages', filename);
    return await render(srcFile, data, options);
}

/* export async function renderAllPages(filename: string, data: TemplateData={}, options: MangoostTemplateOptions={}): Promise<string>{
    let srcFile = path.join(config.projectRoot, 'pages', filename);
    return await render(srcFile, data, options);
} */
