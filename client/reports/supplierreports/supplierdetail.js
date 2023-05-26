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
import "./supplierdetail.html"

let reportService = new ReportService();
let utilityService = new UtilityService();
let taxRateService = new TaxRateService();
let defaultCurrencyCode = CountryAbbr;

Template.supplierdetail.onCreated(() => {
  const templateObject = Template.instance();
  templateObject.displaysettings = new ReactiveVar([]);

  FxGlobalFunctions.initVars(templateObject);
  let reset_data = [
    { index: 0, label: 'ID', class: 'colSupplierID', active: true, display: true, width: "150" },
    { index: 1, label: 'Supplier', class: 'colContactName', active: true, display: true, width: "150" },
    { index: 2, label: 'PO No', class: 'colPhone', active: true, display: true, width: "150" },
    { index: 3, label: 'Trans Type', class: 'colTransType', active: true, display: true, width: "150" },
    { index: 4, label: 'Product ID', class: 'colProductID', active: true, display: true, width: "150" },
    { index: 5, label: 'Product Desc', class: 'colProductDesc', active: true, display: true, width: "150" },
    { index: 6, label: 'Cost (ex)', class: 'colCostEx text-right', active: true, display: true, width: "150" },
    { index: 7, label: 'Tax', class: 'colTax text-right', active: true, display: true, width: "150" },
    { index: 8, label: 'Cost (inc)', class: 'colCostInc text-right', active: true, display: true, width: "150" },
    { index: 9, label: 'Tax Code', class: 'colCode text-right', active: true, display: true, width: "150" },
    { index: 10, label: 'Qty Ordered', class: 'colOrdered text-right', active: true, display: true, width: "150" },
    { index: 11, label: 'Qty Received', class: 'colReceived text-right', active: true, display: true, width: "150" },
    { index: 12, label: 'Qty BO', class: 'colBO text-right', active: true, display: true, width: "150" },
    { index: 13, label: 'ETA Date', class: 'colDate', active: true, display: true, width: "150" },
    { index: 14, label: 'Order Date', class: 'colOrderDate', active: true, display: true, width: "150" },
    { index: 15, label: 'Received Date', class: 'colReceivedDate', active: true, display: true, width: "150" },
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
      for(let i = 0 ; i < dataList.length ; i ++){
        if(i > 4 && i < 8) {
          let tmp = dataList[i] - 0;
          dataList[i] = (tmp >= 0) ? GlobalFunctions.generateSpan(GlobalFunctions.showCurrency(tmp), "text-primary") : GlobalFunctions.generateSpan(GlobalFunctions.showCurrency(tmp), "text-danger");
        }
        else
          dataList[i] = GlobalFunctions.generateSpan(dataList[i])
      }
    }else {
      dataList = [
        "", "", "",  "", "", "", "", "", "", ""
      ]
    }
    return dataList;
  }
});
/*
Template.supplierdetail.onRendered(() => {
  const templateObject = Template.instance();
  LoadingOverlay.show();

  templateObject.init_reset_data = function () {
    let reset_data = [];
    reset_data = [
      { index: 1, label: 'Supplier', class: 'colSupplierID', active: true, display: true, width: "150" },
      { index: 2, label: 'PO No', class: 'colContactName', active: true, display: true, width: "150" },
      { index: 3, label: 'Trans Type', class: 'colPhone', active: true, display: true, width: "150" },
      { index: 4, label: 'Product ID', class: 'colMobile', active: true, display: true, width: "150" },
      { index: 5, label: 'Product Desc', class: 'colFaxNumber', active: true, display: true, width: "150" },
      { index: 6, label: 'Cost (ex)', class: 'colARBalance text-right', active: true, display: true, width: "150" },
      { index: 7, label: 'Tax', class: 'colAPBalance text-right', active: true, display: true, width: "150" },
      { index: 8, label: 'Cost (inc)', class: 'colBalance text-right', active: true, display: true, width: "150" },
      { index: 9, label: 'Tax Code', class: 'colStreet text-right', active: true, display: true, width: "150" },
      { index: 10, label: 'Qty Ordered', class: 'colSubburb text-right', active: true, display: true, width: "150" },
      { index: 11, label: 'Qty Received', class: 'colState text-right', active: true, display: true, width: "150" },
      { index: 12, label: 'Qty BO', class: 'colPostcode text-right', active: true, display: true, width: "150" },
      { index: 13, label: 'ETA Date', class: 'colCountry', active: true, display: true, width: "150" },
      { index: 14, label: 'Order Date', class: 'colBankAccountName', active: true, display: true, width: "150" },
      { index: 15, label: 'Received Date', class: 'colBankAccountBSB', active: true, display: true, width: "150" },
    ];
    templateObject.supplierdetailth.set(reset_data);
  }
  templateObject.init_reset_data();

  // await reportService.getBalanceSheetReport(dateAOsf) :

  // --------------------------------------------------------------------------------------------------
  templateObject.initDate = () => {
    Datehandler.initOneMonth();
  };
  templateObject.setDateAs = (dateFrom = null) => {
    templateObject.dateAsAt.set((dateFrom) ? moment(dateFrom).format("DD/MM/YYYY") : moment().format("DD/MM/YYYY"))
  };
  templateObject.initDate();

  // let date = new Date();
  // templateObject.currentYear.set(date.getFullYear());
  // templateObject.nextYear.set(date.getFullYear() + 1);
  // let currentMonth = moment(date).format("DD/MM/YYYY");
  // templateObject.currentMonth.set(currentMonth);

  // templateObject.setDateAs(GlobalFunctions.convertYearMonthDay($('#dateFrom').val()));

  templateObject.getSupplierDetailData = async function (dateFrom, dateTo, ignoreDate) {

    templateObject.setDateAs(dateTo);
    getVS1Data('SupplierDetailsReport').then(function (dataObject) {
      if (dataObject.length == 0) {
        reportService.getSupplierProductReport(dateFrom, dateTo, ignoreDate).then(async function (data) {
          await addVS1Data('SupplierDetailsReport', JSON.stringify(data));
          templateObject.displaySupplierDetailData(data);
        }).catch(function (err) {
        });
      } else {
        let data = JSON.parse(dataObject[0].data);
        templateObject.displaySupplierDetailData(data);
      }
    }).catch(function (err) {
      reportService.getSupplierProductReport(dateFrom, dateTo, ignoreDate).then(async function (data) {
        await addVS1Data('SupplierDetailsReport', JSON.stringify(data));
        templateObject.displaySupplierDetailData(data);
      }).catch(function (err) {

      });
    });
  }

  templateObject.getSupplierDetailData(
    GlobalFunctions.convertYearMonthDay($('#dateFrom').val()),
    GlobalFunctions.convertYearMonthDay($('#dateTo').val()),
    false
  );
  templateObject.displaySupplierDetailData = async function (data) {
    var splashArrayBalanceSheetReport = new Array();
    let deleteFilter = false;
    if (data.Params.Search.replace(/\s/g, "") == "") {
      deleteFilter = true;
    } else {
      deleteFilter = false;
    };

    for (let i = 0; i < data.tsupplierproduct.length; i++) {
      var dataList = [
        GlobalFunctions.generateSpan(data.tsupplierproduct[i]["Supplier Name"] || "", "text-primary"),
        GlobalFunctions.generateSpan(data.tsupplierproduct[i]["Purchase Order Number"] || "","text-primary"),
        GlobalFunctions.generateSpan(data.tsupplierproduct[i]["Transaction Type"] || "","text-primary"),
        GlobalFunctions.generateSpan(data.tsupplierproduct[i]["ProductID"] || "","text-primary"),
        GlobalFunctions.generateSpan(data.tsupplierproduct[i]["Product Description"] || "","text-primary"),
        GlobalFunctions.generateSpan(GlobalFunctions.showCurrency(data.tsupplierproduct[i]["Line Cost (Ex)"] || ""),"text-success"),
        GlobalFunctions.generateSpan(GlobalFunctions.showCurrency(data.tsupplierproduct[i]["Line Tax"] || ""),"text-success"),
        GlobalFunctions.generateSpan(GlobalFunctions.showCurrency(data.tsupplierproduct[i]["Line Cost (Inc)"] || ""),"text-success"),
        GlobalFunctions.generateSpan(data.tsupplierproduct[i]["Tax Code"] || "","text-primary"),
        GlobalFunctions.generateSpan(data.tsupplierproduct[i]["Ordered"] || "","text-primary"),
        GlobalFunctions.generateSpan(data.tsupplierproduct[i]["Shipped"] || "","text-primary"),
        GlobalFunctions.generateSpan(data.tsupplierproduct[i]["BackOrder"] || "","text-primary"),
        GlobalFunctions.generateSpan(GlobalFunctions.formatDate(data.tsupplierproduct[i]["ETADate"] || ""),"text-primary"),
        GlobalFunctions.generateSpan(GlobalFunctions.formatDate(data.tsupplierproduct[i]["Order Date"] || ""),"text-primary"),
        GlobalFunctions.generateSpan(GlobalFunctions.formatDate(data.tsupplierproduct[i]["ReceivedDate"] || ""),"text-primary"),
      ];
      splashArrayBalanceSheetReport.push(dataList);
      templateObject.transactiondatatablerecords.set(splashArrayBalanceSheetReport);
    }

    setTimeout(function () {
      $('#tableExport').DataTable({
        data: splashArrayBalanceSheetReport,
        searching: false,
        "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
        columnDefs: [
          {
            targets: 0,
            className: "colSupplierID",
          },
          {
            targets: 1,
            className: "colContactName"
          },
          {
            targets: 2,
            className: "colPhone"
          },
          {
            targets: 3,
            className: "colMobile ",
          },
          {
            targets: 4,
            className: "colFaxNumber ",
          },
          {
            targets: 5,
            className: "colARBalance text-right",
          },
          {
            targets: 6,
            className: "colAPBalance text-right",
          },
          {
            targets: 7,
            className: "colBalance text-right",
          },
          {
            targets: 8,
            className: "colStreet text-right",
          },
          {
            targets: 9,
            className: "colSubburb text-right",
          },
          {
            targets: 10,
            className: "colState text-right ",
          },
          {
            targets: 11,
            className: "colPostcode text-right ",
          },
          {
            targets: 12,
            className: "colCountry",
          },
          {
            targets: 13,
            className: "colBankAccountName ",
          },
          {
            targets: 14,
            className: "colBankAccountBSB ",
          },
        ],
        select: true,
        destroy: true,
        colReorder: true,
        pageLength: initialDatatableLoad,
        lengthMenu: [[initialDatatableLoad, -1], [initialDatatableLoad, "All"]],
        info: true,
        // responsive: true,
        "order": [[1, "asc"]],
        action: function () {
          $('#' + currenttablename).DataTable().ajax.reload();
        },

      }).on('page', function () {
        setTimeout(function () {
        }, 100);
      }).on('column-reorder', function () {

      }).on('length.dt', function (e, settings, len) {

        $(".fullScreenSpin").css("display", "inline-block");
        let dataLenght = settings._iDisplayLength;
        if (dataLenght == -1) {
          if (settings.fnRecordsDisplay() > initialDatatableLoad) {
            $(".fullScreenSpin").css("display", "none");
          } else {
            $(".fullScreenSpin").css("display", "none");
          }
        } else {
          $(".fullScreenSpin").css("display", "none");
        }
        setTimeout(function () {
        }, 100);
      });
      $(".fullScreenSpin").css("display", "none");
    }, 0);

    $('div.dataTables_filter input').addClass('form-control form-control-sm');
  }


  // ------------------------------------------------------------------------------------------------------
  $("#tblgeneralledger tbody").on("click", "tr", function () {
    var listData = $(this).closest("tr").children('td').eq(8).text();
    var checkDeleted = $(this).closest("tr").find(".colStatus").text() || "";

    if (listData) {
      if (checkDeleted == "Deleted") {
        swal("You Cannot View This Transaction", "Because It Has Been Deleted", "info");
      } else {
        FlowRouter.go("/journalentrycard?id=" + listData);
      }
    }
  });


  LoadingOverlay.hide();
});
*/
// Template.supplierdetail.onRendered(() => {
//   const templateObject = Template.instance();
//   LoadingOverlay.show();

