// Runtime helper to run the TS regeneration script with custom ts-node options.
require('ts-node').register({
  transpileOnly: true,
  compilerOptions: {
    module: 'CommonJS',
    moduleResolution: 'node',
    jsx: 'react-jsx'
  }
});

require('./regenerate-dec-2025-invoices.ts');
