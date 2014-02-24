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
function buildQuery(lat, long, uuid) {
  var querytext = "REGISTER STREAM " + uuid + " AS " +
  "PREFIX : <http://streamreasoning.org/ontologies/sr4ld2013-onto#> " +
  "PREFIX sioc: <http://rdfs.org/sioc/ns#> " +
  "PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#> " +
  "CONSTRUCT { ?post a sioc:MicroblogPost; sioc:attachment ?attachment; sioc:description ?desc; sioc:title ?title. :uuid :is '" + uuid + "'. } " +
  "FROM STREAM <http://ex.org/gcm> [RANGE 1m STEP 10s] " +
  "WHERE { ?post a sioc:MicroblogPost; sioc:attachment ?attachment; sioc:description ?desc; sioc:title ?title; geo:lat ?lat; geo:long ?long . " +
    "FILTER( ( ((?lat-" + lat + ")*(?lat-" + lat + ")) < 0.01*0.01) ) " +
    "FILTER( ( ((?long-" + long + ")*(?long-" + long + ")) < 0.01*0.01) )" +
  "}";
  return querytext;
}

function putRequest(querytext, serverUrl) {
  var urlFetchOptions =  
     {'method' : 'put',
      'payload' : querytext,
     };
  return UrlFetchApp.fetch(serverUrl,urlFetchOptions).getContentText();
}

function postRequest(payload, serverUrl) {
  var urlFetchOptions =  
     {'method' : 'post',
      'payload' : payload,
     };
  return UrlFetchApp.fetch(serverUrl,urlFetchOptions).getContentText();
}

function parseResult(result) {
  for (var key in result) {
    var title = result[key]["http://rdfs.org/sioc/ns#title"][0].value;
    var description = result[key]["http://rdfs.org/sioc/ns#description"][0].value;
    var image = result[key]["http://rdfs.org/sioc/ns#attachment"][0].value;
  }
  var output = 'result,' + title + ',' + image + ',' + description;
  //MyLog("parseResult", "var output", output);
  return output;
}

function replaceUUID(regId, new_uuid) {
  // find and delete old entries
  var entries = db.query({"regId": regId});
  while (entries.hasNext()) {
    var current = entries.next();
    if (current["uuid"] != undefined) {
      db.remove(current);
    }
  }
  // save new entry
  db.save({"regId" : regId,
           "uuid" : new_uuid
  });
}