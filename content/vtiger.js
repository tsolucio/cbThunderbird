//#$Id:
/* ********************************************************************************
 * The contents of this file are subject to the vtiger CRM Public License Version 1.0
 * ("License"); You may not use this file except in compliance with the License
 * The Original Code is:  vtiger CRM Open Source
 * The Initial Developer of the Original Code is vtiger.
 * Portions created by vtiger are Copyright (C) vtiger.
 * All Rights Reserved.
 ******************************************************************************* */

//Run on startup.
window.addEventListener('load', function () {
	setTimeout(function () {
		vtStartup();
	}, 0);
}, false);

//Load the vtiger.properties string file
var bundles = Components.classes['@mozilla.org/intl/stringbundle;1'].getService(Components.interfaces.nsIStringBundleService);
var myBundle = bundles.createBundle('chrome://vtiger/locale/vtiger.properties');

//Open vtiger in a Thunderbird Tab. And set up a click handler so that any
//URLs not on vtiger trigger the default browser.
function new_vtiger_tab() {
	var url = vtigerPreferences.getCharPref('Settings.Conf.vtigerURL');
	let vtigerRegEx = new RegExp('^' + url);

	Components.classes['@mozilla.org/appshell/window-mediator;1']
		.getService(Components.interfaces.nsIWindowMediator)
		.getMostRecentWindow('mail:3pane')
		.document.getElementById('tabmail')
		.openTab('contentTab', {contentPage: url,
			clickHandler: 'specialTabs.siteClickHandler(event, ' + vtigerRegEx + ')' });
}

// Login to vtiger or load config dialogue on first-run
function vtStartup() {
	var prompt = Components.classes['@mozilla.org/embedcomp/prompt-service;1'].getService(Components.interfaces.nsIPromptService);

	updateStatusBar(myBundle.GetStringFromName('StsConn'));

	//TODO:
	// 	/* Error: uncaught exception: [Exception... "Component returned failure code: 0x8000ffff (NS_ERROR_UNEXPECTED) [nsIPrefBranch.getBoolPref]"  nsresult: "0x8000ffff (NS_ERROR_UNEXPECTED)"  location: "JS frame :: chrome://vtiger/content/vtiger.js :: vtStartup :: line 42"  data: no] */

	if (vtigerPreferences.getBoolPref('Settings.Conf.firstRun')) {
		// First run, open a dialogue and then the vtiger settings window
		if (prompt.confirm(window, myBundle.GetStringFromName('Confvt'),
			myBundle.GetStringFromName('FirstRun'))) {
			window.openDialog('chrome://vtiger/content/vtiger-settings.xul', '', 'chrome,resizable=no,titlebar,centerscreen,modal');
		} else {
			return;
		}
	}

	enableTbirdExtension();
	updateStatusBar(myBundle.GetStringFromName('StsOnline'));
}

// Initialise Add Message to vtiger
function startAddMsg() {
	var msgArray = [];

	checkSession();

	// Check for selected message(s), die if false
	if (! isMessageSelected()) {
		alertMessage(myBundle.GetStringFromName('noMailSelected'));
		return;
	}

	// Load the message details
	msgArray = loadMsgDetails();

	for (var i = 0; i < msgArray.length; ++i) {
		window.openDialog('chrome://vtiger/content/addMsgtovtiger.xul', '',
			'chrome,resizable=no,titlebar,centerscreen', {
				'author': msgArray[i].email,
				'cc': msgArray[i].cc,
				'subject': msgArray[i].subject,
				'date': msgArray[i].date,
				'url': msgArray[i].url
			}, msgArray[i].header);
	}
}

//Initialise Create new Lead/Contact
function startCreateLeadContact() {
	var msgArray = [];

	checkSession();

	// Check for selected message(s)
	if (isMessageSelected()) {
		msgArray = loadMsgDetails();
		for (var i = 0; i < msgArray.length; ++i) {
			window.openDialog('chrome://vtiger/content/createNewLeadContact.xul', '',
				'chrome,resizable=no,titlebar,centerscreen', {
					'email':msgArray[i].email,
					'name': msgArray[i].name,
					'firstName': msgArray[i].firstName,
					'lastName': msgArray[i].lastName,
				}, msgArray[i].header);
		}
	} else {
		window.openDialog('chrome://vtiger/content/createNewLeadContact.xul', '', 'chrome,resizable=no,titlebar,centerscreen');
	}
}

