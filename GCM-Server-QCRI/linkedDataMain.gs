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
function buildQuery(parameter, uuid) {
  var querytext = "REGISTER STREAM " + uuid + " AS " +
  "PREFIX : <http://streamreasoning.org/ontologies/sr4ld2013-onto#> " +
  "PREFIX sioc: <http://rdfs.org/sioc/ns#> " +
  "PREFIX dbp: <http://dbpedia.org/property/place> " +
  "CONSTRUCT { ?post a sioc:MicroblogPost; sioc:attachment ?attachement; sioc:description ?desc; sioc:title ?title; dbp:place '" + parameter + "'. :uuid :is '" + uuid + "'. } " +
  "FROM STREAM <http://ex.org/fs> [RANGE 1m STEP 10s] " +
  "WHERE { ?post a sioc:MicroblogPost; sioc:attachment ?attachement; sioc:description ?desc; sioc:title ?title; dbp:place '" + parameter +"'. } ";
  return querytext;
}

function putRequest(querytext, serverUrl) {
  var urlFetchOptions =  
     {'method' : 'put',
      'payload' : querytext,
     };
  return UrlFetchApp.fetch(serverUrl,urlFetchOptions).getContentText();
}