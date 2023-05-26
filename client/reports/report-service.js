import moment from "moment";
import { BaseService } from "../js/base-service.js";

export class ReportService extends BaseService {
    getCardDataReport(dateAsOf) {
        let options = '';
        options = {
            SelDate: '"' + dateAsOf + '"',
        };

        return this.getList(this.ERPObjects.TDashboardExecData1, options);
    }

    getCashReceivedData(dateFrom, dateTo) {
        let options = {
            IgnoreDates: false,
            OrderBy: "PaymentID desc",
            Search: " AND Deleted = 'F'",
            DateFrom: '"' + dateFrom + '"',
            DateTo: '"' + dateTo + '"',
        };
        return this.getList(this.ERPObjects.TCustomerPaymentList, options);
    }
    getCashSpentData(dateFrom, dateTo) {
        let options = {
            IgnoreDates: false,
            OrderBy: "PaymentID desc",
            Search: " AND Deleted = 'F'",
            DateFrom: '"' + dateFrom + '"',
            DateTo: '"' + dateTo + '"',
        };
        return this.getList(this.ERPObjects.TSupplierPaymentList, options);
    }

    getBalanceSheetReportOld(dateAsOf) {
        let options = {
            //select: "[Active]=true",
            //ListType:"Detail",
            DateFrom: '"' + dateAsOf + '"',
            DateTo: '"' + moment().format('YYYY-MM-DD') + '"',
        };
        return this.getList(this.ERPObjects.BalanceSheetReport, options);
    }

    // getBalanceSheetReport(dateAsOf) {
    //     let options = {
    //         //select: "[Active]=true",
    //         //ListType:"Detail",
    //         DateTo: '"' + dateAsOf + '"',
    //     };
    //     return this.getList(this.ERPObjects.BalanceSheetReport, options);
    // }

    getBalanceSheetReport(limitCount, limitFrom, dateFrom, dateTo, ignoreDate) {
        let options = "";
        if(limitCount == undefined || limitCount == 'All') {
            if (ignoreDate == true) {
                options = {
                    IgnoreDates: true,
                };
            } else {
                options = {
                    IgnoreDates: false,
                    DateFrom: '"' + dateFrom + '"',
                    DateTo: '"' + dateTo + '"',
                    // LimitCount: parseInt(initialReportLoad),
                };
            }
        } else {
            if (ignoreDate == true) {
                options = {
                    IgnoreDates: true,
                    // LimitCount: limitCount,
                    // LimitFrom: limitFrom,
                };
            } else {
                options = {
                    IgnoreDates: false,
                    DateFrom: '"' + dateFrom + '"',
                    DateTo: '"' + dateTo + '"',
                    // LimitCount: limitCount,
                    // LimitFrom: limitFrom,
                };
            }
        }
        return this.getList(this.ERPObjects.BalanceSheetReport, options);
    }

    getBalanceSheetReportByWord(limitCount, limitFrom, dateFrom, dateTo, ignoreDate, keyword) {
        let options = "";
        let search = `'Account Tree' like '%${keyword}%'`;
        if(limitCount == undefined || limitCount == 'All') {
            if (ignoreDate == true) {
                options = {
                    IgnoreDates: true,
                    Search: search
                };
            } else {
                options = {
                    IgnoreDates: false,
                    DateFrom: '"' + dateFrom + '"',
                    DateTo: '"' + dateTo + '"',
                    // LimitCount: parseInt(initialReportLoad),
                    Search: search
                };
            }
        } else {
            if (ignoreDate == true) {
                options = {
                    IgnoreDates: true,
                    // LimitCount: limitCount,
                    // LimitFrom: limitFrom,
                    Search: search
                };
            } else {
                options = {
                    IgnoreDates: false,
                    DateFrom: '"' + dateFrom + '"',
                    DateTo: '"' + dateTo + '"',
                    // LimitCount: limitCount,
                    // LimitFrom: limitFrom,
                    Search: search
                };
            }
        }
        return this.getList(this.ERPObjects.BalanceSheetReport, options);
    }

    getBalanceSheetReportByKeyword(keyword) {
        let options = {
            ListType: "Detail",
            Search: "ACCNAME like '%"+keyword+"%'"
        }
        return this.getList(this.ERPObjects.BalanceSheetReport, options);
    }

    getInvoicePaidReport(dateFrom, dateTo) {
        let options = {
            IgnoreDates: false,
            OrderBy: "PaymentID desc",
            Search: " AND Deleted = 'F'",
            DateFrom: '"' + dateFrom + '"',
            DateTo: '"' + dateTo + '"',
        };
        return this.getList(this.ERPObjects.TCustomerPaymentList, options);
    }
    getInvoiceUnpaidReport(dateFrom, dateTo) {
        let options = {
            IgnoreDates: false,
            IncludeIsInvoice: true,
            IncludeIsQuote: false,
            IncludeIsRefund: true,
            IncludeISSalesOrder: false,
            IsDetailReport: false,
            Paid: false,
            Unpaid: true,
            OrderBy: "SaleID desc",
            DateFrom: '"' + dateFrom + '"',
            DateTo: '"' + dateTo + '"',
        };
        return this.getList(this.ERPObjects.TSalesList, options);
    }
    getInvoiceBOReport(dateFrom, dateTo) {
        let options = {
            OrderBy: "SaleID desc",
            IgnoreDates: false,
            IncludeBo: true,
            IncludeShipped: false,
            IncludeLines: true,
            DateFrom: '"' + dateFrom + '"',
            DateTo: '"' + dateTo + '"',
        };
        return this.getList(this.ERPObjects.TInvoiceList, options);
    }

    getProfitLossReport() {
        let options = {
            select: "[Active]=true",
            ListType: "Detail",
            //DateTo:dateAsOf
        };
        return this.getList(this.ERPObjects.ProfitLossReport, options);
    }
    getBalanceSheet() {
        let options = {
            select: "[Active]=true",
            ListType: "Detail",
        };
        return this.getList(this.ERPObjects.BalanceSheetReport, options);
    }

    /*
     * get the contacts
     * */

    getContacts() {
        let options = {
            PropertyList: "ID,ClientID,ClientName,Company,CurrencySymbol,ContactAddress,ContactEmail,Active",
            select: "[Active]=true",
        };
        return this.getList(this.ERPObjects.TContact, options);
    }
    getBalanceSheetData() {
        return this.getList(this.ERPObjects.BalanceSheetReport);
    }

    getBalanceSheetRedirectData() {
        let options = {
            ReportType: "Detail",
            IgnoreSummarised: true,
            LimitCount: 25,
        };
        // return this.getList(this.ERPObjects.TAccount,options);
        return this.getList(this.ERPObjects.TAccountRunningBalanceReport, options);
    }

    getBalanceSheetRedirectRangeData(datefrom, dateto, limitcount, limitfrom) {
        let options = {
            ReportType: "Detail",
            IgnoreSummarised: true,
            IgnoreDates: false,
            DateTo: '"' + dateto + '"',
            DateFrom: '"' + datefrom + '"',
            LimitCount: parseInt(limitcount),
            LimitFrom: parseInt(limitfrom),
        };
        // return this.getList(this.ERPObjects.TAccount,options);
        return this.getList(this.ERPObjects.TAccountRunningBalanceReport, options);
    }

