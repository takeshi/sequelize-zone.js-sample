/// <reference path="typings/sequelize/sequelize" />
/// <reference path="typings/zone.js/zone.js.d.ts" />
/// <reference path="typings/node/node" />

require('zone.js');
import * as sequelize from 'sequelize';

let zoneEnable = true;
if (zoneEnable) {
    global['Sequelize'] = {
        shimmerWap: function(object: any, functionName: string, fnArgs: number[], args: any[]) {
            for (let x = 0; x < fnArgs.length; x++) {
                let argIndex = fnArgs[x] < 0 ? args.length + fnArgs[x] : fnArgs[x];
                if (argIndex < args.length && typeof args[argIndex] === 'function') {
                    args[argIndex] = Zone.current.wrap(args[argIndex], functionName);
                }
            }
        }
    };
}

function zone_log(messages: string) {
    console.log(`[${Zone.current.name}]`, messages);
}

let db = new sequelize('sample', 'username', 'password', {
    dialect: 'sqlite',
    storage: 'database.sqlite',
    logging: function(message: string) {
        zone_log(message);
    }
});

let User = db.define('User', {
    name: sequelize.STRING
});

execute();
async function execute() {
    await Zone.current.fork({
        name: 'zone-init'
    }).run(async () => {
        zone_log('init');
        await db.transaction(async (t) => {
            zone_log('sync');
            await User.sync({ force: true });
        });
    });

    await Zone.current.fork({
        name: 'zone-invoke'
    }).run(async () => {
        zone_log('invoke');
        await db.transaction(async (t) => {
            await User.create({ name: 'kodo' });
            let users = await User.findAll();
            zone_log('users' + JSON.stringify(users));

        });
    });

}
