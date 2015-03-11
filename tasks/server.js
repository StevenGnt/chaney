'use strict';

var gulp = require('gulp'),
	connect = require('gulp-connect'),
	config = require('./config.json');

gulp.task('server', function() {
	// Start the server
	connect.server({
		host: config.server.host,
		port: config.server.port,
		root: config.server.directory,
		livereload: true
	});
});