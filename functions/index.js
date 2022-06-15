const axios = require("axios")
const fs = require('fs')
const version = 'main'

exports.handler = async function(event, context) {
    console.log(`pidiendo ruta`)
    let csv =  await axios.get(`https://raw.githubusercontent.com/jagedn/madriz-geocanciones/${version}/lista.csv`)
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'text/plain',
        },
        body: csv.data
      };

}
