const axios = require('axios')

module.exports = async (ticketId, subject, content, emailIds, requester) => {
  /** *************** POST REQ. USING 'AXIOS' ***********************/

  await axios.post('http://127.0.0.1:3002/notifiServ/api/notifications/',
    {
      subject,
      ticketId,
      content,
      receipientEmails: emailIds,
      requester
    },
    {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(function (response) {
      console.log('Request sent:',{
        Status: [response.status, response.statusText],
        Response_Data: response.data
      })
    })
    .catch(function (error) {
      console.log('Error sending req.:',`${error.name}:${error.message}`)
    })
}
