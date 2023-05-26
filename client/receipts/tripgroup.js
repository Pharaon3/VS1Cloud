import { ReceiptService } from "./receipt-service";
import { ReactiveVar } from 'meteor/reactive-var';
import { SideBarService } from '../js/sidebar-service';
import '../lib/global/indexdbstorage.js';
import {UtilityService} from "../utility-service";
import {Session} from 'meteor/session';
import { Template } from 'meteor/templating';
import './tripgroup.html';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import XLSX from 'xlsx';
let receiptService = new ReceiptService();
let sideBarService = new SideBarService();
Template.tripgroup.onCreated(function(){
    const templateObject = Template.instance();
    templateObject.datatablerecords = new ReactiveVar([]);
    templateObject.tableheaderrecords = new ReactiveVar([]);
    templateObject.tripgrouprecords = new ReactiveVar();
    templateObject.selectedFile = new ReactiveVar();

    templateObject.getDataTableList = function(data) {
        let linestatus = '';
        if (data.Active == true) {
            linestatus = "";
        } else if (data.Active == false) {
            linestatus = "In-Active";
        };
        var dataList = [
            data.Id || "",
            data.TripName || "",
            data.Description || "",
            linestatus,
            // '<span class="table-remove"><button type="button" class="btn btn-danger btn-rounded btn-sm my-0"><i class="fa fa-remove"></i></button></span>'

        ];
        return dataList;
    }

    let headerStructure = [
        { index: 0, label: 'ID', class: 'colID', active: false, display: true, width: "50" },
        { index: 1, label: 'Trip-Group Name', class: 'colName', active: true, display: true, width: "300" },
        { index: 2, label: 'Description', class: 'colDescription', active: true, display: true, width: "1100" },
        { index: 3, label: 'Status', class: 'colStatus', active: true, display: true, width: "120" },
        // { index: 4, class: 'colDelete', active: true, display: true, width: "50" },

    ];
    templateObject.tableheaderrecords.set(headerStructure);
});

Template.tripgroup.onRendered(function() {
    $('.fullScreenSpin').css('display','inline-block');
    let templateObject = Template.instance();
    let receiptService = new ReceiptService();
    const tripGroupList = [];

    // Meteor.call('readPrefMethod',localStorage.getItem('mycloudLogonID'),'tripGroupList', function(error, result){
    //     if(error){

    //     }else{
    //         if(result){
    //             for (let i = 0; i < result.customFields.length; i++) {
    //                 let customcolumn = result.customFields;
    //                 let columData = customcolumn[i].label;
    //                 let columHeaderUpdate = customcolumn[i].thclass.replace(/ /g, ".");
    //                 let hiddenColumn = customcolumn[i].hidden;
    //                 let columnClass = columHeaderUpdate.split('.')[1];
    //                 let columnWidth = customcolumn[i].width;
    //                 $("th."+columnClass+"").html(columData);
    //                 $("th."+columnClass+"").css('width',""+columnWidth+"px");
    //             }
    //         }
    //     }
    // });

    // templateObject.getTripGroupList = function(){
    //     getVS1Data('TTripGroup').then(function (dataObject) {
    //         if(dataObject.length == 0){
    //             receiptService.getAllTripGroups().then(function(data){
    //                 setTripGroup(data);
    //             });
    //         }else{
    //             let data = JSON.parse(dataObject[0].data);
    //             setTripGroup(data);
    //         }
    //     }).catch(function (err) {
    //         receiptService.getAllTripGroups().then(function(data){
    //             setTripGroup(data);
    //         });
    //     });
    // };
    // function setTripGroup(data) {
    //     for (let i in data.ttripgroup){
    //         if (data.ttripgroup.hasOwnProperty(i)) {
    //             let Obj = {
    //                 id: data.ttripgroup[i].Id || ' ',
    //                 tripName: data.ttripgroup[i].TripName || ' ',
    //                 description: data.ttripgroup[i].Description || ' ',
    //             };
    //             tripGroupList.push(Obj);
    //         }
    //     }
    //     templateObject.tripgrouprecords.set(tripGroupList);
    //     $('.fullScreenSpin').css('display','none');
    // }
    // templateObject.getTripGroupList();

    $(document).on('click', '.table-remove', function() {
        event.stopPropagation();
        event.stopPropagation();
        const targetID = $(event.target).closest('tr').attr('id'); // table row ID
        $('#selectDeleteLineID').val(targetID);
        $('#deleteLineModal').modal('toggle');
        // if ($('.tripGroupList tbody>tr').length > 1) {
        // // if(confirm("Are you sure you want to delete this row?")) {
        // this.click;
        // $(this).closest('tr').remove();
        // //} else { }
        // event.preventDefault();
        // return false;
        // }
    });

    $('#tripGroupList tbody').on( 'click', 'tr .colName, tr .colDescription', function () {
        let ID = $(this).closest('tr').attr('id');
        if (ID) {
            $('#add-tripgroup-title').text('Edit Trip-Group');
            if (ID !== '') {
                ID = Number(ID);
                const tripGroupID = ID || '';
                const tripGroupName = $(event.target).closest("tr").find(".colName").text() || '';
                const tripGroupDesc = $(event.target).closest("tr").find(".colDescription").text() || '';
                $('#edtTripGroupID').val(tripGroupID);
                $('#edtTripGroupName').val(tripGroupName);
                $('#edtTripGroupDesc').val(tripGroupDesc);
                $('#tripGroupModal').modal('toggle');
            }
        }
    });
});

