function prefixFilter() {
   
    Xrm.Page.getControl("pdt_prefixid").addPreSearch(function () {
        addLookupFilter();

    });
}
function addLookupFilter() {
    var cat = Xrm.Page.getAttribute("customertypecode").getValue();
    var prefix = 0;
    var functionName = "addLookupFilter";
    try{
    if (cat != null) {

        if (cat == 3) prefix = 749700000;// pdt_type option set value from sequence number 
        if (cat == 10) prefix = 749700001;
        var fetchXml = "<filter type='and'><condition attribute='pdt_type' value='" + prefix + "' operator='eq'/></filter>";
        Xrm.Page.getControl("pdt_prefixid").addCustomFilter(fetchXml);

    }
    } catch (e) {

        Xrm.Utility.alertDialog(functionName + "Error: " + (e.message || e.description));

    }
}

function changeAddressPopupFieldLabels() {
    var functionName = "addLookupFilter";
    try{
        Xrm.Page.getControl("address1_composite_compositionLinkControl_address1_stateorprovince").setLabel("County");
    } catch (e) {

        Xrm.Utility.alertDialog(functionName + "Error: " + (e.message || e.description));

    }
}
