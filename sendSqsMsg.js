importPackage(org.apache.http.client.methods);
importPackage(org.apache.http.impl.client);
importPackage(org.apache.http.entity);
importPackage(java.lang)
load("crypto_js/components/enc-base64.js");
load("crypto_js/components/hmac-sha256.js");
load("crypto_js/components/hmac_sha256.js");
//load("/Users/ApigeeCorporation/Dropbox/Gigs/oanda/apis/oauth/apiproxy/resources/jsc/hmacsha1.js");

/////////////////// Signed URL /////////////////////////////////////////////////////
function generateSignedURL(actionName, form, accessKeyId, secretKey, endpoint, version) {
    var url = endpoint + "?SignatureVersion=1&Action=" + actionName + "&Version=" + encodeURIComponent(version) + "&";
    for (var i = 0; i < form.elements.length;++ i) {
        var elementName = form.elements[i].name;
        
        var elementValue = null;
        
        if (form.elements[i].type == 'text') {
            elementValue = form.elements[i].value;
        } else if (form.elements[i].type == 'select-one') {
            elementValue = form.elements[i].options[form.elements[i].selectedIndex].value;
        }
        if (elementValue) {
            url += elementName;
            url += "=";
            url += encodeURIComponent(elementValue);
            url += "&";
        }
    }
    var timestamp = getNowTimeStamp();
    url += "Timestamp=" + encodeURIComponent(timestamp);
    
    url += "&AWSAccessKeyId=" + encodeURIComponent(accessKeyId);
    var signature = generateV1Signature(url, secretKey);
    url += "&Signature=" + encodeURIComponent(signature);
    
    return url;
}
/////////////////// Auth /////////////////////////////////////////////////////
Date.prototype.toISODate =
new Function ("with (this)\n    return " +
"getFullYear()+'-'+addZero(getMonth()+1)+'-'" +
"+addZero(getDate())+'T'+addZero(getHours())+':'" +
"+addZero(getMinutes())+':'+addZero(getSeconds())+'.000Z'");

function addZero(n) {
    return (n < 0 || n > 9 ? "": "0") + n;
}
function getNowTimeStamp() {
    var time = new Date();
    var gmtTime = new Date(time.getTime() + (time.getTimezoneOffset() * 60000));
    var d = gmtTime.toISODate();
    print("Date.toISODate=" + d);
    return d;
}


function ignoreCaseSort(a, b) {
    var ret = 0;
    a = a.toLowerCase();
    b = b.toLowerCase();
    if (a > b) ret = 1;
    if (a < b) ret = -1;
    return ret;
}

/////////////////// String To Sign /////////////////////////////////////////////////////
function getStringToSign(url) {
    
    var stringToSign = "";
    var query = url.split("?")[1];
    
    var params = query.split("&");
    params.sort(ignoreCaseSort);
    for (var i = 0; i < params.length; i++) {
        var param = params[i].split("=");
        var name = param[0];
        var value = param[1];
        if (name == 'Signature' || undefined == value) continue;
        stringToSign += name;
        stringToSign += decodeURIComponent(value);
    }
    
    return stringToSign;
}

/////////////////// Build Form Fields /////////////////////////////////////////////////////
function getFormFieldsFromUrl (url) {
    var fields = "";
    var query = url.split("?")[1];
    var params = query.split("&");
    for (var i = 0; i < params.length; i++) {
        var param = params[i].split("=");
        var name = param[0];
        var value = param[1];
        fields += "<input type=\"hidden\" name=\"" + name + "\" value=\"" + decodeURIComponent(value) + "\">";
    }
    return fields;
}

function spaceFormEncode (str) {
    return encodeURIComponent(str).replace(/%20/g, '+');
}

Math.base = function base(n, to, from) {
    return parseInt(n, from || 10).toString(to);
}

function toBin(str) {
    var st, i, j, d;
    var arr =[];
    var len = str.length;
    for (i = 1; i <= len; i++) {
        //reverse so its like a stack
        d = str.charCodeAt(len - i);
        for (j = 0; j < 8; j++) {
            st = d % 2 == '0' ? "class='zero'": ""
            arr.push(d % 2);
            d = Math.floor(d / 2);
        }
    }
    //reverse all bits again.
    return arr.reverse().join("");
}

