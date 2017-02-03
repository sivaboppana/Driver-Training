using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using System.Collections;

namespace Pertemps.DriverTraining.Plugins.FeedbackPlugin
{
    class FeedbackPlugin
    {
        internal static void SetTrainingRequestStatus(pdt_feedback feedback, IOrganizationService service, ITracingService tracingservice)
        {
           
            if(feedback.pdt_Order==null)
                feedback = service.Retrieve(pdt_feedback.EntityLogicalName, feedback.Id, new Microsoft.Xrm.Sdk.Query.ColumnSet("pdt_order","statuscode")) as pdt_feedback;
            Guid orderid = feedback.pdt_Order.Id;
          

            SalesOrder order = service.Retrieve(SalesOrder.EntityLogicalName, orderid, new ColumnSet("statuscode")) as SalesOrder;
            int trStatus = order.StatusCode.Value;


            try
            {
                QueryExpression entityQuery = new QueryExpression(pdt_feedback.EntityLogicalName);
                entityQuery.ColumnSet = new ColumnSet(pdt_feedback.EntityLogicalName + "id", "statuscode");
                entityQuery.Criteria = new FilterExpression();
                entityQuery.Criteria.AddCondition("pdt_order", ConditionOperator.Equal, orderid);

                EntityCollection retrievedEntities = service.RetrieveMultiple(entityQuery);
                if (retrievedEntities.Entities.Count > 0)
                {
                    trStatus = DetermineTrainingRequestStatus(retrievedEntities);
                }
                else
                    trStatus = 1;
             
                if (order.StatusCode.Value !=trStatus)
                {
                    order.StatusCode = new OptionSetValue(trStatus);
                    service.Update(order);
                }
            }
            catch (Exception e)
            {
                tracingservice.Trace("There was an exception of type" + e.GetType());
                tracingservice.Trace("Error message " + e.Message);
                tracingservice.Trace(e.StackTrace);

            }
        }

        private static int DetermineTrainingRequestStatus(EntityCollection retrievedEntities)
        {
            int status = 749700019;
            ArrayList al = new ArrayList();
            for (int i = 0; i < retrievedEntities.Entities.Count; i++)
            {
                pdt_feedback fb = retrievedEntities.Entities[i] as pdt_feedback;
                int fbStatus = fb.statuscode.Value;
                al.Add(fbStatus);
               
            }
            if (al.Contains(749700001) || al.Contains(749700002) || al.Contains(749700003))
                status = 749700018;
           
            if (al.Contains(749700000))
            {
                status = 1;
            }
          

            return status;
        }
    }
}
