
/* ********************************************************************************
* The contents of this file are subject to the vtiger CRM Public License Version 1.0
 * ("License"); You may not use this file except in compliance with the License
 * The Original Code is:  vtiger CRM Open Source
 * The Initial Developer of the Original Code is vtiger.
 * Portions created by vtiger are Copyright (C) vtiger.
 * All Rights Reserved.
******************************************************************************* */

var vtigerPreferences = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefService).getBranch('vtiger.');

//Load the vtiger.properties string file
var bundles = Components.classes['@mozilla.org/intl/stringbundle;1'].getService(Components.interfaces.nsIStringBundleService);
var myBundle = bundles.createBundle('chrome://vtiger/locale/vtiger.properties');

var vtigerUsername, vtigerAccessKey, vtigerURL;
var sessionId = '';
var userId = '';
vtigerPreferences.setCharPref('Settings.Conf.temp_variable', 'false');
var moduleFields = {
	'Accounts': [],
	'Contacts': [],
	'Leads': []
};
var moduleDescribeFields = {
	'Accounts': [],
	'Contacts': [],
	'Leads': []
};

var moduleNameFields = {};

// An array of supported apiVersions
var apiVersion = ['0.2', '0.22'];
// 0.2 = vtiger 5.1.0, 0.2.2 = vtiger 5.2.0

/**
 * Source for all modules, provides ways to get module object maps and picklist details.
 */
var WebserviceFactory = function (client) {
	var describeCache = {};
	var enableCache = true;
	/**
	 * Get object map for the given module, does a describe operation to compute the object map.
	 * @param module:String name of the module for which an object map is to be returned.
	 * @return An Object Map for the given module with assigned_user_id set to the current user.
	 */
	function get(module, callback) {
		if (enableCache ===true && typeof describeCache[module] == 'object') {
			//module describe result already cached, use it.
			callback(describeCache[module]);
		} else {
			var aMsg = myBundle.formatStringFromName('FailDetails', [module], 1);
			client.describe(module, handleTerminalError(
				function (result) {
					//cache the module describe result.
					describeCache[module] = result;
					callback(result);
				}, aMsg)
			);
		}
	}

	/**
	 * get picklist values for the given field of the given module.
	 * @param module:String name of the module.
	 * @param fieldName:String name of the picklist for which the values are to be returned.
	 * @return An Array of picklistEntry(eg. {"label":"picklistEntryLabel","value":"picklistValueEntry"}) objects.
	 */
	function getPicklist(module, fieldName, callback) {
		get(module, function (source) {
			var fields = source['fields'];
			var picklistValues = null;
			for (var i=0; i<fields.length; ++i) {
				if (fields[i]['name'] == fieldName) {
					picklistValues = fields[i]['type']['picklistValues'];
				}
			}
			callback(picklistValues);
		});
	}
	return {'get':get, 'getPicklist':getPicklist};
};

function each(object, callback) {
	var name, i = 0, length = object.length;
	if (length == undefined ) {
		for (name in object ) {
			if (callback.call(object[ name ], name, object[ name ] ) === false ) {
				break;
			}
		}
	} else {
		for (var value = object[0]; i < length && callback.call(value, i, value ) !== false; value = object[++i] ) {}
	}
	return object;
}

/**
 * Wrapper for JSON encoding and decoding.
 */
var VT_JSON = function () {
	/**
	 * encode a javascript object to JSON format.
	 * @param obj:var a javascript object which need to encoded in JSON format.
	 * @return JSON encode String for the given object.
	 */
	function encode(obj) {
		return JSON.stringify(obj);
	}

	/**
	 * decode a JSON formated String to javascript object.
	 * @param response:String JSON encoded String for a javascript object.
	 * @return javascript object for a given JSON encoded String.
	 */
	function decode(response) {
		return JSON.parse(response);
	}

	return {'encode':encode, 'decode':decode};
};

/**
 * Wrapper for Http Get and Http Post requests.
 */
