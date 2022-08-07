(function (exports) {
    'use strict';

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    function __values(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    }

    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    }

    function __spreadArray(to, from, pack) {
        if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
            if (ar || !(i in from)) {
                if (!ar) ar = Array.prototype.slice.call(from, 0, i);
                ar[i] = from[i];
            }
        }
        return to.concat(ar || Array.prototype.slice.call(from));
    }

    function isFunction(value) {
        return typeof value === 'function';
    }

    function createErrorClass(createImpl) {
        var _super = function (instance) {
            Error.call(instance);
            instance.stack = new Error().stack;
        };
        var ctorFunc = createImpl(_super);
        ctorFunc.prototype = Object.create(Error.prototype);
        ctorFunc.prototype.constructor = ctorFunc;
        return ctorFunc;
    }

    var UnsubscriptionError = createErrorClass(function (_super) {
        return function UnsubscriptionErrorImpl(errors) {
            _super(this);
            this.message = errors
                ? errors.length + " errors occurred during unsubscription:\n" + errors.map(function (err, i) { return i + 1 + ") " + err.toString(); }).join('\n  ')
                : '';
            this.name = 'UnsubscriptionError';
            this.errors = errors;
        };
    });

    function arrRemove(arr, item) {
        if (arr) {
            var index = arr.indexOf(item);
            0 <= index && arr.splice(index, 1);
        }
    }

    var Subscription = (function () {
        function Subscription(initialTeardown) {
            this.initialTeardown = initialTeardown;
            this.closed = false;
            this._parentage = null;
            this._finalizers = null;
        }
        Subscription.prototype.unsubscribe = function () {
            var e_1, _a, e_2, _b;
            var errors;
            if (!this.closed) {
                this.closed = true;
                var _parentage = this._parentage;
                if (_parentage) {
                    this._parentage = null;
                    if (Array.isArray(_parentage)) {
                        try {
                            for (var _parentage_1 = __values(_parentage), _parentage_1_1 = _parentage_1.next(); !_parentage_1_1.done; _parentage_1_1 = _parentage_1.next()) {
                                var parent_1 = _parentage_1_1.value;
                                parent_1.remove(this);
                            }
                        }
                        catch (e_1_1) { e_1 = { error: e_1_1 }; }
                        finally {
                            try {
                                if (_parentage_1_1 && !_parentage_1_1.done && (_a = _parentage_1.return)) _a.call(_parentage_1);
                            }
                            finally { if (e_1) throw e_1.error; }
                        }
                    }
                    else {
                        _parentage.remove(this);
                    }
                }
                var initialFinalizer = this.initialTeardown;
                if (isFunction(initialFinalizer)) {
                    try {
                        initialFinalizer();
                    }
                    catch (e) {
                        errors = e instanceof UnsubscriptionError ? e.errors : [e];
                    }
                }
                var _finalizers = this._finalizers;
                if (_finalizers) {
                    this._finalizers = null;
                    try {
                        for (var _finalizers_1 = __values(_finalizers), _finalizers_1_1 = _finalizers_1.next(); !_finalizers_1_1.done; _finalizers_1_1 = _finalizers_1.next()) {
                            var finalizer = _finalizers_1_1.value;
                            try {
                                execFinalizer(finalizer);
                            }
                            catch (err) {
                                errors = errors !== null && errors !== void 0 ? errors : [];
                                if (err instanceof UnsubscriptionError) {
                                    errors = __spreadArray(__spreadArray([], __read(errors)), __read(err.errors));
                                }
                                else {
                                    errors.push(err);
                                }
                            }
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (_finalizers_1_1 && !_finalizers_1_1.done && (_b = _finalizers_1.return)) _b.call(_finalizers_1);
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                }
                if (errors) {
                    throw new UnsubscriptionError(errors);
                }
            }
        };
        Subscription.prototype.add = function (teardown) {
            var _a;
            if (teardown && teardown !== this) {
                if (this.closed) {
                    execFinalizer(teardown);
                }
                else {
                    if (teardown instanceof Subscription) {
                        if (teardown.closed || teardown._hasParent(this)) {
                            return;
                        }
                        teardown._addParent(this);
                    }
                    (this._finalizers = (_a = this._finalizers) !== null && _a !== void 0 ? _a : []).push(teardown);
                }
            }
        };
        Subscription.prototype._hasParent = function (parent) {
            var _parentage = this._parentage;
            return _parentage === parent || (Array.isArray(_parentage) && _parentage.includes(parent));
        };
        Subscription.prototype._addParent = function (parent) {
            var _parentage = this._parentage;
            this._parentage = Array.isArray(_parentage) ? (_parentage.push(parent), _parentage) : _parentage ? [_parentage, parent] : parent;
        };
        Subscription.prototype._removeParent = function (parent) {
            var _parentage = this._parentage;
            if (_parentage === parent) {
                this._parentage = null;
            }
            else if (Array.isArray(_parentage)) {
                arrRemove(_parentage, parent);
            }
        };
        Subscription.prototype.remove = function (teardown) {
            var _finalizers = this._finalizers;
            _finalizers && arrRemove(_finalizers, teardown);
            if (teardown instanceof Subscription) {
                teardown._removeParent(this);
            }
        };
        Subscription.EMPTY = (function () {
            var empty = new Subscription();
            empty.closed = true;
            return empty;
        })();
        return Subscription;
    }());
    var EMPTY_SUBSCRIPTION = Subscription.EMPTY;
    function isSubscription(value) {
        return (value instanceof Subscription ||
            (value && 'closed' in value && isFunction(value.remove) && isFunction(value.add) && isFunction(value.unsubscribe)));
    }
    function execFinalizer(finalizer) {
        if (isFunction(finalizer)) {
            finalizer();
        }
        else {
            finalizer.unsubscribe();
        }
    }

    var config = {
        onUnhandledError: null,
        onStoppedNotification: null,
        Promise: undefined,
        useDeprecatedSynchronousErrorHandling: false,
        useDeprecatedNextContext: false,
    };

    var timeoutProvider = {
        setTimeout: function (handler, timeout) {
            var args = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                args[_i - 2] = arguments[_i];
            }
            var delegate = timeoutProvider.delegate;
            if (delegate === null || delegate === void 0 ? void 0 : delegate.setTimeout) {
                return delegate.setTimeout.apply(delegate, __spreadArray([handler, timeout], __read(args)));
            }
            return setTimeout.apply(void 0, __spreadArray([handler, timeout], __read(args)));
        },
        clearTimeout: function (handle) {
            var delegate = timeoutProvider.delegate;
            return ((delegate === null || delegate === void 0 ? void 0 : delegate.clearTimeout) || clearTimeout)(handle);
        },
        delegate: undefined,
    };

    function reportUnhandledError(err) {
        timeoutProvider.setTimeout(function () {
            {
                throw err;
            }
        });
    }

    function noop() { }

    var context = null;
    function errorContext(cb) {
        if (config.useDeprecatedSynchronousErrorHandling) {
            var isRoot = !context;
            if (isRoot) {
                context = { errorThrown: false, error: null };
            }
            cb();
            if (isRoot) {
                var _a = context, errorThrown = _a.errorThrown, error = _a.error;
                context = null;
                if (errorThrown) {
                    throw error;
                }
            }
        }
        else {
            cb();
        }
    }

    var Subscriber = (function (_super) {
        __extends(Subscriber, _super);
        function Subscriber(destination) {
            var _this = _super.call(this) || this;
            _this.isStopped = false;
            if (destination) {
                _this.destination = destination;
                if (isSubscription(destination)) {
                    destination.add(_this);
                }
            }
            else {
                _this.destination = EMPTY_OBSERVER;
            }
            return _this;
        }
        Subscriber.create = function (next, error, complete) {
            return new SafeSubscriber(next, error, complete);
        };
        Subscriber.prototype.next = function (value) {
            if (this.isStopped) ;
            else {
                this._next(value);
            }
        };
        Subscriber.prototype.error = function (err) {
            if (this.isStopped) ;
            else {
                this.isStopped = true;
                this._error(err);
            }
        };
        Subscriber.prototype.complete = function () {
            if (this.isStopped) ;
            else {
                this.isStopped = true;
                this._complete();
            }
        };
        Subscriber.prototype.unsubscribe = function () {
            if (!this.closed) {
                this.isStopped = true;
                _super.prototype.unsubscribe.call(this);
                this.destination = null;
            }
        };
        Subscriber.prototype._next = function (value) {
            this.destination.next(value);
        };
        Subscriber.prototype._error = function (err) {
            try {
                this.destination.error(err);
            }
            finally {
                this.unsubscribe();
            }
        };
        Subscriber.prototype._complete = function () {
            try {
                this.destination.complete();
            }
            finally {
                this.unsubscribe();
            }
        };
        return Subscriber;
    }(Subscription));
    var _bind = Function.prototype.bind;
    function bind(fn, thisArg) {
        return _bind.call(fn, thisArg);
    }
    var ConsumerObserver = (function () {
        function ConsumerObserver(partialObserver) {
            this.partialObserver = partialObserver;
        }
        ConsumerObserver.prototype.next = function (value) {
            var partialObserver = this.partialObserver;
            if (partialObserver.next) {
                try {
                    partialObserver.next(value);
                }
                catch (error) {
                    handleUnhandledError(error);
                }
            }
        };
        ConsumerObserver.prototype.error = function (err) {
            var partialObserver = this.partialObserver;
            if (partialObserver.error) {
                try {
                    partialObserver.error(err);
                }
                catch (error) {
                    handleUnhandledError(error);
                }
            }
            else {
                handleUnhandledError(err);
            }
        };
        ConsumerObserver.prototype.complete = function () {
            var partialObserver = this.partialObserver;
            if (partialObserver.complete) {
                try {
                    partialObserver.complete();
                }
                catch (error) {
                    handleUnhandledError(error);
                }
            }
        };
        return ConsumerObserver;
    }());
    var SafeSubscriber = (function (_super) {
        __extends(SafeSubscriber, _super);
        function SafeSubscriber(observerOrNext, error, complete) {
            var _this = _super.call(this) || this;
            var partialObserver;
            if (isFunction(observerOrNext) || !observerOrNext) {
                partialObserver = {
                    next: (observerOrNext !== null && observerOrNext !== void 0 ? observerOrNext : undefined),
                    error: error !== null && error !== void 0 ? error : undefined,
                    complete: complete !== null && complete !== void 0 ? complete : undefined,
                };
            }
            else {
                var context_1;
                if (_this && config.useDeprecatedNextContext) {
                    context_1 = Object.create(observerOrNext);
                    context_1.unsubscribe = function () { return _this.unsubscribe(); };
                    partialObserver = {
                        next: observerOrNext.next && bind(observerOrNext.next, context_1),
                        error: observerOrNext.error && bind(observerOrNext.error, context_1),
                        complete: observerOrNext.complete && bind(observerOrNext.complete, context_1),
                    };
                }
                else {
                    partialObserver = observerOrNext;
                }
            }
            _this.destination = new ConsumerObserver(partialObserver);
            return _this;
        }
        return SafeSubscriber;
    }(Subscriber));
    function handleUnhandledError(error) {
        {
            reportUnhandledError(error);
        }
    }
    function defaultErrorHandler(err) {
        throw err;
    }
    var EMPTY_OBSERVER = {
        closed: true,
        next: noop,
        error: defaultErrorHandler,
        complete: noop,
    };

    var observable = (function () { return (typeof Symbol === 'function' && Symbol.observable) || '@@observable'; })();

    function identity(x) {
        return x;
    }

    function pipeFromArray(fns) {
        if (fns.length === 0) {
            return identity;
        }
        if (fns.length === 1) {
            return fns[0];
        }
        return function piped(input) {
            return fns.reduce(function (prev, fn) { return fn(prev); }, input);
        };
    }

    var Observable = (function () {
        function Observable(subscribe) {
            if (subscribe) {
                this._subscribe = subscribe;
            }
        }
        Observable.prototype.lift = function (operator) {
            var observable = new Observable();
            observable.source = this;
            observable.operator = operator;
            return observable;
        };
        Observable.prototype.subscribe = function (observerOrNext, error, complete) {
            var _this = this;
            var subscriber = isSubscriber(observerOrNext) ? observerOrNext : new SafeSubscriber(observerOrNext, error, complete);
            errorContext(function () {
                var _a = _this, operator = _a.operator, source = _a.source;
                subscriber.add(operator
                    ?
                        operator.call(subscriber, source)
                    : source
                        ?
                            _this._subscribe(subscriber)
                        :
                            _this._trySubscribe(subscriber));
            });
            return subscriber;
        };
        Observable.prototype._trySubscribe = function (sink) {
            try {
                return this._subscribe(sink);
            }
            catch (err) {
                sink.error(err);
            }
        };
        Observable.prototype.forEach = function (next, promiseCtor) {
            var _this = this;
            promiseCtor = getPromiseCtor(promiseCtor);
            return new promiseCtor(function (resolve, reject) {
                var subscriber = new SafeSubscriber({
                    next: function (value) {
                        try {
                            next(value);
                        }
                        catch (err) {
                            reject(err);
                            subscriber.unsubscribe();
                        }
                    },
                    error: reject,
                    complete: resolve,
                });
                _this.subscribe(subscriber);
            });
        };
        Observable.prototype._subscribe = function (subscriber) {
            var _a;
            return (_a = this.source) === null || _a === void 0 ? void 0 : _a.subscribe(subscriber);
        };
        Observable.prototype[observable] = function () {
            return this;
        };
        Observable.prototype.pipe = function () {
            var operations = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                operations[_i] = arguments[_i];
            }
            return pipeFromArray(operations)(this);
        };
        Observable.prototype.toPromise = function (promiseCtor) {
            var _this = this;
            promiseCtor = getPromiseCtor(promiseCtor);
            return new promiseCtor(function (resolve, reject) {
                var value;
                _this.subscribe(function (x) { return (value = x); }, function (err) { return reject(err); }, function () { return resolve(value); });
            });
        };
        Observable.create = function (subscribe) {
            return new Observable(subscribe);
        };
        return Observable;
    }());
    function getPromiseCtor(promiseCtor) {
        var _a;
        return (_a = promiseCtor !== null && promiseCtor !== void 0 ? promiseCtor : config.Promise) !== null && _a !== void 0 ? _a : Promise;
    }
    function isObserver(value) {
        return value && isFunction(value.next) && isFunction(value.error) && isFunction(value.complete);
    }
    function isSubscriber(value) {
        return (value && value instanceof Subscriber) || (isObserver(value) && isSubscription(value));
    }

    function hasLift(source) {
        return isFunction(source === null || source === void 0 ? void 0 : source.lift);
    }
    function operate(init) {
        return function (source) {
            if (hasLift(source)) {
                return source.lift(function (liftedSource) {
                    try {
                        return init(liftedSource, this);
                    }
                    catch (err) {
                        this.error(err);
                    }
                });
            }
            throw new TypeError('Unable to lift unknown Observable type');
        };
    }

    function createOperatorSubscriber(destination, onNext, onComplete, onError, onFinalize) {
        return new OperatorSubscriber(destination, onNext, onComplete, onError, onFinalize);
    }
    var OperatorSubscriber = (function (_super) {
        __extends(OperatorSubscriber, _super);
        function OperatorSubscriber(destination, onNext, onComplete, onError, onFinalize, shouldUnsubscribe) {
            var _this = _super.call(this, destination) || this;
            _this.onFinalize = onFinalize;
            _this.shouldUnsubscribe = shouldUnsubscribe;
            _this._next = onNext
                ? function (value) {
                    try {
                        onNext(value);
                    }
                    catch (err) {
                        destination.error(err);
                    }
                }
                : _super.prototype._next;
            _this._error = onError
                ? function (err) {
                    try {
                        onError(err);
                    }
                    catch (err) {
                        destination.error(err);
                    }
                    finally {
                        this.unsubscribe();
                    }
                }
                : _super.prototype._error;
            _this._complete = onComplete
                ? function () {
                    try {
                        onComplete();
                    }
                    catch (err) {
                        destination.error(err);
                    }
                    finally {
                        this.unsubscribe();
                    }
                }
                : _super.prototype._complete;
            return _this;
        }
        OperatorSubscriber.prototype.unsubscribe = function () {
            var _a;
            if (!this.shouldUnsubscribe || this.shouldUnsubscribe()) {
                var closed_1 = this.closed;
                _super.prototype.unsubscribe.call(this);
                !closed_1 && ((_a = this.onFinalize) === null || _a === void 0 ? void 0 : _a.call(this));
            }
        };
        return OperatorSubscriber;
    }(Subscriber));

    var ObjectUnsubscribedError = createErrorClass(function (_super) {
        return function ObjectUnsubscribedErrorImpl() {
            _super(this);
            this.name = 'ObjectUnsubscribedError';
            this.message = 'object unsubscribed';
        };
    });

    var Subject = (function (_super) {
        __extends(Subject, _super);
        function Subject() {
            var _this = _super.call(this) || this;
            _this.closed = false;
            _this.currentObservers = null;
            _this.observers = [];
            _this.isStopped = false;
            _this.hasError = false;
            _this.thrownError = null;
            return _this;
        }
        Subject.prototype.lift = function (operator) {
            var subject = new AnonymousSubject(this, this);
            subject.operator = operator;
            return subject;
        };
        Subject.prototype._throwIfClosed = function () {
            if (this.closed) {
                throw new ObjectUnsubscribedError();
            }
        };
        Subject.prototype.next = function (value) {
            var _this = this;
            errorContext(function () {
                var e_1, _a;
                _this._throwIfClosed();
                if (!_this.isStopped) {
                    if (!_this.currentObservers) {
                        _this.currentObservers = Array.from(_this.observers);
                    }
                    try {
                        for (var _b = __values(_this.currentObservers), _c = _b.next(); !_c.done; _c = _b.next()) {
                            var observer = _c.value;
                            observer.next(value);
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                }
            });
        };
        Subject.prototype.error = function (err) {
            var _this = this;
            errorContext(function () {
                _this._throwIfClosed();
                if (!_this.isStopped) {
                    _this.hasError = _this.isStopped = true;
                    _this.thrownError = err;
                    var observers = _this.observers;
                    while (observers.length) {
                        observers.shift().error(err);
                    }
                }
            });
        };
        Subject.prototype.complete = function () {
            var _this = this;
            errorContext(function () {
                _this._throwIfClosed();
                if (!_this.isStopped) {
                    _this.isStopped = true;
                    var observers = _this.observers;
                    while (observers.length) {
                        observers.shift().complete();
                    }
                }
            });
        };
        Subject.prototype.unsubscribe = function () {
            this.isStopped = this.closed = true;
            this.observers = this.currentObservers = null;
        };
        Object.defineProperty(Subject.prototype, "observed", {
            get: function () {
                var _a;
                return ((_a = this.observers) === null || _a === void 0 ? void 0 : _a.length) > 0;
            },
            enumerable: false,
            configurable: true
        });
        Subject.prototype._trySubscribe = function (subscriber) {
            this._throwIfClosed();
            return _super.prototype._trySubscribe.call(this, subscriber);
        };
        Subject.prototype._subscribe = function (subscriber) {
            this._throwIfClosed();
            this._checkFinalizedStatuses(subscriber);
            return this._innerSubscribe(subscriber);
        };
        Subject.prototype._innerSubscribe = function (subscriber) {
            var _this = this;
            var _a = this, hasError = _a.hasError, isStopped = _a.isStopped, observers = _a.observers;
            if (hasError || isStopped) {
                return EMPTY_SUBSCRIPTION;
            }
            this.currentObservers = null;
            observers.push(subscriber);
            return new Subscription(function () {
                _this.currentObservers = null;
                arrRemove(observers, subscriber);
            });
        };
        Subject.prototype._checkFinalizedStatuses = function (subscriber) {
            var _a = this, hasError = _a.hasError, thrownError = _a.thrownError, isStopped = _a.isStopped;
            if (hasError) {
                subscriber.error(thrownError);
            }
            else if (isStopped) {
                subscriber.complete();
            }
        };
        Subject.prototype.asObservable = function () {
            var observable = new Observable();
            observable.source = this;
            return observable;
        };
        Subject.create = function (destination, source) {
            return new AnonymousSubject(destination, source);
        };
        return Subject;
    }(Observable));
    var AnonymousSubject = (function (_super) {
        __extends(AnonymousSubject, _super);
        function AnonymousSubject(destination, source) {
            var _this = _super.call(this) || this;
            _this.destination = destination;
            _this.source = source;
            return _this;
        }
        AnonymousSubject.prototype.next = function (value) {
            var _a, _b;
            (_b = (_a = this.destination) === null || _a === void 0 ? void 0 : _a.next) === null || _b === void 0 ? void 0 : _b.call(_a, value);
        };
        AnonymousSubject.prototype.error = function (err) {
            var _a, _b;
            (_b = (_a = this.destination) === null || _a === void 0 ? void 0 : _a.error) === null || _b === void 0 ? void 0 : _b.call(_a, err);
        };
        AnonymousSubject.prototype.complete = function () {
            var _a, _b;
            (_b = (_a = this.destination) === null || _a === void 0 ? void 0 : _a.complete) === null || _b === void 0 ? void 0 : _b.call(_a);
        };
        AnonymousSubject.prototype._subscribe = function (subscriber) {
            var _a, _b;
            return (_b = (_a = this.source) === null || _a === void 0 ? void 0 : _a.subscribe(subscriber)) !== null && _b !== void 0 ? _b : EMPTY_SUBSCRIPTION;
        };
        return AnonymousSubject;
    }(Subject));

    function map(project, thisArg) {
        return operate(function (source, subscriber) {
            var index = 0;
            source.subscribe(createOperatorSubscriber(subscriber, function (value) {
                subscriber.next(project.call(thisArg, value, index++));
            }));
        });
    }

    // Copyright (c) .NET Foundation and contributors. All rights reserved.
    function isKernelCommandEnvelope(commandOrEvent) {
        return commandOrEvent.commandType !== undefined;
    }
    function isKernelEventEnvelope(commandOrEvent) {
        return commandOrEvent.eventType !== undefined;
    }
    class KernelCommandAndEventReceiver {
        constructor(observer) {
            this._disposables = [];
            this._observable = observer;
        }
        subscribe(observer) {
            return this._observable.subscribe(observer);
        }
        dispose() {
            for (let disposable of this._disposables) {
                disposable.dispose();
            }
        }
        static FromObservable(observable) {
            return new KernelCommandAndEventReceiver(observable);
        }
        static FromEventListener(args) {
            let subject = new Subject();
            args.eventTarget.addEventListener(args.event, (e) => {
                let mapped = args.map(e);
                subject.next(mapped);
            });
            return new KernelCommandAndEventReceiver(subject);
        }
    }
    function isObservable(source) {
        return source.next !== undefined;
    }
    class KernelCommandAndEventSender {
        constructor(remoteHostUri) {
            this._remoteHostUri = remoteHostUri;
        }
        send(kernelCommandOrEventEnvelope) {
            if (this._sender) {
                try {
                    if (typeof this._sender === "function") {
                        this._sender(kernelCommandOrEventEnvelope);
                    }
                    else if (isObservable(this._sender)) {
                        this._sender.next(kernelCommandOrEventEnvelope);
                    }
                    else {
                        return Promise.reject(new Error("Sender is not set"));
                    }
                }
                catch (error) {
                    return Promise.reject(error);
                }
                return Promise.resolve();
            }
            return Promise.reject(new Error("Sender is not set"));
        }
        get remoteHostUri() {
            return this._remoteHostUri;
        }
        static FromObserver(observer) {
            const sender = new KernelCommandAndEventSender("");
            sender._sender = observer;
            return sender;
        }
        static FromFunction(send) {
            const sender = new KernelCommandAndEventSender("");
            sender._sender = send;
            return sender;
        }
    }
    function tryAddUriToRoutingSlip(kernelCommandOrEventEnvelope, kernelUri) {
        if (kernelCommandOrEventEnvelope.routingSlip === undefined || kernelCommandOrEventEnvelope.routingSlip === null) {
            kernelCommandOrEventEnvelope.routingSlip = [];
        }
        var canAdd = !kernelCommandOrEventEnvelope.routingSlip.find(e => e === kernelUri);
        if (canAdd) {
            kernelCommandOrEventEnvelope.routingSlip.push(kernelUri);
            kernelCommandOrEventEnvelope.routingSlip; //?
        }
        return canAdd;
    }

    // Copyright (c) .NET Foundation and contributors. All rights reserved.
    const RequestKernelInfoType = "RequestKernelInfo";
    const RequestValueType = "RequestValue";
    const RequestValueInfosType = "RequestValueInfos";
    const SubmitCodeType = "SubmitCode";
    const CodeSubmissionReceivedType = "CodeSubmissionReceived";
    const CommandFailedType = "CommandFailed";
    const CommandSucceededType = "CommandSucceeded";
    const DisplayedValueProducedType = "DisplayedValueProduced";
    const KernelInfoProducedType = "KernelInfoProduced";
    const KernelReadyType = "KernelReady";
    const ReturnValueProducedType = "ReturnValueProduced";
    const ValueInfosProducedType = "ValueInfosProduced";
    const ValueProducedType = "ValueProduced";
    var InsertTextFormat;
    (function (InsertTextFormat) {
        InsertTextFormat["PlainText"] = "plaintext";
        InsertTextFormat["Snippet"] = "snippet";
    })(InsertTextFormat || (InsertTextFormat = {}));
    var DiagnosticSeverity;
    (function (DiagnosticSeverity) {
        DiagnosticSeverity["Hidden"] = "hidden";
        DiagnosticSeverity["Info"] = "info";
        DiagnosticSeverity["Warning"] = "warning";
        DiagnosticSeverity["Error"] = "error";
    })(DiagnosticSeverity || (DiagnosticSeverity = {}));
    var DocumentSerializationType;
    (function (DocumentSerializationType) {
        DocumentSerializationType["Dib"] = "dib";
        DocumentSerializationType["Ipynb"] = "ipynb";
    })(DocumentSerializationType || (DocumentSerializationType = {}));
    var RequestType;
    (function (RequestType) {
        RequestType["Parse"] = "parse";
        RequestType["Serialize"] = "serialize";
    })(RequestType || (RequestType = {}));
    var SubmissionType;
    (function (SubmissionType) {
        SubmissionType["Run"] = "run";
        SubmissionType["Diagnose"] = "diagnose";
    })(SubmissionType || (SubmissionType = {}));

    // Copyright (c) .NET Foundation and contributors. All rights reserved.
    class PromiseCompletionSource {
        constructor() {
            this._resolve = () => { };
            this._reject = () => { };
            this.promise = new Promise((resolve, reject) => {
                this._resolve = resolve;
                this._reject = reject;
            });
        }
        resolve(value) {
            this._resolve(value);
        }
        reject(reason) {
            this._reject(reason);
        }
    }

    // Copyright (c) .NET Foundation and contributors. All rights reserved.
    class KernelInvocationContext {
        constructor(kernelCommandInvocation) {
            this._childCommands = [];
            this._eventSubject = new Subject();
            this._isComplete = false;
            this._handlingKernel = null;
            this.completionSource = new PromiseCompletionSource();
            this._commandEnvelope = kernelCommandInvocation;
        }
        get promise() {
            return this.completionSource.promise;
        }
        get handlingKernel() {
            return this._handlingKernel;
        }
        ;
        get kernelEvents() {
            return this._eventSubject.asObservable();
        }
        ;
        set handlingKernel(value) {
            this._handlingKernel = value;
        }
        static establish(kernelCommandInvocation) {
            let current = KernelInvocationContext._current;
            if (!current || current._isComplete) {
                KernelInvocationContext._current = new KernelInvocationContext(kernelCommandInvocation);
            }
            else {
                if (!areCommandsTheSame(kernelCommandInvocation, current._commandEnvelope)) {
                    const found = current._childCommands.includes(kernelCommandInvocation);
                    if (!found) {
                        current._childCommands.push(kernelCommandInvocation);
                    }
                }
            }
            return KernelInvocationContext._current;
        }
        static get current() { return this._current; }
        get command() { return this._commandEnvelope.command; }
        get commandEnvelope() { return this._commandEnvelope; }
        complete(command) {
            if (command === this._commandEnvelope) {
                this._isComplete = true;
                let succeeded = {};
                let eventEnvelope = {
                    command: this._commandEnvelope,
                    eventType: CommandSucceededType,
                    event: succeeded
                };
                this.internalPublish(eventEnvelope);
                this.completionSource.resolve();
                // TODO: C# version has completion callbacks - do we need these?
                // if (!_events.IsDisposed)
                // {
                //     _events.OnCompleted();
                // }
            }
            else {
                let pos = this._childCommands.indexOf(command);
                delete this._childCommands[pos];
            }
        }
        fail(message) {
            // TODO:
            // The C# code accepts a message and/or an exception. Do we need to add support
            // for exceptions? (The TS CommandFailed interface doesn't have a place for it right now.)
            this._isComplete = true;
            let failed = { message: message !== null && message !== void 0 ? message : "Command Failed" };
            let eventEnvelope = {
                command: this._commandEnvelope,
                eventType: CommandFailedType,
                event: failed
            };
            this.internalPublish(eventEnvelope);
            this.completionSource.resolve();
        }
        publish(kernelEvent) {
            if (!this._isComplete) {
                this.internalPublish(kernelEvent);
            }
        }
        internalPublish(kernelEvent) {
            if (!kernelEvent.command) {
                kernelEvent.command = this._commandEnvelope;
            }
            let command = kernelEvent.command;
            if (this.handlingKernel) {
                tryAddUriToRoutingSlip(kernelEvent, getKernelUri(this.handlingKernel));
                kernelEvent.routingSlip; //?
            }
            this._commandEnvelope; //?
            if (command === null ||
                command === undefined ||
                areCommandsTheSame(command, this._commandEnvelope) ||
                this._childCommands.includes(command)) {
                this._eventSubject.next(kernelEvent);
            }
        }
        isParentOfCommand(commandEnvelope) {
            const childFound = this._childCommands.includes(commandEnvelope);
            return childFound;
        }
        dispose() {
            if (!this._isComplete) {
                this.complete(this._commandEnvelope);
            }
            KernelInvocationContext._current = null;
        }
    }
    KernelInvocationContext._current = null;
    function areCommandsTheSame(envelope1, envelope2) {
        return envelope1 === envelope2
            || ((envelope1 === null || envelope1 === void 0 ? void 0 : envelope1.commandType) === (envelope2 === null || envelope2 === void 0 ? void 0 : envelope2.commandType) && (envelope1 === null || envelope1 === void 0 ? void 0 : envelope1.token) === (envelope2 === null || envelope2 === void 0 ? void 0 : envelope2.token));
    }

    // Copyright (c) .NET Foundation and contributors. All rights reserved.
    // Licensed under the MIT license. See LICENSE file in the project root for full license information.
    class Guid {
        constructor(guid) {
            if (!guid) {
                throw new TypeError("Invalid argument; `value` has no value.");
            }
            this.value = Guid.EMPTY;
            if (guid && Guid.isGuid(guid)) {
                this.value = guid;
            }
        }
        static isGuid(guid) {
            const value = guid.toString();
            return guid && (guid instanceof Guid || Guid.validator.test(value));
        }
        static create() {
            return new Guid([Guid.gen(2), Guid.gen(1), Guid.gen(1), Guid.gen(1), Guid.gen(3)].join("-"));
        }
        static createEmpty() {
            return new Guid("emptyguid");
        }
        static parse(guid) {
            return new Guid(guid);
        }
        static raw() {
            return [Guid.gen(2), Guid.gen(1), Guid.gen(1), Guid.gen(1), Guid.gen(3)].join("-");
        }
        static gen(count) {
            let out = "";
            for (let i = 0; i < count; i++) {
                // tslint:disable-next-line:no-bitwise
                out += (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
            }
            return out;
        }
        equals(other) {
            // Comparing string `value` against provided `guid` will auto-call
            // toString on `guid` for comparison
            return Guid.isGuid(other) && this.value === other.toString();
        }
        isEmpty() {
            return this.value === Guid.EMPTY;
        }
        toString() {
            return this.value;
        }
        toJSON() {
            return {
                value: this.value,
            };
        }
    }
    Guid.validator = new RegExp("^[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}$", "i");
    Guid.EMPTY = "00000000-0000-0000-0000-000000000000";
    class TokenGenerator {
        constructor() {
            this._seed = Guid.create().toString();
            this._counter = 0;
        }
        GetNewToken() {
            this._counter++;
            return `${this._seed}::${this._counter}`;
        }
    }

    // Copyright (c) .NET Foundation and contributors. All rights reserved.
    // Licensed under the MIT license. See LICENSE file in the project root for full license information.
    var LogLevel;
    (function (LogLevel) {
        LogLevel[LogLevel["Info"] = 0] = "Info";
        LogLevel[LogLevel["Warn"] = 1] = "Warn";
        LogLevel[LogLevel["Error"] = 2] = "Error";
        LogLevel[LogLevel["None"] = 3] = "None";
    })(LogLevel || (LogLevel = {}));
    class Logger {
        constructor(source, write) {
            this.source = source;
            this.write = write;
        }
        info(message) {
            this.write({ logLevel: LogLevel.Info, source: this.source, message });
        }
        warn(message) {
            this.write({ logLevel: LogLevel.Warn, source: this.source, message });
        }
        error(message) {
            this.write({ logLevel: LogLevel.Error, source: this.source, message });
        }
        static configure(source, writer) {
            const logger = new Logger(source, writer);
            Logger._default = logger;
        }
        static get default() {
            if (Logger._default) {
                return Logger._default;
            }
            throw new Error('No logger has been configured for this context');
        }
    }
    Logger._default = new Logger('default', (_entry) => { });

    // Copyright (c) .NET Foundation and contributors. All rights reserved.
    class KernelScheduler {
        constructor() {
            this.operationQueue = [];
        }
        runAsync(value, executor) {
            const operation = {
                value,
                executor,
                promiseCompletionSource: new PromiseCompletionSource(),
            };
            if (this.inFlightOperation) {
                // invoke immediately
                return operation.executor(operation.value)
                    .then(() => {
                    operation.promiseCompletionSource.resolve();
                })
                    .catch(e => {
                    operation.promiseCompletionSource.reject(e);
                });
            }
            this.operationQueue.push(operation);
            if (this.operationQueue.length === 1) {
                this.executeNextCommand();
            }
            return operation.promiseCompletionSource.promise;
        }
        executeNextCommand() {
            const nextOperation = this.operationQueue.length > 0 ? this.operationQueue[0] : undefined;
            if (nextOperation) {
                this.inFlightOperation = nextOperation;
                nextOperation.executor(nextOperation.value)
                    .then(() => {
                    this.inFlightOperation = undefined;
                    nextOperation.promiseCompletionSource.resolve();
                })
                    .catch(e => {
                    this.inFlightOperation = undefined;
                    nextOperation.promiseCompletionSource.reject(e);
                })
                    .finally(() => {
                    this.operationQueue.shift();
                    this.executeNextCommand();
                });
            }
        }
    }

    // Copyright (c) .NET Foundation and contributors. All rights reserved.
    var KernelType;
    (function (KernelType) {
        KernelType[KernelType["composite"] = 0] = "composite";
        KernelType[KernelType["proxy"] = 1] = "proxy";
        KernelType[KernelType["default"] = 2] = "default";
    })(KernelType || (KernelType = {}));
    class Kernel {
        constructor(name, languageName, languageVersion) {
            this.name = name;
            this._commandHandlers = new Map();
            this._eventSubject = new Subject();
            this._tokenGenerator = new TokenGenerator();
            this.rootKernel = this;
            this.parentKernel = null;
            this._scheduler = null;
            this._kernelType = KernelType.default;
            this._kernelInfo = {
                localName: name,
                languageName: languageName,
                aliases: [],
                languageVersion: languageVersion,
                supportedDirectives: [],
                supportedKernelCommands: []
            };
            this.registerCommandHandler({
                commandType: RequestKernelInfoType, handle: (invocation) => __awaiter(this, void 0, void 0, function* () {
                    yield this.handleRequestKernelInfo(invocation);
                })
            });
        }
        get kernelInfo() {
            return this._kernelInfo;
        }
        get kernelType() {
            return this._kernelType;
        }
        set kernelType(value) {
            this._kernelType = value;
        }
        get kernelEvents() {
            return this._eventSubject.asObservable();
        }
        handleRequestKernelInfo(invocation) {
            return __awaiter(this, void 0, void 0, function* () {
                const eventEnvelope = {
                    eventType: KernelInfoProducedType,
                    command: invocation.commandEnvelope,
                    event: { kernelInfo: this._kernelInfo }
                }; //?
                invocation.context.publish(eventEnvelope);
                return Promise.resolve();
            });
        }
        getScheduler() {
            var _a, _b;
            if (!this._scheduler) {
                this._scheduler = (_b = (_a = this.parentKernel) === null || _a === void 0 ? void 0 : _a.getScheduler()) !== null && _b !== void 0 ? _b : new KernelScheduler();
            }
            return this._scheduler;
        }
        ensureCommandTokenAndId(commandEnvelope) {
            var _a;
            if (!commandEnvelope.token) {
                let nextToken = this._tokenGenerator.GetNewToken();
                if ((_a = KernelInvocationContext.current) === null || _a === void 0 ? void 0 : _a.commandEnvelope) {
                    // a parent command exists, create a token hierarchy
                    nextToken = KernelInvocationContext.current.commandEnvelope.token;
                }
                commandEnvelope.token = nextToken;
            }
            if (!commandEnvelope.id) {
                commandEnvelope.id = Guid.create().toString();
            }
        }
        static get current() {
            if (KernelInvocationContext.current) {
                return KernelInvocationContext.current.handlingKernel;
            }
            return null;
        }
        static get root() {
            if (Kernel.current) {
                return Kernel.current.rootKernel;
            }
            return null;
        }
        // Is it worth us going to efforts to ensure that the Promise returned here accurately reflects
        // the command's progress? The only thing that actually calls this is the kernel channel, through
        // the callback set up by attachKernelToChannel, and the callback is expected to return void, so
        // nothing is ever going to look at the promise we return here.
        send(commandEnvelope) {
            return __awaiter(this, void 0, void 0, function* () {
                this.ensureCommandTokenAndId(commandEnvelope);
                tryAddUriToRoutingSlip(commandEnvelope, getKernelUri(this));
                commandEnvelope.routingSlip; //?
                let context = KernelInvocationContext.establish(commandEnvelope);
                this.getScheduler().runAsync(commandEnvelope, (value) => this.executeCommand(value));
                return context.promise;
            });
        }
        executeCommand(commandEnvelope) {
            return __awaiter(this, void 0, void 0, function* () {
                let context = KernelInvocationContext.establish(commandEnvelope);
                let previousHandlingKernel = context.handlingKernel;
                try {
                    yield this.handleCommand(commandEnvelope);
                }
                catch (e) {
                    context.fail((e === null || e === void 0 ? void 0 : e.message) || JSON.stringify(e));
                }
                finally {
                    context.handlingKernel = previousHandlingKernel;
                }
            });
        }
        getCommandHandler(commandType) {
            return this._commandHandlers.get(commandType);
        }
        handleCommand(commandEnvelope) {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let context = KernelInvocationContext.establish(commandEnvelope);
                const previoudHendlingKernel = context.handlingKernel;
                context.handlingKernel = this;
                let isRootCommand = areCommandsTheSame(context.commandEnvelope, commandEnvelope);
                let eventSubscription = undefined; //?
                if (isRootCommand) {
                    this.name; //?
                    Logger.default.info(`kernel ${this.name} of type ${KernelType[this.kernelType]} subscribing to context events`);
                    eventSubscription = context.kernelEvents.pipe(map(e => {
                        var _a;
                        const message = `kernel ${this.name} of type ${KernelType[this.kernelType]} saw event ${e.eventType} with token ${(_a = e.command) === null || _a === void 0 ? void 0 : _a.token}`;
                        Logger.default.info(message);
                        tryAddUriToRoutingSlip(e, getKernelUri(this));
                        return e;
                    }))
                        .subscribe(this.publishEvent.bind(this));
                }
                let handler = this.getCommandHandler(commandEnvelope.commandType);
                if (handler) {
                    try {
                        Logger.default.info(`kernel ${this.name} about to handle command: ${JSON.stringify(commandEnvelope)}`);
                        yield handler.handle({ commandEnvelope: commandEnvelope, context });
                        context.complete(commandEnvelope);
                        context.handlingKernel = previoudHendlingKernel;
                        if (isRootCommand) {
                            eventSubscription === null || eventSubscription === void 0 ? void 0 : eventSubscription.unsubscribe();
                            context.dispose();
                        }
                        Logger.default.info(`kernel ${this.name} done handling command: ${JSON.stringify(commandEnvelope)}`);
                        resolve();
                    }
                    catch (e) {
                        context.fail((e === null || e === void 0 ? void 0 : e.message) || JSON.stringify(e));
                        context.handlingKernel = previoudHendlingKernel;
                        if (isRootCommand) {
                            eventSubscription === null || eventSubscription === void 0 ? void 0 : eventSubscription.unsubscribe();
                            context.dispose();
                        }
                        reject(e);
                    }
                }
                else {
                    context.handlingKernel = previoudHendlingKernel;
                    if (isRootCommand) {
                        eventSubscription === null || eventSubscription === void 0 ? void 0 : eventSubscription.unsubscribe();
                        context.dispose();
                    }
                    reject(new Error(`No handler found for command type ${commandEnvelope.commandType}`));
                }
            }));
        }
        subscribeToKernelEvents(observer) {
            const sub = this._eventSubject.subscribe(observer);
            return {
                dispose: () => { sub.unsubscribe(); }
            };
        }
        canHandle(commandEnvelope) {
            if (commandEnvelope.command.targetKernelName && commandEnvelope.command.targetKernelName !== this.name) {
                return false;
            }
            if (commandEnvelope.command.destinationUri) {
                if (this.kernelInfo.uri !== commandEnvelope.command.destinationUri) {
                    return false;
                }
            }
            return this.supportsCommand(commandEnvelope.commandType);
        }
        supportsCommand(commandType) {
            return this._commandHandlers.has(commandType);
        }
        registerCommandHandler(handler) {
            // When a registration already existed, we want to overwrite it because we want users to
            // be able to develop handlers iteratively, and it would be unhelpful for handler registration
            // for any particular command to be cumulative.
            this._commandHandlers.set(handler.commandType, handler);
            this._kernelInfo.supportedKernelCommands = Array.from(this._commandHandlers.keys()).map(commandName => ({ name: commandName }));
        }
        getHandlingKernel(commandEnvelope, context) {
            if (this.canHandle(commandEnvelope)) {
                return this;
            }
            else {
                context === null || context === void 0 ? void 0 : context.fail(`Command ${commandEnvelope.commandType} is not supported by Kernel ${this.name}`);
                return null;
            }
        }
        publishEvent(kernelEvent) {
            this._eventSubject.next(kernelEvent);
        }
    }
    function getKernelUri(kernel) {
        var _a;
        return (_a = kernel.kernelInfo.uri) !== null && _a !== void 0 ? _a : `kernel://local/${kernel.kernelInfo.localName}`;
    }

    // Copyright (c) .NET Foundation and contributors. All rights reserved.
    class CompositeKernel extends Kernel {
        constructor(name) {
            super(name);
            this._host = null;
            this._defaultKernelNamesByCommandType = new Map();
            this.kernelType = KernelType.composite;
            this._childKernels = new KernelCollection(this);
        }
        get childKernels() {
            return Array.from(this._childKernels);
        }
        get host() {
            return this._host;
        }
        set host(host) {
            this._host = host;
            if (this._host) {
                this.kernelInfo.uri = this._host.uri;
                this._childKernels.notifyThatHostWasSet();
            }
        }
        handleRequestKernelInfo(invocation) {
            return __awaiter(this, void 0, void 0, function* () {
                for (let kernel of this._childKernels) {
                    if (kernel.supportsCommand(invocation.commandEnvelope.commandType)) {
                        yield kernel.handleCommand({ command: {}, commandType: RequestKernelInfoType });
                    }
                }
            });
        }
        add(kernel, aliases) {
            if (!kernel) {
                throw new Error("kernel cannot be null or undefined");
            }
            if (!this.defaultKernelName) {
                // default to first kernel
                this.defaultKernelName = kernel.name;
            }
            kernel.parentKernel = this;
            kernel.rootKernel = this.rootKernel;
            kernel.kernelEvents.subscribe({
                next: (event) => {
                    tryAddUriToRoutingSlip(event, getKernelUri(this));
                    this.publishEvent(event);
                }
            });
            if (aliases) {
                let set = new Set(aliases);
                if (kernel.kernelInfo.aliases) {
                    for (let alias in kernel.kernelInfo.aliases) {
                        set.add(alias);
                    }
                }
                kernel.kernelInfo.aliases = Array.from(set);
            }
            this._childKernels.add(kernel, aliases);
            const invocationContext = KernelInvocationContext.current;
            if (invocationContext) {
                invocationContext.commandEnvelope; //?
                invocationContext.publish({
                    eventType: KernelInfoProducedType,
                    event: {
                        kernelInfo: kernel.kernelInfo
                    },
                    command: invocationContext.commandEnvelope
                });
            }
            else {
                this.publishEvent({
                    eventType: KernelInfoProducedType,
                    event: {
                        kernelInfo: kernel.kernelInfo
                    }
                });
            }
        }
        setDefaultTargetKernelNameForCommand(commandType, kernelName) {
            this._defaultKernelNamesByCommandType.set(commandType, kernelName);
        }
        handleCommand(commandEnvelope) {
            var _a;
            const invocationContext = KernelInvocationContext.current;
            let kernel = commandEnvelope.command.targetKernelName === this.name
                ? this
                : this.getHandlingKernel(commandEnvelope, invocationContext);
            const previusoHandlingKernel = (_a = invocationContext === null || invocationContext === void 0 ? void 0 : invocationContext.handlingKernel) !== null && _a !== void 0 ? _a : null;
            if (kernel === this) {
                if (invocationContext !== null) {
                    invocationContext.handlingKernel = kernel;
                }
                return super.handleCommand(commandEnvelope).finally(() => {
                    if (invocationContext !== null) {
                        invocationContext.handlingKernel = previusoHandlingKernel;
                    }
                });
            }
            else if (kernel) {
                if (invocationContext !== null) {
                    invocationContext.handlingKernel = kernel;
                }
                tryAddUriToRoutingSlip(commandEnvelope, getKernelUri(kernel));
                return kernel.handleCommand(commandEnvelope).finally(() => {
                    if (invocationContext !== null) {
                        invocationContext.handlingKernel = previusoHandlingKernel;
                    }
                });
            }
            if (invocationContext !== null) {
                invocationContext.handlingKernel = previusoHandlingKernel;
            }
            return Promise.reject(new Error("Kernel not found: " + commandEnvelope.command.targetKernelName));
        }
        getHandlingKernel(commandEnvelope, context) {
            var _a, _b, _c, _d, _e;
            let kernel = null;
            if (commandEnvelope.command.destinationUri) {
                kernel = (_a = this._childKernels.tryGetByUri(commandEnvelope.command.destinationUri)) !== null && _a !== void 0 ? _a : null;
                if (kernel) {
                    return kernel;
                }
            }
            let targetKernelName = commandEnvelope.command.targetKernelName;
            if (targetKernelName === undefined || targetKernelName === null) {
                if (this.canHandle(commandEnvelope)) {
                    return this;
                }
                targetKernelName = (_b = this._defaultKernelNamesByCommandType.get(commandEnvelope.commandType)) !== null && _b !== void 0 ? _b : this.defaultKernelName;
            }
            if (targetKernelName !== undefined && targetKernelName !== null) {
                kernel = (_c = this._childKernels.tryGetByAlias(targetKernelName)) !== null && _c !== void 0 ? _c : null;
            }
            if (!kernel) {
                if (this._childKernels.count === 1) {
                    kernel = (_d = this._childKernels.single()) !== null && _d !== void 0 ? _d : null;
                }
            }
            if (!kernel) {
                kernel = (_e = context === null || context === void 0 ? void 0 : context.handlingKernel) !== null && _e !== void 0 ? _e : null;
            }
            return kernel !== null && kernel !== void 0 ? kernel : this;
        }
    }
    class KernelCollection {
        constructor(compositeKernel) {
            this._kernels = [];
            this._nameAndAliasesByKernel = new Map();
            this._kernelsByNameOrAlias = new Map();
            this._kernelsByLocalUri = new Map();
            this._kernelsByRemoteUri = new Map();
            this._compositeKernel = compositeKernel;
        }
        [Symbol.iterator]() {
            let counter = 0;
            return {
                next: () => {
                    return {
                        value: this._kernels[counter++],
                        done: counter > this._kernels.length //?
                    };
                }
            };
        }
        single() {
            return this._kernels.length === 1 ? this._kernels[0] : undefined;
        }
        add(kernel, aliases) {
            this.updateKernelInfoAndIndex(kernel, aliases);
            this._kernels.push(kernel);
        }
        get count() {
            return this._kernels.length;
        }
        updateKernelInfoAndIndex(kernel, aliases) {
            var _a;
            if (!this._nameAndAliasesByKernel.has(kernel)) {
                let set = new Set();
                for (let alias of kernel.kernelInfo.aliases) {
                    set.add(alias);
                }
                kernel.kernelInfo.aliases = Array.from(set);
                set.add(kernel.kernelInfo.localName);
                this._nameAndAliasesByKernel.set(kernel, set);
            }
            if (aliases) {
                for (let alias of aliases) {
                    this._nameAndAliasesByKernel.get(kernel).add(alias);
                }
            }
            (_a = this._nameAndAliasesByKernel.get(kernel)) === null || _a === void 0 ? void 0 : _a.forEach(alias => {
                this._kernelsByNameOrAlias.set(alias, kernel);
            });
            if (this._compositeKernel.host) {
                kernel.kernelInfo.uri = `${this._compositeKernel.host.uri}/${kernel.name}`; //?
                this._kernelsByLocalUri.set(kernel.kernelInfo.uri, kernel);
            }
            if (kernel.kernelType === KernelType.proxy) {
                this._kernelsByRemoteUri.set(kernel.kernelInfo.remoteUri, kernel);
            }
        }
        tryGetByAlias(alias) {
            return this._kernelsByNameOrAlias.get(alias);
        }
        tryGetByUri(uri) {
            let kernel = this._kernelsByLocalUri.get(uri) || this._kernelsByRemoteUri.get(uri);
            return kernel;
        }
        notifyThatHostWasSet() {
            for (let kernel of this._kernels) {
                this.updateKernelInfoAndIndex(kernel);
            }
        }
    }

    // Copyright (c) .NET Foundation and contributors. All rights reserved.
    class ConsoleCapture {
        constructor() {
            this.originalConsole = console;
            console = this;
        }
        set kernelInvocationContext(value) {
            this._kernelInvocationContext = value;
        }
        assert(value, message, ...optionalParams) {
            this.originalConsole.assert(value, message, optionalParams);
        }
        clear() {
            this.originalConsole.clear();
        }
        count(label) {
            this.originalConsole.count(label);
        }
        countReset(label) {
            this.originalConsole.countReset(label);
        }
        debug(message, ...optionalParams) {
            this.originalConsole.debug(message, optionalParams);
        }
        dir(obj, options) {
            this.originalConsole.dir(obj, options);
        }
        dirxml(...data) {
            this.originalConsole.dirxml(data);
        }
        error(message, ...optionalParams) {
            this.redirectAndPublish(this.originalConsole.error, ...[message, ...optionalParams]);
        }
        group(...label) {
            this.originalConsole.group(label);
        }
        groupCollapsed(...label) {
            this.originalConsole.groupCollapsed(label);
        }
        groupEnd() {
            this.originalConsole.groupEnd();
        }
        info(message, ...optionalParams) {
            this.redirectAndPublish(this.originalConsole.info, ...[message, ...optionalParams]);
        }
        log(message, ...optionalParams) {
            this.redirectAndPublish(this.originalConsole.log, ...[message, ...optionalParams]);
        }
        table(tabularData, properties) {
            this.originalConsole.table(tabularData, properties);
        }
        time(label) {
            this.originalConsole.time(label);
        }
        timeEnd(label) {
            this.originalConsole.timeEnd(label);
        }
        timeLog(label, ...data) {
            this.originalConsole.timeLog(label, data);
        }
        timeStamp(label) {
            this.originalConsole.timeStamp(label);
        }
        trace(message, ...optionalParams) {
            this.redirectAndPublish(this.originalConsole.trace, ...[message, ...optionalParams]);
        }
        warn(message, ...optionalParams) {
            this.originalConsole.warn(message, optionalParams);
        }
        profile(label) {
            this.originalConsole.profile(label);
        }
        profileEnd(label) {
            this.originalConsole.profileEnd(label);
        }
        dispose() {
            console = this.originalConsole;
        }
        redirectAndPublish(target, ...args) {
            if (this._kernelInvocationContext) {
                for (const arg of args) {
                    let mimeType;
                    let value;
                    if (typeof arg !== 'object' && !Array.isArray(arg)) {
                        mimeType = 'text/plain';
                        value = arg === null || arg === void 0 ? void 0 : arg.toString();
                    }
                    else {
                        mimeType = 'application/json';
                        value = JSON.stringify(arg);
                    }
                    const displayedValue = {
                        formattedValues: [
                            {
                                mimeType,
                                value,
                            }
                        ]
                    };
                    const eventEnvelope = {
                        eventType: DisplayedValueProducedType,
                        event: displayedValue,
                        command: this._kernelInvocationContext.commandEnvelope
                    };
                    this._kernelInvocationContext.publish(eventEnvelope);
                }
            }
            if (target) {
                target(...args);
            }
        }
    }

    // Copyright (c) .NET Foundation and contributors. All rights reserved.
    class JavascriptKernel extends Kernel {
        constructor(name) {
            super(name !== null && name !== void 0 ? name : "javascript", "Javascript");
            this.suppressedLocals = new Set(this.allLocalVariableNames());
            this.registerCommandHandler({ commandType: SubmitCodeType, handle: invocation => this.handleSubmitCode(invocation) });
            this.registerCommandHandler({ commandType: RequestValueInfosType, handle: invocation => this.handleRequestValueInfos(invocation) });
            this.registerCommandHandler({ commandType: RequestValueType, handle: invocation => this.handleRequestValue(invocation) });
            this.capture = new ConsoleCapture();
        }
        handleSubmitCode(invocation) {
            const _super = Object.create(null, {
                kernelInfo: { get: () => super.kernelInfo }
            });
            return __awaiter(this, void 0, void 0, function* () {
                const submitCode = invocation.commandEnvelope.command;
                const code = submitCode.code;
                _super.kernelInfo.localName; //?
                _super.kernelInfo.uri; //?
                _super.kernelInfo.remoteUri; //?
                invocation.context.publish({ eventType: CodeSubmissionReceivedType, event: { code }, command: invocation.commandEnvelope });
                invocation.context.commandEnvelope.routingSlip; //?
                this.capture.kernelInvocationContext = invocation.context;
                let result = undefined;
                try {
                    const AsyncFunction = eval(`Object.getPrototypeOf(async function(){}).constructor`);
                    const evaluator = AsyncFunction("console", code);
                    result = yield evaluator(this.capture);
                    if (result !== undefined) {
                        const formattedValue = formatValue(result, 'application/json');
                        const event = {
                            formattedValues: [formattedValue]
                        };
                        invocation.context.publish({ eventType: ReturnValueProducedType, event, command: invocation.commandEnvelope });
                    }
                }
                catch (e) {
                    throw e; //?
                }
                finally {
                    this.capture.kernelInvocationContext = undefined;
                }
            });
        }
        handleRequestValueInfos(invocation) {
            const valueInfos = this.allLocalVariableNames().filter(v => !this.suppressedLocals.has(v)).map(v => ({ name: v }));
            const event = {
                valueInfos
            };
            invocation.context.publish({ eventType: ValueInfosProducedType, event, command: invocation.commandEnvelope });
            return Promise.resolve();
        }
        handleRequestValue(invocation) {
            const requestValue = invocation.commandEnvelope.command;
            const rawValue = this.getLocalVariable(requestValue.name);
            const formattedValue = formatValue(rawValue, requestValue.mimeType || 'application/json');
            Logger.default.info(`returning ${JSON.stringify(formattedValue)} for ${requestValue.name}`);
            const event = {
                name: requestValue.name,
                formattedValue
            };
            invocation.context.publish({ eventType: ValueProducedType, event, command: invocation.commandEnvelope });
            return Promise.resolve();
        }
        allLocalVariableNames() {
            const result = [];
            try {
                for (const key in globalThis) {
                    try {
                        if (typeof globalThis[key] !== 'function') {
                            result.push(key);
                        }
                    }
                    catch (e) {
                        Logger.default.error(`error getting value for ${key} : ${e}`);
                    }
                }
            }
            catch (e) {
                Logger.default.error(`error scanning globla variables : ${e}`);
            }
            return result;
        }
        getLocalVariable(name) {
            return globalThis[name];
        }
    }
    function formatValue(arg, mimeType) {
        let value;
        switch (mimeType) {
            case 'text/plain':
                value = (arg === null || arg === void 0 ? void 0 : arg.toString()) || 'undefined';
                break;
            case 'application/json':
                value = JSON.stringify(arg);
                break;
            default:
                throw new Error(`unsupported mime type: ${mimeType}`);
        }
        return {
            mimeType,
            value,
        };
    }

    // Copyright (c) .NET Foundation and contributors. All rights reserved.
    class ProxyKernel extends Kernel {
        constructor(name, _sender, _receiver) {
            super(name);
            this.name = name;
            this._sender = _sender;
            this._receiver = _receiver;
            this.kernelType = KernelType.proxy;
        }
        getCommandHandler(commandType) {
            return {
                commandType,
                handle: (invocation) => {
                    return this._commandHandler(invocation);
                }
            };
        }
        delegatePublication(envelope, invocationContext) {
            let alreadyBeenSeen = false;
            if (envelope.routingSlip === undefined || !envelope.routingSlip.find(e => e === getKernelUri(this))) {
                tryAddUriToRoutingSlip(envelope, getKernelUri(this));
            }
            else {
                alreadyBeenSeen = true;
            }
            if (this.hasSameOrigin(envelope)) {
                if (!alreadyBeenSeen) {
                    invocationContext.publish(envelope);
                }
            }
        }
        hasSameOrigin(envelope) {
            var _a, _b, _c;
            let commandOriginUri = (_c = (_b = (_a = envelope.command) === null || _a === void 0 ? void 0 : _a.command) === null || _b === void 0 ? void 0 : _b.originUri) !== null && _c !== void 0 ? _c : this.kernelInfo.uri;
            if (commandOriginUri === this.kernelInfo.uri) {
                return true;
            }
            return commandOriginUri === null;
        }
        updateKernelInfoFromEvent(kernelInfoProduced) {
            this.kernelInfo.languageName = kernelInfoProduced.kernelInfo.languageName;
            this.kernelInfo.languageVersion = kernelInfoProduced.kernelInfo.languageVersion;
            const supportedDirectives = new Set();
            const supportedCommands = new Set();
            if (!this.kernelInfo.supportedDirectives) {
                this.kernelInfo.supportedDirectives = [];
            }
            if (!this.kernelInfo.supportedKernelCommands) {
                this.kernelInfo.supportedKernelCommands = [];
            }
            for (const supportedDirective of this.kernelInfo.supportedDirectives) {
                supportedDirectives.add(supportedDirective.name);
            }
            for (const supportedCommand of this.kernelInfo.supportedKernelCommands) {
                supportedCommands.add(supportedCommand.name);
            }
            for (const supportedDirective of kernelInfoProduced.kernelInfo.supportedDirectives) {
                if (!supportedDirectives.has(supportedDirective.name)) {
                    supportedDirectives.add(supportedDirective.name);
                    this.kernelInfo.supportedDirectives.push(supportedDirective);
                }
            }
            for (const supportedCommand of kernelInfoProduced.kernelInfo.supportedKernelCommands) {
                if (!supportedCommands.has(supportedCommand.name)) {
                    supportedCommands.add(supportedCommand.name);
                    this.kernelInfo.supportedKernelCommands.push(supportedCommand);
                }
            }
        }
        _commandHandler(commandInvocation) {
            var _a, _b, _c, _d;
            var _e, _f;
            return __awaiter(this, void 0, void 0, function* () {
                const commandToken = commandInvocation.commandEnvelope.token;
                const commandId = commandInvocation.commandEnvelope.id;
                const completionSource = new PromiseCompletionSource();
                // fix : is this the right way? We are trying to avoid forwarding events we just did forward
                let eventSubscription = this._receiver.subscribe({
                    next: (envelope) => {
                        if (isKernelEventEnvelope(envelope)) {
                            if (envelope.eventType === KernelInfoProducedType &&
                                (envelope.command === null || envelope.command === undefined)) {
                                const kernelInfoProduced = envelope.event;
                                this.updateKernelInfoFromEvent(kernelInfoProduced);
                                this.publishEvent({
                                    eventType: KernelInfoProducedType,
                                    event: { kernelInfo: this.kernelInfo }
                                });
                            }
                            else if (envelope.command.token === commandToken) {
                                for (const kernelUri of envelope.command.routingSlip) {
                                    tryAddUriToRoutingSlip(commandInvocation.commandEnvelope, kernelUri);
                                    envelope.command.routingSlip = commandInvocation.commandEnvelope.routingSlip; //?
                                }
                                switch (envelope.eventType) {
                                    case KernelInfoProducedType:
                                        {
                                            const kernelInfoProduced = envelope.event;
                                            this.updateKernelInfoFromEvent(kernelInfoProduced);
                                            this.delegatePublication({
                                                eventType: KernelInfoProducedType,
                                                event: { kernelInfo: this.kernelInfo },
                                                routingSlip: envelope.routingSlip,
                                                command: commandInvocation.commandEnvelope
                                            }, commandInvocation.context);
                                            this.delegatePublication(envelope, commandInvocation.context);
                                        }
                                        break;
                                    case CommandFailedType:
                                    case CommandSucceededType:
                                        if (envelope.command.id === commandId) {
                                            completionSource.resolve(envelope);
                                        }
                                        else {
                                            this.delegatePublication(envelope, commandInvocation.context);
                                        }
                                        break;
                                    default:
                                        this.delegatePublication(envelope, commandInvocation.context);
                                        break;
                                }
                            }
                        }
                    }
                });
                try {
                    if (!commandInvocation.commandEnvelope.command.destinationUri || !commandInvocation.commandEnvelope.command.originUri) {
                        const kernelInfo = (_b = (_a = this.parentKernel) === null || _a === void 0 ? void 0 : _a.host) === null || _b === void 0 ? void 0 : _b.tryGetKernelInfo(this);
                        if (kernelInfo) {
                            (_c = (_e = commandInvocation.commandEnvelope.command).originUri) !== null && _c !== void 0 ? _c : (_e.originUri = kernelInfo.uri);
                            (_d = (_f = commandInvocation.commandEnvelope.command).destinationUri) !== null && _d !== void 0 ? _d : (_f.destinationUri = kernelInfo.remoteUri);
                        }
                    }
                    commandInvocation.commandEnvelope.routingSlip; //?
                    this._sender.send(commandInvocation.commandEnvelope);
                    Logger.default.info(`proxy ${this.name} about to await with token ${commandToken}`);
                    const enventEnvelope = yield completionSource.promise;
                    if (enventEnvelope.eventType === CommandFailedType) {
                        commandInvocation.context.fail(enventEnvelope.event.message);
                    }
                    Logger.default.info(`proxy ${this.name} done awaiting with token ${commandToken}`);
                }
                catch (e) {
                    commandInvocation.context.fail(e.message);
                }
                finally {
                    eventSubscription.unsubscribe();
                }
            });
        }
    }

    // Copyright (c) .NET Foundation and contributors. All rights reserved.
    class KernelHost {
        constructor(kernel, sender, receiver, hostUri) {
            this._remoteUriToKernel = new Map();
            this._uriToKernel = new Map();
            this._kernelToKernelInfo = new Map();
            this._kernel = kernel;
            this._uri = hostUri || "kernel://vscode";
            this._kernel.host = this;
            this._scheduler = new KernelScheduler();
            this._defaultSender = sender;
            this._defaultReceiver = receiver;
        }
        get uri() {
            return this._uri;
        }
        tryGetKernelByRemoteUri(remoteUri) {
            return this._remoteUriToKernel.get(remoteUri);
        }
        trygetKernelByOriginUri(originUri) {
            return this._uriToKernel.get(originUri);
        }
        tryGetKernelInfo(kernel) {
            return this._kernelToKernelInfo.get(kernel);
        }
        addKernelInfo(kernel, kernelInfo) {
            kernelInfo.uri = `${this._uri}/${kernel.name}`; //?
            this._kernelToKernelInfo.set(kernel, kernelInfo);
            this._uriToKernel.set(kernelInfo.uri, kernel);
        }
        getKernel(kernelCommandEnvelope) {
            if (kernelCommandEnvelope.command.destinationUri) {
                let fromDestinationUri = this._uriToKernel.get(kernelCommandEnvelope.command.destinationUri.toLowerCase());
                if (fromDestinationUri) {
                    Logger.default.info(`Kernel ${fromDestinationUri.name} found for destination uri ${kernelCommandEnvelope.command.destinationUri}`);
                    return fromDestinationUri;
                }
                fromDestinationUri = this._remoteUriToKernel.get(kernelCommandEnvelope.command.destinationUri.toLowerCase());
                if (fromDestinationUri) {
                    Logger.default.info(`Kernel ${fromDestinationUri.name} found for destination uri ${kernelCommandEnvelope.command.destinationUri}`);
                    return fromDestinationUri;
                }
            }
            if (kernelCommandEnvelope.command.originUri) {
                let fromOriginUri = this._uriToKernel.get(kernelCommandEnvelope.command.originUri.toLowerCase());
                if (fromOriginUri) {
                    Logger.default.info(`Kernel ${fromOriginUri.name} found for origin uri ${kernelCommandEnvelope.command.originUri}`);
                    return fromOriginUri;
                }
            }
            Logger.default.info(`Using Kernel ${this._kernel.name}`);
            return this._kernel;
        }
        connectProxyKernelOnDefaultConnector(localName, remoteKernelUri, aliases) {
            return this.connectProxyKernelOnConnector(localName, this._defaultSender, this._defaultReceiver, remoteKernelUri, aliases);
        }
        connectProxyKernelOnConnector(localName, sender, receiver, remoteKernelUri, aliases) {
            let kernel = new ProxyKernel(localName, sender, receiver);
            kernel.kernelInfo.remoteUri = remoteKernelUri;
            this._kernel.add(kernel, aliases);
            return kernel;
        }
        connect() {
            this._kernel.subscribeToKernelEvents(e => {
                this._defaultSender.send(e);
            });
            this._defaultReceiver.subscribe({
                next: (kernelCommandOrEventEnvelope) => {
                    if (isKernelCommandEnvelope(kernelCommandOrEventEnvelope)) {
                        this._scheduler.runAsync(kernelCommandOrEventEnvelope, commandEnvelope => {
                            const kernel = this._kernel;
                            return kernel.send(commandEnvelope);
                        });
                    }
                }
            });
            this._defaultSender.send({ eventType: KernelReadyType, event: {} });
            this._defaultSender.send({ eventType: KernelInfoProducedType, event: { kernelInfo: this._kernel.kernelInfo } });
            for (let kernel of this._kernel.childKernels) {
                this._defaultSender.send({ eventType: KernelInfoProducedType, event: { kernelInfo: kernel.kernelInfo } });
            }
        }
    }

    // Copyright (c) .NET Foundation and contributors. All rights reserved.
    function createHost(global, compositeKernelName, configureRequire, logMessage, localToRemote, remoteToLocal, onReady) {
        Logger.configure(compositeKernelName, logMessage);
        global.interactive = {};
        configureRequire(global.interactive);
        global.kernel = {
            get root() {
                return Kernel.root;
            }
        };
        const compositeKernel = new CompositeKernel(compositeKernelName);
        const kernelHost = new KernelHost(compositeKernel, KernelCommandAndEventSender.FromObserver(localToRemote), KernelCommandAndEventReceiver.FromObservable(remoteToLocal), `kernel://${compositeKernelName}`);
        const jsKernel = new JavascriptKernel();
        compositeKernel.add(jsKernel, ["js"]);
        global[compositeKernelName] = {
            compositeKernel,
            kernelHost,
        };
        kernelHost.connect();
        onReady();
    }

    // Copyright (c) .NET Foundation and contributors. All rights reserved.
    function configure(global) {
        if (!global) {
            global = window;
        }
        const remoteToLocal = new Subject();
        const localToRemote = new Subject();
        localToRemote.subscribe({
            next: envelope => {
                // @ts-ignore
                postKernelMessage({ envelope });
            }
        });
        // @ts-ignore
        onDidReceiveKernelMessage((arg) => {
            var _a, _b;
            if (arg.envelope) {
                const envelope = (arg.envelope);
                if (isKernelEventEnvelope(envelope)) {
                    Logger.default.info(`channel got ${envelope.eventType} with token ${(_a = envelope.command) === null || _a === void 0 ? void 0 : _a.token} and id ${(_b = envelope.command) === null || _b === void 0 ? void 0 : _b.id}`);
                }
                remoteToLocal.next(envelope);
            }
        });
        createHost(global, 'webview', configureRequire, entry => {
            // @ts-ignore
            postKernelMessage({ logEntry: entry });
        }, localToRemote, remoteToLocal, () => {
            global.webview.kernelHost.connectProxyKernelOnDefaultConnector('csharp', undefined, ['c#', 'C#']);
            global.webview.kernelHost.connectProxyKernelOnDefaultConnector('fsharp', undefined, ['fs', 'F#']);
            global.webview.kernelHost.connectProxyKernelOnDefaultConnector('pwsh', undefined, ['powershell']);
            global.webview.kernelHost.connectProxyKernelOnDefaultConnector('mermaid', undefined, []);
            global.webview.kernelHost.connectProxyKernelOnDefaultConnector('vscode', "kernel://vscode/vscode");
            // @ts-ignore
            postKernelMessage({ preloadCommand: '#!connect' });
        });
    }
    function configureRequire(interactive) {
        if ((typeof (require) !== typeof (Function)) || (typeof (require.config) !== typeof (Function))) {
            let require_script = document.createElement('script');
            require_script.setAttribute('src', 'https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.6/require.min.js');
            require_script.setAttribute('type', 'text/javascript');
            require_script.onload = function () {
                interactive.configureRequire = (confing) => {
                    return require.config(confing) || require;
                };
            };
            document.getElementsByTagName('head')[0].appendChild(require_script);
        }
        else {
            interactive.configureRequire = (confing) => {
                return require.config(confing) || require;
            };
        }
    }
    configure(window);

    exports.configure = configure;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

})({});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2VybmVsQXBpQm9vdHN0cmFwcGVyLmpzIiwic291cmNlcyI6WyIuLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvdXRpbC9pc0Z1bmN0aW9uLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL3V0aWwvY3JlYXRlRXJyb3JDbGFzcy5qcyIsIi4uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC91dGlsL1Vuc3Vic2NyaXB0aW9uRXJyb3IuanMiLCIuLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvdXRpbC9hcnJSZW1vdmUuanMiLCIuLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvU3Vic2NyaXB0aW9uLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL2NvbmZpZy5qcyIsIi4uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC9zY2hlZHVsZXIvdGltZW91dFByb3ZpZGVyLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL3V0aWwvcmVwb3J0VW5oYW5kbGVkRXJyb3IuanMiLCIuLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvdXRpbC9ub29wLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL3V0aWwvZXJyb3JDb250ZXh0LmpzIiwiLi4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL1N1YnNjcmliZXIuanMiLCIuLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvc3ltYm9sL29ic2VydmFibGUuanMiLCIuLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvdXRpbC9pZGVudGl0eS5qcyIsIi4uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC91dGlsL3BpcGUuanMiLCIuLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvT2JzZXJ2YWJsZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC91dGlsL2xpZnQuanMiLCIuLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvb3BlcmF0b3JzL09wZXJhdG9yU3Vic2NyaWJlci5qcyIsIi4uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC91dGlsL09iamVjdFVuc3Vic2NyaWJlZEVycm9yLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL1N1YmplY3QuanMiLCIuLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvb3BlcmF0b3JzL21hcC5qcyIsIi4uL3NyYy9jb25uZWN0aW9uLnRzIiwiLi4vc3JjL2NvbnRyYWN0cy50cyIsIi4uL3NyYy9wcm9taXNlQ29tcGxldGlvblNvdXJjZS50cyIsIi4uL3NyYy9rZXJuZWxJbnZvY2F0aW9uQ29udGV4dC50cyIsIi4uL3NyYy90b2tlbkdlbmVyYXRvci50cyIsIi4uL3NyYy9sb2dnZXIudHMiLCIuLi9zcmMva2VybmVsU2NoZWR1bGVyLnRzIiwiLi4vc3JjL2tlcm5lbC50cyIsIi4uL3NyYy9jb21wb3NpdGVLZXJuZWwudHMiLCIuLi9zcmMvY29uc29sZUNhcHR1cmUudHMiLCIuLi9zcmMvamF2YXNjcmlwdEtlcm5lbC50cyIsIi4uL3NyYy9wcm94eUtlcm5lbC50cyIsIi4uL3NyYy9rZXJuZWxIb3N0LnRzIiwiLi4vc3JjL3dlYnZpZXcvZnJvbnRFbmRIb3N0LnRzIiwiLi4vc3JjL3dlYnZpZXcva2VybmVsQXBpQm9vdHN0cmFwcGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBmdW5jdGlvbiBpc0Z1bmN0aW9uKHZhbHVlKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJztcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWlzRnVuY3Rpb24uanMubWFwIiwiZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUVycm9yQ2xhc3MoY3JlYXRlSW1wbCkge1xuICAgIHZhciBfc3VwZXIgPSBmdW5jdGlvbiAoaW5zdGFuY2UpIHtcbiAgICAgICAgRXJyb3IuY2FsbChpbnN0YW5jZSk7XG4gICAgICAgIGluc3RhbmNlLnN0YWNrID0gbmV3IEVycm9yKCkuc3RhY2s7XG4gICAgfTtcbiAgICB2YXIgY3RvckZ1bmMgPSBjcmVhdGVJbXBsKF9zdXBlcik7XG4gICAgY3RvckZ1bmMucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShFcnJvci5wcm90b3R5cGUpO1xuICAgIGN0b3JGdW5jLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGN0b3JGdW5jO1xuICAgIHJldHVybiBjdG9yRnVuYztcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWNyZWF0ZUVycm9yQ2xhc3MuanMubWFwIiwiaW1wb3J0IHsgY3JlYXRlRXJyb3JDbGFzcyB9IGZyb20gJy4vY3JlYXRlRXJyb3JDbGFzcyc7XG5leHBvcnQgdmFyIFVuc3Vic2NyaXB0aW9uRXJyb3IgPSBjcmVhdGVFcnJvckNsYXNzKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gVW5zdWJzY3JpcHRpb25FcnJvckltcGwoZXJyb3JzKSB7XG4gICAgICAgIF9zdXBlcih0aGlzKTtcbiAgICAgICAgdGhpcy5tZXNzYWdlID0gZXJyb3JzXG4gICAgICAgICAgICA/IGVycm9ycy5sZW5ndGggKyBcIiBlcnJvcnMgb2NjdXJyZWQgZHVyaW5nIHVuc3Vic2NyaXB0aW9uOlxcblwiICsgZXJyb3JzLm1hcChmdW5jdGlvbiAoZXJyLCBpKSB7IHJldHVybiBpICsgMSArIFwiKSBcIiArIGVyci50b1N0cmluZygpOyB9KS5qb2luKCdcXG4gICcpXG4gICAgICAgICAgICA6ICcnO1xuICAgICAgICB0aGlzLm5hbWUgPSAnVW5zdWJzY3JpcHRpb25FcnJvcic7XG4gICAgICAgIHRoaXMuZXJyb3JzID0gZXJyb3JzO1xuICAgIH07XG59KTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPVVuc3Vic2NyaXB0aW9uRXJyb3IuanMubWFwIiwiZXhwb3J0IGZ1bmN0aW9uIGFyclJlbW92ZShhcnIsIGl0ZW0pIHtcbiAgICBpZiAoYXJyKSB7XG4gICAgICAgIHZhciBpbmRleCA9IGFyci5pbmRleE9mKGl0ZW0pO1xuICAgICAgICAwIDw9IGluZGV4ICYmIGFyci5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH1cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFyclJlbW92ZS5qcy5tYXAiLCJpbXBvcnQgeyBfX3JlYWQsIF9fc3ByZWFkQXJyYXksIF9fdmFsdWVzIH0gZnJvbSBcInRzbGliXCI7XG5pbXBvcnQgeyBpc0Z1bmN0aW9uIH0gZnJvbSAnLi91dGlsL2lzRnVuY3Rpb24nO1xuaW1wb3J0IHsgVW5zdWJzY3JpcHRpb25FcnJvciB9IGZyb20gJy4vdXRpbC9VbnN1YnNjcmlwdGlvbkVycm9yJztcbmltcG9ydCB7IGFyclJlbW92ZSB9IGZyb20gJy4vdXRpbC9hcnJSZW1vdmUnO1xudmFyIFN1YnNjcmlwdGlvbiA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gU3Vic2NyaXB0aW9uKGluaXRpYWxUZWFyZG93bikge1xuICAgICAgICB0aGlzLmluaXRpYWxUZWFyZG93biA9IGluaXRpYWxUZWFyZG93bjtcbiAgICAgICAgdGhpcy5jbG9zZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fcGFyZW50YWdlID0gbnVsbDtcbiAgICAgICAgdGhpcy5fZmluYWxpemVycyA9IG51bGw7XG4gICAgfVxuICAgIFN1YnNjcmlwdGlvbi5wcm90b3R5cGUudW5zdWJzY3JpYmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBlXzEsIF9hLCBlXzIsIF9iO1xuICAgICAgICB2YXIgZXJyb3JzO1xuICAgICAgICBpZiAoIXRoaXMuY2xvc2VkKSB7XG4gICAgICAgICAgICB0aGlzLmNsb3NlZCA9IHRydWU7XG4gICAgICAgICAgICB2YXIgX3BhcmVudGFnZSA9IHRoaXMuX3BhcmVudGFnZTtcbiAgICAgICAgICAgIGlmIChfcGFyZW50YWdlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcGFyZW50YWdlID0gbnVsbDtcbiAgICAgICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShfcGFyZW50YWdlKSkge1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgX3BhcmVudGFnZV8xID0gX192YWx1ZXMoX3BhcmVudGFnZSksIF9wYXJlbnRhZ2VfMV8xID0gX3BhcmVudGFnZV8xLm5leHQoKTsgIV9wYXJlbnRhZ2VfMV8xLmRvbmU7IF9wYXJlbnRhZ2VfMV8xID0gX3BhcmVudGFnZV8xLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwYXJlbnRfMSA9IF9wYXJlbnRhZ2VfMV8xLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudF8xLnJlbW92ZSh0aGlzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjYXRjaCAoZV8xXzEpIHsgZV8xID0geyBlcnJvcjogZV8xXzEgfTsgfVxuICAgICAgICAgICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKF9wYXJlbnRhZ2VfMV8xICYmICFfcGFyZW50YWdlXzFfMS5kb25lICYmIChfYSA9IF9wYXJlbnRhZ2VfMS5yZXR1cm4pKSBfYS5jYWxsKF9wYXJlbnRhZ2VfMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfMSkgdGhyb3cgZV8xLmVycm9yOyB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIF9wYXJlbnRhZ2UucmVtb3ZlKHRoaXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBpbml0aWFsRmluYWxpemVyID0gdGhpcy5pbml0aWFsVGVhcmRvd247XG4gICAgICAgICAgICBpZiAoaXNGdW5jdGlvbihpbml0aWFsRmluYWxpemVyKSkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGluaXRpYWxGaW5hbGl6ZXIoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JzID0gZSBpbnN0YW5jZW9mIFVuc3Vic2NyaXB0aW9uRXJyb3IgPyBlLmVycm9ycyA6IFtlXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgX2ZpbmFsaXplcnMgPSB0aGlzLl9maW5hbGl6ZXJzO1xuICAgICAgICAgICAgaWYgKF9maW5hbGl6ZXJzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZmluYWxpemVycyA9IG51bGw7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgX2ZpbmFsaXplcnNfMSA9IF9fdmFsdWVzKF9maW5hbGl6ZXJzKSwgX2ZpbmFsaXplcnNfMV8xID0gX2ZpbmFsaXplcnNfMS5uZXh0KCk7ICFfZmluYWxpemVyc18xXzEuZG9uZTsgX2ZpbmFsaXplcnNfMV8xID0gX2ZpbmFsaXplcnNfMS5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmaW5hbGl6ZXIgPSBfZmluYWxpemVyc18xXzEudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4ZWNGaW5hbGl6ZXIoZmluYWxpemVyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcnMgPSBlcnJvcnMgIT09IG51bGwgJiYgZXJyb3JzICE9PSB2b2lkIDAgPyBlcnJvcnMgOiBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXJyIGluc3RhbmNlb2YgVW5zdWJzY3JpcHRpb25FcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcnMgPSBfX3NwcmVhZEFycmF5KF9fc3ByZWFkQXJyYXkoW10sIF9fcmVhZChlcnJvcnMpKSwgX19yZWFkKGVyci5lcnJvcnMpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9ycy5wdXNoKGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoIChlXzJfMSkgeyBlXzIgPSB7IGVycm9yOiBlXzJfMSB9OyB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoX2ZpbmFsaXplcnNfMV8xICYmICFfZmluYWxpemVyc18xXzEuZG9uZSAmJiAoX2IgPSBfZmluYWxpemVyc18xLnJldHVybikpIF9iLmNhbGwoX2ZpbmFsaXplcnNfMSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzIpIHRocm93IGVfMi5lcnJvcjsgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChlcnJvcnMpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVW5zdWJzY3JpcHRpb25FcnJvcihlcnJvcnMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbiAgICBTdWJzY3JpcHRpb24ucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uICh0ZWFyZG93bikge1xuICAgICAgICB2YXIgX2E7XG4gICAgICAgIGlmICh0ZWFyZG93biAmJiB0ZWFyZG93biAhPT0gdGhpcykge1xuICAgICAgICAgICAgaWYgKHRoaXMuY2xvc2VkKSB7XG4gICAgICAgICAgICAgICAgZXhlY0ZpbmFsaXplcih0ZWFyZG93bik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAodGVhcmRvd24gaW5zdGFuY2VvZiBTdWJzY3JpcHRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRlYXJkb3duLmNsb3NlZCB8fCB0ZWFyZG93bi5faGFzUGFyZW50KHRoaXMpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGVhcmRvd24uX2FkZFBhcmVudCh0aGlzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgKHRoaXMuX2ZpbmFsaXplcnMgPSAoX2EgPSB0aGlzLl9maW5hbGl6ZXJzKSAhPT0gbnVsbCAmJiBfYSAhPT0gdm9pZCAwID8gX2EgOiBbXSkucHVzaCh0ZWFyZG93bik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuICAgIFN1YnNjcmlwdGlvbi5wcm90b3R5cGUuX2hhc1BhcmVudCA9IGZ1bmN0aW9uIChwYXJlbnQpIHtcbiAgICAgICAgdmFyIF9wYXJlbnRhZ2UgPSB0aGlzLl9wYXJlbnRhZ2U7XG4gICAgICAgIHJldHVybiBfcGFyZW50YWdlID09PSBwYXJlbnQgfHwgKEFycmF5LmlzQXJyYXkoX3BhcmVudGFnZSkgJiYgX3BhcmVudGFnZS5pbmNsdWRlcyhwYXJlbnQpKTtcbiAgICB9O1xuICAgIFN1YnNjcmlwdGlvbi5wcm90b3R5cGUuX2FkZFBhcmVudCA9IGZ1bmN0aW9uIChwYXJlbnQpIHtcbiAgICAgICAgdmFyIF9wYXJlbnRhZ2UgPSB0aGlzLl9wYXJlbnRhZ2U7XG4gICAgICAgIHRoaXMuX3BhcmVudGFnZSA9IEFycmF5LmlzQXJyYXkoX3BhcmVudGFnZSkgPyAoX3BhcmVudGFnZS5wdXNoKHBhcmVudCksIF9wYXJlbnRhZ2UpIDogX3BhcmVudGFnZSA/IFtfcGFyZW50YWdlLCBwYXJlbnRdIDogcGFyZW50O1xuICAgIH07XG4gICAgU3Vic2NyaXB0aW9uLnByb3RvdHlwZS5fcmVtb3ZlUGFyZW50ID0gZnVuY3Rpb24gKHBhcmVudCkge1xuICAgICAgICB2YXIgX3BhcmVudGFnZSA9IHRoaXMuX3BhcmVudGFnZTtcbiAgICAgICAgaWYgKF9wYXJlbnRhZ2UgPT09IHBhcmVudCkge1xuICAgICAgICAgICAgdGhpcy5fcGFyZW50YWdlID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChBcnJheS5pc0FycmF5KF9wYXJlbnRhZ2UpKSB7XG4gICAgICAgICAgICBhcnJSZW1vdmUoX3BhcmVudGFnZSwgcGFyZW50KTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgU3Vic2NyaXB0aW9uLnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbiAodGVhcmRvd24pIHtcbiAgICAgICAgdmFyIF9maW5hbGl6ZXJzID0gdGhpcy5fZmluYWxpemVycztcbiAgICAgICAgX2ZpbmFsaXplcnMgJiYgYXJyUmVtb3ZlKF9maW5hbGl6ZXJzLCB0ZWFyZG93bik7XG4gICAgICAgIGlmICh0ZWFyZG93biBpbnN0YW5jZW9mIFN1YnNjcmlwdGlvbikge1xuICAgICAgICAgICAgdGVhcmRvd24uX3JlbW92ZVBhcmVudCh0aGlzKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgU3Vic2NyaXB0aW9uLkVNUFRZID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGVtcHR5ID0gbmV3IFN1YnNjcmlwdGlvbigpO1xuICAgICAgICBlbXB0eS5jbG9zZWQgPSB0cnVlO1xuICAgICAgICByZXR1cm4gZW1wdHk7XG4gICAgfSkoKTtcbiAgICByZXR1cm4gU3Vic2NyaXB0aW9uO1xufSgpKTtcbmV4cG9ydCB7IFN1YnNjcmlwdGlvbiB9O1xuZXhwb3J0IHZhciBFTVBUWV9TVUJTQ1JJUFRJT04gPSBTdWJzY3JpcHRpb24uRU1QVFk7XG5leHBvcnQgZnVuY3Rpb24gaXNTdWJzY3JpcHRpb24odmFsdWUpIHtcbiAgICByZXR1cm4gKHZhbHVlIGluc3RhbmNlb2YgU3Vic2NyaXB0aW9uIHx8XG4gICAgICAgICh2YWx1ZSAmJiAnY2xvc2VkJyBpbiB2YWx1ZSAmJiBpc0Z1bmN0aW9uKHZhbHVlLnJlbW92ZSkgJiYgaXNGdW5jdGlvbih2YWx1ZS5hZGQpICYmIGlzRnVuY3Rpb24odmFsdWUudW5zdWJzY3JpYmUpKSk7XG59XG5mdW5jdGlvbiBleGVjRmluYWxpemVyKGZpbmFsaXplcikge1xuICAgIGlmIChpc0Z1bmN0aW9uKGZpbmFsaXplcikpIHtcbiAgICAgICAgZmluYWxpemVyKCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBmaW5hbGl6ZXIudW5zdWJzY3JpYmUoKTtcbiAgICB9XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1TdWJzY3JpcHRpb24uanMubWFwIiwiZXhwb3J0IHZhciBjb25maWcgPSB7XG4gICAgb25VbmhhbmRsZWRFcnJvcjogbnVsbCxcbiAgICBvblN0b3BwZWROb3RpZmljYXRpb246IG51bGwsXG4gICAgUHJvbWlzZTogdW5kZWZpbmVkLFxuICAgIHVzZURlcHJlY2F0ZWRTeW5jaHJvbm91c0Vycm9ySGFuZGxpbmc6IGZhbHNlLFxuICAgIHVzZURlcHJlY2F0ZWROZXh0Q29udGV4dDogZmFsc2UsXG59O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Y29uZmlnLmpzLm1hcCIsImltcG9ydCB7IF9fcmVhZCwgX19zcHJlYWRBcnJheSB9IGZyb20gXCJ0c2xpYlwiO1xuZXhwb3J0IHZhciB0aW1lb3V0UHJvdmlkZXIgPSB7XG4gICAgc2V0VGltZW91dDogZnVuY3Rpb24gKGhhbmRsZXIsIHRpbWVvdXQpIHtcbiAgICAgICAgdmFyIGFyZ3MgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgX2kgPSAyOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgIGFyZ3NbX2kgLSAyXSA9IGFyZ3VtZW50c1tfaV07XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGRlbGVnYXRlID0gdGltZW91dFByb3ZpZGVyLmRlbGVnYXRlO1xuICAgICAgICBpZiAoZGVsZWdhdGUgPT09IG51bGwgfHwgZGVsZWdhdGUgPT09IHZvaWQgMCA/IHZvaWQgMCA6IGRlbGVnYXRlLnNldFRpbWVvdXQpIHtcbiAgICAgICAgICAgIHJldHVybiBkZWxlZ2F0ZS5zZXRUaW1lb3V0LmFwcGx5KGRlbGVnYXRlLCBfX3NwcmVhZEFycmF5KFtoYW5kbGVyLCB0aW1lb3V0XSwgX19yZWFkKGFyZ3MpKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQuYXBwbHkodm9pZCAwLCBfX3NwcmVhZEFycmF5KFtoYW5kbGVyLCB0aW1lb3V0XSwgX19yZWFkKGFyZ3MpKSk7XG4gICAgfSxcbiAgICBjbGVhclRpbWVvdXQ6IGZ1bmN0aW9uIChoYW5kbGUpIHtcbiAgICAgICAgdmFyIGRlbGVnYXRlID0gdGltZW91dFByb3ZpZGVyLmRlbGVnYXRlO1xuICAgICAgICByZXR1cm4gKChkZWxlZ2F0ZSA9PT0gbnVsbCB8fCBkZWxlZ2F0ZSA9PT0gdm9pZCAwID8gdm9pZCAwIDogZGVsZWdhdGUuY2xlYXJUaW1lb3V0KSB8fCBjbGVhclRpbWVvdXQpKGhhbmRsZSk7XG4gICAgfSxcbiAgICBkZWxlZ2F0ZTogdW5kZWZpbmVkLFxufTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXRpbWVvdXRQcm92aWRlci5qcy5tYXAiLCJpbXBvcnQgeyBjb25maWcgfSBmcm9tICcuLi9jb25maWcnO1xuaW1wb3J0IHsgdGltZW91dFByb3ZpZGVyIH0gZnJvbSAnLi4vc2NoZWR1bGVyL3RpbWVvdXRQcm92aWRlcic7XG5leHBvcnQgZnVuY3Rpb24gcmVwb3J0VW5oYW5kbGVkRXJyb3IoZXJyKSB7XG4gICAgdGltZW91dFByb3ZpZGVyLnNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgb25VbmhhbmRsZWRFcnJvciA9IGNvbmZpZy5vblVuaGFuZGxlZEVycm9yO1xuICAgICAgICBpZiAob25VbmhhbmRsZWRFcnJvcikge1xuICAgICAgICAgICAgb25VbmhhbmRsZWRFcnJvcihlcnIpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICB9XG4gICAgfSk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1yZXBvcnRVbmhhbmRsZWRFcnJvci5qcy5tYXAiLCJleHBvcnQgZnVuY3Rpb24gbm9vcCgpIHsgfVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bm9vcC5qcy5tYXAiLCJpbXBvcnQgeyBjb25maWcgfSBmcm9tICcuLi9jb25maWcnO1xudmFyIGNvbnRleHQgPSBudWxsO1xuZXhwb3J0IGZ1bmN0aW9uIGVycm9yQ29udGV4dChjYikge1xuICAgIGlmIChjb25maWcudXNlRGVwcmVjYXRlZFN5bmNocm9ub3VzRXJyb3JIYW5kbGluZykge1xuICAgICAgICB2YXIgaXNSb290ID0gIWNvbnRleHQ7XG4gICAgICAgIGlmIChpc1Jvb3QpIHtcbiAgICAgICAgICAgIGNvbnRleHQgPSB7IGVycm9yVGhyb3duOiBmYWxzZSwgZXJyb3I6IG51bGwgfTtcbiAgICAgICAgfVxuICAgICAgICBjYigpO1xuICAgICAgICBpZiAoaXNSb290KSB7XG4gICAgICAgICAgICB2YXIgX2EgPSBjb250ZXh0LCBlcnJvclRocm93biA9IF9hLmVycm9yVGhyb3duLCBlcnJvciA9IF9hLmVycm9yO1xuICAgICAgICAgICAgY29udGV4dCA9IG51bGw7XG4gICAgICAgICAgICBpZiAoZXJyb3JUaHJvd24pIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgY2IoKTtcbiAgICB9XG59XG5leHBvcnQgZnVuY3Rpb24gY2FwdHVyZUVycm9yKGVycikge1xuICAgIGlmIChjb25maWcudXNlRGVwcmVjYXRlZFN5bmNocm9ub3VzRXJyb3JIYW5kbGluZyAmJiBjb250ZXh0KSB7XG4gICAgICAgIGNvbnRleHQuZXJyb3JUaHJvd24gPSB0cnVlO1xuICAgICAgICBjb250ZXh0LmVycm9yID0gZXJyO1xuICAgIH1cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWVycm9yQ29udGV4dC5qcy5tYXAiLCJpbXBvcnQgeyBfX2V4dGVuZHMgfSBmcm9tIFwidHNsaWJcIjtcbmltcG9ydCB7IGlzRnVuY3Rpb24gfSBmcm9tICcuL3V0aWwvaXNGdW5jdGlvbic7XG5pbXBvcnQgeyBpc1N1YnNjcmlwdGlvbiwgU3Vic2NyaXB0aW9uIH0gZnJvbSAnLi9TdWJzY3JpcHRpb24nO1xuaW1wb3J0IHsgY29uZmlnIH0gZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IHsgcmVwb3J0VW5oYW5kbGVkRXJyb3IgfSBmcm9tICcuL3V0aWwvcmVwb3J0VW5oYW5kbGVkRXJyb3InO1xuaW1wb3J0IHsgbm9vcCB9IGZyb20gJy4vdXRpbC9ub29wJztcbmltcG9ydCB7IG5leHROb3RpZmljYXRpb24sIGVycm9yTm90aWZpY2F0aW9uLCBDT01QTEVURV9OT1RJRklDQVRJT04gfSBmcm9tICcuL05vdGlmaWNhdGlvbkZhY3Rvcmllcyc7XG5pbXBvcnQgeyB0aW1lb3V0UHJvdmlkZXIgfSBmcm9tICcuL3NjaGVkdWxlci90aW1lb3V0UHJvdmlkZXInO1xuaW1wb3J0IHsgY2FwdHVyZUVycm9yIH0gZnJvbSAnLi91dGlsL2Vycm9yQ29udGV4dCc7XG52YXIgU3Vic2NyaWJlciA9IChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgX19leHRlbmRzKFN1YnNjcmliZXIsIF9zdXBlcik7XG4gICAgZnVuY3Rpb24gU3Vic2NyaWJlcihkZXN0aW5hdGlvbikge1xuICAgICAgICB2YXIgX3RoaXMgPSBfc3VwZXIuY2FsbCh0aGlzKSB8fCB0aGlzO1xuICAgICAgICBfdGhpcy5pc1N0b3BwZWQgPSBmYWxzZTtcbiAgICAgICAgaWYgKGRlc3RpbmF0aW9uKSB7XG4gICAgICAgICAgICBfdGhpcy5kZXN0aW5hdGlvbiA9IGRlc3RpbmF0aW9uO1xuICAgICAgICAgICAgaWYgKGlzU3Vic2NyaXB0aW9uKGRlc3RpbmF0aW9uKSkge1xuICAgICAgICAgICAgICAgIGRlc3RpbmF0aW9uLmFkZChfdGhpcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBfdGhpcy5kZXN0aW5hdGlvbiA9IEVNUFRZX09CU0VSVkVSO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBfdGhpcztcbiAgICB9XG4gICAgU3Vic2NyaWJlci5jcmVhdGUgPSBmdW5jdGlvbiAobmV4dCwgZXJyb3IsIGNvbXBsZXRlKSB7XG4gICAgICAgIHJldHVybiBuZXcgU2FmZVN1YnNjcmliZXIobmV4dCwgZXJyb3IsIGNvbXBsZXRlKTtcbiAgICB9O1xuICAgIFN1YnNjcmliZXIucHJvdG90eXBlLm5leHQgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgaWYgKHRoaXMuaXNTdG9wcGVkKSB7XG4gICAgICAgICAgICBoYW5kbGVTdG9wcGVkTm90aWZpY2F0aW9uKG5leHROb3RpZmljYXRpb24odmFsdWUpLCB0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX25leHQodmFsdWUpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBTdWJzY3JpYmVyLnByb3RvdHlwZS5lcnJvciA9IGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgaWYgKHRoaXMuaXNTdG9wcGVkKSB7XG4gICAgICAgICAgICBoYW5kbGVTdG9wcGVkTm90aWZpY2F0aW9uKGVycm9yTm90aWZpY2F0aW9uKGVyciksIHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5pc1N0b3BwZWQgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5fZXJyb3IoZXJyKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgU3Vic2NyaWJlci5wcm90b3R5cGUuY29tcGxldGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLmlzU3RvcHBlZCkge1xuICAgICAgICAgICAgaGFuZGxlU3RvcHBlZE5vdGlmaWNhdGlvbihDT01QTEVURV9OT1RJRklDQVRJT04sIHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5pc1N0b3BwZWQgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5fY29tcGxldGUoKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgU3Vic2NyaWJlci5wcm90b3R5cGUudW5zdWJzY3JpYmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICghdGhpcy5jbG9zZWQpIHtcbiAgICAgICAgICAgIHRoaXMuaXNTdG9wcGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIF9zdXBlci5wcm90b3R5cGUudW5zdWJzY3JpYmUuY2FsbCh0aGlzKTtcbiAgICAgICAgICAgIHRoaXMuZGVzdGluYXRpb24gPSBudWxsO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBTdWJzY3JpYmVyLnByb3RvdHlwZS5fbmV4dCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICB0aGlzLmRlc3RpbmF0aW9uLm5leHQodmFsdWUpO1xuICAgIH07XG4gICAgU3Vic2NyaWJlci5wcm90b3R5cGUuX2Vycm9yID0gZnVuY3Rpb24gKGVycikge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhpcy5kZXN0aW5hdGlvbi5lcnJvcihlcnIpO1xuICAgICAgICB9XG4gICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgdGhpcy51bnN1YnNjcmliZSgpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBTdWJzY3JpYmVyLnByb3RvdHlwZS5fY29tcGxldGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLmRlc3RpbmF0aW9uLmNvbXBsZXRlKCk7XG4gICAgICAgIH1cbiAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICB0aGlzLnVuc3Vic2NyaWJlKCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHJldHVybiBTdWJzY3JpYmVyO1xufShTdWJzY3JpcHRpb24pKTtcbmV4cG9ydCB7IFN1YnNjcmliZXIgfTtcbnZhciBfYmluZCA9IEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kO1xuZnVuY3Rpb24gYmluZChmbiwgdGhpc0FyZykge1xuICAgIHJldHVybiBfYmluZC5jYWxsKGZuLCB0aGlzQXJnKTtcbn1cbnZhciBDb25zdW1lck9ic2VydmVyID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBDb25zdW1lck9ic2VydmVyKHBhcnRpYWxPYnNlcnZlcikge1xuICAgICAgICB0aGlzLnBhcnRpYWxPYnNlcnZlciA9IHBhcnRpYWxPYnNlcnZlcjtcbiAgICB9XG4gICAgQ29uc3VtZXJPYnNlcnZlci5wcm90b3R5cGUubmV4dCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICB2YXIgcGFydGlhbE9ic2VydmVyID0gdGhpcy5wYXJ0aWFsT2JzZXJ2ZXI7XG4gICAgICAgIGlmIChwYXJ0aWFsT2JzZXJ2ZXIubmV4dCkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBwYXJ0aWFsT2JzZXJ2ZXIubmV4dCh2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBoYW5kbGVVbmhhbmRsZWRFcnJvcihlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuICAgIENvbnN1bWVyT2JzZXJ2ZXIucHJvdG90eXBlLmVycm9yID0gZnVuY3Rpb24gKGVycikge1xuICAgICAgICB2YXIgcGFydGlhbE9ic2VydmVyID0gdGhpcy5wYXJ0aWFsT2JzZXJ2ZXI7XG4gICAgICAgIGlmIChwYXJ0aWFsT2JzZXJ2ZXIuZXJyb3IpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcGFydGlhbE9ic2VydmVyLmVycm9yKGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBoYW5kbGVVbmhhbmRsZWRFcnJvcihlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBoYW5kbGVVbmhhbmRsZWRFcnJvcihlcnIpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBDb25zdW1lck9ic2VydmVyLnByb3RvdHlwZS5jb21wbGV0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHBhcnRpYWxPYnNlcnZlciA9IHRoaXMucGFydGlhbE9ic2VydmVyO1xuICAgICAgICBpZiAocGFydGlhbE9ic2VydmVyLmNvbXBsZXRlKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHBhcnRpYWxPYnNlcnZlci5jb21wbGV0ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgaGFuZGxlVW5oYW5kbGVkRXJyb3IoZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gQ29uc3VtZXJPYnNlcnZlcjtcbn0oKSk7XG52YXIgU2FmZVN1YnNjcmliZXIgPSAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgIF9fZXh0ZW5kcyhTYWZlU3Vic2NyaWJlciwgX3N1cGVyKTtcbiAgICBmdW5jdGlvbiBTYWZlU3Vic2NyaWJlcihvYnNlcnZlck9yTmV4dCwgZXJyb3IsIGNvbXBsZXRlKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IF9zdXBlci5jYWxsKHRoaXMpIHx8IHRoaXM7XG4gICAgICAgIHZhciBwYXJ0aWFsT2JzZXJ2ZXI7XG4gICAgICAgIGlmIChpc0Z1bmN0aW9uKG9ic2VydmVyT3JOZXh0KSB8fCAhb2JzZXJ2ZXJPck5leHQpIHtcbiAgICAgICAgICAgIHBhcnRpYWxPYnNlcnZlciA9IHtcbiAgICAgICAgICAgICAgICBuZXh0OiAob2JzZXJ2ZXJPck5leHQgIT09IG51bGwgJiYgb2JzZXJ2ZXJPck5leHQgIT09IHZvaWQgMCA/IG9ic2VydmVyT3JOZXh0IDogdW5kZWZpbmVkKSxcbiAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3IgIT09IG51bGwgJiYgZXJyb3IgIT09IHZvaWQgMCA/IGVycm9yIDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgIGNvbXBsZXRlOiBjb21wbGV0ZSAhPT0gbnVsbCAmJiBjb21wbGV0ZSAhPT0gdm9pZCAwID8gY29tcGxldGUgOiB1bmRlZmluZWQsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdmFyIGNvbnRleHRfMTtcbiAgICAgICAgICAgIGlmIChfdGhpcyAmJiBjb25maWcudXNlRGVwcmVjYXRlZE5leHRDb250ZXh0KSB7XG4gICAgICAgICAgICAgICAgY29udGV4dF8xID0gT2JqZWN0LmNyZWF0ZShvYnNlcnZlck9yTmV4dCk7XG4gICAgICAgICAgICAgICAgY29udGV4dF8xLnVuc3Vic2NyaWJlID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gX3RoaXMudW5zdWJzY3JpYmUoKTsgfTtcbiAgICAgICAgICAgICAgICBwYXJ0aWFsT2JzZXJ2ZXIgPSB7XG4gICAgICAgICAgICAgICAgICAgIG5leHQ6IG9ic2VydmVyT3JOZXh0Lm5leHQgJiYgYmluZChvYnNlcnZlck9yTmV4dC5uZXh0LCBjb250ZXh0XzEpLFxuICAgICAgICAgICAgICAgICAgICBlcnJvcjogb2JzZXJ2ZXJPck5leHQuZXJyb3IgJiYgYmluZChvYnNlcnZlck9yTmV4dC5lcnJvciwgY29udGV4dF8xKSxcbiAgICAgICAgICAgICAgICAgICAgY29tcGxldGU6IG9ic2VydmVyT3JOZXh0LmNvbXBsZXRlICYmIGJpbmQob2JzZXJ2ZXJPck5leHQuY29tcGxldGUsIGNvbnRleHRfMSksXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHBhcnRpYWxPYnNlcnZlciA9IG9ic2VydmVyT3JOZXh0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIF90aGlzLmRlc3RpbmF0aW9uID0gbmV3IENvbnN1bWVyT2JzZXJ2ZXIocGFydGlhbE9ic2VydmVyKTtcbiAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgIH1cbiAgICByZXR1cm4gU2FmZVN1YnNjcmliZXI7XG59KFN1YnNjcmliZXIpKTtcbmV4cG9ydCB7IFNhZmVTdWJzY3JpYmVyIH07XG5mdW5jdGlvbiBoYW5kbGVVbmhhbmRsZWRFcnJvcihlcnJvcikge1xuICAgIGlmIChjb25maWcudXNlRGVwcmVjYXRlZFN5bmNocm9ub3VzRXJyb3JIYW5kbGluZykge1xuICAgICAgICBjYXB0dXJlRXJyb3IoZXJyb3IpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmVwb3J0VW5oYW5kbGVkRXJyb3IoZXJyb3IpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGRlZmF1bHRFcnJvckhhbmRsZXIoZXJyKSB7XG4gICAgdGhyb3cgZXJyO1xufVxuZnVuY3Rpb24gaGFuZGxlU3RvcHBlZE5vdGlmaWNhdGlvbihub3RpZmljYXRpb24sIHN1YnNjcmliZXIpIHtcbiAgICB2YXIgb25TdG9wcGVkTm90aWZpY2F0aW9uID0gY29uZmlnLm9uU3RvcHBlZE5vdGlmaWNhdGlvbjtcbiAgICBvblN0b3BwZWROb3RpZmljYXRpb24gJiYgdGltZW91dFByb3ZpZGVyLnNldFRpbWVvdXQoZnVuY3Rpb24gKCkgeyByZXR1cm4gb25TdG9wcGVkTm90aWZpY2F0aW9uKG5vdGlmaWNhdGlvbiwgc3Vic2NyaWJlcik7IH0pO1xufVxuZXhwb3J0IHZhciBFTVBUWV9PQlNFUlZFUiA9IHtcbiAgICBjbG9zZWQ6IHRydWUsXG4gICAgbmV4dDogbm9vcCxcbiAgICBlcnJvcjogZGVmYXVsdEVycm9ySGFuZGxlcixcbiAgICBjb21wbGV0ZTogbm9vcCxcbn07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1TdWJzY3JpYmVyLmpzLm1hcCIsImV4cG9ydCB2YXIgb2JzZXJ2YWJsZSA9IChmdW5jdGlvbiAoKSB7IHJldHVybiAodHlwZW9mIFN5bWJvbCA9PT0gJ2Z1bmN0aW9uJyAmJiBTeW1ib2wub2JzZXJ2YWJsZSkgfHwgJ0BAb2JzZXJ2YWJsZSc7IH0pKCk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1vYnNlcnZhYmxlLmpzLm1hcCIsImV4cG9ydCBmdW5jdGlvbiBpZGVudGl0eSh4KSB7XG4gICAgcmV0dXJuIHg7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1pZGVudGl0eS5qcy5tYXAiLCJpbXBvcnQgeyBpZGVudGl0eSB9IGZyb20gJy4vaWRlbnRpdHknO1xuZXhwb3J0IGZ1bmN0aW9uIHBpcGUoKSB7XG4gICAgdmFyIGZucyA9IFtdO1xuICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBhcmd1bWVudHMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgIGZuc1tfaV0gPSBhcmd1bWVudHNbX2ldO1xuICAgIH1cbiAgICByZXR1cm4gcGlwZUZyb21BcnJheShmbnMpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHBpcGVGcm9tQXJyYXkoZm5zKSB7XG4gICAgaWYgKGZucy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIGlkZW50aXR5O1xuICAgIH1cbiAgICBpZiAoZm5zLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICByZXR1cm4gZm5zWzBdO1xuICAgIH1cbiAgICByZXR1cm4gZnVuY3Rpb24gcGlwZWQoaW5wdXQpIHtcbiAgICAgICAgcmV0dXJuIGZucy5yZWR1Y2UoZnVuY3Rpb24gKHByZXYsIGZuKSB7IHJldHVybiBmbihwcmV2KTsgfSwgaW5wdXQpO1xuICAgIH07XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1waXBlLmpzLm1hcCIsImltcG9ydCB7IFNhZmVTdWJzY3JpYmVyLCBTdWJzY3JpYmVyIH0gZnJvbSAnLi9TdWJzY3JpYmVyJztcbmltcG9ydCB7IGlzU3Vic2NyaXB0aW9uIH0gZnJvbSAnLi9TdWJzY3JpcHRpb24nO1xuaW1wb3J0IHsgb2JzZXJ2YWJsZSBhcyBTeW1ib2xfb2JzZXJ2YWJsZSB9IGZyb20gJy4vc3ltYm9sL29ic2VydmFibGUnO1xuaW1wb3J0IHsgcGlwZUZyb21BcnJheSB9IGZyb20gJy4vdXRpbC9waXBlJztcbmltcG9ydCB7IGNvbmZpZyB9IGZyb20gJy4vY29uZmlnJztcbmltcG9ydCB7IGlzRnVuY3Rpb24gfSBmcm9tICcuL3V0aWwvaXNGdW5jdGlvbic7XG5pbXBvcnQgeyBlcnJvckNvbnRleHQgfSBmcm9tICcuL3V0aWwvZXJyb3JDb250ZXh0JztcbnZhciBPYnNlcnZhYmxlID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBPYnNlcnZhYmxlKHN1YnNjcmliZSkge1xuICAgICAgICBpZiAoc3Vic2NyaWJlKSB7XG4gICAgICAgICAgICB0aGlzLl9zdWJzY3JpYmUgPSBzdWJzY3JpYmU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgT2JzZXJ2YWJsZS5wcm90b3R5cGUubGlmdCA9IGZ1bmN0aW9uIChvcGVyYXRvcikge1xuICAgICAgICB2YXIgb2JzZXJ2YWJsZSA9IG5ldyBPYnNlcnZhYmxlKCk7XG4gICAgICAgIG9ic2VydmFibGUuc291cmNlID0gdGhpcztcbiAgICAgICAgb2JzZXJ2YWJsZS5vcGVyYXRvciA9IG9wZXJhdG9yO1xuICAgICAgICByZXR1cm4gb2JzZXJ2YWJsZTtcbiAgICB9O1xuICAgIE9ic2VydmFibGUucHJvdG90eXBlLnN1YnNjcmliZSA9IGZ1bmN0aW9uIChvYnNlcnZlck9yTmV4dCwgZXJyb3IsIGNvbXBsZXRlKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIHZhciBzdWJzY3JpYmVyID0gaXNTdWJzY3JpYmVyKG9ic2VydmVyT3JOZXh0KSA/IG9ic2VydmVyT3JOZXh0IDogbmV3IFNhZmVTdWJzY3JpYmVyKG9ic2VydmVyT3JOZXh0LCBlcnJvciwgY29tcGxldGUpO1xuICAgICAgICBlcnJvckNvbnRleHQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIF9hID0gX3RoaXMsIG9wZXJhdG9yID0gX2Eub3BlcmF0b3IsIHNvdXJjZSA9IF9hLnNvdXJjZTtcbiAgICAgICAgICAgIHN1YnNjcmliZXIuYWRkKG9wZXJhdG9yXG4gICAgICAgICAgICAgICAgP1xuICAgICAgICAgICAgICAgICAgICBvcGVyYXRvci5jYWxsKHN1YnNjcmliZXIsIHNvdXJjZSlcbiAgICAgICAgICAgICAgICA6IHNvdXJjZVxuICAgICAgICAgICAgICAgICAgICA/XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5fc3Vic2NyaWJlKHN1YnNjcmliZXIpXG4gICAgICAgICAgICAgICAgICAgIDpcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLl90cnlTdWJzY3JpYmUoc3Vic2NyaWJlcikpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHN1YnNjcmliZXI7XG4gICAgfTtcbiAgICBPYnNlcnZhYmxlLnByb3RvdHlwZS5fdHJ5U3Vic2NyaWJlID0gZnVuY3Rpb24gKHNpbmspIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9zdWJzY3JpYmUoc2luayk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgc2luay5lcnJvcihlcnIpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBPYnNlcnZhYmxlLnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24gKG5leHQsIHByb21pc2VDdG9yKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIHByb21pc2VDdG9yID0gZ2V0UHJvbWlzZUN0b3IocHJvbWlzZUN0b3IpO1xuICAgICAgICByZXR1cm4gbmV3IHByb21pc2VDdG9yKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgIHZhciBzdWJzY3JpYmVyID0gbmV3IFNhZmVTdWJzY3JpYmVyKHtcbiAgICAgICAgICAgICAgICBuZXh0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5leHQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc3Vic2NyaWJlci51bnN1YnNjcmliZSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBlcnJvcjogcmVqZWN0LFxuICAgICAgICAgICAgICAgIGNvbXBsZXRlOiByZXNvbHZlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBfdGhpcy5zdWJzY3JpYmUoc3Vic2NyaWJlcik7XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgT2JzZXJ2YWJsZS5wcm90b3R5cGUuX3N1YnNjcmliZSA9IGZ1bmN0aW9uIChzdWJzY3JpYmVyKSB7XG4gICAgICAgIHZhciBfYTtcbiAgICAgICAgcmV0dXJuIChfYSA9IHRoaXMuc291cmNlKSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2Euc3Vic2NyaWJlKHN1YnNjcmliZXIpO1xuICAgIH07XG4gICAgT2JzZXJ2YWJsZS5wcm90b3R5cGVbU3ltYm9sX29ic2VydmFibGVdID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIE9ic2VydmFibGUucHJvdG90eXBlLnBpcGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBvcGVyYXRpb25zID0gW107XG4gICAgICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBhcmd1bWVudHMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICBvcGVyYXRpb25zW19pXSA9IGFyZ3VtZW50c1tfaV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHBpcGVGcm9tQXJyYXkob3BlcmF0aW9ucykodGhpcyk7XG4gICAgfTtcbiAgICBPYnNlcnZhYmxlLnByb3RvdHlwZS50b1Byb21pc2UgPSBmdW5jdGlvbiAocHJvbWlzZUN0b3IpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgcHJvbWlzZUN0b3IgPSBnZXRQcm9taXNlQ3Rvcihwcm9taXNlQ3Rvcik7XG4gICAgICAgIHJldHVybiBuZXcgcHJvbWlzZUN0b3IoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgdmFyIHZhbHVlO1xuICAgICAgICAgICAgX3RoaXMuc3Vic2NyaWJlKGZ1bmN0aW9uICh4KSB7IHJldHVybiAodmFsdWUgPSB4KTsgfSwgZnVuY3Rpb24gKGVycikgeyByZXR1cm4gcmVqZWN0KGVycik7IH0sIGZ1bmN0aW9uICgpIHsgcmV0dXJuIHJlc29sdmUodmFsdWUpOyB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICBPYnNlcnZhYmxlLmNyZWF0ZSA9IGZ1bmN0aW9uIChzdWJzY3JpYmUpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBPYnNlcnZhYmxlKHN1YnNjcmliZSk7XG4gICAgfTtcbiAgICByZXR1cm4gT2JzZXJ2YWJsZTtcbn0oKSk7XG5leHBvcnQgeyBPYnNlcnZhYmxlIH07XG5mdW5jdGlvbiBnZXRQcm9taXNlQ3Rvcihwcm9taXNlQ3Rvcikge1xuICAgIHZhciBfYTtcbiAgICByZXR1cm4gKF9hID0gcHJvbWlzZUN0b3IgIT09IG51bGwgJiYgcHJvbWlzZUN0b3IgIT09IHZvaWQgMCA/IHByb21pc2VDdG9yIDogY29uZmlnLlByb21pc2UpICE9PSBudWxsICYmIF9hICE9PSB2b2lkIDAgPyBfYSA6IFByb21pc2U7XG59XG5mdW5jdGlvbiBpc09ic2VydmVyKHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlICYmIGlzRnVuY3Rpb24odmFsdWUubmV4dCkgJiYgaXNGdW5jdGlvbih2YWx1ZS5lcnJvcikgJiYgaXNGdW5jdGlvbih2YWx1ZS5jb21wbGV0ZSk7XG59XG5mdW5jdGlvbiBpc1N1YnNjcmliZXIodmFsdWUpIHtcbiAgICByZXR1cm4gKHZhbHVlICYmIHZhbHVlIGluc3RhbmNlb2YgU3Vic2NyaWJlcikgfHwgKGlzT2JzZXJ2ZXIodmFsdWUpICYmIGlzU3Vic2NyaXB0aW9uKHZhbHVlKSk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1PYnNlcnZhYmxlLmpzLm1hcCIsImltcG9ydCB7IGlzRnVuY3Rpb24gfSBmcm9tICcuL2lzRnVuY3Rpb24nO1xuZXhwb3J0IGZ1bmN0aW9uIGhhc0xpZnQoc291cmNlKSB7XG4gICAgcmV0dXJuIGlzRnVuY3Rpb24oc291cmNlID09PSBudWxsIHx8IHNvdXJjZSA9PT0gdm9pZCAwID8gdm9pZCAwIDogc291cmNlLmxpZnQpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIG9wZXJhdGUoaW5pdCkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoc291cmNlKSB7XG4gICAgICAgIGlmIChoYXNMaWZ0KHNvdXJjZSkpIHtcbiAgICAgICAgICAgIHJldHVybiBzb3VyY2UubGlmdChmdW5jdGlvbiAobGlmdGVkU291cmNlKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGluaXQobGlmdGVkU291cmNlLCB0aGlzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignVW5hYmxlIHRvIGxpZnQgdW5rbm93biBPYnNlcnZhYmxlIHR5cGUnKTtcbiAgICB9O1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bGlmdC5qcy5tYXAiLCJpbXBvcnQgeyBfX2V4dGVuZHMgfSBmcm9tIFwidHNsaWJcIjtcbmltcG9ydCB7IFN1YnNjcmliZXIgfSBmcm9tICcuLi9TdWJzY3JpYmVyJztcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVPcGVyYXRvclN1YnNjcmliZXIoZGVzdGluYXRpb24sIG9uTmV4dCwgb25Db21wbGV0ZSwgb25FcnJvciwgb25GaW5hbGl6ZSkge1xuICAgIHJldHVybiBuZXcgT3BlcmF0b3JTdWJzY3JpYmVyKGRlc3RpbmF0aW9uLCBvbk5leHQsIG9uQ29tcGxldGUsIG9uRXJyb3IsIG9uRmluYWxpemUpO1xufVxudmFyIE9wZXJhdG9yU3Vic2NyaWJlciA9IChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgX19leHRlbmRzKE9wZXJhdG9yU3Vic2NyaWJlciwgX3N1cGVyKTtcbiAgICBmdW5jdGlvbiBPcGVyYXRvclN1YnNjcmliZXIoZGVzdGluYXRpb24sIG9uTmV4dCwgb25Db21wbGV0ZSwgb25FcnJvciwgb25GaW5hbGl6ZSwgc2hvdWxkVW5zdWJzY3JpYmUpIHtcbiAgICAgICAgdmFyIF90aGlzID0gX3N1cGVyLmNhbGwodGhpcywgZGVzdGluYXRpb24pIHx8IHRoaXM7XG4gICAgICAgIF90aGlzLm9uRmluYWxpemUgPSBvbkZpbmFsaXplO1xuICAgICAgICBfdGhpcy5zaG91bGRVbnN1YnNjcmliZSA9IHNob3VsZFVuc3Vic2NyaWJlO1xuICAgICAgICBfdGhpcy5fbmV4dCA9IG9uTmV4dFxuICAgICAgICAgICAgPyBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBvbk5leHQodmFsdWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlc3RpbmF0aW9uLmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgOiBfc3VwZXIucHJvdG90eXBlLl9uZXh0O1xuICAgICAgICBfdGhpcy5fZXJyb3IgPSBvbkVycm9yXG4gICAgICAgICAgICA/IGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVzdGluYXRpb24uZXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudW5zdWJzY3JpYmUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICA6IF9zdXBlci5wcm90b3R5cGUuX2Vycm9yO1xuICAgICAgICBfdGhpcy5fY29tcGxldGUgPSBvbkNvbXBsZXRlXG4gICAgICAgICAgICA/IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBvbkNvbXBsZXRlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVzdGluYXRpb24uZXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudW5zdWJzY3JpYmUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICA6IF9zdXBlci5wcm90b3R5cGUuX2NvbXBsZXRlO1xuICAgICAgICByZXR1cm4gX3RoaXM7XG4gICAgfVxuICAgIE9wZXJhdG9yU3Vic2NyaWJlci5wcm90b3R5cGUudW5zdWJzY3JpYmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBfYTtcbiAgICAgICAgaWYgKCF0aGlzLnNob3VsZFVuc3Vic2NyaWJlIHx8IHRoaXMuc2hvdWxkVW5zdWJzY3JpYmUoKSkge1xuICAgICAgICAgICAgdmFyIGNsb3NlZF8xID0gdGhpcy5jbG9zZWQ7XG4gICAgICAgICAgICBfc3VwZXIucHJvdG90eXBlLnVuc3Vic2NyaWJlLmNhbGwodGhpcyk7XG4gICAgICAgICAgICAhY2xvc2VkXzEgJiYgKChfYSA9IHRoaXMub25GaW5hbGl6ZSkgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLmNhbGwodGhpcykpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gT3BlcmF0b3JTdWJzY3JpYmVyO1xufShTdWJzY3JpYmVyKSk7XG5leHBvcnQgeyBPcGVyYXRvclN1YnNjcmliZXIgfTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPU9wZXJhdG9yU3Vic2NyaWJlci5qcy5tYXAiLCJpbXBvcnQgeyBjcmVhdGVFcnJvckNsYXNzIH0gZnJvbSAnLi9jcmVhdGVFcnJvckNsYXNzJztcbmV4cG9ydCB2YXIgT2JqZWN0VW5zdWJzY3JpYmVkRXJyb3IgPSBjcmVhdGVFcnJvckNsYXNzKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gT2JqZWN0VW5zdWJzY3JpYmVkRXJyb3JJbXBsKCkge1xuICAgICAgICBfc3VwZXIodGhpcyk7XG4gICAgICAgIHRoaXMubmFtZSA9ICdPYmplY3RVbnN1YnNjcmliZWRFcnJvcic7XG4gICAgICAgIHRoaXMubWVzc2FnZSA9ICdvYmplY3QgdW5zdWJzY3JpYmVkJztcbiAgICB9O1xufSk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1PYmplY3RVbnN1YnNjcmliZWRFcnJvci5qcy5tYXAiLCJpbXBvcnQgeyBfX2V4dGVuZHMsIF9fdmFsdWVzIH0gZnJvbSBcInRzbGliXCI7XG5pbXBvcnQgeyBPYnNlcnZhYmxlIH0gZnJvbSAnLi9PYnNlcnZhYmxlJztcbmltcG9ydCB7IFN1YnNjcmlwdGlvbiwgRU1QVFlfU1VCU0NSSVBUSU9OIH0gZnJvbSAnLi9TdWJzY3JpcHRpb24nO1xuaW1wb3J0IHsgT2JqZWN0VW5zdWJzY3JpYmVkRXJyb3IgfSBmcm9tICcuL3V0aWwvT2JqZWN0VW5zdWJzY3JpYmVkRXJyb3InO1xuaW1wb3J0IHsgYXJyUmVtb3ZlIH0gZnJvbSAnLi91dGlsL2FyclJlbW92ZSc7XG5pbXBvcnQgeyBlcnJvckNvbnRleHQgfSBmcm9tICcuL3V0aWwvZXJyb3JDb250ZXh0JztcbnZhciBTdWJqZWN0ID0gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICBfX2V4dGVuZHMoU3ViamVjdCwgX3N1cGVyKTtcbiAgICBmdW5jdGlvbiBTdWJqZWN0KCkge1xuICAgICAgICB2YXIgX3RoaXMgPSBfc3VwZXIuY2FsbCh0aGlzKSB8fCB0aGlzO1xuICAgICAgICBfdGhpcy5jbG9zZWQgPSBmYWxzZTtcbiAgICAgICAgX3RoaXMuY3VycmVudE9ic2VydmVycyA9IG51bGw7XG4gICAgICAgIF90aGlzLm9ic2VydmVycyA9IFtdO1xuICAgICAgICBfdGhpcy5pc1N0b3BwZWQgPSBmYWxzZTtcbiAgICAgICAgX3RoaXMuaGFzRXJyb3IgPSBmYWxzZTtcbiAgICAgICAgX3RoaXMudGhyb3duRXJyb3IgPSBudWxsO1xuICAgICAgICByZXR1cm4gX3RoaXM7XG4gICAgfVxuICAgIFN1YmplY3QucHJvdG90eXBlLmxpZnQgPSBmdW5jdGlvbiAob3BlcmF0b3IpIHtcbiAgICAgICAgdmFyIHN1YmplY3QgPSBuZXcgQW5vbnltb3VzU3ViamVjdCh0aGlzLCB0aGlzKTtcbiAgICAgICAgc3ViamVjdC5vcGVyYXRvciA9IG9wZXJhdG9yO1xuICAgICAgICByZXR1cm4gc3ViamVjdDtcbiAgICB9O1xuICAgIFN1YmplY3QucHJvdG90eXBlLl90aHJvd0lmQ2xvc2VkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5jbG9zZWQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBPYmplY3RVbnN1YnNjcmliZWRFcnJvcigpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBTdWJqZWN0LnByb3RvdHlwZS5uZXh0ID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIGVycm9yQ29udGV4dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgZV8xLCBfYTtcbiAgICAgICAgICAgIF90aGlzLl90aHJvd0lmQ2xvc2VkKCk7XG4gICAgICAgICAgICBpZiAoIV90aGlzLmlzU3RvcHBlZCkge1xuICAgICAgICAgICAgICAgIGlmICghX3RoaXMuY3VycmVudE9ic2VydmVycykge1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy5jdXJyZW50T2JzZXJ2ZXJzID0gQXJyYXkuZnJvbShfdGhpcy5vYnNlcnZlcnMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IF9fdmFsdWVzKF90aGlzLmN1cnJlbnRPYnNlcnZlcnMpLCBfYyA9IF9iLm5leHQoKTsgIV9jLmRvbmU7IF9jID0gX2IubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgb2JzZXJ2ZXIgPSBfYy52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLm5leHQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoIChlXzFfMSkgeyBlXzEgPSB7IGVycm9yOiBlXzFfMSB9OyB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoX2MgJiYgIV9jLmRvbmUgJiYgKF9hID0gX2IucmV0dXJuKSkgX2EuY2FsbChfYik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzEpIHRocm93IGVfMS5lcnJvcjsgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICBTdWJqZWN0LnByb3RvdHlwZS5lcnJvciA9IGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgZXJyb3JDb250ZXh0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIF90aGlzLl90aHJvd0lmQ2xvc2VkKCk7XG4gICAgICAgICAgICBpZiAoIV90aGlzLmlzU3RvcHBlZCkge1xuICAgICAgICAgICAgICAgIF90aGlzLmhhc0Vycm9yID0gX3RoaXMuaXNTdG9wcGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBfdGhpcy50aHJvd25FcnJvciA9IGVycjtcbiAgICAgICAgICAgICAgICB2YXIgb2JzZXJ2ZXJzID0gX3RoaXMub2JzZXJ2ZXJzO1xuICAgICAgICAgICAgICAgIHdoaWxlIChvYnNlcnZlcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmVycy5zaGlmdCgpLmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xuICAgIFN1YmplY3QucHJvdG90eXBlLmNvbXBsZXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICBlcnJvckNvbnRleHQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgX3RoaXMuX3Rocm93SWZDbG9zZWQoKTtcbiAgICAgICAgICAgIGlmICghX3RoaXMuaXNTdG9wcGVkKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMuaXNTdG9wcGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB2YXIgb2JzZXJ2ZXJzID0gX3RoaXMub2JzZXJ2ZXJzO1xuICAgICAgICAgICAgICAgIHdoaWxlIChvYnNlcnZlcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmVycy5zaGlmdCgpLmNvbXBsZXRlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xuICAgIFN1YmplY3QucHJvdG90eXBlLnVuc3Vic2NyaWJlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmlzU3RvcHBlZCA9IHRoaXMuY2xvc2VkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5vYnNlcnZlcnMgPSB0aGlzLmN1cnJlbnRPYnNlcnZlcnMgPSBudWxsO1xuICAgIH07XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFN1YmplY3QucHJvdG90eXBlLCBcIm9ic2VydmVkXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgX2E7XG4gICAgICAgICAgICByZXR1cm4gKChfYSA9IHRoaXMub2JzZXJ2ZXJzKSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2EubGVuZ3RoKSA+IDA7XG4gICAgICAgIH0sXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KTtcbiAgICBTdWJqZWN0LnByb3RvdHlwZS5fdHJ5U3Vic2NyaWJlID0gZnVuY3Rpb24gKHN1YnNjcmliZXIpIHtcbiAgICAgICAgdGhpcy5fdGhyb3dJZkNsb3NlZCgpO1xuICAgICAgICByZXR1cm4gX3N1cGVyLnByb3RvdHlwZS5fdHJ5U3Vic2NyaWJlLmNhbGwodGhpcywgc3Vic2NyaWJlcik7XG4gICAgfTtcbiAgICBTdWJqZWN0LnByb3RvdHlwZS5fc3Vic2NyaWJlID0gZnVuY3Rpb24gKHN1YnNjcmliZXIpIHtcbiAgICAgICAgdGhpcy5fdGhyb3dJZkNsb3NlZCgpO1xuICAgICAgICB0aGlzLl9jaGVja0ZpbmFsaXplZFN0YXR1c2VzKHN1YnNjcmliZXIpO1xuICAgICAgICByZXR1cm4gdGhpcy5faW5uZXJTdWJzY3JpYmUoc3Vic2NyaWJlcik7XG4gICAgfTtcbiAgICBTdWJqZWN0LnByb3RvdHlwZS5faW5uZXJTdWJzY3JpYmUgPSBmdW5jdGlvbiAoc3Vic2NyaWJlcikge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICB2YXIgX2EgPSB0aGlzLCBoYXNFcnJvciA9IF9hLmhhc0Vycm9yLCBpc1N0b3BwZWQgPSBfYS5pc1N0b3BwZWQsIG9ic2VydmVycyA9IF9hLm9ic2VydmVycztcbiAgICAgICAgaWYgKGhhc0Vycm9yIHx8IGlzU3RvcHBlZCkge1xuICAgICAgICAgICAgcmV0dXJuIEVNUFRZX1NVQlNDUklQVElPTjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmN1cnJlbnRPYnNlcnZlcnMgPSBudWxsO1xuICAgICAgICBvYnNlcnZlcnMucHVzaChzdWJzY3JpYmVyKTtcbiAgICAgICAgcmV0dXJuIG5ldyBTdWJzY3JpcHRpb24oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgX3RoaXMuY3VycmVudE9ic2VydmVycyA9IG51bGw7XG4gICAgICAgICAgICBhcnJSZW1vdmUob2JzZXJ2ZXJzLCBzdWJzY3JpYmVyKTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICBTdWJqZWN0LnByb3RvdHlwZS5fY2hlY2tGaW5hbGl6ZWRTdGF0dXNlcyA9IGZ1bmN0aW9uIChzdWJzY3JpYmVyKSB7XG4gICAgICAgIHZhciBfYSA9IHRoaXMsIGhhc0Vycm9yID0gX2EuaGFzRXJyb3IsIHRocm93bkVycm9yID0gX2EudGhyb3duRXJyb3IsIGlzU3RvcHBlZCA9IF9hLmlzU3RvcHBlZDtcbiAgICAgICAgaWYgKGhhc0Vycm9yKSB7XG4gICAgICAgICAgICBzdWJzY3JpYmVyLmVycm9yKHRocm93bkVycm9yKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChpc1N0b3BwZWQpIHtcbiAgICAgICAgICAgIHN1YnNjcmliZXIuY29tcGxldGUoKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgU3ViamVjdC5wcm90b3R5cGUuYXNPYnNlcnZhYmxlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgb2JzZXJ2YWJsZSA9IG5ldyBPYnNlcnZhYmxlKCk7XG4gICAgICAgIG9ic2VydmFibGUuc291cmNlID0gdGhpcztcbiAgICAgICAgcmV0dXJuIG9ic2VydmFibGU7XG4gICAgfTtcbiAgICBTdWJqZWN0LmNyZWF0ZSA9IGZ1bmN0aW9uIChkZXN0aW5hdGlvbiwgc291cmNlKSB7XG4gICAgICAgIHJldHVybiBuZXcgQW5vbnltb3VzU3ViamVjdChkZXN0aW5hdGlvbiwgc291cmNlKTtcbiAgICB9O1xuICAgIHJldHVybiBTdWJqZWN0O1xufShPYnNlcnZhYmxlKSk7XG5leHBvcnQgeyBTdWJqZWN0IH07XG52YXIgQW5vbnltb3VzU3ViamVjdCA9IChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgX19leHRlbmRzKEFub255bW91c1N1YmplY3QsIF9zdXBlcik7XG4gICAgZnVuY3Rpb24gQW5vbnltb3VzU3ViamVjdChkZXN0aW5hdGlvbiwgc291cmNlKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IF9zdXBlci5jYWxsKHRoaXMpIHx8IHRoaXM7XG4gICAgICAgIF90aGlzLmRlc3RpbmF0aW9uID0gZGVzdGluYXRpb247XG4gICAgICAgIF90aGlzLnNvdXJjZSA9IHNvdXJjZTtcbiAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgIH1cbiAgICBBbm9ueW1vdXNTdWJqZWN0LnByb3RvdHlwZS5uZXh0ID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHZhciBfYSwgX2I7XG4gICAgICAgIChfYiA9IChfYSA9IHRoaXMuZGVzdGluYXRpb24pID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS5uZXh0KSA9PT0gbnVsbCB8fCBfYiA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2IuY2FsbChfYSwgdmFsdWUpO1xuICAgIH07XG4gICAgQW5vbnltb3VzU3ViamVjdC5wcm90b3R5cGUuZXJyb3IgPSBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgIHZhciBfYSwgX2I7XG4gICAgICAgIChfYiA9IChfYSA9IHRoaXMuZGVzdGluYXRpb24pID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS5lcnJvcikgPT09IG51bGwgfHwgX2IgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9iLmNhbGwoX2EsIGVycik7XG4gICAgfTtcbiAgICBBbm9ueW1vdXNTdWJqZWN0LnByb3RvdHlwZS5jb21wbGV0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIF9hLCBfYjtcbiAgICAgICAgKF9iID0gKF9hID0gdGhpcy5kZXN0aW5hdGlvbikgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLmNvbXBsZXRlKSA9PT0gbnVsbCB8fCBfYiA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2IuY2FsbChfYSk7XG4gICAgfTtcbiAgICBBbm9ueW1vdXNTdWJqZWN0LnByb3RvdHlwZS5fc3Vic2NyaWJlID0gZnVuY3Rpb24gKHN1YnNjcmliZXIpIHtcbiAgICAgICAgdmFyIF9hLCBfYjtcbiAgICAgICAgcmV0dXJuIChfYiA9IChfYSA9IHRoaXMuc291cmNlKSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2Euc3Vic2NyaWJlKHN1YnNjcmliZXIpKSAhPT0gbnVsbCAmJiBfYiAhPT0gdm9pZCAwID8gX2IgOiBFTVBUWV9TVUJTQ1JJUFRJT047XG4gICAgfTtcbiAgICByZXR1cm4gQW5vbnltb3VzU3ViamVjdDtcbn0oU3ViamVjdCkpO1xuZXhwb3J0IHsgQW5vbnltb3VzU3ViamVjdCB9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9U3ViamVjdC5qcy5tYXAiLCJpbXBvcnQgeyBvcGVyYXRlIH0gZnJvbSAnLi4vdXRpbC9saWZ0JztcbmltcG9ydCB7IGNyZWF0ZU9wZXJhdG9yU3Vic2NyaWJlciB9IGZyb20gJy4vT3BlcmF0b3JTdWJzY3JpYmVyJztcbmV4cG9ydCBmdW5jdGlvbiBtYXAocHJvamVjdCwgdGhpc0FyZykge1xuICAgIHJldHVybiBvcGVyYXRlKGZ1bmN0aW9uIChzb3VyY2UsIHN1YnNjcmliZXIpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gMDtcbiAgICAgICAgc291cmNlLnN1YnNjcmliZShjcmVhdGVPcGVyYXRvclN1YnNjcmliZXIoc3Vic2NyaWJlciwgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICBzdWJzY3JpYmVyLm5leHQocHJvamVjdC5jYWxsKHRoaXNBcmcsIHZhbHVlLCBpbmRleCsrKSk7XG4gICAgICAgIH0pKTtcbiAgICB9KTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hcC5qcy5tYXAiLCIvLyBDb3B5cmlnaHQgKGMpIC5ORVQgRm91bmRhdGlvbiBhbmQgY29udHJpYnV0b3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuIFNlZSBMSUNFTlNFIGZpbGUgaW4gdGhlIHByb2plY3Qgcm9vdCBmb3IgZnVsbCBsaWNlbnNlIGluZm9ybWF0aW9uLlxyXG5cclxuaW1wb3J0ICogYXMgcnhqcyBmcm9tICdyeGpzJztcclxuaW1wb3J0ICogYXMgY29udHJhY3RzIGZyb20gJy4vY29udHJhY3RzJztcclxuaW1wb3J0ICogYXMgZGlzcG9zYWJsZXMgZnJvbSAnLi9kaXNwb3NhYmxlcyc7XHJcblxyXG5leHBvcnQgdHlwZSBLZXJuZWxDb21tYW5kT3JFdmVudEVudmVsb3BlID0gY29udHJhY3RzLktlcm5lbENvbW1hbmRFbnZlbG9wZSB8IGNvbnRyYWN0cy5LZXJuZWxFdmVudEVudmVsb3BlO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGlzS2VybmVsQ29tbWFuZEVudmVsb3BlKGNvbW1hbmRPckV2ZW50OiBLZXJuZWxDb21tYW5kT3JFdmVudEVudmVsb3BlKTogY29tbWFuZE9yRXZlbnQgaXMgY29udHJhY3RzLktlcm5lbENvbW1hbmRFbnZlbG9wZSB7XHJcbiAgICByZXR1cm4gKDxhbnk+Y29tbWFuZE9yRXZlbnQpLmNvbW1hbmRUeXBlICE9PSB1bmRlZmluZWQ7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBpc0tlcm5lbEV2ZW50RW52ZWxvcGUoY29tbWFuZE9yRXZlbnQ6IEtlcm5lbENvbW1hbmRPckV2ZW50RW52ZWxvcGUpOiBjb21tYW5kT3JFdmVudCBpcyBjb250cmFjdHMuS2VybmVsRXZlbnRFbnZlbG9wZSB7XHJcbiAgICByZXR1cm4gKDxhbnk+Y29tbWFuZE9yRXZlbnQpLmV2ZW50VHlwZSAhPT0gdW5kZWZpbmVkO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElLZXJuZWxDb21tYW5kQW5kRXZlbnRSZWNlaXZlciBleHRlbmRzIHJ4anMuU3Vic2NyaWJhYmxlPEtlcm5lbENvbW1hbmRPckV2ZW50RW52ZWxvcGU+IHtcclxuXHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSUtlcm5lbENvbW1hbmRBbmRFdmVudFNlbmRlciB7XHJcbiAgICBzZW5kKGtlcm5lbENvbW1hbmRPckV2ZW50RW52ZWxvcGU6IEtlcm5lbENvbW1hbmRPckV2ZW50RW52ZWxvcGUpOiBQcm9taXNlPHZvaWQ+O1xyXG4gICAgZ2V0IHJlbW90ZUhvc3RVcmkoKTogc3RyaW5nO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgS2VybmVsQ29tbWFuZEFuZEV2ZW50UmVjZWl2ZXIgaW1wbGVtZW50cyBJS2VybmVsQ29tbWFuZEFuZEV2ZW50UmVjZWl2ZXIge1xyXG4gICAgcHJpdmF0ZSBfb2JzZXJ2YWJsZTogcnhqcy5TdWJzY3JpYmFibGU8S2VybmVsQ29tbWFuZE9yRXZlbnRFbnZlbG9wZT47XHJcbiAgICBwcml2YXRlIF9kaXNwb3NhYmxlczogZGlzcG9zYWJsZXMuRGlzcG9zYWJsZVtdID0gW107XHJcblxyXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihvYnNlcnZlcjogcnhqcy5PYnNlcnZhYmxlPEtlcm5lbENvbW1hbmRPckV2ZW50RW52ZWxvcGU+KSB7XHJcbiAgICAgICAgdGhpcy5fb2JzZXJ2YWJsZSA9IG9ic2VydmVyO1xyXG4gICAgfVxyXG5cclxuICAgIHN1YnNjcmliZShvYnNlcnZlcjogUGFydGlhbDxyeGpzLk9ic2VydmVyPEtlcm5lbENvbW1hbmRPckV2ZW50RW52ZWxvcGU+Pik6IHJ4anMuVW5zdWJzY3JpYmFibGUge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9vYnNlcnZhYmxlLnN1YnNjcmliZShvYnNlcnZlcik7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICAgICAgZm9yIChsZXQgZGlzcG9zYWJsZSBvZiB0aGlzLl9kaXNwb3NhYmxlcykge1xyXG4gICAgICAgICAgICBkaXNwb3NhYmxlLmRpc3Bvc2UoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBGcm9tT2JzZXJ2YWJsZShvYnNlcnZhYmxlOiByeGpzLk9ic2VydmFibGU8S2VybmVsQ29tbWFuZE9yRXZlbnRFbnZlbG9wZT4pOiBJS2VybmVsQ29tbWFuZEFuZEV2ZW50UmVjZWl2ZXIge1xyXG4gICAgICAgIHJldHVybiBuZXcgS2VybmVsQ29tbWFuZEFuZEV2ZW50UmVjZWl2ZXIob2JzZXJ2YWJsZSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBGcm9tRXZlbnRMaXN0ZW5lcihhcmdzOiB7IG1hcDogKGRhdGE6IEV2ZW50KSA9PiBLZXJuZWxDb21tYW5kT3JFdmVudEVudmVsb3BlLCBldmVudFRhcmdldDogRXZlbnRUYXJnZXQsIGV2ZW50OiBzdHJpbmcgfSk6IElLZXJuZWxDb21tYW5kQW5kRXZlbnRSZWNlaXZlciB7XHJcbiAgICAgICAgbGV0IHN1YmplY3QgPSBuZXcgcnhqcy5TdWJqZWN0PEtlcm5lbENvbW1hbmRPckV2ZW50RW52ZWxvcGU+KCk7XHJcbiAgICAgICAgYXJncy5ldmVudFRhcmdldC5hZGRFdmVudExpc3RlbmVyKGFyZ3MuZXZlbnQsIChlOiBFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgbWFwcGVkID0gYXJncy5tYXAoZSk7XHJcbiAgICAgICAgICAgIHN1YmplY3QubmV4dChtYXBwZWQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBuZXcgS2VybmVsQ29tbWFuZEFuZEV2ZW50UmVjZWl2ZXIoc3ViamVjdCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGlzT2JzZXJ2YWJsZShzb3VyY2U6IGFueSk6IHNvdXJjZSBpcyByeGpzLk9ic2VydmVyPEtlcm5lbENvbW1hbmRPckV2ZW50RW52ZWxvcGU+IHtcclxuICAgIHJldHVybiAoPGFueT5zb3VyY2UpLm5leHQgIT09IHVuZGVmaW5lZDtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEtlcm5lbENvbW1hbmRBbmRFdmVudFNlbmRlciBpbXBsZW1lbnRzIElLZXJuZWxDb21tYW5kQW5kRXZlbnRTZW5kZXIge1xyXG4gICAgcHJpdmF0ZSBfcmVtb3RlSG9zdFVyaTogc3RyaW5nO1xyXG4gICAgcHJpdmF0ZSBfc2VuZGVyPzogcnhqcy5PYnNlcnZlcjxLZXJuZWxDb21tYW5kT3JFdmVudEVudmVsb3BlPiB8ICgoa2VybmVsRXZlbnRFbnZlbG9wZTogS2VybmVsQ29tbWFuZE9yRXZlbnRFbnZlbG9wZSkgPT4gdm9pZCk7XHJcbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKHJlbW90ZUhvc3RVcmk6IHN0cmluZykge1xyXG4gICAgICAgIHRoaXMuX3JlbW90ZUhvc3RVcmkgPSByZW1vdGVIb3N0VXJpO1xyXG4gICAgfVxyXG4gICAgc2VuZChrZXJuZWxDb21tYW5kT3JFdmVudEVudmVsb3BlOiBLZXJuZWxDb21tYW5kT3JFdmVudEVudmVsb3BlKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3NlbmRlcikge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB0aGlzLl9zZW5kZXIgPT09IFwiZnVuY3Rpb25cIikge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3NlbmRlcihrZXJuZWxDb21tYW5kT3JFdmVudEVudmVsb3BlKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoaXNPYnNlcnZhYmxlKHRoaXMuX3NlbmRlcikpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9zZW5kZXIubmV4dChrZXJuZWxDb21tYW5kT3JFdmVudEVudmVsb3BlKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBFcnJvcihcIlNlbmRlciBpcyBub3Qgc2V0XCIpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChlcnJvcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKFwiU2VuZGVyIGlzIG5vdCBzZXRcIikpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCByZW1vdGVIb3N0VXJpKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3JlbW90ZUhvc3RVcmk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBGcm9tT2JzZXJ2ZXIob2JzZXJ2ZXI6IHJ4anMuT2JzZXJ2ZXI8S2VybmVsQ29tbWFuZE9yRXZlbnRFbnZlbG9wZT4pOiBJS2VybmVsQ29tbWFuZEFuZEV2ZW50U2VuZGVyIHtcclxuICAgICAgICBjb25zdCBzZW5kZXIgPSBuZXcgS2VybmVsQ29tbWFuZEFuZEV2ZW50U2VuZGVyKFwiXCIpO1xyXG4gICAgICAgIHNlbmRlci5fc2VuZGVyID0gb2JzZXJ2ZXI7XHJcbiAgICAgICAgcmV0dXJuIHNlbmRlcjtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIEZyb21GdW5jdGlvbihzZW5kOiAoa2VybmVsRXZlbnRFbnZlbG9wZTogS2VybmVsQ29tbWFuZE9yRXZlbnRFbnZlbG9wZSkgPT4gdm9pZCk6IElLZXJuZWxDb21tYW5kQW5kRXZlbnRTZW5kZXIge1xyXG4gICAgICAgIGNvbnN0IHNlbmRlciA9IG5ldyBLZXJuZWxDb21tYW5kQW5kRXZlbnRTZW5kZXIoXCJcIik7XHJcbiAgICAgICAgc2VuZGVyLl9zZW5kZXIgPSBzZW5kO1xyXG4gICAgICAgIHJldHVybiBzZW5kZXI7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBpc1NldE9mU3RyaW5nKGNvbGxlY3Rpb246IGFueSk6IGNvbGxlY3Rpb24gaXMgU2V0PHN0cmluZz4ge1xyXG4gICAgcmV0dXJuIHR5cGVvZiAoY29sbGVjdGlvbikgIT09IHR5cGVvZiAobmV3IFNldDxzdHJpbmc+KCkpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gaXNBcnJheU9mU3RyaW5nKGNvbGxlY3Rpb246IGFueSk6IGNvbGxlY3Rpb24gaXMgc3RyaW5nW10ge1xyXG4gICAgcmV0dXJuIEFycmF5LmlzQXJyYXkoY29sbGVjdGlvbikgJiYgY29sbGVjdGlvbi5sZW5ndGggPiAwICYmIHR5cGVvZiAoY29sbGVjdGlvblswXSkgPT09IHR5cGVvZiAoXCJcIik7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiB0cnlBZGRVcmlUb1JvdXRpbmdTbGlwKGtlcm5lbENvbW1hbmRPckV2ZW50RW52ZWxvcGU6IEtlcm5lbENvbW1hbmRPckV2ZW50RW52ZWxvcGUsIGtlcm5lbFVyaTogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICBpZiAoa2VybmVsQ29tbWFuZE9yRXZlbnRFbnZlbG9wZS5yb3V0aW5nU2xpcCA9PT0gdW5kZWZpbmVkIHx8IGtlcm5lbENvbW1hbmRPckV2ZW50RW52ZWxvcGUucm91dGluZ1NsaXAgPT09IG51bGwpIHtcclxuICAgICAgICBrZXJuZWxDb21tYW5kT3JFdmVudEVudmVsb3BlLnJvdXRpbmdTbGlwID0gW107XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHZhciBjYW5BZGQgPSAha2VybmVsQ29tbWFuZE9yRXZlbnRFbnZlbG9wZS5yb3V0aW5nU2xpcC5maW5kKGUgPT4gZSA9PT0ga2VybmVsVXJpKTtcclxuICAgIGlmIChjYW5BZGQpIHtcclxuICAgICAgICBrZXJuZWxDb21tYW5kT3JFdmVudEVudmVsb3BlLnJvdXRpbmdTbGlwLnB1c2goa2VybmVsVXJpKTtcclxuICAgICAgICBrZXJuZWxDb21tYW5kT3JFdmVudEVudmVsb3BlLnJvdXRpbmdTbGlwOy8vP1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBjYW5BZGQ7XHJcbn0iLCIvLyBDb3B5cmlnaHQgKGMpIC5ORVQgRm91bmRhdGlvbiBhbmQgY29udHJpYnV0b3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuIFNlZSBMSUNFTlNFIGZpbGUgaW4gdGhlIHByb2plY3Qgcm9vdCBmb3IgZnVsbCBsaWNlbnNlIGluZm9ybWF0aW9uLlxyXG5cclxuLy8gR2VuZXJhdGVkIFR5cGVTY3JpcHQgaW50ZXJmYWNlcyBhbmQgdHlwZXMuXHJcblxyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gS2VybmVsIENvbW1hbmRzXHJcblxyXG5leHBvcnQgY29uc3QgQWRkUGFja2FnZVR5cGUgPSBcIkFkZFBhY2thZ2VcIjtcclxuZXhwb3J0IGNvbnN0IENhbmNlbFR5cGUgPSBcIkNhbmNlbFwiO1xyXG5leHBvcnQgY29uc3QgQ2hhbmdlV29ya2luZ0RpcmVjdG9yeVR5cGUgPSBcIkNoYW5nZVdvcmtpbmdEaXJlY3RvcnlcIjtcclxuZXhwb3J0IGNvbnN0IENvbXBpbGVQcm9qZWN0VHlwZSA9IFwiQ29tcGlsZVByb2plY3RcIjtcclxuZXhwb3J0IGNvbnN0IERpc3BsYXlFcnJvclR5cGUgPSBcIkRpc3BsYXlFcnJvclwiO1xyXG5leHBvcnQgY29uc3QgRGlzcGxheVZhbHVlVHlwZSA9IFwiRGlzcGxheVZhbHVlXCI7XHJcbmV4cG9ydCBjb25zdCBPcGVuRG9jdW1lbnRUeXBlID0gXCJPcGVuRG9jdW1lbnRcIjtcclxuZXhwb3J0IGNvbnN0IE9wZW5Qcm9qZWN0VHlwZSA9IFwiT3BlblByb2plY3RcIjtcclxuZXhwb3J0IGNvbnN0IFF1aXRUeXBlID0gXCJRdWl0XCI7XHJcbmV4cG9ydCBjb25zdCBSZXF1ZXN0Q29tcGxldGlvbnNUeXBlID0gXCJSZXF1ZXN0Q29tcGxldGlvbnNcIjtcclxuZXhwb3J0IGNvbnN0IFJlcXVlc3REaWFnbm9zdGljc1R5cGUgPSBcIlJlcXVlc3REaWFnbm9zdGljc1wiO1xyXG5leHBvcnQgY29uc3QgUmVxdWVzdEhvdmVyVGV4dFR5cGUgPSBcIlJlcXVlc3RIb3ZlclRleHRcIjtcclxuZXhwb3J0IGNvbnN0IFJlcXVlc3RJbnB1dFR5cGUgPSBcIlJlcXVlc3RJbnB1dFwiO1xyXG5leHBvcnQgY29uc3QgUmVxdWVzdEtlcm5lbEluZm9UeXBlID0gXCJSZXF1ZXN0S2VybmVsSW5mb1wiO1xyXG5leHBvcnQgY29uc3QgUmVxdWVzdFNpZ25hdHVyZUhlbHBUeXBlID0gXCJSZXF1ZXN0U2lnbmF0dXJlSGVscFwiO1xyXG5leHBvcnQgY29uc3QgUmVxdWVzdFZhbHVlVHlwZSA9IFwiUmVxdWVzdFZhbHVlXCI7XHJcbmV4cG9ydCBjb25zdCBSZXF1ZXN0VmFsdWVJbmZvc1R5cGUgPSBcIlJlcXVlc3RWYWx1ZUluZm9zXCI7XHJcbmV4cG9ydCBjb25zdCBTZW5kRWRpdGFibGVDb2RlVHlwZSA9IFwiU2VuZEVkaXRhYmxlQ29kZVwiO1xyXG5leHBvcnQgY29uc3QgU3VibWl0Q29kZVR5cGUgPSBcIlN1Ym1pdENvZGVcIjtcclxuZXhwb3J0IGNvbnN0IFVwZGF0ZURpc3BsYXllZFZhbHVlVHlwZSA9IFwiVXBkYXRlRGlzcGxheWVkVmFsdWVcIjtcclxuXHJcbmV4cG9ydCB0eXBlIEtlcm5lbENvbW1hbmRUeXBlID1cclxuICAgICAgdHlwZW9mIEFkZFBhY2thZ2VUeXBlXHJcbiAgICB8IHR5cGVvZiBDYW5jZWxUeXBlXHJcbiAgICB8IHR5cGVvZiBDaGFuZ2VXb3JraW5nRGlyZWN0b3J5VHlwZVxyXG4gICAgfCB0eXBlb2YgQ29tcGlsZVByb2plY3RUeXBlXHJcbiAgICB8IHR5cGVvZiBEaXNwbGF5RXJyb3JUeXBlXHJcbiAgICB8IHR5cGVvZiBEaXNwbGF5VmFsdWVUeXBlXHJcbiAgICB8IHR5cGVvZiBPcGVuRG9jdW1lbnRUeXBlXHJcbiAgICB8IHR5cGVvZiBPcGVuUHJvamVjdFR5cGVcclxuICAgIHwgdHlwZW9mIFF1aXRUeXBlXHJcbiAgICB8IHR5cGVvZiBSZXF1ZXN0Q29tcGxldGlvbnNUeXBlXHJcbiAgICB8IHR5cGVvZiBSZXF1ZXN0RGlhZ25vc3RpY3NUeXBlXHJcbiAgICB8IHR5cGVvZiBSZXF1ZXN0SG92ZXJUZXh0VHlwZVxyXG4gICAgfCB0eXBlb2YgUmVxdWVzdElucHV0VHlwZVxyXG4gICAgfCB0eXBlb2YgUmVxdWVzdEtlcm5lbEluZm9UeXBlXHJcbiAgICB8IHR5cGVvZiBSZXF1ZXN0U2lnbmF0dXJlSGVscFR5cGVcclxuICAgIHwgdHlwZW9mIFJlcXVlc3RWYWx1ZVR5cGVcclxuICAgIHwgdHlwZW9mIFJlcXVlc3RWYWx1ZUluZm9zVHlwZVxyXG4gICAgfCB0eXBlb2YgU2VuZEVkaXRhYmxlQ29kZVR5cGVcclxuICAgIHwgdHlwZW9mIFN1Ym1pdENvZGVUeXBlXHJcbiAgICB8IHR5cGVvZiBVcGRhdGVEaXNwbGF5ZWRWYWx1ZVR5cGU7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEFkZFBhY2thZ2UgZXh0ZW5kcyBLZXJuZWxDb21tYW5kIHtcclxuICAgIHBhY2thZ2VSZWZlcmVuY2U6IFBhY2thZ2VSZWZlcmVuY2U7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgS2VybmVsQ29tbWFuZCB7XHJcbiAgICB0YXJnZXRLZXJuZWxOYW1lPzogc3RyaW5nO1xyXG4gICAgb3JpZ2luVXJpPzogc3RyaW5nO1xyXG4gICAgZGVzdGluYXRpb25Vcmk/OiBzdHJpbmc7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgQ2FuY2VsIGV4dGVuZHMgS2VybmVsQ29tbWFuZCB7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgQ2hhbmdlV29ya2luZ0RpcmVjdG9yeSBleHRlbmRzIEtlcm5lbENvbW1hbmQge1xyXG4gICAgd29ya2luZ0RpcmVjdG9yeTogc3RyaW5nO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIENvbXBpbGVQcm9qZWN0IGV4dGVuZHMgS2VybmVsQ29tbWFuZCB7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgRGlzcGxheUVycm9yIGV4dGVuZHMgS2VybmVsQ29tbWFuZCB7XHJcbiAgICBtZXNzYWdlOiBzdHJpbmc7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgRGlzcGxheVZhbHVlIGV4dGVuZHMgS2VybmVsQ29tbWFuZCB7XHJcbiAgICBmb3JtYXR0ZWRWYWx1ZTogRm9ybWF0dGVkVmFsdWU7XHJcbiAgICB2YWx1ZUlkOiBzdHJpbmc7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgT3BlbkRvY3VtZW50IGV4dGVuZHMgS2VybmVsQ29tbWFuZCB7XHJcbiAgICByZWxhdGl2ZUZpbGVQYXRoOiBzdHJpbmc7XHJcbiAgICByZWdpb25OYW1lPzogc3RyaW5nO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIE9wZW5Qcm9qZWN0IGV4dGVuZHMgS2VybmVsQ29tbWFuZCB7XHJcbiAgICBwcm9qZWN0OiBQcm9qZWN0O1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFF1aXQgZXh0ZW5kcyBLZXJuZWxDb21tYW5kIHtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBSZXF1ZXN0Q29tcGxldGlvbnMgZXh0ZW5kcyBMYW5ndWFnZVNlcnZpY2VDb21tYW5kIHtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBMYW5ndWFnZVNlcnZpY2VDb21tYW5kIGV4dGVuZHMgS2VybmVsQ29tbWFuZCB7XHJcbiAgICBjb2RlOiBzdHJpbmc7XHJcbiAgICBsaW5lUG9zaXRpb246IExpbmVQb3NpdGlvbjtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBSZXF1ZXN0RGlhZ25vc3RpY3MgZXh0ZW5kcyBLZXJuZWxDb21tYW5kIHtcclxuICAgIGNvZGU6IHN0cmluZztcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBSZXF1ZXN0SG92ZXJUZXh0IGV4dGVuZHMgTGFuZ3VhZ2VTZXJ2aWNlQ29tbWFuZCB7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgUmVxdWVzdElucHV0IGV4dGVuZHMgS2VybmVsQ29tbWFuZCB7XHJcbiAgICBwcm9tcHQ6IHN0cmluZztcclxuICAgIGlzUGFzc3dvcmQ6IGJvb2xlYW47XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgUmVxdWVzdEtlcm5lbEluZm8gZXh0ZW5kcyBLZXJuZWxDb21tYW5kIHtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBSZXF1ZXN0U2lnbmF0dXJlSGVscCBleHRlbmRzIExhbmd1YWdlU2VydmljZUNvbW1hbmQge1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFJlcXVlc3RWYWx1ZSBleHRlbmRzIEtlcm5lbENvbW1hbmQge1xyXG4gICAgbmFtZTogc3RyaW5nO1xyXG4gICAgbWltZVR5cGU6IHN0cmluZztcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBSZXF1ZXN0VmFsdWVJbmZvcyBleHRlbmRzIEtlcm5lbENvbW1hbmQge1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFNlbmRFZGl0YWJsZUNvZGUgZXh0ZW5kcyBLZXJuZWxDb21tYW5kIHtcclxuICAgIGxhbmd1YWdlOiBzdHJpbmc7XHJcbiAgICBjb2RlOiBzdHJpbmc7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgU3VibWl0Q29kZSBleHRlbmRzIEtlcm5lbENvbW1hbmQge1xyXG4gICAgY29kZTogc3RyaW5nO1xyXG4gICAgc3VibWlzc2lvblR5cGU/OiBTdWJtaXNzaW9uVHlwZTtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBVcGRhdGVEaXNwbGF5ZWRWYWx1ZSBleHRlbmRzIEtlcm5lbENvbW1hbmQge1xyXG4gICAgZm9ybWF0dGVkVmFsdWU6IEZvcm1hdHRlZFZhbHVlO1xyXG4gICAgdmFsdWVJZDogc3RyaW5nO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEtlcm5lbEV2ZW50IHtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBEaXNwbGF5RWxlbWVudCBleHRlbmRzIEludGVyYWN0aXZlRG9jdW1lbnRPdXRwdXRFbGVtZW50IHtcclxuICAgIGRhdGE6IHsgW2tleTogc3RyaW5nXTogYW55OyB9O1xyXG4gICAgbWV0YWRhdGE6IHsgW2tleTogc3RyaW5nXTogYW55OyB9O1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEludGVyYWN0aXZlRG9jdW1lbnRPdXRwdXRFbGVtZW50IHtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBSZXR1cm5WYWx1ZUVsZW1lbnQgZXh0ZW5kcyBJbnRlcmFjdGl2ZURvY3VtZW50T3V0cHV0RWxlbWVudCB7XHJcbiAgICBkYXRhOiB7IFtrZXk6IHN0cmluZ106IGFueTsgfTtcclxuICAgIGV4ZWN1dGlvbk9yZGVyOiBudW1iZXI7XHJcbiAgICBtZXRhZGF0YTogeyBba2V5OiBzdHJpbmddOiBhbnk7IH07XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgVGV4dEVsZW1lbnQgZXh0ZW5kcyBJbnRlcmFjdGl2ZURvY3VtZW50T3V0cHV0RWxlbWVudCB7XHJcbiAgICBuYW1lOiBzdHJpbmc7XHJcbiAgICB0ZXh0OiBzdHJpbmc7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgRXJyb3JFbGVtZW50IGV4dGVuZHMgSW50ZXJhY3RpdmVEb2N1bWVudE91dHB1dEVsZW1lbnQge1xyXG4gICAgZXJyb3JOYW1lOiBzdHJpbmc7XHJcbiAgICBlcnJvclZhbHVlOiBzdHJpbmc7XHJcbiAgICBzdGFja1RyYWNlOiBBcnJheTxzdHJpbmc+O1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIE5vdGVib29rUGFyc2VSZXF1ZXN0IGV4dGVuZHMgTm90ZWJvb2tQYXJzZU9yU2VyaWFsaXplUmVxdWVzdCB7XHJcbiAgICB0eXBlOiBSZXF1ZXN0VHlwZTtcclxuICAgIHJhd0RhdGE6IFVpbnQ4QXJyYXk7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgTm90ZWJvb2tQYXJzZU9yU2VyaWFsaXplUmVxdWVzdCB7XHJcbiAgICB0eXBlOiBSZXF1ZXN0VHlwZTtcclxuICAgIGlkOiBzdHJpbmc7XHJcbiAgICBzZXJpYWxpemF0aW9uVHlwZTogRG9jdW1lbnRTZXJpYWxpemF0aW9uVHlwZTtcclxuICAgIGRlZmF1bHRMYW5ndWFnZTogc3RyaW5nO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIE5vdGVib29rU2VyaWFsaXplUmVxdWVzdCBleHRlbmRzIE5vdGVib29rUGFyc2VPclNlcmlhbGl6ZVJlcXVlc3Qge1xyXG4gICAgdHlwZTogUmVxdWVzdFR5cGU7XHJcbiAgICBuZXdMaW5lOiBzdHJpbmc7XHJcbiAgICBkb2N1bWVudDogSW50ZXJhY3RpdmVEb2N1bWVudDtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBOb3RlYm9va1BhcnNlUmVzcG9uc2UgZXh0ZW5kcyBOb3RlYm9va1BhcnNlclNlcnZlclJlc3BvbnNlIHtcclxuICAgIGRvY3VtZW50OiBJbnRlcmFjdGl2ZURvY3VtZW50O1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIE5vdGVib29rUGFyc2VyU2VydmVyUmVzcG9uc2Uge1xyXG4gICAgaWQ6IHN0cmluZztcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBOb3RlYm9va1NlcmlhbGl6ZVJlc3BvbnNlIGV4dGVuZHMgTm90ZWJvb2tQYXJzZXJTZXJ2ZXJSZXNwb25zZSB7XHJcbiAgICByYXdEYXRhOiBVaW50OEFycmF5O1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIE5vdGVib29rRXJyb3JSZXNwb25zZSBleHRlbmRzIE5vdGVib29rUGFyc2VyU2VydmVyUmVzcG9uc2Uge1xyXG4gICAgZXJyb3JNZXNzYWdlOiBzdHJpbmc7XHJcbn1cclxuXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBLZXJuZWwgZXZlbnRzXHJcblxyXG5leHBvcnQgY29uc3QgQXNzZW1ibHlQcm9kdWNlZFR5cGUgPSBcIkFzc2VtYmx5UHJvZHVjZWRcIjtcclxuZXhwb3J0IGNvbnN0IENvZGVTdWJtaXNzaW9uUmVjZWl2ZWRUeXBlID0gXCJDb2RlU3VibWlzc2lvblJlY2VpdmVkXCI7XHJcbmV4cG9ydCBjb25zdCBDb21tYW5kQ2FuY2VsbGVkVHlwZSA9IFwiQ29tbWFuZENhbmNlbGxlZFwiO1xyXG5leHBvcnQgY29uc3QgQ29tbWFuZEZhaWxlZFR5cGUgPSBcIkNvbW1hbmRGYWlsZWRcIjtcclxuZXhwb3J0IGNvbnN0IENvbW1hbmRTdWNjZWVkZWRUeXBlID0gXCJDb21tYW5kU3VjY2VlZGVkXCI7XHJcbmV4cG9ydCBjb25zdCBDb21wbGV0ZUNvZGVTdWJtaXNzaW9uUmVjZWl2ZWRUeXBlID0gXCJDb21wbGV0ZUNvZGVTdWJtaXNzaW9uUmVjZWl2ZWRcIjtcclxuZXhwb3J0IGNvbnN0IENvbXBsZXRpb25zUHJvZHVjZWRUeXBlID0gXCJDb21wbGV0aW9uc1Byb2R1Y2VkXCI7XHJcbmV4cG9ydCBjb25zdCBEaWFnbm9zdGljTG9nRW50cnlQcm9kdWNlZFR5cGUgPSBcIkRpYWdub3N0aWNMb2dFbnRyeVByb2R1Y2VkXCI7XHJcbmV4cG9ydCBjb25zdCBEaWFnbm9zdGljc1Byb2R1Y2VkVHlwZSA9IFwiRGlhZ25vc3RpY3NQcm9kdWNlZFwiO1xyXG5leHBvcnQgY29uc3QgRGlzcGxheWVkVmFsdWVQcm9kdWNlZFR5cGUgPSBcIkRpc3BsYXllZFZhbHVlUHJvZHVjZWRcIjtcclxuZXhwb3J0IGNvbnN0IERpc3BsYXllZFZhbHVlVXBkYXRlZFR5cGUgPSBcIkRpc3BsYXllZFZhbHVlVXBkYXRlZFwiO1xyXG5leHBvcnQgY29uc3QgRG9jdW1lbnRPcGVuZWRUeXBlID0gXCJEb2N1bWVudE9wZW5lZFwiO1xyXG5leHBvcnQgY29uc3QgRXJyb3JQcm9kdWNlZFR5cGUgPSBcIkVycm9yUHJvZHVjZWRcIjtcclxuZXhwb3J0IGNvbnN0IEhvdmVyVGV4dFByb2R1Y2VkVHlwZSA9IFwiSG92ZXJUZXh0UHJvZHVjZWRcIjtcclxuZXhwb3J0IGNvbnN0IEluY29tcGxldGVDb2RlU3VibWlzc2lvblJlY2VpdmVkVHlwZSA9IFwiSW5jb21wbGV0ZUNvZGVTdWJtaXNzaW9uUmVjZWl2ZWRcIjtcclxuZXhwb3J0IGNvbnN0IElucHV0UHJvZHVjZWRUeXBlID0gXCJJbnB1dFByb2R1Y2VkXCI7XHJcbmV4cG9ydCBjb25zdCBLZXJuZWxFeHRlbnNpb25Mb2FkZWRUeXBlID0gXCJLZXJuZWxFeHRlbnNpb25Mb2FkZWRcIjtcclxuZXhwb3J0IGNvbnN0IEtlcm5lbEluZm9Qcm9kdWNlZFR5cGUgPSBcIktlcm5lbEluZm9Qcm9kdWNlZFwiO1xyXG5leHBvcnQgY29uc3QgS2VybmVsUmVhZHlUeXBlID0gXCJLZXJuZWxSZWFkeVwiO1xyXG5leHBvcnQgY29uc3QgUGFja2FnZUFkZGVkVHlwZSA9IFwiUGFja2FnZUFkZGVkXCI7XHJcbmV4cG9ydCBjb25zdCBQcm9qZWN0T3BlbmVkVHlwZSA9IFwiUHJvamVjdE9wZW5lZFwiO1xyXG5leHBvcnQgY29uc3QgUmV0dXJuVmFsdWVQcm9kdWNlZFR5cGUgPSBcIlJldHVyblZhbHVlUHJvZHVjZWRcIjtcclxuZXhwb3J0IGNvbnN0IFNpZ25hdHVyZUhlbHBQcm9kdWNlZFR5cGUgPSBcIlNpZ25hdHVyZUhlbHBQcm9kdWNlZFwiO1xyXG5leHBvcnQgY29uc3QgU3RhbmRhcmRFcnJvclZhbHVlUHJvZHVjZWRUeXBlID0gXCJTdGFuZGFyZEVycm9yVmFsdWVQcm9kdWNlZFwiO1xyXG5leHBvcnQgY29uc3QgU3RhbmRhcmRPdXRwdXRWYWx1ZVByb2R1Y2VkVHlwZSA9IFwiU3RhbmRhcmRPdXRwdXRWYWx1ZVByb2R1Y2VkXCI7XHJcbmV4cG9ydCBjb25zdCBWYWx1ZUluZm9zUHJvZHVjZWRUeXBlID0gXCJWYWx1ZUluZm9zUHJvZHVjZWRcIjtcclxuZXhwb3J0IGNvbnN0IFZhbHVlUHJvZHVjZWRUeXBlID0gXCJWYWx1ZVByb2R1Y2VkXCI7XHJcbmV4cG9ydCBjb25zdCBXb3JraW5nRGlyZWN0b3J5Q2hhbmdlZFR5cGUgPSBcIldvcmtpbmdEaXJlY3RvcnlDaGFuZ2VkXCI7XHJcblxyXG5leHBvcnQgdHlwZSBLZXJuZWxFdmVudFR5cGUgPVxyXG4gICAgICB0eXBlb2YgQXNzZW1ibHlQcm9kdWNlZFR5cGVcclxuICAgIHwgdHlwZW9mIENvZGVTdWJtaXNzaW9uUmVjZWl2ZWRUeXBlXHJcbiAgICB8IHR5cGVvZiBDb21tYW5kQ2FuY2VsbGVkVHlwZVxyXG4gICAgfCB0eXBlb2YgQ29tbWFuZEZhaWxlZFR5cGVcclxuICAgIHwgdHlwZW9mIENvbW1hbmRTdWNjZWVkZWRUeXBlXHJcbiAgICB8IHR5cGVvZiBDb21wbGV0ZUNvZGVTdWJtaXNzaW9uUmVjZWl2ZWRUeXBlXHJcbiAgICB8IHR5cGVvZiBDb21wbGV0aW9uc1Byb2R1Y2VkVHlwZVxyXG4gICAgfCB0eXBlb2YgRGlhZ25vc3RpY0xvZ0VudHJ5UHJvZHVjZWRUeXBlXHJcbiAgICB8IHR5cGVvZiBEaWFnbm9zdGljc1Byb2R1Y2VkVHlwZVxyXG4gICAgfCB0eXBlb2YgRGlzcGxheWVkVmFsdWVQcm9kdWNlZFR5cGVcclxuICAgIHwgdHlwZW9mIERpc3BsYXllZFZhbHVlVXBkYXRlZFR5cGVcclxuICAgIHwgdHlwZW9mIERvY3VtZW50T3BlbmVkVHlwZVxyXG4gICAgfCB0eXBlb2YgRXJyb3JQcm9kdWNlZFR5cGVcclxuICAgIHwgdHlwZW9mIEhvdmVyVGV4dFByb2R1Y2VkVHlwZVxyXG4gICAgfCB0eXBlb2YgSW5jb21wbGV0ZUNvZGVTdWJtaXNzaW9uUmVjZWl2ZWRUeXBlXHJcbiAgICB8IHR5cGVvZiBJbnB1dFByb2R1Y2VkVHlwZVxyXG4gICAgfCB0eXBlb2YgS2VybmVsRXh0ZW5zaW9uTG9hZGVkVHlwZVxyXG4gICAgfCB0eXBlb2YgS2VybmVsSW5mb1Byb2R1Y2VkVHlwZVxyXG4gICAgfCB0eXBlb2YgS2VybmVsUmVhZHlUeXBlXHJcbiAgICB8IHR5cGVvZiBQYWNrYWdlQWRkZWRUeXBlXHJcbiAgICB8IHR5cGVvZiBQcm9qZWN0T3BlbmVkVHlwZVxyXG4gICAgfCB0eXBlb2YgUmV0dXJuVmFsdWVQcm9kdWNlZFR5cGVcclxuICAgIHwgdHlwZW9mIFNpZ25hdHVyZUhlbHBQcm9kdWNlZFR5cGVcclxuICAgIHwgdHlwZW9mIFN0YW5kYXJkRXJyb3JWYWx1ZVByb2R1Y2VkVHlwZVxyXG4gICAgfCB0eXBlb2YgU3RhbmRhcmRPdXRwdXRWYWx1ZVByb2R1Y2VkVHlwZVxyXG4gICAgfCB0eXBlb2YgVmFsdWVJbmZvc1Byb2R1Y2VkVHlwZVxyXG4gICAgfCB0eXBlb2YgVmFsdWVQcm9kdWNlZFR5cGVcclxuICAgIHwgdHlwZW9mIFdvcmtpbmdEaXJlY3RvcnlDaGFuZ2VkVHlwZTtcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgQXNzZW1ibHlQcm9kdWNlZCBleHRlbmRzIEtlcm5lbEV2ZW50IHtcclxuICAgIGFzc2VtYmx5OiBCYXNlNjRFbmNvZGVkQXNzZW1ibHk7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgQ29kZVN1Ym1pc3Npb25SZWNlaXZlZCBleHRlbmRzIEtlcm5lbEV2ZW50IHtcclxuICAgIGNvZGU6IHN0cmluZztcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBDb21tYW5kQ2FuY2VsbGVkIGV4dGVuZHMgS2VybmVsRXZlbnQge1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIENvbW1hbmRGYWlsZWQgZXh0ZW5kcyBLZXJuZWxFdmVudCB7XHJcbiAgICBtZXNzYWdlOiBzdHJpbmc7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgQ29tbWFuZFN1Y2NlZWRlZCBleHRlbmRzIEtlcm5lbEV2ZW50IHtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBDb21wbGV0ZUNvZGVTdWJtaXNzaW9uUmVjZWl2ZWQgZXh0ZW5kcyBLZXJuZWxFdmVudCB7XHJcbiAgICBjb2RlOiBzdHJpbmc7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgQ29tcGxldGlvbnNQcm9kdWNlZCBleHRlbmRzIEtlcm5lbEV2ZW50IHtcclxuICAgIGxpbmVQb3NpdGlvblNwYW4/OiBMaW5lUG9zaXRpb25TcGFuO1xyXG4gICAgY29tcGxldGlvbnM6IEFycmF5PENvbXBsZXRpb25JdGVtPjtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBEaWFnbm9zdGljTG9nRW50cnlQcm9kdWNlZCBleHRlbmRzIERpYWdub3N0aWNFdmVudCB7XHJcbiAgICBtZXNzYWdlOiBzdHJpbmc7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgRGlhZ25vc3RpY0V2ZW50IGV4dGVuZHMgS2VybmVsRXZlbnQge1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIERpYWdub3N0aWNzUHJvZHVjZWQgZXh0ZW5kcyBLZXJuZWxFdmVudCB7XHJcbiAgICBkaWFnbm9zdGljczogQXJyYXk8RGlhZ25vc3RpYz47XHJcbiAgICBmb3JtYXR0ZWREaWFnbm9zdGljczogQXJyYXk8Rm9ybWF0dGVkVmFsdWU+O1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIERpc3BsYXllZFZhbHVlUHJvZHVjZWQgZXh0ZW5kcyBEaXNwbGF5RXZlbnQge1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIERpc3BsYXlFdmVudCBleHRlbmRzIEtlcm5lbEV2ZW50IHtcclxuICAgIGZvcm1hdHRlZFZhbHVlczogQXJyYXk8Rm9ybWF0dGVkVmFsdWU+O1xyXG4gICAgdmFsdWVJZD86IHN0cmluZztcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBEaXNwbGF5ZWRWYWx1ZVVwZGF0ZWQgZXh0ZW5kcyBEaXNwbGF5RXZlbnQge1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIERvY3VtZW50T3BlbmVkIGV4dGVuZHMgS2VybmVsRXZlbnQge1xyXG4gICAgcmVsYXRpdmVGaWxlUGF0aDogc3RyaW5nO1xyXG4gICAgcmVnaW9uTmFtZT86IHN0cmluZztcclxuICAgIGNvbnRlbnQ6IHN0cmluZztcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBFcnJvclByb2R1Y2VkIGV4dGVuZHMgRGlzcGxheUV2ZW50IHtcclxuICAgIG1lc3NhZ2U6IHN0cmluZztcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBIb3ZlclRleHRQcm9kdWNlZCBleHRlbmRzIEtlcm5lbEV2ZW50IHtcclxuICAgIGNvbnRlbnQ6IEFycmF5PEZvcm1hdHRlZFZhbHVlPjtcclxuICAgIGxpbmVQb3NpdGlvblNwYW4/OiBMaW5lUG9zaXRpb25TcGFuO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEluY29tcGxldGVDb2RlU3VibWlzc2lvblJlY2VpdmVkIGV4dGVuZHMgS2VybmVsRXZlbnQge1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElucHV0UHJvZHVjZWQgZXh0ZW5kcyBLZXJuZWxFdmVudCB7XHJcbiAgICB2YWx1ZTogc3RyaW5nO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEtlcm5lbEV4dGVuc2lvbkxvYWRlZCBleHRlbmRzIEtlcm5lbEV2ZW50IHtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBLZXJuZWxJbmZvUHJvZHVjZWQgZXh0ZW5kcyBLZXJuZWxFdmVudCB7XHJcbiAgICBrZXJuZWxJbmZvOiBLZXJuZWxJbmZvO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEtlcm5lbFJlYWR5IGV4dGVuZHMgS2VybmVsRXZlbnQge1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFBhY2thZ2VBZGRlZCBleHRlbmRzIEtlcm5lbEV2ZW50IHtcclxuICAgIHBhY2thZ2VSZWZlcmVuY2U6IFJlc29sdmVkUGFja2FnZVJlZmVyZW5jZTtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBQcm9qZWN0T3BlbmVkIGV4dGVuZHMgS2VybmVsRXZlbnQge1xyXG4gICAgcHJvamVjdEl0ZW1zOiBBcnJheTxQcm9qZWN0SXRlbT47XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgUmV0dXJuVmFsdWVQcm9kdWNlZCBleHRlbmRzIERpc3BsYXlFdmVudCB7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgU2lnbmF0dXJlSGVscFByb2R1Y2VkIGV4dGVuZHMgS2VybmVsRXZlbnQge1xyXG4gICAgc2lnbmF0dXJlczogQXJyYXk8U2lnbmF0dXJlSW5mb3JtYXRpb24+O1xyXG4gICAgYWN0aXZlU2lnbmF0dXJlSW5kZXg6IG51bWJlcjtcclxuICAgIGFjdGl2ZVBhcmFtZXRlckluZGV4OiBudW1iZXI7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgU3RhbmRhcmRFcnJvclZhbHVlUHJvZHVjZWQgZXh0ZW5kcyBEaXNwbGF5RXZlbnQge1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFN0YW5kYXJkT3V0cHV0VmFsdWVQcm9kdWNlZCBleHRlbmRzIERpc3BsYXlFdmVudCB7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgVmFsdWVJbmZvc1Byb2R1Y2VkIGV4dGVuZHMgS2VybmVsRXZlbnQge1xyXG4gICAgdmFsdWVJbmZvczogQXJyYXk8S2VybmVsVmFsdWVJbmZvPjtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBWYWx1ZVByb2R1Y2VkIGV4dGVuZHMgS2VybmVsRXZlbnQge1xyXG4gICAgbmFtZTogc3RyaW5nO1xyXG4gICAgZm9ybWF0dGVkVmFsdWU6IEZvcm1hdHRlZFZhbHVlO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFdvcmtpbmdEaXJlY3RvcnlDaGFuZ2VkIGV4dGVuZHMgS2VybmVsRXZlbnQge1xyXG4gICAgd29ya2luZ0RpcmVjdG9yeTogc3RyaW5nO1xyXG59XHJcblxyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gUmVxdWlyZWQgVHlwZXNcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgQmFzZTY0RW5jb2RlZEFzc2VtYmx5IHtcclxuICAgIHZhbHVlOiBzdHJpbmc7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgQ29tcGxldGlvbkl0ZW0ge1xyXG4gICAgZGlzcGxheVRleHQ6IHN0cmluZztcclxuICAgIGtpbmQ6IHN0cmluZztcclxuICAgIGZpbHRlclRleHQ6IHN0cmluZztcclxuICAgIHNvcnRUZXh0OiBzdHJpbmc7XHJcbiAgICBpbnNlcnRUZXh0OiBzdHJpbmc7XHJcbiAgICBpbnNlcnRUZXh0Rm9ybWF0PzogSW5zZXJ0VGV4dEZvcm1hdDtcclxuICAgIGRvY3VtZW50YXRpb246IHN0cmluZztcclxufVxyXG5cclxuZXhwb3J0IGVudW0gSW5zZXJ0VGV4dEZvcm1hdCB7XHJcbiAgICBQbGFpblRleHQgPSBcInBsYWludGV4dFwiLFxyXG4gICAgU25pcHBldCA9IFwic25pcHBldFwiLFxyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIERpYWdub3N0aWMge1xyXG4gICAgbGluZVBvc2l0aW9uU3BhbjogTGluZVBvc2l0aW9uU3BhbjtcclxuICAgIHNldmVyaXR5OiBEaWFnbm9zdGljU2V2ZXJpdHk7XHJcbiAgICBjb2RlOiBzdHJpbmc7XHJcbiAgICBtZXNzYWdlOiBzdHJpbmc7XHJcbn1cclxuXHJcbmV4cG9ydCBlbnVtIERpYWdub3N0aWNTZXZlcml0eSB7XHJcbiAgICBIaWRkZW4gPSBcImhpZGRlblwiLFxyXG4gICAgSW5mbyA9IFwiaW5mb1wiLFxyXG4gICAgV2FybmluZyA9IFwid2FybmluZ1wiLFxyXG4gICAgRXJyb3IgPSBcImVycm9yXCIsXHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgTGluZVBvc2l0aW9uU3BhbiB7XHJcbiAgICBzdGFydDogTGluZVBvc2l0aW9uO1xyXG4gICAgZW5kOiBMaW5lUG9zaXRpb247XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgTGluZVBvc2l0aW9uIHtcclxuICAgIGxpbmU6IG51bWJlcjtcclxuICAgIGNoYXJhY3RlcjogbnVtYmVyO1xyXG59XHJcblxyXG5leHBvcnQgZW51bSBEb2N1bWVudFNlcmlhbGl6YXRpb25UeXBlIHtcclxuICAgIERpYiA9IFwiZGliXCIsXHJcbiAgICBJcHluYiA9IFwiaXB5bmJcIixcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBGb3JtYXR0ZWRWYWx1ZSB7XHJcbiAgICBtaW1lVHlwZTogc3RyaW5nO1xyXG4gICAgdmFsdWU6IHN0cmluZztcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJbnRlcmFjdGl2ZURvY3VtZW50IHtcclxuICAgIGVsZW1lbnRzOiBBcnJheTxJbnRlcmFjdGl2ZURvY3VtZW50RWxlbWVudD47XHJcbiAgICBtZXRhZGF0YTogeyBba2V5OiBzdHJpbmddOiBhbnk7IH07XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSW50ZXJhY3RpdmVEb2N1bWVudEVsZW1lbnQge1xyXG4gICAgaWQ/OiBzdHJpbmc7XHJcbiAgICBsYW5ndWFnZT86IHN0cmluZztcclxuICAgIGNvbnRlbnRzOiBzdHJpbmc7XHJcbiAgICBvdXRwdXRzOiBBcnJheTxJbnRlcmFjdGl2ZURvY3VtZW50T3V0cHV0RWxlbWVudD47XHJcbiAgICBleGVjdXRpb25PcmRlcjogbnVtYmVyO1xyXG4gICAgbWV0YWRhdGE/OiB7IFtrZXk6IHN0cmluZ106IGFueTsgfTtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBLZXJuZWxJbmZvIHtcclxuICAgIGFsaWFzZXM6IEFycmF5PHN0cmluZz47XHJcbiAgICBsYW5ndWFnZU5hbWU/OiBzdHJpbmc7XHJcbiAgICBsYW5ndWFnZVZlcnNpb24/OiBzdHJpbmc7XHJcbiAgICBsb2NhbE5hbWU6IHN0cmluZztcclxuICAgIHVyaT86IHN0cmluZztcclxuICAgIHJlbW90ZVVyaT86IHN0cmluZztcclxuICAgIHN1cHBvcnRlZEtlcm5lbENvbW1hbmRzOiBBcnJheTxLZXJuZWxDb21tYW5kSW5mbz47XHJcbiAgICBzdXBwb3J0ZWREaXJlY3RpdmVzOiBBcnJheTxLZXJuZWxEaXJlY3RpdmVJbmZvPjtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBLZXJuZWxDb21tYW5kSW5mbyB7XHJcbiAgICBuYW1lOiBzdHJpbmc7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgS2VybmVsRGlyZWN0aXZlSW5mbyB7XHJcbiAgICBuYW1lOiBzdHJpbmc7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgS2VybmVsVmFsdWVJbmZvIHtcclxuICAgIG5hbWU6IHN0cmluZztcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBQYWNrYWdlUmVmZXJlbmNlIHtcclxuICAgIHBhY2thZ2VOYW1lOiBzdHJpbmc7XHJcbiAgICBwYWNrYWdlVmVyc2lvbjogc3RyaW5nO1xyXG4gICAgaXNQYWNrYWdlVmVyc2lvblNwZWNpZmllZDogYm9vbGVhbjtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBQcm9qZWN0IHtcclxuICAgIGZpbGVzOiBBcnJheTxQcm9qZWN0RmlsZT47XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgUHJvamVjdEZpbGUge1xyXG4gICAgcmVsYXRpdmVGaWxlUGF0aDogc3RyaW5nO1xyXG4gICAgY29udGVudDogc3RyaW5nO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFByb2plY3RJdGVtIHtcclxuICAgIHJlbGF0aXZlRmlsZVBhdGg6IHN0cmluZztcclxuICAgIHJlZ2lvbk5hbWVzOiBBcnJheTxzdHJpbmc+O1xyXG4gICAgcmVnaW9uc0NvbnRlbnQ6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nOyB9O1xyXG59XHJcblxyXG5leHBvcnQgZW51bSBSZXF1ZXN0VHlwZSB7XHJcbiAgICBQYXJzZSA9IFwicGFyc2VcIixcclxuICAgIFNlcmlhbGl6ZSA9IFwic2VyaWFsaXplXCIsXHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgUmVzb2x2ZWRQYWNrYWdlUmVmZXJlbmNlIGV4dGVuZHMgUGFja2FnZVJlZmVyZW5jZSB7XHJcbiAgICBhc3NlbWJseVBhdGhzOiBBcnJheTxzdHJpbmc+O1xyXG4gICAgcHJvYmluZ1BhdGhzOiBBcnJheTxzdHJpbmc+O1xyXG4gICAgcGFja2FnZVJvb3Q6IHN0cmluZztcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBTaWduYXR1cmVJbmZvcm1hdGlvbiB7XHJcbiAgICBsYWJlbDogc3RyaW5nO1xyXG4gICAgZG9jdW1lbnRhdGlvbjogRm9ybWF0dGVkVmFsdWU7XHJcbiAgICBwYXJhbWV0ZXJzOiBBcnJheTxQYXJhbWV0ZXJJbmZvcm1hdGlvbj47XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgUGFyYW1ldGVySW5mb3JtYXRpb24ge1xyXG4gICAgbGFiZWw6IHN0cmluZztcclxuICAgIGRvY3VtZW50YXRpb246IEZvcm1hdHRlZFZhbHVlO1xyXG59XHJcblxyXG5leHBvcnQgZW51bSBTdWJtaXNzaW9uVHlwZSB7XHJcbiAgICBSdW4gPSBcInJ1blwiLFxyXG4gICAgRGlhZ25vc2UgPSBcImRpYWdub3NlXCIsXHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgS2VybmVsRXZlbnRFbnZlbG9wZSB7XHJcbiAgICBldmVudFR5cGU6IEtlcm5lbEV2ZW50VHlwZTtcclxuICAgIGV2ZW50OiBLZXJuZWxFdmVudDtcclxuICAgIGNvbW1hbmQ/OiBLZXJuZWxDb21tYW5kRW52ZWxvcGU7XHJcbiAgICByb3V0aW5nU2xpcD86IHN0cmluZ1tdO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEtlcm5lbENvbW1hbmRFbnZlbG9wZSB7XHJcbiAgICB0b2tlbj86IHN0cmluZztcclxuICAgIGlkPzogc3RyaW5nO1xyXG4gICAgY29tbWFuZFR5cGU6IEtlcm5lbENvbW1hbmRUeXBlO1xyXG4gICAgY29tbWFuZDogS2VybmVsQ29tbWFuZDtcclxuICAgIHJvdXRpbmdTbGlwPzogc3RyaW5nW107XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgS2VybmVsRXZlbnRFbnZlbG9wZU9ic2VydmVyIHtcclxuICAgIChldmVudEVudmVsb3BlOiBLZXJuZWxFdmVudEVudmVsb3BlKTogdm9pZDtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBLZXJuZWxDb21tYW5kRW52ZWxvcGVIYW5kbGVyIHtcclxuICAgIChldmVudEVudmVsb3BlOiBLZXJuZWxDb21tYW5kRW52ZWxvcGUpOiBQcm9taXNlPHZvaWQ+O1xyXG59IiwiLy8gQ29weXJpZ2h0IChjKSAuTkVUIEZvdW5kYXRpb24gYW5kIGNvbnRyaWJ1dG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLiBTZWUgTElDRU5TRSBmaWxlIGluIHRoZSBwcm9qZWN0IHJvb3QgZm9yIGZ1bGwgbGljZW5zZSBpbmZvcm1hdGlvbi5cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBpc1Byb21pc2VDb21wbGV0aW9uU291cmNlPFQ+KG9iajogYW55KTogb2JqIGlzIFByb21pc2VDb21wbGV0aW9uU291cmNlPFQ+IHtcclxuICAgIHJldHVybiBvYmoucHJvbWlzZVxyXG4gICAgICAgICYmIG9iai5yZXNvbHZlXHJcbiAgICAgICAgJiYgb2JqLnJlamVjdDtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFByb21pc2VDb21wbGV0aW9uU291cmNlPFQ+IHtcclxuICAgIHByaXZhdGUgX3Jlc29sdmU6ICh2YWx1ZTogVCkgPT4gdm9pZCA9ICgpID0+IHsgfTtcclxuICAgIHByaXZhdGUgX3JlamVjdDogKHJlYXNvbjogYW55KSA9PiB2b2lkID0gKCkgPT4geyB9O1xyXG4gICAgcmVhZG9ubHkgcHJvbWlzZTogUHJvbWlzZTxUPjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLnByb21pc2UgPSBuZXcgUHJvbWlzZTxUPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuX3Jlc29sdmUgPSByZXNvbHZlO1xyXG4gICAgICAgICAgICB0aGlzLl9yZWplY3QgPSByZWplY3Q7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmVzb2x2ZSh2YWx1ZTogVCkge1xyXG4gICAgICAgIHRoaXMuX3Jlc29sdmUodmFsdWUpO1xyXG4gICAgfVxyXG5cclxuICAgIHJlamVjdChyZWFzb246IGFueSkge1xyXG4gICAgICAgIHRoaXMuX3JlamVjdChyZWFzb24pO1xyXG4gICAgfVxyXG59XHJcbiIsIi8vIENvcHlyaWdodCAoYykgLk5FVCBGb3VuZGF0aW9uIGFuZCBjb250cmlidXRvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZS4gU2VlIExJQ0VOU0UgZmlsZSBpbiB0aGUgcHJvamVjdCByb290IGZvciBmdWxsIGxpY2Vuc2UgaW5mb3JtYXRpb24uXHJcblxyXG5pbXBvcnQgKiBhcyByeGpzIGZyb20gXCJyeGpzXCI7XHJcbmltcG9ydCB7IHRyeUFkZFVyaVRvUm91dGluZ1NsaXAgfSBmcm9tIFwiLi9jb25uZWN0aW9uXCI7XHJcbmltcG9ydCAqIGFzIGNvbnRyYWN0cyBmcm9tIFwiLi9jb250cmFjdHNcIjtcclxuaW1wb3J0IHsgRGlzcG9zYWJsZSB9IGZyb20gXCIuL2Rpc3Bvc2FibGVzXCI7XHJcbmltcG9ydCB7IGdldEtlcm5lbFVyaSwgSUtlcm5lbEV2ZW50T2JzZXJ2ZXIsIEtlcm5lbCB9IGZyb20gXCIuL2tlcm5lbFwiO1xyXG5pbXBvcnQgeyBQcm9taXNlQ29tcGxldGlvblNvdXJjZSB9IGZyb20gXCIuL3Byb21pc2VDb21wbGV0aW9uU291cmNlXCI7XHJcblxyXG5cclxuZXhwb3J0IGNsYXNzIEtlcm5lbEludm9jYXRpb25Db250ZXh0IGltcGxlbWVudHMgRGlzcG9zYWJsZSB7XHJcbiAgICBwdWJsaWMgZ2V0IHByb21pc2UoKTogdm9pZCB8IFByb21pc2VMaWtlPHZvaWQ+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jb21wbGV0aW9uU291cmNlLnByb21pc2U7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIHN0YXRpYyBfY3VycmVudDogS2VybmVsSW52b2NhdGlvbkNvbnRleHQgfCBudWxsID0gbnVsbDtcclxuICAgIHByaXZhdGUgcmVhZG9ubHkgX2NvbW1hbmRFbnZlbG9wZTogY29udHJhY3RzLktlcm5lbENvbW1hbmRFbnZlbG9wZTtcclxuICAgIHByaXZhdGUgcmVhZG9ubHkgX2NoaWxkQ29tbWFuZHM6IGNvbnRyYWN0cy5LZXJuZWxDb21tYW5kRW52ZWxvcGVbXSA9IFtdO1xyXG4gICAgcHJpdmF0ZSByZWFkb25seSBfZXZlbnRTdWJqZWN0OiByeGpzLlN1YmplY3Q8Y29udHJhY3RzLktlcm5lbEV2ZW50RW52ZWxvcGU+ID0gbmV3IHJ4anMuU3ViamVjdDxjb250cmFjdHMuS2VybmVsRXZlbnRFbnZlbG9wZT4oKTtcclxuXHJcbiAgICBwcml2YXRlIF9pc0NvbXBsZXRlID0gZmFsc2U7XHJcbiAgICBwcml2YXRlIF9oYW5kbGluZ0tlcm5lbDogS2VybmVsIHwgbnVsbCA9IG51bGw7XHJcblxyXG4gICAgcHVibGljIGdldCBoYW5kbGluZ0tlcm5lbCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5faGFuZGxpbmdLZXJuZWw7XHJcbiAgICB9O1xyXG5cclxuICAgIHB1YmxpYyBnZXQga2VybmVsRXZlbnRzKCk6IHJ4anMuT2JzZXJ2YWJsZTxjb250cmFjdHMuS2VybmVsRXZlbnRFbnZlbG9wZT4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9ldmVudFN1YmplY3QuYXNPYnNlcnZhYmxlKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIHB1YmxpYyBzZXQgaGFuZGxpbmdLZXJuZWwodmFsdWU6IEtlcm5lbCB8IG51bGwpIHtcclxuICAgICAgICB0aGlzLl9oYW5kbGluZ0tlcm5lbCA9IHZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgY29tcGxldGlvblNvdXJjZSA9IG5ldyBQcm9taXNlQ29tcGxldGlvblNvdXJjZTx2b2lkPigpO1xyXG4gICAgc3RhdGljIGVzdGFibGlzaChrZXJuZWxDb21tYW5kSW52b2NhdGlvbjogY29udHJhY3RzLktlcm5lbENvbW1hbmRFbnZlbG9wZSk6IEtlcm5lbEludm9jYXRpb25Db250ZXh0IHtcclxuICAgICAgICBsZXQgY3VycmVudCA9IEtlcm5lbEludm9jYXRpb25Db250ZXh0Ll9jdXJyZW50O1xyXG4gICAgICAgIGlmICghY3VycmVudCB8fCBjdXJyZW50Ll9pc0NvbXBsZXRlKSB7XHJcbiAgICAgICAgICAgIEtlcm5lbEludm9jYXRpb25Db250ZXh0Ll9jdXJyZW50ID0gbmV3IEtlcm5lbEludm9jYXRpb25Db250ZXh0KGtlcm5lbENvbW1hbmRJbnZvY2F0aW9uKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAoIWFyZUNvbW1hbmRzVGhlU2FtZShrZXJuZWxDb21tYW5kSW52b2NhdGlvbiwgY3VycmVudC5fY29tbWFuZEVudmVsb3BlKSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZm91bmQgPSBjdXJyZW50Ll9jaGlsZENvbW1hbmRzLmluY2x1ZGVzKGtlcm5lbENvbW1hbmRJbnZvY2F0aW9uKTtcclxuICAgICAgICAgICAgICAgIGlmICghZm91bmQpIHtcclxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50Ll9jaGlsZENvbW1hbmRzLnB1c2goa2VybmVsQ29tbWFuZEludm9jYXRpb24pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gS2VybmVsSW52b2NhdGlvbkNvbnRleHQuX2N1cnJlbnQhO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBnZXQgY3VycmVudCgpOiBLZXJuZWxJbnZvY2F0aW9uQ29udGV4dCB8IG51bGwgeyByZXR1cm4gdGhpcy5fY3VycmVudDsgfVxyXG4gICAgZ2V0IGNvbW1hbmQoKTogY29udHJhY3RzLktlcm5lbENvbW1hbmQgeyByZXR1cm4gdGhpcy5fY29tbWFuZEVudmVsb3BlLmNvbW1hbmQ7IH1cclxuICAgIGdldCBjb21tYW5kRW52ZWxvcGUoKTogY29udHJhY3RzLktlcm5lbENvbW1hbmRFbnZlbG9wZSB7IHJldHVybiB0aGlzLl9jb21tYW5kRW52ZWxvcGU7IH1cclxuICAgIGNvbnN0cnVjdG9yKGtlcm5lbENvbW1hbmRJbnZvY2F0aW9uOiBjb250cmFjdHMuS2VybmVsQ29tbWFuZEVudmVsb3BlKSB7XHJcbiAgICAgICAgdGhpcy5fY29tbWFuZEVudmVsb3BlID0ga2VybmVsQ29tbWFuZEludm9jYXRpb247XHJcbiAgICB9XHJcblxyXG4gICAgY29tcGxldGUoY29tbWFuZDogY29udHJhY3RzLktlcm5lbENvbW1hbmRFbnZlbG9wZSkge1xyXG4gICAgICAgIGlmIChjb21tYW5kID09PSB0aGlzLl9jb21tYW5kRW52ZWxvcGUpIHtcclxuICAgICAgICAgICAgdGhpcy5faXNDb21wbGV0ZSA9IHRydWU7XHJcbiAgICAgICAgICAgIGxldCBzdWNjZWVkZWQ6IGNvbnRyYWN0cy5Db21tYW5kU3VjY2VlZGVkID0ge307XHJcbiAgICAgICAgICAgIGxldCBldmVudEVudmVsb3BlOiBjb250cmFjdHMuS2VybmVsRXZlbnRFbnZlbG9wZSA9IHtcclxuICAgICAgICAgICAgICAgIGNvbW1hbmQ6IHRoaXMuX2NvbW1hbmRFbnZlbG9wZSxcclxuICAgICAgICAgICAgICAgIGV2ZW50VHlwZTogY29udHJhY3RzLkNvbW1hbmRTdWNjZWVkZWRUeXBlLFxyXG4gICAgICAgICAgICAgICAgZXZlbnQ6IHN1Y2NlZWRlZFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB0aGlzLmludGVybmFsUHVibGlzaChldmVudEVudmVsb3BlKTtcclxuICAgICAgICAgICAgdGhpcy5jb21wbGV0aW9uU291cmNlLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgLy8gVE9ETzogQyMgdmVyc2lvbiBoYXMgY29tcGxldGlvbiBjYWxsYmFja3MgLSBkbyB3ZSBuZWVkIHRoZXNlP1xyXG4gICAgICAgICAgICAvLyBpZiAoIV9ldmVudHMuSXNEaXNwb3NlZClcclxuICAgICAgICAgICAgLy8ge1xyXG4gICAgICAgICAgICAvLyAgICAgX2V2ZW50cy5PbkNvbXBsZXRlZCgpO1xyXG4gICAgICAgICAgICAvLyB9XHJcblxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgbGV0IHBvcyA9IHRoaXMuX2NoaWxkQ29tbWFuZHMuaW5kZXhPZihjb21tYW5kKTtcclxuICAgICAgICAgICAgZGVsZXRlIHRoaXMuX2NoaWxkQ29tbWFuZHNbcG9zXTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZmFpbChtZXNzYWdlPzogc3RyaW5nKSB7XHJcbiAgICAgICAgLy8gVE9ETzpcclxuICAgICAgICAvLyBUaGUgQyMgY29kZSBhY2NlcHRzIGEgbWVzc2FnZSBhbmQvb3IgYW4gZXhjZXB0aW9uLiBEbyB3ZSBuZWVkIHRvIGFkZCBzdXBwb3J0XHJcbiAgICAgICAgLy8gZm9yIGV4Y2VwdGlvbnM/IChUaGUgVFMgQ29tbWFuZEZhaWxlZCBpbnRlcmZhY2UgZG9lc24ndCBoYXZlIGEgcGxhY2UgZm9yIGl0IHJpZ2h0IG5vdy4pXHJcbiAgICAgICAgdGhpcy5faXNDb21wbGV0ZSA9IHRydWU7XHJcbiAgICAgICAgbGV0IGZhaWxlZDogY29udHJhY3RzLkNvbW1hbmRGYWlsZWQgPSB7IG1lc3NhZ2U6IG1lc3NhZ2UgPz8gXCJDb21tYW5kIEZhaWxlZFwiIH07XHJcbiAgICAgICAgbGV0IGV2ZW50RW52ZWxvcGU6IGNvbnRyYWN0cy5LZXJuZWxFdmVudEVudmVsb3BlID0ge1xyXG4gICAgICAgICAgICBjb21tYW5kOiB0aGlzLl9jb21tYW5kRW52ZWxvcGUsXHJcbiAgICAgICAgICAgIGV2ZW50VHlwZTogY29udHJhY3RzLkNvbW1hbmRGYWlsZWRUeXBlLFxyXG4gICAgICAgICAgICBldmVudDogZmFpbGVkXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5pbnRlcm5hbFB1Ymxpc2goZXZlbnRFbnZlbG9wZSk7XHJcbiAgICAgICAgdGhpcy5jb21wbGV0aW9uU291cmNlLnJlc29sdmUoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaXNoKGtlcm5lbEV2ZW50OiBjb250cmFjdHMuS2VybmVsRXZlbnRFbnZlbG9wZSkge1xyXG4gICAgICAgIGlmICghdGhpcy5faXNDb21wbGV0ZSkge1xyXG4gICAgICAgICAgICB0aGlzLmludGVybmFsUHVibGlzaChrZXJuZWxFdmVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaW50ZXJuYWxQdWJsaXNoKGtlcm5lbEV2ZW50OiBjb250cmFjdHMuS2VybmVsRXZlbnRFbnZlbG9wZSkge1xyXG4gICAgICAgIGlmICgha2VybmVsRXZlbnQuY29tbWFuZCkge1xyXG4gICAgICAgICAgICBrZXJuZWxFdmVudC5jb21tYW5kID0gdGhpcy5fY29tbWFuZEVudmVsb3BlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGNvbW1hbmQgPSBrZXJuZWxFdmVudC5jb21tYW5kO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5oYW5kbGluZ0tlcm5lbCkge1xyXG4gICAgICAgICAgICB0cnlBZGRVcmlUb1JvdXRpbmdTbGlwKGtlcm5lbEV2ZW50LCBnZXRLZXJuZWxVcmkodGhpcy5oYW5kbGluZ0tlcm5lbCkpO1xyXG4gICAgICAgICAgICBrZXJuZWxFdmVudC5yb3V0aW5nU2xpcDsvLz9cclxuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAga2VybmVsRXZlbnQ7Ly8/XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2NvbW1hbmRFbnZlbG9wZTsvLz9cclxuICAgICAgICBpZiAoY29tbWFuZCA9PT0gbnVsbCB8fFxyXG4gICAgICAgICAgICBjb21tYW5kID09PSB1bmRlZmluZWQgfHxcclxuICAgICAgICAgICAgYXJlQ29tbWFuZHNUaGVTYW1lKGNvbW1hbmQhLCB0aGlzLl9jb21tYW5kRW52ZWxvcGUpIHx8XHJcbiAgICAgICAgICAgIHRoaXMuX2NoaWxkQ29tbWFuZHMuaW5jbHVkZXMoY29tbWFuZCEpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2V2ZW50U3ViamVjdC5uZXh0KGtlcm5lbEV2ZW50KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaXNQYXJlbnRPZkNvbW1hbmQoY29tbWFuZEVudmVsb3BlOiBjb250cmFjdHMuS2VybmVsQ29tbWFuZEVudmVsb3BlKTogYm9vbGVhbiB7XHJcbiAgICAgICAgY29uc3QgY2hpbGRGb3VuZCA9IHRoaXMuX2NoaWxkQ29tbWFuZHMuaW5jbHVkZXMoY29tbWFuZEVudmVsb3BlKTtcclxuICAgICAgICByZXR1cm4gY2hpbGRGb3VuZDtcclxuICAgIH1cclxuXHJcbiAgICBkaXNwb3NlKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5faXNDb21wbGV0ZSkge1xyXG4gICAgICAgICAgICB0aGlzLmNvbXBsZXRlKHRoaXMuX2NvbW1hbmRFbnZlbG9wZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIEtlcm5lbEludm9jYXRpb25Db250ZXh0Ll9jdXJyZW50ID0gbnVsbDtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGFyZUNvbW1hbmRzVGhlU2FtZShlbnZlbG9wZTE6IGNvbnRyYWN0cy5LZXJuZWxDb21tYW5kRW52ZWxvcGUsIGVudmVsb3BlMjogY29udHJhY3RzLktlcm5lbENvbW1hbmRFbnZlbG9wZSk6IGJvb2xlYW4ge1xyXG4gICAgZW52ZWxvcGUxOy8vP1xyXG4gICAgZW52ZWxvcGUyOy8vP1xyXG4gICAgZW52ZWxvcGUxID09PSBlbnZlbG9wZTI7Ly8/XHJcbiAgICByZXR1cm4gZW52ZWxvcGUxID09PSBlbnZlbG9wZTJcclxuICAgICAgICB8fCAoZW52ZWxvcGUxPy5jb21tYW5kVHlwZSA9PT0gZW52ZWxvcGUyPy5jb21tYW5kVHlwZSAmJiBlbnZlbG9wZTE/LnRva2VuID09PSBlbnZlbG9wZTI/LnRva2VuKTtcclxufVxyXG4iLCIvLyBDb3B5cmlnaHQgKGMpIC5ORVQgRm91bmRhdGlvbiBhbmQgY29udHJpYnV0b3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuIFNlZSBMSUNFTlNFIGZpbGUgaW4gdGhlIHByb2plY3Qgcm9vdCBmb3IgZnVsbCBsaWNlbnNlIGluZm9ybWF0aW9uLlxyXG5cclxuaW1wb3J0IHsgS2VybmVsQ29tbWFuZEVudmVsb3BlIH0gZnJvbSBcIi4vY29udHJhY3RzXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgR3VpZCB7XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyB2YWxpZGF0b3IgPSBuZXcgUmVnRXhwKFwiXlthLXowLTldezh9LVthLXowLTldezR9LVthLXowLTldezR9LVthLXowLTldezR9LVthLXowLTldezEyfSRcIiwgXCJpXCIpO1xyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgRU1QVFkgPSBcIjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMFwiO1xyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgaXNHdWlkKGd1aWQ6IGFueSkge1xyXG4gICAgICAgIGNvbnN0IHZhbHVlOiBzdHJpbmcgPSBndWlkLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgcmV0dXJuIGd1aWQgJiYgKGd1aWQgaW5zdGFuY2VvZiBHdWlkIHx8IEd1aWQudmFsaWRhdG9yLnRlc3QodmFsdWUpKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZSgpOiBHdWlkIHtcclxuICAgICAgICByZXR1cm4gbmV3IEd1aWQoW0d1aWQuZ2VuKDIpLCBHdWlkLmdlbigxKSwgR3VpZC5nZW4oMSksIEd1aWQuZ2VuKDEpLCBHdWlkLmdlbigzKV0uam9pbihcIi1cIikpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlRW1wdHkoKTogR3VpZCB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBHdWlkKFwiZW1wdHlndWlkXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgcGFyc2UoZ3VpZDogc3RyaW5nKTogR3VpZCB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBHdWlkKGd1aWQpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgcmF3KCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIFtHdWlkLmdlbigyKSwgR3VpZC5nZW4oMSksIEd1aWQuZ2VuKDEpLCBHdWlkLmdlbigxKSwgR3VpZC5nZW4oMyldLmpvaW4oXCItXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc3RhdGljIGdlbihjb3VudDogbnVtYmVyKSB7XHJcbiAgICAgICAgbGV0IG91dDogc3RyaW5nID0gXCJcIjtcclxuICAgICAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgY291bnQ7IGkrKykge1xyXG4gICAgICAgICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tYml0d2lzZVxyXG4gICAgICAgICAgICBvdXQgKz0gKCgoMSArIE1hdGgucmFuZG9tKCkpICogMHgxMDAwMCkgfCAwKS50b1N0cmluZygxNikuc3Vic3RyaW5nKDEpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gb3V0O1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgdmFsdWU6IHN0cmluZztcclxuXHJcbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKGd1aWQ6IHN0cmluZykge1xyXG4gICAgICAgIGlmICghZ3VpZCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiSW52YWxpZCBhcmd1bWVudDsgYHZhbHVlYCBoYXMgbm8gdmFsdWUuXCIpOyB9XHJcblxyXG4gICAgICAgIHRoaXMudmFsdWUgPSBHdWlkLkVNUFRZO1xyXG5cclxuICAgICAgICBpZiAoZ3VpZCAmJiBHdWlkLmlzR3VpZChndWlkKSkge1xyXG4gICAgICAgICAgICB0aGlzLnZhbHVlID0gZ3VpZDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGVxdWFscyhvdGhlcjogR3VpZCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIC8vIENvbXBhcmluZyBzdHJpbmcgYHZhbHVlYCBhZ2FpbnN0IHByb3ZpZGVkIGBndWlkYCB3aWxsIGF1dG8tY2FsbFxyXG4gICAgICAgIC8vIHRvU3RyaW5nIG9uIGBndWlkYCBmb3IgY29tcGFyaXNvblxyXG4gICAgICAgIHJldHVybiBHdWlkLmlzR3VpZChvdGhlcikgJiYgdGhpcy52YWx1ZSA9PT0gb3RoZXIudG9TdHJpbmcoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaXNFbXB0eSgpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy52YWx1ZSA9PT0gR3VpZC5FTVBUWTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdG9TdHJpbmcoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy52YWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdG9KU09OKCk6IGFueSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgdmFsdWU6IHRoaXMudmFsdWUsXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gc2V0VG9rZW4oY29tbWFuZEVudmVsb3BlOiBLZXJuZWxDb21tYW5kRW52ZWxvcGUpIHtcclxuICAgIGlmICghY29tbWFuZEVudmVsb3BlLnRva2VuKSB7XHJcbiAgICAgICAgY29tbWFuZEVudmVsb3BlLnRva2VuID0gR3VpZC5jcmVhdGUoKS50b1N0cmluZygpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vXHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBUb2tlbkdlbmVyYXRvciB7XHJcbiAgICBwcml2YXRlIF9zZWVkOiBzdHJpbmc7XHJcbiAgICBwcml2YXRlIF9jb3VudGVyOiBudW1iZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5fc2VlZCA9IEd1aWQuY3JlYXRlKCkudG9TdHJpbmcoKTtcclxuICAgICAgICB0aGlzLl9jb3VudGVyID0gMDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgR2V0TmV3VG9rZW4oKTogc3RyaW5nIHtcclxuICAgICAgICB0aGlzLl9jb3VudGVyKys7XHJcbiAgICAgICAgcmV0dXJuIGAke3RoaXMuX3NlZWR9Ojoke3RoaXMuX2NvdW50ZXJ9YDtcclxuICAgIH1cclxufVxyXG4iLCIvLyBDb3B5cmlnaHQgKGMpIC5ORVQgRm91bmRhdGlvbiBhbmQgY29udHJpYnV0b3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuIFNlZSBMSUNFTlNFIGZpbGUgaW4gdGhlIHByb2plY3Qgcm9vdCBmb3IgZnVsbCBsaWNlbnNlIGluZm9ybWF0aW9uLlxyXG5cclxuZXhwb3J0IGVudW0gTG9nTGV2ZWwge1xyXG4gICAgSW5mbyA9IDAsXHJcbiAgICBXYXJuID0gMSxcclxuICAgIEVycm9yID0gMixcclxuICAgIE5vbmUgPSAzLFxyXG59XHJcblxyXG5leHBvcnQgdHlwZSBMb2dFbnRyeSA9IHtcclxuICAgIGxvZ0xldmVsOiBMb2dMZXZlbDtcclxuICAgIHNvdXJjZTogc3RyaW5nO1xyXG4gICAgbWVzc2FnZTogc3RyaW5nO1xyXG59O1xyXG5cclxuZXhwb3J0IGNsYXNzIExvZ2dlciB7XHJcblxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgX2RlZmF1bHQ6IExvZ2dlciA9IG5ldyBMb2dnZXIoJ2RlZmF1bHQnLCAoX2VudHJ5OiBMb2dFbnRyeSkgPT4geyB9KTtcclxuXHJcbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgc291cmNlOiBzdHJpbmcsIHJlYWRvbmx5IHdyaXRlOiAoZW50cnk6IExvZ0VudHJ5KSA9PiB2b2lkKSB7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGluZm8obWVzc2FnZTogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy53cml0ZSh7IGxvZ0xldmVsOiBMb2dMZXZlbC5JbmZvLCBzb3VyY2U6IHRoaXMuc291cmNlLCBtZXNzYWdlIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB3YXJuKG1lc3NhZ2U6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMud3JpdGUoeyBsb2dMZXZlbDogTG9nTGV2ZWwuV2Fybiwgc291cmNlOiB0aGlzLnNvdXJjZSwgbWVzc2FnZSB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZXJyb3IobWVzc2FnZTogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy53cml0ZSh7IGxvZ0xldmVsOiBMb2dMZXZlbC5FcnJvciwgc291cmNlOiB0aGlzLnNvdXJjZSwgbWVzc2FnZSB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIGNvbmZpZ3VyZShzb3VyY2U6IHN0cmluZywgd3JpdGVyOiAoZW50cnk6IExvZ0VudHJ5KSA9PiB2b2lkKSB7XHJcbiAgICAgICAgY29uc3QgbG9nZ2VyID0gbmV3IExvZ2dlcihzb3VyY2UsIHdyaXRlcik7XHJcbiAgICAgICAgTG9nZ2VyLl9kZWZhdWx0ID0gbG9nZ2VyO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0IGRlZmF1bHQoKTogTG9nZ2VyIHtcclxuICAgICAgICBpZiAoTG9nZ2VyLl9kZWZhdWx0KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBMb2dnZXIuX2RlZmF1bHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGxvZ2dlciBoYXMgYmVlbiBjb25maWd1cmVkIGZvciB0aGlzIGNvbnRleHQnKTtcclxuICAgIH1cclxufVxyXG4iLCIvLyBDb3B5cmlnaHQgKGMpIC5ORVQgRm91bmRhdGlvbiBhbmQgY29udHJpYnV0b3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuIFNlZSBMSUNFTlNFIGZpbGUgaW4gdGhlIHByb2plY3Qgcm9vdCBmb3IgZnVsbCBsaWNlbnNlIGluZm9ybWF0aW9uLlxyXG5cclxuaW1wb3J0IHsgUHJvbWlzZUNvbXBsZXRpb25Tb3VyY2UgfSBmcm9tIFwiLi9wcm9taXNlQ29tcGxldGlvblNvdXJjZVwiO1xyXG5cclxuXHJcbmludGVyZmFjZSBTY2hlZHVsZXJPcGVyYXRpb248VD4ge1xyXG4gICAgdmFsdWU6IFQ7XHJcbiAgICBleGVjdXRvcjogKHZhbHVlOiBUKSA9PiBQcm9taXNlPHZvaWQ+O1xyXG4gICAgcHJvbWlzZUNvbXBsZXRpb25Tb3VyY2U6IFByb21pc2VDb21wbGV0aW9uU291cmNlPHZvaWQ+O1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgS2VybmVsU2NoZWR1bGVyPFQ+IHtcclxuICAgIHByaXZhdGUgb3BlcmF0aW9uUXVldWU6IEFycmF5PFNjaGVkdWxlck9wZXJhdGlvbjxUPj4gPSBbXTtcclxuICAgIHByaXZhdGUgaW5GbGlnaHRPcGVyYXRpb24/OiBTY2hlZHVsZXJPcGVyYXRpb248VD47XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICB9XHJcblxyXG4gICAgcnVuQXN5bmModmFsdWU6IFQsIGV4ZWN1dG9yOiAodmFsdWU6IFQpID0+IFByb21pc2U8dm9pZD4pOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICBjb25zdCBvcGVyYXRpb24gPSB7XHJcbiAgICAgICAgICAgIHZhbHVlLFxyXG4gICAgICAgICAgICBleGVjdXRvcixcclxuICAgICAgICAgICAgcHJvbWlzZUNvbXBsZXRpb25Tb3VyY2U6IG5ldyBQcm9taXNlQ29tcGxldGlvblNvdXJjZTx2b2lkPigpLFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmluRmxpZ2h0T3BlcmF0aW9uKSB7XHJcbiAgICAgICAgICAgIC8vIGludm9rZSBpbW1lZGlhdGVseVxyXG4gICAgICAgICAgICByZXR1cm4gb3BlcmF0aW9uLmV4ZWN1dG9yKG9wZXJhdGlvbi52YWx1ZSlcclxuICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBvcGVyYXRpb24ucHJvbWlzZUNvbXBsZXRpb25Tb3VyY2UucmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5jYXRjaChlID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBvcGVyYXRpb24ucHJvbWlzZUNvbXBsZXRpb25Tb3VyY2UucmVqZWN0KGUpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLm9wZXJhdGlvblF1ZXVlLnB1c2gob3BlcmF0aW9uKTtcclxuICAgICAgICBpZiAodGhpcy5vcGVyYXRpb25RdWV1ZS5sZW5ndGggPT09IDEpIHtcclxuICAgICAgICAgICAgdGhpcy5leGVjdXRlTmV4dENvbW1hbmQoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBvcGVyYXRpb24ucHJvbWlzZUNvbXBsZXRpb25Tb3VyY2UucHJvbWlzZTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGV4ZWN1dGVOZXh0Q29tbWFuZCgpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBuZXh0T3BlcmF0aW9uID0gdGhpcy5vcGVyYXRpb25RdWV1ZS5sZW5ndGggPiAwID8gdGhpcy5vcGVyYXRpb25RdWV1ZVswXSA6IHVuZGVmaW5lZDtcclxuICAgICAgICBpZiAobmV4dE9wZXJhdGlvbikge1xyXG4gICAgICAgICAgICB0aGlzLmluRmxpZ2h0T3BlcmF0aW9uID0gbmV4dE9wZXJhdGlvbjtcclxuICAgICAgICAgICAgbmV4dE9wZXJhdGlvbi5leGVjdXRvcihuZXh0T3BlcmF0aW9uLnZhbHVlKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5GbGlnaHRPcGVyYXRpb24gPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgbmV4dE9wZXJhdGlvbi5wcm9taXNlQ29tcGxldGlvblNvdXJjZS5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmNhdGNoKGUgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5GbGlnaHRPcGVyYXRpb24gPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgbmV4dE9wZXJhdGlvbi5wcm9taXNlQ29tcGxldGlvblNvdXJjZS5yZWplY3QoZSk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmZpbmFsbHkoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3BlcmF0aW9uUXVldWUuc2hpZnQoKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmV4ZWN1dGVOZXh0Q29tbWFuZCgpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsIi8vIENvcHlyaWdodCAoYykgLk5FVCBGb3VuZGF0aW9uIGFuZCBjb250cmlidXRvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZS4gU2VlIExJQ0VOU0UgZmlsZSBpbiB0aGUgcHJvamVjdCByb290IGZvciBmdWxsIGxpY2Vuc2UgaW5mb3JtYXRpb24uXHJcblxyXG5pbXBvcnQgeyBLZXJuZWxJbnZvY2F0aW9uQ29udGV4dCwgYXJlQ29tbWFuZHNUaGVTYW1lIH0gZnJvbSBcIi4va2VybmVsSW52b2NhdGlvbkNvbnRleHRcIjtcclxuaW1wb3J0IHsgVG9rZW5HZW5lcmF0b3IsIEd1aWQgfSBmcm9tIFwiLi90b2tlbkdlbmVyYXRvclwiO1xyXG5pbXBvcnQgKiBhcyBjb250cmFjdHMgZnJvbSBcIi4vY29udHJhY3RzXCI7XHJcbmltcG9ydCB7IExvZ2dlciB9IGZyb20gXCIuL2xvZ2dlclwiO1xyXG5pbXBvcnQgeyBDb21wb3NpdGVLZXJuZWwgfSBmcm9tIFwiLi9jb21wb3NpdGVLZXJuZWxcIjtcclxuaW1wb3J0IHsgS2VybmVsU2NoZWR1bGVyIH0gZnJvbSBcIi4va2VybmVsU2NoZWR1bGVyXCI7XHJcbmltcG9ydCB7IFByb21pc2VDb21wbGV0aW9uU291cmNlIH0gZnJvbSBcIi4vcHJvbWlzZUNvbXBsZXRpb25Tb3VyY2VcIjtcclxuaW1wb3J0ICogYXMgZGlzcG9zYWJsZXMgZnJvbSBcIi4vZGlzcG9zYWJsZXNcIjtcclxuaW1wb3J0IHsgdHJ5QWRkVXJpVG9Sb3V0aW5nU2xpcCB9IGZyb20gXCIuL2Nvbm5lY3Rpb25cIjtcclxuaW1wb3J0ICogYXMgcnhqcyBmcm9tIFwicnhqc1wiO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJS2VybmVsQ29tbWFuZEludm9jYXRpb24ge1xyXG4gICAgY29tbWFuZEVudmVsb3BlOiBjb250cmFjdHMuS2VybmVsQ29tbWFuZEVudmVsb3BlO1xyXG4gICAgY29udGV4dDogS2VybmVsSW52b2NhdGlvbkNvbnRleHQ7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSUtlcm5lbENvbW1hbmRIYW5kbGVyIHtcclxuICAgIGNvbW1hbmRUeXBlOiBzdHJpbmc7XHJcbiAgICBoYW5kbGU6IChjb21tYW5kSW52b2NhdGlvbjogSUtlcm5lbENvbW1hbmRJbnZvY2F0aW9uKSA9PiBQcm9taXNlPHZvaWQ+O1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElLZXJuZWxFdmVudE9ic2VydmVyIHtcclxuICAgIChrZXJuZWxFdmVudDogY29udHJhY3RzLktlcm5lbEV2ZW50RW52ZWxvcGUpOiB2b2lkO1xyXG59XHJcblxyXG5leHBvcnQgZW51bSBLZXJuZWxUeXBlIHtcclxuICAgIGNvbXBvc2l0ZSxcclxuICAgIHByb3h5LFxyXG4gICAgZGVmYXVsdFxyXG59O1xyXG5cclxuZXhwb3J0IGNsYXNzIEtlcm5lbCB7XHJcbiAgICBwcml2YXRlIF9rZXJuZWxJbmZvOiBjb250cmFjdHMuS2VybmVsSW5mbztcclxuICAgIHByaXZhdGUgX2NvbW1hbmRIYW5kbGVycyA9IG5ldyBNYXA8c3RyaW5nLCBJS2VybmVsQ29tbWFuZEhhbmRsZXI+KCk7XHJcbiAgICBwcml2YXRlIF9ldmVudFN1YmplY3QgPSBuZXcgcnhqcy5TdWJqZWN0PGNvbnRyYWN0cy5LZXJuZWxFdmVudEVudmVsb3BlPigpO1xyXG4gICAgcHJpdmF0ZSByZWFkb25seSBfdG9rZW5HZW5lcmF0b3I6IFRva2VuR2VuZXJhdG9yID0gbmV3IFRva2VuR2VuZXJhdG9yKCk7XHJcbiAgICBwdWJsaWMgcm9vdEtlcm5lbDogS2VybmVsID0gdGhpcztcclxuICAgIHB1YmxpYyBwYXJlbnRLZXJuZWw6IENvbXBvc2l0ZUtlcm5lbCB8IG51bGwgPSBudWxsO1xyXG4gICAgcHJpdmF0ZSBfc2NoZWR1bGVyPzogS2VybmVsU2NoZWR1bGVyPGNvbnRyYWN0cy5LZXJuZWxDb21tYW5kRW52ZWxvcGU+IHwgbnVsbCA9IG51bGw7XHJcbiAgICBwcml2YXRlIF9rZXJuZWxUeXBlOiBLZXJuZWxUeXBlID0gS2VybmVsVHlwZS5kZWZhdWx0O1xyXG5cclxuICAgIHB1YmxpYyBnZXQga2VybmVsSW5mbygpOiBjb250cmFjdHMuS2VybmVsSW5mbyB7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLl9rZXJuZWxJbmZvO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQga2VybmVsVHlwZSgpOiBLZXJuZWxUeXBlIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fa2VybmVsVHlwZTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgc2V0IGtlcm5lbFR5cGUodmFsdWU6IEtlcm5lbFR5cGUpIHtcclxuICAgICAgICB0aGlzLl9rZXJuZWxUeXBlID0gdmFsdWU7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBrZXJuZWxFdmVudHMoKTogcnhqcy5PYnNlcnZhYmxlPGNvbnRyYWN0cy5LZXJuZWxFdmVudEVudmVsb3BlPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2V2ZW50U3ViamVjdC5hc09ic2VydmFibGUoKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdHJ1Y3RvcihyZWFkb25seSBuYW1lOiBzdHJpbmcsIGxhbmd1YWdlTmFtZT86IHN0cmluZywgbGFuZ3VhZ2VWZXJzaW9uPzogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5fa2VybmVsSW5mbyA9IHtcclxuICAgICAgICAgICAgbG9jYWxOYW1lOiBuYW1lLFxyXG4gICAgICAgICAgICBsYW5ndWFnZU5hbWU6IGxhbmd1YWdlTmFtZSxcclxuICAgICAgICAgICAgYWxpYXNlczogW10sXHJcbiAgICAgICAgICAgIGxhbmd1YWdlVmVyc2lvbjogbGFuZ3VhZ2VWZXJzaW9uLFxyXG4gICAgICAgICAgICBzdXBwb3J0ZWREaXJlY3RpdmVzOiBbXSxcclxuICAgICAgICAgICAgc3VwcG9ydGVkS2VybmVsQ29tbWFuZHM6IFtdXHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLnJlZ2lzdGVyQ29tbWFuZEhhbmRsZXIoe1xyXG4gICAgICAgICAgICBjb21tYW5kVHlwZTogY29udHJhY3RzLlJlcXVlc3RLZXJuZWxJbmZvVHlwZSwgaGFuZGxlOiBhc3luYyBpbnZvY2F0aW9uID0+IHtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuaGFuZGxlUmVxdWVzdEtlcm5lbEluZm8oaW52b2NhdGlvbik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgYXN5bmMgaGFuZGxlUmVxdWVzdEtlcm5lbEluZm8oaW52b2NhdGlvbjogSUtlcm5lbENvbW1hbmRJbnZvY2F0aW9uKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgY29uc3QgZXZlbnRFbnZlbG9wZTogY29udHJhY3RzLktlcm5lbEV2ZW50RW52ZWxvcGUgPSB7XHJcbiAgICAgICAgICAgIGV2ZW50VHlwZTogY29udHJhY3RzLktlcm5lbEluZm9Qcm9kdWNlZFR5cGUsXHJcbiAgICAgICAgICAgIGNvbW1hbmQ6IGludm9jYXRpb24uY29tbWFuZEVudmVsb3BlLFxyXG4gICAgICAgICAgICBldmVudDogPGNvbnRyYWN0cy5LZXJuZWxJbmZvUHJvZHVjZWQ+eyBrZXJuZWxJbmZvOiB0aGlzLl9rZXJuZWxJbmZvIH1cclxuICAgICAgICB9Oy8vP1xyXG5cclxuICAgICAgICBpbnZvY2F0aW9uLmNvbnRleHQucHVibGlzaChldmVudEVudmVsb3BlKTtcclxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRTY2hlZHVsZXIoKTogS2VybmVsU2NoZWR1bGVyPGNvbnRyYWN0cy5LZXJuZWxDb21tYW5kRW52ZWxvcGU+IHtcclxuICAgICAgICBpZiAoIXRoaXMuX3NjaGVkdWxlcikge1xyXG4gICAgICAgICAgICB0aGlzLl9zY2hlZHVsZXIgPSB0aGlzLnBhcmVudEtlcm5lbD8uZ2V0U2NoZWR1bGVyKCkgPz8gbmV3IEtlcm5lbFNjaGVkdWxlcjxjb250cmFjdHMuS2VybmVsQ29tbWFuZEVudmVsb3BlPigpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NjaGVkdWxlcjtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGVuc3VyZUNvbW1hbmRUb2tlbkFuZElkKGNvbW1hbmRFbnZlbG9wZTogY29udHJhY3RzLktlcm5lbENvbW1hbmRFbnZlbG9wZSkge1xyXG4gICAgICAgIGlmICghY29tbWFuZEVudmVsb3BlLnRva2VuKSB7XHJcbiAgICAgICAgICAgIGxldCBuZXh0VG9rZW4gPSB0aGlzLl90b2tlbkdlbmVyYXRvci5HZXROZXdUb2tlbigpO1xyXG4gICAgICAgICAgICBpZiAoS2VybmVsSW52b2NhdGlvbkNvbnRleHQuY3VycmVudD8uY29tbWFuZEVudmVsb3BlKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBhIHBhcmVudCBjb21tYW5kIGV4aXN0cywgY3JlYXRlIGEgdG9rZW4gaGllcmFyY2h5XHJcbiAgICAgICAgICAgICAgICBuZXh0VG9rZW4gPSBLZXJuZWxJbnZvY2F0aW9uQ29udGV4dC5jdXJyZW50LmNvbW1hbmRFbnZlbG9wZS50b2tlbiE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29tbWFuZEVudmVsb3BlLnRva2VuID0gbmV4dFRva2VuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFjb21tYW5kRW52ZWxvcGUuaWQpIHtcclxuICAgICAgICAgICAgY29tbWFuZEVudmVsb3BlLmlkID0gR3VpZC5jcmVhdGUoKS50b1N0cmluZygpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgZ2V0IGN1cnJlbnQoKTogS2VybmVsIHwgbnVsbCB7XHJcbiAgICAgICAgaWYgKEtlcm5lbEludm9jYXRpb25Db250ZXh0LmN1cnJlbnQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIEtlcm5lbEludm9jYXRpb25Db250ZXh0LmN1cnJlbnQuaGFuZGxpbmdLZXJuZWw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBnZXQgcm9vdCgpOiBLZXJuZWwgfCBudWxsIHtcclxuICAgICAgICBpZiAoS2VybmVsLmN1cnJlbnQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIEtlcm5lbC5jdXJyZW50LnJvb3RLZXJuZWw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIElzIGl0IHdvcnRoIHVzIGdvaW5nIHRvIGVmZm9ydHMgdG8gZW5zdXJlIHRoYXQgdGhlIFByb21pc2UgcmV0dXJuZWQgaGVyZSBhY2N1cmF0ZWx5IHJlZmxlY3RzXHJcbiAgICAvLyB0aGUgY29tbWFuZCdzIHByb2dyZXNzPyBUaGUgb25seSB0aGluZyB0aGF0IGFjdHVhbGx5IGNhbGxzIHRoaXMgaXMgdGhlIGtlcm5lbCBjaGFubmVsLCB0aHJvdWdoXHJcbiAgICAvLyB0aGUgY2FsbGJhY2sgc2V0IHVwIGJ5IGF0dGFjaEtlcm5lbFRvQ2hhbm5lbCwgYW5kIHRoZSBjYWxsYmFjayBpcyBleHBlY3RlZCB0byByZXR1cm4gdm9pZCwgc29cclxuICAgIC8vIG5vdGhpbmcgaXMgZXZlciBnb2luZyB0byBsb29rIGF0IHRoZSBwcm9taXNlIHdlIHJldHVybiBoZXJlLlxyXG4gICAgYXN5bmMgc2VuZChjb21tYW5kRW52ZWxvcGU6IGNvbnRyYWN0cy5LZXJuZWxDb21tYW5kRW52ZWxvcGUpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICB0aGlzLmVuc3VyZUNvbW1hbmRUb2tlbkFuZElkKGNvbW1hbmRFbnZlbG9wZSk7XHJcbiAgICAgICAgdHJ5QWRkVXJpVG9Sb3V0aW5nU2xpcChjb21tYW5kRW52ZWxvcGUsIGdldEtlcm5lbFVyaSh0aGlzKSk7XHJcbiAgICAgICAgY29tbWFuZEVudmVsb3BlLnJvdXRpbmdTbGlwOy8vP1xyXG4gICAgICAgIGxldCBjb250ZXh0ID0gS2VybmVsSW52b2NhdGlvbkNvbnRleHQuZXN0YWJsaXNoKGNvbW1hbmRFbnZlbG9wZSk7XHJcbiAgICAgICAgdGhpcy5nZXRTY2hlZHVsZXIoKS5ydW5Bc3luYyhjb21tYW5kRW52ZWxvcGUsICh2YWx1ZSkgPT4gdGhpcy5leGVjdXRlQ29tbWFuZCh2YWx1ZSkpO1xyXG4gICAgICAgIHJldHVybiBjb250ZXh0LnByb21pc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBleGVjdXRlQ29tbWFuZChjb21tYW5kRW52ZWxvcGU6IGNvbnRyYWN0cy5LZXJuZWxDb21tYW5kRW52ZWxvcGUpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICBsZXQgY29udGV4dCA9IEtlcm5lbEludm9jYXRpb25Db250ZXh0LmVzdGFibGlzaChjb21tYW5kRW52ZWxvcGUpO1xyXG4gICAgICAgIGxldCBwcmV2aW91c0hhbmRsaW5nS2VybmVsID0gY29udGV4dC5oYW5kbGluZ0tlcm5lbDtcclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgYXdhaXQgdGhpcy5oYW5kbGVDb21tYW5kKGNvbW1hbmRFbnZlbG9wZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIGNvbnRleHQuZmFpbCgoPGFueT5lKT8ubWVzc2FnZSB8fCBKU09OLnN0cmluZ2lmeShlKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZpbmFsbHkge1xyXG4gICAgICAgICAgICBjb250ZXh0LmhhbmRsaW5nS2VybmVsID0gcHJldmlvdXNIYW5kbGluZ0tlcm5lbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0Q29tbWFuZEhhbmRsZXIoY29tbWFuZFR5cGU6IGNvbnRyYWN0cy5LZXJuZWxDb21tYW5kVHlwZSk6IElLZXJuZWxDb21tYW5kSGFuZGxlciB8IHVuZGVmaW5lZCB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NvbW1hbmRIYW5kbGVycy5nZXQoY29tbWFuZFR5cGUpO1xyXG4gICAgfVxyXG5cclxuICAgIGhhbmRsZUNvbW1hbmQoY29tbWFuZEVudmVsb3BlOiBjb250cmFjdHMuS2VybmVsQ29tbWFuZEVudmVsb3BlKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPHZvaWQ+KGFzeW5jIChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgbGV0IGNvbnRleHQgPSBLZXJuZWxJbnZvY2F0aW9uQ29udGV4dC5lc3RhYmxpc2goY29tbWFuZEVudmVsb3BlKTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHByZXZpb3VkSGVuZGxpbmdLZXJuZWwgPSBjb250ZXh0LmhhbmRsaW5nS2VybmVsO1xyXG4gICAgICAgICAgICBjb250ZXh0LmhhbmRsaW5nS2VybmVsID0gdGhpcztcclxuICAgICAgICAgICAgbGV0IGlzUm9vdENvbW1hbmQgPSBhcmVDb21tYW5kc1RoZVNhbWUoY29udGV4dC5jb21tYW5kRW52ZWxvcGUsIGNvbW1hbmRFbnZlbG9wZSk7XHJcblxyXG4gICAgICAgICAgICBsZXQgZXZlbnRTdWJzY3JpcHRpb246IHJ4anMuU3Vic2NyaXB0aW9uIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkOy8vP1xyXG5cclxuICAgICAgICAgICAgaWYgKGlzUm9vdENvbW1hbmQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubmFtZTsvLz9cclxuICAgICAgICAgICAgICAgIExvZ2dlci5kZWZhdWx0LmluZm8oYGtlcm5lbCAke3RoaXMubmFtZX0gb2YgdHlwZSAke0tlcm5lbFR5cGVbdGhpcy5rZXJuZWxUeXBlXX0gc3Vic2NyaWJpbmcgdG8gY29udGV4dCBldmVudHNgKTtcclxuICAgICAgICAgICAgICAgIGV2ZW50U3Vic2NyaXB0aW9uID0gY29udGV4dC5rZXJuZWxFdmVudHMucGlwZShyeGpzLm1hcChlID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBtZXNzYWdlID0gYGtlcm5lbCAke3RoaXMubmFtZX0gb2YgdHlwZSAke0tlcm5lbFR5cGVbdGhpcy5rZXJuZWxUeXBlXX0gc2F3IGV2ZW50ICR7ZS5ldmVudFR5cGV9IHdpdGggdG9rZW4gJHtlLmNvbW1hbmQ/LnRva2VufWA7XHJcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTsvLz9cclxuICAgICAgICAgICAgICAgICAgICBMb2dnZXIuZGVmYXVsdC5pbmZvKG1lc3NhZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRyeUFkZFVyaVRvUm91dGluZ1NsaXAoZSwgZ2V0S2VybmVsVXJpKHRoaXMpKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZTtcclxuICAgICAgICAgICAgICAgIH0pKVxyXG4gICAgICAgICAgICAgICAgICAgIC5zdWJzY3JpYmUodGhpcy5wdWJsaXNoRXZlbnQuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBoYW5kbGVyID0gdGhpcy5nZXRDb21tYW5kSGFuZGxlcihjb21tYW5kRW52ZWxvcGUuY29tbWFuZFR5cGUpO1xyXG4gICAgICAgICAgICBpZiAoaGFuZGxlcikge1xyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICBMb2dnZXIuZGVmYXVsdC5pbmZvKGBrZXJuZWwgJHt0aGlzLm5hbWV9IGFib3V0IHRvIGhhbmRsZSBjb21tYW5kOiAke0pTT04uc3RyaW5naWZ5KGNvbW1hbmRFbnZlbG9wZSl9YCk7XHJcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgaGFuZGxlci5oYW5kbGUoeyBjb21tYW5kRW52ZWxvcGU6IGNvbW1hbmRFbnZlbG9wZSwgY29udGV4dCB9KTtcclxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0LmNvbXBsZXRlKGNvbW1hbmRFbnZlbG9wZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5oYW5kbGluZ0tlcm5lbCA9IHByZXZpb3VkSGVuZGxpbmdLZXJuZWw7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzUm9vdENvbW1hbmQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRTdWJzY3JpcHRpb24/LnVuc3Vic2NyaWJlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQuZGlzcG9zZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBMb2dnZXIuZGVmYXVsdC5pbmZvKGBrZXJuZWwgJHt0aGlzLm5hbWV9IGRvbmUgaGFuZGxpbmcgY29tbWFuZDogJHtKU09OLnN0cmluZ2lmeShjb21tYW5kRW52ZWxvcGUpfWApO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5mYWlsKCg8YW55PmUpPy5tZXNzYWdlIHx8IEpTT04uc3RyaW5naWZ5KGUpKTtcclxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0LmhhbmRsaW5nS2VybmVsID0gcHJldmlvdWRIZW5kbGluZ0tlcm5lbDtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaXNSb290Q29tbWFuZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudFN1YnNjcmlwdGlvbj8udW5zdWJzY3JpYmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dC5kaXNwb3NlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQuaGFuZGxpbmdLZXJuZWwgPSBwcmV2aW91ZEhlbmRsaW5nS2VybmVsO1xyXG4gICAgICAgICAgICAgICAgaWYgKGlzUm9vdENvbW1hbmQpIHtcclxuICAgICAgICAgICAgICAgICAgICBldmVudFN1YnNjcmlwdGlvbj8udW5zdWJzY3JpYmUoKTtcclxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0LmRpc3Bvc2UoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoYE5vIGhhbmRsZXIgZm91bmQgZm9yIGNvbW1hbmQgdHlwZSAke2NvbW1hbmRFbnZlbG9wZS5jb21tYW5kVHlwZX1gKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBzdWJzY3JpYmVUb0tlcm5lbEV2ZW50cyhvYnNlcnZlcjogY29udHJhY3RzLktlcm5lbEV2ZW50RW52ZWxvcGVPYnNlcnZlcik6IGRpc3Bvc2FibGVzLkRpc3Bvc2FibGVTdWJzY3JpcHRpb24ge1xyXG4gICAgICAgIGNvbnN0IHN1YiA9IHRoaXMuX2V2ZW50U3ViamVjdC5zdWJzY3JpYmUob2JzZXJ2ZXIpO1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBkaXNwb3NlOiAoKSA9PiB7IHN1Yi51bnN1YnNjcmliZSgpOyB9XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgY2FuSGFuZGxlKGNvbW1hbmRFbnZlbG9wZTogY29udHJhY3RzLktlcm5lbENvbW1hbmRFbnZlbG9wZSkge1xyXG4gICAgICAgIGlmIChjb21tYW5kRW52ZWxvcGUuY29tbWFuZC50YXJnZXRLZXJuZWxOYW1lICYmIGNvbW1hbmRFbnZlbG9wZS5jb21tYW5kLnRhcmdldEtlcm5lbE5hbWUgIT09IHRoaXMubmFtZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGNvbW1hbmRFbnZlbG9wZS5jb21tYW5kLmRlc3RpbmF0aW9uVXJpKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmtlcm5lbEluZm8udXJpICE9PSBjb21tYW5kRW52ZWxvcGUuY29tbWFuZC5kZXN0aW5hdGlvblVyaSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy5zdXBwb3J0c0NvbW1hbmQoY29tbWFuZEVudmVsb3BlLmNvbW1hbmRUeXBlKTtcclxuICAgIH1cclxuXHJcbiAgICBzdXBwb3J0c0NvbW1hbmQoY29tbWFuZFR5cGU6IGNvbnRyYWN0cy5LZXJuZWxDb21tYW5kVHlwZSk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9jb21tYW5kSGFuZGxlcnMuaGFzKGNvbW1hbmRUeXBlKTtcclxuICAgIH1cclxuXHJcbiAgICByZWdpc3RlckNvbW1hbmRIYW5kbGVyKGhhbmRsZXI6IElLZXJuZWxDb21tYW5kSGFuZGxlcik6IHZvaWQge1xyXG4gICAgICAgIC8vIFdoZW4gYSByZWdpc3RyYXRpb24gYWxyZWFkeSBleGlzdGVkLCB3ZSB3YW50IHRvIG92ZXJ3cml0ZSBpdCBiZWNhdXNlIHdlIHdhbnQgdXNlcnMgdG9cclxuICAgICAgICAvLyBiZSBhYmxlIHRvIGRldmVsb3AgaGFuZGxlcnMgaXRlcmF0aXZlbHksIGFuZCBpdCB3b3VsZCBiZSB1bmhlbHBmdWwgZm9yIGhhbmRsZXIgcmVnaXN0cmF0aW9uXHJcbiAgICAgICAgLy8gZm9yIGFueSBwYXJ0aWN1bGFyIGNvbW1hbmQgdG8gYmUgY3VtdWxhdGl2ZS5cclxuICAgICAgICB0aGlzLl9jb21tYW5kSGFuZGxlcnMuc2V0KGhhbmRsZXIuY29tbWFuZFR5cGUsIGhhbmRsZXIpO1xyXG4gICAgICAgIHRoaXMuX2tlcm5lbEluZm8uc3VwcG9ydGVkS2VybmVsQ29tbWFuZHMgPSBBcnJheS5mcm9tKHRoaXMuX2NvbW1hbmRIYW5kbGVycy5rZXlzKCkpLm1hcChjb21tYW5kTmFtZSA9PiAoeyBuYW1lOiBjb21tYW5kTmFtZSB9KSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGdldEhhbmRsaW5nS2VybmVsKGNvbW1hbmRFbnZlbG9wZTogY29udHJhY3RzLktlcm5lbENvbW1hbmRFbnZlbG9wZSwgY29udGV4dD86IEtlcm5lbEludm9jYXRpb25Db250ZXh0IHwgbnVsbCk6IEtlcm5lbCB8IG51bGwge1xyXG4gICAgICAgIGlmICh0aGlzLmNhbkhhbmRsZShjb21tYW5kRW52ZWxvcGUpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnRleHQ/LmZhaWwoYENvbW1hbmQgJHtjb21tYW5kRW52ZWxvcGUuY29tbWFuZFR5cGV9IGlzIG5vdCBzdXBwb3J0ZWQgYnkgS2VybmVsICR7dGhpcy5uYW1lfWApO1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIHB1Ymxpc2hFdmVudChrZXJuZWxFdmVudDogY29udHJhY3RzLktlcm5lbEV2ZW50RW52ZWxvcGUpIHtcclxuICAgICAgICB0aGlzLl9ldmVudFN1YmplY3QubmV4dChrZXJuZWxFdmVudCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzdWJtaXRDb21tYW5kQW5kR2V0UmVzdWx0PFRFdmVudCBleHRlbmRzIGNvbnRyYWN0cy5LZXJuZWxFdmVudD4oa2VybmVsOiBLZXJuZWwsIGNvbW1hbmRFbnZlbG9wZTogY29udHJhY3RzLktlcm5lbENvbW1hbmRFbnZlbG9wZSwgZXhwZWN0ZWRFdmVudFR5cGU6IGNvbnRyYWN0cy5LZXJuZWxFdmVudFR5cGUpOiBQcm9taXNlPFRFdmVudD4ge1xyXG4gICAgbGV0IGNvbXBsZXRpb25Tb3VyY2UgPSBuZXcgUHJvbWlzZUNvbXBsZXRpb25Tb3VyY2U8VEV2ZW50PigpO1xyXG4gICAgbGV0IGhhbmRsZWQgPSBmYWxzZTtcclxuICAgIGxldCBkaXNwb3NhYmxlID0ga2VybmVsLnN1YnNjcmliZVRvS2VybmVsRXZlbnRzKGV2ZW50RW52ZWxvcGUgPT4ge1xyXG4gICAgICAgIGlmIChldmVudEVudmVsb3BlLmNvbW1hbmQ/LnRva2VuID09PSBjb21tYW5kRW52ZWxvcGUudG9rZW4pIHtcclxuICAgICAgICAgICAgc3dpdGNoIChldmVudEVudmVsb3BlLmV2ZW50VHlwZSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSBjb250cmFjdHMuQ29tbWFuZEZhaWxlZFR5cGU6XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFoYW5kbGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgZXJyID0gPGNvbnRyYWN0cy5Db21tYW5kRmFpbGVkPmV2ZW50RW52ZWxvcGUuZXZlbnQ7Ly8/XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBsZXRpb25Tb3VyY2UucmVqZWN0KGVycik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBjb250cmFjdHMuQ29tbWFuZFN1Y2NlZWRlZFR5cGU6XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFyZUNvbW1hbmRzVGhlU2FtZShldmVudEVudmVsb3BlLmNvbW1hbmQhLCBjb21tYW5kRW52ZWxvcGUpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICYmIChldmVudEVudmVsb3BlLmNvbW1hbmQ/LmlkID09PSBjb21tYW5kRW52ZWxvcGUuaWQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghaGFuZGxlZCkgey8vPyAoJCA/IGV2ZW50RW52ZWxvcGUgOiB7fSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcGxldGlvblNvdXJjZS5yZWplY3QoJ0NvbW1hbmQgd2FzIGhhbmRsZWQgYmVmb3JlIHJlcG9ydGluZyBleHBlY3RlZCByZXN1bHQuJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZXZlbnRFbnZlbG9wZS5ldmVudFR5cGUgPT09IGV4cGVjdGVkRXZlbnRUeXBlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgZXZlbnQgPSA8VEV2ZW50PmV2ZW50RW52ZWxvcGUuZXZlbnQ7Ly8/ICgkID8gZXZlbnRFbnZlbG9wZSA6IHt9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wbGV0aW9uU291cmNlLnJlc29sdmUoZXZlbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgICAgYXdhaXQga2VybmVsLnNlbmQoY29tbWFuZEVudmVsb3BlKTtcclxuICAgIH1cclxuICAgIGZpbmFsbHkge1xyXG4gICAgICAgIGRpc3Bvc2FibGUuZGlzcG9zZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBjb21wbGV0aW9uU291cmNlLnByb21pc2U7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRLZXJuZWxVcmkoa2VybmVsOiBLZXJuZWwpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIGtlcm5lbC5rZXJuZWxJbmZvLnVyaSA/PyBga2VybmVsOi8vbG9jYWwvJHtrZXJuZWwua2VybmVsSW5mby5sb2NhbE5hbWV9YDtcclxufSIsIi8vIENvcHlyaWdodCAoYykgLk5FVCBGb3VuZGF0aW9uIGFuZCBjb250cmlidXRvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZS4gU2VlIExJQ0VOU0UgZmlsZSBpbiB0aGUgcHJvamVjdCByb290IGZvciBmdWxsIGxpY2Vuc2UgaW5mb3JtYXRpb24uXHJcblxyXG5pbXBvcnQgeyB0cnlBZGRVcmlUb1JvdXRpbmdTbGlwIH0gZnJvbSBcIi4vY29ubmVjdGlvblwiO1xyXG5pbXBvcnQgKiBhcyBjb250cmFjdHMgZnJvbSBcIi4vY29udHJhY3RzXCI7XHJcbmltcG9ydCB7IGdldEtlcm5lbFVyaSwgSUtlcm5lbENvbW1hbmRJbnZvY2F0aW9uLCBLZXJuZWwsIEtlcm5lbFR5cGUgfSBmcm9tIFwiLi9rZXJuZWxcIjtcclxuaW1wb3J0IHsgS2VybmVsSG9zdCB9IGZyb20gXCIuL2tlcm5lbEhvc3RcIjtcclxuaW1wb3J0IHsgS2VybmVsSW52b2NhdGlvbkNvbnRleHQgfSBmcm9tIFwiLi9rZXJuZWxJbnZvY2F0aW9uQ29udGV4dFwiO1xyXG5cclxuZXhwb3J0IGNsYXNzIENvbXBvc2l0ZUtlcm5lbCBleHRlbmRzIEtlcm5lbCB7XHJcbiAgICBwcml2YXRlIF9ob3N0OiBLZXJuZWxIb3N0IHwgbnVsbCA9IG51bGw7XHJcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9kZWZhdWx0S2VybmVsTmFtZXNCeUNvbW1hbmRUeXBlOiBNYXA8Y29udHJhY3RzLktlcm5lbENvbW1hbmRUeXBlLCBzdHJpbmc+ID0gbmV3IE1hcCgpO1xyXG5cclxuICAgIGRlZmF1bHRLZXJuZWxOYW1lOiBzdHJpbmcgfCB1bmRlZmluZWQ7XHJcbiAgICBwcml2YXRlIF9jaGlsZEtlcm5lbHM6IEtlcm5lbENvbGxlY3Rpb247XHJcblxyXG4gICAgY29uc3RydWN0b3IobmFtZTogc3RyaW5nKSB7XHJcbiAgICAgICAgc3VwZXIobmFtZSk7XHJcbiAgICAgICAgdGhpcy5rZXJuZWxUeXBlID0gS2VybmVsVHlwZS5jb21wb3NpdGU7XHJcbiAgICAgICAgdGhpcy5fY2hpbGRLZXJuZWxzID0gbmV3IEtlcm5lbENvbGxlY3Rpb24odGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IGNoaWxkS2VybmVscygpIHtcclxuICAgICAgICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLl9jaGlsZEtlcm5lbHMpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBob3N0KCk6IEtlcm5lbEhvc3QgfCBudWxsIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5faG9zdDtcclxuICAgIH1cclxuXHJcbiAgICBzZXQgaG9zdChob3N0OiBLZXJuZWxIb3N0IHwgbnVsbCkge1xyXG4gICAgICAgIHRoaXMuX2hvc3QgPSBob3N0O1xyXG4gICAgICAgIGlmICh0aGlzLl9ob3N0KSB7XHJcbiAgICAgICAgICAgIHRoaXMua2VybmVsSW5mby51cmkgPSB0aGlzLl9ob3N0LnVyaTtcclxuICAgICAgICAgICAgdGhpcy5fY2hpbGRLZXJuZWxzLm5vdGlmeVRoYXRIb3N0V2FzU2V0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBvdmVycmlkZSBhc3luYyBoYW5kbGVSZXF1ZXN0S2VybmVsSW5mbyhpbnZvY2F0aW9uOiBJS2VybmVsQ29tbWFuZEludm9jYXRpb24pOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICBmb3IgKGxldCBrZXJuZWwgb2YgdGhpcy5fY2hpbGRLZXJuZWxzKSB7XHJcbiAgICAgICAgICAgIGlmIChrZXJuZWwuc3VwcG9ydHNDb21tYW5kKGludm9jYXRpb24uY29tbWFuZEVudmVsb3BlLmNvbW1hbmRUeXBlKSkge1xyXG4gICAgICAgICAgICAgICAgYXdhaXQga2VybmVsLmhhbmRsZUNvbW1hbmQoeyBjb21tYW5kOiB7fSwgY29tbWFuZFR5cGU6IGNvbnRyYWN0cy5SZXF1ZXN0S2VybmVsSW5mb1R5cGUgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgYWRkKGtlcm5lbDogS2VybmVsLCBhbGlhc2VzPzogc3RyaW5nW10pIHtcclxuICAgICAgICBpZiAoIWtlcm5lbCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJrZXJuZWwgY2Fubm90IGJlIG51bGwgb3IgdW5kZWZpbmVkXCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCF0aGlzLmRlZmF1bHRLZXJuZWxOYW1lKSB7XHJcbiAgICAgICAgICAgIC8vIGRlZmF1bHQgdG8gZmlyc3Qga2VybmVsXHJcbiAgICAgICAgICAgIHRoaXMuZGVmYXVsdEtlcm5lbE5hbWUgPSBrZXJuZWwubmFtZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGtlcm5lbC5wYXJlbnRLZXJuZWwgPSB0aGlzO1xyXG4gICAgICAgIGtlcm5lbC5yb290S2VybmVsID0gdGhpcy5yb290S2VybmVsO1xyXG4gICAgICAgIGtlcm5lbC5rZXJuZWxFdmVudHMuc3Vic2NyaWJlKHtcclxuICAgICAgICAgICAgbmV4dDogKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBldmVudDsvLz9cclxuICAgICAgICAgICAgICAgIHRyeUFkZFVyaVRvUm91dGluZ1NsaXAoZXZlbnQsIGdldEtlcm5lbFVyaSh0aGlzKSk7XHJcbiAgICAgICAgICAgICAgICBldmVudDsvLz9cclxuICAgICAgICAgICAgICAgIHRoaXMucHVibGlzaEV2ZW50KGV2ZW50KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpZiAoYWxpYXNlcykge1xyXG4gICAgICAgICAgICBsZXQgc2V0ID0gbmV3IFNldChhbGlhc2VzKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChrZXJuZWwua2VybmVsSW5mby5hbGlhc2VzKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBhbGlhcyBpbiBrZXJuZWwua2VybmVsSW5mby5hbGlhc2VzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2V0LmFkZChhbGlhcyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGtlcm5lbC5rZXJuZWxJbmZvLmFsaWFzZXMgPSBBcnJheS5mcm9tKHNldCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLl9jaGlsZEtlcm5lbHMuYWRkKGtlcm5lbCwgYWxpYXNlcyk7XHJcblxyXG4gICAgICAgIGNvbnN0IGludm9jYXRpb25Db250ZXh0ID0gS2VybmVsSW52b2NhdGlvbkNvbnRleHQuY3VycmVudDtcclxuXHJcbiAgICAgICAgaWYgKGludm9jYXRpb25Db250ZXh0KSB7XHJcbiAgICAgICAgICAgIGludm9jYXRpb25Db250ZXh0LmNvbW1hbmRFbnZlbG9wZTsvLz9cclxuICAgICAgICAgICAgaW52b2NhdGlvbkNvbnRleHQucHVibGlzaCh7XHJcbiAgICAgICAgICAgICAgICBldmVudFR5cGU6IGNvbnRyYWN0cy5LZXJuZWxJbmZvUHJvZHVjZWRUeXBlLFxyXG4gICAgICAgICAgICAgICAgZXZlbnQ6IDxjb250cmFjdHMuS2VybmVsSW5mb1Byb2R1Y2VkPntcclxuICAgICAgICAgICAgICAgICAgICBrZXJuZWxJbmZvOiBrZXJuZWwua2VybmVsSW5mb1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGNvbW1hbmQ6IGludm9jYXRpb25Db250ZXh0LmNvbW1hbmRFbnZlbG9wZVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnB1Ymxpc2hFdmVudCh7XHJcbiAgICAgICAgICAgICAgICBldmVudFR5cGU6IGNvbnRyYWN0cy5LZXJuZWxJbmZvUHJvZHVjZWRUeXBlLFxyXG4gICAgICAgICAgICAgICAgZXZlbnQ6IDxjb250cmFjdHMuS2VybmVsSW5mb1Byb2R1Y2VkPntcclxuICAgICAgICAgICAgICAgICAgICBrZXJuZWxJbmZvOiBrZXJuZWwua2VybmVsSW5mb1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc2V0RGVmYXVsdFRhcmdldEtlcm5lbE5hbWVGb3JDb21tYW5kKGNvbW1hbmRUeXBlOiBjb250cmFjdHMuS2VybmVsQ29tbWFuZFR5cGUsIGtlcm5lbE5hbWU6IHN0cmluZykge1xyXG4gICAgICAgIHRoaXMuX2RlZmF1bHRLZXJuZWxOYW1lc0J5Q29tbWFuZFR5cGUuc2V0KGNvbW1hbmRUeXBlLCBrZXJuZWxOYW1lKTtcclxuICAgIH1cclxuICAgIG92ZXJyaWRlIGhhbmRsZUNvbW1hbmQoY29tbWFuZEVudmVsb3BlOiBjb250cmFjdHMuS2VybmVsQ29tbWFuZEVudmVsb3BlKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgY29uc3QgaW52b2NhdGlvbkNvbnRleHQgPSBLZXJuZWxJbnZvY2F0aW9uQ29udGV4dC5jdXJyZW50O1xyXG5cclxuICAgICAgICBsZXQga2VybmVsID0gY29tbWFuZEVudmVsb3BlLmNvbW1hbmQudGFyZ2V0S2VybmVsTmFtZSA9PT0gdGhpcy5uYW1lXHJcbiAgICAgICAgICAgID8gdGhpc1xyXG4gICAgICAgICAgICA6IHRoaXMuZ2V0SGFuZGxpbmdLZXJuZWwoY29tbWFuZEVudmVsb3BlLCBpbnZvY2F0aW9uQ29udGV4dCk7XHJcblxyXG5cclxuICAgICAgICBjb25zdCBwcmV2aXVzb0hhbmRsaW5nS2VybmVsID0gaW52b2NhdGlvbkNvbnRleHQ/LmhhbmRsaW5nS2VybmVsID8/IG51bGw7XHJcblxyXG4gICAgICAgIGlmIChrZXJuZWwgPT09IHRoaXMpIHtcclxuICAgICAgICAgICAgaWYgKGludm9jYXRpb25Db250ZXh0ICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICBpbnZvY2F0aW9uQ29udGV4dC5oYW5kbGluZ0tlcm5lbCA9IGtlcm5lbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gc3VwZXIuaGFuZGxlQ29tbWFuZChjb21tYW5kRW52ZWxvcGUpLmZpbmFsbHkoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGludm9jYXRpb25Db250ZXh0ICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW52b2NhdGlvbkNvbnRleHQuaGFuZGxpbmdLZXJuZWwgPSBwcmV2aXVzb0hhbmRsaW5nS2VybmVsO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2UgaWYgKGtlcm5lbCkge1xyXG4gICAgICAgICAgICBpZiAoaW52b2NhdGlvbkNvbnRleHQgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIGludm9jYXRpb25Db250ZXh0LmhhbmRsaW5nS2VybmVsID0ga2VybmVsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRyeUFkZFVyaVRvUm91dGluZ1NsaXAoY29tbWFuZEVudmVsb3BlLCBnZXRLZXJuZWxVcmkoa2VybmVsKSk7XHJcbiAgICAgICAgICAgIHJldHVybiBrZXJuZWwuaGFuZGxlQ29tbWFuZChjb21tYW5kRW52ZWxvcGUpLmZpbmFsbHkoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGludm9jYXRpb25Db250ZXh0ICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW52b2NhdGlvbkNvbnRleHQuaGFuZGxpbmdLZXJuZWwgPSBwcmV2aXVzb0hhbmRsaW5nS2VybmVsO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChpbnZvY2F0aW9uQ29udGV4dCAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBpbnZvY2F0aW9uQ29udGV4dC5oYW5kbGluZ0tlcm5lbCA9IHByZXZpdXNvSGFuZGxpbmdLZXJuZWw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoXCJLZXJuZWwgbm90IGZvdW5kOiBcIiArIGNvbW1hbmRFbnZlbG9wZS5jb21tYW5kLnRhcmdldEtlcm5lbE5hbWUpKTtcclxuICAgIH1cclxuXHJcbiAgICBvdmVycmlkZSBnZXRIYW5kbGluZ0tlcm5lbChjb21tYW5kRW52ZWxvcGU6IGNvbnRyYWN0cy5LZXJuZWxDb21tYW5kRW52ZWxvcGUsIGNvbnRleHQ/OiBLZXJuZWxJbnZvY2F0aW9uQ29udGV4dCB8IG51bGwpOiBLZXJuZWwgfCBudWxsIHtcclxuXHJcbiAgICAgICAgbGV0IGtlcm5lbDogS2VybmVsIHwgbnVsbCA9IG51bGw7XHJcbiAgICAgICAgaWYgKGNvbW1hbmRFbnZlbG9wZS5jb21tYW5kLmRlc3RpbmF0aW9uVXJpKSB7XHJcbiAgICAgICAgICAgIGtlcm5lbCA9IHRoaXMuX2NoaWxkS2VybmVscy50cnlHZXRCeVVyaShjb21tYW5kRW52ZWxvcGUuY29tbWFuZC5kZXN0aW5hdGlvblVyaSkgPz8gbnVsbDtcclxuICAgICAgICAgICAgaWYgKGtlcm5lbCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGtlcm5lbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgdGFyZ2V0S2VybmVsTmFtZSA9IGNvbW1hbmRFbnZlbG9wZS5jb21tYW5kLnRhcmdldEtlcm5lbE5hbWU7XHJcblxyXG4gICAgICAgIGlmICh0YXJnZXRLZXJuZWxOYW1lID09PSB1bmRlZmluZWQgfHwgdGFyZ2V0S2VybmVsTmFtZSA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5jYW5IYW5kbGUoY29tbWFuZEVudmVsb3BlKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRhcmdldEtlcm5lbE5hbWUgPSB0aGlzLl9kZWZhdWx0S2VybmVsTmFtZXNCeUNvbW1hbmRUeXBlLmdldChjb21tYW5kRW52ZWxvcGUuY29tbWFuZFR5cGUpID8/IHRoaXMuZGVmYXVsdEtlcm5lbE5hbWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGFyZ2V0S2VybmVsTmFtZSAhPT0gdW5kZWZpbmVkICYmIHRhcmdldEtlcm5lbE5hbWUgIT09IG51bGwpIHtcclxuICAgICAgICAgICAga2VybmVsID0gdGhpcy5fY2hpbGRLZXJuZWxzLnRyeUdldEJ5QWxpYXModGFyZ2V0S2VybmVsTmFtZSkgPz8gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICgha2VybmVsKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9jaGlsZEtlcm5lbHMuY291bnQgPT09IDEpIHtcclxuICAgICAgICAgICAgICAgIGtlcm5lbCA9IHRoaXMuX2NoaWxkS2VybmVscy5zaW5nbGUoKSA/PyBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIWtlcm5lbCkge1xyXG4gICAgICAgICAgICBrZXJuZWwgPSBjb250ZXh0Py5oYW5kbGluZ0tlcm5lbCA/PyBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4ga2VybmVsID8/IHRoaXM7XHJcblxyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBLZXJuZWxDb2xsZWN0aW9uIGltcGxlbWVudHMgSXRlcmFibGU8S2VybmVsPiB7XHJcblxyXG4gICAgcHJpdmF0ZSBfY29tcG9zaXRlS2VybmVsOiBDb21wb3NpdGVLZXJuZWw7XHJcbiAgICBwcml2YXRlIF9rZXJuZWxzOiBLZXJuZWxbXSA9IFtdO1xyXG4gICAgcHJpdmF0ZSBfbmFtZUFuZEFsaWFzZXNCeUtlcm5lbDogTWFwPEtlcm5lbCwgU2V0PHN0cmluZz4+ID0gbmV3IE1hcDxLZXJuZWwsIFNldDxzdHJpbmc+PigpO1xyXG4gICAgcHJpdmF0ZSBfa2VybmVsc0J5TmFtZU9yQWxpYXM6IE1hcDxzdHJpbmcsIEtlcm5lbD4gPSBuZXcgTWFwPHN0cmluZywgS2VybmVsPigpO1xyXG4gICAgcHJpdmF0ZSBfa2VybmVsc0J5TG9jYWxVcmk6IE1hcDxzdHJpbmcsIEtlcm5lbD4gPSBuZXcgTWFwPHN0cmluZywgS2VybmVsPigpO1xyXG4gICAgcHJpdmF0ZSBfa2VybmVsc0J5UmVtb3RlVXJpOiBNYXA8c3RyaW5nLCBLZXJuZWw+ID0gbmV3IE1hcDxzdHJpbmcsIEtlcm5lbD4oKTtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb21wb3NpdGVLZXJuZWw6IENvbXBvc2l0ZUtlcm5lbCkge1xyXG4gICAgICAgIHRoaXMuX2NvbXBvc2l0ZUtlcm5lbCA9IGNvbXBvc2l0ZUtlcm5lbDtcclxuICAgIH1cclxuXHJcbiAgICBbU3ltYm9sLml0ZXJhdG9yXSgpOiBJdGVyYXRvcjxLZXJuZWw+IHtcclxuICAgICAgICBsZXQgY291bnRlciA9IDA7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgbmV4dDogKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdGhpcy5fa2VybmVsc1tjb3VudGVyKytdLFxyXG4gICAgICAgICAgICAgICAgICAgIGRvbmU6IGNvdW50ZXIgPiB0aGlzLl9rZXJuZWxzLmxlbmd0aCAvLz9cclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIHNpbmdsZSgpOiBLZXJuZWwgfCB1bmRlZmluZWQge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9rZXJuZWxzLmxlbmd0aCA9PT0gMSA/IHRoaXMuX2tlcm5lbHNbMF0gOiB1bmRlZmluZWQ7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIHB1YmxpYyBhZGQoa2VybmVsOiBLZXJuZWwsIGFsaWFzZXM/OiBzdHJpbmdbXSk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMudXBkYXRlS2VybmVsSW5mb0FuZEluZGV4KGtlcm5lbCwgYWxpYXNlcyk7XHJcbiAgICAgICAgdGhpcy5fa2VybmVscy5wdXNoKGtlcm5lbCk7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIGdldCBjb3VudCgpOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9rZXJuZWxzLmxlbmd0aDtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGVLZXJuZWxJbmZvQW5kSW5kZXgoa2VybmVsOiBLZXJuZWwsIGFsaWFzZXM/OiBzdHJpbmdbXSk6IHZvaWQge1xyXG4gICAgICAgIGlmICghdGhpcy5fbmFtZUFuZEFsaWFzZXNCeUtlcm5lbC5oYXMoa2VybmVsKSkge1xyXG5cclxuICAgICAgICAgICAgbGV0IHNldCA9IG5ldyBTZXQ8c3RyaW5nPigpO1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgYWxpYXMgb2Yga2VybmVsLmtlcm5lbEluZm8uYWxpYXNlcykge1xyXG4gICAgICAgICAgICAgICAgc2V0LmFkZChhbGlhcyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGtlcm5lbC5rZXJuZWxJbmZvLmFsaWFzZXMgPSBBcnJheS5mcm9tKHNldCk7XHJcblxyXG4gICAgICAgICAgICBzZXQuYWRkKGtlcm5lbC5rZXJuZWxJbmZvLmxvY2FsTmFtZSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLl9uYW1lQW5kQWxpYXNlc0J5S2VybmVsLnNldChrZXJuZWwsIHNldCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChhbGlhc2VzKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGFsaWFzIG9mIGFsaWFzZXMpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX25hbWVBbmRBbGlhc2VzQnlLZXJuZWwuZ2V0KGtlcm5lbCkhLmFkZChhbGlhcyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuX25hbWVBbmRBbGlhc2VzQnlLZXJuZWwuZ2V0KGtlcm5lbCk/LmZvckVhY2goYWxpYXMgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLl9rZXJuZWxzQnlOYW1lT3JBbGlhcy5zZXQoYWxpYXMsIGtlcm5lbCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLl9jb21wb3NpdGVLZXJuZWwuaG9zdCkge1xyXG4gICAgICAgICAgICBrZXJuZWwua2VybmVsSW5mby51cmkgPSBgJHt0aGlzLl9jb21wb3NpdGVLZXJuZWwuaG9zdC51cml9LyR7a2VybmVsLm5hbWV9YDsvLz9cclxuICAgICAgICAgICAgdGhpcy5fa2VybmVsc0J5TG9jYWxVcmkuc2V0KGtlcm5lbC5rZXJuZWxJbmZvLnVyaSwga2VybmVsKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChrZXJuZWwua2VybmVsVHlwZSA9PT0gS2VybmVsVHlwZS5wcm94eSkge1xyXG4gICAgICAgICAgICB0aGlzLl9rZXJuZWxzQnlSZW1vdGVVcmkuc2V0KGtlcm5lbC5rZXJuZWxJbmZvLnJlbW90ZVVyaSEsIGtlcm5lbCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB0cnlHZXRCeUFsaWFzKGFsaWFzOiBzdHJpbmcpOiBLZXJuZWwgfCB1bmRlZmluZWQge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9rZXJuZWxzQnlOYW1lT3JBbGlhcy5nZXQoYWxpYXMpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB0cnlHZXRCeVVyaSh1cmk6IHN0cmluZyk6IEtlcm5lbCB8IHVuZGVmaW5lZCB7XHJcbiAgICAgICAgbGV0IGtlcm5lbCA9IHRoaXMuX2tlcm5lbHNCeUxvY2FsVXJpLmdldCh1cmkpIHx8IHRoaXMuX2tlcm5lbHNCeVJlbW90ZVVyaS5nZXQodXJpKTtcclxuICAgICAgICByZXR1cm4ga2VybmVsO1xyXG4gICAgfVxyXG4gICAgbm90aWZ5VGhhdEhvc3RXYXNTZXQoKSB7XHJcbiAgICAgICAgZm9yIChsZXQga2VybmVsIG9mIHRoaXMuX2tlcm5lbHMpIHtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVLZXJuZWxJbmZvQW5kSW5kZXgoa2VybmVsKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwiLy8gQ29weXJpZ2h0IChjKSAuTkVUIEZvdW5kYXRpb24gYW5kIGNvbnRyaWJ1dG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLiBTZWUgTElDRU5TRSBmaWxlIGluIHRoZSBwcm9qZWN0IHJvb3QgZm9yIGZ1bGwgbGljZW5zZSBpbmZvcm1hdGlvbi5cclxuXHJcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSBcInV0aWxcIjtcclxuaW1wb3J0ICogYXMgY29udHJhY3RzIGZyb20gXCIuL2NvbnRyYWN0c1wiO1xyXG5pbXBvcnQgeyBLZXJuZWxJbnZvY2F0aW9uQ29udGV4dCB9IGZyb20gXCIuL2tlcm5lbEludm9jYXRpb25Db250ZXh0XCI7XHJcbmltcG9ydCAqIGFzIGRpc3Bvc2FibGVzIGZyb20gXCIuL2Rpc3Bvc2FibGVzXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgQ29uc29sZUNhcHR1cmUgaW1wbGVtZW50cyBkaXNwb3NhYmxlcy5EaXNwb3NhYmxlIHtcclxuICAgIHByaXZhdGUgb3JpZ2luYWxDb25zb2xlOiBDb25zb2xlO1xyXG4gICAgcHJpdmF0ZSBfa2VybmVsSW52b2NhdGlvbkNvbnRleHQ6IEtlcm5lbEludm9jYXRpb25Db250ZXh0IHwgdW5kZWZpbmVkO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMub3JpZ2luYWxDb25zb2xlID0gY29uc29sZTtcclxuICAgICAgICBjb25zb2xlID0gPENvbnNvbGU+PGFueT50aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHNldCBrZXJuZWxJbnZvY2F0aW9uQ29udGV4dCh2YWx1ZTogS2VybmVsSW52b2NhdGlvbkNvbnRleHQgfCB1bmRlZmluZWQpIHtcclxuICAgICAgICB0aGlzLl9rZXJuZWxJbnZvY2F0aW9uQ29udGV4dCA9IHZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIGFzc2VydCh2YWx1ZTogYW55LCBtZXNzYWdlPzogc3RyaW5nLCAuLi5vcHRpb25hbFBhcmFtczogYW55W10pOiB2b2lkIHtcclxuICAgICAgICB0aGlzLm9yaWdpbmFsQ29uc29sZS5hc3NlcnQodmFsdWUsIG1lc3NhZ2UsIG9wdGlvbmFsUGFyYW1zKTtcclxuICAgIH1cclxuICAgIGNsZWFyKCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMub3JpZ2luYWxDb25zb2xlLmNsZWFyKCk7XHJcbiAgICB9XHJcbiAgICBjb3VudChsYWJlbD86IGFueSk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMub3JpZ2luYWxDb25zb2xlLmNvdW50KGxhYmVsKTtcclxuICAgIH1cclxuICAgIGNvdW50UmVzZXQobGFiZWw/OiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLm9yaWdpbmFsQ29uc29sZS5jb3VudFJlc2V0KGxhYmVsKTtcclxuICAgIH1cclxuICAgIGRlYnVnKG1lc3NhZ2U/OiBhbnksIC4uLm9wdGlvbmFsUGFyYW1zOiBhbnlbXSk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMub3JpZ2luYWxDb25zb2xlLmRlYnVnKG1lc3NhZ2UsIG9wdGlvbmFsUGFyYW1zKTtcclxuICAgIH1cclxuICAgIGRpcihvYmo6IGFueSwgb3B0aW9ucz86IHV0aWwuSW5zcGVjdE9wdGlvbnMpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLm9yaWdpbmFsQ29uc29sZS5kaXIob2JqLCBvcHRpb25zKTtcclxuICAgIH1cclxuICAgIGRpcnhtbCguLi5kYXRhOiBhbnlbXSk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMub3JpZ2luYWxDb25zb2xlLmRpcnhtbChkYXRhKTtcclxuICAgIH1cclxuICAgIGVycm9yKG1lc3NhZ2U/OiBhbnksIC4uLm9wdGlvbmFsUGFyYW1zOiBhbnlbXSk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMucmVkaXJlY3RBbmRQdWJsaXNoKHRoaXMub3JpZ2luYWxDb25zb2xlLmVycm9yLCAuLi5bbWVzc2FnZSwgLi4ub3B0aW9uYWxQYXJhbXNdKTtcclxuICAgIH1cclxuXHJcbiAgICBncm91cCguLi5sYWJlbDogYW55W10pOiB2b2lkIHtcclxuICAgICAgICB0aGlzLm9yaWdpbmFsQ29uc29sZS5ncm91cChsYWJlbCk7XHJcbiAgICB9XHJcbiAgICBncm91cENvbGxhcHNlZCguLi5sYWJlbDogYW55W10pOiB2b2lkIHtcclxuICAgICAgICB0aGlzLm9yaWdpbmFsQ29uc29sZS5ncm91cENvbGxhcHNlZChsYWJlbCk7XHJcbiAgICB9XHJcbiAgICBncm91cEVuZCgpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLm9yaWdpbmFsQ29uc29sZS5ncm91cEVuZCgpO1xyXG4gICAgfVxyXG4gICAgaW5mbyhtZXNzYWdlPzogYW55LCAuLi5vcHRpb25hbFBhcmFtczogYW55W10pOiB2b2lkIHtcclxuICAgICAgICB0aGlzLnJlZGlyZWN0QW5kUHVibGlzaCh0aGlzLm9yaWdpbmFsQ29uc29sZS5pbmZvLCAuLi5bbWVzc2FnZSwgLi4ub3B0aW9uYWxQYXJhbXNdKTtcclxuICAgIH1cclxuICAgIGxvZyhtZXNzYWdlPzogYW55LCAuLi5vcHRpb25hbFBhcmFtczogYW55W10pOiB2b2lkIHtcclxuICAgICAgICB0aGlzLnJlZGlyZWN0QW5kUHVibGlzaCh0aGlzLm9yaWdpbmFsQ29uc29sZS5sb2csIC4uLlttZXNzYWdlLCAuLi5vcHRpb25hbFBhcmFtc10pO1xyXG4gICAgfVxyXG5cclxuICAgIHRhYmxlKHRhYnVsYXJEYXRhOiBhbnksIHByb3BlcnRpZXM/OiBzdHJpbmdbXSk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMub3JpZ2luYWxDb25zb2xlLnRhYmxlKHRhYnVsYXJEYXRhLCBwcm9wZXJ0aWVzKTtcclxuICAgIH1cclxuICAgIHRpbWUobGFiZWw/OiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLm9yaWdpbmFsQ29uc29sZS50aW1lKGxhYmVsKTtcclxuICAgIH1cclxuICAgIHRpbWVFbmQobGFiZWw/OiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLm9yaWdpbmFsQ29uc29sZS50aW1lRW5kKGxhYmVsKTtcclxuICAgIH1cclxuICAgIHRpbWVMb2cobGFiZWw/OiBzdHJpbmcsIC4uLmRhdGE6IGFueVtdKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5vcmlnaW5hbENvbnNvbGUudGltZUxvZyhsYWJlbCwgZGF0YSk7XHJcbiAgICB9XHJcbiAgICB0aW1lU3RhbXAobGFiZWw/OiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLm9yaWdpbmFsQ29uc29sZS50aW1lU3RhbXAobGFiZWwpO1xyXG4gICAgfVxyXG4gICAgdHJhY2UobWVzc2FnZT86IGFueSwgLi4ub3B0aW9uYWxQYXJhbXM6IGFueVtdKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5yZWRpcmVjdEFuZFB1Ymxpc2godGhpcy5vcmlnaW5hbENvbnNvbGUudHJhY2UsIC4uLlttZXNzYWdlLCAuLi5vcHRpb25hbFBhcmFtc10pO1xyXG4gICAgfVxyXG4gICAgd2FybihtZXNzYWdlPzogYW55LCAuLi5vcHRpb25hbFBhcmFtczogYW55W10pOiB2b2lkIHtcclxuICAgICAgICB0aGlzLm9yaWdpbmFsQ29uc29sZS53YXJuKG1lc3NhZ2UsIG9wdGlvbmFsUGFyYW1zKTtcclxuICAgIH1cclxuXHJcbiAgICBwcm9maWxlKGxhYmVsPzogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5vcmlnaW5hbENvbnNvbGUucHJvZmlsZShsYWJlbCk7XHJcbiAgICB9XHJcbiAgICBwcm9maWxlRW5kKGxhYmVsPzogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5vcmlnaW5hbENvbnNvbGUucHJvZmlsZUVuZChsYWJlbCk7XHJcbiAgICB9XHJcblxyXG4gICAgZGlzcG9zZSgpOiB2b2lkIHtcclxuICAgICAgICBjb25zb2xlID0gdGhpcy5vcmlnaW5hbENvbnNvbGU7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSByZWRpcmVjdEFuZFB1Ymxpc2godGFyZ2V0OiAoLi4uYXJnczogYW55W10pID0+IHZvaWQsIC4uLmFyZ3M6IGFueVtdKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2tlcm5lbEludm9jYXRpb25Db250ZXh0KSB7XHJcbiAgICAgICAgICAgIGZvciAoY29uc3QgYXJnIG9mIGFyZ3MpIHtcclxuICAgICAgICAgICAgICAgIGxldCBtaW1lVHlwZTogc3RyaW5nO1xyXG4gICAgICAgICAgICAgICAgbGV0IHZhbHVlOiBzdHJpbmc7XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGFyZyAhPT0gJ29iamVjdCcgJiYgIUFycmF5LmlzQXJyYXkoYXJnKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIG1pbWVUeXBlID0gJ3RleHQvcGxhaW4nO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gYXJnPy50b1N0cmluZygpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBtaW1lVHlwZSA9ICdhcHBsaWNhdGlvbi9qc29uJztcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IEpTT04uc3RyaW5naWZ5KGFyZyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgZGlzcGxheWVkVmFsdWU6IGNvbnRyYWN0cy5EaXNwbGF5ZWRWYWx1ZVByb2R1Y2VkID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvcm1hdHRlZFZhbHVlczogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaW1lVHlwZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGV2ZW50RW52ZWxvcGU6IGNvbnRyYWN0cy5LZXJuZWxFdmVudEVudmVsb3BlID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50VHlwZTogY29udHJhY3RzLkRpc3BsYXllZFZhbHVlUHJvZHVjZWRUeXBlLFxyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50OiBkaXNwbGF5ZWRWYWx1ZSxcclxuICAgICAgICAgICAgICAgICAgICBjb21tYW5kOiB0aGlzLl9rZXJuZWxJbnZvY2F0aW9uQ29udGV4dC5jb21tYW5kRW52ZWxvcGVcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5fa2VybmVsSW52b2NhdGlvbkNvbnRleHQucHVibGlzaChldmVudEVudmVsb3BlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGFyZ2V0KSB7XHJcbiAgICAgICAgICAgIHRhcmdldCguLi5hcmdzKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCIvLyBDb3B5cmlnaHQgKGMpIC5ORVQgRm91bmRhdGlvbiBhbmQgY29udHJpYnV0b3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuIFNlZSBMSUNFTlNFIGZpbGUgaW4gdGhlIHByb2plY3Qgcm9vdCBmb3IgZnVsbCBsaWNlbnNlIGluZm9ybWF0aW9uLlxyXG5cclxuaW1wb3J0ICogYXMgY29udHJhY3RzIGZyb20gXCIuL2NvbnRyYWN0c1wiO1xyXG5pbXBvcnQgeyBDb25zb2xlQ2FwdHVyZSB9IGZyb20gXCIuL2NvbnNvbGVDYXB0dXJlXCI7XHJcbmltcG9ydCB7IEtlcm5lbCwgSUtlcm5lbENvbW1hbmRJbnZvY2F0aW9uIH0gZnJvbSBcIi4va2VybmVsXCI7XHJcbmltcG9ydCB7IExvZ2dlciB9IGZyb20gXCIuL2xvZ2dlclwiO1xyXG5cclxuZXhwb3J0IGNsYXNzIEphdmFzY3JpcHRLZXJuZWwgZXh0ZW5kcyBLZXJuZWwge1xyXG4gICAgcHJpdmF0ZSBzdXBwcmVzc2VkTG9jYWxzOiBTZXQ8c3RyaW5nPjtcclxuICAgIHByaXZhdGUgY2FwdHVyZTogQ29uc29sZUNhcHR1cmU7XHJcblxyXG4gICAgY29uc3RydWN0b3IobmFtZT86IHN0cmluZykge1xyXG4gICAgICAgIHN1cGVyKG5hbWUgPz8gXCJqYXZhc2NyaXB0XCIsIFwiSmF2YXNjcmlwdFwiKTtcclxuICAgICAgICB0aGlzLnN1cHByZXNzZWRMb2NhbHMgPSBuZXcgU2V0PHN0cmluZz4odGhpcy5hbGxMb2NhbFZhcmlhYmxlTmFtZXMoKSk7XHJcbiAgICAgICAgdGhpcy5yZWdpc3RlckNvbW1hbmRIYW5kbGVyKHsgY29tbWFuZFR5cGU6IGNvbnRyYWN0cy5TdWJtaXRDb2RlVHlwZSwgaGFuZGxlOiBpbnZvY2F0aW9uID0+IHRoaXMuaGFuZGxlU3VibWl0Q29kZShpbnZvY2F0aW9uKSB9KTtcclxuICAgICAgICB0aGlzLnJlZ2lzdGVyQ29tbWFuZEhhbmRsZXIoeyBjb21tYW5kVHlwZTogY29udHJhY3RzLlJlcXVlc3RWYWx1ZUluZm9zVHlwZSwgaGFuZGxlOiBpbnZvY2F0aW9uID0+IHRoaXMuaGFuZGxlUmVxdWVzdFZhbHVlSW5mb3MoaW52b2NhdGlvbikgfSk7XHJcbiAgICAgICAgdGhpcy5yZWdpc3RlckNvbW1hbmRIYW5kbGVyKHsgY29tbWFuZFR5cGU6IGNvbnRyYWN0cy5SZXF1ZXN0VmFsdWVUeXBlLCBoYW5kbGU6IGludm9jYXRpb24gPT4gdGhpcy5oYW5kbGVSZXF1ZXN0VmFsdWUoaW52b2NhdGlvbikgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuY2FwdHVyZSA9IG5ldyBDb25zb2xlQ2FwdHVyZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgaGFuZGxlU3VibWl0Q29kZShpbnZvY2F0aW9uOiBJS2VybmVsQ29tbWFuZEludm9jYXRpb24pOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICBjb25zdCBzdWJtaXRDb2RlID0gPGNvbnRyYWN0cy5TdWJtaXRDb2RlPmludm9jYXRpb24uY29tbWFuZEVudmVsb3BlLmNvbW1hbmQ7XHJcbiAgICAgICAgY29uc3QgY29kZSA9IHN1Ym1pdENvZGUuY29kZTtcclxuXHJcbiAgICAgICAgc3VwZXIua2VybmVsSW5mby5sb2NhbE5hbWU7Ly8/XHJcbiAgICAgICAgc3VwZXIua2VybmVsSW5mby51cmk7Ly8/XHJcbiAgICAgICAgc3VwZXIua2VybmVsSW5mby5yZW1vdGVVcmk7Ly8/XHJcbiAgICAgICAgaW52b2NhdGlvbi5jb250ZXh0LnB1Ymxpc2goeyBldmVudFR5cGU6IGNvbnRyYWN0cy5Db2RlU3VibWlzc2lvblJlY2VpdmVkVHlwZSwgZXZlbnQ6IHsgY29kZSB9LCBjb21tYW5kOiBpbnZvY2F0aW9uLmNvbW1hbmRFbnZlbG9wZSB9KTtcclxuICAgICAgICBpbnZvY2F0aW9uLmNvbnRleHQuY29tbWFuZEVudmVsb3BlLnJvdXRpbmdTbGlwOy8vP1xyXG4gICAgICAgIHRoaXMuY2FwdHVyZS5rZXJuZWxJbnZvY2F0aW9uQ29udGV4dCA9IGludm9jYXRpb24uY29udGV4dDtcclxuICAgICAgICBsZXQgcmVzdWx0OiBhbnkgPSB1bmRlZmluZWQ7XHJcblxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IEFzeW5jRnVuY3Rpb24gPSBldmFsKGBPYmplY3QuZ2V0UHJvdG90eXBlT2YoYXN5bmMgZnVuY3Rpb24oKXt9KS5jb25zdHJ1Y3RvcmApO1xyXG4gICAgICAgICAgICBjb25zdCBldmFsdWF0b3IgPSBBc3luY0Z1bmN0aW9uKFwiY29uc29sZVwiLCBjb2RlKTtcclxuICAgICAgICAgICAgcmVzdWx0ID0gYXdhaXQgZXZhbHVhdG9yKHRoaXMuY2FwdHVyZSk7XHJcbiAgICAgICAgICAgIGlmIChyZXN1bHQgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZm9ybWF0dGVkVmFsdWUgPSBmb3JtYXRWYWx1ZShyZXN1bHQsICdhcHBsaWNhdGlvbi9qc29uJyk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBldmVudDogY29udHJhY3RzLlJldHVyblZhbHVlUHJvZHVjZWQgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9ybWF0dGVkVmFsdWVzOiBbZm9ybWF0dGVkVmFsdWVdXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgaW52b2NhdGlvbi5jb250ZXh0LnB1Ymxpc2goeyBldmVudFR5cGU6IGNvbnRyYWN0cy5SZXR1cm5WYWx1ZVByb2R1Y2VkVHlwZSwgZXZlbnQsIGNvbW1hbmQ6IGludm9jYXRpb24uY29tbWFuZEVudmVsb3BlIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICB0aHJvdyBlOy8vP1xyXG4gICAgICAgIH1cclxuICAgICAgICBmaW5hbGx5IHtcclxuICAgICAgICAgICAgdGhpcy5jYXB0dXJlLmtlcm5lbEludm9jYXRpb25Db250ZXh0ID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGhhbmRsZVJlcXVlc3RWYWx1ZUluZm9zKGludm9jYXRpb246IElLZXJuZWxDb21tYW5kSW52b2NhdGlvbik6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIGNvbnN0IHZhbHVlSW5mb3M6IGNvbnRyYWN0cy5LZXJuZWxWYWx1ZUluZm9bXSA9IHRoaXMuYWxsTG9jYWxWYXJpYWJsZU5hbWVzKCkuZmlsdGVyKHYgPT4gIXRoaXMuc3VwcHJlc3NlZExvY2Fscy5oYXModikpLm1hcCh2ID0+ICh7IG5hbWU6IHYgfSkpO1xyXG4gICAgICAgIGNvbnN0IGV2ZW50OiBjb250cmFjdHMuVmFsdWVJbmZvc1Byb2R1Y2VkID0ge1xyXG4gICAgICAgICAgICB2YWx1ZUluZm9zXHJcbiAgICAgICAgfTtcclxuICAgICAgICBpbnZvY2F0aW9uLmNvbnRleHQucHVibGlzaCh7IGV2ZW50VHlwZTogY29udHJhY3RzLlZhbHVlSW5mb3NQcm9kdWNlZFR5cGUsIGV2ZW50LCBjb21tYW5kOiBpbnZvY2F0aW9uLmNvbW1hbmRFbnZlbG9wZSB9KTtcclxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBoYW5kbGVSZXF1ZXN0VmFsdWUoaW52b2NhdGlvbjogSUtlcm5lbENvbW1hbmRJbnZvY2F0aW9uKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgY29uc3QgcmVxdWVzdFZhbHVlID0gPGNvbnRyYWN0cy5SZXF1ZXN0VmFsdWU+aW52b2NhdGlvbi5jb21tYW5kRW52ZWxvcGUuY29tbWFuZDtcclxuICAgICAgICBjb25zdCByYXdWYWx1ZSA9IHRoaXMuZ2V0TG9jYWxWYXJpYWJsZShyZXF1ZXN0VmFsdWUubmFtZSk7XHJcbiAgICAgICAgY29uc3QgZm9ybWF0dGVkVmFsdWUgPSBmb3JtYXRWYWx1ZShyYXdWYWx1ZSwgcmVxdWVzdFZhbHVlLm1pbWVUeXBlIHx8ICdhcHBsaWNhdGlvbi9qc29uJyk7XHJcbiAgICAgICAgTG9nZ2VyLmRlZmF1bHQuaW5mbyhgcmV0dXJuaW5nICR7SlNPTi5zdHJpbmdpZnkoZm9ybWF0dGVkVmFsdWUpfSBmb3IgJHtyZXF1ZXN0VmFsdWUubmFtZX1gKTtcclxuICAgICAgICBjb25zdCBldmVudDogY29udHJhY3RzLlZhbHVlUHJvZHVjZWQgPSB7XHJcbiAgICAgICAgICAgIG5hbWU6IHJlcXVlc3RWYWx1ZS5uYW1lLFxyXG4gICAgICAgICAgICBmb3JtYXR0ZWRWYWx1ZVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgaW52b2NhdGlvbi5jb250ZXh0LnB1Ymxpc2goeyBldmVudFR5cGU6IGNvbnRyYWN0cy5WYWx1ZVByb2R1Y2VkVHlwZSwgZXZlbnQsIGNvbW1hbmQ6IGludm9jYXRpb24uY29tbWFuZEVudmVsb3BlIH0pO1xyXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFsbExvY2FsVmFyaWFibGVOYW1lcygpOiBzdHJpbmdbXSB7XHJcbiAgICAgICAgY29uc3QgcmVzdWx0OiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IGluIGdsb2JhbFRoaXMpIHtcclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiAoPGFueT5nbG9iYWxUaGlzKVtrZXldICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKGtleSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIExvZ2dlci5kZWZhdWx0LmVycm9yKGBlcnJvciBnZXR0aW5nIHZhbHVlIGZvciAke2tleX0gOiAke2V9YCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIExvZ2dlci5kZWZhdWx0LmVycm9yKGBlcnJvciBzY2FubmluZyBnbG9ibGEgdmFyaWFibGVzIDogJHtlfWApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldExvY2FsVmFyaWFibGUobmFtZTogc3RyaW5nKTogYW55IHtcclxuICAgICAgICByZXR1cm4gKDxhbnk+Z2xvYmFsVGhpcylbbmFtZV07XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXRWYWx1ZShhcmc6IGFueSwgbWltZVR5cGU6IHN0cmluZyk6IGNvbnRyYWN0cy5Gb3JtYXR0ZWRWYWx1ZSB7XHJcbiAgICBsZXQgdmFsdWU6IHN0cmluZztcclxuXHJcbiAgICBzd2l0Y2ggKG1pbWVUeXBlKSB7XHJcbiAgICAgICAgY2FzZSAndGV4dC9wbGFpbic6XHJcbiAgICAgICAgICAgIHZhbHVlID0gYXJnPy50b1N0cmluZygpIHx8ICd1bmRlZmluZWQnO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICdhcHBsaWNhdGlvbi9qc29uJzpcclxuICAgICAgICAgICAgdmFsdWUgPSBKU09OLnN0cmluZ2lmeShhcmcpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYHVuc3VwcG9ydGVkIG1pbWUgdHlwZTogJHttaW1lVHlwZX1gKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIG1pbWVUeXBlLFxyXG4gICAgICAgIHZhbHVlLFxyXG4gICAgfTtcclxufVxyXG4iLCIvLyBDb3B5cmlnaHQgKGMpIC5ORVQgRm91bmRhdGlvbiBhbmQgY29udHJpYnV0b3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuIFNlZSBMSUNFTlNFIGZpbGUgaW4gdGhlIHByb2plY3Qgcm9vdCBmb3IgZnVsbCBsaWNlbnNlIGluZm9ybWF0aW9uLlxyXG5cclxuaW1wb3J0ICogYXMgY29udHJhY3RzIGZyb20gXCIuL2NvbnRyYWN0c1wiO1xyXG5pbXBvcnQgeyBMb2dnZXIgfSBmcm9tIFwiLi9sb2dnZXJcIjtcclxuaW1wb3J0IHsgS2VybmVsLCBJS2VybmVsQ29tbWFuZEhhbmRsZXIsIElLZXJuZWxDb21tYW5kSW52b2NhdGlvbiwgZ2V0S2VybmVsVXJpLCBLZXJuZWxUeXBlIH0gZnJvbSBcIi4va2VybmVsXCI7XHJcbmltcG9ydCAqIGFzIGNvbm5lY3Rpb24gZnJvbSBcIi4vY29ubmVjdGlvblwiO1xyXG5pbXBvcnQgeyBQcm9taXNlQ29tcGxldGlvblNvdXJjZSB9IGZyb20gXCIuL3Byb21pc2VDb21wbGV0aW9uU291cmNlXCI7XHJcbmltcG9ydCB7IEtlcm5lbEludm9jYXRpb25Db250ZXh0IH0gZnJvbSBcIi4va2VybmVsSW52b2NhdGlvbkNvbnRleHRcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBQcm94eUtlcm5lbCBleHRlbmRzIEtlcm5lbCB7XHJcblxyXG4gICAgY29uc3RydWN0b3Iob3ZlcnJpZGUgcmVhZG9ubHkgbmFtZTogc3RyaW5nLCBwcml2YXRlIHJlYWRvbmx5IF9zZW5kZXI6IGNvbm5lY3Rpb24uSUtlcm5lbENvbW1hbmRBbmRFdmVudFNlbmRlciwgcHJpdmF0ZSByZWFkb25seSBfcmVjZWl2ZXI6IGNvbm5lY3Rpb24uSUtlcm5lbENvbW1hbmRBbmRFdmVudFJlY2VpdmVyKSB7XHJcbiAgICAgICAgc3VwZXIobmFtZSk7XHJcbiAgICAgICAgdGhpcy5rZXJuZWxUeXBlID0gS2VybmVsVHlwZS5wcm94eTtcclxuICAgIH1cclxuICAgIG92ZXJyaWRlIGdldENvbW1hbmRIYW5kbGVyKGNvbW1hbmRUeXBlOiBjb250cmFjdHMuS2VybmVsQ29tbWFuZFR5cGUpOiBJS2VybmVsQ29tbWFuZEhhbmRsZXIgfCB1bmRlZmluZWQge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGNvbW1hbmRUeXBlLFxyXG4gICAgICAgICAgICBoYW5kbGU6IChpbnZvY2F0aW9uKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fY29tbWFuZEhhbmRsZXIoaW52b2NhdGlvbik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZGVsZWdhdGVQdWJsaWNhdGlvbihlbnZlbG9wZTogY29udHJhY3RzLktlcm5lbEV2ZW50RW52ZWxvcGUsIGludm9jYXRpb25Db250ZXh0OiBLZXJuZWxJbnZvY2F0aW9uQ29udGV4dCk6IHZvaWQge1xyXG4gICAgICAgIGxldCBhbHJlYWR5QmVlblNlZW4gPSBmYWxzZTtcclxuICAgICAgICBpZiAoZW52ZWxvcGUucm91dGluZ1NsaXAgPT09IHVuZGVmaW5lZCB8fCAhZW52ZWxvcGUucm91dGluZ1NsaXAuZmluZChlID0+IGUgPT09IGdldEtlcm5lbFVyaSh0aGlzKSkpIHtcclxuICAgICAgICAgICAgY29ubmVjdGlvbi50cnlBZGRVcmlUb1JvdXRpbmdTbGlwKGVudmVsb3BlLCBnZXRLZXJuZWxVcmkodGhpcykpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGFscmVhZHlCZWVuU2VlbiA9IHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5oYXNTYW1lT3JpZ2luKGVudmVsb3BlKSkge1xyXG4gICAgICAgICAgICBpZiAoIWFscmVhZHlCZWVuU2Vlbikge1xyXG4gICAgICAgICAgICAgICAgaW52b2NhdGlvbkNvbnRleHQucHVibGlzaChlbnZlbG9wZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBoYXNTYW1lT3JpZ2luKGVudmVsb3BlOiBjb250cmFjdHMuS2VybmVsRXZlbnRFbnZlbG9wZSk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGxldCBjb21tYW5kT3JpZ2luVXJpID0gZW52ZWxvcGUuY29tbWFuZD8uY29tbWFuZD8ub3JpZ2luVXJpID8/IHRoaXMua2VybmVsSW5mby51cmk7XHJcbiAgICAgICAgaWYgKGNvbW1hbmRPcmlnaW5VcmkgPT09IHRoaXMua2VybmVsSW5mby51cmkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gY29tbWFuZE9yaWdpblVyaSA9PT0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHVwZGF0ZUtlcm5lbEluZm9Gcm9tRXZlbnQoa2VybmVsSW5mb1Byb2R1Y2VkOiBjb250cmFjdHMuS2VybmVsSW5mb1Byb2R1Y2VkKSB7XHJcbiAgICAgICAgdGhpcy5rZXJuZWxJbmZvLmxhbmd1YWdlTmFtZSA9IGtlcm5lbEluZm9Qcm9kdWNlZC5rZXJuZWxJbmZvLmxhbmd1YWdlTmFtZTtcclxuICAgICAgICB0aGlzLmtlcm5lbEluZm8ubGFuZ3VhZ2VWZXJzaW9uID0ga2VybmVsSW5mb1Byb2R1Y2VkLmtlcm5lbEluZm8ubGFuZ3VhZ2VWZXJzaW9uO1xyXG5cclxuICAgICAgICBjb25zdCBzdXBwb3J0ZWREaXJlY3RpdmVzID0gbmV3IFNldDxzdHJpbmc+KCk7XHJcbiAgICAgICAgY29uc3Qgc3VwcG9ydGVkQ29tbWFuZHMgPSBuZXcgU2V0PHN0cmluZz4oKTtcclxuXHJcbiAgICAgICAgaWYgKCF0aGlzLmtlcm5lbEluZm8uc3VwcG9ydGVkRGlyZWN0aXZlcykge1xyXG4gICAgICAgICAgICB0aGlzLmtlcm5lbEluZm8uc3VwcG9ydGVkRGlyZWN0aXZlcyA9IFtdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCF0aGlzLmtlcm5lbEluZm8uc3VwcG9ydGVkS2VybmVsQ29tbWFuZHMpIHtcclxuICAgICAgICAgICAgdGhpcy5rZXJuZWxJbmZvLnN1cHBvcnRlZEtlcm5lbENvbW1hbmRzID0gW107XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKGNvbnN0IHN1cHBvcnRlZERpcmVjdGl2ZSBvZiB0aGlzLmtlcm5lbEluZm8uc3VwcG9ydGVkRGlyZWN0aXZlcykge1xyXG4gICAgICAgICAgICBzdXBwb3J0ZWREaXJlY3RpdmVzLmFkZChzdXBwb3J0ZWREaXJlY3RpdmUubmFtZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKGNvbnN0IHN1cHBvcnRlZENvbW1hbmQgb2YgdGhpcy5rZXJuZWxJbmZvLnN1cHBvcnRlZEtlcm5lbENvbW1hbmRzKSB7XHJcbiAgICAgICAgICAgIHN1cHBvcnRlZENvbW1hbmRzLmFkZChzdXBwb3J0ZWRDb21tYW5kLm5hbWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yIChjb25zdCBzdXBwb3J0ZWREaXJlY3RpdmUgb2Yga2VybmVsSW5mb1Byb2R1Y2VkLmtlcm5lbEluZm8uc3VwcG9ydGVkRGlyZWN0aXZlcykge1xyXG4gICAgICAgICAgICBpZiAoIXN1cHBvcnRlZERpcmVjdGl2ZXMuaGFzKHN1cHBvcnRlZERpcmVjdGl2ZS5uYW1lKSkge1xyXG4gICAgICAgICAgICAgICAgc3VwcG9ydGVkRGlyZWN0aXZlcy5hZGQoc3VwcG9ydGVkRGlyZWN0aXZlLm5hbWUpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5rZXJuZWxJbmZvLnN1cHBvcnRlZERpcmVjdGl2ZXMucHVzaChzdXBwb3J0ZWREaXJlY3RpdmUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKGNvbnN0IHN1cHBvcnRlZENvbW1hbmQgb2Yga2VybmVsSW5mb1Byb2R1Y2VkLmtlcm5lbEluZm8uc3VwcG9ydGVkS2VybmVsQ29tbWFuZHMpIHtcclxuICAgICAgICAgICAgaWYgKCFzdXBwb3J0ZWRDb21tYW5kcy5oYXMoc3VwcG9ydGVkQ29tbWFuZC5uYW1lKSkge1xyXG4gICAgICAgICAgICAgICAgc3VwcG9ydGVkQ29tbWFuZHMuYWRkKHN1cHBvcnRlZENvbW1hbmQubmFtZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmtlcm5lbEluZm8uc3VwcG9ydGVkS2VybmVsQ29tbWFuZHMucHVzaChzdXBwb3J0ZWRDb21tYW5kKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIF9jb21tYW5kSGFuZGxlcihjb21tYW5kSW52b2NhdGlvbjogSUtlcm5lbENvbW1hbmRJbnZvY2F0aW9uKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgY29uc3QgY29tbWFuZFRva2VuID0gY29tbWFuZEludm9jYXRpb24uY29tbWFuZEVudmVsb3BlLnRva2VuO1xyXG4gICAgICAgIGNvbnN0IGNvbW1hbmRJZCA9IGNvbW1hbmRJbnZvY2F0aW9uLmNvbW1hbmRFbnZlbG9wZS5pZDtcclxuICAgICAgICBjb25zdCBjb21wbGV0aW9uU291cmNlID0gbmV3IFByb21pc2VDb21wbGV0aW9uU291cmNlPGNvbnRyYWN0cy5LZXJuZWxFdmVudEVudmVsb3BlPigpO1xyXG4gICAgICAgIC8vIGZpeCA6IGlzIHRoaXMgdGhlIHJpZ2h0IHdheT8gV2UgYXJlIHRyeWluZyB0byBhdm9pZCBmb3J3YXJkaW5nIGV2ZW50cyB3ZSBqdXN0IGRpZCBmb3J3YXJkXHJcbiAgICAgICAgbGV0IGV2ZW50U3Vic2NyaXB0aW9uID0gdGhpcy5fcmVjZWl2ZXIuc3Vic2NyaWJlKHtcclxuICAgICAgICAgICAgbmV4dDogKGVudmVsb3BlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoY29ubmVjdGlvbi5pc0tlcm5lbEV2ZW50RW52ZWxvcGUoZW52ZWxvcGUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVudmVsb3BlLmV2ZW50VHlwZSA9PT0gY29udHJhY3RzLktlcm5lbEluZm9Qcm9kdWNlZFR5cGUgJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgKGVudmVsb3BlLmNvbW1hbmQgPT09IG51bGwgfHwgZW52ZWxvcGUuY29tbWFuZCA9PT0gdW5kZWZpbmVkKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBrZXJuZWxJbmZvUHJvZHVjZWQgPSA8Y29udHJhY3RzLktlcm5lbEluZm9Qcm9kdWNlZD5lbnZlbG9wZS5ldmVudDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy51cGRhdGVLZXJuZWxJbmZvRnJvbUV2ZW50KGtlcm5lbEluZm9Qcm9kdWNlZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHVibGlzaEV2ZW50KFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50VHlwZTogY29udHJhY3RzLktlcm5lbEluZm9Qcm9kdWNlZFR5cGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQ6IHsga2VybmVsSW5mbzogdGhpcy5rZXJuZWxJbmZvIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChlbnZlbG9wZS5jb21tYW5kIS50b2tlbiA9PT0gY29tbWFuZFRva2VuKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGtlcm5lbFVyaSBvZiBlbnZlbG9wZS5jb21tYW5kIS5yb3V0aW5nU2xpcCEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbm5lY3Rpb24udHJ5QWRkVXJpVG9Sb3V0aW5nU2xpcChjb21tYW5kSW52b2NhdGlvbi5jb21tYW5kRW52ZWxvcGUsIGtlcm5lbFVyaSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnZlbG9wZS5jb21tYW5kIS5yb3V0aW5nU2xpcCA9IGNvbW1hbmRJbnZvY2F0aW9uLmNvbW1hbmRFbnZlbG9wZS5yb3V0aW5nU2xpcDsvLz9cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChlbnZlbG9wZS5ldmVudFR5cGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgY29udHJhY3RzLktlcm5lbEluZm9Qcm9kdWNlZFR5cGU6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBrZXJuZWxJbmZvUHJvZHVjZWQgPSA8Y29udHJhY3RzLktlcm5lbEluZm9Qcm9kdWNlZD5lbnZlbG9wZS5ldmVudDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy51cGRhdGVLZXJuZWxJbmZvRnJvbUV2ZW50KGtlcm5lbEluZm9Qcm9kdWNlZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGVsZWdhdGVQdWJsaWNhdGlvbihcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudFR5cGU6IGNvbnRyYWN0cy5LZXJuZWxJbmZvUHJvZHVjZWRUeXBlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50OiB7IGtlcm5lbEluZm86IHRoaXMua2VybmVsSW5mbyB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvdXRpbmdTbGlwOiBlbnZlbG9wZS5yb3V0aW5nU2xpcCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21tYW5kOiBjb21tYW5kSW52b2NhdGlvbi5jb21tYW5kRW52ZWxvcGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIGNvbW1hbmRJbnZvY2F0aW9uLmNvbnRleHQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRlbGVnYXRlUHVibGljYXRpb24oZW52ZWxvcGUsIGNvbW1hbmRJbnZvY2F0aW9uLmNvbnRleHQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgY29udHJhY3RzLkNvbW1hbmRGYWlsZWRUeXBlOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBjb250cmFjdHMuQ29tbWFuZFN1Y2NlZWRlZFR5cGU6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVudmVsb3BlLmNvbW1hbmQhLmlkID09PSBjb21tYW5kSWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcGxldGlvblNvdXJjZS5yZXNvbHZlKGVudmVsb3BlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRlbGVnYXRlUHVibGljYXRpb24oZW52ZWxvcGUsIGNvbW1hbmRJbnZvY2F0aW9uLmNvbnRleHQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWxlZ2F0ZVB1YmxpY2F0aW9uKGVudmVsb3BlLCBjb21tYW5kSW52b2NhdGlvbi5jb250ZXh0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBpZiAoIWNvbW1hbmRJbnZvY2F0aW9uLmNvbW1hbmRFbnZlbG9wZS5jb21tYW5kLmRlc3RpbmF0aW9uVXJpIHx8ICFjb21tYW5kSW52b2NhdGlvbi5jb21tYW5kRW52ZWxvcGUuY29tbWFuZC5vcmlnaW5VcmkpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGtlcm5lbEluZm8gPSB0aGlzLnBhcmVudEtlcm5lbD8uaG9zdD8udHJ5R2V0S2VybmVsSW5mbyh0aGlzKTtcclxuICAgICAgICAgICAgICAgIGlmIChrZXJuZWxJbmZvKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29tbWFuZEludm9jYXRpb24uY29tbWFuZEVudmVsb3BlLmNvbW1hbmQub3JpZ2luVXJpID8/PSBrZXJuZWxJbmZvLnVyaTtcclxuICAgICAgICAgICAgICAgICAgICBjb21tYW5kSW52b2NhdGlvbi5jb21tYW5kRW52ZWxvcGUuY29tbWFuZC5kZXN0aW5hdGlvblVyaSA/Pz0ga2VybmVsSW5mby5yZW1vdGVVcmk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNvbW1hbmRJbnZvY2F0aW9uLmNvbW1hbmRFbnZlbG9wZS5yb3V0aW5nU2xpcDsvLz9cclxuXHJcbiAgICAgICAgICAgIHRoaXMuX3NlbmRlci5zZW5kKGNvbW1hbmRJbnZvY2F0aW9uLmNvbW1hbmRFbnZlbG9wZSk7XHJcbiAgICAgICAgICAgIExvZ2dlci5kZWZhdWx0LmluZm8oYHByb3h5ICR7dGhpcy5uYW1lfSBhYm91dCB0byBhd2FpdCB3aXRoIHRva2VuICR7Y29tbWFuZFRva2VufWApO1xyXG4gICAgICAgICAgICBjb25zdCBlbnZlbnRFbnZlbG9wZSA9IGF3YWl0IGNvbXBsZXRpb25Tb3VyY2UucHJvbWlzZTtcclxuICAgICAgICAgICAgaWYgKGVudmVudEVudmVsb3BlLmV2ZW50VHlwZSA9PT0gY29udHJhY3RzLkNvbW1hbmRGYWlsZWRUeXBlKSB7XHJcbiAgICAgICAgICAgICAgICBjb21tYW5kSW52b2NhdGlvbi5jb250ZXh0LmZhaWwoKDxjb250cmFjdHMuQ29tbWFuZEZhaWxlZD5lbnZlbnRFbnZlbG9wZS5ldmVudCkubWVzc2FnZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgTG9nZ2VyLmRlZmF1bHQuaW5mbyhgcHJveHkgJHt0aGlzLm5hbWV9IGRvbmUgYXdhaXRpbmcgd2l0aCB0b2tlbiAke2NvbW1hbmRUb2tlbn1gKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgY29tbWFuZEludm9jYXRpb24uY29udGV4dC5mYWlsKCg8YW55PmUpLm1lc3NhZ2UpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmaW5hbGx5IHtcclxuICAgICAgICAgICAgZXZlbnRTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwiLy8gQ29weXJpZ2h0IChjKSAuTkVUIEZvdW5kYXRpb24gYW5kIGNvbnRyaWJ1dG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLiBTZWUgTElDRU5TRSBmaWxlIGluIHRoZSBwcm9qZWN0IHJvb3QgZm9yIGZ1bGwgbGljZW5zZSBpbmZvcm1hdGlvbi5cclxuXHJcbmltcG9ydCB7IENvbXBvc2l0ZUtlcm5lbCB9IGZyb20gJy4vY29tcG9zaXRlS2VybmVsJztcclxuaW1wb3J0ICogYXMgY29udHJhY3RzIGZyb20gJy4vY29udHJhY3RzJztcclxuaW1wb3J0ICogYXMgY29ubmVjdGlvbiBmcm9tICcuL2Nvbm5lY3Rpb24nO1xyXG5pbXBvcnQgeyBLZXJuZWwsIEtlcm5lbFR5cGUgfSBmcm9tICcuL2tlcm5lbCc7XHJcbmltcG9ydCB7IFByb3h5S2VybmVsIH0gZnJvbSAnLi9wcm94eUtlcm5lbCc7XHJcbmltcG9ydCB7IExvZ2dlciB9IGZyb20gJy4vbG9nZ2VyJztcclxuaW1wb3J0IHsgS2VybmVsU2NoZWR1bGVyIH0gZnJvbSAnLi9rZXJuZWxTY2hlZHVsZXInO1xyXG5cclxuZXhwb3J0IGNsYXNzIEtlcm5lbEhvc3Qge1xyXG4gICAgcHJpdmF0ZSByZWFkb25seSBfcmVtb3RlVXJpVG9LZXJuZWwgPSBuZXcgTWFwPHN0cmluZywgS2VybmVsPigpO1xyXG4gICAgcHJpdmF0ZSByZWFkb25seSBfdXJpVG9LZXJuZWwgPSBuZXcgTWFwPHN0cmluZywgS2VybmVsPigpO1xyXG4gICAgcHJpdmF0ZSByZWFkb25seSBfa2VybmVsVG9LZXJuZWxJbmZvID0gbmV3IE1hcDxLZXJuZWwsIGNvbnRyYWN0cy5LZXJuZWxJbmZvPigpO1xyXG4gICAgcHJpdmF0ZSByZWFkb25seSBfdXJpOiBzdHJpbmc7XHJcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9zY2hlZHVsZXI6IEtlcm5lbFNjaGVkdWxlcjxjb250cmFjdHMuS2VybmVsQ29tbWFuZEVudmVsb3BlPjtcclxuICAgIHByaXZhdGUgX2RlZmF1bHRTZW5kZXI6IGNvbm5lY3Rpb24uSUtlcm5lbENvbW1hbmRBbmRFdmVudFNlbmRlcjtcclxuICAgIHByaXZhdGUgX2RlZmF1bHRSZWNlaXZlcjogY29ubmVjdGlvbi5JS2VybmVsQ29tbWFuZEFuZEV2ZW50UmVjZWl2ZXI7XHJcbiAgICBwcml2YXRlIF9rZXJuZWw6IENvbXBvc2l0ZUtlcm5lbDtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihrZXJuZWw6IENvbXBvc2l0ZUtlcm5lbCwgc2VuZGVyOiBjb25uZWN0aW9uLklLZXJuZWxDb21tYW5kQW5kRXZlbnRTZW5kZXIsIHJlY2VpdmVyOiBjb25uZWN0aW9uLklLZXJuZWxDb21tYW5kQW5kRXZlbnRSZWNlaXZlciwgaG9zdFVyaTogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5fa2VybmVsID0ga2VybmVsO1xyXG4gICAgICAgIHRoaXMuX3VyaSA9IGhvc3RVcmkgfHwgXCJrZXJuZWw6Ly92c2NvZGVcIjtcclxuICAgICAgICB0aGlzLl9rZXJuZWwuaG9zdCA9IHRoaXM7XHJcbiAgICAgICAgdGhpcy5fc2NoZWR1bGVyID0gbmV3IEtlcm5lbFNjaGVkdWxlcjxjb250cmFjdHMuS2VybmVsQ29tbWFuZEVudmVsb3BlPigpO1xyXG4gICAgICAgIHRoaXMuX2RlZmF1bHRTZW5kZXIgPSBzZW5kZXI7XHJcbiAgICAgICAgdGhpcy5fZGVmYXVsdFJlY2VpdmVyID0gcmVjZWl2ZXI7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCB1cmkoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fdXJpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB0cnlHZXRLZXJuZWxCeVJlbW90ZVVyaShyZW1vdGVVcmk6IHN0cmluZyk6IEtlcm5lbCB8IHVuZGVmaW5lZCB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3JlbW90ZVVyaVRvS2VybmVsLmdldChyZW1vdGVVcmkpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB0cnlnZXRLZXJuZWxCeU9yaWdpblVyaShvcmlnaW5Vcmk6IHN0cmluZyk6IEtlcm5lbCB8IHVuZGVmaW5lZCB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3VyaVRvS2VybmVsLmdldChvcmlnaW5VcmkpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB0cnlHZXRLZXJuZWxJbmZvKGtlcm5lbDogS2VybmVsKTogY29udHJhY3RzLktlcm5lbEluZm8gfCB1bmRlZmluZWQge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9rZXJuZWxUb0tlcm5lbEluZm8uZ2V0KGtlcm5lbCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGFkZEtlcm5lbEluZm8oa2VybmVsOiBLZXJuZWwsIGtlcm5lbEluZm86IGNvbnRyYWN0cy5LZXJuZWxJbmZvKSB7XHJcblxyXG4gICAgICAgIGtlcm5lbEluZm8udXJpID0gYCR7dGhpcy5fdXJpfS8ke2tlcm5lbC5uYW1lfWA7Ly8/XHJcbiAgICAgICAgdGhpcy5fa2VybmVsVG9LZXJuZWxJbmZvLnNldChrZXJuZWwsIGtlcm5lbEluZm8pO1xyXG4gICAgICAgIHRoaXMuX3VyaVRvS2VybmVsLnNldChrZXJuZWxJbmZvLnVyaSwga2VybmVsKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0S2VybmVsKGtlcm5lbENvbW1hbmRFbnZlbG9wZTogY29udHJhY3RzLktlcm5lbENvbW1hbmRFbnZlbG9wZSk6IEtlcm5lbCB7XHJcblxyXG4gICAgICAgIGlmIChrZXJuZWxDb21tYW5kRW52ZWxvcGUuY29tbWFuZC5kZXN0aW5hdGlvblVyaSkge1xyXG4gICAgICAgICAgICBsZXQgZnJvbURlc3RpbmF0aW9uVXJpID0gdGhpcy5fdXJpVG9LZXJuZWwuZ2V0KGtlcm5lbENvbW1hbmRFbnZlbG9wZS5jb21tYW5kLmRlc3RpbmF0aW9uVXJpLnRvTG93ZXJDYXNlKCkpO1xyXG4gICAgICAgICAgICBpZiAoZnJvbURlc3RpbmF0aW9uVXJpKSB7XHJcbiAgICAgICAgICAgICAgICBMb2dnZXIuZGVmYXVsdC5pbmZvKGBLZXJuZWwgJHtmcm9tRGVzdGluYXRpb25VcmkubmFtZX0gZm91bmQgZm9yIGRlc3RpbmF0aW9uIHVyaSAke2tlcm5lbENvbW1hbmRFbnZlbG9wZS5jb21tYW5kLmRlc3RpbmF0aW9uVXJpfWApO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZyb21EZXN0aW5hdGlvblVyaTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnJvbURlc3RpbmF0aW9uVXJpID0gdGhpcy5fcmVtb3RlVXJpVG9LZXJuZWwuZ2V0KGtlcm5lbENvbW1hbmRFbnZlbG9wZS5jb21tYW5kLmRlc3RpbmF0aW9uVXJpLnRvTG93ZXJDYXNlKCkpO1xyXG4gICAgICAgICAgICBpZiAoZnJvbURlc3RpbmF0aW9uVXJpKSB7XHJcbiAgICAgICAgICAgICAgICBMb2dnZXIuZGVmYXVsdC5pbmZvKGBLZXJuZWwgJHtmcm9tRGVzdGluYXRpb25VcmkubmFtZX0gZm91bmQgZm9yIGRlc3RpbmF0aW9uIHVyaSAke2tlcm5lbENvbW1hbmRFbnZlbG9wZS5jb21tYW5kLmRlc3RpbmF0aW9uVXJpfWApO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZyb21EZXN0aW5hdGlvblVyaTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGtlcm5lbENvbW1hbmRFbnZlbG9wZS5jb21tYW5kLm9yaWdpblVyaSkge1xyXG4gICAgICAgICAgICBsZXQgZnJvbU9yaWdpblVyaSA9IHRoaXMuX3VyaVRvS2VybmVsLmdldChrZXJuZWxDb21tYW5kRW52ZWxvcGUuY29tbWFuZC5vcmlnaW5VcmkudG9Mb3dlckNhc2UoKSk7XHJcbiAgICAgICAgICAgIGlmIChmcm9tT3JpZ2luVXJpKSB7XHJcbiAgICAgICAgICAgICAgICBMb2dnZXIuZGVmYXVsdC5pbmZvKGBLZXJuZWwgJHtmcm9tT3JpZ2luVXJpLm5hbWV9IGZvdW5kIGZvciBvcmlnaW4gdXJpICR7a2VybmVsQ29tbWFuZEVudmVsb3BlLmNvbW1hbmQub3JpZ2luVXJpfWApO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZyb21PcmlnaW5Vcmk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIExvZ2dlci5kZWZhdWx0LmluZm8oYFVzaW5nIEtlcm5lbCAke3RoaXMuX2tlcm5lbC5uYW1lfWApO1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9rZXJuZWw7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBjb25uZWN0UHJveHlLZXJuZWxPbkRlZmF1bHRDb25uZWN0b3IobG9jYWxOYW1lOiBzdHJpbmcsIHJlbW90ZUtlcm5lbFVyaT86IHN0cmluZywgYWxpYXNlcz86IHN0cmluZ1tdKTogUHJveHlLZXJuZWwge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNvbm5lY3RQcm94eUtlcm5lbE9uQ29ubmVjdG9yKGxvY2FsTmFtZSwgdGhpcy5fZGVmYXVsdFNlbmRlciwgdGhpcy5fZGVmYXVsdFJlY2VpdmVyLCByZW1vdGVLZXJuZWxVcmksIGFsaWFzZXMpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBjb25uZWN0UHJveHlLZXJuZWxPbkNvbm5lY3Rvcihsb2NhbE5hbWU6IHN0cmluZywgc2VuZGVyOiBjb25uZWN0aW9uLklLZXJuZWxDb21tYW5kQW5kRXZlbnRTZW5kZXIsIHJlY2VpdmVyOiBjb25uZWN0aW9uLklLZXJuZWxDb21tYW5kQW5kRXZlbnRSZWNlaXZlciwgcmVtb3RlS2VybmVsVXJpPzogc3RyaW5nLCBhbGlhc2VzPzogc3RyaW5nW10pOiBQcm94eUtlcm5lbCB7XHJcbiAgICAgICAgbGV0IGtlcm5lbCA9IG5ldyBQcm94eUtlcm5lbChsb2NhbE5hbWUsIHNlbmRlciwgcmVjZWl2ZXIpO1xyXG4gICAgICAgIGtlcm5lbC5rZXJuZWxJbmZvLnJlbW90ZVVyaSA9IHJlbW90ZUtlcm5lbFVyaTtcclxuICAgICAgICB0aGlzLl9rZXJuZWwuYWRkKGtlcm5lbCwgYWxpYXNlcyk7XHJcbiAgICAgICAgcmV0dXJuIGtlcm5lbDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgY29ubmVjdCgpIHtcclxuICAgICAgICB0aGlzLl9rZXJuZWwuc3Vic2NyaWJlVG9LZXJuZWxFdmVudHMoZSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuX2RlZmF1bHRTZW5kZXIuc2VuZChlKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5fZGVmYXVsdFJlY2VpdmVyLnN1YnNjcmliZSh7XHJcbiAgICAgICAgICAgIG5leHQ6IChrZXJuZWxDb21tYW5kT3JFdmVudEVudmVsb3BlOiBjb25uZWN0aW9uLktlcm5lbENvbW1hbmRPckV2ZW50RW52ZWxvcGUpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChjb25uZWN0aW9uLmlzS2VybmVsQ29tbWFuZEVudmVsb3BlKGtlcm5lbENvbW1hbmRPckV2ZW50RW52ZWxvcGUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2NoZWR1bGVyLnJ1bkFzeW5jKGtlcm5lbENvbW1hbmRPckV2ZW50RW52ZWxvcGUsIGNvbW1hbmRFbnZlbG9wZSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGtlcm5lbCA9IHRoaXMuX2tlcm5lbDs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBrZXJuZWwuc2VuZChjb21tYW5kRW52ZWxvcGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuX2RlZmF1bHRTZW5kZXIuc2VuZCh7IGV2ZW50VHlwZTogY29udHJhY3RzLktlcm5lbFJlYWR5VHlwZSwgZXZlbnQ6IHt9IH0pO1xyXG5cclxuICAgICAgICB0aGlzLl9kZWZhdWx0U2VuZGVyLnNlbmQoeyBldmVudFR5cGU6IGNvbnRyYWN0cy5LZXJuZWxJbmZvUHJvZHVjZWRUeXBlLCBldmVudDogPGNvbnRyYWN0cy5LZXJuZWxJbmZvUHJvZHVjZWQ+eyBrZXJuZWxJbmZvOiB0aGlzLl9rZXJuZWwua2VybmVsSW5mbyB9IH0pO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBrZXJuZWwgb2YgdGhpcy5fa2VybmVsLmNoaWxkS2VybmVscykge1xyXG4gICAgICAgICAgICB0aGlzLl9kZWZhdWx0U2VuZGVyLnNlbmQoeyBldmVudFR5cGU6IGNvbnRyYWN0cy5LZXJuZWxJbmZvUHJvZHVjZWRUeXBlLCBldmVudDogPGNvbnRyYWN0cy5LZXJuZWxJbmZvUHJvZHVjZWQ+eyBrZXJuZWxJbmZvOiBrZXJuZWwua2VybmVsSW5mbyB9IH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcbn1cclxuIiwiLy8gQ29weXJpZ2h0IChjKSAuTkVUIEZvdW5kYXRpb24gYW5kIGNvbnRyaWJ1dG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLiBTZWUgTElDRU5TRSBmaWxlIGluIHRoZSBwcm9qZWN0IHJvb3QgZm9yIGZ1bGwgbGljZW5zZSBpbmZvcm1hdGlvbi5cclxuXHJcbmltcG9ydCB7IENvbXBvc2l0ZUtlcm5lbCB9IGZyb20gXCIuLi9jb21wb3NpdGVLZXJuZWxcIjtcclxuaW1wb3J0IHsgSmF2YXNjcmlwdEtlcm5lbCB9IGZyb20gXCIuLi9qYXZhc2NyaXB0S2VybmVsXCI7XHJcbmltcG9ydCB7IEtlcm5lbCB9IGZyb20gXCIuLi9rZXJuZWxcIjtcclxuaW1wb3J0IHsgTG9nRW50cnksIExvZ2dlciB9IGZyb20gXCIuLi9sb2dnZXJcIjtcclxuaW1wb3J0IHsgS2VybmVsSG9zdCB9IGZyb20gXCIuLi9rZXJuZWxIb3N0XCI7XHJcbmltcG9ydCAqIGFzIHJ4anMgZnJvbSBcInJ4anNcIjtcclxuaW1wb3J0ICogYXMgY29ubmVjdGlvbiBmcm9tIFwiLi4vY29ubmVjdGlvblwiO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUhvc3QoXHJcbiAgICBnbG9iYWw6IGFueSxcclxuICAgIGNvbXBvc2l0ZUtlcm5lbE5hbWU6IHN0cmluZyxcclxuICAgIGNvbmZpZ3VyZVJlcXVpcmU6IChpbnRlcmFjdGl2ZTogYW55KSA9PiB2b2lkLFxyXG4gICAgbG9nTWVzc2FnZTogKGVudHJ5OiBMb2dFbnRyeSkgPT4gdm9pZCxcclxuICAgIGxvY2FsVG9SZW1vdGU6IHJ4anMuT2JzZXJ2ZXI8Y29ubmVjdGlvbi5LZXJuZWxDb21tYW5kT3JFdmVudEVudmVsb3BlPixcclxuICAgIHJlbW90ZVRvTG9jYWw6IHJ4anMuT2JzZXJ2YWJsZTxjb25uZWN0aW9uLktlcm5lbENvbW1hbmRPckV2ZW50RW52ZWxvcGU+LFxyXG4gICAgb25SZWFkeTogKCkgPT4gdm9pZCkge1xyXG4gICAgTG9nZ2VyLmNvbmZpZ3VyZShjb21wb3NpdGVLZXJuZWxOYW1lLCBsb2dNZXNzYWdlKTtcclxuXHJcbiAgICBnbG9iYWwuaW50ZXJhY3RpdmUgPSB7fTtcclxuICAgIGNvbmZpZ3VyZVJlcXVpcmUoZ2xvYmFsLmludGVyYWN0aXZlKTtcclxuXHJcbiAgICBnbG9iYWwua2VybmVsID0ge1xyXG4gICAgICAgIGdldCByb290KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gS2VybmVsLnJvb3Q7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCBjb21wb3NpdGVLZXJuZWwgPSBuZXcgQ29tcG9zaXRlS2VybmVsKGNvbXBvc2l0ZUtlcm5lbE5hbWUpO1xyXG4gICAgY29uc3Qga2VybmVsSG9zdCA9IG5ldyBLZXJuZWxIb3N0KGNvbXBvc2l0ZUtlcm5lbCwgY29ubmVjdGlvbi5LZXJuZWxDb21tYW5kQW5kRXZlbnRTZW5kZXIuRnJvbU9ic2VydmVyKGxvY2FsVG9SZW1vdGUpLCBjb25uZWN0aW9uLktlcm5lbENvbW1hbmRBbmRFdmVudFJlY2VpdmVyLkZyb21PYnNlcnZhYmxlKHJlbW90ZVRvTG9jYWwpLCBga2VybmVsOi8vJHtjb21wb3NpdGVLZXJuZWxOYW1lfWApO1xyXG5cclxuICAgIGNvbnN0IGpzS2VybmVsID0gbmV3IEphdmFzY3JpcHRLZXJuZWwoKTtcclxuICAgIGNvbXBvc2l0ZUtlcm5lbC5hZGQoanNLZXJuZWwsIFtcImpzXCJdKTtcclxuXHJcbiAgICBnbG9iYWxbY29tcG9zaXRlS2VybmVsTmFtZV0gPSB7XHJcbiAgICAgICAgY29tcG9zaXRlS2VybmVsLFxyXG4gICAgICAgIGtlcm5lbEhvc3QsXHJcbiAgICB9O1xyXG5cclxuICAgIGtlcm5lbEhvc3QuY29ubmVjdCgpO1xyXG5cclxuICAgIG9uUmVhZHkoKTtcclxufVxyXG4iLCIvLyBDb3B5cmlnaHQgKGMpIC5ORVQgRm91bmRhdGlvbiBhbmQgY29udHJpYnV0b3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuIFNlZSBMSUNFTlNFIGZpbGUgaW4gdGhlIHByb2plY3Qgcm9vdCBmb3IgZnVsbCBsaWNlbnNlIGluZm9ybWF0aW9uLlxyXG5cclxuaW1wb3J0ICogYXMgZnJvbnRFbmRIb3N0IGZyb20gJy4vZnJvbnRFbmRIb3N0JztcclxuaW1wb3J0ICogYXMgcnhqcyBmcm9tIFwicnhqc1wiO1xyXG5pbXBvcnQgKiBhcyBjb25uZWN0aW9uIGZyb20gXCIuLi9jb25uZWN0aW9uXCI7XHJcbmltcG9ydCB7IExvZ2dlciB9IGZyb20gXCIuLi9sb2dnZXJcIjtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjb25maWd1cmUoZ2xvYmFsPzogYW55KSB7XHJcbiAgICBpZiAoIWdsb2JhbCkge1xyXG4gICAgICAgIGdsb2JhbCA9IHdpbmRvdztcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCByZW1vdGVUb0xvY2FsID0gbmV3IHJ4anMuU3ViamVjdDxjb25uZWN0aW9uLktlcm5lbENvbW1hbmRPckV2ZW50RW52ZWxvcGU+KCk7XHJcbiAgICBjb25zdCBsb2NhbFRvUmVtb3RlID0gbmV3IHJ4anMuU3ViamVjdDxjb25uZWN0aW9uLktlcm5lbENvbW1hbmRPckV2ZW50RW52ZWxvcGU+KCk7XHJcblxyXG4gICAgbG9jYWxUb1JlbW90ZS5zdWJzY3JpYmUoe1xyXG4gICAgICAgIG5leHQ6IGVudmVsb3BlID0+IHtcclxuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgICAgICBwb3N0S2VybmVsTWVzc2FnZSh7IGVudmVsb3BlIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEB0cy1pZ25vcmVcclxuICAgIG9uRGlkUmVjZWl2ZUtlcm5lbE1lc3NhZ2UoKGFyZzogYW55KSA9PiB7XHJcbiAgICAgICAgaWYgKGFyZy5lbnZlbG9wZSkge1xyXG4gICAgICAgICAgICBjb25zdCBlbnZlbG9wZSA9IDxjb25uZWN0aW9uLktlcm5lbENvbW1hbmRPckV2ZW50RW52ZWxvcGU+PGFueT4oYXJnLmVudmVsb3BlKTtcclxuICAgICAgICAgICAgaWYgKGNvbm5lY3Rpb24uaXNLZXJuZWxFdmVudEVudmVsb3BlKGVudmVsb3BlKSkge1xyXG4gICAgICAgICAgICAgICAgTG9nZ2VyLmRlZmF1bHQuaW5mbyhgY2hhbm5lbCBnb3QgJHtlbnZlbG9wZS5ldmVudFR5cGV9IHdpdGggdG9rZW4gJHtlbnZlbG9wZS5jb21tYW5kPy50b2tlbn0gYW5kIGlkICR7ZW52ZWxvcGUuY29tbWFuZD8uaWR9YCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJlbW90ZVRvTG9jYWwubmV4dChlbnZlbG9wZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgZnJvbnRFbmRIb3N0LmNyZWF0ZUhvc3QoXHJcbiAgICAgICAgZ2xvYmFsLFxyXG4gICAgICAgICd3ZWJ2aWV3JyxcclxuICAgICAgICBjb25maWd1cmVSZXF1aXJlLFxyXG4gICAgICAgIGVudHJ5ID0+IHtcclxuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgICAgICBwb3N0S2VybmVsTWVzc2FnZSh7IGxvZ0VudHJ5OiBlbnRyeSB9KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGxvY2FsVG9SZW1vdGUsXHJcbiAgICAgICAgcmVtb3RlVG9Mb2NhbCxcclxuICAgICAgICAoKSA9PiB7XHJcbiAgICAgICAgICAgIGdsb2JhbC53ZWJ2aWV3Lmtlcm5lbEhvc3QuY29ubmVjdFByb3h5S2VybmVsT25EZWZhdWx0Q29ubmVjdG9yKCdjc2hhcnAnLCB1bmRlZmluZWQsIFsnYyMnLCAnQyMnXSk7XHJcbiAgICAgICAgICAgIGdsb2JhbC53ZWJ2aWV3Lmtlcm5lbEhvc3QuY29ubmVjdFByb3h5S2VybmVsT25EZWZhdWx0Q29ubmVjdG9yKCdmc2hhcnAnLCB1bmRlZmluZWQsIFsnZnMnLCAnRiMnXSk7XHJcbiAgICAgICAgICAgIGdsb2JhbC53ZWJ2aWV3Lmtlcm5lbEhvc3QuY29ubmVjdFByb3h5S2VybmVsT25EZWZhdWx0Q29ubmVjdG9yKCdwd3NoJywgdW5kZWZpbmVkLCBbJ3Bvd2Vyc2hlbGwnXSk7XHJcbiAgICAgICAgICAgIGdsb2JhbC53ZWJ2aWV3Lmtlcm5lbEhvc3QuY29ubmVjdFByb3h5S2VybmVsT25EZWZhdWx0Q29ubmVjdG9yKCdtZXJtYWlkJywgdW5kZWZpbmVkLCBbXSk7XHJcbiAgICAgICAgICAgIGdsb2JhbC53ZWJ2aWV3Lmtlcm5lbEhvc3QuY29ubmVjdFByb3h5S2VybmVsT25EZWZhdWx0Q29ubmVjdG9yKCd2c2NvZGUnLCBcImtlcm5lbDovL3ZzY29kZS92c2NvZGVcIik7XHJcblxyXG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgICAgIHBvc3RLZXJuZWxNZXNzYWdlKHsgcHJlbG9hZENvbW1hbmQ6ICcjIWNvbm5lY3QnIH0pO1xyXG4gICAgICAgIH1cclxuICAgICk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNvbmZpZ3VyZVJlcXVpcmUoaW50ZXJhY3RpdmU6IGFueSkge1xyXG4gICAgaWYgKCh0eXBlb2YgKHJlcXVpcmUpICE9PSB0eXBlb2YgKEZ1bmN0aW9uKSkgfHwgKHR5cGVvZiAoKDxhbnk+cmVxdWlyZSkuY29uZmlnKSAhPT0gdHlwZW9mIChGdW5jdGlvbikpKSB7XHJcbiAgICAgICAgbGV0IHJlcXVpcmVfc2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XHJcbiAgICAgICAgcmVxdWlyZV9zY3JpcHQuc2V0QXR0cmlidXRlKCdzcmMnLCAnaHR0cHM6Ly9jZG5qcy5jbG91ZGZsYXJlLmNvbS9hamF4L2xpYnMvcmVxdWlyZS5qcy8yLjMuNi9yZXF1aXJlLm1pbi5qcycpO1xyXG4gICAgICAgIHJlcXVpcmVfc2NyaXB0LnNldEF0dHJpYnV0ZSgndHlwZScsICd0ZXh0L2phdmFzY3JpcHQnKTtcclxuICAgICAgICByZXF1aXJlX3NjcmlwdC5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGludGVyYWN0aXZlLmNvbmZpZ3VyZVJlcXVpcmUgPSAoY29uZmluZzogYW55KSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gKDxhbnk+cmVxdWlyZSkuY29uZmlnKGNvbmZpbmcpIHx8IHJlcXVpcmU7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgIH07XHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXS5hcHBlbmRDaGlsZChyZXF1aXJlX3NjcmlwdCk7XHJcblxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBpbnRlcmFjdGl2ZS5jb25maWd1cmVSZXF1aXJlID0gKGNvbmZpbmc6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gKDxhbnk+cmVxdWlyZSkuY29uZmlnKGNvbmZpbmcpIHx8IHJlcXVpcmU7XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufVxyXG5cclxuY29uZmlndXJlKHdpbmRvdyk7XHJcbiJdLCJuYW1lcyI6WyJTeW1ib2xfb2JzZXJ2YWJsZSIsInJ4anMuU3ViamVjdCIsImNvbnRyYWN0cy5Db21tYW5kU3VjY2VlZGVkVHlwZSIsImNvbnRyYWN0cy5Db21tYW5kRmFpbGVkVHlwZSIsImNvbnRyYWN0cy5SZXF1ZXN0S2VybmVsSW5mb1R5cGUiLCJjb250cmFjdHMuS2VybmVsSW5mb1Byb2R1Y2VkVHlwZSIsInJ4anMubWFwIiwiY29udHJhY3RzLkRpc3BsYXllZFZhbHVlUHJvZHVjZWRUeXBlIiwiY29udHJhY3RzLlN1Ym1pdENvZGVUeXBlIiwiY29udHJhY3RzLlJlcXVlc3RWYWx1ZUluZm9zVHlwZSIsImNvbnRyYWN0cy5SZXF1ZXN0VmFsdWVUeXBlIiwiY29udHJhY3RzLkNvZGVTdWJtaXNzaW9uUmVjZWl2ZWRUeXBlIiwiY29udHJhY3RzLlJldHVyblZhbHVlUHJvZHVjZWRUeXBlIiwiY29udHJhY3RzLlZhbHVlSW5mb3NQcm9kdWNlZFR5cGUiLCJjb250cmFjdHMuVmFsdWVQcm9kdWNlZFR5cGUiLCJjb25uZWN0aW9uLnRyeUFkZFVyaVRvUm91dGluZ1NsaXAiLCJjb25uZWN0aW9uLmlzS2VybmVsRXZlbnRFbnZlbG9wZSIsImNvbm5lY3Rpb24uaXNLZXJuZWxDb21tYW5kRW52ZWxvcGUiLCJjb250cmFjdHMuS2VybmVsUmVhZHlUeXBlIiwiY29ubmVjdGlvbi5LZXJuZWxDb21tYW5kQW5kRXZlbnRTZW5kZXIiLCJjb25uZWN0aW9uLktlcm5lbENvbW1hbmRBbmRFdmVudFJlY2VpdmVyIiwiZnJvbnRFbmRIb3N0LmNyZWF0ZUhvc3QiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7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
