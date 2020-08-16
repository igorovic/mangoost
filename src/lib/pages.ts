import path from 'path';
import { WalkSync } from './filesystem';
import config from './config';

export function pages(){
    let Source = path.join(config.projectRoot, '/pages/');
    return WalkSync(Source);
}


