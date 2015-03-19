;'use strict';
angular
	.module('Chaney')
	.controller('OverviewCtrl', function($scope, $modal, $filter, ConfigHandler, Calculator, amMoment) {
		// var config = ConfigHandler.getConfig(),
        var regular = [],
            i, m;

		// Send parameters to the $scope
        $scope.config = ConfigHandler.getConfig();

		// Init scope vars
		$scope.labels = [];
        $scope.enabledSimulations = [];

        // Compute regular chart values
        computeRegular = function() {
            regular = Calculator
                .setStart($scope.config.parameters.start)
                .setDuration($scope.config.parameters.duration, $scope.config.parameters.durationUnit)
                .setStartValue($scope.config.parameters.startValue)
                .setRecurrings($scope.config.recurrings)
                .setUniques($scope.config.uniques)
                .computeValues();
        };

        // Reset chart data values
        initChartData = function() {
            $scope.chartData = [regular];
            $scope.series = [$filter('translate')('GLOBAL.REGULAR')];
        };
        
        // Compute recurring sum
        $scope.recurringSum = '- -';
        computeRecurringSum = function() {
            $scope.recurringSum = 0;
            angular.forEach($scope.config.recurrings, function(value){
                $scope.recurringSum += value.value;
            });
        };

        computeRegular();
        initChartData();
        computeRecurringSum();

        // Build labels
		for (i in regular) {
            m = Calculator.toMoment($scope.config.parameters.start).add(i, 'days');
            $scope.labels.push(parseInt(m.format('D')) % 5 === 0 ? m.format('DD/MM/YY') : '');
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

        // Modals
        $scope.openAddModal = function(type) {
            var modal = $modal.open({
                templateUrl: 'components/overview/templates/modal/add-' + type + '.html',
                controller: 'OverviewModalCtrl',
                size: 'lg'
            });

            modal.result.then(function (newElement) {
                var elt = angular.copy(newElement),
                    prepDate = function(date) {
                        return amMoment.preprocessDate(elt.date).format('DD/MM/YYYY');
                    },
                    attr;
                switch (type) {
                    case 'recurring':
                        attr = 'recurrings';
                        if (elt.start) {
                            elt.start = prepDate(elt.start);
                        }
                        if (elt.end) {
                            elt.end = prepDate(elt.end);
                        }
                        break;

                    case 'unique':
                        attr = 'uniques';
                        elt.date = prepDate(elt.date);
                        break;

                    case 'simulation':
                        break;
                }

                // Add the new element where it belongs
                if (type !== 'simulation') {

                    if (elt.simulation) {
                        delete elt.simulation;
                        $scope.config.simulations[newElement.simulation][attr].push(elt);
                    } else {
                        $scope.config[attr].push(elt);
                    }
                } else {
                    $scope.config.simulations[elt.name] = {
                        recurrents: [],
                        uniques: []
                    };
                }

                ConfigHandler.setParameters($scope.config);

                computeRegular();
                initChartData();
            });
        };

        $scope.openExportModal = function() {
            $modal.open({
                templateUrl: 'components/overview/templates/modal/export-config.html',
                controller: 'OverviewModalCtrl'
            });
        };
	})
    .controller('OverviewModalCtrl', function($scope, $modalInstance, ConfigHandler) {
        // Handle overview modals
        $scope.config = ConfigHandler.getConfig();
        $scope.newElement = {};

        $scope.simulations = [];
        if ($scope.config.simulations) {
            for (var i in $scope.config.simulations) {
                $scope.simulations.push(i);
            }
        }

        $scope.days = [];
        for (var i = 1; i <= 30; i++) {
            $scope.days.push(i);
        }

        $scope.ok = function() {
            $modalInstance.close($scope.newElement);
        };

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };
    });