/**
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

module.exports = function(config) {
	config.set({
		basePath: './',
		browsers: ['FirefoxHeadless'],
		frameworks: ['jasmine', 'webpack'],
		files: [
			// set watched=false as we use webpacks watcher
			{ pattern: 'src/**/*.js', type: 'module', watched: false },
			{ pattern: 'test/unit/**/*.js', type: 'module', watched: false }
		],
		preprocessors: {
			'js/**/*.js': ['coverage'],
			'src/**/*.js': ['webpack'],
			'test/**/*.js': ['webpack']
		},
		webpack: {},
		reporters: ['mocha', 'coverage'],
		port: 9876, // karma web server port
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
			'karma-mocha-reporter',
			'karma-webpack'
		]
	});
};
