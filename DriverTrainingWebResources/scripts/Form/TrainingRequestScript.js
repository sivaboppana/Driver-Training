/// FILTERS
function loadFilters() {
    var functionName = "loadFilters";
    try {
        addCourseTypeFilter();
        defaultcustomer();
        addRequesterFilter();
        addTrainingProviderFilter();
        addTrainerFilter();
        addSiteFilters();
        addDelegateGridEvents();
       // addInvoiceGridEvents();
        
    }  catch (e) {
        Xrm.Utility.alertDialog(functionName + "Error: " + (e.message || e.description));
    }
}

//Course Type Filter
function addCourseTypeFilter() {

    Xrm.Page.getControl("pdt_course").addPreSearch(function () {
        addLookupCourseTypeFilter();

    });
}
function addLookupCourseTypeFilter() {
    var functionName = "addLookupCourseTypeFilter";
    try {
        if (Xrm.Page.getAttribute("pricelevelid").getValue() == null) return;

        var coursetype = Xrm.Page.getAttribute("pdt_coursetype").getValue();
        var pricelevelid = Xrm.Page.getAttribute("pricelevelid").getValue()[0].id;
        if (coursetype != null) {
            //var fetchXml = "<filter type='and'><condition attribute='pdt_coursetype' value='" + coursetype + "' operator='eq'/></filter>";
            var fetchXml = " <filter><condition attribute='pdt_coursetype' operator='eq' value='" + coursetype + "' />";
            fetchXml = fetchXml + "<condition attribute='pricelevelid' operator='eq' value='" + pricelevelid + "' /></filter>";


            Xrm.Page.getControl("pdt_course").addCustomFilter(fetchXml);

        }
    } catch (e) {

        Xrm.Utility.alertDialog(functionName + "Error: " + (e.message || e.description));

    }
}
function onPricelistChange() {
    Xrm.Page.getAttribute("pdt_coursetype").setValue(null);
    Xrm.Page.getAttribute("pdt_course").setValue(null);

}
function onCourseTypeChange() {
    Xrm.Page.getAttribute("pdt_course").setValue(null);

}
// Customer Filter
function defaultcustomer(){

    Xrm.Page.getControl("customerid").addPreSearch(addFilter);

}

function addFilter(){
    var functionName = "defaultcustomer";
    try {
  
        var customerAccountFilter1 = "<filter type='and'><condition attribute='contactid' operator='null' /><condition attribute='customertypecode' operator='eq' value='3' /></filter>";
        Xrm.Page.getControl("customerid").addCustomFilter(customerAccountFilter1, "contact");
       
       // var customerAccountFilter2 = "<filter type='and'><condition attribute='customertypecode' operator='neq' value='3' /></filter>";
        //Xrm.Page.getControl("customerid").addCustomFilter(customerAccountFilter2, "account");
    }catch(e){
        Xrm.Utility.alertDialog(functionName + "Error: " + (e.message || e.description));
    }
}

function setPriceListToDefaultPriceList() {
    var custid = Xrm.Page.getAttribute("customerid").getValue()[0].id;
    var functionName = "setPriceListToDefaultPriceList";
    try{
        if(custid != null){
    
            var fetch ="<fetch><entity name='account' ><attribute name='defaultpricelevelid' /><filter>";
            fetch = fetch + "<condition attribute='accountid' operator='eq' value='" + custid + "' /></filter>";
            fetch = fetch + "<link-entity name='pricelevel' from='pricelevelid' to='defaultpricelevelid' alias='pl' ><attribute name='name' /></link-entity></entity></fetch>";
            var results = XrmServiceToolkit.Soap.Fetch(fetch);
            if (results.length > 0) {

                var result = results[0];
                var pricelevelid = result.attributes["defaultpricelevelid"].id !=null ? result.attributes["defaultpricelevelid"].id : null;
                if (pricelevelid != null) {
                    var obj = {};
                    obj.id = pricelevelid;
                    obj.name = results[0].attributes["pl.name"].value;
                    Xrm.Page.getAttribute("pricelevelid").setValue(getEntityObjectV2(obj, "pricelevel"));
                }
            }
        }
    } catch (e) {

        Xrm.Utility.alertDialog(functionName + "Error: " + (e.message || e.description));

    }
}

