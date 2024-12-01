(() => {
    "use strict";
    const modules_flsModules = {};
    function addLoadedClass() {
        if (!document.documentElement.classList.contains("loading")) window.addEventListener("load", (function() {
            setTimeout((function() {
                document.documentElement.classList.add("loaded");
            }), 0);
        }));
    }
    let bodyLockStatus = true;
    let bodyLockToggle = (delay = 500) => {
        if (document.documentElement.classList.contains("lock")) bodyUnlock(delay); else bodyLock(delay);
    };
    let bodyUnlock = (delay = 500) => {
        if (bodyLockStatus) {
            const lockPaddingElements = document.querySelectorAll("[data-lp]");
            setTimeout((() => {
                lockPaddingElements.forEach((lockPaddingElement => {
                    lockPaddingElement.style.paddingRight = "";
                }));
                document.body.style.paddingRight = "";
                document.documentElement.classList.remove("lock");
                const header = document.querySelector(".header");
                if (header) header.style.paddingRight = "";
                if (document.body.hasAttribute("data-smooth-scroll")) document.body.setAttribute("data-smooth-scroll", "true");
            }), delay);
            bodyLockStatus = false;
            setTimeout((function() {
                bodyLockStatus = true;
            }), delay);
        }
    };
    let bodyLock = (delay = 500) => {
        if (bodyLockStatus) {
            const lockPaddingElements = document.querySelectorAll("[data-lp]");
            const lockPaddingValue = window.innerWidth - document.body.offsetWidth + "px";
            lockPaddingElements.forEach((lockPaddingElement => {
                lockPaddingElement.style.paddingRight = lockPaddingValue;
            }));
            document.body.style.paddingRight = lockPaddingValue;
            document.documentElement.classList.add("lock");
            const header = document.querySelector(".header");
            if (header) header.style.paddingRight = lockPaddingValue;
            if (document.body.hasAttribute("data-smooth-scroll")) document.body.setAttribute("data-smooth-scroll", "false");
            bodyLockStatus = false;
            setTimeout((function() {
                bodyLockStatus = true;
            }), delay);
        }
    };
    function menuInit() {
        if (document.querySelector(".icon-menu")) document.addEventListener("click", (function(e) {
            if (bodyLockStatus && e.target.closest(".icon-menu")) {
                bodyLockToggle();
                document.documentElement.classList.toggle("menu-open");
            }
        }));
    }
    function getDigFormat(item, sepp = " ") {
        return item.toString().replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, `$1${sepp}`);
    }
    function uniqArray(array) {
        return array.filter((function(item, index, self) {
            return self.indexOf(item) === index;
        }));
    }
    class ScrollWatcher {
        constructor(props) {
            let defaultConfig = {
                logging: true
            };
            this.config = Object.assign(defaultConfig, props);
            this.observer;
            !document.documentElement.classList.contains("watcher") ? this.scrollWatcherRun() : null;
        }
        scrollWatcherUpdate() {
            this.scrollWatcherRun();
        }
        scrollWatcherRun() {
            document.documentElement.classList.add("watcher");
            this.scrollWatcherConstructor(document.querySelectorAll("[data-watch]"));
        }
        scrollWatcherConstructor(items) {
            if (items.length) {
                let uniqParams = uniqArray(Array.from(items).map((function(item) {
                    if (item.dataset.watch === "navigator" && !item.dataset.watchThreshold) {
                        let valueOfThreshold;
                        if (item.clientHeight > 2) {
                            valueOfThreshold = window.innerHeight / 2 / (item.clientHeight - 1);
                            if (valueOfThreshold > 1) valueOfThreshold = 1;
                        } else valueOfThreshold = 1;
                        item.setAttribute("data-watch-threshold", valueOfThreshold.toFixed(2));
                    }
                    return `${item.dataset.watchRoot ? item.dataset.watchRoot : null}|${item.dataset.watchMargin ? item.dataset.watchMargin : "0px"}|${item.dataset.watchThreshold ? item.dataset.watchThreshold : 0}`;
                })));
                uniqParams.forEach((uniqParam => {
                    let uniqParamArray = uniqParam.split("|");
                    let paramsWatch = {
                        root: uniqParamArray[0],
                        margin: uniqParamArray[1],
                        threshold: uniqParamArray[2]
                    };
                    let groupItems = Array.from(items).filter((function(item) {
                        let watchRoot = item.dataset.watchRoot ? item.dataset.watchRoot : null;
                        let watchMargin = item.dataset.watchMargin ? item.dataset.watchMargin : "0px";
                        let watchThreshold = item.dataset.watchThreshold ? item.dataset.watchThreshold : 0;
                        if (String(watchRoot) === paramsWatch.root && String(watchMargin) === paramsWatch.margin && String(watchThreshold) === paramsWatch.threshold) return item;
                    }));
                    let configWatcher = this.getScrollWatcherConfig(paramsWatch);
                    this.scrollWatcherInit(groupItems, configWatcher);
                }));
            }
        }
        getScrollWatcherConfig(paramsWatch) {
            let configWatcher = {};
            if (document.querySelector(paramsWatch.root)) configWatcher.root = document.querySelector(paramsWatch.root);
            configWatcher.rootMargin = paramsWatch.margin;
            if (paramsWatch.margin.indexOf("px") < 0 && paramsWatch.margin.indexOf("%") < 0) return;
            if (paramsWatch.threshold === "prx") {
                paramsWatch.threshold = [];
                for (let i = 0; i <= 1; i += .005) paramsWatch.threshold.push(i);
            } else paramsWatch.threshold = paramsWatch.threshold.split(",");
            configWatcher.threshold = paramsWatch.threshold;
            return configWatcher;
        }
        scrollWatcherCreate(configWatcher) {
            console.log(configWatcher);
            this.observer = new IntersectionObserver(((entries, observer) => {
                entries.forEach((entry => {
                    this.scrollWatcherCallback(entry, observer);
                }));
            }), configWatcher);
        }
        scrollWatcherInit(items, configWatcher) {
            this.scrollWatcherCreate(configWatcher);
            items.forEach((item => this.observer.observe(item)));
        }
        scrollWatcherIntersecting(entry, targetElement) {
            if (entry.isIntersecting) !targetElement.classList.contains("_watcher-view") ? targetElement.classList.add("_watcher-view") : null; else targetElement.classList.contains("_watcher-view") ? targetElement.classList.remove("_watcher-view") : null;
        }
        scrollWatcherOff(targetElement, observer) {
            observer.unobserve(targetElement);
        }
        scrollWatcherCallback(entry, observer) {
            const targetElement = entry.target;
            this.scrollWatcherIntersecting(entry, targetElement);
            targetElement.hasAttribute("data-watch-once") && entry.isIntersecting ? this.scrollWatcherOff(targetElement, observer) : null;
            document.dispatchEvent(new CustomEvent("watcherCallback", {
                detail: {
                    entry
                }
            }));
        }
    }
    modules_flsModules.watcher = new ScrollWatcher({});
    let addWindowScrollEvent = false;
    function digitsCounter() {
        function digitsCountersInit(digitsCountersItems) {
            let digitsCounters = digitsCountersItems ? digitsCountersItems : document.querySelectorAll("[data-digits-counter]");
            if (digitsCounters.length) digitsCounters.forEach((digitsCounter => {
                if (digitsCounter.hasAttribute("data-go")) return;
                digitsCounter.setAttribute("data-go", "");
                digitsCounter.dataset.digitsCounter = digitsCounter.innerHTML;
                digitsCounter.innerHTML = `0`;
                digitsCountersAnimate(digitsCounter);
            }));
        }
        function digitsCountersAnimate(digitsCounter) {
            let startTimestamp = null;
            const duration = parseFloat(digitsCounter.dataset.digitsCounterSpeed) ? parseFloat(digitsCounter.dataset.digitsCounterSpeed) : 1e3;
            const startValue = parseFloat(digitsCounter.dataset.digitsCounter);
            const format = digitsCounter.dataset.digitsCounterFormat ? digitsCounter.dataset.digitsCounterFormat : " ";
            const startPosition = 0;
            const step = timestamp => {
                if (!startTimestamp) startTimestamp = timestamp;
                const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                const value = Math.floor(progress * (startPosition + startValue));
                digitsCounter.innerHTML = typeof digitsCounter.dataset.digitsCounterFormat !== "undefined" ? getDigFormat(value, format) : value;
                if (progress < 1) window.requestAnimationFrame(step); else digitsCounter.removeAttribute("data-go");
            };
            window.requestAnimationFrame(step);
        }
        function digitsCounterAction(e) {
            const entry = e.detail.entry;
            const targetElement = entry.target;
            if (targetElement.querySelectorAll("[data-digits-counter]").length) digitsCountersInit(targetElement.querySelectorAll("[data-digits-counter]"));
        }
        document.addEventListener("watcherCallback", digitsCounterAction);
    }
    setTimeout((() => {
        if (addWindowScrollEvent) {
            let windowScroll = new Event("windowScroll");
            window.addEventListener("scroll", (function(e) {
                document.dispatchEvent(windowScroll);
            }));
        }
    }), 0);
    var version = "1.1.16";
    function clamp(min, input, max) {
        return Math.max(min, Math.min(input, max));
    }
    function lerp(x, y, t) {
        return (1 - t) * x + t * y;
    }
    function damp(x, y, lambda, deltaTime) {
        return lerp(x, y, 1 - Math.exp(-lambda * deltaTime));
    }
    function modulo(n, d) {
        return (n % d + d) % d;
    }
    var Animate = class {
        isRunning=false;
        value=0;
        from=0;
        to=0;
        currentTime=0;
        lerp;
        duration;
        easing;
        onUpdate;
        advance(deltaTime) {
            if (!this.isRunning) return;
            let completed = false;
            if (this.duration && this.easing) {
                this.currentTime += deltaTime;
                const linearProgress = clamp(0, this.currentTime / this.duration, 1);
                completed = linearProgress >= 1;
                const easedProgress = completed ? 1 : this.easing(linearProgress);
                this.value = this.from + (this.to - this.from) * easedProgress;
            } else if (this.lerp) {
                this.value = damp(this.value, this.to, this.lerp * 60, deltaTime);
                if (Math.round(this.value) === this.to) {
                    this.value = this.to;
                    completed = true;
                }
            } else {
                this.value = this.to;
                completed = true;
            }
            if (completed) this.stop();
            this.onUpdate?.(this.value, completed);
        }
        stop() {
            this.isRunning = false;
        }
        fromTo(from, to, {lerp: lerp2, duration, easing, onStart, onUpdate}) {
            this.from = this.value = from;
            this.to = to;
            this.lerp = lerp2;
            this.duration = duration;
            this.easing = easing;
            this.currentTime = 0;
            this.isRunning = true;
            onStart?.();
            this.onUpdate = onUpdate;
        }
    };
    function debounce(callback, delay) {
        let timer;
        return function(...args) {
            let context = this;
            clearTimeout(timer);
            timer = setTimeout((() => {
                timer = void 0;
                callback.apply(context, args);
            }), delay);
        };
    }
    var Dimensions = class {
        constructor(wrapper, content, {autoResize = true, debounce: debounceValue = 250} = {}) {
            this.wrapper = wrapper;
            this.content = content;
            if (autoResize) {
                this.debouncedResize = debounce(this.resize, debounceValue);
                if (this.wrapper instanceof Window) window.addEventListener("resize", this.debouncedResize, false); else {
                    this.wrapperResizeObserver = new ResizeObserver(this.debouncedResize);
                    this.wrapperResizeObserver.observe(this.wrapper);
                }
                this.contentResizeObserver = new ResizeObserver(this.debouncedResize);
                this.contentResizeObserver.observe(this.content);
            }
            this.resize();
        }
        width=0;
        height=0;
        scrollHeight=0;
        scrollWidth=0;
        debouncedResize;
        wrapperResizeObserver;
        contentResizeObserver;
        destroy() {
            this.wrapperResizeObserver?.disconnect();
            this.contentResizeObserver?.disconnect();
            if (this.wrapper === window && this.debouncedResize) window.removeEventListener("resize", this.debouncedResize, false);
        }
        resize=() => {
            this.onWrapperResize();
            this.onContentResize();
        };
        onWrapperResize=() => {
            if (this.wrapper instanceof Window) {
                this.width = window.innerWidth;
                this.height = window.innerHeight;
            } else {
                this.width = this.wrapper.clientWidth;
                this.height = this.wrapper.clientHeight;
            }
        };
        onContentResize=() => {
            if (this.wrapper instanceof Window) {
                this.scrollHeight = this.content.scrollHeight;
                this.scrollWidth = this.content.scrollWidth;
            } else {
                this.scrollHeight = this.wrapper.scrollHeight;
                this.scrollWidth = this.wrapper.scrollWidth;
            }
        };
        get limit() {
            return {
                x: this.scrollWidth - this.width,
                y: this.scrollHeight - this.height
            };
        }
    };
    var Emitter = class {
        events={};
        emit(event, ...args) {
            let callbacks = this.events[event] || [];
            for (let i = 0, length = callbacks.length; i < length; i++) callbacks[i]?.(...args);
        }
        on(event, cb) {
            this.events[event]?.push(cb) || (this.events[event] = [ cb ]);
            return () => {
                this.events[event] = this.events[event]?.filter((i => cb !== i));
            };
        }
        off(event, callback) {
            this.events[event] = this.events[event]?.filter((i => callback !== i));
        }
        destroy() {
            this.events = {};
        }
    };
    var LINE_HEIGHT = 100 / 6;
    var listenerOptions = {
        passive: false
    };
    var VirtualScroll = class {
        constructor(element, options = {
            wheelMultiplier: 1,
            touchMultiplier: 1
        }) {
            this.element = element;
            this.options = options;
            window.addEventListener("resize", this.onWindowResize, false);
            this.onWindowResize();
            this.element.addEventListener("wheel", this.onWheel, listenerOptions);
            this.element.addEventListener("touchstart", this.onTouchStart, listenerOptions);
            this.element.addEventListener("touchmove", this.onTouchMove, listenerOptions);
            this.element.addEventListener("touchend", this.onTouchEnd, listenerOptions);
        }
        touchStart={
            x: 0,
            y: 0
        };
        lastDelta={
            x: 0,
            y: 0
        };
        window={
            width: 0,
            height: 0
        };
        emitter=new Emitter;
        on(event, callback) {
            return this.emitter.on(event, callback);
        }
        destroy() {
            this.emitter.destroy();
            window.removeEventListener("resize", this.onWindowResize, false);
            this.element.removeEventListener("wheel", this.onWheel, listenerOptions);
            this.element.removeEventListener("touchstart", this.onTouchStart, listenerOptions);
            this.element.removeEventListener("touchmove", this.onTouchMove, listenerOptions);
            this.element.removeEventListener("touchend", this.onTouchEnd, listenerOptions);
        }
        onTouchStart=event => {
            const {clientX, clientY} = event.targetTouches ? event.targetTouches[0] : event;
            this.touchStart.x = clientX;
            this.touchStart.y = clientY;
            this.lastDelta = {
                x: 0,
                y: 0
            };
            this.emitter.emit("scroll", {
                deltaX: 0,
                deltaY: 0,
                event
            });
        };
        onTouchMove=event => {
            const {clientX, clientY} = event.targetTouches ? event.targetTouches[0] : event;
            const deltaX = -(clientX - this.touchStart.x) * this.options.touchMultiplier;
            const deltaY = -(clientY - this.touchStart.y) * this.options.touchMultiplier;
            this.touchStart.x = clientX;
            this.touchStart.y = clientY;
            this.lastDelta = {
                x: deltaX,
                y: deltaY
            };
            this.emitter.emit("scroll", {
                deltaX,
                deltaY,
                event
            });
        };
        onTouchEnd=event => {
            this.emitter.emit("scroll", {
                deltaX: this.lastDelta.x,
                deltaY: this.lastDelta.y,
                event
            });
        };
        onWheel=event => {
            let {deltaX, deltaY, deltaMode} = event;
            const multiplierX = deltaMode === 1 ? LINE_HEIGHT : deltaMode === 2 ? this.window.width : 1;
            const multiplierY = deltaMode === 1 ? LINE_HEIGHT : deltaMode === 2 ? this.window.height : 1;
            deltaX *= multiplierX;
            deltaY *= multiplierY;
            deltaX *= this.options.wheelMultiplier;
            deltaY *= this.options.wheelMultiplier;
            this.emitter.emit("scroll", {
                deltaX,
                deltaY,
                event
            });
        };
        onWindowResize=() => {
            this.window = {
                width: window.innerWidth,
                height: window.innerHeight
            };
        };
    };
    var Lenis = class {
        _isScrolling=false;
        _isStopped=false;
        _isLocked=false;
        _preventNextNativeScrollEvent=false;
        _resetVelocityTimeout=null;
        __rafID=null;
        isTouching;
        time=0;
        userData={};
        lastVelocity=0;
        velocity=0;
        direction=0;
        options;
        targetScroll;
        animatedScroll;
        animate=new Animate;
        emitter=new Emitter;
        dimensions;
        virtualScroll;
        constructor({wrapper = window, content = document.documentElement, eventsTarget = wrapper, smoothWheel = true, syncTouch = false, syncTouchLerp = .075, touchInertiaMultiplier = 35, duration, easing = t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), lerp: lerp2 = .1, infinite = false, orientation = "vertical", gestureOrientation = "vertical", touchMultiplier = 1, wheelMultiplier = 1, autoResize = true, prevent, virtualScroll, overscroll = true, autoRaf = false, __experimental__naiveDimensions = false} = {}) {
            window.lenisVersion = version;
            if (!wrapper || wrapper === document.documentElement || wrapper === document.body) wrapper = window;
            this.options = {
                wrapper,
                content,
                eventsTarget,
                smoothWheel,
                syncTouch,
                syncTouchLerp,
                touchInertiaMultiplier,
                duration,
                easing,
                lerp: lerp2,
                infinite,
                gestureOrientation,
                orientation,
                touchMultiplier,
                wheelMultiplier,
                autoResize,
                prevent,
                virtualScroll,
                overscroll,
                autoRaf,
                __experimental__naiveDimensions
            };
            this.dimensions = new Dimensions(wrapper, content, {
                autoResize
            });
            this.updateClassName();
            this.targetScroll = this.animatedScroll = this.actualScroll;
            this.options.wrapper.addEventListener("scroll", this.onNativeScroll, false);
            this.options.wrapper.addEventListener("pointerdown", this.onPointerDown, false);
            this.virtualScroll = new VirtualScroll(eventsTarget, {
                touchMultiplier,
                wheelMultiplier
            });
            this.virtualScroll.on("scroll", this.onVirtualScroll);
            if (this.options.autoRaf) this.__rafID = requestAnimationFrame(this.raf);
        }
        destroy() {
            this.emitter.destroy();
            this.options.wrapper.removeEventListener("scroll", this.onNativeScroll, false);
            this.options.wrapper.removeEventListener("pointerdown", this.onPointerDown, false);
            this.virtualScroll.destroy();
            this.dimensions.destroy();
            this.cleanUpClassName();
            if (this.__rafID) cancelAnimationFrame(this.__rafID);
        }
        on(event, callback) {
            return this.emitter.on(event, callback);
        }
        off(event, callback) {
            return this.emitter.off(event, callback);
        }
        setScroll(scroll) {
            if (this.isHorizontal) this.rootElement.scrollLeft = scroll; else this.rootElement.scrollTop = scroll;
        }
        onPointerDown=event => {
            if (event.button === 1) this.reset();
        };
        onVirtualScroll=data => {
            if (typeof this.options.virtualScroll === "function" && this.options.virtualScroll(data) === false) return;
            const {deltaX, deltaY, event} = data;
            this.emitter.emit("virtual-scroll", {
                deltaX,
                deltaY,
                event
            });
            if (event.ctrlKey) return;
            if (event.lenisStopPropagation) return;
            const isTouch = event.type.includes("touch");
            const isWheel = event.type.includes("wheel");
            this.isTouching = event.type === "touchstart" || event.type === "touchmove";
            const isTapToStop = this.options.syncTouch && isTouch && event.type === "touchstart" && !this.isStopped && !this.isLocked;
            if (isTapToStop) {
                this.reset();
                return;
            }
            const isClick = deltaX === 0 && deltaY === 0;
            const isUnknownGesture = this.options.gestureOrientation === "vertical" && deltaY === 0 || this.options.gestureOrientation === "horizontal" && deltaX === 0;
            if (isClick || isUnknownGesture) return;
            let composedPath = event.composedPath();
            composedPath = composedPath.slice(0, composedPath.indexOf(this.rootElement));
            const prevent = this.options.prevent;
            if (!!composedPath.find((node => node instanceof HTMLElement && (typeof prevent === "function" && prevent?.(node) || node.hasAttribute?.("data-lenis-prevent") || isTouch && node.hasAttribute?.("data-lenis-prevent-touch") || isWheel && node.hasAttribute?.("data-lenis-prevent-wheel"))))) return;
            if (this.isStopped || this.isLocked) {
                event.preventDefault();
                return;
            }
            const isSmooth = this.options.syncTouch && isTouch || this.options.smoothWheel && isWheel;
            if (!isSmooth) {
                this.isScrolling = "native";
                this.animate.stop();
                event.lenisStopPropagation = true;
                return;
            }
            let delta = deltaY;
            if (this.options.gestureOrientation === "both") delta = Math.abs(deltaY) > Math.abs(deltaX) ? deltaY : deltaX; else if (this.options.gestureOrientation === "horizontal") delta = deltaX;
            if (!this.options.overscroll || this.options.infinite || this.options.wrapper !== window && (this.animatedScroll > 0 && this.animatedScroll < this.limit || this.animatedScroll === 0 && deltaY > 0 || this.animatedScroll === this.limit && deltaY < 0)) event.lenisStopPropagation = true;
            event.preventDefault();
            const syncTouch = isTouch && this.options.syncTouch;
            const isTouchEnd = isTouch && event.type === "touchend";
            const hasTouchInertia = isTouchEnd && Math.abs(delta) > 5;
            if (hasTouchInertia) delta = this.velocity * this.options.touchInertiaMultiplier;
            this.scrollTo(this.targetScroll + delta, {
                programmatic: false,
                ...syncTouch ? {
                    lerp: hasTouchInertia ? this.options.syncTouchLerp : 1
                } : {
                    lerp: this.options.lerp,
                    duration: this.options.duration,
                    easing: this.options.easing
                }
            });
        };
        resize() {
            this.dimensions.resize();
            this.animatedScroll = this.targetScroll = this.actualScroll;
            this.emit();
        }
        emit() {
            this.emitter.emit("scroll", this);
        }
        onNativeScroll=() => {
            if (this._resetVelocityTimeout !== null) {
                clearTimeout(this._resetVelocityTimeout);
                this._resetVelocityTimeout = null;
            }
            if (this._preventNextNativeScrollEvent) {
                this._preventNextNativeScrollEvent = false;
                return;
            }
            if (this.isScrolling === false || this.isScrolling === "native") {
                const lastScroll = this.animatedScroll;
                this.animatedScroll = this.targetScroll = this.actualScroll;
                this.lastVelocity = this.velocity;
                this.velocity = this.animatedScroll - lastScroll;
                this.direction = Math.sign(this.animatedScroll - lastScroll);
                this.isScrolling = "native";
                this.emit();
                if (this.velocity !== 0) this._resetVelocityTimeout = setTimeout((() => {
                    this.lastVelocity = this.velocity;
                    this.velocity = 0;
                    this.isScrolling = false;
                    this.emit();
                }), 400);
            }
        };
        reset() {
            this.isLocked = false;
            this.isScrolling = false;
            this.animatedScroll = this.targetScroll = this.actualScroll;
            this.lastVelocity = this.velocity = 0;
            this.animate.stop();
        }
        start() {
            if (!this.isStopped) return;
            this.isStopped = false;
            this.reset();
        }
        stop() {
            if (this.isStopped) return;
            this.isStopped = true;
            this.animate.stop();
            this.reset();
        }
        raf=time => {
            const deltaTime = time - (this.time || time);
            this.time = time;
            this.animate.advance(deltaTime * .001);
            if (this.options.autoRaf) this.__rafID = requestAnimationFrame(this.raf);
        };
        scrollTo(target, {offset = 0, immediate = false, lock = false, duration = this.options.duration, easing = this.options.easing, lerp: lerp2 = this.options.lerp, onStart, onComplete, force = false, programmatic = true, userData} = {}) {
            if ((this.isStopped || this.isLocked) && !force) return;
            if (typeof target === "string" && [ "top", "left", "start" ].includes(target)) target = 0; else if (typeof target === "string" && [ "bottom", "right", "end" ].includes(target)) target = this.limit; else {
                let node;
                if (typeof target === "string") node = document.querySelector(target); else if (target instanceof HTMLElement && target?.nodeType) node = target;
                if (node) {
                    if (this.options.wrapper !== window) {
                        const wrapperRect = this.rootElement.getBoundingClientRect();
                        offset -= this.isHorizontal ? wrapperRect.left : wrapperRect.top;
                    }
                    const rect = node.getBoundingClientRect();
                    target = (this.isHorizontal ? rect.left : rect.top) + this.animatedScroll;
                }
            }
            if (typeof target !== "number") return;
            target += offset;
            target = Math.round(target);
            if (this.options.infinite) {
                if (programmatic) this.targetScroll = this.animatedScroll = this.scroll;
            } else target = clamp(0, target, this.limit);
            if (target === this.targetScroll) {
                onStart?.(this);
                onComplete?.(this);
                return;
            }
            this.userData = userData ?? {};
            if (immediate) {
                this.animatedScroll = this.targetScroll = target;
                this.setScroll(this.scroll);
                this.reset();
                this.preventNextNativeScrollEvent();
                this.emit();
                onComplete?.(this);
                this.userData = {};
                return;
            }
            if (!programmatic) this.targetScroll = target;
            this.animate.fromTo(this.animatedScroll, target, {
                duration,
                easing,
                lerp: lerp2,
                onStart: () => {
                    if (lock) this.isLocked = true;
                    this.isScrolling = "smooth";
                    onStart?.(this);
                },
                onUpdate: (value, completed) => {
                    this.isScrolling = "smooth";
                    this.lastVelocity = this.velocity;
                    this.velocity = value - this.animatedScroll;
                    this.direction = Math.sign(this.velocity);
                    this.animatedScroll = value;
                    this.setScroll(this.scroll);
                    if (programmatic) this.targetScroll = value;
                    if (!completed) this.emit();
                    if (completed) {
                        this.reset();
                        this.emit();
                        onComplete?.(this);
                        this.userData = {};
                        this.preventNextNativeScrollEvent();
                    }
                }
            });
        }
        preventNextNativeScrollEvent() {
            this._preventNextNativeScrollEvent = true;
            requestAnimationFrame((() => {
                this._preventNextNativeScrollEvent = false;
            }));
        }
        get rootElement() {
            return this.options.wrapper === window ? document.documentElement : this.options.wrapper;
        }
        get limit() {
            if (this.options.__experimental__naiveDimensions) if (this.isHorizontal) return this.rootElement.scrollWidth - this.rootElement.clientWidth; else return this.rootElement.scrollHeight - this.rootElement.clientHeight; else return this.dimensions.limit[this.isHorizontal ? "x" : "y"];
        }
        get isHorizontal() {
            return this.options.orientation === "horizontal";
        }
        get actualScroll() {
            return this.isHorizontal ? this.rootElement.scrollLeft : this.rootElement.scrollTop;
        }
        get scroll() {
            return this.options.infinite ? modulo(this.animatedScroll, this.limit) : this.animatedScroll;
        }
        get progress() {
            return this.limit === 0 ? 1 : this.scroll / this.limit;
        }
        get isScrolling() {
            return this._isScrolling;
        }
        set isScrolling(value) {
            if (this._isScrolling !== value) {
                this._isScrolling = value;
                this.updateClassName();
            }
        }
        get isStopped() {
            return this._isStopped;
        }
        set isStopped(value) {
            if (this._isStopped !== value) {
                this._isStopped = value;
                this.updateClassName();
            }
        }
        get isLocked() {
            return this._isLocked;
        }
        set isLocked(value) {
            if (this._isLocked !== value) {
                this._isLocked = value;
                this.updateClassName();
            }
        }
        get isSmooth() {
            return this.isScrolling === "smooth";
        }
        get className() {
            let className = "lenis";
            if (this.isStopped) className += " lenis-stopped";
            if (this.isLocked) className += " lenis-locked";
            if (this.isScrolling) className += " lenis-scrolling";
            if (this.isScrolling === "smooth") className += " lenis-smooth";
            return className;
        }
        updateClassName() {
            this.cleanUpClassName();
            this.rootElement.className = `${this.rootElement.className} ${this.className}`.trim();
        }
        cleanUpClassName() {
            this.rootElement.className = this.rootElement.className.replace(/lenis(-\w+)?/g, "").trim();
        }
    };
    (function() {
        function append() {
            var length = arguments.length;
            for (var i = 0; i < length; i++) {
                var node = i < 0 || arguments.length <= i ? void 0 : arguments[i];
                if (node.nodeType === 1 || node.nodeType === 11) this.appendChild(node); else this.appendChild(document.createTextNode(String(node)));
            }
        }
        function replaceChildren() {
            while (this.lastChild) this.removeChild(this.lastChild);
            if (arguments.length) this.append.apply(this, arguments);
        }
        function replaceWith() {
            var parent = this.parentNode;
            for (var _len = arguments.length, nodes = new Array(_len), _key = 0; _key < _len; _key++) nodes[_key] = arguments[_key];
            var i = nodes.length;
            if (!parent) return;
            if (!i) parent.removeChild(this);
            while (i--) {
                var node = nodes[i];
                if (typeof node !== "object") node = this.ownerDocument.createTextNode(node); else if (node.parentNode) node.parentNode.removeChild(node);
                if (!i) parent.replaceChild(node, this); else parent.insertBefore(this.previousSibling, node);
            }
        }
        if (typeof Element !== "undefined") {
            if (!Element.prototype.append) {
                Element.prototype.append = append;
                DocumentFragment.prototype.append = append;
            }
            if (!Element.prototype.replaceChildren) {
                Element.prototype.replaceChildren = replaceChildren;
                DocumentFragment.prototype.replaceChildren = replaceChildren;
            }
            if (!Element.prototype.replaceWith) {
                Element.prototype.replaceWith = replaceWith;
                DocumentFragment.prototype.replaceWith = replaceWith;
            }
        }
    })();
    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function");
    }
    function _defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
    }
    function _createClass(Constructor, protoProps, staticProps) {
        if (protoProps) _defineProperties(Constructor.prototype, protoProps);
        if (staticProps) _defineProperties(Constructor, staticProps);
        return Constructor;
    }
    function _defineProperty(obj, key, value) {
        if (key in obj) Object.defineProperty(obj, key, {
            value,
            enumerable: true,
            configurable: true,
            writable: true
        }); else obj[key] = value;
        return obj;
    }
    function ownKeys(object, enumerableOnly) {
        var keys = Object.keys(object);
        if (Object.getOwnPropertySymbols) {
            var symbols = Object.getOwnPropertySymbols(object);
            if (enumerableOnly) symbols = symbols.filter((function(sym) {
                return Object.getOwnPropertyDescriptor(object, sym).enumerable;
            }));
            keys.push.apply(keys, symbols);
        }
        return keys;
    }
    function _objectSpread2(target) {
        for (var i = 1; i < arguments.length; i++) {
            var source = arguments[i] != null ? arguments[i] : {};
            if (i % 2) ownKeys(Object(source), true).forEach((function(key) {
                _defineProperty(target, key, source[key]);
            })); else if (Object.getOwnPropertyDescriptors) Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); else ownKeys(Object(source)).forEach((function(key) {
                Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
            }));
        }
        return target;
    }
    function _slicedToArray(arr, i) {
        return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
    }
    function _toConsumableArray(arr) {
        return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
    }
    function _arrayWithoutHoles(arr) {
        if (Array.isArray(arr)) return _arrayLikeToArray(arr);
    }
    function _arrayWithHoles(arr) {
        if (Array.isArray(arr)) return arr;
    }
    function _iterableToArray(iter) {
        if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
    }
    function _iterableToArrayLimit(arr, i) {
        if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
        var _arr = [];
        var _n = true;
        var _d = false;
        var _e = void 0;
        try {
            for (var _s, _i = arr[Symbol.iterator](); !(_n = (_s = _i.next()).done); _n = true) {
                _arr.push(_s.value);
                if (i && _arr.length === i) break;
            }
        } catch (err) {
            _d = true;
            _e = err;
        } finally {
            try {
                if (!_n && _i["return"] != null) _i["return"]();
            } finally {
                if (_d) throw _e;
            }
        }
        return _arr;
    }
    function _unsupportedIterableToArray(o, minLen) {
        if (!o) return;
        if (typeof o === "string") return _arrayLikeToArray(o, minLen);
        var n = Object.prototype.toString.call(o).slice(8, -1);
        if (n === "Object" && o.constructor) n = o.constructor.name;
        if (n === "Map" || n === "Set") return Array.from(o);
        if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
    }
    function _arrayLikeToArray(arr, len) {
        if (len == null || len > arr.length) len = arr.length;
        for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
        return arr2;
    }
    function _nonIterableSpread() {
        throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    function _nonIterableRest() {
        throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    function extend(target, object) {
        return Object.getOwnPropertyNames(Object(target)).reduce((function(extended, key) {
            var currentValue = Object.getOwnPropertyDescriptor(Object(target), key);
            var newValue = Object.getOwnPropertyDescriptor(Object(object), key);
            return Object.defineProperty(extended, key, newValue || currentValue);
        }), {});
    }
    function isString(value) {
        return typeof value === "string";
    }
    function isArray(value) {
        return Array.isArray(value);
    }
    function parseSettings() {
        var settings = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
        var object = extend(settings);
        var types;
        if (object.types !== void 0) types = object.types; else if (object.split !== void 0) types = object.split;
        if (types !== void 0) object.types = (isString(types) || isArray(types) ? String(types) : "").split(",").map((function(type) {
            return String(type).trim();
        })).filter((function(type) {
            return /((line)|(word)|(char))/i.test(type);
        }));
        if (object.absolute || object.position) object.absolute = object.absolute || /absolute/.test(settings.position);
        return object;
    }
    function parseTypes(value) {
        var types = isString(value) || isArray(value) ? String(value) : "";
        return {
            none: !types,
            lines: /line/i.test(types),
            words: /word/i.test(types),
            chars: /char/i.test(types)
        };
    }
    function isObject(value) {
        return value !== null && typeof value === "object";
    }
    function isNode(input) {
        return isObject(input) && /^(1|3|11)$/.test(input.nodeType);
    }
    function isLength(value) {
        return typeof value === "number" && value > -1 && value % 1 === 0;
    }
    function isArrayLike(value) {
        return isObject(value) && isLength(value.length);
    }
    function toArray(value) {
        if (isArray(value)) return value;
        if (value == null) return [];
        return isArrayLike(value) ? Array.prototype.slice.call(value) : [ value ];
    }
    function getTargetElements(target) {
        var elements = target;
        if (isString(target)) if (/^(#[a-z]\w+)$/.test(target.trim())) elements = document.getElementById(target.trim().slice(1)); else elements = document.querySelectorAll(target);
        return toArray(elements).reduce((function(result, element) {
            return [].concat(_toConsumableArray(result), _toConsumableArray(toArray(element).filter(isNode)));
        }), []);
    }
    var entries = Object.entries;
    var expando = "_splittype";
    var cache = {};
    var uid = 0;
    function set(owner, key, value) {
        if (!isObject(owner)) {
            console.warn("[data.set] owner is not an object");
            return null;
        }
        var id = owner[expando] || (owner[expando] = ++uid);
        var data = cache[id] || (cache[id] = {});
        if (value === void 0) {
            if (!!key && Object.getPrototypeOf(key) === Object.prototype) cache[id] = _objectSpread2(_objectSpread2({}, data), key);
        } else if (key !== void 0) data[key] = value;
        return value;
    }
    function get(owner, key) {
        var id = isObject(owner) ? owner[expando] : null;
        var data = id && cache[id] || {};
        if (key === void 0) return data;
        return data[key];
    }
    function remove(element) {
        var id = element && element[expando];
        if (id) {
            delete element[id];
            delete cache[id];
        }
    }
    function clear() {
        Object.keys(cache).forEach((function(key) {
            delete cache[key];
        }));
    }
    function cleanup() {
        entries(cache).forEach((function(_ref) {
            var _ref2 = _slicedToArray(_ref, 2), id = _ref2[0], _ref2$ = _ref2[1], isRoot = _ref2$.isRoot, isSplit = _ref2$.isSplit;
            if (!isRoot || !isSplit) {
                cache[id] = null;
                delete cache[id];
            }
        }));
    }
    function toWords(value) {
        var separator = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : " ";
        var string = value ? String(value) : "";
        return string.trim().replace(/\s+/g, " ").split(separator);
    }
    var rsAstralRange = "\\ud800-\\udfff";
    var rsComboMarksRange = "\\u0300-\\u036f\\ufe20-\\ufe23";
    var rsComboSymbolsRange = "\\u20d0-\\u20f0";
    var rsVarRange = "\\ufe0e\\ufe0f";
    var rsAstral = "[".concat(rsAstralRange, "]");
    var rsCombo = "[".concat(rsComboMarksRange).concat(rsComboSymbolsRange, "]");
    var rsFitz = "\\ud83c[\\udffb-\\udfff]";
    var rsModifier = "(?:".concat(rsCombo, "|").concat(rsFitz, ")");
    var rsNonAstral = "[^".concat(rsAstralRange, "]");
    var rsRegional = "(?:\\ud83c[\\udde6-\\uddff]){2}";
    var rsSurrPair = "[\\ud800-\\udbff][\\udc00-\\udfff]";
    var rsZWJ = "\\u200d";
    var reOptMod = "".concat(rsModifier, "?");
    var rsOptVar = "[".concat(rsVarRange, "]?");
    var rsOptJoin = "(?:" + rsZWJ + "(?:" + [ rsNonAstral, rsRegional, rsSurrPair ].join("|") + ")" + rsOptVar + reOptMod + ")*";
    var rsSeq = rsOptVar + reOptMod + rsOptJoin;
    var rsSymbol = "(?:".concat([ "".concat(rsNonAstral).concat(rsCombo, "?"), rsCombo, rsRegional, rsSurrPair, rsAstral ].join("|"), "\n)");
    var reUnicode = RegExp("".concat(rsFitz, "(?=").concat(rsFitz, ")|").concat(rsSymbol).concat(rsSeq), "g");
    var unicodeRange = [ rsZWJ, rsAstralRange, rsComboMarksRange, rsComboSymbolsRange, rsVarRange ];
    var reHasUnicode = RegExp("[".concat(unicodeRange.join(""), "]"));
    function asciiToArray(string) {
        return string.split("");
    }
    function hasUnicode(string) {
        return reHasUnicode.test(string);
    }
    function unicodeToArray(string) {
        return string.match(reUnicode) || [];
    }
    function stringToArray(string) {
        return hasUnicode(string) ? unicodeToArray(string) : asciiToArray(string);
    }
    function dist_toString(value) {
        return value == null ? "" : String(value);
    }
    function toChars(string) {
        var separator = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "";
        string = dist_toString(string);
        if (string && isString(string)) if (!separator && hasUnicode(string)) return stringToArray(string);
        return string.split(separator);
    }
    function createElement(name, attributes) {
        var element = document.createElement(name);
        if (!attributes) return element;
        Object.keys(attributes).forEach((function(attribute) {
            var rawValue = attributes[attribute];
            var value = isString(rawValue) ? rawValue.trim() : rawValue;
            if (value === null || value === "") return;
            if (attribute === "children") element.append.apply(element, _toConsumableArray(toArray(value))); else element.setAttribute(attribute, value);
        }));
        return element;
    }
    var defaults = {
        splitClass: "",
        lineClass: "line",
        wordClass: "word",
        charClass: "char",
        types: [ "lines", "words", "chars" ],
        absolute: false,
        tagName: "div"
    };
    function splitWordsAndChars(textNode, settings) {
        settings = extend(defaults, settings);
        var types = parseTypes(settings.types);
        var TAG_NAME = settings.tagName;
        var VALUE = textNode.nodeValue;
        var splitText = document.createDocumentFragment();
        var words = [];
        var chars = [];
        if (/^\s/.test(VALUE)) splitText.append(" ");
        words = toWords(VALUE).reduce((function(result, WORD, idx, arr) {
            var wordElement;
            var characterElementsForCurrentWord;
            if (types.chars) characterElementsForCurrentWord = toChars(WORD).map((function(CHAR) {
                var characterElement = createElement(TAG_NAME, {
                    class: "".concat(settings.splitClass, " ").concat(settings.charClass),
                    style: "display: inline-block;",
                    children: CHAR
                });
                set(characterElement, "isChar", true);
                chars = [].concat(_toConsumableArray(chars), [ characterElement ]);
                return characterElement;
            }));
            if (types.words || types.lines) {
                wordElement = createElement(TAG_NAME, {
                    class: "".concat(settings.wordClass, " ").concat(settings.splitClass),
                    style: "display: inline-block; ".concat(types.words && settings.absolute ? "position: relative;" : ""),
                    children: types.chars ? characterElementsForCurrentWord : WORD
                });
                set(wordElement, {
                    isWord: true,
                    isWordStart: true,
                    isWordEnd: true
                });
                splitText.appendChild(wordElement);
            } else characterElementsForCurrentWord.forEach((function(characterElement) {
                splitText.appendChild(characterElement);
            }));
            if (idx < arr.length - 1) splitText.append(" ");
            return types.words ? result.concat(wordElement) : result;
        }), []);
        if (/\s$/.test(VALUE)) splitText.append(" ");
        textNode.replaceWith(splitText);
        return {
            words,
            chars
        };
    }
    function split(node, settings) {
        var type = node.nodeType;
        var wordsAndChars = {
            words: [],
            chars: []
        };
        if (!/(1|3|11)/.test(type)) return wordsAndChars;
        if (type === 3 && /\S/.test(node.nodeValue)) return splitWordsAndChars(node, settings);
        var childNodes = toArray(node.childNodes);
        if (childNodes.length) {
            set(node, "isSplit", true);
            if (!get(node).isRoot) {
                node.style.display = "inline-block";
                node.style.position = "relative";
                var nextSibling = node.nextSibling;
                var prevSibling = node.previousSibling;
                var text = node.textContent || "";
                var textAfter = nextSibling ? nextSibling.textContent : " ";
                var textBefore = prevSibling ? prevSibling.textContent : " ";
                set(node, {
                    isWordEnd: /\s$/.test(text) || /^\s/.test(textAfter),
                    isWordStart: /^\s/.test(text) || /\s$/.test(textBefore)
                });
            }
        }
        return childNodes.reduce((function(result, child) {
            var _split = split(child, settings), words = _split.words, chars = _split.chars;
            return {
                words: [].concat(_toConsumableArray(result.words), _toConsumableArray(words)),
                chars: [].concat(_toConsumableArray(result.chars), _toConsumableArray(chars))
            };
        }), wordsAndChars);
    }
    function getPosition(node, isWord, settings, scrollPos) {
        if (!settings.absolute) return {
            top: isWord ? node.offsetTop : null
        };
        var parent = node.offsetParent;
        var _scrollPos = _slicedToArray(scrollPos, 2), scrollX = _scrollPos[0], scrollY = _scrollPos[1];
        var parentX = 0;
        var parentY = 0;
        if (parent && parent !== document.body) {
            var parentRect = parent.getBoundingClientRect();
            parentX = parentRect.x + scrollX;
            parentY = parentRect.y + scrollY;
        }
        var _node$getBoundingClie = node.getBoundingClientRect(), width = _node$getBoundingClie.width, height = _node$getBoundingClie.height, x = _node$getBoundingClie.x, y = _node$getBoundingClie.y;
        var top = y + scrollY - parentY;
        var left = x + scrollX - parentX;
        return {
            width,
            height,
            top,
            left
        };
    }
    function unSplitWords(element) {
        if (!get(element).isWord) toArray(element.children).forEach((function(child) {
            return unSplitWords(child);
        })); else {
            remove(element);
            element.replaceWith.apply(element, _toConsumableArray(element.childNodes));
        }
    }
    var createFragment = function createFragment() {
        return document.createDocumentFragment();
    };
    function repositionAfterSplit(element, settings, scrollPos) {
        var types = parseTypes(settings.types);
        var TAG_NAME = settings.tagName;
        var nodes = element.getElementsByTagName("*");
        var wordsInEachLine = [];
        var wordsInCurrentLine = [];
        var lineOffsetY = null;
        var elementHeight;
        var elementWidth;
        var contentBox;
        var lines = [];
        var parent = element.parentElement;
        var nextSibling = element.nextElementSibling;
        var splitText = createFragment();
        var cs = window.getComputedStyle(element);
        var align = cs.textAlign;
        var fontSize = parseFloat(cs.fontSize);
        var lineThreshold = fontSize * .2;
        if (settings.absolute) {
            contentBox = {
                left: element.offsetLeft,
                top: element.offsetTop,
                width: element.offsetWidth
            };
            elementWidth = element.offsetWidth;
            elementHeight = element.offsetHeight;
            set(element, {
                cssWidth: element.style.width,
                cssHeight: element.style.height
            });
        }
        toArray(nodes).forEach((function(node) {
            var isWordLike = node.parentElement === element;
            var _getPosition = getPosition(node, isWordLike, settings, scrollPos), width = _getPosition.width, height = _getPosition.height, top = _getPosition.top, left = _getPosition.left;
            if (/^br$/i.test(node.nodeName)) return;
            if (types.lines && isWordLike) {
                if (lineOffsetY === null || top - lineOffsetY >= lineThreshold) {
                    lineOffsetY = top;
                    wordsInEachLine.push(wordsInCurrentLine = []);
                }
                wordsInCurrentLine.push(node);
            }
            if (settings.absolute) set(node, {
                top,
                left,
                width,
                height
            });
        }));
        if (parent) parent.removeChild(element);
        if (types.lines) {
            lines = wordsInEachLine.map((function(wordsInThisLine) {
                var lineElement = createElement(TAG_NAME, {
                    class: "".concat(settings.splitClass, " ").concat(settings.lineClass),
                    style: "display: block; text-align: ".concat(align, "; width: 100%;")
                });
                set(lineElement, "isLine", true);
                var lineDimensions = {
                    height: 0,
                    top: 1e4
                };
                splitText.appendChild(lineElement);
                wordsInThisLine.forEach((function(wordOrElement, idx, arr) {
                    var _data$get = get(wordOrElement), isWordEnd = _data$get.isWordEnd, top = _data$get.top, height = _data$get.height;
                    var next = arr[idx + 1];
                    lineDimensions.height = Math.max(lineDimensions.height, height);
                    lineDimensions.top = Math.min(lineDimensions.top, top);
                    lineElement.appendChild(wordOrElement);
                    if (isWordEnd && get(next).isWordStart) lineElement.append(" ");
                }));
                if (settings.absolute) set(lineElement, {
                    height: lineDimensions.height,
                    top: lineDimensions.top
                });
                return lineElement;
            }));
            if (!types.words) unSplitWords(splitText);
            element.replaceChildren(splitText);
        }
        if (settings.absolute) {
            element.style.width = "".concat(element.style.width || elementWidth, "px");
            element.style.height = "".concat(elementHeight, "px");
            toArray(nodes).forEach((function(node) {
                var _data$get2 = get(node), isLine = _data$get2.isLine, top = _data$get2.top, left = _data$get2.left, width = _data$get2.width, height = _data$get2.height;
                var parentData = get(node.parentElement);
                var isChildOfLineNode = !isLine && parentData.isLine;
                node.style.top = "".concat(isChildOfLineNode ? top - parentData.top : top, "px");
                node.style.left = isLine ? "".concat(contentBox.left, "px") : "".concat(left - (isChildOfLineNode ? contentBox.left : 0), "px");
                node.style.height = "".concat(height, "px");
                node.style.width = isLine ? "".concat(contentBox.width, "px") : "".concat(width, "px");
                node.style.position = "absolute";
            }));
        }
        if (parent) if (nextSibling) parent.insertBefore(element, nextSibling); else parent.appendChild(element);
        return lines;
    }
    var _defaults = extend(defaults, {});
    var SplitType = function() {
        _createClass(SplitType, null, [ {
            key: "clearData",
            value: function clearData() {
                clear();
            }
        }, {
            key: "setDefaults",
            value: function setDefaults(options) {
                _defaults = extend(_defaults, parseSettings(options));
                return defaults;
            }
        }, {
            key: "revert",
            value: function revert(elements) {
                getTargetElements(elements).forEach((function(element) {
                    var _data$get = get(element), isSplit = _data$get.isSplit, html = _data$get.html, cssWidth = _data$get.cssWidth, cssHeight = _data$get.cssHeight;
                    if (isSplit) {
                        element.innerHTML = html;
                        element.style.width = cssWidth || "";
                        element.style.height = cssHeight || "";
                        remove(element);
                    }
                }));
            }
        }, {
            key: "create",
            value: function create(target, options) {
                return new SplitType(target, options);
            }
        }, {
            key: "data",
            get: function get() {
                return cache;
            }
        }, {
            key: "defaults",
            get: function get() {
                return _defaults;
            },
            set: function set(options) {
                _defaults = extend(_defaults, parseSettings(options));
            }
        } ]);
        function SplitType(elements, options) {
            _classCallCheck(this, SplitType);
            this.isSplit = false;
            this.settings = extend(_defaults, parseSettings(options));
            this.elements = getTargetElements(elements);
            this.split();
        }
        _createClass(SplitType, [ {
            key: "split",
            value: function split$1(options) {
                var _this = this;
                this.revert();
                this.elements.forEach((function(element) {
                    set(element, "html", element.innerHTML);
                }));
                this.lines = [];
                this.words = [];
                this.chars = [];
                var scrollPos = [ window.pageXOffset, window.pageYOffset ];
                if (options !== void 0) this.settings = extend(this.settings, parseSettings(options));
                var types = parseTypes(this.settings.types);
                if (types.none) return;
                this.elements.forEach((function(element) {
                    set(element, "isRoot", true);
                    var _split2 = split(element, _this.settings), words = _split2.words, chars = _split2.chars;
                    _this.words = [].concat(_toConsumableArray(_this.words), _toConsumableArray(words));
                    _this.chars = [].concat(_toConsumableArray(_this.chars), _toConsumableArray(chars));
                }));
                this.elements.forEach((function(element) {
                    if (types.lines || _this.settings.absolute) {
                        var lines = repositionAfterSplit(element, _this.settings, scrollPos);
                        _this.lines = [].concat(_toConsumableArray(_this.lines), _toConsumableArray(lines));
                    }
                }));
                this.isSplit = true;
                window.scrollTo(scrollPos[0], scrollPos[1]);
                cleanup();
            }
        }, {
            key: "revert",
            value: function revert() {
                if (this.isSplit) {
                    this.lines = null;
                    this.words = null;
                    this.chars = null;
                    this.isSplit = false;
                }
                SplitType.revert(this.elements);
            }
        } ]);
        return SplitType;
    }();
    const lenis = new Lenis({
        smooth: true,
        smoothTouch: true,
        lerp: .05,
        mouseMultiplier: 3
    });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time => {
        lenis.raf(time * 1e3);
    }));
    gsap.ticker.lagSmoothing(0);
    window.addEventListener("DOMContentLoaded", (() => {
        function updateHeroHeight() {
            const panda = document.querySelector(".hero__panda");
            const hero = document.querySelector(".hero");
            if (panda && hero) {
                const pandaHeight = panda.offsetHeight;
                hero.style.setProperty("--img-height", `${pandaHeight}px`);
            }
        }
        updateHeroHeight();
        gsap.registerPlugin(ScrollTrigger);
        gsap.registerPlugin(ScrollToPlugin);
        function initSplitType() {
            const splitElements = [ {
                selector: ".split-lines",
                options: {
                    types: "lines"
                }
            }, {
                selector: ".split-words",
                options: {
                    types: "words"
                },
                applyIndex: true
            }, {
                selector: ".split-chars",
                options: {
                    types: "chars"
                },
                applyIndex: true
            }, {
                selector: ".split-chars-span",
                options: {
                    types: "chars"
                },
                wrapSpan: true
            }, {
                selector: ".split-both",
                options: {
                    types: "lines, words"
                },
                applyIndex: true
            }, {
                selector: ".split-words.set-span",
                wrapWords: true
            } ];
            splitElements.forEach((({selector, options, applyIndex, wrapSpan, wrapWords}) => {
                const elements = document.querySelectorAll(selector);
                elements.forEach((element => {
                    const splitInstance = new SplitType(element, options);
                    if (applyIndex) {
                        const items = element.querySelectorAll(options.types.includes("words") ? ".word" : ".char");
                        items.forEach(((item, index) => item.style.setProperty("--index", index)));
                    }
                    if (wrapSpan) splitInstance.chars.forEach((char => {
                        char.innerHTML = `<span class="char-span">${char.textContent.trim()}</span>`;
                    }));
                    if (wrapWords) {
                        const words = element.querySelectorAll(".word");
                        words.forEach((word => {
                            word.innerHTML = `<span class="word-span">${word.textContent.trim()}</span>`;
                        }));
                    }
                }));
            }));
        }
        initSplitType();
        ScrollTrigger.refresh();
        let lastWidth = window.innerWidth;
        window.addEventListener("resize", (() => {
            const currentWidth = window.innerWidth;
            if (currentWidth !== lastWidth) {
                updateHeroHeight();
                initSplitType();
                createAnimation();
                ScrollTrigger.refresh();
                lastWidth = currentWidth;
            }
        }));
        document.querySelector(".header__logo");
        document.querySelector(".logo__ic");
        document.querySelector(".hero");
        const heroSecond = document.querySelector(".hero__second");
        const heroRight = document.querySelector(".hero__right");
        const decorLinesClip = document.querySelector(".lines");
        const heroTitle = document.querySelector(".title-hero");
        const countHero = document.querySelector(".hero__count");
        const servicesSection = document.querySelector(".services");
        const servicesBody = document.querySelector(".services__body");
        const servicesItems = document.querySelectorAll(".services__item");
        const navFirstItem = document.querySelectorAll(".nav-first__item");
        const navLinks = document.querySelectorAll(".nav-first__link");
        const navTitle = document.querySelectorAll(".nav-first__title span");
        const itemServices = document.querySelectorAll(".services__item .item-services");
        document.querySelector(".partners");
        document.querySelector(".partners__container");
        document.querySelector(".partners__title");
        document.querySelector(".partners__lists");
        document.querySelectorAll(".partners__list");
        document.querySelector(".advisers");
        document.querySelector(".advisers__block");
        document.querySelector(".portfolio");
        document.querySelector(".portfolio__container");
        function createAnimation() {
            ScrollTrigger.getAll().forEach((trigger => trigger.kill()));
            let mm = gsap.matchMedia();
            mm.add({
                portrait: "(orientation: portrait)",
                landscape: "(orientation: landscape)",
                landscapeMax1366: `(max-width: 85.436em) and (orientation: landscape)`,
                maxWidth488: "(max-width: 30.061em)"
            }, (context => {
                let {portrait, landscape, landscapeMax1366, maxWidth488} = context.conditions;
                if (portrait) ;
                if (landscape) {
                    const itemFirstTxt = document.querySelectorAll(".item-first__txt .word .word-span");
                    gsap.to(itemFirstTxt, {
                        y: "0%",
                        opacity: 1,
                        stagger: index => index * .05,
                        scrollTrigger: {
                            trigger: servicesSection,
                            start: "top bottom",
                            end: "80% bottom",
                            scrub: 1
                        }
                    });
                    if (navFirstItem) ;
                }
                if (landscapeMax1366) ;
                if (maxWidth488) ;
            }));
            if (heroTitle) {
                const heroTitleAline = document.querySelectorAll(".title-hero .split-chars");
                const heroTitleA = document.querySelectorAll(".title-hero__a .char");
                const heroTitleB = document.querySelectorAll(".title-hero__b .char");
                const heroTitleC = document.querySelectorAll(".title-hero__c .char");
                const heroTitleD = document.querySelectorAll(".title-hero__d .char");
                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: heroSecond,
                        start: "top top",
                        end: "+=2000",
                        scrub: 1
                    }
                });
                tl.to(heroTitleAline, {
                    y: "-100%",
                    x: "-100%",
                    stagger: .02,
                    ease: "power2.out"
                }), tl.to(heroTitleA, {
                    opacity: "0",
                    stagger: .01,
                    duration: .1,
                    ease: "power2.out"
                }, "<"), tl.to(heroTitleB, {
                    opacity: "0",
                    stagger: .01,
                    duration: .1,
                    ease: "power2.out"
                }, "<"), tl.to(heroTitleC, {
                    opacity: "0",
                    stagger: .01,
                    duration: .1,
                    ease: "power2.out"
                }, "<"), tl.to(heroTitleD, {
                    opacity: "0",
                    stagger: .01,
                    duration: .15,
                    ease: "power2.out"
                }, "<");
            }
            if (heroRight) {
                gsap.to(heroRight, {
                    opacity: 0,
                    x: "20%",
                    y: "-20%",
                    scrollTrigger: {
                        trigger: heroSecond,
                        start: "top top",
                        end: "+=1000",
                        scrub: 1.2
                    }
                });
                const tl4 = gsap.timeline({
                    scrollTrigger: {
                        trigger: heroSecond,
                        start: "top top",
                        end: "bottom top",
                        scrub: 1
                    }
                });
                tl4.to(decorLinesClip, {
                    left: 0
                });
                tl4.to(countHero, {
                    right: "-20%"
                }, "<");
            }
            if (servicesSection) {
                gsap.to(navTitle, {
                    y: 0,
                    scrollTrigger: {
                        trigger: servicesSection,
                        start: "top 60%",
                        end: "top center",
                        scrub: 1
                    }
                });
                gsap.to(navFirstItem, {
                    opacity: 1,
                    stagger: index => index * .05,
                    scrollTrigger: {
                        trigger: servicesSection,
                        start: "top center",
                        end: "80% bottom",
                        scrub: 1
                    }
                });
                navLinks.forEach((link => {
                    link.addEventListener("click", (event => {
                        event.preventDefault();
                        const targetId = link.getAttribute("data-target");
                        const targetElement = document.getElementById(targetId);
                        if (targetElement) {
                            const targetWidth = targetElement.offsetWidth;
                            const containerWidth = servicesBody.offsetWidth;
                            const offsetLeft = targetElement.offsetLeft;
                            const targetX = offsetLeft + targetWidth - containerWidth;
                            const totalScrollableWidth = servicesBody.scrollWidth - servicesBody.offsetWidth;
                            const scrollTriggerProgress = targetX / totalScrollableWidth;
                            const scrollTriggerInstance = ScrollTrigger.getById("servicesTrigger");
                            const totalScrollableHeight = scrollTriggerInstance.end - scrollTriggerInstance.start;
                            const targetScrollY = scrollTriggerInstance.start + scrollTriggerProgress * totalScrollableHeight;
                            lenis.scrollTo(targetScrollY, {
                                immediate: true
                            });
                            gsap.to(window, {
                                scrollTo: {
                                    y: targetScrollY,
                                    autoKill: false
                                },
                                onStart: () => {
                                    lenis.stop();
                                },
                                onComplete: () => {
                                    lenis.start();
                                }
                            });
                        }
                    }));
                }));
                let scrollTween = gsap.to(servicesBody, {
                    x: () => -(servicesBody.scrollWidth - servicesBody.offsetWidth),
                    ease: "none",
                    scrollTrigger: {
                        id: "servicesTrigger",
                        trigger: servicesSection,
                        start: "top 8%",
                        end: () => `+=${(servicesBody.scrollWidth - servicesBody.offsetWidth) / 1.5}`,
                        scrub: .5,
                        pin: true
                    }
                });
                servicesItems.forEach(((servicesItem, index) => {
                    const target = itemServices[index];
                    if (target) gsap.to(target, {
                        scale: 1,
                        x: 0,
                        duration: 2,
                        ease: "power2.out",
                        scrollTrigger: {
                            trigger: servicesItem,
                            containerAnimation: scrollTween,
                            start: "80% bottom",
                            end: "bottom top",
                            scrub: .5,
                            id: `item-services-${index}`
                        }
                    });
                }));
                gsap.to(servicesBody, {
                    left: "-60%",
                    ease: "none",
                    scrollTrigger: {
                        trigger: servicesSection,
                        start: () => ScrollTrigger.getById("servicesTrigger").end,
                        end: () => ScrollTrigger.getById("servicesTrigger").end + 1e3,
                        scrub: 1
                    }
                });
            }
        }
        createAnimation();
    }));
    window["FLS"] = false;
    addLoadedClass();
    menuInit();
    digitsCounter();
})();