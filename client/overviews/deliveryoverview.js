import { ReactiveVar } from "meteor/reactive-var";
import { UtilityService } from "../utility-service";
import { SideBarService } from "../js/sidebar-service";
import "../lib/global/indexdbstorage.js";
import { VS1ChartService } from "../vs1charts/vs1charts-service";

import { Session } from "meteor/session";
import { Template } from "meteor/templating";
import "./deliveryOverview.html";
import { FlowRouter } from "meteor/ostrio:flow-router-extra";

let vs1chartService = new VS1ChartService();
let sideBarService = new SideBarService();
let utilityService = new UtilityService();

Template.deliveryoverview.onCreated(function () {
  const templateObject = Template.instance();
  templateObject.displayfields = new ReactiveVar([]);
  templateObject.reset_data = new ReactiveVar([]);
  templateObject.setupFinished = new ReactiveVar();
  templateObject.selectedFile = new ReactiveVar();
  templateObject.showChart = new ReactiveVar(false);

  // const checkIfChartEnabled = async () => {
  //   let dashboardOptions = [];
  //   try {
  //     const data = await getVS1Data("TVS1DashboardOptions");
  //     if (!data || data.length === 0) {
  //       dashboardOptions = require('../popUps/dashboardoptions.json');
  //     } else {
  //       dashboardOptions = JSON.parse(data[0].data)
  //     }
  //   } catch (error) {
  //     dashboardOptions = require('../popUps/dashboardoptions.json');
  //   }
  //   console.log("dashboardOptions: ", dashboardOptions);
  //   const accountDashboardOption = dashboardOptions.find(option => option.name === 'Delivery');
  //   if(!accountDashboardOption) return false;
  //   templateObject.showChart.set(accountDashboardOption.isshowdefault);
  //   return true;
  // }

  // checkIfChartEnabled()
});

Template.deliveryoverview.onRendered(function () {
  // const templateObject = Template.instance();
  // $("#chart_deliverycharts").parent().removeClass("hideelement");
});

Template.deliveryoverview.events({});

Template.deliveryoverview.helpers({
  isShowCharts: () => {
    return Template.instance().showChart.get();
  }

});
