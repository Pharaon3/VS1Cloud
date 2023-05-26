import { ReportService } from "../report-service";
import 'jQuery.print/jQuery.print.js';
import { UtilityService } from "../../utility-service";
import { TaxRateService } from "../../settings/settings-service";
import GlobalFunctions from "../../GlobalFunctions";
import LoadingOverlay from "../../LoadingOverlay";
import CachedHttp from "../../lib/global/CachedHttp";
import FxGlobalFunctions from "../../packages/currency/FxGlobalFunctions";
import Datehandler from "../../DateHandler";
import { ReactiveVar } from "meteor/reactive-var";
import {Session} from 'meteor/session';
import { Template } from 'meteor/templating';
import './productsalesreport.html';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import moment from "moment";

let _ = require('lodash');

const reportService = new ReportService();
const utilityService = new UtilityService();
const taxRateService = new TaxRateService();
let defaultCurrencyCode = CountryAbbr;

const currentDate = new Date();

Template.productsalesreport.onCreated(() => {
  const templateObject = Template.instance();
  templateObject.displaysettings = new ReactiveVar([]);

  FxGlobalFunctions.initVars(templateObject);
  let reset_data = [
    { index: 0, label: 'ID', class:'colLineId', active: false, display: true, width: "10", calc: false},
    { index: 1, label: 'Product Name', class: 'colDocNumber', active: true, display: true, width: "130" },
    { index: 2, label: 'Trans Type', class: 'colTransactionType', active: true, display: true, width: "100" },
    { index: 3, label: 'Trans No', class: 'colShipDate', active: true, display: true, width: "85" },
    { index: 4, label: 'Sales Date', class: 'colCustomerID', active: true, display: true, width: "100" },
    { index: 5, label: 'Customer', class: 'colContractName', active: true, display: true, width: "100" },
    { index: 6, label: 'Qty', class: 'colAddress1 text-right', active: true, display: true, width: "85" },
    { index: 7, label: 'Line Cost', class: 'colAddress2 text-right', active: true, display: true, width: "85" },
    { index: 8, label: 'Total Amount', class: 'colAddress3 text-right', active: true, display: true, width: "85" },
    { index: 9, label: 'Total Profit', class: 'colShipToCity text-right', active: true, display: true, width: "100" },
  ]
  templateObject.displaysettings.set(reset_data);
  templateObject.getReportDataRecord = function(data) {
    var dataList = [];
    if(data!='') {
      dataList =  [
        data.ProductName || "",
        data.TransactionType || "",
        data.InvoiceNo || "",
        GlobalFunctions.formatDate(data.SaleDate),
        data.CustomerName || "",
        data.Qty || 0,
        data["Line Cost (Ex)"] || 0,
        data["Total Amount (Ex)"] || 0,
        data["Total Profit (Ex)"] || 0,
      ];
    }else {
      dataList = [
        "", "", "", "", "", "", 0, 0, 0,
      ]
    }
    return dataList;
  }
});
Template.productsalesreport.onRendered(() => {});

