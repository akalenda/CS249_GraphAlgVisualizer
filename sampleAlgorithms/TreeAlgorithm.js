/*
 * @fileoverview Your description here
 */

//noinspection JSUnresolvedFunction
randomizeTraversalTimes(); // optional
//noinspection JSUnresolvedFunction
randomizeProcessTimes(); // optional

//noinspection JSUnresolvedFunction
onInitializationDo(
    /**
     * When the simulation initializes, the code provided here will execute on every process `p` in the network
     * @param {Process} p
     */
    function (p) {
        p.parent = null;
        p.received = {};
        p.forEachOutgoingChannel(function(r){
            p.received[r] = false;
        });
        sendWave(p);
    }
);

//noinspection JSUnresolvedFunction
onInitiationDo(
    /**
     * When an initiator `p` decides to start the algorithm, the code provided here will be executed
     * @param {Process} p
     */
    function (p) {
        // Do nothing
    }
);

//noinspection JSUnresolvedFunction
onReceivingMessageDo(
    /**
     * When a process `p` in the network receives a message through a channel `q`, the code provided here will be executed
     * @param {Process} p
     * @param {string} message
     * @param {String} q
     */
    function (p, message, q) {
        if (message == "<wave>") {
            p.received[q] = true;
            sendWave(p);
        } else if (message == "<info>") {
            p.sendEachOutgoingChannelExcept(p.parent, "<info>");
        }
    }
);

/**
 *
 * @param {Process} p
 */
function sendWave(p) {
    var channelsPending = p.getOutgoingChannels().filter(function(r){
        return p.received[r] == false;
    });
    if (channelsPending.length == 1) {
        p.parent = channelsPending[0];
        p.send(channelsPending[0], "<wave>");
    } else if (channelsPending.length == 0) {
        p.decide();
        p.sendEachOutgoingChannelExcept(p.parent, "<info>");
    }
}