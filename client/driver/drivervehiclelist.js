import {ContactService} from "../contacts/contact-service";
import {ReactiveVar} from 'meteor/reactive-var';
import {UtilityService} from "../utility-service";
import XLSX from 'xlsx';
import {SideBarService} from '../js/sidebar-service';
import '../lib/global/indexdbstorage.js';

let sideBarService = new SideBarService();

import {Template} from 'meteor/templating';
import './drivervehiclelist.html';
import {FlowRouter} from 'meteor/ostrio:flow-router-extra';

//Template.drivervehiclelist.inheritsHooksFrom('non_transactional_list');
Template.drivervehiclelist.onCreated(function () {
    const templateObject = Template.instance();
    templateObject.datatablerecords = new ReactiveVar([]);
    templateObject.tableheaderrecords = new ReactiveVar([]);
    templateObject.selectedFile = new ReactiveVar();
    templateObject.displayfields = new ReactiveVar([]);
    templateObject.reset_data = new ReactiveVar([]);
    templateObject.setupFinished = new ReactiveVar();
    templateObject.employees = new ReactiveVar([]);


    templateObject.getDataTableList = function (data) {
        let linestatus = '';
        if (data.Active == true) {
            linestatus = "";
        } else if (data.Active == false) {
            linestatus = "In-Active";
        };
        let chkBox = '<div class="custom-control custom-switch chkBox pointer text-center">' +
        '<input name="pointer" class="custom-control-input chkBox notevent pointer" type="checkbox" id="' + data.EmployeeID + '" name="' + data.EmployeeID + '">' +
        '<label class="custom-control-label chkBox pointer" for="' + data.EmployeeID + '"></label></div>';
        if(!data.isDriver){
            var dataList = [
                chkBox,
                data.EmployeeID || "",
                data.EmployeeName || "",
                data.FirstName || "",
                data.LastName || "",
                data.Type || "Employee",
                data.Phone || "",
                data.Street || "",
                data.State || "",
                data.ShiftTimes || "",
                data.StartLocations || "",
                data.Vehicle || "",
                linestatus,
            ];
            return dataList;
        }
    }

    let checkBoxHeader = `<div class="custom-control custom-switch colChkBoxAll chkBoxAll text-center pointer">
        <input name="pointer" class="custom-control-input colChkBoxAll pointer" type="checkbox" id="colChkBoxAll" value="0">
        <label class="custom-control-label colChkBoxAll" for="colChkBoxAll"></label>
        </div>`;

    let headerStruct = [
        {index: 0, label: 'checkBoxHeader', class: 'colCheckBox', active: true, display: false, width: "20"},
        {index: 1, label: 'Emp', class: 'colEmployeeNo', active: false, display: true, width: "10"},
        {index: 2, label: 'Contact Name', class: 'colEmployeeName', active: true, display: true, width: "200"},
        {index: 3, label: 'First Name', class: 'colFirstName', active: true, display: true, width: "100"},
        {index: 4, label: 'Last Name', class: 'colLastName', active: true, display: true, width: "100"},
        {index: 5, label: 'Type', class: 'colType', active: true, display: true, width: "20"},
        {index: 6, label: 'Phone', class: 'colPhone', active: true, display: true, width: "110"},
        {index: 7, label: 'Address', class: 'colAddress', active: true, display: true, width: "300"},
        {index: 8, label: 'State', class: 'colState', active: true, display: true, width: "110"},
        {index: 9, label: 'ShiftTimes', class: 'colShiftTimes', active: true, display: true, width: "110"},
        {index: 10, label: 'StartLocations', class: 'colStartLocations', active: true, display: true, width: "300"},
        {index: 11, label: 'Vehicle', class: 'colVehicle', active: true, display: true, width: "110"},
        {index: 12, label: 'Status', class: 'colStatus', active: true, display: true, width: "120"},
    ];
    templateObject.tableheaderrecords.set(headerStruct);
});

