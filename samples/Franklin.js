/*
 * @fileoverview Franklin's election algorithm for undirected rings, as described in Wan Fokkink's "Distributed
 * Algorithms: An Intuitive Approach".
 *
 * The purpose of this algorithm is to elect a "leader" process from amongst themselves without knowing anything of one
 * another. It could be used for similar contexts as the Tree algorithm, however it is specifically designed for ring
 * graphs: Graphs consisting entirely of one big cycle, with each vertex connected to exactly two others.
 */

//noinspection JSUnresolvedFunction
randomizeTraversalTimes();
//noinspection JSUnresolvedFunction
addJitterToTraversalTimes();
//noinspection JSUnresolvedFunction
randomizeProcessTimes();

//noinspection JSUnresolvedFunction
onInitializationDo(
    /**
     * Processes do not wait for an initiator. They can begin sending messages as soon as they are able.
     *
     * Messages proceed in rounds. Since message transit time is variable, a round 1 message can arrive before a round 0
     * message. Therefore each message also needs to be tagged with the round in which it was generated.
     *
     * @param {Process} p
     */
    function (p) {
        p.active = true;
        p.msgs = {};
        p.sendEachOutgoingChannel(new ElectionRoundMessage(p.getID(), 0));
    }
);

//noinspection JSUnresolvedFunction
onReceivingMessageDo(
    /**
     * If this process is active, that means it is still a candidate for leadership, and will continue the algorithm.
     * Otherwise, it only passes messages on for other processes to examine.
     *
     * Most of the code below is simply bookkeeping to track which round messages arrived in. When two messages have
     * arrived for a given round -- one from each neighbor -- then the interesting part of the algorithm happens, which
     * is in the franklinAlgThreeCases function.
     *
     * @param {Process} p
     * @param {boolean} p.active
     * @param {Map<Array>} p.msgs
     * @param {ElectionRoundMessage} message
     * @param {number} message.round
     * @param {number} message.id
     * @param {String} q
     */
    function (p, message, q) {
        if (p.active) {
            if (!p.msgs[message.round])
                p.msgs[message.round] = [];
            var thisRoundsMessages = p.msgs[message.round];
            thisRoundsMessages.push(message);
            if (thisRoundsMessages.length == 2)
                franklinAlgThreeCases(p, p.getID(), thisRoundsMessages[0].id, thisRoundsMessages[1].id, message.round);
        } else {
            p.sendEachOutgoingChannelExcept(q, message);
        }
    }
);

/**
 * Case 1: Uncertain. This process is still a viable candidate for leader. Send its ID out in a new round.
 * Case 2: This process is definitely not leader. It will turn passive, thence to merely pass other candidates' IDs on.
 * Case 3: This process is definitely the leader.
 *
 * @param {Process} proc
 * @param {boolean} proc.active
 * @param {number} p - the ID of the current process
 * @param {number} q - the ID of the first neighbor
 * @param {number} r - the ID of the second neighbor
 * @param {number} currentRound
 */
function franklinAlgThreeCases(proc, p, q, r, currentRound) {
    if (Math.max(q, r) < p)
        proc.sendEachOutgoingChannel(new ElectionRoundMessage(proc.getID(), currentRound + 1));
    else if (Math.max(q, r) > p)
        proc.active = false;
    else if (Math.max(q, r) == p)
        proc.decide();
}

/**
 * @param {number} id
 * @param {number} round
 * @constructor
 */
function ElectionRoundMessage(id, round){
    this.id = id;
    this.round = round;
}
