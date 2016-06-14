/*
 * @fileoverview Franklin's election algorithm for undirected rings
 */

//noinspection JSUnresolvedFunction
randomizeTraversalTimes(); // optional
//noinspection JSUnresolvedFunction
addJitterToTraversalTimes(); // optional
//noinspection JSUnresolvedFunction
randomizeProcessTimes(); // optional

//noinspection JSUnresolvedFunction
onInitializationDo(
    /**
     * When the simulation initializes, the code provided here will execute on every process `p` in the network
     * @param {Process} p
     */
    function (p) {
        p.active = true;
        p.msgs = [];
        p.sendEachOutgoingChannel({id: p.getID()});
    }
);

//noinspection JSUnresolvedFunction
onInitiationDo(
    /**
     * When an initiator `p` decides to start the algorithm, the code provided here will be executed
     * @param {Process} p
     */
    function (p) {
        // no initiators required
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
        if (p.active) {
            var entry = {};
            entry[q] = message;
            p.msgs.push(entry);
            if (p.msgs.length < 2)
                return;
            franklinAlgThreeCases(p, p.getID(), p.msgs[0].id, p.msgs[1].id);
        } else {
            p.sendEachOutgoingChannelExcept(q, message);
        }
    }
);

function franklinAlgThreeCases(proc, p, q, r) {
    if (Math.max(q, r) < p)
        proc.sendEachOutgoingChannel({id: proc.getID()});
    else if (Math.max(q, r) > p)
        proc.active = false;
    else if (Math.max(q, r) == p)
        p.decide();
}