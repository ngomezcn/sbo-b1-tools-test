sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "./../model/models"
], function (Controller, MessageToast, models) {
    "use strict";

    return Controller.extend("notification.ui.controller.App", {
        onInit: function () {
            this.getOwnerComponent().getRouter().getRoute("main").attachPatternMatched(this._onPatternMatched, this);
        },

        _onPatternMatched: function () {
            this.getOwnerComponent().loadNotifications();
        },

        onNotificationPress: function (oEvent) {
            const notificationId = oEvent.getSource().getBindingContext("notifications").getProperty("id");
            this.getOwnerComponent().getRouter().navTo("detail", {
                id: notificationId
            });
        },

        onRefresh: function () {
            this.getOwnerComponent().loadNotifications();
            MessageToast.show("Notifications refreshed");
        },

        formatDate: function (dateString) {
            return models.formatDate(dateString);
        },

        formatOperation: function (operation) {
            return models.formatOperation(operation);
        },

        formatIcon: function (operation) {
            return models.formatIcon(operation);
        }
    });
});