define([
    "Vertex",
    "ProtoEdge",
    "CodeEnclosure",
    'jquery',
    "bootstrap",
    "Sample",
    "Edge"
], function (Vertex, ProtoEdge, CodeEnclosure, $, bootstrap, Sample, Edge) {
    'use strict';

    var module = angular.module('GraphAlgVisualizer', ['ngAnimate', 'ui.bootstrap']);

    angular.element(document).ready(function () {
        angular.bootstrap(document, ['GraphAlgVisualizer']);
    });

    /**
     * This controller handles interaction between the EaselJS stage/canvas and the internal classes. E.g. depending on
     * what the user clicks on, when and where, it will translate that into behavior with vertices, edges, etc.
     */
    module.controller('EaselController', function easelConstructor() {

        var that = this;

        /**
         * We only ever need one: The one that the user is currently drawing, or none at all.
         * @type {ProtoEdge}
         */
        var protoEdge;

        /* *************************** AngularJS values **********************************************/
        this.samples = Sample.listing;
        this.exportText = "error";
        this.importText = "";

        /* *************************** Initialize EaselJS and CodeMirror **************************************/
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

        /* *********************************** Define modality **************************************/
        /* These modes decide what happens when the user clicks or drags on the easel.
            Various buttons at the top of the app allow the user to switch between modes.
         */
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

        /* ******************** Graph button functions *******************************************/
        /* These are the buttons that, rather than activating different modes for the canvas, have an immediate effect.
            Some are called by other functions as well, it's not 1-to-1 with the user's button clicks.
         */

        /**
         * Reverts the graph to its initial blank state, with neither vertices nor edges.
         */
        this.resetStage = function resetStage() {
            stage.removeAllChildren();
            stage.clear();
            Vertex.list.reset();
        };

        /**
         * Imports a prefabricated graph; used in the Load Samples menu.
         *
         * @param {string} graphType - Must correspond to one of the keys in `Sample.graphs`'s key-value pairs
         */
        this.graph_generate = function graph_generate(graphType){
            this.graph_import(Sample.graphs[graphType]);
        };

        /**
         * Takes a stringification, as produced by {@link updateExportText}, and produces a working graph. If none is
         * provided as the argument, it will retrieve any text provided by the user in the Import popover.
         *
         * @param {string} [stringification]
         */
        this.graph_import = function graph_import(stringification){
            stringification = stringification || this.importText;
            var imported = JSON.parse(stringification);
            this.resetStage();
            imported.v.forEach(function(vertex){
                createVertex(vertex.x, vertex.y);
            });
            imported.e.forEach(function(edge){
                var startingVertex = Vertex.list.find(function(vertex){
                    return vertex.getID() == edge.s;
                });
                var endingVertex = Vertex.list.find(function(vertex){
                    return vertex.getID() == edge.e;
                });
                new Edge(startingVertex, endingVertex);
            });
            imported.i.forEach(function(vertexID){
                Vertex.list.find(function(vertex){
                    return vertex.getID() == vertexID;
                }).markAsInitiator();
            });
            stage.update();
        };

        /**
         * Revises the text found in the Export popover window to reflect the graph currently on screen. This can
         * later be used with the Import function to reproduce the graph.
         */
        this.updateExportText = function updateExportText(){
            var exported = {
                v: [],
                e: [],
                i: []
            };
            Vertex.list.forEach(function exportV(vertex){
                exported.v.push(vertex.export());
                if (vertex.isInitiator())
                    exported.i.push(vertex.getID());
                vertex.outgoingEdges.forEach(function exportE(edge){
                    exported.e.push(edge.export());
                });
            });
            that.exportText = JSON.stringify(exported);
        };

        /* *************************** Algorithm button functions *****************************************/
        /* These also correspond to specific buttons the user may click, but are related to whatever algorithm the
            user has entered, or imported, into CodeMirror.
         */
        /**
         * Invoked when the user clicks a Code button in the Load Samples menu. Retrieves a JavaScript file from the
         * server and loads it into CodeMirror.
         *
         * @param {String} path - Path to a *.js file
         */
        this.alg_load = function alg_load(path){
            $.ajax({
                url: "samples/" + path,
                success: function(response){
                    codeMirror.setValue(response);
                },
                error: function(response){
                    if (response.responseText)
                        codeMirror.setValue(response.responseText);
                }
            });
        };

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

        /* ****************************** Internal functions for drawing the graph ********************* */
        /* When the user clicks on the canvas, one of these functions is eventually invoked. The listener for that
            click is is set in `setStageListeners()`, while the function that actually gets called is determined by
            `currentMode`.
         */

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