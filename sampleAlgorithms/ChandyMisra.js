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
        p.dist = "infinity";
        p.parent = "";
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
        if (message.dist) {
            var d = message.dist;
            var d2 = d + p.getDistanceTo(q);
            if (p.dist === "infinity" || d2 < p.dist) {
                p.dist = d2;
                p.parent = q;
                p.sendEachOutgoingChannelExcept(q, {dist: d2});
            }
        }
    }
);