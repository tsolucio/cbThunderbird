/* ********************************************************************************
* The contents of this file are subject to the vtiger CRM Public License Version 1.0
 * ("License"); You may not use this file except in compliance with the License
 * The Original Code is:  vtiger CRM Open Source
 * The Initial Developer of the Original Code is vtiger.
 * Portions created by vtiger are Copyright (C) vtiger.
 * All Rights Reserved.
******************************************************************************* */

//Load the vtiger.properties string file
var bundles = Components.classes['@mozilla.org/intl/stringbundle;1'].getService(Components.interfaces.nsIStringBundleService);
var myBundle = bundles.createBundle('chrome://vtiger/locale/vtiger.properties');

var gselecteddir = '';
var card = new Object();
var lcards, mail, companyName, i, card_count;

function get_selected_export() {
	//to get selected address book directory to import and export to that address book
	gselecteddir = GetSelectedDirectory();
	window.openDialog('chrome://vtiger/content/exportab.xul', '', 'chrome,resizable=no,titlebar,modal,centerscreen');
}

function get_selected_import() {
	//to get selected address book directory to import and export to that address book
	gselecteddir = GetSelectedDirectory();
	window.openDialog('chrome://vtiger/content/importab.xul', '', 'chrome,resizable=no,titlebar,modal,centerscreen');
}

