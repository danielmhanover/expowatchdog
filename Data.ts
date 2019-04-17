import * as firebase from 'firebase'
import * as Rx from 'rxjs'
import * as _ from 'lodash'
import moment from 'moment'
require("firebase/firestore");

var config = {
    apiKey: "AIzaSyCugj2HRz6NtqmsXY9JwnivPYYJpmQaros",
    authDomain: "watchdog-6b2b4.firebaseapp.com",
    databaseURL: "https://watchdog-6b2b4.firebaseio.com",
    projectId: "watchdog-6b2b4",
    storageBucket: "watchdog-6b2b4.appspot.com",
    messagingSenderId: "310782631223"
};

firebase.initializeApp(config);

export interface IPulse {
    wearing: boolean
    timestamp: firebase.firestore.Timestamp
    treatment: firebase.firestore.DocumentReference
}

export const firestore = firebase.firestore();

export const database = firebase.database()
// const settings = { timestampsInSnapshots: true};
// firestore.settings(settings);

// export const pulseObservable: Rx.Observable<IPulse[]> = Rx.Observable.create((observer: Rx.Observer<IPulse[]>) => {
//     firebase.firestore().collection("pulse").orderBy("timestamp", "desc").onSnapshot((snapshot) => {
//         // console.log("Read " + snapshot.docs.length + " documents")
//         const pulses = snapshot.docs
//         const data = (pulses.map((pulse) => {
//             return pulse.data()
//         }) as IPulse[]).sort((a, b) => {
//             // console.log(a.timestamp.toDate().toLocaleTimeString())
//             return a.timestamp.toMillis() - b.timestamp.toMillis()
//         })
//         observer.next(data)
//     })
// })

type IWearing = {
    wearing: number,
    // not_wearing: number,
    day: moment.Moment
}

export const pulseHistorical: Rx.Observable<IWearing[]> = Rx.Observable.create((observer: Rx.Observer<IWearing[]>) => {
    firebase.firestore().collection("pulse").orderBy("timestamp", "desc").limit(5000).onSnapshot((snapshot) => {
        const pulses = snapshot.docs
        const data = (pulses.map((pulse) => {
            return pulse.data()
        }) as IPulse[])
        //group data by day   
        const bucketed = _.groupBy(data, (pulse: IPulse) => {
            const d = moment(pulse.timestamp.toDate())
            return d.dayOfYear() + "-" + d.year()
        })
        // console.warn(_.keys(bucketed).length)
        //aggregate daily results
        const daily_results = (_.values(bucketed).map((d) => {
            const sortedPulses = d.sort(dd => -1*dd.timestamp.seconds)
            const firstPulseDate = moment(sortedPulses[0].timestamp.toDate())
            let wearing = 0; // seconds worn
            let not_wearing = 0; // seconds worn
            for (let i = 0; i < sortedPulses.length - 1; i++) {
                if (sortedPulses[i].wearing == true) {
                    wearing += (sortedPulses[i + 1].timestamp.seconds - sortedPulses[i].timestamp.seconds)
                }
                else {
                    not_wearing += (sortedPulses[i + 1].timestamp.seconds - sortedPulses[i].timestamp.seconds)
                }
            }
            wearing = wearing / 3600; //convert seconds to hours
            not_wearing = not_wearing / 3600; //convert seconds to hours
            // console.warn(wearing)
            return {
                day: firstPulseDate,
                wearing
            }
        }))
        observer.next(daily_results)
    })
})