// Requester Filter
function addRequesterFilter() {
  
    Xrm.Page.getControl("pdt_requester").addPreSearch(function () {
        addLookupRequesterNameFilter("pdt_requester");

    });
    Xrm.Page.getControl("pdt_alternaterequester").addPreSearch(function () {
        addLookupRequesterNameFilter("pdt_alternaterequester");

    });
    Xrm.Page.getControl("pdt_safetymanager").addPreSearch(function () {
        addLookupRequesterNameFilter("pdt_safetymanager");

    });
}
function addLookupRequesterNameFilter(requester) {
    var functionName = "addLookupRequesterNameFilter";
    var contactid;

    try {
        if (Xrm.Page.getAttribute("customerid").getValue() == null) {
            Xrm.Utility.alertDialog("Please select Customer to Proceed");
            return;
        }

        var customerid = Xrm.Page.getAttribute("customerid").getValue()[0].id;


        if (customerid != null) {



            //var fetchXml = " <filter type='and' ><condition attribute='parentcustomerid' operator='eq' value='" + customerid + "' />";
            //fetchXml = fetchXml + " <condition attribute='customertypecode' operator='eq' value='749700001' /></filter>";//749700001 is Manager

            var fetchXml = " <filter type='and' ><condition attribute='customertypecode' operator='eq' value='749700001' /></filter>";//749700001 is Manager


            Xrm.Page.getControl(requester).addCustomFilter(fetchXml);//,"account");

        } 

           
        
    } catch (e) {

        Xrm.Utility.alertDialog(functionName + "Error: " + (e.message || e.description));

    }
}

// Training Provider Filters
function addTrainingProviderFilter() {

    Xrm.Page.getControl("pdt_trainingprovider").addPreSearch(function () {
        addLookupTrainingProviderFilter();

    });
}
function addLookupTrainingProviderFilter() {
    var functionName = "addLookupTrainingProviderFilter";
    try {
       
        var fetchXml = " <filter type='and' ><condition attribute='customertypecode' operator='eq' value='10' /></filter>";
        Xrm.Page.getControl("pdt_trainingprovider").addCustomFilter(fetchXml);
        
    } catch (e) {

        Xrm.Utility.alertDialog(functionName + "Error: " + (e.message || e.description));

    }
}
// Trainer Filters
function addTrainerFilter() {

    Xrm.Page.getControl("pdt_trainer").addPreSearch(function () {
        addLookupTrainerFilter();

    });
}
function addLookupTrainerFilter() {

    var functionName = "addLookupTrainerFilter";

    try {
       
        var fetchXml = "";
        var provider = null;
        var viewId = Xrm.Page.getControl("pdt_trainer").getDefaultView() == "" ? "{1DFB2B35-B07C-44D1-868D-258DEEAB88E2}" : Xrm.Page.getControl("pdt_trainer").getDefaultView();
        var entityName = "contact";
        var viewDisplayName = "Contacts lookup view";
        var courseid = Xrm.Page.getAttribute("pdt_course").getValue()[0].id;
        var orderid = Xrm.Page.data.entity.getId();
        var startDate = Xrm.Page.getAttribute("pdt_coursestartdate").getValue() != null ? new Date(Xrm.Page.getAttribute("pdt_coursestartdate").getValue()) : null;


       if (Xrm.Page.getAttribute("pdt_trainingprovider").getValue() != null)
            provider = Xrm.Page.getAttribute("pdt_trainingprovider").getValue().length != 0 ? Xrm.Page.getAttribute("pdt_trainingprovider").getValue()[0].id : null;
        
        fetchXml = "<fetch distinct='true' >" +
             "<entity name='contact' >" +
               "<attribute name='fullname' />" +
               "<attribute name='contactid' />" +
               "<attribute name='address1_city' />" +
               "<attribute name='parentcustomerid' />";
        if (provider != null)
            fetchXml = fetchXml + "<filter><condition attribute='parentcustomerid' operator='eq' value='" + provider + "' /></filter>";

            fetchXml = fetchXml + "<link-entity name='pdt_trainerqualification' from='pdt_trainer' to='contactid' >" +
              "<attribute name='pdt_expirydate' />" ;
            if (startDate != null) {
               
                  fetchXml = fetchXml + "<filter>" +
                    "<condition attribute='pdt_expirydate' operator='ge' value='" + formattedDateNoTime(startDate) + "' />" +
                  "</filter>";
              }

              fetchXml = fetchXml + "<link-entity name='pdt_qualification' from='pdt_qualificationid' to='pdt_qualification' >" +
                       "<link-entity name='pdt_product_pdt_qualification' from='pdt_qualificationid' to='pdt_qualificationid' intersect='true' >" +
                           "<filter type='and' >" +
                                "<condition attribute='productid' operator='eq' value='" + courseid + "' />" +
                            "</filter>" +
                       "</link-entity>" +
                     "</link-entity>" +
                   "</link-entity>" +
                 "</entity>" +
               "</fetch>";
        //Grid Layout for filtered records
        var layoutXml = "<grid name='resultset' object='1' jump='name' select='1' icon='1' preview='1'>" +
                          "<row name='result' id='contactid'>" +
                            "<cell name='fullname' width='300' />" +
                            "<cell name='address1_city' width='300' />" +
                            "</row></grid>";
        // add the custom view for the lookup field
        Xrm.Page.getControl("pdt_trainer").addCustomView(viewId, entityName, viewDisplayName, fetchXml, layoutXml, true);
    } catch (e) {
        Xrm.Utility.alertDialog(functionName + "Error: " + (e.message || e.description));
    }
}

