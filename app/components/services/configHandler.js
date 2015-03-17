'use strict';
angular
	.module('Chaney')
	.service('ConfigHandler', function($http) {
		// This service handles the loading of the app's config
		var service = {},
            config = {};

            service.promise = $http.get(window.location.origin + '/data/data.json')
				.success(function(data){
					service.setParameters(data);
				});


            service.setParameters = function(parameters) {
                angular.extend(config, parameters);
            };

            service.getConfig = function() {
                return config;
            };

            return service;
	});