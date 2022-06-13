const axios = require("axios")

const version = 'main'

exports.handler = async function(event, context) {
    console.log(`pidiendo ruta`)
    const csv = await axios.get(`https://raw.githubusercontent.com/jagedn/madriz-geocanciones/${version}/lista.csv`)
    console.log(csv.data)
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'text/plain',
        },
        body: csv.data
      };

}
