/*
 * @fileoverview This is just a template for creating new algorithms. You should look at sample algorithms to get a
 * better idea of what is possible.
 */

//noinspection JSUnresolvedFunction
randomizeTraversalTimes(); // optional
//noinspection JSUnresolvedFunction
addJitterToTraversalTimes(); // optional
//noinspection JSUnresolvedFunction
randomizeProcessTimes(); // optional

//noinspection JSUnresolvedFunction
onInitializationDo(
    /**
     * @param {Process} p - The process to be initialized. Note that this is different from being an initiator -- every
     *      process in the network will use this function to set a default state.
     */
    function (p) {
        // Your code
    }
);

//noinspection JSUnresolvedFunction
onInitiationDo(
    /**
     * When an initiator `p` decides to start the algorithm, the code provided here will be executed
     * @param {Process} p - The process initiating the algorithm. It can change its own state, but can only affect other
     *      processes by sending messages along whatever channels are available to it.
     */
    function (p) {
        // Your code
    }
);

//noinspection JSUnresolvedFunction
onReceivingMessageDo(
    /**
     * When a process `p` in the network receives a message through a channel `q`, the code provided here will be executed
     * @param {Process} p - The process receiving the message.
     * @param {*} message - This can be anything at all according to your algorithm's needs.
     * @param {String} q - The name of the channel through which the message was received. It represents the process
     *      p's connection to some other process.
     */
    function (p, message, q) {
        // Your code
    }
);