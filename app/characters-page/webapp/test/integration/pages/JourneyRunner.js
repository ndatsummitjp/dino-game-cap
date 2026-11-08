sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"characterspage/test/integration/pages/CharactersList",
	"characterspage/test/integration/pages/CharactersObjectPage"
], function (JourneyRunner, CharactersList, CharactersObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('characterspage') + '/test/flp.html#app-preview',
        pages: {
			onTheCharactersList: CharactersList,
			onTheCharactersObjectPage: CharactersObjectPage
        },
        async: true
    });

    return runner;
});

