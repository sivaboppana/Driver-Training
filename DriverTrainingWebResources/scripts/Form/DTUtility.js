function errorHandler(error) {
    alert(error.message);
    writeMessage(error.message);
}
function writeMessage(message) {
    /*
    var li = document.createElement("li");

    setElementText(li, message);


    output.appendChild(li);
    */
    console.log(message);

}

function setElementText(element, text) {
    if (element.innerText != undefined) {
        element.innerText = text;
    }
    else {
        element.textContent = text;
    }
}

function formattedDate(dateString) {
    var currentDate = null;
    if (dateString != null) {
        var  dd = dateString.getDate();
        var mm = dateString.getMonth() + 1; //January is 0!
        var yyyy = dateString.getFullYear();
        var hh = dateString.getHours();
        var mi = dateString.getMinutes();

        currentDate = yyyy + "-" + mm + "-" + dd + ":" + hh + ":" + mi;

    }
    return  currentDate ;
}
function formattedDateNoTime(dateString) {
    var currentDate = null;
    if (dateString != null) {
        var dd = dateString.getDate();
        var mm = dateString.getMonth() + 1; //January is 0!
        var yyyy = dateString.getFullYear();
        var hh = dateString.getHours();
        var mi = dateString.getMinutes();

        currentDate = yyyy + "-" + mm + "-" + dd ;

    }
    return currentDate;
}

function MakeAnId(prefix) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    for (var i = 0; i < 5; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return prefix+"-" + text;
}

function getEntityObject(obj, type) {
    if (obj != null) {
        var entity = new Array();
        entity[0] = new Object();
        entity[0].id = obj.Id;
        entity[0].name = obj.Name;
        entity[0].entityType = type;
        return entity;
    } else {
        return null;
    }
}


function getEntityObjectV2(obj, type) {
    if (obj != null) {
        var entity = new Array();
        entity[0] = new Object();
        entity[0].id = obj.id;
        entity[0].name = obj.name;
        entity[0].entityType = type;
        return entity;
    } else {
        return null;
    }
}

function getEntityObjectV3(id,name, type) {
    
        var entity = new Array();
        entity[0] = new Object();
        entity[0].id = id;
        entity[0].name = name;
        entity[0].entityType = type;
        return entity;
    
}

function compositeAddress(fieldName, line1, line2, line3, city, state, postcode, country, phone, fax) {
    var functionName = "compositeAddress";
    try {

        var accountid = Xrm.Page.getAttribute(fieldName).getValue() != null ? Xrm.Page.getAttribute(fieldName).getValue()[0].id : null;
        if (accountid == null) return;

        var myfetchXml = "<fetch  >" +
                          "<entity name='account' >" +
                            "<attribute name='address1_line1' />" +
                            "<attribute name='address1_line2' />" +
                            "<attribute name='address1_line3' />" +
                            "<attribute name='address1_city' />" +
                            "<attribute name='address1_stateorprovince' />" +
                            "<attribute name='address1_postalcode' />" +
                            "<attribute name='address1_county' />" +
                            
                            "<filter>" +
                              "<condition attribute='accountid' operator='eq' value='" + accountid + "' />" +
                            "</filter>" +
                          "</entity>" +
                        "</fetch>";

        var results = XrmServiceToolkit.Soap.Fetch(myfetchXml);

        if (results.length > 0) {

            var result = results[0];

            Xrm.Page.getAttribute(line1).setValue(result.attributes["address1_line1"]!=null ?result.attributes["address1_line1"].value:null);
            Xrm.Page.getAttribute(line2).setValue(result.attributes["address1_line2"] != null ? result.attributes["address1_line2"].value : null);
            Xrm.Page.getAttribute(line3).setValue(result.attributes["address1_line3"] != null ? result.attributes["address1_line3"].value : null);
            Xrm.Page.getAttribute(city).setValue(result.attributes["address1_city"] != null ? result.attributes["address1_city"].value : null);
            Xrm.Page.getAttribute(state).setValue(result.attributes["address1_stateorprovince"] != null ? result.attributes["address1_stateorprovince"].value : null);
            Xrm.Page.getAttribute(postcode).setValue(result.attributes["address1_postalcode"] != null ? result.attributes["address1_postalcode"].value : null);
            Xrm.Page.getAttribute(country).setValue(result.attributes["address1_county"] != null ? result.attributes["address1_county"].value : null);
        } else {

            Xrm.Page.getAttribute(line1).setValue(null);
            Xrm.Page.getAttribute(line2).setValue(null);
            Xrm.Page.getAttribute(line3).setValue(null);
            Xrm.Page.getAttribute(city).setValue(null);
            Xrm.Page.getAttribute(state).setValue(null);
            Xrm.Page.getAttribute(postcode).setValue(null);
            Xrm.Page.getAttribute(country).setValue(null);

        }


    }
    catch (e) {

        Xrm.Utility.alertDialog(functionName + "Error: " + (e.message || e.description));
    }

}


function refreshRadiusMap() {

    //get record id
    var recordId = Xrm.Page.data.entity.getId();
    //validate recordid
    if (recordId != null && recordId != undefined && recordId != "") {
        //get the querystring from the control

       
            var querystring = Xrm.Page.getControl("WebResource_Radiusmap").getSrc();
            console.debug("DT " + querystring.search("data"))
            //set the new querystring      
            if (querystring.search("data") == -1) {
                Xrm.Page.getControl("WebResource_Radiusmap").setSrc("");
                Xrm.Page.getControl("WebResource_Radiusmap").setSrc(querystring + "&data=" + recordId);
               console.debug( Xrm.Page.getControl("WebResource_Radiusmap").getSrc());
            }
    
            console.debug(Xrm.Page.getControl("WebResource_Radiusmap").getSrc());
         }
}

function saveRecord() {
    Xrm.Page.data.entity.save();

}