function onSelectedTrainerChange() {
    var functionName = "onSelectedTrainerChange";
    try{
        var provider = Xrm.Page.getAttribute("pdt_trainingprovider").getValue()!= null ? Xrm.Page.getAttribute("pdt_trainingprovider").getValue()[0].id : null;
        var trainer =(Xrm.Page.getAttribute("pdt_trainer").getValue()!=null && Xrm.Page.getAttribute("pdt_trainer").getValue().length != 0) ? Xrm.Page.getAttribute("pdt_trainer").getValue()[0].id : null;  
        if (!trainer) return;
        var fetch = "<fetch>" +
                "<entity name='contact' >" +
                  "<attribute name='parentcustomerid' alias='provider' />" +
                  "<filter type='and' >" +
                    "<condition attribute='contactid' operator='eq' value='" + trainer + "' />" +
                  "</filter>" +
                   "<link-entity name='account' from='accountid' to='parentcustomerid' >"+
                      "<attribute name='name' />"+
                    "</link-entity>"+
                "</entity>" +
              "</fetch>";
        var results = XrmServiceToolkit.Soap.Fetch(fetch);
        var guid = results[0].attributes["provider"] ? results[0].attributes["provider"].id : null;
        if (guid)
            if (!provider || provider != guid) {
                var obj = {};
                obj.id = guid;
                obj.name = results[0].attributes["account1.name"].value;
                Xrm.Page.getAttribute("pdt_trainingprovider").setValue(getEntityObjectV2(obj, "account"));
            }
    } catch (e) {

        Xrm.Utility.alertDialog(functionName + "Error: " + (e.message || e.description));
    }
}



// Training Site & Billing Site Filters
function addSiteFilters() {

    Xrm.Page.getControl("pdt_billingsite").addPreSearch(function () {
        addLookupBillingSiteFilter();

    });
}

function addLookupBillingSiteFilter() {

    var functionName = "addLookupBillingSiteFilter";
  
    try {

        var fetchXml = " <filter type='and' ><condition attribute='customertypecode' operator='eq' value='3' /></filter>";
        Xrm.Page.getControl("pdt_billingsite").addCustomFilter(fetchXml);

    } catch (e) {
        Xrm.Utility.alertDialog(functionName + "Error: " + (e.message || e.description));
    }


}

