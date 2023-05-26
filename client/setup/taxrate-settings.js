// @ts-nocheck
import "./taxrate-settings.html";
import { ReactiveVar } from "meteor/reactive-var";
import { Template } from "meteor/templating";
import { SideBarService } from "../js/sidebar-service";
import { UtilityService } from "../utility-service";
import { TaxRateService } from "../settings/settings-service";
import { FlowRouter } from "meteor/ostrio:flow-router-extra";
import XLSX from "xlsx";
import "../lib/global/indexdbstorage.js";

let sideBarService = new SideBarService();
let taxRateService = new TaxRateService();

Template.wizard_taxrate.onCreated(() => {
  const templateObject = Template.instance();
  templateObject.defaultpurchasetaxcode = new ReactiveVar();
  templateObject.defaultsaletaxcode = new ReactiveVar();

  templateObject.isChkUSRegionTax = new ReactiveVar(false);

  templateObject.subtaxcodes = new ReactiveVar([]);
  templateObject.subtaxlines = new ReactiveVar([]);

  templateObject.tableheaderrecords = new ReactiveVar([]);
  templateObject.selectedFile = new ReactiveVar();

  templateObject.getDataTableList = function (data) {
    let taxRate = (data.fields.Rate * 100).toFixed(2) + "%";
    let tdPurchaseDef = "";
    let tdSalesDef = "";
    // Check if Purchase Default is checked
    if (data.fields.IsDefaultPurchase == true) {
      tdPurchaseDef =
        '<span style="display:none;">' +
        data.fields.IsDefaultPurchase +
        '</span><div class="custom-control custom-switch chkBox text-center"><input class="custom-control-input chkBox" type="checkbox" id="isPurchasedefault-' +
        data.fields.ID +
        '" checked><label class="custom-control-label chkBox" for="isPurchasedefault-' +
        data.fields.ID +
        '"></label></div>';
    } else {
      tdPurchaseDef =
        '<span style="display:none;">' +
        data.fields.IsDefaultPurchase +
        '</span><div class="custom-control custom-switch chkBox text-center"><input class="custom-control-input chkBox" type="checkbox" id="isPurchasedefault-' +
        data.fields.ID +
        '"><label class="custom-control-label chkBox" for="isPurchasedefault-' +
        data.fields.ID +
        '"></label></div>';
    }
    // Check if Sales Default is checked
    if (data.fields.IsDefaultSales == true) {
      tdSalesDef =
        '<span style="display:none;">' +
        data.fields.IsDefaultSales +
        '</span><div class="custom-control custom-switch chkBox text-center"><input class="custom-control-input chkBox" type="checkbox" id="isSalesdefault-' +
        data.fields.ID +
        '" checked><label class="custom-control-label chkBox" for="isSalesdefault-' +
        data.fields.ID +
        '"></label></div>';
    } else {
      tdSalesDef =
        '<span style="display:none;">' +
        data.fields.IsDefaultSales +
        '</span><div class="custom-control custom-switch chkBox text-center"><input class="custom-control-input chkBox" type="checkbox" id="isSalesdefault-' +
        data.fields.ID +
        '"><label class="custom-control-label chkBox" for="isSalesdefault-' +
        data.fields.ID +
        '"></label></div>';
    }
    let dataList = [
      data.fields.ID || "",
      data.fields.CodeName || "",
      data.fields.Description || "",
      taxRate || "",
      tdPurchaseDef,
      tdSalesDef,
      data.fields.Active ? "" : "In-Active",
    ];
    return dataList;
  };

  let headerStructure = [
    { index: 0, label: "Id", class: "colTaxRateId", active: false, display: true, width: "20" },
    { index: 1, label: "Name", class: "colTaxRateName", active: true, display: true, width: "200" },
    { index: 2, label: "Description", class: "colTaxRateDesc", active: true, display: true, width: "500" },
    { index: 3, label: "Rate", class: "colTaxRate", active: true, display: true, width: "80" },
    { index: 4, label: "Purchase Default", class: "colTaxRatePurchaseDefault", active: true, display: true, width: "140" },
    { index: 5, label: "Sales Default", class: "colTaxRateSalesDefault", active: true, display: true, width: "140" },
    { index: 6, label: "Status", class: "colStatus", active: true, display: true, width: "120" },
  ];
  templateObject.tableheaderrecords.set(headerStructure);
});

