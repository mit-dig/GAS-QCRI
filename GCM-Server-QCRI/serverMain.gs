function doGet() {
  return HtmlService.createHtmlOutputFromFile('serverUI');
}

function doPost(eventInfo) {
  if(eventInfo.parameter.regId) {
    //dont return anything :( - otherwise it will break the GoogleCloudMessaging
    processGCM(eventInfo);
  } 
   else if(eventInfo.parameter.type === 'sendAll'){
     sendGCM2All(eventInfo.parameter.gcmMessage);
     Logger.log("Broadcast the message to the devices");
   }
  else if (eventInfo){
    var csparqldata = 'got CSPARQL data';
    sendGCM2All(eventInfo.postData.contents);
    db.save(Utilities.jsonParse(eventInfo.postData.contents));
  }
  else {
    return processPushData(eventInfo)
  }
}

function processGCM(eventInfo) {  
  var reg = db.query({regId : eventInfo.parameter.regId}).next();
  if(reg && eventInfo.parameter.type === 'unregister'){
    db.remove(reg);
    Logger.log("Removed the given registration id.");
   }
   else if(!reg && eventInfo.parameter.type === 'register'){
     //eventInfo.parameter['uuid'] = generateUUID();
     db.save(eventInfo.parameter);
     Logger.log("Registered the given registration id.");
   }  
  //return ContentService.createTextOutput("Processed the GCM request successfully :-)");
}

function sendAll(){
 sendGCM2All('test fghgfghfg');
}