import './onOrderPopUp.html';
import { Template } from 'meteor/templating';
import { ProductService } from "../../product/product-service";
import { ReactiveVar } from "meteor/reactive-var";
import { UtilityService } from "../../utility-service";
import "jquery-editable-select";
import XLSX from "xlsx";
import { SideBarService } from "../../js/sidebar-service";
import "../../lib/global/indexdbstorage.js";

// import { Template } from "meteor/templating";
import { FlowRouter } from "meteor/ostrio:flow-router-extra";
import moment from "moment";

let sideBarService = new SideBarService();
let utilityService = new UtilityService();
let productService = new ProductService();

Template.onOrderPopUp.onCreated(function () {
  const templateObject = Template.instance();
  templateObject.datatablebackuprecords = new ReactiveVar([]);
  templateObject.tableheaderrecords = new ReactiveVar([]);
  templateObject.recentTrasactions = new ReactiveVar([]);
  templateObject.productID = new ReactiveVar();


  templateObject.getDataTableList = function(data) {
    var dataList = [
        data.Id,
        data.TransactionDate != ""
          ? moment(data.TransactionDate).format("DD/MM/YYYY")
          : data.TransactionDate,
        data.TranstypeDesc,
        data.TransactionNo,
        data.Qty,
        data.Available || 0,
        utilityService.modifynegativeCurrencyFormat(data.Price),
        utilityService.modifynegativeCurrencyFormat(data.TotalPrice),
        data.Active ? "In-Active" : "",
    ];
    return dataList;
  }

  let headerStructure = [
    { index: 0, label: "Id", class: "SortDate", width: "0", active: false, display: false },
    { index: 1, label: "Date", class: "Date", active: true, display: true, width: "80" },
    { index: 2, label: "Type", class: "Type", active: true, display: true, width: "200" },
    { index: 3, label: "Ref", class: "Ref", active: true, display: true, width: "100" },
    { index: 4, label: "Qty", class: "Qty", active: true, display: true, width: "110" },
    { index: 5, label: "Total Running", class: "TotalRunning", active: true, display: true, width: "110" },
    { index: 6, label: "Unit Price", class: "UnitPrice", active: true, display: true, width: "110" },
    { index: 7, label: "Total", class: "Total", active: true, display: true, width: "110" },
    { index: 8, label: "Status", class: "Status", active: true, display: true, width: "120" },
  ];

  templateObject.tableheaderrecords.set(headerStructure);
});

Template.onOrderPopUp.onRendered(function () {
  $(".fullScreenSpin").css("display", "inline-block");

});

Template.onOrderPopUp.helpers({
  datatablerecords: () => {
    // return Template.instance().datatablerecords.get();

    return Template.instance()
      .datatablerecords.get()
      .sort(function (a, b) {
        if (a.productname == "NA") {
          return 1;
        } else if (b.productname == "NA") {
          return -1;
        }
        return a.productname.toUpperCase() > b.productname.toUpperCase() ? 1 : -1;
      });
  },
  tableheaderrecords: () => {
    return Template.instance().tableheaderrecords.get();
  },
  salesCloudPreferenceRec: () => {
    return CloudPreference.findOne({
      userid: localStorage.getItem("mycloudLogonID"),
      PrefName: "productrecentlist3",
    });
  },
  productsCloudPreferenceRec: () => {
    return CloudPreference.findOne({
      userid: localStorage.getItem("mycloudLogonID"),
      PrefName: "productrecentlist3",
    });
  },
  recentTrasactions: () => {
    return Template.instance().recentTrasactions.get();
  },
  productID: () => {
    // let templateObject = Template.instance();
    // templateObject.getAllProductRecentTransactions();
    return Template.instance().productID.get();
  },
  // custom field displaysettings
  displayfields: () => {
    return Template.instance().displayfields.get();
  },

  dataProductList: () => {
    return Template.instance().productDataList.get();
  },

  columnData: () => {
    return Template.instance().columnData.get();
  },

  isInventoryListConfirmed(){
    let confirmedSteps = localStorage.getItem("VS1Cloud_SETUP_CONFIRMED_STEPS") || "";
    return confirmedSteps.includes(10);
  },

  isSetupFinished: () => {
    return Template.instance().setupFinished.get();
  },
  productID: () => {
    return Template.instance().productID.get();
  },
  getSkippedSteps() {
    let setupUrl = localStorage.getItem("VS1Cloud_SETUP_SKIPPED_STEP") || JSON.stringify().split();
    return setupUrl[1];
  },
  transtype: () => {
    return Template.instance().transtype.get();
  },

  apiFunction:function() {
    let productService = new ProductService();
    return productService.getProductRecentTransactionsOnOrder
  },

  searchAPI: function() {
    let productService = new ProductService();
    return productService.getOneProductRecentTransaction
  },

  service: ()=>{
    let productService = new ProductService();
    return productService;

  },

  datahandler: function () {
    let templateObject = Template.instance();
    return function(data) {
      let dataReturn =  templateObject.getDataTableList(data)
      return dataReturn
    }
  },

  exDataHandler: function() {
    let templateObject = Template.instance();
    return function(data) {
      let dataReturn =  templateObject.getDataTableList(data)
      return dataReturn
    }
  },

  apiParams: function() {
    return ['limitCount', 'limitFrom', 'deleteFilter'];
  },
  // tablename: () => {
  //   let templateObject = Template.instance();
  //   let accCustID = templateObject.data.custid ? templateObject.data.custid : '';
  //   return 'productrecentlist'+ accCustID;
  // },
});

