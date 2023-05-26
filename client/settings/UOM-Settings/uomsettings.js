import { TaxRateService } from "../settings-service";
import { ReactiveVar } from "meteor/reactive-var";
import { SideBarService } from "../../js/sidebar-service";
import { ContactService } from "../../contacts/contact-service";
import { UtilityService } from "../../utility-service";
import "../../lib/global/indexdbstorage.js";
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import "./uomsettings.html";
import XLSX from "xlsx";
let sideBarService = new SideBarService();
let taxRateService = new TaxRateService();

Template.uomSettings.inheritsHooksFrom("non_transactional_list");
Template.uomSettings.onCreated(function () {
  const templateObject = Template.instance();
  templateObject.datatablerecords = new ReactiveVar([]);
  templateObject.tableheaderrecords = new ReactiveVar([]);

  templateObject.deptrecords = new ReactiveVar();

  templateObject.includeSalesDefault = new ReactiveVar();
  templateObject.includeSalesDefault.set(false);
  templateObject.includePurchaseDefault = new ReactiveVar();
  templateObject.includePurchaseDefault.set(false);
  templateObject.selectedFile = new ReactiveVar();

  templateObject.getDataTableList = function(data) {
    let linestatus = "";
    let tdSalesDef = ""; //isSalesdefault
    let tdPurchaseDef = ""; //isPurchasedefault
    let tdUseforAutoSplitQtyinSales = ""; //UseforAutoSplitQtyinSales
    if (data.Active == true) {
      linestatus = "";
    } else if (data.Active == false) {
      linestatus = "In-Active";
    }

    //Check if Sales defaultis checked
    if (data.SalesDefault == true) {
      tdSalesDef =
          '<span style="display:none;">'+(data.SalesDefault)+'</span><div class="custom-control custom-switch chkBox text-center"><input class="custom-control-input chkBox" type="checkbox" id="swtSalesDefault-' +
          data.UnitID +
          '" checked><label class="custom-control-label chkBox" for="swtSalesDefault-' +
          data.UnitID +
          '"></label></div>';
    } else {
      tdSalesDef =
          '<span style="display:none;">'+(data.SalesDefault)+'</span><div class="custom-control custom-switch chkBox text-center"><input class="custom-control-input chkBox" type="checkbox" id="swtSalesDefault-' +
          data.UnitID +
          '"><label class="custom-control-label chkBox" for="swtSalesDefault-' +
          data.UnitID +
          '"></label></div>';
    }
    //Check if Purchase default is checked
    if (data.PurchasesDefault == true) {
      tdPurchaseDef =
          '<span style="display:none;">'+(data.PurchasesDefault)+'</span><div class="custom-control custom-switch chkBox text-center"><input class="custom-control-input chkBox" type="checkbox" id="swtPurchaseDefault-' +
          data.UnitID +
          '" checked><label class="custom-control-label chkBox" for="swtPurchaseDefault-' +
          data.UnitID +
          '"></label></div>';
    } else {
      tdPurchaseDef =
          '<span style="display:none;">'+(data.PurchasesDefault)+'</span><div class="custom-control custom-switch chkBox text-center"><input class="custom-control-input chkBox" type="checkbox" id="swtPurchaseDefault-' +
          data.UnitID +
          '"><label class="custom-control-label chkBox" for="swtPurchaseDefault-' +
          data.UnitID +
          '"></label></div>';
    }

    //Check if UseforAutoSplitQtyinSales is checked
    if (data.UseforAutoSplitQtyinSales == true) {
      tdUseforAutoSplitQtyinSales =
          '<span style="display:none;">'+(data.UseforAutoSplitQtyinSales)+'</span><div class="custom-control custom-switch chkBox text-center"><input class="custom-control-input chkBox" type="checkbox" id="swtPurchaseDefault-' +
          data.UnitID +
          '" checked><label class="custom-control-label chkBox" for="swtPurchaseDefault-' +
          data.UnitID +
          '"></label></div>';
    } else {
      tdUseforAutoSplitQtyinSales =
          '<span style="display:none;">'+(data.UseforAutoSplitQtyinSales)+'</span><div class="custom-control custom-switch chkBox text-center"><input class="custom-control-input chkBox" type="checkbox" id="swtPurchaseDefault-' +
          data.UnitID +
          '"><label class="custom-control-label chkBox" for="swtPurchaseDefault-' +
          data.UnitID +
          '"></label></div>';
    }

    var dataList = [
      data.UnitID || "",
      data.UOMName || data.UnitName || "",
      data.UnitDescription || "",
      data.UnitProductKeyName || "",
      data.BaseUnitName || "",
      data.BaseUnitID || "",
      data.PartID || "",
      data.Multiplier || 0,
      tdSalesDef,
      tdPurchaseDef,
      data.Weight || 0,
      data.NoOfBoxes || 0,
      data.Height || 0,
      data.Width || 0,
      data.Length || 0,
      data.Volume || 0,
      tdUseforAutoSplitQtyinSales,
      linestatus,
    ];
    return dataList;
  }

  let headerStructure = [
    { index: 0, label: 'ID', class: 'colUOMID', active: false, display: true, width: "20" },
    { index: 1, label: 'Unit Name', class: 'colUOMName', active: true, display: true, width: "200" },
    { index: 2, label: 'Description', class: 'colUOMDesc', active: true, display: true, width: "700" },
    { index: 3, label: 'Product Name', class: 'colUOMProduct', active: false, display: true, width: "200" },
    { index: 4, label: 'Base Unit Name', class: 'colUOMBaseUnitName', active: false, display: true, width: "200" },
    { index: 5, label: 'Base Unit ID', class: 'colUOMBaseUnitID', active: false, display: true, width: "95" },
    { index: 6, label: 'Part ID', class: 'colUOMPartID', active: false, display: true, width: "60" },
    { index: 7, label: 'Unit Multiplier', class: 'colUOMMultiplier', active: true, display: true, width: "180" },
    { index: 8, label: 'Sale Default', class: 'colUOMSalesDefault', active: true, display: true, width: "160" },
    { index: 9, label: 'Purchase Default', class: 'colUOMPurchaseDefault', active: true, display: true, width: "200" },
    { index: 10, label: 'Weight', class: 'colUOMWeight', active: false, display: true, width: "60" },
    { index: 11, label: 'No of Boxes', class: 'colUOMNoOfBoxes', active: false, display: true, width: "95" },
    { index: 12, label: 'Height', class: 'colUOMHeight', active: false, display: true, width: "55" },
    { index: 13, label: 'Width', class: 'colUOMWidth', active: false, display: true, width: "50" },
    { index: 14, label: 'Length', class: 'colUOMLength', active: false, display: true, width: "55" },
    { index: 15, label: 'Volume', class: 'colUOMVolume', active: false, display: true, width: "60" },
    { index: 16, label: 'Qty in Sales', class: 'colQtyinSales', active: false, display: true, width: "90" },
    { index: 17, label: 'Status', class: 'colStatus', active: true, display: true, width: "120" },
  ];
  templateObject.tableheaderrecords.set(headerStructure);
});

