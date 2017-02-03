using System;
using System.ServiceModel;

// Microsoft Dynamics CRM namespace(s)
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Messages;
using Microsoft.Xrm.Sdk.Query;
using Pertemps.DriverTraining.Plugins;
namespace Pertemps.DriverTraining.Plugins.InvoicePlugin
{
   public class InvoicePluginEntryPoint:IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {
            IPluginExecutionContext context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
            IOrganizationServiceFactory serviceFactory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
            IOrganizationService service = serviceFactory.CreateOrganizationService(context.UserId);
            /// This is plugin  creates Trainer Invoice , Cancellation Client Invoice and Course invoice Tax Line Items 
            ///
            
            // tracing service
            ITracingService tracingservice = (ITracingService)serviceProvider.GetService(typeof(ITracingService));

            try
            {
                if (context.OutputParameters.Contains("TrainerInvoice"))
                {
                    Guid invid = (Guid)((EntityReference)context.OutputParameters["TrainerInvoice"]).Id;
                    tracingservice.Trace("Creating Invoice Product for Trainer Invoice");
                    if (invid == null)
                    {
                        tracingservice.Trace("No trainer invoice present to create invoice detail ");
                        return;
                    }
                    InvoicePlugin.CreateTrainerInvoiceDetail(invid, service, tracingservice);
                }
                else if (context.OutputParameters.Contains("invoiceRef"))
                {
                    // Cancellation Client Invoice Requested
                    Guid inv = (Guid)((EntityReference)context.OutputParameters["invoiceRef"]).Id;
                    InvoicePlugin.CreateCancellationClientInvoiceDetails(inv, service, tracingservice);

                } else if(context.InputParameters["Target"] is Entity)
                {
                    // Create Tax Line Items

                    Entity entity = context.InputParameters["Target"] as Entity;

                    if (entity.LogicalName == "invoice" && context.MessageName=="Update")
                    {
                        Invoice inv = service.Retrieve(Invoice.EntityLogicalName, entity.Id, new ColumnSet("pdt_vat", "pdt_invoicetype", "pdt_cancellationinvoice")).ToEntity<Invoice>();
                        decimal vat = inv.pdt_VAT != null ? inv.pdt_VAT.Value : -1;
                        int type = inv.pdt_InvoiceType!= null?inv.pdt_InvoiceType.Value:-1;
                      

                        if (vat > 0 && type == 749700001 && inv.pdt_CancellationInvoice.Value==false)
                        {
                            InvoicePlugin.UpdateTaxOnDetails(inv, service, tracingservice);
                        }
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
