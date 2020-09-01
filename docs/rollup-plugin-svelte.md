# Rollup plugin svelte

It will import the css files in the Bundle if `emitCss: true`. 

It basically creates a fake css file based on the nave of the svelte file it's currently processing and then import it in the compiled code.
At the final stage, before bundle is saved to disk it will write all the generated CSS to disk. This is done in `generateBundle`. 

```javascript
let fname = id.replace(new RegExp(`\\${extension}$`), '.css');

//...

compiled.js.code += `\nimport ${JSON.stringify(fname)};\n`;
```