Template.drivervehiclelist.onRendered(function () {
    var currentLoc = FlowRouter.current().route.path;
	if(currentLoc == "/drivervehiclelistcard") $("#newDriverModal").modal('toggle');
    $(".fullScreenSpin").css("display", "inline-block");
    let templateObject = Template.instance();
    let contactService = new ContactService();
    const customerList = [];
    let salesOrderTable;
    const splashArray = [];
    const dataTableList = [];
    const tableHeaderList = [];

    setTimeout(() => {
        this.$('.sorting:first').removeClass('sorting');
        this.$('.sorting_desc:first').removeClass('sorting_desc');
    }, 500);

    if (FlowRouter.current().queryParams.success) {
        $('.btnRefresh').addClass('btnRefreshAlert');
    }
    $('#tblDriverlist tbody').on('click', 'tr', function () {
        const listData = $(this).closest('tr').attr("id");
        if (listData) {
            let params = ''
            var queryParams = FlowRouter.current().queryParams;
            if (queryParams.bank) {
                let edtBankName = queryParams.edtBankName;
                let edtBankAccountName = queryParams.edtBankAccountName;
                let edtBSB = queryParams.edtBSB;
                let edtBankAccountNo = queryParams.edtBankAccountNo;
                let swiftCode = queryParams.swiftCode;
                let apcaNo = queryParams.apcaNo;
                let routingNo = queryParams.routingNo;
                let sltBankCodes = queryParams.sltBankCodes;
                params = '&bank=true&edtBankName=' + edtBankName 
                        + '&edtBankAccountName=' + edtBankAccountName 
                        + '&edtBSB=' + edtBSB 
                        + '&edtBankAccountNo=' + edtBankAccountNo 
                        + '&swiftCode=' + swiftCode 
                        + '&apcaNo=' + apcaNo 
                        + '&routingNo=' + routingNo 
                        + '&sltBankCodes=' + sltBankCodes;
            }
            FlowRouter.go('/employeescard?id=' + listData + params);
        }
    });
    $('#tblDriverlist tbody').on( 'click', 'td.colCheckBox', function (event) {
        event.stopImmediatePropagation();
    });
    
    checkSetupFinished();
});

