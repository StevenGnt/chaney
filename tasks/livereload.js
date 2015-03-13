'use strict';

var gulp = require('gulp'),
	connect = require('gulp-connect'),
	watch = require('gulp-watch'),
	config = require('./config.json');

gulp.task('livereload', function() {
	gulp.watch(config.app.livereload.watched, ['livereload:reload']);
});

gulp.task('livereload:reload', function() {
	return gulp.src(config.app.livereload.watched)
		.pipe(connect.reload());
});