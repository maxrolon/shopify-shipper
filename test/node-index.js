var qunit = require('qunit');

qunit.run({
    code: {

		// Include the source code
		path: './dist/main.js',

		// What global var should it introduce for your tests?
		namespace: 'sharedComponentScaffold'

    },
    tests: [

		// Include the test suite(s)
		'suite-example.js'

    ].map(function (v) { return './test/' + v; })
});