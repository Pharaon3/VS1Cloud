import {
  ReportService
} from "../report-service";
import 'jQuery.print/jQuery.print.js';
import {
  UtilityService
} from "../../utility-service";
import LoadingOverlay from "../../LoadingOverlay";
import { TaxRateService } from "../../settings/settings-service";
import GlobalFunctions from "../../GlobalFunctions";
import CachedHttp from "../../lib/global/CachedHttp";
import erpObject from "../../lib/global/erp-objects";
import FxGlobalFunctions from "../../packages/currency/FxGlobalFunctions";
import Datehandler from "../../DateHandler";
import { ReactiveVar } from "meteor/reactive-var";
import {Session} from 'meteor/session';
import { Template } from 'meteor/templating';
import './salesreport.html';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import moment from "moment";


let _ = require('lodash');
const reportService = new ReportService();
const utilityService = new UtilityService();
const taxRateService = new TaxRateService();

let defaultCurrencyCode = CountryAbbr;



Template.salesreport.onCreated(() => {
  const templateObject = Template.instance();
  templateObject.displaysettings = new ReactiveVar([]);

  FxGlobalFunctions.initVars(templateObject);
  let reset_data = [
    { index: 0, label: 'ID', class:'colLineId', active: false, display: true, width: "10", calc: false},
    { index: 1, label: 'Company', class: 'colCompany', active: true, display: true, width: "150", calc: false},
    { index: 2, label: 'Type.', class: 'colType', active: true, display: true, width: "150", calc: false},
    { index: 3, label: 'Sales No', class: 'colSalesNo', active: true, display: true, width: "150", calc: false},
    { index: 4, label: 'Sales Date', class: 'colSalesDate', active: true, display: true, width: "150", calc: false},
    { index: 5, label: 'Employee Name', class: 'colEmployeeName', active: true, display: true, width: "150", calc: false},
    { index: 6, label: 'Amount (Ex)', class: 'colAmountEx text-right', active: true, display: true, width: "150", calc: true},
    { index: 7, label: 'Total Tax', class: 'colTax text-right', active: true, display: true, width: "150", calc: true},
    { index: 8, label: 'Amount (Inc)', class: 'colAmountInc text-right', active: true, display: true, width: "150", calc: true},
    { index: 9, label: 'Balance', class: 'colBalance text-right', active: true, display: true, width: "150", calc: true},
  ]
  templateObject.displaysettings.set(reset_data);
  templateObject.getReportDataRecord = function(data) {
    var dataList = [];
    if(data!='') {
      dataList =  [
        data.CustomerName || "",
        data.Type || "",
        data.Saleno || "",
        GlobalFunctions.formatDate(data.SaleDate),
        data.employeename || "",
        data.TotalAmount || 0,
        data.TotalTax || 0,
        data.TotalAmountinc || 0,
        data.Balance || 0,
      ];
    }else {
      dataList = [
        "", "", "",  "", "", "", 0, 0, 0,
      ]
    }
    return dataList;
  }
});


