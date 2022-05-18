export interface ComponentPropConfig {
	delay?: number,
	timeout?: number,
	errorComponent?: string;
	loadingComponent?: string;
}
export interface Options extends ComponentPropConfig {
	lazy?: boolean;
	componentProps?: string | string[] | Record<string, ComponentPropConfig | boolean>;
	allMatchPath?: string;

}
