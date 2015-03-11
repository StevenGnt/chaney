'use strict';

var gulp = require('gulp');

// Load every task
require('require-dir')('./tasks');

// "server" task as default task
gulp.task('default', ['watch', 'server', 'less', 'livereload'], function() {});