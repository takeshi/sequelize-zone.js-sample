/// <reference path="typings/sequelize/sequelize" />
/// <reference path="typings/zone.js/zone.js.d.ts" />
/// <reference path="typings/node/node" />
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
require('zone.js');
const sequelize = require('sequelize');
let zoneEnable = true;
if (zoneEnable) {
    global['Sequelize'] = {
        shimmerWap: function (object, functionName, fnArgs, args) {
            for (let x = 0; x < fnArgs.length; x++) {
                let argIndex = fnArgs[x] < 0 ? args.length + fnArgs[x] : fnArgs[x];
                if (argIndex < args.length && typeof args[argIndex] === 'function') {
                    args[argIndex] = Zone.current.wrap(args[argIndex], functionName);
                }
            }
        }
    };
}
function zone_log(messages) {
    console.log(`[${Zone.current.name}]`, messages);
}
let db = new sequelize('sample', 'username', 'password', {
    dialect: 'sqlite',
    storage: 'database.sqlite',
    logging: function (message) {
        zone_log(message);
    }
});
let User = db.define('User', {
    name: sequelize.STRING
});
execute();
function execute() {
    return __awaiter(this, void 0, void 0, function* () {
        yield Zone.current.fork({
            name: 'zone-init'
        }).run(() => __awaiter(this, void 0, void 0, function* () {
            zone_log('init');
            yield db.transaction((t) => __awaiter(this, void 0, void 0, function* () {
                zone_log('sync');
                yield User.sync({ force: true });
            }));
        }));
        yield Zone.current.fork({
            name: 'zone-invoke'
        }).run(() => __awaiter(this, void 0, void 0, function* () {
            zone_log('invoke');
            yield db.transaction((t) => __awaiter(this, void 0, void 0, function* () {
                yield User.create({ name: 'kodo' });
                let users = yield User.findAll();
                zone_log('users' + JSON.stringify(users));
            }));
        }));
    });
}
