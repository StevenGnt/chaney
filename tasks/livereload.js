'use strict';

var gulp = require('gulp'),
	connect = require('gulp-connect'),
	watch = require('gulp-watch'),
	config = require('./config.json');

// Watched directories and files for livereload
var watched = config.app.livereload.extraWatched || [];
watched.push(config.app.less.output);	// LESS output directory

console.log('Watched for livereload: ');
for (var i in watched) {
	console.log(' - ' + watched[i]);
}

gulp.task('livereload', function() {
	gulp.watch(watched, ['livereload:reload']);
});

gulp.task('livereload:reload', function() {
	return gulp.src(watched)
		.pipe(connect.reload());
});