//   templateObject.initDate = () => {
//     Datehandler.initOneMonth();
//   };

//   templateObject.setDateAs = ( dateFrom = null ) => {
//     templateObject.dateAsAt.set( ( dateFrom )? moment(dateFrom).format("DD/MM/YYYY") : moment().format("DD/MM/YYYY") )
//   };

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
//     await templateObject.getSupplierDetailReportData();

//     // await templateObject.loadReport(
//     //   GlobalFunctions.convertYearMonthDay($('#dateFrom').val()),
//     //   GlobalFunctions.convertYearMonthDay($('#dateTo').val()),
//     //   ignoreDate
//     // );
//   };


//   /**
//    * @deprecated since 23 septemeber 2022
//    */
//    templateObject.getSupplierDetailReportData = async function () {
//     let data = [];
//     if (!localStorage.getItem('VS1SupplierDetail_Report')) {
//       const options = await templateObject.reportOptions.get();
//       let dateFrom = moment(options.fromDate).format("YYYY-MM-DD") || moment().format("YYYY-MM-DD");
//       let dateTo = moment(options.toDate).format("YYYY-MM-DD") || moment().format("YYYY-MM-DD");
//       let ignoreDate = options.ignoreDate || false;
//       data = await reportService.getSupplierProductReport( dateFrom, dateTo, ignoreDate);
//       if( data.tsupplierproduct.length > 0 ){
//         localStorage.setItem('VS1SupplierDetail_Report', JSON.stringify(data)||'');
//       }
//     }else{
//       data = JSON.parse(localStorage.getItem('VS1SupplierDetail_Report'));
//     }

