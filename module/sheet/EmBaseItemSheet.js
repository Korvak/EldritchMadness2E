export default class EmBaseItemSheet extends ItemSheet {


    get template() {
        return "";
    }


    getData() {
        let data = super.getData();
        //system holds all the data
        console.log("item",data);
        return data;
    }

}