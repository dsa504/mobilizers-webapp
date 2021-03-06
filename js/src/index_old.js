var spreadsheetData = [];
var mobilizers = [];
var programMembers = [];
var activeRow;
var activePMName;
var activePMPhone;
var activePMEmail;
var activePMAssignedDate;
var activePMStatus;
var activeMobilizerName;
var pw;

var columnMap = { // map of fields to spreadsheet columns
  mob_name : 0,
  pm_name : 1,
  pm_phone : 2,
  pm_email : 3,
  pm_assigned_date : 4,
  pm_assigned_status: 5,
  //status: 5,
  
  initial_text_sent : 7,
  initial_text_response : 8,
  call_made: 9,
  occupation: 10,
  skills:11,
  interests: 12,
  meetup_scheduled: 13,
  followup_text_sent: 14,
  attended_meetup: 15,
  met_pm: 16,
  add_to_slack : 17,
  marked_done: 18,
  sketch: 19
}

var output = { // data pushed to the spreadsheet
  initial_text_sent : '',
  initial_text_response : '',
  call_made: '',
  interests: '',
  occupation: '',
  skills:'',
  meetup_scheduled: '',
  followup_text_sent: '',
  attended_meetup: '',
  met_pm: '',
  add_to_slack : '',
  marked_done: '',
  sketch: ''
}

$(document).ready(function(){

  //login
  $('#login-button').click(function(e){
    e.preventDefault();
    google.script.run.withSuccessHandler(loginTrySuccess).tryLogin( $('#pw').val() );
  });
  
});

function initApp(){
  // get the sheet data
  getSpreadsheet();
  
  $('#mob_name').change(function(){ // update based on mobilizer choosen
    console.log("changing mobilizer...");
    $('#pm_name').empty();
    programMembers = [];
    populatePMs($(this).val());
  });
  
  $('#pm_name').change(setActive);// update based on program member choosen
  
  $('#intake_form').change(function(){ // every form action, parse and send the data to the sheet
    if(activeRow != 0 && activeRow != null){
      parseForm();
    }else{
      console.log("No program member selected :(");
    }
  });
  
  $('#mark_as_done').click(function(e){
    e.preventDefault();
    if( $(this).val() == "marked-done" ){
      $(this).val("marked-undone");
      $(this).removeClass("mdl-button--colored");
      $(this).html("Marked Done! (Click to undo)");
      google.script.run.withSuccessHandler(onDone).setStatus(columnMap, activeRow, "Marked Done", pw);
    }else{
      $(this).val("marked-done");
      $(this).addClass("mdl-button--colored");
      $(this).html("Mark as Done");
      google.script.run.withSuccessHandler(onDone).setStatus(columnMap, activeRow, "Open", pw);
    }
  });
}

// populate the "select mobilizer" dropdown
function populateMobilizers(){
  for(i = 1; i < spreadsheetData.length; ++i){
    mobilizers.push(spreadsheetData[i][columnMap['mob_name']]);
  };
  
  mobilizers = uniq(mobilizers);
  
  for(i = 0; i < mobilizers.length; ++i){
    //console.log(mobilizers[i]);
    $('#mob_name').append($('<option>', {value:mobilizers[i], text:mobilizers[i]}));
  };
};

// find the row we're editing
function setActive(){
  var activeMobilizer = $("#mob_name").val();
  activeMobilizerName = activeMobilizer;
  var activePM = $("#pm_name").val();
  
  if(activePM == 0 || activePM == null){
    
  }else{
  
  //console.log(activeMobilizer+" "+activePM);
  for(i = 1; i < spreadsheetData.length; ++i){
    if( spreadsheetData[i][columnMap['mob_name']] == activeMobilizer && spreadsheetData[i][columnMap['pm_name']] == activePM ){
      activeRow = i;
      console.log("Editing row "+i);
      
      // Update the Active Program Member 
      activePMName = spreadsheetData[i][columnMap['pm_name']];
      activePMPhone = spreadsheetData[i][columnMap['pm_phone']];
      activePMEmail = spreadsheetData[i][columnMap['pm_email']];
      activePMAssignedDate = spreadsheetData[i][columnMap['pm_assigned_date']];
      activePMStatus = spreadsheetData[i][columnMap['pm_assigned_status']];
      
      // Update the Active Program Member card
      $("#pm_name_out").html(activePMName);
      $("#pm_phone_out").html(activePMPhone);
      $("#pm_email_out").html(activePMEmail);
      $("#pm_assigned_date_out").html(activePMAssignedDate);
      var dueDate = moment(activePMAssignedDate).add(7, 'days').format('MM/DD/YYYY');

      $("#pm_due_date_out").html(dueDate);
      $("#pm_status_out").html(activePMStatus);
      
      populateForm();
      
      break;
    }
  }
  
  $(".login-card").show();
  $("#intake_form").addClass("form_on");
  }
  
}

