import { Template } from "meteor/templating";
import { ReactiveVar } from "meteor/reactive-var";
import { FlowRouter } from "meteor/ostrio:flow-router-extra";
import "./settings.html";

Template.settings.onRendered(function () {
  let isFxCurrencyLicence = localStorage.getItem("CloudUseForeignLicence");

  setTimeout(function () {
    var x = window.matchMedia("(max-width: 1024px)");

    function mediaQuery(x) {
      if (x.matches) {
        $("#settingsCard").removeClass("col-8");
        $("#settingsCard").addClass("col-12");
      }
    }
    mediaQuery(x);
    x.addListener(mediaQuery);
  }, 500);

  let imageData = localStorage.getItem("Image");
  if (imageData) {
    $("#uploadedImage").attr("src", imageData);
    $("#uploadedImage").attr("width", "160");
    $("#uploadedImage").attr("height", "50%");
  }
});

Template.settings.events({
  "click .btnOrganisationSettings": function (event) {
    //window.open('/organisationSettings','_self');
    FlowRouter.go("/organisationsettings");
  },
  "click .btnAccountantSettings": function (event) {
    FlowRouter.go("/accountantsettings");
  },
  "click .btnAccessLevel": function (event) {
    FlowRouter.go("/accesslevel");
  },
  "click .btnCompanyAppSettings": function (event) {
    FlowRouter.go("/companyappsettings");
  },
  "click .btnReportsAccountant": function (event) {
    FlowRouter.go("/reportsAccountantSettings");
  },
  "click .btnCustomerType": function (event) {
    FlowRouter.go("/clienttypesettings");
  },
  "click .btnLeadStatus": function (event) {
    FlowRouter.go("/leadstatussettings");
  },
  "click .btnManufacturingSettings": function(event) {
    FlowRouter.go('/manufacturingsettings');
  },
  "click .btncurrenciesSettings": function (event) {
    FlowRouter.go("/currenciessettings");
  },
  "click .btntaxRatesSettings": function (event) {
    FlowRouter.go("/taxratesettings");
    // $('.fullScreenSpin').css('display', 'inline-block');
    // organisationService.getChkUSRegionTaxSetting().then(function (dataListRet) {
    //     let mainData = dataListRet.tcompanyinfo[0];
    //     $('.fullScreenSpin').css('display', 'none');
    //     if (mainData.ChkUSRegionTax || mainData.Country == "United States") {
    //         FlowRouter.go('/subtaxsettings');
    //     } else {
    //         FlowRouter.go('/taxratesettings');
    //     }
    // }).catch(function(err) {
    //     $('.fullScreenSpin').css('display', 'none');
    //     FlowRouter.go('/taxratesettings');
    // });
  },
  "click .btnDepartmentSettings": function (event) {
    FlowRouter.go("/departmentSettings");
  },
  "click .btnpaymentMethodSettings": function (event) {
    FlowRouter.go("/paymentmethodSettings");
  },
  "click .btnTermsSettings": function (event) {
    FlowRouter.go("/termsettings");
  },
  "click .btnServiceChecker": function (event) {
    FlowRouter.go("/serviceChecker");
  },
  "click .btnSubcription": function (event) {
    FlowRouter.go("/subscriptionSettings");
  },
  "click .btnSetupWizard": function (event) {
    FlowRouter.go("/setup");
  },
  "click .btnBackupRestore": function (event) {
    FlowRouter.go("/backuprestore");
  },
  "click .btnPayrollSettings": function (event) {
    FlowRouter.go("/payrollrules");
  },
  "click .btnEmailSettings": function (event) {
    FlowRouter.go("/emailsettings");
  },
  "click .btnSmsSettings": function (event) {
    FlowRouter.go("/smssettings");
  },
  "click .btnTemplates": function (event) {
    FlowRouter.go("/templatesettings");
  },
  "click .btnUomSettings": function (event) {
    FlowRouter.go("/uomSettings");
  },
  "click .btnEDIIntegrations": function (event) {
    FlowRouter.go("/edi-integrations");
  },
  "click .btnMailchimp": function (event) {
    FlowRouter.go("/mailchimpSettings");
  },
  "click .btnInventorySettings": function (event) {
    FlowRouter.go("/inventorySettings");
  },
});

Template.settings.helpers({
  checkFXCurrency: () => {
    return localStorage.getItem("CloudUseForeignLicence");
  },
  isGreenTrack: function () {
    let checkGreenTrack = localStorage.getItem("isGreenTrack") === "true";
    return checkGreenTrack;
  },
});
