import { ReportService } from "../report-service";
import 'jQuery.print/jQuery.print.js';
import { UtilityService } from "../../utility-service";
import { TaxRateService } from "../../settings/settings-service";
import LoadingOverlay from "../../LoadingOverlay";
import GlobalFunctions from "../../GlobalFunctions";
import FxGlobalFunctions from "../../packages/currency/FxGlobalFunctions";
import Datehandler from "../../DateHandler";
import { Template } from 'meteor/templating';
import './agedreceivablessummary.html';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';

const reportService = new ReportService();
const utilityService = new UtilityService();
const taxRateService = new TaxRateService();

let defaultCurrencyCode = CountryAbbr;

Template.agedreceivablessummary.onCreated(() => {
  const templateObject = Template.instance();
  templateObject.displaysettings = new ReactiveVar([]);

  FxGlobalFunctions.initVars(templateObject);
  let reset_data = [
    { index: 0, label: 'ID', class: 'colID', active: false, display: true, width: "150", calc: false},
    { index: 1, label: 'Contact', class: 'colName', active: true, display: true, width: "150", calc: false},
    { index: 2, label: 'Type.', class: 'colType', active: true, display: true, width: "150", calc: false},
    { index: 3, label: 'Invoice No.', class: 'colPONumber', active: true, display: true, width: "150", calc: false},
    { index: 4, label: 'Due Date', class: 'colDueDate', active: true, display: true, width: "150", calc: false},
    { index: 5, label: 'Total Amount Due', class: 'colAmountDue text-right', active: true, display: true, width: "170", calc: true},
    { index: 6, label: 'Current', class: 'colCurrent text-right', active: true, display: true, width: "150", calc: true},
    { index: 7, label: '1 - 30 Days', class: 'col130Days text-right', active: true, display: true, width: "150", calc: true},
    { index: 8, label: '30 - 60 Days', class: 'col3060Days text-right', active: true, display: true, width: "150", calc: true},
    { index: 9, label: '60 - 90 Days', class: 'col6090Days text-right', active: true, display: true, width: "150", calc: true},
    { index: 10, label: '> 90 Days', class: 'col90Days text-right', active: true, display: true, width: "150", calc: true},
  ]
  templateObject.displaysettings.set(reset_data);
  templateObject.getReportDataRecord = function(data) {
    var dataList = [];
    if(data!='') {
      dataList =  [
        data.Name || "",
        data.Type || "",
        data.InvoiceNumber || "",
        GlobalFunctions.formatDate(data.dueDate) || "",
        data.AmountDue || 0,
        data.Current || 0,
        data["1-30Days"] || 0,
        data["30-60Days"] || 0,
        data["60-90Days"] || 0,
        data[">90Days"] || 0,
      ];
      for(let i = 0 ; i < dataList.length; i ++){
        if(i > 3)    dataList[i] = GlobalFunctions.generateSpan(GlobalFunctions.showCurrency(dataList[i]), dataList[i] < 0 ? "text-danger" : "text-primary");
        else         dataList[i] = GlobalFunctions.generateSpan(dataList[i], "text-primary");
      }
    }else {
      dataList = [
        "", "", "", "", "", "", "", "", "", ""
      ]
    }
    return dataList;
  }
});
Template.agedreceivablessummary.onRendered(() =>{});
// Template.agedreceivablessummary.onRendered(() => {
//   LoadingOverlay.show();
//   const templateObject = Template.instance();
//
//   let reset_data = [
//     { index: 1, label: 'Contact', class: 'colName', active: true, display: true, width: "150" },
//     { index: 2, label: 'Type', class: 'colPhone', active: true, display: true, width: "150" },
//     { index: 3, label: 'Invoice No', class: 'colARNotes', active: true, display: true, width: "150" },
//     { index: 4, label: 'Due Date', class: 'colAmountDue', active: true, display: true, width: "150" },
//     { index: 5, label: 'Total Amount Due', class: 'colCurrent text-right', active: true, display: true, width: "150" },
//     { index: 6, label: 'Current', class: 'colAvgDaysCustomer text-right', active: true, display: true, width: "150" },
//     { index: 7, label: '1 - 30 Days', class: 'col1-30Days text-right', active: true, display: true, width: "150" },
//     { index: 8, label: '30 - 60 Days', class: 'col30-60Days text-right', active: true, display: true, width: "150" },
//     { index: 9, label: '60 - 90 Days', class: 'col60-90Days text-right', active: true, display: true, width: "150" },
//     { index: 10, label: '> 90 Days', class: 'col90Days text-right', active: true, display: true, width: "150" },
//     // { index: 10, label: 'Avg Days Customer~Takes to pay', class: 'colAvgDaysCustomer', active: false, display: true, width: "150" },
//     // { index: 11, label: 'Invoice#', class: 'colInvoice', active: true, display: true, width: "100" },
//     // { index: 12, label: 'Rep Name', class: 'colRepName', active: true, display: true, width: "100" },
//     // { index: 13, label: 'FaxNumber', class: 'colFaxNumber', active: true, display: true, width: "100" },
//     // { index: 14, label: 'Mobile', class: 'colMobile', active: true, display: true, width: "90" },
//     // { index: 15, label: 'AltPhone', class: 'colAltPhone', active: true, display: true, width: "100" },
//     // { index: 16, label: 'StopCredit', class: 'colStopCredit', active: true, display: true, width: "110" },
//     // { index: 17, label: 'CreditLimit', class: 'colCreditLimit', active: true, display: true, width: "120" },
//     // { index: 18, label: 'Cust Type', class: 'colCustType', active: false, display: true, width: "100" },
//     // { index: 19, label: 'P.O. No#', class: 'colPONo', active: false, display: true, width: "100" },
//     // { index: 20, label: 'Sale Date', class: 'colSaleDate', active: false, display: true, width: "110" },
//     // { index: 21, label: 'Due Date', class: 'colDueDate', active: false, display: true, width: "100" },
//     // { index: 22, label: 'Type', class: 'colType', active: false, display: true, width: "80" },
//     // { index: 23, label: 'Pre-pay#', class: 'colPre-pay', active: false, display: true, width: "100" },
//     // { index: 24, label: 'Original Amount', class: 'colOriginalAmount', active: false, display: true, width: "150" },
//     // { index: 25, label: '1-7 Days', class: 'col1-7Days', active: false, display: true, width: "90" },
//     // { index: 26, label: '7-14 Days', class: 'col7-14Days', active: false, display: true, width: "90" },
//     // { index: 27, label: '14-21 Days', class: 'col14-21Days', active: false, display: true, width: "100" },
//     // { index: 28, label: '>21 Days', class: 'col21Days', active: false, display: true, width: "80" },
//     // { index: 29, label: 'Expiration Date', class: 'colExpirationDate', active: false, display: true, width: "140" },
//     // { index: 30, label: 'Reg NY', class: 'colRegNY', active: false, display: true, width: "70" },
//     // { index: 31, label: 'adv emails', class: 'coladvemails', active: false, display: true, width: "100" },
//     // { index: 32, label: 'Length', class: 'colLength', active: false, display: true, width: "80" },
//     // { index: 33, label: 'Width', class: 'colWidth', active: false, display: true, width: "80" },
//     // { index: 34, label: 'Height', class: 'colHeight', active: false, display: true, width: "80" },
//     // { index: 35, label: 'Region', class: 'colRegion', active: false, display: true, width: "80" },
//     // { index: 36, label: 'Account~ Name', class: 'colAccountName', active: false, display: true, width: "120" },
//     // { index: 37, label: 'Overdue~ Surcharge', class: 'colOverdueSurcharge', active: false, display: true, width: "150" },
//     // { index: 38, label: 'Shipping', class: 'colShipping', active: false, display: true, width: "100" },
//     // { index: 39, label: 'Terms', class: 'colTerms', active: false, display: true, width: "80" },
//     // { index: 40, label: 'Related Name', class: 'colRelatedName', active: false, display: true, width: "120" },
//     // { index: 41, label: 'Department', class: 'colDepartment', active: false, display: true, width: "100" },
//     // { index: 42, label: 'Status', class: 'colStatus', active: false, display: true, width: "80" },
//     // { index: 43, label: 'Customer Account No', class: 'colCustomerAccountNo', active: false, display: true, width: "150" },
//     // { index: 44, label: 'Email', class: 'colEmail', active: false, display: true, width: "80" },
//     // { index: 45, label: 'Overdue~ Surcharge~ Desc', class: 'colOverdueSurchargeDesc', active: false, display: true, width: "150" },
//     // { index: 46, label: 'Print Name', class: 'colPrintName', active: false, display: true, width: "100" },
//     // { index: 47, label: 'TransactionName', class: 'colTransactionName', active: false, display: true, width: "120" },
//     // { index: 48, label: 'Customer ID', class: 'colCustomerID', active: false, display: true, width: "120" },
//     // { index: 49, label: 'ConNote', class: 'colConNote', active: false, display: true, width: "100" },
//     // { index: 50, label: 'CheckNo', class: 'colCheckNo', active: false, display: true, width: "100" },
//   ];
//   templateObject.agedreceivablessummaryth.set(reset_data);
//
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
//     let imageData = localStorage.getItem("Image");
//     if (imageData) {
//       $("#uploadedImage").attr("src", imageData);
//       $("#uploadedImage").attr("width", "50%");
//     }
//   };
//   const deptrecords = [];
//   let contactName = FlowRouter.current().queryParams.contact || '';
//   let contactID = FlowRouter.current().queryParams.contactid || '';
//   if (FlowRouter.current().queryParams.contact) {
//     localStorage.setItem('VS1AgedReceivableSummary_Report', '');
//   }
//
//   templateObject.getAgedReceivableReports = (dateFrom, dateTo, ignoreDate) => {
//     LoadingOverlay.show();
//     templateObject.setDateAs(dateFrom);
//     if (!localStorage.getItem('VS1AgedReceivableSummary_Report')) {
//       reportService.getAgedReceivableDetailsSummaryData(dateFrom, dateTo, ignoreDate, contactID)
//         .then(function (data) {
//           if (data.tarreport.length) {
//             localStorage.setItem("VS1AgedReceivableSummary_Report", JSON.stringify(data) || "");
//             if (data.Params.IgnoreDates == true) {
//               $('#dateFrom').attr('readonly', true);
//               $('#dateTo').attr('readonly', true);
//
//             } else {
//               $('#dateFrom').attr('readonly', false);
//               $('#dateTo').attr('readonly', false);
//               $("#dateFrom").val(data.Params.DateFrom != '' ? moment(data.Params.DateFrom).format("DD/MM/YYYY") : data.Params.DateFrom);
//               $("#dateTo").val(data.Params.DateTo != '' ? moment(data.Params.DateTo).format("DD/MM/YYYY") : data.Params.DateTo);
//             };
//             let records = [];
//             let reportrecords = [];
//             let allRecords = [];
//             let current = [];
//
//             let totalNetAssets = 0;
//             let GrandTotalLiability = 0;
//             let GrandTotalAsset = 0;
//             let incArr = [];
//             let cogsArr = [];
//             let expArr = [];
//             let accountData = data.tarreport;
//             let accountType = "";
//
//             accountData.forEach(account => {
//               let amountdue = utilityService.modifynegativeCurrencyFormat(account.AmountDue) || 0;
//               let current = utilityService.modifynegativeCurrencyFormat(account.Current) || 0;
//               let day30 = utilityService.modifynegativeCurrencyFormat(account["1-30Days"]) || 0;
//               let day60 = utilityService.modifynegativeCurrencyFormat(account["30-60Days"]) || 0;
//               let day90 = utilityService.modifynegativeCurrencyFormat(account["60-90Days"]) || 0;
//               let dayabove90 = utilityService.modifynegativeCurrencyFormat(account[">90Days"]) || 0;
//               var dataList = {
//                 id: account.SaleID || "",
//                 contact: account.Printname || "",
//                 clientid: account.ClientID || "",
//                 type: "",
//                 invoiceno: "",
//                 duedate: "",
//                 amountdue: amountdue || 0.0,
//                 current: current || 0.0,
//                 day30: day30 || 0.0,
//                 day60: day60 || 0.0,
//                 day90: day90 || 0.0,
//                 dayabove90: dayabove90 || 0.0
//               };
//
//               reportrecords.push(dataList);
//
//               let recordObj = {
//                 Id: account.SaleID,
//                 Type: accountType,
//                 SupplierName: account.Printname,
//                 entries: account
//               };
//
//               records.push(recordObj);
//             });
//
//             //   for (let i = 0; i < accountData.length; i++) {
//             //     let amountdue = utilityService.modifynegativeCurrencyFormat(data.tarreport[i].AmountDue) || 0;
//             //     let current = utilityService.modifynegativeCurrencyFormat(data.tarreport[i].Current) || 0;
//             //     let day30 = utilityService.modifynegativeCurrencyFormat(data.tarreport[i]["1-30Days"]) || 0;
//             //     let day60 = utilityService.modifynegativeCurrencyFormat(data.tarreport[i]["30-60Days"]) || 0;
//             //     let day90 = utilityService.modifynegativeCurrencyFormat(data.tarreport[i]["60-90Days"]) || 0;
//             //     let dayabove90 = utilityService.modifynegativeCurrencyFormat(data.tarreport[i][">90Days"]) || 0;
//             //     var dataList = {
//             //       id: data.tarreport[i].SaleID || '',
//             //       contact:data.tarreport[i].Printname || '',
//             //       clientid:data.tarreport[i].ClientID || '',
//             //       type: '',
//             //       invoiceno: '',
//             //       duedate:'',
//             //       amountdue: amountdue || 0.00,
//             //       current: current || 0.00,
//             //       day30: day30 || 0.00,
//             //       day60: day60 || 0.00,
//             //       day90: day90 || 0.00,
//             //       dayabove90: dayabove90 || 0.00
//             //   };
//
//             //   reportrecords.push(dataList);
//
//             //     let recordObj = {};
//             //   recordObj.Id = data.tarreport[i].SaleID;
//             //   recordObj.type = data.tarreport[i].Type;
//             //   recordObj.SupplierName = data.tarreport[i].Printname;
//             //   recordObj.dataArr = [s
//             //       '',
//             //       data.tarreport[i].Type,
//             //       data.tarreport[i].InvoiceNumber,
//             //        moment(data.tarreport[i].InvoiceDate).format("DD MMM YYYY") || '-',
//             //       data.tarreport[i].DueDate !=''? moment(data.tarreport[i].DueDate).format("DD/MM/YYYY"): data.tarreport[i].DueDate,
//             //        data.tarreport[i].InvoiceNumber || '-',
//             //       utilityService.modifynegativeCurrencyFormat(data.tarreport[i].AmountDue) || '-',
//             //       utilityService.modifynegativeCurrencyFormat(data.tarreport[i].Current) || '-',
//             //       utilityService.modifynegativeCurrencyFormat(data.tarreport[i]["1-30Days"]) || '-',
//             //       utilityService.modifynegativeCurrencyFormat(data.tarreport[i]["30-60Days"]) || '-',
//             //       utilityService.modifynegativeCurrencyFormat(data.tarreport[i]["60-90Days"]) || '-',
//             //       utilityService.modifynegativeCurrencyFormat(data.tarreport[i][">90Days"]) || '-',
//
//             //
//             //   ];
//
//             //    if((data.tarreport[i].AmountDue != 0) || (data.tarreport[i].Current != 0)
//             //    || (data.tarreport[i]["1-30Days"] != 0) || (data.tarreport[i]["30-60Days"] != 0)
//             //  || (data.tarreport[i]["60-90Days"] != 0) || (data.tarreport[i][">90Days"] != 0)){
//             //     records.push(recordObj);
//             //    }
//
//             // }
//
//             reportrecords = _.sortBy(reportrecords, "contact");
//             templateObject.reportrecords.set(reportrecords);
//
//             records = _.sortBy(records, "SupplierName");
//             records = _.groupBy(records, "SupplierName");
//
//             for (let key in records) {
//               //  let obj = [{key: key}, {data: records[key]}];
//               let obj = {
//                 title: key,
//                 entries: records[key],
//                 total: {}
//               };
//               allRecords.push(obj);
//             }
//
//             allRecords.forEach(record => {
//               let amountduetotal = 0;
//               let Currenttotal = 0;
//               let lessTnMonth = 0;
//               let oneMonth = 0;
//               let twoMonth = 0;
//               let threeMonth = 0;
//               let Older = 0;
//
//               record.entries.forEach(entry => {
//                 amountduetotal = amountduetotal + parseFloat(entry.entries.AmountDue);
//                 Currenttotal = Currenttotal + parseFloat(entry.entries.Current);
//                 oneMonth = oneMonth + parseFloat(entry.entries["1-30Days"]);
//                 twoMonth = twoMonth + parseFloat(entry.entries["30-60Days"]);
//                 threeMonth = threeMonth + parseFloat(entry.entries["60-90Days"]);
//                 Older = Older + parseFloat(entry.entries[">90Days"]);
//               });
//
//               record.total = {
//                 // new
//                 Title: "Total " + record.title,
//                 TotalAmountDue: amountduetotal,
//                 TotalCurrent: Currenttotal,
//                 OneMonth: oneMonth,
//                 TwoMonth: twoMonth,
//                 ThreeMonth: threeMonth,
//                 OlderMonth: Older
//               };
//
//               // Used for grand total later
//               current.push(record.total);
//             });
//
//             //   let iterator = 0;
//             // for (let i = 0; i < allRecords.length; i++) {
//             //     let amountduetotal = 0;
//             //     let Currenttotal = 0;
//             //     let lessTnMonth = 0;
//             //     let oneMonth = 0;
//             //     let twoMonth = 0;
//             //     let threeMonth = 0;
//             //     let Older = 0;
//             //     const currencyLength = Currency.length;
//             //     for (let k = 0; k < allRecords[i][1].data.length; k++) {
//             //         amountduetotal = amountduetotal + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[4]);
//             //         Currenttotal = Currenttotal + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[5]);
//             //         oneMonth = oneMonth + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[6]);
//             //         twoMonth = twoMonth + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[7]);
//             //         threeMonth = threeMonth + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[8]);
//             //         Older = Older + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[9]);
//             //     }
//             //     let val = [allRecords[i][0].key+'', '', '', '', utilityService.modifynegativeCurrencyFormat(amountduetotal), utilityService.modifynegativeCurrencyFormat(Currenttotal),
//             //         utilityService.modifynegativeCurrencyFormat(oneMonth), utilityService.modifynegativeCurrencyFormat(twoMonth), utilityService.modifynegativeCurrencyFormat(threeMonth), utilityService.modifynegativeCurrencyFormat(Older)];
//             //     current.push(val);
//
//             // }
//
//             //grandtotalRecord
//             let grandamountduetotal = 0;
//             let grandCurrenttotal = 0;
//             let grandlessTnMonth = 0;
//             let grandoneMonth = 0;
//             let grandtwoMonth = 0;
//             let grandthreeMonth = 0;
//             let grandOlder = 0;
//
//             current.forEach(total => {
//               grandamountduetotal = grandamountduetotal + parseFloat(total.TotalAmountDue);
//               grandCurrenttotal = grandCurrenttotal + parseFloat(total.TotalCurrent);
//               // grandlessTnMonth = grandlessTnMonth + utilityService.convertSubstringParseFloat(current[n][5]);
//               grandoneMonth = grandoneMonth + parseFloat(total.OneMonth);
//               grandtwoMonth = grandtwoMonth + parseFloat(total.TwoMonth);
//               grandthreeMonth = grandthreeMonth + parseFloat(total.ThreeMonth);
//               grandOlder = grandOlder + parseFloat(total.OlderMonth);
//             });
//
//             // for (let n = 0; n < current.length; n++) {
//
//             //     const grandcurrencyLength = Currency.length;
//
//             //     for (let m = 0; m < current[n].data.length; m++) {
//             //          grandamountduetotal = grandamountduetotal + utilityService.convertSubstringParseFloat(current[n][4]);
//             //         grandCurrenttotal = grandCurrenttotal + utilityService.convertSubstringParseFloat(current[n][5]);
//             //          grandoneMonth = grandoneMonth + utilityService.convertSubstringParseFloat(current[n][6]);
//             //          grandtwoMonth = grandtwoMonth + utilityService.convertSubstringParseFloat(current[n][7]);
//             //          grandthreeMonth = grandthreeMonth + utilityService.convertSubstringParseFloat(current[n][8]);
//             //          grandOlder = grandOlder + utilityService.convertSubstringParseFloat(current[n][9]);
//             //     }
//             //      let val = ['Total ' + allRecords[i][0].key+'', '', '', '', utilityService.modifynegativeCurrencyFormat(Currenttotal), utilityService.modifynegativeCurrencyFormat(lessTnMonth),
//             //          utilityService.modifynegativeCurrencyFormat(oneMonth), utilityService.modifynegativeCurrencyFormat(twoMonth), utilityService.modifynegativeCurrencyFormat(threeMonth), utilityService.modifynegativeCurrencyFormat(Older)];
//             //      current.push(val);
//
//             // }
//
//             // let grandval = ['Grand Total ' +  '', '', '', '', utilityService.modifynegativeCurrencyFormat(grandamountduetotal), utilityService.modifynegativeCurrencyFormat(grandCurrenttotal),
//             //     utilityService.modifynegativeCurrencyFormat(grandoneMonth), utilityService.modifynegativeCurrencyFormat(grandtwoMonth), utilityService.modifynegativeCurrencyFormat(grandthreeMonth), utilityService.modifynegativeCurrencyFormat(grandOlder)];
//
//             // for (let key in records) {
//             //     let dataArr = current[iterator]
//             //     let obj = [{key: key}, {data: records[key]},{total:[{dataArr:dataArr}]}];
//             //     totalRecord.push(obj);
//             //     iterator += 1;
//             // }
//
//             let grandValObj = {
//               Title: "Grand Total ",
//               TotalAmountDue: grandamountduetotal,
//               TotalCurrent: grandCurrenttotal,
//               OneMonth: grandoneMonth,
//               TwoMonth: grandtwoMonth,
//               ThreeMonth: grandthreeMonth,
//               OlderMonth: grandOlder
//             };
//
//             // templateObject.records.set(totalRecord);
//             // templateObject.grandrecords.set(grandval);
//
//             templateObject.records.set(allRecords);
//             templateObject.grandrecords.set(grandValObj);
//
//             if (templateObject.records.get()) {
//               setTimeout(function () {
//                 $("td a").each(function () {
//                   if ($(this).text().indexOf("-" + Currency) >= 0)
//                     $(this).addClass("text-danger");
//                 }
//                 );
//                 $("td").each(function () {
//                   if ($(this).text().indexOf("-" + Currency) >= 0)
//                     $(this).addClass("text-danger");
//                 }
//                 );
//
//                 $("td").each(function () {
//                   let lineValue = $(this).first().text()[0];
//                   if (lineValue != undefined) {
//                     if (lineValue.indexOf(Currency) >= 0)
//                       $(this).addClass("text-right");
//                   }
//                 });
//
//                 $("td").each(function () {
//                   if ($(this).first().text().indexOf("-" + Currency) >= 0)
//                     $(this).addClass("text-right");
//                 }
//                 );
//
//                 $(".fullScreenSpin").css("display", "none");
//               }, 100);
//             }
//           }
//           LoadingOverlay.hide();
//         }).catch(function (err) {
//           //Bert.alert('<strong>' + err + '</strong>!', 'danger');
//
//           LoadingOverlay.hide();
//         });
//     } else {
//       let data = JSON.parse(localStorage.getItem('VS1AgedReceivableSummary_Report'));
//       if (data.tarreport.length) {
//
//         if (data.Params.IgnoreDates == true) {
//           $('#dateFrom').attr('readonly', true);
//           $('#dateTo').attr('readonly', true);
//
//         } else {
//           $('#dateFrom').attr('readonly', false);
//           $('#dateTo').attr('readonly', false);
//           $("#dateFrom").val(data.Params.DateFrom != '' ? moment(data.Params.DateFrom).format("DD/MM/YYYY") : data.Params.DateFrom);
//           $("#dateTo").val(data.Params.DateTo != '' ? moment(data.Params.DateTo).format("DD/MM/YYYY") : data.Params.DateTo);
//         }
//
//         let records = [];
//         let reportrecords = [];
//         let allRecords = [];
//         let current = [];
//
//         let totalNetAssets = 0;
//         let GrandTotalLiability = 0;
//         let GrandTotalAsset = 0;
//         let incArr = [];
//         let cogsArr = [];
//         let expArr = [];
//         let accountData = data.tarreport;
//         let accountType = "";
//
//         accountData.forEach(account => {
//           let amountdue = utilityService.modifynegativeCurrencyFormat(account.AmountDue) || 0;
//           let current = utilityService.modifynegativeCurrencyFormat(account.Current) || 0;
//           let day30 = utilityService.modifynegativeCurrencyFormat(account["1-30Days"]) || 0;
//           let day60 = utilityService.modifynegativeCurrencyFormat(account["30-60Days"]) || 0;
//           let day90 = utilityService.modifynegativeCurrencyFormat(account["60-90Days"]) || 0;
//           let dayabove90 = utilityService.modifynegativeCurrencyFormat(account[">90Days"]) || 0;
//           var dataList = {
//             id: account.SaleID || "",
//             contact: account.Printname || "",
//             clientid: account.ClientID || "",
//             type: "",
//             invoiceno: "",
//             duedate: "",
//             amountdue: amountdue || 0.0,
//             current: current || 0.0,
//             day30: day30 || 0.0,
//             day60: day60 || 0.0,
//             day90: day90 || 0.0,
//             dayabove90: dayabove90 || 0.0
//           };
//
//           reportrecords.push(dataList);
//
//           let recordObj = {
//             Id: account.SaleID,
//             Type: accountType,
//             SupplierName: account.Printname,
//             entries: account
//           };
//
//           records.push(recordObj);
//         });
//
//         //   for (let i = 0; i < accountData.length; i++) {
//         //     let amountdue = utilityService.modifynegativeCurrencyFormat(data.tarreport[i].AmountDue) || 0;
//         //     let current = utilityService.modifynegativeCurrencyFormat(data.tarreport[i].Current) || 0;
//         //     let day30 = utilityService.modifynegativeCurrencyFormat(data.tarreport[i]["1-30Days"]) || 0;
//         //     let day60 = utilityService.modifynegativeCurrencyFormat(data.tarreport[i]["30-60Days"]) || 0;
//         //     let day90 = utilityService.modifynegativeCurrencyFormat(data.tarreport[i]["60-90Days"]) || 0;
//         //     let dayabove90 = utilityService.modifynegativeCurrencyFormat(data.tarreport[i][">90Days"]) || 0;
//         //     var dataList = {
//         //       id: data.tarreport[i].SaleID || '',
//         //       contact:data.tarreport[i].Printname || '',
//         //       clientid:data.tarreport[i].ClientID || '',
//         //       type: '',
//         //       invoiceno: '',
//         //       duedate:'',
//         //       amountdue: amountdue || 0.00,
//         //       current: current || 0.00,
//         //       day30: day30 || 0.00,
//         //       day60: day60 || 0.00,
//         //       day90: day90 || 0.00,
//         //       dayabove90: dayabove90 || 0.00
//         //   };
//
//         //   reportrecords.push(dataList);
//
//         //     let recordObj = {};
//         //   recordObj.Id = data.tarreport[i].SaleID;
//         //   recordObj.type = data.tarreport[i].Type;
//         //   recordObj.SupplierName = data.tarreport[i].Printname;
//         //   recordObj.dataArr = [
//         //       '',
//         //       data.tarreport[i].Type,
//         //       data.tarreport[i].InvoiceNumber,
//         //        moment(data.tarreport[i].InvoiceDate).format("DD MMM YYYY") || '-',
//         //       data.tarreport[i].DueDate !=''? moment(data.tarreport[i].DueDate).format("DD/MM/YYYY"): data.tarreport[i].DueDate,
//         //        data.tarreport[i].InvoiceNumber || '-',
//         //       utilityService.modifynegativeCurrencyFormat(data.tarreport[i].AmountDue) || '-',
//         //       utilityService.modifynegativeCurrencyFormat(data.tarreport[i].Current) || '-',
//         //       utilityService.modifynegativeCurrencyFormat(data.tarreport[i]["1-30Days"]) || '-',
//         //       utilityService.modifynegativeCurrencyFormat(data.tarreport[i]["30-60Days"]) || '-',
//         //       utilityService.modifynegativeCurrencyFormat(data.tarreport[i]["60-90Days"]) || '-',
//         //       utilityService.modifynegativeCurrencyFormat(data.tarreport[i][">90Days"]) || '-',
//
//         //
//         //   ];
//
//         //    if((data.tarreport[i].AmountDue != 0) || (data.tarreport[i].Current != 0)
//         //    || (data.tarreport[i]["1-30Days"] != 0) || (data.tarreport[i]["30-60Days"] != 0)
//         //  || (data.tarreport[i]["60-90Days"] != 0) || (data.tarreport[i][">90Days"] != 0)){
//         //     records.push(recordObj);
//         //    }
//
//         // }
//
//         reportrecords = _.sortBy(reportrecords, "contact");
//         templateObject.reportrecords.set(reportrecords);
//
//         records = _.sortBy(records, "SupplierName");
//         records = _.groupBy(records, "SupplierName");
//
//         for (let key in records) {
//           //  let obj = [{key: key}, {data: records[key]}];
//           let obj = {
//             title: key,
//             entries: records[key],
//             total: {}
//           };
//           allRecords.push(obj);
//         }
//
//         allRecords.forEach(record => {
//           let amountduetotal = 0;
//           let Currenttotal = 0;
//           let lessTnMonth = 0;
//           let oneMonth = 0;
//           let twoMonth = 0;
//           let threeMonth = 0;
//           let Older = 0;
//
//           record.entries.forEach(entry => {
//             amountduetotal = amountduetotal + parseFloat(entry.entries.AmountDue);
//             Currenttotal = Currenttotal + parseFloat(entry.entries.Current);
//             oneMonth = oneMonth + parseFloat(entry.entries["1-30Days"]);
//             twoMonth = twoMonth + parseFloat(entry.entries["30-60Days"]);
//             threeMonth = threeMonth + parseFloat(entry.entries["60-90Days"]);
//             Older = Older + parseFloat(entry.entries[">90Days"]);
//           });
//
//           record.total = {
//             // new
//             Title: "Total " + record.title,
//             TotalAmountDue: amountduetotal,
//             TotalCurrent: Currenttotal,
//             OneMonth: oneMonth,
//             TwoMonth: twoMonth,
//             ThreeMonth: threeMonth,
//             OlderMonth: Older
//           };
//
//           // Used for grand total later
//           current.push(record.total);
//         });
//
//         //   let iterator = 0;
//         // for (let i = 0; i < allRecords.length; i++) {
//         //     let amountduetotal = 0;
//         //     let Currenttotal = 0;
//         //     let lessTnMonth = 0;
//         //     let oneMonth = 0;
//         //     let twoMonth = 0;
//         //     let threeMonth = 0;
//         //     let Older = 0;
//         //     const currencyLength = Currency.length;
//         //     for (let k = 0; k < allRecords[i][1].data.length; k++) {
//         //         amountduetotal = amountduetotal + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[4]);
//         //         Currenttotal = Currenttotal + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[5]);
//         //         oneMonth = oneMonth + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[6]);
//         //         twoMonth = twoMonth + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[7]);
//         //         threeMonth = threeMonth + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[8]);
//         //         Older = Older + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[9]);
//         //     }
//         //     let val = [allRecords[i][0].key+'', '', '', '', utilityService.modifynegativeCurrencyFormat(amountduetotal), utilityService.modifynegativeCurrencyFormat(Currenttotal),
//         //         utilityService.modifynegativeCurrencyFormat(oneMonth), utilityService.modifynegativeCurrencyFormat(twoMonth), utilityService.modifynegativeCurrencyFormat(threeMonth), utilityService.modifynegativeCurrencyFormat(Older)];
//         //     current.push(val);
//
//         // }
//
//         //grandtotalRecord
//         let grandamountduetotal = 0;
//         let grandCurrenttotal = 0;
//         let grandlessTnMonth = 0;
//         let grandoneMonth = 0;
//         let grandtwoMonth = 0;
//         let grandthreeMonth = 0;
//         let grandOlder = 0;
//
//         current.forEach(total => {
//           grandamountduetotal = grandamountduetotal + parseFloat(total.TotalAmountDue);
//           grandCurrenttotal = grandCurrenttotal + parseFloat(total.TotalCurrent);
//           // grandlessTnMonth = grandlessTnMonth + utilityService.convertSubstringParseFloat(current[n][5]);
//           grandoneMonth = grandoneMonth + parseFloat(total.OneMonth);
//           grandtwoMonth = grandtwoMonth + parseFloat(total.TwoMonth);
//           grandthreeMonth = grandthreeMonth + parseFloat(total.ThreeMonth);
//           grandOlder = grandOlder + parseFloat(total.OlderMonth);
//         });
//
//         // for (let n = 0; n < current.length; n++) {
//
//         //     const grandcurrencyLength = Currency.length;
//
//         //     for (let m = 0; m < current[n].data.length; m++) {
//         //          grandamountduetotal = grandamountduetotal + utilityService.convertSubstringParseFloat(current[n][4]);
//         //         grandCurrenttotal = grandCurrenttotal + utilityService.convertSubstringParseFloat(current[n][5]);
//         //          grandoneMonth = grandoneMonth + utilityService.convertSubstringParseFloat(current[n][6]);
//         //          grandtwoMonth = grandtwoMonth + utilityService.convertSubstringParseFloat(current[n][7]);
//         //          grandthreeMonth = grandthreeMonth + utilityService.convertSubstringParseFloat(current[n][8]);
//         //          grandOlder = grandOlder + utilityService.convertSubstringParseFloat(current[n][9]);
//         //     }
//         //      let val = ['Total ' + allRecords[i][0].key+'', '', '', '', utilityService.modifynegativeCurrencyFormat(Currenttotal), utilityService.modifynegativeCurrencyFormat(lessTnMonth),
//         //          utilityService.modifynegativeCurrencyFormat(oneMonth), utilityService.modifynegativeCurrencyFormat(twoMonth), utilityService.modifynegativeCurrencyFormat(threeMonth), utilityService.modifynegativeCurrencyFormat(Older)];
//         //      current.push(val);
//
//         // }
//
//         // let grandval = ['Grand Total ' +  '', '', '', '', utilityService.modifynegativeCurrencyFormat(grandamountduetotal), utilityService.modifynegativeCurrencyFormat(grandCurrenttotal),
//         //     utilityService.modifynegativeCurrencyFormat(grandoneMonth), utilityService.modifynegativeCurrencyFormat(grandtwoMonth), utilityService.modifynegativeCurrencyFormat(grandthreeMonth), utilityService.modifynegativeCurrencyFormat(grandOlder)];
//
//         // for (let key in records) {
//         //     let dataArr = current[iterator]
//         //     let obj = [{key: key}, {data: records[key]},{total:[{dataArr:dataArr}]}];
//         //     totalRecord.push(obj);
//         //     iterator += 1;
//         // }
//
//         let grandValObj = {
//           Title: "Grand Total ",
//           TotalAmountDue: grandamountduetotal,
//           TotalCurrent: grandCurrenttotal,
//           OneMonth: grandoneMonth,
//           TwoMonth: grandtwoMonth,
//           ThreeMonth: grandthreeMonth,
//           OlderMonth: grandOlder
//         };
//
//         // templateObject.records.set(totalRecord);
//         // templateObject.grandrecords.set(grandval);
//
//         templateObject.records.set(allRecords);
//         templateObject.grandrecords.set(grandValObj);
//
//         if (templateObject.records.get()) {
//           setTimeout(function () {
//             $("td a").each(function () {
//               if ($(this).text().indexOf("-" + Currency) >= 0)
//                 $(this).addClass("text-danger");
//             }
//             );
//             $("td").each(function () {
//               if ($(this).text().indexOf("-" + Currency) >= 0)
//                 $(this).addClass("text-danger");
//             }
//             );
//
//             $("td").each(function () {
//               let lineValue = $(this).first().text()[0];
//               if (lineValue != undefined) {
//                 if (lineValue.indexOf(Currency) >= 0)
//                   $(this).addClass("text-right");
//               }
//             });
//
//             $("td").each(function () {
//               if ($(this).first().text().indexOf("-" + Currency) >= 0)
//                 $(this).addClass("text-right");
//             }
//             );
//
//             $(".fullScreenSpin").css("display", "none");
//           }, 100);
//         }
//       }
//     }
//   };
//
//   // $('.ignoreDate').trigger('click');
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
//   }
//   // templateObject.getAllProductData();
//   templateObject.getDepartments();
//   templateObject.initDate();
//   templateObject.initUploadedImage();
//   templateObject.getAgedReceivableReports(
//     GlobalFunctions.convertYearMonthDay($('#dateFrom').val()),
//     GlobalFunctions.convertYearMonthDay($('#dateTo').val()),
//     false
//   );
//   templateObject.setDateAs(GlobalFunctions.convertYearMonthDay($('#dateFrom').val()))
//   LoadingOverlay.hide();
// });

Template.agedreceivablessummary.events({

});

Template.agedreceivablessummary.helpers({
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
    return reportService.getAgedReceivableDetailsSummaryData;
  },

  listParams: function() {
    return ['limitCount', 'limitFrom', 'dateFrom', 'dateTo', 'ignoreDate']
  },

  service: function () {
    return reportService
  },

  searchFunction: function () {
    return reportService.getAgedReceivableDetailsSummaryDataByKeyword;
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
