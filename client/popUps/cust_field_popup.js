import "jQuery.print/jQuery.print.js";
import { ReactiveVar } from "meteor/reactive-var";
import { SideBarService } from "../js/sidebar-service";
import { Random } from "meteor/random";
import { OrganisationService } from "../js/organisation-service";
import { PurchaseBoardService } from "../js/purchase-service";
import { SalesBoardService } from '../js/sales-service';
import { ContactService } from "../contacts/contact-service";
import { ProductService } from "../product/product-service";
import { Template } from 'meteor/templating';
import './cust_field_popup.html';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { cloneDeep } from "lodash";

let sideBarService = new SideBarService();
let salesService = new SalesBoardService();
let contactService = new ContactService();
let productService = new ProductService();
let organisationService = new OrganisationService();
let isDropdown = false;
let clickedInput = "";

Template.custfieldpopup.onCreated(() => {
  const templateObject = Template.instance();
  templateObject.custfields = new ReactiveVar([]);
  templateObject.dropdownoptions = new ReactiveVar([]);
  templateObject.selectedFieldIndex = new ReactiveVar(0);
  templateObject.dropdowns1 = new ReactiveVar([]);
  templateObject.dropdowns2 = new ReactiveVar([]);
  templateObject.dropdowns3 = new ReactiveVar([]);
});

