import * as path from 'path';

export function projectRootPath(){
    return path.normalize(path.dirname(path.resolve('package.json')));
}

