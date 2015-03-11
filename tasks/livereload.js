'use strict';

var gulp = require('gulp'),
	connect = require('gulp-connect'),
	watch = require('gulp-watch'),
	config = require('./config.json');

gulp.task('livereload', function() {
	// Watched directories and files for livereload
	var watched = [];
	watched.push(config.app.less.output);	// LESS output directory

	// Add dirs / files from configuration
	watched = watched.concat(config.app.livereload.extraWatched);

	// watch(watched)
		// .pipe(connect.reload());

	// gulp.watch(watched, ['livereload.reload']);
	// return;
	// Watch candidate directories for livereload
	gulp.src(watched)
		// .pipe(watch(watched))
		.pipe(connect.reload());
});