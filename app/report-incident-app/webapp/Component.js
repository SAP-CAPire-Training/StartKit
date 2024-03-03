/* eslint-disable no-undef */
/**
 * eslint-disable @sap/ui5-jsdocs/no-jsdoc
 */

sap.ui.define(
  [
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "reportincidentapp/model/models",
    "sap/ui/model/json/JSONModel",
  ],
  /**
   * @param {typeof sap.ui.core.UIComponent} UIComponent
   * @param {typeof sap.ui.Device} Device
   * @param {typeof sap.ui.model.json.JSONModel} JSONModel
   */
  function (UIComponent, Device, models, JSONModel) {
    "use strict";

    return UIComponent.extend("reportincidentapp.Component", {
      metadata: {
        manifest: "json",
      },

      /**
       * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
       * @public
       * @override
       */
      init: function () {
        // call the base component's init function
        UIComponent.prototype.init.apply(this, arguments);

        // enable routing
        this.getRouter().initialize();

        // set the device model
        this.setModel(models.createDeviceModel(), "device");

        const oModel = new JSONModel({});
        this.setModel(oModel, "globalModel");
      },
    });
  }
);
