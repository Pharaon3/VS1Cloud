import {BaseService} from "../js/base-service";
export class ReceiptService extends BaseService {
    getAllTripGroups() {
        let options = {
            PropertyList: "ID,TripName,Description",
            select: "[active]=true"
        };
        return this.getList(this.ERPObjects.TTripGroup, options);
    }

    getOneTripGroupData(id) {
        return this.getOneById(this.ERPObjects.TTripGroup, id);
    }

    getOneTripGroupDataExByName(dataSearchName) {
        let options = '';
        options = {
            ListType: "Detail",
            select: '[TripName]="'+dataSearchName+'"'
        };
        return this.getList(this.ERPObjects.TTripGroup, options);
    }

    saveTripGroup(data) {
        return this.POST(this.ERPObjects.TTripGroup, data);
    }

    getAllReceiptCategorys(limitcount, limitfrom, deleteFilter) {
        let options = {orderby: '"CategoryName asc"', IgnoreDates: true, PropertyList: "ID,CategoryName,CategoryDesc,Active"}
        if(deleteFilter == "" || deleteFilter == false || deleteFilter == null || deleteFilter == undefined){
            options = {...options, Search: "Active = true"}
        } 
        if (limitcount != "All") {            
            options = {...options, LimitCount: parseInt(limitcount), LimitFrom: parseInt(limitfrom)};
        }
        // options = {
        //     PropertyList: "ID,CategoryName,CategoryDesc",
        //     select: "[active]=true"
        // };
        return this.getList(this.ERPObjects.TReceiptCategory, options);
    }

    getOneReceiptCategoryDataExByName(dataSearchName) {
        let options = '';
        options = {
            ListType: "Detail",
            select: '[CategoryName]="'+dataSearchName+'"'
        };
        return this.getList(this.ERPObjects.TReceiptCategory, options);
    }

    getSearchReceiptCategoryByName(dataSearchName) {
        let options = '';
        options = {
            ListType: "Detail",
            // select: '[CategoryName] f7like "' + dataSearchName + '" and [Active]=true',
            Search: "Active = true AND (CategoryName like '%" + dataSearchName + "%' OR CategoryDesc like '%" + dataSearchName + "%')"
        };
        return this.getList(this.ERPObjects.TReceiptCategory, options);
    }

    saveReceiptCategory(data) {
        return this.POST(this.ERPObjects.TReceiptCategory, data);
    }
}
