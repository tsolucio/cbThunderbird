/* ********************************************************************************
* The contents of this file are subject to the vtiger CRM Public License Version 1.0
 * ("License"); You may not use this file except in compliance with the License
 * The Original Code is:  vtiger CRM Open Source
 * The Initial Developer of the Original Code is vtiger.
 * Portions created by vtiger are Copyright (C) vtiger.
 * All Rights Reserved.
******************************************************************************* */
// Library of common functions.

/**
* trim
* Removes leading and trailing whitespace from a string.
*
* @param string. The text to trim
* @returns string. The trimmed string
*/
function trim(string) {
	return string.replace(/^\s+/, '').replace(/\s+$/, '');
}

/**
* walk
* Recursively iterates through an array or object to display
* its contents for debugging purposes.
*
* @param arr. The array or object to examine
* @param level. Depth to iterate (optional)
* @returns String. The contents of the array/object as a string.
*/
function walk(arr, level) {
	var dumped_text = '';
	if (!level) {
		level = 0;
	}

	//The padding given at the beginning of the line.
	var level_padding = '';
	for (var j=0; j<level+1; j++) {
		level_padding += '    ';
	}

	if (typeof(arr) == 'object') { //Array/Hashes/Objects
		for (var item in arr) {
			var value = arr[item];

			if (typeof(value) == 'object') { //If it is an array,
				dumped_text += level_padding + '\'' + item + '\' ...\n';
				dumped_text += dump(value, level+1);
			} else {
				dumped_text += level_padding + '\'' + item + '\' => "' + value + '"\n';
			}
		}
	} else { //Stings/Chars/Numbers etc.
		dumped_text = '===>'+arr+'<===('+typeof(arr)+')';
	}
	return dumped_text;
}

/**
* getType
* Returns the type of whatever object you throw at it
* For debugging purposes.
*
* @param obj. The object to examine
* @returns String. The name of the type of the object as a string.
*/
function getType(obj) {
	return Object.prototype.toString.call(obj).match(/^\[object (.*)\]$/)[1];
}

/**
* validate_email
* Test for a valid email address format
*
* @param email. The email address (string) to check
* @returns String. Returns the address if valid, else returns ''.
*/
function validate_email(email) {
	if (email == '') {
		return email;
	} else if (/^[a-zA-Z0-9]+([_\.\-]?[a-zA-Z0-9]+)?@[a-zA-Z0-9]+([_\-]?[a-zA-Z0-9]+)*\.[a-zA-Z0-9]+(\.?[a-zA-Z0-9]+)*$/.test(email)) {
		return email;
	} else {
		email = '';
		return email;
	}
}

function encode64(input) {
	return unescape(encodeURIComponent(input));
}

function decode64(input) {
	return decodeURIComponent(escape(input));
}

/**
* alertMessage
* Print a message to the screen
*
* @param message. The string to display
*/
function alertMessage(message) {
	var promptSvc = Components.classes['@mozilla.org/embedcomp/prompt-service;1'].getService(Components.interfaces.nsIPromptService);
	promptSvc.alert(window, 'vtiger CRM', message);
}

/**
 * updateStatusBar
 * Send a new message to the vtiger Status Bar
 *
 * @param message. The String to display in the status bar
 */
function updateStatusBar(msg) {
	if ((msg) && document.getElementById('vtiger-panel')) {
		document.getElementById('vtiger-panel').label = msg;
	}
	return;
}

/**
 * cleanURI
 * make it all lowercase and strip the "http{s)://" from the string
 *
 * @param URI. The string to strip
 * @returns String. Our nicely formated URI ready for sending to vtiger
*/
function cleanURI(uri) {
	uri = uri.toLowerCase();
	var protocol = uri.indexOf('://');
	if (protocol != -1) {
		uri = uri.substring(protocol+3);
	}
	return uri;
}

/**
 * notify
 * Used to message the user by the less intrusive notification system (Growl,
 * libnotify etc) if available. Alternatively the TB library should default to
 * generating a xul non-modal popup.
 *
 * @param msg. Text of Notification - Required
 * @param title. Title of Notification - Optional
 * @param icon. An Icon to use on the notification - Optional
 * @returns none.
 */
