import { RegisterInfo } from '../../../mergeDefine';
import createExport from './createExport';

export default function({props, exports}: RegisterInfo) {
	return [
		`import __items from './items';`,
		`import __filter from '../__filter';`,
		`import __locale from '../__locale';`,
		'',
		...Object.entries(exports)
			.map(([name, ex]) => createExport(name, ex, props)),
	].join('\n');
}
