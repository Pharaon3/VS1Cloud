import "./suppliers-settings.html";
import { ReactiveVar } from "meteor/reactive-var";
import { Template } from "meteor/templating";
import "../../lib/global/indexdbstorage.js";
import { UtilityService } from "../../utility-service";
import { ContactService } from "../../contacts/contact-service";
import XLSX from "xlsx";
import LoadingOverlay from "../../LoadingOverlay";
import { SideBarService } from "../../js/sidebar-service";
const utilityService = new UtilityService();
const contactService = new ContactService();
const sideBarService = new SideBarService();

Template.wizard_suppliers.onCreated(() => {
  const templateObject = Template.instance();
  templateObject.datatablerecords = new ReactiveVar([]);
  templateObject.tableheaderrecords = new ReactiveVar([]);

  templateObject.selectedFile = new ReactiveVar();
  templateObject.displayfields = new ReactiveVar([]);
  templateObject.reset_data = new ReactiveVar([]);
  templateObject.setupFinished = new ReactiveVar();
  templateObject.editableSupplier = new ReactiveVar();

  templateObject.getDataTableList = function (data) {
    let linestatus = "";
    if (data.Active == true) {
      linestatus = "";
    } else if (data.Active == false) {
      linestatus = "In-Active";
    }

    let arBalance = utilityService.modifynegativeCurrencyFormat(data.ARBalance) || 0.0;
    let creditBalance = utilityService.modifynegativeCurrencyFormat(data.ExcessAmount) || 0.0;
    let balance = utilityService.modifynegativeCurrencyFormat(data.Balance) || 0.0;
    let creditLimit = utilityService.modifynegativeCurrencyFormat(data.SupplierCreditLimit) || 0.0;
    let salesOrderBalance = utilityService.modifynegativeCurrencyFormat(data.Balance) || 0.0;

    var dataList = [
      data.ClientID || "",
      data.Company || "",
      data.Phone || "",
      arBalance || 0.0,
      creditBalance || 0.0,
      balance || 0.0,
      creditLimit || 0.0,
      salesOrderBalance || 0.0,
      data.Suburb || "",
      data.Country || "",
      data.Notes || "",
      linestatus,
    ];
    return dataList;
  };

  let headerStructure = [
    { index: 0, label: "ID", class: "colID", active: false, display: false, width: "20" },
    { index: 1, label: "Company", class: "colCompany", active: true, display: true, width: "200" },
    { index: 2, label: "Phone", class: "colPhone", active: true, display: true, width: "110" },
    { index: 3, label: "AR Balance", class: "colARBalance", active: true, display: true, width: "110" },
    { index: 4, label: "Credit Balance", class: "colCreditBalance", active: true, display: true, width: "110" },
    { index: 5, label: "Balance", class: "colBalance", active: true, display: true, width: "110" },
    { index: 6, label: "Credit Limit", class: "colCreditLimit", active: true, display: true, width: "110" },
    { index: 7, label: "Order Balance", class: "colSalesOrderBalance", active: true, display: true, width: "110" },
    { index: 8, label: "City/Suburb", class: "colSuburb", active: true, display: true, width: "110" },
    { index: 9, label: "Country", class: "colCountry", active: true, display: true, width: "110" },
    { index: 10, label: "Comments", class: "colNotes", active: true, display: true, width: "300" },
    { index: 11, label: "Status", class: "colStatus", active: true, display: true, width: "120" },
  ];
  templateObject.tableheaderrecords.set(headerStructure);
});

Template.wizard_suppliers.onRendered(() => {});

