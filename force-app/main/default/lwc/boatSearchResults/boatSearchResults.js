import { LightningElement, api, wire, track } from "lwc";
import { updateRecord } from "lightning/uiRecordApi";
import getBoats from "@salesforce/apex/BoatDataService.getBoats";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { refreshApex } from "@salesforce/apex";
import { publish, MessageContext } from "lightning/messageService";
//import { subscribe, unsubscribe, APPLICATION_SCOPE, MessageContext, publish } from 'lightning/messageService';
//import BOATMC from "@salesforce/messageChannel/BoatMessageChannel__c";
//export default class BoatSearchResults extends LightningElement {}
// ...
const SUCCESS_TITLE = "Success";
const MESSAGE_SHIP_IT = "Ship it!";
const SUCCESS_VARIANT = "success";
const ERROR_TITLE = "Error";
const ERROR_VARIANT = "error";
const COLUMNS = [
  { label: "Name", fieldName: "Name", type: "text", editable: "true" },
  { label: "Length", fieldName: "Length__c", type: "number", editable: "true" },
  { label: "Price", fieldName: "Price__c", type: "currency", editable: "true" },
  {
    label: "Description",
    fieldName: "Description__c",
    type: "text",
    editable: "true"
  }
];

export default class BoatSearchResults extends LightningElement {
  @api boatTypeId = "";
  @track boats;
  @track error;
  @track draftValues = [];
  @track selectedBoatId;
  columns = COLUMNS;
  isLoading = false;
  rowOffset = 0;

  // wired message context
  //messageContext;
  @wire(MessageContext) messageContext;
  // wired getBoats method
  @wire(getBoats, { boatTypeId: "$boatTypeId" })
  wiredBoats(result) {
    this.result = result;
    const { data, error } = result;
    if (data) {
      this.boats = data;
      this.dispatchCustomEvent("doneloading");
    } else if (error) {
      this.error = error;
      this.dispatchCustomEvent("doneloading");
      console.log("error", JSON.stringify(error));
    }
  }

  // public function that updates the existing boatTypeId property
  // uses notifyLoading
  @api
  searchBoats(boatTypeId) {
    this.isLoading = true;
    this.notifyLoading(this.isLoading);
    this.boatTypeId = boatTypeId;
  }

  // @api async searchBoats(boatTypeId) {
  //   this.dispatchCustomEvent("loading");
  //   try {
  //     this.boats = await getBoats({ boatTypeId: boatTypeId });
  //     this.dispatchCustomEvent("doneloading");
  //   } catch (error) {
  //     this.error = error;
  //     this.dispatchCustomEvent("doneloading");
  //   }
  // }

  // this public function must refresh the boats asynchronously
  // uses notifyLoading
  @api
  async refresh() {
    this.isLoading = true;
    this.notifyLoading(this.isLoading);
    await refreshApex(this.boats);
    this.isLoading = false;
    this.notifyLoading(this.isLoading);
  }

  // this function must update selectedBoatId and call sendMessageService
  updateSelectedTile(event) {
    this.selectedBoatId = event.detail.boatId;
    this.sendMessageService(this.selectedBoatId);
  }

  // Publishes the selected boat Id on the BoatMC.
  sendMessageService(boatId) {
    // explicitly pass boatId to the parameter recordId
    publish(this.messageContext, BoatMC, { recordId: boatId });
  }

  // This method must save the changes in the Boat Editor
  // Show a toast message with the title
  // clear lightning-datatable draft values
  handleSave(event) {
    this.notifyLoading(true);
    const recordInputs = event.detail.draftValues.slice().map((draft) => {
      const fields = Object.assign({}, draft);
      return { fields };
    });
    const promises = recordInputs.map((recordInput) =>
      updateRecord(recordInput)
    );
    //update boat record

    Promise.all(promises)
      .then((res) => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: SUCCESS_TITLE,
            message: MESSAGE_SHIP_IT,
            variant: SUCCESS_VARIANT
          })
        );
        this.draftValues = [];
        //return refreshApex(this.boats);
        this.dispatchCustomEvent("doneloading");
        return refreshApex(this.result);
      })
      .catch((error) => {
        this.error = error;
        this.dispatchEvent(
          new ShowToastEvent({
            title: ERROR_TITLE,
            message: CONST_ERROR,
            variant: ERROR_VARIANT
          })
        );
        this.notifyLoading(false);
      })
      .finally(() => {
        this.draftValues = [];
      });
  }
  // Check the current value of isLoading before dispatching the doneloading or loading custom event
  notifyLoading(isLoading) {
    if (isLoading) {
      this.dispatchEvent(new CustomEvent("loading"));
    } else {
      this.dispatchEvent(CustomEvent("doneloading"));
    }
  }
}
