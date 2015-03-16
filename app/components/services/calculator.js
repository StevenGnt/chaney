'use strict';
angular
	.module('Chaney')
	.service('Calculator', function() {
		// @todo Shouldn't this service be a factory ?
		var calculator = {},
			parameters = {},
			setParameter = function(key, value){
				parameters[key] = value;
				return calculator;
			};

		// Define setters
		calculator.setStart = function(date){
			return setParameter('start', date);
		};

		calculator.setDuration = function(duration){
			return setParameter('duration', duration);
		};

		calculator.setRecurrings = function(recurrings) {
			return setParameter('recurrings', recurrings);

		};
		calculator.setUniques = function(uniques) {
			return setParameter('uniques', uniques);
		};

		calculator.setStartValue = function(value) {
			return setParameter('startValue', value);
		};

		calculator.reset = function(){
			parameters = {};
			recurrings = [];
			uniques = [];
		};

		calculator.computeValues = function() {
			// @todo Here the magic is supposed to happend ...
			return [5, 987, 984, 6516, 51, 65, 1, 65, 1, 65, 1];
		};

		return calculator;
	});