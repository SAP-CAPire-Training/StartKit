// @ts-nocheck
/* eslint-disable no-undef */
sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
  ],

  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   * @param {typeof sap.ui.model.json.JSONModel} JSONModel
   * @param {typeof sap.m.MessageBox} MessageBox
   * @param {typeof sap.m.MessageToast} MessageToast
   */
  function (Controller, JSONModel, MessageBox) {
    "use strict";

    return Controller.extend("reportincidentapp.controller.IncidentView", {
      onInit: function () {
        this.getOwnerComponent()
          .getRouter()
          .getRoute("object")
          .attachPatternMatched(this._onIncidentView, this);
      },

      _onIncidentView: function (oEvt) {
        const { objectId } = oEvt.getParameter("arguments"),
          globalModel = this.getOwnerComponent().getModel("globalModel");

        this._pullIncidentDetail(objectId);

        globalModel.setProperty("/edit_flag", false);
      },

      _pullIncidentDetail: function (objectId) {
        const globalModel = this.getOwnerComponent().getModel("globalModel");
        $.get({
          url: `/browse/Incident(${objectId})?$expand=involved,witnesses`,
          dataType: "json",
          contentType: "application/json; charset=utf-8",
          success: (response, message) => {
            if (message !== "success") {
              return;
            }

            delete response["@odata.context"];

            globalModel.setProperty("/view_incident", { ...response });
          },
          error: (error, text) => {
            const { message } = error.responseJSON.error;

            if (text !== "error") {
              return;
            }

            MessageBox.error(message, {
              onClose: () => {
                this.onNavBack();
              },
            });
          },
          complete: () => {},
        });
      },

      onNavBack: function () {
        window.history.go(-1);
      },

      onUpdateIncidentSubmit: function () {
        const globalModel = this.getOwnerComponent().getModel("globalModel"),
          view_incident = { ...globalModel.getProperty("/view_incident") },
          { involved, witnesses, ID } = view_incident;

        delete view_incident.involved;
        delete view_incident.witnesses;

        return $.ajax({
          url: `/browse/Incident(${ID})`,
          type: "PATCH",
          data: JSON.stringify({
            ...view_incident,
            involved: involved.filter((item) => Boolean(item.name)),
            witnesses: witnesses.filter((item) => Boolean(item.name)),
          }),
          dataType: "json",
          contentType: "application/json; charset=utf-8",
        });
      },

      onIncidentEdit: function (oEvt) {
        const source = oEvt.getSource(),
          globalModel = this.getOwnerComponent().getModel("globalModel"),
          name = source.getText();

        if (name === "Edit") {
          globalModel.setProperty("/edit_flag", true);
          return;
        }
        MessageBox.confirm("Would you like to save your changes?", {
          onClose: async function (action) {
            if (action.toLowerCase() === "cancel") {
              return;
            }
            try {
              const message = await this.onUpdateIncidentSubmit();
              if (message.ID) {
                MessageBox.success("Incident updated successfully!");
              }
            } catch (error) {
              const { message } = error.responseJSON.error;

              if (text !== "error") {
                return;
              }

              MessageBox.error(message);
            }
            globalModel.setProperty("/edit_flag", false);
          }.bind(this),
        });
      },

      onUpdateIncidentAddInvolvePeople: function () {
        const globalModel = this.getOwnerComponent().getModel("globalModel"),
          view_incident = globalModel.getProperty("/view_incident"),
          { involved } = view_incident;

        involved.push({ name: "", role: "", contact: "" });

        globalModel.setProperty("/view_incident/involved", [...involved]);

        globalModel.updateBindings(true);
      },

      onUpdateIncidentAddWitness: function () {
        const globalModel = this.getOwnerComponent().getModel("globalModel"),
          view_incident = globalModel.getProperty("/view_incident"),
          { witnesses } = view_incident;

        witnesses.push({ name: "", role: "", contact: "" });

        globalModel.setProperty("/view_incident/witnesses", [...witnesses]);

        globalModel.updateBindings(true);
      },

      onCreateIncidentDeleteInvolvePeople: function (oEvt) {
        const globalModel = this.getOwnerComponent().getModel("globalModel"),
          source = oEvt.getSource(),
          object = oEvt
            .getSource()
            .getBindingContext("globalModel")
            .getObject(),
          path = source.getBindingContext("globalModel").getPath(),
          index = Number(path.split("/").pop()),
          view_incident = globalModel.getProperty("/view_incident"),
          { involved } = view_incident,
          { ID } = object,
          updateBinding = () => {
            involved.splice(index, 1);
            globalModel.setProperty("/view_incident/involved", [...involved]);
            globalModel.updateBindings(true);
          };

        if ("ID" in object) {
          MessageBox.warning(
            "Please confirm whether you'd like to proceed with the deletion.",
            {
              actions: ["OK", "Cancel"],
              emphasizedAction: "OK",
              onClose: function (action) {
                if (action.toLowerCase() === "cancel") {
                  return;
                }

                $.ajax({
                  url: `/browse/PartyInvolved(${ID})`,
                  type: "DELETE",
                  dataType: "json",
                  contentType: "application/json; charset=utf-8",
                  success: function () {
                    updateBinding();
                  },
                });
              },
            }
          );
        } else {
          updateBinding();
        }
      },

      onUpdateIncidentDeleteWitness: function (oEvt) {
        const globalModel = this.getOwnerComponent().getModel("globalModel"),
          source = oEvt.getSource(),
          object = oEvt
            .getSource()
            .getBindingContext("globalModel")
            .getObject(),
          path = source.getBindingContext("globalModel").getPath(),
          index = Number(path.split("/").pop()),
          view_incident = globalModel.getProperty("/view_incident"),
          { witnesses } = view_incident,
          { ID } = object,
          updateBinding = () => {
            witnesses.splice(index, 1);
            globalModel.setProperty("/view_incident/witnesses", [...witnesses]);
            globalModel.updateBindings(true);
          };

        if ("ID" in object) {
          MessageBox.warning(
            "Please confirm whether you'd like to proceed with the deletion.",
            {
              actions: ["OK", "Cancel"],
              emphasizedAction: "OK",
              onClose: function (action) {
                if (action.toLowerCase() === "cancel") {
                  return;
                }

                $.ajax({
                  url: `/browse/Witnesses(${ID})`,
                  type: "DELETE",
                  dataType: "json",
                  contentType: "application/json; charset=utf-8",
                  success: function () {
                    updateBinding();
                  },
                });
              },
            }
          );
        } else {
          updateBinding();
        }
      },
    });
  }
);
