import { readdirSync } from 'fs';
import * as path from 'path';

export function WalkSync(Path: string, prefix?: string, options={ignoreDirs: false}){
    let Files: string[] = [];
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