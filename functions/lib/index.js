"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const moment = require("moment");
const firebaseAdmin = require("firebase-admin");
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
exports.HandleNotification = functions.firestore.document(`/pulse/{pulseId}`).onCreate((snap, context) => __awaiter(this, void 0, void 0, function* () {
    // const new_pulse = snap.data()
    try {
        const last_two_hours = (yield snap.ref.parent
            .where(`timestamp`, `>`, moment().subtract(2, 'hour'))
            .orderBy(`timestamp`, 'asc')
            .get()).docs;
        // const firstPulseDate = moment(last_two_hours[0].data().timestamp.toDate())
        let wearing = 0; // seconds worn
        // let not_wearing = 0; // seconds not worn
        for (let i = 0; i < last_two_hours.length - 1; i++) {
            if (last_two_hours[i].data().wearing) {
                wearing += (last_two_hours[i + 1].data().timestamp.seconds - last_two_hours[i].data().timestamp.seconds);
            }
            else {
                // not_wearing += (last_two_hours[i + 1].data().timestamp.seconds - last_two_hours[i].data().timestamp.seconds)
            }
        }
        if (wearing < 60) {
            // patient has worn aligners less than 60 seconds in the last hour; SEND NOTIFICATION
            // TODO: get device token
            yield firebaseAdmin.messaging().sendToDevice(``, {
                notification: {
                    title: `You haven't worn your aligner in the past two hours! 😧`,
                    body: ``,
                    sound: "default"
                }
            });
        }
    }
    catch (err) {
    }
}));
//# sourceMappingURL=index.js.map