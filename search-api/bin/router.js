"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express = __importStar(require("express"));
var elasticsearch_1 = require("@elastic/elasticsearch");
var categories_1 = require("./types/categories");
var lodash_1 = __importDefault(require("lodash"));
exports.router = express.Router();
// Open connection to Elasticsearch server
var client = new elasticsearch_1.Client({ node: 'http://localhost:9200' });
// Middleware that is specific to this router
exports.router.use(function timeLog(req, res, next) {
    console.log('Time: ', Date.now());
    next();
});
exports.router.get('/', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var queryBody, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                queryBody = {
                    index: 'emissions_data',
                    body: {
                        query: {
                            bool: {
                                filter: []
                            }
                        }
                    }
                };
                if (req.query.country && req.query.country.length === 3) {
                    queryBody.body.query.bool.filter.push({ 'term': { 'Country': req.query.country } });
                }
                if (req.query.sector) {
                    queryBody.body.query.bool.filter.push({ 'term': { 'Sector': req.query.sector } });
                }
                if (req.query.parentSector) {
                    queryBody.body.query.bool.filter.push({ 'term': { 'Parent_sector': req.query.parentSector } });
                }
                return [4 /*yield*/, client.search(queryBody)];
            case 1:
                result = _a.sent();
                res.json({
                    data: lodash_1.default(result.body.hits.hits).map(function (y) {
                        return lodash_1.default.pick(y, ['_id', '_source']);
                    }).value()
                });
                return [2 /*return*/];
        }
    });
}); });
exports.router.get('/id/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, client.search({
                    index: 'emissions_data',
                    body: {
                        query: {
                            match: { _id: req.params.id }
                        }
                    }
                })];
            case 1:
                result = _a.sent();
                res.json({
                    data: lodash_1.default(result.body.hits.hits).map(function (y) {
                        return lodash_1.default.pick(y, ['_id', '_source']);
                    }).value()
                });
                return [2 /*return*/];
        }
    });
}); });
exports.router.get('/range/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var selectedRange, result, selectedRangeData;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                selectedRange = lodash_1.default.range(new Number(req.query.startYear).valueOf(), new Number(req.query.endYear).valueOf() + 1);
                return [4 /*yield*/, client.search({
                        index: 'emissions_data',
                        body: {
                            _source: __spreadArrays(selectedRange, [
                                'Country',
                                'Sector',
                                'Parent_sector'
                            ]),
                            query: {
                                match: { _id: req.params.id }
                            }
                        }
                    })];
            case 1:
                result = _a.sent();
                selectedRangeData = lodash_1.default(result.body.hits.hits[0]._source).pick(selectedRange).values().map(function (y) { return parseFloat(y); }).value();
                if (req.query.op === 'sum') {
                    res.json({ data: lodash_1.default.sum(selectedRangeData) });
                }
                else if (req.query.op === 'avg') {
                    res.json({ data: lodash_1.default.sum(selectedRangeData) / selectedRangeData.length });
                }
                else if (req.query.op === 'data') {
                    res.json({ data: selectedRangeData });
                }
                else {
                    throw 'Operation not permitted';
                }
                return [2 /*return*/];
        }
    });
}); });
exports.router.get('/country/:country', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var queryBody, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                queryBody = {
                    index: 'emissions_data',
                    body: {
                        query: {
                            match: { Country: req.params.country }
                        }
                    }
                };
                if (req.query.year) {
                    queryBody.body._source = [
                        'Country',
                        'Sector',
                        'Parent_sector',
                        req.query.year
                    ];
                }
                if (req.query.op === 'avg' && req.query.year) {
                    queryBody.body.aggs = {
                        "avg_value": { "avg": { "field": req.query.year } }
                    };
                }
                return [4 /*yield*/, client.search(queryBody)];
            case 1:
                result = _a.sent();
                res.json({
                    data: lodash_1.default(result.body.hits.hits).map(function (y) {
                        return lodash_1.default.pick(y, ['_id', '_source']);
                    }).value(),
                    avg_value: result.body.aggregations.avg_value.value
                });
                return [2 /*return*/];
        }
    });
}); });
exports.router.get('/sector/:sector', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, client.search({
                    index: 'emissions_data',
                    body: {
                        query: {
                            match: { Sector: categories_1.SectorCategories[req.params.sector] }
                        }
                    }
                })];
            case 1:
                result = _a.sent();
                res.json({
                    data: lodash_1.default(result.body.hits.hits).map(function (y) {
                        return lodash_1.default.pick(y, ['_id', '_source']);
                    }).value()
                });
                return [2 /*return*/];
        }
    });
}); });
exports.router.get('/parent_sector/:parentSector', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, client.search({
                    index: 'emissions_data',
                    body: {
                        query: {
                            match: { Parent_sector: categories_1.ParentSectorCategories[req.params.parentSector] }
                        }
                    }
                })];
            case 1:
                result = _a.sent();
                res.json({
                    data: lodash_1.default(result.body.hits.hits).map(function (y) {
                        return lodash_1.default.pick(y, ['_id', '_source']);
                    }).value()
                });
                return [2 /*return*/];
        }
    });
}); });
