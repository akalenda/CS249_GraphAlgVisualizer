/*
 * @fileoverview - The Echo Algorithmas described in Wan Fokkink's "Distributed Algorithms: An Intuitive Approach",
 * it forms the basis of many other algorithms. It forms a spanning tree of an undirected
 * network, rooted in the initiator.
 */

//noinspection JSUnresolvedFunction
randomizeTraversalTimes();
//noinspection JSUnresolvedFunction
randomizeProcessTimes();

//noinspection JSUnresolvedFunction
onInitializationDo(function (p) {

    p.received = 0;
    p.parent = null;
});

//noinspection JSUnresolvedFunction
onInitiationDo(function (p) {

    p.parent = p;
    p.sendEachOutgoingChannel("<wave>");
});

//noinspection JSUnresolvedFunction
onReceivingMessageDo(function (p, message, q) {

    if (message != "<wave>")
        return;

    p.received++;

    // If there is no parent yet, propogate the echo outward
    if (!p.parent) {
        p.parent = q;
        p.forEachOutgoingChannel(function (r) {
            if (q != r)
                p.send(r, "<wave>");
        });
    }

    // Once all echoes are collected, an echo is sent back to the parent
    if (p.received == p.getNumOutgoingChannels()) {
        if (p.parent == p)
            p.terminate();
        else
            p.send(p.parent, "<wave>");
    }
});