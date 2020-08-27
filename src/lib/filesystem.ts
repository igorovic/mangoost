import { readdirSync, readFileSync } from 'fs';
import * as path from 'path';

export function WalkSync(Path: string, prefix?: string, options={ignoreDirs: false}){
    let Files: string[] = [];
    try{
        let Listing = readdirSync(Path, {withFileTypes: true});
        
        Listing.forEach(item => {
            if(!item.isDirectory()){
                Files.push(prefix ? path.join(prefix, item.name) : item.name)
            }else{
                if( !options.ignoreDirs ){
                    Files = Files.concat(WalkSync(path.join(Path, item.name), item.name));
                }
            }
        })
    }catch(err){
        console.error(err.message);
    }
    return Files;
};

export function listDirectories(Path: string){
    let dirs: string[] = [];
    let Listing = readdirSync(Path, {withFileTypes: true});
    Listing.forEach(item => {
        if(item.isDirectory()){
            dirs.push(item.name)
        }
    })
    return dirs;
}

export function readFile(filePath: string){
    return readFileSync(filePath, {encoding: 'utf8'}).toString();
}