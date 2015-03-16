;'use strict';
angular
	.module('Chaney', ['ui.router', 'chart.js', 'angularMoment'])
	.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouteProvider) {
		// Default goes to the "overview" state
		$urlRouteProvider.otherwise('/overview');

		$stateProvider
			// Overview state
			.state('overview', {
				url: '/overview',
				resolve: {
					'configuration': function(ConfigHandler){
						return ConfigHandler.promise;
					}
				},
				views: {
					'body@': {
						templateUrl: 'components/overview/overview.html',
						controller: 'OverviewCtrl'
					}
				}
			});
	}]);