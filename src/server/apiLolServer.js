
'use strict';

import Craft from './services/craftService.js';
import Q from 'q';
import QueryMaker from './services/queryMaker.js';
import express from 'express';

var ServerLOL = {},
    apiKey = 'RGAPI-5b82c5da-532b-49cc-9916-f8c42ce569d7',
    staticDataUrl = 'la2.api.riotgames.com/lol/static-data/v3',
    app = express();

app.get('/inicio', function (req, res) {
    res.send('Hello World');
});

app.listen(3000, function () {
    console.log('listen from port 3000');
});

ServerLOL.Champions = {};
ServerLOL.Champions.getInfo = function (freeToPlay) {
    var url,
        freetoPlayQuery = '',
        query = '';

    if (freeToPlay === null || typeof (freeToPlay) !== 'boolean') {
        console.log('Invalid query parameter for freeToPlay: ' + freeToPlay);
    }

    if (freeToPlay) {
        freetoPlayQuery = 'freeToPlay=true&';
    }

    query = 'champions?' + freetoPlayQuery + 'locale=es_AR&tags=format&tags=image&dataById=false';

    url = Craft.getUrl(staticDataUrl, query, apiKey);
    return QueryMaker.makeRequest(url, 'Error getting champions: ');
};

export default ServerLOL;


