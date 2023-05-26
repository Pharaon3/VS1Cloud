import {SalesBoardService} from '../js/sales-service';
import { ReactiveVar } from 'meteor/reactive-var';
import { CoreService } from '../js/core-service';
import {EmployeeProfileService} from "../js/profile-service";
import {AccountService} from "../accounts/account-service";
import {InvoiceService} from "../invoice/invoice-service";
import {UtilityService} from "../utility-service";
import { SideBarService } from '../js/sidebar-service';
import {OrganisationService} from '../js/organisation-service';
import 'jquery-ui-dist/external/jquery/jquery';
import 'jquery-ui-dist/jquery-ui';
import 'jquery-editable-select';
import {Session} from 'meteor/session';
import { Template } from 'meteor/templating';
import './workorderList.html';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import moment from 'moment';
import { ManufacturingService} from "./manufacturing-service";
import {ProductService} from '../product/product-service';


let sideBarService = new SideBarService();
let utilityService = new UtilityService();
let accountService = new SalesBoardService();
let manufacturingService = new ManufacturingService();
let productService = new ProductService();


Template.workorderlist.onCreated(function() {
    const templateObject = Template.instance();
    templateObject.datatablerecords = new ReactiveVar([]);
    templateObject.tableheaderrecords = new ReactiveVar([]);
    templateObject.workOrderRecords = new ReactiveVar([]);
    templateObject.bomProducts = new ReactiveVar([]);
    templateObject.attachmentModalHtml = new ReactiveVar('');
    templateObject.isMobileDevices = new ReactiveVar(false);
    templateObject.checkId = new ReactiveVar([]);




    templateObject.getDataTableList = function(data){

        let cur_date = new Date();
        let show_bom_temp = `<button class="btn btn-primary btnShowBOM" id="btnShowBOM"><i class="fa fa-eye" style="padding-right: 8px;"></i>Show BOM </button>`;
        let linestatus;     
        if (data.Active  == false) {
            linestatus = "";
        } else if (data.Active  == true) {
            linestatus = "In-Active";
        }
       
        let dataList = [
            data.fields.ID ,
            data.fields.SaleID || '',
            data.fields.Customer || '',
            data.fields.PONumber || '',
            // moment(data.fields.SaleDate).format("DD/MM/YYYY") || '',
            // moment(data.fields.DueDate).format("DD/MM/YYYY") || '',
            moment(cur_date).format("DD/MM/YYYY") || '',
            moment(cur_date).format("DD/MM/YYYY") || '',
            data.fields.ProductName || '',
            show_bom_temp,
            data.fields.Quantity || '',
            data.fields.Comment || '',
            linestatus
           
        ];

        return dataList;
      }

    let headerStructure = [
        { index: 0, label: "ID", class: "colID", width: "0", active: false, display: true },
        { index: 1, label: "SalesOrderID", class: "colOrderNumber", width: "80", active: true, display: true },
        { index: 2, label: "Customer", class: "colCustomer", width: "80", active: true, display: true },
        { index: 3, label: "PO Number", class: "colPONumber", width: "100", active: true, display: true },
        { index: 4, label: "Sale Date", class: "colSaleDate", width: "200", active: true, display: true },
        { index: 5, label: "Due Date", class: "colDueDate", width: "200", active: true, display: true },
        { index: 6, label: "Product", class: "colProductName", width: "120", active: true, display: true },
        { index: 7, label: "Show BOM", class: "colShowBOM", width: "120", active: true, display: true },
        { index: 8, label: "Amount", class: "colAmount", width: "80", active: true, display: true },
        { index: 9, label: "Comments", class: "colComment", width: "500", active: true, display: true },      
        { index: 10, label: 'Status', class: 'colStatus', active: true, display: true, width: "110" },  
    ];
    templateObject.tableheaderrecords.set(headerStructure)
})