//     let reportSummary = data.tsupplierproduct.map(el => {
//       let resultobj = {};
//       Object.entries(el).map(([key, val]) => {
//           resultobj[key.split(" ").join("_").replace(/\W+/g, '')] = val;
//           return resultobj;
//       })
//       return resultobj;
//     })
//     let reportData = [];
//     if( reportSummary.length > 0 ){
//       for (const item of reportSummary ) {
//         let isExist = reportData.filter((subitem) => {
//           if( subitem.Supplier_Name == item.Supplier_Name ){
//               subitem.SubAccounts.push(item)
//               return subitem
//           }
//         });

//         if( isExist.length == 0 ){
//           reportData.push({
//               TotalCostEx: 0,
//               TotalCostInc: 0,
//               TotalTax: 0,
//               SubAccounts: [item],
//               ...item
//           });
//         }
//        LoadingOverlay.hide();
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
//        LoadingOverlay.hide();
//       }, 1000);
//     }
//   }

//   templateObject.loadReport = async (dateFrom, dateTo, ignoreDate) => {
//     LoadingOverlay.show();
//     templateObject.setDateAs(dateFrom);
//     let data = await CachedHttp.get(erpObject.TSupplierProduct, async () => {
//       return await  await reportService.getSupplierProductReport( dateFrom, dateTo, ignoreDate);
//     }, {
//       useIndexDb: true,
//       useLocalStorage: false,
//       validate: (cachedResponse) => {
//         return false;
//       }
//     });
//     data = data.response;