    getBalanceSheetRedirectClientData(accountName, limitcount, limitfrom, urlParametersDateFrom, urlParametersDateTo) {
        let options = '';
        if (urlParametersDateFrom != '' && urlParametersDateTo != '') {
            options = {
                ReportType: "Detail",
                IgnoreSummarised: true,
                AccountName: '"' + accountName + '"',
                OrderBy: "Date desc",
                DateFrom: '"' + urlParametersDateFrom + '"',
                DateTo: '"' + urlParametersDateTo + '"',
                LimitCount: parseInt(limitcount),
                LimitFrom: parseInt(limitfrom),
            };
        } else {
            options = {
                ReportType: "Detail",
                IgnoreSummarised: true,
                IgnoreDates: true,
                AccountName: '"' + accountName + '"',
                OrderBy: "clientname desc",
                LimitCount: parseInt(limitcount),
                LimitFrom: parseInt(limitfrom),
            };
        }
        // return this.getList(this.ERPObjects.TAccount,options);
        return this.getList(this.ERPObjects.TAccountRunningBalanceReport, options);
    }

    getGSTReconciliationData(dateFrom, dateTo) {
        let options = {
            ReportType: "Detail",
            DateTo: '"' + moment(dateTo).format("YYYY-MM-DD") + '"',
            DateFrom: '"' + moment(dateFrom).format("YYYY-MM-DD") + '"',
        };
        return this.getList(this.ERPObjects.TTaxSummaryReport, options);
    }
    getOneIncomeTransactionData(id) {
        return this.getOneById(this.ERPObjects.TCustomerPayment, id);
    }

    getOneExpenseTransactionData(id) {
        return this.getOneById(this.ERPObjects.TSupplierPayment, id);
    }

    ProfitLossData() {
        return this.getOneById(this.ERPObjects.ProfitLossReport);
    }

    getAccountSummaryRedirectData() {
        let options = {
            ListType: "Detail",
        };
        return this.getList(this.ERPObjects.TAccount, options);
    }

    getProfitandLoss(dateFrom, dateTo, ignoreDate, departments) {
        let options = "";
        if (ignoreDate == true) {
            options = {
                IgnoreDates: true,
            };
        } else if (departments != "") {
            options = {
                AllDepartments: false,
                IgnoreDates: false,
                DateFrom: '"' + dateFrom + '"',
                DateTo: '"' + dateTo + '"',
                SelectedDepartments: '"' + departments + '"',
            };
        } else {
            options = {
                IgnoreDates: false,
                DateFrom: '"' + dateFrom + '"',
                DateTo: '"' + dateTo + '"'
            };
        }
        return this.getList(this.ERPObjects.ProfitLossReport, options);
    }

    getProfitandLossCompare(dateFrom, dateTo, ignoreDate, periodType) {
        let options = "";
        if (ignoreDate == true) {
            options = {
                IgnoreDates: true,
                PeriodType: '"' + periodType + '"',
            };
        } else {
            options = {
                IgnoreDates: false,
                DateFrom: '"' + dateFrom + '"',
                DateTo: '"' + dateTo + '"',
                PeriodType: '"' + periodType + '"',
            };
        }

        return this.getList(
            this.ERPObjects.TProfitAndLossPeriodCompareReport,
            options
        );
    }

    getPayHistory(dateFrom, dateTo, ignoreDate = false, periodType = "") {
        let options = "";
        if (ignoreDate == true) {
            options = {
                IgnoreDates: ignoreDate,
                PeriodType: '"' + periodType + '"',
                ListType: "'Detail'",
            };
        } else if (periodType) {
            options = {
                IgnoreDates: ignoreDate,
                DateFrom: '"' + dateFrom + '"',
                DateTo: '"' + dateTo + '"',
                PeriodType: '"' + periodType + '"',
                ListType: "'Detail'",
            };
        } else {
            options = {
                IgnoreDates: ignoreDate,
                DateFrom: '"' + dateFrom + '"',
                DateTo: '"' + dateTo + '"',
                ListType: "'Detail'",
            };
        }

        return this.getList(
            this.ERPObjects.TPayHistory,
            options
        );
    }

    getTimeSheetEntry(dateFrom, dateTo, ignoreDate, periodType) {
        let options = "";
        if (ignoreDate == true) {
            options = {
                IgnoreDates: true,
                PeriodType: '"' + periodType + '"',
                ListType: "'Detail'",
            };
        } else {
            options = {
                IgnoreDates: false,
                DateFrom: '"' + dateFrom + '"',
                DateTo: '"' + dateTo + '"',
                PeriodType: '"' + periodType + '"',
                ListType: "'Detail'",
            };
        }

        return this.getList(
            this.ERPObjects.TTimeSheetEntry,
            options
        );
    }

    getDepartment() {
        let options = {
            PropertyList: "DeptClassName",
            select: "[Active]=true",
        };
        return this.getList(this.ERPObjects.TDeptClass, options);
    }

    getProfitLossLayout(id) {
        let options = {
            LayoutID: id,
        };
        return this.getList('VS1_PNLGetLayout', options);
    }

    getAgedPayableDetailsData(dateFrom, dateTo, ignoreDate) {
        let options = "";
        if (ignoreDate == true) {
            options = {
                IgnoreDates: true,
            };
        } else {
            options = {
                IgnoreDates: false,
                DateFrom: '"' + dateFrom + '"',
                DateTo: '"' + dateTo + '"',
            };
        }
        return this.getList(this.ERPObjects.TAPReport, options);
    }

    getAgedPayableDetailsSummaryData(limitCount, limitFrom, dateFrom, dateTo, ignoreDate, contactID) {
        let options = "";
        if (contactID != '') {
            options = {
                IgnoreDates: true,
                ReportType: "Summary",
                ClientID: contactID,
                LimitCount: limitCount,
                LimitFrom: limitFrom,
            };
        } else {

            if (ignoreDate == true) {
                options = {
                    IgnoreDates: true,
                    ReportType: "Summary",
                    LimitCount: limitCount,
                    LimitFrom: limitFrom,
                };
            } else {
                options = {
                    IgnoreDates: false,
                    ReportType: "Summary",
                    DateFrom: '"' + dateFrom + '"',
                    DateTo: '"' + dateTo + '"',
                    LimitCount: limitCount,
                    LimitFrom: limitFrom,
                };
            }
        }
        return this.getList(this.ERPObjects.TAPReport, options);
    }
    getAgedPayableDetailsSummaryDataByKeyword(limitCount, limitFrom, dateFrom, dateTo, ignoreDate, contactID, keyword) {
        let options = "";
        let Search = `'Name' like '%${keyword}%' OR 'PONumber' like '%${keyword}%' OR 'DueDate' like '%${keyword}%' OR 'AmountDue' like '%${keyword}%'
                    OR 'Current' like '%${keyword}%' OR '30Days' like '%${keyword}%' OR '60Days' like '%${keyword}%' OR '90Days' like '%${keyword}%' OR '120Days' like '%${keyword}%'`;
        if (contactID != '') {
            options = {
                IgnoreDates: true,
                ReportType: "Summary",
                ClientID: contactID,
                LimitCount: limitCount,
                LimitFrom: limitFrom,
                Search: Search
            };
        } else {

            if (ignoreDate == true) {
                options = {
                    IgnoreDates: true,
                    ReportType: "Summary",
                    LimitCount: limitCount,
                    LimitFrom: limitFrom,
                    Search: Search
                };
            } else {
                options = {
                    IgnoreDates: false,
                    ReportType: "Summary",
                    DateFrom: '"' + dateFrom + '"',
                    DateTo: '"' + dateTo + '"',
                    LimitCount: limitCount,
                    LimitFrom: limitFrom,
                    Search: Search
                };
            }
        }
        return this.getList(this.ERPObjects.TAPReport, options);
    }

