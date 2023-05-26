import { ReactiveVar } from "meteor/reactive-var";
import '../lib/global/erp-objects';
import 'jquery-ui-dist/external/jquery/jquery';
import 'jquery-ui-dist/jquery-ui';
import 'jQuery.print/jQuery.print.js';
import 'jquery-editable-select';
import { SideBarService } from "../js/sidebar-service";
import '../lib/global/indexdbstorage.js';
import { Template } from 'meteor/templating';
import './payrollcalendarpop.html';

let sideBarService = new SideBarService;

Template.payrollcalendarpop.onCreated(() => {
    const templateObject = Template.instance();
    templateObject.datatablerecords = new ReactiveVar([]);
    templateObject.tableheaderrecords = new ReactiveVar([]);
    templateObject.custfields = new ReactiveVar([]);
    templateObject.displayfields = new ReactiveVar([]);
    templateObject.reset_data = new ReactiveVar([]);
    templateObject.convertedStatus = new ReactiveVar();

    templateObject.getDataTableList = function(data){
        var status = data.fields.PayrollCalendarActive == true ? 'In-Active' : 'Active';
        let dataList = [
            data.fields.ID || "",
            data.fields.PayrollCalendarName || "",
            data.fields.PayrollCalendarPayPeriod || "",
            moment(data.fields.PayrollCalendarStartDate).format('DD/MM/YYYY') || "",
            moment(data.fields.PayrollCalendarFirstPaymentDate).format('DD/MM/YYYY') || "",
            data.fields.PayrollCalendarActive == true ? '' : 'In-Active',
        ];
        return dataList;
    }
    let headerStructure  = [
        { index: 0, label: 'ID', class: 'colCalenderID', active: false, display: true, width: "10" },
        { index: 1, label: 'Name', class: 'colPayCalendarName', active: true, display: true, width: "150" },
        { index: 2, label: 'Pay Period', class: 'colPayPeriod', active: true, display: true, width: "150" },
        { index: 3, label: 'Next Pay Period', class: 'colNextPayPeriod', active: true, display: true, width: "100" },
        { index: 4, label: 'Next Payment Date', class: 'colNextPaymentDate', active: true, display: true, width: "100" },
        { index: 5, label: 'Status', class: 'colStatus', active: true, display: true, width: "120" },
    ];
    templateObject.tableheaderrecords.set(headerStructure);
});

Template.payrollcalendarpop.onRendered(function() {
});


