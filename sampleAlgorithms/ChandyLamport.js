randomizeTraversalTimes();
randomizeProcessTimes();

/**
 * @fileoverview The Chandy-Lamport snapshot algorithm, one of the most basic distributed algorithms
 * as described in Wan Fokkink's "Distributed Algorithms: An Intuitive Approach"
 */

onInitializationDo(function (p) {

    /**
     * Is set to true when p takes a local snapshot of its state
     * @type {boolean}
     */
    p.recorded = false;

    /**
     * For each incoming channel (from another Vertex), a boolean is set when a marker arrives
     * @type {Object.<Vertex,boolean>}
     */
    p.marker = {};
    p.forEachIncomingChannel(function (channel) {
        p.marker[channel] = false;
    });

    /**
     * Keeps track of the basic messages that arrive through a channel (from a Vertex) after p has taken a
     * local snapshot, and before a marker message arrives through that channel
     * @type {Object.<Vertex,Array<*>>}
     */
    p.state = {};
    p.forEachIncomingChannel(function (channel) {
        p.state[channel] = [];
    });
});

/*
 * If p wants to initiate a network-wide snapshot,
 * then TakeSnapshot process
 */
onInitiationDo(function (p) {
    takeSnapshot(p);
});

onReceivingMessageDo(function (p, message, channel) {
    /*
     * If p receives <marker> through an incoming channel,
     * take snapshot,
     * set marker to true,
     * if all incoming channels are done then terminate
     */
    if (message == "<marker>") {
        takeSnapshot(p);
        p.marker = true;
        var allDone = p.everyIncomingChannel(function isDone(channel) {
            return p.marker[channel];
        });
        if (allDone)
            p.terminate();
    }
    /*
     * If p receives basic message m through an incoming channel c,
     * and recorded is true,
     * and marker[c] is false,
     * stage[c] <- append(state[c], m)
     */
    else if (p.recorded == true && p.marker[channel]) {
        p.stage[channel].push(message);
    }

});

/*
 * If not yet recorded,
 * then set recorded true,
 * send marker thru each outgoing channel,
 * and take local snapshot
 */
function takeSnapshot(p) {
    if (p.recorded == false) {
        p.recorded = true;
        p.sendEachOutgoingChannel("<marker>");
        p.simulateNonblockingProcess();
    }
}