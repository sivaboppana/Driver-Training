using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;


namespace Pertemps.DriverTraining.Plugins.OrderProductPlugin
{
    /// <summary>
    /// Opportunity Win Handler to handle the win event.
    /// </summary>
    public class OrderProductPluginEntryPoint : IPlugin
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
                //Create Orderproduct on Order creation

                if (context.InputParameters.Contains("Target") && context.InputParameters["Target"] is Entity) { 
                    
                    Entity entity=context.InputParameters["Target"] as Entity;

                    if (entity.LogicalName == SalesOrder.EntityLogicalName)
                    {
                        SalesOrder order = entity.ToEntity<SalesOrder>();

                        switch (context.MessageName)
                        {
                            case "Create":
                                if (order.pdt_course == null) { tracingservice.Trace("No Course found...."); return; }
                                if (order.pdt_BaseAmount == null) { tracingservice.Trace("No Course Cost found...."); return; }
                                OpderProductPlugin.CreateOderProduct(order, service, tracingservice);
                                break;

                            case "Update":

                                SalesOrder image = context.PostEntityImages.Contains("postimage") ? context.PostEntityImages["postimage"].ToEntity<SalesOrder>() : null;
                                if (order != null && (order.pdt_BaseAmount != null || order.pdt_course != null || order.pdt_NumberofDelegates != null || order.pdt_UploadFeeNonVat != null))
                                    OpderProductPlugin.UpdateOrderProduct(image, order, service, tracingservice);

                                break;

                            case "Delete":
                                break;
                        }
                    }
                   
                }

            }
            catch (InvalidPluginExecutionException)
            {
                throw;
            }
            catch (ApplicationException ex)
            {
                throw new InvalidPluginExecutionException(ex.Message);
            }
            catch (Exception ex)
            {
                throw new InvalidPluginExecutionException(ex.ToString());
            }
        }
    }
}