function onRefresh() {

    Xrm.Page.data.refresh(false);

}
function disableBookingHistoryAddnew() {
    var entity = Xrm.Page.data.entity.getEntityName();
    if (entity != "contact") return;
    else
        return false;
}
function buttonPlusHideOnMaxDelegates() {

    var maxNumberofDelegates = Xrm.Page.getAttribute("pdt_maxdelegatespercourse").getValue();
    var quantity = Xrm.Page.getAttribute("pdt_numberofdelegates").getValue();
    var course = Xrm.Page.getAttribute("pdt_course").getValue();
    
    var flag = false;

    if (maxNumberofDelegates != null && quantity != null && course != null) {

        if (maxNumberofDelegates <= quantity) {

            flag= false;
        } else {
            flag= true;
        }

    } else {

        flag= true;

    }
    return flag;

}

//HTML CONTROL EVENTS
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
            console.debug(Xrm.Page.getControl("WebResource_Radiusmap").getSrc());
        }
        console.debug(Xrm.Page.getControl("WebResource_Radiusmap").getSrc());
    }
}


//TRAINING REQUEST
//Training Request Delegate Gird Buttons 
function restrictDeleteFromSubgrid() {
    
    var status = Xrm.Page.getAttribute("statecode").getValue(); //0 Active,2 Cancelled, 3 Fullfilled, 4 Invoiced , 1 Submitted

    if (status == null) return true;
    if (status == 2 || status == 3 || status == 4) {
        Xrm.Utility.alertDialog("Training Request was "+Xrm.Page.getAttribute("statecode").getText() + " ,record can not be deleted");
        return false;
    } else return true;

}

function RefreshForm()
{
    Xrm.Utility.openEntityForm(Xrm.Page.data.entity.getEntityName(), Xrm.Page.data.entity.getId());
}

//Feedback Grid events on training request

function feedbackEnableRule(selectedRecord) {
    var functionName = "feedbackEnableRule";
    try {
        var fetch = "<fetch  >" +
                      "<entity name='pdt_feedback' >" +
                        "<attribute name='statuscode' />" +
                        "<filter>" +
                          "<condition attribute='pdt_feedbackid' operator='eq' value='" + selectedRecord[0] + "' />" +
                        "</filter>" +
                      "</entity>" +
                    "</fetch>";

        var results = XrmServiceToolkit.Soap.Fetch(fetch);
        var agree = false;
        if (results.length > 0) {

            var isfeedbackSubmitted = results[0].attributes["statuscode"].value;
            if (isfeedbackSubmitted != 749700000) {
                var msg = results[0].attributes["statuscode"].formattedValue + " Feedback cannot be Deleted, please change status to 'Enrolled' and try again";
                Xrm.Utility.confirmDialog(msg);
                return false;
            } else return true;
        }
    } catch (e) {

        Xrm.Utility.alertDialog(functionName + "Error: " + (e.message || e.description));

    }
}


