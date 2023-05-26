import { StockTransferService } from "../inventory/stockadjust-service";
import { ReactiveVar } from "meteor/reactive-var";
import { CoreService } from "../js/core-service";

import { UtilityService } from "../utility-service";
import { SideBarService } from "../js/sidebar-service";
import XLSX from "xlsx";
import "../lib/global/indexdbstorage.js";
import { Template } from "meteor/templating";
import { FlowRouter } from "meteor/ostrio:flow-router-extra";
import { ProductService } from "../product/product-service";
import "./stocktransferlist.html";

let sideBarService = new SideBarService();
let utilityService = new UtilityService();
Template.stocktransferlist.onCreated(function () {
  const templateObject = Template.instance();
  templateObject.datatablerecords = new ReactiveVar([]);
  templateObject.tableheaderrecords = new ReactiveVar([]);
  templateObject.selectedFile = new ReactiveVar();

  templateObject.getDataTableList = function (data) {
    let linestatus = "";
    if (data.Processed == true) {
      linestatus = "Processed";
    } else if (data.Processed == false) {
      linestatus = "On-Hold";
    }
    if (data.Deleted == true) {
      linestatus = "Deleted";
    }
    let dataList = [
      data.TransferEntryID || "",
      '<span style="display:none;">' +
        (data.CreationDate != "" ? moment(data.CreationDate).format("YYYY/MM/DD") : data.CreationDate) +
        "</span>" +
        (data.CreationDate != "" ? moment(data.CreationDate).format("DD/MM/YYYY") : data.CreationDate),
      data.TransferFromClassName || "",
      data.Accountname || "",
      '<span style="display:none;">' +
        (data.DateTransferred != "" ? moment(data.DateTransferred).format("YYYY/MM/DD") : data.DateTransferred) +
        "</span>" +
        (data.DateTransferred != "" ? moment(data.DateTransferred).format("DD/MM/YYYY") : data.DateTransferred),
      "",
      "",
      data.EmployeeName || "",
      data.Notes || "",
      linestatus,
    ];
    return dataList;
  };

  let headerStructure = [
    { index: 0, label: "ID", class: "colTransferNo", active: false, display: true, width: "20" },
    { index: 1, label: "Creation Date", class: "colCreationDate", active: true, display: true, width: "120" },
    { index: 2, label: "Transfer From Dept", class: "colTransferDept", active: true, display: true, width: "200" },
    { index: 3, label: "Account Name", class: "colAccountName", active: true, display: true, width: "200" },
    { index: 4, label: "Transfer Date", class: "colAdjustmentDate", active: true, display: true, width: "120" },
    { index: 5, label: "Custom Field 1", class: "colSaleCustField1", active: false, display: true, width: "115" },
    { index: 6, label: "Custom Field 2", class: "colSaleCustField2", active: false, display: true, width: "115" },
    { index: 7, label: "Employee", class: "colEmployee", active: true, display: true, width: "200" },
    { index: 8, label: "Comments", class: "colNotes", active: true, display: true, width: "650" },
    { index: 9, label: "Status", class: "colStatus", active: true, display: true, width: "120" },
  ];
  templateObject.tableheaderrecords.set(headerStructure);
});

Template.stocktransferlist.onRendered(function () {
  $(".fullScreenSpin").css("display", "inline-block");
  let templateObject = Template.instance();
  let stockTransferService = new StockTransferService();
  const customerList = [];
  let salesOrderTable;
  var splashArray = new Array();
  const dataTableList = [];
  const tableHeaderList = [];

  if (FlowRouter.current().queryParams.success) {
    $(".btnRefresh").addClass("btnRefreshAlert");
  }

  Meteor.call("readPrefMethod", localStorage.getItem("mycloudLogonID"), "tblStockTransferList", function (error, result) {
    if (error) {
    } else {
      if (result) {
        for (let i = 0; i < result.customFields.length; i++) {
          let customcolumn = result.customFields;
          let columData = customcolumn[i].label;
          let columHeaderUpdate = customcolumn[i].thclass.replace(/ /g, ".");
          let hiddenColumn = customcolumn[i].hidden;
          let columnClass = columHeaderUpdate.split(".")[1];
          let columnWidth = customcolumn[i].width;
          // let columnindex = customcolumn[i].index + 1;
          $("th." + columnClass + "").html(columData);
          $("th." + columnClass + "").css("width", "" + columnWidth + "px");
        }
      }
    }
  });

  function MakeNegative() {
    $("td").each(function () {
      if (
        $(this)
          .text()
          .indexOf("-" + Currency) >= 0
      )
        $(this).addClass("text-danger");
    });
  }
  
  templateObject.resetData = function (dataVal) {
    window.open("/stocktransferlist?page=last", "_self");
  };
});