//
// functions
//

// try login
function loginTrySuccess(data){
  console.log(data);
  var loginSnackbarContainer = document.querySelector('#login-snackbar');
  
  if(data == "OK"){
    //successful login
    var data = {
      message: 'Logging In!',
      timeout: 2000,
      actionHandler: function(event) {},
      actionText: 'OK'
    };
    pw = $('#pw').val();
    $('.login, .scrim').fadeOut();
    
    initApp();
    
  }else{
    //oops
    
    var data = {
      message: 'Sorry, Incorrect Password',
      timeout: 2000,
      actionHandler: function(event) {},
      actionText: 'OK'
    };
    
  }
  
  loginSnackbarContainer.MaterialSnackbar.showSnackbar(data);
}

// pull all data from the form to send to spreadsheet
function parseForm(){
  // basic inputs
  $('#intake_form [data-type="intake-el-text"]').each(function(){
    output[$(this).attr('id')] = $(this).val();
  });
  
  // bool inputs
  $('#intake_form [data-type="intake-el-bool"]').each(function(){
    if($(this).prop('checked')){
    output[$(this).attr('id')] = "True";
    }else{
    output[$(this).attr('id')] = "False";
    }
  });
  
  // radio inputs
  $('#intake_form [data-type="intake-el-radio"] input:checked').each(function(){
    output[$(this).attr('name')] = $(this).val();
  });
  
  //multi inputs
  var interests = [];
  $('#intake_form #interests :checked').each(function(){
    if($(this).val() == "Other"){
      interests.push( $('#intake_form #interests-other-text').val() );
    }else{
      interests.push( $(this).val() );
    }
  });
  output["interests"] = interests.join('|');
  
  var meetup_scheduled = [];
  $('#intake_form #meetup_scheduled :checked').each(function(){
    if($(this).val() == "Other"){
      meetup_scheduled.push( $('#intake_form #meetup_scheduled-other-text').val() );
    }else{
      meetup_scheduled.push( $(this).val() );
    }
  });
  output["meetup_scheduled"] = meetup_scheduled.join(', ');
  
  google.script.run.withSuccessHandler(onDataOut).updateSpreadsheet(columnMap, activeRow, output, pw);
  //console.log(output);
}

// populate the form with any pre-existing data from the spreadsheet
function populateForm(){  
  console.log("populating with imported form data...");
  //console.log(spreadsheetData[activeRow]);
  
  for(i = 7; i < spreadsheetData[activeRow].length; ++i){ //skip the program member details
    var dataID = getKeyByValue(columnMap, i); 
    
    
    if(dataID == "interests"){
      var interests = [];
      interests = spreadsheetData[activeRow][i].split('|'); // de-concatenate the interests field
      
      $('#interests input').not('[type="text"]').each(function(){
        if( interests.includes( $(this).val() ) ){
          document.querySelector("#"+$(this).attr('id') ).parentNode.MaterialCheckbox.check();
        }else{
          document.querySelector("#"+$(this).attr('id') ).parentNode.MaterialCheckbox.uncheck();
        }
       
        var index = interests.indexOf($(this).val()); // remove interests we've already checked
        if (index !== -1) interests.splice(index, 1);
        
      });
      
      if(interests.length>0){ // now whatever is left over must be from "other"
        if(interests.join().trim() != ""){
        document.querySelector("#interests-other-text").parentNode.MaterialTextfield.change( interests.join() );
        document.querySelector("#interests input[value='Other']").parentNode.MaterialCheckbox.check();
        }
      }
      
    };

    //bools
    var theEl = $("#"+dataID);
    
    if(theEl.data("type") === 'intake-el-bool'){
    
      var parentID = theEl.parent().attr('id');
      if(spreadsheetData[activeRow][i] == "TRUE"){
        document.querySelector("#"+parentID).MaterialCheckbox.check();
      }else {
        document.querySelector("#"+parentID).MaterialCheckbox.uncheck();
      }
      
    } else if(theEl.data("type") === 'intake-el-radio'){
      //var theVal = $(this).val();
      //console.log("VAL"+theVal);
      theEl.children('label').children('input').each(function(){
          if( spreadsheetData[activeRow][i] == $(this).val() ){
            document.querySelector("#"+$(this).attr('id')).parentNode.MaterialRadio.check();
          }else{
            document.querySelector("#"+$(this).attr('id')).parentNode.MaterialRadio.uncheck();
          }
      });
      
    } else if(theEl.data("type") === 'intake-el-text'){
      //theEl.val(spreadsheetData[activeRow][i]);
      document.querySelector("#"+dataID).parentNode.MaterialTextfield.change(spreadsheetData[activeRow][i]);
    }
    
     if(dataID == "meetup_scheduled"){
      if(spreadsheetData[activeRow][i] != "Meetup Scheduled" && spreadsheetData[activeRow][i] != "Can't/Not Interested"){
        document.querySelector("#meetup_scheduled-other-text").parentNode.MaterialTextfield.change( spreadsheetData[activeRow][i] );
        document.querySelector('#meetup_scheduled input[value="Other"]').parentNode.MaterialRadio.check();
       
      } else {
      document.querySelector('#meetup_scheduled input[value="Other"]').parentNode.MaterialRadio.checkToggleState();
        document.querySelector('#meetup_scheduled input[value="Other"]').parentNode.MaterialRadio.uncheck();
       document.querySelector("#meetup_scheduled-other-text").parentNode.MaterialTextfield.change( "" );
        
      }
    }
   

  }
  
  if(spreadsheetData[activeRow][columnMap["pm_assigned_status"]] == "Marked Done"){
      $("#mark_as_done").val("marked-undone");
      $("#mark_as_done").removeClass("mdl-button--colored");
      $("#mark_as_done").html("Marked Done! (Click to undo)");
  }else{
      $("#mark_as_done").val("marked-done");
      $("#mark_as_done").addClass("mdl-button--colored");
      $("#mark_as_done").html("Mark as Done");
  }
  
  // token replace the names
  var text = $('div, h3').replace(/\[program member name\]/gim, activePMName);
  var text = $('div, h3').replace(/\[your name\]/gim, activeMobilizerName);
  //console.log($('.speech-bubble-text').html());
}