    getAgedReceivableDetailsData(limitCount, limitFrom, dateFrom, dateTo, ignoreDate, contactID) {
        let options = "";
        if (contactID != '') {
            options = {
                IgnoreDates: true,
                ClientID: contactID,
                LimitCount: limitCount,
                LimitFrom: limitFrom,
            };
        } else {

            if (ignoreDate == true) {
                options = {
                    IgnoreDates: true,
                    LimitCount: limitCount,
                    LimitFrom: limitFrom,
                };
            } else {
                options = {
                    IgnoreDates: false,
                    DateFrom: '"' + dateFrom + '"',
                    DateTo: '"' + dateTo + '"',
                    LimitCount: limitCount,
                    LimitFrom: limitFrom,
                };
            }
        }
        return this.getList(this.ERPObjects.TARReport, options);
    }
    getAgedReceivableDetailsDataByKeyword(limitCount, limitFrom, dateFrom, dateTo, ignoreDate, contactID) {
        let options = "";
        let Search = `'Name' like '%${keyword}%' OR 'Type' like '%${keyword}%' OR 'InvoiceNumber' like '%${keyword}%' OR 'dueDate' like '%${keyword}%' OR 'AmountDue' like '%${keyword}%'
                    OR 'Current' like '%${keyword}%' OR '30Days' like '%${keyword}%' OR '60Days' like '%${keyword}%' OR '90Days' like '%${keyword}%' OR '120Days' like '%${keyword}%'`;
        if (contactID != '') {
            options = {
                IgnoreDates: true,
                ClientID: contactID,
                LimitCount: limitCount,
                LimitFrom: limitFrom,
                Search: Search
            };
        } else {

            if (ignoreDate == true) {
                options = {
                    IgnoreDates: true,
                    LimitCount: limitCount,
                    LimitFrom: limitFrom,
                    Search: Search
                };
            } else {
                options = {
                    IgnoreDates: false,
                    DateFrom: '"' + dateFrom + '"',
                    DateTo: '"' + dateTo + '"',
                    LimitCount: limitCount,
                    LimitFrom: limitFrom,
                    Search: Search
                };
            }
        }
        return this.getList(this.ERPObjects.TARReport, options);
    }

    getTAPReport(dateFrom, dateTo, ignoreDate, contactID) {
        let options = "";
        if (contactID != '') {
            options = {
                IgnoreDates: true,
                ClientID: contactID
            };
        } else {
            if (ignoreDate == true) {
                options = {
                    IgnoreDates: true
                };
            } else {
                options = {
                    IgnoreDates: false,
                    DateFrom: '"' + dateFrom + '"',
                    DateTo: '"' + dateTo + '"',
                };
            }
        }
        return this.getList(this.ERPObjects.TAPReport, options);
    }

    getAgedReceivableDetailsSummaryData(limitCount, limitFrom, dateFrom, dateTo, ignoreDate, contactID) {
        let options = "";
        if (contactID != '') {
            options = {
                IgnoreDates: true,
                ReportType: "Summary",
                ClientID: contactID,
                IncludeRefunds: false,
                LimitCount: limitCount,
                LimitFrom: limitFrom,
            };
        } else {
            if (ignoreDate == true) {
                options = {
                    IgnoreDates: true,
                    ReportType: "Summary",
                    IncludeRefunds: false,
                    LimitCount: limitCount,
                    LimitFrom: limitFrom,
                };
            } else {
                options = {
                    IgnoreDates: false,
                    ReportType: "Summary",
                    DateFrom: '"' + dateFrom + '"',
                    DateTo: '"' + dateTo + '"',
                    IncludeRefunds: false,
                    LimitCount: limitCount,
                    LimitFrom: limitFrom,
                };
            }
        }
        return this.getList(this.ERPObjects.TARReport, options);
    }
    getAgedReceivableDetailsSummaryDataByKeyword(limitCount, limitFrom, dateFrom, dateTo, ignoreDate, contactID, keyword) {
        let options = "";
        let Search = `'ACCOUNTNAME' like '%${keyword}%' OR 'ACCOUNTNUMBER' like '%${keyword}%' OR 'DATE' like '%${keyword}%' OR 'CLIENT NAME' like '%${keyword}%'
                    OR 'TYPE' like '%${keyword}%' OR 'DEBITSEX' like '%${keyword}%' OR 'CREDITSEX' like '%${keyword}%' OR 'AMOUNTEX' like '%${keyword}%'`;
        if (contactID != '') {
            options = {
                IgnoreDates: true,
                ReportType: "Summary",
                ClientID: contactID,
                IncludeRefunds: false,
                LimitCount: limitCount,
                LimitFrom: limitFrom,
                Search: Search
            };
        } else {
            if (ignoreDate == true) {
                options = {
                    IgnoreDates: true,
                    ReportType: "Summary",
                    IncludeRefunds: false,
                    LimitCount: limitCount,
                    LimitFrom: limitFrom,
                    Search: Search
                };
            } else {
                options = {
                    IgnoreDates: false,
                    ReportType: "Summary",
                    DateFrom: '"' + dateFrom + '"',
                    DateTo: '"' + dateTo + '"',
                    IncludeRefunds: false,
                    LimitCount: limitCount,
                    LimitFrom: limitFrom,
                    Search: Search
                };
            }
        }
        return this.getList(this.ERPObjects.TARReport, options);
    }