Template.workorderlist.onRendered (function() {
    const templateObject = Template.instance();
    templateObject.getAllWorkorders = function() {
        
        getVS1Data('TVS1Workorder').then(function(dataObject){
            if(dataObject.length == 0 || dataObject[0].data.length == 0 ) {
                let workOrderList = manufacturingService.getWorkOrderList();
                templateObject.workOrderRecords.set(workOrderList);
                addVS1Data('TVS1Workorder', JSON.stringify({tvs1workorder: workOrderList})).then(function(datareturn){
                    
                }).catch(function(err){
                });

            }else  {
                let data = JSON.parse(dataObject[0].data);
                templateObject.workOrderRecords.set(data.tvs1workorder);
                
            }
        }).catch(function(error) {
            let workOrderList = manufacturingService.getWorkOrderList();
                templateObject.workOrderRecords.set(workOrderList);
                addVS1Data('TVS1Workorder', JSON.stringify({tvs1workorder: workOrderList})).then(function(datareturn){
                    
                }).catch(function(err){
                });
        })
    
    }
    templateObject.getAllWorkorders();

    templateObject.getAllBOMProducts = async() => {
        return new Promise(async(resolve, reject)=> {
            getVS1Data('TProcTree').then(function(dataObject) {
                if(dataObject.length == 0) {
                    productService.getAllBOMProducts(initialBaseDataLoad, 0).then(function(data) {
                        templateObject.bomProducts.set(data.tproctree);
                        resolve()
                    })
                }else {
                    let data = JSON.parse(dataObject[0].data);
                    templateObject.bomProducts.set(data.tproctree)
                    resolve()
                }
            }).catch(function(e){
                productService.getAllBOMProducts(initialBaseDataLoad, 0).then(function(data) {
                    templateObject.bomProducts.set(data.tproctree)
                    resolve()
                })
            })
        })
    }
    templateObject.getAllBOMProducts();

    if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) ||
    /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4))){
        templateObject.isMobileDevices.set(true);
    }


    let modalHtml = "<div class='modal-dialog modal-dialog-centered' role='document'>" +
                    "<div class='modal-content'>" +
                        "<div class='modal-header'>" +
                            "<h4>Upload Attachments</h4><button type='button' class='close' data-dismiss='modal' aria-label='Close'><span aria-hidden='true'>×</span></button>" +
                        "</div>" +
                        "<div class='modal-body' style='padding: 0px;'>" +
                            "<div class='divTable file-display'>" +
                                "<div class='col inboxcol1'>" +
                                    "<img src='/icons/nofiles_icon.jpg' class=' style='width:100%;'>" +
                                "</div>" +
                                "<div class='col inboxcol2' style='text-align: center;'>" +
                                    "<div>Upload files or add files from the file library.</div>"
                                if(templateObject.isMobileDevices.get() == true) {
                                    modalHtml = modalHtml +"<div>Capture copies of receipt's or take photo's of completed jobs.</div>"
                                }


                                modalHtml = modalHtml + "<p style='color: #ababab;'>Only users with access to your company can view these files</p>" +
                                        "</div>" +
                                    "</div>" +
                                "</div>"+
                                "<div class='modal-footer'>";
                                if(templateObject.isMobileDevices.get() == true) {
                                    modalHtml = modalHtml +"<input type='file' class='img-attachment-upload' id='img-attachment-upload' style='display:none' accept='image/*' capture='camera'>" +
                                    "<button class='btn btn-primary btnUploadFile img_new_attachment_btn' type='button'><i class='fas fa-camera' style='margin-right: 5px;'></i>Capture</button>" +

                                    "<input type='file' class='attachment-upload' id='attachment-upload' style='display:none' multiple accept='.jpg,.gif,.png'>"
                                }else {
                                    modalHtml = modalHtml + "<input type='file' class='attachment-upload' id='attachment-upload' style='display:none' multiple accept='.jpg,.gif,.png,.bmp,.tiff,.pdf,.doc,.docx,.xls,.xlsx,.ppt," +
                                    ".pptx,.odf,.csv,.txt,.rtf,.eml,.msg,.ods,.odt,.keynote,.key,.pages-tef," +
                                    ".pages,.numbers-tef,.numbers,.zip,.rar,.zipx,.xzip,.7z,image/jpeg," +
                                    "image/gif,image/png,image/bmp,image/tiff,application/pdf," +
                                    "application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document," +
                                    "application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet," +
                                    "application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation," +
                                    "application/vnd.oasis.opendocument.formula,text/csv,text/plain,text/rtf,message/rfc822," +
                                    "application/vnd.ms-outlook,application/vnd.oasis.opendocument.spreadsheet," +
                                    "application/vnd.oasis.opendocument.text,application/x-iwork-keynote-sffkey," +
                                    "application/vnd.apple.keynote,application/x-iwork-pages-sffpages," +
                                    "application/vnd.apple.pages,application/x-iwork-numbers-sffnumbers," +
                                    "application/vnd.apple.numbers,application/zip,application/rar," +
                                    "application/x-zip-compressed,application/x-zip,application/x-7z-compressed'>"
                                }
                                modalHtml = modalHtml +
                                    "<button class='btn btn-primary btnUploadFile new_attachment_btn' type='button'><i class='fa fa-cloud-upload' style='margin-right: 5px;'></i>Upload</button>" +
                                    "<button class='btn btn-success closeModal' data-dismiss='modal' type='button' style='margin-right: 5px;' autocomplete='off'>" +
                                        "<i class='fa fa-save' style='padding-right: 8px;'></i>Save" +
                                    "</button>" +
                                    "<button class='btn btn-secondary' data-dismiss='modal' type='button'><i class='fa fa-remove' style='margin-right: 5px;'></i>Close</button>" +
                                "</div>"+
                            "</div>"+
                        "</div>"+
                    "</div>" ;

    templateObject.attachmentModalHtml.set(modalHtml);
});

