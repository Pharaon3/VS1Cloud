import {BaseService} from '../js/base-service.js';

export class VS1ChartService extends BaseService {

  getOverviewAPDetails() {
      let options = {
        IgnoreDates: true,
        LimitCount: parseInt(initialDataLoad),
          // Summary: false,
          // select: "[Pay]=false"
      };
      return this.getList(this.ERPObjects.TAPReport, options);
  }

  getOverviewARDetails() {
      let options = {
          IgnoreDates: true,
          LimitCount: parseInt(initialDataLoad),
          // select: "[Pay]=false"
      };
      return this.getList(this.ERPObjects.TARReport, options);
  }

  getExecutiveSummaryReport(dateAsOf) {
    let options = {
        //select: "[Active]=true",
        //ListType:"Detail",
        DateTo: '"'+dateAsOf+'"',
        LimitCount: parseInt(initialDataLoad),
    };
    return this.getList(this.ERPObjects.BalanceSheetReport, options);
  }

    getBalanceSheetReport(dateAsOf) {
        let options = {
            //select: "[Active]=true",
            //ListType:"Detail",
            DateTo: '"'+dateAsOf+'"',
            LimitCount: parseInt(initialDataLoad),
        };
        return this.getList(this.ERPObjects.BalanceSheetReport, options);
    }

    getProfitLossReport() {
        let options = {
            select: "[Active]=true",
            ListType:"Detail",
            LimitCount: parseInt(initialDataLoad),
            //DateTo:dateAsOf
        };
        return this.getList(this.ERPObjects.ProfitLossReport, options);
    }
    getBalanceSheet() {
        let options = {
            select: "[Active]=true",
            ListType:"Detail",
            LimitCount: parseInt(initialDataLoad),
        };
        return this.getList(this.ERPObjects.BalanceSheetReport, options);
    }

    /*
    * get the contacts
    * */

    getContacts(){
        let options = {
            PropertyList: "ID,ClientID,ClientName,Company,CurrencySymbol,ContactAddress,ContactEmail,Active",
            select: "[Active]=true",
            LimitCount: parseInt(initialDataLoad),
        };
        return this.getList(this.ERPObjects.TContact, options);
    }
    getBalanceSheetData() {
        return this.getList(this.ERPObjects.BalanceSheetReport);
    }

    getBalanceSheetRedirectData() {
      let options = {
          ReportType: "Detail",
          IgnoreSummarised:true,
          LimitCount: parseInt(initialDataLoad),
      };
      // return this.getList(this.ERPObjects.TAccount,options);
        return this.getList(this.ERPObjects.TAccountRunningBalanceReport,options);
    }

    getGSTReconciliationData(dateFrom,dateTo){
        let options = {
            ReportType:"Detail",
            DateTo: '"'+moment(dateTo).format('YYYY-MM-DD')+'"',
            DateFrom: '"'+moment(dateFrom).format('YYYY-MM-DD')+'"',
            LimitCount: parseInt(initialDataLoad),
        };
        return this.getList(this.ERPObjects.TTaxSummaryReport,options);
    }
    getOneIncomeTransactionData(id) {

        return this.getOneById(this.ERPObjects.TCustomerPayment , id);
    }

    getOneExpenseTransactionData(id) {

        return this.getOneById(this.ERPObjects.TSupplierPayment , id);
    }

    ProfitLossData() {
        return this.getOneById(this.ERPObjects.ProfitLossReport);
    }

    getAccountSummaryRedirectData() {
        let options = {
            ListType: "Detail",
            LimitCount: parseInt(initialDataLoad),
        };
        return this.getList(this.ERPObjects.TAccount,options);
    }


    getProfitandLoss(dateFrom, dateTo,ignoreDate) {
      let options = '';
      if(ignoreDate == true){
        options = {
           IgnoreDates:true,
           LimitCount: parseInt(initialDataLoad),
       };
     }else{
       options = {
          IgnoreDates:false,
          DateFrom: '"'+dateFrom+'"',
          DateTo: '"'+dateTo+'"',
          LimitCount: parseInt(initialDataLoad),
      };
     }
        return this.getList(this.ERPObjects.ProfitLossReport, options);
    }


