- rewrite the package.json scripts to use mangoost
- rewrite rollup.config.js to use `mangoost/config/rollup` 
    line: `import config from 'sapper/config/rollup.js';` rewrite to: `import { rollup as config} from 'mangoost';`