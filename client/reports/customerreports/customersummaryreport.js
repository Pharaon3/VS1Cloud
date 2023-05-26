import { ReportService } from "../report-service";
import "jQuery.print/jQuery.print.js";
import { UtilityService } from "../../utility-service";
import LoadingOverlay from "../../LoadingOverlay";
import { TaxRateService } from "../../settings/settings-service";
import GlobalFunctions from "../../GlobalFunctions";
import Datehandler from "../../DateHandler";
import FxGlobalFunctions from "../../packages/currency/FxGlobalFunctions";
import { Template } from 'meteor/templating';
import "./customersummaryreport.html";
import moment from "moment";

let reportService = new ReportService();
let utilityService = new UtilityService();
let taxRateService = new TaxRateService();
let defaultCurrencyCode = CountryAbbr;

const currentDate = new Date();

Template.customersummaryreport.onCreated(() => {
  const templateObject = Template.instance();
  templateObject.displaysettings = new ReactiveVar([]);

  FxGlobalFunctions.initVars(templateObject);
  let reset_data = [
    { index: 0, label: 'ID', class:'colLineId', active: false, display: true, width: "10", calc: false},
    { index: 1, label: 'Name', class: 'colName', active: true, display: true, width: "200" },
    { index: 2, label: 'Phone', class: 'colPhone', active: true, display: true, width: "155" },
    { index: 3, label: 'Address', class: 'colAddress', active: true, display: true, width: "180" },
    { index: 4, label: 'City', class: 'colAddress2', active: true, display: true, width: "110" },
    { index: 5, label: 'Zip', class: 'colPostcode', active: true, display: true, width: "110" },
    { index: 6, label: 'State', class: 'colState', active: true, display: true, width: "110" },
    { index: 7, label: 'Total (Ex)', class: 'colTotalAEX text-right', active: true, display: true, width: "110" },
    { index: 8, label: 'Total', class: 'colTotalCost text-right', active: true, display: true, width: "110" },
    { index: 9, label: 'Gross Profit', class: 'colGrossProfit text-right', active: true, display: true, width: "110" },
    { index: 10, label: 'Margin', class: 'colMargin text-right', active: true, display: true, width: "110" },
  ]
  templateObject.displaysettings.set(reset_data);
  templateObject.getReportDataRecord = function(data) {
    var dataList = [];
    if(data!='') {
      dataList =  [
        data.Name || "",
        data.Phone || "",
        data.Address || "",
        data["Address 2"] || "",
        data["Postcode"] || "",
        data["State"] || "",
        data["Total Amount (Ex)"] || "",
        data["Total Amount (Inc)"] || "",
        data["Gross Profit"] || "",
        data["Total Cost"] || "",
      ];
      for(let i = 0 ; i < dataList.length ; i ++){
        if(i > 5) {
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
Template.customersummaryreport.onRendered(() => {
  const templateObject = Template.instance();
  LoadingOverlay.show();

  templateObject.init_reset_data = function () {
    let reset_data = [];
    reset_data = [
      { index: 1, label: 'Name', class: 'colName', active: true, display: true, width: "200" },
      { index: 2, label: 'Phone', class: 'colPhone', active: true, display: true, width: "155" },
      { index: 3, label: 'Address', class: 'colAddress', active: true, display: true, width: "180" },
      { index: 4, label: 'City', class: 'colAddress2', active: true, display: true, width: "110" },
      { index: 5, label: 'Zip', class: 'colPostcode', active: true, display: true, width: "110" },
      { index: 6, label: 'State', class: 'colState', active: true, display: true, width: "110" },
      { index: 7, label: 'Total (Ex)', class: 'colTotalAEX text-right', active: true, display: true, width: "110" },
      { index: 8, label: 'Total', class: 'colTotalCost text-right', active: true, display: true, width: "110" },
      { index: 9, label: 'Gross Profit', class: 'colGrossProfit text-right', active: true, display: true, width: "110" },
      { index: 10, label: 'Margin', class: 'colMargin text-right', active: true, display: true, width: "110" },
      //
      // { index: 3, label: 'Rep', class: 'colRep', active: true, display: true, width: "100" },
      // { index: 4, label: 'Type', class: 'colType', active: true, display: true, width: "100" },
      // { index: 5, label: 'Invoice Number', class: 'colInvoiceNumber', active: true, display: true, width: "130" },
      // { index: 6, label: 'SaleDate', class: 'colSaleDate', active: true, display: true, width: "160" },
      // { index: 7, label: 'DueDate', class: 'colDueDate', active: true, display: true, width: "160" },
      // { index: 14, label: 'Suburb', class: 'colSuburb', active: true, display: true, width: "100" },
      // { index: 17, label: 'FaxNumber', class: 'colFaxNumber', active: true, display: true, width: "100" },
      // { index: 18, label: 'Sale ID', class: 'colSaleID', active: false, display: true, width: "100" },
      // { index: 19, label: 'Customer ID', class: 'colCustomerID', active: false, display: true, width: "100" },
      // { index: 20, label: 'Address 3', class: 'colAddress3', active: false, display: true, width: "200" },
      // { index: 21, label: 'Country', class: 'colCountry', active: false, display: true, width: "100" },
      // { index: 22, label: 'Details', class: 'colDetails', active: false, display: true, width: "100" },
      // { index: 23, label: 'Client ID', class: 'colClientID', active: false, display: true, width: "100" },
      // { index: 24, label: 'Markup', class: 'colMarkup', active: false, display: true, width: "100" },
      // { index: 25, label: 'Last Sale Date', class: 'colLastSaleDate', active: false, display: true, width: "100" },
      // { index: 27, label: 'Customer Type', class: 'colCustomerType', active: false, display: true, width: "100" },
      // { index: 28, label: 'Email', class: 'colEmail', active: false, display: true, width: "100" },
      // { index: 29, label: 'Total Cost', class: 'colTotalCost', active: false, display: true, width: "100" },
    ];
    templateObject.customersummaryreportth.set(reset_data);
  }
  templateObject.init_reset_data();

  // await reportService.getBalanceSheetReport(dateAOsf) :

  // --------------------------------------------------------------------------------------------------
  templateObject.initDate = () => {
    Datehandler.initOneMonth();
  };
  templateObject.setDateAs = (dateTo = null) => {
    templateObject.dateAsAt.set((dateTo) ? moment(dateTo).format("DD/MM/YYYY") : moment().format("DD/MM/YYYY"))
  };
  templateObject.initDate();

  // let date = new Date();
  // templateObject.currentYear.set(date.getFullYear());
  // templateObject.nextYear.set(date.getFullYear() + 1);
  // let currentMonth = moment(date).format("DD/MM/YYYY");
  // templateObject.currentMonth.set(currentMonth);

  // templateObject.setDateAs(GlobalFunctions.convertYearMonthDay($('#dateFrom').val()));

  templateObject.getCustomerSummaryData = async function (dateFrom, dateTo, ignoreDate) {

    templateObject.setDateAs(GlobalFunctions.convertYearMonthDay($('#dateTo').val()));
    getVS1Data('TCustomerSummaryReport').then(function (dataObject) {
      if (dataObject.length == 0) {
        reportService.getCustomerDetailReport(dateFrom, dateTo, ignoreDate).then(async function (data) {
          await addVS1Data('TCustomerSummaryReport', JSON.stringify(data));
          templateObject.displayCustomerSummaryData(data);
        }).catch(function (err) {
        });
      } else {
        let data = JSON.parse(dataObject[0].data);
        templateObject.displayCustomerSummaryData(data);
      }
    }).catch(function (err) {
      reportService.getCustomerDetailReport(dateFrom, dateTo, ignoreDate).then(async function (data) {
        await addVS1Data('TCustomerSummaryReport', JSON.stringify(data));
        templateObject.displayCustomerSummaryData(data);
      }).catch(function (err) {

      });
    });
  }

  templateObject.getCustomerSummaryData(
      GlobalFunctions.convertYearMonthDay($('#dateFrom').val()),
      GlobalFunctions.convertYearMonthDay($('#dateTo').val()),
      false
  );
  templateObject.displayCustomerSummaryData = async function (data) {
    var splashArrayCustomerSummaryReport = new Array();
    let deleteFilter = false;
    if (data.Params.Search.replace(/\s/g, "") == "") {
      deleteFilter = true;
    } else {
      deleteFilter = false;
    };

    for (let i = 0; i < data.tcustomersummaryreport.length; i++) {
      var dataList = [
        GlobalFunctions.generateSpan(data.tcustomersummaryreport[i].Name || "", 'text-primary'),
        GlobalFunctions.generateSpan(data.tcustomersummaryreport[i].Phone || "", 'text-primary'),
        GlobalFunctions.generateSpan(data.tcustomersummaryreport[i].Address || "", 'text-primary'),
        GlobalFunctions.generateSpan(data.tcustomersummaryreport[i]["Address 2"] || "", 'text-primary'),
        GlobalFunctions.generateSpan(data.tcustomersummaryreport[i].Postcode || "", 'text-primary'),
        GlobalFunctions.generateSpan(data.tcustomersummaryreport[i].State || "", 'text-primary'),
        GlobalFunctions.generateSpan(GlobalFunctions.showCurrency(data.tcustomersummaryreport[i]["Total Amount (Ex)"] || 0), 'text-success', 'text-right'),
        GlobalFunctions.generateSpan(GlobalFunctions.showCurrency(data.tcustomersummaryreport[i]["Total Cost"] || 0), 'text-success', 'text-right'),
        GlobalFunctions.generateSpan(GlobalFunctions.showCurrency(data.tcustomersummaryreport[i]["Gross Profit"] || 0), 'text-success', 'text-right'),
        GlobalFunctions.generateSpan(GlobalFunctions.showCurrency(data.tcustomersummaryreport[i].Margin || 0), 'text-primary', 'text-right'),
      ];
      splashArrayCustomerSummaryReport.push(dataList);
      templateObject.transactiondatatablerecords.set(splashArrayCustomerSummaryReport);
    }


    if (templateObject.transactiondatatablerecords.get()) {
      setTimeout(function () {
        MakeNegative();
      }, 100);
    }
    //$('.fullScreenSpin').css('display','none');

    setTimeout(function () {
      $('#tableExport').DataTable({
        data: splashArrayCustomerSummaryReport,
        searching: false,
        "bsort": false,
        "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
        columnDefs: [
          {
            targets: 0,
            className: "colName",
          },
          {
            targets: 1,
            className: "colPhone"
          },
          {
            targets: 2,
            className: "colAddress",
          },
          {
            targets: 3,
            className: "colAddress2",
          },
          {
            targets: 4,
            className: "colPostcode",
          },
          {
            targets: 5,
            className: "colState",
          },
          {
            targets: 6,
            className: "colTotalAEX text-right",
          },
          {
            targets: 7,
            className: "colTotalCost text-right",
          },
          {
            targets: 8,
            className: "colGrossProfit text-right",
          },
          {
            targets: 9,
            className: "colMargin text-right",
          },
        ],
        select: true,
        destroy: true,
        colReorder: true,
        pageLength: initialDatatableLoad,
        lengthMenu: [[initialDatatableLoad, -1], [initialDatatableLoad, "All"]],
        info: true,
        // responsive: true,
        // "order": [],
        action: function () {
          $('#' + currenttablename).DataTable().ajax.reload();
        },

      }).on('page', function () {
        setTimeout(function () {
          MakeNegative();
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
          MakeNegative();
        }, 100);
      });
      $(".fullScreenSpin").css("display", "none");
    }, 0);

    $('div.dataTables_filter input').addClass('form-control form-control-sm');
  }


  // ------------------------------------------------------------------------------------------------------
  // $("#tblgeneralledger tbody").on("click", "tr", function () {
  //   var listData = $(this).closest("tr").children('td').eq(8).text();
  //   var checkDeleted = $(this).closest("tr").find(".colStatus").text() || "";

  //   if (listData) {
  //     if (checkDeleted == "Deleted") {
  //       swal("You Cannot View This Transaction", "Because It Has Been Deleted", "info");
  //     } else {
  //       FlowRouter.go("/journalentrycard?id=" + listData);
  //     }
  //   }
  // });


  LoadingOverlay.hide();
});
*/
// Template.customersummaryreport.onRendered(() => {
//   const templateObject = Template.instance();
//   LoadingOverlay.show();
//   templateObject.initDate = () => {
//     Datehandler.initOneMonth();
//   };


//   let reset_data = [
//     { index: 1, label: 'Name', class:'colName', active: true, display: true, width: "" },
//     { index: 2, label: 'Phone', class:'colPhone', active: true, display: true, width: "" },
//     { index: 3, label: 'Rep', class:'colRep', active: true, display: true, width: "" },
//     { index: 4, label: 'Type', class:'colType', active: true, display: true, width: "" },
//     { index: 5, label: 'Invoice Number', class:'colInvoiceNumber', active: true, display: true, width: "" },
//     { index: 6, label: 'SaleDate', class:'colSaleDate', active: true, display: true, width: "" },
//     { index: 7, label: 'DueDate', class:'colDueDate', active: true, display: true, width: "" },
//     { index: 8, label: 'Total Amount (Ex)', class:'colTotalAEX', active: true, display: true, width: "" },
//     { index: 9, label: 'Total Amount (Inc)', class:'colTotalAInc', active: true, display: true, width: "" },
//     { index: 10, label: 'Gross Profit', class:'colGrossProfit', active: true, display: true, width: "" },
//     { index: 11, label: 'Margin', class:'colMargin', active: true, display: true, width: "" },
//     { index: 12, label: 'Address', class:'colAddress', active: true, display: true, width: "" },
//     { index: 13, label: 'Address 2', class:'colAddress2', active: true, display: true, width: "" },
//     { index: 14, label: 'Suburb', class:'colSuburb', active: true, display: true, width: "" },
//     { index: 15, label: 'Postcode', class:'colPostcode', active: true, display: true, width: "" },
//     { index: 16, label: 'State', class:'colState', active: true, display: true, width: "" },
//     { index: 17, label: 'FaxNumber', class:'colFaxNumber', active: true, display: true, width: "" },
//     { index: 18, label: 'Sale ID', class:'colSaleID', active: false, display: true, width: "" },
//     { index: 19, label: 'Customer ID', class:'colCustomerID', active: false, display: true, width: "" },
//     { index: 20, label: 'Address 3', class:'colAddress3', active: false, display: true, width: "" },
//     { index: 21, label: 'Country', class:'colCountry', active: false, display: true, width: "" },
//     { index: 22, label: 'Details', class:'colDetails', active: false, display: true, width: "" },
//     { index: 23, label: 'Client ID', class:'colClientID', active: false, display: true, width: "" },
//     { index: 24, label: 'Markup', class:'colMarkup', active: false, display: true, width: "" },
//     { index: 25, label: 'Last Sale Date', class:'colLastSaleDate', active: false, display: true, width: "" },
//     { index: 26, label: 'Gross Profit(Ex)', class:'colGrossProfitEx', active: false, display: true, width: "" },
//     { index: 27, label: 'Customer Type', class:'colCustomerType', active: false, display: true, width: "" },
//     { index: 28, label: 'Email', class:'colEmail', active: false, display: true, width: "" },
//     { index: 29, label: 'Total Cost', class:'colTotalCost', active: false, display: true, width: "" },
//   ]
//   templateObject.customersummaryreportth.set(reset_data);


//   templateObject.setDateAs = ( dateFrom = null ) => {
//     templateObject.dateAsAt.set( ( dateFrom )? moment(dateFrom).format("DD/MM/YYYY") : moment().format("DD/MM/YYYY") )
//   };

//   templateObject.initDate();

//   templateObject.getCustomerDetailsHistory(
//     GlobalFunctions.convertYearMonthDay($('#dateFrom').val()),
//     GlobalFunctions.convertYearMonthDay($('#dateTo').val()),
//     false
//   );
//   templateObject.setDateAs( GlobalFunctions.convertYearMonthDay($('#dateFrom').val()) )
//   LoadingOverlay.hide();
// });

Template.customersummaryreport.events({

});

Template.customersummaryreport.helpers({
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
    return reportService.getCustomerSummaryReport;
  },

  listParams: function() {
    return ['limitCount', 'limitFrom', 'dateFrom', 'dateTo', 'ignoreDate']
  },

  service: function () {
    return reportService
  },

  searchFunction: function () {
    return reportService.getCustomerSummaryReportByKeyword;
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
