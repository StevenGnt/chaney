;'use strict';
angular
	.module('Chaney')
	.controller('OverviewCtrl', function($scope, ConfigHandler, Calculator, amMoment) {
		var config = ConfigHandler.getConfig(),
			regular = [],
            i;

		// Init scope vars
		$scope.labels = [];
        $scope.enabledSimulations = [];

        // Compute chart values
        regular = Calculator
            .setStart(config.parameters.start)
            .setDuration(config.parameters.duration, config.parameters.durationUnit)
            .setStartValue(config.parameters.startValue)
            .setRecurrings(config.recurrings)
            .setUniques(config.uniques)
            .computeValues();

        initChartData = function() {
            $scope.chartData = [];
            $scope.series = [];
            $scope.chartData.push(regular);
            $scope.series.push('Regular');
        };

        initChartData();

        // Build labels
		for(i in regular){
            $scope.labels.push(i % 5 === 0 ?
                Calculator.toMoment(config.parameters.start).add(i, 'days').format('DD/MM/YY')
                : '');
		}

        // ng-click callbacks
        $scope.changeSimulationStatus = function() {
            var i, j, simulationConfig;

            initChartData();

            for (i in $scope.enabledSimulations) {
                if (!$scope.enabledSimulations[i]) {
                    continue;
                }

                simulationConfig = {recurrings: [], uniques: []};

                for (j in simulationConfig) {
                    simulationConfig[j] = config[j];
                    if (config.simulations[i][j]) {
                        simulationConfig[j] = simulationConfig[j].concat(config.simulations[i][j]);
                    }
                }

                $scope.chartData.push(Calculator
                    .setRecurrings(simulationConfig.recurrings)
                    .setUniques(simulationConfig.uniques)
                    .computeValues());
                $scope.series.push(i);
            }
        };

        $scope.openAddModal = function(name) {
            console.log(name);
        };

		// Send some parameters to the $scope
		$scope.recurrings = config.recurrings;
		$scope.uniques = config.uniques;
		$scope.simulations = config.simulations;
	});