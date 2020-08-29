/* import { build as sapperBuild } from 'sapper/dist/build';
import { export as sapperExport } from 'sapper/dist/export';
import { kleur } from 'sapper/dist/index';
 */


import { config } from './lib/config';
import { listPages/* , renderPage */ } from './lib/pages';
import { build as MangoostBuild } from './lib/build';

//export { renderPage, listPages } from './lib/pages';
export {MangoostFileLoader, MangoostDataLoader} from './lib/loaders';
//export { rollup } from './config/rollup';

export async function build(){
    let pages = listPages();
    console.log(pages);
    //let pending = pages.map(async (page) => await renderPage(page));
    //await Promise.all(pending);
    const opts = {
        bundler: 'rollup',
        cwd: config.projectRoot,
        export_dir: config.outDir,
        ext: '.sve .svelte',
        legacy: false,
        //output: '@sapper',
        //routes: 'pages',
        //src: 'src'
    }
    console.log(opts);
    await MangoostBuild()
    /* try {
        
        console.log(`> Building...`);
        await sapperBuild(opts);
        //console.error(`\n> Built in ${sapper.elapsed(start)}`);
        
        await sapperExport({
            ...opts,

            oninfo: (event: any) => {
                console.log(kleur.bold().cyan(`> ${event.message}`));
            },

            onfile: (event: any) => {
                const size_color = event.size > 150000 ? kleur.bold().red : event.size > 50000 ? kleur.bold().yellow : kleur.bold().gray;
                const file_label = event.status === 200
                    ? event.file
                    : kleur.bold()[event.status >= 400 ? 'red' : 'yellow'](`(${event.status}) ${event.file}`);
                console.log(`${file_label} - ${size_color}`);
            }
        });

        console.error(`\n> Finished in . Type ${kleur.bold().cyan(`npx serve ${config.outDir}`)} to run the app.`);
    } catch (err) {
        console.error(kleur.bold().red(`> ${err.message}`));
        console.error(err);
        process.exit(1);
    }; */

}