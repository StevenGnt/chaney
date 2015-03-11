'use strict';

var gulp = require('gulp'),
	config = require('./config.json');

gulp.task('watch', function() {
	// Watch LESS files, trigger compilation
	gulp.watch(config.app.less.input + '/*.less', ['less']);
});