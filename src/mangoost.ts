import { listPages, renderPage } from './lib/pages';
//export { renderPage, listPages } from './lib/pages';
export {MangoostFileLoader, MangoostDataLoader} from './lib/loaders';

export async function build(){
    let pages = listPages();
    let pending = pages.map(async (page) => await renderPage(page));
    await Promise.all(pending);
}

