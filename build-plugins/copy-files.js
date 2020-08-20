const { readdirSync} = require('fs');
const { join, resolve, sep } = require('path');

const { copy } = require('fs-extra')

function WalkSync(Path, prefix, options={ignoreDirs: false}){
    let Files = [];
    let Listing = readdirSync(Path, {withFileTypes: true});
    
    Listing.forEach(item => {
        if(!item.isDirectory()){
            Files.push(prefix ? join(prefix, item.name) : item.name)
        }else{
            if( !options.ignoreDirs ){
                Files = Files.concat(WalkSync(path.join(Path, item.name), item.name));
            }
        }
    })
    return Files;
};
export default function copyFiles() {
	return {
		name: 'copy-files',
		generateBundle() {
            const projectRoot = join("/", ...resolve('package.json').split(sep).slice(0,-1));
            const srcDir = join(projectRoot, 'templates');
            const dstDir = join(projectRoot, 'dist/templates');
            const Files = WalkSync(srcDir);
            Files.forEach(file => {
                const srcFile = join(srcDir, file);
                const dstFile = join(dstDir, file);
                copy(srcFile, dstFile, (err) => {
                    if (err) throw err;
                    console.log(srcFile, 'was copied to ', dstFile);
                });
            })
		}
	};
}