/*
function deleteSubmittedFeedback(selectedRecord) {
    var functionName = "deleteSubmittedFeedback";
    try{
    var fetch = "<fetch  >" +
                  "<entity name='pdt_feedback' >" +
                    "<attribute name='statuscode' />" +
                    "<filter>" +
                      "<condition attribute='pdt_feedbackid' operator='eq' value='" + selectedRecord[0]+ "' />" +
                    "</filter>" +
                  "</entity>" +
                "</fetch>";
  
    var results = XrmServiceToolkit.Soap.Fetch(fetch);
    var agree = false;
    if (results.length >0) {

        var isfeedbackSubmitted= results[0].attributes["statuscode"].value;
        if (isfeedbackSubmitted != 749700000) {
            var msg = "Are you Sure? Delete Delegate With Status " + results[0].attributes["statuscode"].formattedValue + " ??";

            Xrm.Utility.confirmDialog(msg, function yesDelete() { agree = true; }, function noDelete() { agree = false;});
            return agree;
          
           
        } else return true;

    

    }
    } catch (e) {

        Xrm.Utility.alertDialog(functionName + "Error: " + (e.message || e.description));

    }
}
*/
/*/Create Trainer Invoice button & enable rules
function createTrainerInvoice() {

    var orderid = Xrm.Page.data.entity.getId();
    var entityName = "salesorder";
    var requestName = "pdt_CreateTrainerInvoice";
    var selectedTrainer = Xrm.Page.getAttribute("pdt_trainer").getValue();

    Xrm.Page.ui.clearFormNotification("3");
    if (Xrm.Page.data.entity.getIsDirty()) {
        //Xrm.Utility.confirmDialog("Please Save Training Request First to Proceed", saveRecord());
        Xrm.Utility.confirmDialog("Please click ok to Save Training Request",
            function () {
                Xrm.Page.ui.setFormNotification("Please wait ..Saving Training Request", "INFORMATION", "1")
                saveRecord();
                Xrm.Page.ui.clearFormNotification("1");
            });
        
        return;
       
    }else
    if (!selectedTrainer) {
        Xrm.Utility.alertDialog("Please Select a Trainer");
        Xrm.Page.ui.setFormNotification("Please select a trainer to raise Trainer Invoice", "ERROR", "2");
        Xrm.Page.ui.clearFormNotification("1");
        return;
    }
    var isFeedbackSubmited = getFeedbackSubmitStatus();

    if (!isFeedbackSubmited) {
        Xrm.Utility.alertDialog("Please Submitt Feedback For All Deligates");
        Xrm.Page.ui.setFormNotification("Feedback not submitted", "ERROR", "3");
        Xrm.Page.ui.clearFormNotification("1");
        Xrm.Page.ui.clearFormNotification("2");
        return;
    }


    executeAction(orderid, entityName, requestName);
}
function executeAction(entityId, entityName, requestName) {
    // Creating the request XML for calling the Action

    var requestXML = ""
    requestXML += "<s:Envelope xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\">";
    requestXML += "  <s:Body>";
    requestXML += "    <Execute xmlns=\"http://schemas.microsoft.com/xrm/2011/Contracts/Services\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\">";
    requestXML += "      <request xmlns:a=\"http://schemas.microsoft.com/xrm/2011/Contracts\">";
    requestXML += "        <a:Parameters xmlns:b=\"http://schemas.datacontract.org/2004/07/System.Collections.Generic\">";
    requestXML += "          <a:KeyValuePairOfstringanyType>";
    requestXML += "            <b:key>Target</b:key>";
    requestXML += "            <b:value i:type=\"a:EntityReference\">";
    requestXML += "              <a:Id>" + entityId + "</a:Id>";
    requestXML += "              <a:LogicalName>" + entityName + "</a:LogicalName>";
    requestXML += "              <a:Name i:nil=\"true\" />";
    requestXML += "            </b:value>";
    requestXML += "          </a:KeyValuePairOfstringanyType>";
    requestXML += "        </a:Parameters>";
    requestXML += "        <a:RequestId i:nil=\"true\" />";
    requestXML += "        <a:RequestName>" + requestName + "</a:RequestName>";
    requestXML += "      </request>";
    requestXML += "    </Execute>";
    requestXML += "  </s:Body>";
    requestXML += "</s:Envelope>";
    
    var req = new XMLHttpRequest();
    req.open("POST", Xrm.Page.context.getClientUrl() + "/XRMServices/2011/Organization.svc/web", false);
    req.setRequestHeader("Accept", "application/xml, text/xml, /");
    req.setRequestHeader("Content-Type", "text/xml; charset=utf-8");
    req.setRequestHeader("SOAPAction", "http://schemas.microsoft.com/xrm/2011/Contracts/Services/IOrganizationService/Execute");
   
    req.send(requestXML);
   
    if (requestName == "pdt_CreateTrainerInvoice") {
        var invoiceId = "";

        if (req.readyState == 4 && req.status == 200) {

            response = req.responseXML.getElementsByTagName("a:Id");
            for (i = 0; i < response.length; i++) {
                invoiceId = response[i].childNodes[0].nodeValue;

            }

            if (invoiceId != "") {
                Xrm.Utility.confirmDialog(
                    "Navigate to Trainer Invoice?",
                    function () {
                        Xrm.Utility.openEntityForm("invoice", invoiceId);
                    },

                function () {
                    var subgrid = Xrm.Page.ui.controls.get("sg_invoice");
                    subgrid.refresh();
                }

                );
            }
            else
                Xrm.Utility.alertDialog("Canot Create Invoice ");
        }
    }
}
*/
/*
function getFeedbackSubmitStatus() {
    var request = Xrm.Page.data.entity.getId();
    try {
        var fetch = "<fetch distinct='true' >" +
          "<entity name='pdt_feedback' >" +
            "<attribute name='statuscode' alias='submittStatus' />" +
            "<filter type='and' >" +
              "<condition attribute='statecode' operator='eq' value='0' />" +
              "<condition attribute='pdt_order' operator='eq' value='" + request + "' />" +
            "</filter>" +
          "</entity>" +
        "</fetch>";

        var results = XrmServiceToolkit.Soap.Fetch(fetch);
        var status = true;

        if (results == null || results.length == 0) return false;

        for (var i = 0; i < results.length; i++) {
            if (status) {
                status = results[i].attributes["submittStatus"].value;
            }

        }
        return status;
    } catch (e) {
        alert(e.message);
    }

}
*/