    getGeneralLedgerDetailsData(limitCount, limitFrom, dateFrom, dateTo, ignoreDate) {
        let options = "";
        if(limitCount == undefined || limitCount == 'All') {
            if (ignoreDate == true) {
                options = {
                    IgnoreDates: true,
                    OrderBy: "OrderDate desc"
                };
            } else {
                options = {
                    IgnoreDates: false,
                    DateFrom: '"' + dateFrom + '"',
                    DateTo: '"' + dateTo + '"',
                    LimitCount: parseInt(initialReportLoad),
                    OrderBy: "OrderDate desc"
                };
            }
        } else {
            if (ignoreDate == true) {
                options = {
                    IgnoreDates: true,
                    LimitCount: limitCount,
                    LimitFrom: limitFrom,
                    OrderBy: "OrderDate desc"
                };
            } else {
                options = {
                    IgnoreDates: false,
                    DateFrom: '"' + dateFrom + '"',
                    DateTo: '"' + dateTo + '"',
                    LimitCount: limitCount,
                    LimitFrom: limitFrom,
                    OrderBy: "OrderDate desc"
                };
            }
        }
        return this.getList(this.ERPObjects.TGeneralLedgerReport, options);
    }
    getGeneralLedgerDataByKeyword(limitCount, limitFrom, dateFrom, dateTo, ignoreDate, keyword) {
        let options = "";
        let Search = `'ACCOUNTNAME' like '%${keyword}%' OR 'ACCOUNTNUMBER' like '%${keyword}%' OR 'DATE' like '%${keyword}%' OR 'CLIENT NAME' like '%${keyword}%'
                    OR 'TYPE' like '%${keyword}%' OR 'DEBITSEX' like '%${keyword}%' OR 'CREDITSEX' like '%${keyword}%' OR 'AMOUNTEX' like '%${keyword}%'`;
        if(limitCount == undefined || limitCount == 'All') {
            if (ignoreDate == true) {
                options = {
                    IgnoreDates: true,
                    OrderBy: "OrderDate desc",
                    Search: Search
                };
            } else {
                options = {
                    IgnoreDates: false,
                    DateFrom: '"' + dateFrom + '"',
                    DateTo: '"' + dateTo + '"',
                    LimitCount: parseInt(initialReportLoad),
                    OrderBy: "OrderDate desc",
                    Search: Search
                };
            }
        } else {
            if (ignoreDate == true) {
                options = {
                    IgnoreDates: true,
                    LimitCount: limitCount,
                    LimitFrom: limitFrom,
                    OrderBy: "OrderDate desc",
                    Search: Search
                };
            } else {
                options = {
                    IgnoreDates: false,
                    DateFrom: '"' + dateFrom + '"',
                    DateTo: '"' + dateTo + '"',
                    LimitCount: limitCount,
                    LimitFrom: limitFrom,
                    OrderBy: "OrderDate desc",
                    Search: Search
                };
            }
        }
        return this.getList(this.ERPObjects.TGeneralLedgerReport, options);
    }
    getTrialBalanceDetailsData(limitCount, limitFrom, dateFrom, dateTo, ignoreDate) {
        let options = "";
        if(limitCount == undefined || limitCount == 'All') {
            if (ignoreDate == true) {
                options = {
                    IgnoreDates: true,
                    OrderBy: "OrderDate desc"
                };
            } else {
                options = {
                    IgnoreDates: false,
                    DateFrom: '"' + dateFrom + '"',
                    DateTo: '"' + dateTo + '"',
                    LimitCount: parseInt(initialReportLoad),
                    OrderBy: "OrderDate desc"
                };
            }
        } else {
            if (ignoreDate == true) {
                options = {
                    IgnoreDates: true,
                    LimitCount: limitCount,
                    LimitFrom: limitFrom,
                    OrderBy: "OrderDate desc"
                };
            } else {
                options = {
                    IgnoreDates: false,
                    DateFrom: '"' + dateFrom + '"',
                    DateTo: '"' + dateTo + '"',
                    LimitCount: limitCount,
                    LimitFrom: limitFrom,
                    OrderBy: "OrderDate desc"
                };
            }
        }
        return this.getList(this.ERPObjects.TTrialBalanceReport, options);
    }
    getTrialBalanceDetailsDataByKeyword(limitCount, limitFrom, dateFrom, dateTo, ignoreDate, keyword) {
        let options = "";
        let Search = `'AccountName' like '%${keyword}%' OR 'AccountNumber' like '%${keyword}%' OR 'Account' like '%${keyword}%' OR 'CreditsEx' like '%${keyword}%' OR 'DebitsEx' like '%${keyword}%'`;
        if(limitCount == undefined || limitCount == 'All') {
            if (ignoreDate == true) {
                options = {
                    IgnoreDates: true,
                    OrderBy: "OrderDate desc",
                    Search: Search
                };
            } else {
                options = {
                    IgnoreDates: false,
                    DateFrom: '"' + dateFrom + '"',
                    DateTo: '"' + dateTo + '"',
                    LimitCount: parseInt(initialReportLoad),
                    OrderBy: "OrderDate desc",
                    Search: Search
                };
            }
        } else {
            if (ignoreDate == true) {
                options = {
                    IgnoreDates: true,
                    LimitCount: limitCount,
                    LimitFrom: limitFrom,
                    OrderBy: "OrderDate desc",
                    Search: Search
                };
            } else {
                options = {
                    IgnoreDates: false,
                    DateFrom: '"' + dateFrom + '"',
                    DateTo: '"' + dateTo + '"',
                    LimitCount: limitCount,
                    LimitFrom: limitFrom,
                    OrderBy: "OrderDate desc",
                    Search: Search
                };
            }
        }
        return this.getList(this.ERPObjects.TTrialBalanceReport, options);
    }

    getPurchasesDetailsData(dateFrom, dateTo, ignoreDate) {
        let options = "";
        if (ignoreDate == true) {
            options = {
                IgnoreDates: true,
                IncludePOs: true,
            };
        } else {
            options = {
                IgnoreDates: false,
                IncludePOs: true,
                DateFrom: '"' + dateFrom + '"',
                DateTo: '"' + dateTo + '"',
            };
        }

        return this.getList(this.ERPObjects.TbillReport, options);
    }

    getPurchaseSummaryDetailsData(dateFrom, dateTo, ignoreDate) {
        let options = "";
        if (ignoreDate == true) {
            options = {
                IgnoreDates: true,
                IncludePOs: true,
                ReportType: "Summary",
            };
        } else {
            options = {
                IgnoreDates: false,
                IncludePOs: true,
                ReportType: "Summary",
                DateFrom: '"' + dateFrom + '"',
                DateTo: '"' + dateTo + '"',
            };
        }

        return this.getList(this.ERPObjects.TbillReport, options);
    }

    getSalesDetailsData(limitFrom, limitCount, dateFrom, dateTo, ignoreDate) {
        let options = "";
        if(limitCount == undefined || limitCount == 'All') {
            if (ignoreDate == true) {
                options = {
                    IgnoreDates: true,
                };
            } else {
                options = {
                    IgnoreDates: false,
                    DateFrom: '"' + dateFrom + '"',
                    DateTo: '"' + dateTo + '"',
                };
            }
        }
        else{
            if (ignoreDate == true) {
                options = {
                    IgnoreDates: true,
                    limitFrom: limitFrom,
                    limitCount: limitCount,
                };
            } else {
                options = {
                    IgnoreDates: false,
                    DateFrom: '"' + dateFrom + '"',
                    DateTo: '"' + dateTo + '"',
                    limitFrom: limitFrom,
                    limitCount: limitCount,
                };
            }
        }

        return this.getList(this.ERPObjects.TSalesList, options);
    }
    getSalesDetailsDataByKeyword(limitFrom, limitCount, dateFrom, dateTo, ignoreDate, keyword) {
        let options = "";
        let Search = `'CustomerName' like '%${keyword}%' OR 'Type' like '%${keyword}%' OR 'Saleno' like '%${keyword}%' OR 'SaleDate' like '%${keyword}%'
        OR 'employeename' like '%${keyword}%' OR 'TotalAmount' like '%${keyword}%' OR 'TotalTax' like '%${keyword}%' OR 'TotalAmountinc' like '%${keyword}%' OR 'Balance' like '%${keyword}%'`;
        if(limitCount == undefined || limitCount == 'All') {
            if (ignoreDate == true) {
                options = {
                    IgnoreDates: true,
                };
            } else {
                options = {
                    IgnoreDates: false,
                    DateFrom: '"' + dateFrom + '"',
                    DateTo: '"' + dateTo + '"',
                };
            }
        }
        else{
            if (ignoreDate == true) {
                options = {
                    IgnoreDates: true,
                    limitFrom: limitFrom,
                    limitCount: limitCount,
                };
            } else {
                options = {
                    IgnoreDates: false,
                    DateFrom: '"' + dateFrom + '"',
                    DateTo: '"' + dateTo + '"',
                    limitFrom: limitFrom,
                    limitCount: limitCount,
                };
            }
        }

        return this.getList(this.ERPObjects.TSalesList, options);
    }

