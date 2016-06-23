// Global vars
var BASE_DATA_URL = 'data/data.json';
var simulator = null;
var pymChild = null;
var isMobile = false;

var interactive = true;
var adjustments = {
    'adjustments': {
        'white_man': {
            'pct': 0.0,
            'turnout': 0.0,
            'label': "White Men"
        },
        'white_woman': {
            'pct': 0.0,
            'turnout': 0.0,
            'label': "White Women"
        },
        'black': {
            'pct': 0.0,
            'turnout': 0.0,
            'label': "Black"
        },
        'hispanic': {
            'pct': 0.0,
            'turnout': 0.0,
            'label': "Hispanic"
        },
        'other': {
            'pct': 0.0,
            'turnout': 0.0,
            'label': "Other"
        }
    }
};


/*
 * Update simulator initialization properties based on url params
 */
var UpdateInitVars = function(urlParams) {

    // Adjustments
    var adj = adjustments.adjustments;
    adj.white_man.pct = urlParams.wmp || 0.0;
    adj.white_man.turnout = urlParams.wmt || 0.0;
    adj.white_woman.pct = urlParams.wwp || 0.0;
    adj.white_woman.turnout = urlParams.wwt || 0.0;
    adj.black.pct = urlParams.bp || 0.0;
    adj.black.turnout = urlParams.bt || 0.0;
    adj.hispanic.pct = urlParams.hp || 0.0;
    adj.hispanic.turnout = urlParams.ht || 0.0;
    adj.other.pct = urlParams.op || 0.0;
    adj.other.turnout = urlParams.ot || 0.0;

    // interactive
    interactive = urlParams.interactive || true;

}


/*
 * Initialize the graphic.
 */
var onWindowLoaded = function() {
    if (Modernizr.svg) {
        loadBaseData()
    } else {
        pymChild = new pym.Child({});

        pymChild.onMessage('on-screen', function(bucket) {
            ANALYTICS.trackEvent('on-screen', bucket);
        });
        pymChild.onMessage('scroll-depth', function(data) {
            data = JSON.parse(data);
            ANALYTICS.trackEvent('scroll-depth', data.percent, data.seconds);
        });
    }
}


/*
 * Load graphic data from a CSV.
 */
var loadBaseData = function() {
    d3.json(BASE_DATA_URL, function(error, data) {
        baseData = data.data;
        urlParams = urlparser.get();
        console.log(urlParams);
        UpdateInitVars(urlParams);
        console.log(adjustments);
        createSimulator(baseData);

        pymChild = new pym.Child({
            renderCallback: render
        });

        pymChild.onMessage('on-screen', function(bucket) {
            ANALYTICS.trackEvent('on-screen', bucket);
        });
        pymChild.onMessage('scroll-depth', function(data) {
            data = JSON.parse(data);
            ANALYTICS.trackEvent('scroll-depth', data.percent, data.seconds);
        });
    });
}

var createSimulator = function(data) {
    //Get the adjustments from the macro parameters
    simulator = new ElectionSimulator("#table-totals", "#table-details", "#table-controls", adjustments, interactive, data);
}

/*
 * Render the simulator.
 */
var render = function(containerWidth) {
    if (!containerWidth) {
        containerWidth = DEFAULT_WIDTH;
    }

    if (containerWidth <= MOBILE_THRESHOLD) {
        isMobile = true;
    } else {
        isMobile = false;
    }

    // Render the map!
    renderSimulator({
        container: '#graphic',
        width: containerWidth
    });

    // Update iframe
    if (pymChild) {
        pymChild.sendHeight();
    }
}

var renderSimulator = function(config) {
    simulator.render();
}

/*
 * Render a graphic.
 */
var renderGraphic = function(config) {
    var aspectWidth = 4;
    var aspectHeight = 3;

    var margins = {
        top: 0,
        right: 15,
        bottom: 20,
        left: 15
    };

    // Calculate actual chart dimensions
    var chartWidth = config['width'] - margins['left'] - margins['right'];
    var chartHeight = Math.ceil((config['width'] * aspectHeight) / aspectWidth) - margins['top'] - margins['bottom'];

    // Clear existing graphic (for redraw)
    var containerElement = d3.select(config['container']);
    containerElement.html('');

    // Create container
    var chartElement = containerElement.append('svg')
        .attr('width', chartWidth + margins['left'] + margins['right'])
        .attr('height', chartHeight + margins['top'] + margins['bottom'])
        .append('g')
        .attr('transform', 'translate(' + margins['left'] + ',' + margins['top'] + ')');

    // Draw here!
}

/*
 * Initially load the graphic
 * (NB: Use window.load to ensure all images have loaded)
 */
window.onload = onWindowLoaded;