Template.uomSettings.onRendered(function () {
  $(".fullScreenSpin").css("display", "inline-block");
  let templateObject = Template.instance();
  let taxRateService = new TaxRateService();
  const dataTableList = [];
  const tableHeaderList = [];
  const deptrecords = [];
  let deptprodlineItems = [];

  $("#tblUOMList tbody").on("click", "td.colUOMName, td.colUOMDesc, td.colUOMMultiplier", function (event) {
    var isSalesDefault = false;
    var isPurchaseDefault = false;
    $("#add-uom-title").text("Edit UOM");
    var uomID = $(this).closest("tr").find(".colUOMID").text();
    var uomName =
      $(event.target).closest("tr").find(".colUOMName").text() || "";
    var uomDescription =
      $(event.target).closest("tr").find(".colUOMDesc").text() || "";
    var uomProduct =
      $(event.target).closest("tr").find(".colUOMProduct").text() || "";
    var unitMultiplier =
      $(event.target).closest("tr").find(".colUOMMultiplier").text() || 0;
    var uomWeight =
      $(event.target).closest("tr").find(".colUOMWeight").text() || 0;
    var uomNoOfBoxes =
      $(event.target).closest("tr").find(".colUOMNoOfBoxes").text() || 0;
    var uomLength =
      $(event.target).closest("tr").find(".colUOMHeight").text() || 0;
    var uomWidth =
      $(event.target).closest("tr").find(".colUOMWidth").text() || 0;
    var uomLength =
      $(event.target).closest("tr").find(".colUOMLength").text() || 0;
    var uomVolume =
      $(event.target).closest("tr").find(".colUOMVolume").text() || 0;
    var status = $(event.target).closest("tr").find(".colStatus").text() || 0;

    if (
      $(event.target)
        .closest("tr")
        .find(".colUOMSalesDefault input.chkBox")
        .is(":checked")
    ) {
      isSalesDefault = true;
    }
    if (
      $(event.target)
        .closest("tr")
        .find(".colUOMPurchaseDefault input.chkBox")
        .is(":checked")
    ) {
      isPurchaseDefault = true;
    }

    if (isSalesDefault == true) {
      templateObject.includeSalesDefault.set(true);
    } else {
      templateObject.includeSalesDefault.set(false);
    }

    if (isPurchaseDefault == true) {
      templateObject.includePurchaseDefault.set(true);
    } else {
      templateObject.includePurchaseDefault.set(false);
    }

    $("#edtUOMID").val(uomID);
    $("#edtUnitName").val(uomName);
    $("#edtUnitName").prop("readonly", true);
    $("#txaUnitDescription").val(uomDescription);
    $("#sltProduct").val(uomProduct);
    $("#edtUnitMultiplier").val(unitMultiplier);
    $("#swtSalesDefault").prop('checked', isSalesDefault);
    $("#swtPurchaseDefault").prop('checked', isPurchaseDefault);
    $("#edtUnitWeight").val(uomWeight);
    $("#edtNoOfBoxes").val(uomNoOfBoxes);
    $("#edtHeight").val(uomNoOfBoxes);
    $("#edtWidth").val(uomNoOfBoxes);
    $("#edtLength").val(uomNoOfBoxes);
    $("#edtVolume").val(uomNoOfBoxes);
    $("#newUomModal").modal("show");

    //Make btnDelete "Make Active or In-Active"
    if (status == "In-Active") {
      $("#view-in-active").html(
        "<button class='btn btn-success btnActivateUOM vs1ButtonMargin' id='view-in-active' type='button'><i class='fa fa-trash' style='padding-right: 8px;'></i>Make Active</button>"
      );
    } else {
      $("#view-in-active").html(
        "<button class='btn btn-danger btnDeleteUOM vs1ButtonMargin' id='view-in-active' type='button'><i class='fa fa-trash' style='padding-right: 8px;'></i>Make In-Active</button>"
      );
    }
  });

  $("#tblUOMList").on('change', ' td.colUOMSalesDefault input', function() {
    let uomID = $(this).closest("tr").attr("id");
    if ($(this).is(':checked')){
      $(`#tblUOMList tr:not(#${uomID}) td.colUOMSalesDefault input`).prop('checked', false);
    }
  })

  $("#tblUOMList").on('change', ' td.colUOMPurchaseDefault input', function() {
    let uomID = $(this).closest("tr").attr("id");
    if ($(this).is(':checked')){
      $(`#tblUOMList tr:not(#${uomID}) td.colUOMPurchaseDefault input`).prop('checked', false);
    }
  })
});