function addSelectedContacts() {
	updateSession();
	card_count = 0;
	if (check_permit('Contacts')) {
		lcards = GetSelectedAbCards();
		if (!lcards.length) {
			alertMessage(myBundle.GetStringFromName('AddBookEmp'));
		}
		try	{
			for (i=0; i<lcards.length; i++) {
				card = lcards[i];
				if ((card.lastName != '') || (card.displayName != '') || (card.getProperty('NickName', '') != '') || (card.primaryEmail != '')) {
					var contact = new Object();

					//Skipping company name information when the company is not present in CRM
					companyName = card.getProperty('Company', '');
					if (companyName) {
						var aMsg = myBundle.GetStringFromName('CoNotPresent');
						client.query('SELECT id FROM Accounts WHERE accountname=\'' + companyName + '\';',
							handleError(function (Id) {
								if (Id.length > 0) {
									Id = Id[0]['id'];
								} else {
									Id = null;
								}
								if (Id === null || Id === 'null') {
									contact['account_id'] = '';
								} else {
									contact['account_id'] = Id;
								}
							}, aMsg)
						);
					} else {
						contact['account_id'] = '';
					}
					mail = validate_email(card.primaryEmail);

					//If lastname is not available in addressbook card, it will be taken from displayname,nickname or primaryemail to add the record in crm.
					if (card.lastName) {
						contact['lastname'] = card.lastName;
					} else if (card.displayName) {
						contact['lastname'] = card.displayName;
					} else if (card.getProperty('NickName', '')) {
						contact['lastname'] = card.getProperty('NickName', '');
					} else if (card.primaryEmail) {
						var emailname = card.primaryEmail;
						if (emailname.indexOf('@') > -1) {
							emailname = emailname.substring(0, emailname.indexOf('@'));
						}
						contact['lastname'] = emailname;
					}
					contact['email'] = mail;
					contact['firstname'] = card.firstName;
					contact['salutationtype'] = '';
					contact['title'] = card.getProperty('JobTitle', '');
					contact['mobile'] =  card.getProperty('CellularNumber', '');
					contact['mailingstreet'] = card.getProperty('WorkAddress', '') + ' ' + card.getProperty('WorkAddress2', '');
					contact['mailingcity'] = card.getProperty('WorkCity', '');
					contact['mailingstate'] = card.getProperty('WorkState', '');
					contact['mailingzip'] = card.getProperty('WorkZipCode', '');
					contact['mailingcountry'] = card.getProperty('WorkCountry', '');
					contact['otherstreet'] = card.getProperty('HomeAddress', '') + ' ' + card.getProperty('HomeAddress2', '');
					contact['othercity'] = card.getProperty('HomeCity', '');
					contact['otherstate'] = card.getProperty('HomeState', '');
					contact['otherzip'] = card.getProperty('HomeZipCode', '');
					contact['othercountry'] = card.getProperty('HomeCountry', '');
					contact['phone'] = card.getProperty('WorkPhone', '');
					contact['homephone'] = card.getProperty('HomePhone', '');
					contact['fax'] = card.getProperty('FaxNumber', '');
					contact['department'] = card.getProperty('Department', '');
					contact['description'] = card.getProperty('Notes', '');
					if ( card.getProperty('BirthYear', '') != '' && card.getProperty('BirthMonth', '') != '' && card.getProperty('BirthDay', '') != '') {
						contact['birthday'] = card.getProperty('BirthYear', '') + '-' + card.getProperty('BirthMonth', '') + '-' + card.getProperty('BirthDay', '');
					}
					contact['assigned_user_id'] = client.getUserId();

					if (validate('Contacts')) {
						try	{
							createAndCheck(contact, 'Contacts', handleError(
								function (result) {
									card_count++;
									var aMsg = myBundle.formatStringFromName('AddContactFailed', [contact['firstname'], contact['lastname']], 2);
								}, aMsg)
							);
						} catch (errorObject) {
							alertMessage(errorObject);
							return;
						}
					} else {
						var bMsg = myBundle.GetStringFromName('Contact');
						alertMessage(myBundle.formatStringFromName('AddFailed2', [card.displayName, bMsg], 2));
					}
				} else {
					if (card.displayName != '') {
						alertMessage(myBundle.formatStringFromName('UnToAdd', [card.displayName], 1));
						//alertMessage("Unable to add " + card.displayName + " as some of the mandatory fields are missing. Click ok to continue.");
					} else {
						var bMsg = myBundle.GetStringFromName('Contact');
						alertMessage(myBundle.formatStringFromName('UnToAdd', [bMsg], 1));
						//alertMessage("Unable to add the Contact(s) as some of the mandatory fields are missing.Click ok to continue.");
					}
				}
			}
		} catch (ex) {
			if (gErrMsg!='') {
				alertMessage(gErrMsg);
			}
		}
		if (card_count >= 1)	{
			if (card_count == 1) {
				var bMsg = myBundle.GetStringFromName('Contact');
				notify(myBundle.formatStringFromName('AddSuccess', [bMsg], 1));
				//alertMessage(card_count+" contact added successfully");
				updateSession();
			} else {
				var bMsg = myBundle.GetStringFromName('Contacts');
				notify(myBundle.formatStringFromName('AddSuccess', [bMsg], 1));
				//alertMessage(card_count+" contacts added successfully");
				updateSession();
			}
		}
	}
}

