using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;


namespace Pertemps.DriverTraining.Plugins.TrainerCalenderPlugin
{
    /// <summary>
    /// Opportunity Win Handler to handle the win event.
    /// </summary>
    public class TrainerCalenderPluginEntryPoint : IPlugin
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
                if (context.InputParameters.Contains("trainer") && context.InputParameters.Contains("start") && context.InputParameters.Contains("end"))
                {
                    EntityReference trainer = context.InputParameters["trainer"] as EntityReference;
                    DateTime start = (DateTime)context.InputParameters["start"];
                    DateTime end = (DateTime)context.InputParameters["end"];

                    TrainerCalenderPlugin.ManageCalenderEntries(trainer, start, end, tracingservice, service);


                }
                else
                {
                    Entity preImageEntity = context.PreEntityImages["preimage"] as Entity;

                    if (preImageEntity == null) return;
                    
                    Guid trainerId = preImageEntity.Attributes.Contains("pdt_trainer") ?((EntityReference)preImageEntity.Attributes["pdt_trainer"]).Id:Guid.Empty;
                  

                    if (trainerId != Guid.Empty && preImageEntity.LogicalName == "salesorder")
                    {
                        SalesOrder order = service.Retrieve(SalesOrder.EntityLogicalName, preImageEntity.Id, new ColumnSet("pdt_courseenddate", "pdt_coursestartdate", "pdt_trainer")) as SalesOrder;

                        DateTime defaultDate = new DateTime();

                        DateTime ostart = order.pdt_CourseStartDate!=null?(DateTime)order.pdt_CourseStartDate:new DateTime();
                        DateTime oend = order.pdt_CourseEndDate!=null?(DateTime)order.pdt_CourseEndDate:new DateTime();
                        if(ostart!= defaultDate && oend!= defaultDate)
                        TrainerCalenderPlugin.UpdateCalenderEntry( trainerId,ostart,oend, service, tracingservice);

                    }
                    else
                        return;
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
