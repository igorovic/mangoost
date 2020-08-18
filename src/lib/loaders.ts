import * as fs from 'fs';
import * as htmlparser2 from 'htmlparser2';
import { findAll } from "domutils";
import { Parser } from "htmlparser2";
import { cache } from 'ejs'
import axios from 'axios';
import { Element } from "domhandler";
import { MangoostTagToAxios } from './utils';
import { AxiosRequestConfig, AxiosResponse } from 'axios';


export function MangoostFileLoader(filePath: string){
    let ejsFile = fs.readFileSync(filePath, {encoding: 'utf8'}).toString();
    let mangoostElements = '';
    let cleanEjsFile = '';
    let Mangoost: Mangoost.MangoostTags = {};

    ejsFile.split('\n').forEach(e => {
        if(e.startsWith('<mangoost')){
            mangoostElements += e;
        }else{
            cleanEjsFile += e;
        }
    })
    const handler = new htmlparser2.DomHandler(function(error: any, dom: any) {
        if (error) {
            console.error(error);
        } else {
            let E = findAll((node) => {
                return node.name === 'mangoost';
            }, dom);

            Mangoost = {[filePath]: E};
        }
    });
    const parser = new Parser(handler, {recognizeSelfClosing: true});
    parser.write(mangoostElements);
    parser.end();
    cache.set('MangoostTags:'.concat(filePath), Mangoost);
    return cleanEjsFile;
}

interface ApiData {
    [key: string]: any,
    MgoostApi: {
        [key: string]: any
    }
}

function loadProcessEnv(){
    let Envs: any = {};
    Object.keys(process.env).forEach( k => {
        if(k.startsWith('MGOOST-') || k.startsWith('MGOOST_')){
            Envs[k.slice('MGOOST-'.length, k.length)] = process.env[k]
        }
    });
    return Envs;
}

export async function MangoostDataLoader(filePath: string, initialData: Mangoost.TemplateData){
    let R: ApiData = {...initialData, MgoostApi: {}, MgoostEnv: loadProcessEnv()}
    let Mangoost = cache.get('MangoostTags:'.concat(filePath));
    let Queries = Mangoost[filePath].map( (Qr: Element) => MangoostTagToAxios(Qr) );
    let pending = Queries.map( (Q: AxiosRequestConfig) => {
        if(Object.keys(Q).includes("url")){
            return axios(Q)
        }
    });
    let results: AxiosResponse[] = await Promise.all(pending);
    results.forEach( (r: AxiosResponse) => {
        R.MgoostApi[r.config.url || 'undefined'] = r.data;
    })
    return R;
}
