import axios from 'axios'

export const notificationClient = async (ticketId, subject, content, requesterEmailIds, assignedToEmailIds, requester, assignedTo) => {
  /** *************** POST REQ. USING 'AXIOS' ***********************/
  await axios.post(process.env.NOTIFICATION_URL,
    {
      subject,
      ticketId,
      content,
      requesterEmailIds,
      assignedToEmailIds,
      requester,
      assignedTo
    },
    {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(function (response) {
      console.log('Request sent:', {
        status: [response.status, response.statusText],
        response_data: response.data
      })
    })
    .catch((error) => {
      console.log('Error sending request to Notification Service:', `${error}`)
    })
}
