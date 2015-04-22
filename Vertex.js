define([
    'jquery',
    "Process"
], function ($, Process) {

    var PROCESS_GRADIENT_COLORS = ['#8fdb85', '#8fdb85', '#bfffb7', '#c3baff', '#948ae2', '#948ae2'];
    var PROCESS_GRADIENT_COLORS_TERMINATE = ['#ff5c5c', '#febbbb', '#febbbb', '#febbbb', '#febbbb', '#ff5c5c'];
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
         */
        this.outgoingEdges = new Map();

        /**
         * Incoming edges, indexed by their source vertices
         * @type {Map.<Vertex,Edge>}
         */
        this.incomingEdges = new Map();

        Vertex.list.push(this);

        this._svgContainer = addGraphicalElements(this, xCoord, yCoord);
        this._svgContainer.on('click'    , passEventToListeners);
        this._svgContainer.on('pressmove', passEventToListeners);
        this._svgContainer.on('pressup'  , passEventToListeners);

        /**
         * We place this reference here so that when EaselJS produces the container as a search result,
         * we can trace it back to this Vertex.
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
     * Removes the vertex from the program. This includes both its graphical and algorithmic components,
     * as well as any edges connected to it.
     */
    Vertex.prototype.remove = function remove(){
        if(!this.outgoingEdges)
            return;
        var edgeMap = this.outgoingEdges;
        var that = this;
        this.outgoingEdges = null;
        edgeMap.forEach(function completelyRemove(edge, ignoredVertex){
            edge.remove();
        });
        Vertex._stage.removeChild(this._svgContainer);
        resetVertexList(Vertex.list.filter(function(a){return a !== that;}));
        Vertex.list.forEach(function(vertex){
            vertex._text.text = vertex.toString();
        });
    };

    /**
     * Shifts where on the EaselJS stage the SVG graphics for this vertex appear. It also updates all of the
     * outgoing edges to track the movement.
     * TODO: The Vertex can also be the target of incoming directed edges, which will currently not be updated. This will need to be handled specially.
     * @param {number} xCoord
     * @param {number} yCoord
     */
    Vertex.prototype.moveTo = function moveTo(xCoord, yCoord){
        this._svgContainer.x = xCoord;
        this._svgContainer.y = yCoord;
        this.outgoingEdges.forEach(function(edge, ignoredVertex){
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
     * @param {Array<Vertex>} [newList]
     */
    function resetVertexList(newList){
        /**
         * The list of all active Vertex's
         * @type {Array<Vertex>}
         */
        Vertex.list = newList || [];

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
    Vertex.prototype.addOutgoingEdge = function addOutgoingEdge(destinationVertex, newEdge) {
        this.outgoingEdges.set(destinationVertex, newEdge);
    };

    Vertex.prototype.addIncomingEdge = function addIncomingEdge(sourceVertex, newEdge) {
        this.incomingEdges.set(sourceVertex, newEdge);
    };

    /**
     * @param otherVertex
     * @returns {Edge}
     */
    Vertex.prototype.getOutgoingEdgeTo = function getEdgeTo(otherVertex) {
        if (this.outgoingEdges)
            return this.outgoingEdges.get(otherVertex);
    };

    Vertex.prototype.getOutgoingEdgeByString = function getOutgoingEdgeByString(edgeString) {
        var iter = this.outgoingEdges.values();
        var next = iter.next();
        while (!next.done) {
            var edge = next.value;
            if (edge.toString() == edgeString)
                return edge;
            next = iter.next();
        }
        throw new Error("No edge '" + edgeString + "' outgoing from " + this.toString());
    };

    Vertex.prototype.getIncomingEdgeFrom = function getIncomingEdgeFrom(otherVertex) {
        if (this.incomingEdges)
            return this.incomingEdges.get(otherVertex);
    };

    /**
     * @param {Vertex} otherVertex
     */
    Vertex.prototype.removeOutgoingEdgeTo = function removeOutgoingEdgeTo(otherVertex) {
        var edgeToRemove = this.getOutgoingEdgeTo(otherVertex);
        if (!edgeToRemove)
            return;
        this.outgoingEdges.delete(otherVertex);
        edgeToRemove.remove();
    };

    Vertex.prototype.removeIncomingEdgeFrom = function removeIncomingEdgeFrom(otherVertex) {
        var edgeToRemove = this.getIncomingEdgeFrom(otherVertex);
        if (!edgeToRemove)
            return;
        this.incomingEdges.delete(otherVertex);
        edgeToRemove.remove();
    };

    /* ********************************** Simulation ********************************************/
    Vertex.prototype.sim_reset = function sim_reset() {
        if (this._process)
            this._process = null;
        if (this._sim_listener)
            createjs.Ticker.removeEventListener('tick', this._sim_listener);
        updateShapeGradient(this._svgContainer.getChildByName("circle"), 0);
        this.outgoingEdges.forEach(function (edge, ignoredVertex) {
            edge.sim_reset();
        });
        this.incomingEdges.forEach(function (edge, ignoredVertex) {
            edge.sim_reset();
        });
    };

    Vertex.prototype.sim_initialize = function sim_initialize() {
        this._process = new Process(this);
        if (Vertex._codeEnclosure.initializer)
            Vertex._codeEnclosure.initializer(this._process);
    };

    Vertex.prototype.sim_initiate = function sim_initiate() {
        if (Vertex._codeEnclosure.initiator)
            Vertex._codeEnclosure.initiator(this._process);
    };

    Vertex.prototype.sim_receiveMessageFrom = function sim_receiveMessageFrom(edge, message) {
        if (Vertex._codeEnclosure.msgReceiver)
            Vertex._codeEnclosure.msgReceiver(this._process, message, edge.toString());
    };

    Vertex.prototype.sim_terminate = function sim_terminate() {
        if (this._sim_listener)
            createjs.Ticker.removeEventListener('tick', this._sim_listener);
        updateShapeGradient(this._svgContainer.getChildByName("circle"), -1);
        Vertex._stage.update();
    };

    Vertex.prototype.simulateBlockingProcess = function simulateBlockingProcess() {
        // TODO
    };

    Vertex.prototype.simulateNonblockingProcess = function simulateNonblockingProcess() {
        var that = this;
        var percentDone = 0;
        var delta = (Vertex._codeEnclosure.processTimesAreRandom) ? Math.random() * (0.1 - 0.01) + 0.01 : 0.03;
        this._sim_listener = function updateSvgFillOnTick(event) {
            if (!event.paused) {
                percentDone = Math.min(1, percentDone + delta);
                updateShapeGradient(that._svgContainer.getChildByName("circle"), percentDone);
                updateStage();
                if (percentDone == 1)
                    createjs.Ticker.removeEventListener('tick', that._sim_listener);
            }
        };
        createjs.Ticker.addEventListener('tick', this._sim_listener);
    };

    /* ********************************* Private Helpers *****************************************/

    /**
     * Causes the EaselJS stage to update, redrawing everything as needed. Try to avoid using it. It's often already
     * being done further up the call stack anyway, which is better as that is more likely to capture multiple stage
     * updates (this is a relatively expensive operation) and better fits the natural hierarchy of the program.
     * TODO: It would be better if the functions that use Ticker would prompt EaselController to have its own Ticker
     * that updates the Stage once per tick, rather than each animation prompting a stage update each tick. That being
     * said, I don't expect this to have much if any performance impact.
     */
    function updateStage() {
        Vertex._stage.update();
    }

    function updateShapeGradient(shape, percentComplete) {
        var colors = (percentComplete < 0) ? PROCESS_GRADIENT_COLORS_TERMINATE : PROCESS_GRADIENT_COLORS;
        percentComplete = (percentComplete < 0) ? 0.5 : percentComplete;
        var ratios = [
            0,
            Math.max(0.0, percentComplete / 2),
            Math.max(0.0, percentComplete - 0.001),
            Math.min(1.0, percentComplete + 0.001),
            Math.min(1.0, (percentComplete + 1.0) / 2),
            1
        ];
        shape.graphics.beginLinearGradientFill(colors, ratios, 0, CIRCLE_RADIUS, 0, -CIRCLE_RADIUS);
        shape.graphics.drawCircle(0, 0, CIRCLE_RADIUS); // TODO this line shouldnt be necessary, file a GitHub issue
    }
    
    /**
     * // TODO use cached shape
     * @param {Vertex} that
     * @returns {*} - An EaselJS object for the SVG filled circle
     */
    function createGfx_circle(that){
        var circle = new createjs.Shape();
        updateShapeGradient(circle, 0);
        circle.graphics.drawCircle(0, 0, CIRCLE_RADIUS);
        circle.name = "circle";
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
        star.graphics
            .beginFill("Aquamarine")
            .drawPolyStar(xCoord, yCoord, coreRadius, numPoints, pointLength, rotationAngle);
        star.owningVertex = that;
        return star;
    }

    /**
     * @param {Vertex} that
     * @param {number} xCoord
     * @param {number} yCoord
     * @returns {*} - A single EaselJS object containing all of the SVG graphical elements of a Vertex, hooking into the
     * eventListener back in the constructor... apologies for it being so roundabout :/
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