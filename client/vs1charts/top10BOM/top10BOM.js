import { VS1ChartService } from "../vs1charts-service";
import "jQuery.print/jQuery.print.js";
import { UtilityService } from "../../utility-service";
import { ReactiveVar } from "meteor/reactive-var";
import { SalesBoardService } from "../../js/sales-service";
import { CoreService } from "../../js/core-service";
import { ProductService } from "../../product/product-service";


import {Session} from 'meteor/session';
import { Template } from 'meteor/templating';
import './top10BOM.html';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';

let _ = require("lodash");
let vs1chartService = new VS1ChartService();
let utilityService = new UtilityService();

import { SideBarService } from '../../js/sidebar-service';
import '../../lib/global/indexdbstorage.js';
Template.top10BOM.onCreated(function () {
  const templateObject = Template.instance();

  templateObject.topTenData = new ReactiveVar([]);
});

Template.top10BOM.onRendered(function () {
  const templateObject = Template.instance();
  let topTenData1 = [];
  let topData = this;
  function chartClickEvent() {
   // FlowRouter.go("/customerdetailsreport?daterange=ignore");
  }
  getInvSales(function (data) {
      
      topTenData = _.take(data, 10);
      let productList = topTenData;
           
       // Chart.js
      var ctx = document.getElementById("top10bom").getContext("2d");
      var myChart = new Chart(ctx, {
        type: "horizontalBar",
        data: {
          labels: productList.map((product) => product.bomName),
          datasets: [
            {
              label: "Amount #" + this.name,
              data: productList.map((product) => product.bomQuantity),
              backgroundColor: "#f6c23e" ,
              borderColor: "rgba(78,115,223,0)",              
              borderWidth: 1,
            },
          ],
        },
        options: {
          onClick: chartClickEvent,
          maintainAspectRatio: false,
          responsive: true,
          tooltips: {
            callbacks: {
              label: function (tooltipItem, data) {
                return (
                 
                    tooltipItem.xLabel
                   || 0.0
                );
                
              },
            },
          },
          legend: {
            display: false,
          },
          title: {},
          scales: {
            xAxes: [
              {
                gridLines: {
                  color: "rgb(234, 236, 244)",
                  zeroLineColor: "rgb(234, 236, 244)",
                  drawBorder: false,
                  drawTicks: false,
                  borderDash: ["2"],
                  zeroLineBorderDash: ["2"],
                  drawOnChartArea: false,
                },
                ticks: {
                  fontColor: "#858796",
                  beginAtZero: true,
                  padding: 20,
                },
              },
            ],
            yAxes: [
              {
                gridLines: {
                  color: "rgb(234, 236, 244)",
                  zeroLineColor: "rgb(234, 236, 244)",
                  drawBorder: false,
                  drawTicks: false,
                  borderDash: ["2"],
                  zeroLineBorderDash: ["2"],
                },
                ticks: {
                  fontColor: "#858796",
                  beginAtZero: true,
                  padding: 20,
                },
              },
            ],
          },
        },
      });

  });

  function getInvSales(callback) {
    return new Promise((res, rej) => {
      var salesBoardService = new SalesBoardService();
      const productService = new ProductService();
      let bom_data_list = [];

      getVS1Data('TProcTree').then(function(dataObject) {
        if(dataObject.length == 0) {
          productService.getAllBOMProducts(initialBaseDataLoad, 0).then(function(data){
            let data_proc = data.tproctree;
            let bom_data ;
            // for(let i = 0; i < data_proc.length; i++) {
            //   bom_data = { bomName : data_proc[i].Caption, bomQuantity: data_proc[i].QtyVariation };
            //   bom_data_list.push(bom_data);
            // }
            bom_data_list.push({bomName: "Wagon" , bomQuantity: 10});
            bom_data_list.push({bomName: "Shoes" , bomQuantity: 9});
            bom_data_list.push({bomName: "Finished Product" , bomQuantity: 8});
            bom_data_list.push({bomName: "TSL-Block" , bomQuantity: 7});
            bom_data_list.push({bomName: "Wagon" , bomQuantity: 6});
            bom_data_list.push({bomName: "New BOM product" , bomQuantity: 5});
            bom_data_list.push({bomName: "Shoes BOM " , bomQuantity: 4});
            bom_data_list.push({bomName: "ASUS Screen " , bomQuantity: 3});
            bom_data_list.push({bomName: "Time Cost Exp" , bomQuantity: 2});
            bom_data_list.push({bomName: "Wheel" , bomQuantity: 1});
      
            let sorted_bom_data_list;
            sorted_bom_data_list = bom_data_list.sort(function (a, b) {
                          return b.bomQuantity - a.bomQuantity;
                    });

            if (callback) {
              callback(sorted_bom_data_list);
            }

            addVS1Data('TProcTree', JSON.stringify(data)).then(function(){})
          })
        }else {
          let data = JSON.parse(dataObject[0].data);
          let data_proc = data.tproctree;
          let bom_data ;
          // for(let i = 0; i < data_proc.length; i++) {
          //   bom_data = { bomName : data_proc[i].Caption, bomQuantity: data_proc[i].QtyVariation };
          //   bom_data_list.push(bom_data);
          // }
          bom_data_list.push({bomName: "Wagon" , bomQuantity: 10});
          bom_data_list.push({bomName: "Shoes" , bomQuantity: 9});
          bom_data_list.push({bomName: "Finished Product" , bomQuantity: 8});
          bom_data_list.push({bomName: "TSL-Block" , bomQuantity: 7});
          bom_data_list.push({bomName: "Wagon" , bomQuantity: 6});
          bom_data_list.push({bomName: "New BOM product" , bomQuantity: 5});
          bom_data_list.push({bomName: "Shoes BOM " , bomQuantity: 4});
          bom_data_list.push({bomName: "ASUS Screen " , bomQuantity: 3});
          bom_data_list.push({bomName: "Time Cost Exp" , bomQuantity: 2});
          bom_data_list.push({bomName: "Wheel" , bomQuantity: 1});
    
          let sorted_bom_data_list;
          sorted_bom_data_list = bom_data_list.sort(function (a, b) {
                        return b.bomQuantity - a.bomQuantity;
                   });
          if (callback) {
            callback(sorted_bom_data_list);
          }
        }
      }).catch(function(e){
        productService.getAllBOMProducts(initialBaseDataLoad, 0).then(function(data){
          addVS1Data('TProcTree', JSON.stringify(data)).then(function(){})
        })
      })

      // getVS1Data("TInvoiceList").then(function (dataObject) {
      //     if (dataObject.length == 0) {
      //       salesBoardService.getInvSaleByCustomer().then((data) => {
      //         // templateObject.getAllData(data);
      //         // This will return not deleted data only
      //         let filterData = _.filter(data.tinvoiceex, function (data) {
      //           return !data.deleted;
      //         });
      //         // This will filter and return cutomer name
      //         let filterDueDateData = _.filter(filterData, function (data) {
      //           return data.CustomerName;
      //         });

      //         let groupData = _.omit(
      //           _.groupBy(filterDueDateData, "CustomerName"),
      //           [""]
      //         );
      //         let totalAmountCalculation = _.map(
      //           groupData,
      //           function (value, key) {
      //             let totalPayment = 0;
      //             let overDuePayment = 0;
      //             for (let i = 0; i < value.length; i++) {
      //               totalPayment += value[i].TotalAmountInc;
      //             }
      //             let userObject = {};
      //             userObject.name = key;
      //             userObject.totalbalance = totalPayment;
      //             return userObject;
      //           }
      //         );

      //         let sortedArray = [];
      //         sortedArray = totalAmountCalculation.sort(function (a, b) {
      //           return b.totalbalance - a.totalbalance;
      //         });
      //         if (callback) {
      //           callback(sortedArray);
      //         }
      //       });
      //     } else {
      //       let data = JSON.parse(dataObject[0].data);
      //       let useData = data.tinvoicelist;
      //       let invoiceItemObj = {};
      //       let invoiceItems = [];
      //       for (let j in useData) {
      //         invoiceItemObj = {
      //           deleted: useData[j].Deleted || false,
      //           CustomerName: useData[j].CustomerName || "",
      //           TotalAmountInc: useData[j].TotalAmountInc || 0,
      //         };
      //         // totaldeptquantity += data.tproductvs1class[j].InStockQty;
      //         invoiceItems.push(invoiceItemObj);
      //       }
      //       let filterData = _.filter(invoiceItems, function (data) {
      //         return !data.deleted;
      //       });
      //       let filterDueDateData = _.filter(filterData, function (data) {
      //         return data.CustomerName;
      //       });

      //       let groupData = _.omit(
      //         _.groupBy(filterDueDateData, "CustomerName"),
      //         [""]
      //       );
      //       let totalAmountCalculation = _.map(
      //         groupData,
      //         function (value, key) {
      //           let totalPayment = 0;
      //           let overDuePayment = 0;
      //           for (let i = 0; i < value.length; i++) {
      //             totalPayment += value[i].TotalAmountInc;
      //           }
      //           let userObject = {};
      //           userObject.name = key;
      //           userObject.totalbalance = totalPayment;
      //           return userObject;
      //         }
      //       );

      //       let sortedArray = [];
      //       sortedArray = totalAmountCalculation.sort(function (a, b) {
      //         return b.totalbalance - a.totalbalance;
      //       });
      //       if (callback) {
      //         callback(sortedArray);
      //       }
      //     }
      //   }).catch(function (err) {
      //     salesBoardService.getInvSaleByCustomer().then((data) => {
      //       // templateObject.getAllData(data);
      //       let filterData = _.filter(data.tinvoiceex, function (data) {
      //         return !data.deleted;
      //       });
      //       let filterDueDateData = _.filter(filterData, function (data) {
      //         return data.CustomerName;
      //       });

      //       let groupData = _.omit(
      //         _.groupBy(filterDueDateData, "CustomerName"),
      //         [""]
      //       );
      //       let totalAmountCalculation = _.map(
      //         groupData,
      //         function (value, key) {
      //           let totalPayment = 0;
      //           let overDuePayment = 0;
      //           for (let i = 0; i < value.length; i++) {
      //             totalPayment += value[i].TotalAmountInc;
      //           }
      //           let userObject = {};
      //           userObject.name = key;
      //           userObject.totalbalance = totalPayment;
      //           return userObject;
      //         }
      //       );

      //       let sortedArray = [];
      //       sortedArray = totalAmountCalculation.sort(function (a, b) {
      //         return b.totalbalance - a.totalbalance;
      //       });
      //       if (callback) {
      //         callback(sortedArray);
      //       }
      //     });
      //   });
    });
  }
});

Template.top10BOM.events({});

Template.top10BOM.helpers({
  topTenData: () => {
    return Template.instance().topTenData.get();
  },
});
