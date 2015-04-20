define([
    'jquery'
], function ($) {
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

        this.forEachIncomingChannel = function forEachIncomingChannel(foo) {
            vertex.incomingEdges.forEach(function(ignored, edge){
                foo(edge.toString());
            });
        };

        this.forEachOutgoingChannel = function forEachOutgoingChannel(foo) {
            vertex.outgoingEdges.forEach(function(ignored, edge){
                foo(edge.toString());
            });
        };

        this.everyIncomingChannel = function everyIncomingChannel(foo) {
            return everyValueInMap(vertex.incomingEdges).isEvaluatedTrueBy(foo);
        };

        this.everyOutgoingChannel = function everyOutgoingChannel(foo) {
            return everyValueInMap(vertex.outgoingEdges).isEvaluatedTrueBy(foo);
        };

        this.sendEachOutgoingChannel = function sendEachOutgoingChannel(message) {
            vertex.outgoingEdges.forEach(function(edge, ignoredVertex){
                edge.simulateMessageSentFrom(vertex, message);
            });
        };

        this.simulateBlockingProcess = function simulateBlockingProcess() {
            vertex.simulateBlockingProcess();
        };

        this.simulateNonblockingProcess = function simulateNonblockingProcess() {
            vertex.simulateNonblockingProcess();
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
                    if (foo(next.value))
                        return true;
                    next = iter.next();
                }
                return false;
            }
        };
    }

    return Process;
});