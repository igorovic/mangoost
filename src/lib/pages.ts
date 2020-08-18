import * as path from 'path';
import { outputFile } from 'fs-extra';
import { minify } from 'html-minifier';
import { compile } from 'ejs';
import { WalkSync } from './filesystem';
import config from './config';
import { MangoostFileLoader, MangoostDataLoader } from './loaders';


let production =  !(process.env.NODE_ENV == 'dev');

let minify_options = {
    collapseWhitespace: true,
    removeComments: true,
    removeRedundantAttributes: true,
    removeTagWhitespace: true,
    useShortDoctype: true,
    minifyCSS: true,
    minifyJS: true
}


export function listPages(){
    let Source = path.join(config.projectRoot, '/pages/');
    return WalkSync(Source);
}

function output_path_for_html_files(filename: string, public_dir="public"){
    let filePath = filename.replace(path.join(config.projectRoot, 'pages'), "");
    let dir = path.dirname(filePath).split(path.sep);
    let fname = path.basename(filename, path.extname(filename)); // filename without extension
    dir[0] = public_dir;
    return path.join(...dir, fname+".html");
}

async function render(filename: string, data: Mangoost.TemplateData={}, options: Mangoost.MangoostTemplateOptions={}){
    let target_html = options.target_html || output_path_for_html_files(filename, options.outDir);
    
    if(!Object.keys(options).includes('root')){
        options.root = path.join(config.projectRoot);
    }
    let template = compile(MangoostFileLoader(filename), options);
    data = await MangoostDataLoader(filename, data);
    console.log(data)
    let html = template(data);
    if ( production ){
        html = minify(html, minify_options);
    }
    outputFile(target_html, html, function (err: any) {
        if (err) {
            console.log(err);
        }else{
            console.log(target_html + ' created!');
        }
    });
    
    return target_html;
}

export async function renderPage(filename: string, data: Mangoost.TemplateData={}, options: Mangoost.MangoostTemplateOptions={}): Promise<string>{
    let srcFile = path.join(config.projectRoot, 'pages', filename);
    return await render(srcFile, data, options);
}

/* export async function renderAllPages(filename: string, data: TemplateData={}, options: MangoostTemplateOptions={}): Promise<string>{
    let srcFile = path.join(config.projectRoot, 'pages', filename);
    return await render(srcFile, data, options);
} */
