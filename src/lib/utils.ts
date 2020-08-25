import * as path from 'path';

export function projectRootPath(){
    return path.join(...path.resolve('package.json').split(path.sep).slice(0,-1));
}

