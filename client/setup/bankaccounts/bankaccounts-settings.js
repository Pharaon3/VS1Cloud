import "./bankaccounts-settings.html";
import { ReactiveVar } from "meteor/reactive-var";
import { Template } from "meteor/templating";
import "../../lib/global/indexdbstorage.js";
import { AccountService } from "../../accounts/account-service";
import { SideBarService } from "../../js/sidebar-service";
import { UtilityService } from "../../utility-service";
import XLSX from "xlsx";

const sideBarService = new SideBarService();
const accountService = new AccountService();
const utilityService = new UtilityService();

Template.wizard_bankaccounts.onCreated(function () {
  const templateObject = Template.instance();
  templateObject.tableheaderrecords = new ReactiveVar([]);
  templateObject.selectedFile = new ReactiveVar();

  templateObject.getDataTableList = function (data) {
    var dataList = [
      data.AccountID || "",
      data.AccountName || "",
      data.Description || "",
      `<div class="custom-control custom-switch chkBox text-center">
          <input class="custom-control-input chkBox showontransactioninput" name='showontransactioninput' type="checkbox" value="${data.AccountID}" id="showontransaction-${data.AccountID}">
          <label class="custom-control-label chkBox" for="showontransaction-${data.AccountID}"></label>
      </div>`,
      data.Active ? "" : "In-Active",
    ];
    return dataList;
  };

  let headerStructure = [
    { index: 0, label: "ID", class: "colAccountId", active: false, display: true, width: "20" },
    { index: 1, label: "Account Name", class: "colAccountName", active: true, display: true, width: "350" },
    { index: 2, label: "Description", class: "colDescription", active: true, display: true, width: "700" },
    { index: 3, label: "Show On Transactions", class: "colShowontransactions", active: true, display: true, width: "200" },
    { index: 4, label: "Status", class: "colStatus", active: true, display: true, width: "120" },
  ];
  templateObject.tableheaderrecords.set(headerStructure);
});

