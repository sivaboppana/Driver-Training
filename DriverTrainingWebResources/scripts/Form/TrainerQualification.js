function addTrainerFilter() {

    Xrm.Page.getControl("pdt_trainer").addPreSearch(function () {
        addLookupTrainerFilter();

    });
}

function addLookupTrainerFilter() {

    var fetchXml = "<filter> <condition attribute='customertypecode' operator='eq' value='749700000' /></filter>";
   
    Xrm.Page.getControl("pdt_trainer").addCustomFilter(fetchXml);

}
function isQualificationExists() {
    var trainer = Xrm.Page.getAttribute("pdt_trainer").getValue()!=null ? Xrm.Page.getAttribute("pdt_trainer").getValue()[0].id:null;
    var qualification = Xrm.Page.getAttribute("pdt_qualification").getValue()!=null ? Xrm.Page.getAttribute("pdt_qualification").getValue()[0].id:null;
    var currentDate = new Date().format("yyyy-MM-dd");

    if (trainer == null || qualification == null) return;
       

    var myfetchXml = "<fetch returntotalrecordcount='true' >" +
                      "<entity name='pdt_trainerqualification' >" + 
                        "<attribute name='pdt_expirydate' />"+
                        "<filter type='and' >" +
                          "<condition attribute='pdt_trainer' operator='eq' value='"+trainer+"' />" +
                          "<condition attribute='pdt_qualification' operator='eq' value='"+qualification+"' />" +
                          "<condition attribute='pdt_expirydate' operator='ge' value='"+currentDate+"' />" +
                        "</filter>" +
                      "</entity>" +
                    "</fetch>";

    var result = XrmServiceToolkit.Soap.Fetch(myfetchXml);
    if (result == 0) return;
    Xrm.Utility.alertDialog("An existing Qualification "+Xrm.Page.getAttribute("pdt_qualification").getValue()[0].name +
                    "\n expiring on " + result[0].attributes["pdt_expirydate"].formattedValue +
                    "\n is present for " + Xrm.Page.getAttribute("pdt_trainer").getValue()[0].name ,
                   
        function () {
            Xrm.Page.getAttribute("pdt_qualification").setValue(null);
        }
        
        );

}
function setName() {
    if (Xrm.Page.getAttribute("pdt_trainer").getValue()!= null && Xrm.Page.getAttribute("pdt_qualification").getValue() != null) {
        var name = Xrm.Page.getAttribute("pdt_trainer").getValue()[0].name + "-" + Xrm.Page.getAttribute("pdt_qualification").getValue()[0].name;
        Xrm.Page.getAttribute("pdt_name").setValue(name);
    }
}