const assert = require('assert');
//const { assert } = require('assert');
// You can const and use all API from the 'vscode' module
// as well as const your extension to test it
//const vscode = require('vscode');
const vscode = require("vscode");
// const myExtension = require('../extension');

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Sample test', () => {
		assert.strictEqual(-1, [1, 2, 3].indexOf(5));
		assert.strictEqual(-1, [1, 2, 3].indexOf(0));
	});
});