function testSign() {
    var msg = "MessageBody=This+is+my+message+text.++OKay+Yes.&Action=SendMessage&Version=2012-11-05";
    var ts = getNowTimeStamp().replace(/-/g, "");
    var cr = "POST" + "\n" +
   // "sqs.us-east-1.amazonaws.com" + "\n" +
    "/423547925985/TestQueue" + "\n" +
    "\n" +
    "content-type:application/x-www-form-urlencoded" + "\n" +
    "host:sqs.us-east-1.amazonaws.com" + "\n" +
    "user-agent:sqs-javascript-client" + "\n" +
    "x-amz-content-sha256:" + CryptoJS.SHA256(msg) + "\n" +
    "x-amz-date:" + ts + "\n\n" +
    "content-type;host;user-agent;x-amz-content-sha256;x-amz-date" + "\n" +
    CryptoJS.SHA256(msg);
    
    var stringToSign = "AWS4-HMAC-SHA256" + "\n" +
    ts.substring(0, ts.indexOf('.')).replace(/:/g, "")+"Z" + "\n" +
    ts.substr(0, ts.indexOf('T')) + "/us-east-1/sqs/aws4_request" + "\n" +
    CryptoJS.SHA256(cr);
    
    print("cononical:\n");
    print(cr);
    print("\n\n\n");
    print(stringToSign);
    //"AWSAccessKeyId="+encodeURIComponent("AKIAIWXZMJLVODQOQSNA")+"&Action=SendMessage&MessageBody=Your%20Message%20Text&SignatureMethod=HmacSHA256&SignatureVersion=2&Timestamp=" + encodeURIComponent(getNowTimeStamp()) + "&Version="+encodeURIComponent("2012-11-05");
    
    
    secret = "KA8IVlOtOfdPsM6JMmqDd957u1uxS69sR919Xeqd";
    date = ts.substr(0, ts.indexOf('T'));
    region = "us-east-1";
    service = "sqs";
    
    
    
    kSecret = "AWS4" + secret;
    kDate = CryptoJS.HmacSHA256(date, kSecret);
    //kDate = Math.base(hex_hmac_sha256(kSecret, toBin(date)), 2, 16);
    
    kRegion = CryptoJS.HmacSHA256(region, kDate);
    //kRegion = Math.base(hex_hmac_sha256(kDate, toBin(region)), 2, 16);
    
    kService = CryptoJS.HmacSHA256(service, kRegion);
    //kService = Math.base(hex_hmac_sha256(kRegion, toBin(service)), 2, 16);
    
    kSigning = CryptoJS.HmacSHA256("aws4_request", kService);
    //kSigning = Math.base(hex_hmac_sha256(kService, toBin("aws4_request")), 2, 16);
    
    
    signature = CryptoJS.HmacSHA256(stringToSign, kSigning);
    //signature = hex_hmac_sha256(kSigning, toBin(stringToSign));
    
    
    
    
    
    var httpClient = new DefaultHttpClient();
    var httpPost = new HttpPost("https://sqs.us-east-1.amazonaws.com/423547925985/TestQueue");
    httpPost.setHeader("host", "sqs.us-east-1.amazonaws.com");
    httpPost.setHeader("User-Agent", "sqs-javascript-client");
    httpPost.setHeader("Content-Type", "application/x-www-form-urlencoded");
    httpPost.setHeader("X-Amz-Date", ts);
    httpPost.setHeader("X-Amz-Content-Sha256", CryptoJS.SHA256(msg));
    httpPost.setHeader("Authorization", "AWS4-HMAC-SHA256 Credential=AKIAIWXZMJLVODQOQSNA/"+date+"/us-east-1/sqs/aws4_request,SignedHeaders=content-type;host;user-agent;x-amz-content-sha256;x-amz-date,Signature="+signature.toString(CryptoJS.enc.Hex));
    //httpPost.setHeader("X-Amz-Algorithm", "AWS4-HMAC-SHA256");
    //httpPost.setHeader("X-Amz-Credential", "sqs-javascript-client");
    //httpPost.setHeader("X-Amz-SignedHeaders", "");
    
    var entity = new StringEntity(msg, ContentType.APPLICATION_FORM_URLENCODED);
    httpPost.setEntity(entity);
    
    var response = httpClient.execute(httpPost);
    var entity = response.getEntity();
    entity.writeTo(System.out);
}






//MessageBody=This+is+my+message+text.&Action=SendMessage&Version=2012-11-05
/*
 *
 *
POST
/423547925985/MyQueue

host:sqs.us-east-1.amazonaws.com
user-agent:aws-sdk-java/1.3.30 Mac_OS_X/10.7.5 Java_HotSpot(TM)_64-Bit_Server_VM/20.12-b01-434
x-amz-content-sha256:4d5d9ad6a466b01ea3c5a01b21732d04c789be1c21c0bba327bd223047c17ea9
x-amz-date:20130131T191500Z

host;user-agent;x-amz-content-sha256;x-amz-date
4d5d9ad6a466b01ea3c5a01b21732d04c789be1c21c0bba327bd223047c17ea9



AWS4-HMAC-SHA256
20130131T191500Z
20130131/us-east-1/sqs/aws4_request
ca7fc5cca642507088fbcbec6855ed242d4f44927868378bf16c4adfe42065bb


AWS4-HMAC-SHA256 Credential=AKIAIWXZMJLVODQOQSNA/20130131/us-east-1/sqs/aws4_request, SignedHeaders=host;user-agent;x-amz-content-sha256;x-amz-date, Signature=52a429af84f86c64954e2ab572e4c3aa04693c5ce616289fe855202f245ae5ee
 */

