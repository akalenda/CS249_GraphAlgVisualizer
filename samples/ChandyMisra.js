/*
 * @fileoverview From Wan Fokkink's "Distributed Algorithms: An Intuitive Approach", the Chandy-Misra algorithm computes
 * a sink a tree routed in the initiator. That is to say, after the algorithm completes, each process in the network
 * has a (supposedly) shortest path to the initiator.
 *
 * At first this may appear similar to the Echo algorithm. However, Echo will not make alterations to the tree after
 * parents have first been set. Chandy-Misra is designed for many consecutive executions of the algorithm without a
 * reset, which may even execute on top of one another. This is most apparent in a densely connected graph. It is also
 * more robust in handling processes in the networks coming and going on- and off-line.
 *
 * Properly, it would be accompanied by a termination detection algorithm such as Djikstra-Scholten's, however, for the
 * purposes of this application visual confirmation is good enough to understand Chandy-Misra's workings.
 */

//noinspection JSUnresolvedFunction
randomizeTraversalTimes(); // optional
//noinspection JSUnresolvedFunction
addJitterToTraversalTimes();
//noinspection JSUnresolvedFunction
randomizeProcessTimes(); // optional

//noinspection JSUnresolvedFunction
onInitializationDo(
    /**
     * When the simulation initializes, the code provided here will execute on every process `p` in the network
     * @param {Process} p
     */
    function (p) {
        p.dist = Infinity;
    }
);

//noinspection JSUnresolvedFunction
onInitiationDo(
    /**
     * When an initiator `p` decides to start the algorithm, the code provided here will be executed
     * @param {Process} p
     */
    function (p) {
        p.dist = 0;
        p.sendEachOutgoingChannel({dist: 0});
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
        if (message.dist !== undefined) {
            var d = message.dist;
            var d2 = d + p.getDistanceTo(q);
            if (p.dist === Infinity || d2 < p.dist) {
                p.dist = d2;
                p.setParentTo(q);
                p.sendEachOutgoingChannelExcept(q, {dist: d2});
            }
        }
    }
);