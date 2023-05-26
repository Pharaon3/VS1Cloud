// @ts-nocheck
import "./customers-settings.html";
import { ReactiveVar } from "meteor/reactive-var";
import { Template } from "meteor/templating";
import XLSX from "xlsx";
import "../../lib/global/indexdbstorage.js";
import LoadingOverlay from "../../LoadingOverlay";
import { UtilityService } from "../../utility-service";
import { SideBarService } from "../../js/sidebar-service";
import { ContactService } from "../../contacts/contact-service";

let sideBarService = new SideBarService();
let utilityService = new UtilityService();
let contactService = new ContactService();

Template.wizard_customers.onCreated(() => {
  const templateObject = Template.instance();
  templateObject.datatablerecords = new ReactiveVar([]);
  templateObject.tableheaderrecords = new ReactiveVar([]);
  templateObject.selectedFile = new ReactiveVar();
  templateObject.setupFinished = new ReactiveVar();
  templateObject.editableCustomer = new ReactiveVar();
  templateObject.defaultsaletaxcode = new ReactiveVar();

  templateObject.transactiondatatablerecords = new ReactiveVar([]);

  templateObject.getDataTableList = function (data) {
    let mobile = contactService.changeMobileFormat(data.Mobile);
    let arBalance = utilityService.modifynegativeCurrencyFormat(data.ARBalance) || 0.0;
    let creditBalance = utilityService.modifynegativeCurrencyFormat(data.APBalance) || 0.0;
    let balance = utilityService.modifynegativeCurrencyFormat(data.Balance) || 0.0;
    let creditLimit = utilityService.modifynegativeCurrencyFormat(data.CreditLimit) || 0.0;
    let salesOrderBalance = utilityService.modifynegativeCurrencyFormat(data.SOBalance) || 0.0;
    let dataList = [
      data.ClientID || "",
      data.Company || "-",
      data.JobName || "",
      data.Phone || "",
      mobile || "",
      arBalance || 0.0,
      creditBalance || 0.0,
      balance || 0.0,
      creditLimit || 0.0,
      salesOrderBalance || 0.0,
      data.Street || "",
      data.Street2 || data.Suburb || "",
      data.State || "",
      data.Postcode || "",
      data.Country || "",
      data.Email || "",
      data.AccountNo || "",
      data.ClientTypeName || "Default",
      data.Discount || 0,
      data.TermsName || loggedTermsSales || "COD",
      data.FirstName || "",
      data.LastName || "",
      data.TaxCodeName || "E",
      data.ClientNo || "",
      data.JobTitle || "",
      data.Notes || "",
      data.Active ? "" : "In-Active",
    ];
    return dataList;
  };

  let headerStructure = [
    { index: 0, label: "ID", class: "colCustomerID", active: false, display: true, width: "10" },
    { index: 1, label: "Company", class: "colCompany", active: true, display: true, width: "200" },
    { index: 2, label: "Job", class: "colJob", active: true, display: true, width: "60" },
    { index: 3, label: "Phone", class: "colPhone", active: true, display: true, width: "110" },
    { index: 4, label: "Mobile", class: "colMobile", active: false, display: true, width: "110" },
    { index: 5, label: "AR Balance", class: "colARBalance", active: true, display: true, width: "110" },
    { index: 6, label: "Credit Balance", class: "colCreditBalance", active: true, display: true, width: "110" },
    { index: 7, label: "Balance", class: "colBalance", active: true, display: true, width: "110" },
    { index: 8, label: "Credit Limit", class: "colCreditLimit", active: true, display: true, width: "110" },
    { index: 9, label: "Order Balance", class: "colSalesOrderBalance", active: true, display: true, width: "110" },
    { index: 10, label: "Street Address", class: "colStreetAddress", active: false, display: true, width: "110" },
    { index: 11, label: "City/Suburb", class: "colSuburb", active: true, display: true, width: "110" },
    { index: 12, label: "State", class: "colState", active: false, display: true, width: "110" },
    { index: 13, label: "Zip Code", class: "colZipCode", active: false, display: true, width: "60" },
    { index: 14, label: "Country", class: "colCountry", active: true, display: true, width: "110" },
    { index: 15, label: "Email", class: "colEmail", active: false, display: true, width: "60" },
    { index: 16, label: "Account No", class: "colAccountNo", active: false, display: true, width: "60" },
    { index: 17, label: "Customer Type", class: "colCustomerType", active: false, display: true, width: "60" },
    { index: 18, label: "Discount", class: "colCustomerDiscount", active: false, display: true, width: "60" },
    { index: 19, label: "Term Name", class: "colCustomerTermName", active: false, display: true, width: "200" },
    { index: 20, label: "First Name", class: "colCustomerFirstName", active: false, display: true, width: "200" },
    { index: 21, label: "Last Name", class: "colCustomerLastName", active: false, display: true, width: "200" },
    { index: 22, label: "Tax Code", class: "colCustomerTaxCode", active: false, display: true, width: "60" },
    { index: 23, label: "Custom Field 1", class: "colClientNo", active: false, display: true, width: "60" },
    { index: 24, label: "Custom Field 2", class: "colJobTitle", active: false, display: true, width: "60" },
    { index: 25, label: "Notes", class: "colNotes", active: true, display: true, width: "500" },
    { index: 26, label: "Status", class: "colStatus", active: true, display: true, width: "120" },
  ];
  templateObject.tableheaderrecords.set(headerStructure);
});

