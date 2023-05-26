import { Template } from 'meteor/templating';
import { cloneDeep } from 'lodash';
import "./modals/index.js"
import "./components/custom_fields.html"
import "./components/customer_email_input.html"
import "./components/customer_selector.html"
import "./transactionheader.html";
import { SideBarService } from '../../../js/sidebar-service.js';

let sideBarService = new SideBarService();

Template.transactionheader.onCreated(function(){
    let templateObject = Template.instance();
    templateObject.custfields = new ReactiveVar();
})

Template.transactionheader.onRendered(function(){
    let templateObject = Template.instance();

    templateObject.getCustomfields = function () {
        let custFields = [];
        let listType = templateObject.data.custlisttype;
    
        let customFieldCount = 3; // customfield tempcode
        let customData = {};
    
        getVS1Data("TCustomFieldList").then(function (dataObject) {
          if (dataObject.length == 0) {
            sideBarService.getAllCustomFields().then(function (data) {
              for (let x = 0; x < data.tcustomfieldlist.length; x++) {
                if (data.tcustomfieldlist[x].fields.ListType == listType) {
                   
                    let customData = setCustomfields(data.tcustomerfieldlist[x].fields)
                    custFields.push(customData);
                }
              }
              if(custFields.length > customFieldCount) {
                custFields.splice(0, custFields.length-3);
              }
              if (custFields.length < customFieldCount) {
                custFields = setCustFieldsForReminder(custFields, customFieldCount)
              }
              

              custFields.map((item, index)=> {
                item.fieldIndex = index+1
              })
              templateObject.custfields.set(custFields);
            
            });
          }else{
            let data = JSON.parse(dataObject[0].data);
              for (let x = 0; x < data.tcustomfieldlist.length; x++) {
                if (data.tcustomfieldlist[x].fields.ListType == listType) {

                  customData = setCustomfields(data.tcustomfieldlist[x].fields) 
                  custFields.push(customData);
                }
              }
              if(custFields.length > customFieldCount) {
                custFields.splice(0, custFields.length-3);
              }
              if (custFields.length < customFieldCount) {
                custFields = setCustFieldsForReminder(custFields, customFieldCount)
              }
              custFields.map((item, index)=> {
                item.fieldIndex = index+1
              })
              templateObject.custfields.set(custFields);

          }
        }).catch(function(err) {
          let data = JSON.parse(dataObject[0].data);
              for (let x = 0; x < data.tcustomfieldlist.length; x++) {
                if (data.tcustomfieldlist[x].fields.ListType == listType) {

                  customData = setCustomfields(data.tcustomfieldlist[x].fields) 
                  custFields.push(customData);
                }
              }
              if(custFields.length > customFieldCount) {
                custFields.splice(0, custFields.length-3);
              }
              if (custFields.length < customFieldCount) {
                custFields = setCustFieldsForReminder(custFields, customFieldCount)
              }
              custFields.map((item, index)=> {
                item.fieldIndex = index+1
              })
              templateObject.custfields.set(custFields);
        })


    
        function setCustomfields(data) {
            let customData = {
                active: data.Active || false,
                id: parseInt(data.ID) || 0,
                custfieldlabel: data.Description || "",
                datatype: data.DataType || "",
                isempty: data.ISEmpty || false,
                iscombo: data.IsCombo || false,
                dropdown: data.Dropdown || null,
                displayType: data.DataType=='ftDateTime'?'Date': data.IsCombo? 'Dropdown': 'Text'
            }
    
            return customData
        }
    
        function setCustFieldsForReminder  (custFields, customFieldCount) {
            let remainder = customFieldCount - custFields.length;
            let getRemCustomFields = parseInt(custFields.length);
            let cloneCustFields = cloneDeep(custFields)
            // count = count + remainder;
            for (let r = 0; r < remainder; r++) {
              getRemCustomFields++;
              let customData = {
                active: false,
                id: "",
                custfieldlabel: "Custom Field " + getRemCustomFields,
                datatype: "",
                isempty: true,
                iscombo: false,
              };
              // count++;
              cloneCustFields.push(customData);
            }
            return cloneCustFields
        }
    
    } 

    templateObject.getCustomfields();

    
})

Template.transactionheader.helpers({
    getCustomerID:function(){
        let templateObject = Template.instance();
        if (templateObject.data.clientType == 'Supplier') {
            return 'edtSupplierName'
        } else {
            return 'edtCustomerName'
        }
    },
    modal_id: function() {
        let templateObject = Template.instance();
        if (templateObject.data.clientType == 'Supplier') {
            return 'supplierList_modal'
        } else {
            return 'customerList_modal'
        }
    },
    getTemplate: function() {
        let templateObject = Template.instance();
        if (templateObject.data.clientType == 'Supplier') {
            return 'supplierlistpop'
        } else {
            return 'customerlistpop'
        }
    },
    getTargetModalID: function() {
        let templateObject = Template.instance();
        if (templateObject.data.clientType == 'Supplier') {
            return 'addSupplierModal'
            // return 'edtSupplier_modal'
        } else {
            return 'addCustomerModal'
            // return 'edtCustomer_modal'
        }
    },
    getTargetTemplate: function() {
        let templateObject = Template.instance();
        if (templateObject.data.clientType == 'Supplier') {
            return 'addsupplierpop'
        } else {
            return 'addcustomerpop'
        }
    },
    getModalTitle: function() {
        let templateObject = Template.instance();
        if (templateObject.data.clientType == 'Supplier') {
            return 'Supplier List'
        } else {
            return 'Customer List'
        }
    },
    getgridTableId: function() {
      let templateObject = Template.instance();
        return templateObject.data.gridTableId;
    },
    custfields: () => {
        return Template.instance().custfields.get();
    }
})

Template.transactionheader.events({
    
})
