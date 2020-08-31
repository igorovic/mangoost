import path from 'path';
import MagicString from 'magic-string';

/* TYPES */
import { Plugin/*, RenderedChunk*/, NormalizedOutputOptions, OutputBundle, InputOptions } from 'rollup';

export default function addSveltePageApp(): Plugin {
    const pageAppLookup = new Map();
    const pageAppComponents = new Map();

	return {
        name: 'svelte-page-app-entry',
        options(options: InputOptions){
            //@ts-ignore
            const input = options.input; // ? options.input[0] : null;
            if(typeof input === 'string' && input.endsWith('.svelte')){
                const id = input;
                const appId = path.join(path.dirname(id), path.basename(id, path.extname(id)) + '.js')
                pageAppComponents.set(appId, path.basename(id));
                /* this.emitFile({
                    type: 'chunk',
                    id: appId,
                    fileName: path.basename(appId),
                    preserveSignature: false,
                }); */
                pageAppLookup.set(appId, null);
                options.input = appId;
            }
            /* if(typeof input === 'string' && input.endsWith('MangoostPageApp.js')){
                pageAppComponents.set(input, 'index.svelte');
                pageAppLookup.set(input, null);
                
            } */
            return options;
        },
        load(id: string) {
            let code = null;
            if(pageAppLookup.has(id)){
                code =  pageAppLookup.get(id);
                if(!code){
                    const componentName = pageAppComponents.get(id);
                    const code = `
                    import App from './${componentName}';
                    const app = new App({
                        target: document.getElementById('mangoost'),
                        hydrate: true,
                        props: {
                            name: "world"
                        }
                    });
                    export default app;
                    `
                    const magicString = new MagicString(code);
                    const appCode = { code: magicString.toString(), map: magicString.generateMap({ source: path.basename(id), hires: true }) };
                    pageAppLookup.set(id, appCode);
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
        generateBundle(_: NormalizedOutputOptions, bundle: OutputBundle) {
            /* for (const [key, value] of Object.entries(bundle)) {
                //@ts-ignore
                if(pageAppLookup.has(value.facadeModuleId)){
                    //@ts-ignore
                    this.emitFile({ type: 'asset', fileName: key+'-app.js', source: value.code });
                    delete bundle[key];
                }
            }; */
            console.log(Object.keys(bundle))
        }
	};
}