//     let reportSummary = data.tsupplierproduct.map(el => {
//       let resultobj = {};
//       Object.entries(el).map(([key, val]) => {
//           resultobj[key.split(" ").join("_").replace(/\W+/g, '')] = val;
//           return resultobj;
//       })
//       return resultobj;
//     })
//     let reportData = [];
//     if( reportSummary.length > 0 ){
//       for (const item of reportSummary ) {
//         let isExist = reportData.filter((subitem) => {
//           if( subitem.Supplier_Name == item.Supplier_Name ){
//               subitem.SubAccounts.push(item)
//               return subitem
//           }
//         });

//         if( isExist.length == 0 ){
//           reportData.push({
//               TotalCostEx: 0,
//               TotalCostInc: 0,
//               TotalTax: 0,
//               SubAccounts: [item],
//               ...item
//           });
//         }
//        LoadingOverlay.hide();
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
//        LoadingOverlay.hide();
//       }, 1000);
//     }
//   }

//   templateObject.initDate();
//   templateObject.loadReport(
//     GlobalFunctions.convertYearMonthDay($('#dateFrom').val()),
//     GlobalFunctions.convertYearMonthDay($('#dateTo').val()),
//     false
//   );
//   templateObject.setDateAs( GlobalFunctions.convertYearMonthDay($('#dateFrom').val()) );
// });

Template.supplierdetail.events({

});

Template.supplierdetail.helpers({
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
