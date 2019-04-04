import * as functions from 'firebase-functions';
import * as moment from 'moment'

import * as firebaseAdmin from 'firebase-admin'

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

export const HandleNotification = functions.firestore.document(`/pulse/{pulseId}`).onCreate(async (snap, context) => {
    // const new_pulse = snap.data()

    try {
        const last_two_hours = (await snap.ref.parent
            .where(`timestamp`, `>`, moment().subtract(2, 'hour'))
            .orderBy(`timestamp`, 'asc')
            .get()).docs
    
        // const firstPulseDate = moment(last_two_hours[0].data().timestamp.toDate())
        let wearing = 0; // seconds worn
        // let not_wearing = 0; // seconds not worn
        for (let i = 0; i < last_two_hours.length - 1; i++) {
            if (last_two_hours[i].data().wearing) {
                wearing += (last_two_hours[i + 1].data().timestamp.seconds - last_two_hours[i].data().timestamp.seconds)
            }
            else {
                // not_wearing += (last_two_hours[i + 1].data().timestamp.seconds - last_two_hours[i].data().timestamp.seconds)
            }
        }
    
        if (wearing < 60) {
            // patient has worn aligners less than 60 seconds in the last hour; SEND NOTIFICATION
            // TODO: get device token
            await firebaseAdmin.messaging().sendToDevice(``, {
                notification: {
                    title: `You haven't worn your aligner in the past two hours! 😧`,
                    body: ``,
                    sound: "default"
                }
            })
        }
    } catch (err) {
        
    }
})