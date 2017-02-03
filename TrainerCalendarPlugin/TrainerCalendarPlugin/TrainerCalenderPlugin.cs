using System;

// Microsoft Dynamics CRM namespace(s)
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using Microsoft.Crm.Sdk.Messages;

namespace Pertemps.DriverTraining.Plugins.TrainerCalenderPlugin
{
    class TrainerCalenderPlugin
    {
        internal static void ManageCalenderEntries(EntityReference trainer, DateTime bookeStart, DateTime bookedEnd, ITracingService tracingservice, IOrganizationService service)
        {
            EntityCollection entities = GetCalendarEntries(trainer.Id, bookeStart, bookedEnd, service, tracingservice);
           
            for (int i = 0; i < entities.Entities.Count; i++)
            {

                pdt_trainerscalender entity = entities[i] as pdt_trainerscalender;
                DateTime start = (DateTime)entity.Attributes["pdt_starttime"];
                DateTime end = (DateTime)entity.Attributes["pdt_endtime"];
               
                pdt_trainerscalender c1 = new pdt_trainerscalender();
                pdt_trainerscalender c2 = new pdt_trainerscalender();
                pdt_trainerscalender c3 = new pdt_trainerscalender();
               
                c1.pdt_trainer = new EntityReference(entity.LogicalName, trainer.Id);
                c2.pdt_trainer = new EntityReference(entity.LogicalName, trainer.Id); ;
                c3.pdt_trainer = new EntityReference(entity.LogicalName, trainer.Id); ;


                if (start < bookeStart)
                {

                    c1.pdt_StartTime = start;
                    c1.pdt_EndTime = new DateTime(bookeStart.Year, bookeStart.Month, bookeStart.Day - 1, bookeStart.Hour, bookeStart.Minute, bookeStart.Second);
                    c2.pdt_StartTime = bookeStart;

                }

                if (bookeStart == start) {
                    c2.pdt_StartTime = start;
                    c2.pdt_EndTime = bookedEnd;
                    c3.pdt_StartTime =  new DateTime(bookedEnd.Year, bookedEnd.Month, bookedEnd.Day + 1, bookedEnd.Hour, bookedEnd.Minute, bookedEnd.Second) ;

                }

                if (bookedEnd < end)
                {
                    c2.pdt_EndTime = bookedEnd;
                    c3.pdt_StartTime = new DateTime(bookedEnd.Year, bookedEnd.Month, bookedEnd.Day + 1, bookedEnd.Hour, bookedEnd.Minute, bookedEnd.Second);
                    c3.pdt_EndTime = end;

                }

                if (bookedEnd == end)
                {               
                    c2.pdt_EndTime = bookedEnd;  
                }


                if (c1.pdt_StartTime == bookeStart && c1.pdt_EndTime == bookedEnd)
                {
                    c1.pdt_Type = new OptionSetValue(749700000);
                    c1.statuscode = new OptionSetValue(1);
                    c1.pdt_TrainerCompany = entity.pdt_TrainerCompany != null ? new EntityReference(Account.EntityLogicalName, entity.pdt_TrainerCompany.Id) : null;
                }
                else
                    c1.pdt_Type = new OptionSetValue(749700000);

                if (c2.pdt_StartTime == bookeStart && c2.pdt_EndTime == bookedEnd)
                {
                    c2.pdt_Type = new OptionSetValue(749700000);
                    c2.statuscode = new OptionSetValue(1);
                    c2.pdt_TrainerCompany = entity.pdt_TrainerCompany!=null?new EntityReference(Account.EntityLogicalName, entity.pdt_TrainerCompany.Id):null;
                }
                else
                    c2.pdt_Type = new OptionSetValue(749700000);

                if (c3.pdt_StartTime == bookeStart && c3.pdt_EndTime == bookedEnd)
                {
                    c3.pdt_Type = new OptionSetValue(749700000);
                    c3.statuscode = new OptionSetValue(1);
                    c3.pdt_TrainerCompany = entity.pdt_TrainerCompany != null ? new EntityReference(Account.EntityLogicalName, entity.pdt_TrainerCompany.Id) : null;
                }
                else
                    c3.pdt_Type = new OptionSetValue(749700000);

                service.Delete(entity.LogicalName, entity.Id);
                if(c1.pdt_StartTime!=null && c1.pdt_EndTime!=null)
                    service.Create(c1);
                if (c2.pdt_StartTime != null && c2.pdt_EndTime != null)
                    service.Create(c2);
                if (c3.pdt_StartTime != null && c3.pdt_EndTime != null)
                    service.Create(c3);


            }
        }

        internal static void UpdateCalenderEntry(Guid trainerId, DateTime bookeStart, DateTime bookedEnd, IOrganizationService service, ITracingService tracingservice)
        {

            //  update calander entry on selected trainer changed.

            EntityCollection entities = GetCalendarEntries(trainerId, bookeStart, bookedEnd, service, tracingservice);

            for (int i = 0; i < entities.Entities.Count; i++)
            {

                pdt_trainerscalender entity = entities[i] as pdt_trainerscalender;
                if (entity.statuscode.Value != 749700005)
                {
                    entity.statuscode = new OptionSetValue(749700005);
                    service.Update(entity);
                }
            }
        }


        #region CheckIfExisting
        internal static EntityCollection GetCalendarEntries(Guid trainerId,DateTime start,DateTime end, IOrganizationService service, ITracingService tracingservice)
        {
            EntityCollection retrievedEntities=new EntityCollection();
            try
            {
               
                QueryExpression entityQuery = new QueryExpression("pdt_trainerscalender");
                entityQuery.ColumnSet = new ColumnSet(true);//("pdt_trainerscalenderid", "pdt_trainer", "pdt_starttime", "pdt_endtime");
                entityQuery.Criteria = new FilterExpression();
                entityQuery.Criteria.AddCondition("pdt_starttime", ConditionOperator.LessEqual, start);
                entityQuery.Criteria.AddCondition("pdt_endtime", ConditionOperator.GreaterEqual, end);
                entityQuery.Criteria.AddCondition("pdt_type", ConditionOperator.Equal, 749700000);
                entityQuery.Criteria.AddCondition("pdt_trainer", ConditionOperator.Equal, trainerId);

                retrievedEntities = service.RetrieveMultiple(entityQuery);
               
               
            }
            catch (Exception e)
            {
                tracingservice.Trace("There was an exception of type" + e.GetType());
                tracingservice.Trace("Error message " + e.Message);
                tracingservice.Trace(e.StackTrace);

            }
            return retrievedEntities;
        }
        #endregion

    }
}