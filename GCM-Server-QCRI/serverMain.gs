function doGet() {
  return HtmlService.createHtmlOutputFromFile('serverUI');
}

function doPost(eventInfo) {
  if(eventInfo.parameter.regId) {
    processReg(eventInfo);
  } else if(eventInfo.parameter.type === 'sendAll'){
	// TODO authentication to make sure device is registered 
	sendGCM2All(eventInfo.parameter.gcmMessage);
  } else if (eventInfo.postData.contents){  // sends CSPARQL results to all devices
    sendGCM2All(eventInfo.postData.contents);
  } else if (eventInfo.query) { // received results from the proxy server
	var query = eventInfo.query;
	var entries = db.query({"query" : query});
	var devices = [];
	while (entries.hasNext()) {
		  var current = entries.next();
		  devices.push(current.regId);
	}
	sendGCM(devices, GCM_MESSAGE_PLAYLOAD_KEY, eventInfo.result);
  }
  var app = UiApp.getActiveApplication();
  return app;
}

function processReg(eventInfo) {  
  var reg = db.query({regId : eventInfo.parameter.regId}).next();
  if(reg && eventInfo.parameter.type === 'unregister'){
    db.remove(reg);
    Logger.log("Removed the given registration id.");
  } else if(!reg && eventInfo.parameter.type === 'register'){
     db.save(eventInfo.parameter);
     Logger.log("Registered the given registration id.");
  }
}

function testSendAll(){
  sendGCM2All('test fghgfghfg');
}

function testSaveGroups() {
  var req1 = {
		  "regId" : "APA91bFFn0WIOOIf81FodJpX7ZFQGElBICDUd6wExTKvavjZ0rWZSQmeSfis4h2RTqapgD6sS_XGjsFnxISkuUHijzm0lp0kxNmL4UoJI3Hg_KG3TiQ0riCoYPQYHdzg6jFfDKAa9txkN1L47FGtwoS2ec433Hahk7PvLrJ0c2tUaztOt4UE9UI",
		  "query" : "query1"
  }
  var req2 = {
		  "regId" : "",
		  "query" : "query2"
  }
  db.save(req1);
  db.save(req2);
}

function testFindGroups() {
  Logger.log(db.query({"query" : "query1"}).next().regId);
}