import * as path from 'path';
import url from 'url';

export function projectRootPath(){
    // TODO: Maybe should use process.cwd() here
    return path.normalize(path.dirname(path.resolve('package.json')));
}

export function pathToUrl(PATH: string){
    let P = PATH.replace(/\\/g, '/');
    let U = url.parse(path.posix.normalize(P));
    return U.pathname?.startsWith('/') ? U.pathname : '/'+U.pathname;
}