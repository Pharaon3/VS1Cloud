import { ReactiveVar } from 'meteor/reactive-var';
import { SideBarService } from '../js/sidebar-service';
import '../lib/global/indexdbstorage.js';
import {UtilityService} from "../utility-service";

import {Session} from 'meteor/session';
import { Template } from 'meteor/templating';
import './statuspop.html';

let sideBarService = new SideBarService();
let utilityService = new UtilityService();

Template.statuspop.onCreated(function() {
    const templateObject = Template.instance();
    templateObject.datatablerecords = new ReactiveVar([]);
    templateObject.tableheaderrecords = new ReactiveVar([]);
    templateObject.leadStatusList = new ReactiveVar();
    templateObject.getDataTableList = function(data){
        let linestatus = '';
        if (data.Active == true) {
            linestatus = "";
        } else if (data.Active == false) {
            linestatus = "In-Active";
        };
        let isDefault = "";
        if (data.IsDefault == true) {
            isDefault = '<div class="custom-control custom-switch chkBox text-center"><input class="custom-control-input chkBox" type="checkbox" id="iseomplus-' + data.ID + '" checked><label class="custom-control-label chkBox" for="iseomplus-' + data.ID + '"></label></div>';
        } else {
            isDefault = '<div class="custom-control custom-switch chkBox text-center"><input class="custom-control-input chkBox" type="checkbox" id="iseomplus-' + data.ID + '"><label class="custom-control-label chkBox" for="iseomplus-' + data.ID + '"></label></div>';
        };
        let eqpm = Number(data.EQPM) || 1;
        var dataList = [
            data.ID || "",
            data.TypeCode || "",
            data.Name || "",
            data.Description || "",
            isDefault,
            eqpm,
            linestatus   
            ];
        return dataList;
    }

    let headerStructure  = [
        { index: 0, label: 'ID', class: 'colLeadStatusID', active: false, display: true, width: "50" },
        { index: 1, label: 'Type Code', class: 'colLeadTypeCode', active: true, display: true, width: "120" },
        { index: 2, label: 'Lead Status Name', class: 'colStatusName', active: true, display: true, width: "200" },
        { index: 3, label: 'Description', class: 'colDescription', active: true, display: true, width: "700" },
        { index: 4, label: 'Is Default', class: 'colIsDefault', active: false, display: true, width: "180" },
        { index: 5, label: 'Expected Quantity per Month', class: 'colQuantity', active: true, display: true, width: "200" },
        { index: 6, label: 'Status', class: 'colStatus', active: true, display: true, width: "120" },
    ];

    templateObject.tableheaderrecords.set(headerStructure)

});

