'use strict';

angular
	.module('Chaney', [])
	.controller('OverviewCtrl', function($scope) {
		// @todo Fetch on a higher level
		// Main view parameters
		var parameters = {
			start: '06/12/2014',
			length: 8,
			startValue: 560
		};
		// /end todo
		$scope.recurring = {
			name: 'Loyer',
			value : -158.564
		};
		$scope.chartData = [];
	});