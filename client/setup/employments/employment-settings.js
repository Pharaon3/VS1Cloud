// @ts-nocheck
import "./employment-settings.html";
import { ReactiveVar } from "meteor/reactive-var";
import { Template } from "meteor/templating";
import "../../lib/global/indexdbstorage.js";
import LoadingOverlay from "../../LoadingOverlay";
import { UtilityService } from "../../utility-service";
import { ContactService } from "../../contacts/contact-service";
import { SideBarService } from "../../js/sidebar-service";
import XLSX from "xlsx";

const utilityService = new UtilityService();
const contactService = new ContactService();
let sideBarService = new SideBarService();

Template.wizard_employment.onCreated(() => {
  const templateObject = Template.instance();
  templateObject.selectedFile = new ReactiveVar();
  templateObject.currentEmployees = new ReactiveVar([]);
  templateObject.editableEmployee = new ReactiveVar();
  templateObject.empuserrecord = new ReactiveVar();
  templateObject.datatablerecords = new ReactiveVar([]);
  templateObject.tableheaderrecords = new ReactiveVar([]);
  templateObject.displayfields = new ReactiveVar([]);
  templateObject.reset_data = new ReactiveVar([]);
  templateObject.setupFinished = new ReactiveVar();
  templateObject.employees = new ReactiveVar([]);

  templateObject.getDataTableList = function (data) {
    let linestatus = "";
    if (data.Active == true) {
      linestatus = "";
    } else if (data.Active == false) {
      linestatus = "In-Active";
    }
    var dataList = [
      data.EmployeeID || "",
      data.EmployeeName || "",
      data.FirstName || "",
      data.LastName || "",
      data.Phone || "",
      data.Mobile || "",
      data.Email || "",
      data.DefaultClassName || "",
      data.CustFld1 || "",
      data.CustFld2 || "",
      data.Street || "",
      data.Street2 || "",
      data.State || "",
      data.Postcode || "",
      data.Country || "",
      linestatus,
    ];
    return dataList;
  };

  let headerStructure = [
    { index: 0, label: "ID", class: "colEmployeeNo", active: false, display: true, width: "10" },
    { index: 1, label: "Employee Name", class: "colEmployeeName", active: true, display: true, width: "200" },
    { index: 2, label: "First Name", class: "colFirstName", active: true, display: true, width: "200" },
    { index: 3, label: "Last Name", class: "colLastName", active: true, display: true, width: "200" },
    { index: 4, label: "Phone", class: "colPhone", active: true, display: true, width: "110" },
    { index: 5, label: "Mobile", class: "colMobile", active: false, display: true, width: "110" },
    { index: 6, label: "Email", class: "colEmail", active: true, display: true, width: "200" },
    { index: 7, label: "Department", class: "colDepartment", active: true, display: true, width: "200" },
    { index: 8, label: "Custom Field 1", class: "colCustFld1", active: false, display: true, width: "120" },
    { index: 9, label: "Custom Field 2", class: "colCustFld2", active: false, display: true, width: "120" },
    { index: 10, label: "Address", class: "colAddress", active: true, display: true, width: "110" },
    { index: 11, label: "City/Suburb", class: "colSuburb", active: false, display: true, width: "110" },
    { index: 12, label: "State", class: "colState", active: false, display: true, width: "110" },
    { index: 13, label: "Postcode", class: "colPostcode", active: false, display: true, width: "80" },
    { index: 14, label: "Country", class: "colCountry", active: false, display: true, width: "110" },
    { index: 15, label: "Status", class: "colStatus", active: true, display: true, width: "120" },
  ];
  templateObject.tableheaderrecords.set(headerStructure);
});

Template.wizard_employment.onRendered(() => []);

