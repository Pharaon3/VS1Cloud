// @ts-nocheck
import './inventory-settings.html'
import { ReactiveVar } from "meteor/reactive-var";
import { Template } from 'meteor/templating';
import "../../lib/global/indexdbstorage.js";
import LoadingOverlay from "../../LoadingOverlay";
import { UtilityService } from "../../utility-service";
import { ContactService } from "../../contacts/contact-service";
import { SideBarService } from "../../js/sidebar-service";
import { ProductService } from "../../product/product-service";
import moment from "moment";
import XLSX from "xlsx";

const utilityService = new UtilityService();
const contactService = new ContactService();
const sideBarService = new SideBarService();


Template.wizard_inventory.onCreated(function () {

  const templateObject = Template.instance();
  templateObject.datatablebackuprecords = new ReactiveVar([]);
  templateObject.tableheaderrecords = new ReactiveVar([]);
  templateObject.taxraterecords = new ReactiveVar([]);
  templateObject.recentTrasactions = new ReactiveVar([]);
  templateObject.coggsaccountrecords = new ReactiveVar();
  templateObject.salesaccountrecords = new ReactiveVar();
  templateObject.productdeptrecords = new ReactiveVar();
  templateObject.proddeptIDrecords = new ReactiveVar();
  templateObject.selectedFile = new ReactiveVar();
  

  templateObject.displayfields = new ReactiveVar([]);
  templateObject.reset_data = new ReactiveVar([]);
  templateObject.setupFinished = new ReactiveVar();

  templateObject.productDataList = new ReactiveVar();
  templateObject.columnData = new ReactiveVar();
  templateObject.productID = new ReactiveVar();
  templateObject.transtype = new ReactiveVar();

  templateObject.getDataTableList = function(data) {
    let checkIfSerialorLot, onBOOrder;
    let availableQty = data.AvailableQty||0;
    if(data.SNTracking == true){
      checkIfSerialorLot = '<i class="fas fa-plus-square text-success btnSNTracking"  style="font-size: 22px;" ></i>';
    }else if(data.batch == true){
      checkIfSerialorLot = '<i class="fas fa-plus-square text-success btnBatch"  style="font-size: 22px;" ></i>';
    }else{
      checkIfSerialorLot = '<i class="fas fa-plus-square text-success btnNoBatchorSerial"  style="font-size: 22px;" ></i>';
    }

    onBOOrder = data.TotalQtyInStock - availableQty;
    var dataList = [
      data.PARTSID || "",
      data.ProductName || "-",
      data.SalesDescription || "",
      availableQty,
      data.AllocatedSO||0,
      data.AllocatedBO||0,
      data.InStock,
      data.OnOrder,
      utilityService.modifynegativeCurrencyFormat(Math.floor(data.CostExA * 100) / 100),
      utilityService.modifynegativeCurrencyFormat(Math.floor(data.CostIncA * 100) /100),
      utilityService.modifynegativeCurrencyFormat(Math.floor(data.PriceExA * 100) / 100),
      utilityService.modifynegativeCurrencyFormat(Math.floor(data.PriceIncA * 100) /100),
      checkIfSerialorLot||'',
      data.BARCODE || "",
      data.PurchaseDescription || "",
      data.CUSTFLD1 || "",
      data.CUSTFLD2 || "",
      data.Active ? "" : "In-Active"
    ];
    return dataList;
  }

  let headerStructure = [
    { index: 0, label: "ID", class: "colProductID", width: "20", active: false, display: true },
    { index: 1, label: "Product Name", class: "colProductName", width: "200", active: true, display: true },
    { index: 2, label: "Sales Description", class: "colSalesDescription", width: "500", active: true, display: true },
    { index: 3, label: "Available", class: "colAvailable", width: "80", active: true, display: true },
    { index: 4, label: "On SO", class: "colOnSO", width: "80", active: true, display: true },
    { index: 5, label: "On BO", class: "colOnBO", width: "80", active: true, display: true },
    { index: 6, label: "In Stock", class: "colInStock", width: "80", active: true, display: true },
    { index: 7, label: "On Order", class: "colOnOrder", width: "80", active: true, display: true },
    { index: 8, label: "Cost Price (Ex)", class: "colCostPrice", width: "110", active: false, display: true },
    { index: 9, label: "Cost Price (Inc)", class: "colCostPriceInc", width: "110", active: true, display: true },
    { index: 10, label: "Sale Price (Ex)", class: "colSalePrice", width: "110", active: false, display: true },
    { index: 11, label: "Sale Price (Inc)", class: "colSalePriceInc", width: "110", active: true, display: true },
    { index: 12, label: "Serial/Lot No", class: "colSerialNo", width: "124", active: false, display: true },
    { index: 13, label: "Barcode", class: "colBarcode", width: "80", active: false, display: true },
    { index: 14, label: "Purchase Description", class: "colPurchaseDescription", width: "500", active: false, display: true },
    { index: 15, label: "Custom Field 1", class: "colProdCustField1", width: "120", active: false, display: true },
    { index: 16, label: "Custom Field 2", class: "colProdCustField2", width: "120", active: false, display: true },
    { index: 17, label: "Status", class: "colStatus", width: "120", active: true, display: true },
  ];

  templateObject.tableheaderrecords.set(headerStructure);
});

