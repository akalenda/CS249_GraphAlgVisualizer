define([
    'Vertex',
    'Edge'
], function(Vertex, Edge){

    /**
     * @param {Vertex} startVertex
     * @constructor
     */
    function ProtoEdge(startVertex){
        this._startVertex = startVertex;
        this._shape = createGfxElementAt(startVertex);
        Vertex._stage.addChildAt(this._shape, 0);
    }

    /**
     * Extends the SVG drawn line to the given coordinates
     * @param {number} xCoord
     * @param {number} yCoord
     */
    ProtoEdge.prototype.drawTo = function drawTo(xCoord, yCoord){
        this._shape.graphics.command.x = xCoord;
        this._shape.graphics.command.y = yCoord;
    };

    /**
     * Completes the ProtoEdge by transforming into a normal Edge with its end attached to the given Vertex
     * @param {Vertex} endVertex
     */
    ProtoEdge.prototype.completeAt = function completeAt(endVertex){
        if (this._startVertex == endVertex)
            return;
        new Edge(this._startVertex, endVertex);
        this.remove();
    };

    /**
     * Completes the ProtoEdge by removing the already-existing Edge ending at the given Vertex
     * @param {Vertex} endVertex
     */
    ProtoEdge.prototype.completeRemovalAt = function completeRemoveAt(endVertex){
        if (this._startVertex == endVertex)
            return;
        this._startVertex.removeEdgeTo(endVertex);
        this.remove();
    };

    /**
     * Removes/cancels/deletes this ProtoEdge
     */
    ProtoEdge.prototype.remove = function remove(){
        Vertex._stage.removeChild(this._shape);
        this._shape = null;
        this._startVertex = null;
    };

    /* ********************** Helpers ***************************/
    /**
     * @param {Vertex} startVertex
     * @returns {*} - the EaselJS GUI object for this ProtoEdge's line
     */
    function createGfxElementAt(startVertex){
        var coords = startVertex.getCoordinatesOfCenter();
        var gfx = new createjs.Graphics();
        gfx.setStrokeStyle(1.5)
            .beginStroke("white")
            .moveTo(coords.x, coords.y)
            .lineTo(coords.x, coords.y);
        return new createjs.Shape(gfx);
    }

    return ProtoEdge;

});