    getSalesDetailsSummaryData(limitFrom, limitCount, dateFrom, dateTo, ignoreDate) {
        let options = "";
        if(limitCount == undefined || limitCount == 'All') {
            if (ignoreDate == true) {
                options = {
                    IgnoreDates: true,
                    ListType: "Summary"
                };
            } else {
                options = {
                    IgnoreDates: false,
                    DateFrom: '"' + dateFrom + '"',
                    DateTo: '"' + dateTo + '"',
                    ListType: "Summary"
                };
            }
        }
        else{
            if (ignoreDate == true) {
                options = {
                    IgnoreDates: true,
                    limitFrom: limitFrom,
                    limitCount: limitCount,
                    ListType: "Summary"
                };
            } else {
                options = {
                    IgnoreDates: false,
                    DateFrom: '"' + dateFrom + '"',
                    DateTo: '"' + dateTo + '"',
                    limitFrom: limitFrom,
                    limitCount: limitCount,
                    ListType: "Summary"
                };
            }
        }

        return this.getList(this.ERPObjects.TSalesList, options);
    }
    getSalesDetailsSummaryDataByKeyword(limitFrom, limitCount, dateFrom, dateTo, ignoreDate, keyword) {
        let options = "";
        let Search = `'CustomerName' like '%${keyword}%' OR 'Type' like '%${keyword}%' OR 'Saleno' like '%${keyword}%' OR 'SaleDate' like '%${keyword}%'
        OR 'employeename' like '%${keyword}%' OR 'TotalAmount' like '%${keyword}%' OR 'TotalTax' like '%${keyword}%' OR 'TotalAmountinc' like '%${keyword}%' OR 'Balance' like '%${keyword}%'`;
        if(limitCount == undefined || limitCount == 'All') {
            if (ignoreDate == true) {
                options = {
                    IgnoreDates: true,
                    ListType: "Summary",
                    Search: Search
                };
            } else {
                options = {
                    IgnoreDates: false,
                    DateFrom: '"' + dateFrom + '"',
                    DateTo: '"' + dateTo + '"',
                    ListType: "Summary",
                    Search: Search
                };
            }
        }
        else{
            if (ignoreDate == true) {
                options = {
                    IgnoreDates: true,
                    limitFrom: limitFrom,
                    limitCount: limitCount,
                    ListType: "Summary",
                    Search: Search
                };
            } else {
                options = {
                    IgnoreDates: false,
                    DateFrom: '"' + dateFrom + '"',
                    DateTo: '"' + dateTo + '"',
                    limitFrom: limitFrom,
                    limitCount: limitCount,
                    ListType: "Summary",
                    Search: Search
                };
            }
        }

        return this.getList(this.ERPObjects.TSalesList, options);
    }

    getProductSalesDetailsData(dateFrom, dateTo, ignoreDate) {
        let options = "";
        if (ignoreDate == true) {
            options = {
                IgnoreDates: true,
            };
        } else {
            options = {
                IgnoreDates: false,
                DateFrom: '"' + dateFrom + '"',
                DateTo: '"' + dateTo + '"',
            };
        }

        return this.getList(this.ERPObjects.TProductSalesDetailsReport, options);
    }

    getTaxSummaryData(dateFrom, dateTo, ignoreDate = false) {
        let options = "";
        if (ignoreDate == true) {
            options = {
                IgnoreDates: true,
                ReportType: "Summary",
            };
        } else {
            options = {
                IgnoreDates: ignoreDate,
                ReportType: "Summary",
                DateFrom: '"' + dateFrom + '"',
                DateTo: '"' + dateTo + '"',
            };
        }
        return this.getList(this.ERPObjects.TTaxSummaryReport, options);
    }

    getAllProductSalesDetails(limitFrom, limitCount, dateFrom, dateTo, ignoreDate = false) {
        let options = "";
        if (ignoreDate == true) {
            options = {
                IgnoreDates: true,
                LimitCount: limitCount,
                LimitFrom: limitFrom,
            };
        } else {
            options = {
                IgnoreDates: ignoreDate,
                DateFrom: '"' + dateFrom + '"',
                DateTo: '"' + dateTo + '"',
                LimitCount: limitCount,
                LimitFrom: limitFrom,
            };
        }
        return this.getList(this.ERPObjects.TProductSalesDetailsReport, options);
    }
    getAllProductSalesDetailsByKeyword(limitFrom, limitCount, dateFrom, dateTo, ignoreDate , keyword) {
        let options = "";
        let Search = `'ProductName' like '%${keyword}%' OR 'TransactionType' like '%${keyword}%' OR 'InvoiceNo' like '%${keyword}%' OR 'SaleDate' like '%${keyword}%'
                    OR 'CustomerName' like '%${keyword}%' OR 'Qty' like '%${keyword}%' OR 'Line Cost (Ex)' like '%${keyword}%' OR 'Total Amount (Ex)' like '%${keyword}%' OR 'Total Profit (Ex)' like '%${keyword}%'`;
        if (ignoreDate == true) {
            options = {
                IgnoreDates: true,
                LimitCount: limitCount,
                LimitFrom: limitFrom,
                Search: Search
            };
        } else {
            options = {
                IgnoreDates: ignoreDate,
                DateFrom: '"' + dateFrom + '"',
                DateTo: '"' + dateTo + '"',
                LimitCount: limitCount,
                LimitFrom: limitFrom,
                Search: Search
            };
        }
        return this.getList(this.ERPObjects.TProductSalesDetailsReport, options);
    }

    getContractorPaymentSummaryData(dateFrom, dateTo, ignoreDate) {
        let options = "";
        if (ignoreDate == true) {
            options = {
                IgnoreDates: true,
            };
        } else {
            options = {
                IgnoreDates: false,
                DateFrom: '"' + dateFrom + '"',
                DateTo: '"' + dateTo + '"',
            };
        }

        return this.getList(this.ERPObjects.TContractorPaymentSummary, options);
    }

    /**
     * This function will return CustomerDetails
     *
     * @param {*} dateFrom
     * @param {*} dateTo
     * @param {*} ignoreDate
     * @returns
     */
    getCustomerDetails(dateFrom, dateTo, ignoreDate = false) {
        let options = "";
        if (ignoreDate == true) {
            options = {
                IgnoreDates: true,
            };
        } else {
            options = {
                IgnoreDates: false,
                DateFrom: '"' + dateFrom + '"',
                DateTo: '"' + dateTo + '"',
            };
        }
        return this.getList(this.ERPObjects.TCustomerPayment, options);
    }

    getleaveAccruals(dateFrom, dateTo, ignoreDate = false) {
        let options = "";
        if (ignoreDate == true) {
            options = {
                IgnoreDates: true,
                ListType: "'Detail'"
            };
        } else {
            options = {
                IgnoreDates: false,
                DateFrom: '"' + dateFrom + '"',
                DateTo: '"' + dateTo + '"',
                ListType: "'Detail'"
            };
        }
        return this.getList(this.ERPObjects.TleaveAccruals, options);
        // return this.getList(this.ERPObjects.TLeaveAccrualList, options);
    }

    getStockQuantityLocationReport(dateFrom, dateTo, ignoreDate = false) {
        let options = "";
        if (ignoreDate == true) {
            options = {
                IgnoreDates: true,
            };
        } else {
            options = {
                IgnoreDates: false,
                DateFrom: '"' + dateFrom + '"',
                DateTo: '"' + dateTo + '"',
            };
        }
        return this.getList(this.ERPObjects.TStockQuantityLocation, options);
    }

    getStockValueReport(dateFrom, dateTo, ignoreDate = false) {
        let options = "";
        if (ignoreDate == true) {
            options = {
                IgnoreDates: true,
            };
        } else {
            options = {
                IgnoreDates: false,
                DateFrom: '"' + dateFrom + '"',
                DateTo: '"' + dateTo + '"',
            };
        }
        return this.getList(this.ERPObjects.TStockValue, options);
    }

    getLeaveTakenReport(dateFrom, dateTo, ignoreDate = false) {
        let options = "";
        if (ignoreDate == true) {
            options = {
                IgnoreDates: true,
            };
        } else {
            options = {
                IgnoreDates: false,
                DateFrom: '"' + dateFrom + '"',
                DateTo: '"' + dateTo + '"',
            };
        }
        return this.getList(this.ERPObjects.TLeaveTaken, options);
    }