Template.custfieldpopup.onRendered(() => {
  const templateObject = Template.instance();
  


  templateObject.getSelectedDropdownOptions = async function(listType, fieldIndex) {
    return new Promise((resolve, reject)=> {
      if(fieldIndex == 1) {
          resolve(templateObject.dropdowns1.get())
      } else if(fieldIndex == 2) {
        resolve(templateObject.dropdowns2.get())
      } else if(fieldIndex == 3) {
        resolve(templateObject.dropdowns3.get())
      }
    })
  }


  var splashArrayClientTypeList1 = new Array();

  templateObject.custfields.set(templateObject.data.custfields);




  $(document).ready(function () {
    for(let i = 1 ; i< 4; i++) {
        $("#formCheck-custom"+i.toString()).click(function(event) {
            if ($(event.target).is(":checked")) {
                $(".checkbox"+i.toString()+"div").css("display", "block");
            } else {
                $(".checkbox"+i.toString()+"div").css("display", "none");
            }      
        });
        
    }

 

  
    // add to custom field
    $(document).on("click", ".btnRefreshCustomField", function (e) {

      data_id = e.target.dataset.id;
      $(".fullScreenSpin").css("display", "inline-block");

      $(".fullScreenSpin").css("display", "inline-block");

      let dataSearchName = $("#customFieldDropdownTable" + data_id + "_filter input").val();

      if (dataSearchName.replace(/\s/g, "") != "") {
        sideBarService.getCustomFieldsDropDownByNameOrID(dataSearchName).then(function (fieldsData) {
          $(".btnRefreshCustomField").removeClass("btnSearchAlert");

          let data = fieldsData.tcustomfieldlistdropdown
          splashArrayClientTypeList1 = [];

          $("#isdropDown" + data_id).val(true);
          if (data.length > 0) {
            for (let i = 0; i < data.length; i++) {
              var dataList = [
                data[i].fields.ID || "",
                data[i].fields.Text || "",
              ];
              splashArrayClientTypeList1.push(dataList);
            }
          }

          $(".fullScreenSpin").css("display", "none");
          setTimeout(function () {
            $("#customFieldDropdownTable" + data_id)
              .DataTable({
                data: splashArrayClientTypeList1,
                sDom: "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                paging: true,
                aaSorting: [],
                orderMulti: true,
                columnDefs: [
                  {
                    orderable: false,
                    targets: -1,
                  },
                  {
                    className: "colCustField",
                    targets: [0],
                  },
                  {
                    className: "colFieldName pointer",
                    targets: [1],
                  },
                ],
                select: true,
                destroy: true,
                colReorder: true,
                pageLength: initialDatatableLoad,
                lengthMenu: [
                  [initialDatatableLoad, -1],
                  [initialDatatableLoad, "All"],
                ],
                info: true,
                responsive: true,
                fnInitComplete: function () {
                  $("<button class='btn btn-primary btnAddNewCustField' data-id='" + data_id + "' type='button' style='padding: 4px 10px; font-size: 14px; margin-left:  8px !important;'><i class='fas fa-plus' data-id='" + data_id + "'></i></button>"
                  ).insertAfter("#customFieldDropdownTable" + data_id + "_filter");

                  $("<button class='btn btn-primary btnRefreshCustomField' type='button' data-id='" + data_id + "' style='padding: 4px 10px; font-size: 14px;  margin-left: 8px !important;'><i class='fas fa-search-plus' data-id='" + data_id + "' style='margin-right: 5px'></i>Search</button>").insertAfter("#customFieldDropdownTable" + data_id + "_filter");
                },
              })
              .on("page", function () {
                setTimeout(function () {
                  // MakeNegative();
                }, 100);
                // let draftRecord = templateObject.datatablerecords.get();
                // templateObject.datatablerecords.set(draftRecord);
              })
              .on("column-reorder", function () { })
              .on("length.dt", function (e, settings, len) {
                setTimeout(function () {
                  // MakeNegative();
                }, 100);
              });
            $(".fullScreenSpin").css("display", "none");
          }, 10);

          $(".fullScreenSpin").css("display", "none");
        })
          .catch(function (err) {
            $(".fullScreenSpin").css("display", "none");
          });
      } else {
        $(".fullScreenSpin").css("display", "none");
      }

    });
    setTimeout(function() {
      for(let i=1; i<4; i++ ) {
        let custfields = templateObject.data.custfields;
        let dropdowns = custfields[i-1].dropdown;
        let dropdownOptions = [];
        for(let j=0; j< dropdowns.length; j++) {
          dropdownOptions.push({id: dropdowns[j].fields.ID, optionname: dropdowns[j].fields.Text})
        }
        if(i == 1) {
          templateObject.dropdowns1.set(dropdownOptions);
        } else if(i==2) {
          templateObject.dropdowns2.set(dropdownOptions)
        } else if (i==3) {
          templateObject.dropdowns3.set(dropdownOptions)
        }
      }
    }, 2000)

  });

  templateObject.drawDropDownListTable = function (data_id) {
    let fieldsData = templateObject.custfields.get();
    splashArrayClientTypeList1 = [];

    $("#isdropDown" + data_id).val(true);
    if (fieldsData.length > 0) {
      for (let i = 0; i < fieldsData.length; i++) {
        if (Array.isArray(fieldsData[i].dropdown)) {
          if (data_id - 1 == i) {
            for (let x = 0; x < fieldsData[i].dropdown.length; x++) {
              var dataList = [
                fieldsData[i].dropdown[x].fields.ID || "",
                fieldsData[i].dropdown[x].fields.Text || "",
              ];
              splashArrayClientTypeList1.push(dataList);
            }
          }
        } else if (
          fieldsData[i].dropdown &&
          !Array.isArray(fieldsData[i].dropdown) &&
          Object.keys(fieldsData[i].dropdown).length > 0
        ) {
          if (data_id - 1 == i) {
            var dataList = [
              fieldsData[i].dropdown.fields.ID || "",
              fieldsData[i].dropdown.fields.Text || "",
            ];
            splashArrayClientTypeList1.push(dataList);
          }
        }
      }
    }

    $(".fullScreenSpin").css("display", "none");
    setTimeout(function () {
      $("#customFieldDropdownTable" + data_id).DataTable({
        data: splashArrayClientTypeList1,
        sDom: "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
        paging: true,
        aaSorting: [],
        orderMulti: true,
        columnDefs: [
          {
            orderable: false,
            targets: -1,
          },
          {
            className: "colCustField",
            targets: [0],
          },
          {
            className: "colFieldName pointer",
            targets: [1],
          },
        ],
        select: true,
        destroy: true,
        colReorder: true,
        pageLength: initialDatatableLoad,
        lengthMenu: [
          [initialDatatableLoad, -1],
          [initialDatatableLoad, "All"],
        ],
        info: true,
        responsive: true,
        fnInitComplete: function () {
          $("<button class='btn btn-primary btnAddNewCustField' data-id='" + data_id + "' type='button' style='padding: 4px 10px; font-size: 14px; margin-left:  8px !important;'><i class='fas fa-plus' data-id='" + data_id + "'></i></button>"
          ).insertAfter("#customFieldDropdownTable" + data_id + "_filter");

          $("<button class='btn btn-primary btnRefreshCustomField' type='button' data-id='" + data_id + "' style='padding: 4px 10px; font-size: 14px;  margin-left: 8px !important;'><i class='fas fa-search-plus' data-id='" + data_id + "' style='margin-right: 5px'></i>Search</button>").insertAfter("#customFieldDropdownTable" + data_id + "_filter");
        },
      }).on("page", function () {
        setTimeout(function () {
          // MakeNegative();
        }, 100);
        let draftRecord = templateObject.datatablerecords.get();
        templateObject.datatablerecords.set(draftRecord);
      }).on("column-reorder", function () { })
        .on("length.dt", function (e, settings, len) {
          setTimeout(function () {
            // MakeNegative();
          }, 100);
        });
      $(".fullScreenSpin").css("display", "none");
    }, 10);

    setTimeout(() => {
      let custFieldNo = data_id;
      let custField = fieldsData[data_id - 1];
      $("#edtSaleCustField" + custFieldNo).editableSelect();
      $("#edtSaleCustField" + custFieldNo).editableSelect().on("click.editable-select", function (e, li) {
        var $earch = $(this);
        var offset = $earch.offset();
        var fieldDataName = e.target.value || "";
        var fieldDataID =
          $("#edtSaleCustField" + custFieldNo).attr("custfieldid") || "";
        $("#selectCustFieldID").val(fieldDataID);
        $('#customFieldDropdownListTitle' + custFieldNo).html(custField.custfieldlabel);

        if (e.pageX > offset.left + $earch.width() - 8) {
          // X button 16px wide?
          $("#customFieldDropdownListModal" + custFieldNo).modal("toggle");
        } else {
          if (fieldDataName.replace(/\s/g, "") != "") {
            $("#newStatusHeader" + custFieldNo).text(
              "Edit " + custField.custfieldlabel
            );
            getVS1Data("TCustomFieldList").then(function (dataObject) {
              //edit to test indexdb
              if (dataObject.length == 0) {
                $(".fullScreenSpin").css("display", "inline-block");
                sideBarService.getAllCustomFields().then(function (data) {
                  for (let i in data.tcustomfieldlist) {
                    if (data.tcustomfieldlist[i].fields.Description === fieldDataName) {
                      $("#statusId").val(data.tcustomfieldlist[i].fields.ID);
                      $("#newStatus").val(data.tcustomfieldlist[i].fields.Description);
                    }
                  }
                  // setTimeout(function () {
                  $(".fullScreenSpin").css("display", "none");
                  $("#newCustomFieldPop").modal("toggle");
                  // }, 200);
                });
              } else {
                let data = JSON.parse(dataObject[0].data);
                for (let i in data.tcustomfieldlist) {
                  if (data.tcustomfieldlist[i].fields.Description === fieldDataName) {
                    $("#statusId").val(data.tcustomfieldlist[i].fields.ID);
                    $("#newStatus").val(data.tcustomfieldlist[i].fields.Description);
                  }
                }
                // setTimeout(function () {
                $(".fullScreenSpin").css("display", "none");
                $("#newCustomFieldPop").modal("toggle");
                // }, 200);
              }
            }).catch(function (err) {
                $(".fullScreenSpin").css("display", "inline-block");
                sideBarService.getAllCustomFields().then(function (data) {
                  for (let i in data.tcustomfieldlist) {
                    if (data.tcustomfieldlist[i].fields.Description === fieldDataName) {
                      $("#statusId" + custFieldNo).val(data.tcustomfieldlist[i].fields.ID);
                      $("#newStatus" + custFieldNo).val(data.tcustomfieldlist[i].fields.Description);
                    }
                  }
                  // setTimeout(function () {
                  $(".fullScreenSpin").css("display", "none");
                  $("#newCustomFieldPop").modal("toggle");
                  // }, 200);
                });
              });
          } else {
            $("#customFieldDropdownListModal").modal();
          }
        }
      });
    }, 500);
  };

});

