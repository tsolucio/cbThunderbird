//$Id:
/* ********************************************************************************
* The contents of this file are subject to the vtiger CRM Public License Version 1.0
 * ("License"); You may not use this file except in compliance with the License
 * The Original Code is:  vtiger CRM Open Source
 * The Initial Developer of the Original Code is vtiger.
 * Portions created by vtiger are Copyright (C) vtiger.
 * All Rights Reserved.
*
******************************************************************************* */
var gvtABName = ""; var gvtABURL = ""; var gErrMsg=""; var nsIndex;

//Load the vtiger.properties string file
var bundles = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService);
var myBundle = bundles.createBundle("chrome://vtiger/locale/vtiger.properties");

// Get the URI of vtigercrm Addressbook
function load_expab() {		
	
  	var meter = document.getElementById('expprog');
  	var lbl = document.getElementById('lblexpcontacts');
  	meter.hidden = true; lbl.hidden = true;
  	
	let abManager = Components.classes["@mozilla.org/abmanager;1"].getService(Components.interfaces.nsIAbManager);  
	let allAddressBooks = abManager.directories;
	
	let i = 0;
	while (allAddressBooks.hasMoreElements()) {  
		let addressBook = allAddressBooks.getNext();
		if (addressBook instanceof Components.interfaces.nsIAbDirectory) { // or nsIAbCollection or nsIAbDirectory
 				
			var menupopelmnt = document.getElementById("expopup");	

			if(addressBook.dirName!="") {
				var typechild = document.createElement('menuitem');
				typechild.setAttribute('label',addressBook.dirName);
				typechild.setAttribute('value',addressBook.URI);
				menupopelmnt.appendChild(typechild);
				if(addressBook.URI == opener.gselecteddir) {
					nsIndex = i;
				}
				i = i + 1;
			}
		}  
	} 
	document.getElementById('expablist').selectedIndex = nsIndex;
	document.getElementById('expablist').focus();
}

// Intial method for exporting Address Book Cards to vtiger CRM
function export_vtigerABURL()
{
	if(document.getElementById("expablist").selectedItem.value != "")
	{
		gvtABURL = document.getElementById("expablist").selectedItem.value;
	}else
	{
		alertMessage(myBundle.GetStringFromName("SelAddBook"));
		return;
	}

	var disbleExpButton = document.getElementById("expbutton");
	
	//Disable the export button whilst exporting to CRM.
	disbleExpButton.setAttribute("disabled","true");
	get_vtigercrmcards(gvtABURL);
	disbleExpButton.setAttribute("disabled","false");
	window.close();
}

// Get the card count
function get_cardCount(expAburl) {
	let abManager = Components.classes["@mozilla.org/abmanager;1"].getService(Components.interfaces.nsIAbManager);  
	let addressBook = abManager.getDirectory(expAburl);
	
	let abCards = addressBook.childCards;
	let abCardsCount = 0;
	
	while (abCards.hasMoreElements()) {
		let abCard = abCards.getNext();
		if (abCard instanceof Components.interfaces.nsIAbCard && !abCard.isMailList) {
			abCardsCount ++;
		}
	}
	return abCardsCount;
}

