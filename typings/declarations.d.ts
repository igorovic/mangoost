declare module 'help.md' {
	const str: string;
	export default str;
}
declare module 'package.json'{
	const str: string;
	export default str;
}

declare module 'ejs';
declare module 'html-minifier';
declare module 'fs-extra';
declare module 'sapper/dist/build';
declare module 'sapper/dist/export';
declare module 'sapper/dist/index';
declare module 'sapper/dist/env';

/* import { Element } from "domhandler";
import { AxiosRequestConfig } from 'axios';
export { Element } from "domhandler"; */


declare namespace Mangoost {
	declare interface EjsOptions {
		cache?: function,
		root?: string[] | string,
	}

	declare interface MangoostTemplateOptions extends EjsOptions{
		target_html?: string,
		outDir?: string,
		filename?: string
	}

	declare interface MangoostTags {
		[key: string]: domhandler.Element[]
	}
	declare interface TemplateData {
		[key: string]: any
	}
	declare interface MangoostData {
		[s:string]: string | object | string[] | object[] | AxiosRequestConfig
	}
}
