/*'use strict';
const Responses = require('../common/API_Response');
const Dynamo = require('../common/Dynamo');

module.exports.updates = (event, context, callback) => {
    const timestamp = new Date().getTime();
    const data = JSON.parse(event.body);
    console.log('event', event);

    if (!event.pathParameters || !event.pathParameters.ID) {
        // failed without an ID
        return Responses._400({ message: 'missing the ID from the path' });
    }

    const params = {
        TableName: process.env.tableName,
        Key: {
            ID: event.pathParameters.ID,
        }
    };

    let ID = event.pathParameters.ID;
    let tableName = 'light_user';
    const lightUser = JSON.parse(event.body);
    lightUser.ID = ID;


    const newLightUser = await Dynamo.write(lightUser, tableName).catch(err => {
        console.log('error in dynamo write', err);
        return null;
    });

    if (!newLightUser) {
        return Responses._400({ message: 'Failed to write light user by ID' });
    }

    return Responses._200({ newLightUser: newLightUser });
};*/
