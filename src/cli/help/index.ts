const helpText = `\
exource init    初始化项目
exource start   构建文件，并且会监听文件变化，直到用户主动退出，适合开发时执行
exource build   构建文件，文件构建完成后自动退出，适合用于生产打包前执行
`
export default function help() {
	console.log(helpText);
}
