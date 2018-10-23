module.exports = function(config) {
	config.set({
		basePath: './',
		browsers: ['FirefoxHeadless'],
		// browsers: ['Firefox'],
		frameworks: ['jasmine'],
		files: [
			{pattern: './node_modules/davclient.js/lib/client.js', type: 'js'},
			{pattern: 'src/**/*.js', type: 'module'},
			{pattern: 'test/unit/**/*.js', type: 'module'},
		],
		preprocessors: { 'js/**/*.js': ['coverage'] },
		reporters: ['mocha', 'coverage'],
		port: 9876,  // karma web server port
		colors: true,
		logLevel: config.LOG_INFO,
		autoWatch: false,
		singleRun: true,
		concurrency: Infinity,
		coverageReporter: {
			type: 'lcov',
			dir: 'coverage/'
		},
		plugins: [
			'karma-jasmine',
			'karma-coverage',
			'karma-firefox-launcher',
			'karma-mocha-reporter'
		]
	});
};
