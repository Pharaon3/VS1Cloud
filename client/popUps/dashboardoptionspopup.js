import { TaxRateService } from "../settings/settings-service";
import { ReactiveVar } from 'meteor/reactive-var';
import { SideBarService } from '../js/sidebar-service';
import '../lib/global/indexdbstorage.js';

import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import './dashboardoptionspopup.html';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';

let sideBarService = new SideBarService();
Template.dashboardoptionspopup.onCreated(function () {
    const templateObject = Template.instance();
    let headerStructure = [        
        { index: 0, label: "Options Name", class: "colOptionsName", active: true, display: true, width: "600" },
        { index: 1, label: "Show Dashboards", class: "colShowDef", active: true, display: true, width: "400" },
        { index: 2, label: "Dashboard load at login", class: "colLogginDef", active: true, display: true, width: "400" },
        // { index: 3, label: "Status", class: "colStatus", active: false, display: false, width: "100" },
    ];
    templateObject.tableheaderrecords = new ReactiveVar(headerStructure);

    templateObject.getDataTableList = function(data){
        let showDashboards = `        
        <div class="custom-control custom-switch text-center">
            <input 
                type="checkbox" 
                class="custom-control-input optradioDL" 
                name="optcheckboxDL" 
                id="formShowP-${data.Id}" 
                value="${data.name}" 
                ${data.isshowdefault ? "checked" : ""}
            >
            <label 
                class="custom-control-label" 
                for="formShowP-${data.Id}">
            </label>
        </div>`;
        let goHere = `        
        <div class="custom-control custom-switch text-center">
            <input 
                type="radio"
                class="custom-control-input optradioDL"
                name="optradioDL"
                id="formCheckP-${data.Id}"
                value="${data.name}"
                ${data.isdefaultlogin ? "checked" : ""} 
            >
            <label
                class="custom-control-label"
                for="formCheckP-${data.Id}">
            </label>
        </div>`       
        let dataList = [
            data.name || '',
            showDashboards,
            data.name === "All" ? "" : goHere,
            // ""
        ];
        return dataList;
    }
});

Template.dashboardoptionspopup.onRendered(function () {
    let templateObject = Template.instance();
    $(document).on('change', '#tblDashboardOptions tbody td.colShowDef input[type=checkbox]', function () {
        // $(this).closest('tr').find(".colOptionsName ").click();
        if ($(this).closest("tbody").find("td.colShowDef input:checked").length === 0) $(this).prop("checked", true)
        let dashboardStatus = $(this).closest('tr').find(".colOptionsName").text();
        if (dashboardStatus !== 'All') {
            $(this).closest("tbody").find("input[value='All']").prop('checked', false);
            $(this).closest('tbody').find('td.colLogginDef input[type=radio]').attr('disabled', true);
            $(this).closest('tbody').find("td.colShowDef input[type=checkbox]").map((index, element) => {
                const isChecked = $(element).is(":checked");
                $(element).parents("tr").find("td.colLogginDef input[type=radio]").attr('disabled', !isChecked).prop('checked', isChecked);
            })

        } else {            
            $(this).closest("tbody").find("td.colShowDef input[type=checkbox]").prop('checked', false);
            $(this).closest("tbody").find("input[value='All']").prop('checked', true);
            $(this).closest('tbody').find('td.colLogginDef input[type=radio]').attr('disabled', false);
        }
        // showDashboard = showDashboard.includes(dashboardStatus) ? showDashboard.filter(el => el !== dashboardStatus) : [...showDashboard, dashboardStatus];
        // addVS1Data('TVS1DashboardStatus', JSON.stringify(showDashboard));
        // Update the dashboardOptions field
        const updatedDashboardOptions = [];
        $("#tblDashboardOptions tbody").find("tr").map((index, tr) => {
            $tr = $(tr);
            const id = $tr.attr('id');
            const optionName = $tr.find('td.colOptionsName').text();
            const isdefaultlogin = $tr.find('td.colLogginDef input[type=radio]').is(":checked");
            const isshowdefault = $tr.find('td.colShowDef input[type=checkbox]').is(':checked');
            updatedDashboardOptions.push({
                Id: id,
                name: optionName,
                isdefaultlogin,
                isshowdefault
            })
        });

        // addVS1Data('TVS1DashboardOptions', JSON.stringify(updatedDashboardOptions))
    });
});

