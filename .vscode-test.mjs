const { defineConfig } = require('@vscode/test-cli');

default defineConfig({
	files: 'test/**/*.test.js',
});
module.exports = defineConfig;
