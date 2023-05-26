import {ReactiveVar} from "meteor/reactive-var";
import {CoreService} from "../../js/core-service";
import {UtilityService} from "../../utility-service";
import {ContactService} from "../../contacts/contact-service";
import {ProductService} from "../../product/product-service";
import {SideBarService} from "../../js/sidebar-service";
import "jquery-editable-select";
import CachedHttp from "../../lib/global/CachedHttp";
import erpObject from "../../lib/global/erp-objects";
import moment from "moment";
import PayRun from "../../js/Api/Model/PayRun";
import LoadingOverlay from "../../LoadingOverlay";
import "../../lib/global/indexdbstorage";
import GlobalFunctions from "../../GlobalFunctions";
import Employee from "../../js/Api/Model/Employee";
import EmployeePayrollApi from "../../js/Api/EmployeePayrollApi";
import PayRunHandler from "../../js/ObjectManager/PayRunHandler";
import {Template} from 'meteor/templating';
import {FlowRouter} from 'meteor/ostrio:flow-router-extra';
import './payrundetails.html';

let utilityService = new UtilityService();
let contactService = new ContactService();
let sideBarService = new SideBarService();
let payRunHandler = new PayRunHandler();

const redirectToPayRollOverview = () => {
  window.location.href = `/payrolloverview`;
};

const getPayRuns = async () => {
  return await payRunHandler.loadFromLocal();
  // return JSON.parse(localStorage.getItem("TPayRunHistory")) || [];
};

const setPayRuns = items => {
  return localStorage.setItem("TPayRunHistory", JSON.stringify(items));
};

const setPayRun = () => {};

const addPayRun = () => {};

Template.payrundetails.onCreated(function () {
  this.calendarPeriod = new ReactiveVar([]);
  this.payRunDetails = new ReactiveVar();

  this.countEmployees = new ReactiveVar(0);
  this.timeSheetList = new ReactiveVar([]);

  this.datatablerecords = new ReactiveVar([]);
  this.tableheaderrecords = new ReactiveVar([]);

  this.getPayrunDatas = async () => {
    let data = this.payRunDetails.get();
    return data.employees;
  }

  this.getDataTableList = function (data) {
    const dataList = [
      data.ID || "",
      data.EmployeeName || "",
      data.EmployeeName || "",
      "",
      "",
      data.earningTotal ? GlobalFunctions.formatPrice(data.earningTotal) : "",
      data.taxTotal ? GlobalFunctions.formatPrice(data.taxTotal) : "",
      data.superAnnuationTotal ? GlobalFunctions.formatPrice(data.superAnnuationTotal) : "",
      data.netPay ? GlobalFunctions.formatPrice(data.netPay) : "",
    ];
    return dataList;
  };

  let headerStructure = [
    { index: 0, label: "ID", class: "colID", active: false, display: true, width: "10", },
    { index: 1, label: "First Name", class: "colPayRunDetailsFirstName", active: true, display: true, width: "200", },
    { index: 2, label: "Last Name", class: "colPayRunDetailsLastName", active: true, display: true, width: "200", },
    { index: 3, label: "Employee Group", class: "colPayRunDetailsEmployeeGroup", active: true, display: true, width: "250", },
    { index: 4, label: "Last Edited", class: "colPayRunDetailsLastEdited", active: true, display: true, width: "250", },
    { index: 5, label: "Earnings", class: "colPayRunDetailsEarnings", active: true, display: true, width: "100", },
    { index: 6, label: "Tax", class: "colPayRunDetailsTax", active: true, display: true, width: "100", },
    { index: 7, label: "Super", class: "colPayRunDetailsSuper", active: true, display: true, width: "100", },
    { index: 8, label: "Net Pay", class: "colPayRunDetailsNetPay", active: true, display: true, width: "100", },
  ];

  this.tableheaderrecords.set(headerStructure);
});

