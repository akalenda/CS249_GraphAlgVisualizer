/*
 * @fileoverview Cidon's depth-first search algorithm, as described in Wan Fokkink's "Distributed Algorithms: An
 * Intuitive Approach".
 *
 * There are three rules for the algorithm:
 * 1. A process never forwards the token through the same channel twice.
 * 2. A process only forwards the token to its parent when there is no other option.
 * 3. When a process receives the token, it immediately sends it back through the same channel if this is allowed by
 *    rules 1 and 2.
 *
 * The design of the algorithm has the following lineage:
 * 1. Tarry's algorithm sends a token through the network, building a spanning tree rooted in the initiator. It does not
 *    do so in any particular way. It may do so in the pattern of a depth-first search, breadth-first, or a combination
 *    of the two. Tarry's algorithm consists of rules 1 and 2.
 * 2. Awerbuch's algorithm modifies Tarry's algorithm to enforce a depth-first search pattern by adding rule 3. A
 *    process will not send a token forward to a neighbor until it has informed its other neighbors that it has received
 *    the token AND until it has received acknowledgements from those neighbors.
 * 3. Cidon's algorithm makes a minor improvement by not unnecessarily waiting for acknowledgements from neighbors
 *    before sending the token onward.
 */

//noinspection JSUnresolvedFunction
randomizeTraversalTimes(); // optional
//noinspection JSUnresolvedFunction
randomizeProcessTimes(); // optional

//noinspection JSUnresolvedFunction
onInitializationDo(
    /**
     * @param {Process} p
     */
    function (p) {
        p.info = false;
        p.token = [];
        p.forward = null;

        p.forEachOutgoingChannel(function(r){
            p.token[r] = false;
        });
    }
);

//noinspection JSUnresolvedFunction
onInitiationDo(
    /**
     * @param {Process} p
     */
    function (p) {
        forwardToken(p);
    }
);

//noinspection JSUnresolvedFunction
onReceivingMessageDo(
    /**
     * @param {Process} p - the current process which has received the message
     * @param {boolean} p.info - true if <info> messages have been sent already
     * @param {string} p.forward - the name of the neighbor to which p has forwarded the token
     * @param {Map<Boolean>} p.token - `p[q] == true` signifies that p has received a token from q
     * @param {string} message - <token> messages propagate through the network, forming the lines of the tree. <info>
     *     messages are sent to neighbors to notify them that the token has already been received.
     * @param {String} q - the name of the neighboring process from which the message was received
     */
    function (p, message, q) {
        if (message == "<info>") {
            if (p.forward != q)
                p.token[q] = true;
            else
                forwardToken(p);
        } else if (message == "<token>") {
            if (!p.forward) {
                p.setParentTo(q);
                p.token[q] = true;
                forwardToken(p);
            } else if (p.forward == q) {
                forwardToken(p);
            } else {
                p.token[q] = true;
            }
        }
    }
);

/**
 * @param {Process} p
 * @param {boolean} p.info
 * @param {string} p.forward
 * @param {Map<Boolean>} p.token
 */
function forwardToken(p) {
    var neighborsThatHaveNotReceivedToken = p.getOutgoingChannels().filter(function(r){ return p.token[r] == false; });
    if (neighborsThatHaveNotReceivedToken.length > 0) {
        var q = chooseArbitarilyFrom(neighborsThatHaveNotReceivedToken);
        p.send(q, "<token>");
        p.forward = q;
        p.token[q] = true;
        if (p.info == false) {
            neighborsThatHaveNotReceivedToken
                .filter(function(r){ return r != p.getParent() && r != q; })
                .forEach(function(r){ p.send(r, "<info>"); });
            p.info = true;
        }
    } else if (p.hasParent()) {
        p.sendParent("<token>");
    } else {
        p.decide();
    }
}

/**
 * @param {Array<*>} array
 * @returns {*}
 */
function chooseArbitarilyFrom(array) {
    return array[parseInt(Math.random() * (array.length - 1))];
}