
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
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
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function get_store_value(store) {
        let value;
        subscribe(store, _ => value = _)();
        return value;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
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
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
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
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
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
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
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
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
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
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
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
        flushing = false;
        seen_callbacks.clear();
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
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
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

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
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
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
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
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
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
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.30.1' }, detail)));
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
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
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
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
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

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    /**
     * @typedef {Object} WrappedComponent Object returned by the `wrap` method
     * @property {SvelteComponent} component - Component to load (this is always asynchronous)
     * @property {RoutePrecondition[]} [conditions] - Route pre-conditions to validate
     * @property {Object} [props] - Optional dictionary of static props
     * @property {Object} [userData] - Optional user data dictionary
     * @property {bool} _sveltesparouter - Internal flag; always set to true
     */

    /**
     * @callback AsyncSvelteComponent
     * @returns {Promise<SvelteComponent>} Returns a Promise that resolves with a Svelte component
     */

    /**
     * @callback RoutePrecondition
     * @param {RouteDetail} detail - Route detail object
     * @returns {boolean|Promise<boolean>} If the callback returns a false-y value, it's interpreted as the precondition failed, so it aborts loading the component (and won't process other pre-condition callbacks)
     */

    /**
     * @typedef {Object} WrapOptions Options object for the call to `wrap`
     * @property {SvelteComponent} [component] - Svelte component to load (this is incompatible with `asyncComponent`)
     * @property {AsyncSvelteComponent} [asyncComponent] - Function that returns a Promise that fulfills with a Svelte component (e.g. `{asyncComponent: () => import('Foo.svelte')}`)
     * @property {SvelteComponent} [loadingComponent] - Svelte component to be displayed while the async route is loading (as a placeholder); when unset or false-y, no component is shown while component
     * @property {object} [loadingParams] - Optional dictionary passed to the `loadingComponent` component as params (for an exported prop called `params`)
     * @property {object} [userData] - Optional object that will be passed to events such as `routeLoading`, `routeLoaded`, `conditionsFailed`
     * @property {object} [props] - Optional key-value dictionary of static props that will be passed to the component. The props are expanded with {...props}, so the key in the dictionary becomes the name of the prop.
     * @property {RoutePrecondition[]|RoutePrecondition} [conditions] - Route pre-conditions to add, which will be executed in order
     */

    /**
     * Wraps a component to enable multiple capabilities:
     * 1. Using dynamically-imported component, with (e.g. `{asyncComponent: () => import('Foo.svelte')}`), which also allows bundlers to do code-splitting.
     * 2. Adding route pre-conditions (e.g. `{conditions: [...]}`)
     * 3. Adding static props that are passed to the component
     * 4. Adding custom userData, which is passed to route events (e.g. route loaded events) or to route pre-conditions (e.g. `{userData: {foo: 'bar}}`)
     * 
     * @param {WrapOptions} args - Arguments object
     * @returns {WrappedComponent} Wrapped component
     */
    function wrap(args) {
        if (!args) {
            throw Error('Parameter args is required')
        }

        // We need to have one and only one of component and asyncComponent
        // This does a "XNOR"
        if (!args.component == !args.asyncComponent) {
            throw Error('One and only one of component and asyncComponent is required')
        }

        // If the component is not async, wrap it into a function returning a Promise
        if (args.component) {
            args.asyncComponent = () => Promise.resolve(args.component);
        }

        // Parameter asyncComponent and each item of conditions must be functions
        if (typeof args.asyncComponent != 'function') {
            throw Error('Parameter asyncComponent must be a function')
        }
        if (args.conditions) {
            // Ensure it's an array
            if (!Array.isArray(args.conditions)) {
                args.conditions = [args.conditions];
            }
            for (let i = 0; i < args.conditions.length; i++) {
                if (!args.conditions[i] || typeof args.conditions[i] != 'function') {
                    throw Error('Invalid parameter conditions[' + i + ']')
                }
            }
        }

        // Check if we have a placeholder component
        if (args.loadingComponent) {
            args.asyncComponent.loading = args.loadingComponent;
            args.asyncComponent.loadingParams = args.loadingParams || undefined;
        }

        // Returns an object that contains all the functions to execute too
        // The _sveltesparouter flag is to confirm the object was created by this router
        const obj = {
            component: args.asyncComponent,
            userData: args.userData,
            conditions: (args.conditions && args.conditions.length) ? args.conditions : undefined,
            props: (args.props && Object.keys(args.props).length) ? args.props : {},
            _sveltesparouter: true
        };

        return obj
    }

    function regexparam (str, loose) {
    	if (str instanceof RegExp) return { keys:false, pattern:str };
    	var c, o, tmp, ext, keys=[], pattern='', arr = str.split('/');
    	arr[0] || arr.shift();

    	while (tmp = arr.shift()) {
    		c = tmp[0];
    		if (c === '*') {
    			keys.push('wild');
    			pattern += '/(.*)';
    		} else if (c === ':') {
    			o = tmp.indexOf('?', 1);
    			ext = tmp.indexOf('.', 1);
    			keys.push( tmp.substring(1, !!~o ? o : !!~ext ? ext : tmp.length) );
    			pattern += !!~o && !~ext ? '(?:/([^/]+?))?' : '/([^/]+?)';
    			if (!!~ext) pattern += (!!~o ? '?' : '') + '\\' + tmp.substring(ext);
    		} else {
    			pattern += '/' + tmp;
    		}
    	}

    	return {
    		keys: keys,
    		pattern: new RegExp('^' + pattern + (loose ? '(?=$|\/)' : '\/?$'), 'i')
    	};
    }

    /* node_modules/svelte-spa-router/Router.svelte generated by Svelte v3.30.1 */

    const { Error: Error_1, Object: Object_1, console: console_1 } = globals;

    // (209:0) {:else}
    function create_else_block(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [/*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*props*/ 4)
    			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*props*/ ctx[2])])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(209:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (202:0) {#if componentParams}
    function create_if_block(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [{ params: /*componentParams*/ ctx[1] }, /*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*componentParams, props*/ 6)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*componentParams*/ 2 && { params: /*componentParams*/ ctx[1] },
    					dirty & /*props*/ 4 && get_spread_object(/*props*/ ctx[2])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(202:0) {#if componentParams}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*componentParams*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
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

    function wrap$1(component, userData, ...conditions) {
    	// Use the new wrap method and show a deprecation warning
    	// eslint-disable-next-line no-console
    	console.warn("Method `wrap` from `svelte-spa-router` is deprecated and will be removed in a future version. Please use `svelte-spa-router/wrap` instead. See http://bit.ly/svelte-spa-router-upgrading");

    	return wrap({ component, userData, conditions });
    }

    /**
     * @typedef {Object} Location
     * @property {string} location - Location (page/view), for example `/book`
     * @property {string} [querystring] - Querystring from the hash, as a string not parsed
     */
    /**
     * Returns the current location from the hash.
     *
     * @returns {Location} Location object
     * @private
     */
    function getLocation() {
    	const hashPosition = window.location.href.indexOf("#/");

    	let location = hashPosition > -1
    	? window.location.href.substr(hashPosition + 1)
    	: "/";

    	// Check if there's a querystring
    	const qsPosition = location.indexOf("?");

    	let querystring = "";

    	if (qsPosition > -1) {
    		querystring = location.substr(qsPosition + 1);
    		location = location.substr(0, qsPosition);
    	}

    	return { location, querystring };
    }

    const loc = readable(null, // eslint-disable-next-line prefer-arrow-callback
    function start(set) {
    	set(getLocation());

    	const update = () => {
    		set(getLocation());
    	};

    	window.addEventListener("hashchange", update, false);

    	return function stop() {
    		window.removeEventListener("hashchange", update, false);
    	};
    });

    const location = derived(loc, $loc => $loc.location);
    const querystring = derived(loc, $loc => $loc.querystring);

    async function push(location) {
    	if (!location || location.length < 1 || location.charAt(0) != "/" && location.indexOf("#/") !== 0) {
    		throw Error("Invalid parameter location");
    	}

    	// Execute this code when the current call stack is complete
    	await tick();

    	// Note: this will include scroll state in history even when restoreScrollState is false
    	history.replaceState(
    		{
    			scrollX: window.scrollX,
    			scrollY: window.scrollY
    		},
    		undefined,
    		undefined
    	);

    	window.location.hash = (location.charAt(0) == "#" ? "" : "#") + location;
    }

    async function pop() {
    	// Execute this code when the current call stack is complete
    	await tick();

    	window.history.back();
    }

    async function replace(location) {
    	if (!location || location.length < 1 || location.charAt(0) != "/" && location.indexOf("#/") !== 0) {
    		throw Error("Invalid parameter location");
    	}

    	// Execute this code when the current call stack is complete
    	await tick();

    	const dest = (location.charAt(0) == "#" ? "" : "#") + location;

    	try {
    		window.history.replaceState(undefined, undefined, dest);
    	} catch(e) {
    		// eslint-disable-next-line no-console
    		console.warn("Caught exception while replacing the current page. If you're running this in the Svelte REPL, please note that the `replace` method might not work in this environment.");
    	}

    	// The method above doesn't trigger the hashchange event, so let's do that manually
    	window.dispatchEvent(new Event("hashchange"));
    }

    function link(node, hrefVar) {
    	// Only apply to <a> tags
    	if (!node || !node.tagName || node.tagName.toLowerCase() != "a") {
    		throw Error("Action \"link\" can only be used with <a> tags");
    	}

    	updateLink(node, hrefVar || node.getAttribute("href"));

    	return {
    		update(updated) {
    			updateLink(node, updated);
    		}
    	};
    }

    // Internal function used by the link function
    function updateLink(node, href) {
    	// Destination must start with '/'
    	if (!href || href.length < 1 || href.charAt(0) != "/") {
    		throw Error("Invalid value for \"href\" attribute: " + href);
    	}

    	// Add # to the href attribute
    	node.setAttribute("href", "#" + href);

    	node.addEventListener("click", scrollstateHistoryHandler);
    }

    /**
     * The handler attached to an anchor tag responsible for updating the
     * current history state with the current scroll state
     *
     * @param {HTMLElementEventMap} event - an onclick event attached to an anchor tag
     */
    function scrollstateHistoryHandler(event) {
    	// Prevent default anchor onclick behaviour
    	event.preventDefault();

    	const href = event.currentTarget.getAttribute("href");

    	// Setting the url (3rd arg) to href will break clicking for reasons, so don't try to do that
    	history.replaceState(
    		{
    			scrollX: window.scrollX,
    			scrollY: window.scrollY
    		},
    		undefined,
    		undefined
    	);

    	// This will force an update as desired, but this time our scroll state will be attached
    	window.location.hash = href;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Router", slots, []);
    	let { routes = {} } = $$props;
    	let { prefix = "" } = $$props;
    	let { restoreScrollState = false } = $$props;

    	/**
     * Container for a route: path, component
     */
    	class RouteItem {
    		/**
     * Initializes the object and creates a regular expression from the path, using regexparam.
     *
     * @param {string} path - Path to the route (must start with '/' or '*')
     * @param {SvelteComponent|WrappedComponent} component - Svelte component for the route, optionally wrapped
     */
    		constructor(path, component) {
    			if (!component || typeof component != "function" && (typeof component != "object" || component._sveltesparouter !== true)) {
    				throw Error("Invalid component object");
    			}

    			// Path must be a regular or expression, or a string starting with '/' or '*'
    			if (!path || typeof path == "string" && (path.length < 1 || path.charAt(0) != "/" && path.charAt(0) != "*") || typeof path == "object" && !(path instanceof RegExp)) {
    				throw Error("Invalid value for \"path\" argument - strings must start with / or *");
    			}

    			const { pattern, keys } = regexparam(path);
    			this.path = path;

    			// Check if the component is wrapped and we have conditions
    			if (typeof component == "object" && component._sveltesparouter === true) {
    				this.component = component.component;
    				this.conditions = component.conditions || [];
    				this.userData = component.userData;
    				this.props = component.props || {};
    			} else {
    				// Convert the component to a function that returns a Promise, to normalize it
    				this.component = () => Promise.resolve(component);

    				this.conditions = [];
    				this.props = {};
    			}

    			this._pattern = pattern;
    			this._keys = keys;
    		}

    		/**
     * Checks if `path` matches the current route.
     * If there's a match, will return the list of parameters from the URL (if any).
     * In case of no match, the method will return `null`.
     *
     * @param {string} path - Path to test
     * @returns {null|Object.<string, string>} List of paramters from the URL if there's a match, or `null` otherwise.
     */
    		match(path) {
    			// If there's a prefix, check if it matches the start of the path.
    			// If not, bail early, else remove it before we run the matching.
    			if (prefix) {
    				if (typeof prefix == "string") {
    					if (path.startsWith(prefix)) {
    						path = path.substr(prefix.length) || "/";
    					} else {
    						return null;
    					}
    				} else if (prefix instanceof RegExp) {
    					const match = path.match(prefix);

    					if (match && match[0]) {
    						path = path.substr(match[0].length) || "/";
    					} else {
    						return null;
    					}
    				}
    			}

    			// Check if the pattern matches
    			const matches = this._pattern.exec(path);

    			if (matches === null) {
    				return null;
    			}

    			// If the input was a regular expression, this._keys would be false, so return matches as is
    			if (this._keys === false) {
    				return matches;
    			}

    			const out = {};
    			let i = 0;

    			while (i < this._keys.length) {
    				// In the match parameters, URL-decode all values
    				try {
    					out[this._keys[i]] = decodeURIComponent(matches[i + 1] || "") || null;
    				} catch(e) {
    					out[this._keys[i]] = null;
    				}

    				i++;
    			}

    			return out;
    		}

    		/**
     * Dictionary with route details passed to the pre-conditions functions, as well as the `routeLoading`, `routeLoaded` and `conditionsFailed` events
     * @typedef {Object} RouteDetail
     * @property {string|RegExp} route - Route matched as defined in the route definition (could be a string or a reguar expression object)
     * @property {string} location - Location path
     * @property {string} querystring - Querystring from the hash
     * @property {object} [userData] - Custom data passed by the user
     * @property {SvelteComponent} [component] - Svelte component (only in `routeLoaded` events)
     * @property {string} [name] - Name of the Svelte component (only in `routeLoaded` events)
     */
    		/**
     * Executes all conditions (if any) to control whether the route can be shown. Conditions are executed in the order they are defined, and if a condition fails, the following ones aren't executed.
     * 
     * @param {RouteDetail} detail - Route detail
     * @returns {bool} Returns true if all the conditions succeeded
     */
    		async checkConditions(detail) {
    			for (let i = 0; i < this.conditions.length; i++) {
    				if (!await this.conditions[i](detail)) {
    					return false;
    				}
    			}

    			return true;
    		}
    	}

    	// Set up all routes
    	const routesList = [];

    	if (routes instanceof Map) {
    		// If it's a map, iterate on it right away
    		routes.forEach((route, path) => {
    			routesList.push(new RouteItem(path, route));
    		});
    	} else {
    		// We have an object, so iterate on its own properties
    		Object.keys(routes).forEach(path => {
    			routesList.push(new RouteItem(path, routes[path]));
    		});
    	}

    	// Props for the component to render
    	let component = null;

    	let componentParams = null;
    	let props = {};

    	// Event dispatcher from Svelte
    	const dispatch = createEventDispatcher();

    	// Just like dispatch, but executes on the next iteration of the event loop
    	async function dispatchNextTick(name, detail) {
    		// Execute this code when the current call stack is complete
    		await tick();

    		dispatch(name, detail);
    	}

    	// If this is set, then that means we have popped into this var the state of our last scroll position
    	let previousScrollState = null;

    	if (restoreScrollState) {
    		window.addEventListener("popstate", event => {
    			// If this event was from our history.replaceState, event.state will contain
    			// our scroll history. Otherwise, event.state will be null (like on forward
    			// navigation)
    			if (event.state && event.state.scrollY) {
    				previousScrollState = event.state;
    			} else {
    				previousScrollState = null;
    			}
    		});

    		afterUpdate(() => {
    			// If this exists, then this is a back navigation: restore the scroll position
    			if (previousScrollState) {
    				window.scrollTo(previousScrollState.scrollX, previousScrollState.scrollY);
    			} else {
    				// Otherwise this is a forward navigation: scroll to top
    				window.scrollTo(0, 0);
    			}
    		});
    	}

    	// Always have the latest value of loc
    	let lastLoc = null;

    	// Current object of the component loaded
    	let componentObj = null;

    	// Handle hash change events
    	// Listen to changes in the $loc store and update the page
    	// Do not use the $: syntax because it gets triggered by too many things
    	loc.subscribe(async newLoc => {
    		lastLoc = newLoc;

    		// Find a route matching the location
    		let i = 0;

    		while (i < routesList.length) {
    			const match = routesList[i].match(newLoc.location);

    			if (!match) {
    				i++;
    				continue;
    			}

    			const detail = {
    				route: routesList[i].path,
    				location: newLoc.location,
    				querystring: newLoc.querystring,
    				userData: routesList[i].userData
    			};

    			// Check if the route can be loaded - if all conditions succeed
    			if (!await routesList[i].checkConditions(detail)) {
    				// Don't display anything
    				$$invalidate(0, component = null);

    				componentObj = null;

    				// Trigger an event to notify the user, then exit
    				dispatchNextTick("conditionsFailed", detail);

    				return;
    			}

    			// Trigger an event to alert that we're loading the route
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick("routeLoading", Object.assign({}, detail));

    			// If there's a component to show while we're loading the route, display it
    			const obj = routesList[i].component;

    			// Do not replace the component if we're loading the same one as before, to avoid the route being unmounted and re-mounted
    			if (componentObj != obj) {
    				if (obj.loading) {
    					$$invalidate(0, component = obj.loading);
    					componentObj = obj;
    					$$invalidate(1, componentParams = obj.loadingParams);
    					$$invalidate(2, props = {});

    					// Trigger the routeLoaded event for the loading component
    					// Create a copy of detail so we don't modify the object for the dynamic route (and the dynamic route doesn't modify our object too)
    					dispatchNextTick("routeLoaded", Object.assign({}, detail, { component, name: component.name }));
    				} else {
    					$$invalidate(0, component = null);
    					componentObj = null;
    				}

    				// Invoke the Promise
    				const loaded = await obj();

    				// Now that we're here, after the promise resolved, check if we still want this component, as the user might have navigated to another page in the meanwhile
    				if (newLoc != lastLoc) {
    					// Don't update the component, just exit
    					return;
    				}

    				// If there is a "default" property, which is used by async routes, then pick that
    				$$invalidate(0, component = loaded && loaded.default || loaded);

    				componentObj = obj;
    			}

    			// Set componentParams only if we have a match, to avoid a warning similar to `<Component> was created with unknown prop 'params'`
    			// Of course, this assumes that developers always add a "params" prop when they are expecting parameters
    			if (match && typeof match == "object" && Object.keys(match).length) {
    				$$invalidate(1, componentParams = match);
    			} else {
    				$$invalidate(1, componentParams = null);
    			}

    			// Set static props, if any
    			$$invalidate(2, props = routesList[i].props);

    			// Dispatch the routeLoaded event then exit
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick("routeLoaded", Object.assign({}, detail, { component, name: component.name }));

    			return;
    		}

    		// If we're still here, there was no match, so show the empty component
    		$$invalidate(0, component = null);

    		componentObj = null;
    	});

    	const writable_props = ["routes", "prefix", "restoreScrollState"];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	function routeEvent_handler(event) {
    		bubble($$self, event);
    	}

    	function routeEvent_handler_1(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("routes" in $$props) $$invalidate(3, routes = $$props.routes);
    		if ("prefix" in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ("restoreScrollState" in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
    	};

    	$$self.$capture_state = () => ({
    		readable,
    		derived,
    		tick,
    		_wrap: wrap,
    		wrap: wrap$1,
    		getLocation,
    		loc,
    		location,
    		querystring,
    		push,
    		pop,
    		replace,
    		link,
    		updateLink,
    		scrollstateHistoryHandler,
    		createEventDispatcher,
    		afterUpdate,
    		regexparam,
    		routes,
    		prefix,
    		restoreScrollState,
    		RouteItem,
    		routesList,
    		component,
    		componentParams,
    		props,
    		dispatch,
    		dispatchNextTick,
    		previousScrollState,
    		lastLoc,
    		componentObj
    	});

    	$$self.$inject_state = $$props => {
    		if ("routes" in $$props) $$invalidate(3, routes = $$props.routes);
    		if ("prefix" in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ("restoreScrollState" in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
    		if ("component" in $$props) $$invalidate(0, component = $$props.component);
    		if ("componentParams" in $$props) $$invalidate(1, componentParams = $$props.componentParams);
    		if ("props" in $$props) $$invalidate(2, props = $$props.props);
    		if ("previousScrollState" in $$props) previousScrollState = $$props.previousScrollState;
    		if ("lastLoc" in $$props) lastLoc = $$props.lastLoc;
    		if ("componentObj" in $$props) componentObj = $$props.componentObj;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*restoreScrollState*/ 32) {
    			// Update history.scrollRestoration depending on restoreScrollState
    			 history.scrollRestoration = restoreScrollState ? "manual" : "auto";
    		}
    	};

    	return [
    		component,
    		componentParams,
    		props,
    		routes,
    		prefix,
    		restoreScrollState,
    		routeEvent_handler,
    		routeEvent_handler_1
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance, create_fragment, safe_not_equal, {
    			routes: 3,
    			prefix: 4,
    			restoreScrollState: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get routes() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set routes(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prefix() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prefix(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get restoreScrollState() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set restoreScrollState(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/routes/Route1.svelte generated by Svelte v3.30.1 */

    function create_fragment$1(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
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

    function instance$1($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Route1", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Route1> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Route1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Route1",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/routes/NotFound.svelte generated by Svelte v3.30.1 */

    function create_fragment$2(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
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

    function instance$2($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("NotFound", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<NotFound> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class NotFound extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NotFound",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    const Routes = [
      {
        name: "Route1",
        title: "The route no. 1",
        route: "/",
        breadcrumb: ["Route 1"]
      }
    ];
    const Urls = Routes.reduce((acc, x) => {
      acc[x.name] = x.route;
      return acc;
    }, {});
    var routes = {
      [Urls.Route1]: Route1,
      "*": NotFound
    };

    const {subscribe: subscribe$1, update: update$1} = writable(localStorage.getItem("theme") === "true");
    var darkTheme = {
      subscribe: subscribe$1,
      toggle() {
        return update$1((x) => {
          localStorage.setItem("theme", (!x).toString());
          return !x;
        });
      }
    };

    const currentUserStore = writable(null);

    const localStorageKey = "sidebar_opened";
    const sidebarOpenState = writable(localStorage.getItem(localStorageKey) === "true");
    function toggleSidebarOpened() {
      sidebarOpenState.update((currentState) => {
        const newState = !currentState;
        localStorage.setItem(localStorageKey, newState.toString());
        return newState;
      });
    }

    /* src/components/structure/navigation/MobileNavToggle.svelte generated by Svelte v3.30.1 */
    const file = "src/components/structure/navigation/MobileNavToggle.svelte";

    function create_fragment$3(ctx) {
    	let a;
    	let i;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			a = element("a");
    			i = element("i");
    			attr_dev(i, "class", "fa fa-bars");
    			add_location(i, file, 15, 1, 258);
    			attr_dev(a, "href", "#");
    			attr_dev(a, "class", "sidebar-toggle svelte-1hf4kjn");
    			attr_dev(a, "data-toggle", "push-menu");
    			attr_dev(a, "role", "button");
    			add_location(a, file, 8, 0, 150);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, i);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*onToggleSidenav*/ ctx[0], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("MobileNavToggle", slots, []);

    	function onToggleSidenav() {
    		toggleSidebarOpened();
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<MobileNavToggle> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ toggleSidebarOpened, onToggleSidenav });
    	return [onToggleSidenav];
    }

    class MobileNavToggle extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MobileNavToggle",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/components/structure/navigation/BrandNavLogoSidebar.svelte generated by Svelte v3.30.1 */

    const file$1 = "src/components/structure/navigation/BrandNavLogoSidebar.svelte";

    function create_fragment$4(ctx) {
    	let a;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			img = element("img");
    			if (img.src !== (img_src_value = "/images/logo-ge-cp.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Home");
    			attr_dev(img, "width", "200");
    			set_style(img, "opacity", ".8");
    			attr_dev(img, "class", "svelte-s7wdzp");
    			add_location(img, file$1, 1, 1, 28);
    			attr_dev(a, "href", "#/");
    			attr_dev(a, "class", "logo svelte-s7wdzp");
    			add_location(a, file$1, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, img);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("BrandNavLogoSidebar", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<BrandNavLogoSidebar> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class BrandNavLogoSidebar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BrandNavLogoSidebar",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/components/structure/navigation/UserDropdownMenu.svelte generated by Svelte v3.30.1 */
    const file$2 = "src/components/structure/navigation/UserDropdownMenu.svelte";

    // (34:6) {:else}
    function create_else_block$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Černé téma");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(34:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (32:6) {#if darkTheme}
    function create_if_block$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Světlé téma");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(32:6) {#if darkTheme}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let li2;
    	let a0;
    	let span0;
    	let t0;
    	let t1;
    	let span1;
    	let i;
    	let t2;
    	let ul;
    	let li0;
    	let div1;
    	let div0;
    	let button;
    	let t3;
    	let li1;
    	let div2;
    	let a1;
    	let t4;
    	let t5;
    	let div3;
    	let a2;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*darkTheme*/ ctx[1]) return create_if_block$1;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			li2 = element("li");
    			a0 = element("a");
    			span0 = element("span");
    			t0 = text(/*displayName*/ ctx[0]);
    			t1 = space();
    			span1 = element("span");
    			i = element("i");
    			t2 = space();
    			ul = element("ul");
    			li0 = element("li");
    			div1 = element("div");
    			div0 = element("div");
    			button = element("button");
    			if_block.c();
    			t3 = space();
    			li1 = element("li");
    			div2 = element("div");
    			a1 = element("a");
    			t4 = text(/*displayName*/ ctx[0]);
    			t5 = space();
    			div3 = element("div");
    			a2 = element("a");
    			a2.textContent = "Odhlásit";
    			attr_dev(span0, "class", "hidden-sm hidden-xs");
    			add_location(span0, file$2, 16, 2, 358);
    			attr_dev(i, "class", "fas fa-user");
    			add_location(i, file$2, 18, 3, 455);
    			attr_dev(span1, "class", "visible-sm visible-xs");
    			add_location(span1, file$2, 17, 2, 415);
    			attr_dev(a0, "href", "#");
    			attr_dev(a0, "class", "dropdown-toggle svelte-awqaln");
    			attr_dev(a0, "data-toggle", "dropdown");
    			add_location(a0, file$2, 15, 1, 296);
    			attr_dev(button, "class", "btn");
    			toggle_class(button, "bg-navy", !/*darkTheme*/ ctx[1]);
    			toggle_class(button, "bg-gray", /*darkTheme*/ ctx[1]);
    			add_location(button, file$2, 25, 5, 633);
    			attr_dev(div0, "class", "col-xs-offset-6 col-xs-6 text-center");
    			add_location(div0, file$2, 24, 4, 577);
    			attr_dev(div1, "class", "row");
    			add_location(div1, file$2, 23, 3, 555);
    			attr_dev(li0, "class", "user-body");
    			add_location(li0, file$2, 22, 2, 529);
    			attr_dev(a1, "href", "#");
    			attr_dev(a1, "class", "btn btn-default btn-flat svelte-awqaln");
    			add_location(a1, file$2, 44, 4, 989);
    			attr_dev(div2, "class", "pull-left");
    			add_location(div2, file$2, 43, 3, 961);
    			attr_dev(a2, "class", "btn btn-default btn-flat svelte-awqaln");
    			add_location(a2, file$2, 49, 4, 1105);
    			attr_dev(div3, "class", "pull-right");
    			add_location(div3, file$2, 48, 3, 1076);
    			attr_dev(li1, "class", "user-footer");
    			add_location(li1, file$2, 42, 2, 933);
    			attr_dev(ul, "class", "dropdown-menu");
    			add_location(ul, file$2, 21, 1, 500);
    			attr_dev(li2, "class", "dropdown user user-menu svelte-awqaln");
    			add_location(li2, file$2, 14, 0, 258);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li2, anchor);
    			append_dev(li2, a0);
    			append_dev(a0, span0);
    			append_dev(span0, t0);
    			append_dev(a0, t1);
    			append_dev(a0, span1);
    			append_dev(span1, i);
    			append_dev(li2, t2);
    			append_dev(li2, ul);
    			append_dev(ul, li0);
    			append_dev(li0, div1);
    			append_dev(div1, div0);
    			append_dev(div0, button);
    			if_block.m(button, null);
    			append_dev(ul, t3);
    			append_dev(ul, li1);
    			append_dev(li1, div2);
    			append_dev(div2, a1);
    			append_dev(a1, t4);
    			append_dev(li1, t5);
    			append_dev(li1, div3);
    			append_dev(div3, a2);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "click", /*onToggleTheme*/ ctx[3], false, false, false),
    					listen_dev(a2, "click", /*click_handler*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*displayName*/ 1) set_data_dev(t0, /*displayName*/ ctx[0]);

    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(button, null);
    				}
    			}

    			if (dirty & /*darkTheme*/ 2) {
    				toggle_class(button, "bg-navy", !/*darkTheme*/ ctx[1]);
    			}

    			if (dirty & /*darkTheme*/ 2) {
    				toggle_class(button, "bg-gray", /*darkTheme*/ ctx[1]);
    			}

    			if (dirty & /*displayName*/ 1) set_data_dev(t4, /*displayName*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li2);
    			if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("UserDropdownMenu", slots, []);
    	let { displayName = "Neznámý" } = $$props;
    	let { darkTheme = false } = $$props;
    	const dispatch = createEventDispatcher();

    	function onToggleTheme(ev) {
    		ev.preventDefault();
    		dispatch("toggleTheme");
    	}

    	const writable_props = ["displayName", "darkTheme"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<UserDropdownMenu> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => dispatch("logout");

    	$$self.$$set = $$props => {
    		if ("displayName" in $$props) $$invalidate(0, displayName = $$props.displayName);
    		if ("darkTheme" in $$props) $$invalidate(1, darkTheme = $$props.darkTheme);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		displayName,
    		darkTheme,
    		dispatch,
    		onToggleTheme
    	});

    	$$self.$inject_state = $$props => {
    		if ("displayName" in $$props) $$invalidate(0, displayName = $$props.displayName);
    		if ("darkTheme" in $$props) $$invalidate(1, darkTheme = $$props.darkTheme);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [displayName, darkTheme, dispatch, onToggleTheme, click_handler];
    }

    class UserDropdownMenu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { displayName: 0, darkTheme: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "UserDropdownMenu",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get displayName() {
    		throw new Error("<UserDropdownMenu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set displayName(value) {
    		throw new Error("<UserDropdownMenu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get darkTheme() {
    		throw new Error("<UserDropdownMenu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set darkTheme(value) {
    		throw new Error("<UserDropdownMenu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/structure/navigation/TopNavigation.svelte generated by Svelte v3.30.1 */
    const file$3 = "src/components/structure/navigation/TopNavigation.svelte";

    function create_fragment$6(ctx) {
    	let header;
    	let mobilenavtoggle;
    	let t0;
    	let nav;
    	let brandnavlogosidebar;
    	let t1;
    	let div;
    	let ul;
    	let userdropdownmenu;
    	let current;
    	mobilenavtoggle = new MobileNavToggle({ $$inline: true });
    	brandnavlogosidebar = new BrandNavLogoSidebar({ $$inline: true });

    	userdropdownmenu = new UserDropdownMenu({
    			props: {
    				displayName: /*displayName*/ ctx[1],
    				darkTheme: /*darkTheme*/ ctx[0]
    			},
    			$$inline: true
    		});

    	userdropdownmenu.$on("toggleTheme", /*toggleTheme_handler*/ ctx[2]);
    	userdropdownmenu.$on("logout", logout);

    	const block = {
    		c: function create() {
    			header = element("header");
    			create_component(mobilenavtoggle.$$.fragment);
    			t0 = space();
    			nav = element("nav");
    			create_component(brandnavlogosidebar.$$.fragment);
    			t1 = space();
    			div = element("div");
    			ul = element("ul");
    			create_component(userdropdownmenu.$$.fragment);
    			attr_dev(ul, "class", "nav navbar-nav");
    			add_location(ul, file$3, 26, 3, 624);
    			attr_dev(div, "class", "navbar-custom-menu");
    			add_location(div, file$3, 25, 2, 588);
    			attr_dev(nav, "class", "navbar navbar-static-top");
    			add_location(nav, file$3, 21, 1, 519);
    			attr_dev(header, "class", "main-header");
    			add_location(header, file$3, 19, 0, 468);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			mount_component(mobilenavtoggle, header, null);
    			append_dev(header, t0);
    			append_dev(header, nav);
    			mount_component(brandnavlogosidebar, nav, null);
    			append_dev(nav, t1);
    			append_dev(nav, div);
    			append_dev(div, ul);
    			mount_component(userdropdownmenu, ul, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const userdropdownmenu_changes = {};
    			if (dirty & /*displayName*/ 2) userdropdownmenu_changes.displayName = /*displayName*/ ctx[1];
    			if (dirty & /*darkTheme*/ 1) userdropdownmenu_changes.darkTheme = /*darkTheme*/ ctx[0];
    			userdropdownmenu.$set(userdropdownmenu_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(mobilenavtoggle.$$.fragment, local);
    			transition_in(brandnavlogosidebar.$$.fragment, local);
    			transition_in(userdropdownmenu.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(mobilenavtoggle.$$.fragment, local);
    			transition_out(brandnavlogosidebar.$$.fragment, local);
    			transition_out(userdropdownmenu.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			destroy_component(mobilenavtoggle);
    			destroy_component(brandnavlogosidebar);
    			destroy_component(userdropdownmenu);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function logout() {
    	alert("Do the logout");
    } // window.location.replace(LogoutPath)

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TopNavigation", slots, []);
    	let { darkTheme = false } = $$props;
    	let { displayName = "" } = $$props;

    	// let darkThemeCounter = 1
    	const dispatch = createEventDispatcher();

    	const writable_props = ["darkTheme", "displayName"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TopNavigation> was created with unknown prop '${key}'`);
    	});

    	function toggleTheme_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("darkTheme" in $$props) $$invalidate(0, darkTheme = $$props.darkTheme);
    		if ("displayName" in $$props) $$invalidate(1, displayName = $$props.displayName);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		MobileNavToggle,
    		BrandNavLogoSidebar,
    		UserDropdownMenu,
    		darkTheme,
    		displayName,
    		dispatch,
    		logout
    	});

    	$$self.$inject_state = $$props => {
    		if ("darkTheme" in $$props) $$invalidate(0, darkTheme = $$props.darkTheme);
    		if ("displayName" in $$props) $$invalidate(1, displayName = $$props.displayName);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [darkTheme, displayName, toggleTheme_handler];
    }

    class TopNavigation extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { darkTheme: 0, displayName: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TopNavigation",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get darkTheme() {
    		throw new Error("<TopNavigation>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set darkTheme(value) {
    		throw new Error("<TopNavigation>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get displayName() {
    		throw new Error("<TopNavigation>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set displayName(value) {
    		throw new Error("<TopNavigation>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const routeBreadcrumbs = writable(null);

    const routeTitle = writable(null);

    /* src/components/ui/LteButton.svelte generated by Svelte v3.30.1 */

    const file$4 = "src/components/ui/LteButton.svelte";

    function create_fragment$7(ctx) {
    	let button;
    	let button_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[13].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[12], null);

    	let button_levels = [
    		{
    			class: button_class_value = "btn btn-" + (/*outlined*/ ctx[5] && "outlined-" || "") + /*color*/ ctx[0] + " btn-flat"
    		},
    		{ disabled: /*disabled*/ ctx[8] },
    		/*$$props*/ ctx[11]
    	];

    	let button_data = {};

    	for (let i = 0; i < button_levels.length; i += 1) {
    		button_data = assign(button_data, button_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			if (default_slot) default_slot.c();
    			set_attributes(button, button_data);
    			toggle_class(button, "btn-xs", /*xsmall*/ ctx[1]);
    			toggle_class(button, "btn-sm", /*small*/ ctx[2]);
    			toggle_class(button, "btn-lg", /*large*/ ctx[3]);
    			toggle_class(button, "btn-flat", /*borderless*/ ctx[4]);
    			toggle_class(button, "btn-social", /*social*/ ctx[6]);
    			toggle_class(button, "btn-app", /*app*/ ctx[9]);
    			toggle_class(button, "btn-link", /*link*/ ctx[7]);
    			toggle_class(button, "squared", /*squared*/ ctx[10]);
    			toggle_class(button, "disabled", /*disabled*/ ctx[8]);
    			toggle_class(button, "svelte-1gk7eb2", true);
    			add_location(button, file$4, 16, 0, 324);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[14], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 4096) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[12], dirty, null, null);
    				}
    			}

    			set_attributes(button, button_data = get_spread_update(button_levels, [
    				(!current || dirty & /*outlined, color*/ 33 && button_class_value !== (button_class_value = "btn btn-" + (/*outlined*/ ctx[5] && "outlined-" || "") + /*color*/ ctx[0] + " btn-flat")) && { class: button_class_value },
    				(!current || dirty & /*disabled*/ 256) && { disabled: /*disabled*/ ctx[8] },
    				dirty & /*$$props*/ 2048 && /*$$props*/ ctx[11]
    			]));

    			toggle_class(button, "btn-xs", /*xsmall*/ ctx[1]);
    			toggle_class(button, "btn-sm", /*small*/ ctx[2]);
    			toggle_class(button, "btn-lg", /*large*/ ctx[3]);
    			toggle_class(button, "btn-flat", /*borderless*/ ctx[4]);
    			toggle_class(button, "btn-social", /*social*/ ctx[6]);
    			toggle_class(button, "btn-app", /*app*/ ctx[9]);
    			toggle_class(button, "btn-link", /*link*/ ctx[7]);
    			toggle_class(button, "squared", /*squared*/ ctx[10]);
    			toggle_class(button, "disabled", /*disabled*/ ctx[8]);
    			toggle_class(button, "svelte-1gk7eb2", true);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("LteButton", slots, ['default']);
    	let { color = "default" } = $$props;
    	let { xsmall = false } = $$props;
    	let { small = false } = $$props;
    	let { large = false } = $$props;
    	let { borderless = false } = $$props;
    	let { outlined = false } = $$props;
    	let { social = false } = $$props;
    	let { link = false } = $$props;
    	let { disabled = false } = $$props;
    	let { app = false } = $$props;
    	let { squared = false } = $$props;

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(11, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("color" in $$new_props) $$invalidate(0, color = $$new_props.color);
    		if ("xsmall" in $$new_props) $$invalidate(1, xsmall = $$new_props.xsmall);
    		if ("small" in $$new_props) $$invalidate(2, small = $$new_props.small);
    		if ("large" in $$new_props) $$invalidate(3, large = $$new_props.large);
    		if ("borderless" in $$new_props) $$invalidate(4, borderless = $$new_props.borderless);
    		if ("outlined" in $$new_props) $$invalidate(5, outlined = $$new_props.outlined);
    		if ("social" in $$new_props) $$invalidate(6, social = $$new_props.social);
    		if ("link" in $$new_props) $$invalidate(7, link = $$new_props.link);
    		if ("disabled" in $$new_props) $$invalidate(8, disabled = $$new_props.disabled);
    		if ("app" in $$new_props) $$invalidate(9, app = $$new_props.app);
    		if ("squared" in $$new_props) $$invalidate(10, squared = $$new_props.squared);
    		if ("$$scope" in $$new_props) $$invalidate(12, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		color,
    		xsmall,
    		small,
    		large,
    		borderless,
    		outlined,
    		social,
    		link,
    		disabled,
    		app,
    		squared
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(11, $$props = assign(assign({}, $$props), $$new_props));
    		if ("color" in $$props) $$invalidate(0, color = $$new_props.color);
    		if ("xsmall" in $$props) $$invalidate(1, xsmall = $$new_props.xsmall);
    		if ("small" in $$props) $$invalidate(2, small = $$new_props.small);
    		if ("large" in $$props) $$invalidate(3, large = $$new_props.large);
    		if ("borderless" in $$props) $$invalidate(4, borderless = $$new_props.borderless);
    		if ("outlined" in $$props) $$invalidate(5, outlined = $$new_props.outlined);
    		if ("social" in $$props) $$invalidate(6, social = $$new_props.social);
    		if ("link" in $$props) $$invalidate(7, link = $$new_props.link);
    		if ("disabled" in $$props) $$invalidate(8, disabled = $$new_props.disabled);
    		if ("app" in $$props) $$invalidate(9, app = $$new_props.app);
    		if ("squared" in $$props) $$invalidate(10, squared = $$new_props.squared);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);

    	return [
    		color,
    		xsmall,
    		small,
    		large,
    		borderless,
    		outlined,
    		social,
    		link,
    		disabled,
    		app,
    		squared,
    		$$props,
    		$$scope,
    		slots,
    		click_handler
    	];
    }

    class LteButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {
    			color: 0,
    			xsmall: 1,
    			small: 2,
    			large: 3,
    			borderless: 4,
    			outlined: 5,
    			social: 6,
    			link: 7,
    			disabled: 8,
    			app: 9,
    			squared: 10
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LteButton",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get color() {
    		throw new Error("<LteButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<LteButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get xsmall() {
    		throw new Error("<LteButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set xsmall(value) {
    		throw new Error("<LteButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get small() {
    		throw new Error("<LteButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set small(value) {
    		throw new Error("<LteButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get large() {
    		throw new Error("<LteButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set large(value) {
    		throw new Error("<LteButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get borderless() {
    		throw new Error("<LteButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set borderless(value) {
    		throw new Error("<LteButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outlined() {
    		throw new Error("<LteButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outlined(value) {
    		throw new Error("<LteButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get social() {
    		throw new Error("<LteButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set social(value) {
    		throw new Error("<LteButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get link() {
    		throw new Error("<LteButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set link(value) {
    		throw new Error("<LteButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<LteButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<LteButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get app() {
    		throw new Error("<LteButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set app(value) {
    		throw new Error("<LteButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get squared() {
    		throw new Error("<LteButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set squared(value) {
    		throw new Error("<LteButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/structure/PageHeader.svelte generated by Svelte v3.30.1 */
    const file$5 = "src/components/structure/PageHeader.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	child_ctx[9] = i;
    	return child_ctx;
    }

    // (22:0) {#if currentRoute}
    function create_if_block$2(ctx) {
    	let section;
    	let t0;
    	let h1;
    	let t1;
    	let t2;
    	let current;
    	let if_block0 = /*$location*/ ctx[1] !== "/" && create_if_block_2(ctx);
    	let if_block1 = /*breadcrumbs*/ ctx[2] && /*breadcrumbs*/ ctx[2].length && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			section = element("section");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			h1 = element("h1");
    			t1 = text(/*title*/ ctx[3]);
    			t2 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(h1, "class", "svelte-12rzgaa");
    			add_location(h1, file$5, 28, 2, 925);
    			attr_dev(section, "class", "content-header svelte-12rzgaa");
    			add_location(section, file$5, 22, 1, 736);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			if (if_block0) if_block0.m(section, null);
    			append_dev(section, t0);
    			append_dev(section, h1);
    			append_dev(h1, t1);
    			append_dev(section, t2);
    			if (if_block1) if_block1.m(section, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*$location*/ ctx[1] !== "/") {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*$location*/ 2) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_2(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(section, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*title*/ 8) set_data_dev(t1, /*title*/ ctx[3]);

    			if (/*breadcrumbs*/ ctx[2] && /*breadcrumbs*/ ctx[2].length) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1(ctx);
    					if_block1.c();
    					if_block1.m(section, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(22:0) {#if currentRoute}",
    		ctx
    	});

    	return block;
    }

    // (24:2) {#if $location !== "/"}
    function create_if_block_2(ctx) {
    	let ltebutton;
    	let current;

    	ltebutton = new LteButton({
    			props: {
    				small: true,
    				link: true,
    				squared: true,
    				color: "",
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	ltebutton.$on("click", /*noRouteBack*/ ctx[4]);

    	const block = {
    		c: function create() {
    			create_component(ltebutton.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(ltebutton, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const ltebutton_changes = {};

    			if (dirty & /*$$scope*/ 1024) {
    				ltebutton_changes.$$scope = { dirty, ctx };
    			}

    			ltebutton.$set(ltebutton_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(ltebutton.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(ltebutton.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(ltebutton, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(24:2) {#if $location !== \\\"/\\\"}",
    		ctx
    	});

    	return block;
    }

    // (25:3) <LteButton small link squared color="" on:click={noRouteBack}>
    function create_default_slot(ctx) {
    	let i;

    	const block = {
    		c: function create() {
    			i = element("i");
    			attr_dev(i, "class", "fas fa-arrow-left");
    			add_location(i, file$5, 25, 4, 865);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(25:3) <LteButton small link squared color=\\\"\\\" on:click={noRouteBack}>",
    		ctx
    	});

    	return block;
    }

    // (32:2) {#if breadcrumbs && breadcrumbs.length}
    function create_if_block_1(ctx) {
    	let ol;
    	let each_value = /*breadcrumbs*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			ol = element("ol");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ol, "class", "breadcrumb svelte-12rzgaa");
    			add_location(ol, file$5, 32, 3, 994);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ol, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ol, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*currentRoute, breadcrumbs*/ 5) {
    				each_value = /*breadcrumbs*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ol, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ol);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(32:2) {#if breadcrumbs && breadcrumbs.length}",
    		ctx
    	});

    	return block;
    }

    // (34:4) {#each breadcrumbs as breadcrumb, i}
    function create_each_block(ctx) {
    	let li;
    	let t0_value = /*breadcrumb*/ ctx[7] + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t0 = text(t0_value);
    			t1 = space();
    			toggle_class(li, "active", /*currentRoute*/ ctx[0].breadcrumb - 1 === /*i*/ ctx[9]);
    			add_location(li, file$5, 34, 5, 1064);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t0);
    			append_dev(li, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*breadcrumbs*/ 4 && t0_value !== (t0_value = /*breadcrumb*/ ctx[7] + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*currentRoute*/ 1) {
    				toggle_class(li, "active", /*currentRoute*/ ctx[0].breadcrumb - 1 === /*i*/ ctx[9]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(34:4) {#each breadcrumbs as breadcrumb, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*currentRoute*/ ctx[0] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*currentRoute*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*currentRoute*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let $location;
    	let $routeBreadcrumbs;
    	let $routeTitle;
    	validate_store(location, "location");
    	component_subscribe($$self, location, $$value => $$invalidate(1, $location = $$value));
    	validate_store(routeBreadcrumbs, "routeBreadcrumbs");
    	component_subscribe($$self, routeBreadcrumbs, $$value => $$invalidate(5, $routeBreadcrumbs = $$value));
    	validate_store(routeTitle, "routeTitle");
    	component_subscribe($$self, routeTitle, $$value => $$invalidate(6, $routeTitle = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("PageHeader", slots, []);

    	function noRouteBack() {
    		pop();
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<PageHeader> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		location,
    		pop,
    		Routes,
    		routeBreadcrumbs,
    		routeTitle,
    		LteButton,
    		noRouteBack,
    		currentRoute,
    		$location,
    		breadcrumbs,
    		$routeBreadcrumbs,
    		title,
    		$routeTitle
    	});

    	$$self.$inject_state = $$props => {
    		if ("currentRoute" in $$props) $$invalidate(0, currentRoute = $$props.currentRoute);
    		if ("breadcrumbs" in $$props) $$invalidate(2, breadcrumbs = $$props.breadcrumbs);
    		if ("title" in $$props) $$invalidate(3, title = $$props.title);
    	};

    	let currentRoute;
    	let breadcrumbs;
    	let title;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$location*/ 2) {
    			// let title = ""
    			// find current route by regex matching against route "map"
    			// by replacing any route params (/foo/:param1/baz) with ^/foo/\w+/baz$
    			 $$invalidate(0, currentRoute = Routes.find(x => $location.match("^" + x.route.replace(/:\w+/, "\\w+") + "$")));
    		}

    		if ($$self.$$.dirty & /*$routeBreadcrumbs, currentRoute*/ 33) {
    			 $$invalidate(2, breadcrumbs = $routeBreadcrumbs || currentRoute && currentRoute.breadcrumb || []);
    		}

    		if ($$self.$$.dirty & /*$routeTitle, currentRoute*/ 65) {
    			 $$invalidate(3, title = $routeTitle || currentRoute && currentRoute.title || "");
    		}
    	};

    	return [
    		currentRoute,
    		$location,
    		breadcrumbs,
    		title,
    		noRouteBack,
    		$routeBreadcrumbs,
    		$routeTitle
    	];
    }

    class PageHeader extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PageHeader",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src/components/structure/navigation/Sidebar.svelte generated by Svelte v3.30.1 */

    const file$6 = "src/components/structure/navigation/Sidebar.svelte";

    function create_fragment$9(ctx) {
    	let aside;
    	let div2;
    	let section;
    	let ul3;
    	let li0;
    	let a0;
    	let i0;
    	let t0;
    	let span0;
    	let t2;
    	let li8;
    	let a1;
    	let i1;
    	let t3;
    	let span1;
    	let t5;
    	let span2;
    	let i2;
    	let t6;
    	let ul2;
    	let li1;
    	let a2;
    	let i3;
    	let t7;
    	let t8;
    	let li6;
    	let a3;
    	let i4;
    	let t9;
    	let span3;
    	let i5;
    	let t10;
    	let ul1;
    	let li2;
    	let a4;
    	let i6;
    	let t11;
    	let t12;
    	let li5;
    	let a5;
    	let i7;
    	let t13;
    	let span4;
    	let i8;
    	let t14;
    	let ul0;
    	let li3;
    	let a6;
    	let i9;
    	let t15;
    	let t16;
    	let li4;
    	let a7;
    	let i10;
    	let t17;
    	let t18;
    	let li7;
    	let a8;
    	let i11;
    	let t19;
    	let t20;
    	let div0;
    	let t21;
    	let div1;

    	const block = {
    		c: function create() {
    			aside = element("aside");
    			div2 = element("div");
    			section = element("section");
    			ul3 = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			i0 = element("i");
    			t0 = space();
    			span0 = element("span");
    			span0.textContent = "Route 1";
    			t2 = space();
    			li8 = element("li");
    			a1 = element("a");
    			i1 = element("i");
    			t3 = space();
    			span1 = element("span");
    			span1.textContent = "Multilevel";
    			t5 = space();
    			span2 = element("span");
    			i2 = element("i");
    			t6 = space();
    			ul2 = element("ul");
    			li1 = element("li");
    			a2 = element("a");
    			i3 = element("i");
    			t7 = text(" Level One");
    			t8 = space();
    			li6 = element("li");
    			a3 = element("a");
    			i4 = element("i");
    			t9 = text(" Level One\n                ");
    			span3 = element("span");
    			i5 = element("i");
    			t10 = space();
    			ul1 = element("ul");
    			li2 = element("li");
    			a4 = element("a");
    			i6 = element("i");
    			t11 = text(" Level Two");
    			t12 = space();
    			li5 = element("li");
    			a5 = element("a");
    			i7 = element("i");
    			t13 = text(" Level Two\n                    ");
    			span4 = element("span");
    			i8 = element("i");
    			t14 = space();
    			ul0 = element("ul");
    			li3 = element("li");
    			a6 = element("a");
    			i9 = element("i");
    			t15 = text(" Level Three");
    			t16 = space();
    			li4 = element("li");
    			a7 = element("a");
    			i10 = element("i");
    			t17 = text(" Level Three");
    			t18 = space();
    			li7 = element("li");
    			a8 = element("a");
    			i11 = element("i");
    			t19 = text(" Level One");
    			t20 = space();
    			div0 = element("div");
    			t21 = space();
    			div1 = element("div");
    			attr_dev(i0, "class", "fa fa-book");
    			add_location(i0, file$6, 6, 6, 173);
    			add_location(span0, file$6, 7, 6, 206);
    			attr_dev(a0, "href", "#/");
    			add_location(a0, file$6, 5, 5, 153);
    			add_location(li0, file$6, 4, 4, 143);
    			attr_dev(i1, "class", "fa fa-share");
    			add_location(i1, file$6, 12, 12, 330);
    			add_location(span1, file$6, 12, 40, 358);
    			attr_dev(i2, "class", "fa fa-angle-left pull-right");
    			add_location(i2, file$6, 14, 14, 444);
    			attr_dev(span2, "class", "pull-right-container");
    			add_location(span2, file$6, 13, 12, 394);
    			attr_dev(a1, "href", "#");
    			add_location(a1, file$6, 11, 10, 305);
    			attr_dev(i3, "class", "far fa-circle");
    			add_location(i3, file$6, 18, 28, 612);
    			attr_dev(a2, "href", "#");
    			add_location(a2, file$6, 18, 16, 600);
    			add_location(li1, file$6, 18, 12, 596);
    			attr_dev(i4, "class", "far fa-circle");
    			add_location(i4, file$6, 20, 26, 721);
    			attr_dev(i5, "class", "fa fa-angle-left pull-right");
    			add_location(i5, file$6, 22, 18, 831);
    			attr_dev(span3, "class", "pull-right-container");
    			add_location(span3, file$6, 21, 16, 777);
    			attr_dev(a3, "href", "#");
    			add_location(a3, file$6, 20, 14, 709);
    			attr_dev(i6, "class", "far fa-circle");
    			add_location(i6, file$6, 26, 32, 991);
    			attr_dev(a4, "href", "#");
    			add_location(a4, file$6, 26, 20, 979);
    			add_location(li2, file$6, 26, 16, 975);
    			attr_dev(i7, "class", "far fa-circle");
    			add_location(i7, file$6, 28, 30, 1108);
    			attr_dev(i8, "class", "fa fa-angle-left pull-right");
    			add_location(i8, file$6, 30, 22, 1226);
    			attr_dev(span4, "class", "pull-right-container");
    			add_location(span4, file$6, 29, 20, 1168);
    			attr_dev(a5, "href", "#");
    			add_location(a5, file$6, 28, 18, 1096);
    			attr_dev(i9, "class", "far fa-circle");
    			add_location(i9, file$6, 34, 36, 1402);
    			attr_dev(a6, "href", "#");
    			add_location(a6, file$6, 34, 24, 1390);
    			add_location(li3, file$6, 34, 20, 1386);
    			attr_dev(i10, "class", "far fa-circle");
    			add_location(i10, file$6, 35, 36, 1489);
    			attr_dev(a7, "href", "#");
    			add_location(a7, file$6, 35, 24, 1477);
    			add_location(li4, file$6, 35, 20, 1473);
    			attr_dev(ul0, "class", "treeview-menu");
    			add_location(ul0, file$6, 33, 18, 1339);
    			attr_dev(li5, "class", "treeview");
    			add_location(li5, file$6, 27, 16, 1056);
    			attr_dev(ul1, "class", "treeview-menu");
    			add_location(ul1, file$6, 25, 14, 932);
    			attr_dev(li6, "class", "treeview");
    			add_location(li6, file$6, 19, 12, 673);
    			attr_dev(i11, "class", "far fa-circle");
    			add_location(i11, file$6, 40, 28, 1652);
    			attr_dev(a8, "href", "#");
    			add_location(a8, file$6, 40, 16, 1640);
    			add_location(li7, file$6, 40, 12, 1636);
    			attr_dev(ul2, "class", "treeview-menu");
    			set_style(ul2, "display", "block");
    			add_location(ul2, file$6, 17, 10, 533);
    			attr_dev(li8, "class", "treeview");
    			set_style(li8, "height", "auto");
    			add_location(li8, file$6, 10, 4, 251);
    			attr_dev(ul3, "class", "sidebar-menu tree");
    			attr_dev(ul3, "data-widget", "tree");
    			add_location(ul3, file$6, 3, 3, 89);
    			attr_dev(section, "class", "sidebar");
    			add_location(section, file$6, 2, 2, 60);
    			attr_dev(div0, "class", "slimScrollBar");
    			add_location(div0, file$6, 45, 2, 1755);
    			attr_dev(div1, "class", "slimScrollRail");
    			add_location(div1, file$6, 46, 2, 1791);
    			attr_dev(div2, "class", "slimScrollDiv");
    			add_location(div2, file$6, 1, 1, 30);
    			attr_dev(aside, "class", "main-sidebar");
    			add_location(aside, file$6, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, aside, anchor);
    			append_dev(aside, div2);
    			append_dev(div2, section);
    			append_dev(section, ul3);
    			append_dev(ul3, li0);
    			append_dev(li0, a0);
    			append_dev(a0, i0);
    			append_dev(a0, t0);
    			append_dev(a0, span0);
    			append_dev(ul3, t2);
    			append_dev(ul3, li8);
    			append_dev(li8, a1);
    			append_dev(a1, i1);
    			append_dev(a1, t3);
    			append_dev(a1, span1);
    			append_dev(a1, t5);
    			append_dev(a1, span2);
    			append_dev(span2, i2);
    			append_dev(li8, t6);
    			append_dev(li8, ul2);
    			append_dev(ul2, li1);
    			append_dev(li1, a2);
    			append_dev(a2, i3);
    			append_dev(a2, t7);
    			append_dev(ul2, t8);
    			append_dev(ul2, li6);
    			append_dev(li6, a3);
    			append_dev(a3, i4);
    			append_dev(a3, t9);
    			append_dev(a3, span3);
    			append_dev(span3, i5);
    			append_dev(li6, t10);
    			append_dev(li6, ul1);
    			append_dev(ul1, li2);
    			append_dev(li2, a4);
    			append_dev(a4, i6);
    			append_dev(a4, t11);
    			append_dev(ul1, t12);
    			append_dev(ul1, li5);
    			append_dev(li5, a5);
    			append_dev(a5, i7);
    			append_dev(a5, t13);
    			append_dev(a5, span4);
    			append_dev(span4, i8);
    			append_dev(li5, t14);
    			append_dev(li5, ul0);
    			append_dev(ul0, li3);
    			append_dev(li3, a6);
    			append_dev(a6, i9);
    			append_dev(a6, t15);
    			append_dev(ul0, t16);
    			append_dev(ul0, li4);
    			append_dev(li4, a7);
    			append_dev(a7, i10);
    			append_dev(a7, t17);
    			append_dev(ul2, t18);
    			append_dev(ul2, li7);
    			append_dev(li7, a8);
    			append_dev(a8, i11);
    			append_dev(a8, t19);
    			append_dev(div2, t20);
    			append_dev(div2, div0);
    			append_dev(div2, t21);
    			append_dev(div2, div1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(aside);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Sidebar", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Sidebar> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Sidebar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Sidebar",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.30.1 */
    const file$7 = "src/App.svelte";

    function create_fragment$a(ctx) {
    	let div2;
    	let topnavigation;
    	let t0;
    	let sidebar;
    	let t1;
    	let div1;
    	let pageheader;
    	let t2;
    	let div0;
    	let router;
    	let current;

    	topnavigation = new TopNavigation({
    			props: {
    				darkTheme: /*$darkTheme*/ ctx[0],
    				displayName: /*$currentUser*/ ctx[1] && /*$currentUser*/ ctx[1].display_name || "Unknown"
    			},
    			$$inline: true
    		});

    	topnavigation.$on("toggleTheme", darkTheme.toggle);
    	sidebar = new Sidebar({ $$inline: true });
    	pageheader = new PageHeader({ $$inline: true });
    	router = new Router({ props: { routes }, $$inline: true });

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			create_component(topnavigation.$$.fragment);
    			t0 = space();
    			create_component(sidebar.$$.fragment);
    			t1 = space();
    			div1 = element("div");
    			create_component(pageheader.$$.fragment);
    			t2 = space();
    			div0 = element("div");
    			create_component(router.$$.fragment);
    			attr_dev(div0, "class", "content");
    			add_location(div0, file$7, 45, 2, 1270);
    			attr_dev(div1, "class", "content-wrapper");
    			add_location(div1, file$7, 43, 1, 1221);
    			attr_dev(div2, "class", "wrapper");
    			add_location(div2, file$7, 35, 0, 1032);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			mount_component(topnavigation, div2, null);
    			append_dev(div2, t0);
    			mount_component(sidebar, div2, null);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			mount_component(pageheader, div1, null);
    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			mount_component(router, div0, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const topnavigation_changes = {};
    			if (dirty & /*$darkTheme*/ 1) topnavigation_changes.darkTheme = /*$darkTheme*/ ctx[0];
    			if (dirty & /*$currentUser*/ 2) topnavigation_changes.displayName = /*$currentUser*/ ctx[1] && /*$currentUser*/ ctx[1].display_name || "Unknown";
    			topnavigation.$set(topnavigation_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(topnavigation.$$.fragment, local);
    			transition_in(sidebar.$$.fragment, local);
    			transition_in(pageheader.$$.fragment, local);
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(topnavigation.$$.fragment, local);
    			transition_out(sidebar.$$.fragment, local);
    			transition_out(pageheader.$$.fragment, local);
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(topnavigation);
    			destroy_component(sidebar);
    			destroy_component(pageheader);
    			destroy_component(router);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let $darkTheme;
    	let $currentUser;
    	validate_store(darkTheme, "darkTheme");
    	component_subscribe($$self, darkTheme, $$value => $$invalidate(0, $darkTheme = $$value));
    	validate_store(currentUserStore, "currentUser");
    	component_subscribe($$self, currentUserStore, $$value => $$invalidate(1, $currentUser = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);

    	function applySidebarOpenState() {
    		if (!get_store_value(sidebarOpenState)) {
    			document.body.classList.add("sidebar-collapse", "sidebar-mini-expand-feature");
    			document.body.classList.remove("sidebar-mini-expand-feature");
    		}
    	}

    	onMount(() => {
    		applySidebarOpenState();
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		get: get_store_value,
    		Router,
    		routes,
    		darkTheme,
    		currentUser: currentUserStore,
    		sidebarOpenState,
    		TopNavigation,
    		PageHeader,
    		Sidebar,
    		applySidebarOpenState,
    		$darkTheme,
    		$currentUser
    	});

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$darkTheme*/ 1) {
    			 if ($darkTheme) {
    				document.body.classList.remove("skin-black");
    				document.body.classList.add("skin-midnight");
    			} else {
    				document.body.classList.remove("skin-midnight");
    				document.body.classList.add("skin-black");
    			}
    		}
    	};

    	return [$darkTheme, $currentUser];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    const app = new App({
      target: document.getElementById("app")
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