Template.wizard_suppliers.helpers({
  datatablerecords: () => {
    return Template.instance()
      .datatablerecords.get()
      .sort(function (a, b) {
        if (a.company == "NA") {
          return 1;
        } else if (b.company == "NA") {
          return -1;
        }
        return a.company.toUpperCase() > b.company.toUpperCase() ? 1 : -1;
      });
  },
  tableheaderrecords: () => {
    return Template.instance().tableheaderrecords.get();
  },
  salesCloudPreferenceRec: () => {
    return CloudPreference.findOne({ userid: localStorage.getItem("mycloudLogonID"), PrefName: "tblSetupSupplierlist" });
  },
  getSkippedSteps() {
    let setupUrl = localStorage.getItem("VS1Cloud_SETUP_SKIPPED_STEP") || JSON.stringify().split();
    return setupUrl[1];
  },
  // custom fields displaysettings
  displayfields: () => {
    return Template.instance().displayfields.get();
  },
  isSetupFinished: () => {
    return Template.instance().setupFinished.get();
  },

  editableSupplier: () => {
    return Template.instance().editableSupplier.get();
  },

  apiFunction: function () {
    let sideBarService = new SideBarService();
    return sideBarService.getAllSuppliersDataVS1List;
  },

  searchAPI: function () {
    return sideBarService.getAllSuppliersDataVS1ByName;
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

Template.wizard_suppliers.events({
  "click #btnNewSupplier": (e) => {
    let templateObject = Template.instance();
    $($(e.currentTarget).attr("data-toggle")).modal("toggle");
    templateObject.editableSupplier.set(null);
  },
  "click #tblSetupSupplierlist tbody tr": (e) => {
    $("#addSupplierModal").modal("toggle");
    let templateObject = Template.instance();
    LoadingOverlay.show();
    const supplierName = $(e.currentTarget).closest("tr").find(".colCompany").text() || "";
    async function getSupplierDetail(name) {
      return new Promise(async (resolve, reject) => {
        getVS1Data("TSupplierVS1")
          .then(function (dataObject) {
            if (dataObject.length === 0) {
              contactService.getOneSupplierDataExByName(name).then((data) => {
                resolve(data);
              });
            } else {
              let data = JSON.parse(dataObject[0].data);
              let useData = data.tsuppliervs1;
              let added = false;
              for (let i = 0; i < useData.length; i++) {
                if (useData[i].fields.ClientName === name) {
                  added = true;
                  resolve(useData[i]);
                }
              }
              if (!added) {
                contactService.getOneSupplierDataExByName(name).then(function (data) {
                  resolve(data);
                });
              }
            }
          })
          .catch(function (e) {
            contactService.getOneSupplierDataExByName(name).then(function (data) {
              $(".fullScreenSpin").css("display", "none");
              resolve(data);
            });
          });
      });
    }
    if (supplierName) {
      async function setEditSuppData() {
        let data;
        await getSupplierDetail(supplierName).then((value) => (data = value));
        lineItemObj = {
          id: data.fields.ID,
          lid: "Edit Supplier",
          company: data.fields.ClientName || "",
          email: data.fields.Email || "",
          title: data.fields.Title || "",
          firstname: data.fields.FirstName || "",
          middlename: data.fields.CUSTFLD10 || "",
          lastname: data.fields.LastName || "",
          tfn: "" || "",
          phone: data.fields.Phone || "",
          mobile: data.fields.Mobile || "",
          fax: data.fields.Faxnumber || "",
          skype: data.fields.SkypeName || "",
          website: data.fields.URL || "",
          shippingaddress: data.fields.Street || "",
          scity: data.fields.Street2 || "",
          sstate: data.fields.State || "",
          spostalcode: data.fields.Postcode || "",
          scountry: data.fields.Country || LoggedCountry,
          billingaddress: data.fields.BillStreet || "",
          bcity: data.fields.BillStreet2 || "",
          bstate: data.fields.BillState || "",
          bpostalcode: data.fields.BillPostcode || "",
          bcountry: data.fields.Billcountry || "",
          custfield1: data.fields.CUSTFLD1 || "",
          custfield2: data.fields.CUSTFLD2 || "",
          custfield3: data.fields.CUSTFLD3 || "",
          custfield4: data.fields.CUSTFLD4 || "",
          notes: data.fields.Notes || "",
          preferedpayment: data.fields.PaymentMethodName || "",
          terms: data.fields.TermsName || "",
          deliverymethod: data.fields.ShippingMethodName || "",
          accountnumber: data.fields.ClientNo || 0.0,
          isContractor: data.fields.Contractor || false,
          issupplier: data.fields.IsSupplier || false,
          iscustomer: data.fields.IsCustomer || false,
          bankName: data.fields.BankName || "",
          swiftCode: data.fields.SwiftCode || "",
          routingNumber: data.fields.RoutingNumber || "",
          bankAccountName: data.fields.BankAccountName || "",
          bankAccountBSB: data.fields.BankAccountBSB || "",
          bankAccountNo: data.fields.BankAccountNo || "",
          foreignExchangeCode: data.fields.ForeignExchangeCode || CountryAbbr,
        };
        templateObject.editableSupplier.set(lineItemObj);
        LoadingOverlay.hide();
      }
      setEditSuppData();
    }
  },
  "click .btnRefresh": function () {
    $(".fullScreenSpin").css("display", "inline-block");
    sideBarService
      .getAllSuppliersDataVS1List(initialDataLoad, 0)
      .then(function (data) {
        addVS1Data("TSupplierVS1List", JSON.stringify(data))
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
  "click .templateDownload": function () {
    let utilityService = new UtilityService();
    let rows = [];
    const filename = "SampleSupplier" + ".csv";
    rows[0] = ["Company", "First Name", "Last Name", "Phone", "Mobile", "Email", "Skype", "Street", "City/Suburb", "State", "Post Code", "Country"];
    rows[1] = [
      "ABC Company",
      "John",
      "Smith",
      "9995551213",
      "9995551213",
      "johnsmith@email.com",
      "johnsmith",
      "123 Main Street",
      "Brooklyn",
      "New York",
      "1234",
      "United States",
    ];
    utilityService.exportToCsv(rows, filename, "csv");
  },
  "click .templateDownloadXLSX": function (e) {
    e.preventDefault(); //stop the browser from following
    window.location.href = "sample_imports/SampleSupplier.xlsx";
  },
  "click .btnUploadFile": function () {
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
    let contactService = new ContactService();
    let objDetails;
    let firstName = "";
    let lastName = "";
    Papa.parse(templateObject.selectedFile.get(), {
      complete: function (results) {
        if (results.data.length > 0) {
          if (
            results.data[0][0] == "Company" &&
            results.data[0][1] == "First Name" &&
            results.data[0][2] == "Last Name" &&
            results.data[0][3] == "Phone" &&
            results.data[0][4] == "Mobile" &&
            results.data[0][5] == "Email" &&
            results.data[0][6] == "Skype" &&
            results.data[0][7] == "Street" &&
            (results.data[0][8] == "Street2" || results.data[0][8] == "City/Suburb") &&
            results.data[0][9] == "State" &&
            results.data[0][10] == "Post Code" &&
            results.data[0][11] == "Country"
          ) {
            let dataLength = results.data.length * 500;
            setTimeout(function () {
              sideBarService
                .getAllSuppliersDataVS1List(initialDataLoad, 0)
                .then(function (data) {
                  addVS1Data("TSupplierVS1List", JSON.stringify(data))
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
              firstName = results.data[i + 1][1] !== undefined ? results.data[i + 1][1] : "";
              lastName = results.data[i + 1][2] !== undefined ? results.data[i + 1][2] : "";

              objDetails = {
                type: "TSupplier",
                fields: {
                  ClientName: results.data[i + 1][0],
                  FirstName: firstName || "",
                  LastName: lastName || "",
                  Phone: results.data[i + 1][3],
                  Mobile: results.data[i + 1][4],
                  Email: results.data[i + 1][5],
                  SkypeName: results.data[i + 1][6],
                  Street: results.data[i + 1][7],
                  Street2: results.data[i + 1][8],
                  Suburb: results.data[i + 1][8] || "",
                  State: results.data[i + 1][9],
                  PostCode: results.data[i + 1][10],
                  Country: results.data[i + 1][11],
                  BillStreet: results.data[i + 1][7],
                  BillStreet2: results.data[i + 1][8],
                  BillState: results.data[i + 1][9],
                  BillPostCode: results.data[i + 1][10],
                  Billcountry: results.data[i + 1][11],
                  PublishOnVS1: true,
                },
              };
              if (results.data[i + 1][1]) {
                if (results.data[i + 1][1] !== "") {
                  contactService
                    .saveSupplier(objDetails)
                    .then(function (data) {})
                    .catch(function (err) {
                      swal({ title: "Oooops...", text: err, type: "error", showCancelButton: false, confirmButtonText: "Try Again" }).then((result) => {
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
