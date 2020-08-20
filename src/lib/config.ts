import { projectRootPath } from './utils';

export const config = {
    outDir: 'public',
    projectRoot: projectRootPath(),
    apiCallsCache: 30               // cache api calls results; in seconds
}

export default config;