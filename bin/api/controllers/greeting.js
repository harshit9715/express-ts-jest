"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hello = void 0;
function hello(req, res) {
    var name = req.query.name || 'stranger';
    var message = "Hello, " + name + "!";
    res.json({
        "message": message
    });
}
exports.hello = hello;
