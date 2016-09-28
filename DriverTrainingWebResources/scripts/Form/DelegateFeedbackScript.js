///FILTERS
function delegateFilter() {
    Xrm.Page.getControl("pdt_delegate").addPreSearch(function () {
        addLookupDelegateFilter();

    });
}
function addLookupDelegateFilter() {
    var functionName = "addLookupDelegateFilter";
    try {
        if (Xrm.Page.getAttribute("pdt_customerid").getValue() == null) return;

        var customer = Xrm.Page.getAttribute("pdt_customerid").getValue()[0].id;
        var order = Xrm.Page.getAttribute("pdt_order").getValue()[0].id;
        if (customer != null && order!=null) {
          var fetchXml = " <filter type='and' ><condition attribute='parentcustomerid' operator='eq' value='" + customer + "' />";
           fetchXml = fetchXml + " <condition attribute='customertypecode' operator='eq' value='1' /></filter>";//1 is Delegate
              Xrm.Page.getControl("pdt_delegate").addCustomFilter(fetchXml); 
        }
    } catch (e) {
        Xrm.Utility.alertDialog(functionName + "Error: " + (e.message || e.description));
    }
}

function onDelegateExists() {
    var functionName="onDelegateExists";
    try{
        var delegate = Xrm.Page.getAttribute("pdt_delegate").getValue()?Xrm.Page.getAttribute("pdt_delegate").getValue()[0].id:null;
        var order = Xrm.Page.getAttribute("pdt_order").getValue()? Xrm.Page.getAttribute("pdt_order").getValue()[0].id:null;
        if (order == null || delegate == null) return;

        var myfetchXml = "<fetch returntotalrecordcount='true' >" +
                          "<entity name='pdt_feedback' >" +
                            "<filter type='and' >" +
                              "<condition attribute='pdt_order' operator='eq' value='" + order + "' />" +
                              "<condition attribute='pdt_delegate' operator='eq' value='" + delegate + "' />" +
                            "</filter>" +
                          "</entity>" +
                        "</fetch>";
        var results = XrmServiceToolkit.Soap.Fetch(myfetchXml);

        if (results != null && results.length > 0) {
            Xrm.Utility.alertDialog("Delegate Already Exists");
            Xrm.Page.getAttribute("pdt_delegate").setValue(null);
            return true;
        } else {
            isDelegateTakenCourseInPast();
            setName();
            return false;
        }
    }   
    catch(e){
        Xrm.Utility.alertDialog(functionName + "Error: " + (e.message || e.description));
    }


}
function isDelegateTakenCourseInPast() {
    var functionName = "isDelegateTakenCourseInPast";
    var delegate = Xrm.Page.getAttribute("pdt_delegate").getValue() ? Xrm.Page.getAttribute("pdt_delegate").getValue()[0].id : null;
    var delegateName = Xrm.Page.getAttribute("pdt_delegate").getValue() ? Xrm.Page.getAttribute("pdt_delegate").getValue()[0].name : null;
    var course = Xrm.Page.getAttribute("pdt_courseid").getValue() ? Xrm.Page.getAttribute("pdt_courseid").getValue()[0].id : null;
    var myfetchXml="<fetch top='1' ><entity name='pdt_feedback' >"+
      "<attribute name='pdt_feedbackid' />" +
      "<attribute name='createdon' />" +
      "<filter type='and' >"+
      "<condition attribute='pdt_delegate' operator='eq' value='" + delegate + "' />" +
      "<condition attribute='pdt_courseid' operator='eq' value='" + course + "' />" +
      "</filter></entity></fetch>";
    try{
        var results = XrmServiceToolkit.Soap.Fetch(myfetchXml);
        if (results != null && results.length > 0) {
            var result = results[0];
            var feedback = result.attributes.pdt_feedbackid.value;
            var created = result.attributes.createdon.formattedValue;
            Xrm.Utility.confirmDialog("Delegate " + delegateName + " has  taken this course on " + created + " click OK to see the details", function () {

                Xrm.Utility.openEntityForm("pdt_feedback", feedback);
                

            });
           
        }
    } catch (e) {
        Xrm.Utility.alertDialog(functionName + "Error: " + (e.message || e.description));
    }
}
function onOrderChange() {

    var orderid = Xrm.Page.getAttribute("pdt_order").getValue() ? Xrm.Page.getAttribute("pdt_order").getValue()[0].id : null;
    if (orderid == null) return;
    var feedbackid = Xrm.Page.data.entity.getId();

    var myfetchXml = "<fetch  >" +
                      "<entity name='salesorder' >" +
                        "<attribute name='customerid' />" +
                        "<attribute name='pdt_course' />" +
                         "<attribute name='pdt_numberofdelegates' />"+
                        "<filter>" +
                          "<condition attribute='salesorderid' operator='eq' value='" + orderid + "' />" +
                        "</filter>" +
                           "<link-entity name='product' from='productid' to='pdt_course' alias='course'  >" +
                                "<attribute name='pdt_maxiumumnumberofdelegates' />" +
                            "</link-entity>" +
                      "</entity>" +
                    "</fetch>";

    var results = XrmServiceToolkit.Soap.Fetch(myfetchXml);

    if (results == null || results.length == 0) return;
    var result = results[0];

    if (feedbackid != undefined || feedbackid != "" || feedbackid != null) {
        var numDelegates = result.attributes["pdt_numberofdelegates"]!=null?result.attributes["pdt_numberofdelegates"].value:0;
        var maxDelegates = result.attributes["course.pdt_maxiumumnumberofdelegates"]!=null?result.attributes["course.pdt_maxiumumnumberofdelegates"].value:0;

        if (maxDelegates - numDelegates > 0) {
            Xrm.Page.getAttribute("pdt_courseid").setValue(getEntityObjectV2(result.attributes["pdt_course"], "product"));
            Xrm.Page.getAttribute("pdt_customerid").setValue(getEntityObjectV2(result.attributes["customerid"], "account"));
        } else {

            Xrm.Utility.alertDialog("Can not add Delegate as the Course is Full");
            Xrm.Page.getAttribute("pdt_order").setValue(null);
            return;
        }
    } 
}