var VT_HTTPClient = function (endPointURL) {
	/**
	 * flag to indicate where the request is asynchronous or not. default asynchronous(currently no provision to change it).
	 */
	var async = true;

	/**
	 * url which is the end point for the client.
	 */
	var url = endPointURL;

	/**
	 * wrapper for a http POST request to the vtiger server.
	 * @param params:Object parameter for the POST request.
	 * @param callback:Function an user callback function that is to be executed upon completion of the request.
	 */
	function doPost(params, callback) {
		var encodedParams = getEncodedParameterString(params);
		var httpRequest = new XMLHttpRequest();
		doXHRPost(httpRequest, url, encodedParams, callback);
	}

	/**
	 * wrapper for a http GET request to the vtiger server.
	 * @param params:Object parameter for the GET request.
	 * @param callback:Function an user callback function that is to be executed upon completion of the request.
	 */
	function doGet(params, callback) {
		var encodedParams = getEncodedParameterString(params);
		var httpRequest = new XMLHttpRequest();
		doXHRGet(httpRequest, url, encodedParams, callback);
	}

	/**
	 * generates a parametric form string for a given Object.
	 * @param paramObject:Object An Object instance for which parametric form,
	 * e.g. "parameterName1=parameterValue1&parameterName2=parameterValue2..."
	 * string needs to generated.
	 */
	function getEncodedParameterString(paramObject) {
		var encodedParams = new Array();
		each(paramObject, function (k, v) {
			encodedParams.push(k+'='+ v);
		});
		encodedParams = encodedParams.join('&');
		return encodedParams;
	}

	/**
	 * wrapper to do a XHR POST request for the server.
	 * @param httpRequest:nsIXMLHttpRequest XHR class Instance.
	 * @param url:String a complete end point url of vtiger server.
	 * @param params:String parameter for the POST request in parameteric form("parameterName1=parameterValue1&parameterName2=parameterValue2...").
	 * @param errorMsg:String an error message to be shown if the request failed.
	 * @return A string with response from the server.
	 */
	function doXHRPost(httpRequest, url, params, callback) {
		if (typeof showBusy == 'function') {
			showBusy();
		}
		httpRequest.open('POST', url, async);
		httpRequest.setRequestHeader('Content-Length', params.length);
		httpRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		httpRequest.setRequestHeader('Connection', 'close');
		httpRequest.onreadystatechange = function () {
			if (httpRequest.readyState == 4) {
				invokeUserCallback(httpRequest, callback);
			}
		};
		httpRequest.send(params);
		if (!async) {
			invokeUserCallback(httpRequest, callback);
		}
	}

	/**
	 * wrapper to do a XHR GET request for the server.
	 * @param httpRequest:nsIXMLHttpRequest XHR class Instance.
	 * @param url:String a complete end point url of vtiger server.
	 * @param params:String parameter for the GET request in parameteric form
	 * "parameterName1=parameterValue1&parameterName2=parameterValue2...".
	 * @param errorMsg:String an error message to be shown if the request failed.
	 * @return A string with response from the server.
	 */
	function doXHRGet(httpRequest, url, params, callback) {
		if (typeof showBusy == 'function') {
			showBusy();
		}
		httpRequest.open('GET', url+'?'+params, async);
		httpRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		httpRequest.setRequestHeader('Connection', 'close');
		httpRequest.onreadystatechange = function () {
			if (httpRequest.readyState == 4) {
				invokeUserCallback(httpRequest, callback);
			}
		};
		httpRequest.send(null);
		if (!async) {
			invokeUserCallback(httpRequest, callback);
		}
	}

	function invokeUserCallback(httpRequest, callback) {
		var success = (httpRequest.status == 200)? true: false;
		if (typeof hideBusy == 'function') {
			hideBusy();
		}
		callback(success, httpRequest);
	}

	function setAsync(value) {
		async = value;
	}

	return {'doPost':doPost, 'doGet':doGet, 'setAsync': setAsync};
};

/**
 * Wrapper for webserivce operations published by vtiger server.
 */
