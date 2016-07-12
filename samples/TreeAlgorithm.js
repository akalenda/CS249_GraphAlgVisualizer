/*
 * @fileoverview This is the Tree algorithm described in Wan Fokkink's Distributed Algorithms book. It is a completely
 * decentralized wave algorithm -- e.g. no initiators are required. Instead, at any time a process may choose to execute
 * the algorithm.
 *
 * The purpose of the algorithm is to view the network as a tree, and determine what the root of that tree should be
 * based on how quickly messages from all of the network processes can reach it. Incidentally, if each child process
 * has a weight equal to the time it took for its own children's messages to arrive, a nominally balanced tree is
 * produced. It is a peculiarity of this algorithm that it always produces two candidate roots.
 *
 * Another consequence of this algorithm's construction is that the graph must be an actual tree, and thus there can be
 * no cycles within the network graph. Otherwise it would be impossible for the algorithm to terminate. You can see this
 * yourself -- try running it on a graph with no cycles, and then add an edge on that graph to create a cycle.
 *
 * For graphs with cycles, another slower algorithm -- Tarry's, Awerbuch's, Cidon's, or the Echo algorithm -- must be
 * used to construct a tree spanning the network. And in each of these cases, the root must be predetermined.
 *
 * If this is a problem, my own suggestion is to use one of those slower algorithms to construct a "first-iteration"
 * tree. Then a second graph is constructed, using only the channels in the first tree, upon which the Tree algorithm
 * is then used to select a better root.
 */

//noinspection JSUnresolvedFunction
randomizeTraversalTimes(); // optional
//noinspection JSUnresolvedFunction
randomizeProcessTimes(); // optional

//noinspection JSUnresolvedFunction
onInitializationDo(
    /**
     * Once a process is ready to participate, it will simply attempt to send out a <wave>.
     *
     * @param {Process} p
     */
    function (p) {
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
     * @param {Process} p
     */
    function (p) {
        // Do nothing. The Tree algorithm does not use initiators.
    }
);

//noinspection JSUnresolvedFunction
onReceivingMessageDo(
    /**
     * We are interested in two types of messages in this algorithm: <wave> and <info>.
     *
     * <wave> is used to set parents and find the twin roots of the tree.
     *
     * <info> is used to disseminate information from parents to children after the tree is decided on.
     *
     * @param {Process} p -- the process receiving the message
     * @param {string} message
     * @param {String} q -- the process that sent the message
     */
    function (p, message, q) {
        if (message == "<wave>") {
            p.received[q] = true;
            sendWave(p);
        } else if (message == "<info>") {
            p.sendEachOutgoingChannelExceptParent("<info>");
        }
    }
);

/**
 * When looking to send out a <wave>, the process looks at how many neighbors it has from which it has not yet received
 * a <wave>. If there is only one such neighbor, then it will set that process to be its parent in the tree, and send
 * the <wave> along.
 *
 * When that parent receives the <wave>, it will know that the process is a child, and eliminate it as a possible
 * parent. In this way the effect propagates, as eventually only one neighbor will remain uneliminated, and
 * must therefore be its own parent.
 *
 * Eventually it comes down to two processes whose <wave> messages pass each other by, and the two process become
 * parents to one another. When this occurs, a <wave> has been received when no channels remain unaccounted for, and
 * the two processes decide on themselves as twin roots for the tree.
 *
 * @param {Process} p
 */
function sendWave(p) {
    var channelsPending = p.getOutgoingChannels().filter(function(r){
        return p.received[r] == false;
    });
    if (channelsPending.length == 1) {
        p.setParentTo(channelsPending[0]);
        p.send(channelsPending[0], "<wave>");
    } else if (channelsPending.length == 0) {
        p.decide();
        p.sendEachOutgoingChannelExceptParent("<info>");
    }
}