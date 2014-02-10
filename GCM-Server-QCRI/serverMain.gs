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
	processResult(eventInfo.query, eventInfo.result);
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

function processResult(query, result) {
  var entries = db.query({"query" : query});
  var devices = [];
  while (entries.hasNext()) {
	  var current = entries.next();
	  devices.push(current.regId);
  }
  sendGCM(devices, GCM_MESSAGE_PLAYLOAD_KEY, result);
}

function testSendAll(){
  sendGCM2All('test fghgfghfg');
}

function testSaveGroups() {
  var req1 = {
		  "regId" : "APA91bFFn0WIOOIf81FodJpX7ZFQGElBICDUd6wExTKvavjZ0rWZSQmeSfis4h2RTqapgD6sS_XGjsFnxISkuUHijzm0lp0kxNmL4UoJI3Hg_KG3TiQ0riCoYPQYHdzg6jFfDKAa9txkN1L47FGtwoS2ec433Hahk7PvLrJ0c2tUaztOt4UE9UI",
		  "query" : "query1"
  };
  var req2 = {
		  "regId" : "APA91bGPCAPOxEFQQEgCM_a9E2js1jEhZSpe6oGLHXvI2bomDi3DBP7yVj8i4WmqV_3Pqqm6y574V0E_nw8GedFPLOR7s7GQCiF4UXub18nYlbNcBkQ05ztmlkzZM38r3JaVwbEERn77lmtteM-BDdNy-ULo5Xki9dE61qMUVxybO8ZjkncTseg",
		  "query" : "query2"
  };
  db.save(req1);
  db.save(req2);
}

function testFindGroups() {
  Logger.log(db.query({"query" : "query1"}).next().regId);
  Logger.log(db.query({"query" : "query2"}).next().regId);
}

function testProcessResult() {
  var query1 = "query1";
  var query2 = "query2";
  var result1 = "result1";
  var result2 = "result2";
  processResult(query1, result1);
  processResult(query2, result2);
}