function trainerInvoiceEnableRule() {
    var enableRule = false;   
    var totaltrainerexpense = Xrm.Page.getAttribute("pdt_totaltrainerexpense").getValue();
    var status = Xrm.Page.getAttribute("statecode").getValue();
   // var submitStatus = Xrm.Page.getAttribute("pdt_feedbackstatus").getValue();
   // var trainingprovider = Xrm.Page.getAttribute("pdt_trainingprovider").getValue();
    var selectedTrainer = Xrm.Page.getAttribute("pdt_trainer").getValue();

    var orderId = Xrm.Page.data.entity.getId();

    //var eedback = false;
    var invoice = getInvoices("TRAINER");

    
    if (totaltrainerexpense && totaltrainerexpense > 0 && submitStatus() && status != 2 && selectedTrainer && invoice==null)
        enableRule = true;
    else
        enableRule = false;
    return enableRule;
}



function getInvoices(invoicetype) {
    var functionName = "invoiceStatus";
    try{
        var request = Xrm.Page.data.entity.getId();
    
        var fetch = "<fetch><entity name='invoice' >" +
                        "<attribute name='invoiceid' />" +
                        "<attribute name='pdt_invoicetype' />" +
                        "<attribute name='pdt_cancellationinvoice' />" +
                        "<filter>" +
                          "<condition attribute='salesorderid' operator='eq' value='" + request + "' />" +
                        "</filter>" +
                      "</entity>" +
                    "</fetch>";
        var results = XrmServiceToolkit.Soap.Fetch(fetch);
        var invData = {};
        var invoice = null;
      //  userData = { name: resultName, id: resultId, address: searchString, type: entityType, parent: parent };

        for (var i = 0; i < results.length; i++) {
            var result = results[i];
            invData = { id: result.attributes["invoiceid"].value, type: result.attributes["pdt_invoicetype"].formattedValue, cancelled: result.attributes["pdt_cancellationinvoice"].formattedValue };
            
            if (invoicetype == "TRAINER" && invData.type=="T") {

                invoice= invData;
            }
            if (invoicetype == "CLIENT" && invData.type=="C") {

                invoice= invData;
            }
              
            if (invoicetype == "CANCEL" && invData.type=="C" && invData.cancelled=="YES") {

                invoice= invData;
            }
        }


        return invoice;
    } catch (e) {

        Xrm.Utility.alertDialog(functionName + "Error: " + (e.message || e.description));

    }
}



function submitStatus() {
    var request = Xrm.Page.data.entity.getId();
    var functionName = "submitStatus";
    try {
        var fetch = "<fetch distinct='true' >" +
          "<entity name='pdt_feedback' >" +
            "<attribute name='statuscode' alias='submittStatus' />" +
            "<filter type='and' >" +
              "<condition attribute='statecode' operator='eq' value='0' />" +
              "<condition attribute='pdt_order' operator='eq' value='" + request + "' />" +
            "</filter>" +
          "</entity>" +
        "</fetch>";

        var results = XrmServiceToolkit.Soap.Fetch(fetch);
        var status = true;

        if (results == null || results.length == 0) return false;


        for (var i = 0; i < results.length; i++) {
            var result = results[i];
            var scode = result.attributes["submittStatus"].value;

            if ( scode == 749700000 ) {
                status = false;
            }
            
        }
        return status;
    } catch (e) {

        Xrm.Utility.alertDialog(functionName + "Error: " + (e.message || e.description));

    }
}

function reopenTrainingRequestEnableRule() {

    var status = Xrm.Page.getAttribute("statecode").getValue();
    if (status !=0 )
        return true;
    else
        return false;

}

// Training invoice show and hide process buttons
function hideShowTrainingRequestProcessButtons() {

    var totalAmount = Xrm.Page.getAttribute("totalamount").getValue();
    if (totalAmount != undefined)
        if (totalAmount > 0) return true;
    return false;
}

//INVOICE
// Bill Invoice Button on "All Course Invoice - New" view
function billInvoiceEnableRule(selectedControl) {
    
    try {
        var viewName = selectedControl.get_viewTitle();

        if (viewName && (viewName == "All Course Invoice - New" || viewName == "All Trainer Invoice - New"))
            return true;
        else
            return false;
    }
    catch (e) {
        alert(e.message);
    }
}
function reopenInvoiceEnableRule() {
    var status = Xrm.Page.getAttribute("statecode").getValue();
    var statusReason = Xrm.Page.getAttribute("statuscode").getValue();
    if (status == 3 && statusReason == 100003)
        return true;
    else
        return false;
}

function createInvoiceEnableRule() {
    var noOfDelegates = Xrm.Page.getAttribute("pdt_numberofdelegates").getValue();
    var totalAmount = Xrm.Page.getAttribute("totalamount").getValue();
    var invoice = getInvoices("CLIENT");

    if (invoice == null) {
        if (noOfDelegates && totalAmount) {
            if ((noOfDelegates > 0) && (totalAmount > 0))
                return true;
            else
                return false;
        }
    } else
        return false;
}
//function createCourseInvoiceEnableRule() {
//    var invoiced = Xrm.Page.getAttribute("pdt_invoiced").getValue();
//    if (invoiced == 1)
//        return false;
//    else
//        return true;
//}

