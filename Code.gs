// a wrapper for an automated github commit call using github REST API
// to save a particular json file to a github repo hosting a 
// github pages website.

//  called with a timed trigger every day, 
// in case the data is updated.

// dataarray - [fileidofsourcesheet, sheetname, htmltemplate, githubrepopath, githubtoken ]

// const dataarray = ['1VWojiUgFg5ucSPJBdtkUbVcZR7Ww0GR3QVEwSLdNsoQ', 
//     'ValuableVolunteers','VV', 'SriSathyaSaiVidyaVahini/VV',githubtoken];
//const fileidofsourcesheet = dataarray[0];


const tempfolder = DriveApp.getFolderById(tempfolderid);


function pushtogithub() {
  var jsontextoutput = HtmlService.createTemplateFromFile(templateFilename).evaluate();

  //delete previous copies of the file if any
  var files = tempfolder.getFilesByName("test.json");
  while (files.hasNext()) {
    files.next().setTrashed(true);
  }

  tempfolder.createFile("test.json", jsontextoutput, "application/json");
  doUpload(jsontextoutput, "program/data/test.json", githubtoken );  
}

// function getDataVV() {
//   var sheet = SpreadsheetApp.openById(fileidofsourcesheetVV).getSheetByName('ValuableVolunteers');
//   return sheet.getDataRange().getValues();
// }

function getData(fileidofsourcesheet,sheetname) {
  var sheet = SpreadsheetApp.openById(fileidofsourcesheet).getSheetByName(sheetname);
  return sheet.getDataRange().getValues();
}

function getshavalue(shafilename){
  var files = tempfolder.getFilesByName(shafilename);
  if (files.hasNext()) {
    var file = files.next();
    var shavalue = file.getBlob().getDataAsString();
    return shavalue;
  }
  return '';
}

function doUpload(file_git, expfilename, token) {
  var shafilename = 'shahash-' + expfilename.substr(3) + '.txt';
  var shavalue = getshavalue(shafilename);
  //var file = DriveApp.getFileById(expfilename);
  //var file_git = file.getBlob().getDataAsString();
  
  var data_git = {
    'sha': shavalue,
    'message': 'adding ' + expfilename,
    'content': Utilities.base64Encode(file_git),
    'committer': {
      'name': 'pushToGithub',
      'email': 'SriSathyaSaiVidyaVahini@users.noreply.github.com'
    }
  };
  
  var data_string_git = JSON.stringify(data_git);
  
  var options = {
    'method': 'PUT',
    'payload': data_string_git,
    'headers': {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 YaBrowser/19.9.3.314 Yowser/2.5 Safari/537.36',
      'Authorization': 'token ' + token
    }
  };
  
  var url = 'https://api.github.com/repos/SriSathyaSaiVidyaVahini/SSSVV-landing/contents/' + expfilename;
  var response = UrlFetchApp.fetch(url, options);
  
  var p_git = JSON.parse(response.getContentText());
  Logger.log("Done.");
  
  var shablob = Utilities.newBlob(p_git.content.sha, 'text/plain', shafilename);
  // delete all copies of shafilename if they exist
  var files = tempfolder.getFilesByName(shafilename);
  while (files.hasNext()) {
    files.next().setTrashed(true);
  }
  // and then create shafilename
  tempfolder.createFile(shablob);
}

