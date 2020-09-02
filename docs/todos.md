- rewrite the package.json scripts to use mangoost
- use @rollup/plugin-strip to remove `debug` statements https://github.com/rollup/plugins/tree/master/packages/strip

- try to import a css file in svelte `<script>`
- try to import a css file in svelte `<style>` with `@import`


# Components rewrite
All svelte will need a refactor if the svelte RFC [Multiple `context=module`](https://github.com/sveltejs/rfcs/pull/27) is accepted and implemented.