/* ********************************************************************************
* The contents of this file are subject to the vtiger CRM Public License Version 1.0
 * ("License"); You may not use this file except in compliance with the License
 * The Original Code is:  vtiger CRM Open Source
 * The Initial Developer of the Original Code is vtiger.
 * Portions created by vtiger are Copyright (C) vtiger.
 * All Rights Reserved.
*
******************************************************************************* */

// Load the vtiger.properties string file
var bundles = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService);
var myBundle = bundles.createBundle("chrome://vtiger/vtiger.properties");

var gvtABName, nsIndex;
var gvtABURL = "";
const cvtPABDirectory  = 2;

function load_ab() {
	
  	var meter = document.getElementById('impprog');
  	var lbl = document.getElementById('lblimpcontacts');
  	meter.hidden = true; lbl.hidden = true;
  	
	let abManager = Components.classes["@mozilla.org/abmanager;1"].getService(Components.interfaces.nsIAbManager);  
	let allAddressBooks = abManager.directories;
	
	let i = 0;
	while (allAddressBooks.hasMoreElements()) {  
		let addressBook = allAddressBooks.getNext();
		if (addressBook instanceof Components.interfaces.nsIAbDirectory) { // or nsIAbCollection or nsIAbDirectory
 				
			var menupopelmnt = document.getElementById("impopup");	

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
	document.getElementById('impablist').selectedIndex = nsIndex;
	document.getElementById('impablist').focus();
}

function get_vtigerABURL() {
	var aName, idx, URL;
	idx = document.getElementById('impablist').selectedIndex;
	// If user has edited the address book entry we need to create a new address book	
	if (idx != -1) {
		URL = document.getElementById('impablist').getItemAtIndex(idx).value;
		return URL;
	} else {
		aName = document.getElementById('impablist').value;
		URL = CreateNewAddressBook(aName);
		return URL;
	}
}

//this method is the intial point to create import contacts from vtigerCRM
function create_vtigerABURL() {
	if(trim(document.getElementById("impablist").value) != "") {
		gvtABURL = get_vtigerABURL();

		if(gvtABURL == "") {
			//vtigerCRMAB not created then create AB for vtigerCRM
			CreateNewAddressBook(gvtABName);
			gvtABURL = get_vtigerABURL();
		}

		var disbleImpButton = document.getElementById("impbutton");
		disbleImpButton.setAttribute("disabled","true");
		//create_cardinvtigerAB();
		getContacts();
		disbleImpButton.setAttribute("disabled","false");
		window.close();
	} else {
		alertMessage(myBundle.GetStringFromName("PlseSpecAddBook"));
	}
}

function CreateNewAddressBook(aName) {
	var URL; var kPABDirectory = 2; // Defined in nsDirPrefs.h

	var aBook = Components.classes["@mozilla.org/abmanager;1"].getService(Components.interfaces.nsIAbManager).newAddressBook(aName, "", kPABDirectory);
	
	let abManager = Components.classes["@mozilla.org/abmanager;1"].getService(Components.interfaces.nsIAbManager);  
	let allAddressBooks = abManager.directories;
	
	while (allAddressBooks.hasMoreElements()) {  
		let addressBook = allAddressBooks.getNext();
		if (addressBook instanceof Components.interfaces.nsIAbDirectory) {
			if(addressBook.dirName == aName) {
				URL = addressBook.URI;
				return URL;
			}
		}  
	}
	alertMessage(myBundle.formatStringFromName("ErrCrtAddBook", [aName], 1));
}

//Gets all Contacts from vtiger in an incremental fashion to cater for large numbers of Contacts.
//TODO Might be nice to add a "WHERE" clause facility
function getContacts() {
	//alertMessage("getcontacts!");
	init(vtigerPreferences.getCharPref("Settings.Conf.vtigerURL"));
	reuseSession();

	// display progress meter
	var meter = document.getElementById('impprog');
	var lbl = document.getElementById('lblimpcontacts');
	meter.hidden = false; lbl.hidden = false;
	var bMsg = myBundle.GetStringFromName("vtHasNoCon");
	
	client.setAsync(false);
	
	// Get the number of Contacts that would be returned first
	var ContactCount = 0;
	var aMsg = myBundle.GetStringFromName("ErrRowCnt");
	client.query("SELECT count(*) FROM Contacts;",
		handleError(function(numRows) {
			ContactCount = numRows[0]['count'];
		},aMsg)
	);

	// m is a simple counter, incr is the amount to retrieve each time round the loop.
	// The vtiger REST interface only returns a max of 100 records per query.
	var m = 0; var incr = 50; var remainder = ContactCount % incr;
	if (remainder == 0) remainder = incr; // remainder is used for user notification
	while (m <= ContactCount) {
		client.query("SELECT * FROM Contacts LIMIT " + m + "," + incr + ";",
			handleError(function(contactResult) {
				try	{
					if(contactResult.length > 0) {
						
	                    // Get a list of Account IDs
						var accntids = '';
						var accArray = [];
	                    for(var i = 0; i < contactResult.length; i++) {
	                        if (contactResult[i]['account_id']) {
	                        	accntids += contactResult[i]['account_id']+',';
	                        }
	                    }
	                    accntids = accntids.slice(0, -1)
	                    accntids = "(" + accntids + ")";

	                    // Get the Account names
	                    client.query("SELECT accountname FROM Accounts WHERE id IN " + accntids + ";", 
	                        handleError(function(accountResult) {
	                            var aMsg = myBundle.GetStringFromName("NoRelCo");
	                            accArray = accountResult;
	                        },aMsg)
	                    );
		                
	                    // Replace ids with Account Names 
	                    for(var i = 0; i < contactResult.length; i++) {
	                    	var acc = contactResult[i]['account_id'];
	                    	for (var id in accArray) {
	                    		if (acc == accArray[id]['id']){
	                    			contactResult[i]['account_id'] = accArray[id]['accountname'];	                    			
	                    		}
	                    	}
	                    }
	                    
	                    // Now write this chunk to the Address Book
	                	//alertMessage("populate");
	                    populate_ABcard(contactResult,{});

						if ((m + incr) < ContactCount) {
							var imported = m + incr;
						} else {
							var imported = m + remainder;
							meter.value = 100;
							notify(myBundle.formatStringFromName("SuccImport", [imported, ContactCount], 2));
							// alertMessage("Successfully imported " + imported + " of " + ContactCount + " contacts from vtiger CRM");
						}
						lbl.value = myBundle.formatStringFromName("ImpCon", [imported, ContactCount], 2);
						// lbl.value = "Importing " + imported + " of " + ContactCount + " contacts...";
						meter.value = Math.floor((imported / ContactCount)*100);
					} else {
						alertMessage(myBundle.GetStringFromName("CantImpCon"));
						// alertMessage("Cannot import contacts as vtiger CRM has no contact");
					}
				} catch(errorObject) {
					alertMessage(myBundle.GetStringFromName("ParseErr"));
					// alertMessage("Error while parsing response from the vtiger CRM server");
				}
			},bMsg)
		);
	m = m + incr;
	}
}

//Populate the address book card with fetched data from crm
function populate_ABcard(contactResult) {
	//alertMessage("in populate");
	//Undefined fields will not be entered in addressbook card.
	function updateEntityContact(abCard,attributeName,fieldName) {
		if(typeof contact[fieldName] !='undefined'){
			abCard.setProperty(attributeName,phpJS.html_entity_decode(contact[fieldName]));
		}
	}
	
	var itemLength = contactResult.length;
	var abManager = Components.classes["@mozilla.org/abmanager;1"].getService(Components.interfaces.nsIAbManager);  
	var addressBook = abManager.getDirectory(gvtABURL);

	var phpJS = new PHP_JS();
	for(var i =0;i<itemLength;++i) {
		var contact = contactResult[i];
		var ObjAbcard = Components.classes["@mozilla.org/addressbook/cardproperty;1"].createInstance(Components.interfaces.nsIAbCard);
		
		updateEntityContact(ObjAbcard,'FirstName','firstname');
		updateEntityContact(ObjAbcard,'LastName','lastname');
		updateEntityContact(ObjAbcard,'PrimaryEmail','email');
		updateEntityContact(ObjAbcard,'WorkCity','mailingcity');
		updateEntityContact(ObjAbcard,'JobTitle','title');
		updateEntityContact(ObjAbcard,'CellularNumber','mobile');
		updateEntityContact(ObjAbcard,'WorkAddress','mailingstreet');
		updateEntityContact(ObjAbcard,'WorkState','mailingstate');
		updateEntityContact(ObjAbcard,'WorkZipCode','mailingzip');
		updateEntityContact(ObjAbcard,'WorkCountry','mailingcountry');
		updateEntityContact(ObjAbcard,'HomeCity','othercity');
		updateEntityContact(ObjAbcard,'HomeAddress','otherstreet');
		updateEntityContact(ObjAbcard,'HomeState','otherstate');
		updateEntityContact(ObjAbcard,'HomeZipCode','otherzip');
		updateEntityContact(ObjAbcard,'HomeCountry','othercountry');
		updateEntityContact(ObjAbcard,'WorkPhone','phone');
		updateEntityContact(ObjAbcard,'HomePhone','homephone');
		updateEntityContact(ObjAbcard,'FaxNumber','fax');
		updateEntityContact(ObjAbcard,'Department','department');
		updateEntityContact(ObjAbcard,'Notes','description');		
		updateEntityContact(ObjAbcard,'Company','account_id');		
		
		var dName = ObjAbcard.getProperty('FirstName', "") + " " + ObjAbcard.getProperty('LastName', "");
		ObjAbcard.setProperty('DisplayName', dName);

		//create new card in Address Book
		addressBook.addCard(ObjAbcard);
	}
}
