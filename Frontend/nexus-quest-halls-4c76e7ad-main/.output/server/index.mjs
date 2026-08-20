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
	"/robots.txt": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"a0-CKGXSIe7TSsqDTmGm/nY1t/o5d0\"",
		"mtime": "2026-08-04T14:43:35.632Z",
		"size": 160,
		"path": "../public/robots.txt"
	},
	"/favicon.ico": {
		"type": "image/vnd.microsoft.icon",
		"etag": "\"4f95-3RXc3p2mhEAs1WBwaIvE0Y0uu0Y\"",
		"mtime": "2026-08-04T14:43:35.616Z",
		"size": 20373,
		"path": "../public/favicon.ico"
	},
	"/assets/arena-shell-CeOZxZHu.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1161-y+ec1k5jj2sY1eRVhwkUEh2QUtQ\"",
		"mtime": "2026-08-20T18:16:12.570Z",
		"size": 4449,
		"path": "../public/assets/arena-shell-CeOZxZHu.js"
	},
	"/assets/admin-HGQ_egR6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"164c-scgIsf/u/aNiI5AATYFDxj6yXAE\"",
		"mtime": "2026-08-20T18:16:12.570Z",
		"size": 5708,
		"path": "../public/assets/admin-HGQ_egR6.js"
	},
	"/assets/custom-room-BhdGQ_4y.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"151e-/T7Tdf9YlzFN40PtmbUwxvvVaik\"",
		"mtime": "2026-08-20T18:16:12.570Z",
		"size": 5406,
		"path": "../public/assets/custom-room-BhdGQ_4y.js"
	},
	"/assets/jsx-runtime-B-hcVAMW.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"216d-pcqlp1Bv4Kt7yFmWJlJC8xMXx/k\"",
		"mtime": "2026-08-20T18:16:12.570Z",
		"size": 8557,
		"path": "../public/assets/jsx-runtime-B-hcVAMW.js"
	},
	"/assets/link-0Itp9X56.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"62d8-UJgxD6/oVeEZO51BlaIcG3nmLqU\"",
		"mtime": "2026-08-20T18:16:12.570Z",
		"size": 25304,
		"path": "../public/assets/link-0Itp9X56.js"
	},
	"/assets/intro-video-CdFyFR_E.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"772-5b7g6zTlUp9+Oi0IsrmD7zPHmSQ\"",
		"mtime": "2026-08-20T18:16:12.570Z",
		"size": 1906,
		"path": "../public/assets/intro-video-CdFyFR_E.js"
	},
	"/assets/match._matchId-euajvMhS.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2ec9-YrDtzXLHEedj8O4lkTB0nN01D7s\"",
		"mtime": "2026-08-20T18:16:12.570Z",
		"size": 11977,
		"path": "../public/assets/match._matchId-euajvMhS.js"
	},
	"/assets/login-Bhi1jShS.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"76e-TCsv7RjQSX+tVcL7HTvhOhXRvXw\"",
		"mtime": "2026-08-20T18:16:12.570Z",
		"size": 1902,
		"path": "../public/assets/login-Bhi1jShS.js"
	},
	"/assets/match._matchId-D6QqFFac.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"808-rEPVH6HeiaIosKEtsmuKpIdeyEA\"",
		"mtime": "2026-08-20T18:16:12.570Z",
		"size": 2056,
		"path": "../public/assets/match._matchId-D6QqFFac.js"
	},
	"/assets/play-BIb35YTL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4ad-QreXlsDvwSC10ObnbZI+irXWhoo\"",
		"mtime": "2026-08-20T18:16:12.576Z",
		"size": 1197,
		"path": "../public/assets/play-BIb35YTL.js"
	},
	"/assets/matches-Dnhujj7w.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a59-pQLPDM0RdelsqTs5e15Td+AhOKs\"",
		"mtime": "2026-08-20T18:16:12.576Z",
		"size": 2649,
		"path": "../public/assets/matches-Dnhujj7w.js"
	},
	"/assets/play-hi0FlyTi.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"517d-fIL7R/l20h6F+7UzZTM6lBnkr0w\"",
		"mtime": "2026-08-20T18:16:12.576Z",
		"size": 20861,
		"path": "../public/assets/play-hi0FlyTi.js"
	},
	"/assets/preload-helper-Czpn1I53.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4ac-sE+5KsaRXTMfwOfrOATQajMSGV4\"",
		"mtime": "2026-08-20T18:16:12.577Z",
		"size": 1196,
		"path": "../public/assets/preload-helper-Czpn1I53.js"
	},
	"/assets/profile-PJMi92fH.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2d0b-lwgXzVe9nyBgvnHYDjXRiWG7rdU\"",
		"mtime": "2026-08-20T18:16:12.577Z",
		"size": 11531,
		"path": "../public/assets/profile-PJMi92fH.js"
	},
	"/assets/index-BxH5RXtB.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"477c4-5OGzUwbKbPwdWA5hASymX5lBHs4\"",
		"mtime": "2026-08-20T18:16:12.570Z",
		"size": 292804,
		"path": "../public/assets/index-BxH5RXtB.js"
	},
	"/assets/register-bXwgsBeH.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"d40-OoCqKRJadB/YquRMsj+7lG1SlCg\"",
		"mtime": "2026-08-20T18:16:12.577Z",
		"size": 3392,
		"path": "../public/assets/register-bXwgsBeH.js"
	},
	"/assets/QueryClientProvider-_LPpKjhV.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3b8b-yD+PW5cYfC455xJkF9Sk5ejKeE8\"",
		"mtime": "2026-08-20T18:16:12.570Z",
		"size": 15243,
		"path": "../public/assets/QueryClientProvider-_LPpKjhV.js"
	},
	"/assets/scheduler-DKXNJQfU.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ddf-VLf9CLbv64JEqMUSfgBRl7uGUAs\"",
		"mtime": "2026-08-20T18:16:12.577Z",
		"size": 3551,
		"path": "../public/assets/scheduler-DKXNJQfU.js"
	},
	"/assets/routes-BHozZnem.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1da2-zO8iB9Rbj6lRmY8Hz5nfG2Y4DgQ\"",
		"mtime": "2026-08-20T18:16:12.577Z",
		"size": 7586,
		"path": "../public/assets/routes-BHozZnem.js"
	},
	"/assets/styles-Cs5bts0x.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"19ff0-kt50a7N6bCzxomGodayJ8xdVgW0\"",
		"mtime": "2026-08-20T18:16:12.579Z",
		"size": 106480,
		"path": "../public/assets/styles-Cs5bts0x.css"
	},
	"/assets/hero-scene-D_pmlcZ6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"e512f-4vSN1189yhiJK1giFz43bHl8PTo\"",
		"mtime": "2026-08-20T18:16:12.570Z",
		"size": 938287,
		"path": "../public/assets/hero-scene-D_pmlcZ6.js"
	},
	"/assets/use-auth-BMMVYRs9.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"d4b-poworN0ZRaZumbE1aH1G4JwPPt0\"",
		"mtime": "2026-08-20T18:16:12.577Z",
		"size": 3403,
		"path": "../public/assets/use-auth-BMMVYRs9.js"
	},
	"/assets/use-matchmaking-CD2lyZbW.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3bd-DDvmi3vON3GNY3QViv8KPAAkXVw\"",
		"mtime": "2026-08-20T18:16:12.577Z",
		"size": 957,
		"path": "../public/assets/use-matchmaking-CD2lyZbW.js"
	},
	"/assets/use-socket-Csp6U-sB.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ba93-2mK3zjKFmwEw3qaycs/PLR8EsdM\"",
		"mtime": "2026-08-20T18:16:12.577Z",
		"size": 47763,
		"path": "../public/assets/use-socket-Csp6U-sB.js"
	},
	"/assets/with-selector-dQnI5o1Q.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"65a-abb1mkku8IgQ7Yr6Ah8oGA62ERw\"",
		"mtime": "2026-08-20T18:16:12.579Z",
		"size": 1626,
		"path": "../public/assets/with-selector-dQnI5o1Q.js"
	},
	"/assets/useQuery-C305vIGb.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"225d-H8dKLXdSqjUKyxWOAr5dplUvPu4\"",
		"mtime": "2026-08-20T18:16:12.579Z",
		"size": 8797,
		"path": "../public/assets/useQuery-C305vIGb.js"
	},
	"/assets/useNavigate-w_vf0_qF.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"df-4TPQl6a0OExg0hHcIh5LxkJYD9A\"",
		"mtime": "2026-08-20T18:16:12.579Z",
		"size": 223,
		"path": "../public/assets/useNavigate-w_vf0_qF.js"
	},
	"/Dragon.mp4": {
		"type": "video/mp4",
		"etag": "\"2960ac-3rp10SSh3OA+p79bEO529Z8y3eo\"",
		"mtime": "2026-08-20T18:13:56.892Z",
		"size": 2711724,
		"path": "../public/Dragon.mp4"
	},
	"/intro.mp4": {
		"type": "video/mp4",
		"etag": "\"2fdd5f-+EM1w+BZqBInClFHNJzEDLjmqpk\"",
		"mtime": "2026-08-18T17:19:17.595Z",
		"size": 3136863,
		"path": "../public/intro.mp4"
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
