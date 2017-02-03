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

    
     
        internal static void UpdateTaxOnDetails( Invoice inv,IOrganizationService service, ITracingService tracingservice)
        {
            EntityCollection details = GetInvoiceDetails(InvoiceDetail.EntityLogicalName, "invoiceid", inv.Id, service, tracingservice);
            if (details != null)
            {
                if (details.Entities.Count > 0)
                {
                    InvoiceDetail detail = details.Entities[0].ToEntity<InvoiceDetail>();
                   
                    decimal invVat = inv.pdt_VAT != null ? inv.pdt_VAT.Value : -1;
                    decimal detVat = detail.Tax != null ? detail.Tax.Value : -1;

                    if (invVat > 0 && invVat!=detVat) {

                        detail.Tax = new Money(invVat);
                        service.Update(detail);
                        tracingservice.Trace("Tax:"+detail.Tax.Value);

                    }
                }

            }
           
        }

        internal static void CreateCancellationClientInvoiceDetails(Guid inv, IOrganizationService service, ITracingService tracingservice)
        {
            try {
                EntityReference defaultUnit = null;
                Invoice invoice = service.Retrieve(Invoice.EntityLogicalName, inv, new ColumnSet("salesorderid", "pdt_coursecostgrs")) as Invoice;
                SalesOrder trainingRequest = service.Retrieve(SalesOrder.EntityLogicalName, invoice.SalesOrderId.Id, new ColumnSet("pdt_course")) as SalesOrder;

                Product course = service.Retrieve(Product.EntityLogicalName, trainingRequest.pdt_course.Id, new ColumnSet("defaultuomid")) as Product;
                defaultUnit = new EntityReference(UoMSchedule.EntityLogicalName, course.DefaultUoMId.Id);

                if (invoice.pdt_CourseCostGrs == null || trainingRequest.pdt_course == null)
                {
                    tracingservice.Trace("Either Course Gross Cost or Course is not avialble");
                    return;
                }

                InvoiceDetail detail = new InvoiceDetail
                {
                    InvoiceId = new EntityReference(Invoice.EntityLogicalName, inv),
                    Quantity = new Decimal(1),
                    PricePerUnit = new Money(invoice.pdt_CourseCostGrs.Value),
                    IsPriceOverridden = true,
                    ProductId = new EntityReference(Product.EntityLogicalName, trainingRequest.pdt_course.Id),
                    UoMId = defaultUnit != null ? defaultUnit : null,
                    BaseAmount = new Money(invoice.pdt_CourseCostGrs.Value)

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
        #region GetInvoice Details
        internal static EntityCollection GetInvoiceDetails(string entityName, string field, Guid fieldValue, IOrganizationService service, ITracingService tracingservice)
        {
            try
            {
                QueryExpression entityQuery = new QueryExpression(entityName);
                entityQuery.ColumnSet = new ColumnSet(entityName + "id","tax");
                entityQuery.Criteria = new FilterExpression();
                entityQuery.Criteria.AddCondition(field, ConditionOperator.Equal, fieldValue);

                EntityCollection retrievedEntities = service.RetrieveMultiple(entityQuery);
                if (retrievedEntities.Entities.Count > 0)
                    return retrievedEntities;
                
            }
            catch (Exception e)
            {
                tracingservice.Trace("There was an exception of type" + e.GetType());
                tracingservice.Trace("Error message " + e.Message);
                tracingservice.Trace(e.StackTrace);

            }
            return null;
        }
        #endregion
    }
}
    

