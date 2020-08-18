import help from 'help.md';
import { version } from 'package.json';
import argParser from 'yargs-parser';

import run from './run';


const command = argParser(process.argv.slice(2), {
	//alias: commandAliases,
	configuration: { 'camel-case-expansion': false }
});

if (command.help || (process.argv.length <= 2 && process.stdin.isTTY)) {
	console.log(`\n${help.replace('__VERSION__', version)}\n`);
} else if (command.version) {
	console.log(`mangoost v${version}`);
} else {
	
	run(command);
	
}
console.log("Mangoost finished!");
