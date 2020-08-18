export default function addBinShebangAndEsmImport() {
	let importFound = false;
	return {
		name: 'esm-dynamic-import',
		renderDynamicImport({ moduleId }) {
			importFound = true;
			console.log("DEBUG", moduleId)
			if (moduleId.endsWith('mangoost.ts')) {
				return { left: 'import(', right: ')' };
			}
		},
		generateBundle() {
			if (!importFound) {
				throw new Error(
					'Could not find dynamic import in "loadConfigFile.ts", was the file renamed?'
				);
			}
		}
	};
}