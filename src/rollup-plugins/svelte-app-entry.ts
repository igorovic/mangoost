import path from 'path';
import MagicString from 'magic-string';

/* TYPES */
import { Plugin,/*, RenderedChunk*//* , NormalizedOutputOptions, OutputBundle, */ InputOptions } from 'rollup';

export default function addSveltePageApp(options: {[s:string]: any} = {}): Plugin {
    const pageAppLookup = new Map();
    const props = options.initialProps ? options.initialProps : {};
    const target = options.target ? options.target : "document.getElementById('mangoost')";
	return {
        name: 'svelte-page-app-entry',
        options(options: InputOptions){
            const input = options.input; // ? options.input[0] : null;
            if(typeof input === 'string' && input.endsWith('.svelte')){
                const id = input;
                const appId = path.join(path.dirname(id), path.basename(id, path.extname(id)) + '.js')
                pageAppLookup.set(appId, {code: null, componentName: path.basename(id)});
                options.input = appId;
            }
            return options;
        },
        load(id: string) {
            if(pageAppLookup.has(id)){
                const { code, componentName} = pageAppLookup.get(id);
                if(!code){
                    const code = `
                    import App from './${componentName}';

                    const app = new App({
                        target: ${target},
                        hydrate: true,
                        props: ${JSON.stringify(props)}
                    });
                    export default app;
                    `
                    const magicString = new MagicString(code);
                    const appCode = { code: magicString.toString(), map: magicString.generateMap({ source: path.basename(id), hires: true }) };
                    pageAppLookup.set( id, {code: appCode, componentName});
                    return appCode;
                }
                return code;
            }
		},
        resolveId(importee: string, importer?: string) {
            if(pageAppLookup.has(importee)){
                return importee
            }
            console.log(importee, importer)
        },
        /* generateBundle(_: NormalizedOutputOptions, bundle: OutputBundle) {
            // for (const [key, value] of Object.entries(bundle)) {
            //     //@ts-ignore
            //     if(pageAppLookup.has(value.facadeModuleId)){
            //         //@ts-ignore
            //         this.emitFile({ type: 'asset', fileName: key+'-app.js', source: value.code });
            //         delete bundle[key];
            //     }
            // };
            console.log(Object.keys(bundle))
        } */
	};
}