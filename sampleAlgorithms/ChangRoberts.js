/*
 * @fileoverview Chang-Roberts algorithm, which will only work after directed graphs are in...
 */

//noinspection JSUnresolvedFunction
randomizeTraversalTimes(); // optional
//noinspection JSUnresolvedFunction
addJitterToTraversalTimes(); // optional
//noinspection JSUnresolvedFunction
randomizeProcessTimes(); // optional

//noinspection JSUnresolvedFunction
onInitializationDo(
    /**
     * When the simulation initializes, the code provided here will execute on every process `p` in the network
     * @param {Process} p
     */
    function (p) {
        // Your code
    }
);

//noinspection JSUnresolvedFunction
onInitiationDo(
    /**
     * When an initiator `p` decides to start the algorithm, the code provided here will be executed
     * @param {Process} p
     */
    function (p) {
        p.sendEachOutgoingChannel({id: p.getID()});
    }
);

//noinspection JSUnresolvedFunction
onReceivingMessageDo(
    /**
     * When a process `p` in the network receives a message through a channel `q`, the code provided here will be executed
     * @param {Process} p
     * @param {*} message
     * @param {String} q
     */
    function (p, message, q) {
        if (!message.id)
            return;
        if (message.id > p.getID()) {
            p.passive = true;
            p.sendEachOutgoingChannel(message);
        } else if (message.id == p.getID()) {
            p.decide();
        } // else, message.id < p.getID() and message is purged
    }
);