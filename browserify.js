var browserify = require('browserify')
var babelify = require('babelify')
var watchify = require('watchify')
var fs = require('fs')

function defineBundle (srcPath, destPath, debug) {
	var b = browserify({
		entries: [srcPath],
		transform: [ 
			[babelify,
				{
					"presets": [
						"es2015"
					],
					"plugins": [
						'transform-object-assign',
						'transform-class-properties'
					]
				}
			]
		],
		debug: debug, // gen sourcemap
		cache: {},
		packageCache: {}
	});

	b.plugin(watchify)
	b.plugin(bundle, { 
		delay: 0 
	});
	b.on('update', bundle) // on any dep update, runs the bundler
	b.on('log', console.log)

	function bundle() {
		var writeFile = fs.createWriteStream(destPath)

		writeFile.on('error', console.log)

		writeFile.on('open', function(){
			b.bundle()
				.on('error', function(err){
					console.log(err.message)
					this.emit('end')
				})
				.pipe(writeFile)
		})
	}
}

defineBundle('./src/main.js','./dist/main.js',false)
defineBundle('./test/dev.js','./test/dev.min.js',true)
