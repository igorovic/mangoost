import * as path from 'path';
import { AxiosRequestConfig } from 'axios';
import { Element } from "domhandler";

export function projectRootPath(){
    return path.join("/", ...path.resolve('package.json').split(path.sep).slice(0,-1));
}

export function MangoostTagToAxios(element: Element){
    if(element.attribs){
        return <AxiosRequestConfig>{
            url: element.attribs.url,
            method: element.attribs.method || 'GET'
        }
    }else{
        return {};
    }
}