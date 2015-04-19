define([
    'Vertex'
], function(Vertex){

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
        Vertex._stage.addChildAt(this._shape, 0);

        startVertex.addEdge(endVertex, this);
        if (this.isUndirected)
            endVertex.addEdge(startVertex, this);
    }

    /**
     * Removes this Edge from the EaselJS stage, as well its associated Vertices as appropriate
     */
    Edge.prototype.remove = function remove(){
        if (!this._shape)
            return;
        Vertex._stage.removeChild(this._shape);
        this._shape = null;
        this.startVertex.removeEdgeTo(this.endVertex);
        if (this.isUndirected)
            this.endVertex.removeEdgeTo(this.startVertex);
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

    /**
     * @param {Vertex} vertex
     * @returns {boolean}
     */
    Edge.prototype.isIncomingFrom = function isIncomingFrom(vertex){
        if (this.startVertex == vertex)
            return true;
        return this.isUndirected && this.endVertex == vertex;
    };

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

    /* ******************************* Helpers ********************************/
    /**
     * @param {Vertex} startVertex
     * @param {Vertex} endVertex
     * @returns {*} - the EaselJS GUI object for this Edge's line
     */
    function createGfxElementAt(startVertex, endVertex){
        var startCoords = startVertex.getCoordinatesOfCenter();
        var endCoords = endVertex.getCoordinatesOfCenter();
        var gfx = new createjs.Graphics();
        gfx.setStrokeStyle(3)
            .beginStroke("white")
            .moveTo(startCoords.x, startCoords.y)
            .lineTo(endCoords.x, endCoords.y);
        return new createjs.Shape(gfx);
    }

    return Edge;

});