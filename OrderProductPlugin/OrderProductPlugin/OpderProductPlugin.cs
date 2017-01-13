using System;

// Microsoft Dynamics CRM namespace(s)
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;

namespace Pertemps.DriverTraining.Plugins.OrderProductPlugin
{
    class OpderProductPlugin
    {

        #region CreateOderProduct
        internal static void CreateOderProduct(SalesOrder order, Microsoft.Xrm.Sdk.IOrganizationService service, Microsoft.Xrm.Sdk.ITracingService tracingservice)
        {           
            decimal tax = 0;        
            Product product = null;
            Guid lineItemId = Guid.Empty;
            decimal quantity = 0;
            decimal uploadcost = 0;
            decimal priceperunit = 0;
            decimal coursecost = 0;
            decimal taxrate = 0;
            bool isPriceOverridden = false;
            bool isProductOverridden = false;

            try { 
            product = service.Retrieve(Product.EntityLogicalName, order.pdt_course.Id, new ColumnSet("producttypecode", "defaultuomid")) as Product;
            
            if (product == null) { tracingservice.Trace("No Product available"); return; }
            tracingservice.Trace("Course Name:"+ product.Name);

            coursecost = order.pdt_BaseAmount.Value;
            taxrate = order.pdt_TaxRate.Value;
            tax = 0;//coursecost * taxrate;
           
            quantity = order.pdt_NumberofDelegates != null ? Convert.ToDecimal(1) : Convert.ToDecimal(0);

            // Add upload cost
            uploadcost = order.pdt_UploadFeeNonVat != null ? order.pdt_UploadFeeNonVat.Value : Convert.ToDecimal(0);

            if (uploadcost != 0 && coursecost != 0)
            {
                priceperunit = uploadcost + coursecost;
                isPriceOverridden = true;
                isProductOverridden = true;
            }
            else
                priceperunit = coursecost;

            SalesOrderDetail lineItem = new SalesOrderDetail
            {
                SalesOrderId = new EntityReference(order.LogicalName, order.Id),
                ProductId = new EntityReference(Product.EntityLogicalName, product.Id),
                Quantity = Convert.ToDecimal(quantity),
                Tax = new Money(Convert.ToDecimal(tax)),
                ProductTypeCode = product.ProductTypeCode != null ? product.ProductTypeCode : new OptionSetValue(1),
                UoMId = product.DefaultUoMId != null ? product.DefaultUoMId : null,
                PricePerUnit =new Money( priceperunit),
                IsPriceOverridden = isPriceOverridden,
                IsProductOverridden = isProductOverridden,
                WillCall = false
            }; 

                 lineItemId= service.Create(lineItem);
                 tracingservice.Trace(" Order Product Created:" + lineItemId.ToString());
                       
            return;
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
        #endregion

        #region UpdateOrderProduct
        internal static void UpdateOrderProduct(SalesOrder image,SalesOrder order, IOrganizationService service, ITracingService tracingservice)
        {
            try { 
           
            if (order.SalesOrderId == Guid.Empty)
            {
                tracingservice.Trace("No Order found....");
                return;
            }

            decimal tax = 0;
            
            decimal ordAmount = order.pdt_BaseAmount!=null? order.pdt_BaseAmount.Value:-1;
            decimal  ordUploadFee = order.pdt_UploadFeeNonVat != null ? order.pdt_UploadFeeNonVat.Value : -1;
            decimal imgAmount = image.pdt_BaseAmount != null ? image.pdt_BaseAmount.Value :-1;
            decimal imgUploadFee = image.pdt_UploadFeeNonVat != null ? image.pdt_UploadFeeNonVat.Value :-1;

            EntityReference ordCourse = order.pdt_course != null ? order.pdt_course : null;
            int ordNoOfDelegates = order.pdt_NumberofDelegates != null ? order.pdt_NumberofDelegates.Value : -1;
            int imgNoOfDelegates = image.pdt_NumberofDelegates != null ? image.pdt_NumberofDelegates.Value : -1;
            decimal taxrate = image.pdt_TaxRate != null ? image.pdt_TaxRate.Value : 0; 
            tax = imgAmount * taxrate;


            SalesOrderDetail orderProduct = new SalesOrderDetail();

             Guid salesOderDetailId = CheckIfExisting(SalesOrderDetail.EntityLogicalName, "salesorderid", order.Id, service,tracingservice);

            if (salesOderDetailId == Guid.Empty)
            {
                tracingservice.Trace(" Order Product not found for update");
                return;
            }

            orderProduct.SalesOrderDetailId = salesOderDetailId;

            if (ordAmount != -1 && ordUploadFee != -1)
            {
                orderProduct.PricePerUnit = new Money(ordAmount + ordUploadFee);
                orderProduct.IsPriceOverridden = true;
            }
            else if (ordAmount == -1 && ordUploadFee != -1)
            {
                orderProduct.PricePerUnit = new Money(imgAmount + ordUploadFee);
                orderProduct.IsPriceOverridden = true;

            }
            else if (ordAmount != -1)
            {
                if (imgUploadFee != -1)
                    orderProduct.PricePerUnit = new Money(ordAmount + imgUploadFee);
                else
                    orderProduct.PricePerUnit = new Money(ordAmount);
                orderProduct.IsPriceOverridden = true;
            }

            if (ordCourse != null)
            {
                orderProduct.ProductId = ordCourse;
                orderProduct.IsProductOverridden = true;
            }

            if (ordNoOfDelegates != -1)
            {
                if (ordNoOfDelegates > 0)
                {
                    orderProduct.Quantity = Convert.ToDecimal(1);
                    orderProduct.Tax = new Money(tax);
                }
                else
                {
                    orderProduct.Quantity = Convert.ToDecimal(0);
                    orderProduct.Tax = new Money(0);
                }
            }
            else
            {
                if (imgNoOfDelegates > 0)
                {
                    orderProduct.Quantity = Convert.ToDecimal(1);
                    orderProduct.Tax = new Money(tax);
                }
                else
                    orderProduct.Quantity = Convert.ToDecimal(0);

            }

          //  orderProduct.Tax = new Money(tax);
            
            service.Update(orderProduct);
                tracingservice.Trace(" Order Product Updated");           
                return;
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
        #endregion

      

        #region CheckIfExisting
        internal static Guid CheckIfExisting(string entityName, string field, Guid fieldValue,IOrganizationService service, ITracingService tracingservice)
        {
            try
            {
                QueryExpression entityQuery = new QueryExpression(entityName);
                entityQuery.ColumnSet = new ColumnSet(entityName + "id");
                entityQuery.Criteria = new FilterExpression();
                entityQuery.Criteria.AddCondition(field, ConditionOperator.Equal, fieldValue);
             
                EntityCollection retrievedEntities = service.RetrieveMultiple(entityQuery);
                if (retrievedEntities.Entities.Count > 0 && retrievedEntities.Entities[0].Id != null)
                    return retrievedEntities.Entities[0].Id;
                else
                    return Guid.Empty;
            }
            catch (Exception e)
            {
                tracingservice.Trace("There was an exception of type" + e.GetType());
                tracingservice.Trace("Error message " + e.Message);
                tracingservice.Trace(e.StackTrace);

            }
            return Guid.Empty;
        }
        #endregion
        
        
    }
    
}
    

