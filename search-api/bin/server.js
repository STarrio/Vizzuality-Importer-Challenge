"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var router_1 = require("./router");
var app = express_1.default();
var port = 6200;
app.use('/search', router_1.router);
app.get('/', function (req, res) { return res.send('Hello World!'); });
app.listen(port, function () { return console.log("Example app listening on port " + port + "!"); });
