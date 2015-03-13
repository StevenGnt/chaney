'use strict';

var gulp = require('gulp'),
	less = require('gulp-less'),
	concat = require('gulp-concat'),
	connect = require('gulp-connect'),
	config = require('./config.json');

gulp.task('less:compile', function() {
	// Compile LESS files
	return gulp.src(config.app.less.input)
		.pipe(less())
		.pipe(concat('main.css'))
		.pipe(gulp.dest(config.app.less.output));
});