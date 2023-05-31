import { ReportService } from "../report-service";
import "jQuery.print/jQuery.print.js";
import { UtilityService } from "../../utility-service";
import LoadingOverlay from "../../LoadingOverlay";
import { TaxRateService } from "../../settings/settings-service";
import Datehandler from "../../DateHandler";
import CachedHttp from "../../lib/global/CachedHttp";
import erpObject from "../../lib/global/erp-objects";
import GlobalFunctions from "../../GlobalFunctions";
import FxGlobalFunctions from "../../packages/currency/FxGlobalFunctions";
import { Template } from 'meteor/templating';
import "./stockquantitybylocation.html";
import moment from "moment";

const reportService = new ReportService();
let utilityService = new UtilityService();
let taxRateService = new TaxRateService();
let defaultCurrencyCode = CountryAbbr;


Template.stockquantitybylocation.onCreated(() => {
  const templateObject = Template.instance();
  templateObject.displaysettings = new ReactiveVar([]);

  FxGlobalFunctions.initVars(templateObject);
  let reset_data = [
    { index: 0, label: 'ID', class:'colLineId', active: false, display: true, width: "10", calc: false},
    { index: 1, label: 'Department', class: 'colDepartment', active: true, display: true, width: "150", calc: false},
    { index: 2, label: 'Product', class: 'colProduct', active: true, display: true, width: "150", calc: false},
    { index: 3, label: 'Parts Desc', class: 'colDescription', active: true, display: true, width: "150", calc: false},
    { index: 4, label: 'UOM', class: 'colUOM', active: true, display: true, width: "150", calc: false},
    { index: 5, label: 'Manufacture', class: 'colManufacture', active: true, display: true, width: "150", calc: false},
    { index: 6, label: 'Products Type', class: 'colProductsType', active: true, display: true, width: "150", calc: false},
    { index: 7, label: 'Products Dept', class: 'colProductsDept', active: true, display: true, width: "150", calc: false},
    { index: 8, label: 'Cost', class: 'colCost text-right', active: true, display: true, width: "150", calc: true},
    { index: 9, label: 'Value', class: 'colValue text-right', active: true, display: true, width: "150", calc: true},
    { index: 10, label: 'Qty', class: 'colQty text-right', active: true, display: true, width: "150", calc: false},
    { index: 11, label: 'Department', class: 'colDept', active: false, display: true, width: "150", calc: false},
  ]
  templateObject.displaysettings.set(reset_data);
  templateObject.getReportDataRecord = function(data) {
    var dataList = [];
    if(data!='') {
      dataList =  [
        data.Classname || "",
        data.ProductName || "",
        data.PartsDescription || "",
        data.UOM || "",
        data.PartType || "",
        data.PartType || "",
        data.PartsDescription || "",
        data.Cost || 0,
        data.Value || 0,
        data.Qty || 0,
        data.Classname || "",
      ];
    }else {
      dataList = [
        "", "", "",  "", "", "", "", 0, 0, 0, ""
      ]
    }
    return dataList;
  }
});
Template.stockquantitybylocation.onRendered(() => {});
// Template.stockquantitybylocation.onRendered(() => {
//   const templateObject = Template.instance();
//   LoadingOverlay.show();
//
//   let reset_data = [
//     { index: 1, label: 'Department', class: 'colDepartment', active: true, display: true, width: "150" },
//     { index: 2, label: 'Product', class: 'colProductID', active: true, display: true, width: "150" },
//     { index: 3, label: 'Parts Desc', class: 'colDescription', active: true, display: true, width: "150" },
//     { index: 4, label: 'UOM', class: 'colUOM', active: true, display: true, width: "150" },
//     { index: 5, label: 'Manufacture', class: 'colManufacture', active: true, display: true, width: "150" },
//     { index: 6, label: 'Products Type', class: 'colProductsType', active: true, display: true, width: "150" },
//     { index: 7, label: 'Products Dept', class: 'colProductsDept', active: true, display: true, width: "150" },
//     { index: 8, label: 'Cost', class: 'colBatchNo text-right', active: true, display: true, width: "150" },
//     { index: 9, label: 'Value', class: 'colExpiryDate text-right', active: true, display: true, width: "150" },
//     { index: 10, label: 'Qty', class: 'colLocation text-right', active: true, display: true, width: "150" },
//     // { index: 11, label: 'No', class: 'colNo', active: false, display: true, width: "60" },
//     // { index: 11, label: 'Serial~No', class: 'colSerialNo', active: false, display: true, width: "90" },
//     // { index: 12, label: 'Cost', class: 'colCost', active: true, display: true, width: "100" },
//     // { index: 13, label: 'Value', class: 'colValue', active: true, display: true, width: "100" },
//     // { index: 14, label: 'Sales Order', class: 'colSalesOrder', active: false, display: true, width: "100" },
//     // { index: 15, label: 'In-Stock', class: 'colInStock', active: false, display: true, width: "80" },
//     // { index: 16, label: 'If read as UOM', class: 'colIfreadasUOM', active: false, display: true, width: "110" },
//     // { index: 17, label: 'Multiplier', class: 'colMultiplier', active: false, display: true, width: "100" },
//     // { index: 18, label: 'If read as Units', class: 'colIfreadasUnits1', active: false, display: true, width: "120" },
//     // { index: 19, label: 'If read as Units', class: 'colIfreadasUnits2', active: false, display: true, width: "120" },
//     // { index: 20, label: 'Multiplier', class: 'colMultiplier', active: false, display: true, width: "100" },
//     // { index: 21, label: 'If read as UOM', class: 'colIfreadasUOM2', active: true, display: true, width: "130" },
//     // { index: 22, label: 'In-Stock', class: 'colIn-stock', active: false, display: true, width: "80" },
//     // { index: 23, label: 'Sales Order', class: 'colSalesOrder', active: false, display: true, width: "100" },
//     // { index: 24, label: 'Available', class: 'colAvailable', active: false, display: true, width: "90" },
//     // { index: 25, label: 'UOMMultiplier', class: 'colUOMMultiplier', active: false, display: true, width: "100" },
//     // { index: 26, label: 'Unit Volume', class: 'colUnitVolume', active: false, display: true, width: "100" },
//     // { index: 27, label: 'Volume~ Available Qty', class: 'colVolumeAvailableQty', active: false, display: true, width: "130" },
//     // { index: 28, label: 'Volume~ Instock Qty', class: 'colVolumeINstockQty', active: false, display: true, width: "130" },
//     // { index: 29, label: 'Part Type', class: 'colPartType', active: false, display: true, width: "100" },
//     // { index: 30, label: 'Truck Load No', class: 'colTruckLoadNo', active: false, display: true, width: "110" },
//     // { index: 31, label: 'Expiry Date', class: 'colExpiryDate', active: false, display: true, width: "100" },
//     // { index: 32, label: 'SOQty', class: 'colSQQty', active: false, display: true, width: "80" },
//     // { index: 33, label: 'Instock Qty', class: 'colInstockQty2', active: false, display: true, width: "100" },
//     // { index: 34, label: 'Allocated UOMQty', class: 'colAllocatedUOMQty', active: false, display: true, width: "120" },
//     // { index: 35, label: 'Allocated SOUOMQty', class: 'colAllocatedSOUOMQty', active: false, display: true, width: "130" },
//     // { index: 36, label: 'Allocated In Stock UOMQty', class: 'colAllocatedInStockUOMQty', active: false, display: true, width: "150" },
//     // { index: 37, label: 'Bin', class: 'colBin', active: false, display: true, width: "70" },
//     // { index: 39, label: 'Batch', class: 'colBatch', acticve: false, display: true, width: "70" },
//     // { index: 39, label: 'SN', class: 'colSn', acticve: false, display: true, width: "60" },
//     // { index: 40, label: 'Preferred Supplier', class: 'colPreferredsupplier', active: false, display: true, width: "110" },
//     // { index: 41, label: 'Print Name', class: 'colPrintName', active: false, display: true, width: "100" },
//   ]
//   templateObject.stockquantitybylocationth.set(reset_data);
//
//   templateObject.initDate = () => {
//     Datehandler.initOneMonth();
//     // const currentDate = new Date();
//
//     // /**
//     //  * This will init dates
//     //  */
//     // let begunDate = moment(currentDate).format("DD/MM/YYYY");
//     // templateObject.dateAsAt.set(begunDate);
//
//     // let fromDateMonth = currentDate.getMonth() + 1;
//     // let fromDateDay = currentDate.getDate();
//     // if (currentDate.getMonth() + 1 < 10) {
//     //   fromDateMonth = "0" + (currentDate.getMonth() + 1);
//     // }
//
//     // let prevMonth = moment().subtract(1, "months").format("MM");
//
//     // if (currentDate.getDate() < 10) {
//     //   fromDateDay = "0" + currentDate.getDate();
//     // }
//     // // let getDateFrom = currentDate2.getFullYear() + "-" + (currentDate2.getMonth()) + "-" + ;
//     // var fromDate =
//     //   fromDateDay + "/" + prevMonth + "/" + currentDate.getFullYear();
//
//     // $("#date-input,#dateTo,#dateFrom").datepicker({
//     //   showOn: "button",
//     //   buttonText: "Show Date",
//     //   buttonImageOnly: true,
//     //   buttonImage: "/img/imgCal2.png",
//     //   dateFormat: "dd/mm/yy",
//     //   showOtherMonths: true,
//     //   selectOtherMonths: true,
//     //   changeMonth: true,
//     //   changeYear: true,
//     //   yearRange: "-90:+10",
//     //   onChangeMonthYear: function (year, month, inst) {
//     //     // Set date to picker
//     //     $(this).datepicker(
//     //       "setDate",
//     //       new Date(year, inst.selectedMonth, inst.selectedDay)
//     //     );
//     //     // Hide (close) the picker
//     //     // $(this).datepicker('hide');
//     //     // // Change ttrigger the on change function
//     //     // $(this).trigger('change');
//     //   },
//     // });
//
//     // $("#dateFrom").val(fromDate);
//     // $("#dateTo").val(begunDate);
//
//     // //--------- END OF DATE ---------------//
//   };
//
//   templateObject.setDateAs = (dateFrom = null) => {
//     templateObject.dateAsAt.set((dateFrom) ? moment(dateFrom).format("DD/MM/YYYY") : moment().format("DD/MM/YYYY"))
//   };
//
//
//   templateObject.setReportOptions = async function (ignoreDate = false, formatDateFrom = new Date(), formatDateTo = new Date()) {
//     let defaultOptions = templateObject.reportOptions.get();
//     if (defaultOptions) {
//       defaultOptions.fromDate = formatDateFrom;
//       defaultOptions.toDate = formatDateTo;
//       defaultOptions.ignoreDate = ignoreDate;
//     } else {
//       defaultOptions = {
//         fromDate: moment().subtract(1, "months").format("YYYY-MM-DD"),
//         toDate: moment().format("YYYY-MM-DD"),
//         ignoreDate: false
//       };
//     }
//     let begunDate = moment(formatDateTo).format("DD/MM/YYYY");
//     templateObject.dateAsAt.set(begunDate);
//     $('.edtReportDates').attr('disabled', false)
//     if (ignoreDate == true) {
//       $('.edtReportDates').attr('disabled', true);
//       templateObject.dateAsAt.set("Current Date");
//     }
//     $("#dateFrom").val(moment(defaultOptions.fromDate).format('DD/MM/YYYY'));
//     $("#dateTo").val(moment(defaultOptions.toDate).format('DD/MM/YYYY'));
//     await templateObject.reportOptions.set(defaultOptions);
//     await templateObject.getStockLocationReportData();
//   };
//
//   templateObject.getReportData = async function (dateFrom, dateTo, ignoreDate = false) {
//     getVS1Data('StockQuantityReport').then(function (dataObject) {
//       if (dataObject.length == 0) {
//         reportService.getStockQuantityLocationReport(dateFrom, dateTo, ignoreDate).then(async function (data) {
//           await addVS1Data('StockQuantityReport', JSON.stringify(data));
//           templateObject.displayStockQuantityData(data);
//         }).catch(function (err) {
//
//         });
//       } else {
//         let data = JSON.parse(dataObject[0].data);
//         templateObject.displayStockQuantityData(data);
//       }
//     }).catch(function (err) {
//       reportService.getBalanceSheetReport(dateAsOf).then(async function (data) {
//         await addVS1Data('StockQuantityReport', JSON.stringify(data));
//         templateObject.displayStockQuantityData(data);
//       }).catch(function (err) {
//
//       });
//     });
//   }
//   templateObject.loadReport = async (dateFrom = null, dateTo = null, ignoreDate) => {
//     LoadingOverlay.show();
//     templateObject.setDateAs(dateFrom);
//     // let data = [];
//     // if (!localStorage.getItem('VS1StockQuantityLocation_Report')) {
//     //   const options = await templateObject.reportOptions.get();
//     //   let dateFrom = moment(options.fromDate).format("YYYY-MM-DD") || moment().format("YYYY-MM-DD");
//     //   let dateTo = moment(options.toDate).format("YYYY-MM-DD") || moment().format("YYYY-MM-DD");
//     //   let ignoreDate = options.ignoreDate || false;
//     //   data = await reportService.getStockQuantityLocationReport( dateFrom, dateTo, ignoreDate);
//     //   if( data.tstockquantitylocation.length > 0 ){
//     //     localStorage.setItem('VS1StockQuantityLocation_Report', JSON.stringify(data)||'');
//     //   }
//     // }else{
//     //   data = JSON.parse(localStorage.getItem('VS1StockQuantityLocation_Report'));
//     // }
//
//     let data = await CachedHttp.get(erpObject.TStockQuantityLocation, async () => {
//       return await reportService.getStockQuantityLocationReport(dateFrom, dateTo, ignoreDate);
//     }, {
//       useIndexDb: true,
//       useLocalStorage: false,
//       validate: (cachedResponse) => {
//         return false;
//       }
//     });
//
//     templateObject.displayStockQuantityData(data.response);
//   }
//
//     templateObject.displayStockQuantityData = async function (data) {
//       let reportData = [];
//       if (data.tstockquantitylocation.length > 0) {
//         for (const item of data.tstockquantitylocation) {
//           let isExist = reportData.filter((subitem) => {
//             if (subitem.DepartmentID == item.DepartmentID) {
//               subitem.SubAccounts.push(item)
//               return subitem
//             }
//           });
//
//           if (isExist.length == 0) {
//             reportData.push({
//               TotalCost: 0,
//               TotalValue: 0,
//               SubAccounts: [item],
//               ...item
//             });
//           }
//           $(".fullScreenSpin").css("display", "none");
//         }
//       }
//       let useData = reportData.filter((item) => {
//         let TotalCost = 0;
//         let TotalValue = 0;
//         item.SubAccounts.map((subitem) => {
//           TotalCost += subitem.Cost;
//           TotalValue += subitem.Value;
//         });
//         item.TotalCost = TotalCost;
//         item.TotalValue = TotalValue;
//         return item;
//       });
//       templateObject.records.set(useData);
//       if (templateObject.records.get()) {
//         setTimeout(function () {
//           $("td a").each(function () {
//             if ($(this).text().indexOf("-" + Currency) >= 0) {
//               $(this).addClass("text-danger");
//               $(this).removeClass("fgrblue");
//             }
//           });
//           $("td").each(function () {
//             if ($(this).text().indexOf("-" + Currency) >= 0) {
//               $(this).addClass("text-danger");
//               $(this).removeClass("fgrblue");
//             }
//           });
//           $(".fullScreenSpin").css("display", "none");
//         }, 1000);
//       }
//
//       LoadingOverlay.hide();
//     }
//
//   templateObject.initDate();
//
//   templateObject.getReportData(
//     GlobalFunctions.convertYearMonthDay($('#dateFrom').val()),
//     GlobalFunctions.convertYearMonthDay($('#dateTo').val()),
//     false
//   );
//   templateObject.setDateAs(GlobalFunctions.convertYearMonthDay($('#dateFrom').val()))
// });

Template.stockquantitybylocation.events({

});

Template.stockquantitybylocation.helpers({
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
    return reportService.getStockQuantityLocationReport;
  },

  listParams: function() {
    return ['limitCount', 'limitFrom', 'dateFrom', 'dateTo', 'ignoreDate']
  },

  service: function () {
    return reportService
  },

  searchFunction: function () {
    return reportService.getStockQuantityLocationReportByKeyword;
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