Template.wizard_customers.onRendered(() => {});

Template.wizard_customers.events({
  "click #btnNewCustomer"(e) {
    let templateObject = Template.instance();
    const target = $(e.currentTarget).attr("data-toggle");
    $(target).modal("toggle");
    templateObject.editableCustomer.set(null);
  },
  "click #tblSetupCustomerlist tbody tr"(e) {
    $("#addCustomerModal").modal("toggle");
    let templateObject = Template.instance();
    LoadingOverlay.show();
    const customerId = $(e.currentTarget).attr("id");
    if (!isNaN(customerId)) {
      async function getCustomerFromID(customerID) {
        return new Promise((resolve, reject) => {
          getVS1Data("TCustomerVS1")
            .then(function (dataObject) {
              if (dataObject.length === 0) {
                contactService.getOneCustomerDataEx(customerID).then(function (data) {
                  resolve(data);
                });
              } else {
                let data = JSON.parse(dataObject[0].data);
                let useData = data.tcustomervs1;
                let added = false;
                for (let i = 0; i < useData.length; i++) {
                  if (parseInt(useData[i].fields.ID) === parseInt(customerID)) {
                    added = true;
                    resolve(useData[i]);
                  }
                }
                if (!added) {
                  contactService.getOneCustomerDataEx(customerID).then(function (data) {
                    resolve(data);
                  });
                }
              }
            })
            .catch(function (err) {
              contactService.getOneCustomerDataEx(customerID).then(function (data) {
                $(".fullScreenSpin").css("display", "none");
                resolve(data);
              });
            });
        });
      }
      async function setEditCustData() {
        let data;
        await getCustomerFromID(customerId).then((value) => (data = value));
        lineItemObj = {
          id: data.fields.ID || "",
          lid: "Edit Customer",
          isjob: data.fields.IsJob || "",
          issupplier: data.fields.IsSupplier || false,
          iscustomer: data.fields.IsCustomer || false,
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
          ssuburb: data.fields.Suburb || "",
          sstate: data.fields.State || "",
          spostalcode: data.fields.Postcode || "",
          scountry: data.fields.Country || LoggedCountry,
          billingaddress: data.fields.BillStreet || "",
          bcity: data.fields.BillStreet2 || "",
          bsuburb: data.fields.Billsuburb || "",
          bstate: data.fields.BillState || "",
          bpostalcode: data.fields.BillPostcode || "",
          bcountry: data.fields.Billcountry || "",
          notes: data.fields.Notes || "",
          preferedpayment: data.fields.PaymentMethodName || "",
          terms: data.fields.TermsName || localStorage.getItem("ERPTermsSales"),
          deliverymethod: data.fields.ShippingMethodName || "",
          clienttype: data.fields.ClientTypeName || "",
          openingbalance: data.fields.RewardPointsOpeningBalance || 0.0,
          openingbalancedate: data.fields.RewardPointsOpeningDate ? moment(data.fields.RewardPointsOpeningDate).format("DD/MM/YYYY") : "",
          taxcode: data.fields.TaxCodeName || "",
          custfield1: data.fields.CUSTFLD1 || "",
          custfield2: data.fields.CUSTFLD2 || "",
          custfield3: data.fields.CUSTFLD3 || "",
          custfield4: data.fields.CUSTFLD4 || "",
          status: data.fields.Status || "",
          rep: data.fields.RepName || "",
          source: data.fields.SourceName || "",
          salesQuota: data.fields.CUSTFLD12 || "",
          jobcompany: data.fields.ClientName || "",
          jobCompanyParent: data.fields.ClientName || "",
          jobemail: data.fields.Email || "",
          jobtitle: data.fields.Title || "",
          jobfirstname: data.fields.FirstName || "",
          jobmiddlename: data.fields.CUSTFLD10 || "",
          joblastname: data.fields.LastName || "",
          jobtfn: "" || "",
          jobphone: data.fields.Phone || "",
          jobmobile: data.fields.Mobile || "",
          jobfax: data.fields.Faxnumber || "",
          jobskype: data.fields.SkypeName || "",
          jobwebsite: data.fields.CUSTFLD9 || "",
          jobshippingaddress: data.fields.Street || "",
          jobscity: data.fields.Street2 || "",
          jobsstate: data.fields.State || "",
          jobspostalcode: data.fields.Postcode || "",
          jobscountry: data.fields.Country || LoggedCountry,
          jobbillingaddress: data.fields.BillStreet || "",
          jobbcity: data.fields.BillStreet2 || "",
          jobbstate: data.fields.BillState || "",
          jobbpostalcode: data.fields.BillPostcode || "",
          jobbcountry: data.fields.Billcountry || "",
          jobnotes: data.fields.Notes || "",
          jobpreferedpayment: data.fields.PaymentMethodName || "",
          jobterms: data.fields.TermsName || "",
          jobdeliverymethod: data.fields.ShippingMethodName || "",
          jobopeningbalance: data.fields.RewardPointsOpeningBalance || 0.0,
          jobopeningbalancedate: data.fields.RewardPointsOpeningDate ? moment(data.fields.RewardPointsOpeningDate).format("DD/MM/YYYY") : "",
          jobtaxcode: data.fields.TaxCodeName || templateObject.defaultsaletaxcode.get(),
          jobcustFld1: "" || "",
          jobcustFld2: "" || "",
          job_Title: "",
          jobName: "",
          jobNumber: "",
          jobRegistration: "",
          discount: data.fields.Discount || 0,
          jobclienttype: data.fields.ClientTypeName || "",
          ForeignExchangeCode: data.fields.ForeignExchangeCode || CountryAbbr,
        };
        templateObject.editableCustomer.set(lineItemObj);
        LoadingOverlay.hide();
      }
      setEditCustData();
    }
  },
  "click .btnRefresh"(e) {
    $(".fullScreenSpin").css("display", "inline-block");
    const templateObject = Template.instance();
    sideBarService
      .getAllTCustomerList(initialBaseDataLoad, 0)
      .then(async function (dataReload) {
        addVS1Data("TCustomerVS1List", JSON.stringify(dataReload)).then(function () {
          sideBarService
            .getAllCustomersDataVS1(initialBaseDataLoad, 0)
            .then(function (dataReload) {
              addVS1Data("TCustomerVS1", JSON.stringify(dataReload))
                .then(function (datareturn) {
                  location.reload(true);
                })
                .catch(function (err) {
                  swal('Oooops...', err, 'error');
                });
            })
            .catch(function (err) {
              swal('Oooops...', err, 'error');
            });
        });
      })
      .catch(function (err) {
        swal('Oooops...', err, 'error');
      });
    $(".modal.show").modal("hide");
  },
  "click .templateDownload": function () {
    let utilityService = new UtilityService();
    let rows = [];
    const filename = "SampleCustomer" + ".csv";
    rows[0] = ["Company", "First Name", "Last Name", "Phone", "Mobile", "Email", "Skype", "Street", "City/Suburb", "State", "Post Code", "Country", "Tax Code"];
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
      "NT",
    ];
    utilityService.exportToCsv(rows, filename, "csv");
  },
  "click .templateDownloadXLSX": function (e) {
    e.preventDefault(); //stop the browser from following
    window.location.href = "sample_imports/SampleCustomer.xlsx";
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
    // let contactService = new ContactService();
    let objDetails;
    let firstName = "";
    let lastName = "";
    let taxCode = "";

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
            results.data[0][11] == "Country" &&
            results.data[0][12] == "Tax Code"
          ) {
            let dataLength = results.data.length * 500;
            setTimeout(function () {
              sideBarService
                .getAllTCustomerList()
                .then(async function (dataReload) {
                  addVS1Data("TCustomerVS1List", JSON.stringify(dataReload)).then(function () {
                    sideBarService
                      .getAllCustomersDataVS1()
                      .then(function (dataReload) {
                        addVS1Data("TCustomerVS1", JSON.stringify(dataReload))
                          .then(function (datareturn) {
                            location.reload(true);
                          })
                          .catch(function (err) {
                            swal('Oooops...', err, 'error');
                          });
                      })
                      .catch(function (err) {
                        swal('Oooops...', err, 'error');
                      });
                  });
                })
                .catch(function (err) {
                  swal('Oooops...', err, 'error');
                });
            }, parseInt(dataLength));

            for (let i = 0; i < results.data.length - 1; i++) {
              firstName = results.data[i + 1][1] !== undefined ? results.data[i + 1][1] : "";
              lastName = results.data[i + 1][2] !== undefined ? results.data[i + 1][2] : "";
              taxCode = results.data[i + 1][12] !== undefined ? results.data[i + 1][12] : "NT";
              objDetails = {
                type: "TCustomerEx",
                fields: {
                  ClientName: results.data[i + 1][0] || "",
                  FirstName: firstName || "",
                  LastName: lastName || "",
                  Phone: results.data[i + 1][3] || "",
                  Mobile: results.data[i + 1][4] || "",
                  Email: results.data[i + 1][5] || "",
                  SkypeName: results.data[i + 1][6] || "",
                  Street: results.data[i + 1][7] || "",
                  Street2: results.data[i + 1][8] || "",
                  Suburb: results.data[i + 1][8] || "",
                  State: results.data[i + 1][9] || "",
                  PostCode: results.data[i + 1][10] || "",
                  Country: results.data[i + 1][11] || "",
                  BillStreet: results.data[i + 1][7] || "",
                  BillStreet2: results.data[i + 1][8] || "",
                  BillState: results.data[i + 1][9] || "",
                  BillPostCode: results.data[i + 1][10] || "",
                  Billcountry: results.data[i + 1][11] || "",
                  TaxCodeName: taxCode || "NT",
                  Active: true,
                },
              };
              if (results.data[i + 1][1]) {
                if (results.data[i + 1][1] !== "") {
                  contactService
                    .saveCustomerEx(objDetails)
                    .then(function (data) {
                    })
                    .catch(function (err) {
                      //$('.fullScreenSpin').css('display','none');
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

Template.wizard_customers.helpers({
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
    return CloudPreference.findOne({ userid: localStorage.getItem("mycloudLogonID"), PrefName: "tblSetupCustomerlist" });
  },
  loggedCompany: () => {
    return localStorage.getItem("mySession") || "";
  },
  isSetupFinished: () => {
    return Template.instance().setupFinished.get();
  },
  editableCustomer: () => {
    return Template.instance().editableCustomer.get();
  },
  getSkippedSteps() {
    let setupUrl = localStorage.getItem("VS1Cloud_SETUP_SKIPPED_STEP") || JSON.stringify().split();
    return setupUrl[1];
  },

  apiFunction: function () {
    let sideBarService = new SideBarService();
    return sideBarService.getAllTCustomerList;
  },

  searchAPI: function () {
    return sideBarService.searchAllCustomersDataVS1ByName;
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