function get_vtigercrmcards(expAburl) {
	var successFlag; var abCardsCount; var count;
  	var meter = document.getElementById('expprog');
  	var lbl = document.getElementById('lblexpcontacts');
  	meter.hidden = false; lbl.hidden = false;

  	abCardsCount = get_cardCount(expAburl);
  	lbl.value = myBundle.formatStringFromName("ExpNumCons", [abCardsCount], 1);
	//lbl.value = "Exporting " + abCardsCount + " contacts...";

	try {
		init(vtigerPreferences.getCharPref("Settings.Conf.vtigerURL"));
		reuseSession();
		client.setAsync(false);	

		let abManager = Components.classes["@mozilla.org/abmanager;1"].getService(Components.interfaces.nsIAbManager);  
		let addressBook = abManager.getDirectory(expAburl);
		
		let abCards = addressBook.childCards;
		
		count = 0;
		while (abCards.hasMoreElements()) {
			let abCard = abCards.getNext();
			if (abCard instanceof Components.interfaces.nsIAbCard && !abCard.isMailList) {
				var contact = new Object();
				if((abCard.lastName != '') || (abCard.displayName != '') || (abCard.getProperty('NickName', "") != '') || (abCard.primaryEmail != '')) {
					contact['firstname'] = abCard.firstName;
					if(abCard.lastName) {
						contact['lastname'] = abCard.lastName;
					} else if (abCard.displayName) {
						contact['lastname'] = abCard.displayName;
					} else if (abCard.getProperty('NickName')) {
						contact['lastname'] = abCard.getProperty('NickName');
					} else if (abCard.primaryEmail) {
						var emailname = abCard.primaryEmail;
						if(emailname.indexOf("@") > -1){
							emailname = emailname.substring(0,emailname.indexOf("@"));
						}
						contact['lastname'] = emailname;
					}
				}
				
				let mail = validate_email(abCard.primaryEmail);
				contact['email'] = mail;
				
				//Skipping company name information when the company is not present in CRM			
				let companyName = abCard.getProperty('Company', "");
				var aMsg = myBundle.GetStringFromName("CoNotPresent");
				if(companyName){	
					client.query("SELECT id FROM Accounts WHERE accountname='" + companyName + "';",
						handleError(function(Id){
							if(Id.length > 0){
								Id = Id[0]['id'];
							}else{
								Id = null;
							}
							if(Id === null || Id === 'null'){
								contact['account_id'] = '';
							}else{
								contact['account_id'] = Id;
							}
						},aMsg)
					);
				}else{
					contact['account_id'] = '';
				}
	
				contact['salutationtype'] = '';
				contact['title'] = abCard.getProperty('JobTitle', "");
				contact['mobile'] = abCard.getProperty('CellularNumber', "");
				contact['mailingstreet'] = abCard.getProperty('WorkAddress', "") + " " + abCard.getProperty('WorkAddress2', "");
				contact['mailingcity'] = abCard.getProperty('WorkCity', "");
				contact['mailingstate'] = abCard.getProperty('WorkState', "");
				contact['mailingzip'] = abCard.getProperty('WorkZipCode', "");
				contact['mailingcountry'] = abCard.getProperty('WorkCountry', "");
				contact['otherstreet'] = abCard.getProperty('HomeAddress', "") + " " + abCard.getProperty('HomeAddress2', "");
				contact['othercity'] = abCard.getProperty('HomeCity', "");
				contact['otherstate'] = abCard.getProperty('HomeState', "");
				contact['otherzip'] = abCard.getProperty('HomeZipCode', "");
				contact['othercountry'] = abCard.getProperty('HomeCountry', "");
				contact['phone'] = abCard.getProperty('WorkPhone', "");
				contact['homephone'] = abCard.getProperty('HomePhone', "");
				contact['fax'] = abCard.getProperty('FaxNumber', "");
				contact['department'] = abCard.getProperty('Department', "");
				contact['description'] = abCard.getProperty('Notes', "");
				if( abCard.getProperty('BirthYear',"") != "" && abCard.getProperty('BirthMonth',"") != "" && abCard.getProperty('BirthDay',"") != "") { 
					contact['birthday'] = abCard.getProperty('BirthYear',"") + "-" + abCard.getProperty('BirthMonth',"") + "-" + abCard.getProperty('BirthDay',"");
				}
				try {
					contact["assigned_user_id"] = client.getUserId();
					
					if(validate('Contacts')) {
						//save information using REST API's 	
						try {
							createAndCheck(contact,"Contacts",function(status,result) {
								if(status) {
									//TODO nothing to do, continue.
									successFlag = true;
									count ++;
								} else {
									if(result['code'] == 'ACCESS_DENIED') {
										alertMessage(myBundle.formatStringFromName("expFail", [result['code'], result['message']], 2));
										//alertMessage('Can\'t Export Contacts, Server returned Error\nErrorCode: ' + result['code'] + '\nMessage: ' + result['message']);
										successFlag = false;
									} else {
										errContacts = errContacts + 1;
									}
								}
							})
							//if write permission is denied then we don't check same permission for other record in address book.
							if(successFlag == false) {
								break;
							}
						} catch(errorObject) {
							alertMessage(errorObject);
							return;
						}
					} else {
						alertMessage(myBundle.GetStringFromName("ConNoExp"));
					}
				} catch(errorObject) {
					alertMessage(myBundle.GetStringFromName("ParseErr"));						
				}
			} // End of if
			meter.value = Math.floor((count / abCardsCount)*100);
		} // While loop 
	   	notify(myBundle.formatStringFromName("ConExpSuccess", [abCardsCount], 1));
	   	updateSession();
	} catch(ex) {
		if(count == 0)	{
			alertMessage(myBundle.GetStringFromName("NoContact"));
		}
	}
}
