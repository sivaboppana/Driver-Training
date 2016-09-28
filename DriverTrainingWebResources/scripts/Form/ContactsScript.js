/*
function showHideQualificationSubgrid() {
    var type = Xrm.Page.getAttribute("customertypecode").getValue();

    if (type == null || type == "" || type == undefined) return;

    setTimeout(function () {

        if (Xrm.Page != null && Xrm.Page != undefined && Xrm.Page.getControl("sg_qualifications") != null && Xrm.Page.getControl("sg_qualifications") != undefined) {

            if (type == "749700000")// trainer
            {
             
               // Xrm.Page.ui.tabs.get("SUMMARY_TAB").sections.get("SUMMARY_TAB_section_11").setVisible(true);
                Xrm.Page.ui.controls.get('sg_qualifications').setVisible(true);
                Xrm.Page.ui.controls.get('WebResource_DelivarableCourses').setVisible(true);
            } else {
                Xrm.Page.ui.controls.get('sg_qualifications').setVisible(false);
                Xrm.Page.ui.controls.get('WebResource_DelivarableCourses').setVisible(false);
            }
        }
    }, 1000);
}
*/
function refeshWebResource_DelivarableCourses() {
    var webResArea = Xrm.Page.ui.controls.get("WebResource_DelivarableCourses");

    webResArea.setSrc(webResArea.getSrc());

}
function showHideTrainerSpecificInfo() {
    var type = Xrm.Page.getAttribute("customertypecode").getValue();
   
    if (type == null || type == "" || type == undefined) return;
    if (Xrm.Page != null && Xrm.Page != undefined) {

        if (type == "749700000") {// trainer
            Xrm.Page.ui.tabs.get("tab_TrainerInfo").setVisible(true);
           
        }
        else
            Xrm.Page.ui.tabs.get("tab_TrainerInfo").setVisible(false);

    }
    
}
function showHideDelegateBookingHistory() {
    var type = Xrm.Page.getAttribute("customertypecode").getValue();

    if (type == null || type == "" || type == undefined) return;
    if (Xrm.Page != null && Xrm.Page != undefined) {

        if (type == "1") {// delegate
           
            Xrm.Page.ui.controls.get("WebResource_booking_history").setVisible(true);

        }
        else
            Xrm.Page.ui.controls.get("WebResource_booking_history").setVisible(false);

    }

}
function eligibleToWork() {
    var type = Xrm.Page.getAttribute("customertypecode").getValue();
    if (type != "749700000") return;

    var work = Xrm.Page.getAttribute("pdt_eligibilitytowork").getValue();
    var name = Xrm.Page.getAttribute("fullname").getValue();
    if (work == 0 && name != null)
        Xrm.Page.ui.setFormNotification(name + " Is Not Eligible to Work in UK", "ERROR", "1");
    else
        Xrm.Page.ui.clearFormNotification("1");
}

function isEmailUnique() {

    var email = Xrm.Page.getAttribute("emailaddress1").getValue();
    if (email == null || email == undefined) return;
    var myfetchXml = "<fetch><entity name='contact' ><attribute name='contactid' />" +
    "<filter type='and' ><condition attribute='emailaddress1' operator='eq' value='"+email+"' /></filter></entity></fetch>";

    var results = XrmServiceToolkit.Soap.Fetch(myfetchXml);
    if (results.length > 0) {

        Xrm.Utility.alertDialog(email + " : is alredy assigned to another contact");
        Xrm.Page.getAttribute("emailaddress1").setValue(null);
    }
}
function changeAddressPopupFieldLabels() {

    Xrm.Page.getControl("address1_composite_compositionLinkControl_address1_stateorprovince").setLabel("County");
}
function contactVerified() {

    var verified = Xrm.Page.getAttribute("pdt_verified").getValue();

    if (verified == true ) {

        var setUservalue = new Array();
        setUservalue[0] = new Object();
        setUservalue[0].id = Xrm.Page.context.getUserId();
        setUservalue[0].entityType = 'systemuser';
        setUservalue[0].name = Xrm.Page.context.getUserName();


        Xrm.Page.getAttribute("pdt_verifiedby").setValue(setUservalue);

    } else Xrm.Page.getAttribute("pdt_verifiedby").setValue(null);

}