Template.payrollcalendarpop.helpers({

    deptrecords: () => {
        return Template.instance().deptrecords.get().sort(function(a, b) {
            if (a.department == 'NA') {
                return 1;
            } else if (b.department == 'NA') {
                return -1;
            }
            return (a.department.toUpperCase() > b.department.toUpperCase()) ? 1 : -1;
        });
    },


    isMobileDevices: () => {
        var isMobile = false;

        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) ||
            /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4))) {
            isMobile = true;
        }

        return isMobile;
    },

  salesCloudPreferenceRec: () => {
    return CloudPreference.findOne({
        userid: localStorage.getItem('mycloudLogonID'),
        PrefName: 'tblgrouptypelist'
    });
  },

  tableheaderrecords: () => {
    return Template.instance().tableheaderrecords.get();
  },

  apiFunction:function() {
    let sideBarService = new SideBarService();
    return sideBarService.getCalender;
  },

  searchAPI: function() {
    return sideBarService.getNewCalenderByNameOrPayPeriod;
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

Template.payrollcalendarpop.events({
    "click .btnAddNewPayCalender": (e, ui) => {
        let id = $("#paycalendarId").val();
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, "0");
        var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
        var yyyy = today.getFullYear();
        today = dd + "/" + mm + "/" + yyyy;
        $("#edtStartDate").val(today);
        $("#edtFirstPaymentDate").val(today);
        $("#paycalendarId").val(0);
        $("#calender_name").val("");
        $("#newPayCalendarLabel").text("Add New Pay Calender");
        $("#payperiod").val("");
      },
    
      "click .savenewcalender, click add-tblPayCalendars": (e, ui) => {
        LoadingOverlay.show();
        let taxRateService = new TaxRateService();
        let oldpaycalenderid = $("#paycalendarId").val() || 0;
        let payperiod = $("#payperiod").val() || "";
        let calender_name = $("#calender_name").val() || "";
        let startdate = $("#edtStartDate").val() || "";
        let FirstPaymentDate = $("#edtFirstPaymentDate").val() || "";
    
        if (payperiod === "") {
          LoadingOverlay.hide();
          swal("Pay period has not been selected!", "", "warning");
          e.preventDefault();
        } else if (calender_name === "") {
          LoadingOverlay.hide();
          swal("Calender Name Can not blank!", "", "warning");
          e.preventDefault();
        } else if (startdate === "") {
          LoadingOverlay.hide();
          swal("Start Date Has not been selected!", "", "warning");
          e.preventDefault();
        } else if (FirstPaymentDate === "") {
          LoadingOverlay.hide();
          swal("First Payment Date Has not been selected!", "", "warning");
          e.preventDefault();
        } else {
          if (oldpaycalenderid != 0) {
            LoadingOverlay.show();
            objDetails = {
              type: "TPayrollCalendars",
              fields: {
                ID: parseInt(oldpaycalenderid),
                PayrollCalendarPayPeriod: payperiod,
                PayrollCalendarName: calender_name,
                PayrollCalendarStartDate: moment(startdate, "DD/MM/YYYY").format("YYYY-MM-DD"),
                PayrollCalendarFirstPaymentDate: moment(FirstPaymentDate, "DD/MM/YYYY").format("YYYY-MM-DD"),
                PayrollCalendarActive: true
              }
            };
    
            taxRateService.saveCalender(objDetails).then(function (objDetails) {
              LoadingOverlay.hide();
              swal({title: "Success", text: "Pay Calendar saved successfully.", type: "success", showCancelButton: false, confirmButtonText: "Done"}).then(result => {
                if (result.value) {
                  sideBarService.getCalender(initialBaseDataLoad, 0).then(function (dataReload) {
                    addVS1Data("TPayrollCalendars", JSON.stringify(dataReload)).then(function (datareturn) {
                      $("#closemodel").trigger("click");
                      LoadingOverlay.show();
                      // window.open("/payrollrules?active_key=calender", "_self");
                      ui.loadCalendars();
                    }).catch(function (err) {
                      $("#closemodel").trigger("click");
                      LoadingOverlay.show();
    
                      // window.open("/payrollrules?active_key=calender", "_self");
                      ui.loadCalendars();
                    });
                  }).catch(function (err) {
                    $("#closemodel").trigger("click");
                    LoadingOverlay.show();
    
                    // window.open("/payrollrules?active_key=calender", "_self");
                    ui.loadCalendars();
                  });
                } else if (result.dismiss === "cancel") {}
              });
            }).catch(function (err) {
              LoadingOverlay.hide();
              swal({title: "Oooops...", text: err, type: "error", showCancelButton: false, confirmButtonText: "ok"}).then(result => {
                if (result.value) {} else if (result.dismiss === "cancel") {}
              });
            });
          } else {
            LoadingOverlay.show();
    
            taxRateService.checkCalenderName(calender_name).then(function (data) {
              calenderID = data.tpayrollcalendars;
              var calender_id = calenderID[0];
    
              objDetails = {
                type: "TPayrollCalendars",
                fields: {
                  ID: parseInt(calender_id.Id),
                  PayrollCalendarPayPeriod: payperiod,
                  PayrollCalendarName: calender_name,
                  PayrollCalendarStartDate: moment(startdate, "DD/MM/YYYY").format("YYYY-MM-DD"),
                  PayrollCalendarFirstPaymentDate: moment(FirstPaymentDate, "DD/MM/YYYY").format("YYYY-MM-DD"),
                  PayrollCalendarActive: true
                }
              };
    
              taxRateService.saveCalender(objDetails).then(function (objDetails) {
                LoadingOverlay.hide();
                swal({title: "Success", text: "Pay Calendar saved successfully.", type: "success", showCancelButton: false, confirmButtonText: "Done"}).then(result => {
                  if (result.value) {
                    sideBarService.getCalender(initialBaseDataLoad, 0).then(function (dataReload) {
                      addVS1Data("TPayrollCalendars", JSON.stringify(dataReload)).then(function (datareturn) {
                        $("#closemodel").trigger("click");
                        LoadingOverlay.show();
                        // window.open("/payrollrules?active_key=calender", "_self");
                        ui.loadCalendars();
                      }).catch(function (err) {
                        $("#closemodel").trigger("click");
                        LoadingOverlay.show();
                        // window.open("/payrollrules?active_key=calender", "_self");
                        ui.loadCalendars();
                      });
                    }).catch(function (err) {
                      $("#closemodel").trigger("click");
                      LoadingOverlay.show();
                      // window.open("/payrollrules?active_key=calender", "_self");
                      ui.loadCalendars();
                    });
                  } else if (result.dismiss === "cancel") {}
                });
              }).catch(function (err) {
                LoadingOverlay.hide();
                swal({title: "Oooops...", text: err, type: "error", showCancelButton: false, confirmButtonText: "ok"}).then(result => {
                  if (result.value) {} else if (result.dismiss === "cancel") {}
                });
              });
            }).catch(function (err) {
              objDetails = {
                type: "TPayrollCalendars",
                fields: {
                  PayrollCalendarPayPeriod: payperiod,
                  PayrollCalendarName: calender_name,
                  PayrollCalendarStartDate: moment(startdate, "DD/MM/YYYY").format("YYYY-MM-DD"),
                  PayrollCalendarFirstPaymentDate: moment(FirstPaymentDate, "DD/MM/YYYY").format("YYYY-MM-DD"),
                  PayrollCalendarActive: true
                }
              };
    
              taxRateService.saveCalender(objDetails).then(function (objDetails) {
                LoadingOverlay.hide();
                swal({title: "Success", text: "Pay Calendar saved successfully.", type: "success", showCancelButton: false, confirmButtonText: "Done"}).then(result => {
                  if (result.value) {
                    sideBarService.getCalender(initialBaseDataLoad, 0).then(function (dataReload) {
                      addVS1Data("TPayrollCalendars", JSON.stringify(dataReload)).then(function (datareturn) {
                        $("#closemodel").trigger("click");
                        LoadingOverlay.show();
                        // window.open("/payrollrules?active_key=calender", "_self");
                        ui.loadCalendars();
                      }).catch(function (err) {
                        $("#closemodel").trigger("click");
                        LoadingOverlay.show();
                        // window.open("/payrollrules?active_key=calender", "_self");
                        ui.loadCalendars();
                      });
                    }).catch(function (err) {
                      $("#closemodel").trigger("click");
                      LoadingOverlay.show();
                      // window.open("/payrollrules?active_key=calender", "_self");
                      ui.loadCalendars();
                    });
                  } else if (result.dismiss === "cancel") {}
                });
              }).catch(function (err) {
                LoadingOverlay.hide();
                swal({title: "Oooops...", text: err, type: "error", showCancelButton: false, confirmButtonText: "ok"}).then(result => {
                  if (result.value) {} else if (result.dismiss === "cancel") {}
                });
              });
            });
          }
        }
      }
});

Template.registerHelper('equals', function(a, b) {
    return a === b;
});
