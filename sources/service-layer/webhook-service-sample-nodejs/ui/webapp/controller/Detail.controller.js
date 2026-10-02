sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "./../model/models"
], function (Controller, JSONModel, MessageToast, models) {
    "use strict";

    return Controller.extend("notification.ui.controller.Detail", {
        onInit: function () {
            this.getOwnerComponent().getRouter().getRoute("detail").attachPatternMatched(this._onPatternMatched, this);
            this.getView().setModel(new JSONModel({}), "notification");
            this.bizObject_with_integer_key_type = new Set([
                "Orders",
                "Invoices",
                "Users"
                // Add other business objects that use integer keys
            ]);
        },

        _onPatternMatched: function (oEvent) {
            this.notificationId = oEvent.getParameter("arguments").id;
            this.loadNotificationDetails(this.notificationId);
            const jsonSection = this.byId("jsonSection");
            const jsonViewer = this.byId("jsonViewer");
            jsonViewer.setValue("Waiting ServiceLayer Response...");
            jsonSection.setVisible(false);
        },

        loadNotificationDetails: function (notificationId) {
            fetch(`/api/notifications/${notificationId}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    data = models.transformNotificationData(data);
                    this.getView().getModel("notification").setData(data[0]);
                })
                .catch(error => {
                    console.error("Error loading notification details:", error);
                    MessageToast.show("Error loading notification details");
                });
        },

        onQueryServiceLayer: function () {
            const jsonSection = this.byId("jsonSection");
            const jsonViewer = this.byId("jsonViewer");

            // Show loading indicator
            jsonViewer.setValue("Waiting ServiceLayer Response...");
            jsonSection.setVisible(true);

            // Jump to the json section
            this.getView().byId("objectPageLayout").setSelectedSection(jsonSection);  

            const notification = this.getView().getModel("notification").getData();
            const companySchemaName = notification.source.split('/')[3]; // e.g., /default/sap.b1/DB1
          
            // Get the entity key
            const bizObject = notification.bizObject;
            let key = notification.subject;
             if(!this.bizObject_with_integer_key_type.has(bizObject)) {
                key = "'" + notification.subject + "'";
            }

            // Fetch ServiceLayer response
            fetch(`/api/b1s/v2/${bizObject}(${key})`, {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    companySchemaName: companySchemaName
                }
            }).then(response => {
                // if (!response.ok) {
                //     throw new Error('Network response was not ok');
                // }
                return response.json();
            }).then(data => {
                    const formattedJson = JSON.stringify(data, null, 2);
                    jsonViewer.setValue(formattedJson);
            })
            .catch(error => {
                console.error("Error fetching OData:", error);
                jsonViewer.setValue("Error fetching OData response:\n" + error.message);
            });
        },

        onCloseJsonViewer: function () {
            this.byId("jsonSection").setVisible(false);
        },

        onNavBack: function () {
            window.history.back();
        },

        formatDate: function (dateString) {
            return models.formatDate(dateString);
        }
    });
});