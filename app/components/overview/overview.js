;'use strict';
angular
	.module('Chaney')
	.controller('OverviewCtrl', function($scope, $modal, ConfigHandler, Calculator, amMoment) {
		// var config = ConfigHandler.getConfig(),
        var regular = [],
            i;

		// Send parameters to the $scope
        $scope.config = ConfigHandler.getConfig();

		// Init scope vars
		$scope.labels = [];
        $scope.enabledSimulations = [];

        // Compute chart values
        regular = Calculator
            .setStart($scope.config.parameters.start)
            .setDuration($scope.config.parameters.duration, $scope.config.parameters.durationUnit)
            .setStartValue($scope.config.parameters.startValue)
            .setRecurrings($scope.config.recurrings)
            .setUniques($scope.config.uniques)
            .computeValues();

        initChartData = function() {
            $scope.chartData = [];
            $scope.series = [];
            $scope.chartData.push(regular);
            $scope.series.push('Regular');
        };

        initChartData();

        // Build labels
		for (i in regular) {
            $scope.labels.push(i % 5 === 0 ?
                Calculator.toMoment($scope.config.parameters.start).add(i, 'days').format('DD/MM/YY')
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

                // If the simulation is enabled, fetch all of
                // its recurrings and uniques and merge them
                // with "regular" spendings
                simulationConfig = {recurrings: [], uniques: []};
                for (j in simulationConfig) {
                    simulationConfig[j] = $scope.config[j];
                    if ($scope.config.simulations[i][j]) {
                        simulationConfig[j] = simulationConfig[j].concat($scope.config.simulations[i][j]);
                    }
                }

                // Push values in $scope.chartData
                $scope.chartData.push(Calculator
                    .setRecurrings(simulationConfig.recurrings)
                    .setUniques(simulationConfig.uniques)
                    .computeValues());

                $scope.series.push(i);
            }
        };

        $scope.openAddModal = function(type) {
            var modal = $modal.open({
                templateUrl: 'components/overview/templates/modal/add-' + type + '.html',
                controller: 'OverviewModalCtrl',
                size: 'lg'
            });

            modal.result.then(function (newElement) {
                // @todo Keep this abstract to handle different types
                // @todo Handle dates
                console.log(newElement);
                $scope.config.uniques.push(newElement);
                ConfigHandler.setParameters($scope.config);
            });
        };
	})
    .controller('OverviewModalCtrl', function($scope, $modalInstance) {
        // Handle overview modals
        $scope.newElement = {};

        $scope.ok = function() {
            $modalInstance.close($scope.newElement);
        };

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };
    });