'use strict';
const Responses = require('../common/API_Response');
const Dynamo = require('../common/Dynamo');
const AWS = require('aws-sdk');
const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = require('twilio')(twilioAccountSid, twilioAuthToken);

// Required in responses for CORS support to work
const headers = {'Access-Control-Allow-Origin': '*'};

exports.handler = async event => {
    console.log('event', event);
    // user Id they are trying to message
    if (!event.pathParameters || !event.pathParameters.ID) {
        // failed without an ID
        return Responses._400({ message: 'missing the ID from the path' });
    }
    /*const messageMetaData = {
        from: event.body.from,
        message: event.body.message,
        to: event.body.to
    };*/

    let ID = event.pathParameters.ID;
    let tableName = 'user';
    const initialForm = JSON.parse(event.body);
    const userId = await Dynamo.get(ID, tableName).catch(err => {
        console.log('error didnt find user', err);
        return null
    });
    const conversationMetaData = {
        cdMember: userId.phoneNumber,
        liteUsersNumber: event.body.phoneNumber,
        messageToUser: event.body.meetingReminder,
    };
    // grab Twilio numbers
    const twilioNumbers = await twilioClient.incomingPhoneNumbers
        .list()
        .then(incomingPhoneNumbers => incomingPhoneNumbers.forEach(i => console.log(i.phoneNumber)));

    // stringify twilio numbers to use, also find the least used number (some how)
   /* if (twilioNumbers !== null) {
        for (twilioNumber of twilioNumbers){
            JSON.stringify(twilioNumbers.phoneNumber);
            console.log(twilioNumbers.phoneNumber)
        }
    } else {
        console.log('no numbers here')
    }*/
    // send message to cdMember with twilio and create a conversation
    // https://www.twilio.com/docs/conversations/api/conversation-message-resource
    const conversation = await twilioClient.conversations.conversations
        .create()
        .then(conversation => console.log(conversation.sid));
    // when User replies add them as a participant
    if (conversation !== null){
        const lightParticipant = await twilioClient.conversations.conversations(conversation.sid)
            .participants
            .create( {
                'messageBinding.address': event.body.phoneNumber,
                // toString is not going to work until I parse out the numbers and change to strings
                'messageBinging.proxyAddress': twilioNumbers.toString()
            });
        const userParticipant = await twilioClient.conversations.conversations(conversation.sid)
            .participants
            .create( {
                'messageBinding.address': userId.phoneNumber,
                // toString is not going to work until I parse out the numbers and change to strings
                'messageBinging.proxyAddress': twilioNumbers.toString()
            });
    }

    // https://www.twilio.com/docs/conversations/api/conversation-participant-resource

    //save conversation SID to both users

    // should we buy numbers based on ZIP codes



    if (!userId) {
        return Responses._400({ message: 'Failed to find user' });
    }

    return Responses._200({ userId: userId });
};