Template.drivervehiclelist.events({
    "click .colChkBoxAll": function () {
        setTimeout(() => {
            this.$('.sorting:first').removeClass('sorting');
            this.$('.sorting_desc:first').removeClass('sorting_desc');
        }, 500);
    },
    "click .colEmployeeCard": (e, ui) => {
        const id = $(e.currentTarget).attr('id');
        if (id) {
            FlowRouter.go(`/employeescard?id=${id}`);
        }
    },
    'click #btnNewEmployee': function (event) {
        FlowRouter.go('/employeescard');
    },
    'click .btnAddVS1User': function (event) {
        swal({
            title: 'Is this an existing Employee?',
            text: '',
            type: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No'
        }).then((result) => {
            if (result.value) {
                swal("Please select the employee from the list below.", "", "info");
                $('#employeeListModal').modal('toggle');
                // result.dismiss can be 'overlay', 'cancel', 'close', 'esc', 'timer'
            } else if (result.dismiss === 'cancel') {
                FlowRouter.go('/employeescard?addvs1user=true');
            }
        })
    },
    'click .btnLoadMap': function (e) {
        e.preventDefault();
        var selectedData = [];
        $('#tblDriverlist input[type=checkbox]:checked').each(function() {
          var rowData = [];
          $(this).closest('tr').find('td').each(function() {
            rowData.push($(this).text());
          });
          selectedData.push(rowData);
        });
        addVS1Data("TSelectDriverList", JSON.stringify(selectedData)).then(function () {});
    },
    'click .exportbtn': function () {
        $('.fullScreenSpin').css('display', 'inline-block');
        jQuery('#tblDriverlist_wrapper .dt-buttons .btntabletocsv').click();
        $('.fullScreenSpin').css('display', 'none');

    },
    'click .exportbtnExcel': function () {
        $('.fullScreenSpin').css('display', 'inline-block');
        jQuery('#tblDriverlist_wrapper .dt-buttons .btntabletoexcel').click();
        $('.fullScreenSpin').css('display', 'none');
    },
    'click .btnRefresh': (e, ui) => {
        $('.fullScreenSpin').css('display', 'inline-block');
        let templateObject = Template.instance();
        window.location.reload();
    },
    'click .printConfirm': function (event) {
        playPrintAudio();
        setTimeout(function () {
            $('.fullScreenSpin').css('display', 'inline-block');
            jQuery('#tblDriverlist_wrapper .dt-buttons .btntabletopdf').click();
            $('.fullScreenSpin').css('display', 'none');
        }, delayTimeAfterSound);
    },
    "click .btnOpenSettings": function (event) {
        $('.displaySettings:first').css('display', 'none');
    },
    'click .templateDownload': function () {
        let utilityService = new UtilityService();
        let rows = [];
        const filename = 'SampleEmployee' + '.csv';
        rows[0] = ['First Name', 'Last Name', 'Phone', 'Mobile', 'Email', 'Skype', 'Street', 'City/Suburb', 'State', 'Post Code', 'Country', 'Gender'];
        rows[1] = ['John', 'Smith', '9995551213', '9995551213', 'johnsmith@email.com', 'johnsmith', '123 Main Street', 'Brooklyn', 'New York', '1234', 'United States', 'M'];
        rows[1] = ['Jane', 'Smith', '9995551213', '9995551213', 'janesmith@email.com', 'janesmith', '123 Main Street', 'Brooklyn', 'New York', '1234', 'United States', 'F'];
        utilityService.exportToCsv(rows, filename, 'csv');
    },
    'click .templateDownloadXLSX': function (e) {

        e.preventDefault();  //stop the browser from following
        window.location.href = 'sample_imports/SampleEmployee.xlsx';
    },
    'click .btnUploadFile': function (event) {
        $('#attachment-upload').val('');
        $('.file-name').text('');
        //$(".btnImport").removeAttr("disabled");
        $('#attachment-upload').trigger('click');

    },
    'change #attachment-upload': function (e) {
        let templateObj = Template.instance();
        var filename = $('#attachment-upload')[0].files[0]['name'];
        var fileExtension = filename.split('.').pop().toLowerCase();
        var validExtensions = ["csv", "txt", "xlsx"];
        var validCSVExtensions = ["csv", "txt"];
        var validExcelExtensions = ["xlsx", "xls"];

        if (validExtensions.indexOf(fileExtension) == -1) {
            swal('Invalid Format', 'formats allowed are :' + validExtensions.join(', '), 'error');
            $('.file-name').text('');
            $(".btnImport").Attr("disabled");
        } else if (validCSVExtensions.indexOf(fileExtension) != -1) {

            $('.file-name').text(filename);
            let selectedFile = event.target.files[0];
            templateObj.selectedFile.set(selectedFile);
            if ($('.file-name').text() != "") {
                $(".btnImport").removeAttr("disabled");
            } else {
                $(".btnImport").Attr("disabled");
            }
        } else if (fileExtension == 'xlsx') {
            $('.file-name').text(filename);
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
                var workbook = XLSX.read(data, {type: 'array'});

                var result = {};
                workbook.SheetNames.forEach(function (sheetName) {
                    var roa = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {header: 1});
                    var sCSV = XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]);
                    templateObj.selectedFile.set(sCSV);

                    if (roa.length) result[sheetName] = roa;
                });
                // see the result, caution: it works after reader event is done.

            };
            reader.readAsArrayBuffer(oFile);

            if ($('.file-name').text() != "") {
                $(".btnImport").removeAttr("disabled");
            } else {
                $(".btnImport").Attr("disabled");
            }

        }


    },
    'click .btnImport': function () {
        $('.fullScreenSpin').css('display', 'inline-block');
        let templateObject = Template.instance();
        let contactService = new ContactService();
        let objDetails;
        var saledateTime = new Date();
        //let empStartDate = new Date().format("YYYY-MM-DD");
        var empStartDate = moment(saledateTime).format("YYYY-MM-DD");
        Papa.parse(templateObject.selectedFile.get(), {
            complete: function (results) {

                if (results.data.length > 0) {
                    if ((results.data[0][0] == "First Name")
                        && (results.data[0][1] == "Last Name") && (results.data[0][2] == "Phone")
                        && (results.data[0][3] == "Mobile") && (results.data[0][4] == "Email")
                        && (results.data[0][5] == "Skype") && (results.data[0][6] == "Street")
                        && ((results.data[0][7] == "Street2") || (results.data[0][7] == "City/Suburb")) && (results.data[0][8] == "State")
                        && (results.data[0][9] == "Post Code") && (results.data[0][10] == "Country")
                        && (results.data[0][11] == "Gender")) {

                        let dataLength = results.data.length * 500;
                        setTimeout(function () {
                            // $('#importModal').modal('toggle');
                            //Meteor._reload.reload();
                            window.open('/employeelist?success=true', '_self');
                        }, parseInt(dataLength));

                        for (let i = 0; i < results.data.length - 1; i++) {
                            objDetails = {
                                type: "TEmployee",
                                fields:
                                    {
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
                                        Country: results.data[i + 1][10]
                                    }
                            };
                            if (results.data[i + 1][1]) {
                                if (results.data[i + 1][1] !== "") {
                                    contactService.saveEmployee(objDetails).then(function (data) {
                                        ///$('.fullScreenSpin').css('display','none');
                                        //Meteor._reload.reload();
                                    }).catch(function (err) {
                                        //$('.fullScreenSpin').css('display','none');
                                        swal({
                                            title: 'Oooops...',
                                            text: err,
                                            type: 'error',
                                            showCancelButton: false,
                                            confirmButtonText: 'Try Again'
                                        }).then((result) => {
                                            if (result.value) {
                                                Meteor._reload.reload();
                                            } else if (result.dismiss === 'cancel') {
                                            }
                                        });
                                    });
                                }
                            }
                        }
                    } else {
                        $('.fullScreenSpin').css('display', 'none');
                        swal('Invalid Data Mapping fields ', 'Please check that you are importing the correct file with the correct column headers.', 'error');
                    }
                } else {
                    $('.fullScreenSpin').css('display', 'none');
                    swal('Invalid Data Mapping fields ', 'Please check that you are importing the correct file with the correct column headers.', 'error');
                }

            }
        });
    },
    
    "click #btnNewDriverVehicle": function () {
        $("#newDriverModal").modal('toggle');
    },
    
    'click .btnEmployee': function (event) {
        event.preventDefault();
        $("#newDriverModal").modal('hide');
        FlowRouter.go("/employeescard");
    },
    'click .btnSupplier': function (event) {
        event.preventDefault();
        $("#newDriverModal").modal('hide');
        FlowRouter.go("/supplierscard");
    },


});

Template.drivervehiclelist.helpers({
    datatablerecords: () => {
        return Template.instance().datatablerecords.get().sort(function (a, b) {
            if (a.employeename == 'NA') {
                return 1;
            } else if (b.employeename == 'NA') {
                return -1;
            }
            return (a.employeename.toUpperCase() > b.employeename.toUpperCase()) ? 1 : -1;
        });
    },
    tableheaderrecords: () => {
        return Template.instance().tableheaderrecords.get();
    },
    salesCloudPreferenceRec: () => {
        return CloudPreference.findOne({userid: localStorage.getItem('mycloudLogonID'), PrefName: 'tblDriverlist'});
    },
    loggedCompany: () => {
        return localStorage.getItem('mySession') || '';
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
            let dataReturn = templateObject.getDataTableList(data)
            return dataReturn
        }
    },

    exDataHandler: function () {
        let templateObject = Template.instance();
        return function (data) {
            let dataReturn = templateObject.getDataTableList(data)
            return dataReturn
        }
    },

    apiParams: function () {
        return ['limitCount', 'limitFrom', 'deleteFilter'];
    },
});
