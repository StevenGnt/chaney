;'use strict';
angular
	.module('Chaney')
	.controller('OverviewCtrl', function($scope, ConfigHandler, Calculator) {
		var config = ConfigHandler.getConfig(),
			regular = [];

		// Init scope vars
		$scope.chartData = [];
		$scope.series = [];
		$scope.labels = [];

		// Compute chart values
		regular = Calculator
			.setStart(config.parameters.start)
			.setDuration(config.parameters.duration)
			.setStartValue(config.parameters.startValue)
			.setRecurrings(config.recurrings)
			.setUniques(config.uniques)
			.computeValues();

		$scope.chartData.push(regular);
		$scope.series.push('Regular');

		// @todo Compute actual labels
		$scope.labels = [5, 987, 984, 6516, 51, 65, 1, 65, 1, 65, 1];

		// Send some parameters to the $scope
		$scope.recurrings = config.recurrings;
		$scope.uniques = config.uniques;
		$scope.simulation = config.simulation;
	});