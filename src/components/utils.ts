import Debug from 'debug';
import { cache } from '../lib/cache';
import { join } from 'path';
import { readFile } from '../lib/filesystem';

const debug = Debug('templates');

/*
*  I keep this function just in case file structure changes
*  luckily in both case relative path is `../templates`
*/
export function readMangoostEjsFile(filename: string){
    const cached = cache.get('Mangoost:'+filename) || null;
    if(cached){
        debug('return cached', filename);
        return cached;
    }else{
        let diskFile = "";
        if(__filename.includes('bin/mgoost')){
            diskFile = readFile(join(__dirname, '../templates', filename));
        }else{
            diskFile = readFile(join(__dirname, '../templates', filename));
        }
        cache.set('Mangoost:'+filename, diskFile);
        return diskFile;
    }
}