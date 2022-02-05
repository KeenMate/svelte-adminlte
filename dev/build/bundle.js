
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function compute_rest_props(props, keys) {
        const rest = {};
        keys = new Set(keys);
        for (const k in props)
            if (!keys.has(k) && k[0] !== '$')
                rest[k] = props[k];
        return rest;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.44.3' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function getDefaultExportFromCjs (x) {
    	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
    }

    function createCommonjsModule(fn, basedir, module) {
    	return module = {
    		path: basedir,
    		exports: {},
    		require: function (path, base) {
    			return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
    		}
    	}, fn(module, module.exports), module.exports;
    }

    function commonjsRequire () {
    	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
    }

    var quill = createCommonjsModule(function (module, exports) {
    /*!
     * Quill Editor v1.3.7
     * https://quilljs.com/
     * Copyright (c) 2014, Jason Chen
     * Copyright (c) 2013, salesforce.com
     */
    (function webpackUniversalModuleDefinition(root, factory) {
    	module.exports = factory();
    })(typeof self !== 'undefined' ? self : commonjsGlobal, function() {
    return /******/ (function(modules) { // webpackBootstrap
    /******/ 	// The module cache
    /******/ 	var installedModules = {};
    /******/
    /******/ 	// The require function
    /******/ 	function __webpack_require__(moduleId) {
    /******/
    /******/ 		// Check if module is in cache
    /******/ 		if(installedModules[moduleId]) {
    /******/ 			return installedModules[moduleId].exports;
    /******/ 		}
    /******/ 		// Create a new module (and put it into the cache)
    /******/ 		var module = installedModules[moduleId] = {
    /******/ 			i: moduleId,
    /******/ 			l: false,
    /******/ 			exports: {}
    /******/ 		};
    /******/
    /******/ 		// Execute the module function
    /******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
    /******/
    /******/ 		// Flag the module as loaded
    /******/ 		module.l = true;
    /******/
    /******/ 		// Return the exports of the module
    /******/ 		return module.exports;
    /******/ 	}
    /******/
    /******/
    /******/ 	// expose the modules object (__webpack_modules__)
    /******/ 	__webpack_require__.m = modules;
    /******/
    /******/ 	// expose the module cache
    /******/ 	__webpack_require__.c = installedModules;
    /******/
    /******/ 	// define getter function for harmony exports
    /******/ 	__webpack_require__.d = function(exports, name, getter) {
    /******/ 		if(!__webpack_require__.o(exports, name)) {
    /******/ 			Object.defineProperty(exports, name, {
    /******/ 				configurable: false,
    /******/ 				enumerable: true,
    /******/ 				get: getter
    /******/ 			});
    /******/ 		}
    /******/ 	};
    /******/
    /******/ 	// getDefaultExport function for compatibility with non-harmony modules
    /******/ 	__webpack_require__.n = function(module) {
    /******/ 		var getter = module && module.__esModule ?
    /******/ 			function getDefault() { return module['default']; } :
    /******/ 			function getModuleExports() { return module; };
    /******/ 		__webpack_require__.d(getter, 'a', getter);
    /******/ 		return getter;
    /******/ 	};
    /******/
    /******/ 	// Object.prototype.hasOwnProperty.call
    /******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
    /******/
    /******/ 	// __webpack_public_path__
    /******/ 	__webpack_require__.p = "";
    /******/
    /******/ 	// Load entry module and return exports
    /******/ 	return __webpack_require__(__webpack_require__.s = 109);
    /******/ })
    /************************************************************************/
    /******/ ([
    /* 0 */
    /***/ (function(module, exports, __webpack_require__) {

    Object.defineProperty(exports, "__esModule", { value: true });
    var container_1 = __webpack_require__(17);
    var format_1 = __webpack_require__(18);
    var leaf_1 = __webpack_require__(19);
    var scroll_1 = __webpack_require__(45);
    var inline_1 = __webpack_require__(46);
    var block_1 = __webpack_require__(47);
    var embed_1 = __webpack_require__(48);
    var text_1 = __webpack_require__(49);
    var attributor_1 = __webpack_require__(12);
    var class_1 = __webpack_require__(32);
    var style_1 = __webpack_require__(33);
    var store_1 = __webpack_require__(31);
    var Registry = __webpack_require__(1);
    var Parchment = {
        Scope: Registry.Scope,
        create: Registry.create,
        find: Registry.find,
        query: Registry.query,
        register: Registry.register,
        Container: container_1.default,
        Format: format_1.default,
        Leaf: leaf_1.default,
        Embed: embed_1.default,
        Scroll: scroll_1.default,
        Block: block_1.default,
        Inline: inline_1.default,
        Text: text_1.default,
        Attributor: {
            Attribute: attributor_1.default,
            Class: class_1.default,
            Style: style_1.default,
            Store: store_1.default,
        },
    };
    exports.default = Parchment;


    /***/ }),
    /* 1 */
    /***/ (function(module, exports, __webpack_require__) {

    var __extends = (this && this.__extends) || (function () {
        var extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    var ParchmentError = /** @class */ (function (_super) {
        __extends(ParchmentError, _super);
        function ParchmentError(message) {
            var _this = this;
            message = '[Parchment] ' + message;
            _this = _super.call(this, message) || this;
            _this.message = message;
            _this.name = _this.constructor.name;
            return _this;
        }
        return ParchmentError;
    }(Error));
    exports.ParchmentError = ParchmentError;
    var attributes = {};
    var classes = {};
    var tags = {};
    var types = {};
    exports.DATA_KEY = '__blot';
    var Scope;
    (function (Scope) {
        Scope[Scope["TYPE"] = 3] = "TYPE";
        Scope[Scope["LEVEL"] = 12] = "LEVEL";
        Scope[Scope["ATTRIBUTE"] = 13] = "ATTRIBUTE";
        Scope[Scope["BLOT"] = 14] = "BLOT";
        Scope[Scope["INLINE"] = 7] = "INLINE";
        Scope[Scope["BLOCK"] = 11] = "BLOCK";
        Scope[Scope["BLOCK_BLOT"] = 10] = "BLOCK_BLOT";
        Scope[Scope["INLINE_BLOT"] = 6] = "INLINE_BLOT";
        Scope[Scope["BLOCK_ATTRIBUTE"] = 9] = "BLOCK_ATTRIBUTE";
        Scope[Scope["INLINE_ATTRIBUTE"] = 5] = "INLINE_ATTRIBUTE";
        Scope[Scope["ANY"] = 15] = "ANY";
    })(Scope = exports.Scope || (exports.Scope = {}));
    function create(input, value) {
        var match = query(input);
        if (match == null) {
            throw new ParchmentError("Unable to create " + input + " blot");
        }
        var BlotClass = match;
        var node = 
        // @ts-ignore
        input instanceof Node || input['nodeType'] === Node.TEXT_NODE ? input : BlotClass.create(value);
        return new BlotClass(node, value);
    }
    exports.create = create;
    function find(node, bubble) {
        if (bubble === void 0) { bubble = false; }
        if (node == null)
            return null;
        // @ts-ignore
        if (node[exports.DATA_KEY] != null)
            return node[exports.DATA_KEY].blot;
        if (bubble)
            return find(node.parentNode, bubble);
        return null;
    }
    exports.find = find;
    function query(query, scope) {
        if (scope === void 0) { scope = Scope.ANY; }
        var match;
        if (typeof query === 'string') {
            match = types[query] || attributes[query];
            // @ts-ignore
        }
        else if (query instanceof Text || query['nodeType'] === Node.TEXT_NODE) {
            match = types['text'];
        }
        else if (typeof query === 'number') {
            if (query & Scope.LEVEL & Scope.BLOCK) {
                match = types['block'];
            }
            else if (query & Scope.LEVEL & Scope.INLINE) {
                match = types['inline'];
            }
        }
        else if (query instanceof HTMLElement) {
            var names = (query.getAttribute('class') || '').split(/\s+/);
            for (var i in names) {
                match = classes[names[i]];
                if (match)
                    break;
            }
            match = match || tags[query.tagName];
        }
        if (match == null)
            return null;
        // @ts-ignore
        if (scope & Scope.LEVEL & match.scope && scope & Scope.TYPE & match.scope)
            return match;
        return null;
    }
    exports.query = query;
    function register() {
        var Definitions = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            Definitions[_i] = arguments[_i];
        }
        if (Definitions.length > 1) {
            return Definitions.map(function (d) {
                return register(d);
            });
        }
        var Definition = Definitions[0];
        if (typeof Definition.blotName !== 'string' && typeof Definition.attrName !== 'string') {
            throw new ParchmentError('Invalid definition');
        }
        else if (Definition.blotName === 'abstract') {
            throw new ParchmentError('Cannot register abstract class');
        }
        types[Definition.blotName || Definition.attrName] = Definition;
        if (typeof Definition.keyName === 'string') {
            attributes[Definition.keyName] = Definition;
        }
        else {
            if (Definition.className != null) {
                classes[Definition.className] = Definition;
            }
            if (Definition.tagName != null) {
                if (Array.isArray(Definition.tagName)) {
                    Definition.tagName = Definition.tagName.map(function (tagName) {
                        return tagName.toUpperCase();
                    });
                }
                else {
                    Definition.tagName = Definition.tagName.toUpperCase();
                }
                var tagNames = Array.isArray(Definition.tagName) ? Definition.tagName : [Definition.tagName];
                tagNames.forEach(function (tag) {
                    if (tags[tag] == null || Definition.className == null) {
                        tags[tag] = Definition;
                    }
                });
            }
        }
        return Definition;
    }
    exports.register = register;


    /***/ }),
    /* 2 */
    /***/ (function(module, exports, __webpack_require__) {

    var diff = __webpack_require__(51);
    var equal = __webpack_require__(11);
    var extend = __webpack_require__(3);
    var op = __webpack_require__(20);


    var NULL_CHARACTER = String.fromCharCode(0);  // Placeholder char for embed in diff()


    var Delta = function (ops) {
      // Assume we are given a well formed ops
      if (Array.isArray(ops)) {
        this.ops = ops;
      } else if (ops != null && Array.isArray(ops.ops)) {
        this.ops = ops.ops;
      } else {
        this.ops = [];
      }
    };


    Delta.prototype.insert = function (text, attributes) {
      var newOp = {};
      if (text.length === 0) return this;
      newOp.insert = text;
      if (attributes != null && typeof attributes === 'object' && Object.keys(attributes).length > 0) {
        newOp.attributes = attributes;
      }
      return this.push(newOp);
    };

    Delta.prototype['delete'] = function (length) {
      if (length <= 0) return this;
      return this.push({ 'delete': length });
    };

    Delta.prototype.retain = function (length, attributes) {
      if (length <= 0) return this;
      var newOp = { retain: length };
      if (attributes != null && typeof attributes === 'object' && Object.keys(attributes).length > 0) {
        newOp.attributes = attributes;
      }
      return this.push(newOp);
    };

    Delta.prototype.push = function (newOp) {
      var index = this.ops.length;
      var lastOp = this.ops[index - 1];
      newOp = extend(true, {}, newOp);
      if (typeof lastOp === 'object') {
        if (typeof newOp['delete'] === 'number' && typeof lastOp['delete'] === 'number') {
          this.ops[index - 1] = { 'delete': lastOp['delete'] + newOp['delete'] };
          return this;
        }
        // Since it does not matter if we insert before or after deleting at the same index,
        // always prefer to insert first
        if (typeof lastOp['delete'] === 'number' && newOp.insert != null) {
          index -= 1;
          lastOp = this.ops[index - 1];
          if (typeof lastOp !== 'object') {
            this.ops.unshift(newOp);
            return this;
          }
        }
        if (equal(newOp.attributes, lastOp.attributes)) {
          if (typeof newOp.insert === 'string' && typeof lastOp.insert === 'string') {
            this.ops[index - 1] = { insert: lastOp.insert + newOp.insert };
            if (typeof newOp.attributes === 'object') this.ops[index - 1].attributes = newOp.attributes;
            return this;
          } else if (typeof newOp.retain === 'number' && typeof lastOp.retain === 'number') {
            this.ops[index - 1] = { retain: lastOp.retain + newOp.retain };
            if (typeof newOp.attributes === 'object') this.ops[index - 1].attributes = newOp.attributes;
            return this;
          }
        }
      }
      if (index === this.ops.length) {
        this.ops.push(newOp);
      } else {
        this.ops.splice(index, 0, newOp);
      }
      return this;
    };

    Delta.prototype.chop = function () {
      var lastOp = this.ops[this.ops.length - 1];
      if (lastOp && lastOp.retain && !lastOp.attributes) {
        this.ops.pop();
      }
      return this;
    };

    Delta.prototype.filter = function (predicate) {
      return this.ops.filter(predicate);
    };

    Delta.prototype.forEach = function (predicate) {
      this.ops.forEach(predicate);
    };

    Delta.prototype.map = function (predicate) {
      return this.ops.map(predicate);
    };

    Delta.prototype.partition = function (predicate) {
      var passed = [], failed = [];
      this.forEach(function(op) {
        var target = predicate(op) ? passed : failed;
        target.push(op);
      });
      return [passed, failed];
    };

    Delta.prototype.reduce = function (predicate, initial) {
      return this.ops.reduce(predicate, initial);
    };

    Delta.prototype.changeLength = function () {
      return this.reduce(function (length, elem) {
        if (elem.insert) {
          return length + op.length(elem);
        } else if (elem.delete) {
          return length - elem.delete;
        }
        return length;
      }, 0);
    };

    Delta.prototype.length = function () {
      return this.reduce(function (length, elem) {
        return length + op.length(elem);
      }, 0);
    };

    Delta.prototype.slice = function (start, end) {
      start = start || 0;
      if (typeof end !== 'number') end = Infinity;
      var ops = [];
      var iter = op.iterator(this.ops);
      var index = 0;
      while (index < end && iter.hasNext()) {
        var nextOp;
        if (index < start) {
          nextOp = iter.next(start - index);
        } else {
          nextOp = iter.next(end - index);
          ops.push(nextOp);
        }
        index += op.length(nextOp);
      }
      return new Delta(ops);
    };


    Delta.prototype.compose = function (other) {
      var thisIter = op.iterator(this.ops);
      var otherIter = op.iterator(other.ops);
      var ops = [];
      var firstOther = otherIter.peek();
      if (firstOther != null && typeof firstOther.retain === 'number' && firstOther.attributes == null) {
        var firstLeft = firstOther.retain;
        while (thisIter.peekType() === 'insert' && thisIter.peekLength() <= firstLeft) {
          firstLeft -= thisIter.peekLength();
          ops.push(thisIter.next());
        }
        if (firstOther.retain - firstLeft > 0) {
          otherIter.next(firstOther.retain - firstLeft);
        }
      }
      var delta = new Delta(ops);
      while (thisIter.hasNext() || otherIter.hasNext()) {
        if (otherIter.peekType() === 'insert') {
          delta.push(otherIter.next());
        } else if (thisIter.peekType() === 'delete') {
          delta.push(thisIter.next());
        } else {
          var length = Math.min(thisIter.peekLength(), otherIter.peekLength());
          var thisOp = thisIter.next(length);
          var otherOp = otherIter.next(length);
          if (typeof otherOp.retain === 'number') {
            var newOp = {};
            if (typeof thisOp.retain === 'number') {
              newOp.retain = length;
            } else {
              newOp.insert = thisOp.insert;
            }
            // Preserve null when composing with a retain, otherwise remove it for inserts
            var attributes = op.attributes.compose(thisOp.attributes, otherOp.attributes, typeof thisOp.retain === 'number');
            if (attributes) newOp.attributes = attributes;
            delta.push(newOp);

            // Optimization if rest of other is just retain
            if (!otherIter.hasNext() && equal(delta.ops[delta.ops.length - 1], newOp)) {
              var rest = new Delta(thisIter.rest());
              return delta.concat(rest).chop();
            }

          // Other op should be delete, we could be an insert or retain
          // Insert + delete cancels out
          } else if (typeof otherOp['delete'] === 'number' && typeof thisOp.retain === 'number') {
            delta.push(otherOp);
          }
        }
      }
      return delta.chop();
    };

    Delta.prototype.concat = function (other) {
      var delta = new Delta(this.ops.slice());
      if (other.ops.length > 0) {
        delta.push(other.ops[0]);
        delta.ops = delta.ops.concat(other.ops.slice(1));
      }
      return delta;
    };

    Delta.prototype.diff = function (other, index) {
      if (this.ops === other.ops) {
        return new Delta();
      }
      var strings = [this, other].map(function (delta) {
        return delta.map(function (op) {
          if (op.insert != null) {
            return typeof op.insert === 'string' ? op.insert : NULL_CHARACTER;
          }
          var prep = (delta === other) ? 'on' : 'with';
          throw new Error('diff() called ' + prep + ' non-document');
        }).join('');
      });
      var delta = new Delta();
      var diffResult = diff(strings[0], strings[1], index);
      var thisIter = op.iterator(this.ops);
      var otherIter = op.iterator(other.ops);
      diffResult.forEach(function (component) {
        var length = component[1].length;
        while (length > 0) {
          var opLength = 0;
          switch (component[0]) {
            case diff.INSERT:
              opLength = Math.min(otherIter.peekLength(), length);
              delta.push(otherIter.next(opLength));
              break;
            case diff.DELETE:
              opLength = Math.min(length, thisIter.peekLength());
              thisIter.next(opLength);
              delta['delete'](opLength);
              break;
            case diff.EQUAL:
              opLength = Math.min(thisIter.peekLength(), otherIter.peekLength(), length);
              var thisOp = thisIter.next(opLength);
              var otherOp = otherIter.next(opLength);
              if (equal(thisOp.insert, otherOp.insert)) {
                delta.retain(opLength, op.attributes.diff(thisOp.attributes, otherOp.attributes));
              } else {
                delta.push(otherOp)['delete'](opLength);
              }
              break;
          }
          length -= opLength;
        }
      });
      return delta.chop();
    };

    Delta.prototype.eachLine = function (predicate, newline) {
      newline = newline || '\n';
      var iter = op.iterator(this.ops);
      var line = new Delta();
      var i = 0;
      while (iter.hasNext()) {
        if (iter.peekType() !== 'insert') return;
        var thisOp = iter.peek();
        var start = op.length(thisOp) - iter.peekLength();
        var index = typeof thisOp.insert === 'string' ?
          thisOp.insert.indexOf(newline, start) - start : -1;
        if (index < 0) {
          line.push(iter.next());
        } else if (index > 0) {
          line.push(iter.next(index));
        } else {
          if (predicate(line, iter.next(1).attributes || {}, i) === false) {
            return;
          }
          i += 1;
          line = new Delta();
        }
      }
      if (line.length() > 0) {
        predicate(line, {}, i);
      }
    };

    Delta.prototype.transform = function (other, priority) {
      priority = !!priority;
      if (typeof other === 'number') {
        return this.transformPosition(other, priority);
      }
      var thisIter = op.iterator(this.ops);
      var otherIter = op.iterator(other.ops);
      var delta = new Delta();
      while (thisIter.hasNext() || otherIter.hasNext()) {
        if (thisIter.peekType() === 'insert' && (priority || otherIter.peekType() !== 'insert')) {
          delta.retain(op.length(thisIter.next()));
        } else if (otherIter.peekType() === 'insert') {
          delta.push(otherIter.next());
        } else {
          var length = Math.min(thisIter.peekLength(), otherIter.peekLength());
          var thisOp = thisIter.next(length);
          var otherOp = otherIter.next(length);
          if (thisOp['delete']) {
            // Our delete either makes their delete redundant or removes their retain
            continue;
          } else if (otherOp['delete']) {
            delta.push(otherOp);
          } else {
            // We retain either their retain or insert
            delta.retain(length, op.attributes.transform(thisOp.attributes, otherOp.attributes, priority));
          }
        }
      }
      return delta.chop();
    };

    Delta.prototype.transformPosition = function (index, priority) {
      priority = !!priority;
      var thisIter = op.iterator(this.ops);
      var offset = 0;
      while (thisIter.hasNext() && offset <= index) {
        var length = thisIter.peekLength();
        var nextType = thisIter.peekType();
        thisIter.next();
        if (nextType === 'delete') {
          index -= Math.min(length, index - offset);
          continue;
        } else if (nextType === 'insert' && (offset < index || !priority)) {
          index += length;
        }
        offset += length;
      }
      return index;
    };


    module.exports = Delta;


    /***/ }),
    /* 3 */
    /***/ (function(module, exports) {

    var hasOwn = Object.prototype.hasOwnProperty;
    var toStr = Object.prototype.toString;
    var defineProperty = Object.defineProperty;
    var gOPD = Object.getOwnPropertyDescriptor;

    var isArray = function isArray(arr) {
    	if (typeof Array.isArray === 'function') {
    		return Array.isArray(arr);
    	}

    	return toStr.call(arr) === '[object Array]';
    };

    var isPlainObject = function isPlainObject(obj) {
    	if (!obj || toStr.call(obj) !== '[object Object]') {
    		return false;
    	}

    	var hasOwnConstructor = hasOwn.call(obj, 'constructor');
    	var hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
    	// Not own constructor property must be Object
    	if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
    		return false;
    	}

    	// Own properties are enumerated firstly, so to speed up,
    	// if last one is own, then all properties are own.
    	var key;
    	for (key in obj) { /**/ }

    	return typeof key === 'undefined' || hasOwn.call(obj, key);
    };

    // If name is '__proto__', and Object.defineProperty is available, define __proto__ as an own property on target
    var setProperty = function setProperty(target, options) {
    	if (defineProperty && options.name === '__proto__') {
    		defineProperty(target, options.name, {
    			enumerable: true,
    			configurable: true,
    			value: options.newValue,
    			writable: true
    		});
    	} else {
    		target[options.name] = options.newValue;
    	}
    };

    // Return undefined instead of __proto__ if '__proto__' is not an own property
    var getProperty = function getProperty(obj, name) {
    	if (name === '__proto__') {
    		if (!hasOwn.call(obj, name)) {
    			return void 0;
    		} else if (gOPD) {
    			// In early versions of node, obj['__proto__'] is buggy when obj has
    			// __proto__ as an own property. Object.getOwnPropertyDescriptor() works.
    			return gOPD(obj, name).value;
    		}
    	}

    	return obj[name];
    };

    module.exports = function extend() {
    	var options, name, src, copy, copyIsArray, clone;
    	var target = arguments[0];
    	var i = 1;
    	var length = arguments.length;
    	var deep = false;

    	// Handle a deep copy situation
    	if (typeof target === 'boolean') {
    		deep = target;
    		target = arguments[1] || {};
    		// skip the boolean and the target
    		i = 2;
    	}
    	if (target == null || (typeof target !== 'object' && typeof target !== 'function')) {
    		target = {};
    	}

    	for (; i < length; ++i) {
    		options = arguments[i];
    		// Only deal with non-null/undefined values
    		if (options != null) {
    			// Extend the base object
    			for (name in options) {
    				src = getProperty(target, name);
    				copy = getProperty(options, name);

    				// Prevent never-ending loop
    				if (target !== copy) {
    					// Recurse if we're merging plain objects or arrays
    					if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
    						if (copyIsArray) {
    							copyIsArray = false;
    							clone = src && isArray(src) ? src : [];
    						} else {
    							clone = src && isPlainObject(src) ? src : {};
    						}

    						// Never move original objects, clone them
    						setProperty(target, { name: name, newValue: extend(deep, clone, copy) });

    					// Don't bring in undefined values
    					} else if (typeof copy !== 'undefined') {
    						setProperty(target, { name: name, newValue: copy });
    					}
    				}
    			}
    		}
    	}

    	// Return the modified object
    	return target;
    };


    /***/ }),
    /* 4 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = exports.BlockEmbed = exports.bubbleFormats = undefined;

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    var _extend = __webpack_require__(3);

    var _extend2 = _interopRequireDefault(_extend);

    var _quillDelta = __webpack_require__(2);

    var _quillDelta2 = _interopRequireDefault(_quillDelta);

    var _parchment = __webpack_require__(0);

    var _parchment2 = _interopRequireDefault(_parchment);

    var _break = __webpack_require__(16);

    var _break2 = _interopRequireDefault(_break);

    var _inline = __webpack_require__(6);

    var _inline2 = _interopRequireDefault(_inline);

    var _text = __webpack_require__(7);

    var _text2 = _interopRequireDefault(_text);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var NEWLINE_LENGTH = 1;

    var BlockEmbed = function (_Parchment$Embed) {
      _inherits(BlockEmbed, _Parchment$Embed);

      function BlockEmbed() {
        _classCallCheck(this, BlockEmbed);

        return _possibleConstructorReturn(this, (BlockEmbed.__proto__ || Object.getPrototypeOf(BlockEmbed)).apply(this, arguments));
      }

      _createClass(BlockEmbed, [{
        key: 'attach',
        value: function attach() {
          _get(BlockEmbed.prototype.__proto__ || Object.getPrototypeOf(BlockEmbed.prototype), 'attach', this).call(this);
          this.attributes = new _parchment2.default.Attributor.Store(this.domNode);
        }
      }, {
        key: 'delta',
        value: function delta() {
          return new _quillDelta2.default().insert(this.value(), (0, _extend2.default)(this.formats(), this.attributes.values()));
        }
      }, {
        key: 'format',
        value: function format(name, value) {
          var attribute = _parchment2.default.query(name, _parchment2.default.Scope.BLOCK_ATTRIBUTE);
          if (attribute != null) {
            this.attributes.attribute(attribute, value);
          }
        }
      }, {
        key: 'formatAt',
        value: function formatAt(index, length, name, value) {
          this.format(name, value);
        }
      }, {
        key: 'insertAt',
        value: function insertAt(index, value, def) {
          if (typeof value === 'string' && value.endsWith('\n')) {
            var block = _parchment2.default.create(Block.blotName);
            this.parent.insertBefore(block, index === 0 ? this : this.next);
            block.insertAt(0, value.slice(0, -1));
          } else {
            _get(BlockEmbed.prototype.__proto__ || Object.getPrototypeOf(BlockEmbed.prototype), 'insertAt', this).call(this, index, value, def);
          }
        }
      }]);

      return BlockEmbed;
    }(_parchment2.default.Embed);

    BlockEmbed.scope = _parchment2.default.Scope.BLOCK_BLOT;
    // It is important for cursor behavior BlockEmbeds use tags that are block level elements


    var Block = function (_Parchment$Block) {
      _inherits(Block, _Parchment$Block);

      function Block(domNode) {
        _classCallCheck(this, Block);

        var _this2 = _possibleConstructorReturn(this, (Block.__proto__ || Object.getPrototypeOf(Block)).call(this, domNode));

        _this2.cache = {};
        return _this2;
      }

      _createClass(Block, [{
        key: 'delta',
        value: function delta() {
          if (this.cache.delta == null) {
            this.cache.delta = this.descendants(_parchment2.default.Leaf).reduce(function (delta, leaf) {
              if (leaf.length() === 0) {
                return delta;
              } else {
                return delta.insert(leaf.value(), bubbleFormats(leaf));
              }
            }, new _quillDelta2.default()).insert('\n', bubbleFormats(this));
          }
          return this.cache.delta;
        }
      }, {
        key: 'deleteAt',
        value: function deleteAt(index, length) {
          _get(Block.prototype.__proto__ || Object.getPrototypeOf(Block.prototype), 'deleteAt', this).call(this, index, length);
          this.cache = {};
        }
      }, {
        key: 'formatAt',
        value: function formatAt(index, length, name, value) {
          if (length <= 0) return;
          if (_parchment2.default.query(name, _parchment2.default.Scope.BLOCK)) {
            if (index + length === this.length()) {
              this.format(name, value);
            }
          } else {
            _get(Block.prototype.__proto__ || Object.getPrototypeOf(Block.prototype), 'formatAt', this).call(this, index, Math.min(length, this.length() - index - 1), name, value);
          }
          this.cache = {};
        }
      }, {
        key: 'insertAt',
        value: function insertAt(index, value, def) {
          if (def != null) return _get(Block.prototype.__proto__ || Object.getPrototypeOf(Block.prototype), 'insertAt', this).call(this, index, value, def);
          if (value.length === 0) return;
          var lines = value.split('\n');
          var text = lines.shift();
          if (text.length > 0) {
            if (index < this.length() - 1 || this.children.tail == null) {
              _get(Block.prototype.__proto__ || Object.getPrototypeOf(Block.prototype), 'insertAt', this).call(this, Math.min(index, this.length() - 1), text);
            } else {
              this.children.tail.insertAt(this.children.tail.length(), text);
            }
            this.cache = {};
          }
          var block = this;
          lines.reduce(function (index, line) {
            block = block.split(index, true);
            block.insertAt(0, line);
            return line.length;
          }, index + text.length);
        }
      }, {
        key: 'insertBefore',
        value: function insertBefore(blot, ref) {
          var head = this.children.head;
          _get(Block.prototype.__proto__ || Object.getPrototypeOf(Block.prototype), 'insertBefore', this).call(this, blot, ref);
          if (head instanceof _break2.default) {
            head.remove();
          }
          this.cache = {};
        }
      }, {
        key: 'length',
        value: function length() {
          if (this.cache.length == null) {
            this.cache.length = _get(Block.prototype.__proto__ || Object.getPrototypeOf(Block.prototype), 'length', this).call(this) + NEWLINE_LENGTH;
          }
          return this.cache.length;
        }
      }, {
        key: 'moveChildren',
        value: function moveChildren(target, ref) {
          _get(Block.prototype.__proto__ || Object.getPrototypeOf(Block.prototype), 'moveChildren', this).call(this, target, ref);
          this.cache = {};
        }
      }, {
        key: 'optimize',
        value: function optimize(context) {
          _get(Block.prototype.__proto__ || Object.getPrototypeOf(Block.prototype), 'optimize', this).call(this, context);
          this.cache = {};
        }
      }, {
        key: 'path',
        value: function path(index) {
          return _get(Block.prototype.__proto__ || Object.getPrototypeOf(Block.prototype), 'path', this).call(this, index, true);
        }
      }, {
        key: 'removeChild',
        value: function removeChild(child) {
          _get(Block.prototype.__proto__ || Object.getPrototypeOf(Block.prototype), 'removeChild', this).call(this, child);
          this.cache = {};
        }
      }, {
        key: 'split',
        value: function split(index) {
          var force = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

          if (force && (index === 0 || index >= this.length() - NEWLINE_LENGTH)) {
            var clone = this.clone();
            if (index === 0) {
              this.parent.insertBefore(clone, this);
              return this;
            } else {
              this.parent.insertBefore(clone, this.next);
              return clone;
            }
          } else {
            var next = _get(Block.prototype.__proto__ || Object.getPrototypeOf(Block.prototype), 'split', this).call(this, index, force);
            this.cache = {};
            return next;
          }
        }
      }]);

      return Block;
    }(_parchment2.default.Block);

    Block.blotName = 'block';
    Block.tagName = 'P';
    Block.defaultChild = 'break';
    Block.allowedChildren = [_inline2.default, _parchment2.default.Embed, _text2.default];

    function bubbleFormats(blot) {
      var formats = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      if (blot == null) return formats;
      if (typeof blot.formats === 'function') {
        formats = (0, _extend2.default)(formats, blot.formats());
      }
      if (blot.parent == null || blot.parent.blotName == 'scroll' || blot.parent.statics.scope !== blot.statics.scope) {
        return formats;
      }
      return bubbleFormats(blot.parent, formats);
    }

    exports.bubbleFormats = bubbleFormats;
    exports.BlockEmbed = BlockEmbed;
    exports.default = Block;

    /***/ }),
    /* 5 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = exports.overload = exports.expandConfig = undefined;

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

    var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    __webpack_require__(50);

    var _quillDelta = __webpack_require__(2);

    var _quillDelta2 = _interopRequireDefault(_quillDelta);

    var _editor = __webpack_require__(14);

    var _editor2 = _interopRequireDefault(_editor);

    var _emitter3 = __webpack_require__(8);

    var _emitter4 = _interopRequireDefault(_emitter3);

    var _module = __webpack_require__(9);

    var _module2 = _interopRequireDefault(_module);

    var _parchment = __webpack_require__(0);

    var _parchment2 = _interopRequireDefault(_parchment);

    var _selection = __webpack_require__(15);

    var _selection2 = _interopRequireDefault(_selection);

    var _extend = __webpack_require__(3);

    var _extend2 = _interopRequireDefault(_extend);

    var _logger = __webpack_require__(10);

    var _logger2 = _interopRequireDefault(_logger);

    var _theme = __webpack_require__(34);

    var _theme2 = _interopRequireDefault(_theme);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    var debug = (0, _logger2.default)('quill');

    var Quill = function () {
      _createClass(Quill, null, [{
        key: 'debug',
        value: function debug(limit) {
          if (limit === true) {
            limit = 'log';
          }
          _logger2.default.level(limit);
        }
      }, {
        key: 'find',
        value: function find(node) {
          return node.__quill || _parchment2.default.find(node);
        }
      }, {
        key: 'import',
        value: function _import(name) {
          if (this.imports[name] == null) {
            debug.error('Cannot import ' + name + '. Are you sure it was registered?');
          }
          return this.imports[name];
        }
      }, {
        key: 'register',
        value: function register(path, target) {
          var _this = this;

          var overwrite = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

          if (typeof path !== 'string') {
            var name = path.attrName || path.blotName;
            if (typeof name === 'string') {
              // register(Blot | Attributor, overwrite)
              this.register('formats/' + name, path, target);
            } else {
              Object.keys(path).forEach(function (key) {
                _this.register(key, path[key], target);
              });
            }
          } else {
            if (this.imports[path] != null && !overwrite) {
              debug.warn('Overwriting ' + path + ' with', target);
            }
            this.imports[path] = target;
            if ((path.startsWith('blots/') || path.startsWith('formats/')) && target.blotName !== 'abstract') {
              _parchment2.default.register(target);
            } else if (path.startsWith('modules') && typeof target.register === 'function') {
              target.register();
            }
          }
        }
      }]);

      function Quill(container) {
        var _this2 = this;

        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        _classCallCheck(this, Quill);

        this.options = expandConfig(container, options);
        this.container = this.options.container;
        if (this.container == null) {
          return debug.error('Invalid Quill container', container);
        }
        if (this.options.debug) {
          Quill.debug(this.options.debug);
        }
        var html = this.container.innerHTML.trim();
        this.container.classList.add('ql-container');
        this.container.innerHTML = '';
        this.container.__quill = this;
        this.root = this.addContainer('ql-editor');
        this.root.classList.add('ql-blank');
        this.root.setAttribute('data-gramm', false);
        this.scrollingContainer = this.options.scrollingContainer || this.root;
        this.emitter = new _emitter4.default();
        this.scroll = _parchment2.default.create(this.root, {
          emitter: this.emitter,
          whitelist: this.options.formats
        });
        this.editor = new _editor2.default(this.scroll);
        this.selection = new _selection2.default(this.scroll, this.emitter);
        this.theme = new this.options.theme(this, this.options);
        this.keyboard = this.theme.addModule('keyboard');
        this.clipboard = this.theme.addModule('clipboard');
        this.history = this.theme.addModule('history');
        this.theme.init();
        this.emitter.on(_emitter4.default.events.EDITOR_CHANGE, function (type) {
          if (type === _emitter4.default.events.TEXT_CHANGE) {
            _this2.root.classList.toggle('ql-blank', _this2.editor.isBlank());
          }
        });
        this.emitter.on(_emitter4.default.events.SCROLL_UPDATE, function (source, mutations) {
          var range = _this2.selection.lastRange;
          var index = range && range.length === 0 ? range.index : undefined;
          modify.call(_this2, function () {
            return _this2.editor.update(null, mutations, index);
          }, source);
        });
        var contents = this.clipboard.convert('<div class=\'ql-editor\' style="white-space: normal;">' + html + '<p><br></p></div>');
        this.setContents(contents);
        this.history.clear();
        if (this.options.placeholder) {
          this.root.setAttribute('data-placeholder', this.options.placeholder);
        }
        if (this.options.readOnly) {
          this.disable();
        }
      }

      _createClass(Quill, [{
        key: 'addContainer',
        value: function addContainer(container) {
          var refNode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

          if (typeof container === 'string') {
            var className = container;
            container = document.createElement('div');
            container.classList.add(className);
          }
          this.container.insertBefore(container, refNode);
          return container;
        }
      }, {
        key: 'blur',
        value: function blur() {
          this.selection.setRange(null);
        }
      }, {
        key: 'deleteText',
        value: function deleteText(index, length, source) {
          var _this3 = this;

          var _overload = overload(index, length, source);

          var _overload2 = _slicedToArray(_overload, 4);

          index = _overload2[0];
          length = _overload2[1];
          source = _overload2[3];

          return modify.call(this, function () {
            return _this3.editor.deleteText(index, length);
          }, source, index, -1 * length);
        }
      }, {
        key: 'disable',
        value: function disable() {
          this.enable(false);
        }
      }, {
        key: 'enable',
        value: function enable() {
          var enabled = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

          this.scroll.enable(enabled);
          this.container.classList.toggle('ql-disabled', !enabled);
        }
      }, {
        key: 'focus',
        value: function focus() {
          var scrollTop = this.scrollingContainer.scrollTop;
          this.selection.focus();
          this.scrollingContainer.scrollTop = scrollTop;
          this.scrollIntoView();
        }
      }, {
        key: 'format',
        value: function format(name, value) {
          var _this4 = this;

          var source = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _emitter4.default.sources.API;

          return modify.call(this, function () {
            var range = _this4.getSelection(true);
            var change = new _quillDelta2.default();
            if (range == null) {
              return change;
            } else if (_parchment2.default.query(name, _parchment2.default.Scope.BLOCK)) {
              change = _this4.editor.formatLine(range.index, range.length, _defineProperty({}, name, value));
            } else if (range.length === 0) {
              _this4.selection.format(name, value);
              return change;
            } else {
              change = _this4.editor.formatText(range.index, range.length, _defineProperty({}, name, value));
            }
            _this4.setSelection(range, _emitter4.default.sources.SILENT);
            return change;
          }, source);
        }
      }, {
        key: 'formatLine',
        value: function formatLine(index, length, name, value, source) {
          var _this5 = this;

          var formats = void 0;

          var _overload3 = overload(index, length, name, value, source);

          var _overload4 = _slicedToArray(_overload3, 4);

          index = _overload4[0];
          length = _overload4[1];
          formats = _overload4[2];
          source = _overload4[3];

          return modify.call(this, function () {
            return _this5.editor.formatLine(index, length, formats);
          }, source, index, 0);
        }
      }, {
        key: 'formatText',
        value: function formatText(index, length, name, value, source) {
          var _this6 = this;

          var formats = void 0;

          var _overload5 = overload(index, length, name, value, source);

          var _overload6 = _slicedToArray(_overload5, 4);

          index = _overload6[0];
          length = _overload6[1];
          formats = _overload6[2];
          source = _overload6[3];

          return modify.call(this, function () {
            return _this6.editor.formatText(index, length, formats);
          }, source, index, 0);
        }
      }, {
        key: 'getBounds',
        value: function getBounds(index) {
          var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

          var bounds = void 0;
          if (typeof index === 'number') {
            bounds = this.selection.getBounds(index, length);
          } else {
            bounds = this.selection.getBounds(index.index, index.length);
          }
          var containerBounds = this.container.getBoundingClientRect();
          return {
            bottom: bounds.bottom - containerBounds.top,
            height: bounds.height,
            left: bounds.left - containerBounds.left,
            right: bounds.right - containerBounds.left,
            top: bounds.top - containerBounds.top,
            width: bounds.width
          };
        }
      }, {
        key: 'getContents',
        value: function getContents() {
          var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
          var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.getLength() - index;

          var _overload7 = overload(index, length);

          var _overload8 = _slicedToArray(_overload7, 2);

          index = _overload8[0];
          length = _overload8[1];

          return this.editor.getContents(index, length);
        }
      }, {
        key: 'getFormat',
        value: function getFormat() {
          var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.getSelection(true);
          var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

          if (typeof index === 'number') {
            return this.editor.getFormat(index, length);
          } else {
            return this.editor.getFormat(index.index, index.length);
          }
        }
      }, {
        key: 'getIndex',
        value: function getIndex(blot) {
          return blot.offset(this.scroll);
        }
      }, {
        key: 'getLength',
        value: function getLength() {
          return this.scroll.length();
        }
      }, {
        key: 'getLeaf',
        value: function getLeaf(index) {
          return this.scroll.leaf(index);
        }
      }, {
        key: 'getLine',
        value: function getLine(index) {
          return this.scroll.line(index);
        }
      }, {
        key: 'getLines',
        value: function getLines() {
          var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
          var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Number.MAX_VALUE;

          if (typeof index !== 'number') {
            return this.scroll.lines(index.index, index.length);
          } else {
            return this.scroll.lines(index, length);
          }
        }
      }, {
        key: 'getModule',
        value: function getModule(name) {
          return this.theme.modules[name];
        }
      }, {
        key: 'getSelection',
        value: function getSelection() {
          var focus = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

          if (focus) this.focus();
          this.update(); // Make sure we access getRange with editor in consistent state
          return this.selection.getRange()[0];
        }
      }, {
        key: 'getText',
        value: function getText() {
          var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
          var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.getLength() - index;

          var _overload9 = overload(index, length);

          var _overload10 = _slicedToArray(_overload9, 2);

          index = _overload10[0];
          length = _overload10[1];

          return this.editor.getText(index, length);
        }
      }, {
        key: 'hasFocus',
        value: function hasFocus() {
          return this.selection.hasFocus();
        }
      }, {
        key: 'insertEmbed',
        value: function insertEmbed(index, embed, value) {
          var _this7 = this;

          var source = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : Quill.sources.API;

          return modify.call(this, function () {
            return _this7.editor.insertEmbed(index, embed, value);
          }, source, index);
        }
      }, {
        key: 'insertText',
        value: function insertText(index, text, name, value, source) {
          var _this8 = this;

          var formats = void 0;

          var _overload11 = overload(index, 0, name, value, source);

          var _overload12 = _slicedToArray(_overload11, 4);

          index = _overload12[0];
          formats = _overload12[2];
          source = _overload12[3];

          return modify.call(this, function () {
            return _this8.editor.insertText(index, text, formats);
          }, source, index, text.length);
        }
      }, {
        key: 'isEnabled',
        value: function isEnabled() {
          return !this.container.classList.contains('ql-disabled');
        }
      }, {
        key: 'off',
        value: function off() {
          return this.emitter.off.apply(this.emitter, arguments);
        }
      }, {
        key: 'on',
        value: function on() {
          return this.emitter.on.apply(this.emitter, arguments);
        }
      }, {
        key: 'once',
        value: function once() {
          return this.emitter.once.apply(this.emitter, arguments);
        }
      }, {
        key: 'pasteHTML',
        value: function pasteHTML(index, html, source) {
          this.clipboard.dangerouslyPasteHTML(index, html, source);
        }
      }, {
        key: 'removeFormat',
        value: function removeFormat(index, length, source) {
          var _this9 = this;

          var _overload13 = overload(index, length, source);

          var _overload14 = _slicedToArray(_overload13, 4);

          index = _overload14[0];
          length = _overload14[1];
          source = _overload14[3];

          return modify.call(this, function () {
            return _this9.editor.removeFormat(index, length);
          }, source, index);
        }
      }, {
        key: 'scrollIntoView',
        value: function scrollIntoView() {
          this.selection.scrollIntoView(this.scrollingContainer);
        }
      }, {
        key: 'setContents',
        value: function setContents(delta) {
          var _this10 = this;

          var source = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _emitter4.default.sources.API;

          return modify.call(this, function () {
            delta = new _quillDelta2.default(delta);
            var length = _this10.getLength();
            var deleted = _this10.editor.deleteText(0, length);
            var applied = _this10.editor.applyDelta(delta);
            var lastOp = applied.ops[applied.ops.length - 1];
            if (lastOp != null && typeof lastOp.insert === 'string' && lastOp.insert[lastOp.insert.length - 1] === '\n') {
              _this10.editor.deleteText(_this10.getLength() - 1, 1);
              applied.delete(1);
            }
            var ret = deleted.compose(applied);
            return ret;
          }, source);
        }
      }, {
        key: 'setSelection',
        value: function setSelection(index, length, source) {
          if (index == null) {
            this.selection.setRange(null, length || Quill.sources.API);
          } else {
            var _overload15 = overload(index, length, source);

            var _overload16 = _slicedToArray(_overload15, 4);

            index = _overload16[0];
            length = _overload16[1];
            source = _overload16[3];

            this.selection.setRange(new _selection.Range(index, length), source);
            if (source !== _emitter4.default.sources.SILENT) {
              this.selection.scrollIntoView(this.scrollingContainer);
            }
          }
        }
      }, {
        key: 'setText',
        value: function setText(text) {
          var source = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _emitter4.default.sources.API;

          var delta = new _quillDelta2.default().insert(text);
          return this.setContents(delta, source);
        }
      }, {
        key: 'update',
        value: function update() {
          var source = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _emitter4.default.sources.USER;

          var change = this.scroll.update(source); // Will update selection before selection.update() does if text changes
          this.selection.update(source);
          return change;
        }
      }, {
        key: 'updateContents',
        value: function updateContents(delta) {
          var _this11 = this;

          var source = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _emitter4.default.sources.API;

          return modify.call(this, function () {
            delta = new _quillDelta2.default(delta);
            return _this11.editor.applyDelta(delta, source);
          }, source, true);
        }
      }]);

      return Quill;
    }();

    Quill.DEFAULTS = {
      bounds: null,
      formats: null,
      modules: {},
      placeholder: '',
      readOnly: false,
      scrollingContainer: null,
      strict: true,
      theme: 'default'
    };
    Quill.events = _emitter4.default.events;
    Quill.sources = _emitter4.default.sources;
    // eslint-disable-next-line no-undef
    Quill.version =  "1.3.7";

    Quill.imports = {
      'delta': _quillDelta2.default,
      'parchment': _parchment2.default,
      'core/module': _module2.default,
      'core/theme': _theme2.default
    };

    function expandConfig(container, userConfig) {
      userConfig = (0, _extend2.default)(true, {
        container: container,
        modules: {
          clipboard: true,
          keyboard: true,
          history: true
        }
      }, userConfig);
      if (!userConfig.theme || userConfig.theme === Quill.DEFAULTS.theme) {
        userConfig.theme = _theme2.default;
      } else {
        userConfig.theme = Quill.import('themes/' + userConfig.theme);
        if (userConfig.theme == null) {
          throw new Error('Invalid theme ' + userConfig.theme + '. Did you register it?');
        }
      }
      var themeConfig = (0, _extend2.default)(true, {}, userConfig.theme.DEFAULTS);
      [themeConfig, userConfig].forEach(function (config) {
        config.modules = config.modules || {};
        Object.keys(config.modules).forEach(function (module) {
          if (config.modules[module] === true) {
            config.modules[module] = {};
          }
        });
      });
      var moduleNames = Object.keys(themeConfig.modules).concat(Object.keys(userConfig.modules));
      var moduleConfig = moduleNames.reduce(function (config, name) {
        var moduleClass = Quill.import('modules/' + name);
        if (moduleClass == null) {
          debug.error('Cannot load ' + name + ' module. Are you sure you registered it?');
        } else {
          config[name] = moduleClass.DEFAULTS || {};
        }
        return config;
      }, {});
      // Special case toolbar shorthand
      if (userConfig.modules != null && userConfig.modules.toolbar && userConfig.modules.toolbar.constructor !== Object) {
        userConfig.modules.toolbar = {
          container: userConfig.modules.toolbar
        };
      }
      userConfig = (0, _extend2.default)(true, {}, Quill.DEFAULTS, { modules: moduleConfig }, themeConfig, userConfig);
      ['bounds', 'container', 'scrollingContainer'].forEach(function (key) {
        if (typeof userConfig[key] === 'string') {
          userConfig[key] = document.querySelector(userConfig[key]);
        }
      });
      userConfig.modules = Object.keys(userConfig.modules).reduce(function (config, name) {
        if (userConfig.modules[name]) {
          config[name] = userConfig.modules[name];
        }
        return config;
      }, {});
      return userConfig;
    }

    // Handle selection preservation and TEXT_CHANGE emission
    // common to modification APIs
    function modify(modifier, source, index, shift) {
      if (this.options.strict && !this.isEnabled() && source === _emitter4.default.sources.USER) {
        return new _quillDelta2.default();
      }
      var range = index == null ? null : this.getSelection();
      var oldDelta = this.editor.delta;
      var change = modifier();
      if (range != null) {
        if (index === true) index = range.index;
        if (shift == null) {
          range = shiftRange(range, change, source);
        } else if (shift !== 0) {
          range = shiftRange(range, index, shift, source);
        }
        this.setSelection(range, _emitter4.default.sources.SILENT);
      }
      if (change.length() > 0) {
        var _emitter;

        var args = [_emitter4.default.events.TEXT_CHANGE, change, oldDelta, source];
        (_emitter = this.emitter).emit.apply(_emitter, [_emitter4.default.events.EDITOR_CHANGE].concat(args));
        if (source !== _emitter4.default.sources.SILENT) {
          var _emitter2;

          (_emitter2 = this.emitter).emit.apply(_emitter2, args);
        }
      }
      return change;
    }

    function overload(index, length, name, value, source) {
      var formats = {};
      if (typeof index.index === 'number' && typeof index.length === 'number') {
        // Allow for throwaway end (used by insertText/insertEmbed)
        if (typeof length !== 'number') {
          source = value, value = name, name = length, length = index.length, index = index.index;
        } else {
          length = index.length, index = index.index;
        }
      } else if (typeof length !== 'number') {
        source = value, value = name, name = length, length = 0;
      }
      // Handle format being object, two format name/value strings or excluded
      if ((typeof name === 'undefined' ? 'undefined' : _typeof(name)) === 'object') {
        formats = name;
        source = value;
      } else if (typeof name === 'string') {
        if (value != null) {
          formats[name] = value;
        } else {
          source = name;
        }
      }
      // Handle optional source
      source = source || _emitter4.default.sources.API;
      return [index, length, formats, source];
    }

    function shiftRange(range, index, length, source) {
      if (range == null) return null;
      var start = void 0,
          end = void 0;
      if (index instanceof _quillDelta2.default) {
        var _map = [range.index, range.index + range.length].map(function (pos) {
          return index.transformPosition(pos, source !== _emitter4.default.sources.USER);
        });

        var _map2 = _slicedToArray(_map, 2);

        start = _map2[0];
        end = _map2[1];
      } else {
        var _map3 = [range.index, range.index + range.length].map(function (pos) {
          if (pos < index || pos === index && source === _emitter4.default.sources.USER) return pos;
          if (length >= 0) {
            return pos + length;
          } else {
            return Math.max(index, pos + length);
          }
        });

        var _map4 = _slicedToArray(_map3, 2);

        start = _map4[0];
        end = _map4[1];
      }
      return new _selection.Range(start, end - start);
    }

    exports.expandConfig = expandConfig;
    exports.overload = overload;
    exports.default = Quill;

    /***/ }),
    /* 6 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    var _text = __webpack_require__(7);

    var _text2 = _interopRequireDefault(_text);

    var _parchment = __webpack_require__(0);

    var _parchment2 = _interopRequireDefault(_parchment);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var Inline = function (_Parchment$Inline) {
      _inherits(Inline, _Parchment$Inline);

      function Inline() {
        _classCallCheck(this, Inline);

        return _possibleConstructorReturn(this, (Inline.__proto__ || Object.getPrototypeOf(Inline)).apply(this, arguments));
      }

      _createClass(Inline, [{
        key: 'formatAt',
        value: function formatAt(index, length, name, value) {
          if (Inline.compare(this.statics.blotName, name) < 0 && _parchment2.default.query(name, _parchment2.default.Scope.BLOT)) {
            var blot = this.isolate(index, length);
            if (value) {
              blot.wrap(name, value);
            }
          } else {
            _get(Inline.prototype.__proto__ || Object.getPrototypeOf(Inline.prototype), 'formatAt', this).call(this, index, length, name, value);
          }
        }
      }, {
        key: 'optimize',
        value: function optimize(context) {
          _get(Inline.prototype.__proto__ || Object.getPrototypeOf(Inline.prototype), 'optimize', this).call(this, context);
          if (this.parent instanceof Inline && Inline.compare(this.statics.blotName, this.parent.statics.blotName) > 0) {
            var parent = this.parent.isolate(this.offset(), this.length());
            this.moveChildren(parent);
            parent.wrap(this);
          }
        }
      }], [{
        key: 'compare',
        value: function compare(self, other) {
          var selfIndex = Inline.order.indexOf(self);
          var otherIndex = Inline.order.indexOf(other);
          if (selfIndex >= 0 || otherIndex >= 0) {
            return selfIndex - otherIndex;
          } else if (self === other) {
            return 0;
          } else if (self < other) {
            return -1;
          } else {
            return 1;
          }
        }
      }]);

      return Inline;
    }(_parchment2.default.Inline);

    Inline.allowedChildren = [Inline, _parchment2.default.Embed, _text2.default];
    // Lower index means deeper in the DOM tree, since not found (-1) is for embeds
    Inline.order = ['cursor', 'inline', // Must be lower
    'underline', 'strike', 'italic', 'bold', 'script', 'link', 'code' // Must be higher
    ];

    exports.default = Inline;

    /***/ }),
    /* 7 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    var _parchment = __webpack_require__(0);

    var _parchment2 = _interopRequireDefault(_parchment);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var TextBlot = function (_Parchment$Text) {
      _inherits(TextBlot, _Parchment$Text);

      function TextBlot() {
        _classCallCheck(this, TextBlot);

        return _possibleConstructorReturn(this, (TextBlot.__proto__ || Object.getPrototypeOf(TextBlot)).apply(this, arguments));
      }

      return TextBlot;
    }(_parchment2.default.Text);

    exports.default = TextBlot;

    /***/ }),
    /* 8 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    var _eventemitter = __webpack_require__(54);

    var _eventemitter2 = _interopRequireDefault(_eventemitter);

    var _logger = __webpack_require__(10);

    var _logger2 = _interopRequireDefault(_logger);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var debug = (0, _logger2.default)('quill:events');

    var EVENTS = ['selectionchange', 'mousedown', 'mouseup', 'click'];

    EVENTS.forEach(function (eventName) {
      document.addEventListener(eventName, function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        [].slice.call(document.querySelectorAll('.ql-container')).forEach(function (node) {
          // TODO use WeakMap
          if (node.__quill && node.__quill.emitter) {
            var _node$__quill$emitter;

            (_node$__quill$emitter = node.__quill.emitter).handleDOM.apply(_node$__quill$emitter, args);
          }
        });
      });
    });

    var Emitter = function (_EventEmitter) {
      _inherits(Emitter, _EventEmitter);

      function Emitter() {
        _classCallCheck(this, Emitter);

        var _this = _possibleConstructorReturn(this, (Emitter.__proto__ || Object.getPrototypeOf(Emitter)).call(this));

        _this.listeners = {};
        _this.on('error', debug.error);
        return _this;
      }

      _createClass(Emitter, [{
        key: 'emit',
        value: function emit() {
          debug.log.apply(debug, arguments);
          _get(Emitter.prototype.__proto__ || Object.getPrototypeOf(Emitter.prototype), 'emit', this).apply(this, arguments);
        }
      }, {
        key: 'handleDOM',
        value: function handleDOM(event) {
          for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
            args[_key2 - 1] = arguments[_key2];
          }

          (this.listeners[event.type] || []).forEach(function (_ref) {
            var node = _ref.node,
                handler = _ref.handler;

            if (event.target === node || node.contains(event.target)) {
              handler.apply(undefined, [event].concat(args));
            }
          });
        }
      }, {
        key: 'listenDOM',
        value: function listenDOM(eventName, node, handler) {
          if (!this.listeners[eventName]) {
            this.listeners[eventName] = [];
          }
          this.listeners[eventName].push({ node: node, handler: handler });
        }
      }]);

      return Emitter;
    }(_eventemitter2.default);

    Emitter.events = {
      EDITOR_CHANGE: 'editor-change',
      SCROLL_BEFORE_UPDATE: 'scroll-before-update',
      SCROLL_OPTIMIZE: 'scroll-optimize',
      SCROLL_UPDATE: 'scroll-update',
      SELECTION_CHANGE: 'selection-change',
      TEXT_CHANGE: 'text-change'
    };
    Emitter.sources = {
      API: 'api',
      SILENT: 'silent',
      USER: 'user'
    };

    exports.default = Emitter;

    /***/ }),
    /* 9 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    var Module = function Module(quill) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      _classCallCheck(this, Module);

      this.quill = quill;
      this.options = options;
    };

    Module.DEFAULTS = {};

    exports.default = Module;

    /***/ }),
    /* 10 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var levels = ['error', 'warn', 'log', 'info'];
    var level = 'warn';

    function debug(method) {
      if (levels.indexOf(method) <= levels.indexOf(level)) {
        var _console;

        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }

        (_console = console)[method].apply(_console, args); // eslint-disable-line no-console
      }
    }

    function namespace(ns) {
      return levels.reduce(function (logger, method) {
        logger[method] = debug.bind(console, method, ns);
        return logger;
      }, {});
    }

    debug.level = namespace.level = function (newLevel) {
      level = newLevel;
    };

    exports.default = namespace;

    /***/ }),
    /* 11 */
    /***/ (function(module, exports, __webpack_require__) {

    var pSlice = Array.prototype.slice;
    var objectKeys = __webpack_require__(52);
    var isArguments = __webpack_require__(53);

    var deepEqual = module.exports = function (actual, expected, opts) {
      if (!opts) opts = {};
      // 7.1. All identical values are equivalent, as determined by ===.
      if (actual === expected) {
        return true;

      } else if (actual instanceof Date && expected instanceof Date) {
        return actual.getTime() === expected.getTime();

      // 7.3. Other pairs that do not both pass typeof value == 'object',
      // equivalence is determined by ==.
      } else if (!actual || !expected || typeof actual != 'object' && typeof expected != 'object') {
        return opts.strict ? actual === expected : actual == expected;

      // 7.4. For all other Object pairs, including Array objects, equivalence is
      // determined by having the same number of owned properties (as verified
      // with Object.prototype.hasOwnProperty.call), the same set of keys
      // (although not necessarily the same order), equivalent values for every
      // corresponding key, and an identical 'prototype' property. Note: this
      // accounts for both named and indexed properties on Arrays.
      } else {
        return objEquiv(actual, expected, opts);
      }
    };

    function isUndefinedOrNull(value) {
      return value === null || value === undefined;
    }

    function isBuffer (x) {
      if (!x || typeof x !== 'object' || typeof x.length !== 'number') return false;
      if (typeof x.copy !== 'function' || typeof x.slice !== 'function') {
        return false;
      }
      if (x.length > 0 && typeof x[0] !== 'number') return false;
      return true;
    }

    function objEquiv(a, b, opts) {
      var i, key;
      if (isUndefinedOrNull(a) || isUndefinedOrNull(b))
        return false;
      // an identical 'prototype' property.
      if (a.prototype !== b.prototype) return false;
      //~~~I've managed to break Object.keys through screwy arguments passing.
      //   Converting to array solves the problem.
      if (isArguments(a)) {
        if (!isArguments(b)) {
          return false;
        }
        a = pSlice.call(a);
        b = pSlice.call(b);
        return deepEqual(a, b, opts);
      }
      if (isBuffer(a)) {
        if (!isBuffer(b)) {
          return false;
        }
        if (a.length !== b.length) return false;
        for (i = 0; i < a.length; i++) {
          if (a[i] !== b[i]) return false;
        }
        return true;
      }
      try {
        var ka = objectKeys(a),
            kb = objectKeys(b);
      } catch (e) {//happens when one is a string literal and the other isn't
        return false;
      }
      // having the same number of owned properties (keys incorporates
      // hasOwnProperty)
      if (ka.length != kb.length)
        return false;
      //the same set of keys (although not necessarily the same order),
      ka.sort();
      kb.sort();
      //~~~cheap key test
      for (i = ka.length - 1; i >= 0; i--) {
        if (ka[i] != kb[i])
          return false;
      }
      //equivalent values for every corresponding key, and
      //~~~possibly expensive deep test
      for (i = ka.length - 1; i >= 0; i--) {
        key = ka[i];
        if (!deepEqual(a[key], b[key], opts)) return false;
      }
      return typeof a === typeof b;
    }


    /***/ }),
    /* 12 */
    /***/ (function(module, exports, __webpack_require__) {

    Object.defineProperty(exports, "__esModule", { value: true });
    var Registry = __webpack_require__(1);
    var Attributor = /** @class */ (function () {
        function Attributor(attrName, keyName, options) {
            if (options === void 0) { options = {}; }
            this.attrName = attrName;
            this.keyName = keyName;
            var attributeBit = Registry.Scope.TYPE & Registry.Scope.ATTRIBUTE;
            if (options.scope != null) {
                // Ignore type bits, force attribute bit
                this.scope = (options.scope & Registry.Scope.LEVEL) | attributeBit;
            }
            else {
                this.scope = Registry.Scope.ATTRIBUTE;
            }
            if (options.whitelist != null)
                this.whitelist = options.whitelist;
        }
        Attributor.keys = function (node) {
            return [].map.call(node.attributes, function (item) {
                return item.name;
            });
        };
        Attributor.prototype.add = function (node, value) {
            if (!this.canAdd(node, value))
                return false;
            node.setAttribute(this.keyName, value);
            return true;
        };
        Attributor.prototype.canAdd = function (node, value) {
            var match = Registry.query(node, Registry.Scope.BLOT & (this.scope | Registry.Scope.TYPE));
            if (match == null)
                return false;
            if (this.whitelist == null)
                return true;
            if (typeof value === 'string') {
                return this.whitelist.indexOf(value.replace(/["']/g, '')) > -1;
            }
            else {
                return this.whitelist.indexOf(value) > -1;
            }
        };
        Attributor.prototype.remove = function (node) {
            node.removeAttribute(this.keyName);
        };
        Attributor.prototype.value = function (node) {
            var value = node.getAttribute(this.keyName);
            if (this.canAdd(node, value) && value) {
                return value;
            }
            return '';
        };
        return Attributor;
    }());
    exports.default = Attributor;


    /***/ }),
    /* 13 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = exports.Code = undefined;

    var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    var _quillDelta = __webpack_require__(2);

    var _quillDelta2 = _interopRequireDefault(_quillDelta);

    var _parchment = __webpack_require__(0);

    var _parchment2 = _interopRequireDefault(_parchment);

    var _block = __webpack_require__(4);

    var _block2 = _interopRequireDefault(_block);

    var _inline = __webpack_require__(6);

    var _inline2 = _interopRequireDefault(_inline);

    var _text = __webpack_require__(7);

    var _text2 = _interopRequireDefault(_text);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var Code = function (_Inline) {
      _inherits(Code, _Inline);

      function Code() {
        _classCallCheck(this, Code);

        return _possibleConstructorReturn(this, (Code.__proto__ || Object.getPrototypeOf(Code)).apply(this, arguments));
      }

      return Code;
    }(_inline2.default);

    Code.blotName = 'code';
    Code.tagName = 'CODE';

    var CodeBlock = function (_Block) {
      _inherits(CodeBlock, _Block);

      function CodeBlock() {
        _classCallCheck(this, CodeBlock);

        return _possibleConstructorReturn(this, (CodeBlock.__proto__ || Object.getPrototypeOf(CodeBlock)).apply(this, arguments));
      }

      _createClass(CodeBlock, [{
        key: 'delta',
        value: function delta() {
          var _this3 = this;

          var text = this.domNode.textContent;
          if (text.endsWith('\n')) {
            // Should always be true
            text = text.slice(0, -1);
          }
          return text.split('\n').reduce(function (delta, frag) {
            return delta.insert(frag).insert('\n', _this3.formats());
          }, new _quillDelta2.default());
        }
      }, {
        key: 'format',
        value: function format(name, value) {
          if (name === this.statics.blotName && value) return;

          var _descendant = this.descendant(_text2.default, this.length() - 1),
              _descendant2 = _slicedToArray(_descendant, 1),
              text = _descendant2[0];

          if (text != null) {
            text.deleteAt(text.length() - 1, 1);
          }
          _get(CodeBlock.prototype.__proto__ || Object.getPrototypeOf(CodeBlock.prototype), 'format', this).call(this, name, value);
        }
      }, {
        key: 'formatAt',
        value: function formatAt(index, length, name, value) {
          if (length === 0) return;
          if (_parchment2.default.query(name, _parchment2.default.Scope.BLOCK) == null || name === this.statics.blotName && value === this.statics.formats(this.domNode)) {
            return;
          }
          var nextNewline = this.newlineIndex(index);
          if (nextNewline < 0 || nextNewline >= index + length) return;
          var prevNewline = this.newlineIndex(index, true) + 1;
          var isolateLength = nextNewline - prevNewline + 1;
          var blot = this.isolate(prevNewline, isolateLength);
          var next = blot.next;
          blot.format(name, value);
          if (next instanceof CodeBlock) {
            next.formatAt(0, index - prevNewline + length - isolateLength, name, value);
          }
        }
      }, {
        key: 'insertAt',
        value: function insertAt(index, value, def) {
          if (def != null) return;

          var _descendant3 = this.descendant(_text2.default, index),
              _descendant4 = _slicedToArray(_descendant3, 2),
              text = _descendant4[0],
              offset = _descendant4[1];

          text.insertAt(offset, value);
        }
      }, {
        key: 'length',
        value: function length() {
          var length = this.domNode.textContent.length;
          if (!this.domNode.textContent.endsWith('\n')) {
            return length + 1;
          }
          return length;
        }
      }, {
        key: 'newlineIndex',
        value: function newlineIndex(searchIndex) {
          var reverse = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

          if (!reverse) {
            var offset = this.domNode.textContent.slice(searchIndex).indexOf('\n');
            return offset > -1 ? searchIndex + offset : -1;
          } else {
            return this.domNode.textContent.slice(0, searchIndex).lastIndexOf('\n');
          }
        }
      }, {
        key: 'optimize',
        value: function optimize(context) {
          if (!this.domNode.textContent.endsWith('\n')) {
            this.appendChild(_parchment2.default.create('text', '\n'));
          }
          _get(CodeBlock.prototype.__proto__ || Object.getPrototypeOf(CodeBlock.prototype), 'optimize', this).call(this, context);
          var next = this.next;
          if (next != null && next.prev === this && next.statics.blotName === this.statics.blotName && this.statics.formats(this.domNode) === next.statics.formats(next.domNode)) {
            next.optimize(context);
            next.moveChildren(this);
            next.remove();
          }
        }
      }, {
        key: 'replace',
        value: function replace(target) {
          _get(CodeBlock.prototype.__proto__ || Object.getPrototypeOf(CodeBlock.prototype), 'replace', this).call(this, target);
          [].slice.call(this.domNode.querySelectorAll('*')).forEach(function (node) {
            var blot = _parchment2.default.find(node);
            if (blot == null) {
              node.parentNode.removeChild(node);
            } else if (blot instanceof _parchment2.default.Embed) {
              blot.remove();
            } else {
              blot.unwrap();
            }
          });
        }
      }], [{
        key: 'create',
        value: function create(value) {
          var domNode = _get(CodeBlock.__proto__ || Object.getPrototypeOf(CodeBlock), 'create', this).call(this, value);
          domNode.setAttribute('spellcheck', false);
          return domNode;
        }
      }, {
        key: 'formats',
        value: function formats() {
          return true;
        }
      }]);

      return CodeBlock;
    }(_block2.default);

    CodeBlock.blotName = 'code-block';
    CodeBlock.tagName = 'PRE';
    CodeBlock.TAB = '  ';

    exports.Code = Code;
    exports.default = CodeBlock;

    /***/ }),
    /* 14 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

    var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    var _quillDelta = __webpack_require__(2);

    var _quillDelta2 = _interopRequireDefault(_quillDelta);

    var _op = __webpack_require__(20);

    var _op2 = _interopRequireDefault(_op);

    var _parchment = __webpack_require__(0);

    var _parchment2 = _interopRequireDefault(_parchment);

    var _code = __webpack_require__(13);

    var _code2 = _interopRequireDefault(_code);

    var _cursor = __webpack_require__(24);

    var _cursor2 = _interopRequireDefault(_cursor);

    var _block = __webpack_require__(4);

    var _block2 = _interopRequireDefault(_block);

    var _break = __webpack_require__(16);

    var _break2 = _interopRequireDefault(_break);

    var _clone = __webpack_require__(21);

    var _clone2 = _interopRequireDefault(_clone);

    var _deepEqual = __webpack_require__(11);

    var _deepEqual2 = _interopRequireDefault(_deepEqual);

    var _extend = __webpack_require__(3);

    var _extend2 = _interopRequireDefault(_extend);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    var ASCII = /^[ -~]*$/;

    var Editor = function () {
      function Editor(scroll) {
        _classCallCheck(this, Editor);

        this.scroll = scroll;
        this.delta = this.getDelta();
      }

      _createClass(Editor, [{
        key: 'applyDelta',
        value: function applyDelta(delta) {
          var _this = this;

          var consumeNextNewline = false;
          this.scroll.update();
          var scrollLength = this.scroll.length();
          this.scroll.batchStart();
          delta = normalizeDelta(delta);
          delta.reduce(function (index, op) {
            var length = op.retain || op.delete || op.insert.length || 1;
            var attributes = op.attributes || {};
            if (op.insert != null) {
              if (typeof op.insert === 'string') {
                var text = op.insert;
                if (text.endsWith('\n') && consumeNextNewline) {
                  consumeNextNewline = false;
                  text = text.slice(0, -1);
                }
                if (index >= scrollLength && !text.endsWith('\n')) {
                  consumeNextNewline = true;
                }
                _this.scroll.insertAt(index, text);

                var _scroll$line = _this.scroll.line(index),
                    _scroll$line2 = _slicedToArray(_scroll$line, 2),
                    line = _scroll$line2[0],
                    offset = _scroll$line2[1];

                var formats = (0, _extend2.default)({}, (0, _block.bubbleFormats)(line));
                if (line instanceof _block2.default) {
                  var _line$descendant = line.descendant(_parchment2.default.Leaf, offset),
                      _line$descendant2 = _slicedToArray(_line$descendant, 1),
                      leaf = _line$descendant2[0];

                  formats = (0, _extend2.default)(formats, (0, _block.bubbleFormats)(leaf));
                }
                attributes = _op2.default.attributes.diff(formats, attributes) || {};
              } else if (_typeof(op.insert) === 'object') {
                var key = Object.keys(op.insert)[0]; // There should only be one key
                if (key == null) return index;
                _this.scroll.insertAt(index, key, op.insert[key]);
              }
              scrollLength += length;
            }
            Object.keys(attributes).forEach(function (name) {
              _this.scroll.formatAt(index, length, name, attributes[name]);
            });
            return index + length;
          }, 0);
          delta.reduce(function (index, op) {
            if (typeof op.delete === 'number') {
              _this.scroll.deleteAt(index, op.delete);
              return index;
            }
            return index + (op.retain || op.insert.length || 1);
          }, 0);
          this.scroll.batchEnd();
          return this.update(delta);
        }
      }, {
        key: 'deleteText',
        value: function deleteText(index, length) {
          this.scroll.deleteAt(index, length);
          return this.update(new _quillDelta2.default().retain(index).delete(length));
        }
      }, {
        key: 'formatLine',
        value: function formatLine(index, length) {
          var _this2 = this;

          var formats = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

          this.scroll.update();
          Object.keys(formats).forEach(function (format) {
            if (_this2.scroll.whitelist != null && !_this2.scroll.whitelist[format]) return;
            var lines = _this2.scroll.lines(index, Math.max(length, 1));
            var lengthRemaining = length;
            lines.forEach(function (line) {
              var lineLength = line.length();
              if (!(line instanceof _code2.default)) {
                line.format(format, formats[format]);
              } else {
                var codeIndex = index - line.offset(_this2.scroll);
                var codeLength = line.newlineIndex(codeIndex + lengthRemaining) - codeIndex + 1;
                line.formatAt(codeIndex, codeLength, format, formats[format]);
              }
              lengthRemaining -= lineLength;
            });
          });
          this.scroll.optimize();
          return this.update(new _quillDelta2.default().retain(index).retain(length, (0, _clone2.default)(formats)));
        }
      }, {
        key: 'formatText',
        value: function formatText(index, length) {
          var _this3 = this;

          var formats = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

          Object.keys(formats).forEach(function (format) {
            _this3.scroll.formatAt(index, length, format, formats[format]);
          });
          return this.update(new _quillDelta2.default().retain(index).retain(length, (0, _clone2.default)(formats)));
        }
      }, {
        key: 'getContents',
        value: function getContents(index, length) {
          return this.delta.slice(index, index + length);
        }
      }, {
        key: 'getDelta',
        value: function getDelta() {
          return this.scroll.lines().reduce(function (delta, line) {
            return delta.concat(line.delta());
          }, new _quillDelta2.default());
        }
      }, {
        key: 'getFormat',
        value: function getFormat(index) {
          var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

          var lines = [],
              leaves = [];
          if (length === 0) {
            this.scroll.path(index).forEach(function (path) {
              var _path = _slicedToArray(path, 1),
                  blot = _path[0];

              if (blot instanceof _block2.default) {
                lines.push(blot);
              } else if (blot instanceof _parchment2.default.Leaf) {
                leaves.push(blot);
              }
            });
          } else {
            lines = this.scroll.lines(index, length);
            leaves = this.scroll.descendants(_parchment2.default.Leaf, index, length);
          }
          var formatsArr = [lines, leaves].map(function (blots) {
            if (blots.length === 0) return {};
            var formats = (0, _block.bubbleFormats)(blots.shift());
            while (Object.keys(formats).length > 0) {
              var blot = blots.shift();
              if (blot == null) return formats;
              formats = combineFormats((0, _block.bubbleFormats)(blot), formats);
            }
            return formats;
          });
          return _extend2.default.apply(_extend2.default, formatsArr);
        }
      }, {
        key: 'getText',
        value: function getText(index, length) {
          return this.getContents(index, length).filter(function (op) {
            return typeof op.insert === 'string';
          }).map(function (op) {
            return op.insert;
          }).join('');
        }
      }, {
        key: 'insertEmbed',
        value: function insertEmbed(index, embed, value) {
          this.scroll.insertAt(index, embed, value);
          return this.update(new _quillDelta2.default().retain(index).insert(_defineProperty({}, embed, value)));
        }
      }, {
        key: 'insertText',
        value: function insertText(index, text) {
          var _this4 = this;

          var formats = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

          text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
          this.scroll.insertAt(index, text);
          Object.keys(formats).forEach(function (format) {
            _this4.scroll.formatAt(index, text.length, format, formats[format]);
          });
          return this.update(new _quillDelta2.default().retain(index).insert(text, (0, _clone2.default)(formats)));
        }
      }, {
        key: 'isBlank',
        value: function isBlank() {
          if (this.scroll.children.length == 0) return true;
          if (this.scroll.children.length > 1) return false;
          var block = this.scroll.children.head;
          if (block.statics.blotName !== _block2.default.blotName) return false;
          if (block.children.length > 1) return false;
          return block.children.head instanceof _break2.default;
        }
      }, {
        key: 'removeFormat',
        value: function removeFormat(index, length) {
          var text = this.getText(index, length);

          var _scroll$line3 = this.scroll.line(index + length),
              _scroll$line4 = _slicedToArray(_scroll$line3, 2),
              line = _scroll$line4[0],
              offset = _scroll$line4[1];

          var suffixLength = 0,
              suffix = new _quillDelta2.default();
          if (line != null) {
            if (!(line instanceof _code2.default)) {
              suffixLength = line.length() - offset;
            } else {
              suffixLength = line.newlineIndex(offset) - offset + 1;
            }
            suffix = line.delta().slice(offset, offset + suffixLength - 1).insert('\n');
          }
          var contents = this.getContents(index, length + suffixLength);
          var diff = contents.diff(new _quillDelta2.default().insert(text).concat(suffix));
          var delta = new _quillDelta2.default().retain(index).concat(diff);
          return this.applyDelta(delta);
        }
      }, {
        key: 'update',
        value: function update(change) {
          var mutations = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
          var cursorIndex = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;

          var oldDelta = this.delta;
          if (mutations.length === 1 && mutations[0].type === 'characterData' && mutations[0].target.data.match(ASCII) && _parchment2.default.find(mutations[0].target)) {
            // Optimization for character changes
            var textBlot = _parchment2.default.find(mutations[0].target);
            var formats = (0, _block.bubbleFormats)(textBlot);
            var index = textBlot.offset(this.scroll);
            var oldValue = mutations[0].oldValue.replace(_cursor2.default.CONTENTS, '');
            var oldText = new _quillDelta2.default().insert(oldValue);
            var newText = new _quillDelta2.default().insert(textBlot.value());
            var diffDelta = new _quillDelta2.default().retain(index).concat(oldText.diff(newText, cursorIndex));
            change = diffDelta.reduce(function (delta, op) {
              if (op.insert) {
                return delta.insert(op.insert, formats);
              } else {
                return delta.push(op);
              }
            }, new _quillDelta2.default());
            this.delta = oldDelta.compose(change);
          } else {
            this.delta = this.getDelta();
            if (!change || !(0, _deepEqual2.default)(oldDelta.compose(change), this.delta)) {
              change = oldDelta.diff(this.delta, cursorIndex);
            }
          }
          return change;
        }
      }]);

      return Editor;
    }();

    function combineFormats(formats, combined) {
      return Object.keys(combined).reduce(function (merged, name) {
        if (formats[name] == null) return merged;
        if (combined[name] === formats[name]) {
          merged[name] = combined[name];
        } else if (Array.isArray(combined[name])) {
          if (combined[name].indexOf(formats[name]) < 0) {
            merged[name] = combined[name].concat([formats[name]]);
          }
        } else {
          merged[name] = [combined[name], formats[name]];
        }
        return merged;
      }, {});
    }

    function normalizeDelta(delta) {
      return delta.reduce(function (delta, op) {
        if (op.insert === 1) {
          var attributes = (0, _clone2.default)(op.attributes);
          delete attributes['image'];
          return delta.insert({ image: op.attributes.image }, attributes);
        }
        if (op.attributes != null && (op.attributes.list === true || op.attributes.bullet === true)) {
          op = (0, _clone2.default)(op);
          if (op.attributes.list) {
            op.attributes.list = 'ordered';
          } else {
            op.attributes.list = 'bullet';
            delete op.attributes.bullet;
          }
        }
        if (typeof op.insert === 'string') {
          var text = op.insert.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
          return delta.insert(text, op.attributes);
        }
        return delta.push(op);
      }, new _quillDelta2.default());
    }

    exports.default = Editor;

    /***/ }),
    /* 15 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = exports.Range = undefined;

    var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    var _parchment = __webpack_require__(0);

    var _parchment2 = _interopRequireDefault(_parchment);

    var _clone = __webpack_require__(21);

    var _clone2 = _interopRequireDefault(_clone);

    var _deepEqual = __webpack_require__(11);

    var _deepEqual2 = _interopRequireDefault(_deepEqual);

    var _emitter3 = __webpack_require__(8);

    var _emitter4 = _interopRequireDefault(_emitter3);

    var _logger = __webpack_require__(10);

    var _logger2 = _interopRequireDefault(_logger);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    var debug = (0, _logger2.default)('quill:selection');

    var Range = function Range(index) {
      var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

      _classCallCheck(this, Range);

      this.index = index;
      this.length = length;
    };

    var Selection = function () {
      function Selection(scroll, emitter) {
        var _this = this;

        _classCallCheck(this, Selection);

        this.emitter = emitter;
        this.scroll = scroll;
        this.composing = false;
        this.mouseDown = false;
        this.root = this.scroll.domNode;
        this.cursor = _parchment2.default.create('cursor', this);
        // savedRange is last non-null range
        this.lastRange = this.savedRange = new Range(0, 0);
        this.handleComposition();
        this.handleDragging();
        this.emitter.listenDOM('selectionchange', document, function () {
          if (!_this.mouseDown) {
            setTimeout(_this.update.bind(_this, _emitter4.default.sources.USER), 1);
          }
        });
        this.emitter.on(_emitter4.default.events.EDITOR_CHANGE, function (type, delta) {
          if (type === _emitter4.default.events.TEXT_CHANGE && delta.length() > 0) {
            _this.update(_emitter4.default.sources.SILENT);
          }
        });
        this.emitter.on(_emitter4.default.events.SCROLL_BEFORE_UPDATE, function () {
          if (!_this.hasFocus()) return;
          var native = _this.getNativeRange();
          if (native == null) return;
          if (native.start.node === _this.cursor.textNode) return; // cursor.restore() will handle
          // TODO unclear if this has negative side effects
          _this.emitter.once(_emitter4.default.events.SCROLL_UPDATE, function () {
            try {
              _this.setNativeRange(native.start.node, native.start.offset, native.end.node, native.end.offset);
            } catch (ignored) {}
          });
        });
        this.emitter.on(_emitter4.default.events.SCROLL_OPTIMIZE, function (mutations, context) {
          if (context.range) {
            var _context$range = context.range,
                startNode = _context$range.startNode,
                startOffset = _context$range.startOffset,
                endNode = _context$range.endNode,
                endOffset = _context$range.endOffset;

            _this.setNativeRange(startNode, startOffset, endNode, endOffset);
          }
        });
        this.update(_emitter4.default.sources.SILENT);
      }

      _createClass(Selection, [{
        key: 'handleComposition',
        value: function handleComposition() {
          var _this2 = this;

          this.root.addEventListener('compositionstart', function () {
            _this2.composing = true;
          });
          this.root.addEventListener('compositionend', function () {
            _this2.composing = false;
            if (_this2.cursor.parent) {
              var range = _this2.cursor.restore();
              if (!range) return;
              setTimeout(function () {
                _this2.setNativeRange(range.startNode, range.startOffset, range.endNode, range.endOffset);
              }, 1);
            }
          });
        }
      }, {
        key: 'handleDragging',
        value: function handleDragging() {
          var _this3 = this;

          this.emitter.listenDOM('mousedown', document.body, function () {
            _this3.mouseDown = true;
          });
          this.emitter.listenDOM('mouseup', document.body, function () {
            _this3.mouseDown = false;
            _this3.update(_emitter4.default.sources.USER);
          });
        }
      }, {
        key: 'focus',
        value: function focus() {
          if (this.hasFocus()) return;
          this.root.focus();
          this.setRange(this.savedRange);
        }
      }, {
        key: 'format',
        value: function format(_format, value) {
          if (this.scroll.whitelist != null && !this.scroll.whitelist[_format]) return;
          this.scroll.update();
          var nativeRange = this.getNativeRange();
          if (nativeRange == null || !nativeRange.native.collapsed || _parchment2.default.query(_format, _parchment2.default.Scope.BLOCK)) return;
          if (nativeRange.start.node !== this.cursor.textNode) {
            var blot = _parchment2.default.find(nativeRange.start.node, false);
            if (blot == null) return;
            // TODO Give blot ability to not split
            if (blot instanceof _parchment2.default.Leaf) {
              var after = blot.split(nativeRange.start.offset);
              blot.parent.insertBefore(this.cursor, after);
            } else {
              blot.insertBefore(this.cursor, nativeRange.start.node); // Should never happen
            }
            this.cursor.attach();
          }
          this.cursor.format(_format, value);
          this.scroll.optimize();
          this.setNativeRange(this.cursor.textNode, this.cursor.textNode.data.length);
          this.update();
        }
      }, {
        key: 'getBounds',
        value: function getBounds(index) {
          var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

          var scrollLength = this.scroll.length();
          index = Math.min(index, scrollLength - 1);
          length = Math.min(index + length, scrollLength - 1) - index;
          var node = void 0,
              _scroll$leaf = this.scroll.leaf(index),
              _scroll$leaf2 = _slicedToArray(_scroll$leaf, 2),
              leaf = _scroll$leaf2[0],
              offset = _scroll$leaf2[1];
          if (leaf == null) return null;

          var _leaf$position = leaf.position(offset, true);

          var _leaf$position2 = _slicedToArray(_leaf$position, 2);

          node = _leaf$position2[0];
          offset = _leaf$position2[1];

          var range = document.createRange();
          if (length > 0) {
            range.setStart(node, offset);

            var _scroll$leaf3 = this.scroll.leaf(index + length);

            var _scroll$leaf4 = _slicedToArray(_scroll$leaf3, 2);

            leaf = _scroll$leaf4[0];
            offset = _scroll$leaf4[1];

            if (leaf == null) return null;

            var _leaf$position3 = leaf.position(offset, true);

            var _leaf$position4 = _slicedToArray(_leaf$position3, 2);

            node = _leaf$position4[0];
            offset = _leaf$position4[1];

            range.setEnd(node, offset);
            return range.getBoundingClientRect();
          } else {
            var side = 'left';
            var rect = void 0;
            if (node instanceof Text) {
              if (offset < node.data.length) {
                range.setStart(node, offset);
                range.setEnd(node, offset + 1);
              } else {
                range.setStart(node, offset - 1);
                range.setEnd(node, offset);
                side = 'right';
              }
              rect = range.getBoundingClientRect();
            } else {
              rect = leaf.domNode.getBoundingClientRect();
              if (offset > 0) side = 'right';
            }
            return {
              bottom: rect.top + rect.height,
              height: rect.height,
              left: rect[side],
              right: rect[side],
              top: rect.top,
              width: 0
            };
          }
        }
      }, {
        key: 'getNativeRange',
        value: function getNativeRange() {
          var selection = document.getSelection();
          if (selection == null || selection.rangeCount <= 0) return null;
          var nativeRange = selection.getRangeAt(0);
          if (nativeRange == null) return null;
          var range = this.normalizeNative(nativeRange);
          debug.info('getNativeRange', range);
          return range;
        }
      }, {
        key: 'getRange',
        value: function getRange() {
          var normalized = this.getNativeRange();
          if (normalized == null) return [null, null];
          var range = this.normalizedToRange(normalized);
          return [range, normalized];
        }
      }, {
        key: 'hasFocus',
        value: function hasFocus() {
          return document.activeElement === this.root;
        }
      }, {
        key: 'normalizedToRange',
        value: function normalizedToRange(range) {
          var _this4 = this;

          var positions = [[range.start.node, range.start.offset]];
          if (!range.native.collapsed) {
            positions.push([range.end.node, range.end.offset]);
          }
          var indexes = positions.map(function (position) {
            var _position = _slicedToArray(position, 2),
                node = _position[0],
                offset = _position[1];

            var blot = _parchment2.default.find(node, true);
            var index = blot.offset(_this4.scroll);
            if (offset === 0) {
              return index;
            } else if (blot instanceof _parchment2.default.Container) {
              return index + blot.length();
            } else {
              return index + blot.index(node, offset);
            }
          });
          var end = Math.min(Math.max.apply(Math, _toConsumableArray(indexes)), this.scroll.length() - 1);
          var start = Math.min.apply(Math, [end].concat(_toConsumableArray(indexes)));
          return new Range(start, end - start);
        }
      }, {
        key: 'normalizeNative',
        value: function normalizeNative(nativeRange) {
          if (!contains(this.root, nativeRange.startContainer) || !nativeRange.collapsed && !contains(this.root, nativeRange.endContainer)) {
            return null;
          }
          var range = {
            start: { node: nativeRange.startContainer, offset: nativeRange.startOffset },
            end: { node: nativeRange.endContainer, offset: nativeRange.endOffset },
            native: nativeRange
          };
          [range.start, range.end].forEach(function (position) {
            var node = position.node,
                offset = position.offset;
            while (!(node instanceof Text) && node.childNodes.length > 0) {
              if (node.childNodes.length > offset) {
                node = node.childNodes[offset];
                offset = 0;
              } else if (node.childNodes.length === offset) {
                node = node.lastChild;
                offset = node instanceof Text ? node.data.length : node.childNodes.length + 1;
              } else {
                break;
              }
            }
            position.node = node, position.offset = offset;
          });
          return range;
        }
      }, {
        key: 'rangeToNative',
        value: function rangeToNative(range) {
          var _this5 = this;

          var indexes = range.collapsed ? [range.index] : [range.index, range.index + range.length];
          var args = [];
          var scrollLength = this.scroll.length();
          indexes.forEach(function (index, i) {
            index = Math.min(scrollLength - 1, index);
            var node = void 0,
                _scroll$leaf5 = _this5.scroll.leaf(index),
                _scroll$leaf6 = _slicedToArray(_scroll$leaf5, 2),
                leaf = _scroll$leaf6[0],
                offset = _scroll$leaf6[1];
            var _leaf$position5 = leaf.position(offset, i !== 0);

            var _leaf$position6 = _slicedToArray(_leaf$position5, 2);

            node = _leaf$position6[0];
            offset = _leaf$position6[1];

            args.push(node, offset);
          });
          if (args.length < 2) {
            args = args.concat(args);
          }
          return args;
        }
      }, {
        key: 'scrollIntoView',
        value: function scrollIntoView(scrollingContainer) {
          var range = this.lastRange;
          if (range == null) return;
          var bounds = this.getBounds(range.index, range.length);
          if (bounds == null) return;
          var limit = this.scroll.length() - 1;

          var _scroll$line = this.scroll.line(Math.min(range.index, limit)),
              _scroll$line2 = _slicedToArray(_scroll$line, 1),
              first = _scroll$line2[0];

          var last = first;
          if (range.length > 0) {
            var _scroll$line3 = this.scroll.line(Math.min(range.index + range.length, limit));

            var _scroll$line4 = _slicedToArray(_scroll$line3, 1);

            last = _scroll$line4[0];
          }
          if (first == null || last == null) return;
          var scrollBounds = scrollingContainer.getBoundingClientRect();
          if (bounds.top < scrollBounds.top) {
            scrollingContainer.scrollTop -= scrollBounds.top - bounds.top;
          } else if (bounds.bottom > scrollBounds.bottom) {
            scrollingContainer.scrollTop += bounds.bottom - scrollBounds.bottom;
          }
        }
      }, {
        key: 'setNativeRange',
        value: function setNativeRange(startNode, startOffset) {
          var endNode = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : startNode;
          var endOffset = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : startOffset;
          var force = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;

          debug.info('setNativeRange', startNode, startOffset, endNode, endOffset);
          if (startNode != null && (this.root.parentNode == null || startNode.parentNode == null || endNode.parentNode == null)) {
            return;
          }
          var selection = document.getSelection();
          if (selection == null) return;
          if (startNode != null) {
            if (!this.hasFocus()) this.root.focus();
            var native = (this.getNativeRange() || {}).native;
            if (native == null || force || startNode !== native.startContainer || startOffset !== native.startOffset || endNode !== native.endContainer || endOffset !== native.endOffset) {

              if (startNode.tagName == "BR") {
                startOffset = [].indexOf.call(startNode.parentNode.childNodes, startNode);
                startNode = startNode.parentNode;
              }
              if (endNode.tagName == "BR") {
                endOffset = [].indexOf.call(endNode.parentNode.childNodes, endNode);
                endNode = endNode.parentNode;
              }
              var range = document.createRange();
              range.setStart(startNode, startOffset);
              range.setEnd(endNode, endOffset);
              selection.removeAllRanges();
              selection.addRange(range);
            }
          } else {
            selection.removeAllRanges();
            this.root.blur();
            document.body.focus(); // root.blur() not enough on IE11+Travis+SauceLabs (but not local VMs)
          }
        }
      }, {
        key: 'setRange',
        value: function setRange(range) {
          var force = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
          var source = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _emitter4.default.sources.API;

          if (typeof force === 'string') {
            source = force;
            force = false;
          }
          debug.info('setRange', range);
          if (range != null) {
            var args = this.rangeToNative(range);
            this.setNativeRange.apply(this, _toConsumableArray(args).concat([force]));
          } else {
            this.setNativeRange(null);
          }
          this.update(source);
        }
      }, {
        key: 'update',
        value: function update() {
          var source = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _emitter4.default.sources.USER;

          var oldRange = this.lastRange;

          var _getRange = this.getRange(),
              _getRange2 = _slicedToArray(_getRange, 2),
              lastRange = _getRange2[0],
              nativeRange = _getRange2[1];

          this.lastRange = lastRange;
          if (this.lastRange != null) {
            this.savedRange = this.lastRange;
          }
          if (!(0, _deepEqual2.default)(oldRange, this.lastRange)) {
            var _emitter;

            if (!this.composing && nativeRange != null && nativeRange.native.collapsed && nativeRange.start.node !== this.cursor.textNode) {
              this.cursor.restore();
            }
            var args = [_emitter4.default.events.SELECTION_CHANGE, (0, _clone2.default)(this.lastRange), (0, _clone2.default)(oldRange), source];
            (_emitter = this.emitter).emit.apply(_emitter, [_emitter4.default.events.EDITOR_CHANGE].concat(args));
            if (source !== _emitter4.default.sources.SILENT) {
              var _emitter2;

              (_emitter2 = this.emitter).emit.apply(_emitter2, args);
            }
          }
        }
      }]);

      return Selection;
    }();

    function contains(parent, descendant) {
      try {
        // Firefox inserts inaccessible nodes around video elements
        descendant.parentNode;
      } catch (e) {
        return false;
      }
      // IE11 has bug with Text nodes
      // https://connect.microsoft.com/IE/feedback/details/780874/node-contains-is-incorrect
      if (descendant instanceof Text) {
        descendant = descendant.parentNode;
      }
      return parent.contains(descendant);
    }

    exports.Range = Range;
    exports.default = Selection;

    /***/ }),
    /* 16 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    var _parchment = __webpack_require__(0);

    var _parchment2 = _interopRequireDefault(_parchment);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var Break = function (_Parchment$Embed) {
      _inherits(Break, _Parchment$Embed);

      function Break() {
        _classCallCheck(this, Break);

        return _possibleConstructorReturn(this, (Break.__proto__ || Object.getPrototypeOf(Break)).apply(this, arguments));
      }

      _createClass(Break, [{
        key: 'insertInto',
        value: function insertInto(parent, ref) {
          if (parent.children.length === 0) {
            _get(Break.prototype.__proto__ || Object.getPrototypeOf(Break.prototype), 'insertInto', this).call(this, parent, ref);
          } else {
            this.remove();
          }
        }
      }, {
        key: 'length',
        value: function length() {
          return 0;
        }
      }, {
        key: 'value',
        value: function value() {
          return '';
        }
      }], [{
        key: 'value',
        value: function value() {
          return undefined;
        }
      }]);

      return Break;
    }(_parchment2.default.Embed);

    Break.blotName = 'break';
    Break.tagName = 'BR';

    exports.default = Break;

    /***/ }),
    /* 17 */
    /***/ (function(module, exports, __webpack_require__) {

    var __extends = (this && this.__extends) || (function () {
        var extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    var linked_list_1 = __webpack_require__(44);
    var shadow_1 = __webpack_require__(30);
    var Registry = __webpack_require__(1);
    var ContainerBlot = /** @class */ (function (_super) {
        __extends(ContainerBlot, _super);
        function ContainerBlot(domNode) {
            var _this = _super.call(this, domNode) || this;
            _this.build();
            return _this;
        }
        ContainerBlot.prototype.appendChild = function (other) {
            this.insertBefore(other);
        };
        ContainerBlot.prototype.attach = function () {
            _super.prototype.attach.call(this);
            this.children.forEach(function (child) {
                child.attach();
            });
        };
        ContainerBlot.prototype.build = function () {
            var _this = this;
            this.children = new linked_list_1.default();
            // Need to be reversed for if DOM nodes already in order
            [].slice
                .call(this.domNode.childNodes)
                .reverse()
                .forEach(function (node) {
                try {
                    var child = makeBlot(node);
                    _this.insertBefore(child, _this.children.head || undefined);
                }
                catch (err) {
                    if (err instanceof Registry.ParchmentError)
                        return;
                    else
                        throw err;
                }
            });
        };
        ContainerBlot.prototype.deleteAt = function (index, length) {
            if (index === 0 && length === this.length()) {
                return this.remove();
            }
            this.children.forEachAt(index, length, function (child, offset, length) {
                child.deleteAt(offset, length);
            });
        };
        ContainerBlot.prototype.descendant = function (criteria, index) {
            var _a = this.children.find(index), child = _a[0], offset = _a[1];
            if ((criteria.blotName == null && criteria(child)) ||
                (criteria.blotName != null && child instanceof criteria)) {
                return [child, offset];
            }
            else if (child instanceof ContainerBlot) {
                return child.descendant(criteria, offset);
            }
            else {
                return [null, -1];
            }
        };
        ContainerBlot.prototype.descendants = function (criteria, index, length) {
            if (index === void 0) { index = 0; }
            if (length === void 0) { length = Number.MAX_VALUE; }
            var descendants = [];
            var lengthLeft = length;
            this.children.forEachAt(index, length, function (child, index, length) {
                if ((criteria.blotName == null && criteria(child)) ||
                    (criteria.blotName != null && child instanceof criteria)) {
                    descendants.push(child);
                }
                if (child instanceof ContainerBlot) {
                    descendants = descendants.concat(child.descendants(criteria, index, lengthLeft));
                }
                lengthLeft -= length;
            });
            return descendants;
        };
        ContainerBlot.prototype.detach = function () {
            this.children.forEach(function (child) {
                child.detach();
            });
            _super.prototype.detach.call(this);
        };
        ContainerBlot.prototype.formatAt = function (index, length, name, value) {
            this.children.forEachAt(index, length, function (child, offset, length) {
                child.formatAt(offset, length, name, value);
            });
        };
        ContainerBlot.prototype.insertAt = function (index, value, def) {
            var _a = this.children.find(index), child = _a[0], offset = _a[1];
            if (child) {
                child.insertAt(offset, value, def);
            }
            else {
                var blot = def == null ? Registry.create('text', value) : Registry.create(value, def);
                this.appendChild(blot);
            }
        };
        ContainerBlot.prototype.insertBefore = function (childBlot, refBlot) {
            if (this.statics.allowedChildren != null &&
                !this.statics.allowedChildren.some(function (child) {
                    return childBlot instanceof child;
                })) {
                throw new Registry.ParchmentError("Cannot insert " + childBlot.statics.blotName + " into " + this.statics.blotName);
            }
            childBlot.insertInto(this, refBlot);
        };
        ContainerBlot.prototype.length = function () {
            return this.children.reduce(function (memo, child) {
                return memo + child.length();
            }, 0);
        };
        ContainerBlot.prototype.moveChildren = function (targetParent, refNode) {
            this.children.forEach(function (child) {
                targetParent.insertBefore(child, refNode);
            });
        };
        ContainerBlot.prototype.optimize = function (context) {
            _super.prototype.optimize.call(this, context);
            if (this.children.length === 0) {
                if (this.statics.defaultChild != null) {
                    var child = Registry.create(this.statics.defaultChild);
                    this.appendChild(child);
                    child.optimize(context);
                }
                else {
                    this.remove();
                }
            }
        };
        ContainerBlot.prototype.path = function (index, inclusive) {
            if (inclusive === void 0) { inclusive = false; }
            var _a = this.children.find(index, inclusive), child = _a[0], offset = _a[1];
            var position = [[this, index]];
            if (child instanceof ContainerBlot) {
                return position.concat(child.path(offset, inclusive));
            }
            else if (child != null) {
                position.push([child, offset]);
            }
            return position;
        };
        ContainerBlot.prototype.removeChild = function (child) {
            this.children.remove(child);
        };
        ContainerBlot.prototype.replace = function (target) {
            if (target instanceof ContainerBlot) {
                target.moveChildren(this);
            }
            _super.prototype.replace.call(this, target);
        };
        ContainerBlot.prototype.split = function (index, force) {
            if (force === void 0) { force = false; }
            if (!force) {
                if (index === 0)
                    return this;
                if (index === this.length())
                    return this.next;
            }
            var after = this.clone();
            this.parent.insertBefore(after, this.next);
            this.children.forEachAt(index, this.length(), function (child, offset, length) {
                child = child.split(offset, force);
                after.appendChild(child);
            });
            return after;
        };
        ContainerBlot.prototype.unwrap = function () {
            this.moveChildren(this.parent, this.next);
            this.remove();
        };
        ContainerBlot.prototype.update = function (mutations, context) {
            var _this = this;
            var addedNodes = [];
            var removedNodes = [];
            mutations.forEach(function (mutation) {
                if (mutation.target === _this.domNode && mutation.type === 'childList') {
                    addedNodes.push.apply(addedNodes, mutation.addedNodes);
                    removedNodes.push.apply(removedNodes, mutation.removedNodes);
                }
            });
            removedNodes.forEach(function (node) {
                // Check node has actually been removed
                // One exception is Chrome does not immediately remove IFRAMEs
                // from DOM but MutationRecord is correct in its reported removal
                if (node.parentNode != null &&
                    // @ts-ignore
                    node.tagName !== 'IFRAME' &&
                    document.body.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_CONTAINED_BY) {
                    return;
                }
                var blot = Registry.find(node);
                if (blot == null)
                    return;
                if (blot.domNode.parentNode == null || blot.domNode.parentNode === _this.domNode) {
                    blot.detach();
                }
            });
            addedNodes
                .filter(function (node) {
                return node.parentNode == _this.domNode;
            })
                .sort(function (a, b) {
                if (a === b)
                    return 0;
                if (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) {
                    return 1;
                }
                return -1;
            })
                .forEach(function (node) {
                var refBlot = null;
                if (node.nextSibling != null) {
                    refBlot = Registry.find(node.nextSibling);
                }
                var blot = makeBlot(node);
                if (blot.next != refBlot || blot.next == null) {
                    if (blot.parent != null) {
                        blot.parent.removeChild(_this);
                    }
                    _this.insertBefore(blot, refBlot || undefined);
                }
            });
        };
        return ContainerBlot;
    }(shadow_1.default));
    function makeBlot(node) {
        var blot = Registry.find(node);
        if (blot == null) {
            try {
                blot = Registry.create(node);
            }
            catch (e) {
                blot = Registry.create(Registry.Scope.INLINE);
                [].slice.call(node.childNodes).forEach(function (child) {
                    // @ts-ignore
                    blot.domNode.appendChild(child);
                });
                if (node.parentNode) {
                    node.parentNode.replaceChild(blot.domNode, node);
                }
                blot.attach();
            }
        }
        return blot;
    }
    exports.default = ContainerBlot;


    /***/ }),
    /* 18 */
    /***/ (function(module, exports, __webpack_require__) {

    var __extends = (this && this.__extends) || (function () {
        var extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    var attributor_1 = __webpack_require__(12);
    var store_1 = __webpack_require__(31);
    var container_1 = __webpack_require__(17);
    var Registry = __webpack_require__(1);
    var FormatBlot = /** @class */ (function (_super) {
        __extends(FormatBlot, _super);
        function FormatBlot(domNode) {
            var _this = _super.call(this, domNode) || this;
            _this.attributes = new store_1.default(_this.domNode);
            return _this;
        }
        FormatBlot.formats = function (domNode) {
            if (typeof this.tagName === 'string') {
                return true;
            }
            else if (Array.isArray(this.tagName)) {
                return domNode.tagName.toLowerCase();
            }
            return undefined;
        };
        FormatBlot.prototype.format = function (name, value) {
            var format = Registry.query(name);
            if (format instanceof attributor_1.default) {
                this.attributes.attribute(format, value);
            }
            else if (value) {
                if (format != null && (name !== this.statics.blotName || this.formats()[name] !== value)) {
                    this.replaceWith(name, value);
                }
            }
        };
        FormatBlot.prototype.formats = function () {
            var formats = this.attributes.values();
            var format = this.statics.formats(this.domNode);
            if (format != null) {
                formats[this.statics.blotName] = format;
            }
            return formats;
        };
        FormatBlot.prototype.replaceWith = function (name, value) {
            var replacement = _super.prototype.replaceWith.call(this, name, value);
            this.attributes.copy(replacement);
            return replacement;
        };
        FormatBlot.prototype.update = function (mutations, context) {
            var _this = this;
            _super.prototype.update.call(this, mutations, context);
            if (mutations.some(function (mutation) {
                return mutation.target === _this.domNode && mutation.type === 'attributes';
            })) {
                this.attributes.build();
            }
        };
        FormatBlot.prototype.wrap = function (name, value) {
            var wrapper = _super.prototype.wrap.call(this, name, value);
            if (wrapper instanceof FormatBlot && wrapper.statics.scope === this.statics.scope) {
                this.attributes.move(wrapper);
            }
            return wrapper;
        };
        return FormatBlot;
    }(container_1.default));
    exports.default = FormatBlot;


    /***/ }),
    /* 19 */
    /***/ (function(module, exports, __webpack_require__) {

    var __extends = (this && this.__extends) || (function () {
        var extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    var shadow_1 = __webpack_require__(30);
    var Registry = __webpack_require__(1);
    var LeafBlot = /** @class */ (function (_super) {
        __extends(LeafBlot, _super);
        function LeafBlot() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        LeafBlot.value = function (domNode) {
            return true;
        };
        LeafBlot.prototype.index = function (node, offset) {
            if (this.domNode === node ||
                this.domNode.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_CONTAINED_BY) {
                return Math.min(offset, 1);
            }
            return -1;
        };
        LeafBlot.prototype.position = function (index, inclusive) {
            var offset = [].indexOf.call(this.parent.domNode.childNodes, this.domNode);
            if (index > 0)
                offset += 1;
            return [this.parent.domNode, offset];
        };
        LeafBlot.prototype.value = function () {
            var _a;
            return _a = {}, _a[this.statics.blotName] = this.statics.value(this.domNode) || true, _a;
        };
        LeafBlot.scope = Registry.Scope.INLINE_BLOT;
        return LeafBlot;
    }(shadow_1.default));
    exports.default = LeafBlot;


    /***/ }),
    /* 20 */
    /***/ (function(module, exports, __webpack_require__) {

    var equal = __webpack_require__(11);
    var extend = __webpack_require__(3);


    var lib = {
      attributes: {
        compose: function (a, b, keepNull) {
          if (typeof a !== 'object') a = {};
          if (typeof b !== 'object') b = {};
          var attributes = extend(true, {}, b);
          if (!keepNull) {
            attributes = Object.keys(attributes).reduce(function (copy, key) {
              if (attributes[key] != null) {
                copy[key] = attributes[key];
              }
              return copy;
            }, {});
          }
          for (var key in a) {
            if (a[key] !== undefined && b[key] === undefined) {
              attributes[key] = a[key];
            }
          }
          return Object.keys(attributes).length > 0 ? attributes : undefined;
        },

        diff: function(a, b) {
          if (typeof a !== 'object') a = {};
          if (typeof b !== 'object') b = {};
          var attributes = Object.keys(a).concat(Object.keys(b)).reduce(function (attributes, key) {
            if (!equal(a[key], b[key])) {
              attributes[key] = b[key] === undefined ? null : b[key];
            }
            return attributes;
          }, {});
          return Object.keys(attributes).length > 0 ? attributes : undefined;
        },

        transform: function (a, b, priority) {
          if (typeof a !== 'object') return b;
          if (typeof b !== 'object') return undefined;
          if (!priority) return b;  // b simply overwrites us without priority
          var attributes = Object.keys(b).reduce(function (attributes, key) {
            if (a[key] === undefined) attributes[key] = b[key];  // null is a valid value
            return attributes;
          }, {});
          return Object.keys(attributes).length > 0 ? attributes : undefined;
        }
      },

      iterator: function (ops) {
        return new Iterator(ops);
      },

      length: function (op) {
        if (typeof op['delete'] === 'number') {
          return op['delete'];
        } else if (typeof op.retain === 'number') {
          return op.retain;
        } else {
          return typeof op.insert === 'string' ? op.insert.length : 1;
        }
      }
    };


    function Iterator(ops) {
      this.ops = ops;
      this.index = 0;
      this.offset = 0;
    }
    Iterator.prototype.hasNext = function () {
      return this.peekLength() < Infinity;
    };

    Iterator.prototype.next = function (length) {
      if (!length) length = Infinity;
      var nextOp = this.ops[this.index];
      if (nextOp) {
        var offset = this.offset;
        var opLength = lib.length(nextOp);
        if (length >= opLength - offset) {
          length = opLength - offset;
          this.index += 1;
          this.offset = 0;
        } else {
          this.offset += length;
        }
        if (typeof nextOp['delete'] === 'number') {
          return { 'delete': length };
        } else {
          var retOp = {};
          if (nextOp.attributes) {
            retOp.attributes = nextOp.attributes;
          }
          if (typeof nextOp.retain === 'number') {
            retOp.retain = length;
          } else if (typeof nextOp.insert === 'string') {
            retOp.insert = nextOp.insert.substr(offset, length);
          } else {
            // offset should === 0, length should === 1
            retOp.insert = nextOp.insert;
          }
          return retOp;
        }
      } else {
        return { retain: Infinity };
      }
    };

    Iterator.prototype.peek = function () {
      return this.ops[this.index];
    };

    Iterator.prototype.peekLength = function () {
      if (this.ops[this.index]) {
        // Should never return 0 if our index is being managed correctly
        return lib.length(this.ops[this.index]) - this.offset;
      } else {
        return Infinity;
      }
    };

    Iterator.prototype.peekType = function () {
      if (this.ops[this.index]) {
        if (typeof this.ops[this.index]['delete'] === 'number') {
          return 'delete';
        } else if (typeof this.ops[this.index].retain === 'number') {
          return 'retain';
        } else {
          return 'insert';
        }
      }
      return 'retain';
    };

    Iterator.prototype.rest = function () {
      if (!this.hasNext()) {
        return [];
      } else if (this.offset === 0) {
        return this.ops.slice(this.index);
      } else {
        var offset = this.offset;
        var index = this.index;
        var next = this.next();
        var rest = this.ops.slice(this.index);
        this.offset = offset;
        this.index = index;
        return [next].concat(rest);
      }
    };


    module.exports = lib;


    /***/ }),
    /* 21 */
    /***/ (function(module, exports) {

    var clone = (function() {

    function _instanceof(obj, type) {
      return type != null && obj instanceof type;
    }

    var nativeMap;
    try {
      nativeMap = Map;
    } catch(_) {
      // maybe a reference error because no `Map`. Give it a dummy value that no
      // value will ever be an instanceof.
      nativeMap = function() {};
    }

    var nativeSet;
    try {
      nativeSet = Set;
    } catch(_) {
      nativeSet = function() {};
    }

    var nativePromise;
    try {
      nativePromise = Promise;
    } catch(_) {
      nativePromise = function() {};
    }

    /**
     * Clones (copies) an Object using deep copying.
     *
     * This function supports circular references by default, but if you are certain
     * there are no circular references in your object, you can save some CPU time
     * by calling clone(obj, false).
     *
     * Caution: if `circular` is false and `parent` contains circular references,
     * your program may enter an infinite loop and crash.
     *
     * @param `parent` - the object to be cloned
     * @param `circular` - set to true if the object to be cloned may contain
     *    circular references. (optional - true by default)
     * @param `depth` - set to a number if the object is only to be cloned to
     *    a particular depth. (optional - defaults to Infinity)
     * @param `prototype` - sets the prototype to be used when cloning an object.
     *    (optional - defaults to parent prototype).
     * @param `includeNonEnumerable` - set to true if the non-enumerable properties
     *    should be cloned as well. Non-enumerable properties on the prototype
     *    chain will be ignored. (optional - false by default)
    */
    function clone(parent, circular, depth, prototype, includeNonEnumerable) {
      if (typeof circular === 'object') {
        depth = circular.depth;
        prototype = circular.prototype;
        includeNonEnumerable = circular.includeNonEnumerable;
        circular = circular.circular;
      }
      // maintain two arrays for circular references, where corresponding parents
      // and children have the same index
      var allParents = [];
      var allChildren = [];

      var useBuffer = typeof Buffer != 'undefined';

      if (typeof circular == 'undefined')
        circular = true;

      if (typeof depth == 'undefined')
        depth = Infinity;

      // recurse this function so we don't reset allParents and allChildren
      function _clone(parent, depth) {
        // cloning null always returns null
        if (parent === null)
          return null;

        if (depth === 0)
          return parent;

        var child;
        var proto;
        if (typeof parent != 'object') {
          return parent;
        }

        if (_instanceof(parent, nativeMap)) {
          child = new nativeMap();
        } else if (_instanceof(parent, nativeSet)) {
          child = new nativeSet();
        } else if (_instanceof(parent, nativePromise)) {
          child = new nativePromise(function (resolve, reject) {
            parent.then(function(value) {
              resolve(_clone(value, depth - 1));
            }, function(err) {
              reject(_clone(err, depth - 1));
            });
          });
        } else if (clone.__isArray(parent)) {
          child = [];
        } else if (clone.__isRegExp(parent)) {
          child = new RegExp(parent.source, __getRegExpFlags(parent));
          if (parent.lastIndex) child.lastIndex = parent.lastIndex;
        } else if (clone.__isDate(parent)) {
          child = new Date(parent.getTime());
        } else if (useBuffer && Buffer.isBuffer(parent)) {
          if (Buffer.allocUnsafe) {
            // Node.js >= 4.5.0
            child = Buffer.allocUnsafe(parent.length);
          } else {
            // Older Node.js versions
            child = new Buffer(parent.length);
          }
          parent.copy(child);
          return child;
        } else if (_instanceof(parent, Error)) {
          child = Object.create(parent);
        } else {
          if (typeof prototype == 'undefined') {
            proto = Object.getPrototypeOf(parent);
            child = Object.create(proto);
          }
          else {
            child = Object.create(prototype);
            proto = prototype;
          }
        }

        if (circular) {
          var index = allParents.indexOf(parent);

          if (index != -1) {
            return allChildren[index];
          }
          allParents.push(parent);
          allChildren.push(child);
        }

        if (_instanceof(parent, nativeMap)) {
          parent.forEach(function(value, key) {
            var keyChild = _clone(key, depth - 1);
            var valueChild = _clone(value, depth - 1);
            child.set(keyChild, valueChild);
          });
        }
        if (_instanceof(parent, nativeSet)) {
          parent.forEach(function(value) {
            var entryChild = _clone(value, depth - 1);
            child.add(entryChild);
          });
        }

        for (var i in parent) {
          var attrs;
          if (proto) {
            attrs = Object.getOwnPropertyDescriptor(proto, i);
          }

          if (attrs && attrs.set == null) {
            continue;
          }
          child[i] = _clone(parent[i], depth - 1);
        }

        if (Object.getOwnPropertySymbols) {
          var symbols = Object.getOwnPropertySymbols(parent);
          for (var i = 0; i < symbols.length; i++) {
            // Don't need to worry about cloning a symbol because it is a primitive,
            // like a number or string.
            var symbol = symbols[i];
            var descriptor = Object.getOwnPropertyDescriptor(parent, symbol);
            if (descriptor && !descriptor.enumerable && !includeNonEnumerable) {
              continue;
            }
            child[symbol] = _clone(parent[symbol], depth - 1);
            if (!descriptor.enumerable) {
              Object.defineProperty(child, symbol, {
                enumerable: false
              });
            }
          }
        }

        if (includeNonEnumerable) {
          var allPropertyNames = Object.getOwnPropertyNames(parent);
          for (var i = 0; i < allPropertyNames.length; i++) {
            var propertyName = allPropertyNames[i];
            var descriptor = Object.getOwnPropertyDescriptor(parent, propertyName);
            if (descriptor && descriptor.enumerable) {
              continue;
            }
            child[propertyName] = _clone(parent[propertyName], depth - 1);
            Object.defineProperty(child, propertyName, {
              enumerable: false
            });
          }
        }

        return child;
      }

      return _clone(parent, depth);
    }

    /**
     * Simple flat clone using prototype, accepts only objects, usefull for property
     * override on FLAT configuration object (no nested props).
     *
     * USE WITH CAUTION! This may not behave as you wish if you do not know how this
     * works.
     */
    clone.clonePrototype = function clonePrototype(parent) {
      if (parent === null)
        return null;

      var c = function () {};
      c.prototype = parent;
      return new c();
    };

    // private utility functions

    function __objToStr(o) {
      return Object.prototype.toString.call(o);
    }
    clone.__objToStr = __objToStr;

    function __isDate(o) {
      return typeof o === 'object' && __objToStr(o) === '[object Date]';
    }
    clone.__isDate = __isDate;

    function __isArray(o) {
      return typeof o === 'object' && __objToStr(o) === '[object Array]';
    }
    clone.__isArray = __isArray;

    function __isRegExp(o) {
      return typeof o === 'object' && __objToStr(o) === '[object RegExp]';
    }
    clone.__isRegExp = __isRegExp;

    function __getRegExpFlags(re) {
      var flags = '';
      if (re.global) flags += 'g';
      if (re.ignoreCase) flags += 'i';
      if (re.multiline) flags += 'm';
      return flags;
    }
    clone.__getRegExpFlags = __getRegExpFlags;

    return clone;
    })();

    if (typeof module === 'object' && module.exports) {
      module.exports = clone;
    }


    /***/ }),
    /* 22 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    var _parchment = __webpack_require__(0);

    var _parchment2 = _interopRequireDefault(_parchment);

    var _emitter = __webpack_require__(8);

    var _emitter2 = _interopRequireDefault(_emitter);

    var _block = __webpack_require__(4);

    var _block2 = _interopRequireDefault(_block);

    var _break = __webpack_require__(16);

    var _break2 = _interopRequireDefault(_break);

    var _code = __webpack_require__(13);

    var _code2 = _interopRequireDefault(_code);

    var _container = __webpack_require__(25);

    var _container2 = _interopRequireDefault(_container);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    function isLine(blot) {
      return blot instanceof _block2.default || blot instanceof _block.BlockEmbed;
    }

    var Scroll = function (_Parchment$Scroll) {
      _inherits(Scroll, _Parchment$Scroll);

      function Scroll(domNode, config) {
        _classCallCheck(this, Scroll);

        var _this = _possibleConstructorReturn(this, (Scroll.__proto__ || Object.getPrototypeOf(Scroll)).call(this, domNode));

        _this.emitter = config.emitter;
        if (Array.isArray(config.whitelist)) {
          _this.whitelist = config.whitelist.reduce(function (whitelist, format) {
            whitelist[format] = true;
            return whitelist;
          }, {});
        }
        // Some reason fixes composition issues with character languages in Windows/Chrome, Safari
        _this.domNode.addEventListener('DOMNodeInserted', function () {});
        _this.optimize();
        _this.enable();
        return _this;
      }

      _createClass(Scroll, [{
        key: 'batchStart',
        value: function batchStart() {
          this.batch = true;
        }
      }, {
        key: 'batchEnd',
        value: function batchEnd() {
          this.batch = false;
          this.optimize();
        }
      }, {
        key: 'deleteAt',
        value: function deleteAt(index, length) {
          var _line = this.line(index),
              _line2 = _slicedToArray(_line, 2),
              first = _line2[0],
              offset = _line2[1];

          var _line3 = this.line(index + length),
              _line4 = _slicedToArray(_line3, 1),
              last = _line4[0];

          _get(Scroll.prototype.__proto__ || Object.getPrototypeOf(Scroll.prototype), 'deleteAt', this).call(this, index, length);
          if (last != null && first !== last && offset > 0) {
            if (first instanceof _block.BlockEmbed || last instanceof _block.BlockEmbed) {
              this.optimize();
              return;
            }
            if (first instanceof _code2.default) {
              var newlineIndex = first.newlineIndex(first.length(), true);
              if (newlineIndex > -1) {
                first = first.split(newlineIndex + 1);
                if (first === last) {
                  this.optimize();
                  return;
                }
              }
            } else if (last instanceof _code2.default) {
              var _newlineIndex = last.newlineIndex(0);
              if (_newlineIndex > -1) {
                last.split(_newlineIndex + 1);
              }
            }
            var ref = last.children.head instanceof _break2.default ? null : last.children.head;
            first.moveChildren(last, ref);
            first.remove();
          }
          this.optimize();
        }
      }, {
        key: 'enable',
        value: function enable() {
          var enabled = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

          this.domNode.setAttribute('contenteditable', enabled);
        }
      }, {
        key: 'formatAt',
        value: function formatAt(index, length, format, value) {
          if (this.whitelist != null && !this.whitelist[format]) return;
          _get(Scroll.prototype.__proto__ || Object.getPrototypeOf(Scroll.prototype), 'formatAt', this).call(this, index, length, format, value);
          this.optimize();
        }
      }, {
        key: 'insertAt',
        value: function insertAt(index, value, def) {
          if (def != null && this.whitelist != null && !this.whitelist[value]) return;
          if (index >= this.length()) {
            if (def == null || _parchment2.default.query(value, _parchment2.default.Scope.BLOCK) == null) {
              var blot = _parchment2.default.create(this.statics.defaultChild);
              this.appendChild(blot);
              if (def == null && value.endsWith('\n')) {
                value = value.slice(0, -1);
              }
              blot.insertAt(0, value, def);
            } else {
              var embed = _parchment2.default.create(value, def);
              this.appendChild(embed);
            }
          } else {
            _get(Scroll.prototype.__proto__ || Object.getPrototypeOf(Scroll.prototype), 'insertAt', this).call(this, index, value, def);
          }
          this.optimize();
        }
      }, {
        key: 'insertBefore',
        value: function insertBefore(blot, ref) {
          if (blot.statics.scope === _parchment2.default.Scope.INLINE_BLOT) {
            var wrapper = _parchment2.default.create(this.statics.defaultChild);
            wrapper.appendChild(blot);
            blot = wrapper;
          }
          _get(Scroll.prototype.__proto__ || Object.getPrototypeOf(Scroll.prototype), 'insertBefore', this).call(this, blot, ref);
        }
      }, {
        key: 'leaf',
        value: function leaf(index) {
          return this.path(index).pop() || [null, -1];
        }
      }, {
        key: 'line',
        value: function line(index) {
          if (index === this.length()) {
            return this.line(index - 1);
          }
          return this.descendant(isLine, index);
        }
      }, {
        key: 'lines',
        value: function lines() {
          var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
          var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Number.MAX_VALUE;

          var getLines = function getLines(blot, index, length) {
            var lines = [],
                lengthLeft = length;
            blot.children.forEachAt(index, length, function (child, index, length) {
              if (isLine(child)) {
                lines.push(child);
              } else if (child instanceof _parchment2.default.Container) {
                lines = lines.concat(getLines(child, index, lengthLeft));
              }
              lengthLeft -= length;
            });
            return lines;
          };
          return getLines(this, index, length);
        }
      }, {
        key: 'optimize',
        value: function optimize() {
          var mutations = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
          var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

          if (this.batch === true) return;
          _get(Scroll.prototype.__proto__ || Object.getPrototypeOf(Scroll.prototype), 'optimize', this).call(this, mutations, context);
          if (mutations.length > 0) {
            this.emitter.emit(_emitter2.default.events.SCROLL_OPTIMIZE, mutations, context);
          }
        }
      }, {
        key: 'path',
        value: function path(index) {
          return _get(Scroll.prototype.__proto__ || Object.getPrototypeOf(Scroll.prototype), 'path', this).call(this, index).slice(1); // Exclude self
        }
      }, {
        key: 'update',
        value: function update(mutations) {
          if (this.batch === true) return;
          var source = _emitter2.default.sources.USER;
          if (typeof mutations === 'string') {
            source = mutations;
          }
          if (!Array.isArray(mutations)) {
            mutations = this.observer.takeRecords();
          }
          if (mutations.length > 0) {
            this.emitter.emit(_emitter2.default.events.SCROLL_BEFORE_UPDATE, source, mutations);
          }
          _get(Scroll.prototype.__proto__ || Object.getPrototypeOf(Scroll.prototype), 'update', this).call(this, mutations.concat([])); // pass copy
          if (mutations.length > 0) {
            this.emitter.emit(_emitter2.default.events.SCROLL_UPDATE, source, mutations);
          }
        }
      }]);

      return Scroll;
    }(_parchment2.default.Scroll);

    Scroll.blotName = 'scroll';
    Scroll.className = 'ql-editor';
    Scroll.tagName = 'DIV';
    Scroll.defaultChild = 'block';
    Scroll.allowedChildren = [_block2.default, _block.BlockEmbed, _container2.default];

    exports.default = Scroll;

    /***/ }),
    /* 23 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.SHORTKEY = exports.default = undefined;

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

    var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    var _clone = __webpack_require__(21);

    var _clone2 = _interopRequireDefault(_clone);

    var _deepEqual = __webpack_require__(11);

    var _deepEqual2 = _interopRequireDefault(_deepEqual);

    var _extend = __webpack_require__(3);

    var _extend2 = _interopRequireDefault(_extend);

    var _quillDelta = __webpack_require__(2);

    var _quillDelta2 = _interopRequireDefault(_quillDelta);

    var _op = __webpack_require__(20);

    var _op2 = _interopRequireDefault(_op);

    var _parchment = __webpack_require__(0);

    var _parchment2 = _interopRequireDefault(_parchment);

    var _quill = __webpack_require__(5);

    var _quill2 = _interopRequireDefault(_quill);

    var _logger = __webpack_require__(10);

    var _logger2 = _interopRequireDefault(_logger);

    var _module = __webpack_require__(9);

    var _module2 = _interopRequireDefault(_module);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var debug = (0, _logger2.default)('quill:keyboard');

    var SHORTKEY = /Mac/i.test(navigator.platform) ? 'metaKey' : 'ctrlKey';

    var Keyboard = function (_Module) {
      _inherits(Keyboard, _Module);

      _createClass(Keyboard, null, [{
        key: 'match',
        value: function match(evt, binding) {
          binding = normalize(binding);
          if (['altKey', 'ctrlKey', 'metaKey', 'shiftKey'].some(function (key) {
            return !!binding[key] !== evt[key] && binding[key] !== null;
          })) {
            return false;
          }
          return binding.key === (evt.which || evt.keyCode);
        }
      }]);

      function Keyboard(quill, options) {
        _classCallCheck(this, Keyboard);

        var _this = _possibleConstructorReturn(this, (Keyboard.__proto__ || Object.getPrototypeOf(Keyboard)).call(this, quill, options));

        _this.bindings = {};
        Object.keys(_this.options.bindings).forEach(function (name) {
          if (name === 'list autofill' && quill.scroll.whitelist != null && !quill.scroll.whitelist['list']) {
            return;
          }
          if (_this.options.bindings[name]) {
            _this.addBinding(_this.options.bindings[name]);
          }
        });
        _this.addBinding({ key: Keyboard.keys.ENTER, shiftKey: null }, handleEnter);
        _this.addBinding({ key: Keyboard.keys.ENTER, metaKey: null, ctrlKey: null, altKey: null }, function () {});
        if (/Firefox/i.test(navigator.userAgent)) {
          // Need to handle delete and backspace for Firefox in the general case #1171
          _this.addBinding({ key: Keyboard.keys.BACKSPACE }, { collapsed: true }, handleBackspace);
          _this.addBinding({ key: Keyboard.keys.DELETE }, { collapsed: true }, handleDelete);
        } else {
          _this.addBinding({ key: Keyboard.keys.BACKSPACE }, { collapsed: true, prefix: /^.?$/ }, handleBackspace);
          _this.addBinding({ key: Keyboard.keys.DELETE }, { collapsed: true, suffix: /^.?$/ }, handleDelete);
        }
        _this.addBinding({ key: Keyboard.keys.BACKSPACE }, { collapsed: false }, handleDeleteRange);
        _this.addBinding({ key: Keyboard.keys.DELETE }, { collapsed: false }, handleDeleteRange);
        _this.addBinding({ key: Keyboard.keys.BACKSPACE, altKey: null, ctrlKey: null, metaKey: null, shiftKey: null }, { collapsed: true, offset: 0 }, handleBackspace);
        _this.listen();
        return _this;
      }

      _createClass(Keyboard, [{
        key: 'addBinding',
        value: function addBinding(key) {
          var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
          var handler = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

          var binding = normalize(key);
          if (binding == null || binding.key == null) {
            return debug.warn('Attempted to add invalid keyboard binding', binding);
          }
          if (typeof context === 'function') {
            context = { handler: context };
          }
          if (typeof handler === 'function') {
            handler = { handler: handler };
          }
          binding = (0, _extend2.default)(binding, context, handler);
          this.bindings[binding.key] = this.bindings[binding.key] || [];
          this.bindings[binding.key].push(binding);
        }
      }, {
        key: 'listen',
        value: function listen() {
          var _this2 = this;

          this.quill.root.addEventListener('keydown', function (evt) {
            if (evt.defaultPrevented) return;
            var which = evt.which || evt.keyCode;
            var bindings = (_this2.bindings[which] || []).filter(function (binding) {
              return Keyboard.match(evt, binding);
            });
            if (bindings.length === 0) return;
            var range = _this2.quill.getSelection();
            if (range == null || !_this2.quill.hasFocus()) return;

            var _quill$getLine = _this2.quill.getLine(range.index),
                _quill$getLine2 = _slicedToArray(_quill$getLine, 2),
                line = _quill$getLine2[0],
                offset = _quill$getLine2[1];

            var _quill$getLeaf = _this2.quill.getLeaf(range.index),
                _quill$getLeaf2 = _slicedToArray(_quill$getLeaf, 2),
                leafStart = _quill$getLeaf2[0],
                offsetStart = _quill$getLeaf2[1];

            var _ref = range.length === 0 ? [leafStart, offsetStart] : _this2.quill.getLeaf(range.index + range.length),
                _ref2 = _slicedToArray(_ref, 2),
                leafEnd = _ref2[0],
                offsetEnd = _ref2[1];

            var prefixText = leafStart instanceof _parchment2.default.Text ? leafStart.value().slice(0, offsetStart) : '';
            var suffixText = leafEnd instanceof _parchment2.default.Text ? leafEnd.value().slice(offsetEnd) : '';
            var curContext = {
              collapsed: range.length === 0,
              empty: range.length === 0 && line.length() <= 1,
              format: _this2.quill.getFormat(range),
              offset: offset,
              prefix: prefixText,
              suffix: suffixText
            };
            var prevented = bindings.some(function (binding) {
              if (binding.collapsed != null && binding.collapsed !== curContext.collapsed) return false;
              if (binding.empty != null && binding.empty !== curContext.empty) return false;
              if (binding.offset != null && binding.offset !== curContext.offset) return false;
              if (Array.isArray(binding.format)) {
                // any format is present
                if (binding.format.every(function (name) {
                  return curContext.format[name] == null;
                })) {
                  return false;
                }
              } else if (_typeof(binding.format) === 'object') {
                // all formats must match
                if (!Object.keys(binding.format).every(function (name) {
                  if (binding.format[name] === true) return curContext.format[name] != null;
                  if (binding.format[name] === false) return curContext.format[name] == null;
                  return (0, _deepEqual2.default)(binding.format[name], curContext.format[name]);
                })) {
                  return false;
                }
              }
              if (binding.prefix != null && !binding.prefix.test(curContext.prefix)) return false;
              if (binding.suffix != null && !binding.suffix.test(curContext.suffix)) return false;
              return binding.handler.call(_this2, range, curContext) !== true;
            });
            if (prevented) {
              evt.preventDefault();
            }
          });
        }
      }]);

      return Keyboard;
    }(_module2.default);

    Keyboard.keys = {
      BACKSPACE: 8,
      TAB: 9,
      ENTER: 13,
      ESCAPE: 27,
      LEFT: 37,
      UP: 38,
      RIGHT: 39,
      DOWN: 40,
      DELETE: 46
    };

    Keyboard.DEFAULTS = {
      bindings: {
        'bold': makeFormatHandler('bold'),
        'italic': makeFormatHandler('italic'),
        'underline': makeFormatHandler('underline'),
        'indent': {
          // highlight tab or tab at beginning of list, indent or blockquote
          key: Keyboard.keys.TAB,
          format: ['blockquote', 'indent', 'list'],
          handler: function handler(range, context) {
            if (context.collapsed && context.offset !== 0) return true;
            this.quill.format('indent', '+1', _quill2.default.sources.USER);
          }
        },
        'outdent': {
          key: Keyboard.keys.TAB,
          shiftKey: true,
          format: ['blockquote', 'indent', 'list'],
          // highlight tab or tab at beginning of list, indent or blockquote
          handler: function handler(range, context) {
            if (context.collapsed && context.offset !== 0) return true;
            this.quill.format('indent', '-1', _quill2.default.sources.USER);
          }
        },
        'outdent backspace': {
          key: Keyboard.keys.BACKSPACE,
          collapsed: true,
          shiftKey: null,
          metaKey: null,
          ctrlKey: null,
          altKey: null,
          format: ['indent', 'list'],
          offset: 0,
          handler: function handler(range, context) {
            if (context.format.indent != null) {
              this.quill.format('indent', '-1', _quill2.default.sources.USER);
            } else if (context.format.list != null) {
              this.quill.format('list', false, _quill2.default.sources.USER);
            }
          }
        },
        'indent code-block': makeCodeBlockHandler(true),
        'outdent code-block': makeCodeBlockHandler(false),
        'remove tab': {
          key: Keyboard.keys.TAB,
          shiftKey: true,
          collapsed: true,
          prefix: /\t$/,
          handler: function handler(range) {
            this.quill.deleteText(range.index - 1, 1, _quill2.default.sources.USER);
          }
        },
        'tab': {
          key: Keyboard.keys.TAB,
          handler: function handler(range) {
            this.quill.history.cutoff();
            var delta = new _quillDelta2.default().retain(range.index).delete(range.length).insert('\t');
            this.quill.updateContents(delta, _quill2.default.sources.USER);
            this.quill.history.cutoff();
            this.quill.setSelection(range.index + 1, _quill2.default.sources.SILENT);
          }
        },
        'list empty enter': {
          key: Keyboard.keys.ENTER,
          collapsed: true,
          format: ['list'],
          empty: true,
          handler: function handler(range, context) {
            this.quill.format('list', false, _quill2.default.sources.USER);
            if (context.format.indent) {
              this.quill.format('indent', false, _quill2.default.sources.USER);
            }
          }
        },
        'checklist enter': {
          key: Keyboard.keys.ENTER,
          collapsed: true,
          format: { list: 'checked' },
          handler: function handler(range) {
            var _quill$getLine3 = this.quill.getLine(range.index),
                _quill$getLine4 = _slicedToArray(_quill$getLine3, 2),
                line = _quill$getLine4[0],
                offset = _quill$getLine4[1];

            var formats = (0, _extend2.default)({}, line.formats(), { list: 'checked' });
            var delta = new _quillDelta2.default().retain(range.index).insert('\n', formats).retain(line.length() - offset - 1).retain(1, { list: 'unchecked' });
            this.quill.updateContents(delta, _quill2.default.sources.USER);
            this.quill.setSelection(range.index + 1, _quill2.default.sources.SILENT);
            this.quill.scrollIntoView();
          }
        },
        'header enter': {
          key: Keyboard.keys.ENTER,
          collapsed: true,
          format: ['header'],
          suffix: /^$/,
          handler: function handler(range, context) {
            var _quill$getLine5 = this.quill.getLine(range.index),
                _quill$getLine6 = _slicedToArray(_quill$getLine5, 2),
                line = _quill$getLine6[0],
                offset = _quill$getLine6[1];

            var delta = new _quillDelta2.default().retain(range.index).insert('\n', context.format).retain(line.length() - offset - 1).retain(1, { header: null });
            this.quill.updateContents(delta, _quill2.default.sources.USER);
            this.quill.setSelection(range.index + 1, _quill2.default.sources.SILENT);
            this.quill.scrollIntoView();
          }
        },
        'list autofill': {
          key: ' ',
          collapsed: true,
          format: { list: false },
          prefix: /^\s*?(\d+\.|-|\*|\[ ?\]|\[x\])$/,
          handler: function handler(range, context) {
            var length = context.prefix.length;

            var _quill$getLine7 = this.quill.getLine(range.index),
                _quill$getLine8 = _slicedToArray(_quill$getLine7, 2),
                line = _quill$getLine8[0],
                offset = _quill$getLine8[1];

            if (offset > length) return true;
            var value = void 0;
            switch (context.prefix.trim()) {
              case '[]':case '[ ]':
                value = 'unchecked';
                break;
              case '[x]':
                value = 'checked';
                break;
              case '-':case '*':
                value = 'bullet';
                break;
              default:
                value = 'ordered';
            }
            this.quill.insertText(range.index, ' ', _quill2.default.sources.USER);
            this.quill.history.cutoff();
            var delta = new _quillDelta2.default().retain(range.index - offset).delete(length + 1).retain(line.length() - 2 - offset).retain(1, { list: value });
            this.quill.updateContents(delta, _quill2.default.sources.USER);
            this.quill.history.cutoff();
            this.quill.setSelection(range.index - length, _quill2.default.sources.SILENT);
          }
        },
        'code exit': {
          key: Keyboard.keys.ENTER,
          collapsed: true,
          format: ['code-block'],
          prefix: /\n\n$/,
          suffix: /^\s+$/,
          handler: function handler(range) {
            var _quill$getLine9 = this.quill.getLine(range.index),
                _quill$getLine10 = _slicedToArray(_quill$getLine9, 2),
                line = _quill$getLine10[0],
                offset = _quill$getLine10[1];

            var delta = new _quillDelta2.default().retain(range.index + line.length() - offset - 2).retain(1, { 'code-block': null }).delete(1);
            this.quill.updateContents(delta, _quill2.default.sources.USER);
          }
        },
        'embed left': makeEmbedArrowHandler(Keyboard.keys.LEFT, false),
        'embed left shift': makeEmbedArrowHandler(Keyboard.keys.LEFT, true),
        'embed right': makeEmbedArrowHandler(Keyboard.keys.RIGHT, false),
        'embed right shift': makeEmbedArrowHandler(Keyboard.keys.RIGHT, true)
      }
    };

    function makeEmbedArrowHandler(key, shiftKey) {
      var _ref3;

      var where = key === Keyboard.keys.LEFT ? 'prefix' : 'suffix';
      return _ref3 = {
        key: key,
        shiftKey: shiftKey,
        altKey: null
      }, _defineProperty(_ref3, where, /^$/), _defineProperty(_ref3, 'handler', function handler(range) {
        var index = range.index;
        if (key === Keyboard.keys.RIGHT) {
          index += range.length + 1;
        }

        var _quill$getLeaf3 = this.quill.getLeaf(index),
            _quill$getLeaf4 = _slicedToArray(_quill$getLeaf3, 1),
            leaf = _quill$getLeaf4[0];

        if (!(leaf instanceof _parchment2.default.Embed)) return true;
        if (key === Keyboard.keys.LEFT) {
          if (shiftKey) {
            this.quill.setSelection(range.index - 1, range.length + 1, _quill2.default.sources.USER);
          } else {
            this.quill.setSelection(range.index - 1, _quill2.default.sources.USER);
          }
        } else {
          if (shiftKey) {
            this.quill.setSelection(range.index, range.length + 1, _quill2.default.sources.USER);
          } else {
            this.quill.setSelection(range.index + range.length + 1, _quill2.default.sources.USER);
          }
        }
        return false;
      }), _ref3;
    }

    function handleBackspace(range, context) {
      if (range.index === 0 || this.quill.getLength() <= 1) return;

      var _quill$getLine11 = this.quill.getLine(range.index),
          _quill$getLine12 = _slicedToArray(_quill$getLine11, 1),
          line = _quill$getLine12[0];

      var formats = {};
      if (context.offset === 0) {
        var _quill$getLine13 = this.quill.getLine(range.index - 1),
            _quill$getLine14 = _slicedToArray(_quill$getLine13, 1),
            prev = _quill$getLine14[0];

        if (prev != null && prev.length() > 1) {
          var curFormats = line.formats();
          var prevFormats = this.quill.getFormat(range.index - 1, 1);
          formats = _op2.default.attributes.diff(curFormats, prevFormats) || {};
        }
      }
      // Check for astral symbols
      var length = /[\uD800-\uDBFF][\uDC00-\uDFFF]$/.test(context.prefix) ? 2 : 1;
      this.quill.deleteText(range.index - length, length, _quill2.default.sources.USER);
      if (Object.keys(formats).length > 0) {
        this.quill.formatLine(range.index - length, length, formats, _quill2.default.sources.USER);
      }
      this.quill.focus();
    }

    function handleDelete(range, context) {
      // Check for astral symbols
      var length = /^[\uD800-\uDBFF][\uDC00-\uDFFF]/.test(context.suffix) ? 2 : 1;
      if (range.index >= this.quill.getLength() - length) return;
      var formats = {},
          nextLength = 0;

      var _quill$getLine15 = this.quill.getLine(range.index),
          _quill$getLine16 = _slicedToArray(_quill$getLine15, 1),
          line = _quill$getLine16[0];

      if (context.offset >= line.length() - 1) {
        var _quill$getLine17 = this.quill.getLine(range.index + 1),
            _quill$getLine18 = _slicedToArray(_quill$getLine17, 1),
            next = _quill$getLine18[0];

        if (next) {
          var curFormats = line.formats();
          var nextFormats = this.quill.getFormat(range.index, 1);
          formats = _op2.default.attributes.diff(curFormats, nextFormats) || {};
          nextLength = next.length();
        }
      }
      this.quill.deleteText(range.index, length, _quill2.default.sources.USER);
      if (Object.keys(formats).length > 0) {
        this.quill.formatLine(range.index + nextLength - 1, length, formats, _quill2.default.sources.USER);
      }
    }

    function handleDeleteRange(range) {
      var lines = this.quill.getLines(range);
      var formats = {};
      if (lines.length > 1) {
        var firstFormats = lines[0].formats();
        var lastFormats = lines[lines.length - 1].formats();
        formats = _op2.default.attributes.diff(lastFormats, firstFormats) || {};
      }
      this.quill.deleteText(range, _quill2.default.sources.USER);
      if (Object.keys(formats).length > 0) {
        this.quill.formatLine(range.index, 1, formats, _quill2.default.sources.USER);
      }
      this.quill.setSelection(range.index, _quill2.default.sources.SILENT);
      this.quill.focus();
    }

    function handleEnter(range, context) {
      var _this3 = this;

      if (range.length > 0) {
        this.quill.scroll.deleteAt(range.index, range.length); // So we do not trigger text-change
      }
      var lineFormats = Object.keys(context.format).reduce(function (lineFormats, format) {
        if (_parchment2.default.query(format, _parchment2.default.Scope.BLOCK) && !Array.isArray(context.format[format])) {
          lineFormats[format] = context.format[format];
        }
        return lineFormats;
      }, {});
      this.quill.insertText(range.index, '\n', lineFormats, _quill2.default.sources.USER);
      // Earlier scroll.deleteAt might have messed up our selection,
      // so insertText's built in selection preservation is not reliable
      this.quill.setSelection(range.index + 1, _quill2.default.sources.SILENT);
      this.quill.focus();
      Object.keys(context.format).forEach(function (name) {
        if (lineFormats[name] != null) return;
        if (Array.isArray(context.format[name])) return;
        if (name === 'link') return;
        _this3.quill.format(name, context.format[name], _quill2.default.sources.USER);
      });
    }

    function makeCodeBlockHandler(indent) {
      return {
        key: Keyboard.keys.TAB,
        shiftKey: !indent,
        format: { 'code-block': true },
        handler: function handler(range) {
          var CodeBlock = _parchment2.default.query('code-block');
          var index = range.index,
              length = range.length;

          var _quill$scroll$descend = this.quill.scroll.descendant(CodeBlock, index),
              _quill$scroll$descend2 = _slicedToArray(_quill$scroll$descend, 2),
              block = _quill$scroll$descend2[0],
              offset = _quill$scroll$descend2[1];

          if (block == null) return;
          var scrollIndex = this.quill.getIndex(block);
          var start = block.newlineIndex(offset, true) + 1;
          var end = block.newlineIndex(scrollIndex + offset + length);
          var lines = block.domNode.textContent.slice(start, end).split('\n');
          offset = 0;
          lines.forEach(function (line, i) {
            if (indent) {
              block.insertAt(start + offset, CodeBlock.TAB);
              offset += CodeBlock.TAB.length;
              if (i === 0) {
                index += CodeBlock.TAB.length;
              } else {
                length += CodeBlock.TAB.length;
              }
            } else if (line.startsWith(CodeBlock.TAB)) {
              block.deleteAt(start + offset, CodeBlock.TAB.length);
              offset -= CodeBlock.TAB.length;
              if (i === 0) {
                index -= CodeBlock.TAB.length;
              } else {
                length -= CodeBlock.TAB.length;
              }
            }
            offset += line.length + 1;
          });
          this.quill.update(_quill2.default.sources.USER);
          this.quill.setSelection(index, length, _quill2.default.sources.SILENT);
        }
      };
    }

    function makeFormatHandler(format) {
      return {
        key: format[0].toUpperCase(),
        shortKey: true,
        handler: function handler(range, context) {
          this.quill.format(format, !context.format[format], _quill2.default.sources.USER);
        }
      };
    }

    function normalize(binding) {
      if (typeof binding === 'string' || typeof binding === 'number') {
        return normalize({ key: binding });
      }
      if ((typeof binding === 'undefined' ? 'undefined' : _typeof(binding)) === 'object') {
        binding = (0, _clone2.default)(binding, false);
      }
      if (typeof binding.key === 'string') {
        if (Keyboard.keys[binding.key.toUpperCase()] != null) {
          binding.key = Keyboard.keys[binding.key.toUpperCase()];
        } else if (binding.key.length === 1) {
          binding.key = binding.key.toUpperCase().charCodeAt(0);
        } else {
          return null;
        }
      }
      if (binding.shortKey) {
        binding[SHORTKEY] = binding.shortKey;
        delete binding.shortKey;
      }
      return binding;
    }

    exports.default = Keyboard;
    exports.SHORTKEY = SHORTKEY;

    /***/ }),
    /* 24 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

    var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    var _parchment = __webpack_require__(0);

    var _parchment2 = _interopRequireDefault(_parchment);

    var _text = __webpack_require__(7);

    var _text2 = _interopRequireDefault(_text);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var Cursor = function (_Parchment$Embed) {
      _inherits(Cursor, _Parchment$Embed);

      _createClass(Cursor, null, [{
        key: 'value',
        value: function value() {
          return undefined;
        }
      }]);

      function Cursor(domNode, selection) {
        _classCallCheck(this, Cursor);

        var _this = _possibleConstructorReturn(this, (Cursor.__proto__ || Object.getPrototypeOf(Cursor)).call(this, domNode));

        _this.selection = selection;
        _this.textNode = document.createTextNode(Cursor.CONTENTS);
        _this.domNode.appendChild(_this.textNode);
        _this._length = 0;
        return _this;
      }

      _createClass(Cursor, [{
        key: 'detach',
        value: function detach() {
          // super.detach() will also clear domNode.__blot
          if (this.parent != null) this.parent.removeChild(this);
        }
      }, {
        key: 'format',
        value: function format(name, value) {
          if (this._length !== 0) {
            return _get(Cursor.prototype.__proto__ || Object.getPrototypeOf(Cursor.prototype), 'format', this).call(this, name, value);
          }
          var target = this,
              index = 0;
          while (target != null && target.statics.scope !== _parchment2.default.Scope.BLOCK_BLOT) {
            index += target.offset(target.parent);
            target = target.parent;
          }
          if (target != null) {
            this._length = Cursor.CONTENTS.length;
            target.optimize();
            target.formatAt(index, Cursor.CONTENTS.length, name, value);
            this._length = 0;
          }
        }
      }, {
        key: 'index',
        value: function index(node, offset) {
          if (node === this.textNode) return 0;
          return _get(Cursor.prototype.__proto__ || Object.getPrototypeOf(Cursor.prototype), 'index', this).call(this, node, offset);
        }
      }, {
        key: 'length',
        value: function length() {
          return this._length;
        }
      }, {
        key: 'position',
        value: function position() {
          return [this.textNode, this.textNode.data.length];
        }
      }, {
        key: 'remove',
        value: function remove() {
          _get(Cursor.prototype.__proto__ || Object.getPrototypeOf(Cursor.prototype), 'remove', this).call(this);
          this.parent = null;
        }
      }, {
        key: 'restore',
        value: function restore() {
          if (this.selection.composing || this.parent == null) return;
          var textNode = this.textNode;
          var range = this.selection.getNativeRange();
          var restoreText = void 0,
              start = void 0,
              end = void 0;
          if (range != null && range.start.node === textNode && range.end.node === textNode) {
            var _ref = [textNode, range.start.offset, range.end.offset];
            restoreText = _ref[0];
            start = _ref[1];
            end = _ref[2];
          }
          // Link format will insert text outside of anchor tag
          while (this.domNode.lastChild != null && this.domNode.lastChild !== this.textNode) {
            this.domNode.parentNode.insertBefore(this.domNode.lastChild, this.domNode);
          }
          if (this.textNode.data !== Cursor.CONTENTS) {
            var text = this.textNode.data.split(Cursor.CONTENTS).join('');
            if (this.next instanceof _text2.default) {
              restoreText = this.next.domNode;
              this.next.insertAt(0, text);
              this.textNode.data = Cursor.CONTENTS;
            } else {
              this.textNode.data = text;
              this.parent.insertBefore(_parchment2.default.create(this.textNode), this);
              this.textNode = document.createTextNode(Cursor.CONTENTS);
              this.domNode.appendChild(this.textNode);
            }
          }
          this.remove();
          if (start != null) {
            var _map = [start, end].map(function (offset) {
              return Math.max(0, Math.min(restoreText.data.length, offset - 1));
            });

            var _map2 = _slicedToArray(_map, 2);

            start = _map2[0];
            end = _map2[1];

            return {
              startNode: restoreText,
              startOffset: start,
              endNode: restoreText,
              endOffset: end
            };
          }
        }
      }, {
        key: 'update',
        value: function update(mutations, context) {
          var _this2 = this;

          if (mutations.some(function (mutation) {
            return mutation.type === 'characterData' && mutation.target === _this2.textNode;
          })) {
            var range = this.restore();
            if (range) context.range = range;
          }
        }
      }, {
        key: 'value',
        value: function value() {
          return '';
        }
      }]);

      return Cursor;
    }(_parchment2.default.Embed);

    Cursor.blotName = 'cursor';
    Cursor.className = 'ql-cursor';
    Cursor.tagName = 'span';
    Cursor.CONTENTS = '\uFEFF'; // Zero width no break space


    exports.default = Cursor;

    /***/ }),
    /* 25 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    var _parchment = __webpack_require__(0);

    var _parchment2 = _interopRequireDefault(_parchment);

    var _block = __webpack_require__(4);

    var _block2 = _interopRequireDefault(_block);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var Container = function (_Parchment$Container) {
      _inherits(Container, _Parchment$Container);

      function Container() {
        _classCallCheck(this, Container);

        return _possibleConstructorReturn(this, (Container.__proto__ || Object.getPrototypeOf(Container)).apply(this, arguments));
      }

      return Container;
    }(_parchment2.default.Container);

    Container.allowedChildren = [_block2.default, _block.BlockEmbed, Container];

    exports.default = Container;

    /***/ }),
    /* 26 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.ColorStyle = exports.ColorClass = exports.ColorAttributor = undefined;

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    var _parchment = __webpack_require__(0);

    var _parchment2 = _interopRequireDefault(_parchment);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var ColorAttributor = function (_Parchment$Attributor) {
      _inherits(ColorAttributor, _Parchment$Attributor);

      function ColorAttributor() {
        _classCallCheck(this, ColorAttributor);

        return _possibleConstructorReturn(this, (ColorAttributor.__proto__ || Object.getPrototypeOf(ColorAttributor)).apply(this, arguments));
      }

      _createClass(ColorAttributor, [{
        key: 'value',
        value: function value(domNode) {
          var value = _get(ColorAttributor.prototype.__proto__ || Object.getPrototypeOf(ColorAttributor.prototype), 'value', this).call(this, domNode);
          if (!value.startsWith('rgb(')) return value;
          value = value.replace(/^[^\d]+/, '').replace(/[^\d]+$/, '');
          return '#' + value.split(',').map(function (component) {
            return ('00' + parseInt(component).toString(16)).slice(-2);
          }).join('');
        }
      }]);

      return ColorAttributor;
    }(_parchment2.default.Attributor.Style);

    var ColorClass = new _parchment2.default.Attributor.Class('color', 'ql-color', {
      scope: _parchment2.default.Scope.INLINE
    });
    var ColorStyle = new ColorAttributor('color', 'color', {
      scope: _parchment2.default.Scope.INLINE
    });

    exports.ColorAttributor = ColorAttributor;
    exports.ColorClass = ColorClass;
    exports.ColorStyle = ColorStyle;

    /***/ }),
    /* 27 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.sanitize = exports.default = undefined;

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    var _inline = __webpack_require__(6);

    var _inline2 = _interopRequireDefault(_inline);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var Link = function (_Inline) {
      _inherits(Link, _Inline);

      function Link() {
        _classCallCheck(this, Link);

        return _possibleConstructorReturn(this, (Link.__proto__ || Object.getPrototypeOf(Link)).apply(this, arguments));
      }

      _createClass(Link, [{
        key: 'format',
        value: function format(name, value) {
          if (name !== this.statics.blotName || !value) return _get(Link.prototype.__proto__ || Object.getPrototypeOf(Link.prototype), 'format', this).call(this, name, value);
          value = this.constructor.sanitize(value);
          this.domNode.setAttribute('href', value);
        }
      }], [{
        key: 'create',
        value: function create(value) {
          var node = _get(Link.__proto__ || Object.getPrototypeOf(Link), 'create', this).call(this, value);
          value = this.sanitize(value);
          node.setAttribute('href', value);
          node.setAttribute('rel', 'noopener noreferrer');
          node.setAttribute('target', '_blank');
          return node;
        }
      }, {
        key: 'formats',
        value: function formats(domNode) {
          return domNode.getAttribute('href');
        }
      }, {
        key: 'sanitize',
        value: function sanitize(url) {
          return _sanitize(url, this.PROTOCOL_WHITELIST) ? url : this.SANITIZED_URL;
        }
      }]);

      return Link;
    }(_inline2.default);

    Link.blotName = 'link';
    Link.tagName = 'A';
    Link.SANITIZED_URL = 'about:blank';
    Link.PROTOCOL_WHITELIST = ['http', 'https', 'mailto', 'tel'];

    function _sanitize(url, protocols) {
      var anchor = document.createElement('a');
      anchor.href = url;
      var protocol = anchor.href.slice(0, anchor.href.indexOf(':'));
      return protocols.indexOf(protocol) > -1;
    }

    exports.default = Link;
    exports.sanitize = _sanitize;

    /***/ }),
    /* 28 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    var _keyboard = __webpack_require__(23);

    var _keyboard2 = _interopRequireDefault(_keyboard);

    var _dropdown = __webpack_require__(107);

    var _dropdown2 = _interopRequireDefault(_dropdown);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    var optionsCounter = 0;

    function toggleAriaAttribute(element, attribute) {
      element.setAttribute(attribute, !(element.getAttribute(attribute) === 'true'));
    }

    var Picker = function () {
      function Picker(select) {
        var _this = this;

        _classCallCheck(this, Picker);

        this.select = select;
        this.container = document.createElement('span');
        this.buildPicker();
        this.select.style.display = 'none';
        this.select.parentNode.insertBefore(this.container, this.select);

        this.label.addEventListener('mousedown', function () {
          _this.togglePicker();
        });
        this.label.addEventListener('keydown', function (event) {
          switch (event.keyCode) {
            // Allows the "Enter" key to open the picker
            case _keyboard2.default.keys.ENTER:
              _this.togglePicker();
              break;

            // Allows the "Escape" key to close the picker
            case _keyboard2.default.keys.ESCAPE:
              _this.escape();
              event.preventDefault();
              break;
          }
        });
        this.select.addEventListener('change', this.update.bind(this));
      }

      _createClass(Picker, [{
        key: 'togglePicker',
        value: function togglePicker() {
          this.container.classList.toggle('ql-expanded');
          // Toggle aria-expanded and aria-hidden to make the picker accessible
          toggleAriaAttribute(this.label, 'aria-expanded');
          toggleAriaAttribute(this.options, 'aria-hidden');
        }
      }, {
        key: 'buildItem',
        value: function buildItem(option) {
          var _this2 = this;

          var item = document.createElement('span');
          item.tabIndex = '0';
          item.setAttribute('role', 'button');

          item.classList.add('ql-picker-item');
          if (option.hasAttribute('value')) {
            item.setAttribute('data-value', option.getAttribute('value'));
          }
          if (option.textContent) {
            item.setAttribute('data-label', option.textContent);
          }
          item.addEventListener('click', function () {
            _this2.selectItem(item, true);
          });
          item.addEventListener('keydown', function (event) {
            switch (event.keyCode) {
              // Allows the "Enter" key to select an item
              case _keyboard2.default.keys.ENTER:
                _this2.selectItem(item, true);
                event.preventDefault();
                break;

              // Allows the "Escape" key to close the picker
              case _keyboard2.default.keys.ESCAPE:
                _this2.escape();
                event.preventDefault();
                break;
            }
          });

          return item;
        }
      }, {
        key: 'buildLabel',
        value: function buildLabel() {
          var label = document.createElement('span');
          label.classList.add('ql-picker-label');
          label.innerHTML = _dropdown2.default;
          label.tabIndex = '0';
          label.setAttribute('role', 'button');
          label.setAttribute('aria-expanded', 'false');
          this.container.appendChild(label);
          return label;
        }
      }, {
        key: 'buildOptions',
        value: function buildOptions() {
          var _this3 = this;

          var options = document.createElement('span');
          options.classList.add('ql-picker-options');

          // Don't want screen readers to read this until options are visible
          options.setAttribute('aria-hidden', 'true');
          options.tabIndex = '-1';

          // Need a unique id for aria-controls
          options.id = 'ql-picker-options-' + optionsCounter;
          optionsCounter += 1;
          this.label.setAttribute('aria-controls', options.id);

          this.options = options;

          [].slice.call(this.select.options).forEach(function (option) {
            var item = _this3.buildItem(option);
            options.appendChild(item);
            if (option.selected === true) {
              _this3.selectItem(item);
            }
          });
          this.container.appendChild(options);
        }
      }, {
        key: 'buildPicker',
        value: function buildPicker() {
          var _this4 = this;

          [].slice.call(this.select.attributes).forEach(function (item) {
            _this4.container.setAttribute(item.name, item.value);
          });
          this.container.classList.add('ql-picker');
          this.label = this.buildLabel();
          this.buildOptions();
        }
      }, {
        key: 'escape',
        value: function escape() {
          var _this5 = this;

          // Close menu and return focus to trigger label
          this.close();
          // Need setTimeout for accessibility to ensure that the browser executes
          // focus on the next process thread and after any DOM content changes
          setTimeout(function () {
            return _this5.label.focus();
          }, 1);
        }
      }, {
        key: 'close',
        value: function close() {
          this.container.classList.remove('ql-expanded');
          this.label.setAttribute('aria-expanded', 'false');
          this.options.setAttribute('aria-hidden', 'true');
        }
      }, {
        key: 'selectItem',
        value: function selectItem(item) {
          var trigger = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

          var selected = this.container.querySelector('.ql-selected');
          if (item === selected) return;
          if (selected != null) {
            selected.classList.remove('ql-selected');
          }
          if (item == null) return;
          item.classList.add('ql-selected');
          this.select.selectedIndex = [].indexOf.call(item.parentNode.children, item);
          if (item.hasAttribute('data-value')) {
            this.label.setAttribute('data-value', item.getAttribute('data-value'));
          } else {
            this.label.removeAttribute('data-value');
          }
          if (item.hasAttribute('data-label')) {
            this.label.setAttribute('data-label', item.getAttribute('data-label'));
          } else {
            this.label.removeAttribute('data-label');
          }
          if (trigger) {
            if (typeof Event === 'function') {
              this.select.dispatchEvent(new Event('change'));
            } else if ((typeof Event === 'undefined' ? 'undefined' : _typeof(Event)) === 'object') {
              // IE11
              var event = document.createEvent('Event');
              event.initEvent('change', true, true);
              this.select.dispatchEvent(event);
            }
            this.close();
          }
        }
      }, {
        key: 'update',
        value: function update() {
          var option = void 0;
          if (this.select.selectedIndex > -1) {
            var item = this.container.querySelector('.ql-picker-options').children[this.select.selectedIndex];
            option = this.select.options[this.select.selectedIndex];
            this.selectItem(item);
          } else {
            this.selectItem(null);
          }
          var isActive = option != null && option !== this.select.querySelector('option[selected]');
          this.label.classList.toggle('ql-active', isActive);
        }
      }]);

      return Picker;
    }();

    exports.default = Picker;

    /***/ }),
    /* 29 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    var _parchment = __webpack_require__(0);

    var _parchment2 = _interopRequireDefault(_parchment);

    var _quill = __webpack_require__(5);

    var _quill2 = _interopRequireDefault(_quill);

    var _block = __webpack_require__(4);

    var _block2 = _interopRequireDefault(_block);

    var _break = __webpack_require__(16);

    var _break2 = _interopRequireDefault(_break);

    var _container = __webpack_require__(25);

    var _container2 = _interopRequireDefault(_container);

    var _cursor = __webpack_require__(24);

    var _cursor2 = _interopRequireDefault(_cursor);

    var _embed = __webpack_require__(35);

    var _embed2 = _interopRequireDefault(_embed);

    var _inline = __webpack_require__(6);

    var _inline2 = _interopRequireDefault(_inline);

    var _scroll = __webpack_require__(22);

    var _scroll2 = _interopRequireDefault(_scroll);

    var _text = __webpack_require__(7);

    var _text2 = _interopRequireDefault(_text);

    var _clipboard = __webpack_require__(55);

    var _clipboard2 = _interopRequireDefault(_clipboard);

    var _history = __webpack_require__(42);

    var _history2 = _interopRequireDefault(_history);

    var _keyboard = __webpack_require__(23);

    var _keyboard2 = _interopRequireDefault(_keyboard);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    _quill2.default.register({
      'blots/block': _block2.default,
      'blots/block/embed': _block.BlockEmbed,
      'blots/break': _break2.default,
      'blots/container': _container2.default,
      'blots/cursor': _cursor2.default,
      'blots/embed': _embed2.default,
      'blots/inline': _inline2.default,
      'blots/scroll': _scroll2.default,
      'blots/text': _text2.default,

      'modules/clipboard': _clipboard2.default,
      'modules/history': _history2.default,
      'modules/keyboard': _keyboard2.default
    });

    _parchment2.default.register(_block2.default, _break2.default, _cursor2.default, _inline2.default, _scroll2.default, _text2.default);

    exports.default = _quill2.default;

    /***/ }),
    /* 30 */
    /***/ (function(module, exports, __webpack_require__) {

    Object.defineProperty(exports, "__esModule", { value: true });
    var Registry = __webpack_require__(1);
    var ShadowBlot = /** @class */ (function () {
        function ShadowBlot(domNode) {
            this.domNode = domNode;
            // @ts-ignore
            this.domNode[Registry.DATA_KEY] = { blot: this };
        }
        Object.defineProperty(ShadowBlot.prototype, "statics", {
            // Hack for accessing inherited static methods
            get: function () {
                return this.constructor;
            },
            enumerable: true,
            configurable: true
        });
        ShadowBlot.create = function (value) {
            if (this.tagName == null) {
                throw new Registry.ParchmentError('Blot definition missing tagName');
            }
            var node;
            if (Array.isArray(this.tagName)) {
                if (typeof value === 'string') {
                    value = value.toUpperCase();
                    if (parseInt(value).toString() === value) {
                        value = parseInt(value);
                    }
                }
                if (typeof value === 'number') {
                    node = document.createElement(this.tagName[value - 1]);
                }
                else if (this.tagName.indexOf(value) > -1) {
                    node = document.createElement(value);
                }
                else {
                    node = document.createElement(this.tagName[0]);
                }
            }
            else {
                node = document.createElement(this.tagName);
            }
            if (this.className) {
                node.classList.add(this.className);
            }
            return node;
        };
        ShadowBlot.prototype.attach = function () {
            if (this.parent != null) {
                this.scroll = this.parent.scroll;
            }
        };
        ShadowBlot.prototype.clone = function () {
            var domNode = this.domNode.cloneNode(false);
            return Registry.create(domNode);
        };
        ShadowBlot.prototype.detach = function () {
            if (this.parent != null)
                this.parent.removeChild(this);
            // @ts-ignore
            delete this.domNode[Registry.DATA_KEY];
        };
        ShadowBlot.prototype.deleteAt = function (index, length) {
            var blot = this.isolate(index, length);
            blot.remove();
        };
        ShadowBlot.prototype.formatAt = function (index, length, name, value) {
            var blot = this.isolate(index, length);
            if (Registry.query(name, Registry.Scope.BLOT) != null && value) {
                blot.wrap(name, value);
            }
            else if (Registry.query(name, Registry.Scope.ATTRIBUTE) != null) {
                var parent = Registry.create(this.statics.scope);
                blot.wrap(parent);
                parent.format(name, value);
            }
        };
        ShadowBlot.prototype.insertAt = function (index, value, def) {
            var blot = def == null ? Registry.create('text', value) : Registry.create(value, def);
            var ref = this.split(index);
            this.parent.insertBefore(blot, ref);
        };
        ShadowBlot.prototype.insertInto = function (parentBlot, refBlot) {
            if (refBlot === void 0) { refBlot = null; }
            if (this.parent != null) {
                this.parent.children.remove(this);
            }
            var refDomNode = null;
            parentBlot.children.insertBefore(this, refBlot);
            if (refBlot != null) {
                refDomNode = refBlot.domNode;
            }
            if (this.domNode.parentNode != parentBlot.domNode ||
                this.domNode.nextSibling != refDomNode) {
                parentBlot.domNode.insertBefore(this.domNode, refDomNode);
            }
            this.parent = parentBlot;
            this.attach();
        };
        ShadowBlot.prototype.isolate = function (index, length) {
            var target = this.split(index);
            target.split(length);
            return target;
        };
        ShadowBlot.prototype.length = function () {
            return 1;
        };
        ShadowBlot.prototype.offset = function (root) {
            if (root === void 0) { root = this.parent; }
            if (this.parent == null || this == root)
                return 0;
            return this.parent.children.offset(this) + this.parent.offset(root);
        };
        ShadowBlot.prototype.optimize = function (context) {
            // TODO clean up once we use WeakMap
            // @ts-ignore
            if (this.domNode[Registry.DATA_KEY] != null) {
                // @ts-ignore
                delete this.domNode[Registry.DATA_KEY].mutations;
            }
        };
        ShadowBlot.prototype.remove = function () {
            if (this.domNode.parentNode != null) {
                this.domNode.parentNode.removeChild(this.domNode);
            }
            this.detach();
        };
        ShadowBlot.prototype.replace = function (target) {
            if (target.parent == null)
                return;
            target.parent.insertBefore(this, target.next);
            target.remove();
        };
        ShadowBlot.prototype.replaceWith = function (name, value) {
            var replacement = typeof name === 'string' ? Registry.create(name, value) : name;
            replacement.replace(this);
            return replacement;
        };
        ShadowBlot.prototype.split = function (index, force) {
            return index === 0 ? this : this.next;
        };
        ShadowBlot.prototype.update = function (mutations, context) {
            // Nothing to do by default
        };
        ShadowBlot.prototype.wrap = function (name, value) {
            var wrapper = typeof name === 'string' ? Registry.create(name, value) : name;
            if (this.parent != null) {
                this.parent.insertBefore(wrapper, this.next);
            }
            wrapper.appendChild(this);
            return wrapper;
        };
        ShadowBlot.blotName = 'abstract';
        return ShadowBlot;
    }());
    exports.default = ShadowBlot;


    /***/ }),
    /* 31 */
    /***/ (function(module, exports, __webpack_require__) {

    Object.defineProperty(exports, "__esModule", { value: true });
    var attributor_1 = __webpack_require__(12);
    var class_1 = __webpack_require__(32);
    var style_1 = __webpack_require__(33);
    var Registry = __webpack_require__(1);
    var AttributorStore = /** @class */ (function () {
        function AttributorStore(domNode) {
            this.attributes = {};
            this.domNode = domNode;
            this.build();
        }
        AttributorStore.prototype.attribute = function (attribute, value) {
            // verb
            if (value) {
                if (attribute.add(this.domNode, value)) {
                    if (attribute.value(this.domNode) != null) {
                        this.attributes[attribute.attrName] = attribute;
                    }
                    else {
                        delete this.attributes[attribute.attrName];
                    }
                }
            }
            else {
                attribute.remove(this.domNode);
                delete this.attributes[attribute.attrName];
            }
        };
        AttributorStore.prototype.build = function () {
            var _this = this;
            this.attributes = {};
            var attributes = attributor_1.default.keys(this.domNode);
            var classes = class_1.default.keys(this.domNode);
            var styles = style_1.default.keys(this.domNode);
            attributes
                .concat(classes)
                .concat(styles)
                .forEach(function (name) {
                var attr = Registry.query(name, Registry.Scope.ATTRIBUTE);
                if (attr instanceof attributor_1.default) {
                    _this.attributes[attr.attrName] = attr;
                }
            });
        };
        AttributorStore.prototype.copy = function (target) {
            var _this = this;
            Object.keys(this.attributes).forEach(function (key) {
                var value = _this.attributes[key].value(_this.domNode);
                target.format(key, value);
            });
        };
        AttributorStore.prototype.move = function (target) {
            var _this = this;
            this.copy(target);
            Object.keys(this.attributes).forEach(function (key) {
                _this.attributes[key].remove(_this.domNode);
            });
            this.attributes = {};
        };
        AttributorStore.prototype.values = function () {
            var _this = this;
            return Object.keys(this.attributes).reduce(function (attributes, name) {
                attributes[name] = _this.attributes[name].value(_this.domNode);
                return attributes;
            }, {});
        };
        return AttributorStore;
    }());
    exports.default = AttributorStore;


    /***/ }),
    /* 32 */
    /***/ (function(module, exports, __webpack_require__) {

    var __extends = (this && this.__extends) || (function () {
        var extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    var attributor_1 = __webpack_require__(12);
    function match(node, prefix) {
        var className = node.getAttribute('class') || '';
        return className.split(/\s+/).filter(function (name) {
            return name.indexOf(prefix + "-") === 0;
        });
    }
    var ClassAttributor = /** @class */ (function (_super) {
        __extends(ClassAttributor, _super);
        function ClassAttributor() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ClassAttributor.keys = function (node) {
            return (node.getAttribute('class') || '').split(/\s+/).map(function (name) {
                return name
                    .split('-')
                    .slice(0, -1)
                    .join('-');
            });
        };
        ClassAttributor.prototype.add = function (node, value) {
            if (!this.canAdd(node, value))
                return false;
            this.remove(node);
            node.classList.add(this.keyName + "-" + value);
            return true;
        };
        ClassAttributor.prototype.remove = function (node) {
            var matches = match(node, this.keyName);
            matches.forEach(function (name) {
                node.classList.remove(name);
            });
            if (node.classList.length === 0) {
                node.removeAttribute('class');
            }
        };
        ClassAttributor.prototype.value = function (node) {
            var result = match(node, this.keyName)[0] || '';
            var value = result.slice(this.keyName.length + 1); // +1 for hyphen
            return this.canAdd(node, value) ? value : '';
        };
        return ClassAttributor;
    }(attributor_1.default));
    exports.default = ClassAttributor;


    /***/ }),
    /* 33 */
    /***/ (function(module, exports, __webpack_require__) {

    var __extends = (this && this.__extends) || (function () {
        var extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    var attributor_1 = __webpack_require__(12);
    function camelize(name) {
        var parts = name.split('-');
        var rest = parts
            .slice(1)
            .map(function (part) {
            return part[0].toUpperCase() + part.slice(1);
        })
            .join('');
        return parts[0] + rest;
    }
    var StyleAttributor = /** @class */ (function (_super) {
        __extends(StyleAttributor, _super);
        function StyleAttributor() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        StyleAttributor.keys = function (node) {
            return (node.getAttribute('style') || '').split(';').map(function (value) {
                var arr = value.split(':');
                return arr[0].trim();
            });
        };
        StyleAttributor.prototype.add = function (node, value) {
            if (!this.canAdd(node, value))
                return false;
            // @ts-ignore
            node.style[camelize(this.keyName)] = value;
            return true;
        };
        StyleAttributor.prototype.remove = function (node) {
            // @ts-ignore
            node.style[camelize(this.keyName)] = '';
            if (!node.getAttribute('style')) {
                node.removeAttribute('style');
            }
        };
        StyleAttributor.prototype.value = function (node) {
            // @ts-ignore
            var value = node.style[camelize(this.keyName)];
            return this.canAdd(node, value) ? value : '';
        };
        return StyleAttributor;
    }(attributor_1.default));
    exports.default = StyleAttributor;


    /***/ }),
    /* 34 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    var Theme = function () {
      function Theme(quill, options) {
        _classCallCheck(this, Theme);

        this.quill = quill;
        this.options = options;
        this.modules = {};
      }

      _createClass(Theme, [{
        key: 'init',
        value: function init() {
          var _this = this;

          Object.keys(this.options.modules).forEach(function (name) {
            if (_this.modules[name] == null) {
              _this.addModule(name);
            }
          });
        }
      }, {
        key: 'addModule',
        value: function addModule(name) {
          var moduleClass = this.quill.constructor.import('modules/' + name);
          this.modules[name] = new moduleClass(this.quill, this.options.modules[name] || {});
          return this.modules[name];
        }
      }]);

      return Theme;
    }();

    Theme.DEFAULTS = {
      modules: {}
    };
    Theme.themes = {
      'default': Theme
    };

    exports.default = Theme;

    /***/ }),
    /* 35 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    var _parchment = __webpack_require__(0);

    var _parchment2 = _interopRequireDefault(_parchment);

    var _text = __webpack_require__(7);

    var _text2 = _interopRequireDefault(_text);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var GUARD_TEXT = '\uFEFF';

    var Embed = function (_Parchment$Embed) {
      _inherits(Embed, _Parchment$Embed);

      function Embed(node) {
        _classCallCheck(this, Embed);

        var _this = _possibleConstructorReturn(this, (Embed.__proto__ || Object.getPrototypeOf(Embed)).call(this, node));

        _this.contentNode = document.createElement('span');
        _this.contentNode.setAttribute('contenteditable', false);
        [].slice.call(_this.domNode.childNodes).forEach(function (childNode) {
          _this.contentNode.appendChild(childNode);
        });
        _this.leftGuard = document.createTextNode(GUARD_TEXT);
        _this.rightGuard = document.createTextNode(GUARD_TEXT);
        _this.domNode.appendChild(_this.leftGuard);
        _this.domNode.appendChild(_this.contentNode);
        _this.domNode.appendChild(_this.rightGuard);
        return _this;
      }

      _createClass(Embed, [{
        key: 'index',
        value: function index(node, offset) {
          if (node === this.leftGuard) return 0;
          if (node === this.rightGuard) return 1;
          return _get(Embed.prototype.__proto__ || Object.getPrototypeOf(Embed.prototype), 'index', this).call(this, node, offset);
        }
      }, {
        key: 'restore',
        value: function restore(node) {
          var range = void 0,
              textNode = void 0;
          var text = node.data.split(GUARD_TEXT).join('');
          if (node === this.leftGuard) {
            if (this.prev instanceof _text2.default) {
              var prevLength = this.prev.length();
              this.prev.insertAt(prevLength, text);
              range = {
                startNode: this.prev.domNode,
                startOffset: prevLength + text.length
              };
            } else {
              textNode = document.createTextNode(text);
              this.parent.insertBefore(_parchment2.default.create(textNode), this);
              range = {
                startNode: textNode,
                startOffset: text.length
              };
            }
          } else if (node === this.rightGuard) {
            if (this.next instanceof _text2.default) {
              this.next.insertAt(0, text);
              range = {
                startNode: this.next.domNode,
                startOffset: text.length
              };
            } else {
              textNode = document.createTextNode(text);
              this.parent.insertBefore(_parchment2.default.create(textNode), this.next);
              range = {
                startNode: textNode,
                startOffset: text.length
              };
            }
          }
          node.data = GUARD_TEXT;
          return range;
        }
      }, {
        key: 'update',
        value: function update(mutations, context) {
          var _this2 = this;

          mutations.forEach(function (mutation) {
            if (mutation.type === 'characterData' && (mutation.target === _this2.leftGuard || mutation.target === _this2.rightGuard)) {
              var range = _this2.restore(mutation.target);
              if (range) context.range = range;
            }
          });
        }
      }]);

      return Embed;
    }(_parchment2.default.Embed);

    exports.default = Embed;

    /***/ }),
    /* 36 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.AlignStyle = exports.AlignClass = exports.AlignAttribute = undefined;

    var _parchment = __webpack_require__(0);

    var _parchment2 = _interopRequireDefault(_parchment);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    var config = {
      scope: _parchment2.default.Scope.BLOCK,
      whitelist: ['right', 'center', 'justify']
    };

    var AlignAttribute = new _parchment2.default.Attributor.Attribute('align', 'align', config);
    var AlignClass = new _parchment2.default.Attributor.Class('align', 'ql-align', config);
    var AlignStyle = new _parchment2.default.Attributor.Style('align', 'text-align', config);

    exports.AlignAttribute = AlignAttribute;
    exports.AlignClass = AlignClass;
    exports.AlignStyle = AlignStyle;

    /***/ }),
    /* 37 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.BackgroundStyle = exports.BackgroundClass = undefined;

    var _parchment = __webpack_require__(0);

    var _parchment2 = _interopRequireDefault(_parchment);

    var _color = __webpack_require__(26);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    var BackgroundClass = new _parchment2.default.Attributor.Class('background', 'ql-bg', {
      scope: _parchment2.default.Scope.INLINE
    });
    var BackgroundStyle = new _color.ColorAttributor('background', 'background-color', {
      scope: _parchment2.default.Scope.INLINE
    });

    exports.BackgroundClass = BackgroundClass;
    exports.BackgroundStyle = BackgroundStyle;

    /***/ }),
    /* 38 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.DirectionStyle = exports.DirectionClass = exports.DirectionAttribute = undefined;

    var _parchment = __webpack_require__(0);

    var _parchment2 = _interopRequireDefault(_parchment);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    var config = {
      scope: _parchment2.default.Scope.BLOCK,
      whitelist: ['rtl']
    };

    var DirectionAttribute = new _parchment2.default.Attributor.Attribute('direction', 'dir', config);
    var DirectionClass = new _parchment2.default.Attributor.Class('direction', 'ql-direction', config);
    var DirectionStyle = new _parchment2.default.Attributor.Style('direction', 'direction', config);

    exports.DirectionAttribute = DirectionAttribute;
    exports.DirectionClass = DirectionClass;
    exports.DirectionStyle = DirectionStyle;

    /***/ }),
    /* 39 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.FontClass = exports.FontStyle = undefined;

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    var _parchment = __webpack_require__(0);

    var _parchment2 = _interopRequireDefault(_parchment);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var config = {
      scope: _parchment2.default.Scope.INLINE,
      whitelist: ['serif', 'monospace']
    };

    var FontClass = new _parchment2.default.Attributor.Class('font', 'ql-font', config);

    var FontStyleAttributor = function (_Parchment$Attributor) {
      _inherits(FontStyleAttributor, _Parchment$Attributor);

      function FontStyleAttributor() {
        _classCallCheck(this, FontStyleAttributor);

        return _possibleConstructorReturn(this, (FontStyleAttributor.__proto__ || Object.getPrototypeOf(FontStyleAttributor)).apply(this, arguments));
      }

      _createClass(FontStyleAttributor, [{
        key: 'value',
        value: function value(node) {
          return _get(FontStyleAttributor.prototype.__proto__ || Object.getPrototypeOf(FontStyleAttributor.prototype), 'value', this).call(this, node).replace(/["']/g, '');
        }
      }]);

      return FontStyleAttributor;
    }(_parchment2.default.Attributor.Style);

    var FontStyle = new FontStyleAttributor('font', 'font-family', config);

    exports.FontStyle = FontStyle;
    exports.FontClass = FontClass;

    /***/ }),
    /* 40 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.SizeStyle = exports.SizeClass = undefined;

    var _parchment = __webpack_require__(0);

    var _parchment2 = _interopRequireDefault(_parchment);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    var SizeClass = new _parchment2.default.Attributor.Class('size', 'ql-size', {
      scope: _parchment2.default.Scope.INLINE,
      whitelist: ['small', 'large', 'huge']
    });
    var SizeStyle = new _parchment2.default.Attributor.Style('size', 'font-size', {
      scope: _parchment2.default.Scope.INLINE,
      whitelist: ['10px', '18px', '32px']
    });

    exports.SizeClass = SizeClass;
    exports.SizeStyle = SizeStyle;

    /***/ }),
    /* 41 */
    /***/ (function(module, exports, __webpack_require__) {


    module.exports = {
      'align': {
        '': __webpack_require__(76),
        'center': __webpack_require__(77),
        'right': __webpack_require__(78),
        'justify': __webpack_require__(79)
      },
      'background': __webpack_require__(80),
      'blockquote': __webpack_require__(81),
      'bold': __webpack_require__(82),
      'clean': __webpack_require__(83),
      'code': __webpack_require__(58),
      'code-block': __webpack_require__(58),
      'color': __webpack_require__(84),
      'direction': {
        '': __webpack_require__(85),
        'rtl': __webpack_require__(86)
      },
      'float': {
        'center': __webpack_require__(87),
        'full': __webpack_require__(88),
        'left': __webpack_require__(89),
        'right': __webpack_require__(90)
      },
      'formula': __webpack_require__(91),
      'header': {
        '1': __webpack_require__(92),
        '2': __webpack_require__(93)
      },
      'italic': __webpack_require__(94),
      'image': __webpack_require__(95),
      'indent': {
        '+1': __webpack_require__(96),
        '-1': __webpack_require__(97)
      },
      'link': __webpack_require__(98),
      'list': {
        'ordered': __webpack_require__(99),
        'bullet': __webpack_require__(100),
        'check': __webpack_require__(101)
      },
      'script': {
        'sub': __webpack_require__(102),
        'super': __webpack_require__(103)
      },
      'strike': __webpack_require__(104),
      'underline': __webpack_require__(105),
      'video': __webpack_require__(106)
    };

    /***/ }),
    /* 42 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.getLastChangeIndex = exports.default = undefined;

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    var _parchment = __webpack_require__(0);

    var _parchment2 = _interopRequireDefault(_parchment);

    var _quill = __webpack_require__(5);

    var _quill2 = _interopRequireDefault(_quill);

    var _module = __webpack_require__(9);

    var _module2 = _interopRequireDefault(_module);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var History = function (_Module) {
      _inherits(History, _Module);

      function History(quill, options) {
        _classCallCheck(this, History);

        var _this = _possibleConstructorReturn(this, (History.__proto__ || Object.getPrototypeOf(History)).call(this, quill, options));

        _this.lastRecorded = 0;
        _this.ignoreChange = false;
        _this.clear();
        _this.quill.on(_quill2.default.events.EDITOR_CHANGE, function (eventName, delta, oldDelta, source) {
          if (eventName !== _quill2.default.events.TEXT_CHANGE || _this.ignoreChange) return;
          if (!_this.options.userOnly || source === _quill2.default.sources.USER) {
            _this.record(delta, oldDelta);
          } else {
            _this.transform(delta);
          }
        });
        _this.quill.keyboard.addBinding({ key: 'Z', shortKey: true }, _this.undo.bind(_this));
        _this.quill.keyboard.addBinding({ key: 'Z', shortKey: true, shiftKey: true }, _this.redo.bind(_this));
        if (/Win/i.test(navigator.platform)) {
          _this.quill.keyboard.addBinding({ key: 'Y', shortKey: true }, _this.redo.bind(_this));
        }
        return _this;
      }

      _createClass(History, [{
        key: 'change',
        value: function change(source, dest) {
          if (this.stack[source].length === 0) return;
          var delta = this.stack[source].pop();
          this.stack[dest].push(delta);
          this.lastRecorded = 0;
          this.ignoreChange = true;
          this.quill.updateContents(delta[source], _quill2.default.sources.USER);
          this.ignoreChange = false;
          var index = getLastChangeIndex(delta[source]);
          this.quill.setSelection(index);
        }
      }, {
        key: 'clear',
        value: function clear() {
          this.stack = { undo: [], redo: [] };
        }
      }, {
        key: 'cutoff',
        value: function cutoff() {
          this.lastRecorded = 0;
        }
      }, {
        key: 'record',
        value: function record(changeDelta, oldDelta) {
          if (changeDelta.ops.length === 0) return;
          this.stack.redo = [];
          var undoDelta = this.quill.getContents().diff(oldDelta);
          var timestamp = Date.now();
          if (this.lastRecorded + this.options.delay > timestamp && this.stack.undo.length > 0) {
            var delta = this.stack.undo.pop();
            undoDelta = undoDelta.compose(delta.undo);
            changeDelta = delta.redo.compose(changeDelta);
          } else {
            this.lastRecorded = timestamp;
          }
          this.stack.undo.push({
            redo: changeDelta,
            undo: undoDelta
          });
          if (this.stack.undo.length > this.options.maxStack) {
            this.stack.undo.shift();
          }
        }
      }, {
        key: 'redo',
        value: function redo() {
          this.change('redo', 'undo');
        }
      }, {
        key: 'transform',
        value: function transform(delta) {
          this.stack.undo.forEach(function (change) {
            change.undo = delta.transform(change.undo, true);
            change.redo = delta.transform(change.redo, true);
          });
          this.stack.redo.forEach(function (change) {
            change.undo = delta.transform(change.undo, true);
            change.redo = delta.transform(change.redo, true);
          });
        }
      }, {
        key: 'undo',
        value: function undo() {
          this.change('undo', 'redo');
        }
      }]);

      return History;
    }(_module2.default);

    History.DEFAULTS = {
      delay: 1000,
      maxStack: 100,
      userOnly: false
    };

    function endsWithNewlineChange(delta) {
      var lastOp = delta.ops[delta.ops.length - 1];
      if (lastOp == null) return false;
      if (lastOp.insert != null) {
        return typeof lastOp.insert === 'string' && lastOp.insert.endsWith('\n');
      }
      if (lastOp.attributes != null) {
        return Object.keys(lastOp.attributes).some(function (attr) {
          return _parchment2.default.query(attr, _parchment2.default.Scope.BLOCK) != null;
        });
      }
      return false;
    }

    function getLastChangeIndex(delta) {
      var deleteLength = delta.reduce(function (length, op) {
        length += op.delete || 0;
        return length;
      }, 0);
      var changeIndex = delta.length() - deleteLength;
      if (endsWithNewlineChange(delta)) {
        changeIndex -= 1;
      }
      return changeIndex;
    }

    exports.default = History;
    exports.getLastChangeIndex = getLastChangeIndex;

    /***/ }),
    /* 43 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = exports.BaseTooltip = undefined;

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    var _extend = __webpack_require__(3);

    var _extend2 = _interopRequireDefault(_extend);

    var _quillDelta = __webpack_require__(2);

    var _quillDelta2 = _interopRequireDefault(_quillDelta);

    var _emitter = __webpack_require__(8);

    var _emitter2 = _interopRequireDefault(_emitter);

    var _keyboard = __webpack_require__(23);

    var _keyboard2 = _interopRequireDefault(_keyboard);

    var _theme = __webpack_require__(34);

    var _theme2 = _interopRequireDefault(_theme);

    var _colorPicker = __webpack_require__(59);

    var _colorPicker2 = _interopRequireDefault(_colorPicker);

    var _iconPicker = __webpack_require__(60);

    var _iconPicker2 = _interopRequireDefault(_iconPicker);

    var _picker = __webpack_require__(28);

    var _picker2 = _interopRequireDefault(_picker);

    var _tooltip = __webpack_require__(61);

    var _tooltip2 = _interopRequireDefault(_tooltip);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var ALIGNS = [false, 'center', 'right', 'justify'];

    var COLORS = ["#000000", "#e60000", "#ff9900", "#ffff00", "#008a00", "#0066cc", "#9933ff", "#ffffff", "#facccc", "#ffebcc", "#ffffcc", "#cce8cc", "#cce0f5", "#ebd6ff", "#bbbbbb", "#f06666", "#ffc266", "#ffff66", "#66b966", "#66a3e0", "#c285ff", "#888888", "#a10000", "#b26b00", "#b2b200", "#006100", "#0047b2", "#6b24b2", "#444444", "#5c0000", "#663d00", "#666600", "#003700", "#002966", "#3d1466"];

    var FONTS = [false, 'serif', 'monospace'];

    var HEADERS = ['1', '2', '3', false];

    var SIZES = ['small', false, 'large', 'huge'];

    var BaseTheme = function (_Theme) {
      _inherits(BaseTheme, _Theme);

      function BaseTheme(quill, options) {
        _classCallCheck(this, BaseTheme);

        var _this = _possibleConstructorReturn(this, (BaseTheme.__proto__ || Object.getPrototypeOf(BaseTheme)).call(this, quill, options));

        var listener = function listener(e) {
          if (!document.body.contains(quill.root)) {
            return document.body.removeEventListener('click', listener);
          }
          if (_this.tooltip != null && !_this.tooltip.root.contains(e.target) && document.activeElement !== _this.tooltip.textbox && !_this.quill.hasFocus()) {
            _this.tooltip.hide();
          }
          if (_this.pickers != null) {
            _this.pickers.forEach(function (picker) {
              if (!picker.container.contains(e.target)) {
                picker.close();
              }
            });
          }
        };
        quill.emitter.listenDOM('click', document.body, listener);
        return _this;
      }

      _createClass(BaseTheme, [{
        key: 'addModule',
        value: function addModule(name) {
          var module = _get(BaseTheme.prototype.__proto__ || Object.getPrototypeOf(BaseTheme.prototype), 'addModule', this).call(this, name);
          if (name === 'toolbar') {
            this.extendToolbar(module);
          }
          return module;
        }
      }, {
        key: 'buildButtons',
        value: function buildButtons(buttons, icons) {
          buttons.forEach(function (button) {
            var className = button.getAttribute('class') || '';
            className.split(/\s+/).forEach(function (name) {
              if (!name.startsWith('ql-')) return;
              name = name.slice('ql-'.length);
              if (icons[name] == null) return;
              if (name === 'direction') {
                button.innerHTML = icons[name][''] + icons[name]['rtl'];
              } else if (typeof icons[name] === 'string') {
                button.innerHTML = icons[name];
              } else {
                var value = button.value || '';
                if (value != null && icons[name][value]) {
                  button.innerHTML = icons[name][value];
                }
              }
            });
          });
        }
      }, {
        key: 'buildPickers',
        value: function buildPickers(selects, icons) {
          var _this2 = this;

          this.pickers = selects.map(function (select) {
            if (select.classList.contains('ql-align')) {
              if (select.querySelector('option') == null) {
                fillSelect(select, ALIGNS);
              }
              return new _iconPicker2.default(select, icons.align);
            } else if (select.classList.contains('ql-background') || select.classList.contains('ql-color')) {
              var format = select.classList.contains('ql-background') ? 'background' : 'color';
              if (select.querySelector('option') == null) {
                fillSelect(select, COLORS, format === 'background' ? '#ffffff' : '#000000');
              }
              return new _colorPicker2.default(select, icons[format]);
            } else {
              if (select.querySelector('option') == null) {
                if (select.classList.contains('ql-font')) {
                  fillSelect(select, FONTS);
                } else if (select.classList.contains('ql-header')) {
                  fillSelect(select, HEADERS);
                } else if (select.classList.contains('ql-size')) {
                  fillSelect(select, SIZES);
                }
              }
              return new _picker2.default(select);
            }
          });
          var update = function update() {
            _this2.pickers.forEach(function (picker) {
              picker.update();
            });
          };
          this.quill.on(_emitter2.default.events.EDITOR_CHANGE, update);
        }
      }]);

      return BaseTheme;
    }(_theme2.default);

    BaseTheme.DEFAULTS = (0, _extend2.default)(true, {}, _theme2.default.DEFAULTS, {
      modules: {
        toolbar: {
          handlers: {
            formula: function formula() {
              this.quill.theme.tooltip.edit('formula');
            },
            image: function image() {
              var _this3 = this;

              var fileInput = this.container.querySelector('input.ql-image[type=file]');
              if (fileInput == null) {
                fileInput = document.createElement('input');
                fileInput.setAttribute('type', 'file');
                fileInput.setAttribute('accept', 'image/png, image/gif, image/jpeg, image/bmp, image/x-icon');
                fileInput.classList.add('ql-image');
                fileInput.addEventListener('change', function () {
                  if (fileInput.files != null && fileInput.files[0] != null) {
                    var reader = new FileReader();
                    reader.onload = function (e) {
                      var range = _this3.quill.getSelection(true);
                      _this3.quill.updateContents(new _quillDelta2.default().retain(range.index).delete(range.length).insert({ image: e.target.result }), _emitter2.default.sources.USER);
                      _this3.quill.setSelection(range.index + 1, _emitter2.default.sources.SILENT);
                      fileInput.value = "";
                    };
                    reader.readAsDataURL(fileInput.files[0]);
                  }
                });
                this.container.appendChild(fileInput);
              }
              fileInput.click();
            },
            video: function video() {
              this.quill.theme.tooltip.edit('video');
            }
          }
        }
      }
    });

    var BaseTooltip = function (_Tooltip) {
      _inherits(BaseTooltip, _Tooltip);

      function BaseTooltip(quill, boundsContainer) {
        _classCallCheck(this, BaseTooltip);

        var _this4 = _possibleConstructorReturn(this, (BaseTooltip.__proto__ || Object.getPrototypeOf(BaseTooltip)).call(this, quill, boundsContainer));

        _this4.textbox = _this4.root.querySelector('input[type="text"]');
        _this4.listen();
        return _this4;
      }

      _createClass(BaseTooltip, [{
        key: 'listen',
        value: function listen() {
          var _this5 = this;

          this.textbox.addEventListener('keydown', function (event) {
            if (_keyboard2.default.match(event, 'enter')) {
              _this5.save();
              event.preventDefault();
            } else if (_keyboard2.default.match(event, 'escape')) {
              _this5.cancel();
              event.preventDefault();
            }
          });
        }
      }, {
        key: 'cancel',
        value: function cancel() {
          this.hide();
        }
      }, {
        key: 'edit',
        value: function edit() {
          var mode = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'link';
          var preview = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

          this.root.classList.remove('ql-hidden');
          this.root.classList.add('ql-editing');
          if (preview != null) {
            this.textbox.value = preview;
          } else if (mode !== this.root.getAttribute('data-mode')) {
            this.textbox.value = '';
          }
          this.position(this.quill.getBounds(this.quill.selection.savedRange));
          this.textbox.select();
          this.textbox.setAttribute('placeholder', this.textbox.getAttribute('data-' + mode) || '');
          this.root.setAttribute('data-mode', mode);
        }
      }, {
        key: 'restoreFocus',
        value: function restoreFocus() {
          var scrollTop = this.quill.scrollingContainer.scrollTop;
          this.quill.focus();
          this.quill.scrollingContainer.scrollTop = scrollTop;
        }
      }, {
        key: 'save',
        value: function save() {
          var value = this.textbox.value;
          switch (this.root.getAttribute('data-mode')) {
            case 'link':
              {
                var scrollTop = this.quill.root.scrollTop;
                if (this.linkRange) {
                  this.quill.formatText(this.linkRange, 'link', value, _emitter2.default.sources.USER);
                  delete this.linkRange;
                } else {
                  this.restoreFocus();
                  this.quill.format('link', value, _emitter2.default.sources.USER);
                }
                this.quill.root.scrollTop = scrollTop;
                break;
              }
            case 'video':
              {
                value = extractVideoUrl(value);
              } // eslint-disable-next-line no-fallthrough
            case 'formula':
              {
                if (!value) break;
                var range = this.quill.getSelection(true);
                if (range != null) {
                  var index = range.index + range.length;
                  this.quill.insertEmbed(index, this.root.getAttribute('data-mode'), value, _emitter2.default.sources.USER);
                  if (this.root.getAttribute('data-mode') === 'formula') {
                    this.quill.insertText(index + 1, ' ', _emitter2.default.sources.USER);
                  }
                  this.quill.setSelection(index + 2, _emitter2.default.sources.USER);
                }
                break;
              }
          }
          this.textbox.value = '';
          this.hide();
        }
      }]);

      return BaseTooltip;
    }(_tooltip2.default);

    function extractVideoUrl(url) {
      var match = url.match(/^(?:(https?):\/\/)?(?:(?:www|m)\.)?youtube\.com\/watch.*v=([a-zA-Z0-9_-]+)/) || url.match(/^(?:(https?):\/\/)?(?:(?:www|m)\.)?youtu\.be\/([a-zA-Z0-9_-]+)/);
      if (match) {
        return (match[1] || 'https') + '://www.youtube.com/embed/' + match[2] + '?showinfo=0';
      }
      if (match = url.match(/^(?:(https?):\/\/)?(?:www\.)?vimeo\.com\/(\d+)/)) {
        // eslint-disable-line no-cond-assign
        return (match[1] || 'https') + '://player.vimeo.com/video/' + match[2] + '/';
      }
      return url;
    }

    function fillSelect(select, values) {
      var defaultValue = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

      values.forEach(function (value) {
        var option = document.createElement('option');
        if (value === defaultValue) {
          option.setAttribute('selected', 'selected');
        } else {
          option.setAttribute('value', value);
        }
        select.appendChild(option);
      });
    }

    exports.BaseTooltip = BaseTooltip;
    exports.default = BaseTheme;

    /***/ }),
    /* 44 */
    /***/ (function(module, exports, __webpack_require__) {

    Object.defineProperty(exports, "__esModule", { value: true });
    var LinkedList = /** @class */ (function () {
        function LinkedList() {
            this.head = this.tail = null;
            this.length = 0;
        }
        LinkedList.prototype.append = function () {
            var nodes = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                nodes[_i] = arguments[_i];
            }
            this.insertBefore(nodes[0], null);
            if (nodes.length > 1) {
                this.append.apply(this, nodes.slice(1));
            }
        };
        LinkedList.prototype.contains = function (node) {
            var cur, next = this.iterator();
            while ((cur = next())) {
                if (cur === node)
                    return true;
            }
            return false;
        };
        LinkedList.prototype.insertBefore = function (node, refNode) {
            if (!node)
                return;
            node.next = refNode;
            if (refNode != null) {
                node.prev = refNode.prev;
                if (refNode.prev != null) {
                    refNode.prev.next = node;
                }
                refNode.prev = node;
                if (refNode === this.head) {
                    this.head = node;
                }
            }
            else if (this.tail != null) {
                this.tail.next = node;
                node.prev = this.tail;
                this.tail = node;
            }
            else {
                node.prev = null;
                this.head = this.tail = node;
            }
            this.length += 1;
        };
        LinkedList.prototype.offset = function (target) {
            var index = 0, cur = this.head;
            while (cur != null) {
                if (cur === target)
                    return index;
                index += cur.length();
                cur = cur.next;
            }
            return -1;
        };
        LinkedList.prototype.remove = function (node) {
            if (!this.contains(node))
                return;
            if (node.prev != null)
                node.prev.next = node.next;
            if (node.next != null)
                node.next.prev = node.prev;
            if (node === this.head)
                this.head = node.next;
            if (node === this.tail)
                this.tail = node.prev;
            this.length -= 1;
        };
        LinkedList.prototype.iterator = function (curNode) {
            if (curNode === void 0) { curNode = this.head; }
            // TODO use yield when we can
            return function () {
                var ret = curNode;
                if (curNode != null)
                    curNode = curNode.next;
                return ret;
            };
        };
        LinkedList.prototype.find = function (index, inclusive) {
            if (inclusive === void 0) { inclusive = false; }
            var cur, next = this.iterator();
            while ((cur = next())) {
                var length = cur.length();
                if (index < length ||
                    (inclusive && index === length && (cur.next == null || cur.next.length() !== 0))) {
                    return [cur, index];
                }
                index -= length;
            }
            return [null, 0];
        };
        LinkedList.prototype.forEach = function (callback) {
            var cur, next = this.iterator();
            while ((cur = next())) {
                callback(cur);
            }
        };
        LinkedList.prototype.forEachAt = function (index, length, callback) {
            if (length <= 0)
                return;
            var _a = this.find(index), startNode = _a[0], offset = _a[1];
            var cur, curIndex = index - offset, next = this.iterator(startNode);
            while ((cur = next()) && curIndex < index + length) {
                var curLength = cur.length();
                if (index > curIndex) {
                    callback(cur, index - curIndex, Math.min(length, curIndex + curLength - index));
                }
                else {
                    callback(cur, 0, Math.min(curLength, index + length - curIndex));
                }
                curIndex += curLength;
            }
        };
        LinkedList.prototype.map = function (callback) {
            return this.reduce(function (memo, cur) {
                memo.push(callback(cur));
                return memo;
            }, []);
        };
        LinkedList.prototype.reduce = function (callback, memo) {
            var cur, next = this.iterator();
            while ((cur = next())) {
                memo = callback(memo, cur);
            }
            return memo;
        };
        return LinkedList;
    }());
    exports.default = LinkedList;


    /***/ }),
    /* 45 */
    /***/ (function(module, exports, __webpack_require__) {

    var __extends = (this && this.__extends) || (function () {
        var extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    var container_1 = __webpack_require__(17);
    var Registry = __webpack_require__(1);
    var OBSERVER_CONFIG = {
        attributes: true,
        characterData: true,
        characterDataOldValue: true,
        childList: true,
        subtree: true,
    };
    var MAX_OPTIMIZE_ITERATIONS = 100;
    var ScrollBlot = /** @class */ (function (_super) {
        __extends(ScrollBlot, _super);
        function ScrollBlot(node) {
            var _this = _super.call(this, node) || this;
            _this.scroll = _this;
            _this.observer = new MutationObserver(function (mutations) {
                _this.update(mutations);
            });
            _this.observer.observe(_this.domNode, OBSERVER_CONFIG);
            _this.attach();
            return _this;
        }
        ScrollBlot.prototype.detach = function () {
            _super.prototype.detach.call(this);
            this.observer.disconnect();
        };
        ScrollBlot.prototype.deleteAt = function (index, length) {
            this.update();
            if (index === 0 && length === this.length()) {
                this.children.forEach(function (child) {
                    child.remove();
                });
            }
            else {
                _super.prototype.deleteAt.call(this, index, length);
            }
        };
        ScrollBlot.prototype.formatAt = function (index, length, name, value) {
            this.update();
            _super.prototype.formatAt.call(this, index, length, name, value);
        };
        ScrollBlot.prototype.insertAt = function (index, value, def) {
            this.update();
            _super.prototype.insertAt.call(this, index, value, def);
        };
        ScrollBlot.prototype.optimize = function (mutations, context) {
            var _this = this;
            if (mutations === void 0) { mutations = []; }
            if (context === void 0) { context = {}; }
            _super.prototype.optimize.call(this, context);
            // We must modify mutations directly, cannot make copy and then modify
            var records = [].slice.call(this.observer.takeRecords());
            // Array.push currently seems to be implemented by a non-tail recursive function
            // so we cannot just mutations.push.apply(mutations, this.observer.takeRecords());
            while (records.length > 0)
                mutations.push(records.pop());
            // TODO use WeakMap
            var mark = function (blot, markParent) {
                if (markParent === void 0) { markParent = true; }
                if (blot == null || blot === _this)
                    return;
                if (blot.domNode.parentNode == null)
                    return;
                // @ts-ignore
                if (blot.domNode[Registry.DATA_KEY].mutations == null) {
                    // @ts-ignore
                    blot.domNode[Registry.DATA_KEY].mutations = [];
                }
                if (markParent)
                    mark(blot.parent);
            };
            var optimize = function (blot) {
                // Post-order traversal
                if (
                // @ts-ignore
                blot.domNode[Registry.DATA_KEY] == null ||
                    // @ts-ignore
                    blot.domNode[Registry.DATA_KEY].mutations == null) {
                    return;
                }
                if (blot instanceof container_1.default) {
                    blot.children.forEach(optimize);
                }
                blot.optimize(context);
            };
            var remaining = mutations;
            for (var i = 0; remaining.length > 0; i += 1) {
                if (i >= MAX_OPTIMIZE_ITERATIONS) {
                    throw new Error('[Parchment] Maximum optimize iterations reached');
                }
                remaining.forEach(function (mutation) {
                    var blot = Registry.find(mutation.target, true);
                    if (blot == null)
                        return;
                    if (blot.domNode === mutation.target) {
                        if (mutation.type === 'childList') {
                            mark(Registry.find(mutation.previousSibling, false));
                            [].forEach.call(mutation.addedNodes, function (node) {
                                var child = Registry.find(node, false);
                                mark(child, false);
                                if (child instanceof container_1.default) {
                                    child.children.forEach(function (grandChild) {
                                        mark(grandChild, false);
                                    });
                                }
                            });
                        }
                        else if (mutation.type === 'attributes') {
                            mark(blot.prev);
                        }
                    }
                    mark(blot);
                });
                this.children.forEach(optimize);
                remaining = [].slice.call(this.observer.takeRecords());
                records = remaining.slice();
                while (records.length > 0)
                    mutations.push(records.pop());
            }
        };
        ScrollBlot.prototype.update = function (mutations, context) {
            var _this = this;
            if (context === void 0) { context = {}; }
            mutations = mutations || this.observer.takeRecords();
            // TODO use WeakMap
            mutations
                .map(function (mutation) {
                var blot = Registry.find(mutation.target, true);
                if (blot == null)
                    return null;
                // @ts-ignore
                if (blot.domNode[Registry.DATA_KEY].mutations == null) {
                    // @ts-ignore
                    blot.domNode[Registry.DATA_KEY].mutations = [mutation];
                    return blot;
                }
                else {
                    // @ts-ignore
                    blot.domNode[Registry.DATA_KEY].mutations.push(mutation);
                    return null;
                }
            })
                .forEach(function (blot) {
                if (blot == null ||
                    blot === _this ||
                    //@ts-ignore
                    blot.domNode[Registry.DATA_KEY] == null)
                    return;
                // @ts-ignore
                blot.update(blot.domNode[Registry.DATA_KEY].mutations || [], context);
            });
            // @ts-ignore
            if (this.domNode[Registry.DATA_KEY].mutations != null) {
                // @ts-ignore
                _super.prototype.update.call(this, this.domNode[Registry.DATA_KEY].mutations, context);
            }
            this.optimize(mutations, context);
        };
        ScrollBlot.blotName = 'scroll';
        ScrollBlot.defaultChild = 'block';
        ScrollBlot.scope = Registry.Scope.BLOCK_BLOT;
        ScrollBlot.tagName = 'DIV';
        return ScrollBlot;
    }(container_1.default));
    exports.default = ScrollBlot;


    /***/ }),
    /* 46 */
    /***/ (function(module, exports, __webpack_require__) {

    var __extends = (this && this.__extends) || (function () {
        var extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    var format_1 = __webpack_require__(18);
    var Registry = __webpack_require__(1);
    // Shallow object comparison
    function isEqual(obj1, obj2) {
        if (Object.keys(obj1).length !== Object.keys(obj2).length)
            return false;
        // @ts-ignore
        for (var prop in obj1) {
            // @ts-ignore
            if (obj1[prop] !== obj2[prop])
                return false;
        }
        return true;
    }
    var InlineBlot = /** @class */ (function (_super) {
        __extends(InlineBlot, _super);
        function InlineBlot() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        InlineBlot.formats = function (domNode) {
            if (domNode.tagName === InlineBlot.tagName)
                return undefined;
            return _super.formats.call(this, domNode);
        };
        InlineBlot.prototype.format = function (name, value) {
            var _this = this;
            if (name === this.statics.blotName && !value) {
                this.children.forEach(function (child) {
                    if (!(child instanceof format_1.default)) {
                        child = child.wrap(InlineBlot.blotName, true);
                    }
                    _this.attributes.copy(child);
                });
                this.unwrap();
            }
            else {
                _super.prototype.format.call(this, name, value);
            }
        };
        InlineBlot.prototype.formatAt = function (index, length, name, value) {
            if (this.formats()[name] != null || Registry.query(name, Registry.Scope.ATTRIBUTE)) {
                var blot = this.isolate(index, length);
                blot.format(name, value);
            }
            else {
                _super.prototype.formatAt.call(this, index, length, name, value);
            }
        };
        InlineBlot.prototype.optimize = function (context) {
            _super.prototype.optimize.call(this, context);
            var formats = this.formats();
            if (Object.keys(formats).length === 0) {
                return this.unwrap(); // unformatted span
            }
            var next = this.next;
            if (next instanceof InlineBlot && next.prev === this && isEqual(formats, next.formats())) {
                next.moveChildren(this);
                next.remove();
            }
        };
        InlineBlot.blotName = 'inline';
        InlineBlot.scope = Registry.Scope.INLINE_BLOT;
        InlineBlot.tagName = 'SPAN';
        return InlineBlot;
    }(format_1.default));
    exports.default = InlineBlot;


    /***/ }),
    /* 47 */
    /***/ (function(module, exports, __webpack_require__) {

    var __extends = (this && this.__extends) || (function () {
        var extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    var format_1 = __webpack_require__(18);
    var Registry = __webpack_require__(1);
    var BlockBlot = /** @class */ (function (_super) {
        __extends(BlockBlot, _super);
        function BlockBlot() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        BlockBlot.formats = function (domNode) {
            var tagName = Registry.query(BlockBlot.blotName).tagName;
            if (domNode.tagName === tagName)
                return undefined;
            return _super.formats.call(this, domNode);
        };
        BlockBlot.prototype.format = function (name, value) {
            if (Registry.query(name, Registry.Scope.BLOCK) == null) {
                return;
            }
            else if (name === this.statics.blotName && !value) {
                this.replaceWith(BlockBlot.blotName);
            }
            else {
                _super.prototype.format.call(this, name, value);
            }
        };
        BlockBlot.prototype.formatAt = function (index, length, name, value) {
            if (Registry.query(name, Registry.Scope.BLOCK) != null) {
                this.format(name, value);
            }
            else {
                _super.prototype.formatAt.call(this, index, length, name, value);
            }
        };
        BlockBlot.prototype.insertAt = function (index, value, def) {
            if (def == null || Registry.query(value, Registry.Scope.INLINE) != null) {
                // Insert text or inline
                _super.prototype.insertAt.call(this, index, value, def);
            }
            else {
                var after = this.split(index);
                var blot = Registry.create(value, def);
                after.parent.insertBefore(blot, after);
            }
        };
        BlockBlot.prototype.update = function (mutations, context) {
            if (navigator.userAgent.match(/Trident/)) {
                this.build();
            }
            else {
                _super.prototype.update.call(this, mutations, context);
            }
        };
        BlockBlot.blotName = 'block';
        BlockBlot.scope = Registry.Scope.BLOCK_BLOT;
        BlockBlot.tagName = 'P';
        return BlockBlot;
    }(format_1.default));
    exports.default = BlockBlot;


    /***/ }),
    /* 48 */
    /***/ (function(module, exports, __webpack_require__) {

    var __extends = (this && this.__extends) || (function () {
        var extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    var leaf_1 = __webpack_require__(19);
    var EmbedBlot = /** @class */ (function (_super) {
        __extends(EmbedBlot, _super);
        function EmbedBlot() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        EmbedBlot.formats = function (domNode) {
            return undefined;
        };
        EmbedBlot.prototype.format = function (name, value) {
            // super.formatAt wraps, which is what we want in general,
            // but this allows subclasses to overwrite for formats
            // that just apply to particular embeds
            _super.prototype.formatAt.call(this, 0, this.length(), name, value);
        };
        EmbedBlot.prototype.formatAt = function (index, length, name, value) {
            if (index === 0 && length === this.length()) {
                this.format(name, value);
            }
            else {
                _super.prototype.formatAt.call(this, index, length, name, value);
            }
        };
        EmbedBlot.prototype.formats = function () {
            return this.statics.formats(this.domNode);
        };
        return EmbedBlot;
    }(leaf_1.default));
    exports.default = EmbedBlot;


    /***/ }),
    /* 49 */
    /***/ (function(module, exports, __webpack_require__) {

    var __extends = (this && this.__extends) || (function () {
        var extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    var leaf_1 = __webpack_require__(19);
    var Registry = __webpack_require__(1);
    var TextBlot = /** @class */ (function (_super) {
        __extends(TextBlot, _super);
        function TextBlot(node) {
            var _this = _super.call(this, node) || this;
            _this.text = _this.statics.value(_this.domNode);
            return _this;
        }
        TextBlot.create = function (value) {
            return document.createTextNode(value);
        };
        TextBlot.value = function (domNode) {
            var text = domNode.data;
            // @ts-ignore
            if (text['normalize'])
                text = text['normalize']();
            return text;
        };
        TextBlot.prototype.deleteAt = function (index, length) {
            this.domNode.data = this.text = this.text.slice(0, index) + this.text.slice(index + length);
        };
        TextBlot.prototype.index = function (node, offset) {
            if (this.domNode === node) {
                return offset;
            }
            return -1;
        };
        TextBlot.prototype.insertAt = function (index, value, def) {
            if (def == null) {
                this.text = this.text.slice(0, index) + value + this.text.slice(index);
                this.domNode.data = this.text;
            }
            else {
                _super.prototype.insertAt.call(this, index, value, def);
            }
        };
        TextBlot.prototype.length = function () {
            return this.text.length;
        };
        TextBlot.prototype.optimize = function (context) {
            _super.prototype.optimize.call(this, context);
            this.text = this.statics.value(this.domNode);
            if (this.text.length === 0) {
                this.remove();
            }
            else if (this.next instanceof TextBlot && this.next.prev === this) {
                this.insertAt(this.length(), this.next.value());
                this.next.remove();
            }
        };
        TextBlot.prototype.position = function (index, inclusive) {
            return [this.domNode, index];
        };
        TextBlot.prototype.split = function (index, force) {
            if (force === void 0) { force = false; }
            if (!force) {
                if (index === 0)
                    return this;
                if (index === this.length())
                    return this.next;
            }
            var after = Registry.create(this.domNode.splitText(index));
            this.parent.insertBefore(after, this.next);
            this.text = this.statics.value(this.domNode);
            return after;
        };
        TextBlot.prototype.update = function (mutations, context) {
            var _this = this;
            if (mutations.some(function (mutation) {
                return mutation.type === 'characterData' && mutation.target === _this.domNode;
            })) {
                this.text = this.statics.value(this.domNode);
            }
        };
        TextBlot.prototype.value = function () {
            return this.text;
        };
        TextBlot.blotName = 'text';
        TextBlot.scope = Registry.Scope.INLINE_BLOT;
        return TextBlot;
    }(leaf_1.default));
    exports.default = TextBlot;


    /***/ }),
    /* 50 */
    /***/ (function(module, exports, __webpack_require__) {


    var elem = document.createElement('div');
    elem.classList.toggle('test-class', false);
    if (elem.classList.contains('test-class')) {
      var _toggle = DOMTokenList.prototype.toggle;
      DOMTokenList.prototype.toggle = function (token, force) {
        if (arguments.length > 1 && !this.contains(token) === !force) {
          return force;
        } else {
          return _toggle.call(this, token);
        }
      };
    }

    if (!String.prototype.startsWith) {
      String.prototype.startsWith = function (searchString, position) {
        position = position || 0;
        return this.substr(position, searchString.length) === searchString;
      };
    }

    if (!String.prototype.endsWith) {
      String.prototype.endsWith = function (searchString, position) {
        var subjectString = this.toString();
        if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
          position = subjectString.length;
        }
        position -= searchString.length;
        var lastIndex = subjectString.indexOf(searchString, position);
        return lastIndex !== -1 && lastIndex === position;
      };
    }

    if (!Array.prototype.find) {
      Object.defineProperty(Array.prototype, "find", {
        value: function value(predicate) {
          if (this === null) {
            throw new TypeError('Array.prototype.find called on null or undefined');
          }
          if (typeof predicate !== 'function') {
            throw new TypeError('predicate must be a function');
          }
          var list = Object(this);
          var length = list.length >>> 0;
          var thisArg = arguments[1];
          var value;

          for (var i = 0; i < length; i++) {
            value = list[i];
            if (predicate.call(thisArg, value, i, list)) {
              return value;
            }
          }
          return undefined;
        }
      });
    }

    document.addEventListener("DOMContentLoaded", function () {
      // Disable resizing in Firefox
      document.execCommand("enableObjectResizing", false, false);
      // Disable automatic linkifying in IE11
      document.execCommand("autoUrlDetect", false, false);
    });

    /***/ }),
    /* 51 */
    /***/ (function(module, exports) {

    /**
     * This library modifies the diff-patch-match library by Neil Fraser
     * by removing the patch and match functionality and certain advanced
     * options in the diff function. The original license is as follows:
     *
     * ===
     *
     * Diff Match and Patch
     *
     * Copyright 2006 Google Inc.
     * http://code.google.com/p/google-diff-match-patch/
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */


    /**
     * The data structure representing a diff is an array of tuples:
     * [[DIFF_DELETE, 'Hello'], [DIFF_INSERT, 'Goodbye'], [DIFF_EQUAL, ' world.']]
     * which means: delete 'Hello', add 'Goodbye' and keep ' world.'
     */
    var DIFF_DELETE = -1;
    var DIFF_INSERT = 1;
    var DIFF_EQUAL = 0;


    /**
     * Find the differences between two texts.  Simplifies the problem by stripping
     * any common prefix or suffix off the texts before diffing.
     * @param {string} text1 Old string to be diffed.
     * @param {string} text2 New string to be diffed.
     * @param {Int} cursor_pos Expected edit position in text1 (optional)
     * @return {Array} Array of diff tuples.
     */
    function diff_main(text1, text2, cursor_pos) {
      // Check for equality (speedup).
      if (text1 == text2) {
        if (text1) {
          return [[DIFF_EQUAL, text1]];
        }
        return [];
      }

      // Check cursor_pos within bounds
      if (cursor_pos < 0 || text1.length < cursor_pos) {
        cursor_pos = null;
      }

      // Trim off common prefix (speedup).
      var commonlength = diff_commonPrefix(text1, text2);
      var commonprefix = text1.substring(0, commonlength);
      text1 = text1.substring(commonlength);
      text2 = text2.substring(commonlength);

      // Trim off common suffix (speedup).
      commonlength = diff_commonSuffix(text1, text2);
      var commonsuffix = text1.substring(text1.length - commonlength);
      text1 = text1.substring(0, text1.length - commonlength);
      text2 = text2.substring(0, text2.length - commonlength);

      // Compute the diff on the middle block.
      var diffs = diff_compute_(text1, text2);

      // Restore the prefix and suffix.
      if (commonprefix) {
        diffs.unshift([DIFF_EQUAL, commonprefix]);
      }
      if (commonsuffix) {
        diffs.push([DIFF_EQUAL, commonsuffix]);
      }
      diff_cleanupMerge(diffs);
      if (cursor_pos != null) {
        diffs = fix_cursor(diffs, cursor_pos);
      }
      diffs = fix_emoji(diffs);
      return diffs;
    }

    /**
     * Find the differences between two texts.  Assumes that the texts do not
     * have any common prefix or suffix.
     * @param {string} text1 Old string to be diffed.
     * @param {string} text2 New string to be diffed.
     * @return {Array} Array of diff tuples.
     */
    function diff_compute_(text1, text2) {
      var diffs;

      if (!text1) {
        // Just add some text (speedup).
        return [[DIFF_INSERT, text2]];
      }

      if (!text2) {
        // Just delete some text (speedup).
        return [[DIFF_DELETE, text1]];
      }

      var longtext = text1.length > text2.length ? text1 : text2;
      var shorttext = text1.length > text2.length ? text2 : text1;
      var i = longtext.indexOf(shorttext);
      if (i != -1) {
        // Shorter text is inside the longer text (speedup).
        diffs = [[DIFF_INSERT, longtext.substring(0, i)],
                 [DIFF_EQUAL, shorttext],
                 [DIFF_INSERT, longtext.substring(i + shorttext.length)]];
        // Swap insertions for deletions if diff is reversed.
        if (text1.length > text2.length) {
          diffs[0][0] = diffs[2][0] = DIFF_DELETE;
        }
        return diffs;
      }

      if (shorttext.length == 1) {
        // Single character string.
        // After the previous speedup, the character can't be an equality.
        return [[DIFF_DELETE, text1], [DIFF_INSERT, text2]];
      }

      // Check to see if the problem can be split in two.
      var hm = diff_halfMatch_(text1, text2);
      if (hm) {
        // A half-match was found, sort out the return data.
        var text1_a = hm[0];
        var text1_b = hm[1];
        var text2_a = hm[2];
        var text2_b = hm[3];
        var mid_common = hm[4];
        // Send both pairs off for separate processing.
        var diffs_a = diff_main(text1_a, text2_a);
        var diffs_b = diff_main(text1_b, text2_b);
        // Merge the results.
        return diffs_a.concat([[DIFF_EQUAL, mid_common]], diffs_b);
      }

      return diff_bisect_(text1, text2);
    }

    /**
     * Find the 'middle snake' of a diff, split the problem in two
     * and return the recursively constructed diff.
     * See Myers 1986 paper: An O(ND) Difference Algorithm and Its Variations.
     * @param {string} text1 Old string to be diffed.
     * @param {string} text2 New string to be diffed.
     * @return {Array} Array of diff tuples.
     * @private
     */
    function diff_bisect_(text1, text2) {
      // Cache the text lengths to prevent multiple calls.
      var text1_length = text1.length;
      var text2_length = text2.length;
      var max_d = Math.ceil((text1_length + text2_length) / 2);
      var v_offset = max_d;
      var v_length = 2 * max_d;
      var v1 = new Array(v_length);
      var v2 = new Array(v_length);
      // Setting all elements to -1 is faster in Chrome & Firefox than mixing
      // integers and undefined.
      for (var x = 0; x < v_length; x++) {
        v1[x] = -1;
        v2[x] = -1;
      }
      v1[v_offset + 1] = 0;
      v2[v_offset + 1] = 0;
      var delta = text1_length - text2_length;
      // If the total number of characters is odd, then the front path will collide
      // with the reverse path.
      var front = (delta % 2 != 0);
      // Offsets for start and end of k loop.
      // Prevents mapping of space beyond the grid.
      var k1start = 0;
      var k1end = 0;
      var k2start = 0;
      var k2end = 0;
      for (var d = 0; d < max_d; d++) {
        // Walk the front path one step.
        for (var k1 = -d + k1start; k1 <= d - k1end; k1 += 2) {
          var k1_offset = v_offset + k1;
          var x1;
          if (k1 == -d || (k1 != d && v1[k1_offset - 1] < v1[k1_offset + 1])) {
            x1 = v1[k1_offset + 1];
          } else {
            x1 = v1[k1_offset - 1] + 1;
          }
          var y1 = x1 - k1;
          while (x1 < text1_length && y1 < text2_length &&
                 text1.charAt(x1) == text2.charAt(y1)) {
            x1++;
            y1++;
          }
          v1[k1_offset] = x1;
          if (x1 > text1_length) {
            // Ran off the right of the graph.
            k1end += 2;
          } else if (y1 > text2_length) {
            // Ran off the bottom of the graph.
            k1start += 2;
          } else if (front) {
            var k2_offset = v_offset + delta - k1;
            if (k2_offset >= 0 && k2_offset < v_length && v2[k2_offset] != -1) {
              // Mirror x2 onto top-left coordinate system.
              var x2 = text1_length - v2[k2_offset];
              if (x1 >= x2) {
                // Overlap detected.
                return diff_bisectSplit_(text1, text2, x1, y1);
              }
            }
          }
        }

        // Walk the reverse path one step.
        for (var k2 = -d + k2start; k2 <= d - k2end; k2 += 2) {
          var k2_offset = v_offset + k2;
          var x2;
          if (k2 == -d || (k2 != d && v2[k2_offset - 1] < v2[k2_offset + 1])) {
            x2 = v2[k2_offset + 1];
          } else {
            x2 = v2[k2_offset - 1] + 1;
          }
          var y2 = x2 - k2;
          while (x2 < text1_length && y2 < text2_length &&
                 text1.charAt(text1_length - x2 - 1) ==
                 text2.charAt(text2_length - y2 - 1)) {
            x2++;
            y2++;
          }
          v2[k2_offset] = x2;
          if (x2 > text1_length) {
            // Ran off the left of the graph.
            k2end += 2;
          } else if (y2 > text2_length) {
            // Ran off the top of the graph.
            k2start += 2;
          } else if (!front) {
            var k1_offset = v_offset + delta - k2;
            if (k1_offset >= 0 && k1_offset < v_length && v1[k1_offset] != -1) {
              var x1 = v1[k1_offset];
              var y1 = v_offset + x1 - k1_offset;
              // Mirror x2 onto top-left coordinate system.
              x2 = text1_length - x2;
              if (x1 >= x2) {
                // Overlap detected.
                return diff_bisectSplit_(text1, text2, x1, y1);
              }
            }
          }
        }
      }
      // Diff took too long and hit the deadline or
      // number of diffs equals number of characters, no commonality at all.
      return [[DIFF_DELETE, text1], [DIFF_INSERT, text2]];
    }

    /**
     * Given the location of the 'middle snake', split the diff in two parts
     * and recurse.
     * @param {string} text1 Old string to be diffed.
     * @param {string} text2 New string to be diffed.
     * @param {number} x Index of split point in text1.
     * @param {number} y Index of split point in text2.
     * @return {Array} Array of diff tuples.
     */
    function diff_bisectSplit_(text1, text2, x, y) {
      var text1a = text1.substring(0, x);
      var text2a = text2.substring(0, y);
      var text1b = text1.substring(x);
      var text2b = text2.substring(y);

      // Compute both diffs serially.
      var diffs = diff_main(text1a, text2a);
      var diffsb = diff_main(text1b, text2b);

      return diffs.concat(diffsb);
    }

    /**
     * Determine the common prefix of two strings.
     * @param {string} text1 First string.
     * @param {string} text2 Second string.
     * @return {number} The number of characters common to the start of each
     *     string.
     */
    function diff_commonPrefix(text1, text2) {
      // Quick check for common null cases.
      if (!text1 || !text2 || text1.charAt(0) != text2.charAt(0)) {
        return 0;
      }
      // Binary search.
      // Performance analysis: http://neil.fraser.name/news/2007/10/09/
      var pointermin = 0;
      var pointermax = Math.min(text1.length, text2.length);
      var pointermid = pointermax;
      var pointerstart = 0;
      while (pointermin < pointermid) {
        if (text1.substring(pointerstart, pointermid) ==
            text2.substring(pointerstart, pointermid)) {
          pointermin = pointermid;
          pointerstart = pointermin;
        } else {
          pointermax = pointermid;
        }
        pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);
      }
      return pointermid;
    }

    /**
     * Determine the common suffix of two strings.
     * @param {string} text1 First string.
     * @param {string} text2 Second string.
     * @return {number} The number of characters common to the end of each string.
     */
    function diff_commonSuffix(text1, text2) {
      // Quick check for common null cases.
      if (!text1 || !text2 ||
          text1.charAt(text1.length - 1) != text2.charAt(text2.length - 1)) {
        return 0;
      }
      // Binary search.
      // Performance analysis: http://neil.fraser.name/news/2007/10/09/
      var pointermin = 0;
      var pointermax = Math.min(text1.length, text2.length);
      var pointermid = pointermax;
      var pointerend = 0;
      while (pointermin < pointermid) {
        if (text1.substring(text1.length - pointermid, text1.length - pointerend) ==
            text2.substring(text2.length - pointermid, text2.length - pointerend)) {
          pointermin = pointermid;
          pointerend = pointermin;
        } else {
          pointermax = pointermid;
        }
        pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);
      }
      return pointermid;
    }

    /**
     * Do the two texts share a substring which is at least half the length of the
     * longer text?
     * This speedup can produce non-minimal diffs.
     * @param {string} text1 First string.
     * @param {string} text2 Second string.
     * @return {Array.<string>} Five element Array, containing the prefix of
     *     text1, the suffix of text1, the prefix of text2, the suffix of
     *     text2 and the common middle.  Or null if there was no match.
     */
    function diff_halfMatch_(text1, text2) {
      var longtext = text1.length > text2.length ? text1 : text2;
      var shorttext = text1.length > text2.length ? text2 : text1;
      if (longtext.length < 4 || shorttext.length * 2 < longtext.length) {
        return null;  // Pointless.
      }

      /**
       * Does a substring of shorttext exist within longtext such that the substring
       * is at least half the length of longtext?
       * Closure, but does not reference any external variables.
       * @param {string} longtext Longer string.
       * @param {string} shorttext Shorter string.
       * @param {number} i Start index of quarter length substring within longtext.
       * @return {Array.<string>} Five element Array, containing the prefix of
       *     longtext, the suffix of longtext, the prefix of shorttext, the suffix
       *     of shorttext and the common middle.  Or null if there was no match.
       * @private
       */
      function diff_halfMatchI_(longtext, shorttext, i) {
        // Start with a 1/4 length substring at position i as a seed.
        var seed = longtext.substring(i, i + Math.floor(longtext.length / 4));
        var j = -1;
        var best_common = '';
        var best_longtext_a, best_longtext_b, best_shorttext_a, best_shorttext_b;
        while ((j = shorttext.indexOf(seed, j + 1)) != -1) {
          var prefixLength = diff_commonPrefix(longtext.substring(i),
                                               shorttext.substring(j));
          var suffixLength = diff_commonSuffix(longtext.substring(0, i),
                                               shorttext.substring(0, j));
          if (best_common.length < suffixLength + prefixLength) {
            best_common = shorttext.substring(j - suffixLength, j) +
                shorttext.substring(j, j + prefixLength);
            best_longtext_a = longtext.substring(0, i - suffixLength);
            best_longtext_b = longtext.substring(i + prefixLength);
            best_shorttext_a = shorttext.substring(0, j - suffixLength);
            best_shorttext_b = shorttext.substring(j + prefixLength);
          }
        }
        if (best_common.length * 2 >= longtext.length) {
          return [best_longtext_a, best_longtext_b,
                  best_shorttext_a, best_shorttext_b, best_common];
        } else {
          return null;
        }
      }

      // First check if the second quarter is the seed for a half-match.
      var hm1 = diff_halfMatchI_(longtext, shorttext,
                                 Math.ceil(longtext.length / 4));
      // Check again based on the third quarter.
      var hm2 = diff_halfMatchI_(longtext, shorttext,
                                 Math.ceil(longtext.length / 2));
      var hm;
      if (!hm1 && !hm2) {
        return null;
      } else if (!hm2) {
        hm = hm1;
      } else if (!hm1) {
        hm = hm2;
      } else {
        // Both matched.  Select the longest.
        hm = hm1[4].length > hm2[4].length ? hm1 : hm2;
      }

      // A half-match was found, sort out the return data.
      var text1_a, text1_b, text2_a, text2_b;
      if (text1.length > text2.length) {
        text1_a = hm[0];
        text1_b = hm[1];
        text2_a = hm[2];
        text2_b = hm[3];
      } else {
        text2_a = hm[0];
        text2_b = hm[1];
        text1_a = hm[2];
        text1_b = hm[3];
      }
      var mid_common = hm[4];
      return [text1_a, text1_b, text2_a, text2_b, mid_common];
    }

    /**
     * Reorder and merge like edit sections.  Merge equalities.
     * Any edit section can move as long as it doesn't cross an equality.
     * @param {Array} diffs Array of diff tuples.
     */
    function diff_cleanupMerge(diffs) {
      diffs.push([DIFF_EQUAL, '']);  // Add a dummy entry at the end.
      var pointer = 0;
      var count_delete = 0;
      var count_insert = 0;
      var text_delete = '';
      var text_insert = '';
      var commonlength;
      while (pointer < diffs.length) {
        switch (diffs[pointer][0]) {
          case DIFF_INSERT:
            count_insert++;
            text_insert += diffs[pointer][1];
            pointer++;
            break;
          case DIFF_DELETE:
            count_delete++;
            text_delete += diffs[pointer][1];
            pointer++;
            break;
          case DIFF_EQUAL:
            // Upon reaching an equality, check for prior redundancies.
            if (count_delete + count_insert > 1) {
              if (count_delete !== 0 && count_insert !== 0) {
                // Factor out any common prefixies.
                commonlength = diff_commonPrefix(text_insert, text_delete);
                if (commonlength !== 0) {
                  if ((pointer - count_delete - count_insert) > 0 &&
                      diffs[pointer - count_delete - count_insert - 1][0] ==
                      DIFF_EQUAL) {
                    diffs[pointer - count_delete - count_insert - 1][1] +=
                        text_insert.substring(0, commonlength);
                  } else {
                    diffs.splice(0, 0, [DIFF_EQUAL,
                                        text_insert.substring(0, commonlength)]);
                    pointer++;
                  }
                  text_insert = text_insert.substring(commonlength);
                  text_delete = text_delete.substring(commonlength);
                }
                // Factor out any common suffixies.
                commonlength = diff_commonSuffix(text_insert, text_delete);
                if (commonlength !== 0) {
                  diffs[pointer][1] = text_insert.substring(text_insert.length -
                      commonlength) + diffs[pointer][1];
                  text_insert = text_insert.substring(0, text_insert.length -
                      commonlength);
                  text_delete = text_delete.substring(0, text_delete.length -
                      commonlength);
                }
              }
              // Delete the offending records and add the merged ones.
              if (count_delete === 0) {
                diffs.splice(pointer - count_insert,
                    count_delete + count_insert, [DIFF_INSERT, text_insert]);
              } else if (count_insert === 0) {
                diffs.splice(pointer - count_delete,
                    count_delete + count_insert, [DIFF_DELETE, text_delete]);
              } else {
                diffs.splice(pointer - count_delete - count_insert,
                    count_delete + count_insert, [DIFF_DELETE, text_delete],
                    [DIFF_INSERT, text_insert]);
              }
              pointer = pointer - count_delete - count_insert +
                        (count_delete ? 1 : 0) + (count_insert ? 1 : 0) + 1;
            } else if (pointer !== 0 && diffs[pointer - 1][0] == DIFF_EQUAL) {
              // Merge this equality with the previous one.
              diffs[pointer - 1][1] += diffs[pointer][1];
              diffs.splice(pointer, 1);
            } else {
              pointer++;
            }
            count_insert = 0;
            count_delete = 0;
            text_delete = '';
            text_insert = '';
            break;
        }
      }
      if (diffs[diffs.length - 1][1] === '') {
        diffs.pop();  // Remove the dummy entry at the end.
      }

      // Second pass: look for single edits surrounded on both sides by equalities
      // which can be shifted sideways to eliminate an equality.
      // e.g: A<ins>BA</ins>C -> <ins>AB</ins>AC
      var changes = false;
      pointer = 1;
      // Intentionally ignore the first and last element (don't need checking).
      while (pointer < diffs.length - 1) {
        if (diffs[pointer - 1][0] == DIFF_EQUAL &&
            diffs[pointer + 1][0] == DIFF_EQUAL) {
          // This is a single edit surrounded by equalities.
          if (diffs[pointer][1].substring(diffs[pointer][1].length -
              diffs[pointer - 1][1].length) == diffs[pointer - 1][1]) {
            // Shift the edit over the previous equality.
            diffs[pointer][1] = diffs[pointer - 1][1] +
                diffs[pointer][1].substring(0, diffs[pointer][1].length -
                                            diffs[pointer - 1][1].length);
            diffs[pointer + 1][1] = diffs[pointer - 1][1] + diffs[pointer + 1][1];
            diffs.splice(pointer - 1, 1);
            changes = true;
          } else if (diffs[pointer][1].substring(0, diffs[pointer + 1][1].length) ==
              diffs[pointer + 1][1]) {
            // Shift the edit over the next equality.
            diffs[pointer - 1][1] += diffs[pointer + 1][1];
            diffs[pointer][1] =
                diffs[pointer][1].substring(diffs[pointer + 1][1].length) +
                diffs[pointer + 1][1];
            diffs.splice(pointer + 1, 1);
            changes = true;
          }
        }
        pointer++;
      }
      // If shifts were made, the diff needs reordering and another shift sweep.
      if (changes) {
        diff_cleanupMerge(diffs);
      }
    }

    var diff = diff_main;
    diff.INSERT = DIFF_INSERT;
    diff.DELETE = DIFF_DELETE;
    diff.EQUAL = DIFF_EQUAL;

    module.exports = diff;

    /*
     * Modify a diff such that the cursor position points to the start of a change:
     * E.g.
     *   cursor_normalize_diff([[DIFF_EQUAL, 'abc']], 1)
     *     => [1, [[DIFF_EQUAL, 'a'], [DIFF_EQUAL, 'bc']]]
     *   cursor_normalize_diff([[DIFF_INSERT, 'new'], [DIFF_DELETE, 'xyz']], 2)
     *     => [2, [[DIFF_INSERT, 'new'], [DIFF_DELETE, 'xy'], [DIFF_DELETE, 'z']]]
     *
     * @param {Array} diffs Array of diff tuples
     * @param {Int} cursor_pos Suggested edit position. Must not be out of bounds!
     * @return {Array} A tuple [cursor location in the modified diff, modified diff]
     */
    function cursor_normalize_diff (diffs, cursor_pos) {
      if (cursor_pos === 0) {
        return [DIFF_EQUAL, diffs];
      }
      for (var current_pos = 0, i = 0; i < diffs.length; i++) {
        var d = diffs[i];
        if (d[0] === DIFF_DELETE || d[0] === DIFF_EQUAL) {
          var next_pos = current_pos + d[1].length;
          if (cursor_pos === next_pos) {
            return [i + 1, diffs];
          } else if (cursor_pos < next_pos) {
            // copy to prevent side effects
            diffs = diffs.slice();
            // split d into two diff changes
            var split_pos = cursor_pos - current_pos;
            var d_left = [d[0], d[1].slice(0, split_pos)];
            var d_right = [d[0], d[1].slice(split_pos)];
            diffs.splice(i, 1, d_left, d_right);
            return [i + 1, diffs];
          } else {
            current_pos = next_pos;
          }
        }
      }
      throw new Error('cursor_pos is out of bounds!')
    }

    /*
     * Modify a diff such that the edit position is "shifted" to the proposed edit location (cursor_position).
     *
     * Case 1)
     *   Check if a naive shift is possible:
     *     [0, X], [ 1, Y] -> [ 1, Y], [0, X]    (if X + Y === Y + X)
     *     [0, X], [-1, Y] -> [-1, Y], [0, X]    (if X + Y === Y + X) - holds same result
     * Case 2)
     *   Check if the following shifts are possible:
     *     [0, 'pre'], [ 1, 'prefix'] -> [ 1, 'pre'], [0, 'pre'], [ 1, 'fix']
     *     [0, 'pre'], [-1, 'prefix'] -> [-1, 'pre'], [0, 'pre'], [-1, 'fix']
     *         ^            ^
     *         d          d_next
     *
     * @param {Array} diffs Array of diff tuples
     * @param {Int} cursor_pos Suggested edit position. Must not be out of bounds!
     * @return {Array} Array of diff tuples
     */
    function fix_cursor (diffs, cursor_pos) {
      var norm = cursor_normalize_diff(diffs, cursor_pos);
      var ndiffs = norm[1];
      var cursor_pointer = norm[0];
      var d = ndiffs[cursor_pointer];
      var d_next = ndiffs[cursor_pointer + 1];

      if (d == null) {
        // Text was deleted from end of original string,
        // cursor is now out of bounds in new string
        return diffs;
      } else if (d[0] !== DIFF_EQUAL) {
        // A modification happened at the cursor location.
        // This is the expected outcome, so we can return the original diff.
        return diffs;
      } else {
        if (d_next != null && d[1] + d_next[1] === d_next[1] + d[1]) {
          // Case 1)
          // It is possible to perform a naive shift
          ndiffs.splice(cursor_pointer, 2, d_next, d);
          return merge_tuples(ndiffs, cursor_pointer, 2)
        } else if (d_next != null && d_next[1].indexOf(d[1]) === 0) {
          // Case 2)
          // d[1] is a prefix of d_next[1]
          // We can assume that d_next[0] !== 0, since d[0] === 0
          // Shift edit locations..
          ndiffs.splice(cursor_pointer, 2, [d_next[0], d[1]], [0, d[1]]);
          var suffix = d_next[1].slice(d[1].length);
          if (suffix.length > 0) {
            ndiffs.splice(cursor_pointer + 2, 0, [d_next[0], suffix]);
          }
          return merge_tuples(ndiffs, cursor_pointer, 3)
        } else {
          // Not possible to perform any modification
          return diffs;
        }
      }
    }

    /*
     * Check diff did not split surrogate pairs.
     * Ex. [0, '\uD83D'], [-1, '\uDC36'], [1, '\uDC2F'] -> [-1, '\uD83D\uDC36'], [1, '\uD83D\uDC2F']
     *     '\uD83D\uDC36' === '🐶', '\uD83D\uDC2F' === '🐯'
     *
     * @param {Array} diffs Array of diff tuples
     * @return {Array} Array of diff tuples
     */
    function fix_emoji (diffs) {
      var compact = false;
      var starts_with_pair_end = function(str) {
        return str.charCodeAt(0) >= 0xDC00 && str.charCodeAt(0) <= 0xDFFF;
      };
      var ends_with_pair_start = function(str) {
        return str.charCodeAt(str.length-1) >= 0xD800 && str.charCodeAt(str.length-1) <= 0xDBFF;
      };
      for (var i = 2; i < diffs.length; i += 1) {
        if (diffs[i-2][0] === DIFF_EQUAL && ends_with_pair_start(diffs[i-2][1]) &&
            diffs[i-1][0] === DIFF_DELETE && starts_with_pair_end(diffs[i-1][1]) &&
            diffs[i][0] === DIFF_INSERT && starts_with_pair_end(diffs[i][1])) {
          compact = true;

          diffs[i-1][1] = diffs[i-2][1].slice(-1) + diffs[i-1][1];
          diffs[i][1] = diffs[i-2][1].slice(-1) + diffs[i][1];

          diffs[i-2][1] = diffs[i-2][1].slice(0, -1);
        }
      }
      if (!compact) {
        return diffs;
      }
      var fixed_diffs = [];
      for (var i = 0; i < diffs.length; i += 1) {
        if (diffs[i][1].length > 0) {
          fixed_diffs.push(diffs[i]);
        }
      }
      return fixed_diffs;
    }

    /*
     * Try to merge tuples with their neigbors in a given range.
     * E.g. [0, 'a'], [0, 'b'] -> [0, 'ab']
     *
     * @param {Array} diffs Array of diff tuples.
     * @param {Int} start Position of the first element to merge (diffs[start] is also merged with diffs[start - 1]).
     * @param {Int} length Number of consecutive elements to check.
     * @return {Array} Array of merged diff tuples.
     */
    function merge_tuples (diffs, start, length) {
      // Check from (start-1) to (start+length).
      for (var i = start + length - 1; i >= 0 && i >= start - 1; i--) {
        if (i + 1 < diffs.length) {
          var left_d = diffs[i];
          var right_d = diffs[i+1];
          if (left_d[0] === right_d[1]) {
            diffs.splice(i, 2, [left_d[0], left_d[1] + right_d[1]]);
          }
        }
      }
      return diffs;
    }


    /***/ }),
    /* 52 */
    /***/ (function(module, exports) {

    exports = module.exports = typeof Object.keys === 'function'
      ? Object.keys : shim;

    exports.shim = shim;
    function shim (obj) {
      var keys = [];
      for (var key in obj) keys.push(key);
      return keys;
    }


    /***/ }),
    /* 53 */
    /***/ (function(module, exports) {

    var supportsArgumentsClass = (function(){
      return Object.prototype.toString.call(arguments)
    })() == '[object Arguments]';

    exports = module.exports = supportsArgumentsClass ? supported : unsupported;

    exports.supported = supported;
    function supported(object) {
      return Object.prototype.toString.call(object) == '[object Arguments]';
    }
    exports.unsupported = unsupported;
    function unsupported(object){
      return object &&
        typeof object == 'object' &&
        typeof object.length == 'number' &&
        Object.prototype.hasOwnProperty.call(object, 'callee') &&
        !Object.prototype.propertyIsEnumerable.call(object, 'callee') ||
        false;
    }

    /***/ }),
    /* 54 */
    /***/ (function(module, exports) {

    var has = Object.prototype.hasOwnProperty
      , prefix = '~';

    /**
     * Constructor to create a storage for our `EE` objects.
     * An `Events` instance is a plain object whose properties are event names.
     *
     * @constructor
     * @api private
     */
    function Events() {}

    //
    // We try to not inherit from `Object.prototype`. In some engines creating an
    // instance in this way is faster than calling `Object.create(null)` directly.
    // If `Object.create(null)` is not supported we prefix the event names with a
    // character to make sure that the built-in object properties are not
    // overridden or used as an attack vector.
    //
    if (Object.create) {
      Events.prototype = Object.create(null);

      //
      // This hack is needed because the `__proto__` property is still inherited in
      // some old browsers like Android 4, iPhone 5.1, Opera 11 and Safari 5.
      //
      if (!new Events().__proto__) prefix = false;
    }

    /**
     * Representation of a single event listener.
     *
     * @param {Function} fn The listener function.
     * @param {Mixed} context The context to invoke the listener with.
     * @param {Boolean} [once=false] Specify if the listener is a one-time listener.
     * @constructor
     * @api private
     */
    function EE(fn, context, once) {
      this.fn = fn;
      this.context = context;
      this.once = once || false;
    }

    /**
     * Minimal `EventEmitter` interface that is molded against the Node.js
     * `EventEmitter` interface.
     *
     * @constructor
     * @api public
     */
    function EventEmitter() {
      this._events = new Events();
      this._eventsCount = 0;
    }

    /**
     * Return an array listing the events for which the emitter has registered
     * listeners.
     *
     * @returns {Array}
     * @api public
     */
    EventEmitter.prototype.eventNames = function eventNames() {
      var names = []
        , events
        , name;

      if (this._eventsCount === 0) return names;

      for (name in (events = this._events)) {
        if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
      }

      if (Object.getOwnPropertySymbols) {
        return names.concat(Object.getOwnPropertySymbols(events));
      }

      return names;
    };

    /**
     * Return the listeners registered for a given event.
     *
     * @param {String|Symbol} event The event name.
     * @param {Boolean} exists Only check if there are listeners.
     * @returns {Array|Boolean}
     * @api public
     */
    EventEmitter.prototype.listeners = function listeners(event, exists) {
      var evt = prefix ? prefix + event : event
        , available = this._events[evt];

      if (exists) return !!available;
      if (!available) return [];
      if (available.fn) return [available.fn];

      for (var i = 0, l = available.length, ee = new Array(l); i < l; i++) {
        ee[i] = available[i].fn;
      }

      return ee;
    };

    /**
     * Calls each of the listeners registered for a given event.
     *
     * @param {String|Symbol} event The event name.
     * @returns {Boolean} `true` if the event had listeners, else `false`.
     * @api public
     */
    EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
      var evt = prefix ? prefix + event : event;

      if (!this._events[evt]) return false;

      var listeners = this._events[evt]
        , len = arguments.length
        , args
        , i;

      if (listeners.fn) {
        if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

        switch (len) {
          case 1: return listeners.fn.call(listeners.context), true;
          case 2: return listeners.fn.call(listeners.context, a1), true;
          case 3: return listeners.fn.call(listeners.context, a1, a2), true;
          case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
          case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
          case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
        }

        for (i = 1, args = new Array(len -1); i < len; i++) {
          args[i - 1] = arguments[i];
        }

        listeners.fn.apply(listeners.context, args);
      } else {
        var length = listeners.length
          , j;

        for (i = 0; i < length; i++) {
          if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

          switch (len) {
            case 1: listeners[i].fn.call(listeners[i].context); break;
            case 2: listeners[i].fn.call(listeners[i].context, a1); break;
            case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
            case 4: listeners[i].fn.call(listeners[i].context, a1, a2, a3); break;
            default:
              if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
                args[j - 1] = arguments[j];
              }

              listeners[i].fn.apply(listeners[i].context, args);
          }
        }
      }

      return true;
    };

    /**
     * Add a listener for a given event.
     *
     * @param {String|Symbol} event The event name.
     * @param {Function} fn The listener function.
     * @param {Mixed} [context=this] The context to invoke the listener with.
     * @returns {EventEmitter} `this`.
     * @api public
     */
    EventEmitter.prototype.on = function on(event, fn, context) {
      var listener = new EE(fn, context || this)
        , evt = prefix ? prefix + event : event;

      if (!this._events[evt]) this._events[evt] = listener, this._eventsCount++;
      else if (!this._events[evt].fn) this._events[evt].push(listener);
      else this._events[evt] = [this._events[evt], listener];

      return this;
    };

    /**
     * Add a one-time listener for a given event.
     *
     * @param {String|Symbol} event The event name.
     * @param {Function} fn The listener function.
     * @param {Mixed} [context=this] The context to invoke the listener with.
     * @returns {EventEmitter} `this`.
     * @api public
     */
    EventEmitter.prototype.once = function once(event, fn, context) {
      var listener = new EE(fn, context || this, true)
        , evt = prefix ? prefix + event : event;

      if (!this._events[evt]) this._events[evt] = listener, this._eventsCount++;
      else if (!this._events[evt].fn) this._events[evt].push(listener);
      else this._events[evt] = [this._events[evt], listener];

      return this;
    };

    /**
     * Remove the listeners of a given event.
     *
     * @param {String|Symbol} event The event name.
     * @param {Function} fn Only remove the listeners that match this function.
     * @param {Mixed} context Only remove the listeners that have this context.
     * @param {Boolean} once Only remove one-time listeners.
     * @returns {EventEmitter} `this`.
     * @api public
     */
    EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
      var evt = prefix ? prefix + event : event;

      if (!this._events[evt]) return this;
      if (!fn) {
        if (--this._eventsCount === 0) this._events = new Events();
        else delete this._events[evt];
        return this;
      }

      var listeners = this._events[evt];

      if (listeners.fn) {
        if (
             listeners.fn === fn
          && (!once || listeners.once)
          && (!context || listeners.context === context)
        ) {
          if (--this._eventsCount === 0) this._events = new Events();
          else delete this._events[evt];
        }
      } else {
        for (var i = 0, events = [], length = listeners.length; i < length; i++) {
          if (
               listeners[i].fn !== fn
            || (once && !listeners[i].once)
            || (context && listeners[i].context !== context)
          ) {
            events.push(listeners[i]);
          }
        }

        //
        // Reset the array, or remove it completely if we have no more listeners.
        //
        if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;
        else if (--this._eventsCount === 0) this._events = new Events();
        else delete this._events[evt];
      }

      return this;
    };

    /**
     * Remove all listeners, or those of the specified event.
     *
     * @param {String|Symbol} [event] The event name.
     * @returns {EventEmitter} `this`.
     * @api public
     */
    EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
      var evt;

      if (event) {
        evt = prefix ? prefix + event : event;
        if (this._events[evt]) {
          if (--this._eventsCount === 0) this._events = new Events();
          else delete this._events[evt];
        }
      } else {
        this._events = new Events();
        this._eventsCount = 0;
      }

      return this;
    };

    //
    // Alias methods names because people roll like that.
    //
    EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
    EventEmitter.prototype.addListener = EventEmitter.prototype.on;

    //
    // This function doesn't apply anymore.
    //
    EventEmitter.prototype.setMaxListeners = function setMaxListeners() {
      return this;
    };

    //
    // Expose the prefix.
    //
    EventEmitter.prefixed = prefix;

    //
    // Allow `EventEmitter` to be imported as module namespace.
    //
    EventEmitter.EventEmitter = EventEmitter;

    //
    // Expose the module.
    //
    if ('undefined' !== typeof module) {
      module.exports = EventEmitter;
    }


    /***/ }),
    /* 55 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.matchText = exports.matchSpacing = exports.matchNewline = exports.matchBlot = exports.matchAttributor = exports.default = undefined;

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

    var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    var _extend2 = __webpack_require__(3);

    var _extend3 = _interopRequireDefault(_extend2);

    var _quillDelta = __webpack_require__(2);

    var _quillDelta2 = _interopRequireDefault(_quillDelta);

    var _parchment = __webpack_require__(0);

    var _parchment2 = _interopRequireDefault(_parchment);

    var _quill = __webpack_require__(5);

    var _quill2 = _interopRequireDefault(_quill);

    var _logger = __webpack_require__(10);

    var _logger2 = _interopRequireDefault(_logger);

    var _module = __webpack_require__(9);

    var _module2 = _interopRequireDefault(_module);

    var _align = __webpack_require__(36);

    var _background = __webpack_require__(37);

    var _code = __webpack_require__(13);

    var _code2 = _interopRequireDefault(_code);

    var _color = __webpack_require__(26);

    var _direction = __webpack_require__(38);

    var _font = __webpack_require__(39);

    var _size = __webpack_require__(40);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var debug = (0, _logger2.default)('quill:clipboard');

    var DOM_KEY = '__ql-matcher';

    var CLIPBOARD_CONFIG = [[Node.TEXT_NODE, matchText], [Node.TEXT_NODE, matchNewline], ['br', matchBreak], [Node.ELEMENT_NODE, matchNewline], [Node.ELEMENT_NODE, matchBlot], [Node.ELEMENT_NODE, matchSpacing], [Node.ELEMENT_NODE, matchAttributor], [Node.ELEMENT_NODE, matchStyles], ['li', matchIndent], ['b', matchAlias.bind(matchAlias, 'bold')], ['i', matchAlias.bind(matchAlias, 'italic')], ['style', matchIgnore]];

    var ATTRIBUTE_ATTRIBUTORS = [_align.AlignAttribute, _direction.DirectionAttribute].reduce(function (memo, attr) {
      memo[attr.keyName] = attr;
      return memo;
    }, {});

    var STYLE_ATTRIBUTORS = [_align.AlignStyle, _background.BackgroundStyle, _color.ColorStyle, _direction.DirectionStyle, _font.FontStyle, _size.SizeStyle].reduce(function (memo, attr) {
      memo[attr.keyName] = attr;
      return memo;
    }, {});

    var Clipboard = function (_Module) {
      _inherits(Clipboard, _Module);

      function Clipboard(quill, options) {
        _classCallCheck(this, Clipboard);

        var _this = _possibleConstructorReturn(this, (Clipboard.__proto__ || Object.getPrototypeOf(Clipboard)).call(this, quill, options));

        _this.quill.root.addEventListener('paste', _this.onPaste.bind(_this));
        _this.container = _this.quill.addContainer('ql-clipboard');
        _this.container.setAttribute('contenteditable', true);
        _this.container.setAttribute('tabindex', -1);
        _this.matchers = [];
        CLIPBOARD_CONFIG.concat(_this.options.matchers).forEach(function (_ref) {
          var _ref2 = _slicedToArray(_ref, 2),
              selector = _ref2[0],
              matcher = _ref2[1];

          if (!options.matchVisual && matcher === matchSpacing) return;
          _this.addMatcher(selector, matcher);
        });
        return _this;
      }

      _createClass(Clipboard, [{
        key: 'addMatcher',
        value: function addMatcher(selector, matcher) {
          this.matchers.push([selector, matcher]);
        }
      }, {
        key: 'convert',
        value: function convert(html) {
          if (typeof html === 'string') {
            this.container.innerHTML = html.replace(/\>\r?\n +\</g, '><'); // Remove spaces between tags
            return this.convert();
          }
          var formats = this.quill.getFormat(this.quill.selection.savedRange.index);
          if (formats[_code2.default.blotName]) {
            var text = this.container.innerText;
            this.container.innerHTML = '';
            return new _quillDelta2.default().insert(text, _defineProperty({}, _code2.default.blotName, formats[_code2.default.blotName]));
          }

          var _prepareMatching = this.prepareMatching(),
              _prepareMatching2 = _slicedToArray(_prepareMatching, 2),
              elementMatchers = _prepareMatching2[0],
              textMatchers = _prepareMatching2[1];

          var delta = traverse(this.container, elementMatchers, textMatchers);
          // Remove trailing newline
          if (deltaEndsWith(delta, '\n') && delta.ops[delta.ops.length - 1].attributes == null) {
            delta = delta.compose(new _quillDelta2.default().retain(delta.length() - 1).delete(1));
          }
          debug.log('convert', this.container.innerHTML, delta);
          this.container.innerHTML = '';
          return delta;
        }
      }, {
        key: 'dangerouslyPasteHTML',
        value: function dangerouslyPasteHTML(index, html) {
          var source = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _quill2.default.sources.API;

          if (typeof index === 'string') {
            this.quill.setContents(this.convert(index), html);
            this.quill.setSelection(0, _quill2.default.sources.SILENT);
          } else {
            var paste = this.convert(html);
            this.quill.updateContents(new _quillDelta2.default().retain(index).concat(paste), source);
            this.quill.setSelection(index + paste.length(), _quill2.default.sources.SILENT);
          }
        }
      }, {
        key: 'onPaste',
        value: function onPaste(e) {
          var _this2 = this;

          if (e.defaultPrevented || !this.quill.isEnabled()) return;
          var range = this.quill.getSelection();
          var delta = new _quillDelta2.default().retain(range.index);
          var scrollTop = this.quill.scrollingContainer.scrollTop;
          this.container.focus();
          this.quill.selection.update(_quill2.default.sources.SILENT);
          setTimeout(function () {
            delta = delta.concat(_this2.convert()).delete(range.length);
            _this2.quill.updateContents(delta, _quill2.default.sources.USER);
            // range.length contributes to delta.length()
            _this2.quill.setSelection(delta.length() - range.length, _quill2.default.sources.SILENT);
            _this2.quill.scrollingContainer.scrollTop = scrollTop;
            _this2.quill.focus();
          }, 1);
        }
      }, {
        key: 'prepareMatching',
        value: function prepareMatching() {
          var _this3 = this;

          var elementMatchers = [],
              textMatchers = [];
          this.matchers.forEach(function (pair) {
            var _pair = _slicedToArray(pair, 2),
                selector = _pair[0],
                matcher = _pair[1];

            switch (selector) {
              case Node.TEXT_NODE:
                textMatchers.push(matcher);
                break;
              case Node.ELEMENT_NODE:
                elementMatchers.push(matcher);
                break;
              default:
                [].forEach.call(_this3.container.querySelectorAll(selector), function (node) {
                  // TODO use weakmap
                  node[DOM_KEY] = node[DOM_KEY] || [];
                  node[DOM_KEY].push(matcher);
                });
                break;
            }
          });
          return [elementMatchers, textMatchers];
        }
      }]);

      return Clipboard;
    }(_module2.default);

    Clipboard.DEFAULTS = {
      matchers: [],
      matchVisual: true
    };

    function applyFormat(delta, format, value) {
      if ((typeof format === 'undefined' ? 'undefined' : _typeof(format)) === 'object') {
        return Object.keys(format).reduce(function (delta, key) {
          return applyFormat(delta, key, format[key]);
        }, delta);
      } else {
        return delta.reduce(function (delta, op) {
          if (op.attributes && op.attributes[format]) {
            return delta.push(op);
          } else {
            return delta.insert(op.insert, (0, _extend3.default)({}, _defineProperty({}, format, value), op.attributes));
          }
        }, new _quillDelta2.default());
      }
    }

    function computeStyle(node) {
      if (node.nodeType !== Node.ELEMENT_NODE) return {};
      var DOM_KEY = '__ql-computed-style';
      return node[DOM_KEY] || (node[DOM_KEY] = window.getComputedStyle(node));
    }

    function deltaEndsWith(delta, text) {
      var endText = "";
      for (var i = delta.ops.length - 1; i >= 0 && endText.length < text.length; --i) {
        var op = delta.ops[i];
        if (typeof op.insert !== 'string') break;
        endText = op.insert + endText;
      }
      return endText.slice(-1 * text.length) === text;
    }

    function isLine(node) {
      if (node.childNodes.length === 0) return false; // Exclude embed blocks
      var style = computeStyle(node);
      return ['block', 'list-item'].indexOf(style.display) > -1;
    }

    function traverse(node, elementMatchers, textMatchers) {
      // Post-order
      if (node.nodeType === node.TEXT_NODE) {
        return textMatchers.reduce(function (delta, matcher) {
          return matcher(node, delta);
        }, new _quillDelta2.default());
      } else if (node.nodeType === node.ELEMENT_NODE) {
        return [].reduce.call(node.childNodes || [], function (delta, childNode) {
          var childrenDelta = traverse(childNode, elementMatchers, textMatchers);
          if (childNode.nodeType === node.ELEMENT_NODE) {
            childrenDelta = elementMatchers.reduce(function (childrenDelta, matcher) {
              return matcher(childNode, childrenDelta);
            }, childrenDelta);
            childrenDelta = (childNode[DOM_KEY] || []).reduce(function (childrenDelta, matcher) {
              return matcher(childNode, childrenDelta);
            }, childrenDelta);
          }
          return delta.concat(childrenDelta);
        }, new _quillDelta2.default());
      } else {
        return new _quillDelta2.default();
      }
    }

    function matchAlias(format, node, delta) {
      return applyFormat(delta, format, true);
    }

    function matchAttributor(node, delta) {
      var attributes = _parchment2.default.Attributor.Attribute.keys(node);
      var classes = _parchment2.default.Attributor.Class.keys(node);
      var styles = _parchment2.default.Attributor.Style.keys(node);
      var formats = {};
      attributes.concat(classes).concat(styles).forEach(function (name) {
        var attr = _parchment2.default.query(name, _parchment2.default.Scope.ATTRIBUTE);
        if (attr != null) {
          formats[attr.attrName] = attr.value(node);
          if (formats[attr.attrName]) return;
        }
        attr = ATTRIBUTE_ATTRIBUTORS[name];
        if (attr != null && (attr.attrName === name || attr.keyName === name)) {
          formats[attr.attrName] = attr.value(node) || undefined;
        }
        attr = STYLE_ATTRIBUTORS[name];
        if (attr != null && (attr.attrName === name || attr.keyName === name)) {
          attr = STYLE_ATTRIBUTORS[name];
          formats[attr.attrName] = attr.value(node) || undefined;
        }
      });
      if (Object.keys(formats).length > 0) {
        delta = applyFormat(delta, formats);
      }
      return delta;
    }

    function matchBlot(node, delta) {
      var match = _parchment2.default.query(node);
      if (match == null) return delta;
      if (match.prototype instanceof _parchment2.default.Embed) {
        var embed = {};
        var value = match.value(node);
        if (value != null) {
          embed[match.blotName] = value;
          delta = new _quillDelta2.default().insert(embed, match.formats(node));
        }
      } else if (typeof match.formats === 'function') {
        delta = applyFormat(delta, match.blotName, match.formats(node));
      }
      return delta;
    }

    function matchBreak(node, delta) {
      if (!deltaEndsWith(delta, '\n')) {
        delta.insert('\n');
      }
      return delta;
    }

    function matchIgnore() {
      return new _quillDelta2.default();
    }

    function matchIndent(node, delta) {
      var match = _parchment2.default.query(node);
      if (match == null || match.blotName !== 'list-item' || !deltaEndsWith(delta, '\n')) {
        return delta;
      }
      var indent = -1,
          parent = node.parentNode;
      while (!parent.classList.contains('ql-clipboard')) {
        if ((_parchment2.default.query(parent) || {}).blotName === 'list') {
          indent += 1;
        }
        parent = parent.parentNode;
      }
      if (indent <= 0) return delta;
      return delta.compose(new _quillDelta2.default().retain(delta.length() - 1).retain(1, { indent: indent }));
    }

    function matchNewline(node, delta) {
      if (!deltaEndsWith(delta, '\n')) {
        if (isLine(node) || delta.length() > 0 && node.nextSibling && isLine(node.nextSibling)) {
          delta.insert('\n');
        }
      }
      return delta;
    }

    function matchSpacing(node, delta) {
      if (isLine(node) && node.nextElementSibling != null && !deltaEndsWith(delta, '\n\n')) {
        var nodeHeight = node.offsetHeight + parseFloat(computeStyle(node).marginTop) + parseFloat(computeStyle(node).marginBottom);
        if (node.nextElementSibling.offsetTop > node.offsetTop + nodeHeight * 1.5) {
          delta.insert('\n');
        }
      }
      return delta;
    }

    function matchStyles(node, delta) {
      var formats = {};
      var style = node.style || {};
      if (style.fontStyle && computeStyle(node).fontStyle === 'italic') {
        formats.italic = true;
      }
      if (style.fontWeight && (computeStyle(node).fontWeight.startsWith('bold') || parseInt(computeStyle(node).fontWeight) >= 700)) {
        formats.bold = true;
      }
      if (Object.keys(formats).length > 0) {
        delta = applyFormat(delta, formats);
      }
      if (parseFloat(style.textIndent || 0) > 0) {
        // Could be 0.5in
        delta = new _quillDelta2.default().insert('\t').concat(delta);
      }
      return delta;
    }

    function matchText(node, delta) {
      var text = node.data;
      // Word represents empty line with <o:p>&nbsp;</o:p>
      if (node.parentNode.tagName === 'O:P') {
        return delta.insert(text.trim());
      }
      if (text.trim().length === 0 && node.parentNode.classList.contains('ql-clipboard')) {
        return delta;
      }
      if (!computeStyle(node.parentNode).whiteSpace.startsWith('pre')) {
        // eslint-disable-next-line func-style
        var replacer = function replacer(collapse, match) {
          match = match.replace(/[^\u00a0]/g, ''); // \u00a0 is nbsp;
          return match.length < 1 && collapse ? ' ' : match;
        };
        text = text.replace(/\r\n/g, ' ').replace(/\n/g, ' ');
        text = text.replace(/\s\s+/g, replacer.bind(replacer, true)); // collapse whitespace
        if (node.previousSibling == null && isLine(node.parentNode) || node.previousSibling != null && isLine(node.previousSibling)) {
          text = text.replace(/^\s+/, replacer.bind(replacer, false));
        }
        if (node.nextSibling == null && isLine(node.parentNode) || node.nextSibling != null && isLine(node.nextSibling)) {
          text = text.replace(/\s+$/, replacer.bind(replacer, false));
        }
      }
      return delta.insert(text);
    }

    exports.default = Clipboard;
    exports.matchAttributor = matchAttributor;
    exports.matchBlot = matchBlot;
    exports.matchNewline = matchNewline;
    exports.matchSpacing = matchSpacing;
    exports.matchText = matchText;

    /***/ }),
    /* 56 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    var _inline = __webpack_require__(6);

    var _inline2 = _interopRequireDefault(_inline);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var Bold = function (_Inline) {
      _inherits(Bold, _Inline);

      function Bold() {
        _classCallCheck(this, Bold);

        return _possibleConstructorReturn(this, (Bold.__proto__ || Object.getPrototypeOf(Bold)).apply(this, arguments));
      }

      _createClass(Bold, [{
        key: 'optimize',
        value: function optimize(context) {
          _get(Bold.prototype.__proto__ || Object.getPrototypeOf(Bold.prototype), 'optimize', this).call(this, context);
          if (this.domNode.tagName !== this.statics.tagName[0]) {
            this.replaceWith(this.statics.blotName);
          }
        }
      }], [{
        key: 'create',
        value: function create() {
          return _get(Bold.__proto__ || Object.getPrototypeOf(Bold), 'create', this).call(this);
        }
      }, {
        key: 'formats',
        value: function formats() {
          return true;
        }
      }]);

      return Bold;
    }(_inline2.default);

    Bold.blotName = 'bold';
    Bold.tagName = ['STRONG', 'B'];

    exports.default = Bold;

    /***/ }),
    /* 57 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.addControls = exports.default = undefined;

    var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    var _quillDelta = __webpack_require__(2);

    var _quillDelta2 = _interopRequireDefault(_quillDelta);

    var _parchment = __webpack_require__(0);

    var _parchment2 = _interopRequireDefault(_parchment);

    var _quill = __webpack_require__(5);

    var _quill2 = _interopRequireDefault(_quill);

    var _logger = __webpack_require__(10);

    var _logger2 = _interopRequireDefault(_logger);

    var _module = __webpack_require__(9);

    var _module2 = _interopRequireDefault(_module);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var debug = (0, _logger2.default)('quill:toolbar');

    var Toolbar = function (_Module) {
      _inherits(Toolbar, _Module);

      function Toolbar(quill, options) {
        _classCallCheck(this, Toolbar);

        var _this = _possibleConstructorReturn(this, (Toolbar.__proto__ || Object.getPrototypeOf(Toolbar)).call(this, quill, options));

        if (Array.isArray(_this.options.container)) {
          var container = document.createElement('div');
          addControls(container, _this.options.container);
          quill.container.parentNode.insertBefore(container, quill.container);
          _this.container = container;
        } else if (typeof _this.options.container === 'string') {
          _this.container = document.querySelector(_this.options.container);
        } else {
          _this.container = _this.options.container;
        }
        if (!(_this.container instanceof HTMLElement)) {
          var _ret;

          return _ret = debug.error('Container required for toolbar', _this.options), _possibleConstructorReturn(_this, _ret);
        }
        _this.container.classList.add('ql-toolbar');
        _this.controls = [];
        _this.handlers = {};
        Object.keys(_this.options.handlers).forEach(function (format) {
          _this.addHandler(format, _this.options.handlers[format]);
        });
        [].forEach.call(_this.container.querySelectorAll('button, select'), function (input) {
          _this.attach(input);
        });
        _this.quill.on(_quill2.default.events.EDITOR_CHANGE, function (type, range) {
          if (type === _quill2.default.events.SELECTION_CHANGE) {
            _this.update(range);
          }
        });
        _this.quill.on(_quill2.default.events.SCROLL_OPTIMIZE, function () {
          var _this$quill$selection = _this.quill.selection.getRange(),
              _this$quill$selection2 = _slicedToArray(_this$quill$selection, 1),
              range = _this$quill$selection2[0]; // quill.getSelection triggers update


          _this.update(range);
        });
        return _this;
      }

      _createClass(Toolbar, [{
        key: 'addHandler',
        value: function addHandler(format, handler) {
          this.handlers[format] = handler;
        }
      }, {
        key: 'attach',
        value: function attach(input) {
          var _this2 = this;

          var format = [].find.call(input.classList, function (className) {
            return className.indexOf('ql-') === 0;
          });
          if (!format) return;
          format = format.slice('ql-'.length);
          if (input.tagName === 'BUTTON') {
            input.setAttribute('type', 'button');
          }
          if (this.handlers[format] == null) {
            if (this.quill.scroll.whitelist != null && this.quill.scroll.whitelist[format] == null) {
              debug.warn('ignoring attaching to disabled format', format, input);
              return;
            }
            if (_parchment2.default.query(format) == null) {
              debug.warn('ignoring attaching to nonexistent format', format, input);
              return;
            }
          }
          var eventName = input.tagName === 'SELECT' ? 'change' : 'click';
          input.addEventListener(eventName, function (e) {
            var value = void 0;
            if (input.tagName === 'SELECT') {
              if (input.selectedIndex < 0) return;
              var selected = input.options[input.selectedIndex];
              if (selected.hasAttribute('selected')) {
                value = false;
              } else {
                value = selected.value || false;
              }
            } else {
              if (input.classList.contains('ql-active')) {
                value = false;
              } else {
                value = input.value || !input.hasAttribute('value');
              }
              e.preventDefault();
            }
            _this2.quill.focus();

            var _quill$selection$getR = _this2.quill.selection.getRange(),
                _quill$selection$getR2 = _slicedToArray(_quill$selection$getR, 1),
                range = _quill$selection$getR2[0];

            if (_this2.handlers[format] != null) {
              _this2.handlers[format].call(_this2, value);
            } else if (_parchment2.default.query(format).prototype instanceof _parchment2.default.Embed) {
              value = prompt('Enter ' + format);
              if (!value) return;
              _this2.quill.updateContents(new _quillDelta2.default().retain(range.index).delete(range.length).insert(_defineProperty({}, format, value)), _quill2.default.sources.USER);
            } else {
              _this2.quill.format(format, value, _quill2.default.sources.USER);
            }
            _this2.update(range);
          });
          // TODO use weakmap
          this.controls.push([format, input]);
        }
      }, {
        key: 'update',
        value: function update(range) {
          var formats = range == null ? {} : this.quill.getFormat(range);
          this.controls.forEach(function (pair) {
            var _pair = _slicedToArray(pair, 2),
                format = _pair[0],
                input = _pair[1];

            if (input.tagName === 'SELECT') {
              var option = void 0;
              if (range == null) {
                option = null;
              } else if (formats[format] == null) {
                option = input.querySelector('option[selected]');
              } else if (!Array.isArray(formats[format])) {
                var value = formats[format];
                if (typeof value === 'string') {
                  value = value.replace(/\"/g, '\\"');
                }
                option = input.querySelector('option[value="' + value + '"]');
              }
              if (option == null) {
                input.value = ''; // TODO make configurable?
                input.selectedIndex = -1;
              } else {
                option.selected = true;
              }
            } else {
              if (range == null) {
                input.classList.remove('ql-active');
              } else if (input.hasAttribute('value')) {
                // both being null should match (default values)
                // '1' should match with 1 (headers)
                var isActive = formats[format] === input.getAttribute('value') || formats[format] != null && formats[format].toString() === input.getAttribute('value') || formats[format] == null && !input.getAttribute('value');
                input.classList.toggle('ql-active', isActive);
              } else {
                input.classList.toggle('ql-active', formats[format] != null);
              }
            }
          });
        }
      }]);

      return Toolbar;
    }(_module2.default);

    Toolbar.DEFAULTS = {};

    function addButton(container, format, value) {
      var input = document.createElement('button');
      input.setAttribute('type', 'button');
      input.classList.add('ql-' + format);
      if (value != null) {
        input.value = value;
      }
      container.appendChild(input);
    }

    function addControls(container, groups) {
      if (!Array.isArray(groups[0])) {
        groups = [groups];
      }
      groups.forEach(function (controls) {
        var group = document.createElement('span');
        group.classList.add('ql-formats');
        controls.forEach(function (control) {
          if (typeof control === 'string') {
            addButton(group, control);
          } else {
            var format = Object.keys(control)[0];
            var value = control[format];
            if (Array.isArray(value)) {
              addSelect(group, format, value);
            } else {
              addButton(group, format, value);
            }
          }
        });
        container.appendChild(group);
      });
    }

    function addSelect(container, format, values) {
      var input = document.createElement('select');
      input.classList.add('ql-' + format);
      values.forEach(function (value) {
        var option = document.createElement('option');
        if (value !== false) {
          option.setAttribute('value', value);
        } else {
          option.setAttribute('selected', 'selected');
        }
        input.appendChild(option);
      });
      container.appendChild(input);
    }

    Toolbar.DEFAULTS = {
      container: null,
      handlers: {
        clean: function clean() {
          var _this3 = this;

          var range = this.quill.getSelection();
          if (range == null) return;
          if (range.length == 0) {
            var formats = this.quill.getFormat();
            Object.keys(formats).forEach(function (name) {
              // Clean functionality in existing apps only clean inline formats
              if (_parchment2.default.query(name, _parchment2.default.Scope.INLINE) != null) {
                _this3.quill.format(name, false);
              }
            });
          } else {
            this.quill.removeFormat(range, _quill2.default.sources.USER);
          }
        },
        direction: function direction(value) {
          var align = this.quill.getFormat()['align'];
          if (value === 'rtl' && align == null) {
            this.quill.format('align', 'right', _quill2.default.sources.USER);
          } else if (!value && align === 'right') {
            this.quill.format('align', false, _quill2.default.sources.USER);
          }
          this.quill.format('direction', value, _quill2.default.sources.USER);
        },
        indent: function indent(value) {
          var range = this.quill.getSelection();
          var formats = this.quill.getFormat(range);
          var indent = parseInt(formats.indent || 0);
          if (value === '+1' || value === '-1') {
            var modifier = value === '+1' ? 1 : -1;
            if (formats.direction === 'rtl') modifier *= -1;
            this.quill.format('indent', indent + modifier, _quill2.default.sources.USER);
          }
        },
        link: function link(value) {
          if (value === true) {
            value = prompt('Enter link URL:');
          }
          this.quill.format('link', value, _quill2.default.sources.USER);
        },
        list: function list(value) {
          var range = this.quill.getSelection();
          var formats = this.quill.getFormat(range);
          if (value === 'check') {
            if (formats['list'] === 'checked' || formats['list'] === 'unchecked') {
              this.quill.format('list', false, _quill2.default.sources.USER);
            } else {
              this.quill.format('list', 'unchecked', _quill2.default.sources.USER);
            }
          } else {
            this.quill.format('list', value, _quill2.default.sources.USER);
          }
        }
      }
    };

    exports.default = Toolbar;
    exports.addControls = addControls;

    /***/ }),
    /* 58 */
    /***/ (function(module, exports) {

    module.exports = "<svg viewbox=\"0 0 18 18\"> <polyline class=\"ql-even ql-stroke\" points=\"5 7 3 9 5 11\"></polyline> <polyline class=\"ql-even ql-stroke\" points=\"13 7 15 9 13 11\"></polyline> <line class=ql-stroke x1=10 x2=8 y1=5 y2=13></line> </svg>";

    /***/ }),
    /* 59 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    var _picker = __webpack_require__(28);

    var _picker2 = _interopRequireDefault(_picker);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var ColorPicker = function (_Picker) {
      _inherits(ColorPicker, _Picker);

      function ColorPicker(select, label) {
        _classCallCheck(this, ColorPicker);

        var _this = _possibleConstructorReturn(this, (ColorPicker.__proto__ || Object.getPrototypeOf(ColorPicker)).call(this, select));

        _this.label.innerHTML = label;
        _this.container.classList.add('ql-color-picker');
        [].slice.call(_this.container.querySelectorAll('.ql-picker-item'), 0, 7).forEach(function (item) {
          item.classList.add('ql-primary');
        });
        return _this;
      }

      _createClass(ColorPicker, [{
        key: 'buildItem',
        value: function buildItem(option) {
          var item = _get(ColorPicker.prototype.__proto__ || Object.getPrototypeOf(ColorPicker.prototype), 'buildItem', this).call(this, option);
          item.style.backgroundColor = option.getAttribute('value') || '';
          return item;
        }
      }, {
        key: 'selectItem',
        value: function selectItem(item, trigger) {
          _get(ColorPicker.prototype.__proto__ || Object.getPrototypeOf(ColorPicker.prototype), 'selectItem', this).call(this, item, trigger);
          var colorLabel = this.label.querySelector('.ql-color-label');
          var value = item ? item.getAttribute('data-value') || '' : '';
          if (colorLabel) {
            if (colorLabel.tagName === 'line') {
              colorLabel.style.stroke = value;
            } else {
              colorLabel.style.fill = value;
            }
          }
        }
      }]);

      return ColorPicker;
    }(_picker2.default);

    exports.default = ColorPicker;

    /***/ }),
    /* 60 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    var _picker = __webpack_require__(28);

    var _picker2 = _interopRequireDefault(_picker);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var IconPicker = function (_Picker) {
      _inherits(IconPicker, _Picker);

      function IconPicker(select, icons) {
        _classCallCheck(this, IconPicker);

        var _this = _possibleConstructorReturn(this, (IconPicker.__proto__ || Object.getPrototypeOf(IconPicker)).call(this, select));

        _this.container.classList.add('ql-icon-picker');
        [].forEach.call(_this.container.querySelectorAll('.ql-picker-item'), function (item) {
          item.innerHTML = icons[item.getAttribute('data-value') || ''];
        });
        _this.defaultItem = _this.container.querySelector('.ql-selected');
        _this.selectItem(_this.defaultItem);
        return _this;
      }

      _createClass(IconPicker, [{
        key: 'selectItem',
        value: function selectItem(item, trigger) {
          _get(IconPicker.prototype.__proto__ || Object.getPrototypeOf(IconPicker.prototype), 'selectItem', this).call(this, item, trigger);
          item = item || this.defaultItem;
          this.label.innerHTML = item.innerHTML;
        }
      }]);

      return IconPicker;
    }(_picker2.default);

    exports.default = IconPicker;

    /***/ }),
    /* 61 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    var Tooltip = function () {
      function Tooltip(quill, boundsContainer) {
        var _this = this;

        _classCallCheck(this, Tooltip);

        this.quill = quill;
        this.boundsContainer = boundsContainer || document.body;
        this.root = quill.addContainer('ql-tooltip');
        this.root.innerHTML = this.constructor.TEMPLATE;
        if (this.quill.root === this.quill.scrollingContainer) {
          this.quill.root.addEventListener('scroll', function () {
            _this.root.style.marginTop = -1 * _this.quill.root.scrollTop + 'px';
          });
        }
        this.hide();
      }

      _createClass(Tooltip, [{
        key: 'hide',
        value: function hide() {
          this.root.classList.add('ql-hidden');
        }
      }, {
        key: 'position',
        value: function position(reference) {
          var left = reference.left + reference.width / 2 - this.root.offsetWidth / 2;
          // root.scrollTop should be 0 if scrollContainer !== root
          var top = reference.bottom + this.quill.root.scrollTop;
          this.root.style.left = left + 'px';
          this.root.style.top = top + 'px';
          this.root.classList.remove('ql-flip');
          var containerBounds = this.boundsContainer.getBoundingClientRect();
          var rootBounds = this.root.getBoundingClientRect();
          var shift = 0;
          if (rootBounds.right > containerBounds.right) {
            shift = containerBounds.right - rootBounds.right;
            this.root.style.left = left + shift + 'px';
          }
          if (rootBounds.left < containerBounds.left) {
            shift = containerBounds.left - rootBounds.left;
            this.root.style.left = left + shift + 'px';
          }
          if (rootBounds.bottom > containerBounds.bottom) {
            var height = rootBounds.bottom - rootBounds.top;
            var verticalShift = reference.bottom - reference.top + height;
            this.root.style.top = top - verticalShift + 'px';
            this.root.classList.add('ql-flip');
          }
          return shift;
        }
      }, {
        key: 'show',
        value: function show() {
          this.root.classList.remove('ql-editing');
          this.root.classList.remove('ql-hidden');
        }
      }]);

      return Tooltip;
    }();

    exports.default = Tooltip;

    /***/ }),
    /* 62 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

    var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    var _extend = __webpack_require__(3);

    var _extend2 = _interopRequireDefault(_extend);

    var _emitter = __webpack_require__(8);

    var _emitter2 = _interopRequireDefault(_emitter);

    var _base = __webpack_require__(43);

    var _base2 = _interopRequireDefault(_base);

    var _link = __webpack_require__(27);

    var _link2 = _interopRequireDefault(_link);

    var _selection = __webpack_require__(15);

    var _icons = __webpack_require__(41);

    var _icons2 = _interopRequireDefault(_icons);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var TOOLBAR_CONFIG = [[{ header: ['1', '2', '3', false] }], ['bold', 'italic', 'underline', 'link'], [{ list: 'ordered' }, { list: 'bullet' }], ['clean']];

    var SnowTheme = function (_BaseTheme) {
      _inherits(SnowTheme, _BaseTheme);

      function SnowTheme(quill, options) {
        _classCallCheck(this, SnowTheme);

        if (options.modules.toolbar != null && options.modules.toolbar.container == null) {
          options.modules.toolbar.container = TOOLBAR_CONFIG;
        }

        var _this = _possibleConstructorReturn(this, (SnowTheme.__proto__ || Object.getPrototypeOf(SnowTheme)).call(this, quill, options));

        _this.quill.container.classList.add('ql-snow');
        return _this;
      }

      _createClass(SnowTheme, [{
        key: 'extendToolbar',
        value: function extendToolbar(toolbar) {
          toolbar.container.classList.add('ql-snow');
          this.buildButtons([].slice.call(toolbar.container.querySelectorAll('button')), _icons2.default);
          this.buildPickers([].slice.call(toolbar.container.querySelectorAll('select')), _icons2.default);
          this.tooltip = new SnowTooltip(this.quill, this.options.bounds);
          if (toolbar.container.querySelector('.ql-link')) {
            this.quill.keyboard.addBinding({ key: 'K', shortKey: true }, function (range, context) {
              toolbar.handlers['link'].call(toolbar, !context.format.link);
            });
          }
        }
      }]);

      return SnowTheme;
    }(_base2.default);

    SnowTheme.DEFAULTS = (0, _extend2.default)(true, {}, _base2.default.DEFAULTS, {
      modules: {
        toolbar: {
          handlers: {
            link: function link(value) {
              if (value) {
                var range = this.quill.getSelection();
                if (range == null || range.length == 0) return;
                var preview = this.quill.getText(range);
                if (/^\S+@\S+\.\S+$/.test(preview) && preview.indexOf('mailto:') !== 0) {
                  preview = 'mailto:' + preview;
                }
                var tooltip = this.quill.theme.tooltip;
                tooltip.edit('link', preview);
              } else {
                this.quill.format('link', false);
              }
            }
          }
        }
      }
    });

    var SnowTooltip = function (_BaseTooltip) {
      _inherits(SnowTooltip, _BaseTooltip);

      function SnowTooltip(quill, bounds) {
        _classCallCheck(this, SnowTooltip);

        var _this2 = _possibleConstructorReturn(this, (SnowTooltip.__proto__ || Object.getPrototypeOf(SnowTooltip)).call(this, quill, bounds));

        _this2.preview = _this2.root.querySelector('a.ql-preview');
        return _this2;
      }

      _createClass(SnowTooltip, [{
        key: 'listen',
        value: function listen() {
          var _this3 = this;

          _get(SnowTooltip.prototype.__proto__ || Object.getPrototypeOf(SnowTooltip.prototype), 'listen', this).call(this);
          this.root.querySelector('a.ql-action').addEventListener('click', function (event) {
            if (_this3.root.classList.contains('ql-editing')) {
              _this3.save();
            } else {
              _this3.edit('link', _this3.preview.textContent);
            }
            event.preventDefault();
          });
          this.root.querySelector('a.ql-remove').addEventListener('click', function (event) {
            if (_this3.linkRange != null) {
              var range = _this3.linkRange;
              _this3.restoreFocus();
              _this3.quill.formatText(range, 'link', false, _emitter2.default.sources.USER);
              delete _this3.linkRange;
            }
            event.preventDefault();
            _this3.hide();
          });
          this.quill.on(_emitter2.default.events.SELECTION_CHANGE, function (range, oldRange, source) {
            if (range == null) return;
            if (range.length === 0 && source === _emitter2.default.sources.USER) {
              var _quill$scroll$descend = _this3.quill.scroll.descendant(_link2.default, range.index),
                  _quill$scroll$descend2 = _slicedToArray(_quill$scroll$descend, 2),
                  link = _quill$scroll$descend2[0],
                  offset = _quill$scroll$descend2[1];

              if (link != null) {
                _this3.linkRange = new _selection.Range(range.index - offset, link.length());
                var preview = _link2.default.formats(link.domNode);
                _this3.preview.textContent = preview;
                _this3.preview.setAttribute('href', preview);
                _this3.show();
                _this3.position(_this3.quill.getBounds(_this3.linkRange));
                return;
              }
            } else {
              delete _this3.linkRange;
            }
            _this3.hide();
          });
        }
      }, {
        key: 'show',
        value: function show() {
          _get(SnowTooltip.prototype.__proto__ || Object.getPrototypeOf(SnowTooltip.prototype), 'show', this).call(this);
          this.root.removeAttribute('data-mode');
        }
      }]);

      return SnowTooltip;
    }(_base.BaseTooltip);

    SnowTooltip.TEMPLATE = ['<a class="ql-preview" rel="noopener noreferrer" target="_blank" href="about:blank"></a>', '<input type="text" data-formula="e=mc^2" data-link="https://quilljs.com" data-video="Embed URL">', '<a class="ql-action"></a>', '<a class="ql-remove"></a>'].join('');

    exports.default = SnowTheme;

    /***/ }),
    /* 63 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    var _core = __webpack_require__(29);

    var _core2 = _interopRequireDefault(_core);

    var _align = __webpack_require__(36);

    var _direction = __webpack_require__(38);

    var _indent = __webpack_require__(64);

    var _blockquote = __webpack_require__(65);

    var _blockquote2 = _interopRequireDefault(_blockquote);

    var _header = __webpack_require__(66);

    var _header2 = _interopRequireDefault(_header);

    var _list = __webpack_require__(67);

    var _list2 = _interopRequireDefault(_list);

    var _background = __webpack_require__(37);

    var _color = __webpack_require__(26);

    var _font = __webpack_require__(39);

    var _size = __webpack_require__(40);

    var _bold = __webpack_require__(56);

    var _bold2 = _interopRequireDefault(_bold);

    var _italic = __webpack_require__(68);

    var _italic2 = _interopRequireDefault(_italic);

    var _link = __webpack_require__(27);

    var _link2 = _interopRequireDefault(_link);

    var _script = __webpack_require__(69);

    var _script2 = _interopRequireDefault(_script);

    var _strike = __webpack_require__(70);

    var _strike2 = _interopRequireDefault(_strike);

    var _underline = __webpack_require__(71);

    var _underline2 = _interopRequireDefault(_underline);

    var _image = __webpack_require__(72);

    var _image2 = _interopRequireDefault(_image);

    var _video = __webpack_require__(73);

    var _video2 = _interopRequireDefault(_video);

    var _code = __webpack_require__(13);

    var _code2 = _interopRequireDefault(_code);

    var _formula = __webpack_require__(74);

    var _formula2 = _interopRequireDefault(_formula);

    var _syntax = __webpack_require__(75);

    var _syntax2 = _interopRequireDefault(_syntax);

    var _toolbar = __webpack_require__(57);

    var _toolbar2 = _interopRequireDefault(_toolbar);

    var _icons = __webpack_require__(41);

    var _icons2 = _interopRequireDefault(_icons);

    var _picker = __webpack_require__(28);

    var _picker2 = _interopRequireDefault(_picker);

    var _colorPicker = __webpack_require__(59);

    var _colorPicker2 = _interopRequireDefault(_colorPicker);

    var _iconPicker = __webpack_require__(60);

    var _iconPicker2 = _interopRequireDefault(_iconPicker);

    var _tooltip = __webpack_require__(61);

    var _tooltip2 = _interopRequireDefault(_tooltip);

    var _bubble = __webpack_require__(108);

    var _bubble2 = _interopRequireDefault(_bubble);

    var _snow = __webpack_require__(62);

    var _snow2 = _interopRequireDefault(_snow);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    _core2.default.register({
      'attributors/attribute/direction': _direction.DirectionAttribute,

      'attributors/class/align': _align.AlignClass,
      'attributors/class/background': _background.BackgroundClass,
      'attributors/class/color': _color.ColorClass,
      'attributors/class/direction': _direction.DirectionClass,
      'attributors/class/font': _font.FontClass,
      'attributors/class/size': _size.SizeClass,

      'attributors/style/align': _align.AlignStyle,
      'attributors/style/background': _background.BackgroundStyle,
      'attributors/style/color': _color.ColorStyle,
      'attributors/style/direction': _direction.DirectionStyle,
      'attributors/style/font': _font.FontStyle,
      'attributors/style/size': _size.SizeStyle
    }, true);

    _core2.default.register({
      'formats/align': _align.AlignClass,
      'formats/direction': _direction.DirectionClass,
      'formats/indent': _indent.IndentClass,

      'formats/background': _background.BackgroundStyle,
      'formats/color': _color.ColorStyle,
      'formats/font': _font.FontClass,
      'formats/size': _size.SizeClass,

      'formats/blockquote': _blockquote2.default,
      'formats/code-block': _code2.default,
      'formats/header': _header2.default,
      'formats/list': _list2.default,

      'formats/bold': _bold2.default,
      'formats/code': _code.Code,
      'formats/italic': _italic2.default,
      'formats/link': _link2.default,
      'formats/script': _script2.default,
      'formats/strike': _strike2.default,
      'formats/underline': _underline2.default,

      'formats/image': _image2.default,
      'formats/video': _video2.default,

      'formats/list/item': _list.ListItem,

      'modules/formula': _formula2.default,
      'modules/syntax': _syntax2.default,
      'modules/toolbar': _toolbar2.default,

      'themes/bubble': _bubble2.default,
      'themes/snow': _snow2.default,

      'ui/icons': _icons2.default,
      'ui/picker': _picker2.default,
      'ui/icon-picker': _iconPicker2.default,
      'ui/color-picker': _colorPicker2.default,
      'ui/tooltip': _tooltip2.default
    }, true);

    exports.default = _core2.default;

    /***/ }),
    /* 64 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.IndentClass = undefined;

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    var _parchment = __webpack_require__(0);

    var _parchment2 = _interopRequireDefault(_parchment);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var IdentAttributor = function (_Parchment$Attributor) {
      _inherits(IdentAttributor, _Parchment$Attributor);

      function IdentAttributor() {
        _classCallCheck(this, IdentAttributor);

        return _possibleConstructorReturn(this, (IdentAttributor.__proto__ || Object.getPrototypeOf(IdentAttributor)).apply(this, arguments));
      }

      _createClass(IdentAttributor, [{
        key: 'add',
        value: function add(node, value) {
          if (value === '+1' || value === '-1') {
            var indent = this.value(node) || 0;
            value = value === '+1' ? indent + 1 : indent - 1;
          }
          if (value === 0) {
            this.remove(node);
            return true;
          } else {
            return _get(IdentAttributor.prototype.__proto__ || Object.getPrototypeOf(IdentAttributor.prototype), 'add', this).call(this, node, value);
          }
        }
      }, {
        key: 'canAdd',
        value: function canAdd(node, value) {
          return _get(IdentAttributor.prototype.__proto__ || Object.getPrototypeOf(IdentAttributor.prototype), 'canAdd', this).call(this, node, value) || _get(IdentAttributor.prototype.__proto__ || Object.getPrototypeOf(IdentAttributor.prototype), 'canAdd', this).call(this, node, parseInt(value));
        }
      }, {
        key: 'value',
        value: function value(node) {
          return parseInt(_get(IdentAttributor.prototype.__proto__ || Object.getPrototypeOf(IdentAttributor.prototype), 'value', this).call(this, node)) || undefined; // Don't return NaN
        }
      }]);

      return IdentAttributor;
    }(_parchment2.default.Attributor.Class);

    var IndentClass = new IdentAttributor('indent', 'ql-indent', {
      scope: _parchment2.default.Scope.BLOCK,
      whitelist: [1, 2, 3, 4, 5, 6, 7, 8]
    });

    exports.IndentClass = IndentClass;

    /***/ }),
    /* 65 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    var _block = __webpack_require__(4);

    var _block2 = _interopRequireDefault(_block);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var Blockquote = function (_Block) {
      _inherits(Blockquote, _Block);

      function Blockquote() {
        _classCallCheck(this, Blockquote);

        return _possibleConstructorReturn(this, (Blockquote.__proto__ || Object.getPrototypeOf(Blockquote)).apply(this, arguments));
      }

      return Blockquote;
    }(_block2.default);

    Blockquote.blotName = 'blockquote';
    Blockquote.tagName = 'blockquote';

    exports.default = Blockquote;

    /***/ }),
    /* 66 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    var _block = __webpack_require__(4);

    var _block2 = _interopRequireDefault(_block);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var Header = function (_Block) {
      _inherits(Header, _Block);

      function Header() {
        _classCallCheck(this, Header);

        return _possibleConstructorReturn(this, (Header.__proto__ || Object.getPrototypeOf(Header)).apply(this, arguments));
      }

      _createClass(Header, null, [{
        key: 'formats',
        value: function formats(domNode) {
          return this.tagName.indexOf(domNode.tagName) + 1;
        }
      }]);

      return Header;
    }(_block2.default);

    Header.blotName = 'header';
    Header.tagName = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'];

    exports.default = Header;

    /***/ }),
    /* 67 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = exports.ListItem = undefined;

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    var _parchment = __webpack_require__(0);

    var _parchment2 = _interopRequireDefault(_parchment);

    var _block = __webpack_require__(4);

    var _block2 = _interopRequireDefault(_block);

    var _container = __webpack_require__(25);

    var _container2 = _interopRequireDefault(_container);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var ListItem = function (_Block) {
      _inherits(ListItem, _Block);

      function ListItem() {
        _classCallCheck(this, ListItem);

        return _possibleConstructorReturn(this, (ListItem.__proto__ || Object.getPrototypeOf(ListItem)).apply(this, arguments));
      }

      _createClass(ListItem, [{
        key: 'format',
        value: function format(name, value) {
          if (name === List.blotName && !value) {
            this.replaceWith(_parchment2.default.create(this.statics.scope));
          } else {
            _get(ListItem.prototype.__proto__ || Object.getPrototypeOf(ListItem.prototype), 'format', this).call(this, name, value);
          }
        }
      }, {
        key: 'remove',
        value: function remove() {
          if (this.prev == null && this.next == null) {
            this.parent.remove();
          } else {
            _get(ListItem.prototype.__proto__ || Object.getPrototypeOf(ListItem.prototype), 'remove', this).call(this);
          }
        }
      }, {
        key: 'replaceWith',
        value: function replaceWith(name, value) {
          this.parent.isolate(this.offset(this.parent), this.length());
          if (name === this.parent.statics.blotName) {
            this.parent.replaceWith(name, value);
            return this;
          } else {
            this.parent.unwrap();
            return _get(ListItem.prototype.__proto__ || Object.getPrototypeOf(ListItem.prototype), 'replaceWith', this).call(this, name, value);
          }
        }
      }], [{
        key: 'formats',
        value: function formats(domNode) {
          return domNode.tagName === this.tagName ? undefined : _get(ListItem.__proto__ || Object.getPrototypeOf(ListItem), 'formats', this).call(this, domNode);
        }
      }]);

      return ListItem;
    }(_block2.default);

    ListItem.blotName = 'list-item';
    ListItem.tagName = 'LI';

    var List = function (_Container) {
      _inherits(List, _Container);

      _createClass(List, null, [{
        key: 'create',
        value: function create(value) {
          var tagName = value === 'ordered' ? 'OL' : 'UL';
          var node = _get(List.__proto__ || Object.getPrototypeOf(List), 'create', this).call(this, tagName);
          if (value === 'checked' || value === 'unchecked') {
            node.setAttribute('data-checked', value === 'checked');
          }
          return node;
        }
      }, {
        key: 'formats',
        value: function formats(domNode) {
          if (domNode.tagName === 'OL') return 'ordered';
          if (domNode.tagName === 'UL') {
            if (domNode.hasAttribute('data-checked')) {
              return domNode.getAttribute('data-checked') === 'true' ? 'checked' : 'unchecked';
            } else {
              return 'bullet';
            }
          }
          return undefined;
        }
      }]);

      function List(domNode) {
        _classCallCheck(this, List);

        var _this2 = _possibleConstructorReturn(this, (List.__proto__ || Object.getPrototypeOf(List)).call(this, domNode));

        var listEventHandler = function listEventHandler(e) {
          if (e.target.parentNode !== domNode) return;
          var format = _this2.statics.formats(domNode);
          var blot = _parchment2.default.find(e.target);
          if (format === 'checked') {
            blot.format('list', 'unchecked');
          } else if (format === 'unchecked') {
            blot.format('list', 'checked');
          }
        };

        domNode.addEventListener('touchstart', listEventHandler);
        domNode.addEventListener('mousedown', listEventHandler);
        return _this2;
      }

      _createClass(List, [{
        key: 'format',
        value: function format(name, value) {
          if (this.children.length > 0) {
            this.children.tail.format(name, value);
          }
        }
      }, {
        key: 'formats',
        value: function formats() {
          // We don't inherit from FormatBlot
          return _defineProperty({}, this.statics.blotName, this.statics.formats(this.domNode));
        }
      }, {
        key: 'insertBefore',
        value: function insertBefore(blot, ref) {
          if (blot instanceof ListItem) {
            _get(List.prototype.__proto__ || Object.getPrototypeOf(List.prototype), 'insertBefore', this).call(this, blot, ref);
          } else {
            var index = ref == null ? this.length() : ref.offset(this);
            var after = this.split(index);
            after.parent.insertBefore(blot, after);
          }
        }
      }, {
        key: 'optimize',
        value: function optimize(context) {
          _get(List.prototype.__proto__ || Object.getPrototypeOf(List.prototype), 'optimize', this).call(this, context);
          var next = this.next;
          if (next != null && next.prev === this && next.statics.blotName === this.statics.blotName && next.domNode.tagName === this.domNode.tagName && next.domNode.getAttribute('data-checked') === this.domNode.getAttribute('data-checked')) {
            next.moveChildren(this);
            next.remove();
          }
        }
      }, {
        key: 'replace',
        value: function replace(target) {
          if (target.statics.blotName !== this.statics.blotName) {
            var item = _parchment2.default.create(this.statics.defaultChild);
            target.moveChildren(item);
            this.appendChild(item);
          }
          _get(List.prototype.__proto__ || Object.getPrototypeOf(List.prototype), 'replace', this).call(this, target);
        }
      }]);

      return List;
    }(_container2.default);

    List.blotName = 'list';
    List.scope = _parchment2.default.Scope.BLOCK_BLOT;
    List.tagName = ['OL', 'UL'];
    List.defaultChild = 'list-item';
    List.allowedChildren = [ListItem];

    exports.ListItem = ListItem;
    exports.default = List;

    /***/ }),
    /* 68 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    var _bold = __webpack_require__(56);

    var _bold2 = _interopRequireDefault(_bold);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var Italic = function (_Bold) {
      _inherits(Italic, _Bold);

      function Italic() {
        _classCallCheck(this, Italic);

        return _possibleConstructorReturn(this, (Italic.__proto__ || Object.getPrototypeOf(Italic)).apply(this, arguments));
      }

      return Italic;
    }(_bold2.default);

    Italic.blotName = 'italic';
    Italic.tagName = ['EM', 'I'];

    exports.default = Italic;

    /***/ }),
    /* 69 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    var _inline = __webpack_require__(6);

    var _inline2 = _interopRequireDefault(_inline);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var Script = function (_Inline) {
      _inherits(Script, _Inline);

      function Script() {
        _classCallCheck(this, Script);

        return _possibleConstructorReturn(this, (Script.__proto__ || Object.getPrototypeOf(Script)).apply(this, arguments));
      }

      _createClass(Script, null, [{
        key: 'create',
        value: function create(value) {
          if (value === 'super') {
            return document.createElement('sup');
          } else if (value === 'sub') {
            return document.createElement('sub');
          } else {
            return _get(Script.__proto__ || Object.getPrototypeOf(Script), 'create', this).call(this, value);
          }
        }
      }, {
        key: 'formats',
        value: function formats(domNode) {
          if (domNode.tagName === 'SUB') return 'sub';
          if (domNode.tagName === 'SUP') return 'super';
          return undefined;
        }
      }]);

      return Script;
    }(_inline2.default);

    Script.blotName = 'script';
    Script.tagName = ['SUB', 'SUP'];

    exports.default = Script;

    /***/ }),
    /* 70 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    var _inline = __webpack_require__(6);

    var _inline2 = _interopRequireDefault(_inline);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var Strike = function (_Inline) {
      _inherits(Strike, _Inline);

      function Strike() {
        _classCallCheck(this, Strike);

        return _possibleConstructorReturn(this, (Strike.__proto__ || Object.getPrototypeOf(Strike)).apply(this, arguments));
      }

      return Strike;
    }(_inline2.default);

    Strike.blotName = 'strike';
    Strike.tagName = 'S';

    exports.default = Strike;

    /***/ }),
    /* 71 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    var _inline = __webpack_require__(6);

    var _inline2 = _interopRequireDefault(_inline);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var Underline = function (_Inline) {
      _inherits(Underline, _Inline);

      function Underline() {
        _classCallCheck(this, Underline);

        return _possibleConstructorReturn(this, (Underline.__proto__ || Object.getPrototypeOf(Underline)).apply(this, arguments));
      }

      return Underline;
    }(_inline2.default);

    Underline.blotName = 'underline';
    Underline.tagName = 'U';

    exports.default = Underline;

    /***/ }),
    /* 72 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    var _parchment = __webpack_require__(0);

    var _parchment2 = _interopRequireDefault(_parchment);

    var _link = __webpack_require__(27);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var ATTRIBUTES = ['alt', 'height', 'width'];

    var Image = function (_Parchment$Embed) {
      _inherits(Image, _Parchment$Embed);

      function Image() {
        _classCallCheck(this, Image);

        return _possibleConstructorReturn(this, (Image.__proto__ || Object.getPrototypeOf(Image)).apply(this, arguments));
      }

      _createClass(Image, [{
        key: 'format',
        value: function format(name, value) {
          if (ATTRIBUTES.indexOf(name) > -1) {
            if (value) {
              this.domNode.setAttribute(name, value);
            } else {
              this.domNode.removeAttribute(name);
            }
          } else {
            _get(Image.prototype.__proto__ || Object.getPrototypeOf(Image.prototype), 'format', this).call(this, name, value);
          }
        }
      }], [{
        key: 'create',
        value: function create(value) {
          var node = _get(Image.__proto__ || Object.getPrototypeOf(Image), 'create', this).call(this, value);
          if (typeof value === 'string') {
            node.setAttribute('src', this.sanitize(value));
          }
          return node;
        }
      }, {
        key: 'formats',
        value: function formats(domNode) {
          return ATTRIBUTES.reduce(function (formats, attribute) {
            if (domNode.hasAttribute(attribute)) {
              formats[attribute] = domNode.getAttribute(attribute);
            }
            return formats;
          }, {});
        }
      }, {
        key: 'match',
        value: function match(url) {
          return (/\.(jpe?g|gif|png)$/.test(url) || /^data:image\/.+;base64/.test(url)
          );
        }
      }, {
        key: 'sanitize',
        value: function sanitize(url) {
          return (0, _link.sanitize)(url, ['http', 'https', 'data']) ? url : '//:0';
        }
      }, {
        key: 'value',
        value: function value(domNode) {
          return domNode.getAttribute('src');
        }
      }]);

      return Image;
    }(_parchment2.default.Embed);

    Image.blotName = 'image';
    Image.tagName = 'IMG';

    exports.default = Image;

    /***/ }),
    /* 73 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    var _block = __webpack_require__(4);

    var _link = __webpack_require__(27);

    var _link2 = _interopRequireDefault(_link);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var ATTRIBUTES = ['height', 'width'];

    var Video = function (_BlockEmbed) {
      _inherits(Video, _BlockEmbed);

      function Video() {
        _classCallCheck(this, Video);

        return _possibleConstructorReturn(this, (Video.__proto__ || Object.getPrototypeOf(Video)).apply(this, arguments));
      }

      _createClass(Video, [{
        key: 'format',
        value: function format(name, value) {
          if (ATTRIBUTES.indexOf(name) > -1) {
            if (value) {
              this.domNode.setAttribute(name, value);
            } else {
              this.domNode.removeAttribute(name);
            }
          } else {
            _get(Video.prototype.__proto__ || Object.getPrototypeOf(Video.prototype), 'format', this).call(this, name, value);
          }
        }
      }], [{
        key: 'create',
        value: function create(value) {
          var node = _get(Video.__proto__ || Object.getPrototypeOf(Video), 'create', this).call(this, value);
          node.setAttribute('frameborder', '0');
          node.setAttribute('allowfullscreen', true);
          node.setAttribute('src', this.sanitize(value));
          return node;
        }
      }, {
        key: 'formats',
        value: function formats(domNode) {
          return ATTRIBUTES.reduce(function (formats, attribute) {
            if (domNode.hasAttribute(attribute)) {
              formats[attribute] = domNode.getAttribute(attribute);
            }
            return formats;
          }, {});
        }
      }, {
        key: 'sanitize',
        value: function sanitize(url) {
          return _link2.default.sanitize(url);
        }
      }, {
        key: 'value',
        value: function value(domNode) {
          return domNode.getAttribute('src');
        }
      }]);

      return Video;
    }(_block.BlockEmbed);

    Video.blotName = 'video';
    Video.className = 'ql-video';
    Video.tagName = 'IFRAME';

    exports.default = Video;

    /***/ }),
    /* 74 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = exports.FormulaBlot = undefined;

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    var _embed = __webpack_require__(35);

    var _embed2 = _interopRequireDefault(_embed);

    var _quill = __webpack_require__(5);

    var _quill2 = _interopRequireDefault(_quill);

    var _module = __webpack_require__(9);

    var _module2 = _interopRequireDefault(_module);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var FormulaBlot = function (_Embed) {
      _inherits(FormulaBlot, _Embed);

      function FormulaBlot() {
        _classCallCheck(this, FormulaBlot);

        return _possibleConstructorReturn(this, (FormulaBlot.__proto__ || Object.getPrototypeOf(FormulaBlot)).apply(this, arguments));
      }

      _createClass(FormulaBlot, null, [{
        key: 'create',
        value: function create(value) {
          var node = _get(FormulaBlot.__proto__ || Object.getPrototypeOf(FormulaBlot), 'create', this).call(this, value);
          if (typeof value === 'string') {
            window.katex.render(value, node, {
              throwOnError: false,
              errorColor: '#f00'
            });
            node.setAttribute('data-value', value);
          }
          return node;
        }
      }, {
        key: 'value',
        value: function value(domNode) {
          return domNode.getAttribute('data-value');
        }
      }]);

      return FormulaBlot;
    }(_embed2.default);

    FormulaBlot.blotName = 'formula';
    FormulaBlot.className = 'ql-formula';
    FormulaBlot.tagName = 'SPAN';

    var Formula = function (_Module) {
      _inherits(Formula, _Module);

      _createClass(Formula, null, [{
        key: 'register',
        value: function register() {
          _quill2.default.register(FormulaBlot, true);
        }
      }]);

      function Formula() {
        _classCallCheck(this, Formula);

        var _this2 = _possibleConstructorReturn(this, (Formula.__proto__ || Object.getPrototypeOf(Formula)).call(this));

        if (window.katex == null) {
          throw new Error('Formula module requires KaTeX.');
        }
        return _this2;
      }

      return Formula;
    }(_module2.default);

    exports.FormulaBlot = FormulaBlot;
    exports.default = Formula;

    /***/ }),
    /* 75 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = exports.CodeToken = exports.CodeBlock = undefined;

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    var _parchment = __webpack_require__(0);

    var _parchment2 = _interopRequireDefault(_parchment);

    var _quill = __webpack_require__(5);

    var _quill2 = _interopRequireDefault(_quill);

    var _module = __webpack_require__(9);

    var _module2 = _interopRequireDefault(_module);

    var _code = __webpack_require__(13);

    var _code2 = _interopRequireDefault(_code);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var SyntaxCodeBlock = function (_CodeBlock) {
      _inherits(SyntaxCodeBlock, _CodeBlock);

      function SyntaxCodeBlock() {
        _classCallCheck(this, SyntaxCodeBlock);

        return _possibleConstructorReturn(this, (SyntaxCodeBlock.__proto__ || Object.getPrototypeOf(SyntaxCodeBlock)).apply(this, arguments));
      }

      _createClass(SyntaxCodeBlock, [{
        key: 'replaceWith',
        value: function replaceWith(block) {
          this.domNode.textContent = this.domNode.textContent;
          this.attach();
          _get(SyntaxCodeBlock.prototype.__proto__ || Object.getPrototypeOf(SyntaxCodeBlock.prototype), 'replaceWith', this).call(this, block);
        }
      }, {
        key: 'highlight',
        value: function highlight(_highlight) {
          var text = this.domNode.textContent;
          if (this.cachedText !== text) {
            if (text.trim().length > 0 || this.cachedText == null) {
              this.domNode.innerHTML = _highlight(text);
              this.domNode.normalize();
              this.attach();
            }
            this.cachedText = text;
          }
        }
      }]);

      return SyntaxCodeBlock;
    }(_code2.default);

    SyntaxCodeBlock.className = 'ql-syntax';

    var CodeToken = new _parchment2.default.Attributor.Class('token', 'hljs', {
      scope: _parchment2.default.Scope.INLINE
    });

    var Syntax = function (_Module) {
      _inherits(Syntax, _Module);

      _createClass(Syntax, null, [{
        key: 'register',
        value: function register() {
          _quill2.default.register(CodeToken, true);
          _quill2.default.register(SyntaxCodeBlock, true);
        }
      }]);

      function Syntax(quill, options) {
        _classCallCheck(this, Syntax);

        var _this2 = _possibleConstructorReturn(this, (Syntax.__proto__ || Object.getPrototypeOf(Syntax)).call(this, quill, options));

        if (typeof _this2.options.highlight !== 'function') {
          throw new Error('Syntax module requires highlight.js. Please include the library on the page before Quill.');
        }
        var timer = null;
        _this2.quill.on(_quill2.default.events.SCROLL_OPTIMIZE, function () {
          clearTimeout(timer);
          timer = setTimeout(function () {
            _this2.highlight();
            timer = null;
          }, _this2.options.interval);
        });
        _this2.highlight();
        return _this2;
      }

      _createClass(Syntax, [{
        key: 'highlight',
        value: function highlight() {
          var _this3 = this;

          if (this.quill.selection.composing) return;
          this.quill.update(_quill2.default.sources.USER);
          var range = this.quill.getSelection();
          this.quill.scroll.descendants(SyntaxCodeBlock).forEach(function (code) {
            code.highlight(_this3.options.highlight);
          });
          this.quill.update(_quill2.default.sources.SILENT);
          if (range != null) {
            this.quill.setSelection(range, _quill2.default.sources.SILENT);
          }
        }
      }]);

      return Syntax;
    }(_module2.default);

    Syntax.DEFAULTS = {
      highlight: function () {
        if (window.hljs == null) return null;
        return function (text) {
          var result = window.hljs.highlightAuto(text);
          return result.value;
        };
      }(),
      interval: 1000
    };

    exports.CodeBlock = SyntaxCodeBlock;
    exports.CodeToken = CodeToken;
    exports.default = Syntax;

    /***/ }),
    /* 76 */
    /***/ (function(module, exports) {

    module.exports = "<svg viewbox=\"0 0 18 18\"> <line class=ql-stroke x1=3 x2=15 y1=9 y2=9></line> <line class=ql-stroke x1=3 x2=13 y1=14 y2=14></line> <line class=ql-stroke x1=3 x2=9 y1=4 y2=4></line> </svg>";

    /***/ }),
    /* 77 */
    /***/ (function(module, exports) {

    module.exports = "<svg viewbox=\"0 0 18 18\"> <line class=ql-stroke x1=15 x2=3 y1=9 y2=9></line> <line class=ql-stroke x1=14 x2=4 y1=14 y2=14></line> <line class=ql-stroke x1=12 x2=6 y1=4 y2=4></line> </svg>";

    /***/ }),
    /* 78 */
    /***/ (function(module, exports) {

    module.exports = "<svg viewbox=\"0 0 18 18\"> <line class=ql-stroke x1=15 x2=3 y1=9 y2=9></line> <line class=ql-stroke x1=15 x2=5 y1=14 y2=14></line> <line class=ql-stroke x1=15 x2=9 y1=4 y2=4></line> </svg>";

    /***/ }),
    /* 79 */
    /***/ (function(module, exports) {

    module.exports = "<svg viewbox=\"0 0 18 18\"> <line class=ql-stroke x1=15 x2=3 y1=9 y2=9></line> <line class=ql-stroke x1=15 x2=3 y1=14 y2=14></line> <line class=ql-stroke x1=15 x2=3 y1=4 y2=4></line> </svg>";

    /***/ }),
    /* 80 */
    /***/ (function(module, exports) {

    module.exports = "<svg viewbox=\"0 0 18 18\"> <g class=\"ql-fill ql-color-label\"> <polygon points=\"6 6.868 6 6 5 6 5 7 5.942 7 6 6.868\"></polygon> <rect height=1 width=1 x=4 y=4></rect> <polygon points=\"6.817 5 6 5 6 6 6.38 6 6.817 5\"></polygon> <rect height=1 width=1 x=2 y=6></rect> <rect height=1 width=1 x=3 y=5></rect> <rect height=1 width=1 x=4 y=7></rect> <polygon points=\"4 11.439 4 11 3 11 3 12 3.755 12 4 11.439\"></polygon> <rect height=1 width=1 x=2 y=12></rect> <rect height=1 width=1 x=2 y=9></rect> <rect height=1 width=1 x=2 y=15></rect> <polygon points=\"4.63 10 4 10 4 11 4.192 11 4.63 10\"></polygon> <rect height=1 width=1 x=3 y=8></rect> <path d=M10.832,4.2L11,4.582V4H10.708A1.948,1.948,0,0,1,10.832,4.2Z></path> <path d=M7,4.582L7.168,4.2A1.929,1.929,0,0,1,7.292,4H7V4.582Z></path> <path d=M8,13H7.683l-0.351.8a1.933,1.933,0,0,1-.124.2H8V13Z></path> <rect height=1 width=1 x=12 y=2></rect> <rect height=1 width=1 x=11 y=3></rect> <path d=M9,3H8V3.282A1.985,1.985,0,0,1,9,3Z></path> <rect height=1 width=1 x=2 y=3></rect> <rect height=1 width=1 x=6 y=2></rect> <rect height=1 width=1 x=3 y=2></rect> <rect height=1 width=1 x=5 y=3></rect> <rect height=1 width=1 x=9 y=2></rect> <rect height=1 width=1 x=15 y=14></rect> <polygon points=\"13.447 10.174 13.469 10.225 13.472 10.232 13.808 11 14 11 14 10 13.37 10 13.447 10.174\"></polygon> <rect height=1 width=1 x=13 y=7></rect> <rect height=1 width=1 x=15 y=5></rect> <rect height=1 width=1 x=14 y=6></rect> <rect height=1 width=1 x=15 y=8></rect> <rect height=1 width=1 x=14 y=9></rect> <path d=M3.775,14H3v1H4V14.314A1.97,1.97,0,0,1,3.775,14Z></path> <rect height=1 width=1 x=14 y=3></rect> <polygon points=\"12 6.868 12 6 11.62 6 12 6.868\"></polygon> <rect height=1 width=1 x=15 y=2></rect> <rect height=1 width=1 x=12 y=5></rect> <rect height=1 width=1 x=13 y=4></rect> <polygon points=\"12.933 9 13 9 13 8 12.495 8 12.933 9\"></polygon> <rect height=1 width=1 x=9 y=14></rect> <rect height=1 width=1 x=8 y=15></rect> <path d=M6,14.926V15H7V14.316A1.993,1.993,0,0,1,6,14.926Z></path> <rect height=1 width=1 x=5 y=15></rect> <path d=M10.668,13.8L10.317,13H10v1h0.792A1.947,1.947,0,0,1,10.668,13.8Z></path> <rect height=1 width=1 x=11 y=15></rect> <path d=M14.332,12.2a1.99,1.99,0,0,1,.166.8H15V12H14.245Z></path> <rect height=1 width=1 x=14 y=15></rect> <rect height=1 width=1 x=15 y=11></rect> </g> <polyline class=ql-stroke points=\"5.5 13 9 5 12.5 13\"></polyline> <line class=ql-stroke x1=11.63 x2=6.38 y1=11 y2=11></line> </svg>";

    /***/ }),
    /* 81 */
    /***/ (function(module, exports) {

    module.exports = "<svg viewbox=\"0 0 18 18\"> <rect class=\"ql-fill ql-stroke\" height=3 width=3 x=4 y=5></rect> <rect class=\"ql-fill ql-stroke\" height=3 width=3 x=11 y=5></rect> <path class=\"ql-even ql-fill ql-stroke\" d=M7,8c0,4.031-3,5-3,5></path> <path class=\"ql-even ql-fill ql-stroke\" d=M14,8c0,4.031-3,5-3,5></path> </svg>";

    /***/ }),
    /* 82 */
    /***/ (function(module, exports) {

    module.exports = "<svg viewbox=\"0 0 18 18\"> <path class=ql-stroke d=M5,4H9.5A2.5,2.5,0,0,1,12,6.5v0A2.5,2.5,0,0,1,9.5,9H5A0,0,0,0,1,5,9V4A0,0,0,0,1,5,4Z></path> <path class=ql-stroke d=M5,9h5.5A2.5,2.5,0,0,1,13,11.5v0A2.5,2.5,0,0,1,10.5,14H5a0,0,0,0,1,0,0V9A0,0,0,0,1,5,9Z></path> </svg>";

    /***/ }),
    /* 83 */
    /***/ (function(module, exports) {

    module.exports = "<svg class=\"\" viewbox=\"0 0 18 18\"> <line class=ql-stroke x1=5 x2=13 y1=3 y2=3></line> <line class=ql-stroke x1=6 x2=9.35 y1=12 y2=3></line> <line class=ql-stroke x1=11 x2=15 y1=11 y2=15></line> <line class=ql-stroke x1=15 x2=11 y1=11 y2=15></line> <rect class=ql-fill height=1 rx=0.5 ry=0.5 width=7 x=2 y=14></rect> </svg>";

    /***/ }),
    /* 84 */
    /***/ (function(module, exports) {

    module.exports = "<svg viewbox=\"0 0 18 18\"> <line class=\"ql-color-label ql-stroke ql-transparent\" x1=3 x2=15 y1=15 y2=15></line> <polyline class=ql-stroke points=\"5.5 11 9 3 12.5 11\"></polyline> <line class=ql-stroke x1=11.63 x2=6.38 y1=9 y2=9></line> </svg>";

    /***/ }),
    /* 85 */
    /***/ (function(module, exports) {

    module.exports = "<svg viewbox=\"0 0 18 18\"> <polygon class=\"ql-stroke ql-fill\" points=\"3 11 5 9 3 7 3 11\"></polygon> <line class=\"ql-stroke ql-fill\" x1=15 x2=11 y1=4 y2=4></line> <path class=ql-fill d=M11,3a3,3,0,0,0,0,6h1V3H11Z></path> <rect class=ql-fill height=11 width=1 x=11 y=4></rect> <rect class=ql-fill height=11 width=1 x=13 y=4></rect> </svg>";

    /***/ }),
    /* 86 */
    /***/ (function(module, exports) {

    module.exports = "<svg viewbox=\"0 0 18 18\"> <polygon class=\"ql-stroke ql-fill\" points=\"15 12 13 10 15 8 15 12\"></polygon> <line class=\"ql-stroke ql-fill\" x1=9 x2=5 y1=4 y2=4></line> <path class=ql-fill d=M5,3A3,3,0,0,0,5,9H6V3H5Z></path> <rect class=ql-fill height=11 width=1 x=5 y=4></rect> <rect class=ql-fill height=11 width=1 x=7 y=4></rect> </svg>";

    /***/ }),
    /* 87 */
    /***/ (function(module, exports) {

    module.exports = "<svg viewbox=\"0 0 18 18\"> <path class=ql-fill d=M14,16H4a1,1,0,0,1,0-2H14A1,1,0,0,1,14,16Z /> <path class=ql-fill d=M14,4H4A1,1,0,0,1,4,2H14A1,1,0,0,1,14,4Z /> <rect class=ql-fill x=3 y=6 width=12 height=6 rx=1 ry=1 /> </svg>";

    /***/ }),
    /* 88 */
    /***/ (function(module, exports) {

    module.exports = "<svg viewbox=\"0 0 18 18\"> <path class=ql-fill d=M13,16H5a1,1,0,0,1,0-2h8A1,1,0,0,1,13,16Z /> <path class=ql-fill d=M13,4H5A1,1,0,0,1,5,2h8A1,1,0,0,1,13,4Z /> <rect class=ql-fill x=2 y=6 width=14 height=6 rx=1 ry=1 /> </svg>";

    /***/ }),
    /* 89 */
    /***/ (function(module, exports) {

    module.exports = "<svg viewbox=\"0 0 18 18\"> <path class=ql-fill d=M15,8H13a1,1,0,0,1,0-2h2A1,1,0,0,1,15,8Z /> <path class=ql-fill d=M15,12H13a1,1,0,0,1,0-2h2A1,1,0,0,1,15,12Z /> <path class=ql-fill d=M15,16H5a1,1,0,0,1,0-2H15A1,1,0,0,1,15,16Z /> <path class=ql-fill d=M15,4H5A1,1,0,0,1,5,2H15A1,1,0,0,1,15,4Z /> <rect class=ql-fill x=2 y=6 width=8 height=6 rx=1 ry=1 /> </svg>";

    /***/ }),
    /* 90 */
    /***/ (function(module, exports) {

    module.exports = "<svg viewbox=\"0 0 18 18\"> <path class=ql-fill d=M5,8H3A1,1,0,0,1,3,6H5A1,1,0,0,1,5,8Z /> <path class=ql-fill d=M5,12H3a1,1,0,0,1,0-2H5A1,1,0,0,1,5,12Z /> <path class=ql-fill d=M13,16H3a1,1,0,0,1,0-2H13A1,1,0,0,1,13,16Z /> <path class=ql-fill d=M13,4H3A1,1,0,0,1,3,2H13A1,1,0,0,1,13,4Z /> <rect class=ql-fill x=8 y=6 width=8 height=6 rx=1 ry=1 transform=\"translate(24 18) rotate(-180)\"/> </svg>";

    /***/ }),
    /* 91 */
    /***/ (function(module, exports) {

    module.exports = "<svg viewbox=\"0 0 18 18\"> <path class=ql-fill d=M11.759,2.482a2.561,2.561,0,0,0-3.53.607A7.656,7.656,0,0,0,6.8,6.2C6.109,9.188,5.275,14.677,4.15,14.927a1.545,1.545,0,0,0-1.3-.933A0.922,0.922,0,0,0,2,15.036S1.954,16,4.119,16s3.091-2.691,3.7-5.553c0.177-.826.36-1.726,0.554-2.6L8.775,6.2c0.381-1.421.807-2.521,1.306-2.676a1.014,1.014,0,0,0,1.02.56A0.966,0.966,0,0,0,11.759,2.482Z></path> <rect class=ql-fill height=1.6 rx=0.8 ry=0.8 width=5 x=5.15 y=6.2></rect> <path class=ql-fill d=M13.663,12.027a1.662,1.662,0,0,1,.266-0.276q0.193,0.069.456,0.138a2.1,2.1,0,0,0,.535.069,1.075,1.075,0,0,0,.767-0.3,1.044,1.044,0,0,0,.314-0.8,0.84,0.84,0,0,0-.238-0.619,0.8,0.8,0,0,0-.594-0.239,1.154,1.154,0,0,0-.781.3,4.607,4.607,0,0,0-.781,1q-0.091.15-.218,0.346l-0.246.38c-0.068-.288-0.137-0.582-0.212-0.885-0.459-1.847-2.494-.984-2.941-0.8-0.482.2-.353,0.647-0.094,0.529a0.869,0.869,0,0,1,1.281.585c0.217,0.751.377,1.436,0.527,2.038a5.688,5.688,0,0,1-.362.467,2.69,2.69,0,0,1-.264.271q-0.221-.08-0.471-0.147a2.029,2.029,0,0,0-.522-0.066,1.079,1.079,0,0,0-.768.3A1.058,1.058,0,0,0,9,15.131a0.82,0.82,0,0,0,.832.852,1.134,1.134,0,0,0,.787-0.3,5.11,5.11,0,0,0,.776-0.993q0.141-.219.215-0.34c0.046-.076.122-0.194,0.223-0.346a2.786,2.786,0,0,0,.918,1.726,2.582,2.582,0,0,0,2.376-.185c0.317-.181.212-0.565,0-0.494A0.807,0.807,0,0,1,14.176,15a5.159,5.159,0,0,1-.913-2.446l0,0Q13.487,12.24,13.663,12.027Z></path> </svg>";

    /***/ }),
    /* 92 */
    /***/ (function(module, exports) {

    module.exports = "<svg viewBox=\"0 0 18 18\"> <path class=ql-fill d=M10,4V14a1,1,0,0,1-2,0V10H3v4a1,1,0,0,1-2,0V4A1,1,0,0,1,3,4V8H8V4a1,1,0,0,1,2,0Zm6.06787,9.209H14.98975V7.59863a.54085.54085,0,0,0-.605-.60547h-.62744a1.01119,1.01119,0,0,0-.748.29688L11.645,8.56641a.5435.5435,0,0,0-.022.8584l.28613.30762a.53861.53861,0,0,0,.84717.0332l.09912-.08789a1.2137,1.2137,0,0,0,.2417-.35254h.02246s-.01123.30859-.01123.60547V13.209H12.041a.54085.54085,0,0,0-.605.60547v.43945a.54085.54085,0,0,0,.605.60547h4.02686a.54085.54085,0,0,0,.605-.60547v-.43945A.54085.54085,0,0,0,16.06787,13.209Z /> </svg>";

    /***/ }),
    /* 93 */
    /***/ (function(module, exports) {

    module.exports = "<svg viewBox=\"0 0 18 18\"> <path class=ql-fill d=M16.73975,13.81445v.43945a.54085.54085,0,0,1-.605.60547H11.855a.58392.58392,0,0,1-.64893-.60547V14.0127c0-2.90527,3.39941-3.42187,3.39941-4.55469a.77675.77675,0,0,0-.84717-.78125,1.17684,1.17684,0,0,0-.83594.38477c-.2749.26367-.561.374-.85791.13184l-.4292-.34082c-.30811-.24219-.38525-.51758-.1543-.81445a2.97155,2.97155,0,0,1,2.45361-1.17676,2.45393,2.45393,0,0,1,2.68408,2.40918c0,2.45312-3.1792,2.92676-3.27832,3.93848h2.79443A.54085.54085,0,0,1,16.73975,13.81445ZM9,3A.99974.99974,0,0,0,8,4V8H3V4A1,1,0,0,0,1,4V14a1,1,0,0,0,2,0V10H8v4a1,1,0,0,0,2,0V4A.99974.99974,0,0,0,9,3Z /> </svg>";

    /***/ }),
    /* 94 */
    /***/ (function(module, exports) {

    module.exports = "<svg viewbox=\"0 0 18 18\"> <line class=ql-stroke x1=7 x2=13 y1=4 y2=4></line> <line class=ql-stroke x1=5 x2=11 y1=14 y2=14></line> <line class=ql-stroke x1=8 x2=10 y1=14 y2=4></line> </svg>";

    /***/ }),
    /* 95 */
    /***/ (function(module, exports) {

    module.exports = "<svg viewbox=\"0 0 18 18\"> <rect class=ql-stroke height=10 width=12 x=3 y=4></rect> <circle class=ql-fill cx=6 cy=7 r=1></circle> <polyline class=\"ql-even ql-fill\" points=\"5 12 5 11 7 9 8 10 11 7 13 9 13 12 5 12\"></polyline> </svg>";

    /***/ }),
    /* 96 */
    /***/ (function(module, exports) {

    module.exports = "<svg viewbox=\"0 0 18 18\"> <line class=ql-stroke x1=3 x2=15 y1=14 y2=14></line> <line class=ql-stroke x1=3 x2=15 y1=4 y2=4></line> <line class=ql-stroke x1=9 x2=15 y1=9 y2=9></line> <polyline class=\"ql-fill ql-stroke\" points=\"3 7 3 11 5 9 3 7\"></polyline> </svg>";

    /***/ }),
    /* 97 */
    /***/ (function(module, exports) {

    module.exports = "<svg viewbox=\"0 0 18 18\"> <line class=ql-stroke x1=3 x2=15 y1=14 y2=14></line> <line class=ql-stroke x1=3 x2=15 y1=4 y2=4></line> <line class=ql-stroke x1=9 x2=15 y1=9 y2=9></line> <polyline class=ql-stroke points=\"5 7 5 11 3 9 5 7\"></polyline> </svg>";

    /***/ }),
    /* 98 */
    /***/ (function(module, exports) {

    module.exports = "<svg viewbox=\"0 0 18 18\"> <line class=ql-stroke x1=7 x2=11 y1=7 y2=11></line> <path class=\"ql-even ql-stroke\" d=M8.9,4.577a3.476,3.476,0,0,1,.36,4.679A3.476,3.476,0,0,1,4.577,8.9C3.185,7.5,2.035,6.4,4.217,4.217S7.5,3.185,8.9,4.577Z></path> <path class=\"ql-even ql-stroke\" d=M13.423,9.1a3.476,3.476,0,0,0-4.679-.36,3.476,3.476,0,0,0,.36,4.679c1.392,1.392,2.5,2.542,4.679.36S14.815,10.5,13.423,9.1Z></path> </svg>";

    /***/ }),
    /* 99 */
    /***/ (function(module, exports) {

    module.exports = "<svg viewbox=\"0 0 18 18\"> <line class=ql-stroke x1=7 x2=15 y1=4 y2=4></line> <line class=ql-stroke x1=7 x2=15 y1=9 y2=9></line> <line class=ql-stroke x1=7 x2=15 y1=14 y2=14></line> <line class=\"ql-stroke ql-thin\" x1=2.5 x2=4.5 y1=5.5 y2=5.5></line> <path class=ql-fill d=M3.5,6A0.5,0.5,0,0,1,3,5.5V3.085l-0.276.138A0.5,0.5,0,0,1,2.053,3c-0.124-.247-0.023-0.324.224-0.447l1-.5A0.5,0.5,0,0,1,4,2.5v3A0.5,0.5,0,0,1,3.5,6Z></path> <path class=\"ql-stroke ql-thin\" d=M4.5,10.5h-2c0-.234,1.85-1.076,1.85-2.234A0.959,0.959,0,0,0,2.5,8.156></path> <path class=\"ql-stroke ql-thin\" d=M2.5,14.846a0.959,0.959,0,0,0,1.85-.109A0.7,0.7,0,0,0,3.75,14a0.688,0.688,0,0,0,.6-0.736,0.959,0.959,0,0,0-1.85-.109></path> </svg>";

    /***/ }),
    /* 100 */
    /***/ (function(module, exports) {

    module.exports = "<svg viewbox=\"0 0 18 18\"> <line class=ql-stroke x1=6 x2=15 y1=4 y2=4></line> <line class=ql-stroke x1=6 x2=15 y1=9 y2=9></line> <line class=ql-stroke x1=6 x2=15 y1=14 y2=14></line> <line class=ql-stroke x1=3 x2=3 y1=4 y2=4></line> <line class=ql-stroke x1=3 x2=3 y1=9 y2=9></line> <line class=ql-stroke x1=3 x2=3 y1=14 y2=14></line> </svg>";

    /***/ }),
    /* 101 */
    /***/ (function(module, exports) {

    module.exports = "<svg class=\"\" viewbox=\"0 0 18 18\"> <line class=ql-stroke x1=9 x2=15 y1=4 y2=4></line> <polyline class=ql-stroke points=\"3 4 4 5 6 3\"></polyline> <line class=ql-stroke x1=9 x2=15 y1=14 y2=14></line> <polyline class=ql-stroke points=\"3 14 4 15 6 13\"></polyline> <line class=ql-stroke x1=9 x2=15 y1=9 y2=9></line> <polyline class=ql-stroke points=\"3 9 4 10 6 8\"></polyline> </svg>";

    /***/ }),
    /* 102 */
    /***/ (function(module, exports) {

    module.exports = "<svg viewbox=\"0 0 18 18\"> <path class=ql-fill d=M15.5,15H13.861a3.858,3.858,0,0,0,1.914-2.975,1.8,1.8,0,0,0-1.6-1.751A1.921,1.921,0,0,0,12.021,11.7a0.50013,0.50013,0,1,0,.957.291h0a0.914,0.914,0,0,1,1.053-.725,0.81,0.81,0,0,1,.744.762c0,1.076-1.16971,1.86982-1.93971,2.43082A1.45639,1.45639,0,0,0,12,15.5a0.5,0.5,0,0,0,.5.5h3A0.5,0.5,0,0,0,15.5,15Z /> <path class=ql-fill d=M9.65,5.241a1,1,0,0,0-1.409.108L6,7.964,3.759,5.349A1,1,0,0,0,2.192,6.59178Q2.21541,6.6213,2.241,6.649L4.684,9.5,2.241,12.35A1,1,0,0,0,3.71,13.70722q0.02557-.02768.049-0.05722L6,11.036,8.241,13.65a1,1,0,1,0,1.567-1.24277Q9.78459,12.3777,9.759,12.35L7.316,9.5,9.759,6.651A1,1,0,0,0,9.65,5.241Z /> </svg>";

    /***/ }),
    /* 103 */
    /***/ (function(module, exports) {

    module.exports = "<svg viewbox=\"0 0 18 18\"> <path class=ql-fill d=M15.5,7H13.861a4.015,4.015,0,0,0,1.914-2.975,1.8,1.8,0,0,0-1.6-1.751A1.922,1.922,0,0,0,12.021,3.7a0.5,0.5,0,1,0,.957.291,0.917,0.917,0,0,1,1.053-.725,0.81,0.81,0,0,1,.744.762c0,1.077-1.164,1.925-1.934,2.486A1.423,1.423,0,0,0,12,7.5a0.5,0.5,0,0,0,.5.5h3A0.5,0.5,0,0,0,15.5,7Z /> <path class=ql-fill d=M9.651,5.241a1,1,0,0,0-1.41.108L6,7.964,3.759,5.349a1,1,0,1,0-1.519,1.3L4.683,9.5,2.241,12.35a1,1,0,1,0,1.519,1.3L6,11.036,8.241,13.65a1,1,0,0,0,1.519-1.3L7.317,9.5,9.759,6.651A1,1,0,0,0,9.651,5.241Z /> </svg>";

    /***/ }),
    /* 104 */
    /***/ (function(module, exports) {

    module.exports = "<svg viewbox=\"0 0 18 18\"> <line class=\"ql-stroke ql-thin\" x1=15.5 x2=2.5 y1=8.5 y2=9.5></line> <path class=ql-fill d=M9.007,8C6.542,7.791,6,7.519,6,6.5,6,5.792,7.283,5,9,5c1.571,0,2.765.679,2.969,1.309a1,1,0,0,0,1.9-.617C13.356,4.106,11.354,3,9,3,6.2,3,4,4.538,4,6.5a3.2,3.2,0,0,0,.5,1.843Z></path> <path class=ql-fill d=M8.984,10C11.457,10.208,12,10.479,12,11.5c0,0.708-1.283,1.5-3,1.5-1.571,0-2.765-.679-2.969-1.309a1,1,0,1,0-1.9.617C4.644,13.894,6.646,15,9,15c2.8,0,5-1.538,5-3.5a3.2,3.2,0,0,0-.5-1.843Z></path> </svg>";

    /***/ }),
    /* 105 */
    /***/ (function(module, exports) {

    module.exports = "<svg viewbox=\"0 0 18 18\"> <path class=ql-stroke d=M5,3V9a4.012,4.012,0,0,0,4,4H9a4.012,4.012,0,0,0,4-4V3></path> <rect class=ql-fill height=1 rx=0.5 ry=0.5 width=12 x=3 y=15></rect> </svg>";

    /***/ }),
    /* 106 */
    /***/ (function(module, exports) {

    module.exports = "<svg viewbox=\"0 0 18 18\"> <rect class=ql-stroke height=12 width=12 x=3 y=3></rect> <rect class=ql-fill height=12 width=1 x=5 y=3></rect> <rect class=ql-fill height=12 width=1 x=12 y=3></rect> <rect class=ql-fill height=2 width=8 x=5 y=8></rect> <rect class=ql-fill height=1 width=3 x=3 y=5></rect> <rect class=ql-fill height=1 width=3 x=3 y=7></rect> <rect class=ql-fill height=1 width=3 x=3 y=10></rect> <rect class=ql-fill height=1 width=3 x=3 y=12></rect> <rect class=ql-fill height=1 width=3 x=12 y=5></rect> <rect class=ql-fill height=1 width=3 x=12 y=7></rect> <rect class=ql-fill height=1 width=3 x=12 y=10></rect> <rect class=ql-fill height=1 width=3 x=12 y=12></rect> </svg>";

    /***/ }),
    /* 107 */
    /***/ (function(module, exports) {

    module.exports = "<svg viewbox=\"0 0 18 18\"> <polygon class=ql-stroke points=\"7 11 9 13 11 11 7 11\"></polygon> <polygon class=ql-stroke points=\"7 7 9 5 11 7 7 7\"></polygon> </svg>";

    /***/ }),
    /* 108 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = exports.BubbleTooltip = undefined;

    var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    var _extend = __webpack_require__(3);

    var _extend2 = _interopRequireDefault(_extend);

    var _emitter = __webpack_require__(8);

    var _emitter2 = _interopRequireDefault(_emitter);

    var _base = __webpack_require__(43);

    var _base2 = _interopRequireDefault(_base);

    var _selection = __webpack_require__(15);

    var _icons = __webpack_require__(41);

    var _icons2 = _interopRequireDefault(_icons);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var TOOLBAR_CONFIG = [['bold', 'italic', 'link'], [{ header: 1 }, { header: 2 }, 'blockquote']];

    var BubbleTheme = function (_BaseTheme) {
      _inherits(BubbleTheme, _BaseTheme);

      function BubbleTheme(quill, options) {
        _classCallCheck(this, BubbleTheme);

        if (options.modules.toolbar != null && options.modules.toolbar.container == null) {
          options.modules.toolbar.container = TOOLBAR_CONFIG;
        }

        var _this = _possibleConstructorReturn(this, (BubbleTheme.__proto__ || Object.getPrototypeOf(BubbleTheme)).call(this, quill, options));

        _this.quill.container.classList.add('ql-bubble');
        return _this;
      }

      _createClass(BubbleTheme, [{
        key: 'extendToolbar',
        value: function extendToolbar(toolbar) {
          this.tooltip = new BubbleTooltip(this.quill, this.options.bounds);
          this.tooltip.root.appendChild(toolbar.container);
          this.buildButtons([].slice.call(toolbar.container.querySelectorAll('button')), _icons2.default);
          this.buildPickers([].slice.call(toolbar.container.querySelectorAll('select')), _icons2.default);
        }
      }]);

      return BubbleTheme;
    }(_base2.default);

    BubbleTheme.DEFAULTS = (0, _extend2.default)(true, {}, _base2.default.DEFAULTS, {
      modules: {
        toolbar: {
          handlers: {
            link: function link(value) {
              if (!value) {
                this.quill.format('link', false);
              } else {
                this.quill.theme.tooltip.edit();
              }
            }
          }
        }
      }
    });

    var BubbleTooltip = function (_BaseTooltip) {
      _inherits(BubbleTooltip, _BaseTooltip);

      function BubbleTooltip(quill, bounds) {
        _classCallCheck(this, BubbleTooltip);

        var _this2 = _possibleConstructorReturn(this, (BubbleTooltip.__proto__ || Object.getPrototypeOf(BubbleTooltip)).call(this, quill, bounds));

        _this2.quill.on(_emitter2.default.events.EDITOR_CHANGE, function (type, range, oldRange, source) {
          if (type !== _emitter2.default.events.SELECTION_CHANGE) return;
          if (range != null && range.length > 0 && source === _emitter2.default.sources.USER) {
            _this2.show();
            // Lock our width so we will expand beyond our offsetParent boundaries
            _this2.root.style.left = '0px';
            _this2.root.style.width = '';
            _this2.root.style.width = _this2.root.offsetWidth + 'px';
            var lines = _this2.quill.getLines(range.index, range.length);
            if (lines.length === 1) {
              _this2.position(_this2.quill.getBounds(range));
            } else {
              var lastLine = lines[lines.length - 1];
              var index = _this2.quill.getIndex(lastLine);
              var length = Math.min(lastLine.length() - 1, range.index + range.length - index);
              var _bounds = _this2.quill.getBounds(new _selection.Range(index, length));
              _this2.position(_bounds);
            }
          } else if (document.activeElement !== _this2.textbox && _this2.quill.hasFocus()) {
            _this2.hide();
          }
        });
        return _this2;
      }

      _createClass(BubbleTooltip, [{
        key: 'listen',
        value: function listen() {
          var _this3 = this;

          _get(BubbleTooltip.prototype.__proto__ || Object.getPrototypeOf(BubbleTooltip.prototype), 'listen', this).call(this);
          this.root.querySelector('.ql-close').addEventListener('click', function () {
            _this3.root.classList.remove('ql-editing');
          });
          this.quill.on(_emitter2.default.events.SCROLL_OPTIMIZE, function () {
            // Let selection be restored by toolbar handlers before repositioning
            setTimeout(function () {
              if (_this3.root.classList.contains('ql-hidden')) return;
              var range = _this3.quill.getSelection();
              if (range != null) {
                _this3.position(_this3.quill.getBounds(range));
              }
            }, 1);
          });
        }
      }, {
        key: 'cancel',
        value: function cancel() {
          this.show();
        }
      }, {
        key: 'position',
        value: function position(reference) {
          var shift = _get(BubbleTooltip.prototype.__proto__ || Object.getPrototypeOf(BubbleTooltip.prototype), 'position', this).call(this, reference);
          var arrow = this.root.querySelector('.ql-tooltip-arrow');
          arrow.style.marginLeft = '';
          if (shift === 0) return shift;
          arrow.style.marginLeft = -1 * shift - arrow.offsetWidth / 2 + 'px';
        }
      }]);

      return BubbleTooltip;
    }(_base.BaseTooltip);

    BubbleTooltip.TEMPLATE = ['<span class="ql-tooltip-arrow"></span>', '<div class="ql-tooltip-editor">', '<input type="text" data-formula="e=mc^2" data-link="https://quilljs.com" data-video="Embed URL">', '<a class="ql-close"></a>', '</div>'].join('');

    exports.BubbleTooltip = BubbleTooltip;
    exports.default = BubbleTheme;

    /***/ }),
    /* 109 */
    /***/ (function(module, exports, __webpack_require__) {

    module.exports = __webpack_require__(63);


    /***/ })
    /******/ ])["default"];
    });
    });

    var Quill = /*@__PURE__*/getDefaultExportFromCjs(quill);

    var imageResize_min = createCommonjsModule(function (module, exports) {
    !function(t,e){module.exports=e();}(commonjsGlobal,function(){return function(t){function e(r){if(n[r])return n[r].exports;var o=n[r]={i:r,l:!1,exports:{}};return t[r].call(o.exports,o,o.exports,e),o.l=!0,o.exports}var n={};return e.m=t,e.c=n,e.i=function(t){return t},e.d=function(t,n,r){e.o(t,n)||Object.defineProperty(t,n,{configurable:!1,enumerable:!0,get:r});},e.n=function(t){var n=t&&t.__esModule?function(){return t.default}:function(){return t};return e.d(n,"a",n),n},e.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},e.p="",e(e.s=41)}([function(t,e){function n(t){var e=typeof t;return null!=t&&("object"==e||"function"==e)}t.exports=n;},function(t,e,n){var r=n(23),o="object"==typeof self&&self&&self.Object===Object&&self,i=r||o||Function("return this")();t.exports=i;},function(t,e){function n(t){return null!=t&&"object"==typeof t}t.exports=n;},function(t,e,n){function r(t){var e=-1,n=null==t?0:t.length;for(this.clear();++e<n;){var r=t[e];this.set(r[0],r[1]);}}var o=n(82),i=n(83),l=n(84),a=n(85),s=n(86);r.prototype.clear=o,r.prototype.delete=i,r.prototype.get=l,r.prototype.has=a,r.prototype.set=s,t.exports=r;},function(t,e,n){function r(t,e){for(var n=t.length;n--;)if(o(t[n][0],e))return n;return -1}var o=n(8);t.exports=r;},function(t,e,n){function r(t){return null==t?void 0===t?s:a:u&&u in Object(t)?i(t):l(t)}var o=n(17),i=n(71),l=n(94),a="[object Null]",s="[object Undefined]",u=o?o.toStringTag:void 0;t.exports=r;},function(t,e,n){function r(t,e){var n=t.__data__;return o(e)?n["string"==typeof e?"string":"hash"]:n.map}var o=n(80);t.exports=r;},function(t,e,n){var r=n(11),o=r(Object,"create");t.exports=o;},function(t,e){function n(t,e){return t===e||t!==t&&e!==e}t.exports=n;},function(t,e,n){function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}n.d(e,"a",function(){return o});var o=function t(e){r(this,t),this.onCreate=function(){},this.onDestroy=function(){},this.onUpdate=function(){},this.overlay=e.overlay,this.img=e.img,this.options=e.options,this.requestUpdate=e.onUpdate;};},function(t,e,n){function r(t,e,n){"__proto__"==e&&o?o(t,e,{configurable:!0,enumerable:!0,value:n,writable:!0}):t[e]=n;}var o=n(22);t.exports=r;},function(t,e,n){function r(t,e){var n=i(t,e);return o(n)?n:void 0}var o=n(55),i=n(72);t.exports=r;},function(t,e,n){function r(t){return null!=t&&i(t.length)&&!o(t)}var o=n(13),i=n(32);t.exports=r;},function(t,e,n){function r(t){if(!i(t))return !1;var e=o(t);return e==a||e==s||e==l||e==u}var o=n(5),i=n(0),l="[object AsyncFunction]",a="[object Function]",s="[object GeneratorFunction]",u="[object Proxy]";t.exports=r;},function(t,e){t.exports=function(t){return t.webpackPolyfill||(t.deprecate=function(){},t.paths=[],t.children||(t.children=[]),Object.defineProperty(t,"loaded",{enumerable:!0,get:function(){return t.l}}),Object.defineProperty(t,"id",{enumerable:!0,get:function(){return t.i}}),t.webpackPolyfill=1),t};},function(t,e,n){(function(e){/*!
     * Quill Editor v1.3.6
     * https://quilljs.com/
     * Copyright (c) 2014, Jason Chen
     * Copyright (c) 2013, salesforce.com
     */
    !function(e,n){t.exports=n();}("undefined"!=typeof self&&self,function(){return function(t){function e(r){if(n[r])return n[r].exports;var o=n[r]={i:r,l:!1,exports:{}};return t[r].call(o.exports,o,o.exports,e),o.l=!0,o.exports}var n={};return e.m=t,e.c=n,e.d=function(t,n,r){e.o(t,n)||Object.defineProperty(t,n,{configurable:!1,enumerable:!0,get:r});},e.n=function(t){var n=t&&t.__esModule?function(){return t.default}:function(){return t};return e.d(n,"a",n),n},e.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},e.p="",e(e.s=109)}([function(t,e,n){Object.defineProperty(e,"__esModule",{value:!0});var r=n(17),o=n(18),i=n(19),l=n(45),a=n(46),s=n(47),u=n(48),c=n(49),f=n(12),h=n(32),p=n(33),d=n(31),y=n(1),v={Scope:y.Scope,create:y.create,find:y.find,query:y.query,register:y.register,Container:r.default,Format:o.default,Leaf:i.default,Embed:u.default,Scroll:l.default,Block:s.default,Inline:a.default,Text:c.default,Attributor:{Attribute:f.default,Class:h.default,Style:p.default,Store:d.default}};e.default=v;},function(t,e,n){function r(t,e){var n=i(t);if(null==n)throw new s("Unable to create "+t+" blot");var r=n;return new r(t instanceof Node||t.nodeType===Node.TEXT_NODE?t:r.create(e),e)}function o(t,n){return void 0===n&&(n=!1),null==t?null:null!=t[e.DATA_KEY]?t[e.DATA_KEY].blot:n?o(t.parentNode,n):null}function i(t,e){void 0===e&&(e=p.ANY);var n;if("string"==typeof t)n=h[t]||u[t];else if(t instanceof Text||t.nodeType===Node.TEXT_NODE)n=h.text;else if("number"==typeof t)t&p.LEVEL&p.BLOCK?n=h.block:t&p.LEVEL&p.INLINE&&(n=h.inline);else if(t instanceof HTMLElement){var r=(t.getAttribute("class")||"").split(/\s+/);for(var o in r)if(n=c[r[o]])break;n=n||f[t.tagName];}return null==n?null:e&p.LEVEL&n.scope&&e&p.TYPE&n.scope?n:null}function l(){for(var t=[],e=0;e<arguments.length;e++)t[e]=arguments[e];if(t.length>1)return t.map(function(t){return l(t)});var n=t[0];if("string"!=typeof n.blotName&&"string"!=typeof n.attrName)throw new s("Invalid definition");if("abstract"===n.blotName)throw new s("Cannot register abstract class");if(h[n.blotName||n.attrName]=n,"string"==typeof n.keyName)u[n.keyName]=n;else if(null!=n.className&&(c[n.className]=n),null!=n.tagName){Array.isArray(n.tagName)?n.tagName=n.tagName.map(function(t){return t.toUpperCase()}):n.tagName=n.tagName.toUpperCase();var r=Array.isArray(n.tagName)?n.tagName:[n.tagName];r.forEach(function(t){null!=f[t]&&null!=n.className||(f[t]=n);});}return n}var a=this&&this.__extends||function(){var t=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e;}||function(t,e){for(var n in e)e.hasOwnProperty(n)&&(t[n]=e[n]);};return function(e,n){function r(){this.constructor=e;}t(e,n),e.prototype=null===n?Object.create(n):(r.prototype=n.prototype,new r);}}();Object.defineProperty(e,"__esModule",{value:!0});var s=function(t){function e(e){var n=this;return e="[Parchment] "+e,n=t.call(this,e)||this,n.message=e,n.name=n.constructor.name,n}return a(e,t),e}(Error);e.ParchmentError=s;var u={},c={},f={},h={};e.DATA_KEY="__blot";var p;!function(t){t[t.TYPE=3]="TYPE",t[t.LEVEL=12]="LEVEL",t[t.ATTRIBUTE=13]="ATTRIBUTE",t[t.BLOT=14]="BLOT",t[t.INLINE=7]="INLINE",t[t.BLOCK=11]="BLOCK",t[t.BLOCK_BLOT=10]="BLOCK_BLOT",t[t.INLINE_BLOT=6]="INLINE_BLOT",t[t.BLOCK_ATTRIBUTE=9]="BLOCK_ATTRIBUTE",t[t.INLINE_ATTRIBUTE=5]="INLINE_ATTRIBUTE",t[t.ANY=15]="ANY";}(p=e.Scope||(e.Scope={})),e.create=r,e.find=o,e.query=i,e.register=l;},function(t,e,n){var r=n(51),o=n(11),i=n(3),l=n(20),a=String.fromCharCode(0),s=function(t){Array.isArray(t)?this.ops=t:null!=t&&Array.isArray(t.ops)?this.ops=t.ops:this.ops=[];};s.prototype.insert=function(t,e){var n={};return 0===t.length?this:(n.insert=t,null!=e&&"object"==typeof e&&Object.keys(e).length>0&&(n.attributes=e),this.push(n))},s.prototype.delete=function(t){return t<=0?this:this.push({delete:t})},s.prototype.retain=function(t,e){if(t<=0)return this;var n={retain:t};return null!=e&&"object"==typeof e&&Object.keys(e).length>0&&(n.attributes=e),this.push(n)},s.prototype.push=function(t){var e=this.ops.length,n=this.ops[e-1];if(t=i(!0,{},t),"object"==typeof n){if("number"==typeof t.delete&&"number"==typeof n.delete)return this.ops[e-1]={delete:n.delete+t.delete},this;if("number"==typeof n.delete&&null!=t.insert&&(e-=1,"object"!=typeof(n=this.ops[e-1])))return this.ops.unshift(t),this;if(o(t.attributes,n.attributes)){if("string"==typeof t.insert&&"string"==typeof n.insert)return this.ops[e-1]={insert:n.insert+t.insert},"object"==typeof t.attributes&&(this.ops[e-1].attributes=t.attributes),this;if("number"==typeof t.retain&&"number"==typeof n.retain)return this.ops[e-1]={retain:n.retain+t.retain},"object"==typeof t.attributes&&(this.ops[e-1].attributes=t.attributes),this}}return e===this.ops.length?this.ops.push(t):this.ops.splice(e,0,t),this},s.prototype.chop=function(){var t=this.ops[this.ops.length-1];return t&&t.retain&&!t.attributes&&this.ops.pop(),this},s.prototype.filter=function(t){return this.ops.filter(t)},s.prototype.forEach=function(t){this.ops.forEach(t);},s.prototype.map=function(t){return this.ops.map(t)},s.prototype.partition=function(t){var e=[],n=[];return this.forEach(function(r){(t(r)?e:n).push(r);}),[e,n]},s.prototype.reduce=function(t,e){return this.ops.reduce(t,e)},s.prototype.changeLength=function(){return this.reduce(function(t,e){return e.insert?t+l.length(e):e.delete?t-e.delete:t},0)},s.prototype.length=function(){return this.reduce(function(t,e){return t+l.length(e)},0)},s.prototype.slice=function(t,e){t=t||0,"number"!=typeof e&&(e=1/0);for(var n=[],r=l.iterator(this.ops),o=0;o<e&&r.hasNext();){var i;o<t?i=r.next(t-o):(i=r.next(e-o),n.push(i)),o+=l.length(i);}return new s(n)},s.prototype.compose=function(t){for(var e=l.iterator(this.ops),n=l.iterator(t.ops),r=new s;e.hasNext()||n.hasNext();)if("insert"===n.peekType())r.push(n.next());else if("delete"===e.peekType())r.push(e.next());else {var o=Math.min(e.peekLength(),n.peekLength()),i=e.next(o),a=n.next(o);if("number"==typeof a.retain){var u={};"number"==typeof i.retain?u.retain=o:u.insert=i.insert;var c=l.attributes.compose(i.attributes,a.attributes,"number"==typeof i.retain);c&&(u.attributes=c),r.push(u);}else "number"==typeof a.delete&&"number"==typeof i.retain&&r.push(a);}return r.chop()},s.prototype.concat=function(t){var e=new s(this.ops.slice());return t.ops.length>0&&(e.push(t.ops[0]),e.ops=e.ops.concat(t.ops.slice(1))),e},s.prototype.diff=function(t,e){if(this.ops===t.ops)return new s;var n=[this,t].map(function(e){return e.map(function(n){if(null!=n.insert)return "string"==typeof n.insert?n.insert:a;var r=e===t?"on":"with";throw new Error("diff() called "+r+" non-document")}).join("")}),i=new s,u=r(n[0],n[1],e),c=l.iterator(this.ops),f=l.iterator(t.ops);return u.forEach(function(t){for(var e=t[1].length;e>0;){var n=0;switch(t[0]){case r.INSERT:n=Math.min(f.peekLength(),e),i.push(f.next(n));break;case r.DELETE:n=Math.min(e,c.peekLength()),c.next(n),i.delete(n);break;case r.EQUAL:n=Math.min(c.peekLength(),f.peekLength(),e);var a=c.next(n),s=f.next(n);o(a.insert,s.insert)?i.retain(n,l.attributes.diff(a.attributes,s.attributes)):i.push(s).delete(n);}e-=n;}}),i.chop()},s.prototype.eachLine=function(t,e){e=e||"\n";for(var n=l.iterator(this.ops),r=new s,o=0;n.hasNext();){if("insert"!==n.peekType())return;var i=n.peek(),a=l.length(i)-n.peekLength(),u="string"==typeof i.insert?i.insert.indexOf(e,a)-a:-1;if(u<0)r.push(n.next());else if(u>0)r.push(n.next(u));else {if(!1===t(r,n.next(1).attributes||{},o))return;o+=1,r=new s;}}r.length()>0&&t(r,{},o);},s.prototype.transform=function(t,e){if(e=!!e,"number"==typeof t)return this.transformPosition(t,e);for(var n=l.iterator(this.ops),r=l.iterator(t.ops),o=new s;n.hasNext()||r.hasNext();)if("insert"!==n.peekType()||!e&&"insert"===r.peekType())if("insert"===r.peekType())o.push(r.next());else {var i=Math.min(n.peekLength(),r.peekLength()),a=n.next(i),u=r.next(i);if(a.delete)continue;u.delete?o.push(u):o.retain(i,l.attributes.transform(a.attributes,u.attributes,e));}else o.retain(l.length(n.next()));return o.chop()},s.prototype.transformPosition=function(t,e){e=!!e;for(var n=l.iterator(this.ops),r=0;n.hasNext()&&r<=t;){var o=n.peekLength(),i=n.peekType();n.next(),"delete"!==i?("insert"===i&&(r<t||!e)&&(t+=o),r+=o):t-=Math.min(o,t-r);}return t},t.exports=s;},function(t,e){var n=Object.prototype.hasOwnProperty,r=Object.prototype.toString,o=function(t){return "function"==typeof Array.isArray?Array.isArray(t):"[object Array]"===r.call(t)},i=function(t){if(!t||"[object Object]"!==r.call(t))return !1;var e=n.call(t,"constructor"),o=t.constructor&&t.constructor.prototype&&n.call(t.constructor.prototype,"isPrototypeOf");if(t.constructor&&!e&&!o)return !1;var i;for(i in t);return void 0===i||n.call(t,i)};t.exports=function t(){var e,n,r,l,a,s,u=arguments[0],c=1,f=arguments.length,h=!1;for("boolean"==typeof u&&(h=u,u=arguments[1]||{},c=2),(null==u||"object"!=typeof u&&"function"!=typeof u)&&(u={});c<f;++c)if(null!=(e=arguments[c]))for(n in e)r=u[n],l=e[n],u!==l&&(h&&l&&(i(l)||(a=o(l)))?(a?(a=!1,s=r&&o(r)?r:[]):s=r&&i(r)?r:{},u[n]=t(h,s,l)):void 0!==l&&(u[n]=l));return u};},function(t,e,n){function r(t){return t&&t.__esModule?t:{default:t}}function o(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function i(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return !e||"object"!=typeof e&&"function"!=typeof e?t:e}function l(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e);}function a(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};return null==t?e:("function"==typeof t.formats&&(e=(0, f.default)(e,t.formats())),null==t.parent||"scroll"==t.parent.blotName||t.parent.statics.scope!==t.statics.scope?e:a(t.parent,e))}Object.defineProperty(e,"__esModule",{value:!0}),e.default=e.BlockEmbed=e.bubbleFormats=void 0;var s=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r);}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),u=function t(e,n,r){null===e&&(e=Function.prototype);var o=Object.getOwnPropertyDescriptor(e,n);if(void 0===o){var i=Object.getPrototypeOf(e);return null===i?void 0:t(i,n,r)}if("value"in o)return o.value;var l=o.get;if(void 0!==l)return l.call(r)},c=n(3),f=r(c),h=n(2),p=r(h),d=n(0),y=r(d),v=n(16),b=r(v),g=n(6),m=r(g),_=n(7),O=r(_),w=function(t){function e(){return o(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return l(e,t),s(e,[{key:"attach",value:function(){u(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"attach",this).call(this),this.attributes=new y.default.Attributor.Store(this.domNode);}},{key:"delta",value:function(){return (new p.default).insert(this.value(),(0, f.default)(this.formats(),this.attributes.values()))}},{key:"format",value:function(t,e){var n=y.default.query(t,y.default.Scope.BLOCK_ATTRIBUTE);null!=n&&this.attributes.attribute(n,e);}},{key:"formatAt",value:function(t,e,n,r){this.format(n,r);}},{key:"insertAt",value:function(t,n,r){if("string"==typeof n&&n.endsWith("\n")){var o=y.default.create(x.blotName);this.parent.insertBefore(o,0===t?this:this.next),o.insertAt(0,n.slice(0,-1));}else u(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"insertAt",this).call(this,t,n,r);}}]),e}(y.default.Embed);w.scope=y.default.Scope.BLOCK_BLOT;var x=function(t){function e(t){o(this,e);var n=i(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t));return n.cache={},n}return l(e,t),s(e,[{key:"delta",value:function(){return null==this.cache.delta&&(this.cache.delta=this.descendants(y.default.Leaf).reduce(function(t,e){return 0===e.length()?t:t.insert(e.value(),a(e))},new p.default).insert("\n",a(this))),this.cache.delta}},{key:"deleteAt",value:function(t,n){u(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"deleteAt",this).call(this,t,n),this.cache={};}},{key:"formatAt",value:function(t,n,r,o){n<=0||(y.default.query(r,y.default.Scope.BLOCK)?t+n===this.length()&&this.format(r,o):u(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"formatAt",this).call(this,t,Math.min(n,this.length()-t-1),r,o),this.cache={});}},{key:"insertAt",value:function(t,n,r){if(null!=r)return u(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"insertAt",this).call(this,t,n,r);if(0!==n.length){var o=n.split("\n"),i=o.shift();i.length>0&&(t<this.length()-1||null==this.children.tail?u(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"insertAt",this).call(this,Math.min(t,this.length()-1),i):this.children.tail.insertAt(this.children.tail.length(),i),this.cache={});var l=this;o.reduce(function(t,e){return l=l.split(t,!0),l.insertAt(0,e),e.length},t+i.length);}}},{key:"insertBefore",value:function(t,n){var r=this.children.head;u(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"insertBefore",this).call(this,t,n),r instanceof b.default&&r.remove(),this.cache={};}},{key:"length",value:function(){return null==this.cache.length&&(this.cache.length=u(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"length",this).call(this)+1),this.cache.length}},{key:"moveChildren",value:function(t,n){u(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"moveChildren",this).call(this,t,n),this.cache={};}},{key:"optimize",value:function(t){u(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"optimize",this).call(this,t),this.cache={};}},{key:"path",value:function(t){return u(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"path",this).call(this,t,!0)}},{key:"removeChild",value:function(t){u(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"removeChild",this).call(this,t),this.cache={};}},{key:"split",value:function(t){var n=arguments.length>1&&void 0!==arguments[1]&&arguments[1];if(n&&(0===t||t>=this.length()-1)){var r=this.clone();return 0===t?(this.parent.insertBefore(r,this),this):(this.parent.insertBefore(r,this.next),r)}var o=u(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"split",this).call(this,t,n);return this.cache={},o}}]),e}(y.default.Block);x.blotName="block",x.tagName="P",x.defaultChild="break",x.allowedChildren=[m.default,y.default.Embed,O.default],e.bubbleFormats=a,e.BlockEmbed=w,e.default=x;},function(t,e,n){function r(t){return t&&t.__esModule?t:{default:t}}function o(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}function i(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function l(t,e){if(e=(0, A.default)(!0,{container:t,modules:{clipboard:!0,keyboard:!0,history:!0}},e),e.theme&&e.theme!==q.DEFAULTS.theme){if(e.theme=q.import("themes/"+e.theme),null==e.theme)throw new Error("Invalid theme "+e.theme+". Did you register it?")}else e.theme=S.default;var n=(0, A.default)(!0,{},e.theme.DEFAULTS);[n,e].forEach(function(t){t.modules=t.modules||{},Object.keys(t.modules).forEach(function(e){!0===t.modules[e]&&(t.modules[e]={});});});var r=Object.keys(n.modules).concat(Object.keys(e.modules)),o=r.reduce(function(t,e){var n=q.import("modules/"+e);return null==n?P.error("Cannot load "+e+" module. Are you sure you registered it?"):t[e]=n.DEFAULTS||{},t},{});return null!=e.modules&&e.modules.toolbar&&e.modules.toolbar.constructor!==Object&&(e.modules.toolbar={container:e.modules.toolbar}),e=(0, A.default)(!0,{},q.DEFAULTS,{modules:o},n,e),["bounds","container","scrollingContainer"].forEach(function(t){"string"==typeof e[t]&&(e[t]=document.querySelector(e[t]));}),e.modules=Object.keys(e.modules).reduce(function(t,n){return e.modules[n]&&(t[n]=e.modules[n]),t},{}),e}function a(t,e,n,r){if(this.options.strict&&!this.isEnabled()&&e===g.default.sources.USER)return new d.default;var o=null==n?null:this.getSelection(),i=this.editor.delta,l=t();if(null!=o&&(!0===n&&(n=o.index),null==r?o=u(o,l,e):0!==r&&(o=u(o,n,r,e)),this.setSelection(o,g.default.sources.SILENT)),l.length()>0){var a,s=[g.default.events.TEXT_CHANGE,l,i,e];if((a=this.emitter).emit.apply(a,[g.default.events.EDITOR_CHANGE].concat(s)),e!==g.default.sources.SILENT){var c;(c=this.emitter).emit.apply(c,s);}}return l}function s(t,e,n,r,o){var i={};return "number"==typeof t.index&&"number"==typeof t.length?"number"!=typeof e?(o=r,r=n,n=e,e=t.length,t=t.index):(e=t.length,t=t.index):"number"!=typeof e&&(o=r,r=n,n=e,e=0),"object"===(void 0===n?"undefined":c(n))?(i=n,o=r):"string"==typeof n&&(null!=r?i[n]=r:o=n),o=o||g.default.sources.API,[t,e,i,o]}function u(t,e,n,r){if(null==t)return null;var o=void 0,i=void 0;if(e instanceof d.default){var l=[t.index,t.index+t.length].map(function(t){return e.transformPosition(t,r!==g.default.sources.USER)}),a=f(l,2);o=a[0],i=a[1];}else {var s=[t.index,t.index+t.length].map(function(t){return t<e||t===e&&r===g.default.sources.USER?t:n>=0?t+n:Math.max(e,t+n)}),u=f(s,2);o=u[0],i=u[1];}return new x.Range(o,i-o)}Object.defineProperty(e,"__esModule",{value:!0}),e.default=e.overload=e.expandConfig=void 0;var c="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},f=function(){function t(t,e){var n=[],r=!0,o=!1,i=void 0;try{for(var l,a=t[Symbol.iterator]();!(r=(l=a.next()).done)&&(n.push(l.value),!e||n.length!==e);r=!0);}catch(t){o=!0,i=t;}finally{try{!r&&a.return&&a.return();}finally{if(o)throw i}}return n}return function(e,n){if(Array.isArray(e))return e;if(Symbol.iterator in Object(e))return t(e,n);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}(),h=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r);}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}();n(50);var p=n(2),d=r(p),y=n(14),v=r(y),b=n(8),g=r(b),m=n(9),_=r(m),O=n(0),w=r(O),x=n(15),E=r(x),k=n(3),A=r(k),j=n(10),N=r(j),T=n(34),S=r(T),P=(0, N.default)("quill"),q=function(){function t(e){var n=this,r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};if(i(this,t),this.options=l(e,r),this.container=this.options.container,null==this.container)return P.error("Invalid Quill container",e);this.options.debug&&t.debug(this.options.debug);var o=this.container.innerHTML.trim();this.container.classList.add("ql-container"),this.container.innerHTML="",this.container.__quill=this,this.root=this.addContainer("ql-editor"),this.root.classList.add("ql-blank"),this.root.setAttribute("data-gramm",!1),this.scrollingContainer=this.options.scrollingContainer||this.root,this.emitter=new g.default,this.scroll=w.default.create(this.root,{emitter:this.emitter,whitelist:this.options.formats}),this.editor=new v.default(this.scroll),this.selection=new E.default(this.scroll,this.emitter),this.theme=new this.options.theme(this,this.options),this.keyboard=this.theme.addModule("keyboard"),this.clipboard=this.theme.addModule("clipboard"),this.history=this.theme.addModule("history"),this.theme.init(),this.emitter.on(g.default.events.EDITOR_CHANGE,function(t){t===g.default.events.TEXT_CHANGE&&n.root.classList.toggle("ql-blank",n.editor.isBlank());}),this.emitter.on(g.default.events.SCROLL_UPDATE,function(t,e){var r=n.selection.lastRange,o=r&&0===r.length?r.index:void 0;a.call(n,function(){return n.editor.update(null,e,o)},t);});var s=this.clipboard.convert("<div class='ql-editor' style=\"white-space: normal;\">"+o+"<p><br></p></div>");this.setContents(s),this.history.clear(),this.options.placeholder&&this.root.setAttribute("data-placeholder",this.options.placeholder),this.options.readOnly&&this.disable();}return h(t,null,[{key:"debug",value:function(t){!0===t&&(t="log"),N.default.level(t);}},{key:"find",value:function(t){return t.__quill||w.default.find(t)}},{key:"import",value:function(t){return null==this.imports[t]&&P.error("Cannot import "+t+". Are you sure it was registered?"),this.imports[t]}},{key:"register",value:function(t,e){var n=this,r=arguments.length>2&&void 0!==arguments[2]&&arguments[2];if("string"!=typeof t){var o=t.attrName||t.blotName;"string"==typeof o?this.register("formats/"+o,t,e):Object.keys(t).forEach(function(r){n.register(r,t[r],e);});}else null==this.imports[t]||r||P.warn("Overwriting "+t+" with",e),this.imports[t]=e,(t.startsWith("blots/")||t.startsWith("formats/"))&&"abstract"!==e.blotName?w.default.register(e):t.startsWith("modules")&&"function"==typeof e.register&&e.register();}}]),h(t,[{key:"addContainer",value:function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;if("string"==typeof t){var n=t;t=document.createElement("div"),t.classList.add(n);}return this.container.insertBefore(t,e),t}},{key:"blur",value:function(){this.selection.setRange(null);}},{key:"deleteText",value:function(t,e,n){var r=this,o=s(t,e,n),i=f(o,4);return t=i[0],e=i[1],n=i[3],a.call(this,function(){return r.editor.deleteText(t,e)},n,t,-1*e)}},{key:"disable",value:function(){this.enable(!1);}},{key:"enable",value:function(){var t=!(arguments.length>0&&void 0!==arguments[0])||arguments[0];this.scroll.enable(t),this.container.classList.toggle("ql-disabled",!t);}},{key:"focus",value:function(){var t=this.scrollingContainer.scrollTop;this.selection.focus(),this.scrollingContainer.scrollTop=t,this.scrollIntoView();}},{key:"format",value:function(t,e){var n=this,r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:g.default.sources.API;return a.call(this,function(){var r=n.getSelection(!0),i=new d.default;if(null==r)return i;if(w.default.query(t,w.default.Scope.BLOCK))i=n.editor.formatLine(r.index,r.length,o({},t,e));else {if(0===r.length)return n.selection.format(t,e),i;i=n.editor.formatText(r.index,r.length,o({},t,e));}return n.setSelection(r,g.default.sources.SILENT),i},r)}},{key:"formatLine",value:function(t,e,n,r,o){var i=this,l=void 0,u=s(t,e,n,r,o),c=f(u,4);return t=c[0],e=c[1],l=c[2],o=c[3],a.call(this,function(){return i.editor.formatLine(t,e,l)},o,t,0)}},{key:"formatText",value:function(t,e,n,r,o){var i=this,l=void 0,u=s(t,e,n,r,o),c=f(u,4);return t=c[0],e=c[1],l=c[2],o=c[3],a.call(this,function(){return i.editor.formatText(t,e,l)},o,t,0)}},{key:"getBounds",value:function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0,n=void 0;n="number"==typeof t?this.selection.getBounds(t,e):this.selection.getBounds(t.index,t.length);var r=this.container.getBoundingClientRect();return {bottom:n.bottom-r.top,height:n.height,left:n.left-r.left,right:n.right-r.left,top:n.top-r.top,width:n.width}}},{key:"getContents",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0,e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:this.getLength()-t,n=s(t,e),r=f(n,2);return t=r[0],e=r[1],this.editor.getContents(t,e)}},{key:"getFormat",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:this.getSelection(!0),e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0;return "number"==typeof t?this.editor.getFormat(t,e):this.editor.getFormat(t.index,t.length)}},{key:"getIndex",value:function(t){return t.offset(this.scroll)}},{key:"getLength",value:function(){return this.scroll.length()}},{key:"getLeaf",value:function(t){return this.scroll.leaf(t)}},{key:"getLine",value:function(t){return this.scroll.line(t)}},{key:"getLines",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0,e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:Number.MAX_VALUE;return "number"!=typeof t?this.scroll.lines(t.index,t.length):this.scroll.lines(t,e)}},{key:"getModule",value:function(t){return this.theme.modules[t]}},{key:"getSelection",value:function(){return arguments.length>0&&void 0!==arguments[0]&&arguments[0]&&this.focus(),this.update(),this.selection.getRange()[0]}},{key:"getText",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0,e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:this.getLength()-t,n=s(t,e),r=f(n,2);return t=r[0],e=r[1],this.editor.getText(t,e)}},{key:"hasFocus",value:function(){return this.selection.hasFocus()}},{key:"insertEmbed",value:function(e,n,r){var o=this,i=arguments.length>3&&void 0!==arguments[3]?arguments[3]:t.sources.API;return a.call(this,function(){return o.editor.insertEmbed(e,n,r)},i,e)}},{key:"insertText",value:function(t,e,n,r,o){var i=this,l=void 0,u=s(t,0,n,r,o),c=f(u,4);return t=c[0],l=c[2],o=c[3],a.call(this,function(){return i.editor.insertText(t,e,l)},o,t,e.length)}},{key:"isEnabled",value:function(){return !this.container.classList.contains("ql-disabled")}},{key:"off",value:function(){return this.emitter.off.apply(this.emitter,arguments)}},{key:"on",value:function(){return this.emitter.on.apply(this.emitter,arguments)}},{key:"once",value:function(){return this.emitter.once.apply(this.emitter,arguments)}},{key:"pasteHTML",value:function(t,e,n){this.clipboard.dangerouslyPasteHTML(t,e,n);}},{key:"removeFormat",value:function(t,e,n){var r=this,o=s(t,e,n),i=f(o,4);return t=i[0],e=i[1],n=i[3],a.call(this,function(){return r.editor.removeFormat(t,e)},n,t)}},{key:"scrollIntoView",value:function(){this.selection.scrollIntoView(this.scrollingContainer);}},{key:"setContents",value:function(t){var e=this,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:g.default.sources.API;return a.call(this,function(){t=new d.default(t);var n=e.getLength(),r=e.editor.deleteText(0,n),o=e.editor.applyDelta(t),i=o.ops[o.ops.length-1];return null!=i&&"string"==typeof i.insert&&"\n"===i.insert[i.insert.length-1]&&(e.editor.deleteText(e.getLength()-1,1),o.delete(1)),r.compose(o)},n)}},{key:"setSelection",value:function(e,n,r){if(null==e)this.selection.setRange(null,n||t.sources.API);else {var o=s(e,n,r),i=f(o,4);e=i[0],n=i[1],r=i[3],this.selection.setRange(new x.Range(e,n),r),r!==g.default.sources.SILENT&&this.selection.scrollIntoView(this.scrollingContainer);}}},{key:"setText",value:function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:g.default.sources.API,n=(new d.default).insert(t);return this.setContents(n,e)}},{key:"update",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:g.default.sources.USER,e=this.scroll.update(t);return this.selection.update(t),e}},{key:"updateContents",value:function(t){var e=this,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:g.default.sources.API;return a.call(this,function(){return t=new d.default(t),e.editor.applyDelta(t,n)},n,!0)}}]),t}();q.DEFAULTS={bounds:null,formats:null,modules:{},placeholder:"",readOnly:!1,scrollingContainer:null,strict:!0,theme:"default"},q.events=g.default.events,q.sources=g.default.sources,q.version="1.3.6",q.imports={delta:d.default,parchment:w.default,"core/module":_.default,"core/theme":S.default},e.expandConfig=l,e.overload=s,e.default=q;},function(t,e,n){function r(t){return t&&t.__esModule?t:{default:t}}function o(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function i(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return !e||"object"!=typeof e&&"function"!=typeof e?t:e}function l(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e);}Object.defineProperty(e,"__esModule",{value:!0});var a=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r);}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),s=function t(e,n,r){null===e&&(e=Function.prototype);var o=Object.getOwnPropertyDescriptor(e,n);if(void 0===o){var i=Object.getPrototypeOf(e);return null===i?void 0:t(i,n,r)}if("value"in o)return o.value;var l=o.get;if(void 0!==l)return l.call(r)},u=n(7),c=r(u),f=n(0),h=r(f),p=function(t){function e(){return o(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return l(e,t),a(e,[{key:"formatAt",value:function(t,n,r,o){if(e.compare(this.statics.blotName,r)<0&&h.default.query(r,h.default.Scope.BLOT)){var i=this.isolate(t,n);o&&i.wrap(r,o);}else s(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"formatAt",this).call(this,t,n,r,o);}},{key:"optimize",value:function(t){if(s(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"optimize",this).call(this,t),this.parent instanceof e&&e.compare(this.statics.blotName,this.parent.statics.blotName)>0){var n=this.parent.isolate(this.offset(),this.length());this.moveChildren(n),n.wrap(this);}}}],[{key:"compare",value:function(t,n){var r=e.order.indexOf(t),o=e.order.indexOf(n);return r>=0||o>=0?r-o:t===n?0:t<n?-1:1}}]),e}(h.default.Inline);p.allowedChildren=[p,h.default.Embed,c.default],p.order=["cursor","inline","underline","strike","italic","bold","script","link","code"],e.default=p;},function(t,e,n){function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function o(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return !e||"object"!=typeof e&&"function"!=typeof e?t:e}function i(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e);}Object.defineProperty(e,"__esModule",{value:!0});var l=n(0),a=function(t){return t&&t.__esModule?t:{default:t}}(l),s=function(t){function e(){return r(this,e),o(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return i(e,t),e}(a.default.Text);e.default=s;},function(t,e,n){function r(t){return t&&t.__esModule?t:{default:t}}function o(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function i(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return !e||"object"!=typeof e&&"function"!=typeof e?t:e}function l(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e);}Object.defineProperty(e,"__esModule",{value:!0});var a=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r);}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),s=function t(e,n,r){null===e&&(e=Function.prototype);var o=Object.getOwnPropertyDescriptor(e,n);if(void 0===o){var i=Object.getPrototypeOf(e);return null===i?void 0:t(i,n,r)}if("value"in o)return o.value;var l=o.get;if(void 0!==l)return l.call(r)},u=n(54),c=r(u),f=n(10),h=r(f),p=(0, h.default)("quill:events");["selectionchange","mousedown","mouseup","click"].forEach(function(t){document.addEventListener(t,function(){for(var t=arguments.length,e=Array(t),n=0;n<t;n++)e[n]=arguments[n];[].slice.call(document.querySelectorAll(".ql-container")).forEach(function(t){if(t.__quill&&t.__quill.emitter){var n;(n=t.__quill.emitter).handleDOM.apply(n,e);}});});});var d=function(t){function e(){o(this,e);var t=i(this,(e.__proto__||Object.getPrototypeOf(e)).call(this));return t.listeners={},t.on("error",p.error),t}return l(e,t),a(e,[{key:"emit",value:function(){p.log.apply(p,arguments),s(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"emit",this).apply(this,arguments);}},{key:"handleDOM",value:function(t){for(var e=arguments.length,n=Array(e>1?e-1:0),r=1;r<e;r++)n[r-1]=arguments[r];(this.listeners[t.type]||[]).forEach(function(e){var r=e.node,o=e.handler;(t.target===r||r.contains(t.target))&&o.apply(void 0,[t].concat(n));});}},{key:"listenDOM",value:function(t,e,n){this.listeners[t]||(this.listeners[t]=[]),this.listeners[t].push({node:e,handler:n});}}]),e}(c.default);d.events={EDITOR_CHANGE:"editor-change",SCROLL_BEFORE_UPDATE:"scroll-before-update",SCROLL_OPTIMIZE:"scroll-optimize",SCROLL_UPDATE:"scroll-update",SELECTION_CHANGE:"selection-change",TEXT_CHANGE:"text-change"},d.sources={API:"api",SILENT:"silent",USER:"user"},e.default=d;},function(t,e,n){function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(e,"__esModule",{value:!0});var o=function t(e){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};r(this,t),this.quill=e,this.options=n;};o.DEFAULTS={},e.default=o;},function(t,e,n){function r(t){if(i.indexOf(t)<=i.indexOf(l)){for(var e,n=arguments.length,r=Array(n>1?n-1:0),o=1;o<n;o++)r[o-1]=arguments[o];(e=console)[t].apply(e,r);}}function o(t){return i.reduce(function(e,n){return e[n]=r.bind(console,n,t),e},{})}Object.defineProperty(e,"__esModule",{value:!0});var i=["error","warn","log","info"],l="warn";r.level=o.level=function(t){l=t;},e.default=o;},function(t,e,n){function r(t){return null===t||void 0===t}function o(t){return !(!t||"object"!=typeof t||"number"!=typeof t.length)&&("function"==typeof t.copy&&"function"==typeof t.slice&&!(t.length>0&&"number"!=typeof t[0]))}function i(t,e,n){var i,c;if(r(t)||r(e))return !1;if(t.prototype!==e.prototype)return !1;if(s(t))return !!s(e)&&(t=l.call(t),e=l.call(e),u(t,e,n));if(o(t)){if(!o(e))return !1;if(t.length!==e.length)return !1;for(i=0;i<t.length;i++)if(t[i]!==e[i])return !1;return !0}try{var f=a(t),h=a(e);}catch(t){return !1}if(f.length!=h.length)return !1;for(f.sort(),h.sort(),i=f.length-1;i>=0;i--)if(f[i]!=h[i])return !1;for(i=f.length-1;i>=0;i--)if(c=f[i],!u(t[c],e[c],n))return !1;return typeof t==typeof e}var l=Array.prototype.slice,a=n(52),s=n(53),u=t.exports=function(t,e,n){return n||(n={}),t===e||(t instanceof Date&&e instanceof Date?t.getTime()===e.getTime():!t||!e||"object"!=typeof t&&"object"!=typeof e?n.strict?t===e:t==e:i(t,e,n))};},function(t,e,n){Object.defineProperty(e,"__esModule",{value:!0});var r=n(1),o=function(){function t(t,e,n){void 0===n&&(n={}),this.attrName=t,this.keyName=e;var o=r.Scope.TYPE&r.Scope.ATTRIBUTE;null!=n.scope?this.scope=n.scope&r.Scope.LEVEL|o:this.scope=r.Scope.ATTRIBUTE,null!=n.whitelist&&(this.whitelist=n.whitelist);}return t.keys=function(t){return [].map.call(t.attributes,function(t){return t.name})},t.prototype.add=function(t,e){return !!this.canAdd(t,e)&&(t.setAttribute(this.keyName,e),!0)},t.prototype.canAdd=function(t,e){return null!=r.query(t,r.Scope.BLOT&(this.scope|r.Scope.TYPE))&&(null==this.whitelist||("string"==typeof e?this.whitelist.indexOf(e.replace(/["']/g,""))>-1:this.whitelist.indexOf(e)>-1))},t.prototype.remove=function(t){t.removeAttribute(this.keyName);},t.prototype.value=function(t){var e=t.getAttribute(this.keyName);return this.canAdd(t,e)&&e?e:""},t}();e.default=o;},function(t,e,n){function r(t){return t&&t.__esModule?t:{default:t}}function o(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function i(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return !e||"object"!=typeof e&&"function"!=typeof e?t:e}function l(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e);}Object.defineProperty(e,"__esModule",{value:!0}),e.default=e.Code=void 0;var a=function(){function t(t,e){var n=[],r=!0,o=!1,i=void 0;try{for(var l,a=t[Symbol.iterator]();!(r=(l=a.next()).done)&&(n.push(l.value),!e||n.length!==e);r=!0);}catch(t){o=!0,i=t;}finally{try{!r&&a.return&&a.return();}finally{if(o)throw i}}return n}return function(e,n){if(Array.isArray(e))return e;if(Symbol.iterator in Object(e))return t(e,n);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}(),s=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r);}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),u=function t(e,n,r){null===e&&(e=Function.prototype);var o=Object.getOwnPropertyDescriptor(e,n);if(void 0===o){var i=Object.getPrototypeOf(e);return null===i?void 0:t(i,n,r)}if("value"in o)return o.value;var l=o.get;if(void 0!==l)return l.call(r)},c=n(2),f=r(c),h=n(0),p=r(h),d=n(4),y=r(d),v=n(6),b=r(v),g=n(7),m=r(g),_=function(t){function e(){return o(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return l(e,t),e}(b.default);_.blotName="code",_.tagName="CODE";var O=function(t){function e(){return o(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return l(e,t),s(e,[{key:"delta",value:function(){var t=this,e=this.domNode.textContent;return e.endsWith("\n")&&(e=e.slice(0,-1)),e.split("\n").reduce(function(e,n){return e.insert(n).insert("\n",t.formats())},new f.default)}},{key:"format",value:function(t,n){if(t!==this.statics.blotName||!n){var r=this.descendant(m.default,this.length()-1),o=a(r,1),i=o[0];null!=i&&i.deleteAt(i.length()-1,1),u(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"format",this).call(this,t,n);}}},{key:"formatAt",value:function(t,n,r,o){if(0!==n&&null!=p.default.query(r,p.default.Scope.BLOCK)&&(r!==this.statics.blotName||o!==this.statics.formats(this.domNode))){var i=this.newlineIndex(t);if(!(i<0||i>=t+n)){var l=this.newlineIndex(t,!0)+1,a=i-l+1,s=this.isolate(l,a),u=s.next;s.format(r,o),u instanceof e&&u.formatAt(0,t-l+n-a,r,o);}}}},{key:"insertAt",value:function(t,e,n){if(null==n){var r=this.descendant(m.default,t),o=a(r,2),i=o[0],l=o[1];i.insertAt(l,e);}}},{key:"length",value:function(){var t=this.domNode.textContent.length;return this.domNode.textContent.endsWith("\n")?t:t+1}},{key:"newlineIndex",value:function(t){if(arguments.length>1&&void 0!==arguments[1]&&arguments[1])return this.domNode.textContent.slice(0,t).lastIndexOf("\n");var e=this.domNode.textContent.slice(t).indexOf("\n");return e>-1?t+e:-1}},{key:"optimize",value:function(t){this.domNode.textContent.endsWith("\n")||this.appendChild(p.default.create("text","\n")),u(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"optimize",this).call(this,t);var n=this.next;null!=n&&n.prev===this&&n.statics.blotName===this.statics.blotName&&this.statics.formats(this.domNode)===n.statics.formats(n.domNode)&&(n.optimize(t),n.moveChildren(this),n.remove());}},{key:"replace",value:function(t){u(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"replace",this).call(this,t),[].slice.call(this.domNode.querySelectorAll("*")).forEach(function(t){var e=p.default.find(t);null==e?t.parentNode.removeChild(t):e instanceof p.default.Embed?e.remove():e.unwrap();});}}],[{key:"create",value:function(t){var n=u(e.__proto__||Object.getPrototypeOf(e),"create",this).call(this,t);return n.setAttribute("spellcheck",!1),n}},{key:"formats",value:function(){return !0}}]),e}(y.default);O.blotName="code-block",O.tagName="PRE",O.TAB="  ",e.Code=_,e.default=O;},function(t,e,n){function r(t){return t&&t.__esModule?t:{default:t}}function o(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}function i(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function l(t,e){return Object.keys(e).reduce(function(n,r){return null==t[r]?n:(e[r]===t[r]?n[r]=e[r]:Array.isArray(e[r])?e[r].indexOf(t[r])<0&&(n[r]=e[r].concat([t[r]])):n[r]=[e[r],t[r]],n)},{})}function a(t){return t.reduce(function(t,e){if(1===e.insert){var n=(0, A.default)(e.attributes);return delete n.image,t.insert({image:e.attributes.image},n)}if(null==e.attributes||!0!==e.attributes.list&&!0!==e.attributes.bullet||(e=(0, A.default)(e),e.attributes.list?e.attributes.list="ordered":(e.attributes.list="bullet",delete e.attributes.bullet)),"string"==typeof e.insert){var r=e.insert.replace(/\r\n/g,"\n").replace(/\r/g,"\n");return t.insert(r,e.attributes)}return t.push(e)},new h.default)}Object.defineProperty(e,"__esModule",{value:!0});var s="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},u=function(){function t(t,e){var n=[],r=!0,o=!1,i=void 0;try{for(var l,a=t[Symbol.iterator]();!(r=(l=a.next()).done)&&(n.push(l.value),!e||n.length!==e);r=!0);}catch(t){o=!0,i=t;}finally{try{!r&&a.return&&a.return();}finally{if(o)throw i}}return n}return function(e,n){if(Array.isArray(e))return e;if(Symbol.iterator in Object(e))return t(e,n);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}(),c=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r);}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),f=n(2),h=r(f),p=n(20),d=r(p),y=n(0),v=r(y),b=n(13),g=r(b),m=n(24),_=r(m),O=n(4),w=r(O),x=n(16),E=r(x),k=n(21),A=r(k),j=n(11),N=r(j),T=n(3),S=r(T),P=/^[ -~]*$/,q=function(){function t(e){i(this,t),this.scroll=e,this.delta=this.getDelta();}return c(t,[{key:"applyDelta",value:function(t){var e=this,n=!1;this.scroll.update();var r=this.scroll.length();return this.scroll.batchStart(),t=a(t),t.reduce(function(t,o){var i=o.retain||o.delete||o.insert.length||1,l=o.attributes||{};if(null!=o.insert){if("string"==typeof o.insert){var a=o.insert;a.endsWith("\n")&&n&&(n=!1,a=a.slice(0,-1)),t>=r&&!a.endsWith("\n")&&(n=!0),e.scroll.insertAt(t,a);var c=e.scroll.line(t),f=u(c,2),h=f[0],p=f[1],y=(0, S.default)({},(0, O.bubbleFormats)(h));if(h instanceof w.default){var b=h.descendant(v.default.Leaf,p),g=u(b,1),m=g[0];y=(0, S.default)(y,(0, O.bubbleFormats)(m));}l=d.default.attributes.diff(y,l)||{};}else if("object"===s(o.insert)){var _=Object.keys(o.insert)[0];if(null==_)return t;e.scroll.insertAt(t,_,o.insert[_]);}r+=i;}return Object.keys(l).forEach(function(n){e.scroll.formatAt(t,i,n,l[n]);}),t+i},0),t.reduce(function(t,n){return "number"==typeof n.delete?(e.scroll.deleteAt(t,n.delete),t):t+(n.retain||n.insert.length||1)},0),this.scroll.batchEnd(),this.update(t)}},{key:"deleteText",value:function(t,e){return this.scroll.deleteAt(t,e),this.update((new h.default).retain(t).delete(e))}},{key:"formatLine",value:function(t,e){var n=this,r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};return this.scroll.update(),Object.keys(r).forEach(function(o){if(null==n.scroll.whitelist||n.scroll.whitelist[o]){var i=n.scroll.lines(t,Math.max(e,1)),l=e;i.forEach(function(e){var i=e.length();if(e instanceof g.default){var a=t-e.offset(n.scroll),s=e.newlineIndex(a+l)-a+1;e.formatAt(a,s,o,r[o]);}else e.format(o,r[o]);l-=i;});}}),this.scroll.optimize(),this.update((new h.default).retain(t).retain(e,(0, A.default)(r)))}},{key:"formatText",value:function(t,e){var n=this,r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};return Object.keys(r).forEach(function(o){n.scroll.formatAt(t,e,o,r[o]);}),this.update((new h.default).retain(t).retain(e,(0, A.default)(r)))}},{key:"getContents",value:function(t,e){return this.delta.slice(t,t+e)}},{key:"getDelta",value:function(){return this.scroll.lines().reduce(function(t,e){return t.concat(e.delta())},new h.default)}},{key:"getFormat",value:function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0,n=[],r=[];0===e?this.scroll.path(t).forEach(function(t){var e=u(t,1),o=e[0];o instanceof w.default?n.push(o):o instanceof v.default.Leaf&&r.push(o);}):(n=this.scroll.lines(t,e),r=this.scroll.descendants(v.default.Leaf,t,e));var o=[n,r].map(function(t){if(0===t.length)return {};for(var e=(0, O.bubbleFormats)(t.shift());Object.keys(e).length>0;){var n=t.shift();if(null==n)return e;e=l((0, O.bubbleFormats)(n),e);}return e});return S.default.apply(S.default,o)}},{key:"getText",value:function(t,e){return this.getContents(t,e).filter(function(t){return "string"==typeof t.insert}).map(function(t){return t.insert}).join("")}},{key:"insertEmbed",value:function(t,e,n){return this.scroll.insertAt(t,e,n),this.update((new h.default).retain(t).insert(o({},e,n)))}},{key:"insertText",value:function(t,e){var n=this,r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};return e=e.replace(/\r\n/g,"\n").replace(/\r/g,"\n"),this.scroll.insertAt(t,e),Object.keys(r).forEach(function(o){n.scroll.formatAt(t,e.length,o,r[o]);}),this.update((new h.default).retain(t).insert(e,(0, A.default)(r)))}},{key:"isBlank",value:function(){if(0==this.scroll.children.length)return !0;if(this.scroll.children.length>1)return !1;var t=this.scroll.children.head;return t.statics.blotName===w.default.blotName&&(!(t.children.length>1)&&t.children.head instanceof E.default)}},{key:"removeFormat",value:function(t,e){var n=this.getText(t,e),r=this.scroll.line(t+e),o=u(r,2),i=o[0],l=o[1],a=0,s=new h.default;null!=i&&(a=i instanceof g.default?i.newlineIndex(l)-l+1:i.length()-l,s=i.delta().slice(l,l+a-1).insert("\n"));var c=this.getContents(t,e+a),f=c.diff((new h.default).insert(n).concat(s)),p=(new h.default).retain(t).concat(f);return this.applyDelta(p)}},{key:"update",value:function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:[],n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:void 0,r=this.delta;if(1===e.length&&"characterData"===e[0].type&&e[0].target.data.match(P)&&v.default.find(e[0].target)){var o=v.default.find(e[0].target),i=(0, O.bubbleFormats)(o),l=o.offset(this.scroll),a=e[0].oldValue.replace(_.default.CONTENTS,""),s=(new h.default).insert(a),u=(new h.default).insert(o.value());t=(new h.default).retain(l).concat(s.diff(u,n)).reduce(function(t,e){return e.insert?t.insert(e.insert,i):t.push(e)},new h.default),this.delta=r.compose(t);}else this.delta=this.getDelta(),t&&(0, N.default)(r.compose(t),this.delta)||(t=r.diff(this.delta,n));return t}}]),t}();e.default=q;},function(t,e,n){function r(t){return t&&t.__esModule?t:{default:t}}function o(t){if(Array.isArray(t)){for(var e=0,n=Array(t.length);e<t.length;e++)n[e]=t[e];return n}return Array.from(t)}function i(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function l(t,e){try{e.parentNode;}catch(t){return !1}return e instanceof Text&&(e=e.parentNode),t.contains(e)}Object.defineProperty(e,"__esModule",{value:!0}),e.default=e.Range=void 0;var a=function(){function t(t,e){var n=[],r=!0,o=!1,i=void 0;try{for(var l,a=t[Symbol.iterator]();!(r=(l=a.next()).done)&&(n.push(l.value),!e||n.length!==e);r=!0);}catch(t){o=!0,i=t;}finally{try{!r&&a.return&&a.return();}finally{if(o)throw i}}return n}return function(e,n){if(Array.isArray(e))return e;if(Symbol.iterator in Object(e))return t(e,n);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}(),s=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r);}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),u=n(0),c=r(u),f=n(21),h=r(f),p=n(11),d=r(p),y=n(8),v=r(y),b=n(10),g=r(b),m=(0, g.default)("quill:selection"),_=function t(e){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0;i(this,t),this.index=e,this.length=n;},O=function(){function t(e,n){var r=this;i(this,t),this.emitter=n,this.scroll=e,this.composing=!1,this.mouseDown=!1,this.root=this.scroll.domNode,this.cursor=c.default.create("cursor",this),this.lastRange=this.savedRange=new _(0,0),this.handleComposition(),this.handleDragging(),this.emitter.listenDOM("selectionchange",document,function(){r.mouseDown||setTimeout(r.update.bind(r,v.default.sources.USER),1);}),this.emitter.on(v.default.events.EDITOR_CHANGE,function(t,e){t===v.default.events.TEXT_CHANGE&&e.length()>0&&r.update(v.default.sources.SILENT);}),this.emitter.on(v.default.events.SCROLL_BEFORE_UPDATE,function(){if(r.hasFocus()){var t=r.getNativeRange();null!=t&&t.start.node!==r.cursor.textNode&&r.emitter.once(v.default.events.SCROLL_UPDATE,function(){try{r.setNativeRange(t.start.node,t.start.offset,t.end.node,t.end.offset);}catch(t){}});}}),this.emitter.on(v.default.events.SCROLL_OPTIMIZE,function(t,e){if(e.range){var n=e.range,o=n.startNode,i=n.startOffset,l=n.endNode,a=n.endOffset;r.setNativeRange(o,i,l,a);}}),this.update(v.default.sources.SILENT);}return s(t,[{key:"handleComposition",value:function(){var t=this;this.root.addEventListener("compositionstart",function(){t.composing=!0;}),this.root.addEventListener("compositionend",function(){if(t.composing=!1,t.cursor.parent){var e=t.cursor.restore();if(!e)return;setTimeout(function(){t.setNativeRange(e.startNode,e.startOffset,e.endNode,e.endOffset);},1);}});}},{key:"handleDragging",value:function(){var t=this;this.emitter.listenDOM("mousedown",document.body,function(){t.mouseDown=!0;}),this.emitter.listenDOM("mouseup",document.body,function(){t.mouseDown=!1,t.update(v.default.sources.USER);});}},{key:"focus",value:function(){this.hasFocus()||(this.root.focus(),this.setRange(this.savedRange));}},{key:"format",value:function(t,e){if(null==this.scroll.whitelist||this.scroll.whitelist[t]){this.scroll.update();var n=this.getNativeRange();if(null!=n&&n.native.collapsed&&!c.default.query(t,c.default.Scope.BLOCK)){if(n.start.node!==this.cursor.textNode){var r=c.default.find(n.start.node,!1);if(null==r)return;if(r instanceof c.default.Leaf){var o=r.split(n.start.offset);r.parent.insertBefore(this.cursor,o);}else r.insertBefore(this.cursor,n.start.node);this.cursor.attach();}this.cursor.format(t,e),this.scroll.optimize(),this.setNativeRange(this.cursor.textNode,this.cursor.textNode.data.length),this.update();}}}},{key:"getBounds",value:function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0,n=this.scroll.length();t=Math.min(t,n-1),e=Math.min(t+e,n-1)-t;var r=void 0,o=this.scroll.leaf(t),i=a(o,2),l=i[0],s=i[1];if(null==l)return null;var u=l.position(s,!0),c=a(u,2);r=c[0],s=c[1];var f=document.createRange();if(e>0){f.setStart(r,s);var h=this.scroll.leaf(t+e),p=a(h,2);if(l=p[0],s=p[1],null==l)return null;var d=l.position(s,!0),y=a(d,2);return r=y[0],s=y[1],f.setEnd(r,s),f.getBoundingClientRect()}var v="left",b=void 0;return r instanceof Text?(s<r.data.length?(f.setStart(r,s),f.setEnd(r,s+1)):(f.setStart(r,s-1),f.setEnd(r,s),v="right"),b=f.getBoundingClientRect()):(b=l.domNode.getBoundingClientRect(),s>0&&(v="right")),{bottom:b.top+b.height,height:b.height,left:b[v],right:b[v],top:b.top,width:0}}},{key:"getNativeRange",value:function(){var t=document.getSelection();if(null==t||t.rangeCount<=0)return null;var e=t.getRangeAt(0);if(null==e)return null;var n=this.normalizeNative(e);return m.info("getNativeRange",n),n}},{key:"getRange",value:function(){var t=this.getNativeRange();return null==t?[null,null]:[this.normalizedToRange(t),t]}},{key:"hasFocus",value:function(){return document.activeElement===this.root}},{key:"normalizedToRange",value:function(t){var e=this,n=[[t.start.node,t.start.offset]];t.native.collapsed||n.push([t.end.node,t.end.offset]);var r=n.map(function(t){var n=a(t,2),r=n[0],o=n[1],i=c.default.find(r,!0),l=i.offset(e.scroll);return 0===o?l:i instanceof c.default.Container?l+i.length():l+i.index(r,o)}),i=Math.min(Math.max.apply(Math,o(r)),this.scroll.length()-1),l=Math.min.apply(Math,[i].concat(o(r)));return new _(l,i-l)}},{key:"normalizeNative",value:function(t){if(!l(this.root,t.startContainer)||!t.collapsed&&!l(this.root,t.endContainer))return null;var e={start:{node:t.startContainer,offset:t.startOffset},end:{node:t.endContainer,offset:t.endOffset},native:t};return [e.start,e.end].forEach(function(t){for(var e=t.node,n=t.offset;!(e instanceof Text)&&e.childNodes.length>0;)if(e.childNodes.length>n)e=e.childNodes[n],n=0;else {if(e.childNodes.length!==n)break;e=e.lastChild,n=e instanceof Text?e.data.length:e.childNodes.length+1;}t.node=e,t.offset=n;}),e}},{key:"rangeToNative",value:function(t){var e=this,n=t.collapsed?[t.index]:[t.index,t.index+t.length],r=[],o=this.scroll.length();return n.forEach(function(t,n){t=Math.min(o-1,t);var i=void 0,l=e.scroll.leaf(t),s=a(l,2),u=s[0],c=s[1],f=u.position(c,0!==n),h=a(f,2);i=h[0],c=h[1],r.push(i,c);}),r.length<2&&(r=r.concat(r)),r}},{key:"scrollIntoView",value:function(t){var e=this.lastRange;if(null!=e){var n=this.getBounds(e.index,e.length);if(null!=n){var r=this.scroll.length()-1,o=this.scroll.line(Math.min(e.index,r)),i=a(o,1),l=i[0],s=l;if(e.length>0){var u=this.scroll.line(Math.min(e.index+e.length,r));s=a(u,1)[0];}if(null!=l&&null!=s){var c=t.getBoundingClientRect();n.top<c.top?t.scrollTop-=c.top-n.top:n.bottom>c.bottom&&(t.scrollTop+=n.bottom-c.bottom);}}}}},{key:"setNativeRange",value:function(t,e){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:t,r=arguments.length>3&&void 0!==arguments[3]?arguments[3]:e,o=arguments.length>4&&void 0!==arguments[4]&&arguments[4];if(m.info("setNativeRange",t,e,n,r),null==t||null!=this.root.parentNode&&null!=t.parentNode&&null!=n.parentNode){var i=document.getSelection();if(null!=i)if(null!=t){this.hasFocus()||this.root.focus();var l=(this.getNativeRange()||{}).native;if(null==l||o||t!==l.startContainer||e!==l.startOffset||n!==l.endContainer||r!==l.endOffset){"BR"==t.tagName&&(e=[].indexOf.call(t.parentNode.childNodes,t),t=t.parentNode),"BR"==n.tagName&&(r=[].indexOf.call(n.parentNode.childNodes,n),n=n.parentNode);var a=document.createRange();a.setStart(t,e),a.setEnd(n,r),i.removeAllRanges(),i.addRange(a);}}else i.removeAllRanges(),this.root.blur(),document.body.focus();}}},{key:"setRange",value:function(t){var e=arguments.length>1&&void 0!==arguments[1]&&arguments[1],n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:v.default.sources.API;if("string"==typeof e&&(n=e,e=!1),m.info("setRange",t),null!=t){var r=this.rangeToNative(t);this.setNativeRange.apply(this,o(r).concat([e]));}else this.setNativeRange(null);this.update(n);}},{key:"update",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:v.default.sources.USER,e=this.lastRange,n=this.getRange(),r=a(n,2),o=r[0],i=r[1];if(this.lastRange=o,null!=this.lastRange&&(this.savedRange=this.lastRange),!(0, d.default)(e,this.lastRange)){var l;!this.composing&&null!=i&&i.native.collapsed&&i.start.node!==this.cursor.textNode&&this.cursor.restore();var s=[v.default.events.SELECTION_CHANGE,(0, h.default)(this.lastRange),(0, h.default)(e),t];if((l=this.emitter).emit.apply(l,[v.default.events.EDITOR_CHANGE].concat(s)),t!==v.default.sources.SILENT){var u;(u=this.emitter).emit.apply(u,s);}}}}]),t}();e.Range=_,e.default=O;},function(t,e,n){function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function o(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return !e||"object"!=typeof e&&"function"!=typeof e?t:e}function i(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e);}Object.defineProperty(e,"__esModule",{value:!0});var l=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r);}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),a=function t(e,n,r){null===e&&(e=Function.prototype);var o=Object.getOwnPropertyDescriptor(e,n);if(void 0===o){var i=Object.getPrototypeOf(e);return null===i?void 0:t(i,n,r)}if("value"in o)return o.value;var l=o.get;if(void 0!==l)return l.call(r)},s=n(0),u=function(t){return t&&t.__esModule?t:{default:t}}(s),c=function(t){function e(){return r(this,e),o(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return i(e,t),l(e,[{key:"insertInto",value:function(t,n){0===t.children.length?a(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"insertInto",this).call(this,t,n):this.remove();}},{key:"length",value:function(){return 0}},{key:"value",value:function(){return ""}}],[{key:"value",value:function(){}}]),e}(u.default.Embed);c.blotName="break",c.tagName="BR",e.default=c;},function(t,e,n){function r(t){var e=a.find(t);if(null==e)try{e=a.create(t);}catch(n){e=a.create(a.Scope.INLINE),[].slice.call(t.childNodes).forEach(function(t){e.domNode.appendChild(t);}),t.parentNode&&t.parentNode.replaceChild(e.domNode,t),e.attach();}return e}var o=this&&this.__extends||function(){var t=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e;}||function(t,e){for(var n in e)e.hasOwnProperty(n)&&(t[n]=e[n]);};return function(e,n){function r(){this.constructor=e;}t(e,n),e.prototype=null===n?Object.create(n):(r.prototype=n.prototype,new r);}}();Object.defineProperty(e,"__esModule",{value:!0});var i=n(44),l=n(30),a=n(1),s=function(t){function e(e){var n=t.call(this,e)||this;return n.build(),n}return o(e,t),e.prototype.appendChild=function(t){this.insertBefore(t);},e.prototype.attach=function(){t.prototype.attach.call(this),this.children.forEach(function(t){t.attach();});},e.prototype.build=function(){var t=this;this.children=new i.default,[].slice.call(this.domNode.childNodes).reverse().forEach(function(e){try{var n=r(e);t.insertBefore(n,t.children.head||void 0);}catch(t){if(t instanceof a.ParchmentError)return;throw t}});},e.prototype.deleteAt=function(t,e){if(0===t&&e===this.length())return this.remove();this.children.forEachAt(t,e,function(t,e,n){t.deleteAt(e,n);});},e.prototype.descendant=function(t,n){var r=this.children.find(n),o=r[0],i=r[1];return null==t.blotName&&t(o)||null!=t.blotName&&o instanceof t?[o,i]:o instanceof e?o.descendant(t,i):[null,-1]},e.prototype.descendants=function(t,n,r){void 0===n&&(n=0),void 0===r&&(r=Number.MAX_VALUE);var o=[],i=r;return this.children.forEachAt(n,r,function(n,r,l){(null==t.blotName&&t(n)||null!=t.blotName&&n instanceof t)&&o.push(n),n instanceof e&&(o=o.concat(n.descendants(t,r,i))),i-=l;}),o},e.prototype.detach=function(){this.children.forEach(function(t){t.detach();}),t.prototype.detach.call(this);},e.prototype.formatAt=function(t,e,n,r){this.children.forEachAt(t,e,function(t,e,o){t.formatAt(e,o,n,r);});},e.prototype.insertAt=function(t,e,n){var r=this.children.find(t),o=r[0],i=r[1];if(o)o.insertAt(i,e,n);else {var l=null==n?a.create("text",e):a.create(e,n);this.appendChild(l);}},e.prototype.insertBefore=function(t,e){if(null!=this.statics.allowedChildren&&!this.statics.allowedChildren.some(function(e){return t instanceof e}))throw new a.ParchmentError("Cannot insert "+t.statics.blotName+" into "+this.statics.blotName);t.insertInto(this,e);},e.prototype.length=function(){return this.children.reduce(function(t,e){return t+e.length()},0)},e.prototype.moveChildren=function(t,e){this.children.forEach(function(n){t.insertBefore(n,e);});},e.prototype.optimize=function(e){if(t.prototype.optimize.call(this,e),0===this.children.length)if(null!=this.statics.defaultChild){var n=a.create(this.statics.defaultChild);this.appendChild(n),n.optimize(e);}else this.remove();},e.prototype.path=function(t,n){void 0===n&&(n=!1);var r=this.children.find(t,n),o=r[0],i=r[1],l=[[this,t]];return o instanceof e?l.concat(o.path(i,n)):(null!=o&&l.push([o,i]),l)},e.prototype.removeChild=function(t){this.children.remove(t);},e.prototype.replace=function(n){n instanceof e&&n.moveChildren(this),t.prototype.replace.call(this,n);},e.prototype.split=function(t,e){if(void 0===e&&(e=!1),!e){if(0===t)return this;if(t===this.length())return this.next}var n=this.clone();return this.parent.insertBefore(n,this.next),this.children.forEachAt(t,this.length(),function(t,r,o){t=t.split(r,e),n.appendChild(t);}),n},e.prototype.unwrap=function(){this.moveChildren(this.parent,this.next),this.remove();},e.prototype.update=function(t,e){var n=this,o=[],i=[];t.forEach(function(t){t.target===n.domNode&&"childList"===t.type&&(o.push.apply(o,t.addedNodes),i.push.apply(i,t.removedNodes));}),i.forEach(function(t){if(!(null!=t.parentNode&&"IFRAME"!==t.tagName&&document.body.compareDocumentPosition(t)&Node.DOCUMENT_POSITION_CONTAINED_BY)){var e=a.find(t);null!=e&&(null!=e.domNode.parentNode&&e.domNode.parentNode!==n.domNode||e.detach());}}),o.filter(function(t){return t.parentNode==n.domNode}).sort(function(t,e){return t===e?0:t.compareDocumentPosition(e)&Node.DOCUMENT_POSITION_FOLLOWING?1:-1}).forEach(function(t){var e=null;null!=t.nextSibling&&(e=a.find(t.nextSibling));var o=r(t);o.next==e&&null!=o.next||(null!=o.parent&&o.parent.removeChild(n),n.insertBefore(o,e||void 0));});},e}(l.default);e.default=s;},function(t,e,n){var r=this&&this.__extends||function(){var t=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e;}||function(t,e){for(var n in e)e.hasOwnProperty(n)&&(t[n]=e[n]);};return function(e,n){function r(){this.constructor=e;}t(e,n),e.prototype=null===n?Object.create(n):(r.prototype=n.prototype,new r);}}();Object.defineProperty(e,"__esModule",{value:!0});var o=n(12),i=n(31),l=n(17),a=n(1),s=function(t){function e(e){var n=t.call(this,e)||this;return n.attributes=new i.default(n.domNode),n}return r(e,t),e.formats=function(t){return "string"==typeof this.tagName||(Array.isArray(this.tagName)?t.tagName.toLowerCase():void 0)},e.prototype.format=function(t,e){var n=a.query(t);n instanceof o.default?this.attributes.attribute(n,e):e&&(null==n||t===this.statics.blotName&&this.formats()[t]===e||this.replaceWith(t,e));},e.prototype.formats=function(){var t=this.attributes.values(),e=this.statics.formats(this.domNode);return null!=e&&(t[this.statics.blotName]=e),t},e.prototype.replaceWith=function(e,n){var r=t.prototype.replaceWith.call(this,e,n);return this.attributes.copy(r),r},e.prototype.update=function(e,n){var r=this;t.prototype.update.call(this,e,n),e.some(function(t){return t.target===r.domNode&&"attributes"===t.type})&&this.attributes.build();},e.prototype.wrap=function(n,r){var o=t.prototype.wrap.call(this,n,r);return o instanceof e&&o.statics.scope===this.statics.scope&&this.attributes.move(o),o},e}(l.default);e.default=s;},function(t,e,n){var r=this&&this.__extends||function(){var t=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e;}||function(t,e){for(var n in e)e.hasOwnProperty(n)&&(t[n]=e[n]);};return function(e,n){function r(){this.constructor=e;}t(e,n),e.prototype=null===n?Object.create(n):(r.prototype=n.prototype,new r);}}();Object.defineProperty(e,"__esModule",{value:!0});var o=n(30),i=n(1),l=function(t){function e(){return null!==t&&t.apply(this,arguments)||this}return r(e,t),e.value=function(t){return !0},e.prototype.index=function(t,e){return this.domNode===t||this.domNode.compareDocumentPosition(t)&Node.DOCUMENT_POSITION_CONTAINED_BY?Math.min(e,1):-1},e.prototype.position=function(t,e){var n=[].indexOf.call(this.parent.domNode.childNodes,this.domNode);return t>0&&(n+=1),[this.parent.domNode,n]},e.prototype.value=function(){return t={},t[this.statics.blotName]=this.statics.value(this.domNode)||!0,t;var t;},e.scope=i.Scope.INLINE_BLOT,e}(o.default);e.default=l;},function(t,e,n){function r(t){this.ops=t,this.index=0,this.offset=0;}var o=n(11),i=n(3),l={attributes:{compose:function(t,e,n){"object"!=typeof t&&(t={}),"object"!=typeof e&&(e={});var r=i(!0,{},e);n||(r=Object.keys(r).reduce(function(t,e){return null!=r[e]&&(t[e]=r[e]),t},{}));for(var o in t)void 0!==t[o]&&void 0===e[o]&&(r[o]=t[o]);return Object.keys(r).length>0?r:void 0},diff:function(t,e){"object"!=typeof t&&(t={}),"object"!=typeof e&&(e={});var n=Object.keys(t).concat(Object.keys(e)).reduce(function(n,r){return o(t[r],e[r])||(n[r]=void 0===e[r]?null:e[r]),n},{});return Object.keys(n).length>0?n:void 0},transform:function(t,e,n){if("object"!=typeof t)return e;if("object"==typeof e){if(!n)return e;var r=Object.keys(e).reduce(function(n,r){return void 0===t[r]&&(n[r]=e[r]),n},{});return Object.keys(r).length>0?r:void 0}}},iterator:function(t){return new r(t)},length:function(t){return "number"==typeof t.delete?t.delete:"number"==typeof t.retain?t.retain:"string"==typeof t.insert?t.insert.length:1}};r.prototype.hasNext=function(){return this.peekLength()<1/0},r.prototype.next=function(t){t||(t=1/0);var e=this.ops[this.index];if(e){var n=this.offset,r=l.length(e);if(t>=r-n?(t=r-n,this.index+=1,this.offset=0):this.offset+=t,"number"==typeof e.delete)return {delete:t};var o={};return e.attributes&&(o.attributes=e.attributes),"number"==typeof e.retain?o.retain=t:"string"==typeof e.insert?o.insert=e.insert.substr(n,t):o.insert=e.insert,o}return {retain:1/0}},r.prototype.peek=function(){return this.ops[this.index]},r.prototype.peekLength=function(){return this.ops[this.index]?l.length(this.ops[this.index])-this.offset:1/0},r.prototype.peekType=function(){return this.ops[this.index]?"number"==typeof this.ops[this.index].delete?"delete":"number"==typeof this.ops[this.index].retain?"retain":"insert":"retain"},t.exports=l;},function(t,n){var r=function(){function t(t,e){return null!=e&&t instanceof e}function n(r,o,i,l,f){function h(r,i){if(null===r)return null;if(0===i)return r;var v,b;if("object"!=typeof r)return r;if(t(r,s))v=new s;else if(t(r,u))v=new u;else if(t(r,c))v=new c(function(t,e){r.then(function(e){t(h(e,i-1));},function(t){e(h(t,i-1));});});else if(n.__isArray(r))v=[];else if(n.__isRegExp(r))v=new RegExp(r.source,a(r)),r.lastIndex&&(v.lastIndex=r.lastIndex);else if(n.__isDate(r))v=new Date(r.getTime());else {if(y&&e.isBuffer(r))return v=new e(r.length),r.copy(v),v;t(r,Error)?v=Object.create(r):void 0===l?(b=Object.getPrototypeOf(r),v=Object.create(b)):(v=Object.create(l),b=l);}if(o){var g=p.indexOf(r);if(-1!=g)return d[g];p.push(r),d.push(v);}t(r,s)&&r.forEach(function(t,e){var n=h(e,i-1),r=h(t,i-1);v.set(n,r);}),t(r,u)&&r.forEach(function(t){var e=h(t,i-1);v.add(e);});for(var m in r){var _;b&&(_=Object.getOwnPropertyDescriptor(b,m)),_&&null==_.set||(v[m]=h(r[m],i-1));}if(Object.getOwnPropertySymbols)for(var O=Object.getOwnPropertySymbols(r),m=0;m<O.length;m++){var w=O[m],x=Object.getOwnPropertyDescriptor(r,w);(!x||x.enumerable||f)&&(v[w]=h(r[w],i-1),x.enumerable||Object.defineProperty(v,w,{enumerable:!1}));}if(f)for(var E=Object.getOwnPropertyNames(r),m=0;m<E.length;m++){var k=E[m],x=Object.getOwnPropertyDescriptor(r,k);x&&x.enumerable||(v[k]=h(r[k],i-1),Object.defineProperty(v,k,{enumerable:!1}));}return v}"object"==typeof o&&(i=o.depth,l=o.prototype,f=o.includeNonEnumerable,o=o.circular);var p=[],d=[],y=void 0!==e;return void 0===o&&(o=!0),void 0===i&&(i=1/0),h(r,i)}function r(t){return Object.prototype.toString.call(t)}function o(t){return "object"==typeof t&&"[object Date]"===r(t)}function i(t){return "object"==typeof t&&"[object Array]"===r(t)}function l(t){return "object"==typeof t&&"[object RegExp]"===r(t)}function a(t){var e="";return t.global&&(e+="g"),t.ignoreCase&&(e+="i"),t.multiline&&(e+="m"),e}var s;try{s=Map;}catch(t){s=function(){};}var u;try{u=Set;}catch(t){u=function(){};}var c;try{c=Promise;}catch(t){c=function(){};}return n.clonePrototype=function(t){if(null===t)return null;var e=function(){};return e.prototype=t,new e},n.__objToStr=r,n.__isDate=o,n.__isArray=i,n.__isRegExp=l,n.__getRegExpFlags=a,n}();"object"==typeof t&&t.exports&&(t.exports=r);},function(t,e,n){function r(t){return t&&t.__esModule?t:{default:t}}function o(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function i(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return !e||"object"!=typeof e&&"function"!=typeof e?t:e}function l(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e);}function a(t){return t instanceof v.default||t instanceof y.BlockEmbed}Object.defineProperty(e,"__esModule",{value:!0});var s=function(){function t(t,e){var n=[],r=!0,o=!1,i=void 0;try{for(var l,a=t[Symbol.iterator]();!(r=(l=a.next()).done)&&(n.push(l.value),!e||n.length!==e);r=!0);}catch(t){o=!0,i=t;}finally{try{!r&&a.return&&a.return();}finally{if(o)throw i}}return n}return function(e,n){if(Array.isArray(e))return e;if(Symbol.iterator in Object(e))return t(e,n);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}(),u=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r);}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),c=function t(e,n,r){null===e&&(e=Function.prototype);var o=Object.getOwnPropertyDescriptor(e,n);if(void 0===o){var i=Object.getPrototypeOf(e);return null===i?void 0:t(i,n,r)}if("value"in o)return o.value;var l=o.get;if(void 0!==l)return l.call(r)},f=n(0),h=r(f),p=n(8),d=r(p),y=n(4),v=r(y),b=n(16),g=r(b),m=n(13),_=r(m),O=n(25),w=r(O),x=function(t){function e(t,n){o(this,e);var r=i(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t));return r.emitter=n.emitter,Array.isArray(n.whitelist)&&(r.whitelist=n.whitelist.reduce(function(t,e){return t[e]=!0,t},{})),r.domNode.addEventListener("DOMNodeInserted",function(){}),r.optimize(),r.enable(),r}return l(e,t),u(e,[{key:"batchStart",value:function(){this.batch=!0;}},{key:"batchEnd",value:function(){this.batch=!1,this.optimize();}},{key:"deleteAt",value:function(t,n){var r=this.line(t),o=s(r,2),i=o[0],l=o[1],a=this.line(t+n),u=s(a,1),f=u[0];if(c(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"deleteAt",this).call(this,t,n),null!=f&&i!==f&&l>0){if(i instanceof y.BlockEmbed||f instanceof y.BlockEmbed)return void this.optimize();if(i instanceof _.default){var h=i.newlineIndex(i.length(),!0);if(h>-1&&(i=i.split(h+1))===f)return void this.optimize()}else if(f instanceof _.default){var p=f.newlineIndex(0);p>-1&&f.split(p+1);}var d=f.children.head instanceof g.default?null:f.children.head;i.moveChildren(f,d),i.remove();}this.optimize();}},{key:"enable",value:function(){var t=!(arguments.length>0&&void 0!==arguments[0])||arguments[0];this.domNode.setAttribute("contenteditable",t);}},{key:"formatAt",value:function(t,n,r,o){(null==this.whitelist||this.whitelist[r])&&(c(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"formatAt",this).call(this,t,n,r,o),this.optimize());}},{key:"insertAt",value:function(t,n,r){if(null==r||null==this.whitelist||this.whitelist[n]){if(t>=this.length())if(null==r||null==h.default.query(n,h.default.Scope.BLOCK)){var o=h.default.create(this.statics.defaultChild);this.appendChild(o),null==r&&n.endsWith("\n")&&(n=n.slice(0,-1)),o.insertAt(0,n,r);}else {var i=h.default.create(n,r);this.appendChild(i);}else c(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"insertAt",this).call(this,t,n,r);this.optimize();}}},{key:"insertBefore",value:function(t,n){if(t.statics.scope===h.default.Scope.INLINE_BLOT){var r=h.default.create(this.statics.defaultChild);r.appendChild(t),t=r;}c(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"insertBefore",this).call(this,t,n);}},{key:"leaf",value:function(t){return this.path(t).pop()||[null,-1]}},{key:"line",value:function(t){return t===this.length()?this.line(t-1):this.descendant(a,t)}},{key:"lines",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0,e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:Number.MAX_VALUE;return function t(e,n,r){var o=[],i=r;return e.children.forEachAt(n,r,function(e,n,r){a(e)?o.push(e):e instanceof h.default.Container&&(o=o.concat(t(e,n,i))),i-=r;}),o}(this,t,e)}},{key:"optimize",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[],n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};!0!==this.batch&&(c(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"optimize",this).call(this,t,n),t.length>0&&this.emitter.emit(d.default.events.SCROLL_OPTIMIZE,t,n));}},{key:"path",value:function(t){return c(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"path",this).call(this,t).slice(1)}},{key:"update",value:function(t){if(!0!==this.batch){var n=d.default.sources.USER;"string"==typeof t&&(n=t),Array.isArray(t)||(t=this.observer.takeRecords()),t.length>0&&this.emitter.emit(d.default.events.SCROLL_BEFORE_UPDATE,n,t),c(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"update",this).call(this,t.concat([])),t.length>0&&this.emitter.emit(d.default.events.SCROLL_UPDATE,n,t);}}}]),e}(h.default.Scroll);x.blotName="scroll",x.className="ql-editor",x.tagName="DIV",x.defaultChild="block",x.allowedChildren=[v.default,y.BlockEmbed,w.default],e.default=x;},function(t,e,n){function r(t){return t&&t.__esModule?t:{default:t}}function o(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}function i(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function l(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return !e||"object"!=typeof e&&"function"!=typeof e?t:e}function a(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e);}function s(t,e){var n,r=t===D.keys.LEFT?"prefix":"suffix";return n={key:t,shiftKey:e,altKey:null},o(n,r,/^$/),o(n,"handler",function(n){var r=n.index;t===D.keys.RIGHT&&(r+=n.length+1);var o=this.quill.getLeaf(r);return !(b(o,1)[0]instanceof S.default.Embed)||(t===D.keys.LEFT?e?this.quill.setSelection(n.index-1,n.length+1,q.default.sources.USER):this.quill.setSelection(n.index-1,q.default.sources.USER):e?this.quill.setSelection(n.index,n.length+1,q.default.sources.USER):this.quill.setSelection(n.index+n.length+1,q.default.sources.USER),!1)}),n}function u(t,e){if(!(0===t.index||this.quill.getLength()<=1)){var n=this.quill.getLine(t.index),r=b(n,1),o=r[0],i={};if(0===e.offset){var l=this.quill.getLine(t.index-1),a=b(l,1),s=a[0];if(null!=s&&s.length()>1){var u=o.formats(),c=this.quill.getFormat(t.index-1,1);i=N.default.attributes.diff(u,c)||{};}}var f=/[\uD800-\uDBFF][\uDC00-\uDFFF]$/.test(e.prefix)?2:1;this.quill.deleteText(t.index-f,f,q.default.sources.USER),Object.keys(i).length>0&&this.quill.formatLine(t.index-f,f,i,q.default.sources.USER),this.quill.focus();}}function c(t,e){var n=/^[\uD800-\uDBFF][\uDC00-\uDFFF]/.test(e.suffix)?2:1;if(!(t.index>=this.quill.getLength()-n)){var r={},o=0,i=this.quill.getLine(t.index),l=b(i,1),a=l[0];if(e.offset>=a.length()-1){var s=this.quill.getLine(t.index+1),u=b(s,1),c=u[0];if(c){var f=a.formats(),h=this.quill.getFormat(t.index,1);r=N.default.attributes.diff(f,h)||{},o=c.length();}}this.quill.deleteText(t.index,n,q.default.sources.USER),Object.keys(r).length>0&&this.quill.formatLine(t.index+o-1,n,r,q.default.sources.USER);}}function f(t){var e=this.quill.getLines(t),n={};if(e.length>1){var r=e[0].formats(),o=e[e.length-1].formats();n=N.default.attributes.diff(o,r)||{};}this.quill.deleteText(t,q.default.sources.USER),Object.keys(n).length>0&&this.quill.formatLine(t.index,1,n,q.default.sources.USER),this.quill.setSelection(t.index,q.default.sources.SILENT),this.quill.focus();}function h(t,e){var n=this;t.length>0&&this.quill.scroll.deleteAt(t.index,t.length);var r=Object.keys(e.format).reduce(function(t,n){return S.default.query(n,S.default.Scope.BLOCK)&&!Array.isArray(e.format[n])&&(t[n]=e.format[n]),t},{});this.quill.insertText(t.index,"\n",r,q.default.sources.USER),this.quill.setSelection(t.index+1,q.default.sources.SILENT),this.quill.focus(),Object.keys(e.format).forEach(function(t){null==r[t]&&(Array.isArray(e.format[t])||"link"!==t&&n.quill.format(t,e.format[t],q.default.sources.USER));});}function p(t){return {key:D.keys.TAB,shiftKey:!t,format:{"code-block":!0},handler:function(e){var n=S.default.query("code-block"),r=e.index,o=e.length,i=this.quill.scroll.descendant(n,r),l=b(i,2),a=l[0],s=l[1];if(null!=a){var u=this.quill.getIndex(a),c=a.newlineIndex(s,!0)+1,f=a.newlineIndex(u+s+o),h=a.domNode.textContent.slice(c,f).split("\n");s=0,h.forEach(function(e,i){t?(a.insertAt(c+s,n.TAB),s+=n.TAB.length,0===i?r+=n.TAB.length:o+=n.TAB.length):e.startsWith(n.TAB)&&(a.deleteAt(c+s,n.TAB.length),s-=n.TAB.length,0===i?r-=n.TAB.length:o-=n.TAB.length),s+=e.length+1;}),this.quill.update(q.default.sources.USER),this.quill.setSelection(r,o,q.default.sources.SILENT);}}}}function d(t){return {key:t[0].toUpperCase(),shortKey:!0,handler:function(e,n){this.quill.format(t,!n.format[t],q.default.sources.USER);}}}function y(t){if("string"==typeof t||"number"==typeof t)return y({key:t});if("object"===(void 0===t?"undefined":v(t))&&(t=(0, _.default)(t,!1)),"string"==typeof t.key)if(null!=D.keys[t.key.toUpperCase()])t.key=D.keys[t.key.toUpperCase()];else {if(1!==t.key.length)return null;t.key=t.key.toUpperCase().charCodeAt(0);}return t.shortKey&&(t[I]=t.shortKey,delete t.shortKey),t}Object.defineProperty(e,"__esModule",{value:!0}),e.SHORTKEY=e.default=void 0;var v="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},b=function(){function t(t,e){var n=[],r=!0,o=!1,i=void 0;try{for(var l,a=t[Symbol.iterator]();!(r=(l=a.next()).done)&&(n.push(l.value),!e||n.length!==e);r=!0);}catch(t){o=!0,i=t;}finally{try{!r&&a.return&&a.return();}finally{if(o)throw i}}return n}return function(e,n){if(Array.isArray(e))return e;if(Symbol.iterator in Object(e))return t(e,n);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}(),g=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r);}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),m=n(21),_=r(m),O=n(11),w=r(O),x=n(3),E=r(x),k=n(2),A=r(k),j=n(20),N=r(j),T=n(0),S=r(T),P=n(5),q=r(P),C=n(10),L=r(C),R=n(9),M=r(R),B=(0, L.default)("quill:keyboard"),I=/Mac/i.test(navigator.platform)?"metaKey":"ctrlKey",D=function(t){function e(t,n){i(this,e);var r=l(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t,n));return r.bindings={},Object.keys(r.options.bindings).forEach(function(e){("list autofill"!==e||null==t.scroll.whitelist||t.scroll.whitelist.list)&&r.options.bindings[e]&&r.addBinding(r.options.bindings[e]);}),r.addBinding({key:e.keys.ENTER,shiftKey:null},h),r.addBinding({key:e.keys.ENTER,metaKey:null,ctrlKey:null,altKey:null},function(){}),/Firefox/i.test(navigator.userAgent)?(r.addBinding({key:e.keys.BACKSPACE},{collapsed:!0},u),r.addBinding({key:e.keys.DELETE},{collapsed:!0},c)):(r.addBinding({key:e.keys.BACKSPACE},{collapsed:!0,prefix:/^.?$/},u),r.addBinding({key:e.keys.DELETE},{collapsed:!0,suffix:/^.?$/},c)),r.addBinding({key:e.keys.BACKSPACE},{collapsed:!1},f),r.addBinding({key:e.keys.DELETE},{collapsed:!1},f),r.addBinding({key:e.keys.BACKSPACE,altKey:null,ctrlKey:null,metaKey:null,shiftKey:null},{collapsed:!0,offset:0},u),r.listen(),r}return a(e,t),g(e,null,[{key:"match",value:function(t,e){return e=y(e),!["altKey","ctrlKey","metaKey","shiftKey"].some(function(n){return !!e[n]!==t[n]&&null!==e[n]})&&e.key===(t.which||t.keyCode)}}]),g(e,[{key:"addBinding",value:function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{},r=y(t);if(null==r||null==r.key)return B.warn("Attempted to add invalid keyboard binding",r);"function"==typeof e&&(e={handler:e}),"function"==typeof n&&(n={handler:n}),r=(0, E.default)(r,e,n),this.bindings[r.key]=this.bindings[r.key]||[],this.bindings[r.key].push(r);}},{key:"listen",value:function(){var t=this;this.quill.root.addEventListener("keydown",function(n){if(!n.defaultPrevented){var r=n.which||n.keyCode,o=(t.bindings[r]||[]).filter(function(t){return e.match(n,t)});if(0!==o.length){var i=t.quill.getSelection();if(null!=i&&t.quill.hasFocus()){var l=t.quill.getLine(i.index),a=b(l,2),s=a[0],u=a[1],c=t.quill.getLeaf(i.index),f=b(c,2),h=f[0],p=f[1],d=0===i.length?[h,p]:t.quill.getLeaf(i.index+i.length),y=b(d,2),g=y[0],m=y[1],_=h instanceof S.default.Text?h.value().slice(0,p):"",O=g instanceof S.default.Text?g.value().slice(m):"",x={collapsed:0===i.length,empty:0===i.length&&s.length()<=1,format:t.quill.getFormat(i),offset:u,prefix:_,suffix:O};o.some(function(e){if(null!=e.collapsed&&e.collapsed!==x.collapsed)return !1;if(null!=e.empty&&e.empty!==x.empty)return !1;if(null!=e.offset&&e.offset!==x.offset)return !1;if(Array.isArray(e.format)){if(e.format.every(function(t){return null==x.format[t]}))return !1}else if("object"===v(e.format)&&!Object.keys(e.format).every(function(t){return !0===e.format[t]?null!=x.format[t]:!1===e.format[t]?null==x.format[t]:(0, w.default)(e.format[t],x.format[t])}))return !1;return !(null!=e.prefix&&!e.prefix.test(x.prefix))&&(!(null!=e.suffix&&!e.suffix.test(x.suffix))&&!0!==e.handler.call(t,i,x))})&&n.preventDefault();}}}});}}]),e}(M.default);D.keys={BACKSPACE:8,TAB:9,ENTER:13,ESCAPE:27,LEFT:37,UP:38,RIGHT:39,DOWN:40,DELETE:46},D.DEFAULTS={bindings:{bold:d("bold"),italic:d("italic"),underline:d("underline"),indent:{key:D.keys.TAB,format:["blockquote","indent","list"],handler:function(t,e){if(e.collapsed&&0!==e.offset)return !0;this.quill.format("indent","+1",q.default.sources.USER);}},outdent:{key:D.keys.TAB,shiftKey:!0,format:["blockquote","indent","list"],handler:function(t,e){if(e.collapsed&&0!==e.offset)return !0;this.quill.format("indent","-1",q.default.sources.USER);}},"outdent backspace":{key:D.keys.BACKSPACE,collapsed:!0,shiftKey:null,metaKey:null,ctrlKey:null,altKey:null,format:["indent","list"],offset:0,handler:function(t,e){null!=e.format.indent?this.quill.format("indent","-1",q.default.sources.USER):null!=e.format.list&&this.quill.format("list",!1,q.default.sources.USER);}},"indent code-block":p(!0),"outdent code-block":p(!1),"remove tab":{key:D.keys.TAB,shiftKey:!0,collapsed:!0,prefix:/\t$/,handler:function(t){this.quill.deleteText(t.index-1,1,q.default.sources.USER);}},tab:{key:D.keys.TAB,handler:function(t){this.quill.history.cutoff();var e=(new A.default).retain(t.index).delete(t.length).insert("\t");this.quill.updateContents(e,q.default.sources.USER),this.quill.history.cutoff(),this.quill.setSelection(t.index+1,q.default.sources.SILENT);}},"list empty enter":{key:D.keys.ENTER,collapsed:!0,format:["list"],empty:!0,handler:function(t,e){this.quill.format("list",!1,q.default.sources.USER),e.format.indent&&this.quill.format("indent",!1,q.default.sources.USER);}},"checklist enter":{key:D.keys.ENTER,collapsed:!0,format:{list:"checked"},handler:function(t){var e=this.quill.getLine(t.index),n=b(e,2),r=n[0],o=n[1],i=(0, E.default)({},r.formats(),{list:"checked"}),l=(new A.default).retain(t.index).insert("\n",i).retain(r.length()-o-1).retain(1,{list:"unchecked"});this.quill.updateContents(l,q.default.sources.USER),this.quill.setSelection(t.index+1,q.default.sources.SILENT),this.quill.scrollIntoView();}},"header enter":{key:D.keys.ENTER,collapsed:!0,format:["header"],suffix:/^$/,handler:function(t,e){var n=this.quill.getLine(t.index),r=b(n,2),o=r[0],i=r[1],l=(new A.default).retain(t.index).insert("\n",e.format).retain(o.length()-i-1).retain(1,{header:null});this.quill.updateContents(l,q.default.sources.USER),this.quill.setSelection(t.index+1,q.default.sources.SILENT),this.quill.scrollIntoView();}},"list autofill":{key:" ",collapsed:!0,format:{list:!1},prefix:/^\s*?(\d+\.|-|\*|\[ ?\]|\[x\])$/,handler:function(t,e){var n=e.prefix.length,r=this.quill.getLine(t.index),o=b(r,2),i=o[0],l=o[1];if(l>n)return !0;var a=void 0;switch(e.prefix.trim()){case"[]":case"[ ]":a="unchecked";break;case"[x]":a="checked";break;case"-":case"*":a="bullet";break;default:a="ordered";}this.quill.insertText(t.index," ",q.default.sources.USER),this.quill.history.cutoff();var s=(new A.default).retain(t.index-l).delete(n+1).retain(i.length()-2-l).retain(1,{list:a});this.quill.updateContents(s,q.default.sources.USER),this.quill.history.cutoff(),this.quill.setSelection(t.index-n,q.default.sources.SILENT);}},"code exit":{key:D.keys.ENTER,collapsed:!0,format:["code-block"],prefix:/\n\n$/,suffix:/^\s+$/,handler:function(t){var e=this.quill.getLine(t.index),n=b(e,2),r=n[0],o=n[1],i=(new A.default).retain(t.index+r.length()-o-2).retain(1,{"code-block":null}).delete(1);this.quill.updateContents(i,q.default.sources.USER);}},"embed left":s(D.keys.LEFT,!1),"embed left shift":s(D.keys.LEFT,!0),"embed right":s(D.keys.RIGHT,!1),"embed right shift":s(D.keys.RIGHT,!0)}},e.default=D,e.SHORTKEY=I;},function(t,e,n){function r(t){return t&&t.__esModule?t:{default:t}}function o(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function i(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return !e||"object"!=typeof e&&"function"!=typeof e?t:e}function l(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e);}Object.defineProperty(e,"__esModule",{value:!0});var a=function(){function t(t,e){var n=[],r=!0,o=!1,i=void 0;try{for(var l,a=t[Symbol.iterator]();!(r=(l=a.next()).done)&&(n.push(l.value),!e||n.length!==e);r=!0);}catch(t){o=!0,i=t;}finally{try{!r&&a.return&&a.return();}finally{if(o)throw i}}return n}return function(e,n){if(Array.isArray(e))return e;if(Symbol.iterator in Object(e))return t(e,n);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}(),s=function t(e,n,r){null===e&&(e=Function.prototype);var o=Object.getOwnPropertyDescriptor(e,n);if(void 0===o){var i=Object.getPrototypeOf(e);return null===i?void 0:t(i,n,r)}if("value"in o)return o.value;var l=o.get;if(void 0!==l)return l.call(r)},u=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r);}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),c=n(0),f=r(c),h=n(7),p=r(h),d=function(t){function e(t,n){o(this,e);var r=i(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t));return r.selection=n,r.textNode=document.createTextNode(e.CONTENTS),r.domNode.appendChild(r.textNode),r._length=0,r}return l(e,t),u(e,null,[{key:"value",value:function(){}}]),u(e,[{key:"detach",value:function(){null!=this.parent&&this.parent.removeChild(this);}},{key:"format",value:function(t,n){if(0!==this._length)return s(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"format",this).call(this,t,n);for(var r=this,o=0;null!=r&&r.statics.scope!==f.default.Scope.BLOCK_BLOT;)o+=r.offset(r.parent),r=r.parent;null!=r&&(this._length=e.CONTENTS.length,r.optimize(),r.formatAt(o,e.CONTENTS.length,t,n),this._length=0);}},{key:"index",value:function(t,n){return t===this.textNode?0:s(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"index",this).call(this,t,n)}},{key:"length",value:function(){return this._length}},{key:"position",value:function(){return [this.textNode,this.textNode.data.length]}},{key:"remove",value:function(){s(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"remove",this).call(this),this.parent=null;}},{key:"restore",value:function(){if(!this.selection.composing&&null!=this.parent){var t=this.textNode,n=this.selection.getNativeRange(),r=void 0,o=void 0,i=void 0;if(null!=n&&n.start.node===t&&n.end.node===t){var l=[t,n.start.offset,n.end.offset];r=l[0],o=l[1],i=l[2];}for(;null!=this.domNode.lastChild&&this.domNode.lastChild!==this.textNode;)this.domNode.parentNode.insertBefore(this.domNode.lastChild,this.domNode);if(this.textNode.data!==e.CONTENTS){var s=this.textNode.data.split(e.CONTENTS).join("");this.next instanceof p.default?(r=this.next.domNode,this.next.insertAt(0,s),this.textNode.data=e.CONTENTS):(this.textNode.data=s,this.parent.insertBefore(f.default.create(this.textNode),this),this.textNode=document.createTextNode(e.CONTENTS),this.domNode.appendChild(this.textNode));}if(this.remove(),null!=o){var u=[o,i].map(function(t){return Math.max(0,Math.min(r.data.length,t-1))}),c=a(u,2);return o=c[0],i=c[1],{startNode:r,startOffset:o,endNode:r,endOffset:i}}}}},{key:"update",value:function(t,e){var n=this;if(t.some(function(t){return "characterData"===t.type&&t.target===n.textNode})){var r=this.restore();r&&(e.range=r);}}},{key:"value",value:function(){return ""}}]),e}(f.default.Embed);d.blotName="cursor",d.className="ql-cursor",d.tagName="span",d.CONTENTS="\ufeff",e.default=d;},function(t,e,n){function r(t){return t&&t.__esModule?t:{default:t}}function o(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function i(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return !e||"object"!=typeof e&&"function"!=typeof e?t:e}function l(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e);}Object.defineProperty(e,"__esModule",{value:!0});var a=n(0),s=r(a),u=n(4),c=r(u),f=function(t){function e(){return o(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return l(e,t),e}(s.default.Container);f.allowedChildren=[c.default,u.BlockEmbed,f],e.default=f;},function(t,e,n){function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function o(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return !e||"object"!=typeof e&&"function"!=typeof e?t:e}function i(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e);}Object.defineProperty(e,"__esModule",{value:!0}),e.ColorStyle=e.ColorClass=e.ColorAttributor=void 0;var l=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r);}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),a=function t(e,n,r){null===e&&(e=Function.prototype);var o=Object.getOwnPropertyDescriptor(e,n);if(void 0===o){var i=Object.getPrototypeOf(e);return null===i?void 0:t(i,n,r)}if("value"in o)return o.value;var l=o.get;if(void 0!==l)return l.call(r)},s=n(0),u=function(t){return t&&t.__esModule?t:{default:t}}(s),c=function(t){function e(){return r(this,e),o(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return i(e,t),l(e,[{key:"value",value:function(t){var n=a(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"value",this).call(this,t);return n.startsWith("rgb(")?(n=n.replace(/^[^\d]+/,"").replace(/[^\d]+$/,""),"#"+n.split(",").map(function(t){return ("00"+parseInt(t).toString(16)).slice(-2)}).join("")):n}}]),e}(u.default.Attributor.Style),f=new u.default.Attributor.Class("color","ql-color",{scope:u.default.Scope.INLINE}),h=new c("color","color",{scope:u.default.Scope.INLINE});e.ColorAttributor=c,e.ColorClass=f,e.ColorStyle=h;},function(t,e,n){function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function o(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return !e||"object"!=typeof e&&"function"!=typeof e?t:e}function i(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e);}function l(t,e){var n=document.createElement("a");n.href=t;var r=n.href.slice(0,n.href.indexOf(":"));return e.indexOf(r)>-1}Object.defineProperty(e,"__esModule",{value:!0}),e.sanitize=e.default=void 0;var a=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r);}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),s=function t(e,n,r){null===e&&(e=Function.prototype);var o=Object.getOwnPropertyDescriptor(e,n);if(void 0===o){var i=Object.getPrototypeOf(e);return null===i?void 0:t(i,n,r)}if("value"in o)return o.value;var l=o.get;if(void 0!==l)return l.call(r)},u=n(6),c=function(t){return t&&t.__esModule?t:{default:t}}(u),f=function(t){function e(){return r(this,e),o(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return i(e,t),a(e,[{key:"format",value:function(t,n){if(t!==this.statics.blotName||!n)return s(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"format",this).call(this,t,n);n=this.constructor.sanitize(n),this.domNode.setAttribute("href",n);}}],[{key:"create",value:function(t){var n=s(e.__proto__||Object.getPrototypeOf(e),"create",this).call(this,t);return t=this.sanitize(t),n.setAttribute("href",t),n.setAttribute("target","_blank"),n}},{key:"formats",value:function(t){return t.getAttribute("href")}},{key:"sanitize",value:function(t){return l(t,this.PROTOCOL_WHITELIST)?t:this.SANITIZED_URL}}]),e}(c.default);f.blotName="link",f.tagName="A",f.SANITIZED_URL="about:blank",f.PROTOCOL_WHITELIST=["http","https","mailto","tel"],e.default=f,e.sanitize=l;},function(t,e,n){function r(t){return t&&t.__esModule?t:{default:t}}function o(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function i(t,e){t.setAttribute(e,!("true"===t.getAttribute(e)));}Object.defineProperty(e,"__esModule",{value:!0});var l="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},a=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r);}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),s=n(23),u=r(s),c=n(107),f=r(c),h=0,p=function(){function t(e){var n=this;o(this,t),this.select=e,this.container=document.createElement("span"),this.buildPicker(),this.select.style.display="none",this.select.parentNode.insertBefore(this.container,this.select),this.label.addEventListener("mousedown",function(){n.togglePicker();}),this.label.addEventListener("keydown",function(t){switch(t.keyCode){case u.default.keys.ENTER:n.togglePicker();break;case u.default.keys.ESCAPE:n.escape(),t.preventDefault();}}),this.select.addEventListener("change",this.update.bind(this));}return a(t,[{key:"togglePicker",value:function(){this.container.classList.toggle("ql-expanded"),i(this.label,"aria-expanded"),i(this.options,"aria-hidden");}},{key:"buildItem",value:function(t){var e=this,n=document.createElement("span");return n.tabIndex="0",n.setAttribute("role","button"),n.classList.add("ql-picker-item"),t.hasAttribute("value")&&n.setAttribute("data-value",t.getAttribute("value")),t.textContent&&n.setAttribute("data-label",t.textContent),n.addEventListener("click",function(){e.selectItem(n,!0);}),n.addEventListener("keydown",function(t){switch(t.keyCode){case u.default.keys.ENTER:e.selectItem(n,!0),t.preventDefault();break;case u.default.keys.ESCAPE:e.escape(),t.preventDefault();}}),n}},{key:"buildLabel",value:function(){var t=document.createElement("span");return t.classList.add("ql-picker-label"),t.innerHTML=f.default,t.tabIndex="0",t.setAttribute("role","button"),t.setAttribute("aria-expanded","false"),this.container.appendChild(t),t}},{key:"buildOptions",value:function(){var t=this,e=document.createElement("span");e.classList.add("ql-picker-options"),e.setAttribute("aria-hidden","true"),e.tabIndex="-1",e.id="ql-picker-options-"+h,h+=1,this.label.setAttribute("aria-controls",e.id),this.options=e,[].slice.call(this.select.options).forEach(function(n){var r=t.buildItem(n);e.appendChild(r),!0===n.selected&&t.selectItem(r);}),this.container.appendChild(e);}},{key:"buildPicker",value:function(){var t=this;[].slice.call(this.select.attributes).forEach(function(e){t.container.setAttribute(e.name,e.value);}),this.container.classList.add("ql-picker"),this.label=this.buildLabel(),this.buildOptions();}},{key:"escape",value:function(){var t=this;this.close(),setTimeout(function(){return t.label.focus()},1);}},{key:"close",value:function(){this.container.classList.remove("ql-expanded"),this.label.setAttribute("aria-expanded","false"),this.options.setAttribute("aria-hidden","true");}},{key:"selectItem",value:function(t){var e=arguments.length>1&&void 0!==arguments[1]&&arguments[1],n=this.container.querySelector(".ql-selected");if(t!==n&&(null!=n&&n.classList.remove("ql-selected"),null!=t&&(t.classList.add("ql-selected"),this.select.selectedIndex=[].indexOf.call(t.parentNode.children,t),t.hasAttribute("data-value")?this.label.setAttribute("data-value",t.getAttribute("data-value")):this.label.removeAttribute("data-value"),t.hasAttribute("data-label")?this.label.setAttribute("data-label",t.getAttribute("data-label")):this.label.removeAttribute("data-label"),e))){if("function"==typeof Event)this.select.dispatchEvent(new Event("change"));else if("object"===("undefined"==typeof Event?"undefined":l(Event))){var r=document.createEvent("Event");r.initEvent("change",!0,!0),this.select.dispatchEvent(r);}this.close();}}},{key:"update",value:function(){var t=void 0;if(this.select.selectedIndex>-1){var e=this.container.querySelector(".ql-picker-options").children[this.select.selectedIndex];t=this.select.options[this.select.selectedIndex],this.selectItem(e);}else this.selectItem(null);var n=null!=t&&t!==this.select.querySelector("option[selected]");this.label.classList.toggle("ql-active",n);}}]),t}();e.default=p;},function(t,e,n){function r(t){return t&&t.__esModule?t:{default:t}}Object.defineProperty(e,"__esModule",{value:!0});var o=n(0),i=r(o),l=n(5),a=r(l),s=n(4),u=r(s),c=n(16),f=r(c),h=n(25),p=r(h),d=n(24),y=r(d),v=n(35),b=r(v),g=n(6),m=r(g),_=n(22),O=r(_),w=n(7),x=r(w),E=n(55),k=r(E),A=n(42),j=r(A),N=n(23),T=r(N);a.default.register({"blots/block":u.default,"blots/block/embed":s.BlockEmbed,"blots/break":f.default,"blots/container":p.default,"blots/cursor":y.default,"blots/embed":b.default,"blots/inline":m.default,"blots/scroll":O.default,"blots/text":x.default,"modules/clipboard":k.default,"modules/history":j.default,"modules/keyboard":T.default}),i.default.register(u.default,f.default,y.default,m.default,O.default,x.default),e.default=a.default;},function(t,e,n){Object.defineProperty(e,"__esModule",{value:!0});var r=n(1),o=function(){function t(t){this.domNode=t,this.domNode[r.DATA_KEY]={blot:this};}return Object.defineProperty(t.prototype,"statics",{get:function(){return this.constructor},enumerable:!0,configurable:!0}),t.create=function(t){if(null==this.tagName)throw new r.ParchmentError("Blot definition missing tagName");var e;return Array.isArray(this.tagName)?("string"==typeof t&&(t=t.toUpperCase(),parseInt(t).toString()===t&&(t=parseInt(t))),e="number"==typeof t?document.createElement(this.tagName[t-1]):this.tagName.indexOf(t)>-1?document.createElement(t):document.createElement(this.tagName[0])):e=document.createElement(this.tagName),this.className&&e.classList.add(this.className),e},t.prototype.attach=function(){null!=this.parent&&(this.scroll=this.parent.scroll);},t.prototype.clone=function(){var t=this.domNode.cloneNode(!1);return r.create(t)},t.prototype.detach=function(){null!=this.parent&&this.parent.removeChild(this),delete this.domNode[r.DATA_KEY];},t.prototype.deleteAt=function(t,e){this.isolate(t,e).remove();},t.prototype.formatAt=function(t,e,n,o){var i=this.isolate(t,e);if(null!=r.query(n,r.Scope.BLOT)&&o)i.wrap(n,o);else if(null!=r.query(n,r.Scope.ATTRIBUTE)){var l=r.create(this.statics.scope);i.wrap(l),l.format(n,o);}},t.prototype.insertAt=function(t,e,n){var o=null==n?r.create("text",e):r.create(e,n),i=this.split(t);this.parent.insertBefore(o,i);},t.prototype.insertInto=function(t,e){void 0===e&&(e=null),null!=this.parent&&this.parent.children.remove(this);var n=null;t.children.insertBefore(this,e),null!=e&&(n=e.domNode),this.domNode.parentNode==t.domNode&&this.domNode.nextSibling==n||t.domNode.insertBefore(this.domNode,n),this.parent=t,this.attach();},t.prototype.isolate=function(t,e){var n=this.split(t);return n.split(e),n},t.prototype.length=function(){return 1},t.prototype.offset=function(t){return void 0===t&&(t=this.parent),null==this.parent||this==t?0:this.parent.children.offset(this)+this.parent.offset(t)},t.prototype.optimize=function(t){null!=this.domNode[r.DATA_KEY]&&delete this.domNode[r.DATA_KEY].mutations;},t.prototype.remove=function(){null!=this.domNode.parentNode&&this.domNode.parentNode.removeChild(this.domNode),this.detach();},t.prototype.replace=function(t){null!=t.parent&&(t.parent.insertBefore(this,t.next),t.remove());},t.prototype.replaceWith=function(t,e){var n="string"==typeof t?r.create(t,e):t;return n.replace(this),n},t.prototype.split=function(t,e){return 0===t?this:this.next},t.prototype.update=function(t,e){},t.prototype.wrap=function(t,e){var n="string"==typeof t?r.create(t,e):t;return null!=this.parent&&this.parent.insertBefore(n,this.next),n.appendChild(this),n},t.blotName="abstract",t}();e.default=o;},function(t,e,n){Object.defineProperty(e,"__esModule",{value:!0});var r=n(12),o=n(32),i=n(33),l=n(1),a=function(){function t(t){this.attributes={},this.domNode=t,this.build();}return t.prototype.attribute=function(t,e){e?t.add(this.domNode,e)&&(null!=t.value(this.domNode)?this.attributes[t.attrName]=t:delete this.attributes[t.attrName]):(t.remove(this.domNode),delete this.attributes[t.attrName]);},t.prototype.build=function(){var t=this;this.attributes={};var e=r.default.keys(this.domNode),n=o.default.keys(this.domNode),a=i.default.keys(this.domNode);e.concat(n).concat(a).forEach(function(e){var n=l.query(e,l.Scope.ATTRIBUTE);n instanceof r.default&&(t.attributes[n.attrName]=n);});},t.prototype.copy=function(t){var e=this;Object.keys(this.attributes).forEach(function(n){var r=e.attributes[n].value(e.domNode);t.format(n,r);});},t.prototype.move=function(t){var e=this;this.copy(t),Object.keys(this.attributes).forEach(function(t){e.attributes[t].remove(e.domNode);}),this.attributes={};},t.prototype.values=function(){var t=this;return Object.keys(this.attributes).reduce(function(e,n){return e[n]=t.attributes[n].value(t.domNode),e},{})},t}();e.default=a;},function(t,e,n){function r(t,e){return (t.getAttribute("class")||"").split(/\s+/).filter(function(t){return 0===t.indexOf(e+"-")})}var o=this&&this.__extends||function(){var t=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e;}||function(t,e){for(var n in e)e.hasOwnProperty(n)&&(t[n]=e[n]);};return function(e,n){function r(){this.constructor=e;}t(e,n),e.prototype=null===n?Object.create(n):(r.prototype=n.prototype,new r);}}();Object.defineProperty(e,"__esModule",{value:!0});var i=n(12),l=function(t){function e(){return null!==t&&t.apply(this,arguments)||this}return o(e,t),e.keys=function(t){return (t.getAttribute("class")||"").split(/\s+/).map(function(t){return t.split("-").slice(0,-1).join("-")})},e.prototype.add=function(t,e){return !!this.canAdd(t,e)&&(this.remove(t),t.classList.add(this.keyName+"-"+e),!0)},e.prototype.remove=function(t){r(t,this.keyName).forEach(function(e){t.classList.remove(e);}),0===t.classList.length&&t.removeAttribute("class");},e.prototype.value=function(t){var e=r(t,this.keyName)[0]||"",n=e.slice(this.keyName.length+1);return this.canAdd(t,n)?n:""},e}(i.default);e.default=l;},function(t,e,n){function r(t){var e=t.split("-"),n=e.slice(1).map(function(t){return t[0].toUpperCase()+t.slice(1)}).join("");return e[0]+n}var o=this&&this.__extends||function(){var t=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e;}||function(t,e){for(var n in e)e.hasOwnProperty(n)&&(t[n]=e[n]);};return function(e,n){function r(){this.constructor=e;}t(e,n),e.prototype=null===n?Object.create(n):(r.prototype=n.prototype,new r);}}();Object.defineProperty(e,"__esModule",{value:!0});var i=n(12),l=function(t){function e(){return null!==t&&t.apply(this,arguments)||this}return o(e,t),e.keys=function(t){return (t.getAttribute("style")||"").split(";").map(function(t){return t.split(":")[0].trim()})},e.prototype.add=function(t,e){return !!this.canAdd(t,e)&&(t.style[r(this.keyName)]=e,!0)},e.prototype.remove=function(t){t.style[r(this.keyName)]="",t.getAttribute("style")||t.removeAttribute("style");},e.prototype.value=function(t){var e=t.style[r(this.keyName)];return this.canAdd(t,e)?e:""},e}(i.default);e.default=l;},function(t,e,n){function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(e,"__esModule",{value:!0});var o=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r);}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),i=function(){function t(e,n){r(this,t),this.quill=e,this.options=n,this.modules={};}return o(t,[{key:"init",value:function(){var t=this;Object.keys(this.options.modules).forEach(function(e){null==t.modules[e]&&t.addModule(e);});}},{key:"addModule",value:function(t){var e=this.quill.constructor.import("modules/"+t);return this.modules[t]=new e(this.quill,this.options.modules[t]||{}),this.modules[t]}}]),t}();i.DEFAULTS={modules:{}},i.themes={default:i},e.default=i;},function(t,e,n){function r(t){return t&&t.__esModule?t:{default:t}}function o(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function i(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return !e||"object"!=typeof e&&"function"!=typeof e?t:e}function l(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e);}Object.defineProperty(e,"__esModule",{value:!0});var a=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r);}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),s=function t(e,n,r){null===e&&(e=Function.prototype);var o=Object.getOwnPropertyDescriptor(e,n);if(void 0===o){var i=Object.getPrototypeOf(e);return null===i?void 0:t(i,n,r)}if("value"in o)return o.value;var l=o.get;if(void 0!==l)return l.call(r)},u=n(0),c=r(u),f=n(7),h=r(f),p="\ufeff",d=function(t){function e(t){o(this,e);var n=i(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t));return n.contentNode=document.createElement("span"),n.contentNode.setAttribute("contenteditable",!1),[].slice.call(n.domNode.childNodes).forEach(function(t){n.contentNode.appendChild(t);}),n.leftGuard=document.createTextNode(p),n.rightGuard=document.createTextNode(p),n.domNode.appendChild(n.leftGuard),n.domNode.appendChild(n.contentNode),n.domNode.appendChild(n.rightGuard),n}return l(e,t),a(e,[{key:"index",value:function(t,n){return t===this.leftGuard?0:t===this.rightGuard?1:s(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"index",this).call(this,t,n)}},{key:"restore",value:function(t){var e=void 0,n=void 0,r=t.data.split(p).join("");if(t===this.leftGuard)if(this.prev instanceof h.default){var o=this.prev.length();this.prev.insertAt(o,r),e={startNode:this.prev.domNode,startOffset:o+r.length};}else n=document.createTextNode(r),this.parent.insertBefore(c.default.create(n),this),e={startNode:n,startOffset:r.length};else t===this.rightGuard&&(this.next instanceof h.default?(this.next.insertAt(0,r),e={startNode:this.next.domNode,startOffset:r.length}):(n=document.createTextNode(r),this.parent.insertBefore(c.default.create(n),this.next),e={startNode:n,startOffset:r.length}));return t.data=p,e}},{key:"update",value:function(t,e){var n=this;t.forEach(function(t){if("characterData"===t.type&&(t.target===n.leftGuard||t.target===n.rightGuard)){var r=n.restore(t.target);r&&(e.range=r);}});}}]),e}(c.default.Embed);e.default=d;},function(t,e,n){Object.defineProperty(e,"__esModule",{value:!0}),e.AlignStyle=e.AlignClass=e.AlignAttribute=void 0;var r=n(0),o=function(t){return t&&t.__esModule?t:{default:t}}(r),i={scope:o.default.Scope.BLOCK,whitelist:["right","center","justify"]},l=new o.default.Attributor.Attribute("align","align",i),a=new o.default.Attributor.Class("align","ql-align",i),s=new o.default.Attributor.Style("align","text-align",i);e.AlignAttribute=l,e.AlignClass=a,e.AlignStyle=s;},function(t,e,n){Object.defineProperty(e,"__esModule",{value:!0}),e.BackgroundStyle=e.BackgroundClass=void 0;var r=n(0),o=function(t){return t&&t.__esModule?t:{default:t}}(r),i=n(26),l=new o.default.Attributor.Class("background","ql-bg",{scope:o.default.Scope.INLINE}),a=new i.ColorAttributor("background","background-color",{scope:o.default.Scope.INLINE});e.BackgroundClass=l,e.BackgroundStyle=a;},function(t,e,n){Object.defineProperty(e,"__esModule",{value:!0}),e.DirectionStyle=e.DirectionClass=e.DirectionAttribute=void 0;var r=n(0),o=function(t){return t&&t.__esModule?t:{default:t}}(r),i={scope:o.default.Scope.BLOCK,whitelist:["rtl"]},l=new o.default.Attributor.Attribute("direction","dir",i),a=new o.default.Attributor.Class("direction","ql-direction",i),s=new o.default.Attributor.Style("direction","direction",i);e.DirectionAttribute=l,e.DirectionClass=a,e.DirectionStyle=s;},function(t,e,n){function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function o(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return !e||"object"!=typeof e&&"function"!=typeof e?t:e}function i(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e);}Object.defineProperty(e,"__esModule",{value:!0}),e.FontClass=e.FontStyle=void 0;var l=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r);}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),a=function t(e,n,r){null===e&&(e=Function.prototype);var o=Object.getOwnPropertyDescriptor(e,n);if(void 0===o){var i=Object.getPrototypeOf(e);return null===i?void 0:t(i,n,r)}if("value"in o)return o.value;var l=o.get;if(void 0!==l)return l.call(r)},s=n(0),u=function(t){return t&&t.__esModule?t:{default:t}}(s),c={scope:u.default.Scope.INLINE,whitelist:["serif","monospace"]},f=new u.default.Attributor.Class("font","ql-font",c),h=function(t){function e(){return r(this,e),o(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return i(e,t),l(e,[{key:"value",value:function(t){return a(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"value",this).call(this,t).replace(/["']/g,"")}}]),e}(u.default.Attributor.Style),p=new h("font","font-family",c);e.FontStyle=p,e.FontClass=f;},function(t,e,n){Object.defineProperty(e,"__esModule",{value:!0}),e.SizeStyle=e.SizeClass=void 0;var r=n(0),o=function(t){return t&&t.__esModule?t:{default:t}}(r),i=new o.default.Attributor.Class("size","ql-size",{scope:o.default.Scope.INLINE,whitelist:["small","large","huge"]}),l=new o.default.Attributor.Style("size","font-size",{scope:o.default.Scope.INLINE,whitelist:["10px","18px","32px"]});e.SizeClass=i,e.SizeStyle=l;},function(t,e,n){t.exports={align:{"":n(76),center:n(77),right:n(78),justify:n(79)},background:n(80),blockquote:n(81),bold:n(82),clean:n(83),code:n(58),"code-block":n(58),color:n(84),direction:{"":n(85),rtl:n(86)},float:{center:n(87),full:n(88),left:n(89),right:n(90)},formula:n(91),header:{1:n(92),2:n(93)},italic:n(94),image:n(95),indent:{"+1":n(96),"-1":n(97)},link:n(98),list:{ordered:n(99),bullet:n(100),check:n(101)},script:{sub:n(102),super:n(103)},strike:n(104),underline:n(105),video:n(106)};},function(t,e,n){function r(t){return t&&t.__esModule?t:{default:t}}function o(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function i(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return !e||"object"!=typeof e&&"function"!=typeof e?t:e}function l(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e);}function a(t){var e=t.ops[t.ops.length-1];return null!=e&&(null!=e.insert?"string"==typeof e.insert&&e.insert.endsWith("\n"):null!=e.attributes&&Object.keys(e.attributes).some(function(t){return null!=f.default.query(t,f.default.Scope.BLOCK)}))}function s(t){var e=t.reduce(function(t,e){return t+=e.delete||0},0),n=t.length()-e;return a(t)&&(n-=1),n}Object.defineProperty(e,"__esModule",{value:!0}),e.getLastChangeIndex=e.default=void 0;var u=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r);}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),c=n(0),f=r(c),h=n(5),p=r(h),d=n(9),y=r(d),v=function(t){function e(t,n){o(this,e);var r=i(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t,n));return r.lastRecorded=0,r.ignoreChange=!1,r.clear(),r.quill.on(p.default.events.EDITOR_CHANGE,function(t,e,n,o){t!==p.default.events.TEXT_CHANGE||r.ignoreChange||(r.options.userOnly&&o!==p.default.sources.USER?r.transform(e):r.record(e,n));}),r.quill.keyboard.addBinding({key:"Z",shortKey:!0},r.undo.bind(r)),r.quill.keyboard.addBinding({key:"Z",shortKey:!0,shiftKey:!0},r.redo.bind(r)),/Win/i.test(navigator.platform)&&r.quill.keyboard.addBinding({key:"Y",shortKey:!0},r.redo.bind(r)),r}return l(e,t),u(e,[{key:"change",value:function(t,e){if(0!==this.stack[t].length){var n=this.stack[t].pop();this.stack[e].push(n),this.lastRecorded=0,this.ignoreChange=!0,this.quill.updateContents(n[t],p.default.sources.USER),this.ignoreChange=!1;var r=s(n[t]);this.quill.setSelection(r);}}},{key:"clear",value:function(){this.stack={undo:[],redo:[]};}},{key:"cutoff",value:function(){this.lastRecorded=0;}},{key:"record",value:function(t,e){if(0!==t.ops.length){this.stack.redo=[];var n=this.quill.getContents().diff(e),r=Date.now();if(this.lastRecorded+this.options.delay>r&&this.stack.undo.length>0){var o=this.stack.undo.pop();n=n.compose(o.undo),t=o.redo.compose(t);}else this.lastRecorded=r;this.stack.undo.push({redo:t,undo:n}),this.stack.undo.length>this.options.maxStack&&this.stack.undo.shift();}}},{key:"redo",value:function(){this.change("redo","undo");}},{key:"transform",value:function(t){this.stack.undo.forEach(function(e){e.undo=t.transform(e.undo,!0),e.redo=t.transform(e.redo,!0);}),this.stack.redo.forEach(function(e){e.undo=t.transform(e.undo,!0),e.redo=t.transform(e.redo,!0);});}},{key:"undo",value:function(){this.change("undo","redo");}}]),e}(y.default);v.DEFAULTS={delay:1e3,maxStack:100,userOnly:!1},e.default=v,e.getLastChangeIndex=s;},function(t,e,n){function r(t){return t&&t.__esModule?t:{default:t}}function o(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function i(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return !e||"object"!=typeof e&&"function"!=typeof e?t:e}function l(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e);}function a(t){var e=t.match(/^(?:(https?):\/\/)?(?:(?:www|m)\.)?youtube\.com\/watch.*v=([a-zA-Z0-9_-]+)/)||t.match(/^(?:(https?):\/\/)?(?:(?:www|m)\.)?youtu\.be\/([a-zA-Z0-9_-]+)/);return e?(e[1]||"https")+"://www.youtube.com/embed/"+e[2]+"?showinfo=0":(e=t.match(/^(?:(https?):\/\/)?(?:www\.)?vimeo\.com\/(\d+)/))?(e[1]||"https")+"://player.vimeo.com/video/"+e[2]+"/":t}function s(t,e){var n=arguments.length>2&&void 0!==arguments[2]&&arguments[2];e.forEach(function(e){var r=document.createElement("option");e===n?r.setAttribute("selected","selected"):r.setAttribute("value",e),t.appendChild(r);});}Object.defineProperty(e,"__esModule",{value:!0}),e.default=e.BaseTooltip=void 0;var u=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r);}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),c=function t(e,n,r){null===e&&(e=Function.prototype);var o=Object.getOwnPropertyDescriptor(e,n);if(void 0===o){var i=Object.getPrototypeOf(e);return null===i?void 0:t(i,n,r)}if("value"in o)return o.value;var l=o.get;if(void 0!==l)return l.call(r)},f=n(3),h=r(f),p=n(2),d=r(p),y=n(8),v=r(y),b=n(23),g=r(b),m=n(34),_=r(m),O=n(59),w=r(O),x=n(60),E=r(x),k=n(28),A=r(k),j=n(61),N=r(j),T=[!1,"center","right","justify"],S=["#000000","#e60000","#ff9900","#ffff00","#008a00","#0066cc","#9933ff","#ffffff","#facccc","#ffebcc","#ffffcc","#cce8cc","#cce0f5","#ebd6ff","#bbbbbb","#f06666","#ffc266","#ffff66","#66b966","#66a3e0","#c285ff","#888888","#a10000","#b26b00","#b2b200","#006100","#0047b2","#6b24b2","#444444","#5c0000","#663d00","#666600","#003700","#002966","#3d1466"],P=[!1,"serif","monospace"],q=["1","2","3",!1],C=["small",!1,"large","huge"],L=function(t){function e(t,n){o(this,e);var r=i(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t,n)),l=function e(n){if(!document.body.contains(t.root))return document.body.removeEventListener("click",e);null==r.tooltip||r.tooltip.root.contains(n.target)||document.activeElement===r.tooltip.textbox||r.quill.hasFocus()||r.tooltip.hide(),null!=r.pickers&&r.pickers.forEach(function(t){t.container.contains(n.target)||t.close();});};return t.emitter.listenDOM("click",document.body,l),r}return l(e,t),u(e,[{key:"addModule",value:function(t){var n=c(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"addModule",this).call(this,t);return "toolbar"===t&&this.extendToolbar(n),n}},{key:"buildButtons",value:function(t,e){t.forEach(function(t){(t.getAttribute("class")||"").split(/\s+/).forEach(function(n){if(n.startsWith("ql-")&&(n=n.slice("ql-".length),null!=e[n]))if("direction"===n)t.innerHTML=e[n][""]+e[n].rtl;else if("string"==typeof e[n])t.innerHTML=e[n];else {var r=t.value||"";null!=r&&e[n][r]&&(t.innerHTML=e[n][r]);}});});}},{key:"buildPickers",value:function(t,e){var n=this;this.pickers=t.map(function(t){if(t.classList.contains("ql-align"))return null==t.querySelector("option")&&s(t,T),new E.default(t,e.align);if(t.classList.contains("ql-background")||t.classList.contains("ql-color")){var n=t.classList.contains("ql-background")?"background":"color";return null==t.querySelector("option")&&s(t,S,"background"===n?"#ffffff":"#000000"),new w.default(t,e[n])}return null==t.querySelector("option")&&(t.classList.contains("ql-font")?s(t,P):t.classList.contains("ql-header")?s(t,q):t.classList.contains("ql-size")&&s(t,C)),new A.default(t)});var r=function(){n.pickers.forEach(function(t){t.update();});};this.quill.on(v.default.events.EDITOR_CHANGE,r);}}]),e}(_.default);L.DEFAULTS=(0, h.default)(!0,{},_.default.DEFAULTS,{modules:{toolbar:{handlers:{formula:function(){this.quill.theme.tooltip.edit("formula");},image:function(){var t=this,e=this.container.querySelector("input.ql-image[type=file]");null==e&&(e=document.createElement("input"),e.setAttribute("type","file"),e.setAttribute("accept","image/png, image/gif, image/jpeg, image/bmp, image/x-icon"),e.classList.add("ql-image"),e.addEventListener("change",function(){if(null!=e.files&&null!=e.files[0]){var n=new FileReader;n.onload=function(n){var r=t.quill.getSelection(!0);t.quill.updateContents((new d.default).retain(r.index).delete(r.length).insert({image:n.target.result}),v.default.sources.USER),t.quill.setSelection(r.index+1,v.default.sources.SILENT),e.value="";},n.readAsDataURL(e.files[0]);}}),this.container.appendChild(e)),e.click();},video:function(){this.quill.theme.tooltip.edit("video");}}}}});var R=function(t){function e(t,n){o(this,e);var r=i(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t,n));return r.textbox=r.root.querySelector('input[type="text"]'),r.listen(),r}return l(e,t),u(e,[{key:"listen",value:function(){var t=this;this.textbox.addEventListener("keydown",function(e){g.default.match(e,"enter")?(t.save(),e.preventDefault()):g.default.match(e,"escape")&&(t.cancel(),e.preventDefault());});}},{key:"cancel",value:function(){this.hide();}},{key:"edit",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"link",e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;this.root.classList.remove("ql-hidden"),this.root.classList.add("ql-editing"),null!=e?this.textbox.value=e:t!==this.root.getAttribute("data-mode")&&(this.textbox.value=""),this.position(this.quill.getBounds(this.quill.selection.savedRange)),this.textbox.select(),this.textbox.setAttribute("placeholder",this.textbox.getAttribute("data-"+t)||""),this.root.setAttribute("data-mode",t);}},{key:"restoreFocus",value:function(){var t=this.quill.scrollingContainer.scrollTop;this.quill.focus(),this.quill.scrollingContainer.scrollTop=t;}},{key:"save",value:function(){var t=this.textbox.value;switch(this.root.getAttribute("data-mode")){case"link":var e=this.quill.root.scrollTop;this.linkRange?(this.quill.formatText(this.linkRange,"link",t,v.default.sources.USER),delete this.linkRange):(this.restoreFocus(),this.quill.format("link",t,v.default.sources.USER)),this.quill.root.scrollTop=e;break;case"video":t=a(t);case"formula":if(!t)break;var n=this.quill.getSelection(!0);if(null!=n){var r=n.index+n.length;this.quill.insertEmbed(r,this.root.getAttribute("data-mode"),t,v.default.sources.USER),"formula"===this.root.getAttribute("data-mode")&&this.quill.insertText(r+1," ",v.default.sources.USER),this.quill.setSelection(r+2,v.default.sources.USER);}}this.textbox.value="",this.hide();}}]),e}(N.default);e.BaseTooltip=R,e.default=L;},function(t,e,n){Object.defineProperty(e,"__esModule",{value:!0});var r=function(){function t(){this.head=this.tail=null,this.length=0;}return t.prototype.append=function(){for(var t=[],e=0;e<arguments.length;e++)t[e]=arguments[e];this.insertBefore(t[0],null),t.length>1&&this.append.apply(this,t.slice(1));},t.prototype.contains=function(t){for(var e,n=this.iterator();e=n();)if(e===t)return !0;return !1},t.prototype.insertBefore=function(t,e){t&&(t.next=e,null!=e?(t.prev=e.prev,null!=e.prev&&(e.prev.next=t),e.prev=t,e===this.head&&(this.head=t)):null!=this.tail?(this.tail.next=t,t.prev=this.tail,this.tail=t):(t.prev=null,this.head=this.tail=t),this.length+=1);},t.prototype.offset=function(t){for(var e=0,n=this.head;null!=n;){if(n===t)return e;e+=n.length(),n=n.next;}return -1},t.prototype.remove=function(t){this.contains(t)&&(null!=t.prev&&(t.prev.next=t.next),null!=t.next&&(t.next.prev=t.prev),t===this.head&&(this.head=t.next),t===this.tail&&(this.tail=t.prev),this.length-=1);},t.prototype.iterator=function(t){return void 0===t&&(t=this.head),function(){var e=t;return null!=t&&(t=t.next),e}},t.prototype.find=function(t,e){void 0===e&&(e=!1);for(var n,r=this.iterator();n=r();){var o=n.length();if(t<o||e&&t===o&&(null==n.next||0!==n.next.length()))return [n,t];t-=o;}return [null,0]},t.prototype.forEach=function(t){for(var e,n=this.iterator();e=n();)t(e);},t.prototype.forEachAt=function(t,e,n){if(!(e<=0))for(var r,o=this.find(t),i=o[0],l=o[1],a=t-l,s=this.iterator(i);(r=s())&&a<t+e;){var u=r.length();t>a?n(r,t-a,Math.min(e,a+u-t)):n(r,0,Math.min(u,t+e-a)),a+=u;}},t.prototype.map=function(t){return this.reduce(function(e,n){return e.push(t(n)),e},[])},t.prototype.reduce=function(t,e){for(var n,r=this.iterator();n=r();)e=t(e,n);return e},t}();e.default=r;},function(t,e,n){var r=this&&this.__extends||function(){var t=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e;}||function(t,e){for(var n in e)e.hasOwnProperty(n)&&(t[n]=e[n]);};return function(e,n){function r(){this.constructor=e;}t(e,n),e.prototype=null===n?Object.create(n):(r.prototype=n.prototype,new r);}}();Object.defineProperty(e,"__esModule",{value:!0});var o=n(17),i=n(1),l={attributes:!0,characterData:!0,characterDataOldValue:!0,childList:!0,subtree:!0},a=function(t){function e(e){var n=t.call(this,e)||this;return n.scroll=n,n.observer=new MutationObserver(function(t){n.update(t);}),n.observer.observe(n.domNode,l),n.attach(),n}return r(e,t),e.prototype.detach=function(){t.prototype.detach.call(this),this.observer.disconnect();},e.prototype.deleteAt=function(e,n){this.update(),0===e&&n===this.length()?this.children.forEach(function(t){t.remove();}):t.prototype.deleteAt.call(this,e,n);},e.prototype.formatAt=function(e,n,r,o){this.update(),t.prototype.formatAt.call(this,e,n,r,o);},e.prototype.insertAt=function(e,n,r){this.update(),t.prototype.insertAt.call(this,e,n,r);},e.prototype.optimize=function(e,n){var r=this;void 0===e&&(e=[]),void 0===n&&(n={}),t.prototype.optimize.call(this,n);for(var l=[].slice.call(this.observer.takeRecords());l.length>0;)e.push(l.pop());for(var a=function(t,e){void 0===e&&(e=!0),null!=t&&t!==r&&null!=t.domNode.parentNode&&(null==t.domNode[i.DATA_KEY].mutations&&(t.domNode[i.DATA_KEY].mutations=[]),e&&a(t.parent));},s=function(t){null!=t.domNode[i.DATA_KEY]&&null!=t.domNode[i.DATA_KEY].mutations&&(t instanceof o.default&&t.children.forEach(s),t.optimize(n));},u=e,c=0;u.length>0;c+=1){if(c>=100)throw new Error("[Parchment] Maximum optimize iterations reached");for(u.forEach(function(t){var e=i.find(t.target,!0);null!=e&&(e.domNode===t.target&&("childList"===t.type?(a(i.find(t.previousSibling,!1)),[].forEach.call(t.addedNodes,function(t){var e=i.find(t,!1);a(e,!1),e instanceof o.default&&e.children.forEach(function(t){a(t,!1);});})):"attributes"===t.type&&a(e.prev)),a(e));}),this.children.forEach(s),u=[].slice.call(this.observer.takeRecords()),l=u.slice();l.length>0;)e.push(l.pop());}},e.prototype.update=function(e,n){var r=this;void 0===n&&(n={}),e=e||this.observer.takeRecords(),e.map(function(t){var e=i.find(t.target,!0);return null==e?null:null==e.domNode[i.DATA_KEY].mutations?(e.domNode[i.DATA_KEY].mutations=[t],e):(e.domNode[i.DATA_KEY].mutations.push(t),null)}).forEach(function(t){null!=t&&t!==r&&null!=t.domNode[i.DATA_KEY]&&t.update(t.domNode[i.DATA_KEY].mutations||[],n);}),null!=this.domNode[i.DATA_KEY].mutations&&t.prototype.update.call(this,this.domNode[i.DATA_KEY].mutations,n),this.optimize(e,n);},e.blotName="scroll",e.defaultChild="block",e.scope=i.Scope.BLOCK_BLOT,e.tagName="DIV",e}(o.default);e.default=a;},function(t,e,n){function r(t,e){if(Object.keys(t).length!==Object.keys(e).length)return !1;for(var n in t)if(t[n]!==e[n])return !1;return !0}var o=this&&this.__extends||function(){var t=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e;}||function(t,e){for(var n in e)e.hasOwnProperty(n)&&(t[n]=e[n]);};return function(e,n){function r(){this.constructor=e;}t(e,n),e.prototype=null===n?Object.create(n):(r.prototype=n.prototype,new r);}}();Object.defineProperty(e,"__esModule",{value:!0});var i=n(18),l=n(1),a=function(t){function e(){return null!==t&&t.apply(this,arguments)||this}return o(e,t),e.formats=function(n){if(n.tagName!==e.tagName)return t.formats.call(this,n)},e.prototype.format=function(n,r){var o=this;n!==this.statics.blotName||r?t.prototype.format.call(this,n,r):(this.children.forEach(function(t){t instanceof i.default||(t=t.wrap(e.blotName,!0)),o.attributes.copy(t);}),this.unwrap());},e.prototype.formatAt=function(e,n,r,o){if(null!=this.formats()[r]||l.query(r,l.Scope.ATTRIBUTE)){this.isolate(e,n).format(r,o);}else t.prototype.formatAt.call(this,e,n,r,o);},e.prototype.optimize=function(n){t.prototype.optimize.call(this,n);var o=this.formats();if(0===Object.keys(o).length)return this.unwrap();var i=this.next;i instanceof e&&i.prev===this&&r(o,i.formats())&&(i.moveChildren(this),i.remove());},e.blotName="inline",e.scope=l.Scope.INLINE_BLOT,e.tagName="SPAN",e}(i.default);e.default=a;},function(t,e,n){var r=this&&this.__extends||function(){var t=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e;}||function(t,e){for(var n in e)e.hasOwnProperty(n)&&(t[n]=e[n]);};return function(e,n){function r(){this.constructor=e;}t(e,n),e.prototype=null===n?Object.create(n):(r.prototype=n.prototype,new r);}}();Object.defineProperty(e,"__esModule",{value:!0});var o=n(18),i=n(1),l=function(t){function e(){return null!==t&&t.apply(this,arguments)||this}return r(e,t),e.formats=function(n){var r=i.query(e.blotName).tagName;if(n.tagName!==r)return t.formats.call(this,n)},e.prototype.format=function(n,r){null!=i.query(n,i.Scope.BLOCK)&&(n!==this.statics.blotName||r?t.prototype.format.call(this,n,r):this.replaceWith(e.blotName));},e.prototype.formatAt=function(e,n,r,o){null!=i.query(r,i.Scope.BLOCK)?this.format(r,o):t.prototype.formatAt.call(this,e,n,r,o);},e.prototype.insertAt=function(e,n,r){if(null==r||null!=i.query(n,i.Scope.INLINE))t.prototype.insertAt.call(this,e,n,r);else {var o=this.split(e),l=i.create(n,r);o.parent.insertBefore(l,o);}},e.prototype.update=function(e,n){navigator.userAgent.match(/Trident/)?this.build():t.prototype.update.call(this,e,n);},e.blotName="block",e.scope=i.Scope.BLOCK_BLOT,e.tagName="P",e}(o.default);e.default=l;},function(t,e,n){var r=this&&this.__extends||function(){var t=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e;}||function(t,e){for(var n in e)e.hasOwnProperty(n)&&(t[n]=e[n]);};return function(e,n){function r(){this.constructor=e;}t(e,n),e.prototype=null===n?Object.create(n):(r.prototype=n.prototype,new r);}}();Object.defineProperty(e,"__esModule",{value:!0});var o=n(19),i=function(t){function e(){return null!==t&&t.apply(this,arguments)||this}return r(e,t),e.formats=function(t){},e.prototype.format=function(e,n){t.prototype.formatAt.call(this,0,this.length(),e,n);},e.prototype.formatAt=function(e,n,r,o){0===e&&n===this.length()?this.format(r,o):t.prototype.formatAt.call(this,e,n,r,o);},e.prototype.formats=function(){return this.statics.formats(this.domNode)},e}(o.default);e.default=i;},function(t,e,n){var r=this&&this.__extends||function(){var t=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e;}||function(t,e){for(var n in e)e.hasOwnProperty(n)&&(t[n]=e[n]);};return function(e,n){function r(){this.constructor=e;}t(e,n),e.prototype=null===n?Object.create(n):(r.prototype=n.prototype,new r);}}();Object.defineProperty(e,"__esModule",{value:!0});var o=n(19),i=n(1),l=function(t){function e(e){var n=t.call(this,e)||this;return n.text=n.statics.value(n.domNode),n}return r(e,t),e.create=function(t){return document.createTextNode(t)},e.value=function(t){var e=t.data;return e.normalize&&(e=e.normalize()),e},e.prototype.deleteAt=function(t,e){this.domNode.data=this.text=this.text.slice(0,t)+this.text.slice(t+e);},e.prototype.index=function(t,e){return this.domNode===t?e:-1},e.prototype.insertAt=function(e,n,r){null==r?(this.text=this.text.slice(0,e)+n+this.text.slice(e),this.domNode.data=this.text):t.prototype.insertAt.call(this,e,n,r);},e.prototype.length=function(){return this.text.length},e.prototype.optimize=function(n){t.prototype.optimize.call(this,n),this.text=this.statics.value(this.domNode),0===this.text.length?this.remove():this.next instanceof e&&this.next.prev===this&&(this.insertAt(this.length(),this.next.value()),this.next.remove());},e.prototype.position=function(t,e){return [this.domNode,t]},e.prototype.split=function(t,e){if(void 0===e&&(e=!1),!e){if(0===t)return this;if(t===this.length())return this.next}var n=i.create(this.domNode.splitText(t));return this.parent.insertBefore(n,this.next),this.text=this.statics.value(this.domNode),n},e.prototype.update=function(t,e){var n=this;t.some(function(t){return "characterData"===t.type&&t.target===n.domNode})&&(this.text=this.statics.value(this.domNode));},e.prototype.value=function(){return this.text},e.blotName="text",e.scope=i.Scope.INLINE_BLOT,e}(o.default);e.default=l;},function(t,e,n){var r=document.createElement("div");if(r.classList.toggle("test-class",!1),r.classList.contains("test-class")){var o=DOMTokenList.prototype.toggle;DOMTokenList.prototype.toggle=function(t,e){return arguments.length>1&&!this.contains(t)==!e?e:o.call(this,t)};}String.prototype.startsWith||(String.prototype.startsWith=function(t,e){return e=e||0,this.substr(e,t.length)===t}),String.prototype.endsWith||(String.prototype.endsWith=function(t,e){var n=this.toString();("number"!=typeof e||!isFinite(e)||Math.floor(e)!==e||e>n.length)&&(e=n.length),e-=t.length;var r=n.indexOf(t,e);return -1!==r&&r===e}),Array.prototype.find||Object.defineProperty(Array.prototype,"find",{value:function(t){if(null===this)throw new TypeError("Array.prototype.find called on null or undefined");if("function"!=typeof t)throw new TypeError("predicate must be a function");for(var e,n=Object(this),r=n.length>>>0,o=arguments[1],i=0;i<r;i++)if(e=n[i],t.call(o,e,i,n))return e}}),document.addEventListener("DOMContentLoaded",function(){document.execCommand("enableObjectResizing",!1,!1),document.execCommand("autoUrlDetect",!1,!1);});},function(t,e){function n(t,e,n){if(t==e)return t?[[v,t]]:[];(n<0||t.length<n)&&(n=null);var o=l(t,e),i=t.substring(0,o);t=t.substring(o),e=e.substring(o),o=a(t,e);var s=t.substring(t.length-o);t=t.substring(0,t.length-o),e=e.substring(0,e.length-o);var c=r(t,e);return i&&c.unshift([v,i]),s&&c.push([v,s]),u(c),null!=n&&(c=f(c,n)),c=h(c)}function r(t,e){var r;if(!t)return [[y,e]];if(!e)return [[d,t]];var i=t.length>e.length?t:e,l=t.length>e.length?e:t,a=i.indexOf(l);if(-1!=a)return r=[[y,i.substring(0,a)],[v,l],[y,i.substring(a+l.length)]],t.length>e.length&&(r[0][0]=r[2][0]=d),r;if(1==l.length)return [[d,t],[y,e]];var u=s(t,e);if(u){var c=u[0],f=u[1],h=u[2],p=u[3],b=u[4],g=n(c,h),m=n(f,p);return g.concat([[v,b]],m)}return o(t,e)}function o(t,e){for(var n=t.length,r=e.length,o=Math.ceil((n+r)/2),l=o,a=2*o,s=new Array(a),u=new Array(a),c=0;c<a;c++)s[c]=-1,u[c]=-1;s[l+1]=0,u[l+1]=0;for(var f=n-r,h=f%2!=0,p=0,v=0,b=0,g=0,m=0;m<o;m++){for(var _=-m+p;_<=m-v;_+=2){var O,w=l+_;O=_==-m||_!=m&&s[w-1]<s[w+1]?s[w+1]:s[w-1]+1;for(var x=O-_;O<n&&x<r&&t.charAt(O)==e.charAt(x);)O++,x++;if(s[w]=O,O>n)v+=2;else if(x>r)p+=2;else if(h){var E=l+f-_;if(E>=0&&E<a&&-1!=u[E]){var k=n-u[E];if(O>=k)return i(t,e,O,x)}}}for(var A=-m+b;A<=m-g;A+=2){var k,E=l+A;k=A==-m||A!=m&&u[E-1]<u[E+1]?u[E+1]:u[E-1]+1;for(var j=k-A;k<n&&j<r&&t.charAt(n-k-1)==e.charAt(r-j-1);)k++,j++;if(u[E]=k,k>n)g+=2;else if(j>r)b+=2;else if(!h){var w=l+f-A;if(w>=0&&w<a&&-1!=s[w]){var O=s[w],x=l+O-w;if(k=n-k,O>=k)return i(t,e,O,x)}}}}return [[d,t],[y,e]]}function i(t,e,r,o){var i=t.substring(0,r),l=e.substring(0,o),a=t.substring(r),s=e.substring(o),u=n(i,l),c=n(a,s);return u.concat(c)}function l(t,e){if(!t||!e||t.charAt(0)!=e.charAt(0))return 0;for(var n=0,r=Math.min(t.length,e.length),o=r,i=0;n<o;)t.substring(i,o)==e.substring(i,o)?(n=o,i=n):r=o,o=Math.floor((r-n)/2+n);return o}function a(t,e){if(!t||!e||t.charAt(t.length-1)!=e.charAt(e.length-1))return 0;for(var n=0,r=Math.min(t.length,e.length),o=r,i=0;n<o;)t.substring(t.length-o,t.length-i)==e.substring(e.length-o,e.length-i)?(n=o,i=n):r=o,o=Math.floor((r-n)/2+n);return o}function s(t,e){function n(t,e,n){for(var r,o,i,s,u=t.substring(n,n+Math.floor(t.length/4)),c=-1,f="";-1!=(c=e.indexOf(u,c+1));){var h=l(t.substring(n),e.substring(c)),p=a(t.substring(0,n),e.substring(0,c));f.length<p+h&&(f=e.substring(c-p,c)+e.substring(c,c+h),r=t.substring(0,n-p),o=t.substring(n+h),i=e.substring(0,c-p),s=e.substring(c+h));}return 2*f.length>=t.length?[r,o,i,s,f]:null}var r=t.length>e.length?t:e,o=t.length>e.length?e:t;if(r.length<4||2*o.length<r.length)return null;var i,s=n(r,o,Math.ceil(r.length/4)),u=n(r,o,Math.ceil(r.length/2));if(!s&&!u)return null;i=u?s&&s[4].length>u[4].length?s:u:s;var c,f,h,p;return t.length>e.length?(c=i[0],f=i[1],h=i[2],p=i[3]):(h=i[0],p=i[1],c=i[2],f=i[3]),[c,f,h,p,i[4]]}function u(t){t.push([v,""]);for(var e,n=0,r=0,o=0,i="",s="";n<t.length;)switch(t[n][0]){case y:o++,s+=t[n][1],n++;break;case d:r++,i+=t[n][1],n++;break;case v:r+o>1?(0!==r&&0!==o&&(e=l(s,i),0!==e&&(n-r-o>0&&t[n-r-o-1][0]==v?t[n-r-o-1][1]+=s.substring(0,e):(t.splice(0,0,[v,s.substring(0,e)]),n++),s=s.substring(e),i=i.substring(e)),0!==(e=a(s,i))&&(t[n][1]=s.substring(s.length-e)+t[n][1],s=s.substring(0,s.length-e),i=i.substring(0,i.length-e))),0===r?t.splice(n-o,r+o,[y,s]):0===o?t.splice(n-r,r+o,[d,i]):t.splice(n-r-o,r+o,[d,i],[y,s]),n=n-r-o+(r?1:0)+(o?1:0)+1):0!==n&&t[n-1][0]==v?(t[n-1][1]+=t[n][1],t.splice(n,1)):n++,o=0,r=0,i="",s="";}""===t[t.length-1][1]&&t.pop();var c=!1;for(n=1;n<t.length-1;)t[n-1][0]==v&&t[n+1][0]==v&&(t[n][1].substring(t[n][1].length-t[n-1][1].length)==t[n-1][1]?(t[n][1]=t[n-1][1]+t[n][1].substring(0,t[n][1].length-t[n-1][1].length),t[n+1][1]=t[n-1][1]+t[n+1][1],t.splice(n-1,1),c=!0):t[n][1].substring(0,t[n+1][1].length)==t[n+1][1]&&(t[n-1][1]+=t[n+1][1],t[n][1]=t[n][1].substring(t[n+1][1].length)+t[n+1][1],t.splice(n+1,1),c=!0)),n++;c&&u(t);}function c(t,e){if(0===e)return [v,t];for(var n=0,r=0;r<t.length;r++){var o=t[r];if(o[0]===d||o[0]===v){var i=n+o[1].length;if(e===i)return [r+1,t];if(e<i){t=t.slice();var l=e-n,a=[o[0],o[1].slice(0,l)],s=[o[0],o[1].slice(l)];return t.splice(r,1,a,s),[r+1,t]}n=i;}}throw new Error("cursor_pos is out of bounds!")}function f(t,e){var n=c(t,e),r=n[1],o=n[0],i=r[o],l=r[o+1];if(null==i)return t;if(i[0]!==v)return t;if(null!=l&&i[1]+l[1]===l[1]+i[1])return r.splice(o,2,l,i),p(r,o,2);if(null!=l&&0===l[1].indexOf(i[1])){r.splice(o,2,[l[0],i[1]],[0,i[1]]);var a=l[1].slice(i[1].length);return a.length>0&&r.splice(o+2,0,[l[0],a]),p(r,o,3)}return t}function h(t){for(var e=!1,n=function(t){return t.charCodeAt(0)>=56320&&t.charCodeAt(0)<=57343},r=2;r<t.length;r+=1)t[r-2][0]===v&&function(t){return t.charCodeAt(t.length-1)>=55296&&t.charCodeAt(t.length-1)<=56319}(t[r-2][1])&&t[r-1][0]===d&&n(t[r-1][1])&&t[r][0]===y&&n(t[r][1])&&(e=!0,t[r-1][1]=t[r-2][1].slice(-1)+t[r-1][1],t[r][1]=t[r-2][1].slice(-1)+t[r][1],t[r-2][1]=t[r-2][1].slice(0,-1));if(!e)return t;for(var o=[],r=0;r<t.length;r+=1)t[r][1].length>0&&o.push(t[r]);return o}function p(t,e,n){for(var r=e+n-1;r>=0&&r>=e-1;r--)if(r+1<t.length){var o=t[r],i=t[r+1];o[0]===i[1]&&t.splice(r,2,[o[0],o[1]+i[1]]);}return t}var d=-1,y=1,v=0,b=n;b.INSERT=y,b.DELETE=d,b.EQUAL=v,t.exports=b;},function(t,e){function n(t){var e=[];for(var n in t)e.push(n);return e}e=t.exports="function"==typeof Object.keys?Object.keys:n,e.shim=n;},function(t,e){function n(t){return "[object Arguments]"==Object.prototype.toString.call(t)}function r(t){return t&&"object"==typeof t&&"number"==typeof t.length&&Object.prototype.hasOwnProperty.call(t,"callee")&&!Object.prototype.propertyIsEnumerable.call(t,"callee")||!1}var o="[object Arguments]"==function(){return Object.prototype.toString.call(arguments)}();e=t.exports=o?n:r,e.supported=n,e.unsupported=r;},function(t,e){function n(){}function r(t,e,n){this.fn=t,this.context=e,this.once=n||!1;}function o(){this._events=new n,this._eventsCount=0;}var i=Object.prototype.hasOwnProperty,l="~";Object.create&&(n.prototype=Object.create(null),(new n).__proto__||(l=!1)),o.prototype.eventNames=function(){var t,e,n=[];if(0===this._eventsCount)return n;for(e in t=this._events)i.call(t,e)&&n.push(l?e.slice(1):e);return Object.getOwnPropertySymbols?n.concat(Object.getOwnPropertySymbols(t)):n},o.prototype.listeners=function(t,e){var n=l?l+t:t,r=this._events[n];if(e)return !!r;if(!r)return [];if(r.fn)return [r.fn];for(var o=0,i=r.length,a=new Array(i);o<i;o++)a[o]=r[o].fn;return a},o.prototype.emit=function(t,e,n,r,o,i){var a=l?l+t:t;if(!this._events[a])return !1;var s,u,c=this._events[a],f=arguments.length;if(c.fn){switch(c.once&&this.removeListener(t,c.fn,void 0,!0),f){case 1:return c.fn.call(c.context),!0;case 2:return c.fn.call(c.context,e),!0;case 3:return c.fn.call(c.context,e,n),!0;case 4:return c.fn.call(c.context,e,n,r),!0;case 5:return c.fn.call(c.context,e,n,r,o),!0;case 6:return c.fn.call(c.context,e,n,r,o,i),!0}for(u=1,s=new Array(f-1);u<f;u++)s[u-1]=arguments[u];c.fn.apply(c.context,s);}else {var h,p=c.length;for(u=0;u<p;u++)switch(c[u].once&&this.removeListener(t,c[u].fn,void 0,!0),f){case 1:c[u].fn.call(c[u].context);break;case 2:c[u].fn.call(c[u].context,e);break;case 3:c[u].fn.call(c[u].context,e,n);break;case 4:c[u].fn.call(c[u].context,e,n,r);break;default:if(!s)for(h=1,s=new Array(f-1);h<f;h++)s[h-1]=arguments[h];c[u].fn.apply(c[u].context,s);}}return !0},o.prototype.on=function(t,e,n){var o=new r(e,n||this),i=l?l+t:t;return this._events[i]?this._events[i].fn?this._events[i]=[this._events[i],o]:this._events[i].push(o):(this._events[i]=o,this._eventsCount++),this},o.prototype.once=function(t,e,n){var o=new r(e,n||this,!0),i=l?l+t:t;return this._events[i]?this._events[i].fn?this._events[i]=[this._events[i],o]:this._events[i].push(o):(this._events[i]=o,this._eventsCount++),this},o.prototype.removeListener=function(t,e,r,o){var i=l?l+t:t;if(!this._events[i])return this;if(!e)return 0==--this._eventsCount?this._events=new n:delete this._events[i],this;var a=this._events[i];if(a.fn)a.fn!==e||o&&!a.once||r&&a.context!==r||(0==--this._eventsCount?this._events=new n:delete this._events[i]);else {for(var s=0,u=[],c=a.length;s<c;s++)(a[s].fn!==e||o&&!a[s].once||r&&a[s].context!==r)&&u.push(a[s]);u.length?this._events[i]=1===u.length?u[0]:u:0==--this._eventsCount?this._events=new n:delete this._events[i];}return this},o.prototype.removeAllListeners=function(t){var e;return t?(e=l?l+t:t,this._events[e]&&(0==--this._eventsCount?this._events=new n:delete this._events[e])):(this._events=new n,this._eventsCount=0),this},o.prototype.off=o.prototype.removeListener,o.prototype.addListener=o.prototype.on,o.prototype.setMaxListeners=function(){return this},o.prefixed=l,o.EventEmitter=o,void 0!==t&&(t.exports=o);},function(t,e,n){function r(t){return t&&t.__esModule?t:{default:t}}function o(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}function i(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function l(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return !e||"object"!=typeof e&&"function"!=typeof e?t:e}function a(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e);}function s(t,e,n){return "object"===(void 0===e?"undefined":x(e))?Object.keys(e).reduce(function(t,n){return s(t,n,e[n])},t):t.reduce(function(t,r){return r.attributes&&r.attributes[e]?t.push(r):t.insert(r.insert,(0, j.default)({},o({},e,n),r.attributes))},new T.default)}function u(t){if(t.nodeType!==Node.ELEMENT_NODE)return {};return t["__ql-computed-style"]||(t["__ql-computed-style"]=window.getComputedStyle(t))}function c(t,e){for(var n="",r=t.ops.length-1;r>=0&&n.length<e.length;--r){var o=t.ops[r];if("string"!=typeof o.insert)break;n=o.insert+n;}return n.slice(-1*e.length)===e}function f(t){return 0!==t.childNodes.length&&["block","list-item"].indexOf(u(t).display)>-1}function h(t,e,n){return t.nodeType===t.TEXT_NODE?n.reduce(function(e,n){return n(t,e)},new T.default):t.nodeType===t.ELEMENT_NODE?[].reduce.call(t.childNodes||[],function(r,o){var i=h(o,e,n);return o.nodeType===t.ELEMENT_NODE&&(i=e.reduce(function(t,e){return e(o,t)},i),i=(o[W]||[]).reduce(function(t,e){return e(o,t)},i)),r.concat(i)},new T.default):new T.default}function p(t,e,n){return s(n,t,!0)}function d(t,e){var n=P.default.Attributor.Attribute.keys(t),r=P.default.Attributor.Class.keys(t),o=P.default.Attributor.Style.keys(t),i={};return n.concat(r).concat(o).forEach(function(e){var n=P.default.query(e,P.default.Scope.ATTRIBUTE);null!=n&&(i[n.attrName]=n.value(t),i[n.attrName])||(n=G[e],null==n||n.attrName!==e&&n.keyName!==e||(i[n.attrName]=n.value(t)||void 0),null==(n=X[e])||n.attrName!==e&&n.keyName!==e||(n=X[e],i[n.attrName]=n.value(t)||void 0));}),Object.keys(i).length>0&&(e=s(e,i)),e}function y(t,e){var n=P.default.query(t);if(null==n)return e;if(n.prototype instanceof P.default.Embed){var r={},o=n.value(t);null!=o&&(r[n.blotName]=o,e=(new T.default).insert(r,n.formats(t)));}else "function"==typeof n.formats&&(e=s(e,n.blotName,n.formats(t)));return e}function v(t,e){return c(e,"\n")||e.insert("\n"),e}function b(){return new T.default}function g(t,e){var n=P.default.query(t);if(null==n||"list-item"!==n.blotName||!c(e,"\n"))return e;for(var r=-1,o=t.parentNode;!o.classList.contains("ql-clipboard");)"list"===(P.default.query(o)||{}).blotName&&(r+=1),o=o.parentNode;return r<=0?e:e.compose((new T.default).retain(e.length()-1).retain(1,{indent:r}))}function m(t,e){return c(e,"\n")||(f(t)||e.length()>0&&t.nextSibling&&f(t.nextSibling))&&e.insert("\n"),e}function _(t,e){if(f(t)&&null!=t.nextElementSibling&&!c(e,"\n\n")){var n=t.offsetHeight+parseFloat(u(t).marginTop)+parseFloat(u(t).marginBottom);t.nextElementSibling.offsetTop>t.offsetTop+1.5*n&&e.insert("\n");}return e}function O(t,e){var n={},r=t.style||{};return r.fontStyle&&"italic"===u(t).fontStyle&&(n.italic=!0),r.fontWeight&&(u(t).fontWeight.startsWith("bold")||parseInt(u(t).fontWeight)>=700)&&(n.bold=!0),Object.keys(n).length>0&&(e=s(e,n)),parseFloat(r.textIndent||0)>0&&(e=(new T.default).insert("\t").concat(e)),e}function w(t,e){var n=t.data;if("O:P"===t.parentNode.tagName)return e.insert(n.trim());if(0===n.trim().length&&t.parentNode.classList.contains("ql-clipboard"))return e;if(!u(t.parentNode).whiteSpace.startsWith("pre")){var r=function(t,e){return e=e.replace(/[^\u00a0]/g,""),e.length<1&&t?" ":e};n=n.replace(/\r\n/g," ").replace(/\n/g," "),n=n.replace(/\s\s+/g,r.bind(r,!0)),(null==t.previousSibling&&f(t.parentNode)||null!=t.previousSibling&&f(t.previousSibling))&&(n=n.replace(/^\s+/,r.bind(r,!1))),(null==t.nextSibling&&f(t.parentNode)||null!=t.nextSibling&&f(t.nextSibling))&&(n=n.replace(/\s+$/,r.bind(r,!1)));}return e.insert(n)}Object.defineProperty(e,"__esModule",{value:!0}),e.matchText=e.matchSpacing=e.matchNewline=e.matchBlot=e.matchAttributor=e.default=void 0;var x="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},E=function(){function t(t,e){var n=[],r=!0,o=!1,i=void 0;try{for(var l,a=t[Symbol.iterator]();!(r=(l=a.next()).done)&&(n.push(l.value),!e||n.length!==e);r=!0);}catch(t){o=!0,i=t;}finally{try{!r&&a.return&&a.return();}finally{if(o)throw i}}return n}return function(e,n){if(Array.isArray(e))return e;if(Symbol.iterator in Object(e))return t(e,n);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}(),k=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r);}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),A=n(3),j=r(A),N=n(2),T=r(N),S=n(0),P=r(S),q=n(5),C=r(q),L=n(10),R=r(L),M=n(9),B=r(M),I=n(36),D=n(37),U=n(13),F=r(U),z=n(26),H=n(38),K=n(39),Y=n(40),V=(0, R.default)("quill:clipboard"),W="__ql-matcher",Z=[[Node.TEXT_NODE,w],[Node.TEXT_NODE,m],["br",v],[Node.ELEMENT_NODE,m],[Node.ELEMENT_NODE,y],[Node.ELEMENT_NODE,_],[Node.ELEMENT_NODE,d],[Node.ELEMENT_NODE,O],["li",g],["b",p.bind(p,"bold")],["i",p.bind(p,"italic")],["style",b]],G=[I.AlignAttribute,H.DirectionAttribute].reduce(function(t,e){return t[e.keyName]=e,t},{}),X=[I.AlignStyle,D.BackgroundStyle,z.ColorStyle,H.DirectionStyle,K.FontStyle,Y.SizeStyle].reduce(function(t,e){return t[e.keyName]=e,t},{}),$=function(t){function e(t,n){i(this,e);var r=l(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t,n));return r.quill.root.addEventListener("paste",r.onPaste.bind(r)),r.container=r.quill.addContainer("ql-clipboard"),r.container.setAttribute("contenteditable",!0),r.container.setAttribute("tabindex",-1),r.matchers=[],Z.concat(r.options.matchers).forEach(function(t){var e=E(t,2),o=e[0],i=e[1];(n.matchVisual||i!==_)&&r.addMatcher(o,i);}),r}return a(e,t),k(e,[{key:"addMatcher",value:function(t,e){this.matchers.push([t,e]);}},{key:"convert",value:function(t){if("string"==typeof t)return this.container.innerHTML=t.replace(/\>\r?\n +\</g,"><"),this.convert();var e=this.quill.getFormat(this.quill.selection.savedRange.index);if(e[F.default.blotName]){var n=this.container.innerText;return this.container.innerHTML="",(new T.default).insert(n,o({},F.default.blotName,e[F.default.blotName]))}var r=this.prepareMatching(),i=E(r,2),l=i[0],a=i[1],s=h(this.container,l,a);return c(s,"\n")&&null==s.ops[s.ops.length-1].attributes&&(s=s.compose((new T.default).retain(s.length()-1).delete(1))),V.log("convert",this.container.innerHTML,s),this.container.innerHTML="",s}},{key:"dangerouslyPasteHTML",value:function(t,e){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:C.default.sources.API;if("string"==typeof t)this.quill.setContents(this.convert(t),e),this.quill.setSelection(0,C.default.sources.SILENT);else {var r=this.convert(e);this.quill.updateContents((new T.default).retain(t).concat(r),n),this.quill.setSelection(t+r.length(),C.default.sources.SILENT);}}},{key:"onPaste",value:function(t){var e=this;if(!t.defaultPrevented&&this.quill.isEnabled()){var n=this.quill.getSelection(),r=(new T.default).retain(n.index),o=this.quill.scrollingContainer.scrollTop;this.container.focus(),this.quill.selection.update(C.default.sources.SILENT),setTimeout(function(){r=r.concat(e.convert()).delete(n.length),e.quill.updateContents(r,C.default.sources.USER),e.quill.setSelection(r.length()-n.length,C.default.sources.SILENT),e.quill.scrollingContainer.scrollTop=o,e.quill.focus();},1);}}},{key:"prepareMatching",value:function(){var t=this,e=[],n=[];return this.matchers.forEach(function(r){var o=E(r,2),i=o[0],l=o[1];switch(i){case Node.TEXT_NODE:n.push(l);break;case Node.ELEMENT_NODE:e.push(l);break;default:[].forEach.call(t.container.querySelectorAll(i),function(t){t[W]=t[W]||[],t[W].push(l);});}}),[e,n]}}]),e}(B.default);$.DEFAULTS={matchers:[],matchVisual:!0},e.default=$,e.matchAttributor=d,e.matchBlot=y,e.matchNewline=m,e.matchSpacing=_,e.matchText=w;},function(t,e,n){function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function o(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return !e||"object"!=typeof e&&"function"!=typeof e?t:e}function i(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e);}Object.defineProperty(e,"__esModule",{value:!0});var l=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r);}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),a=function t(e,n,r){null===e&&(e=Function.prototype);var o=Object.getOwnPropertyDescriptor(e,n);if(void 0===o){var i=Object.getPrototypeOf(e);return null===i?void 0:t(i,n,r)}if("value"in o)return o.value;var l=o.get;if(void 0!==l)return l.call(r)},s=n(6),u=function(t){return t&&t.__esModule?t:{default:t}}(s),c=function(t){function e(){return r(this,e),o(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return i(e,t),l(e,[{key:"optimize",value:function(t){a(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"optimize",this).call(this,t),this.domNode.tagName!==this.statics.tagName[0]&&this.replaceWith(this.statics.blotName);}}],[{key:"create",value:function(){return a(e.__proto__||Object.getPrototypeOf(e),"create",this).call(this)}},{key:"formats",value:function(){return !0}}]),e}(u.default);c.blotName="bold",c.tagName=["STRONG","B"],e.default=c;},function(t,e,n){function r(t){return t&&t.__esModule?t:{default:t}}function o(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}function i(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function l(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return !e||"object"!=typeof e&&"function"!=typeof e?t:e}function a(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e);}function s(t,e,n){var r=document.createElement("button");r.setAttribute("type","button"),r.classList.add("ql-"+e),null!=n&&(r.value=n),t.appendChild(r);}function u(t,e){Array.isArray(e[0])||(e=[e]),e.forEach(function(e){var n=document.createElement("span");n.classList.add("ql-formats"),e.forEach(function(t){if("string"==typeof t)s(n,t);else {var e=Object.keys(t)[0],r=t[e];Array.isArray(r)?c(n,e,r):s(n,e,r);}}),t.appendChild(n);});}function c(t,e,n){var r=document.createElement("select");r.classList.add("ql-"+e),n.forEach(function(t){var e=document.createElement("option");!1!==t?e.setAttribute("value",t):e.setAttribute("selected","selected"),r.appendChild(e);}),t.appendChild(r);}Object.defineProperty(e,"__esModule",{value:!0}),e.addControls=e.default=void 0;var f=function(){function t(t,e){var n=[],r=!0,o=!1,i=void 0;try{for(var l,a=t[Symbol.iterator]();!(r=(l=a.next()).done)&&(n.push(l.value),!e||n.length!==e);r=!0);}catch(t){o=!0,i=t;}finally{try{!r&&a.return&&a.return();}finally{if(o)throw i}}return n}return function(e,n){if(Array.isArray(e))return e;if(Symbol.iterator in Object(e))return t(e,n);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}(),h=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r);}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),p=n(2),d=r(p),y=n(0),v=r(y),b=n(5),g=r(b),m=n(10),_=r(m),O=n(9),w=r(O),x=(0, _.default)("quill:toolbar"),E=function(t){function e(t,n){i(this,e);var r=l(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t,n));if(Array.isArray(r.options.container)){var o=document.createElement("div");u(o,r.options.container),t.container.parentNode.insertBefore(o,t.container),r.container=o;}else "string"==typeof r.options.container?r.container=document.querySelector(r.options.container):r.container=r.options.container;if(!(r.container instanceof HTMLElement)){var a;return a=x.error("Container required for toolbar",r.options),l(r,a)}return r.container.classList.add("ql-toolbar"),r.controls=[],r.handlers={},Object.keys(r.options.handlers).forEach(function(t){r.addHandler(t,r.options.handlers[t]);}),[].forEach.call(r.container.querySelectorAll("button, select"),function(t){r.attach(t);}),r.quill.on(g.default.events.EDITOR_CHANGE,function(t,e){t===g.default.events.SELECTION_CHANGE&&r.update(e);}),r.quill.on(g.default.events.SCROLL_OPTIMIZE,function(){var t=r.quill.selection.getRange(),e=f(t,1),n=e[0];r.update(n);}),r}return a(e,t),h(e,[{key:"addHandler",value:function(t,e){this.handlers[t]=e;}},{key:"attach",value:function(t){var e=this,n=[].find.call(t.classList,function(t){return 0===t.indexOf("ql-")});if(n){if(n=n.slice("ql-".length),"BUTTON"===t.tagName&&t.setAttribute("type","button"),null==this.handlers[n]){if(null!=this.quill.scroll.whitelist&&null==this.quill.scroll.whitelist[n])return void x.warn("ignoring attaching to disabled format",n,t);if(null==v.default.query(n))return void x.warn("ignoring attaching to nonexistent format",n,t)}var r="SELECT"===t.tagName?"change":"click";t.addEventListener(r,function(r){var i=void 0;if("SELECT"===t.tagName){if(t.selectedIndex<0)return;var l=t.options[t.selectedIndex];i=!l.hasAttribute("selected")&&(l.value||!1);}else i=!t.classList.contains("ql-active")&&(t.value||!t.hasAttribute("value")),r.preventDefault();e.quill.focus();var a=e.quill.selection.getRange(),s=f(a,1),u=s[0];if(null!=e.handlers[n])e.handlers[n].call(e,i);else if(v.default.query(n).prototype instanceof v.default.Embed){if(!(i=prompt("Enter "+n)))return;e.quill.updateContents((new d.default).retain(u.index).delete(u.length).insert(o({},n,i)),g.default.sources.USER);}else e.quill.format(n,i,g.default.sources.USER);e.update(u);}),this.controls.push([n,t]);}}},{key:"update",value:function(t){var e=null==t?{}:this.quill.getFormat(t);this.controls.forEach(function(n){var r=f(n,2),o=r[0],i=r[1];if("SELECT"===i.tagName){var l=void 0;if(null==t)l=null;else if(null==e[o])l=i.querySelector("option[selected]");else if(!Array.isArray(e[o])){var a=e[o];"string"==typeof a&&(a=a.replace(/\"/g,'\\"')),l=i.querySelector('option[value="'+a+'"]');}null==l?(i.value="",i.selectedIndex=-1):l.selected=!0;}else if(null==t)i.classList.remove("ql-active");else if(i.hasAttribute("value")){var s=e[o]===i.getAttribute("value")||null!=e[o]&&e[o].toString()===i.getAttribute("value")||null==e[o]&&!i.getAttribute("value");i.classList.toggle("ql-active",s);}else i.classList.toggle("ql-active",null!=e[o]);});}}]),e}(w.default);E.DEFAULTS={},E.DEFAULTS={container:null,handlers:{clean:function(){var t=this,e=this.quill.getSelection();if(null!=e)if(0==e.length){var n=this.quill.getFormat();Object.keys(n).forEach(function(e){null!=v.default.query(e,v.default.Scope.INLINE)&&t.quill.format(e,!1);});}else this.quill.removeFormat(e,g.default.sources.USER);},direction:function(t){var e=this.quill.getFormat().align;"rtl"===t&&null==e?this.quill.format("align","right",g.default.sources.USER):t||"right"!==e||this.quill.format("align",!1,g.default.sources.USER),this.quill.format("direction",t,g.default.sources.USER);},indent:function(t){var e=this.quill.getSelection(),n=this.quill.getFormat(e),r=parseInt(n.indent||0);if("+1"===t||"-1"===t){var o="+1"===t?1:-1;"rtl"===n.direction&&(o*=-1),this.quill.format("indent",r+o,g.default.sources.USER);}},link:function(t){!0===t&&(t=prompt("Enter link URL:")),this.quill.format("link",t,g.default.sources.USER);},list:function(t){var e=this.quill.getSelection(),n=this.quill.getFormat(e);"check"===t?"checked"===n.list||"unchecked"===n.list?this.quill.format("list",!1,g.default.sources.USER):this.quill.format("list","unchecked",g.default.sources.USER):this.quill.format("list",t,g.default.sources.USER);}}},e.default=E,e.addControls=u;},function(t,e){t.exports='<svg viewbox="0 0 18 18"> <polyline class="ql-even ql-stroke" points="5 7 3 9 5 11"></polyline> <polyline class="ql-even ql-stroke" points="13 7 15 9 13 11"></polyline> <line class=ql-stroke x1=10 x2=8 y1=5 y2=13></line> </svg>';},function(t,e,n){function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function o(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return !e||"object"!=typeof e&&"function"!=typeof e?t:e}function i(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e);}Object.defineProperty(e,"__esModule",{value:!0});var l=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r);}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),a=function t(e,n,r){null===e&&(e=Function.prototype);var o=Object.getOwnPropertyDescriptor(e,n);if(void 0===o){var i=Object.getPrototypeOf(e);return null===i?void 0:t(i,n,r)}if("value"in o)return o.value;var l=o.get;if(void 0!==l)return l.call(r)},s=n(28),u=function(t){return t&&t.__esModule?t:{default:t}}(s),c=function(t){function e(t,n){r(this,e);var i=o(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t));return i.label.innerHTML=n,i.container.classList.add("ql-color-picker"),[].slice.call(i.container.querySelectorAll(".ql-picker-item"),0,7).forEach(function(t){t.classList.add("ql-primary");}),i}return i(e,t),l(e,[{key:"buildItem",value:function(t){var n=a(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"buildItem",this).call(this,t);return n.style.backgroundColor=t.getAttribute("value")||"",n}},{key:"selectItem",value:function(t,n){a(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"selectItem",this).call(this,t,n);var r=this.label.querySelector(".ql-color-label"),o=t?t.getAttribute("data-value")||"":"";r&&("line"===r.tagName?r.style.stroke=o:r.style.fill=o);}}]),e}(u.default);e.default=c;},function(t,e,n){function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function o(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return !e||"object"!=typeof e&&"function"!=typeof e?t:e}function i(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e);}Object.defineProperty(e,"__esModule",{value:!0});var l=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r);}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),a=function t(e,n,r){null===e&&(e=Function.prototype);var o=Object.getOwnPropertyDescriptor(e,n);if(void 0===o){var i=Object.getPrototypeOf(e);return null===i?void 0:t(i,n,r)}if("value"in o)return o.value;var l=o.get;if(void 0!==l)return l.call(r)},s=n(28),u=function(t){return t&&t.__esModule?t:{default:t}}(s),c=function(t){function e(t,n){r(this,e);var i=o(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t));return i.container.classList.add("ql-icon-picker"),[].forEach.call(i.container.querySelectorAll(".ql-picker-item"),function(t){t.innerHTML=n[t.getAttribute("data-value")||""];}),i.defaultItem=i.container.querySelector(".ql-selected"),i.selectItem(i.defaultItem),i}return i(e,t),l(e,[{key:"selectItem",value:function(t,n){a(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"selectItem",this).call(this,t,n),t=t||this.defaultItem,this.label.innerHTML=t.innerHTML;}}]),e}(u.default);e.default=c;},function(t,e,n){function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(e,"__esModule",{value:!0});var o=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r);}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),i=function(){function t(e,n){var o=this;r(this,t),this.quill=e,this.boundsContainer=n||document.body,this.root=e.addContainer("ql-tooltip"),this.root.innerHTML=this.constructor.TEMPLATE,this.quill.root===this.quill.scrollingContainer&&this.quill.root.addEventListener("scroll",function(){o.root.style.marginTop=-1*o.quill.root.scrollTop+"px";}),this.hide();}return o(t,[{key:"hide",value:function(){this.root.classList.add("ql-hidden");}},{key:"position",value:function(t){var e=t.left+t.width/2-this.root.offsetWidth/2,n=t.bottom+this.quill.root.scrollTop;this.root.style.left=e+"px",this.root.style.top=n+"px",this.root.classList.remove("ql-flip");var r=this.boundsContainer.getBoundingClientRect(),o=this.root.getBoundingClientRect(),i=0;if(o.right>r.right&&(i=r.right-o.right,this.root.style.left=e+i+"px"),o.left<r.left&&(i=r.left-o.left,this.root.style.left=e+i+"px"),o.bottom>r.bottom){var l=o.bottom-o.top,a=t.bottom-t.top+l;this.root.style.top=n-a+"px",this.root.classList.add("ql-flip");}return i}},{key:"show",value:function(){this.root.classList.remove("ql-editing"),this.root.classList.remove("ql-hidden");}}]),t}();e.default=i;},function(t,e,n){function r(t){return t&&t.__esModule?t:{default:t}}function o(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function i(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return !e||"object"!=typeof e&&"function"!=typeof e?t:e}function l(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e);}Object.defineProperty(e,"__esModule",{value:!0});var a=function(){function t(t,e){var n=[],r=!0,o=!1,i=void 0;try{for(var l,a=t[Symbol.iterator]();!(r=(l=a.next()).done)&&(n.push(l.value),!e||n.length!==e);r=!0);}catch(t){o=!0,i=t;}finally{try{!r&&a.return&&a.return();}finally{if(o)throw i}}return n}return function(e,n){if(Array.isArray(e))return e;if(Symbol.iterator in Object(e))return t(e,n);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}(),s=function t(e,n,r){null===e&&(e=Function.prototype);var o=Object.getOwnPropertyDescriptor(e,n);if(void 0===o){var i=Object.getPrototypeOf(e);return null===i?void 0:t(i,n,r)}if("value"in o)return o.value;var l=o.get;if(void 0!==l)return l.call(r)},u=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r);}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),c=n(3),f=r(c),h=n(8),p=r(h),d=n(43),y=r(d),v=n(27),b=r(v),g=n(15),m=n(41),_=r(m),O=[[{header:["1","2","3",!1]}],["bold","italic","underline","link"],[{list:"ordered"},{list:"bullet"}],["clean"]],w=function(t){function e(t,n){o(this,e),null!=n.modules.toolbar&&null==n.modules.toolbar.container&&(n.modules.toolbar.container=O);var r=i(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t,n));return r.quill.container.classList.add("ql-snow"),r}return l(e,t),u(e,[{key:"extendToolbar",value:function(t){t.container.classList.add("ql-snow"),this.buildButtons([].slice.call(t.container.querySelectorAll("button")),_.default),this.buildPickers([].slice.call(t.container.querySelectorAll("select")),_.default),this.tooltip=new x(this.quill,this.options.bounds),t.container.querySelector(".ql-link")&&this.quill.keyboard.addBinding({key:"K",shortKey:!0},function(e,n){t.handlers.link.call(t,!n.format.link);});}}]),e}(y.default);w.DEFAULTS=(0, f.default)(!0,{},y.default.DEFAULTS,{modules:{toolbar:{handlers:{link:function(t){if(t){var e=this.quill.getSelection();if(null==e||0==e.length)return;var n=this.quill.getText(e);/^\S+@\S+\.\S+$/.test(n)&&0!==n.indexOf("mailto:")&&(n="mailto:"+n);this.quill.theme.tooltip.edit("link",n);}else this.quill.format("link",!1);}}}}});var x=function(t){function e(t,n){o(this,e);var r=i(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t,n));return r.preview=r.root.querySelector("a.ql-preview"),r}return l(e,t),u(e,[{key:"listen",value:function(){var t=this;s(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"listen",this).call(this),this.root.querySelector("a.ql-action").addEventListener("click",function(e){t.root.classList.contains("ql-editing")?t.save():t.edit("link",t.preview.textContent),e.preventDefault();}),this.root.querySelector("a.ql-remove").addEventListener("click",function(e){if(null!=t.linkRange){var n=t.linkRange;t.restoreFocus(),t.quill.formatText(n,"link",!1,p.default.sources.USER),delete t.linkRange;}e.preventDefault(),t.hide();}),this.quill.on(p.default.events.SELECTION_CHANGE,function(e,n,r){if(null!=e){if(0===e.length&&r===p.default.sources.USER){var o=t.quill.scroll.descendant(b.default,e.index),i=a(o,2),l=i[0],s=i[1];if(null!=l){t.linkRange=new g.Range(e.index-s,l.length());var u=b.default.formats(l.domNode);return t.preview.textContent=u,t.preview.setAttribute("href",u),t.show(),void t.position(t.quill.getBounds(t.linkRange))}}else delete t.linkRange;t.hide();}});}},{key:"show",value:function(){s(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"show",this).call(this),this.root.removeAttribute("data-mode");}}]),e}(d.BaseTooltip);x.TEMPLATE=['<a class="ql-preview" target="_blank" href="about:blank"></a>','<input type="text" data-formula="e=mc^2" data-link="https://quilljs.com" data-video="Embed URL">','<a class="ql-action"></a>','<a class="ql-remove"></a>'].join(""),e.default=w;},function(t,e,n){function r(t){return t&&t.__esModule?t:{default:t}}Object.defineProperty(e,"__esModule",{value:!0});var o=n(29),i=r(o),l=n(36),a=n(38),s=n(64),u=n(65),c=r(u),f=n(66),h=r(f),p=n(67),d=r(p),y=n(37),v=n(26),b=n(39),g=n(40),m=n(56),_=r(m),O=n(68),w=r(O),x=n(27),E=r(x),k=n(69),A=r(k),j=n(70),N=r(j),T=n(71),S=r(T),P=n(72),q=r(P),C=n(73),L=r(C),R=n(13),M=r(R),B=n(74),I=r(B),D=n(75),U=r(D),F=n(57),z=r(F),H=n(41),K=r(H),Y=n(28),V=r(Y),W=n(59),Z=r(W),G=n(60),X=r(G),$=n(61),Q=r($),J=n(108),tt=r(J),et=n(62),nt=r(et);i.default.register({"attributors/attribute/direction":a.DirectionAttribute,"attributors/class/align":l.AlignClass,"attributors/class/background":y.BackgroundClass,"attributors/class/color":v.ColorClass,"attributors/class/direction":a.DirectionClass,"attributors/class/font":b.FontClass,"attributors/class/size":g.SizeClass,"attributors/style/align":l.AlignStyle,"attributors/style/background":y.BackgroundStyle,"attributors/style/color":v.ColorStyle,"attributors/style/direction":a.DirectionStyle,"attributors/style/font":b.FontStyle,"attributors/style/size":g.SizeStyle},!0),i.default.register({"formats/align":l.AlignClass,"formats/direction":a.DirectionClass,"formats/indent":s.IndentClass,"formats/background":y.BackgroundStyle,"formats/color":v.ColorStyle,"formats/font":b.FontClass,"formats/size":g.SizeClass,"formats/blockquote":c.default,"formats/code-block":M.default,"formats/header":h.default,"formats/list":d.default,"formats/bold":_.default,"formats/code":R.Code,"formats/italic":w.default,"formats/link":E.default,"formats/script":A.default,"formats/strike":N.default,"formats/underline":S.default,"formats/image":q.default,"formats/video":L.default,"formats/list/item":p.ListItem,"modules/formula":I.default,"modules/syntax":U.default,"modules/toolbar":z.default,"themes/bubble":tt.default,"themes/snow":nt.default,"ui/icons":K.default,"ui/picker":V.default,"ui/icon-picker":X.default,"ui/color-picker":Z.default,"ui/tooltip":Q.default},!0),e.default=i.default;},function(t,e,n){function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function o(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return !e||"object"!=typeof e&&"function"!=typeof e?t:e}function i(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e);}Object.defineProperty(e,"__esModule",{value:!0}),e.IndentClass=void 0;var l=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r);}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),a=function t(e,n,r){null===e&&(e=Function.prototype);var o=Object.getOwnPropertyDescriptor(e,n);if(void 0===o){var i=Object.getPrototypeOf(e);return null===i?void 0:t(i,n,r)}if("value"in o)return o.value;var l=o.get;if(void 0!==l)return l.call(r)},s=n(0),u=function(t){return t&&t.__esModule?t:{default:t}}(s),c=function(t){function e(){return r(this,e),o(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return i(e,t),l(e,[{key:"add",value:function(t,n){if("+1"===n||"-1"===n){var r=this.value(t)||0;n="+1"===n?r+1:r-1;}return 0===n?(this.remove(t),!0):a(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"add",this).call(this,t,n)}},{key:"canAdd",value:function(t,n){return a(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"canAdd",this).call(this,t,n)||a(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"canAdd",this).call(this,t,parseInt(n))}},{key:"value",value:function(t){return parseInt(a(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"value",this).call(this,t))||void 0}}]),e}(u.default.Attributor.Class),f=new c("indent","ql-indent",{scope:u.default.Scope.BLOCK,whitelist:[1,2,3,4,5,6,7,8]});e.IndentClass=f;},function(t,e,n){function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function o(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return !e||"object"!=typeof e&&"function"!=typeof e?t:e}function i(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e);}Object.defineProperty(e,"__esModule",{value:!0});var l=n(4),a=function(t){return t&&t.__esModule?t:{default:t}}(l),s=function(t){function e(){return r(this,e),o(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return i(e,t),e}(a.default);s.blotName="blockquote",s.tagName="blockquote",e.default=s;},function(t,e,n){function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function o(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return !e||"object"!=typeof e&&"function"!=typeof e?t:e}function i(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e);}Object.defineProperty(e,"__esModule",{value:!0});var l=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r);}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),a=n(4),s=function(t){return t&&t.__esModule?t:{default:t}}(a),u=function(t){function e(){return r(this,e),o(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return i(e,t),l(e,null,[{key:"formats",value:function(t){return this.tagName.indexOf(t.tagName)+1}}]),e}(s.default);u.blotName="header",u.tagName=["H1","H2","H3","H4","H5","H6"],e.default=u;},function(t,e,n){function r(t){return t&&t.__esModule?t:{default:t}}function o(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}function i(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function l(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return !e||"object"!=typeof e&&"function"!=typeof e?t:e}function a(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e);}Object.defineProperty(e,"__esModule",{value:!0}),e.default=e.ListItem=void 0;var s=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r);}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),u=function t(e,n,r){null===e&&(e=Function.prototype);var o=Object.getOwnPropertyDescriptor(e,n);if(void 0===o){var i=Object.getPrototypeOf(e);return null===i?void 0:t(i,n,r)}if("value"in o)return o.value;var l=o.get;if(void 0!==l)return l.call(r)},c=n(0),f=r(c),h=n(4),p=r(h),d=n(25),y=r(d),v=function(t){function e(){return i(this,e),l(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return a(e,t),s(e,[{key:"format",value:function(t,n){t!==b.blotName||n?u(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"format",this).call(this,t,n):this.replaceWith(f.default.create(this.statics.scope));}},{key:"remove",value:function(){null==this.prev&&null==this.next?this.parent.remove():u(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"remove",this).call(this);}},{key:"replaceWith",value:function(t,n){return this.parent.isolate(this.offset(this.parent),this.length()),t===this.parent.statics.blotName?(this.parent.replaceWith(t,n),this):(this.parent.unwrap(),u(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"replaceWith",this).call(this,t,n))}}],[{key:"formats",value:function(t){return t.tagName===this.tagName?void 0:u(e.__proto__||Object.getPrototypeOf(e),"formats",this).call(this,t)}}]),e}(p.default);v.blotName="list-item",v.tagName="LI";var b=function(t){function e(t){i(this,e);var n=l(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t)),r=function(e){if(e.target.parentNode===t){var r=n.statics.formats(t),o=f.default.find(e.target);"checked"===r?o.format("list","unchecked"):"unchecked"===r&&o.format("list","checked");}};return t.addEventListener("touchstart",r),t.addEventListener("mousedown",r),n}return a(e,t),s(e,null,[{key:"create",value:function(t){var n="ordered"===t?"OL":"UL",r=u(e.__proto__||Object.getPrototypeOf(e),"create",this).call(this,n);return "checked"!==t&&"unchecked"!==t||r.setAttribute("data-checked","checked"===t),r}},{key:"formats",value:function(t){return "OL"===t.tagName?"ordered":"UL"===t.tagName?t.hasAttribute("data-checked")?"true"===t.getAttribute("data-checked")?"checked":"unchecked":"bullet":void 0}}]),s(e,[{key:"format",value:function(t,e){this.children.length>0&&this.children.tail.format(t,e);}},{key:"formats",value:function(){return o({},this.statics.blotName,this.statics.formats(this.domNode))}},{key:"insertBefore",value:function(t,n){if(t instanceof v)u(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"insertBefore",this).call(this,t,n);else {var r=null==n?this.length():n.offset(this),o=this.split(r);o.parent.insertBefore(t,o);}}},{key:"optimize",value:function(t){u(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"optimize",this).call(this,t);var n=this.next;null!=n&&n.prev===this&&n.statics.blotName===this.statics.blotName&&n.domNode.tagName===this.domNode.tagName&&n.domNode.getAttribute("data-checked")===this.domNode.getAttribute("data-checked")&&(n.moveChildren(this),n.remove());}},{key:"replace",value:function(t){if(t.statics.blotName!==this.statics.blotName){var n=f.default.create(this.statics.defaultChild);t.moveChildren(n),this.appendChild(n);}u(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"replace",this).call(this,t);}}]),e}(y.default);b.blotName="list",b.scope=f.default.Scope.BLOCK_BLOT,b.tagName=["OL","UL"],b.defaultChild="list-item",b.allowedChildren=[v],e.ListItem=v,e.default=b;},function(t,e,n){function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function o(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return !e||"object"!=typeof e&&"function"!=typeof e?t:e}function i(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e);}Object.defineProperty(e,"__esModule",{value:!0});var l=n(56),a=function(t){return t&&t.__esModule?t:{default:t}}(l),s=function(t){function e(){return r(this,e),o(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return i(e,t),e}(a.default);s.blotName="italic",s.tagName=["EM","I"],e.default=s;},function(t,e,n){function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function o(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return !e||"object"!=typeof e&&"function"!=typeof e?t:e}function i(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e);}Object.defineProperty(e,"__esModule",{value:!0});var l=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r);}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),a=function t(e,n,r){null===e&&(e=Function.prototype);var o=Object.getOwnPropertyDescriptor(e,n);if(void 0===o){var i=Object.getPrototypeOf(e);return null===i?void 0:t(i,n,r)}if("value"in o)return o.value;var l=o.get;if(void 0!==l)return l.call(r)},s=n(6),u=function(t){return t&&t.__esModule?t:{default:t}}(s),c=function(t){function e(){return r(this,e),o(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return i(e,t),l(e,null,[{key:"create",value:function(t){return "super"===t?document.createElement("sup"):"sub"===t?document.createElement("sub"):a(e.__proto__||Object.getPrototypeOf(e),"create",this).call(this,t)}},{key:"formats",value:function(t){return "SUB"===t.tagName?"sub":"SUP"===t.tagName?"super":void 0}}]),e}(u.default);c.blotName="script",c.tagName=["SUB","SUP"],e.default=c;},function(t,e,n){function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function o(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return !e||"object"!=typeof e&&"function"!=typeof e?t:e}function i(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e);}Object.defineProperty(e,"__esModule",{value:!0});var l=n(6),a=function(t){return t&&t.__esModule?t:{default:t}}(l),s=function(t){function e(){return r(this,e),o(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return i(e,t),e}(a.default);s.blotName="strike",s.tagName="S",e.default=s;},function(t,e,n){function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function o(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return !e||"object"!=typeof e&&"function"!=typeof e?t:e}function i(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e);}Object.defineProperty(e,"__esModule",{value:!0});var l=n(6),a=function(t){return t&&t.__esModule?t:{default:t}}(l),s=function(t){function e(){return r(this,e),o(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return i(e,t),e}(a.default);s.blotName="underline",s.tagName="U",e.default=s;},function(t,e,n){function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function o(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return !e||"object"!=typeof e&&"function"!=typeof e?t:e}function i(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e);}Object.defineProperty(e,"__esModule",{value:!0});var l=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r);}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),a=function t(e,n,r){null===e&&(e=Function.prototype);var o=Object.getOwnPropertyDescriptor(e,n);if(void 0===o){var i=Object.getPrototypeOf(e);return null===i?void 0:t(i,n,r)}if("value"in o)return o.value;var l=o.get;if(void 0!==l)return l.call(r)},s=n(0),u=function(t){return t&&t.__esModule?t:{default:t}}(s),c=n(27),f=["alt","height","width"],h=function(t){function e(){return r(this,e),o(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return i(e,t),l(e,[{key:"format",value:function(t,n){f.indexOf(t)>-1?n?this.domNode.setAttribute(t,n):this.domNode.removeAttribute(t):a(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"format",this).call(this,t,n);}}],[{key:"create",value:function(t){var n=a(e.__proto__||Object.getPrototypeOf(e),"create",this).call(this,t);return "string"==typeof t&&n.setAttribute("src",this.sanitize(t)),n}},{key:"formats",value:function(t){return f.reduce(function(e,n){return t.hasAttribute(n)&&(e[n]=t.getAttribute(n)),e},{})}},{key:"match",value:function(t){return /\.(jpe?g|gif|png)$/.test(t)||/^data:image\/.+;base64/.test(t)}},{key:"sanitize",value:function(t){return (0, c.sanitize)(t,["http","https","data"])?t:"//:0"}},{key:"value",value:function(t){return t.getAttribute("src")}}]),e}(u.default.Embed);h.blotName="image",h.tagName="IMG",e.default=h;},function(t,e,n){function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function o(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return !e||"object"!=typeof e&&"function"!=typeof e?t:e}function i(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e);}Object.defineProperty(e,"__esModule",{value:!0});var l=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r);}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),a=function t(e,n,r){null===e&&(e=Function.prototype);var o=Object.getOwnPropertyDescriptor(e,n);if(void 0===o){var i=Object.getPrototypeOf(e);return null===i?void 0:t(i,n,r)}if("value"in o)return o.value;var l=o.get;if(void 0!==l)return l.call(r)},s=n(4),u=n(27),c=function(t){return t&&t.__esModule?t:{default:t}}(u),f=["height","width"],h=function(t){function e(){return r(this,e),o(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return i(e,t),l(e,[{key:"format",value:function(t,n){f.indexOf(t)>-1?n?this.domNode.setAttribute(t,n):this.domNode.removeAttribute(t):a(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"format",this).call(this,t,n);}}],[{key:"create",value:function(t){var n=a(e.__proto__||Object.getPrototypeOf(e),"create",this).call(this,t);return n.setAttribute("frameborder","0"),n.setAttribute("allowfullscreen",!0),n.setAttribute("src",this.sanitize(t)),n}},{key:"formats",value:function(t){return f.reduce(function(e,n){return t.hasAttribute(n)&&(e[n]=t.getAttribute(n)),e},{})}},{key:"sanitize",value:function(t){return c.default.sanitize(t)}},{key:"value",value:function(t){return t.getAttribute("src")}}]),e}(s.BlockEmbed);h.blotName="video",h.className="ql-video",h.tagName="IFRAME",e.default=h;},function(t,e,n){function r(t){return t&&t.__esModule?t:{default:t}}function o(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function i(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return !e||"object"!=typeof e&&"function"!=typeof e?t:e}function l(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e);}Object.defineProperty(e,"__esModule",{value:!0}),e.default=e.FormulaBlot=void 0;var a=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r);}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),s=function t(e,n,r){null===e&&(e=Function.prototype);var o=Object.getOwnPropertyDescriptor(e,n);if(void 0===o){var i=Object.getPrototypeOf(e);return null===i?void 0:t(i,n,r)}if("value"in o)return o.value;var l=o.get;if(void 0!==l)return l.call(r)},u=n(35),c=r(u),f=n(5),h=r(f),p=n(9),d=r(p),y=function(t){function e(){return o(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return l(e,t),a(e,null,[{key:"create",value:function(t){var n=s(e.__proto__||Object.getPrototypeOf(e),"create",this).call(this,t);return "string"==typeof t&&(window.katex.render(t,n,{throwOnError:!1,errorColor:"#f00"}),n.setAttribute("data-value",t)),n}},{key:"value",value:function(t){return t.getAttribute("data-value")}}]),e}(c.default);y.blotName="formula",y.className="ql-formula",y.tagName="SPAN";var v=function(t){function e(){o(this,e);var t=i(this,(e.__proto__||Object.getPrototypeOf(e)).call(this));if(null==window.katex)throw new Error("Formula module requires KaTeX.");return t}return l(e,t),a(e,null,[{key:"register",value:function(){h.default.register(y,!0);}}]),e}(d.default);e.FormulaBlot=y,e.default=v;},function(t,e,n){function r(t){return t&&t.__esModule?t:{default:t}}function o(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function i(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return !e||"object"!=typeof e&&"function"!=typeof e?t:e}function l(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e);}Object.defineProperty(e,"__esModule",{value:!0}),e.default=e.CodeToken=e.CodeBlock=void 0;var a=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r);}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),s=function t(e,n,r){null===e&&(e=Function.prototype);var o=Object.getOwnPropertyDescriptor(e,n);if(void 0===o){var i=Object.getPrototypeOf(e);return null===i?void 0:t(i,n,r)}if("value"in o)return o.value;var l=o.get;if(void 0!==l)return l.call(r)},u=n(0),c=r(u),f=n(5),h=r(f),p=n(9),d=r(p),y=n(13),v=r(y),b=function(t){function e(){return o(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return l(e,t),a(e,[{key:"replaceWith",value:function(t){this.domNode.textContent=this.domNode.textContent,this.attach(),s(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"replaceWith",this).call(this,t);}},{key:"highlight",value:function(t){var e=this.domNode.textContent;this.cachedText!==e&&((e.trim().length>0||null==this.cachedText)&&(this.domNode.innerHTML=t(e),this.domNode.normalize(),this.attach()),this.cachedText=e);}}]),e}(v.default);b.className="ql-syntax";var g=new c.default.Attributor.Class("token","hljs",{scope:c.default.Scope.INLINE}),m=function(t){function e(t,n){o(this,e);var r=i(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t,n));if("function"!=typeof r.options.highlight)throw new Error("Syntax module requires highlight.js. Please include the library on the page before Quill.");var l=null;return r.quill.on(h.default.events.SCROLL_OPTIMIZE,function(){clearTimeout(l),l=setTimeout(function(){r.highlight(),l=null;},r.options.interval);}),r.highlight(),r}return l(e,t),a(e,null,[{key:"register",value:function(){h.default.register(g,!0),h.default.register(b,!0);}}]),a(e,[{key:"highlight",value:function(){var t=this;if(!this.quill.selection.composing){this.quill.update(h.default.sources.USER);var e=this.quill.getSelection();this.quill.scroll.descendants(b).forEach(function(e){e.highlight(t.options.highlight);}),this.quill.update(h.default.sources.SILENT),null!=e&&this.quill.setSelection(e,h.default.sources.SILENT);}}}]),e}(d.default);m.DEFAULTS={highlight:function(){return null==window.hljs?null:function(t){return window.hljs.highlightAuto(t).value}}(),interval:1e3},e.CodeBlock=b,e.CodeToken=g,e.default=m;},function(t,e){t.exports='<svg viewbox="0 0 18 18"> <line class=ql-stroke x1=3 x2=15 y1=9 y2=9></line> <line class=ql-stroke x1=3 x2=13 y1=14 y2=14></line> <line class=ql-stroke x1=3 x2=9 y1=4 y2=4></line> </svg>';},function(t,e){t.exports='<svg viewbox="0 0 18 18"> <line class=ql-stroke x1=15 x2=3 y1=9 y2=9></line> <line class=ql-stroke x1=14 x2=4 y1=14 y2=14></line> <line class=ql-stroke x1=12 x2=6 y1=4 y2=4></line> </svg>';},function(t,e){t.exports='<svg viewbox="0 0 18 18"> <line class=ql-stroke x1=15 x2=3 y1=9 y2=9></line> <line class=ql-stroke x1=15 x2=5 y1=14 y2=14></line> <line class=ql-stroke x1=15 x2=9 y1=4 y2=4></line> </svg>';},function(t,e){t.exports='<svg viewbox="0 0 18 18"> <line class=ql-stroke x1=15 x2=3 y1=9 y2=9></line> <line class=ql-stroke x1=15 x2=3 y1=14 y2=14></line> <line class=ql-stroke x1=15 x2=3 y1=4 y2=4></line> </svg>';},function(t,e){t.exports='<svg viewbox="0 0 18 18"> <g class="ql-fill ql-color-label"> <polygon points="6 6.868 6 6 5 6 5 7 5.942 7 6 6.868"></polygon> <rect height=1 width=1 x=4 y=4></rect> <polygon points="6.817 5 6 5 6 6 6.38 6 6.817 5"></polygon> <rect height=1 width=1 x=2 y=6></rect> <rect height=1 width=1 x=3 y=5></rect> <rect height=1 width=1 x=4 y=7></rect> <polygon points="4 11.439 4 11 3 11 3 12 3.755 12 4 11.439"></polygon> <rect height=1 width=1 x=2 y=12></rect> <rect height=1 width=1 x=2 y=9></rect> <rect height=1 width=1 x=2 y=15></rect> <polygon points="4.63 10 4 10 4 11 4.192 11 4.63 10"></polygon> <rect height=1 width=1 x=3 y=8></rect> <path d=M10.832,4.2L11,4.582V4H10.708A1.948,1.948,0,0,1,10.832,4.2Z></path> <path d=M7,4.582L7.168,4.2A1.929,1.929,0,0,1,7.292,4H7V4.582Z></path> <path d=M8,13H7.683l-0.351.8a1.933,1.933,0,0,1-.124.2H8V13Z></path> <rect height=1 width=1 x=12 y=2></rect> <rect height=1 width=1 x=11 y=3></rect> <path d=M9,3H8V3.282A1.985,1.985,0,0,1,9,3Z></path> <rect height=1 width=1 x=2 y=3></rect> <rect height=1 width=1 x=6 y=2></rect> <rect height=1 width=1 x=3 y=2></rect> <rect height=1 width=1 x=5 y=3></rect> <rect height=1 width=1 x=9 y=2></rect> <rect height=1 width=1 x=15 y=14></rect> <polygon points="13.447 10.174 13.469 10.225 13.472 10.232 13.808 11 14 11 14 10 13.37 10 13.447 10.174"></polygon> <rect height=1 width=1 x=13 y=7></rect> <rect height=1 width=1 x=15 y=5></rect> <rect height=1 width=1 x=14 y=6></rect> <rect height=1 width=1 x=15 y=8></rect> <rect height=1 width=1 x=14 y=9></rect> <path d=M3.775,14H3v1H4V14.314A1.97,1.97,0,0,1,3.775,14Z></path> <rect height=1 width=1 x=14 y=3></rect> <polygon points="12 6.868 12 6 11.62 6 12 6.868"></polygon> <rect height=1 width=1 x=15 y=2></rect> <rect height=1 width=1 x=12 y=5></rect> <rect height=1 width=1 x=13 y=4></rect> <polygon points="12.933 9 13 9 13 8 12.495 8 12.933 9"></polygon> <rect height=1 width=1 x=9 y=14></rect> <rect height=1 width=1 x=8 y=15></rect> <path d=M6,14.926V15H7V14.316A1.993,1.993,0,0,1,6,14.926Z></path> <rect height=1 width=1 x=5 y=15></rect> <path d=M10.668,13.8L10.317,13H10v1h0.792A1.947,1.947,0,0,1,10.668,13.8Z></path> <rect height=1 width=1 x=11 y=15></rect> <path d=M14.332,12.2a1.99,1.99,0,0,1,.166.8H15V12H14.245Z></path> <rect height=1 width=1 x=14 y=15></rect> <rect height=1 width=1 x=15 y=11></rect> </g> <polyline class=ql-stroke points="5.5 13 9 5 12.5 13"></polyline> <line class=ql-stroke x1=11.63 x2=6.38 y1=11 y2=11></line> </svg>';},function(t,e){t.exports='<svg viewbox="0 0 18 18"> <rect class="ql-fill ql-stroke" height=3 width=3 x=4 y=5></rect> <rect class="ql-fill ql-stroke" height=3 width=3 x=11 y=5></rect> <path class="ql-even ql-fill ql-stroke" d=M7,8c0,4.031-3,5-3,5></path> <path class="ql-even ql-fill ql-stroke" d=M14,8c0,4.031-3,5-3,5></path> </svg>';},function(t,e){t.exports='<svg viewbox="0 0 18 18"> <path class=ql-stroke d=M5,4H9.5A2.5,2.5,0,0,1,12,6.5v0A2.5,2.5,0,0,1,9.5,9H5A0,0,0,0,1,5,9V4A0,0,0,0,1,5,4Z></path> <path class=ql-stroke d=M5,9h5.5A2.5,2.5,0,0,1,13,11.5v0A2.5,2.5,0,0,1,10.5,14H5a0,0,0,0,1,0,0V9A0,0,0,0,1,5,9Z></path> </svg>';},function(t,e){t.exports='<svg class="" viewbox="0 0 18 18"> <line class=ql-stroke x1=5 x2=13 y1=3 y2=3></line> <line class=ql-stroke x1=6 x2=9.35 y1=12 y2=3></line> <line class=ql-stroke x1=11 x2=15 y1=11 y2=15></line> <line class=ql-stroke x1=15 x2=11 y1=11 y2=15></line> <rect class=ql-fill height=1 rx=0.5 ry=0.5 width=7 x=2 y=14></rect> </svg>';},function(t,e){t.exports='<svg viewbox="0 0 18 18"> <line class="ql-color-label ql-stroke ql-transparent" x1=3 x2=15 y1=15 y2=15></line> <polyline class=ql-stroke points="5.5 11 9 3 12.5 11"></polyline> <line class=ql-stroke x1=11.63 x2=6.38 y1=9 y2=9></line> </svg>';},function(t,e){t.exports='<svg viewbox="0 0 18 18"> <polygon class="ql-stroke ql-fill" points="3 11 5 9 3 7 3 11"></polygon> <line class="ql-stroke ql-fill" x1=15 x2=11 y1=4 y2=4></line> <path class=ql-fill d=M11,3a3,3,0,0,0,0,6h1V3H11Z></path> <rect class=ql-fill height=11 width=1 x=11 y=4></rect> <rect class=ql-fill height=11 width=1 x=13 y=4></rect> </svg>';},function(t,e){t.exports='<svg viewbox="0 0 18 18"> <polygon class="ql-stroke ql-fill" points="15 12 13 10 15 8 15 12"></polygon> <line class="ql-stroke ql-fill" x1=9 x2=5 y1=4 y2=4></line> <path class=ql-fill d=M5,3A3,3,0,0,0,5,9H6V3H5Z></path> <rect class=ql-fill height=11 width=1 x=5 y=4></rect> <rect class=ql-fill height=11 width=1 x=7 y=4></rect> </svg>';},function(t,e){t.exports='<svg viewbox="0 0 18 18"> <path class=ql-fill d=M14,16H4a1,1,0,0,1,0-2H14A1,1,0,0,1,14,16Z /> <path class=ql-fill d=M14,4H4A1,1,0,0,1,4,2H14A1,1,0,0,1,14,4Z /> <rect class=ql-fill x=3 y=6 width=12 height=6 rx=1 ry=1 /> </svg>';},function(t,e){t.exports='<svg viewbox="0 0 18 18"> <path class=ql-fill d=M13,16H5a1,1,0,0,1,0-2h8A1,1,0,0,1,13,16Z /> <path class=ql-fill d=M13,4H5A1,1,0,0,1,5,2h8A1,1,0,0,1,13,4Z /> <rect class=ql-fill x=2 y=6 width=14 height=6 rx=1 ry=1 /> </svg>';},function(t,e){t.exports='<svg viewbox="0 0 18 18"> <path class=ql-fill d=M15,8H13a1,1,0,0,1,0-2h2A1,1,0,0,1,15,8Z /> <path class=ql-fill d=M15,12H13a1,1,0,0,1,0-2h2A1,1,0,0,1,15,12Z /> <path class=ql-fill d=M15,16H5a1,1,0,0,1,0-2H15A1,1,0,0,1,15,16Z /> <path class=ql-fill d=M15,4H5A1,1,0,0,1,5,2H15A1,1,0,0,1,15,4Z /> <rect class=ql-fill x=2 y=6 width=8 height=6 rx=1 ry=1 /> </svg>';},function(t,e){t.exports='<svg viewbox="0 0 18 18"> <path class=ql-fill d=M5,8H3A1,1,0,0,1,3,6H5A1,1,0,0,1,5,8Z /> <path class=ql-fill d=M5,12H3a1,1,0,0,1,0-2H5A1,1,0,0,1,5,12Z /> <path class=ql-fill d=M13,16H3a1,1,0,0,1,0-2H13A1,1,0,0,1,13,16Z /> <path class=ql-fill d=M13,4H3A1,1,0,0,1,3,2H13A1,1,0,0,1,13,4Z /> <rect class=ql-fill x=8 y=6 width=8 height=6 rx=1 ry=1 transform="translate(24 18) rotate(-180)"/> </svg>';},function(t,e){t.exports='<svg viewbox="0 0 18 18"> <path class=ql-fill d=M11.759,2.482a2.561,2.561,0,0,0-3.53.607A7.656,7.656,0,0,0,6.8,6.2C6.109,9.188,5.275,14.677,4.15,14.927a1.545,1.545,0,0,0-1.3-.933A0.922,0.922,0,0,0,2,15.036S1.954,16,4.119,16s3.091-2.691,3.7-5.553c0.177-.826.36-1.726,0.554-2.6L8.775,6.2c0.381-1.421.807-2.521,1.306-2.676a1.014,1.014,0,0,0,1.02.56A0.966,0.966,0,0,0,11.759,2.482Z></path> <rect class=ql-fill height=1.6 rx=0.8 ry=0.8 width=5 x=5.15 y=6.2></rect> <path class=ql-fill d=M13.663,12.027a1.662,1.662,0,0,1,.266-0.276q0.193,0.069.456,0.138a2.1,2.1,0,0,0,.535.069,1.075,1.075,0,0,0,.767-0.3,1.044,1.044,0,0,0,.314-0.8,0.84,0.84,0,0,0-.238-0.619,0.8,0.8,0,0,0-.594-0.239,1.154,1.154,0,0,0-.781.3,4.607,4.607,0,0,0-.781,1q-0.091.15-.218,0.346l-0.246.38c-0.068-.288-0.137-0.582-0.212-0.885-0.459-1.847-2.494-.984-2.941-0.8-0.482.2-.353,0.647-0.094,0.529a0.869,0.869,0,0,1,1.281.585c0.217,0.751.377,1.436,0.527,2.038a5.688,5.688,0,0,1-.362.467,2.69,2.69,0,0,1-.264.271q-0.221-.08-0.471-0.147a2.029,2.029,0,0,0-.522-0.066,1.079,1.079,0,0,0-.768.3A1.058,1.058,0,0,0,9,15.131a0.82,0.82,0,0,0,.832.852,1.134,1.134,0,0,0,.787-0.3,5.11,5.11,0,0,0,.776-0.993q0.141-.219.215-0.34c0.046-.076.122-0.194,0.223-0.346a2.786,2.786,0,0,0,.918,1.726,2.582,2.582,0,0,0,2.376-.185c0.317-.181.212-0.565,0-0.494A0.807,0.807,0,0,1,14.176,15a5.159,5.159,0,0,1-.913-2.446l0,0Q13.487,12.24,13.663,12.027Z></path> </svg>';},function(t,e){t.exports='<svg viewBox="0 0 18 18"> <path class=ql-fill d=M10,4V14a1,1,0,0,1-2,0V10H3v4a1,1,0,0,1-2,0V4A1,1,0,0,1,3,4V8H8V4a1,1,0,0,1,2,0Zm6.06787,9.209H14.98975V7.59863a.54085.54085,0,0,0-.605-.60547h-.62744a1.01119,1.01119,0,0,0-.748.29688L11.645,8.56641a.5435.5435,0,0,0-.022.8584l.28613.30762a.53861.53861,0,0,0,.84717.0332l.09912-.08789a1.2137,1.2137,0,0,0,.2417-.35254h.02246s-.01123.30859-.01123.60547V13.209H12.041a.54085.54085,0,0,0-.605.60547v.43945a.54085.54085,0,0,0,.605.60547h4.02686a.54085.54085,0,0,0,.605-.60547v-.43945A.54085.54085,0,0,0,16.06787,13.209Z /> </svg>';},function(t,e){t.exports='<svg viewBox="0 0 18 18"> <path class=ql-fill d=M16.73975,13.81445v.43945a.54085.54085,0,0,1-.605.60547H11.855a.58392.58392,0,0,1-.64893-.60547V14.0127c0-2.90527,3.39941-3.42187,3.39941-4.55469a.77675.77675,0,0,0-.84717-.78125,1.17684,1.17684,0,0,0-.83594.38477c-.2749.26367-.561.374-.85791.13184l-.4292-.34082c-.30811-.24219-.38525-.51758-.1543-.81445a2.97155,2.97155,0,0,1,2.45361-1.17676,2.45393,2.45393,0,0,1,2.68408,2.40918c0,2.45312-3.1792,2.92676-3.27832,3.93848h2.79443A.54085.54085,0,0,1,16.73975,13.81445ZM9,3A.99974.99974,0,0,0,8,4V8H3V4A1,1,0,0,0,1,4V14a1,1,0,0,0,2,0V10H8v4a1,1,0,0,0,2,0V4A.99974.99974,0,0,0,9,3Z /> </svg>';},function(t,e){t.exports='<svg viewbox="0 0 18 18"> <line class=ql-stroke x1=7 x2=13 y1=4 y2=4></line> <line class=ql-stroke x1=5 x2=11 y1=14 y2=14></line> <line class=ql-stroke x1=8 x2=10 y1=14 y2=4></line> </svg>';},function(t,e){t.exports='<svg viewbox="0 0 18 18"> <rect class=ql-stroke height=10 width=12 x=3 y=4></rect> <circle class=ql-fill cx=6 cy=7 r=1></circle> <polyline class="ql-even ql-fill" points="5 12 5 11 7 9 8 10 11 7 13 9 13 12 5 12"></polyline> </svg>';},function(t,e){t.exports='<svg viewbox="0 0 18 18"> <line class=ql-stroke x1=3 x2=15 y1=14 y2=14></line> <line class=ql-stroke x1=3 x2=15 y1=4 y2=4></line> <line class=ql-stroke x1=9 x2=15 y1=9 y2=9></line> <polyline class="ql-fill ql-stroke" points="3 7 3 11 5 9 3 7"></polyline> </svg>';},function(t,e){t.exports='<svg viewbox="0 0 18 18"> <line class=ql-stroke x1=3 x2=15 y1=14 y2=14></line> <line class=ql-stroke x1=3 x2=15 y1=4 y2=4></line> <line class=ql-stroke x1=9 x2=15 y1=9 y2=9></line> <polyline class=ql-stroke points="5 7 5 11 3 9 5 7"></polyline> </svg>';},function(t,e){t.exports='<svg viewbox="0 0 18 18"> <line class=ql-stroke x1=7 x2=11 y1=7 y2=11></line> <path class="ql-even ql-stroke" d=M8.9,4.577a3.476,3.476,0,0,1,.36,4.679A3.476,3.476,0,0,1,4.577,8.9C3.185,7.5,2.035,6.4,4.217,4.217S7.5,3.185,8.9,4.577Z></path> <path class="ql-even ql-stroke" d=M13.423,9.1a3.476,3.476,0,0,0-4.679-.36,3.476,3.476,0,0,0,.36,4.679c1.392,1.392,2.5,2.542,4.679.36S14.815,10.5,13.423,9.1Z></path> </svg>';},function(t,e){t.exports='<svg viewbox="0 0 18 18"> <line class=ql-stroke x1=7 x2=15 y1=4 y2=4></line> <line class=ql-stroke x1=7 x2=15 y1=9 y2=9></line> <line class=ql-stroke x1=7 x2=15 y1=14 y2=14></line> <line class="ql-stroke ql-thin" x1=2.5 x2=4.5 y1=5.5 y2=5.5></line> <path class=ql-fill d=M3.5,6A0.5,0.5,0,0,1,3,5.5V3.085l-0.276.138A0.5,0.5,0,0,1,2.053,3c-0.124-.247-0.023-0.324.224-0.447l1-.5A0.5,0.5,0,0,1,4,2.5v3A0.5,0.5,0,0,1,3.5,6Z></path> <path class="ql-stroke ql-thin" d=M4.5,10.5h-2c0-.234,1.85-1.076,1.85-2.234A0.959,0.959,0,0,0,2.5,8.156></path> <path class="ql-stroke ql-thin" d=M2.5,14.846a0.959,0.959,0,0,0,1.85-.109A0.7,0.7,0,0,0,3.75,14a0.688,0.688,0,0,0,.6-0.736,0.959,0.959,0,0,0-1.85-.109></path> </svg>';},function(t,e){t.exports='<svg viewbox="0 0 18 18"> <line class=ql-stroke x1=6 x2=15 y1=4 y2=4></line> <line class=ql-stroke x1=6 x2=15 y1=9 y2=9></line> <line class=ql-stroke x1=6 x2=15 y1=14 y2=14></line> <line class=ql-stroke x1=3 x2=3 y1=4 y2=4></line> <line class=ql-stroke x1=3 x2=3 y1=9 y2=9></line> <line class=ql-stroke x1=3 x2=3 y1=14 y2=14></line> </svg>';},function(t,e){t.exports='<svg class="" viewbox="0 0 18 18"> <line class=ql-stroke x1=9 x2=15 y1=4 y2=4></line> <polyline class=ql-stroke points="3 4 4 5 6 3"></polyline> <line class=ql-stroke x1=9 x2=15 y1=14 y2=14></line> <polyline class=ql-stroke points="3 14 4 15 6 13"></polyline> <line class=ql-stroke x1=9 x2=15 y1=9 y2=9></line> <polyline class=ql-stroke points="3 9 4 10 6 8"></polyline> </svg>';},function(t,e){t.exports='<svg viewbox="0 0 18 18"> <path class=ql-fill d=M15.5,15H13.861a3.858,3.858,0,0,0,1.914-2.975,1.8,1.8,0,0,0-1.6-1.751A1.921,1.921,0,0,0,12.021,11.7a0.50013,0.50013,0,1,0,.957.291h0a0.914,0.914,0,0,1,1.053-.725,0.81,0.81,0,0,1,.744.762c0,1.076-1.16971,1.86982-1.93971,2.43082A1.45639,1.45639,0,0,0,12,15.5a0.5,0.5,0,0,0,.5.5h3A0.5,0.5,0,0,0,15.5,15Z /> <path class=ql-fill d=M9.65,5.241a1,1,0,0,0-1.409.108L6,7.964,3.759,5.349A1,1,0,0,0,2.192,6.59178Q2.21541,6.6213,2.241,6.649L4.684,9.5,2.241,12.35A1,1,0,0,0,3.71,13.70722q0.02557-.02768.049-0.05722L6,11.036,8.241,13.65a1,1,0,1,0,1.567-1.24277Q9.78459,12.3777,9.759,12.35L7.316,9.5,9.759,6.651A1,1,0,0,0,9.65,5.241Z /> </svg>';},function(t,e){t.exports='<svg viewbox="0 0 18 18"> <path class=ql-fill d=M15.5,7H13.861a4.015,4.015,0,0,0,1.914-2.975,1.8,1.8,0,0,0-1.6-1.751A1.922,1.922,0,0,0,12.021,3.7a0.5,0.5,0,1,0,.957.291,0.917,0.917,0,0,1,1.053-.725,0.81,0.81,0,0,1,.744.762c0,1.077-1.164,1.925-1.934,2.486A1.423,1.423,0,0,0,12,7.5a0.5,0.5,0,0,0,.5.5h3A0.5,0.5,0,0,0,15.5,7Z /> <path class=ql-fill d=M9.651,5.241a1,1,0,0,0-1.41.108L6,7.964,3.759,5.349a1,1,0,1,0-1.519,1.3L4.683,9.5,2.241,12.35a1,1,0,1,0,1.519,1.3L6,11.036,8.241,13.65a1,1,0,0,0,1.519-1.3L7.317,9.5,9.759,6.651A1,1,0,0,0,9.651,5.241Z /> </svg>';},function(t,e){t.exports='<svg viewbox="0 0 18 18"> <line class="ql-stroke ql-thin" x1=15.5 x2=2.5 y1=8.5 y2=9.5></line> <path class=ql-fill d=M9.007,8C6.542,7.791,6,7.519,6,6.5,6,5.792,7.283,5,9,5c1.571,0,2.765.679,2.969,1.309a1,1,0,0,0,1.9-.617C13.356,4.106,11.354,3,9,3,6.2,3,4,4.538,4,6.5a3.2,3.2,0,0,0,.5,1.843Z></path> <path class=ql-fill d=M8.984,10C11.457,10.208,12,10.479,12,11.5c0,0.708-1.283,1.5-3,1.5-1.571,0-2.765-.679-2.969-1.309a1,1,0,1,0-1.9.617C4.644,13.894,6.646,15,9,15c2.8,0,5-1.538,5-3.5a3.2,3.2,0,0,0-.5-1.843Z></path> </svg>';},function(t,e){t.exports='<svg viewbox="0 0 18 18"> <path class=ql-stroke d=M5,3V9a4.012,4.012,0,0,0,4,4H9a4.012,4.012,0,0,0,4-4V3></path> <rect class=ql-fill height=1 rx=0.5 ry=0.5 width=12 x=3 y=15></rect> </svg>';},function(t,e){t.exports='<svg viewbox="0 0 18 18"> <rect class=ql-stroke height=12 width=12 x=3 y=3></rect> <rect class=ql-fill height=12 width=1 x=5 y=3></rect> <rect class=ql-fill height=12 width=1 x=12 y=3></rect> <rect class=ql-fill height=2 width=8 x=5 y=8></rect> <rect class=ql-fill height=1 width=3 x=3 y=5></rect> <rect class=ql-fill height=1 width=3 x=3 y=7></rect> <rect class=ql-fill height=1 width=3 x=3 y=10></rect> <rect class=ql-fill height=1 width=3 x=3 y=12></rect> <rect class=ql-fill height=1 width=3 x=12 y=5></rect> <rect class=ql-fill height=1 width=3 x=12 y=7></rect> <rect class=ql-fill height=1 width=3 x=12 y=10></rect> <rect class=ql-fill height=1 width=3 x=12 y=12></rect> </svg>';},function(t,e){t.exports='<svg viewbox="0 0 18 18"> <polygon class=ql-stroke points="7 11 9 13 11 11 7 11"></polygon> <polygon class=ql-stroke points="7 7 9 5 11 7 7 7"></polygon> </svg>';},function(t,e,n){function r(t){return t&&t.__esModule?t:{default:t}}function o(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function i(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return !e||"object"!=typeof e&&"function"!=typeof e?t:e}function l(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e);}Object.defineProperty(e,"__esModule",{value:!0}),e.default=e.BubbleTooltip=void 0;var a=function t(e,n,r){null===e&&(e=Function.prototype);var o=Object.getOwnPropertyDescriptor(e,n);if(void 0===o){var i=Object.getPrototypeOf(e);return null===i?void 0:t(i,n,r)}if("value"in o)return o.value;var l=o.get;if(void 0!==l)return l.call(r)},s=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r);}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),u=n(3),c=r(u),f=n(8),h=r(f),p=n(43),d=r(p),y=n(15),v=n(41),b=r(v),g=[["bold","italic","link"],[{header:1},{header:2},"blockquote"]],m=function(t){function e(t,n){o(this,e),null!=n.modules.toolbar&&null==n.modules.toolbar.container&&(n.modules.toolbar.container=g);var r=i(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t,n));return r.quill.container.classList.add("ql-bubble"),r}return l(e,t),s(e,[{key:"extendToolbar",value:function(t){this.tooltip=new _(this.quill,this.options.bounds),this.tooltip.root.appendChild(t.container),this.buildButtons([].slice.call(t.container.querySelectorAll("button")),b.default),this.buildPickers([].slice.call(t.container.querySelectorAll("select")),b.default);}}]),e}(d.default);m.DEFAULTS=(0, c.default)(!0,{},d.default.DEFAULTS,{modules:{toolbar:{handlers:{link:function(t){t?this.quill.theme.tooltip.edit():this.quill.format("link",!1);}}}}});var _=function(t){function e(t,n){o(this,e);var r=i(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t,n));return r.quill.on(h.default.events.EDITOR_CHANGE,function(t,e,n,o){if(t===h.default.events.SELECTION_CHANGE)if(null!=e&&e.length>0&&o===h.default.sources.USER){r.show(),r.root.style.left="0px",r.root.style.width="",r.root.style.width=r.root.offsetWidth+"px";var i=r.quill.getLines(e.index,e.length);if(1===i.length)r.position(r.quill.getBounds(e));else {var l=i[i.length-1],a=r.quill.getIndex(l),s=Math.min(l.length()-1,e.index+e.length-a),u=r.quill.getBounds(new y.Range(a,s));r.position(u);}}else document.activeElement!==r.textbox&&r.quill.hasFocus()&&r.hide();}),r}return l(e,t),s(e,[{key:"listen",value:function(){var t=this;a(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"listen",this).call(this),this.root.querySelector(".ql-close").addEventListener("click",function(){t.root.classList.remove("ql-editing");}),this.quill.on(h.default.events.SCROLL_OPTIMIZE,function(){setTimeout(function(){if(!t.root.classList.contains("ql-hidden")){var e=t.quill.getSelection();null!=e&&t.position(t.quill.getBounds(e));}},1);});}},{key:"cancel",value:function(){this.show();}},{key:"position",value:function(t){var n=a(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"position",this).call(this,t),r=this.root.querySelector(".ql-tooltip-arrow");if(r.style.marginLeft="",0===n)return n;r.style.marginLeft=-1*n-r.offsetWidth/2+"px";}}]),e}(p.BaseTooltip);_.TEMPLATE=['<span class="ql-tooltip-arrow"></span>','<div class="ql-tooltip-editor">','<input type="text" data-formula="e=mc^2" data-link="https://quilljs.com" data-video="Embed URL">','<a class="ql-close"></a>',"</div>"].join(""),e.BubbleTooltip=_,e.default=m;},function(t,e,n){t.exports=n(63);}]).default});}).call(e,n(43).Buffer);},function(t,e,n){var r=n(11),o=n(1),i=r(o,"Map");t.exports=i;},function(t,e,n){var r=n(1),o=r.Symbol;t.exports=o;},function(t,e){function n(t,e,n){switch(n.length){case 0:return t.call(e);case 1:return t.call(e,n[0]);case 2:return t.call(e,n[0],n[1]);case 3:return t.call(e,n[0],n[1],n[2])}return t.apply(e,n)}t.exports=n;},function(t,e,n){function r(t,e,n){(void 0===n||i(t[e],n))&&(void 0!==n||e in t)||o(t,e,n);}var o=n(10),i=n(8);t.exports=r;},function(t,e,n){function r(t,e,n,f,h){t!==e&&l(e,function(l,u){if(s(l))h||(h=new o),a(t,e,u,n,r,f,h);else {var p=f?f(c(t,u),l,u+"",t,e,h):void 0;void 0===p&&(p=l),i(t,u,p);}},u);}var o=n(48),i=n(19),l=n(53),a=n(58),s=n(0),u=n(34),c=n(27);t.exports=r;},function(t,e,n){function r(t,e){return l(i(t,e,o),t+"")}var o=n(28),i=n(96),l=n(97);t.exports=r;},function(t,e,n){var r=n(11),o=function(){try{var t=r(Object,"defineProperty");return t({},"",{}),t}catch(t){}}();t.exports=o;},function(t,e,n){(function(e){var n="object"==typeof e&&e&&e.Object===Object&&e;t.exports=n;}).call(e,n(35));},function(t,e,n){var r=n(95),o=r(Object.getPrototypeOf,Object);t.exports=o;},function(t,e){function n(t,e){var n=typeof t;return !!(e=null==e?r:e)&&("number"==n||"symbol"!=n&&o.test(t))&&t>-1&&t%1==0&&t<e}var r=9007199254740991,o=/^(?:0|[1-9]\d*)$/;t.exports=n;},function(t,e){function n(t){var e=t&&t.constructor;return t===("function"==typeof e&&e.prototype||r)}var r=Object.prototype;t.exports=n;},function(t,e){function n(t,e){return "__proto__"==e?void 0:t[e]}t.exports=n;},function(t,e){function n(t){return t}t.exports=n;},function(t,e,n){var r=n(54),o=n(2),i=Object.prototype,l=i.hasOwnProperty,a=i.propertyIsEnumerable,s=r(function(){return arguments}())?r:function(t){return o(t)&&l.call(t,"callee")&&!a.call(t,"callee")};t.exports=s;},function(t,e){var n=Array.isArray;t.exports=n;},function(t,e,n){(function(t){var r=n(1),o=n(109),i="object"==typeof e&&e&&!e.nodeType&&e,l=i&&"object"==typeof t&&t&&!t.nodeType&&t,a=l&&l.exports===i,s=a?r.Buffer:void 0,u=s?s.isBuffer:void 0,c=u||o;t.exports=c;}).call(e,n(14)(t));},function(t,e){function n(t){return "number"==typeof t&&t>-1&&t%1==0&&t<=r}var r=9007199254740991;t.exports=n;},function(t,e,n){var r=n(56),o=n(61),i=n(93),l=i&&i.isTypedArray,a=l?o(l):r;t.exports=a;},function(t,e,n){function r(t){return l(t)?o(t,!0):i(t)}var o=n(50),i=n(57),l=n(12);t.exports=r;},function(t,e){var n;n=function(){return this}();try{n=n||Function("return this")()||(0,eval)("this");}catch(t){"object"==typeof window&&(n=window);}t.exports=n;},function(t,e,n){e.a={modules:["DisplaySize","Toolbar","Resize"],overlayStyles:{position:"absolute",boxSizing:"border-box",border:"1px dashed #444"},handleStyles:{position:"absolute",height:"12px",width:"12px",backgroundColor:"white",border:"1px solid #777",boxSizing:"border-box",opacity:"0.80"},displayStyles:{position:"absolute",font:"12px/1.0 Arial, Helvetica, sans-serif",padding:"4px 8px",textAlign:"center",backgroundColor:"white",color:"#333",border:"1px solid #777",boxSizing:"border-box",opacity:"0.80",cursor:"default"},toolbarStyles:{position:"absolute",top:"-12px",right:"0",left:"0",height:"0",minWidth:"100px",font:"12px/1.0 Arial, Helvetica, sans-serif",textAlign:"center",color:"#333",boxSizing:"border-box",cursor:"default"},toolbarButtonStyles:{display:"inline-block",width:"24px",height:"24px",background:"white",border:"1px solid #999",verticalAlign:"middle"},toolbarButtonSvgStyles:{fill:"#444",stroke:"#444",strokeWidth:"2"}};},function(t,e,n){function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function o(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return !e||"object"!=typeof e&&"function"!=typeof e?t:e}function i(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e);}n.d(e,"a",function(){return a});var l=n(9),a=function(t){function e(){var t,n,i,l;r(this,e);for(var a=arguments.length,s=Array(a),u=0;u<a;u++)s[u]=arguments[u];return n=i=o(this,(t=e.__proto__||Object.getPrototypeOf(e)).call.apply(t,[this].concat(s))),i.onCreate=function(){i.display=document.createElement("div"),Object.assign(i.display.style,i.options.displayStyles),i.overlay.appendChild(i.display);},i.onDestroy=function(){},i.onUpdate=function(){if(i.display&&i.img){var t=i.getCurrentSize();if(i.display.innerHTML=t.join(" &times; "),t[0]>120&&t[1]>30)Object.assign(i.display.style,{right:"4px",bottom:"4px",left:"auto"});else if("right"==i.img.style.float){var e=i.display.getBoundingClientRect();Object.assign(i.display.style,{right:"auto",bottom:"-"+(e.height+4)+"px",left:"-"+(e.width+4)+"px"});}else {var n=i.display.getBoundingClientRect();Object.assign(i.display.style,{right:"-"+(n.width+4)+"px",bottom:"-"+(n.height+4)+"px",left:"auto"});}}},i.getCurrentSize=function(){return [i.img.width,Math.round(i.img.width/i.img.naturalWidth*i.img.naturalHeight)]},l=n,o(i,l)}return i(e,t),e}(l.a);},function(t,e,n){function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function o(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return !e||"object"!=typeof e&&"function"!=typeof e?t:e}function i(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e);}n.d(e,"a",function(){return a});var l=n(9),a=function(t){function e(){var t,n,i,l;r(this,e);for(var a=arguments.length,s=Array(a),u=0;u<a;u++)s[u]=arguments[u];return n=i=o(this,(t=e.__proto__||Object.getPrototypeOf(e)).call.apply(t,[this].concat(s))),i.onCreate=function(){i.boxes=[],i.addBox("nwse-resize"),i.addBox("nesw-resize"),i.addBox("nwse-resize"),i.addBox("nesw-resize"),i.positionBoxes();},i.onDestroy=function(){i.setCursor("");},i.positionBoxes=function(){var t=-parseFloat(i.options.handleStyles.width)/2+"px",e=-parseFloat(i.options.handleStyles.height)/2+"px";[{left:t,top:e},{right:t,top:e},{right:t,bottom:e},{left:t,bottom:e}].forEach(function(t,e){Object.assign(i.boxes[e].style,t);});},i.addBox=function(t){var e=document.createElement("div");Object.assign(e.style,i.options.handleStyles),e.style.cursor=t,e.style.width=i.options.handleStyles.width+"px",e.style.height=i.options.handleStyles.height+"px",e.addEventListener("mousedown",i.handleMousedown,!1),i.overlay.appendChild(e),i.boxes.push(e);},i.handleMousedown=function(t){i.dragBox=t.target,i.dragStartX=t.clientX,i.preDragWidth=i.img.width||i.img.naturalWidth,i.setCursor(i.dragBox.style.cursor),document.addEventListener("mousemove",i.handleDrag,!1),document.addEventListener("mouseup",i.handleMouseup,!1);},i.handleMouseup=function(){i.setCursor(""),document.removeEventListener("mousemove",i.handleDrag),document.removeEventListener("mouseup",i.handleMouseup);},i.handleDrag=function(t){if(i.img){var e=t.clientX-i.dragStartX;i.dragBox===i.boxes[0]||i.dragBox===i.boxes[3]?i.img.width=Math.round(i.preDragWidth-e):i.img.width=Math.round(i.preDragWidth+e),i.requestUpdate();}},i.setCursor=function(t){[document.body,i.img].forEach(function(e){e.style.cursor=t;});},l=n,o(i,l)}return i(e,t),e}(l.a);},function(t,e,n){function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function o(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return !e||"object"!=typeof e&&"function"!=typeof e?t:e}function i(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e);}n.d(e,"a",function(){return _});var l=n(15),a=n.n(l),s=n(112),u=n.n(s),c=n(111),f=n.n(c),h=n(113),p=n.n(h),d=n(9),y=a.a.imports.parchment,v=new y.Attributor.Style("float","float"),b=new y.Attributor.Style("margin","margin"),g=new y.Attributor.Style("display","display"),m=new y.Attributor.Attribute("nameClass","class",{scope:y.Scope.INLINE});a.a.register(m);var _=function(t){function e(){var t,n,i,l;r(this,e);for(var a=arguments.length,s=Array(a),c=0;c<a;c++)s[c]=arguments[c];return n=i=o(this,(t=e.__proto__||Object.getPrototypeOf(e)).call.apply(t,[this].concat(s))),i.onCreate=function(){i.toolbar=document.createElement("div"),Object.assign(i.toolbar.style,i.options.toolbarStyles),i.overlay.appendChild(i.toolbar),i._defineAlignments(),i._addToolbarButtons();},i.onDestroy=function(){},i.onUpdate=function(){},i._defineAlignments=function(){i.alignments=[{icon:u.a,apply:function(){g.add(i.img,"inline"),v.add(i.img,"left"),b.add(i.img,"0 1em 1em 0"),i.img.align="left";},isApplied:function(){return "left"==v.value(i.img)}},{icon:f.a,apply:function(){g.add(i.img,"block"),v.remove(i.img),b.add(i.img,"auto"),i.img.align="center";},isApplied:function(){return "auto"==b.value(i.img)}},{icon:p.a,apply:function(){g.add(i.img,"inline"),v.add(i.img,"right"),b.add(i.img,"0 0 1em 1em"),i.img.align="right";},isApplied:function(){return "right"==v.value(i.img)}}];},i._addToolbarButtons=function(){var t=[];i.alignments.forEach(function(e,n){var r=document.createElement("span");t.push(r),r.innerHTML=e.icon,r.addEventListener("click",function(){t.forEach(function(t){return t.style.filter=""}),e.isApplied()?(v.remove(i.img),b.remove(i.img),g.remove(i.img)):(i._selectButton(r),e.apply()),i.requestUpdate();}),Object.assign(r.style,i.options.toolbarButtonStyles),n>0&&(r.style.borderLeftWidth="0"),Object.assign(r.children[0].style,i.options.toolbarButtonSvgStyles),e.isApplied()&&i._selectButton(r),i.toolbar.appendChild(r);});},i._selectButton=function(t){t.style.filter="invert(20%)";},l=n,o(i,l)}return i(e,t),e}(d.a);},function(t,e,n){var r=n(18),o=n(21),i=n(70),l=n(108),a=o(function(t){return t.push(void 0,i),r(l,void 0,t)});t.exports=a;},function(t,e,n){function r(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return !e||"object"!=typeof e&&"function"!=typeof e?t:e}function o(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e);}function i(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(e,"__esModule",{value:!0});var l=n(15),a=n.n(l),s=n(40),u=n.n(s),c=n(36),f=n(37),h=n(39),p=n(38),d=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r);}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),y=function t(e,n,r){null===e&&(e=Function.prototype);var o=Object.getOwnPropertyDescriptor(e,n);if(void 0===o){var i=Object.getPrototypeOf(e);return null===i?void 0:t(i,n,r)}if("value"in o)return o.value;var l=o.get;if(void 0!==l)return l.call(r)},v={DisplaySize:f.a,Toolbar:h.a,Resize:p.a},b=function t(e){var n=this,r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};i(this,t),this.initializeModules=function(){n.removeModules(),n.modules=n.moduleClasses.map(function(t){return new(v[t]||t)(n)}),n.modules.forEach(function(t){t.onCreate();}),n.onUpdate();},this.onUpdate=function(){n.repositionElements(),n.modules.forEach(function(t){t.onUpdate();});},this.removeModules=function(){n.modules.forEach(function(t){t.onDestroy();}),n.modules=[];},this.handleClick=function(t){if(t.target&&t.target.tagName&&"IMG"===t.target.tagName.toUpperCase()){if(n.img===t.target)return;n.img&&n.hide(),n.show(t.target),t.preventDefault();}else n.img&&n.hide();},this.handleScroll=function(t){n.hide();},this.show=function(t){n.img=t,n.showOverlay(),n.initializeModules();},this.showOverlay=function(){n.overlay&&n.hideOverlay(),n.quill.setSelection(null),n.setUserSelect("none"),document.addEventListener("keyup",n.checkImage,!0),n.quill.root.addEventListener("input",n.checkImage,!0),n.overlay=document.createElement("div"),Object.assign(n.overlay.style,n.options.overlayStyles),n.quill.root.parentNode.appendChild(n.overlay),n.repositionElements();},this.hideOverlay=function(){n.overlay&&(n.quill.root.parentNode.removeChild(n.overlay),n.overlay=void 0,document.removeEventListener("keyup",n.checkImage),n.quill.root.removeEventListener("input",n.checkImage),n.setUserSelect(""));},this.repositionElements=function(){if(n.overlay&&n.img){var t=n.quill.root.parentNode,e=n.img.getBoundingClientRect(),r=t.getBoundingClientRect();Object.assign(n.overlay.style,{left:e.left-r.left-1+t.scrollLeft+"px",top:e.top-r.top+t.scrollTop+"px",width:e.width+"px",height:e.height+"px"});}},this.hide=function(){n.hideOverlay(),n.removeModules(),n.img=void 0;},this.setUserSelect=function(t){["userSelect","mozUserSelect","webkitUserSelect","msUserSelect"].forEach(function(e){n.quill.root.style[e]=t,document.documentElement.style[e]=t;});},this.checkImage=function(t){n.img&&(46!=t.keyCode&&8!=t.keyCode||(Quill||a.a).find(n.img).deleteAt(0),n.hide());},this.quill=e;var o=!1;r.modules&&(o=r.modules.slice()),this.options=u()({},r,c.a),!1!==o&&(this.options.modules=o),document.execCommand("enableObjectResizing",!1,"false"),this.quill.root.addEventListener("click",this.handleClick,!1),this.quill.root.addEventListener("mscontrolselect",this.handleClick,!1),this.quill.root.addEventListener("scroll",this.handleScroll,!1),this.quill.root.parentNode.style.position=this.quill.root.parentNode.style.position||"relative",this.moduleClasses=this.options.modules,this.modules=[];};if(e.default=b,Quill){var g=["alt","height","width","style"],m=Quill.import("formats/image"),_=function(t){function e(){return i(this,e),r(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return o(e,t),d(e,[{key:"format",value:function(t,n){g.indexOf(t)>-1?n?this.domNode.setAttribute(t,n):this.domNode.removeAttribute(t):y(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"format",this).call(this,t,n);}}],[{key:"formats",value:function(t){return g.reduce(function(e,n){return t.hasAttribute(n)&&(e[n]=t.getAttribute(n)),e},{})}}]),e}(m);Quill.register(_,!0),"function"!=typeof Object.assign&&(Object.assign=function(t){if(null==t)throw new TypeError("Cannot convert undefined or null to object");t=Object(t);for(var e=1;e<arguments.length;e++){var n=arguments[e];if(null!=n)for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(t[r]=n[r]);}return t}),Quill.register("modules/imageResize",b);}},function(t,e,n){function r(t){var e=t.length;if(e%4>0)throw new Error("Invalid string. Length must be a multiple of 4");var n=t.indexOf("=");return -1===n&&(n=e),[n,n===e?0:4-n%4]}function o(t){var e=r(t),n=e[0],o=e[1];return 3*(n+o)/4-o}function i(t,e,n){return 3*(e+n)/4-n}function l(t){for(var e,n=r(t),o=n[0],l=n[1],a=new h(i(t,o,l)),s=0,u=l>0?o-4:o,c=0;c<u;c+=4)e=f[t.charCodeAt(c)]<<18|f[t.charCodeAt(c+1)]<<12|f[t.charCodeAt(c+2)]<<6|f[t.charCodeAt(c+3)],a[s++]=e>>16&255,a[s++]=e>>8&255,a[s++]=255&e;return 2===l&&(e=f[t.charCodeAt(c)]<<2|f[t.charCodeAt(c+1)]>>4,a[s++]=255&e),1===l&&(e=f[t.charCodeAt(c)]<<10|f[t.charCodeAt(c+1)]<<4|f[t.charCodeAt(c+2)]>>2,a[s++]=e>>8&255,a[s++]=255&e),a}function a(t){return c[t>>18&63]+c[t>>12&63]+c[t>>6&63]+c[63&t]}function s(t,e,n){for(var r,o=[],i=e;i<n;i+=3)r=(t[i]<<16&16711680)+(t[i+1]<<8&65280)+(255&t[i+2]),o.push(a(r));return o.join("")}function u(t){for(var e,n=t.length,r=n%3,o=[],i=0,l=n-r;i<l;i+=16383)o.push(s(t,i,i+16383>l?l:i+16383));return 1===r?(e=t[n-1],o.push(c[e>>2]+c[e<<4&63]+"==")):2===r&&(e=(t[n-2]<<8)+t[n-1],o.push(c[e>>10]+c[e>>4&63]+c[e<<2&63]+"=")),o.join("")}e.byteLength=o,e.toByteArray=l,e.fromByteArray=u;for(var c=[],f=[],h="undefined"!=typeof Uint8Array?Uint8Array:Array,p="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",d=0,y=p.length;d<y;++d)c[d]=p[d],f[p.charCodeAt(d)]=d;f["-".charCodeAt(0)]=62,f["_".charCodeAt(0)]=63;},function(t,e,n){(function(t){function r(){return i.TYPED_ARRAY_SUPPORT?2147483647:1073741823}function o(t,e){if(r()<e)throw new RangeError("Invalid typed array length");return i.TYPED_ARRAY_SUPPORT?(t=new Uint8Array(e),t.__proto__=i.prototype):(null===t&&(t=new i(e)),t.length=e),t}function i(t,e,n){if(!(i.TYPED_ARRAY_SUPPORT||this instanceof i))return new i(t,e,n);if("number"==typeof t){if("string"==typeof e)throw new Error("If encoding is specified then the first argument must be a string");return u(this,t)}return l(this,t,e,n)}function l(t,e,n,r){if("number"==typeof e)throw new TypeError('"value" argument must not be a number');return "undefined"!=typeof ArrayBuffer&&e instanceof ArrayBuffer?h(t,e,n,r):"string"==typeof e?c(t,e,n):p(t,e)}function a(t){if("number"!=typeof t)throw new TypeError('"size" argument must be a number');if(t<0)throw new RangeError('"size" argument must not be negative')}function s(t,e,n,r){return a(e),e<=0?o(t,e):void 0!==n?"string"==typeof r?o(t,e).fill(n,r):o(t,e).fill(n):o(t,e)}function u(t,e){if(a(e),t=o(t,e<0?0:0|d(e)),!i.TYPED_ARRAY_SUPPORT)for(var n=0;n<e;++n)t[n]=0;return t}function c(t,e,n){if("string"==typeof n&&""!==n||(n="utf8"),!i.isEncoding(n))throw new TypeError('"encoding" must be a valid string encoding');var r=0|v(e,n);t=o(t,r);var l=t.write(e,n);return l!==r&&(t=t.slice(0,l)),t}function f(t,e){var n=e.length<0?0:0|d(e.length);t=o(t,n);for(var r=0;r<n;r+=1)t[r]=255&e[r];return t}function h(t,e,n,r){if(e.byteLength,n<0||e.byteLength<n)throw new RangeError("'offset' is out of bounds");if(e.byteLength<n+(r||0))throw new RangeError("'length' is out of bounds");return e=void 0===n&&void 0===r?new Uint8Array(e):void 0===r?new Uint8Array(e,n):new Uint8Array(e,n,r),i.TYPED_ARRAY_SUPPORT?(t=e,t.__proto__=i.prototype):t=f(t,e),t}function p(t,e){if(i.isBuffer(e)){var n=0|d(e.length);return t=o(t,n),0===t.length?t:(e.copy(t,0,0,n),t)}if(e){if("undefined"!=typeof ArrayBuffer&&e.buffer instanceof ArrayBuffer||"length"in e)return "number"!=typeof e.length||G(e.length)?o(t,0):f(t,e);if("Buffer"===e.type&&Q(e.data))return f(t,e.data)}throw new TypeError("First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.")}function d(t){if(t>=r())throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x"+r().toString(16)+" bytes");return 0|t}function y(t){return +t!=t&&(t=0),i.alloc(+t)}function v(t,e){if(i.isBuffer(t))return t.length;if("undefined"!=typeof ArrayBuffer&&"function"==typeof ArrayBuffer.isView&&(ArrayBuffer.isView(t)||t instanceof ArrayBuffer))return t.byteLength;"string"!=typeof t&&(t=""+t);var n=t.length;if(0===n)return 0;for(var r=!1;;)switch(e){case"ascii":case"latin1":case"binary":return n;case"utf8":case"utf-8":case void 0:return K(t).length;case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return 2*n;case"hex":return n>>>1;case"base64":return W(t).length;default:if(r)return K(t).length;e=(""+e).toLowerCase(),r=!0;}}function b(t,e,n){var r=!1;if((void 0===e||e<0)&&(e=0),e>this.length)return "";if((void 0===n||n>this.length)&&(n=this.length),n<=0)return "";if(n>>>=0,e>>>=0,n<=e)return "";for(t||(t="utf8");;)switch(t){case"hex":return q(this,e,n);case"utf8":case"utf-8":return N(this,e,n);case"ascii":return S(this,e,n);case"latin1":case"binary":return P(this,e,n);case"base64":return j(this,e,n);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return C(this,e,n);default:if(r)throw new TypeError("Unknown encoding: "+t);t=(t+"").toLowerCase(),r=!0;}}function g(t,e,n){var r=t[e];t[e]=t[n],t[n]=r;}function m(t,e,n,r,o){if(0===t.length)return -1;if("string"==typeof n?(r=n,n=0):n>2147483647?n=2147483647:n<-2147483648&&(n=-2147483648),n=+n,isNaN(n)&&(n=o?0:t.length-1),n<0&&(n=t.length+n),n>=t.length){if(o)return -1;n=t.length-1;}else if(n<0){if(!o)return -1;n=0;}if("string"==typeof e&&(e=i.from(e,r)),i.isBuffer(e))return 0===e.length?-1:_(t,e,n,r,o);if("number"==typeof e)return e&=255,i.TYPED_ARRAY_SUPPORT&&"function"==typeof Uint8Array.prototype.indexOf?o?Uint8Array.prototype.indexOf.call(t,e,n):Uint8Array.prototype.lastIndexOf.call(t,e,n):_(t,[e],n,r,o);throw new TypeError("val must be string, number or Buffer")}function _(t,e,n,r,o){function i(t,e){return 1===l?t[e]:t.readUInt16BE(e*l)}var l=1,a=t.length,s=e.length;if(void 0!==r&&("ucs2"===(r=String(r).toLowerCase())||"ucs-2"===r||"utf16le"===r||"utf-16le"===r)){if(t.length<2||e.length<2)return -1;l=2,a/=2,s/=2,n/=2;}var u;if(o){var c=-1;for(u=n;u<a;u++)if(i(t,u)===i(e,-1===c?0:u-c)){if(-1===c&&(c=u),u-c+1===s)return c*l}else -1!==c&&(u-=u-c),c=-1;}else for(n+s>a&&(n=a-s),u=n;u>=0;u--){for(var f=!0,h=0;h<s;h++)if(i(t,u+h)!==i(e,h)){f=!1;break}if(f)return u}return -1}function O(t,e,n,r){n=Number(n)||0;var o=t.length-n;r?(r=Number(r))>o&&(r=o):r=o;var i=e.length;if(i%2!=0)throw new TypeError("Invalid hex string");r>i/2&&(r=i/2);for(var l=0;l<r;++l){var a=parseInt(e.substr(2*l,2),16);if(isNaN(a))return l;t[n+l]=a;}return l}function w(t,e,n,r){return Z(K(e,t.length-n),t,n,r)}function x(t,e,n,r){return Z(Y(e),t,n,r)}function E(t,e,n,r){return x(t,e,n,r)}function k(t,e,n,r){return Z(W(e),t,n,r)}function A(t,e,n,r){return Z(V(e,t.length-n),t,n,r)}function j(t,e,n){return 0===e&&n===t.length?X.fromByteArray(t):X.fromByteArray(t.slice(e,n))}function N(t,e,n){n=Math.min(t.length,n);for(var r=[],o=e;o<n;){var i=t[o],l=null,a=i>239?4:i>223?3:i>191?2:1;if(o+a<=n){var s,u,c,f;switch(a){case 1:i<128&&(l=i);break;case 2:s=t[o+1],128==(192&s)&&(f=(31&i)<<6|63&s)>127&&(l=f);break;case 3:s=t[o+1],u=t[o+2],128==(192&s)&&128==(192&u)&&(f=(15&i)<<12|(63&s)<<6|63&u)>2047&&(f<55296||f>57343)&&(l=f);break;case 4:s=t[o+1],u=t[o+2],c=t[o+3],128==(192&s)&&128==(192&u)&&128==(192&c)&&(f=(15&i)<<18|(63&s)<<12|(63&u)<<6|63&c)>65535&&f<1114112&&(l=f);}}null===l?(l=65533,a=1):l>65535&&(l-=65536,r.push(l>>>10&1023|55296),l=56320|1023&l),r.push(l),o+=a;}return T(r)}function T(t){var e=t.length;if(e<=J)return String.fromCharCode.apply(String,t);for(var n="",r=0;r<e;)n+=String.fromCharCode.apply(String,t.slice(r,r+=J));return n}function S(t,e,n){var r="";n=Math.min(t.length,n);for(var o=e;o<n;++o)r+=String.fromCharCode(127&t[o]);return r}function P(t,e,n){var r="";n=Math.min(t.length,n);for(var o=e;o<n;++o)r+=String.fromCharCode(t[o]);return r}function q(t,e,n){var r=t.length;(!e||e<0)&&(e=0),(!n||n<0||n>r)&&(n=r);for(var o="",i=e;i<n;++i)o+=H(t[i]);return o}function C(t,e,n){for(var r=t.slice(e,n),o="",i=0;i<r.length;i+=2)o+=String.fromCharCode(r[i]+256*r[i+1]);return o}function L(t,e,n){if(t%1!=0||t<0)throw new RangeError("offset is not uint");if(t+e>n)throw new RangeError("Trying to access beyond buffer length")}function R(t,e,n,r,o,l){if(!i.isBuffer(t))throw new TypeError('"buffer" argument must be a Buffer instance');if(e>o||e<l)throw new RangeError('"value" argument is out of bounds');if(n+r>t.length)throw new RangeError("Index out of range")}function M(t,e,n,r){e<0&&(e=65535+e+1);for(var o=0,i=Math.min(t.length-n,2);o<i;++o)t[n+o]=(e&255<<8*(r?o:1-o))>>>8*(r?o:1-o);}function B(t,e,n,r){e<0&&(e=4294967295+e+1);for(var o=0,i=Math.min(t.length-n,4);o<i;++o)t[n+o]=e>>>8*(r?o:3-o)&255;}function I(t,e,n,r,o,i){if(n+r>t.length)throw new RangeError("Index out of range");if(n<0)throw new RangeError("Index out of range")}function D(t,e,n,r,o){return o||I(t,e,n,4),$.write(t,e,n,r,23,4),n+4}function U(t,e,n,r,o){return o||I(t,e,n,8),$.write(t,e,n,r,52,8),n+8}function F(t){if(t=z(t).replace(tt,""),t.length<2)return "";for(;t.length%4!=0;)t+="=";return t}function z(t){return t.trim?t.trim():t.replace(/^\s+|\s+$/g,"")}function H(t){return t<16?"0"+t.toString(16):t.toString(16)}function K(t,e){e=e||1/0;for(var n,r=t.length,o=null,i=[],l=0;l<r;++l){if((n=t.charCodeAt(l))>55295&&n<57344){if(!o){if(n>56319){(e-=3)>-1&&i.push(239,191,189);continue}if(l+1===r){(e-=3)>-1&&i.push(239,191,189);continue}o=n;continue}if(n<56320){(e-=3)>-1&&i.push(239,191,189),o=n;continue}n=65536+(o-55296<<10|n-56320);}else o&&(e-=3)>-1&&i.push(239,191,189);if(o=null,n<128){if((e-=1)<0)break;i.push(n);}else if(n<2048){if((e-=2)<0)break;i.push(n>>6|192,63&n|128);}else if(n<65536){if((e-=3)<0)break;i.push(n>>12|224,n>>6&63|128,63&n|128);}else {if(!(n<1114112))throw new Error("Invalid code point");if((e-=4)<0)break;i.push(n>>18|240,n>>12&63|128,n>>6&63|128,63&n|128);}}return i}function Y(t){for(var e=[],n=0;n<t.length;++n)e.push(255&t.charCodeAt(n));return e}function V(t,e){for(var n,r,o,i=[],l=0;l<t.length&&!((e-=2)<0);++l)n=t.charCodeAt(l),r=n>>8,o=n%256,i.push(o),i.push(r);return i}function W(t){return X.toByteArray(F(t))}function Z(t,e,n,r){for(var o=0;o<r&&!(o+n>=e.length||o>=t.length);++o)e[o+n]=t[o];return o}function G(t){return t!==t}/*!
     * The buffer module from node.js, for the browser.
     *
     * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
     * @license  MIT
     */
    var X=n(42),$=n(44),Q=n(45);e.Buffer=i,e.SlowBuffer=y,e.INSPECT_MAX_BYTES=50,i.TYPED_ARRAY_SUPPORT=void 0!==t.TYPED_ARRAY_SUPPORT?t.TYPED_ARRAY_SUPPORT:function(){try{var t=new Uint8Array(1);return t.__proto__={__proto__:Uint8Array.prototype,foo:function(){return 42}},42===t.foo()&&"function"==typeof t.subarray&&0===t.subarray(1,1).byteLength}catch(t){return !1}}(),e.kMaxLength=r(),i.poolSize=8192,i._augment=function(t){return t.__proto__=i.prototype,t},i.from=function(t,e,n){return l(null,t,e,n)},i.TYPED_ARRAY_SUPPORT&&(i.prototype.__proto__=Uint8Array.prototype,i.__proto__=Uint8Array,"undefined"!=typeof Symbol&&Symbol.species&&i[Symbol.species]===i&&Object.defineProperty(i,Symbol.species,{value:null,configurable:!0})),i.alloc=function(t,e,n){return s(null,t,e,n)},i.allocUnsafe=function(t){return u(null,t)},i.allocUnsafeSlow=function(t){return u(null,t)},i.isBuffer=function(t){return !(null==t||!t._isBuffer)},i.compare=function(t,e){if(!i.isBuffer(t)||!i.isBuffer(e))throw new TypeError("Arguments must be Buffers");if(t===e)return 0;for(var n=t.length,r=e.length,o=0,l=Math.min(n,r);o<l;++o)if(t[o]!==e[o]){n=t[o],r=e[o];break}return n<r?-1:r<n?1:0},i.isEncoding=function(t){switch(String(t).toLowerCase()){case"hex":case"utf8":case"utf-8":case"ascii":case"latin1":case"binary":case"base64":case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return !0;default:return !1}},i.concat=function(t,e){if(!Q(t))throw new TypeError('"list" argument must be an Array of Buffers');if(0===t.length)return i.alloc(0);var n;if(void 0===e)for(e=0,n=0;n<t.length;++n)e+=t[n].length;var r=i.allocUnsafe(e),o=0;for(n=0;n<t.length;++n){var l=t[n];if(!i.isBuffer(l))throw new TypeError('"list" argument must be an Array of Buffers');l.copy(r,o),o+=l.length;}return r},i.byteLength=v,i.prototype._isBuffer=!0,i.prototype.swap16=function(){var t=this.length;if(t%2!=0)throw new RangeError("Buffer size must be a multiple of 16-bits");for(var e=0;e<t;e+=2)g(this,e,e+1);return this},i.prototype.swap32=function(){var t=this.length;if(t%4!=0)throw new RangeError("Buffer size must be a multiple of 32-bits");for(var e=0;e<t;e+=4)g(this,e,e+3),g(this,e+1,e+2);return this},i.prototype.swap64=function(){var t=this.length;if(t%8!=0)throw new RangeError("Buffer size must be a multiple of 64-bits");for(var e=0;e<t;e+=8)g(this,e,e+7),g(this,e+1,e+6),g(this,e+2,e+5),g(this,e+3,e+4);return this},i.prototype.toString=function(){var t=0|this.length;return 0===t?"":0===arguments.length?N(this,0,t):b.apply(this,arguments)},i.prototype.equals=function(t){if(!i.isBuffer(t))throw new TypeError("Argument must be a Buffer");return this===t||0===i.compare(this,t)},i.prototype.inspect=function(){var t="",n=e.INSPECT_MAX_BYTES;return this.length>0&&(t=this.toString("hex",0,n).match(/.{2}/g).join(" "),this.length>n&&(t+=" ... ")),"<Buffer "+t+">"},i.prototype.compare=function(t,e,n,r,o){if(!i.isBuffer(t))throw new TypeError("Argument must be a Buffer");if(void 0===e&&(e=0),void 0===n&&(n=t?t.length:0),void 0===r&&(r=0),void 0===o&&(o=this.length),e<0||n>t.length||r<0||o>this.length)throw new RangeError("out of range index");if(r>=o&&e>=n)return 0;if(r>=o)return -1;if(e>=n)return 1;if(e>>>=0,n>>>=0,r>>>=0,o>>>=0,this===t)return 0;for(var l=o-r,a=n-e,s=Math.min(l,a),u=this.slice(r,o),c=t.slice(e,n),f=0;f<s;++f)if(u[f]!==c[f]){l=u[f],a=c[f];break}return l<a?-1:a<l?1:0},i.prototype.includes=function(t,e,n){return -1!==this.indexOf(t,e,n)},i.prototype.indexOf=function(t,e,n){return m(this,t,e,n,!0)},i.prototype.lastIndexOf=function(t,e,n){return m(this,t,e,n,!1)},i.prototype.write=function(t,e,n,r){if(void 0===e)r="utf8",n=this.length,e=0;else if(void 0===n&&"string"==typeof e)r=e,n=this.length,e=0;else {if(!isFinite(e))throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");e|=0,isFinite(n)?(n|=0,void 0===r&&(r="utf8")):(r=n,n=void 0);}var o=this.length-e;if((void 0===n||n>o)&&(n=o),t.length>0&&(n<0||e<0)||e>this.length)throw new RangeError("Attempt to write outside buffer bounds");r||(r="utf8");for(var i=!1;;)switch(r){case"hex":return O(this,t,e,n);case"utf8":case"utf-8":return w(this,t,e,n);case"ascii":return x(this,t,e,n);case"latin1":case"binary":return E(this,t,e,n);case"base64":return k(this,t,e,n);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return A(this,t,e,n);default:if(i)throw new TypeError("Unknown encoding: "+r);r=(""+r).toLowerCase(),i=!0;}},i.prototype.toJSON=function(){return {type:"Buffer",data:Array.prototype.slice.call(this._arr||this,0)}};var J=4096;i.prototype.slice=function(t,e){var n=this.length;t=~~t,e=void 0===e?n:~~e,t<0?(t+=n)<0&&(t=0):t>n&&(t=n),e<0?(e+=n)<0&&(e=0):e>n&&(e=n),e<t&&(e=t);var r;if(i.TYPED_ARRAY_SUPPORT)r=this.subarray(t,e),r.__proto__=i.prototype;else {var o=e-t;r=new i(o,void 0);for(var l=0;l<o;++l)r[l]=this[l+t];}return r},i.prototype.readUIntLE=function(t,e,n){t|=0,e|=0,n||L(t,e,this.length);for(var r=this[t],o=1,i=0;++i<e&&(o*=256);)r+=this[t+i]*o;return r},i.prototype.readUIntBE=function(t,e,n){t|=0,e|=0,n||L(t,e,this.length);for(var r=this[t+--e],o=1;e>0&&(o*=256);)r+=this[t+--e]*o;return r},i.prototype.readUInt8=function(t,e){return e||L(t,1,this.length),this[t]},i.prototype.readUInt16LE=function(t,e){return e||L(t,2,this.length),this[t]|this[t+1]<<8},i.prototype.readUInt16BE=function(t,e){return e||L(t,2,this.length),this[t]<<8|this[t+1]},i.prototype.readUInt32LE=function(t,e){return e||L(t,4,this.length),(this[t]|this[t+1]<<8|this[t+2]<<16)+16777216*this[t+3]},i.prototype.readUInt32BE=function(t,e){return e||L(t,4,this.length),16777216*this[t]+(this[t+1]<<16|this[t+2]<<8|this[t+3])},i.prototype.readIntLE=function(t,e,n){t|=0,e|=0,n||L(t,e,this.length);for(var r=this[t],o=1,i=0;++i<e&&(o*=256);)r+=this[t+i]*o;return o*=128,r>=o&&(r-=Math.pow(2,8*e)),r},i.prototype.readIntBE=function(t,e,n){t|=0,e|=0,n||L(t,e,this.length);for(var r=e,o=1,i=this[t+--r];r>0&&(o*=256);)i+=this[t+--r]*o;return o*=128,i>=o&&(i-=Math.pow(2,8*e)),i},i.prototype.readInt8=function(t,e){return e||L(t,1,this.length),128&this[t]?-1*(255-this[t]+1):this[t]},i.prototype.readInt16LE=function(t,e){e||L(t,2,this.length);var n=this[t]|this[t+1]<<8;return 32768&n?4294901760|n:n},i.prototype.readInt16BE=function(t,e){e||L(t,2,this.length);var n=this[t+1]|this[t]<<8;return 32768&n?4294901760|n:n},i.prototype.readInt32LE=function(t,e){return e||L(t,4,this.length),this[t]|this[t+1]<<8|this[t+2]<<16|this[t+3]<<24},i.prototype.readInt32BE=function(t,e){return e||L(t,4,this.length),this[t]<<24|this[t+1]<<16|this[t+2]<<8|this[t+3]},i.prototype.readFloatLE=function(t,e){return e||L(t,4,this.length),$.read(this,t,!0,23,4)},i.prototype.readFloatBE=function(t,e){return e||L(t,4,this.length),$.read(this,t,!1,23,4)},i.prototype.readDoubleLE=function(t,e){return e||L(t,8,this.length),$.read(this,t,!0,52,8)},i.prototype.readDoubleBE=function(t,e){return e||L(t,8,this.length),$.read(this,t,!1,52,8)},i.prototype.writeUIntLE=function(t,e,n,r){if(t=+t,e|=0,n|=0,!r){R(this,t,e,n,Math.pow(2,8*n)-1,0);}var o=1,i=0;for(this[e]=255&t;++i<n&&(o*=256);)this[e+i]=t/o&255;return e+n},i.prototype.writeUIntBE=function(t,e,n,r){if(t=+t,e|=0,n|=0,!r){R(this,t,e,n,Math.pow(2,8*n)-1,0);}var o=n-1,i=1;for(this[e+o]=255&t;--o>=0&&(i*=256);)this[e+o]=t/i&255;return e+n},i.prototype.writeUInt8=function(t,e,n){return t=+t,e|=0,n||R(this,t,e,1,255,0),i.TYPED_ARRAY_SUPPORT||(t=Math.floor(t)),this[e]=255&t,e+1},i.prototype.writeUInt16LE=function(t,e,n){return t=+t,e|=0,n||R(this,t,e,2,65535,0),i.TYPED_ARRAY_SUPPORT?(this[e]=255&t,this[e+1]=t>>>8):M(this,t,e,!0),e+2},i.prototype.writeUInt16BE=function(t,e,n){return t=+t,e|=0,n||R(this,t,e,2,65535,0),i.TYPED_ARRAY_SUPPORT?(this[e]=t>>>8,this[e+1]=255&t):M(this,t,e,!1),e+2},i.prototype.writeUInt32LE=function(t,e,n){return t=+t,e|=0,n||R(this,t,e,4,4294967295,0),i.TYPED_ARRAY_SUPPORT?(this[e+3]=t>>>24,this[e+2]=t>>>16,this[e+1]=t>>>8,this[e]=255&t):B(this,t,e,!0),e+4},i.prototype.writeUInt32BE=function(t,e,n){return t=+t,e|=0,n||R(this,t,e,4,4294967295,0),i.TYPED_ARRAY_SUPPORT?(this[e]=t>>>24,this[e+1]=t>>>16,this[e+2]=t>>>8,this[e+3]=255&t):B(this,t,e,!1),e+4},i.prototype.writeIntLE=function(t,e,n,r){if(t=+t,e|=0,!r){var o=Math.pow(2,8*n-1);R(this,t,e,n,o-1,-o);}var i=0,l=1,a=0;for(this[e]=255&t;++i<n&&(l*=256);)t<0&&0===a&&0!==this[e+i-1]&&(a=1),this[e+i]=(t/l>>0)-a&255;return e+n},i.prototype.writeIntBE=function(t,e,n,r){if(t=+t,e|=0,!r){var o=Math.pow(2,8*n-1);R(this,t,e,n,o-1,-o);}var i=n-1,l=1,a=0;for(this[e+i]=255&t;--i>=0&&(l*=256);)t<0&&0===a&&0!==this[e+i+1]&&(a=1),this[e+i]=(t/l>>0)-a&255;return e+n},i.prototype.writeInt8=function(t,e,n){return t=+t,e|=0,n||R(this,t,e,1,127,-128),i.TYPED_ARRAY_SUPPORT||(t=Math.floor(t)),t<0&&(t=255+t+1),this[e]=255&t,e+1},i.prototype.writeInt16LE=function(t,e,n){return t=+t,e|=0,n||R(this,t,e,2,32767,-32768),i.TYPED_ARRAY_SUPPORT?(this[e]=255&t,this[e+1]=t>>>8):M(this,t,e,!0),e+2},i.prototype.writeInt16BE=function(t,e,n){return t=+t,e|=0,n||R(this,t,e,2,32767,-32768),i.TYPED_ARRAY_SUPPORT?(this[e]=t>>>8,this[e+1]=255&t):M(this,t,e,!1),e+2},i.prototype.writeInt32LE=function(t,e,n){return t=+t,e|=0,n||R(this,t,e,4,2147483647,-2147483648),i.TYPED_ARRAY_SUPPORT?(this[e]=255&t,this[e+1]=t>>>8,this[e+2]=t>>>16,this[e+3]=t>>>24):B(this,t,e,!0),e+4},i.prototype.writeInt32BE=function(t,e,n){return t=+t,e|=0,n||R(this,t,e,4,2147483647,-2147483648),t<0&&(t=4294967295+t+1),i.TYPED_ARRAY_SUPPORT?(this[e]=t>>>24,this[e+1]=t>>>16,this[e+2]=t>>>8,this[e+3]=255&t):B(this,t,e,!1),e+4},i.prototype.writeFloatLE=function(t,e,n){return D(this,t,e,!0,n)},i.prototype.writeFloatBE=function(t,e,n){return D(this,t,e,!1,n)},i.prototype.writeDoubleLE=function(t,e,n){return U(this,t,e,!0,n)},i.prototype.writeDoubleBE=function(t,e,n){return U(this,t,e,!1,n)},i.prototype.copy=function(t,e,n,r){if(n||(n=0),r||0===r||(r=this.length),e>=t.length&&(e=t.length),e||(e=0),r>0&&r<n&&(r=n),r===n)return 0;if(0===t.length||0===this.length)return 0;if(e<0)throw new RangeError("targetStart out of bounds");if(n<0||n>=this.length)throw new RangeError("sourceStart out of bounds");if(r<0)throw new RangeError("sourceEnd out of bounds");r>this.length&&(r=this.length),t.length-e<r-n&&(r=t.length-e+n);var o,l=r-n;if(this===t&&n<e&&e<r)for(o=l-1;o>=0;--o)t[o+e]=this[o+n];else if(l<1e3||!i.TYPED_ARRAY_SUPPORT)for(o=0;o<l;++o)t[o+e]=this[o+n];else Uint8Array.prototype.set.call(t,this.subarray(n,n+l),e);return l},i.prototype.fill=function(t,e,n,r){if("string"==typeof t){if("string"==typeof e?(r=e,e=0,n=this.length):"string"==typeof n&&(r=n,n=this.length),1===t.length){var o=t.charCodeAt(0);o<256&&(t=o);}if(void 0!==r&&"string"!=typeof r)throw new TypeError("encoding must be a string");if("string"==typeof r&&!i.isEncoding(r))throw new TypeError("Unknown encoding: "+r)}else "number"==typeof t&&(t&=255);if(e<0||this.length<e||this.length<n)throw new RangeError("Out of range index");if(n<=e)return this;e>>>=0,n=void 0===n?this.length:n>>>0,t||(t=0);var l;if("number"==typeof t)for(l=e;l<n;++l)this[l]=t;else {var a=i.isBuffer(t)?t:K(new i(t,r).toString()),s=a.length;for(l=0;l<n-e;++l)this[l+e]=a[l%s];}return this};var tt=/[^+\/0-9A-Za-z-_]/g;}).call(e,n(35));},function(t,e){e.read=function(t,e,n,r,o){var i,l,a=8*o-r-1,s=(1<<a)-1,u=s>>1,c=-7,f=n?o-1:0,h=n?-1:1,p=t[e+f];for(f+=h,i=p&(1<<-c)-1,p>>=-c,c+=a;c>0;i=256*i+t[e+f],f+=h,c-=8);for(l=i&(1<<-c)-1,i>>=-c,c+=r;c>0;l=256*l+t[e+f],f+=h,c-=8);if(0===i)i=1-u;else {if(i===s)return l?NaN:1/0*(p?-1:1);l+=Math.pow(2,r),i-=u;}return (p?-1:1)*l*Math.pow(2,i-r)},e.write=function(t,e,n,r,o,i){var l,a,s,u=8*i-o-1,c=(1<<u)-1,f=c>>1,h=23===o?Math.pow(2,-24)-Math.pow(2,-77):0,p=r?0:i-1,d=r?1:-1,y=e<0||0===e&&1/e<0?1:0;for(e=Math.abs(e),isNaN(e)||e===1/0?(a=isNaN(e)?1:0,l=c):(l=Math.floor(Math.log(e)/Math.LN2),e*(s=Math.pow(2,-l))<1&&(l--,s*=2),e+=l+f>=1?h/s:h*Math.pow(2,1-f),e*s>=2&&(l++,s/=2),l+f>=c?(a=0,l=c):l+f>=1?(a=(e*s-1)*Math.pow(2,o),l+=f):(a=e*Math.pow(2,f-1)*Math.pow(2,o),l=0));o>=8;t[n+p]=255&a,p+=d,a/=256,o-=8);for(l=l<<o|a,u+=o;u>0;t[n+p]=255&l,p+=d,l/=256,u-=8);t[n+p-d]|=128*y;};},function(t,e){var n={}.toString;t.exports=Array.isArray||function(t){return "[object Array]"==n.call(t)};},function(t,e,n){function r(t){var e=-1,n=null==t?0:t.length;for(this.clear();++e<n;){var r=t[e];this.set(r[0],r[1]);}}var o=n(73),i=n(74),l=n(75),a=n(76),s=n(77);r.prototype.clear=o,r.prototype.delete=i,r.prototype.get=l,r.prototype.has=a,r.prototype.set=s,t.exports=r;},function(t,e,n){function r(t){var e=-1,n=null==t?0:t.length;for(this.clear();++e<n;){var r=t[e];this.set(r[0],r[1]);}}var o=n(87),i=n(88),l=n(89),a=n(90),s=n(91);r.prototype.clear=o,r.prototype.delete=i,r.prototype.get=l,r.prototype.has=a,r.prototype.set=s,t.exports=r;},function(t,e,n){function r(t){var e=this.__data__=new o(t);this.size=e.size;}var o=n(3),i=n(99),l=n(100),a=n(101),s=n(102),u=n(103);r.prototype.clear=i,r.prototype.delete=l,r.prototype.get=a,r.prototype.has=s,r.prototype.set=u,t.exports=r;},function(t,e,n){var r=n(1),o=r.Uint8Array;t.exports=o;},function(t,e,n){function r(t,e){var n=l(t),r=!n&&i(t),c=!n&&!r&&a(t),h=!n&&!r&&!c&&u(t),p=n||r||c||h,d=p?o(t.length,String):[],y=d.length;for(var v in t)!e&&!f.call(t,v)||p&&("length"==v||c&&("offset"==v||"parent"==v)||h&&("buffer"==v||"byteLength"==v||"byteOffset"==v)||s(v,y))||d.push(v);return d}var o=n(60),i=n(29),l=n(30),a=n(31),s=n(25),u=n(33),c=Object.prototype,f=c.hasOwnProperty;t.exports=r;},function(t,e,n){function r(t,e,n){var r=t[e];a.call(t,e)&&i(r,n)&&(void 0!==n||e in t)||o(t,e,n);}var o=n(10),i=n(8),l=Object.prototype,a=l.hasOwnProperty;t.exports=r;},function(t,e,n){var r=n(0),o=Object.create,i=function(){function t(){}return function(e){if(!r(e))return {};if(o)return o(e);t.prototype=e;var n=new t;return t.prototype=void 0,n}}();t.exports=i;},function(t,e,n){var r=n(69),o=r();t.exports=o;},function(t,e,n){function r(t){return i(t)&&o(t)==l}var o=n(5),i=n(2),l="[object Arguments]";t.exports=r;},function(t,e,n){function r(t){return !(!l(t)||i(t))&&(o(t)?d:u).test(a(t))}var o=n(13),i=n(81),l=n(0),a=n(104),s=/[\\^$.*+?()[\]{}|]/g,u=/^\[object .+?Constructor\]$/,c=Function.prototype,f=Object.prototype,h=c.toString,p=f.hasOwnProperty,d=RegExp("^"+h.call(p).replace(s,"\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,"$1.*?")+"$");t.exports=r;},function(t,e,n){function r(t){return l(t)&&i(t.length)&&!!a[o(t)]}var o=n(5),i=n(32),l=n(2),a={};a["[object Float32Array]"]=a["[object Float64Array]"]=a["[object Int8Array]"]=a["[object Int16Array]"]=a["[object Int32Array]"]=a["[object Uint8Array]"]=a["[object Uint8ClampedArray]"]=a["[object Uint16Array]"]=a["[object Uint32Array]"]=!0,a["[object Arguments]"]=a["[object Array]"]=a["[object ArrayBuffer]"]=a["[object Boolean]"]=a["[object DataView]"]=a["[object Date]"]=a["[object Error]"]=a["[object Function]"]=a["[object Map]"]=a["[object Number]"]=a["[object Object]"]=a["[object RegExp]"]=a["[object Set]"]=a["[object String]"]=a["[object WeakMap]"]=!1,t.exports=r;},function(t,e,n){function r(t){if(!o(t))return l(t);var e=i(t),n=[];for(var r in t)("constructor"!=r||!e&&s.call(t,r))&&n.push(r);return n}var o=n(0),i=n(26),l=n(92),a=Object.prototype,s=a.hasOwnProperty;t.exports=r;},function(t,e,n){function r(t,e,n,r,m,_,O){var w=b(t,n),x=b(e,n),E=O.get(x);if(E)return void o(t,n,E);var k=_?_(w,x,n+"",t,e,O):void 0,A=void 0===k;if(A){var j=c(x),N=!j&&h(x),T=!j&&!N&&v(x);k=x,j||N||T?c(w)?k=w:f(w)?k=a(w):N?(A=!1,k=i(x,!0)):T?(A=!1,k=l(x,!0)):k=[]:y(x)||u(x)?(k=w,u(w)?k=g(w):(!d(w)||r&&p(w))&&(k=s(x))):A=!1;}A&&(O.set(x,k),m(k,x,r,_,O),O.delete(x)),o(t,n,k);}var o=n(19),i=n(63),l=n(64),a=n(65),s=n(78),u=n(29),c=n(30),f=n(106),h=n(31),p=n(13),d=n(0),y=n(107),v=n(33),b=n(27),g=n(110);t.exports=r;},function(t,e,n){var r=n(105),o=n(22),i=n(28),l=o?function(t,e){return o(t,"toString",{configurable:!0,enumerable:!1,value:r(e),writable:!0})}:i;t.exports=l;},function(t,e){function n(t,e){for(var n=-1,r=Array(t);++n<t;)r[n]=e(n);return r}t.exports=n;},function(t,e){function n(t){return function(e){return t(e)}}t.exports=n;},function(t,e,n){function r(t){var e=new t.constructor(t.byteLength);return new o(e).set(new o(t)),e}var o=n(49);t.exports=r;},function(t,e,n){(function(t){function r(t,e){if(e)return t.slice();var n=t.length,r=u?u(n):new t.constructor(n);return t.copy(r),r}var o=n(1),i="object"==typeof e&&e&&!e.nodeType&&e,l=i&&"object"==typeof t&&t&&!t.nodeType&&t,a=l&&l.exports===i,s=a?o.Buffer:void 0,u=s?s.allocUnsafe:void 0;t.exports=r;}).call(e,n(14)(t));},function(t,e,n){function r(t,e){var n=e?o(t.buffer):t.buffer;return new t.constructor(n,t.byteOffset,t.length)}var o=n(62);t.exports=r;},function(t,e){function n(t,e){var n=-1,r=t.length;for(e||(e=Array(r));++n<r;)e[n]=t[n];return e}t.exports=n;},function(t,e,n){function r(t,e,n,r){var l=!n;n||(n={});for(var a=-1,s=e.length;++a<s;){var u=e[a],c=r?r(n[u],t[u],u,n,t):void 0;void 0===c&&(c=t[u]),l?i(n,u,c):o(n,u,c);}return n}var o=n(51),i=n(10);t.exports=r;},function(t,e,n){var r=n(1),o=r["__core-js_shared__"];t.exports=o;},function(t,e,n){function r(t){return o(function(e,n){var r=-1,o=n.length,l=o>1?n[o-1]:void 0,a=o>2?n[2]:void 0;for(l=t.length>3&&"function"==typeof l?(o--,l):void 0,a&&i(n[0],n[1],a)&&(l=o<3?void 0:l,o=1),e=Object(e);++r<o;){var s=n[r];s&&t(e,s,r,l);}return e})}var o=n(21),i=n(79);t.exports=r;},function(t,e){function n(t){return function(e,n,r){for(var o=-1,i=Object(e),l=r(e),a=l.length;a--;){var s=l[t?a:++o];if(!1===n(i[s],s,i))break}return e}}t.exports=n;},function(t,e,n){function r(t,e,n,l,a,s){return i(t)&&i(e)&&(s.set(e,t),o(t,e,void 0,r,s),s.delete(e)),t}var o=n(20),i=n(0);t.exports=r;},function(t,e,n){function r(t){var e=l.call(t,s),n=t[s];try{t[s]=void 0;var r=!0;}catch(t){}var o=a.call(t);return r&&(e?t[s]=n:delete t[s]),o}var o=n(17),i=Object.prototype,l=i.hasOwnProperty,a=i.toString,s=o?o.toStringTag:void 0;t.exports=r;},function(t,e){function n(t,e){return null==t?void 0:t[e]}t.exports=n;},function(t,e,n){function r(){this.__data__=o?o(null):{},this.size=0;}var o=n(7);t.exports=r;},function(t,e){function n(t){var e=this.has(t)&&delete this.__data__[t];return this.size-=e?1:0,e}t.exports=n;},function(t,e,n){function r(t){var e=this.__data__;if(o){var n=e[t];return n===i?void 0:n}return a.call(e,t)?e[t]:void 0}var o=n(7),i="__lodash_hash_undefined__",l=Object.prototype,a=l.hasOwnProperty;t.exports=r;},function(t,e,n){function r(t){var e=this.__data__;return o?void 0!==e[t]:l.call(e,t)}var o=n(7),i=Object.prototype,l=i.hasOwnProperty;t.exports=r;},function(t,e,n){function r(t,e){var n=this.__data__;return this.size+=this.has(t)?0:1,n[t]=o&&void 0===e?i:e,this}var o=n(7),i="__lodash_hash_undefined__";t.exports=r;},function(t,e,n){function r(t){return "function"!=typeof t.constructor||l(t)?{}:o(i(t))}var o=n(52),i=n(24),l=n(26);t.exports=r;},function(t,e,n){function r(t,e,n){if(!a(n))return !1;var r=typeof e;return !!("number"==r?i(n)&&l(e,n.length):"string"==r&&e in n)&&o(n[e],t)}var o=n(8),i=n(12),l=n(25),a=n(0);t.exports=r;},function(t,e){function n(t){var e=typeof t;return "string"==e||"number"==e||"symbol"==e||"boolean"==e?"__proto__"!==t:null===t}t.exports=n;},function(t,e,n){function r(t){return !!i&&i in t}var o=n(67),i=function(){var t=/[^.]+$/.exec(o&&o.keys&&o.keys.IE_PROTO||"");return t?"Symbol(src)_1."+t:""}();t.exports=r;},function(t,e){function n(){this.__data__=[],this.size=0;}t.exports=n;},function(t,e,n){function r(t){var e=this.__data__,n=o(e,t);return !(n<0)&&(n==e.length-1?e.pop():l.call(e,n,1),--this.size,!0)}var o=n(4),i=Array.prototype,l=i.splice;t.exports=r;},function(t,e,n){function r(t){var e=this.__data__,n=o(e,t);return n<0?void 0:e[n][1]}var o=n(4);t.exports=r;},function(t,e,n){function r(t){return o(this.__data__,t)>-1}var o=n(4);t.exports=r;},function(t,e,n){function r(t,e){var n=this.__data__,r=o(n,t);return r<0?(++this.size,n.push([t,e])):n[r][1]=e,this}var o=n(4);t.exports=r;},function(t,e,n){function r(){this.size=0,this.__data__={hash:new o,map:new(l||i),string:new o};}var o=n(46),i=n(3),l=n(16);t.exports=r;},function(t,e,n){function r(t){var e=o(this,t).delete(t);return this.size-=e?1:0,e}var o=n(6);t.exports=r;},function(t,e,n){function r(t){return o(this,t).get(t)}var o=n(6);t.exports=r;},function(t,e,n){function r(t){return o(this,t).has(t)}var o=n(6);t.exports=r;},function(t,e,n){function r(t,e){var n=o(this,t),r=n.size;return n.set(t,e),this.size+=n.size==r?0:1,this}var o=n(6);t.exports=r;},function(t,e){function n(t){var e=[];if(null!=t)for(var n in Object(t))e.push(n);return e}t.exports=n;},function(t,e,n){(function(t){var r=n(23),o="object"==typeof e&&e&&!e.nodeType&&e,i=o&&"object"==typeof t&&t&&!t.nodeType&&t,l=i&&i.exports===o,a=l&&r.process,s=function(){try{var t=i&&i.require&&i.require("util").types;return t||a&&a.binding&&a.binding("util")}catch(t){}}();t.exports=s;}).call(e,n(14)(t));},function(t,e){function n(t){return o.call(t)}var r=Object.prototype,o=r.toString;t.exports=n;},function(t,e){function n(t,e){return function(n){return t(e(n))}}t.exports=n;},function(t,e,n){function r(t,e,n){return e=i(void 0===e?t.length-1:e,0),function(){for(var r=arguments,l=-1,a=i(r.length-e,0),s=Array(a);++l<a;)s[l]=r[e+l];l=-1;for(var u=Array(e+1);++l<e;)u[l]=r[l];return u[e]=n(s),o(t,this,u)}}var o=n(18),i=Math.max;t.exports=r;},function(t,e,n){var r=n(59),o=n(98),i=o(r);t.exports=i;},function(t,e){function n(t){var e=0,n=0;return function(){var l=i(),a=o-(l-n);if(n=l,a>0){if(++e>=r)return arguments[0]}else e=0;return t.apply(void 0,arguments)}}var r=800,o=16,i=Date.now;t.exports=n;},function(t,e,n){function r(){this.__data__=new o,this.size=0;}var o=n(3);t.exports=r;},function(t,e){function n(t){var e=this.__data__,n=e.delete(t);return this.size=e.size,n}t.exports=n;},function(t,e){function n(t){return this.__data__.get(t)}t.exports=n;},function(t,e){function n(t){return this.__data__.has(t)}t.exports=n;},function(t,e,n){function r(t,e){var n=this.__data__;if(n instanceof o){var r=n.__data__;if(!i||r.length<a-1)return r.push([t,e]),this.size=++n.size,this;n=this.__data__=new l(r);}return n.set(t,e),this.size=n.size,this}var o=n(3),i=n(16),l=n(47),a=200;t.exports=r;},function(t,e){function n(t){if(null!=t){try{return o.call(t)}catch(t){}try{return t+""}catch(t){}}return ""}var r=Function.prototype,o=r.toString;t.exports=n;},function(t,e){function n(t){return function(){return t}}t.exports=n;},function(t,e,n){function r(t){return i(t)&&o(t)}var o=n(12),i=n(2);t.exports=r;},function(t,e,n){function r(t){if(!l(t)||o(t)!=a)return !1;var e=i(t);if(null===e)return !0;var n=f.call(e,"constructor")&&e.constructor;return "function"==typeof n&&n instanceof n&&c.call(n)==h}var o=n(5),i=n(24),l=n(2),a="[object Object]",s=Function.prototype,u=Object.prototype,c=s.toString,f=u.hasOwnProperty,h=c.call(Object);t.exports=r;},function(t,e,n){var r=n(20),o=n(68),i=o(function(t,e,n,o){r(t,e,n,o);});t.exports=i;},function(t,e){function n(){return !1}t.exports=n;},function(t,e,n){function r(t){return o(t,i(t))}var o=n(66),i=n(34);t.exports=r;},function(t,e){t.exports='<svg viewbox="0 0 18 18">\n  <line class="ql-stroke" x1="15" x2="3" y1="9" y2="9"></line>\n  <line class="ql-stroke" x1="14" x2="4" y1="14" y2="14"></line>\n  <line class="ql-stroke" x1="12" x2="6" y1="4" y2="4"></line>\n</svg>';},function(t,e){t.exports='<svg viewbox="0 0 18 18">\n  <line class="ql-stroke" x1="3" x2="15" y1="9" y2="9"></line>\n  <line class="ql-stroke" x1="3" x2="13" y1="14" y2="14"></line>\n  <line class="ql-stroke" x1="3" x2="9" y1="4" y2="4"></line>\n</svg>';},function(t,e){t.exports='<svg viewbox="0 0 18 18">\n  <line class="ql-stroke" x1="15" x2="3" y1="9" y2="9"></line>\n  <line class="ql-stroke" x1="15" x2="5" y1="14" y2="14"></line>\n  <line class="ql-stroke" x1="15" x2="9" y1="4" y2="4"></line>\n</svg>';}])});
    });

    /**
     * Checks if `value` is the
     * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
     * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an object, else `false`.
     * @example
     *
     * _.isObject({});
     * // => true
     *
     * _.isObject([1, 2, 3]);
     * // => true
     *
     * _.isObject(_.noop);
     * // => true
     *
     * _.isObject(null);
     * // => false
     */
    function isObject(value) {
      var type = typeof value;
      return value != null && (type == 'object' || type == 'function');
    }

    var isObject_1 = isObject;

    /** Detect free variable `global` from Node.js. */
    var freeGlobal = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

    var _freeGlobal = freeGlobal;

    /** Detect free variable `self`. */
    var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

    /** Used as a reference to the global object. */
    var root = _freeGlobal || freeSelf || Function('return this')();

    var _root = root;

    /**
     * Gets the timestamp of the number of milliseconds that have elapsed since
     * the Unix epoch (1 January 1970 00:00:00 UTC).
     *
     * @static
     * @memberOf _
     * @since 2.4.0
     * @category Date
     * @returns {number} Returns the timestamp.
     * @example
     *
     * _.defer(function(stamp) {
     *   console.log(_.now() - stamp);
     * }, _.now());
     * // => Logs the number of milliseconds it took for the deferred invocation.
     */
    var now = function() {
      return _root.Date.now();
    };

    var now_1 = now;

    /** Used to match a single whitespace character. */
    var reWhitespace = /\s/;

    /**
     * Used by `_.trim` and `_.trimEnd` to get the index of the last non-whitespace
     * character of `string`.
     *
     * @private
     * @param {string} string The string to inspect.
     * @returns {number} Returns the index of the last non-whitespace character.
     */
    function trimmedEndIndex(string) {
      var index = string.length;

      while (index-- && reWhitespace.test(string.charAt(index))) {}
      return index;
    }

    var _trimmedEndIndex = trimmedEndIndex;

    /** Used to match leading whitespace. */
    var reTrimStart = /^\s+/;

    /**
     * The base implementation of `_.trim`.
     *
     * @private
     * @param {string} string The string to trim.
     * @returns {string} Returns the trimmed string.
     */
    function baseTrim(string) {
      return string
        ? string.slice(0, _trimmedEndIndex(string) + 1).replace(reTrimStart, '')
        : string;
    }

    var _baseTrim = baseTrim;

    /** Built-in value references. */
    var Symbol$1 = _root.Symbol;

    var _Symbol = Symbol$1;

    /** Used for built-in method references. */
    var objectProto$1 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty = objectProto$1.hasOwnProperty;

    /**
     * Used to resolve the
     * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
     * of values.
     */
    var nativeObjectToString$1 = objectProto$1.toString;

    /** Built-in value references. */
    var symToStringTag$1 = _Symbol ? _Symbol.toStringTag : undefined;

    /**
     * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {string} Returns the raw `toStringTag`.
     */
    function getRawTag(value) {
      var isOwn = hasOwnProperty.call(value, symToStringTag$1),
          tag = value[symToStringTag$1];

      try {
        value[symToStringTag$1] = undefined;
        var unmasked = true;
      } catch (e) {}

      var result = nativeObjectToString$1.call(value);
      if (unmasked) {
        if (isOwn) {
          value[symToStringTag$1] = tag;
        } else {
          delete value[symToStringTag$1];
        }
      }
      return result;
    }

    var _getRawTag = getRawTag;

    /** Used for built-in method references. */
    var objectProto = Object.prototype;

    /**
     * Used to resolve the
     * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
     * of values.
     */
    var nativeObjectToString = objectProto.toString;

    /**
     * Converts `value` to a string using `Object.prototype.toString`.
     *
     * @private
     * @param {*} value The value to convert.
     * @returns {string} Returns the converted string.
     */
    function objectToString(value) {
      return nativeObjectToString.call(value);
    }

    var _objectToString = objectToString;

    /** `Object#toString` result references. */
    var nullTag = '[object Null]',
        undefinedTag = '[object Undefined]';

    /** Built-in value references. */
    var symToStringTag = _Symbol ? _Symbol.toStringTag : undefined;

    /**
     * The base implementation of `getTag` without fallbacks for buggy environments.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {string} Returns the `toStringTag`.
     */
    function baseGetTag(value) {
      if (value == null) {
        return value === undefined ? undefinedTag : nullTag;
      }
      return (symToStringTag && symToStringTag in Object(value))
        ? _getRawTag(value)
        : _objectToString(value);
    }

    var _baseGetTag = baseGetTag;

    /**
     * Checks if `value` is object-like. A value is object-like if it's not `null`
     * and has a `typeof` result of "object".
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
     * @example
     *
     * _.isObjectLike({});
     * // => true
     *
     * _.isObjectLike([1, 2, 3]);
     * // => true
     *
     * _.isObjectLike(_.noop);
     * // => false
     *
     * _.isObjectLike(null);
     * // => false
     */
    function isObjectLike(value) {
      return value != null && typeof value == 'object';
    }

    var isObjectLike_1 = isObjectLike;

    /** `Object#toString` result references. */
    var symbolTag = '[object Symbol]';

    /**
     * Checks if `value` is classified as a `Symbol` primitive or object.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
     * @example
     *
     * _.isSymbol(Symbol.iterator);
     * // => true
     *
     * _.isSymbol('abc');
     * // => false
     */
    function isSymbol(value) {
      return typeof value == 'symbol' ||
        (isObjectLike_1(value) && _baseGetTag(value) == symbolTag);
    }

    var isSymbol_1 = isSymbol;

    /** Used as references for various `Number` constants. */
    var NAN = 0 / 0;

    /** Used to detect bad signed hexadecimal string values. */
    var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

    /** Used to detect binary string values. */
    var reIsBinary = /^0b[01]+$/i;

    /** Used to detect octal string values. */
    var reIsOctal = /^0o[0-7]+$/i;

    /** Built-in method references without a dependency on `root`. */
    var freeParseInt = parseInt;

    /**
     * Converts `value` to a number.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to process.
     * @returns {number} Returns the number.
     * @example
     *
     * _.toNumber(3.2);
     * // => 3.2
     *
     * _.toNumber(Number.MIN_VALUE);
     * // => 5e-324
     *
     * _.toNumber(Infinity);
     * // => Infinity
     *
     * _.toNumber('3.2');
     * // => 3.2
     */
    function toNumber(value) {
      if (typeof value == 'number') {
        return value;
      }
      if (isSymbol_1(value)) {
        return NAN;
      }
      if (isObject_1(value)) {
        var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
        value = isObject_1(other) ? (other + '') : other;
      }
      if (typeof value != 'string') {
        return value === 0 ? value : +value;
      }
      value = _baseTrim(value);
      var isBinary = reIsBinary.test(value);
      return (isBinary || reIsOctal.test(value))
        ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
        : (reIsBadHex.test(value) ? NAN : +value);
    }

    var toNumber_1 = toNumber;

    /** Error message constants. */
    var FUNC_ERROR_TEXT = 'Expected a function';

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeMax = Math.max,
        nativeMin = Math.min;

    /**
     * Creates a debounced function that delays invoking `func` until after `wait`
     * milliseconds have elapsed since the last time the debounced function was
     * invoked. The debounced function comes with a `cancel` method to cancel
     * delayed `func` invocations and a `flush` method to immediately invoke them.
     * Provide `options` to indicate whether `func` should be invoked on the
     * leading and/or trailing edge of the `wait` timeout. The `func` is invoked
     * with the last arguments provided to the debounced function. Subsequent
     * calls to the debounced function return the result of the last `func`
     * invocation.
     *
     * **Note:** If `leading` and `trailing` options are `true`, `func` is
     * invoked on the trailing edge of the timeout only if the debounced function
     * is invoked more than once during the `wait` timeout.
     *
     * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
     * until to the next tick, similar to `setTimeout` with a timeout of `0`.
     *
     * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
     * for details over the differences between `_.debounce` and `_.throttle`.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Function
     * @param {Function} func The function to debounce.
     * @param {number} [wait=0] The number of milliseconds to delay.
     * @param {Object} [options={}] The options object.
     * @param {boolean} [options.leading=false]
     *  Specify invoking on the leading edge of the timeout.
     * @param {number} [options.maxWait]
     *  The maximum time `func` is allowed to be delayed before it's invoked.
     * @param {boolean} [options.trailing=true]
     *  Specify invoking on the trailing edge of the timeout.
     * @returns {Function} Returns the new debounced function.
     * @example
     *
     * // Avoid costly calculations while the window size is in flux.
     * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
     *
     * // Invoke `sendMail` when clicked, debouncing subsequent calls.
     * jQuery(element).on('click', _.debounce(sendMail, 300, {
     *   'leading': true,
     *   'trailing': false
     * }));
     *
     * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
     * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
     * var source = new EventSource('/stream');
     * jQuery(source).on('message', debounced);
     *
     * // Cancel the trailing debounced invocation.
     * jQuery(window).on('popstate', debounced.cancel);
     */
    function debounce(func, wait, options) {
      var lastArgs,
          lastThis,
          maxWait,
          result,
          timerId,
          lastCallTime,
          lastInvokeTime = 0,
          leading = false,
          maxing = false,
          trailing = true;

      if (typeof func != 'function') {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      wait = toNumber_1(wait) || 0;
      if (isObject_1(options)) {
        leading = !!options.leading;
        maxing = 'maxWait' in options;
        maxWait = maxing ? nativeMax(toNumber_1(options.maxWait) || 0, wait) : maxWait;
        trailing = 'trailing' in options ? !!options.trailing : trailing;
      }

      function invokeFunc(time) {
        var args = lastArgs,
            thisArg = lastThis;

        lastArgs = lastThis = undefined;
        lastInvokeTime = time;
        result = func.apply(thisArg, args);
        return result;
      }

      function leadingEdge(time) {
        // Reset any `maxWait` timer.
        lastInvokeTime = time;
        // Start the timer for the trailing edge.
        timerId = setTimeout(timerExpired, wait);
        // Invoke the leading edge.
        return leading ? invokeFunc(time) : result;
      }

      function remainingWait(time) {
        var timeSinceLastCall = time - lastCallTime,
            timeSinceLastInvoke = time - lastInvokeTime,
            timeWaiting = wait - timeSinceLastCall;

        return maxing
          ? nativeMin(timeWaiting, maxWait - timeSinceLastInvoke)
          : timeWaiting;
      }

      function shouldInvoke(time) {
        var timeSinceLastCall = time - lastCallTime,
            timeSinceLastInvoke = time - lastInvokeTime;

        // Either this is the first call, activity has stopped and we're at the
        // trailing edge, the system time has gone backwards and we're treating
        // it as the trailing edge, or we've hit the `maxWait` limit.
        return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
          (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
      }

      function timerExpired() {
        var time = now_1();
        if (shouldInvoke(time)) {
          return trailingEdge(time);
        }
        // Restart the timer.
        timerId = setTimeout(timerExpired, remainingWait(time));
      }

      function trailingEdge(time) {
        timerId = undefined;

        // Only invoke if we have `lastArgs` which means `func` has been
        // debounced at least once.
        if (trailing && lastArgs) {
          return invokeFunc(time);
        }
        lastArgs = lastThis = undefined;
        return result;
      }

      function cancel() {
        if (timerId !== undefined) {
          clearTimeout(timerId);
        }
        lastInvokeTime = 0;
        lastArgs = lastCallTime = lastThis = timerId = undefined;
      }

      function flush() {
        return timerId === undefined ? result : trailingEdge(now_1());
      }

      function debounced() {
        var time = now_1(),
            isInvoking = shouldInvoke(time);

        lastArgs = arguments;
        lastThis = this;
        lastCallTime = time;

        if (isInvoking) {
          if (timerId === undefined) {
            return leadingEdge(lastCallTime);
          }
          if (maxing) {
            // Handle invocations in a tight loop.
            clearTimeout(timerId);
            timerId = setTimeout(timerExpired, wait);
            return invokeFunc(lastCallTime);
          }
        }
        if (timerId === undefined) {
          timerId = setTimeout(timerExpired, wait);
        }
        return result;
      }
      debounced.cancel = cancel;
      debounced.flush = flush;
      return debounced;
    }

    var debounce_1 = debounce;

    /* src\form\input\RichTextEditor.svelte generated by Svelte v3.44.3 */
    const file$1 = "src\\form\\input\\RichTextEditor.svelte";

    function create_fragment$2(ctx) {
    	let div1;
    	let div0;
    	let div1_class_value;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			add_location(div0, file$1, 75, 1, 1802);
    			attr_dev(div1, "class", div1_class_value = "quill-parent " + (/*$$restProps*/ ctx[1].class || ''));
    			add_location(div1, file$1, 74, 0, 1747);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			/*div0_binding*/ ctx[8](div0);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$$restProps*/ 2 && div1_class_value !== (div1_class_value = "quill-parent " + (/*$$restProps*/ ctx[1].class || ''))) {
    				attr_dev(div1, "class", div1_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			/*div0_binding*/ ctx[8](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance_1($$self, $$props, $$invalidate) {
    	let config;
    	const omit_props_names = ["value","theme","options","DefaultToolbar","TypingDebounceDelay"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('RichTextEditor', slots, []);
    	Quill.register("module/imageResize", imageResize_min.imageResize);
    	let { value } = $$props;
    	let { theme = "snow" } = $$props;
    	let { options = {} } = $$props;

    	let { DefaultToolbar = [
    		[{ font: [] }, { size: [] }],
    		["bold", "italic", "underline", "strike"],
    		[{ color: [] }, { background: [] }],
    		[{ script: "super" }, { script: "sub" }],
    		[{ header: "1" }, { header: "2" }, "blockquote", "code-block"],
    		[{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
    		["direction", { align: [] }],
    		["link", "image", "video", "formula"],
    		["clean"]
    	] } = $$props;

    	let { TypingDebounceDelay = 1000 } = $$props;
    	const dispatch = createEventDispatcher();

    	const inputDebounce = debounce_1(
    		val => {
    			$$invalidate(2, value = val);
    		},
    		TypingDebounceDelay
    	);

    	let instance;
    	let element;

    	onMount(() => {
    		$$invalidate(7, instance = new Quill(element, config));
    		instance.on("editor-change", onEditorChange);
    	});

    	onDestroy(() => {
    		if (!instance) return;
    		instance.off("editor-change", onEditorChange);
    	});

    	function onValueChange(val) {
    		if (!instance) return;
    		if (instance.root.innerHTML === val) return;
    		$$invalidate(7, instance.root.innerHTML = val || "", instance);
    	}

    	function onEditorChange(eventName, ...args) {
    		if (!instance) return;

    		if (eventName === "text-change") {
    			if (args[2] !== "user") return;
    			const content = instance.root.innerHTML;
    			dispatch("input", content);
    			inputDebounce(content);
    		}
    	}

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			element = $$value;
    			$$invalidate(0, element);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(1, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('value' in $$new_props) $$invalidate(2, value = $$new_props.value);
    		if ('theme' in $$new_props) $$invalidate(3, theme = $$new_props.theme);
    		if ('options' in $$new_props) $$invalidate(4, options = $$new_props.options);
    		if ('DefaultToolbar' in $$new_props) $$invalidate(5, DefaultToolbar = $$new_props.DefaultToolbar);
    		if ('TypingDebounceDelay' in $$new_props) $$invalidate(6, TypingDebounceDelay = $$new_props.TypingDebounceDelay);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		createEventDispatcher,
    		onDestroy,
    		Quill,
    		imageResize: imageResize_min.imageResize,
    		debounce: debounce_1,
    		value,
    		theme,
    		options,
    		DefaultToolbar,
    		TypingDebounceDelay,
    		dispatch,
    		inputDebounce,
    		instance,
    		element,
    		onValueChange,
    		onEditorChange,
    		config
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('value' in $$props) $$invalidate(2, value = $$new_props.value);
    		if ('theme' in $$props) $$invalidate(3, theme = $$new_props.theme);
    		if ('options' in $$props) $$invalidate(4, options = $$new_props.options);
    		if ('DefaultToolbar' in $$props) $$invalidate(5, DefaultToolbar = $$new_props.DefaultToolbar);
    		if ('TypingDebounceDelay' in $$props) $$invalidate(6, TypingDebounceDelay = $$new_props.TypingDebounceDelay);
    		if ('instance' in $$props) $$invalidate(7, instance = $$new_props.instance);
    		if ('element' in $$props) $$invalidate(0, element = $$new_props.element);
    		if ('config' in $$props) config = $$new_props.config;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*theme, DefaultToolbar, options*/ 56) {
    			config = {
    				theme,
    				modules: { imageResize: {}, toolbar: DefaultToolbar },
    				...options
    			};
    		}

    		if ($$self.$$.dirty & /*value, instance*/ 132) {
    			onValueChange(value);
    		}
    	};

    	return [
    		element,
    		$$restProps,
    		value,
    		theme,
    		options,
    		DefaultToolbar,
    		TypingDebounceDelay,
    		instance,
    		div0_binding
    	];
    }

    class RichTextEditor extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance_1, create_fragment$2, safe_not_equal, {
    			value: 2,
    			theme: 3,
    			options: 4,
    			DefaultToolbar: 5,
    			TypingDebounceDelay: 6
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "RichTextEditor",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*value*/ ctx[2] === undefined && !('value' in props)) {
    			console.warn("<RichTextEditor> was created without expected prop 'value'");
    		}
    	}

    	get value() {
    		throw new Error("<RichTextEditor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<RichTextEditor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get theme() {
    		throw new Error("<RichTextEditor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set theme(value) {
    		throw new Error("<RichTextEditor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get options() {
    		throw new Error("<RichTextEditor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set options(value) {
    		throw new Error("<RichTextEditor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get DefaultToolbar() {
    		throw new Error("<RichTextEditor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set DefaultToolbar(value) {
    		throw new Error("<RichTextEditor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get TypingDebounceDelay() {
    		throw new Error("<RichTextEditor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set TypingDebounceDelay(value) {
    		throw new Error("<RichTextEditor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* dev\Page.svelte generated by Svelte v3.44.3 */

    const { console: console_1 } = globals;
    const file = "dev\\Page.svelte";

    function create_fragment$1(ctx) {
    	let h1;
    	let t1;
    	let richtexteditor;
    	let updating_value;
    	let t2;
    	let t3;
    	let current;

    	function richtexteditor_value_binding(value) {
    		/*richtexteditor_value_binding*/ ctx[1](value);
    	}

    	let richtexteditor_props = {};

    	if (/*value*/ ctx[0] !== void 0) {
    		richtexteditor_props.value = /*value*/ ctx[0];
    	}

    	richtexteditor = new RichTextEditor({
    			props: richtexteditor_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(richtexteditor, 'value', richtexteditor_value_binding));
    	richtexteditor.$on("input", /*input_handler*/ ctx[2]);

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Rich text Editor";
    			t1 = space();
    			create_component(richtexteditor.$$.fragment);
    			t2 = space();
    			t3 = text(/*value*/ ctx[0]);
    			add_location(h1, file, 5, 0, 130);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(richtexteditor, target, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, t3, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const richtexteditor_changes = {};

    			if (!updating_value && dirty & /*value*/ 1) {
    				updating_value = true;
    				richtexteditor_changes.value = /*value*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			richtexteditor.$set(richtexteditor_changes);
    			if (!current || dirty & /*value*/ 1) set_data_dev(t3, /*value*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(richtexteditor.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(richtexteditor.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			destroy_component(richtexteditor, detaching);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(t3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Page', slots, []);
    	let value = "<h1> HELLO </h1>";
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Page> was created with unknown prop '${key}'`);
    	});

    	function richtexteditor_value_binding(value$1) {
    		value = value$1;
    		$$invalidate(0, value);
    	}

    	const input_handler = e => console.log(e.detail);
    	$$self.$capture_state = () => ({ RichTextEditor, value });

    	$$self.$inject_state = $$props => {
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [value, richtexteditor_value_binding, input_handler];
    }

    class Page extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Page",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* dev\App.svelte generated by Svelte v3.44.3 */

    function create_fragment(ctx) {
    	let page;
    	let current;
    	page = new Page({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(page.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(page, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(page.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(page.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(page, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Page });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
