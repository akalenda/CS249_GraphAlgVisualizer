/*
 * @fileoverview - The Echo Algorithmas described in Wan Fokkink's "Distributed Algorithms: An Intuitive Approach".
 * It is a very significant algorithm which forms the basis of many others. It forms a spanning tree of an undirected
 * network, rooted in the initiator.
 *
 * The great advantage of the Echo algorithm, as opposed to similar algorithms (Tarry's, Cidon's) is how easy it is
 * to intuit the algorithm's behavior, and how readily the name "Echo" conveys that behavior.
 *
 * The initiator sends <wave>s to all neighbors. A process sets its parent to be the first process it received a <wave>
 * from, and then propagates the <wave> further out. If a process has received messages from all neighbors, it returns
 * a <wave> along the channel to its parent. Thus the <wave> messages bounce from the initiator out to the leaflets of
 * the trees, which then echo back up the tree to the root, completing the algorithm.
 */

//noinspection JSUnresolvedFunction
randomizeTraversalTimes();
//noinspection JSUnresolvedFunction
randomizeProcessTimes();

//noinspection JSUnresolvedFunction
onInitializationDo(function (p) {
    p.received = 0;
});

//noinspection JSUnresolvedFunction
onInitiationDo(function (p) {
    // There are perhaps cleaner ways of representing the root, but classically we set it as its own parent.
    p.setParentTo(p);
    p.sendEachOutgoingChannel("<wave>");
});

//noinspection JSUnresolvedFunction
onReceivingMessageDo(function (p, message, q) {
    if (message != "<wave>")
        return;

    p.received++;

    // If there is no parent yet, propagate the echo outward
    if (p.hasNoParent()) {
        p.setParentTo(q);
        p.sendEachOutgoingChannelExceptParent("<wave>");
    }

    // Once all echoes are collected, an echo is sent back to the parent
    if (p.received == p.getNumOutgoingChannels()) {
        if (p.getParent() == p)
            p.terminate();
        else
            p.sendParent("<wave>");
    }
});