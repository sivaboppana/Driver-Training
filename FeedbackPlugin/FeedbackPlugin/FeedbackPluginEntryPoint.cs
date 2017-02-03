using System;
using System.ServiceModel;

// Microsoft Dynamics CRM namespace(s)
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Messages;
using Microsoft.Xrm.Sdk.Query;
namespace Pertemps.DriverTraining.Plugins.FeedbackPlugin
{
    public class FeedbackPluginEntryPoint : IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {
            IPluginExecutionContext context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
            IOrganizationServiceFactory serviceFactory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
            IOrganizationService service = serviceFactory.CreateOrganizationService(context.UserId);

            // tracing service
            ITracingService tracingservice = (ITracingService)serviceProvider.GetService(typeof(ITracingService));

            try
            {
                if (context.InputParameters.Contains("Target") && context.InputParameters["Target"] is Entity && context.MessageName == "Update")
                {

                    Entity entity = context.InputParameters["Target"] as Entity;

                    if (entity.LogicalName == pdt_feedback.EntityLogicalName)
                    {
                        if(entity.Contains("statuscode"))
                        FeedbackPlugin.SetTrainingRequestStatus(entity.ToEntity<pdt_feedback>(), service, tracingservice);
                    }
                }
                else if (context.InputParameters.Contains("Target") && context.InputParameters["Target"] is EntityReference && context.MessageName == "Delete")
                {

                    if (context.PreEntityImages.Contains("preimage") && context.PreEntityImages["preimage"] is Entity)
                    {

                        Entity delEntity = context.PreEntityImages["preimage"] as Entity;
                        FeedbackPlugin.SetTrainingRequestStatus(delEntity.ToEntity<pdt_feedback>(), service, tracingservice);
                    }

                }
               

             }
            catch (InvalidPluginExecutionException ex)
            {
                tracingservice.Trace(ex.Message);
                throw;
            }
            catch (ApplicationException ex)
            {
                tracingservice.Trace(ex.Message);
                throw new InvalidPluginExecutionException(ex.Message);
            }
            catch (Exception ex)
            {
                tracingservice.Trace(ex.Message);
                throw new InvalidPluginExecutionException(ex.ToString());
            }
        }
    }
}
