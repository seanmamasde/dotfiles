"use strict";
// mimic 'await-notify', but typed:
Object.defineProperty(exports, "__esModule", { value: true });
exports.Subject = void 0;
class Subject {
    constructor() {
        this.waiters = [];
    }
    notify() {
        for (const waiter of this.waiters) {
            waiter.resolve(true);
        }
    }
    wait(timeout) {
        return new Promise((resolve) => {
            this.waiters.push(new Waiter(resolve, timeout));
        });
    }
}
exports.Subject = Subject;
class Waiter {
    constructor(resolveFunc, timeout) {
        this.resolveFunc = resolveFunc;
        this.resolved = false;
        this.timeout = setTimeout(() => this.resolve(false), timeout);
    }
    resolve(ret) {
        if (!this.resolved) {
            clearTimeout(this.timeout);
            this.resolveFunc(ret);
            this.resolved = true;
        }
    }
}
//# sourceMappingURL=subject.js.map