var VTWS_TBirdClient = function (vtigerURL) {

	var sessionId = null;
	var userId = null;
	/**
	 * @param url:URL which needs to be formatted.
	 * @return a formatted URL.
	 */
	function getURL(url) {
		if (url.length > 0) {
			if (vtigerURL.indexOf('/index.php') != -1) {
				alertMessage(myBundle.GetStringFromName('entValidURL'));
			}
			if (url.charAt(url.length-1) !=='/') {
				url += '/';
			}
			return url;
		}
		return null;
	}

	/**
	 * web services end point url.
	 */
	var endPointURL = getURL(vtigerURL)+'webservice.php';
	/**
	 * http client to handle communication with server.
	 */
	var httpClient = new VT_HTTPClient(endPointURL);
	/**
	 * json object to handle encode and decoding of the information communicated b/w client and server.
	 */
	var json = new VT_JSON();

	/**
	 * checks response from the server and returns the status of last requested operation.
	 * @param response:Object response object from the server for the last requested operation.
	 * @return returns true of last operation was successful or false if last operation was unsuccessful.
	 */
	function isSuccessful(response) {
		return response.success == true || response.success == 'true';
	}

	/**
	 * returns the Error object from last operation response.
	 * @param response:Object response object from the server for the last requested operation.
	 * @return returns Error object from the last operation response.
	 */
	function getError(response) {
		return response['error'];
	}

	/**
	 * returns the Result object from last operation response.
	 * @param response:Object response object from the server for the last requested operation.
	 * @return returns Result object from the last operation response.
	 */
	function getResult(response) {
		return response['result'];
	}

	/**
	 * Invalidates the current session with server.
	 * @param sessionId of the current session with server.
	 * @return Response Object from the server.
	 */
	function doLogout(sessionId, callback) {
		var params = {
			'operation':'logout',
			'sessionName':sessionId
		};
		var aMsg = myBundle.GetStringFromName('UnLogout');
		httpClient.doPost(params, handleError(callback, aMsg));
	}

	function handleError(callback, msg) {
		return function (success, request) {
			if (success) {
				invokeUserCallback(request.responseText, callback);
			} else {
				callback(false, getErrorObjectForMsg(request.responseText, msg));
			}
		};
	}

	function getErrorObjectForMsg(response, msg) {
		// Sometimes this is returned as HTML which looks terrible in an alert()
		response = response.replace(/<.*?>/g, '');
		return {'code': 'LIB_HTTP_ERROR', 'message':(msg + '\n' + response.toString())};
	}

	function invokeUserCallback(responseString, callback) {
		var response = json.decode(responseString);
		if (isSuccessful(response)) {
			callback(true, getResult(response));
		} else {
			callback(false, getError(response));
		}
	}

	/**
	 * creates a entry on the server for the given ObjectType.
	 * @param obj:Object details of the entry with mandatory fields for the given ObjectType.
	 * @param objectType:String name of module for which the records needs to created for.
	 * @return Response Object from the server.
	 */
	function create(obj, objectType, callback) {
		var sessionId = vtigerPreferences.getCharPref('Settings.Conf.session');
		obj = json.encode(obj);
		obj = encodeURIComponent(obj);
		var params = {
			'operation':'create',
			'format':'json',
			'sessionName':sessionId,
			'elementType':objectType,
			'element':obj
		};
		var aMsg = myBundle.formatStringFromName('FailCreate', [objectType], 1);
		httpClient.doPost(params, handleError(callback, aMsg));
	}

	/**
	 * does a describe operation for given module.
	 * @param moduleName:String name of module for which the records needs to created for.
	 * @return Response Object from the server.
	 */
	function describe(moduleName, callback) {
		var params = {
			'operation':'describe',
			'elementType':moduleName,
			'sessionName':sessionId
		};
		var aMsg = myBundle.formatStringFromName('FailCreate', [moduleName], 1);
		httpClient.doGet(params, handleError(callback, aMsg));
	}

	/**
	 * does an listtype operation to get a list of Modules the current user has access to.
	 * @return Response Object from the server.
	 */
	function listtypes(callback) {
		var params = {
			'operation':'listtypes',
			'sessionName':sessionId
		};
		var aMsg = myBundle.GetStringFromName('ErrComModAcc');
		httpClient.doGet(params, handleError(callback, aMsg));
	}

	/**
	 * does a getchallenge operation to get the challenge token to be used later for the login operation.
	 * @param username:String username of vtiger user who is trying to login to server.
	 * @return Response Object from the server.
	 */

	function getChallenge(username, callback) {
		var params = {
			'operation':'getchallenge',
			'username':username
		};
		var aMsg = myBundle.GetStringFromName('cantConnect');
		//var aMsg = "What should we put here?";
		httpClient.doGet(params, handleError(callback, aMsg));
	}

	/**
	 * The query operation provides a way to query vtiger for data.
	 * @param quesryString: The query to process.
	 * @return A list of Map containing the fields selected.
	 */
	function query(q, callback) {
		var params = {
			'operation':'query',
			'query': encodeURIComponent(q),
			'sessionName':sessionId
		};
		var aMsg = myBundle.GetStringFromName('QryFail');
		httpClient.doGet(params, handleError(callback, aMsg));
	}

	/**
	 * Does a login operation to authenticate and establish a session with server.
	 * @param username:String username of vtiger user who is trying to login to server.
	 * @param accessKey:String access key of vtiger user who is trying to login to server. found in my preferences page of the user.
	 * @return Response Object from the server.
	 */
	function login(username, accessKey, callback) {
		getChallenge(username, function (status, result) {
			if (status === true) {
				var token = result['token'];
				var params = {
					'operation':'login',
					'username':username,
					'accessKey':hex_md5(token+accessKey)
				};
				var aMsg = myBundle.GetStringFromName('ErrLogin');
				httpClient.doPost(params, handleError(
					function (success, loginResult) {
						if (success === true) {
							sessionId = loginResult['sessionName'];
							userId = loginResult.userId;
						}
						callback(success, loginResult);
					}, aMsg)
				);
			} else {
				callback(status, result);
			}
		});
	}

	function setSessionId(sessionName) {
		sessionId = sessionName;
	}

	function setUserId(id) {
		userId = id;
	}

	function getUserId() {
		return userId;
	}

	function setAsync(value) {
		httpClient.setAsync(value);
	}

	return {'login':login, 'listtypes':listtypes, 'describe':describe, 'create':create,
		'doLogout':doLogout, 'setSessionId':setSessionId, 'setUserId':setUserId, 'getUserId':getUserId,
		'query':query, 'setAsync':setAsync};
};

