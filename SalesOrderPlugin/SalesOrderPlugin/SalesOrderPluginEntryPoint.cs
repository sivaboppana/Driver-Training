using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;


namespace Pertemps.DriverTraining.Plugins.SalesOrderPlugin
{
    /// <summary>
    /// Opportunity Win Handler to handle the win event.
    /// </summary>
    public class SalesOrderPluginEntryPoint : IPlugin
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
                Entity oclose = null;
                Entity order = null;
               
                    if (context.InputParameters.Contains("OrderClose") && context.InputParameters["OrderClose"] is Entity)
                    {

                        oclose = context.InputParameters["OrderClose"] as Entity;
           
                        //if (context.ParentContext.InputParameters.Contains("Target") && context.ParentContext.InputParameters["Target"] is Entity)
                        //    order = context.ParentContext.InputParameters["Target"] as Entity;

                        if (context.MessageName == "Cancel" && oclose != null )
                            SalesOrderPlugin.CreateOrderClose(oclose, service, tracingservice);

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
