//import { compile } from "ejs";
import { Parser } from "htmlparser2";


/* class MgParser extends Parser{
    onopentagname(name: string) {
        if (this._lowerCaseTagNames) {
            name = name.toLowerCase();
        }
        this._tagname = name;
        if (
            !this._options.xmlMode &&
            Object.prototype.hasOwnProperty.call(openImpliesClose, name)
        ) {
            for (
                let el;
                openImpliesClose[name]?.has(
                    (el = this._stack[this._stack.length - 1])
                );
                this.onclosetag(el)
            );
        }
        if (this._options.xmlMode || !voidElements.has(name)) {
            this._stack.push(name);
            if (foreignContextElements.has(name)) {
                this._foreignContext.push(true);
            } else if (htmlIntegrationElements.has(name)) {
                this._foreignContext.push(false);
            }
        }
        this._cbs.onopentagname?.(name);
        if (this._cbs.onopentag) this._attribs = {};
    }
} */
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

function adornEjsOpenDelimiters(document: string){
    // this technics makes the htmlparser2 think that ejs tags are processinginstructions
    return document.split('<%').join('<!%');
}

function domAttributes(attribs: {[s: string]: string}){
    let attributes = ""
    Object.keys(attribs).forEach(a => {
        attributes += a +'="'+ attribs[a] +'" ';
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

const enum State {
    inDom,
    inMgData,
    inMgHead
}

export default function MangoostParser(document: string){
    let template = "";
    const data: {[key:string]: string} = {};
    let _state = State.inDom;

    // This parser extracts only <mg:data> tags
    const parserMangoostData = new Parser(
        {
            onopentag(name, attribs) {
                console.log("open tag", name);
                if(name === 'mg:data'){
                    _state = State.inMgData;
                    Object.entries(attribs).forEach( entry => data[entry[0]] = entry[1])
                }else if(name === 'mg:head'){
                    _state = State.inMgHead;
                    template += domTag(name, attribs);
                }
                else{
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
                    console.log(data)
                    template += '<'+data+'>';
                }
            },
            onclosetag(tagname) {
                console.log("close tag", tagname)
                if(
                    !tagname.startsWith('mg:data') &&
                    !ejsElements.has(tagname.slice(1, tagname.length)) &&
                    !voidElements.has(tagname)
                ){
                    // closing standard dom tag
                    template += "</"+tagname+">";
                }else if(voidElements.has(tagname)){
                    // selfclosing tag
                    template += ' />'
                }
                // Handling Magoost Templates tags

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
        adornEjsOpenDelimiters(document)
    );
    parserMangoostData.end();

    //console.log("parser", data)
    //console.log(template)
    return {template, data}
}