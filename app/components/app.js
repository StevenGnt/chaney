;'use strict';
angular
	.module('Chaney', [
        // 'ui.bootstrap',
        'ui.router',
        'chart.js',
        'pascalprecht.translate',
        'angularMoment'
    ])
	.config(['$stateProvider', '$urlRouterProvider', '$translateProvider', function($stateProvider, $urlRouteProvider, $translateProvider) {
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
						templateUrl: 'components/overview/templates/overview.html',
						controller: 'OverviewCtrl'
					}
				}
			});

        // Handle translations
        // - French
        $translateProvider.translations('fr_FR', {
            GLOBAL: {
                ADD: 'Ajouter',
                RECURRING: 'Récurrent',
                RECURRINGS: 'Récurrents',
                UNIQUE: 'Unique',
                UNIQUES: 'Uniques',
                SIMULATIONS: 'Simulations',
                NAME: 'Nom',
                VALUE: 'Valeur'
            }
        });

        $translateProvider.use('fr_FR');
	}]);