function sendRequest() {
    var form = document.forms[0];
    var accessKeyId = 'AKIAIWXZMJLVODQOQSNA';
    var secretKey = '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';
    var url = generateSignedURL("SendMessage", form, accessKeyId, secretKey, "https://queue.amazonaws.com", "2012-11-05");
    //var postFormArea = document.getElementById("PostFormArea");
    //postFormArea.innerHTML = getFormFieldsFromUrl(url);
    //var postForm = document.getElementById("PostForm");
    var queueUrl = 'https://sqs.us-east-1.amazonaws.com/423547925985/TestQueue'
    //postForm.action = queueUrl;
    //form[ 'QueueUrl'].value = "";
    //postForm.submit();
    //form[ 'QueueUrl'].value = queueUrl;
    /*
    <form id="PostForm" name="PostForm" target="_new" action="" enctype="application/x-www-form-urlencoded" method="post">
    <div id="PostFormArea">
    <input type="hidden" name="SignatureVersion" value="1">
    <input type="hidden" name="Action" value="SendMessage">
    <input type="hidden" name="Version" value="2012-11-05">
    <input type="hidden" name="Timestamp" value="2013-01-30T19:40:59.000Z">
    <input type="hidden" name="AWSAccessKeyId" value="AWS Access Key ID">
    <input type="hidden" name="Signature" value="ZclsJ7XSOUuNG6jsYcL0iVfP06A="></div>
    </form>
     */
    var body = "";
}

/*as
function putMapValue(mapName, key, value) {
var path = '/' + mapName;

var jsonBody = '{ "entry" : [ { "name" : "' + key + '", "value" : "' + value + '" } ], "name" : "' + mapName + '"}';

var headers = {
'Content-Type': 'application/x-www-form-urlencoded'
};

var req = new Request(urlBase + path, "PUT", headers, jsonBody);

if (req != undefined) {
var t0 = new Date().getTime();
var ex = httpClient.send(req);
ex.waitForComplete();
var tf = new Date().getTime();
context.setVariable("httpClientResponseTime", (tf - t0) + "");
context.setVariable("mapResponse.PUT.status.code", ex.getResponse().status);
context.setVariable("mapResponse.PUT.content", ex.getResponse().content);
context.setVariable("mapResponse.PUT.body", jsonBody);
context.setVariable("mapResponse.PUT.key", key);
context.setVariable("mapResponse.PUT.value", value);
} else {
context.setVariable("mapResponse.PUT.error", "true");
}

if (ex.getResponse().status > 400) {
return false;
} else {
return true;
}
}*/

function generateV2Signature(url, key) {
    //var stringToSign = getStringToSign(url);
    //var signed = b64_hmac_sha256(key, url);
    return //signed;
}

//1cc5752fffa3912f3abad052f2969c34b881f7752301691a3c3f35f67b2a11b3

var conString = "POST\n" +
"/\n" +
"\n" +
"host:sqs.us-east-1.amazonaws.com\n" +
"user-agent:aws-sdk-java/1.3.30 Mac_OS_X/10.7.5 Java_HotSpot(TM)_64-Bit_Server_VM/20.12-b01-434\n" +
"x-amz-content-sha256:4d201f95dc66657ee0526aece818b84f0a85427f5088dd4c0533422065cd9497\n" +
"x-amz-date:20130201T203021Z\n" +
"\n" +
"host;user-agent;x-amz-content-sha256;x-amz-date\n" +
"4d201f95dc66657ee0526aece818b84f0a85427f5088dd4c0533422065cd9497";


//print(conString);
//print("\n\n\n");
//print("hashed\n");
//var hash = CryptoJS.SHA256(conString);
//print(hash.toString(CryptoJS.enc.Hex));



var s = testSign();
//var ss = generateV2Signature(s, 'KA8IVlOtOfdPsM6JMmqDd957u1uxS69sR919Xeqd');
//print("Sign String=" + s);
//print("Signature=" + ss);

//print(s + "&Signature=" + encodeURIComponent(ss));