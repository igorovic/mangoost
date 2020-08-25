import { exec } from 'child_process';
import { join } from 'path';
import { mkdir } from 'fs';

import { config } from './config';
import { listDirectories } from '../lib/filesystem';


export async function creatDirectories(){
    let dirs = listDirectories(config.projectRoot);
    config.ExpectedDirecotires.forEach( dir => {
        if(!dirs.includes(dir)){
            let dirPath = join(config.projectRoot, dir)
            console.log("Creating directory", dirPath);
            mkdir(dirPath, { recursive: true }, (err) => {
                if (err) console.error(err);
            });
        }
    })
}

export async function init(){
    exec('npx degit "sveltejs/sapper-template#rollup" .', {cwd: config.projectRoot}, async (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return;
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
        await creatDirectories();
    });
}