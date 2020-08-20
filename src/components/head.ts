import { compile } from 'ejs';
import { readMangoostEjsFile } from './utils';


const _DEFAULTS = {
    canonical: "",
    contentLanguage: "fr-CH",
    description: "",
    keywords: "",
    'og:type': "website",
    'og:locale': "fr_CH",
    'og:url': null,
    replyTo: null,
    shortcutIcon: "/favicon.ico",
    sitemapHref: "/sitemap.xml",
    title: ""
}

export default function head(data: {[s:string]: any}){
    const ejsFile = readMangoostEjsFile('head.ejs');
    const template = compile(ejsFile);
    return template({..._DEFAULTS, ...data});
}