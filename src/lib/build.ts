import Debug from 'debug';
import { readFileSync } from 'fs';
import { join } from 'path';
import { compile } from 'svelte/compiler';

import Graph from '../mangoost-rollup/Graph';
import { normalizeInputOptions } from '../mangoost-rollup/utils/options/normalizeInputOptions';
import { GenericConfigObject } from '../mangoost-rollup/utils/options/options';
import { config } from './config';

const debug = Debug('build');

//const escodegen = require('escodegen');

//const code = escodegen.generate(res.ast.instance.content);


export async function build(){
    const App = readFileSync(join(config.projectRoot, config.pages, 'index.svelte'), 'utf-8');

    const options = { filename: 'app.js', generate: 'ssr', dev: true, css: false};
    const res = compile(App, options );

    debug(res.js.code);
    const rollupConfig: GenericConfigObject = {
        external: null
    };

    console.log(normalizeInputOptions(rollupConfig));
	//const graph = new Graph({}, null);
    //await graph.build()
    console.log(Graph);
}