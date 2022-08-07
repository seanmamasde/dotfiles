"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_language_service_server_1 = require("graphql-language-service-server");
const start = () => {
    (0, graphql_language_service_server_1.startServer)({
        method: 'node',
    })
        .then(() => { })
        .catch(err => {
        console.error(err);
    });
};
start();
//# sourceMappingURL=index.js.map