// Template.productsalesreport.onRendered(() => {
//   LoadingOverlay.show();
//   const templateObject = Template.instance();
//
//
//   let reset_data = [
//     { index: 1, label: 'Product Name', class: 'colDocNumber', active: true, display: true, width: "130" },
//     { index: 2, label: 'Trans Type', class: 'colTransactionType', active: true, display: true, width: "100" },
//     { index: 3, label: 'Trans No', class: 'colShipDate', active: true, display: true, width: "85" },
//     { index: 4, label: 'Sales Date', class: 'colCustomerID', active: true, display: true, width: "100" },
//     { index: 5, label: 'Customer', class: 'colContractName', active: true, display: true, width: "100" },
//     { index: 6, label: 'Qty', class: 'colAddress1 text-right', active: true, display: true, width: "85" },
//     { index: 7, label: 'Line Cost', class: 'colAddress2 text-right', active: true, display: true, width: "85" },
//     { index: 8, label: 'Total Amount', class: 'colAddress3 text-right', active: true, display: true, width: "85" },
//     { index: 9, label: 'Total Profit', class: 'colShipToCity text-right', active: true, display: true, width: "100" },
//     { index: 10, label: 'State', class: 'colState', active: false, display: true, width: "100" },
//     { index: 11, label: 'Zip Code', class: 'colZipCode', active: false, display: true, width: "100" },
//     { index: 12, label: 'Email', class: 'colEmail', active: false, display: true, width: "100" },
//     { index: 13, label: 'Phone', class: 'colPhone', active: false, display: true, width: "100" },
//     { index: 14, label: 'Sales~Status', class: 'colSalesStatus', active: false, display: true, width: "100" },
//     { index: 15, label: 'Rush Order', class: 'colRushOrder', active: false, display: true, width: "100" },
//     { index: 16, label: 'Product ID', class: 'colProductID', active: false, display: true, width: "100" },
//     { index: 17, label: 'Barcode', class: 'colBarcode', active: false, display: true, width: "100" },
//     { index: 18, label: 'Unit of~Measure', class: 'colUnitofMeasure', active: false, display: true, width: "100" },
//     { index: 19, label: 'Ordered', class: 'colOrdered', active: false, display: true, width: "100" },
//     { index: 20, label: 'Shipped', class: 'colShipped', active: false, display: true, width: "100" },
//     { index: 21, label: 'Special~Instruction', class: 'colSpecialInstruction', active: false, display: true, width: "100" },
//     { index: 22, label: 'SaleID', class: 'colSaleID', active: false, display: true, width: "100" },
//     { index: 23, label: 'Comments', class: 'colComments', active: false, display: true, width: "100" },
//   ];
//   templateObject.productsalesreportth.set(reset_data);
//
//   templateObject.initDate = () => {
//     Datehandler.initOneMonth();
//   };
//
//   templateObject.setDateAs = (dateFrom = null) => {
//     templateObject.dateAsAt.set((dateFrom) ? moment(dateFrom).format("DD/MM/YYYY") : moment().format("DD/MM/YYYY"))
//   };
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
//
//   templateObject.loadReport = async (dateFrom = null, dateTo = null, ignoreDate = false) => {
//     LoadingOverlay.show();
//     const _data = await CachedHttp.get("TProductSalesDetailsReport", async () => {
//       return await reportService.getAllProductSalesDetails(dateFrom, dateTo, ignoreDate);
//     }, {
//       useIndexDb: true,
//       useLocalStorage: false,
//       requestParams: {
//         DateFrom: dateFrom,
//         DateTo: dateTo,
//         IgnoreDates: ignoreDate
//       },
//       validate: cachedResponse => {
//         if (GlobalFunctions.isSameDay(cachedResponse.response.Params.DateFrom, dateFrom)
//           && GlobalFunctions.isSameDay(cachedResponse.response.Params.DateTo, dateTo)
//           && cachedResponse.response.Params.IgnoreDates == ignoreDate) {
//           return true;
//         }
//         return false;
//       }
//     });
//     const data = _data.response;
//
//     if (data.tproductsalesdetailsreport.length) {
//       // localStorage.setItem("VS1ProductSales_Report", JSON.stringify(data) || "");
//       let records = [];
//       let allRecords = [];
//
//       let accountData = data.tproductsalesdetailsreport;
//
//       accountData.forEach(account => {
//         let recordObj = {
//           Id: account.TransactionNo,
//           type: account.TransactionType,
//           Company: account.ProductName,
//           entries: account
//         };
//
//         if (account.TransactionType != "Sales Order" && account.TransactionType != "Quote") {
//           records.push(recordObj);
//         }
//       });
//
//       records = _.sortBy(records, "Company");
//       records = _.groupBy(records, "Company");
//
//       /**
//            * This will calculate total of a record
//            * @param {Array} entries
//            * @param {string} title
//            * @returns
//            */
//       const calculateRecordTotal = (entries = [], title) => {
//         let totalAmountEx = 0;
//         let totalTax = 0;
//         let amountInc = 0;
//         let balance = 0;
//         let twoMonth = 0;
//         let threeMonth = 0;
//         let Older = 0;
//         let totalQty = 0;
//         const currencyLength = Currency.length;
//
//         entries.forEach(entry => {
//           entry.entries.LineCostEx = entry.entries["Line Cost (Ex)"];
//           entry.entries.TotalAmountEx = entry.entries["Total Amount (Ex)"];
//           entry.entries.TotalProfitEx = entry.entries["Total Profit (Ex)"];
//
//           totalQty = totalQty + entry.entries.Qty;
//           totalTax = totalTax + parseFloat(entry.entries["Line Cost (Ex)"]);
//           amountInc = amountInc + parseFloat(entry.entries["Total Amount (Ex)"]);
//           balance = balance + parseFloat(entry.entries["Total Profit (Ex)"]);
//         });
//
//         return {
//           title: "Total " + title,
//           Qty: totalQty,
//           Tax: totalTax,
//           AmountInc: amountInc,
//           Balance: balance
//         };
//       };
//
//       for (let key in records) {
//         allRecords.push({
//           title: key,
//           entries: records[key],
//           total: calculateRecordTotal(records[key], key)
//         });
//       }
//
//       /**
//            * This will calculate grand total
//            * @param {array} records
//            * @returns
//            */
//       const calculateGrandAmount = (records = []) => {
//         //grandtotalRecord
//         let grandamountduetotal = 0;
//         let grandtotalAmountEx = 0;
//         let grandtotalTax = 0;
//         let grandamountInc = 0;
//         let grandbalance = 0;
//         let grandtotalqty = 0;
//
//         records.forEach(record => {
//           const grandcurrencyLength = Currency.length;
//
//           grandtotalqty = grandtotalqty + Number(record.total.Qty) || 0;
//           // grandtotalAmountEx = grandtotalAmountEx + parseFloat(current[n][5]);
//           grandtotalTax = grandtotalTax + parseFloat(record.total.Tax);
//           grandamountInc = grandamountInc + parseFloat(record.total.AmountInc);
//           grandbalance = grandbalance + parseFloat(record.total.Balance);
//         });
//
//         let grandVal = {
//           title: "Grand Total ",
//           Qty: grandtotalqty,
//           Tax: grandtotalTax,
//           AmountInc: grandamountInc,
//           Balance: grandbalance
//         };
//         return grandVal;
//       };
//
//       const globalTotal = calculateGrandAmount(allRecords);
//
//       templateObject.records.set(allRecords);
//       templateObject.grandRecords.set(globalTotal);
//
//       if (templateObject.records.get()) {
//         setTimeout(function () {
//           $("td a").each(function () {
//             if ($(this).text().indexOf("-" + Currency) >= 0)
//               $(this).addClass("text-danger");
//           }
//           );
//           $("td").each(function () {
//             if ($(this).text().indexOf("-" + Currency) >= 0)
//               $(this).addClass("text-danger");
//           }
//           );
//
//           $("td").each(function () {
//             let lineValue = $(this).first().text()[0];
//             if (lineValue != undefined) {
//               if (lineValue.indexOf(Currency) >= 0)
//                 $(this).addClass("text-right");
//             }
//           });
//
//           $("td").each(function () {
//             if ($(this).first().text().indexOf("-" + Currency) >= 0)
//               $(this).addClass("text-right");
//           }
//           );
//
//           $("td:nth-child(7)").each(function () {
//             $(this).addClass("text-right");
//           });
//
//           LoadingOverlay.hide();
//         }, 100);
//       }
//     }
//
//     LoadingOverlay.hide();
//   };
//
//
//   templateObject.getSalesReports = function (dateFrom, dateTo, ignoreDate) {
//     LoadingOverlay.show();
//     templateObject.records.set('');
//     templateObject.grandRecords.set('');
//     if (!localStorage.getItem('VS1ProductSales_Report')) {
//       reportService.getAllProductSalesDetails(dateFrom, dateTo, ignoreDate).then(function (data) {
//         let totalRecord = [];
//         let grandtotalRecord = [];
//
//         if (data.tproductsalesdetailsreport.length) {
//           localStorage.setItem('VS1ProductSales_Report', JSON.stringify(data) || '');
//           let records = [];
//           let allRecords = [];
//           let current = [];
//
//           let totalNetAssets = 0;
//           let GrandTotalLiability = 0;
//           let GrandTotalAsset = 0;
//           let incArr = [];
//           let cogsArr = [];
//           let expArr = [];
//           let accountData = data.tproductsalesdetailsreport;
//           let accountType = '';
//           let purchaseID = '';
//           for (let i = 0; i < accountData.length; i++) {
//             // if(data.tproductsalesdetailsreport[i].Type == "Bill"){
//             //   purchaseID = data.tproductsalesdetailsreport[i].PurchaseOrderID;
//             // }
//             let recordObj = {};
//             recordObj.Id = data.tproductsalesdetailsreport[i].TransactionNo;
//             recordObj.type = data.tproductsalesdetailsreport[i].TransactionType;
//             recordObj.Company = data.tproductsalesdetailsreport[i].ProductName;
//             recordObj.dataArr = [
//               '',
//               data.tproductsalesdetailsreport[i].TransactionType,
//               data.tproductsalesdetailsreport[i].TransactionNo,
//               // moment(data.tproductsalesdetailsreport[i].InvoiceDate).format("DD MMM YYYY") || '-',
//               data.tproductsalesdetailsreport[i].SaleDate != '' ? moment(data.tproductsalesdetailsreport[i].SaleDate).format("DD/MM/YYYY") : data.tproductsalesdetailsreport[i].SaleDate,
//               data.tproductsalesdetailsreport[i].CustomerName || '-',
//               data.tproductsalesdetailsreport[i].Qty || 0,
//               utilityService.modifynegativeCurrencyFormat(data.tproductsalesdetailsreport[i]['Line Cost (Ex)']) || '0.00',
//               utilityService.modifynegativeCurrencyFormat(data.tproductsalesdetailsreport[i]['Total Amount (Ex)']) || '0.00',
//               utilityService.modifynegativeCurrencyFormat(data.tproductsalesdetailsreport[i]['Total Profit (Ex)']) || '0.00'
//
//
//               //
//             ];
//
//             // if((data.tproductsalesdetailsreport[i].TotalAmount != 0) || (data.tproductsalesdetailsreport[i].TotalTax != 0)
//             // || (data.tproductsalesdetailsreport[i].TotalAmountinc != 0) || (data.tproductsalesdetailsreport[i].Balance != 0)){
//             //
//             // }
//             if ((data.tproductsalesdetailsreport[i].TransactionType != "Sales Order") && (data.tproductsalesdetailsreport[i].TransactionType != "Quote")) {
//               records.push(recordObj);
//             }
//
//
//
//
//           }
//
//
//           records = _.sortBy(records, 'Company');
//           records = _.groupBy(records, 'Company');
//           for (let key in records) {
//             let obj = [{ key: key }, { data: records[key] }];
//             allRecords.push(obj);
//           }
//
//           let iterator = 0;
//           for (let i = 0; i < allRecords.length; i++) {
//             let totalAmountEx = 0;
//             let totalTax = 0;
//             let amountInc = 0;
//             let balance = 0;
//             let twoMonth = 0;
//             let threeMonth = 0;
//             let Older = 0;
//             let totalQty = 0;
//             const currencyLength = Currency.length;
//             for (let k = 0; k < allRecords[i][1].data.length; k++) {
//
//               // totalAmountEx = totalAmountEx + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[5]);
//               totalQty = totalQty + allRecords[i][1].data[k].dataArr[5];
//               totalTax = totalTax + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[6]);
//               amountInc = amountInc + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[7]);
//               balance = balance + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[8]);
//
//             }
//
//             let val = ['Total ' + allRecords[i][0].key + '', '', '', '', '', '' + totalQty + '',
//             utilityService.modifynegativeCurrencyFormat(totalTax), utilityService.modifynegativeCurrencyFormat(amountInc), utilityService.modifynegativeCurrencyFormat(balance)];
//             current.push(val);
//
//           }
//
//           //grandtotalRecord
//           let grandamountduetotal = 0;
//           let grandtotalAmountEx = 0;
//           let grandtotalTax = 0;
//           let grandamountInc = 0;
//           let grandbalance = 0;
//           let grandtotalqty = 0;
//
//           for (let n = 0; n < current.length; n++) {
//
//             const grandcurrencyLength = Currency.length;
//
//             grandtotalqty = grandtotalqty + Number(current[n][5].replace(/[^0-9.-]+/g, "")) || 0;
//
//             // grandtotalAmountEx = grandtotalAmountEx + utilityService.convertSubstringParseFloat(current[n][5]);
//             grandtotalTax = grandtotalTax + utilityService.convertSubstringParseFloat(current[n][6]);
//             grandamountInc = grandamountInc + utilityService.convertSubstringParseFloat(current[n][7]);
//             grandbalance = grandbalance + utilityService.convertSubstringParseFloat(current[n][8]);
//
//
//           }
//
//
//           let grandval = ['Grand Total ' + '', '', '', '', '', '' + grandtotalqty + '',
//           //utilityService.modifynegativeCurrencyFormat(grandtotalAmountEx),
//           utilityService.modifynegativeCurrencyFormat(grandtotalTax),
//           utilityService.modifynegativeCurrencyFormat(grandamountInc),
//           utilityService.modifynegativeCurrencyFormat(grandbalance)];
//
//
//           for (let key in records) {
//             let dataArr = current[iterator]
//             let obj = [{ key: key }, { data: records[key] }, { total: [{ dataArr: dataArr }] }];
//             totalRecord.push(obj);
//             iterator += 1;
//           }
//
//           templateObject.records.set(totalRecord);
//           templateObject.grandRecords.set(grandval);
//
//
//           if (templateObject.records.get()) {
//             setTimeout(function () {
//               $('td a').each(function () {
//                 if ($(this).text().indexOf('-' + Currency) >= 0) $(this).addClass('text-danger')
//               });
//               $('td').each(function () {
//                 if ($(this).text().indexOf('-' + Currency) >= 0) $(this).addClass('text-danger')
//               });
//
//               $('td').each(function () {
//
//                 let lineValue = $(this).first().text()[0];
//                 if (lineValue != undefined) {
//                   if (lineValue.indexOf(Currency) >= 0) $(this).addClass('text-right')
//                 }
//
//               });
//
//               $('td').each(function () {
//                 if ($(this).first().text().indexOf('-' + Currency) >= 0) $(this).addClass('text-right')
//               });
//
//               $('td:nth-child(7)').each(function () {
//                 $(this).addClass('text-right');
//               });
//
//
//               $('.fullScreenSpin').css('display', 'none');
//             }, 100);
//           }
//
//         } else {
//           let records = [];
//           let recordObj = {};
//           recordObj.Id = '';
//           recordObj.type = '';
//           recordObj.SupplierName = ' ';
//           recordObj.dataArr = [
//             '-',
//             '-',
//             '-',
//             '-',
//             '-',
//             '-',
//             '-',
//             '-',
//             '-',
//             '-'
//           ];
//
//           records.push(recordObj);
//           templateObject.records.set(records);
//           templateObject.grandRecords.set('');
//           $('.fullScreenSpin').css('display', 'none');
//         }
//
//       }).catch(function (err) {
//         //Bert.alert('<strong>' + err + '</strong>!', 'danger');
//         $('.fullScreenSpin').css('display', 'none');
//       });
//     } else {
//       let data = JSON.parse(localStorage.getItem('VS1ProductSales_Report'));
//       let totalRecord = [];
//       let grandtotalRecord = [];
//       if (data.tproductsalesdetailsreport.length) {
//         let records = [];
//         let allRecords = [];
//         let current = [];
//
//         let totalNetAssets = 0;
//         let GrandTotalLiability = 0;
//         let GrandTotalAsset = 0;
//         let incArr = [];
//         let cogsArr = [];
//         let expArr = [];
//         let accountData = data.tproductsalesdetailsreport;
//         let accountType = '';
//         let purchaseID = '';
//         for (let i = 0; i < accountData.length; i++) {
//           // if(data.tproductsalesdetailsreport[i].Type == "Bill"){
//           //   purchaseID = data.tproductsalesdetailsreport[i].PurchaseOrderID;
//           // }
//           let recordObj = {};
//           recordObj.Id = data.tproductsalesdetailsreport[i].TransactionNo;
//           recordObj.type = data.tproductsalesdetailsreport[i].TransactionType;
//           recordObj.Company = data.tproductsalesdetailsreport[i].ProductName;
//           recordObj.dataArr = [
//             '',
//             data.tproductsalesdetailsreport[i].TransactionType,
//             data.tproductsalesdetailsreport[i].TransactionNo,
//             // moment(data.tproductsalesdetailsreport[i].InvoiceDate).format("DD MMM YYYY") || '-',
//             data.tproductsalesdetailsreport[i].SaleDate != '' ? moment(data.tproductsalesdetailsreport[i].SaleDate).format("DD/MM/YYYY") : data.tproductsalesdetailsreport[i].SaleDate,
//             data.tproductsalesdetailsreport[i].CustomerName || '-',
//             data.tproductsalesdetailsreport[i].Qty || 0,
//             utilityService.modifynegativeCurrencyFormat(data.tproductsalesdetailsreport[i]['Line Cost (Ex)']) || '0.00',
//             utilityService.modifynegativeCurrencyFormat(data.tproductsalesdetailsreport[i]['Total Amount (Ex)']) || '0.00',
//             utilityService.modifynegativeCurrencyFormat(data.tproductsalesdetailsreport[i]['Total Profit (Ex)']) || '0.00'
//
//
//             //
//           ];
//
//           // if((data.tproductsalesdetailsreport[i].TotalAmount != 0) || (data.tproductsalesdetailsreport[i].TotalTax != 0)
//           // || (data.tproductsalesdetailsreport[i].TotalAmountinc != 0) || (data.tproductsalesdetailsreport[i].Balance != 0)){
//           //
//           // }
//           if ((data.tproductsalesdetailsreport[i].TransactionType != "Sales Order") && (data.tproductsalesdetailsreport[i].TransactionType != "Quote")) {
//             records.push(recordObj);
//           }
//
//
//
//
//         }
//
//
//         records = _.sortBy(records, 'Company');
//         records = _.groupBy(records, 'Company');
//         for (let key in records) {
//           let obj = [{ key: key }, { data: records[key] }];
//           allRecords.push(obj);
//         }
//
//         let iterator = 0;
//         for (let i = 0; i < allRecords.length; i++) {
//           let totalAmountEx = 0;
//           let totalTax = 0;
//           let amountInc = 0;
//           let balance = 0;
//           let twoMonth = 0;
//           let threeMonth = 0;
//           let Older = 0;
//           let totalQty = 0;
//           const currencyLength = Currency.length;
//           for (let k = 0; k < allRecords[i][1].data.length; k++) {
//
//             // totalAmountEx = totalAmountEx + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[5]);
//             totalQty = totalQty + allRecords[i][1].data[k].dataArr[5];
//             totalTax = totalTax + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[6]);
//             amountInc = amountInc + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[7]);
//             balance = balance + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[8]);
//
//           }
//
//           let val = ['Total ' + allRecords[i][0].key + '', '', '', '', '', '' + totalQty + '',
//           utilityService.modifynegativeCurrencyFormat(totalTax), utilityService.modifynegativeCurrencyFormat(amountInc), utilityService.modifynegativeCurrencyFormat(balance)];
//           current.push(val);
//
//         }
//
//         //grandtotalRecord
//         let grandamountduetotal = 0;
//         let grandtotalAmountEx = 0;
//         let grandtotalTax = 0;
//         let grandamountInc = 0;
//         let grandbalance = 0;
//         let grandtotalqty = 0;
//
//         for (let n = 0; n < current.length; n++) {
//
//           const grandcurrencyLength = Currency.length;
//
//           grandtotalqty = grandtotalqty + Number(current[n][5].replace(/[^0-9.-]+/g, "")) || 0;
//
//           // grandtotalAmountEx = grandtotalAmountEx + utilityService.convertSubstringParseFloat(current[n][5]);
//           grandtotalTax = grandtotalTax + utilityService.convertSubstringParseFloat(current[n][6]);
//           grandamountInc = grandamountInc + utilityService.convertSubstringParseFloat(current[n][7]);
//           grandbalance = grandbalance + utilityService.convertSubstringParseFloat(current[n][8]);
//
//
//         }
//
//
//         let grandval = ['Grand Total ' + '', '', '', '', '',  grandtotalqty,
//         //utilityService.modifynegativeCurrencyFormat(grandtotalAmountEx),
//         utilityService.modifynegativeCurrencyFormat(grandtotalTax),
//         utilityService.modifynegativeCurrencyFormat(grandamountInc),
//         utilityService.modifynegativeCurrencyFormat(grandbalance)];
//
//
//         for (let key in records) {
//           let dataArr = current[iterator]
//           let obj = [{ key: key }, { data: records[key] }, { total: [{ dataArr: dataArr }] }];
//           totalRecord.push(obj);
//           iterator += 1;
//         }
//
//         templateObject.records.set(totalRecord);
//         templateObject.grandRecords.set(grandval);
//
//
//         if (templateObject.records.get()) {
//           setTimeout(function () {
//             $('td a').each(function () {
//               if ($(this).text().indexOf('-' + Currency) >= 0) $(this).addClass('text-danger')
//             });
//             $('td').each(function () {
//               if ($(this).text().indexOf('-' + Currency) >= 0) $(this).addClass('text-danger')
//             });
//
//             $('td').each(function () {
//
//               let lineValue = $(this).first().text()[0];
//               if (lineValue != undefined) {
//                 if (lineValue.indexOf(Currency) >= 0) $(this).addClass('text-right')
//               }
//
//             });
//
//             $('td').each(function () {
//               if ($(this).first().text().indexOf('-' + Currency) >= 0) $(this).addClass('text-right')
//             });
//
//             $('td:nth-child(7)').each(function () {
//               $(this).addClass('text-right');
//             });
//
//
//             $('.fullScreenSpin').css('display', 'none');
//           }, 100);
//         }
//
//       } else {
//         let records = [];
//         let recordObj = {};
//         recordObj.Id = '';
//         recordObj.type = '';
//         recordObj.SupplierName = ' ';
//         recordObj.dataArr = [
//           '-',
//           '-',
//           '-',
//           '-',
//           '-',
//           '-',
//           '-',
//           '-',
//           '-',
//           '-'
//         ];
//
//         records.push(recordObj);
//         templateObject.records.set(records);
//
//         templateObject.grandRecords.set('');
//         $('.fullScreenSpin').css('display', 'none');
//       }
//
//     }
//   };
//
//
//
//   templateObject.getDepartments = function () {
//     reportService.getDepartment().then(function (data) {
//       let deptrecords = [];
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
//
//     });
//
//   }
//   // templateObject.getAllProductData();
//
//
//   templateObject.initDate();
//   templateObject.getDepartments();
//   templateObject.initUploadedImage();
//   templateObject.loadReport(
//     GlobalFunctions.convertYearMonthDay($('#dateFrom').val()),
//     GlobalFunctions.convertYearMonthDay($('#dateTo').val()),
//     false);
//   templateObject.setDateAs(GlobalFunctions.convertYearMonthDay($('#dateFrom').val()))
//   LoadingOverlay.hide();
// });

Template.productsalesreport.events({

});
Template.productsalesreport.helpers({
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
    return reportService.getAllProductSalesDetails;
  },

  listParams: function() {
    return ['limitCount', 'limitFrom', 'dateFrom', 'dateTo', 'ignoreDate']
  },

  service: function () {
    return reportService
  },

  searchFunction: function () {
    return reportService.getAllProductSalesDetailsByKeyword;
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