Template.tripgroup.events({
    'click .chkDatatable' : function(event){
        const columns = $('#tripGroupList th');
        let columnDataValue = $(event.target).closest("div").find(".divcolumn").text();
        $.each(columns, function(i,v) {
            let className = v.classList;
            let replaceClass = className[1];
            if(v.innerText == columnDataValue){
                if($(event.target).is(':checked')){
                    $("."+replaceClass+"").css('display','table-cell');
                    $("."+replaceClass+"").css('padding','.75rem');
                    $("."+replaceClass+"").css('vertical-align','top');
                }else{
                    $("."+replaceClass+"").css('display','none');
                }
            }
        });
    },
    'click .btnOpenSettings' : function(event){
        let templateObject = Template.instance();
        const columns = $('#tripGroupList th');
        const tableHeaderList = [];
        let sTible = "";
        let sWidth = "";
        let sIndex = "";
        let sVisible = "";
        let columVisible = false;
        let sClass = "";
        $.each(columns, function(i,v) {
            if(v.hidden == false){
                columVisible =  true;
            }
            if((v.className.includes("hiddenColumn"))){
                columVisible = false;
            }
            sWidth = v.style.width.replace('px', "");
            let datatablerecordObj = {
                sTitle: v.innerText || '',
                sWidth: sWidth || '',
                sIndex: v.cellIndex || '',
                sVisible: columVisible || false,
                sClass: v.className || ''
            };
            tableHeaderList.push(datatablerecordObj);
        });
        templateObject.tableheaderrecords.set(tableHeaderList);
    },
    'click .btnRefresh': function () {
        $('.fullScreenSpin').css('display','inline-block');
        sideBarService.getTripGroup().then(function(dataReload) {
            addVS1Data('TTripGroup',JSON.stringify(dataReload)).then(function (datareturn) {
                location.reload(true);
            }).catch(function (err) {
                location.reload(true);
            });
        }).catch(function(err) {
            location.reload(true);
        });
    },
    'click .btnDelete': function () {
        playDeleteAudio();
        let receiptService = new ReceiptService();
        setTimeout(function(){
        $('.fullScreenSpin').css('display','inline-block');
        
        let tripGroupId = $('#selectDeleteLineID').val();
        let objDetails = {
            type: "TTripGroup",
            fields: {
                Id: parseInt(tripGroupId),
                Active: false
            }
        };
        receiptService.saveTripGroup(objDetails).then(function (objDetails) {
            sideBarService.getTripGroup().then(function(dataReload) {
                addVS1Data('TTripGroup',JSON.stringify(dataReload)).then(function (datareturn) {
                    location.reload(true);
                }).catch(function (err) {
                    location.reload(true);
                });
            }).catch(function(err) {
                location.reload(true);
            });
        }).catch(function (err) {
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
            $('.fullScreenSpin').css('display','none');
        });
    }, delayTimeAfterSound);
    },
    'click .btnSave': function () {
        playSaveAudio();
        let receiptService = new ReceiptService();
        setTimeout(function(){
        $('.fullScreenSpin').css('display','inline-block');
        
        let tripGroupID = $('#edtTripGroupID').val();
        let tripGroupName = $('#edtTripGroupName').val();
        if (tripGroupName == '') {
            swal('Trip-Group name cannot be blank!', '', 'warning');
            $('.fullScreenSpin').css('display','none');
            return false;
        }
        let tripGroupDesc = $('#edtTripGroupDesc').val();
        let objDetails = '';
        if (tripGroupID == "") {
            receiptService.getOneTripGroupDataExByName(tripGroupName).then(function (data) {
                if (data.ttripgroup.length > 0) {
                    swal('Trip-Group name duplicated', '', 'warning');
                    $('.fullScreenSpin').css('display','none');
                    return false;
                } else {
                    objDetails = {
                        type: "TTripGroup",
                        fields: {
                            Active: true,
                            TripName: tripGroupName,
                            Description: tripGroupDesc
                        }
                    };
                    doSaveTripGroup(objDetails);
                }
            }).catch(function (err) {
                objDetails = {
                    type: "TTripGroup",
                    fields: {
                        Active: true,
                        TripName: tripGroupName,
                        Description: tripGroupDesc
                    }
                };
                // doSaveTripGroup(objDetails);
                $('.fullScreenSpin').css('display','none');
            });
        } else {
            objDetails = {
                type: "TTripGroup",
                fields: {
                    ID: parseInt(tripGroupID),
                    Active: true,
                    TripName: tripGroupName,
                    Description: tripGroupDesc
                }
            };
            doSaveTripGroup(objDetails);
        }
    }, delayTimeAfterSound);
        function doSaveTripGroup(objDetails) {
            receiptService.saveTripGroup(objDetails).then(function (objDetails) {
                sideBarService.getTripGroup().then(function(dataReload) {
                    addVS1Data('TTripGroup',JSON.stringify(dataReload)).then(function (datareturn) {
                        $('.fullScreenSpin').css('display','none');
                        location.reload(true);
                    }).catch(function (err) {
                        $('.fullScreenSpin').css('display','none');
                        location.reload(true);
                    });
                }).catch(function(err) {
                    $('.fullScreenSpin').css('display','none');
                    location.reload(true);
                });
            }).catch(function (err) {
                swal({
                    title: 'Oooops...',
                    text: err,
                    type: 'error',
                    showCancelButton: false,
                    confirmButtonText: 'Try Again'
                }).then((result) => {
                    if (result.value) {
                        // Meteor._reload.reload();
                    } else if (result.dismiss === 'cancel') {

                    }
                });
                $('.fullScreenSpin').css('display','none');
            });
        }
    },
    'click .btnAddTripGroup': function () {
        $('#add-tripgroup-title').text('Add New Trip-Group');
        $('#edtTripGroupID').val('');
        $('#edtTripGroupName').val('');
        $('#edtTripGroupDesc').val('');
    },
    'click .btnBack':function(event){
        playCancelAudio();
        event.preventDefault();
        setTimeout(function(){
        history.back(1);
        }, delayTimeAfterSound);
    },
    'click .templateDownload': function() {
        let utilityService = new UtilityService();
        let rows = [];
        const filename = 'SampleTripGroup' + '.csv';
        rows[0] = ['Trip-Group Name', 'Description'];
        rows[1] = ['ABC', 'Description'];
        utilityService.exportToCsv(rows, filename, 'csv');
    },
    'click .templateDownloadXLSX': function(e) {

        e.preventDefault(); //stop the browser from following
        window.location.href = 'sample_imports/SampleTripGroup.xlsx';
    },
    'click .btnUploadFile': function(event) {
        $('#attachment-upload').val('');
        $('.file-name').text('');
        //$(".btnImport").removeAttr("disabled");
        $('#attachment-upload').trigger('click');

    },
    'change #attachment-upload': function(e) {
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
            reader.onload = function(e) {
                var data = e.target.result;
                data = new Uint8Array(data);
                var workbook = XLSX.read(data, { type: 'array' });

                var result = {};
                workbook.SheetNames.forEach(function(sheetName) {
                    var roa = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
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
    'click .btnImport': function() {
        $('.fullScreenSpin').css('display', 'inline-block');
        let templateObject = Template.instance();
        let receiptService = new ReceiptService();
        let objDetails;
        let leadDescription = '';
        let leadEQPM = 0.00;
        var filename = $("#attachment-upload")[0].files[0]["name"];
        var fileType = filename.split(".").pop().toLowerCase();
        if (fileType == "csv" || fileType == "txt" || fileType == "xlsx") {
        Papa.parse(templateObject.selectedFile.get(), {
            complete: function(results) {

                if (results.data.length > 0) {
                    if ((results.data[0][0] == "Trip-Group Name") && (results.data[0][1] == "Description")) {
                        let dataLength = results.data.length * 500;
                        setTimeout(function() {
                            // $('.importTemplateModal').hide();
                            // $('.modal-backdrop').hide();
                            // FlowRouter.go('/leadstatussettings?success=true');
                            // $('.fullScreenSpin').css('display', 'none');
                            sideBarService
                            .getTripGroup()
                            .then(function(dataReload) {
                                addVS1Data("TTripGroup", JSON.stringify(dataReload))
                                    .then(function(datareturn) {
                                        window.open("/tripgroup", "_self");
                                    })
                                    .catch(function(err) {
                                        window.open("/tripgroup", "_self");
                                    });
                            })
                            .catch(function(err) {
                                window.open("/tripgroup", "_self");
                            });
                        }, parseInt(dataLength));
                        for (let i = 0; i < results.data.length - 1; i++) {
                            objDetails = {
                                type: "TTripGroup",
                                fields: {
                                    TripName: results.data[i + 1][0],
                                    Description: results.data[i + 1][1],
                                    Active:true,
                                }
                            };
                            if (results.data[i + 1][1]) {
                                if (results.data[i + 1][1] !== "") {
                                    receiptService.saveTripGroup(objDetails).then(function(data) {
                                        //$('.fullScreenSpin').css('display','none');
                                        //  Meteor._reload.reload();
                                    }).catch(function(err) {
                                        //$('.fullScreenSpin').css('display','none');
                                        swal({ title: 'Oooops...', text: err, type: 'error', showCancelButton: false, confirmButtonText: 'Try Again' }).then((result) => {
                                            if (result.value) {
                                                // window.open('/clienttypesettings?success=true', '_self');
                                                // FlowRouter.go('/leadstatussettings?success=true');
                                                Meteor._reload.reload();
                                            } else if (result.dismiss === 'cancel') {
                                                // FlowRouter.go('/leadstatussettings?success=false');
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
    }else{}
    }
});

Template.tripgroup.helpers({
    tableheaderrecords: () => {
        return Template.instance().tableheaderrecords.get();
    },
    tripgrouprecords: () => {
        let arr = Template.instance().tripgrouprecords.get();
        if (arr != undefined && arr.length > 0) {
            return arr.sort(function(a, b){
                if (a.tripName == 'NA') {
                    return 1;
                }
                else if (b.tripName == 'NA') {
                    return -1;
                }
                return (a.tripName.toUpperCase() > b.tripName.toUpperCase()) ? 1 : -1;
            });
        } else {
            return arr;
        }
    },
    loggedCompany: () => {
        return localStorage.getItem('mySession') || '';
    },
    apiFunction:function() {
        let sideBarService = new SideBarService();
        return sideBarService.getTripGroup;
    },

    searchAPI: function() {
        return sideBarService.getTripGroupByName;
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
