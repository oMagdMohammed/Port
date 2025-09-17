
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
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
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
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
    function children(element) {
        return Array.from(element.childNodes);
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
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
    /**
     * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
     * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
     * it can be called from an external module).
     *
     * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
     *
     * https://svelte.dev/docs#run-time-svelte-onmount
     */
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    let render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = /* @__PURE__ */ Promise.resolve();
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
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
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
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks = filtered;
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
        else if (callback) {
            callback();
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
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
            flush_render_callbacks($$.after_update);
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
            ctx: [],
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
            if (!is_function(callback)) {
                return noop;
            }
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.59.2' }, detail), { bubbles: true }));
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
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation, has_stop_immediate_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        if (has_stop_immediate_propagation)
            modifiers.push('stopImmediatePropagation');
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
        if (text.data === data)
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

    /* src\components\Header.svelte generated by Svelte v3.59.2 */

    const { window: window_1 } = globals;
    const file$7 = "src\\components\\Header.svelte";

    function create_fragment$7(ctx) {
    	let header;
    	let nav;
    	let div;
    	let h2;
    	let t1;
    	let ul;
    	let li0;
    	let a0;
    	let t3;
    	let li1;
    	let a1;
    	let t5;
    	let li2;
    	let a2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			header = element("header");
    			nav = element("nav");
    			div = element("div");
    			h2 = element("h2");
    			h2.textContent = "Majd Mohammed";
    			t1 = space();
    			ul = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			a0.textContent = "About Me";
    			t3 = space();
    			li1 = element("li");
    			a1 = element("a");
    			a1.textContent = "Projects";
    			t5 = space();
    			li2 = element("li");
    			a2 = element("a");
    			a2.textContent = "Contact";
    			attr_dev(h2, "class", "svelte-dwm2pl");
    			add_location(h2, file$7, 33, 3, 804);
    			attr_dev(div, "class", "logo svelte-dwm2pl");
    			add_location(div, file$7, 32, 2, 781);
    			attr_dev(a0, "href", "#about");
    			attr_dev(a0, "class", "svelte-dwm2pl");
    			toggle_class(a0, "active", /*activeSection*/ ctx[0] === 'about');
    			add_location(a0, file$7, 36, 7, 871);
    			add_location(li0, file$7, 36, 3, 867);
    			attr_dev(a1, "href", "#projects");
    			attr_dev(a1, "class", "svelte-dwm2pl");
    			toggle_class(a1, "active", /*activeSection*/ ctx[0] === 'projects');
    			add_location(a1, file$7, 37, 7, 997);
    			add_location(li1, file$7, 37, 3, 993);
    			attr_dev(a2, "href", "#contact");
    			attr_dev(a2, "class", "svelte-dwm2pl");
    			toggle_class(a2, "active", /*activeSection*/ ctx[0] === 'contact');
    			add_location(a2, file$7, 38, 7, 1132);
    			add_location(li2, file$7, 38, 3, 1128);
    			attr_dev(ul, "class", "nav-links svelte-dwm2pl");
    			add_location(ul, file$7, 35, 2, 840);
    			attr_dev(nav, "class", "svelte-dwm2pl");
    			add_location(nav, file$7, 31, 1, 772);
    			attr_dev(header, "class", "svelte-dwm2pl");
    			add_location(header, file$7, 30, 0, 761);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, nav);
    			append_dev(nav, div);
    			append_dev(div, h2);
    			append_dev(nav, t1);
    			append_dev(nav, ul);
    			append_dev(ul, li0);
    			append_dev(li0, a0);
    			append_dev(ul, t3);
    			append_dev(ul, li1);
    			append_dev(li1, a1);
    			append_dev(ul, t5);
    			append_dev(ul, li2);
    			append_dev(li2, a2);

    			if (!mounted) {
    				dispose = [
    					listen_dev(window_1, "scroll", /*handleScroll*/ ctx[1], false, false, false, false),
    					listen_dev(a0, "click", /*click_handler*/ ctx[2], false, false, false, false),
    					listen_dev(a1, "click", /*click_handler_1*/ ctx[3], false, false, false, false),
    					listen_dev(a2, "click", /*click_handler_2*/ ctx[4], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*activeSection*/ 1) {
    				toggle_class(a0, "active", /*activeSection*/ ctx[0] === 'about');
    			}

    			if (dirty & /*activeSection*/ 1) {
    				toggle_class(a1, "active", /*activeSection*/ ctx[0] === 'projects');
    			}

    			if (dirty & /*activeSection*/ 1) {
    				toggle_class(a2, "active", /*activeSection*/ ctx[0] === 'contact');
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			mounted = false;
    			run_all(dispose);
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

    function scrollToSection(sectionId) {
    	const element = document.getElementById(sectionId);

    	if (element) {
    		element.scrollIntoView({ behavior: 'smooth' });
    	}
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Header', slots, []);
    	let activeSection = '';

    	function handleScroll() {
    		const sections = ['about', 'projects', 'contact'];
    		const scrollPosition = window.scrollY + 200;

    		for (const section of sections) {
    			const element = document.getElementById(section);

    			if (element) {
    				const sectionTop = element.offsetTop;
    				const sectionHeight = element.clientHeight;

    				if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
    					$$invalidate(0, activeSection = section);
    					break;
    				}
    			}
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => scrollToSection('about');
    	const click_handler_1 = () => scrollToSection('projects');
    	const click_handler_2 = () => scrollToSection('contact');

    	$$self.$capture_state = () => ({
    		activeSection,
    		scrollToSection,
    		handleScroll
    	});

    	$$self.$inject_state = $$props => {
    		if ('activeSection' in $$props) $$invalidate(0, activeSection = $$props.activeSection);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [activeSection, handleScroll, click_handler, click_handler_1, click_handler_2];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src\components\Hero.svelte generated by Svelte v3.59.2 */
    const file$6 = "src\\components\\Hero.svelte";

    function create_fragment$6(ctx) {
    	let section;
    	let div3;
    	let div2;
    	let div1;
    	let img;
    	let img_src_value;
    	let t0;
    	let div0;
    	let t1;
    	let h1;
    	let t3;
    	let p;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			img = element("img");
    			t0 = space();
    			div0 = element("div");
    			t1 = space();
    			h1 = element("h1");
    			h1.textContent = "Hello! I'm Majd Mohammed";
    			t3 = space();
    			p = element("p");
    			p.textContent = "The Coolest Data Analyst in the 500km radius around your location!";
    			if (!src_url_equal(img.src, img_src_value = "/Face1.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Majd Mohammed Profile");
    			attr_dev(img, "class", "profile-photo svelte-1stwyf1");
    			add_location(img, file$6, 17, 4, 375);
    			attr_dev(div0, "class", "image-border svelte-1stwyf1");
    			add_location(div0, file$6, 23, 4, 512);
    			attr_dev(div1, "class", "image-container svelte-1stwyf1");
    			add_location(div1, file$6, 16, 3, 340);
    			attr_dev(div2, "class", "profile-image svelte-1stwyf1");
    			add_location(div2, file$6, 15, 2, 308);
    			attr_dev(h1, "class", "svelte-1stwyf1");
    			add_location(h1, file$6, 26, 2, 569);
    			attr_dev(p, "class", "svelte-1stwyf1");
    			add_location(p, file$6, 27, 2, 606);
    			attr_dev(div3, "class", "hero-content svelte-1stwyf1");
    			add_location(div3, file$6, 14, 1, 278);
    			attr_dev(section, "id", "home");
    			attr_dev(section, "class", "hero svelte-1stwyf1");
    			add_location(section, file$6, 13, 0, 243);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, img);
    			/*img_binding*/ ctx[1](img);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div3, t1);
    			append_dev(div3, h1);
    			append_dev(div3, t3);
    			append_dev(div3, p);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			/*img_binding*/ ctx[1](null);
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

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Hero', slots, []);
    	let imageElement;

    	onMount(() => {
    		// Add rotation animation to the image
    		if (imageElement) {
    			$$invalidate(0, imageElement.style.animation = 'rotate 10s linear infinite', imageElement);
    		}
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Hero> was created with unknown prop '${key}'`);
    	});

    	function img_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			imageElement = $$value;
    			$$invalidate(0, imageElement);
    		});
    	}

    	$$self.$capture_state = () => ({ onMount, imageElement });

    	$$self.$inject_state = $$props => {
    		if ('imageElement' in $$props) $$invalidate(0, imageElement = $$props.imageElement);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [imageElement, img_binding];
    }

    class Hero extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Hero",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src\components\CV.svelte generated by Svelte v3.59.2 */

    const file$5 = "src\\components\\CV.svelte";

    function create_fragment$5(ctx) {
    	let div4;
    	let h4;
    	let t1;
    	let div2;
    	let div0;
    	let t3;
    	let div1;
    	let p0;
    	let strong;
    	let t5;
    	let p1;
    	let t7;
    	let div3;
    	let button0;
    	let span0;
    	let t9;
    	let t10;
    	let button1;
    	let span1;
    	let t12;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			h4 = element("h4");
    			h4.textContent = "CV";
    			t1 = space();
    			div2 = element("div");
    			div0 = element("div");
    			div0.textContent = "📄";
    			t3 = space();
    			div1 = element("div");
    			p0 = element("p");
    			strong = element("strong");
    			strong.textContent = "Majd Mohammed CV";
    			t5 = space();
    			p1 = element("p");
    			p1.textContent = "Updated: Sep 2025";
    			t7 = space();
    			div3 = element("div");
    			button0 = element("button");
    			span0 = element("span");
    			span0.textContent = "⬇️";
    			t9 = text("\r\n\t\t\tDownload CV");
    			t10 = space();
    			button1 = element("button");
    			span1 = element("span");
    			span1.textContent = "👁️";
    			t12 = text("\r\n\t\t\tView CV");
    			attr_dev(h4, "class", "svelte-1fu7o4z");
    			add_location(h4, file$5, 19, 1, 471);
    			attr_dev(div0, "class", "cv-icon svelte-1fu7o4z");
    			add_location(div0, file$5, 21, 2, 513);
    			add_location(strong, file$5, 23, 6, 575);
    			attr_dev(p0, "class", "svelte-1fu7o4z");
    			add_location(p0, file$5, 23, 3, 572);
    			attr_dev(p1, "class", "date svelte-1fu7o4z");
    			add_location(p1, file$5, 24, 3, 617);
    			attr_dev(div1, "class", "cv-info svelte-1fu7o4z");
    			add_location(div1, file$5, 22, 2, 546);
    			attr_dev(div2, "class", "cv-content svelte-1fu7o4z");
    			add_location(div2, file$5, 20, 1, 485);
    			attr_dev(span0, "class", "btn-icon svelte-1fu7o4z");
    			add_location(span0, file$5, 29, 3, 767);
    			attr_dev(button0, "class", "cv-btn download-btn svelte-1fu7o4z");
    			add_location(button0, file$5, 28, 2, 704);
    			attr_dev(span1, "class", "btn-icon svelte-1fu7o4z");
    			add_location(span1, file$5, 33, 3, 887);
    			attr_dev(button1, "class", "cv-btn view-btn svelte-1fu7o4z");
    			add_location(button1, file$5, 32, 2, 832);
    			attr_dev(div3, "class", "cv-actions svelte-1fu7o4z");
    			add_location(div3, file$5, 27, 1, 676);
    			attr_dev(div4, "class", "cv-preview svelte-1fu7o4z");
    			add_location(div4, file$5, 18, 0, 444);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, h4);
    			append_dev(div4, t1);
    			append_dev(div4, div2);
    			append_dev(div2, div0);
    			append_dev(div2, t3);
    			append_dev(div2, div1);
    			append_dev(div1, p0);
    			append_dev(p0, strong);
    			append_dev(div1, t5);
    			append_dev(div1, p1);
    			append_dev(div4, t7);
    			append_dev(div4, div3);
    			append_dev(div3, button0);
    			append_dev(button0, span0);
    			append_dev(button0, t9);
    			append_dev(div3, t10);
    			append_dev(div3, button1);
    			append_dev(button1, span1);
    			append_dev(button1, t12);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", downloadCV, false, false, false, false),
    					listen_dev(button1, "click", openCV, false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
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

    function downloadCV() {
    	// Create a link element to trigger download
    	const link = document.createElement('a');

    	link.href = '/MajdMohammedCV.pdf';
    	link.download = 'MajdMohammed_CV.pdf';
    	link.target = '_blank';
    	document.body.appendChild(link);
    	link.click();
    	document.body.removeChild(link);
    }

    function openCV() {
    	// Open CV in new tab
    	window.open('/MajdMohammedCV.pdf', '_blank');
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('CV', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<CV> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ downloadCV, openCV });
    	return [];
    }

    class CV extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CV",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\components\About.svelte generated by Svelte v3.59.2 */
    const file$4 = "src\\components\\About.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (50:7) {#each skills.filter(skill => skill.category === category) as skill}
    function create_each_block_1$1(ctx) {
    	let div;
    	let span0;
    	let t0_value = /*skill*/ ctx[6].icon + "";
    	let t0;
    	let t1;
    	let span1;
    	let t2_value = /*skill*/ ctx[6].name + "";
    	let t2;
    	let t3;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span0 = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			span1 = element("span");
    			t2 = text(t2_value);
    			t3 = space();
    			attr_dev(span0, "class", "skill-icon svelte-15crtc1");
    			add_location(span0, file$4, 51, 9, 2228);
    			attr_dev(span1, "class", "skill-name svelte-15crtc1");
    			add_location(span1, file$4, 52, 9, 2283);
    			attr_dev(div, "class", "skill-item svelte-15crtc1");
    			add_location(div, file$4, 50, 8, 2193);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span0);
    			append_dev(span0, t0);
    			append_dev(div, t1);
    			append_dev(div, span1);
    			append_dev(span1, t2);
    			append_dev(div, t3);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(50:7) {#each skills.filter(skill => skill.category === category) as skill}",
    		ctx
    	});

    	return block;
    }

    // (46:4) {#each skillCategories as category}
    function create_each_block$2(ctx) {
    	let div1;
    	let h4;
    	let t0_value = /*category*/ ctx[3] + "";
    	let t0;
    	let t1;
    	let div0;
    	let t2;

    	function func(...args) {
    		return /*func*/ ctx[2](/*category*/ ctx[3], ...args);
    	}

    	let each_value_1 = /*skills*/ ctx[0].filter(func);
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h4 = element("h4");
    			t0 = text(t0_value);
    			t1 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			attr_dev(h4, "class", "svelte-15crtc1");
    			add_location(h4, file$4, 47, 6, 2054);
    			attr_dev(div0, "class", "skills-grid svelte-15crtc1");
    			add_location(div0, file$4, 48, 6, 2081);
    			attr_dev(div1, "class", "skill-category svelte-15crtc1");
    			add_location(div1, file$4, 46, 5, 2018);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h4);
    			append_dev(h4, t0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div0, null);
    				}
    			}

    			append_dev(div1, t2);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*skills, skillCategories*/ 3) {
    				each_value_1 = /*skills*/ ctx[0].filter(func);
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(46:4) {#each skillCategories as category}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let section;
    	let div5;
    	let h2;
    	let t1;
    	let div4;
    	let div2;
    	let h30;
    	let t3;
    	let p0;
    	let t5;
    	let div0;
    	let h40;
    	let t7;
    	let p1;
    	let strong0;
    	let t9;
    	let t10;
    	let p2;
    	let t12;
    	let div1;
    	let h41;
    	let t14;
    	let p3;
    	let strong1;
    	let t16;
    	let t17;
    	let p4;
    	let t19;
    	let div3;
    	let h31;
    	let t21;
    	let each_value = /*skillCategories*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			section = element("section");
    			div5 = element("div");
    			h2 = element("h2");
    			h2.textContent = "About Me";
    			t1 = space();
    			div4 = element("div");
    			div2 = element("div");
    			h30 = element("h3");
    			h30.textContent = "Majd Mohammed";
    			t3 = space();
    			p0 = element("p");
    			p0.textContent = "The Coolest Data Analyst in the 500km radius around your location! Very passionate about data and how it can be utilized to make impactful decisions. I've been learning and practicing with data for 15% of my life and that number is only going up. I love working alongside smart and creative people, brightening their path with information.";
    			t5 = space();
    			div0 = element("div");
    			h40 = element("h4");
    			h40.textContent = "Current Role";
    			t7 = space();
    			p1 = element("p");
    			strong0 = element("strong");
    			strong0.textContent = "Data Analyst & Development Researcher";
    			t9 = text(" at Digital Logic");
    			t10 = space();
    			p2 = element("p");
    			p2.textContent = "March 2025 - Current";
    			t12 = space();
    			div1 = element("div");
    			h41 = element("h4");
    			h41.textContent = "Education";
    			t14 = space();
    			p3 = element("p");
    			strong1 = element("strong");
    			strong1.textContent = "Computer Engineering";
    			t16 = text(" at Al-Iraqia University");
    			t17 = space();
    			p4 = element("p");
    			p4.textContent = "2023 - 2026";
    			t19 = space();
    			div3 = element("div");
    			h31 = element("h3");
    			h31.textContent = "My Skills";
    			t21 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h2, "class", "svelte-15crtc1");
    			add_location(h2, file$4, 23, 2, 1018);
    			attr_dev(h30, "class", "svelte-15crtc1");
    			add_location(h30, file$4, 26, 4, 1101);
    			attr_dev(p0, "class", "summary svelte-15crtc1");
    			add_location(p0, file$4, 27, 4, 1129);
    			attr_dev(h40, "class", "svelte-15crtc1");
    			add_location(h40, file$4, 30, 5, 1542);
    			add_location(strong0, file$4, 31, 8, 1573);
    			attr_dev(p1, "class", "svelte-15crtc1");
    			add_location(p1, file$4, 31, 5, 1570);
    			attr_dev(p2, "class", "date svelte-15crtc1");
    			add_location(p2, file$4, 32, 5, 1655);
    			attr_dev(div0, "class", "experience-preview svelte-15crtc1");
    			add_location(div0, file$4, 29, 4, 1503);
    			attr_dev(h41, "class", "svelte-15crtc1");
    			add_location(h41, file$4, 36, 5, 1753);
    			add_location(strong1, file$4, 37, 8, 1781);
    			attr_dev(p3, "class", "svelte-15crtc1");
    			add_location(p3, file$4, 37, 5, 1778);
    			attr_dev(p4, "class", "date svelte-15crtc1");
    			add_location(p4, file$4, 38, 4, 1852);
    			attr_dev(div1, "class", "education-preview svelte-15crtc1");
    			add_location(div1, file$4, 35, 4, 1715);
    			attr_dev(div2, "class", "about-text svelte-15crtc1");
    			add_location(div2, file$4, 25, 3, 1071);
    			attr_dev(h31, "class", "svelte-15crtc1");
    			add_location(h31, file$4, 44, 4, 1952);
    			attr_dev(div3, "class", "skills-section svelte-15crtc1");
    			add_location(div3, file$4, 43, 3, 1918);
    			attr_dev(div4, "class", "about-content svelte-15crtc1");
    			add_location(div4, file$4, 24, 2, 1039);
    			attr_dev(div5, "class", "container svelte-15crtc1");
    			add_location(div5, file$4, 22, 1, 991);
    			attr_dev(section, "id", "about");
    			attr_dev(section, "class", "about svelte-15crtc1");
    			add_location(section, file$4, 21, 0, 954);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div5);
    			append_dev(div5, h2);
    			append_dev(div5, t1);
    			append_dev(div5, div4);
    			append_dev(div4, div2);
    			append_dev(div2, h30);
    			append_dev(div2, t3);
    			append_dev(div2, p0);
    			append_dev(div2, t5);
    			append_dev(div2, div0);
    			append_dev(div0, h40);
    			append_dev(div0, t7);
    			append_dev(div0, p1);
    			append_dev(p1, strong0);
    			append_dev(p1, t9);
    			append_dev(div0, t10);
    			append_dev(div0, p2);
    			append_dev(div2, t12);
    			append_dev(div2, div1);
    			append_dev(div1, h41);
    			append_dev(div1, t14);
    			append_dev(div1, p3);
    			append_dev(p3, strong1);
    			append_dev(p3, t16);
    			append_dev(div1, t17);
    			append_dev(div1, p4);
    			append_dev(div4, t19);
    			append_dev(div4, div3);
    			append_dev(div3, h31);
    			append_dev(div3, t21);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div3, null);
    				}
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*skills, skillCategories*/ 3) {
    				each_value = /*skillCategories*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div3, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_each(each_blocks, detaching);
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

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('About', slots, []);

    	const skills = [
    		{
    			name: 'SQL Query Writing',
    			icon: '🗄️',
    			category: 'Data Analysis'
    		},
    		{
    			name: 'Power BI',
    			icon: '📊',
    			category: 'Data Analysis'
    		},
    		{
    			name: 'Tableau',
    			icon: '📈',
    			category: 'Data Analysis'
    		},
    		{
    			name: 'Excel & Power Query',
    			icon: '📋',
    			category: 'Data Analysis'
    		},
    		{
    			name: 'Data Storytelling',
    			icon: '📖',
    			category: 'Data Analysis'
    		},
    		{
    			name: 'Python Automation',
    			icon: '🐍',
    			category: 'Programming'
    		},
    		{
    			name: 'Web Scraping',
    			icon: '🕷️',
    			category: 'Programming'
    		},
    		{
    			name: 'MySQL',
    			icon: '🗃️',
    			category: 'Programming'
    		},
    		{
    			name: 'C++',
    			icon: '⚡',
    			category: 'Programming'
    		},
    		{
    			name: 'Web Research Tools',
    			icon: '🔍',
    			category: 'Research'
    		},
    		{
    			name: 'Google Forms',
    			icon: '📝',
    			category: 'Research'
    		},
    		{
    			name: 'Data Collection',
    			icon: '📥',
    			category: 'Research'
    		}
    	];

    	const skillCategories = ['Data Analysis', 'Programming', 'Research'];
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<About> was created with unknown prop '${key}'`);
    	});

    	const func = (category, skill) => skill.category === category;
    	$$self.$capture_state = () => ({ CV, skills, skillCategories });
    	return [skills, skillCategories, func];
    }

    class About extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "About",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\components\Projects.svelte generated by Svelte v3.59.2 */

    const file$3 = "src\\components\\Projects.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	return child_ctx;
    }

    // (88:12) {#each projects as project}
    function create_each_block_2(ctx) {
    	let div2;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div1;
    	let h3;
    	let t1_value = /*project*/ ctx[14].title + "";
    	let t1;
    	let t2;
    	let p;
    	let t3_value = /*project*/ ctx[14].description + "";
    	let t3;
    	let t4;
    	let button;
    	let t6;
    	let mounted;
    	let dispose;

    	function error_handler(...args) {
    		return /*error_handler*/ ctx[6](/*project*/ ctx[14], ...args);
    	}

    	function click_handler() {
    		return /*click_handler*/ ctx[7](/*project*/ ctx[14]);
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			h3 = element("h3");
    			t1 = text(t1_value);
    			t2 = space();
    			p = element("p");
    			t3 = text(t3_value);
    			t4 = space();
    			button = element("button");
    			button.textContent = "View Project";
    			t6 = space();
    			if (!src_url_equal(img.src, img_src_value = getInitialCover(/*project*/ ctx[14].slug))) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", /*project*/ ctx[14].title);
    			attr_dev(img, "class", "svelte-it3s2s");
    			add_location(img, file$3, 90, 24, 3824);
    			attr_dev(div0, "class", "project-image svelte-it3s2s");
    			add_location(div0, file$3, 89, 20, 3771);
    			attr_dev(h3, "class", "svelte-it3s2s");
    			add_location(h3, file$3, 94, 6, 4055);
    			attr_dev(p, "class", "svelte-it3s2s");
    			add_location(p, file$3, 95, 6, 4087);
    			attr_dev(button, "class", "btn svelte-it3s2s");
    			add_location(button, file$3, 96, 24, 4141);
    			attr_dev(div1, "class", "project-content svelte-it3s2s");
    			add_location(div1, file$3, 93, 5, 4018);
    			attr_dev(div2, "class", "project-card svelte-it3s2s");
    			add_location(div2, file$3, 88, 16, 3695);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, img);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, h3);
    			append_dev(h3, t1);
    			append_dev(div1, t2);
    			append_dev(div1, p);
    			append_dev(p, t3);
    			append_dev(div1, t4);
    			append_dev(div1, button);
    			append_dev(div2, t6);

    			if (!mounted) {
    				dispose = [
    					listen_dev(img, "error", error_handler, false, false, false, false),
    					listen_dev(button, "click", click_handler, false, false, false, false),
    					listen_dev(div2, "mouseenter", /*mouseenter_handler*/ ctx[4], false, false, false, false),
    					listen_dev(div2, "mouseleave", /*mouseleave_handler*/ ctx[5], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(88:12) {#each projects as project}",
    		ctx
    	});

    	return block;
    }

    // (104:8) {#if selectedProject}
    function create_if_block(ctx) {
    	let div5;
    	let p;
    	let t0_value = /*selectedProject*/ ctx[0].description + "";
    	let t0;
    	let t1;
    	let div3;
    	let div0;
    	let span0;
    	let span1;
    	let t3_value = /*selectedProject*/ ctx[0].details.goal + "";
    	let t3;
    	let t4;
    	let div1;
    	let span2;
    	let span3;
    	let t6_value = /*selectedProject*/ ctx[0].details.process + "";
    	let t6;
    	let t7;
    	let div2;
    	let span4;
    	let span5;
    	let t9_value = /*selectedProject*/ ctx[0].details.insight + "";
    	let t9;
    	let t10;
    	let h4;
    	let t12;
    	let previous_key = /*selectedProject*/ ctx[0].slug;
    	let t13;
    	let div4;
    	let button;
    	let mounted;
    	let dispose;
    	let key_block = create_key_block(ctx);

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			p = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			div3 = element("div");
    			div0 = element("div");
    			span0 = element("span");
    			span0.textContent = "Goal";
    			span1 = element("span");
    			t3 = text(t3_value);
    			t4 = space();
    			div1 = element("div");
    			span2 = element("span");
    			span2.textContent = "Process";
    			span3 = element("span");
    			t6 = text(t6_value);
    			t7 = space();
    			div2 = element("div");
    			span4 = element("span");
    			span4.textContent = "Insight";
    			span5 = element("span");
    			t9 = text(t9_value);
    			t10 = space();
    			h4 = element("h4");
    			h4.textContent = "Screenshots";
    			t12 = space();
    			key_block.c();
    			t13 = space();
    			div4 = element("div");
    			button = element("button");
    			button.textContent = "× Close";
    			attr_dev(p, "class", "detail-intro svelte-it3s2s");
    			add_location(p, file$3, 105, 16, 4423);
    			attr_dev(span0, "class", "kpi-label svelte-it3s2s");
    			add_location(span0, file$3, 107, 37, 4555);
    			attr_dev(span1, "class", "kpi-text svelte-it3s2s");
    			add_location(span1, file$3, 107, 72, 4590);
    			attr_dev(div0, "class", "kpi svelte-it3s2s");
    			add_location(div0, file$3, 107, 20, 4538);
    			attr_dev(span2, "class", "kpi-label svelte-it3s2s");
    			add_location(span2, file$3, 108, 37, 4695);
    			attr_dev(span3, "class", "kpi-text svelte-it3s2s");
    			add_location(span3, file$3, 108, 75, 4733);
    			attr_dev(div1, "class", "kpi svelte-it3s2s");
    			add_location(div1, file$3, 108, 20, 4678);
    			attr_dev(span4, "class", "kpi-label svelte-it3s2s");
    			add_location(span4, file$3, 109, 37, 4841);
    			attr_dev(span5, "class", "kpi-text svelte-it3s2s");
    			add_location(span5, file$3, 109, 75, 4879);
    			attr_dev(div2, "class", "kpi svelte-it3s2s");
    			add_location(div2, file$3, 109, 20, 4824);
    			attr_dev(div3, "class", "kpis svelte-it3s2s");
    			add_location(div3, file$3, 106, 16, 4498);
    			add_location(h4, file$3, 112, 16, 4992);
    			attr_dev(button, "class", "close-btn svelte-it3s2s");
    			add_location(button, file$3, 127, 20, 5769);
    			attr_dev(div4, "class", "close-detail svelte-it3s2s");
    			add_location(div4, file$3, 126, 16, 5721);
    			attr_dev(div5, "id", "project-detail");
    			attr_dev(div5, "class", "project-detail svelte-it3s2s");
    			add_location(div5, file$3, 104, 12, 4357);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, p);
    			append_dev(p, t0);
    			append_dev(div5, t1);
    			append_dev(div5, div3);
    			append_dev(div3, div0);
    			append_dev(div0, span0);
    			append_dev(div0, span1);
    			append_dev(span1, t3);
    			append_dev(div3, t4);
    			append_dev(div3, div1);
    			append_dev(div1, span2);
    			append_dev(div1, span3);
    			append_dev(span3, t6);
    			append_dev(div3, t7);
    			append_dev(div3, div2);
    			append_dev(div2, span4);
    			append_dev(div2, span5);
    			append_dev(span5, t9);
    			append_dev(div5, t10);
    			append_dev(div5, h4);
    			append_dev(div5, t12);
    			key_block.m(div5, null);
    			append_dev(div5, t13);
    			append_dev(div5, div4);
    			append_dev(div4, button);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*closeDetail*/ ctx[2], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*selectedProject*/ 1 && t0_value !== (t0_value = /*selectedProject*/ ctx[0].description + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*selectedProject*/ 1 && t3_value !== (t3_value = /*selectedProject*/ ctx[0].details.goal + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*selectedProject*/ 1 && t6_value !== (t6_value = /*selectedProject*/ ctx[0].details.process + "")) set_data_dev(t6, t6_value);
    			if (dirty & /*selectedProject*/ 1 && t9_value !== (t9_value = /*selectedProject*/ ctx[0].details.insight + "")) set_data_dev(t9, t9_value);

    			if (dirty & /*selectedProject*/ 1 && safe_not_equal(previous_key, previous_key = /*selectedProject*/ ctx[0].slug)) {
    				key_block.d(1);
    				key_block = create_key_block(ctx);
    				key_block.c();
    				key_block.m(div5, t13);
    			} else {
    				key_block.p(ctx, dirty);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			key_block.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(104:8) {#if selectedProject}",
    		ctx
    	});

    	return block;
    }

    // (117:28) {#each ['jpeg','jpg','png'] as ext}
    function create_each_block_1(ctx) {
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = `/screenshots/${/*selectedProject*/ ctx[0].slug}/${/*idx*/ ctx[8]}.${/*ext*/ ctx[11]}`)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = `${/*selectedProject*/ ctx[0].title} screenshot ${/*idx*/ ctx[8]}`);
    			attr_dev(img, "loading", "lazy");
    			attr_dev(img, "class", "svelte-it3s2s");
    			add_location(img, file$3, 117, 32, 5290);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);

    			if (!mounted) {
    				dispose = listen_dev(img, "error", error_handler_1, false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*selectedProject*/ 1 && !src_url_equal(img.src, img_src_value = `/screenshots/${/*selectedProject*/ ctx[0].slug}/${/*idx*/ ctx[8]}.${/*ext*/ ctx[11]}`)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*selectedProject*/ 1 && img_alt_value !== (img_alt_value = `${/*selectedProject*/ ctx[0].title} screenshot ${/*idx*/ ctx[8]}`)) {
    				attr_dev(img, "alt", img_alt_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(117:28) {#each ['jpeg','jpg','png'] as ext}",
    		ctx
    	});

    	return block;
    }

    // (116:24) {#each Array.from({length: 20}, (_, i) => i + 1) as idx}
    function create_each_block$1(ctx) {
    	let each_1_anchor;
    	let each_value_1 = ['jpeg', 'jpg', 'png'];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < 3; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < 3; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < 3; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(target, anchor);
    				}
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*selectedProject, Array*/ 1) {
    				each_value_1 = ['jpeg', 'jpg', 'png'];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < 3; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < 3; i += 1) {
    					each_blocks[i].d(1);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(116:24) {#each Array.from({length: 20}, (_, i) => i + 1) as idx}",
    		ctx
    	});

    	return block;
    }

    // (114:16) {#key selectedProject.slug}
    function create_key_block(ctx) {
    	let div;
    	let each_value = Array.from({ length: 20 }, func);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "screenshots-grid svelte-it3s2s");
    			add_location(div, file$3, 114, 20, 5079);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div, null);
    				}
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*selectedProject, Array*/ 1) {
    				each_value = Array.from({ length: 20 }, func);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_key_block.name,
    		type: "key",
    		source: "(114:16) {#key selectedProject.slug}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let section;
    	let div1;
    	let h2;
    	let t1;
    	let div0;
    	let t2;
    	let each_value_2 = /*projects*/ ctx[1];
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	let if_block = /*selectedProject*/ ctx[0] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			section = element("section");
    			div1 = element("div");
    			h2 = element("h2");
    			h2.textContent = "My Projects";
    			t1 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			if (if_block) if_block.c();
    			attr_dev(h2, "class", "svelte-it3s2s");
    			add_location(h2, file$3, 85, 2, 3585);
    			attr_dev(div0, "class", "projects-grid svelte-it3s2s");
    			add_location(div0, file$3, 86, 2, 3609);
    			attr_dev(div1, "class", "container svelte-it3s2s");
    			add_location(div1, file$3, 84, 1, 3558);
    			attr_dev(section, "id", "projects");
    			attr_dev(section, "class", "projects svelte-it3s2s");
    			add_location(section, file$3, 83, 0, 3515);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div1);
    			append_dev(div1, h2);
    			append_dev(div1, t1);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div0, null);
    				}
    			}

    			append_dev(div1, t2);
    			if (if_block) if_block.m(div1, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*handleProjectClick, projects, getInitialCover, handleCoverError*/ 10) {
    				each_value_2 = /*projects*/ ctx[1];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_2.length;
    			}

    			if (/*selectedProject*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(div1, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_each(each_blocks, detaching);
    			if (if_block) if_block.d();
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

    function getInitialCover(slug) {
    	return `/screenshots/${slug}/cover.jpeg`;
    }

    function handleCoverError(imgEl, slug) {
    	try {
    		const src = imgEl.getAttribute('src') || '';

    		if (src.endsWith('.jpeg')) {
    			imgEl.src = `/screenshots/${slug}/cover.jpg`;
    		} else if (src.endsWith('.jpg')) {
    			imgEl.src = `/screenshots/${slug}/cover.png`;
    		} else {
    			imgEl.style.display = 'none';
    		}
    	} catch(_) {
    		imgEl.style.display = 'none';
    	}
    }

    const func = (_, i) => i + 1;
    const error_handler_1 = e => e.currentTarget.remove();

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Projects', slots, []);

    	const projects = [
    		{
    			id: 1,
    			slug: 'retailer-dashboard',
    			title: 'Retailer Dashboard',
    			description: `One of my first projects was helping a clothing retailer see their business clearly.
I transformed messy spreadsheets into a clean dashboard showing weekly sales patterns, inventory status, and promotion performance — giving the team a clear window into their business.`,
    			// cover image is resolved at render time
    			details: {
    				goal: 'Organize messy Excel data into a clear, insightful dashboard',
    				process: 'Cleaned and structured unorganized datasets, then built an interactive Power BI dashboard',
    				insight: 'Delivered a simple, actionable view of sales trends and inventory performance'
    			}
    		},
    		{
    			id: 2,
    			slug: 'commission-formulas',
    			title: 'Commission Formulas',
    			description: `How much should a platform charge in commission?
I scraped 2,000+ local product listings to understand pricing patterns, tested multiple formulas, and visualized their effects.
This led to a balanced model that supports both business sustainability and consumer affordability.`,
    			// cover image is resolved at render time
    			details: {
    				goal: 'Determine a fair commission structure for merchants on a platform',
    				process: 'Tested multiple formulas, graphed their impacts, and scraped 2,000+ product listings from Iraqi platforms to benchmark pricing',
    				insight: 'Built a formula that balances company profit with customer benefit'
    			}
    		},
    		{
    			id: 3,
    			slug: 'trip-time-calculation',
    			title: 'Trip Time Calculation',
    			description: `Navigating Baghdad’s traffic is a logistical nightmare — here’s my attempt at solving it.
I calculated 600+ route combinations across 25+ locations, factoring in traffic and delays, to predict delivery times and estimate fair trip costs.
The result? A realistic time range per area and a clear, efficient pricing model.`,
    			// cover image is resolved at render time
    			details: {
    				goal: 'Estimate delivery time and cost for 3-point trips across Baghdad',
    				process: 'Built a distance matrix of 25+ locations to generate 600+ route variations, factoring in traffic and human delays',
    				insight: 'Produced a reliable time range per district and a data-driven price point'
    			}
    		}
    	];

    	let selectedProject = null;

    	function closeDetail() {
    		$$invalidate(0, selectedProject = null);
    		const el = document.getElementById('projects');

    		if (el) {
    			el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    		}
    	}

    	function handleProjectClick(project) {
    		$$invalidate(0, selectedProject = project);
    		const el = document.getElementById('project-detail');

    		if (el) {
    			el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Projects> was created with unknown prop '${key}'`);
    	});

    	function mouseenter_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function mouseleave_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	const error_handler = (project, e) => handleCoverError(e.currentTarget, project.slug);
    	const click_handler = project => handleProjectClick(project);

    	$$self.$capture_state = () => ({
    		projects,
    		selectedProject,
    		getInitialCover,
    		handleCoverError,
    		closeDetail,
    		handleProjectClick
    	});

    	$$self.$inject_state = $$props => {
    		if ('selectedProject' in $$props) $$invalidate(0, selectedProject = $$props.selectedProject);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		selectedProject,
    		projects,
    		closeDetail,
    		handleProjectClick,
    		mouseenter_handler,
    		mouseleave_handler,
    		error_handler,
    		click_handler
    	];
    }

    class Projects extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Projects",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\components\Contact.svelte generated by Svelte v3.59.2 */
    const file$2 = "src\\components\\Contact.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (33:5) {#each contactInfo as info}
    function create_each_block(ctx) {
    	let div1;
    	let span0;
    	let t0_value = /*info*/ ctx[1].icon + "";
    	let t0;
    	let t1;
    	let div0;
    	let span1;
    	let t2_value = /*info*/ ctx[1].label + "";
    	let t2;
    	let t3;
    	let a;
    	let t4_value = /*info*/ ctx[1].value + "";
    	let t4;
    	let t5;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			span0 = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			div0 = element("div");
    			span1 = element("span");
    			t2 = text(t2_value);
    			t3 = space();
    			a = element("a");
    			t4 = text(t4_value);
    			t5 = space();
    			attr_dev(span0, "class", "contact-icon svelte-s98sny");
    			add_location(span0, file$2, 34, 7, 990);
    			attr_dev(span1, "class", "contact-label svelte-s98sny");
    			add_location(span1, file$2, 36, 8, 1083);
    			attr_dev(a, "href", /*info*/ ctx[1].link);
    			attr_dev(a, "class", "contact-value svelte-s98sny");
    			add_location(a, file$2, 37, 8, 1140);
    			attr_dev(div0, "class", "contact-details svelte-s98sny");
    			add_location(div0, file$2, 35, 7, 1044);
    			attr_dev(div1, "class", "contact-item svelte-s98sny");
    			add_location(div1, file$2, 33, 6, 955);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, span0);
    			append_dev(span0, t0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, span1);
    			append_dev(span1, t2);
    			append_dev(div0, t3);
    			append_dev(div0, a);
    			append_dev(a, t4);
    			append_dev(div1, t5);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(33:5) {#each contactInfo as info}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let section;
    	let div4;
    	let h2;
    	let t1;
    	let div3;
    	let div2;
    	let p;
    	let t3;
    	let div0;
    	let t4;
    	let div1;
    	let cv;
    	let current;
    	let each_value = /*contactInfo*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	cv = new CV({ $$inline: true });

    	const block = {
    		c: function create() {
    			section = element("section");
    			div4 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Get In Touch";
    			t1 = space();
    			div3 = element("div");
    			div2 = element("div");
    			p = element("p");
    			p.textContent = "Ready to work together? Let's discuss your data analysis needs! I'm always excited to work with smart and creative people.";
    			t3 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t4 = space();
    			div1 = element("div");
    			create_component(cv.$$.fragment);
    			attr_dev(h2, "class", "svelte-s98sny");
    			add_location(h2, file$2, 27, 2, 621);
    			attr_dev(p, "class", "contact-intro svelte-s98sny");
    			add_location(p, file$2, 30, 4, 727);
    			attr_dev(div0, "class", "contact-methods svelte-s98sny");
    			add_location(div0, file$2, 31, 4, 884);
    			attr_dev(div1, "class", "cv-wrap svelte-s98sny");
    			add_location(div1, file$2, 42, 16, 1271);
    			attr_dev(div2, "class", "contact-info svelte-s98sny");
    			add_location(div2, file$2, 29, 12, 695);
    			attr_dev(div3, "class", "contact-content svelte-s98sny");
    			add_location(div3, file$2, 28, 8, 652);
    			attr_dev(div4, "class", "container svelte-s98sny");
    			add_location(div4, file$2, 26, 1, 594);
    			attr_dev(section, "id", "contact");
    			attr_dev(section, "class", "contact svelte-s98sny");
    			add_location(section, file$2, 25, 0, 553);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div4);
    			append_dev(div4, h2);
    			append_dev(div4, t1);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, p);
    			append_dev(div2, t3);
    			append_dev(div2, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div0, null);
    				}
    			}

    			append_dev(div2, t4);
    			append_dev(div2, div1);
    			mount_component(cv, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*contactInfo*/ 1) {
    				each_value = /*contactInfo*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cv.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cv.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_each(each_blocks, detaching);
    			destroy_component(cv);
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

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Contact', slots, []);

    	const contactInfo = [
    		{
    			icon: '📧',
    			label: 'Email',
    			value: 'magdage4@gmail.com',
    			link: 'mailto:magdage4@gmail.com'
    		},
    		{
    			icon: '📱',
    			label: 'Phone',
    			value: '+9647836705392',
    			link: 'tel:+9647836705392'
    		},
    		{
    			icon: '💼',
    			label: 'LinkedIn',
    			value: 'linkedin.com/in/majd-mohammed-a94250287/',
    			link: 'https://linkedin.com/in/majd-mohammed-a94250287/'
    		}
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Contact> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ CV, contactInfo });
    	return [contactInfo];
    }

    class Contact extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Contact",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\components\Footer.svelte generated by Svelte v3.59.2 */

    const file$1 = "src\\components\\Footer.svelte";

    function create_fragment$1(ctx) {
    	let footer;
    	let p;

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			p = element("p");
    			p.textContent = "© 2024 Majd Mohammed - Data Analyst Portfolio. All rights reserved.";
    			attr_dev(p, "class", "svelte-1rvr80l");
    			add_location(p, file$1, 1, 1, 11);
    			attr_dev(footer, "class", "svelte-1rvr80l");
    			add_location(footer, file$1, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, p);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
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

    function instance$1($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Footer', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.59.2 */
    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let header;
    	let t0;
    	let hero;
    	let t1;
    	let about;
    	let t2;
    	let projects;
    	let t3;
    	let contact;
    	let t4;
    	let footer;
    	let current;
    	header = new Header({ $$inline: true });
    	hero = new Hero({ $$inline: true });
    	about = new About({ $$inline: true });
    	projects = new Projects({ $$inline: true });
    	contact = new Contact({ $$inline: true });
    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(header.$$.fragment);
    			t0 = space();
    			create_component(hero.$$.fragment);
    			t1 = space();
    			create_component(about.$$.fragment);
    			t2 = space();
    			create_component(projects.$$.fragment);
    			t3 = space();
    			create_component(contact.$$.fragment);
    			t4 = space();
    			create_component(footer.$$.fragment);
    			attr_dev(main, "class", "svelte-1fn5nc3");
    			add_location(main, file, 9, 0, 329);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(header, main, null);
    			append_dev(main, t0);
    			mount_component(hero, main, null);
    			append_dev(main, t1);
    			mount_component(about, main, null);
    			append_dev(main, t2);
    			mount_component(projects, main, null);
    			append_dev(main, t3);
    			mount_component(contact, main, null);
    			append_dev(main, t4);
    			mount_component(footer, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(hero.$$.fragment, local);
    			transition_in(about.$$.fragment, local);
    			transition_in(projects.$$.fragment, local);
    			transition_in(contact.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(hero.$$.fragment, local);
    			transition_out(about.$$.fragment, local);
    			transition_out(projects.$$.fragment, local);
    			transition_out(contact.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(header);
    			destroy_component(hero);
    			destroy_component(about);
    			destroy_component(projects);
    			destroy_component(contact);
    			destroy_component(footer);
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

    	$$self.$capture_state = () => ({
    		Header,
    		Hero,
    		About,
    		Projects,
    		Contact,
    		Footer
    	});

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
    	target: document.getElementById('app'),
    	props: {
    		name: 'world'
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
