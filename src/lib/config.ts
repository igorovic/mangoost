import { projectRootPath } from './utils';

export const config = {
    outDir: 'public',
    pages: 'src/pages',
    projectRoot: projectRootPath(),
    apiCallsCache: 30,               // cache api calls results; in seconds
    ExpectedDirecotires: ["public", "src/pages", "src/styles", "src/javascripts"]
}

export default config;