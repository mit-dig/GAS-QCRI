function doGet() {
  return HtmlService.createHtmlOutputFromFile('serverUI');
}

function doPost(eventInfo) {
  if(eventInfo.parameter.regId) {
    processReg(eventInfo);
  } else if(eventInfo.parameter.type === 'sendAll'){
	// TODO authentication to make sure device is registered 
	sendGCM2All(eventInfo.parameter.gcmMessage);
    Logger.log("Broadcast the message to the devices");
  } else if (eventInfo.postData.contents){  // better check here?
    sendGCM2All(eventInfo.postData.contents);
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