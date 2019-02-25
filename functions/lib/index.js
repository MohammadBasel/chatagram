"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const admin = require("firebase-admin");
// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript
admin.initializeApp(functions.config().firebase);
exports.onWriteUsers = functions.firestore
    .document('users/{id}')
    .onWrite(async (change, context) => {
    // Get an object with the current document value.
    // If the document does not exist, it has been deleted.
    const user = change.after.exists ? change.after.data() : null;
    // Get an object with the previous document value (for update or delete)
    const oldUser = change.before.data();
    console.log("message = ", user);
    console.log("oldMessage = ", oldUser);
    // perform desired operations ...
    let message = null;
    if (!oldUser || user.online && !oldUser.online) {
        message = "Hi";
    }
    else if (oldUser.online && !user.online) {
        message = "Bye";
    }
    if (message) {
        await admin.firestore().collection("messages").add({ username: "Bot.png", message: message + " " + user.name + "!", time: new Date() });
    }
});
exports.addMessage = functions.https.onCall(async (data, context) => {
    let message = data.message;
    console.log("Iam in the function!");
    let email = context.auth.token.email || null;
    if (data.message === "!hi") {
        message = "Hi";
        email = "Bot.png";
    }
    else if (data.message === "!users") {
        const querySnapshot = await admin.firestore().collection("messages").get();
        const users = new Array();
        querySnapshot.forEach(doc => {
            const username = doc.data().username;
            if (!users.includes(username))
                users.push(username);
        });
        message = users;
        email = "Bot.png";
    }
    else if (data.message === "!help") {
        const querySnapshot = await admin.firestore().collection("bot_commands").get();
        let commands = "\n";
        querySnapshot.forEach(doc => {
            commands += doc.data().command + "\n";
        });
        message = commands;
        email = "Bot.png";
    }
    console.log("Success!!!?");
    return await admin.firestore().collection("messages").add({ username: email, message: message, time: new Date() });
});
exports.updateImage = functions.https.onRequest(async (req, res) => {
    let users = await admin.firestore().collection("users").where("caption", ">", "").get();
    let randomNum = Math.floor(Math.random() * users.size);
    console.log("randomNum is: ", randomNum);
    const result = await admin.firestore().collection("image").doc("user").update({ email: users.docs[randomNum].id, when: new Date() });
    console.log("result is: ", result);
    res.status(200).send();
});
//# sourceMappingURL=index.js.map