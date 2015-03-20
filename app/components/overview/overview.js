;'use strict';
angular
	.module('Chaney')
	.controller('OverviewCtrl', function($scope, $modal, $filter, ConfigHandler, Calculator, amMoment, ChaneyConfig) {
		// Send parameters to the $scope
        $scope.config = ConfigHandler.getConfig();
        $scope.enabledSimulations = [];

        resetScopeValues = function() {
            // Reset every scope value to its initial state
            $scope.labels = [];
            $scope.chartData = [];
            $scope.series = [];
            $scope.recurringSum = 0;
        };

        prepareDate = function(date){
            // Prepare a date from a datepicker to the config format
            return amMoment.preprocessDate(date).format(ChaneyConfig.dateFormat);
        };

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
                $scope.labels.push(parseInt(m.format('D')) % 5 === 0 ? m.format(ChaneyConfig.dateFormat) : '');
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

        $scope.dateInInterval = function(date) {
            var m = Calculator.toMoment(date),
                s = Calculator.toMoment($scope.config.parameters.start),
                e = s.clone().add($scope.config.parameters.duration, $scope.config.parameters.durationUnit);

            return m >= s && m <= e;
        };

        // Modals callback
        $scope.openAddModal = function(type) {
            var modal = $modal.open({
                templateUrl: 'components/overview/templates/modal/add-' + type + '.html',
                controller: 'OverviewAddModalCtrl',
                size: 'lg'
            });

            modal.result.then(function (newElement) {
                var elt = angular.copy(newElement);
                if (type !== 'simulation') {
                    // Prepare the new element (unique / recurring)
                    elt.value = parseInt(elt.value);
                    if (type === 'unique') {
                        elt.date = prepareDate(elt.date);
                    } else {
                        angular.forEach(['start', 'end'], function(val){
                            if (elt[val]) {
                                elt[val] = prepareDate(elt[val]);
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

                updateConfig();
            });
        };

        $scope.openExportModal = function() {
            $modal.open({
                templateUrl: 'components/overview/templates/modal/export-config.html',
                controller: 'OverviewCtrl'
            });
        };

        $scope.openParametersModal = function() {
            var modal = $modal.open({
                templateUrl: 'components/overview/templates/modal/edit-parameters.html',
                controller: 'OverviewParametersCtrl'
            });

            modal.result.then(function(parameters){
                var _parameters = angular.copy(parameters);
                // Prepare the parameters
                _parameters.startValue = parseInt(_parameters.startValue);
                _parameters.duration = parseInt(_parameters.duration);
                _parameters.start = prepareDate(_parameters.start);

                // Update scope's config
                $scope.config.parameters = _parameters;
                updateConfig();
            });
        };

        function updateConfig() {
            ConfigHandler.setParameters($scope.config);
            $scope.computeScopeData();
        };

		// Init scope vars
        resetScopeValues();
        $scope.computeScopeData();
	})
    .controller('OverviewAddModalCtrl', function($scope, $modalInstance, ConfigHandler) {
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
    })
    .controller('OverviewParametersCtrl', function($scope, $modalInstance, ConfigHandler, Calculator) {
        $scope.parameters = ConfigHandler.getConfig().parameters;

        $scope.parameters.start = Calculator.toMoment($scope.parameters.start).toDate();

        $scope.ok = function() {
            $modalInstance.close($scope.parameters);
        };

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };
    });