// Update Finance Info
function getCourseDetails() {
    var functionName = "getCourseDetails";
    try{
        var courseid = Xrm.Page.getAttribute("pdt_course").getValue() != null ? Xrm.Page.getAttribute("pdt_course").getValue()[0].id : null;
        var pricelistid = Xrm.Page.getAttribute("pricelevelid").getValue() != null ? Xrm.Page.getAttribute("pricelevelid").getValue()[0].id : null;

        if (pricelistid == null || courseid == null) return;

        var myfetchXml = "<fetch  >" +
                        "<entity name='product' >"+
                          "<attribute name='pdt_maxiumumnumberofdelegates' />"+
                          "<attribute name='pdt_duration' />"+
                          "<attribute name='pdt_dayshours' />" +
                          "<attribute name='productnumber' />" +
                          "<attribute name='name' />"+
                          "<filter type='and' >"+
                            "<condition attribute='productid' operator='eq' value='"+courseid+"' />"+
                            "<condition attribute='pricelevelid' operator='eq' value='"+pricelistid+"' />"+
                          "</filter>"+
                          "<link-entity name='productpricelevel' from='productid' to='productid' alias='pricelevel' >"+
                            "<attribute name='amount' />"+
                          "</link-entity>"+
                        "</entity>"+
                      "</fetch>";
        var results = XrmServiceToolkit.Soap.Fetch(myfetchXml);

        if (results.length > 0) {

            var result = results[0];
            var amount = result.attributes["pricelevel.amount"] ? result.attributes["pricelevel.amount"].value : null;
            var maxdel = result.attributes["pdt_maxiumumnumberofdelegates"] ? result.attributes["pdt_maxiumumnumberofdelegates"].value : null;
            var duration = result.attributes["pdt_duration"] ? result.attributes["pdt_duration"].value : null;
            var durationtype = result.attributes["pdt_dayshours"] ? result.attributes["pdt_dayshours"].value : null;
            var courseid = result.attributes["productnumber"] ? result.attributes["productnumber"].value : null;
            var bespoke = result.attributes["pdt_isbespoke"] ? result.attributes["pdt_isbespoke"].value : null;

            Xrm.Page.getAttribute("pdt_baseamount").setValue(amount);
            Xrm.Page.getAttribute("pdt_maxdelegatespercourse").setValue(maxdel);
            Xrm.Page.getAttribute("pdt_courseduration").setValue(duration);
            Xrm.Page.getAttribute("pdt_durationtype").setValue(durationtype);
            Xrm.Page.getAttribute("pdt_courseid").setValue(courseid);            
        }
    } catch (e) {

        Xrm.Utility.alertDialog(functionName + "Error: " + (e.message || e.description));
    }
}

function trainerFinacials() {

    Xrm.Page.getAttribute("pdt_totaltrainerexpense").setValue(total);
    var fee = Xrm.Page.getAttribute("pdt_trainerfee").getValue();
    var travelcost = Xrm.Page.getAttribute("pdt_trainerexpensetravelcost").getValue();
    var hotelcost = Xrm.Page.getAttribute("pdt_trainerexpensehotelcost").getValue();
    var other = Xrm.Page.getAttribute("pdt_trainerexpenseothercosts").getValue();
    var total = 0;

    total = fee != null ? total + fee : total;
    total = travelcost != null ? total + travelcost : total;
    total = hotelcost != null ? total + hotelcost : total;
    total = other != null ? total + other : total;

    Xrm.Page.getAttribute("pdt_totaltrainerexpense").setValue(total);
  
}
// Get Max number of  Delegates per Course
function onFinancialFieldChange() {
   
    var noDelegates = -1;
    if (Xrm.Page.getAttribute("pdt_numberofdelegates") != null)
        noDelegates = Xrm.Page.getAttribute("pdt_numberofdelegates").getValue();

    if (noDelegates > -1)
        saveRecord();
}

function getCustomerDetails() {

    var functionName = "getCustomerDetails";
    try {
        var customerid = Xrm.Page.getAttribute("customerid").getValue() != null ? Xrm.Page.getAttribute("customerid").getValue()[0].id : null;
        if (customerid == null) return;

        var myfetchXml ="<fetch>"+
                          "<entity name='account' >"+
                            "<attribute name='defaultpricelevelid' />"+
                            "<filter type='and' >"+
                              "<condition attribute='accountid' operator='eq' value='" + customerid + "' />" +
                            "</filter>" +
                          "</entity>"+
                        "</fetch>";

        var results = XrmServiceToolkit.Soap.Fetch(myfetchXml);

        if (results.length > 0) {

            var result = results[0];
            var pricelist = result.attributes["defaultpricelevelid"];
            if (pricelist != undefined) {            
                Xrm.Page.getAttribute("pricelevelid").setValue(getEntityObjectV2(pricelist, "pricelevel"));
            }
        }

    }
    catch (e) {

        Xrm.Utility.alertDialog(functionName + "Error: " + (e.message || e.description));
    }

}