Template.wizard_inventory.onRendered(() => {});

Template.wizard_inventory.events({
  "click .btnRefresh": function () {
    $(".fullScreenSpin").css("display", "inline-block");
    var currentBeginDate = new Date();
    let fromDateMonth = currentBeginDate.getMonth() + 1;
    let fromDateDay = currentBeginDate.getDate();
    if (currentBeginDate.getMonth() + 1 < 10) {
      fromDateMonth = "0" + (currentBeginDate.getMonth() + 1);
    } else {
      fromDateMonth = currentBeginDate.getMonth() + 1;
    }

    if (currentBeginDate.getDate() < 10) {
      fromDateDay = "0" + currentBeginDate.getDate();
    }
    var fromDate = currentBeginDate.getFullYear() + "-" + fromDateMonth + "-" + fromDateDay;
    let prevMonth11Date = moment().subtract(6, "months").format("YYYY-MM-DD");

    sideBarService.getAllProductClassQtyData().then(function (data) {
      addVS1Data('TProductClassQuantity', JSON.stringify(data));
    }).catch(function (err) {

    });

    sideBarService
      .getProductStocknSaleReportData(prevMonth11Date, fromDate)
      .then(function (data) {
        addVS1Data("TProductStocknSalePeriodReport", JSON.stringify(data));
      })
      .catch(function (err) {});

    sideBarService
      .getNewProductListVS1(initialBaseDataLoad, 0)
      .then(function (dataProd) {
        addVS1Data("TProductVS1", JSON.stringify(dataProd))
          .then(function (datareturn) {})
          .catch(function (err) {});
      })
      .catch(function (err) {});

    sideBarService
      .getProductServiceListVS1(initialBaseDataLoad, 0)
      .then(function (data) {
        addVS1Data("TProductWeb", JSON.stringify(data));
        sideBarService
          .getProductListVS1(initialBaseDataLoad, 0)
          .then(function (dataProdList) {
            addVS1Data("TProductQtyList", JSON.stringify(dataProdList))
              .then(function (datareturn) {
                location.reload(true);
              })
              .catch(function (err) {
                location.reload(true);
              });
          })
          .catch(function (err) {
            location.reload(true);
          });
      })
      .catch(function (err) {
        sideBarService
          .getProductListVS1(initialBaseDataLoad, 0)
          .then(function (dataProdList) {
            addVS1Data("TProductQtyList", JSON.stringify(dataProdList))
              .then(function (datareturn) {
                location.reload(true);
              })
              .catch(function (err) {
                location.reload(true);
              });
          })
          .catch(function (err) {
            location.reload(true);
          });
      });
  },
  "click #btnNewProduct": function (e) {
    $($(e.currentTarget).attr("data-toggle")).modal("toggle");
    $("#view-in-active").html(
      "<button class='btn btn-danger btnDeleteProd vs1ButtonMargin' id='view-in-active' type='button'><i class='fa fa-trash' style='padding-right: 8px;'></i>Make In-Active</button>"
    );
  },
  "click #tblInventoryList tbody tr": (e) => {
    const status = $(e.currentTarget).closest("tr").find(".colStatus").text();
    let productId = $(e.currentTarget).closest("tr").find(".colProductID").text();
    let productName =  $(e.currentTarget).closest("tr").find(".colProductName").text();
    let salesDesc =  $(e.currentTarget).closest("tr").find(".colSalesDescription").text();
    if (productName == "") {
      swal("Please provide the product name !", "", "warning");
      e.preventDefault();
      return false;
    }
    $("#add-product-title").text("Edit Product");
    $("#edtproductname").val(productName);
    $("#edtproductname").prop("readonly", true);
    $("#selectProductID").val(productId);
    $("#txasalesdescription").val(salesDesc);
    if(status == "In-Active"){
      $('#view-in-active').html("<button class='btn btn-success btnActiveProd vs1ButtonMargin' id='view-in-active' type='button'><i class='fa fa-trash' style='padding-right: 8px;'></i>Make Active</button>");
    }else{
      $('#view-in-active').html("<button class='btn btn-danger btnDeleteProd vs1ButtonMargin' id='view-in-active' type='button'><i class='fa fa-trash' style='padding-right: 8px;'></i>Make In-Active</button>");
    }
    $("#addProductModal").modal("show");
  },
  "click .btnActiveProd": function () {
    $("#view-in-active").html(
      "<button class='btn btn-danger btnDeleteProd vs1ButtonMargin' id='view-in-active' type='button'><i class='fa fa-trash' style='padding-right: 8px;'></i>Make In-Active</button>"
    );
  },
  "click .btnDeleteProd": function () {
    $("#view-in-active").html(
      "<button class='btn btn-success btnActiveProd vs1ButtonMargin' id='view-in-active' type='button'><i class='fa fa-trash' style='padding-right: 8px;'></i>Make Active</button>"
    );
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
      "Product Type",
    ];
    rows[1] = [
      "TSL - Black",
      "T-Shirt Large Black",
      "600",
      "Sales",
      "NT",
      "",
      "T-Shirt Large Black",
      "Cost of Goods Sold",
      "NT",
      "700",
      "NONINV",
    ];
    rows[2] = [
      "TSL - Blue",
      "T-Shirt Large Blue",
      "600",
      "Sales",
      "NT",
      "",
      "T-Shirt Large Blue",
      "Cost of Goods Sold",
      "NT",
      "700",
      "INV",
    ];
    rows[3] = [
      "TSL - Yellow",
      "T-Shirt Large Yellow",
      "600",
      "Sales",
      "NT",
      "",
      "T-Shirt Large Yellow",
      "Cost of Goods Sold",
      "NT",
      "700",
      "OTHER",
    ];
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
  "change #attachment-upload": function (event) {
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
          var roa = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
            header: 1,
          });
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
            results.data[0][9] == "Cost" &&
            results.data[0][10] == "Product Type"
          ) {
            let dataLength = results.data.length * 3000;
            setTimeout(function () {
              var currentBeginDate = new Date();
              let fromDateMonth = currentBeginDate.getMonth() + 1;
              let fromDateDay = currentBeginDate.getDate();
              if (currentBeginDate.getMonth() + 1 < 10) {
                fromDateMonth = "0" + (currentBeginDate.getMonth() + 1);
              } else {
                fromDateMonth = currentBeginDate.getMonth() + 1;
              }

              if (currentBeginDate.getDate() < 10) {
                fromDateDay = "0" + currentBeginDate.getDate();
              }
              var fromDate = currentBeginDate.getFullYear() + "-" + fromDateMonth + "-" + fromDateDay;
              let prevMonth11Date = moment().subtract(6, "months").format("YYYY-MM-DD");

              sideBarService.getAllProductClassQtyData().then(function (data) {
                addVS1Data('TProductClassQuantity', JSON.stringify(data));
              }).catch(function (err) {

              });

              sideBarService
                .getProductStocknSaleReportData(prevMonth11Date, fromDate)
                .then(function (data) {
                  addVS1Data("TProductStocknSalePeriodReport", JSON.stringify(data));
                })
                .catch(function (err) {});

              sideBarService
                .getNewProductListVS1(initialBaseDataLoad, 0)
                .then(function (dataProd) {
                  addVS1Data("TProductVS1", JSON.stringify(dataProd))
                    .then(function (datareturn) {})
                    .catch(function (err) {});
                })
                .catch(function (err) {});

              sideBarService
                .getProductServiceListVS1(initialBaseDataLoad, 0)
                .then(function (data) {
                  addVS1Data("TProductWeb", JSON.stringify(data));
                  sideBarService
                    .getProductListVS1(initialBaseDataLoad, 0)
                    .then(function (dataProdList) {
                      addVS1Data("TProductQtyList", JSON.stringify(dataProdList))
                        .then(function (datareturn) {
                          location.reload(true);
                        })
                        .catch(function (err) {
                          location.reload(true);
                        });
                    })
                    .catch(function (err) {
                      location.reload(true);
                    });
                })
                .catch(function (err) {
                  sideBarService
                    .getProductListVS1(initialBaseDataLoad, 0)
                    .then(function (dataProdList) {
                      addVS1Data("TProductQtyList", JSON.stringify(dataProdList))
                        .then(function (datareturn) {
                          location.reload(true);
                        })
                        .catch(function (err) {
                          location.reload(true);
                        });
                    })
                    .catch(function (err) {
                      location.reload(true);
                    });
                });
            }, parseInt(dataLength));

            for (let i = 0; i < results.data.length - 1; i++) {
              objDetails = {
                type: "TProductVS1",
                fields: {
                  Active: true,
                  ProductType: results.data[i + 1][10] || "INV",
                  ProductPrintName: results.data[i + 1][0],
                  ProductName: results.data[i + 1][0],
                  SalesDescription: results.data[i + 1][1],
                  SellQty1Price: parseFloat(results.data[i + 1][2].replace(/[^0-9.-]+/g, "")) || 0,
                  IncomeAccount: results.data[i + 1][3],
                  TaxCodeSales: results.data[i + 1][4],
                  Barcode: results.data[i + 1][5],
                  PurchaseDescription: results.data[i + 1][6],
                  CogsAccount: results.data[i + 1][7],
                  TaxCodePurchase: results.data[i + 1][8],
                  BuyQty1Cost: parseFloat(results.data[i + 1][9].replace(/[^0-9.-]+/g, "")) || 0,
                  PublishOnVS1: true,
                },
              };
              if (results.data[i + 1][1]) {
                if (results.data[i + 1][1] !== "") {
                  productService
                    .saveProductVS1(objDetails)
                    .then(function (data) {})
                    .catch(function (err) {
                      swal({
                        title: "Oooops...",
                        text: err,
                        type: "error",
                        showCancelButton: false,
                        confirmButtonText: "Try Again",
                      }).then((result) => {
                        if (result.value) {
                          location.reload(true);
                        } else if (result.dismiss === "cancel") {}
                      });
                    });
                }
              }
            }
          } else {
            $(".fullScreenSpin").css("display", "none");
            // Bert.alert('<strong> Data Mapping fields invalid. </strong> Please check that you are importing the correct file with the correct column headers.', 'danger');
            swal(
              "Invalid Data Mapping fields ",
              "Please check that you are importing the correct file with the correct column headers.",
              "error"
            );
          }
        } else {
          $(".fullScreenSpin").css("display", "none");
          // Bert.alert('<strong> Data Mapping fields invalid. </strong> Please check that you are importing the correct file with the correct column headers.', 'danger');
          swal(
            "Invalid Data Mapping fields ",
            "Please check that you are importing the correct file with the correct column headers.",
            "error"
          );
        }
      },
    });
  },
});

