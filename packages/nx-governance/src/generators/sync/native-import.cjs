// Nx 22's source SWC loader rewrites TypeScript import() to require().
/* global module */
// SWC also transforms .cjs files. This constant function body preserves Node's
// native import; the caller passes a URL as data and validates the module/output.
module.exports = new Function('url', 'return import(url)');