Template.onOrderPopUp.events({
//   "click td.colOnBO": function (event) {
//     var listData = $(event.target).closest("tr").attr('id');
//     var listProductName = $(event.target).closest("tr").find(".colProductName").text();
//     if (listData) {
//       $("#transTitle").text(listProductName + " - On Back Order");

//       let templateObject = Template.instance();
//       templateObject.productID.set(listData);
//       templateObject.transtype.set("Purchase Order");
//       setTimeout(() => {
//         $("#recentTransactionPopUp").modal("show");
//       });
//     }
//   },
//   "click td.colInStock": function (event) {
//     var listData = $(event.target).closest("tr").attr('id');
//     var listProductName = $(event.target).closest("tr").find(".colProductName").text();
//     if (listData) {
//       $("#transTitle").text(listProductName + " - In Stock");
//       let templateObject = Template.instance();
//       templateObject.productID.set(listData);
//       templateObject.transtype.set("all");
//       setTimeout(() => {
//         $("#recentTransactionPopUp").modal("show");
//       });
//     }
//   },
//   "click td.colAvailable": function (event) {
//     var listData = $(event.target).closest("tr").attr('id');
//     var listProductName = $(event.target).closest("tr").find(".colProductName").text();
//     if (listData) {
//       $("#transTitle").text(listProductName + " - Available");
//       let templateObject = Template.instance();
//       templateObject.productID.set(listData);
//       templateObject.transtype.set("all");
//       setTimeout(() => {
//         $("#recentTransactionPopUp").modal("show");
//       });
//     }
//   },

//   "click td.colOnSO": function (event) {
//     var listData = $(event.target).closest("tr").attr('id');
//     var listProductName = $(event.target).closest("tr").find(".colProductName").text();
//     if (listData) {
//       $("#transTitle").text(listProductName + " - On Sales Order");
//       let templateObject = Template.instance();
//       templateObject.productID.set(listData);
//       templateObject.transtype.set("Sales Order");
//       setTimeout(() => {
//         $("#recentTransactionPopUp").modal("show");
//       });
//     }
//   },

//   "click td.colOnOrder": function (event) {
//     var listData = $(event.target).closest("tr").attr('id');
//     var listProductName = $(event.target).closest("tr").find(".colProductName").text();
//     if (listData) {
//       $("#transTitle").text(listProductName + " - On Order");

//       let templateObject = Template.instance();
//       templateObject.productID.set(listData);
//       templateObject.transtype.set("Invoice");
//       setTimeout(() => {
//         $("#recentTransactionPopUp").modal("show");
//       });
//     }
//   },
});

Template.registerHelper("equals", function (a, b) {
  return a === b;
});
