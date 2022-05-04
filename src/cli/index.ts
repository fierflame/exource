import help from './help';
import init from './init';
import run from './run';

function main() {

	const s = process.argv.slice(2)
	const index  = s.indexOf('--');
	const all = index < 0 ? s : s.slice(0, index)
	if (all.includes('-h') || all.includes('--help')) { return help(); }
	switch(process.argv[2]) {
		case 'init': init(); break;
		case 'start': run(true); break;
		case 'build': run(false); break;
		default: help();
	}
}
main()
