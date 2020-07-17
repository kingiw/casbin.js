"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var casbin_js_1 = __importDefault(require("casbin.js"));
var CSSController = /** @class */ (function () {
    function CSSController() {
        this.targetDOMs = [];
        this.auth = new casbin_js_1.default();
    }
    CSSController.prototype.refresh = function () {
        var elementsCollection = document.getElementsByClassName("casbin");
        for (var _i = 0, elementsCollection_1 = elementsCollection; _i < elementsCollection_1.length; _i++) {
            var elements = elementsCollection_1[_i];
            for (var _a = 0, _b = elements.classList; _a < _b.length; _a++) {
                var className = _b[_a];
                console.log(className);
            }
        }
    };
    return CSSController;
}());
