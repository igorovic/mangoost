import * as fs from 'fs';
//import * as htmlparser2 from 'htmlparser2';

import axios from 'axios';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Element } from "domhandler";
//import { findAll } from "domutils";
import { cache } from 'ejs'
//import { Parser } from "htmlparser2";
import MangoostParser from '../dom/parser';
import { MangoostTagToAxios } from './utils';



export function MangoostFileLoader(filePath: string){
    const ejsFile = fs.readFileSync(filePath, {encoding: 'utf8'}).toString();
    const { template, data } = MangoostParser(ejsFile)
    console.log("loaders", data)
    /* let mangoostElements = '';
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
    cache.set('MangoostTags:'.concat(filePath), Mangoost); */
    return { template, data};
}

interface ApiData {
    [key: string]: any,
    MgoostApi: {
        [key: string]: any
    }
}

function loadProcessEnv(){
    const Envs: any = {};
    Object.keys(process.env).forEach( k => {
        if(k.startsWith('MGOOST-') || k.startsWith('MGOOST_')){
            Envs[k.slice('MGOOST-'.length, k.length)] = process.env[k]
        }
    });
    return Envs;
}

export async function MangoostDataLoader(filePath: string, initialData: Mangoost.TemplateData){
    const R: ApiData = {...initialData, MgoostApi: {}, MgoostEnv: loadProcessEnv()}
    const Mangoost = cache.get('MangoostTags:'.concat(filePath));
    const Queries = Mangoost[filePath].map( (Qr: Element) => MangoostTagToAxios(Qr) );
    const pending = Queries.map( (Q: AxiosRequestConfig) => {
        if(Object.keys(Q).includes("url")){
            return axios(Q)
        }
    });
    const results: AxiosResponse[] = await Promise.all(pending);
    results.forEach( (r: AxiosResponse) => {
        R.MgoostApi[r.config.url || 'undefined'] = r.data;
    })
    return R;
}
