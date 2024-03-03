// @ts-nocheck
const window_keys = Object.keys(window);
/* eslint-disable no-undef */
sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/export/library",
    "sap/ui/export/Spreadsheet",
  ],

  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   * @param {typeof sap.ui.model.json.JSONModel} JSONModel
   * @param {typeof sap.m.MessageBox} MessageBox
   * @param {typeof sap.m.MessageToast} MessageToast
   * @param {typeof sap.ui.model.Filter} Filter
   * @param {typeof sap.ui.export.library} exportLibrary
   * @param {typeof sap.ui.export.Spreadsheet} Spreadsheet
   */
  function (
    Controller,
    JSONModel,
    MessageBox,
    MessageToast,
    Filter,
    exportLibrary,
    Spreadsheet
  ) {
    "use strict";

    const EdmType = exportLibrary.EdmType;

    return Controller.extend("reportincidentapp.controller.LandingView", {
      /**
       * Internal Function / Varible
       */

      _createIncidentDialog: undefined,

      _createColumnConfig: [
        {
          label: "ID",
          property: "ID",
          type: EdmType.String,
        },
        {
          label: "Reported By",
          property: "reported_by",
          type: EdmType.String,
        },
        {
          label: "Title Role",
          property: "title_role",
          type: EdmType.String,
        },
        {
          label: "Date of Report",
          property: "date_of_report",
          type: EdmType.String,
        },
      ],

      _lastIncidenId: async function () {
        const count = await $.get(`${this.service_url}Incident/$count`);
        return Number(count);
      },

      _create_incident: () => ({
        reported_by: "Varun",
        title_role: "Employee",
        date_of_report: new Date().toISOString().split("T")[0],
        incident_type: "",
        location: "",
        date_of_incident: new Date().toISOString().split("T")[0],
        city: "",
        state: "",
        zip_code: "",
        specific_area_of_location: "",
        incident_description: "",
        police_report_filed: false,
        precinct: "",
        reporting_officer: "",
        phone: "",
        follow_up_action: "",
        involved: [{ name: "", role: "", contact: "" }],
        witnesses: [{ name: "", role: "", contact: "" }],
      }),

      _maxLengthValidation: function (oEvt) {
        if (
          oEvt.getSource().getValue().length >= oEvt.getSource().getMaxLength()
        ) {
          sap.m.MessageToast.show(
            "Maximum limit is " +
              oEvt.getSource().getMaxLength() +
              " characters"
          );
        }
      },

      _comboBoxValidate: function (oEvent) {
        const value = oEvent.getParameter("newValue"),
          key = oEvent.getSource().getSelectedItem();
        if (value !== "" && key === null) {
          oEvent.getSource().setValue("");
          return 0;
        }
        return 1;
      },

      /**
       * Main Function
       */

      onInit: function () {},

      onAfterRendering: function () {
        let model = this.getView().getModel();
        this.service_url = model.getServiceUrl();
      },

      onCreateIncidentOpen: function () {
        const globalModel = this.getOwnerComponent().getModel("globalModel");

        globalModel.setProperty("/create_incident", {
          ...this._create_incident(),
        });

        if (!this._createIncidentDialog) {
          this._createIncidentDialog = sap.ui.xmlfragment(
            "reportincidentapp.view.dialogs.CreateIncident",
            this
          );
          this.getView().addDependent(this._createIncidentDialog);
        }
        this._createIncidentDialog.open();
      },

      onCreateIncidentCancel: function () {
        this._createIncidentDialog.close();
      },

      onCreateIncidentAddInvolvePeople: function () {
        const globalModel = this.getOwnerComponent().getModel("globalModel"),
          create_incident = globalModel.getProperty("/create_incident"),
          { involved } = create_incident;

        involved.push({ name: "", role: "", contact: "" });

        globalModel.setProperty("/create_incident/involved", [...involved]);

        globalModel.updateBindings(true);
      },

      onCreateIncidentDeleteInvolvePeople: function (oEvt) {
        const globalModel = this.getOwnerComponent().getModel("globalModel"),
          source = oEvt.getSource(),
          path = source.getBindingContext("globalModel").getPath(),
          index = Number(path.split("/").pop()),
          create_incident = globalModel.getProperty("/create_incident"),
          { involved } = create_incident;

        involved.splice(index, 1);

        globalModel.setProperty("/create_incident/involved", [...involved]);

        globalModel.updateBindings(true);
      },

      onCreateIncidentAddWitness: function () {
        const globalModel = this.getOwnerComponent().getModel("globalModel"),
          create_incident = globalModel.getProperty("/create_incident"),
          { witnesses } = create_incident;

        witnesses.push({ name: "", role: "", contact: "" });

        globalModel.setProperty("/create_incident/witnesses", [...witnesses]);
        globalModel.updateBindings(true);
      },

      onCreateIncidentDeleteWitness: function (oEvt) {
        const globalModel = this.getOwnerComponent().getModel("globalModel"),
          source = oEvt.getSource(),
          path = source.getBindingContext("globalModel").getPath(),
          index = Number(path.split("/").pop()),
          create_incident = globalModel.getProperty("/create_incident"),
          { witnesses } = create_incident;

        witnesses.splice(index, 1);

        globalModel.setProperty("/create_incident/witnesses", [...witnesses]);
        globalModel.updateBindings(true);
      },

      onCreateIncidentSubmit: async function () {
        const globalModel = this.getOwnerComponent().getModel("globalModel"),
          create_incident = { ...globalModel.getProperty("/create_incident") },
          { involved, witnesses } = create_incident,
          idCreateIncidentDialog = sap.ui
            .getCore()
            .byId("idCreateIncidentDialog"),
          incident_table = this.getView().byId("idIncidentTable");

        idCreateIncidentDialog.setBusy(true);

        delete create_incident.involved;
        delete create_incident.witnesses;

        $.post({
          url: "/browse/Incident",
          data: JSON.stringify({
            ID: (await this._lastIncidenId()) + 1,
            ...create_incident,
            involved: involved.filter((item) => Boolean(item.name)),
            witnesses: witnesses.filter((item) => Boolean(item.name)),
          }),
          dataType: "json",
          contentType: "application/json; charset=utf-8",
          success: (response, message) => {
            if (message !== "success") {
              return;
            }

            MessageBox.success("Incident created successfully!", {
              onClose: () => {
                this.onCreateIncidentCancel();
                incident_table.getModel().refresh();
              },
            });
          },
          error: (error, text) => {
            const { message } = error.responseJSON.error;

            if (text !== "error") {
              return;
            }

            MessageBox.error(message);
          },
          complete: () => {
            idCreateIncidentDialog.setBusy(false);
          },
        });
      },

      onMicPress: function (oEvt) {
        const source = oEvt.getSource(),
          text_area = source.getParent().getParent().getItems()[1],
          resourceModel = this.getView().getModel("i18n"),
          mic_active = resourceModel.getProperty("mic_active"),
          mic_inactive = resourceModel.getProperty("mic_inactive");

        if (source.getType() === mic_inactive) {
          if (window_keys.indexOf("webkitSpeechRecognition") > -1) {
            MessageToast.show(
              "Sorry, this browser doesn't support Speed Recognition "
            );
          } else {
            if (!this._recognition)
              this._recognition = new webkitSpeechRecognition();
            this._recognition.continuous = false;
            this._recognition.interimResults = true;
            this._recognition.lang = "en-IN";
            this._recognition.start();

            this._recognition.addEventListener("start", function () {
              source.setType(mic_active);
            });

            this._recognition.addEventListener("result", function (event) {
              let final_result = "",
                text_area_value = text_area.getValue();

              for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                  text_area_value =
                    text_area_value + " " + event.results[i][0].transcript;
                } else {
                  final_result = final_result + event.results[i][0].transcript;
                }
              }
              text_area.setValue(text_area_value);
              text_area.fireLiveChange();
            });
            this._recognition.addEventListener("error", function () {});
            this._recognition.addEventListener("end", function () {
              source.setType(mic_inactive);
            });
          }
        } else {
          this._recognition.stop();
        }
      },

      onNavigationPress: function (id) {
        sap.ui.core.UIComponent.getRouterFor(this).navTo("object", {
          objectId: id,
        });
      },

      onSearch: function (oEvt) {
        const id_incident_table = this.getView().byId("idIncidentTable"),
          selectionSet = oEvt.getParameter("selectionSet"),
          searchText = selectionSet[0].getValue();

        if (!searchText) {
          id_incident_table.getBinding("items").filter([]);
          return;
        }

        id_incident_table.getBinding("items").filter(
          new Filter({
            filters: [
              new Filter({
                path: "reported_by",
                operator: "Contains",
                value1: searchText,
                caseSensitive: false,
              }),
              new Filter({
                path: "title_role",
                operator: "Contains",
                value1: searchText,
                caseSensitive: false,
              }),
            ],
            and: false,
          })
        );
      },

      onSearchClear: function (oEvt) {
        const selectionSet = oEvt.getParameter("selectionSet");
        selectionSet.forEach((element) => {
          element.setValue(null);
        });
        this.getView().byId("idIncidentTable").getBinding("items").filter([]);
      },

      onIncidentExport: function () {
        let setting = {
            workbook: {
              columns: this._createColumnConfig,
              filter: true,
            },
            dataSource: {
              type: "odata",
              dataUrl: `${this.service_url}Incident`,
            },
            fileName: "Incident.xlsx",
            worker: false,
          },
          oSheet = new Spreadsheet(setting);

        oSheet.build().finally(function () {});
      },
    });
  }
);
