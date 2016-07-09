define([
    'Vertex',
    'Edge'
], function(Vertex, Edge){

    /**
     * As the name implies, this is the precursor to an actual {@link Edge}.
     *
     * The reason for this is that while the user is drawing an Edge, it does not actually exist. Therefore we want to
     * make the act of drawing it a separate concern. A drawn edge may lead nowhere, or may form a duplicate edge;
     * in either case we simply discard the ProtoEdge. If the drawn edge is valid, then the ProtoEdge completes, an
     * Edge is created, and the ProtoEdge is discarded.
     *
     * Furthermore, a ProtoEdge may be used for other things. For example, in Remove Edges mode, a ProtoEdge, when
     * completed, removes any edges from the starting to ending vertex.
     *
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
        this._startVertex.removeOutgoingEdgeTo(endVertex);
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