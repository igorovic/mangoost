
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
declare module 'svelte';
declare module 'sourcemap-codec';

/* declare module 'sourcemap-codec'{
	type SourceMapSegment = [number] | [number, number, number, number] | [number, number, number, number, number];
	type SourceMapLine = SourceMapSegment[];
	type SourceMapMappings = SourceMapLine[];
	export function encode(decoded: SourceMapMappings): SourceMapMappings ;
	export function decode(mappings: string): string;
}; */

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