Template.payrundetails.onRendered(function () {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  $("#date-input,#dateTo,#dateFrom").datepicker({
    showOn: "button",
    buttonText: "Show Date",
    buttonImageOnly: true,
    buttonImage: "/img/imgCal2.png",
    dateFormat: "dd/mm/yy",
    showOtherMonths: true,
    selectOtherMonths: true,
    changeMonth: true,
    changeYear: true,
    yearRange: "-90:+10"
  });

  /**
     * Load the selected calendar data
     * from the url cid=??
     * This will load single calendar
     */
  this.loadCalendar = async (id = null) => {
    let data = await CachedHttp.get(erpObject.TPayrollCalendars, async () => {
      return await sideBarService.getCalender(initialBaseDataLoad, 0);
    }, {
      useIndexDb: true,
      useLocalStorage: false,
      validate: cachedResponse => {
        return true;
      }
    });

    data = data.response;

    let calendar = null;

    if (id) {
      calendar = data.tpayrollcalendars.find(calendar => calendar.fields.ID == id);
      if (calendar) {
        calendar = calendar.fields;

        return calendar;
      }
      return null;
    }
    return null;
  };

  /**
     * Load employees
     */
  const getPayHistoryOfEmployee = async (fromRemote = false, employeeId = null) => {
    let data = await CachedHttp.get(erpObject.TPayHistory, async () => {
      return await sideBarService.getAllPayHistoryDataVS1(initialBaseDataLoad, 0);
    }, {
      useIndexDb: true,
      useLocalStorage: false,
      validate: cResponse => {
        return !fromRemote;
      }
    });

    data = data.response;

    let payHistoryOfEmployee = data.tpayhistory.filter(p => p.fields.Employeeid == employeeId);

    return payHistoryOfEmployee;
  };

  this.loadEmployees = async() => {
    let employees = [];
    let response = await getVS1Data(erpObject.TEmployee);
    if(response.length == 0){
      let data = await CachedHttp.get(erpObject.TEmployee, async () => {
        return await sideBarService.getAllEmployeesDataVS1(initialBaseDataLoad, 0);
        }, {
          useIndexDb: true,
          useLocalStorage: false,
          validate: cachedResponse => {
            return true;
          }
        });

      data = data.response;
      employees = Employee.fromList(data);
      await addVS1Data('TEmployee', JSON.stringify(employees));
      employees = employees.temployee;
    }else{
      let data = JSON.parse(response[0].data);
      employees = data.temployee;
    }
    return employees;
  };
  // this.loadEmployees = async () => {
  //   let data = await CachedHttp.get(erpObject.TEmployee, async () => {
  //     return await sideBarService.getAllEmployeesDataVS1(initialBaseDataLoad, 0);
  //   }, {
  //     useIndexDb: true,
  //     useLocalStorage: false,
  //     validate: cachedResponse => {
  //       return true;
  //     }
  //   });

  //   data = data.response;

  //   let employees = Employee.fromList(data.temployee);

  //   // await GlobalFunctions.asyncForEach(employees, async (employee, index, array) => {
  //   //   employee.PayHistory = await getPayHistoryOfEmployee(false, employee.fields.ID);
  //   // });

  //   return employees;
  // };

  /**
     * Supernnuation
     */

  this.loadSuperAnnuationPerEmployee = async employee => {
    let superAnnuation = 123.0;

    return superAnnuation;
  };

  this.loadSuperAnnuations = async () => {
    let payRunDetails = this.payRunDetails.get();

    payRunDetails.employees.forEach((e, index) => {
      payRunDetails.employees[index].superAnnuation = this.loadSuperAnnuationPerEmployee(e);
    });

    this.payRunDetails.set(payRunDetails);
  };

  this._getTimeSheetDetails = async (timesheetId = null, list = false) => {
    let response = await getVS1Data(erpObject.TTimeSheetDetails);

    if (response.length > 0) {
      let timesheetsDetails = JSON.parse(response[0].data);

      if (timesheetId) {
        return list == true
          ? timesheetsDetails.filter(time => time.timeSheetId == timesheetId)
          : timesheetsDetails.find(time => time.timeSheetId == timesheetId);
      }
      return timesheetsDetails;
    }
    return undefined;
  };

  this.loadTimesheets = async refresh => {
    // From the timesheets
    let data = await CachedHttp.get(erpObject.TTimeSheet, async () => {
      return await contactService.getAllTimeSheetList();
    }, {
      forceOverride: refresh,
      validate: cachedResponse => {
        return true;
      }
    });
    data = data.response;

    timesheets = data.ttimesheet.map(t => t.fields);
    timesheets.forEach((t, index) => {
      if (t.Status == "") {
        t.Status = "Draft";
      }
    });

    // We want only aproved ones
    timesheets = timesheets.filter(time => time.Status == "Approved");
    // We load all timsheets
    await this.timeSheetList.set(timesheets);

    return timesheets;
  };

  /**
     * earnings
     */
  this.loadEmployeeEarnings = async (employeeID, refresh = false) => {
    let timesheets = await this.timeSheetList.get();
    if (timesheets.length == 0) {
      // From the timesheets
      let data = await CachedHttp.get(erpObject.TTimeSheet, async () => {
        return await contactService.getAllTimeSheetList();
      }, {
        forceOverride: refresh,
        validate: cachedResponse => {
          return true;
        }
      });
      data = data.response;

      timesheets = data.ttimesheet.map(t => t.fields);
      timesheets.forEach((t, index) => {
        if (t.Status == "") {
          t.Status = "Draft";
        }
      });

      // We want only aproved ones
      timesheets = timesheets.filter(time => time.Status == "Approved");
      // We load all timsheets
      await this.timeSheetList.set(timesheets);
    }

    // We need to fint the right timesheet of the employee
    // Depending on the PayPeriod ? Payment Date ?
    let timesheet = timesheets.find(o => o.ID == employeeID);

    if (timesheet) {
      // this.timesheet.set(timesheet);
      // this.weeklyTotal.set(timesheet.Hours);
    } else {
      LoadingOverlay.hide(0);
      // const result = await swal({
      //   title: `Timesheet ${id} is not found`,
      //   text: "Please log out to activate your changes.",
      //   type: "error",
      //   showCancelButton: false,
      //   confirmButtonText: "OK"
      // });

      // if (result.value) {
      //    redirectToPayRollOverview();
      // } else if (result.dismiss === "cancel") {}
    }
    // of the corresponding pay date
  };

  // this.loadEmployeePayTemplateEarnings = async (employeeID, refresh = false) => {
  //   let data = await CachedHttp.get(erpObject.TPayTemplateEarningLine, async () => {
  //     const employeePayrolApis = new EmployeePayrollApi();
  //     const employeePayrolEndpoint = employeePayrolApis.collection.findByName(employeePayrolApis.collectionNames.TPayTemplateEarningLine);
  //     employeePayrolEndpoint.url.searchParams.append("ListType", "'Detail'");

  //     const response = await employeePayrolEndpoint.fetch();
  //     if (response.ok == true) {
  //       return await response.json();
  //     }
  //     return null;
  //   }, {
  //     forceOverride: refresh,
  //     validate: cachedResponse => {
  //       return true;
  //     }
  //   });

  //   let response = data.response;

  //   let earningLines = response.tpaytemplateearningline.map(earning => earning.fields);
  //   if (employeeID) {
  //     earningLines = earningLines.filter(item => parseInt(item.EmployeeID) == parseInt(employeeID));
  //   }

  //   return earningLines;
  // };

  /**
     * Taxes
     */

  this.loadGeneration = () => {};

  this.loadPayRunData = async () => {
    LoadingOverlay.show();
    let payRunDetails = null;
    let data = await CachedHttp.get(erpObject.TPayRunHistory, async () => {
      return await getPayRuns();
    }, {
      useIndexDb: true,
      useLocalStorage: false,
      fallBackToLocal: true,
      forceOverride: true,
      validate: cachedResponse => {
        return true;
      }
    });

    data = data.response;
    
    let payRunsHistory = PayRun.fromList(data); // list of all payruns

    const isDraftAlreadyAvailableByCalendarId = calendarId => {
      return payRunsHistory.some(p => p.calendarId == calendarId && p.stpFilling == PayRun.STPFilling.draft); // we search by calendar ID
    };

    const getDraftedPayunByCalendarId = calendarId => {
      return payRunsHistory.find(p => p.calendarId == calendarId && p.stpFilling == PayRun.STPFilling.draft); // we search by calendar ID
    };

    const generateNewDraftPayRun = async () => {
      const calendarId = urlParams.get("cid"); // to generate a new one, you must have CID query param
      const timesheets = await this.loadTimesheets();
      const calendar = await this.loadCalendar(calendarId); // single calendar
      let employees = await this.loadEmployees();
      /**
             * We do this so we avoid api request loop
             * @returns [taxes]
             */
      const getAllTaxes = async () => {
        /**
                 * Load EmployeePayrollApi API
                 */
        // const employeePayrollApi = new EmployeePayrollApi();

        // const apiEndpoint = employeePayrollApi.collection.findByName(employeePayrollApi.collectionNames.TEmployeepaysettings);
        // apiEndpoint.url.searchParams.append("ListType", "'Detail'");
        // const ApiResponse = await apiEndpoint.fetch();

        // if (ApiResponse.ok) {
        //   const data = await ApiResponse.json();
        //   return data.temployeepaysettings;
        // }
        // return null;
        let employeePaySettings;
        let response = await getVS1Data(erpObject.TEmployeepaysettings);
        if(response.length == 0){
          let data = await CachedHttp.get(erpObject.TEmployeepaysettings, async () => {
            return await sideBarService.getAllEmployeePaySettings(initialBaseDataLoad, 0);
            }, {
              useIndexDb: true,
              useLocalStorage: false,
              validate: cachedResponse => {
                return true;
              }
            });
    
          data = data.response;
          employeePaySettings = data.temployeepaysettings;
          await addVS1Data('TEmployeepaysettings', JSON.stringify(employeePaySettings));
        }else{
          let data = JSON.parse(response[0].data);
          employeePaySettings = data.temployeepaysettings;
        }
        return employeePaySettings;
      };
      const _taxes = await getAllTaxes();

      // Load taxes for all employees
      // await GlobalFunctions.asyncForEach(employees, async (employee, index) => {
      //   await employee.getTaxe(_taxes);
      // });

      /**
             * Filter the list depending on the calendar
             */
      employees = employees.filter((employee) => {
        if (employee.taxes != null) {
          if (calendar.PayrollCalendarPayPeriod == employee.taxes.Payperiod) {
            return true;
          } else {
            return false;
          }
        }
        return false;
      });

      // Load taxes for all employees
      await GlobalFunctions.asyncForEach(employees, async (employee, index) => {
        await employee.getEarningPayTemplates(); // get their earning templates
        await employee.getEarnings({timesheets: timesheets}); // Get their earnings
        await employee.getSuperAnnuations(); // get their super annuations
        await employee.getTaxe(_taxes);

        employee.calculateNetPay();
      });

      payRunDetails = new PayRun({
        stpFilling: PayRun.STPFilling.draft,
        calendar: calendar,
        calendarId: calendarId,
        employees: employees,
        netPay: 0.0,
        superAnnuation: 0.0,
        taxes: 0.0,
        earnings: 0.0,
        selected: false
      });

      

      await payRunHandler.add(payRunDetails);
    };

    if (urlParams.has("cid")) {
      // Lets find the matching calendar
      const calendarId = urlParams.get("cid");

      if(isDraftAlreadyAvailableByCalendarId(calendarId)) {
        payRunDetails = getDraftedPayunByCalendarId(calendarId);  //we search by calendar ID
        payRunDetails.employees = Employee.fromList(payRunDetails.employees);
        payRunDetails.employees.forEach(e => {
          e.selected = true;
        });
      } else {
        await generateNewDraftPayRun();
      }
    } else if (urlParams.get("id")) {
      const payRunId = urlParams.get("id");
      payRunDetails = payRunsHistory.find(p => p.id == payRunId);

      if (payRunDetails) {
        // This will just re-setup the object from the payrun object
        // just in order to update objects (no data update)
        payRunDetails.employees = Employee.fromList(payRunDetails.employees);
        payRunDetails.employees.forEach(e => {
          e.selected = true;
        });
      } else {
        LoadingOverlay.hide(0);
        const result = await swal({
          title: `Couldn't find PayRun ${payRunId}`,
          //text: "Please log out to activate your changes.",
          type: "error",
          showCancelButton: false,
          confirmButtonText: "OK"
        });

        if (result.value) {
          redirectToPayRollOverview();
        } else if (result.dismiss === "cancel") {}
      }
    }

    // this.loadSuperAnnuations();
    await this.payRunDetails.set(payRunDetails);
    this.countEmployees.set(payRunDetails.employees.length);

    await this.calculateTableTotal();
    LoadingOverlay.hide();
  };

  this.calculateTableTotal = async () => {
    let payRunData = await this.payRunDetails.get();

    payRunData.employees.forEach(employee => {
      payRunData.earnings += employee.earningTotal;
      payRunData.taxes += employee.taxTotal;
      payRunData.netPay += employee.netPay;
      payRunData.superAnnuation += employee.superAnnuationTotal;
    });

    this.payRunDetails.set(payRunData);
  };

  /**
     * save to draft at page load
     */

  /**
     * Save to history function
     */

  this.postPayRun = async () => {
    let newPayRunDetails = new PayRun(this.payRunDetails.get());

    const toggleStatus = () => {
      return PayRun.STPFilling.overdue; // this should automatically done
    };

    newPayRunDetails.stpFilling = toggleStatus();

    // Filter the employees

    let employees = newPayRunDetails.employees.filter(e => e.selected == true);

    // If no employee selected
    if (employees.length == 0) {
      handleValidationError("You must add at least one employee!", "PayRunDetails");
      return false;
    }

    newPayRunDetails.employees = employees;

    // /**
    //      * UPdate the payrun
    //      */
    //  Get from the list
    // let payRunsHistory = getPayRuns();  we get the list and find
    //  let payRunDetails = payRunsHistory.find(p => p.calendar.ID == urlParams.get("cid"));

    // const index = payRunsHistory.findIndex(p => p.calendar.ID == urlParams.get("cid"));
    // payRunsHistory[index] = newPayRunDetails;
    // this.payRunDetails.set(newPayRunDetails);  no need to update this object
    // localStorage.setItem("TPayRunHistory", JSON.stringify(payRunsHistory));

    await payRunHandler.update(newPayRunDetails);
    await payRunHandler.saveToLocal();

    window.location.href = "/payrolloverview";
  };

  /**
     * Delete the currency payrun
     */
  this.deletePayRun = async () => {

    await payRunHandler.remove(await this.payRunDetails.get());
    await payRunHandler.saveToLocal();
    await payRunHandler.sync();

    window.location.href = "/payrolloverview";
  };

  this.initPage = async refresh => {
    LoadingOverlay.show();
    await this.loadPayRunData();

    LoadingOverlay.hide();
  };

  this.initPage();
});

