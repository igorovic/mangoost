import  {basename, extname } from 'path';
/*
** code borrowed from 
** https://github.com/DeMoorJasper/parcel-plugin-svelte/blob/master/packages/parcel-plugin-svelte/lib/utils.js
*/ 
export function generateName(input: string) {
  let name = basename(input)
    .replace(extname(input), '')
    .replace(/[^a-zA-Z_$0-9]+/g, '_')
    .replace(/^_/, '')
    .replace(/_$/, '')
    .replace(/^(\d)/, '_$1');

  name = name[0].toUpperCase() + name.slice(1);
  return name;
}

// Parcel can be added as a dependency by using two different
// names. This is how we get the right one.
function getAssetClass() {
  try {
    return require('parcel').Asset;
  } catch (e) {
    return require('parcel-bundler').Asset;
  }
}

export const Asset = getAssetClass();