Template.dashboardoptionspopup.events({

    'click .btnAddNewTerm': function (event) {
        setTimeout(function () {
            $('#edtName').focus();
        }, 1000);
    },
    'click #btnNewInvoice': function (event) {
        // FlowRouter.go('/invoicecard');
    },
    'click .chkDatatable': function (event) {
        var columns = $('#tblDashboardOptions th');
        let columnDataValue = $(event.target).closest("div").find(".divcolumn").text();

        $.each(columns, function (i, v) {
            let className = v.classList;
            let replaceClass = className[1];

            if (v.innerText == columnDataValue) {
                if ($(event.target).is(':checked')) {
                    $("." + replaceClass + "").css('display', 'table-cell');
                    $("." + replaceClass + "").css('padding', '.75rem');
                    $("." + replaceClass + "").css('vertical-align', 'top');
                } else {
                    $("." + replaceClass + "").css('display', 'none');
                }
            }
        });
    },
    'click .resetTable': function (event) {
        var getcurrentCloudDetails = CloudUser.findOne({
            _id: localStorage.getItem('mycloudLogonID'),
            clouddatabaseID: localStorage.getItem('mycloudLogonDBID')
        });
        if (getcurrentCloudDetails) {
            if (getcurrentCloudDetails._id.length > 0) {
                var clientID = getcurrentCloudDetails._id;
                var clientUsername = getcurrentCloudDetails.cloudUsername;
                var clientEmail = getcurrentCloudDetails.cloudEmail;
                var checkPrefDetails = CloudPreference.findOne({
                    userid: clientID,
                    PrefName: 'termsList'
                });
                if (checkPrefDetails) {
                    CloudPreference.remove({
                        _id: checkPrefDetails._id
                    }, function (err, idTag) {
                        if (err) {

                        } else {
                            Meteor._reload.reload();
                        }
                    });

                }
            }
        }
    },
    'click .saveTable': function (event) {
        let lineItems = [];
        $('.columnSettings').each(function (index) {
            var $tblrow = $(this);
            var colTitle = $tblrow.find(".divcolumn").text() || '';
            var colWidth = $tblrow.find(".custom-range").val() || 0;
            var colthClass = $tblrow.find(".divcolumn").attr("valueupdate") || '';
            var colHidden = false;
            if ($tblrow.find(".custom-control-input").is(':checked')) {
                colHidden = false;
            } else {
                colHidden = true;
            }
            let lineItemObj = {
                index: index,
                label: colTitle,
                hidden: colHidden,
                width: colWidth,
                thclass: colthClass
            }

            lineItems.push(lineItemObj);
        });

        var getcurrentCloudDetails = CloudUser.findOne({
            _id: localStorage.getItem('mycloudLogonID'),
            clouddatabaseID: localStorage.getItem('mycloudLogonDBID')
        });
        if (getcurrentCloudDetails) {
            if (getcurrentCloudDetails._id.length > 0) {
                var clientID = getcurrentCloudDetails._id;
                var clientUsername = getcurrentCloudDetails.cloudUsername;
                var clientEmail = getcurrentCloudDetails.cloudEmail;
                var checkPrefDetails = CloudPreference.findOne({
                    userid: clientID,
                    PrefName: 'termsList'
                });
                if (checkPrefDetails) {
                    CloudPreference.update({
                        _id: checkPrefDetails._id
                    }, {
                        $set: {
                            userid: clientID,
                            username: clientUsername,
                            useremail: clientEmail,
                            PrefGroup: 'salesform',
                            PrefName: 'termsList',
                            published: true,
                            customFields: lineItems,
                            updatedAt: new Date()
                        }
                    }, function (err, idTag) {
                        if (err) {
                            $('#myModal2').modal('toggle');
                        } else {
                            $('#myModal2').modal('toggle');
                        }
                    });

                } else {
                    CloudPreference.insert({
                        userid: clientID,
                        username: clientUsername,
                        useremail: clientEmail,
                        PrefGroup: 'salesform',
                        PrefName: 'termsList',
                        published: true,
                        customFields: lineItems,
                        createdAt: new Date()
                    }, function (err, idTag) {
                        if (err) {
                            $('#myModal2').modal('toggle');
                        } else {
                            $('#myModal2').modal('toggle');

                        }
                    });
                }
            }
        }
        $('#myModal2').modal('toggle');
    },
    'blur .divcolumn': function (event) {
        let columData = $(event.target).text();

        let columnDatanIndex = $(event.target).closest("div.columnSettings").attr('id');
        var datable = $('#tblDashboardOptions').DataTable();
        var title = datable.column(columnDatanIndex).header();
        $(title).html(columData);

    },
    'change .rngRange': function (event) {
        let range = $(event.target).val();
        $(event.target).closest("div.divColWidth").find(".spWidth").html(range + 'px');

        let columData = $(event.target).closest("div.divColWidth").find(".spWidth").attr("value");
        let columnDataValue = $(event.target).closest("div").prev().find(".divcolumn").text();
        var datable = $('#tblDashboardOptions th');
        $.each(datable, function (i, v) {

            if (v.innerText == columnDataValue) {
                let className = v.className;
                let replaceClass = className.replace(/ /g, ".");
                $("." + replaceClass + "").css('width', range + 'px');

            }
        });

    },
    'click .btnOpenSettings': function (event) {
        let templateObject = Template.instance();
        var columns = $('#tblDashboardOptions th');

        const tableHeaderList = [];
        let sTible = "";
        let sWidth = "";
        let sIndex = "";
        let sVisible = "";
        let columVisible = false;
        let sClass = "";
        $.each(columns, function (i, v) {
            if (v.hidden == false) {
                columVisible = true;
            }
            if ((v.className.includes("hiddenColumn"))) {
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
    'click #exportbtn': function () {
        $('.fullScreenSpin').css('display', 'inline-block');
        jQuery('#tblDashboardOptions_wrapper .dt-buttons .btntabletoexcel').click();
        $('.fullScreenSpin').css('display', 'none');

    },
    'click .btnRefresh': function () {
        $('.fullScreenSpin').css('display', 'inline-block');
        sideBarService.getTermsVS1().then(function (dataReload) {
            addVS1Data('TTermsVS1', JSON.stringify(dataReload)).then(function (datareturn) {
                location.reload(true);
            }).catch(function (err) {
                location.reload(true);
            });
        }).catch(function (err) {
            location.reload(true);
        });
    },
    'click .btnDeleteTerms': function () {
        playDeleteAudio();
        let taxRateService = new TaxRateService();
        setTimeout(function () {

            let termsId = $('#selectDeleteLineID').val();
            let objDetails = {
                type: "TTerms",
                fields: {
                    Id: parseInt(termsId),
                    Active: false
                }
            };

            taxRateService.saveTerms(objDetails).then(function (objDetails) {
                sideBarService.getTermsVS1().then(function (dataReload) {
                    addVS1Data('TTermsVS1', JSON.stringify(dataReload)).then(function (datareturn) {
                        Meteor._reload.reload();
                    }).catch(function (err) {
                        Meteor._reload.reload();
                    });
                }).catch(function (err) {
                    Meteor._reload.reload();
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
                $('.fullScreenSpin').css('display', 'none');
            });
        }, delayTimeAfterSound);
    },
    'click .btnSaveTerms': function () {
        playSaveAudio();
        let taxRateService = new TaxRateService();
        setTimeout(function () {
            $('.fullScreenSpin').css('display', 'inline-block');

            let termsID = $('#edtTermsID').val();
            let termsName = $('#edtName').val();
            let description = $('#edtDesc').val();
            let termdays = $('#edtDays').val();

            let isDays = false;
            let is30days = false;
            let isEOM = false;
            let isEOMPlus = false;
            let days = 0;

            let isSalesdefault = false;
            let isPurchasedefault = false;
            if (termdays.replace(/\s/g, '') != "") {
                isDays = true;
            } else {
                isDays = false;
            }

            if ($('#isEOM').is(':checked')) {
                isEOM = true;
            } else {
                isEOM = false;
            }

            if ($('#isEOMPlus').is(':checked')) {
                isEOMPlus = true;
            } else {
                isEOMPlus = false;
            }

            if ($('#chkCustomerDef').is(':checked')) {
                isSalesdefault = true;
            } else {
                isSalesdefault = false;
            }

            if ($('#chkSupplierDef').is(':checked')) {
                isPurchasedefault = true;
            } else {
                isPurchasedefault = false;
            }

            let objDetails = '';
            if (termsName === '') {
                $('.fullScreenSpin').css('display', 'none');
                Bert.alert('<strong>WARNING:</strong> Term Name cannot be blank!', 'warning');
                e.preventDefault();
            }

            if (termsID == "") {
                taxRateService.checkTermByName(termsName).then(function (data) {
                    termsID = data.tterms[0].Id;
                    objDetails = {
                        type: "TTerms",
                        fields: {
                            ID: parseInt(termsID),
                            Active: true,
                            //TermsName: termsName,
                            Description: description,
                            IsDays: isDays,
                            IsEOM: isEOM,
                            IsEOMPlus: isEOMPlus,
                            isPurchasedefault: isPurchasedefault,
                            isSalesdefault: isSalesdefault,
                            Days: termdays || 0,
                            PublishOnVS1: true
                        }
                    };

                    taxRateService.saveTerms(objDetails).then(function (objDetails) {
                        sideBarService.getTermsVS1().then(function (dataReload) {
                            addVS1Data('TTermsVS1', JSON.stringify(dataReload)).then(function (datareturn) {
                                Meteor._reload.reload();
                            }).catch(function (err) {
                                Meteor._reload.reload();
                            });
                        }).catch(function (err) {
                            Meteor._reload.reload();
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
                        $('.fullScreenSpin').css('display', 'none');
                    });
                }).catch(function (err) {
                    objDetails = {
                        type: "TTerms",
                        fields: {
                            Active: true,
                            TermsName: termsName,
                            Description: description,
                            IsDays: isDays,
                            IsEOM: isEOM,
                            IsEOMPlus: isEOMPlus,
                            Days: termdays || 0,
                            PublishOnVS1: true
                        }
                    };

                    taxRateService.saveTerms(objDetails).then(function (objDetails) {
                        sideBarService.getTermsVS1().then(function (dataReload) {
                            addVS1Data('TTermsVS1', JSON.stringify(dataReload)).then(function (datareturn) {
                                Meteor._reload.reload();
                            }).catch(function (err) {
                                Meteor._reload.reload();
                            });
                        }).catch(function (err) {
                            Meteor._reload.reload();
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
                        $('.fullScreenSpin').css('display', 'none');
                    });
                });

            } else {
                objDetails = {
                    type: "TTerms",
                    fields: {
                        ID: parseInt(termsID),
                        TermsName: termsName,
                        Description: description,
                        IsDays: isDays,
                        IsEOM: isEOM,
                        isPurchasedefault: isPurchasedefault,
                        isSalesdefault: isSalesdefault,
                        IsEOMPlus: isEOMPlus,
                        Days: termdays || 0,
                        PublishOnVS1: true
                    }
                };

                taxRateService.saveTerms(objDetails).then(function (objDetails) {
                    sideBarService.getTermsVS1().then(function (dataReload) {
                        addVS1Data('TTermsVS1', JSON.stringify(dataReload)).then(function (datareturn) {
                            Meteor._reload.reload();
                        }).catch(function (err) {
                            Meteor._reload.reload();
                        });
                    }).catch(function (err) {
                        Meteor._reload.reload();
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
                    $('.fullScreenSpin').css('display', 'none');
                });
            }
        }, delayTimeAfterSound);



    },
    'click .btnAddTerms': function () {
        let templateObject = Template.instance();
        $('#add-terms-title').text('Add New Term ');
        $('#edtTermsID').val('');
        $('#edtName').val('');
        $('#edtName').prop('readonly', false);
        $('#edtDesc').val('');
        $('#edtDays').val('');

        templateObject.include7Days.set(false);
        templateObject.includeCOD.set(false);
        templateObject.include30Days.set(false);
        templateObject.includeEOM.set(false);
        templateObject.includeEOMPlus.set(false);
    },
    'click .btnBack': function (event) {
        playCancelAudio();
        event.preventDefault();
        setTimeout(function () {
            history.back(1);
        }, delayTimeAfterSound);
    },
    'click .chkTerms': function (event) {
        var $box = $(event.target);

        if ($box.is(":checked")) {
            var group = "input:checkbox[name='" + $box.attr("name") + "']";
            $(group).prop("checked", false);
            $box.prop("checked", true);
        } else {
            $box.prop("checked", false);
        }
    },
    'keydown #edtDays': function (event) {
        if ($.inArray(event.keyCode, [46, 8, 9, 27, 13, 110]) !== -1 ||
            // Allow: Ctrl+A, Command+A
            (event.keyCode === 65 && (event.ctrlKey === true || event.metaKey === true)) ||
            // Allow: home, end, left, right, down, up
            (event.keyCode >= 35 && event.keyCode <= 40)) {
            // let it happen, don't do anything
            return;
        }

        if (event.shiftKey == true) {
            event.preventDefault();
        }

        if ((event.keyCode >= 48 && event.keyCode <= 57) ||
            (event.keyCode >= 96 && event.keyCode <= 105) ||
            event.keyCode == 8 || event.keyCode == 9 ||
            event.keyCode == 37 || event.keyCode == 39 ||
            event.keyCode == 46 || event.keyCode == 190) { } else {
            event.preventDefault();
        }
    },
    'click .colShowDef': function (event) {        
        event.stopPropagation()
    },
    'click .colLogginDef': function (event) {        
        event.stopPropagation()
    },
});

Template.dashboardoptionspopup.helpers({    
    tableheaderrecords: () => {
        return Template.instance().tableheaderrecords.get();
    },  
    apiFunction:function() { // do not use arrow function
      return sideBarService.getDashboardOptions
    },
    searchAPI: function() {
      return sideBarService.getDashboardOptionsByName
    },
    apiParams: function() {
      return [];
    },
    service: ()=>{
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
        let dataReturn = templateObject.getDataTableList(data);
        return dataReturn
      }
    }
});

Template.registerHelper('equals', function (a, b) {
    return a === b;
});
