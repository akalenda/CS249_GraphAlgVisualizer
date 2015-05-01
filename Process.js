define([], function () {
    /**
     * An interface between the code folks might enter into CodeMirror and the Vertex class. Vertex is concerned with
     * administrating SVG elements and references to other internal data structures, as the internal representation
     * of a process on a distributed network. That "process" is abstracted as this Process class, using closures to
     * present only what is needed in order to simulate a distributed algorithm. Thus, for each Vertex a Process is
     * created when the given algorithm is evaluated.
     * @param {Vertex} vertex
     * @constructor
     */
    function Process(vertex) {

        this.getOutgoingChannels = function getOutgoingChannels() {
            var channels = [];
            vertex.outgoingEdges.forEach(function(edge, ignoredVertex){
                channels.push(edge.toString());
            });
            return channels;
        };

        this.getIncomingChannels = function getIncomingChannels() {
            var channels = [];
            vertex.incomingEdges.forEach(function(edge, ignoredVertex){
                channels.push(edge.toString());
            });
            return channels;
        };

        this.forEachIncomingChannel = function forEachIncomingChannel(foo) {
            vertex.incomingEdges.forEach(function passAlongEdgeString(edge, ignoredVertex) {
                foo(edge.toString());
            });
        };

        this.forEachOutgoingChannel = function forEachOutgoingChannel(foo) {
            vertex.outgoingEdges.forEach(function passAlongEdgeString(edge, ignoredVertex) {
                foo(edge.toString());
            });
        };

        this.everyIncomingChannel = function everyIncomingChannel(foo) {
            return everyValueInMap(vertex.incomingEdges).isEvaluatedTrueBy(foo);
        };

        this.everyOutgoingChannel = function everyOutgoingChannel(foo) {
            return everyValueInMap(vertex.outgoingEdges).isEvaluatedTrueBy(function(edge){
                foo(edge.toString());
            });
        };

        this.sendEachOutgoingChannel = function sendEachOutgoingChannel(message) {
            vertex.outgoingEdges.forEach(function (edge, ignoredVertex) {
                edge.simulateMessageSentFrom(vertex, message);
            });
        };

        this.sendEachOutgoingChannelExcept = function sendEachOutgoingChannelException(exceptedChannel, message) {
            vertex.outgoingEdges.forEach(function (edge, ignoredVertex) {
                if (edge.toString() != exceptedChannel)
                    edge.simulateMessageSentFrom(vertex, message);
            });
        };

        this.getNumOutgoingChannels = function getNumOutgoingChannels() {
            return vertex.outgoingEdges.size;
        };

        this.getNumIncomingChannels = function getNumIncomingChannels() {
            return vertex.incomingEdges.size;
        };

        this.decide = function decide() {
            vertex.sim_terminate(); // TODO differentiate decide from terminate
        };

        this.terminate = function terminate() {
            vertex.sim_terminate();
        };

        this.simulateBlockingProcess = function simulateBlockingProcess() {
            vertex.simulateBlockingProcess();
        };

        this.simulateNonblockingProcess = function simulateNonblockingProcess() {
            vertex.simulateNonblockingProcess();
        };

        /**
         *
         * @param {string} otherProcess
         * @param {string} message
         */
        this.send = function send(otherProcess, message) {
            vertex.getOutgoingEdgeByString(otherProcess).simulateMessageSentFrom(vertex, message);
        };

        this.toString = function toString() {
            return vertex.toString();
        };
    }

    /* ************************************ Helpers ****************************************/

    function everyValueInMap(map) {
        return {
            isEvaluatedTrueBy: function (foo) {
                var iter = map.values();
                var next = iter.next();
                while (!next.done) {
                    if (!foo(next.value))
                        return false;
                    next = iter.next();
                }
                return true;
            }
        };
    }

    return Process;
});