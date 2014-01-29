var db = ScriptDb.getMyDb();

function clearDB() {
  var result = db.query({});
  db.removeBatch(result, false); 
}

function getDb() {
  return db;
}

function sendGCM2One(regId,msg) {
  var regIds  = [];
  regIds.push(regId);
  sendGCM(regIds, GCM_MESSAGE_PLAYLOAD_KEY, msg);
}

function sendGCM2All(msg) {
  var regIds  = [];
  var result = db.query({});
  while (result.hasNext()) {
    var current = result.next();
    regIds.push(current.regId);
    Logger.log("The registration id is :"+current.regId);
  }
  Logger.log("The message is "+msg);
  sendGCM(regIds, GCM_MESSAGE_PLAYLOAD_KEY,msg);
}

//key - key that has the message
//value - the msg 
function sendGCM(regIds, msgKey, msg){
  msg = msg ||  'hello world!'; //give default message for debugging
  //Logger.log("The msgkey is "+msgKey);
  
  var payload;
  if (msgKey === GCM_MESSAGE_PLAYLOAD_KEY) {
    payload = {'registration_ids' : regIds,
               'data' : {
                 'gcmMessage' : msg
               }};
  } else {
    payload = {'registration_ids' : regIds,
               'data' : {
                 'gcmMessage' : {'pds_ready':'true'}
               }};    
  }
  
  var urlFetchOptions =  {'contentType' : 'application/json',
                          'headers' : {'Authorization' : 'key=' + apiKey},
                          'method' : 'post',
                          'payload' : JSON.stringify(payload)};
  
  var gcmUrl = 'https://android.googleapis.com/gcm/send';
  var response = UrlFetchApp.fetch(gcmUrl,urlFetchOptions).getContentText()
}