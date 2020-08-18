import { mkdir } from 'fs';
import { join } from 'path';
import { config } from './config';
import { listDirectories } from '../lib/filesystem';

const ExpectedDirecotires = ["public", "pages", "styles", "javascripts"];

export async function creatDirectories(){
    let dirs = listDirectories(config.projectRoot);
    ExpectedDirecotires.forEach( dir => {
        if(!dirs.includes(dir)){
            let dirPath = join(config.projectRoot, dir)
            console.log("Creating directory", dirPath);
            mkdir(dirPath, { recursive: true }, (err) => {
                if (err) console.error(err);
            });
        }
    })
}