/*
//HTML CONTROL EVENTS
function refreshRadiusMap() {

    //get record id
    var recordId = Xrm.Page.data.entity.getId();
    //validate recordid
    if (recordId != null && recordId != undefined && recordId != "") {
       //get the querystring from the control

        var querystring = Xrm.Page.getControl("WebResource_Radiusmap").getSrc();
        //set the new querystring
        Xrm.Page.getControl("WebResource_Radiusmap").setSrc(querystring + "&data=" + recordId);
    }

}
*/
// DELEGATE GRID
function addDelegateGridEvents() {
    setTimeout(function () {
        Xrm.Page.getControl("sg_delegates").addOnLoad(onDelegateGridLoad);
    }, 2000);
}
function onDelegateGridLoad() {
    var functionName = " onDelegateGridLoad ";
    var currentRowCount = -1;
    var delegates = "";
    try {       //setting timeout beacuse subgrid take some time to load after the form is loaded

        var status = Xrm.Page.getAttribute("statecode").getValue();
        if (status == 2 || status == 3 || status == 4) return;

        var numberOfDeligates = Xrm.Page.getControl("sg_delegates").getGrid().getTotalRecordCount();
        setTimeout(function () {
            //validating to check if the sub grid is present on the form
            if (Xrm.Page != null && Xrm.Page != undefined && Xrm.Page.getControl("sg_delegates") != null && Xrm.Page.getControl("sg_delegates") != undefined) {
                                
                //stores the row count of subgrid on load event of CRM Form
                currentRowCount = Xrm.Page.getControl("sg_delegates").getGrid().getTotalRecordCount();
                
                if (currentRowCount >= 0 && numberOfDeligates!=currentRowCount) {
                    //call the intended function which we want to call only when records are added to the grid
                    Xrm.Page.getAttribute("pdt_numberofdelegates").setValue(currentRowCount);                   
                    //calcTax();
                    
                    if (currentRowCount > 0) {
                        var allRows = Xrm.Page.getControl("sg_delegates").getGrid().getRows();

                        if (allRows.getLength()>0) {
                        allRows.forEach(function (row, i) {
                            var name = row.getData().getEntity().getAttributes().getByName('pdt_delegate').getValue()[0].name;
                            delegates = delegates == "" ? delegates = name : delegates + "<br />" + name;
                            Xrm.Page.getAttribute("pdt_delegatesonrequest").setValue(delegates);
                        });
                    }
                    }
                
                    writeMessage("Delegate Grid Updated");
                   //if( Xrm.Page.data.entity.getIsDirty())
                   // saveRecord();             
            }
                          
            }
        }, 2000);
       
    } catch (e) {
        Xrm.Utility.alertDialog(functionName + "Error: " + (e.message || e.description));
    }
}

// Course Dates
function courseEndDateSelection() { 
    var endDate = new Date();

    var startDate = Xrm.Page.getAttribute("pdt_coursestartdate").getValue()!=null? new Date(Xrm.Page.getAttribute("pdt_coursestartdate").getValue()):null;
    var durationtype = Xrm.Page.data.entity.attributes.get("pdt_durationtype") != null ? Xrm.Page.data.entity.attributes.get("pdt_durationtype").getValue() : null;
    var duration = Xrm.Page.getAttribute("pdt_courseduration")!=null ? Xrm.Page.getAttribute("pdt_courseduration").getValue():null;

    if (startDate == null || duration == null || durationtype == null) return;

    endDate = durationtype == "749700000" ? startDate.setDate(startDate.getDate() + duration) : durationtype== "749700001"?endDate = startDate.setHours(startDate.getHours() + duration):null;

    if (endDate!=null) Xrm.Page.getAttribute("pdt_courseenddate").setValue(endDate);
    
}
function validateReminderDate() {

    var startDate = Xrm.Page.getAttribute("pdt_coursestartdate").getValue() != null ? new Date(Xrm.Page.getAttribute("pdt_coursestartdate").getValue()) : null;
    var endDate = Xrm.Page.getAttribute("pdt_courseenddate").getValue() != null ? new Date(Xrm.Page.getAttribute("pdt_courseenddate").getValue()) : null;
    var reminderdate = Xrm.Page.getAttribute("pdt_reminderdate").getValue() != null ? new Date(Xrm.Page.getAttribute("pdt_reminderdate").getValue()) : null;

    if (startDate == null) {

        Xrm.Utility.alertDialog("Course Start Date Can Not Be Null");
        Xrm.Page.getAttribute("pdt_reminderdate").setValue(null);
        return;
    }
    if (endDate == null) {

        Xrm.Utility.alertDialog("Course End Date Can Not Be Null");
        Xrm.Page.getAttribute("pdt_reminderdate").setValue(null);
        return;
    }
    if (reminderdate != null) {
       
        if (reminderdate.valueOf() > startDate.valueOf()) {
            Xrm.Utility.alertDialog("Reminder Date Can Not Be After Start Date ");
            Xrm.Page.getAttribute("pdt_reminderdate").setValue(null);
            return;
        }else if(reminderdate.valueOf() >endDate.valueOf()){
            Xrm.Utility.alertDialog("Reminder Date Can Not Be After End Date ");
            Xrm.Page.getAttribute("pdt_reminderdate").setValue(null);
            return;
        
        }
    }
}