function setName() {

    var name = Xrm.Page.getAttribute("pdt_delegate").getValue()[0].name;
    var order = Xrm.Page.getAttribute("pdt_order").getValue()[0].name;
    if (name!=undefined || name=="New Feedback")
        Xrm.Page.getAttribute("pdt_name").setValue(order+"-"+name);

}


function onSubmitStatusChange() {
    var submitStatus = Xrm.Page.getAttribute("statuscode").getValue();
    if (submitStatus == 749700004) 
        Xrm.Page.getAttribute("pdt_feedbacksubmittedon").setValue(Date.now());
    else
        Xrm.Page.getAttribute("pdt_feedbacksubmittedon").setValue(null);
}

function onFeedbackSave() {
    var submitted = 749700004;
    var enrolled = 749700000;
    var attended = 749700001;

    var submitStatus = Xrm.Page.getAttribute("statuscode").getValue();

    //if (submitStatus != 749700004) return;
    var feedbackid = Xrm.Page.data.entity.getId();
    var orderid = Xrm.Page.getAttribute("pdt_order").getValue()[0].id;
   
    var fetch = " <fetch><entity name='pdt_feedback' ><attribute name='statuscode' /><attribute name='pdt_feedbackid' />" +
                    "<filter><condition attribute='pdt_order' operator='eq' value='"+orderid+"' /></filter>" +
                  "</entity></fetch>";

    var results = XrmServiceToolkit.Soap.Fetch(fetch);
    var status = true;
    var order = {};
    var orderStausCode=1;
    if (results == null || results.length == 0) return;
   
    for (var i = 0 ; i < results.length; i++) {
        var result = results[i];

        var statuscode = result.attributes["statuscode"].value;
        var fid = result.attributes["pdt_feedbackid"].value;
        if (feedbackid.search(fid.toUpperCase()) != 1)
        {
            if (statuscode == enrolled || statuscode == attended) status = false;
        }
       
        /*
        if (feedbackid.search(fid.toUpperCase()) != 1) {
            if (statuscode != submitted) status = false;
        } else {

            if (submitStatus != submitted) status = false;           
        }*/
    }
   
    order.pdt_FeedbackStatus = status;
  
        XrmServiceToolkit.Rest.Update(
                orderid,
                order,
                "SalesOrderSet",
                function () {
                    writeMessage("The TR record should have been updated.");
                },
                function (error) {
                    writeMessage( error.message);
                },
                false
            );
}


