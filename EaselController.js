define([
    "Vertex",
    "ProtoEdge",
    "CodeEnclosure"
], function (Vertex, ProtoEdge, CodeEnclosure) {
    'use strict';

    var module = angular.module('GraphAlgVisualizer', []);

    angular.element(document).ready(function () {
        angular.bootstrap(document, ['GraphAlgVisualizer']);
    });

    /**
     * This controller handles interaction between the EaselJS stage/canvas and the internal classes. E.g. depending on
     * what the user clicks on, when and where, it will translate that into behavior with vertices, edges, etc.
     */
    module.controller('EaselController', function easelConstructor() {

        /* *************************** Initialize the controller w/ easel **************************************/
        var stage = new createjs.Stage("mainCanvas");
        Vertex.useStage(stage);
        setStageListeners();
        stage.update();
        var codeMirror = CodeMirror(document.body, {
            value       : '// Code goes here\n\n',
            mode        : 'javascript',
            theme       : "pastel-on-dark",
            smartIndent : true,
            lineNumbers : true
        });

        /* *********************************** Define modalities **************************************/
        var mode_placeVertices = {
            clickOnEmpty: createVertex,
            dragFromVertex: moveVertex
        };

        var mode_removeVertices = {
            clickOnVertex: removeVertex,
            dragFromVertex: moveVertex
        };

        var mode_drawEdges = {
            clickOnVertex: startDrawingEdge,
            dragFromVertex: continueDrawingEdge,
            releaseOnVertex: createEdge,
            releaseOnEmpty: cancelDrawingEdge
        };

        var mode_removeEdges = {
            clickOnVertex: startDrawingEdge,
            dragFromVertex: continueDrawingEdge,
            releaseOnVertex: removeEdge,
            releaseOnEmpty: cancelDrawingEdge
        };

        var mode_markInitiators = {
            clickOnVertex: markInitiator,
            dragFromVertex: moveVertex
        };

        var mode_unmarkInitiators = {
            clickOnVertex: unmarkInitiator,
            dragFromVertex: moveVertex
        };

        var currentMode = mode_placeVertices;

        this.enterMode_placeVertices    = function enterMode_placeVertices   () {currentMode = mode_placeVertices   ;};
        this.enterMode_removeVertices   = function enterMode_removeVertices  () {currentMode = mode_removeVertices  ;};
        this.enterMode_drawEdges        = function enterMode_drawEdges       () {currentMode = mode_drawEdges       ;};
        this.enterMode_removeEdges      = function enterMode_removeEdges     () {currentMode = mode_removeEdges     ;};
        this.enterMode_markInitiators   = function enterMode_markInitiators  () {currentMode = mode_markInitiators  ;};
        this.enterMode_unmarkInitiators = function enterMode_unmarkInitiators() {currentMode = mode_unmarkInitiators;};

        /* ********************************** Define functionalities ********************************************/

        this.resetStage = function resetStage() {
            stage.removeAllChildren();
            stage.clear();
            Vertex.list.reset();
        };

        /**
         * @param {number} xCoord
         * @param {number} yCoord
         */
        function createVertex(xCoord, yCoord) {
            new Vertex(xCoord, yCoord)
                .addListener(vertexListener);
        }

        /**
         * @param event
         * @param {Vertex} vertex
         */
        function moveVertex(event, vertex) {
            vertex.moveTo(event.stageX, event.stageY);
        }

        /**
         * @param ignored
         * @param {Vertex} vertex
         */
        function removeVertex(ignored, vertex) {
            vertex.remove();
        }

        var protoEdge;

        /**
         * @param ignored
         * @param {Vertex} vertex
         */
        function startDrawingEdge(ignored, vertex) {
            if (protoEdge)
                return;
            protoEdge = new ProtoEdge(vertex);
            return protoEdge;
        }

        /**
         * @param event
         * @param {Vertex} vertex
         */
        function continueDrawingEdge(event, vertex) {
            protoEdge = protoEdge || startDrawingEdge(event, vertex);
            protoEdge.drawTo(event.stageX, event.stageY);
        }

        /**
         * @param event
         * @param ignored
         */
        function createEdge(event, ignored) {
            var targetVertex = getTopmostVertexAt(event.stageX, event.stageY);
            if (targetVertex)
                protoEdge.completeAt(targetVertex);
            if (protoEdge)
                protoEdge.remove();
            protoEdge = null;
        }

        /**
         * @param event
         * @param ignored
         */
        function removeEdge(event, ignored) {
            var targetVertex = getTopmostVertexAt(event.stageX, event.stageY);
            if (targetVertex)
                protoEdge.completeRemovalAt(targetVertex);
            if (protoEdge)
                protoEdge.remove();
            protoEdge = null;
        }

        /**
         * @param ignored0
         * @param ignored1
         */
        function cancelDrawingEdge(ignored0, ignored1) {
            if (!protoEdge)
                return;
            protoEdge = protoEdge.remove();
        }

        /**
         * @param ignored
         * @param {Vertex} vertex
         */
        function markInitiator(ignored, vertex) {
            vertex.markAsInitiator();
        }

        /**
         * @param ignored
         * @param {Vertex} vertex
         */
        function unmarkInitiator(ignored, vertex) {
            vertex.unmarkAsInitiator();
        }

        /* *************************** Code mirror stuff *****************************************/
        /**
         * Resets the graph vertices and edges so that it is as though the algorithm had never been run
         */
        this.alg_reset = function alg_reset(){
            Vertex.list.forEach(function(vertex){
                vertex.sim_reset();
            });
            stage.update();
        };

        /**
         * Begins a simulation using whatever code has been given
         */
        this.alg_run = function alg_run(){
            Vertex.useCodeEnclosure(new CodeEnclosure(codeMirror.getValue()));
            Vertex.list.forEach(function(vertex){
                vertex.sim_initialize();
            });
            Vertex.list.getInitiators().forEach(function(vertex){
                vertex.sim_initiate();
            });
        };

        /* ********************************* Helpers ******************************************/

        /**
         * This sets up listeners for mouse events that occur on the canvas, but not on an object on that canvas.
         */
        function setStageListeners() {
            stage.on("stagemousedown", function (event) {
                if (stageIsEmptyAt(event.stageX, event.stageY) && currentMode.clickOnEmpty) {
                    currentMode.clickOnEmpty(event.stageX, event.stageY);
                    stage.update();
                }
            });
            stage.on("stagemouseup", function (event) {
                if (stageIsEmptyAt(event.stageX, event.stageY) && currentMode.releaseOnEmpty) {
                    currentMode.releaseOnEmpty(event.stageX, event.stageY);
                    stage.update();
                }
            });
        }

        /**
         * Listener passed to Vertex constructor. When EaselJS detects a mouse event on a Vertex's SVG shapes, this will be invoked. It invokes a function, which is selected based on the current mode and the type of mouse event.
         * @param event
         * @param {Vertex} vertex
         */
        function vertexListener(event, vertex) {
            var foo;
            switch (event.type) {
                case 'click'     : foo = currentMode.clickOnVertex  ; break;
                case 'pressmove' : foo = currentMode.dragFromVertex ; break;
                case 'pressup'   : foo = currentMode.releaseOnVertex; break;
                default          : console.warn("Warning: Unsupported mouse action '" + event.type + "' originating from vertex " + vertex.toString());
            }
            if (foo)
                foo(event, vertex);
            stage.update();
        }

        /**
         * @param {number} xCoord
         * @param {number} yCoord
         * @returns {boolean}
         */
        function stageIsEmptyAt(xCoord, yCoord) {
            return stage.getObjectsUnderPoint(xCoord, yCoord).length == 0;
        }

        /**
         * @param {number} xCoord
         * @param {number} yCoord
         * @returns {Vertex}
         */
        function getTopmostVertexAt(xCoord, yCoord) {
            var objs = stage.getObjectsUnderPoint(xCoord, yCoord);
            for (var i = objs.length - 1; i >= 0; i--)
                if (objs[i].owningVertex)
                    return objs[i].owningVertex;
        }
    });
});