function isMessageSelected() {
	if (gFolderDisplay.selectedMessage == null) {
		return false;
	}
	return true;
}

function loadMsgDetails() {
	var messageHdrs = gFolderDisplay.selectedMessages;
	var msgItem = {}, emailAndName = {}, msgArray = [];

	// Iterate through selection
	for (var i = 0; i < gFolderDisplay.selectedCount; ++i) {
		var loadedMessageHdr = messageHdrs[i];
		msgItem.subject = loadedMessageHdr.mime2DecodedSubject;
		emailAndName = sanitiseEmail(loadedMessageHdr.mime2DecodedAuthor);

		// Check if the message author's email address is actually TB Account,
		// if yes, use the first entry in the To: or CC: fields instead.
		if (isTBAccount(emailAndName.email)) {
			emailAndName = sanitiseEmail(loadedMessageHdr.mime2DecodedRecipients);
			msgItem.email = emailAndName.email;
			msgItem.name = emailAndName.name;
			msgItem.firstName = emailAndName.firstName;
			msgItem.lastName = emailAndName.lastName;
		} else {
			msgItem.email = emailAndName.email;
			msgItem.name = emailAndName.name;
			msgItem.firstName = emailAndName.firstName;
			msgItem.lastName = emailAndName.lastName;
		}

		msgItem.date = '\'' + loadedMessageHdr.date + '\'';
		msgItem.url = getNeckoURLFromMsgDBHeader(loadedMessageHdr).spec;
		msgItem.cc = loadedMessageHdr.ccList;
		msgItem.header = loadedMessageHdr;

		msgArray[i] = msgItem;

		// Reset msgItem Object before repeating
		msgItem = {};
	}

	return msgArray;
}

function getNeckoURLFromMsgDBHeader(loadedMessageHdr) {
	var messenger = Components.classes['@mozilla.org/messenger;1'].createInstance(Components.interfaces.nsIMessenger);
	var uri = loadedMessageHdr.folder.getUriForMsg(loadedMessageHdr);
	var msgService = messenger.messageServiceFromURI(uri);
	var neckoURL = {};
	msgService.GetUrlForUri(uri, neckoURL, null);
	return neckoURL.value;
}

// Sanitise the email address and name from the message header
// Thanks to jonathan.protzenko@gmail.com on the moz-dev-extensions
// mailling list for the pointer.
function sanitiseEmail(email) {
	var emailAndName = {};

	const gHeaderParser = Components.classes['@mozilla.org/messenger/headerparser;1'].getService(Components.interfaces.nsIMsgHeaderParser);

	let emails = {};
	let fullNames = {};
	let names = {};
	let numberOfParsedAddresses = gHeaderParser.parseHeadersWithArray(email, emails, names, fullNames);

	emailAndName.email = emails.value[0];
	emailAndName.name = names.value[0];

	if (emailAndName.name) {
		var tmp = new Array();
		tmp = emailAndName.name.split(' ');

		emailAndName.firstName = tmp.shift();
		emailAndName.lastName = tmp.join(' ');
	}
	return emailAndName;
}

function createLeadContact() {
	// Get a NamedNodeMap for the parent's parent then find the right information
	var el = document.popupNode.parentNode.parentNode.attributes;
	var emailAndName = sanitiseEmail(el.getNamedItem('fullAddress').nodeValue);

	window.openDialog('chrome://vtiger/content/createNewLeadContact.xul', '',
		'chrome,resizable=no,titlebar,centerscreen', {
			'email':emailAndName.email,
			'name': emailAndName.name,
			'firstName': emailAndName.firstName,
			'lastName': emailAndName.lastName
		});
}