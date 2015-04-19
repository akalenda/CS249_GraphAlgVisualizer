define([
    'jquery'
], function ($) {

    /**
     * The radius of vertices as they appear on the canvas
     * @type {number}
     * @constant
     */
    var CIRCLE_RADIUS = 20;

    /**
     * @param {number} xCoord
     * @param {number} yCoord
     * @param {function} VertexListener
     * @constructor
     */
    function Vertex(xCoord, yCoord, VertexListener) {
        var that = this;
        this._text = null;

        /**
         * Outgoing edges, indexed by their destination vertices
         * @type {Object.<Vertex,Edge>}
         * @private
         */
        this._edges = {};

        Vertex.list.push(this);

        this._svgContainer = addGraphicalElements(this, xCoord, yCoord);
        this._svgContainer.on('click'    , passEventToListener);
        this._svgContainer.on('pressmove', passEventToListener);
        this._svgContainer.on('pressup'  , passEventToListener);

        /**
         * We place this reference here so that when EaselJS produces the container as a search result, we can trace it back to this Vertex.
         * @type {Vertex}
         */
        this._svgContainer.owningVertex = this;

        /**
         * TODO describe
         * @param event
         * @returns {*}
         */
        function passEventToListener(event){
            return VertexListener(event, that);
        }
    }

    /* ************************ GUI stuff *****************************************************/

    /**
     * This needs to be set before you can start creating Vertex's
     * @param stage - From EaselJS
     */
    Vertex.useStage = function useStage(stage){
        Vertex._stage = stage;
    };

    /**
     * Removes the vertex from the program. This includes both its graphical and algorithmic components, as well as any edges connected to it.
     */
    Vertex.prototype.remove = function remove(){
        if(!this._edges)
            return;
        var edgeList = this._edges;
        var that = this;
        this._edges = null;
        $.each(edgeList, function completelyRemove(ignored, edge){
            var otherVertex = (edge.startVertex == that) ? edge.endVertex : edge.startVertex;
            edge.remove();
            otherVertex.removeEdgeTo(that);
        });
        Vertex._stage.removeChild(this._svgContainer);
        Vertex.list = Vertex.list.filter(function(a){return a !== that;});
        Vertex.list.forEach(function(vertex){
            vertex._text.text = vertex.toString();
        });
    };

    /**
     * Shifts where on the EaselJS stage the SVG graphics for this vertex appear. It also updates all of the outgoing edges to track the movement.
     * TODO: The Vertex can also be the target of incoming directed edges, which will currently not be updated. This will need to be handled specially.
     * @param {number} xCoord
     * @param {number} yCoord
     */
    Vertex.prototype.moveTo = function moveTo(xCoord, yCoord){
        this._svgContainer.x = xCoord;
        this._svgContainer.y = yCoord;
        $.each(this._edges, function(ignored, edge){
            edge.updateGfxElements();
        });
    };

    /**
     * @returns {{x: {number}, y: {number}}}
     */
    Vertex.prototype.getCoordinatesOfCenter = function getCoordinatesOfCenter(){
        return {
            x : this._svgContainer.x,
            y : this._svgContainer.y
        };
    };

    /**
     * @returns {string}
     */
    Vertex.prototype.toString = function toString(){
        return 'p' + this.getID();
    };

    /* ************************ Graph-algorithmic stuff ***************************************/

    /**
     * The list of all active Vertex's
     * @type {Array<Vertex>}
     */
    Vertex.list = [];

    /**
     * @returns {number}
     */
    Vertex.prototype.getID = function getID(){
        return Vertex.list.indexOf(this);
    };

    /**
     * @param {Vertex} destinationVertex
     * @param {Edge} newEdge
     */
    Vertex.prototype.addEdge = function addEdge(destinationVertex, newEdge){
        this._edges[destinationVertex] = newEdge;
    };

    /**
     * @param otherVertex
     * @returns {Edge}
     */
    Vertex.prototype.getEdgeTo = function getEdgeTo(otherVertex){
        if (this._edges)
            return this._edges[otherVertex];
    };

    /**
     * @param {Vertex} otherVertex
     */
    Vertex.prototype.removeEdgeTo = function removeEdgeTo(otherVertex){
        var edgeToRemove = this.getEdgeTo(otherVertex);
        if (!edgeToRemove)
            return;
        delete this._edges[otherVertex];
        edgeToRemove.remove();
    };

    /**
     * @param {Vertex} otherVertex
     * @returns {boolean}
     */
    Vertex.prototype.hasEdgeTo = function hasEdgeTo(otherVertex){
        for (var i=0; i<this._edges.length; i++)
            if(this._edges[i].isOutgoingTo(otherVertex))
                return true;
        return false;
    };

    /* ********************************* Private Helpers *****************************************/
    /**
     * // TODO use cached shape
     * @param {Vertex} that
     * @returns {*} - An EaselJS object for the SVG filled circle
     */
    function createGfx_circle(that){
        var circle = new createjs.Shape();
        circle.graphics.beginFill("DeepSkyBlue").drawCircle(0, 0, CIRCLE_RADIUS);
        circle.owningVertex = that;
        return circle;
    }

    /**
     * @param {Vertex} that
     * @returns {*} - An EaselJS object for the SVG text
     */
    function createGfx_text(that){
        that._text = new createjs.Text(that.toString(), "bold " + CIRCLE_RADIUS + "px Arial");
        that._text.textAlign = "center";
        that._text.y = -(CIRCLE_RADIUS / 2);
        return that._text;
    }

    /**
     * @param {Vertex} that
     * @param {number} xCoord
     * @param {number} yCoord
     * @returns {*} - A single EaselJS object containing all of the SVG graphical elements of a Vertex, hooking into the eventListener back in the constructor... apologies for it being so roundabout :/
     */
    function createGfx_container(that, xCoord, yCoord){
        var circle = createGfx_circle(that);
        var text = createGfx_text(that);
        var container = new createjs.Container();
        container.x = xCoord;
        container.y = yCoord;
        container.addChild(circle, text);
        return container;
    }

    /**
     * @param {Vertex} that
     * @param {number} xCoord
     * @param {number} yCoord
     */
    function addGraphicalElements(that, xCoord, yCoord){
        var container = createGfx_container(that, xCoord, yCoord);
        Vertex._stage.addChild(container);
        return container;
    }

    return Vertex;
});