Template.wizard_bankaccounts.onRendered(function () {
  $(".tblBankAccountsList tbody").on("click", "tr .colAccountName, tr .colDescription, tr .colShowontransactions", function (event) {
    var listData = $(this).closest("tr").attr("id");

    if (listData) {
      $("#add-account-title").text("Edit Account Details");
      $("#edtNewAccountName").attr("readonly", true);
      $("#sltAccountType").attr("readonly", true);
      $("#sltAccountType").attr("disabled", "disabled");
      if (listData !== "") {
        listData = Number(listData);

        // this is for EFT option
        $("#eftoption_accountid").val(listData);
        accountService
          .getOneAccountById(listData)
          .then(function (data) {
            $("#chkEftOption_balance").prop("checked", data.taccountvs1[0].fields.IncludeBalanceRecord);
            $("#chkEftOption_net").prop("checked", data.taccountvs1[0].fields.IncludeNetTotal);
            $("#chkEftOption_credit").prop("checked", data.taccountvs1[0].fields.IncludeCreditTotal);
            $("#chkEftOption_debit").prop("checked", data.taccountvs1[0].fields.IncludeDebitTotal);
            $("#accountIsHeader").prop("checked", data.taccountvs1[0].fields.IsHeader);
            $("#useReceiptClaim").prop("checked", data.taccountvs1[0].fields.AllowExpenseClaim);
          })
          .catch(function (err) {});
        //accountService.getOneAccount(listData).then(function (data) {

        var accountid = listData || "";
        var accounttype = "BANK";
        var accountname = $(event.target).closest("tr").find(".colAccountName").text() || "";
        var accountno = $(event.target).closest("tr").find(".colAccountNo").text() || "";
        var taxcode = $(event.target).closest("tr").find(".colTaxCode").text() || "";
        var accountdesc = $(event.target).closest("tr").find(".colDescription").text() || "";

        var bankaccountname = $(event.target).closest("tr").find(".colBankAccountName").text() || "";
        var bankname = localStorage.getItem("vs1companyBankName") || $(event.target).closest("tr").find(".colBankName").text() || "";
        var bankbsb = $(event.target).closest("tr").find(".colBSB").text() || "";
        var bankacountno = $(event.target).closest("tr").find(".colBankAccountNo").text() || "";

        var swiftCode = $(event.target).closest("tr").find(".colExtra").text() || "";
        var routingNo = $(event.target).closest("tr").find(".colAPCANumber").text() || "";

        var showTrans = $(event.target).closest("tr").find(".colShowontransactions .chkBox input.showontransactioninput").is(":checked");

        var cardnumber = $(event.target).closest("tr").find(".colCardNumber").text() || "";
        var cardexpiry = $(event.target).closest("tr").find(".colExpiryDate").text() || "";
        var cardcvc = $(event.target).closest("tr").find(".colCVC").text() || "";
        var level1 = $(event.target).closest("tr").find(".colLevel1").text() || "";
        var level2 = $(event.target).closest("tr").find(".colLevel2").text() || "";
        var level3 = $(event.target).closest("tr").find(".colLevel3").text() || "";

        if (accounttype === "BANK") {
          $(".isBankAccount").removeClass("isNotBankAccount");
          $(".isCreditAccount").addClass("isNotCreditAccount");
        } else if (accounttype === "CCARD") {
          $(".isCreditAccount").removeClass("isNotCreditAccount");
          $(".isBankAccount").addClass("isNotBankAccount");
        } else {
          $(".isBankAccount").addClass("isNotBankAccount");
          $(".isCreditAccount").addClass("isNotCreditAccount");
        }
        $("#edtAccountID").val(accountid);
        $("#sltAccountType").val(accounttype);
        $("#edtNewAccountName").val(accountname);
        $("#edtAccountNo").val(accountno);
        $("#sltTaxCode").val(taxcode);
        $("#txaAccountDescription").val(accountdesc);
        $("#edtBankAccountName").val(bankaccountname);
        $("#edtBSB").val(bankbsb);
        $("#edtBankAccountNo").val(bankacountno);
        $("#swiftCode").val(swiftCode);
        $("#routingNo").val(routingNo);
        $("#edtBankName").val(bankname);
        $("#eftBankName").val(bankname);
        $("#eftDescription").val($("#tblBankName").find(`td:contains(${bankname})`).next().text());
        $("#edtSubAccount1").val(level1);
        $("#edtSubAccount2").val(level2);
        $("#edtSubAccount3").val(level3);

        $("#edtCardNumber").val(cardnumber);
        $("#edtExpiryDate").val(cardexpiry ? moment(cardexpiry).format("DD/MM/YYYY") : "");
        $("#edtCvc").val(cardcvc);

        if (showTrans) {
          $(".showOnTransactions").prop("checked", true);
        } else {
          if (accountname == "Bank" || accountname == "BANK" || accounttype == "Bank" || accounttype == "BANK") {
            $(".showOnTransactions").prop("checked", true);
          } else {
            $(".showOnTransactions").prop("checked", false);
          }
        }

        let category = $(event.target).closest("tr").find(".colExpenseCategory").attr("category") || "";
        $("#expenseCategory").val(category);

        $(this).closest("tr").attr("data-target", "#addNewAccountModal");
        $(this).closest("tr").attr("data-toggle", "modal");
      }
    }
  });
});

