'use strict';

module.exports.exampleLocalFunction = async (event, context) => {
    let bodyObj = JSON.parse(event.body);
    console.log(bodyObj);
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: bodyObj.parameter
        })
    }
};
