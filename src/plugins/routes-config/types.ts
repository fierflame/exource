export interface HandlerApi {
	ignore(...props: string[]): void;
	resolvePath(path: string): string;
	names: string[],
}
export interface Handler {
	(
		route: Route,
		cfg: RouteCfg,
		api: HandlerApi,
		opt: Record<string, any>,
	): void;
}

export interface RouteCfg {
	/**
	 * 菜单的顺序
	 * @description 数字越小越靠前
	 * @description 仅一级路由生效
	 * @default 0
	 */
	order?: number;
	/** 路由名称 */
	name?: string;
	/** 路由路径 */
	path?: string;
	/**
	 * 子路由列表
	 * @description 项目如果是字符串，则表示对某组的引用
	 * @description 项目如果是404，则表示此处插入 404 组件
	 */
	children?: RouteCfgList;
	/**
	 * 组件路径
	 * @description 当为 vue 路由时，此项将会作为 components 的 default 属性
	 */
	component?: string;
	/**
	 * 组件路径 
	 * @description 仅对 vue 有效，参考 vue router
	 * @description 区别在于 vue router 中的值为组件，而此配置中为组件路径
	 * @description component 和 components 不能同时存在
	 */
	components?: Record<string, string>;
	/** 重定向路由
	 * @description 优先级高于 component、components
	 * @description 当此项被匹配时，将会自动发生路由的跳转
	 */
	redirect?: string;

	[k: string]: any;
}
export type RouteCfgList = (RouteCfg | string | 404)[];

export interface Route extends RouteCfg {
	/**
	 * 子路由列表
	 * @description 
	 */
	children?: Route[];
}

export interface RouteMenuCfg {
	/**
	 * 菜单或面包屑的名称
	 * @description 如果未配置名称将不显示对应菜单及面包屑
	 */
	 title?: string | [string, Record<string, string>?];
	 /**
	 * 菜单图标
	 * @description 如果为不含`/`的字符串则为图标名称
	 * @description 如果为含`/`的字符串，则为图标组件路径
	 * @description 如果为数组，则第一项为图标名称，第二项为图标颜色
	 * @description 如果为对象，则为 {icon: string; color?: string} 格式的对象，其中，icon 为图标名称，color 为图标颜色
	 */
	icon?: string | [string, string?] | {icon: string; color?: string};
	/**
	 * 是否显示此项菜单
	 * @description 可以按照需要配置，可以参考以下配置：
	 * @description 仅当父路由显示且父路由 `menu` 不为 `'only'` 且此路由 `name` 已配置时有效
	 * @enum `true` 显示此菜单及其子菜单（当子菜单 menu 不为 false 时）
	 * @enum `false` 隐藏此菜单及其子菜单（当子菜单 menu 不为 false 时）
	 * @enum `'only'` 仅显示此菜单，但其子菜单不会被显示
	 * @enum `'children'` 不显示此菜单，但将子菜单展开显示
	 * @default true
	 */
	 menu?: 'children' | 'only' | boolean;
	 /** 重定义菜单链接 */
	 link?: string;
 }
export interface RouteMenu extends RouteMenuCfg {
	/**
	 * 菜单或面包屑的名称
	 * @description 如果未配置名称将不显示对应菜单及面包屑
	 * @description 数组第一项为默认名称，第二项为国际化名称
	 */
	 title?: [string, Record<string, string>?];
	 /**
	 * 菜单图标
	 * @description 如果为字符串，则为图标组件路径
	 * @description 如果为数组，则第一项为图标名称，第二项为图标颜色
	 */
	icon?: string | [string, string?];
}

export interface RouteAuthorityCfg {

	/**
	 * 此项需要的权限
	 * @description 当不存在此项时，表示不需要权限
	 */
	authority?: string[];
}
export interface RouteAuthority extends RouteAuthorityCfg {
}
