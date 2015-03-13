'use strict';

var gulp = require('gulp');

// Load every task
require('require-dir')('./tasks');

// Default runned tasks
var defaultTasks = [
	'watch',
	'less:compile',
	'wiredep',
	'server',
	'livereload'
];

gulp.task('default', defaultTasks, function() {});