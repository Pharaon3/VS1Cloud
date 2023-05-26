import { ReportService } from "../report-service";
import "jQuery.print/jQuery.print.js";
import { UtilityService } from "../../utility-service";
import LoadingOverlay from "../../LoadingOverlay";
import { TaxRateService } from "../../settings/settings-service";
import Datehandler from "../../DateHandler";
import GlobalFunctions from "../../GlobalFunctions";
import CachedHttp from "../../lib/global/CachedHttp";
import erpObject from "../../lib/global/erp-objects";
import FxGlobalFunctions from "../../packages/currency/FxGlobalFunctions";
import { Template } from 'meteor/templating';
import "./suppliersummary.html";

let reportService = new ReportService();
let utilityService = new UtilityService();
let taxRateService = new TaxRateService();
let defaultCurrencyCode = CountryAbbr;

Template.suppliersummary.onCreated(() => {
  const templateObject = Template.instance();
  templateObject.displaysettings = new ReactiveVar([]);

  FxGlobalFunctions.initVars(templateObject);
  let reset_data = [
    { index: 0, label: 'ID', class:'colLineId', active: false, display: true, width: "10", calc: false},
    { index: 1, label: 'Supplier', class: 'colSupplierID', active: true, display: true, width: "200", calc: false},
    { index: 2, label: 'PO No', class: 'colPONumber', active: true, display: true, width: "150", calc: false},
    { index: 3, label: 'Trans Type', class: 'colTransType', active: true, display: true, width: "150", calc: false},
    { index: 4, label: 'Product ID', class: 'colProductID', active: true, display: true, width: "150", calc: false},
    { index: 5, label: 'Product Desc', class: 'colProductDesc', active: true, display: true, width: "150", calc: false},
    { index: 6, label: 'Cost (ex)', class: 'colCostEx text-right', active: true, display: true, width: "150", calc: true},
    { index: 7, label: 'Tax', class: 'colTax text-right', active: true, display: true, width: "150", calc: true},
    { index: 8, label: 'Cost (inc)', class: 'colCostInc text-right', active: true, display: true, width: "150", calc: true},
    { index: 9, label: 'Tax Code', class: 'colTax text-right', active: true, display: true, width: "150", calc: false},
    { index: 10, label: 'Qty Ordered', class: 'colQtyOrder text-right', active: true, display: true, width: "150", calc: false},
    { index: 11, label: 'Qty Received', class: 'colQtyReceive text-right', active: true, display: true, width: "150", calc: false},
    { index: 12, label: 'Qty BO', class: 'colQtyBO text-right', active: true, display: true, width: "150", calc: false},
    { index: 13, label: 'ETA Date', class: 'colETADate', active: true, display: true, width: "150", calc: false},
    { index: 14, label: 'Order Date', class: 'colOrderDate', active: true, display: true, width: "150", calc: false},
    { index: 15, label: 'Received Date', class: 'colReceivedDate', active: true, display: true, width: "150", calc: false},
  ]
  templateObject.displaysettings.set(reset_data);
  templateObject.getReportDataRecord = function(data) {
    var dataList = [];
    if(data!='') {
      dataList =  [
        data["Supplier Name"] || "",
        data["Purchase Order Number"] || "",
        data["Transaction Type"] || "",
        data["ProductID"] || "",
        data["Product Description"] || "",
        data["Line Cost (Ex)"] || "",
        data["Line Tax"] || "",
        data["Line Cost (Inc)"] || "",
        data["Tax Code"] || "",
        data["Ordered"] || "",
        data["BackOrder"] || "",
        data["BackOrder"] || "",
        GlobalFunctions.formatDate(data["ETADate"]),
        GlobalFunctions.formatDate(data["Order Date"]),
        GlobalFunctions.formatDate(data["ReceivedDate"]),
      ];
    }else {
      dataList = [
        "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""
      ]
    }
    return dataList;
  }
});
Template.suppliersummary.onRendered(() => {});
// Template.suppliersummary.onRendered(() => {
//   const templateObject = Template.instance();
//   LoadingOverlay.show();
//
//   let reset_data = [
//     { index: 1, label: 'Supplier', class: 'colSupplierID', active: true, display: true, width: "150" },
//     { index: 2, label: 'PO No', class: 'colContactName', active: true, display: true, width: "150" },
//     { index: 3, label: 'Trans Type', class: 'colPhone', active: true, display: true, width: "150" },
//     { index: 4, label: 'Product ID', class: 'colMobile', active: true, display: true, width: "150" },
//     { index: 5, label: 'Product Desc', class: 'colFaxNumber', active: true, display: true, width: "150" },
//     { index: 6, label: 'Cost (ex)', class: 'colARBalance text-right', active: true, display: true, width: "150" },
//     { index: 7, label: 'Tax', class: 'colAPBalance text-right', active: true, display: true, width: "150" },
//     { index: 8, label: 'Cost (inc)', class: 'colBalance text-right', active: true, display: true, width: "150" },
//     { index: 9, label: 'Tax Code', class: 'colStreet text-right', active: true, display: true, width: "150" },
//     { index: 10, label: 'Qty Ordered', class: 'colSubburb text-right', active: true, display: true, width: "150" },
//     { index: 11, label: 'Qty Received', class: 'colState text-right', active: true, display: true, width: "150" },
//     { index: 12, label: 'Qty BO', class: 'colPostcode text-right', active: true, display: true, width: "150" },
//     { index: 13, label: 'ETA Date', class: 'colCountry', active: true, display: true, width: "150" },
//     { index: 14, label: 'Order Date', class: 'colBankAccountName', active: true, display: true, width: "150" },
//     { index: 15, label: 'Received Date', class: 'colBankAccountBSB', active: true, display: true, width: "150" },
//     // { index: 16, label: 'Bank Account No', class: 'colAccountNo', active: true, display: true, width: "120" },
//     // { index: 17, label: 'Creation Date', class: 'colCreationDate', active: true, display: true, width: "110" },
//     // { index: 18, label: 'Active', class: 'colActive', active: true, display: true, width: "70" },
//     // { index: 19, label: 'Global Ref', class: 'colGlobalRef', active: false, display: true, width: "100" },
//     // { index: 20, label: 'Street2', class: 'colStreet2', active: false, display: true, width: "80" },
//     // { index: 21, label: 'Street3', class: 'colStreet3', active: false, display: true, width: "80" },
//     // { index: 22, label: 'No Staff', class: 'colNoStaff', active: false, display: true, width: "80" },
//     // { index: 23, label: 'Min Inv value', class: 'colMinInvValue', active: false, display: true, width: "110" },
//     // { index: 24, label: 'Freight to Store', class: 'colFrighttoStore', active: false, display: true, width: "120" },
//     // { index: 25, label: 'Rebate', class: 'colRebate', active: false, display: true, width: "70" },
//     // { index: 26, label: 'First Name', class: 'colFirstName', active: false, display: true, width: "90" },
//     // { index: 27, label: 'Last Name', class: 'colLastName', active: false, display: true, width: "90" },
//     // { index: 28, label: 'Contact Details', class: 'colContractDetails', active: false, display: true, width: "110" },
//     // { index: 29, label: 'ABN', class: 'colABN', active: false, display: true, width: "60" },
//     // { index: 30, label: 'Print Name', class: 'colPrintName', active: false, display: true, width: "100" },
//     // { index: 31, label: 'ClientID', class: 'colClientID', active: false, display: true, width: "80" },
//   ];
//   templateObject.suppliersummaryth.set(reset_data);
//
//   templateObject.initDate = () => {
//     Datehandler.initOneMonth();
//   };
//
//   templateObject.setDateAs = ( dateFrom = null ) => {
//     templateObject.dateAsAt.set( ( dateFrom )? moment(dateFrom).format("DD/MM/YYYY") : moment().format("DD/MM/YYYY") )
//   };
//
//
//   templateObject.setReportOptions = async function ( ignoreDate = true, formatDateFrom = new Date(),  formatDateTo = new Date() ) {
//     let defaultOptions = templateObject.reportOptions.get();
//     if (defaultOptions) {
//       defaultOptions.fromDate = formatDateFrom;
//       defaultOptions.toDate = formatDateTo;
//       defaultOptions.ignoreDate = ignoreDate;
//     } else {
//       defaultOptions = {
//         fromDate: moment().subtract(1, "months").format("YYYY-MM-DD"),
//         toDate: moment().format("YYYY-MM-DD"),
//         ignoreDate: true
//       };
//     }
//     $('.edtReportDates').attr('disabled', false)
//     if( ignoreDate == true ){
//       $('.edtReportDates').attr('disabled', true);
//       templateObject.dateAsAt.set(moment().format('DD/MM/YYYY'));
//     }
//     $("#dateFrom").val(moment(defaultOptions.fromDate).format('DD/MM/YYYY'));
//     $("#dateTo").val(moment(defaultOptions.toDate).format('DD/MM/YYYY'));
//     await templateObject.reportOptions.set(defaultOptions);
//     await templateObject.getSupplierSummaryReportData();
//   };
//
//
//   /**
//    * @deprecated since 23 septemeber 2022
//    */
//   templateObject.getSupplierReportData = async function (dateFrom, dateTo, ignoreDate = false) {
//     getVS1Data('TSupplierProduct').then(function (dataObject) {
//       if (dataObject.length == 0) {
//         templateObject.loadReport(dateFrom, dateTo, ignoreDate).then(async function (data) {
//           await addVS1Data('TSupplierProduct', JSON.stringify(data));
//           templateObject.displayReportData(data);
//         }).catch(function (err) {
//
//         });
//       } else {
//         let data = JSON.parse(dataObject[0].data);
//         templateObject.displayReportData(data);
//       }
//     }).catch(function (err) {
//       templateObject.loadReport(dateFrom, dateTo, ignoreDate).then(async function (data) {
//         await addVS1Data('TSupplierProduct', JSON.stringify(data));
//         templateObject.displayReportData(data);
//       }).catch(function (err) {
//
//       });
//     });
//   }
//   templateObject.loadReport = async (dateFrom, dateTo, ignoreDate) => {
//     LoadingOverlay.show();
//     templateObject.setDateAs(dateTo);
//     let data = await CachedHttp.get(erpObject.TSupplierProduct, async () => {
//       return await await reportService.getSupplierProductReport(dateFrom, dateTo, ignoreDate);
//     }, {
//       useIndexDb: true,
//       useLocalStorage: false,
//       validate: (cachedResponse) => {
//         return false;
//       }
//     });
//     data = data.response;
//     LoadingOverlay.hide();
//     return data;
//   }
//   templateObject.displayReportData = (data) => {
//     let reportSummary = data.tsupplierproduct.map(el => {
//       let resultobj = {};
//       Object.entries(el).map(([key, val]) => {
//         resultobj[key.split(" ").join("_").replace(/\W+/g, '')] = val;
//         return resultobj;
//       })
//       return resultobj;
//     })
//     let reportData = [];
//     if( reportSummary.length > 0 ){
//       for (const item of reportSummary ) {
//         let isExist = reportData.filter((subitem) => {
//           if( subitem.Supplier_Name == item.Supplier_Name ){
//             subitem.SubAccounts.push(item)
//             return subitem
//           }
//         });
//
//         if( isExist.length == 0 ){
//           reportData.push({
//             TotalCostEx: 0,
//             TotalCostInc: 0,
//             TotalTax: 0,
//             SubAccounts: [item],
//             ...item
//           });
//         }
//         LoadingOverlay.hide();
//       }
//     }
//     let useData = reportData.filter((item) => {
//       let TotalCostEx = 0;
//       let TotalCostInc = 0;
//       let TotalTax = 0;
//       item.SubAccounts.map((subitem) => {
//         TotalCostEx += subitem.Line_Cost_Ex;
//         TotalCostInc += subitem.Line_Cost_Inc;
//         TotalTax += subitem.Line_Tax;
//       });
//       item.TotalCostEx = TotalCostEx;
//       item.TotalCostInc = TotalCostInc;
//       item.TotalTax = TotalTax;
//       return item;
//     });
//     templateObject.records.set(useData);
//
//
//     if (templateObject.records.get()) {
//       setTimeout(function () {
//         $("td a").each(function () {
//           if ( $(this).text().indexOf("-" + Currency) >= 0 ) {
//             $(this).addClass("text-danger");
//             $(this).removeClass("fgrblue");
//           }
//         });
//         $("td").each(function () {
//           if ($(this).text().indexOf("-" + Currency) >= 0) {
//             $(this).addClass("text-danger");
//             $(this).removeClass("fgrblue");
//           }
//         });
//       }, 1000);
//     }
//   }
//
//   templateObject.initDate();
//   templateObject.getSupplierReportData(
//       GlobalFunctions.convertYearMonthDay($('#dateFrom').val()),
//       GlobalFunctions.convertYearMonthDay($('#dateTo').val()),
//       false
//   );
//   templateObject.setDateAs( GlobalFunctions.convertYearMonthDay($('#dateTo').val()) );
//
//
// });

Template.suppliersummary.events({

});

Template.suppliersummary.helpers({
  displaysettings: ()=> {
    return Template.instance().displaysettings.get()
  },

  datahandler: () => {
    let templateObject = Template.instance();
    return function (data) {
      let returnvalue = templateObject.getReportDataRecord(data);
      return returnvalue
    }
  },

  apiFunction: function() {
    return reportService.getSupplierProductReport;
  },

  listParams: function() {
    return ['limitCount', 'limitFrom', 'dateFrom', 'dateTo', 'ignoreDate']
  },

  service: function () {
    return reportService
  },

  searchFunction: function () {
    return reportService.getSupplierProductReportByKeyword;
  },
});

Template.registerHelper("equals", function (a, b) {
  return a === b;
});

Template.registerHelper("notEquals", function (a, b) {
  return a != b;
});

Template.registerHelper("containsequals", function (a, b) {
  return a.indexOf(b) >= 0;
});