Template.payrundetails.events({
  "click .colPayRunDetailsFirstName": function (event) {
    $(".modal-backdrop").css("display", "none");
    FlowRouter.go("/payslip");
  },

  "click #chkEFT": function (event) {
    if ($("#chkEFT").is(":checked")) {
      $("#eftExportModal").modal("show");
    } else {
      $("#eftExportModal").modal("hide");
    }
  },
  "click .post-pay-run": (e, ui) => {
    ui.postPayRun();
  },
  "click .delete-payrun": (e, ui) => {
    ui.deletePayRun();
  },

  "click .colPayRunDetailsDropdown input": (e, ui) => {
    const tr = $(e.currentTarget).closest("tr");
    const id = $(tr).attr("employee-id");

    let payRunDetails = ui.payRunDetails.get();

    payRunDetails.employees.forEach(em => {
      if (em.fields.ID == id) {
        em.selected = $(e.currentTarget).prop("checked");
      }
    });

    ui.payRunDetails.set(payRunDetails);
  },
  "click .close-payrun": (e, ui) => {
    window.location.href = "/payrolloverview";
  },
  "click .reset-payrun": (e, ui) => {
    window.location.reload();
  }
});

Template.payrundetails.helpers({
  countEmployees: () => {
    return Template.instance().countEmployees.get();
  },
  payRunDetails: () => {
    return Template.instance().payRunDetails.get();
  },
  PayRunStatus: status => {
    if (status == PayRun.STPFilling.notfilled) {
      return "Not filled";
    } else if (status == PayRun.STPFilling.draft) {
      return "Draft";
    } else if (status == PayRun.STPFilling.overdue) {
      return "Overdue";
    }
  },
  PaymentDateFormat: data => {
    if (data) {
      return moment(data).format("Do MMM YYYY");
    }
  },

  formatPrice: amount => GlobalFunctions.formatPrice(amount),

  tableheaderrecords: () => {
    return Template.instance().tableheaderrecords.get();
  },

  apiFunction: function () {
    return Template.instance().getPayrunDatas();
  },

  searchAPI: function () {
    return Template.instance().getPayrunDatas();
  },

  service: () => {
    return Template.instance();
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
