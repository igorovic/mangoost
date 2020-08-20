import axios from 'axios';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import Debug from 'debug';
import { compile } from 'ejs';

import MangoostParser from '../dom/parser';
import { cache } from '../lib/cache';
import { config } from '../lib/config';
import { readFile } from './filesystem';

const debug = Debug('loaders:apiResults');

export function MangoostFileLoader(filePath: string, options: {[s:string]: any}){
    const ejsFile = readFile(filePath); 
    const {
        delimiter,
        openDelimiter,
        closeDelimiter
    } = options;
    const delimiters = {delimiter, openDelimiter, closeDelimiter};
    return  MangoostParser(ejsFile, delimiters);
}

interface finalData {
    [key: string]: any,
    MgApi: {
        [key: string]: any
    },
    MgEnv: {
        [key: string]: any
    }
}

function loadProcessEnv(){
    const CACHEKEY = 'Mangoost:Envs';
    const cachedEnvs = cache.get(CACHEKEY);
    if(cachedEnvs){
        return cachedEnvs;
    }else{
        const Envs: any = {};
        Object.keys(process.env).forEach( k => {
            if(k.startsWith('MGOOST-') || k.startsWith('MGOOST_')){
                Envs[k.slice('MGOOST-'.length, k.length)] = process.env[k]
            }
        });
        cache.set(CACHEKEY, Envs);
        return Envs;
    }
}

function ejsInQuery(Q: AxiosRequestConfig, data: finalData){
    const delimiter = cache.get('ejsMangoostDelimiter') || '<!%';
    const initialOpenToken = cache.get('ejsMangoostOpenToken') || '<%';
    let AxiosRequestString = JSON.stringify(Q);
    AxiosRequestString = AxiosRequestString.split(delimiter).join(initialOpenToken);
    // WARN: option `filename` for compile is used as cache key. Which means this compilation will be cached
    const QueryTmpl = compile(AxiosRequestString, {filename: Q.url});
    return JSON.parse(QueryTmpl(data));
}

export async function MangoostDataLoader(initialData: Mangoost.TemplateData, MangoostData: Mangoost.MangoostData){
    const APICACHE = 'Mangoost:Api:';
    const Data: finalData = {...initialData, MgApi: {}, MgEnv: loadProcessEnv()}
    const Queries: any[] = [];
    const QueriesId: string[] = [];
    Object.entries(MangoostData).forEach( ([k, v]) => {
        if(v && v.url && v.url.length >0){
            Queries.push(v);
            QueriesId.push(k);
        }else{
            // WARN: may overwrite initialData values
            Data[k] = v;
        }
    });
    const pending = Queries.map( async (Q: AxiosRequestConfig, idx) => {
        if(Object.keys(Q).includes("url")){
            const apiCacheKey = APICACHE+QueriesId[idx];
            const cached = cache.get(apiCacheKey);
            if(cached){
                return cached;
            }else{
                try {
                    Q = ejsInQuery(Q, Data);
                    const R = await axios(Q);
                    let maxAge: number | undefined = config.apiCallsCache*1000;
                    if(maxAge <= 0){
                        maxAge = undefined;
                    }
                    if(R.status == 200){
                        cache.set(apiCacheKey, R, maxAge);
                    }
                    return R;
                }catch(err){
                    console.error(err.message);
                }
            }
        }
    });
    const results: (AxiosResponse | undefined)[] = await Promise.all(pending);
    debug(results);
    results.forEach( (r, idx) => {
        Data.MgApi[QueriesId[idx]] = r ? r.data : r;
    })
    debug(Data);
    return Data;
}
