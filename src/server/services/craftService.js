/*global require*/
/*jslint nomen: true*/
'use strict';

var Craft = {};

Craft.getUrl = function (urlType, query, authKey) {
    return 'https://' + urlType + '/' + query + '&api_key=' + authKey;
};
Craft.craftObserverUrl = function (urlType, region, api, authKey) {
    return 'https://' + region + '.' + urlType + api +
        'api_key=' + authKey;
};
Craft.craftStaticUrl = function (urlType, region, api, authKey) {
    return 'https://' + 'global.' + urlType + '/' + region + api + 'api_key=' + authKey;
};
Craft.craftStatusUrl = function (urlType, api, region) {
    return 'http://' + urlType + api + region;
};
Craft.craftTournamentUrl = function (urlType, api, authKey) {
    return 'https://global.' + urlType + '/' + api + 'api_key=' + authKey;
};
Craft.craftChampionMasteryUrl = function (urlType, region, platformId, api, authKey) {
    return 'https://' + region + '.' + urlType + '/location/' + platformId + api + 'api_key=' + authKey;
};

export default Craft;
