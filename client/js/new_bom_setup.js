import { ReactiveVar } from "meteor/reactive-var";
import {ProductService} from '../product/product-service';
import { SideBarService } from "./sidebar-service";
import 'jquery-editable-select';
import { Template } from 'meteor/templating';
import '../manufacture/bom_setup.html';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';

//product name, process name, product sales description, qty in stock, subs, 
Template.bom_setup.onCreated(function() {
    const templateObject = Template.instance();
    templateObject.bomProducts = new ReactiveVar([]);
    templateObject.initialRecord = new ReactiveVar();
    templateObject.selectedProcessField = new ReactiveVar();
    templateObject.selectedProductField = new ReactiveVar();
    templateObject.isMobileDevices = new ReactiveVar(false);
    templateObject.showSubButton = new ReactiveVar(true)
})
let productService =  new ProductService();
let sideBarService = new SideBarService();
Template.bom_setup.onRendered(function() {
    const templateObject = Template.instance();
    $('.fullScreenSpin').css('display', 'inline-block');
    // let temp = localStorage.getItem('TProcTree');
    getVS1Data('TProcTree').then(function(dataObject){
        if(dataObject.length == 0) {
            productService.getAllBOMProducts(initialDataLoad, 0).then(function(dataObject) {
                let data = dataObject.tproctree;
                templateObject.bomProducts.set(data);
                
                $('.fullScreenSpin').css('display', 'none');
            })
        }else {
            let data = JSON.parse(dataObject[0].data);
            let useData = data.tproctree;
            templateObject.bomProducts.set(useData);
            $('.fullScreenSpin').css('display', 'none');
        }
    }).catch(function(e) {
        productService.getAllBOMProducts(initialDataLoad, 0).then(function(dataObject) {
            let data = dataObject.tproctree;
            templateObject.bomProducts.set(data);
            $('.fullScreenSpin').css('display', 'none');
        }).catch(function(e) {
            $('.fullScreenSpin').css('display', 'none');
            templateObject.bomProducts.set([])
        })
    })
    
})