Template.wizard_inventory.helpers({
  datatablerecords: () => {
    return Template.instance().datatablerecords.get();

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
      PrefName: "tblInventoryList",
    });
  },
  productsCloudPreferenceRec: () => {
    return CloudPreference.findOne({
      userid: localStorage.getItem("mycloudLogonID"),
      PrefName: "productview",
    });
  },
  taxraterecords: () => {
    return Template.instance().taxraterecords.get();
  },
  coggsaccountrecords: () => {
    return Template.instance().coggsaccountrecords.get();
  },
  salesaccountrecords: () => {
    return Template.instance().salesaccountrecords.get();
  },
  
  isProductList: () => {
    return Template.instance().isProductList.get();
  },
  isNewProduct: () => {
    return Template.instance().isNewProduct.get();
  },
  isNewStockTransfer: () => {
    return Template.instance().isNewStockTransfer.get();
  },
  isExportProduct: () => {
    return Template.instance().isExportProduct.get();
  },
  isImportProduct: () => {
    return Template.instance().isImportProduct.get();
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
    let sideBarService = new SideBarService();
    return sideBarService.getProductListVS1;
  },

  searchAPI: function() {
    return sideBarService.getProductListVS1ByName;
  },

  service: ()=>{
    let sideBarService = new SideBarService();
    return sideBarService;
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
});