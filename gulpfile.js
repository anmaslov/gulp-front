'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();

var browserSync = require('browser-sync').create();
var buffer = require('vinyl-buffer');
var del = require('del');
var imageminPngquant = require('imagemin-pngquant');
var imageminJpegRecompress = require('imagemin-jpeg-recompress');
var path = require('path');
var posthtmlAttrsSorter = require('posthtml-attrs-sorter');
var runSequence = require('run-sequence');
var rupture = require('rupture');
var spritesmith = require('gulp.spritesmith');
var autoprefixer = require('autoprefixer');
var postcssSorting = require('postcss-sorting');
var perfectionist = require('perfectionist');
var postcssSortingConfig = getJsonData('.postcss-sorting.json');
var webpackStream = require('webpack-stream');
var webpack = require('webpack');
var parseArgs = require('minimist');
var process = require('process');

var env = parseArgs(process.argv.slice(2));
var nodeEnv = (env.production || env.prod) ? 'production' : 'development';
var isProd = nodeEnv === 'production';


// Read json and return object
function getJsonData(file) {
	var fs = require('fs');

	return JSON.parse(
			fs.readFileSync(
				path.join(__dirname, file),
				'utf8'
			)
		);
}

// Error handler for gulp-plumber
function errorHandler(error) {
	var colors = require('colors');
	var notifier = require('node-notifier');
	var date = new Date();

	var now = date.toTimeString().split(' ')[ 0 ];

	var title = error.name + ' in ' + error.plugin;

	var shortMessage = error.message.split('\n')[ 0 ];

	var message = '[' + colors.grey(now) + '] ' +
		[ title.bold.red, '', error.message, '' ].join('\n');

	// Print message to console
	console.log(message);

	notifier.notify({
		title: title,
		message: shortMessage,
		icon: path.join(__dirname, 'tools/icons/error.svg')
	});


	this.emit('end');
}

function correctNumber(number) {
	return number < 10 ? '0' + number : number;
}

// Return timestamp
function getDateTime() {
	var now = new Date();
	var year = now.getFullYear();
	var month = correctNumber(now.getMonth() + 1);
	var day = correctNumber(now.getDate());
	var hours = correctNumber(now.getHours());
	var minutes = correctNumber(now.getMinutes());
	return year + '-' + month + '-' + day + '-' + hours + minutes;
}

// https://github.com/stylus/stylus/issues/1872#issuecomment-86553717
function stylusFileExists() {
	return function(style) {
		style.define('file-exists', function(path) {
			return !!$.stylus.stylus.utils.lookup(path.string, this.paths);
		});
	};
}

// Plugins options
var options = {
	del: [
		'dest',
		'tmp'
	],

	plumber: {
		errorHandler: errorHandler
	},

	browserSync: {
		server: './dest',
		notify: false,
		reloadOnRestart: true,
		snippetOptions: {
			rule: {
				match: /<\/body>/i
			}
		}
	},

	stylus: {
		use: [
			rupture(),
			stylusFileExists()
		],
		'include css': true
	},

	include: {
		hardFail: true,
		includePaths: [
			__dirname + '/',
			__dirname + '/node_modules',
			__dirname + '/source/static/scripts/plugins'
		]
	},

	pug: {
		pretty: '\t'
	},

	htmlPrettify: {
		'unformatted': [ 'pre', 'code', 'textarea' ],
		'indent_with_tabs': true,
		'preserve_newlines': true,
		'brace_style': 'expand',
		'end_with_newline': true
	},

	svgSymbols: {
		title: false,
		id: '%f',
		className: '%f',
		svgClassname: 'icons-sprite',
		templates: [
			path.join(__dirname, 'source/static/styles/templates/icons-template.styl'),
			path.join(__dirname, 'source/static/styles/templates/icons-template.svg')
		]
	},

	spritesmith: {
		retinaSrcFilter: '**/*@2x.png',
		imgName: 'sprite.png',
		retinaImgName: 'sprite@2x.png',
		cssName: 'sprite.styl',
		algorithm: 'binary-tree',
		padding: 8,
		cssTemplate: path.join(__dirname, 'source/static/styles/templates/sprite-template.mustache')
	},

	imagemin: {
		images: [
			$.imagemin.gifsicle({
				interlaced: true,
				optimizationLevel: 3
			}),
			imageminJpegRecompress({
				progressive: true,
				max: 80,
				min: 70
			}),
			imageminPngquant({ quality: '75-85' }),
			$.imagemin.svgo({
				plugins: [
					{ removeViewBox: false }
				]
			})
		],

		icons: [
			$.imagemin.svgo({
				plugins: [
					{ removeTitle: true },
					{ removeStyleElement: true },
					{ removeAttrs: { attrs: [ 'id', 'class', 'data-name', 'fill', 'fill-rule' ] } },
					{ removeEmptyContainers: true },
					{ sortAttrs: true },
					{ removeUselessDefs: true },
					{ removeEmptyText: true },
					{ removeEditorsNSData: true },
					{ removeEmptyAttrs: true },
					{ removeHiddenElems: true },
					{ transformsWithOnePath: true }
				]
			})
		]
	},

	posthtml: {
		plugins: [
			posthtmlAttrsSorter({
				order: [
					'class',
					'id',
					'name',
					'data',
					'ng',
					'src',
					'for',
					'type',
					'href',
					'values',
					'title',
					'alt',
					'role',
					'aria'
				]
			})
		],
		options: {}
	},

	postcss: [
		autoprefixer({
			cascade: false
		}),
		perfectionist({
			cascade: false,
			colorCase: 'lower',
			colorShorthand: true,
			format: 'expanded',
			indentChar: '\t',
			indentSize: 1,
			trimLeadingZero: false,
			trimTrailingZeros: true,
			zeroLengthNoUnit: true
		}),
		postcssSorting(postcssSortingConfig)
	]
};