Template.wizard_taxrate.onRendered(() => {});

Template.wizard_taxrate.events({
  "click .btnRefreshTaxRate": function () {
    $(".fullScreenSpin").css("display", "inline-block");
    sideBarService
      .getTaxRateVS1()
      .then(function (dataReload) {
        addVS1Data("TTaxcodeVS1", JSON.stringify(dataReload))
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
  },
  "click .btnSaveTaxRate": function () {
    playSaveAudio();
    let taxRateService = new TaxRateService();
    setTimeout(function () {
      $(".fullScreenSpin").css("display", "inline-block");
      var url = FlowRouter.current().path;

      let taxSelected = $("#taxSelected").val();
      let taxtID = $("#edtTaxID").val();
      let taxName = $("#edtTaxName").val();
      let taxDesc = $("#edtTaxDesc").val();
      let taxRate = parseFloat($("#edtTaxRate").val() / 100);
      let active = $("#view-in-active button").hasClass("btnDeleteTaxRate");
      let objDetails = "";
      if (taxName === "") {
        Bert.alert("<strong>WARNING:</strong> Tax Rate cannot be blank!", "warning");
        $(".fullScreenSpin").css("display", "none");
        e.preventDefault();
      }

      if (taxtID === "") {
        taxRateService
          .checkTaxRateByName(taxName)
          .then(function (data) {
            taxtID = data.ttaxcode[0].Id;
            objDetails = {
              type: "TTaxcode",
              fields: {
                ID: parseInt(taxtID),
                Active: active,
                CodeName: taxName,
                Description: taxDesc,
                Rate: taxRate,
                PublishOnVS1: true,
              },
            };
            taxRateService
              .saveTaxRate(objDetails)
              .then(function (objDetails) {
                sideBarService
                  .getTaxRateVS1()
                  .then(function (dataReload) {
                    addVS1Data("TTaxcodeVS1", JSON.stringify(dataReload))
                      .then(function (datareturn) {
                        if (url.includes("/productview")) {
                          if (taxSelected === "sales") {
                            $("#slttaxcodesales").val(taxName);
                          } else if (taxSelected === "purchase") {
                            $("#slttaxcodepurchase").val(taxName);
                          } else {
                            $("#sltTaxCode").val(taxName);
                          }
                        }

                        if (url.includes("/accountsoverview")) {
                          $("#sltTaxCode").val(taxName);
                        }
                        $("#newTaxRateModal").modal("toggle");
                        $(".fullScreenSpin").css("display", "none");
                        location.reload(true);
                      })
                      .catch(function (err) {
                        if (url.includes("/productview")) {
                          if (taxSelected === "sales") {
                            $("#slttaxcodesales").val(taxName);
                          } else if (taxSelected === "purchase") {
                            $("#slttaxcodepurchase").val(taxName);
                          } else {
                            $("#sltTaxCode").val(taxName);
                          }
                        }

                        if (url.includes("/accountsoverview")) {
                          $("#sltTaxCode").val(taxName);
                        }
                        $("#newTaxRateModal").modal("toggle");
                        $(".fullScreenSpin").css("display", "none");
                      });
                  })
                  .catch(function (err) {
                    if (url.includes("/productview")) {
                      if (taxSelected === "sales") {
                        $("#slttaxcodesales").val(taxName);
                      } else if (taxSelected === "purchase") {
                        $("#slttaxcodepurchase").val(taxName);
                      } else {
                        $("#sltTaxCode").val(taxName);
                      }
                    }
                    if (url.includes("/accountsoverview")) {
                      $("#sltTaxCode").val(taxName);
                    }
                    $("#newTaxRateModal").modal("toggle");
                    $(".fullScreenSpin").css("display", "none");
                  });
                var selectLineID = $("#selectLineID").val();
                if (selectLineID) {
                  $("#" + selectLineID + " .lineTaxCode").val(taxName);
                }
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
                    // Meteor._reload.reload();
                    $("#newTaxRateModal").modal("toggle");
                    $(".fullScreenSpin").css("display", "none");
                  } else if (result.dismiss === "cancel") {
                  }
                });
                $(".fullScreenSpin").css("display", "none");
              });
          })
          .catch(function (err) {
            objDetails = {
              type: "TTaxcode",
              fields: {
                // Id: taxCodeId,
                Active: active,
                CodeName: taxName,
                Description: taxDesc,
                Rate: taxRate,
                PublishOnVS1: true,
              },
            };

            taxRateService
              .saveTaxRate(objDetails)
              .then(function (objDetails) {
                sideBarService
                  .getTaxRateVS1()
                  .then(function (dataReload) {
                    addVS1Data("TTaxcodeVS1", JSON.stringify(dataReload))
                      .then(function (datareturn) {
                        if (url.includes("/productview")) {
                          if (taxSelected === "sales") {
                            $("#slttaxcodesales").val(taxName);
                          } else if (taxSelected === "purchase") {
                            $("#slttaxcodepurchase").val(taxName);
                          } else {
                            $("#sltTaxCode").val(taxName);
                          }
                        }
                        if (url.includes("/accountsoverview")) {
                          $("#sltTaxCode").val(taxName);
                        }
                        $("#newTaxRateModal").modal("toggle");
                        $(".fullScreenSpin").css("display", "none");
                        location.reload(true);
                      })
                      .catch(function (err) {
                        if (url.includes("/productview")) {
                          if (taxSelected === "sales") {
                            $("#slttaxcodesales").val(taxName);
                          } else if (taxSelected === "purchase") {
                            $("#slttaxcodepurchase").val(taxName);
                          } else {
                            $("#sltTaxCode").val(taxName);
                          }
                        }
                        if (url.includes("/accountsoverview")) {
                          $("#sltTaxCode").val(taxName);
                        }
                        $("#newTaxRateModal").modal("toggle");
                        $(".fullScreenSpin").css("display", "none");
                      });
                  })
                  .catch(function (err) {
                    if (url.includes("/productview")) {
                      if (taxSelected === "sales") {
                        $("#slttaxcodesales").val(taxName);
                      } else if (taxSelected === "purchase") {
                        $("#slttaxcodepurchase").val(taxName);
                      } else {
                        $("#sltTaxCode").val(taxName);
                      }
                    }
                    if (url.includes("/accountsoverview")) {
                      $("#sltTaxCode").val(taxName);
                    }
                    $("#newTaxRateModal").modal("toggle");
                    $(".fullScreenSpin").css("display", "none");
                  });
                var selectLineID = $("#selectLineID").val();
                if (selectLineID) {
                  $("#" + selectLineID + " .lineTaxCode").val(taxName);
                }
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
                    // Meteor._reload.reload();
                    $("#newTaxRateModal").modal("toggle");
                    $(".fullScreenSpin").css("display", "none");
                  } else if (result.dismiss === "cancel") {
                  }
                });
                $(".fullScreenSpin").css("display", "none");
              });
          });
      } else {
        objDetails = {
          type: "TTaxcode",
          fields: {
            ID: parseInt(taxtID),
            Active: active,
            CodeName: taxName,
            Description: taxDesc,
            Rate: taxRate,
            PublishOnVS1: true,
          },
        };
        taxRateService
          .saveTaxRate(objDetails)
          .then(function (objDetails) {
            sideBarService
              .getTaxRateVS1()
              .then(function (dataReload) {
                addVS1Data("TTaxcodeVS1", JSON.stringify(dataReload))
                  .then(function (datareturn) {
                    if (url.includes("/productview")) {
                      if (taxSelected === "sales") {
                        $("#slttaxcodesales").val(taxName);
                      } else if (taxSelected === "purchase") {
                        $("#slttaxcodepurchase").val(taxName);
                      } else {
                        $("#sltTaxCode").val(taxName);
                      }
                    }

                    if (url.includes("/accountsoverview")) {
                      $("#sltTaxCode").val(taxName);
                    }
                    $("#newTaxRateModal").modal("toggle");
                    $(".fullScreenSpin").css("display", "none");
                    location.reload(true);
                  })
                  .catch(function (err) {
                    // Meteor._reload.reload();
                    $("#newTaxRateModal").modal("toggle");
                    $(".fullScreenSpin").css("display", "none");
                  });
              })
              .catch(function (err) {
                if (url.includes("/productview")) {
                  if (taxSelected === "sales") {
                    $("#slttaxcodesales").val(taxName);
                  } else if (taxSelected === "purchase") {
                    $("#slttaxcodepurchase").val(taxName);
                  } else {
                    $("#sltTaxCode").val(taxName);
                  }
                }
                if (url.includes("/accountsoverview")) {
                  $("#sltTaxCode").val(taxName);
                }
                $("#newTaxRateModal").modal("toggle");
                $(".fullScreenSpin").css("display", "none");
              });
            var selectLineID = $("#selectLineID").val();
            if (selectLineID) {
              $("#" + selectLineID + " .lineTaxCode").val(taxName);
            }
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
                // Meteor._reload.reload();
                $("#newTaxRateModal").modal("toggle");
                $(".fullScreenSpin").css("display", "none");
              } else if (result.dismiss === "cancel") {
              }
            });
            $(".fullScreenSpin").css("display", "none");
          });
      }
    }, delayTimeAfterSound);
  },
  "click .btnAddTaxRate": function () {
    $("#add-tax-title").text("Add New Tax Rate");
    $("#edtTaxID").val("");
    $("#edtTaxName").val("");
    $("#edtTaxName").prop("readonly", false);
    $("#edtTaxRate").val("");
    $("#edtTaxDesc").val("");
    $("#view-in-active").html(
      "<button class='btn btn-danger btnDeleteTaxRate vs1ButtonMargin' id='view-in-active' type='button'><i class='fa fa-trash' style='padding-right: 8px;'></i>Make In-Active</button>"
    );
    let templateObject = Template.instance();
    templateObject.subtaxlines.set([]);
  },
  "click #tblTaxRatesList td": (e) => {
    if (!e) return false;

    const templateObject = Template.instance();

    const tr = $(e.currentTarget).parent();
    var listData = tr.attr("id");
    if (listData) {
      $("#add-tax-title").text("Edit Tax Rate");
      $("#edtTaxName").prop("readonly", true);
      if (listData !== "") {
        listData = Number(listData);
        var taxid = listData || "";
        var taxName = $(e.currentTarget).closest("tr").find(".colTaxRateName").text() || "";
        var taxRate = $(e.currentTarget).closest("tr").find(".colTaxRate").text() || "";
        var taxDescription = $(e.currentTarget).closest("tr").find(".colTaxRateDesc").text() || "";
        let status = $(e.currentTarget).closest("tr").find(".colStatus").text();
        $("#edtTaxID").val(taxid);
        $("#edtTaxName").val(taxName);

        $("#edtTaxRate").val(String(taxRate).replace("%", ""));
        $("#edtTaxDesc").val(taxDescription);

        if (status == "In-Active") {
          $("#view-in-active").html(
            "<button class='btn btn-success btnActiveTaxRate vs1ButtonMargin' id='view-in-active' type='button'><i class='fa fa-trash' style='padding-right: 8px;'></i>Make Active</button>"
          );
        } else {
          $("#view-in-active").html(
            "<button class='btn btn-danger btnDeleteTaxRate vs1ButtonMargin' id='view-in-active' type='button'><i class='fa fa-trash' style='padding-right: 8px;'></i>Make In-Active</button>"
          );
        }
      }
      $("#addTaxRateModal").modal("toggle");
    }
  },
  "click .btnActiveTaxRate": function () {
    $("#view-in-active").html(
      "<button class='btn btn-danger btnDeleteTaxRate vs1ButtonMargin' id='view-in-active' type='button'><i class='fa fa-trash' style='padding-right: 8px;'></i>Make In-Active</button>"
    );
  },
  "click .btnDeleteTaxRate": function () {
    $("#view-in-active").html(
      "<button class='btn btn-success btnActiveTaxRate vs1ButtonMargin' id='view-in-active' type='button'><i class='fa fa-trash' style='padding-right: 8px;'></i>Make Active</button>"
    );
  },
  "click .templateDownload": function () {
    let utilityService = new UtilityService();
    let rows = [];
    const filename = "SampleTaxCode" + ".csv";
    rows[0] = ["Name", "Description", "Rate", "Purchase Default", "Sales Default"];
    rows[1] = ["ADJ", "Tax Adjustments", "0.00%", "1", "0"];
    utilityService.exportToCsv(rows, filename, "csv");
  },
  "click .templateDownloadXLSX": function (e) {
    e.preventDefault(); //stop the browser from following
    window.location.href = "sample_imports/SampleTaxCode.xlsx";
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
    let taxRateService = new TaxRateService();
    let objDetails;

    Papa.parse(templateObject.selectedFile.get(), {
      complete: function (results) {
        if (results.data.length > 0) {
          if (
            results.data[0][0] == "Name" &&
            results.data[0][1] == "Description" &&
            results.data[0][2] == "Rate" &&
            results.data[0][3] == "Purchase Default" &&
            results.data[0][4] == "Sales Default"
          ) {
            let dataLength = results.data.length * 500;

            setTimeout(function () {
              sideBarService
                .getTaxRateVS1()
                .then(function (dataReload) {
                  addVS1Data("TTaxcodeVS1", JSON.stringify(dataReload))
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
            }, parseInt(dataLength));

            for (let i = 0; i < results.data.length - 1; i++) {
              let taxRate = parseFloat(parseFloat(results.data[i + 1][2].slice(0, -1)) / 100);
              objDetails = {
                type: "TTaxcode",
                fields: {
                  Active: true,
                  CodeName: results.data[i + 1][0] || "",
                  Description: results.data[i + 1][1] || "",
                  Rate: taxRate,
                  IsDefaultPurchase: results.data[i + 1][3] == "1" ? true : false,
                  IsDefaultSales: results.data[i + 1][4] == "1" ? true : false,
                  PublishOnVS1: true,
                },
              };
              if (results.data[i + 1][1]) {
                if (results.data[i + 1][1] !== "") {
                  taxRateService
                    .saveTaxRate(objDetails)
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
                        } else if (result.dismiss === "cancel") {
                        }
                      });
                    });
                }
              }
            }
          } else {
            $(".fullScreenSpin").css("display", "none");
            swal("Invalid Data Mapping fields ", "Please check that you are importing the correct file with the correct column headers.", "error");
          }
        } else {
          $(".fullScreenSpin").css("display", "none");
          swal("Invalid Data Mapping fields ", "Please check that you are importing the correct file with the correct column headers.", "error");
        }
      },
    });
  },
});

Template.wizard_taxrate.helpers({
  salesCloudPreferenceRec: () => {
    return CloudPreference.findOne({
      userid: localStorage.getItem("mycloudLogonID"),
      PrefName: "tblTaxRatesList",
    });
  },
  defaultpurchasetaxcode: () => {
    return Template.instance().defaultpurchasetaxcode.get();
  },
  defaultsaletaxcode: () => {
    return Template.instance().defaultsaletaxcode.get();
  },
  tableheaderrecords: () => {
    return Template.instance().tableheaderrecords.get();
  },
  apiFunction: function () {
    let sideBarService = new SideBarService();
    return sideBarService.getTaxRateVS1List;
  },
  searchAPI: function () {
    return sideBarService.getTaxRateVS1ByName;
  },
  service: () => {
    let sideBarService = new SideBarService();
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
  apiParams: function () {
    return ["limitCount", "limitFrom", "deleteFilter"];
  },
});

Template.registerHelper("equals", function (a, b) {
  return a === b;
});
