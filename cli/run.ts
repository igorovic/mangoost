import { join } from 'path';
import { creatDirectories } from '../src/lib/init-project';
import { listPages, renderPage } from '../src/lib/pages';
import { config } from '../src/lib/config';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig({path: join(config.projectRoot, '.env' )})

export default async function runMangoost(command: any){
    if(command.init){
        await creatDirectories();
    }else if(command.build){
        let pages = listPages();
        let pending = pages.map(async (page) => renderPage(page));
        await Promise.all(pending);
    }
}