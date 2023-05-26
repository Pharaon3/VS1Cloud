import {ReportService} from "../report-service";
import {UtilityService} from "../../utility-service";
import layoutEditor from "./layoutEditor";
import ApiService from "../../js/Api/Module/ApiService";
import {ProductService} from "../../product/product-service";
import ProfitLossLayout from "../../js/Api/Model/ProfitLossLayout";
import ProfitLossLayoutFields from "../../js/Api/Model/ProfitLossLayoutFields";
import ProfitLossLayoutApi from "../../js/Api/ProfitLossLayoutApi";
import {TaxRateService} from "../../settings/settings-service";
import LoadingOverlay from "../../LoadingOverlay";
import GlobalFunctions from "../../GlobalFunctions";
import moment from "moment";
import FxGlobalFunctions from "../../packages/currency/FxGlobalFunctions";
import CachedHttp from "../../lib/global/CachedHttp";
import erpObject from "../../lib/global/erp-objects";
import TemplateInjector from "../../TemplateInjector";
import 'jquery-ui-dist/external/jquery/jquery';
import 'jquery-ui-dist/jquery-ui';
import "jQuery.print/jQuery.print.js";
import {jsPDF} from "jspdf";
import Datehandler from "../../DateHandler";
import {Session} from 'meteor/session';
import {Template} from 'meteor/templating';
import './nplEditLayoutScreenModal.html';
import {FlowRouter} from 'meteor/ostrio:flow-router-extra';
import {NumberResource as random} from "twilio/lib/rest/pricing/v1/voice/number";
import {Integer} from "read-excel-file";
import newnode from "../../CronSetting";
//import '../../../public/js/summernote.min.js';

let utilityService = new UtilityService();
let reportService = new ReportService();
let taxRateService = new TaxRateService();

const templateObject = Template.instance();
const productService = new ProductService();
const defaultPeriod = 3;
const employeeId = localStorage.getItem("mySessionEmployeeLoggedID");
let defaultCurrencyCode = CountryAbbr; // global variable "AUD"

Template.npleditlayoutscreen.onCreated(function () {
    const templateObject = Template.instance();
    templateObject.records = new ReactiveVar([]);
    templateObject.dateAsAt = new ReactiveVar();
    templateObject.departments = new ReactiveVar([]);
    templateObject.reportOptions = new ReactiveVar();
    templateObject.recordslayout = new ReactiveVar([]);
    templateObject.profitlosslayoutrecords = new ReactiveVar([]);
    templateObject.profitlosslayoutfields = new ReactiveVar([]);
    templateObject.daterange = new ReactiveVar();
    templateObject.layoutinfo = new ReactiveVar([]);

    templateObject.toolSelect = new ReactiveVar({});
    templateObject.currentBlock = new ReactiveVar({});
    templateObject.tableInserts = new ReactiveVar([]);
    FxGlobalFunctions.initVars(templateObject);
    templateObject.pnlEditLayoutData = new ReactiveVar();
    templateObject.sidebarIndex = new ReactiveVar();
    templateObject.textEditTableOptions = new ReactiveVar();
    templateObject.currentTable = new ReactiveVar();
    templateObject.positiveDebitCredit = new ReactiveVar();

    templateObject.pnlBlocks = new ReactiveVar([]);
    templateObject.textBlocks = new ReactiveVar([]);
    templateObject.scheduleBlocks = new ReactiveVar([]);

    var pnlEditLayoutData = [
        {
            name: 'Tranding Income',
            id: 'Tranding Income',
            children: [
                {
                    label: 'Sales',
                    id: 'Sales',
                },
                {
                    label: 'Total Trending Income',
                    id: 'Total Trending Income',
                }
            ]
        },
        {
            name: 'Cost of Sales',
            id: 'Cost of Sales',
            children: [
                {
                    label: 'Cost of Goods Sold',
                    id: 'Cost of Goods Sold',
                },
                {
                    label: 'Purchases',
                    id: 'Purchases',
                },
                {
                    label: 'Total Cost of Sales',
                    id: 'Total Cost of Sales',
                }
            ]
        },
        {
            label: "Gross Profit",
            id: "Gross Profit",
        },
        {
            label: "Other Income",
            id: "Other Income",
            children: [
                {
                    label: 'Interest Income',
                    id: 'Interest Income',
                },
                {
                    label: 'Other Revenue',
                    id: 'Other Revenue',
                },
                {
                    label: 'Total Other Income',
                    id: 'Total Other Income',
                }
            ]
        },
        {
            label: "Net Profit",
            id: "Net Profit",
        }
    ];

    templateObject.positiveDebitCredit.set(1); // it will set CreditPositive.
    templateObject.textEditTableOptions.set(0);
    templateObject.sidebarIndex.set(-1);
    templateObject.pnlEditLayoutData.set(pnlEditLayoutData);
});

function buildPositions() {
    const sortfields = $(".pSortItems");

    // Level 0 Sorting
    let counter = 1;
    for (let i = 0; i <= sortfields.length; i++) {
        $(sortfields[i]).attr("position", counter);
        counter++;
    }
    // Level 1 Sorting
    const cSortItems = $(".cSortItems");
    counter = 1;
    for (let i = 0; i <= cSortItems.length; i++) {
        $(cSortItems[i]).attr("position", counter);
        counter++;
    }
    // Level 2 Sorting
    const scSortItems = $(".scSortItems");
    counter = 1;
    for (let i = 0; i <= scSortItems.length; i++) {
        $(scSortItems[i]).attr("position", counter);
        counter++;
    }
}

function buildSubAccountJson($sortContainer) {
    return Array.from($sortContainer.map(function () {
        return {
            "accountId": $(this).attr('plid'),
            "position": $(this).attr('position'),
            "accountType": $(this).data('group'),
            "employeeId": employeeId,
            "subAccounts": ($(this).find('ol li').length > 0) ? buildSubAccountJson($(this).find('ol li')) : []
        }
    }))
}

