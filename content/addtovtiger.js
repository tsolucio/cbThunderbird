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

// Initial method for adding mails to vtigercrm server
function vget_mailfrmaddrs() {
	var fromaddress = '';
	var subject = '';
	var url = null;
	var date = '';
	if ('arguments' in window && window.arguments.length > 0) {
		fromaddress = window.arguments[0].author;
		subject = window.arguments[0].subject;
		url = window.arguments[0].url;
		date = window.arguments[0].date;
	} else {
		alertMessage(myBundle.formatStringFromName('invValue', ['window.arguments']));
	}

	document.getElementById('txtemailid').value = window.arguments[0].author;
	document.getElementById('txtsubject').value = window.arguments[0].subject;

	var iframe = document.getElementById('iframeValue');

	// https://github.com/protz/GMail-Conversation-View/blob/master/modules/message.js#L891
	// Set the charset of the iFrame content. Thanks to Jonathan Protzenko for the cluebat.
	let cv = iframe.docShell.contentViewer;
	try {
		cv.QueryInterface(Components.interfaces.nsIMarkupDocumentViewer);
	} catch (e) {/*not supported in newer version*/}
	cv.hintCharacterSet = 'UTF-8';
	cv.hintCharacterSetSource = 11;

	iframe.webNavigation.loadURI(url+'?header=quotebody', iframe.webNavigation.LOAD_FLAGS_IS_LINK, null, null, null);
	iframe.addEventListener('load', function () {
		document.getElementById('TextAreaValue').value = iframe.contentDocument.body.innerHTML;
	}, true);

}

//Double click on the searched records will show the detail view of the records.
function load_vtigercrm(recordId, moduleName) {
	var module = document.getElementById('grpModules');
	var mm = module.getElementsByTagName('radio');
	var moduleName = '';
	for (var i=0; i<mm.length; ++i) {
		if (mm[i].selected) {
			moduleName = mm[i].id;
			break;
		}
	}
	var recordId = recordId.split('x');
	recordId = recordId[1];
	var gvturl = vtigerPreferences.getCharPref('Settings.Conf.vtigerURL');
	//method to open vtigerCRM
	var messenger = Components.classes['@mozilla.org/messenger;1'].createInstance();
	messenger = messenger.QueryInterface(Components.interfaces.nsIMessenger);
	messenger.launchExternalURL(gvturl + '/index.php?module='+moduleName+'&action=DetailView&record='+recordId);
}

function bget_RcdBySearch() {
	var module = document.getElementById('grpModules');
	var mm = module.getElementsByTagName('radio');
	var moduleName = '';
	for (var i=0; i<mm.length; ++i) {
		if (mm[i].selected) {
			moduleName = mm[i].id;
			break;
		}
	}
	bget_CntBySearch(moduleName);
}

function bget_CntBySearch(moduleName) {
	if (document.getElementById('txtemailid').value.length <1) {
		alertMessage(myBundle.GetStringFromName('NoSearchString'));
		return;
	}
	var emailId = document.getElementById('txtemailid').value;
	var bMsg = myBundle.formatStringFromName('SearchFail', [moduleName], 1);
	init(vtigerPreferences.getCharPref('Settings.Conf.vtigerURL'));
	reuseSession();

	client.setAsync(false);

	var rows = 0;
	var aMsg = myBundle.GetStringFromName('ErrRowCnt');
	window.setCursor('wait');
	client.query('SELECT count(*) FROM '+moduleName+' WHERE email LIKE (\'%'+emailId+'%\') OR firstname LIKE (\'%'+emailId+'%\') OR lastname LIKE (\'%'+emailId+'%\');',
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
		client.query('SELECT * FROM ' + moduleName + ' WHERE email LIKE (\'%' + emailId +
				'%\') OR firstname LIKE (\'%' + emailId + '%\') OR lastname LIKE (\'%' + emailId +'%\') LIMIT ' + m + ',' + incr + ';',
		handleError(function (searchResult) {
			if (searchResult.length === 0) {
				window.setCursor('auto');
				alertMessage(myBundle.formatStringFromName('NoModFound', [moduleName], 1));
			} else {
				var rcount = searchResult.length;
				var accountIds = [];
				for (var i = 0; i < rcount; i++) {
					var accountId = searchResult[i]['account_id'];
					if (accountId!=null && accountId != '' && accountId != 'null' && accountId != 'NULL') {
						accountIds[accountIds.length] = accountId;
					}
				}
				var out = '(';
				for (i = 0; i < accountIds.length; i++) {
					if (i!=0) {
						out+=', ';
					}
					out+='\''+accountIds[i]+'\'';
				}
				var inClause = out+')';

				//Skipping account name search when account_id is null.
				if (inClause == '()') {
					listRecords(searchResult, emailId, {}, 'lstcontactinfo', moduleName);
				} else {
					var aMsg = myBundle.GetStringFromName('NoRelCo');
					client.query('SELECT accountname FROM Accounts WHERE id IN '+inClause+';',
						handleError(function (accountResult) {
							var accountNames = {};
							for (var i = 0; i<accountResult.length; i++) {
								accountNames[accountResult[i]['id']] = accountResult[i]['accountname'];
							}
							listRecords(searchResult, emailId, accountNames, 'lstcontactinfo', moduleName);
						}, aMsg)
					);
				}
				if ((m + incr) < rows) {
					var imported = m + incr;
				} else {
					var imported = m + remainder;
					window.setCursor('auto');
					// alertMessage(myBundle.formatStringFromName("SuccImport", [imported, rows], 2));
					updateSession();
				}
			}
		}, bMsg)
		);
		m = m + incr;
	}
}

