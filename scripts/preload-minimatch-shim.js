// Ensure CommonJS consumers get a function when requiring `minimatch` v10+ ESM package
(function() {
    const resolved = require.resolve('minimatch');
    const mm = require('minimatch');
    if (typeof mm !== 'function') {
      const fn = mm && (mm.default || mm.minimatch);
      if (typeof fn === 'function') {
        const cache = require.cache[resolved];
        if (cache) {
          cache.exports = fn;
        } else {
          require.cache[resolved] = {
            id: resolved,
            filename: resolved,
            loaded: true,
            exports: fn
          };
        }
      }
    }
})();