Template.npleditlayoutscreen.onRendered(function () {
    const templateObject = Template.instance();

    templateObject.autorun(function() {
        let sidebarIndex = templateObject.sidebarIndex.get();
        if(sidebarIndex != 0) {
            let pnlLayoutTree = $('#pnlLayoutTree');
            pnlLayoutTree.tree("refresh");
            let nodes = pnlLayoutTree.tree("getSelectedNodes");
            if(nodes) {
                nodes.forEach(function (node) {
                    pnlLayoutTree.tree('removeFromSelection', node);
                })
            }
        }

        if(sidebarIndex != 3) {
            let pnlBlocks = templateObject.pnlBlocks.get();
            let currentIndex;
            if(templateObject.currentBlock.get())
                currentIndex = templateObject.currentBlock.get().index;
            pnlBlocks.forEach(function(block, index) {
                if(block.type == "schedule") {
                    let blockTree = $(`#pnlScheduleBlock-${index}>div`);
                    let blockTreeNodes = blockTree.tree("getSelectedNodes");
                    if(blockTreeNodes) {
                        blockTreeNodes.forEach(function (node) {
                            blockTree.tree("removeFromSelection", node);
                        });
                    }
                }
            });
        }
        else {
            let pnlBlocks = templateObject.pnlBlocks.get();
            let currentIndex;
            if(templateObject.currentBlock.get())
                currentIndex = templateObject.currentBlock.get().index;
            pnlBlocks.forEach(function(block, index) {
                if(block.type == "schedule" && currentIndex != index) {
                    let blockTree = $(`#pnlScheduleBlock-${index}>div`);
                    let blockTreeNodes = blockTree.tree("getSelectedNodes");
                    if(blockTreeNodes) {
                        blockTreeNodes.forEach(function (node) {
                            blockTree.tree("removeFromSelection", node);
                        });
                    }
                }
            });
        }
    });

    $(document).ready(function () {
        let pnlLayoutTree = $('#pnlLayoutTree');

        pnlLayoutTree.tree({
            data: templateObject.pnlEditLayoutData.get(),
            autoOpen: true,
            dragAndDrop: true,
            onCanMoveTo: function (movedNode, targetNode, position) {
                if (targetNode.children.length > 0) {
                    return true;
                }
                if (position == "inside") {
                    return false;
                }
                if (!targetNode.parent.parent && movedNode.parent.parent)
                    return false;
                return true;
            }
        });

        pnlLayoutTree.on(
            'tree.click',
            function (e) {
                // The clicked node is 'event.node'
                e.preventDefault();
                var selected_node = e.node;
                templateObject.currentBlock.set({});

                if (selected_node.id === undefined) {
                }

                if (pnlLayoutTree.tree('isNodeSelected', selected_node)) {
                    pnlLayoutTree.tree('removeFromSelection', selected_node);
                } else {
                    pnlLayoutTree.tree('addToSelection', selected_node);
                }

                //$(".formCreateLayout").addClass('hidden');
                //$(".pnlSideLayout").removeClass("hidden");
                templateObject.sidebarIndex.set(0);

                var nodes = pnlLayoutTree.tree('getSelectedNodes');
                $(".selectedRowCount").text(`${nodes.length} Rows`);

                if (!nodes.length) {
                    /* Cases for no selected row. Hide side layout. */
                    //$(".pnlSideLayout").addClass("hidden");
                    templateObject.sidebarIndex.set(-1);
                }

                if (nodes.length == 1) {
                    if (nodes[0].children.length) {
                        $(".selectedRowCount").text("Group");
                        $(".selectedNameEdit").val(nodes[0].name);

                        $(".selectedRowName").removeClass("hidden");
                        $(".selectedRowDisplayBalance").removeClass("hidden");
                        $(".btnAddSwitchRule").removeClass("hidden");
                        $(".selectedRowChkBoxTotal").removeClass("hidden");

                        let child_len = nodes[0].children.length;
                        if (nodes[0].children[child_len - 1].name.includes("Total"))
                            $('.selectedChkBoxTotal').prop("checked", "checked");
                        else $('.selectedChkBoxTotal').prop("checked", "");
                    } else {
                        $(".selectedRowCount").text("Row");
                        $(".selectedRowName").addClass("hidden");
                        $(".selectedRowDisplayBalance").addClass("hidden");
                        $(".btnAddSwitchRule").addClass("hidden");
                        $(".selectedRowChkBoxTotal").addClass("hidden");
                    }
                } else {
                    $(".selectedRowName").addClass("hidden");
                    $(".selectedRowDisplayBalance").addClass("hidden");
                    $(".btnAddSwitchRule").addClass("hidden");
                    $(".selectedRowChkBoxTotal").addClass("hidden");
                }
            }
        );
    });
    // templateObject.getPNLLayout = async () => {
    //   getVS1Data("TPNLLayout")
    //     .then(function (dataObject) {
    //       if (dataObject.length == 0) {
    //         reportService.getPNLLayout().then(function(data) {
    //           addVS1Data("TPNLLayout", JSON.stringify(data));
    //           if(data.tpnllayout.length > 0){
    //             for(var i=0; i<data.tpnllayout.length; i++){
    //               if(data.tpnllayout[i].IsCurrentLayout == true){
    //                 templateObject.layoutinfo.set(data.tpnllayout[i]);
    //                 $("#nplLayoutID").val(data.tpnllayout[i].Id);
    //                 $("#sltLaybout").val(data.tpnllayout[i].LName);
    //                 break;
    //               }
    //             }
    //           }
    //         });
    //       } else {
    //         let data = JSON.parse(dataObject[0].data);
    //         if(data.tpnllayout.length > 0){
    //           for(var i=0; i<data.tpnllayout.length; i++){
    //             if(data.tpnllayout[i].IsCurrentLayout == true){
    //               templateObject.layoutinfo.set(data.tpnllayout[i]);
    //               $("#nplLayoutID").val(data.tpnllayout[i].Id);
    //               $("#sltLaybout").val(data.tpnllayout[i].LName);
    //               break;
    //             }
    //           }
    //         }
    //       }
    //     })
    //     .catch(function (err) {
    //       reportService.getPNLLayout().then(function(data) {
    //         addVS1Data("TPNLLayout", JSON.stringify(data));
    //         if(data.tpnllayout.length > 0){
    //           for(var i=0; i<data.tpnllayout.length; i++){
    //             if(data.tpnllayout[i].IsCurrentLayout == true){
    //               templateObject.layoutinfo.set(data.tpnllayout[i]);
    //               $("#nplLayoutID").val(data.tpnllayout[i].Id);
    //               $("#sltLaybout").val(data.tpnllayout[i].LName);
    //               break;
    //             }
    //           }
    //         }
    //       });
    //     });
    // }

    // templateObject.getPNLLayout();

    $(document).on("click", "ol.nested_with_switch div.mainHeadingDiv, ol.nested_with_switch span.childInner", function (e) {
        let groupID = $(this).closest("li").attr("plid");
        let groupName = $(this).closest("li").attr("data-group");
        $(".editDefault").hide();
        $(".editRowGroup").show();
        $("#editGroupName").val(groupName);
        $("#editGroupID").val(groupID);
    });

  $('#sltLaybout').editableSelect();
  $('#sltLaybout').editableSelect()
      .on('click.editable-select', function(e, li) {
          var $earch = $(this);
          var offset = $earch.offset();
          var deptDataName = e.target.value || '';
          $('#edtLayoutID').val('');
          if (e.pageX > offset.left + $earch.width() - 8) { // X button 16px wide?
              $('#layoutModal').modal('toggle');
              $('#tblLayoutsList').css("width", "100%");
              setTimeout(() => {
                $('#tblLayoutsListUpdated_filter .form-control-sm').get(0).focus()
              }, 500)
              // }, 1000);
          } else {
              $('#layoutModal').modal('toggle');
              $('#tblLayoutsList').css("width", "100%");
              setTimeout(() => {
                $('#tblLayoutsListUpdated_filter .form-control-sm').get(0).focus()
              }, 500)
          }
      });

});

