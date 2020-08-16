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
				magicString.prepend('#!/usr/bin/env node\n\n');
				return { code: magicString.toString(), map: magicString.generateMap({ hires: true }) };
			}
		}
	};
}