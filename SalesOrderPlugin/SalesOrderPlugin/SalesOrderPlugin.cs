using System;

// Microsoft Dynamics CRM namespace(s)
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using Microsoft.Crm.Sdk.Messages;

namespace Pertemps.DriverTraining.Plugins.SalesOrderPlugin
{
    class SalesOrderPlugin
    {

        internal static void CreateOrderClose(Entity oclose, IOrganizationService service, ITracingService tracingservice)
        {
            OrderClose orderClose = oclose.ToEntity<OrderClose>();
            SalesOrder order = service.Retrieve(SalesOrder.EntityLogicalName, orderClose.SalesOrderId.Id, new ColumnSet("pdt_cancellationcomments")).ToEntity<SalesOrder>();

            orderClose.Description = order.pdt_CancellationComments;
            orderClose.StateCode = OrderCloseState.Canceled;
            orderClose.StatusCode = new OptionSetValue(3);
           // orderClose.OwnerId = order.OwnerId;
            tracingservice.Trace("Order Close exicuted");
        }

      
    }
}