import { config as dotenvConfig } from 'dotenv';
import { join } from 'path';

import { config } from '../src/lib/config';
import { creatDirectories } from '../src/lib/init-project';
import { build } from '../src/mangoost';


//import { listPages, renderPage } from '../src/lib/pages';


dotenvConfig({path: join(config.projectRoot, '.env' )})

export default async function runMangoost(command: any){
    if(command.init){
        await creatDirectories();
    }else if(command.build){
        await build();
    }
}