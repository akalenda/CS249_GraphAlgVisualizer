var i = 1;

console.log("" + i++ + ": eval'd");

onInitializationDo(function(p){
    console.log("" + i++ + ": initialize " + p);
});

onInitiationDo(function(p){
    console.log("" + i++ + ": initiate " + p);
    p.sendEachOutgoingChannel("bleagh!");
});


onReceivingMessageDo(function (p, message, channel) {
    console.log("" + i++ + ": " + p + " received: " + message);
});