function addSelectedLeads() {
	checkSession();
	card_count = 0;

	if (check_permit('Leads')) {
		lcards = GetSelectedAbCards();
		if (!lcards.length) {
			alertMessage(myBundle.GetStringFromName('AddBookEmp'));
			//alertMessage("Nothing selected or Addressbook empty");
		}
		try {
			for (i=0; i<lcards.length; i++) {
				card = lcards[i];
				var lead = new Object();
				//If lastname is not available in addressbook card, it will be taken from displayname,nickname or primaryemail to add the record in crm.
				if (card.lastName) {
					lead['lastname'] = card.lastName;
				} else if (card.displayName) {
					lead['lastname'] = card.displayName;
				} else if (card.getProperty('NickName', '')) {
					lead['lastname'] = card.getProperty('NickName', '');
				} else if (card.primaryEmail) {
					var emailname = card.primaryEmail;
					if (emailname.indexOf('@') > -1) {
						emailname = emailname.substring(0, emailname.indexOf('@'));
					}
					lead['lastname'] = emailname;
				}
				lead['email'] = validate_email(card.primaryEmail);
				lead['firstname'] = card.firstName;
				lead['company'] = card.getProperty('Company', '');
				lead['salutationtype'] = '';
				lead['designation'] = card.getProperty('JobTitle', '');
				lead['mobile'] =  card.getProperty('CellularNumber', '');
				lead['lane'] = card.getProperty('WorkAddress', '') + ' ' + card.getProperty('WorkAddress2', '');
				lead['city'] = card.getProperty('WorkCity', '');
				lead['state'] = card.getProperty('WorkState', '');
				lead['code'] = card.getProperty('WorkZipCode', '');
				lead['country'] = card.getProperty('WorkCountry', '');
				lead['phone'] = card.getProperty('WorkPhone', '');
				lead['fax'] = card.getProperty('FaxNumber', '');
				lead['description'] = card.getProperty('Notes', '');
				if (card.getProperty('WebPage1', '') != '') {
					lead['website'] = cleanURI(card.getProperty('WebPage1', ''));
				} else if (card.getProperty('WebPage2', '') != '') {
					lead['website'] = cleanURI(card.getProperty('WebPage2', ''));
				}
				lead['assigned_user_id'] = client.getUserId();

				if (validate('Leads')) {
					//save information using REST API's
					var aMsg = myBundle.GetStringFromName('LeadCrFailed');
					try	{
						createAndCheck(lead, 'Leads', handleError(
							function (result) {
								card_count++;
							}, aMsg)
						);
					} catch (errorObject) {
						alertMessage(errorObject);
						return;
					}
				} else {
					var bMsg = myBundle.GetStringFromName('Lead');
					alertMessage(myBundle.formatStringFromName('AddFailed2', [card.displayName, bMsg], 2));
					//alertMessage(card.displayName+" can not be added as lead to CRM");
				}
			}
		} catch (ex) {
			if (gErrMsg!='') {
				alertMessage(gErrMsg);
			}
		}
		if (card_count >= 1)	{
			if (card_count == 1) {
				var bMsg = myBundle.GetStringFromName('Lead');
				notify(myBundle.formatStringFromName('AddSuccess', [bMsg], 1));
				//alertMessage(card_count+" Lead added successfully");
			} else {
				var bMsg = myBundle.GetStringFromName('Leads');
				notify(myBundle.formatStringFromName('AddSuccess', [bMsg], 1));
				//alertMessage(card_count+" Leads added successfully");
			}
		}
	}
}

function checkContactView_perm() {
	checkSession();

	init(vtigerPreferences.getCharPref('Settings.Conf.vtigerURL'));
	reuseSession();

	var sessionId = vtigerPreferences.getCharPref('Settings.Conf.session');
	var aMsg = myBundle.GetStringFromName('ErrComModAcc');
	if (sessionId != '')	{
		client.listtypes(handleTerminalError(function (listResult) {
			var permittedModules = listResult['types'];
			if (inArray(permittedModules, 'Contacts') == -1) {
				var bMsg = myBundle.GetStringFromName('Contacts');
				var aMsg = myBundle.formatStringFromName('ModNotAcc', [bMsg], 1);
				alertMessage(aMsg);
				//alertMessage("Contacts module is not accessible for the logged-in user");
			} else {
				get_selected_import();
			}
		}, aMsg));
	}
}

function checkContact_perm() {
	checkSession();

	init(vtigerPreferences.getCharPref('Settings.Conf.vtigerURL'));
	reuseSession();

	var sessionId = vtigerPreferences.getCharPref('Settings.Conf.session');
	var aMsg = myBundle.GetStringFromName('ErrComModAcc');
	if (sessionId != '')	{
		client.listtypes(handleTerminalError(function (listResult) {
			var permittedModules = listResult['types'];
			if (inArray(permittedModules, 'Contacts') == -1) {
				alertMessage(myBundle.GetStringFromName('UserNoPerms'));
			} else {
				get_selected_export();
			}
		}, aMsg));
	}
}