function saveOnRequiredFields() {
    var trainingsite = Xrm.Page.getAttribute("pdt_trainingsite").getValue() != null ? Xrm.Page.getAttribute("pdt_trainingsite").getValue(): null;
    var course = Xrm.Page.getAttribute("pdt_course").getValue() != null ? Xrm.Page.getAttribute("pdt_course").getValue() : null;
    var orderId = Xrm.Page.getAttribute("ordernumber").getValue() != null ? Xrm.Page.getAttribute("ordernumber").getValue() : null;

    if (course && trainingsite && !orderId) {
        saveRecord();
    }
       
}

function cancelTrainingRequest() {
    var cancel = Xrm.Page.getAttribute("pdt_canceltrainingrequest").getValue();   
    if (cancel == true)
        Xrm.Page.getAttribute("pdt_cancellationtime").setValue(Date.now());
    else {
        Xrm.Page.getAttribute("pdt_cancellationtime").setValue(null);
        //Xrm.Page.ui.tabs.get("summary_tab").sections.get("section_cid").setVisible(false);
    }

    //var cancelCharge = Xrm.Page.getAttribute("pdt_cancellationcharge").getValue();

    //if (cancelCharge)
    //    Xrm.Page.ui.tabs.get("summary_tab").sections.get("section_cid").setVisible(true);
    //else
    //    Xrm.Page.ui.tabs.get("summary_tab").sections.get("section_cid").setVisible(false);
}

//function calculateTrainerInvoiceAmount() {

//    var courseStartDate =Date.constructor( Xrm.Page.getAttribute("pdt_coursestartdate").getValue());
//    var currentDate = Date.now();

//    if (courseStartDate - currentDate < 5 && courseStartDate - currentDate > 0) {

//        Xrm.Page.getAttribute("pdt_cancellationtrainerinvoiceamount").setValue();
//    } else if (courseStartDate - currentDate < 11 && courseStartDate - currentDate >=6)
//    {
    
//    }
//}

function trainerInvoiceMessages() {
    var expanse = Xrm.Page.getAttribute("pdt_totaltrainerexpense").getValue();
    var submitStatus = Xrm.Page.getAttribute("statuscode").getValue();
    var trainingprovider = Xrm.Page.getAttribute("pdt_trainingprovider").getValue();
    var selectedTrainer = Xrm.Page.getAttribute("pdt_trainer").getValue();
    var numberofDelegates = Xrm.Page.getAttribute("pdt_numberofdelegates").getValue();
    
    if (numberofDelegates>0) {//(submitStatus!=749700019 || trainingprovider==null || selectedTrainer== null) {

        Xrm.Page.ui.setFormNotification("TRAINER INVOICE: To create trainer invoice, Selected Trainer and Training Provider are required and there must be no delegates with status “Enrolled”", "INFORMATION", "TRMSG1");

    } else {

        Xrm.Page.ui.clearFormNotification("TRMSG1");
    }    
}

function onStatusReasonChange() {
    var statusReason = Xrm.Page.data.entity.attributes.get("statuscode") != null ? Xrm.Page.data.entity.attributes.get("statuscode").getValue() : null;
    if (statusReason != 749700019) return;

    var numDelegates =Xrm.Page.getAttribute("pdt_numberofdelegates")!=null? Xrm.Page.getAttribute("pdt_numberofdelegates").getValue():0;
    var submitCount = Xrm.Page.getAttribute("pdt_submitcount")!=null?Xrm.Page.getAttribute("pdt_submitcount").getValue():0;
  
    if (numDelegates != 0 && submitCount != 0) {
        if (numDelegates != submitCount){
            Xrm.Page.ui.setFormNotification("Feedback Must Be Submitted for All Delegates", "ERROR", "TRMSG2");
            Xrm.Page.data.entity.attributes.get("statuscode").setValue(749700018);
        } else {

            Xrm.Page.ui.clearFormNotification("TRMSG2");
            Xrm.Page.ui.clearFormNotification("TRMSG1");
        }

    }

}
