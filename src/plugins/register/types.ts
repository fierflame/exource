export type ConfigPropKind = 'config';

export interface ConfigPropDefine {
	/**
	 * 属性来源
	 * @enum 'config' 表示来自配置文件`config.{json,yml}`
	 */
	 kind: 'config';
	/**
	 * 是否为国际化属性
	 * 当设置为 true 时：
	 * 如果此属性在配置文件中为字符串，则表示其值
	 * 如果是此属性在配置文件中为对象，则键为语言，值为对应文本
	 */
	locale?: boolean;
	/**
	 * 此属性在定义文件对应的 .ts 文件中的类型
	 * 当 `locale` 为 `true` 时，无效
	 */
	type?: string;
}
export type FilePropKind = 'attr' | 'component' | 'function' | 'vue3' | 'react'

export interface DefineFileProp {
	/**
	 * 属性类型
	 * @enum 'attr' 表示来自文件默认导出的属性
	 * @enum 'function' 表示来自文件默认导出的函数
	 * @enum 'component' 表示来自文件默认导出的组件
	 * @enum 'vue3' 表示来自文件默认导出的 Vue3 组件
	 * @enum 'react' 表示来自文件默认导出的 react 组件
	 * @default 'attr'
	 */
	kind: FilePropKind;
	/**
	 * 是否为异步函数
	 * 仅当 `from` 为 `function` 时有效
	 * 如果设置为 true，即便不是异步函数，也会返回 Promise
	 */
	async?: boolean;
	/**
	 * 是否懒加载
	 * 当前仅支持组件和 async 为 true 的函数
	 */
	lazy?: boolean;
	/** 此属性在定义文件对应的 .ts 文件中的类型 */
	type?: string;
}

export interface MethodExportDefine {
	/** 行为
	 * @default 'get'
	 * @enum 'get' 仅用于获取，如果不传参数，则表示返回所以匹配对象的 hash，如果传一个参数，表示仅返回指定的对象（如果没有，则为 undefined）
	 * @enum 'exec' 执行函数（从第二个参数开始作为函数的参数）
	 */
	action?: 'get' | 'exec';

	/**
	 * 必须包含的属性
	 */
	includes?: string | string[];
	/**
	 * 返回的属性
	 * 如果是字符串，表示返回对应的属性值
	 * 如果是数组，则返回指定属性构成的对象
	 * 如果是对象，则返回指定属性构成的对象，其中键为返回对象中的键名，值为对应的属性
	 */
	return: string | string[] | Record<string, string>;
}

export type PropDefine = ConfigPropDefine | DefineFileProp
export type ExportDefine = MethodExportDefine
export interface Define {
	/** 属性定义 */
	props?: Record<string, PropDefine | ConfigPropKind | FilePropKind>;
	/** 导出定义 */
	exports?: Record<string, ExportDefine>;

}
