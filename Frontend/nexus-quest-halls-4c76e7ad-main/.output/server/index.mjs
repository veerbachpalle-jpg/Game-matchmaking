globalThis.__nitro_main__ = import.meta.url;
import { n as HTTPError, r as defineLazyEventHandler, t as H3Core } from "./_libs/h3+rou3+srvx.mjs";
import { t as HookableCore } from "./_libs/hookable.mjs";
import { r as FastResponse } from "./_libs/h3-v2+rou3+srvx.mjs";
//#region #nitro-vite-setup
function lazyService(loader) {
	let promise, mod;
	return { fetch(req) {
		if (mod) return mod.fetch(req);
		if (!promise) promise = loader().then((_mod) => mod = _mod.default || _mod);
		return promise.then((mod) => mod.fetch(req));
	} };
}
var services = { ["ssr"]: lazyService(() => import("./_ssr/ssr.mjs")) };
globalThis.__nitro_vite_envs__ = services;
//#endregion
//#region #nitro/virtual/public-assets-data
var public_assets_data_default = {
	"/favicon.ico": {
		"type": "image/vnd.microsoft.icon",
		"etag": "\"4f95-3RXc3p2mhEAs1WBwaIvE0Y0uu0Y\"",
		"mtime": "2026-08-04T14:43:35.616Z",
		"size": 20373,
		"path": "../public/favicon.ico"
	},
	"/assets/admin-B1DjQ3Zh.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8dd-n9zNHVRq9wsPwrxHEW9+it6PTdU\"",
		"mtime": "2026-08-04T15:44:44.614Z",
		"size": 2269,
		"path": "../public/assets/admin-B1DjQ3Zh.js"
	},
	"/robots.txt": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"a0-CKGXSIe7TSsqDTmGm/nY1t/o5d0\"",
		"mtime": "2026-08-04T14:43:35.632Z",
		"size": 160,
		"path": "../public/robots.txt"
	},
	"/assets/intro-video-UN_JJw-K.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8e4-AcvZR5KEfGbH6nUmzK3VkSo9w4I\"",
		"mtime": "2026-08-04T15:44:44.616Z",
		"size": 2276,
		"path": "../public/assets/intro-video-UN_JJw-K.js"
	},
	"/assets/jsx-runtime-B-hcVAMW.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"216d-pcqlp1Bv4Kt7yFmWJlJC8xMXx/k\"",
		"mtime": "2026-08-04T15:44:44.616Z",
		"size": 8557,
		"path": "../public/assets/jsx-runtime-B-hcVAMW.js"
	},
	"/assets/arena-shell-BgfSCuP-.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"107e-zRsLCd1/nixYjPSUoRWmqRcfuOg\"",
		"mtime": "2026-08-04T15:44:44.616Z",
		"size": 4222,
		"path": "../public/assets/arena-shell-BgfSCuP-.js"
	},
	"/assets/login-fbAEaZzo.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"750-dvfYW85T8MA/TTNnRVaMCFnZG8A\"",
		"mtime": "2026-08-04T15:44:44.616Z",
		"size": 1872,
		"path": "../public/assets/login-fbAEaZzo.js"
	},
	"/assets/match._matchId-Du2RxN6o.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2458-g4f9046054xfXJ/ClyXgnHYu+zE\"",
		"mtime": "2026-08-04T15:44:44.616Z",
		"size": 9304,
		"path": "../public/assets/match._matchId-Du2RxN6o.js"
	},
	"/assets/matches-C_KmRH-5.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a05-n5Sf76bNx93iVheeN5H80N02lto\"",
		"mtime": "2026-08-04T15:44:44.616Z",
		"size": 2565,
		"path": "../public/assets/matches-C_KmRH-5.js"
	},
	"/assets/play-Fdymbj-n.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1f36-loucjzyDD897ioiOYCAd6cZqoGE\"",
		"mtime": "2026-08-04T15:44:44.616Z",
		"size": 7990,
		"path": "../public/assets/play-Fdymbj-n.js"
	},
	"/assets/profile-B8TyoDR6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"16d8-/L3t0jaQWzdIfiHYsJIMCOMNxC4\"",
		"mtime": "2026-08-04T15:44:44.618Z",
		"size": 5848,
		"path": "../public/assets/profile-B8TyoDR6.js"
	},
	"/assets/register-DBeBf5ZD.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"d1d-B/H/ym4LZ/klNuiMo+IwkDhCKqo\"",
		"mtime": "2026-08-04T15:44:44.618Z",
		"size": 3357,
		"path": "../public/assets/register-DBeBf5ZD.js"
	},
	"/assets/useQuery-DfH5QXYK.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"224f-oy0ZlXGTtA+j+cmKqdoS1IzCfno\"",
		"mtime": "2026-08-04T15:44:44.618Z",
		"size": 8783,
		"path": "../public/assets/useQuery-DfH5QXYK.js"
	},
	"/assets/routes-BmDXTGNT.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2a0e-zTNijXsj/KgUepkMIA4f2YELuUM\"",
		"mtime": "2026-08-04T15:44:44.618Z",
		"size": 10766,
		"path": "../public/assets/routes-BmDXTGNT.js"
	},
	"/assets/styles-CsN8v05x.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"16335-tNnpn59mf6rcXfGqlWA0cYU5LRA\"",
		"mtime": "2026-08-04T15:44:44.618Z",
		"size": 90933,
		"path": "../public/assets/styles-CsN8v05x.css"
	},
	"/assets/index-DXU5smvS.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"5f3e2-zp6ji+JA6BFEj4kzifQbKDXpSs8\"",
		"mtime": "2026-08-04T15:44:44.614Z",
		"size": 390114,
		"path": "../public/assets/index-DXU5smvS.js"
	},
	"/assets/hero-scene-C3J7FGL2.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"e5102-ZHggLjLYAS8f+WL09h+pcrbCZEo\"",
		"mtime": "2026-08-04T15:44:44.616Z",
		"size": 938242,
		"path": "../public/assets/hero-scene-C3J7FGL2.js"
	}
};
//#endregion
//#region #nitro/virtual/public-assets
var publicAssetBases = {};
function isPublicAssetURL(id = "") {
	if (public_assets_data_default[id]) return true;
	for (const base in publicAssetBases) if (id.startsWith(base)) return true;
	return false;
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/route-rules.mjs
var headers = ((m) => function headersRouteRule(event) {
	for (const [key, value] of Object.entries(m.options || {})) event.res.headers.set(key, value);
});
//#endregion
//#region #nitro/virtual/routing
var findRouteRules = /* @__PURE__ */ (() => {
	const $0 = [{
		name: "headers",
		route: "/assets/**",
		handler: headers,
		options: { "cache-control": "public, max-age=31536000, immutable" }
	}];
	return (m, p) => {
		let r = [];
		if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
		let s = p.split("/");
		if (s.length > 1) {
			if (s[1] === "assets") r.unshift({
				data: $0,
				params: { "_": s.slice(2).join("/") }
			});
		}
		return r;
	};
})();
var _lazy_NRho2V = defineLazyEventHandler(() => import("./_chunks/ssr-renderer.mjs"));
var findRoute = /* @__PURE__ */ (() => {
	const data = {
		route: "/**",
		handler: _lazy_NRho2V
	};
	return ((_m, p) => {
		return {
			data,
			params: { "_": p.slice(1) }
		};
	});
})();
[].filter(Boolean);
//#endregion
//#region node_modules/nitro/dist/runtime/internal/error/prod.mjs
var errorHandler = (error, event) => {
	const res = defaultHandler(error, event);
	return new FastResponse(typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2), res);
};
function defaultHandler(error, event) {
	const unhandled = error.unhandled ?? !HTTPError.isError(error);
	const { status = 500, statusText = "" } = unhandled ? {} : error;
	if (status === 404) {
		const url = event.url || new URL(event.req.url);
		const baseURL = "/";
		if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) return {
			status: 302,
			headers: new Headers({ location: `${baseURL}${url.pathname.slice(1)}${url.search}` })
		};
	}
	const headers = new Headers(unhandled ? {} : error.headers);
	headers.set("content-type", "application/json; charset=utf-8");
	return {
		status,
		statusText,
		headers,
		body: {
			error: true,
			...unhandled ? {
				status,
				unhandled: true
			} : typeof error.toJSON === "function" ? error.toJSON() : {
				status,
				statusText,
				message: error.message
			}
		}
	};
}
//#endregion
//#region #nitro/virtual/error-handler
var errorHandlers = [errorHandler];
async function error_handler_default(error, event) {
	for (const handler of errorHandlers) try {
		const response = await handler(error, event, { defaultHandler });
		if (response) return response;
	} catch (error) {
		console.error(error);
	}
}
//#endregion
//#region #nitro/virtual/app
function createNitroApp() {
	const captureError = (error, errorCtx) => {
		if (errorCtx?.event) {
			const errors = errorCtx.event.req.context?.nitro?.errors;
			if (errors) errors.push({
				error,
				context: errorCtx
			});
		}
	};
	const h3App = createH3App({ onError(error, event) {
		return error_handler_default(error, event);
	} });
	let appHandler = (req) => {
		req.context ||= {};
		req.context.nitro = req.context.nitro || { errors: [] };
		return h3App.fetch(req);
	};
	return {
		fetch: appHandler,
		h3: h3App,
		hooks: void 0,
		captureError
	};
}
function createH3App(config) {
	const h3App = new H3Core(config);
	h3App["~findRoute"] = (event) => findRoute(event.req.method, event.url.pathname);
	h3App["~getMiddleware"] = (event, route) => {
		const pathname = event.url.pathname;
		const method = event.req.method;
		const middleware = [];
		const routeRules = getRouteRules(method, pathname);
		event.context.routeRules = routeRules?.routeRules;
		if (routeRules?.routeRuleMiddleware.length) middleware.push(...routeRules.routeRuleMiddleware);
		if (route?.data?.middleware?.length) middleware.push(...route.data.middleware);
		return middleware;
	};
	return h3App;
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/app.mjs
var APP_ID = "default";
function useNitroApp() {
	let instance = useNitroApp._instance;
	if (instance) return instance;
	instance = useNitroApp._instance = createNitroApp();
	globalThis.__nitro__ = globalThis.__nitro__ || {};
	globalThis.__nitro__[APP_ID] = instance;
	return instance;
}
function useNitroHooks() {
	const nitroApp = useNitroApp();
	const hooks = nitroApp.hooks;
	if (hooks) return hooks;
	return nitroApp.hooks = new HookableCore();
}
function getRouteRules(method, pathname) {
	const m = findRouteRules(method, pathname);
	if (!m?.length) return { routeRuleMiddleware: [] };
	const routeRules = {};
	for (const layer of m) for (const rule of layer.data) {
		const currentRule = routeRules[rule.name];
		if (currentRule) {
			if (rule.options === false) {
				delete routeRules[rule.name];
				continue;
			}
			if (typeof currentRule.options === "object" && typeof rule.options === "object") currentRule.options = {
				...currentRule.options,
				...rule.options
			};
			else currentRule.options = rule.options;
			currentRule.route = rule.route;
			currentRule.params = {
				...currentRule.params,
				...layer.params
			};
		} else if (rule.options !== false) routeRules[rule.name] = {
			...rule,
			params: layer.params
		};
	}
	const middleware = [];
	const orderedRules = Object.values(routeRules).sort((a, b) => (a.handler?.order || 0) - (b.handler?.order || 0));
	for (const rule of orderedRules) {
		if (rule.options === false || !rule.handler) continue;
		middleware.push(rule.handler(rule));
	}
	return {
		routeRules,
		routeRuleMiddleware: middleware
	};
}
//#endregion
//#region node_modules/nitro/dist/presets/cloudflare/runtime/_module-handler.mjs
function createHandler(hooks) {
	const nitroApp = useNitroApp();
	const nitroHooks = useNitroHooks();
	return {
		async fetch(request, env, context) {
			globalThis.__env__ = env;
			augmentReq(request, {
				env,
				context
			});
			const ctxExt = {};
			const url = new URL(request.url);
			if (hooks.fetch) {
				const res = await hooks.fetch(request, env, context, url, ctxExt);
				if (res) return res;
			}
			return await nitroApp.fetch(request);
		},
		scheduled(controller, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:scheduled", {
				controller,
				env,
				context
			}) || Promise.resolve());
		},
		email(message, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:email", {
				message,
				event: message,
				env,
				context
			}) || Promise.resolve());
		},
		queue(batch, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:queue", {
				batch,
				event: batch,
				env,
				context
			}) || Promise.resolve());
		},
		tail(traces, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:tail", {
				traces,
				env,
				context
			}) || Promise.resolve());
		},
		trace(traces, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:trace", {
				traces,
				env,
				context
			}) || Promise.resolve());
		}
	};
}
function augmentReq(cfReq, ctx) {
	const req = cfReq;
	req.ip = cfReq.headers.get("cf-connecting-ip") || void 0;
	req.runtime ??= { name: "cloudflare" };
	req.runtime.cloudflare = {
		...req.runtime.cloudflare,
		...ctx
	};
	req.waitUntil = ctx.context?.waitUntil.bind(ctx.context);
}
//#endregion
//#region node_modules/nitro/dist/presets/cloudflare/runtime/cloudflare-module.mjs
var cloudflare_module_default = createHandler({ fetch(cfRequest, env, context, url) {
	if (env.ASSETS && isPublicAssetURL(url.pathname)) return env.ASSETS.fetch(cfRequest);
} });
//#endregion
export { cloudflare_module_default as default };
