import * as path from 'path';
import config from './config';
import { WalkSync } from './filesystem';



export default function pages(){
    let Source = path.join(config.projectRoot, '/pages/');
    return WalkSync(Source);
}