Template.npleditlayoutscreen.events({
    "click #btnGroupSelection": async function () {
        //$("#nplAddGroupScreen").modal("toggle");
        let pnlLayoutTree = $('#pnlLayoutTree');
        let nodes = pnlLayoutTree.tree("getSelectedNodes");
        let firstNode = nodes[0];
        let newNode = {
            name: "Untitled Group",
            id: parseInt(Math.random() * 1000),
            children: [],
        }
        pnlLayoutTree.tree("addNodeAfter", newNode, firstNode);
        newNode = pnlLayoutTree.tree("getNodeById", newNode.id);
        pnlLayoutTree.tree("refresh");
        nodes.forEach(function (node) {
            pnlLayoutTree.tree('moveNode', node, newNode, 'inside');
            pnlLayoutTree.tree('removeFromSelection', node);
        })
        pnlLayoutTree.tree("refresh");
        pnlLayoutTree.tree('addToSelection', newNode);

        /* Show SideLayout for created new Group*/
        $(".selectedRowCount").text("Group");

        $(".selectedRowName").removeClass("hidden");
        $(".selectedRowDisplayBalance").removeClass("hidden");
        $(".btnAddSwitchRule").removeClass("hidden");
        $(".selectedRowChkBoxTotal").removeClass("hidden");

        $(".selectedNameEdit").val("");
        $(".selectedNameEdit").get(0).focus();

        /* Set Total checkbox true and make a Total subtree */
        $(".selectedChkBoxTotal").prop("checked", true);
        pnlLayoutTree.tree("appendNode", {name: "Total " + newNode.name, id: Math.random() * 1000}, newNode);
    },
    // "click .saveProfitLossLayouts": async function () {
    //   let id = $("#nplLayoutID").val();
    //   let name = $("#nplLayoutName").val();
    //   let description = $("#nplLayoutDescr").val();
    //   let isdefault = $("#npldefaultSettting").is(":checked") ? true : false;
    //   if(id != "" && (name != "" || description != "")){
    //     $('.fullScreenSpin').css('display', 'block');
    //     // buildPositions();
    //
    //     // const profitLossLayoutApis = new ProfitLossLayoutApi();
    //
    //     // // make post request to save layout data
    //     // const apiEndpoint = profitLossLayoutApis.collection.findByName(
    //     //   profitLossLayoutApis.collectionNames.TProfitLossLayout
    //     // );
    //
    //     // const pSortfields = $(".pSortItems");
    //     // const employeeId = localStorage.getItem("mySessionEmployeeLoggedID");
    //     // let pSortList = [];
    //     // pSortfields.each(function(){
    //     //   let Position = $(this).attr('position');
    //     //   let accountType = $(this).data('group');
    //     //   pSortList.push({
    //     //     "position": Position,
    //     //     "accountType": accountType,
    //     //     "employeeId": employeeId,
    //     //     "subAccounts": buildSubAccountJson( $(this).find('ol li') )
    //     //   });
    //     // });
    //
    //     /**
    //      *
    //      * Update all layout fields index DB
    //      */
    //
    //     let jsonObj = {
    //       type: "TPNLLayout",
    //       fields: {
    //         "ID": id,
    //         "LName": name,
    //         "Description": description,
    //         "IsCurrentLayout": isdefault
    //       }
    //     }
    //
    //     reportService.savePNLLayout(jsonObj).then(function(res) {
    //       reportService.getPNLLayout().then(function(data) {
    //         addVS1Data("TPNLLayout", JSON.stringify(data)).then(function(datareturn) {
    //           if($("#npldefaultSettting").prop('checked') == true){
    //             $("#nplEditLayoutScreen").modal("toggle");
    //           }
    //         }).catch(function(err) {
    //           if($("#npldefaultSettting").prop('checked') == true){
    //             $("#nplEditLayoutScreen").modal("toggle");
    //           }
    //         });
    //         $('.fullScreenSpin').css('display', 'none');
    //       });
    //     }).catch(function(err) {
    //         swal({
    //             title: 'Oooops...',
    //             text: err,
    //             type: 'error',
    //             showCancelButton: false,
    //             confirmButtonText: 'Try Again'
    //         }).then((result) => {
    //             if (result.value) {
    //                 // Meteor._reload.reload();
    //             } else if (result.dismiss === 'cancel') {}
    //         });
    //         $('.fullScreenSpin').css('display', 'none');
    //     });
    //
    //     // let profitLossLayoutData = {
    //     //   "type": "TProfitLossLayout",
    //     //   "action": "save",
    //     //   "layout": pSortList
    //     // }
    //
    //     // try {
    //     //   const ApiResponse = await apiEndpoint.fetch(null, {
    //     //       method: "POST",
    //     //       headers: ApiService.getPostHeaders(),
    //     //       body: JSON.stringify(profitLossLayoutData),
    //     //   });
    //
    //     //   if (ApiResponse.ok == true) {
    //     //       const jsonResponse = await ApiResponse.json();
    //     //       LoadingOverlay.hide();
    //     //   }else{
    //     //       LoadingOverlay.hide();
    //     //   }
    //     // } catch (error) {
    //     //     LoadingOverlay.hide();
    //     // }
    //
    //     // "type": "TProfitLossLayout",
    //     // "action": "save",
    //     // "layout": [
    //
    //     // let layoutLists = {
    //     //   Name: name,
    //     //   Description: description,
    //     //   Isdefault: isdefault,
    //     //   EmployeeID: employeeID,
    //     //   LayoutLists: profitlosslayoutfields,
    //     // };
    //     // await addVS1Data("TProfitLossEditLayout", JSON.stringify(layoutLists));
    //   }
    // },
    // "click .btnCreateLayout": async function () {
    //   let name = $("#nplLayoutName").val();
    //   let description = $("#nplLayoutDescr").val();
    //   let isdefault = $("#npldefaultSettting").is(":checked") ? true : false;
    //   if(name != "" || description != ""){
    //     $('.fullScreenSpin').css('display', 'block');
    //     let jsonObj = {
    //       type: "TPNLLayout",
    //       fields: {
    //         "LName": name,
    //         "Description": description,
    //         "IsCurrentLayout": isdefault
    //       }
    //     }
    //
    //     reportService.savePNLLayout(jsonObj).then(function(res) {
    //       reportService.getPNLLayout().then(function(data) {
    //         addVS1Data("TPNLLayout", JSON.stringify(data)).then(function(datareturn) {
    //           $("#layoutModal #btnViewDeleted").click();
    //         }).catch(function(err) {
    //           $("#layoutModal #btnViewDeleted").click();
    //         });
    //         $('.fullScreenSpin').css('display', 'none');
    //       });
    //     }).catch(function(err) {
    //         swal({
    //             title: 'Oooops...',
    //             text: err,
    //             type: 'error',
    //             showCancelButton: false,
    //             confirmButtonText: 'Try Again'
    //         }).then((result) => {
    //             if (result.value) {
    //                 // Meteor._reload.reload();
    //             } else if (result.dismiss === 'cancel') {}
    //         });
    //         $('.fullScreenSpin').css('display', 'none');
    //     });
    //   }
    // },
    "click #nplShowCreateLayoutForm": function (event) {
        //$(".pnlSideLayout").addClass("hidden");
        //$(".formCreateLayout").removeClass('hidden');
        Template.instance().sidebarIndex.set(1);
    },
    "blur .selectedNameEdit": function (event, template) {
        let pnlLayoutTree = $('#pnlLayoutTree');
        let nodes = pnlLayoutTree.tree("getSelectedNodes");
        let changedName = $(".selectedNameEdit").val() || "Untitled Group";

        if (!nodes.length) return;
        nodes[0].name = changedName;
        if ($('.selectedChkBoxTotal').prop("checked")) {
            let child_len = nodes[0].children.length;
            if (child_len)
                nodes[0].children[child_len - 1].name = "Total " + changedName;
        }
        pnlLayoutTree.tree("refresh");
    },
    "blur .selectedScheduleNameEdit": function (event, template) {
        let tmpObj = Template.instance();
        let currentSchedule = tmpObj.currentBlock.get();
        let pnlScheduleTree = $(`#pnlScheduleBlock-${currentSchedule.index}>div:last-child`);
        let nodes = pnlScheduleTree.tree("getSelectedNodes");
        let changedName = $(".selectedScheduleNameEdit").val() || "Untitled Group";

        if (!nodes.length) return;
        currentSchedule.title.name = changedName;
        nodes[0].name = currentSchedule.title.numberIndex + ". " + changedName;
        tmpObj.currentBlock.set(currentSchedule);
        if ($('.selectedScheduleChkBoxTotal').prop("checked")) {
            let child_len = nodes[0].children.length;
            if (child_len)
                nodes[0].children[child_len - 1].name = "Total " + currentSchedule.title.name;
        }
        pnlScheduleTree.tree("refresh");
    },
    "change .selectedChkBoxTotal": function (event, template) {
        let pnlLayoutTree = $('#pnlLayoutTree');
        let nodes = pnlLayoutTree.tree("getSelectedNodes");
        let firstNode = nodes[0];
        let child_len = firstNode.children.length;
        if (!child_len) return;
        if (event.target.checked) {
            if (!firstNode.children[child_len - 1].name.includes("Total"))
                pnlLayoutTree.tree("appendNode", {
                    name: "Total " + firstNode.name,
                    id: Math.random() * 1000
                }, firstNode);
            else
                firstNode.children[child_len - 1].name = "Total " + firstNode.name;
        } else {
            if (firstNode.children[child_len - 1].name.includes("Total"))
                pnlLayoutTree.tree("removeNode", firstNode.children[child_len - 1]);
        }
        pnlLayoutTree.tree("refresh");
    },
    "change .selectedScheduleChkBoxTotal": function (event, template) {
        let tmpObj = Template.instance();
        let currentSchedule = tmpObj.currentBlock.get();
        let pnlScheduleTree = $(`#pnlScheduleBlock-${currentSchedule.index}>div:last-child`);
        let nodes = pnlScheduleTree.tree("getSelectedNodes");
        let firstNode = nodes[0];
        let child_len = firstNode.children.length;
        if (!child_len) return;
        if (event.target.checked) {
            if (!firstNode.children[child_len - 1].name.includes("Total"))
                pnlScheduleTree.tree("appendNode", {
                    name: "Total " + currentSchedule.title.name,
                    id: Math.random() * 10000
                }, firstNode);
            else
                firstNode.children[child_len - 1].name = "Total " + currentSchedule.title.name;
        } else {
            if (firstNode.children[child_len - 1].name.includes("Total"))
                pnlScheduleTree.tree("removeNode", firstNode.children[child_len - 1]);
        }
        pnlScheduleTree.tree("refresh");
    },
    "click .btnAddSwitchRule": function (event) {
        let pnlLayoutTree = $('#pnlLayoutTree');
        let nodes = pnlLayoutTree.tree("getSelectedNodes");
        $(".pnlAddSwitchRuleHeader").text("Switch Rule: " + nodes[0].name);
        $('.nplAddSwitchRuleSecond').empty();

        let node = pnlLayoutTree.tree("getTree");
        while (node) {
            node = node.getNextNode();
            if (!node) break;
            if (node.children.length > 0) {
                if (node == nodes[0]) continue;
                var option = document.createElement('option');
                option.text = node.name;
                option.value = node.name;
                $('.nplAddSwitchRuleSecond').append(option);
            }
        }

        $("#nplAddSwitchRuleModal").modal("show");
    },
    "click .nplAddSwitchRuleCancel": function (event) {
        $("#nplAddSwitchRuleModal").modal("hide");
    },
    "click .nplAddSwitchRuleSave": function (event) {
        $("#nplAddSwitchRuleModal").modal("hide");
    },
    "click #btnAddTextBlock": function (e) {
        let pnlBlocks = Template.instance().pnlBlocks.get();
        let index = pnlBlocks.length;
        let textBlocksLength = pnlBlocks.filter(item => item.type === 'text').length;
        let newTextBlock = {
            type: "text",
            index: textBlocksLength,
            title: {
                type: 'list_number',
                numberIndex: 1,
            },
            text: {
                is_bold: false,
                is_italic: false,
                is_underline: false
            }
        }
        if (textBlocksLength > 0) {
            let numberListLength = pnlBlocks.filter(item => item.type === 'text' && item.title.type === 'list_number').length;
            newTextBlock.title.numberIndex = numberListLength + 1;
        }
        pnlBlocks.push(newTextBlock);
        Template.instance().pnlBlocks.set(pnlBlocks);
        setTimeout(() => {
            $('.textblock-text-container-' + index).summernote({
                placeholder: "Enter your text here...",
                toolbar: [
                    ['style', ['bold', 'italic', 'underline']],
                    ['para', ['ul', 'ol']],
                    ['insert', ['table']],
                    ['color', ['backcolor']],
                ]
            });
        }, 100);
    },
    "click .reporting-textblock__title-text": function (e) {
        let index = e.target.attributes['data-index'].value * 1;
        Template.instance().toolSelect.set({
            tool: 'textblock_title',
            info: e.target.attributes['data-index'].value
        })
        let pnlBlocks = Template.instance().pnlBlocks.get();
        Template.instance().sidebarIndex.set(2);
        Template.instance().currentBlock.set(pnlBlocks[index]);
    },
    "click .btnTextHeadingSwitch": function (e) {
        let type = e.target.attributes['data-type'].value;
        let currentBlock = Template.instance().currentBlock.get();
        currentBlock.title.type = type;
        Template.instance().currentBlock.set(currentBlock);
        let pnlBlocks = Template.instance().pnlBlocks.get();
        let lastIndex = 0;
        let numberIndex = 0;
        let scheduleIndex = 0;
        pnlBlocks.forEach(function(pnlBlock, index) {
            if (pnlBlock.type === 'text' && pnlBlock.title.type === 'list_number') {
                numberIndex ++;
                pnlBlock.title.numberIndex = numberIndex;
            }
            if (pnlBlock.type === 'schedule') {
                scheduleIndex ++;
                pnlBlock.title.numberIndex = scheduleIndex;
                let pnlScheduleTree = $(`#pnlScheduleBlock-${index}>div`);
                let rootNode = pnlScheduleTree.tree("getTree").getNextNode();
                rootNode.name = pnlBlock.title.numberIndex + ". " + pnlBlock.title.name;
                pnlScheduleTree.tree("refresh");
            }
            // if(pnlBlock.title.type === 'list_number') {
            //     pnlBlock.title.numberIndex = numberIndex ++;
            //     if(pnlBlock.type === 'schedule') {
            //         pnlScheduleTree = $(`#pnlScheduleBlock-${index}>div`);
            //         let rootNode = pnlScheduleTree.tree("getTree").getNextNode();
            //         rootNode.name = pnlBlock.title.numberIndex + ". " + pnlBlock.title.name;
            //         pnlScheduleTree.tree("refresh");
            //     }
            // }
            // else {
            //     pnlBlock.title.numberIndex = numberIndex - 1;
            //     if(pnlBlock.type === 'schedule') {
            //         pnlScheduleTree = $(`#pnlScheduleBlock-${index}>div`);
            //         let rootNode = pnlScheduleTree.tree("getTree").getNextNode();
            //         rootNode.name = pnlBlock.title.name;
            //         pnlScheduleTree.tree("refresh");
            //     }
            // }
        });
        Template.instance().pnlBlocks.set(pnlBlocks);
    },
    "click .note-editable": function (e) {
        Template.instance().sidebarIndex.set(2);

        let index = $(e.target).closest(".reporting-textblock__editor").find('.wysihtml5-editor').data('index');

        if(!$(".note-editable .table.table-bordered").find(e.target).length) {
            Template.instance().textEditTableOptions.set(0);
        }

        Template.instance().toolSelect.set({
            tool: 'textblock_text',
            info: index
        });
        let pnlBlocks = Template.instance().pnlBlocks.get();
        let containerClass = '.textblock-container-' + index;
        pnlBlocks[index].text.is_bold = $(containerClass + ' .note-btn-bold').hasClass('active');
        pnlBlocks[index].text.is_italic = $(containerClass + ' .note-btn-italic').hasClass('active');
        pnlBlocks[index].text.is_underline = $(containerClass + ' .note-btn-underline').hasClass('active');
        Template.instance().currentBlock.set(pnlBlocks[index]);

        let tableInserts = Template.instance().tableInserts.get();
        if ($(containerClass + ' ul.note-table').length) {
            tableInserts.push($(containerClass + ' ul.note-table'));
            Template.instance().tableInserts.set(tableInserts);
            setTimeout(() => {
                if (index * 1 !== 0) {
                    $('#textBlockInsert').append('<div class="btn btn-table-insert btnTableInsert" id="tableInsertContainer' + index + '" style="border: none; padding: 0; background: white;">\n' +
                        '                                            <button class="btn btn-default" data-toggle="dropdown" style="border-radius: 0; border-top-left-radius: 5.6px; border-bottom-left-radius: 5.6px;">\n' +
                        '                                                <img src="/icons/table-icon.svg">\n' +
                        '                                            </button>\n' +
                        '                                        </div>');
                }
                $(containerClass + ' ul.note-table').appendTo('#tableInsertContainer' + index);
            }, 100)
        }

        setTimeout(() => {
            $('.btn-table-insert').each(function () {
                if ($(this).attr('id') === 'tableInsertContainer0') {
                    return;
                }
                if ($(this).attr('id') === 'tableInsertContainer' + index) {
                    $(this).removeClass('hidden');
                } else {
                    $(this).addClass('hidden');
                }
            })
        }, 200)
    },
    "click .note-placeholder": function (e) {
        Template.instance().sidebarIndex.set(2);
        Template.instance().textEditTableOptions.set(0);

        let index = $(e.target).parents().closest('.reporting-textblock__editor').find('.wysihtml5-editor').data('index');
        Template.instance().toolSelect.set({
            tool: 'textblock_text',
            info: index
        });
        let pnlBlocks = Template.instance().pnlBlocks.get();
        let containerClass = '.textblock-container-' + index;
        pnlBlocks[index].text.is_bold = $(containerClass + ' .note-btn-bold').hasClass('active');
        pnlBlocks[index].text.is_italic = $(containerClass + ' .note-btn-italic').hasClass('active');
        pnlBlocks[index].text.is_underline = $(containerClass + ' .note-btn-underline').hasClass('active');
        Template.instance().currentBlock.set(pnlBlocks[index]);

        let tableInserts = Template.instance().tableInserts.get();
        if ($(containerClass + ' ul.note-table').length) {
            tableInserts.push($(containerClass + ' ul.note-table'));
            Template.instance().tableInserts.set(tableInserts);
            setTimeout(() => {
                if (index * 1 !== 0) {
                    $('#textBlockInsert').append('<div class="btn btn-table-insert btnTableInsert" id="tableInsertContainer' + index + '" style="border: none; padding: 0;  background: white;">\n' +
                        '                                            <button class="btn btn-default" data-toggle="dropdown" style="border-radius: 0; border-top-left-radius: 5.6px; border-bottom-left-radius: 5.6px;">\n' +
                        '                                                <img src="/icons/table-icon.svg">\n' +
                        '                                            </button>\n' +
                        '                                        </div>');
                }
                $(containerClass + ' ul.note-table').appendTo('#tableInsertContainer' + index);
            }, 100)
        }

        setTimeout(() => {
            $('.btn-table-insert').each(function () {
                if ($(this).attr('id') === 'tableInsertContainer0') {
                    return;
                }
                if ($(this).attr('id') === 'tableInsertContainer' + index) {
                    $(this).removeClass('hidden');
                } else {
                    $(this).addClass('hidden');
                }
            })
        }, 200)
    },
    "click .btnTextFormat": function (e) {
        let current = Template.instance().currentBlock.get();
        let index = current.index;
        let type = '';
        if (e.target.tagName.toLowerCase() === 'img') {
            type = $(e.target).closest('button').data('type');
        } else {
            type = e.target.attributes['data-type'].value;
        }
        let btnClass = '.note-btn-' + type;
        let containerClass = '.textblock-container-' + index;
        $(containerClass + ' ' + btnClass).click();
        current.text['is_' + type] = $(containerClass + ' ' + btnClass).hasClass('active');
        Template.instance().currentBlock.set(current);
    },
    "click .btnTextList": function (e) {
        let current = Template.instance().currentBlock.get();
        let index = current.index;
        let type = '';
        if (e.target.tagName.toLowerCase() === 'img') {
            type = $(e.target).closest('button').data('type');
        } else {
            type = e.target.attributes['data-type'].value;
        }
        let containerClass = '.textblock-container-' + index;
        if (type === 'number') {
            $($(containerClass + ' .note-para').find('button')[1]).click();
        } else {
            $($(containerClass + ' .note-para').find('button')[0]).click();
        }
        // setTimeout(function () {
        //     let tableList = $(containerClass + " .note-editable .table-bordered");
        //     if(!tableList.length) return;
        //     for(let i = 0; i < tableList.length; i++) {
        //         let table = tableList[i];
        //         let prevLi = $(table).prev("ol");
        //         if(!prevLi.length) {
        //             prevLi = $(table).prev("ul");
        //         }
        //         $(prevLi).find("li br").remove();
        //         $(table).appendTo(prevLi.children().last())
        //     }
        //     }
        // , 10);
    },
    "click .note-editable .table-bordered": function (event) {
        Template.instance().textEditTableOptions.set(1);
        Template.instance().currentTable.set(event.target);
    },
    "click .btnTableOperation": function (event, template) {
        let oper = event.target.attributes['operation'].value;
        let tmpObj = Template.instance();
        let curTable = tmpObj.currentTable.get();
        switch (oper) {
            case 'addRow' :
                //$(curTable).closest(".note-add>:first").click();
                $(curTable).closest(".note-editor.note-frame.panel.panel-default").find('.note-add>:first').click();
                //$(".note-add>:first").click();
                break;
            case 'removeRow' :
                //$(curTable).closest(".note-delete>:first").click();
                $(curTable).closest(".note-editor.note-frame.panel.panel-default").find('.note-delete>:first').click();
                tmpObj.textEditTableOptions.set(0);
                break;
            case 'addColumn' :
                //$(curTable).closest(".note-add>:nth-child(4)").click();
                $(curTable).closest(".note-editor.note-frame.panel.panel-default").find('.note-add>:nth-child(4)').click();
                break;
            case 'removeColumn' :
                //$(curTable).closest(".note-delete>:nth-child(2)").click();
                $(curTable).closest(".note-editor.note-frame.panel.panel-default").find('.note-delete>:nth-child(2)').click();
                tmpObj.textEditTableOptions.set(0);
                break;
            case 'removeTable' :
                //$(curTable).closest(".note-delete>:nth-child(3)").click();
                $(curTable).closest(".note-editor.note-frame.panel.panel-default").find('.note-delete>:nth-child(3)').click();
                tmpObj.textEditTableOptions.set(0);
                break;
        }
    },
    "click .positiveCredit": function (e) {
        Template.instance().positiveDebitCredit.set(1);
    },
    "click .positiveDebit": function (e) {
        Template.instance().positiveDebitCredit.set(0);
    },
    "click .btnHighlightText": function (e) {
        let tmpObj = Template.instance();
        let textBlockIndex = tmpObj.currentBlock.get();
        //$(`.note-btn-group.btn-group.note-color.note-color-back:eq(${textBlockIndex.index})`).find('.note-btn.note-current-color-button').click();
        $(`.pnlBlock:eq(${textBlockIndex.index})`).find('.note-btn.note-current-color-button').click();
    },
    'click #btnAddSchedule': function (e) {
        let tmpObj = Template.instance();
        let pnlBlocks = tmpObj.pnlBlocks.get();
        let length = pnlBlocks.length;

        let scheduleLength = pnlBlocks.filter(item => item.type === 'schedule').length;

        let newSchedule = {
            type: "schedule",
            index: scheduleLength,
            title: {
                name: "Untitled Schedule",
                type : "list_number",
                numberIndex: scheduleLength + 1,
            },
        }


        let newScheduleTreeData = [
            {
                name: newSchedule.title.numberIndex + ". Untitled Schedule",
                id: "Untitled Schedule",
                children: [
                    {
                        name: "+ Add Accounts",
                        id: "+ Add Accounts",
                    },
                    {
                        name: "Total Untitled Schedule",
                        id: "Total Untitled Schedule",
                    },
                ]
            }
        ]
        let scheduleTree = document.createElement("div");
        $(scheduleTree).css('width', '100%');
        $(scheduleTree).css('padding-top', '20px');

        $(scheduleTree).tree({
            data: newScheduleTreeData,
            autoOpen: true,
            dragAndDrop: true,
            onCanMoveTo: function (movedNode, targetNode, position) {
                if (targetNode.children.length > 0) {
                    return true;
                }
                if (position == "inside") {
                    return false;
                }
                if (!targetNode.parent.parent && movedNode.parent.parent)
                    return false;
                return true;
            }
        });

        $(scheduleTree).on(
            'tree.click',
            function (e) {
                // The clicked node is 'event.node'
                e.preventDefault();
                var selected_node = e.node;

                if (selected_node.id === undefined) {
                }

                if ($(scheduleTree).tree('isNodeSelected', selected_node)) {
                    $(scheduleTree).tree('removeFromSelection', selected_node);
                } else {
                    $(scheduleTree).tree('addToSelection', selected_node);
                }

                //$(".formCreateLayout").addClass('hidden');
                //$(".pnlSideLayout").removeClass("hidden");
                tmpObj.sidebarIndex.set(3);

                var nodes = $(scheduleTree).tree('getSelectedNodes');
                $(".selectedRowCount").text(`${nodes.length} Rows`);

                if (!nodes.length) {
                    /* Cases for no selected row. Hide side layout. */
                    //$(".pnlSideLayout").addClass("hidden");
                    tmpObj.sidebarIndex.set(-1);
                }

                if (nodes.length == 1) {
                    if (nodes[0] == $(scheduleTree).tree("getTree").getNextNode()) {        /* Only for root of Schedule Tree */
                        $(".selectedRowCount").text("Schedule");
                        $(".selectedScheduleNameEdit").val(newSchedule.title.name);

                        $(".selectedRowName").removeClass("hidden");
                        $(".selectedRowDisplayBalance").removeClass("hidden");
                        $(".selectedRowScheduleChkBoxTotal").removeClass("hidden");
                        $('.selectedScheduleNumberedHeading').removeClass("hidden");

                        let child_len = nodes[0].children.length;
                        if (nodes[0].children[child_len - 1].name.includes("Total"))
                            $('.selectedScheduleChkBoxTotal').prop("checked", "checked");
                        else $('.selectedScheduleChkBoxTotal').prop("checked", "");

                        if(newSchedule.title.type == "list_number")
                            $('.selectedScheduleNumberedHeading').prop("checked", "checked");
                        else
                            $('.selectedScheduleNumberedHeading').prop("checked", "");
                    }
                    else if (nodes[0].children.length) {        /* Groups of Schedule Tree*/
                        $(".selectedRowCount").text("Group");
                        $(".selectedScheduleNameEdit").val(nodes[0].name);

                        $(".selectedRowName").removeClass("hidden");
                        $(".selectedRowDisplayBalance").removeClass("hidden");
                        $(".selectedRowScheduleChkBoxTotal").removeClass("hidden");
                        $('.selectedScheduleNumberedHeading').addClass("hidden");

                        let child_len = nodes[0].children.length;
                        if (nodes[0].children[child_len - 1].name.includes("Total"))
                            $('.selectedRowScheduleChkBoxTotal').prop("checked", "checked");
                        else $('.selectedRowScheduleChkBoxTotal').prop("checked", "");
                    } else {
                        $(".selectedRowCount").text("Row");
                        $(".selectedRowName").addClass("hidden");
                        $(".selectedRowDisplayBalance").addClass("hidden");
                        $(".selectedRowScheduleChkBoxTotal").addClass("hidden");
                        $('.selectedScheduleNumberedHeading').addClass("hidden");
                    }
                } else {
                    $(".selectedRowName").addClass("hidden");
                    $(".selectedRowDisplayBalance").addClass("hidden");
                    $(".selectedRowScheduleChkBoxTotal").addClass("hidden");
                    $('.selectedScheduleNumberedHeading').addClass("hidden");
                }
            }
        );

        pnlBlocks.push(newSchedule);
        tmpObj.pnlBlocks.set(pnlBlocks);
        setTimeout(function() {
            $(`#pnlScheduleBlock-${length}`).append(scheduleTree);
        }, 500);
    },
    "click .pnlBlock": function(e) {
        let tmpObj = Template.instance();
        let pnlBlocks = tmpObj.pnlBlocks.get();
        let currentPnlBlock = $(e.target).closest(".pnlBlock");
        let currentIndex = currentPnlBlock.attr("data-index") * 1;
        // let type = currentPnlBlock.attr("block-type");
        // let prevBlock = tmpObj.currentBlock.get();
        //if(prevBlock.index == currentIndex) return;
        // pnlBlocks.forEach(function(block, index) {
        //     if(block.type == "schedule" && index != currentIndex) {
        //         let blockTree = $(`#pnlScheduleBlock-${index}>div`);
        //         let blockTreeNodes = blockTree.tree("getSelectedNodes");
        //         blockTreeNodes.forEach(function (node) {
        //             blockTree.tree("removeFromSelection", node);
        //         });
        //     }
        // });

        tmpObj.currentBlock.set(pnlBlocks[currentIndex]);
    },
    "click .pnlTextEditLayout" : function (event) {
        if(event.target.className == "div pnlTextEditLayout") {
            Template.instance().sidebarIndex.set(-1);
            Template.instance().textEditTableOptions.set(0);
            event.preventDefault();
        }
    },
    "change .selectedScheduleNumberedHeading" : function (event) {
        let tmpObj = Template.instance();
        let currentSchedule = tmpObj.currentBlock.get();
        let pnlScheduleTree = $(`#pnlScheduleBlock-${currentSchedule.index}>div:last-child`);
        if(event.target.checked) {
            currentSchedule.title.type = 'list_number';
        }
        else
            currentSchedule.title.type = 'list_standard';
        tmpObj.currentBlock.set(currentSchedule);

        let pnlBlocks = tmpObj.pnlBlocks.get();
        let numberIndex = 1;
        pnlBlocks.forEach(function(pnlBlock, index) {
            if(pnlBlock.title.type === 'list_number') {
                pnlBlock.title.numberIndex = numberIndex ++;
                if(pnlBlock.type === 'schedule') {
                    pnlScheduleTree = $(`#pnlScheduleBlock-${index}>div`);
                    let rootNode = pnlScheduleTree.tree("getTree").getNextNode();
                    rootNode.name = pnlBlock.title.numberIndex + ". " + pnlBlock.title.name;
                    pnlScheduleTree.tree("refresh");
                }
            }
            else {
                pnlBlock.title.numberIndex = numberIndex - 1;
                if(pnlBlock.type === 'schedule') {
                    pnlScheduleTree = $(`#pnlScheduleBlock-${index}>div`);
                    let rootNode = pnlScheduleTree.tree("getTree").getNextNode();
                    rootNode.name = pnlBlock.title.name;
                    pnlScheduleTree.tree("refresh");
                }
            }
        });
        tmpObj.pnlBlocks.set(pnlBlocks);
    },
});

