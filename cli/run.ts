import { config as dotenvConfig } from 'dotenv';
import { join } from 'path';

import { build } from 'mangoost';
import { config } from '../src/lib/config';
import { init } from '../src/lib/init-project';


//import { listPages, renderPage } from '../src/lib/pages';


dotenvConfig({path: join(config.projectRoot, '.env' )})

export default async function runMangoost(command: any){
    if(command.init){
        await init();
    }else if(command.build){
        await build();
    }
}