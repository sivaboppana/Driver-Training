function showFormOnInvoicetype() {

    var invoicetype = Xrm.Page.getAttribute("pdt_invoicetype").getValue();
   
    if (invoicetype == 749700001){ //COURSE
    
        Xrm.Page.ui.tabs.get("Summary_tab").sections.get("Summary_tab_section_trainer").setVisible(false);
        Xrm.Page.ui.tabs.get("Summary_tab").sections.get("Summary_tab_section_course").setVisible(true);
       
    }
       
    if (invoicetype == 749700000) {//TRAINER

        Xrm.Page.ui.tabs.get("Summary_tab").sections.get("Summary_tab_section_course").setVisible(false);
        Xrm.Page.ui.tabs.get("Summary_tab").sections.get("Summary_tab_section_trainer").setVisible(true);
       
    }       
}