function onDataOut(){
  console.log("out!");
}

// populate the "select program member" dropdown
function populatePMs(theValue){
  for(i = 1; i < spreadsheetData.length; ++i){
    if(spreadsheetData[i][columnMap['mob_name']] == theValue){
      programMembers.push(spreadsheetData[i][columnMap['pm_name']]);
    }
  };
  
  $('#pm_name').append($('<option>', {value:"", text:"Select an assigned program member..."}));
  for(i = 0; i < programMembers.length; ++i){
    console.log(programMembers[i]);
    $('#pm_name').append($('<option>', {value:programMembers[i], text:programMembers[i]}));
  };
  
}
// getter callback
function onGetSpreadsheetSuccess(data)
{
  //console.log(data);
  spreadsheetData = data;
  populateMobilizers();
};

// getter for the spreadsheet data
function getSpreadsheet(){
  google.script.run.withSuccessHandler(onGetSpreadsheetSuccess).getSpreadsheet(pw);
};

// callback for done status
function onDone(status){

    var snackbarContainer = document.querySelector('#snackbar');
  
    var data = {
      message: 'Status set to '+status,
      timeout: 2000,
      actionHandler: function(event) {},
      actionText: 'OK'
    };
    snackbarContainer.MaterialSnackbar.showSnackbar(data);
}

// utils

function uniq(a) {
    var prims = {"boolean":{}, "number":{}, "string":{}}, objs = [];

    return a.filter(function(item) {
        var type = typeof item;
        if(type in prims)
            return prims[type].hasOwnProperty(item) ? false : (prims[type][item] = true);
        else
            return objs.indexOf(item) >= 0 ? false : objs.push(item);
    });
};

function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}

// Gary Haran => gary@talkerapp.com
// This code is released under MIT licence
(function($){
  var replacer = function(finder, replacement, element, blackList) {
    if (!finder || typeof replacement === 'undefined') {
      return
    }
    var regex = (typeof finder == 'string') ? new RegExp(finder, 'g') : finder;

    var childNodes = element.childNodes;
    var len = childNodes.length;

    var list = typeof blackList == 'undefined' ? 'html,head,style,title,link,meta,script,object,iframe,pre,a,' : blackList ;

    while (len--) {
      var node = childNodes[len];

      if (node.nodeType === 1 && true || (list.indexOf(node.nodeName.toLowerCase()) === -1)) {
        replacer(finder, replacement, node, list);
      }

      if (node.nodeType !== 3 || !regex.test(node.data)) {
        continue;
      }

      var frag = (function(){
        var html = node.data.replace(regex, replacement);
        var wrap = document.createElement('span');
        var frag = document.createDocumentFragment();

        wrap.innerHTML = html;

        while (wrap.firstChild) {
          frag.appendChild(wrap.firstChild);
        }

        return frag;
      })();

      var parent = node.parentNode;
      parent.insertBefore(frag, node);
      parent.removeChild(node);
    }
  }

  $.fn.replace = function(finder, replacement, blackList) {
    return this.each(function(){
      replacer(finder, replacement, $(this).get(0), blackList);
    });
  }
})(jQuery);
