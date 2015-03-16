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
			.setDuration(config.parameters.duration, config.parameters.durationUnit)
			.setStartValue(config.parameters.startValue)
			.setRecurrings(config.recurrings)
			.setUniques(config.uniques)
			.computeValues();

		$scope.chartData.push(regular);
		$scope.series.push('Regular');

		// @todo Compute actual labels
		for(var i in regular){
			$scope.labels.push(i);
		}
		// @todo:end

		// Send some parameters to the $scope
		$scope.recurrings = config.recurrings;
		$scope.uniques = config.uniques;
		$scope.simulation = config.simulation;
	});