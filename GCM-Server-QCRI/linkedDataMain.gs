/**
 *  Functions supporting communication with CSPARQL Engine
 */

function generateUUID() {
    var uuid = ("0000" + (Math.random()*Math.pow(36,5) << 0).toString(36)).substr(-6);
    var reg = db.query({uuid : uuid}).next();
    if(!reg) {
        return uuid;
    } else {
        return generateUUID();
    }
};

/**
 * @param {String} parameter The parameter for the QUERY
 */
/**
 function buildQuery(topic, lat, long, uuid) {
 var querytext = "REGISTER STREAM " + uuid + " AS " +
 "PREFIX : <http://streamreasoning.org/ontologies/sr4ld2013-onto#> " +
 "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> " +
 "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> " +
 "PREFIX sioc: <http://rdfs.org/sioc/ns#> " +
 "PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#> " +
 "CONSTRUCT { ?post a sioc:MicroblogPost; sioc:attachment ?attachment; sioc:description ?desc; sioc:topic ?topic. :uuid :is '" + uuid + "'. } " +
 "FROM STREAM <http://ex.org/gcm> [RANGE 2s STEP 2s] " +
 "WHERE { ?post a sioc:MicroblogPost; sioc:attachment ?attachment; sioc:description ?desc; sioc:topic ?topic; <http://hxl.humanitarianresponse.info/ns/#atLocation> ?location. " +
 "?location geo:lat ?lat; geo:long ?long . " +
 "FILTER (str(?topic) = '" + topic +"') " +
 "FILTER( ( ((?lat-(" + lat + "))*(?lat-(" + lat + "))) < (0.1*0.1)) ) " +
 "FILTER( ( ((?long-(" + long + "))*(?long-(" + long + "))) < (0.1*0.1)) )" +
 "}";
 return querytext;
 }
 */

/**
 * Building the query for the monitoring situation
 */
/**
 function buildQuery(topic, place, limit, uuid) {
 var querytext = "REGISTER QUERY " + uuid + " AS " +
 "PREFIX : <http://streamreasoning.org/ontologies/sr4ld2013-onto#> " +
 "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> " +
 "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> " +
 "PREFIX sioc: <http://rdfs.org/sioc/ns#> " +
 "PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#> " +
 "SELECT (COUNT(?topic) AS ?"+uuid+") " +
 "FROM STREAM <http://ex.org/gcm> [RANGE 10s STEP 2s] "+
 "WHERE { ?post a sioc:MicroblogPost; sioc:attachment ?attachment; sioc:description ?desc; sioc:topic ?topic; :place ?place. "+
 "FILTER (str(?place) = '" + place + "' && str(?topic) = '" + topic +"')} "+
 "GROUP BY ?place " +
 "HAVING (COUNT(?topic) >= "+ limit+" ) ";
 return querytext;
 }
 
 */

function buildQuery(topic, place, limit, uuid) {
    var querytext = "REGISTER QUERY " + uuid + " AS " +
    "PREFIX : <http://streamreasoning.org/ontologies/sr4ld2013-onto#> " +
    "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> " +
    "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> " +
    "PREFIX sioc: <http://rdfs.org/sioc/ns#> " +
    "PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#> " +
    "SELECT (COUNT(?topic) AS ?"+uuid+") " +
    "FROM STREAM <http://ex.org/gcm> [RANGE 10s STEP 2s] "+
    
    "WHERE { ?post a sioc:MicroblogPost; sioc:attachment ?attachment; sioc:description ?desc; sioc:topic ?topic; <http://hxl.humanitarianresponse.info/ns/#atLocation> ?location. " +
    "?location geo:lat ?lat; geo:long ?long . " +
    "FILTER (str(?topic) = '" + topic +"') " +
    "FILTER (str(?topic) = '" + topic +"')} "+
    "GROUP BY ?place " +
    "HAVING (COUNT(?topic) >= "+ limit+" ) ";
    return querytext;
}


function putRequest(querytext, serverUrl) {
    var urlFetchOptions =
    {'method' : 'put',
        'payload' : querytext,
        'headers' : {
            'Cache-Control' : 'no-cache'
        },
        'muteHttpExceptions': true,
    };
    return UrlFetchApp.fetch(serverUrl,urlFetchOptions);
}

function postRequest(payload, serverUrl) {
    var urlFetchOptions =
    {'method' : 'post',
        'payload' : payload,
        'headers' : {
            'Cache-Control' : 'no-cache'
        },
        'muteHttpExceptions': true,
    };
    return UrlFetchApp.fetch(serverUrl,urlFetchOptions);
}

function deleteRequest(serverUrl) {
    var urlFetchOptions =
    {'method' : 'delete',
        'headers' : {
            'Cache-Control' : 'no-cache'
        },
        'muteHttpExceptions': true,
    };
    return UrlFetchApp.fetch(serverUrl,urlFetchOptions);
}

function parseResult(result) {
    for (var key in result) {
        var topic = result[key]["http://rdfs.org/sioc/ns#topic"][0].value;
        var description = result[key]["http://rdfs.org/sioc/ns#description"][0].value;
        var image = result[key]["http://rdfs.org/sioc/ns#attachment"][0].value;
    }
    var output = 'result,' + topic + ',' + image + ',' + description;
    //MyLog("parseResult", "var output", output);
    return output;
}

function deleteOldUUID(regId, topic) {
    // find and delete old entries
    var entries = db.query({"regId": regId});
    while (entries.hasNext()) {
        var current = entries.next();
        if (current["uuid"] != undefined && current["topic"] == topic) {
            db.remove(current);
            var queryurl = SERVER_URL + current["uuid"];
            var response = deleteRequest(queryurl);
        }
    }
}

function addNewUUID(regId, new_uuid, topic) {
    // save new entry
    db.save({"regId" : regId,
        "uuid" : new_uuid,
        "topic" : topic
    });
}