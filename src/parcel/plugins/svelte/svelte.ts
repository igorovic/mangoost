import { Asset, generateName } from '../utils';
import { compile, preprocess } from 'svelte/compiler';


class SvelteAsset extends Asset {
  constructor(name: any, pkg: any, options: any) {
    super(name, pkg, options);
    this.type = 'js';
  }

  async getConfig() {
    const customOptions = (await super.getConfig(['.svelterc', 'svelte.config.js'], { packageKey: 'svelte' })) || {};

    // Settings for the compiler that depend on parcel.
    const parcelCompilerOptions = {
      filename: this.relativeName,
      name: generateName(this.relativeName),
      dev: !this.options.production
    };

    // parcelCompilerOptions will overwrite the custom ones,
    // because otherwise it can break the compilation process.
    // Note: "compilerOptions" is deprecated and replaced by compiler.
    // Since the depracation didnt take effect yet, we still support the old way.
    const compiler = { ...customOptions.compilerOptions, ...customOptions.compiler, ...parcelCompilerOptions };
    const preprocess = customOptions.preprocess;

    return { compiler, preprocess };
  }

  async generate() {
    const config = await this.getConfig();

    if (config.preprocess) {
      const preprocessed = await preprocess(this.contents, config.preprocess, { filename: config.compiler.filename });
      if (preprocessed.dependencies) {
        for (const dependency of preprocessed.dependencies) {
          this.addDependency(dependency, { includedInParent: true });
        }
      }
      this.contents = preprocessed.toString();
    }

    const { js, css } = compile(this.contents, config.compiler);

    if (this.options.sourceMaps) {
      js.map.sources = [this.relativeName];
      js.map.sourcesContent = [this.contents];
    }

    const parts: {[s:string]: any}[] = [
      {
        type: 'js',
        value: js.code,
        sourceMap: this.options.sourceMaps ? js.map : undefined
      }
    ];

    if (css) {
      parts.push({
        type: 'css',
        value: css.code
      });
    }

    return parts;
  }

  async postProcess(generated: any[]) {
    // Hacky fix to remove duplicate JS asset (Css HMR code)
    const filteredArr = generated.filter(part => part.type !== 'js');
    return [generated[0]].concat(filteredArr);
  }
}

/*
** Because Parcel uses require to import a module from a string we need to 
** export this plugin with module.exports. Which is the CJS way.
** I don't know if typescript is able to compile an export to `module.exports` 
*/
module.exports = SvelteAsset;