var getWebpackConfig = function() {

	var plugins = [
		new webpack.optimize.CommonsChunkPlugin({
			name: 'vendor',
			minChunks: Infinity,
			filename: 'vendor.js'
		}),
		new webpack.EnvironmentPlugin({
			NODE_ENV: nodeEnv
		}),
		new webpack.NamedModulesPlugin(),
		new webpack.ProvidePlugin({
			$: 'jquery',
			jQuery: 'jquery',
			'window.jQuery': 'jquery'
		})
	];

	if (isProd) {
		plugins.push(
			new webpack.LoaderOptionsPlugin({
				minimize: true,
				debug: false
			}),
			new webpack.optimize.UglifyJsPlugin({
				compress: {
					warnings: false,
					screw_ie8: true,
					conditionals: true,
					unused: true,
					comparisons: true,
					sequences: true,
					dead_code: true,
					evaluate: true,
					if_return: true,
					join_vars: true
				},
				output: {
					comments: false
				}
			})
		);
	}
	else {
		plugins.push(
			new webpack.HotModuleReplacementPlugin()
		);
	}


	return {
		devtool: isProd ? 'source-map' : 'eval',
		entry: {
			vendor: [
				'babel-polyfill',
				__dirname + '/source/static/scripts/vendor.js'
			],
			main: __dirname + '/source/static/scripts/main.js'
		},
		output: {
			filename: '[name].js',
			path: __dirname + '/dest/assets/scripts'
		},
		module: {
			rules: [
				{
					test: /\.js$/,
					exclude: /(node_modules|bower_components)/,
					use: [ 'babel-loader' ]
				}
			]
		},
		plugins: plugins
	};

};

gulp.task('cleanup', function(cb) {
	return del(options.del, cb);
});

gulp.task('serve', function() {
	return browserSync.init(options.browserSync);
});

gulp.task('build:css', function() {
	return gulp.src([ '*.styl', '!_*.styl' ], { cwd: 'source/static/styles' })
		.pipe($.plumber(options.plumber))
		.pipe($.stylus(options.stylus))
		.pipe($.combineMq({ beautify: true }))
		.pipe($.postcss(options.postcss))
		.pipe(gulp.dest('dest/assets/stylesheets'))
		.pipe(browserSync.reload({
			stream: true,
			match: '**/*.css'
		}));
});

gulp.task('build:data', function() {
	return gulp.src([ '**/*.yml', '!**/_*.yml' ], { cwd: 'source/modules/*/data' })
		.pipe($.plumber(options.plumber))
		.pipe($.yaml({ space: '\t' }))
		.pipe($.mergeJson({ fileName: 'data.json' }))
		.pipe(gulp.dest('tmp'));
});

gulp.task('build:pages', function() {
	var jsonData = getJsonData('./tmp/data.json');

	options.pug.locals = jsonData;

	return gulp.src([ '**/*.pug', '!**/_*.pug' ], { cwd: 'source/pages' })
		.pipe($.plumber(options.plumber))
		.pipe($.pug(options.pug))
		.pipe($.posthtml(options.posthtml.plugins, options.posthtml.options))
		.pipe($.prettify(options.htmlPrettify))
		.pipe(gulp.dest('dest'));
});

gulp.task('modules:assets', function() {
	return gulp.src('**/*.{jpg,gif,svg,png}', { cwd: 'source/modules/*/assets' })
		.pipe($.plumber(options.plumber))
		.pipe($.changed('dest/assets/images'))
		.pipe($.imagemin(options.imagemin.images))
		.pipe($.flatten())
		.pipe(gulp.dest('dest/assets/images'));
});

gulp.task('build:assets', function() {
	var imageFilter = $.filter('**/*.{jpg,gif,svg,png}', { restore: true });

	return gulp.src([ '**/*.*', '!**/_*.*' ], { cwd: 'source/static/assets' })
		.pipe($.plumber(options.plumber))
		.pipe($.changed('dest/assets'))

		// Minify images
		.pipe(imageFilter)
		.pipe($.changed('dest/assets'))
		.pipe($.imagemin(options.imagemin.images))
		.pipe(imageFilter.restore)

		// Copy other files
		.pipe(gulp.dest('dest/assets'));
});

