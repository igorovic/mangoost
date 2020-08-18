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

/* import { Element } from "domhandler";
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
}