Template.custfieldpopup.events({
  "click .btnSaveCustomField": async function (event) {
    playSaveAudio();
    const templateObject = Template.instance();

    let dropDownData = [];
    let dropObj = "";
    let optionbody = $(event.target).closest('form').find('div.modal-body div.row')[1];
    let textfields = $(optionbody).find('input.customText');
    let dropdown = [];
    for (let i = 0; i< textfields.length; i++) {
      dropdown.push({id: $(textfields[i]).attr('row-id'), optionname: $(textfields[i]).val()})
    }

    let selIndex = templateObject.selectedFieldIndex.get();
    if(selIndex == "1") {
      templateObject.dropdowns1.set(dropdown)
    } else if(selIndex == '2') {
      templateObject.dropdowns2.set(dropdown)
    } else if (selIndex == '3') {
      templateObject.dropdowns3.set(dropdown)
    }

    $(event.target).closest('div.modal.fade.show').modal('hide')
    // $(".fullScreenSpin").css("display", "inline-block");

    // let countCustom = 0;
    // $(".customText").each(function (item, index) {
    //   countCustom++;
    //   if ($(this).val()) {
    //     dropObj = {
    //       // id: index,
    //       optionname: $(this).val()
    //     };
    //     dropDownData.push(dropObj);
    //   }
    // });

    // let originalData = [];
    // let dataObject = await getVS1Data('TCustomFieldDropdownOptions');
    // let object = {
    //   listType : templateObject.data.custlisttype,
    //   custFieldIndex: templateObject.selectedFieldIndex.get(),
    //   options: dropDownData
    // }

    // let useData = [];
    // let resultData = [];
    // if(dataObject.length > 0) {
    //   let data = JSON.parse(dataObject[0].data);
    //   useData = data.tcustomfielddropdownoptions;
    //   resultData = cloneDeep(useData)
    //   originalData = templateObject.dropdownoptions.get();
    //   if(originalData.length > 0) {
    //     let index = useData.findIndex((item)=>{
    //       return item.listType == templateObject.data.custlisttype && item.custFieldIndex == templateObject.selectedFieldIndex.get()
    //     })
    //     if(index>-1) {
    //       resultData.splice(index, 1, object)
    //     }
    //   } else {
    //     resultData.push(object)
    //   }
    // } else {
    //   resultData.push(object)
    // }
    // addVS1Data('TCustomFieldDropdownOptions', JSON.stringify({tcustomfielddropdownoptions:resultData})).then(function() {
    //    $(".fullScreenSpin").css("display", "none"); 
    //    $('#newCustomFieldPop').modal('hide');
    //   }).catch(function(e){$('#newCustomFieldPop').modal('hide');})
  },  
      


  "click .btnCustomFieldToggleDrop": async function (e) {
    const templateObject = Template.instance();
    let templateId = "custfieldpopup";
    if(templateObject.data.custid) {
      templateId = templateId+"_"+templateObject.data.custid
    }
    let data_id = e.target.dataset.id;

    let custfieldarr = templateObject.custfields.get() || templateObject.data.custfields;

   
    
    templateObject.selectedFieldIndex.set($(e.target).attr("data-id"))
    let dropdownOptions = await templateObject.getSelectedDropdownOptions(templateObject.data.custlisttype, templateObject.selectedFieldIndex.get());
    templateObject.dropdownoptions.set(dropdownOptions);    
    $("#"+templateId+" #newCustomFieldPop").modal('show')
   
  },

  'click .custom-switch .input-group-append .dropdown-menu>a': function (e) {
    let text = $(e.target).text();
    if(text == 'Dropdown') text = text + ' Field'
    let data_id = parseInt($(e.target).attr("data-id"))
    $("span.custFieldText"+(data_id - 1).toString()).text(text)
  },




  "click .btnCustomFieldSaveSettings": async function (event) {
    
    let templateObject = Template.instance();
    $('.fullScreenSpin').css('display', 'inline-block')
    let templateId = 'custfieldpopup';
    if(templateObject.data.custid) {
      templateId = templateId+"_"+templateObject.data.custid;
    }
    let fieldData = [];
    let parent = $(event.target).closest('.modal-dialog');
    let fields= $(parent).find('.customfieldcommon');
    $(fields).each(function () {
      let isCombo = false;
      let datatype = 'ftString';
      let fieldIndex = '';
      let eventtargetIndex = $(this).closest(".custom-switch").find("[type=checkbox]").attr('value');
      fieldIndex = eventtargetIndex == 'one'?'1': eventtargetIndex=='two'?'2': '3';
      if (
        $(this).closest(".custom-switch").find("[type=checkbox]").is(":checked")
      ) {
        checkChckBox = true;
      } else {
        checkChckBox = false;
      }


      if($(this).closest(".custom-switch").prev().text().includes('Dropdown')) {
        isCombo = true
      }

      if($(this).closest('.custom-switch').prev().text().includes('Date')) {
        datatype = "ftDateTime"
      }
      dropObj = {
        active: checkChckBox,
        id: $(this).attr("custid") || "",
        name: $(this).val() || "",
        datatype: datatype,
        isCombo: isCombo,
        fieldIndex: fieldIndex
      };
      fieldData.push(dropObj);
    });
    let listType = templateObject.data.custlisttype;
    async function saveSettings () {
      return new Promise(async(resolve, reject) => {
        for (let i = 0; i < fieldData.length; i++) {
              let fieldID = fieldData[i].id || 0;
              let name = fieldData[i].name || "";
              let dataType = fieldData[i].datatype || "";
              let objectDetail = {
                type:'TCustomFieldList',
                fields: {
                  Active: fieldData[i].active,
                  Description: name,
                  ListType: listType,
                  IsCombo: fieldData[i].isCombo,
                  DataType: dataType,
                  Dropdown: '',
                  ID: fieldData[i].id,
                  KeyValue: name
                }
              }
              if(fieldData[i].id && fieldData[i] != "") {}
              if(fieldData[i].isCombo == true) {
                let dropdownOptions = [];

                dropdownOptions = await templateObject.getSelectedDropdownOptions(templateObject.data.custlisttype, i+1);
                let dropdown = [];
                if(fieldData[i].fieldIndex == '1') {
                  dropdownOptions = templateObject.dropdowns1.get()
                } else if (fieldData[i].fieldIndex == '2') {
                  dropdownOptions = templateObject.dropdowns2.get()
                } else if (fieldData[i].fieldIndex == '3') {
                  dropdownOptions = templateObject.dropdowns3.get()
                }
                for (let j=0; j< dropdownOptions.length; j++) {
                  let detail = {
                    type: 'TCustomFieldListDropDown',
                    fields: {
                      Text: dropdownOptions[j].optionname
                    }
                  }
                  if(dropdownOptions[j].id !== undefined) detail.fields.ID = dropdownOptions[j].id
                  dropdown.push(detail)
                }
                objectDetail.fields.Dropdown = dropdown
              }
              organisationService.saveCustomField(objectDetail).then(function (objDetails) {
                sideBarService.getAllCustomFields().then(function (data) {
                  addVS1Data("TCustomFieldList", JSON.stringify(data)).then(function (datareturn) {
                    if(i == fieldData.length-1) {$('.fullScreenSpin').css('display', 'none'); swal({
                      title: 'Custom fields Successfully Changed',
                      text: "Please refresh your page to activate your changes.",
                      type: 'success',
                      showCancelButton: false,
                      confirmButtonText: 'OK'
                      }).then((result) => {
                      if (result.value) {
                        window.location.reload();
                        resolve();
                      } else if (result.dismiss === 'cancel') {
                        resolve()
                      }
                      });}
                  }).catch(function (err) {
                    resolve();
                  })
                  })
            
              }).catch(function (err) {
                swal({
                  title: "Oooops...",
                  text: err,
                  type: "error",
                  showCancelButton: false,
                  confirmButtonText: "Try Again",
                }).then((result) => {
                  if (result.value) {
                    $(".fullScreenSpin").css("display", "none");
                  } else if (result.dismiss === "cancel") {
                  }
                });
                $(".fullScreenSpin").css("display", "none");
              });
    
        }
      })
    }

    let res = await saveSettings();
    
  },


  "click .btnCustomFieldResetSettings": function (event) {
    let templateObject = Template.instance();
    var url = FlowRouter.current().path;
    let fieldData = [];
    let checkChckBox = false;
    let checkboxes = $(event.target).closest('.modal-content').find('input.custom-control-input');
    checkboxes.each(function(index, item){
      $(item).prop('checked', false)
    })
    // $("#formCheck-customOne").prop("checked", false);
    $(".checkbox1div").css("display", "none");
    // $("#formCheck-customTwo").prop("checked", false);
    $(".checkbox2div").css("display", "none");
    // $("#formCheck-customThree").prop("checked", false);
    $(".checkbox3div").css("display", "none");

    // $(".custField1Text").css("display", "block");
    // $(".custField1Date").css("display", "none");
    // $(".custField1Dropdown").css("display", "none");

    // $(".custField2Text").css("display", "block");
    // $(".custField2Date").css("display", "none");
    // $(".custField2Dropdown").css("display", "none");

    // $(".custField3Text").css("display", "block");
    // $(".custField3Date").css("display", "none");
    // $(".custField3Dropdown").css("display", "none");

    let field_no = 1;
    $(".customfieldcommon").each(function () {
      dropObj = {
        active: checkChckBox,
        id: $(this).attr("custid") || "",
        name: "Custom Field" + field_no,
        datatype: "ftString",
      };
      fieldData.push(dropObj);
      field_no++;
    });

    let listType = "";
    listType = templateObject.data.custlisttype
    // let objDetails1 = "";
    // $(".fullScreenSpin").css("display", "inline-block");
    

    for (let i = 0; i < fieldData.length; i++) {
      let fieldID = fieldData[i].id || 0;
      let name = fieldData[i].name || "";

      if (fieldID == "") {
        if (i == 0) {
          $(".lblCustomField1").text("Text Field");
          $("#customFieldText1").val("Custom Field1");
        }

        if (i == 1) {
          $(".lblCustomField2").text("Text Field");
          $("#customFieldText2").val("Custom Field2");
        }

        if (i == 2) {
          $(".lblCustomField3").text("Text Field");
          $("#customFieldText3").val("Custom Field3");
          $(event.target).closest('div.modal.fade.show').modal("hide");
          $(".fullScreenSpin").css("display", "none");
        }
      } else {
        objDetails1 = {
          type: "TCustomFieldList",
          fields: {
            Active: false,
            ID: parseInt(fieldID),
            DataType: "ftString",
            Description: name,
            ListType: listType,
            IsCombo: "false",
          },
        };

        organisationService.saveCustomField(objDetails1).then(function (objDetails) {
          if (i == 0) {
            $(".lblCustomField1").text("Text Field");
            $("#customFieldText1").val(fieldData[i].name);
          }

          if (i == 1) {
            $(".lblCustomField2").text("Text Field");
            $("#customFieldText2").val(fieldData[i].name);
          }

          if (i == 2) {
            $(".lblCustomField3").text("Text Field");
            $("#customFieldText3").val(fieldData[i].name);
            $(event.target).closest('div.modal.fade.show').modal("hide");
            $(".fullScreenSpin").css("display", "none");
          }
        }).catch(function (err) {
          swal({
            title: "Oooops...",
            text: err,
            type: "error",
            showCancelButton: false,
            confirmButtonText: "Try Again",
          }).then((result) => {
            if (result.value) {
              $(".fullScreenSpin").css("display", "none");
            } else if (result.dismiss === "cancel") {
            }
          });
          $(".fullScreenSpin").css("display", "none");
        });
      }
    }

    // setTimeout(function () {
    //   sideBarService.getAllCustomFields().then(function (data) {
    //     addVS1Data("TCustomFieldList", JSON.stringify(data));
    //   });
    // }, 1500);
  },



  "click .btnAddNewTextBox": function (event) {
    let templateObject = Template.instance();
    let templateId = 'custfieldpopup';
    if(templateObject.data.custid) {
      templateId = templateId + '_' + templateObject.data.custid
    }
    var textBoxData = "";
    let fieldsCount = $('#'+templateId+' .textBoxSection').length;
     if($(".textBoxSection").length > 0) {textBoxData = $(".textBoxSection:last").clone(true);}
     else {textBoxData = $('<div class="row textBoxSection"  style="padding:5px">' +
     '<div class="col-10">' +
         '<input type="text" name="customText" class="form-control customText" row-id="000" value="{{this.optionname}}">' +
     '</div>' +
     '<div class="col-2">' +
         '<button type="button" class="btn btn-danger btn-rounded btnRemoveDropOptions"' +
             'autocomplete="off"><i class="fa fa-remove"></i></button>' +
     '</div>' +
 '</div>')}
    let tokenid = Random.id();
    textBoxData.find("input:text").val("");
    textBoxData.find("input:text").attr("token", "0");
    textBoxData.find("input:text").attr("id", "textBoxSection_"+fieldsCount);
    $(".dropDownSection").append(textBoxData);
  },

  "click .btnRemoveDropOptions": function (event) {
    let templateObject = Template.instance();
    let templateId = 'custfieldpopup';
    if(templateObject.data.custid) {
      templateId = templateId + "_"+templateObject.data.custid
    }
    if ($("#"+templateId+" .textBoxSection").length > 1) {
      $(event.target).closest(".textBoxSection").remove();
    } else {
      $("input[name='customText']").val("");
    }
  },

//   // search labels table
//   "keyup .dataTables_filter input": function (event) {
//     if ($(event.target).val() != "") {
//       $(".btnRefreshCustomField").addClass("btnSearchAlert");
//     } else {
//       $(".btnRefreshCustomField").removeClass("btnSearchAlert");
//     }
//     if (event.keyCode == 13) {
//       $(".btnRefreshCustomField").trigger("click");
//     }
//   },

});

