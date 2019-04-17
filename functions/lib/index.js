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
const admin = firebaseAdmin.initializeApp();
exports.NewStageReceived = functions.database.ref('latest_version').onWrite((change, context) => __awaiter(this, void 0, void 0, function* () {
    const stage = change.after.val();
    if (change.after.val() === null) {
        return;
    }
    yield change.after.ref.set(null);
    yield admin.firestore().collection('pulse').add({
        timestamp: new Date(),
        treatment: admin.firestore().doc('treatment/gXHCRsuDdhZicrIKRb9b'),
        wearing: false,
        stage
    });
}));
exports.HandleNotification = functions.firestore.document(`/pulse/{pulseId}`).onCreate((snap, context) => __awaiter(this, void 0, void 0, function* () {
    try {
        const last_two_hours = (yield snap.ref.parent
            .where(`timestamp`, `>`, moment().subtract(2, 'hour'))
            .orderBy(`timestamp`, 'asc')
            .get()).docs;
        //const last 24 hours 
        const last_twenty_four_hours = (yield snap.ref.parent
            .where('timestamp', '>', moment().subtract(24, "hour"))
            .orderBy('timestamp', 'asc')
            .get()).docs;
        let wearing = 0; // seconds worn
        let wearing_2 = 0; // seconds worn for daily usage
        for (let i = 0; i < last_two_hours.length - 1; i++) {
            if (last_two_hours[i].data().wearing) {
                wearing += (last_two_hours[i + 1].data().timestamp.seconds - last_two_hours[i].data().timestamp.seconds);
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
            yield admin.messaging().sendToDevice(``, {
                notification: {
                    title: `You haven't worn your aligner in the past two hours! 😧`,
                    body: ``,
                    sound: "default"
                }
            });
        }
        if (wearing_2 > 60 * 60 * 23.5) {
            // patient has worn aligners for > 23.5 hours; SEND NOTIFICATION
            // TODO: get device token
            yield admin.messaging().sendToDevice(``, {
                notification: {
                    title: `Aligner has been out of the case all day! Have you lost it?`,
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