    getSupplierProductReport(limitCount, limitFrom, dateFrom, dateTo, ignoreDate) {
        let options = "";
        if(limitCount == undefined || limitCount == 'All') {
            if (ignoreDate == true) {
                options = {
                    IgnoreDates: true,
                };
            } else {
                options = {
                    IgnoreDates: false,
                    DateFrom: '"' + dateFrom + '"',
                    DateTo: '"' + dateTo + '"',
                    LimitCount: parseInt(initialReportLoad),
                };
            }
        } else {
            if (ignoreDate == true) {
                options = {
                    IgnoreDates: true,
                    LimitCount: limitCount,
                    LimitFrom: limitFrom,
                };
            } else {
                options = {
                    IgnoreDates: false,
                    DateFrom: '"' + dateFrom + '"',
                    DateTo: '"' + dateTo + '"',
                    LimitCount: limitCount,
                    LimitFrom: limitFrom,
                };
            }
        }
        return this.getList(this.ERPObjects.TSupplierProduct, options);
    }
    getSupplierProductReportByKeyword(limitCount, limitFrom, dateFrom, dateTo, ignoreDate, keyword) {
        let options = "";
        let Search = `'ACCOUNTNAME' like '%${keyword}%' OR 'ACCOUNTNUMBER' like '%${keyword}%' OR 'DATE' like '%${keyword}%' OR 'CLIENT NAME' like '%${keyword}%'
                    OR 'TYPE' like '%${keyword}%' OR 'DEBITSEX' like '%${keyword}%' OR 'CREDITSEX' like '%${keyword}%' OR 'AMOUNTEX' like '%${keyword}%'`;
        if(limitCount == undefined || limitCount == 'All') {
            if (ignoreDate == true) {
                options = {
                    IgnoreDates: true,
                    Search: Search
                };
            } else {
                options = {
                    IgnoreDates: false,
                    DateFrom: '"' + dateFrom + '"',
                    DateTo: '"' + dateTo + '"',
                    LimitCount: parseInt(initialReportLoad),
                    Search: Search
                };
            }
        } else {
            if (ignoreDate == true) {
                options = {
                    IgnoreDates: true,
                    LimitCount: limitCount,
                    LimitFrom: limitFrom,
                    Search: Search
                };
            } else {
                options = {
                    IgnoreDates: false,
                    DateFrom: '"' + dateFrom + '"',
                    DateTo: '"' + dateTo + '"',
                    LimitCount: limitCount,
                    LimitFrom: limitFrom,
                    Search: Search
                };
            }
        }
        return this.getList(this.ERPObjects.TSupplierProduct, options);
    }


    getStockMovementReport(limitCount, limitFrom, dateFrom, dateTo, ignoreDate = false) {
        let options = "";
        if(limitCount == undefined || limitCount == 'All') {
            if (ignoreDate == true) {
                options = {
                    IgnoreDates: true,
                    ListType: "'Detail'"
                };
            } else {
                options = {
                    IgnoreDates: false,
                    ListType: "'Detail'",
                    DateFrom: '"' + dateFrom + '"',
                    DateTo: '"' + dateTo + '"',
                    LimitCount: parseInt(initialReportLoad),
                };
            }
        } else {
            if (ignoreDate == true) {
                options = {
                    IgnoreDates: true,
                    ListType: "'Detail'",
                    LimitCount: limitCount,
                    LimitFrom: limitFrom,
                };
            } else {
                options = {
                    IgnoreDates: false,
                    ListType: "'Detail'",
                    DateFrom: '"' + dateFrom + '"',
                    DateTo: '"' + dateTo + '"',
                    LimitCount: limitCount,
                    LimitFrom: limitFrom,
                };
            }
        }
        // return this.getList(this.ERPObjects.TProductMovementList, options);
        return this.getList(this.ERPObjects.TStockMovement, options);
    }

    getStockMovementDataByKeyword(limitCount, limitFrom, dateFrom, dateTo, ignoreDate = false, keyword) {
        let options = "";
        let search = 'ProductName like "%'+keyword+'%"';
        if(limitCount == undefined || limitCount == 'All') {
            if (ignoreDate == true) {
                options = {
                    IgnoreDates: true,
                    ListType: "'Detail'",
                    Search: search
                };
            } else {
                options = {
                    IgnoreDates: false,
                    ListType: "'Detail'",
                    DateFrom: '"' + dateFrom + '"',
                    DateTo: '"' + dateTo + '"',
                    LimitCount: parseInt(initialReportLoad),
                    Search: search
                };
            }
        } else {
            if (ignoreDate == true) {
                options = {
                    IgnoreDates: true,
                    ListType: "'Detail'",
                    LimitCount: limitCount,
                    LimitFrom: limitFrom,
                    Search: search
                };
            } else {
                options = {
                    IgnoreDates: false,
                    ListType: "'Detail'",
                    DateFrom: '"' + dateFrom + '"',
                    DateTo: '"' + dateTo + '"',
                    LimitCount: limitCount,
                    LimitFrom: limitFrom,
                    Search: search
                };
            }
        }
        return this.getList(this.ERPObjects.TStockMovement, options);
    }

    getSerialNumberReport(dateFrom, dateTo, ignoreDate = false) {
        let options = "";
        if (ignoreDate == true) {
            options = {
                IgnoreDates: true,
                ListType: "'Detail'"
            };
        } else {
            options = {
                IgnoreDates: false,
                DateFrom: '"' + dateFrom + '"',
                DateTo: '"' + dateTo + '"',
                ListType: "'Detail'"
            };
        }
        return this.getList(this.ERPObjects.TSerialNumberListCurrentReport, options);
    }

    getBinLocationReport(dateFrom, dateTo, ignoreDate = false) {
        let options = "";
        if (ignoreDate == true) {
            options = {
                IgnoreDates: true,
                ListType: "'Detail'"
            };
        } else {
            options = {
                IgnoreDates: false,
                DateFrom: '"' + dateFrom + '"',
                DateTo: '"' + dateTo + '"',
                ListType: "'Detail'"
            };
        }
        return this.getList(this.ERPObjects.TProductBin, options);
    }

    getTransactionJournalReport(dateFrom, dateTo, ignoreDate = false) {
        let options = "";
        if (ignoreDate == true) {
            options = {
                IgnoreDates: true,
                FilterIndex: 2
            };
        } else {
            options = {
                IgnoreDates: false,
                DateFrom: '"' + dateFrom + '"',
                DateTo: '"' + dateTo + '"',
                FilterIndex: 2
            };
        }
        return this.getList(this.ERPObjects.TTransactionListReport, options);
    }

    getJobSalesSummaryReport(limitCount, limitFrom, dateFrom, dateTo, ignoreDate = false) {
        let options = "";
        if(limitCount == undefined || limitCount == 'All') {
            if (ignoreDate == true) {
                options = {
                    IgnoreDates: true,
                };
            } else {
                options = {
                    IgnoreDates: false,
                    DateFrom: '"' + dateFrom + '"',
                    DateTo: '"' + dateTo + '"',
                    LimitCount: parseInt(initialReportLoad),
                };
            }
        } else {
            if (ignoreDate == true) {
                options = {
                    IgnoreDates: true,
                    LimitCount: limitCount,
                    LimitFrom: limitFrom,
                };
            } else {
                options = {
                    IgnoreDates: false,
                    DateFrom: '"' + dateFrom + '"',
                    DateTo: '"' + dateTo + '"',
                    LimitCount: limitCount,
                    LimitFrom: limitFrom,
                };
            }
        }
        return this.getList(this.ERPObjects.TJobSalesSummary, options);
    }

