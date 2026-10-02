sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "./model/models",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function (UIComponent, JSONModel, models, MessageBox, MessageToast) {
    "use strict";

    return UIComponent.extend("notification.ui.Component", {
        metadata: {
            manifest: "json"
        },

        init: function () {
            UIComponent.prototype.init.apply(this, arguments);

            // Create and set empty model for notifications
            this.setModel(new JSONModel({ notifications: [] }), "notifications");
            this.loadNotifications();
            this.initWebSocket();
            this.getRouter().initialize();
        },

        loadNotifications: function () {
            fetch("/api/notifications")
                .then(response => response.json())
                .then(data => {
                    data = models.transformNotificationData(data);
                    const dataModel = this.getModel("notifications");
                    dataModel.setProperty("/notifications", data);
                    dataModel.setProperty("/notificationsCount", data.length);
                    dataModel.refresh(true);
                })
                .catch(error => {
                    console.error("Error loading notifications:", error);
                });
        },

        initWebSocket: function () {
            // Use the same port as the HTTP server, incremented by 1 for WebSocket
            const wsProtocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
            let wsUrl = wsProtocol + window.location.hostname + ':' + (Number(window.location.port) + 1) + '/';
            this._ws = new WebSocket(wsUrl);
            this._ws.onopen = function () {
                // Register as browser client
                this.send(JSON.stringify({ type: 'register', client: 'browser' }));
            };
            this._ws.onmessage = (event) => {
                let message = JSON.parse(event.data);
                console.log("WebSocket message received:", message);
                if (message.type === 'NEW_NOTIFICATION') {
                    const newNotifications = models.transformNotificationData(message.data);

                    // Show a message box with the last new notification details
                    const lastNotification = newNotifications[newNotifications.length - 1];
                    const content = [`id: ${lastNotification.id}`, `type: ${lastNotification.type}`, `source: ${lastNotification.source}`].join('\n');
                    MessageBox.show(content, {
                        title: `New Notifications (${newNotifications.length})`,
                        icon: MessageBox.Icon.INFORMATION,
                        actions: [MessageBox.Action.OK]
                    });

                    // Add new notification to the beginning of the list
                    const dataModel = this.getModel("notifications");
                    const currentNotifications = dataModel.getProperty("/notifications");
                    currentNotifications.unshift(...newNotifications);
                    dataModel.setProperty("/notifications", currentNotifications);
                    dataModel.setProperty("/notificationsCount", currentNotifications.length);
                    dataModel.refresh(true);

                    // Show toast message
                    MessageToast.show(`New notification: ${lastNotification.type}`);
                }
            };

            this._ws.onerror = (error) => {
                console.error("WebSocket error:", error);
            };

            this._ws.onclose = () => {
                console.log("WebSocket connection closed");
            };
        }
    });
});