    getDepartment() {
        let options = {
            PropertyList: "DeptClassName",
            select: "[Active]=true"
        };
        return this.getList(this.ERPObjects.TDeptClass, options);
    }


getAgedPayableDetailsData(dateFrom, dateTo,ignoreDate) {
  let options = '';
  if(ignoreDate == true){
    options = {
       IgnoreDates:true,
       LimitCount: parseInt(initialDataLoad),
   };
 }else{
   options = {
      IgnoreDates:false,
      DateFrom: '"'+dateFrom+'"',
      DateTo: '"'+dateTo+'"',
      LimitCount: parseInt(initialDataLoad),
  };
 }
    return this.getList(this.ERPObjects.TAPReport, options);
}

getAgedPayableDetailsSummaryData(dateFrom, dateTo,ignoreDate) {
    // let options = {
    //     IgnoreDates:ignoreDate,
    //     ReportType: 'Summary',
    //     DateFrom: '"'+dateFrom+'"',
    //     DateTo: '"'+dateTo+'"'
    // };

    let options = '';
    if(ignoreDate == true){
      options = {
         IgnoreDates:true,
         ReportType: 'Summary',
         LimitCount: parseInt(initialDataLoad),
     };
   }else{
     options = {
        IgnoreDates:false,
        ReportType: 'Summary',
        DateFrom: '"'+dateFrom+'"',
        DateTo: '"'+dateTo+'"',
        LimitCount: parseInt(initialDataLoad),
    };
   }
    return this.getList(this.ERPObjects.TAPReport, options);
}

getAgedReceivableDetailsData(dateFrom, dateTo,ignoreDate) {
  let options = '';
  if(ignoreDate == true){
    options = {
       IgnoreDates:true,
       LimitCount: parseInt(initialDataLoad),
   };
 }else{
   options = {
      IgnoreDates:false,
      DateFrom: '"'+dateFrom+'"',
      DateTo: '"'+dateTo+'"',
      LimitCount: parseInt(initialDataLoad),
  };
 }
return this.getList(this.ERPObjects.TARReport, options);
}

getAgedReceivableDetailsSummaryData(dateFrom, dateTo,ignoreDate) {
  let options = '';
  if(ignoreDate == true){
    options = {
       IgnoreDates:true,
       ReportType: 'Summary',
       LimitCount: parseInt(initialDataLoad),
   };
 }else{
   options = {
      IgnoreDates:false,
      ReportType: 'Summary',
      DateFrom: '"'+dateFrom+'"',
      DateTo: '"'+dateTo+'"',
      LimitCount: parseInt(initialDataLoad),
  };
 }
return this.getList(this.ERPObjects.TARReport, options);
}

getGeneralLedgerDetailsData(dateFrom, dateTo,ignoreDate) {
  let options = '';
  if(ignoreDate == true){
    options = {
       IgnoreDates:true,
       LimitCount: parseInt(initialDataLoad),
   };
 }else{
   options = {
      IgnoreDates:false,
      DateFrom: '"'+dateFrom+'"',
      DateTo: '"'+dateTo+'"',
      LimitCount: parseInt(initialDataLoad),
  };
 }
return this.getList(this.ERPObjects.TGeneralLedgerReport, options);
}

getTrialBalanceDetailsData(dateFrom, dateTo ,ignoreDate) {
  let options = '';
  if(ignoreDate == true){
    options = {
       IgnoreDates:true,
       LimitCount: parseInt(initialDataLoad),
   };
 }else{
   options = {
      IgnoreDates:false,
      DateFrom: '"'+dateFrom+'"',
      DateTo: '"'+dateTo+'"',
      LimitCount: parseInt(initialDataLoad),
  };
 }
return this.getList(this.ERPObjects.TTrialBalanceReport, options);
}

getPurchasesDetailsData(dateFrom, dateTo, ignoreDate) {

let options = '';
if(ignoreDate == true){
  options = {
     IgnoreDates:true,
     IncludePOs:true,
     LimitCount: parseInt(initialDataLoad),
 };
}else{
 options = {
    IgnoreDates:false,
    IncludePOs:true,
    DateFrom: '"'+dateFrom+'"',
    DateTo: '"'+dateTo+'"',
    LimitCount: parseInt(initialDataLoad),
};
}

return this.getList(this.ERPObjects.TbillReport, options);
}

getPurchaseSummaryDetailsData(dateFrom, dateTo, ignoreDate) {

let options = '';
if(ignoreDate == true){
  options = {
     IgnoreDates:true,
     IncludePOs:true,
     ReportType: 'Summary',
     LimitCount: parseInt(initialDataLoad),
 };
}else{
 options = {
    IgnoreDates:false,
    IncludePOs:true,
    ReportType: 'Summary',
    DateFrom: '"'+dateFrom+'"',
    DateTo: '"'+dateTo+'"',
    LimitCount: parseInt(initialDataLoad),
};
}

return this.getList(this.ERPObjects.TbillReport, options);
}

getSalesDetailsData(dateFrom, dateTo, ignoreDate) {
  let options = '';
  if(ignoreDate == true){
    options = {
       IgnoreDates:true,
       LimitCount: parseInt(initialDataLoad),
   };
 }else{
   options = {
      IgnoreDates:false,
      DateFrom:'"'+dateFrom+'"',
      DateTo:'"'+dateTo+'"',
      LimitCount: parseInt(initialDataLoad),
  };
 }

return this.getList(this.ERPObjects.TSalesList, options);
}

getSalesDetailsSummaryData(dateFrom, dateTo, ignoreDate) {
  let options = '';
  if(ignoreDate == true){
    options = {
       IgnoreDates:true,
       ListType: 'Summary',
       LimitCount: parseInt(initialDataLoad),
   };
 }else{
   options = {
      IgnoreDates:false,
      ListType: 'Summary',
      DateFrom:'"'+dateFrom+'"',
      DateTo:'"'+dateTo+'"',
      LimitCount: parseInt(initialDataLoad),
  };
 }

return this.getList(this.ERPObjects.TSalesList, options);
}

getProductSalesDetailsData(dateFrom, dateTo, ignoreDate) {
  let options = '';
  if(ignoreDate == true){
    options = {
       IgnoreDates:true,
       LimitCount: parseInt(initialDataLoad),
   };
 }else{
   options = {
      IgnoreDates:false,
      DateFrom:'"'+dateFrom+'"',
      DateTo:'"'+dateTo+'"',
      LimitCount: parseInt(initialDataLoad),
  };
 }

return this.getList(this.ERPObjects.TProductSalesDetailsReport, options);
}

getTaxSummaryData(dateFrom, dateTo,ignoreDate) {

    let options = '';
    if(ignoreDate == true){
      options = {
         IgnoreDates:true,
         ReportType: 'Summary',
         LimitCount: parseInt(initialDataLoad),
     };
   }else{
     options = {
        IgnoreDates:false,
        ReportType: 'Summary',
        DateFrom: '"'+dateFrom+'"',
        DateTo: '"'+dateTo+'"',
        LimitCount: parseInt(initialDataLoad),
    };
   }
    return this.getList(this.ERPObjects.TTaxSummaryReport, options);
}

getAllProductSalesDetails(dateFrom, dateTo, ignoreDate) {
  let options = '';
  if(ignoreDate == true){
    options = {
       IgnoreDates:true,
       LimitCount: parseInt(initialDataLoad),
   };
 }else{
   options = {
      IgnoreDates:false,
      DateFrom:'"'+dateFrom+'"',
      DateTo:'"'+dateTo+'"',
      LimitCount: parseInt(initialDataLoad),
  };
 }
  return this.getList(this.ERPObjects.TProductSalesDetailsReport, options);
}

getContractorPaymentSummaryData(dateFrom, dateTo, ignoreDate) {
let options = '';
if(ignoreDate == true){
  options = {
     IgnoreDates:true,
     LimitCount: parseInt(initialDataLoad),
 };
}else{
 options = {
    IgnoreDates:false,
    DateFrom: '"'+dateFrom+'"',
    DateTo: '"'+dateTo+'"',
    LimitCount: parseInt(initialDataLoad),
};
}

return this.getList(this.ERPObjects.TContractorPaymentSummary, options);
}


getInvSaleByEmployee() {
  let fromDate = moment($("#dateFrom").val(), "DD/MM/YYYY").format("YYYY-MM-DD")
  let toDate = moment($("#dateTo").val(), "DD/MM/YYYY").format("YYYY-MM-DD")
  let options = {
      PropertyList: "ID,DueDate,CustomerName,SaleDate,TotalPaid,TotalBalance,deleted,IsPaid,TotalAmountInc,EmployeeName",
      select: `deleted=false and DueDate > "${fromDate}" and DueDate < "${toDate}" and EmployeeName > ""`,
      // LimitCount: parseInt(initialDataLoad),
  };
    return this.getList(this.ERPObjects.TInvoiceEx, options);
}

getSalesListData() {
  let options = {
       IgnoreDates:true,
       LimitCount: parseInt(initialDataLoad),
   };

return this.getList(this.ERPObjects.TSalesList, options);
}

getProfitLossPeriodReportData(dateFrom, dateTo) {
 let options = {
    DateFrom: '"'+dateFrom+'"',
    DateTo: '"'+dateTo+'"',
    LimitCount: parseInt(initialDataLoad),
};

return this.getList(this.ERPObjects.TProfitAndLossPeriodReport, options);
}

getProductStocknSaleReportData(dateFrom, dateTo) {
 let options = {
    DateFrom: '"'+dateFrom+'"',
    DateTo: '"'+dateTo+'"',
    LimitCount: parseInt(initialDataLoad),
};

return this.getList(this.ERPObjects.TProductStocknSalePeriodReport, options);
}

}
