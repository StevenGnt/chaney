'use strict';

var gulp = require('gulp'),
	config = require('./config.json');

gulp.task('watch', function() {
	// Watch LESS files, trigger compilation
	return gulp.watch(config.app.less.watch, ['less:compile']);
});