var client = null;
if (typeof factory == 'undefined') {
	var factory = null;
}

//save configuration data
function saveVtigerLoginDetails() {
	var username = document.getElementById('txtusername').value.trim();
	var accessKey = document.getElementById('txtpassword').value.trim();
	username = encode64(username);
	accessKey = encode64(accessKey);
	var vtigerURL=document.getElementById('txturl').value.trim();

	vtigerPreferences.setCharPref('Settings.Conf.temp_variable', 'true');
	if (username=='' || accessKey=='' || vtigerURL=='') {
		alertMessage(myBundle.GetStringFromName('AllManFields'));
		vtigerPreferences.setCharPref('Settings.Conf.temp_variable', 'false');
		return;
	} else {
		vtigerPreferences.setCharPref('Settings.Conf.vtigerUsername', username);
		vtigerPreferences.setCharPref('Settings.Conf.vtigerAccessKey', accessKey);
		vtigerPreferences.setCharPref('Settings.Conf.vtigerURL', vtigerURL);
	}
	//TODO: Think these errors are related.
	/* Error: uncaught exception: [Exception... "Component returned failure code: 0x8000ffff (NS_ERROR_UNEXPECTED) [nsIPrefBranch.getBoolPref]"  nsresult: "0x8000ffff (NS_ERROR_UNEXPECTED)"  location: "JS frame :: chrome://vtiger/content/vtiger.js :: vtStartup :: line 42"  data: no] */
	/* Error: uncaught exception: [Exception... "Component returned failure code: 0x8000ffff (NS_ERROR_UNEXPECTED) [nsIPrefBranch.getBoolPref]"  nsresult: "0x8000ffff (NS_ERROR_UNEXPECTED)"  location: "JS frame :: chrome://vtiger/content/vtigercrm_thunderbird.js :: saveVtigerLoginDetails :: line 528"  data: no] */
	if (vtigerPreferences.getBoolPref('Settings.Conf.firstRun')) {
		vtigerPreferences.setBoolPref('Settings.Conf.firstRun', false);
	}
	//Timeout added to fix in Firefox 2 where the window is not getting closed(in theory
	// it is getting closed but not refreshed with changed state)
	window.setTimeout(function () {
		window.close();
	}, 10);
}