Template.npleditlayoutscreen.helpers({
    companyname: () => {
        return loggedCompany;
    },
    dateAsAt: () => {
        const templateObject = Template.instance();
        return templateObject.data.dateAsAt || "";
    },
    // profitlosslayoutrecords: () => {
    //   const templateObject = Template.instance();
    //   return templateObject.data.profitlosslayoutrecords || [];
    // },
    recordslayout: () => {
        return Template.instance().recordslayout.get();
    },
    layoutinfo: () => {
        return Template.instance().layoutinfo.get();
    },
    isAccount(layout) {
        if (layout.ID > 1) {
            return true;
        }
        return false;
    },
    switchRuleOptions: () => {
        let switchRuleOptions = [{
            value: 0,
            name: "If items are negative"
        }, {
            value: 1,
            name: "If items are positive"
        }];
        return switchRuleOptions;
    },
    pnlBlocks: () => {
        return Template.instance().pnlBlocks.get();
    },
    toolSelect: () => {
        return Template.instance().toolSelect.get();
    },
    currentBlock: () => {
        return Template.instance().currentBlock.get();
    },
    sidebarIndex: function () {
        return Template.instance().sidebarIndex.get();
    },
    textEditTableOptions: function () {
        return Template.instance().textEditTableOptions.get();
    },
    positiveDebitCredit: function () {
        return Template.instance().positiveDebitCredit.get();
    }
});

Template.registerHelper("equal", function (a, b) {
    return a == b;
});

Template.registerHelper("equals", function (a, b) {
    return a === b;
});

Template.registerHelper("notEquals", function (a, b) {
    return a != b;
});

Template.registerHelper("containsequals", function (a, b) {
    let chechTotal = false;
    if (a.toLowerCase().indexOf(b.toLowerCase()) >= 0) {
        chechTotal = true;
    }
    return chechTotal;
});

Template.registerHelper("shortDate", function (a) {
    let dateIn = a;
    let dateOut = moment(dateIn, "DD/MM/YYYY").format("MMM YYYY");
    return dateOut;
});

Template.registerHelper("noDecimal", function (a) {
    let numIn = a;
    let numOut = parseInt(numIn);
    return numOut;
});
