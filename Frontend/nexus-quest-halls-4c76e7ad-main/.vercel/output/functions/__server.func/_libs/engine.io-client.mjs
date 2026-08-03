import { a as __toCommonJS, i as __require, n as __esmMin, o as __toESM, r as __exportAll, t as __commonJSMin } from "../_runtime.mjs";
import { t as Emitter } from "./socket.io__component-emitter.mjs";
import { t as require_src } from "./debug+[...].mjs";
/**
* Wrapper for built-in http.js to emulate the browser XMLHttpRequest object.
*
* This can be used with JS designed for browsers to improve reuse of code and
* allow the use of existing libraries.
*
* Usage: include("XMLHttpRequest.js") and use XMLHttpRequest per W3C specs.
*
* @author Dan DeFelippi <dan@driverdan.com>
* @contributor David Ellis <d.f.ellis@ieee.org>
* @license MIT
*/
//#endregion
//#region node_modules/engine.io-parser/build/esm/commons.js
var import_XMLHttpRequest = /* @__PURE__ */ __toESM((/* @__PURE__ */ __commonJSMin(((exports, module) => {
	var fs = __require("fs");
	var Url = __require("url");
	var spawn = __require("child_process").spawn;
	/**
	* Module exports.
	*/
	module.exports = XMLHttpRequest$2;
	XMLHttpRequest$2.XMLHttpRequest = XMLHttpRequest$2;
	/**
	* `XMLHttpRequest` constructor.
	*
	* Supported options for the `opts` object are:
	*
	*  - `agent`: An http.Agent instance; http.globalAgent may be used; if 'undefined', agent usage is disabled
	*
	* @param {Object} opts optional "options" object
	*/
	function XMLHttpRequest$2(opts) {
		"use strict";
		opts = opts || {};
		/**
		* Private variables
		*/
		var self = this;
		var http = __require("http");
		var https = __require("https");
		var request;
		var response;
		var settings = {};
		var disableHeaderCheck = false;
		var defaultHeaders = {
			"User-Agent": "node-XMLHttpRequest",
			"Accept": "*/*"
		};
		var headers = Object.assign({}, defaultHeaders);
		var forbiddenRequestHeaders = [
			"accept-charset",
			"accept-encoding",
			"access-control-request-headers",
			"access-control-request-method",
			"connection",
			"content-length",
			"content-transfer-encoding",
			"cookie",
			"cookie2",
			"date",
			"expect",
			"host",
			"keep-alive",
			"origin",
			"referer",
			"te",
			"trailer",
			"transfer-encoding",
			"upgrade",
			"via"
		];
		var forbiddenRequestMethods = [
			"TRACE",
			"TRACK",
			"CONNECT"
		];
		var sendFlag = false;
		var errorFlag = false;
		var abortedFlag = false;
		var listeners = {};
		/**
		* Constants
		*/
		this.UNSENT = 0;
		this.OPENED = 1;
		this.HEADERS_RECEIVED = 2;
		this.LOADING = 3;
		this.DONE = 4;
		/**
		* Public vars
		*/
		this.readyState = this.UNSENT;
		this.onreadystatechange = null;
		this.responseText = "";
		this.responseXML = "";
		this.response = Buffer.alloc(0);
		this.status = null;
		this.statusText = null;
		/**
		* Private methods
		*/
		/**
		* Check if the specified header is allowed.
		*
		* @param string header Header to validate
		* @return boolean False if not allowed, otherwise true
		*/
		var isAllowedHttpHeader = function(header) {
			return disableHeaderCheck || header && forbiddenRequestHeaders.indexOf(header.toLowerCase()) === -1;
		};
		/**
		* Check if the specified method is allowed.
		*
		* @param string method Request method to validate
		* @return boolean False if not allowed, otherwise true
		*/
		var isAllowedHttpMethod = function(method) {
			return method && forbiddenRequestMethods.indexOf(method) === -1;
		};
		/**
		* Public methods
		*/
		/**
		* Open the connection. Currently supports local server requests.
		*
		* @param string method Connection method (eg GET, POST)
		* @param string url URL for the connection.
		* @param boolean async Asynchronous connection. Default is true.
		* @param string user Username for basic authentication (optional)
		* @param string password Password for basic authentication (optional)
		*/
		this.open = function(method, url, async, user, password) {
			this.abort();
			errorFlag = false;
			abortedFlag = false;
			if (!isAllowedHttpMethod(method)) throw new Error("SecurityError: Request method not allowed");
			settings = {
				"method": method,
				"url": url.toString(),
				"async": typeof async !== "boolean" ? true : async,
				"user": user || null,
				"password": password || null
			};
			setState(this.OPENED);
		};
		/**
		* Disables or enables isAllowedHttpHeader() check the request. Enabled by default.
		* This does not conform to the W3C spec.
		*
		* @param boolean state Enable or disable header checking.
		*/
		this.setDisableHeaderCheck = function(state) {
			disableHeaderCheck = state;
		};
		/**
		* Sets a header for the request.
		*
		* @param string header Header name
		* @param string value Header value
		* @return boolean Header added
		*/
		this.setRequestHeader = function(header, value) {
			if (this.readyState != this.OPENED) throw new Error("INVALID_STATE_ERR: setRequestHeader can only be called when state is OPEN");
			if (!isAllowedHttpHeader(header)) {
				console.warn("Refused to set unsafe header \"" + header + "\"");
				return false;
			}
			if (sendFlag) throw new Error("INVALID_STATE_ERR: send flag is true");
			headers[header] = value;
			return true;
		};
		/**
		* Gets a header from the server response.
		*
		* @param string header Name of header to get.
		* @return string Text of the header or null if it doesn't exist.
		*/
		this.getResponseHeader = function(header) {
			if (typeof header === "string" && this.readyState > this.OPENED && response.headers[header.toLowerCase()] && !errorFlag) return response.headers[header.toLowerCase()];
			return null;
		};
		/**
		* Gets all the response headers.
		*
		* @return string A string with all response headers separated by CR+LF
		*/
		this.getAllResponseHeaders = function() {
			if (this.readyState < this.HEADERS_RECEIVED || errorFlag) return "";
			var result = "";
			for (var i in response.headers) if (i !== "set-cookie" && i !== "set-cookie2") result += i + ": " + response.headers[i] + "\r\n";
			return result.substr(0, result.length - 2);
		};
		/**
		* Gets a request header
		*
		* @param string name Name of header to get
		* @return string Returns the request header or empty string if not set
		*/
		this.getRequestHeader = function(name) {
			if (typeof name === "string" && headers[name]) return headers[name];
			return "";
		};
		/**
		* Sends the request to the server.
		*
		* @param string data Optional data to send as request body.
		*/
		this.send = function(data) {
			if (this.readyState != this.OPENED) throw new Error("INVALID_STATE_ERR: connection must be opened before send() is called");
			if (sendFlag) throw new Error("INVALID_STATE_ERR: send has already been called");
			var ssl = false, local = false;
			var url = Url.parse(settings.url);
			var host;
			switch (url.protocol) {
				case "https:": ssl = true;
				case "http:":
					host = url.hostname;
					break;
				case "file:":
					local = true;
					break;
				case void 0:
				case "":
					host = "localhost";
					break;
				default: throw new Error("Protocol not supported.");
			}
			if (local) {
				if (settings.method !== "GET") throw new Error("XMLHttpRequest: Only GET method is supported");
				if (settings.async) fs.readFile(unescape(url.pathname), function(error, data) {
					if (error) self.handleError(error, error.errno || -1);
					else {
						self.status = 200;
						self.responseText = data.toString("utf8");
						self.response = data;
						setState(self.DONE);
					}
				});
				else try {
					this.response = fs.readFileSync(unescape(url.pathname));
					this.responseText = this.response.toString("utf8");
					this.status = 200;
					setState(self.DONE);
				} catch (e) {
					this.handleError(e, e.errno || -1);
				}
				return;
			}
			var port = url.port || (ssl ? 443 : 80);
			var uri = url.pathname + (url.search ? url.search : "");
			headers["Host"] = host;
			if (!(ssl && port === 443 || port === 80)) headers["Host"] += ":" + url.port;
			if (settings.user) {
				if (typeof settings.password == "undefined") settings.password = "";
				var authBuf = new Buffer(settings.user + ":" + settings.password);
				headers["Authorization"] = "Basic " + authBuf.toString("base64");
			}
			if (settings.method === "GET" || settings.method === "HEAD") data = null;
			else if (data) {
				headers["Content-Length"] = Buffer.isBuffer(data) ? data.length : Buffer.byteLength(data);
				if (!Object.keys(headers).some(function(h) {
					return h.toLowerCase() === "content-type";
				})) headers["Content-Type"] = "text/plain;charset=UTF-8";
			} else if (settings.method === "POST") headers["Content-Length"] = 0;
			var agent = opts.agent || false;
			var options = {
				host,
				port,
				path: uri,
				method: settings.method,
				headers,
				agent
			};
			if (ssl) {
				options.pfx = opts.pfx;
				options.key = opts.key;
				options.passphrase = opts.passphrase;
				options.cert = opts.cert;
				options.ca = opts.ca;
				options.ciphers = opts.ciphers;
				options.rejectUnauthorized = opts.rejectUnauthorized === false ? false : true;
			}
			errorFlag = false;
			if (settings.async) {
				var doRequest = ssl ? https.request : http.request;
				sendFlag = true;
				self.dispatchEvent("readystatechange");
				var responseHandler = function(resp) {
					response = resp;
					if (response.statusCode === 302 || response.statusCode === 303 || response.statusCode === 307) {
						settings.url = response.headers.location;
						var url = Url.parse(settings.url);
						host = url.hostname;
						var newOptions = {
							hostname: url.hostname,
							port: url.port,
							path: url.path,
							method: response.statusCode === 303 ? "GET" : settings.method,
							headers
						};
						if (ssl) {
							newOptions.pfx = opts.pfx;
							newOptions.key = opts.key;
							newOptions.passphrase = opts.passphrase;
							newOptions.cert = opts.cert;
							newOptions.ca = opts.ca;
							newOptions.ciphers = opts.ciphers;
							newOptions.rejectUnauthorized = opts.rejectUnauthorized === false ? false : true;
						}
						request = doRequest(newOptions, responseHandler).on("error", errorHandler);
						request.end();
						return;
					}
					setState(self.HEADERS_RECEIVED);
					self.status = response.statusCode;
					response.on("data", function(chunk) {
						if (chunk) {
							var data = Buffer.from(chunk);
							self.response = Buffer.concat([self.response, data]);
						}
						if (sendFlag) setState(self.LOADING);
					});
					response.on("end", function() {
						if (sendFlag) {
							sendFlag = false;
							setState(self.DONE);
							self.responseText = self.response.toString("utf8");
						}
					});
					response.on("error", function(error) {
						self.handleError(error);
					});
				};
				var errorHandler = function(error) {
					if (request.reusedSocket && error.code === "ECONNRESET") return doRequest(options, responseHandler).on("error", errorHandler);
					self.handleError(error);
				};
				request = doRequest(options, responseHandler).on("error", errorHandler);
				if (opts.autoUnref) request.on("socket", (socket) => {
					socket.unref();
				});
				if (data) request.write(data);
				request.end();
				self.dispatchEvent("loadstart");
			} else {
				var contentFile = ".node-xmlhttprequest-content-" + process.pid;
				var syncFile = ".node-xmlhttprequest-sync-" + process.pid;
				fs.writeFileSync(syncFile, "", "utf8");
				var execString = "var http = require('http'), https = require('https'), fs = require('fs');var doRequest = http" + (ssl ? "s" : "") + ".request;var options = " + JSON.stringify(options) + ";var responseText = '';var responseData = Buffer.alloc(0);var req = doRequest(options, function(response) {response.on('data', function(chunk) {  var data = Buffer.from(chunk);  responseText += data.toString('utf8');  responseData = Buffer.concat([responseData, data]);});response.on('end', function() {fs.writeFileSync('" + contentFile + "', JSON.stringify({err: null, data: {statusCode: response.statusCode, headers: response.headers, text: responseText, data: responseData.toString('base64')}}), 'utf8');fs.unlinkSync('" + syncFile + "');});response.on('error', function(error) {fs.writeFileSync('" + contentFile + "', 'NODE-XMLHTTPREQUEST-ERROR:' + JSON.stringify(error), 'utf8');fs.unlinkSync('" + syncFile + "');});}).on('error', function(error) {fs.writeFileSync('" + contentFile + "', 'NODE-XMLHTTPREQUEST-ERROR:' + JSON.stringify(error), 'utf8');fs.unlinkSync('" + syncFile + "');});" + (data ? "req.write('" + JSON.stringify(data).slice(1, -1).replace(/'/g, "\\'") + "');" : "") + "req.end();";
				var syncProc = spawn(process.argv[0], ["-e", execString]);
				while (fs.existsSync(syncFile));
				self.responseText = fs.readFileSync(contentFile, "utf8");
				syncProc.stdin.end();
				fs.unlinkSync(contentFile);
				if (self.responseText.match(/^NODE-XMLHTTPREQUEST-ERROR:/)) {
					var errorObj = JSON.parse(self.responseText.replace(/^NODE-XMLHTTPREQUEST-ERROR:/, ""));
					self.handleError(errorObj, 503);
				} else {
					self.status = self.responseText.replace(/^NODE-XMLHTTPREQUEST-STATUS:([0-9]*),.*/, "$1");
					var resp = JSON.parse(self.responseText.replace(/^NODE-XMLHTTPREQUEST-STATUS:[0-9]*,(.*)/, "$1"));
					response = {
						statusCode: self.status,
						headers: resp.data.headers
					};
					self.responseText = resp.data.text;
					self.response = Buffer.from(resp.data.data, "base64");
					setState(self.DONE, true);
				}
			}
		};
		/**
		* Called when an error is encountered to deal with it.
		* @param  status  {number}    HTTP status code to use rather than the default (0) for XHR errors.
		*/
		this.handleError = function(error, status) {
			this.status = status || 0;
			this.statusText = error;
			this.responseText = error.stack;
			errorFlag = true;
			setState(this.DONE);
		};
		/**
		* Aborts a request.
		*/
		this.abort = function() {
			if (request) {
				request.abort();
				request = null;
			}
			headers = Object.assign({}, defaultHeaders);
			this.responseText = "";
			this.responseXML = "";
			this.response = Buffer.alloc(0);
			errorFlag = abortedFlag = true;
			if (this.readyState !== this.UNSENT && (this.readyState !== this.OPENED || sendFlag) && this.readyState !== this.DONE) {
				sendFlag = false;
				setState(this.DONE);
			}
			this.readyState = this.UNSENT;
		};
		/**
		* Adds an event listener. Preferred method of binding to events.
		*/
		this.addEventListener = function(event, callback) {
			if (!(event in listeners)) listeners[event] = [];
			listeners[event].push(callback);
		};
		/**
		* Remove an event callback that has already been bound.
		* Only works on the matching funciton, cannot be a copy.
		*/
		this.removeEventListener = function(event, callback) {
			if (event in listeners) listeners[event] = listeners[event].filter(function(ev) {
				return ev !== callback;
			});
		};
		/**
		* Dispatch any events, including both "on" methods and events attached using addEventListener.
		*/
		this.dispatchEvent = function(event) {
			if (typeof self["on" + event] === "function") if (this.readyState === this.DONE && settings.async) setTimeout(function() {
				self["on" + event]();
			}, 0);
			else self["on" + event]();
			if (event in listeners) for (let i = 0, len = listeners[event].length; i < len; i++) if (this.readyState === this.DONE) setTimeout(function() {
				listeners[event][i].call(self);
			}, 0);
			else listeners[event][i].call(self);
		};
		/**
		* Changes readyState and calls onreadystatechange.
		*
		* @param int state New state
		*/
		var setState = function(state) {
			if (self.readyState === state || self.readyState === self.UNSENT && abortedFlag) return;
			self.readyState = state;
			if (settings.async || self.readyState < self.OPENED || self.readyState === self.DONE) self.dispatchEvent("readystatechange");
			if (self.readyState === self.DONE) {
				let fire;
				if (abortedFlag) fire = "abort";
				else if (errorFlag) fire = "error";
				else fire = "load";
				self.dispatchEvent(fire);
				self.dispatchEvent("loadend");
			}
		};
	}
})))());
var PACKET_TYPES = Object.create(null);
PACKET_TYPES["open"] = "0";
PACKET_TYPES["close"] = "1";
PACKET_TYPES["ping"] = "2";
PACKET_TYPES["pong"] = "3";
PACKET_TYPES["message"] = "4";
PACKET_TYPES["upgrade"] = "5";
PACKET_TYPES["noop"] = "6";
var PACKET_TYPES_REVERSE = Object.create(null);
Object.keys(PACKET_TYPES).forEach((key) => {
	PACKET_TYPES_REVERSE[PACKET_TYPES[key]] = key;
});
var ERROR_PACKET = {
	type: "error",
	data: "parser error"
};
//#endregion
//#region node_modules/engine.io-parser/build/esm/encodePacket.js
var encodePacket = ({ type, data }, supportsBinary, callback) => {
	if (data instanceof ArrayBuffer || ArrayBuffer.isView(data)) return callback(supportsBinary ? data : "b" + toBuffer(data, true).toString("base64"));
	return callback(PACKET_TYPES[type] + (data || ""));
};
var toBuffer = (data, forceBufferConversion) => {
	if (Buffer.isBuffer(data) || data instanceof Uint8Array && !forceBufferConversion) return data;
	else if (data instanceof ArrayBuffer) return Buffer.from(data);
	else return Buffer.from(data.buffer, data.byteOffset, data.byteLength);
};
var TEXT_ENCODER;
function encodePacketToBinary(packet, callback) {
	if (packet.data instanceof ArrayBuffer || ArrayBuffer.isView(packet.data)) return callback(toBuffer(packet.data, false));
	encodePacket(packet, true, (encoded) => {
		if (!TEXT_ENCODER) TEXT_ENCODER = new TextEncoder();
		callback(TEXT_ENCODER.encode(encoded));
	});
}
//#endregion
//#region node_modules/engine.io-parser/build/esm/decodePacket.js
var decodePacket = (encodedPacket, binaryType) => {
	if (typeof encodedPacket !== "string") return {
		type: "message",
		data: mapBinary(encodedPacket, binaryType)
	};
	const type = encodedPacket.charAt(0);
	if (type === "b") return {
		type: "message",
		data: mapBinary(Buffer.from(encodedPacket.substring(1), "base64"), binaryType)
	};
	if (!PACKET_TYPES_REVERSE[type]) return ERROR_PACKET;
	return encodedPacket.length > 1 ? {
		type: PACKET_TYPES_REVERSE[type],
		data: encodedPacket.substring(1)
	} : { type: PACKET_TYPES_REVERSE[type] };
};
var mapBinary = (data, binaryType) => {
	switch (binaryType) {
		case "arraybuffer": if (data instanceof ArrayBuffer) return data;
		else if (Buffer.isBuffer(data)) return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
		else return data.buffer;
		default: if (Buffer.isBuffer(data)) return data;
		else return Buffer.from(data);
	}
};
//#endregion
//#region node_modules/engine.io-parser/build/esm/index.js
var SEPARATOR = String.fromCharCode(30);
var encodePayload = (packets, callback) => {
	const length = packets.length;
	const encodedPackets = new Array(length);
	let count = 0;
	packets.forEach((packet, i) => {
		encodePacket(packet, false, (encodedPacket) => {
			encodedPackets[i] = encodedPacket;
			if (++count === length) callback(encodedPackets.join(SEPARATOR));
		});
	});
};
var decodePayload = (encodedPayload, binaryType) => {
	const encodedPackets = encodedPayload.split(SEPARATOR);
	const packets = [];
	for (let i = 0; i < encodedPackets.length; i++) {
		const decodedPacket = decodePacket(encodedPackets[i], binaryType);
		packets.push(decodedPacket);
		if (decodedPacket.type === "error") break;
	}
	return packets;
};
function createPacketEncoderStream() {
	return new TransformStream({ transform(packet, controller) {
		encodePacketToBinary(packet, (encodedPacket) => {
			const payloadLength = encodedPacket.length;
			let header;
			if (payloadLength < 126) {
				header = /* @__PURE__ */ new Uint8Array(1);
				new DataView(header.buffer).setUint8(0, payloadLength);
			} else if (payloadLength < 65536) {
				header = /* @__PURE__ */ new Uint8Array(3);
				const view = new DataView(header.buffer);
				view.setUint8(0, 126);
				view.setUint16(1, payloadLength);
			} else {
				header = /* @__PURE__ */ new Uint8Array(9);
				const view = new DataView(header.buffer);
				view.setUint8(0, 127);
				view.setBigUint64(1, BigInt(payloadLength));
			}
			if (packet.data && typeof packet.data !== "string") header[0] |= 128;
			controller.enqueue(header);
			controller.enqueue(encodedPacket);
		});
	} });
}
var TEXT_DECODER;
function totalLength(chunks) {
	return chunks.reduce((acc, chunk) => acc + chunk.length, 0);
}
function concatChunks(chunks, size) {
	if (chunks[0].length === size) return chunks.shift();
	const buffer = new Uint8Array(size);
	let j = 0;
	for (let i = 0; i < size; i++) {
		buffer[i] = chunks[0][j++];
		if (j === chunks[0].length) {
			chunks.shift();
			j = 0;
		}
	}
	if (chunks.length && j < chunks[0].length) chunks[0] = chunks[0].slice(j);
	return buffer;
}
function createPacketDecoderStream(maxPayload, binaryType) {
	if (!TEXT_DECODER) TEXT_DECODER = new TextDecoder();
	const chunks = [];
	let state = 0;
	let expectedLength = -1;
	let isBinary = false;
	return new TransformStream({ transform(chunk, controller) {
		chunks.push(chunk);
		while (true) {
			if (state === 0) {
				if (totalLength(chunks) < 1) break;
				const header = concatChunks(chunks, 1);
				isBinary = (header[0] & 128) === 128;
				expectedLength = header[0] & 127;
				if (expectedLength < 126) state = 3;
				else if (expectedLength === 126) state = 1;
				else state = 2;
			} else if (state === 1) {
				if (totalLength(chunks) < 2) break;
				const headerArray = concatChunks(chunks, 2);
				expectedLength = new DataView(headerArray.buffer, headerArray.byteOffset, headerArray.length).getUint16(0);
				state = 3;
			} else if (state === 2) {
				if (totalLength(chunks) < 8) break;
				const headerArray = concatChunks(chunks, 8);
				const view = new DataView(headerArray.buffer, headerArray.byteOffset, headerArray.length);
				const n = view.getUint32(0);
				if (n > Math.pow(2, 21) - 1) {
					controller.enqueue(ERROR_PACKET);
					break;
				}
				expectedLength = n * Math.pow(2, 32) + view.getUint32(4);
				state = 3;
			} else {
				if (totalLength(chunks) < expectedLength) break;
				const data = concatChunks(chunks, expectedLength);
				controller.enqueue(decodePacket(isBinary ? data : TEXT_DECODER.decode(data), binaryType));
				state = 0;
			}
			if (expectedLength === 0 || expectedLength > maxPayload) {
				controller.enqueue(ERROR_PACKET);
				break;
			}
		}
	} });
}
//#endregion
//#region node_modules/engine.io-client/build/esm-debug/globals.node.js
var nextTick = process.nextTick;
var globalThisShim = global;
var defaultBinaryType = "nodebuffer";
function createCookieJar() {
	return new CookieJar();
}
/**
* @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie
*/
function parse$1(setCookieString) {
	const parts = setCookieString.split("; ");
	const i = parts[0].indexOf("=");
	if (i === -1) return;
	const name = parts[0].substring(0, i).trim();
	if (!name.length) return;
	let value = parts[0].substring(i + 1).trim();
	if (value.charCodeAt(0) === 34) value = value.slice(1, -1);
	const cookie = {
		name,
		value
	};
	for (let j = 1; j < parts.length; j++) {
		const subParts = parts[j].split("=");
		if (subParts.length !== 2) continue;
		const key = subParts[0].trim();
		const value = subParts[1].trim();
		switch (key) {
			case "Expires":
				cookie.expires = new Date(value);
				break;
			case "Max-Age":
				const expiration = /* @__PURE__ */ new Date();
				expiration.setUTCSeconds(expiration.getUTCSeconds() + parseInt(value, 10));
				cookie.expires = expiration;
		}
	}
	return cookie;
}
var CookieJar = class {
	constructor() {
		this._cookies = /* @__PURE__ */ new Map();
	}
	parseCookies(values) {
		if (!values) return;
		values.forEach((value) => {
			const parsed = parse$1(value);
			if (parsed) this._cookies.set(parsed.name, parsed);
		});
	}
	get cookies() {
		const now = Date.now();
		this._cookies.forEach((cookie, name) => {
			var _a;
			if (((_a = cookie.expires) === null || _a === void 0 ? void 0 : _a.getTime()) < now) this._cookies.delete(name);
		});
		return this._cookies.entries();
	}
	addCookies(xhr) {
		const cookies = [];
		for (const [name, cookie] of this.cookies) cookies.push(`${name}=${cookie.value}`);
		if (cookies.length) {
			xhr.setDisableHeaderCheck(true);
			xhr.setRequestHeader("cookie", cookies.join("; "));
		}
	}
	appendCookies(headers) {
		for (const [name, cookie] of this.cookies) headers.append("cookie", `${name}=${cookie.value}`);
	}
};
//#endregion
//#region node_modules/engine.io-client/build/esm-debug/util.js
function pick(obj, ...attr) {
	return attr.reduce((acc, k) => {
		if (obj.hasOwnProperty(k)) acc[k] = obj[k];
		return acc;
	}, {});
}
var NATIVE_SET_TIMEOUT = globalThisShim.setTimeout;
var NATIVE_CLEAR_TIMEOUT = globalThisShim.clearTimeout;
function installTimerFunctions(obj, opts) {
	if (opts.useNativeTimers) {
		obj.setTimeoutFn = NATIVE_SET_TIMEOUT.bind(globalThisShim);
		obj.clearTimeoutFn = NATIVE_CLEAR_TIMEOUT.bind(globalThisShim);
	} else {
		obj.setTimeoutFn = globalThisShim.setTimeout.bind(globalThisShim);
		obj.clearTimeoutFn = globalThisShim.clearTimeout.bind(globalThisShim);
	}
}
var BASE64_OVERHEAD = 1.33;
function byteLength(obj) {
	if (typeof obj === "string") return utf8Length(obj);
	return Math.ceil((obj.byteLength || obj.size) * BASE64_OVERHEAD);
}
function utf8Length(str) {
	let c = 0, length = 0;
	for (let i = 0, l = str.length; i < l; i++) {
		c = str.charCodeAt(i);
		if (c < 128) length += 1;
		else if (c < 2048) length += 2;
		else if (c < 55296 || c >= 57344) length += 3;
		else {
			i++;
			length += 4;
		}
	}
	return length;
}
/**
* Generates a random 8-characters string.
*/
function randomString() {
	return Date.now().toString(36).substring(3) + Math.random().toString(36).substring(2, 5);
}
//#endregion
//#region node_modules/engine.io-client/build/esm-debug/contrib/parseqs.js
/**
* Compiles a querystring
* Returns string representation of the object
*
* @param {Object}
* @api private
*/
function encode(obj) {
	let str = "";
	for (let i in obj) if (obj.hasOwnProperty(i)) {
		if (str.length) str += "&";
		str += encodeURIComponent(i) + "=" + encodeURIComponent(obj[i]);
	}
	return str;
}
/**
* Parses a simple querystring into an object
*
* @param {String} qs
* @api private
*/
function decode(qs) {
	let qry = {};
	let pairs = qs.split("&");
	for (let i = 0, l = pairs.length; i < l; i++) {
		let pair = pairs[i].split("=");
		qry[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
	}
	return qry;
}
//#endregion
//#region node_modules/engine.io-client/build/esm-debug/transport.js
var import_src = /* @__PURE__ */ __toESM(require_src());
var debug$5 = (0, import_src.default)("engine.io-client:transport");
var TransportError = class extends Error {
	constructor(reason, description, context) {
		super(reason);
		this.description = description;
		this.context = context;
		this.type = "TransportError";
	}
};
var Transport = class extends Emitter {
	/**
	* Transport abstract constructor.
	*
	* @param {Object} opts - options
	* @protected
	*/
	constructor(opts) {
		super();
		this.writable = false;
		installTimerFunctions(this, opts);
		this.opts = opts;
		this.query = opts.query;
		this.socket = opts.socket;
		this.supportsBinary = !opts.forceBase64;
	}
	/**
	* Emits an error.
	*
	* @param {String} reason
	* @param description
	* @param context - the error context
	* @return {Transport} for chaining
	* @protected
	*/
	onError(reason, description, context) {
		super.emitReserved("error", new TransportError(reason, description, context));
		return this;
	}
	/**
	* Opens the transport.
	*/
	open() {
		this.readyState = "opening";
		this.doOpen();
		return this;
	}
	/**
	* Closes the transport.
	*/
	close() {
		if (this.readyState === "opening" || this.readyState === "open") {
			this.doClose();
			this.onClose();
		}
		return this;
	}
	/**
	* Sends multiple packets.
	*
	* @param {Array} packets
	*/
	send(packets) {
		if (this.readyState === "open") this.write(packets);
		else debug$5("transport is not open, discarding packets");
	}
	/**
	* Called upon open
	*
	* @protected
	*/
	onOpen() {
		this.readyState = "open";
		this.writable = true;
		super.emitReserved("open");
	}
	/**
	* Called with data.
	*
	* @param {String} data
	* @protected
	*/
	onData(data) {
		const packet = decodePacket(data, this.socket.binaryType);
		this.onPacket(packet);
	}
	/**
	* Called with a decoded packet.
	*
	* @protected
	*/
	onPacket(packet) {
		super.emitReserved("packet", packet);
	}
	/**
	* Called upon close.
	*
	* @protected
	*/
	onClose(details) {
		this.readyState = "closed";
		super.emitReserved("close", details);
	}
	/**
	* Pauses the transport, in order not to lose packets during an upgrade.
	*
	* @param onPause
	*/
	pause(onPause) {}
	createUri(schema, query = {}) {
		return schema + "://" + this._hostname() + this._port() + this.opts.path + this._query(query);
	}
	_hostname() {
		const hostname = this.opts.hostname;
		return hostname.indexOf(":") === -1 ? hostname : "[" + hostname + "]";
	}
	_port() {
		if (this.opts.port && (this.opts.secure && Number(this.opts.port) !== 443 || !this.opts.secure && Number(this.opts.port) !== 80)) return ":" + this.opts.port;
		else return "";
	}
	_query(query) {
		const encodedQuery = encode(query);
		return encodedQuery.length ? "?" + encodedQuery : "";
	}
};
//#endregion
//#region node_modules/engine.io-client/build/esm-debug/transports/polling.js
var debug$4 = (0, import_src.default)("engine.io-client:polling");
var Polling = class extends Transport {
	constructor() {
		super(...arguments);
		this._polling = false;
	}
	get name() {
		return "polling";
	}
	/**
	* Opens the socket (triggers polling). We write a PING message to determine
	* when the transport is open.
	*
	* @protected
	*/
	doOpen() {
		this._poll();
	}
	/**
	* Pauses polling.
	*
	* @param {Function} onPause - callback upon buffers are flushed and transport is paused
	* @package
	*/
	pause(onPause) {
		this.readyState = "pausing";
		const pause = () => {
			debug$4("paused");
			this.readyState = "paused";
			onPause();
		};
		if (this._polling || !this.writable) {
			let total = 0;
			if (this._polling) {
				debug$4("we are currently polling - waiting to pause");
				total++;
				this.once("pollComplete", function() {
					debug$4("pre-pause polling complete");
					--total || pause();
				});
			}
			if (!this.writable) {
				debug$4("we are currently writing - waiting to pause");
				total++;
				this.once("drain", function() {
					debug$4("pre-pause writing complete");
					--total || pause();
				});
			}
		} else pause();
	}
	/**
	* Starts polling cycle.
	*
	* @private
	*/
	_poll() {
		debug$4("polling");
		this._polling = true;
		this.doPoll();
		this.emitReserved("poll");
	}
	/**
	* Overloads onData to detect payloads.
	*
	* @protected
	*/
	onData(data) {
		debug$4("polling got data %s", data);
		const callback = (packet) => {
			if ("opening" === this.readyState && packet.type === "open") this.onOpen();
			if ("close" === packet.type) {
				this.onClose({ description: "transport closed by the server" });
				return false;
			}
			this.onPacket(packet);
		};
		decodePayload(data, this.socket.binaryType).forEach(callback);
		if ("closed" !== this.readyState) {
			this._polling = false;
			this.emitReserved("pollComplete");
			if ("open" === this.readyState) this._poll();
			else debug$4("ignoring poll - transport state \"%s\"", this.readyState);
		}
	}
	/**
	* For polling, send a close packet.
	*
	* @protected
	*/
	doClose() {
		const close = () => {
			debug$4("writing close packet");
			this.write([{ type: "close" }]);
		};
		if ("open" === this.readyState) {
			debug$4("transport open - closing");
			close();
		} else {
			debug$4("transport not open - deferring close");
			this.once("open", close);
		}
	}
	/**
	* Writes a packets payload.
	*
	* @param {Array} packets - data packets
	* @protected
	*/
	write(packets) {
		this.writable = false;
		encodePayload(packets, (data) => {
			this.doWrite(data, () => {
				this.writable = true;
				this.emitReserved("drain");
			});
		});
	}
	/**
	* Generates uri for connection.
	*
	* @private
	*/
	uri() {
		const schema = this.opts.secure ? "https" : "http";
		const query = this.query || {};
		if (false !== this.opts.timestampRequests) query[this.opts.timestampParam] = randomString();
		if (!this.supportsBinary && !query.sid) query.b64 = 1;
		return this.createUri(schema, query);
	}
};
//#endregion
//#region node_modules/engine.io-client/build/esm-debug/contrib/has-cors.js
var value = false;
try {
	value = typeof XMLHttpRequest !== "undefined" && "withCredentials" in new XMLHttpRequest();
} catch (err) {}
var hasCORS = value;
//#endregion
//#region node_modules/engine.io-client/build/esm-debug/transports/polling-xhr.js
var debug$3 = (0, import_src.default)("engine.io-client:polling");
function empty() {}
var BaseXHR = class extends Polling {
	/**
	* XHR Polling constructor.
	*
	* @param {Object} opts
	* @package
	*/
	constructor(opts) {
		super(opts);
		if (typeof location !== "undefined") {
			const isSSL = "https:" === location.protocol;
			let port = location.port;
			if (!port) port = isSSL ? "443" : "80";
			this.xd = typeof location !== "undefined" && opts.hostname !== location.hostname || port !== opts.port;
		}
	}
	/**
	* Sends data.
	*
	* @param {String} data - data to send.
	* @param {Function} fn - called upon flush.
	* @private
	*/
	doWrite(data, fn) {
		const req = this.request({
			method: "POST",
			data
		});
		req.on("success", fn);
		req.on("error", (xhrStatus, context) => {
			this.onError("xhr post error", xhrStatus, context);
		});
	}
	/**
	* Starts a poll cycle.
	*
	* @private
	*/
	doPoll() {
		debug$3("xhr poll");
		const req = this.request();
		req.on("data", this.onData.bind(this));
		req.on("error", (xhrStatus, context) => {
			this.onError("xhr poll error", xhrStatus, context);
		});
		this.pollXhr = req;
	}
};
var Request = class Request extends Emitter {
	/**
	* Request constructor
	*
	* @param {Object} options
	* @package
	*/
	constructor(createRequest, uri, opts) {
		super();
		this.createRequest = createRequest;
		installTimerFunctions(this, opts);
		this._opts = opts;
		this._method = opts.method || "GET";
		this._uri = uri;
		this._data = void 0 !== opts.data ? opts.data : null;
		this._create();
	}
	/**
	* Creates the XHR object and sends the request.
	*
	* @private
	*/
	_create() {
		var _a;
		const opts = pick(this._opts, "agent", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "autoUnref");
		opts.xdomain = !!this._opts.xd;
		const xhr = this._xhr = this.createRequest(opts);
		try {
			debug$3("xhr open %s: %s", this._method, this._uri);
			xhr.open(this._method, this._uri, true);
			try {
				if (this._opts.extraHeaders) {
					xhr.setDisableHeaderCheck && xhr.setDisableHeaderCheck(true);
					for (let i in this._opts.extraHeaders) if (this._opts.extraHeaders.hasOwnProperty(i)) xhr.setRequestHeader(i, this._opts.extraHeaders[i]);
				}
			} catch (e) {}
			if ("POST" === this._method) try {
				xhr.setRequestHeader("Content-type", "text/plain;charset=UTF-8");
			} catch (e) {}
			try {
				xhr.setRequestHeader("Accept", "*/*");
			} catch (e) {}
			(_a = this._opts.cookieJar) === null || _a === void 0 || _a.addCookies(xhr);
			if ("withCredentials" in xhr) xhr.withCredentials = this._opts.withCredentials;
			if (this._opts.requestTimeout) xhr.timeout = this._opts.requestTimeout;
			xhr.onreadystatechange = () => {
				var _a;
				if (xhr.readyState === 3) (_a = this._opts.cookieJar) === null || _a === void 0 || _a.parseCookies(xhr.getResponseHeader("set-cookie"));
				if (4 !== xhr.readyState) return;
				if (200 === xhr.status || 1223 === xhr.status) this._onLoad();
				else this.setTimeoutFn(() => {
					this._onError(typeof xhr.status === "number" ? xhr.status : 0);
				}, 0);
			};
			debug$3("xhr data %s", this._data);
			xhr.send(this._data);
		} catch (e) {
			this.setTimeoutFn(() => {
				this._onError(e);
			}, 0);
			return;
		}
		if (typeof document !== "undefined") {
			this._index = Request.requestsCount++;
			Request.requests[this._index] = this;
		}
	}
	/**
	* Called upon error.
	*
	* @private
	*/
	_onError(err) {
		this.emitReserved("error", err, this._xhr);
		this._cleanup(true);
	}
	/**
	* Cleans up house.
	*
	* @private
	*/
	_cleanup(fromError) {
		if ("undefined" === typeof this._xhr || null === this._xhr) return;
		this._xhr.onreadystatechange = empty;
		if (fromError) try {
			this._xhr.abort();
		} catch (e) {}
		if (typeof document !== "undefined") delete Request.requests[this._index];
		this._xhr = null;
	}
	/**
	* Called upon load.
	*
	* @private
	*/
	_onLoad() {
		const data = this._xhr.responseText;
		if (data !== null) {
			this.emitReserved("data", data);
			this.emitReserved("success");
			this._cleanup();
		}
	}
	/**
	* Aborts the request.
	*
	* @package
	*/
	abort() {
		this._cleanup();
	}
};
Request.requestsCount = 0;
Request.requests = {};
/**
* Aborts pending requests when unloading the window. This is needed to prevent
* memory leaks (e.g. when using IE) and to ensure that no spurious error is
* emitted.
*/
if (typeof document !== "undefined") {
	if (typeof attachEvent === "function") attachEvent("onunload", unloadHandler);
	else if (typeof addEventListener === "function") {
		const terminationEvent = "onpagehide" in globalThisShim ? "pagehide" : "unload";
		addEventListener(terminationEvent, unloadHandler, false);
	}
}
function unloadHandler() {
	for (let i in Request.requests) if (Request.requests.hasOwnProperty(i)) Request.requests[i].abort();
}
(function() {
	const xhr = newRequest({ xdomain: false });
	return xhr && xhr.responseType !== null;
})();
function newRequest(opts) {
	const xdomain = opts.xdomain;
	try {
		if ("undefined" !== typeof XMLHttpRequest && (!xdomain || hasCORS)) return new XMLHttpRequest();
	} catch (e) {}
	if (!xdomain) try {
		return new globalThisShim[["Active"].concat("Object").join("X")]("Microsoft.XMLHTTP");
	} catch (e) {}
}
//#endregion
//#region node_modules/engine.io-client/build/esm-debug/transports/polling-xhr.node.js
var XMLHttpRequest$1 = import_XMLHttpRequest.default || import_XMLHttpRequest;
/**
* HTTP long-polling based on the `XMLHttpRequest` object provided by the `xmlhttprequest-ssl` package.
*
* Usage: Node.js, Deno (compat), Bun (compat)
*
* @see https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
*/
var XHR = class extends BaseXHR {
	request(opts = {}) {
		var _a;
		Object.assign(opts, {
			xd: this.xd,
			cookieJar: (_a = this.socket) === null || _a === void 0 ? void 0 : _a._cookieJar
		}, this.opts);
		return new Request((opts) => new XMLHttpRequest$1(opts), this.uri(), opts);
	}
};
//#endregion
//#region node_modules/ws/lib/constants.js
var require_constants = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var BINARY_TYPES = [
		"nodebuffer",
		"arraybuffer",
		"fragments"
	];
	var hasBlob = typeof Blob !== "undefined";
	if (hasBlob) BINARY_TYPES.push("blob");
	module.exports = {
		BINARY_TYPES,
		CLOSE_TIMEOUT: 3e4,
		EMPTY_BUFFER: Buffer.alloc(0),
		GUID: "258EAFA5-E914-47DA-95CA-C5AB0DC85B11",
		hasBlob,
		kForOnEventAttribute: Symbol("kIsForOnEventAttribute"),
		kListener: Symbol("kListener"),
		kStatusCode: Symbol("status-code"),
		kWebSocket: Symbol("websocket"),
		NOOP: () => {}
	};
}));
//#endregion
//#region __vite-optional-peer-dep:bufferutil:ws
var __vite_optional_peer_dep_bufferutil_ws_exports = /* @__PURE__ */ __exportAll({ default: () => __vite_optional_peer_dep_bufferutil_ws_default });
var __vite_optional_peer_dep_bufferutil_ws_default;
var init___vite_optional_peer_dep_bufferutil_ws = __esmMin((() => {
	__vite_optional_peer_dep_bufferutil_ws_default = {};
	throw new Error(`Could not resolve "bufferutil" imported by "ws". Is it installed?`);
}));
//#endregion
//#region node_modules/ws/lib/buffer-util.js
var require_buffer_util = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { EMPTY_BUFFER } = require_constants();
	var FastBuffer = Buffer[Symbol.species];
	/**
	* Merges an array of buffers into a new buffer.
	*
	* @param {Buffer[]} list The array of buffers to concat
	* @param {Number} totalLength The total length of buffers in the list
	* @return {Buffer} The resulting buffer
	* @public
	*/
	function concat(list, totalLength) {
		if (list.length === 0) return EMPTY_BUFFER;
		if (list.length === 1) return list[0];
		const target = Buffer.allocUnsafe(totalLength);
		let offset = 0;
		for (let i = 0; i < list.length; i++) {
			const buf = list[i];
			target.set(buf, offset);
			offset += buf.length;
		}
		if (offset < totalLength) return new FastBuffer(target.buffer, target.byteOffset, offset);
		return target;
	}
	/**
	* Masks a buffer using the given mask.
	*
	* @param {Buffer} source The buffer to mask
	* @param {Buffer} mask The mask to use
	* @param {Buffer} output The buffer where to store the result
	* @param {Number} offset The offset at which to start writing
	* @param {Number} length The number of bytes to mask.
	* @public
	*/
	function _mask(source, mask, output, offset, length) {
		for (let i = 0; i < length; i++) output[offset + i] = source[i] ^ mask[i & 3];
	}
	/**
	* Unmasks a buffer using the given mask.
	*
	* @param {Buffer} buffer The buffer to unmask
	* @param {Buffer} mask The mask to use
	* @public
	*/
	function _unmask(buffer, mask) {
		for (let i = 0; i < buffer.length; i++) buffer[i] ^= mask[i & 3];
	}
	/**
	* Converts a buffer to an `ArrayBuffer`.
	*
	* @param {Buffer} buf The buffer to convert
	* @return {ArrayBuffer} Converted buffer
	* @public
	*/
	function toArrayBuffer(buf) {
		if (buf.length === buf.buffer.byteLength) return buf.buffer;
		return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length);
	}
	/**
	* Converts `data` to a `Buffer`.
	*
	* @param {*} data The data to convert
	* @return {Buffer} The buffer
	* @throws {TypeError}
	* @public
	*/
	function toBuffer(data) {
		toBuffer.readOnly = true;
		if (Buffer.isBuffer(data)) return data;
		let buf;
		if (data instanceof ArrayBuffer) buf = new FastBuffer(data);
		else if (ArrayBuffer.isView(data)) buf = new FastBuffer(data.buffer, data.byteOffset, data.byteLength);
		else {
			buf = Buffer.from(data);
			toBuffer.readOnly = false;
		}
		return buf;
	}
	module.exports = {
		concat,
		mask: _mask,
		toArrayBuffer,
		toBuffer,
		unmask: _unmask
	};
	/* istanbul ignore else  */
	if (!process.env.WS_NO_BUFFER_UTIL) try {
		const bufferUtil = (init___vite_optional_peer_dep_bufferutil_ws(), __toCommonJS(__vite_optional_peer_dep_bufferutil_ws_exports));
		module.exports.mask = function(source, mask, output, offset, length) {
			if (length < 48) _mask(source, mask, output, offset, length);
			else bufferUtil.mask(source, mask, output, offset, length);
		};
		module.exports.unmask = function(buffer, mask) {
			if (buffer.length < 32) _unmask(buffer, mask);
			else bufferUtil.unmask(buffer, mask);
		};
	} catch (e) {}
}));
//#endregion
//#region node_modules/ws/lib/limiter.js
var require_limiter = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var kDone = Symbol("kDone");
	var kRun = Symbol("kRun");
	/**
	* A very simple job queue with adjustable concurrency. Adapted from
	* https://github.com/STRML/async-limiter
	*/
	var Limiter = class {
		/**
		* Creates a new `Limiter`.
		*
		* @param {Number} [concurrency=Infinity] The maximum number of jobs allowed
		*     to run concurrently
		*/
		constructor(concurrency) {
			this[kDone] = () => {
				this.pending--;
				this[kRun]();
			};
			this.concurrency = concurrency || Infinity;
			this.jobs = [];
			this.pending = 0;
		}
		/**
		* Adds a job to the queue.
		*
		* @param {Function} job The job to run
		* @public
		*/
		add(job) {
			this.jobs.push(job);
			this[kRun]();
		}
		/**
		* Removes a job from the queue and runs it if possible.
		*
		* @private
		*/
		[kRun]() {
			if (this.pending === this.concurrency) return;
			if (this.jobs.length) {
				const job = this.jobs.shift();
				this.pending++;
				job(this[kDone]);
			}
		}
	};
	module.exports = Limiter;
}));
//#endregion
//#region node_modules/ws/lib/permessage-deflate.js
var require_permessage_deflate = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var zlib = __require("zlib");
	var bufferUtil = require_buffer_util();
	var Limiter = require_limiter();
	var { kStatusCode } = require_constants();
	var FastBuffer = Buffer[Symbol.species];
	var TRAILER = Buffer.from([
		0,
		0,
		255,
		255
	]);
	var kPerMessageDeflate = Symbol("permessage-deflate");
	var kTotalLength = Symbol("total-length");
	var kCallback = Symbol("callback");
	var kBuffers = Symbol("buffers");
	var kError = Symbol("error");
	var zlibLimiter;
	/**
	* permessage-deflate implementation.
	*/
	var PerMessageDeflate = class {
		/**
		* Creates a PerMessageDeflate instance.
		*
		* @param {Object} [options] Configuration options
		* @param {(Boolean|Number)} [options.clientMaxWindowBits] Advertise support
		*     for, or request, a custom client window size
		* @param {Boolean} [options.clientNoContextTakeover=false] Advertise/
		*     acknowledge disabling of client context takeover
		* @param {Number} [options.concurrencyLimit=10] The number of concurrent
		*     calls to zlib
		* @param {Boolean} [options.isServer=false] Create the instance in either
		*     server or client mode
		* @param {Number} [options.maxPayload=0] The maximum allowed message length
		* @param {(Boolean|Number)} [options.serverMaxWindowBits] Request/confirm the
		*     use of a custom server window size
		* @param {Boolean} [options.serverNoContextTakeover=false] Request/accept
		*     disabling of server context takeover
		* @param {Number} [options.threshold=1024] Size (in bytes) below which
		*     messages should not be compressed if context takeover is disabled
		* @param {Object} [options.zlibDeflateOptions] Options to pass to zlib on
		*     deflate
		* @param {Object} [options.zlibInflateOptions] Options to pass to zlib on
		*     inflate
		*/
		constructor(options) {
			this._options = options || {};
			this._threshold = this._options.threshold !== void 0 ? this._options.threshold : 1024;
			this._maxPayload = this._options.maxPayload | 0;
			this._isServer = !!this._options.isServer;
			this._deflate = null;
			this._inflate = null;
			this.params = null;
			if (!zlibLimiter) zlibLimiter = new Limiter(this._options.concurrencyLimit !== void 0 ? this._options.concurrencyLimit : 10);
		}
		/**
		* @type {String}
		*/
		static get extensionName() {
			return "permessage-deflate";
		}
		/**
		* Create an extension negotiation offer.
		*
		* @return {Object} Extension parameters
		* @public
		*/
		offer() {
			const params = {};
			if (this._options.serverNoContextTakeover) params.server_no_context_takeover = true;
			if (this._options.clientNoContextTakeover) params.client_no_context_takeover = true;
			if (this._options.serverMaxWindowBits) params.server_max_window_bits = this._options.serverMaxWindowBits;
			if (this._options.clientMaxWindowBits) params.client_max_window_bits = this._options.clientMaxWindowBits;
			else if (this._options.clientMaxWindowBits == null) params.client_max_window_bits = true;
			return params;
		}
		/**
		* Accept an extension negotiation offer/response.
		*
		* @param {Array} configurations The extension negotiation offers/reponse
		* @return {Object} Accepted configuration
		* @public
		*/
		accept(configurations) {
			configurations = this.normalizeParams(configurations);
			this.params = this._isServer ? this.acceptAsServer(configurations) : this.acceptAsClient(configurations);
			return this.params;
		}
		/**
		* Releases all resources used by the extension.
		*
		* @public
		*/
		cleanup() {
			if (this._inflate) {
				this._inflate.close();
				this._inflate = null;
			}
			if (this._deflate) {
				const callback = this._deflate[kCallback];
				this._deflate.close();
				this._deflate = null;
				if (callback) callback(/* @__PURE__ */ new Error("The deflate stream was closed while data was being processed"));
			}
		}
		/**
		*  Accept an extension negotiation offer.
		*
		* @param {Array} offers The extension negotiation offers
		* @return {Object} Accepted configuration
		* @private
		*/
		acceptAsServer(offers) {
			const opts = this._options;
			const accepted = offers.find((params) => {
				if (opts.serverNoContextTakeover === false && params.server_no_context_takeover || params.server_max_window_bits && (opts.serverMaxWindowBits === false || typeof opts.serverMaxWindowBits === "number" && opts.serverMaxWindowBits > params.server_max_window_bits) || typeof opts.clientMaxWindowBits === "number" && !params.client_max_window_bits) return false;
				return true;
			});
			if (!accepted) throw new Error("None of the extension offers can be accepted");
			if (opts.serverNoContextTakeover) accepted.server_no_context_takeover = true;
			if (opts.clientNoContextTakeover) accepted.client_no_context_takeover = true;
			if (typeof opts.serverMaxWindowBits === "number") accepted.server_max_window_bits = opts.serverMaxWindowBits;
			if (typeof opts.clientMaxWindowBits === "number") accepted.client_max_window_bits = opts.clientMaxWindowBits;
			else if (accepted.client_max_window_bits === true || opts.clientMaxWindowBits === false) delete accepted.client_max_window_bits;
			return accepted;
		}
		/**
		* Accept the extension negotiation response.
		*
		* @param {Array} response The extension negotiation response
		* @return {Object} Accepted configuration
		* @private
		*/
		acceptAsClient(response) {
			const params = response[0];
			if (this._options.clientNoContextTakeover === false && params.client_no_context_takeover) throw new Error("Unexpected parameter \"client_no_context_takeover\"");
			if (!params.client_max_window_bits) {
				if (typeof this._options.clientMaxWindowBits === "number") params.client_max_window_bits = this._options.clientMaxWindowBits;
			} else if (this._options.clientMaxWindowBits === false || typeof this._options.clientMaxWindowBits === "number" && params.client_max_window_bits > this._options.clientMaxWindowBits) throw new Error("Unexpected or invalid parameter \"client_max_window_bits\"");
			return params;
		}
		/**
		* Normalize parameters.
		*
		* @param {Array} configurations The extension negotiation offers/reponse
		* @return {Array} The offers/response with normalized parameters
		* @private
		*/
		normalizeParams(configurations) {
			configurations.forEach((params) => {
				Object.keys(params).forEach((key) => {
					let value = params[key];
					if (value.length > 1) throw new Error(`Parameter "${key}" must have only a single value`);
					value = value[0];
					if (key === "client_max_window_bits") {
						if (value !== true) {
							const num = +value;
							if (!Number.isInteger(num) || num < 8 || num > 15) throw new TypeError(`Invalid value for parameter "${key}": ${value}`);
							value = num;
						} else if (!this._isServer) throw new TypeError(`Invalid value for parameter "${key}": ${value}`);
					} else if (key === "server_max_window_bits") {
						const num = +value;
						if (!Number.isInteger(num) || num < 8 || num > 15) throw new TypeError(`Invalid value for parameter "${key}": ${value}`);
						value = num;
					} else if (key === "client_no_context_takeover" || key === "server_no_context_takeover") {
						if (value !== true) throw new TypeError(`Invalid value for parameter "${key}": ${value}`);
					} else throw new Error(`Unknown parameter "${key}"`);
					params[key] = value;
				});
			});
			return configurations;
		}
		/**
		* Decompress data. Concurrency limited.
		*
		* @param {Buffer} data Compressed data
		* @param {Boolean} fin Specifies whether or not this is the last fragment
		* @param {Function} callback Callback
		* @public
		*/
		decompress(data, fin, callback) {
			zlibLimiter.add((done) => {
				this._decompress(data, fin, (err, result) => {
					done();
					callback(err, result);
				});
			});
		}
		/**
		* Compress data. Concurrency limited.
		*
		* @param {(Buffer|String)} data Data to compress
		* @param {Boolean} fin Specifies whether or not this is the last fragment
		* @param {Function} callback Callback
		* @public
		*/
		compress(data, fin, callback) {
			zlibLimiter.add((done) => {
				this._compress(data, fin, (err, result) => {
					done();
					callback(err, result);
				});
			});
		}
		/**
		* Decompress data.
		*
		* @param {Buffer} data Compressed data
		* @param {Boolean} fin Specifies whether or not this is the last fragment
		* @param {Function} callback Callback
		* @private
		*/
		_decompress(data, fin, callback) {
			const endpoint = this._isServer ? "client" : "server";
			if (!this._inflate) {
				const key = `${endpoint}_max_window_bits`;
				const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
				this._inflate = zlib.createInflateRaw({
					...this._options.zlibInflateOptions,
					windowBits
				});
				this._inflate[kPerMessageDeflate] = this;
				this._inflate[kTotalLength] = 0;
				this._inflate[kBuffers] = [];
				this._inflate.on("error", inflateOnError);
				this._inflate.on("data", inflateOnData);
			}
			this._inflate[kCallback] = callback;
			this._inflate.write(data);
			if (fin) this._inflate.write(TRAILER);
			this._inflate.flush(() => {
				const err = this._inflate[kError];
				if (err) {
					this._inflate.close();
					this._inflate = null;
					callback(err);
					return;
				}
				const data = bufferUtil.concat(this._inflate[kBuffers], this._inflate[kTotalLength]);
				if (this._inflate._readableState.endEmitted) {
					this._inflate.close();
					this._inflate = null;
				} else {
					this._inflate[kTotalLength] = 0;
					this._inflate[kBuffers] = [];
					if (fin && this.params[`${endpoint}_no_context_takeover`]) this._inflate.reset();
				}
				callback(null, data);
			});
		}
		/**
		* Compress data.
		*
		* @param {(Buffer|String)} data Data to compress
		* @param {Boolean} fin Specifies whether or not this is the last fragment
		* @param {Function} callback Callback
		* @private
		*/
		_compress(data, fin, callback) {
			const endpoint = this._isServer ? "server" : "client";
			if (!this._deflate) {
				const key = `${endpoint}_max_window_bits`;
				const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
				this._deflate = zlib.createDeflateRaw({
					...this._options.zlibDeflateOptions,
					windowBits
				});
				this._deflate[kTotalLength] = 0;
				this._deflate[kBuffers] = [];
				this._deflate.on("data", deflateOnData);
			}
			this._deflate[kCallback] = callback;
			this._deflate.write(data);
			this._deflate.flush(zlib.Z_SYNC_FLUSH, () => {
				if (!this._deflate) return;
				let data = bufferUtil.concat(this._deflate[kBuffers], this._deflate[kTotalLength]);
				if (fin) data = new FastBuffer(data.buffer, data.byteOffset, data.length - 4);
				this._deflate[kCallback] = null;
				this._deflate[kTotalLength] = 0;
				this._deflate[kBuffers] = [];
				if (fin && this.params[`${endpoint}_no_context_takeover`]) this._deflate.reset();
				callback(null, data);
			});
		}
	};
	module.exports = PerMessageDeflate;
	/**
	* The listener of the `zlib.DeflateRaw` stream `'data'` event.
	*
	* @param {Buffer} chunk A chunk of data
	* @private
	*/
	function deflateOnData(chunk) {
		this[kBuffers].push(chunk);
		this[kTotalLength] += chunk.length;
	}
	/**
	* The listener of the `zlib.InflateRaw` stream `'data'` event.
	*
	* @param {Buffer} chunk A chunk of data
	* @private
	*/
	function inflateOnData(chunk) {
		this[kTotalLength] += chunk.length;
		if (this[kPerMessageDeflate]._maxPayload < 1 || this[kTotalLength] <= this[kPerMessageDeflate]._maxPayload) {
			this[kBuffers].push(chunk);
			return;
		}
		this[kError] = /* @__PURE__ */ new RangeError("Max payload size exceeded");
		this[kError].code = "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH";
		this[kError][kStatusCode] = 1009;
		this.removeListener("data", inflateOnData);
		this.reset();
	}
	/**
	* The listener of the `zlib.InflateRaw` stream `'error'` event.
	*
	* @param {Error} err The emitted error
	* @private
	*/
	function inflateOnError(err) {
		this[kPerMessageDeflate]._inflate = null;
		if (this[kError]) {
			this[kCallback](this[kError]);
			return;
		}
		err[kStatusCode] = 1007;
		this[kCallback](err);
	}
}));
//#endregion
//#region __vite-optional-peer-dep:utf-8-validate:ws
var __vite_optional_peer_dep_utf_8_validate_ws_exports = /* @__PURE__ */ __exportAll({ default: () => __vite_optional_peer_dep_utf_8_validate_ws_default });
var __vite_optional_peer_dep_utf_8_validate_ws_default;
var init___vite_optional_peer_dep_utf_8_validate_ws = __esmMin((() => {
	__vite_optional_peer_dep_utf_8_validate_ws_default = {};
	throw new Error(`Could not resolve "utf-8-validate" imported by "ws". Is it installed?`);
}));
//#endregion
//#region node_modules/ws/lib/validation.js
var require_validation = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { isUtf8 } = __require("buffer");
	var { hasBlob } = require_constants();
	var tokenChars = [
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		1,
		0,
		1,
		1,
		1,
		1,
		1,
		0,
		0,
		1,
		1,
		0,
		1,
		1,
		0,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		0,
		0,
		0,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		0,
		1,
		0,
		1,
		0
	];
	/**
	* Checks if a status code is allowed in a close frame.
	*
	* @param {Number} code The status code
	* @return {Boolean} `true` if the status code is valid, else `false`
	* @public
	*/
	function isValidStatusCode(code) {
		return code >= 1e3 && code <= 1014 && code !== 1004 && code !== 1005 && code !== 1006 || code >= 3e3 && code <= 4999;
	}
	/**
	* Checks if a given buffer contains only correct UTF-8.
	* Ported from https://www.cl.cam.ac.uk/%7Emgk25/ucs/utf8_check.c by
	* Markus Kuhn.
	*
	* @param {Buffer} buf The buffer to check
	* @return {Boolean} `true` if `buf` contains only correct UTF-8, else `false`
	* @public
	*/
	function _isValidUTF8(buf) {
		const len = buf.length;
		let i = 0;
		while (i < len) if ((buf[i] & 128) === 0) i++;
		else if ((buf[i] & 224) === 192) {
			if (i + 1 === len || (buf[i + 1] & 192) !== 128 || (buf[i] & 254) === 192) return false;
			i += 2;
		} else if ((buf[i] & 240) === 224) {
			if (i + 2 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || buf[i] === 224 && (buf[i + 1] & 224) === 128 || buf[i] === 237 && (buf[i + 1] & 224) === 160) return false;
			i += 3;
		} else if ((buf[i] & 248) === 240) {
			if (i + 3 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || (buf[i + 3] & 192) !== 128 || buf[i] === 240 && (buf[i + 1] & 240) === 128 || buf[i] === 244 && buf[i + 1] > 143 || buf[i] > 244) return false;
			i += 4;
		} else return false;
		return true;
	}
	/**
	* Determines whether a value is a `Blob`.
	*
	* @param {*} value The value to be tested
	* @return {Boolean} `true` if `value` is a `Blob`, else `false`
	* @private
	*/
	function isBlob(value) {
		return hasBlob && typeof value === "object" && typeof value.arrayBuffer === "function" && typeof value.type === "string" && typeof value.stream === "function" && (value[Symbol.toStringTag] === "Blob" || value[Symbol.toStringTag] === "File");
	}
	module.exports = {
		isBlob,
		isValidStatusCode,
		isValidUTF8: _isValidUTF8,
		tokenChars
	};
	if (isUtf8) module.exports.isValidUTF8 = function(buf) {
		return buf.length < 24 ? _isValidUTF8(buf) : isUtf8(buf);
	};
	else if (!process.env.WS_NO_UTF_8_VALIDATE) try {
		const isValidUTF8 = (init___vite_optional_peer_dep_utf_8_validate_ws(), __toCommonJS(__vite_optional_peer_dep_utf_8_validate_ws_exports));
		module.exports.isValidUTF8 = function(buf) {
			return buf.length < 32 ? _isValidUTF8(buf) : isValidUTF8(buf);
		};
	} catch (e) {}
}));
//#endregion
//#region node_modules/ws/lib/receiver.js
var require_receiver = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { Writable } = __require("stream");
	var PerMessageDeflate = require_permessage_deflate();
	var { BINARY_TYPES, EMPTY_BUFFER, kStatusCode, kWebSocket } = require_constants();
	var { concat, toArrayBuffer, unmask } = require_buffer_util();
	var { isValidStatusCode, isValidUTF8 } = require_validation();
	var FastBuffer = Buffer[Symbol.species];
	var GET_INFO = 0;
	var GET_PAYLOAD_LENGTH_16 = 1;
	var GET_PAYLOAD_LENGTH_64 = 2;
	var GET_MASK = 3;
	var GET_DATA = 4;
	var INFLATING = 5;
	var DEFER_EVENT = 6;
	/**
	* HyBi Receiver implementation.
	*
	* @extends Writable
	*/
	var Receiver = class extends Writable {
		/**
		* Creates a Receiver instance.
		*
		* @param {Object} [options] Options object
		* @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether
		*     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
		*     multiple times in the same tick
		* @param {String} [options.binaryType=nodebuffer] The type for binary data
		* @param {Object} [options.extensions] An object containing the negotiated
		*     extensions
		* @param {Boolean} [options.isServer=false] Specifies whether to operate in
		*     client or server mode
		* @param {Number} [options.maxBufferedChunks=0] The maximum number of
		*     buffered data chunks
		* @param {Number} [options.maxFragments=0] The maximum number of message
		*     fragments
		* @param {Number} [options.maxPayload=0] The maximum allowed message length
		* @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
		*     not to skip UTF-8 validation for text and close messages
		*/
		constructor(options = {}) {
			super();
			this._allowSynchronousEvents = options.allowSynchronousEvents !== void 0 ? options.allowSynchronousEvents : true;
			this._binaryType = options.binaryType || BINARY_TYPES[0];
			this._extensions = options.extensions || {};
			this._isServer = !!options.isServer;
			this._maxBufferedChunks = options.maxBufferedChunks | 0;
			this._maxFragments = options.maxFragments | 0;
			this._maxPayload = options.maxPayload | 0;
			this._skipUTF8Validation = !!options.skipUTF8Validation;
			this[kWebSocket] = void 0;
			this._bufferedBytes = 0;
			this._buffers = [];
			this._compressed = false;
			this._payloadLength = 0;
			this._mask = void 0;
			this._fragmented = 0;
			this._masked = false;
			this._fin = false;
			this._opcode = 0;
			this._totalPayloadLength = 0;
			this._messageLength = 0;
			this._numFragments = 0;
			this._fragments = [];
			this._errored = false;
			this._loop = false;
			this._state = GET_INFO;
		}
		/**
		* Implements `Writable.prototype._write()`.
		*
		* @param {Buffer} chunk The chunk of data to write
		* @param {String} encoding The character encoding of `chunk`
		* @param {Function} cb Callback
		* @private
		*/
		_write(chunk, encoding, cb) {
			if (this._opcode === 8 && this._state == GET_INFO) return cb();
			if (this._maxBufferedChunks > 0 && this._buffers.length >= this._maxBufferedChunks) {
				cb(this.createError(RangeError, "Too many buffered chunks", false, 1008, "WS_ERR_TOO_MANY_BUFFERED_PARTS"));
				return;
			}
			this._bufferedBytes += chunk.length;
			this._buffers.push(chunk);
			this.startLoop(cb);
		}
		/**
		* Consumes `n` bytes from the buffered data.
		*
		* @param {Number} n The number of bytes to consume
		* @return {Buffer} The consumed bytes
		* @private
		*/
		consume(n) {
			this._bufferedBytes -= n;
			if (n === this._buffers[0].length) return this._buffers.shift();
			if (n < this._buffers[0].length) {
				const buf = this._buffers[0];
				this._buffers[0] = new FastBuffer(buf.buffer, buf.byteOffset + n, buf.length - n);
				return new FastBuffer(buf.buffer, buf.byteOffset, n);
			}
			const dst = Buffer.allocUnsafe(n);
			do {
				const buf = this._buffers[0];
				const offset = dst.length - n;
				if (n >= buf.length) dst.set(this._buffers.shift(), offset);
				else {
					dst.set(new Uint8Array(buf.buffer, buf.byteOffset, n), offset);
					this._buffers[0] = new FastBuffer(buf.buffer, buf.byteOffset + n, buf.length - n);
				}
				n -= buf.length;
			} while (n > 0);
			return dst;
		}
		/**
		* Starts the parsing loop.
		*
		* @param {Function} cb Callback
		* @private
		*/
		startLoop(cb) {
			this._loop = true;
			do
				switch (this._state) {
					case GET_INFO:
						this.getInfo(cb);
						break;
					case GET_PAYLOAD_LENGTH_16:
						this.getPayloadLength16(cb);
						break;
					case GET_PAYLOAD_LENGTH_64:
						this.getPayloadLength64(cb);
						break;
					case GET_MASK:
						this.getMask();
						break;
					case GET_DATA:
						this.getData(cb);
						break;
					case INFLATING:
					case DEFER_EVENT:
						this._loop = false;
						return;
				}
			while (this._loop);
			if (!this._errored) cb();
		}
		/**
		* Reads the first two bytes of a frame.
		*
		* @param {Function} cb Callback
		* @private
		*/
		getInfo(cb) {
			if (this._bufferedBytes < 2) {
				this._loop = false;
				return;
			}
			const buf = this.consume(2);
			if ((buf[0] & 48) !== 0) {
				cb(this.createError(RangeError, "RSV2 and RSV3 must be clear", true, 1002, "WS_ERR_UNEXPECTED_RSV_2_3"));
				return;
			}
			const compressed = (buf[0] & 64) === 64;
			if (compressed && !this._extensions[PerMessageDeflate.extensionName]) {
				cb(this.createError(RangeError, "RSV1 must be clear", true, 1002, "WS_ERR_UNEXPECTED_RSV_1"));
				return;
			}
			this._fin = (buf[0] & 128) === 128;
			this._opcode = buf[0] & 15;
			this._payloadLength = buf[1] & 127;
			if (this._opcode === 0) {
				if (compressed) {
					cb(this.createError(RangeError, "RSV1 must be clear", true, 1002, "WS_ERR_UNEXPECTED_RSV_1"));
					return;
				}
				if (!this._fragmented) {
					cb(this.createError(RangeError, "invalid opcode 0", true, 1002, "WS_ERR_INVALID_OPCODE"));
					return;
				}
				this._opcode = this._fragmented;
			} else if (this._opcode === 1 || this._opcode === 2) {
				if (this._fragmented) {
					cb(this.createError(RangeError, `invalid opcode ${this._opcode}`, true, 1002, "WS_ERR_INVALID_OPCODE"));
					return;
				}
				this._compressed = compressed;
			} else if (this._opcode > 7 && this._opcode < 11) {
				if (!this._fin) {
					cb(this.createError(RangeError, "FIN must be set", true, 1002, "WS_ERR_EXPECTED_FIN"));
					return;
				}
				if (compressed) {
					cb(this.createError(RangeError, "RSV1 must be clear", true, 1002, "WS_ERR_UNEXPECTED_RSV_1"));
					return;
				}
				if (this._payloadLength > 125 || this._opcode === 8 && this._payloadLength === 1) {
					cb(this.createError(RangeError, `invalid payload length ${this._payloadLength}`, true, 1002, "WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH"));
					return;
				}
			} else {
				cb(this.createError(RangeError, `invalid opcode ${this._opcode}`, true, 1002, "WS_ERR_INVALID_OPCODE"));
				return;
			}
			if (!this._fin && !this._fragmented) this._fragmented = this._opcode;
			this._masked = (buf[1] & 128) === 128;
			if (this._isServer) {
				if (!this._masked) {
					cb(this.createError(RangeError, "MASK must be set", true, 1002, "WS_ERR_EXPECTED_MASK"));
					return;
				}
			} else if (this._masked) {
				cb(this.createError(RangeError, "MASK must be clear", true, 1002, "WS_ERR_UNEXPECTED_MASK"));
				return;
			}
			if (this._payloadLength === 126) this._state = GET_PAYLOAD_LENGTH_16;
			else if (this._payloadLength === 127) this._state = GET_PAYLOAD_LENGTH_64;
			else this.haveLength(cb);
		}
		/**
		* Gets extended payload length (7+16).
		*
		* @param {Function} cb Callback
		* @private
		*/
		getPayloadLength16(cb) {
			if (this._bufferedBytes < 2) {
				this._loop = false;
				return;
			}
			this._payloadLength = this.consume(2).readUInt16BE(0);
			this.haveLength(cb);
		}
		/**
		* Gets extended payload length (7+64).
		*
		* @param {Function} cb Callback
		* @private
		*/
		getPayloadLength64(cb) {
			if (this._bufferedBytes < 8) {
				this._loop = false;
				return;
			}
			const buf = this.consume(8);
			const num = buf.readUInt32BE(0);
			if (num > Math.pow(2, 21) - 1) {
				cb(this.createError(RangeError, "Unsupported WebSocket frame: payload length > 2^53 - 1", false, 1009, "WS_ERR_UNSUPPORTED_DATA_PAYLOAD_LENGTH"));
				return;
			}
			this._payloadLength = num * Math.pow(2, 32) + buf.readUInt32BE(4);
			this.haveLength(cb);
		}
		/**
		* Payload length has been read.
		*
		* @param {Function} cb Callback
		* @private
		*/
		haveLength(cb) {
			if (this._payloadLength && this._opcode < 8) {
				this._totalPayloadLength += this._payloadLength;
				if (this._totalPayloadLength > this._maxPayload && this._maxPayload > 0) {
					cb(this.createError(RangeError, "Max payload size exceeded", false, 1009, "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH"));
					return;
				}
			}
			if (this._masked) this._state = GET_MASK;
			else this._state = GET_DATA;
		}
		/**
		* Reads mask bytes.
		*
		* @private
		*/
		getMask() {
			if (this._bufferedBytes < 4) {
				this._loop = false;
				return;
			}
			this._mask = this.consume(4);
			this._state = GET_DATA;
		}
		/**
		* Reads data bytes.
		*
		* @param {Function} cb Callback
		* @private
		*/
		getData(cb) {
			let data = EMPTY_BUFFER;
			if (this._payloadLength) {
				if (this._bufferedBytes < this._payloadLength) {
					this._loop = false;
					return;
				}
				data = this.consume(this._payloadLength);
				if (this._masked && (this._mask[0] | this._mask[1] | this._mask[2] | this._mask[3]) !== 0) unmask(data, this._mask);
			}
			if (this._opcode > 7) {
				this.controlMessage(data, cb);
				return;
			}
			if (this._maxFragments > 0 && ++this._numFragments > this._maxFragments) {
				cb(this.createError(RangeError, "Too many message fragments", false, 1008, "WS_ERR_TOO_MANY_BUFFERED_PARTS"));
				return;
			}
			if (this._compressed) {
				this._state = INFLATING;
				this.decompress(data, cb);
				return;
			}
			if (data.length) {
				this._messageLength = this._totalPayloadLength;
				this._fragments.push(data);
			}
			this.dataMessage(cb);
		}
		/**
		* Decompresses data.
		*
		* @param {Buffer} data Compressed data
		* @param {Function} cb Callback
		* @private
		*/
		decompress(data, cb) {
			this._extensions[PerMessageDeflate.extensionName].decompress(data, this._fin, (err, buf) => {
				if (err) return cb(err);
				if (buf.length) {
					this._messageLength += buf.length;
					if (this._messageLength > this._maxPayload && this._maxPayload > 0) {
						cb(this.createError(RangeError, "Max payload size exceeded", false, 1009, "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH"));
						return;
					}
					this._fragments.push(buf);
				}
				this.dataMessage(cb);
				if (this._state === GET_INFO) this.startLoop(cb);
			});
		}
		/**
		* Handles a data message.
		*
		* @param {Function} cb Callback
		* @private
		*/
		dataMessage(cb) {
			if (!this._fin) {
				this._state = GET_INFO;
				return;
			}
			const messageLength = this._messageLength;
			const fragments = this._fragments;
			this._totalPayloadLength = 0;
			this._messageLength = 0;
			this._fragmented = 0;
			this._numFragments = 0;
			this._fragments = [];
			if (this._opcode === 2) {
				let data;
				if (this._binaryType === "nodebuffer") data = concat(fragments, messageLength);
				else if (this._binaryType === "arraybuffer") data = toArrayBuffer(concat(fragments, messageLength));
				else if (this._binaryType === "blob") data = new Blob(fragments);
				else data = fragments;
				if (this._allowSynchronousEvents) {
					this.emit("message", data, true);
					this._state = GET_INFO;
				} else {
					this._state = DEFER_EVENT;
					setImmediate(() => {
						this.emit("message", data, true);
						this._state = GET_INFO;
						this.startLoop(cb);
					});
				}
			} else {
				const buf = concat(fragments, messageLength);
				if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
					cb(this.createError(Error, "invalid UTF-8 sequence", true, 1007, "WS_ERR_INVALID_UTF8"));
					return;
				}
				if (this._state === INFLATING || this._allowSynchronousEvents) {
					this.emit("message", buf, false);
					this._state = GET_INFO;
				} else {
					this._state = DEFER_EVENT;
					setImmediate(() => {
						this.emit("message", buf, false);
						this._state = GET_INFO;
						this.startLoop(cb);
					});
				}
			}
		}
		/**
		* Handles a control message.
		*
		* @param {Buffer} data Data to handle
		* @return {(Error|RangeError|undefined)} A possible error
		* @private
		*/
		controlMessage(data, cb) {
			if (this._opcode === 8) {
				if (data.length === 0) {
					this._loop = false;
					this.emit("conclude", 1005, EMPTY_BUFFER);
					this.end();
				} else {
					const code = data.readUInt16BE(0);
					if (!isValidStatusCode(code)) {
						cb(this.createError(RangeError, `invalid status code ${code}`, true, 1002, "WS_ERR_INVALID_CLOSE_CODE"));
						return;
					}
					const buf = new FastBuffer(data.buffer, data.byteOffset + 2, data.length - 2);
					if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
						cb(this.createError(Error, "invalid UTF-8 sequence", true, 1007, "WS_ERR_INVALID_UTF8"));
						return;
					}
					this._loop = false;
					this.emit("conclude", code, buf);
					this.end();
				}
				this._state = GET_INFO;
				return;
			}
			if (this._allowSynchronousEvents) {
				this.emit(this._opcode === 9 ? "ping" : "pong", data);
				this._state = GET_INFO;
			} else {
				this._state = DEFER_EVENT;
				setImmediate(() => {
					this.emit(this._opcode === 9 ? "ping" : "pong", data);
					this._state = GET_INFO;
					this.startLoop(cb);
				});
			}
		}
		/**
		* Builds an error object.
		*
		* @param {function(new:Error|RangeError)} ErrorCtor The error constructor
		* @param {String} message The error message
		* @param {Boolean} prefix Specifies whether or not to add a default prefix to
		*     `message`
		* @param {Number} statusCode The status code
		* @param {String} errorCode The exposed error code
		* @return {(Error|RangeError)} The error
		* @private
		*/
		createError(ErrorCtor, message, prefix, statusCode, errorCode) {
			this._loop = false;
			this._errored = true;
			const err = new ErrorCtor(prefix ? `Invalid WebSocket frame: ${message}` : message);
			Error.captureStackTrace(err, this.createError);
			err.code = errorCode;
			err[kStatusCode] = statusCode;
			return err;
		}
	};
	module.exports = Receiver;
}));
//#endregion
//#region node_modules/ws/lib/sender.js
var require_sender = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { Duplex: Duplex$3 } = __require("stream");
	var { randomFillSync } = __require("crypto");
	var { types: { isUint8Array } } = __require("util");
	var PerMessageDeflate = require_permessage_deflate();
	var { EMPTY_BUFFER, kWebSocket, NOOP } = require_constants();
	var { isBlob, isValidStatusCode } = require_validation();
	var { mask: applyMask, toBuffer } = require_buffer_util();
	var kByteLength = Symbol("kByteLength");
	var maskBuffer = Buffer.alloc(4);
	var RANDOM_POOL_SIZE = 8192;
	var randomPool;
	var randomPoolPointer = RANDOM_POOL_SIZE;
	var DEFAULT = 0;
	var DEFLATING = 1;
	var GET_BLOB_DATA = 2;
	module.exports = class Sender {
		/**
		* Creates a Sender instance.
		*
		* @param {Duplex} socket The connection socket
		* @param {Object} [extensions] An object containing the negotiated extensions
		* @param {Function} [generateMask] The function used to generate the masking
		*     key
		*/
		constructor(socket, extensions, generateMask) {
			this._extensions = extensions || {};
			if (generateMask) {
				this._generateMask = generateMask;
				this._maskBuffer = Buffer.alloc(4);
			}
			this._socket = socket;
			this._firstFragment = true;
			this._compress = false;
			this._bufferedBytes = 0;
			this._queue = [];
			this._state = DEFAULT;
			this.onerror = NOOP;
			this[kWebSocket] = void 0;
		}
		/**
		* Frames a piece of data according to the HyBi WebSocket protocol.
		*
		* @param {(Buffer|String)} data The data to frame
		* @param {Object} options Options object
		* @param {Boolean} [options.fin=false] Specifies whether or not to set the
		*     FIN bit
		* @param {Function} [options.generateMask] The function used to generate the
		*     masking key
		* @param {Boolean} [options.mask=false] Specifies whether or not to mask
		*     `data`
		* @param {Buffer} [options.maskBuffer] The buffer used to store the masking
		*     key
		* @param {Number} options.opcode The opcode
		* @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
		*     modified
		* @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
		*     RSV1 bit
		* @return {(Buffer|String)[]} The framed data
		* @public
		*/
		static frame(data, options) {
			let mask;
			let merge = false;
			let offset = 2;
			let skipMasking = false;
			if (options.mask) {
				mask = options.maskBuffer || maskBuffer;
				if (options.generateMask) options.generateMask(mask);
				else {
					if (randomPoolPointer === RANDOM_POOL_SIZE) {
						/* istanbul ignore else  */
						if (randomPool === void 0) randomPool = Buffer.alloc(RANDOM_POOL_SIZE);
						randomFillSync(randomPool, 0, RANDOM_POOL_SIZE);
						randomPoolPointer = 0;
					}
					mask[0] = randomPool[randomPoolPointer++];
					mask[1] = randomPool[randomPoolPointer++];
					mask[2] = randomPool[randomPoolPointer++];
					mask[3] = randomPool[randomPoolPointer++];
				}
				skipMasking = (mask[0] | mask[1] | mask[2] | mask[3]) === 0;
				offset = 6;
			}
			let dataLength;
			if (typeof data === "string") if ((!options.mask || skipMasking) && options[kByteLength] !== void 0) dataLength = options[kByteLength];
			else {
				data = Buffer.from(data);
				dataLength = data.length;
			}
			else {
				dataLength = data.length;
				merge = options.mask && options.readOnly && !skipMasking;
			}
			let payloadLength = dataLength;
			if (dataLength >= 65536) {
				offset += 8;
				payloadLength = 127;
			} else if (dataLength > 125) {
				offset += 2;
				payloadLength = 126;
			}
			const target = Buffer.allocUnsafe(merge ? dataLength + offset : offset);
			target[0] = options.fin ? options.opcode | 128 : options.opcode;
			if (options.rsv1) target[0] |= 64;
			target[1] = payloadLength;
			if (payloadLength === 126) target.writeUInt16BE(dataLength, 2);
			else if (payloadLength === 127) {
				target[2] = target[3] = 0;
				target.writeUIntBE(dataLength, 4, 6);
			}
			if (!options.mask) return [target, data];
			target[1] |= 128;
			target[offset - 4] = mask[0];
			target[offset - 3] = mask[1];
			target[offset - 2] = mask[2];
			target[offset - 1] = mask[3];
			if (skipMasking) return [target, data];
			if (merge) {
				applyMask(data, mask, target, offset, dataLength);
				return [target];
			}
			applyMask(data, mask, data, 0, dataLength);
			return [target, data];
		}
		/**
		* Sends a close message to the other peer.
		*
		* @param {Number} [code] The status code component of the body
		* @param {(String|Buffer)} [data] The message component of the body
		* @param {Boolean} [mask=false] Specifies whether or not to mask the message
		* @param {Function} [cb] Callback
		* @public
		*/
		close(code, data, mask, cb) {
			let buf;
			if (code === void 0) buf = EMPTY_BUFFER;
			else if (typeof code !== "number" || !isValidStatusCode(code)) throw new TypeError("First argument must be a valid error code number");
			else if (data === void 0 || !data.length) {
				buf = Buffer.allocUnsafe(2);
				buf.writeUInt16BE(code, 0);
			} else {
				const length = Buffer.byteLength(data);
				if (length > 123) throw new RangeError("The message must not be greater than 123 bytes");
				buf = Buffer.allocUnsafe(2 + length);
				buf.writeUInt16BE(code, 0);
				if (typeof data === "string") buf.write(data, 2);
				else if (isUint8Array(data)) buf.set(data, 2);
				else throw new TypeError("Second argument must be a string or a Uint8Array");
			}
			const options = {
				[kByteLength]: buf.length,
				fin: true,
				generateMask: this._generateMask,
				mask,
				maskBuffer: this._maskBuffer,
				opcode: 8,
				readOnly: false,
				rsv1: false
			};
			if (this._state !== DEFAULT) this.enqueue([
				this.dispatch,
				buf,
				false,
				options,
				cb
			]);
			else this.sendFrame(Sender.frame(buf, options), cb);
		}
		/**
		* Sends a ping message to the other peer.
		*
		* @param {*} data The message to send
		* @param {Boolean} [mask=false] Specifies whether or not to mask `data`
		* @param {Function} [cb] Callback
		* @public
		*/
		ping(data, mask, cb) {
			let byteLength;
			let readOnly;
			if (typeof data === "string") {
				byteLength = Buffer.byteLength(data);
				readOnly = false;
			} else if (isBlob(data)) {
				byteLength = data.size;
				readOnly = false;
			} else {
				data = toBuffer(data);
				byteLength = data.length;
				readOnly = toBuffer.readOnly;
			}
			if (byteLength > 125) throw new RangeError("The data size must not be greater than 125 bytes");
			const options = {
				[kByteLength]: byteLength,
				fin: true,
				generateMask: this._generateMask,
				mask,
				maskBuffer: this._maskBuffer,
				opcode: 9,
				readOnly,
				rsv1: false
			};
			if (isBlob(data)) if (this._state !== DEFAULT) this.enqueue([
				this.getBlobData,
				data,
				false,
				options,
				cb
			]);
			else this.getBlobData(data, false, options, cb);
			else if (this._state !== DEFAULT) this.enqueue([
				this.dispatch,
				data,
				false,
				options,
				cb
			]);
			else this.sendFrame(Sender.frame(data, options), cb);
		}
		/**
		* Sends a pong message to the other peer.
		*
		* @param {*} data The message to send
		* @param {Boolean} [mask=false] Specifies whether or not to mask `data`
		* @param {Function} [cb] Callback
		* @public
		*/
		pong(data, mask, cb) {
			let byteLength;
			let readOnly;
			if (typeof data === "string") {
				byteLength = Buffer.byteLength(data);
				readOnly = false;
			} else if (isBlob(data)) {
				byteLength = data.size;
				readOnly = false;
			} else {
				data = toBuffer(data);
				byteLength = data.length;
				readOnly = toBuffer.readOnly;
			}
			if (byteLength > 125) throw new RangeError("The data size must not be greater than 125 bytes");
			const options = {
				[kByteLength]: byteLength,
				fin: true,
				generateMask: this._generateMask,
				mask,
				maskBuffer: this._maskBuffer,
				opcode: 10,
				readOnly,
				rsv1: false
			};
			if (isBlob(data)) if (this._state !== DEFAULT) this.enqueue([
				this.getBlobData,
				data,
				false,
				options,
				cb
			]);
			else this.getBlobData(data, false, options, cb);
			else if (this._state !== DEFAULT) this.enqueue([
				this.dispatch,
				data,
				false,
				options,
				cb
			]);
			else this.sendFrame(Sender.frame(data, options), cb);
		}
		/**
		* Sends a data message to the other peer.
		*
		* @param {*} data The message to send
		* @param {Object} options Options object
		* @param {Boolean} [options.binary=false] Specifies whether `data` is binary
		*     or text
		* @param {Boolean} [options.compress=false] Specifies whether or not to
		*     compress `data`
		* @param {Boolean} [options.fin=false] Specifies whether the fragment is the
		*     last one
		* @param {Boolean} [options.mask=false] Specifies whether or not to mask
		*     `data`
		* @param {Function} [cb] Callback
		* @public
		*/
		send(data, options, cb) {
			const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];
			let opcode = options.binary ? 2 : 1;
			let rsv1 = options.compress;
			let byteLength;
			let readOnly;
			if (typeof data === "string") {
				byteLength = Buffer.byteLength(data);
				readOnly = false;
			} else if (isBlob(data)) {
				byteLength = data.size;
				readOnly = false;
			} else {
				data = toBuffer(data);
				byteLength = data.length;
				readOnly = toBuffer.readOnly;
			}
			if (this._firstFragment) {
				this._firstFragment = false;
				if (rsv1 && perMessageDeflate && perMessageDeflate.params[perMessageDeflate._isServer ? "server_no_context_takeover" : "client_no_context_takeover"]) rsv1 = byteLength >= perMessageDeflate._threshold;
				this._compress = rsv1;
			} else {
				rsv1 = false;
				opcode = 0;
			}
			if (options.fin) this._firstFragment = true;
			const opts = {
				[kByteLength]: byteLength,
				fin: options.fin,
				generateMask: this._generateMask,
				mask: options.mask,
				maskBuffer: this._maskBuffer,
				opcode,
				readOnly,
				rsv1
			};
			if (isBlob(data)) if (this._state !== DEFAULT) this.enqueue([
				this.getBlobData,
				data,
				this._compress,
				opts,
				cb
			]);
			else this.getBlobData(data, this._compress, opts, cb);
			else if (this._state !== DEFAULT) this.enqueue([
				this.dispatch,
				data,
				this._compress,
				opts,
				cb
			]);
			else this.dispatch(data, this._compress, opts, cb);
		}
		/**
		* Gets the contents of a blob as binary data.
		*
		* @param {Blob} blob The blob
		* @param {Boolean} [compress=false] Specifies whether or not to compress
		*     the data
		* @param {Object} options Options object
		* @param {Boolean} [options.fin=false] Specifies whether or not to set the
		*     FIN bit
		* @param {Function} [options.generateMask] The function used to generate the
		*     masking key
		* @param {Boolean} [options.mask=false] Specifies whether or not to mask
		*     `data`
		* @param {Buffer} [options.maskBuffer] The buffer used to store the masking
		*     key
		* @param {Number} options.opcode The opcode
		* @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
		*     modified
		* @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
		*     RSV1 bit
		* @param {Function} [cb] Callback
		* @private
		*/
		getBlobData(blob, compress, options, cb) {
			this._bufferedBytes += options[kByteLength];
			this._state = GET_BLOB_DATA;
			blob.arrayBuffer().then((arrayBuffer) => {
				if (this._socket.destroyed) {
					const err = /* @__PURE__ */ new Error("The socket was closed while the blob was being read");
					process.nextTick(callCallbacks, this, err, cb);
					return;
				}
				this._bufferedBytes -= options[kByteLength];
				const data = toBuffer(arrayBuffer);
				if (!compress) {
					this._state = DEFAULT;
					this.sendFrame(Sender.frame(data, options), cb);
					this.dequeue();
				} else this.dispatch(data, compress, options, cb);
			}).catch((err) => {
				process.nextTick(onError, this, err, cb);
			});
		}
		/**
		* Dispatches a message.
		*
		* @param {(Buffer|String)} data The message to send
		* @param {Boolean} [compress=false] Specifies whether or not to compress
		*     `data`
		* @param {Object} options Options object
		* @param {Boolean} [options.fin=false] Specifies whether or not to set the
		*     FIN bit
		* @param {Function} [options.generateMask] The function used to generate the
		*     masking key
		* @param {Boolean} [options.mask=false] Specifies whether or not to mask
		*     `data`
		* @param {Buffer} [options.maskBuffer] The buffer used to store the masking
		*     key
		* @param {Number} options.opcode The opcode
		* @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
		*     modified
		* @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
		*     RSV1 bit
		* @param {Function} [cb] Callback
		* @private
		*/
		dispatch(data, compress, options, cb) {
			if (!compress) {
				this.sendFrame(Sender.frame(data, options), cb);
				return;
			}
			const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];
			this._bufferedBytes += options[kByteLength];
			this._state = DEFLATING;
			perMessageDeflate.compress(data, options.fin, (_, buf) => {
				if (this._socket.destroyed) {
					const err = /* @__PURE__ */ new Error("The socket was closed while data was being compressed");
					callCallbacks(this, err, cb);
					return;
				}
				this._bufferedBytes -= options[kByteLength];
				this._state = DEFAULT;
				options.readOnly = false;
				this.sendFrame(Sender.frame(buf, options), cb);
				this.dequeue();
			});
		}
		/**
		* Executes queued send operations.
		*
		* @private
		*/
		dequeue() {
			while (this._state === DEFAULT && this._queue.length) {
				const params = this._queue.shift();
				this._bufferedBytes -= params[3][kByteLength];
				Reflect.apply(params[0], this, params.slice(1));
			}
		}
		/**
		* Enqueues a send operation.
		*
		* @param {Array} params Send operation parameters.
		* @private
		*/
		enqueue(params) {
			this._bufferedBytes += params[3][kByteLength];
			this._queue.push(params);
		}
		/**
		* Sends a frame.
		*
		* @param {(Buffer | String)[]} list The frame to send
		* @param {Function} [cb] Callback
		* @private
		*/
		sendFrame(list, cb) {
			if (list.length === 2) {
				this._socket.cork();
				this._socket.write(list[0]);
				this._socket.write(list[1], cb);
				this._socket.uncork();
			} else this._socket.write(list[0], cb);
		}
	};
	/**
	* Calls queued callbacks with an error.
	*
	* @param {Sender} sender The `Sender` instance
	* @param {Error} err The error to call the callbacks with
	* @param {Function} [cb] The first callback
	* @private
	*/
	function callCallbacks(sender, err, cb) {
		if (typeof cb === "function") cb(err);
		for (let i = 0; i < sender._queue.length; i++) {
			const params = sender._queue[i];
			const callback = params[params.length - 1];
			if (typeof callback === "function") callback(err);
		}
	}
	/**
	* Handles a `Sender` error.
	*
	* @param {Sender} sender The `Sender` instance
	* @param {Error} err The error
	* @param {Function} [cb] The first pending callback
	* @private
	*/
	function onError(sender, err, cb) {
		callCallbacks(sender, err, cb);
		sender.onerror(err);
	}
}));
//#endregion
//#region node_modules/ws/lib/event-target.js
var require_event_target = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { kForOnEventAttribute, kListener } = require_constants();
	var kCode = Symbol("kCode");
	var kData = Symbol("kData");
	var kError = Symbol("kError");
	var kMessage = Symbol("kMessage");
	var kReason = Symbol("kReason");
	var kTarget = Symbol("kTarget");
	var kType = Symbol("kType");
	var kWasClean = Symbol("kWasClean");
	/**
	* Class representing an event.
	*/
	var Event = class {
		/**
		* Create a new `Event`.
		*
		* @param {String} type The name of the event
		* @throws {TypeError} If the `type` argument is not specified
		*/
		constructor(type) {
			this[kTarget] = null;
			this[kType] = type;
		}
		/**
		* @type {*}
		*/
		get target() {
			return this[kTarget];
		}
		/**
		* @type {String}
		*/
		get type() {
			return this[kType];
		}
	};
	Object.defineProperty(Event.prototype, "target", { enumerable: true });
	Object.defineProperty(Event.prototype, "type", { enumerable: true });
	/**
	* Class representing a close event.
	*
	* @extends Event
	*/
	var CloseEvent = class extends Event {
		/**
		* Create a new `CloseEvent`.
		*
		* @param {String} type The name of the event
		* @param {Object} [options] A dictionary object that allows for setting
		*     attributes via object members of the same name
		* @param {Number} [options.code=0] The status code explaining why the
		*     connection was closed
		* @param {String} [options.reason=''] A human-readable string explaining why
		*     the connection was closed
		* @param {Boolean} [options.wasClean=false] Indicates whether or not the
		*     connection was cleanly closed
		*/
		constructor(type, options = {}) {
			super(type);
			this[kCode] = options.code === void 0 ? 0 : options.code;
			this[kReason] = options.reason === void 0 ? "" : options.reason;
			this[kWasClean] = options.wasClean === void 0 ? false : options.wasClean;
		}
		/**
		* @type {Number}
		*/
		get code() {
			return this[kCode];
		}
		/**
		* @type {String}
		*/
		get reason() {
			return this[kReason];
		}
		/**
		* @type {Boolean}
		*/
		get wasClean() {
			return this[kWasClean];
		}
	};
	Object.defineProperty(CloseEvent.prototype, "code", { enumerable: true });
	Object.defineProperty(CloseEvent.prototype, "reason", { enumerable: true });
	Object.defineProperty(CloseEvent.prototype, "wasClean", { enumerable: true });
	/**
	* Class representing an error event.
	*
	* @extends Event
	*/
	var ErrorEvent = class extends Event {
		/**
		* Create a new `ErrorEvent`.
		*
		* @param {String} type The name of the event
		* @param {Object} [options] A dictionary object that allows for setting
		*     attributes via object members of the same name
		* @param {*} [options.error=null] The error that generated this event
		* @param {String} [options.message=''] The error message
		*/
		constructor(type, options = {}) {
			super(type);
			this[kError] = options.error === void 0 ? null : options.error;
			this[kMessage] = options.message === void 0 ? "" : options.message;
		}
		/**
		* @type {*}
		*/
		get error() {
			return this[kError];
		}
		/**
		* @type {String}
		*/
		get message() {
			return this[kMessage];
		}
	};
	Object.defineProperty(ErrorEvent.prototype, "error", { enumerable: true });
	Object.defineProperty(ErrorEvent.prototype, "message", { enumerable: true });
	/**
	* Class representing a message event.
	*
	* @extends Event
	*/
	var MessageEvent = class extends Event {
		/**
		* Create a new `MessageEvent`.
		*
		* @param {String} type The name of the event
		* @param {Object} [options] A dictionary object that allows for setting
		*     attributes via object members of the same name
		* @param {*} [options.data=null] The message content
		*/
		constructor(type, options = {}) {
			super(type);
			this[kData] = options.data === void 0 ? null : options.data;
		}
		/**
		* @type {*}
		*/
		get data() {
			return this[kData];
		}
	};
	Object.defineProperty(MessageEvent.prototype, "data", { enumerable: true });
	module.exports = {
		CloseEvent,
		ErrorEvent,
		Event,
		EventTarget: {
			/**
			* Register an event listener.
			*
			* @param {String} type A string representing the event type to listen for
			* @param {(Function|Object)} handler The listener to add
			* @param {Object} [options] An options object specifies characteristics about
			*     the event listener
			* @param {Boolean} [options.once=false] A `Boolean` indicating that the
			*     listener should be invoked at most once after being added. If `true`,
			*     the listener would be automatically removed when invoked.
			* @public
			*/
			addEventListener(type, handler, options = {}) {
				for (const listener of this.listeners(type)) if (!options[kForOnEventAttribute] && listener[kListener] === handler && !listener[kForOnEventAttribute]) return;
				let wrapper;
				if (type === "message") wrapper = function onMessage(data, isBinary) {
					const event = new MessageEvent("message", { data: isBinary ? data : data.toString() });
					event[kTarget] = this;
					callListener(handler, this, event);
				};
				else if (type === "close") wrapper = function onClose(code, message) {
					const event = new CloseEvent("close", {
						code,
						reason: message.toString(),
						wasClean: this._closeFrameReceived && this._closeFrameSent
					});
					event[kTarget] = this;
					callListener(handler, this, event);
				};
				else if (type === "error") wrapper = function onError(error) {
					const event = new ErrorEvent("error", {
						error,
						message: error.message
					});
					event[kTarget] = this;
					callListener(handler, this, event);
				};
				else if (type === "open") wrapper = function onOpen() {
					const event = new Event("open");
					event[kTarget] = this;
					callListener(handler, this, event);
				};
				else return;
				wrapper[kForOnEventAttribute] = !!options[kForOnEventAttribute];
				wrapper[kListener] = handler;
				if (options.once) this.once(type, wrapper);
				else this.on(type, wrapper);
			},
			/**
			* Remove an event listener.
			*
			* @param {String} type A string representing the event type to remove
			* @param {(Function|Object)} handler The listener to remove
			* @public
			*/
			removeEventListener(type, handler) {
				for (const listener of this.listeners(type)) if (listener[kListener] === handler && !listener[kForOnEventAttribute]) {
					this.removeListener(type, listener);
					break;
				}
			}
		},
		MessageEvent
	};
	/**
	* Call an event listener
	*
	* @param {(Function|Object)} listener The listener to call
	* @param {*} thisArg The value to use as `this`` when calling the listener
	* @param {Event} event The event to pass to the listener
	* @private
	*/
	function callListener(listener, thisArg, event) {
		if (typeof listener === "object" && listener.handleEvent) listener.handleEvent.call(listener, event);
		else listener.call(thisArg, event);
	}
}));
//#endregion
//#region node_modules/ws/lib/extension.js
var require_extension = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { tokenChars } = require_validation();
	/**
	* Adds an offer to the map of extension offers or a parameter to the map of
	* parameters.
	*
	* @param {Object} dest The map of extension offers or parameters
	* @param {String} name The extension or parameter name
	* @param {(Object|Boolean|String)} elem The extension parameters or the
	*     parameter value
	* @private
	*/
	function push(dest, name, elem) {
		if (dest[name] === void 0) dest[name] = [elem];
		else dest[name].push(elem);
	}
	/**
	* Parses the `Sec-WebSocket-Extensions` header into an object.
	*
	* @param {String} header The field value of the header
	* @return {Object} The parsed object
	* @public
	*/
	function parse(header) {
		const offers = Object.create(null);
		let params = Object.create(null);
		let mustUnescape = false;
		let isEscaping = false;
		let inQuotes = false;
		let extensionName;
		let paramName;
		let start = -1;
		let code = -1;
		let end = -1;
		let i = 0;
		for (; i < header.length; i++) {
			code = header.charCodeAt(i);
			if (extensionName === void 0) if (end === -1 && tokenChars[code] === 1) {
				if (start === -1) start = i;
			} else if (i !== 0 && (code === 32 || code === 9)) {
				if (end === -1 && start !== -1) end = i;
			} else if (code === 59 || code === 44) {
				if (start === -1) throw new SyntaxError(`Unexpected character at index ${i}`);
				if (end === -1) end = i;
				const name = header.slice(start, end);
				if (code === 44) {
					push(offers, name, params);
					params = Object.create(null);
				} else extensionName = name;
				start = end = -1;
			} else throw new SyntaxError(`Unexpected character at index ${i}`);
			else if (paramName === void 0) if (end === -1 && tokenChars[code] === 1) {
				if (start === -1) start = i;
			} else if (code === 32 || code === 9) {
				if (end === -1 && start !== -1) end = i;
			} else if (code === 59 || code === 44) {
				if (start === -1) throw new SyntaxError(`Unexpected character at index ${i}`);
				if (end === -1) end = i;
				push(params, header.slice(start, end), true);
				if (code === 44) {
					push(offers, extensionName, params);
					params = Object.create(null);
					extensionName = void 0;
				}
				start = end = -1;
			} else if (code === 61 && start !== -1 && end === -1) {
				paramName = header.slice(start, i);
				start = end = -1;
			} else throw new SyntaxError(`Unexpected character at index ${i}`);
			else if (isEscaping) {
				if (tokenChars[code] !== 1) throw new SyntaxError(`Unexpected character at index ${i}`);
				if (start === -1) start = i;
				else if (!mustUnescape) mustUnescape = true;
				isEscaping = false;
			} else if (inQuotes) if (tokenChars[code] === 1) {
				if (start === -1) start = i;
			} else if (code === 34 && start !== -1) {
				inQuotes = false;
				end = i;
			} else if (code === 92) isEscaping = true;
			else throw new SyntaxError(`Unexpected character at index ${i}`);
			else if (code === 34 && header.charCodeAt(i - 1) === 61) inQuotes = true;
			else if (end === -1 && tokenChars[code] === 1) {
				if (start === -1) start = i;
			} else if (start !== -1 && (code === 32 || code === 9)) {
				if (end === -1) end = i;
			} else if (code === 59 || code === 44) {
				if (start === -1) throw new SyntaxError(`Unexpected character at index ${i}`);
				if (end === -1) end = i;
				let value = header.slice(start, end);
				if (mustUnescape) {
					value = value.replace(/\\/g, "");
					mustUnescape = false;
				}
				push(params, paramName, value);
				if (code === 44) {
					push(offers, extensionName, params);
					params = Object.create(null);
					extensionName = void 0;
				}
				paramName = void 0;
				start = end = -1;
			} else throw new SyntaxError(`Unexpected character at index ${i}`);
		}
		if (start === -1 || inQuotes || code === 32 || code === 9) throw new SyntaxError("Unexpected end of input");
		if (end === -1) end = i;
		const token = header.slice(start, end);
		if (extensionName === void 0) push(offers, token, params);
		else {
			if (paramName === void 0) push(params, token, true);
			else if (mustUnescape) push(params, paramName, token.replace(/\\/g, ""));
			else push(params, paramName, token);
			push(offers, extensionName, params);
		}
		return offers;
	}
	/**
	* Builds the `Sec-WebSocket-Extensions` header field value.
	*
	* @param {Object} extensions The map of extensions and parameters to format
	* @return {String} A string representing the given object
	* @public
	*/
	function format(extensions) {
		return Object.keys(extensions).map((extension) => {
			let configurations = extensions[extension];
			if (!Array.isArray(configurations)) configurations = [configurations];
			return configurations.map((params) => {
				return [extension].concat(Object.keys(params).map((k) => {
					let values = params[k];
					if (!Array.isArray(values)) values = [values];
					return values.map((v) => v === true ? k : `${k}=${v}`).join("; ");
				})).join("; ");
			}).join(", ");
		}).join(", ");
	}
	module.exports = {
		format,
		parse
	};
}));
//#endregion
//#region node_modules/ws/lib/websocket.js
var require_websocket = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var EventEmitter$1 = __require("events");
	var https = __require("https");
	var http$1 = __require("http");
	var net = __require("net");
	var tls = __require("tls");
	var { randomBytes, createHash: createHash$1 } = __require("crypto");
	var { Duplex: Duplex$2, Readable } = __require("stream");
	var { URL } = __require("url");
	var PerMessageDeflate = require_permessage_deflate();
	var Receiver = require_receiver();
	var Sender = require_sender();
	var { isBlob } = require_validation();
	var { BINARY_TYPES, CLOSE_TIMEOUT, EMPTY_BUFFER, GUID, kForOnEventAttribute, kListener, kStatusCode, kWebSocket, NOOP } = require_constants();
	var { EventTarget: { addEventListener, removeEventListener } } = require_event_target();
	var { format, parse } = require_extension();
	var { toBuffer } = require_buffer_util();
	var kAborted = Symbol("kAborted");
	var protocolVersions = [8, 13];
	var readyStates = [
		"CONNECTING",
		"OPEN",
		"CLOSING",
		"CLOSED"
	];
	var subprotocolRegex = /^[!#$%&'*+\-.0-9A-Z^_`|a-z~]+$/;
	/**
	* Class representing a WebSocket.
	*
	* @extends EventEmitter
	*/
	var WebSocket = class WebSocket extends EventEmitter$1 {
		/**
		* Create a new `WebSocket`.
		*
		* @param {(String|URL)} address The URL to which to connect
		* @param {(String|String[])} [protocols] The subprotocols
		* @param {Object} [options] Connection options
		*/
		constructor(address, protocols, options) {
			super();
			this._binaryType = BINARY_TYPES[0];
			this._closeCode = 1006;
			this._closeFrameReceived = false;
			this._closeFrameSent = false;
			this._closeMessage = EMPTY_BUFFER;
			this._closeTimer = null;
			this._errorEmitted = false;
			this._extensions = {};
			this._paused = false;
			this._protocol = "";
			this._readyState = WebSocket.CONNECTING;
			this._receiver = null;
			this._sender = null;
			this._socket = null;
			if (address !== null) {
				this._bufferedAmount = 0;
				this._isServer = false;
				this._redirects = 0;
				if (protocols === void 0) protocols = [];
				else if (!Array.isArray(protocols)) if (typeof protocols === "object" && protocols !== null) {
					options = protocols;
					protocols = [];
				} else protocols = [protocols];
				initAsClient(this, address, protocols, options);
			} else {
				this._autoPong = options.autoPong;
				this._closeTimeout = options.closeTimeout;
				this._isServer = true;
			}
		}
		/**
		* For historical reasons, the custom "nodebuffer" type is used by the default
		* instead of "blob".
		*
		* @type {String}
		*/
		get binaryType() {
			return this._binaryType;
		}
		set binaryType(type) {
			if (!BINARY_TYPES.includes(type)) return;
			this._binaryType = type;
			if (this._receiver) this._receiver._binaryType = type;
		}
		/**
		* @type {Number}
		*/
		get bufferedAmount() {
			if (!this._socket) return this._bufferedAmount;
			return this._socket._writableState.length + this._sender._bufferedBytes;
		}
		/**
		* @type {String}
		*/
		get extensions() {
			return Object.keys(this._extensions).join();
		}
		/**
		* @type {Boolean}
		*/
		get isPaused() {
			return this._paused;
		}
		/**
		* @type {Function}
		*/
		/* istanbul ignore next */
		get onclose() {
			return null;
		}
		/**
		* @type {Function}
		*/
		/* istanbul ignore next */
		get onerror() {
			return null;
		}
		/**
		* @type {Function}
		*/
		/* istanbul ignore next */
		get onopen() {
			return null;
		}
		/**
		* @type {Function}
		*/
		/* istanbul ignore next */
		get onmessage() {
			return null;
		}
		/**
		* @type {String}
		*/
		get protocol() {
			return this._protocol;
		}
		/**
		* @type {Number}
		*/
		get readyState() {
			return this._readyState;
		}
		/**
		* @type {String}
		*/
		get url() {
			return this._url;
		}
		/**
		* Set up the socket and the internal resources.
		*
		* @param {Duplex} socket The network socket between the server and client
		* @param {Buffer} head The first packet of the upgraded stream
		* @param {Object} options Options object
		* @param {Boolean} [options.allowSynchronousEvents=false] Specifies whether
		*     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
		*     multiple times in the same tick
		* @param {Function} [options.generateMask] The function used to generate the
		*     masking key
		* @param {Number} [options.maxBufferedChunks=0] The maximum number of
		*     buffered data chunks
		* @param {Number} [options.maxFragments=0] The maximum number of message
		*     fragments
		* @param {Number} [options.maxPayload=0] The maximum allowed message size
		* @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
		*     not to skip UTF-8 validation for text and close messages
		* @private
		*/
		setSocket(socket, head, options) {
			const receiver = new Receiver({
				allowSynchronousEvents: options.allowSynchronousEvents,
				binaryType: this.binaryType,
				extensions: this._extensions,
				isServer: this._isServer,
				maxBufferedChunks: options.maxBufferedChunks,
				maxFragments: options.maxFragments,
				maxPayload: options.maxPayload,
				skipUTF8Validation: options.skipUTF8Validation
			});
			const sender = new Sender(socket, this._extensions, options.generateMask);
			this._receiver = receiver;
			this._sender = sender;
			this._socket = socket;
			receiver[kWebSocket] = this;
			sender[kWebSocket] = this;
			socket[kWebSocket] = this;
			receiver.on("conclude", receiverOnConclude);
			receiver.on("drain", receiverOnDrain);
			receiver.on("error", receiverOnError);
			receiver.on("message", receiverOnMessage);
			receiver.on("ping", receiverOnPing);
			receiver.on("pong", receiverOnPong);
			sender.onerror = senderOnError;
			if (socket.setTimeout) socket.setTimeout(0);
			if (socket.setNoDelay) socket.setNoDelay();
			if (head.length > 0) socket.unshift(head);
			socket.on("close", socketOnClose);
			socket.on("data", socketOnData);
			socket.on("end", socketOnEnd);
			socket.on("error", socketOnError);
			this._readyState = WebSocket.OPEN;
			this.emit("open");
		}
		/**
		* Emit the `'close'` event.
		*
		* @private
		*/
		emitClose() {
			if (!this._socket) {
				this._readyState = WebSocket.CLOSED;
				this.emit("close", this._closeCode, this._closeMessage);
				return;
			}
			if (this._extensions[PerMessageDeflate.extensionName]) this._extensions[PerMessageDeflate.extensionName].cleanup();
			this._receiver.removeAllListeners();
			this._readyState = WebSocket.CLOSED;
			this.emit("close", this._closeCode, this._closeMessage);
		}
		/**
		* Start a closing handshake.
		*
		*          +----------+   +-----------+   +----------+
		*     - - -|ws.close()|-->|close frame|-->|ws.close()|- - -
		*    |     +----------+   +-----------+   +----------+     |
		*          +----------+   +-----------+         |
		* CLOSING  |ws.close()|<--|close frame|<--+-----+       CLOSING
		*          +----------+   +-----------+   |
		*    |           |                        |   +---+        |
		*                +------------------------+-->|fin| - - - -
		*    |         +---+                      |   +---+
		*     - - - - -|fin|<---------------------+
		*              +---+
		*
		* @param {Number} [code] Status code explaining why the connection is closing
		* @param {(String|Buffer)} [data] The reason why the connection is
		*     closing
		* @public
		*/
		close(code, data) {
			if (this.readyState === WebSocket.CLOSED) return;
			if (this.readyState === WebSocket.CONNECTING) {
				abortHandshake(this, this._req, "WebSocket was closed before the connection was established");
				return;
			}
			if (this.readyState === WebSocket.CLOSING) {
				if (this._closeFrameSent && (this._closeFrameReceived || this._receiver._writableState.errorEmitted)) this._socket.end();
				return;
			}
			this._readyState = WebSocket.CLOSING;
			this._sender.close(code, data, !this._isServer, (err) => {
				if (err) return;
				this._closeFrameSent = true;
				if (this._closeFrameReceived || this._receiver._writableState.errorEmitted) this._socket.end();
			});
			setCloseTimer(this);
		}
		/**
		* Pause the socket.
		*
		* @public
		*/
		pause() {
			if (this.readyState === WebSocket.CONNECTING || this.readyState === WebSocket.CLOSED) return;
			this._paused = true;
			this._socket.pause();
		}
		/**
		* Send a ping.
		*
		* @param {*} [data] The data to send
		* @param {Boolean} [mask] Indicates whether or not to mask `data`
		* @param {Function} [cb] Callback which is executed when the ping is sent
		* @public
		*/
		ping(data, mask, cb) {
			if (this.readyState === WebSocket.CONNECTING) throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
			if (typeof data === "function") {
				cb = data;
				data = mask = void 0;
			} else if (typeof mask === "function") {
				cb = mask;
				mask = void 0;
			}
			if (typeof data === "number") data = data.toString();
			if (this.readyState !== WebSocket.OPEN) {
				sendAfterClose(this, data, cb);
				return;
			}
			if (mask === void 0) mask = !this._isServer;
			this._sender.ping(data || EMPTY_BUFFER, mask, cb);
		}
		/**
		* Send a pong.
		*
		* @param {*} [data] The data to send
		* @param {Boolean} [mask] Indicates whether or not to mask `data`
		* @param {Function} [cb] Callback which is executed when the pong is sent
		* @public
		*/
		pong(data, mask, cb) {
			if (this.readyState === WebSocket.CONNECTING) throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
			if (typeof data === "function") {
				cb = data;
				data = mask = void 0;
			} else if (typeof mask === "function") {
				cb = mask;
				mask = void 0;
			}
			if (typeof data === "number") data = data.toString();
			if (this.readyState !== WebSocket.OPEN) {
				sendAfterClose(this, data, cb);
				return;
			}
			if (mask === void 0) mask = !this._isServer;
			this._sender.pong(data || EMPTY_BUFFER, mask, cb);
		}
		/**
		* Resume the socket.
		*
		* @public
		*/
		resume() {
			if (this.readyState === WebSocket.CONNECTING || this.readyState === WebSocket.CLOSED) return;
			this._paused = false;
			if (!this._receiver._writableState.needDrain) this._socket.resume();
		}
		/**
		* Send a data message.
		*
		* @param {*} data The message to send
		* @param {Object} [options] Options object
		* @param {Boolean} [options.binary] Specifies whether `data` is binary or
		*     text
		* @param {Boolean} [options.compress] Specifies whether or not to compress
		*     `data`
		* @param {Boolean} [options.fin=true] Specifies whether the fragment is the
		*     last one
		* @param {Boolean} [options.mask] Specifies whether or not to mask `data`
		* @param {Function} [cb] Callback which is executed when data is written out
		* @public
		*/
		send(data, options, cb) {
			if (this.readyState === WebSocket.CONNECTING) throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
			if (typeof options === "function") {
				cb = options;
				options = {};
			}
			if (typeof data === "number") data = data.toString();
			if (this.readyState !== WebSocket.OPEN) {
				sendAfterClose(this, data, cb);
				return;
			}
			const opts = {
				binary: typeof data !== "string",
				mask: !this._isServer,
				compress: true,
				fin: true,
				...options
			};
			if (!this._extensions[PerMessageDeflate.extensionName]) opts.compress = false;
			this._sender.send(data || EMPTY_BUFFER, opts, cb);
		}
		/**
		* Forcibly close the connection.
		*
		* @public
		*/
		terminate() {
			if (this.readyState === WebSocket.CLOSED) return;
			if (this.readyState === WebSocket.CONNECTING) {
				abortHandshake(this, this._req, "WebSocket was closed before the connection was established");
				return;
			}
			if (this._socket) {
				this._readyState = WebSocket.CLOSING;
				this._socket.destroy();
			}
		}
	};
	/**
	* @constant {Number} CONNECTING
	* @memberof WebSocket
	*/
	Object.defineProperty(WebSocket, "CONNECTING", {
		enumerable: true,
		value: readyStates.indexOf("CONNECTING")
	});
	/**
	* @constant {Number} CONNECTING
	* @memberof WebSocket.prototype
	*/
	Object.defineProperty(WebSocket.prototype, "CONNECTING", {
		enumerable: true,
		value: readyStates.indexOf("CONNECTING")
	});
	/**
	* @constant {Number} OPEN
	* @memberof WebSocket
	*/
	Object.defineProperty(WebSocket, "OPEN", {
		enumerable: true,
		value: readyStates.indexOf("OPEN")
	});
	/**
	* @constant {Number} OPEN
	* @memberof WebSocket.prototype
	*/
	Object.defineProperty(WebSocket.prototype, "OPEN", {
		enumerable: true,
		value: readyStates.indexOf("OPEN")
	});
	/**
	* @constant {Number} CLOSING
	* @memberof WebSocket
	*/
	Object.defineProperty(WebSocket, "CLOSING", {
		enumerable: true,
		value: readyStates.indexOf("CLOSING")
	});
	/**
	* @constant {Number} CLOSING
	* @memberof WebSocket.prototype
	*/
	Object.defineProperty(WebSocket.prototype, "CLOSING", {
		enumerable: true,
		value: readyStates.indexOf("CLOSING")
	});
	/**
	* @constant {Number} CLOSED
	* @memberof WebSocket
	*/
	Object.defineProperty(WebSocket, "CLOSED", {
		enumerable: true,
		value: readyStates.indexOf("CLOSED")
	});
	/**
	* @constant {Number} CLOSED
	* @memberof WebSocket.prototype
	*/
	Object.defineProperty(WebSocket.prototype, "CLOSED", {
		enumerable: true,
		value: readyStates.indexOf("CLOSED")
	});
	[
		"binaryType",
		"bufferedAmount",
		"extensions",
		"isPaused",
		"protocol",
		"readyState",
		"url"
	].forEach((property) => {
		Object.defineProperty(WebSocket.prototype, property, { enumerable: true });
	});
	[
		"open",
		"error",
		"close",
		"message"
	].forEach((method) => {
		Object.defineProperty(WebSocket.prototype, `on${method}`, {
			enumerable: true,
			get() {
				for (const listener of this.listeners(method)) if (listener[kForOnEventAttribute]) return listener[kListener];
				return null;
			},
			set(handler) {
				for (const listener of this.listeners(method)) if (listener[kForOnEventAttribute]) {
					this.removeListener(method, listener);
					break;
				}
				if (typeof handler !== "function") return;
				this.addEventListener(method, handler, { [kForOnEventAttribute]: true });
			}
		});
	});
	WebSocket.prototype.addEventListener = addEventListener;
	WebSocket.prototype.removeEventListener = removeEventListener;
	module.exports = WebSocket;
	/**
	* Initialize a WebSocket client.
	*
	* @param {WebSocket} websocket The client to initialize
	* @param {(String|URL)} address The URL to which to connect
	* @param {Array} protocols The subprotocols
	* @param {Object} [options] Connection options
	* @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether any
	*     of the `'message'`, `'ping'`, and `'pong'` events can be emitted multiple
	*     times in the same tick
	* @param {Boolean} [options.autoPong=true] Specifies whether or not to
	*     automatically send a pong in response to a ping
	* @param {Number} [options.closeTimeout=30000] Duration in milliseconds to wait
	*     for the closing handshake to finish after `websocket.close()` is called
	* @param {Function} [options.finishRequest] A function which can be used to
	*     customize the headers of each http request before it is sent
	* @param {Boolean} [options.followRedirects=false] Whether or not to follow
	*     redirects
	* @param {Function} [options.generateMask] The function used to generate the
	*     masking key
	* @param {Number} [options.handshakeTimeout] Timeout in milliseconds for the
	*     handshake request
	* @param {Number} [options.maxBufferedChunks=262144] The maximum number of
	*     buffered data chunks
	* @param {Number} [options.maxFragments=16384] The maximum number of message
	*     fragments
	* @param {Number} [options.maxPayload=104857600] The maximum allowed message
	*     size
	* @param {Number} [options.maxRedirects=10] The maximum number of redirects
	*     allowed
	* @param {String} [options.origin] Value of the `Origin` or
	*     `Sec-WebSocket-Origin` header
	* @param {(Boolean|Object)} [options.perMessageDeflate=true] Enable/disable
	*     permessage-deflate
	* @param {Number} [options.protocolVersion=13] Value of the
	*     `Sec-WebSocket-Version` header
	* @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
	*     not to skip UTF-8 validation for text and close messages
	* @private
	*/
	function initAsClient(websocket, address, protocols, options) {
		const opts = {
			allowSynchronousEvents: true,
			autoPong: true,
			closeTimeout: CLOSE_TIMEOUT,
			protocolVersion: protocolVersions[1],
			maxBufferedChunks: 262144,
			maxFragments: 16384,
			maxPayload: 104857600,
			skipUTF8Validation: false,
			perMessageDeflate: true,
			followRedirects: false,
			maxRedirects: 10,
			...options,
			socketPath: void 0,
			hostname: void 0,
			protocol: void 0,
			timeout: void 0,
			method: "GET",
			host: void 0,
			path: void 0,
			port: void 0
		};
		websocket._autoPong = opts.autoPong;
		websocket._closeTimeout = opts.closeTimeout;
		if (!protocolVersions.includes(opts.protocolVersion)) throw new RangeError(`Unsupported protocol version: ${opts.protocolVersion} (supported versions: ${protocolVersions.join(", ")})`);
		let parsedUrl;
		if (address instanceof URL) parsedUrl = address;
		else try {
			parsedUrl = new URL(address);
		} catch {
			throw new SyntaxError(`Invalid URL: ${address}`);
		}
		if (parsedUrl.protocol === "http:") parsedUrl.protocol = "ws:";
		else if (parsedUrl.protocol === "https:") parsedUrl.protocol = "wss:";
		websocket._url = parsedUrl.href;
		const isSecure = parsedUrl.protocol === "wss:";
		const isIpcUrl = parsedUrl.protocol === "ws+unix:";
		let invalidUrlMessage;
		if (parsedUrl.protocol !== "ws:" && !isSecure && !isIpcUrl) invalidUrlMessage = "The URL's protocol must be one of \"ws:\", \"wss:\", \"http:\", \"https:\", or \"ws+unix:\"";
		else if (isIpcUrl && !parsedUrl.pathname) invalidUrlMessage = "The URL's pathname is empty";
		else if (parsedUrl.hash) invalidUrlMessage = "The URL contains a fragment identifier";
		if (invalidUrlMessage) {
			const err = new SyntaxError(invalidUrlMessage);
			if (websocket._redirects === 0) throw err;
			else {
				emitErrorAndClose(websocket, err);
				return;
			}
		}
		const defaultPort = isSecure ? 443 : 80;
		const key = randomBytes(16).toString("base64");
		const request = isSecure ? https.request : http$1.request;
		const protocolSet = /* @__PURE__ */ new Set();
		let perMessageDeflate;
		opts.createConnection = opts.createConnection || (isSecure ? tlsConnect : netConnect);
		opts.defaultPort = opts.defaultPort || defaultPort;
		opts.port = parsedUrl.port || defaultPort;
		opts.host = parsedUrl.hostname.startsWith("[") ? parsedUrl.hostname.slice(1, -1) : parsedUrl.hostname;
		opts.headers = {
			...opts.headers,
			"Sec-WebSocket-Version": opts.protocolVersion,
			"Sec-WebSocket-Key": key,
			Connection: "Upgrade",
			Upgrade: "websocket"
		};
		opts.path = parsedUrl.pathname + parsedUrl.search;
		opts.timeout = opts.handshakeTimeout;
		if (opts.perMessageDeflate) {
			perMessageDeflate = new PerMessageDeflate({
				...opts.perMessageDeflate,
				isServer: false,
				maxPayload: opts.maxPayload
			});
			opts.headers["Sec-WebSocket-Extensions"] = format({ [PerMessageDeflate.extensionName]: perMessageDeflate.offer() });
		}
		if (protocols.length) {
			for (const protocol of protocols) {
				if (typeof protocol !== "string" || !subprotocolRegex.test(protocol) || protocolSet.has(protocol)) throw new SyntaxError("An invalid or duplicated subprotocol was specified");
				protocolSet.add(protocol);
			}
			opts.headers["Sec-WebSocket-Protocol"] = protocols.join(",");
		}
		if (opts.origin) if (opts.protocolVersion < 13) opts.headers["Sec-WebSocket-Origin"] = opts.origin;
		else opts.headers.Origin = opts.origin;
		if (parsedUrl.username || parsedUrl.password) opts.auth = `${parsedUrl.username}:${parsedUrl.password}`;
		if (isIpcUrl) {
			const parts = opts.path.split(":");
			opts.socketPath = parts[0];
			opts.path = parts[1];
		}
		let req;
		if (opts.followRedirects) {
			if (websocket._redirects === 0) {
				websocket._originalIpc = isIpcUrl;
				websocket._originalSecure = isSecure;
				websocket._originalHostOrSocketPath = isIpcUrl ? opts.socketPath : parsedUrl.host;
				const headers = options && options.headers;
				options = {
					...options,
					headers: {}
				};
				if (headers) for (const [key, value] of Object.entries(headers)) options.headers[key.toLowerCase()] = value;
			} else if (websocket.listenerCount("redirect") === 0) {
				const isSameHost = isIpcUrl ? websocket._originalIpc ? opts.socketPath === websocket._originalHostOrSocketPath : false : websocket._originalIpc ? false : parsedUrl.host === websocket._originalHostOrSocketPath;
				if (!isSameHost || websocket._originalSecure && !isSecure) {
					delete opts.headers.authorization;
					delete opts.headers.cookie;
					if (!isSameHost) delete opts.headers.host;
					opts.auth = void 0;
				}
			}
			if (opts.auth && !options.headers.authorization) options.headers.authorization = "Basic " + Buffer.from(opts.auth).toString("base64");
			req = websocket._req = request(opts);
			if (websocket._redirects) websocket.emit("redirect", websocket.url, req);
		} else req = websocket._req = request(opts);
		if (opts.timeout) req.on("timeout", () => {
			abortHandshake(websocket, req, "Opening handshake has timed out");
		});
		req.on("error", (err) => {
			if (req === null || req[kAborted]) return;
			req = websocket._req = null;
			emitErrorAndClose(websocket, err);
		});
		req.on("response", (res) => {
			const location = res.headers.location;
			const statusCode = res.statusCode;
			if (location && opts.followRedirects && statusCode >= 300 && statusCode < 400) {
				if (++websocket._redirects > opts.maxRedirects) {
					abortHandshake(websocket, req, "Maximum redirects exceeded");
					return;
				}
				req.abort();
				let addr;
				try {
					addr = new URL(location, address);
				} catch (e) {
					emitErrorAndClose(websocket, /* @__PURE__ */ new SyntaxError(`Invalid URL: ${location}`));
					return;
				}
				initAsClient(websocket, addr, protocols, options);
			} else if (!websocket.emit("unexpected-response", req, res)) abortHandshake(websocket, req, `Unexpected server response: ${res.statusCode}`);
		});
		req.on("upgrade", (res, socket, head) => {
			websocket.emit("upgrade", res);
			if (websocket.readyState !== WebSocket.CONNECTING) return;
			req = websocket._req = null;
			const upgrade = res.headers.upgrade;
			if (upgrade === void 0 || upgrade.toLowerCase() !== "websocket") {
				abortHandshake(websocket, socket, "Invalid Upgrade header");
				return;
			}
			const digest = createHash$1("sha1").update(key + GUID).digest("base64");
			if (res.headers["sec-websocket-accept"] !== digest) {
				abortHandshake(websocket, socket, "Invalid Sec-WebSocket-Accept header");
				return;
			}
			const serverProt = res.headers["sec-websocket-protocol"];
			let protError;
			if (serverProt !== void 0) {
				if (!protocolSet.size) protError = "Server sent a subprotocol but none was requested";
				else if (!protocolSet.has(serverProt)) protError = "Server sent an invalid subprotocol";
			} else if (protocolSet.size) protError = "Server sent no subprotocol";
			if (protError) {
				abortHandshake(websocket, socket, protError);
				return;
			}
			if (serverProt) websocket._protocol = serverProt;
			const secWebSocketExtensions = res.headers["sec-websocket-extensions"];
			if (secWebSocketExtensions !== void 0) {
				if (!perMessageDeflate) {
					abortHandshake(websocket, socket, "Server sent a Sec-WebSocket-Extensions header but no extension was requested");
					return;
				}
				let extensions;
				try {
					extensions = parse(secWebSocketExtensions);
				} catch (err) {
					abortHandshake(websocket, socket, "Invalid Sec-WebSocket-Extensions header");
					return;
				}
				const extensionNames = Object.keys(extensions);
				if (extensionNames.length !== 1 || extensionNames[0] !== PerMessageDeflate.extensionName) {
					abortHandshake(websocket, socket, "Server indicated an extension that was not requested");
					return;
				}
				try {
					perMessageDeflate.accept(extensions[PerMessageDeflate.extensionName]);
				} catch (err) {
					abortHandshake(websocket, socket, "Invalid Sec-WebSocket-Extensions header");
					return;
				}
				websocket._extensions[PerMessageDeflate.extensionName] = perMessageDeflate;
			}
			websocket.setSocket(socket, head, {
				allowSynchronousEvents: opts.allowSynchronousEvents,
				generateMask: opts.generateMask,
				maxBufferedChunks: opts.maxBufferedChunks,
				maxFragments: opts.maxFragments,
				maxPayload: opts.maxPayload,
				skipUTF8Validation: opts.skipUTF8Validation
			});
		});
		if (opts.finishRequest) opts.finishRequest(req, websocket);
		else req.end();
	}
	/**
	* Emit the `'error'` and `'close'` events.
	*
	* @param {WebSocket} websocket The WebSocket instance
	* @param {Error} The error to emit
	* @private
	*/
	function emitErrorAndClose(websocket, err) {
		websocket._readyState = WebSocket.CLOSING;
		websocket._errorEmitted = true;
		websocket.emit("error", err);
		websocket.emitClose();
	}
	/**
	* Create a `net.Socket` and initiate a connection.
	*
	* @param {Object} options Connection options
	* @return {net.Socket} The newly created socket used to start the connection
	* @private
	*/
	function netConnect(options) {
		options.path = options.socketPath;
		return net.connect(options);
	}
	/**
	* Create a `tls.TLSSocket` and initiate a connection.
	*
	* @param {Object} options Connection options
	* @return {tls.TLSSocket} The newly created socket used to start the connection
	* @private
	*/
	function tlsConnect(options) {
		options.path = void 0;
		if (!options.servername && options.servername !== "") options.servername = net.isIP(options.host) ? "" : options.host;
		return tls.connect(options);
	}
	/**
	* Abort the handshake and emit an error.
	*
	* @param {WebSocket} websocket The WebSocket instance
	* @param {(http.ClientRequest|net.Socket|tls.Socket)} stream The request to
	*     abort or the socket to destroy
	* @param {String} message The error message
	* @private
	*/
	function abortHandshake(websocket, stream, message) {
		websocket._readyState = WebSocket.CLOSING;
		const err = new Error(message);
		Error.captureStackTrace(err, abortHandshake);
		if (stream.setHeader) {
			stream[kAborted] = true;
			stream.abort();
			if (stream.socket && !stream.socket.destroyed) stream.socket.destroy();
			process.nextTick(emitErrorAndClose, websocket, err);
		} else {
			stream.destroy(err);
			stream.once("error", websocket.emit.bind(websocket, "error"));
			stream.once("close", websocket.emitClose.bind(websocket));
		}
	}
	/**
	* Handle cases where the `ping()`, `pong()`, or `send()` methods are called
	* when the `readyState` attribute is `CLOSING` or `CLOSED`.
	*
	* @param {WebSocket} websocket The WebSocket instance
	* @param {*} [data] The data to send
	* @param {Function} [cb] Callback
	* @private
	*/
	function sendAfterClose(websocket, data, cb) {
		if (data) {
			const length = isBlob(data) ? data.size : toBuffer(data).length;
			if (websocket._socket) websocket._sender._bufferedBytes += length;
			else websocket._bufferedAmount += length;
		}
		if (cb) {
			const err = /* @__PURE__ */ new Error(`WebSocket is not open: readyState ${websocket.readyState} (${readyStates[websocket.readyState]})`);
			process.nextTick(cb, err);
		}
	}
	/**
	* The listener of the `Receiver` `'conclude'` event.
	*
	* @param {Number} code The status code
	* @param {Buffer} reason The reason for closing
	* @private
	*/
	function receiverOnConclude(code, reason) {
		const websocket = this[kWebSocket];
		websocket._closeFrameReceived = true;
		websocket._closeMessage = reason;
		websocket._closeCode = code;
		if (websocket._socket[kWebSocket] === void 0) return;
		websocket._socket.removeListener("data", socketOnData);
		process.nextTick(resume, websocket._socket);
		if (code === 1005) websocket.close();
		else websocket.close(code, reason);
	}
	/**
	* The listener of the `Receiver` `'drain'` event.
	*
	* @private
	*/
	function receiverOnDrain() {
		const websocket = this[kWebSocket];
		if (!websocket.isPaused) websocket._socket.resume();
	}
	/**
	* The listener of the `Receiver` `'error'` event.
	*
	* @param {(RangeError|Error)} err The emitted error
	* @private
	*/
	function receiverOnError(err) {
		const websocket = this[kWebSocket];
		if (websocket._socket[kWebSocket] !== void 0) {
			websocket._socket.removeListener("data", socketOnData);
			process.nextTick(resume, websocket._socket);
			websocket.close(err[kStatusCode]);
		}
		if (!websocket._errorEmitted) {
			websocket._errorEmitted = true;
			websocket.emit("error", err);
		}
	}
	/**
	* The listener of the `Receiver` `'finish'` event.
	*
	* @private
	*/
	function receiverOnFinish() {
		this[kWebSocket].emitClose();
	}
	/**
	* The listener of the `Receiver` `'message'` event.
	*
	* @param {Buffer|ArrayBuffer|Buffer[])} data The message
	* @param {Boolean} isBinary Specifies whether the message is binary or not
	* @private
	*/
	function receiverOnMessage(data, isBinary) {
		this[kWebSocket].emit("message", data, isBinary);
	}
	/**
	* The listener of the `Receiver` `'ping'` event.
	*
	* @param {Buffer} data The data included in the ping frame
	* @private
	*/
	function receiverOnPing(data) {
		const websocket = this[kWebSocket];
		if (websocket._autoPong) websocket.pong(data, !this._isServer, NOOP);
		websocket.emit("ping", data);
	}
	/**
	* The listener of the `Receiver` `'pong'` event.
	*
	* @param {Buffer} data The data included in the pong frame
	* @private
	*/
	function receiverOnPong(data) {
		this[kWebSocket].emit("pong", data);
	}
	/**
	* Resume a readable stream
	*
	* @param {Readable} stream The readable stream
	* @private
	*/
	function resume(stream) {
		stream.resume();
	}
	/**
	* The `Sender` error event handler.
	*
	* @param {Error} The error
	* @private
	*/
	function senderOnError(err) {
		const websocket = this[kWebSocket];
		if (websocket.readyState === WebSocket.CLOSED) return;
		if (websocket.readyState === WebSocket.OPEN) {
			websocket._readyState = WebSocket.CLOSING;
			setCloseTimer(websocket);
		}
		this._socket.end();
		if (!websocket._errorEmitted) {
			websocket._errorEmitted = true;
			websocket.emit("error", err);
		}
	}
	/**
	* Set a timer to destroy the underlying raw socket of a WebSocket.
	*
	* @param {WebSocket} websocket The WebSocket instance
	* @private
	*/
	function setCloseTimer(websocket) {
		websocket._closeTimer = setTimeout(websocket._socket.destroy.bind(websocket._socket), websocket._closeTimeout);
	}
	/**
	* The listener of the socket `'close'` event.
	*
	* @private
	*/
	function socketOnClose() {
		const websocket = this[kWebSocket];
		this.removeListener("close", socketOnClose);
		this.removeListener("data", socketOnData);
		this.removeListener("end", socketOnEnd);
		websocket._readyState = WebSocket.CLOSING;
		if (!this._readableState.endEmitted && !websocket._closeFrameReceived && !websocket._receiver._writableState.errorEmitted && this._readableState.length !== 0) {
			const chunk = this.read(this._readableState.length);
			websocket._receiver.write(chunk);
		}
		websocket._receiver.end();
		this[kWebSocket] = void 0;
		clearTimeout(websocket._closeTimer);
		if (websocket._receiver._writableState.finished || websocket._receiver._writableState.errorEmitted) websocket.emitClose();
		else {
			websocket._receiver.on("error", receiverOnFinish);
			websocket._receiver.on("finish", receiverOnFinish);
		}
	}
	/**
	* The listener of the socket `'data'` event.
	*
	* @param {Buffer} chunk A chunk of data
	* @private
	*/
	function socketOnData(chunk) {
		if (!this[kWebSocket]._receiver.write(chunk)) this.pause();
	}
	/**
	* The listener of the socket `'end'` event.
	*
	* @private
	*/
	function socketOnEnd() {
		const websocket = this[kWebSocket];
		websocket._readyState = WebSocket.CLOSING;
		websocket._receiver.end();
		this.end();
	}
	/**
	* The listener of the socket `'error'` event.
	*
	* @private
	*/
	function socketOnError() {
		const websocket = this[kWebSocket];
		this.removeListener("error", socketOnError);
		this.on("error", NOOP);
		if (websocket) {
			websocket._readyState = WebSocket.CLOSING;
			this.destroy();
		}
	}
}));
//#endregion
//#region node_modules/ws/lib/stream.js
var require_stream = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	require_websocket();
	var { Duplex: Duplex$1 } = __require("stream");
	/**
	* Emits the `'close'` event on a stream.
	*
	* @param {Duplex} stream The stream.
	* @private
	*/
	function emitClose(stream) {
		stream.emit("close");
	}
	/**
	* The listener of the `'end'` event.
	*
	* @private
	*/
	function duplexOnEnd() {
		if (!this.destroyed && this._writableState.finished) this.destroy();
	}
	/**
	* The listener of the `'error'` event.
	*
	* @param {Error} err The error
	* @private
	*/
	function duplexOnError(err) {
		this.removeListener("error", duplexOnError);
		this.destroy();
		if (this.listenerCount("error") === 0) this.emit("error", err);
	}
	/**
	* Wraps a `WebSocket` in a duplex stream.
	*
	* @param {WebSocket} ws The `WebSocket` to wrap
	* @param {Object} [options] The options for the `Duplex` constructor
	* @return {Duplex} The duplex stream
	* @public
	*/
	function createWebSocketStream(ws, options) {
		let terminateOnDestroy = true;
		const duplex = new Duplex$1({
			...options,
			autoDestroy: false,
			emitClose: false,
			objectMode: false,
			writableObjectMode: false
		});
		ws.on("message", function message(msg, isBinary) {
			const data = !isBinary && duplex._readableState.objectMode ? msg.toString() : msg;
			if (!duplex.push(data)) ws.pause();
		});
		ws.once("error", function error(err) {
			if (duplex.destroyed) return;
			terminateOnDestroy = false;
			duplex.destroy(err);
		});
		ws.once("close", function close() {
			if (duplex.destroyed) return;
			duplex.push(null);
		});
		duplex._destroy = function(err, callback) {
			if (ws.readyState === ws.CLOSED) {
				callback(err);
				process.nextTick(emitClose, duplex);
				return;
			}
			let called = false;
			ws.once("error", function error(err) {
				called = true;
				callback(err);
			});
			ws.once("close", function close() {
				if (!called) callback(err);
				process.nextTick(emitClose, duplex);
			});
			if (terminateOnDestroy) ws.terminate();
		};
		duplex._final = function(callback) {
			if (ws.readyState === ws.CONNECTING) {
				ws.once("open", function open() {
					duplex._final(callback);
				});
				return;
			}
			if (ws._socket === null) return;
			if (ws._socket._writableState.finished) {
				callback();
				if (duplex._readableState.endEmitted) duplex.destroy();
			} else {
				ws._socket.once("finish", function finish() {
					callback();
				});
				ws.close();
			}
		};
		duplex._read = function() {
			if (ws.isPaused) ws.resume();
		};
		duplex._write = function(chunk, encoding, callback) {
			if (ws.readyState === ws.CONNECTING) {
				ws.once("open", function open() {
					duplex._write(chunk, encoding, callback);
				});
				return;
			}
			ws.send(chunk, callback);
		};
		duplex.on("end", duplexOnEnd);
		duplex.on("error", duplexOnError);
		return duplex;
	}
	module.exports = createWebSocketStream;
}));
//#endregion
//#region node_modules/ws/lib/subprotocol.js
var require_subprotocol = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { tokenChars } = require_validation();
	/**
	* Parses the `Sec-WebSocket-Protocol` header into a set of subprotocol names.
	*
	* @param {String} header The field value of the header
	* @return {Set} The subprotocol names
	* @public
	*/
	function parse(header) {
		const protocols = /* @__PURE__ */ new Set();
		let start = -1;
		let end = -1;
		let i = 0;
		for (; i < header.length; i++) {
			const code = header.charCodeAt(i);
			if (end === -1 && tokenChars[code] === 1) {
				if (start === -1) start = i;
			} else if (i !== 0 && (code === 32 || code === 9)) {
				if (end === -1 && start !== -1) end = i;
			} else if (code === 44) {
				if (start === -1) throw new SyntaxError(`Unexpected character at index ${i}`);
				if (end === -1) end = i;
				const protocol = header.slice(start, end);
				if (protocols.has(protocol)) throw new SyntaxError(`The "${protocol}" subprotocol is duplicated`);
				protocols.add(protocol);
				start = end = -1;
			} else throw new SyntaxError(`Unexpected character at index ${i}`);
		}
		if (start === -1 || end !== -1) throw new SyntaxError("Unexpected end of input");
		const protocol = header.slice(start, i);
		if (protocols.has(protocol)) throw new SyntaxError(`The "${protocol}" subprotocol is duplicated`);
		protocols.add(protocol);
		return protocols;
	}
	module.exports = { parse };
}));
//#endregion
//#region node_modules/ws/lib/websocket-server.js
var require_websocket_server = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var EventEmitter = __require("events");
	var http = __require("http");
	var { Duplex } = __require("stream");
	var { createHash } = __require("crypto");
	var extension = require_extension();
	var PerMessageDeflate = require_permessage_deflate();
	var subprotocol = require_subprotocol();
	var WebSocket = require_websocket();
	var { CLOSE_TIMEOUT, GUID, kWebSocket } = require_constants();
	var keyRegex = /^[+/0-9A-Za-z]{22}==$/;
	var RUNNING = 0;
	var CLOSING = 1;
	var CLOSED = 2;
	/**
	* Class representing a WebSocket server.
	*
	* @extends EventEmitter
	*/
	var WebSocketServer = class extends EventEmitter {
		/**
		* Create a `WebSocketServer` instance.
		*
		* @param {Object} options Configuration options
		* @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether
		*     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
		*     multiple times in the same tick
		* @param {Boolean} [options.autoPong=true] Specifies whether or not to
		*     automatically send a pong in response to a ping
		* @param {Number} [options.backlog=511] The maximum length of the queue of
		*     pending connections
		* @param {Boolean} [options.clientTracking=true] Specifies whether or not to
		*     track clients
		* @param {Number} [options.closeTimeout=30000] Duration in milliseconds to
		*     wait for the closing handshake to finish after `websocket.close()` is
		*     called
		* @param {Function} [options.handleProtocols] A hook to handle protocols
		* @param {String} [options.host] The hostname where to bind the server
		* @param {Number} [options.maxBufferedChunks=262144] The maximum number of
		*     buffered data chunks
		* @param {Number} [options.maxFragments=16384] The maximum number of message
		*     fragments
		* @param {Number} [options.maxPayload=104857600] The maximum allowed message
		*     size
		* @param {Boolean} [options.noServer=false] Enable no server mode
		* @param {String} [options.path] Accept only connections matching this path
		* @param {(Boolean|Object)} [options.perMessageDeflate=false] Enable/disable
		*     permessage-deflate
		* @param {Number} [options.port] The port where to bind the server
		* @param {(http.Server|https.Server)} [options.server] A pre-created HTTP/S
		*     server to use
		* @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
		*     not to skip UTF-8 validation for text and close messages
		* @param {Function} [options.verifyClient] A hook to reject connections
		* @param {Function} [options.WebSocket=WebSocket] Specifies the `WebSocket`
		*     class to use. It must be the `WebSocket` class or class that extends it
		* @param {Function} [callback] A listener for the `listening` event
		*/
		constructor(options, callback) {
			super();
			options = {
				allowSynchronousEvents: true,
				autoPong: true,
				maxBufferedChunks: 262144,
				maxFragments: 16384,
				maxPayload: 104857600,
				skipUTF8Validation: false,
				perMessageDeflate: false,
				handleProtocols: null,
				clientTracking: true,
				closeTimeout: CLOSE_TIMEOUT,
				verifyClient: null,
				noServer: false,
				backlog: null,
				server: null,
				host: null,
				path: null,
				port: null,
				WebSocket,
				...options
			};
			if (options.port == null && !options.server && !options.noServer || options.port != null && (options.server || options.noServer) || options.server && options.noServer) throw new TypeError("One and only one of the \"port\", \"server\", or \"noServer\" options must be specified");
			if (options.port != null) {
				this._server = http.createServer((req, res) => {
					const body = http.STATUS_CODES[426];
					res.writeHead(426, {
						"Content-Length": body.length,
						"Content-Type": "text/plain"
					});
					res.end(body);
				});
				this._server.listen(options.port, options.host, options.backlog, callback);
			} else if (options.server) this._server = options.server;
			if (this._server) {
				const emitConnection = this.emit.bind(this, "connection");
				this._removeListeners = addListeners(this._server, {
					listening: this.emit.bind(this, "listening"),
					error: this.emit.bind(this, "error"),
					upgrade: (req, socket, head) => {
						this.handleUpgrade(req, socket, head, emitConnection);
					}
				});
			}
			if (options.perMessageDeflate === true) options.perMessageDeflate = {};
			if (options.clientTracking) {
				this.clients = /* @__PURE__ */ new Set();
				this._shouldEmitClose = false;
			}
			this.options = options;
			this._state = RUNNING;
		}
		/**
		* Returns the bound address, the address family name, and port of the server
		* as reported by the operating system if listening on an IP socket.
		* If the server is listening on a pipe or UNIX domain socket, the name is
		* returned as a string.
		*
		* @return {(Object|String|null)} The address of the server
		* @public
		*/
		address() {
			if (this.options.noServer) throw new Error("The server is operating in \"noServer\" mode");
			if (!this._server) return null;
			return this._server.address();
		}
		/**
		* Stop the server from accepting new connections and emit the `'close'` event
		* when all existing connections are closed.
		*
		* @param {Function} [cb] A one-time listener for the `'close'` event
		* @public
		*/
		close(cb) {
			if (this._state === CLOSED) {
				if (cb) this.once("close", () => {
					cb(/* @__PURE__ */ new Error("The server is not running"));
				});
				process.nextTick(emitClose, this);
				return;
			}
			if (cb) this.once("close", cb);
			if (this._state === CLOSING) return;
			this._state = CLOSING;
			if (this.options.noServer || this.options.server) {
				if (this._server) {
					this._removeListeners();
					this._removeListeners = this._server = null;
				}
				if (this.clients) if (!this.clients.size) process.nextTick(emitClose, this);
				else this._shouldEmitClose = true;
				else process.nextTick(emitClose, this);
			} else {
				const server = this._server;
				this._removeListeners();
				this._removeListeners = this._server = null;
				server.close(() => {
					emitClose(this);
				});
			}
		}
		/**
		* See if a given request should be handled by this server instance.
		*
		* @param {http.IncomingMessage} req Request object to inspect
		* @return {Boolean} `true` if the request is valid, else `false`
		* @public
		*/
		shouldHandle(req) {
			if (this.options.path) {
				const index = req.url.indexOf("?");
				if ((index !== -1 ? req.url.slice(0, index) : req.url) !== this.options.path) return false;
			}
			return true;
		}
		/**
		* Handle a HTTP Upgrade request.
		*
		* @param {http.IncomingMessage} req The request object
		* @param {Duplex} socket The network socket between the server and client
		* @param {Buffer} head The first packet of the upgraded stream
		* @param {Function} cb Callback
		* @public
		*/
		handleUpgrade(req, socket, head, cb) {
			socket.on("error", socketOnError);
			const key = req.headers["sec-websocket-key"];
			const upgrade = req.headers.upgrade;
			const version = +req.headers["sec-websocket-version"];
			if (req.method !== "GET") {
				abortHandshakeOrEmitwsClientError(this, req, socket, 405, "Invalid HTTP method");
				return;
			}
			if (upgrade === void 0 || upgrade.toLowerCase() !== "websocket") {
				abortHandshakeOrEmitwsClientError(this, req, socket, 400, "Invalid Upgrade header");
				return;
			}
			if (key === void 0 || !keyRegex.test(key)) {
				abortHandshakeOrEmitwsClientError(this, req, socket, 400, "Missing or invalid Sec-WebSocket-Key header");
				return;
			}
			if (version !== 13 && version !== 8) {
				abortHandshakeOrEmitwsClientError(this, req, socket, 400, "Missing or invalid Sec-WebSocket-Version header", { "Sec-WebSocket-Version": "13, 8" });
				return;
			}
			if (!this.shouldHandle(req)) {
				abortHandshake(socket, 400);
				return;
			}
			const secWebSocketProtocol = req.headers["sec-websocket-protocol"];
			let protocols = /* @__PURE__ */ new Set();
			if (secWebSocketProtocol !== void 0) try {
				protocols = subprotocol.parse(secWebSocketProtocol);
			} catch (err) {
				abortHandshakeOrEmitwsClientError(this, req, socket, 400, "Invalid Sec-WebSocket-Protocol header");
				return;
			}
			const secWebSocketExtensions = req.headers["sec-websocket-extensions"];
			const extensions = {};
			if (this.options.perMessageDeflate && secWebSocketExtensions !== void 0) {
				const perMessageDeflate = new PerMessageDeflate({
					...this.options.perMessageDeflate,
					isServer: true,
					maxPayload: this.options.maxPayload
				});
				try {
					const offers = extension.parse(secWebSocketExtensions);
					if (offers[PerMessageDeflate.extensionName]) {
						perMessageDeflate.accept(offers[PerMessageDeflate.extensionName]);
						extensions[PerMessageDeflate.extensionName] = perMessageDeflate;
					}
				} catch (err) {
					abortHandshakeOrEmitwsClientError(this, req, socket, 400, "Invalid or unacceptable Sec-WebSocket-Extensions header");
					return;
				}
			}
			if (this.options.verifyClient) {
				const info = {
					origin: req.headers[`${version === 8 ? "sec-websocket-origin" : "origin"}`],
					secure: !!(req.socket.authorized || req.socket.encrypted),
					req
				};
				if (this.options.verifyClient.length === 2) {
					this.options.verifyClient(info, (verified, code, message, headers) => {
						if (!verified) return abortHandshake(socket, code || 401, message, headers);
						this.completeUpgrade(extensions, key, protocols, req, socket, head, cb);
					});
					return;
				}
				if (!this.options.verifyClient(info)) return abortHandshake(socket, 401);
			}
			this.completeUpgrade(extensions, key, protocols, req, socket, head, cb);
		}
		/**
		* Upgrade the connection to WebSocket.
		*
		* @param {Object} extensions The accepted extensions
		* @param {String} key The value of the `Sec-WebSocket-Key` header
		* @param {Set} protocols The subprotocols
		* @param {http.IncomingMessage} req The request object
		* @param {Duplex} socket The network socket between the server and client
		* @param {Buffer} head The first packet of the upgraded stream
		* @param {Function} cb Callback
		* @throws {Error} If called more than once with the same socket
		* @private
		*/
		completeUpgrade(extensions, key, protocols, req, socket, head, cb) {
			if (!socket.readable || !socket.writable) return socket.destroy();
			if (socket[kWebSocket]) throw new Error("server.handleUpgrade() was called more than once with the same socket, possibly due to a misconfiguration");
			if (this._state > RUNNING) return abortHandshake(socket, 503);
			const headers = [
				"HTTP/1.1 101 Switching Protocols",
				"Upgrade: websocket",
				"Connection: Upgrade",
				`Sec-WebSocket-Accept: ${createHash("sha1").update(key + GUID).digest("base64")}`
			];
			const ws = new this.options.WebSocket(null, void 0, this.options);
			if (protocols.size) {
				const protocol = this.options.handleProtocols ? this.options.handleProtocols(protocols, req) : protocols.values().next().value;
				if (protocol) {
					headers.push(`Sec-WebSocket-Protocol: ${protocol}`);
					ws._protocol = protocol;
				}
			}
			if (extensions[PerMessageDeflate.extensionName]) {
				const params = extensions[PerMessageDeflate.extensionName].params;
				const value = extension.format({ [PerMessageDeflate.extensionName]: [params] });
				headers.push(`Sec-WebSocket-Extensions: ${value}`);
				ws._extensions = extensions;
			}
			this.emit("headers", headers, req);
			socket.write(headers.concat("\r\n").join("\r\n"));
			socket.removeListener("error", socketOnError);
			ws.setSocket(socket, head, {
				allowSynchronousEvents: this.options.allowSynchronousEvents,
				maxBufferedChunks: this.options.maxBufferedChunks,
				maxFragments: this.options.maxFragments,
				maxPayload: this.options.maxPayload,
				skipUTF8Validation: this.options.skipUTF8Validation
			});
			if (this.clients) {
				this.clients.add(ws);
				ws.on("close", () => {
					this.clients.delete(ws);
					if (this._shouldEmitClose && !this.clients.size) process.nextTick(emitClose, this);
				});
			}
			cb(ws, req);
		}
	};
	module.exports = WebSocketServer;
	/**
	* Add event listeners on an `EventEmitter` using a map of <event, listener>
	* pairs.
	*
	* @param {EventEmitter} server The event emitter
	* @param {Object.<String, Function>} map The listeners to add
	* @return {Function} A function that will remove the added listeners when
	*     called
	* @private
	*/
	function addListeners(server, map) {
		for (const event of Object.keys(map)) server.on(event, map[event]);
		return function removeListeners() {
			for (const event of Object.keys(map)) server.removeListener(event, map[event]);
		};
	}
	/**
	* Emit a `'close'` event on an `EventEmitter`.
	*
	* @param {EventEmitter} server The event emitter
	* @private
	*/
	function emitClose(server) {
		server._state = CLOSED;
		server.emit("close");
	}
	/**
	* Handle socket errors.
	*
	* @private
	*/
	function socketOnError() {
		this.destroy();
	}
	/**
	* Close the connection when preconditions are not fulfilled.
	*
	* @param {Duplex} socket The socket of the upgrade request
	* @param {Number} code The HTTP response status code
	* @param {String} [message] The HTTP response body
	* @param {Object} [headers] Additional HTTP response headers
	* @private
	*/
	function abortHandshake(socket, code, message, headers) {
		message = message || http.STATUS_CODES[code];
		headers = {
			Connection: "close",
			"Content-Type": "text/html",
			"Content-Length": Buffer.byteLength(message),
			...headers
		};
		socket.once("finish", socket.destroy);
		socket.end(`HTTP/1.1 ${code} ${http.STATUS_CODES[code]}\r\n` + Object.keys(headers).map((h) => `${h}: ${headers[h]}`).join("\r\n") + "\r\n\r\n" + message);
	}
	/**
	* Emit a `'wsClientError'` event on a `WebSocketServer` if there is at least
	* one listener for it, otherwise call `abortHandshake()`.
	*
	* @param {WebSocketServer} server The WebSocket server
	* @param {http.IncomingMessage} req The request object
	* @param {Duplex} socket The socket of the upgrade request
	* @param {Number} code The HTTP response status code
	* @param {String} message The HTTP response body
	* @param {Object} [headers] The HTTP response headers
	* @private
	*/
	function abortHandshakeOrEmitwsClientError(server, req, socket, code, message, headers) {
		if (server.listenerCount("wsClientError")) {
			const err = new Error(message);
			Error.captureStackTrace(err, abortHandshakeOrEmitwsClientError);
			server.emit("wsClientError", err, socket, req);
		} else abortHandshake(socket, code, message, headers);
	}
}));
require_stream();
require_extension();
require_permessage_deflate();
require_receiver();
require_sender();
require_subprotocol();
var import_websocket = /* @__PURE__ */ __toESM(require_websocket(), 1);
require_websocket_server();
//#endregion
//#region node_modules/engine.io-client/build/esm-debug/transports/websocket.js
var debug$2 = (0, import_src.default)("engine.io-client:websocket");
var isReactNative = typeof navigator !== "undefined" && typeof navigator.product === "string" && navigator.product.toLowerCase() === "reactnative";
var BaseWS = class extends Transport {
	get name() {
		return "websocket";
	}
	doOpen() {
		const uri = this.uri();
		const protocols = this.opts.protocols;
		const opts = isReactNative ? {} : pick(this.opts, "agent", "perMessageDeflate", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "localAddress", "protocolVersion", "origin", "maxPayload", "family", "checkServerIdentity");
		if (this.opts.extraHeaders) opts.headers = this.opts.extraHeaders;
		try {
			this.ws = this.createSocket(uri, protocols, opts);
		} catch (err) {
			return this.emitReserved("error", err);
		}
		this.ws.binaryType = this.socket.binaryType;
		this.addEventListeners();
	}
	/**
	* Adds event listeners to the socket
	*
	* @private
	*/
	addEventListeners() {
		this.ws.onopen = () => {
			if (this.opts.autoUnref) this.ws._socket.unref();
			this.onOpen();
		};
		this.ws.onclose = (closeEvent) => this.onClose({
			description: "websocket connection closed",
			context: closeEvent
		});
		this.ws.onmessage = (ev) => this.onData(ev.data);
		this.ws.onerror = (e) => this.onError("websocket error", e);
	}
	write(packets) {
		this.writable = false;
		for (let i = 0; i < packets.length; i++) {
			const packet = packets[i];
			const lastPacket = i === packets.length - 1;
			encodePacket(packet, this.supportsBinary, (data) => {
				try {
					this.doWrite(packet, data);
				} catch (e) {
					debug$2("websocket closed before onclose event");
				}
				if (lastPacket) nextTick(() => {
					this.writable = true;
					this.emitReserved("drain");
				}, this.setTimeoutFn);
			});
		}
	}
	doClose() {
		if (typeof this.ws !== "undefined") {
			this.ws.onerror = () => {};
			this.ws.close();
			this.ws = null;
		}
	}
	/**
	* Generates uri for connection.
	*
	* @private
	*/
	uri() {
		const schema = this.opts.secure ? "wss" : "ws";
		const query = this.query || {};
		if (this.opts.timestampRequests) query[this.opts.timestampParam] = randomString();
		if (!this.supportsBinary) query.b64 = 1;
		return this.createUri(schema, query);
	}
};
globalThisShim.WebSocket || globalThisShim.MozWebSocket;
//#endregion
//#region node_modules/engine.io-client/build/esm-debug/transports/websocket.node.js
/**
* WebSocket transport based on the `WebSocket` object provided by the `ws` package.
*
* Usage: Node.js, Deno (compat), Bun (compat)
*
* @see https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
* @see https://caniuse.com/mdn-api_websocket
*/
var WS = class extends BaseWS {
	createSocket(uri, protocols, opts) {
		var _a;
		if ((_a = this.socket) === null || _a === void 0 ? void 0 : _a._cookieJar) {
			opts.headers = opts.headers || {};
			opts.headers.cookie = typeof opts.headers.cookie === "string" ? [opts.headers.cookie] : opts.headers.cookie || [];
			for (const [name, cookie] of this.socket._cookieJar.cookies) opts.headers.cookie.push(`${name}=${cookie.value}`);
		}
		return new import_websocket.default(uri, protocols, opts);
	}
	doWrite(packet, data) {
		const opts = {};
		if (packet.options) opts.compress = packet.options.compress;
		if (this.opts.perMessageDeflate) {
			if (("string" === typeof data ? Buffer.byteLength(data) : data.length) < this.opts.perMessageDeflate.threshold) opts.compress = false;
		}
		this.ws.send(data, opts);
	}
};
//#endregion
//#region node_modules/engine.io-client/build/esm-debug/transports/webtransport.js
var debug$1 = (0, import_src.default)("engine.io-client:webtransport");
/**
* WebTransport transport based on the built-in `WebTransport` object.
*
* Usage: browser, Node.js (with the `@fails-components/webtransport` package)
*
* @see https://developer.mozilla.org/en-US/docs/Web/API/WebTransport
* @see https://caniuse.com/webtransport
*/
var WT = class extends Transport {
	get name() {
		return "webtransport";
	}
	doOpen() {
		try {
			this._transport = new WebTransport(this.createUri("https"), this.opts.transportOptions[this.name]);
		} catch (err) {
			return this.emitReserved("error", err);
		}
		this._transport.closed.then(() => {
			debug$1("transport closed gracefully");
			this.onClose();
		}).catch((err) => {
			debug$1("transport closed due to %s", err);
			this.onError("webtransport error", err);
		});
		this._transport.ready.then(() => {
			this._transport.createBidirectionalStream().then((stream) => {
				const decoderStream = createPacketDecoderStream(Number.MAX_SAFE_INTEGER, this.socket.binaryType);
				const reader = stream.readable.pipeThrough(decoderStream).getReader();
				const encoderStream = createPacketEncoderStream();
				encoderStream.readable.pipeTo(stream.writable);
				this._writer = encoderStream.writable.getWriter();
				const read = () => {
					reader.read().then(({ done, value }) => {
						if (done) {
							debug$1("session is closed");
							return;
						}
						debug$1("received chunk: %o", value);
						this.onPacket(value);
						read();
					}).catch((err) => {
						debug$1("an error occurred while reading: %s", err);
					});
				};
				read();
				const packet = { type: "open" };
				if (this.query.sid) packet.data = `{"sid":"${this.query.sid}"}`;
				this._writer.write(packet).then(() => this.onOpen());
			});
		});
	}
	write(packets) {
		this.writable = false;
		for (let i = 0; i < packets.length; i++) {
			const packet = packets[i];
			const lastPacket = i === packets.length - 1;
			this._writer.write(packet).then(() => {
				if (lastPacket) nextTick(() => {
					this.writable = true;
					this.emitReserved("drain");
				}, this.setTimeoutFn);
			});
		}
	}
	doClose() {
		var _a;
		(_a = this._transport) === null || _a === void 0 || _a.close();
	}
};
//#endregion
//#region node_modules/engine.io-client/build/esm-debug/transports/index.js
var transports = {
	websocket: WS,
	webtransport: WT,
	polling: XHR
};
//#endregion
//#region node_modules/engine.io-client/build/esm-debug/contrib/parseuri.js
/**
* Parses a URI
*
* Note: we could also have used the built-in URL object, but it isn't supported on all platforms.
*
* See:
* - https://developer.mozilla.org/en-US/docs/Web/API/URL
* - https://caniuse.com/url
* - https://www.rfc-editor.org/rfc/rfc3986#appendix-B
*
* History of the parse() method:
* - first commit: https://github.com/socketio/socket.io-client/commit/4ee1d5d94b3906a9c052b459f1a818b15f38f91c
* - export into its own module: https://github.com/socketio/engine.io-client/commit/de2c561e4564efeb78f1bdb1ba39ef81b2822cb3
* - reimport: https://github.com/socketio/engine.io-client/commit/df32277c3f6d622eec5ed09f493cae3f3391d242
*
* @author Steven Levithan <stevenlevithan.com> (MIT license)
* @api private
*/
var re = /^(?:(?![^:@\/?#]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@\/?#]*)(?::([^:@\/?#]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;
var parts = [
	"source",
	"protocol",
	"authority",
	"userInfo",
	"user",
	"password",
	"host",
	"port",
	"relative",
	"path",
	"directory",
	"file",
	"query",
	"anchor"
];
function parse(str) {
	if (str.length > 8e3) throw "URI too long";
	const src = str, b = str.indexOf("["), e = str.indexOf("]");
	if (b != -1 && e != -1) str = str.substring(0, b) + str.substring(b, e).replace(/:/g, ";") + str.substring(e, str.length);
	let m = re.exec(str || ""), uri = {}, i = 14;
	while (i--) uri[parts[i]] = m[i] || "";
	if (b != -1 && e != -1) {
		uri.source = src;
		uri.host = uri.host.substring(1, uri.host.length - 1).replace(/;/g, ":");
		uri.authority = uri.authority.replace("[", "").replace("]", "").replace(/;/g, ":");
		uri.ipv6uri = true;
	}
	uri.pathNames = pathNames(uri, uri["path"]);
	uri.queryKey = queryKey(uri, uri["query"]);
	return uri;
}
function pathNames(obj, path) {
	const names = path.replace(/\/{2,9}/g, "/").split("/");
	if (path.slice(0, 1) == "/" || path.length === 0) names.splice(0, 1);
	if (path.slice(-1) == "/") names.splice(names.length - 1, 1);
	return names;
}
function queryKey(uri, query) {
	const data = {};
	query.replace(/(?:^|&)([^&=]*)=?([^&]*)/g, function($0, $1, $2) {
		if ($1) data[$1] = $2;
	});
	return data;
}
//#endregion
//#region node_modules/engine.io-client/build/esm-debug/socket.js
var debug = (0, import_src.default)("engine.io-client:socket");
var withEventListeners = typeof addEventListener === "function" && typeof removeEventListener === "function";
var OFFLINE_EVENT_LISTENERS = [];
if (withEventListeners) addEventListener("offline", () => {
	debug("closing %d connection(s) because the network was lost", OFFLINE_EVENT_LISTENERS.length);
	OFFLINE_EVENT_LISTENERS.forEach((listener) => listener());
}, false);
/**
* This class provides a WebSocket-like interface to connect to an Engine.IO server. The connection will be established
* with one of the available low-level transports, like HTTP long-polling, WebSocket or WebTransport.
*
* This class comes without upgrade mechanism, which means that it will keep the first low-level transport that
* successfully establishes the connection.
*
* In order to allow tree-shaking, there are no transports included, that's why the `transports` option is mandatory.
*
* @example
* import { SocketWithoutUpgrade, WebSocket } from "engine.io-client";
*
* const socket = new SocketWithoutUpgrade({
*   transports: [WebSocket]
* });
*
* socket.on("open", () => {
*   socket.send("hello");
* });
*
* @see SocketWithUpgrade
* @see Socket
*/
var SocketWithoutUpgrade = class SocketWithoutUpgrade extends Emitter {
	/**
	* Socket constructor.
	*
	* @param {String|Object} uri - uri or options
	* @param {Object} opts - options
	*/
	constructor(uri, opts) {
		super();
		this.binaryType = defaultBinaryType;
		this.writeBuffer = [];
		this._prevBufferLen = 0;
		this._pingInterval = -1;
		this._pingTimeout = -1;
		this._maxPayload = -1;
		/**
		* The expiration timestamp of the {@link _pingTimeoutTimer} object is tracked, in case the timer is throttled and the
		* callback is not fired on time. This can happen for example when a laptop is suspended or when a phone is locked.
		*/
		this._pingTimeoutTime = Infinity;
		if (uri && "object" === typeof uri) {
			opts = uri;
			uri = null;
		}
		if (uri) {
			const parsedUri = parse(uri);
			opts.hostname = parsedUri.host;
			opts.secure = parsedUri.protocol === "https" || parsedUri.protocol === "wss";
			opts.port = parsedUri.port;
			if (parsedUri.query) opts.query = parsedUri.query;
		} else if (opts.host) opts.hostname = parse(opts.host).host;
		installTimerFunctions(this, opts);
		this.secure = null != opts.secure ? opts.secure : typeof location !== "undefined" && "https:" === location.protocol;
		if (opts.hostname && !opts.port) opts.port = this.secure ? "443" : "80";
		this.hostname = opts.hostname || (typeof location !== "undefined" ? location.hostname : "localhost");
		this.port = opts.port || (typeof location !== "undefined" && location.port ? location.port : this.secure ? "443" : "80");
		this.transports = [];
		this._transportsByName = {};
		opts.transports.forEach((t) => {
			const transportName = t.prototype.name;
			this.transports.push(transportName);
			this._transportsByName[transportName] = t;
		});
		this.opts = Object.assign({
			path: "/engine.io",
			agent: false,
			withCredentials: false,
			upgrade: true,
			timestampParam: "t",
			rememberUpgrade: false,
			addTrailingSlash: true,
			rejectUnauthorized: true,
			perMessageDeflate: { threshold: 1024 },
			transportOptions: {},
			closeOnBeforeunload: false
		}, opts);
		this.opts.path = this.opts.path.replace(/\/$/, "") + (this.opts.addTrailingSlash ? "/" : "");
		if (typeof this.opts.query === "string") this.opts.query = decode(this.opts.query);
		if (withEventListeners) {
			if (this.opts.closeOnBeforeunload) {
				this._beforeunloadEventListener = () => {
					if (this.transport) {
						this.transport.removeAllListeners();
						this.transport.close();
					}
				};
				addEventListener("beforeunload", this._beforeunloadEventListener, false);
			}
			if (this.hostname !== "localhost") {
				debug("adding listener for the 'offline' event");
				this._offlineEventListener = () => {
					this._onClose("transport close", { description: "network connection lost" });
				};
				OFFLINE_EVENT_LISTENERS.push(this._offlineEventListener);
			}
		}
		if (this.opts.withCredentials) this._cookieJar = createCookieJar();
		this._open();
	}
	/**
	* Creates transport of the given type.
	*
	* @param {String} name - transport name
	* @return {Transport}
	* @private
	*/
	createTransport(name) {
		debug("creating transport \"%s\"", name);
		const query = Object.assign({}, this.opts.query);
		query.EIO = 4;
		query.transport = name;
		if (this.id) query.sid = this.id;
		const opts = Object.assign({}, this.opts, {
			query,
			socket: this,
			hostname: this.hostname,
			secure: this.secure,
			port: this.port
		}, this.opts.transportOptions[name]);
		debug("options: %j", opts);
		return new this._transportsByName[name](opts);
	}
	/**
	* Initializes transport to use and starts probe.
	*
	* @private
	*/
	_open() {
		if (this.transports.length === 0) {
			this.setTimeoutFn(() => {
				this.emitReserved("error", "No transports available");
			}, 0);
			return;
		}
		const transportName = this.opts.rememberUpgrade && SocketWithoutUpgrade.priorWebsocketSuccess && this.transports.indexOf("websocket") !== -1 ? "websocket" : this.transports[0];
		this.readyState = "opening";
		const transport = this.createTransport(transportName);
		transport.open();
		this.setTransport(transport);
	}
	/**
	* Sets the current transport. Disables the existing one (if any).
	*
	* @private
	*/
	setTransport(transport) {
		debug("setting transport %s", transport.name);
		if (this.transport) {
			debug("clearing existing transport %s", this.transport.name);
			this.transport.removeAllListeners();
		}
		this.transport = transport;
		transport.on("drain", this._onDrain.bind(this)).on("packet", this._onPacket.bind(this)).on("error", this._onError.bind(this)).on("close", (reason) => this._onClose("transport close", reason));
	}
	/**
	* Called when connection is deemed open.
	*
	* @private
	*/
	onOpen() {
		debug("socket open");
		this.readyState = "open";
		SocketWithoutUpgrade.priorWebsocketSuccess = "websocket" === this.transport.name;
		this.emitReserved("open");
		this.flush();
	}
	/**
	* Handles a packet.
	*
	* @private
	*/
	_onPacket(packet) {
		if ("opening" === this.readyState || "open" === this.readyState || "closing" === this.readyState) {
			debug("socket receive: type \"%s\", data \"%s\"", packet.type, packet.data);
			this.emitReserved("packet", packet);
			this.emitReserved("heartbeat");
			switch (packet.type) {
				case "open":
					this.onHandshake(JSON.parse(packet.data));
					break;
				case "ping":
					this._sendPacket("pong");
					this.emitReserved("ping");
					this.emitReserved("pong");
					this._resetPingTimeout();
					break;
				case "error":
					const err = /* @__PURE__ */ new Error("server error");
					err.code = packet.data;
					this._onError(err);
					break;
				case "message":
					this.emitReserved("data", packet.data);
					this.emitReserved("message", packet.data);
			}
		} else debug("packet received with socket readyState \"%s\"", this.readyState);
	}
	/**
	* Called upon handshake completion.
	*
	* @param {Object} data - handshake obj
	* @private
	*/
	onHandshake(data) {
		this.emitReserved("handshake", data);
		this.id = data.sid;
		this.transport.query.sid = data.sid;
		this._pingInterval = data.pingInterval;
		this._pingTimeout = data.pingTimeout;
		this._maxPayload = data.maxPayload;
		this.onOpen();
		if ("closed" === this.readyState) return;
		this._resetPingTimeout();
	}
	/**
	* Sets and resets ping timeout timer based on server pings.
	*
	* @private
	*/
	_resetPingTimeout() {
		this.clearTimeoutFn(this._pingTimeoutTimer);
		const delay = this._pingInterval + this._pingTimeout;
		this._pingTimeoutTime = Date.now() + delay;
		this._pingTimeoutTimer = this.setTimeoutFn(() => {
			this._onClose("ping timeout");
		}, delay);
		if (this.opts.autoUnref) this._pingTimeoutTimer.unref();
	}
	/**
	* Called on `drain` event
	*
	* @private
	*/
	_onDrain() {
		this.writeBuffer.splice(0, this._prevBufferLen);
		this._prevBufferLen = 0;
		if (0 === this.writeBuffer.length) this.emitReserved("drain");
		else this.flush();
	}
	/**
	* Flush write buffers.
	*
	* @private
	*/
	flush() {
		if ("closed" !== this.readyState && this.transport.writable && !this.upgrading && this.writeBuffer.length) {
			const packets = this._getWritablePackets();
			debug("flushing %d packets in socket", packets.length);
			this.transport.send(packets);
			this._prevBufferLen = packets.length;
			this.emitReserved("flush");
		}
	}
	/**
	* Ensure the encoded size of the writeBuffer is below the maxPayload value sent by the server (only for HTTP
	* long-polling)
	*
	* @private
	*/
	_getWritablePackets() {
		if (!(this._maxPayload && this.transport.name === "polling" && this.writeBuffer.length > 1)) return this.writeBuffer;
		let payloadSize = 1;
		for (let i = 0; i < this.writeBuffer.length; i++) {
			const data = this.writeBuffer[i].data;
			if (data) payloadSize += byteLength(data);
			if (i > 0 && payloadSize > this._maxPayload) {
				debug("only send %d out of %d packets", i, this.writeBuffer.length);
				return this.writeBuffer.slice(0, i);
			}
			payloadSize += 2;
		}
		debug("payload size is %d (max: %d)", payloadSize, this._maxPayload);
		return this.writeBuffer;
	}
	/**
	* Checks whether the heartbeat timer has expired but the socket has not yet been notified.
	*
	* Note: this method is private for now because it does not really fit the WebSocket API, but if we put it in the
	* `write()` method then the message would not be buffered by the Socket.IO client.
	*
	* @return {boolean}
	* @private
	*/
	_hasPingExpired() {
		if (!this._pingTimeoutTime) return true;
		const hasExpired = Date.now() > this._pingTimeoutTime;
		if (hasExpired) {
			debug("throttled timer detected, scheduling connection close");
			this._pingTimeoutTime = 0;
			nextTick(() => {
				this._onClose("ping timeout");
			}, this.setTimeoutFn);
		}
		return hasExpired;
	}
	/**
	* Sends a message.
	*
	* @param {String} msg - message.
	* @param {Object} options.
	* @param {Function} fn - callback function.
	* @return {Socket} for chaining.
	*/
	write(msg, options, fn) {
		this._sendPacket("message", msg, options, fn);
		return this;
	}
	/**
	* Sends a message. Alias of {@link Socket#write}.
	*
	* @param {String} msg - message.
	* @param {Object} options.
	* @param {Function} fn - callback function.
	* @return {Socket} for chaining.
	*/
	send(msg, options, fn) {
		this._sendPacket("message", msg, options, fn);
		return this;
	}
	/**
	* Sends a packet.
	*
	* @param {String} type - packet type.
	* @param {String} data.
	* @param {Object} options.
	* @param {Function} fn - callback function.
	* @private
	*/
	_sendPacket(type, data, options, fn) {
		if ("function" === typeof data) {
			fn = data;
			data = void 0;
		}
		if ("function" === typeof options) {
			fn = options;
			options = null;
		}
		if ("closing" === this.readyState || "closed" === this.readyState) return;
		options = options || {};
		options.compress = false !== options.compress;
		const packet = {
			type,
			data,
			options
		};
		this.emitReserved("packetCreate", packet);
		this.writeBuffer.push(packet);
		if (fn) this.once("flush", fn);
		this.flush();
	}
	/**
	* Closes the connection.
	*/
	close() {
		const close = () => {
			this._onClose("forced close");
			debug("socket closing - telling transport to close");
			this.transport.close();
		};
		const cleanupAndClose = () => {
			this.off("upgrade", cleanupAndClose);
			this.off("upgradeError", cleanupAndClose);
			close();
		};
		const waitForUpgrade = () => {
			this.once("upgrade", cleanupAndClose);
			this.once("upgradeError", cleanupAndClose);
		};
		if ("opening" === this.readyState || "open" === this.readyState) {
			this.readyState = "closing";
			if (this.writeBuffer.length) this.once("drain", () => {
				if (this.upgrading) waitForUpgrade();
				else close();
			});
			else if (this.upgrading) waitForUpgrade();
			else close();
		}
		return this;
	}
	/**
	* Called upon transport error
	*
	* @private
	*/
	_onError(err) {
		debug("socket error %j", err);
		SocketWithoutUpgrade.priorWebsocketSuccess = false;
		if (this.opts.tryAllTransports && this.transports.length > 1 && this.readyState === "opening") {
			debug("trying next transport");
			this.transports.shift();
			return this._open();
		}
		this.emitReserved("error", err);
		this._onClose("transport error", err);
	}
	/**
	* Called upon transport close.
	*
	* @private
	*/
	_onClose(reason, description) {
		if ("opening" === this.readyState || "open" === this.readyState || "closing" === this.readyState) {
			debug("socket close with reason: \"%s\"", reason);
			this.clearTimeoutFn(this._pingTimeoutTimer);
			this.transport.removeAllListeners("close");
			this.transport.close();
			this.transport.removeAllListeners();
			if (withEventListeners) {
				if (this._beforeunloadEventListener) removeEventListener("beforeunload", this._beforeunloadEventListener, false);
				if (this._offlineEventListener) {
					const i = OFFLINE_EVENT_LISTENERS.indexOf(this._offlineEventListener);
					if (i !== -1) {
						debug("removing listener for the 'offline' event");
						OFFLINE_EVENT_LISTENERS.splice(i, 1);
					}
				}
			}
			this.readyState = "closed";
			this.id = null;
			this.emitReserved("close", reason, description);
			this.writeBuffer = [];
			this._prevBufferLen = 0;
		}
	}
};
SocketWithoutUpgrade.protocol = 4;
/**
* This class provides a WebSocket-like interface to connect to an Engine.IO server. The connection will be established
* with one of the available low-level transports, like HTTP long-polling, WebSocket or WebTransport.
*
* This class comes with an upgrade mechanism, which means that once the connection is established with the first
* low-level transport, it will try to upgrade to a better transport.
*
* In order to allow tree-shaking, there are no transports included, that's why the `transports` option is mandatory.
*
* @example
* import { SocketWithUpgrade, WebSocket } from "engine.io-client";
*
* const socket = new SocketWithUpgrade({
*   transports: [WebSocket]
* });
*
* socket.on("open", () => {
*   socket.send("hello");
* });
*
* @see SocketWithoutUpgrade
* @see Socket
*/
var SocketWithUpgrade = class extends SocketWithoutUpgrade {
	constructor() {
		super(...arguments);
		this._upgrades = [];
	}
	onOpen() {
		super.onOpen();
		if ("open" === this.readyState && this.opts.upgrade) {
			debug("starting upgrade probes");
			for (let i = 0; i < this._upgrades.length; i++) this._probe(this._upgrades[i]);
		}
	}
	/**
	* Probes a transport.
	*
	* @param {String} name - transport name
	* @private
	*/
	_probe(name) {
		debug("probing transport \"%s\"", name);
		let transport = this.createTransport(name);
		let failed = false;
		SocketWithoutUpgrade.priorWebsocketSuccess = false;
		const onTransportOpen = () => {
			if (failed) return;
			debug("probe transport \"%s\" opened", name);
			transport.send([{
				type: "ping",
				data: "probe"
			}]);
			transport.once("packet", (msg) => {
				if (failed) return;
				if ("pong" === msg.type && "probe" === msg.data) {
					debug("probe transport \"%s\" pong", name);
					this.upgrading = true;
					this.emitReserved("upgrading", transport);
					if (!transport) return;
					SocketWithoutUpgrade.priorWebsocketSuccess = "websocket" === transport.name;
					debug("pausing current transport \"%s\"", this.transport.name);
					this.transport.pause(() => {
						if (failed) return;
						if ("closed" === this.readyState) return;
						debug("changing transport and sending upgrade packet");
						cleanup();
						this.setTransport(transport);
						transport.send([{ type: "upgrade" }]);
						this.emitReserved("upgrade", transport);
						transport = null;
						this.upgrading = false;
						this.flush();
					});
				} else {
					debug("probe transport \"%s\" failed", name);
					const err = /* @__PURE__ */ new Error("probe error");
					err.transport = transport.name;
					this.emitReserved("upgradeError", err);
				}
			});
		};
		function freezeTransport() {
			if (failed) return;
			failed = true;
			cleanup();
			transport.close();
			transport = null;
		}
		const onerror = (err) => {
			const error = /* @__PURE__ */ new Error("probe error: " + err);
			error.transport = transport.name;
			freezeTransport();
			debug("probe transport \"%s\" failed because of error: %s", name, err);
			this.emitReserved("upgradeError", error);
		};
		function onTransportClose() {
			onerror("transport closed");
		}
		function onclose() {
			onerror("socket closed");
		}
		function onupgrade(to) {
			if (transport && to.name !== transport.name) {
				debug("\"%s\" works - aborting \"%s\"", to.name, transport.name);
				freezeTransport();
			}
		}
		const cleanup = () => {
			transport.removeListener("open", onTransportOpen);
			transport.removeListener("error", onerror);
			transport.removeListener("close", onTransportClose);
			this.off("close", onclose);
			this.off("upgrading", onupgrade);
		};
		transport.once("open", onTransportOpen);
		transport.once("error", onerror);
		transport.once("close", onTransportClose);
		this.once("close", onclose);
		this.once("upgrading", onupgrade);
		if (this._upgrades.indexOf("webtransport") !== -1 && name !== "webtransport") this.setTimeoutFn(() => {
			if (!failed) transport.open();
		}, 200);
		else transport.open();
	}
	onHandshake(data) {
		this._upgrades = this._filterUpgrades(data.upgrades);
		super.onHandshake(data);
	}
	/**
	* Filters upgrades, returning only those matching client transports.
	*
	* @param {Array} upgrades - server upgrades
	* @private
	*/
	_filterUpgrades(upgrades) {
		const filteredUpgrades = [];
		for (let i = 0; i < upgrades.length; i++) if (~this.transports.indexOf(upgrades[i])) filteredUpgrades.push(upgrades[i]);
		return filteredUpgrades;
	}
};
/**
* This class provides a WebSocket-like interface to connect to an Engine.IO server. The connection will be established
* with one of the available low-level transports, like HTTP long-polling, WebSocket or WebTransport.
*
* This class comes with an upgrade mechanism, which means that once the connection is established with the first
* low-level transport, it will try to upgrade to a better transport.
*
* @example
* import { Socket } from "engine.io-client";
*
* const socket = new Socket();
*
* socket.on("open", () => {
*   socket.send("hello");
* });
*
* @see SocketWithoutUpgrade
* @see SocketWithUpgrade
*/
var Socket = class extends SocketWithUpgrade {
	constructor(uri, opts = {}) {
		const isOptionsOnly = typeof uri === "object";
		const o = isOptionsOnly ? { ...uri } : { ...opts };
		if (!o.transports || o.transports && typeof o.transports[0] === "string") o.transports = (o.transports || [
			"polling",
			"websocket",
			"webtransport"
		]).map((transportName) => transports[transportName]).filter((t) => !!t);
		super(isOptionsOnly ? o : uri, o);
	}
};
Socket.protocol;
//#endregion
export { nextTick as i, parse as n, installTimerFunctions as r, Socket as t };
