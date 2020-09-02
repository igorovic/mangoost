import { projectRootPath } from './utils';

// TODO: validate config.outDir should not be absolute
export const config = {
    apiCallsCache: 30,  // cache api calls results; in seconds
    autoprefixer: {},
    enableTailwind: true,
    ExpectedDirecotires: ["public", "src/pages", "src/styles", "src/javascripts"],
    outDir: 'public',
    pages: 'src/pages',
    projectRoot: projectRootPath(),
    stylesOutDir: null,             // set the output directory if you want all styles in the same folder. They will still be relative to the main outDir.
    tailwind: null,
}

export default config;