function trainerFilter() {
    Xrm.Page.getControl("pdt_trainercompany").addPreSearch(function () {
        addLookupTrainerCompanyFilter();
    });

    Xrm.Page.getControl("pdt_trainer").addPreSearch(function () {
            addLookupTrainerFilter();
     });
   
    Xrm.Page.getControl("pdt_trainingsite").addPreSearch(function () {
        addLookupTrainingSiteFilter();
    });
}
function addLookupTrainerFilter() {
    var functionName = "addLookupTrainerFilter";
    try {
        if (Xrm.Page.getAttribute("pdt_trainercompany").getValue() == null) return;
        var trainingCompanyId = Xrm.Page.getAttribute("pdt_trainercompany").getValue()[0].id;
        if (trainingCompanyId != null) {
            var fetchXml = "<filter type='and' ><condition attribute='accountid' operator='eq' value='" + trainingCompanyId + "' />";
            fetchXml = fetchXml + " <condition attribute='customertypecode' operator='eq' value='749700000' /></filter>";//749700000 is trainer           
        } else {
            var fetchXml = "<filter type='and' > <condition attribute='customertypecode' operator='eq' value='749700000' /></filter>";//749700000 is trainer
        }
        Xrm.Page.getControl("pdt_trainer").addCustomFilter(fetchXml);
    } catch (e) {
        Xrm.Utility.alertDialog(functionName + "Error: " + (e.message || e.description));
    }
}

function onSelectedTrainerChange() {
    var functionName = "onSelectedTrainerChange";
    try {
        var provider = Xrm.Page.getAttribute("pdt_trainercompany") != null ? Xrm.Page.getAttribute("pdt_trainercompany").getValue()[0].id : null;
        var trainer = (Xrm.Page.getAttribute("pdt_trainer")!= null && Xrm.Page.getAttribute("pdt_trainer").getValue()!=null) ? Xrm.Page.getAttribute("pdt_trainer").getValue()[0].id : null;
        if (!trainer) return;
        var fetch = "<fetch>" +
                "<entity name='contact' >" +
                  "<attribute name='parentcustomerid' alias='provider' />" +
                  "<filter type='and' >" +
                    "<condition attribute='contactid' operator='eq' value='" + trainer + "' />" +
                  "</filter>" +
                   "<link-entity name='account' from='accountid' to='parentcustomerid' >" +
                      "<attribute name='name' />" +
                    "</link-entity>" +
                "</entity>" +
              "</fetch>";
        var results = XrmServiceToolkit.Soap.Fetch(fetch);
        var guid = results[0].attributes["provider"] ? results[0].attributes["provider"].id : null;
        if (guid)
            if (!provider || provider != guid) {
                var obj = {};
                obj.id = guid;
                obj.name = results[0].attributes["account1.name"].value;
                Xrm.Page.getAttribute("pdt_trainercompany").setValue(getEntityObjectV2(obj, "account"));
            }
    } catch (e) {

        Xrm.Utility.alertDialog(functionName + "Error: " + (e.message || e.description));
    }
}
function addLookupTrainerCompanyFilter() {
    var fetchXml = "<filter><condition attribute='customertypecode' operator='eq' value='10' /></filter>";
    Xrm.Page.getControl("pdt_trainercompany").addCustomFilter(fetchXml);
}
function addLookupTrainingSiteFilter() {
    var fetchXml = "<filter><condition attribute='customertypecode' operator='neq' value='10' /></filter>";
    Xrm.Page.getControl("pdt_trainingsite").addCustomFilter(fetchXml);
}

function setName() {
    if (Xrm.Page.getAttribute("pdt_trainer").getValue() == null) return;
    var name = Xrm.Page.getAttribute("pdt_trainer").getValue()[0].name;
    Xrm.Page.getAttribute("pdt_name").setValue(name);
}

// Quick Form 

function onQuickFormLoad() {
   
    Xrm.Page.getControl("pdt_trainer").addPreSearch(function () {
        addQuickFormLookupTrainerFilter();
    });
    Xrm.Page.getControl("pdt_trainercompany").addPreSearch(function () {
        addLookupTrainerCompanyFilter();
    });
    Xrm.Page.getControl("pdt_trainingsite").addPreSearch(function () {
        addLookupTrainingSiteFilter();
    });

    Xrm.Page.getAttribute("pdt_type").setValue(749700001);
    Xrm.Page.getAttribute("statuscode").setValue(749700004);
}

function addQuickFormLookupTrainerFilter() {

    var functionName = "addQuickFormLookupTrainerFilter";

    try {

        var fetchXml = "";
        var provider = null;
        var courseid = null;
        var viewId = Xrm.Page.getControl("pdt_trainer").getDefaultView() == "" ? "{1DFB2B35-B07C-44D1-868D-258DEEAB88E2}" : Xrm.Page.getControl("pdt_trainer").getDefaultView();
        var entityName = "contact";
        var viewDisplayName = "Contacts lookup view";

        var orderid = Xrm.Page.getAttribute("pdt_orderid").getValue()[0].id;
        var courseFetch = "<fetch count='1' >" +
                  "<entity name='salesorder' >" +
                    "<attribute name='pdt_course' />" +
                    "<filter type='and' >" +
                      "<condition attribute='salesorderid' operator='eq' value='" + orderid + "' />" +
                    "</filter>" +
                  "</entity>" +
                "</fetch>";
        var results = XrmServiceToolkit.Soap.Fetch(courseFetch);

        if (results.length > 0)
            courseid = results[0].attributes["pdt_course"].id;
        else
            return;
        if (Xrm.Page.getAttribute("pdt_trainercompany") != null)
            provider = Xrm.Page.getAttribute("pdt_trainercompany").getValue() != null  ? Xrm.Page.getAttribute("pdt_trainercompany").getValue()[0].id : null;

        fetchXml = "<fetch distinct='true' >" +
             "<entity name='contact' >" +
               "<attribute name='fullname' />" +
               "<attribute name='contactid' />" +
               "<attribute name='address1_city' />" +
               "<attribute name='parentcustomerid' />";
        if (provider != null)
            fetchXml = fetchXml + "<filter><condition attribute='parentcustomerid' operator='eq' value='" + provider + "' /></filter>";
        fetchXml = fetchXml + "<link-entity name='pdt_trainerqualification' from='pdt_trainer' to='contactid' >" +
                     "<link-entity name='pdt_qualification' from='pdt_qualificationid' to='pdt_qualification' >" +
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

