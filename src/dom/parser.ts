import { AxiosRequestConfig } from 'axios';
import Debug from 'debug';
import { Parser } from "htmlparser2";

import { head } from '../components';
import { cache } from '../lib/cache';


const debug = Debug('MangoostParser');

// voidElements copied from htmlparser2
const voidElements = new Set([
    "area",
    "base",
    "basefont",
    "br",
    "col",
    "command",
    "embed",
    "frame",
    "hr",
    "img",
    "input",
    "isindex",
    "keygen",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr",
]);


const ejsElements = new Set([
    "%=",
    "%-",
    "%#",
    "%",
    "%_",
]);

// found in EJS source code
const EJS_DEFAULT_OPEN_DELIMITER = '<';
const EJS_DEFAULT_CLOSE_DELIMITER = '>';
const EJS_DEFAULT_DELIMITER = '%';

interface Delimiters {
    delimiter: string,
    openDelimiter: string,
    closeDelimiter: string
}

function adornEjsOpenDelimiters(document: string, delimiters: Delimiters){
    /*
    *  tricks htmlparser2 thinking that ejs tags are html `processinginstructions`
    */
   const {
        delimiter,
        openDelimiter,
        closeDelimiter
    } = delimiters;
    if(
        (openDelimiter && openDelimiter !== EJS_DEFAULT_OPEN_DELIMITER) || 
        (closeDelimiter && closeDelimiter !== EJS_DEFAULT_CLOSE_DELIMITER)
    ){
        // This is because htmlparser2 expects valid dom tags
        throw Error("Mangoost can only handle default open '<' and close '>' delimiters for EJS");
    }
    const openToken = (openDelimiter || EJS_DEFAULT_OPEN_DELIMITER) + (delimiter || EJS_DEFAULT_DELIMITER)  // should give '<%'
    const replacement = (openDelimiter || EJS_DEFAULT_OPEN_DELIMITER) + '!' + (delimiter || EJS_DEFAULT_DELIMITER) // should give '<!%'
    cache.set('ejsMangoostDelimiter', replacement);
    cache.set('ejsMangoostOpenToken', openToken);
    // replace opening delimiter in the original file
    return document.split(openToken).join(replacement);
}

function domAttributes(attribs: {[s: string]: string}){
    let attributes = ""
    Object.keys(attribs).forEach(a => {
        if(attribs[a] && attribs[a].length > 0){
            attributes += a +'="'+ attribs[a] +'" ';
        }else{
            // standalone attribute without value
            attributes += a +' ';
        }
    })
    return attributes;
}

function domTag(name: string, attribs: {[s: string]: string}){
    let elem = ""
    const attributes = domAttributes(attribs);
    
    if( attributes.length > 0){
        elem += "<"+name+" "+attributes;
    }else{
        elem += '<'+name;
    }
    if(!voidElements.has(name)){
        elem += '>';
    }
    return elem;
}

function MangoostTagToAxios(data: Mangoost.MangoostData): AxiosRequestConfig{
    if(data){
        return {
            auth:               data.auth ? JSON.parse(data.auth) : undefined,
            data:               data.data ? JSON.parse(data.data) : undefined,
            headers:            data.headers ? JSON.parse(data.headers) : undefined,
            maxContentLength:   data.maxContentLength || undefined,
            maxRedirects:       data.maxRedirects || undefined,
            method:             data.method || 'GET',
            params:             data.params ? JSON.parse(data.params) : undefined,
            proxy:              data.proxy ? JSON.parse(data.proxy) : undefined,
            responseEncoding:   data.responseEncoding || undefined,
            responseType:       data.responseType || undefined,
            timeout:            data.timeout || undefined,
            url:                data.url,
            withCredentials:    data.withCredentials || undefined,
            xsrfCookieName:     data.xsrfCookieName || undefined,
            xsrfHeaderName:     data.xsrfHeaderName || undefined
            
        } as AxiosRequestConfig;
    }else{
        return {};
    }
}


const enum State {
    inDom,
    inMgData,
    inMgHead
}




export default function MangoostParser(document: string, delimiters: Delimiters){
    let template = "";
    const data: Mangoost.MangoostData = {};
    let _state = State.inDom;
    const parentsTree: string[] = []

    /*
    *   This parser compiles an ejs template which includes Mangoost extension tags
    */
    const parserMangoostData = new Parser(
        {
            onopentag(name, attribs) {
                debug("open tag", name);
                debug("parentsTree", parentsTree)
                parentsTree.push(name);
                let id = null;
                let values = null;
                if(name === 'mg:data'){
                    _state = State.inMgData;
                    const hasId = attribs.id && attribs.id.length > 0;
                    const hasUrl = attribs.url && attribs.url.length > 0;
                    // Define the id
                    if(hasId) {
                        id = attribs.id;
                        delete attribs.id;
                    }else if (hasUrl) {
                        id = attribs.url;
                    }

                    // extract the values
                    if(hasUrl){
                        values = MangoostTagToAxios(attribs);
                    }else{
                        values = attribs;
                    }

                    // set data
                    if(id){
                        data[id] = values;
                    }else{
                        Object.entries(attribs).forEach( entry => data[entry[0]] = entry[1])
                    }
                    

                }else if(name === 'mg:head'){
                    _state = State.inMgHead;
                    template += head(attribs); //domTag(name, attribs);
                }
                else{
                    // standard dom tag
                    template += domTag(name, attribs)
                }
            },
            ontext(text) {
                template += text;
            },
            onprocessinginstruction(name, data){
                if(name.slice(0,2) === '!%'){
                    template += '<'+data.slice(1, data.length)+'>';
                }else{
                    debug(data)
                    template += '<'+data+'>';
                }
            },
            onclosetag(tagname) {
                debug("close tag", tagname)
                parentsTree.pop();

                if(
                    !tagname.startsWith('mg:') &&
                    !ejsElements.has(tagname.slice(1, tagname.length)) &&
                    !voidElements.has(tagname)
                ){
                    // closing standard dom tag
                    template += "</"+tagname+">";
                }else if(voidElements.has(tagname)){
                    // selfclosing tag
                    template += ' />'
                }
                // Handling Mangoost Templates tags
                /* code here */
                // Changing state
                switch( tagname ){
                    case 'mg:data':
                    case 'mg:head':
                        _state = State.inDom;
                        break;
                    default:
                        // do nothing
                }
            }
            
        },
        { decodeEntities: false , recognizeSelfClosing: true, xmlMode: true}
    );
    
    parserMangoostData.write(
        adornEjsOpenDelimiters(document, delimiters)
    );
    parserMangoostData.end();
    debug(_state);
    debug(data)
    //debug(template)
    return {template, data}
}