import { Template } from 'meteor/templating';

import { AccessLevelService } from './accesslevel-service.js';
import { ReactiveVar } from 'meteor/reactive-var';
import { ProductService } from "../product/product-service.js";
import { UtilityService } from "../utility-service.js";
import { SideBarService } from '../js/sidebar-service.js';
import { OrganisationService } from "../js/organisation-service";

import '../lib/global/indexdbstorage.js';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import '../Navigation/newsidenav.html';

const productService = new ProductService();
const sideBarService = new SideBarService();
const organisationService = new OrganisationService();

Template.newsidenav.onCreated(function () {
  const templateObject = Template.instance();
  templateObject.isBalanceSheet = new ReactiveVar(false);
  templateObject.isProfitLoss = new ReactiveVar(false);
  templateObject.isPLMonthly = new ReactiveVar(false);
  templateObject.isPLQuarterly = new ReactiveVar(false);
  templateObject.isPLYearly = new ReactiveVar(false);
  templateObject.isPLYTD = new ReactiveVar(false);
  templateObject.isJobSalesSummary = new ReactiveVar(false);
  templateObject.isAgedReceivables = new ReactiveVar(false);
  templateObject.isAgedReceivablesSummary = new ReactiveVar(false);
  templateObject.isProductSalesReport = new ReactiveVar(false);
  templateObject.isSalesReport = new ReactiveVar(false);
  templateObject.isJobProfitReport = new ReactiveVar(false);
  templateObject.isSupplierDetails = new ReactiveVar(false);
  templateObject.isSupplierProduct = new ReactiveVar(false);
  templateObject.isCustomerDetails = new ReactiveVar(false);
  templateObject.isCustomerSummary = new ReactiveVar(false);
  templateObject.isLotReport = new ReactiveVar(false);
  templateObject.isStockValue = new ReactiveVar(false);
  templateObject.isStockQuantity = new ReactiveVar(false);
  templateObject.isStockMovementReport = new ReactiveVar(false);
  templateObject.isClockedHourReport = new ReactiveVar(false);
  templateObject.isPayrollHistoryReport = new ReactiveVar(false);
  templateObject.isForeignExchangeHistoryList = new ReactiveVar(false);
  templateObject.isForeignExchangeList = new ReactiveVar(false);
  templateObject.isSalesSummaryReport = new ReactiveVar(false);
  templateObject.isGeneralLedger = new ReactiveVar(false);
  templateObject.isTaxSummaryReport = new ReactiveVar(false);
  templateObject.isTrialBalance = new ReactiveVar(false);
  templateObject.isTimeSheetSummary = new ReactiveVar(false);
  templateObject.isPayrollLeaveAccrued = new ReactiveVar(false);
  templateObject.isPayrollLeaveTaken = new ReactiveVar(false);
  templateObject.isSerialNumberReport = new ReactiveVar(false);
  templateObject.is1099Transaction = new ReactiveVar(false);
  templateObject.isAccountsLists = new ReactiveVar(false);
  templateObject.isBinLocations = new ReactiveVar(false);
  templateObject.isTransactionJournal = new ReactiveVar(false);
  templateObject.isUnpaidBills = new ReactiveVar(false);
  templateObject.isUnpaidPO = new ReactiveVar(false);
  templateObject.isBackOrderedPO = new ReactiveVar(false);
  templateObject.isSalesOrderConverted = new ReactiveVar(false);
  templateObject.isSalesOrderUnconverted = new ReactiveVar(false);
  templateObject.isPaymentMethodsList = new ReactiveVar(false);
  templateObject.isBackOrderedInvoices = new ReactiveVar(false);
  templateObject.isQuotesConverted = new ReactiveVar(false);
  templateObject.isQuotesUnconverted = new ReactiveVar(false);
  templateObject.isInvoicesPaid = new ReactiveVar(false);
  templateObject.isInvoicesUnpaid = new ReactiveVar(false);
  templateObject.isTimeSheetDetails = new ReactiveVar(false);
  templateObject.isChequeList = new ReactiveVar(false);
  templateObject.isJournalEntryList = new ReactiveVar(false);
  templateObject.isStockAdjustmentList = new ReactiveVar(false);
  templateObject.isAgedPayables = new ReactiveVar(false);
  templateObject.isAgedPayablesSummary = new ReactiveVar(false);
  templateObject.isPurchaseReport = new ReactiveVar(false);
  templateObject.isPurchaseSummaryReport = new ReactiveVar(false);
  templateObject.isPrintStatement = new ReactiveVar(false);
  templateObject.isExecutiveSummary = new ReactiveVar(false);
  templateObject.isCashReport = new ReactiveVar(false);
  templateObject.isProfitabilityReport = new ReactiveVar(false);
  templateObject.isPerformanceReport = new ReactiveVar(false);
  templateObject.isBalanceSheetReport = new ReactiveVar(false);
  templateObject.isIncomeReport = new ReactiveVar(false);
  templateObject.isPositionReport = new ReactiveVar(false);
  templateObject.accountantList = new ReactiveVar([]);
  templateObject.isBuildProfitability = new ReactiveVar(false);
  templateObject.isProductionWorkSheet = new ReactiveVar(false);
  templateObject.isWorkOrder = new ReactiveVar(false);
  // For Accountants
  templateObject.isCompanyAccountant = new ReactiveVar(false);
  templateObject.isTrustee = new ReactiveVar(false);
  templateObject.isFinancialStatement = new ReactiveVar(false);
  templateObject.isIndividual = new ReactiveVar(false);
  templateObject.isPartnershipNonTrading = new ReactiveVar(false);
  templateObject.isTrustNonTrading = new ReactiveVar(false);
  templateObject.isSelfManagedSuperfund = new ReactiveVar(false);
  templateObject.isSingleDirector = new ReactiveVar(false);
  templateObject.isSoleTraderNonTrading = new ReactiveVar(false);
  templateObject.isTrust = new ReactiveVar(false);

  templateObject.isSupplierList = new ReactiveVar(false);
  templateObject.isSupplierSummaryReport = new ReactiveVar(false);
  templateObject.isPrimaryAccountant = new ReactiveVar(false);

  templateObject.sideBarPositionClass = new ReactiveVar();
  templateObject.sideBarPositionClass.set('top');
  templateObject.includeDashboard = new ReactiveVar();
  templateObject.includeDashboard.set(false);
  templateObject.includeMain = new ReactiveVar();
  templateObject.includeMain.set(false);
  templateObject.includeInventory = new ReactiveVar();
  templateObject.includeInventory.set(false);
  templateObject.includeManufacturing = new ReactiveVar();
  templateObject.includeManufacturing.set(false);
  templateObject.includeAccessLevels = new ReactiveVar();
  templateObject.includeAccessLevels.set(false);
  templateObject.includeShipping = new ReactiveVar();
  templateObject.includeShipping.set(false);
  templateObject.includeStockTransfer = new ReactiveVar();
  templateObject.includeStockTransfer.set(false);
  templateObject.includeStockAdjustment = new ReactiveVar();
  templateObject.includeStockAdjustment.set(false);
  templateObject.includeStockTake = new ReactiveVar();
  templateObject.includeStockTake.set(false);
  templateObject.includeSales = new ReactiveVar();
  templateObject.includeSales.set(false);
  templateObject.includeExpenseClaims = new ReactiveVar();
  templateObject.includeExpenseClaims.set(false);
  templateObject.includeFixedAssets = new ReactiveVar();
  templateObject.includeFixedAssets.set(false);
  templateObject.includePurchases = new ReactiveVar();
  templateObject.includePurchases.set(false);

  templateObject.includePayments = new ReactiveVar();
  templateObject.includePayments.set(false);
  templateObject.includeContacts = new ReactiveVar();
  templateObject.includeContacts.set(false);
  templateObject.includeAccounts = new ReactiveVar();
  templateObject.includeAccounts.set(false);
  templateObject.includeReports = new ReactiveVar();
  templateObject.includeReports.set(false);
  templateObject.includeSettings = new ReactiveVar();
  templateObject.includeSettings.set(false);

  templateObject.includeSeedToSale = new ReactiveVar();
  templateObject.includeSeedToSale.set(false);
  templateObject.includeBanking = new ReactiveVar();
  templateObject.includeBanking.set(false);
  templateObject.includePayroll = new ReactiveVar();
  templateObject.includePayroll.set(false);

  templateObject.includePayrollClockOnOffOnly = new ReactiveVar();
  templateObject.includePayrollClockOnOffOnly.set(false);

  templateObject.includeTimesheetEntry = new ReactiveVar();
  templateObject.includeTimesheetEntry.set(false);
  templateObject.includeClockOnOff = new ReactiveVar();
  templateObject.includeClockOnOff.set(false);

  templateObject.isCloudSidePanelMenu = new ReactiveVar();
  templateObject.isCloudSidePanelMenu.set(false);
  templateObject.isCloudTopPanelMenu = new ReactiveVar();
  templateObject.isCloudTopPanelMenu.set(false);

  templateObject.includeAppointmentScheduling = new ReactiveVar();
  templateObject.includeAppointmentScheduling.set(false);

  templateObject.isBalanceSheet = new ReactiveVar();
  templateObject.isBalanceSheet.set(false);
  templateObject.isProfitLoss = new ReactiveVar();
  templateObject.isProfitLoss.set(false);
  templateObject.isAgedReceivables = new ReactiveVar();
  templateObject.isAgedReceivables.set(false);
  templateObject.isAgedReceivablesSummary = new ReactiveVar();
  templateObject.isAgedReceivablesSummary.set(false);
  templateObject.isProductSalesReport = new ReactiveVar();
  templateObject.isProductSalesReport.set(false);
  templateObject.isSalesReport = new ReactiveVar();
  templateObject.isSalesReport.set(false);
  templateObject.isSalesSummaryReport = new ReactiveVar();
  templateObject.isSalesSummaryReport.set(false);
  templateObject.isGeneralLedger = new ReactiveVar();
  templateObject.isGeneralLedger.set(false);
  templateObject.isTaxSummaryReport = new ReactiveVar();
  templateObject.isTaxSummaryReport.set(false);
  templateObject.isTrialBalance = new ReactiveVar();
  templateObject.isTrialBalance.set(false);
  templateObject.is1099Transaction = new ReactiveVar();
  templateObject.is1099Transaction.set(false);
  templateObject.isAgedPayables = new ReactiveVar();
  templateObject.isAgedPayables.set(false);
  templateObject.isAgedPayablesSummary = new ReactiveVar();
  templateObject.isAgedPayablesSummary.set(false);
  templateObject.isPurchaseReport = new ReactiveVar();
  templateObject.isPurchaseReport.set(false);
  templateObject.isPurchaseSummaryReport = new ReactiveVar();
  templateObject.isPurchaseSummaryReport.set(false);
  templateObject.isPrintStatement = new ReactiveVar();
  templateObject.isPrintStatement.set(false);
  templateObject.isSNTrackChecked = new ReactiveVar();
  templateObject.isSNTrackChecked.set(false);
  templateObject.isBankingReport = new ReactiveVar();
  templateObject.isBankingReport.set(false);

  templateObject.isCRM = new ReactiveVar();
  templateObject.isCRM.set(false);
  templateObject.isProductList = new ReactiveVar();
  templateObject.isProductList.set(false);
  templateObject.isNewProduct = new ReactiveVar();
  templateObject.isNewProduct.set(false);
  templateObject.isNewStockTransfer = new ReactiveVar();
  templateObject.isNewStockTransfer.set(false);
  templateObject.isExportProduct = new ReactiveVar();
  templateObject.isExportProduct.set(false);
  templateObject.isImportProduct = new ReactiveVar();
  templateObject.isImportProduct.set(false);
  templateObject.isStockonHandDemandChart = new ReactiveVar();
  templateObject.isStockonHandDemandChart.set(false);
  templateObject.isAppointmentSMS = new ReactiveVar();
  templateObject.isAppointmentSMS.set(false);

  templateObject.isSerialNumberList = new ReactiveVar();
  templateObject.isSerialNumberList.set(false);
  sideBarService.getVS1MenuConfig().then((data) => {
    if (data.tpreference && data.tpreference.length > 0) {
      const latestAction = data.tpreference[data.tpreference.length - 1];
      const menuItem = JSON.parse(latestAction.fields.PrefValue);
      if (menuItem.Location === "TopMenu") {
        templateObject.sideBarPositionClass.set('top');
        $('#sidebar').addClass('top');
        $('#bodyContainer').addClass('top');
        $('#sidebarToggleBtn .text').text('Side');
      } else {
        templateObject.sideBarPositionClass.set('side');
        $('#sidebar').removeClass('top');
        $('#bodyContainer').removeClass('top');
        $('#sidebarToggleBtn .text').text('Top');
      }
      localStorage.setItem('TPreferenceMenuID', latestAction.fields.ID);
    } else {
      templateObject.sideBarPositionClass.set('side');
      $('#sidebar').removeClass('top');
      $('#bodyContainer').removeClass('top');
      $('#sidebarToggleBtn .text').text('Top');
      localStorage.setItem('TPreferenceMenuID', 0);
    }
  });

  $(document).ready(function () {
    var erpGet = erpDb();
    var LoggedDB = erpGet.ERPDatabase;
    var loc = FlowRouter.current().path;
  });
});
Template.newsidenav.onRendered(function () {
  console.log("rendered")
  let templateObject = Template.instance();

  let vS1FormAccessDetail = localStorage.getItem('VS1FormAccessDetail');
  let isDashboard = localStorage.getItem('CloudDashboardModule');
  let isMain = localStorage.getItem('CloudMainModule');
  let isInventory = localStorage.getItem('CloudInventoryModule');
  let isManufacturing = localStorage.getItem('CloudManufacturingModule');
  let isAccessLevels = localStorage.getItem('CloudAccessLevelsModule');
  let isShipping = localStorage.getItem('CloudShippingModule');
  let isStockTransfer = localStorage.getItem('CloudStockTransferModule');
  let isStockAdjustment = localStorage.getItem('CloudStockAdjustmentModule');
  let isStockTake = localStorage.getItem('CloudStockTakeModule');
  let isSales = localStorage.getItem('CloudSalesModule');
  let isPurchases = localStorage.getItem('CloudPurchasesModule');
  let isExpenseClaims = localStorage.getItem('CloudExpenseClaimsModule');
  let isFixedAssets = localStorage.getItem('CloudFixedAssetsModule');

  let isPayments = localStorage.getItem('CloudPaymentsModule');
  let isContacts = localStorage.getItem('CloudContactsModule');

  let isAccounts = localStorage.getItem('CloudAccountsModule');
  let isReports = localStorage.getItem('CloudReportsModule');
  let isSettings = localStorage.getItem('CloudSettingsModule');

  let isSeedToSale = localStorage.getItem('CloudSeedToSaleModule');
  let isBanking = localStorage.getItem('CloudBankingModule');
  let isPayroll = localStorage.getItem('CloudPayrollModule');
  let isTimesheetEntry = localStorage.getItem('CloudTimesheetEntry');
  let isShowTimesheet = localStorage.getItem('CloudShowTimesheet');
  let isTimesheetCreate = localStorage.getItem('CloudCreateTimesheet');
  let isEditTimesheetHours = localStorage.getItem('CloudEditTimesheetHours');
  let isClockOnOff = localStorage.getItem('CloudClockOnOff');

  let isSidePanel = localStorage.getItem('CloudSidePanelMenu');
  let isTopPanel = localStorage.getItem('CloudTopPanelMenu');

  let isAppointmentScheduling = localStorage.getItem('CloudAppointmentSchedulingModule');
  let isCurrencyEnable = localStorage.getItem('CloudUseForeignLicence');
  let isAppointmentLaunch = localStorage.getItem('CloudAppointmentAppointmentLaunch');

  let launchAllocations = localStorage.getItem('CloudAppointmentAllocationLaunch');

  let isCRM = localStorage.getItem('CloudCRM');
  let isProductList = localStorage.getItem('CloudProdList');
  let isNewProduct = localStorage.getItem('CloudNewProd');
  let isNewStockTransfer = localStorage.getItem('CloudNewStockTransfer');
  let isExportProduct = localStorage.getItem('CloudExportProd');
  let isImportProduct = localStorage.getItem('CloudImportProd');
  let isStockonHandDemandChart = localStorage.getItem('CloudStockOnHand');
  let isAppointmentSMS = localStorage.getItem('CloudApptSMS');

  let isSerialNumberList = localStorage.getItem('CloudShowSerial') || false;
  var erpGet = erpDb();
  var LoggedDB = erpGet.ERPDatabase;
  var LoggedUser = localStorage.getItem('mySession');
  let cloudPackage = localStorage.getItem('vs1cloudlicenselevel');
  // here get menu bar preference from local storage and set menubarPositionClass
  // let isMenuBarSide = localStorage.getItem('menubarpreference')
  if (cloudPackage == "PLUS") {
    templateObject.isSNTrackChecked.set(true);
  } else {
    templateObject.isSNTrackChecked.set(false);
  }

  if (JSON.parse(isClockOnOff)) {
    /* Explain this code to Rasheed */
    isAccounts = false;
    isAppointmentScheduling = false;
    isBanking = false;
    isContacts = false;
    isCRM = false;
    isDashboard = false;
    isFixedAssets = false;
    isInventory = false;
    isManufacturing = false;
    isPayments = false;
    isPurchases = false;
    isExpenseClaims = false;
    isReports = false;
    isSales = false;
    isShipping = false;
    isTimesheetEntry = false;
    isPayroll = false;
    isSettings = false;
  }

  function MyPopper(button, popper) {
    this.timer = null;
    this.bounder = $('#popperBounder');
    this.button = $(button);
    this.popper = $(popper).clone().appendTo(this.bounder);
    this.popper.hover(() => {
      clearTimeout(this.timer);
    }, () => {
      this.timer = setTimeout(() => {
        this.timer = null;
        this.hidePopper();
      }, 1500);
    });

    this.arrow = $('<div class="popper-arrow"></div>').appendTo(this.popper);
  }
  MyPopper.prototype.createInstance = function () {
    this.instance = Popper.createPopper(this.button[0], this.popper[0], {
      placement: "bottom", //preferred placement of popper
      modifiers: [{
        name: "offset", //offsets popper from the reference/button
        options: {
          offset: [0, 8]
        }
      },
      {
        name: "flip", //flips popper with allowed placements
        options: {
          allowedAutoPlacements: ["right", "left", "top", "bottom"],
          rootBoundary: "viewport"
        }
      },
      {
        name: 'preventOverflow',
        options: {
          boundary: this.bounder[0],
        },
      },
      ]
    });
  }
  MyPopper.prototype.destroyInstance = function () {
    if (this.instance) {
      this.instance.destroy();
      this.instance = null;
    }
  }
  MyPopper.prototype.showPopper = function () {
    this.popper.addClass('popper-popup');
    this.popper.attr("show-popper", "");
    this.arrow.attr("data-popper-arrow", "");
    this.createInstance();
  }
  MyPopper.prototype.hidePopper = function () {
    this.popper.removeClass('popper-popup');
    this.popper.removeClass('show');
    this.popper.removeAttr("show-popper");
    this.arrow.removeAttr("data-popper-arrow");
    this.destroyInstance();
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
  MyPopper.prototype.togglePopper = function () {
    if (this.popper[0].hasAttribute("show-popper")) {
      this.hidePopper();
    } else {
      this.showPopper();
    }
  }
  const poppers = [];

  function init() {
    $('body #sidebar .components > li').each((index, li) => {
      const ul = $(li).find('> div')[0];
      if (ul) {
        const a = $(li).find('> a')[0];
        a.popper = new MyPopper(a, ul);
        poppers.push(a.popper);
      }
    })
    $('body').on('mouseover', '.top #sidebar .components > li > a', function (e) {
      if (e.currentTarget.popper) {
        poppers.forEach(popper => e.currentTarget.popper !== popper && popper.hidePopper());
        e.currentTarget.popper.showPopper();
        if (e.currentTarget.popper.timer) clearTimeout(e.currentTarget.popper.timer);
        e.currentTarget.popper.timer = setTimeout(() => {
          e.currentTarget.popper.hidePopper();
        }, 1500);
      }
    })
    $('#colContent').on('click', function () {
      poppers.forEach(popper => popper.hidePopper());
    })
  }

  templateObject.getSetSideNavFocus = function () {

    setTimeout(function () {
      var currentLoc = FlowRouter.current().route.path;

      if (localStorage.getItem("ERPLoggedCountry") == "Australia") {
        $("#sidenavbasreturnlist").parent().show();
        $("#sidenavbasreturn").parent().show();
        $("#sidenavvatreturnlist").parent().hide();
        $("#sidenavvatreturn").parent().hide();
      } else if (localStorage.getItem("ERPLoggedCountry") == "South Africa") {
        $("#sidenavbasreturnlist").parent().hide();
        $("#sidenavbasreturn").parent().hide();
        $("#sidenavvatreturnlist").parent().show();
        $("#sidenavvatreturn").parent().show();
      }

      if (currentLoc == "/dashboard") {
        $('#sidenavaccounts').removeClass('active');
        $('#sidenavbanking').removeClass('active');
        $('#sidenavdashbaord').addClass('active');
        $('#sidenavdashbaordexe').removeClass('active');
        $('#sidenavdashbaordsales').removeClass('active');
        $('#sidenavdashbaordsalesmanager').removeClass('active');
        $('#sidenavdashbaordmy').removeClass('active');
        $('#sidenavappointment').removeClass('active');
        $('#sidenavcontacts').removeClass('active');
        $('#sidenavcrm').removeClass('active');
        $('#sidenavinventory').removeClass('active');
        $('#sidenavmanufacturing').removeClass('active');
        $('#sidenavpayments').removeClass('active');
        $('#sidenavpurchases').removeClass('active');
        $('#sidenavreports, #sidenavreports2').removeClass('active');
        $('#sidenavsales').removeClass('active');
        $('#sidenavsettings').removeClass('active');
        $('#sidenavstocktake').removeClass('active');
        $('#sidenavpayroll').removeClass('active');
        $('#sidenavseedtosale').removeClass('active');
        $('#sidenavshipping').removeClass('active');
        $('#sidenavreceipt').removeClass('active');
        $('#sidenavfixedAssets').removeClass('active');
        $('#sidenavdelivery').removeClass('active');
        // $('.collapse').collapse('hide');
      } else if (currentLoc == "/dashboardexe") {
        $('#sidenavaccounts').removeClass('active');
        $('#sidenavbanking').removeClass('active');
        $('#sidenavdashbaord').removeClass('active');
        $('#sidenavdashbaordexe').addClass('active');
        $('#sidenavdashbaordsales').removeClass('active');
        $('#sidenavdashbaordsalesmanager').removeClass('active');
        $('#sidenavdashbaordmy').removeClass('active');
        $('#sidenavmanufacturing').removeClass('active');
        $('#sidenavappointment').removeClass('active');
        $('#sidenavcontacts').removeClass('active');
        $('#sidenavcrm').removeClass('active');
        $('#sidenavinventory').removeClass('active');
        $('#sidenavpayments').removeClass('active');
        $('#sidenavpurchases').removeClass('active');
        $('#sidenavreports').removeClass('active');
        $('#sidenavsales').removeClass('active');
        $('#sidenavsettings').removeClass('active');
        $('#sidenavstocktake').removeClass('active');
        $('#sidenavpayroll').removeClass('active');
        $('#sidenavseedtosale').removeClass('active');
        $('#sidenavshipping').removeClass('active');
        $('#sidenavreceipt').removeClass('active');
        $('#sidenavfixedAssets').removeClass('active');
        $('#sidenavdelivery').removeClass('active');
        $('.collapse').collapse('hide');
      } else if (currentLoc == "/dashboardsalesmanager" || currentLoc == "/dashboardsales") {
        $('#sidenavaccounts').removeClass('active');
        $('#sidenavbanking').removeClass('active');
        $('#sidenavdashbaord').removeClass('active');
        $('#sidenavdashbaordexe').removeClass('active');
        $('#sidenavdashbaordmy').removeClass('active');
        $('#sidenavmanufacturing').removeClass('active');
        $('#sidenavappointment').removeClass('active');
        $('#sidenavcontacts').removeClass('active');
        $('#sidenavcrm').removeClass('active');
        $('#sidenavinventory').removeClass('active');
        $('#sidenavpayments').removeClass('active');
        $('#sidenavpurchases').removeClass('active');
        $('#sidenavreports').removeClass('active');
        $('#sidenavsales').removeClass('active');
        $('#sidenavsettings').removeClass('active');
        $('#sidenavstocktake').removeClass('active');
        $('#sidenavpayroll').removeClass('active');
        $('#sidenavseedtosale').removeClass('active');
        $('#sidenavshipping').removeClass('active');
        $('#sidenavreceipt').removeClass('active');
        $('#sidenavfixedAssets').removeClass('active');
        $('#sidenavdelivery').removeClass('active');
        $('.collapse').collapse('hide');
        if (currentLoc == "/dashboardsales") {
          $('#sidenavdashbaordsales').addClass('active');
          $('#sidenavdashbaordsalesmanager').removeClass('active');
        } else {
          $('#sidenavdashbaordsalesmanager').addClass('active');
          $('#sidenavdashbaordsales').removeClass('active');
        }
      } else if (currentLoc == "/dashboardmy") {
        $('#sidenavaccounts').removeClass('active');
        $('#sidenavbanking').removeClass('active');
        $('#sidenavdashbaord').removeClass('active');
        $('#sidenavdashbaordexe').removeClass('active');
        $('#sidenavdashbaordsales').removeClass('active');
        $('#sidenavdashbaordmy').addClass('active');
        $('#sidenavdashbaordsalesmanager').removeClass('active');
        $('#sidenavmanufacturing').removeClass('active');
        $('#sidenavappointment').removeClass('active');
        $('#sidenavcontacts').removeClass('active');
        $('#sidenavcrm').removeClass('active');
        $('#sidenavinventory').removeClass('active');
        $('#sidenavpayments').removeClass('active');
        $('#sidenavpurchases').removeClass('active');
        $('#sidenavreports').removeClass('active');
        $('#sidenavsales').removeClass('active');
        $('#sidenavsettings').removeClass('active');
        $('#sidenavstocktake').removeClass('active');
        $('#sidenavpayroll').removeClass('active');
        $('#sidenavseedtosale').removeClass('active');
        $('#sidenavshipping').removeClass('active');
        $('#sidenavreceipt').removeClass('active');
        $('#sidenavfixedAssets').removeClass('active');
        $('#sidenavdelivery').removeClass('active');
        $('.collapse').collapse('hide');
      } else if ((currentLoc == "/appointments") || (currentLoc == "/appointmentlist") || (currentLoc == "/appointmenttimelist")) {
        $('#sidenavaccounts').removeClass('active');
        $('#sidenavbanking').removeClass('active');
        $('#sidenavappointment').addClass('active');
        $('#sidenavdashbaord').removeClass('active');
        $('#sidenavdashbaordexe').removeClass('active');
        $('#sidenavdashbaordsales').removeClass('active');
        $('#sidenavdashbaordsalesmanager').removeClass('active');
        $('#sidenavdashbaordmy').removeClass('active');
        $('#sidenavmanufacturing').removeClass('active');
        $('#sidenavcontacts').removeClass('active');
        $('#sidenavcrm').removeClass('active');
        $('#sidenavinventory').removeClass('active');
        $('#sidenavpayments').removeClass('active');
        $('#sidenavpurchases').removeClass('active');
        $('#sidenavreports, #sidenavreports2').removeClass('active');
        $('#sidenavsales').removeClass('active');
        $('#sidenavsettings').removeClass('active');
        $('#sidenavstocktake ').removeClass('active');
        $('#sidenavpayroll').removeClass('active');
        $('#sidenavseedtosale').removeClass('active');
        $('#sidenavshipping').removeClass('active');
        $('#sidenavreceipt').removeClass('active');
        $('#sidenavfixedAssets').removeClass('active');
        $('#sidenavdelivery').removeClass('active');
        $('.collapse').collapse('hide');
      } else if ((currentLoc == "/accountsoverview") || (currentLoc == "/journalentrylist") ||
        (currentLoc == "/journalentrycard")) {
        $('#sidenavaccounts').addClass('active');
        $('#sidenavbanking').removeClass('active');
        $('#sidenavdashbaord').removeClass('active');
        $('#sidenavdashbaordexe').removeClass('active');
        $('#sidenavdashbaordsales').removeClass('active');
        $('#sidenavdashbaordsalesmanager').removeClass('active');
        $('#sidenavdashbaordmy').removeClass('active');
        $('#sidenavmanufacturing').removeClass('active');
        $('#sidenavappointment').removeClass('active');
        $('#sidenavcontacts').removeClass('active');
        $('#sidenavcrm').removeClass('active');
        $('#sidenavinventory').removeClass('active');
        $('#sidenavpayments').removeClass('active');
        $('#sidenavpurchases').removeClass('active');
        $('#sidenavreports, #sidenavreports2').removeClass('active');
        $('#sidenavsales').removeClass('active');
        $('#sidenavsettings').removeClass('active');
        $('#sidenavstocktake').removeClass('active');
        $('#sidenavpayroll').removeClass('active');
        $('#sidenavseedtosale').removeClass('active');
        $('#sidenavshipping').removeClass('active');
        $('#sidenavreceipt').removeClass('active');
        $('#sidenavfixedAssets').removeClass('active');
        $('#sidenavdelivery').removeClass('active');
        $('.collapse').collapse('hide');
      } else if ((currentLoc == "/bankingoverview") || (currentLoc == "/chequelist") ||
        (currentLoc == "/chequecard") || (currentLoc == "/reconciliation") ||
        (currentLoc == "/reconciliationlist") || (currentLoc == "/bankrecon") || (currentLoc == "/depositcard") || (currentLoc == "/depositlist")) {
        $('#sidenavaccounts').removeClass('active');
        $('#sidenavbanking').addClass('active');
        $('#sidenavdashbaord').removeClass('active');
        $('#sidenavdashbaordexe').removeClass('active');
        $('#sidenavdashbaordsales').removeClass('active');
        $('#sidenavdashbaordsalesmanager').removeClass('active');
        $('#sidenavdashbaordmy').removeClass('active');
        $('#sidenavmanufacturing').removeClass('active');
        $('#sidenavappointment').removeClass('active');
        $('#sidenavcontacts').removeClass('active');
        $('#sidenavcrm').removeClass('active');
        $('#sidenavinventory').removeClass('active');
        $('#sidenavpayments').removeClass('active');
        $('#sidenavpurchases').removeClass('active');
        $('#sidenavreports, #sidenavreports2').removeClass('active');
        $('#sidenavsales').removeClass('active');
        $('#sidenavsettings').removeClass('active');
        $('#sidenavstocktake').removeClass('active');
        $('#sidenavpayroll').removeClass('active');
        $('#sidenavseedtosale').removeClass('active');
        $('#sidenavshipping').removeClass('active');
        $('#sidenavreceipt').removeClass('active');
        $('#sidenavfixedAssets').removeClass('active');
        $('#sidenavdelivery').removeClass('active');
        $('.collapse').collapse('hide');
      } else if ((currentLoc == "/contactoverview") ||
        (currentLoc == "/employeelist") || (currentLoc == "/employeescard") ||
        (currentLoc == "/customerlist") || (currentLoc == "/customerscard") ||
        (currentLoc == "/supplierlist") || (currentLoc == "/supplierscard") ||
        (currentLoc == "/joblist")) {
        $('#sidenavaccounts').removeClass('active');
        $('#sidenavbanking').removeClass('active');
        $('#sidenavdashbaord').removeClass('active');
        $('#sidenavdashbaordexe').removeClass('active');
        $('#sidenavdashbaordsales').removeClass('active');
        $('#sidenavdashbaordsalesmanager').removeClass('active');
        $('#sidenavdashbaordmy').removeClass('active');
        $('#sidenavmanufacturing').removeClass('active');
        $('#sidenavappointment ').removeClass('active');
        $('#sidenavcontacts').addClass('active');
        $('#sidenavcrm ').removeClass('active');
        $('#sidenavinventory').removeClass('active');
        $('#sidenavpayments').removeClass('active');
        $('#sidenavpurchases').removeClass('active');
        $('#sidenavreports, #sidenavreports').removeClass('active');
        $('#sidenavsales').removeClass('active');
        $('#sidenavsettings').removeClass('active');
        $('#sidenavstocktake ').removeClass('active');
        $('#sidenavpayroll').removeClass('active');
        $('#sidenavseedtosale').removeClass('active');
        $('#sidenavshipping').removeClass('active');
        $('#sidenavreceipt').removeClass('active');
        $('#sidenavfixedAssets').removeClass('active');
        $('#sidenavdelivery').removeClass('active');
        $('.collapse').collapse('hide');
      } else if ((currentLoc == "/crmoverview") || (currentLoc == "/tasklist") || (currentLoc == "/leadlist") || (currentLoc == "/campaign-list")) {
        $('#sidenavaccounts').removeClass('active');
        $('#sidenavbanking').removeClass('active');
        $('#sidenavdashbaord').removeClass('active');
        $('#sidenavdashbaordexe').removeClass('active');
        $('#sidenavdashbaordsales').removeClass('active');
        $('#sidenavdashbaordsalesmanager').removeClass('active');
        $('#sidenavdashbaordmy').removeClass('active');
        $('#sidenavmanufacturing').removeClass('active');
        $('#sidenavappointment').removeClass('active');
        $('#sidenavcontacts').removeClass('active');
        $('#sidenavcrm').addClass('active');
        $('#sidenavinventory').removeClass('active');
        $('#sidenavpayments').removeClass('active');
        $('#sidenavpurchases').removeClass('active');
        $('#sidenavreports, #sidenavreports2').removeClass('active');
        $('#sidenavsales').removeClass('active');
        $('#sidenavsettings').removeClass('active');
        $('#sidenavstocktake').removeClass('active');
        $('#sidenavpayroll').removeClass('active');
        $('#sidenavseedtosale').removeClass('active');
        $('#sidenavshipping').removeClass('active');
        $('#sidenavreceipt').removeClass('active');
        $('#sidenavfixedAssets').removeClass('active');
        $('#sidenavdelivery').removeClass('active');
        $('.collapse').collapse('hide');
      } else if ((currentLoc == "/inventorylist") || (currentLoc == '/productview') ||
        (currentLoc == "/stockadjustmentcard") ||
        (currentLoc == "/stockadjustmentoverview") || (currentLoc == "/productlist") ||
        (currentLoc == "/stocktransfercard") || (currentLoc == "/stocktransferlist") ||
        (currentLoc == "/serialnumberlist") || (currentLoc == "/lotnumberlist") || (currentLoc == "/binlocationslist")) {
        $('#sidenavaccounts').removeClass('active');
        $('#sidenavbanking').removeClass('active');
        $('#sidenavdashbaord').removeClass('active');
        $('#sidenavdashbaordexe').removeClass('active');
        $('#sidenavdashbaordsales').removeClass('active');
        $('#sidenavdashbaordsalesmanager').removeClass('active');
        $('#sidenavdashbaordmy').removeClass('active');
        $('#sidenavmanufacturing').removeClass('active');
        $('#sidenavappointment').removeClass('active');
        $('#sidenavcontacts').removeClass('active');
        $('#sidenavcrm').removeClass('active');
        $('#sidenavinventory').addClass('active');
        $('#sidenavpayments').removeClass('active');
        $('#sidenavpurchases').removeClass('active');
        $('#sidenavreports, #sidenavreports').removeClass('active');
        $('#sidenavsales').removeClass('active');
        $('#sidenavsettings').removeClass('active');
        $('#sidenavstocktake').removeClass('active');
        $('#sidenavpayroll').removeClass('active');
        $('#sidenavseedtosale').removeClass('active');
        $('#sidenavshipping').removeClass('active');
        $('#sidenavreceipt').removeClass('active');
        $('#sidenavfixedAssets').removeClass('active');
        $('#sidenavdelivery').removeClass('active');
        $('.collapse').collapse('hide');
      } else if ((currentLoc == "/paymentoverview") ||
        (currentLoc == "/customerawaitingpayments") || (currentLoc == "/customerpayment") ||
        (currentLoc == "/supplierawaitingpurchaseorder") || (currentLoc == "/supplierawaitingbills") ||
        (currentLoc == "/supplierpayment") || (currentLoc == "/paymentcard") ||
        (currentLoc == "/supplierpaymentcard")) {
        $('#sidenavaccounts').removeClass('active');
        $('#sidenavbanking').removeClass('active');
        $('#sidenavdashbaord').removeClass('active');
        $('#sidenavdashbaordexe').removeClass('active');
        $('#sidenavdashbaordsales').removeClass('active');
        $('#sidenavdashbaordsalesmanager').removeClass('active');
        $('#sidenavdashbaordmy').removeClass('active');
        $('#sidenavmanufacturing').removeClass('active');
        $('#sidenavappointment').removeClass('active');
        $('#sidenavcontacts').removeClass('active');
        $('#sidenavcrm').removeClass('active');
        $('#sidenavinventory').removeClass('active');
        $('#sidenavpayments').addClass('active');
        $('#sidenavpurchases').removeClass('active');
        $('#sidenavreports, #sidenavreports').removeClass('active');
        $('#sidenavsales').removeClass('active');
        $('#sidenavsettings').removeClass('active');
        $('#sidenavstocktake').removeClass('active');
        $('#sidenavpayroll').removeClass('active');
        $('#sidenavseedtosale').removeClass('active');
        $('#sidenavshipping').removeClass('active');
        $('#sidenavreceipt').removeClass('active');
        $('#sidenavfixedAssets').removeClass('active');
        $('#sidenavdelivery').removeClass('active');
        $('.collapse').collapse('hide');
      } else if (currentLoc == "/receiptsoverview") {
        $('#sidenavreceipt').addClass('active');
        $('#sidenavaccounts').removeClass('active');
        $('#sidenavbanking').removeClass('active');
        $('#sidenavdashbaord').removeClass('active');
        $('#sidenavdashbaordexe').removeClass('active');
        $('#sidenavdashbaordsales').removeClass('active');
        $('#sidenavdashbaordsalesmanager').removeClass('active');
        $('#sidenavdashbaordmy').removeClass('active');
        $('#sidenavmanufacturing').removeClass('active');
        $('#sidenavappointment').removeClass('active');
        $('#sidenavcontacts').removeClass('active');
        $('#sidenavcrm').removeClass('active');
        $('#sidenavinventory').removeClass('active');
        $('#sidenavpayments').removeClass('active');
        $('#sidenavpurchases').removeClass('active');
        $('#sidenavreports, #sidenavreports').removeClass('active');
        $('#sidenavsales').removeClass('active');
        $('#sidenavsettings').removeClass('active');
        $('#sidenavstocktake').removeClass('active');
        $('#sidenavpayroll').removeClass('active');
        $('#sidenavseedtosale').removeClass('active');
        $('#sidenavshipping').removeClass('active');
        $('#sidenavfixedAssets').removeClass('active');
        $('#sidenavdelivery').removeClass('active');
        $('.collapse').collapse('hide');
      } else if ((currentLoc == "/purchasesoverview") ||
        (currentLoc == "/purchaseorderlist") || (currentLoc == "/purchaseordercard") ||
        (currentLoc == "/billlist") || (currentLoc == "/billcard") ||
        (currentLoc == "/creditlist") || (currentLoc == "/creditcard") ||
        (currentLoc == "/purchaseorderlistBO")) {
        $('#sidenavaccounts').removeClass('active');
        $('#sidenavbanking').removeClass('active');
        $('#sidenavdashbaord').removeClass('active');
        $('#sidenavdashbaordexe').removeClass('active');
        $('#sidenavdashbaordsales').removeClass('active');
        $('#sidenavdashbaordsalesmanager').removeClass('active');
        $('#sidenavdashbaordmy').removeClass('active');
        $('#sidenavmanufacturing').removeClass('active');
        $('#sidenavappointment').removeClass('active');
        $('#sidenavcontacts').removeClass('active');
        $('#sidenavcrm').removeClass('active');
        $('#sidenavinventory').removeClass('active');
        $('#sidenavpayments').removeClass('active');
        $('#sidenavpurchases').addClass('active');
        $('#sidenavreports, #sidenavreports').removeClass('active');
        $('#sidenavsales').removeClass('active');
        $('#sidenavsettings').removeClass('active');
        $('#sidenavstocktake').removeClass('active');
        $('#sidenavpayroll').removeClass('active');
        $('#sidenavseedtosale').removeClass('active');
        $('#sidenavshipping').removeClass('active');
        $('#sidenavreceipt').removeClass('active');
        $('#sidenavfixedAssets').removeClass('active');
        $('#sidenavdelivery').removeClass('active');
        $('.collapse').collapse('hide');
      } else if ((currentLoc == "/allreports") ||
        (currentLoc == "/balancesheetreport") || (currentLoc == "/balancetransactionlist") ||
        (currentLoc == "/cashsummaryreport") || (currentLoc == "/newprofitandloss") ||
        (currentLoc == "/agedreceivables") || (currentLoc == "/agedpayables") ||
        (currentLoc == "/trialbalancereport") || (currentLoc == "/1099report") ||
        (currentLoc == "/agedreceivablessummary") || (currentLoc == "/salesreport") ||
        (currentLoc == "/generalledger") || (currentLoc == "/trialbalance") ||
        (currentLoc == "/statementlist") || (currentLoc == "/purchasesreport") ||
        (currentLoc == "/productsalesreport") || (currentLoc == "/salessummaryreport") ||
        (currentLoc == "/taxsummaryreport") || (currentLoc == "/purchasesummaryreport") ||
        (currentLoc == "/agedpayablessummary") || (currentLoc == "/accountant")) {
        $('#sidenavaccounts').removeClass('active');
        $('#sidenavbanking').removeClass('active');
        $('#sidenavdashbaord').removeClass('active');
        $('#sidenavdashbaordexe').removeClass('active');
        $('#sidenavdashbaordsales').removeClass('active');
        $('#sidenavdashbaordsalesmanager').removeClass('active');
        $('#sidenavdashbaordmy').removeClass('active');
        $('#sidenavmanufacturing').removeClass('active');
        $('#sidenavappointment').removeClass('active');
        $('#sidenavcontacts').removeClass('active');
        $('#sidenavcrm').removeClass('active');
        $('#sidenavinventory').removeClass('active');
        $('#sidenavpayments').removeClass('active');
        $('#sidenavpurchases').removeClass('active');
        $('#sidenavreports, #sidenavreports2').addClass('active');
        $('#sidenavsales').removeClass('active');
        $('#sidenavsettings').removeClass('active');
        $('#sidenavstocktake').removeClass('active');
        $('#sidenavpayroll').removeClass('active');
        $('#sidenavseedtosale').removeClass('active');
        $('#sidenavshipping').removeClass('active');
        $('#sidenavreceipt').removeClass('active');
        $('#sidenavfixedAssets').removeClass('active');
        $('#sidenavdelivery').removeClass('active');
        $('.collapse').collapse('hide');
      } else if ((currentLoc == "/salesoverview") ||
        (currentLoc == "/quotecard") || (currentLoc == "/quoteslist") ||
        (currentLoc == "/salesordercard") || (currentLoc == "/salesorderslist") ||
        (currentLoc == "/invoicetemp") || (currentLoc == "/refundcard") ||
        (currentLoc == "/invoicelist") || (currentLoc == "/refundlist") || (currentLoc == "/invoicelistBO")) {
        $('#sidenavaccounts').removeClass('active');
        $('#sidenavbanking').removeClass('active');
        $('#sidenavdashbaord').removeClass('active');
        $('#sidenavdashbaordexe').removeClass('active');
        $('#sidenavdashbaordsales').removeClass('active');
        $('#sidenavdashbaordsalesmanager').removeClass('active');
        $('#sidenavdashbaordmy').removeClass('active');
        $('#sidenavmanufacturing').removeClass('active');
        $('#sidenavappointment').removeClass('active');
        $('#sidenavcontacts').removeClass('active');
        $('#sidenavcrm').removeClass('active');
        $('#sidenavinventory').removeClass('active');
        $('#sidenavpayments').removeClass('active');
        $('#sidenavpurchases').removeClass('active');
        $('#sidenavreports, #sidenavreports2').removeClass('active');
        $('#sidenavsales').addClass('active');
        $('#sidenavsettings').removeClass('active');
        $('#sidenavstocktake').removeClass('active');
        $('#sidenavpayroll').removeClass('active');
        $('#sidenavseedtosale').removeClass('active');
        $('#sidenavshipping').removeClass('active');
        $('#sidenavreceipt').removeClass('active');
        $('#sidenavfixedAssets').removeClass('active');
        $('#sidenavdelivery').removeClass('active');
        $('.collapse').collapse('hide');
      } else if ((currentLoc == "/settings") ||
        (currentLoc == "/accesslevel") || (currentLoc == "/companyappsettings") || (currentLoc == "/organisationsettings") ||
        (currentLoc == "/taxratesettings") || (currentLoc == "/subtaxsettings") || (currentLoc == "/currenciessettings") ||
        (currentLoc == "/departmentSettings") || (currentLoc == "/termsettings") ||
        (currentLoc == "/paymentmethodSettings")) {
        $('#sidenavaccounts').removeClass('active');
        $('#sidenavbanking').removeClass('active');
        $('#sidenavdashbaord ').removeClass('active');
        $('#sidenavdashbaordexe').removeClass('active');
        $('#sidenavdashbaordsales').removeClass('active');
        $('#sidenavdashbaordsalesmanager').removeClass('active');
        $('#sidenavdashbaordmy').removeClass('active');
        $('#sidenavmanufacturing').removeClass('active');
        $('#sidenavappointment').removeClass('active');
        $('#sidenavcontacts').removeClass('active');
        $('#sidenavcrm').removeClass('active');
        $('#sidenavinventory').removeClass('active');
        $('#sidenavpayments').removeClass('active');
        $('#sidenavpurchases').removeClass('active');
        $('#sidenavreports, #sidenavreports2').removeClass('active');
        $('#sidenavsales').removeClass('active');
        $('#sidenavsettings').addClass('active');
        $('#sidenavstocktake').removeClass('active');
        $('#sidenavpayroll').removeClass('active');
        $('#sidenavseedtosale').removeClass('active');
        $('#sidenavshipping').removeClass('active');
        $('#sidenavreceipt').removeClass('active');
        $('#sidenavfixedAssets').removeClass('active');
        $('#sidenavdelivery').removeClass('active');
        // $('.collapse').collapse('hide');
      } else if ((currentLoc == "/timesheet") || (currentLoc == "/adpapi") ||
        (currentLoc == "/squareapi") || (currentLoc == "/employeetimeclock") || (currentLoc == "/payrolloverview")) {
        $('#sidenavaccounts').removeClass('active');
        $('#sidenavbanking').removeClass('active');
        $('#sidenavdashbaord').removeClass('active');
        $('#sidenavdashbaordexe').removeClass('active');
        $('#sidenavdashbaordsales').removeClass('active');
        $('#sidenavdashbaordsalesmanager').removeClass('active');
        $('#sidenavdashbaordmy').removeClass('active');
        $('#sidenavmanufacturing').removeClass('active');
        $('#sidenavappointment').removeClass('active');
        $('#sidenavcontacts').removeClass('active');
        $('#sidenavcrm').removeClass('active');
        $('#sidenavinventory').removeClass('active');
        $('#sidenavpayments').removeClass('active');
        $('#sidenavpurchases').removeClass('active');
        $('#sidenavreports, #sidenavreports2').removeClass('active');
        $('#sidenavsales').removeClass('active');
        $('#sidenavsettings').removeClass('active');
        $('#sidenavstocktake').removeClass('active');
        $('#sidenavpayroll').addClass('active');
        $('#sidenavseedtosale').removeClass('active');
        $('#sidenavshipping').removeClass('active');
        $('#sidenavreceipt').removeClass('active');
        $('#sidenavfixedAssets').removeClass('active');
        $('#sidenavdelivery').removeClass('active');
        $('.collapse').collapse('hide');
      } else if ((currentLoc == "/stsdashboard") || (currentLoc == "/stsplants") ||
        (currentLoc == "/stsharvests") || (currentLoc == "/stspackages") ||
        (currentLoc == "/ststransfers") || (currentLoc == "/stsoverviews") ||
        (currentLoc == "/stssettings")
      ) {
        $('#sidenavaccounts').removeClass('active');
        $('#sidenavbanking').removeClass('active');
        $('#sidenavdashbaord').removeClass('active');
        $('#sidenavdashbaordexe').removeClass('active');
        $('#sidenavdashbaordsales').removeClass('active');
        $('#sidenavdashbaordsalesmanager').removeClass('active');
        $('#sidenavdashbaordmy').removeClass('active');
        $('#sidenavmanufacturing').removeClass('active');
        $('#sidenavappointment ').removeClass('active');
        $('#sidenavcontacts').removeClass('active');
        $('#sidenavcrm ').removeClass('active');
        $('#sidenavinventory').removeClass('active');
        $('#sidenavpayments').removeClass('active');
        $('#sidenavpurchases').removeClass('active');
        $('#sidenavreports, #sidenavreports2').removeClass('active');
        $('#sidenavsales').removeClass('active');
        $('#sidenavsettings').removeClass('active');
        $('#sidenavstocktake ').removeClass('active');
        $('#sidenavpayroll').removeClass('active');
        $('#sidenavpayroll').removeClass('active');
        $('#sidenavseedtosale').addClass('active');
        $('#sidenavshipping').removeClass('active');
        $('#sidenavreceipt').removeClass('active');
        $('#sidenavfixedAssets').removeClass('active');
        $('#sidenavdelivery').removeClass('active');
        $('.collapse').collapse('hide');
      } else if ((currentLoc == "/vs1shipping")) {
        $('#sidenavaccounts').removeClass('active');
        $('#sidenavbanking').removeClass('active');
        $('#sidenavdashbaord').removeClass('active');
        $('#sidenavdashbaordexe').removeClass('active');
        $('#sidenavdashbaordsales').removeClass('active');
        $('#sidenavdashbaordsalesmanager').removeClass('active');
        $('#sidenavdashbaordmy').removeClass('active');
        $('#sidenavmanufacturing').removeClass('active');
        $('#sidenavappointment').removeClass('active');
        $('#sidenavcontacts').removeClass('active');
        $('#sidenavcrm').removeClass('active');
        $('#sidenavinventory').removeClass('active');
        $('#sidenavpayments').removeClass('active');
        $('#sidenavpurchases').removeClass('active');
        $('#sidenavreports, #sidenavreports2').removeClass('active');
        $('#sidenavsales').removeClass('active');
        $('#sidenavsettings').removeClass('active');
        $('#sidenavstocktake').removeClass('active');
        $('#sidenavpayroll').removeClass('active');
        $('#sidenavseedtosale').removeClass('active');
        $('#sidenavreceipt').removeClass('active');
        $('.collapse').collapse('hide');
        $('#sidenavfixedAssets').removeClass('active');
        $('#sidenavdelivery').removeClass('active');
        $('#sidenavshipping').addClass('active');
      } else if ((currentLoc == '/manufacturingoverview') || (currentLoc == "/processlist") || (currentLoc == '/workordercard') || (currentLoc == '/workorderlist') || (currentLoc == '/bomlist') || (currentLoc == '/bomsetupcard') || (currentLoc == '/productionplanner')) {
        $('#sidenavaccounts').removeClass('active');
        $('#sidenavbanking').removeClass('active');
        $('#sidenavdashbaord').removeClass('active');
        $('#sidenavdashbaordexe').removeClass('active');
        $('#sidenavdashbaordsales').removeClass('active');
        $('#sidenavdashbaordsalesmanager').removeClass('active');
        $('#sidenavdashbaordmy').removeClass('active');
        $('#sidenavmanufacturing').addClass('active');
        $('#sidenavappointment').removeClass('active');
        $('#sidenavcontacts').removeClass('active');
        $('#sidenavcrm').removeClass('active');
        $('#sidenavinventory').removeClass('active');
        $('#sidenavpayments').removeClass('active');
        $('#sidenavpurchases').removeClass('active');
        $('#sidenavreports, #sidenavreports2').removeClass('active');
        $('#sidenavsales').removeClass('active');
        $('#sidenavsettings').removeClass('active');
        $('#sidenavstocktake').removeClass('active');
        $('#sidenavpayroll').removeClass('active');
        $('#sidenavseedtosale').removeClass('active');
        $('#sidenavshipping').removeClass('active');
        $('#sidenavreceipt').removeClass('active');
        $('#sidenavfixedAssets').removeClass('active');
        $('#sidenavdelivery').removeClass('active');
        $('.collapse').collapse('hide');
      } else if ((currentLoc == "/fixedassetsoverview") || (currentLoc == "/fixedassetlist") || (currentLoc == "/serviceloglist")) {
        $('#sidenavaccounts').removeClass('active');
        $('#sidenavbanking').removeClass('active');
        $('#sidenavdashbaord').removeClass('active');
        $('#sidenavdashbaordexe').removeClass('active');
        $('#sidenavdashbaordsales').removeClass('active');
        $('#sidenavdashbaordsalesmanager').removeClass('active');
        $('#sidenavdashbaordmy').removeClass('active');
        $('#sidenavmanufacturing').removeClass('active');
        $('#sidenavappointment').removeClass('active');
        $('#sidenavcontacts').removeClass('active');
        $('#sidenavcrm').removeClass('active');
        $('#sidenavinventory').removeClass('active');
        $('#sidenavpayments').removeClass('active');
        $('#sidenavpurchases').removeClass('active');
        $('#sidenavreports, #sidenavreports2').removeClass('active');
        $('#sidenavsales').removeClass('active');
        $('#sidenavsettings').removeClass('active');
        $('#sidenavstocktake').removeClass('active');
        $('#sidenavpayroll').removeClass('active');
        $('#sidenavseedtosale').removeClass('active');
        $('#sidenavshipping').removeClass('active');
        $('#sidenavreceipt').removeClass('active');
        $('#sidenavdelivery').removeClass('active');
        $('#sidenavfixedAssets').addClass('active');
        // $('.collapse').collapse('hide');
      } else if ((currentLoc == "/deliveryOverview") || 
                  (currentLoc == "/depotlist") || 
                  (currentLoc == "/drivervehiclelist") || 
                  (currentLoc == "/drivervehiclelistcard") || 
                  (currentLoc == "/vehiclelist")) {
        console.log("/deliveryoverview");
        $('#sidenavaccounts').removeClass('active');
        $('#sidenavbanking').removeClass('active');
        $('#sidenavdashbaord').removeClass('active');
        $('#sidenavdashbaordexe').removeClass('active');
        $('#sidenavdashbaordsales').removeClass('active');
        $('#sidenavdashbaordsalesmanager').removeClass('active');
        $('#sidenavdashbaordmy').removeClass('active');
        $('#sidenavmanufacturing').removeClass('active');
        $('#sidenavappointment').removeClass('active');
        $('#sidenavcontacts').removeClass('active');
        $('#sidenavcrm').removeClass('active');
        $('#sidenavinventory').removeClass('active');
        $('#sidenavpayments').removeClass('active');
        $('#sidenavpurchases').removeClass('active');
        $('#sidenavreports, #sidenavreports2').removeClass('active');
        $('#sidenavsales').removeClass('active');
        $('#sidenavsettings').removeClass('active');
        $('#sidenavstocktake').removeClass('active');
        $('#sidenavpayroll').removeClass('active');
        $('#sidenavseedtosale').removeClass('active');
        $('#sidenavshipping').removeClass('active');
        $('#sidenavreceipt').removeClass('active');
        $('#sidenavfixedAssets').removeClass('active');
        $('#sidenavdelivery').addClass('active');
        // $('.collapse').collapse('hide');
      }
    }, 50);
  }

  templateObject.getSetSideNavFocus();

  let sidePanelSettings = localStorage.getItem('sidePanelSettings');
  if (sidePanelSettings === "openNav") {
    $(".active_page_content").css("text-align", "right");
  } else {
    $(".active_page_content").css("text-align", "inherit");
  }

  if (isSidePanel) {
    $("html").addClass("hasSideBar");
    $("body").addClass("hasSideBar");
  }

  if (LoggedDB !== null) {
    if (JSON.parse(isDashboard)) {
      templateObject.includeDashboard.set(true);
    }
    if (JSON.parse(isMain)) {
      templateObject.includeMain.set(true);
    }
    if (JSON.parse(isInventory)) {
      templateObject.includeInventory.set(true);
    }
    if (JSON.parse(isManufacturing)) {
      templateObject.includeManufacturing.set(true);
    }
    if (JSON.parse(isAccessLevels)) {
      templateObject.includeAccessLevels.set(true);
    }
    if (JSON.parse(isShipping)) {
      templateObject.includeShipping.set(true);
    }
    if (JSON.parse(isStockTransfer)) {
      templateObject.includeStockTransfer.set(true);
    }

    if (JSON.parse(isStockAdjustment)) {
      templateObject.includeStockAdjustment.set(true);
    }
    if (JSON.parse(isStockTake)) {
      templateObject.includeStockTake.set(true);
    }
    if (JSON.parse(isSales)) {
      templateObject.includeSales.set(true);
    }
    if (JSON.parse(isPurchases)) {
      templateObject.includePurchases.set(true);
    }

    if (JSON.parse(isExpenseClaims)) {
      templateObject.includeExpenseClaims.set(true);
    }

    if (JSON.parse(isFixedAssets)) {
      templateObject.includeFixedAssets.set(true);
    }

    if (JSON.parse(isPayments)) {
      templateObject.includePayments.set(true);
    }

    if (JSON.parse(isContacts)) {
      templateObject.includeContacts.set(true);
    }

    if (JSON.parse(isAccounts)) {
      templateObject.includeAccounts.set(true);
    }

    if (JSON.parse(isReports)) {
      templateObject.includeReports.set(true);
    }

    if (JSON.parse(isSettings)) {
      templateObject.includeSettings.set(true);
    }

    if (JSON.parse(isSeedToSale)) {
      templateObject.includeSeedToSale.set(true);
    }
    if (JSON.parse(isBanking)) {
      templateObject.includeBanking.set(true);
    }

    if (JSON.parse(isPayroll)) {
      templateObject.includePayroll.set(true);
    }

    if (JSON.parse(isTimesheetEntry)) {
      templateObject.includeTimesheetEntry.set(true);
    }

    if (JSON.parse(isClockOnOff)) {
      templateObject.includeClockOnOff.set(true);
    }

    if (!(isTimesheetEntry) && !(isClockOnOff)) {
      templateObject.includePayroll.set(false);
    }

    // if (!(isTimesheetEntry) && !(isShowTimesheet) && !(isTimesheetCreate) && !(isEditTimesheetHours) && (isClockOnOff)) {
    if (JSON.parse(isClockOnOff)) {
      templateObject.includePayrollClockOnOffOnly.set(true);
      // templateObject.includePayroll.set(false);
    }

    if (JSON.parse(isAppointmentScheduling)) {
      templateObject.includeAppointmentScheduling.set(true);
    }

    if (JSON.parse(isSidePanel)) {
      templateObject.isCloudSidePanelMenu.set(true);
      $("html").addClass("hasSideBar");
    }
    if (JSON.parse(isTopPanel)) {
      templateObject.isCloudTopPanelMenu.set(true);
    }

    if (JSON.parse(isCRM)) {
      templateObject.isCRM.set(true);
    }
    if (JSON.parse(isProductList)) {
      templateObject.isProductList.set(true);
    }
    if (JSON.parse(isNewProduct)) {
      templateObject.isNewProduct.set(true);
    }
    if (JSON.parse(isNewStockTransfer)) {
      templateObject.isNewStockTransfer.set(true);
    }
    if (JSON.parse(isExportProduct)) {
      templateObject.isExportProduct.set(true);
    }
    if (JSON.parse(isImportProduct)) {
      templateObject.isImportProduct.set(true);
    }
    if (JSON.parse(isStockonHandDemandChart)) {
      templateObject.isStockonHandDemandChart.set(true);
    }
    if (JSON.parse(isAppointmentSMS)) {
      templateObject.isAppointmentSMS.set(true);
    }
    if (JSON.parse(isSerialNumberList)) {
      templateObject.isSerialNumberList.set(true);
    }
  }

  let sidePanelToggle = localStorage.getItem('sidePanelToggle');
  if (launchAllocations) {
    $('#allocationModal').css('dispay', 'none');
    setTimeout(function () {
      $('#allocationModal').addClass('killAllocationPOP');
    }, 800);

  }

  let isGreenTrack = localStorage.getItem('isGreenTrack') || false;

  if (isGreenTrack == true) {
    $(".navbar").css("background-color", "#00a969");


    $(".collapse").css("background-color", "#3ddc97");
    $(".show").css("background-color", "#3ddc97");
    $("#collapse-0").css("background-color", "#3ddc97");
    $("#collapse-1").css("background-color", "#3ddc97");
    $("#collapse-2").css("background-color", "#3ddc97");
    $("#collapse-3").css("background-color", "#3ddc97");
    $("#collapse-4").css("background-color", "#3ddc97");
    $("#collapse-5").css("background-color", "#3ddc97");
    $("#collapse-6").css("background-color", "#3ddc97");
    $("#collapse-7").css("background-color", "#3ddc97");
    $("#collapse-8").css("background-color", "#3ddc97");
    $("#collapse-9").css("background-color", "#3ddc97");
    $("#collapse-10").css("background-color", "#3ddc97");
    $("#collapse-11").css("background-color", "#3ddc97");
    $("#collapse-12").css("background-color", "#3ddc97");

    $('.container-fluid .fa-bars').css("color", "#3ddc97");
    $('.btn-link').css("color", "#3ddc97");
    $('.input-group-append .btn-primary').css("background-color", "#3ddc97");
    $('.input-group-append .btn-primary').css("border-color", "#3ddc97");

    $(document).ready(function () {
      let checkGreenTrack = localStorage.getItem('isGreenTrack') || false;
      if (checkGreenTrack) {
        document.title = 'GreenTrack';
        $('head').append('<link rel="icon" type="image/png" sizes="16x16" href="icons/greentrackIcon.png">');
      } else {
        document.title = 'VS1 Cloud';
        $('head').append('<link rel="icon" type="image/png" sizes="16x16" href="icons/favicon-16x16.png">');
      }

    });
  }

  let currentDate = new Date();
  let hours = currentDate.getHours();
  let minutes = currentDate.getMinutes();
  let seconds = currentDate.getSeconds();
  let month = (currentDate.getMonth() + 1);
  let days = currentDate.getDate();

  if ((currentDate.getMonth() + 1) < 10) {
    month = "0" + (currentDate.getMonth() + 1);
  }

  if (currentDate.getDate() < 10) {
    days = "0" + currentDate.getDate();
  }
  let currenctTodayDate = currentDate.getFullYear() + "-" + month + "-" + days;

  if (sidePanelToggle) {
    if (sidePanelToggle === "toggled") {
      $("#sidenavbar").addClass("toggled");
    } else {
      $("#sidenavbar").removeClass("toggled");
    }
  }

  let isBalanceSheet = localStorage.getItem('cloudBalanceSheet');
  let isProfitLoss = localStorage.getItem('cloudProfitLoss');
  let isAgedReceivables = localStorage.getItem('cloudAgedReceivables');
  let isAgedReceivablesSummary = localStorage.getItem('cloudAgedReceivablesSummary');
  let isProductSalesReport = localStorage.getItem('cloudProductSalesReport');
  let isSalesReport = localStorage.getItem('cloudSalesReport');
  let isSalesSummaryReport = localStorage.getItem('cloudSalesSummaryReport');
  let isGeneralLedger = localStorage.getItem('cloudGeneralLedger');
  let isTaxSummaryReport = localStorage.getItem('cloudTaxSummaryReport');
  let isTrialBalance = localStorage.getItem('cloudTrialBalance');
  let is1099Transaction = localStorage.getItem('cloud1099Transaction');
  let isAgedPayables = localStorage.getItem('cloudAgedPayables');
  let isAgedPayablesSummary = localStorage.getItem('cloudAgedPayablesSummary');
  let isPurchaseReport = localStorage.getItem('cloudPurchaseReport');
  let isPurchaseSummaryReport = localStorage.getItem('cloudPurchaseSummaryReport');
  let isPrintStatement = localStorage.getItem('cloudPrintStatement');

  if (isProfitLoss == true) {
    templateObject.isProfitLoss.set(true);
  }
  if (isBalanceSheet == true) {
    templateObject.isBalanceSheet.set(true);
  }
  if (isAgedReceivables == true) {
    templateObject.isAgedReceivables.set(true);
  }
  if (isAgedReceivablesSummary == true) {
    templateObject.isAgedReceivablesSummary.set(true);
  }
  if (isProductSalesReport == true) {
    templateObject.isProductSalesReport.set(true);
  }
  if (isSalesReport == true) {
    templateObject.isSalesReport.set(true);
  }
  if (isSalesSummaryReport == true) {
    templateObject.isSalesSummaryReport.set(true);
  }
  if (isGeneralLedger == true) {
    templateObject.isGeneralLedger.set(true);
  }
  if (isTaxSummaryReport == true) {
    templateObject.isTaxSummaryReport.set(true);
  }
  if (isTrialBalance == true) {
    templateObject.isTrialBalance.set(true);
  }
  if (is1099Transaction == true) {
    templateObject.is1099Transaction.set(true);
  }
  if (isAgedPayables == true) {
    templateObject.isAgedPayables.set(true);
  }
  if (isAgedPayablesSummary == true) {
    templateObject.isAgedPayablesSummary.set(true);
  }
  if (isPurchaseReport == true) {
    templateObject.isPurchaseReport.set(true);
  }
  if (isPurchaseSummaryReport == true) {
    templateObject.isPurchaseSummaryReport.set(true);
  }
  if (isPrintStatement == true) {
    templateObject.isPrintStatement.set(true);
  }
  const render = async () => {
    await getVS1Data("BalanceSheetReport").then(function (dataObject) {
      if (dataObject.length === 0) {
        isBalanceSheet = false;
      } else {
        isBalanceSheet = dataObject[0].data === "true";
        templateObject.isBalanceSheet.set(isBalanceSheet);
      }
    });

    // let isProfitLoss;
    await getVS1Data("ProfitLossReport").then(function (dataObject) {
      if (dataObject.length === 0) {
        isProfitLoss = false;
      } else {
        isProfitLoss = dataObject[0].data === 'true';
        templateObject.isProfitLoss.set(isProfitLoss);
      }
    });
    let isBankingReport;
    await getVS1Data("TFavReportBankingReport").then(function (dataObject) {
      if (dataObject.length === 0) {
        isBankingReport = false;
      } else {
        isBankingReport = dataObject[0].data === 'true';
        templateObject.isBankingReport.set(isBankingReport);
      }
    });
    let isPLMonthly;
    await getVS1Data("PLMonthlyReport").then(function (dataObject) {
      if (dataObject.length === 0) {
        isPLMonthly = false;
      } else {
        isPLMonthly = dataObject[0].data === 'true';
        templateObject.isPLMonthly.set(isPLMonthly);
      }
    });
    let isPLQuarterly;
    await getVS1Data("PLQuarterlyReport").then(function (dataObject) {
      if (dataObject.length === 0) {
        isPLQuarterly = false;
      } else {
        isPLQuarterly = dataObject[0].data === 'true';
        templateObject.isPLQuarterly.set(isPLQuarterly);
      }
    });
    let isPLYearly;
    await getVS1Data("PLYearlyReport").then(function (dataObject) {
      if (dataObject.length === 0) {
        isPLYearly = false;
      } else {
        isPLYearly = dataObject[0].data === 'true';
        templateObject.isPLYearly.set(isPLYearly);
      }
    });
    let isPLYTD;
    await getVS1Data("PLYTDReport").then(function (dataObject) {
      if (dataObject.length === 0) {
        isPLYTD = false;
      } else {
        isPLYTD = dataObject[0].data === 'true';
        templateObject.isPLYTD.set(isPLYTD);
      }
    });
    let isJobSalesSummary;
    await getVS1Data("JobSalesSummaryReport").then(function (dataObject) {
      if (dataObject.length === 0) {
        isJobSalesSummary = false;
      } else {
        isJobSalesSummary = dataObject[0].data === 'true';
        templateObject.isJobSalesSummary.set(isJobSalesSummary);
      }
    });
    // let isAgedReceivables;
    await getVS1Data("AgedReceivablesReport").then(function (dataObject) {
      if (dataObject.length === 0) {
        isAgedReceivables = false;
      } else {
        isAgedReceivables = dataObject[0].data === 'true';
        templateObject.isAgedReceivables.set(isAgedReceivables);
      }
    });
    // let isAgedReceivablesSummary;
    await getVS1Data("AgedReceivablesSummaryReport").then(function (dataObject) {
      if (dataObject.length === 0) {
        isAgedReceivablesSummary = false;
      } else {
        isAgedReceivablesSummary = dataObject[0].data === 'true';
        templateObject.isAgedReceivablesSummary.set(isAgedReceivablesSummary);
      }
    });
    // let isProductSalesReport;
    await getVS1Data("ProductSalesReport").then(function (dataObject) {
      if (dataObject.length === 0) {
        isProductSalesReport = false;
      } else {
        isProductSalesReport = dataObject[0].data === 'true';
        templateObject.isProductSalesReport.set(isProductSalesReport);
      }
    });
    // let isSalesReport;
    await getVS1Data("SalesReport").then(function (dataObject) {
      if (dataObject.length === 0) {
        isSalesReport = false;
      } else {
        isSalesReport = dataObject[0].data === 'true';
        templateObject.isSalesReport.set(isSalesReport);
      }
    });
    let isJobProfitReport;
    await getVS1Data("JobProfitReport").then(function (dataObject) {
      if (dataObject.length === 0) {
        isJobProfitReport = false;
      } else {
        isJobProfitReport = dataObject[0].data === 'true';
        templateObject.isJobProfitReport.set(isJobProfitReport);
      }
    });
    let isSupplierDetails;
    await getVS1Data("SupplierDetailsReport").then(function (dataObject) {
      if (dataObject.length === 0) {
        isSupplierDetails = false;
      } else {
        isSupplierDetails = dataObject[0].data === 'true';
        templateObject.isSupplierDetails.set(isSupplierDetails);
      }
    });
    let isSupplierProduct;
    await getVS1Data("SupplierProductReport").then(function (dataObject) {
      if (dataObject.length === 0) {
        isSupplierProduct = false;
      } else {
        isSupplierProduct = dataObject[0].data === 'true';
        templateObject.isSupplierProduct.set(isSupplierProduct);
      }
    });
    let isCustomerDetails;
    await getVS1Data("CustomerDetailsReport").then(function (dataObject) {
      if (dataObject.length === 0) {
        isCustomerDetails = false;
      } else {
        isCustomerDetails = dataObject[0].data === 'true';
        templateObject.isCustomerDetails.set(isCustomerDetails);
      }
    });
    let isCustomerSummary;
    await getVS1Data("CustomerSummaryReport").then(function (dataObject) {
      if (dataObject.length === 0) {
        isCustomerSummary = false;
      } else {
        isCustomerSummary = dataObject[0].data === 'true';
        templateObject.isCustomerSummary.set(isCustomerSummary);
      }
    });
    let isLotReport;
    await getVS1Data("LotReport").then(function (dataObject) {
      if (dataObject.length === 0) {
        isLotReport = false;
      } else {
        isLotReport = dataObject[0].data === 'true';
        templateObject.isLotReport.set(isLotReport);
      }
    });
    let isStockValue;
    await getVS1Data("StockValueReport").then(function (dataObject) {
      if (dataObject.length === 0) {
        isStockValue = false;
      } else {
        isStockValue = dataObject[0].data === 'true';

        templateObject.isStockValue.set(isStockValue);
      }
    });
    let isStockQuantity;
    await getVS1Data("StockQuantityReport").then(function (dataObject) {
      if (dataObject.length === 0) {
        isStockQuantity = false;
      } else {
        isStockQuantity = dataObject[0].data === 'true';

        templateObject.isStockQuantity.set(isStockQuantity);
      }
    });
    let isStockMovementReport;
    await getVS1Data("StockMovementReport").then(function (dataObject) {
      if (dataObject.length === 0) {
        isStockMovementReport = false;
      } else {
        isStockMovementReport = dataObject[0].data === 'true';

        templateObject.isStockMovementReport.set(isStockMovementReport);
      }
    });
    let isClockedHourReport;
    await getVS1Data("ClockedHourReport").then(function (dataObject) {
      if (dataObject.length === 0) {
        isClockedHourReport = false;
      } else {
        isClockedHourReport = dataObject[0].data === 'true';

        templateObject.isClockedHourReport.set(isClockedHourReport);
      }
    });
    let isPayrollHistoryReport;
    await getVS1Data("PayrollHistoryReport").then(function (dataObject) {
      if (dataObject.length === 0) {
        isPayrollHistoryReport = false;
      } else {
        isPayrollHistoryReport = dataObject[0].data === 'true';

        templateObject.isPayrollHistoryReport.set(isPayrollHistoryReport);
      }
    });
    let isForeignExchangeHistoryList;
    await getVS1Data("ForeignExchangeHistoryListReport").then(function (dataObject) {
      if (dataObject.length === 0) {
        isForeignExchangeHistoryList = false;
      } else {
        isForeignExchangeHistoryList = dataObject[0].data === 'true';

        templateObject.isForeignExchangeHistoryList.set(isForeignExchangeHistoryList);
      }
    });
    let isForeignExchangeList;
    await getVS1Data("ForeignExchangeListReport").then(function (dataObject) {
      if (dataObject.length === 0) {
        isForeignExchangeList = false;
      } else {
        isForeignExchangeList = dataObject[0].data === 'true';

        templateObject.isForeignExchangeList.set(isForeignExchangeList);
      }
    });
    // let isSalesSummaryReport;
    await getVS1Data("SalesSummaryReport").then(function (dataObject) {
      if (dataObject.length === 0) {
        isSalesSummaryReport = false;
      } else {
        isSalesSummaryReport = dataObject[0].data === 'true';

        templateObject.isSalesSummaryReport.set(isSalesSummaryReport);
      }
    });
    // let isGeneralLedger;
    await getVS1Data("GeneralLedgerReport").then(function (dataObject) {
      if (dataObject.length === 0) {
        isGeneralLedger = false;
      } else {
        isGeneralLedger = dataObject[0].data === 'true';

        templateObject.isGeneralLedger.set(isGeneralLedger);
      }
    });
    // let isTaxSummaryReport;
    await getVS1Data("TaxSummaryReport").then(function (dataObject) {
      if (dataObject.length === 0) {
        isTaxSummaryReport = false;
      } else {
        isTaxSummaryReport = dataObject[0].data === 'true';

        templateObject.isTaxSummaryReport.set(isTaxSummaryReport);
      }
    });
    // let isTrialBalance;
    await getVS1Data("TrialBalanceReport").then(function (dataObject) {
      if (dataObject.length === 0) {
        isTrialBalance = false;
      } else {
        isTrialBalance = dataObject[0].data === 'true';

        templateObject.isTrialBalance.set(isTrialBalance);
      }
    });
    let isTimeSheetSummary;
    await getVS1Data("TimeSheetSummaryReport").then(function (dataObject) {
      if (dataObject.length === 0) {
        isTimeSheetSummary = false;
      } else {
        isTimeSheetSummary = dataObject[0].data === 'true'
        templateObject.isTimeSheetSummary.set(isTimeSheetSummary);
      }
    });
    let isPayrollLeaveAccrued;
    await getVS1Data("PayrollLeaveAccruedReport").then(function (dataObject) {
      if (dataObject.length === 0) {
        isPayrollLeaveAccrued = false;
      } else {
        isPayrollLeaveAccrued = dataObject[0].data === 'true';

        templateObject.isPayrollLeaveAccrued.set(isPayrollLeaveAccrued);
      }
    });
    let isPayrollLeaveTaken;
    await getVS1Data("PayrollLeaveTakenReport").then(function (dataObject) {
      if (dataObject.length === 0) {
        isPayrollLeaveTaken = false;
      } else {
        isPayrollLeaveTaken = dataObject[0].data === 'true';

        templateObject.isPayrollLeaveTaken.set(isPayrollLeaveTaken);
      }
    });
    let isSerialNumberReport;
    await getVS1Data("SerialNumberReport").then(function (dataObject) {
      if (dataObject.length === 0) {
        isSerialNumberReport = false;
      } else {
        isSerialNumberReport = dataObject[0].data === 'true'
        templateObject.isSerialNumberReport.set(isSerialNumberReport);
      }
    });
    // let is1099Transaction;
    await getVS1Data("1099TransactionReport").then(function (dataObject) {
      if (dataObject.length === 0) {
        is1099Transaction = false;
      } else {
        is1099Transaction = dataObject[0].data === 'true';

        templateObject.is1099Transaction.set(is1099Transaction);
      }
    });
    let isAccountsLists;
    await getVS1Data("AccountsListsReport").then(function (dataObject) {
      if (dataObject.length === 0) {
        isAccountsLists = false;
      } else {
        isAccountsLists = dataObject[0].data === 'true';

        templateObject.isAccountsLists.set(isAccountsLists);
      }
    });
    let isBinLocations;
    await getVS1Data("BinLocationsReport").then(function (dataObject) {
      if (dataObject.length === 0) {
        isBinLocations = false;
      } else {
        isBinLocations = dataObject[0].data === 'true';

        templateObject.isBinLocations.set(isBinLocations);
      }
    });
    let isTransactionJournal;
    await getVS1Data("TransactionJournalReport").then(function (dataObject) {
      if (dataObject.length === 0) {
        isTransactionJournal = false;
      } else {
        isTransactionJournal = dataObject[0].data === 'true';

        templateObject.isTransactionJournal.set(isTransactionJournal);
      }
    });
    let isUnpaidBills;
    await getVS1Data("UnpaidBillsReport").then(function (dataObject) {
      if (dataObject.length === 0) {
        isUnpaidBills = false;
      } else {
        isUnpaidBills = dataObject[0].data === 'true';

        templateObject.isUnpaidBills.set(isUnpaidBills);
      }
    });
    let isUnpaidPO;
    await getVS1Data("UnpaidPOReport").then(function (dataObject) {
      if (dataObject.length === 0) {
        isUnpaidPO = false;
      } else {
        isUnpaidPO = dataObject[0].data === 'true';

        templateObject.isUnpaidPO.set(isUnpaidPO);
      }
    });
    let isBackOrderedPO;
    await getVS1Data("BackOrderedPOReport").then(function (dataObject) {
      if (dataObject.length === 0) {
        isBackOrderedPO = false;
      } else {
        isBackOrderedPO = dataObject[0].data === 'true';

        templateObject.isBackOrderedPO.set(isBackOrderedPO);
      }
    });
    let isSalesOrderConverted;
    await getVS1Data("SalesOrderConvertedReport").then(function (dataObject) {
      if (dataObject.length === 0) {
        isSalesOrderConverted = false;
      } else {
        isSalesOrderConverted = dataObject[0].data === 'true';

        templateObject.isSalesOrderConverted.set(isSalesOrderConverted);
      }
    });
    let isSalesOrderUnconverted;
    await getVS1Data("SalesOrderUnconvertedReport").then(function (dataObject) {
      if (dataObject.length === 0) {
        isSalesOrderUnconverted = false;
      } else {
        isSalesOrderUnconverted = dataObject[0].data === 'true';

        templateObject.isSalesOrderUnconverted.set(isSalesOrderUnconverted);
      }
    });
    let isPaymentMethodsList;
    await getVS1Data("PaymentMethodsListReport").then(function (dataObject) {
      if (dataObject.length === 0) {
        isPaymentMethodsList = false;
      } else {
        isPaymentMethodsList = dataObject[0].data === 'true';

        templateObject.isPaymentMethodsList.set(isPaymentMethodsList);
      }
    });
    let isBackOrderedInvoices;
    await getVS1Data("BackOrderedInvoicesReport").then(function (dataObject) {
      if (dataObject.length === 0) {
        isBackOrderedInvoices = false;
      } else {
        isBackOrderedInvoices = dataObject[0].data === 'true';

        templateObject.isBackOrderedInvoices.set(isBackOrderedInvoices);
      }
    });
    let isQuotesConverted;
    await getVS1Data("QuotesConvertedReport").then(function (dataObject) {
      if (dataObject.length === 0) {
        isQuotesConverted = false;
      } else {
        isQuotesConverted = dataObject[0].data === 'true';

        templateObject.isQuotesConverted.set(isQuotesConverted);
      }
    });
    let isQuotesUnconverted;
    await getVS1Data("QuotesUnconvertedReport").then(function (dataObject) {
      if (dataObject.length === 0) {
        isQuotesUnconverted = false;
      } else {
        isQuotesUnconverted = dataObject[0].data === 'true';

        templateObject.isQuotesUnconverted.set(isQuotesUnconverted);
      }
    });
    let isInvoicesPaid;
    await getVS1Data("InvoicesPaidReport").then(function (dataObject) {
      if (dataObject.length === 0) {
        isInvoicesPaid = false;
      } else {
        isInvoicesPaid = dataObject[0].data === 'true';

        templateObject.isInvoicesPaid.set(isInvoicesPaid);
      }
    });
    let isInvoicesUnpaid;
    await getVS1Data("InvoicesUnpaidReport").then(function (dataObject) {
      if (dataObject.length === 0) {
        isInvoicesUnpaid = false;
      } else {
        isInvoicesUnpaid = dataObject[0].data === 'true';

        templateObject.isInvoicesUnpaid.set(isInvoicesUnpaid);
      }
    });
    let isTimeSheetDetails;
    await getVS1Data("TimeSheetDetailsReport").then(function (dataObject) {
      if (dataObject.length === 0) {
        isTimeSheetDetails = false;
      } else {
        isTimeSheetDetails = dataObject[0].data === 'true';

        templateObject.isTimeSheetDetails.set(isTimeSheetDetails);
      }
    });
    let isChequeList;
    await getVS1Data("ChequeListReport").then(function (dataObject) {
      if (dataObject.length === 0) {
        isChequeList = false;
      } else {
        isChequeList = dataObject[0].data === 'true';

        templateObject.isChequeList.set(isChequeList);
      }
    });
    let isStockAdjustmentList;
    await getVS1Data("StockAdjustmentListReport").then(function (dataObject) {
      if (dataObject.length === 0) {
        isStockAdjustmentList = false;
      } else {
        isStockAdjustmentList = dataObject[0].data === 'true';

        templateObject.isStockAdjustmentList.set(isStockAdjustmentList);
      }
    });
    let isJournalEntryList;
    await getVS1Data("JournalEntryListReport").then(function (dataObject) {
      if (dataObject.length === 0) {
        isJournalEntryList = false;
      } else {
        isJournalEntryList = dataObject[0].data === 'true';

        templateObject.isJournalEntryList.set(isJournalEntryList);
      }
    });
    // let isAgedPayables;
    await getVS1Data("AgedPayablesReport").then(function (dataObject) {
      if (dataObject.length === 0) {
        isAgedPayables = false;
      } else {
        isAgedPayables = dataObject[0].data === 'true';

        templateObject.isAgedPayables.set(isAgedPayables);
      }
    });
    // let isAgedPayablesSummary;
    await getVS1Data("AgedPayablesSummaryReport").then(function (dataObject) {
      if (dataObject.length === 0) {
        isAgedPayablesSummary = false;
      } else {
        isAgedPayablesSummary = dataObject[0].data === 'true';

        templateObject.isAgedPayablesSummary.set(isAgedPayablesSummary);
      }
    });
    // let isPurchaseReport;
    await getVS1Data("PurchaseReport").then(function (dataObject) {
      if (dataObject.length === 0) {
        isPurchaseReport = false;
      } else {
        isPurchaseReport = dataObject[0].data === 'true';

        templateObject.isPurchaseReport.set(isPurchaseReport);
      }
    });
    // let isPurchaseSummaryReport;
    await getVS1Data("PurchaseSummaryReport").then(function (dataObject) {
      if (dataObject.length === 0) {
        isPurchaseSummaryReport = false;
      } else {
        isPurchaseSummaryReport = dataObject[0].data === 'true';

        templateObject.isPurchaseSummaryReport.set(isPurchaseSummaryReport);
      }
    });
    // let isPrintStatement;
    await getVS1Data("PrintStatementReport").then(function (dataObject) {
      if (dataObject.length === 0) {
        isPrintStatement = false;
      } else {
        isPrintStatement = dataObject[0].data === 'true';

        templateObject.isPrintStatement.set(isPrintStatement);
      }
    });
    let isExecutiveSummary;
    await getVS1Data("ExecutiveSummaryReport").then(function (dataObject) {
      if (dataObject.length === 0) {
        isExecutiveSummary = false;
      } else {
        isExecutiveSummary = dataObject[0].data === 'true';

        templateObject.isExecutiveSummary.set(isExecutiveSummary);
      }
    });
    let isCashReport;
    await getVS1Data("CashReport").then(function (dataObject) {
      if (dataObject.length === 0) {
        isCashReport = false;
      } else {
        isCashReport = dataObject[0].data === 'true';

        templateObject.isCashReport.set(isCashReport);
      }
    });
    let isProfitabilityReport;
    await getVS1Data("ProfitabilityReport").then(function (dataObject) {
      if (dataObject.length === 0) {
        isProfitabilityReport = false;
      } else {
        isProfitabilityReport = dataObject[0].data === "true";
        templateObject.isProfitabilityReport.set(isProfitabilityReport)
      }
    })
    let isPerformanceReport;
    await getVS1Data("PerformanceReport").then(function (dataObject) {
      if (dataObject.length === 0) {
        isPerformanceReport = false;
      } else {
        isPerformanceReport = dataObject[0].data === 'true';

        templateObject.isPerformanceReport.set(isPerformanceReport);
      }
    });
    let isBalanceSheetReport;
    await getVS1Data("BalanceSheetReports").then(function (dataObject) {
      if (dataObject.length === 0) {
        isBalanceSheetReport = false;
      } else {
        isBalanceSheetReport = dataObject[0].data === 'true';

        templateObject.isBalanceSheetReport.set(isBalanceSheetReport);
      }
    });
    let isIncomeReport;
    await getVS1Data("IncomeReport").then(function (dataObject) {
      if (dataObject.length === 0) {
        isIncomeReport = false;
      } else {
        isIncomeReport = dataObject[0].data === 'true';

        templateObject.isIncomeReport.set(isIncomeReport);
      }
    });
    let isPositionReport;
    await getVS1Data("PositionReport").then(function (dataObject) {
      if (dataObject.length === 0) {
        isPositionReport = false;
      } else {
        isPositionReport = dataObject[0].data === 'true';

        templateObject.isPositionReport.set(isPositionReport);
      }
    });

    let isBuildProfitability;
    await getVS1Data("BuildProfitabilityReport").then(function (dataObject) {
      if (dataObject.length === 0) {
        isBuildProfitability = false;
      } else {
        isBuildProfitability = dataObject[0].data === 'true';

        templateObject.isBuildProfitability.set(isBuildProfitability);
      }
    });

    let isProductionWorkSheet;
    await getVS1Data("ProductionWorksheetReport").then(function (dataObject) {
      if (dataObject.length === 0) {
        isProductionWorkSheet = false;
      } else {
        isProductionWorkSheet = dataObject[0].data === 'true';

        templateObject.isProductionWorkSheet.set(isProductionWorkSheet);
      }
    });

    let isWorkOrder;
    await getVS1Data("WorkOrderReport").then(function (dataObject) {
      if (dataObject.length === 0) {
        isWorkOrder = false;
      } else {
        isWorkOrder = dataObject[0].data === 'true';

        templateObject.isWorkOrder.set(isWorkOrder);
      }
    });

    await getVS1Data("TFavReportCompany").then(function (dataObject) {
      if (dataObject.length > 0) {
        templateObject.isCompanyAccountant.set(dataObject[0].data === 'true')

      }
    })

    await getVS1Data("TFavReportTrustee").then(function (dataObject) {
      if (dataObject.length > 0) {
        templateObject.isTrustee.set(dataObject[0].data === 'true')

      }
    })

    await getVS1Data("TFavReportFinancialStatement").then(function (dataObject) {
      if (dataObject.length > 0) {
        templateObject.isFinancialStatement.set(dataObject[0].data === 'true')

      }
    })

    await getVS1Data("TFavReportIndividual").then(function (dataObject) {
      if (dataObject.length > 0) {
        templateObject.isIndividual.set(dataObject[0].data === 'true')

      }
    })

    await getVS1Data("TFavReportPartnershipNonTrading").then(function (dataObject) {
      if (dataObject.length > 0) {
        templateObject.isPartnershipNonTrading.set(dataObject[0].data === 'true')

      }
    })

    await getVS1Data("TFavReportTrustNonTrading").then(function (dataObject) {
      if (dataObject.length > 0) {
        templateObject.isTrustNonTrading.set(dataObject[0].data === 'true')

      }
    })

    await getVS1Data("TFavReportSelfManagedSuperfund").then(function (dataObject) {
      if (dataObject.length > 0) {
        templateObject.isSelfManagedSuperfund.set(dataObject[0].data === 'true')

      }
    })

    await getVS1Data("TFavReportSingleDirector").then(function (dataObject) {
      if (dataObject.length > 0) {
        templateObject.isSingleDirector.set(dataObject[0].data === 'true')

      }
    })

    await getVS1Data("TFavReportSoleTraderNonTrading").then(function (dataObject) {
      if (dataObject.length > 0) {
        templateObject.isSoleTraderNonTrading.set(dataObject[0].data === 'true')

      }
    })

    await getVS1Data("TFavReportTrust").then(function (dataObject) {
      if (dataObject.length > 0) {
        templateObject.isTrust.set(dataObject[0].data === 'true')

      }
    })

    await getVS1Data("TFavSupplierList").then(function (dataObject) {
      if (dataObject.length > 0) {
        templateObject.isSupplierList.set(dataObject[0].data === 'true')

      }
    })

    await getVS1Data("TFavSupplierSummaryReport").then(function (dataObject) {
      if (dataObject.length > 0) {
        templateObject.isSupplierSummaryReport.set(dataObject[0].data === 'true')

      }
    })
  }

  if (localStorage.getItem('vs1companyBankAccountName') === localStorage.getItem('VS1Accountant'))
    templateObject.isPrimaryAccountant.set(true)
  // let isBalanceSheet;
  render().then(e => setTimeout(() => {
    init();
  }, 1000)).catch(e => {
    setTimeout(() => {
      init();
    }, 1000)
  });

  const accountantList = [];

  templateObject.getAccountantList = function () {
    getVS1Data('TReportsAccountantsCategory').then(function (dataObject) {
      let data = JSON.parse(dataObject[0].data);
      var dataInfo = {
        id: data.Id || '',
        firstname: data.FirstName || '-',
        lastname: data.LastName || '-',
        companyname: data.CompanyName || '-',
        address: data.Address || '-',
        towncity: data.TownCity || '-',
        postalzip: data.PostalZip || '-',
        stateregion: data.StateRegion || '-',
        country: data.Country || '-',
      };
      accountantList.push(dataInfo);
      templateObject.accountantList.set(accountantList);
    })
      .catch(function (err) {
      });
  }
  templateObject.getAccountantList();

  $('.c-report-favourite-icon').on("click", function () {
    if (!$(this).hasClass('marked-star')) {
      $(this).addClass('marked-star');
    } else {
      $(this).removeClass('marked-star');
    }
  });
  // setReportBar();

});
Template.newsidenav.events({
  'click #sidebarToggleBtn': function (event) {

    let payload = "";
    let employeeId = parseInt(localStorage.getItem('mySessionEmployeeLoggedID')) || 0;
    if ($('#sidebar').hasClass("top")) {
      payload = {
        Name: "VS1_EmployeeAccess",
        Params: {
          VS1EmployeeAccessList: [{
            EmployeeId: parseInt(localStorage.getItem('mySessionEmployeeLoggedID')) || 0,
            formID: 7256,
            Access: 1
          }]
        }
      };
      sideBarService.updateVS1MenuConfig('SideMenu', employeeId);
      $('#sidebar').removeClass('top');
      $('#bodyContainer').removeClass('top');
      $('#sidebarToggleBtn .text').text('Top');
    } else {
      payload = {
        Name: "VS1_EmployeeAccess",
        Params: {
          VS1EmployeeAccessList: [{
            EmployeeId: parseInt(localStorage.getItem('mySessionEmployeeLoggedID')) || 0,
            formID: 7256,
            Access: 6
          }]
        }
      };
      sideBarService.updateVS1MenuConfig('TopMenu', employeeId);
      $('#sidebar').addClass('top');
      $('#bodyContainer').addClass('top');
      $('#sidebarToggleBtn .text').text('Side');
    }
    // var erpGet = erpDb();
    // var oPost = new XMLHttpRequest();

    // oPost.open("POST", URLRequest + erpGet.ERPIPAddress + ':' + erpGet.ERPPort + '/' + 'erpapi/VS1_Cloud_Task/Method?Name="VS1_EmployeeAccess"', true);
    // oPost.setRequestHeader("database", erpGet.ERPDatabase);
    // oPost.setRequestHeader("username", erpGet.ERPUsername);
    // oPost.setRequestHeader("password", erpGet.ERPPassword);
    // oPost.setRequestHeader("Accept", "application/json");
    // oPost.setRequestHeader("Accept", "application/html");
    // oPost.setRequestHeader("Content-type", "application/json");
    // var myString = '"JsonIn"' + ':' + JSON.stringify(payload);
    // oPost.send(myString);
    // oPost.onreadystatechange = function () {
    //   if (oPost.readyState == 4 && oPost.status == 200) {

    //   }
    // }
  },
  'click #sidenavaccessLevel': function (event) {
    window.open('#', '_self');
  },

  // 'mouseenter .accountsLi': function(event) {
  //     $('#accountsSubmenu').collapse('show');
  //     $('#appointmentsSubmenu').collapse('hide');
  //     $('#bankingSubmenu').collapse('hide');
  //     $('#contactsSubmenu').collapse('hide');
  //     $('#inventorySubmenu').collapse('hide');
  //     $('#paymentsSubmenu').collapse('hide');
  //     $('#payrollSubmenu').collapse('hide');
  //     $('#purchasesSubmenu').collapse('hide');
  //     $('#reportsSubmenu').collapse('hide');
  //     $('#salesSubmenu').collapse('hide');
  //     $('#seedToSaleSubmenu').collapse('hide');
  //     $('#settingsSubmenu').collapse('hide');
  // },
  // 'mouseleave .accountsLi': function(event) {
  //     $('.collapse').collapse('hide');
  // },
  // 'mouseenter .appointmentsLi': function(event) {
  //     $('#appointmentsSubmenu').collapse('show');
  //     $('#appointmentsSubmenu').collapse('hide');
  //     $('#bankingSubmenu').collapse('hide');
  //     $('#contactsSubmenu').collapse('hide');
  //     $('#inventorySubmenu').collapse('hide');
  //     $('#paymentsSubmenu').collapse('hide');
  //     $('#payrollSubmenu').collapse('hide');
  //     $('#purchasesSubmenu').collapse('hide');
  //     $('#reportsSubmenu').collapse('hide');
  //     $('#salesSubmenu').collapse('hide');
  //     $('#seedToSaleSubmenu').collapse('hide');
  //     $('#settingsSubmenu').collapse('hide');
  // },
  // 'mouseleave .appointmentsLi': function(event) {
  //     $('.collapse').collapse('hide');
  // },
  // 'mouseenter .bankingLi': function(event) {
  //     $('#bankingSubmenu').collapse('show');
  //     $('#appointmentsSubmenu').collapse('hide');
  //     $('#bankingSubmenu').collapse('hide');
  //     $('#contactsSubmenu').collapse('hide');
  //     $('#inventorySubmenu').collapse('hide');
  //     $('#paymentsSubmenu').collapse('hide');
  //     $('#payrollSubmenu').collapse('hide');
  //     $('#purchasesSubmenu').collapse('hide');
  //     $('#reportsSubmenu').collapse('hide');
  //     $('#salesSubmenu').collapse('hide');
  //     $('#seedToSaleSubmenu').collapse('hide');
  //     $('#settingsSubmenu').collapse('hide');
  // },
  // 'mouseleave .bankingLi': function(event) {
  //     $('.collapse').collapse('hide');
  // },
  // 'mouseenter .contactsLi': function(event) {
  //     $('#contactsSubmenu').collapse('show');
  //     $('#appointmentsSubmenu').collapse('hide');
  //     $('#bankingSubmenu').collapse('hide');
  //     $('#contactsSubmenu').collapse('hide');
  //     $('#inventorySubmenu').collapse('hide');
  //     $('#paymentsSubmenu').collapse('hide');
  //     $('#payrollSubmenu').collapse('hide');
  //     $('#purchasesSubmenu').collapse('hide');
  //     $('#reportsSubmenu').collapse('hide');
  //     $('#salesSubmenu').collapse('hide');
  //     $('#seedToSaleSubmenu').collapse('hide');
  //     $('#settingsSubmenu').collapse('hide');
  // },
  // 'mouseleave .contactsLi': function(event) {
  //     $('.collapse').collapse('hide');
  // },
  // 'mouseenter .inventoryLi': function(event) {
  //     $('#inventorySubmenu').collapse('show');
  //     $('#appointmentsSubmenu').collapse('hide');
  //     $('#bankingSubmenu').collapse('hide');
  //     $('#contactsSubmenu').collapse('hide');
  //     $('#inventorySubmenu').collapse('hide');
  //     $('#paymentsSubmenu').collapse('hide');
  //     $('#payrollSubmenu').collapse('hide');
  //     $('#purchasesSubmenu').collapse('hide');
  //     $('#reportsSubmenu').collapse('hide');
  //     $('#salesSubmenu').collapse('hide');
  //     $('#seedToSaleSubmenu').collapse('hide');
  //     $('#settingsSubmenu').collapse('hide');
  // },
  // 'mouseleave .inventoryLi': function(event) {
  //     $('.collapse').collapse('hide');
  // },
  // 'mouseenter .paymentsLi': function(event) {
  //     $('#paymentsSubmenu').collapse('show');
  //     $('#appointmentsSubmenu').collapse('hide');
  //     $('#bankingSubmenu').collapse('hide');
  //     $('#contactsSubmenu').collapse('hide');
  //     $('#inventorySubmenu').collapse('hide');
  //     $('#paymentsSubmenu').collapse('hide');
  //     $('#payrollSubmenu').collapse('hide');
  //     $('#purchasesSubmenu').collapse('hide');
  //     $('#reportsSubmenu').collapse('hide');
  //     $('#salesSubmenu').collapse('hide');
  //     $('#seedToSaleSubmenu').collapse('hide');
  //     $('#settingsSubmenu').collapse('hide');
  // },
  // 'mouseleave .paymentsLi': function(event) {
  //     $('.collapse').collapse('hide');
  // },
  // 'mouseenter .payrollLi': function(event) {
  //     $('#payrollSubmenu').collapse('show');
  //     $('#appointmentsSubmenu').collapse('hide');
  //     $('#bankingSubmenu').collapse('hide');
  //     $('#contactsSubmenu').collapse('hide');
  //     $('#inventorySubmenu').collapse('hide');
  //     $('#paymentsSubmenu').collapse('hide');
  //     $('#payrollSubmenu').collapse('hide');
  //     $('#purchasesSubmenu').collapse('hide');
  //     $('#reportsSubmenu').collapse('hide');
  //     $('#salesSubmenu').collapse('hide');
  //     $('#seedToSaleSubmenu').collapse('hide');
  //     $('#settingsSubmenu').collapse('hide');
  // },
  // 'mouseleave .payrollLi': function(event) {
  //     $('.collapse').collapse('hide');
  // },
  // 'mouseenter .purchasesLi': function(event) {
  //     $('#purchasesSubmenu').collapse('show');
  //     $('#appointmentsSubmenu').collapse('hide');
  //     $('#bankingSubmenu').collapse('hide');
  //     $('#contactsSubmenu').collapse('hide');
  //     $('#inventorySubmenu').collapse('hide');
  //     $('#paymentsSubmenu').collapse('hide');
  //     $('#payrollSubmenu').collapse('hide');
  //     $('#purchasesSubmenu').collapse('hide');
  //     $('#reportsSubmenu').collapse('hide');
  //     $('#salesSubmenu').collapse('hide');
  //     $('#seedToSaleSubmenu').collapse('hide');
  //     $('#settingsSubmenu').collapse('hide');
  // },
  // 'mouseleave .purchasesLi': function(event) {
  //     $('.collapse').collapse('hide');
  // },
  // 'mouseenter .reportsLi': function(event) {
  //     $('#reportsSubmenu').collapse('show');
  //     $('#appointmentsSubmenu').collapse('hide');
  //     $('#bankingSubmenu').collapse('hide');
  //     $('#contactsSubmenu').collapse('hide');
  //     $('#inventorySubmenu').collapse('hide');
  //     $('#paymentsSubmenu').collapse('hide');
  //     $('#payrollSubmenu').collapse('hide');
  //     $('#purchasesSubmenu').collapse('hide');
  //     $('#reportsSubmenu').collapse('hide');
  //     $('#salesSubmenu').collapse('hide');
  //     $('#seedToSaleSubmenu').collapse('hide');
  //     $('#settingsSubmenu').collapse('hide');
  // },
  // 'mouseleave .reportsLi': function(event) {
  //     $('.collapse').collapse('hide');
  // },
  // 'mouseenter .salesLi': function(event) {
  //     $('#salesSubmenu').collapse('show');
  //     $('#appointmentsSubmenu').collapse('hide');
  //     $('#bankingSubmenu').collapse('hide');
  //     $('#contactsSubmenu').collapse('hide');
  //     $('#inventorySubmenu').collapse('hide');
  //     $('#paymentsSubmenu').collapse('hide');
  //     $('#payrollSubmenu').collapse('hide');
  //     $('#purchasesSubmenu').collapse('hide');
  //     $('#reportsSubmenu').collapse('hide');
  //     $('#salesSubmenu').collapse('hide');
  //     $('#seedToSaleSubmenu').collapse('hide');
  //     $('#settingsSubmenu').collapse('hide');
  // },
  // 'mouseleave .salesLi': function(event) {
  //     $('.collapse').collapse('hide');
  // },
  // 'mouseenter .seedtosaleLi': function(event) {
  //     $('#seedToSaleSubmenu').collapse('show');
  //     $('#appointmentsSubmenu').collapse('hide');
  //     $('#bankingSubmenu').collapse('hide');
  //     $('#contactsSubmenu').collapse('hide');
  //     $('#inventorySubmenu').collapse('hide');
  //     $('#paymentsSubmenu').collapse('hide');
  //     $('#payrollSubmenu').collapse('hide');
  //     $('#purchasesSubmenu').collapse('hide');
  //     $('#reportsSubmenu').collapse('hide');
  //     $('#salesSubmenu').collapse('hide');
  //     $('#seedToSaleSubmenu').collapse('hide');
  //     $('#settingsSubmenu').collapse('hide');
  // },
  // 'mouseleave .seedtosaleLi': function(event) {
  //     $('.collapse').collapse('hide');
  // },
  // 'mouseenter .settingsLi': function(event) {
  //     $('#settingsSubmenu').collapse('show');
  //     $('#appointmentsSubmenu').collapse('hide');
  //     $('#bankingSubmenu').collapse('hide');
  //     $('#contactsSubmenu').collapse('hide');
  //     $('#inventorySubmenu').collapse('hide');
  //     $('#paymentsSubmenu').collapse('hide');
  //     $('#payrollSubmenu').collapse('hide');
  //     $('#purchasesSubmenu').collapse('hide');
  //     $('#reportsSubmenu').collapse('hide');
  //     $('#salesSubmenu').collapse('hide');
  //     $('#seedToSaleSubmenu').collapse('hide');
  //     $('#settingsSubmenu').collapse('hide');
  // },
  // 'mouseleave .settingsLi': function(event) {
  //     $('.collapse').collapse('hide');
  // },
  'click .sidenavaccounts': function (event) {
    event.preventDefault();
    FlowRouter.go('/accountsoverview');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();

  },
  'click #sidenavaccountsoverview': function (event) {
    event.preventDefault();
    FlowRouter.go('/accountsoverview');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();

  },
  'click #sidenavnewaccounts': function (event) {
    var url = window.location.pathname;
    if (url == "/bankrecon") {
      let reconHoldState = localStorage.getItem("reconHoldState") || "false";
      if (reconHoldState == "true") {
        swal({
          title: "Select OK to place Reconciliation On Hold",
          text: "You must Hold the Reconciliation to save the flagged items",
          type: 'warning',
          showCancelButton: true,
          confirmButtonText: 'OK'
        }).then((result) => {
          if (result.value) {
            $("#btnHold").trigger("click");
            localStorage.setItem("reconHoldState", "false");
          } else {
            if (FlowRouter.current().path == "/accountsoverview") {
              $('#addNewAccount').modal('show');
            } else {
              window.open('/accountsoverview#newaccount', '_self');
            }
          }
        });
      } else {
        if (FlowRouter.current().path == "/accountsoverview") {
          $('#addNewAccount').modal('show');
        } else {
          window.open('/accountsoverview#newaccount', '_self');
        }
      }
    } else {
      if (FlowRouter.current().path == "/accountsoverview") {
        $('#addNewAccount').modal('show');
      } else {
        window.open('/accountsoverview#newaccount', '_self');
      }
    }
  },
  'click #sidenavallocation': function (event) {

    if (FlowRouter.current().path == "/appointments") {
      $('#allocationModal').modal('show');
    } else {
      FlowRouter.go('/appointments#allocationModal');

    }
  },
  'click #sidenavpayroll': function (event) {
    $('.accountsLi').addClass('opacityNotActive');
    $('.appointmentsLi').addClass('opacityNotActive');
    $('.bankingLi').addClass('opacityNotActive');
    $('.contactsLi').addClass('opacityNotActive');
    $('.dashboardLi').addClass('opacityNotActive');
    $('.dashboardLiExe').addClass('opacityNotActive');
    $('.dashboardLiSales').addClass('opacityNotActive');
    $('.dashboardLiSalesManager').addClass('opacityNotActive');
    $('.manufacturingLi').addClass('opacityNotActive');
    $('.gsemployeesLi').addClass('opacityNotActive');
    $('.inventoryLi').addClass('opacityNotActive');
    $('.paymentsLi').addClass('opacityNotActive');
    $('.payrollLi').removeClass('opacityNotActive');
    $('.purchasesLi').addClass('opacityNotActive');
    $('.reportsLi').addClass('opacityNotActive');
    $('.reportsLi2').addClass('opacityNotActive');
    $('.salesLi').addClass('opacityNotActive');
    $('.seedtosaleLi').addClass('opacityNotActive');
    $('.settingsLi').addClass('opacityNotActive');
    $('.logoutLi').addClass('opacityNotActive');
    // $('#accountsSubmenu').collapse('hide');
    // $('#appointmentsSubmenu').collapse('hide');
    // $('#bankingSubmenu').collapse('hide');
    // $('#contactsSubmenu').collapse('hide');
    // $('#inventorySubmenu').collapse('hide');
    // $('#paymentsSubmenu').collapse('hide');
    // $('#manufacturingSubmenu').collapse('hide');
    // $('#purchasesSubmenu').collapse('hide');
    // $('#reportsSubmenu').collapse('hide');
    // $('#salesSubmenu').collapse('hide');
    // $('#seedToSaleSubmenu').collapse('hide');
    // $('#settingsSubmenu').collapse('hide');
    $('.submenuItem').collapse('hide');
  },
  'click .sidenavpayroll': function (event) {

    event.preventDefault();
    FlowRouter.go('/payrolloverview');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavPayEmployees': function (event) {

    event.preventDefault();
    FlowRouter.go('/payrun');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavbasreturnlist': function (event) {
    event.preventDefault();
    FlowRouter.go('/basreturnlist');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavbasreturn': function (event) {
    event.preventDefault();
    FlowRouter.go('/basreturn');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavvatreturnlist': function (event) {
    event.preventDefault();
    FlowRouter.go('/vatreturnlist');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavvatreturn': function (event) {
    event.preventDefault();
    FlowRouter.go('/vatreturn');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavjournalentry': function (event) {

    event.preventDefault();
    FlowRouter.go('/journalentrylist');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavnewjournalentry': function (event) {

    event.preventDefault();
    FlowRouter.go('/journalentrycard');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavbanking': function (event) {
    $('.accountsLi').addClass('opacityNotActive');
    $('.appointmentsLi').addClass('opacityNotActive');
    $('.bankingLi').removeClass('opacityNotActive');
    $('.contactsLi').addClass('opacityNotActive');
    $('.dashboardLi').addClass('opacityNotActive');
    $('.dashboardLiExe').addClass('opacityNotActive');
    $('.dashboardLiSales').addClass('opacityNotActive');
    $('.dashboardLiSalesManager').addClass('opacityNotActive');
    $('.manufacturingLi').addClass('opacityNotActive');
    $('.gsemployeesLi').addClass('opacityNotActive');
    $('.inventoryLi').addClass('opacityNotActive');
    $('.paymentsLi').addClass('opacityNotActive');
    $('.payrollLi').addClass('opacityNotActive');
    $('.purchasesLi').addClass('opacityNotActive');
    $('.reportsLi').addClass('opacityNotActive');
    $('.reportsLi2').addClass('opacityNotActive');
    $('.salesLi').addClass('opacityNotActive');
    $('.seedtosaleLi').addClass('opacityNotActive');
    $('.settingsLi').addClass('opacityNotActive');
    $('.logoutLi').addClass('opacityNotActive');
    // $('#accountsSubmenu').collapse('hide');
    // $('#appointmentsSubmenu').collapse('hide');
    // $('#manufacturingSubmenu').collapse('hide');
    // $('#contactsSubmenu').collapse('hide');
    // $('#inventorySubmenu').collapse('hide');
    // $('#paymentsSubmenu').collapse('hide');
    // $('#payrollSubmenu').collapse('hide');
    // $('#purchasesSubmenu').collapse('hide');
    // $('#reportsSubmenu').collapse('hide');
    // $('#salesSubmenu').collapse('hide');
    // $('#seedToSaleSubmenu').collapse('hide');
    // $('#settingsSubmenu').collapse('hide');
    $('.submenuItem').collapse('hide');
  },
  'click .sidenavbanking': function (event) {

    event.preventDefault();
    FlowRouter.go('/bankingoverview');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavcheque': function (event) {

    event.preventDefault();
    FlowRouter.go('/chequelist');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavreconciliation': function (event) {
    event.preventDefault();
    FlowRouter.go('/reconciliationlist');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavReconMacthingRulesList': function (event) {
    event.preventDefault();
    FlowRouter.go('/reconrulelist');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavNewReconMatchingRule': function (event) {
    event.preventDefault();
    FlowRouter.go('/newreconrule');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavStatementImportRulesList': function (event) {
    event.preventDefault();
    FlowRouter.go('/bankrulelist');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavNewStatementImportRule': function (event) {
    event.preventDefault();
    FlowRouter.go('/newbankrule');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavbankreconciliation': function (event) {
    window.open('/bankrecon', '_self');
  },
  'click #sidenaveft': function (event) {
    window.open('/eft', '_self');
  },
  'click #sidenavnewreconcile': function (event) {

    event.preventDefault();
    FlowRouter.go('/reconciliation');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavnewcheque': function (event) {

    event.preventDefault();
    FlowRouter.go('/chequecard');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavbalancesheet': function (event) {

    event.preventDefault();
    FlowRouter.go('/balancesheetreport');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidebarToggle': function (event) {
    var sideBarPanel = $("#sidenavbar").attr("class");

    if (sideBarPanel.indexOf("toggled") >= 0) {

      localStorage.setItem('sidePanelToggle', "toggled");
      $("#sidenavbar").addClass("toggled");

    } else {

      localStorage.setItem('sidePanelToggle', "");
      ("#sidenavbar").removeClass("toggled");

    }



  },
  'click #sidenavcontacts': function (event) {
    $('.accountsLi').addClass('opacityNotActive');
    $('.appointmentsLi').addClass('opacityNotActive');
    $('.bankingLi').addClass('opacityNotActive');
    $('.contactsLi').removeClass('opacityNotActive');
    $('.dashboardLi').addClass('opacityNotActive');
    $('.dashboardLiExe').addClass('opacityNotActive');
    $('.dashboardLiSales').addClass('opacityNotActive');
    $('.dashboardLiSalesManager').addClass('opacityNotActive');
    $('.manufacturingLi').addClass('opacityNotActive');
    $('.gsemployeesLi').addClass('opacityNotActive');
    $('.inventoryLi').addClass('opacityNotActive');
    $('.paymentsLi').addClass('opacityNotActive');
    $('.payrollLi').addClass('opacityNotActive');
    $('.purchasesLi').addClass('opacityNotActive');
    $('.reportsLi').addClass('opacityNotActive');
    $('.reportsLi2').addClass('opacityNotActive');
    $('.salesLi').addClass('opacityNotActive');
    $('.seedtosaleLi').addClass('opacityNotActive');
    $('.settingsLi').addClass('opacityNotActive');
    $('.logoutLi').addClass('opacityNotActive');
    // $('#accountsSubmenu').collapse('hide');
    // $('#appointmentsSubmenu').collapse('hide');
    // $('#bankingSubmenu').collapse('hide');
    // $('#contactsSubmenu').collapse('hide');
    // $('#manufacturingSubmenu').collapse('hide');
    // $('#inventorySubmenu').collapse('hide');
    // $('#paymentsSubmenu').collapse('hide');
    // $('#payrollSubmenu').collapse('hide');
    // $('#purchasesSubmenu').collapse('hide');
    // $('#reportsSubmenu').collapse('hide');
    // $('#salesSubmenu').collapse('hide');
    // $('#seedToSaleSubmenu').collapse('hide');
    // $('#settingsSubmenu').collapse('hide');
    $('.submenuItem').collapse('hide');
  },
  'click .sidenavcontacts': function (event) {

    event.preventDefault();
    FlowRouter.go('/contactoverview');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavdashbaord': function (event) {
    $('.accountsLi').addClass('opacityNotActive');
    $('.appointmentsLi').addClass('opacityNotActive');
    $('.bankingLi').addClass('opacityNotActive');
    $('.contactsLi').addClass('opacityNotActive');
    $('.dashboardLi').removeClass('opacityNotActive');
    $('.dashboardLiExe').addClass('opacityNotActive');
    $('.dashboardLiSales').addClass('opacityNotActive');
    $('.dashboardLiSalesManager').addClass('opacityNotActive');
    $('.manufacturingLi').addClass('opacityNotActive');
    $('.gsemployeesLi').addClass('opacityNotActive');
    $('.inventoryLi').addClass('opacityNotActive');
    $('.paymentsLi').addClass('opacityNotActive');
    $('.payrollLi').addClass('opacityNotActive');
    $('.purchasesLi').addClass('opacityNotActive');
    $('.reportsLi').addClass('opacityNotActive');
    $('.reportsLi2').addClass('opacityNotActive');
    $('.salesLi').addClass('opacityNotActive');
    $('.seedtosaleLi').addClass('opacityNotActive');
    $('.settingsLi').addClass('opacityNotActive');
    $('.logoutLi').addClass('opacityNotActive');
    // $('#accountsSubmenu').collapse('hide');
    // $('#appointmentsSubmenu').collapse('hide');
    // $('#bankingSubmenu').collapse('hide');
    // $('#contactsSubmenu').collapse('hide');
    // $('#inventorySubmenu').collapse('hide');
    // $('#paymentsSubmenu').collapse('hide');
    // $('#payrollSubmenu').collapse('hide');
    // $('#purchasesSubmenu').collapse('hide');
    // $('#reportsSubmenu').collapse('hide');
    // $('#salesSubmenu').collapse('hide');
    // $('#seedToSaleSubmenu').collapse('hide');
    // $('#settingsSubmenu').collapse('hide');
    // $('#manufacturingSubmenu').collapse('hide');
    $('.submenuItem').collapse('hide');
    event.preventDefault();
    var url = window.location.pathname;
    if (url == "/bankrecon") {
      let reconHoldState = localStorage.getItem("reconHoldState") || "false";
      if (reconHoldState == "true") {
        swal({
          title: "Select OK to place Reconciliation On Hold",
          text: "You must Hold the Reconciliation to save the flagged items",
          type: 'warning',
          showCancelButton: true,
          confirmButtonText: 'OK'
        }).then((result) => {
          if (result.value) {
            $("#btnHold").trigger("click");
            localStorage.setItem("reconHoldState", "false");
          } else {
            FlowRouter.go('/dashboard');
            let templateObject = Template.instance();
            templateObject.getSetSideNavFocus();
          }
        });
      } else {
        FlowRouter.go('/dashboard');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
      }
    } else {
      FlowRouter.go('/dashboard');
      let templateObject = Template.instance();
      templateObject.getSetSideNavFocus();
    }
  },
  'click #sidenavdashbaordexe': function (event) {
    $('.accountsLi').addClass('opacityNotActive');
    $('.appointmentsLi').addClass('opacityNotActive');
    $('.bankingLi').addClass('opacityNotActive');
    $('.contactsLi').addClass('opacityNotActive');
    $('.dashboardLi').addClass('opacityNotActive');
    $('.dashboardLiExe').removeClass('opacityNotActive');
    $('.dashboardLiSales').addClass('opacityNotActive');
    $('.dashboardLiSalesManager').addClass('opacityNotActive');
    $('.manufacturingLi').addClass('opacityNotActive');
    $('.gsemployeesLi').addClass('opacityNotActive');
    $('.inventoryLi').addClass('opacityNotActive');
    $('.paymentsLi').addClass('opacityNotActive');
    $('.payrollLi').addClass('opacityNotActive');
    $('.purchasesLi').addClass('opacityNotActive');
    $('.reportsLi').addClass('opacityNotActive');
    $('.reportsLi2').addClass('opacityNotActive');
    $('.salesLi').addClass('opacityNotActive');
    $('.seedtosaleLi').addClass('opacityNotActive');
    $('.settingsLi').addClass('opacityNotActive');
    $('.logoutLi').addClass('opacityNotActive');
    // $('#accountsSubmenu').collapse('hide');
    // $('#appointmentsSubmenu').collapse('hide');
    // $('#bankingSubmenu').collapse('hide');
    // $('#contactsSubmenu').collapse('hide');
    // $('#inventorySubmenu').collapse('hide');
    // $('#paymentsSubmenu').collapse('hide');
    // $('#payrollSubmenu').collapse('hide');
    // $('#purchasesSubmenu').collapse('hide');
    // $('#reportsSubmenu').collapse('hide');
    // $('#salesSubmenu').collapse('hide');
    // $('#seedToSaleSubmenu').collapse('hide');
    // $('#settingsSubmenu').collapse('hide');
    // $('#manufacturingSubmenu').collapse('hide');
    $('.submenuItem').collapse('hide');
    event.preventDefault();
    var url = window.location.pathname;
    if (url == "/bankrecon") {
      let reconHoldState = localStorage.getItem("reconHoldState") || "false";
      if (reconHoldState == "true") {
        swal({
          title: "Select OK to place Reconciliation On Hold",
          text: "You must Hold the Reconciliation to save the flagged items",
          type: 'warning',
          showCancelButton: true,
          confirmButtonText: 'OK'
        }).then((result) => {
          if (result.value) {
            $("#btnHold").trigger("click");
            localStorage.setItem("reconHoldState", "false");
          } else {
            FlowRouter.go('/dashboardexe');
            let templateObject = Template.instance();
            templateObject.getSetSideNavFocus();
          }
        });
      } else {
        FlowRouter.go('/dashboardexe');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
      }
    } else {
      FlowRouter.go('/dashboardexe');
      let templateObject = Template.instance();
      templateObject.getSetSideNavFocus();
    }
  },
  'click #sidenavdashbaordsalesmanager': function (event) {
    $('.accountsLi').addClass('opacityNotActive');
    $('.appointmentsLi').addClass('opacityNotActive');
    $('.bankingLi').addClass('opacityNotActive');
    $('.contactsLi').addClass('opacityNotActive');
    $('.dashboardLi').addClass('opacityNotActive');
    $('.dashboardLiExe').addClass('opacityNotActive');
    $('.dashboardLiSales').removeClass('opacityNotActive');
    $('.dashboardLiSalesManager').addClass('opacityNotActive');
    $('.manufacturingLi').addClass('opacityNotActive');
    $('.gsemployeesLi').addClass('opacityNotActive');
    $('.inventoryLi').addClass('opacityNotActive');
    $('.paymentsLi').addClass('opacityNotActive');
    $('.payrollLi').addClass('opacityNotActive');
    $('.purchasesLi').addClass('opacityNotActive');
    $('.reportsLi').addClass('opacityNotActive');
    $('.reportsLi2').addClass('opacityNotActive');
    $('.salesLi').addClass('opacityNotActive');
    $('.seedtosaleLi').addClass('opacityNotActive');
    $('.settingsLi').addClass('opacityNotActive');
    $('.logoutLi').addClass('opacityNotActive');
    // $('#accountsSubmenu').collapse('hide');
    // $('#appointmentsSubmenu').collapse('hide');
    // $('#bankingSubmenu').collapse('hide');
    // $('#contactsSubmenu').collapse('hide');
    // $('#inventorySubmenu').collapse('hide');
    // $('#paymentsSubmenu').collapse('hide');
    // $('#payrollSubmenu').collapse('hide');
    // $('#purchasesSubmenu').collapse('hide');
    // $('#reportsSubmenu').collapse('hide');
    // $('#salesSubmenu').collapse('hide');
    // $('#seedToSaleSubmenu').collapse('hide');
    // $('#settingsSubmenu').collapse('hide');
    // $('#manufacturingSubmenu').collapse('hide');
    $('.submenuItem').collapse('hide');
    event.preventDefault();
    var url = window.location.pathname;
    if (url == "/bankrecon") {
      let reconHoldState = localStorage.getItem("reconHoldState") || "false";
      if (reconHoldState == "true") {
        swal({
          title: "Select OK to place Reconciliation On Hold",
          text: "You must Hold the Reconciliation to save the flagged items",
          type: 'warning',
          showCancelButton: true,
          confirmButtonText: 'OK'
        }).then((result) => {
          if (result.value) {
            $("#btnHold").trigger("click");
            localStorage.setItem("reconHoldState", "false");
          } else {
            FlowRouter.go('/dashboardsalesmanager');
            let templateObject = Template.instance();
            templateObject.getSetSideNavFocus();
          }
        });
      } else {
        FlowRouter.go('/dashboardsalesmanager');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
      }
    } else {
      FlowRouter.go('/dashboardsalesmanager');
      let templateObject = Template.instance();
      templateObject.getSetSideNavFocus();
    }
  },
  'click #sidenavdashbaordsales': function (event) {
    $('.accountsLi').addClass('opacityNotActive');
    $('.appointmentsLi').addClass('opacityNotActive');
    $('.bankingLi').addClass('opacityNotActive');
    $('.contactsLi').addClass('opacityNotActive');
    $('.dashboardLi').addClass('opacityNotActive');
    $('.dashboardLiExe').addClass('opacityNotActive');
    $('.dashboardLiSales').addClass('opacityNotActive');
    $('.dashboardLiSalesManager').removeClass('opacityNotActive');
    $('.manufacturingLi').addClass('opacityNotActive');
    $('.gsemployeesLi').addClass('opacityNotActive');
    $('.inventoryLi').addClass('opacityNotActive');
    $('.paymentsLi').addClass('opacityNotActive');
    $('.payrollLi').addClass('opacityNotActive');
    $('.purchasesLi').addClass('opacityNotActive');
    $('.reportsLi').addClass('opacityNotActive');
    $('.reportsLi2').addClass('opacityNotActive');
    $('.salesLi').addClass('opacityNotActive');
    $('.seedtosaleLi').addClass('opacityNotActive');
    $('.settingsLi').addClass('opacityNotActive');
    $('.logoutLi').addClass('opacityNotActive');
    // $('#accountsSubmenu').collapse('hide');
    // $('#appointmentsSubmenu').collapse('hide');
    // $('#bankingSubmenu').collapse('hide');
    // $('#contactsSubmenu').collapse('hide');
    // $('#inventorySubmenu').collapse('hide');
    // $('#paymentsSubmenu').collapse('hide');
    // $('#payrollSubmenu').collapse('hide');
    // $('#purchasesSubmenu').collapse('hide');
    // $('#reportsSubmenu').collapse('hide');
    // $('#salesSubmenu').collapse('hide');
    // $('#seedToSaleSubmenu').collapse('hide');
    // $('#settingsSubmenu').collapse('hide');
    // $('#manufacturingSubmenu').collapse('hide');
    $('.submenuItem').collapse('hide');
    event.preventDefault();
    var url = window.location.pathname;
    if (url == "/bankrecon") {
      let reconHoldState = localStorage.getItem("reconHoldState") || "false";
      if (reconHoldState == "true") {
        swal({
          title: "Select OK to place Reconciliation On Hold",
          text: "You must Hold the Reconciliation to save the flagged items",
          type: 'warning',
          showCancelButton: true,
          confirmButtonText: 'OK'
        }).then((result) => {
          if (result.value) {
            $("#btnHold").trigger("click");
            localStorage.setItem("reconHoldState", "false");
          } else {
            FlowRouter.go('/dashboardsales');
            let templateObject = Template.instance();
            templateObject.getSetSideNavFocus();
          }
        });
      } else {
        FlowRouter.go('/dashboardsales');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
      }
    } else {
      FlowRouter.go('/dashboardsales');
      let templateObject = Template.instance();
      templateObject.getSetSideNavFocus();
    }
  },
  'click #sidenavdashbaordmy': function (event) {
    $('.accountsLi').addClass('opacityNotActive');
    $('.appointmentsLi').addClass('opacityNotActive');
    $('.bankingLi').addClass('opacityNotActive');
    $('.contactsLi').addClass('opacityNotActive');
    $('.dashboardLi').addClass('opacityNotActive');
    $('.dashboardLiExe').addClass('opacityNotActive');
    $('.dashboardLiSales').removeClass('opacityNotActive');
    $('.dashboardLiSalesManager').addClass('opacityNotActive');
    $('.manufacturingLi').addClass('opacityNotActive');
    $('.gsemployeesLi').addClass('opacityNotActive');
    $('.inventoryLi').addClass('opacityNotActive');
    $('.paymentsLi').addClass('opacityNotActive');
    $('.payrollLi').addClass('opacityNotActive');
    $('.purchasesLi').addClass('opacityNotActive');
    $('.reportsLi').addClass('opacityNotActive');
    $('.reportsLi2').addClass('opacityNotActive');
    $('.salesLi').addClass('opacityNotActive');
    $('.seedtosaleLi').addClass('opacityNotActive');
    $('.settingsLi').addClass('opacityNotActive');
    $('.logoutLi').addClass('opacityNotActive');
    // $('#accountsSubmenu').collapse('hide');
    // $('#appointmentsSubmenu').collapse('hide');
    // $('#bankingSubmenu').collapse('hide');
    // $('#contactsSubmenu').collapse('hide');
    // $('#inventorySubmenu').collapse('hide');
    // $('#paymentsSubmenu').collapse('hide');
    // $('#payrollSubmenu').collapse('hide');
    // $('#purchasesSubmenu').collapse('hide');
    // $('#reportsSubmenu').collapse('hide');
    // $('#salesSubmenu').collapse('hide');
    // $('#seedToSaleSubmenu').collapse('hide');
    // $('#settingsSubmenu').collapse('hide');
    // $('#manufacturingSubmenu').collapse('hide');
    $('.submenuItem').collapse('hide');
    event.preventDefault();
    var url = window.location.pathname;
    if (url == "/bankrecon") {
      let reconHoldState = localStorage.getItem("reconHoldState") || "false";
      if (reconHoldState == "true") {
        swal({
          title: "Select OK to place Reconciliation On Hold",
          text: "You must Hold the Reconciliation to save the flagged items",
          type: 'warning',
          showCancelButton: true,
          confirmButtonText: 'OK'
        }).then((result) => {
          if (result.value) {
            $("#btnHold").trigger("click");
            localStorage.setItem("reconHoldState", "false");
          } else {
            FlowRouter.go('/dashboardmy');
            let templateObject = Template.instance();
            templateObject.getSetSideNavFocus();
          }
        });
      } else {
        FlowRouter.go('/dashboardmy');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
      }
    } else {
      FlowRouter.go('/dashboardmy');
      let templateObject = Template.instance();
      templateObject.getSetSideNavFocus();
    }
  },
  'click #sidenavappointment': function (event) {
    $('.accountsLi').addClass('opacityNotActive');
    $('.appointmentsLi').removeClass('opacityNotActive');
    $('.bankingLi').addClass('opacityNotActive');
    $('.contactsLi').addClass('opacityNotActive');
    $('.dashboardLi').addClass('opacityNotActive');
    $('.dashboardLiExe').addClass('opacityNotActive');
    $('.dashboardLiSales').addClass('opacityNotActive');
    $('.dashboardLiSalesManager').addClass('opacityNotActive');
    $('.manufacturingLi').addClass('opacityNotActive');
    $('.gsemployeesLi').addClass('opacityNotActive');
    $('.inventoryLi').addClass('opacityNotActive');
    $('.paymentsLi').addClass('opacityNotActive');
    $('.payrollLi').addClass('opacityNotActive');
    $('.purchasesLi').addClass('opacityNotActive');
    $('.reportsLi').addClass('opacityNotActive');
    $('.reportsLi2').addClass('opacityNotActive');
    $('.salesLi').addClass('opacityNotActive');
    $('.seedtosaleLi').addClass('opacityNotActive');
    $('.settingsLi').addClass('opacityNotActive');
    $('.logoutLi').addClass('opacityNotActive');
    // $('#accountsSubmenu').collapse('hide');
    // $('#manufacturingSubmenu').collapse('hide');
    // $('#bankingSubmenu').collapse('hide');
    // $('#contactsSubmenu').collapse('hide');
    // $('#inventorySubmenu').collapse('hide');
    // $('#paymentsSubmenu').collapse('hide');
    // $('#payrollSubmenu').collapse('hide');
    // $('#purchasesSubmenu').collapse('hide');
    // $('#reportsSubmenu').collapse('hide');
    // $('#salesSubmenu').collapse('hide');
    // $('#seedToSaleSubmenu').collapse('hide');
    // $('#settingsSubmenu').collapse('hide');
    $('.submenuItem').collapse('hide');
  },
  'click .sidenavappointment': function (event) {
    event.preventDefault();
    FlowRouter.go('/appointments');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavappointmentList': function (event) {

    event.preventDefault();
    FlowRouter.go('/appointmentlist');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavappointmenttimeList': function (event) {

    event.preventDefault();
    FlowRouter.go('/appointmenttimelist');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavemployeesGreenTrack': function (event) {

    event.preventDefault();
    FlowRouter.go('/employeelist');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavfixedassets': function (event) {
    window.open('#', '_self');
  },
  'click #sidenavinventory': function (event) {
    $('.accountsLi').addClass('opacityNotActive');
    $('.appointmentsLi').addClass('opacityNotActive');
    $('.bankingLi').addClass('opacityNotActive');
    $('.contactsLi').addClass('opacityNotActive');
    $('.dashboardLi').addClass('opacityNotActive');
    $('.dashboardLiExe').addClass('opacityNotActive');
    $('.dashboardLiSales').addClass('opacityNotActive');
    $('.dashboardLiSalesManager').addClass('opacityNotActive');
    $('.manufacturingLi').addClass('opacityNotActive');
    $('.gsemployeesLi').addClass('opacityNotActive');
    $('.inventoryLi').removeClass('opacityNotActive');
    $('.paymentsLi').addClass('opacityNotActive');
    $('.payrollLi').addClass('opacityNotActive');
    $('.purchasesLi').addClass('opacityNotActive');
    $('.reportsLi').addClass('opacityNotActive');
    $('.reportsLi2').addClass('opacityNotActive');
    $('.salesLi').addClass('opacityNotActive');
    $('.seedtosaleLi').addClass('opacityNotActive');
    $('.settingsLi').addClass('opacityNotActive');
    $('.logoutLi').addClass('opacityNotActive');
    // $('#accountsSubmenu').collapse('hide');
    // $('#appointmentsSubmenu').collapse('hide');
    // $('#bankingSubmenu').collapse('hide');
    // $('#contactsSubmenu').collapse('hide');
    // $('#manufacturingSubmenu').collapse('hide');
    // $('#paymentsSubmenu').collapse('hide');
    // $('#payrollSubmenu').collapse('hide');
    // $('#purchasesSubmenu').collapse('hide');
    // $('#reportsSubmenu').collapse('hide');
    // $('#salesSubmenu').collapse('hide');
    // $('#seedToSaleSubmenu').collapse('hide');
    // $('#settingsSubmenu').collapse('hide');
    $('.submenuItem').collapse('hide');
  },
  'click .sidenavinventory': function (event) {

    event.preventDefault();
    FlowRouter.go('/inventorylist');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavnewinventory': function (event) {

    event.preventDefault();
    FlowRouter.go('/productview');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavmain': function (event) {
    window.open('#', '_self');
  },
  'click #sidenavmanufacturing': function (event) {
    var url = window.location.pathname;
    if (url == "/bankrecon") {
      let reconHoldState = localStorage.getItem("reconHoldState") || "false";
      if (reconHoldState == "true") {
        swal({
          title: "Select OK to place Reconciliation On Hold",
          text: "You must Hold the Reconciliation to save the flagged items",
          type: 'warning',
          showCancelButton: true,
          confirmButtonText: 'OK'
        }).then((result) => {
          if (result.value) {
            $("#btnHold").trigger("click");
            localStorage.setItem("reconHoldState", "false");
          } else {
            $('.accountsLi').addClass('opacityNotActive');
            $('.appointmentsLi').addClass('opacityNotActive');
            $('.bankingLi').addClass('opacityNotActive');
            $('.contactsLi').addClass('opacityNotActive');
            $('.dashboardLi').addClass('opacityNotActive');
            $('.dashboardLiExe').addClass('opacityNotActive');
            $('.dashboardLiSales').addClass('opacityNotActive');
            $('.dashboardLiSalesManager').addClass('opacityNotActive');
            $('.manufacturingLi').removeClass('opacityNotActive');
            $('.gsemployeesLi').addClass('opacityNotActive');
            $('.inventoryLi').addClass('opacityNotActive');
            $('.paymentsLi').addClass('opacityNotActive');
            $('.payrollLi').addClass('opacityNotActive');
            $('.purchasesLi').addClass('opacityNotActive');
            $('.reportsLi').addClass('opacityNotActive');
            $('.reportsLi2').addClass('opacityNotActive');
            $('.salesLi').addClass('opacityNotActive');
            $('.seedtosaleLi').addClass('opacityNotActive');
            $('.settingsLi').addClass('opacityNotActive');
            $('.logoutLi').addClass('opacityNotActive');
            $('#accountsSubmenu').collapse('hide');
            $('#appointmentsSubmenu').collapse('hide');
            $('#bankingSubmenu').collapse('hide');
            $('#contactsSubmenu').collapse('hide');
            $('#inventorySubmenu').collapse('hide');
            $('#paymentsSubmenu').collapse('hide');
            $('#payrollSubmenu').collapse('hide');
            $('#purchasesSubmenu').collapse('hide');
            $('#reportsSubmenu').collapse('hide');
            $('#salesSubmenu').collapse('hide');
            $('#seedToSaleSubmenu').collapse('hide');
            $('#settingsSubmenu').collapse('hide');
          }
        });
      } else {
        $('.accountsLi').addClass('opacityNotActive');
        $('.appointmentsLi').addClass('opacityNotActive');
        $('.bankingLi').addClass('opacityNotActive');
        $('.contactsLi').addClass('opacityNotActive');
        $('.dashboardLi').addClass('opacityNotActive');
        $('.dashboardLiExe').addClass('opacityNotActive');
        $('.dashboardLiSales').addClass('opacityNotActive');
        $('.dashboardLiSalesManager').addClass('opacityNotActive');
        $('.manufacturingLi').removeClass('opacityNotActive');
        $('.gsemployeesLi').addClass('opacityNotActive');
        $('.inventoryLi').addClass('opacityNotActive');
        $('.paymentsLi').addClass('opacityNotActive');
        $('.payrollLi').addClass('opacityNotActive');
        $('.purchasesLi').addClass('opacityNotActive');
        $('.reportsLi').addClass('opacityNotActive');
        $('.reportsLi2').addClass('opacityNotActive');
        $('.salesLi').addClass('opacityNotActive');
        $('.seedtosaleLi').addClass('opacityNotActive');
        $('.settingsLi').addClass('opacityNotActive');
        $('.logoutLi').addClass('opacityNotActive');
        $('#accountsSubmenu').collapse('hide');
        $('#appointmentsSubmenu').collapse('hide');
        $('#bankingSubmenu').collapse('hide');
        $('#contactsSubmenu').collapse('hide');
        $('#inventorySubmenu').collapse('hide');
        $('#paymentsSubmenu').collapse('hide');
        $('#payrollSubmenu').collapse('hide');
        $('#purchasesSubmenu').collapse('hide');
        $('#reportsSubmenu').collapse('hide');
        $('#salesSubmenu').collapse('hide');
        $('#seedToSaleSubmenu').collapse('hide');
        $('#settingsSubmenu').collapse('hide');
      }
    } else {
      $('.accountsLi').addClass('opacityNotActive');
      $('.appointmentsLi').addClass('opacityNotActive');
      $('.bankingLi').addClass('opacityNotActive');
      $('.contactsLi').addClass('opacityNotActive');
      $('.dashboardLi').addClass('opacityNotActive');
      $('.dashboardLiExe').addClass('opacityNotActive');
      $('.dashboardLiSales').addClass('opacityNotActive');
      $('.dashboardLiSalesManager').addClass('opacityNotActive');
      $('.manufacturingLi').removeClass('opacityNotActive');
      $('.gsemployeesLi').addClass('opacityNotActive');
      $('.inventoryLi').addClass('opacityNotActive');
      $('.paymentsLi').addClass('opacityNotActive');
      $('.payrollLi').addClass('opacityNotActive');
      $('.purchasesLi').addClass('opacityNotActive');
      $('.reportsLi').addClass('opacityNotActive');
      $('.reportsLi2').addClass('opacityNotActive');
      $('.salesLi').addClass('opacityNotActive');
      $('.seedtosaleLi').addClass('opacityNotActive');
      $('.settingsLi').addClass('opacityNotActive');
      $('.logoutLi').addClass('opacityNotActive');
      $('#accountsSubmenu').collapse('hide');
      $('#appointmentsSubmenu').collapse('hide');
      $('#bankingSubmenu').collapse('hide');
      $('#contactsSubmenu').collapse('hide');
      $('#inventorySubmenu').collapse('hide');
      $('#paymentsSubmenu').collapse('hide');
      $('#payrollSubmenu').collapse('hide');
      $('#purchasesSubmenu').collapse('hide');
      $('#reportsSubmenu').collapse('hide');
      $('#salesSubmenu').collapse('hide');
      $('#seedToSaleSubmenu').collapse('hide');
      $('#settingsSubmenu').collapse('hide');
    }
  },
  'click #sidenavpayments': function (event) {
    $('.accountsLi').addClass('opacityNotActive');
    $('.appointmentsLi').addClass('opacityNotActive');
    $('.bankingLi').addClass('opacityNotActive');
    $('.contactsLi').addClass('opacityNotActive');
    $('.dashboardLi').addClass('opacityNotActive');
    $('.dashboardLiExe').addClass('opacityNotActive');
    $('.dashboardLiSales').addClass('opacityNotActive');
    $('.dashboardLiSalesManager').addClass('opacityNotActive');
    $('.gsemployeesLi').addClass('opacityNotActive');
    $('.inventoryLi').addClass('opacityNotActive');
    $('.paymentsLi').removeClass('opacityNotActive');
    $('.payrollLi').addClass('opacityNotActive');
    $('.purchasesLi').addClass('opacityNotActive');
    $('.reportsLi').addClass('opacityNotActive');
    $('.reportsLi2').addClass('opacityNotActive');
    $('.salesLi').addClass('opacityNotActive');
    $('.seedtosaleLi').addClass('opacityNotActive');
    $('.settingsLi').addClass('opacityNotActive');
    $('.logoutLi').addClass('opacityNotActive');
    $('#accountsSubmenu').collapse('hide');
    $('#appointmentsSubmenu').collapse('hide');
    $('#bankingSubmenu').collapse('hide');
    $('#contactsSubmenu').collapse('hide');
    $('#inventorySubmenu').collapse('hide');
    $('#paymentsSubmenu').collapse('hide');
    $('#payrollSubmenu').collapse('hide');
    $('#purchasesSubmenu').collapse('hide');
    $('#reportsSubmenu').collapse('hide');
    $('#salesSubmenu').collapse('hide');
    $('#seedToSaleSubmenu').collapse('hide');
    $('#settingsSubmenu').collapse('hide');
  },
  'click #sidenavprocesses': function (event) {
    event.preventDefault();
    FlowRouter.go('/processlist');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavbomList': function (event) {
    event.preventDefault();
    FlowRouter.go('/bomlist');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavnewbom': function (event) {
    event.preventDefault();
    FlowRouter.go('/bomsetupcard');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavbuildprofitability': function (event) {
    event.preventDefault();
    FlowRouter.go('/buildcostreport');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavnewprocess': function (event) {
    event.preventDefault();
    FlowRouter.go('/processcard');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavmobileapp': function (event) {
    event.preventDefault();
    FlowRouter.go('/mobileapp');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavnewworkorder': function (event) {
    event.preventDefault();
    FlowRouter.go('/workordercard');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavnewworkorderlist': function (event) {
    event.preventDefault();
    FlowRouter.go('/workorderlist');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavReceipt': function (event) {
    event.preventDefault();
    FlowRouter.go('/receiptsoverview');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavnewReceipt': function (event) {
    event.preventDefault();
    FlowRouter.go("/receiptsoverview");
    $('#newReceiptModal').modal('show');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavTriGroup': function (event) {
    event.preventDefault();
    FlowRouter.go('/tripgroup');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavnewTriGroup': function (event) {
    event.preventDefault();
    FlowRouter.go("/tripgroup");
    $('#tripGroupModal').modal('show');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavReceiptCategory': function (event) {
    event.preventDefault();
    FlowRouter.go('/receiptcategory');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavnewReceiptCategory': function (event) {
    event.preventDefault();
    FlowRouter.go("/receiptcategory");
    $('#receiptCategoryModal').modal('show');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sideprocessclockonoff': function (event) {
    event.preventDefault();
    FlowRouter.go('/process_clock_list');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavmanifestlist': function (event) {
    event.preventDefault();
    FlowRouter.go('/manifestlist');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavoptimisedmaps': function (event) {
    event.preventDefault();
    FlowRouter.go('/optimizedmap');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavproductionplanner': function (event) {
    event.preventDefault();
    FlowRouter.go('/productionplanner');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click .sidenavpayments': function (event) {
    event.preventDefault();
    FlowRouter.go('/paymentoverview');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavpurchases': function (event) {
    $('.accountsLi').addClass('opacityNotActive');
    $('.appointmentsLi').addClass('opacityNotActive');
    $('.bankingLi').addClass('opacityNotActive');
    $('.contactsLi').addClass('opacityNotActive');
    $('.dashboardLi').addClass('opacityNotActive');
    $('.dashboardLiExe').addClass('opacityNotActive');
    $('.dashboardLiSales').addClass('opacityNotActive');
    $('.dashboardLiSalesManager').addClass('opacityNotActive');
    $('.gsemployeesLi').addClass('opacityNotActive');
    $('.inventoryLi').addClass('opacityNotActive');
    $('.paymentsLi').addClass('opacityNotActive');
    $('.payrollLi').addClass('opacityNotActive');
    $('.purchasesLi').removeClass('opacityNotActive');
    $('.reportsLi').addClass('opacityNotActive');
    $('.reportsLi2').addClass('opacityNotActive');
    $('.salesLi').addClass('opacityNotActive');
    $('.seedtosaleLi').addClass('opacityNotActive');
    $('.settingsLi').addClass('opacityNotActive');
    $('.logoutLi').addClass('opacityNotActive');
    $('#accountsSubmenu').collapse('hide');
    $('#appointmentsSubmenu').collapse('hide');
    $('#bankingSubmenu').collapse('hide');
    $('#contactsSubmenu').collapse('hide');
    $('#inventorySubmenu').collapse('hide');
    $('#paymentsSubmenu').collapse('hide');
    $('#payrollSubmenu').collapse('hide');
    // $('#purchasesSubmenu').collapse('hide');
    $('#reportsSubmenu').collapse('hide');
    $('#salesSubmenu').collapse('hide');
    $('#seedToSaleSubmenu').collapse('hide');
    $('#settingsSubmenu').collapse('hide');
  },
  'click .sidenavpurchases': function (event) {
    event.preventDefault();
    FlowRouter.go('/purchasesoverview');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavreports, #sidenavreports2': function (event) {
    $('.accountsLi').addClass('opacityNotActive');
    $('.appointmentsLi').addClass('opacityNotActive');
    $('.bankingLi').addClass('opacityNotActive');
    $('.contactsLi').addClass('opacityNotActive');
    $('.dashboardLi').addClass('opacityNotActive');
    $('.dashboardLiExe').addClass('opacityNotActive');
    $('.dashboardLiSales').addClass('opacityNotActive');
    $('.dashboardLiSalesManager').addClass('opacityNotActive');
    $('.gsemployeesLi').addClass('opacityNotActive');
    $('.inventoryLi').addClass('opacityNotActive');
    $('.paymentsLi').addClass('opacityNotActive');
    $('.payrollLi').addClass('opacityNotActive');
    $('.purchasesLi').addClass('opacityNotActive');
    $('.reportsLi').removeClass('opacityNotActive');
    $('.reportsLi2').removeClass('opacityNotActive');
    $('.salesLi').addClass('opacityNotActive');
    $('.seedtosaleLi').addClass('opacityNotActive');
    $('.settingsLi').addClass('opacityNotActive');
    $('.logoutLi').addClass('opacityNotActive');
    $('#accountsSubmenu').collapse('hide');
    $('#appointmentsSubmenu').collapse('hide');
    $('#bankingSubmenu').collapse('hide');
    $('#contactsSubmenu').collapse('hide');
    $('#inventorySubmenu').collapse('hide');
    $('#paymentsSubmenu').collapse('hide');
    $('#payrollSubmenu').collapse('hide');
    $('#purchasesSubmenu').collapse('hide');
    // $('#reportsSubmenu').collapse('hide');
    $('#salesSubmenu').collapse('hide');
    $('#seedToSaleSubmenu').collapse('hide');
    $('#settingsSubmenu').collapse('hide');
    event.preventDefault();
    FlowRouter.go('/allreports');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenav1099report': function (event) {
    event.preventDefault();
    FlowRouter.go('/1099report');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavagedpayables': function (event) {
    event.preventDefault();
    FlowRouter.go('/agedpayables');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavagedpayablessummary': function (event) {
    event.preventDefault();
    FlowRouter.go('/agedpayablessummary');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavagedreceivables': function (event) {
    event.preventDefault();
    FlowRouter.go('/agedreceivables');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavagedreceivablessummary': function (event) {
    event.preventDefault();
    FlowRouter.go('/agedreceivablessummary');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavbalancesheetreport': function (event) {
    event.preventDefault();
    FlowRouter.go('/balancesheetreport');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavgeneralledger': function (event) {
    event.preventDefault();
    FlowRouter.go('/generalledger');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavstatementlist': function (event) {
    event.preventDefault();
    FlowRouter.go('/statementlist');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavstatementlist2': function (event) {
    event.preventDefault();
    FlowRouter.go('/statementlist');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavprofitlossreport': function (event) {
    event.preventDefault();
    FlowRouter.go('/newprofitandloss');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavpurchasesreport': function (event) {
    event.preventDefault();
    FlowRouter.go('/purchasesreport');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavpurchasesummaryreport': function (event) {
    event.preventDefault();
    FlowRouter.go('/purchasesummaryreport');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavproductsalesreport': function (event) {
    event.preventDefault();
    FlowRouter.go('/productsalesreport');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavsalesreport': function (event) {
    event.preventDefault();
    FlowRouter.go('/salesreport');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavsalessummaryreport': function (event) {
    event.preventDefault();
    FlowRouter.go('/salessummaryreport');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavtaxsummaryreport': function (event) {
    event.preventDefault();
    FlowRouter.go('/taxsummaryreport');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavtrialbalance': function (event) {
    event.preventDefault();
    FlowRouter.go('/trialbalance');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click .sidenavreports': function (event) {
    event.preventDefault();
    FlowRouter.go('/allreports');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavsales': function (event) {
    $('.accountsLi').addClass('opacityNotActive');
    $('.appointmentsLi').addClass('opacityNotActive');
    $('.bankingLi').addClass('opacityNotActive');
    $('.contactsLi').addClass('opacityNotActive');
    $('.dashboardLi').addClass('opacityNotActive');
    $('.dashboardLiExe').addClass('opacityNotActive');
    $('.dashboardLiSales').addClass('opacityNotActive');
    $('.dashboardLiSalesManager').addClass('opacityNotActive');
    $('.gsemployeesLi').addClass('opacityNotActive');
    $('.inventoryLi').addClass('opacityNotActive');
    $('.paymentsLi').addClass('opacityNotActive');
    $('.payrollLi').addClass('opacityNotActive');
    $('.purchasesLi').addClass('opacityNotActive');
    $('.reportsLi').addClass('opacityNotActive');
    $('.reportsLi2').addClass('opacityNotActive');
    $('.salesLi').removeClass('opacityNotActive');
    $('.seedtosaleLi').addClass('opacityNotActive');
    $('.settingsLi').addClass('opacityNotActive');
    $('.logoutLi').addClass('opacityNotActive');
    $('#accountsSubmenu').collapse('hide');
    $('#appointmentsSubmenu').collapse('hide');
    $('#bankingSubmenu').collapse('hide');
    $('#contactsSubmenu').collapse('hide');
    $('#inventorySubmenu').collapse('hide');
    $('#paymentsSubmenu').collapse('hide');
    $('#payrollSubmenu').collapse('hide');
    $('#purchasesSubmenu').collapse('hide');
    $('#reportsSubmenu').collapse('hide');
    // $('#salesSubmenu').collapse('hide');
    $('#seedToSaleSubmenu').collapse('hide');
    $('#settingsSubmenu').collapse('hide');
  },
  'click .sidenavsales': function (event) {
    event.preventDefault();
    FlowRouter.go('/salesoverview');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click .sidenavsettings': function (event) {
    event.preventDefault();
    FlowRouter.go('/settings');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavstockadjust': function (event) {
    event.preventDefault();
    FlowRouter.go('/stockadjustmentoverview');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavstocktransfer': function (event) {
    event.preventDefault();
    FlowRouter.go('/stocktransferlist');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavbinlocationlist': function (event) {
    event.preventDefault();
    FlowRouter.go('/binlocationslist');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavnewbinlocation': function (event) {
    event.preventDefault();
    FlowRouter.go("/binlocationslist");
    $('#newBinLocationModal').modal('show');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenaveproductlist': function (event) {
    event.preventDefault();
    FlowRouter.go('/productlist');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenaveserialnumberlist': function (event) {
    event.preventDefault();
    FlowRouter.go('/serialnumberlist');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavelotnumberlist': function (event) {
    event.preventDefault();
    FlowRouter.go('/lotnumberlist');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavnewstockadjust': function (event) {
    //window.open('/stockadjustmentcard', '_self');
    event.preventDefault();
    FlowRouter.go('/stockadjustmentcard');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavnewstocktransfer': function (event) {
    //window.open('/stocktransfercard', '_self');
    event.preventDefault();
    FlowRouter.go('/stocktransfercard');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavcustomers': function (event) {
    event.preventDefault();
    FlowRouter.go('/customerlist');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavemployees': function (event) {
    event.preventDefault();
    FlowRouter.go('/employeelist');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavjobs': function (event) {
    event.preventDefault();
    FlowRouter.go('/joblist');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavnewcustomerjob': function (event) {
    event.preventDefault();
    FlowRouter.go('/customerscard');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavcontactleads': function (event) {
    event.preventDefault();
    FlowRouter.go('/leadlist');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavsuppliers': function (event) {
    event.preventDefault();
    FlowRouter.go('/supplierlist');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavnewcustomers': function (event) {
    if (FlowRouter.current().path === "/customerscard") {
      window.open('/customerscard', '_self');
    } else {
      event.preventDefault();
      FlowRouter.go('/customerscard');
      let templateObject = Template.instance();
      templateObject.getSetSideNavFocus();
    }
  },
  'click #sidenavnewemployees': function (event) {
    if (FlowRouter.current().path === "/employeescard") {
      window.open('/employeescard', '_self');
    } else {
      event.preventDefault();
      FlowRouter.go('/employeescard');
      let templateObject = Template.instance();
      templateObject.getSetSideNavFocus();
    }
  },
  'click #sidenavnewleads': function (event) {
    if (FlowRouter.current().path === "/leadscard") {
      window.open('/leadscard', '_self');
    } else {
      event.preventDefault();
      FlowRouter.go('/leadscard');
      let templateObject = Template.instance();
      templateObject.getSetSideNavFocus();
    }
  },
  'click #sidenavnewsuppliers': function (event) {
    if (FlowRouter.current().path === "/supplierscard") {
      window.open('/supplierscard', '_self');
    } else {
      event.preventDefault();
      FlowRouter.go('/supplierscard');
      let templateObject = Template.instance();
      templateObject.getSetSideNavFocus();
    }
  },
  'click #sidenavawaitingCP': function (event) {
    event.preventDefault();
    FlowRouter.go('/customerawaitingpayments');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavawaitingSPPO': function (event) {
    event.preventDefault();
    FlowRouter.go('/supplierawaitingpurchaseorder');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavawaitingSPBill': function (event) {
    event.preventDefault();
    FlowRouter.go('/supplierawaitingbills');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavcustomerP': function (event) {
    event.preventDefault();
    FlowRouter.go('/customerpayment');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavnewcustomerP': function (event) {
    event.preventDefault();
    FlowRouter.go('/paymentcard');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavsupplierP': function (event) {
    event.preventDefault();
    FlowRouter.go('/supplierpayment');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavnewsupplierP': function (event) {
    event.preventDefault();
    FlowRouter.go('/supplierpaymentcard');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavBill': function (event) {
    event.preventDefault();
    FlowRouter.go('/billlist');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavCredit': function (event) {
    event.preventDefault();
    FlowRouter.go('/creditlist');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavPurchaseOrder': function (event) {
    event.preventDefault();
    FlowRouter.go('/purchaseorderlist');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavPurchaseOrderBO': function (event) {
    event.preventDefault();
    FlowRouter.go('/purchaseorderlistBO');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavnewBill': function (event) {
    event.preventDefault();
    FlowRouter.go('/billcard');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavnewCredit': function (event) {
    event.preventDefault();
    FlowRouter.go('/creditcard');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavnewPO': function (event) {
    event.preventDefault();
    FlowRouter.go('/purchaseordercard');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavInvoice': function (event) {
    event.preventDefault();
    FlowRouter.go('/invoicelist');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavRefund': function (event) {
    event.preventDefault();
    FlowRouter.go('/refundlist');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavInvoiceEmail': function (event) {
    event.preventDefault();
    FlowRouter.go('/invoiceemail');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavInvoiceBO': function (event) {
    event.preventDefault();
    FlowRouter.go('/invoicelistBO');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavQuote': function (event) {
    event.preventDefault();
    FlowRouter.go('/quoteslist');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavSalesOrder': function (event) {
    event.preventDefault();
    FlowRouter.go('/salesorderslist');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavnewInvoice': function (event) {
    event.preventDefault();
    FlowRouter.go('/invoicetemp');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavnewQuote': function (event) {
    event.preventDefault();
    FlowRouter.go('/quotecard');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavnewRefund': function (event) {
    event.preventDefault();
    FlowRouter.go('/refundcard');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavnewSO': function (event) {
    event.preventDefault();
    FlowRouter.go('/salesordercard');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavaccesslevel': function (event) {
    window.open('/accesslevel', '_self');
  },
  'click #sidenavcompanyappsettings': function (event) {
    window.open('/companyappsettings', '_self');
  },
  'click #organisationsettings': function (event) {
    window.open('/organisationsettings', '_self');
  },
  'click #accountantsettings': function (event) {
    window.open('/accountantsettings', '_self');
  },
  'click #backuprestore': function (event) {
    window.open('/backuprestore', '_self');
  },
  'click #clienttypesettings': function (event) {
    window.open('/clienttypesettings', '_self');
  },
  'click #leadstatussettings': function (event) {
    window.open('/leadstatussettings', '_self');
  },
  'click #edIntegrations': function (event) {
    window.open('/edi-integrations', '_self');
  },
  'click #emailsettings': function (event) {
    window.open('/emailsettings', '_self');
  },
  'click #payrollrules': function (event) {
    window.open('/payrollrules', '_self');
  },
  'click #templatesettings': function (event) {
    window.open('/templatesettings', '_self');
  },
  'click #setup': function (event) {
    window.open('/setup', '_self');
  },
  'click #subscriptionSettings': function (event) {
    window.open('/subscriptionSettings', '_self');
  },
  'click #uomSettings': function (event) {
    window.open('/uomSettings', '_self');
  },
  'click #sidenavInventorySettings': function (event) {
    window.open('/inventorySettings', '_self');
  },
  'click #sidenavcurrenciesSettings': function (event) {
    event.preventDefault();
    FlowRouter.go('/currenciessettings');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavdepartmentSettings': function (event) {
    event.preventDefault();
    FlowRouter.go('/departmentSettings');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavorganisationsettings': function (event) {
    event.preventDefault();
    FlowRouter.go('/organisationsettings');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavaccountantsettings': function (event) {
    event.preventDefault();
    FlowRouter.go('/accountantsettings');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavpaymentmethodSettings': function (event) {
    event.preventDefault();
    FlowRouter.go('/paymentmethodSettings');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavtaxratesettings': function (event) {
    event.preventDefault();
    FlowRouter.go('/taxratesettings');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavtermsettings': function (event) {
    event.preventDefault();
    FlowRouter.go('/termsettings');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavtimesheet': function (event) {
    event.preventDefault();
    FlowRouter.go('/timesheet');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },

  'click #sidenavstpayroll': function (event) {
    event.preventDefault();
    FlowRouter.go('/singletouch');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },

  'click #sidenavpayrollleave': function (event) {
    event.preventDefault();
    FlowRouter.go('/payrollleave');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },

  'click #sidenavaddpayrun': function (event) {
    event.preventDefault();
    FlowRouter.go('/payrolloverview?modalId=newPayRunModal');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },

  'click #sidenavClockonReport': function (event) {
    event.preventDefault();
    FlowRouter.go('/clockonreport');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },

  'click #sidenavEmployeeClockedStatus': function (event) {
    event.preventDefault();
    FlowRouter.go('/employeeclockstatus');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavtimeclock': function (event) {
    // if (FlowRouter.current().path == "/payrolloverview") {
    //   $("#btnClockOnOff").trigger("click");
    // } else {
    //   window.open('/payrolloverview#clockOnOff', '_self');
    // }
    event.preventDefault();
    if (FlowRouter.current().path == "/payrolloverview") {
      FlowRouter.go('/clockonoff');
    } else {
      FlowRouter.go('/payrolloverview?modalId=clockonoff');
    }
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },

  'click #sidenavseedtosale': function (event) {
    $('.accountsLi').addClass('opacityNotActive');
    $('.appointmentsLi').addClass('opacityNotActive');
    $('.bankingLi').addClass('opacityNotActive');
    $('.contactsLi').addClass('opacityNotActive');
    $('.dashboardLi').addClass('opacityNotActive');
    $('.dashboardLiExe').addClass('opacityNotActive');
    $('.dashboardLiSales').addClass('opacityNotActive');
    $('.dashboardLiSalesManager').addClass('opacityNotActive');
    $('.gsemployeesLi').addClass('opacityNotActive');
    $('.inventoryLi').addClass('opacityNotActive');
    $('.paymentsLi').addClass('opacityNotActive');
    $('.payrollLi').addClass('opacityNotActive');
    $('.purchasesLi').addClass('opacityNotActive');
    $('.reportsLi').addClass('opacityNotActive');
    $('.reportsLi2').addClass('opacityNotActive');
    $('.salesLi').addClass('opacityNotActive');
    $('.seedtosaleLi').removeClass('opacityNotActive');
    $('.settingsLi').addClass('opacityNotActive');
    $('.logoutLi').addClass('opacityNotActive');
    $('#accountsSubmenu').collapse('hide');
    $('#appointmentsSubmenu').collapse('hide');
    $('#bankingSubmenu').collapse('hide');
    $('#contactsSubmenu').collapse('hide');
    $('#inventorySubmenu').collapse('hide');
    $('#paymentsSubmenu').collapse('hide');
    $('#payrollSubmenu').collapse('hide');
    $('#purchasesSubmenu').collapse('hide');
    $('#reportsSubmenu').collapse('hide');
    $('#salesSubmenu').collapse('hide');
    // $('#seedToSaleSubmenu').collapse('hide');
    $('#settingsSubmenu').collapse('hide');
  },
  'click .sidenavseedtosale': function (event) {
    FlowRouter.go('/stsdashboard');
  },
  'click #sidenavPlants': function (event) {
    window.open('/stsplants', '_self');
  },
  'click #sidenavHarvest': function (event) {
    window.open('/stsharvests', '_self');
  },
  'click #sidenavPackages': function (event) {
    window.open('/stspackages', '_self');
  },
  'click #sidenavTransfers': function (event) {
    window.open('/ststransfers', '_self');
  },
  'click #sidenavOverviews': function (event) {
    window.open('/stsoverviews', '_self');
  },
  'click #sidenavSettings': function (event) {
    $('.accountsLi').addClass('opacityNotActive');
    $('.appointmentsLi').addClass('opacityNotActive');
    $('.bankingLi').addClass('opacityNotActive');
    $('.contactsLi').addClass('opacityNotActive');
    $('.dashboardLi').addClass('opacityNotActive');
    $('.dashboardLiExe').addClass('opacityNotActive');
    $('.dashboardLiSales').addClass('opacityNotActive');
    $('.dashboardLiSalesManager').addClass('opacityNotActive');
    $('.gsemployeesLi').addClass('opacityNotActive');
    $('.inventoryLi').addClass('opacityNotActive');
    $('.paymentsLi').addClass('opacityNotActive');
    $('.payrollLi').addClass('opacityNotActive');
    $('.purchasesLi').addClass('opacityNotActive');
    $('.reportsLi').addClass('opacityNotActive');
    $('.reportsLi2').addClass('opacityNotActive');
    $('.salesLi').addClass('opacityNotActive');
    $('.seedtosaleLi').addClass('opacityNotActive');
    $('.settingsLi').removeClass('opacityNotActive');
    $('.logoutLi').addClass('opacityNotActive');
    $('#accountsSubmenu').collapse('hide');
    $('#appointmentsSubmenu').collapse('hide');
    $('#bankingSubmenu').collapse('hide');
    $('#contactsSubmenu').collapse('hide');
    $('#inventorySubmenu').collapse('hide');
    $('#paymentsSubmenu').collapse('hide');
    $('#payrollSubmenu').collapse('hide');
    $('#purchasesSubmenu').collapse('hide');
    $('#reportsSubmenu').collapse('hide');
    $('#salesSubmenu').collapse('hide');
    $('#seedToSaleSubmenu').collapse('hide');
    // $('#settingsSubmenu').collapse('hide');
    window.open('/stssettings', '_self');
  },
  'click #sidenavdepositlist': function (event) {
    event.preventDefault();
    FlowRouter.go('/depositlist');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavnewdeposit': function (event) {
    event.preventDefault();
    FlowRouter.go('/depositcard');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavshipping': function (event) {
    event.preventDefault();
    var url = window.location.pathname;
    if (url == "/bankrecon") {
      let reconHoldState = localStorage.getItem("reconHoldState") || "false";
      if (reconHoldState == "true") {
        swal({
          title: "Select OK to place Reconciliation On Hold",
          text: "You must Hold the Reconciliation to save the flagged items",
          type: 'warning',
          showCancelButton: true,
          confirmButtonText: 'OK'
        }).then((result) => {
          if (result.value) {
            $("#btnHold").trigger("click");
            localStorage.setItem("reconHoldState", "false");
          } else {
            FlowRouter.go('/vs1shipping');
            let templateObject = Template.instance();
            templateObject.getSetSideNavFocus();
          }
        });
      } else {
        FlowRouter.go('/vs1shipping');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
      }
    } else {
      FlowRouter.go('/vs1shipping');
      let templateObject = Template.instance();
      templateObject.getSetSideNavFocus();
    }
  },
  'click #closeCloudSidePanelMenu': function (event) {
    let templateObject = Template.instance();
    let empLoggedID = localStorage.getItem('mySessionEmployeeLoggedID');
    let accesslevelService = new AccessLevelService();
    let isSidePanel = false;
    let sidePanelID = localStorage.getItem('CloudSidePanelMenuID');
    let sidePanelFormID = localStorage.getItem('CloudSidePanelMenuFormID');

    let data = {
      type: "TEmployeeFormAccess",
      fields: {
        ID: sidePanelID,
        EmployeeId: empLoggedID,
        AccessLevel: 6,
        FormId: sidePanelFormID
      }
    }

    accesslevelService.saveEmpAccess(data).then(function (data) {
      localStorage.setItem('CloudSidePanelMenu', isSidePanel);

      Meteor._reload.reload();
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

    });

  },

  'click .accountsLiHeader': function (event) {
    event.preventDefault();
    var url = window.location.pathname;
    if (url == "/bankrecon") {
      let reconHoldState = localStorage.getItem("reconHoldState") || "false";
      if (reconHoldState == "true") {
        swal({
          title: "Select OK to place Reconciliation On Hold",
          text: "You must Hold the Reconciliation to save the flagged items",
          type: 'warning',
          showCancelButton: true,
          confirmButtonText: 'OK'
        }).then((result) => {
          if (result.value) {
            $("#btnHold").trigger("click");
            localStorage.setItem("reconHoldState", "false");
          } else {
            FlowRouter.go('/accountsoverview');
            let templateObject = Template.instance();
            templateObject.getSetSideNavFocus();
          }
        });
      } else {
        FlowRouter.go('/accountsoverview');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
      }
    } else {
      FlowRouter.go('/accountsoverview');
      let templateObject = Template.instance();
      templateObject.getSetSideNavFocus();
    }
  },
  'click .appointmentsLiHeader': function (event) {
    event.preventDefault();
    var url = window.location.pathname;
    if (url == "/bankrecon") {
      let reconHoldState = localStorage.getItem("reconHoldState") || "false";
      if (reconHoldState == "true") {
        swal({
          title: "Select OK to place Reconciliation On Hold",
          text: "You must Hold the Reconciliation to save the flagged items",
          type: 'warning',
          showCancelButton: true,
          confirmButtonText: 'OK'
        }).then((result) => {
          if (result.value) {
            $("#btnHold").trigger("click");
            localStorage.setItem("reconHoldState", "false");
          } else {
            FlowRouter.go('/appointments');
            let templateObject = Template.instance();
            templateObject.getSetSideNavFocus();
          }
        });
      } else {
        FlowRouter.go('/appointments');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
      }
    } else {
      FlowRouter.go('/appointments');
      let templateObject = Template.instance();
      templateObject.getSetSideNavFocus();
    }
  },
  'click .bankingLiHeader': function (event) {
    event.preventDefault();
    var url = window.location.pathname;
    if (url == "/bankrecon") {
      let reconHoldState = localStorage.getItem("reconHoldState") || "false";
      if (reconHoldState == "true") {
        swal({
          title: "Select OK to place Reconciliation On Hold",
          text: "You must Hold the Reconciliation to save the flagged items",
          type: 'warning',
          showCancelButton: true,
          confirmButtonText: 'OK'
        }).then((result) => {
          if (result.value) {
            $("#btnHold").trigger("click");
            localStorage.setItem("reconHoldState", "false");
          } else {
            FlowRouter.go('/bankingoverview');
            let templateObject = Template.instance();
            templateObject.getSetSideNavFocus();
          }
        });
      } else {
        FlowRouter.go('/bankingoverview');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
      }
    } else {
      FlowRouter.go('/bankingoverview');
      let templateObject = Template.instance();
      templateObject.getSetSideNavFocus();
    }
  },
  'click .contactsLiHeader': function (event) {
    event.preventDefault();
    var url = window.location.pathname;
    if (url == "/bankrecon") {
      let reconHoldState = localStorage.getItem("reconHoldState") || "false";
      if (reconHoldState == "true") {
        swal({
          title: "Select OK to place Reconciliation On Hold",
          text: "You must Hold the Reconciliation to save the flagged items",
          type: 'warning',
          showCancelButton: true,
          confirmButtonText: 'OK'
        }).then((result) => {
          if (result.value) {
            $("#btnHold").trigger("click");
            localStorage.setItem("reconHoldState", "false");
          } else {
            FlowRouter.go('/contactoverview');
            let templateObject = Template.instance();
            templateObject.getSetSideNavFocus();
          }
        });
      } else {
        FlowRouter.go('/contactoverview');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
      }
    } else {
      FlowRouter.go('/contactoverview');
      let templateObject = Template.instance();
      templateObject.getSetSideNavFocus();
    }
  },
  'click .crmLiHeader': function (event) {
    event.preventDefault();
    var url = window.location.pathname;
    if (url == "/bankrecon") {
      let reconHoldState = localStorage.getItem("reconHoldState") || "false";
      if (reconHoldState == "true") {
        swal({
          title: "Select OK to place Reconciliation On Hold",
          text: "You must Hold the Reconciliation to save the flagged items",
          type: 'warning',
          showCancelButton: true,
          confirmButtonText: 'OK'
        }).then((result) => {
          if (result.value) {
            $("#btnHold").trigger("click");
            localStorage.setItem("reconHoldState", "false");
          } else {
            FlowRouter.go('/crmoverview');
            let templateObject = Template.instance();
            templateObject.getSetSideNavFocus();
          }
        });
      } else {
        FlowRouter.go('/crmoverview');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
      }
    } else {
      FlowRouter.go('/crmoverview');
      let templateObject = Template.instance();
      templateObject.getSetSideNavFocus();
    }
  },
  'click .sidenavleads': function (event) {
    event.preventDefault();
    FlowRouter.go('/leadlist');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavtasks': function (event) {
    event.preventDefault();
    if (FlowRouter.current().path == "/crmoverview") {
      $(".menu_all_task").trigger("click");
    } else {
      window.open('/crmoverview#tasksTab-tab', '_self');
    }
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavprojects': function (event) {
    event.preventDefault();
    if (FlowRouter.current().path == "/crmoverview") {
      $(".menu_project").trigger("click");
    } else {
      window.open('/crmoverview#projectsTab-tab', '_self');
    }
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavlabel': function (event) {
    event.preventDefault();
    if (FlowRouter.current().path == "/crmoverview") {
      $(".menu_label").trigger("click");
    } else {
      window.open('/crmoverview#filterLabelsTab-tab', '_self');
    }
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidecampaignlist': function (event) {
    event.preventDefault();
    FlowRouter.go('/campaign-list');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavmailchimp': function (event) {
    event.preventDefault();
    if (FlowRouter.current().path == "/crmoverview") {
      $('#crmMailchimpModal').modal();
    } else {
      window.open('/crmoverview#btnMailchimp', '_self');
    }
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavnewcampaign': function (event) {
    event.preventDefault();
    FlowRouter.go("/campaign-list");
    $('#crmMailchimpAddCampaignModal').modal();
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavnewproject': function (event) {
    event.preventDefault();
    FlowRouter.go("/crmoverview");
    $('#newCrmProject').modal();
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavnewtask': function (event) {
    event.preventDefault();
    FlowRouter.go("/crmoverview");
    $('#taskDetailModal').modal();
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavnewlabel': function (event) {
    event.preventDefault();
    FlowRouter.go("/crmoverview");
    $('#newLabelModal').modal();
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click .inventoryLiHeader': function (event) {
    event.preventDefault();
    var url = window.location.pathname;
    if (url == "/bankrecon") {
      let reconHoldState = localStorage.getItem("reconHoldState") || "false";
      if (reconHoldState == "true") {
        swal({
          title: "Select OK to place Reconciliation On Hold",
          text: "You must Hold the Reconciliation to save the flagged items",
          type: 'warning',
          showCancelButton: true,
          confirmButtonText: 'OK'
        }).then((result) => {
          if (result.value) {
            $("#btnHold").trigger("click");
            localStorage.setItem("reconHoldState", "false");
          } else {
            FlowRouter.go('/inventorylist');
            let templateObject = Template.instance();
            templateObject.getSetSideNavFocus();
          }
        });
      } else {
        FlowRouter.go('/inventorylist');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
      }
    } else {
      FlowRouter.go('/inventorylist');
      let templateObject = Template.instance();
      templateObject.getSetSideNavFocus();
    }
  },
  'click .manufacturingLiHeader': function (event) {
    event.preventDefault();
    var url = window.location.pathname;
    if (url == "/bankrecon") {
      let reconHoldState = localStorage.getItem("reconHoldState") || "false";
      if (reconHoldState == "true") {
        swal({
          title: "Select OK to place Reconciliation On Hold",
          text: "You must Hold the Reconciliation to save the flagged items",
          type: 'warning',
          showCancelButton: true,
          confirmButtonText: 'OK'
        }).then((result) => {
          if (result.value) {
            $("#btnHold").trigger("click");
            localStorage.setItem("reconHoldState", "false");
          } else {
            FlowRouter.go('/manufacturingoverview');
            let templateObject = Template.instance();
            templateObject.getSetSideNavFocus();
          }
        });
      } else {
        FlowRouter.go('/manufacturingoverview');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
      }
    } else {
      FlowRouter.go('/manufacturingoverview');
      let templateObject = Template.instance();
      templateObject.getSetSideNavFocus();
    }
  },
  'click .paymentsLiHeader': function (event) {
    event.preventDefault();
    var url = window.location.pathname;
    if (url == "/bankrecon") {
      let reconHoldState = localStorage.getItem("reconHoldState") || "false";
      if (reconHoldState == "true") {
        swal({
          title: "Select OK to place Reconciliation On Hold",
          text: "You must Hold the Reconciliation to save the flagged items",
          type: 'warning',
          showCancelButton: true,
          confirmButtonText: 'OK'
        }).then((result) => {
          if (result.value) {
            $("#btnHold").trigger("click");
            localStorage.setItem("reconHoldState", "false");
          } else {
            FlowRouter.go('/paymentoverview');
            let templateObject = Template.instance();
            templateObject.getSetSideNavFocus();
          }
        });
      } else {
        FlowRouter.go('/paymentoverview');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
      }
    } else {
      FlowRouter.go('/paymentoverview');
      let templateObject = Template.instance();
      templateObject.getSetSideNavFocus();
    }
  },
  'click .payrollLiHeader': function (event) {
    event.preventDefault();
    var url = window.location.pathname;
    if (url == "/bankrecon") {
      let reconHoldState = localStorage.getItem("reconHoldState") || "false";
      if (reconHoldState == "true") {
        swal({
          title: "Select OK to place Reconciliation On Hold",
          text: "You must Hold the Reconciliation to save the flagged items",
          type: 'warning',
          showCancelButton: true,
          confirmButtonText: 'OK'
        }).then((result) => {
          if (result.value) {
            $("#btnHold").trigger("click");
            localStorage.setItem("reconHoldState", "false");
          } else {
            FlowRouter.go('/payrolloverview');
            let templateObject = Template.instance();
            templateObject.getSetSideNavFocus();
          }
        });
      } else {
        FlowRouter.go('/payrolloverview');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
      }
    } else {
      FlowRouter.go('/payrolloverview');
      let templateObject = Template.instance();
      templateObject.getSetSideNavFocus();
    }
  },
  'click .receiptLiHeader': function (event) {
    event.preventDefault();
    var url = window.location.pathname;
    if (url == "/bankrecon") {
      let reconHoldState = localStorage.getItem("reconHoldState") || "false";
      if (reconHoldState == "true") {
        swal({
          title: "Select OK to place Reconciliation On Hold",
          text: "You must Hold the Reconciliation to save the flagged items",
          type: 'warning',
          showCancelButton: true,
          confirmButtonText: 'OK'
        }).then((result) => {
          if (result.value) {
            $("#btnHold").trigger("click");
            localStorage.setItem("reconHoldState", "false");
          } else {
            FlowRouter.go('/receiptsoverview');
            let templateObject = Template.instance();
            templateObject.getSetSideNavFocus();
          }
        });
      } else {
        FlowRouter.go('/receiptsoverview');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
      }
    } else {
      FlowRouter.go('/receiptsoverview');
      let templateObject = Template.instance();
      templateObject.getSetSideNavFocus();
    }
  },
  'click .purchasesLiHeader': function (event) {
    event.preventDefault();
    var url = window.location.pathname;
    if (url == "/bankrecon") {
      let reconHoldState = localStorage.getItem("reconHoldState") || "false";
      if (reconHoldState == "true") {
        swal({
          title: "Select OK to place Reconciliation On Hold",
          text: "You must Hold the Reconciliation to save the flagged items",
          type: 'warning',
          showCancelButton: true,
          confirmButtonText: 'OK'
        }).then((result) => {
          if (result.value) {
            $("#btnHold").trigger("click");
            localStorage.setItem("reconHoldState", "false");
          } else {
            FlowRouter.go('/purchasesoverview');
            let templateObject = Template.instance();
            templateObject.getSetSideNavFocus();
          }
        });
      } else {
        FlowRouter.go('/purchasesoverview');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
      }
    } else {
      FlowRouter.go('/purchasesoverview');
      let templateObject = Template.instance();
      templateObject.getSetSideNavFocus();
    }
  },
  'click .reportsLi2Header': function (event) {
    event.preventDefault();
    FlowRouter.go('/allreports');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavAccountant': function (event) {
    event.preventDefault();
    FlowRouter.go('/accountant');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click .salesLiHeader': function (event) {
    event.preventDefault();
    var url = window.location.pathname;
    if (url == "/bankrecon") {
      let reconHoldState = localStorage.getItem("reconHoldState") || "false";
      if (reconHoldState == "true") {
        swal({
          title: "Select OK to place Reconciliation On Hold",
          text: "You must Hold the Reconciliation to save the flagged items",
          type: 'warning',
          showCancelButton: true,
          confirmButtonText: 'OK'
        }).then((result) => {
          if (result.value) {
            $("#btnHold").trigger("click");
            localStorage.setItem("reconHoldState", "false");
          } else {
            FlowRouter.go('/salesoverview');
            let templateObject = Template.instance();
            templateObject.getSetSideNavFocus();
          }
        });
      } else {
        FlowRouter.go('/salesoverview');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
      }
    } else {
      FlowRouter.go('/salesoverview');
      let templateObject = Template.instance();
      templateObject.getSetSideNavFocus();
    }
  },
  'click .seedtosaleLiHeader': function (event) {
    event.preventDefault();
    var url = window.location.pathname;
    if (url == "/bankrecon") {
      let reconHoldState = localStorage.getItem("reconHoldState") || "false";
      if (reconHoldState == "true") {
        swal({
          title: "Select OK to place Reconciliation On Hold",
          text: "You must Hold the Reconciliation to save the flagged items",
          type: 'warning',
          showCancelButton: true,
          confirmButtonText: 'OK'
        }).then((result) => {
          if (result.value) {
            $("#btnHold").trigger("click");
            localStorage.setItem("reconHoldState", "false");
          } else {
            FlowRouter.go('/stsdashboard');
            let templateObject = Template.instance();
            templateObject.getSetSideNavFocus();
          }
        });
      } else {
        FlowRouter.go('/stsdashboard');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
      }
    } else {
      FlowRouter.go('/stsdashboard');
      let templateObject = Template.instance();
      templateObject.getSetSideNavFocus();
    }
  },
  'click .settingsLiHeader': function (event) {
    event.preventDefault();
    var url = window.location.pathname;
    if (url == "/bankrecon") {
      let reconHoldState = localStorage.getItem("reconHoldState") || "false";
      if (reconHoldState == "true") {
        swal({
          title: "Select OK to place Reconciliation On Hold",
          text: "You must Hold the Reconciliation to save the flagged items",
          type: 'warning',
          showCancelButton: true,
          confirmButtonText: 'OK'
        }).then((result) => {
          if (result.value) {
            $("#btnHold").trigger("click");
            localStorage.setItem("reconHoldState", "false");
          } else {
            FlowRouter.go('/settings');
            let templateObject = Template.instance();
            templateObject.getSetSideNavFocus();
          }
        });
      } else {
        FlowRouter.go('/settings');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
      }
    } else {
      FlowRouter.go('/settings');
      let templateObject = Template.instance();
      templateObject.getSetSideNavFocus();
    }
  },

  'click .fixedAssetsLiHeader': function (event) {
    event.preventDefault();
    var url = window.location.pathname;
    if (url == "/bankrecon") {
      let reconHoldState = localStorage.getItem("reconHoldState") || "false";
      if (reconHoldState == "true") {
        swal({
          title: "Select OK to place Reconciliation On Hold",
          text: "You must Hold the Reconciliation to save the flagged items",
          type: 'warning',
          showCancelButton: true,
          confirmButtonText: 'OK'
        }).then((result) => {
          if (result.value) {
            $("#btnHold").trigger("click");
            localStorage.setItem("reconHoldState", "false");
          } else {
            FlowRouter.go('/fixedassetsoverview');
            let templateObject = Template.instance();
            templateObject.getSetSideNavFocus();
          }
        });
      } else {
        FlowRouter.go('/fixedassetsoverview');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
      }
    } else {
      FlowRouter.go('/fixedassetsoverview');
      let templateObject = Template.instance();
      templateObject.getSetSideNavFocus();
    }
  },
  'click .sidenavfixedassets': function (event) {
    event.preventDefault();
    FlowRouter.go('/fixedassetlist');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click .deliveryHeader': function (event) {
    event.preventDefault();
    FlowRouter.go('/deliveryOverview');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavnewdriver': function (event) {
    event.preventDefault();
    FlowRouter.go('/drivervehiclelistcard');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click .sidenavdriverlist': function (event) {
    event.preventDefault();
    FlowRouter.go('/drivervehiclelist');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click .sidenavdepotlist': function (event) {
    event.preventDefault();
    FlowRouter.go('/depotlist');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click .sidenavvehicles': function (event) {
    event.preventDefault();
    FlowRouter.go('/vehiclelist');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavnewfixedasset': function (event) {
    event.preventDefault();
    FlowRouter.go('/fixedassetcard');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click .sidenavservicelogs': function (event) {
    event.preventDefault();
    FlowRouter.go('/serviceloglist');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavnewservicelog': function (event) {
    event.preventDefault();
    FlowRouter.go('/servicelogcard');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavassetcosteport': function (event) {
    event.preventDefault();
    FlowRouter.go('/assetcostreport');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavassetregister': function (event) {
    event.preventDefault();
    FlowRouter.go('/assetregisteroverview');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenavnewfixedregister': function (event) {
    event.preventDefault();
    FlowRouter.go('/fixedassetcard');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenaveftfileslist': function (event) {
    event.preventDefault();
    FlowRouter.go('/eftfilescreated');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenaveftnewfile': function (event) {
    event.preventDefault();
    FlowRouter.go('/eft');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenaveftbankrulelist': function (event) {
    event.preventDefault();
    FlowRouter.go('/eftbankrulelist');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
  'click #sidenaveftnewbankrule': function (event) {
    event.preventDefault();
    FlowRouter.go('/eftnewbankrule');
    let templateObject = Template.instance();
    templateObject.getSetSideNavFocus();
  },
});
Template.newsidenav.helpers({
  sideBarPositionClass: () => {
    return Template.instance().sideBarPositionClass.get() || 'top';
  },
  includeDashboard: () => {
    return Template.instance().includeDashboard.get();
  },
  includeMain: () => {
    return Template.instance().includeMain.get();
  },
  includeInventory: () => {
    return Template.instance().includeInventory.get();
  },
  includeManufacturing: () => {
    return Template.instance().includeManufacturing.get();
  },
  includeAccessLevels: () => {
    return Template.instance().includeAccessLevels.get();
  },
  includeShipping: () => {
    return Template.instance().includeShipping.get();
  },
  includeStockTransfer: () => {
    return Template.instance().includeStockTransfer.get();
  },
  includeStockAdjustment: () => {
    return Template.instance().includeStockAdjustment.get();
  },
  includeStockTake: () => {
    return Template.instance().includeStockTake.get();
  },
  includeSales: () => {
    return Template.instance().includeSales.get();
  },
  isCloudSidePanelMenu: () => {
    return Template.instance().isCloudSidePanelMenu.get();
  },
  isCloudTopPanelMenu: () => {
    return Template.instance().isCloudTopPanelMenu.get();
  },
  includePurchases: () => {
    return Template.instance().includePurchases.get();
  },
  includeExpenseClaims: () => {
    return Template.instance().includeExpenseClaims.get();
  },
  includeFixedAssets: () => {
    return Template.instance().includeFixedAssets.get();
  },
  includePayments: () => {
    return Template.instance().includePayments.get();
  },
  includeContacts: () => {
    return Template.instance().includeContacts.get();
  },
  includeAccounts: () => {
    return Template.instance().includeAccounts.get();
  },
  includeReports: () => {
    return Template.instance().includeReports.get();
  },
  includeSettings: () => {
    return Template.instance().includeSettings.get();
  },
  formname: () => {
    let chequeSpelling = "";
    if (localStorage.getItem('ERPLoggedCountry') == "Australia") {
      chequeSpelling = "Cheque";
    } else if (localStorage.getItem('ERPLoggedCountry') == "United States of America") {
      chequeSpelling = "Check";
    } else {
      chequeSpelling = "Cheque";
    }
    return chequeSpelling;
  },

  isAccountsLists: function () {
    return Template.instance().isAccountsLists.get();
  },
  isBinLocations: function () {
    return Template.instance().isBinLocations.get();
  },
  isTransactionJournal: function () {
    return Template.instance().isTransactionJournal.get();
  },
  isUnpaidBills: function () {
    return Template.instance().isUnpaidBills.get();
  },
  isUnpaidPO: function () {
    return Template.instance().isUnpaidPO.get();
  },
  isBackOrderedPO: function () {
    return Template.instance().isBackOrderedPO.get();
  },
  isSalesOrderConverted: function () {
    return Template.instance().isSalesOrderConverted.get();
  },
  isSalesOrderUnconverted: function () {
    return Template.instance().isSalesOrderUnconverted.get();
  },
  isPaymentMethodsList: function () {
    return Template.instance().isPaymentMethodsList.get();
  },
  isBackOrderedInvoices: function () {
    return Template.instance().isBackOrderedInvoices.get();
  },
  isQuotesConverted: function () {
    return Template.instance().isQuotesConverted.get();
  },
  isQuotesUnconverted: function () {
    return Template.instance().isQuotesUnconverted.get();
  },
  isInvoicesPaid: function () {
    return Template.instance().isInvoicesPaid.get();
  },
  isInvoicesUnpaid: function () {
    return Template.instance().isInvoicesUnpaid.get();
  },
  isPayrollLeaveAccrued: function () {
    return Template.instance().isPayrollLeaveAccrued.get();
  },
  isPayrollLeaveTaken: function () {
    return Template.instance().isPayrollLeaveTaken.get();
  },
  isTimeSheetDetails: function () {
    return Template.instance().isTimeSheetDetails.get();
  },
  isChequeList: function () {
    return Template.instance().isChequeList.get();
  },
  isStockAdjustmentList: function () {
    return Template.instance().isStockAdjustmentList.get();
  },
  isJournalEntryList: function () {
    return Template.instance().isJournalEntryList.get();
  },
  isProfitLoss: function () {
    return Template.instance().isProfitLoss.get();
  },
  isPLMonthly: function () {
    return Template.instance().isPLMonthly.get();
  },
  isBankingReport: function () {
    return Template.instance().isBankingReport.get();
  },
  isPLQuarterly: function () {
    return Template.instance().isPLQuarterly.get();
  },
  isPLYearly: function () {
    return Template.instance().isPLYearly.get();
  },
  isPLYTD: function () {
    return Template.instance().isPLYTD.get();
  },
  isJobSalesSummary: function () {
    return Template.instance().isJobSalesSummary.get();
  },
  isAgedReceivables: function () {
    return Template.instance().isAgedReceivables.get();
  },
  isAgedReceivablesSummary: function () {
    return Template.instance().isAgedReceivablesSummary.get();
  },
  isProductSalesReport: function () {
    return Template.instance().isProductSalesReport.get();
  },
  isSalesReport: function () {
    return Template.instance().isSalesReport.get();
  },
  isJobProfitReport: function () {
    return Template.instance().isJobProfitReport.get();
  },
  isSupplierDetails: function () {
    return Template.instance().isSupplierDetails.get();
  },
  isSupplierProduct: function () {
    return Template.instance().isSupplierProduct.get();
  },
  isCustomerDetails: function () {
    return Template.instance().isCustomerDetails.get();
  },
  isCustomerSummary: function () {
    return Template.instance().isCustomerSummary.get();
  },
  isLotReport: function () {
    return Template.instance().isLotReport.get();
  },
  isStockValue: function () {
    return Template.instance().isStockValue.get();
  },
  isStockQuantity: function () {
    return Template.instance().isStockQuantity.get();
  },
  isStockMovementReport: function () {
    return Template.instance().isStockMovementReport.get();
  },
  isClockedHourReport: function () {
    return Template.instance().isClockedHourReport.get();
  },
  isPayrollHistoryReport: function () {
    return Template.instance().isPayrollHistoryReport.get();
  },
  isForeignExchangeHistoryList: function () {
    return Template.instance().isForeignExchangeHistoryList.get();
  },
  isForeignExchangeList: function () {
    return Template.instance().isForeignExchangeList.get();
  },
  isSalesSummaryReport: function () {
    return Template.instance().isSalesSummaryReport.get();
  },
  isGeneralLedger: function () {
    return Template.instance().isGeneralLedger.get();
  },
  isTaxSummaryReport: function () {
    return Template.instance().isTaxSummaryReport.get();
  },
  isTrialBalance: function () {
    return Template.instance().isTrialBalance.get();
  },
  isTimeSheetSummary: function () {
    return Template.instance().isTimeSheetSummary.get();
  },
  isSerialNumberReport: function () {
    return Template.instance().isSerialNumberReport.get();
  },
  is1099Transaction: function () {
    return Template.instance().is1099Transaction.get();
  },
  isAgedPayables: function () {
    return Template.instance().isAgedPayables.get();
  },
  isAgedPayablesSummary: function () {
    return Template.instance().isAgedPayablesSummary.get();
  },
  isPurchaseReport: function () {
    return Template.instance().isPurchaseReport.get();
  },
  isPurchaseSummaryReport: function () {
    return Template.instance().isPurchaseSummaryReport.get();
  },
  isPrintStatement: function () {
    return Template.instance().isPrintStatement.get();
  },
  isExecutiveSummary: function () {
    return Template.instance().isExecutiveSummary.get();
  },
  isCashReport: function () {
    return Template.instance().isCashReport.get();
  },
  isProfitabilityReport: function () {
    return Template.instance().isProfitabilityReport.get();
  },
  isPerformanceReport: function () {
    return Template.instance().isPerformanceReport.get();
  },
  isBalanceSheetReport: function () {
    return Template.instance().isBalanceSheetReport.get();
  },
  isIncomeReport: function () {
    return Template.instance().isIncomeReport.get();
  },
  isPositionReport: function () {
    return Template.instance().isPositionReport.get();
  },
  isBuildProfitability: function () {
    return Template.instance().isBuildProfitability.get();
  },
  isProductionWorkSheet: function () {
    return Template.instance().isProductionWorkSheet.get();
  },

  isWorkOrder: function () {
    return Template.instance().isWorkOrder.get();
  },

  isCompanyAccountant: function () {
    return Template.instance().isCompanyAccountant.get();
  },
  isTrustee: function () {
    return Template.instance().isTrustee.get();
  },
  isFinancialStatement: function () {
    return Template.instance().isFinancialStatement.get();
  },
  isIndividual: function () {
    return Template.instance().isIndividual.get();
  },
  isPartnershipNonTrading: function () {
    return Template.instance().isPartnershipNonTrading.get();
  },
  isTrustNonTrading: function () {
    return Template.instance().isTrustNonTrading.get();
  },
  isSelfManagedSuperfund: function () {
    return Template.instance().isSelfManagedSuperfund.get();
  },
  isSingleDirector: function () {
    return Template.instance().isSingleDirector.get();
  },
  isSoleTraderNonTrading: function () {
    return Template.instance().isSoleTraderNonTrading.get();
  },
  isTrust: function () {
    return Template.instance().isTrust.get();
  },
  isSupplierList: function () {
    return Template.instance().isSupplierList.get();
  },
  isSupplierSummaryReport: function () {
    return Template.instance().isSupplierSummaryReport.get();
  },
  isBalanceSheet: function () {
    return Template.instance().isBalanceSheet.get();
  },
  isProfitLoss: function () {
    return Template.instance().isProfitLoss.get();
  },
  isAgedReceivables: function () {
    return Template.instance().isAgedReceivables.get();
  },
  isAgedReceivablesSummary: function () {
    return Template.instance().isAgedReceivablesSummary.get();
  },
  isProductSalesReport: function () {
    return Template.instance().isProductSalesReport.get();
  },
  isSalesReport: function () {
    return Template.instance().isSalesReport.get();
  },
  isSalesSummaryReport: function () {
    return Template.instance().isSalesSummaryReport.get();
  },
  isGeneralLedger: function () {
    return Template.instance().isGeneralLedger.get();
  },
  isTaxSummaryReport: function () {
    return Template.instance().isTaxSummaryReport.get();
  },
  isTrialBalance: function () {
    return Template.instance().isTrialBalance.get();
  },
  is1099Transaction: function () {
    return Template.instance().is1099Transaction.get();
  },
  isAgedPayables: function () {
    return Template.instance().isAgedPayables.get();
  },
  isAgedPayablesSummary: function () {
    return Template.instance().isAgedPayablesSummary.get();
  },
  isPurchaseReport: function () {
    return Template.instance().isPurchaseReport.get();
  },
  isPurchaseSummaryReport: function () {
    return Template.instance().isPurchaseSummaryReport.get();
  },
  isPrintStatement: function () {
    return Template.instance().isPrintStatement.get();
  },
  isFavorite: function () {
    let isBalanceSheet = Template.instance().isBalanceSheet.get();
    let isProfitLoss = Template.instance().isProfitLoss.get();
    let isPLMonthly = Template.instance().isPLMonthly.get();
    let isPLQuarterly = Template.instance().isPLQuarterly.get();
    let isPLYearly = Template.instance().isPLYearly.get();
    let isPLYTD = Template.instance().isPLYTD.get();
    let isJobSalesSummary = Template.instance().isJobSalesSummary.get();
    let isAgedReceivables = Template.instance().isAgedReceivables.get();
    let isAgedReceivablesSummary = Template.instance().isAgedReceivablesSummary.get();
    let isProductSalesReport = Template.instance().isProductSalesReport.get();
    let isSalesReport = Template.instance().isSalesReport.get();
    let isJobProfitReport = Template.instance().isJobProfitReport.get();
    let isSupplierDetails = Template.instance().isSupplierDetails.get();
    let isSupplierProduct = Template.instance().isSupplierProduct.get();
    let isCustomerDetails = Template.instance().isCustomerDetails.get();
    let isCustomerSummary = Template.instance().isCustomerSummary.get();
    let isLotReport = Template.instance().isLotReport.get();
    let isStockValue = Template.instance().isStockValue.get();
    let isStockQuantity = Template.instance().isStockQuantity.get();
    let isStockMovementReport = Template.instance().isStockMovementReport.get();
    let isClockedHourReport = Template.instance().isClockedHourReport.get();
    let isPayrollHistoryReport = Template.instance().isPayrollHistoryReport.get();
    let isForeignExchangeHistoryList = Template.instance().isForeignExchangeHistoryList.get();
    let isForeignExchangeList = Template.instance().isForeignExchangeList.get();
    let isSalesSummaryReport = Template.instance().isSalesSummaryReport.get();
    let isGeneralLedger = Template.instance().isGeneralLedger.get();
    let isTaxSummaryReport = Template.instance().isTaxSummaryReport.get();
    let isTrialBalance = Template.instance().isTrialBalance.get();
    let isTimeSheetSummary = Template.instance().isTimeSheetSummary.get();
    let isPayrollLeaveAccrued = Template.instance().isPayrollLeaveAccrued.get();
    let isPayrollLeaveTaken = Template.instance().isPayrollLeaveTaken.get();
    let isSerialNumberReport = Template.instance().isSerialNumberReport.get();
    let is1099Transaction = Template.instance().is1099Transaction.get();
    let isAccountsLists = Template.instance().isAccountsLists.get();
    let isBinLocations = Template.instance().isBinLocations.get();
    let isTransactionJournal = Template.instance().isTransactionJournal.get();
    let isUnpaidBills = Template.instance().isUnpaidBills.get();
    let isUnpaidPO = Template.instance().isUnpaidPO.get();
    let isBackOrderedPO = Template.instance().isBackOrderedPO.get();
    let isSalesOrderConverted = Template.instance().isSalesOrderConverted.get();
    let isSalesOrderUnconverted = Template.instance().isSalesOrderUnconverted.get();
    let isPaymentMethodsList = Template.instance().isPaymentMethodsList.get();
    let isBackOrderedInvoices = Template.instance().isBackOrderedInvoices.get();
    let isQuotesConverted = Template.instance().isQuotesConverted.get();
    let isQuotesUnconverted = Template.instance().isQuotesUnconverted.get();
    let isInvoicesPaid = Template.instance().isInvoicesPaid.get();
    let isInvoicesUnpaid = Template.instance().isInvoicesUnpaid.get();
    let isTimeSheetDetails = Template.instance().isTimeSheetDetails.get();
    let isChequeList = Template.instance().isChequeList.get();
    let isStockAdjustmentList = Template.instance().isStockAdjustmentList.get();
    let isJournalEntryList = Template.instance().isJournalEntryList.get();
    let isAgedPayables = Template.instance().isAgedPayables.get();
    let isAgedPayablesSummary = Template.instance().isAgedPayablesSummary.get();
    let isPurchaseReport = Template.instance().isPurchaseReport.get();
    let isPurchaseSummaryReport = Template.instance().isPurchaseSummaryReport.get();
    let isPrintStatement = Template.instance().isPrintStatement.get();
    let isExecutiveSummary = Template.instance().isExecutiveSummary.get();
    let isCashReport = Template.instance().isCashReport.get();
    let isProfitabilityReport = Template.instance().isProfitabilityReport.get();
    let isPerformanceReport = Template.instance().isPerformanceReport.get();
    let isBalanceSheetReport = Template.instance().isBalanceSheetReport.get();
    let isIncomeReport = Template.instance().isIncomeReport.get();
    let isPositionReport = Template.instance().isPositionReport.get();
    let isBuildProfitability = Template.instance().isBuildProfitability.get();
    let isProductionWorkSheet = Template.instance().isProductionWorkSheet.get();
    let isWorkOrder = Template.instance().isWorkOrder.get();
    let isBankingReport = Template.instance().isBankingReport.get();


    let isShowFavorite = false;

    if (isBalanceSheet || isBankingReport||
      isProfitLoss ||
      isAgedReceivables ||
      isProductSalesReport ||
      isSalesReport ||
      isSalesSummaryReport ||
      isGeneralLedger ||
      isTaxSummaryReport ||
      isTrialBalance ||
      isExecutiveSummary ||
      isCashReport ||
      isProfitabilityReport ||
      isPerformanceReport ||
      isBalanceSheetReport ||
      isIncomeReport ||
      isPositionReport ||
      is1099Transaction ||
      isAccountsLists ||
      isAgedPayables ||
      isPurchaseReport ||
      isPurchaseSummaryReport ||
      isPrintStatement ||
      isAgedReceivablesSummary ||
      isAgedPayablesSummary ||
      isJournalEntryList ||
      isStockAdjustmentList ||
      isChequeList ||
      isTimeSheetDetails ||
      isInvoicesPaid ||
      isInvoicesUnpaid ||
      isQuotesConverted ||
      isQuotesUnconverted ||
      isBackOrderedInvoices ||
      isPaymentMethodsList ||
      isSalesOrderConverted ||
      isSalesOrderUnconverted ||
      isBackOrderedPO ||
      isUnpaidPO ||
      isUnpaidBills ||
      isTransactionJournal ||
      isSerialNumberReport ||
      isPayrollLeaveAccrued ||
      isPayrollLeaveTaken ||
      isForeignExchangeHistoryList ||
      isForeignExchangeList ||
      isBinLocations ||
      isTimeSheetSummary ||
      isClockedHourReport ||
      isPayrollHistoryReport ||
      isStockValue ||
      isStockMovementReport ||
      isStockQuantity ||
      isLotReport ||
      isCustomerDetails ||
      isCustomerSummary ||
      isSupplierDetails ||
      isSupplierProduct ||
      isJobProfitReport ||
      isPLMonthly ||
      isPLQuarterly ||
      isPLYearly ||
      isPLYTD ||
      isJobSalesSummary ||
      isBuildProfitability ||
      isProductionWorkSheet ||
      isWorkOrder ||
      Template.instance().isCompanyAccountant.get() ||
      Template.instance().isTrustee.get() ||
      Template.instance().isFinancialStatement.get() ||
      Template.instance().isIndividual.get() ||
      Template.instance().isPartnershipNonTrading.get() ||
      Template.instance().isTrustNonTrading.get() ||
      Template.instance().isSelfManagedSuperfund.get() ||
      Template.instance().isSingleDirector.get() ||
      Template.instance().isSoleTraderNonTrading.get() ||
      Template.instance().isTrust.get() ||
      Template.instance().isSupplierList.get() ||
      Template.instance().isSupplierSummaryReport.get()
    ) {
      isShowFavorite = true;
    }
    return isShowFavorite;
  },
  isGreenTrack: function () {
    let checkGreenTrack = localStorage.getItem('isGreenTrack') || false;

    return checkGreenTrack;
  },
  includeSeedToSale: () => {
    return Template.instance().includeSeedToSale.get();
  },
  includeAppointmentScheduling: () => {
    return Template.instance().includeAppointmentScheduling.get();
  },
  includeBanking: () => {
    return Template.instance().includeBanking.get();
  },
  includePayroll: () => {
    return Template.instance().includePayroll.get();
  },
  includePayrollClockOnOffOnly: () => {
    return Template.instance().includePayrollClockOnOffOnly.get();
  },
  includeTimesheetEntry: () => {
    return Template.instance().includeTimesheetEntry.get();
  },
  includeClockOnOff: () => {
    return Template.instance().includeClockOnOff.get();
  },


  checkFXCurrency: () => {
    return localStorage.getItem('CloudUseForeignLicence');
  },
  showTimesheet: () => {
    return localStorage.getItem('CloudShowTimesheet') || false;
  },
  isSNTrackChecked: () => {
    return Template.instance().isSNTrackChecked.get();
  },
  includeCRM: () => {
    return Template.instance().isCRM.get();
  },
  isProductList: () => {
    return Template.instance().isProductList.get();
  },
  isNewProduct: () => {
    return Template.instance().isNewProduct.get();
  },
  isNewStockTransfer: () => {
    return Template.instance().isNewStockTransfer.get();
  },
  isExportProduct: () => {
    return Template.instance().isExportProduct.get();
  },
  isImportProduct: () => {
    return Template.instance().isImportProduct.get();
  },
  isStockonHandDemandChart: () => {
    return Template.instance().isStockonHandDemandChart.get();
  },
  isAppointmentSMS: () => {
    return Template.instance().isAppointmentSMS.get();
  }
});
