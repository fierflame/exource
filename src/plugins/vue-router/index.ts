
import type { Api } from 'exource';
import writeIndex from './writeIndex';
import writeRoutes from './writeRoutes';



export default async function router(api: Api, {
	lazy,
	base,
	baseScript,
	componentProps,
	allMatchPath,
	delay, timeout, errorComponent, loadingComponent,
}: {
	lazy?: boolean;
	base?: string;
	baseScript?: string;
	componentProps?: string | string[];
	allMatchPath?: string;

	delay?: number,
	timeout?: number,
	errorComponent?: string;
	loadingComponent?: string;
}) {
	await writeIndex(api, {baseScript, base});
	await writeRoutes(api, {
		lazy,
		componentProps,
		allMatchPath,
		delay, timeout, errorComponent, loadingComponent,
	});
	api.setImport({'./vue-router': 'vueRouter'});
}
router.id = 'exource/vue-router';
router.tag = 'router';