Template.uomSettings.events({
  "click .btnRefresh": function () {
    $(".fullScreenSpin").css("display", "inline-block");
    sideBarService
      .getUOMDataList()
      .then(function (dataReload) {
        addVS1Data("TUnitOfMeasureList", JSON.stringify(dataReload))
          .then(function (datareturn) {
            window.open("/uomSettings", "_self");
          })
          .catch(function (err) {
            window.open("/uomSettings", "_self");
          });
      })
      .catch(function (err) {
        window.open("/uomSettings", "_self");
      });
  },
  "click .btnDeleteUOM": function () {
    playDeleteAudio();
    let taxRateService = new TaxRateService();
    setTimeout(function () {
      let uomId = $("#edtUOMID").val();
      let objDetails = {
        type: "TUnitOfMeasure",
        fields: {
          ID: parseInt(uomId),
          Active: false,
        },
      };

      taxRateService
        .saveUOM(objDetails)
        .then(function (result) {
          sideBarService
            .getUOMVS1()
            .then(function (dataReload) {
              addVS1Data("TUnitOfMeasure", JSON.stringify(dataReload))
                .then(function (datareturn) {
                  sideBarService
                    .getUOMDataList(initialBaseDataLoad, 0, false)
                    .then(async function (dataUOMList) {
                      await addVS1Data(
                        "TUnitOfMeasureList",
                        JSON.stringify(dataUOMList)
                      )
                        .then(function (datareturn) {
                          location.reload(true)
                        })
                        .catch(function (err) {
                          location.reload(true)
                        });
                    })
                    .catch(function (err) {
                      location.reload(true)
                    });
                })
                .catch(function (err) {
                  location.reload(true)
                });
            })
            .catch(function (err) {
              location.reload(true)
            });
        })
        .catch(function (err) {
          swal({
            title: "Oooops...",
            text: err,
            type: "error",
            showCancelButton: false,
            confirmButtonText: "Try Again",
          }).then((result) => {
            if (result.value) {
              location.reload(true)
            } else if (result.dismiss === "cancel") {
            }
          });
          $(".fullScreenSpin").css("display", "none");
        });
    }, delayTimeAfterSound);
  },
  "click .btnActivateUOM": function () {
    playSaveAudio();
    setTimeout(function () {
      $(".fullScreenSpin").css("display", "inline-block");
      let objDetails = "";
      let uomID = $("#edtUOMID").val();
      let uomName = $("#edtUnitName").val() || "";
      let uomDescription = $("#txaUnitDescription").val() || "";
      let uomProduct = $("#sltProduct").val() || "";
      let uomMultiplier = $("#edtUnitMultiplier").val() || 0;
      let uomWeight = $("#edtUnitWeight").val() || 0;
      let uomNonOfBoxes = $("#edtNoOfBoxes").val() || 0;
      let uomHeight = $("#edtHeight").val() || 0;
      let uomWidth = $("#edtWidth").val() || 0;
      let uomLength = $("#edtLength").val() || 0;
      let uomVolume = $("#edtVolume").val() || 0;

      let isSalesdefault = false;
      let isPurchasedefault = false;

      if ($("#swtSalesDefault").is(":checked")) {
        isSalesdefault = true;
      } else {
        isSalesdefault = false;
      }

      if ($("#swtPurchaseDefault").is(":checked")) {
        isPurchasedefault = true;
      } else {
        isPurchasedefault = false;
      }

      objDetails = {
        type: "TUnitOfMeasure",
        fields: {
          ID: parseInt(uomID),
          UOMName: uomName,
          UnitDescription: uomDescription,
          ProductName: uomProduct,
          Multiplier: parseFloat(uomMultiplier) || 0,
          PurchasesDefault: isPurchasedefault,
          SalesDefault: isSalesdefault,
          Weight: parseFloat(uomWeight) || 0,
          NoOfBoxes: parseFloat(uomNonOfBoxes) || 0,
          Height: parseFloat(uomHeight) || 0,
          Length: parseFloat(uomLength) || 0,
          Width: parseFloat(uomWidth) || 0,
          Volume: parseFloat(uomVolume) || 0,
          Active: true,
        },
      };
      taxRateService
        .saveUOM(objDetails)
        .then(function (result) {
          sideBarService
            .getUOMVS1()
            .then(function (dataReload) {
              addVS1Data("TUnitOfMeasure", JSON.stringify(dataReload))
                .then(function (datareturn) {
                  sideBarService
                    .getUOMDataList(initialBaseDataLoad, 0, false)
                    .then(async function (dataUOMList) {
                      await addVS1Data(
                        "TUnitOfMeasureList",
                        JSON.stringify(dataUOMList)
                      )
                        .then(function (datareturn) {
                          location.reload(true)
                        })
                        .catch(function (err) {
                          location.reload(true)
                        });
                    })
                    .catch(function (err) {
                      location.reload(true)
                    });
                })
                .catch(function (err) {
                  location.reload(true)
                });
            })
            .catch(function (err) {
              location.reload(true)
            });
        })
        .catch(function (err) {
          swal({
            title: "Oooops...",
            text: err,
            type: "error",
            showCancelButton: false,
            confirmButtonText: "Try Again",
          }).then((result) => {
            if (result.value) {
              location.reload(true)
            } else if (result.dismiss === "cancel") {
            }
          });
          $(".fullScreenSpin").css("display", "none");
        });
    }, delayTimeAfterSound);
  },
  "click .btnAddUOM": function () {
    let templateObject = Template.instance();
    $("#add-uom-title").text("Add New UOM");
    $("#edtUOMID").val("");
    $("#edtUnitName").val("");
    $("#edtUnitName").prop("readonly", false);
    $("#txaUnitDescription").val("");
    $("#sltProduct").val("");
    $("#edtUnitMultiplier").val("");
    $("#swtSalesDefault").val("");
    $("#swtPurchaseDefault").val("");
    $("#edtUnitWeight").val("");
    $("#edtNoOfBoxes").val("");
    $("#edtHeight").val("");
    $("#edtWidth").val("");
    $("#edtLength").val("");
    $("#edtVolume").val("");
    $("#view-in-active").html(
      "<button class='btn btn-danger btnDeleteUOM vs1ButtonMargin' id='view-in-active' type='button'><i class='fa fa-trash' style='padding-right: 8px;'></i>Make In-Active</button>"
    );

    templateObject.includePurchaseDefault.set(false);
    templateObject.includeSalesDefault.set(false);
  },
  "click .btnBack": function (event) {
    playCancelAudio();
    event.preventDefault();
    setTimeout(function () {
      history.back(1);
    }, delayTimeAfterSound);
  },
  // Import here
  "click .templateDownload": function () {
    let utilityService = new UtilityService();
    let rows = [];
    const filename = "SampleUOMSettings" + ".csv";
    rows[0] = [
      "Unit",
      "Description",
      "Product Name",
      "Unit Multiplier",
      "Sales Default",
      "Purchases Default",
      "Weight",
      "No. of Boxes",
      "Height",
      "Width",
      "Volume",
    ];
    rows[1] = [
      "ABC",
      "ABC123",
      "DEF",
      "0",
      "false",
      "false",
      "0",
      "0",
      "0",
      "0",
      "0",
    ];
    utilityService.exportToCsv(rows, filename, "csv");
  },
  "click .templateDownloadXLSX": function (e) {
    e.preventDefault(); //stop the browser from following
    window.location.href = "sample_imports/SampleUOMSettings.xlsx";
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
      swal(
        "Invalid Format",
        "formats allowed are :" + validExtensions.join(", "),
        "error"
      );
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
    let taxRateService = new TaxRateService();
    let objDetails;

    var filename = $("#attachment-upload")[0].files[0]["name"];
    var fileType = filename.split(".").pop().toLowerCase();

    if (fileType == "csv" || fileType == "txt" || fileType == "xlsx") {
      Papa.parse(templateObject.selectedFile.get(), {
        complete: function (results) {
          if (results.data.length > 0) {
            if (
              results.data[0][0] == "Unit" &&
              results.data[0][1] == "Description" &&
              results.data[0][2] == "Product Name" &&
              results.data[0][3] == "Unit Multiplier" &&
              results.data[0][4] == "Sales Default" &&
              results.data[0][5] == "Purchases Default" &&
              results.data[0][6] == "Weight" &&
              results.data[0][7] == "No. of Boxes" &&
              results.data[0][8] == "Height" &&
              results.data[0][9] == "Width" &&
              results.data[0][10] == "Volume"
            ) {
              let dataLength = results.data.length * 500;
              setTimeout(function () {
                sideBarService.getUOMVS1().then(function (dataReload) {
                  addVS1Data('TUnitOfMeasure', JSON.stringify(dataReload))
                      .then(function (datareturn) {
                        window.open("/uomSettings", "_self");
                      })
                      .catch(function (err) {
                        window.open("/uomSettings", "_self");
                      });
                }).catch(function(err){
                  window.open("/uomSettings", "_self");
                });
              }, parseInt(dataLength));
  
              for (let i = 0; i < results.data.length - 1; i++) {
                objDetails = {
                  type: "TUnitOfMeasure",
                  fields: {
                    UOMName: results.data[i + 1][0] || "",
                    UnitDescription: results.data[i + 1][1] || "",
                    ProductName: results.data[i + 1][2] || "",
                    Multiplier: parseFloat(results.data[i + 1][3]) || 0,
                    PurchasesDefault: results.data[i + 1][5] == "FALSE" ? false : true,
                    SalesDefault: results.data[i + 1][4] == "FALSE" ? false : true,
                    Weight: parseFloat(results.data[i + 1][6]) || 0,
                    NoOfBoxes: parseFloat(results.data[i + 1][7]) || 0,
                    Height: parseFloat(results.data[i + 1][8]) || 0,
                    Width: parseFloat(results.data[i + 1][9]) || 0,
                    Volume: parseFloat(results.data[i + 1][10]) || 0,
                    Active: true,
                  },
                };
                if (results.data[i + 1][1]) {
                  if (results.data[i + 1][1] !== "") {
                    taxRateService
                      .saveUOM(objDetails)
                      .then(function (data) {})
                      .catch(function (err) {
                        // $('.fullScreenSpin').css('display','none');
                        swal({
                          title: "Oooops...",
                          text: err,
                          type: "error",
                          showCancelButton: false,
                          confirmButtonText: "Try Again",
                        }).then((result) => {
                          if (result.value) {
                            window.open("/uomSettings", "_self");
                          } else if (result.dismiss === "cancel") {}
                        });
                      });
                  }
                }
              }
            } else {
              $(".fullScreenSpin").css("display", "none");
              swal(
                "Invalid Data Mapping fields ",
                "Please check that you are importing the correct file with the correct column headers.",
                "error"
              );
            }
          } else {
            $(".fullScreenSpin").css("display", "none");
            swal(
              "Invalid Data Mapping fields ",
              "Please check that you are importing the correct file with the correct column headers.",
              "error"
            );
          }
        },
      });
    }
  },
});

Template.uomSettings.helpers({
  datatablerecords: () => {
    return Template.instance()
      .datatablerecords.get()
      .sort(function (a, b) {
        if (a.uomname == "NA") {
          return 1;
        } else if (b.uomname == "NA") {
          return -1;
        }
        return a.uomname.toUpperCase() > b.uomname.toUpperCase() ? 1 : -1;
      });
  },
  tableheaderrecords: () => {
    return Template.instance().tableheaderrecords.get();
  },
  salesCloudPreferenceRec: () => {
    return CloudPreference.findOne({
      userid: localStorage.getItem("mycloudLogonID"),
      PrefName: "tblUOMList",
    });
  },
  includeSalesDefault: () => {
    return Template.instance().includeSalesDefault.get();
  },
  includePurchaseDefault: () => {
    return Template.instance().includePurchaseDefault.get();
  },
  loggedCompany: () => {
    return localStorage.getItem("mySession") || "";
  },

  apiFunction:function() {
    let sideBarService = new SideBarService();
    return sideBarService.getUOMDataList;
  },

  searchAPI: function() {
    return sideBarService.getUOMVS1ByName;
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

Template.registerHelper("equals", function (a, b) {
  return a === b;
});
