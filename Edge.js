define([
    'Vertex'
], function(Vertex){

    var DEFAULT_LINE_COLOR = "White";
    var SIM_MESSAGE_LINE_COLOR = "Green";
    var SIM_MESSAGE_SPARK_COLOR = "Aquamarine";
    var SIM_MESSAGE_SPARK_RADIUS = 10;

    /**
     * @param {Vertex} startVertex
     * @param {Vertex} endVertex
     * @param {boolean} [isDirected] - optional value, edge is undirected by default
     * @constructor
     */
    function Edge(startVertex, endVertex, isDirected){
        this.isUndirected = isDirected !== true;
        this.startVertex = startVertex;
        this.endVertex = endVertex;
        this._shape = createSvgLine(startVertex, endVertex);
        this._sim_listeners = [];
        this._sim_svgShapes = [];
        Vertex._stage.addChildAt(this._shape, 0);

        startVertex.addOutgoingEdge(endVertex, this);
        endVertex.addIncomingEdge(startVertex, this);
        if (this.isUndirected) {
            endVertex.addOutgoingEdge(startVertex, this);
            startVertex.addIncomingEdge(endVertex, this);
        }
    }

    /**
     * Removes this Edge from the EaselJS stage, as well its associated Vertices as appropriate
     */
    Edge.prototype.remove = function remove(){
        if (!this._shape)
            return;
        Vertex._stage.removeChild(this._shape);
        this._shape = null;
        this.startVertex.removeOutgoingEdgeTo(this.endVertex);
        this.endVertex.removeIncomingEdgeFrom(this.startVertex);
        if (this.isUndirected) {
            this.endVertex.removeOutgoingEdgeTo(this.startVertex);
            this.startVertex.removeIncomingEdgeFrom(this.endVertex);
        }
        this.startVertex = this.endVertex = null;
    };

    /**
     * Produces an object with the minimal description necessary to reproduce this edge: the IDs of the vertices the
     * edge starts and ends on, and whether the edge is undirected.
     *
     * @returns {{start: number, end: number, isUndirected: boolean}}
     */
    Edge.prototype.export = function exprt() {
        return {
            s: this.startVertex.getID(),
            e: this.endVertex.getID(),
            u: this.isUndirected
        };
    };

    /**
     * Updates the SVG drawn line for this edge, e.g. when the Vertices are moved this can (and should) be invoked to have the line redrawn to track it
     */
    Edge.prototype.updateGfxElements = function updateGfxElements(){
        // Kind of hacky :(
        var startCoords = this.startVertex.getCoordinatesOfCenter();
        var endCoords = this.endVertex.getCoordinatesOfCenter();
        this._shape.graphics._instructions[1].x = startCoords.x;
        this._shape.graphics._instructions[1].y = startCoords.y;
        this._shape.graphics.command.x = endCoords.x;
        this._shape.graphics.command.y = endCoords.y;
    };

    //noinspection JSUnusedGlobalSymbols
    /**
     * @param {Vertex} vertex
     * @returns {boolean}
     */
    Edge.prototype.isIncomingFrom = function isIncomingFrom(vertex){
        if (this.startVertex == vertex)
            return true;
        return this.isUndirected && this.endVertex == vertex;
    };

    //noinspection JSUnusedGlobalSymbols
    /**
     * @param {Vertex} vertex
     * @returns {boolean}
     */
    Edge.prototype.isOutgoingTo = function isOutgoingTo(vertex){
        if (this.endVertex == vertex)
            return true;
        return this.isUndirected && this.startVertex == vertex;
    };

    /**
     * @returns {string} - e.g. an Edge from vertices p3 to p17 would have a toString of 'e3_17'
     */
    Edge.prototype.toString = function toString(){
        return "e" + this.startVertex.getID() + "_" + this.endVertex.getID();
    };

    //noinspection JSUnusedGlobalSymbols
    /**
     * @param {Edge} other
     * @returns {boolean} - Returns true if the other object is a functionally equivalent instance of Edge. E.g. It has the same start and endpoint, or if this is an undirected Edge, the two endpoints are interchangeable
     */
    Edge.prototype.equals = function equals(other){
        if (!(other instanceof Edge))
            return false;
        if (this.isUndirected) {
            return (this.startVertex == other.startVertex || this.startVertex == other.endVertex)
                && (this.endVertex == other.endVertex || this.endVertex == other.startVertex);
        } else {
            return this.startVertex == other.startVertex
                && this.endVertex == other.endVertex;
        }
    };

    /**
     * @param {Vertex} vertex - A vertex at one end of this edge
     * @returns {Vertex} - The vertex at the other end of the edge from the vertex provided
     */
    Edge.prototype.getVertexOtherThan = function getVertexOtherThan(vertex) {
        if (this.startVertex == vertex)
            return this.endVertex;
        if (this.endVertex == vertex)
            return this.startVertex;
        throw new Error("Provided vertex is not part of this edge");
    };

    /* *************************************** Simulation functions ********************************************/
    /**
     * Resets the data for this edge so it is as though the simulation had never been ran
     */
    Edge.prototype.sim_reset = function sim_reset() {
        this._sim_listeners.forEach(function(listener){
            createjs.Ticker.off("tick", listener);
        });
        this._sim_svgShapes.forEach(function(svgLine){
            Vertex._stage.removeChild(svgLine);
        });
        this._sim_listeners = [];
        this._sim_svgShapes = [];
        this._sim_length = generateLength();
    };

    /**
     * Simulates a message as it traverses this channel, sent from one vertex to another. It does so by animating a
     * spark, which moves along the line between the two vertices. Once the message reaches its destination, it will
     * trigger the Vertex to simulate a message received.
     * @param {Vertex} sourceVertex
     * @param {*} message - A string, object, or whatever the algorithm needs it to be. We don't care, we just pass it
     * along.
     */
    Edge.prototype.simulateMessageSentFrom = function simulateMessageSentFrom(sourceVertex, message) {
        if (!$.isNumeric(this._sim_length))
            this._sim_length = generateLength();
        var that = this;
        var targetVertex = (sourceVertex == this.startVertex) ? this.endVertex : this.startVertex;
        var startCoords = sourceVertex.getCoordinatesOfCenter();
        var endCoords = targetVertex.getCoordinatesOfCenter();
        var delta = 0.125 / this._sim_length * generateJitter();
        var currentBias = 0.0;
        var svgContainer = new createjs.Container();
        var svgLine = createSvgLine(sourceVertex, sourceVertex, SIM_MESSAGE_LINE_COLOR);
        var svgSpark = createSvgSpark(0, 0);
        svgContainer.addChild(svgLine);
        svgContainer.addChild(svgSpark);
        Vertex._stage.addChild(svgContainer);
        var listener = createjs.Ticker.on("tick", function updateSvgLineOnTick(event) {
            if (!event.paused) {
                currentBias = Math.min(1.0, currentBias + delta);
                var currentCoords = interpolateCoordinatesFrom(currentBias, startCoords, endCoords);
                svgLine.graphics.instructions[1].x = currentCoords.x;
                svgLine.graphics.instructions[1].y = currentCoords.y;
                svgSpark.graphics.instructions[1].x = svgSpark.graphics.instructions[2].x = currentCoords.x;
                svgSpark.graphics.instructions[1].y = svgSpark.graphics.instructions[2].y = currentCoords.y;
                if (currentBias == 1.0) {
                    createjs.Ticker.off("tick", listener);
                    targetVertex.sim_receiveMessageFrom(that, message);
                    svgContainer.removeChild(svgSpark);
                }
                Vertex._stage.update();
            }
        });
        this._sim_listeners.push(listener);
        this._sim_svgShapes.push(svgContainer);
    };

    /**
     * @returns {number}
     */
    Edge.prototype.sim_getLength = function sim_getLength() {
        return this._sim_length;
    };

    /* ******************************* Helpers ********************************/
    /**
     * Randomly generates a number to represent the "length" of this edge, e.g. the time it takes for a message to
     * traverse the channel. It will be used for all messages that traverse the channel in this particular simulation
     * @returns {number}
     */
    function generateLength() {
        return (Vertex._codeEnclosure.traversalTimesAreRandom) ? Math.random() * 6 + 1 : 4;
    }

    /**
     * Randomly generates a number that will be used to add inconsistency to the time it takes a message to traverse
     * this edge's channel. Thus one message might take 1.2 seconds, the next 1.4, the next 1.3, and so on.
     * @returns {number}
     */
    function generateJitter() {
        return (Math.random() * 2 - 1) * Vertex._codeEnclosure.traversalTimeJitter + 1;
    }

    /**
     * @param {number} xCoord
     * @param {number} yCoord
     * @returns {*} - An EaselJS shape that will represent a message traversing the channel
     */
    function createSvgSpark(xCoord, yCoord) {
        var circle = new createjs.Shape();
        circle.graphics.beginStroke(SIM_MESSAGE_SPARK_COLOR)
            .drawCircle(xCoord, yCoord, SIM_MESSAGE_SPARK_RADIUS)
            .drawCircle(xCoord, yCoord, SIM_MESSAGE_SPARK_RADIUS / 2);
        return circle;
    }

    /**
     * @param {Vertex} startVertex
     * @param {Vertex} endVertex
     * @param {string} [color] - Any CSS-recognized color
     * @returns {*} - the EaselJS GUI object for this Edge's line
     */
    function createSvgLine(startVertex, endVertex, color){
        var startCoords = startVertex.getCoordinatesOfCenter();
        var endCoords = endVertex.getCoordinatesOfCenter();
        var gfx = new createjs.Graphics();
        gfx.setStrokeStyle(3)
            .beginStroke(color || DEFAULT_LINE_COLOR)
            .moveTo(startCoords.x, startCoords.y)
            .lineTo(endCoords.x, endCoords.y);
        return new createjs.Shape(gfx);
    }

    /**
     *
     * @param bias
     * @param {{x: number, y: number}} a
     * @param {{x: number, y: number}} b
     * @returns {{x: number, y: number}}
     */
    function interpolateCoordinatesFrom(bias, a, b) {
        return {
            x : (bias * b.x) + ((1 - bias) * a.x),
            y : (bias * b.y) + ((1 - bias) * a.y)
        };
    }

    return Edge;

});