Template.wizard_bankaccounts.events({
  'click .btnAddNewAccounts': function (event) {
    $("#add-account-title").text("Add New Bank Account");
    $("#edtNewAccountName").val("");
    $("#edtNewAccountName").attr("readonly", false);
    $("#sltAccountType").val("BANK");
    $("#sltAccountType").attr("readonly", true);
    $("#sltAccountType").attr("disabled", "disabled");
    $(".isBankAccount").removeClass("isNotBankAccount");
    $(".isCreditAccount").addClass("isNotCreditAccount");
    $("#txaAccountDescription").val("");
    $("#edtBankName").val("");
  },
  'change [name="showontransactioninput"]': function (event) {
    const id = parseInt($(event.target).val());
    const templpateObject = Template.instance();
    if (id) {
      getVS1Data("TAccountVS1").then((dataObject) => {
        let data = JSON.parse(dataObject[0].data);
        const updatedDataIndex = data.taccountvs1.findIndex((tac) => tac.fields.ID == id);
      });
    }
  },
  "click #btnRefreshAccount": function () {
    $(".fullScreenSpin").css("display", "inline-block");
    sideBarService
      .getAllBankAccountsList()
      .then(function (dataList) {
        addVS1Data("TBankAccountsVS1List", JSON.stringify(dataList))
          .then(function (dataReturn) {
            sideBarService
              .getAllBankAccounts()
              .then(function (dataReload) {
                addVS1Data("TBankAccountsVS1", JSON.stringify(dataReload))
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
            location.reload(true);
          });
      })
      .catch(function (err) {
        location.reload(true);
      });
  },
  "click .templateDownload": function () {
    let utilityService = new UtilityService();
    let rows = [];
    const filename = "SampleBankAccounts" + ".csv";
    rows[0] = ["Account Name", "Description"];
    rows[1] = ["Bank Account", "This is a bank account"];
    utilityService.exportToCsv(rows, filename, "csv");
  },
  "click .templateDownloadXLSX": function (e) {
    e.preventDefault(); //stop the browser from following
    window.location.href = "sample_imports/SampleBankAccounts.xlsx";
  },
  "click .btnUploadFile": function (event) {
    $("#attachment-upload").val("");
    $(".file-name").text("");
    // $(".btnImport").removeAttr("disabled");
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
        var workbook = XLSX.read(data, {
          type: "array",
        });

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
    let accountService = new AccountService();
    let objDetails;
    var filename = $("#attachment-upload")[0].files[0]["name"];
    var fileType = filename.split(".").pop().toLowerCase();

    if (fileType == "csv" || fileType == "txt" || fileType == "xlsx") {
      Papa.parse(templateObject.selectedFile.get(), {
        complete: function (results) {
          if (results.data.length > 0) {
            if (results.data[0][0] == "Account Name" && results.data[0][1] == "Description") {
              let dataLength = results.data.length * 500;
              setTimeout(function () {
                sideBarService
                  .getAllBankAccountsList()
                  .then(function (dataList) {
                    addVS1Data("TBankAccountsVS1List", JSON.stringify(dataList))
                      .then(function (dataReturn) {
                        sideBarService
                          .getAllBankAccounts()
                          .then(function (dataReload) {
                            addVS1Data("TBankAccountsVS1", JSON.stringify(dataReload))
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
                        location.reload(true);
                      });
                  })
                  .catch(function (err) {
                    location.reload(true);
                  });
              }, parseInt(dataLength));
              for (let i = 0; i < results.data.length - 1; i++) {
                objDetails = {
                  type: "TAccount",
                  fields: {
                    Active: true,
                    AccountName: results.data[i + 1][0],
                    Description: results.data[i + 1][1],
                    AccountTypeName: "BANK",
                    PublishOnVS1: true,
                  },
                };
                if (results.data[i + 1][1]) {
                  if (results.data[i + 1][1] !== "") {
                    accountService
                      .saveAccount(objDetails)
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
    } else {
    }
  },
});

Template.wizard_bankaccounts.helpers({
  datatablerecords: () => {
    return Template.instance()
      .datatablerecords.get()
      .sort(function (a, b) {
        if (a.accountname === "NA") {
          return 1;
        } else if (b.accountname === "NA") {
          return -1;
        }
        return a.accountname.toUpperCase() > b.accountname.toUpperCase() ? 1 : -1;
      });
  },
  tableheaderrecords: () => {
    return Template.instance().tableheaderrecords.get();
  },
  salesCloudPreferenceRec: () => {
    return CloudPreference.findOne({
      userid: localStorage.getItem("mycloudLogonID"),
      PrefName: "tblBankAccountsList",
    });
  },
  taxraterecords: () => {
    return Template.instance()
      .taxraterecords.get()
      .sort(function (a, b) {
        if (a.description === "NA") {
          return 1;
        } else if (b.description === "NA") {
          return -1;
        }
        return a.description.toUpperCase() > b.description.toUpperCase() ? 1 : -1;
      });
  },
  isBankAccount: () => {
    return Template.instance().isBankAccount.get();
  },
  loggedCompany: () => {
    return localStorage.getItem("mySession") || "";
  },
  lastBatchUpdate: () => {
    let transactionTableLastUpdated = "";
    var currentDate = new Date();
    if (localStorage.getItem("VS1TransTableUpdate")) {
      transactionTableLastUpdated = moment(localStorage.getItem("VS1TransTableUpdate")).format("ddd MMM D, YYYY, hh:mm A");
    } else {
      transactionTableLastUpdated = moment(currentDate).format("ddd MMM D, YYYY, hh:mm A");
    }
    return transactionTableLastUpdated;
  },
  isSetupFinished: () => {
    return Template.instance().setupFinished.get();
  },
  getSkippedSteps() {
    let setupUrl = localStorage.getItem("VS1Cloud_SETUP_SKIPPED_STEP") || JSON.stringify().split();
    return setupUrl[1];
  },

  // custom fields displaysettings
  displayfields: () => {
    return Template.instance().displayfields.get();
  },

  treeColumnHeader: () => {
    return Template.instance().treeColumnHeader.get();
  },

  apiFunction: function () {
    let sideBarService = new SideBarService();
    return sideBarService.getAllBankAccountsList;
  },

  searchAPI: function () {
    return sideBarService.getAllBankAccountsByName;
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
