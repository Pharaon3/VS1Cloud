import { VS1ChartService } from "../vs1charts-service";
import "jQuery.print/jQuery.print.js";
import { UtilityService } from "../../utility-service";
import { ReactiveVar } from "meteor/reactive-var";
import { SalesBoardService } from "../../js/sales-service";
import { CoreService } from "../../js/core-service";

import {Session} from 'meteor/session';
import { Template } from 'meteor/templating';
import './productionProductStatus.html';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';

let _ = require("lodash");
let vs1chartService = new VS1ChartService();
let utilityService = new UtilityService();

import { SideBarService } from '../../js/sidebar-service';
import '../../lib/global/indexdbstorage.js';
Template.productionProductStatus.onCreated(function () {
  const templateObject = Template.instance();

  templateObject.topTenData = new ReactiveVar([]);
});

Template.productionProductStatus.onRendered(function () {
  const templateObject = Template.instance();

  function chartClickEvent() {
    FlowRouter.go("/customerdetailsreport?daterange=ignore");
  }

  getProductStatus(function (data) {

      tenData = _.take(data, 10);
     
      let total_quantity_list = [];
      let stock_quantity_list = [];
      let order_quantity_list = [];
      
      tenData.map(function(item) {
        let total_quantity = {productName: item.productName, quantity : item.totalQuantity-item.stockTotalQuantity-item.orderTotalQuantity} ;
        total_quantity_list.push(total_quantity);
      } ) ;
      
      tenData.map(function(item) {
        let stock_quantity = {productName: item.productName, quantity : item.stockTotalQuantity} ;
        stock_quantity_list.push(stock_quantity);
      } ) ;

      tenData.map(function(item) {
        let order_quantity = {productName: item.productName, quantity : item.orderTotalQuantity} ;
        order_quantity_list.push(order_quantity);
      } ) ;          
     
      // Chart.js
      var ctx = document.getElementById("productionproductstatus").getContext("2d");
      var myChart = new Chart(ctx, {
        type: "horizontalBar",
        data: {
          labels: total_quantity_list.map((product) => product.productName),
          datasets: [         
            {
              label: "Amount #" + this.name,
              data: stock_quantity_list.map((product) => product.quantity),
              backgroundColor: "#33c942",   // Green Color
              borderColor: "rgba(78,115,223,0)",                             
              borderWidth: 1,
            },

            {
              label: "Amount #" + this.name,
              data: order_quantity_list.map((product) => product.quantity),
              backgroundColor: "#00a3d3",  // Blue Color   
              borderColor: "rgba(78,115,223,0)",                             
              borderWidth: 1,
            },

            {
              label: "Amount #" + this.name,
              data: total_quantity_list.map((product) => product.quantity),
              backgroundColor: "#ef1616", // Red Color   
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
                stacked: true
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
                stacked:true,
              },
            ],
          },
        },
      });

  });

  function getProductStatus(callback) {
    return new Promise((res, rej) => {
      let chart_data = [{productName : "Hand Sanitizer" , totalQuantity: 100, stockTotalQuantity: 50, orderTotalQuantity : 30},
      {productName : "Lot Product" , totalQuantity: 80, stockTotalQuantity: 55, orderTotalQuantity : 20},
      {productName : "ASUS Screen" , totalQuantity: 70, stockTotalQuantity: 20, orderTotalQuantity : 15},
      {productName : "Shoes" , totalQuantity: 60, stockTotalQuantity: 30, orderTotalQuantity : 20},
      {productName : "Bicycle" , totalQuantity: 50, stockTotalQuantity: 25, orderTotalQuantity : 10},
    ];

    callback(chart_data);

    //   var salesBoardService = new SalesBoardService();
    //   getVS1Data("TInvoiceList").then(function (dataObject) {
    //       if (dataObject.length == 0) {
    //         salesBoardService.getInvSaleByCustomer().then((data) => {
    //           // templateObject.getAllData(data);
    //           // This will return not deleted data only
    //           let filterData = _.filter(data.tinvoiceex, function (data) {
    //             return !data.deleted;
    //           });
    //           // This will filter and return cutomer name
    //           let filterDueDateData = _.filter(filterData, function (data) {
    //             return data.CustomerName;
    //           });

    //           let groupData = _.omit(
    //             _.groupBy(filterDueDateData, "CustomerName"),
    //             [""]
    //           );
    //           let totalAmountCalculation = _.map(
    //             groupData,
    //             function (value, key) {
    //               let totalPayment = 0;
    //               let overDuePayment = 0;
    //               for (let i = 0; i < value.length; i++) {
    //                 totalPayment += value[i].TotalAmountInc;
    //               }
    //               let userObject = {};
    //               userObject.name = key;
    //               userObject.totalbalance = totalPayment;
    //               return userObject;
    //             }
    //           );

    //           let sortedArray = [];
    //           sortedArray = totalAmountCalculation.sort(function (a, b) {
    //             return b.totalbalance - a.totalbalance;
    //           });
    //           if (callback) {
    //             callback(sortedArray);
    //           }
    //         });
    //       } else {
    //         let data = JSON.parse(dataObject[0].data);
    //         let useData = data.tinvoicelist;

    //         let invoiceItemObj = {};
    //         let invoiceItems = [];
    //         for (let j in useData) {
    //           invoiceItemObj = {
    //             deleted: useData[j].Deleted || false,
    //             CustomerName: useData[j].CustomerName || "",
    //             TotalAmountInc: useData[j].TotalAmountInc || 0,
    //           };
    //           // totaldeptquantity += data.tproductvs1class[j].InStockQty;
    //           invoiceItems.push(invoiceItemObj);
    //         }
            
    //         let filterData = _.filter(invoiceItems, function (data) {
    //           return !data.deleted;
    //         });
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
    //       }
    //     }).catch(function (err) {
    //       salesBoardService.getInvSaleByCustomer().then((data) => {
    //         // templateObject.getAllData(data);
    //         let filterData = _.filter(data.tinvoiceex, function (data) {
    //           return !data.deleted;
    //         });
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
    //     });
    });
  }
});

Template.productionProductStatus.events({});

Template.productionProductStatus.helpers({
  topTenData: () => {
    return Template.instance().topTenData.get();
  },
});
