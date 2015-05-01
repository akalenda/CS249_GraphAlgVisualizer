define([], function () {

    /**
     * Evaluates user-provided code within a protective enclosure. The functions herein will be visible to whatever
     * sourceCode is eval'd.
     * @param {string} sourceCode
     * @constructor
     */
    function CodeEnclosure(sourceCode) {

        var __ce__that = this;
        __ce__that.traversalTimeJitter = 0.0;

        //noinspection JSUnusedLocalSymbols
        /**
         * If used, then each edge will have a randomized length (e.g. time for messages to traverse the channel)
         */
        function randomizeTraversalTimes() {
            __ce__that.traversalTimesAreRandom = true;
        }

        //noinspection JSUnusedLocalSymbols
        /**
         * If used, then the actual time for a message to traverse an edge/channel will be slightly off from its
         * standard length. The number given should be between 0.0 and 1.0, e.g. if given 0.25, then a message's
         * traversal time can be anywhere from 75-125% of its standard time.
         * @param {number} percent
         */
        function addJitterToTraversalTimes(percent) {
            __ce__that.traversalTimesHaveJitter = ($.isNumeric(percent)) ? percent : 0.25;
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