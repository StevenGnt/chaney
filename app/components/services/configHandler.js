'use strict';
angular
	.module('Chaney')
	.service('ConfigHandler', function($http) {
		// This service handles the loading of the app's config
		var config,
			configUrl = window.location.origin + '/data/data.json',
			promise = $http.get(configUrl)
				.success(function(data){
					config = data;
				});

			return {
				promise: promise,
				getConfig: function(){
					return config;
				}
			};
	});