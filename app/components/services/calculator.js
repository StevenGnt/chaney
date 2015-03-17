'use strict';
angular
    .module('Chaney')
    .service('Calculator', function(amMoment) {
        // Shouldn't this service be a factory ?
        var calculator = {}, parameters = {},
            setParameter = function(key, value){
                parameters[key] = value;
                return calculator;
            },
            toMoment = function(string) {
                return amMoment.preprocessors.utc(string, 'DD/MM/YYYY');
            };

        // Define setters
        calculator.setStart = function(date){
            return setParameter('start', date);
        };

        calculator.setDuration = function(duration, unit){
            setParameter('durationUnit', unit || 'month');
            return setParameter('duration', duration);
        };

        calculator.setStartValue = function(value) {
            return setParameter('startValue', value);
        };

        calculator.setRecurrings = function(recurrings) {
            return setParameter('recurrings', recurrings);

        };
        calculator.setUniques = function(uniques) {
            return setParameter('uniques', uniques);
        };

        calculator.reset = function(){
            parameters = {};
            recurrings = [];
            uniques = [];
        };

        calculator.computeValues = function() {
            var values = [],
                start = toMoment(parameters.start),
                end = start.clone().add(parameters.duration, parameters.durationUnit);

            // Set initial value
            values.push(parameters.startValue);

            // Init values if needed
            parameters.recurrings = parameters.recurrings || [];
            parameters.uniques = parameters.uniques || [];

            // Iterate through each day
            while(start <= end){
                var value = values[values.length - 1],
                    d = start.format('D'),
                    string = start.format('DD/MM/YYYY');

                // Process recurring operations
                angular.forEach(parameters.recurrings, function(recurring) {
                    if (d != recurring.day) {
                        // The value does not apply to the current day
                        return;
                    }

                    if (recurring.start && toMoment(recurring.start) > end
                     || recurring.end && toMoment(recurring.end) < start) {
                        // The current recurring is not active
                        return;
                    }

                    value += recurring.value;
                });

                // Process unique operations
                angular.forEach(parameters.uniques, function(unique) {
                    if (unique.date === string) {
                        value += unique.value;
                    }
                });

                values.push(value)
                start = start.add(1, 'day');
            }

            return values;
        };

        return calculator;
    });