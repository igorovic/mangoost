import pkg from '../package.json';
export default function emitModulePackageFile() {
	return {
		name: 'emit-module-package-file',
		generateBundle() {
			this.emitFile({ type: 'asset', fileName: 'package.json', source: JSON.stringify(pkg, null, 2) });
		}
	};
}