define([], function () {

    /**
     * Evaluates user-provided code within a protective enclosure. The functions herein will be visible to whatever
     * sourceCode is eval'd.
     * @param {string} sourceCode
     * @constructor
     */
    function CodeEnclosure(sourceCode) {

        var __ce__that = this;

        //noinspection JSUnusedLocalSymbols
        /**
         * If used, then messages will take a random amount of time to get from one Process to another
         */
        function randomizeTraversalTimes() {
            __ce__that.traversalTimesAreRandom = true;
        }

        //noinspection JSUnusedLocalSymbols
        /**
         * If used, then simulations of processes will take a random amount of time
         */
        function randomizeProcessTimes() {
            __ce__that.processTimesAreRandom = true;
        }

        //noinspection JSUnusedLocalSymbols
        /**
         * What to do with each Process when it first loads, e.g. setting initial values and so on
         * @param foo
         */
        function onInitializationDo(foo) {
            __ce__that.initializer = foo;
        }

        //noinspection JSUnusedLocalSymbols
        /**
         * What to do when a Process initiates the algorithm
         * @param foo
         */
        function onInitiationDo(foo) {
            __ce__that.initiator = foo;
        }

        //noinspection JSUnusedLocalSymbols
        /**
         * What to do when a Process receives a message through an incoming channel from another Process
         * @param foo
         */
        function onReceivingMessageDo(foo) {
            __ce__that.msgReceiver = foo;
        }

        eval(sourceCode);
    }

    /* ************************************ Helpers ****************************************/

    return CodeEnclosure;
});