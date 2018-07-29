var SPREADSHEET_ID = '1NCD1ejYrJNGpD7qO5jUCHod_kVPB_IN8YUkVyyy4bO4';
var appPw = 'petitcomite';
var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
var worksheet = spreadsheet.getSheets()[0];
var rows;
 
function getSpreadsheet(pw){
  if(pw == appPw){
    rows = worksheet.getDataRange()
      .getDisplayValues();
    //Logger.log(rows);
    return rows;
  } else { throw "Not Logged In."};
};


function updateSpreadsheet(columnMap, row, data, pw){
  if(pw == appPw){
    for (var key in data) {
      var column = parseInt(columnMap[key]);
      //Logger.log(key+" "+column);
      worksheet.getRange(row+1, column+1, 1, 1).setValues([[data[key]]]);
    }
    return "done";
  } else { throw "Not Logged In."};
}

function setStatus(columnMap, row, status ,pw){
  if(pw == appPw){
    var column = parseInt(columnMap["pm_assigned_status"]);
    worksheet.getRange(row+1, column+1, 1, 1).setValues([[status]]);
    return status;
  } else { throw "Not Logged In."};
}

function tryLogin(pw){
  if(pw == appPw){
    loggedIn = true;
    return "OK";
  } else {
    return "NOPE";
  }
}

function doGet() {
  //var page HtmlService.createHtmlOutputFromFile('Form');
  //return page.getContent();
  
  var page = HtmlService.createTemplateFromFile('Form');
  //page.addMetaTag('viewport', 'width=device-width, initial-scale=1');
  //return page.evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  return page.evaluate().setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);

}
//var output = HtmlService.createHtmlOutput('<b>Hello, world!</b>');
//output.addMetaTag('viewport', 'width=device-width, initial-scale=1');