gulp.task('build:scripts', function() {
	return gulp.src([ '*.js', '!_*.js' ], { cwd: 'source/static/scripts' })
		.pipe($.plumber(options.plumber))
		.pipe(webpackStream(getWebpackConfig(), webpack))
		.pipe(gulp.dest('dest/assets/javascripts'));
});

gulp.task('build:icons', function() {
	return gulp.src([ '**/*.svg', '!**/_*.svg' ], { cwd: 'source/static/icons' })
		.pipe($.plumber(options.plumber))
		.pipe($.imagemin(options.imagemin.icons))
		.pipe($.svgSymbols(options.svgSymbols))
		.pipe($.if(/\.styl$/, gulp.dest('tmp')))
		.pipe($.if(/\.svg$/, $.rename('icons.svg')))
		.pipe($.if(/\.svg$/, gulp.dest('dest/assets/images')));
});

gulp.task('build:sprite', function() {
	var spriteData = gulp.src([ '**/*.png', '!**/_*.png' ], { cwd: 'source/static/sprite' })
		.pipe(spritesmith(options.spritesmith));

	spriteData.img.pipe(buffer())
		.pipe($.imagemin(options.imagemin.images))
		.pipe(gulp.dest('dest/assets/images'));

	spriteData.css.pipe(buffer())
		.pipe(gulp.dest('tmp'));

	return spriteData.img.pipe(buffer());
});

// Semver
gulp.task('semver:patch', function() {
	return gulp.src('package.json')
		.pipe($.bump())
		.pipe(gulp.dest('./'));
});

gulp.task('semver:minor', function() {
	return gulp.src('package.json')
		.pipe($.bump({ type: 'minor' }))
		.pipe(gulp.dest('./'));
});

gulp.task('semver:major', function() {
	return gulp.src('package.json')
		.pipe($.bump({ type: 'major' }))
		.pipe(gulp.dest('./'));
});

gulp.task('semver:reset', function() {
	return gulp.src('package.json')
		.pipe($.bump({ version: '0.1.0' }))
		.pipe(gulp.dest('./'));
});

gulp.task('build:zip', function() {
	var datetime = '-' + getDateTime();
	var zipName = 'dist' + datetime + '.zip';

	return gulp.src('dest/**/*')
		.pipe($.zip(zipName))
		.pipe(gulp.dest('zip'));
});

gulp.task('deploy:publish', function() {
	return gulp.src('**/*', { cwd: 'dest' })
		.pipe($.ghPages({ branch: 'build' }));
});

// Service tasks
gulp.task('build:html', function(cb) {
	return runSequence(
		'build:data',
		'build:pages',
		cb
	);
});

// Main tasks
gulp.task('build', function(cb) {
	return runSequence(
		'cleanup',
		[
			'build:html',
			'build:icons',
			'build:sprite',
			'modules:assets',
			'build:assets',
			'build:scripts'
		],
		'build:css',
		cb
	);
});

gulp.task('zip', function(cb) {
	return runSequence(
		'build',
		'build:zip',
		cb
	);
});

gulp.task('deploy', function(cb) {
	return runSequence(
		'build',
		'deploy:publish',
		cb
	);
});

gulp.task('dev', function(cb) {
	return runSequence(
		'build',
		[
			'serve',
			'watch'
		],
		cb
	);
});

gulp.task('watch', function() {

	// Modules, pages
	$.watch('source/**/*.pug', function() {
		return runSequence('build:pages', browserSync.reload);
	});

	// Modules data
	$.watch([ 'source/modules/*/data/*.yml' ], function() {
		return runSequence('build:html', browserSync.reload);
	});

	// Static styles
	$.watch('source/static/styles/**/*.styl', function() {
		return gulp.start('build:css');
	});

	// Modules styles
	$.watch('source/modules/**/*.styl', function() {
		return gulp.start('build:css');
	});

	// Static scripts
	$.watch('source/static/scripts/**/*.js', function() {
		return runSequence('build:scripts', browserSync.reload);
	});

	// Modules scripts
	$.watch('source/modules/*/*.js', function() {
		return runSequence('build:scripts', browserSync.reload);
	});

	// Modules images
	$.watch('source/modules/*/assets/**/*.{jpg,gif,svg,png}', function() {
		return runSequence('modules:assets', browserSync.reload);
	});

	// Static files
	$.watch('source/static/assets/**/*', function() {
		return runSequence('build:assets', browserSync.reload);
	});

	// Svg icons
	$.watch('source/static/icons/**/*.svg', function() {
		return runSequence('build:icons', 'build:css', browserSync.reload);
	});

	// Png sprites
	$.watch('source/static/sprite/**/*.png', function() {
		return runSequence('build:sprite', browserSync.reload);
	});
});

gulp.task('default', function() {
	gulp.start('build');
});
