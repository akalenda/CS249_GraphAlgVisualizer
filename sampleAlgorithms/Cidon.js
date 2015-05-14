/*
 * @fileoverview Cidon's depth-first search algorithm
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
        /**
         * @type {boolean}
         */
        p.info = false;

        /**
         * @type {Array<boolean>}
         */
        p.token = [];
        p.forEachOutgoingChannel(function(r){
            p.token[r] = false;
        });

        /**
         * Stringification of a Process
         * @type {String}
         */
        p.parent = null;

        /**
         * Stringification of a Process
         * @type {String}
         */
        p.forward = null;
    }
);

//noinspection JSUnresolvedFunction
onInitiationDo(
    /**
     * When an initiator `p` decides to start the algorithm, the code provided here will be executed
     * @param {Process} p
     */
    function (p) {
        forwardToken(p);
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

function chooseArbitarilyFrom(array) {
    return array[parseInt(Math.random() * (array.length - 1))];
}