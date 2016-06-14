define([
], function () {

    function Sample(title, path, graphType) {
        this.title = title;
        this.path = path;
        this.graphType = graphType;
    }

    Sample.listing = [
        new Sample('Template'      , '_Template.js'    , 'generic'),
        new Sample('Chandy-Lamport', 'ChandyLamport.js', 'generic'),
        new Sample('Chandy-Misra'  , 'ChandyMisra.js'  , 'generic'),
        new Sample('Chang-Roberts' , 'ChangRoberts.js' , 'directed'),
        new Sample("Cidon's"       , 'Cidon.js'        , 'generic'),
        new Sample('Echo'          , "EchoAlgorithm.js", 'generic'),
        new Sample("Franklin's"    , 'Franklin.js'     , 'ring'),
        new Sample("Tree"          , "TreeAlgorithm"   , 'acyclic')
    ];

    return Sample;
});