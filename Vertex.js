define([
    'jquery',
    "Process"
], function ($, Process) {

    /**
     * The radius of vertices as they appear on the canvas
     * @type {number}
     * @constant
     */
    var CIRCLE_RADIUS = 20;

    /**
     * @param {number} xCoord
     * @param {number} yCoord
     * @constructor
     */
    function Vertex(xCoord, yCoord) {
        var that = this;
        this._text = null;
        this._svgStar = null;
        this._svgContainer = null;
        this._listeners = [];

        /**
         * Outgoing edges, indexed by their destination vertices
         * @type {Map.<Vertex,Edge>}
         * @private
         */
        this.outgoingEdges = new Map();

        Vertex.list.push(this);

        this._svgContainer = addGraphicalElements(this, xCoord, yCoord);
        this._svgContainer.on('click'    , passEventToListeners);
        this._svgContainer.on('pressmove', passEventToListeners);
        this._svgContainer.on('pressup'  , passEventToListeners);

        /**
         * We place this reference here so that when EaselJS produces the container as a search result, we can trace it back to this Vertex.
         * @type {Vertex}
         */
        this._svgContainer.owningVertex = this;

        /**
         * @callback Vertex~passEventToListeners
         * @param event
         */
        function passEventToListeners(event){
            that._listeners.forEach(function(listener){
                listener(event, that);
            });
        }
    }

    /* ************************ GUI stuff *****************************************************/

    /**
     * This needs to be set before you can start creating vertices
     * @param stage - From EaselJS
     */
    Vertex.useStage = function useStage(stage){
        Vertex._stage = stage;
    };

    /**
     * @param {CodeEnclosure} codeEnclosure
     */
    Vertex.useCodeEnclosure = function useCodeEnclosure(codeEnclosure) {
        Vertex._codeEnclosure = codeEnclosure;
    };

    /**
     * Add a listener that will be invoked when this Vertex receives a mouse event, e.g. it is clicked on, dragged, etc
     * @param {Vertex~passEventToListeners} foo
     */
    Vertex.prototype.addListener = function addListener(foo){
        if(!$.isFunction(foo))
            throw new Error("addListener was not given a function, instead received the following: " + foo);
        this._listeners.push(foo);
    };

    /**
     * Add this as a graph algorithm initiator
     */
    Vertex.prototype.markAsInitiator = function markAsInitiator(){
        this._svgStar = createGfx_star(this);
        this._svgContainer.addChild(this._svgStar);
    };

    /**
     * Remove this as a graph algorithm initiator
     */
    Vertex.prototype.unmarkAsInitiator = function unmarkAsInitiator(){
        this._svgContainer.removeChild(this._svgStar);
        this._svgStar = null;
    };

    /**
     * @returns {boolean} - True if this vertex has been marked as an initiator, false otherwise
     */
    Vertex.prototype.isInitiator = function isInitiator(){
        return !!this._svgStar;
    };

    /**
     * Removes the vertex from the program. This includes both its graphical and algorithmic components, as well as any edges connected to it.
     */
    Vertex.prototype.remove = function remove(){
        if(!this.outgoingEdges)
            return;
        var edgeMap = this.outgoingEdges;
        var that = this;
        this.outgoingEdges = null;
        edgeMap.forEach(function completelyRemove(ignored, edge){
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
        this.outgoingEdges.forEach(function(ignored, edge){
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

    resetVertexList();

    /**
     * Initializes/resets Vertex.list
     */
    function resetVertexList(){
        /**
         * The list of all active Vertex's
         * @type {Array<Vertex>}
         */
        Vertex.list = [];

        /**
         * Returns the list of Vertices that are marked as graph algorithm initiators
         * @returns {Array.<Vertex>}
         */
        Vertex.list.getInitiators = function getInitiators(){
            return Vertex.list.filter(function(vertex){
                return vertex.isInitiator();
            });
        };
    }

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
        this.outgoingEdges.set(destinationVertex, newEdge);
    };

    /**
     * @param otherVertex
     * @returns {Edge}
     */
    Vertex.prototype.getEdgeTo = function getEdgeTo(otherVertex){
        if (this.outgoingEdges)
            return this.outgoingEdges.get(otherVertex);
    };

    /**
     * @param {Vertex} otherVertex
     */
    Vertex.prototype.removeEdgeTo = function removeEdgeTo(otherVertex){
        var edgeToRemove = this.getEdgeTo(otherVertex);
        if (!edgeToRemove)
            return;
        this.outgoingEdges.delete(otherVertex);
        edgeToRemove.remove();
    };

    /* ********************************** Simulation ********************************************/
    Vertex.prototype.sim_initialize = function sim_initialize() {
        this._process = new Process(this);
        Vertex._codeEnclosure.initializer(this._process);
    };

    Vertex.prototype.sim_initiate = function sim_initiate() {
        Vertex._codeEnclosure.initiator(this._process);
    };

    Vertex.prototype.sim_receiveMessageFrom = function sim_receiveMessageFrom(sourceVertex, message) {
        Vertex._codeEnclosure.msgReceiver(this._process, message, sourceVertex.toString());
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
     * @param {number} [xCoord]
     * @param {number} [yCoord]
     * @param {Vertex} that
     */
    function createGfx_star(that, xCoord, yCoord){
        xCoord = xCoord || -CIRCLE_RADIUS * 0.8;
        yCoord = yCoord || -CIRCLE_RADIUS * 0.8;
        var star = new createjs.Shape();
        var coreRadius = CIRCLE_RADIUS / 2;
        var numPoints = 5;
        var pointLength = CIRCLE_RADIUS / 8;
        var rotationAngle = 0;
        star.graphics.beginFill("Aquamarine").drawPolyStar(xCoord, yCoord, coreRadius, numPoints, pointLength, rotationAngle);
        star.owningVertex = that;
        return star;
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