Template.statuspop.onRendered(function() {
    $('.fullScreenSpin').css('display', 'inline-block');
    let templateObject = Template.instance();
    const dataTableList = [];
    const tableHeaderList = [];
    // Meteor.call('readPrefMethod', localStorage.getItem('mycloudLogonID'), 'tblStatusPopList', function(error, result) {
    //     if (error) {

    //     } else {
    //         if (result) {
    //             for (let i = 0; i < result.customFields.length; i++) {
    //                 let customcolumn = result.customFields;
    //                 let columData = customcolumn[i].label;
    //                 let columHeaderUpdate = customcolumn[i].thclass.replace(/ /g, ".");
    //                 let hiddenColumn = customcolumn[i].hidden;
    //                 let columnClass = columHeaderUpdate.split('.')[1];
    //                 let columnWidth = customcolumn[i].width;
    //                 $("th." + columnClass + "").html(columData);
    //                 $("th." + columnClass + "").css('width', "" + columnWidth + "px");
    //             }
    //         }

    //     }
    // });

    // function MakeNegative() {
    //     $('td').each(function() {
    //         if ($(this).text().indexOf('-' + Currency) >= 0) $(this).addClass('text-danger')
    //     });
    // }

    // templateObject.getStatusList = function() {
    //     getVS1Data('TLeadStatusType').then(function(dataObject) {
    //         if (dataObject.length == 0) {
    //             sideBarService.getAllLeadStatus().then(function(data) {
    //                 setLeadStatus(data);
    //             }).catch(function(err) {
    //                 $('.fullScreenSpin').css('display', 'none');
    //             });
    //         } else {
    //             let data = JSON.parse(dataObject[0].data);
    //             setLeadStatus(data);
    //         }
    //     }).catch(function(err) {
    //         sideBarService.getAllLeadStatus().then(function(data) {
    //             setLeadStatus(data);
    //         }).catch(function(err) {
    //             $('.fullScreenSpin').css('display', 'none');
    //         });
    //     });
    // }
    // function setLeadStatus(data) {
    //     for (let i = 0; i < data.tleadstatustype.length; i++) {

    //         let eqpm = Number(data.tleadstatustype[i].EQPM) || 1;
    //         const dataList = {
    //             id: data.tleadstatustype[i].Id || '',
    //             typename: data.tleadstatustype[i].TypeName || '',
    //             description: data.tleadstatustype[i].Description || data.tleadstatustype[i].TypeName,
    //             eqpm: eqpm
    //         };
    //         dataTableList.push(dataList);
    //     }
    //     templateObject.datatablerecords.set(dataTableList);
    //     if (templateObject.datatablerecords.get()) {
    //         Meteor.call('readPrefMethod', localStorage.getItem('mycloudLogonID'), 'tblStatusPopList', function(error, result) {
    //             if (error) {

    //             } else {
    //                 if (result) {
    //                     for (let i = 0; i < result.customFields.length; i++) {
    //                         let customcolumn = result.customFields;
    //                         let columData = customcolumn[i].label;
    //                         let columHeaderUpdate = customcolumn[i].thclass.replace(/ /g, ".");
    //                         let hiddenColumn = customcolumn[i].hidden;
    //                         let columnClass = columHeaderUpdate.split('.')[1];
    //                         let columnWidth = customcolumn[i].width;
    //                         let columnindex = customcolumn[i].index + 1;
    //                         if (hiddenColumn == true) {
    //                             $("." + columnClass + "").addClass('hiddenColumn');
    //                             $("." + columnClass + "").removeClass('showColumn');
    //                         } else if (hiddenColumn == false) {
    //                             $("." + columnClass + "").removeClass('hiddenColumn');
    //                             $("." + columnClass + "").addClass('showColumn');
    //                         }
    //                     }
    //                 }
    //             }
    //         });
    //         setTimeout(function() {
    //             MakeNegative();
    //         }, 100);
    //     }
    //     $('.fullScreenSpin').css('display', 'none');
    //     // setTimeout(function() {
    //     //     $('#tblStatusPopList').DataTable({
    //     //         columnDefs: [{
    //     //             "orderable": false,
    //     //             "targets": -1
    //     //         }],
    //     //         select: true,
    //     //         destroy: true,
    //     //         colReorder: true,
    //     //         "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
    //     //         buttons: [{
    //     //             extend: 'csvHtml5',
    //     //             text: '',
    //     //             download: 'open',
    //     //             className: "btntabletocsv hiddenColumn",
    //     //             filename: "tblStatusPopList_" + moment().format(),
    //     //             orientation: 'portrait',
    //     //             exportOptions: {
    //     //                 columns: ':visible'
    //     //             }
    //     //         }, {
    //     //             extend: 'print',
    //     //             download: 'open',
    //     //             className: "btntabletopdf hiddenColumn",
    //     //             text: '',
    //     //             title: 'Term List',
    //     //             filename: "tblStatusPopList_" + moment().format(),
    //     //             exportOptions: {
    //     //                 columns: ':visible'
    //     //             }
    //     //         },
    //     //             {
    //     //                 extend: 'excelHtml5',
    //     //                 title: '',
    //     //                 download: 'open',
    //     //                 className: "btntabletoexcel hiddenColumn",
    //     //                 filename: "tblStatusPopList_" + moment().format(),
    //     //                 orientation: 'portrait',
    //     //                 exportOptions: {
    //     //                     columns: ':visible'
    //     //                 }
    //     //                 // ,
    //     //                 // customize: function ( win ) {
    //     //                 //   $(win.document.body).children("h1:first").remove();
    //     //                 // }

    //     //             }
    //     //         ],
    //     //         // bStateSave: true,
    //     //         // rowId: 0,
    //     //         paging: false,
    //     //         // "scrollY": "400px",
    //     //         // "scrollCollapse": true,
    //     //         info: true,
    //     //         responsive: true,
    //     //         "order": [
    //     //             [0, "asc"]
    //     //         ],
    //     //         // "aaSorting": [[1,'desc']],
    //     //         action: function() {
    //     //             $('#tblStatusPopList').DataTable().ajax.reload();
    //     //         },
    //     //         "fnDrawCallback": function(oSettings) {
    //     //             setTimeout(function() {
    //     //                 MakeNegative();
    //     //             }, 100);
    //     //         },
    //     //         language: { search: "",searchPlaceholder: "Search List..." },
    //     //         "fnInitComplete": function () {
    //     //             $("<button class='btn btn-primary btnAddNewStatus' data-dismiss='modal' data-toggle='modal' data-target='#newStatusPopModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>").insertAfter("#tblStatusPopList_filter");
    //     //             $("<button class='btn btn-primary btnRefreshStatus' type='button' id='btnRefreshStatus' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblStatusPopList_filter");
    //     //         },

    //     //     }).on('page', function() {
    //     //         setTimeout(function() {
    //     //             MakeNegative();
    //     //         }, 100);
    //     //         let draftRecord = templateObject.datatablerecords.get();
    //     //         templateObject.datatablerecords.set(draftRecord);
    //     //     }).on('column-reorder', function() {

    //     //     }).on('length.dt', function(e, settings, len) {
    //     //         setTimeout(function() {
    //     //             MakeNegative();
    //     //         }, 100);
    //     //     });
    //     //     $('.fullScreenSpin').css('display', 'none');
    //     // }, 10);
    //     const columns = $('#tblStatusPopList th');
    //     let sTible = "";
    //     let sWidth = "";
    //     let sIndex = "";
    //     let sVisible = "";
    //     let columVisible = false;
    //     let sClass = "";
    //     $.each(columns, function(i, v) {
    //         if (v.hidden == false) {
    //             columVisible = true;
    //         }
    //         if ((v.className.includes("hiddenColumn"))) {
    //             columVisible = false;
    //         }
    //         sWidth = v.style.width.replace('px', "");
    //         let datatablerecordObj = {
    //             sTitle: v.innerText || '',
    //             sWidth: sWidth || '',
    //             sIndex: v.cellIndex || '',
    //             sVisible: columVisible || false,
    //             sClass: v.className || ''
    //         };
    //         tableHeaderList.push(datatablerecordObj);
    //     });
    //     templateObject.tableheaderrecords.set(tableHeaderList);
    //     $('div.dataTables_filter input').addClass('form-control form-control-sm');
    // }
    // templateObject.getStatusList();
   
});