function notify(msg, title, icon) {
	if (msg === undefined || msg == '') {
		alertMessage('Notification message missing');
		return;
	}
	if (title === undefined || title == '') {
		title = 'coreBOS CRM';
	}
	if (icon === undefined || icon == '') {
		icon = 'chrome://vtiger/skin/vtiger32.png';
	}

	try {
		var alertsService = Components.classes['@mozilla.org/alerts-service;1'].getService(Components.interfaces.nsIAlertsService);
		alertsService.showAlertNotification(icon, title, msg, false, '', null, '');
	} catch (e) {
		// prevents runtime error on platforms that don't implement the
		// nsIAlertsService, e.g OSX without Growl and generates a simple
		// notify popup instead.
		var win = Components.classes['@mozilla.org/embedcomp/window-watcher;1']
			.getService(Components.interfaces.nsIWindowWatcher)
			.openWindow(null, 'chrome://global/content/alerts/alert.xul', '_blank', 'chrome,titlebar=no,popup=yes', null);
		win.arguments = [icon, title, msg, false, ''];
	}
}

/**
 * tagMsg
 * Function to tag the email message that has just been successfully added to
 * the vtiger CRM. The extension registers a tag with the key "vtiger". The
 * user can edit the name & colour of this tag via the standard dialogues.
 *
 * @param none.
 * @returns none.
 */
function TagMsg() {
	var vtigerPreferences = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefService).getBranch('vtiger.');

	if (vtigerPreferences.getBoolPref('Settings.Conf.enableTagging')) {
		var msg = Components.classes['@mozilla.org/array;1'].createInstance(Components.interfaces.nsIMutableArray);

		// msgHdr object passed in the window.openDialogue() call - Eewwww :-(
		var msgHdr = window.arguments[1];

		// Reset and then add msgHdr to the nsIArray
		msg.clear();
		msg.appendElement(msgHdr, false);

		// Add the tag
		msgHdr.folder.addKeywordsToMessages(msg, 'vtiger');
	}
	return;
}

/**
 * isTBAccount
 * Determine if the email address supplied is one of Thunderbird's own, i.e. a
 * user account. Return true if yes.
 * @param email The email address to check, a string.
 * @returns Boolean. true or false.
 */
function isTBAccount(email) {
	if (email === undefined || email == '') {
		alertMessage('No email address supplied!');
		return;
	}

	var acctMgr = Components.classes['@mozilla.org/messenger/account-manager;1']
		.getService(Components.interfaces.nsIMsgAccountManager);
	var accounts = acctMgr.accounts;

	var count = accounts.length; // Was .Count();
	var matches = 0;

	for (var i = 0; i < count; i++) {
		var account = accounts.queryElementAt(i, Components.interfaces.nsIMsgAccount);
		var idents = account.identities;

		for (var n = 0; n < idents.length; n++) {
			if (idents.queryElementAt(n, Components.interfaces.nsIMsgIdentity)) {
				var identity = idents.queryElementAt(n, Components.interfaces.nsIMsgIdentity);

				if (typeof(identity.email) != 'undefined') {
					if (identity.email.toLowerCase() == email.toLowerCase()) {
						matches++;
					}
				}
			}
		}
	}

	if (matches > 0) {
		return true;
	}

	return false;
}

/**
 * check_permit
 * Determine if the user has permissions to access the module
 * Return status=true if yes.
 * @param module The module name to check, a string.
 * @returns status: true or false.
 */
function check_permit(module) {
	init(vtigerPreferences.getCharPref('Settings.Conf.vtigerURL'));
	reuseSession();
	var status = false;
	client.setAsync(false);
	var sessionId = vtigerPreferences.getCharPref('Settings.Conf.session');
	var aMsg = myBundle.GetStringFromName('ErrComModAcc');

	if (sessionId != '')	{
		client.listtypes(handleTerminalError(function (listResult) {
			var permittedModules = listResult['types'];
			if (module == 'Contacts') {
				if (inArray(permittedModules, 'Contacts') == -1) {
					alertMessage(myBundle.formatStringFromName('ModNotAcc', [module], 1));
				} else {
					status = true;
				}
			} else if (module == 'Leads') {
				if (inArray(permittedModules, 'Leads') == -1) {
					alertMessage(myBundle.formatStringFromName('ModNotAcc', [module], 1));
				} else {
					status = true;
				}
			}
		}, aMsg));
	}
	return status;
}

/**
 * removeS
 * Used to get the singular name from a string. Removes the "s" if it ends with
 * one. Return the string minus the "s".
 * @param a string.
 * @returns string.
 */
function removeS(str) {
	var outstr = ((str.charAt(str.length-1, 1) == 's') ? str.substring(0, str.length-1) : str);
	return outstr;
}

/**
 * clearListBox
 * Empty the contents of a listbox
 * @param the ID of the listbox to clear.
 */

// Need to test for a listbox element, or make this even more generic for
// clearing any input content
function clearListBox(listBoxId) {
	var listboxelmnt = document.getElementById(listBoxId);
	var elements = listboxelmnt.childNodes;

	for (var i=elements.length-1; i>1; --i) {
		listboxelmnt.removeChild(elements[i]);
	}
}