Template.wizard_employment.helpers({
  currentEmployees: () => {
    return Template.instance().currentEmployees.get();
  },
  employeetableheaderrecords: () => {
    return Template.instance().employeetableheaderrecords.get();
  },
  salesCloudPreferenceRec: () => {
    return CloudPreference.findOne({
      userid: localStorage.getItem("mycloudLogonID"),
      PrefName: "tblSetupEmployeelist",
    });
  },
  editableEmployee: () => {
    return Template.instance().editableEmployee.get();
  },
  datatablerecords: () => {
    return Template.instance()
      .datatablerecords.get()
      .sort(function (a, b) {
        if (a.employeename == "NA") {
          return 1;
        } else if (b.employeename == "NA") {
          return -1;
        }
        return a.employeename.toUpperCase() > b.employeename.toUpperCase() ? 1 : -1;
      });
  },
  tableheaderrecords: () => {
    return Template.instance().tableheaderrecords.get();
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
  employees: () => Template.instance().employees.get(),

  apiFunction: function () {
    let sideBarService = new SideBarService();
    return sideBarService.getAllTEmployeeList;
  },

  searchAPI: function () {
    return sideBarService.getAllEmployeesDataVS1ByName;
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
Template.wizard_employment.events({
  "click .btnSaveEmpPop"(e) {
    playSaveAudio();
    setTimeout(function () {
      $("#addEmployeeModal").modal("toggle");
    }, delayTimeAfterSound);
  },
  "click #tblSetupEmployeelist tbody tr"(e) {
    $("#addEmployeeModal").modal("toggle");
    // $("#add-customer-title").text("Edit Employee")
    let templateObject = Template.instance();
    LoadingOverlay.show();
    const employeeID = $(e.currentTarget).attr("id");
    let status = $(e.target).closest("tr").find(".colStatus").text();
    if(status == "In-Active"){
      $('#view-in-active').html("<button class='btn btn-success btnActiveEmp vs1ButtonMargin' id='view-in-active' type='button'><i class='fa fa-trash' style='padding-right: 8px;'></i>Make Active</button>");
    }else{
      $('#view-in-active').html("<button class='btn btn-danger btnDeleteEmp vs1ButtonMargin' id='view-in-active' type='button'><i class='fa fa-trash' style='padding-right: 8px;'></i>Make In-Active</button>");
    }
    if (!isNaN(employeeID)) {
      const modifyEditModal = async () => {
        await sideBarService
          .getAllEmployeesDataVS1ByID(employeeID)
          .then(function (dataReload) {
            let data = dataReload.temployeelist[0]
            let editableEmployee = {
              id: data.EmployeeID,
              lid: "Edit Employee",
              title: data.Title || "",
              firstname: data.FirstName || "",
              middlename: data.MiddleName || "",
              lastname: data.LastName || "",
              company: data.Company || "",
              tfn: data.TFN || "",
              priority: data.CUSTFLD5|| 0,
              color: data.CUSTFLD6 || "#00a3d3",
              email: data.Email || "",
              phone: data.Phone || "",
              mobile: data.Mobile || "",
              fax: data.FaxNumber || "",
              skype: data.SkypeName || "",
              gender: data.Sex || "",
              dob: data.DOB ? moment(data.DOB).format("DD/MM/YYYY") : "",
              startdate: data.DateStarted ? moment(data.DateStarted).format("DD/MM/YYYY") : "",
              datefinished: data.DateFinished ? moment(data.DateFinished).format("DD/MM/YYYY") : "",
              position: data.Position || "",
              streetaddress: data.Street || "",
              city: data.Street2 || "",
              state: data.State || "",
              postalcode: data.Postcode || "",
              country: data.Country || LoggedCountry,
              custfield1: data.CUSTFLD1 || "",
              custfield2: data.CUSTFLD2 || "",
              custfield3: data.CUSTFLD3 || "",
              custfield4: data.CUSTFLD4 || "",
              custfield14: data.CUSTFLD14 || "",
              website: "",
              notes: data.Notes || "",
            };
      
            templateObject.editableEmployee.set(editableEmployee);
          })
          .catch(function (err) {
          });
      };
      modifyEditModal()
      LoadingOverlay.hide();
    }
  },
  "click #btnNewEmployee"(event) {
    $("#addEmployeeModal").modal("toggle");
    $("#view-in-active").html(
      "<button class='btn btn-danger btnDeleteEmp vs1ButtonMargin' id='view-in-active' type='button'><i class='fa fa-trash' style='padding-right: 8px;'></i>Make In-Active</button>"
    );
    let templateObject = Template.instance();
    LoadingOverlay.show();
    templateObject.editableEmployee.set(null);
    LoadingOverlay.hide();
  },
  "click .btnActiveEmp": function () {
    $("#view-in-active").html(
      "<button class='btn btn-danger btnDeleteEmp vs1ButtonMargin' id='view-in-active' type='button'><i class='fa fa-trash' style='padding-right: 8px;'></i>Make In-Active</button>"
    );
  },
  "click .btnDeleteEmp": function () {
    $("#view-in-active").html(
      "<button class='btn btn-success btnActiveEmp vs1ButtonMargin' id='view-in-active' type='button'><i class='fa fa-trash' style='padding-right: 8px;'></i>Make Active</button>"
    );
  },
  "click .btnAddVS1User"(event) {
    swal({
      title: "Is this an existing Employee?",
      text: "",
      type: "question",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    }).then((result) => {
      if (result.value) {
        swal("Please select the employee from the list below.", "", "info");
        $("#employeeListModal").modal("toggle");
      } else if (result.dismiss === "cancel") {
        $("#addEmployeeModal").modal("toggle");
      }
    });
  },
  "click .resetEmployeeTable"(event) {
    var getcurrentCloudDetails = CloudUser.findOne({
      _id: localStorage.getItem("mycloudLogonID"),
      clouddatabaseID: localStorage.getItem("mycloudLogonDBID"),
    });
    if (getcurrentCloudDetails) {
      if (getcurrentCloudDetails._id.length > 0) {
        var clientID = getcurrentCloudDetails._id;
        var checkPrefDetails = CloudPreference.findOne({
          userid: clientID,
          PrefName: "tblSetupEmployeelist",
        });
        if (checkPrefDetails) {
          CloudPreference.remove(
            {
              _id: checkPrefDetails._id,
            },
            function (err, idTag) {
              if (err) {
              } else {
                // Meteor._reload.reload();
              }
            }
          );
        }
      }
    }
  },
  "click .saveEmployeeTable"(event) {
    let lineItems = [];
    $(".columnSettings").each(function (index) {
      var $tblrow = $(this);
      var colTitle = $tblrow.find(".divcolumnEmployee").text() || "";
      var colWidth = $tblrow.find(".custom-range").val() || 0;
      var colthClass = $tblrow.find(".divcolumnEmployee").attr("valueupdate") || "";
      var colHidden = false;
      if ($tblrow.find(".custom-control-input").is(":checked")) {
        colHidden = false;
      } else {
        colHidden = true;
      }
      let lineItemObj = {
        index: index,
        label: colTitle,
        hidden: colHidden,
        width: colWidth,
        thclass: colthClass,
      };

      lineItems.push(lineItemObj);
    });

    var getcurrentCloudDetails = CloudUser.findOne({
      _id: localStorage.getItem("mycloudLogonID"),
      clouddatabaseID: localStorage.getItem("mycloudLogonDBID"),
    });
    if (getcurrentCloudDetails) {
      if (getcurrentCloudDetails._id.length > 0) {
        var clientID = getcurrentCloudDetails._id;
        var clientUsername = getcurrentCloudDetails.cloudUsername;
        var clientEmail = getcurrentCloudDetails.cloudEmail;
        var checkPrefDetails = CloudPreference.findOne({
          userid: clientID,
          PrefName: "tblSetupEmployeelist",
        });
        if (checkPrefDetails) {
          CloudPreference.update(
            {
              _id: checkPrefDetails._id,
            },
            {
              $set: {
                userid: clientID,
                username: clientUsername,
                useremail: clientEmail,
                PrefGroup: "salesform",
                PrefName: "tblSetupEmployeelist",
                published: true,
                customFields: lineItems,
                updatedAt: new Date(),
              },
            },
            function (err, idTag) {
              if (err) {
                $("#btnOpenSettingsEmployee").modal("toggle");
              } else {
                $("#btnOpenSettingsEmployee").modal("toggle");
              }
            }
          );
        } else {
          CloudPreference.insert(
            {
              userid: clientID,
              username: clientUsername,
              useremail: clientEmail,
              PrefGroup: "salesform",
              PrefName: "tblSetupEmployeelist",
              published: true,
              customFields: lineItems,
              createdAt: new Date(),
            },
            function (err, idTag) {
              if (err) {
                $("#btnOpenSettingsEmployee").modal("toggle");
              } else {
                $("#btnOpenSettingsEmployee").modal("toggle");
              }
            }
          );
        }
      }
    }
    $("#btnOpenSettingsEmployee").modal("toggle");
  },
  "click .btnRefreshEmployee": () => {
    $(".fullScreenSpin").css("display", "inline-block");
    let templateObject = Template.instance();

    sideBarService.getAllEmployees(initialBaseDataLoad, 0).then(function (dataEmployee) {
      addVS1Data("TEmployee", JSON.stringify(dataEmployee));
    });

    sideBarService
      .getAllAppointmentPredList()
      .then(function (dataPred) {
        addVS1Data("TAppointmentPreferences", JSON.stringify(dataPred))
          .then(function (datareturnPred) {
            sideBarService
              .getAllTEmployeeList(initialBaseDataLoad, 0, false)
              .then(function (data) {
                addVS1Data("TEmployeeList", JSON.stringify(data))
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
    const filename = "SampleEmployee" + ".csv";
    rows[0] = ["First Name", "Last Name", "Phone", "Mobile", "Email", "Skype", "Street", "City/Suburb", "State", "Post Code", "Country", "Gender"];
    rows[1] = [
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
      "M",
    ];
    rows[1] = [
      "Jane",
      "Smith",
      "9995551213",
      "9995551213",
      "janesmith@email.com",
      "janesmith",
      "123 Main Street",
      "Brooklyn",
      "New York",
      "1234",
      "United States",
      "F",
    ];
    utilityService.exportToCsv(rows, filename, "csv");
  },
  "click .templateDownloadXLSX": function (e) {
    e.preventDefault(); //stop the browser from following
    window.location.href = "sample_imports/SampleEmployee.xlsx";
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
    var saledateTime = new Date();
    //let empStartDate = new Date().format("YYYY-MM-DD");
    var empStartDate = moment(saledateTime).format("YYYY-MM-DD");
    Papa.parse(templateObject.selectedFile.get(), {
      complete: function (results) {
        if (results.data.length > 0) {
          if (
            results.data[0][0] == "First Name" &&
            results.data[0][1] == "Last Name" &&
            results.data[0][2] == "Phone" &&
            results.data[0][3] == "Mobile" &&
            results.data[0][4] == "Email" &&
            results.data[0][5] == "Skype" &&
            results.data[0][6] == "Street" &&
            (results.data[0][7] == "Street2" || results.data[0][7] == "City/Suburb") &&
            results.data[0][8] == "State" &&
            results.data[0][9] == "Post Code" &&
            results.data[0][10] == "Country" &&
            results.data[0][11] == "Gender"
          ) {
            let dataLength = results.data.length * 500;
            setTimeout(function () {
              sideBarService.getAllEmployees().then(function(dataReload){
                addVS1Data('TEmployee', JSON.stringify(dataReload)).then(function(datareturn) {
                  location.reload(true);
                }).catch(function(err) {
                  location.reload(true);
                });
              }).catch(function(err) {
                location.reload(true);
              });
            }, parseInt(dataLength));

            for (let i = 0; i < results.data.length - 1; i++) {
              objDetails = {
                type: "TEmployee",
                fields: {
                  FirstName: results.data[i + 1][0].trim(),
                  LastName: results.data[i + 1][1].trim(),
                  Phone: results.data[i + 1][2],
                  Mobile: results.data[i + 1][3],
                  DateStarted: empStartDate,
                  DOB: empStartDate,
                  Sex: results.data[i + 1][11] || "F",
                  Email: results.data[i + 1][4],
                  SkypeName: results.data[i + 1][5],
                  Street: results.data[i + 1][6],
                  Street2: results.data[i + 1][7],
                  Suburb: results.data[i + 1][7],
                  State: results.data[i + 1][8],
                  PostCode: results.data[i + 1][9],
                  Country: results.data[i + 1][10],

                  // BillStreet: results.data[i+1][6],
                  // BillStreet2: results.data[i+1][7],
                  // BillState: results.data[i+1][8],
                  // BillPostCode:results.data[i+1][9],
                  // Billcountry:results.data[i+1][10]
                },
              };
              if (results.data[i + 1][1]) {
                if (results.data[i + 1][1] !== "") {
                  contactService
                    .saveEmployee(objDetails)
                    .then(function (data) {})
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
                          location.reload(true)
                        } else if (result.dismiss === "cancel") {}
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
