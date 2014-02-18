function doGet() {
  return HtmlService.createHtmlOutputFromFile('serverUI');
}

function doPost(eventInfo) {
 if(eventInfo.parameter.type === 'subscribe'){
    // construct the query and register it with CSPARQL 
    // 1. build query using the parameters, inserting a generated UUID into the query and local DB <UUID, regId>
    var uuid = generateUUID();
    var querytext = buildQuery(eventInfo.parameter.parameter, uuid);
    db.save({"regId" : eventInfo.parameter.regId,
             "uuid" : uuid
      });
    
    // 2. putting to the CSPARQL engine
    var serverUrl = "http://128.30.6.63:8175/queries/" + uuid;
    var response = putRequest(querytext, serverUrl);
    
    // 3. register this GCM server as an observer for the query
    var payload = 'https://script.google.com/macros/s/AKfycbwsWFiK5SmwBmawRcKgeQDBbKQVovDFhU_eMb9LzivvMehBQuqe/exec';
    var response = postRequest(payload, serverUrl);
    
  } else if(eventInfo.parameter.regId) {
    processReg(eventInfo);
  } else if(eventInfo.parameter.type === 'sendAll'){
	// TODO authentication to make sure device is registered 
	sendGCM2All(eventInfo.parameter.gcmMessage);
  } else if (eventInfo.postData.contents){  // sends CSPARQL results out
	MyLog("CSPARQL", "eventInfo.postData.contents", eventInfo.postData.contents);
    var contents = JSON.parse(eventInfo.postData.contents);
    MyLog("CSPARQL", "var contents", contents);
    // Check if the results contain a UUID
    var firstLevel = contents['http://streamreasoning.org/ontologies/sr4ld2013-onto#uuid']; 
    MyLog("CSPARQL", "var firstLevel", firstLevel);
    if (firstLevel!= undefined) {
    	var uuid = firstLevel['http://streamreasoning.org/ontologies/sr4ld2013-onto#is'][0]['value'];
    	MyLog("CSPARQL", "var uuid", uuid);
    	delete contents['http://streamreasoning.org/ontologies/sr4ld2013-onto#uuid'];
    	MyLog("CSPARQL", "var contents after deletion", contents);
    	processResult(uuid, contents);
    }
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

function processResult(uuid, result) {
  var entries = db.query({"uuid" : uuid});
  MyLog("processResult", "var entries", entries);
  var devices = [];
  while (entries.hasNext()) {
	  var current = entries.next();
	  devices.push(current.regId);
  }
  MyLog("processResult", "var devices", devices);
  var output = parseResult(result);
  sendGCM(devices, GCM_MESSAGE_PLAYLOAD_KEY, output);
}

function testSaveGroups() {
  var result = { 
      "http://example.com/test_AT_example.com/1386486533774/1392323955318" : { 
        "http://rdfs.org/sioc/ns#description" : [ { 
          "type" : "uri" ,
          "value" : ""
        }
         ] ,
        "http://streamreasoning.org/ontologies/sr4ld2013-onto#place" : [ { 
          "type" : "literal" ,
          "value" : "Cambridge"
        }
         ] ,
        "http://www.w3.org/1999/02/22-rdf-syntax-ns#type" : [ { 
          "type" : "uri" ,
          "value" : "http://rdfs.org/sioc/ns#MicroblogPost"
        }
         ] ,
        "http://rdfs.org/sioc/ns#attachment" : [ { 
          "type" : "uri" ,
          "value" : "http://twitpic.com/show/full/dvf0wl"
        }
         ] ,
        "http://rdfs.org/sioc/ns#title" : [ { 
          "type" : "uri" ,
          "value" : "Test"
        }
         ]
      }
    };

  for (var key in result) {
    Logger.log(result[key]);
  }
}

/**
 * @param {String} functionName The name of the function when the log is generated
 * @param {String} tag The tag for the log
 * @param {String} msg Log message
 */ 
function MyLog(fuctionName, tag, msg){
  // replace LOGGING_SPREADSHEET_ID with a the id of a spreadsheet you own
  var debugSpreadSheetId = "0AqwgfR3kPlxXdHVFZE9ObVhreVhPQTZVOTI1SXJ6a0E";
  var gSS = SpreadsheetApp.openById(debugSpreadSheetId);
  var sheet = gSS.getSheetByName('Sheet1');
  var rowToInsert = sheet.getLastRow() + 1;
  
  var cellLocationFunc = 'A' + rowToInsert;
  var cellLocationTag = 'B' + rowToInsert;
  var cellLocationMsg = 'C' + rowToInsert;
  var cellLocationTimestamp = 'D' + rowToInsert;
  
  
  var lock = LockService.getPrivateLock();
  lock.waitLock(2000);
  sheet.getRange(cellLocationFunc).setValue(fuctionName);
  sheet.getRange(cellLocationTag).setValue(tag);
  sheet.getRange(cellLocationMsg).setValue(msg);
  var time = new Date();
  var logTime = Utilities.formatDate(time, 'EST', "yyyy-MM-dd HH:mm:ss");
  sheet.getRange(cellLocationTimestamp).setValue(logTime);
  lock.releaseLock();

}