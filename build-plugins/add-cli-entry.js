import MagicString from 'magic-string';

export default function addCliEntry() {
	return {
		name: 'add-cli-entry',
		buildStart() {
			this.emitFile({
				type: 'chunk',
				id: 'cli/cli.ts',
				fileName: 'bin/mgoost',
				preserveSignature: false,
			});
		},
		renderChunk(code, chunkInfo) {
			if (chunkInfo.fileName === 'bin/mgoost') {
				const magicString = new MagicString(code);
				//magicString.remove(0, "'use strict';\n".length);
				//magicString.prepend();
				//magicString.prepend("const mangoost = require('../mangoost');\n");
				//magicString.prepend("'use strict';\n")
				magicString.prepend('#!/usr/bin/env node\n\n');
				
				return { code: magicString.toString(), map: magicString.generateMap({ hires: true }) };
			}
		}
	};
}