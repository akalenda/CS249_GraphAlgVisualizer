define([
    'Vertex'
], function(Vertex){

    var DEFAULT_LINE_COLOR = "White";
    var SIM_MESSAGE_LINE_COLOR = "Green";

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
        this._shape = createGfxElementAt(startVertex, endVertex);
        this._sim_listeners = [];
        this._sim_svgLines = [];
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

    /* *************************************** Simulation functions ********************************************/
    Edge.prototype.sim_reset = function sim_reset() {
        this._sim_listeners.forEach(function(listener){
            createjs.Ticker.off("tick", listener);
        });
        this._sim_svgLines.forEach(function(svgLine){
            Vertex._stage.removeChild(svgLine);
        });
        this._sim_listeners = [];
        this._sim_svgLines = [];
    };

    /**
     *
     * @param {Vertex} sourceVertex
     * @param {string} message
     */
    Edge.prototype.simulateMessageSentFrom = function simulateMessageSentFrom(sourceVertex, message) {
        var targetVertex = (sourceVertex == this.startVertex) ? this.endVertex : this.startVertex;
        var startCoords = sourceVertex.getCoordinatesOfCenter();
        var endCoords = targetVertex.getCoordinatesOfCenter();
        var delta = 0.01; // TODO random between 0 and 1
        var currentBias = 0.0;
        var svgLine = createGfxElementAt(sourceVertex, sourceVertex, SIM_MESSAGE_LINE_COLOR);
        Vertex._stage.addChild(svgLine);
        var listener = createjs.Ticker.on("tick", function updateSvgLineOnTick(event) {
            if (!event.paused) {
                currentBias = Math.min(1.0, currentBias + delta);
                var currentCoords = interpolateCoordinatesFrom(currentBias, startCoords, endCoords);
                svgLine.graphics.instructions[1].x = currentCoords.x;
                svgLine.graphics.instructions[1].y = currentCoords.y;
                Vertex._stage.update();
                if (currentBias == 1.0) {
                    createjs.Ticker.off("tick", listener);
                    targetVertex.sim_receiveMessageFrom(sourceVertex, message);
                }
            }
        });
        this._sim_listeners.push(listener);
        this._sim_svgLines.push(svgLine);
    };

    /* ******************************* Helpers ********************************/
    /**
     * @param {Vertex} startVertex
     * @param {Vertex} endVertex
     * @param {string} [color] - Any CSS-recognized color
     * @returns {*} - the EaselJS GUI object for this Edge's line
     */
    function createGfxElementAt(startVertex, endVertex, color){
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