Template.bom_setup.events({
    
    'click .btnSave': function(event) {
        event.preventDefault();
        event.stopPropagation();
        const tempObject = Template.instance();
        playSaveAudio();
        setTimeout(function(){
        let mainProductName = $('#edtMainProductName').val();
        let mainProcessName = $('#edtProcess').val();
        let bomProducts = tempObject.bomProducts.get();
        if(mainProductName == '') {
            swal('Please provide the product name !', '', 'warning');
            $('.fullScreenSpin').css('display', 'none');
            return false;
        }
        if(mainProcessName == '') {
            swal('Please provide the process !', '', 'warning');
            $('.fullScreenSpin').css('display', 'none');
            return false;
        }

        if($('.edtDuration').val() == '' ){
            swal('Please set duration for process !', '', 'warning');
            $('.fullScreenSpin').css('display', 'none');
            return false;
        }

        let products = $('.product-content');
        if(products.length < 3) {
            swal('Must have sub builds or raws !', '', 'warning');
            $('.fullScreenSpin').css('display', 'none');
            return false;
        }
        // let objDetails  = {
        //     productName: mainProductName,
        //     qty: 1,
        //     process: mainProcessName,
        //     processNote: $(products[0]).find('.edtProcessNote').val() || '',
        //     attachments: JSON.parse($(products[0]).find('.attachedFiles').text() != ''?$(products[0]).find('.attachedFiles').text(): '[]').uploadedFilesArray || [],
        //     subs: [],
        //     productDescription:  '',
        //     totalQtyInStock:  0,
        //     duration: parseFloat($('.edtDuration').val())
        // }
        
        let attachment_main =JSON.parse($(products[0]).find('.attachedFiles').text() != ''?$(products[0]).find('.attachedFiles').text(): '[]').uploadedFilesArray || [];

        let main_attachmentName = [];
        let main_attach_json ; 

        for(let i =0 ; i < attachment_main.length ; i++) {
            main_attach_json ={ attachmentName:  attachment_main[i].fields.AttachmentName};
            main_attachmentName.push(main_attach_json);
        }
         


        let  objDetails= {
            Caption: mainProductName,
            Info: mainProcessName,
            CustomInputClass: $(products[0]).find('.edtProcessNote').val() || '',
            Description: $(products[0]).find('.edtProcessNote').val() || '',
            Details: '',
            TotalQtyOriginal: 1,
            QtyVariation: parseFloat($('.edtDuration').val()),
            ProcStepItemRef: 'vs1BOM',
            Value: JSON.stringify(main_attachmentName),
        }

        let subBOMs= [];

        for(let i = 1; i< products.length - 1; i ++) {
            let productRows = products[i].querySelectorAll('.productRow')
            let objectDetail;
                let _name = $(productRows[0]).find('.edtProductName').val();
                let _qty = $(productRows[0]).find('.edtQuantity').val();
                let _process = $(productRows[0]).find('.edtProcessName').val();
                let _note = $(productRows[0]).find('.edtProcessNote').val();
                let _attachments = JSON.parse($(productRows[0]).find('.attachedFiles').text()!= ''?$(productRows[0]).find('.attachedFiles').text(): '[]').uploadedFilesArray || [];
                let _duration = $(productRows[0]).find('.edtDuration').val();
                objectDetail = {
                    productName: _name,
                    qty: _qty,
                    process: _process,
                    processNote: _note,
                    attachments: _attachments,
                    duration:_duration,
                    subs:[],
                }
                if(productRows.length > 1) {
                    for(let j = 1; j<productRows.length; j++) {
                        let _productName = $(productRows[j]).find('.edtProductName').val();
                        let _productQty = $(productRows[j]).find('.edtQuantity').val();
                        let _rawProcess = $(productRows[j]).find('.edtProcessName').val();
                        let _duration = $(productRows[j]).find('.edtDuration').val();
                        if(_productName != '' && _productQty != '' ) {
                            objectDetail.subs.push ({
                                productName: _productName,
                                qty: _productQty,
                                process: _rawProcess,
                                duration: _duration,

                            })
                        }
                    }
                } else {
                    let bomProductIndex = bomProducts.findIndex(product => {
                        return product.productName == _name;
                    })
                    if(bomProductIndex > -1) {
                        let subProduct = bomProducts[bomProductIndex];
                        if(subProduct && subProduct.fields.subs && subProduct.fields.subs.length> 0) {
                            for(let j=0; j< subProduct.fields.subs.length; j++) {
                                let sub = subProduct.fields.subs[j];
                                objectDetail.subs.push({
                                    productName: sub.productName,
                                    qty: sub.qty,
                                    process: sub.process,
                                    duration: sub.duration,
                                })
                            }
                        }
                    }
                }
            // }
            subBOMs.push(objectDetail);
        }

        objDetails.Details = JSON.stringify(subBOMs) || '';
     //   objDetails.Value = JSON.stringify(attachment_main) || '' ;

        // tempObject.bomStructure.set(objDetails);
        // let object = {
        //     type: 'TProcTree',
        //     fields: objDetails               
        // }
        saveBOMStructure(objDetails)

        // getVS1Data('TProductVS1').then(function(dataObject) {
        //     if(dataObject.length == 0) {
        //         productService.getOneProductdatavs1byname($('#edtMainProductName').val()).then(function(data){
        //             objDetails.Description = data.tproduct[0].fields.SalesDescription;
        //             objDetails.TotalQtyOriginal = data.tproduct[0].fields.TotalQtyInStock;
        //             saveBOMStructure(objDetails)
        //             // productService.saveProduct({
        //             //     type: 'TProduct',
        //             //     fields: {
        //             //         ...data.tproduct[0].fields,
        //             //         IsManufactured: true
        //             //     }
        //             // }).then(function(){
        //             //     sideBarService.getNewProductListVS1(initialBaseDataLoad,0).then(function (data) {
        //             //         addVS1Data('TProductVS1',JSON.stringify(data)).then(()=>{
        //             //             saveBOMStructure(objDetails)
        //             //         });
        //             //     })
        //             // })
                    
        //         })
        //     }else {
        //         let data = JSON.parse(dataObject[0].data)
        //         let useData = data.tproductvs1;
        //         let added = false
        //         for(let i = 0; i< useData.length; i++) {
        //             if(useData[i].fields.ProductName == $('#edtMainProductName').val() ) {
        //                 added = true
        //                 objDetails.Description = useData[i].fields.SalesDescription;
        //                 objDetails.TotalQtyOriginal = useData[i].fields.TotalQtyInStock;
        //                 saveBOMStructure(objDetails)
        //                 // productService.saveProductVS1({
        //                 //     type: 'TProductVS1',
        //                 //     fields: {
        //                 //         // ...useData[i].fields,
        //                 //         ID: useData[i].fields.ID,
        //                 //         IsManufactured: true
        //                 //     }
        //                 // }).then(function(){
        //                 //     sideBarService.getNewProductListVS1(initialBaseDataLoad,0).then(function (data) {
        //                 //         addVS1Data('TProductVS1',JSON.stringify(data)).then(()=>{
        //                 //             saveBOMStructure(objDetails)
        //                 //         }).catch(function(err){});
        //                 //     }).catch(function(e){
        //                 //     })
        //                 // }).catch(function(err){
        //                 // })
        //             }
        //         }
        //         if(!added) {
        //             productService.getOneProductdatavs1byname($('#edtMainProductName').val()).then(function(data){
        //                 objDetails.Description = data.tproduct[0].fields.SalesDescription;
        //                 objDetails.TotalQtyOriginal = data.tproduct[0].fields.TotalQtyInStock;
        //                 saveBOMStructure(objDetails)
        //             })
        //         }
        //     }
        // }).catch(function(e) {
        //     productService.getOneProductdatavs1byname($('#edtMainProductName').val()).then(function(data){
        //         objDetails.Description = data.tproduct[0].fields.SalesDescription;
        //         objDetails.TotalQtyOriginal = data.tproduct[0].fields.TotalQtyInStock;
        //         saveBOMStructure(objDetails)
        //         // productService.saveProduct({
        //         //     type: 'TProduct',
        //         //     fields: {
        //         //         ...data.tproduct[0].fields,
        //         //         IsManufactured: true
        //         //     }
        //         // }).then(function(){
        //         //     sideBarService.getNewProductListVS1(initialBaseDataLoad,0).then(function (data) {
        //         //         addVS1Data('TProductVS1',JSON.stringify(data)).then(()=>{
        //         //             saveBOMStructure(objDetails)
        //         //         }).catch(function(err) {
        //         //             $('.fullScreenSpin').css('display', 'none');
        //         //             swal("Something went wrong!", "", "error");
        //         //         });
        //         //     }).catch(function(err) {
        //         //         $('.fullScreenSpin').css('display', 'none');
        //         //         swal("Something went wrong!", "", "error");
        //         //     })
        //         // }).catch(function(err) {
        //         //     $('.fullScreenSpin').css('display', 'none');
        //         //     swal("Something went wrong!", "", "error");
        //         // })
                
        //     }).catch(function(err) {
        //         $('.fullScreenSpin').css('display', 'none');
        //         swal("Something went wrong!", "", "error");
        //     })
        // })


        function saveBOMStructure(objDetails) {
            // let bomProducts = localStorage.getItem('TProcTree')?JSON.parse(localStorage.getItem('TProcTree')):[];
    
            // let existIndex = bomProducts.findIndex(product =>{
            //     return product.fields.productName == objDetails.productName;
            // })
    
            // let bomObject = {
            //     type: 'TProcTree',
            //     fields: objDetails
            // }
            // if(existIndex > -1) {
            //     bomProducts.splice(existIndex, 1, bomObject)
            // }else {
            //     bomProducts.push(bomObject);
            // }
    
            // localStorage.setItem('TProcTree', JSON.stringify(bomProducts));
            // $('.fullScreenSpin').css('display', 'none')
            // swal('BOM Settings Successfully Saved', '', 'success');

            // if (localStorage.getItem("enteredURL") != null) {
            //     FlowRouter.go(localStorage.getItem("enteredURL"));
            //     localStorage.removeItem("enteredURL");
            //     return;
            // }

            let bomProducts = tempObject.bomProducts.get();
            let existIndex = bomProducts.findIndex(product =>{
                 return product.Caption == objDetails.Caption;
            })

            // let bomObject = {
            //     type: 'TProcTree',
            //     fields: objDetails
            // }

            
            if(existIndex > -1) {
                bomProducts.splice(existIndex, 1, objDetails)
            }else {
                bomProducts.push(objDetails);
            }

               
            // addVS1Data('TProcTree', JSON.stringify(bomProducts)).then(function(){
            //     swal("BOM Settings Successfully Saved", "", "success");
            // })

          
            if(FlowRouter.current().queryParams.id) {
                objDetails.ID = FlowRouter.current().queryParams.id;
            }
            productService.saveBOMProduct({
                type: "TProcTree",
                fields: objDetails
            }).then(function(){
                productService.getAllBOMProducts(initialDataLoad, 0).then(function(dataReturn){
                    addVS1Data('TProcTree', JSON.stringify(dataReturn)).then(function(){
                    })
                    //FlowRouter.go('/bomlist?success=true')
                });
            });
            swal("BOM Settings Successfully Saved", "", "success");
            $(".fullScreenSpin").css("display", "none");
            FlowRouter.go('/bomlist?success=true');
        }

        }, delayTimeAfterSound);
    },

    'click .btnBack': function(event) {
        event.preventDefault();
        event.stopPropagation();
        FlowRouter.go('/bomlist')
    },

    'click .btn-print-bom': function(event) {
        playPrintAudio();
        setTimeout(function(){
            document.title = 'Product BOM Setup';
            $("#bom-setup-card.card-body").print({
                // title   :  document.title +" | Product Sales Report | "+loggedCompany,
                // noPrintSelector : ".btnAddProduct",
                // noPrintSelector : ".btnAddSubProduct",
                // noPrintSelector : ".btn-remove-raw",
                noPrintSelector : ".no-print",
            });
        }, delayTimeAfterSound);
    },

    'click .btnRemove': async function(event) {
        event.preventDefault();
        event.stopPropagation();
             
            $('.fullScreenSpin').css('display', 'inline-block')

            let templateObject = Template.instance()
            if(FlowRouter.current().queryParams.id) {
                let id = FlowRouter.current().queryParams.id;
                let bomdata = templateObject.bomProducts.get();
                let existIndex = bomdata.findIndex((product) => {
                    return product.Id == id;
                });
                
                let fields = bomdata[existIndex];
                let objDetail = {
                    type: "TProcTree",
                    fields : {
                        ...fields,
                        ProcStepItemRef : "Deleted" 
                    }
                }

                productService.saveBOMProduct(objDetail).then(function () {
                    productService.getAllBOMProducts(initialDatatableLoad, 0).then(function (data) {
                    addVS1Data("TProcTree", JSON.stringify(data)).then(function () {});
                    $('.fullScreenSpin').css('display', 'none');
                    swal("The BOM is deleted", "", "error");
                    FlowRouter.go('/bomlist?success=true');
                    });
                });
                
                
            }
         
    },
})

Template.bom_setup.helpers({
    initialRecord: ()=>{
        return Template.instance().initialRecord.get()
    }
})