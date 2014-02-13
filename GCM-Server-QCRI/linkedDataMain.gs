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