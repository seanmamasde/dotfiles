# impor

Very lazy import to speed up VS Code extensions.

This work is based on [import-lazy](https://github.com/sindresorhus/import-lazy).

```typescript
const impor = require('impor')(__dirname);
// const os = impor<typeof import('os')>('os');
const os = impor('os') as typeof import('os');
const arch = os.arch(); // <- start to import os module
console.log(arch);
```