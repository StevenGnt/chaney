'use strict';

var gulp = require('gulp'),
	wiredep = require('wiredep').stream,
	config = require('./config.json');

gulp.task('wiredep', function() {
	// Wiredep
	return gulp.src(config.app.wiredep.html)
		.pipe(wiredep(config.app.wiredep.options))
		.pipe(gulp.dest(config.app.wiredep.dest));
});