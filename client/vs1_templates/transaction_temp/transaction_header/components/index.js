import "./custom_fields.html"
import "./cust_fields.html"
import "./customer_email_input.html"
import "./customer_selector.html"
import "./invoice_number_input.html"
import "./po_number_input.html"
import "./sale_date_selector.html"

Template.registerHelper('getIndex', function(index) {
    return index + 1;
});

Template.cust_fields.helpers({
    getIndex:(index)=>{
        return index + 1
    }
})