// Template.salesreport.onRendered(() => {
//   const templateObject = Template.instance();
//   LoadingOverlay.show();
//
//   let reset_data = [
//     { index: 1, label: 'Company', class: 'colCustomerID', active: true, display: true, width: "150" },
//     { index: 2, label: 'Type.', class: 'colSaleDate', active: true, display: true, width: "150" },
//     { index: 3, label: 'Sales No', class: 'colInvoiceNumber', active: true, display: true, width: "150" },
//     { index: 4, label: 'Sales Date', class: 'colTransactionType', active: true, display: true, width: "150" },
//     { index: 5, label: 'Employee Name', class: 'colCustomerType', active: true, display: true, width: "150" },
//     { index: 6, label: 'Amount (Ex)', class: 'colAmountEx text-right', active: true, display: true, width: "150" },
//     { index: 7, label: 'Total Tax', class: 'colTax text-right', active: true, display: true, width: "150" },
//     { index: 8, label: 'Amount (Inc)', class: 'colAmountInc text-right', active: true, display: true, width: "150" },
//     { index: 9, label: 'Balance', class: 'colQtyShipped text-right', active: true, display: true, width: "150" },
//     // { index: 10, label: 'Qty Shipped', class: 'colUOM', active: false, display: true, width: "85" },
//     // { index: 11, label: 'Product ID', class: 'colProductID', active: false, display: true, width: "100" },
//     // { index: 12, label: 'Catagory', class: 'colCatagory', active: false, display: true, width: "85" },
//     // { index: 13, label: 'Switch', class: 'colSwitch', active: false, display: true, width: "85" },
//     // { index: 14, label: 'Dept', class: 'colDept', active: false, display: true, width: "85" },
//     // { index: 15, label: 'Description', class: 'colDescription', active: false, display: true, width: "100" },
//     // { index: 16, label: 'Employee~Name', class: 'colEmployeeName', active: false, display: true, width: "150" },
//     // { index: 17, label: 'Ship Date', class: 'colShipDate', active: false, display: true, width: "100" },
//     // { index: 18, label: 'Ex', class: 'colEx', active: false, display: true, width: "85" },
//     // { index: 19, label: 'Inc', class: 'colInc', active: false, display: true, width: "85" },
//     // { index: 20, label: 'Ex', class: 'colEx', active: false, display: true, width: "85" },
//     // { index: 21, label: 'Inc', class: 'colInc', active: false, display: true, width: "85" },
//     // { index: 22, label: 'Ex', class: 'colEx', active: false, display: true, width: "85" },
//     // { index: 23, label: 'Tax Code', class: 'colTaxCode', active: false, display: true, width: "85" },
//     // { index: 24, label: 'Line Tax', class: 'colLineTax', active: false, display: true, width: "85" },
//     // { index: 25, label: 'Ex', class: 'colEx', active: false, display: true, width: "85" },
//     // { index: 26, label: 'Inc', class: 'colInc', active: false, display: true, width: "85" },
//     // { index: 27, label: 'Discount $', class: 'colDiscountdollar', active: false, display: true, width: "100" },
//     // { index: 28, label: 'Discount %', class: 'colDiscountpercent', active: false, display: true, width: "100" },
//     // { index: 29, label: 'Percent', class: 'colPercent', active: false, display: true, width: "85" },
//     // { index: 30, label: 'Gross', class: 'colGross', active: false, display: true, width: "65" },
//     // { index: 31, label: 'Till', class: 'colTill', active: false, display: true, width: "65" },
//     // { index: 32, label: 'Area', class: 'colArea', active: false, display: true, width: "65" },
//     // { index: 33, label: 'Department Name', class: 'colDepartment', active: false, display: true, width: "150" },
//     // { index: 34, label: 'Source', class: 'colSource', active: false, display: true, width: "85" },
//     // { index: 35, label: 'Type', class: 'colType', active: false, display: true, width: "85" },
//     // { index: 36, label: 'Sale Id', class: 'colSaleID', active: false, display: true, width: "85" },
//     // { index: 37, label: 'Due Date', class: 'colDueDate', active: false, display: true, width: "85" },
//     // { index: 38, label: 'Sales Ref No', class: 'colSalesRefNo', active: false, display: true, width: "150" },
//     // { index: 39, label: 'Shipped To~ Address', class: 'colShippedToAddress', active: false, display: true, width: "150" },
//     // { index: 40, label: 'Time of Sale', class: 'colTimeofSale', active: false, display: true, width: "150" },
//     // { index: 41, label: 'Memo', class: 'colMemo', active: false, display: true, width: "85" },
//     // { index: 42, label: 'Comments', class: 'colComments', active: false, display: true, width: "85" },
//     // { index: 43, label: 'Original No', class: 'colOriginalNo', active: false, display: true, width: "100" },
//     // { index: 44, label: 'PO Number', class: 'colPONumber', active: false, display: true, width: "85" },
//     // { index: 45, label: 'Consignment~ Note', class: 'colConsignmentNote', active: false, display: true, width: "150" },
//     // { index: 46, label: 'Lines Ref No', class: 'colLinesRefNo', active: false, display: true, width: "150" },
//     // { index: 47, label: 'Preferred Supplier', class: 'colPreferredSupplier', active: false, display: true, width: "150" },
//     // { index: 48, label: 'Supplier Product code', class: 'colSupplierProductCode', active: false, display: true, width: "150" },
//     // { index: 49, label: 'POS Source', class: 'colPOSSource', active: false, display: true, width: "85" },
//     // { index: 50, label: 'Warranty Ends On', class: 'colWarrantyEnsOn', active: false, display: true, width: "150" },
//     // { index: 51, label: 'Warranty Period', class: 'colWarrantyPeriod', active: false, display: true, width: "150" },
//     // { index: 52, label: 'POS Post Code', class: 'colPOSPostCode', active: false, display: true, width: "150" },
//     // { index: 53, label: 'Line~ Ship date', class: 'colLineShipDate', active: false, display: true, width: "150" },
//     // { index: 54, label: 'Markup $', class: 'colMarkupdollar', active: false, display: true, width: "85" },
//     // { index: 55, label: 'Markup %', class: 'colMarkuppercent', active: false, display: true, width: "85" },
//     // { index: 56, label: 'Run Name', class: 'colRunName', active: false, display: true, width: "85" },
//     // { index: 57, label: 'Print Name', class: 'colPrintName', active: false, display: true, width: "85" },
//     // { index: 58, label: 'Globalref', class: 'colGlobalref', active: false, display: true, width: "85" },
//   ];
//   templateObject.salesreportth.set(reset_data);
//
//   var url = FlowRouter.current().path;
//   let currenctURL = FlowRouter.current().queryParams;
//
//   templateObject.initDate = () => {
//     Datehandler.initOneMonth();
//   };
//
//   templateObject.setDateAs = (dateFrom = null) => {
//     templateObject.dateAsAt.set((dateFrom) ? moment(dateFrom).format("DD/MM/YYYY") : moment().format("DD/MM/YYYY"))
//   };
//
//
//
//   const deptrecords = [];
//
//   templateObject.initUploadedImage = () => {
//     // let imageData = localStorage.getItem("Image");
//     let imageData;
//     getVS1Data("TVS1Image").then(function (dataObject) {
//       imageData =JSON.parse(dataObject[0]).data;
//     });
//     if (imageData) {
//       $("#uploadedImage").attr("src", imageData);
//       $("#uploadedImage").attr("width", "50%");
//     }
//   };
//
//   templateObject.getSalesReports = async (dateFrom, dateTo, ignoreDate) => {
//     LoadingOverlay.show();
//     templateObject.setDateAs(dateFrom);
//
//     let data = await CachedHttp.get(erpObject.TSalesList, async () => {
//       return await reportService.getSalesDetailsData(dateFrom, dateTo, ignoreDate);
//     }, {
//       requestParams: {
//         DateFrom: dateFrom,
//         DateTo: dateTo,
//         IgnoreDates: ignoreDate
//       },
//       useIndexDb: true,
//       useLocalStorage: false,
//       validate: (cachedResponse) => {
//         if (GlobalFunctions.isSameDay(cachedResponse.response.Params.DateFrom, dateFrom)
//           && GlobalFunctions.isSameDay(cachedResponse.response.Params.DateTo, dateTo)
//           && cachedResponse.response.Params.IgnoreDates == ignoreDate) {
//           return true;
//         }
//         return false;
//       }
//     });
//     data = data.response;
//     let totalRecord = [];
//     let grandtotalRecord = [];
//
//
//
//     if (data.tsaleslist.length) {
//       // localStorage.setItem('VS1Sales_Report', JSON.stringify(data) || '');
//       addVS1Data('TVS1Sales_Report', JSON.stringify(data) || '');
//       let records = [];
//       let allRecords = [];
//       let current = [];
//
//       let totalNetAssets = 0;
//       let GrandTotalLiability = 0;
//       let GrandTotalAsset = 0;
//       let incArr = [];
//       let cogsArr = [];
//       let expArr = [];
//       let accountData = data.tsaleslist;
//       let accountType = '';
//       let purchaseID = '';
//
//       data.tsaleslist.forEach((sale) => {
//         let recordObj = {
//           Id: sale.SaleId,
//           Company: sale.CustomerName,
//           ...sale
//         };
//
//         // recordObj.dataArr = [
//         //     '',
//         //     data.tsaleslist[i].Type,
//         //     data.tsaleslist[i].Saleno,
//         //     // moment(data.tsaleslist[i].InvoiceDate).format("DD MMM YYYY") || '-',
//         //     data.tsaleslist[i].SaleDate != '' ? moment(data.tsaleslist[i].SaleDate).format("DD/MM/YYYY") : data.tsaleslist[i].SaleDate,
//         //     data.tsaleslist[i].employeename || '-',
//         //     utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].TotalAmount) || '0.00',
//         //     utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].TotalTax) || '0.00',
//         //     utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].TotalAmountinc) || '0.00',
//         //     utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].Balance) || '0.00'
//
//         //     //
//         // ];
//
//         if ((sale.TotalAmount != 0) || (sale.TotalTax != 0) ||
//           (sale.TotalAmountinc != 0) || (sale.Balance != 0)) {
//           //records.push(recordObj);
//           if ((currenctURL.contact !== undefined) && (currenctURL.contact !== "undefined")) {
//             if (currenctURL.contact.replace(/\s/g, '') == sale.CustomerName.replace(/\s/g, '')) {
//               if ((sale.Type != "Sales Order") && (sale.Type != "Quote")) {
//                 records.push(recordObj);
//               }
//             }
//
//           } else {
//             if ((sale.Type != "Sales Order") && (sale.Type != "Quote")) {
//               records.push(recordObj);
//             }
//           }
//         }
//
//       })
//
//
//       // for (let i = 0; i < accountData.length; i++) {
//       //     // if(data.tsaleslist[i].Type == "Bill"){
//       //     //   purchaseID = data.tsaleslist[i].PurchaseOrderID;
//       //     // }
//       //     let recordObj = {};
//       //     recordObj.Id = data.tsaleslist[i].SaleId;
//       //     recordObj.type = data.tsaleslist[i].Type;
//       //     recordObj.Company = data.tsaleslist[i].CustomerName;
//       //     recordObj.dataArr = [
//       //         '',
//       //         data.tsaleslist[i].Type,
//       //         data.tsaleslist[i].Saleno,
//       //         // moment(data.tsaleslist[i].InvoiceDate).format("DD MMM YYYY") || '-',
//       //         data.tsaleslist[i].SaleDate != '' ? moment(data.tsaleslist[i].SaleDate).format("DD/MM/YYYY") : data.tsaleslist[i].SaleDate,
//       //         data.tsaleslist[i].employeename || '-',
//       //         utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].TotalAmount) || '0.00',
//       //         utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].TotalTax) || '0.00',
//       //         utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].TotalAmountinc) || '0.00',
//       //         utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].Balance) || '0.00'
//
//       //         //
//       //     ];
//
//       //     if ((data.tsaleslist[i].TotalAmount != 0) || (data.tsaleslist[i].TotalTax != 0) ||
//       //         (data.tsaleslist[i].TotalAmountinc != 0) || (data.tsaleslist[i].Balance != 0)) {
//       //         //records.push(recordObj);
//       //         if ((currenctURL.contact !== undefined) && (currenctURL.contact !== "undefined")) {
//       //             if (currenctURL.contact.replace(/\s/g, '') == data.tsaleslist[i].CustomerName.replace(/\s/g, '')) {
//       //                 if ((data.tsaleslist[i].Type != "Sales Order") && (data.tsaleslist[i].Type != "Quote")) {
//       //                     records.push(recordObj);
//       //                 }
//       //             }
//
//       //         } else {
//       //             if ((data.tsaleslist[i].Type != "Sales Order") && (data.tsaleslist[i].Type != "Quote")) {
//       //                 records.push(recordObj);
//       //             }
//       //         }
//       //     }
//
//       // }
//
//       records = _.sortBy(records, 'Company');
//       records = _.groupBy(records, 'Company');
//
//
//
//
//       const calculateTotal = (entries) => {
//         let totalAmountEx = 0;
//         let totalTax = 0;
//         let amountInc = 0;
//         let balance = 0;
//         let twoMonth = 0;
//         let threeMonth = 0;
//         let Older = 0;
//
//         entries.forEach((entry) => {
//           totalAmountEx = totalAmountEx + parseFloat(entry.TotalAmount);
//           totalTax = totalTax + parseFloat(entry.TotalTax);
//           amountInc = amountInc + parseFloat(entry.TotalAmountinc);
//           balance = balance + parseFloat(entry.Balance);
//
//         });
//
//         return {
//           AmountEx: totalAmountEx,
//           Tax: totalTax,
//           AmountInc: amountInc,
//           Balance: balance
//         }
//
//       }
//
//
//       const calcTotalsRecord = (records) => {
//         //grandtotalRecord
//         let grandamountduetotal = 0;
//         let grandtotalAmountEx = 0;
//         let grandtotalTax = 0;
//         let grandamountInc = 0;
//         let grandbalance = 0;
//
//         records.forEach((record) => {
//           const grandcurrencyLength = Currency.length;
//
//           grandtotalAmountEx = grandtotalAmountEx + parseFloat(record.total.AmountEx);
//           grandtotalTax = grandtotalTax + parseFloat(record.total.Tax);
//           grandamountInc = grandamountInc + parseFloat(record.total.AmountInc);
//           grandbalance = grandbalance + parseFloat(record.total.Balance);
//
//         });
//
//         return {
//           AmountEx: grandtotalAmountEx,
//           Tax: grandtotalTax,
//           AmountInc: grandamountInc,
//           Balance: grandbalance
//         }
//
//       }
//
//
//       for (let key in records) {
//         allRecords.push({
//           title: key,
//           entries: records[key],
//           total: calculateTotal(records[key])
//         });
//       }
//
//       // let iterator = 0;
//       // for (let i = 0; i < allRecords.length; i++) {
//       //     let totalAmountEx = 0;
//       //     let totalTax = 0;
//       //     let amountInc = 0;
//       //     let balance = 0;
//       //     let twoMonth = 0;
//       //     let threeMonth = 0;
//       //     let Older = 0;
//       //     const currencyLength = Currency.length;
//       //     for (let k = 0; k < allRecords[i][1].data.length; k++) {
//       //         totalAmountEx = totalAmountEx + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[5]);
//       //         totalTax = totalTax + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[6]);
//       //         amountInc = amountInc + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[7]);
//       //         balance = balance + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[8]);
//
//       //     }
//       //     let val = ['Total ' + allRecords[i][0].key + '', '', '', '', '',
//       //         utilityService.modifynegativeCurrencyFormat(totalAmountEx), utilityService.modifynegativeCurrencyFormat(totalTax), utilityService.modifynegativeCurrencyFormat(amountInc), utilityService.modifynegativeCurrencyFormat(balance)
//       //     ];
//       //     current.push(val);
//
//       // }
//
//       // for (let n = 0; n < current.length; n++) {
//
//       //     const grandcurrencyLength = Currency.length;
//
//       //     grandtotalAmountEx = grandtotalAmountEx + utilityService.convertSubstringParseFloat(current[n][5]);
//       //     grandtotalTax = grandtotalTax + utilityService.convertSubstringParseFloat(current[n][6]);
//       //     grandamountInc = grandamountInc + utilityService.convertSubstringParseFloat(current[n][7]);
//       //     grandbalance = grandbalance + utilityService.convertSubstringParseFloat(current[n][8]);
//
//       // }
//
//       // let grandval = ['Grand Total ' + '', '', '', '', '',
//       //     utilityService.modifynegativeCurrencyFormat(grandtotalAmountEx),
//       //     utilityService.modifynegativeCurrencyFormat(grandtotalTax),
//       //     utilityService.modifynegativeCurrencyFormat(grandamountInc),
//       //     utilityService.modifynegativeCurrencyFormat(grandbalance)
//       // ];
//
//       // for (let key in records) {
//       //     let dataArr = current[iterator]
//       //     let obj = [{
//       //         key: key
//       //     }, {
//       //         data: records[key]
//       //     }, {
//       //         total: [{
//       //             dataArr: dataArr
//       //         }]
//       //     }];
//       //     totalRecord.push(obj);
//       //     iterator += 1;
//       // }
//
//       let grandval = calcTotalsRecord(allRecords);
//
//       // We should show only totals
//       templateObject.records.set(allRecords);
//       templateObject.grandrecords.set(grandval);
//
//       if (templateObject.records.get()) {
//         setTimeout(function () {
//           $('td a').each(function () {
//             if ($(this).text().indexOf('-' + Currency) >= 0)
//               $(this).addClass('text-danger')
//           });
//           $('td').each(function () {
//             if ($(this).text().indexOf('-' + Currency) >= 0)
//               $(this).addClass('text-danger')
//           });
//
//           $('td').each(function () {
//
//             let lineValue = $(this).first().text()[0];
//             if (lineValue != undefined) {
//               if (lineValue.indexOf(Currency) >= 0)
//                 $(this).addClass('text-right')
//             }
//
//           });
//
//           $('td').each(function () {
//             if ($(this).first().text().indexOf('-' + Currency) >= 0)
//               $(this).addClass('text-right')
//           });
//
//           LoadingOverlay.hide();
//         }, 100);
//       }
//
//     }
//
//     LoadingOverlay.hide();
//   };
//
//
//   templateObject.getDepartments = function () {
//     reportService.getDepartment().then(function (data) {
//       for (let i in data.tdeptclass) {
//
//         let deptrecordObj = {
//           id: data.tdeptclass[i].Id || ' ',
//           department: data.tdeptclass[i].DeptClassName || ' ',
//         };
//
//         deptrecords.push(deptrecordObj);
//         templateObject.deptrecords.set(deptrecords);
//
//       }
//     });
//
//   }
//
//   templateObject.initDate();
//   templateObject.initUploadedImage();
//   // templateObject.getAllProductData();
//   templateObject.getDepartments();
//
//   if (url.indexOf("?dateFrom") > 0) {
//     url = new URL(window.location.href);
//     var getDateFrom = url.searchParams.get("dateFrom");
//     var getLoadDate = url.searchParams.get("dateTo");
//     if( typeof getDateFrom === undefined || getDateFrom == "" || getDateFrom === null){
//       let currentUrl = FlowRouter.current().queryParams;
//       getDateFrom = currentUrl.dateFrom
//       getLoadDate = currentUrl.dateTo
//     }
//     $("#dateFrom").datepicker('setDate', moment(getDateFrom).format('DD/MM/YYYY'));
//     $("#dateTo").datepicker('setDate', moment(getLoadDate).format('DD/MM/YYYY'));
//   }
//
//   templateObject.getSalesReports(
//     GlobalFunctions.convertYearMonthDay($('#dateFrom').val()),
//     GlobalFunctions.convertYearMonthDay($('#dateTo').val()),
//     false);
//   templateObject.setDateAs(GlobalFunctions.convertYearMonthDay($('#dateFrom').val()))
//   LoadingOverlay.hide();
// });

Template.salesreport.events({

});
Template.salesreport.helpers({
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
    return reportService.getSalesDetailsData;
  },

  listParams: function() {
    return ['limitCount', 'limitFrom', 'dateFrom', 'dateTo', 'ignoreDate']
  },

  service: function () {
    return reportService
  },

  searchFunction: function () {
    return reportService.getSalesDetailsDataByKeyword;
  },
});
Template.registerHelper('equals', function (a, b) {
  return a === b;
});

Template.registerHelper('notEquals', function (a, b) {
  return a != b;
});

Template.registerHelper('containsequals', function (a, b) {
  return (a.indexOf(b) >= 0);
});