Template.workorderlist.helpers ({
    datatablerecords : () => {
        return Template.instance().datatablerecords.get();
    },
    selectedInventoryAssetAccount: () => {
        return Template.instance().selectedInventoryAssetAccount.get();
    },
    tableheaderrecords: () => {
        return Template.instance().tableheaderrecords.get();
    },
    datahandler: function () {
        let templateObject = Template.instance();
        return function(data) {
            let dataReturn =  templateObject.getDataTableList(data)
            return dataReturn
        }
    },

    apiFunction:function() {
        let manufacturingService = new ManufacturingService();
        return manufacturingService.getWorkOrder;
    },

    searchAPI: function() {
        return ManufacturingService.getWorkOrder;
    },

    service: ()=>{
        let manufacturingService = new ManufacturingService();
        return manufacturingService;

    },

    exDataHandler: function() {
        let templateObject = Template.instance();
        return function(data) {
            let dataReturn =  templateObject.getDataTableList(data)
            return dataReturn
        }
    },

    apiParams: function() {
        return ['limitCount', 'limitFrom'];
    },

})


Template.workorderlist.events({

    'click .workorderList .btnRefresh': function(e) {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        setTimeout(function () {
            // templateObject.getWorkorderRecords();
            window.open('/workorderlist', '_self');
            }, 3000);
        },


    'click .workorderList #btnConvertSalesorder': function (e) {
        // FlowRouter.go('/workordercard');
        $('#salesOrderListModal').modal('toggle');
    },

    'click #salesOrderListModal table tbody tr': async function(event) {
        let workorderRecords = [];
        let templateObject = Template.instance();
        let salesorderid = $(event.target).closest('tr').find('.colSalesNo').text();
        workorderRecords = await templateObject.getAllWorkorders();
        getVS1Data('TSalesOrderEx').then(function(dataObject){
            if(dataObject.length == 0) {
                accountService.getOneSalesOrderdataEx(salesorderid).then(function(data) {
                  let lineItems = data.fields.Lines;
                  for(let i = 0; i< lineItems.length; i ++ ) {
                    let isExisting = false;
                    workorderRecords.map(order => {
                      if(order.fields.ProductName == lineItems[i].fields.ProductName && order.fields.SaleID == data.fields.ID) {
                          isExisting = true
                      }
                    })
                  //   if(lineItems[i].fields.isManufactured == true && isExisting == false) {
                    if(isExisting == false) {
                        let bomProducts = templateObject.bomProducts.get() || []
                        let index = bomProducts.findIndex(product => {
                          return product.Caption == lineItems[i].fields.ProductName;
                        })
                      if(index > -1) {
                          $('#salesOrderListModal').modal('toggle');
                          FlowRouter.go('workordercard?salesorderid='+salesorderid + '&lineId='+i)
                          break;
                      } else {
                        productService.getOneBOMProductByName(name).then(function(data){
                            if(data.tproctree.length>0) {
                                $('#salesOrderListModal').modal('toggle');
                                FlowRouter.go('workordercard?salesorderid='+salesorderid + '&lineId='+i)
                            }
                        })
                      }
                    }
                  }

                  if(templateObject.workOrderLineId.get() == -1) {
                      swal({
                          title: 'Oooops...',
                          text: 'This record is not available to create work order.',
                          type: 'error',
                          showCancelButton: false,
                          confirmButtonText: 'Ok'
                      }).then((result) => {
                          if (result.value) {}
                          else if (result.dismiss === 'cancel') {

                          }
                      });
                  } else {
                    $('#salesOrderListModal').modal('toggle');
                  }
                })
            } else {
                let data = JSON.parse(dataObject[0].data);
                let useData = data.tsalesorderex;
                for(let d = 0; d< useData.length; d++) {
                    if(parseInt(useData[d].fields.ID) == salesorderid) {
                       let lineItems = useData[d].fields.Lines;
                        for(let i = 0; i< lineItems.length; i ++ ) {
                            let isExisting = false;
                            if(workorderRecords.length> 0) {
                                    for(let j = 0; j< workorderRecords.length; j ++) {
                                        if(workorderRecords[j].fields.ProductName == lineItems[i].fields.ProductName && workorderRecords[j].fields.SaleID == useData[d].fields.ID) {
                                            isExisting = true
                                        }
                                    }
                            }
                          //   if(lineItems[i].fields.isManufactured == true && isExisting == false) {
                            if(isExisting == false) {
                                let bomProducts = templateObject.bomProducts.get();
                                let index = bomProducts.findIndex(product => {
                                    return product.Caption == lineItems[i].fields.ProductName;
                                })
                                if(index > -1) {
                                    $('#salesOrderListModal').modal('toggle');
                                    FlowRouter.go('workordercard?salesorderid='+salesorderid + '&lineId='+i)
                                    break
                                } else {
                                    productService.getOneBOMProductByName(name).then(function(data){
                                        if(data.tproctree.length>0) {
                                            $('#salesOrderListModal').modal('toggle');
                                            FlowRouter.go('workordercard?salesorderid='+salesorderid + '&lineId='+i)
                                        }
                                    })
                                }
                            }
                          }

                          if(templateObject.workOrderLineId.get() == -1) {
                              swal({
                                  title: 'Oooops...',
                                  text: 'This record is not available to create work order.',
                                  type: 'error',
                                  showCancelButton: false,
                                  confirmButtonText: 'Cancel'
                              }).then((result) => {
                                  if (result.value) {}
                                  else if (result.dismiss === 'cancel') {

                                  }
                              });
                          }else{
                            $('#salesOrderListModal').modal('toggle');
                          }
                    }
                }
            }
        }).catch(function(err){
            accountService.getOneSalesOrderdataEx(salesorderid).then(function(data) {
               let lineItems = data.fields.Lines;
               for(let i = 0; i< lineItems.length; i ++ ) {
                let isExisting = false;
                workorderRecords.map(order => {
                      if(order.fields.ProductName == lineItems[i].fields.ProductName && order.fields.SaleID == data.fields.ID) {
                      isExisting = true
                  }
                })
              //   if(lineItems[i].fields.isManufactured == true && isExisting == false) {
                if(isExisting == false) {
                    let bomProducts = templateObject.bomProducts.get()
                    let index = bomProducts.findIndex(product => {
                        return product.Caption == lineItems[i].fields.ProductName;
                    })
                    if(index > -1) {
                        $('#salesOrderListModal').modal('toggle');
                        templateObject.workOrderLineId.set(i);
                        FlowRouter.go('workordercard?salesorderid='+salesorderid + '&lineId='+i)
                        break
                    }else {
                        productService.getOneBOMProductByName(name).then(function(data){
                            if(data.tproctree.length>0) {
                               
                                $('#salesOrderListModal').modal('toggle');
                                FlowRouter.go('workordercard?salesorderid='+salesorderid + '&lineId='+i)
                            }
                        })
                    }
                }
              }

              if(templateObject.workOrderLineId.get() == -1) {
                  swal({
                      title: 'Oooops...',
                      text: err,
                      type: 'error',
                      showCancelButton: false,
                      confirmButtonText: 'This record is not available to create work order.'
                  }).then((result) => {
                      if (result.value) {}
                      else if (result.dismiss === 'cancel') {

                      }
                  });
              }else{
                $('#salesOrderListModal').modal('toggle');
              }
            })
        })

        // consider the api for product has field named 'isManufactured'

    },

    'click #tblWorkorderList tbody tr': function (event) {
        var id = $(event.target).closest('tr').find('.colID').text();
        FlowRouter.go('/workordercard?id='+id)
    },

    'click .workorderList #btnNewWorkorder': function(e) {
        let template = Template.instance();
        FlowRouter.go('/workordercard')
    },

    'click #btnShowBOM': function(event) {
        event.preventDefault();
        event.stopPropagation();
        let templateObject = Template.instance();

        let WorkorderID = $(event.target).closest('tr').find('td:first-child').text();
        let workorder_id = WorkorderID;              
      
        

      
        let bomProducts = templateObject.bomProducts.get()
        let workorders = templateObject.workOrderRecords.get(); 
        
        let index = workorders.findIndex(workorder=>{
            return workorder.fields.ID == workorder_id;
        })

        objectFields= JSON.parse(workorders[index].fields.BOMStructure);
        $('#edtMainProductName').val(objectFields.Caption)
        $('#edtProcess').editableSelect();
        $('#edtProcess').val(objectFields.Info);
        $('.edtProcessNote').val(objectFields.CustomInputClass);
        $('.edtDuration').val(objectFields.QtyVariation) || '' ;

        let subs = JSON.parse(objectFields.Details);
        
        let productContents = $('.product-content');
        
        for(let j =1 ; j < productContents.length; j++) {
            $(productContents[j]).empty();
        }                    

        for(let i=0; i< subs.length; i++) {
            let html = '';
            
            let subIsBOM = false;
            let bomIndex = bomProducts.findIndex(product=>{
                return product.Caption == subs[i].productName
            })

            if(bomIndex > -1) {
                subIsBOM = true
            }else {
                productService.getOneBOMProductByName(subs[i].productName).then(function(data) {
                    if(data.tproctree.length > 0) {
                        subIsBOM = true
                    }
                })
            }
            if(subIsBOM == true) {
                let isBuilt = subs[i].isBuild || false;              
                

                if(isBuilt == false) {
                    html += "<div class='product-content'><div class='d-flex productRow'><div class='d-flex  form-group colProduct'>"+
                    "<div style='width: 29%'><button class='btn btn-danger btn-from-stock w-100 px-0'>FROM STOCK</button></div>" +
                        "<select type='search' class='edtProductName form-control' style='width: 70%'></select>"+
                        "</div>"+
                        "<div class='colQty form-group'><input type='text' class='form-control edtQuantity w-100'/></div>"+
                        "<div class='colProcess form-group'><select type='search' class='edtProcessName form-control w-100' disabled style='background-color: #ddd'></select></div>"+
                        "<div class='colDuration form-group'></div>"+
                        "<div class='colNote form-group'><input type='text' class='edtProcessNote form-control w-100' disabled style='background-color: #ddd'/></div>"+
                        "<div class='colAttachment form-group'><a class='btn btn-primary btnAddAttachment' role='button' data-toggle='modal' href='#myModalAttachment-MemoOnly' id='btn_Attachment' name='btn_Attachment'><i class='fa fa-paperclip' style='padding-right: 8px;'></i>Add Attachments</a><div class='d-none attachedFiles'></div></div>" +
                        "<div class='colDelete d-flex align-items-center justify-content-center'><button class='btn btn-danger btn-rounded btn-sm my-0 btn-remove-raw'><i class='fa fa-remove'></i></button></div>" +
                        "</div>"+
                        "</div>";
                }else {
                    html += "<div class='product-content'><div class='d-flex productRow'><div class='d-flex form-group colProduct'>" +
                    "<div style='width: 29%'><button class='btn btn-success btn-product-build w-100 px-0'>Build</button></div>" +
                        "<select type='search' class='edtProductName form-control' style='width: 70%'></select>"+
                        "</div>"+
                        "<div class='colQty form-group'><input type='text' class='form-control edtQuantity w-100'/></div>"+
                        "<div class='colProcess form-group'><select type='search' class='edtProcessName form-control w-100' disabled style='background-color: #ddd'></select></div>"+
                        "<div class='colDuration form-group'></div>"+
                        "<div class='colNote form-group'><input type='text' class='edtProcessNote form-control w-100' disabled style='background-color: #ddd'/></div>"+
                        "<div class='colAttachment form-group'><a class='btn btn-primary btnAddAttachment' role='button' data-toggle='modal' href='#myModalAttachment-MemoOnly' id='btn_Attachment' name='btn_Attachment'><i class='fa fa-paperclip' style='padding-right: 8px;'></i>Add Attachments</a><div class='d-none attachedFiles'></div></div>" +
                        "<div class='colDelete d-flex align-items-center justify-content-center'><button class='btn btn-danger btn-rounded btn-sm my-0 btn-remove-raw'><i class='fa fa-remove'></i></button></div>" +
                        "</div>";

                    for(let j = 0; j< subs[i].subs.length; j++) {
                        let addRowHtml = "<div class='d-flex productRow'>" +
                        "<div class= 'd-flex colProduct form-group'>" +
                        "<div style='width: 60%'></div>" +
                        "<input class='edtProductName edtRaw form-control es-input' autocomplete='false' type='search' style='width: 70%' value ='"+subs[i].subs[j].productName+"'/>" +
                        "</div>" +
                        "<div class='colQty form-group'>" +
                        "<input type='text' class='edtQuantity w-100 form-control' value='" + subs[i].subs[j].qty + "'/>" +
                        "</div>" +
                        "<div class='colProcess form-group'>"+
                        "<input type='search' autocomplete='off' class='edtProcessName form-control w-100 es-input' autocomplete = 'false' value='"+subs[i].subs[j].process  +"'/>"+
                        "</div>" +
                        "<div class='colDuration form-group'></div>" + 
                        "<div class='colNote form-group'></div>" +
                        "<div class='colAttachment'></div>" +
                        "<div class='d-flex colDelete align-items-center justify-content-center'><button class='btn btn-danger btn-rounded btn-sm my-0 btn-remove-raw'><i class='fa fa-remove'></i></button></div>" +
                        "</div>";
                    
                        html += addRowHtml;
                    }

                    html += "</div>";
                }

                
            } else {
                html += "<div class='product-content'><div class='d-flex productRow'><div class='d-flex colProduct'><div style='width: 29%'></div>" +
            "<select type='search' class='edtProductName form-control' style='width: 70%'></select>"+
            "</div>"+
            "<div class='colQty form-group'><input type='text' class='form-control edtQuantity w-100'/></div>"+
            "<div class='colProcess form-group'></div><div class='colDuration'></div><div class='colNote form-group'></div><div class='colAttachment form-group'></div><div class='colDelete d-flex align-items-center justify-content-center'><button class='btn btn-danger btn-rounded btn-sm my-0 btn-remove-raw'><i class='fa fa-remove'></i></button></div>"+
            "</div>"+
            "</div>";
            }
            
            
            
            let productContents = $('.product-content');

            
            $(html).insertAfter($(productContents[productContents.length-2]));
            let pContents = $('.product-content');
            let productContent = $(pContents[pContents.length-2])
            $(productContent).find('.edtProductName').editableSelect();
            $(productContent).find('.edtProcessName').editableSelect();
            let nameElements = $(productContent).find('.edtProductName');
            $(nameElements[0]).val(subs[i].productName || '');
            let quantityElements = $(productContent).find('.edtQuantity')
            $(quantityElements[0]).val(subs[i].qty || 1)
            let processElements = $(productContent).find('.edtProcessName')
            let bomProcessIndex = bomProducts.findIndex(product => {
                return product.Caption == subs[i].productName;
            })
            if(bomProcessIndex > -1) {
                $(processElements[0]).val(subs[i].process || bomProducts[bomProcessIndex].Info || '')
                $(productContent).find('.edtProcessNote').val(subs[i].processNote || bomProducts[bomProcessIndex].CustomInputClass || '')
            } else {
                    productService.getOneBOMProductByName(subs[i].productName).then(function(data){
                    if(data.tproctree.length == 0) {
                        $(processElements[0]).val(subs[i].process|| '')
                        $(productContent).find('.edtProcessNote').val(subs[i].processNote || '')
                    } else {
                        $(processElements[0]).val(subs[i].process || data.tproctree[0].Info || '');
                        $(productContent).find('.edtProcessNote').val(subs[i].processNote || data.tproctree[0].CustomInputClass || '')
                    }
                })
            }
            // $(productContent).find('.edtProcessName').val(subs[i].process || "")
            let modalHtml = "<div class='modal fade' role='dialog' tabindex='-1' id='myModalAttachment-"+subs[i].productName.replace(/[|&;$%@"<>()+," "]/g, '')+"'>" + templateObject.attachmentModalHtml.get();
            
            if(subs[i].attachments&&subs[i].attachments.length > 0) {
                // JSON.parse($(products[0]).find('.attachedFiles').text() != ''?$(products[0]).find('.attachedFiles').text(): '[]').uploadedFilesArray || [];
                let temp = JSON.stringify({totalAttachments: subs[i].attachments.length, uploadedFilesArray: subs[i].attachments});
                $(productContent).find('.attachedFiles').text(temp)
            }
            
            let modalElement = $(productContent).closest('.modal');
            let topParent = modalElement.parent();
            topParent.append(modalHtml);
                            
        }
                        
        
        $('#BOMSetupModal').modal('toggle')
    },
    'click #BOMSetupModal .btn-cancel-bom': function(event) {
        playCancelAudio();
        setTimeout(function(){
        
            $('#BOMSetupModal').modal('toggle');
        }, delayTimeAfterSound);
    },
       

})
