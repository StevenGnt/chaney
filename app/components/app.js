;'use strict';
angular
	.module('Chaney', [], function ($scope){
		$scope.foo = "barr";
		console.log('okay');

	})
	.config([], function(){
		console.log('ok');
	})
	.run([], function(){
		console.log('ok');
	});