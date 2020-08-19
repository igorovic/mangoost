import { Parser } from "htmlparser2";
//import { Parser } from "htmlparser2/Parser";


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


const ejsElements = new Set([
    "%=",
    "%-",
    "%#",
    "%",
    "%_",
]);

export default function MangoostParser(document: string){
    let template = "";
    let data = {};
    const parser = new Parser(
        {
            onopentag(name, attribs) {
                if(name.startsWith('mg:')){
                    data = {name: "Petrovic"};
                }else if(ejsElements.has(name)){
                    template += '<'+name+' ';
                    template += Object.entries(attribs).map(a => a[0]).join(' ');
                    parser._tokenizer._buffer.substr(parser._tokenizer._index, 100)
                    parser.onclosetag(name)
                }else{
                    const entries = Object.entries(attribs);
                    const at =""
                    entries.forEach(v => at.concat( ' ', v[0], '="', v[1], '" ' ));
                    if( at.length > 0){
                        template += "<"+name+" "+at+">";
                    }else{
                        template += '<'+name+'>';
                    }
                    
                }
            },
            /* onattribute(name, value) {
                console.log("name", name, "value", value)
            }, */
            ontext(text) {
                template += text;
            },
            onclosetag(tagname) {
                if(ejsElements.has(tagname)){
                    template += '>';
                }else{
                    template += "</"+tagname+">";
                }
            }
        },
        { decodeEntities: false , recognizeSelfClosing: true, xmlMode: true}
    );
    
    parser.write(
        document
    );
    parser.end();
    return {template, data}
}