Template.custfieldpopup.helpers({
  custfield1: () => {
    let url = FlowRouter.current().path;
    if (url.includes("/salesordercard")) {
      return localStorage.getItem("custfield1salesorder") || "Custom Field 1";
    } else if (url.includes("/invoicecard")) {
      return localStorage.getItem("custfield1invoice") || "Custom Field 1";
    } else if (url.includes("/quotecard")) {
      return localStorage.getItem("custfield1quote") || "Custom Field 1";
    } else if (url.includes("/refundcard")) {
      return localStorage.getItem("custfield1refund") || "Custom Field 1";
    } else if (url.includes("/chequecard")) {
      return localStorage.getItem("custfield1cheque") || "Custom Field 1";
    }
  },
  custfield2: () => {
    let url = FlowRouter.current().path;
    if (url.includes("/salesordercard")) {
      return localStorage.getItem("custfield2salesorder") || "Custom Field 2";
    } else if (url.includes("/invoicecard")) {
      return localStorage.getItem("custfield2invoice") || "Custom Field 2";
    } else if (url.includes("/quotecard")) {
      return localStorage.getItem("custfield2quote") || "Custom Field 2";
    } else if (url.includes("/refundcard")) {
      return localStorage.getItem("custfield2refund") || "Custom Field 2";
    } else if (url.includes("/chequecard")) {
      return localStorage.getItem("custfield2cheque") || "Custom Field 2";
    }
  },
  custfield3: () => {
    let url = FlowRouter.current().path;
    if (url.includes("/salesordercard")) {
      return localStorage.getItem("custfield3salesorder") || "Custom Field 3";
    } else if (url.includes("/invoicecard")) {
      return localStorage.getItem("custfield3invoice") || "Custom Field 3";
    } else if (url.includes("/quotecard")) {
      return localStorage.getItem("custfield3quote") || "Custom Field 3";
    } else if (url.includes("/refundcard")) {
      return localStorage.getItem("custfield3refund") || "Custom Field 3";
    } else if (url.includes("/chequecard")) {
      return localStorage.getItem("custfield3cheque") || "Custom Field 3";
    }
  },
  customfields: () => {
    return Template.instance().data.custfields;
  },
  fieldscountarray:()=>{
    return [1,2,3]
  },

  dropdownoptions:()=>{
    return Template.instance().dropdownoptions.get()
  }
});

Template.registerHelper('getIndex', function(index) {
    return index + 1;
});
