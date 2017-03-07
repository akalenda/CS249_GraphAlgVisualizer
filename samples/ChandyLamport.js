/*
 * @fileoverview The Chandy-Lamport snapshot algorithm
 *
 * The purpose of Chandy-Lamport is to signal all processes in a network to take a "snapshot", but even that much is not
 * necessary for the algorithm. Really, Chandy-Lamport can be used to send any kind of signal to all the processes in
 * a system. In this way, it is the most basic of all (useful) distributed algorithms.
 *
 * One of the weaknesses with the algorithm is that the channels (edges) between processes (vertices) must be First In
 * First Out (FIFO) if it is to support more than one snapshot. (Currently the visualizer has no way of demonstrating
 * the necessity of this.)
 */

//noinspection JSUnresolvedFunction
randomizeProcessTimes();
randomizeTraversalTimes();

//noinspection JSUnresolvedFunction
onInitializationDo(function (p) {

    /**
     * Will be set to true when p takes a local snapshot of its state
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

//noinspection JSUnresolvedFunction
onInitiationDo(function (p) {
    takeSnapshot(p);
});

//noinspection JSUnresolvedFunction
onReceivingMessageDo(function (p, message, channel) {

    if (message != "<marker>")
        return;

    /*
     * If p receives <marker> through an incoming channel,
     * take snapshot,
     * set marker to true,
     * if all incoming channels are done then terminate
     */
    if (message == "<marker>") {
        takeSnapshot(p);
        p.marker[channel] = true;
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
 * send marker through each outgoing channel,
 * and take local snapshot
 */
function takeSnapshot(p) {
    if (p.recorded == false) {
        p.recorded = true;
        p.sendEachOutgoingChannel("<marker>");
        p.simulateNonblockingProcess();
    }
}