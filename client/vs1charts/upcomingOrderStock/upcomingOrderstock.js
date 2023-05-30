import { VS1ChartService } from "../vs1charts-service";
import "jQuery.print/jQuery.print.js";
import { UtilityService } from "../../utility-service";
import { ReactiveVar } from "meteor/reactive-var";
import './upcomingOrderstock.html';
import { Chart } from '../../../public/assets/js/chart.min';
import { SideBarService } from '../../js/sidebar-service';
import { SalesBoardService } from '../../js/sales-service.js';


let _ = require("lodash");
let vs1chartService = new VS1ChartService();
let utilityService = new UtilityService();
let sideBarService = new SideBarService();
let salesService = new SalesBoardService();



Template.upcomingorderstock.onCreated(() => {
  const templateObject = Template.instance();
  templateObject.records = new ReactiveVar([]);
  templateObject.dateAsAt = new ReactiveVar();
  templateObject.deptrecords = new ReactiveVar();

  templateObject.salesperc = new ReactiveVar();
  templateObject.expenseperc = new ReactiveVar();
  templateObject.salespercTotal = new ReactiveVar();
  templateObject.expensepercTotal = new ReactiveVar();
  templateObject.topTenData = new ReactiveVar([]);
});

Template.upcomingorderstock.onRendered(() => {
  const templateObject = Template.instance();
  // templateObject.autorun(function(){
  //   const currentData = Template.currentData();
  //   const context = currentData.updateChart;

  //   if(context.update) {
  //     templateObject.updateChart(context.dateFrom, context.dateTo);
  //   }
  // });

  function chartClickEvent(event, array) {
    if (array[0] != undefined) { 
      FlowRouter.go("/newprofitandloss?daterange=monthly");
    }
  }
  


  getOrderStockData(function (data) {
    let order_stock_list = data;

    var ctx = document
        .getElementById("upcomingorderstockchart")
        .getContext("2d");
      var myChart = new Chart.Chart(ctx, {
        type: "bar",
        data: {
          labels: order_stock_list.map((order_stock) => order_stock.week),
          datasets: [
            {
              label: "On Order",
              backgroundColor: "#33c942", //Green Color
              borderColor: "rgba(78,115,223,0)",
              data: order_stock_list.map((order_stock) => order_stock.orderData),
            },
            {
              label: "In Stock",
              backgroundColor: "#00a3d3", //Blue Color 
              data: order_stock_list.map((order_stock) => order_stock.stockData),
            },
            
          ],
        },
        options: {
          maintainAspectRatio: false,
          responsive: true,
          tooltips: {
            callbacks: {
              label: function (tooltipItem, data) {
                return (                 
                    Math.abs(tooltipItem.yLabel)
                   || 0.0
                );
              },
            },
          },
         
          legend: {
            display: true,
            position: "right",
            reverse: false,
          },
          onClick: chartClickEvent,
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

  function getOrderStockData(callback) {
    return new Promise((res, rej) => {
      // var salesBoardService = new SalesBoardService();
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 0);
      const diff = now - startOfYear;
      const oneWeek = 1000 * 60 * 60 * 24 * 7;
      const weekNumber = Math.floor(diff / oneWeek);

      let week_start = weekNumber - 7;

      let min = 0;
      let max = 100;
      let order_stock_data = [];          
          
      
      for(let i=0; i < 8 ; i ++) {
        let order_data_sale = Math.floor(Math.random() * (max - min + 1)) + min; ;
        let stock_data_sale = Math.floor(Math.random() * (max - min + 1)) + min; ;

        let order_data = {week : `${week_start + i} week` , 
                          orderData: order_data_sale,
                          stockData: stock_data_sale  };
        order_stock_data.push(order_data);            
      }
      callback(order_stock_data);
    });
  }
  
  templateObject.updateChart = function(dateFrom, dateTo) {

    $("#minHeight100 #earnings").attr(
      "href",
      `/newprofitandloss?dateFrom=${dateFrom}&dateTo=${dateTo}`
    );
    let data = JSON.parse(localStorage.getItem("VS1PNLPeriodReport_dash"));
    
    let month_1 = data[0].fields.DateDesc_1 || "";
    let month_2 = data[0].fields.DateDesc_2 || "";
    let month_3 = data[0].fields.DateDesc_3 || "";
    let month_4 = data[0].fields.DateDesc_4 || "";
    let month_5 = data[0].fields.DateDesc_5 || "";
    let month_6 = data[0].fields.DateDesc_6 || "";
    let month_7 = data[0].fields.DateDesc_7 || "";

    let month_1_profit = 0;
    let month_2_profit = 0;
    let month_3_profit = 0;
    let month_4_profit = 0;
    let month_5_profit = 0;
    let month_6_profit = 0;
    let month_7_profit = 0;

    let month_1_loss = 0;
    let month_2_loss = 0;
    let month_3_loss = 0;
    let month_4_loss = 0;
    let month_5_loss = 0;
    let month_6_loss = 0;
    let month_7_loss = 0;

    let month_1_loss_exp = 0;
    let month_2_loss_exp = 0;
    let month_3_loss_exp = 0;
    let month_4_loss_exp = 0;
    let month_5_loss_exp = 0;
    let month_6_loss_exp = 0;
    let month_7_loss_exp = 0;

    let total_month_1_loss = 0;
    let total_month_2_loss = 0;
    let total_month_3_loss = 0;
    let total_month_4_loss = 0;
    let total_month_5_loss = 0;
    let total_month_6_loss = 0;
    let total_month_7_loss = 0;

    let total_month_1_net = 0;
    let total_month_2_net = 0;
    let total_month_3_net = 0;
    let total_month_4_net = 0;
    let total_month_5_net = 0;
    let total_month_6_net = 0;
    let total_month_7_net = 0;

    setTimeout(function () {
      for (let l = 0; l < data.length; l++) {
        if (
          data[l].fields.AccountTypeDesc.replace(/\s/g, "") == "TotalExpenses"
        ) {
          month_1_loss_exp = data[l].fields.Amount_1 || 0;
          month_2_loss_exp = data[l].fields.Amount_2 || 0;
          month_3_loss_exp = data[l].fields.Amount_3 || 0;
          month_4_loss_exp = data[l].fields.Amount_4 || 0;
          month_5_loss_exp = data[l].fields.Amount_5 || 0;
          month_6_loss_exp = data[l].fields.Amount_6 || 0;
          month_7_loss_exp = data[l].fields.Amount_7 || 0;
        }

        if (data[l].fields.AccountTypeDesc.replace(/\s/g, "") == "TotalCOGS") {
          month_1_loss = data[l].fields.Amount_1 || 0;
          month_2_loss = data[l].fields.Amount_2 || 0;
          month_3_loss = data[l].fields.Amount_3 || 0;
          month_4_loss = data[l].fields.Amount_4 || 0;
          month_5_loss = data[l].fields.Amount_5 || 0;
          month_6_loss = data[l].fields.Amount_6 || 0;
          month_7_loss = data[l].fields.Amount_7 || 0;
        }

        if (data[l].fields.AccountTypeDesc.replace(/\s/g, "") == "TotalIncome") {
          month_1_profit = data[l].fields.Amount_1 || 0;
          month_2_profit = data[l].fields.Amount_2 || 0;
          month_3_profit = data[l].fields.Amount_3 || 0;
          month_4_profit = data[l].fields.Amount_4 || 0;
          month_5_profit = data[l].fields.Amount_5 || 0;
          month_6_profit = data[l].fields.Amount_6 || 0;
          month_7_profit = data[l].fields.Amount_7 || 0;
        }

        if (data[l].fields.AccountTypeDesc.replace(/\s/g, "") == "NetIncome") {
          total_month_1_net = data[l].fields.Amount_1 || 0;
          total_month_2_net = data[l].fields.Amount_2 || 0;
          total_month_3_net = data[l].fields.Amount_3 || 0;
          total_month_4_net = data[l].fields.Amount_4 || 0;
          total_month_5_net = data[l].fields.Amount_5 || 0;
          total_month_6_net = data[l].fields.Amount_6 || 0;
          total_month_7_net = data[l].fields.Amount_7 || 0;
        }
      }

      total_month_1_loss = Number(month_1_loss) + Number(month_1_loss_exp);
      total_month_2_loss = Number(month_2_loss) + Number(month_2_loss_exp);
      total_month_3_loss = Number(month_3_loss) + Number(month_3_loss_exp);
      total_month_4_loss = Number(month_4_loss) + Number(month_4_loss_exp);
      total_month_5_loss = Number(month_5_loss) + Number(month_5_loss_exp);
      total_month_6_loss = Number(month_6_loss) + Number(month_6_loss_exp);
      total_month_7_loss = Number(month_7_loss) + Number(month_7_loss_exp);

      let list_months = [
        month_1,
        month_2,
        month_3,
        month_4,
        month_5,
        month_6,
        month_7,
      ];

      let list_months_profit = [
        month_1_profit,
        month_2_profit,
        month_3_profit,
        month_4_profit,
        month_5_profit,
        month_6_profit,
        month_7_profit,
      ];

      let list_total_months_loss = [
        total_month_1_loss,
        total_month_2_loss,
        total_month_3_loss,
        total_month_4_loss,
        total_month_5_loss,
        total_month_6_loss,
        total_month_7_loss,
      ];

      let list_total_months_net = [
        total_month_1_net,
        total_month_2_net,
        total_month_3_net,
        total_month_4_net,
        total_month_5_net,
        total_month_6_net,
        total_month_7_net,
      ];

      startIdx = list_months.indexOf(moment(dateFrom).format('MMM YYYY'));
      toIdx = list_months.indexOf(moment(dateTo).format("MMM YYYY"));
      if(startIdx < 0) startIdx = 0;
      list_months = list_months.slice(startIdx, toIdx+1);
      list_months_profit = list_months_profit.slice(startIdx, toIdx+1);
      list_total_months_loss = list_total_months_loss.slice(startIdx, toIdx+1);
      list_total_months_net = list_total_months_net.slice(startIdx, toIdx+1);

      var ctx = document
        .getElementById("upcomingorderstockchart")
        .getContext("2d");
      var myChart = new Chart.Chart(ctx, {
        type: "bar",
        data: {
          labels: list_months,
          datasets: [
            {
              label: "Sales",
              backgroundColor: "#00a3d3",
              borderColor: "rgba(78,115,223,0)",
              data: list_months_profit,
            },
            {
              label: "Expenses",
              backgroundColor: "#ef1616",
              data: list_total_months_loss,
            },
            {
              label: "Net Income",
              backgroundColor: "#33c942",
              data: list_total_months_net,
            },
          ],
        },
        options: {
          maintainAspectRatio: false,
          responsive: true,
          tooltips: {
            callbacks: {
              label: function (tooltipItem, data) {
                return (
                  utilityService.modifynegativeCurrencyFormat(
                    Math.abs(tooltipItem.yLabel)
                  ) || 0.0
                );
              },
            },
          },
          // bezierCurve : true,
          // animation: {
          // onComplete: done
          // },
          legend: {
            display: true,
            position: "right",
            reverse: false,
          },
          onClick: chartClickEvent,
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
    }, 0);
  }
});

Template.upcomingorderstock.events({

});

Template.upcomingorderstock.helpers({
  dateAsAt: () => {
    return Template.instance().dateAsAt.get() || "-";
  },
  topTenData: () => {
    return Template.instance().topTenData.get();
  },
  Currency: () => {
    return Currency;
  },
  companyname: () => {
    return loggedCompany;
  },
  salesperc: () => {
    return Template.instance().salesperc.get() || 0;
  },
  expenseperc: () => {
    return Template.instance().expenseperc.get() || 0;
  },
  salespercTotal: () => {
    return Template.instance().salespercTotal.get() || 0;
  },
  expensepercTotal: () => {
    return Template.instance().expensepercTotal.get() || 0;
  },
});
Template.registerHelper("equals", function (a, b) {
  return a === b;
});

Template.registerHelper("notEquals", function (a, b) {
  return a != b;
});

Template.registerHelper("containsequals", function (a, b) {
  return a.indexOf(b) >= 0;
});
