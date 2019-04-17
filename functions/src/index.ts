import * as functions from 'firebase-functions';
import * as moment from 'moment'

import * as firebaseAdmin from 'firebase-admin'

const admin = firebaseAdmin.initializeApp()

export const NewStageReceived = functions.database.ref('latest_version').onWrite(async (change, context) => {
    const stage = change.after.val()
    if (change.after.val() === null) {
        return;
    }
    await change.after.ref.set(null)
    await admin.firestore().collection('pulse').add({
        timestamp: new Date(),
        treatment: admin.firestore().doc('treatment/gXHCRsuDdhZicrIKRb9b'),
        wearing: false,
        stage
    })
})

export const HandleNotification = functions.firestore.document(`/pulse/{pulseId}`).onCreate(async (snap, context) => {
    try {
        const last_two_hours = (await snap.ref.parent
            .where(`timestamp`, `>`, moment().subtract(2, 'hour'))
            .orderBy(`timestamp`, 'asc')
            .get()).docs

        
        //const last 24 hours 
        const last_twenty_four_hours = (await snap.ref.parent 
            .where('timestamp', '>', moment().subtract(24, "hour"))
            .orderBy('timestamp', 'asc')
            .get()).docs;
    
        let wearing = 0; // seconds worn
        let wearing_2 = 0; // seconds worn for daily usage
        for (let i = 0; i < last_two_hours.length - 1; i++) {
            if (last_two_hours[i].data().wearing) {
                wearing += (last_two_hours[i + 1].data().timestamp.seconds - last_two_hours[i].data().timestamp.seconds)
            }
        }

        for (let i = 0; i < last_twenty_four_hours.length - 1; i++) {
            if (last_twenty_four_hours[i].data().wearing) {
                wearing_2 += (last_twenty_four_hours[i + 1].data().timestamp.seconds - last_twenty_four_hours[i].data().timestamps.seconds);
            }
        }
    
        if (wearing < 60) {
            // patient has worn aligners less than 60 seconds in the last hour; SEND NOTIFICATION
            // TODO: get device token
            await admin.messaging().sendToDevice(``, {
                notification: {
                    title: `You haven't worn your aligner in the past two hours! 😧`,
                    body: ``,
                    sound: "default"
                }
            })
        }
        if (wearing_2 > 60*60*23.5) {
            // patient has worn aligners for > 23.5 hours; SEND NOTIFICATION
            // TODO: get device token
            await admin.messaging().sendToDevice(``, {
                notification: {
                    title: `Aligner has been out of the case all day! Have you lost it?`,
                    body: ``,
                    sound: "default"
                }
            });             
        }
    } catch (err) {

    }
})