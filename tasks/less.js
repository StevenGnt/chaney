'use strict';

var gulp = require('gulp'),
	less = require('gulp-less'),
	connect = require('gulp-connect'),
	config = require('./config.json');

gulp.task('less', function() {
	// Compile LESS files
	gulp.src(config.app.less.input)
		.pipe(less())
		.pipe(gulp.dest(config.app.less.output))
		.pipe(connect.reload());
});