import { createSSRApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";

// 全局错误过滤：压制第三方脚本（brush_cx 等）的非关键异常
if (typeof window !== "undefined") {
	const origOnError = window.onerror;
	window.onerror = function (msg, source, lineno, colno, error) {
		if (msg && typeof msg === "string" && msg.includes("is not a function")) {
			return true; // 已处理，不冒泡
		}
		if (origOnError) return origOnError(msg, source, lineno, colno, error);
		return false;
	};
}

export function createApp() {
	const app = createSSRApp(App);
	const pinia = createPinia();
	app.use(pinia);
	return {
		app,
	};
}
