using System;
using System.ServiceModel;

// Microsoft Dynamics CRM namespace(s)
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
namespace Pertemps.DriverTraining.Plugins.PDTUtilityPlugin
{
    class UtilityPlugin
    {
        internal static void DeleteObjectReference(Guid invid, IOrganizationService service, ITracingService tracingservice)
        {
            try
            {
              

              
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
    

