;'use strict';
angular
	.module('Chaney')
	.controller('OverviewCtrl', function($scope, $modal, $filter, ConfigHandler, Calculator, amMoment) {
		// Send parameters to the $scope
        $scope.config = ConfigHandler.getConfig();

        resetScopeValues = function() {
            $scope.labels = [];
            $scope.chartData = [];
            $scope.series = [];
            $scope.recurringSum = 0;
        };

		// Init scope vars
        $scope.enabledSimulations = [];
        resetScopeValues();

        $scope.computeScopeData = function() {
            var regular, i, m;

            // Reset scope values
            resetScopeValues();

            regular = Calculator
                .setStart($scope.config.parameters.start)
                .setDuration($scope.config.parameters.duration, $scope.config.parameters.durationUnit)
                .setStartValue($scope.config.parameters.startValue)
                .setRecurrings($scope.config.recurrings)
                .setUniques($scope.config.uniques)
                .computeValues();

            // Set values in scope
            $scope.chartData.push(regular);
            $scope.series.push([$filter('translate')('GLOBAL.REGULAR')]);

            // Build labels
            for (i in regular) {
                m = Calculator.toMoment($scope.config.parameters.start).add(i, 'days');
                $scope.labels.push(parseInt(m.format('D')) % 5 === 0 ? m.format('DD/MM/YY') : '');
            }

            // Compute sum
            angular.forEach($scope.config.recurrings, function(value){
                $scope.recurringSum += value.value;
            });

            // Handles simulations
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

        $scope.computeScopeData();

        // Modals callback
        $scope.openAddModal = function(type) {
            var modal = $modal.open({
                templateUrl: 'components/overview/templates/modal/add-' + type + '.html',
                controller: 'OverviewModalCtrl',
                size: 'lg'
            });

            modal.result.then(function (newElement) {
                var elt = angular.copy(newElement);
                if (type !== 'simulation') {
                    // Prepare the new element (unique / recurring)
                    elt.value = parseInt(elt.value);
                    if (type === 'unique') {
                        elt.date = amMoment.preprocessDate(elt.date).format('DD/MM/YYYY');
                    } else {
                        angular.forEach(['start', 'end'], function(val){
                            if (elt[val]) {
                                elt[val] = amMoment.preprocessDate(elt[val]).format('DD/MM/YYYY');
                            }
                        });
                    }

                    var attr = type === 'unique' ?
                        'uniques' : 'recurrings';
                    if (elt.simulation) {
                        delete elt.simulation;
                        $scope.config.simulations[newElement.simulation][attr].push(elt);
                    } else {
                        $scope.config[attr].push(elt);
                    }
                } else {
                    // Build a new simulation
                    $scope.config.simulations[elt.name] = {
                        recurrents: [],
                        uniques: []
                    };
                }

                ConfigHandler.setParameters($scope.config);

                $scope.computeScopeData();
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