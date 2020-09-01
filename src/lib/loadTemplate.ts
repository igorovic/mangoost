import { readFileSync } from 'fs';
import { join } from 'path';

import { config } from './config';
import { exists } from './filesystem';

export function loadTemplate(){
    const projectTemplate = join(config.projectRoot, 'src', 'template.html');
    if(exists(projectTemplate)){
        return readFileSync(projectTemplate, 'utf-8');
    }
    return readFileSync(join(__dirname, '../templates', 'default.html'), 'utf-8');
}