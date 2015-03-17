;'use strict';
angular
	.module('Chaney', [
        'ui.bootstrap',
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
                NAME: 'Nom',
                CLOSE: 'Fermer',
                VALUE: 'Valeur',
                DATE: 'Date',
                OK: 'OK',
                CANCEL: 'Annuler'
            },
            OVERVIEW: {
                RECURRING: 'Récurrent',
                RECURRINGS: 'Récurrents',
                ADD_RECURRING: 'Ajouter une opération récurrente',
                UNIQUE: 'Unique',
                UNIQUES: 'Uniques',
                ADD_UNIQUE: 'Ajouter une opération unique',
                SIMULATION: 'Simulation',
                SIMULATIONS: 'Simulations',
                ADD_UNIQUE: 'Ajouter une simulation'
            }
        });

        $translateProvider.use('fr_FR');
	}]);