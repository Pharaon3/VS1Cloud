import "jQuery.print/jQuery.print.js";
import { ReactiveVar } from "meteor/reactive-var";
import { SideBarService } from "../js/sidebar-service";
import { Random } from "meteor/random";
import { OrganisationService } from "../js/organisation-service";
import { PurchaseBoardService } from "../js/purchase-service";
import { SalesBoardService } from '../js/sales-service';
import { ContactService } from "../contacts/contact-service";
import { ProductService } from "../product/product-service";
import { Template } from 'meteor/templating';
import './custfielddroppop.html';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { cloneDeep } from "lodash";

let sideBarService = new SideBarService();
let salesService = new SalesBoardService();
let contactService = new ContactService();
let productService = new ProductService();
let isDropdown = false;
let clickedInput = "";

Template.custfielddroppop.onCreated(async () => {
  const templateObject = Template.instance();
  templateObject.tableheaderrecords = new ReactiveVar();
  templateObject.custfields = new ReactiveVar([]);
  templateObject.dropdowns = new ReactiveVar();
  let headerStructure = [
    {index: 0, label: "ID", class: "colCustField", active: false, display: true, width: "30",},
    {index: 1, label: "Custom Field Value", class: "colFieldName", active: true, display: true, width: "", },
  ]
  templateObject.tableheaderrecords.set(headerStructure)

  let fieldid = templateObject.data.custid2;

  
  templateObject.getDropdowns = async function() {
    return new Promise((resolve, reject)=> {
      getVS1Data('TCustomFieldList').then(function(dataObject) {
        if(dataObject.length == 0) {
          sideBarService.getOneCustomField(fieldid).then(function (data) {
            resolve(data.fields.Dropdown)
          })
        } else {
          let data = JSON.parse(dataObject[0].data);
          let useData = data.tcustomfieldlist;
          let index = useData.findIndex(item => {
            return item.fields.ID == fieldid
          })
          if(index > -1) {
            resolve(useData[index].fields.Dropdown)
          }
        }
      }).catch(function(err) {
        sideBarService.getOneCustomField(fieldid).then(function (data) {
          resolve(data.fields.Dropdown)
        })
      })
    })
  }

  let dropdowns = await templateObject.getDropdowns();
  

  templateObject.datahandler = function (data) {
    let dataReturn = [];
    let listType = '';
    let url = FlowRouter.current().path;
    if(url.includes("/invoicecard") == true || url.includes("/invoicetemp") == true) {
      listType = 'ltSales'
    }

    if(listType != '') {
      let dropdowns = templateObject.dropdowns.get();
      if(!dropdowns || dropdowns == null) {
        setTimeout(()=>{
          return templateObject.datahandler();
        }, 500)
      }
      for(let i=0; i< dropdowns.length; i++) {
        dataReturn.push([dropdowns[i].fields.ID, dropdowns[i].fields.Text])
      }
    }

    return dataReturn;
  }

  templateObject.dropdowns.set(dropdowns)
});

Template.custfielddroppop.onRendered(()=>{

})

Template.custfielddroppop.helpers({
    tableheaderrecords:()=>{
        return Template.instance().tableheaderrecords.get()
    },

    datahandler: function() {
      let templateObject = Template.instance();
      return function(data) {
        let datareturn =  templateObject.datahandler(data)
        return datareturn
      }
    },

    apiFunction: function () {
      return sideBarService.getAllCustomFieldsDropDown
    }
})

Template.custfielddroppop.events({
  "click .addNewOption": function(event) {
    event.preventDefault();
    event.stopPropagation();
    let templateObject = Template.instance();
    let sn = templateObject.data.sn;
    $('#myModal4_'+sn).modal('show');
    $(event.target).closest('div.modal.fade.show').modal('hide')
  }
})