    getJobSalesSummaryDataByKeyword(limitCount, limitFrom, dateFrom, dateTo, ignoreDate = false, keyword) {
        let options = "";
        let search = 'Customer like "%'+keyword+'%"';
        if(limitCount == undefined || limitCount == 'All') {
            if (ignoreDate == true) {
                options = {
                    IgnoreDates: true,
                    Search: search
                };
            } else {
                options = {
                    IgnoreDates: false,
                    DateFrom: '"' + dateFrom + '"',
                    DateTo: '"' + dateTo + '"',
                    LimitCount: parseInt(initialReportLoad),
                    Search: search
                };
            }
        } else {
            if (ignoreDate == true) {
                options = {
                    IgnoreDates: true,
                    LimitCount: limitCount,
                    LimitFrom: limitFrom,
                    Search: search
                };
            } else {
                options = {
                    IgnoreDates: false,
                    DateFrom: '"' + dateFrom + '"',
                    DateTo: '"' + dateTo + '"',
                    LimitCount: limitCount,
                    LimitFrom: limitFrom,
                    Search: search
                };
            }
        }
        return this.getList(this.ERPObjects.TJobSalesSummary, options);
    }

    getJobProfitabilityReport(limitCount, limitFrom, dateFrom, dateTo, ignoreDate = false) {
        let options = "";
        if(limitCount == undefined || limitCount == 'All') {
            if (ignoreDate == true) {
                options = {
                    IgnoreDates: true,
                };
            } else {
                options = {
                    IgnoreDates: false,
                    DateFrom: '"' + dateFrom + '"',
                    DateTo: '"' + dateTo + '"',
                    LimitCount: parseInt(initialReportLoad),
                };
            }
        } else {
            if (ignoreDate == true) {
                options = {
                    IgnoreDates: true,
                    LimitCount: limitCount,
                    LimitFrom: limitFrom,
                };
            } else {
                options = {
                    IgnoreDates: false,
                    DateFrom: '"' + dateFrom + '"',
                    DateTo: '"' + dateTo + '"',
                    LimitCount: limitCount,
                    LimitFrom: limitFrom,
                };
            }
        }
        return this.getList(this.ERPObjects.TJobProfitability, options);
    }

    getJobProfitabilityDataByKeyword(limitCount, limitFrom, dateFrom, dateTo, ignoreDate = false, keyword) {
        let options = "";
        let search = 'CompanyName like "%'+keyword+'%"';
        if(limitCount == undefined || limitCount == 'All') {
            if (ignoreDate == true) {
                options = {
                    IgnoreDates: true,
                    Search: search
                };
            } else {
                options = {
                    IgnoreDates: false,
                    DateFrom: '"' + dateFrom + '"',
                    DateTo: '"' + dateTo + '"',
                    LimitCount: parseInt(initialReportLoad),
                    Search: search
                };
            }
        } else {
            if (ignoreDate == true) {
                options = {
                    IgnoreDates: true,
                    LimitCount: limitCount,
                    LimitFrom: limitFrom,
                    Search: search
                };
            } else {
                options = {
                    IgnoreDates: false,
                    DateFrom: '"' + dateFrom + '"',
                    DateTo: '"' + dateTo + '"',
                    LimitCount: limitCount,
                    LimitFrom: limitFrom,
                    Search: search
                };
            }
        }
        return this.getList(this.ERPObjects.TJobProfitability, options);
    }

    getCustomerDetailReport(limitCount, limitFrom, dateFrom, dateTo, ignoreDate) {
        let options = "";
        if(limitCount == undefined || limitCount == 'All') {
            if (ignoreDate == true) {
                options = {
                    IgnoreDates: true,
                    ListType: "Detail",
                };
            } else {
                options = {
                    IgnoreDates: false,
                    DateFrom: '"' + dateFrom + '"',
                    DateTo: '"' + dateTo + '"',
                    LimitCount: parseInt(initialReportLoad),
                    ListType: "Detail",
                };
            }
        } else {
            if (ignoreDate == true) {
                options = {
                    IgnoreDates: true,
                    LimitCount: limitCount,
                    LimitFrom: limitFrom,
                    ListType: "Detail",
                };
            } else {
                options = {
                    IgnoreDates: false,
                    DateFrom: '"' + dateFrom + '"',
                    DateTo: '"' + dateTo + '"',
                    LimitCount: limitCount,
                    LimitFrom: limitFrom,
                    ListType: "Detail",
                };
            }
        }
        return this.getList(this.ERPObjects.TCustomerSummaryReport, options);
    }
    getCustomerDetailReportByKeyword(limitCount, limitFrom, dateFrom, dateTo, ignoreDate, keyword) {
        let options = "";
        let Search = `'ACCOUNTNAME' like '%${keyword}%' OR 'ACCOUNTNUMBER' like '%${keyword}%' OR 'DATE' like '%${keyword}%' OR 'CLIENT NAME' like '%${keyword}%'
                    OR 'TYPE' like '%${keyword}%' OR 'DEBITSEX' like '%${keyword}%' OR 'CREDITSEX' like '%${keyword}%' OR 'AMOUNTEX' like '%${keyword}%'`;
        if(limitCount == undefined || limitCount == 'All') {
            if (ignoreDate == true) {
                options = {
                    IgnoreDates: true,
                    SummaryDetailIdx: 2,
                    Search: Search,
                    ListType: "Detail",
                };
            } else {
                options = {
                    IgnoreDates: false,
                    DateFrom: '"' + dateFrom + '"',
                    DateTo: '"' + dateTo + '"',
                    LimitCount: parseInt(initialReportLoad),
                    SummaryDetailIdx: 2,
                    Search: Search,
                    ListType: "Detail",
                };
            }
        } else {
            if (ignoreDate == true) {
                options = {
                    IgnoreDates: true,
                    LimitCount: limitCount,
                    LimitFrom: limitFrom,
                    SummaryDetailIdx: 2,
                    Search: Search,
                    ListType: "Detail",
                };
            } else {
                options = {
                    IgnoreDates: false,
                    DateFrom: '"' + dateFrom + '"',
                    DateTo: '"' + dateTo + '"',
                    LimitCount: limitCount,
                    LimitFrom: limitFrom,
                    SummaryDetailIdx: 2,
                    Search: Search,
                    ListType: "Detail",
                };
            }
        }
        return this.getList(this.ERPObjects.TCustomerSummaryReport, options);
    }