Template.stocktransferlist.events({
  "click .btnRefresh": function () {
    $(".fullScreenSpin").css("display", "inline-block");
    sideBarService
      .getAllStockTransferEntry(initialDataLoad, 0)
      .then(function (data) {
        addVS1Data("TStockTransferEntry", JSON.stringify(data))
          .then(function (datareturn) {
            window.open("/stocktransferlist", "_self");
          })
          .catch(function (err) {
            window.open("/stocktransferlist", "_self");
          });
      })
      .catch(function (err) {
        window.open("/stocktransferlist", "_self");
      });
  },
  "click .btnnewstockadjustment": function (event) {
    FlowRouter.go("/stocktransfercard");
  },
  "keyup #tblStockTransferList_filter input": function (event) {
    if ($(event.target).val() != "") {
      $(".btnRefreshStockAdjustment").addClass("btnSearchAlert");
    } else {
      $(".btnRefreshStockAdjustment").removeClass("btnSearchAlert");
    }
    if (event.keyCode == 13) {
      $(".btnRefreshStockAdjustment").trigger("click");
    }
  },
  "click .btnRefreshStockAdjustment": function (event) {
    $(".btnRefresh").trigger("click");
  },
  "click #tblStockTransferList tbody tr": function (event) {
    var listData = $(event.target).closest("tr").find("td.colTransferNo").text();
    var checkDeleted = $(this).closest("tr").find(".colStatus").text() || "";
    if (listData) {
      if (checkDeleted == "Deleted") {
        swal("You Cannot View This Transaction", "Because It Has Been Deleted", "info");
      } else {
        FlowRouter.go("/stocktransfercard?id=" + listData);
      }
    }
  },
  "click .templateDownload": function () {
    let utilityService = new UtilityService();
    let rows = [];
    const filename = "SampleProduct" + ".csv";
    rows[0] = [
      "Product Name",
      "Sales Description",
      "Sale Price",
      "Sales Account",
      "Tax Code",
      "Barcode",
      "Purchase Description",
      "COGGS Account",
      "Purchase Tax Code",
      "Cost",
    ];
    rows[1] = ["TSL - Black", "T-Shirt Large Black", "600", "Sales", "NT", "", "T-Shirt Large Black", "Cost of Goods Sold", "NT", "700"];
    utilityService.exportToCsv(rows, filename, "csv");
  },
  "click .templateDownloadXLSX": function (e) {
    e.preventDefault(); //stop the browser from following
    window.location.href = "sample_imports/SampleProduct.xlsx";
  },
  "click .btnUploadFile": function (event) {
    $("#attachment-upload").val("");
    $(".file-name").text("");
    //$(".btnImport").removeAttr("disabled");
    $("#attachment-upload").trigger("click");
  },
  "change #attachment-upload": function (e) {
    let templateObj = Template.instance();
    var filename = $("#attachment-upload")[0].files[0]["name"];
    var fileExtension = filename.split(".").pop().toLowerCase();
    var validExtensions = ["csv", "txt", "xlsx"];
    var validCSVExtensions = ["csv", "txt"];
    var validExcelExtensions = ["xlsx", "xls"];

    if (validExtensions.indexOf(fileExtension) == -1) {
      // Bert.alert('<strong>formats allowed are : '+ validExtensions.join(', ')+'</strong>!', 'danger');
      swal("Invalid Format", "formats allowed are :" + validExtensions.join(", "), "error");
      $(".file-name").text("");
      $(".btnImport").Attr("disabled");
    } else if (validCSVExtensions.indexOf(fileExtension) != -1) {
      $(".file-name").text(filename);
      let selectedFile = event.target.files[0];
      templateObj.selectedFile.set(selectedFile);
      if ($(".file-name").text() != "") {
        $(".btnImport").removeAttr("disabled");
      } else {
        $(".btnImport").Attr("disabled");
      }
    } else if (fileExtension == "xlsx") {
      $(".file-name").text(filename);
      let selectedFile = event.target.files[0];
      var oFileIn;
      var oFile = selectedFile;
      var sFilename = oFile.name;
      // Create A File Reader HTML5
      var reader = new FileReader();

      // Ready The Event For When A File Gets Selected
      reader.onload = function (e) {
        var data = e.target.result;
        data = new Uint8Array(data);
        var workbook = XLSX.read(data, { type: "array" });

        var result = {};
        workbook.SheetNames.forEach(function (sheetName) {
          var roa = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
          var sCSV = XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]);
          templateObj.selectedFile.set(sCSV);

          if (roa.length) result[sheetName] = roa;
        });
        // see the result, caution: it works after reader event is done.
      };
      reader.readAsArrayBuffer(oFile);

      if ($(".file-name").text() != "") {
        $(".btnImport").removeAttr("disabled");
      } else {
        $(".btnImport").Attr("disabled");
      }
    }
  },
  "click .btnImport": function () {
    $(".fullScreenSpin").css("display", "inline-block");
    let templateObject = Template.instance();
    let productService = new ProductService();
    let objDetails;

    Papa.parse(templateObject.selectedFile.get(), {
      complete: function (results) {
        if (results.data.length > 0) {
          if (
            results.data[0][0] == "Product Name" &&
            results.data[0][1] == "Sales Description" &&
            results.data[0][2] == "Sale Price" &&
            results.data[0][3] == "Sales Account" &&
            results.data[0][4] == "Tax Code" &&
            results.data[0][5] == "Barcode" &&
            results.data[0][6] == "Purchase Description" &&
            results.data[0][7] == "COGGS Account" &&
            results.data[0][8] == "Purchase Tax Code" &&
            results.data[0][9] == "Cost"
          ) {
            let dataLength = results.data.length * 3000;
            setTimeout(function () {
              // $('#importModal').modal('toggle');
              // window.open("/stocktransferlist?success=true", "_self");
            }, parseInt(dataLength));

            for (let i = 0; i < results.data.length - 1; i++) {
              objDetails = {
                type: "TProduct",
                fields: {
                  Active: true,
                  ProductType: "INV",

                  ProductPrintName: results.data[i + 1][0],
                  ProductName: results.data[i + 1][0],
                  SalesDescription: results.data[i + 1][1],
                  SellQty1Price: parseFloat(results.data[i + 1][2].replace(/[^0-9.-]+/g, "")) || 0,
                  IncomeAccount: results.data[i + 1][3],
                  TaxCodeSales: results.data[i + 1][4],
                  Barcode: results.data[i + 1][5],
                  PurchaseDescription: results.data[i + 1][6],

                  // AssetAccount:results.data[i+1][0],
                  CogsAccount: results.data[i + 1][7],

                  TaxCodePurchase: results.data[i + 1][8],

                  BuyQty1Cost: parseFloat(results.data[i + 1][9].replace(/[^0-9.-]+/g, "")) || 0,

                  PublishOnVS1: true,
                },
              };
              if (results.data[i + 1][1]) {
                if (results.data[i + 1][1] !== "") {
                  productService
                    .saveProduct(objDetails)
                    .then(function (data) {
                      $('.fullScreenSpin').css('display','none');
                      window.open("/stocktransferlist?success=true", "_self");
                    })
                    .catch(function (err) {
                      $('.fullScreenSpin').css('display','none');
                      swal({
                        title: "Oooops...",
                        text: err,
                        type: "error",
                        showCancelButton: false,
                        confirmButtonText: "Try Again",
                      }).then((result) => {
                        if (result.value) {
                          window.open("/stocktransferlist?success=true", "_self");
                        } else if (result.dismiss === "cancel") {
                          window.open("/stocktransferlist?success=false", "_self");
                        }
                      });
                    });
                }
              }
            }
          } else {
            $(".fullScreenSpin").css("display", "none");
            // Bert.alert('<strong> Data Mapping fields invalid. </strong> Please check that you are importing the correct file with the correct column headers.', 'danger');
            swal("Invalid Data Mapping fields ", "Please check that you are importing the correct file with the correct column headers.", "error");
          }
        } else {
          $(".fullScreenSpin").css("display", "none");
          // Bert.alert('<strong> Data Mapping fields invalid. </strong> Please check that you are importing the correct file with the correct column headers.', 'danger');
          swal("Invalid Data Mapping fields ", "Please check that you are importing the correct file with the correct column headers.", "error");
        }
      },
    });
  },
});
Template.stocktransferlist.helpers({
  datatablerecords: () => {
    return Template.instance().datatablerecords.get();
  },
  tableheaderrecords: () => {
    return Template.instance().tableheaderrecords.get();
  },
  salesCloudPreferenceRec: () => {
    return CloudPreference.findOne({ userid: localStorage.getItem("mycloudLogonID"), PrefName: "tblStockTransferList" });
  },
  // custom fields displaysettings
  custfields: () => {
    return Template.instance().custfields.get();
  },

  // custom fields displaysettings
  displayfields: () => {
    return Template.instance().displayfields.get();
  },

  convertedStatus: () => {
    return Template.instance().convertedStatus.get();
  },

  apiFunction: function () {
    // do not use arrow function
    return sideBarService.getAllStockTransferEntryList;
  },

  searchAPI: function () {
    return sideBarService.getAllStockTransferEntryByName;
  },

  apiParams: function () {
    // return ['limitCount', 'limitFrom'];
    return ["dateFrom", "dateTo", "ignoredate", "limitCount", "limitFrom", "deleteFilter"];
  },

  service: () => {
    return sideBarService;
  },

  datahandler: function () {
    let templateObject = Template.instance();
    return function (data) {
      let dataReturn = templateObject.getDataTableList(data);
      return dataReturn;
    };
  },

  exDataHandler: function () {
    let templateObject = Template.instance();
    return function (data) {
      let dataReturn = templateObject.getDataTableList(data);
      return dataReturn;
    };
  },
});
