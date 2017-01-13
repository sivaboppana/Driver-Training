using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;

namespace Pertemps.DriverTraining.Plugins.FeedbackPlugin
{
    class FeedbackPlugin
    {
        internal static void SetTrainingRequestStatus(Entity entity, IOrganizationService service, ITracingService tracingservice)
        {
            pdt_feedback feedback = service.Retrieve(pdt_feedback.EntityLogicalName, entity.Id, new Microsoft.Xrm.Sdk.Query.ColumnSet("pdt_order","statuscode")) as pdt_feedback;
            Guid orderid = feedback.pdt_Order.Id;
            int trStatus =  1;

            try
            {
                QueryExpression entityQuery = new QueryExpression(pdt_feedback.EntityLogicalName);
                entityQuery.ColumnSet = new ColumnSet(pdt_feedback.EntityLogicalName + "id","statuscode");
                entityQuery.Criteria = new FilterExpression();
                entityQuery.Criteria.AddCondition("pdt_order", ConditionOperator.Equal, orderid);

                EntityCollection retrievedEntities = service.RetrieveMultiple(entityQuery);
                if (retrievedEntities.Entities.Count > 0) {
                    trStatus = DetermineTrainingRequestStatus(retrievedEntities);
                }
               
                SalesOrder order = new SalesOrder();
                order.Id = orderid;
               
                order.StatusCode =new OptionSetValue( trStatus);
                service.Update(order);
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
            int status = 1;

            for (int i = 0; i < retrievedEntities.Entities.Count; i++)
            {

                pdt_feedback fb = retrievedEntities.Entities[i] as pdt_feedback;

                if (fb.statuscode.Value.ToString() == "749700000")// Enrolled
                {
                    status = 1;//NEW REQUEST
                    break;
                }
                else if (fb.statuscode.Value.ToString() == "749700004")//submitted
                {
                    status = 749700019;//SUBMITTED

                }else
                    status = 749700018;//CLIENT APPROVED

            }

            return status;
        }
    }
}