function handleLoginResponse(response) {
	vtigerPreferences.setCharPref('Settings.Conf.session', response.sessionName);
	vtigerPreferences.setCharPref('Settings.Conf.userId', response.userId);
}

function isCapableClient(response) {
	// Was a straight equality test. But this works with api 0.2 and 0.22.

	if (apiVersion.indexOf(response.version) < 0) {
		//alertMessage("response.version NOT in apiVersion");
		return false;
	} else {
		//alertMessage("response.version found in apiVersion");
		return true;
	}
	//return response.version <= apiVersion;
}

function getObject(objectType, callback) {
	factory.get(objectType, callback);
}

function createAndCheck(obj, objectType, callback) {
	client.create(obj, objectType, callback);
}

function handleError(fn, msg) {
	return function (status, result) {
		if (status===true) {
			fn(result);
		} else {
			processErrorMsg(msg, result);
		}
	};
}

function handleTerminalError(fn, msg) {
	return function (status, result) {
		if (status===true) {
			fn(result);
		} else {
			processErrorMsg(msg, result);
		}
	};
}

function handleLoginTerminalError(fn, msg) {
	return function (status, result) {
		if (status===true) {
			fn(result);
		} else {
			vtigerPreferences.setCharPref('Settings.Conf.session', '');
			processErrorMsg(msg, result);
		}
	};
}

function processErrorMsg(msg, error) {
	if (typeof msg === 'undefined') {
		msg = '';
	}
	alertMessage(msg+' '+error['code']+'\n'+error['message']);
}

function init(url) {
	client = new VTWS_TBirdClient(url);
	factory = new WebserviceFactory(client);
}

function reuseSession() {
	var sessionId = vtigerPreferences.getCharPref('Settings.Conf.session');
	var userId = vtigerPreferences.getCharPref('Settings.Conf.userId');
	client.setSessionId(sessionId);
	client.setUserId(userId);
}

//enable Thunderbird extension
function enableTbirdExtension() {
	if (vtigerPreferences.prefHasUserValue('Settings.Conf.vtigerUsername')
		&& vtigerPreferences.prefHasUserValue('Settings.Conf.vtigerAccessKey')
		&& vtigerPreferences.prefHasUserValue('Settings.Conf.vtigerURL')
	) {
		var vtigerUsername = decode64(vtigerPreferences.getCharPref('Settings.Conf.vtigerUsername'));
		var vtigerAccessKey = decode64(vtigerPreferences.getCharPref('Settings.Conf.vtigerAccessKey'));
		var vtigerURL = vtigerPreferences.getCharPref('Settings.Conf.vtigerURL');
	} else {
		alertMessage(myBundle.GetStringFromName('upNotSet'));
		window.openDialog('chrome://vtiger/content/vtiger-settings.xul', '', 'chrome,resizable=no,titlebar,centerscreen,modal');
		return;
	}

	try {
		init(vtigerURL);
		var aMsg = myBundle.GetStringFromName('UnLogin');
		client.login(vtigerUsername, vtigerAccessKey, handleLoginTerminalError(function (result) {
			if (!isCapableClient(result)) {
				alertMessage(myBundle.GetStringFromName('extIncompat'));
				//alertMessage("Thunderbird plugin is incompatible with the given server");
				return;
			}
			handleLoginResponse(result);
			// Successfully logged in. Write time since epoch to user's pref data. Used to test for session timeout.
			notify(myBundle.GetStringFromName('loginSuccess'));
			updateSession();
			getLeadCoStatus();
		}, aMsg)); // This is the first error message.
	} catch (errorObject)	{
		alertMessage(myBundle.GetStringFromName('cantConnect'));
		//alertMessage("Cannot connect to the vtiger CRM server. Check the vtiger URL");
		return;
	}
}