Template.statuspop.events({
    'click .btnAddNewStatus': function (event) {
        $('#add-leadstatus-title').text('Add New Lead Status');
        $('#statusID').val('');
        $('#edtLeadStatusName').val('');
        $('#statusDescription').val('');
        $('#statusQuantity').val(1.0);
        $('#newStatusPopModal').modal('show');
        $('#view-in-active').html("<button class='btn btn-danger btnDeleteLeadStatus vs1ButtonMargin' id='view-in-active' type='button'><i class='fa fa-trash' style='padding-right: 8px;'></i>Make In-Active</button>");
    },
    "click #tblStatusPopList tbody tr": (event) => {
        
        // const statusName = $(e.currentTarget).find("td.colStatusName").text();
        let targetID = $(event.target).closest('tr').find(".colLeadStatusID").text();
        let description = $(event.target).closest('tr').find('.colDescription').text();
        let statusName = $(event.target).closest('tr').find('.colStatusName').text();
        let quantity = $(event.target).closest('tr').find('.colQuantity').text();
        let status = $(event.target).closest('tr').find('.colStatus').text();
        // $(event.currentTarget).parents(".modal").modal("hide");
        $('#statusID').val(targetID);
        $('#statusDescription').val(description);
        $('#statusQuantity').val(quantity);
        $("#edtLeadStatusName").val(statusName);
        $("#edtLeadStatusName").attr("value", statusName);
        $("#edtLeadStatusName").trigger("change");
        if(status == "In-Active"){
            $('#view-in-active').html("<button class='btn btn-success btnActivateLeadStatus vs1ButtonMargin' id='view-in-active' type='button'><i class='fa fa-trash' style='padding-right: 8px;'></i>Make Active</button>");
        }else{
            $('#view-in-active').html("<button class='btn btn-danger btnDeleteLeadStatus vs1ButtonMargin' id='view-in-active' type='button'><i class='fa fa-trash' style='padding-right: 8px;'></i>Make In-Active</button>");
        }
      },
    'click .closeStatusPop': function () {
        $('#statusPopModal').modal('hide');
    },
});

Template.statuspop.helpers({
    datatablerecords: () => {
        let aaa =  Template.instance().datatablerecords.get().sort(function(a, b) {
            if (a.typename == 'NA') {
                return 1;
            } else if (b.typename == 'NA') {
                return -1;
            }
            return (a.typename.toUpperCase() > b.typename.toUpperCase()) ? 1 : -1;
        });
        return aaa
    },
    tableheaderrecords: () => {
        return Template.instance().tableheaderrecords.get();
    },
    salesCloudPreferenceRec: () => {
        return CloudPreference.findOne({
            userid: localStorage.getItem('mycloudLogonID'),
            PrefName: 'tblStatusPopList'
        });
    },
    loggedCompany: () => {
        return localStorage.getItem('mySession') || '';
    },
    apiFunction:function() {
        let sideBarService = new SideBarService();
        return sideBarService.getLeadStatusDataList;
    },

    searchAPI: function() {
        return sideBarService.getLeadStatusByName;
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
        return ["limitcount", "limitfrom", "deleteFilter"];
    },
});

Template.registerHelper('equals', function(a, b) {
    return a === b;
});
