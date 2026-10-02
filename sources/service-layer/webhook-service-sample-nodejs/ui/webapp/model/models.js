sap.ui.define([], function () {
    function formatIcon(operation) {
        if (!operation) return "None";
        switch (operation) {
            case "Created":
                return "sap-icon://add-document";
            case "Updated":
                return "sap-icon://edit-outside";
            case "Deleted":
                return "sap-icon://decline";
            case "Canceled":
                return "sap-icon://cancel";
            case "Reopened":
                return "sap-icon://request";
            case "Closed":
                return "sap-icon://complete";
            default:
                return "sap-icon://sys-enter-2";
        }
    }

    function formatDate(dateString) {
        if (!dateString) return "";
        dateString = dateString.replace(/T/, ' ').replace(/Z$/, '');
        return dateString;
        // const date = new Date(dateString);
        // return date.toISOString();
    }

    function formatOperation(operation) {
        if (!operation) return "None";
        switch (operation) {
            case "Created":
                return "Success";
            case "Updated":
                return "Warning";
            case "Deleted":
                return "Error";
            case "Closed":
                return "Information";
            case "Canceled":
                return "Information";
            default:
                return "None";
        }
    }

    function transformNotificationData(data) {
        if (!data) return data;

        const isArray = Array.isArray(data);
        data = isArray ? data : [data]; // Ensure data is an array
        for (let i = 0; i < data.length; i++) {
            const type = data[i].type; // e.g., sap.b1.BusinessPartners.Updated.v1
            const operation = type.split('.')[3]; 
            const bizObject = type.split('.')[2];
            data[i].operation = operation;
            data[i].bizObject = bizObject;
            if(data[i].data && typeof data[i].data === 'object') {
                data[i].data = JSON.stringify(data[i].data);
            }
        }
        return data;
    }

    return {
        formatIcon: formatIcon,
        formatDate: formatDate,
        formatOperation: formatOperation,
        transformNotificationData: transformNotificationData
    };
})
