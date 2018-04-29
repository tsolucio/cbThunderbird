//alertMessage("---------------- BEGIN colvtiger.js -------------");

var columnHandler = {
   getCellText:         function(row, col) {
      //get the message's header so that we can extract the field
      var key = gDBView.getKeyAt(row);
      var hdr = gDBView.db.GetMsgHdrForKey(key);
      
      return hdr.getStringProperty("V");
   },
   
   getSortStringForRow: function(hdr) {
	   return hdr.getStringProperty("V");
   },
   
   isString:            function() {return true;},

   getCellProperties:   function(row, col, props){},
   getRowProperties:    function(row, props){},
   getImageSrc:         function(row, col) {return null;},
   getSortLongForRow:   function(hdr) {return 0;}
}

function addCustomColumnHandler() {
	   gDBView.addColumnHandler("colvtiger", columnHandler);
	   //alertMessage("Column handler being added: " + dump(columnHandler) + "\n");
}

var CreateDbObserver = {
  // Components.interfaces.nsIObserver
  observer: function(aMsgFolder, aTopic, aData)
  {
	//alertMessage("HERE HERE!");
     addCustomColumnHandler();
  }
}

function doOnceLoaded() {
  var ObserverService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
  ObserverService.addObserver(CreateDbObserver, "MsgCreateDBView", false);
  window.document.getElementById('folderTree').addEventListener("select",addCustomColumnHandler,false);
}

window.addEventListener("load", doOnceLoaded, false);
//alertMessage("---------------- END colvtiger.js -------------");