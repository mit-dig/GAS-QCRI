function doGet() {
    return HtmlService.createHtmlOutputFromFile('serverUI');
}

function doPost(eventInfo) {
    if(eventInfo.parameter.type === 'subscribe'){
        // construct the query and register it with CSPARQL
        // 1. build query using the parameters, inserting a generated UUID into the query and local DB <UUID, regId>
        var uuid = generateUUID();
        var querytext = buildQuery(eventInfo.parameter.topic, eventInfo.parameter.location, eventInfo.parameter.trigger, uuid);
        //MyLog("queryText", "querytext", querytext);
        
        // Delete old uuids associated with the regId with the same topic, since those are no longer valid
        // Then add the new uuid with the regId
        deleteOldUUID(eventInfo.parameter.regId, eventInfo.parameter.topic);
        addNewUUID(eventInfo.parameter.regId, uuid, eventInfo.parameter.topic);
        
        // 2. putting to the CSPARQL engine
        var serverUrl = SERVER_URL + uuid;
        var response = putRequest(querytext, serverUrl);
        
        // 3. register this GCM server as an observer for the query
        var payload = GCM_SERVER_URL;
        var response = postRequest(payload, serverUrl);
        
        //MyLog("postRequest", "var response", response.getResponseCode());
        if (response.getResponseCode() == 200) {
            sendGCM2One(eventInfo.parameter.regId, 'subscribe,true');
        } else {
            sendGCM2One(eventInfo.parameter.regId, 'subscribe,false');
        }
    } else if(eventInfo.parameter.regId) {
        processReg(eventInfo);
    } else if(eventInfo.parameter.type === 'sendAll'){
        // TODO authentication to make sure device is registered
        sendGCM2All(eventInfo.parameter.gcmMessage);
        //MyLog("GCM", "test", eventInfo.parameter.gcmMessage);
    }
    
    else if (eventInfo.postData.contents){  // sends CSPARQL results out
        var contents = JSON.parse(eventInfo.postData.contents);
        var uuid = contents.head.vars[0];
        var val = contents.results.bindings[0][uuid].value;
        //MyLog("CSPARQL", "var uuid, var val", uuid +"\n"+val);
        processResult(uuid, val);
    }
    else {
        
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
    //MyLog("processResult", "var entries", entries);
    var devices = [];
    while (entries.hasNext()) {
        var current = entries.next();
        devices.push(current.regId);
    }
    //MyLog("processResult", "var devices", devices);
    if (devices.length != 0) {
        sendGCM(devices, GCM_MESSAGE_PLAYLOAD_KEY, 'result,'+result);
    }
}

function testSaveGroups() {
    var devices =[];
    Logger.log(devices.length != 0);
}

/**
 * @param {String} functionName The name of the function when the log is generated
 * @param {String} tag The tag for the log
 * @param {String} msg Log message
 */
function MyLog(fuctionName, tag, msg){
    // replace LOGGING_SPREADSHEET_ID with a the id of a spreadsheet you own
    var debugSpreadSheetId = "0AvMHcjEoSoLRdERNMHhZODlQaGNndHhhZlczUzd1dVE";
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