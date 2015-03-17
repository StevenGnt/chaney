'use strict';
angular
    .module('Chaney')
    .service('Calculator', function(amMoment) {
        // Shouldn't this service be a factory ?
        var service = {}, parameters = {},
            setParameter = function(key, value){
                parameters[key] = value;
                return service;
            };

        service.toMoment = function(string) {
            return amMoment.preprocessors.utc(string, 'DD/MM/YYYY');
        };

        // Define setters
        service.setStart = function(date){
            return setParameter('start', date);
        };

        service.setDuration = function(duration, unit){
            setParameter('durationUnit', unit || 'month');
            return setParameter('duration', duration);
        };

        service.setStartValue = function(value) {
            return setParameter('startValue', value);
        };

        service.setRecurrings = function(recurrings) {
            return setParameter('recurrings', recurrings);

        };
        service.setUniques = function(uniques) {
            return setParameter('uniques', uniques);
        };

        service.reset = function(){
            parameters = {};
            recurrings = [];
            uniques = [];
        };

        service.computeValues = function() {
            var values = [],
                start = service.toMoment(parameters.start),
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

                    if (recurring.start && service.toMoment(recurring.start) > end
                     || recurring.end && service.toMoment(recurring.end) < start) {
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

        return service;
    });