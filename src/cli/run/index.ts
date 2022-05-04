import { logger } from 'exource';
import search from './search'
import start from './start';

export default async function(watch: boolean) {
	const value = await search();
	if (value) { return start(value.filepath, value.config, watch); }
	logger(2, 'exource', 'start', '找不到配置文件，请先使用 exource init 进行初始化或手动创建配置文件');
}