//populate login information from the saved preferences.
function loadVtigerLoginDetails() {
	if (vtigerPreferences.prefHasUserValue('Settings.Conf.vtigerUsername')
		&& vtigerPreferences.prefHasUserValue('Settings.Conf.vtigerAccessKey')
		&& vtigerPreferences.prefHasUserValue('Settings.Conf.vtigerURL')
	) {
		document.getElementById('txtusername').value = decode64(vtigerPreferences.getCharPref('Settings.Conf.vtigerUsername'));
		document.getElementById('txtpassword').value = decode64(vtigerPreferences.getCharPref('Settings.Conf.vtigerAccessKey'));
		document.getElementById('txturl').value = vtigerPreferences.getCharPref('Settings.Conf.vtigerURL');
	} else {
		alertMessage(myBundle.GetStringFromName('upNotSet'));
	}
}

//method to invoke enableTbirdExtension().
function checkUserLoginSelection() {
	//if save button is pressed,call enableTbirdExtension()
	if (vtigerPreferences.getCharPref('Settings.Conf.temp_variable') == 'true') {
		enableTbirdExtension();
	} else {
		//if cancel button is pressed
		vtigerPreferences.setCharPref('Settings.Conf.temp_variable', 'false');
	}
}

function getModuleEntity(moduleName) {
	var entity = {};
	var fieldList = moduleFields[moduleName];
	for (var i=0; i<fieldList.length; i++) {
		var fieldName = fieldList[i];
		if (document.getElementById(fieldName).nodeName.toLowerCase() == 'checkbox') {
			entity[fieldName] = document.getElementById(fieldName).checked;
		} else {
			entity[fieldName] = document.getElementById(fieldName).value.trim();
		}
	}
	return entity;
}

function inArray(array, element) {
	for (var i=0; i < array.length; i++) {
		if (array[i] == element) {
			break;
		}
	}
	if (i < array.length) {
		return i;
	}
	return -1;
}

var validators = {};

// What is this for exactly? I don't think it is doing anything useful.
function validate(moduleName) {
	var fields = moduleDescribeFields[moduleName];

	var valid = true;
	for (var i=0; i<fields.length; i++) {
		var field = fields[i];
		var element = document.getElementById(field['name']);
		if (element == null) {
			valid = false;
			alertMessage(myBundle.formatStringFromName('cantBeUndef', [field['label']], 1));
			//alertMessage(field['label']+" cannot be undefined!!");
			break;
		}
		if (field.mandatory == 'true' || field.mandatory == true) {
			if (element.value == '') {
				valid = false;
				alertMessage(myBundle.formatStringFromName('cantBeEmpty', [field['label']], 1));
				//alertMessage(field['label']+" cannot be empty");
				break;
			}
		}
		if (typeof validators[field.type['name']] == 'function' && element.value != '') {
			if (!validators[field.type['name']](element.value)) {
				valid = false;
				alertMessage(myBundle.formatStringFromName('invValue', [field['label']], 1));
				//alertMessage(field['label']+" has invalid value");
				break;
			}
		}
	}
	return valid;
}

/**
 * checkSession
 * Determine if our session to the CRM should have timed out and if so, log
 * back in before proceeding.
 */
function checkSession() {
	var t_start = vtigerPreferences.getCharPref('Settings.Conf.online');
	var t_time = vtigerPreferences.getIntPref('Settings.Conf.sessionTime');
	var t_now = (new Date).getTime();

	if (t_now >= (parseInt(t_start) + t_time)) {
		enableTbirdExtension();
	}
	return;
}

/**
 * updateSession
 * When a successful vtiger communication occurs, update the session start
 * time pref to now().
 */
function updateSession() {
	var t_now = (new Date).getTime();
	vtigerPreferences.setCharPref('Settings.Conf.online', t_now);
	return;
}

//Get the mandatory status of the Company field in the Lead module
function getLeadCoStatus() {
	checkSession();
	factory.get('Leads', function (result) {
		var res = result['fields'];
		for (var i = 0; i < res.length; ++i) {
			if (res[i]['name'] == 'company') {
				vtigerPreferences.setBoolPref('Settings.Conf.LeadCoMandatory', res[i]['mandatory']);
			}
		}
	});
}