using System;
using System.ServiceModel;

// Microsoft Dynamics CRM namespace(s)
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
namespace Pertemps.DriverTraining.Plugins.InvoicePlugin
{
    class InvoicePlugin
    {
        internal static void CreateTrainerInvoiceDetail(Guid invid, IOrganizationService service, ITracingService tracingservice)
        {
            try
            {
                EntityReference trainerExpanse = null;
                EntityReference defaultUnit = null;
                Invoice invoice = service.Retrieve(Invoice.EntityLogicalName, invid, new ColumnSet(true)) as Invoice;

                OrganizationRequest req = new OrganizationRequest("pdt_TrainerExpanseProduct");
                OrganizationResponse res = service.Execute(req);

                if (res.Results.Contains("TrainerExpanseProduct"))
                    trainerExpanse = res.Results["TrainerExpanseProduct"] as EntityReference;
                else
                {
                    tracingservice.Trace("TrainerExpanseProduct is null");
                    return;
                }

                if (res.Results.Contains("DoMId"))
                    defaultUnit = res.Results["DoMId"] as EntityReference;
                else
                {
                    tracingservice.Trace("Default Unit for Trainer Expanse  is null");
                    return;
                }

                InvoiceDetail detail = new InvoiceDetail
                {

                    InvoiceId = new EntityReference(Invoice.EntityLogicalName, invoice.Id),
                    Quantity = new Decimal(1),
                    PricePerUnit = new Money(invoice.pdt_TotalTrainerExpanse.Value),
                    IsPriceOverridden = true,
                    ProductId = new EntityReference(Product.EntityLogicalName, trainerExpanse.Id),
                    UoMId = defaultUnit != null ? defaultUnit : null,
                    BaseAmount = new Money(invoice.pdt_TotalTrainerExpanse.Value)

                };
                if (service.Create(detail) != Guid.Empty)
                    tracingservice.Trace("Invoice Product for Trainer invoice created successfully");
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

        internal static void CreateCancellationClientInvoiceDetails(Guid inv, IOrganizationService service, ITracingService tracingservice)
        {
            try {
                EntityReference defaultUnit = null;
                Invoice invoice = service.Retrieve(Invoice.EntityLogicalName, inv, new ColumnSet("salesorderid", "pdt_coursecostgross")) as Invoice;
                SalesOrder trainingRequest = service.Retrieve(SalesOrder.EntityLogicalName, invoice.SalesOrderId.Id, new ColumnSet("pdt_course")) as SalesOrder;

                Product course = service.Retrieve(Product.EntityLogicalName, trainingRequest.pdt_course.Id, new ColumnSet("defaultuomid")) as Product;
                defaultUnit = new EntityReference(UoMSchedule.EntityLogicalName, course.DefaultUoMId.Id);

                if (invoice.pdt_CourseCostGross == null || trainingRequest.pdt_course == null)
                {
                    tracingservice.Trace("Either Course Gross Cost or Course is not avialble");
                    return;
                }

                InvoiceDetail detail = new InvoiceDetail
                {
                    InvoiceId = new EntityReference(Invoice.EntityLogicalName, inv),
                    Quantity = new Decimal(1),
                    PricePerUnit = new Money(invoice.pdt_CourseCostGross.Value),
                    IsPriceOverridden = true,
                    ProductId = new EntityReference(Product.EntityLogicalName, trainingRequest.pdt_course.Id),
                    UoMId = defaultUnit != null ? defaultUnit : null,
                    BaseAmount = new Money(invoice.pdt_CourseCostGross.Value)

                };

                Guid invDetails = service.Create(detail);
                if (invDetails != Guid.Empty)
                    tracingservice.Trace("Invoice Product " + invDetails.ToString() + " for Cancellation invoice created successfully");
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
    

