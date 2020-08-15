import * as path from 'path';
//import * as childProcess from 'child_process';

export function projectRootPath(){
    //let globalNodeModules = childProcess.execSync('npm root').toString().trim();
    //return path.join(globalNodeModules, '..');
    return path.join(...path.resolve('package.json').split(path.sep).slice(0,-1));
}

export default {
    projectRootPath
}