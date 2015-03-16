'use strict';
angular
	.module('Chaney')
	.service('Calculator', function(amMoment) {
		// Shouldn't this service be a factory ?
		var calculator = {}, parameters = {},
			setParameter = function(key, value){
				parameters[key] = value;
				return calculator;
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
				start = amMoment.preprocessors.utc(parameters.start, 'DD/MM/YYYY'),
				end = start.clone().add(parameters.duration, parameters.durationUnit),
				count = 0;

			values.push(parameters.startValue);

			// Iterate through each day
			while(start <= end){
				var value = values[count];

				// @todo:Compute the actual day value according
				// to Uniques and Recurrings
				value += Math.random() * 10000;
				// @todo:end

				values.push(value)
				start = start.add(1, 'day');
				count++;
			}

			return values;
		};

		return calculator;
	});