    getCustomerSummaryReport(limitCount, limitFrom, dateFrom, dateTo, ignoreDate) {
        let options = "";
        if(limitCount == undefined || limitCount == 'All') {
            if (ignoreDate == true) {
                options = {
                    IgnoreDates: true,
                    ListType: "Summary",
                };
            } else {
                options = {
                    IgnoreDates: false,
                    DateFrom: '"' + dateFrom + '"',
                    DateTo: '"' + dateTo + '"',
                    LimitCount: parseInt(initialReportLoad),
                    ListType: "Summary",
                };
            }
        } else {
            if (ignoreDate == true) {
                options = {
                    IgnoreDates: true,
                    LimitCount: limitCount,
                    LimitFrom: limitFrom,
                    ListType: "Summary",
                };
            } else {
                options = {
                    IgnoreDates: false,
                    DateFrom: '"' + dateFrom + '"',
                    DateTo: '"' + dateTo + '"',
                    LimitCount: limitCount,
                    LimitFrom: limitFrom,
                    ListType: "Summary",
                };
            }
        }
        return this.getList(this.ERPObjects.TCustomerSummaryReport, options);
    }
    getCustomerSummaryReportByKeyword(limitCount, limitFrom, dateFrom, dateTo, ignoreDate, keyword) {
        let options = "";
        let Search = `'ACCOUNTNAME' like '%${keyword}%' OR 'ACCOUNTNUMBER' like '%${keyword}%' OR 'DATE' like '%${keyword}%' OR 'CLIENT NAME' like '%${keyword}%'
                    OR 'TYPE' like '%${keyword}%' OR 'DEBITSEX' like '%${keyword}%' OR 'CREDITSEX' like '%${keyword}%' OR 'AMOUNTEX' like '%${keyword}%'`;
        if(limitCount == undefined || limitCount == 'All') {
            if (ignoreDate == true) {
                options = {
                    IgnoreDates: true,
                    SummaryDetailIdx: 2,
                    Search: Search,
                    ListType: "Summary",
                };
            } else {
                options = {
                    IgnoreDates: false,
                    DateFrom: '"' + dateFrom + '"',
                    DateTo: '"' + dateTo + '"',
                    LimitCount: parseInt(initialReportLoad),
                    SummaryDetailIdx: 2,
                    Search: Search,
                    ListType: "Summary",
                };
            }
        } else {
            if (ignoreDate == true) {
                options = {
                    IgnoreDates: true,
                    LimitCount: limitCount,
                    LimitFrom: limitFrom,
                    SummaryDetailIdx: 2,
                    Search: Search,
                    ListType: "Summary",
                };
            } else {
                options = {
                    IgnoreDates: false,
                    DateFrom: '"' + dateFrom + '"',
                    DateTo: '"' + dateTo + '"',
                    LimitCount: limitCount,
                    LimitFrom: limitFrom,
                    SummaryDetailIdx: 2,
                    Search: Search,
                    ListType: "Summary",
                };
            }
        }
        return this.getList(this.ERPObjects.TCustomerSummaryReport, options);
    }

    getTaxCodesDetailVS1() {
        let options = {
            ListType: "Detail",
            select: "[Active]=true",
        };
        let that = this;
        let promise = new Promise(function(resolve, reject) {
            that.getList(that.ERPObjects.TTaxcodeVS1, options).then(function(data) {
                let ttaxcodevs1 = data.ttaxcodevs1.map((v) => {
                    let fields = v.fields;
                    let lines = fields.Lines;
                    if (lines !== null) {
                        if (Array.isArray(lines)) { // if lines is array
                            lines = lines.map((line) => {
                                let f = line.fields;
                                return {
                                    ... { Id: f.ID },
                                    ...f,
                                }
                            })
                        } else if (typeof lines === 'object') { // else if it is object
                            lines = [{
                                ... { Id: lines.fields.ID },
                                ...lines.fields
                            }];
                        }
                    }
                    return {
                        ... { Id: fields.ID },
                        ...fields,
                        ... { Lines: lines }
                    }
                });
                resolve({ ttaxcodevs1 });
            }).catch(function(err) {
                reject(err);
            })
        });
        return promise;
    }

    saveBASReturn(data) {
        return this.POST(this.ERPObjects.TBASReturn, data);
    }

    getAllBASReturn(dateFrom, dateTo, ignoreDate, limitcount, limitfrom, deleteFilter) {
        let options = "";

        if (ignoreDate == true) {
            options = {
                IgnoreDates: true,
                Search: "",
                OrderBy: "ID desc",
                LimitCount: parseInt(limitcount)||initialReportLoad,
                LimitFrom: parseInt(limitfrom)||0,
                ListType: "Detail",
            };
        } else {
            options = {
                OrderBy: "ID desc",
                IgnoreDates: false,
                Search: "",
                DateFrom: '"' + dateFrom + '"',
                DateTo: '"' + dateTo + '"',
                LimitCount: parseInt(limitcount) || initialReportLoad,
                LimitFrom: parseInt(limitfrom) || 0,
                ListType: "Detail",
            };
        }
        if (deleteFilter) options.Search = "Active != true"
        return this.getList(this.ERPObjects.TBASReturn, options);
    }

    getBASReturnByName(dataSearchName) {
        let options = "";
        options = {
            ListType: "Detail",
            select:'[BasSheetDesc] f7like "' +dataSearchName +'"',
        };
        return this.getList(this.ERPObjects.TBASReturn, options);
    }

    getOneBASReturn(id) {
        let options = {
            select: "[ID]=" + id,
            ListType: "Detail",
        };
        return this.getList(this.ERPObjects.TBASReturn, options);
    }

    saveVATReturn(data) {
        return this.POST(this.ERPObjects.TVATReturn, data);
    }

    getAllVATReturn( dateFrom, dateTo, ignoreDate, limitcount, limitfrom, deleteFilter ) {
        let options = "";

        if (ignoreDate == true) {
            options = {
                IgnoreDates: true,
                Select: "Active=true",
                OrderBy: "ID desc",
                LimitCount: parseInt(limitcount) || initialReportLoad,
                LimitFrom: parseInt(limitfrom) || 0,
                ListType: "Detail",
            };
        } else {
            options = {
                OrderBy: "ID desc",
                IgnoreDates: false,
                Select: "Active=true",
                DateFrom: '"' + dateFrom + '"',
                DateTo: '"' + dateTo + '"',
                LimitCount: parseInt(limitcount) || initialReportLoad,
                LimitFrom: parseInt(limitfrom) || 0,
                ListType: "Detail",
            };
        }
        if (deleteFilter) options.Select = ""
        return this.getList(this.ERPObjects.TVATReturn, options);
    };

    getVATReturnByDescription(description) {
        let options = {
            IgnoreDates: true,
            Select: "Active=true and VATDesc = '" + description + "'",
            OrderBy: "ID desc",
            ListType: "Detail",
        };
        return this.getList(this.ERPObjects.TVATReturn, options);
    };

    getOneVATReturn(id) {
        let options = {
            select: "[ID]=" + id,
            ListType: "Detail",
        };
        return this.getList(this.ERPObjects.TVATReturn, options);
    }

    savePNLNewGroup(data) {
        return this.POST('VS1_Cloud_Task/Method?Name="VS1_PNLAddGroup"', data);
    }

    deletePNLGroup(data) {
        return this.POST('VS1_Cloud_Task/Method?Name="VS1_PNLDeleteGroup"', data);
    }

    movePNLGroup(data) {
        return this.POST('VS1_Cloud_Task/Method?Name="VS1_PNLMoveAccount"', data);
    }

    editPNLGroup(data) {
        return this.POST('VS1_Cloud_Task/Method?Name="VS1_PNLRenameGroup"', data);
    }

    getPNLLayout(limitcount, limitfrom, deleteFilter) {
        let options = {
            PropertyList: "ID, Description, LName, IsCurrentLayout",
        };
        if (deleteFilter) options.Search = "Active != true"
        return this.getList(
            this.ERPObjects.TPNLLayout,
            options
        );
    }

    searchPNLLayout(dataSearchName) {
        let options = {
            PropertyList: "ID, Description, LName, IsCurrentLayout",
            select: `[LName] f7like "${dataSearchName}" OR [Description] f7like "${dataSearchName}" OR [ID] f7like "${dataSearchName}"`,
        };
        return this.getList(
            this.ERPObjects.TPNLLayout,
            options
        );
    }

    savePNLLayout(data) {
        return this.POST(this.ERPObjects.TPNLLayout, data);
    }

}
