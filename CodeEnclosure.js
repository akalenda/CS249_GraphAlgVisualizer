define([
], function () {

    /**
     * Evaluates user-provided code within a protective enclosure.
     * @param {string} sourceCode
     * @constructor
     */
    function CodeEnclosure(sourceCode) {

        var __ce__that = this;

        /**
         * What to do with each Process when it first loads, e.g. setting initial values and so on
         * @param foo
         */
        function onInitializationDo(foo){
            __ce__that.initializer = foo;
        }

        /**
         * What to do when a Process initiates the algorithm
         * @param foo
         */
        function onInitiationDo(foo){
            __ce__that.initiator = foo;
        }

        /**
         * What to do when a Process receives a message through an incoming channel from another Process
         * @param foo
         */
        function onReceivingMessageDo(foo){
            __ce__that.msgReceiver = foo;
        }

        eval(sourceCode);
    }

    /* ************************************ Helpers ****************************************/

    return CodeEnclosure;
});