//Listing records as  search result for the given emailId.
function listRecords(searchResult, emailId, accountNames, elementId, moduleName) {
	clearListBox(elementId);

	function accountName(id) {
		var accountName = accountNames[id];
		return accountName == null ? '' : accountName;
	}
	var rcount = searchResult.length;
	var listboxelmnt = document.getElementById(elementId);

	var elements = listboxelmnt.childNodes;

	var phpJS = new PHP_JS();
	for (var i = 0; i<rcount; i++) {
		var record = searchResult[i];
		var rcdid = record['id'];
		var frstname = record['firstname'];
		var lstname = record['lastname'];
		var rcdemail = record['email'];
		if (moduleName == 'Contacts') {
			var acntname = accountName(record['account_id']);
		} else {
			var acntname = phpJS.html_entity_decode(record['company']);
		}

		var listitemdoc = document.createElement('listitem');
		listitemdoc.setAttribute('value', rcdid);

		var typechild = document.createElement('listcell');
		typechild.setAttribute('label', moduleName);
		listitemdoc.appendChild(typechild);

		var fullnamechild = document.createElement('listcell');
		if (typeof frstname !='undefined') {
			fullnamechild.setAttribute('label', phpJS.html_entity_decode(frstname+ ' ' +lstname));
			listitemdoc.appendChild(fullnamechild);
		} else {
			fullnamechild.setAttribute('label', phpJS.html_entity_decode(lstname));
			listitemdoc.appendChild(fullnamechild);
		}

		var accountchild = document.createElement('listcell');
		accountchild.setAttribute('label', phpJS.html_entity_decode(acntname));
		listitemdoc.appendChild(accountchild);

		var emailchild = document.createElement('listcell');
		emailchild.setAttribute('label', phpJS.html_entity_decode(rcdemail));
		listitemdoc.appendChild(emailchild);

		listboxelmnt.appendChild(listitemdoc);
	}
}

//add email to vtigerCRM
function vaddemailtovtigerCRM() {
	init(vtigerPreferences.getCharPref('Settings.Conf.vtigerURL'));
	reuseSession();
	var email_subject = document.getElementById('txtsubject').value;
	if (email_subject == '') {
		var noSub = myBundle.GetStringFromName('NoSub');
		document.getElementById('txtsubject').value = noSub;
		email_subject = noSub;
	}
	//method to add message to vtigerCRM server
	if (document.getElementById('lstcontactinfo').selectedItem) {
		var email = {};
		var emailNodeIndex = 3;
		email['parent_id'] = document.getElementById('lstcontactinfo').selectedItem.value;

		var dateStr = window.arguments[0].date.replace('\'', '');
		dateStr = dateStr.replace('\'', '');
		var date = new Date(parseInt(dateStr.substring(0, 13)));

		factory.get('Emails', function (res) {
			var fields = res['fields'];
			var format = 'yyyy-mm-dd';
			function getFormatedDate(date) {
				var displayDate;
				var dd = (date.getDate().toString().length ==1)? '0'+date.getDate(): date.getDate();
				//The value returned by getMonth() is a number between 0 and 11
				var mm = ((date.getMonth()+1).toString().length ==1)? '0'+(date.getMonth()+1): date.getMonth()+1;
				var yy = date.getFullYear();
				displayDate = yy+'-'+mm+'-'+dd;
				return displayDate;
			}

			// email["from_email"] = opener.gauthor;
			email['from_email'] = window.arguments[0].author;

			//populate the cc field with the cc address of the selected message
			if (window.arguments[0].cc) {
				email['ccmail'] = window.arguments[0].cc;
			}
			email['date_start'] = getFormatedDate(date);
			email['time_start'] = date.getUTCHours()+':'+date.getUTCMinutes()+':'+date.getUTCSeconds();
			email['saved_toid'] = document.getElementById('lstcontactinfo').selectedItem.childNodes[emailNodeIndex].getAttribute('label');
			email['subject'] = email_subject;

			email['description'] = document.getElementById('TextAreaValue').value;
			email['assigned_user_id'] = client.getUserId();
			email['activitytype'] = 'Emails';
			email['email_flag'] = 'SENT';
			try {
				var bMsg = myBundle.GetStringFromName('CantAddMess');
				createAndCheck(email, 'Emails', handleError(
					function (result) {
						notify(myBundle.GetStringFromName('msgAddSuccess'));
						TagMsg();
						updateSession();
						window.setTimeout(function () {
							window.close();
						}, 10);
					}, bMsg
				));
			} catch (errorObject) {
				alertMessage(errorObject);
				return;
			}
		});
	} else {
		alertMessage(myBundle.GetStringFromName('noDestSelected'));
	}
}
