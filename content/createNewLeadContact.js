/* ********************************************************************************
* The contents of this file are subject to the vtiger CRM Public License Version 1.0
 * ("License"); You may not use this file except in compliance with the License
 * The Original Code is:  vtiger CRM Open Source
 * The Initial Developer of the Original Code is vtiger.
 * Portions created by vtiger are Copyright (C) vtiger.
 * All Rights Reserved.
******************************************************************************* */

// Load the vtiger.properties string file
var bundles = Components.classes['@mozilla.org/intl/stringbundle;1'].getService(Components.interfaces.nsIStringBundleService);
var myBundle = bundles.createBundle('chrome://vtiger/locale/vtiger.properties');

// Called from onLoad() when createNewLeadContact.xul window is loaded
function populateFields() {
	if (window.arguments) {
		if (window.arguments[0].name) {
			document.getElementById('clcFirstname').value = window.arguments[0].firstName;
			document.getElementById('clcLastname').value = window.arguments[0].lastName;
		}

		if (window.arguments[0].email) {
			document.getElementById('clcEmail').value = window.arguments[0].email;
		}
	}
	// Change the caption if the mandatory status of the company
	// field of the Leads module has been changed to false.
	if (!vtigerPreferences.getBoolPref('Settings.Conf.LeadCoMandatory')) {
		document.getElementById('capCompanyLead').label = myBundle.GetStringFromName('OptionalCompanyField');
	}
}

function getAccounts() {
	if (document.getElementById('clcAccount').value.length <1) {
		alertMessage(myBundle.GetStringFromName('NoSearchString'));
		return;
	}

	var searchString = document.getElementById('clcAccount').value;
	var bMsg = myBundle.formatStringFromName('SearchFail', ['Accounts'], 1);

	checkSession();

	init(vtigerPreferences.getCharPref('Settings.Conf.vtigerURL'));
	reuseSession();
	client.setAsync(false);

	var rows = 0;
	var aMsg = myBundle.GetStringFromName('ErrRowCnt');
	window.setCursor('wait');
	client.query('SELECT count(*) FROM Accounts WHERE accountname LIKE'
			+ ' (\'%' + searchString + '%\');',
	handleError(function (numRows) {
		rows = numRows[0]['count'];
	}, aMsg)
	);
	window.setCursor('auto');
	if (rows > 100) {
		if (!window.confirm(myBundle.formatStringFromName('BigSearchResult', [rows], 1))) {
			return;
		}
	}

	// m is a simple counter, incr is the amount to retrieve each time round the loop.
	var m = 0; var incr = 100; var remainder = rows % incr;
	if (remainder == 0) {
		remainder = incr;
	} // remainder is used for user notification
	while (m <= rows) {
		window.setCursor('wait');
		client.query('SELECT accountname FROM Accounts WHERE accountname LIKE'
				+ ' (\'%' + searchString + '%\') LIMIT ' + m + ',' + incr + ';',
		handleError(function (searchResult) {
			if (searchResult.length === 0) {
				window.setCursor('auto');
				alertMessage(myBundle.formatStringFromName('NoModFound', ['Accounts'], 1));
			}
			listRecords(searchResult, 'clcAccountNames', 'Accounts');

			if ((m + incr) < rows) {
				var imported = m + incr;
			} else {
				var imported = m + remainder;
				window.setCursor('auto');
				updateSession();
			}
		}, bMsg)
		);
		m = m + incr;
	}
}

// Populate listbox with returned search results.
function listRecords(searchResult, elementId, moduleName) {
	clearListBox(elementId);

	var listboxelmnt = document.getElementById(elementId);
	var elements = listboxelmnt.childNodes;
	var rcount = searchResult.length;

	for (var i = 0; i<rcount; i++) {
		var record = searchResult[i];

		var listitemdoc = document.createElement('listitem');
		listitemdoc.setAttribute('value', record['id']);

		var accountchild = document.createElement('listcell');
		accountchild.setAttribute('label', record['accountname']);
		listitemdoc.appendChild(accountchild);

		listboxelmnt.appendChild(listitemdoc);
	}
}

function createNewLead() {
	if (!document.getElementById('clcLastname').value) {
		alertMessage(myBundle.formatStringFromName('cantBeEmpty',
			[document.getElementById('clcLastname').label], 1));
		return;
	}

	if (!document.getElementById('clcCompany').value &&
			vtigerPreferences.getBoolPref('Settings.Conf.LeadCoMandatory')) {
		alertMessage(myBundle.formatStringFromName('cantBeEmpty',
			[document.getElementById('clcCompany').label], 1));
		return;
	}

	var lead = {};

	lead['firstname'] = document.getElementById('clcFirstname').value;
	lead['lastname'] = document.getElementById('clcLastname').value;
	lead['email'] = document.getElementById('clcEmail').value;
	lead['phone'] = document.getElementById('clcPhone').value;
	lead['description'] = document.getElementById('clcNotes').value;
	lead['company'] = document.getElementById('clcCompany').value;

	saveToVtiger(lead, 'Leads');
}

function createNewContact() {
	if (document.getElementById('clcLastname').value != '') {
		var contact = {};

		if (document.getElementById('clcAccountNames').selectedItem) {
			contact['account_id'] = document.getElementById('clcAccountNames').selectedItem.value;
		}

		contact['firstname'] = document.getElementById('clcFirstname').value;
		contact['lastname'] = document.getElementById('clcLastname').value;
		contact['email'] = document.getElementById('clcEmail').value;
		contact['phone'] = document.getElementById('clcPhone').value;
		contact['description'] = document.getElementById('clcNotes').value;

		saveToVtiger(contact, 'Contacts');
	} else {
		alertMessage(myBundle.formatStringFromName('cantBeEmpty',
			[document.getElementById('clcLastname').label], 1));
	}
}

function saveToVtiger(obj, module) {
	checkSession();
	init(vtigerPreferences.getCharPref('Settings.Conf.vtigerURL'));
	reuseSession();

	if (check_permit(module)) {
		var moduleEntity = removeS(module);

		try {
			obj['assigned_user_id'] = client.getUserId();

			if (validate(module)) {
				// Save information using REST API's
				var aMsg = myBundle.formatStringFromName('FailCreate', [moduleEntity], 1);
				try	{
					createAndCheck(obj, module, handleError(
						function (result) {
							notify(myBundle.formatStringFromName('AddSuccess', [moduleEntity], 1));
							updateSession();
							window.setTimeout(function () {
								window.close();
							}, 10);
						}, aMsg
					));
				} catch (errorObject) {
					if (errorObject!='') {
						alertMessage(errorObject);
						return;
					}
				}
			}
		} catch (ex) {
			if (gErrMsg!='') {
				alertMessage(gErrMsg);
				return;
			}
		}
	} else {
		alertMessage(myBundle.formatStringFromName('ModNotAcc', [module], 1));
	}
}
