function doGet() {
  return HtmlService.createHtmlOutputFromFile('serverUI');
}

function doPost(eventInfo) {
  if(eventInfo.parameter.regId) {
    processGCM(eventInfo);
  } else {
  }
  var app = UiApp.getActiveApplication();
  return app;
}

function processGCM(eventInfo) {  
  var reg = db.query({regId : eventInfo.parameter.regId}).next();
  if(reg && eventInfo.parameter.type === 'unregister') {
    db.remove(reg);
    Logger.log("Removed the given registration id.");
  } else if(!reg && eventInfo.parameter.type === 'register') {
    db.save(eventInfo.parameter);
    Logger.log("Registered the given registration id.");
  }
}

function testDummy() {
  var device1 = { 'type' : 'register' ,
             'regId' : 'device1' ,
             'query' : 'uri'
  };
  
  db.save(device1);
}

function testSendGCM() {
  var message = 'hello';
  sendGCM2All(message);
}